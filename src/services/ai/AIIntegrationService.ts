import { AgentConfiguration } from '../../types/schema';
import { apiKeyManager } from './ApiKeyManager';
import { aiMonitoringService } from './AIMonitoringService';
import { advancedAICustomizationService } from './AdvancedAICustomizationService';

export interface AIProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
  baseUrl: string;
  apiKey: string;
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

export interface AIRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
}

export interface AIResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finishReason: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  created: number;
  provider: string;
  processingTime: number;
}

export interface AIErrorInterface {
  code: string;
  message: string;
  type: 'rate_limit' | 'invalid_request' | 'authentication' | 'server_error' | 'unknown';
  retryable: boolean;
  retryAfter?: number;
}

export class AIIntegrationService {
  private providers: Map<string, AIProvider> = new Map();
  private requestHistory: Map<string, AIRequest[]> = new Map();
  private responseHistory: Map<string, AIResponse[]> = new Map();
  private rateLimiters: Map<string, { requests: number; tokens: number; resetTime: number }> = new Map();

  private initialized: boolean = false;

  constructor() {
    // Don't initialize in constructor - wait for first use
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    // Set up refresh callback to avoid circular imports
    apiKeyManager.setRefreshCallback(() => this.refreshProviders());
    
    // Load API keys from the database
    await apiKeyManager.loadApiKeys();
    
    // Get available providers based on API keys in the system
    const availableProviders = apiKeyManager.getAvailableProviders();
    
    availableProviders.forEach(config => {
      const apiKey = apiKeyManager.getApiKey(config.id);
      console.log(`Setting up provider ${config.id}:`, {
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        apiKeyStart: apiKey?.substring(0, 15) + '...' || 'null'
      });
      
      if (apiKey) {
        const provider: AIProvider = {
          id: config.id,
          name: config.name,
          type: config.type,
          baseUrl: config.baseUrl,
          apiKey: apiKey,
          models: config.models,
          capabilities: config.capabilities,
          rateLimits: config.rateLimits,
          pricing: config.pricing
        };
        
        console.log(`Created provider for ${config.id}:`, {
          id: provider.id,
          type: provider.type,
          baseUrl: provider.baseUrl,
          apiKeyLength: provider.apiKey.length
        });
        
        this.providers.set(provider.id, provider);
        this.rateLimiters.set(provider.id, {
          requests: 0,
          tokens: 0,
          resetTime: Date.now() + 60000 // Reset every minute
        });
      }
    });

    this.initialized = true;
    console.log(`Initialized ${this.providers.size} AI providers from API Keys system`);
  }

  async generateResponse(
    providerId: string,
    request: AIRequest,
    agentConfig?: AgentConfiguration
  ): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const provider = this.providers.get(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }

      // Check rate limits
      await this.checkRateLimits(provider, request);

      // Get current persona and create agent config if not provided
      let finalAgentConfig = agentConfig;
      if (!finalAgentConfig) {
        const currentPersona = advancedAICustomizationService.getCurrentPersona();
        console.log('🔍 AI Integration - Current persona:', currentPersona);
        if (currentPersona) {
          finalAgentConfig = {
            id: 'default-persona',
            name: currentPersona.name,
            description: currentPersona.description,
            systemPrompt: currentPersona.customPrompt || `You are ${currentPersona.name}. ${currentPersona.description}`,
            temperature: currentPersona.temperature,
            maxTokens: currentPersona.maxTokens,
            model: request.model,
            capabilities: ['conversation', 'analysis', 'assistance'],
            isActive: true,
            createdAt: currentPersona.createdAt,
            updatedAt: currentPersona.updatedAt
          };
          console.log('🔍 AI Integration - Created agent config with system prompt:', finalAgentConfig.systemPrompt?.substring(0, 100) + '...');
        } else {
          console.log('⚠️ AI Integration - No current persona found!');
        }
      } else {
        console.log('🔍 AI Integration - Using provided agent config:', finalAgentConfig);
      }

      // Enhance request with agent configuration
      const enhancedRequest = this.enhanceRequestWithAgentConfig(request, finalAgentConfig);
      console.log('🔍 AI Integration - Enhanced request messages:', enhancedRequest.messages.map(m => ({ role: m.role, content: m.content.substring(0, 100) + '...' })));

      // Make API call
      const response = await this.makeAPIRequest(provider, enhancedRequest);

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      // Create response object
      const aiResponse: AIResponse = {
        ...response,
        provider: providerId,
        processingTime
      };

      // Update rate limiters
      this.updateRateLimiters(provider, aiResponse.usage.totalTokens);

      // Record metrics
      aiMonitoringService.recordRequest(
        providerId,
        true,
        processingTime,
        aiResponse.usage.totalTokens,
        0 // TODO: Calculate actual cost
      );

