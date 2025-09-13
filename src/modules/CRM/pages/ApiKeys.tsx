import React, { useState, useEffect, useMemo } from 'react';
import {
  KeyIcon,
  PlusIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationIcon,
  DatabaseIcon,
  ChipIcon,
  CloudIcon,
  ServerIcon,
  GlobeAltIcon,
  CogIcon,
  ShieldCheckIcon,
  XIcon,
  RefreshIcon,
  DocumentDownloadIcon,
  DocumentAddIcon,
} from '@heroicons/react/outline';
import { useApiKeys } from '../../../hooks/useApiKeys';
import { useAIProviders } from '../../../hooks/useAIProviders';

// Import ApiKey from schema
import { ApiKey } from '../../../types/schema';

const platformOptions = [
  { value: 'google', label: 'Google Cloud', icon: CloudIcon, color: 'text-blue-600' },
  { value: 'openai', label: 'OpenAI', icon: ChipIcon, color: 'text-green-600' },
  { value: 'anthropic', label: 'Anthropic', icon: ChipIcon, color: 'text-orange-600' },
  { value: 'openrouter', label: 'OpenRouter', icon: ChipIcon, color: 'text-cyan-600' },
  { value: 'kixie', label: 'Kixie', icon: GlobeAltIcon, color: 'text-purple-600' },
  { value: 'stripe', label: 'Stripe', icon: ServerIcon, color: 'text-indigo-500' },
  { value: 'quickbooks', label: 'QuickBooks', icon: CloudIcon, color: 'text-blue-500' },
  { value: 'custom', label: 'Custom', icon: CogIcon, color: 'text-gray-600' },
];

const platformIcons = {
  google: CloudIcon,
  openai: ChipIcon,
  anthropic: ChipIcon,
  openrouter: ChipIcon,
  kixie: GlobeAltIcon,
  stripe: ServerIcon,
  quickbooks: CloudIcon,
  custom: CogIcon,
};

const platformColors = {
  google: 'text-blue-600',
  openai: 'text-green-600',
  anthropic: 'text-orange-600',
  openrouter: 'text-cyan-600',
  kixie: 'text-purple-600',
  stripe: 'text-indigo-500',
  quickbooks: 'text-blue-500',
  custom: 'text-gray-600',
};

