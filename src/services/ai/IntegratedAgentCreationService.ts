// Using direct database connection - no separate repository
// Using direct database connection - no separate database service
import { ApiKeyManager } from './ApiKeyManager';
import { AdvancedAgent, AgentCapability, AgentPersonality, AgentLearningProfile } from './AdvancedAgentCreationService';

export interface IntegratedAgent extends AdvancedAgent {
  // API Key Integration
  apiKeyBindings: AgentApiKeyBinding[];
  autoKeySelection: boolean;
  keyRotationPolicy: KeyRotationPolicy;
  
  // Enhanced Capabilities with API Integration
  enhancedCapabilities: EnhancedAgentCapability[];
  
  // Real-time API Usage Tracking
  apiUsage: AgentApiUsage;
  
  // Automatic Service Discovery
  discoveredServices: DiscoveredService[];
}

export interface AgentApiKeyBinding {
  id: string;
  apiKeyId: string;
  apiKeyName: string;
  platform: string;
  purpose: 'primary' | 'backup' | 'fallback' | 'specialized';
  priority: number; // 1-10, higher = more preferred
  autoRotate: boolean;
  lastUsed: string;
  usageCount: number;
  isActive: boolean;
}

export interface KeyRotationPolicy {
  enabled: boolean;
  rotationInterval: number; // days
  autoCreateBackup: boolean;
  notificationBeforeRotation: number; // hours
  fallbackKeys: string[]; // API key IDs
}

export interface EnhancedAgentCapability extends AgentCapability {
  requiredApiKeys: string[]; // API key IDs
  apiEndpoints: string[];
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  costPerRequest: number;
  fallbackCapabilities: string[]; // Capability IDs
}

export interface AgentApiUsage {
  totalRequests: number;
  totalCost: number;
  requestsByKey: Record<string, number>;
  costByKey: Record<string, number>;
  lastRequest: string;
  averageResponseTime: number;
  errorRate: number;
  rateLimitHits: number;
}

export interface DiscoveredService {
  id: string;
  name: string;
  type: 'ai_service' | 'data_service' | 'communication_service' | 'integration_service';
  endpoint: string;
  requiredApiKey: string;
  capabilities: string[];
  cost: number;
  reliability: number; // 0-1
  lastChecked: string;
}

export class IntegratedAgentCreationService {
  constructor() {
    // Mock implementation - no database dependency
  }

  // Create Agent with Automatic API Key Integration
  async createIntegratedAgent(config: {
    name: string;
    description: string;
    type: string;
    personality?: Partial<AgentPersonality>;
    capabilities?: string[];
    learningProfile?: Partial<AgentLearningProfile>;
    autoSelectApiKeys?: boolean;
    preferredPlatforms?: string[];
    createdBy: string;
  }): Promise<IntegratedAgent> {
    try {
      // Get available API keys (with error handling)
      let availableApiKeys = [];
      let activeApiKeys = [];
      
      try {
        // Load API keys from the actual API key system
        await ApiKeyManager.getInstance().loadApiKeys();
        const allKeys = ApiKeyManager.getInstance().getAllApiKeys();
        availableApiKeys = allKeys;
        activeApiKeys = allKeys.filter(key => key.status === 'active');
        console.log(`Found ${availableApiKeys.length} total API keys, ${activeApiKeys.length} active`);
      } catch (apiKeyError) {
        console.warn('Could not load API keys, creating agent without API integration:', apiKeyError);
        // Continue without API keys - agent will be created but won't have API integration
      }

      // Auto-select API keys based on agent type and preferences
      const selectedApiKeys = config.autoSelectApiKeys 
        ? await this.autoSelectApiKeys(config.type, config.preferredPlatforms || [], activeApiKeys)
        : await this.selectApiKeysByPreference(config.preferredPlatforms || [], activeApiKeys);

      // Create API key bindings
      const apiKeyBindings = await this.createApiKeyBindings(selectedApiKeys, config.type);

      // Enhance capabilities with API integration
      const enhancedCapabilities = await this.enhanceCapabilitiesWithApiKeys(
        config.capabilities || [], 
        apiKeyBindings
      );

      // Discover available services
      const discoveredServices = await this.discoverServices(apiKeyBindings);

      // Create the integrated agent
      const agent: IntegratedAgent = {
        id: this.generateAgentId(),
        name: config.name,
        description: config.description,
        version: '1.0.0',
        status: 'draft',
        type: config.type,
        
        personality: {
          name: 'Integrated',
          traits: ['adaptive', 'efficient', 'connected'],
          communicationStyle: 'friendly',
          responseLength: 'detailed',
          expertise: ['api_integration', 'multi_platform'],
          limitations: [],
          ...config.personality
        } as AgentPersonality,
        
        capabilities: config.capabilities || [],
        learningProfile: {
          learningRate: 0.8,
          adaptationSpeed: 'fast',
          memoryRetention: 30,
          feedbackSensitivity: 0.7,
          innovationLevel: 0.6,
          collaborationPreference: 'hybrid',
          ...config.learningProfile
        } as AgentLearningProfile,
        
        memoryBank: [],
        customPrompts: {},
        decisionMatrix: {},
        behaviorRules: [],
        escalationTriggers: [],
        
        performanceScore: 0,
        successRate: 0,
        userSatisfaction: 0,
        efficiencyRating: 0,
        
        apiEndpoints: [],
        webhookUrls: [],
        databaseAccess: [],
        externalIntegrations: [],
        
        accessLevel: 'private',
        permissions: [],
        auditLog: true,
        encryptionLevel: 'standard',
        
        createdBy: config.createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        totalInteractions: 0,
        tags: ['integrated', 'api_connected'],
        
        // Integration-specific properties
        apiKeyBindings,
        autoKeySelection: config.autoSelectApiKeys || false,
        keyRotationPolicy: {
          enabled: true,
          rotationInterval: 30,
          autoCreateBackup: true,
          notificationBeforeRotation: 24,
          fallbackKeys: []
        },
        enhancedCapabilities,
        apiUsage: {
          totalRequests: 0,
          totalCost: 0,
          requestsByKey: {},
          costByKey: {},
          lastRequest: new Date().toISOString(),
          averageResponseTime: 0,
          errorRate: 0,
          rateLimitHits: 0
        },
        discoveredServices
      };

      await this.saveIntegratedAgent(agent);
      return agent;
    } catch (error) {
      console.error('Error creating integrated agent:', error);
      throw new Error('Failed to create integrated agent');
    }
  }

