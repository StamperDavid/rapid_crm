import React, { useState, useEffect } from 'react';
import {
  ChipIcon, ChartBarIcon, CogIcon, ExclamationIcon, CheckCircleIcon, RefreshIcon, PlayIcon,
  PauseIcon, EyeIcon, ShieldCheckIcon, GlobeAltIcon, UserIcon, SpeakerphoneIcon, ChatIcon,
} from '@heroicons/react/outline';
import AICollaborationMonitor from '../components/AICollaborationMonitor';

const AIAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'monitoring', name: 'Monitoring', icon: EyeIcon },
    { id: 'configuration', name: 'Configuration', icon: CogIcon },
    { id: 'collaboration', name: 'Collaboration', icon: UserIcon },
    { id: 'advanced', name: 'Advanced', icon: CogIcon },
  ];

  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    enabled: true,
    emotion: 'neutral',
    emphasis: 'normal',
    breathiness: 0.0,
    roughness: 0.0,
    stability: 0.75,
    clarity: 0.75,
    style: 'professional',
    accent: 'neutral',
    speakingStyle: 'conversational'
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [voiceSamples, setVoiceSamples] = useState<{[key: string]: string}>({
    'Microsoft David Desktop': 'Hello, I am Microsoft David. I provide clear, professional speech for business communications.',
    'Microsoft Zira Desktop': 'Hi there! I am Microsoft Zira. I offer a friendly, approachable voice for customer interactions.',
    'Microsoft Mark Desktop': 'Greetings. I am Microsoft Mark. I deliver authoritative, confident speech for presentations.',
    'Google US English': 'Hello! I am Google US English. I provide natural, conversational speech with excellent clarity.',
    'Alex': 'Hi, I am Alex. I offer a warm, professional voice perfect for customer service and support.',
    'Samantha': 'Hello there! I am Samantha. I provide a clear, pleasant voice ideal for announcements and guidance.',
    'Victoria': 'Greetings! I am Victoria. I offer an elegant, sophisticated voice for premium customer experiences.',
    'Daniel': 'Hello, I am Daniel. I provide a confident, authoritative voice perfect for business communications.',
    'Moira': 'Hi! I am Moira. I offer a friendly, engaging voice great for interactive applications.',
    'Tessa': 'Hello! I am Tessa. I provide a clear, professional voice with excellent pronunciation.'
  });

  // Tooltip component for controls
  const Tooltip: React.FC<{ id: string; content: string; children: React.ReactNode }> = ({ id, content, children }) => (
    <div className="relative inline-block">
      {children}
      {showTooltip === id && (
        <div className="absolute z-50 w-80 p-3 mt-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg border border-gray-700">
          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45 border-l border-t border-gray-700"></div>
          {content}
          <button
            onClick={() => setShowTooltip(null)}
            className="absolute top-1 right-1 text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );

  // Get unique languages from available voices
  const getAvailableLanguages = () => {
    const languages = [...new Set(availableVoices.map(voice => voice.lang))];
    return languages.sort();
  };

  // Get voices filtered by selected language
  const getFilteredVoices = () => {
    return availableVoices.filter(voice => voice.lang === selectedLanguage);
  };

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        if (voices.length > 0) {
          // Set default language to first English language or first available
          if (!selectedLanguage) {
            const englishLang = voices.find(voice => voice.lang.startsWith('en'))?.lang || voices[0].lang;
            setSelectedLanguage(englishLang);
          }
          
          // Set default voice if none selected
          if (!selectedVoice) {
            const englishVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
            if (englishVoice) {
              setSelectedVoice(englishVoice.name);
            }
          }
        }
      }
    };

    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    setTimeout(loadVoices, 100);
  }, [selectedVoice]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <ChipIcon className="h-8 w-8 mr-3 text-purple-600" />
                AI Administration
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Comprehensive AI system management and monitoring
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <RefreshIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Health Status */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          System Health
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {metrics ? (metrics.errorRate < 0.1 ? 'Healthy' : 'Warning') : 'Loading...'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Requests */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Requests
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {metrics?.totalRequests || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Rate */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Success Rate
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {metrics ? `${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%` : '0%'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Alerts */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ExclamationIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Active Alerts
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {alerts.filter(alert => !alert.resolved).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI System Monitoring</h3>
                </div>
                <AICollaborationMonitor embedded={true} userChatHistory={[]} />
                <p className="text-gray-600 dark:text-gray-400">Monitor real-time AI-to-AI collaboration and system performance.</p>
              </div>
            </div>
          )}

          {activeTab === 'configuration' && (
            <div className="space-y-6">
              {/* AI Configuration */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default AI Provider
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Response Time (seconds)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Enterprise Voice Settings */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Enterprise Voice Configuration</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                    <div className={`w-3 h-3 rounded-full ${voiceSettings.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {voiceSettings.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
                
                {/* Language & Voice Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <Tooltip 
                      id="language-selection" 
                      content="Select the primary language for voice synthesis. This determines which voice models and pronunciation rules are used. Different languages may have different voice quality and availability."
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        Language Selection
                        <button
                          onClick={() => setShowTooltip(showTooltip === 'language-selection' ? null : 'language-selection')}
                          className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ℹ️
                        </button>
                      </label>
                    </Tooltip>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        setSelectedLanguage(e.target.value);
                        setSelectedVoice('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {getAvailableLanguages().map((lang) => (
                        <option key={lang} value={lang}>
                          {lang} ({availableVoices.filter(v => v.lang === lang).length} voices)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Tooltip 
                      id="voice-model" 
                      content="Choose the specific voice model. Each voice has unique characteristics including gender, age, accent, and speaking style. Premium voices offer higher quality and more natural speech patterns."
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        Voice Model
                        <button
                          onClick={() => setShowTooltip(showTooltip === 'voice-model' ? null : 'voice-model')}
                          className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ℹ️
                        </button>
                      </label>
                    </Tooltip>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a voice...</option>
                      {getFilteredVoices().map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.gender || 'Unknown'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advanced Voice Controls */}
                <div className="space-y-8">
                  {/* Basic Speech Parameters */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Basic Speech Parameters</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Tooltip 
                          id="speech-rate" 
                          content="Controls the speed of speech. Lower values create slower, more deliberate speech. Higher values create faster, more energetic speech. Range: 0.3x to 3.0x normal speed."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Speech Rate: {voiceSettings.rate.toFixed(1)}x
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'speech-rate' ? null : 'speech-rate')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ℹ️
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.3" 
                          max="3.0" 
                          step="0.1" 
                          value={voiceSettings.rate} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Very Slow (0.3x)</span>
                          <span>Very Fast (3.0x)</span>
                        </div>
                      </div>

                      <div>
                        <Tooltip 
                          id="voice-pitch" 
                          content="Adjusts the fundamental frequency of the voice. Lower values create deeper, more authoritative tones. Higher values create brighter, more energetic tones. Range: 0.1 to 3.0."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Voice Pitch: {voiceSettings.pitch.toFixed(1)}
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'voice-pitch' ? null : 'voice-pitch')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ℹ️
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.1" 
                          max="3.0" 
                          step="0.1" 
                          value={voiceSettings.pitch} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Deep (0.1)</span>
                          <span>High (3.0)</span>
                        </div>
                      </div>

                      <div>
                        <Tooltip 
                          id="volume-level" 
                          content="Controls the output volume level. This affects the loudness of the synthesized speech. Range: 0.0 (silent) to 1.0 (maximum volume)."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Volume: {Math.round(voiceSettings.volume * 100)}%
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'volume-level' ? null : 'volume-level')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ℹ️
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="1.0" 
                          step="0.05" 
                          value={voiceSettings.volume} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Silent (0%)</span>
                          <span>Max (100%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Voice Characteristics */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Advanced Voice Characteristics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <Tooltip 
                          id="emotion-control" 
                          content="Controls the emotional tone of the voice. Different emotions affect intonation, rhythm, and emphasis. Use 'neutral' for business communications, 'friendly' for customer service, 'authoritative' for announcements."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Emotion
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'emotion-control' ? null : 'emotion-control')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ℹ️
                            </button>
                          </label>
                        </Tooltip>
                        <select
                          value={voiceSettings.emotion}
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, emotion: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="neutral">Neutral</option>
                          <option value="friendly">Friendly</option>
                          <option value="authoritative">Authoritative</option>
                          <option value="calm">Calm</option>
                          <option value="energetic">Energetic</option>
                          <option value="professional">Professional</option>
                        </select>
                      </div>

                      <div>
                        <Tooltip 
                          id="speaking-style" 
                          content="Defines the overall speaking approach. 'Conversational' is natural and engaging, 'Formal' is structured and professional, 'Casual' is relaxed and friendly, 'Presentation' is clear and authoritative."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Speaking Style
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'speaking-style' ? null : 'speaking-style')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ℹ️
                            </button>
                          </label>
                        </Tooltip>
                        <select
                          value={voiceSettings.speakingStyle}
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, speakingStyle: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="conversational">Conversational</option>
                          <option value="formal">Formal</option>
                          <option value="casual">Casual</option>
                          <option value="presentation">Presentation</option>
                          <option value="instructional">Instructional</option>
                        </select>
                      </div>

                      <div>
                        <Tooltip 
                          id="emphasis-level" 
                          content="Controls how much emphasis is placed on important words and phrases. 'Normal' provides standard emphasis, 'High' adds more dramatic emphasis, 'Low' creates subtle emphasis."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Emphasis Level
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'emphasis-level' ? null : 'emphasis-level')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ℹ️
                            </button>
                          </label>
                        </Tooltip>
                        <select
                          value={voiceSettings.emphasis}
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, emphasis: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div>
                        <Tooltip 
                          id="voice-style" 
                          content="Overall voice personality and approach. 'Professional' is business-appropriate, 'Friendly' is warm and approachable, 'Authoritative' is confident and commanding, 'Neutral' is balanced."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Voice Style
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'voice-style' ? null : 'voice-style')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ℹ️
                            </button>
                          </label>
                        </Tooltip>
                        <select
                          value={voiceSettings.style}
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, style: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="professional">Professional</option>
                          <option value="friendly">Friendly</option>
                          <option value="authoritative">Authoritative</option>
                          <option value="neutral">Neutral</option>
                          <option value="warm">Warm</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Voice Quality Controls */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Voice Quality & Clarity</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <Tooltip 
                          id="stability" 
                          content="Controls voice consistency and stability. Higher values provide more consistent, predictable speech patterns. Lower values allow for more natural variation but may be less consistent."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Stability: {Math.round(voiceSettings.stability * 100)}%
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'stability' ? null : 'stability')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ℹ️
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="1.0" 
                          step="0.05" 
                          value={voiceSettings.stability} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, stability: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Variable (0%)</span>
                          <span>Stable (100%)</span>
                        </div>
                      </div>

                      <div>
                        <Tooltip 
                          id="clarity" 
                          content="Controls speech clarity and pronunciation precision. Higher values ensure clearer, more precise pronunciation. Lower values may sound more natural but less clear."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Clarity: {Math.round(voiceSettings.clarity * 100)}%
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'clarity' ? null : 'clarity')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ℹ️
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="1.0" 
                          step="0.05" 
                          value={voiceSettings.clarity} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, clarity: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Natural (0%)</span>
                          <span>Clear (100%)</span>
                        </div>
                      </div>

                      <div>
                        <Tooltip 
                          id="breathiness" 
                          content="Adds subtle breathy quality to the voice. Higher values create a softer, more intimate sound. Lower values produce a cleaner, more direct sound. Use sparingly for professional settings."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Breathiness: {Math.round(voiceSettings.breathiness * 100)}%
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'breathiness' ? null : 'breathiness')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ℹ️
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="1.0" 
                          step="0.05" 
                          value={voiceSettings.breathiness} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, breathiness: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Clean (0%)</span>
                          <span>Breathy (100%)</span>
                        </div>
                      </div>

                      <div>
                        <Tooltip 
                          id="roughness" 
                          content="Adds subtle roughness or texture to the voice. Higher values create a more textured, distinctive sound. Lower values produce a smoother, more polished sound."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Roughness: {Math.round(voiceSettings.roughness * 100)}%
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'roughness' ? null : 'roughness')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ℹ️
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="1.0" 
                          step="0.05" 
                          value={voiceSettings.roughness} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Smooth (0%)</span>
                          <span>Rough (100%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enterprise Voice Presets */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <Tooltip 
                      id="voice-presets" 
                      content="Pre-configured voice settings optimized for different business scenarios. Each preset combines multiple voice parameters to achieve specific communication goals. Click any preset to apply those settings instantly."
                    >
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        Enterprise Voice Presets
                        <button
                          onClick={() => setShowTooltip(showTooltip === 'voice-presets' ? null : 'voice-presets')}
                          className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ℹ️
                        </button>
                      </h4>
                    </Tooltip>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button
                        onClick={() => setVoiceSettings({ 
                          rate: 0.9, pitch: 0.9, volume: 0.8, enabled: true,
                          emotion: 'professional', emphasis: 'normal', breathiness: 0.0, roughness: 0.0,
                          stability: 0.9, clarity: 0.9, style: 'professional', accent: 'neutral', speakingStyle: 'formal'
                        })}
                        className="p-4 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <div className="font-medium text-sm mb-1">Executive</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Authoritative, clear, professional tone for leadership communications</div>
                      </button>
                      <button
                        onClick={() => setVoiceSettings({ 
                          rate: 1.0, pitch: 1.0, volume: 0.8, enabled: true,
                          emotion: 'friendly', emphasis: 'normal', breathiness: 0.1, roughness: 0.0,
                          stability: 0.8, clarity: 0.8, style: 'friendly', accent: 'neutral', speakingStyle: 'conversational'
                        })}
                        className="p-4 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <div className="font-medium text-sm mb-1">Customer Service</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Warm, approachable voice for customer interactions and support</div>
                      </button>
                      <button
                        onClick={() => setVoiceSettings({ 
                          rate: 0.8, pitch: 0.8, volume: 0.7, enabled: true,
                          emotion: 'calm', emphasis: 'low', breathiness: 0.0, roughness: 0.0,
                          stability: 0.9, clarity: 0.9, style: 'neutral', accent: 'neutral', speakingStyle: 'instructional'
                        })}
                        className="p-4 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <div className="font-medium text-sm mb-1">Training</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Clear, measured pace for educational content and training materials</div>
                      </button>
                      <button
                        onClick={() => setVoiceSettings({ 
                          rate: 1.1, pitch: 1.1, volume: 0.9, enabled: true,
                          emotion: 'energetic', emphasis: 'high', breathiness: 0.0, roughness: 0.1,
                          stability: 0.7, clarity: 0.8, style: 'authoritative', accent: 'neutral', speakingStyle: 'presentation'
                        })}
                        className="p-4 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <div className="font-medium text-sm mb-1">Marketing</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Dynamic, engaging voice for promotional content and announcements</div>
                      </button>
                    </div>
                  </div>

                  {/* Voice Control Actions */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Tooltip 
                          id="enable-voice" 
                          content="Master switch for AI voice functionality. When enabled, the AI assistant will use voice synthesis for responses. When disabled, the AI will only provide text responses. This setting affects all voice interactions across the system."
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={voiceSettings.enabled}
                              onChange={(e) => setVoiceSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                              className="mr-3"
                            />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                              Enable AI Voice
                              <button
                                onClick={() => setShowTooltip(showTooltip === 'enable-voice' ? null : 'enable-voice')}
                                className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                ℹ️
                              </button>
                            </label>
                          </div>
                        </Tooltip>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Tooltip 
                          id="test-voice" 
                          content="Test the current voice configuration with a comprehensive sample. This will speak a test phrase using all your current voice settings including rate, pitch, volume, emotion, and style. Use this to verify your configuration before deploying."
                        >
                          <button
                            onClick={() => {
                              if ('speechSynthesis' in window && selectedVoice) {
                                const voice = getFilteredVoices().find(v => v.name === selectedVoice);
                                if (voice) {
                                  const utterance = new SpeechSynthesisUtterance('Hello! This is a comprehensive test of my enterprise voice capabilities. I can speak with various tones, speeds, and volumes to match your business needs. My current configuration includes professional-grade voice synthesis with advanced emotional and stylistic controls.');
                                  utterance.voice = voice;
                                  utterance.rate = voiceSettings.rate;
                                  utterance.pitch = voiceSettings.pitch;
                                  utterance.volume = voiceSettings.volume;
                                  speechSynthesis.speak(utterance);
                                }
                              }
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center"
                          >
                            <SpeakerphoneIcon className="h-4 w-4 mr-2" />
                            Test Voice
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowTooltip(showTooltip === 'test-voice' ? null : 'test-voice');
                              }}
                              className="ml-2 w-4 h-4 text-purple-200 hover:text-white"
                            >
                              ℹ️
                            </button>
                          </button>
                        </Tooltip>

                        <Tooltip 
                          id="stop-voice" 
                          content="Immediately stops any currently playing voice synthesis. Use this to interrupt voice output if needed. This will cancel all active speech synthesis across the system."
                        >
                          <button
                            onClick={() => {
                              if ('speechSynthesis' in window) {
                                speechSynthesis.cancel();
                              }
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                          >
                            Stop
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowTooltip(showTooltip === 'stop-voice' ? null : 'stop-voice');
                              }}
                              className="ml-2 w-4 h-4 text-gray-300 hover:text-white"
                            >
                              ℹ️
                            </button>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'collaboration' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Collaboration</h3>
                <p className="text-gray-600 dark:text-gray-400">Collaboration features will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Advanced Settings</h3>
                <p className="text-gray-600 dark:text-gray-400">Advanced settings will be implemented here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAdminPage;
