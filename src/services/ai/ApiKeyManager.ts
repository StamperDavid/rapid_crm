import { ApiKey } from '../../types/schema';

export interface AIProviderConfig {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
  baseUrl: string;
  models: string[];
  capabilities: string[];
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  pricing: {
    inputTokensPerDollar: number;
    outputTokensPerDollar: number;
  };
}

export class ApiKeyManager {
  private static instance: ApiKeyManager;
  private apiKeys: Map<string, ApiKey> = new Map();
  private providerConfigs: Map<string, AIProviderConfig> = new Map();
  private refreshCallback?: () => Promise<void>;

  private constructor() {
    this.initializeProviderConfigs();
  }

  public static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  private initializeProviderConfigs(): void {
    const configs: AIProviderConfig[] = [
      {
        id: 'openai',
        name: 'OpenAI',
        type: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
        capabilities: ['chat', 'completion', 'embeddings', 'function_calling'],
        rateLimits: {
          requestsPerMinute: 60,
          tokensPerMinute: 150000
        },
        pricing: {
          inputTokensPerDollar: 0.00003,
          outputTokensPerDollar: 0.00006
        }
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        type: 'anthropic',
        baseUrl: 'https://api.anthropic.com/v1',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        capabilities: ['chat', 'completion', 'function_calling'],
        rateLimits: {
          requestsPerMinute: 30,
          tokensPerMinute: 100000
        },
        pricing: {
          inputTokensPerDollar: 0.000015,
          outputTokensPerDollar: 0.000075
        }
      },
      {
        id: 'google',
        name: 'Google AI',
        type: 'google',
        baseUrl: 'https://generativelanguage.googleapis.com/v1',
        models: ['gemini-pro', 'gemini-pro-vision'],
        capabilities: ['chat', 'completion', 'vision'],
        rateLimits: {
          requestsPerMinute: 60,
          tokensPerMinute: 200000
        },
        pricing: {
          inputTokensPerDollar: 0.000025,
          outputTokensPerDollar: 0.00005
        }
      },
      {
        id: 'openrouter',
        name: 'OpenRouter',
        type: 'custom',
        baseUrl: 'https://openrouter.ai/api/v1',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'gpt-4', 'gpt-3.5-turbo'],
        capabilities: ['chat', 'completion', 'function_calling'],
        rateLimits: {
          requestsPerMinute: 60,
          tokensPerMinute: 150000
        },
        pricing: {
          inputTokensPerDollar: 0.00002,
          outputTokensPerDollar: 0.00004
        }
      }
    ];

