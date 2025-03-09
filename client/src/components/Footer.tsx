import { Link } from 'wouter';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 font-poppins">FashionHub</h3>
            <p className="text-gray-400 mb-4">Your one-stop destination for trendy fashion items at affordable prices.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 font-poppins">Shop</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/category/womens" className="hover:text-white transition">Women's Clothing</Link></li>
              <li><Link href="/category/mens" className="hover:text-white transition">Men's Clothing</Link></li>
              <li><Link href="/category/shoes" className="hover:text-white transition">Shoes</Link></li>
              <li><Link href="/category/accessories" className="hover:text-white transition">Accessories</Link></li>
              <li><Link href="/category/sale" className="hover:text-white transition">Sale</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 font-poppins">Customer Service</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition">Size Guide</a></li>
              <li><a href="#" className="hover:text-white transition">Track My Order</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 font-poppins">About Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} FashionHub. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png" 
                alt="Payment methods" 
                className="h-6" 
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
