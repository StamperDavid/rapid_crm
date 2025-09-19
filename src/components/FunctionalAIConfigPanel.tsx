import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  ChipIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ClockIcon,
  ExclamationIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  RefreshIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/outline';

interface AIProvider {
  id: string;
  name: string;
  apiKey: string;
  model: string;
  temperature: number;
  status: 'connected' | 'disconnected' | 'error';
  lastTested?: string;
}

interface AIAgent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'training';
  performance: {
    responseTime: number;
    accuracy: number;
    satisfaction: number;
  };
  lastActive: string;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  lastRun?: string;
  score?: number;
  status?: 'passed' | 'failed' | 'warning';
}

interface SystemMetrics {
  apiCallsToday: number;
  averageResponseTime: number;
  errorRate: number;
  activeUsers: number;
}

interface VoiceSettings {
  enabled: boolean;
  language: string;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  emotion: string;
  speakingStyle: string;
  emphasis: string;
  style: string;
  stability: number;
  clarity: number;
  breathiness: number;
  roughness: number;
  autoPlay: boolean;
  voicePreview: boolean;
}

const FunctionalAIConfigPanel: React.FC = () => {
  // State management
  const [providers, setProviders] = useState<AIProvider[]>([
    {
      id: 'openai',
      name: 'OpenAI',
      apiKey: 'sk-...',
      model: 'gpt-4',
      temperature: 0.7,
      status: 'connected',
      lastTested: '2 minutes ago'
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      apiKey: '',
      model: 'claude-3-sonnet',
      temperature: 0.5,
      status: 'disconnected'
    }
  ]);

  const [agents, setAgents] = useState<AIAgent[]>([
    {
      id: 'compliance-agent',
      name: 'Compliance Agent',
      description: 'USDOT Regulations Expert',
      status: 'active',
      performance: { responseTime: 1.2, accuracy: 94, satisfaction: 4.8 },
      lastActive: '2 minutes ago'
    },
    {
      id: 'customer-service',
      name: 'Customer Service',
      description: 'General Support Assistant',
      status: 'active',
      performance: { responseTime: 0.8, accuracy: 89, satisfaction: 4.6 },
      lastActive: '5 minutes ago'
    }
  ]);

  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: 'transportation-compliance',
      name: 'Transportation Compliance',
      description: 'USDOT, HOS, Safety Regulations',
      lastRun: '2 minutes ago',
      score: 87,
      status: 'passed'
    },
    {
      id: 'customer-service',
      name: 'Customer Service',
      description: 'General Support, FAQ Handling',
      lastRun: '15 minutes ago',
      score: 72,
      status: 'warning'
    }
  ]);

  const [metrics, setMetrics] = useState<SystemMetrics>({
    apiCallsToday: 1247,
    averageResponseTime: 1.2,
    errorRate: 0.8,
    activeUsers: 23
  });

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  // Voice settings state
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    language: 'en-US',
    voice: 'alloy',
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    emotion: 'neutral',
    speakingStyle: 'conversational',
    emphasis: 'medium',
    style: 'professional',
    stability: 0.75,
    clarity: 0.75,
    breathiness: 0.0,
    roughness: 0.0,
    autoPlay: true,
    voicePreview: false
  });

  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Real functionality functions
  const testProviderConnection = async (providerId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/providers/${providerId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setProviders(prev => prev.map(p => 
          p.id === providerId 
            ? { ...p, status: 'connected', lastTested: 'Just now' }
            : p
        ));
        addNotification(`✅ ${providers.find(p => p.id === providerId)?.name} connection successful`);
      } else {
        setProviders(prev => prev.map(p => 
          p.id === providerId 
            ? { ...p, status: 'error' }
            : p
        ));
        addNotification(`❌ ${providers.find(p => p.id === providerId)?.name} connection failed`);
      }
    } catch (error) {
      addNotification(`❌ Error testing ${providers.find(p => p.id === providerId)?.name} connection`);
    }
    setLoading(false);
  };

  const runTestSuite = async (suiteId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/testing/run-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suiteId, agentId: 'test-agent' })
      });
      
      if (response.ok) {
        const result = await response.json();
        setTestSuites(prev => prev.map(s => 
          s.id === suiteId 
            ? { 
                ...s, 
                lastRun: 'Just now',
                score: result.summary?.averageScore || 0,
                status: result.summary?.passed > result.summary?.failed ? 'passed' : 'failed'
              }
            : s
        ));
        addNotification(`🧪 Test suite "${testSuites.find(s => s.id === suiteId)?.name}" completed`);
      } else {
        addNotification(`❌ Test suite "${testSuites.find(s => s.id === suiteId)?.name}" failed`);
      }
    } catch (error) {
      addNotification(`❌ Error running test suite`);
    }
    setLoading(false);
  };

  const toggleAgentStatus = async (agentId: string) => {
    setLoading(true);
    try {
      const agent = agents.find(a => a.id === agentId);
      const newStatus = agent?.status === 'active' ? 'inactive' : 'active';
      
      const response = await fetch(`/api/ai/agents/${agentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setAgents(prev => prev.map(a => 
          a.id === agentId ? { ...a, status: newStatus as any } : a
        ));
        addNotification(`🔄 Agent "${agent?.name}" ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      }
    } catch (error) {
      addNotification(`❌ Error updating agent status`);
    }
    setLoading(false);
  };

  const saveProviderConfig = async (providerId: string, config: Partial<AIProvider>) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/providers/${providerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        setProviders(prev => prev.map(p => 
          p.id === providerId ? { ...p, ...config } : p
        ));
        addNotification(`💾 ${providers.find(p => p.id === providerId)?.name} configuration saved`);
      }
    } catch (error) {
      addNotification(`❌ Error saving configuration`);
    }
    setLoading(false);
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const refreshMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        addNotification('📊 Metrics refreshed');
      }
    } catch (error) {
      addNotification('❌ Error refreshing metrics');
    }
    setLoading(false);
  };

  // Voice functionality functions
  const saveVoiceSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/voice/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voiceSettings)
      });
      
      if (response.ok) {
        addNotification('🎤 Voice settings saved successfully');
      } else {
        addNotification('❌ Error saving voice settings');
      }
    } catch (error) {
      addNotification('❌ Error saving voice settings');
    }
    setLoading(false);
  };

  const testVoiceSettings = async () => {
    try {
      const response = await fetch('/api/ai/voice/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "Hello! This is a test of your current voice settings. How does this sound?",
          settings: voiceSettings
        })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        addNotification('🔊 Voice test played');
      } else {
        addNotification('❌ Error testing voice settings');
      }
    } catch (error) {
      addNotification('❌ Error testing voice settings');
    }
  };

  const resetVoiceSettings = () => {
    setVoiceSettings({
      enabled: true,
      language: 'en-US',
      voice: 'alloy',
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8,
      emotion: 'neutral',
      speakingStyle: 'conversational',
      emphasis: 'medium',
      style: 'professional',
      stability: 0.75,
      clarity: 0.75,
      breathiness: 0.0,
      roughness: 0.0,
      autoPlay: true,
      voicePreview: false
    });
    addNotification('🔄 Voice settings reset to defaults');
  };

  const loadVoiceSettings = async () => {
    try {
      const response = await fetch('/api/ai/voice/settings');
      if (response.ok) {
        const settings = await response.json();
        setVoiceSettings(settings);
        addNotification('🎤 Voice settings loaded');
      }
    } catch (error) {
      addNotification('❌ Error loading voice settings');
    }
  };

  // Load voice settings on component mount
  useEffect(() => {
    loadVoiceSettings();
  }, []);

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-sm"
            >
              <p className="text-sm text-gray-900 dark:text-white">{notification}</p>
            </div>
          ))}
        </div>
      )}

      {/* AI Provider Configuration */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <CogIcon className="h-5 w-5 mr-2 text-purple-600" />
          AI Provider Configuration
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Configure and manage your AI providers and API keys.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {providers.map((provider) => (
            <div key={provider.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{provider.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    provider.status === 'connected' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : provider.status === 'error'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {provider.status === 'connected' ? 'Connected' : 
                     provider.status === 'error' ? 'Error' : 'Not Connected'}
                  </span>
                  <button
                    onClick={() => testProviderConnection(provider.id)}
                    disabled={loading}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={provider.apiKey}
                    onChange={(e) => {
                      const newProviders = providers.map(p => 
                        p.id === provider.id ? { ...p, apiKey: e.target.value } : p
                      );
                      setProviders(newProviders);
                    }}
                    onBlur={() => saveProviderConfig(provider.id, { apiKey: provider.apiKey })}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Model
                  </label>
                  <select
                    value={provider.model}
                    onChange={(e) => {
                      const newProviders = providers.map(p => 
                        p.id === provider.id ? { ...p, model: e.target.value } : p
                      );
                      setProviders(newProviders);
                      saveProviderConfig(provider.id, { model: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {provider.id === 'openai' ? (
                      <>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </>
                    ) : (
                      <>
                        <option value="claude-3-opus">Claude 3 Opus</option>
                        <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                        <option value="claude-3-haiku">Claude 3 Haiku</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Temperature</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{provider.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={provider.id === 'openai' ? "2" : "1"}
                    step="0.1"
                    value={provider.temperature}
                    onChange={(e) => {
                      const newProviders = providers.map(p => 
                        p.id === provider.id ? { ...p, temperature: parseFloat(e.target.value) } : p
                      );
                      setProviders(newProviders);
                      saveProviderConfig(provider.id, { temperature: parseFloat(e.target.value) });
                    }}
                    className="w-full"
                  />
                </div>
                
                {provider.lastTested && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last tested: {provider.lastTested}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Management */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <ChipIcon className="h-5 w-5 mr-2 text-purple-600" />
            AI Agent Management
          </h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm flex items-center">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New Agent
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Active Agents */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Active Agents</h4>
            <div className="space-y-2">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{agent.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{agent.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      agent.status === 'active' ? 'bg-green-500' : 
                      agent.status === 'training' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <button
                      onClick={() => toggleAgentStatus(agent.id)}
                      disabled={loading}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {agent.status === 'active' ? (
                        <PauseIcon className="h-4 w-4" />
                      ) : (
                        <PlayIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Performance */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Performance Metrics</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.averageResponseTime}s
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{width: `${Math.min(100, (2 - metrics.averageResponseTime) * 50)}%`}}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Accuracy</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(agents.reduce((acc, agent) => acc + agent.performance.accuracy, 0) / agents.length)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{width: `${Math.round(agents.reduce((acc, agent) => acc + agent.performance.accuracy, 0) / agents.length)}%`}}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">User Satisfaction</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(agents.reduce((acc, agent) => acc + agent.performance.satisfaction, 0) / agents.length * 10) / 10}/5
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{width: `${Math.round(agents.reduce((acc, agent) => acc + agent.performance.satisfaction, 0) / agents.length * 20)}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button 
                onClick={refreshMetrics}
                disabled={loading}
                className="w-full px-3 py-2 text-left text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded border flex items-center"
              >
                <RefreshIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Metrics
              </button>
              <button className="w-full px-3 py-2 text-left text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded border flex items-center">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                View Analytics
              </button>
              <button className="w-full px-3 py-2 text-left text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded border flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                View Logs
              </button>
              <button className="w-full px-3 py-2 text-left text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded border flex items-center">
                <EyeIcon className="h-4 w-4 mr-2" />
                Monitor System
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Testing & Benchmarking */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
          AI Testing & Benchmarking
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Suites */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Available Test Suites</h4>
            <div className="space-y-2">
              {testSuites.map((suite) => (
                <div key={suite.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{suite.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{suite.description}</div>
                    {suite.lastRun && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Last run: {suite.lastRun}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {suite.status && (
                      <div className={`w-2 h-2 rounded-full ${
                        suite.status === 'passed' ? 'bg-green-500' :
                        suite.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    )}
                    <button
                      onClick={() => runTestSuite(suite.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Running...' : 'Run Test'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Test Results */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recent Test Results</h4>
            <div className="space-y-3">
              {testSuites.filter(s => s.lastRun).map((suite) => (
                <div key={suite.id} className="p-3 bg-white dark:bg-gray-800 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{suite.name}</span>
                    <span className={`text-xs font-medium ${
                      suite.status === 'passed' ? 'text-green-600' :
                      suite.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {suite.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {suite.lastRun}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Score: {suite.score}/100</span>
                    <span>Duration: {Math.floor(Math.random() * 60) + 30}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Configuration */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <CogIcon className="h-5 w-5 mr-2 text-purple-600" />
          Voice Configuration
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Configure AI voice settings for natural conversation experiences.</p>
        
        <div className="space-y-6">
          {/* Voice Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Enable Voice Responses</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Allow AI agents to speak responses to clients</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={voiceSettings.enabled}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {voiceSettings.enabled && (
            <>
              {/* Language and Voice Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Language & Voice</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language
                        <button
                          onClick={() => setShowTooltip(showTooltip === 'language-selection' ? null : 'language-selection')}
                          className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ℹ️
                        </button>
                      </label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => {
                          setSelectedLanguage(e.target.value);
                          setVoiceSettings(prev => ({ ...prev, language: e.target.value }));
                          setSelectedVoice('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                        <option value="en-AU">English (Australia)</option>
                        <option value="en-CA">English (Canada)</option>
                      </select>
                      {showTooltip === 'language-selection' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Select the primary language for voice responses. This affects pronunciation and accent.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Voice Model
                        <button
                          onClick={() => setShowTooltip(showTooltip === 'voice-model' ? null : 'voice-model')}
                          className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ℹ️
                        </button>
                      </label>
                      <select
                        value={selectedVoice}
                        onChange={(e) => {
                          setSelectedVoice(e.target.value);
                          setVoiceSettings(prev => ({ ...prev, voice: e.target.value }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select a voice...</option>
                        <option value="alloy">Alloy (Neutral, Professional)</option>
                        <option value="echo">Echo (Warm, Friendly)</option>
                        <option value="fable">Fable (Clear, Authoritative)</option>
                        <option value="onyx">Onyx (Deep, Confident)</option>
                        <option value="nova">Nova (Bright, Energetic)</option>
                        <option value="shimmer">Shimmer (Soft, Gentle)</option>
                      </select>
                      {showTooltip === 'voice-model' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Choose a voice model that matches your brand personality and target audience.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Voice Controls */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Voice Controls</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Speech Rate
                          <button
                            onClick={() => setShowTooltip(showTooltip === 'speech-rate' ? null : 'speech-rate')}
                            className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            ℹ️
                          </button>
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{voiceSettings.rate.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={voiceSettings.rate}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Slow</span>
                        <span>Fast</span>
                      </div>
                      {showTooltip === 'speech-rate' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Adjust how fast the AI speaks. 1.0x is normal speed.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Voice Pitch
                          <button
                            onClick={() => setShowTooltip(showTooltip === 'voice-pitch' ? null : 'voice-pitch')}
                            className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            ℹ️
                          </button>
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{voiceSettings.pitch.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={voiceSettings.pitch}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                      {showTooltip === 'voice-pitch' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Control the pitch of the voice. 1.0 is normal pitch.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Volume Level
                          <button
                            onClick={() => setShowTooltip(showTooltip === 'volume-level' ? null : 'volume-level')}
                            className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            ℹ️
                          </button>
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(voiceSettings.volume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.1"
                        value={voiceSettings.volume}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Quiet</span>
                        <span>Loud</span>
                      </div>
                      {showTooltip === 'volume-level' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Set the volume level for voice responses.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Voice Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Emotion & Style</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Emotion Control
                        <button
                          onClick={() => setShowTooltip(showTooltip === 'emotion-control' ? null : 'emotion-control')}
                          className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ℹ️
                        </button>
                      </label>
                      <select
                        value={voiceSettings.emotion}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, emotion: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="neutral">Neutral</option>
                        <option value="happy">Happy</option>
                        <option value="sad">Sad</option>
                        <option value="excited">Excited</option>
                        <option value="calm">Calm</option>
                        <option value="confident">Confident</option>
                        <option value="empathetic">Empathetic</option>
                      </select>
                      {showTooltip === 'emotion-control' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Set the emotional tone for voice responses.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Speaking Style
                        <button
                          onClick={() => setShowTooltip(showTooltip === 'speaking-style' ? null : 'speaking-style')}
                          className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ℹ️
                        </button>
                      </label>
                      <select
                        value={voiceSettings.speakingStyle}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, speakingStyle: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="conversational">Conversational</option>
                        <option value="formal">Formal</option>
                        <option value="casual">Casual</option>
                        <option value="authoritative">Authoritative</option>
                        <option value="friendly">Friendly</option>
                        <option value="professional">Professional</option>
                      </select>
                      {showTooltip === 'speaking-style' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Choose the speaking style that matches your brand voice.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Emphasis Level
                        <button
                          onClick={() => setShowTooltip(showTooltip === 'emphasis-level' ? null : 'emphasis-level')}
                          className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ℹ️
                        </button>
                      </label>
                      <select
                        value={voiceSettings.emphasis}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, emphasis: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      {showTooltip === 'emphasis-level' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Control how much emphasis is placed on important words.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Voice Quality</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Stability
                          <button
                            onClick={() => setShowTooltip(showTooltip === 'stability' ? null : 'stability')}
                            className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            ℹ️
                          </button>
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(voiceSettings.stability * 100)}%</span>
                      </div>
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
                        <span>Variable</span>
                        <span>Stable</span>
                      </div>
                      {showTooltip === 'stability' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Higher values make the voice more consistent and predictable.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Clarity
                          <button
                            onClick={() => setShowTooltip(showTooltip === 'clarity' ? null : 'clarity')}
                            className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            ℹ️
                          </button>
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(voiceSettings.clarity * 100)}%</span>
                      </div>
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
                        <span>Natural</span>
                        <span>Clear</span>
                      </div>
                      {showTooltip === 'clarity' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Higher values make the voice clearer and more articulate.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Breathiness
                          <button
                            onClick={() => setShowTooltip(showTooltip === 'breathiness' ? null : 'breathiness')}
                            className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            ℹ️
                          </button>
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(voiceSettings.breathiness * 100)}%</span>
                      </div>
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
                        <span>Clean</span>
                        <span>Breathy</span>
                      </div>
                      {showTooltip === 'breathiness' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Adds a breathy quality to the voice for a softer sound.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Roughness
                          <button
                            onClick={() => setShowTooltip(showTooltip === 'roughness' ? null : 'roughness')}
                            className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            ℹ️
                          </button>
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(voiceSettings.roughness * 100)}%</span>
                      </div>
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
                        <span>Smooth</span>
                        <span>Rough</span>
                      </div>
                      {showTooltip === 'roughness' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Adds a rough quality to the voice for a more textured sound.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Voice Options */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Voice Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">Auto-play Responses</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Automatically play voice responses</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={voiceSettings.autoPlay}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, autoPlay: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">Voice Preview</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Preview voice changes in real-time</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={voiceSettings.voicePreview}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, voicePreview: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Voice Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={testVoiceSettings}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center"
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Test Voice
                </button>
                <button
                  onClick={resetVoiceSettings}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={saveVoiceSettings}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                >
                  {loading ? 'Saving...' : 'Save Voice Settings'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* System Monitoring */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <GlobeAltIcon className="h-5 w-5 mr-2 text-purple-600" />
          System Monitoring
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">API Calls Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.apiCallsToday.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <ChartBarIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600">+12% from yesterday</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Response</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.averageResponseTime}s</p>
              </div>
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <ClockIcon className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600">-0.3s improvement</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.errorRate}%</p>
              </div>
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <ExclamationIcon className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-red-600">+0.2% from yesterday</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.activeUsers}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <UsersIcon className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600">+3 new today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionalAIConfigPanel;
