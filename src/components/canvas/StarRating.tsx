import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md';
  readonly?: boolean;
}

export function StarRating({
  rating,
  onChange,
  size = 'sm',
  readonly = false,
}: StarRatingProps) {
  const handleClick = (index: number) => {
    if (readonly || !onChange) return;
    // If clicking the same star, toggle it off
    onChange(rating === index + 1 ? 0 : index + 1);
  };

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleClick(index)}
          disabled={readonly}
          className={cn(
            'transition-colors',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          )}
        >
          <Star
            className={cn(
              iconSize,
              index < rating
                ? 'fill-accent text-accent'
                : 'fill-muted text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  );
}
