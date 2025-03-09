import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon, User, ShoppingCart, Menu, ChevronDown } from 'lucide-react';
import CartDrawer from './CartDrawer';

const Header = () => {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/category/all?search=${searchQuery}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const categories = [
    { name: 'Women', path: '/category/womens', subcategories: ['Dresses', 'Tops', 'Jeans', 'Shoes', 'Accessories'] },
    { name: 'Men', path: '/category/mens', subcategories: ['Shirts', 'T-shirts', 'Jeans', 'Shoes', 'Accessories'] },
    { name: 'Shoes', path: '/category/shoes', subcategories: [] },
    { name: 'Accessories', path: '/category/accessories', subcategories: [] },
    { name: 'Sale', path: '/category/sale', subcategories: [] },
  ];

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold font-poppins">
                  <span className="text-primary">Fashion</span>
                  <span className="text-secondary">Hub</span>
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {categories.map((category) => (
                <div key={category.name} className="group relative">
                  {category.subcategories.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center text-textColor hover:text-primary font-medium">
                          {category.name}
                          <ChevronDown className="ml-1 w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {category.subcategories.map((subcat) => (
                          <DropdownMenuItem key={subcat} asChild>
                            <Link href={`${category.path}/${subcat.toLowerCase()}`}>
                              <span className="w-full">{subcat}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link href={category.path} className="text-textColor hover:text-primary font-medium">
                      {category.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Search, User, Cart */}
            <div className="flex space-x-6 items-center">
              <div className="hidden md:block relative">
                <form onSubmit={handleSearch} className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="border border-border rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-primary text-sm w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                  >
                    <SearchIcon className="w-4 h-4" />
                  </Button>
                </form>
              </div>
              <div className="flex space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-textColor hover:text-primary">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAuthenticated ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/profile">My Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/orders">My Orders</Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href="/admin">Admin Dashboard</Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          Logout
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/login">Sign In</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/register">Sign Up</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-textColor hover:text-primary relative"
                  onClick={() => setCartOpen(true)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {totalItems}
                    </span>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-textColor hover:text-primary"
                  onClick={toggleMobileMenu}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white">
            <div className="px-4 py-2">
              <form onSubmit={handleSearch} className="relative my-4">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="border border-border rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-primary text-sm w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                >
                  <SearchIcon className="w-4 h-4" />
                </Button>
              </form>
              
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.path}
                  className="block py-2 text-textColor hover:text-primary font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      
      <CartDrawer open={cartOpen} setOpen={setCartOpen} />
    </>
  );
};

export default Header;