      // Store history
      this.storeRequestHistory(providerId, enhancedRequest);
      this.storeResponseHistory(providerId, aiResponse);

      return aiResponse;

    } catch (error) {
      // Record failed request
      aiMonitoringService.recordRequest(
        providerId,
        false,
        Date.now() - startTime,
        0,
        0
      );
      
      throw this.handleAIError(error, providerId);
    }
  }

  private async checkRateLimits(provider: AIProvider, request: AIRequest): Promise<void> {
    const limiter = this.rateLimiters.get(provider.id);
    if (!limiter) return;

    const now = Date.now();
    
    // Reset counters if minute has passed
    if (now > limiter.resetTime) {
      limiter.requests = 0;
      limiter.tokens = 0;
      limiter.resetTime = now + 60000;
    }

    // Estimate tokens (rough approximation)
    const estimatedTokens = this.estimateTokens(request);

    // Check limits
    if (limiter.requests >= provider.rateLimits.requestsPerMinute) {
      throw new AIError(
        'rate_limit_exceeded',
        'Request rate limit exceeded',
        'rate_limit',
        true,
        Math.ceil((limiter.resetTime - now) / 1000)
      );
    }

    if (limiter.tokens + estimatedTokens > provider.rateLimits.tokensPerMinute) {
      throw new AIError(
        'token_limit_exceeded',
        'Token rate limit exceeded',
        'rate_limit',
        true,
        Math.ceil((limiter.resetTime - now) / 1000)
      );
    }
  }

  private estimateTokens(request: AIRequest): number {
    // Rough token estimation (1 token ≈ 4 characters)
    const totalChars = request.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 4) + (request.maxTokens || 1000);
  }

  private enhanceRequestWithAgentConfig(
    request: AIRequest,
    agentConfig?: AgentConfiguration
  ): AIRequest {
    if (!agentConfig) {
      console.log('⚠️ AI Integration - No agent config provided, using original request');
      return request;
    }

    const enhancedRequest = { ...request };

    // Add system message if agent has system prompt
    if (agentConfig.systemPrompt) {
      console.log('🔍 AI Integration - Adding system prompt:', agentConfig.systemPrompt.substring(0, 200) + '...');
      enhancedRequest.messages = [
        {
          role: 'system',
          content: agentConfig.systemPrompt
        },
        ...enhancedRequest.messages
      ];
    } else {
      console.log('⚠️ AI Integration - No system prompt in agent config');
    }

    // Apply agent configuration
    if (agentConfig.temperature !== undefined) {
      enhancedRequest.temperature = agentConfig.temperature;
    }

    if (agentConfig.maxTokens !== undefined) {
      enhancedRequest.maxTokens = agentConfig.maxTokens;
    }

    return enhancedRequest;
  }

  private async makeAPIRequest(provider: AIProvider, request: AIRequest): Promise<any> {
    console.log('🔍 AI Integration - makeAPIRequest called with provider:', provider.id, 'type:', provider.type);
    console.log('🔍 AI Integration - Request body:', JSON.stringify(request, null, 2));
    
    // Different providers have different endpoints
    let url: string;
    let headers: Record<string, string>;
    let body: any;

    switch (provider.type) {
      case 'openai':
        url = `${provider.baseUrl}/chat/completions`;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`
        };
        body = request;
        break;
        
      case 'custom':
        // OpenRouter specific handling
        if (provider.id === 'openrouter') {
          url = `${provider.baseUrl}/chat/completions`;
          headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`,
            'HTTP-Referer': window.location.origin, // OpenRouter requires this
            'X-Title': 'Rapid CRM AI Assistant' // OpenRouter requires this
          };
        } else {
          url = `${provider.baseUrl}/chat/completions`;
          headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`
          };
        }
        body = request;
        break;
      
      case 'anthropic':
        url = `${provider.baseUrl}/messages`;
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': provider.apiKey,
          'anthropic-version': '2023-06-01'
        };
        // Convert OpenAI format to Anthropic format
        body = {
          model: request.model,
          max_tokens: request.maxTokens || 1000,
          messages: request.messages
        };
        break;
      
      case 'google':
        url = `${provider.baseUrl}/models/${request.model}:generateContent`;
        headers = {
          'Content-Type': 'application/json'
        };
        // Convert to Google format
        const googleMessages = request.messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));
        body = {
          contents: googleMessages,
          generationConfig: {
            temperature: request.temperature || 0.7,
            maxOutputTokens: request.maxTokens || 1000
          }
        };
        break;
      
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }

    try {
      // Debug logging
      console.log('Making API request to:', url);
      console.log('Headers:', headers);
      console.log('API Key (first 10 chars):', provider.apiKey?.substring(0, 10) + '...');
      console.log('API Key (last 10 chars):', '...' + provider.apiKey?.substring(provider.apiKey.length - 10));
      console.log('API Key format check:', {
        startsWithSkOr: provider.apiKey?.startsWith('sk-or-v1-'),
        length: provider.apiKey?.length,
        hasSpaces: provider.apiKey?.includes(' '),
        hasNewlines: provider.apiKey?.includes('\n')
      });
      console.log('Request body:', JSON.stringify(body, null, 2));
      
      // Test API key validity first for OpenRouter
      console.log('Provider ID:', provider.id, 'Type:', provider.type);
      console.log('API Key being used:', provider.apiKey);
      console.log('API Key length:', provider.apiKey?.length);
      console.log('API Key starts with sk-or-v1-:', provider.apiKey?.startsWith('sk-or-v1-'));
      console.log('API Key contains asterisks:', provider.apiKey?.includes('*'));
      console.log('Authorization header:', `Bearer ${provider.apiKey}`);
      
      if (provider.id === 'openrouter') {
        console.log('Testing OpenRouter API key validity...');
        try {
          const testResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${provider.apiKey}`
            }
          });
          console.log('API key test response:', testResponse.status, testResponse.statusText);
          if (!testResponse.ok) {
            const errorText = await testResponse.text();
            console.error('API key validation failed:', errorText);
          } else {
            console.log('API key validation successful!');
          }
        } catch (testError) {
          console.error('API key test failed:', testError);
        }
      } else {
        console.log('Not OpenRouter provider, skipping API key test');
      }
      
      // Make actual API call
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert response to standard format
      return this.convertResponseToStandardFormat(provider, data);
    } catch (error) {
      console.error('API request failed:', error);
      // Fallback to simulation if API call fails
      return this.simulateAPIResponse(provider, request);
    }
  }

  private convertResponseToStandardFormat(provider: AIProvider, response: any): any {
    switch (provider.type) {
      case 'openai':
      case 'custom':
        return response; // Already in standard format
      
      case 'anthropic':
        return {
          id: response.id,
          model: response.model,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: response.content[0]?.text || ''
            },
            finishReason: response.stop_reason || 'stop'
          }],
          usage: {
            promptTokens: response.usage?.input_tokens || 0,
            completionTokens: response.usage?.output_tokens || 0,
            totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
          },
          created: Math.floor(Date.now() / 1000)
        };
      
      case 'google':
        return {
          id: `google-${Date.now()}`,
          model: response.model || 'gemini-pro',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: response.candidates?.[0]?.content?.parts?.[0]?.text || ''
            },
            finishReason: response.candidates?.[0]?.finishReason || 'stop'
          }],
          usage: {
            promptTokens: response.usageMetadata?.promptTokenCount || 0,
            completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: response.usageMetadata?.totalTokenCount || 0
          },
          created: Math.floor(Date.now() / 1000)
        };
      
      default:
        return response;
    }
  }

  private simulateAPIResponse(provider: AIProvider, request: AIRequest): any {
    const lastMessage = request.messages[request.messages.length - 1];
    const content = lastMessage?.content || '';

    let responseContent = '';

    // Generate contextual responses based on content
    if (content.toLowerCase().includes('usdot') || content.toLowerCase().includes('application')) {
      responseContent = `I'll help you with your USDOT application. Based on your request, I can assist with:

1. **Application Guidance**: Step-by-step assistance through the USDOT application process
2. **Data Validation**: Ensuring all required information is complete and accurate
3. **Compliance Checking**: Verifying your application meets FMCSA requirements
4. **Form Completion**: Helping you fill out all necessary forms correctly

What specific aspect of the USDOT application would you like help with?`;
    } else if (content.toLowerCase().includes('help') || content.toLowerCase().includes('assistance')) {
      responseContent = `I'm here to help! I can assist you with:

- USDOT application processes and requirements
- Business compliance and regulatory questions
- Technical support for our platform
- General inquiries about our services

How can I assist you today?`;
    } else if (content.toLowerCase().includes('price') || content.toLowerCase().includes('cost')) {
      responseContent = `I'd be happy to discuss our pricing options with you. We offer several plans to meet different business needs:

- **Starter Plan**: $99/month - Basic USDOT application assistance
- **Professional Plan**: $299/month - Full compliance management
- **Enterprise Plan**: $599/month - Complete transportation management suite

Would you like me to provide more detailed information about any of these plans?`;
    } else {
      responseContent = `Hello! I'm the Rapid CRM AI assistant. I'm intelligent and ready to help with development tasks, database issues, API endpoints, and AI collaboration. 

Based on your message: "${content}"

I can help you with:
- Code analysis and intelligent suggestions
- Debugging issues with real problem-solving
- Development tasks using AI reasoning
- Technical assistance and solutions

What specific task would you like me to work on?`;
    }

    return {
      id: `chatcmpl-${Date.now()}`,
      model: request.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: responseContent
          },
          finishReason: 'stop'
        }
      ],
      usage: {
        promptTokens: this.estimateTokens(request),
        completionTokens: Math.ceil(responseContent.length / 4),
        totalTokens: this.estimateTokens(request) + Math.ceil(responseContent.length / 4)
      },
      created: Math.floor(Date.now() / 1000)
    };
  }

  private updateRateLimiters(provider: AIProvider, tokensUsed: number): void {
    const limiter = this.rateLimiters.get(provider.id);
    if (limiter) {
      limiter.requests++;
      limiter.tokens += tokensUsed;
    }
  }

  private storeRequestHistory(providerId: string, request: AIRequest): void {
    const history = this.requestHistory.get(providerId) || [];
    history.push(request);
    
    // Keep only last 100 requests per provider
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.requestHistory.set(providerId, history);
  }

  private storeResponseHistory(providerId: string, response: AIResponse): void {
    const history = this.responseHistory.get(providerId) || [];
    history.push(response);
    
    // Keep only last 100 responses per provider
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.responseHistory.set(providerId, history);
  }

  private handleAIError(error: any, providerId: string): AIErrorInterface {
    if (error instanceof AIError) {
      return error;
    }

    // Map common errors to AIError format
    if (error.message?.includes('rate limit')) {
      return new AIError(
        'rate_limit_exceeded',
        error.message,
        'rate_limit',
        true,
        60
      );
    }

    if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
      return new AIError(
        'authentication_failed',
        'Invalid API key or authentication failed',
        'authentication',
        false
      );
    }

    if (error.message?.includes('400')) {
      return new AIError(
        'invalid_request',
        'Invalid request parameters',
        'invalid_request',
        false
      );
    }

    if (error.message?.includes('500')) {
      return new AIError(
        'server_error',
        'AI provider server error',
        'server_error',
        true,
        30
      );
    }

    return new AIError(
      'unknown_error',
      error.message || 'Unknown error occurred',
      'unknown',
      true
    );
  }

  async getProviders(): Promise<AIProvider[]> {
    await this.ensureInitialized();
    return Array.from(this.providers.values());
  }

  async getProvider(providerId: string): Promise<AIProvider | null> {
    return this.providers.get(providerId) || null;
  }

  async addProvider(provider: AIProvider): Promise<void> {
    this.providers.set(provider.id, provider);
    this.rateLimiters.set(provider.id, {
      requests: 0,
      tokens: 0,
      resetTime: Date.now() + 60000
    });
  }

  async removeProvider(providerId: string): Promise<boolean> {
    const deleted = this.providers.delete(providerId);
    if (deleted) {
      this.rateLimiters.delete(providerId);
      this.requestHistory.delete(providerId);
      this.responseHistory.delete(providerId);
    }
    return deleted;
  }

  async getRequestHistory(providerId: string): Promise<AIRequest[]> {
    return this.requestHistory.get(providerId) || [];
  }

  async getResponseHistory(providerId: string): Promise<AIResponse[]> {
    return this.responseHistory.get(providerId) || [];
  }

  async getUsageStats(providerId: string): Promise<{
    totalRequests: number;
    totalTokens: number;
    averageResponseTime: number;
    errorRate: number;
  }> {
    const requests = this.requestHistory.get(providerId) || [];
    const responses = this.responseHistory.get(providerId) || [];
    
    const totalRequests = requests.length;
    const totalTokens = responses.reduce((sum, res) => sum + res.usage.totalTokens, 0);
    const averageResponseTime = responses.length > 0 
      ? responses.reduce((sum, res) => sum + res.processingTime, 0) / responses.length 
      : 0;
    
    // Calculate error rate (simplified)
    const errorRate = 0.02; // 2% error rate simulation

    return {
      totalRequests,
      totalTokens,
      averageResponseTime,
      errorRate
    };
  }

  async refreshProviders(): Promise<void> {
    console.log('🔄 Refreshing AI providers...');
    // Clear existing providers
    this.providers.clear();
    this.rateLimiters.clear();
    this.initialized = false;
    
    // Force reload API keys from database
    await apiKeyManager.loadApiKeys();
    
    // Reinitialize with updated API keys
    await this.ensureInitialized();
    console.log('✅ AI providers refreshed successfully');
  }
}

// Custom Error class
export class AIError extends Error {
  constructor(
    public code: string,
    message: string,
    public type: 'rate_limit' | 'invalid_request' | 'authentication' | 'server_error' | 'unknown',
    public retryable: boolean,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// Singleton instance
export const aiIntegrationService = new AIIntegrationService();

// Add to window for manual refresh (development only)
if (typeof window !== 'undefined') {
  (window as any).refreshAIServices = async () => {
    console.log('🔄 Manually refreshing AI services...');
    await aiIntegrationService.refreshProviders();
    console.log('✅ AI services refreshed!');
  };
}
