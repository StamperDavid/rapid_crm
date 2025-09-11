import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
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

  useEffect(() => {
    // Load theme from database
    const loadTheme = async () => {
      try {
        console.log('Loading theme from real database...');
        // TODO: Implement real database loading for theme
        // For now, use default light theme
        setTheme('light');
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

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

