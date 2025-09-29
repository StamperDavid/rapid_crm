/**
 * Dynamic Theme Manager for Sports Funder
 * Allows real-time theme customization through the admin theme editor
 */

class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.applyTheme(this.currentTheme);
    }

    // Load theme from localStorage or default
    loadTheme() {
        const savedTheme = localStorage.getItem('sportsFunderTheme');
        if (savedTheme) {
            return JSON.parse(savedTheme);
        }
        
        // Default theme
        return {
            name: 'Old Glory Dark',
            colors: {
                primary: '#3b82f6',
                secondary: '#10b981',
                accent: '#f59e0b',
                background: '#0f172a',
                surface: '#1e293b',
                surfaceVariant: '#334155',
                text: '#f8fafc',
                textSecondary: '#94a3b8',
                border: '#334155',
                borderVariant: '#475569'
            },
            typography: {
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Roboto", sans-serif',
                fontSize: {
                    xs: '0.75rem',
                    sm: '0.875rem',
                    base: '1rem',
                    lg: '1.125rem',
                    xl: '1.25rem',
                    '2xl': '1.5rem',
                    '3xl': '1.875rem',
                    '4xl': '2.25rem'
                }
            },
            spacing: {
                xs: '0.25rem',
                sm: '0.5rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem',
                '2xl': '3rem'
            },
            borderRadius: {
                sm: '0.375rem',
                md: '0.5rem',
                lg: '0.75rem',
                xl: '1rem'
            },
            shadows: {
                sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }
        };
    }

    // Save theme to localStorage
    saveTheme(theme) {
        localStorage.setItem('sportsFunderTheme', JSON.stringify(theme));
        this.currentTheme = theme;
    }

    // Apply theme to the page
    applyTheme(theme) {
        const root = document.documentElement;
        
        // Apply color variables
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        // Apply typography
        Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
            root.style.setProperty(`--font-size-${key}`, value);
        });
        root.style.setProperty('--font-family', theme.typography.fontFamily);

        // Apply spacing
        Object.entries(theme.spacing).forEach(([key, value]) => {
            root.style.setProperty(`--spacing-${key}`, value);
        });

        // Apply border radius
        Object.entries(theme.borderRadius).forEach(([key, value]) => {
            root.style.setProperty(`--border-radius-${key}`, value);
        });

        // Apply shadows
        Object.entries(theme.shadows).forEach(([key, value]) => {
            root.style.setProperty(`--shadow-${key}`, value);
        });

        // Apply theme name
        root.setAttribute('data-theme', theme.name.toLowerCase().replace(/\s+/g, '-'));
    }

    // Update theme in real-time
    updateTheme(updates) {
        const newTheme = { ...this.currentTheme, ...updates };
        this.saveTheme(newTheme);
        this.applyTheme(newTheme);
    }

    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Reset to default theme
    resetToDefault() {
        const defaultTheme = this.loadTheme();
        this.saveTheme(defaultTheme);
        this.applyTheme(defaultTheme);
    }

    // Export theme
    exportTheme() {
        return JSON.stringify(this.currentTheme, null, 2);
    }

    // Import theme
    importTheme(themeJson) {
        try {
            const theme = JSON.parse(themeJson);
            this.saveTheme(theme);
            this.applyTheme(theme);
            return true;
        } catch (error) {
            console.error('Invalid theme JSON:', error);
            return false;
        }
    }
}

// Global theme manager instance
window.themeManager = new ThemeManager();

// CSS Variables for dynamic theming
const themeCSS = `
:root {
    /* Colors */
    --color-primary: #3b82f6;
    --color-secondary: #10b981;
    --color-accent: #f59e0b;
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-surface-variant: #334155;
    --color-text: #f8fafc;
    --color-text-secondary: #94a3b8;
    --color-border: #334155;
    --color-border-variant: #475569;

    /* Typography */
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;

    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;

    /* Border Radius */
    --border-radius-sm: 0.375rem;
    --border-radius-md: 0.5rem;
    --border-radius-lg: 0.75rem;
    --border-radius-xl: 1rem;

    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Base styles using CSS variables */
body {
    font-family: var(--font-family);
    background: var(--color-background);
    color: var(--color-text);
    line-height: 1.6;
}

.header {
    background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-variant) 100%);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: var(--spacing-xl);
    text-align: center;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    margin-bottom: var(--spacing-xl);
}

.header h1 {
    color: var(--color-text);
    font-size: var(--font-size-4xl);
    margin-bottom: var(--spacing-sm);
    font-weight: 700;
}

.header p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-lg);
}

.panel, .content-panel, .stat-card {
    background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-variant) 100%);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
}

.panel h3, .content-panel h3 {
    color: var(--color-text);
    margin-bottom: var(--spacing-lg);
    font-size: var(--font-size-2xl);
    font-weight: 600;
    border-bottom: 2px solid var(--color-primary);
    padding-bottom: var(--spacing-sm);
}

.stat-value {
    font-size: var(--font-size-4xl);
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: var(--spacing-sm);
}

.stat-label {
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    font-weight: 500;
}

.btn {
    background: linear-gradient(135deg, var(--color-primary), #1d4ed8);
    color: white;
    border: none;
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--border-radius-md);
    cursor: pointer;
    font-size: var(--font-size-base);
    font-weight: 600;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-block;
    box-shadow: var(--shadow-sm);
}

.btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px 0 rgba(59, 130, 246, 0.4);
}

.btn-success {
    background: linear-gradient(135deg, var(--color-secondary), #059669);
}

.btn-warning {
    background: linear-gradient(135deg, var(--color-accent), #d97706);
}

.btn-danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

.btn-secondary {
    background: linear-gradient(135deg, #6b7280, #4b5563);
}

/* Form elements */
input, textarea, select {
    padding: var(--spacing-sm);
    border: 2px solid var(--color-border-variant);
    border-radius: var(--border-radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: var(--font-size-base);
}

input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--color-primary);
}

/* Cards */
.card, .company-card, .sponsor-card, .school-card {
    background: var(--color-surface-variant);
    border: 1px solid var(--color-border-variant);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-lg);
    color: var(--color-text);
}

.card h3, .company-name, .sponsor-name, .school-name {
    color: var(--color-text);
    font-weight: 600;
}

.card p, .company-details, .sponsor-details, .school-details {
    color: var(--color-text-secondary);
}

/* Loading and error states */
.loading {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-secondary);
}

.error {
    background: #ef4444;
    color: white;
    padding: var(--spacing-md);
    border-radius: var(--border-radius-sm);
    margin: var(--spacing-lg) 0;
}
`;

// Inject theme CSS
const style = document.createElement('style');
style.textContent = themeCSS;
document.head.appendChild(style);
