/**
 * CONVERSATION MEMORY SYSTEM
 * Enables seamless conversation continuity across all AI agents
 * Each agent can access and contribute to shared conversation history
 */

export interface ConversationMessage {
  id: string;
  conversationId: string;
  agentId: string;
  agentName: string;
  message: string;
  timestamp: string;
  messageType: 'user' | 'agent' | 'system';
  context?: Record<string, any>;
  metadata?: {
    confidence?: number;
    intent?: string;
    entities?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
}

export interface ConversationSession {
  id: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  status: 'active' | 'paused' | 'completed' | 'transferred';
  currentAgentId?: string;
  assignedAgents: string[];
  createdAt: string;
  lastActivity: string;
  summary?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  context: {
    issueType?: string;
    department?: string;
    escalationLevel?: number;
    customFields?: Record<string, any>;
  };
}

export interface AgentPersonality {
  agentId: string;
  name: string;
  role: string;
  personality: {
    tone: 'professional' | 'friendly' | 'casual' | 'authoritative';
    expertise: string[];
    communicationStyle: string;
    responseLength: 'brief' | 'detailed' | 'comprehensive';
  };
  capabilities: string[];
  limitations: string[];
}

export class ConversationMemorySystem {
  private conversations: Map<string, ConversationSession> = new Map();
  private messages: Map<string, ConversationMessage[]> = new Map();
  private agentPersonalities: Map<string, AgentPersonality> = new Map();
  private conversationSummaries: Map<string, string> = new Map();

  constructor() {
    this.initializeDefaultAgents();
    console.log('🧠 Conversation Memory System initialized');
  }

  /**
   * Initialize default agent personalities
   */
  private initializeDefaultAgents(): void {
    // Onboarding Agent
    this.agentPersonalities.set('onboarding-agent', {
      agentId: 'onboarding-agent',
      name: 'Alex',
      role: 'Onboarding Specialist',
      personality: {
        tone: 'friendly',
        expertise: ['new client onboarding', 'account setup', 'initial training'],
        communicationStyle: 'Welcoming and patient, focused on making new clients feel comfortable',
        responseLength: 'detailed'
      },
      capabilities: ['account setup', 'training scheduling', 'documentation assistance'],
      limitations: ['cannot process payments', 'cannot access billing information']
    });

    // Customer Service Agent
    this.agentPersonalities.set('customer-service', {
      agentId: 'customer-service',
      name: 'Alex',
      role: 'Customer Service Representative',
      personality: {
        tone: 'professional',
        expertise: ['general support', 'troubleshooting', 'account management'],
        communicationStyle: 'Efficient and helpful, focused on quick problem resolution',
        responseLength: 'detailed'
      },
      capabilities: ['general support', 'troubleshooting', 'account assistance'],
      limitations: ['cannot access sensitive financial data', 'cannot make system changes']
    });

    // Compliance Agent
    this.agentPersonalities.set('compliance-agent', {
      agentId: 'compliance-agent',
      name: 'Jennifer',
      role: 'Compliance Specialist',
      personality: {
        tone: 'authoritative',
        expertise: ['USDOT regulations', 'compliance requirements', 'safety protocols'],
        communicationStyle: 'Precise and regulatory-focused, ensuring accuracy in compliance matters',
        responseLength: 'comprehensive'
      },
      capabilities: ['regulatory guidance', 'compliance checking', 'documentation review'],
      limitations: ['cannot provide legal advice', 'cannot override regulations']
    });
  }

  /**
   * Start a new conversation session
   */
  async startConversation(
    clientId: string,
    clientName?: string,
    clientEmail?: string,
    initialAgentId: string = 'customer-service'
  ): Promise<ConversationSession> {
    const conversationId = this.generateConversationId();
    const now = new Date().toISOString();

    const session: ConversationSession = {
      id: conversationId,
      clientId,
      clientName,
      clientEmail,
      status: 'active',
      currentAgentId: initialAgentId,
      assignedAgents: [initialAgentId],
      createdAt: now,
      lastActivity: now,
      tags: [],
      priority: 'medium',
      context: {
        issueType: 'general',
        department: 'customer-service',
        escalationLevel: 0
      }
    };

    this.conversations.set(conversationId, session);
    this.messages.set(conversationId, []);

    console.log(`💬 Started conversation ${conversationId} with client ${clientName || clientId}`);
    return session;
  }