  // Auto-select API keys based on agent type
  private async autoSelectApiKeys(
    agentType: string, 
    preferredPlatforms: string[], 
    availableKeys: any[]
  ): Promise<any[]> {
    const selectedKeys: any[] = [];
    
    // If no keys available, return empty array
    if (!availableKeys || availableKeys.length === 0) {
      console.log('No API keys available for auto-selection');
      return selectedKeys;
    }
    
    // Define platform preferences by agent type
    const platformPreferences: Record<string, string[]> = {
      'customer_service': ['openai', 'google', 'kixie'],
      'data_analysis': ['openai', 'google'],
      'automation': ['openai', 'stripe', 'quickbooks'],
      'communication': ['kixie', 'openai', 'google'],
      'general': ['openai', 'google']
    };

    const preferredForType = platformPreferences[agentType] || ['openai', 'google'];
    const allPreferred = [...new Set([...preferredForType, ...preferredPlatforms])];

    // Select primary key for each preferred platform
    for (const platform of allPreferred) {
      const platformKey = availableKeys.find(key => 
        key.platform && key.platform.toLowerCase() === platform.toLowerCase() && 
        key.status === 'active'
      );
      
      if (platformKey && !selectedKeys.find(k => k.platform === platformKey.platform)) {
        selectedKeys.push(platformKey);
      }
    }

    // Ensure we have at least one key
    if (selectedKeys.length === 0 && availableKeys.length > 0) {
      selectedKeys.push(availableKeys[0]);
    }

    return selectedKeys;
  }

  // Select API keys by user preference
  private async selectApiKeysByPreference(
    preferredPlatforms: string[], 
    availableKeys: any[]
  ): Promise<any[]> {
    const selectedKeys: any[] = [];
    
    // If no keys available, return empty array
    if (!availableKeys || availableKeys.length === 0) {
      console.log('No API keys available for preference selection');
      return selectedKeys;
    }
    
    for (const platform of preferredPlatforms) {
      const platformKey = availableKeys.find(key => 
        key.platform && key.platform.toLowerCase() === platform.toLowerCase()
      );
      
      if (platformKey) {
        selectedKeys.push(platformKey);
      }
    }

    return selectedKeys;
  }

