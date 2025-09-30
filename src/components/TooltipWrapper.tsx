import React from 'react';
import UniversalTooltip from './UniversalTooltip';

interface TooltipWrapperProps {
  tooltip: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showIcon?: boolean;
  iconPosition?: 'before' | 'after' | 'overlay';
  disabled?: boolean;
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  tooltip,
  children,
  position = 'top',
  size = 'md',
  className = '',
  showIcon = false,
  iconPosition = 'after',
  disabled = false
}) => {
  if (disabled || !tooltip) {
    return <>{children}</>;
  }

  return (
    <UniversalTooltip
      content={tooltip}
      position={position}
      size={size}
      className={className}
      showIcon={showIcon}
      iconPosition={iconPosition}
    >
      {children}
    </UniversalTooltip>
  );
};

export default TooltipWrapper;
