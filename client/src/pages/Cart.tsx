import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag } from 'lucide-react';
import QuantitySelector from '@/components/QuantitySelector';

const Cart = () => {
  const [location, navigate] = useLocation();
  const { cart, totalItems, totalPrice, updateCartItem, removeCartItem } = useCart();
  const { isAuthenticated } = useAuth();

  // Calculate additional costs
  const shipping = totalPrice >= 99 ? 0 : 5.99;
  const tax = totalPrice * 0.08; // 8% tax rate
  const total = totalPrice + shipping + tax;

  if (!isAuthenticated) {
    return (
      <div className="bg-background py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Please sign in to view your cart and continue shopping.</p>
            <div className="flex justify-center gap-4">
              <Button
                asChild
                variant="outline"
              >
                <Link href="/">Continue Shopping</Link>
              </Button>
              <Button
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="bg-background py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Button
              asChild
            >
              <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-semibold mb-8 font-poppins">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-grow lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="hidden md:flex border-b border-gray-200 pb-4 mb-4 font-medium text-gray-500">
                  <div className="w-1/2">Product</div>
                  <div className="w-1/6 text-center">Price</div>
                  <div className="w-1/6 text-center">Quantity</div>
                  <div className="w-1/6 text-center">Total</div>
                </div>
                
                {cart.map((item) => {
                  const price = item.product.salePrice || item.product.price;
                  const itemTotal = price * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex flex-col md:flex-row items-center py-6 border-b border-gray-200">
                      {/* Product Info */}
                      <div className="w-full md:w-1/2 flex mb-4 md:mb-0">
                        <div className="w-24 h-24 flex-shrink-0">
                          <img
                            src={item.product.imageUrls[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="ml-4">
                          <Link href={`/product/${item.productId}`} className="font-medium hover:text-primary">
                            {item.product.name}
                          </Link>
                          <div className="text-sm text-gray-500 mt-1">
                            {item.color && <span>Color: {item.color}</span>}
                            {item.color && item.size && <span> / </span>}
                            {item.size && <span>Size: {item.size}</span>}
                          </div>
                          <button
                            onClick={() => removeCartItem(item.id)}
                            className="text-sm text-red-500 flex items-center mt-2 md:hidden"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="w-full md:w-1/6 text-center mb-4 md:mb-0">
                        <div className="md:hidden text-sm text-gray-500 mb-1">Price:</div>
                        ${price.toFixed(2)}
                      </div>
                      
                      {/* Quantity */}
                      <div className="w-full md:w-1/6 flex justify-center mb-4 md:mb-0">
                        <div className="md:hidden text-sm text-gray-500 mb-1 mr-2">Quantity:</div>
                        <QuantitySelector
                          quantity={item.quantity}
                          onDecrease={() => item.quantity > 1 && updateCartItem({ id: item.id, quantity: item.quantity - 1 })}
                          onIncrease={() => updateCartItem({ id: item.id, quantity: item.quantity + 1 })}
                          min={1}
                          max={10}
                        />
                      </div>
                      
                      {/* Total */}
                      <div className="w-full md:w-1/6 text-center font-medium mb-4 md:mb-0">
                        <div className="md:hidden text-sm text-gray-500 mb-1">Total:</div>
                        ${itemTotal.toFixed(2)}
                      </div>
                      
                      {/* Remove Button (Desktop) */}
                      <div className="hidden md:block">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCartItem(item.id)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {/* Continue Shopping */}
                <div className="mt-6">
                  <Button
                    asChild
                    variant="outline"
                    className="text-primary"
                  >
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-green-500">Free</span>
                    ) : (
                      <span>${shipping.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {shipping > 0 && (
                  <div className="bg-blue-50 text-blue-700 p-3 rounded mb-6 text-sm">
                    Add ${(99 - totalPrice).toFixed(2)} more to your order for free shipping!
                  </div>
                )}
                
                <Button
                  asChild
                  className="w-full bg-secondary hover:bg-secondary/90 text-white"
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                
                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>We accept</p>
                  <div className="flex justify-center mt-2 space-x-2">
                    <div className="w-10 h-6 bg-gray-200 rounded"></div>
                    <div className="w-10 h-6 bg-gray-200 rounded"></div>
                    <div className="w-10 h-6 bg-gray-200 rounded"></div>
                    <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
