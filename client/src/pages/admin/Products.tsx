import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Tag,
  Image,
  Package,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// Product schema for form validation
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be positive'),
  salePrice: z.coerce.number().optional(),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().min(1, 'Subcategory is required'),
  imageUrls: z.array(z.string()).min(1, 'At least one image URL is required'),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  material: z.string().optional(),
  inStock: z.boolean().default(true),
  isNew: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

const Products = () => {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  
  // State for controlling modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempImageUrl, setTempImageUrl] = useState('');
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin/products');
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products'],
    enabled: isAdmin,
  });
  
  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const res = await apiRequest('POST', '/api/admin/products', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAddModalOpen(false);
      toast({
        title: 'Product added',
        description: 'The product has been added successfully',
      });
      addForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add product',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductFormValues }) => {
      const res = await apiRequest('PUT', `/api/admin/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsEditModalOpen(false);
      toast({
        title: 'Product updated',
        description: 'The product has been updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update product',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/products/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDeleteModalOpen(false);
      toast({
        title: 'Product deleted',
        description: 'The product has been deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete product',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Form for adding new product
  const addForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      salePrice: undefined,
      category: '',
      subCategory: '',
      imageUrls: [],
      sizes: [],
      colors: [],
      material: '',
      inStock: true,
      isNew: false,
      isFeatured: false,
    },
  });
  
  // Form for editing product
  const editForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      salePrice: undefined,
      category: '',
      subCategory: '',
      imageUrls: [],
      sizes: [],
      colors: [],
      material: '',
      inStock: true,
      isNew: false,
      isFeatured: false,
    },
  });
  
  // Category options
  const categoryOptions = [
    { value: 'womens', label: 'Women\'s' },
    { value: 'mens', label: 'Men\'s' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'accessories', label: 'Accessories' },
  ];
  
  // Subcategory options based on selected category
  const getSubcategoryOptions = (category: string) => {
    const subcategoriesMap: Record<string, { value: string; label: string }[]> = {
      womens: [
        { value: 'dresses', label: 'Dresses' },
        { value: 'tops', label: 'Tops' },
        { value: 'jeans', label: 'Jeans' },
        { value: 'shoes', label: 'Shoes' },
        { value: 'accessories', label: 'Accessories' },
      ],
      mens: [
        { value: 'shirts', label: 'Shirts' },
        { value: 't-shirts', label: 'T-shirts' },
        { value: 'jeans', label: 'Jeans' },
        { value: 'shoes', label: 'Shoes' },
        { value: 'accessories', label: 'Accessories' },
      ],
      shoes: [
        { value: 'sneakers', label: 'Sneakers' },
        { value: 'boots', label: 'Boots' },
        { value: 'sandals', label: 'Sandals' },
        { value: 'heels', label: 'Heels' },
      ],
      accessories: [
        { value: 'bags', label: 'Bags' },
        { value: 'jewelry', label: 'Jewelry' },
        { value: 'scarves', label: 'Scarves' },
        { value: 'hats', label: 'Hats' },
      ],
    };
    
    return subcategoriesMap[category] || [];
  };
  
  // Size options
  const sizeOptions = [
    { value: 'XS', label: 'XS' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: '36', label: '36' },
    { value: '37', label: '37' },
    { value: '38', label: '38' },
    { value: '39', label: '39' },
    { value: '40', label: '40' },
    { value: '41', label: '41' },
  ];
  
  // Color options
  const colorOptions = [
    { value: 'Blue', label: 'Blue' },
    { value: 'Red', label: 'Red' },
    { value: 'Green', label: 'Green' },
    { value: 'Yellow', label: 'Yellow' },
    { value: 'Black', label: 'Black' },
    { value: 'White', label: 'White' },
    { value: 'Gray', label: 'Gray' },
    { value: 'Navy', label: 'Navy' },
    { value: 'Purple', label: 'Purple' },
    { value: 'Brown', label: 'Brown' },
    { value: 'Burgundy', label: 'Burgundy' },
  ];
  
  // Add image URL to form
  const addImageUrl = (form: any) => {
    if (!tempImageUrl) return;
    
    const currentUrls = form.getValues('imageUrls') || [];
    form.setValue('imageUrls', [...currentUrls, tempImageUrl]);
    setTempImageUrl('');
  };
  
  // Remove image URL from form
  const removeImageUrl = (form: any, index: number) => {
    const currentUrls = form.getValues('imageUrls') || [];
    form.setValue('imageUrls', currentUrls.filter((_: any, i: number) => i !== index));
  };
  
  // Handle edit button click
  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    editForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice,
      category: product.category,
      subCategory: product.subCategory,
      imageUrls: product.imageUrls,
      sizes: product.sizes || [],
      colors: product.colors || [],
      material: product.material || '',
      inStock: product.inStock,
      isNew: product.isNew,
      isFeatured: product.isFeatured,
    });
    setIsEditModalOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (product: any) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };
  
  // Handle add product form submission
  const onAddSubmit = (data: ProductFormValues) => {
    addProductMutation.mutate(data);
  };
  
  // Handle edit product form submission
  const onEditSubmit = (data: ProductFormValues) => {
    if (!selectedProduct) return;
    updateProductMutation.mutate({ id: selectedProduct.id, data });
  };
  
  // Handle delete product confirmation
  const confirmDelete = () => {
    if (!selectedProduct) return;
    deleteProductMutation.mutate(selectedProduct.id);
  };
  
  // Filter products based on search term
  const filteredProducts = products?.filter((product: any) => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.subCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6">
        <div className="relative">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>
      
      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Loading products...</div>
        ) : filteredProducts?.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>New</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded overflow-hidden mr-3 bg-gray-100">
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-full w-full p-2 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description.slice(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {product.category}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1 capitalize">
                      {product.subCategory}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.salePrice ? (
                      <div>
                        <span className="text-sm font-medium text-red-600">${product.salePrice.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 line-through ml-1">${product.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium">${product.price.toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.inStock ? 'default' : 'secondary'} className="bg-green-100 text-green-800 hover:bg-green-100">
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isFeatured ? 'default' : 'outline'} className={product.isFeatured ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}>
                      {product.isFeatured ? 'Featured' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isNew ? 'default' : 'outline'} className={product.isNew ? 'bg-accent text-white hover:bg-accent' : ''}>
                      {product.isNew ? 'New' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/product/${product.id}`}>
                            <div className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new product.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Product Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new product to your store.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Summer Dress" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A detailed description of the product..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pricing</h3>
                  
                  <FormField
                    control={addForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regular Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="49.99" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price ($) (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="39.99" 
                            {...field}
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Categories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Categories</h3>
                  
                  <FormField
                    control={addForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoryOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="subCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!addForm.watch('category')}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getSubcategoryOptions(addForm.watch('category')).map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Images */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Images</h3>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter image URL"
                      value={tempImageUrl}
                      onChange={(e) => setTempImageUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={() => addImageUrl(addForm)}
                      variant="secondary"
                    >
                      Add
                    </Button>
                  </div>
                  
                  <FormField
                    control={addForm.control}
                    name="imageUrls"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                          {field.value?.map((url, index) => (
                            <div key={index} className="relative group">
                              <div className="h-24 w-full bg-gray-100 rounded overflow-hidden">
                                <img 
                                  src={url} 
                                  alt={`Product ${index + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImageUrl(addForm, index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {(!field.value || field.value.length === 0) && (
                            <div className="h-24 w-full bg-gray-100 rounded flex items-center justify-center text-gray-400">
                              <Image className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Variants */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Variants</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="sizes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sizes (optional)</FormLabel>
                          <div className="flex flex-wrap gap-2 border rounded-md p-3">
                            {sizeOptions.map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`size-${option.value}`}
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    return checked
                                      ? field.onChange([...currentValue, option.value])
                                      : field.onChange(currentValue.filter((value) => value !== option.value))
                                  }}
                                />
                                <label
                                  htmlFor={`size-${option.value}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="colors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Colors (optional)</FormLabel>
                          <div className="flex flex-wrap gap-2 border rounded-md p-3">
                            {colorOptions.map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`color-${option.value}`}
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    return checked
                                      ? field.onChange([...currentValue, option.value])
                                      : field.onChange(currentValue.filter((value) => value !== option.value))
                                  }}
                                />
                                <label
                                  htmlFor={`color-${option.value}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={addForm.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="100% Cotton" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Product Status */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Product Status</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={addForm.control}
                      name="inStock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">In Stock</FormLabel>
                            <FormDescription>
                              Product is available for purchase
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="isNew"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">New Product</FormLabel>
                            <FormDescription>
                              Show "NEW" badge on product
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Featured</FormLabel>
                            <FormDescription>
                              Show on homepage featured section
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={addProductMutation.isPending}
                >
                  {addProductMutation.isPending ? 'Adding...' : 'Add Product'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details of your product.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Summer Dress" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A detailed description of the product..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pricing</h3>
                  
                  <FormField
                    control={editForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regular Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="49.99" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price ($) (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="39.99" 
                            {...field}
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Categories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Categories</h3>
                  
                  <FormField
                    control={editForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoryOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="subCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!editForm.watch('category')}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getSubcategoryOptions(editForm.watch('category')).map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Images */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Images</h3>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter image URL"
                      value={tempImageUrl}
                      onChange={(e) => setTempImageUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={() => addImageUrl(editForm)}
                      variant="secondary"
                    >
                      Add
                    </Button>
                  </div>
                  
                  <FormField
                    control={editForm.control}
                    name="imageUrls"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                          {field.value?.map((url, index) => (
                            <div key={index} className="relative group">
                              <div className="h-24 w-full bg-gray-100 rounded overflow-hidden">
                                <img 
                                  src={url} 
                                  alt={`Product ${index + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImageUrl(editForm, index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {(!field.value || field.value.length === 0) && (
                            <div className="h-24 w-full bg-gray-100 rounded flex items-center justify-center text-gray-400">
                              <Image className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Variants */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Variants</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="sizes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sizes (optional)</FormLabel>
                          <div className="flex flex-wrap gap-2 border rounded-md p-3">
                            {sizeOptions.map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`edit-size-${option.value}`}
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    return checked
                                      ? field.onChange([...currentValue, option.value])
                                      : field.onChange(currentValue.filter((value) => value !== option.value))
                                  }}
                                />
                                <label
                                  htmlFor={`edit-size-${option.value}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="colors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Colors (optional)</FormLabel>
                          <div className="flex flex-wrap gap-2 border rounded-md p-3">
                            {colorOptions.map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`edit-color-${option.value}`}
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    return checked
                                      ? field.onChange([...currentValue, option.value])
                                      : field.onChange(currentValue.filter((value) => value !== option.value))
                                  }}
                                />
                                <label
                                  htmlFor={`edit-color-${option.value}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editForm.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="100% Cotton" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Product Status */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Product Status</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={editForm.control}
                      name="inStock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">In Stock</FormLabel>
                            <FormDescription>
                              Product is available for purchase
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="isNew"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">New Product</FormLabel>
                            <FormDescription>
                              Show "NEW" badge on product
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Featured</FormLabel>
                            <FormDescription>
                              Show on homepage featured section
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateProductMutation.isPending}
                >
                  {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the product "{selectedProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? 'Deleting...' : 'Delete Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Products;
