import { 
  agentService, 
  knowledgeBaseService, 
  rulesEngineService, 
  aiIntegrationService,
  AgentResponse,
  AgentContext,
  RuleContext,
  KnowledgeSearchResult
} from './index';
import { Agent, AgentConfiguration } from '../../types/schema';

export interface AgentInteraction {
  id: string;
  agentId: string;
  userId?: string;
  sessionId: string;
  input: string;
  output: AgentResponse;
  context: AgentContext;
  timestamp: string;
  satisfaction?: number;
  feedback?: string;
}

export interface AgentAnalytics {
  agentId: string;
  totalInteractions: number;
  averageSatisfaction: number;
  averageResponseTime: number;
  successRate: number;
  topQueries: Array<{
    query: string;
    count: number;
  }>;
  userFeedback: Array<{
    rating: number;
    comment: string;
    timestamp: string;
  }>;
  performanceTrends: Array<{
    date: string;
    interactions: number;
    satisfaction: number;
    responseTime: number;
  }>;
}

export class AIAgentManager {
  private interactions: Map<string, AgentInteraction[]> = new Map();
  private analytics: Map<string, AgentAnalytics> = new Map();
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize all AI services
      await Promise.all([
        this.initializeAnalytics(),
        this.loadInteractionHistory()
      ]);

