import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send the email to an API
    toast({
      title: "Thank you for subscribing!",
      description: "You'll receive our newsletter with the latest trends and offers.",
    });
    
    setEmail('');
  };

  return (
    <section className="py-12 px-4 bg-primary">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 font-poppins">
            Subscribe to Our Newsletter
          </h2>
          <p className="mb-6">Stay updated with the latest trends and exclusive offers!</p>
          <form 
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            onSubmit={handleSubmit}
          >
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-md focus:outline-none text-textColor"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              className="bg-secondary hover:bg-secondary/90 text-white font-medium py-3 px-6 rounded-md transition"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