  // Create API key bindings for the agent
  private async createApiKeyBindings(apiKeys: any[], agentType: string): Promise<AgentApiKeyBinding[]> {
    const bindings: AgentApiKeyBinding[] = [];
    
    apiKeys.forEach((apiKey, index) => {
      const binding: AgentApiKeyBinding = {
        id: this.generateBindingId(),
        apiKeyId: apiKey.id,
        apiKeyName: apiKey.name,
        platform: apiKey.platform,
        purpose: index === 0 ? 'primary' : 'backup',
        priority: 10 - index, // Higher priority for earlier selections
        autoRotate: true,
        lastUsed: new Date().toISOString(),
        usageCount: 0,
        isActive: true
      };
      
      bindings.push(binding);
    });

    return bindings;
  }

  // Enhance capabilities with API key integration
  private async enhanceCapabilitiesWithApiKeys(
    baseCapabilities: string[], 
    apiKeyBindings: AgentApiKeyBinding[]
  ): Promise<EnhancedAgentCapability[]> {
    const enhancedCapabilities: EnhancedAgentCapability[] = [];
    
    // Define capability mappings to API keys
    const capabilityMappings: Record<string, { platforms: string[], endpoints: string[] }> = {
      'natural_language_processing': {
        platforms: ['openai', 'google'],
        endpoints: ['https://api.openai.com/v1/chat/completions', 'https://generativelanguage.googleapis.com/v1beta/models']
      },
      'data_analysis': {
        platforms: ['openai', 'google'],
        endpoints: ['https://api.openai.com/v1/chat/completions', 'https://generativelanguage.googleapis.com/v1beta/models']
      },
      'communication': {
        platforms: ['kixie', 'openai'],
        endpoints: ['https://api.kixie.com/v1/calls', 'https://api.openai.com/v1/chat/completions']
      },
      'payment_processing': {
        platforms: ['stripe'],
        endpoints: ['https://api.stripe.com/v1/charges']
      },
      'accounting': {
        platforms: ['quickbooks'],
        endpoints: ['https://sandbox-quickbooks.api.intuit.com/v3/company']
      }
    };

    baseCapabilities.forEach(capability => {
      const mapping = capabilityMappings[capability];
      if (mapping) {
        const relevantBindings = apiKeyBindings.filter(binding => 
          mapping.platforms.includes(binding.platform)
        );

        if (relevantBindings.length > 0) {
          const enhanced: EnhancedAgentCapability = {
            id: this.generateCapabilityId(),
            name: capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `Enhanced ${capability} with API integration`,
            category: this.getCapabilityCategory(capability),
            parameters: {},
            dependencies: [],
            cost: 0,
            requiredApiKeys: relevantBindings.map(b => b.apiKeyId),
            apiEndpoints: mapping.endpoints,
            rateLimits: {
              requestsPerMinute: 60,
              requestsPerHour: 1000,
              requestsPerDay: 10000
            },
            costPerRequest: this.getCostPerRequest(capability),
            fallbackCapabilities: []
          };

          enhancedCapabilities.push(enhanced);
        }
      }
    });

    return enhancedCapabilities;
  }

  // Discover available services based on API keys
  private async discoverServices(apiKeyBindings: AgentApiKeyBinding[]): Promise<DiscoveredService[]> {
    const services: DiscoveredService[] = [];
    
    const serviceDefinitions: Record<string, DiscoveredService> = {
      'openai': {
        id: 'openai_chat',
        name: 'OpenAI Chat API',
        type: 'ai_service',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        requiredApiKey: '',
        capabilities: ['text_generation', 'conversation', 'analysis'],
        cost: 0.002,
        reliability: 0.99,
        lastChecked: new Date().toISOString()
      },
      'google': {
        id: 'google_ai',
        name: 'Google AI Studio',
        type: 'ai_service',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        requiredApiKey: '',
        capabilities: ['text_generation', 'image_analysis', 'translation'],
        cost: 0.001,
        reliability: 0.98,
        lastChecked: new Date().toISOString()
      },
      'kixie': {
        id: 'kixie_communication',
        name: 'Kixie Communication Platform',
        type: 'communication_service',
        endpoint: 'https://api.kixie.com/v1',
        requiredApiKey: '',
        capabilities: ['phone_calls', 'sms', 'voicemail'],
        cost: 0.05,
        reliability: 0.95,
        lastChecked: new Date().toISOString()
      },
      'stripe': {
        id: 'stripe_payments',
        name: 'Stripe Payment Processing',
        type: 'integration_service',
        endpoint: 'https://api.stripe.com/v1',
        requiredApiKey: '',
        capabilities: ['payment_processing', 'subscription_management', 'invoicing'],
        cost: 0.029,
        reliability: 0.99,
        lastChecked: new Date().toISOString()
      }
    };

    apiKeyBindings.forEach(binding => {
      const service = serviceDefinitions[binding.platform];
      if (service) {
        services.push({
          ...service,
          requiredApiKey: binding.apiKeyId
        });
      }
    });

    return services;
  }

