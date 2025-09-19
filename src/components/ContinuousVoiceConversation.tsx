import React, { useState } from 'react';
import { 
  MicrophoneIcon, 
  SpeakerWaveIcon, 
  StopIcon,
  PlayIcon,
  PauseIcon,
  CogIcon,
  ChatIcon
} from '@heroicons/react/outline';
import { useContinuousVoice } from '../hooks/useContinuousVoice';

interface ContinuousVoiceConversationProps {
  className?: string;
}

export const ContinuousVoiceConversation: React.FC<ContinuousVoiceConversationProps> = ({ 
  className = '' 
}) => {
  const {
    settings,
    conversationState,
    isInitialized,
    startConversation,
    stopConversation,
    toggleConversation,
    updateSettings,
    triggerWakeWord,
    getConversationSummary,
    isActive,
    isListening,
    isSpeaking,
    conversationHistory,
    currentTranscript
  } = useContinuousVoice();

  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingsChange = (key: keyof typeof localSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleVoiceSettingsChange = (key: string, value: any) => {
    const newSettings = {
      ...localSettings,
      voiceSettings: {
        ...localSettings.voiceSettings,
        [key]: value
      }
    };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  if (!isInitialized) {
    return (
      <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500 dark:text-gray-400">
            Initializing voice service...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <ChatIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Continuous Voice Conversation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Like Gemini mobile - persistent conversation mode
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Voice settings"
          >
            <CogIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={toggleConversation}
          className={`
            flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all duration-200
            ${isActive 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
            }
          `}
        >
          {isActive ? (
            <>
              <StopIcon className="h-5 w-5" />
              <span>Stop Conversation</span>
            </>
          ) : (
            <>
              <MicrophoneIcon className="h-5 w-5" />
              <span>Start Conversation</span>
            </>
          )}
        </button>

        {isActive && (
          <button
            onClick={triggerWakeWord}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Trigger wake word"
          >
            <PlayIcon className="h-4 w-4" />
            <span>Wake Word</span>
          </button>
        )}
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        <div className="flex items-center space-x-2">
          <div className={`
            w-3 h-3 rounded-full transition-colors
            ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}
          `} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isListening ? 'Listening...' : 'Not listening'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`
            w-3 h-3 rounded-full transition-colors
            ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}
          `} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isSpeaking ? 'Speaking...' : 'Not speaking'}
          </span>
        </div>
      </div>

      {/* Current Transcript */}
      {currentTranscript && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current transcript:</div>
          <div className="text-gray-900 dark:text-white">{currentTranscript}</div>
        </div>
      )}

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Conversation History
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getConversationSummary()}
            </span>
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-2">
            {conversationHistory.slice(-10).map((message) => (
              <div
                key={message.id}
                className={`
                  p-3 rounded-lg text-sm
                  ${message.type === 'user' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 ml-4' 
                    : message.type === 'ai'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 mr-4'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                `}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium">
                    {message.type === 'user' ? '👤 You' : message.type === 'ai' ? '🤖 AI' : '⚙️ System'}
                  </span>
                  <span className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div>{message.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Voice Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wake Word */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wake Word
              </label>
              <input
                type="text"
                value={localSettings.wakeWord}
                onChange={(e) => handleSettingsChange('wakeWord', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="hey rapid crm"
              />
            </div>

            {/* Silence Timeout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Silence Timeout (seconds)
              </label>
              <input
                type="number"
                value={localSettings.silenceTimeout / 1000}
                onChange={(e) => handleSettingsChange('silenceTimeout', parseInt(e.target.value) * 1000)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="1"
                max="60"
              />
            </div>

            {/* Auto Listen */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoListen"
                checked={localSettings.autoListen}
                onChange={(e) => handleSettingsChange('autoListen', e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="autoListen" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-start listening
              </label>
            </div>

            {/* Auto Speak */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoSpeak"
                checked={localSettings.autoSpeak}
                onChange={(e) => handleSettingsChange('autoSpeak', e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="autoSpeak" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-speak responses
              </label>
            </div>

            {/* Voice Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Speech Rate: {localSettings.voiceSettings.rate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={localSettings.voiceSettings.rate}
                onChange={(e) => handleVoiceSettingsChange('rate', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Voice Volume */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Volume: {Math.round(localSettings.voiceSettings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.1"
                value={localSettings.voiceSettings.volume}
                onChange={(e) => handleVoiceSettingsChange('volume', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          How to use:
        </h5>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Click "Start Conversation" to begin continuous voice mode</li>
          <li>• Say "{settings.wakeWord}" to activate the AI</li>
          <li>• The conversation will continue until you click "Stop"</li>
          <li>• AI will automatically respond and speak back to you</li>
          <li>• Conversation stops after {settings.silenceTimeout / 1000} seconds of silence</li>
        </ul>
      </div>
    </div>
  );
};
