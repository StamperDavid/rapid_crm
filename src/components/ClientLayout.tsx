import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      {/* Client Portal Header - Clean and Simple */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Logo variant={theme} />
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Rapid CRM Client Portal
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your secure business dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle - Simple for clients */}
              <button
                onClick={() => {
                  // Simple theme toggle for clients
                  const newTheme = theme === 'light' ? 'dark' : 'light';
                  document.documentElement.classList.toggle('dark');
                  localStorage.setItem('theme', newTheme);
                }}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              
              {/* Security Indicator */}
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Secure Connection
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - No Sidebar, No Admin Tools */}
      <main className="flex-1">
        {children}
      </main>

      {/* Simple Footer - Fixed to bottom */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 Rapid CRM. All rights reserved.
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Contact your account manager.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;