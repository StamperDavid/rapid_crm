import React from 'react';
import Tooltip from './Tooltip';
import { useTooltips } from '../contexts/TooltipContext';

interface EnhancedTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  maxWidth?: string;
}

const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 500,
  className = '',
  maxWidth = '300px'
}) => {
  const { tooltipsEnabled } = useTooltips();

  return (
    <Tooltip
      content={content}
      position={position}
      delay={delay}
      disabled={!tooltipsEnabled}
      className={className}
      maxWidth={maxWidth}
    >
      {children}
    </Tooltip>
  );
};

export default EnhancedTooltip;
