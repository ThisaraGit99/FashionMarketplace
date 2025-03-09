import { Link } from 'wouter';

interface CategoryCardProps {
  name: string;
  imageSrc: string;
  path: string;
}

const CategoryCard = ({ name, imageSrc, path }: CategoryCardProps) => {
  return (
    <Link href={path} className="group">
      <div className="relative rounded-lg overflow-hidden h-64 md:h-80">
        <img
          src={imageSrc}
          alt={`${name} category`}
          className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-semibold font-poppins">{name}</h3>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
