import React from 'react';
import TooltipWrapper from './TooltipWrapper';

interface WithTooltipProps {
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  tooltipSize?: 'sm' | 'md' | 'lg' | 'xl';
  showTooltipIcon?: boolean;
  tooltipIconPosition?: 'before' | 'after' | 'overlay';
  children: React.ReactNode;
  className?: string;
}

const WithTooltip: React.FC<WithTooltipProps> = ({
  tooltip,
  tooltipPosition = 'top',
  tooltipSize = 'md',
  showTooltipIcon = false,
  tooltipIconPosition = 'after',
  children,
  className = ''
}) => {
  if (!tooltip) {
    return <>{children}</>;
  }

  return (
    <TooltipWrapper
      tooltip={tooltip}
      position={tooltipPosition}
      size={tooltipSize}
      className={className}
      showIcon={showTooltipIcon}
      iconPosition={tooltipIconPosition}
    >
      {children}
    </TooltipWrapper>
  );
};

export default WithTooltip;
