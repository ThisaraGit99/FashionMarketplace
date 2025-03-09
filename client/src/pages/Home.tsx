import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Hero from '@/components/Hero';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import PromoSection from '@/components/PromoSection';
import Testimonial from '@/components/Testimonial';
import Newsletter from '@/components/Newsletter';

const Home = () => {
  // Fetch featured products
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['/api/products?featured=true'],
  });

  const categories = [
    {
      name: 'Women',
      imageSrc: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      path: '/category/womens'
    },
    {
      name: 'Men',
      imageSrc: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      path: '/category/mens'
    },
    {
      name: 'Shoes',
      imageSrc: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      path: '/category/shoes'
    },
    {
      name: 'Accessories',
      imageSrc: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      path: '/category/accessories'
    }
  ];

  const testimonials = [
    {
      rating: 5,
      comment: "I absolutely love the quality of the clothes I received. The fabric feels premium and the fit is perfect. Will definitely be ordering more!",
      customerName: "Sarah Johnson",
      customerType: "Loyal Customer",
      customerImage: "https://randomuser.me/api/portraits/women/43.jpg"
    },
    {
      rating: 4,
      comment: "Fast shipping and excellent customer service. I had a question about sizing and the team responded within minutes. The dress fits perfectly!",
      customerName: "Michael Thompson",
      customerType: "New Customer",
      customerImage: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      rating: 5,
      comment: "The accessories I ordered were even better than expected. Great attention to detail and the packaging was beautiful. Will be shopping here again!",
      customerName: "Emma Rodriguez",
      customerType: "Fashion Blogger",
      customerImage: "https://randomuser.me/api/portraits/women/65.jpg"
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Categories Section */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center font-poppins">Shop by Category</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <CategoryCard 
                key={category.name}
                name={category.name}
                imageSrc={category.imageSrc}
                path={category.path}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold font-poppins">Featured Products</h2>
            <div className="hidden md:flex space-x-2">
              <Button variant="outline" size="icon" className="border border-border rounded-md p-2 hover:bg-gray-100">
                <ChevronLeft className="text-textColor w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="border border-border rounded-md p-2 hover:bg-gray-100">
                <ChevronRight className="text-textColor w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden h-80 animate-pulse">
                  <div className="w-full h-64 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Button
              asChild
              variant="outline"
              className="border-2 border-primary text-primary font-semibold py-2 px-6 rounded-full hover:bg-primary hover:text-white transition"
            >
              <Link href="/category/all">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Promo Section */}
      <PromoSection />

      {/* Testimonials Section */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-center font-poppins">What Our Customers Say</h2>
          <p className="text-gray-600 text-center mb-10">Read reviews from people who have shopped with us</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Testimonial
                key={index}
                rating={testimonial.rating}
                comment={testimonial.comment}
                customerName={testimonial.customerName}
                customerType={testimonial.customerType}
                customerImage={testimonial.customerImage}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
};

export default Home;
