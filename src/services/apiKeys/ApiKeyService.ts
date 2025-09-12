import { ApiKey } from '../../types/schema';
import { encryptionService, EncryptionResult } from './EncryptionService';
import { getApiBaseUrl } from '../../config/api';

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

export class ApiKeyService {
  private apiKeys: Map<string, ApiKey> = new Map();
  private validations: Map<string, ApiKeyValidation> = new Map();
  private usage: Map<string, ApiKeyUsage> = new Map();
  private isInitialized = false;
  private API_BASE = getApiBaseUrl();

  constructor() {
    this.loadApiKeys();
  }

  /**
   * Initialize the service with encryption
   */
  public async initialize(masterPassword: string): Promise<void> {
    try {
      await encryptionService.initialize(masterPassword);
      this.isInitialized = true;
      console.log('API Key service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize API Key service:', error);
      throw new Error('API Key service initialization failed');
    }
  }

  /**
   * Check if service is ready
   */
  public isReady(): boolean {
    return this.isInitialized && encryptionService.isReady();
  }

  /**
   * Load API keys from YOUR database
   */
  private async loadApiKeys(): Promise<void> {
    try {
      console.log('Loading API keys from YOUR database...');
      const response = await fetch(`${this.API_BASE}/api-keys`);
      const apiKeysData = await response.json();
      this.apiKeys = new Map(apiKeysData.map((key: ApiKey) => [key.id, key]));
      this.validations = new Map();
      this.usage = new Map();
    } catch (error) {
      console.error('Error loading API keys:', error);
      this.apiKeys = new Map();
      this.validations = new Map();
      this.usage = new Map();
    }
  }

  /**
   * Save API keys to storage
   */
  private async saveApiKeys(): Promise<void> {
    try {
      console.log('Saving API keys to real database...');
      // API keys are already saved individually when created/updated
      // This method is kept for compatibility but doesn't need to do anything
      // since each API key operation saves to the database directly
    } catch (error) {
      console.error('Error saving API keys:', error);
    }
  }

