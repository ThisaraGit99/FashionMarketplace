import { useState } from 'react';
import { Link } from 'wouter';
import { Heart, ShoppingCart, Star, StarHalf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  subCategory: string;
  imageUrls: string[];
  sizes?: string[];
  colors?: string[];
  material?: string;
  inStock: boolean;
  isNew: boolean;
  isFeatured: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Mock data for the reviews (in a real application, this would come from the API)
  const reviewCount = 24;
  const rating = 4.5;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-accent text-accent w-3 h-3" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-accent text-accent w-3 h-3" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="text-accent w-3 h-3" />);
    }
    
    return stars;
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to your cart",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      await addToCart({
        productId: product.id,
        quantity: 1,
        // If product has sizes or colors, we could add a modal to select these
        // For simplicity, we're using the first available size and color
        size: product.sizes ? product.sizes[0] : undefined,
        color: product.colors ? product.colors[0] : undefined
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="relative">
        <Link href={`/product/${product.id}`}>
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            className="w-full h-64 object-cover"
          />
        </Link>
        {product.isNew && (
          <Badge 
            className="absolute top-3 left-3 bg-accent text-white font-semibold px-2 py-1"
          >
            NEW
          </Badge>
        )}
        {product.salePrice && (
          <Badge 
            className="absolute top-3 left-3 bg-secondary text-white font-semibold px-2 py-1"
          >
            SALE
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
        >
          <Heart className="w-4 h-4 text-textColor" />
        </Button>
      </div>
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-textColor mb-1 truncate">{product.name}</h3>
        </Link>
        <div className="flex items-center mb-2">
          <div className="flex text-accent">
            {renderStars(rating)}
          </div>
          <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            {product.salePrice ? (
              <>
                <span className="font-semibold text-secondary">${product.salePrice.toFixed(2)}</span>
                <span className="text-sm text-gray-500 line-through ml-2">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="font-semibold text-textColor">${product.price.toFixed(2)}</span>
            )}
          </div>
          <Button
            variant="primary"
            size="icon"
            className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-primary/90 transition"
            onClick={handleAddToCart}
            disabled={loading}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
