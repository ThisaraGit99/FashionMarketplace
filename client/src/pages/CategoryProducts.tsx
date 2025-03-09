import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { FilterIcon, Search, ChevronDown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const CategoryProducts = () => {
  const [match, params] = useRoute('/category/:category');
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const searchQuery = urlParams.get('search') || '';
  
  const category = params?.category || 'all';
  const { toast } = useToast();
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Get products based on filters
  const queryKey = category === 'all' 
    ? searchTerm 
      ? ['/api/products?search=' + searchTerm]
      : ['/api/products'] 
    : ['/api/products?category=' + category];
  
  const { data: products, isLoading } = useQuery({ queryKey });

  // Filter products client-side
  const filteredProducts = products ? products.filter((product: any) => {
    // Filter by price range
    const price = product.salePrice || product.price;
    if (price < priceRange[0] || price > priceRange[1]) return false;
    
    // Filter by sizes if any are selected
    if (selectedSizes.length > 0 && product.sizes) {
      if (!selectedSizes.some(size => product.sizes.includes(size))) return false;
    }
    
    // Filter by colors if any are selected
    if (selectedColors.length > 0 && product.colors) {
      if (!selectedColors.some(color => product.colors.includes(color))) return false;
    }
    
    return true;
  }) : [];
  
  // Sort products
  const sortedProducts = [...(filteredProducts || [])].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price-low-high':
        return (a.salePrice || a.price) - (b.salePrice || b.price);
      case 'price-high-low':
        return (b.salePrice || b.price) - (a.salePrice || a.price);
      case 'name-a-z':
        return a.name.localeCompare(b.name);
      case 'name-z-a':
        return b.name.localeCompare(a.name);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  
  // Available sizes and colors for filtering
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', '36', '37', '38', '39', '40', '41'];
  const availableColors = ['Blue', 'Red', 'Green', 'Yellow', 'Black', 'White', 'Gray', 'Brown'];
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.history.pushState(null, '', `/category/${category}${searchTerm ? `?search=${searchTerm}` : ''}`);
    // Refetch with new search term
  };
  
  // Handle size toggle
  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size) 
        : [...prev, size]
    );
  };
  
  // Handle color toggle
  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color) 
        : [...prev, color]
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setPriceRange([0, 200]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSortBy('newest');
  };
  
  // Get category title
  const getCategoryTitle = () => {
    if (searchTerm) {
      return `Search Results for "${searchTerm}"`;
    }
    
    if (category === 'all') {
      return 'All Products';
    }
    
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    return formattedCategory.endsWith('s') ? formattedCategory : `${formattedCategory}'s`;
  };

  return (
    <div className="bg-background py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold font-poppins mb-2">{getCategoryTitle()}</h1>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="mb-4 md:hidden">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Narrow down products by applying filters
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Price Range</h3>
                    <div className="px-2">
                      <Slider
                        defaultValue={priceRange}
                        max={200}
                        step={1}
                        onValueChange={setPriceRange}
                      />
                      <div className="flex justify-between mt-2 text-sm text-gray-500">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Size Filter - Mobile */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Size</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {availableSizes.map(size => (
                        <Button
                          key={size}
                          variant="outline"
                          size="sm"
                          className={`${
                            selectedSizes.includes(size) 
                              ? 'bg-primary text-white border-primary' 
                              : 'border-gray-200'
                          }`}
                          onClick={() => toggleSize(size)}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Filter - Mobile */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map(color => {
                        // Map color names to tailwind color classes
                        const colorMap: Record<string, string> = {
                          "Blue": "bg-blue-500",
                          "Red": "bg-red-400",
                          "Green": "bg-green-500",
                          "Yellow": "bg-yellow-400",
                          "Black": "bg-black",
                          "White": "bg-white border border-gray-300",
                          "Gray": "bg-gray-500",
                          "Brown": "bg-amber-700",
                        };
                        
                        const bgClass = colorMap[color] || "bg-gray-500";
                        
                        return (
                          <button
                            key={color}
                            className={`w-8 h-8 rounded-full ${bgClass} ${
                              selectedColors.includes(color) 
                                ? 'ring-2 ring-primary ring-offset-2' 
                                : ''
                            }`}
                            onClick={() => toggleColor(color)}
                            aria-label={`Select ${color} color`}
                          ></button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button className="flex-1" onClick={resetFilters} variant="outline">Reset</Button>
                    <Button className="flex-1">Apply Filters</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full md:w-auto mb-4 md:mb-0">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 pr-10"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
            
            {/* Sort Dropdown */}
            <div className="w-full md:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="name-a-z">Name: A to Z</SelectItem>
                  <SelectItem value="name-z-a">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Desktop Layout with Sidebar */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden md:block w-64 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Price Range</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={priceRange}
                    max={200}
                    step={1}
                    onValueChange={setPriceRange}
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
              
              {/* Size Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map(size => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      className={`${
                        selectedSizes.includes(size) 
                          ? 'bg-primary text-white border-primary' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Color Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => {
                    // Map color names to tailwind color classes
                    const colorMap: Record<string, string> = {
                      "Blue": "bg-blue-500",
                      "Red": "bg-red-400",
                      "Green": "bg-green-500",
                      "Yellow": "bg-yellow-400",
                      "Black": "bg-black",
                      "White": "bg-white border border-gray-300",
                      "Gray": "bg-gray-500",
                      "Brown": "bg-amber-700",
                    };
                    
                    const bgClass = colorMap[color] || "bg-gray-500";
                    
                    return (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full ${bgClass} ${
                          selectedColors.includes(color) 
                            ? 'ring-2 ring-primary ring-offset-2' 
                            : ''
                        }`}
                        onClick={() => toggleColor(color)}
                        aria-label={`Select ${color} color`}
                      ></button>
                    );
                  })}
                </div>
              </div>
              
              <Button onClick={resetFilters} className="w-full">Reset Filters</Button>
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden h-80 animate-pulse">
                    <div className="w-full h-64 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {sortedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                <Button onClick={resetFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts;
