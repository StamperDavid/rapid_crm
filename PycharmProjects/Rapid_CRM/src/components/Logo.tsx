import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex-shrink-0">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">R</span>
        </div>
      </div>
      <div className="ml-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Rapid CRM
        </h1>
      </div>
    </div>
  );
};

export default Logo;
