import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  const { customTheme } = useTheme();

  // If custom logo is set, use it
  if (customTheme?.logoUrl) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="flex-shrink-0">
          <img
            src={customTheme.logoUrl}
            alt="Logo"
            style={{ 
              height: `${customTheme.logoHeight}px`,
              maxWidth: '200px'
            }}
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  // Default logo
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex-shrink-0">
        <div 
          className="h-8 w-8 rounded-lg flex items-center justify-center"
          style={{ 
            backgroundColor: customTheme?.primaryColor || '#3b82f6',
            borderRadius: `${customTheme?.borderRadius || 8}px`
          }}
        >
          <span className="text-white font-bold text-lg">R</span>
        </div>
      </div>
      <div className="ml-2">
        <h1 
          className="text-xl font-bold"
          style={{
            color: customTheme?.textPrimary || 'inherit',
            fontFamily: customTheme?.fontFamily || 'inherit',
            fontWeight: customTheme?.fontWeight || 'bold'
          }}
        >
          Rapid CRM
        </h1>
      </div>
    </div>
  );
};

export default Logo;
