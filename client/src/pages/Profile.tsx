import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  User,
  CreditCard,
  MapPin,
  ShieldCheck,
  Home,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { toast } = useToast();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Get user orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
  });
  
  // Profile form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      zipCode: user?.zipCode || '',
      country: user?.country || '',
    },
  });
  
  // Update form values when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        country: user.country || '',
      });
    }
  }, [user, form]);
  
  // Update profile mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      await updateProfile(data);
    },
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (data: ProfileFormValues) => {
    mutate(data);
  };
  
  // Helper function to render order status badge
  const renderOrderStatus = (status: string) => {
    const statusMap: Record<string, { color: string, icon: React.ReactNode }> = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3 mr-1" /> },
      'processing': { color: 'bg-blue-100 text-blue-800', icon: <Package className="w-3 h-3 mr-1" /> },
      'shipped': { color: 'bg-indigo-100 text-indigo-800', icon: <Truck className="w-3 h-3 mr-1" /> },
      'delivered': { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
      'cancelled': { color: 'bg-red-100 text-red-800', icon: <Ban className="w-3 h-3 mr-1" /> },
    };
    
    const { color, icon } = statusMap[status.toLowerCase()] || statusMap['pending'];
    
    return (
      <Badge className={`flex items-center ${color}`} variant="outline">
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-semibold mb-8 font-poppins">My Account</h1>
        
        <Tabs defaultValue="orders">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-64">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-semibold">
                    {user.firstName?.[0] || user.username[0]}
                  </div>
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <TabsList className="flex flex-col w-full space-y-1 bg-transparent">
                  <TabsTrigger
                    value="orders"
                    className="justify-start px-3 py-2 rounded-md text-left data-[state=active]:bg-primary/10"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    My Orders
                  </TabsTrigger>
                  <TabsTrigger
                    value="profile"
                    className="justify-start px-3 py-2 rounded-md text-left data-[state=active]:bg-primary/10"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Account Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="addresses"
                    className="justify-start px-3 py-2 rounded-md text-left data-[state=active]:bg-primary/10"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Addresses
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/')}
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Shop
              </Button>
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              <TabsContent value="orders" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      View and track your recent orders.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingOrders ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading your orders...</p>
                      </div>
                    ) : orders?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order: any) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">#{order.id.toString().padStart(5, '0')}</TableCell>
                              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>{renderOrderStatus(order.status)}</TableCell>
                              <TableCell>${order.total.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  View
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-8 text-center border rounded-md bg-gray-50">
                        <Package className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <h3 className="text-lg font-medium">No orders yet</h3>
                        <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                        <Button asChild>
                          <a href="/">Start Shopping</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="profile" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" disabled={isPending}>
                          {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="addresses" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Address Book</CardTitle>
                    <CardDescription>
                      Manage your shipping and billing addresses.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State/Province</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP/Postal Code</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" disabled={isPending}>
                          {isPending ? 'Saving...' : 'Save Address'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
