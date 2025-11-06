import React from 'react';
import HelpIcon from './HelpIcon';

interface UniversalTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showIcon?: boolean;
  iconPosition?: 'before' | 'after' | 'overlay';
  trigger?: 'hover' | 'click' | 'focus';
}

const UniversalTooltip: React.FC<UniversalTooltipProps> = ({
  content,
  children,
  position = 'top',
  size = 'md',
  className = '',
  showIcon = false,
  iconPosition = 'after',
  trigger = 'click'
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible]);

  if (showIcon) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {iconPosition === 'before' && (
          <HelpIcon content={content} size="sm" position={position} />
        )}
        {children}
        {iconPosition === 'after' && (
          <HelpIcon content={content} size="sm" position={position} />
        )}
        {iconPosition === 'overlay' && (
          <div className="relative">
            {children}
            <div className="absolute -top-1 -right-1">
              <HelpIcon content={content} size="sm" position={position} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={wrapperRef}
      className={`relative ${className}`}
      onClick={() => setIsVisible(!isVisible)}
    >
      {children}
      <div className={`absolute z-50 bg-gray-900 text-white rounded-lg p-3 pointer-events-none transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${
        size === 'sm' ? 'w-48 text-xs' : 
        size === 'md' ? 'w-64 text-sm' : 
        size === 'lg' ? 'w-80 text-sm' : 
        'w-96 text-sm'
      } ${
        position === 'top' ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-2' :
        position === 'bottom' ? 'top-full left-1/2 transform -translate-x-1/2 mt-2' :
        position === 'left' ? 'right-full top-1/2 transform -translate-y-1/2 mr-2' :
        'left-full top-1/2 transform -translate-y-1/2 ml-2'
      }`}>
        <div className="whitespace-pre-wrap">{content}</div>
        <div className={`absolute ${
          position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900' :
          position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900' :
          position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900' :
          'right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900'
        }`}></div>
      </div>
    </div>
  );
};

export default UniversalTooltip;
