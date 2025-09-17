import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'rounded' | 'square';
  className?: string;
  showOnlineIndicator?: boolean;
  fallbackText?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'Agent',
  size = 'md',
  variant = 'circle',
  className = '',
  showOnlineIndicator = false,
  fallbackText
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const variantClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getFallbackText = () => {
    if (fallbackText) return fallbackText;
    return getInitials(name);
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} ${variantClasses[variant]} overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center`}>
        {src ? (
          <img
            src={src}
            alt={`${name} avatar`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center text-white font-semibold ${src ? 'hidden' : ''}`}>
          {getFallbackText()}
        </div>
      </div>
      
      {showOnlineIndicator && (
        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
      )}
    </div>
  );
};

export default Avatar;

