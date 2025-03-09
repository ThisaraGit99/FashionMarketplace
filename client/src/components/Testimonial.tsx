import { Star } from 'lucide-react';

interface TestimonialProps {
  rating: number;
  comment: string;
  customerName: string;
  customerType: string;
  customerImage: string;
}

const Testimonial = ({ 
  rating, 
  comment, 
  customerName, 
  customerType, 
  customerImage 
}: TestimonialProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex text-accent mb-4">
        {Array.from({ length: rating }).map((_, index) => (
          <Star key={index} className="fill-accent text-accent" />
        ))}
      </div>
      <p className="text-gray-600 mb-6">{comment}</p>
      <div className="flex items-center">
        <img src={customerImage} alt={customerName} className="w-10 h-10 rounded-full mr-4" />
        <div>
          <h4 className="font-medium">{customerName}</h4>
          <p className="text-gray-500 text-sm">{customerType}</p>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
