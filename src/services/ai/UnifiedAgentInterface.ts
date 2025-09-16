/**
 * UNIFIED AGENT INTERFACE
 * Provides a consistent interface for all AI agents to maintain conversation continuity
 * All agents appear as one unified entity to clients
 */

import { conversationMemorySystem, ConversationSession, ConversationMessage, AgentPersonality } from './ConversationMemorySystem';

export interface UnifiedAgentResponse {
  message: string;
  agentId: string;
  agentName: string;
  conversationId: string;
  confidence: number;
  shouldTransfer?: {
    toAgentId: string;
    reason: string;
  };
  context: Record<string, any>;
}

export interface ClientContext {
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  previousInteractions?: any[];
  preferences?: Record<string, any>;
}

export class UnifiedAgentInterface {
  private currentAgentId: string;
  private conversationId?: string;
  private clientContext?: ClientContext;

  constructor(initialAgentId: string = 'customer-service') {
    this.currentAgentId = initialAgentId;
    console.log(`🤖 Unified Agent Interface initialized with ${initialAgentId}`);
  }

  /**
   * Start a conversation with a client
   */
  async startConversation(
    clientId: string,
    clientName?: string,
    clientEmail?: string,
    initialMessage?: string
  ): Promise<UnifiedAgentResponse> {
    try {
      // Start conversation session
      const session = await conversationMemorySystem.startConversation(
        clientId,
        clientName,
        clientEmail,
        this.currentAgentId
      );

      this.conversationId = session.id;
      this.clientContext = { clientId, clientName, clientEmail };

      // Get agent personality
      const agentPersonality = conversationMemorySystem.getAgentPersonality(this.currentAgentId);
      if (!agentPersonality) {
        throw new Error(`Agent ${this.currentAgentId} not found`);
      }

      // Generate initial response
      const greeting = this.generateGreeting(agentPersonality, clientName);
      
      // Add greeting to conversation
      await conversationMemorySystem.addMessage(
        this.conversationId,
        this.currentAgentId,
        greeting,
        'agent'
      );

      // If there's an initial message, process it
      if (initialMessage) {
        return await this.processMessage(initialMessage);
      }

      return {
        message: greeting,
        agentId: this.currentAgentId,
        agentName: agentPersonality.name,
        conversationId: this.conversationId,
        confidence: 0.95,
        context: { sessionId: this.conversationId, isGreeting: true }
      };

    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }

  /**
   * Process a client message and maintain conversation continuity
   */
  async processMessage(clientMessage: string): Promise<UnifiedAgentResponse> {
    if (!this.conversationId) {
      throw new Error('No active conversation. Call startConversation first.');
    }

    try {
      // Add client message to conversation
      await conversationMemorySystem.addMessage(
        this.conversationId,
        'client',
        clientMessage,
        'user'
      );

      // Get conversation history for context
      const history = await conversationMemorySystem.getConversationHistory(
        this.conversationId,
        this.currentAgentId,
        10
      );

      // Get current agent personality
      const agentPersonality = conversationMemorySystem.getAgentPersonality(this.currentAgentId);
      if (!agentPersonality) {
        throw new Error(`Agent ${this.currentAgentId} not found`);
      }

      // Analyze if we need to transfer to another agent
      const transferDecision = await this.analyzeTransferNeed(clientMessage, history, agentPersonality);
      
      if (transferDecision.shouldTransfer) {
        return await this.transferToAgent(transferDecision.toAgentId, transferDecision.reason);
      }

      // Generate response using current agent
      const response = await this.generateResponse(clientMessage, history, agentPersonality);

      // Add agent response to conversation
      await conversationMemorySystem.addMessage(
        this.conversationId,
        this.currentAgentId,
        response.message,
        'agent',
        response.context
      );

      return {
        ...response,
        conversationId: this.conversationId,
        agentId: this.currentAgentId,
        agentName: agentPersonality.name
      };

    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  /**
   * Generate greeting based on agent personality
   */
  private generateGreeting(agentPersonality: AgentPersonality, clientName?: string): string {
    const name = clientName || 'there';
    
    switch (agentPersonality.role) {
      case 'Onboarding Specialist':
        return `Hello ${name}! I'm ${agentPersonality.name}, your onboarding specialist. I'm here to help you get started with our transportation compliance services. What would you like to know about getting set up?`;
      
      case 'Customer Service Representative':
        return `Hi ${name}! I'm ${agentPersonality.name} from customer service. I can help you with any questions or issues you might have. How can I assist you today?`;
      
      case 'Compliance Specialist':
        return `Good day ${name}. I'm ${agentPersonality.name}, your compliance specialist. I'm here to help ensure your transportation operations meet all regulatory requirements. What compliance questions do you have?`;
      
      default:
        return `Hello ${name}! I'm ${agentPersonality.name}. How can I help you today?`;
    }
  }

  /**
   * Analyze if conversation should be transferred to another agent
   */
  private async analyzeTransferNeed(
    message: string,
    history: ConversationMessage[],
    currentAgent: AgentPersonality
  ): Promise<{ shouldTransfer: boolean; toAgentId?: string; reason?: string }> {
    
    const lowerMessage = message.toLowerCase();
    
    // Check for onboarding-related keywords
    if (lowerMessage.includes('new account') || 
        lowerMessage.includes('getting started') || 
        lowerMessage.includes('onboarding') ||
        lowerMessage.includes('setup') ||
        lowerMessage.includes('first time')) {
      if (currentAgent.agentId !== 'onboarding-agent') {
        return {
          shouldTransfer: true,
          toAgentId: 'onboarding-agent',
          reason: 'new account setup and onboarding'
        };
      }
    }

    // Check for compliance-related keywords
    if (lowerMessage.includes('usdot') || 
        lowerMessage.includes('compliance') || 
        lowerMessage.includes('regulation') ||
        lowerMessage.includes('hours of service') ||
        lowerMessage.includes('hos') ||
        lowerMessage.includes('safety') ||
        lowerMessage.includes('violation')) {
      if (currentAgent.agentId !== 'compliance-agent') {
        return {
          shouldTransfer: true,
          toAgentId: 'compliance-agent',
          reason: 'compliance and regulatory questions'
        };
      }
    }

    // Check for escalation keywords
    if (lowerMessage.includes('manager') || 
        lowerMessage.includes('supervisor') || 
        lowerMessage.includes('escalate') ||
        lowerMessage.includes('complaint') ||
        lowerMessage.includes('unhappy')) {
      return {
        shouldTransfer: true,
        toAgentId: 'customer-service',
        reason: 'escalation or complaint handling'
      };
    }

    return { shouldTransfer: false };
  }

  /**
   * Transfer conversation to another agent
   */
  private async transferToAgent(toAgentId: string, reason: string): Promise<UnifiedAgentResponse> {
    if (!this.conversationId) {
      throw new Error('No active conversation to transfer');
    }

    // Perform the transfer
    await conversationMemorySystem.transferConversation(
      this.conversationId,
      this.currentAgentId,
      toAgentId,
      reason
    );

    // Update current agent
    this.currentAgentId = toAgentId;

    // Get the new agent's personality
    const newAgentPersonality = conversationMemorySystem.getAgentPersonality(toAgentId);
    if (!newAgentPersonality) {
      throw new Error(`New agent ${toAgentId} not found`);
    }

    // Get the handoff message that was added during transfer
    const history = await conversationMemorySystem.getConversationHistory(
      this.conversationId,
      toAgentId,
      1
    );

    const handoffMessage = history[history.length - 1];

    return {
      message: handoffMessage.message,
      agentId: toAgentId,
      agentName: newAgentPersonality.name,
      conversationId: this.conversationId,
      confidence: 0.9,
      context: { 
        transferReason: reason,
        previousAgent: this.currentAgentId,
        isTransfer: true
      }
    };
  }

  /**
   * Generate response using agent's personality and conversation history
   */
  private async generateResponse(
    clientMessage: string,
    history: ConversationMessage[],
    agentPersonality: AgentPersonality
  ): Promise<Omit<UnifiedAgentResponse, 'conversationId' | 'agentId' | 'agentName'>> {
    
    // Build context from conversation history
    const context = this.buildContextFromHistory(history);
    
    // Generate response based on agent's expertise and personality
    let response = '';
    let confidence = 0.8;

    // Use agent's expertise to provide relevant responses
    if (agentPersonality.role === 'Onboarding Specialist') {
      response = this.generateOnboardingResponse(clientMessage, context);
      confidence = 0.9;
    } else if (agentPersonality.role === 'Compliance Specialist') {
      response = this.generateComplianceResponse(clientMessage, context);
      confidence = 0.95;
    } else {
      response = this.generateGeneralResponse(clientMessage, context, agentPersonality);
      confidence = 0.85;
    }

    return {
      message: response,
      confidence,
      context: {
        agentRole: agentPersonality.role,
        expertise: agentPersonality.expertise,
        conversationLength: history.length
      }
    };
  }

  /**
   * Generate onboarding-specific response
   */
  private generateOnboardingResponse(message: string, context: any): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('account') || lowerMessage.includes('sign up')) {
      return "I'd be happy to help you set up your account! We'll need some basic information about your transportation business. Do you have your USDOT number ready?";
    }
    
    if (lowerMessage.includes('training') || lowerMessage.includes('learn')) {
      return "Great question! We provide comprehensive training on our compliance management system. I can schedule a personalized training session for you. When would be a good time?";
    }
    
    if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('fee')) {
      return "Our pricing is based on the size of your fleet and the services you need. Let me connect you with our sales team who can provide a detailed quote. Would you like me to set that up?";
    }
    
    return "I'm here to help you get started with our transportation compliance services. What specific aspect of getting set up would you like to know more about?";
  }

