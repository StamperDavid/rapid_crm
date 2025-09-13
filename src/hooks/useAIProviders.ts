import { useState, useEffect } from 'react';
import { aiIntegrationService } from '../services/ai/AIIntegrationService';
import { apiKeyManager } from '../services/ai/ApiKeyManager';

export const useAIProviders = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Refresh API keys from database
      await apiKeyManager.refreshApiKeys();
      
      // Refresh AI providers with updated keys
      await aiIntegrationService.refreshProviders();
      
      // Get updated providers
      const updatedProviders = await aiIntegrationService.getProviders();
      setProviders(updatedProviders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProviders();
  }, []);

  return {
    providers,
    loading,
    error,
    refreshProviders
  };
};
