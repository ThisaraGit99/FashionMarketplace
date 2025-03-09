import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  subCategory: string;
  imageUrls: string[];
  sizes?: string[];
  colors?: string[];
  material?: string;
  inStock: boolean;
  isNew: boolean;
  isFeatured: boolean;
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
  product: Product;
}

interface AddToCartData {
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface UpdateCartItemData {
  id: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  addToCart: (data: AddToCartData) => Promise<void>;
  updateCartItem: (data: UpdateCartItemData) => Promise<void>;
  removeCartItem: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Calculate derived states
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => {
    const price = item.product.salePrice || item.product.price;
    return total + price * item.quantity;
  }, 0);

  // Fetch cart items
  const { isLoading, refetch } = useQuery({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      if (!isAuthenticated) {
        return [];
      }
      
      try {
        const res = await fetch('/api/cart', {
          credentials: 'include'
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            return [];
          }
          throw new Error('Failed to fetch cart');
        }
        
        const data = await res.json();
        setCart(data);
        return data;
      } catch (error) {
        return [];
      }
    },
    enabled: isAuthenticated
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (data: AddToCartData) => {
      const res = await apiRequest('POST', '/api/cart', data);
      return res.json();
    },
    onSuccess: (data) => {
      // Check if the item already exists in the cart
      const existingItemIndex = cart.findIndex(item => 
        item.productId === data.productId && 
        item.size === data.size && 
        item.color === data.color
      );
      
      if (existingItemIndex !== -1) {
        // Update the existing item
        const updatedCart = [...cart];
        updatedCart[existingItemIndex] = data;
        setCart(updatedCart);
      } else {
        // Add the new item
        setCart(prev => [...prev, data]);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: `${data.product.name} has been added to your cart`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to cart",
        description: error.message || "An error occurred while adding to cart",
        variant: "destructive"
      });
    }
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: async (data: UpdateCartItemData) => {
      const res = await apiRequest('PUT', `/api/cart/${data.id}`, { quantity: data.quantity });
      return res.json();
    },
    onSuccess: (data) => {
      setCart(prev => prev.map(item => item.id === data.id ? data : item));
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart updated",
        description: `${data.product.name} quantity updated`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update cart",
        description: error.message || "An error occurred while updating cart",
        variant: "destructive"
      });
    }
  });

  // Remove cart item mutation
  const removeCartItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/cart/${id}`, undefined);
      return id;
    },
    onSuccess: (id) => {
      setCart(prev => prev.filter(item => item.id !== id));
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove item",
        description: error.message || "An error occurred while removing the item",
        variant: "destructive"
      });
    }
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/cart`, undefined);
    },
    onSuccess: () => {
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to clear cart",
        description: error.message || "An error occurred while clearing the cart",
        variant: "destructive"
      });
    }
  });

  // Refetch cart when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    } else {
      setCart([]);
    }
  }, [isAuthenticated, refetch]);

  // Add to cart function
  const addToCart = async (data: AddToCartData) => {
    await addToCartMutation.mutateAsync(data);
  };

  // Update cart item function
  const updateCartItem = async (data: UpdateCartItemData) => {
    await updateCartItemMutation.mutateAsync(data);
  };

  // Remove cart item function
  const removeCartItem = async (id: number) => {
    await removeCartItemMutation.mutateAsync(id);
  };

  // Clear cart function
  const clearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        totalPrice,
        isLoading,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook exported from separate file (see hooks/useCart.ts)
