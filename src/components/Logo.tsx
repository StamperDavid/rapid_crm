import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  const { customTheme } = useTheme();
  const [isThemeLoaded, setIsThemeLoaded] = React.useState(false);

  // Debug logging
  console.log('Logo component - customTheme:', customTheme);
  console.log('Logo component - logoUrl:', customTheme?.logoUrl);
  console.log('Logo component - logoHeight:', customTheme?.logoHeight);

  // Wait for theme to load
  React.useEffect(() => {
    if (customTheme !== null) {
      setIsThemeLoaded(true);
    }
  }, [customTheme]);

  // Show loading state while theme is loading
  if (!isThemeLoaded) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        </div>
        <div className="ml-2">
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // If custom logo is set, use it
  if (customTheme?.logoUrl) {
    console.log('Using custom logo:', customTheme.logoUrl);
    return (
      <div className={`flex items-center ${className}`}>
        <div className="flex-shrink-0">
          <img
            src={customTheme.logoUrl}
            alt="Rapid CRM Logo"
            style={{ 
              height: `${customTheme.logoHeight || 32}px`,
              maxWidth: '200px'
            }}
            className="object-contain"
            onError={(e) => {
              console.error('Logo image failed to load:', customTheme.logoUrl);
              console.error('Error event:', e);
              // Fall back to default logo on error
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Logo image loaded successfully:', customTheme.logoUrl);
            }}
          />
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
