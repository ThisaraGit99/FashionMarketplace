import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingBag, CreditCard, AlertTriangle, Check } from 'lucide-react';

const formSchema = z.object({
  shippingAddress: z.string().min(5, "Address is required"),
  shippingCity: z.string().min(1, "City is required"),
  shippingState: z.string().min(1, "State is required"),
  shippingZipCode: z.string().min(5, "Zip code is required"),
  shippingCountry: z.string().min(1, "Country is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCVC: z.string().optional(),
  sameAsBilling: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const Checkout = () => {
  const [location, navigate] = useLocation();
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [isComplete, setIsComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  // Calculate additional costs
  const shipping = totalPrice >= 99 ? 0 : 5.99;
  const tax = totalPrice * 0.08; // 8% tax rate
  const total = totalPrice + shipping + tax;
  
  // Form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shippingAddress: user?.address || '',
      shippingCity: user?.city || '',
      shippingState: user?.state || '',
      shippingZipCode: user?.zipCode || '',
      shippingCountry: user?.country || 'US',
      paymentMethod: 'credit',
      sameAsBilling: true,
    },
  });
  
  // Mutation to create order
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest('POST', '/api/orders', data);
      return res.json();
    },
    onSuccess: (data) => {
      setOrderNumber(data.id.toString().padStart(5, '0'));
      setIsComplete(true);
      clearCart();
      toast({
        title: 'Order Placed Successfully',
        description: `Your order #${data.id.toString().padStart(5, '0')} has been placed!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to place order',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: FormValues) => {
    if (cart.length === 0) {
      toast({
        title: 'Cannot checkout',
        description: 'Your cart is empty',
        variant: 'destructive',
      });
      return;
    }
    
    mutate(values);
  };
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-background py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-secondary" />
            <h1 className="text-2xl font-semibold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to proceed with checkout.</p>
            <div className="flex justify-center gap-4">
              <Button
                asChild
                variant="outline"
              >
                <a href="/cart">Return to Cart</a>
              </Button>
              <Button
                asChild
              >
                <a href="/login">Sign In</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show empty cart message
  if (cart.length === 0 && !isComplete) {
    return (
      <div className="bg-background py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">You need to add some items to your cart before checking out.</p>
            <Button
              asChild
            >
              <a href="/">Start Shopping</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show order complete message
  if (isComplete) {
    return (
      <div className="bg-background py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-semibold mb-4">Order Complete!</h1>
            <p className="text-gray-600 mb-2">Thank you for your purchase.</p>
            <p className="text-gray-600 mb-6">Your order #{orderNumber} has been placed successfully.</p>
            <p className="text-gray-600 mb-8">We've sent a confirmation email to {user?.email}.</p>
            <div className="flex justify-center gap-4">
              <Button
                asChild
                variant="outline"
              >
                <a href="/profile">View Order History</a>
              </Button>
              <Button
                asChild
              >
                <a href="/">Continue Shopping</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-semibold mb-8 font-poppins">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="flex-grow lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="shippingAddress"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St, Apt 4B" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="shippingCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="shippingState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="shippingZipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP/Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="shippingCountry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="US">United States</SelectItem>
                                  <SelectItem value="CA">Canada</SelectItem>
                                  <SelectItem value="GB">United Kingdom</SelectItem>
                                  <SelectItem value="AU">Australia</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="sameAsBilling"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Billing address is the same as shipping address
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                      
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Payment Method</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="credit">Credit Card</SelectItem>
                                  <SelectItem value="paypal">PayPal</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('paymentMethod') === 'credit' && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-md space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <FormLabel>Card Number</FormLabel>
                              <Input placeholder="•••• •••• •••• ••••" />
                            </div>
                            
                            <div>
                              <FormLabel>Expiration Date</FormLabel>
                              <Input placeholder="MM/YY" />
                            </div>
                            
                            <div>
                              <FormLabel>Security Code (CVC)</FormLabel>
                              <Input placeholder="•••" />
                            </div>
                          </div>
                          
                          <Alert className="bg-gray-50">
                            <CreditCard className="h-4 w-4" />
                            <AlertTitle>Secure Payment</AlertTitle>
                            <AlertDescription>
                              This is a demo. No actual payment will be processed.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-secondary hover:bg-secondary/90 text-white"
                      disabled={isPending}
                    >
                      {isPending ? 'Processing...' : `Place Order • $${total.toFixed(2)}`}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="mb-4">
                  {cart.map((item) => {
                    const price = item.product.salePrice || item.product.price;
                    const itemTotal = price * item.quantity;
                    
                    return (
                      <div key={item.id} className="flex py-3 border-b border-gray-100">
                        <div className="w-16 h-16 flex-shrink-0">
                          <img
                            src={item.product.imageUrls[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="ml-4 flex-grow">
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium">{item.product.name}</h3>
                            <span className="text-sm font-medium">${itemTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <div>
                              {item.size && <span>Size: {item.size}</span>}
                              {item.size && item.color && <span> / </span>}
                              {item.color && <span>Color: {item.color}</span>}
                            </div>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
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
                
                <div className="border-t border-gray-200 pt-4">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <a href="/cart">Return to Cart</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
