import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Star, StarHalf, Truck, RotateCcw, Heart, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import QuantitySelector from '@/components/QuantitySelector';
import ReviewForm from '@/components/ReviewForm';
import { useCart } from '@/hooks/useCart';

const ProductDetail = () => {
  const [match, params] = useRoute('/product/:id');
  const productId = parseInt(params?.id || '0');
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');

  // Fetch product details
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: productId > 0,
  });

  // Fetch product reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: productId > 0,
  });

  // Set default selections when product data is loaded
  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.imageUrls && product.imageUrls.length > 0) {
        setSelectedImage(product.imageUrls[0]);
      }
    }
  }, [product]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Please sign in',
        description: 'You need to sign in to add items to your cart',
        variant: 'destructive',
      });
      return;
    }

    if (product.sizes && !selectedSize) {
      toast({
        title: 'Please select a size',
        description: 'You need to select a size before adding to cart',
        variant: 'destructive',
      });
      return;
    }

    if (product.colors && !selectedColor) {
      toast({
        title: 'Please select a color',
        description: 'You need to select a color before adding to cart',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addToCart({
        productId,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  // Calculate average rating
  const averageRating = reviews?.length
    ? reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length
    : 0;

  if (isLoadingProduct) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <div className="mb-4 bg-gray-200 h-96 rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 w-full bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="h-10 bg-gray-200 w-3/4 mb-4 rounded"></div>
              <div className="h-6 bg-gray-200 w-1/2 mb-4 rounded"></div>
              <div className="h-8 bg-gray-200 w-1/4 mb-6 rounded"></div>
              <div className="h-20 bg-gray-200 w-full mb-6 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
                <div className="flex space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-200"></div>
                  ))}
                </div>
                <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
                <div className="flex space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 w-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="h-12 bg-gray-200 w-full mt-6 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <a href="/">Back to Home</a>
        </Button>
      </div>
    );
  }

  // Render stars for rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-accent text-accent" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-accent text-accent" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-8">
            <nav className="flex mb-8" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a href="/" className="text-sm text-gray-500 hover:text-primary">Home</a>
                </li>
                <li>
                  <div className="flex items-center">
                    <i className="fas fa-chevron-right text-xs text-gray-400 mx-2"></i>
                    <a href={`/category/${product.category}`} className="text-sm text-gray-500 hover:text-primary">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </a>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <i className="fas fa-chevron-right text-xs text-gray-400 mx-2"></i>
                    <a href={`/category/${product.category}/${product.subCategory}`} className="text-sm text-gray-500 hover:text-primary">
                      {product.subCategory.charAt(0).toUpperCase() + product.subCategory.slice(1)}
                    </a>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <i className="fas fa-chevron-right text-xs text-gray-400 mx-2"></i>
                    <span className="text-sm text-gray-700">{product.name}</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex flex-col md:flex-row">
              {/* Product Images */}
              <div className="w-full md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <div className="mb-4">
                  <img 
                    src={selectedImage || product.imageUrls[0]} 
                    alt={`${product.name} - Main`}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.imageUrls.map((image: string, index: number) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`Product thumbnail ${index + 1}`}
                      className={`h-24 w-full object-cover rounded-lg cursor-pointer ${
                        selectedImage === image ? 'border-2 border-primary' : ''
                      }`}
                      onClick={() => setSelectedImage(image)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Product Info */}
              <div className="w-full md:w-1/2">
                <div className="mb-6">
                  <h1 className="text-2xl md:text-3xl font-semibold font-poppins mb-2">{product.name}</h1>
                  <div className="flex items-center mb-4">
                    <div className="flex text-accent">
                      {renderStars(averageRating)}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      {averageRating.toFixed(1)} ({reviews?.length || 0} reviews)
                    </span>
                  </div>
                  <div className="mb-4">
                    {product.salePrice ? (
                      <>
                        <span className="text-2xl font-bold text-secondary">${product.salePrice.toFixed(2)}</span>
                        <span className="text-lg text-gray-500 line-through ml-2">${product.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-textColor">${product.price.toFixed(2)}</span>
                    )}
                    <span className="text-sm text-gray-500 ml-2">Tax included</span>
                  </div>
                  <p className="text-gray-600 mb-6">{product.description}</p>
                </div>
                
                <div className="mb-6">
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Color</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color: string, index: number) => {
                          // Map color names to tailwind color classes
                          const colorMap: Record<string, string> = {
                            "Blue": "bg-blue-500",
                            "Red": "bg-red-400",
                            "Green": "bg-green-500",
                            "Yellow": "bg-yellow-400",
                            "Black": "bg-black",
                            "White": "bg-white border border-gray-300",
                            "Gray": "bg-gray-500",
                            "Navy": "bg-blue-800",
                            "Purple": "bg-purple-500",
                            "Brown": "bg-amber-700",
                            "Burgundy": "bg-red-800",
                          };
                          
                          const bgClass = colorMap[color] || "bg-gray-500";
                          
                          return (
                            <button
                              key={index}
                              className={`w-8 h-8 rounded-full ${bgClass} ${
                                selectedColor === color 
                                  ? 'border-2 border-white ring-2 ring-primary scale-110' 
                                  : 'border-2 border-white shadow-sm hover:scale-110'
                              } transition`}
                              onClick={() => setSelectedColor(color)}
                              aria-label={`Select ${color} color`}
                            ></button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Size</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size: string, index: number) => (
                          <button
                            key={index}
                            className={`h-10 px-3 rounded border ${
                              selectedSize === size
                                ? 'bg-primary bg-opacity-10 border-primary text-primary'
                                : 'border-gray-300 text-textColor hover:border-primary hover:text-primary'
                            } text-center text-sm transition`}
                            onClick={() => setSelectedSize(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="mr-4">
                    <QuantitySelector 
                      quantity={quantity}
                      onIncrease={() => setQuantity(prev => prev + 1)}
                      onDecrease={() => setQuantity(prev => Math.max(1, prev - 1))}
                      onChange={(value) => setQuantity(value)}
                      min={1}
                      max={10}
                    />
                  </div>
                  <Button
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-white py-3 px-6 rounded font-medium flex items-center justify-center"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                </div>
                
                <div className="flex space-x-4 mb-6">
                  <Button variant="ghost" className="flex items-center text-gray-500 hover:text-primary">
                    <Heart className="mr-2 h-5 w-5" />
                    Add to Wishlist
                  </Button>
                  <Button variant="ghost" className="flex items-center text-gray-500 hover:text-primary">
                    <Share2 className="mr-2 h-5 w-5" />
                    Share
                  </Button>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center space-x-8 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Truck className="mr-2 h-5 w-5" />
                      Free shipping over $99
                    </div>
                    <div className="flex items-center text-gray-600">
                      <RotateCcw className="mr-2 h-5 w-5" />
                      30-day return policy
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Tabs */}
            <div className="mt-12">
              <Tabs defaultValue="description">
                <TabsList className="border-b border-gray-200 w-full justify-start">
                  <TabsTrigger value="description" className="text-base">Description</TabsTrigger>
                  <TabsTrigger value="details" className="text-base">Details</TabsTrigger>
                  <TabsTrigger value="reviews" className="text-base">Reviews ({reviews?.length || 0})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="py-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Product Description</h3>
                    <div className="space-y-4 text-gray-600">
                      <p>{product.description}</p>
                      {product.material && (
                        <p>Made from {product.material} for maximum comfort and durability.</p>
                      )}
                      <ul className="list-disc pl-5 space-y-2">
                        {product.material && <li>{product.material}</li>}
                        {product.sizes && <li>Available in multiple sizes: {product.sizes.join(', ')}</li>}
                        {product.colors && <li>Available in colors: {product.colors.join(', ')}</li>}
                        <li>Machine washable</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="py-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Product Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Specifications</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li><span className="font-medium">Material:</span> {product.material || 'N/A'}</li>
                          <li><span className="font-medium">Category:</span> {product.category}</li>
                          <li><span className="font-medium">Subcategory:</span> {product.subCategory}</li>
                          {product.sizes && <li><span className="font-medium">Available Sizes:</span> {product.sizes.join(', ')}</li>}
                          {product.colors && <li><span className="font-medium">Available Colors:</span> {product.colors.join(', ')}</li>}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Care Instructions</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>Machine wash cold with similar colors</li>
                          <li>Do not bleach</li>
                          <li>Tumble dry low</li>
                          <li>Cool iron if needed</li>
                          <li>Do not dry clean</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="py-6">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium">Customer Reviews</h3>
                      <div className="flex items-center">
                        <div className="flex text-accent mr-2">
                          {renderStars(averageRating)}
                        </div>
                        <span className="text-sm">
                          {averageRating.toFixed(1)} out of 5 ({reviews?.length || 0} reviews)
                        </span>
                      </div>
                    </div>
                    
                    {isLoadingReviews ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse border-b border-gray-200 pb-4">
                            <div className="flex items-center mb-2">
                              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                              <div>
                                <div className="h-4 bg-gray-200 w-24 mb-1 rounded"></div>
                                <div className="h-3 bg-gray-200 w-16 rounded"></div>
                              </div>
                              <div className="ml-auto">
                                <div className="h-4 bg-gray-200 w-20 rounded"></div>
                              </div>
                            </div>
                            <div className="h-4 bg-gray-200 w-full rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 w-2/3 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review: any) => (
                          <div key={review.id} className="border-b border-gray-200 pb-6">
                            <div className="flex items-start">
                              <div className="mr-4">
                                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-medium">
                                  {review.userId}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                  <h4 className="font-medium">Customer {review.userId}</h4>
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex text-accent mb-2">
                                  {renderStars(review.rating)}
                                </div>
                                <p className="text-gray-600">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <p>No reviews yet. Be the first to review this product!</p>
                      </div>
                    )}
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">Write a Review</h3>
                      <ReviewForm productId={productId} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
