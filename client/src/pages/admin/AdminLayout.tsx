import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Layers,
  ShoppingBag,
  Users,
  Settings,
  ChevronRight,
  LogOut,
  Home,
  LayoutDashboard,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [location] = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      // Handled in each admin page
    }
  }, [isAuthenticated, isAdmin]);

  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: <Layers className="h-5 w-5 mr-3" />,
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: <ShoppingBag className="h-5 w-5 mr-3" />,
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <Users className="h-5 w-5 mr-3" />,
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md fixed h-full hidden md:block">
        <div className="py-6 px-6">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">Fashion<span className="text-secondary">Hub</span></span>
          </Link>
          <div className="mt-2 text-sm text-gray-500">Admin Dashboard</div>
        </div>
        
        <div className="px-4 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    location === item.path
                      ? 'bg-primary text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-lg font-semibold">
              {user?.firstName?.[0] || user?.username[0]}
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/">
                <div className="flex items-center justify-center">
                  <Home className="mr-2 h-4 w-4" />
                  Storefront
                </div>
              </Link>
            </Button>
            <Button variant="destructive" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">Fashion<span className="text-secondary">Hub</span></span>
          </Link>
          
          {/* Mobile Menu Button (could be expanded to show a slide-out menu) */}
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Tabs for mobile navigation */}
        <div className="flex overflow-x-auto p-1 bg-gray-50">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex items-center px-3 py-2 text-sm whitespace-nowrap rounded-md mr-2 ${
                  location === item.path
                    ? 'bg-primary text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </a>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 pt-6 md:pt-0">
        <div className="p-6 mt-12 md:mt-0">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
