import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface CustomThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  cardColor: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderColor: string;
  shadowColor: string;
  borderRadius: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  logoUrl: string;
  logoHeight: number;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  customTheme: CustomThemeSettings | null;
  updateCustomTheme: (settings: CustomThemeSettings) => void;
  applyCustomTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [customTheme, setCustomTheme] = useState<CustomThemeSettings | null>(null);

  useEffect(() => {
    // Load theme from database
    const loadTheme = async () => {
      try {
        console.log('Loading theme from real database...');
        // TODO: Implement real database loading for theme
        // For now, use default light theme
        setTheme('light');
        
        // Load custom theme settings
        const savedCustomTheme = localStorage.getItem('customTheme');
        if (savedCustomTheme) {
          setCustomTheme(JSON.parse(savedCustomTheme));
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        setTheme('light');
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    // Save theme to database
    const saveTheme = async () => {
      try {
        console.log('Saving theme to real database...');
        // TODO: Implement real database saving for theme
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    };
    saveTheme();
  }, [theme]);

  useEffect(() => {
    // Apply custom theme when it changes
    if (customTheme) {
      applyCustomThemeToDOM(customTheme);
    }
  }, [customTheme]);

  const applyCustomThemeToDOM = (settings: CustomThemeSettings) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', settings.primaryColor);
    root.style.setProperty('--color-secondary', settings.secondaryColor);
    root.style.setProperty('--color-accent', settings.accentColor);
    root.style.setProperty('--color-background', settings.backgroundColor);
    root.style.setProperty('--color-surface', settings.surfaceColor);
    root.style.setProperty('--color-card', settings.cardColor);
    root.style.setProperty('--color-text-primary', settings.textPrimary);
    root.style.setProperty('--color-text-secondary', settings.textSecondary);
    root.style.setProperty('--color-text-muted', settings.textMuted);
    root.style.setProperty('--color-border', settings.borderColor);
    root.style.setProperty('--color-shadow', settings.shadowColor);
    root.style.setProperty('--border-radius', `${settings.borderRadius}px`);
    root.style.setProperty('--font-family', settings.fontFamily);
    root.style.setProperty('--font-size', `${settings.fontSize}px`);
    root.style.setProperty('--font-weight', settings.fontWeight);
    root.style.setProperty('--logo-height', `${settings.logoHeight}px`);
    
    // Apply font family to body
    document.body.style.fontFamily = settings.fontFamily;
    document.body.style.fontSize = `${settings.fontSize}px`;
    document.body.style.fontWeight = settings.fontWeight;
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const updateCustomTheme = (settings: CustomThemeSettings) => {
    console.log('ThemeContext - updating custom theme:', settings);
    console.log('ThemeContext - logo URL:', settings.logoUrl);
    setCustomTheme(settings);
    localStorage.setItem('customTheme', JSON.stringify(settings));
    console.log('ThemeContext - custom theme saved to localStorage');
  };

  const applyCustomTheme = () => {
    if (customTheme) {
      applyCustomThemeToDOM(customTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      customTheme, 
      updateCustomTheme, 
      applyCustomTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

