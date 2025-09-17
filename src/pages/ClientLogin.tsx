import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  TruckIcon, 
  EyeIcon, 
  EyeOffIcon,
  ArrowRightIcon,
  UserIcon,
  LockClosedIcon
} from '@heroicons/react/outline';

interface LoginPageConfig {
  branding: {
    logo: string;
    companyName: string;
    tagline: string;
    primaryColor: string;
    backgroundColor: string;
  };
  content: {
    welcomeMessage: string;
    loginButtonText: string;
    newClientButtonText: string;
    helpText: string;
  };
  features: {
    showForgotPassword: boolean;
    showHelpLink: boolean;
    showNewClientButton: boolean;
    enableSocialLogin: boolean;
  };
}

const ClientLogin: React.FC = () => {
  const navigate = useNavigate();
  const { customTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<LoginPageConfig>({
    branding: {
      logo: customTheme?.logoUrl || '/uploads/logo_1757827373384.png',
      companyName: 'Rapid CRM',
      tagline: 'Access your transportation business dashboard',
      primaryColor: 'blue',
      backgroundColor: 'gradient-to-br from-blue-50 to-indigo-100'
    },
    content: {
      welcomeMessage: 'Client Portal',
      loginButtonText: 'Sign in to Portal',
      newClientButtonText: 'New Client? Start Your Application',
      helpText: 'Access your transportation business dashboard'
    },
    features: {
      showForgotPassword: true,
      showHelpLink: true,
      showNewClientButton: true,
      enableSocialLogin: false
    }
  });

  // Load login page configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/client-portal/login-config');
        if (response.ok) {
          const data = await response.json();
          setConfig(data.config || config);
        }
      } catch (error) {
        console.error('Error loading login config:', error);
      }
    };
    loadConfig();
  }, []);

  // Update logo when theme changes
  useEffect(() => {
    if (customTheme?.logoUrl) {
      setConfig(prev => ({
        ...prev,
        branding: {
          ...prev.branding,
          logo: customTheme.logoUrl
        }
      }));
    }
  }, [customTheme?.logoUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/client-portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store client session
        localStorage.setItem('clientSession', JSON.stringify(data.client));
        // Redirect to client portal
        navigate('/portal');
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={`min-h-screen bg-${config.branding.backgroundColor} dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          {config.branding.logo ? (
            <img 
              src={config.branding.logo} 
              alt={config.branding.companyName}
              className="mx-auto h-16 w-auto"
            />
          ) : (
            <div className={`mx-auto h-16 w-16 bg-${config.branding.primaryColor}-600 rounded-full flex items-center justify-center`}>
              <TruckIcon className="h-8 w-8 text-white" />
            </div>
          )}
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {config.content.welcomeMessage}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {config.content.helpText}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-lg">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-${config.branding.primaryColor}-600 hover:bg-${config.branding.primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${config.branding.primaryColor}-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    {config.content.loginButtonText}
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </div>
                )}
              </button>
            </div>
          </form>



          {/* Help Links */}
          {(config.features.showForgotPassword || config.features.showHelpLink) && (
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {config.features.showForgotPassword && (
                  <>
                    <a href="#" className={`font-medium text-${config.branding.primaryColor}-600 hover:text-${config.branding.primaryColor}-500 dark:text-${config.branding.primaryColor}-400 dark:hover:text-${config.branding.primaryColor}-300`}>
                      Forgot your password?
                    </a>
                    {config.features.showHelpLink && ' • '}
                  </>
                )}
                {config.features.showHelpLink && (
                  <a href="#" className={`font-medium text-${config.branding.primaryColor}-600 hover:text-${config.branding.primaryColor}-500 dark:text-${config.branding.primaryColor}-400 dark:hover:text-${config.branding.primaryColor}-300`}>
                    Need help?
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 {config.branding.companyName}. Secure client portal access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
