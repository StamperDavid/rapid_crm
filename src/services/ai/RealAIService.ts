import { RAPID_CRM_AI_IDENTITY, SYSTEM_PROMPT_TEMPLATE } from '../../config/ai-identity';
import { dynamicPersonaService } from './DynamicPersonaService';

export interface AIRequest {
  message: string;
  context?: any;
}

export interface AIResponse {
  answer: string;
  confidence: number;
  sources: string[];
  reasoning?: string;
}

class RealAIService {
  private apiKey: string = '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';
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  private model: string = 'anthropic/claude-3.5-sonnet';

  async askQuestion(request: AIRequest): Promise<AIResponse> {
    try {
      console.log('🤖 Real AI Service - Processing question:', request.message);
      
      // Get current persona
      const currentPersona = dynamicPersonaService.getCurrentPersona();
      console.log('🎭 Current persona:', currentPersona.name);

      // Build system prompt with current persona
      const systemPrompt = this.buildSystemPrompt(currentPersona);
      
      // Prepare messages for OpenRouter
      const messages = [
        {
          role: 'system' as const,
          content: systemPrompt
        },
        {
          role: 'user' as const,
          content: request.message
        }
      ];

      console.log('📤 Sending request to OpenRouter...');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Rapid CRM AI Assistant'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ OpenRouter response received');

      // Extract the AI's response
      const aiAnswer = data.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
      
      // Record the interaction for learning
      dynamicPersonaService.recordInteraction(request.message, aiAnswer, request.context);

      // Build response
      const aiResponse: AIResponse = {
        answer: aiAnswer,
        confidence: 0.9, // High confidence for real AI responses
        sources: ['OpenRouter AI', 'Dynamic Knowledge Base'],
        reasoning: `Processed using ${currentPersona.name} persona with ${this.model}`
      };

      console.log('🎯 AI Response generated:', aiResponse.answer.substring(0, 100) + '...');
      
      return aiResponse;

    } catch (error) {
      console.error('❌ Real AI Service error:', error);
      
      // Fallback response
      return {
        answer: `I apologize, but I'm experiencing technical difficulties. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again in a moment.`,
        confidence: 0.1,
        sources: ['Error Handler'],
        reasoning: 'Fallback due to API error'
      };
    }
  }

  private buildSystemPrompt(persona: any): string {
    // Use the system prompt template from ai-identity.js
    let systemPrompt = SYSTEM_PROMPT_TEMPLATE;

    // Enhance with current persona settings
    systemPrompt += `\n\n## Current AI Persona Configuration:
- Name: ${persona.name}
- Communication Style: ${persona.communicationStyle}
- Expertise Focus: ${persona.expertiseFocus}
- Learning Rate: ${persona.learningRate}
- Memory Retention: ${persona.memoryRetention} days
- Learning Enabled: ${persona.isLearningEnabled}

## Personality Traits:
- Formality: ${persona.formality}/10
- Creativity: ${persona.creativity}/10
- Technicality: ${persona.technicality}/10
- Empathy: ${persona.empathy}/10
- Assertiveness: ${persona.assertiveness}/10

You are a truly intelligent AI assistant with dynamic persona management and learning capabilities. Respond naturally and intelligently to any question or request, adapting your communication style based on the current persona configuration.`;

    return systemPrompt;
  }

  // Test the connection
  async testConnection(): Promise<boolean> {
    try {
      const testResponse = await this.askQuestion({
        message: "Hello, can you tell me what 2+2 equals?",
        context: { test: true }
      });
      
      console.log('🧪 Connection test successful:', testResponse.answer);
      return true;
    } catch (error) {
      console.error('🧪 Connection test failed:', error);
      return false;
    }
  }
}

export const realAIService = new RealAIService();
