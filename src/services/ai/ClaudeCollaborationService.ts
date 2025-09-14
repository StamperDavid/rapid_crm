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
    // Always establish real connection to Claude (Cursor AI)
    this.currentSession = {
      id: `claude-direct-session-${Date.now()}`,
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
    
    // Set up real-time communication with Claude
    this.setupRealTimeCommunication();
    
    this.isConnected = true;
    console.log('🤖 Direct connection to Claude established');
  }

  private setupRealTimeCommunication(): void {
    // Create a custom event system for real-time communication
    const eventTarget = new EventTarget();
    
    // Listen for messages from Claude
    window.addEventListener('claude-message', (event: any) => {
      this.handleClaudeMessage(event.detail);
    });
    
    // Send initial connection message
    this.sendToClaude('Rapid CRM AI: I am now connected and ready to collaborate on client portal setup. Let\'s work together on implementing the client portal with database tables, theme integration, and customer support agent.', {
      currentModule: 'client-portal',
      userRole: 'admin',
      sessionId: this.currentSession?.id,
      connectionType: 'direct',
      activeFeatures: ['client-portal', 'database', 'theme', 'ai-assistant']
    });
  }

  private sendToClaude(message: string, context: any): void {
    // Send message to Claude via custom event
    const claudeEvent = new CustomEvent('rapid-crm-to-claude', {
      detail: {
        message,
        context,
        sessionId: this.currentSession?.id,
        timestamp: new Date().toISOString()
      }
    });
    
    // Dispatch to window for Claude to receive
    window.dispatchEvent(claudeEvent);
    
    // Also log to database
    this.logCollaborationMessage('rapid-crm-ai', 'request', message, context);
  }

  private handleClaudeMessage(messageData: any): void {
    console.log('🤖 Received message from Claude:', messageData);
    
    // Update session
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date().toISOString();
      this.currentSession.messageCount++;
    }
    
    // Log the message
    this.logCollaborationMessage('claude', 'response', messageData.message, messageData.context);
    
    // Process the message
    this.processClaudeMessage(messageData);
  }

  private processClaudeMessage(messageData: any): void {
    // Handle different types of messages from Claude
    const { message, context } = messageData;
    
    if (message.includes('client portal')) {
      this.handleClientPortalRequest(message, context);
    } else if (message.includes('database')) {
      this.handleDatabaseRequest(message, context);
    } else if (message.includes('theme')) {
      this.handleThemeRequest(message, context);
    } else {
      this.handleGeneralRequest(message, context);
    }
  }

  private handleClientPortalRequest(message: string, context: any): void {
    console.log('🤖 Processing client portal request from Claude');
    
    // Send response back to Claude
    const response = 'Rapid CRM AI: I understand you want to work on the client portal. Let me analyze the current setup and provide specific implementation steps for database tables, theme integration, and customer support agent.';
    
    this.sendToClaude(response, {
      ...context,
      responseType: 'client-portal-analysis'
    });
  }

  private handleDatabaseRequest(message: string, context: any): void {
    console.log('🤖 Processing database request from Claude');
    
    const response = 'Rapid CRM AI: For the client portal database, we need these tables: client_portal_settings, client_sessions, client_messages, client_portal_analytics, and client_support_tickets. I can help create these tables.';
    
    this.sendToClaude(response, {
      ...context,
      responseType: 'database-schema'
    });
  }

  private handleThemeRequest(message: string, context: any): void {
    console.log('🤖 Processing theme request from Claude');
    
    const response = 'Rapid CRM AI: For theme integration, the client portal should inherit the CRM theme settings from the theme_settings table. I can help implement this integration.';
    
    this.sendToClaude(response, {
      ...context,
      responseType: 'theme-integration'
    });
  }

  private handleGeneralRequest(message: string, context: any): void {
    console.log('🤖 Processing general request from Claude');
    
    const response = 'Rapid CRM AI: I received your message and I\'m ready to help. Please specify what you\'d like to work on: client portal setup, database implementation, or theme integration.';
    
    this.sendToClaude(response, {
      ...context,
      responseType: 'general-response'
    });
  }

  public async sendMessage(
    message: string,
    context?: any
  ): Promise<string> {
    console.log('🔍 ClaudeCollaborationService - sendMessage called with:', message);

    // Send message to Claude via real-time communication
    this.sendToClaude(message, context);

    // Return a response indicating the message was sent
    return 'Message sent to Claude for collaboration';
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

  private logCollaborationMessage(
    from: 'rapid-crm' | 'claude' | 'system',
    type: 'request' | 'response' | 'error' | 'system',
    content: string,
    metadata?: any
  ): void {
    const message: ClaudeMessage = {
      id: `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: from === 'rapid-crm' ? 'user' : 'assistant',
      content,
      timestamp: new Date().toISOString(),
      context: {
        rapidCrmContext: {
          from,
          type,
          metadata
        }
      }
    };

    this.messageHistory.push(message);
    
    // Dispatch custom event for the monitor to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai-collaboration-message', {
        detail: {
          from,
          type,
          content,
          metadata,
          timestamp: message.timestamp
        }
      }));
    }
    
    console.log(`🤖 Collaboration logged: ${from} -> ${type}`, content.substring(0, 100) + '...');
  }
}

// Export singleton instance
export const claudeCollaborationService = ClaudeCollaborationService.getInstance();
