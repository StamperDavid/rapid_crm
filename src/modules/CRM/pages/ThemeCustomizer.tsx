import React, { useState, useEffect, useRef } from 'react';
import {
  ColorSwatchIcon,
  PhotographIcon,
  DocumentTextIcon,
  EyeIcon,
  RefreshIcon,
  CheckIcon,
  CodeIcon,
  SparklesIcon,
  DeviceMobileIcon,
  DeviceTabletIcon,
  DesktopComputerIcon,
  TemplateIcon,
  CubeIcon,
  XIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  ChartSquareBarIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/outline';
import { useTheme } from '../../../contexts/ThemeContext';

interface ThemeSettings {
  // Brand Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Background Colors
  backgroundColor: string;
  surfaceColor: string;
  cardColor: string;
  
  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Border & Shadow
  borderColor: string;
  shadowColor: string;
  borderRadius: number;
  
  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  
  // Logo
  logoUrl: string;
  logoHeight: number;
  
  // Advanced Features
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  responsive: {
    mobile: any;
    tablet: any;
    desktop: any;
  };
  customCSS: string;
  templates: any[];
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#3b82f6', // blue-500
  secondaryColor: '#8b5cf6', // violet-500
  accentColor: '#10b981', // emerald-500
  backgroundColor: '#ffffff', // white
  surfaceColor: '#f9fafb', // gray-50
  cardColor: '#ffffff', // white
  textPrimary: '#111827', // gray-900
  textSecondary: '#374151', // gray-700
  textMuted: '#6b7280', // gray-500
  borderColor: '#e5e7eb', // gray-200
  shadowColor: '#000000', // black
  borderRadius: 8,
  fontFamily: 'Inter',
  fontSize: 14,
  fontWeight: '400',
  logoUrl: '',
  logoHeight: 48,
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out'
  },
  responsive: {
    mobile: {},
    tablet: {},
    desktop: {}
  },
  customCSS: '',
  templates: []
};

const fontOptions = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Nunito',
  'Work Sans',
  'Fira Sans',
];

const fontWeightOptions = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
];