  /**
   * Add a message to the conversation
   */
  async addMessage(
    conversationId: string,
    agentId: string,
    message: string,
    messageType: 'user' | 'agent' | 'system' = 'agent',
    context?: Record<string, any>
  ): Promise<ConversationMessage> {
    const session = this.conversations.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const agentPersonality = this.agentPersonalities.get(agentId);
    const agentName = agentPersonality?.name || agentId;

    const conversationMessage: ConversationMessage = {
      id: this.generateMessageId(),
      conversationId,
      agentId,
      agentName,
      message,
      timestamp: new Date().toISOString(),
      messageType,
      context,
      metadata: {
        confidence: 0.9,
        intent: this.extractIntent(message),
        entities: this.extractEntities(message),
        sentiment: this.analyzeSentiment(message)
      }
    };

    const messages = this.messages.get(conversationId) || [];
    messages.push(conversationMessage);
    this.messages.set(conversationId, messages);

    // Update session activity
    session.lastActivity = conversationMessage.timestamp;
    session.currentAgentId = agentId;

    console.log(`💬 Added message from ${agentName} to conversation ${conversationId}`);
    return conversationMessage;
  }

  /**
   * Get conversation history for an agent
   */
  async getConversationHistory(
    conversationId: string,
    agentId: string,
    limit: number = 10
  ): Promise<ConversationMessage[]> {
    const messages = this.messages.get(conversationId) || [];
    const recentMessages = messages.slice(-limit);

    // Transform messages to maintain agent personality consistency
    return recentMessages.map(msg => this.transformMessageForAgent(msg, agentId));
  }

  /**
   * Transform message to maintain consistent agent personality
   */
  private transformMessageForAgent(message: ConversationMessage, targetAgentId: string): ConversationMessage {
    const targetAgent = this.agentPersonalities.get(targetAgentId);
    const originalAgent = this.agentPersonalities.get(message.agentId);

    if (!targetAgent || !originalAgent || message.agentId === targetAgentId) {
      return message;
    }

    // If the message is from a different agent, transform it to appear as if it came from the current agent
    return {
      ...message,
      agentId: targetAgentId,
      agentName: targetAgent.name,
      message: this.adaptMessageTone(message.message, originalAgent, targetAgent)
    };
  }

  /**
   * Adapt message tone to match current agent's personality
   */
  private adaptMessageTone(
    message: string,
    originalAgent: AgentPersonality,
    targetAgent: AgentPersonality
  ): string {
    // Simple tone adaptation - in a real system, this would be more sophisticated
    if (originalAgent.personality.tone === targetAgent.personality.tone) {
      return message;
    }

    // Add agent signature to maintain continuity
    return `${message}\n\n*[Note: This information was provided by our ${originalAgent.role} ${originalAgent.name}]*`;
  }

  /**
   * Transfer conversation to another agent
   */
  async transferConversation(
    conversationId: string,
    fromAgentId: string,
    toAgentId: string,
    transferReason?: string
  ): Promise<boolean> {
    const session = this.conversations.get(conversationId);
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const fromAgent = this.agentPersonalities.get(fromAgentId);
    const toAgent = this.agentPersonalities.get(toAgentId);

    if (!fromAgent || !toAgent) {
      throw new Error('Invalid agent IDs');
    }

    // Add transfer message
    const transferMessage = transferReason 
      ? `I'm transferring you to our ${toAgent.role} ${toAgent.name} who can better assist with: ${transferReason}`
      : `I'm connecting you with our ${toAgent.role} ${toAgent.name} who specializes in this area.`;

    await this.addMessage(conversationId, fromAgentId, transferMessage, 'system', {
      transferTo: toAgentId,
      transferReason
    });

    // Update session
    session.currentAgentId = toAgentId;
    if (!session.assignedAgents.includes(toAgentId)) {
      session.assignedAgents.push(toAgentId);
    }

    // Add handoff message from new agent
    const handoffMessage = `Hello! I'm ${toAgent.name}, your ${toAgent.role}. I can see our conversation history and I'm here to help you with ${transferReason || 'your inquiry'}. How can I assist you today?`;

    await this.addMessage(conversationId, toAgentId, handoffMessage, 'agent', {
      handoffFrom: fromAgentId,
      transferReason
    });

    console.log(`🔄 Transferred conversation ${conversationId} from ${fromAgent.name} to ${toAgent.name}`);
    return true;
  }

