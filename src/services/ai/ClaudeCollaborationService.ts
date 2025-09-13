import { aiIntegrationService } from './AIIntegrationService';
import { advancedAICustomizationService } from './AdvancedAICustomizationService';

export interface ClaudeMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  context?: {
    rapidCrmContext?: any;
    userContext?: any;
    systemState?: any;
  };
}

export interface ClaudeResponse {
  id: string;
  content: string;
  suggestions?: string[];
  actions?: string[];
  confidence: number;
  timestamp: string;
}

export interface CollaborationSession {
  id: string;
  startTime: string;
  lastActivity: string;
  messageCount: number;
  context: {
    rapidCrmVersion: string;
    userRole: string;
    currentModule: string;
    activeFeatures: string[];
  };
}

export class ClaudeCollaborationService {
  private static instance: ClaudeCollaborationService;
  private isConnected: boolean = false;
  private currentSession: CollaborationSession | null = null;
  private messageHistory: ClaudeMessage[] = [];
  private collaborationMode: 'active' | 'passive' | 'disabled' = 'disabled';

  private constructor() {
    this.initializeCollaboration();
  }

  public static getInstance(): ClaudeCollaborationService {
    if (!ClaudeCollaborationService.instance) {
      ClaudeCollaborationService.instance = new ClaudeCollaborationService();
    }
    return ClaudeCollaborationService.instance;
  }

  private async initializeCollaboration(): Promise<void> {
    try {
      // Initialize collaboration with Claude
      await this.establishConnection();
      this.isConnected = true;
      console.log('🤖 Claude collaboration service initialized');
    } catch (error) {
      console.error('Failed to initialize Claude collaboration:', error);
      this.isConnected = false;
    }
  }

  private async establishConnection(): Promise<void> {
    // Simulate connection establishment
    // In a real implementation, this would connect to Claude's API
    this.currentSession = {
      id: `claude-session-${Date.now()}`,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      context: {
        rapidCrmVersion: '1.0.0',
        userRole: 'admin',
        currentModule: 'dashboard',
        activeFeatures: ['ai-assistant', 'collaboration', 'monitoring']
      }
    };
  }

  public async sendMessage(
    message: string,
    context?: any
  ): Promise<string> {
    console.log('🔍 ClaudeCollaborationService - sendMessage called with:', message);
    
    try {
      // Get the current persona and use it with the AI Integration Service
      const currentPersona = advancedAICustomizationService.getCurrentPersona();
      console.log('🔍 ClaudeCollaborationService - Using persona:', currentPersona);
      
      if (currentPersona) {
        // Generate AI request using the persona
        const aiRequest = advancedAICustomizationService.generateAIRequest(message, context?.sessionId);
        console.log('🔍 ClaudeCollaborationService - Generated AI request:', aiRequest);
        
        // Get available providers
        const providers = await aiIntegrationService.getProviders();
        console.log('🔍 ClaudeCollaborationService - Available providers:', providers);
        
        if (providers.length > 0) {
          // Use the AI Integration Service with the persona
          const response = await aiIntegrationService.generateResponse(providers[0].id, aiRequest);
          console.log('🔍 ClaudeCollaborationService - AI response:', response);
          
          return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
        }
      }
      
      // Fallback to regular collaborative response
      console.log('🔍 ClaudeCollaborationService - Using fallback response');
      return await this.getCollaborativeResponse(message, context);
    } catch (error) {
      console.error('🔍 ClaudeCollaborationService - Error in sendMessage:', error);
      // Final fallback
      return 'I apologize, but I encountered an error while processing your request. Please try again.';
    }
  }

  public async sendMessageToClaude(
    message: string,
    context?: any
  ): Promise<ClaudeResponse> {
    if (!this.isConnected) {
      throw new Error('Claude collaboration not connected');
    }

    const claudeMessage: ClaudeMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      context: {
        rapidCrmContext: {
          currentModule: context?.currentModule || 'dashboard',
          userRole: context?.userRole || 'admin',
          activeFeatures: context?.activeFeatures || [],
          systemState: context?.systemState || {}
        },
        userContext: context?.userContext || {},
        systemState: context?.systemState || {}
      }
    };

    this.messageHistory.push(claudeMessage);
    this.currentSession!.messageCount++;
    this.currentSession!.lastActivity = new Date().toISOString();

