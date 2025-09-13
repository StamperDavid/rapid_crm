import { useState, useEffect, useCallback } from 'react';
import { ApiKey } from '../types/schema';
import { ApiKeyManager } from '../services/ai/ApiKeyManager';

export interface ApiKeyValidation {
  isValid: boolean;
  error?: string;
  lastChecked?: string;
}

export interface ApiKeyUsage {
  apiKeyId: string;
  requests: number;
  lastUsed: string;
  rateLimitRemaining?: number;
  rateLimitReset?: string;
}

export interface ApiKeyAnalytics {
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  revokedKeys: number;
  totalRequests: number;
  averageRequestsPerKey: number;
  topUsedKeys: Array<{
    keyId: string;
    name: string;
    requests: number;
  }>;
  usageByPlatform: Record<string, number>;
}

export interface UseApiKeysReturn {
  apiKeys: ApiKey[];
  analytics: ApiKeyAnalytics | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  initialize: (masterPassword: string) => Promise<void>;
  createApiKey: (apiKeyData: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ApiKey>;
  updateApiKey: (id: string, updates: Partial<ApiKey>) => Promise<ApiKey | null>;
  deleteApiKey: (id: string) => Promise<boolean>;
  getDecryptedApiKey: (id: string) => Promise<string | null>;
  
  // Validation
  validateApiKey: (id: string) => Promise<ApiKeyValidation>;
  validateAllApiKeys: () => Promise<Map<string, ApiKeyValidation>>;
  
  // Usage tracking
  recordUsage: (apiKeyId: string, requests?: number) => Promise<void>;
  getUsageStats: (apiKeyId?: string) => Promise<ApiKeyUsage | ApiKeyUsage[]>;
  
  // Analytics
  refreshAnalytics: () => Promise<void>;
  
  // Utilities
  generateApiKey: (platform: string) => string;
  exportApiKeys: () => Promise<string>;
  importApiKeys: (importData: string) => Promise<number>;
  refreshApiKeys: () => Promise<void>;
}

export const useApiKeys = (): UseApiKeysReturn => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [analytics, setAnalytics] = useState<ApiKeyAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load API keys on mount
  useEffect(() => {
    loadApiKeys();
    loadAnalytics();
  }, []);

  const loadApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await ApiKeyManager.getInstance().loadApiKeys();
      const data = ApiKeyManager.getInstance().getAllApiKeys();
      setApiKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      // Simple analytics based on loaded keys
      const totalKeys = apiKeys.length;
      const activeKeys = apiKeys.filter(key => key.status === 'active').length;
      const expiredKeys = apiKeys.filter(key => key.status === 'expired').length;
      const totalRequests = apiKeys.reduce((sum, key) => sum + (key.usageCount || 0), 0);
      
      setAnalytics({
        totalKeys,
        activeKeys,
        expiredKeys,
        revokedKeys: 0,
        totalRequests,
        averageRequestsPerKey: totalKeys > 0 ? totalRequests / totalKeys : 0,
        topUsedKeys: [],
        usageByPlatform: {}
      });
    } catch (err) {
      console.error('Failed to load API key analytics:', err);
    }
  }, [apiKeys]);

  const initialize = useCallback(async (masterPassword: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setIsInitialized(true);
      await loadApiKeys();
      await loadAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize API key service');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadApiKeys, loadAnalytics]);

  const createApiKey = useCallback(async (apiKeyData: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiKey> => {
    try {
      console.log('useApiKeys: Creating API key...');
      const newApiKey = await ApiKeyManager.getInstance().createApiKey(apiKeyData);
      console.log('useApiKeys: API key created, updating state...');
      setApiKeys(prev => {
        console.log('useApiKeys: Previous keys:', prev);
        const updated = [newApiKey, ...prev];
        console.log('useApiKeys: Updated keys:', updated);
        return updated;
      });
      await loadAnalytics();
      console.log('useApiKeys: State updated successfully');
      return newApiKey;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
      throw err;
    }
  }, [loadAnalytics]);

  const updateApiKey = useCallback(async (id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> => {
    try {
      const updated = await ApiKeyManager.getInstance().updateApiKey(id, updates);
      if (updated) {
        setApiKeys(prev => prev.map(key => key.id === id ? updated : key));
        await loadAnalytics();
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update API key');
      return null;
    }
  }, [loadAnalytics]);

  const deleteApiKey = useCallback(async (id: string): Promise<boolean> => {
    try {
      const deleted = await ApiKeyManager.getInstance().deleteApiKey(id);
      if (deleted) {
        setApiKeys(prev => prev.filter(key => key.id !== id));
        await loadAnalytics();
      }
      return deleted;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
      return false;
    }
  }, [loadAnalytics]);

  const getDecryptedApiKey = useCallback(async (id: string): Promise<string | null> => {
    try {
      return await ApiKeyManager.getInstance().getDecryptedApiKey(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decrypt API key');
      return null;
    }
  }, []);

  const validateApiKey = useCallback(async (id: string): Promise<ApiKeyValidation> => {
    try {
      const validation = await ApiKeyManager.getInstance().validateApiKey(id);
      // Refresh the API key to show updated validation status
      await loadApiKeys();
      return validation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate API key');
      return { isValid: false, error: 'Validation failed' };
    }
  }, [loadApiKeys]);

  const validateAllApiKeys = useCallback(async (): Promise<Map<string, ApiKeyValidation>> => {
    try {
      const validations = await ApiKeyManager.getInstance().validateAllApiKeys();
      await loadApiKeys();
      return validations;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate API keys');
      return new Map();
    }
  }, [loadApiKeys]);

  const recordUsage = useCallback(async (apiKeyId: string, requests: number = 1): Promise<void> => {
    try {
      await ApiKeyManager.getInstance().recordUsage(apiKeyId, requests);
      await loadAnalytics();
    } catch (err) {
      console.error('Failed to record API key usage:', err);
    }
  }, [loadAnalytics]);

  const getUsageStats = useCallback(async (apiKeyId?: string): Promise<ApiKeyUsage | ApiKeyUsage[]> => {
    try {
      return await ApiKeyManager.getInstance().getUsageStats(apiKeyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get usage stats');
      return apiKeyId ? {
        apiKeyId,
        requests: 0,
        lastUsed: new Date().toISOString()
      } : [];
    }
  }, []);

  const refreshAnalytics = useCallback(async (): Promise<void> => {
    await loadAnalytics();
  }, [loadAnalytics]);

  const generateApiKey = useCallback((platform: string): string => {
    return ApiKeyManager.getInstance().generateApiKey(platform);
  }, []);

  const exportApiKeys = useCallback(async (): Promise<string> => {
    try {
      return await ApiKeyManager.getInstance().exportApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export API keys');
      throw err;
    }
  }, []);

  const importApiKeys = useCallback(async (importData: string): Promise<number> => {
    try {
      const beforeCount = apiKeys.length;
      await ApiKeyManager.getInstance().importApiKeys(importData);
      await loadApiKeys();
      await loadAnalytics();
      const afterCount = apiKeys.length;
      return afterCount - beforeCount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import API keys');
      throw err;
    }
  }, [loadApiKeys, loadAnalytics, apiKeys.length]);

  const refreshApiKeys = useCallback(async (): Promise<void> => {
    await loadApiKeys();
    await loadAnalytics();
  }, [loadApiKeys, loadAnalytics]);

  return {
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
    recordUsage,
    getUsageStats,
    refreshAnalytics,
    generateApiKey,
    exportApiKeys,
    importApiKeys,
    refreshApiKeys
  };
};
