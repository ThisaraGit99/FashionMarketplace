import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertProductSchema, insertReviewSchema, insertOrderSchema, insertOrderItemSchema, insertCartItemSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

// Type for session user
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

// JWT could be used for authentication in a real implementation

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  const MemoryStoreSession = MemoryStore(session);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fashion-hub-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session.userId) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Middleware to check if user is admin
  const isAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.session.userId);
    
    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Forbidden - Admin access required" });
    }
  };

  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if email is already taken
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Check if username is already taken
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // In a real app, password would be hashed here
      const user = await storage.createUser(userData);
      
      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      
      req.session.userId = user.id;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) { // In real app would use proper password comparison
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      
      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        req.session.destroy(() => {});
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Routes
  app.put("/api/users/profile", isAuthenticated, async (req, res) => {
    try {
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Don't allow changing username or email to existing ones
      if (userData.username) {
        const existingUser = await storage.getUserByUsername(userData.username);
        if (existingUser && existingUser.id !== req.session.userId) {
          return res.status(400).json({ message: "Username already taken" });
        }
      }
      
      if (userData.email) {
        const existingUser = await storage.getUserByEmail(userData.email);
        if (existingUser && existingUser.id !== req.session.userId) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }
      
      const updatedUser = await storage.updateUser(req.session.userId!, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  // Admin User Routes
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Product Routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, subCategory, featured, newItems, search } = req.query;
      
      let products;
      
      if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else if (subCategory) {
        products = await storage.getProductsBySubCategory(subCategory as string);
      } else if (featured === 'true') {
        products = await storage.getFeaturedProducts();
      } else if (newItems === 'true') {
        products = await storage.getNewProducts();
      } else if (search) {
        products = await storage.searchProducts(search as string);
      } else {
        products = await storage.getAllProducts();
      }
      
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin Product Routes
  app.post("/api/admin/products", isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  app.put("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const productData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(id, productData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(200).json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  app.delete("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Review Routes
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const reviews = await storage.getReviewsByProduct(productId);
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/products/:id/reviews", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        productId,
        userId: req.session.userId
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Cart Routes
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const cartItems = await storage.getUserCart(req.session.userId!);
      
      // Get product details for each cart item
      const cartItemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.status(200).json(cartItemsWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      // Check if product exists
      const product = await storage.getProduct(cartItemData.productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const cartItem = await storage.addToCart(cartItemData);
      
      // Include product details in response
      const cartItemWithProduct = {
        ...cartItem,
        product
      };
      
      res.status(201).json(cartItemWithProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const updatedCartItem = await storage.updateCartItem(id, quantity);
      
      if (!updatedCartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Get product details
      const product = await storage.getProduct(updatedCartItem.productId);
      
      const cartItemWithProduct = {
        ...updatedCartItem,
        product
      };
      
      res.status(200).json(cartItemWithProduct);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.removeCartItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      await storage.clearCart(req.session.userId!);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Order Routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.session.userId!);
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          
          // Get product details for each item
          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const product = await storage.getProduct(item.productId);
              return {
                ...item,
                product
              };
            })
          );
          
          return {
            ...order,
            items: itemsWithProducts
          };
        })
      );
      
      res.status(200).json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the order belongs to the user or user is admin
      const user = await storage.getUser(req.session.userId!);
      
      if (order.userId !== req.session.userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const items = await storage.getOrderItems(order.id);
      
      // Get product details for each item
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      const orderWithItems = {
        ...order,
        items: itemsWithProducts
      };
      
      res.status(200).json(orderWithItems);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      // Get cart items
      const cartItems = await storage.getUserCart(req.session.userId!);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      let total = 0;
      
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        }
        
        // Use sale price if available, otherwise use regular price
        const price = product.salePrice || product.price;
        total += price * item.quantity;
      }
      
      // Create order
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId: req.session.userId,
        total
      });
      
      const order = await storage.createOrder(orderData);
      
      // Create order items
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (!product) continue;
        
        const price = product.salePrice || product.price;
        
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price,
          size: item.size,
          color: item.color
        });
      }
      
      // Clear cart
      await storage.clearCart(req.session.userId!);
      
      // Get order items
      const orderItems = await storage.getOrderItems(order.id);
      
      // Get product details for each item
      const itemsWithProducts = await Promise.all(
        orderItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      const orderWithItems = {
        ...order,
        items: itemsWithProducts
      };
      
      res.status(201).json(orderWithItems);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Admin Order Routes
  app.get("/api/admin/orders", isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          
          // Get product details for each item
          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const product = await storage.getProduct(item.productId);
              return {
                ...item,
                product
              };
            })
          );
          
          // Get user details (without password)
          const user = await storage.getUser(order.userId);
          const userWithoutPassword = user ? (({ password, ...rest }) => rest)(user) : null;
          
          return {
            ...order,
            items: itemsWithProducts,
            user: userWithoutPassword
          };
        })
      );
      
      res.status(200).json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/admin/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Validate status
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
