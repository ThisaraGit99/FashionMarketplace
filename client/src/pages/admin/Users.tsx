import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
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
} from '@/components/ui/dialog';
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
  ShieldCheck,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User as UserIcon,
} from 'lucide-react';

const Users = () => {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  
  // State for controlling modals and filters
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin/users');
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAdmin,
  });
  
  // Fetch user orders when a user is selected
  const { data: userOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/admin/orders'],
    enabled: isAdmin && !!selectedUser,
    select: (data) => {
      return selectedUser ? data.filter((order: any) => order.userId === selectedUser.id) : [];
    },
  });
  
  // Handle view details button click
  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };
  
  // Filter users based on search term
  const filteredUsers = users?.filter((user: any) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.includes(searchTerm.toLowerCase())
    );
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6">
        <div className="relative">
          <Input
            placeholder="Search by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Loading users...</div>
        ) : filteredUsers?.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center text-lg font-semibold mr-3">
                        {user.firstName?.[0] || user.username[0]}
                      </div>
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline">Customer</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
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
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria' : 'No users have registered yet'}
            </p>
          </div>
        )}
      </div>
      
      {/* User Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="mt-4 space-y-6">
              {/* User Profile */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4 flex flex-col items-center">
                  <div className="h-24 w-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-semibold">
                    {selectedUser.firstName?.[0] || selectedUser.username[0]}
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-medium">{selectedUser.firstName} {selectedUser.lastName}</h3>
                    <p className="text-gray-500">@{selectedUser.username}</p>
                    <div className="mt-2">
                      {selectedUser.isAdmin ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">Customer</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="md:w-3/4 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{selectedUser.email}</span>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{selectedUser.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(selectedUser.address || selectedUser.city || selectedUser.state || selectedUser.zipCode || selectedUser.country) && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Address</h3>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          {selectedUser.address && <div>{selectedUser.address}</div>}
                          {(selectedUser.city || selectedUser.state || selectedUser.zipCode) && (
                            <div>
                              {selectedUser.city}{selectedUser.city && selectedUser.state ? ', ' : ''}
                              {selectedUser.state} {selectedUser.zipCode}
                            </div>
                          )}
                          {selectedUser.country && <div>{selectedUser.country}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Registration Date</p>
                        <p>{formatDate(selectedUser.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">User ID</p>
                        <p>#{selectedUser.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* User Orders */}
              <div>
                <h3 className="text-lg font-medium mb-2">Order History</h3>
                {isLoadingOrders ? (
                  <div className="p-4 text-center">Loading order history...</div>
                ) : userOrders?.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userOrders.map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id.toString().padStart(5, '0')}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>
                              <Badge className={`
                                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                                ${order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' : ''}
                                ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                                ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                              `}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-6 text-center border rounded-md bg-gray-50">
                    <ShoppingBag className="mx-auto h-8 w-8 text-gray-400 mb-1" />
                    <h3 className="text-sm font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-gray-500">This user hasn't placed any orders yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Users;