      this.isInitialized = true;
      console.log('AI Agent Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Agent Manager:', error);
    }
  }

  private async initializeAnalytics(): Promise<void> {
    const agents = await agentService.getAllAgents();
    
    agents.forEach(agent => {
      this.analytics.set(agent.id, {
        agentId: agent.id,
        totalInteractions: 0,
        averageSatisfaction: 0,
        averageResponseTime: 0,
        successRate: 0,
        topQueries: [],
        userFeedback: [],
        performanceTrends: []
      });
    });
  }

  private async loadInteractionHistory(): Promise<void> {
    // In a real implementation, this would load from a database
    // For now, we'll initialize with empty maps
    console.log('Interaction history loaded');
  }

  async processAgentRequest(
    agentId: string,
    message: string,
    context: AgentContext = {}
  ): Promise<AgentResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const sessionId = context.sessionId || `session_${Date.now()}`;

    try {
      // Get agent configuration
      const agent = await agentService.getAgent(agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      // Enhance context with knowledge base search
      const enhancedContext = await this.enhanceContextWithKnowledge(agent, message, context);

      // Evaluate rules before processing
      const ruleContext: RuleContext = {
        ...enhancedContext,
        timestamp: new Date().toISOString()
      };

      const ruleResult = await rulesEngineService.evaluateRules(ruleContext);
      
      // Check if any rules block the request
      if (ruleResult.errors.length > 0) {
        throw new Error(`Rules evaluation failed: ${ruleResult.errors.join(', ')}`);
      }

      // Process the message through the agent
      const response = await agentService.processMessage(agentId, message, enhancedContext);

      // Enhance response with AI integration if configured
      const enhancedResponse = await this.enhanceResponseWithAI(agent, response, enhancedContext);

      // Store interaction
      const interaction: AgentInteraction = {
        id: `interaction_${Date.now()}`,
        agentId,
        userId: context.userId,
        sessionId,
        input: message,
        output: enhancedResponse,
        context: enhancedContext,
        timestamp: new Date().toISOString()
      };

      this.storeInteraction(interaction);
      this.updateAnalytics(interaction);

      return enhancedResponse;

    } catch (error) {
      console.error('Agent request processing failed:', error);
      throw error;
    }
  }

  private async enhanceContextWithKnowledge(
    agent: Agent,
    message: string,
    context: AgentContext
  ): Promise<AgentContext> {
    const enhancedContext = { ...context };

    try {
      // Search relevant knowledge bases
      const knowledgeResults: KnowledgeSearchResult[] = [];
      
      for (const kbId of agent.knowledgeBases) {
        const results = await knowledgeBaseService.searchKnowledgeBase(kbId, message, 3);
        knowledgeResults.push(...results);
      }

      // Add knowledge context
      if (knowledgeResults.length > 0) {
        enhancedContext.knowledgeContext = {
          relevantDocuments: knowledgeResults.map(result => ({
            title: result.document.title,
            content: result.document.content,
            score: result.score,
            highlights: result.highlights
          })),
          totalResults: knowledgeResults.length
        };
      }

      // Add agent capabilities context
      enhancedContext.agentCapabilities = agent.capabilities;
      enhancedContext.agentRules = agent.rules;

    } catch (error) {
      console.error('Failed to enhance context with knowledge:', error);
    }

    return enhancedContext;
  }

  private async enhanceResponseWithAI(
    agent: Agent,
    response: AgentResponse,
    context: AgentContext
  ): Promise<AgentResponse> {
    try {
      // If agent has AI integration configured, enhance the response
      if (agent.configuration.model && agent.configuration.model !== 'local') {
        const provider = await this.getBestProvider(agent.configuration);
        
        if (provider) {
          const aiRequest = {
            model: agent.configuration.model,
            messages: [
              {
                role: 'system' as const,
                content: agent.configuration.systemPrompt || 'You are a helpful AI assistant.'
              },
              {
                role: 'user' as const,
                content: `Please enhance this response to be more helpful and accurate: ${response.message}`
              }
            ],
            temperature: agent.configuration.temperature,
            maxTokens: agent.configuration.maxTokens
          };

          const aiResponse = await aiIntegrationService.generateResponse(
            provider.id,
            aiRequest,
            agent.configuration
          );

          if (aiResponse.choices.length > 0) {
            response.message = aiResponse.choices[0].message.content;
            response.confidence = Math.min(response.confidence + 0.1, 1.0);
            response.metadata = {
              ...response.metadata,
              enhancedByAI: true,
              aiProvider: provider.id,
              aiModel: aiResponse.model
            };
          }
        }
      }
    } catch (error) {
      console.error('Failed to enhance response with AI:', error);
      // Continue with original response if AI enhancement fails
    }

    return response;
  }

  private async getBestProvider(config: AgentConfiguration): Promise<any> {
    const providers = await aiIntegrationService.getProviders();
    
    // Find provider that supports the requested model
    const suitableProvider = providers.find(provider => 
      provider.models.includes(config.model)
    );

    return suitableProvider || providers[0]; // Fallback to first available provider
  }

  private storeInteraction(interaction: AgentInteraction): void {
    const agentInteractions = this.interactions.get(interaction.agentId) || [];
    agentInteractions.push(interaction);
    
    // Keep only last 1000 interactions per agent
    if (agentInteractions.length > 1000) {
      agentInteractions.splice(0, agentInteractions.length - 1000);
    }
    
    this.interactions.set(interaction.agentId, agentInteractions);
  }

  private updateAnalytics(interaction: AgentInteraction): void {
    const analytics = this.analytics.get(interaction.agentId);
    if (!analytics) return;

    // Update basic metrics
    analytics.totalInteractions++;
    
    // Update average response time
    const responseTime = interaction.output.metadata.processingTime;
    analytics.averageResponseTime = 
      (analytics.averageResponseTime * (analytics.totalInteractions - 1) + responseTime) / 
      analytics.totalInteractions;

    // Update success rate (based on confidence)
    const isSuccessful = interaction.output.confidence > 0.7;
    analytics.successRate = 
      (analytics.successRate * (analytics.totalInteractions - 1) + (isSuccessful ? 1 : 0)) / 
      analytics.totalInteractions;

    // Update top queries
    const existingQuery = analytics.topQueries.find(q => q.query === interaction.input);
    if (existingQuery) {
      existingQuery.count++;
    } else {
      analytics.topQueries.push({ query: interaction.input, count: 1 });
    }
    
    // Keep only top 10 queries
    analytics.topQueries.sort((a, b) => b.count - a.count);
    analytics.topQueries = analytics.topQueries.slice(0, 10);

    // Update performance trends (daily aggregation)
    const today = new Date().toISOString().split('T')[0];
    let trend = analytics.performanceTrends.find(t => t.date === today);
    
    if (!trend) {
      trend = {
        date: today,
        interactions: 0,
        satisfaction: 0,
        responseTime: 0
      };
      analytics.performanceTrends.push(trend);
    }
    
    trend.interactions++;
    trend.responseTime = (trend.responseTime * (trend.interactions - 1) + responseTime) / trend.interactions;
    
    // Keep only last 30 days
    analytics.performanceTrends = analytics.performanceTrends.slice(-30);

    this.analytics.set(interaction.agentId, analytics);
  }

  async getAgentAnalytics(agentId: string): Promise<AgentAnalytics | null> {
    return this.analytics.get(agentId) || null;
  }

  async getAllAnalytics(): Promise<AgentAnalytics[]> {
    return Array.from(this.analytics.values());
  }

  async getAgentInteractions(agentId: string, limit: number = 50): Promise<AgentInteraction[]> {
    const interactions = this.interactions.get(agentId) || [];
    return interactions.slice(-limit).reverse();
  }

  async addFeedback(
    agentId: string,
    interactionId: string,
    satisfaction: number,
    feedback?: string
  ): Promise<void> {
    const interactions = this.interactions.get(agentId) || [];
    const interaction = interactions.find(i => i.id === interactionId);
    
    if (interaction) {
      interaction.satisfaction = satisfaction;
      interaction.feedback = feedback;
      
      // Update analytics
      const analytics = this.analytics.get(agentId);
      if (analytics) {
        analytics.userFeedback.push({
          rating: satisfaction,
          comment: feedback || '',
          timestamp: new Date().toISOString()
        });
        
        // Update average satisfaction
        const totalSatisfaction = analytics.userFeedback.reduce((sum, f) => sum + f.rating, 0);
        analytics.averageSatisfaction = totalSatisfaction / analytics.userFeedback.length;
        
        this.analytics.set(agentId, analytics);
      }
    }
  }

  async trainAgent(agentId: string, trainingData: any[]): Promise<void> {
    await agentService.trainAgent(agentId, trainingData);
    
    // Update analytics
    const analytics = this.analytics.get(agentId);
    if (analytics) {
      // Reset some metrics after training
      analytics.successRate = 0;
      analytics.averageSatisfaction = 0;
    }
  }

  async getAgentPerformance(agentId: string): Promise<any> {
    return await agentService.getAgentPerformance(agentId);
  }

  async getAllAgents(): Promise<Agent[]> {
    return await agentService.getAllAgents();
  }

  async createAgent(agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> {
    const newAgent = await agentService.createAgent(agent);
    
    // Initialize analytics for new agent
    this.analytics.set(newAgent.id, {
      agentId: newAgent.id,
      totalInteractions: 0,
      averageSatisfaction: 0,
      averageResponseTime: 0,
      successRate: 0,
      topQueries: [],
      userFeedback: [],
      performanceTrends: []
    });
    
    return newAgent;
  }

  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent | null> {
    return await agentService.updateAgent(agentId, updates);
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    const deleted = await agentService.deleteAgent(agentId);
    
    if (deleted) {
      // Clean up analytics and interactions
      this.analytics.delete(agentId);
      this.interactions.delete(agentId);
    }
    
    return deleted;
  }

  async getSystemHealth(): Promise<{
    agents: { total: number; active: number; inactive: number };
    knowledgeBases: { total: number; active: number };
    rules: { total: number; categories: string[] };
    aiProviders: { total: number; available: number };
    interactions: { total: number; today: number };
  }> {
    const agents = await this.getAllAgents();
    const knowledgeBases = await knowledgeBaseService.getAllKnowledgeBases();
    const rules = await rulesEngineService.getAllRules();
    const aiProviders = await aiIntegrationService.getProviders();
    
    const totalInteractions = Array.from(this.interactions.values())
      .reduce((sum, interactions) => sum + interactions.length, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayInteractions = Array.from(this.interactions.values())
      .reduce((sum, interactions) => {
        return sum + interactions.filter(i => i.timestamp.startsWith(today)).length;
      }, 0);

    return {
      agents: {
        total: agents.length,
        active: agents.filter(a => a.status === 'active').length,
        inactive: agents.filter(a => a.status !== 'active').length
      },
      knowledgeBases: {
        total: knowledgeBases.length,
        active: knowledgeBases.filter(kb => kb.status === 'active').length
      },
      rules: {
        total: rules.length,
        categories: [...new Set(rules.map(r => r.category))]
      },
      aiProviders: {
        total: aiProviders.length,
        available: aiProviders.length // All providers are considered available
      },
      interactions: {
        total: totalInteractions,
        today: todayInteractions
      }
    };
  }
}

// Singleton instance
export const aiAgentManager = new AIAgentManager();
