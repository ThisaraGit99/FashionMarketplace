import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from './AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MoreVertical,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  Ban,
  Package2,
  Filter,
} from 'lucide-react';

const Orders = () => {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  
  // State for controlling modals and filters
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin/orders');
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  // Fetch all orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/admin/orders'],
    enabled: isAdmin,
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PUT', `/api/admin/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: 'Order updated',
        description: 'The order status has been updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update order',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Handle view details button click
  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };
  
  // Handle status update
  const handleStatusUpdate = (id: number, status: string) => {
    updateOrderStatusMutation.mutate({ id, status });
  };
  
  // Filter orders based on search term and status filter
  const filteredOrders = orders?.filter((order: any) => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Helper function to render order status badge
  const renderOrderStatus = (status: string) => {
    const statusMap: Record<string, { color: string, icon: React.ReactNode }> = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3 mr-1" /> },
      'processing': { color: 'bg-blue-100 text-blue-800', icon: <Package2 className="w-3 h-3 mr-1" /> },
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

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Orders</h1>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Input
            placeholder="Search by order ID, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        
        <div className="w-full md:w-48">
          <Select
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value || null)}
          >
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>{statusFilter ? `Status: ${statusFilter}` : 'All Statuses'}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Loading orders...</div>
        ) : filteredOrders?.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.toString().padStart(5, '0')}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user?.firstName} {order.user?.lastName}</div>
                      <div className="text-sm text-gray-500">{order.user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    {renderOrderStatus(order.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(order.id, 'pending')}
                          disabled={order.status === 'pending'}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(order.id, 'processing')}
                          disabled={order.status === 'processing'}
                        >
                          <Package2 className="mr-2 h-4 w-4" />
                          Mark as Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(order.id, 'shipped')}
                          disabled={order.status === 'shipped'}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Mark as Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          disabled={order.status === 'delivered'}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          disabled={order.status === 'cancelled'}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center">
            <Package2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter
                ? 'Try adjusting your search or filter criteria'
                : 'No orders have been placed yet'}
            </p>
          </div>
        )}
      </div>
      
      {/* Order Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id?.toString().padStart(5, '0')} placed on {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="mt-4 space-y-6">
              {/* Order Status and Actions */}
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">{renderOrderStatus(selectedOrder.status)}</div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Update Status</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-yellow-600"
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'pending')}
                      disabled={selectedOrder.status === 'pending'}
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      Pending
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-blue-600"
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                      disabled={selectedOrder.status === 'processing'}
                    >
                      <Package2 className="mr-1 h-3 w-3" />
                      Processing
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-indigo-600"
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                      disabled={selectedOrder.status === 'shipped'}
                    >
                      <Truck className="mr-1 h-3 w-3" />
                      Shipped
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-green-600"
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                      disabled={selectedOrder.status === 'delivered'}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Delivered
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600"
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                      disabled={selectedOrder.status === 'cancelled'}
                    >
                      <Ban className="mr-1 h-3 w-3" />
                      Cancelled
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                    <p className="mt-1 font-medium">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                    <p className="text-gray-500">{selectedOrder.user?.email}</p>
                    <p className="text-gray-500">{selectedOrder.user?.phone || 'No phone provided'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Shipping Address</h4>
                    <p className="mt-1 text-gray-900">{selectedOrder.shippingAddress}</p>
                    <p className="text-gray-500">
                      {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingZipCode}
                    </p>
                    <p className="text-gray-500">{selectedOrder.shippingCountry}</p>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium mb-2">Order Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded overflow-hidden mr-3 bg-gray-100">
                                {item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                                  <img
                                    src={item.product.imageUrls[0]}
                                    alt={item.product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package2 className="h-full w-full p-2 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{item.product.name}</div>
                                <div className="text-xs text-gray-500">
                                  {item.size && <span>Size: {item.size}</span>}
                                  {item.size && item.color && <span> / </span>}
                                  {item.color && <span>Color: {item.color}</span>}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-medium mb-2">Order Summary</h3>
                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between py-1">
                    <span>Subtotal</span>
                    <span>${(selectedOrder.total * 0.92).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Shipping</span>
                    <span>${(selectedOrder.total * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Tax</span>
                    <span>${(selectedOrder.total * 0.03).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-medium border-t mt-2">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Payment Information</h3>
                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between py-1">
                    <span>Payment Method</span>
                    <span className="capitalize">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Payment Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Paid
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Orders;