  /**
   * Create a new API key
   */
  public async createApiKey(apiKeyData: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiKey> {
    if (!this.isReady()) {
      throw new Error('API Key service not initialized');
    }

    try {
      // Encrypt the API key value
      const encryptedKey = await encryptionService.encrypt(apiKeyData.key);
      
      const newApiKey: ApiKey = {
        ...apiKeyData,
        id: `api-key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        key: this.maskApiKey(apiKeyData.key), // Store masked version
        encryptedKey: encryptedKey.encryptedData,
        iv: encryptedKey.iv,
        salt: encryptedKey.salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.apiKeys.set(newApiKey.id, newApiKey);
      await fetch(`${this.API_BASE}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApiKey)
      });
      await this.saveApiKeys();

      return newApiKey;
    } catch (error) {
      console.error('Failed to create API key:', error);
      throw new Error('Failed to create API key');
    }
  }

  /**
   * Get all API keys
   */
  public async getApiKeys(): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get API key by ID
   */
  public async getApiKey(id: string): Promise<ApiKey | null> {
    return this.apiKeys.get(id) || null;
  }

  /**
   * Update API key
   */
  public async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey) return null;

    try {
      let updatedApiKey = { ...apiKey, ...updates, updatedAt: new Date().toISOString() };

      // If the key value is being updated, encrypt it
      if (updates.key && updates.key !== apiKey.key) {
        const encryptedKey = await encryptionService.encrypt(updates.key);
        updatedApiKey = {
          ...updatedApiKey,
          key: this.maskApiKey(updates.key),
          encryptedKey: encryptedKey.encryptedData,
          iv: encryptedKey.iv,
          salt: encryptedKey.salt
        };
      }

      this.apiKeys.set(id, updatedApiKey);
      await fetch(`${this.API_BASE}/api-keys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedApiKey)
      });
      await this.saveApiKeys();
      return updatedApiKey;
    } catch (error) {
      console.error('Failed to update API key:', error);
      throw new Error('Failed to update API key');
    }
  }

  /**
   * Delete API key
   */
  public async deleteApiKey(id: string): Promise<boolean> {
    const deleted = this.apiKeys.delete(id);
    this.validations.delete(id);
    this.usage.delete(id);
    await fetch(`${this.API_BASE}/api-keys/${id}`, { method: 'DELETE' });
    await this.saveApiKeys();
    return deleted;
  }

  /**
   * Get decrypted API key value
   */
  public async getDecryptedApiKey(id: string): Promise<string | null> {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey || !apiKey.encryptedKey) return null;

    try {
      const decrypted = await encryptionService.decrypt({
        encryptedData: apiKey.encryptedKey,
        iv: apiKey.iv || '',
        salt: apiKey.salt || ''
      });
      return decrypted.decryptedData;
    } catch (error) {
      console.error('Failed to decrypt API key:', error);
      return null;
    }
  }

  /**
   * Validate API key
   */
  public async validateApiKey(id: string): Promise<ApiKeyValidation> {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey) {
      return { isValid: false, error: 'API key not found' };
    }

    try {
      const decryptedKey = await this.getDecryptedApiKey(id);
      if (!decryptedKey) {
        return { isValid: false, error: 'Failed to decrypt API key' };
      }

      // Perform platform-specific validation
      const validation = await this.performPlatformValidation(apiKey.platform, decryptedKey);
      
      this.validations.set(id, {
        ...validation,
        lastChecked: new Date().toISOString()
      });
      await this.saveApiKeys();

      return validation;
    } catch (error) {
      const validation = { isValid: false, error: 'Validation failed' };
      this.validations.set(id, validation);
      await this.saveApiKeys();
      return validation;
    }
  }

  /**
   * Perform platform-specific validation
   */
  private async performPlatformValidation(platform: string, apiKey: string): Promise<ApiKeyValidation> {
    switch (platform.toLowerCase()) {
      case 'google':
        return await this.validateGoogleApiKey(apiKey);
      case 'openai':
        return await this.validateOpenAIApiKey(apiKey);
      case 'kixie':
        return await this.validateKixieApiKey(apiKey);
      case 'stripe':
        return await this.validateStripeApiKey(apiKey);
      case 'quickbooks':
        return await this.validateQuickBooksApiKey(apiKey);
      default:
        return { isValid: true }; // Assume valid for unknown platforms
    }
  }

  /**
   * Validate Google API key
   */
  private async validateGoogleApiKey(apiKey: string): Promise<ApiKeyValidation> {
    try {
      // Test with a simple Google API call
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=test&key=${apiKey}`);
      if (response.ok) {
        return { isValid: true };
      } else {
        return { isValid: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      return { isValid: false, error: 'Network error during validation' };
    }
  }

  /**
   * Validate OpenAI API key
   */
  private async validateOpenAIApiKey(apiKey: string): Promise<ApiKeyValidation> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        return { isValid: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { isValid: false, error: errorData.error?.message || `HTTP ${response.status}` };
      }
    } catch (error) {
      return { isValid: false, error: 'Network error during validation' };
    }
  }

  /**
   * Validate Kixie API key
   */
  private async validateKixieApiKey(apiKey: string): Promise<ApiKeyValidation> {
    try {
      // Kixie API validation endpoint
      const response = await fetch('https://api.kixie.com/v1/account', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        return { isValid: true };
      } else {
        return { isValid: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      return { isValid: false, error: 'Network error during validation' };
    }
  }

  /**
   * Validate Stripe API key
   */
  private async validateStripeApiKey(apiKey: string): Promise<ApiKeyValidation> {
    try {
      const response = await fetch('https://api.stripe.com/v1/account', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (response.ok) {
        return { isValid: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { isValid: false, error: errorData.error?.message || `HTTP ${response.status}` };
      }
    } catch (error) {
      return { isValid: false, error: 'Network error during validation' };
    }
  }

  /**
   * Validate QuickBooks API key
   */
  private async validateQuickBooksApiKey(apiKey: string): Promise<ApiKeyValidation> {
    try {
      // QuickBooks API validation
      const response = await fetch('https://sandbox-quickbooks.api.intuit.com/v3/company/123/companyinfo/123', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });
      
      // QuickBooks returns 401 for invalid tokens, which is expected
      if (response.status === 401) {
        return { isValid: false, error: 'Invalid QuickBooks API key' };
      } else if (response.ok) {
        return { isValid: true };
      } else {
        return { isValid: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      return { isValid: false, error: 'Network error during validation' };
    }
  }

  /**
   * Record API key usage
   */
  public async recordUsage(apiKeyId: string, requests: number = 1): Promise<void> {
    const currentUsage = this.usage.get(apiKeyId) || {
      apiKeyId,
      requests: 0,
      lastUsed: new Date().toISOString()
    };

    this.usage.set(apiKeyId, {
      ...currentUsage,
      requests: currentUsage.requests + requests,
      lastUsed: new Date().toISOString()
    });

    await this.saveApiKeys();
  }

  /**
   * Get API key usage statistics
   */
  public async getUsageStats(apiKeyId?: string): Promise<ApiKeyUsage | ApiKeyUsage[]> {
    if (apiKeyId) {
      return this.usage.get(apiKeyId) || {
        apiKeyId,
        requests: 0,
        lastUsed: new Date().toISOString()
      };
    }
    return Array.from(this.usage.values());
  }

  /**
   * Get API key analytics
   */
  public async getAnalytics(): Promise<ApiKeyAnalytics> {
    const apiKeys = Array.from(this.apiKeys.values());
    const usageStats = Array.from(this.usage.values());

    const totalKeys = apiKeys.length;
    const activeKeys = apiKeys.filter(key => key.status === 'active').length;
    const expiredKeys = apiKeys.filter(key => key.status === 'expired').length;
    const revokedKeys = apiKeys.filter(key => key.status === 'revoked').length;
    const totalRequests = usageStats.reduce((sum, stat) => sum + stat.requests, 0);
    const averageRequestsPerKey = totalKeys > 0 ? totalRequests / totalKeys : 0;

    // Top used keys
    const topUsedKeys = usageStats
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5)
      .map(stat => {
        const apiKey = apiKeys.find(key => key.id === stat.apiKeyId);
        return {
          keyId: stat.apiKeyId,
          name: apiKey?.name || 'Unknown',
          requests: stat.requests
        };
      });

    // Usage by platform
    const usageByPlatform: Record<string, number> = {};
    apiKeys.forEach(key => {
      const stat = usageStats.find(s => s.apiKeyId === key.id);
      if (stat) {
        usageByPlatform[key.platform] = (usageByPlatform[key.platform] || 0) + stat.requests;
      }
    });

    return {
      totalKeys,
      activeKeys,
      expiredKeys,
      revokedKeys,
      totalRequests,
      averageRequestsPerKey,
      topUsedKeys,
      usageByPlatform
    };
  }

  /**
   * Mask API key for display
   */
  private maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) {
      return '*'.repeat(apiKey.length);
    }
    return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
  }

  /**
   * Generate a new API key
   */
  public generateApiKey(platform: string): string {
    switch (platform.toLowerCase()) {
      case 'google':
        return 'AIza' + encryptionService.generateApiKey(35); // Google API key format
      case 'openai':
        return 'sk-' + encryptionService.generateApiKey(48); // OpenAI API key format
      case 'kixie':
        return 'kix_' + encryptionService.generateApiKey(32); // Kixie API key format
      case 'stripe':
        return 'sk_test_' + encryptionService.generateApiKey(24); // Stripe test key format
      default:
        return encryptionService.generateApiKey(32);
    }
  }

  /**
   * Bulk validate all API keys
   */
  public async validateAllApiKeys(): Promise<Map<string, ApiKeyValidation>> {
    const results = new Map<string, ApiKeyValidation>();
    
    for (const [id, apiKey] of this.apiKeys) {
      if (apiKey.status === 'active') {
        const validation = await this.validateApiKey(id);
        results.set(id, validation);
      }
    }

    return results;
  }

  /**
   * Export API keys (encrypted)
   */
  public async exportApiKeys(): Promise<string> {
    const exportData = {
      apiKeys: Array.from(this.apiKeys.entries()),
      validations: Array.from(this.validations.entries()),
      usage: Array.from(this.usage.entries()),
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import API keys
   */
  public async importApiKeys(importData: string): Promise<number> {
    try {
      const data = JSON.parse(importData);
      let importedCount = 0;

      if (data.apiKeys) {
        for (const [id, apiKey] of data.apiKeys) {
          if (!this.apiKeys.has(id)) {
            this.apiKeys.set(id, apiKey);
            importedCount++;
          }
        }
      }

      if (data.validations) {
        for (const [id, validation] of data.validations) {
          this.validations.set(id, validation);
        }
      }

      if (data.usage) {
        for (const [id, usage] of data.usage) {
          this.usage.set(id, usage);
        }
      }

      await this.saveApiKeys();
      return importedCount;
    } catch (error) {
      console.error('Failed to import API keys:', error);
      throw new Error('Invalid import data format');
    }
  }
}

export const apiKeyService = new ApiKeyService();
