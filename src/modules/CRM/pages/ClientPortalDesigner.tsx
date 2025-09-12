import React, { useState, useEffect } from 'react';
import {
  EyeIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface PortalLayout {
  id: string;
  type: 'header' | 'welcome' | 'data-section' | 'chatbot' | 'compliance' | 'footer';
  title: string;
  fields: string[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
}


interface ComplianceSettings {
  emailAddress: string;
  autoSend: boolean;
  includeFields: string[];
  template: string;
}

const ClientPortalDesigner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'layout' | 'compliance' | 'preview'>('layout');
  const [portalLayout, setPortalLayout] = useState<PortalLayout[]>([
    {
      id: 'header',
      type: 'header',
      title: 'Welcome Header',
      fields: ['companyName', 'clientName'],
      position: { x: 0, y: 0 },
      size: { width: 100, height: 15 },
      visible: true,
    },
    {
      id: 'welcome',
      type: 'welcome',
      title: 'Welcome Message',
      fields: ['greeting', 'lastLogin'],
      position: { x: 0, y: 15 },
      size: { width: 100, height: 20 },
      visible: true,
    },
    {
      id: 'data-section',
      type: 'data-section',
      title: 'Company Information',
      fields: ['usdotNumber', 'mcNumber', 'businessAddress', 'phone', 'email'],
      position: { x: 0, y: 35 },
      size: { width: 60, height: 40 },
      visible: true,
    },
    {
      id: 'chatbot',
      type: 'chatbot',
      title: 'Onboarding Assistant',
      fields: [],
      position: { x: 60, y: 35 },
      size: { width: 40, height: 40 },
      visible: true,
    },
    {
      id: 'compliance',
      type: 'compliance',
      title: 'Compliance Center',
      fields: ['complianceStatus', 'renewalDates', 'violations'],
      position: { x: 0, y: 75 },
      size: { width: 100, height: 25 },
      visible: true,
    },
  ]);


  const [complianceSettings, setComplianceSettings] = useState<ComplianceSettings>({
    emailAddress: 'compliance@yourcompany.com',
    autoSend: false,
    includeFields: ['usdotNumber', 'mcNumber', 'complianceStatus', 'violations'],
    template: 'Please find attached the compliance data for {{companyName}}.',
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Available client data fields
  const availableFields = [
    { id: 'companyName', label: 'Company Name', category: 'basic' },
    { id: 'clientName', label: 'Client Name', category: 'basic' },
    { id: 'usdotNumber', label: 'USDOT Number', category: 'compliance' },
    { id: 'mcNumber', label: 'MC Number', category: 'compliance' },
    { id: 'businessAddress', label: 'Business Address', category: 'contact' },
    { id: 'phone', label: 'Phone Number', category: 'contact' },
    { id: 'email', label: 'Email Address', category: 'contact' },
    { id: 'complianceStatus', label: 'Compliance Status', category: 'compliance' },
    { id: 'renewalDates', label: 'Renewal Dates', category: 'compliance' },
    { id: 'violations', label: 'Violations', category: 'compliance' },
    { id: 'greeting', label: 'Greeting Message', category: 'basic' },
    { id: 'lastLogin', label: 'Last Login', category: 'basic' },
  ];

  const handleLayoutChange = (layoutId: string, updates: Partial<PortalLayout>) => {
    setPortalLayout(prev => prev.map(layout => 
      layout.id === layoutId ? { ...layout, ...updates } : layout
    ));
  };


  const handleComplianceChange = (updates: Partial<ComplianceSettings>) => {
    setComplianceSettings(prev => ({ ...prev, ...updates }));
  };


  const saveDesign = () => {
    // TODO: Save portal design to database
    console.log('Saving portal design:', { portalLayout, complianceSettings });
  };

  const TabButton: React.FC<{ tab: typeof activeTab; icon: React.ReactNode; label: string }> = ({ 
    tab, 
    icon, 
    label 
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === tab
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Client Portal Designer
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Design your client portal layout and compliance features
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isPreviewMode
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {isPreviewMode ? 'Exit Preview' : 'Preview Mode'}
            </button>
            <button
              onClick={saveDesign}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Save Design
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <TabButton
            tab="layout"
            icon={<CogIcon className="h-4 w-4" />}
            label="Layout Designer"
          />
          <TabButton
            tab="compliance"
            icon={<EnvelopeIcon className="h-4 w-4" />}
            label="Compliance"
          />
          <TabButton
            tab="preview"
            icon={<EyeIcon className="h-4 w-4" />}
            label="Live Preview"
          />
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {activeTab === 'layout' && (
          <LayoutDesigner
            portalLayout={portalLayout}
            availableFields={availableFields}
            onLayoutChange={handleLayoutChange}
          />
        )}
        
        {activeTab === 'compliance' && (
          <ComplianceDesigner
            settings={complianceSettings}
            availableFields={availableFields}
            onSettingsChange={handleComplianceChange}
          />
        )}
        
        {activeTab === 'preview' && (
          <LivePreview
            portalLayout={portalLayout}
            complianceSettings={complianceSettings}
            isPreviewMode={isPreviewMode}
          />
        )}
      </div>
    </div>
  );
};

// Layout Designer Component
const LayoutDesigner: React.FC<{
  portalLayout: PortalLayout[];
  availableFields: any[];
  onLayoutChange: (id: string, updates: Partial<PortalLayout>) => void;
}> = ({ portalLayout, availableFields, onLayoutChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Portal Layout Designer
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layout Canvas */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Layout Canvas
          </h3>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 h-96 relative bg-gray-50 dark:bg-gray-900">
            {portalLayout.map((layout) => (
              <div
                key={layout.id}
                className={`absolute border-2 rounded-lg p-2 cursor-move ${
                  layout.visible 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 bg-gray-100 dark:bg-gray-700'
                }`}
                style={{
                  left: `${layout.position.x}%`,
                  top: `${layout.position.y}%`,
                  width: `${layout.size.width}%`,
                  height: `${layout.size.height}%`,
                }}
              >
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {layout.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {layout.fields.length} fields
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Layout Controls */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Layout Controls
          </h3>
          <div className="space-y-3">
            {portalLayout.map((layout) => (
              <div key={layout.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {layout.title}
                  </span>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={layout.visible}
                      onChange={(e) => onLayoutChange(layout.id, { visible: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">Visible</span>
                  </label>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Fields: {layout.fields.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Chatbot Avatar Designer Component
const ChatbotAvatarDesigner: React.FC<{
  avatar: ChatbotAvatar;
  onAvatarChange: (updates: Partial<ChatbotAvatar>) => void;
  isVoiceEnabled: boolean;
  isListening: boolean;
  onToggleVoice: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
}> = ({ avatar, onAvatarChange, isVoiceEnabled, isListening, onToggleVoice, onStartListening, onStopListening }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Chatbot Avatar Designer
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avatar Preview */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Avatar Preview
          </h3>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-white" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Animated Avatar Preview
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {avatar.name}
              </p>
            </div>
          </div>
          
          {/* Voice Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Voice Enabled
              </span>
              <button
                onClick={onToggleVoice}
                className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  isVoiceEnabled
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {isVoiceEnabled ? (
                  <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                ) : (
                  <MicrophoneIcon className="h-4 w-4 mr-1" />
                )}
                {isVoiceEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            
            {isVoiceEnabled && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={isListening ? onStopListening : onStartListening}
                  className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    isListening
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  }`}
                >
                  {isListening ? (
                    <PauseIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <PlayIcon className="h-4 w-4 mr-1" />
                  )}
                  {isListening ? 'Stop Listening' : 'Start Listening'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Avatar Settings */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Avatar Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Avatar Name
              </label>
              <input
                type="text"
                value={avatar.name}
                onChange={(e) => onAvatarChange({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                placeholder="Enter avatar name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <select
                value={avatar.appearance.gender}
                onChange={(e) => onAvatarChange({ 
                  appearance: { ...avatar.appearance, gender: e.target.value as any }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
              >
                <option value="neutral">Neutral</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skin Color
                </label>
                <input
                  type="color"
                  value={avatar.appearance.skinColor}
                  onChange={(e) => onAvatarChange({ 
                    appearance: { ...avatar.appearance, skinColor: e.target.value }
                  })}
                  className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hair Color
                </label>
                <input
                  type="color"
                  value={avatar.appearance.hairColor}
                  onChange={(e) => onAvatarChange({ 
                    appearance: { ...avatar.appearance, hairColor: e.target.value }
                  })}
                  className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compliance Designer Component
const ComplianceDesigner: React.FC<{
  settings: ComplianceSettings;
  availableFields: any[];
  onSettingsChange: (updates: Partial<ComplianceSettings>) => void;
}> = ({ settings, availableFields, onSettingsChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Compliance Email Settings
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Compliance Officer Email
            </label>
            <input
              type="email"
              value={settings.emailAddress}
              onChange={(e) => onSettingsChange({ emailAddress: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
              placeholder="compliance@yourcompany.com"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoSend"
              checked={settings.autoSend}
              onChange={(e) => onSettingsChange({ autoSend: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoSend" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Auto-send compliance data
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Template
            </label>
            <textarea
              value={settings.template}
              onChange={(e) => onSettingsChange({ template: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
              placeholder="Email template with {{variables}}"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Include Fields in Compliance Email
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableFields
              .filter(field => field.category === 'compliance' || field.category === 'basic')
              .map((field) => (
                <label key={field.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.includeFields.includes(field.id)}
                    onChange={(e) => {
                      const newFields = e.target.checked
                        ? [...settings.includeFields, field.id]
                        : settings.includeFields.filter(f => f !== field.id);
                      onSettingsChange({ includeFields: newFields });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {field.label}
                  </span>
                </label>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Live Preview Component
const LivePreview: React.FC<{
  portalLayout: PortalLayout[];
  chatbotAvatar: ChatbotAvatar;
  complianceSettings: ComplianceSettings;
  isPreviewMode: boolean;
}> = ({ portalLayout, chatbotAvatar, complianceSettings, isPreviewMode }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Live Preview
      </h2>
      
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <EyeIcon className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-medium">Client Portal Preview</p>
          <p className="text-sm mt-2">
            This will show a live preview of how the client portal will look
          </p>
          <p className="text-xs mt-1">
            Avatar: {chatbotAvatar.name} | Voice: {chatbotAvatar.voice.enabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientPortalDesigner;
