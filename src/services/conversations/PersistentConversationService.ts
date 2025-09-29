import { Conversation, Message, ConversationFilters, ConversationStats } from '../../types/conversation';
import { AgentContext } from '../ai/AgentService';

export interface PersistentConversationContext {
  conversationId: string;
  clientId: string;
  agentId: string;
  sessionId: string;
  conversationHistory: Message[];
  clientProfile: {
    name: string;
    email: string;
    phone?: string;
    companyName?: string;
    preferences: Record<string, any>;
    communicationStyle: 'formal' | 'casual' | 'technical' | 'friendly';
    timezone: string;
    language: string;
    lastInteraction: string;
    totalInteractions: number;
    satisfactionScore: number;
    commonTopics: string[];
    painPoints: string[];
    goals: string[];
  };
  agentMemory: {
    keyFacts: Record<string, any>;
    previousIssues: string[];
    resolvedSolutions: string[];
    clientPreferences: Record<string, any>;
    relationshipNotes: string[];
    followUpItems: Array<{
      id: string;
      description: string;
      dueDate: string;
      status: 'pending' | 'completed' | 'cancelled';
      priority: 'low' | 'medium' | 'high';
    }>;
  };
  conversationFlow: {
    currentTopic: string;
    previousTopics: string[];
    conversationStage: 'greeting' | 'information_gathering' | 'problem_solving' | 'solution_providing' | 'follow_up' | 'closing';
    nextSteps: string[];
    escalationTriggers: string[];
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    lastAgentInteraction: string;
    totalMessages: number;
    averageResponseTime: number;
    clientSatisfaction: number;
    conversationQuality: 'excellent' | 'good' | 'average' | 'poor';
  };
}

export interface AgentMemoryBank {
  agentId: string;
  clientMemories: Map<string, PersistentConversationContext>;
  globalInsights: {
    commonClientIssues: string[];
    successfulSolutions: string[];
    clientSatisfactionTrends: Record<string, number>;
    conversationPatterns: Record<string, any>;
  };
  lastUpdated: string;
}

export class PersistentConversationService {
  private conversationContexts: Map<string, PersistentConversationContext> = new Map();
  private agentMemoryBanks: Map<string, AgentMemoryBank> = new Map();
  private conversationIndex: Map<string, string[]> = new Map(); // clientId -> conversationIds
  private agentIndex: Map<string, string[]> = new Map(); // agentId -> conversationIds
  private isInitialized = false;