  /**
   * Get conversation summary for quick context
   */
  async getConversationSummary(conversationId: string): Promise<string> {
    const session = this.conversations.get(conversationId);
    const messages = this.messages.get(conversationId) || [];

    if (!session) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Generate summary from recent messages
    const recentMessages = messages.slice(-5);
    const summary = this.generateSummary(session, recentMessages);
    
    this.conversationSummaries.set(conversationId, summary);
    return summary;
  }

  /**
   * Generate conversation summary
   */
  private generateSummary(session: ConversationSession, messages: ConversationMessage[]): string {
    const clientName = session.clientName || 'Client';
    const issueType = session.context.issueType || 'general inquiry';
    const agents = session.assignedAgents.map(agentId => {
      const agent = this.agentPersonalities.get(agentId);
      return agent?.name || agentId;
    }).join(', ');

    const recentTopics = messages
      .filter(msg => msg.messageType === 'user')
      .slice(-3)
      .map(msg => msg.message.substring(0, 50) + '...')
      .join('; ');

    return `Conversation with ${clientName} about ${issueType}. Involved agents: ${agents}. Recent topics: ${recentTopics}`;
  }

  /**
   * Get agent personality for consistent responses
   */
  getAgentPersonality(agentId: string): AgentPersonality | null {
    return this.agentPersonalities.get(agentId) || null;
  }

  /**
   * Update agent personality
   */
  updateAgentPersonality(agentId: string, personality: Partial<AgentPersonality>): void {
    const existing = this.agentPersonalities.get(agentId);
    if (existing) {
      this.agentPersonalities.set(agentId, { ...existing, ...personality });
    }
  }

  /**
   * Get all active conversations
   */
  getActiveConversations(): ConversationSession[] {
    return Array.from(this.conversations.values())
      .filter(session => session.status === 'active')
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }

  /**
   * Get conversation by ID
   */
  getConversation(conversationId: string): ConversationSession | null {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Close conversation
   */
  async closeConversation(conversationId: string, agentId: string, closingMessage?: string): Promise<boolean> {
    const session = this.conversations.get(conversationId);
    if (!session) {
      return false;
    }

    if (closingMessage) {
      await this.addMessage(conversationId, agentId, closingMessage, 'agent');
    }

    session.status = 'completed';
    session.lastActivity = new Date().toISOString();

    console.log(`✅ Closed conversation ${conversationId}`);
    return true;
  }

  // Utility methods
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractIntent(message: string): string {
    // Simple intent extraction - in a real system, this would use NLP
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) return 'support';
    if (lowerMessage.includes('complaint') || lowerMessage.includes('issue')) return 'complaint';
    if (lowerMessage.includes('question') || lowerMessage.includes('?')) return 'question';
    if (lowerMessage.includes('thank')) return 'gratitude';
    return 'general';
  }

  private extractEntities(message: string): string[] {
    // Simple entity extraction - in a real system, this would use NLP
    const entities: string[] = [];
    if (message.includes('USDOT')) entities.push('USDOT');
    if (message.includes('compliance')) entities.push('compliance');
    if (message.includes('safety')) entities.push('safety');
    if (message.includes('hours of service') || message.includes('HOS')) entities.push('HOS');
    return entities;
  }

  private analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    // Simple sentiment analysis - in a real system, this would use NLP
    const lowerMessage = message.toLowerCase();
    const positiveWords = ['thank', 'great', 'excellent', 'good', 'happy', 'satisfied'];
    const negativeWords = ['angry', 'frustrated', 'disappointed', 'terrible', 'awful', 'hate'];
    
    if (positiveWords.some(word => lowerMessage.includes(word))) return 'positive';
    if (negativeWords.some(word => lowerMessage.includes(word))) return 'negative';
    return 'neutral';
  }
}

// Export singleton instance
export const conversationMemorySystem = new ConversationMemorySystem();
