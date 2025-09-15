import React, { useState, useEffect } from 'react';
import { XIcon, PlayIcon, UploadIcon, TrashIcon, CogIcon } from '@heroicons/react/outline';
import { voiceService, VoiceSettings, VoiceProvider, VoiceOption } from '../services/voice/VoiceService';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: VoiceSettings) => void;
}

const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChange
}) => {
  const [settings, setSettings] = useState<VoiceSettings>(voiceService.getSettings());
  const [providers, setProviders] = useState<VoiceProvider[]>([]);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [showCustomUpload, setShowCustomUpload] = useState(false);
  const [customVoiceName, setCustomVoiceName] = useState('');
  const [customVoiceFile, setCustomVoiceFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProviders(voiceService.getProviders());
      setVoices(voiceService.getVoices());
    }
  }, [isOpen]);

  useEffect(() => {
    setVoices(voiceService.getVoices());
  }, [settings.provider]);

  const handleProviderChange = (providerId: string) => {
    const newSettings = { ...settings, provider: providerId as any };
    setSettings(newSettings);
    voiceService.updateSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleVoiceChange = (voiceId: string) => {
    const newSettings = { ...settings, voice: voiceId };
    setSettings(newSettings);
    voiceService.updateSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleSettingChange = (key: keyof VoiceSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    voiceService.updateSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handlePlayPreview = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      await voiceService.speak("Hello! This is a preview of the selected voice. How does it sound?");
    } catch (error) {
      console.error('Voice preview error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleCustomVoiceUpload = async () => {
    if (!customVoiceName || !customVoiceFile) return;

    try {
      const customVoice: VoiceOption = {
        id: `custom_${Date.now()}`,
        name: customVoiceName,
        language: 'en-US',
        gender: 'neutral',
        isCustom: true
      };

      await voiceService.addCustomVoice(customVoice, customVoiceFile);
      setVoices(voiceService.getVoices());
      setCustomVoiceName('');
      setCustomVoiceFile(null);
      setShowCustomUpload(false);
    } catch (error) {
      console.error('Custom voice upload error:', error);
    }
  };

  const handleRemoveCustomVoice = (voiceId: string) => {
    voiceService.removeCustomVoice(voiceId);
    setVoices(voiceService.getVoices());
  };

  if (!isOpen) return null;

  const currentProvider = providers.find(p => p.id === settings.provider);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <CogIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Voice Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Voice Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Voice Provider
            </label>
            <select
              value={settings.provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          {/* API Key Configuration */}
          {(settings.provider === 'elevenlabs' || settings.provider === 'azure' || settings.provider === 'openai') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={settings.apiKey || ''}
                onChange={(e) => handleSettingChange('apiKey', e.target.value)}
                placeholder={`Enter ${currentProvider?.name} API key`}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}

          {/* Model Selection */}
          {(settings.provider === 'elevenlabs' || settings.provider === 'openai') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model
              </label>
              <select
                value={settings.model || ''}
                onChange={(e) => handleSettingChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {settings.provider === 'elevenlabs' && (
                  <>
                    <option value="eleven_multilingual_v2">Eleven Multilingual v2 (Recommended)</option>
                    <option value="eleven_turbo_v2_5">Eleven Turbo v2.5 (Fast)</option>
                    <option value="eleven_multilingual_v1">Eleven Multilingual v1</option>
                    <option value="eleven_monolingual_v1">Eleven Monolingual v1</option>
                  </>
                )}
                {settings.provider === 'openai' && (
                  <>
                    <option value="tts-1">TTS-1</option>
                    <option value="tts-1-hd">TTS-1 HD</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Voice Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Voice
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={handlePlayPreview}
                  disabled={isPlaying}
                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  <PlayIcon className="h-3 w-3 mr-1" />
                  {isPlaying ? 'Playing...' : 'Preview'}
                </button>
                {currentProvider?.supportsCustomUpload && (
                  <button
                    onClick={() => setShowCustomUpload(!showCustomUpload)}
                    className="inline-flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <UploadIcon className="h-3 w-3 mr-1" />
                    Upload
                  </button>
                )}
              </div>
            </div>
            
            <select
              value={settings.voice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select a voice</option>
              {voices.map(voice => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description || `${voice.gender} ${voice.accent || 'American'} voice`}
                  {voice.isCustom && ' [Custom]'}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Voice Upload */}
          {showCustomUpload && (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Upload Custom Voice
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={customVoiceName}
                  onChange={(e) => setCustomVoiceName(e.target.value)}
                  placeholder="Voice name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setCustomVoiceFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCustomVoiceUpload}
                    disabled={!customVoiceName || !customVoiceFile}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Upload Voice
                  </button>
                  <button
                    onClick={() => setShowCustomUpload(false)}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Voices List */}
          {voices.filter(v => v.isCustom).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Custom Voices
              </h3>
              <div className="space-y-2">
                {voices.filter(v => v.isCustom).map(voice => (
                  <div key={voice.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {voice.name}
                    </span>
                    <button
                      onClick={() => handleRemoveCustomVoice(voice.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voice Settings */}
          {currentProvider?.supportsSettings && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Voice Settings
              </h3>
              
              {/* Speed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Speed: {settings.rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.rate}
                  onChange={(e) => handleSettingChange('rate', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Pitch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pitch: {settings.pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.pitch}
                  onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Volume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Volume: {Math.round(settings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettingsModal;