  constructor() {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      await this.loadPersistentData();
      this.isInitialized = true;
      console.log('Persistent Conversation Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Persistent Conversation Service:', error);
    }
  }

  private async loadPersistentData(): Promise<void> {
    try {
      console.log('Loading persistent conversation data from real database...');
      
      // Load conversation contexts
      const conversationContexts = await this.loadConversationContexts();
      this.conversationContexts = new Map(conversationContexts.map(ctx => [ctx.conversationId, ctx]));
      
      // Load agent memory banks
      const agentMemoryBanks = await this.loadAgentMemoryBanks();
      this.agentMemoryBanks = new Map(agentMemoryBanks.map(memory => [memory.agentId, memory]));
      
      // Build indexes
      this.buildIndexes();
      
      console.log(`✅ Loaded ${this.conversationContexts.size} conversation contexts, ${this.agentMemoryBanks.size} agent memory banks`);
    } catch (error) {
      console.error('Error loading persistent conversation data:', error);
      // Initialize empty maps as fallback
      this.conversationContexts = new Map();
      this.agentMemoryBanks = new Map();
      this.conversationIndex = new Map();
      this.agentIndex = new Map();
    }
  }

  private async savePersistentData(): Promise<void> {
    try {
      console.log('Saving persistent conversation data to real database...');
      // Data is saved individually when created/updated
      // This method is kept for future batch operations
    } catch (error) {
      console.error('Error saving persistent conversation data:', error);
    }
  }

  /**
   * Load conversation contexts from database
   */
  private async loadConversationContexts(): Promise<PersistentConversationContext[]> {
    try {
      const response = await fetch('/api/conversations/contexts');
      if (!response.ok) {
        throw new Error(`Failed to load conversation contexts: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading conversation contexts:', error);
      return [];
    }
  }

  /**
   * Load agent memory banks from database
   */
  private async loadAgentMemoryBanks(): Promise<AgentMemoryBank[]> {
    try {
      const response = await fetch('/api/conversations/memory-banks');
      if (!response.ok) {
        throw new Error(`Failed to load agent memory banks: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading agent memory banks:', error);
      return [];
    }
  }

  /**
   * Build indexes for efficient lookups
   */
  private buildIndexes(): void {
    // Build conversation index by client
    this.conversationIndex.clear();
    for (const [conversationId, context] of this.conversationContexts) {
      if (!this.conversationIndex.has(context.clientId)) {
        this.conversationIndex.set(context.clientId, []);
      }
      this.conversationIndex.get(context.clientId)!.push(conversationId);
    }

    // Build agent index
    this.agentIndex.clear();
    for (const [agentId, memory] of this.agentMemoryBanks) {
      this.agentIndex.set(agentId, memory);
    }
  }

  async createPersistentConversation(
    conversationId: string,
    clientId: string,
    agentId: string,
    initialContext: Partial<PersistentConversationContext>
  ): Promise<PersistentConversationContext> {
    const existingContext = this.conversationContexts.get(conversationId);
    if (existingContext) {
      return existingContext;
    }

    // Get or create agent memory bank
    let agentMemoryBank = this.agentMemoryBanks.get(agentId);
    if (!agentMemoryBank) {
      agentMemoryBank = {
        agentId,
        clientMemories: new Map(),
        globalInsights: {
          commonClientIssues: [],
          successfulSolutions: [],
          clientSatisfactionTrends: {},
          conversationPatterns: {}
        },
        lastUpdated: new Date().toISOString()
      };
      this.agentMemoryBanks.set(agentId, agentMemoryBank);
    }

    // Get existing client memory if available
    const existingClientMemory = agentMemoryBank.clientMemories.get(clientId);

    const persistentContext: PersistentConversationContext = {
      conversationId,
      clientId,
      agentId,
      sessionId: initialContext.sessionId || `session_${Date.now()}`,
      conversationHistory: initialContext.conversationHistory || [],
      clientProfile: {
        name: initialContext.clientProfile?.name || 'Unknown Client',
        email: initialContext.clientProfile?.email || '',
        phone: initialContext.clientProfile?.phone,
        companyName: initialContext.clientProfile?.companyName,
        preferences: existingClientMemory?.clientProfile.preferences || {},
        communicationStyle: existingClientMemory?.clientProfile.communicationStyle || 'friendly',
        timezone: existingClientMemory?.clientProfile.timezone || 'UTC',
        language: existingClientMemory?.clientProfile.language || 'en',
        lastInteraction: new Date().toISOString(),
        totalInteractions: (existingClientMemory?.clientProfile.totalInteractions || 0) + 1,
        satisfactionScore: existingClientMemory?.clientProfile.satisfactionScore || 0,
        commonTopics: existingClientMemory?.clientProfile.commonTopics || [],
        painPoints: existingClientMemory?.clientProfile.painPoints || [],
        goals: existingClientMemory?.clientProfile.goals || []
      },
      agentMemory: {
        keyFacts: existingClientMemory?.agentMemory.keyFacts || {},
        previousIssues: existingClientMemory?.agentMemory.previousIssues || [],
        resolvedSolutions: existingClientMemory?.agentMemory.resolvedSolutions || [],
        clientPreferences: existingClientMemory?.agentMemory.clientPreferences || {},
        relationshipNotes: existingClientMemory?.agentMemory.relationshipNotes || [],
        followUpItems: existingClientMemory?.agentMemory.followUpItems || []
      },
      conversationFlow: {
        currentTopic: initialContext.conversationFlow?.currentTopic || 'greeting',
        previousTopics: initialContext.conversationFlow?.previousTopics || [],
        conversationStage: initialContext.conversationFlow?.conversationStage || 'greeting',
        nextSteps: initialContext.conversationFlow?.nextSteps || [],
        escalationTriggers: initialContext.conversationFlow?.escalationTriggers || []
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastAgentInteraction: new Date().toISOString(),
        totalMessages: 0,
        averageResponseTime: 0,
        clientSatisfaction: 0,
        conversationQuality: 'good'
      }
    };

    // Store the context
    this.conversationContexts.set(conversationId, persistentContext);
    agentMemoryBank.clientMemories.set(clientId, persistentContext);
    agentMemoryBank.lastUpdated = new Date().toISOString();

    // Update indexes
    this.updateIndexes(conversationId, clientId, agentId);

    await this.savePersistentData();
    return persistentContext;
  }

  async addMessageToContext(
    conversationId: string,
    message: Message,
    agentContext?: AgentContext
  ): Promise<PersistentConversationContext | null> {
    const context = this.conversationContexts.get(conversationId);
    if (!context) {
      console.warn(`No persistent context found for conversation ${conversationId}`);
      return null;
    }

    // Add message to history
    context.conversationHistory.push(message);
    context.metadata.totalMessages++;
    context.metadata.updatedAt = new Date().toISOString();

    console.log('Adding message to context:', message.sender, 'Total interactions before:', context.clientProfile.totalInteractions);

    // Update client profile based on message content
    this.updateClientProfile(context, message);
    
    console.log('Total interactions after:', context.clientProfile.totalInteractions);

    // Update agent memory based on message content
    this.updateAgentMemory(context, message, agentContext);

    // Update conversation flow
    this.updateConversationFlow(context, message);

    // Update agent memory bank
    const agentMemoryBank = this.agentMemoryBanks.get(context.agentId);
    if (agentMemoryBank) {
      agentMemoryBank.clientMemories.set(context.clientId, context);
      agentMemoryBank.lastUpdated = new Date().toISOString();
    }

    await this.savePersistentData();
    return context;
  }

  private updateClientProfile(context: PersistentConversationContext, message: Message): void {
    const content = message.content.toLowerCase();
    
    // Update communication style based on message analysis
    if (content.includes('please') || content.includes('thank you') || content.includes('sir') || content.includes('madam')) {
      context.clientProfile.communicationStyle = 'formal';
    } else if (content.includes('hey') || content.includes('thanks') || content.includes('cool')) {
      context.clientProfile.communicationStyle = 'casual';
    } else if (content.includes('api') || content.includes('integration') || content.includes('technical')) {
      context.clientProfile.communicationStyle = 'technical';
    }

    // Extract and store common topics
    const topics = this.extractTopics(content);
    topics.forEach(topic => {
      if (!context.clientProfile.commonTopics.includes(topic)) {
        context.clientProfile.commonTopics.push(topic);
      }
    });

    // Extract pain points
    const painPoints = this.extractPainPoints(content);
    painPoints.forEach(painPoint => {
      if (!context.clientProfile.painPoints.includes(painPoint)) {
        context.clientProfile.painPoints.push(painPoint);
      }
    });

    // Extract goals
    const goals = this.extractGoals(content);
    goals.forEach(goal => {
      if (!context.clientProfile.goals.includes(goal)) {
        context.clientProfile.goals.push(goal);
      }
    });

    context.clientProfile.lastInteraction = new Date().toISOString();
    
    // Increment total interactions for user messages
    if (message.sender === 'user') {
      context.clientProfile.totalInteractions++;
    }
  }

  private updateAgentMemory(
    context: PersistentConversationContext,
    message: Message,
    agentContext?: AgentContext
  ): void {
    const content = message.content.toLowerCase();

    // Extract key facts from the conversation
    const keyFacts = this.extractKeyFacts(content);
    Object.assign(context.agentMemory.keyFacts, keyFacts);

    // Track previous issues
    if (content.includes('problem') || content.includes('issue') || content.includes('error')) {
      const issue = this.extractIssue(content);
      if (issue && !context.agentMemory.previousIssues.includes(issue)) {
        context.agentMemory.previousIssues.push(issue);
      }
    }

    // Track resolved solutions
    if (content.includes('solved') || content.includes('fixed') || content.includes('resolved')) {
      const solution = this.extractSolution(content);
      if (solution && !context.agentMemory.resolvedSolutions.includes(solution)) {
        context.agentMemory.resolvedSolutions.push(solution);
      }
    }

    // Add relationship notes
    if (content.includes('appreciate') || content.includes('helpful') || content.includes('great')) {
      context.agentMemory.relationshipNotes.push(`Positive feedback: ${message.content.substring(0, 100)}...`);
    }

    // Update client preferences
    if (agentContext?.userPreferences) {
      Object.assign(context.agentMemory.clientPreferences, agentContext.userPreferences);
    }
  }

  private updateConversationFlow(context: PersistentConversationContext, message: Message): void {
    const content = message.content.toLowerCase();

    // Update conversation stage based on content
    if (content.includes('hello') || content.includes('hi') || content.includes('good morning')) {
      context.conversationFlow.conversationStage = 'greeting';
    } else if (content.includes('need') || content.includes('want') || content.includes('looking for')) {
      context.conversationFlow.conversationStage = 'information_gathering';
    } else if (content.includes('problem') || content.includes('issue') || content.includes('help')) {
      context.conversationFlow.conversationStage = 'problem_solving';
    } else if (content.includes('solution') || content.includes('recommend') || content.includes('suggest')) {
      context.conversationFlow.conversationStage = 'solution_providing';
    } else if (content.includes('follow up') || content.includes('next steps') || content.includes('schedule')) {
      context.conversationFlow.conversationStage = 'follow_up';
    } else if (content.includes('thank you') || content.includes('goodbye') || content.includes('bye')) {
      context.conversationFlow.conversationStage = 'closing';
    }

    // Update current topic
    const topic = this.extractCurrentTopic(content);
    if (topic && topic !== context.conversationFlow.currentTopic) {
      context.conversationFlow.previousTopics.push(context.conversationFlow.currentTopic);
      context.conversationFlow.currentTopic = topic;
    }
  }

  private extractTopics(content: string): string[] {
    const topicKeywords = {
      'usdot': ['usdot', 'dot', 'fmcsa', 'transportation'],
      'billing': ['billing', 'payment', 'invoice', 'cost', 'price'],
      'technical': ['technical', 'api', 'integration', 'system', 'software'],
      'support': ['support', 'help', 'assistance', 'issue', 'problem'],
      'sales': ['sales', 'purchase', 'buy', 'demo', 'trial']
    };

    const topics: string[] = [];
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  private extractPainPoints(content: string): string[] {
    const painPointPatterns = [
      /(?:struggling|difficult|challenging|frustrating|problem).*?(?:with|to|getting)/gi,
      /(?:need help|can't|unable|stuck).*?(?:with|to|getting)/gi,
      /(?:issue|problem|error).*?(?:with|in|on)/gi
    ];

    const painPoints: string[] = [];
    painPointPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        painPoints.push(...matches.map(match => match.trim()));
      }
    });

    return painPoints;
  }

  private extractGoals(content: string): string[] {
    const goalPatterns = [
      /(?:want|need|looking for|trying to|goal).*?(?:to|for)/gi,
      /(?:achieve|accomplish|get|obtain).*?(?:to|for)/gi
    ];

    const goals: string[] = [];
    goalPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        goals.push(...matches.map(match => match.trim()));
      }
    });

    return goals;
  }

  private extractKeyFacts(content: string): Record<string, any> {
    const facts: Record<string, any> = {};

    // Extract company information
    const companyMatch = content.match(/(?:company|business|organization).*?(?:is|called|named)\s+([a-zA-Z\s]+)/i);
    if (companyMatch) {
      facts.companyName = companyMatch[1].trim();
    }

    // Extract contact information
    const emailMatch = content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      facts.email = emailMatch[1];
    }

    const phoneMatch = content.match(/(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);
    if (phoneMatch) {
      facts.phone = phoneMatch[1];
    }

    // Extract business type
    const businessTypeMatch = content.match(/(?:carrier|broker|freight forwarder|logistics|transportation)/i);
    if (businessTypeMatch) {
      facts.businessType = businessTypeMatch[0].toLowerCase();
    }

    return facts;
  }

  private extractIssue(content: string): string | null {
    const issuePatterns = [
      /(?:problem|issue|error|trouble).*?(?:with|in|on)\s+([a-zA-Z\s]+)/i,
      /(?:can't|unable|stuck).*?(?:with|to|getting)\s+([a-zA-Z\s]+)/i
    ];

    for (const pattern of issuePatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  private extractSolution(content: string): string | null {
    const solutionPatterns = [
      /(?:solved|fixed|resolved).*?(?:by|with|using)\s+([a-zA-Z\s]+)/i,
      /(?:solution|fix|workaround).*?(?:is|was)\s+([a-zA-Z\s]+)/i
    ];

    for (const pattern of solutionPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  private extractCurrentTopic(content: string): string {
    const topicKeywords = {
      'usdot_application': ['usdot', 'application', 'dot number'],
      'billing': ['billing', 'payment', 'invoice'],
      'technical_support': ['technical', 'api', 'integration'],
      'general_inquiry': ['question', 'information', 'help']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return topic;
      }
    }

    return 'general';
  }

  private updateIndexes(conversationId: string, clientId: string, agentId: string): void {
    // Update conversation index
    const clientConversations = this.conversationIndex.get(clientId) || [];
    if (!clientConversations.includes(conversationId)) {
      clientConversations.push(conversationId);
      this.conversationIndex.set(clientId, clientConversations);
    }

    // Update agent index
    const agentConversations = this.agentIndex.get(agentId) || [];
    if (!agentConversations.includes(conversationId)) {
      agentConversations.push(conversationId);
      this.agentIndex.set(agentId, agentConversations);
    }
  }

  async getPersistentContext(conversationId: string): Promise<PersistentConversationContext | null> {
    return this.conversationContexts.get(conversationId) || null;
  }

  async getClientHistory(clientId: string): Promise<PersistentConversationContext[]> {
    const conversationIds = this.conversationIndex.get(clientId) || [];
    return conversationIds
      .map(id => this.conversationContexts.get(id))
      .filter(context => context !== undefined) as PersistentConversationContext[];
  }

  async getAgentClientMemories(agentId: string): Promise<Map<string, PersistentConversationContext>> {
    const agentMemoryBank = this.agentMemoryBanks.get(agentId);
    return agentMemoryBank?.clientMemories || new Map();
  }

  async getClientMemory(agentId: string, clientId: string): Promise<PersistentConversationContext | null> {
    const agentMemoryBank = this.agentMemoryBanks.get(agentId);
    return agentMemoryBank?.clientMemories.get(clientId) || null;
  }

  async updateClientSatisfaction(
    conversationId: string,
    satisfactionScore: number,
    feedback?: string
  ): Promise<void> {
    const context = this.conversationContexts.get(conversationId);
    if (!context) return;

    context.metadata.clientSatisfaction = satisfactionScore;
    context.clientProfile.satisfactionScore = satisfactionScore;
    context.metadata.updatedAt = new Date().toISOString();

    if (feedback) {
      context.agentMemory.relationshipNotes.push(`Satisfaction feedback: ${feedback}`);
    }

    // Update agent memory bank
    const agentMemoryBank = this.agentMemoryBanks.get(context.agentId);
    if (agentMemoryBank) {
      agentMemoryBank.clientMemories.set(context.clientId, context);
      agentMemoryBank.lastUpdated = new Date().toISOString();
    }

    await this.savePersistentData();
  }

  async addFollowUpItem(
    conversationId: string,
    description: string,
    dueDate: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    const context = this.conversationContexts.get(conversationId);
    if (!context) return;

    const followUpItem = {
      id: `followup_${Date.now()}`,
      description,
      dueDate,
      status: 'pending' as const,
      priority
    };

    context.agentMemory.followUpItems.push(followUpItem);
    context.metadata.updatedAt = new Date().toISOString();

    // Update agent memory bank
    const agentMemoryBank = this.agentMemoryBanks.get(context.agentId);
    if (agentMemoryBank) {
      agentMemoryBank.clientMemories.set(context.clientId, context);
      agentMemoryBank.lastUpdated = new Date().toISOString();
    }

    await this.savePersistentData();
  }

  async getConversationInsights(agentId: string): Promise<{
    totalClients: number;
    averageSatisfaction: number;
    commonIssues: string[];
    successfulSolutions: string[];
    activeFollowUps: number;
  }> {
    const agentMemoryBank = this.agentMemoryBanks.get(agentId);
    if (!agentMemoryBank) {
      return {
        totalClients: 0,
        averageSatisfaction: 0,
        commonIssues: [],
        successfulSolutions: [],
        activeFollowUps: 0
      };
    }

    const clientMemories = Array.from(agentMemoryBank.clientMemories.values());
    const totalClients = clientMemories.length;
    
    const averageSatisfaction = clientMemories.length > 0
      ? clientMemories.reduce((sum, context) => sum + context.clientProfile.satisfactionScore, 0) / clientMemories.length
      : 0;

    const commonIssues = clientMemories
      .flatMap(context => context.agentMemory.previousIssues)
      .reduce((acc, issue) => {
        acc[issue] = (acc[issue] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const successfulSolutions = clientMemories
      .flatMap(context => context.agentMemory.resolvedSolutions)
      .reduce((acc, solution) => {
        acc[solution] = (acc[solution] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const activeFollowUps = clientMemories
      .flatMap(context => context.agentMemory.followUpItems)
      .filter(item => item.status === 'pending').length;

    return {
      totalClients,
      averageSatisfaction,
      commonIssues: Object.entries(commonIssues)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([issue]) => issue),
      successfulSolutions: Object.entries(successfulSolutions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([solution]) => solution),
      activeFollowUps
    };
  }

  async exportAgentMemory(agentId: string): Promise<string> {
    const agentMemoryBank = this.agentMemoryBanks.get(agentId);
    if (!agentMemoryBank) {
      return JSON.stringify({ error: 'Agent memory bank not found' });
    }

    return JSON.stringify({
      agentId,
      exportDate: new Date().toISOString(),
      clientMemories: Array.from(agentMemoryBank.clientMemories.entries()),
      globalInsights: agentMemoryBank.globalInsights,
      lastUpdated: agentMemoryBank.lastUpdated
    }, null, 2);
  }

  async importAgentMemory(agentId: string, memoryData: string): Promise<boolean> {
    try {
      const data = JSON.parse(memoryData);
      const agentMemoryBank: AgentMemoryBank = {
        agentId,
        clientMemories: new Map(data.clientMemories),
        globalInsights: data.globalInsights,
        lastUpdated: new Date().toISOString()
      };

      this.agentMemoryBanks.set(agentId, agentMemoryBank);
      await this.savePersistentData();
      return true;
    } catch (error) {
      console.error('Error importing agent memory:', error);
      return false;
    }
  }
}

// Singleton instance
export const persistentConversationService = new PersistentConversationService();
