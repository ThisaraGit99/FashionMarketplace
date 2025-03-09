import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <div className="bg-gradient-to-r from-primary to-blue-700 rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 py-12 px-8 md:px-12 flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-poppins mb-4">
                Summer Collection 2023
              </h1>
              <p className="text-white text-lg mb-8">
                Discover the latest trends in fashion and get up to 50% off on selected items.
              </p>
              <div>
                <Button
                  asChild
                  className="bg-white text-primary font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition"
                >
                  <Link href="/category/sale">Shop Now</Link>
                </Button>
              </div>
            </div>
            <div className="w-full md:w-1/2 hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Summer fashion collection"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
