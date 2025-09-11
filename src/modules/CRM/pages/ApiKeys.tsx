import React, { useState, useEffect } from 'react';
import {
  KeyIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CircleStackIcon,
  CpuChipIcon,
  CloudIcon,
  ServerIcon,
  LinkIcon,
  CogIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { databaseService } from '../../../services/database';
import DatabaseConfigModal from '../../../components/DatabaseConfigModal';
import { DatabaseConfig } from '../../../services/databaseConnection';

interface ApiKey {
  id: string;
  name: string;
  platform: 'google_cloud' | 'openai' | 'anthropic' | 'openrouter' | 'aws' | 'azure' | 'custom';
  key: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  usageCount: number;
  permissions: string[];
  environment: 'development' | 'staging' | 'production';
  tags: string[];
}

interface DatabaseStatus {
  isConnected: boolean;
  type?: string;
  lastChecked: string;
  error?: string;
}

const platformOptions = [
  { value: 'google_cloud', label: 'Google Cloud', icon: CloudIcon, color: 'text-blue-600' },
  { value: 'openai', label: 'OpenAI', icon: CpuChipIcon, color: 'text-green-600' },
  { value: 'anthropic', label: 'Anthropic', icon: CpuChipIcon, color: 'text-orange-600' },
  { value: 'openrouter', label: 'OpenRouter', icon: CpuChipIcon, color: 'text-purple-600' },
  { value: 'aws', label: 'AWS', icon: ServerIcon, color: 'text-yellow-600' },
  { value: 'azure', label: 'Azure', icon: CloudIcon, color: 'text-blue-500' },
  { value: 'custom', label: 'Custom', icon: CogIcon, color: 'text-gray-600' },
];

const platformIcons = {
  google_cloud: CloudIcon,
  openai: CpuChipIcon,
  anthropic: CpuChipIcon,
  openrouter: CpuChipIcon,
  aws: ServerIcon,
  azure: CloudIcon,
  custom: CogIcon,
};

const platformColors = {
  google_cloud: 'text-blue-600',
  openai: 'text-green-600',
  anthropic: 'text-orange-600',
  openrouter: 'text-purple-600',
  aws: 'text-yellow-600',
  azure: 'text-blue-500',
  custom: 'text-gray-600',
};

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Google Cloud Vertex AI',
    platform: 'google_cloud',
    key: 'AIzaSyBvOkBwvOkBwvOkBwvOkBwvOkBwvOkBwvOk',
    description: 'Primary Google Cloud API key for Vertex AI services',
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    lastUsed: '2024-01-20T16:30:00Z',
    usageCount: 1247,
    permissions: ['vertex-ai', 'document-ai', 'discovery-engine', 'natural-language'],
    environment: 'production',
    tags: ['ai', 'ml', 'production']
  },
  {
    id: '2',
    name: 'Google Cloud Document AI',
    platform: 'google_cloud',
    key: 'AIzaSyCxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbC',
    description: 'Google Cloud Document AI for processing USDOT forms and documents',
    isActive: true,
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-20T15:20:00Z',
    lastUsed: '2024-01-20T17:45:00Z',
    usageCount: 89,
    permissions: ['document-ai', 'form-parsing', 'text-extraction', 'ocr'],
    environment: 'production',
    tags: ['document-processing', 'usdot', 'forms', 'production']
  },
  {
    id: '3',
    name: 'Google Cloud Natural Language API',
    platform: 'google_cloud',
    key: 'AIzaSyDxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCd',
    description: 'Natural Language API for sentiment analysis and text processing',
    isActive: true,
    createdAt: '2024-01-17T11:30:00Z',
    updatedAt: '2024-01-20T16:10:00Z',
    lastUsed: '2024-01-20T18:15:00Z',
    usageCount: 156,
    permissions: ['natural-language', 'sentiment-analysis', 'entity-extraction', 'syntax-analysis'],
    environment: 'production',
    tags: ['nlp', 'sentiment', 'text-analysis', 'production']
  },
  {
    id: '4',
    name: 'Google Cloud Discovery Engine',
    platform: 'google_cloud',
    key: 'AIzaSyExYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCe',
    description: 'Discovery Engine for regulatory knowledge base and search',
    isActive: true,
    createdAt: '2024-01-18T14:20:00Z',
    updatedAt: '2024-01-20T17:30:00Z',
    lastUsed: '2024-01-20T19:00:00Z',
    usageCount: 67,
    permissions: ['discovery-engine', 'search', 'knowledge-base', 'regulatory-data'],
    environment: 'production',
    tags: ['search', 'knowledge-base', 'regulatory', 'production']
  },
  {
    id: '5',
    name: 'Google Cloud Translation API',
    platform: 'google_cloud',
    key: 'AIzaSyFxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCf',
    description: 'Translation API for multi-language support in conversations',
    isActive: true,
    createdAt: '2024-01-19T10:45:00Z',
    updatedAt: '2024-01-20T18:00:00Z',
    lastUsed: '2024-01-20T19:30:00Z',
    usageCount: 34,
    permissions: ['translation', 'language-detection', 'multi-language'],
    environment: 'production',
    tags: ['translation', 'multi-language', 'production']
  },
  {
    id: '6',
    name: 'Kixie Power Dialer',
    platform: 'custom',
    key: 'kx_live_abc123def456ghi789jkl012mno345pqr678',
    description: 'Kixie Power Dialer API for automated calling and call tracking',
    isActive: true,
    createdAt: '2024-01-20T08:30:00Z',
    updatedAt: '2024-01-20T19:45:00Z',
    lastUsed: '2024-01-20T20:15:00Z',
    usageCount: 23,
    permissions: ['power-dialing', 'call-recording', 'call-analytics', 'lead-tracking'],
    environment: 'production',
    tags: ['calling', 'power-dialer', 'sales', 'production']
  },
  {
    id: '7',
    name: 'OpenAI GPT-4',
    platform: 'openai',
    key: 'sk-proj-abc123def456ghi789jkl012mno345pqr678',
    description: 'OpenAI API key for GPT-4 and other models',
    isActive: true,
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
    lastUsed: '2024-01-20T15:45:00Z',
    usageCount: 892,
    permissions: ['gpt-4', 'gpt-3.5-turbo', 'embeddings', 'moderations'],
    environment: 'production',
    tags: ['llm', 'chat', 'production']
  },
  {
    id: '8',
    name: 'OpenRouter API',
    platform: 'openrouter',
    key: 'sk-or-v1-abc123def456ghi789jkl012mno345pqr678',
    description: 'OpenRouter API key for accessing multiple LLM providers',
    isActive: true,
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-19T16:10:00Z',
    lastUsed: '2024-01-20T17:15:00Z',
    usageCount: 456,
    permissions: ['claude', 'gpt-4', 'llama', 'gemini'],
    environment: 'production',
    tags: ['llm', 'multi-provider', 'production']
  },
  {
    id: '9',
    name: 'Anthropic Claude',
    platform: 'anthropic',
    key: 'sk-ant-api03-abc123def456ghi789jkl012mno345pqr678',
    description: 'Anthropic Claude API key for advanced reasoning tasks',
    isActive: false,
    createdAt: '2024-01-08T13:45:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastUsed: '2024-01-15T09:20:00Z',
    usageCount: 234,
    permissions: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    environment: 'development',
    tags: ['llm', 'reasoning', 'development']
  }
];

