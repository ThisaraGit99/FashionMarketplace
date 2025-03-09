import {
  users, User, InsertUser,
  products, Product, InsertProduct,
  reviews, Review, InsertReview,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  cartItems, CartItem, InsertCartItem
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsBySubCategory(subCategory: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getNewProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Review methods
  getReviewsByProduct(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  deleteReview(id: number): Promise<boolean>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  
  // Order Items methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Cart methods
  getUserCart(userId: number): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private reviews: Map<number, Review>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private cartItems: Map<number, CartItem>;
  
  private currentUserId: number;
  private currentProductId: number;
  private currentReviewId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentCartItemId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.reviews = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentReviewId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentCartItemId = 1;
    
    this.initializeSampleData();
  }

  // Initialize some sample data
  private initializeSampleData() {
    // Create admin user
    this.createUser({
      username: "admin",
      password: "password123", // In real app, this would be hashed
      email: "admin@fashionhub.com",
      firstName: "Admin",
      lastName: "User",
      isAdmin: true
    });
    
    // Create normal user
    this.createUser({
      username: "user",
      password: "password123", // In real app, this would be hashed
      email: "user@example.com",
      firstName: "Regular",
      lastName: "User",
      isAdmin: false
    });
    
    // Create sample products
    const categories = ['womens', 'mens', 'shoes', 'accessories'];
    const subCategoriesMap = {
      womens: ['dresses', 'tops', 'jeans', 'shoes', 'accessories'],
      mens: ['shirts', 't-shirts', 'jeans', 'shoes', 'accessories'],
      shoes: ['sneakers', 'boots', 'sandals', 'heels'],
      accessories: ['bags', 'jewelry', 'scarves', 'hats']
    };
    
    const products = [
      // Women's Clothing
      {
        name: "Casual Summer Dress",
        description: "A versatile and comfortable summer dress perfect for any casual occasion. Made with lightweight, breathable fabric.",
        price: 49.99,
        category: "womens",
        subCategory: "dresses",
        imageUrls: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Blue", "Red", "Green", "Yellow"],
        material: "100% Cotton",
        isNew: true,
        isFeatured: true
      },
      {
        name: "Floral Maxi Dress",
        description: "Elegant floral print maxi dress with adjustable straps. Perfect for spring and summer events.",
        price: 79.99,
        category: "womens",
        subCategory: "dresses",
        imageUrls: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Blue", "Pink", "White"],
        material: "Polyester Blend",
        isNew: true,
        isFeatured: false
      },
      {
        name: "Silk Blouse",
        description: "Elegant silk blouse with a relaxed fit. Versatile for both professional and casual settings.",
        price: 59.99,
        category: "womens",
        subCategory: "tops",
        imageUrls: ["https://images.unsplash.com/photo-1594223274512-ad4803739b7c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["S", "M", "L"],
        colors: ["White", "Black", "Navy"],
        material: "100% Silk",
        isNew: true,
        isFeatured: false
      },
      {
        name: "Striped Cotton Top",
        description: "Casual striped cotton top with short sleeves. Great for everyday wear with a comfortable fit.",
        price: 34.99,
        salePrice: 29.99,
        category: "womens",
        subCategory: "tops",
        imageUrls: ["https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Blue/White", "Black/White", "Red/White"],
        material: "100% Cotton",
        isNew: false,
        isFeatured: false
      },
      {
        name: "High-Waisted Skinny Jeans",
        description: "Flattering high-waisted skinny jeans with a bit of stretch for comfort. A wardrobe essential.",
        price: 69.99,
        category: "womens",
        subCategory: "jeans",
        imageUrls: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["24", "25", "26", "27", "28", "29", "30", "31", "32"],
        colors: ["Dark Blue", "Black", "Light Blue"],
        material: "98% Cotton, 2% Elastane",
        isNew: false,
        isFeatured: true
      },
      
      // Men's Clothing
      {
        name: "Classic Denim Jacket",
        description: "A timeless denim jacket that completes any outfit. Perfect for layering in any season.",
        price: 89.99,
        category: "mens",
        subCategory: "shirts",
        imageUrls: ["https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Blue", "Black"],
        material: "Denim",
        isNew: false,
        isFeatured: true
      },
      {
        name: "Oxford Button-Down Shirt",
        description: "Classic oxford button-down shirt made with premium cotton. A versatile addition to any wardrobe.",
        price: 59.99,
        category: "mens",
        subCategory: "shirts",
        imageUrls: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White", "Blue", "Pink", "Gray"],
        material: "100% Cotton",
        isNew: false,
        isFeatured: false
      },
      {
        name: "Graphic Print T-Shirt",
        description: "Comfortable cotton t-shirt featuring a unique graphic design. Perfect for casual everyday wear.",
        price: 29.99,
        category: "mens",
        subCategory: "t-shirts",
        imageUrls: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White", "Black", "Gray"],
        material: "100% Cotton",
        isNew: true,
        isFeatured: false
      },
      {
        name: "Premium Cotton T-Shirt",
        description: "Essential crew neck t-shirt made from premium cotton for everyday comfort and style.",
        price: 24.99,
        salePrice: 19.99,
        category: "mens",
        subCategory: "t-shirts",
        imageUrls: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White", "Black", "Navy", "Gray", "Green"],
        material: "100% Organic Cotton",
        isNew: false,
        isFeatured: false
      },
      {
        name: "Slim Fit Chino Pants",
        description: "Versatile slim fit chino pants that transition effortlessly from work to weekend.",
        price: 59.99,
        category: "mens",
        subCategory: "jeans",
        imageUrls: ["https://images.unsplash.com/photo-1517445312882-bc9910d042b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["28", "30", "32", "34", "36", "38"],
        colors: ["Khaki", "Navy", "Black", "Olive"],
        material: "98% Cotton, 2% Elastane",
        isNew: false,
        isFeatured: false
      },
      {
        name: "Classic Straight Jeans",
        description: "Timeless straight-leg jeans with a comfortable regular fit. Made from high-quality denim.",
        price: 69.99,
        category: "mens",
        subCategory: "jeans",
        imageUrls: ["https://images.unsplash.com/photo-1555689502-c4b22d76c56f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["28", "30", "32", "34", "36", "38", "40"],
        colors: ["Dark Blue", "Medium Blue", "Black"],
        material: "100% Cotton Denim",
        isNew: false,
        isFeatured: true
      },
      
      // Shoes
      {
        name: "Leather Ankle Boots",
        description: "Stylish and comfortable ankle boots made with genuine leather. Perfect for any occasion.",
        price: 129.99,
        salePrice: 99.99,
        category: "shoes",
        subCategory: "boots",
        imageUrls: ["https://images.unsplash.com/photo-1527719327859-c6ce80353573?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["36", "37", "38", "39", "40", "41"],
        colors: ["Black", "Brown"],
        material: "Leather",
        isNew: false,
        isFeatured: true
      },
      {
        name: "Canvas Sneakers",
        description: "Classic canvas sneakers with rubber soles. Lightweight and comfortable for everyday wear.",
        price: 49.99,
        category: "shoes",
        subCategory: "sneakers",
        imageUrls: ["https://images.unsplash.com/photo-1603808033192-082d6919d3e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
        colors: ["White", "Black", "Navy", "Red"],
        material: "Canvas and Rubber",
        isNew: true,
        isFeatured: false
      },
      {
        name: "Athletic Running Shoes",
        description: "Performance running shoes with responsive cushioning and breathable mesh upper.",
        price: 89.99,
        category: "shoes",
        subCategory: "sneakers",
        imageUrls: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
        colors: ["Black/White", "Blue/Gray", "All Black"],
        material: "Synthetic and Mesh",
        isNew: true,
        isFeatured: true
      },
      {
        name: "Strappy Heeled Sandals",
        description: "Elegant strappy sandals with a comfortable mid-heel. Perfect for dressing up any outfit.",
        price: 79.99,
        salePrice: 59.99,
        category: "shoes",
        subCategory: "sandals",
        imageUrls: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        sizes: ["35", "36", "37", "38", "39", "40", "41"],
        colors: ["Black", "Nude", "Silver", "Gold"],
        material: "Synthetic Leather",
        isNew: false,
        isFeatured: false
      },
      
      // Accessories
      {
        name: "Cashmere Scarf",
        description: "Luxurious cashmere scarf to keep you warm and stylish during colder months.",
        price: 39.99,
        category: "accessories",
        subCategory: "scarves",
        imageUrls: ["https://images.unsplash.com/photo-1509946458702-4378df1e2560?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        colors: ["Gray", "Navy", "Burgundy"],
        material: "Cashmere",
        isNew: false,
        isFeatured: true
      },
      {
        name: "Leather Tote Bag",
        description: "Spacious leather tote bag with internal pockets. Perfect for work, travel, or everyday use.",
        price: 119.99,
        category: "accessories",
        subCategory: "bags",
        imageUrls: ["https://images.unsplash.com/photo-1548863227-3af567fc3b27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        colors: ["Black", "Brown", "Tan"],
        material: "Genuine Leather",
        isNew: true,
        isFeatured: true
      },
      {
        name: "Minimalist Watch",
        description: "Elegant minimalist watch with a premium leather strap. A timeless accessory for any outfit.",
        price: 99.99,
        category: "accessories",
        subCategory: "jewelry",
        imageUrls: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        colors: ["Black/Silver", "Brown/Gold", "Black/Gold"],
        material: "Stainless Steel, Leather",
        isNew: false,
        isFeatured: false
      },
      {
        name: "Wide Brim Straw Hat",
        description: "Classic wide brim straw hat, perfect for sun protection with a touch of style.",
        price: 34.99,
        category: "accessories",
        subCategory: "hats",
        imageUrls: ["https://images.unsplash.com/photo-1565339119810-a536680fd7e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        colors: ["Natural", "Black", "White"],
        material: "Straw",
        isNew: true,
        isFeatured: false
      }
    ];
    
    products.forEach(product => {
      this.createProduct(product as InsertProduct);
    });
    
    // Create sample reviews
    this.createReview({
      productId: 1,
      userId: 2,
      rating: 5,
      comment: "I absolutely love this dress! The fabric feels premium and the fit is perfect."
    });
    
    this.createReview({
      productId: 2,
      userId: 2,
      rating: 4,
      comment: "Great jacket, fits well and looks good with almost everything."
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.category === category
    );
  }
  
  async getProductsBySubCategory(subCategory: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.subCategory === subCategory
    );
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.isFeatured
    );
  }
  
  async getNewProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.isNew
    );
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const now = new Date();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: now
    };
    this.products.set(id, product);
    return product;
  }
  
  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      product => 
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery) ||
        product.subCategory.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  // Review methods
  async getReviewsByProduct(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.productId === productId
    );
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const now = new Date();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: now
    };
    this.reviews.set(id, review);
    return review;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    return this.reviews.delete(id);
  }
  
  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order => order.userId === userId
    );
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const now = new Date();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: now
    };
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  // Order Items methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      orderItem => orderItem.orderId === orderId
    );
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
  
  // Cart methods
  async getUserCart(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      cartItem => cartItem.userId === userId
    );
  }
  
  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if the product is already in the cart
    const existingCartItem = Array.from(this.cartItems.values()).find(
      item => item.userId === insertCartItem.userId && 
             item.productId === insertCartItem.productId &&
             item.size === insertCartItem.size &&
             item.color === insertCartItem.color
    );
    
    if (existingCartItem) {
      // Update quantity instead of adding a new item
      return this.updateCartItem(existingCartItem.id, existingCartItem.quantity + insertCartItem.quantity) as Promise<CartItem>;
    }
    
    const id = this.currentCartItemId++;
    const cartItem: CartItem = {
      ...insertCartItem,
      id
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = await this.getUserCart(userId);
    
    userCartItems.forEach(item => {
      this.cartItems.delete(item.id);
    });
    
    return true;
  }
}

export const storage = new MemStorage();
