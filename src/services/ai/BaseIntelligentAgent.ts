/**
 * Base Intelligent Agent
 * ALL agents in the system MUST extend this class
 * Enforces TRUE LLM-based intelligence - NO pattern matching allowed
 */

import { LLMService } from './LLMService';
import { getLLMConfig, isLLMAvailable } from '../../config/ai.config';

export interface AgentConfig {
  agentId: string;
  agentName: string;
  agentType: string;
  systemPrompt: string;
  requireLLM?: boolean; // Default true - agent FAILS without LLM
}

export interface AgentResponse<T = any> {
  response: T;
  reasoning: string;
  confidence: number;
  tokensUsed?: number;
}

/**
 * Base class for ALL intelligent agents
 * Enforces LLM usage - no half-measures
 */
export abstract class BaseIntelligentAgent {
  protected llmService: LLMService;
  protected config: AgentConfig;
  protected conversationHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
  
  constructor(config: AgentConfig) {
    this.config = {
      ...config,
      requireLLM: config.requireLLM ?? true // Default: LLM REQUIRED
    };
    
    // Check if LLM is available
    if (!isLLMAvailable()) {
      const error = `❌ CRITICAL: ${config.agentName} requires LLM but no API key configured`;
      console.error(error);
      console.error('📝 Add VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY to .env file');
      
      if (this.config.requireLLM) {
        throw new Error(error + '\nAGENT CANNOT FUNCTION WITHOUT TRUE INTELLIGENCE');
      }
    }
    
    // Initialize LLM service
    const llmConfig = getLLMConfig();
    this.llmService = LLMService.getInstance(llmConfig);
    
    // Set system prompt
    this.conversationHistory.push({
      role: 'system',
      content: config.systemPrompt
    });
    
    console.log(`✅ ${config.agentName} initialized with TRUE INTELLIGENCE (${llmConfig.provider} ${llmConfig.model})`);
  }
  
  /**
   * Ask the LLM for intelligent reasoning
   */
  protected async think<T = string>(
    prompt: string,
    expectJSON: boolean = false
  ): Promise<AgentResponse<T>> {
    // Add user message
    this.conversationHistory.push({
      role: 'user',
      content: prompt
    });
    
    try {
      let result: T;
      let response;
      
      if (expectJSON) {
        result = await this.llmService.getStructuredResponse<T>(this.conversationHistory);
        response = { content: JSON.stringify(result) };
      } else {
        response = await this.llmService.complete(this.conversationHistory);
        result = response.content as T;
      }
      
      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: typeof result === 'string' ? result : JSON.stringify(result)
      });
      
      return {
        response: result,
        reasoning: typeof result === 'object' && result !== null && 'reasoning' in result ? 
          (result as any).reasoning : 'LLM reasoning',
        confidence: typeof result === 'object' && result !== null && 'confidence' in result ?
          (result as any).confidence : 0.95,
        tokensUsed: response.usage?.totalTokens
      };
      
    } catch (error) {
      console.error(`❌ ${this.config.agentName} thinking failed:`, error);
      
      if (this.config.requireLLM) {
        throw new Error(`${this.config.agentName} cannot function without LLM`);
      }
      
      throw error;
    }
  }
  
  /**
   * Reset conversation (clear memory)
   */
  protected resetConversation(): void {
    this.conversationHistory = [{
      role: 'system',
      content: this.config.systemPrompt
    }];
  }
  
  /**
   * Get conversation history
   */
  protected getConversationHistory() {
    return [...this.conversationHistory];
  }
}

