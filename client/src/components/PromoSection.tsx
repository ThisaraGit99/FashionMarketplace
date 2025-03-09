import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const PromoSection = () => {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative rounded-xl overflow-hidden h-64 md:h-80 bg-gradient-to-r from-primary to-blue-600 flex items-center">
            <div className="absolute inset-0 opacity-20">
              <img 
                src="https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Summer collection" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-8 text-white">
              <h3 className="text-2xl md:text-3xl font-semibold mb-4 font-poppins">Summer Collection</h3>
              <p className="mb-6">Get up to 30% off on our new arrivals.</p>
              <Button
                asChild
                className="bg-white text-primary font-medium py-2 px-6 rounded-full hover:bg-gray-100 transition"
              >
                <Link href="/category/sale">Shop Now</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative rounded-xl overflow-hidden h-64 md:h-80 bg-gradient-to-r from-secondary to-red-500 flex items-center">
            <div className="absolute inset-0 opacity-20">
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Accessories collection" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-8 text-white">
              <h3 className="text-2xl md:text-3xl font-semibold mb-4 font-poppins">Accessories</h3>
              <p className="mb-6">Complete your look with our premium accessories.</p>
              <Button
                asChild
                className="bg-white text-secondary font-medium py-2 px-6 rounded-full hover:bg-gray-100 transition"
              >
                <Link href="/category/accessories">Shop Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