const ApiKeys: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>({
    isConnected: false,
    lastChecked: new Date().toISOString()
  });
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load API keys from database
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const dbApiKeys = await databaseService.getApiKeys();
        if (dbApiKeys.length > 0) {
          setApiKeys(dbApiKeys);
        }
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    };

    loadApiKeys();
  }, []);

  // Check database connection status
  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        // This would be a real database check in production
        setDatabaseStatus({
          isConnected: true,
          type: 'PostgreSQL',
          lastChecked: new Date().toISOString()
        });
      } catch (error) {
        setDatabaseStatus({
          isConnected: false,
          lastChecked: new Date().toISOString(),
          error: 'Connection failed'
        });
      }
    };

    checkDatabaseStatus();
    const interval = setInterval(checkDatabaseStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCreateKey = async (keyData: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newKey = await databaseService.createApiKey(keyData);
      setApiKeys(prev => [...prev, newKey]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const handleUpdateKey = async (id: string, updates: Partial<ApiKey>) => {
    try {
      const updatedKey = await databaseService.updateApiKey(id, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      setApiKeys(prev => prev.map(key => key.id === id ? updatedKey : key));
      setEditingKey(null);
    } catch (error) {
      console.error('Error updating API key:', error);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      try {
        await databaseService.deleteApiKey(id);
        setApiKeys(prev => prev.filter(key => key.id !== id));
      } catch (error) {
        console.error('Error deleting API key:', error);
      }
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const filteredKeys = apiKeys.filter(key => {
    const matchesFilter = filter === 'all' || (filter === 'active' ? key.isActive : !key.isActive);
    const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPlatformIcon = (platform: string) => {
    const IconComponent = platformIcons[platform as keyof typeof platformIcons] || CogIcon;
    return IconComponent;
  };

  const getPlatformColor = (platform: string) => {
    return platformColors[platform as keyof typeof platformColors] || 'text-gray-600';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Keys</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage API keys and database connections for your CRM platform
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDatabaseModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600"
            >
              <CircleStackIcon className="h-4 w-4 mr-2" />
              Database Config
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add API Key
            </button>
          </div>
        </div>
      </div>

      {/* Database Status */}
      <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CircleStackIcon className={`h-8 w-8 ${databaseStatus?.isConnected ? 'text-green-600' : 'text-red-600'}`} />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Database Connection
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {databaseStatus?.isConnected ? `Connected to ${databaseStatus.type}` : 'Not connected'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {databaseStatus?.isConnected ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last checked: {new Date(databaseStatus?.lastChecked).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search API keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filter === 'inactive'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* API Keys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKeys.map((apiKey) => {
          const IconComponent = getPlatformIcon(apiKey.platform);
          const colorClass = getPlatformColor(apiKey.platform);
          
          return (
            <div key={apiKey.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <IconComponent className={`h-6 w-6 ${colorClass}`} />
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {apiKey.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {platformOptions.find(p => p.value === apiKey.platform)?.label}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingKey(apiKey)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteKey(apiKey.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {apiKey.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {apiKey.description}
                </p>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Key</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showKey[apiKey.id] ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    apiKey.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }`}>
                    {apiKey.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Environment</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    apiKey.environment === 'production'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      : apiKey.environment === 'staging'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                  }`}>
                    {apiKey.environment}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Usage Count</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {apiKey.usageCount.toLocaleString()}
                  </span>
                </div>

                {apiKey.lastUsed && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Used</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(apiKey.lastUsed).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {apiKey.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredKeys.length === 0 && (
        <div className="text-center py-12">
          <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No API keys found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first API key.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add API Key
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            
            <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create API Key
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleCreateKey({
                    name: formData.get('name') as string,
                    platform: formData.get('platform') as ApiKey['platform'],
                    key: formData.get('key') as string,
                    description: formData.get('description') as string,
                    isActive: true,
                    usageCount: 0,
                    permissions: [],
                    environment: formData.get('environment') as ApiKey['environment'],
                    tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean)
                  });
                }}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Platform
                  </label>
                  <select
                    name="platform"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    {platformOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key
                  </label>
                  <input
                    type="text"
                    name="key"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Environment
                  </label>
                  <select
                    name="environment"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="ai, production, ml"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Create API Key
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Database Configuration Modal */}
      <DatabaseConfigModal
        isOpen={showDatabaseModal}
        onClose={() => setShowDatabaseModal(false)}
        onSave={(config: DatabaseConfig) => {
          console.log('Database configuration saved:', config);
          setShowDatabaseModal(false);
        }}
      />
    </div>
  );
};

export default ApiKeys;
