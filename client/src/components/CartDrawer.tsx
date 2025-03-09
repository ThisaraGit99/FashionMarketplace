import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { Link } from 'wouter';
import QuantitySelector from './QuantitySelector';

interface CartDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CartDrawer = ({ open, setOpen }: CartDrawerProps) => {
  const { cart, totalItems, totalPrice, updateCartItem, removeCartItem } = useCart();

  // Additional costs
  const shipping = 5.99;
  const tax = totalPrice * 0.08; // 8% tax
  const total = totalPrice + shipping + tax;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={() => setOpen(false)}
      />
      
      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Cart ({totalItems})</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Button
                    asChild
                    variant="default"
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center py-4 border-b border-gray-200">
                    <img
                      src={item.product.imageUrls[0]}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-sm">{item.product.name}</h3>
                      <p className="text-gray-500 text-xs">
                        {item.color && `Color: ${item.color}`}
                        {item.color && item.size && ', '}
                        {item.size && `Size: ${item.size}`}
                      </p>
                      <div className="flex items-center mt-1">
                        <QuantitySelector
                          quantity={item.quantity}
                          onIncrease={() => updateCartItem({ id: item.id, quantity: item.quantity + 1 })}
                          onDecrease={() => item.quantity > 1 && updateCartItem({ id: item.id, quantity: item.quantity - 1 })}
                          min={1}
                          compact={true}
                        />
                        <span className="ml-auto font-semibold">
                          ${(item.product.salePrice || item.product.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeCartItem(item.id)}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            
            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-6 pt-2 border-t border-gray-200">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">${total.toFixed(2)}</span>
                </div>
                
                <div className="space-y-3">
                  <Button
                    asChild
                    className="w-full bg-secondary hover:bg-secondary/90"
                  >
                    <Link href="/checkout" onClick={() => setOpen(false)}>
                      Proceed to Checkout
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;