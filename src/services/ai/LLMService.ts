/**
 * LLM Service
 * Central service for ALL AI agents to use real LLM intelligence
 * NO pattern matching, NO keyword searching - ONLY true AI reasoning
 */

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'openrouter';
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Central LLM service - ALL agents use this
 */
export class LLMService {
  private static instance: LLMService;
  private config: LLMConfig;
  
  private constructor(config: LLMConfig) {
    this.config = config;
  }
  
  static getInstance(config?: LLMConfig): LLMService {
    if (!LLMService.instance && config) {
      LLMService.instance = new LLMService(config);
    } else if (!LLMService.instance) {
      throw new Error('LLMService not initialized. Provide config on first call.');
    }
    return LLMService.instance;
  }
  
  /**
   * Send request to LLM and get response
   */
  async complete(messages: LLMMessage[]): Promise<LLMResponse> {
    if (this.config.provider === 'openai') {
      return this.openAIComplete(messages);
    } else if (this.config.provider === 'openrouter') {
      return this.openRouterComplete(messages);
    } else if (this.config.provider === 'anthropic') {
      return this.anthropicComplete(messages);
    } else {
      throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
    }
  }
  
  /**
   * OpenAI API integration
   */
  private async openAIComplete(messages: LLMMessage[]): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: messages,
        temperature: this.config.temperature ?? 0.1,
        max_tokens: this.config.maxTokens ?? 1000
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${error}`);
    }
    
    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      }
    };
  }
  
  /**
   * OpenRouter API integration
   * Unified API for GPT-4, Claude, and other models
   */
  private async openRouterComplete(messages: LLMMessage[]): Promise<LLMResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': 'https://rapidcompliance.io', // OpenRouter requires this
        'X-Title': 'Rapid CRM'
      },
      body: JSON.stringify({
        model: this.config.model || 'openai/gpt-4-turbo-preview',
        messages: messages,
        temperature: this.config.temperature ?? 0.1,
        max_tokens: this.config.maxTokens ?? 1000
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${error}`);
    }
    
    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    };
  }
  
  /**
   * Anthropic Claude API integration
   */
  private async anthropicComplete(messages: LLMMessage[]): Promise<LLMResponse> {
    // Convert messages to Claude format
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: this.config.maxTokens ?? 1000,
        temperature: this.config.temperature ?? 0.1,
        system: systemMessage,
        messages: userMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${error}`);
    }
    
    const data = await response.json();
    
    return {
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      }
    };
  }
  
  /**
   * Helper: Get structured JSON response from LLM
   */
  async getStructuredResponse<T>(messages: LLMMessage[]): Promise<T> {
    const response = await this.complete(messages);
    
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(response.content);
      return parsed as T;
    } catch (error) {
      // If LLM returned text with JSON embedded, extract it
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
      throw new Error('LLM did not return valid JSON: ' + response.content);
    }
  }
}

