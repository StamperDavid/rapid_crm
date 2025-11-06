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
  const [theme, setTheme] = useState<Theme>('dark');
  // Initialize with sensible defaults immediately - no null state
  const [customTheme, setCustomTheme] = useState<CustomThemeSettings | null>({
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#10b981',
    backgroundColor: '#111827',
    surfaceColor: '#1f2937',
    cardColor: '#374151',
    textPrimary: '#f9fafb',
    textSecondary: '#d1d5db',
    textMuted: '#9ca3af',
    borderColor: '#374151',
    shadowColor: '#000000',
    borderRadius: 8,
    fontFamily: 'inherit',
    fontSize: 16,
    fontWeight: '400',
    logoUrl: '/uploads/logo_1757827373384.png',
    logoHeight: 48
  });

  // Force dark mode immediately on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  useEffect(() => {
    // Load theme from database
    const loadTheme = async () => {
      try {
        // Try to load from database first
        try {
          const API_BASE = import.meta.env.DEV ? '' : 'http://localhost:3001';
          const response = await fetch(`${API_BASE}/api/theme`);
          if (response.ok) {
            const themeData = await response.json();
            setTheme(themeData.theme || 'light');
            if (themeData.customTheme) {
              setCustomTheme(themeData.customTheme);
            }
            return;
          }
        } catch (dbError) {
          // Silently fall back to localStorage
        }
        
        // Fallback to localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme as Theme);
        } else {
          setTheme('dark');
        }
        
        // Load custom theme settings from localStorage if available
        const savedCustomTheme = localStorage.getItem('customTheme');
        if (savedCustomTheme) {
          try {
            const parsedCustomTheme = JSON.parse(savedCustomTheme);
            setCustomTheme(parsedCustomTheme);
          } catch (parseError) {
            console.error('Error parsing custom theme from localStorage:', parseError);
          }
        }
        // Note: Default theme is already set in initial state
      } catch (error) {
        console.error('Error loading theme:', error);
        setTheme('dark');
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    // Apply theme to DOM
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    
    // Save theme to database
    const saveTheme = async () => {
      try {
        // Save to database
        try {
          const API_BASE = import.meta.env.DEV ? '' : 'http://localhost:3001';
          const response = await fetch(`${API_BASE}/api/theme`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              theme,
              customTheme
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Database save failed: ${response.status}`);
          }
        } catch (dbError) {
          // Fallback to localStorage
          localStorage.setItem('theme', theme);
          if (customTheme) {
            localStorage.setItem('customTheme', JSON.stringify(customTheme));
          }
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
    setCustomTheme(settings);
    
    // Save to localStorage as backup
    localStorage.setItem('customTheme', JSON.stringify(settings));
    
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
    }).catch((error) => {
      console.error('Failed to save custom theme to database:', error);
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

