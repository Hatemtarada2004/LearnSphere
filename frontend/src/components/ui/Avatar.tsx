import React from 'react';
import { cn, getAvatarUrl, getInitials } from '../../utils';

interface AvatarProps {
  firstName: string;
  lastName: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export const Avatar: React.FC<AvatarProps> = ({
  firstName,
  lastName,
  avatar,
  size = 'md',
  className,
}) => {
  const url = getAvatarUrl(avatar || '', firstName, lastName);
  const initials = getInitials(firstName, lastName);

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-semibold flex-shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {avatar ? (
        <img
          src={url}
          alt={`${firstName} ${lastName}`}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
