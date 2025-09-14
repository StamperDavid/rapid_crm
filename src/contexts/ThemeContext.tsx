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
        
        // Try to load from database first
        try {
          const response = await fetch('/api/theme');
          if (response.ok) {
            const themeData = await response.json();
            setTheme(themeData.theme || 'light');
            if (themeData.customTheme) {
              setCustomTheme(themeData.customTheme);
              console.log('Custom theme loaded from database:', themeData.customTheme);
            }
            console.log('Theme loaded from database:', themeData);
            return;
          } else {
            console.log('Database theme response not ok:', response.status, response.statusText);
          }
        } catch (dbError) {
          console.log('Database theme loading failed, using localStorage fallback:', dbError);
        }
        
        // Fallback to localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme as Theme);
        } else {
          setTheme('light');
        }
        
        // Load custom theme settings
        const savedCustomTheme = localStorage.getItem('customTheme');
        if (savedCustomTheme) {
          try {
            const parsedCustomTheme = JSON.parse(savedCustomTheme);
            setCustomTheme(parsedCustomTheme);
            console.log('Custom theme loaded from localStorage:', parsedCustomTheme);
          } catch (parseError) {
            console.error('Error parsing custom theme from localStorage:', parseError);
          }
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
        
        // Save to database
        try {
          const response = await fetch('/api/theme', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              theme,
              customTheme
            }),
          });
          
          if (response.ok) {
            console.log('Theme saved to database successfully');
          } else {
            throw new Error(`Database save failed: ${response.status} ${response.statusText}`);
          }
        } catch (dbError) {
          console.log('Database theme saving failed, using localStorage fallback:', dbError);
          // Fallback to localStorage
          localStorage.setItem('theme', theme);
          if (customTheme) {
            localStorage.setItem('customTheme', JSON.stringify(customTheme));
            console.log('Custom theme saved to localStorage as fallback');
          }
        }
        
        // Apply theme to DOM
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
  }, [theme, customTheme]);

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
    
    // Save to localStorage as backup
    localStorage.setItem('customTheme', JSON.stringify(settings));
    console.log('ThemeContext - custom theme saved to localStorage');
    
    // Also save to database
    fetch('/api/theme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        theme,
        customTheme: settings
      }),
    }).then(() => {
      console.log('ThemeContext - custom theme saved to database');
    }).catch((error) => {
      console.error('ThemeContext - failed to save custom theme to database:', error);
    });
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

