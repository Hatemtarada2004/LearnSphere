import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils';

interface StarRatingProps {
  rating: number;
  totalRatings?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalRatings,
  size = 'md',
  interactive = false,
  onChange,
  className,
}) => {
  const [hovered, setHovered] = useState(0);

  const displayRating = interactive ? hovered || rating : rating;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="star-rating">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < Math.floor(displayRating);
          const partial = !filled && i < displayRating;

          return (
            <button
              key={i}
              type={interactive ? 'button' : undefined}
              className={cn(
                'relative',
                interactive && 'cursor-pointer hover:scale-110 transition-transform'
              )}
              onClick={() => interactive && onChange?.(i + 1)}
              onMouseEnter={() => interactive && setHovered(i + 1)}
              onMouseLeave={() => interactive && setHovered(0)}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  filled || (interactive && hovered > i)
                    ? 'fill-amber-400 text-amber-400'
                    : partial
                    ? 'text-amber-400'
                    : 'text-gray-300 dark:text-gray-600',
                  'transition-colors'
                )}
              />
              {partial && !interactive && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    'absolute inset-0 fill-amber-400 text-amber-400'
                  )}
                  style={{ clipPath: `inset(0 ${100 - (displayRating % 1) * 100}% 0 0)` }}
                />
              )}
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
          {rating.toFixed(1)}
        </span>
      )}
      {totalRatings !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({totalRatings.toLocaleString()})
        </span>
      )}
    </div>
  );
};