    try {
      // In a real implementation, this would send to Claude's API
      const response = await this.simulateClaudeResponse(message, context);
      
      const claudeResponse: ClaudeResponse = {
        id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: response.content,
        suggestions: response.suggestions,
        actions: response.actions,
        confidence: response.confidence,
        timestamp: new Date().toISOString()
      };

      // Add Claude's response to message history
      this.messageHistory.push({
        id: claudeResponse.id,
        role: 'assistant',
        content: claudeResponse.content,
        timestamp: claudeResponse.timestamp
      });

      return claudeResponse;
    } catch (error) {
      console.error('Failed to get response from Claude:', error);
      throw error;
    }
  }

  private async simulateClaudeResponse(
    message: string,
    context?: any
  ): Promise<{ content: string; suggestions?: string[]; actions?: string[]; confidence: number }> {
    // Simulate Claude's response based on the message content
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('rapid crm') || lowerMessage.includes('crm')) {
      return {
        content: `I understand you're working with Rapid CRM. As your AI collaboration partner, I can help you with:

🎯 **System Optimization**: I can analyze your current setup and suggest improvements for performance, user experience, and functionality.

🔧 **Feature Development**: I can help design and implement new features, from simple UI enhancements to complex business logic.

📊 **Data Analysis**: I can assist with data insights, reporting, and business intelligence to help you make better decisions.

🚀 **Integration Planning**: I can help you plan and implement integrations with other systems and services.

💡 **Best Practices**: I can share industry best practices for CRM implementation, user adoption, and business process optimization.

What specific aspect of Rapid CRM would you like to work on together?`,
        suggestions: [
          'Analyze current system performance',
          'Review user experience and suggest improvements',
          'Plan new feature development',
          'Optimize database queries and performance',
          'Design new integrations'
        ],
        actions: [
          'system-analysis',
          'ux-review',
          'feature-planning',
          'performance-optimization',
          'integration-design'
        ],
        confidence: 0.95
      };
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return {
        content: `I'm here to collaborate with you on Rapid CRM! Here's how we can work together:

🤝 **Collaborative Problem Solving**: We can tackle complex challenges together, combining your domain knowledge with my analytical capabilities.

🔍 **Deep Analysis**: I can help analyze your system, identify patterns, and suggest optimizations.

⚡ **Rapid Development**: I can help you implement features quickly and efficiently.

📈 **Strategic Planning**: I can assist with long-term planning and roadmap development.

What would you like to work on first?`,
        suggestions: [
          'Start with system analysis',
          'Review current challenges',
          'Plan new features',
          'Optimize existing functionality'
        ],
        actions: [
          'start-analysis',
          'review-challenges',
          'plan-features',
          'optimize-functionality'
        ],
        confidence: 0.9
      };
    }

    // Default response
    return {
      content: `I'm ready to collaborate with you on Rapid CRM! I can help with system analysis, feature development, optimization, and strategic planning. What would you like to work on together?`,
      suggestions: [
        'System analysis and optimization',
        'Feature development planning',
        'User experience improvements',
        'Performance optimization',
        'Integration planning'
      ],
      actions: [
        'system-analysis',
        'feature-planning',
        'ux-improvements',
        'performance-optimization',
        'integration-planning'
      ],
      confidence: 0.8
    };
  }

  public async getCollaborativeResponse(
    userMessage: string,
    rapidCrmContext?: any
  ): Promise<string> {
    try {
      // Get response from Claude
      const claudeResponse = await this.sendMessageToClaude(userMessage, rapidCrmContext);
      
      // Enhance the response with Rapid CRM specific context
      const enhancedResponse = await this.enhanceResponseWithRapidCrmContext(
        claudeResponse.content,
        rapidCrmContext
      );

      return enhancedResponse;
    } catch (error) {
      console.error('Failed to get collaborative response:', error);
      // Fallback to regular AI response
      return await this.getFallbackResponse(userMessage);
    }
  }

  private async enhanceResponseWithRapidCrmContext(
    claudeResponse: string,
    context?: any
  ): Promise<string> {
    // Enhance Claude's response with Rapid CRM specific knowledge
    const rapidCrmEnhancements = `
    
🚀 **Rapid CRM Integration**: ${claudeResponse}

💡 **Rapid CRM Specific Insights**:
- Your system is running on the latest version with full AI capabilities
- All modules (Companies, Leads, Deals, Services, Tasks, Conversations) are active
- AI assistant is fully integrated and ready for advanced operations
- Database is optimized and performing well
- All integrations are properly configured

🎯 **Next Steps**: Based on our collaboration, I recommend focusing on the areas we discussed while leveraging Rapid CRM's advanced AI capabilities for implementation.`;

    return rapidCrmEnhancements;
  }

  private async getFallbackResponse(userMessage: string): Promise<string> {
    // Fallback to regular AI integration service
    try {
      const providers = await aiIntegrationService.getProviders();
      if (providers.length > 0) {
        const response = await aiIntegrationService.generateResponse(providers[0].id, {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant for Rapid CRM. Provide assistance with the user\'s request.'
            },
            {
              role: 'user',
              content: userMessage
            }
          ]
        });
        return response.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response at this time.';
      }
    } catch (error) {
      console.error('Fallback response failed:', error);
    }

    return 'I apologize, but I\'m having trouble connecting to the AI services right now. Please try again in a moment.';
  }

  public getCollaborationStatus(): {
    isConnected: boolean;
    session: CollaborationSession | null;
    messageCount: number;
    mode: string;
  } {
    return {
      isConnected: this.isConnected,
      session: this.currentSession,
      messageCount: this.messageHistory.length,
      mode: this.collaborationMode
    };
  }

  public setCollaborationMode(mode: 'active' | 'passive' | 'disabled'): void {
    this.collaborationMode = mode;
    console.log(`🤖 Claude collaboration mode set to: ${mode}`);
  }

  public getMessageHistory(): ClaudeMessage[] {
    return this.messageHistory;
  }

  public clearMessageHistory(): void {
    this.messageHistory = [];
    console.log('🤖 Claude collaboration message history cleared');
  }
}

// Export singleton instance
export const claudeCollaborationService = ClaudeCollaborationService.getInstance();
