import { AgentConfiguration } from '../../types/schema';

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

  constructor() {
    this.initializeDefaultProviders();
  }

  private async initializeDefaultProviders(): Promise<void> {
    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined';
    
    const defaultProviders: AIProvider[] = [
      {
        id: 'openai',
        name: 'OpenAI',
        type: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: isBrowser ? '' : (process.env.OPENAI_API_KEY || ''),
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
        apiKey: isBrowser ? '' : (process.env.ANTHROPIC_API_KEY || ''),
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
        apiKey: isBrowser ? '' : (process.env.GOOGLE_AI_API_KEY || ''),
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
      }
    ];

    defaultProviders.forEach(provider => {
      if (provider.apiKey) {
        this.providers.set(provider.id, provider);
        this.rateLimiters.set(provider.id, {
          requests: 0,
          tokens: 0,
          resetTime: Date.now() + 60000 // Reset every minute
        });
      }
    });

    console.log(`Initialized ${this.providers.size} AI providers`);
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

      // Enhance request with agent configuration
      const enhancedRequest = this.enhanceRequestWithAgentConfig(request, agentConfig);

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

      // Store history
      this.storeRequestHistory(providerId, enhancedRequest);
      this.storeResponseHistory(providerId, aiResponse);

      return aiResponse;

    } catch (error) {
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
    if (!agentConfig) return request;

    const enhancedRequest = { ...request };

    // Add system message if agent has system prompt
    if (agentConfig.systemPrompt) {
      enhancedRequest.messages = [
        {
          role: 'system',
          content: agentConfig.systemPrompt
        },
        ...enhancedRequest.messages
      ];
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
    const url = `${provider.baseUrl}/chat/completions`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    };

    // Simulate API call (in real implementation, this would make actual HTTP requests)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Simulate response based on provider
    return this.simulateAPIResponse(provider, request);
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
      responseContent = `I understand your request. Let me provide you with the most helpful information I can. 

Based on what you've shared, I recommend we focus on ensuring accuracy and compliance with all relevant regulations. 

Is there anything specific you'd like me to clarify or expand upon?`;
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
