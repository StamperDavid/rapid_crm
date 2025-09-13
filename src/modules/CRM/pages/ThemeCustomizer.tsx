import React, { useState, useEffect } from 'react';
import {
  ColorSwatchIcon,
  PhotographIcon,
  DocumentTextIcon,
  EyeIcon,
  RefreshIcon,
  CheckIcon,
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
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#3b82f6', // blue-500
  secondaryColor: '#8b5cf6', // violet-500
  accentColor: '#10b981', // emerald-500
  backgroundColor: '#f8fafc', // slate-50
  surfaceColor: '#ffffff', // white
  cardColor: '#ffffff', // white
  textPrimary: '#1e293b', // slate-800
  textSecondary: '#64748b', // slate-500
  textMuted: '#94a3b8', // slate-400
  borderColor: '#e2e8f0', // slate-200
  shadowColor: '#00000010', // black with opacity
  borderRadius: 8,
  fontFamily: 'Inter',
  fontSize: 14,
  fontWeight: '400',
  logoUrl: '',
  logoHeight: 48,
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

  useEffect(() => {
    // Load saved theme settings from ThemeContext
    if (customTheme) {
      setSettings({ ...defaultTheme, ...customTheme });
    } else {
      const savedSettings = localStorage.getItem('customTheme');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultTheme, ...parsedSettings });
        updateCustomTheme(parsedSettings);
      }
    }
  }, [customTheme, updateCustomTheme]);

  const handleSettingChange = (key: keyof ThemeSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('Logo upload - file selected:', file);
    
    if (file) {
      console.log('Logo upload - file details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        console.log('Logo upload - data URL generated:', logoUrl.substring(0, 100) + '...');
        handleSettingChange('logoUrl', logoUrl);
        console.log('Logo upload - settings updated:', settings);
      };
      reader.onerror = (error) => {
        console.error('Logo upload - FileReader error:', error);
      };
      reader.readAsDataURL(file);
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
              {settings.logoUrl && (
                <div className="flex items-center space-x-4">
                  <img
                    src={settings.logoUrl}
                    alt="Logo preview"
                    className="h-8 border border-gray-300 dark:border-gray-600 rounded"
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
    </div>
  );
};

export default ThemeCustomizer;