const ApiKeys: React.FC = () => {
  // Use the new API Keys hook
  const {
    apiKeys,
    analytics,
    loading,
    error,
    isInitialized,
    initialize,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    getDecryptedApiKey,
    validateApiKey,
    validateAllApiKeys,
    generateApiKey,
    exportApiKeys,
    importApiKeys,
    refreshApiKeys
  } = useApiKeys();
  const { refreshProviders } = useAIProviders();

  // Preconfigured API keys with blank values for user to fill in
  const preconfiguredApiKeys: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Google Cloud Service Account',
      platform: 'google',
      key: '', // Leave blank for user to fill in
      description: 'Google Cloud Service Account JSON key for Vertex AI, Document AI, and Storage services',
      status: 'inactive',
      environment: 'production',
      permissions: ['vertex-ai', 'document-ai', 'storage', 'discovery-engine', 'natural-language'],
      tags: ['service-account', 'vertex-ai', 'document-ai', 'storage', 'production'],
      usageCount: 0
    },
    {
      name: 'Google Cloud API Key',
      platform: 'google',
      key: '', // Leave blank for user to fill in
      description: 'Google Cloud API Key for Vision, Translation, Speech, and other REST APIs',
      status: 'inactive',
      environment: 'production',
      permissions: ['vision', 'translation', 'speech-to-text', 'text-to-speech', 'natural-language'],
      tags: ['api-key', 'vision', 'translation', 'speech', 'production'],
      usageCount: 0
    },
    {
      name: 'OpenAI GPT-4',
      platform: 'openai',
      key: '', // Leave blank for user to fill in
      description: 'OpenAI GPT-4 for advanced AI conversations and reasoning',
      status: 'inactive',
      environment: 'production',
      permissions: ['gpt-4', 'chat-completions', 'text-generation'],
      tags: ['ai', 'gpt-4', 'conversations', 'production'],
      usageCount: 0
    },
    {
      name: 'OpenAI GPT-3.5 Turbo',
      platform: 'openai',
      key: '', // Leave blank for user to fill in
      description: 'OpenAI GPT-3.5 Turbo for fast AI responses',
      status: 'inactive',
      environment: 'production',
      permissions: ['gpt-3.5-turbo', 'chat-completions', 'text-generation'],
      tags: ['ai', 'gpt-3.5', 'conversations', 'production'],
      usageCount: 0
    },
    {
      name: 'OpenAI Embeddings',
      platform: 'openai',
      key: '', // Leave blank for user to fill in
      description: 'OpenAI Embeddings for semantic search and knowledge base',
      status: 'inactive',
      environment: 'production',
      permissions: ['embeddings', 'text-embedding', 'semantic-search'],
      tags: ['embeddings', 'search', 'knowledge-base', 'production'],
      usageCount: 0
    },
    {
      name: 'Anthropic Claude 3.5 Sonnet',
      platform: 'anthropic',
      key: '', // Leave blank for user to fill in
      description: 'Anthropic Claude 3.5 Sonnet for advanced reasoning and analysis',
      status: 'inactive',
      environment: 'production',
      permissions: ['claude-3.5-sonnet', 'messages', 'text-generation'],
      tags: ['ai', 'claude', 'reasoning', 'production'],
      usageCount: 0
    },
    {
      name: 'Anthropic Claude 3 Haiku',
      platform: 'anthropic',
      key: '', // Leave blank for user to fill in
      description: 'Anthropic Claude 3 Haiku for fast, cost-effective AI responses',
      status: 'inactive',
      environment: 'production',
      permissions: ['claude-3-haiku', 'messages', 'text-generation'],
      tags: ['ai', 'claude', 'fast', 'production'],
      usageCount: 0
    },
    {
      name: 'Kixie Power Dialer',
      platform: 'kixie',
      key: '', // Leave blank for user to fill in
      description: 'Kixie Power Dialer API for automated calling and lead management',
      status: 'inactive',
      environment: 'production',
      permissions: ['power-dialer', 'calling', 'lead-management', 'crm-integration'],
      tags: ['calling', 'dialer', 'leads', 'production'],
      usageCount: 0
    },
    {
      name: 'Kixie SMS',
      platform: 'kixie',
      key: '', // Leave blank for user to fill in
      description: 'Kixie SMS API for text messaging and communication',
      status: 'inactive',
      environment: 'production',
      permissions: ['sms', 'text-messaging', 'communication'],
      tags: ['sms', 'messaging', 'communication', 'production'],
      usageCount: 0
    },
    {
      name: 'Stripe Payment Processing',
      platform: 'stripe',
      key: '', // Leave blank for user to fill in
      description: 'Stripe API for payment processing and subscription management',
      status: 'inactive',
      environment: 'production',
      permissions: ['payments', 'subscriptions', 'invoicing', 'webhooks'],
      tags: ['payments', 'stripe', 'billing', 'production'],
      usageCount: 0
    },
    {
      name: 'QuickBooks Online',
      platform: 'quickbooks',
      key: '', // Leave blank for user to fill in
      description: 'QuickBooks Online API for accounting and financial management',
      status: 'inactive',
      environment: 'production',
      permissions: ['accounting', 'invoicing', 'expenses', 'reports'],
      tags: ['accounting', 'quickbooks', 'finance', 'production'],
      usageCount: 0
    },
    {
      name: 'Google Gemini API',
      platform: 'google',
      key: '', // Leave blank for user to fill in
      description: 'Google Gemini API key for Gemini Pro and Flash models (separate from Vertex AI)',
      status: 'inactive',
      environment: 'production',
      permissions: ['gemini-pro', 'gemini-flash', 'multimodal', 'text-generation', 'image-analysis'],
      tags: ['gemini', 'ai', 'multimodal', 'production'],
      usageCount: 0
    },
    {
      name: 'OpenRouter API',
      platform: 'openrouter',
      key: '', // Leave blank for user to fill in
      description: 'OpenRouter API for access to multiple AI models including Claude, GPT, and others',
      status: 'inactive',
      environment: 'production',
      permissions: ['multiple-models', 'claude', 'gpt', 'llama', 'mistral', 'text-generation'],
      tags: ['ai', 'multiple-models', 'openrouter', 'production'],
      usageCount: 0
    }
  ];

  // Local state for UI
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [validatingKeys, setValidatingKeys] = useState<Set<string>>(new Set());

  // Merge existing API keys with preconfigured templates
  const allApiKeys = useMemo(() => {
    const existingKeyNames = new Set(apiKeys.map(key => key.name));
    const missingPreconfigured = preconfiguredApiKeys.filter(
      template => !existingKeyNames.has(template.name)
    );
    
    // Convert preconfigured templates to full ApiKey objects with temporary IDs
    const templateKeys: ApiKey[] = missingPreconfigured.map((template, index) => ({
      ...template,
      id: `template-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    return [...apiKeys, ...templateKeys];
  }, [apiKeys, preconfiguredApiKeys]);

  // Calculate analytics based on all API keys (including templates)
  const allAnalytics = useMemo(() => {
    const totalKeys = allApiKeys.length;
    const activeKeys = allApiKeys.filter(key => key.status === 'active').length;
    const expiredKeys = allApiKeys.filter(key => key.status === 'expired').length;
    const totalRequests = allApiKeys.reduce((sum, key) => sum + (key.usageCount || 0), 0);
    
    return {
      totalKeys,
      activeKeys,
      expiredKeys,
      totalRequests
    };
  }, [allApiKeys]);

  // Auto-initialize the service without password requirement
  useEffect(() => {
    const autoInitialize = async () => {
      if (!isInitialized) {
        try {
          // Initialize with a default password since encryption is still required
          await initialize('default-password');
        } catch (error) {
          console.error('Failed to auto-initialize API key service:', error);
        }
      }
    };
    autoInitialize();
  }, [isInitialized, initialize]);

  // Initialize preconfigured API keys (only if they don't already exist)
  const handleInitializePreconfiguredKeys = async () => {
    try {
      // Check if any API keys already exist
      if (apiKeys.length > 0) {
        alert('API keys already exist! Use the "Add API Key" button to add new ones.');
        return;
      }

      for (const keyData of preconfiguredApiKeys) {
        await createApiKey(keyData);
      }
      alert('Successfully initialized all preconfigured API keys! You can now fill in your actual API keys.');
    } catch (error) {
      console.error('Failed to initialize preconfigured API keys:', error);
      alert('Failed to initialize some API keys. Please try again.');
    }
  };

  // Handle creating a new API key
  const handleCreateKey = async (keyData: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('handleCreateKey called with:', keyData);
      console.log('createApiKey function:', createApiKey);
      const result = await createApiKey(keyData);
      console.log('API key created successfully:', result);
      setShowCreateModal(false);
      // Refresh AI providers with new API key
      await refreshProviders();
      // Refresh the API keys list
      await refreshApiKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  // Handle updating an API key
  const handleUpdateKey = async (id: string, updates: Partial<ApiKey>) => {
    try {
      console.log('handleUpdateKey called with id:', id, 'updates:', updates);
      const result = await updateApiKey(id, updates);
      console.log('API key updated successfully:', result);
      setEditingKey(null);
      // Refresh AI providers with updated API key
      await refreshProviders();
      // Refresh the API keys list
      await refreshApiKeys();
    } catch (error) {
      console.error('Error updating API key:', error);
    }
  };

  // Handle deleting an API key
  const handleDeleteKey = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      try {
        await deleteApiKey(id);
      } catch (error) {
        console.error('Error deleting API key:', error);
      }
    }
  };

  // Handle validating an API key
  const handleValidateKey = async (id: string) => {
    setValidatingKeys(prev => new Set(prev).add(id));
    try {
      await validateApiKey(id);
    } catch (error) {
      console.error('Error validating API key:', error);
    } finally {
      setValidatingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Handle validating all API keys
  const handleValidateAllKeys = async () => {
    try {
      await validateAllApiKeys();
    } catch (error) {
      console.error('Error validating all API keys:', error);
    }
  };

  // Handle exporting API keys
  const handleExportKeys = async () => {
    try {
      const exportData = await exportApiKeys();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-keys-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting API keys:', error);
    }
  };

  // Handle importing API keys
  const handleImportKeys = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const importedCount = await importApiKeys(text);
        alert(`Successfully imported ${importedCount} API keys`);
      } catch (error) {
        console.error('Error importing API keys:', error);
        alert('Failed to import API keys. Please check the file format.');
      }
    }
  };

  // Toggle key visibility
  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  // Get filtered API keys
  const filteredApiKeys = allApiKeys.filter(key => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && key.status === 'active') ||
      (filter === 'inactive' && key.status !== 'active');
    
    const matchesSearch = searchTerm === '' || 
      key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    const IconComponent = platformIcons[platform as keyof typeof platformIcons] || CogIcon;
    return <IconComponent className="h-5 w-5" />;
  };

  // Get platform color
  const getPlatformColor = (platform: string) => {
    return platformColors[platform as keyof typeof platformColors] || 'text-gray-600';
  };

  // Get status color
  const getStatusColor = (status: ApiKey['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'revoked': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Skip password modal - auto-initialize instead

  if (loading && allApiKeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading API keys</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and secure your API keys for various services
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleValidateAllKeys}
              className="px-3 py-2 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Validate All
            </button>
            <button
              onClick={handleExportKeys}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <DocumentDownloadIcon className="h-4 w-4 inline mr-1" />
              Export
            </button>
            <label className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
              <DocumentAddIcon className="h-4 w-4 inline mr-1" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportKeys}
                className="hidden"
              />
            </label>
            <button
              onClick={() => {
                console.log('Add API Key button clicked, clearing editingKey');
                setEditingKey(null);
                setShowCreateModal(true);
                console.log('editingKey should now be null');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 inline mr-1" />
              Add API Key
            </button>
          </div>
        </div>

        {/* Analytics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{allAnalytics.totalKeys}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total Keys</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{allAnalytics.activeKeys}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Active</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{allAnalytics.expiredKeys}</div>
            <div className="text-sm text-red-600 dark:text-red-400">Expired</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{allAnalytics.totalRequests}</div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Total Requests</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search API keys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Keys</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={refreshApiKeys}
              className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <RefreshIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            API Keys ({filteredApiKeys.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredApiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${getPlatformColor(apiKey.platform)} bg-gray-100 dark:bg-gray-700`}>
                    {getPlatformIcon(apiKey.platform)}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{apiKey.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{apiKey.platform}</p>
                    {apiKey.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{apiKey.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(apiKey.status)}`}>
                    {apiKey.status}
                  </span>
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showKey[apiKey.id] ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleValidateKey(apiKey.id)}
                    disabled={validatingKeys.has(apiKey.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                  >
                    {validatingKeys.has(apiKey.id) ? (
                      <RefreshIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircleIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingKey(apiKey)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteKey(apiKey.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Created: {formatDate(apiKey.createdAt)}</span>
                  <span>Updated: {formatDate(apiKey.updatedAt)}</span>
                  {apiKey.lastUsed && (
                    <span>Last Used: {formatDate(apiKey.lastUsed)}</span>
                  )}
                </div>
                
                {showKey[apiKey.id] && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                        {apiKey.key}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(apiKey.key)}
                        className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredApiKeys.length === 0 && (
          <div className="p-12 text-center">
            <KeyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No API keys match your filter
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit API Key Modal */}
      {(showCreateModal || editingKey) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingKey ? 'Edit API Key' : 'Add New API Key'}
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                console.log('Form submitted!');
                console.log('Current editingKey state:', editingKey);
                console.log('editingKey type:', typeof editingKey);
                console.log('editingKey is null:', editingKey === null);
                console.log('editingKey is undefined:', editingKey === undefined);
                const formData = new FormData(e.target as HTMLFormElement);
                const keyData = {
                  name: formData.get('name') as string,
                  platform: formData.get('platform') as ApiKey['platform'],
                  key: formData.get('key') as string,
                  description: formData.get('description') as string,
                  status: 'active' as const,
                  environment: 'production' as const,
                  permissions: [],
                  tags: [],
                  usageCount: 0
                };
                
                console.log('Key data:', keyData);
                
                if (editingKey) {
                  console.log('Updating API key:', editingKey.id);
                  // Check if this is a template key (starts with 'template-')
                  if (editingKey.id.startsWith('template-')) {
                    console.log('Template key detected, creating new API key instead of updating');
                    handleCreateKey(keyData);
                  } else {
                    updateApiKey(editingKey.id, keyData);
                  }
                  setEditingKey(null);
                } else {
                  console.log('Creating new API key');
                  handleCreateKey(keyData);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingKey?.name || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Platform
                    </label>
                    <select
                      name="platform"
                      defaultValue={editingKey?.platform || 'custom'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {platformOptions.map(option => (
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
                    <textarea
                      name="key"
                      defaultValue={editingKey?.key || ''}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Paste your API key here..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      defaultValue={editingKey?.description || ''}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Optional description..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingKey(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingKey ? 'Update' : 'Create'} API Key
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;