  /**
   * Generate compliance-specific response
   */
  private generateComplianceResponse(message: string, context: any): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hours of service') || lowerMessage.includes('hos')) {
      return "Hours of Service regulations are critical for compliance. The key limits are: 11 hours maximum driving after 10 consecutive hours off duty, 14 hours maximum on-duty time, and a required 30-minute break after 8 hours of driving. Do you have specific HOS questions?";
    }
    
    if (lowerMessage.includes('usdot') || lowerMessage.includes('dot')) {
      return "USDOT compliance involves several key areas: Hours of Service, vehicle maintenance, driver qualifications, and safety management. Which area would you like to focus on?";
    }
    
    if (lowerMessage.includes('violation') || lowerMessage.includes('fine')) {
      return "If you've received a violation, it's important to address it promptly. I can help you understand the violation and guide you through the corrective action process. What type of violation did you receive?";
    }
    
    return "I'm here to help with all your transportation compliance needs. What specific regulatory question do you have?";
  }

  /**
   * Generate general response
   */
  private generateGeneralResponse(message: string, context: any, agentPersonality: AgentPersonality): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('thank')) {
      return `You're very welcome! I'm ${agentPersonality.name}, and I'm here whenever you need assistance. Is there anything else I can help you with today?`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return `I'm ${agentPersonality.name}, and I'm here to help! I can assist with general questions, connect you with specialists, or help resolve any issues. What do you need assistance with?`;
    }
    
    return `I understand you're asking about that. Let me help you with that. Could you provide a bit more detail so I can give you the most accurate assistance?`;
  }

  /**
   * Build context from conversation history
   */
  private buildContextFromHistory(history: ConversationMessage[]): any {
    const userMessages = history.filter(msg => msg.messageType === 'user');
    const agentMessages = history.filter(msg => msg.messageType === 'agent');
    
    return {
      conversationLength: history.length,
      userMessageCount: userMessages.length,
      agentMessageCount: agentMessages.length,
      recentTopics: userMessages.slice(-3).map(msg => msg.message),
      conversationFlow: history.map(msg => ({
        type: msg.messageType,
        agent: msg.agentName,
        timestamp: msg.timestamp
      }))
    };
  }

  /**
   * Get conversation summary
   */
  async getConversationSummary(): Promise<string> {
    if (!this.conversationId) {
      throw new Error('No active conversation');
    }
    
    return await conversationMemorySystem.getConversationSummary(this.conversationId);
  }

  /**
   * Close the conversation
   */
  async closeConversation(closingMessage?: string): Promise<boolean> {
    if (!this.conversationId) {
      return false;
    }
    
    const result = await conversationMemorySystem.closeConversation(
      this.conversationId,
      this.currentAgentId,
      closingMessage
    );
    
    this.conversationId = undefined;
    this.clientContext = undefined;
    
    return result;
  }

  /**
   * Get current conversation ID
   */
  getCurrentConversationId(): string | undefined {
    return this.conversationId;
  }

  /**
   * Get current agent ID
   */
  getCurrentAgentId(): string {
    return this.currentAgentId;
  }
}

// Export factory function
export function createUnifiedAgent(initialAgentId: string = 'customer-service'): UnifiedAgentInterface {
  return new UnifiedAgentInterface(initialAgentId);
}
