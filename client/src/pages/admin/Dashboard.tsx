import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from './AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DollarSign, Users, ShoppingBag, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, isAdmin } = useAuth();
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin');
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  // Fetch all orders for analytics
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/admin/orders'],
    enabled: isAdmin,
  });
  
  // Fetch all users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAdmin,
  });
  
  // Fetch all products
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
    enabled: isAdmin,
  });
  
  // Calculate metrics
  const totalRevenue = orders?.reduce((sum: number, order: any) => sum + order.total, 0) || 0;
  const totalOrders = orders?.length || 0;
  const totalUsers = users?.length || 0;
  const totalProducts = products?.length || 0;
  
  // Sales by category data
  const salesByCategory = orders?.reduce((acc: any, order: any) => {
    order.items.forEach((item: any) => {
      const category = item.product.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += item.price * item.quantity;
    });
    return acc;
  }, {});
  
  const salesByCategoryData = salesByCategory ? Object.keys(salesByCategory).map(category => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: salesByCategory[category]
  })) : [];
  
  // Orders by status data
  const ordersByStatus = orders?.reduce((acc: any, order: any) => {
    if (!acc[order.status]) {
      acc[order.status] = 0;
    }
    acc[order.status]++;
    return acc;
  }, {});
  
  const ordersByStatusData = ordersByStatus ? Object.keys(ordersByStatus).map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: ordersByStatus[status]
  })) : [];
  
  // Monthly sales data (mock data for the chart)
  const monthlyData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 2000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
    { name: 'Jul', sales: 3490 },
  ];
  
  // Pie chart colors
  const COLORS = ['#4A90E2', '#FF6347', '#F2C94C', '#6FCF97', '#9B51E0', '#3F3D56'];

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.firstName || user?.username}!</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold">${totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
                <h3 className="text-2xl font-bold">{totalOrders}</h3>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                <h3 className="text-2xl font-bold">{totalUsers}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Products</p>
                <h3 className="text-2xl font-bold">{totalProducts}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>Revenue overview for the past 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                  <Line type="monotone" dataKey="sales" stroke="#4A90E2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Current order distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => [value, 'Orders']} />
                  <Bar dataKey="value" fill="#FF6347" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Revenue distribution across product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {salesByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingOrders ? (
                <div className="text-center py-8">Loading orders...</div>
              ) : orders?.length > 0 ? (
                orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">Order #{order.id.toString().padStart(5, '0')}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.status}
                      </p>
                    </div>
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No orders found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
