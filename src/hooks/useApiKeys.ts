import { useState, useEffect, useCallback } from 'react';
import { ApiKey } from '../types/schema';
import { apiKeyService, ApiKeyValidation, ApiKeyUsage, ApiKeyAnalytics } from '../services/apiKeys';

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
      const data = await apiKeyService.getApiKeys();
      setApiKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await apiKeyService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load API key analytics:', err);
    }
  }, []);

  const initialize = useCallback(async (masterPassword: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await apiKeyService.initialize(masterPassword);
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
      const newApiKey = await apiKeyService.createApiKey(apiKeyData);
      setApiKeys(prev => [newApiKey, ...prev]);
      await loadAnalytics();
      return newApiKey;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
      throw err;
    }
  }, [loadAnalytics]);

  const updateApiKey = useCallback(async (id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> => {
    try {
      const updated = await apiKeyService.updateApiKey(id, updates);
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
      const deleted = await apiKeyService.deleteApiKey(id);
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
      return await apiKeyService.getDecryptedApiKey(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decrypt API key');
      return null;
    }
  }, []);

  const validateApiKey = useCallback(async (id: string): Promise<ApiKeyValidation> => {
    try {
      const validation = await apiKeyService.validateApiKey(id);
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
      const validations = await apiKeyService.validateAllApiKeys();
      await loadApiKeys();
      return validations;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate API keys');
      return new Map();
    }
  }, [loadApiKeys]);

  const recordUsage = useCallback(async (apiKeyId: string, requests: number = 1): Promise<void> => {
    try {
      await apiKeyService.recordUsage(apiKeyId, requests);
      await loadAnalytics();
    } catch (err) {
      console.error('Failed to record API key usage:', err);
    }
  }, [loadAnalytics]);

  const getUsageStats = useCallback(async (apiKeyId?: string): Promise<ApiKeyUsage | ApiKeyUsage[]> => {
    try {
      return await apiKeyService.getUsageStats(apiKeyId);
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
    return apiKeyService.generateApiKey(platform);
  }, []);

  const exportApiKeys = useCallback(async (): Promise<string> => {
    try {
      return await apiKeyService.exportApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export API keys');
      throw err;
    }
  }, []);

  const importApiKeys = useCallback(async (importData: string): Promise<number> => {
    try {
      const importedCount = await apiKeyService.importApiKeys(importData);
      await loadApiKeys();
      await loadAnalytics();
      return importedCount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import API keys');
      throw err;
    }
  }, [loadApiKeys, loadAnalytics]);

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
