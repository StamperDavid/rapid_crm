import React from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  size = 'md',
  className = '',
  delay = 200
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const toggleTooltip = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;
      
      switch (position) {
        case 'top':
          top = rect.top - 10;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 10;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 10;
          break;
      }
      
      setTooltipPosition({ top, left });
    }
    setIsVisible(!isVisible);
  };

  // Close tooltip when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible]);

  const sizeClasses = {
    sm: 'w-48 text-xs',
    md: 'w-64 text-sm',
    lg: 'w-80 text-sm',
    xl: 'w-96 text-sm'
  };

  const arrowClasses = {
    top: 'absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900',
    bottom: 'absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900',
    left: 'absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900',
    right: 'absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900'
  };

  const getTransform = () => {
    switch (position) {
      case 'top':
      case 'bottom':
        return 'translateX(-50%)';
      case 'left':
        return 'translateX(-100%) translateY(-50%)';
      case 'right':
        return 'translateY(-50%)';
      default:
        return 'translateX(-50%)';
    }
  };

  return (
    <>
      <div 
        ref={triggerRef}
        className={`relative inline-block cursor-pointer ${className}`}
        onClick={toggleTooltip}
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div 
          className={`fixed z-[99999] bg-gray-900 text-white rounded-lg p-3 opacity-100 transition-opacity duration-200 shadow-lg ${sizeClasses[size]}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: getTransform()
          }}
        >
          {typeof content === 'string' ? (
            <div className="whitespace-pre-wrap">{content}</div>
          ) : (
            content
          )}
          <div className={arrowClasses[position]}></div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;