const ThemeCustomizer: React.FC = () => {
  const { theme, toggleTheme, customTheme, updateCustomTheme } = useTheme();
  const [settings, setSettings] = useState<ThemeSettings>(defaultTheme);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'animations' | 'responsive' | 'css' | 'templates'>('colors');
  const [activeBreakpoint, setActiveBreakpoint] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showCSSEditor, setShowCSSEditor] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  useEffect(() => {
    // Load saved theme settings from ThemeContext
    if (customTheme) {
      console.log('Loading custom theme from context:', customTheme);
      setSettings({ ...defaultTheme, ...customTheme });
    } else {
      const savedSettings = localStorage.getItem('customTheme');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Loading custom theme from localStorage:', parsedSettings);
        setSettings({ ...defaultTheme, ...parsedSettings });
        updateCustomTheme(parsedSettings);
      }
    }
  }, [customTheme, updateCustomTheme]);

  const handleSettingChange = (key: keyof ThemeSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('Logo upload - file selected:', file);
    
    if (file) {
      console.log('Logo upload - file details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Create FormData to upload the file
      const formData = new FormData();
      formData.append('logo', file);
      
      try {
        const response = await fetch('/api/upload-logo', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Logo upload - server response:', result);
          handleSettingChange('logoUrl', result.logoUrl);
        } else {
          console.error('Logo upload - server error:', response.statusText);
          alert('Failed to upload logo. Please try again.');
        }
      } catch (error) {
        console.error('Logo upload - network error:', error);
        alert('Failed to upload logo. Please check your connection.');
      }
    }
  };

  const saveSettings = () => {
    console.log('Saving theme settings:', settings);
    console.log('Logo URL being saved:', settings.logoUrl);
    updateCustomTheme(settings);
    setHasChanges(false);
    console.log('Theme settings saved successfully');
    // TODO: Save to database
  };

  const resetSettings = () => {
    setSettings(defaultTheme);
    setHasChanges(true);
  };

  const ColorInput: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ 
    label, 
    value, 
    onChange 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const NumberInput: React.FC<{ 
    label: string; 
    value: number; 
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    unit?: string;
  }> = ({ label, value, onChange, min = 0, max = 100, unit = '' }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
        />
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Theme Customizer
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Customize the look and feel of your CRM
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                previewMode
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {previewMode ? 'Exit Preview' : 'Preview Mode'}
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ColorSwatchIcon className="h-4 w-4 mr-2" />
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Colors */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <ColorSwatchIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Brand Colors
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ColorInput
                label="Primary Color"
                value={settings.primaryColor}
                onChange={(value) => handleSettingChange('primaryColor', value)}
              />
              <ColorInput
                label="Secondary Color"
                value={settings.secondaryColor}
                onChange={(value) => handleSettingChange('secondaryColor', value)}
              />
              <ColorInput
                label="Accent Color"
                value={settings.accentColor}
                onChange={(value) => handleSettingChange('accentColor', value)}
              />
            </div>
          </div>

          {/* Background Colors */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <ColorSwatchIcon className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Background Colors
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ColorInput
                label="Background"
                value={settings.backgroundColor}
                onChange={(value) => handleSettingChange('backgroundColor', value)}
              />
              <ColorInput
                label="Surface"
                value={settings.surfaceColor}
                onChange={(value) => handleSettingChange('surfaceColor', value)}
              />
              <ColorInput
                label="Cards"
                value={settings.cardColor}
                onChange={(value) => handleSettingChange('cardColor', value)}
              />
            </div>
          </div>

          {/* Text Colors */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="h-5 w-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Text Colors
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ColorInput
                label="Primary Text"
                value={settings.textPrimary}
                onChange={(value) => handleSettingChange('textPrimary', value)}
              />
              <ColorInput
                label="Secondary Text"
                value={settings.textSecondary}
                onChange={(value) => handleSettingChange('textSecondary', value)}
              />
              <ColorInput
                label="Muted Text"
                value={settings.textMuted}
                onChange={(value) => handleSettingChange('textMuted', value)}
              />
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Typography
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font Family
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              <NumberInput
                label="Font Size"
                value={settings.fontSize}
                onChange={(value) => handleSettingChange('fontSize', value)}
                min={10}
                max={24}
                unit="px"
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font Weight
                </label>
                <select
                  value={settings.fontWeight}
                  onChange={(e) => handleSettingChange('fontWeight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                >
                  {fontWeightOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <PhotographIcon className="h-5 w-5 text-orange-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Logo
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {settings.logoUrl ? (
                <div className="flex items-center space-x-4">
                  <img
                    src={settings.logoUrl}
                    alt="Logo preview"
                    className="h-8 border border-gray-300 dark:border-gray-600 rounded"
                    onLoad={() => console.log('Logo loaded successfully')}
                    onError={() => console.error('Logo failed to load:', settings.logoUrl)}
                  />
                  <NumberInput
                    label="Logo Height"
                    value={settings.logoHeight}
                    onChange={(value) => handleSettingChange('logoHeight', value)}
                    min={16}
                    max={64}
                    unit="px"
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No logo uploaded. Upload an image to see preview.
                </div>
              )}
            </div>
          </div>

          {/* Border & Shadow */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <ColorSwatchIcon className="h-5 w-5 text-teal-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Border & Shadow
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ColorInput
                label="Border Color"
                value={settings.borderColor}
                onChange={(value) => handleSettingChange('borderColor', value)}
              />
              <ColorInput
                label="Shadow Color"
                value={settings.shadowColor}
                onChange={(value) => handleSettingChange('shadowColor', value)}
              />
              <NumberInput
                label="Border Radius"
                value={settings.borderRadius}
                onChange={(value) => handleSettingChange('borderRadius', value)}
                min={0}
                max={24}
                unit="px"
              />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Live Preview */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Live Preview
            </h3>
            <div className="space-y-4">
              {/* Sample Card */}
              <div 
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: settings.cardColor,
                  borderColor: settings.borderColor,
                  borderRadius: `${settings.borderRadius}px`,
                  boxShadow: `0 1px 3px ${settings.shadowColor}`,
                }}
              >
                <h4 
                  className="font-semibold mb-2"
                  style={{
                    color: settings.textPrimary,
                    fontFamily: settings.fontFamily,
                    fontSize: `${settings.fontSize + 2}px`,
                    fontWeight: settings.fontWeight,
                  }}
                >
                  Sample Card
                </h4>
                <p 
                  className="text-sm mb-3"
                  style={{
                    color: settings.textSecondary,
                    fontFamily: settings.fontFamily,
                    fontSize: `${settings.fontSize}px`,
                    fontWeight: settings.fontWeight,
                  }}
                >
                  This is how your cards will look with the current settings.
                </p>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{
                    backgroundColor: settings.primaryColor,
                    borderRadius: `${settings.borderRadius}px`,
                  }}
                >
                  Sample Button
                </button>
              </div>

              {/* Sample Navigation */}
              <div 
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: settings.surfaceColor,
                  borderColor: settings.borderColor,
                  borderRadius: `${settings.borderRadius}px`,
                }}
              >
                <div className="flex items-center space-x-3">
                  {settings.logoUrl && (
                    <img
                      src={settings.logoUrl}
                      alt="Logo"
                      style={{ height: `${settings.logoHeight}px` }}
                    />
                  )}
                  <span 
                    className="font-semibold"
                    style={{
                      color: settings.textPrimary,
                      fontFamily: settings.fontFamily,
                      fontSize: `${settings.fontSize + 2}px`,
                    }}
                  >
                    Sample Navigation
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={saveSettings}
                disabled={!hasChanges}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Save Changes
              </button>
              <button
                onClick={resetSettings}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshIcon className="h-4 w-4 mr-2" />
                Reset to Default
              </button>
            </div>
            {hasChanges && (
              <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                You have unsaved changes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Preview Mode Overlay */}
      {previewMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Theme Preview
              </h3>
              <button
                onClick={() => setPreviewMode(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                {/* Preview Header */}
                <div 
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: settings.backgroundColor }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: settings.primaryColor }}
                      >
                        R
                      </div>
                      <div>
                        <h1 
                          className="text-xl font-bold"
                          style={{ color: settings.textColor }}
                        >
                          Rapid CRM
                        </h1>
                        <p 
                          className="text-sm"
                          style={{ color: settings.textColor, opacity: 0.7 }}
                        >
                          Customer Relationship Management
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ 
                          backgroundColor: settings.secondaryColor,
                          color: settings.textColor 
                        }}
                      >
                        Dashboard
                      </button>
                      <button 
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ 
                          backgroundColor: settings.primaryColor,
                          color: 'white' 
                        }}
                      >
                        Settings
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className="p-6 rounded-lg shadow-sm"
                    style={{ backgroundColor: settings.surfaceColor }}
                  >
                    <div className="flex items-center mb-4">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: settings.accentColor }}
                      >
                        <ChartBarIcon className="h-4 w-4 text-white" />
                      </div>
                      <h3 
                        className="text-lg font-semibold"
                        style={{ color: settings.textColor }}
                      >
                        Analytics
                      </h3>
                    </div>
                    <p 
                      className="text-sm mb-4"
                      style={{ color: settings.textColor, opacity: 0.8 }}
                    >
                      View your business performance metrics and insights.
                    </p>
                    <button 
                      className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                      style={{ 
                        backgroundColor: settings.primaryColor,
                        color: 'white' 
                      }}
                    >
                      View Analytics
                    </button>
                  </div>

                  <div 
                    className="p-6 rounded-lg shadow-sm"
                    style={{ backgroundColor: settings.surfaceColor }}
                  >
                    <div className="flex items-center mb-4">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: settings.secondaryColor }}
                      >
                        <UserGroupIcon className="h-4 w-4 text-white" />
                      </div>
                      <h3 
                        className="text-lg font-semibold"
                        style={{ color: settings.textColor }}
                      >
                        Customers
                      </h3>
                    </div>
                    <p 
                      className="text-sm mb-4"
                      style={{ color: settings.textColor, opacity: 0.8 }}
                    >
                      Manage your customer relationships and interactions.
                    </p>
                    <button 
                      className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                      style={{ 
                        backgroundColor: settings.primaryColor,
                        color: 'white' 
                      }}
                    >
                      Manage Customers
                    </button>
                  </div>

                  <div 
                    className="p-6 rounded-lg shadow-sm"
                    style={{ backgroundColor: settings.surfaceColor }}
                  >
                    <div className="flex items-center mb-4">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: settings.accentColor }}
                      >
                        <CogIcon className="h-4 w-4 text-white" />
                      </div>
                      <h3 
                        className="text-lg font-semibold"
                        style={{ color: settings.textColor }}
                      >
                        Settings
                      </h3>
                    </div>
                    <p 
                      className="text-sm mb-4"
                      style={{ color: settings.textColor, opacity: 0.8 }}
                    >
                      Configure your application preferences and settings.
                    </p>
                    <button 
                      className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                      style={{ 
                        backgroundColor: settings.primaryColor,
                        color: 'white' 
                      }}
                    >
                      Open Settings
                    </button>
                  </div>
                </div>

                {/* Preview Form */}
                <div 
                  className="p-6 rounded-lg shadow-sm"
                  style={{ backgroundColor: settings.surfaceColor }}
                >
                  <h3 
                    className="text-lg font-semibold mb-4"
                    style={{ color: settings.textColor }}
                  >
                    Sample Form
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: settings.textColor }}
                      >
                        Name
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        style={{ 
                          backgroundColor: settings.backgroundColor,
                          borderColor: settings.borderColor,
                          color: settings.textColor
                        }}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: settings.textColor }}
                      >
                        Email
                      </label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        style={{ 
                          backgroundColor: settings.backgroundColor,
                          borderColor: settings.borderColor,
                          color: settings.textColor
                        }}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ 
                          backgroundColor: settings.primaryColor,
                          color: 'white' 
                        }}
                      >
                        Submit
                      </button>
                      <button 
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ 
                          backgroundColor: settings.backgroundColor,
                          borderColor: settings.borderColor,
                          color: settings.textColor,
                          border: '1px solid'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;
