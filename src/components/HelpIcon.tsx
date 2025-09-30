import React from 'react';
import Tooltip from './Tooltip';

interface HelpIconProps {
  content: string | React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const HelpIcon: React.FC<HelpIconProps> = ({
  content,
  size = 'md',
  position = 'top',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  };

  return (
    <Tooltip content={content} position={position} size="lg">
      <div className={`inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full cursor-help ${sizeClasses[size]} ${className}`}>
        <span className="text-blue-600 dark:text-blue-400 font-bold">?</span>
      </div>
    </Tooltip>
  );
};

export default HelpIcon;
