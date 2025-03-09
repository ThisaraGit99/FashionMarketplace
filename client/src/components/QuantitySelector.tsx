import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
}

const QuantitySelector = ({
  quantity,
  onIncrease,
  onDecrease,
  onChange,
  min = 1,
  max,
  compact = false
}: QuantitySelectorProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) return;
    
    if (onChange) {
      if (max && value > max) {
        onChange(max);
      } else if (value < min) {
        onChange(min);
      } else {
        onChange(value);
      }
    }
  };

  return (
    <div className={`flex border border-gray-300 rounded overflow-hidden ${compact ? 'h-6' : ''}`}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`px-2 bg-gray-100 border-r border-gray-300 hover:bg-gray-200 rounded-none ${
          compact ? 'h-6 w-6 p-0' : ''
        }`}
        onClick={onDecrease}
        disabled={quantity <= min}
      >
        <Minus className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
      </Button>
      <Input
        type="number"
        value={quantity}
        min={min}
        max={max}
        onChange={handleInputChange}
        className={`w-12 text-center border-none focus:outline-none focus:ring-0 ${
          compact ? 'h-6 p-0 text-xs' : ''
        }`}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`px-2 bg-gray-100 border-l border-gray-300 hover:bg-gray-200 rounded-none ${
          compact ? 'h-6 w-6 p-0' : ''
        }`}
        onClick={onIncrease}
        disabled={max !== undefined && quantity >= max}
      >
        <Plus className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
      </Button>
    </div>
  );
};

export default QuantitySelector;