  // Execute agent with automatic API key management
  async executeAgentWithApiKeys(
    agentId: string, 
    request: any, 
    capability: string
  ): Promise<any> {
    try {
      const agent = await this.getIntegratedAgent(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Find the best API key for this capability
      const bestApiKey = await this.selectBestApiKey(agent, capability);
      if (!bestApiKey) {
        throw new Error('No suitable API key available');
      }

      // Get the decrypted API key
      const decryptedKey = await ApiKeyManager.getInstance().getDecryptedApiKey(bestApiKey.apiKeyId);
      if (!decryptedKey) {
        throw new Error('Failed to decrypt API key');
      }

      // Execute the request
      const result = await this.executeApiRequest(
        bestApiKey, 
        decryptedKey, 
        request, 
        capability
      );

      // Update usage statistics
      await this.updateApiUsage(agent, bestApiKey, result);

      // Record API key usage
      await ApiKeyManager.getInstance().recordUsage(bestApiKey.apiKeyId);

      return result;
    } catch (error) {
      console.error('Error executing agent with API keys:', error);
      throw error;
    }
  }

  // Select the best API key for a capability
  private async selectBestApiKey(agent: IntegratedAgent, capability: string): Promise<AgentApiKeyBinding | null> {
    const enhancedCapability = agent.enhancedCapabilities.find(cap => 
      cap.name.toLowerCase().includes(capability.toLowerCase())
    );

    if (!enhancedCapability) {
      return null;
    }

    // Find active bindings for this capability
    const suitableBindings = agent.apiKeyBindings.filter(binding => 
      binding.isActive && 
      enhancedCapability.requiredApiKeys.includes(binding.apiKeyId)
    );

    if (suitableBindings.length === 0) {
      return null;
    }

    // Sort by priority and select the best one
    return suitableBindings.sort((a, b) => b.priority - a.priority)[0];
  }

  // Execute API request
  private async executeApiRequest(
    apiKeyBinding: AgentApiKeyBinding,
    decryptedKey: string,
    request: any,
    capability: string
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Determine the appropriate endpoint and method based on capability
      const endpoint = this.getEndpointForCapability(capability, apiKeyBinding.platform);
      const method = this.getMethodForCapability(capability);
      const headers = this.getHeadersForPlatform(apiKeyBinding.platform, decryptedKey);

      const response = await fetch(endpoint, {
        method,
        headers,
        body: method !== 'GET' ? JSON.stringify(request) : undefined
      });

      const result = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${result.error?.message || ''}`);
      }

      return {
        success: true,
        data: result,
        duration,
        apiKeyUsed: apiKeyBinding.apiKeyId,
        platform: apiKeyBinding.platform
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        apiKeyUsed: apiKeyBinding.apiKeyId,
        platform: apiKeyBinding.platform
      };
    }
  }

  // Update API usage statistics
  private async updateApiUsage(
    agent: IntegratedAgent, 
    apiKeyBinding: AgentApiKeyBinding, 
    result: any
  ): Promise<void> {
    const cost = this.calculateRequestCost(result, apiKeyBinding.platform);
    
    agent.apiUsage.totalRequests++;
    agent.apiUsage.totalCost += cost;
    agent.apiUsage.requestsByKey[apiKeyBinding.apiKeyId] = 
      (agent.apiUsage.requestsByKey[apiKeyBinding.apiKeyId] || 0) + 1;
    agent.apiUsage.costByKey[apiKeyBinding.apiKeyId] = 
      (agent.apiUsage.costByKey[apiKeyBinding.apiKeyId] || 0) + cost;
    agent.apiUsage.lastRequest = new Date().toISOString();
    agent.apiUsage.averageResponseTime = 
      (agent.apiUsage.averageResponseTime + result.duration) / 2;

    if (!result.success) {
      agent.apiUsage.errorRate = 
        (agent.apiUsage.errorRate * (agent.apiUsage.totalRequests - 1) + 1) / agent.apiUsage.totalRequests;
    }

    // Update binding usage
    apiKeyBinding.usageCount++;
    apiKeyBinding.lastUsed = new Date().toISOString();

    await this.saveIntegratedAgent(agent);
  }

  // Get integrated agent
  async getIntegratedAgent(agentId: string): Promise<IntegratedAgent | null> {
    try {
      // Mock implementation - in real app, this would call API endpoint
      console.log(`Fetching integrated agent: ${agentId}`);
      return null; // Return null for now since we don't have the database table
    } catch (error) {
      console.error('Error fetching integrated agent:', error);
      throw new Error('Failed to fetch integrated agent');
    }
  }

  // Get all integrated agents
  async getAllIntegratedAgents(): Promise<IntegratedAgent[]> {
    try {
      // Mock data - return empty array for now
      return [];
    } catch (error) {
      console.error('Error fetching integrated agents:', error);
      throw new Error('Failed to fetch integrated agents');
    }
  }

  // Rotate API keys for an agent
  async rotateApiKeys(agentId: string): Promise<boolean> {
    try {
      const agent = await this.getIntegratedAgent(agentId);
      if (!agent || !agent.keyRotationPolicy.enabled) {
        return false;
      }

      await ApiKeyManager.getInstance().loadApiKeys();
      const availableApiKeys = ApiKeyManager.getInstance().getAllApiKeys();
      const activeKeys = availableApiKeys.filter(key => key.status === 'active');

      // Find replacement keys for each binding
      for (const binding of agent.apiKeyBindings) {
        const replacementKey = availableApiKeys.find(key => 
          key.platform === binding.platform && 
          key.id !== binding.apiKeyId &&
          key.status === 'active'
        );

        if (replacementKey) {
          binding.apiKeyId = replacementKey.id;
          binding.apiKeyName = replacementKey.name;
          binding.usageCount = 0;
          binding.lastUsed = new Date().toISOString();
        }
      }

      await this.saveIntegratedAgent(agent);
      return true;
    } catch (error) {
      console.error('Error rotating API keys:', error);
      throw new Error('Failed to rotate API keys');
    }
  }

  // Private helper methods
  private getCapabilityCategory(capability: string): string {
    const categories: Record<string, string> = {
      'natural_language_processing': 'communication',
      'data_analysis': 'data_analysis',
      'communication': 'communication',
      'payment_processing': 'integration',
      'accounting': 'integration'
    };
    return categories[capability] || 'general';
  }

  private getCostPerRequest(capability: string): number {
    const costs: Record<string, number> = {
      'natural_language_processing': 0.002,
      'data_analysis': 0.001,
      'communication': 0.05,
      'payment_processing': 0.029,
      'accounting': 0.01
    };
    return costs[capability] || 0.001;
  }

  private getEndpointForCapability(capability: string, platform: string): string {
    const endpoints: Record<string, Record<string, string>> = {
      'natural_language_processing': {
        'openai': 'https://api.openai.com/v1/chat/completions',
        'google': 'https://generativelanguage.googleapis.com/v1beta/models'
      },
      'communication': {
        'kixie': 'https://api.kixie.com/v1/calls',
        'openai': 'https://api.openai.com/v1/chat/completions'
      }
    };
    return endpoints[capability]?.[platform] || 'https://api.example.com/v1';
  }

  private getMethodForCapability(capability: string): string {
    return 'POST'; // Most AI APIs use POST
  }

  private getHeadersForPlatform(platform: string, apiKey: string): Record<string, string> {
    const headers: Record<string, Record<string, string>> = {
      'openai': {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      'google': {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      'kixie': {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      'stripe': {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    return headers[platform] || { 'Authorization': `Bearer ${apiKey}` };
  }

  private calculateRequestCost(result: any, platform: string): number {
    const baseCosts: Record<string, number> = {
      'openai': 0.002,
      'google': 0.001,
      'kixie': 0.05,
      'stripe': 0.029
    };
    return baseCosts[platform] || 0.001;
  }

  private async saveIntegratedAgent(agent: IntegratedAgent): Promise<void> {
    try {
      // Mock implementation - in real app, this would call API endpoint
      console.log(`Saving integrated agent: ${agent.name} (${agent.id})`);
      // For now, just log the agent data instead of saving to database
      console.log('Agent data:', {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        capabilities: agent.capabilities,
        apiKeyBindings: agent.apiKeyBindings.length
      });
    } catch (error) {
      console.error('Error saving integrated agent:', error);
      throw new Error('Failed to save integrated agent');
    }
  }

  private generateAgentId(): string {
    return `integrated_agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBindingId(): string {
    return `binding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCapabilityId(): string {
    return `capability_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const integratedAgentCreationService = new IntegratedAgentCreationService();
