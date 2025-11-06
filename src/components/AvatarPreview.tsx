import React, { useState } from 'react';
import Avatar from './Avatar';
import { EyeIcon, UserIcon, ChatIcon } from '@heroicons/react/outline';
import { useTheme } from '../contexts/ThemeContext';

interface AvatarPreviewProps {
  onSelectAvatar: (avatarConfig: any) => void;
}

const AvatarPreview: React.FC<AvatarPreviewProps> = ({ onSelectAvatar }) => {
  const { customTheme } = useTheme();
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [selectedSize, setSelectedSize] = useState('md');
  const [uploadedImage, setUploadedImage] = useState<string>('');

  // Avatar configurations
  const avatarConfigs = {
    professional: {
      name: 'David',
      src: uploadedImage || customTheme?.logoUrl || '/uploads/logo_1757827373384.png',
      description: 'Professional headshot style - builds trust and authority'
    },
    illustrated: {
      name: 'David',
      src: uploadedImage || customTheme?.logoUrl || '/uploads/logo_1757827373384.png',
      description: 'Illustrated/cartoon style - friendly and approachable'
    },
    business: {
      name: 'David',
      src: uploadedImage || customTheme?.logoUrl || '/uploads/logo_1757827373384.png',
      description: 'Business context - with transportation elements'
    }
  };

  const sizes = [
    { key: 'sm', label: 'Small (32px)', description: 'Chat messages, compact views' },
    { key: 'md', label: 'Medium (48px)', description: 'Agent headers, standard views' },
    { key: 'lg', label: 'Large (64px)', description: 'Welcome screens, prominent displays' },
    { key: 'xl', label: 'Extra Large (80px)', description: 'Hero sections, main interfaces' }
  ];

  const variants = [
    { key: 'circle', label: 'Circle', description: 'Modern, friendly' },
    { key: 'rounded', label: 'Rounded', description: 'Professional, clean' },
    { key: 'square', label: 'Square', description: 'Corporate, formal' }
  ];

  const currentConfig = avatarConfigs[selectedStyle as keyof typeof avatarConfigs];

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Avatar Preview
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          See how your avatar will look in different contexts
        </p>
      </div>

      {/* Image Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Upload Your Headshot
        </h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setUploadedImage(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Choose Image
              </label>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload your professional headshot to see how it looks as your agent avatar
              </p>
            </div>
          </div>
          
          {uploadedImage && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={uploadedImage}
                  alt="Uploaded avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Image uploaded successfully!
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Your avatar will now use this image in all previews
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Style Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Avatar Style
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(avatarConfigs).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedStyle(key)}
              className={`p-3 rounded-lg border-2 text-left transition-colors ${
                selectedStyle === key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar
                  src={config.src}
                  name={config.name}
                  size="md"
                  variant="circle"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white capitalize">
                    {key} Style
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {config.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Size Options
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {sizes.map((size) => (
            <button
              key={size.key}
              onClick={() => setSelectedSize(size.key)}
              className={`p-3 rounded-lg border-2 text-left transition-colors ${
                selectedSize === size.key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar
                  src={currentConfig.src}
                  name={currentConfig.name}
                  size={size.key as any}
                  variant="circle"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {size.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {size.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview - Agent Contexts */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Live Preview - How it looks in your agents
        </h4>
        
        {/* Onboarding Agent Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar
              src={currentConfig.src}
              name={currentConfig.name}
              size={selectedSize as any}
              variant="circle"
              showOnlineIndicator={true}
            />
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">
                USDOT Application Assistant
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                I'll help you complete your application step by step
              </p>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Avatar
                src={currentConfig.src}
                name={currentConfig.name}
                size="sm"
                variant="circle"
              />
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 max-w-xs">
                <p className="text-sm text-gray-900 dark:text-white">
                  Welcome! I'm David, your USDOT application specialist. Let's get your transportation business properly registered.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Service Agent Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar
              src={currentConfig.src}
              name={currentConfig.name}
              size={selectedSize as any}
              variant="circle"
              showOnlineIndicator={true}
            />
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">
                Customer Service
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Online now
              </p>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Avatar
                src={currentConfig.src}
                name={currentConfig.name}
                size="sm"
                variant="circle"
              />
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 max-w-xs">
                <p className="text-sm text-gray-900 dark:text-white">
                  Hello! I'm David, here to help with any questions about your account or compliance requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onSelectAvatar({
            style: selectedStyle,
            size: selectedSize,
            config: currentConfig
          })}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Use This Avatar
        </button>
      </div>
    </div>
  );
};

export default AvatarPreview;