    configs.forEach(config => {
      this.providerConfigs.set(config.id, config);
    });
  }

  public async loadApiKeys(): Promise<void> {
    try {
      console.log('Loading API keys from database...');
      const response = await fetch('/api/api-keys');
      console.log('API keys response status:', response.status);
      
      if (response.ok) {
        const apiKeys: ApiKey[] = await response.json();
        console.log('API keys from database:', apiKeys);
        
        this.apiKeys.clear();
        apiKeys.forEach(key => {
          console.log('Loading API key:', {
            id: key.id,
            platform: key.platform,
            name: key.name,
            keyLength: key.key?.length || 0,
            keyStart: key.key?.substring(0, 15) + '...' || 'null',
            hasKey: !!key.key
          });
          this.apiKeys.set(key.platform.toLowerCase(), key);
        });
        console.log(`Loaded ${apiKeys.length} API keys from database`);
      } else {
        console.error('Failed to fetch API keys:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  }

  public getApiKey(platform: string): string | null {
    const apiKey = this.apiKeys.get(platform.toLowerCase());
    if (apiKey?.key) {
      // Trim whitespace and newlines that might cause 401 errors
      const cleanKey = apiKey.key.trim();
      console.log(`Getting API key for ${platform}:`, `${cleanKey.substring(0, 10)}... (length: ${cleanKey.length})`);
      return cleanKey;
    }
    console.log(`Getting API key for ${platform}: null`);
    return null;
  }

  public getProviderConfig(platform: string): AIProviderConfig | null {
    return this.providerConfigs.get(platform.toLowerCase()) || null;
  }

  public getAvailableProviders(): AIProviderConfig[] {
    const available = Array.from(this.providerConfigs.values()).filter(config => {
      const apiKey = this.getApiKey(config.id);
      const hasKey = !!(apiKey && apiKey.trim() !== '');
      console.log(`Provider ${config.id}: hasKey=${hasKey}, keyLength=${apiKey?.length || 0}`);
      return hasKey;
    });
    console.log('Available providers:', available.length, available.map(p => p.id));
    return available;
  }

  public async refreshApiKeys(): Promise<void> {
    await this.loadApiKeys();
  }

  public isProviderAvailable(platform: string): boolean {
    const apiKey = this.getApiKey(platform);
    return !!(apiKey && apiKey.trim() !== '');
  }

  public async createApiKey(apiKeyData: Omit<ApiKey, 'id'>): Promise<ApiKey> {
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiKeyData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create API key: ${response.statusText}`);
      }

      const newApiKey: ApiKey = await response.json();
      this.apiKeys.set(newApiKey.platform.toLowerCase(), newApiKey);
      await this.refreshAIIntegration();
      return newApiKey;
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  }

  public async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey> {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update API key: ${response.statusText}`);
      }

      const updatedApiKey: ApiKey = await response.json();
      this.apiKeys.set(updatedApiKey.platform.toLowerCase(), updatedApiKey);
      await this.refreshAIIntegration();
      return updatedApiKey;
    } catch (error) {
      console.error('Error updating API key:', error);
      throw error;
    }
  }

  public async deleteApiKey(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete API key: ${response.statusText}`);
      }

      // Remove from local cache
      for (const [platform, apiKey] of this.apiKeys.entries()) {
        if (apiKey.id === id) {
          this.apiKeys.delete(platform);
          break;
        }
      }
      await this.refreshAIIntegration();
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  }

  public getDecryptedApiKey(platform: string): string | null {
    return this.getApiKey(platform);
  }

  public async validateApiKey(platform: string): Promise<boolean> {
    const apiKey = this.getApiKey(platform);
    if (!apiKey || apiKey.trim() === '') {
      return false;
    }

    // Basic validation - could be enhanced with actual API calls
    return apiKey.length > 10;
  }

  public async validateAllApiKeys(): Promise<{ [platform: string]: boolean }> {
    const results: { [platform: string]: boolean } = {};
    
    for (const [platform] of this.apiKeys) {
      results[platform] = await this.validateApiKey(platform);
    }
    
    return results;
  }

  public async recordUsage(platform: string, tokens: number): Promise<void> {
    // Implementation for usage tracking
    console.log(`Recording usage for ${platform}: ${tokens} tokens`);
  }

  public getUsageStats(platform: string): { requests: number; tokens: number; cost: number } {
    // Implementation for usage statistics
    return { requests: 0, tokens: 0, cost: 0 };
  }

  public generateApiKey(): string {
    // Generate a random API key for testing purposes
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  public async exportApiKeys(): Promise<string> {
    const apiKeys = Array.from(this.apiKeys.values());
    return JSON.stringify(apiKeys, null, 2);
  }

  public async importApiKeys(jsonData: string): Promise<void> {
    try {
      const apiKeys: ApiKey[] = JSON.parse(jsonData);
      
      for (const apiKey of apiKeys) {
        await this.createApiKey(apiKey);
      }
    } catch (error) {
      console.error('Error importing API keys:', error);
      throw error;
    }
  }

  public getAllApiKeys(): ApiKey[] {
    return Array.from(this.apiKeys.values());
  }

  public setRefreshCallback(callback: () => Promise<void>): void {
    this.refreshCallback = callback;
  }

  private async refreshAIIntegration(): Promise<void> {
    try {
      if (this.refreshCallback) {
        await this.refreshCallback();
      }
    } catch (error) {
      console.error('Failed to refresh AI integration service:', error);
    }
  }
}

// Export singleton instance
export const apiKeyManager = ApiKeyManager.getInstance();
