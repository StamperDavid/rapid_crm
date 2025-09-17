import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  EyeIcon,
  CogIcon,
  ColorSwatchIcon,
  PhotographIcon,
  CheckIcon,
  RefreshIcon,
  TruckIcon,
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

const LoginPageDesigner: React.FC = () => {
  const { customTheme } = useTheme();
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

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing configuration
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

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/client-portal/login-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      
      if (response.ok) {
        console.log('Login page configuration saved');
      }
    } catch (error) {
      console.error('Error saving login config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (section: keyof LoginPageConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const colorOptions = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-600' },
    { value: 'green', label: 'Green', class: 'bg-green-600' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-600' },
    { value: 'red', label: 'Red', class: 'bg-red-600' },
    { value: 'indigo', label: 'Indigo', class: 'bg-indigo-600' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-600' }
  ];

  const backgroundOptions = [
    { value: 'gradient-to-br from-blue-50 to-indigo-100', label: 'Blue Gradient' },
    { value: 'gradient-to-br from-green-50 to-emerald-100', label: 'Green Gradient' },
    { value: 'gradient-to-br from-purple-50 to-violet-100', label: 'Purple Gradient' },
    { value: 'gradient-to-br from-gray-50 to-slate-100', label: 'Gray Gradient' },
    { value: 'bg-white', label: 'White' },
    { value: 'bg-gray-100', label: 'Light Gray' }
  ];

  if (isPreviewMode) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Login Page Preview
          </h2>
          <button
            onClick={() => setIsPreviewMode(false)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <CogIcon className="h-4 w-4" />
            Edit
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          <iframe
            src="/preview-login"
            className="w-full h-full border-0"
            title="Login Page Preview"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Login Page Designer
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open('/preview-login', '_blank')}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
          >
            <EyeIcon className="h-4 w-4" />
            View as Client
          </button>
          <button
            onClick={() => setIsPreviewMode(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            <EyeIcon className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={saveConfig}
            disabled={isSaving}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            <CheckIcon className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Branding Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ColorSwatchIcon className="h-5 w-5 mr-2" />
            Branding
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={config.branding.companyName}
                onChange={(e) => updateConfig('branding', 'companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={config.branding.tagline}
                onChange={(e) => updateConfig('branding', 'tagline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={config.branding.logo}
                onChange={(e) => updateConfig('branding', 'logo', e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Color
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    onClick={() => updateConfig('branding', 'primaryColor', color.value)}
                    className={`flex items-center space-x-2 p-2 rounded-lg border-2 ${
                      config.branding.primaryColor === color.value
                        ? 'border-blue-500'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${color.class}`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background
              </label>
              <select
                value={config.branding.backgroundColor}
                onChange={(e) => updateConfig('branding', 'backgroundColor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {backgroundOptions.map(bg => (
                  <option key={bg.value} value={bg.value}>{bg.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Content
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Welcome Message
              </label>
              <input
                type="text"
                value={config.content.welcomeMessage}
                onChange={(e) => updateConfig('content', 'welcomeMessage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Login Button Text
              </label>
              <input
                type="text"
                value={config.content.loginButtonText}
                onChange={(e) => updateConfig('content', 'loginButtonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Client Button Text
              </label>
              <input
                type="text"
                value={config.content.newClientButtonText}
                onChange={(e) => updateConfig('content', 'newClientButtonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Help Text
              </label>
              <input
                type="text"
                value={config.content.helpText}
                onChange={(e) => updateConfig('content', 'helpText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <LockClosedIcon className="h-5 w-5 mr-2" />
            Features
          </h3>
          
          <div className="space-y-4">
            {Object.entries(config.features).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateConfig('features', key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPageDesigner;
