import React, { createContext, useContext, useState, useEffect } from 'react';

interface TooltipContextType {
  tooltipsEnabled: boolean;
  toggleTooltips: () => void;
  setTooltipsEnabled: (enabled: boolean) => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const useTooltips = () => {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error('useTooltips must be used within a TooltipProvider');
  }
  return context;
};

interface TooltipProviderProps {
  children: React.ReactNode;
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  const [tooltipsEnabled, setTooltipsEnabled] = useState(() => {
    // Load from localStorage or default to true
    const saved = localStorage.getItem('tooltipsEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleTooltips = () => {
    setTooltipsEnabled(prev => !prev);
  };

  // Save to localStorage whenever tooltipsEnabled changes
  useEffect(() => {
    localStorage.setItem('tooltipsEnabled', JSON.stringify(tooltipsEnabled));
  }, [tooltipsEnabled]);

  const value = {
    tooltipsEnabled,
    toggleTooltips,
    setTooltipsEnabled
  };

  return (
    <TooltipContext.Provider value={value}>
      {children}
    </TooltipContext.Provider>
  );
};
