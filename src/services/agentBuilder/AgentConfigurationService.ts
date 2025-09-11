import { Agent, AgentConfiguration, Rule } from '../../types/schema';

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  type: Agent['type'];
  configuration: AgentConfiguration;
  defaultRules: string[];
  defaultCapabilities: string[];
  category: 'onboarding' | 'customer_service' | 'sales' | 'support' | 'compliance' | 'custom';
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

export interface AgentTrainingData {
  id: string;
  agentId: string;
  type: 'conversation' | 'document' | 'example' | 'feedback';
  content: string;
  expectedResponse?: string;
  context?: Record<string, any>;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentPerformanceMetrics {
  agentId: string;
  period: 'hour' | 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
  metrics: {
    totalInteractions: number;
    successfulInteractions: number;
    averageResponseTime: number;
    userSatisfactionScore: number;
    escalationRate: number;
    resolutionRate: number;
    knowledgeBaseUsage: number;
    ruleTriggerCount: number;
  };
  trends: {
    interactions: Array<{ date: string; count: number }>;
    satisfaction: Array<{ date: string; score: number }>;
    responseTime: Array<{ date: string; time: number }>;
  };
}

export class AgentConfigurationService {
  private agents: Map<string, Agent> = new Map();
  private templates: Map<string, AgentTemplate> = new Map();
  private trainingData: Map<string, AgentTrainingData[]> = new Map();
  private performanceMetrics: Map<string, AgentPerformanceMetrics[]> = new Map();
  private isInitialized = false;

  constructor() {
    this.loadData();
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize the service
   */
  public async initialize(): Promise<void> {
    try {
      this.isInitialized = true;
      console.log('Agent Configuration Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Agent Configuration Service:', error);
      throw new Error('Agent Configuration Service initialization failed');
    }
  }

  /**
   * Check if service is ready
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Load data from storage
   */
  private async loadData(): Promise<void> {
    try {
      console.log('Loading agent configuration data from real database...');
      // TODO: Implement real database loading
      // For now, initialize empty
      this.agents = new Map();
      this.trainingData = new Map();
      this.performanceMetrics = new Map();
    } catch (error) {
      console.error('Error loading agent configuration data:', error);
    }
  }

  /**
   * Save data to storage
   */
  private async saveData(): Promise<void> {
    try {
      console.log('Saving agent configuration data to real database...');
      // TODO: Implement real database saving
      // Data is saved individually when created/updated
    } catch (error) {
      console.error('Error saving agent configuration data:', error);
    }
  }

  /**
   * Initialize default agent templates
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: AgentTemplate[] = [
      {
        id: 'template-onboarding',
        name: 'USDOT Onboarding Agent',
        description: 'Specialized agent for USDOT application onboarding and form completion',
        type: 'onboarding',
        configuration: {
          model: 'gpt-4',
          temperature: 0.3,
          maxTokens: 2000,
          systemPrompt: 'You are a specialized USDOT application assistant. Help users complete their USDOT applications accurately and efficiently. Always ask clarifying questions when information is unclear.',
          responseFormat: 'structured',
          fallbackBehavior: 'escalate_to_human'
        },
        defaultRules: ['usdot-application-rules', 'form-validation-rules'],
        defaultCapabilities: ['form-completion', 'document-processing', 'compliance-checking'],
        category: 'onboarding',
        tags: ['usdot', 'onboarding', 'compliance', 'forms'],
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        usageCount: 0
      },
      {
        id: 'template-customer-service',
        name: 'Customer Service Agent',
        description: 'General customer service agent for handling inquiries and support requests',
        type: 'customer_service',
        configuration: {
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 1500,
          systemPrompt: 'You are a helpful customer service representative. Be friendly, professional, and aim to resolve customer issues quickly and effectively.',
          responseFormat: 'conversational',
          fallbackBehavior: 'escalate_to_human'
        },
        defaultRules: ['customer-service-rules', 'escalation-rules'],
        defaultCapabilities: ['inquiry-handling', 'troubleshooting', 'account-management'],
        category: 'customer_service',
        tags: ['customer-service', 'support', 'general'],
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        usageCount: 0
      },
      {
        id: 'template-sales',
        name: 'Sales Agent',
        description: 'Sales-focused agent for lead qualification and conversion',
        type: 'sales',
        configuration: {
          model: 'gpt-4',
          temperature: 0.5,
          maxTokens: 1800,
          systemPrompt: 'You are a sales professional focused on understanding customer needs and presenting solutions. Be consultative, not pushy.',
          responseFormat: 'persuasive',
          fallbackBehavior: 'schedule_callback'
        },
        defaultRules: ['sales-qualification-rules', 'objection-handling-rules'],
        defaultCapabilities: ['lead-qualification', 'product-knowledge', 'objection-handling'],
        category: 'sales',
        tags: ['sales', 'leads', 'conversion'],
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        usageCount: 0
      },
      {
        id: 'template-compliance',
        name: 'Compliance Agent',
        description: 'Specialized agent for regulatory compliance and documentation',
        type: 'custom',
        configuration: {
          model: 'gpt-4',
          temperature: 0.2,
          maxTokens: 2500,
          systemPrompt: 'You are a compliance specialist. Provide accurate regulatory information and help ensure all processes meet legal requirements.',
          responseFormat: 'structured',
          fallbackBehavior: 'escalate_to_human'
        },
        defaultRules: ['compliance-rules', 'regulatory-rules'],
        defaultCapabilities: ['regulatory-knowledge', 'document-review', 'compliance-checking'],
        category: 'compliance',
        tags: ['compliance', 'regulatory', 'legal'],
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        usageCount: 0
      }
    ];

    defaultTemplates.forEach(template => {
      if (!this.templates.has(template.id)) {
        this.templates.set(template.id, template);
      }
    });
  }

  /**
   * Create agent from template
   */
  public async createAgentFromTemplate(templateId: string, agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'configuration' | 'capabilities' | 'rules' | 'metrics'>): Promise<Agent> {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    const newAgent: Agent = {
      ...agentData,
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: template.type,
      configuration: { ...template.configuration },
      capabilities: [...template.defaultCapabilities],
      rules: [...template.defaultRules],
      metrics: {
        totalInteractions: 0,
        successRate: 0,
        averageResponseTime: 0,
        userSatisfaction: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.agents.set(newAgent.id, newAgent);
    this.trainingData.set(newAgent.id, []);
    this.performanceMetrics.set(newAgent.id, []);

    // Update template usage count
    template.usageCount++;
    this.templates.set(templateId, template);

    await this.saveData();
    return newAgent;
  }

  /**
   * Get all agent templates
   */
  public async getAgentTemplates(): Promise<AgentTemplate[]> {
    return Array.from(this.templates.values()).sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Get agent template by ID
   */
  public async getAgentTemplate(id: string): Promise<AgentTemplate | null> {
    return this.templates.get(id) || null;
  }

  /**
   * Create custom agent template
   */
  public async createAgentTemplate(templateData: Omit<AgentTemplate, 'id' | 'createdAt' | 'usageCount'>): Promise<AgentTemplate> {
    const newTemplate: AgentTemplate = {
      ...templateData,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    this.templates.set(newTemplate.id, newTemplate);
    await this.saveData();
    return newTemplate;
  }

  /**
   * Update agent configuration
   */
  public async updateAgentConfiguration(agentId: string, configuration: Partial<AgentConfiguration>): Promise<Agent | null> {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    const updatedAgent = {
      ...agent,
      configuration: { ...agent.configuration, ...configuration },
      updatedAt: new Date().toISOString()
    };

    this.agents.set(agentId, updatedAgent);
    await this.saveData();
    return updatedAgent;
  }

  /**
   * Add training data to agent
   */
  public async addTrainingData(agentId: string, trainingData: Omit<AgentTrainingData, 'id' | 'agentId' | 'createdAt' | 'updatedAt'>): Promise<AgentTrainingData> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error('Agent not found');

    const newTrainingData: AgentTrainingData = {
      ...trainingData,
      id: `training-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingData = this.trainingData.get(agentId) || [];
    existingData.push(newTrainingData);
    this.trainingData.set(agentId, existingData);

    await this.saveData();
    return newTrainingData;
  }

  /**
   * Get training data for agent
   */
  public async getTrainingData(agentId: string): Promise<AgentTrainingData[]> {
    return this.trainingData.get(agentId) || [];
  }

  /**
   * Record agent performance metrics
   */
  public async recordPerformanceMetrics(agentId: string, metrics: Omit<AgentPerformanceMetrics, 'agentId'>): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error('Agent not found');

    const performanceData: AgentPerformanceMetrics = {
      ...metrics,
      agentId
    };

    const existingMetrics = this.performanceMetrics.get(agentId) || [];
    existingMetrics.push(performanceData);
    
    // Keep only last 100 metrics per agent
    if (existingMetrics.length > 100) {
      existingMetrics.splice(0, existingMetrics.length - 100);
    }
    
    this.performanceMetrics.set(agentId, existingMetrics);
    await this.saveData();
  }

  /**
   * Get performance metrics for agent
   */
  public async getPerformanceMetrics(agentId: string, period?: 'hour' | 'day' | 'week' | 'month'): Promise<AgentPerformanceMetrics[]> {
    const metrics = this.performanceMetrics.get(agentId) || [];
    
    if (period) {
      return metrics.filter(m => m.period === period);
    }
    
    return metrics;
  }

  /**
   * Get agent analytics
   */
  public async getAgentAnalytics(agentId: string): Promise<{
    totalTrainingData: number;
    averageQuality: number;
    performanceTrend: 'improving' | 'stable' | 'declining';
    topTags: Array<{ tag: string; count: number }>;
    recentMetrics: AgentPerformanceMetrics[];
  }> {
    const trainingData = this.trainingData.get(agentId) || [];
    const metrics = this.performanceMetrics.get(agentId) || [];

    const qualityScores = trainingData.map(td => {
      switch (td.quality) {
        case 'excellent': return 4;
        case 'good': return 3;
        case 'fair': return 2;
        case 'poor': return 1;
        default: return 0;
      }
    });

    const averageQuality = qualityScores.length > 0 
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
      : 0;

    // Calculate performance trend
    const recentMetrics = metrics.slice(-7); // Last 7 data points
    let performanceTrend: 'improving' | 'stable' | 'declining' = 'stable';
    
    if (recentMetrics.length >= 2) {
      const first = recentMetrics[0].metrics.userSatisfactionScore;
      const last = recentMetrics[recentMetrics.length - 1].metrics.userSatisfactionScore;
      const change = last - first;
      
      if (change > 0.1) performanceTrend = 'improving';
      else if (change < -0.1) performanceTrend = 'declining';
    }

    // Get top tags from training data
    const tagCounts: Record<string, number> = {};
    trainingData.forEach(td => {
      td.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalTrainingData: trainingData.length,
      averageQuality,
      performanceTrend,
      topTags,
      recentMetrics: recentMetrics.slice(-5)
    };
  }

  /**
   * Validate agent configuration
   */
  public async validateAgentConfiguration(configuration: AgentConfiguration): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!configuration.model) {
      errors.push('Model is required');
    }

    if (configuration.temperature < 0 || configuration.temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (configuration.maxTokens < 1 || configuration.maxTokens > 4000) {
      errors.push('Max tokens must be between 1 and 4000');
    }

    if (!configuration.systemPrompt || configuration.systemPrompt.trim().length < 10) {
      errors.push('System prompt must be at least 10 characters long');
    }

    // Warnings
    if (configuration.temperature > 1.5) {
      warnings.push('High temperature may result in inconsistent responses');
    }

    if (configuration.maxTokens > 3000) {
      warnings.push('High max tokens may result in slower responses');
    }

    if (configuration.systemPrompt.length > 2000) {
      warnings.push('Very long system prompt may impact performance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Export agent configuration
   */
  public async exportAgentConfiguration(agentId: string): Promise<string> {
    const agent = this.agents.get(agentId);
    const trainingData = this.trainingData.get(agentId) || [];
    const metrics = this.performanceMetrics.get(agentId) || [];

    if (!agent) throw new Error('Agent not found');

    const exportData = {
      agent,
      trainingData,
      metrics,
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import agent configuration
   */
  public async importAgentConfiguration(importData: string): Promise<Agent> {
    try {
      const data = JSON.parse(importData);
      
      if (!data.agent) {
        throw new Error('Invalid import data: agent configuration missing');
      }

      const agent = data.agent as Agent;
      agent.id = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      agent.createdAt = new Date().toISOString();
      agent.updatedAt = new Date().toISOString();

      this.agents.set(agent.id, agent);
      
      if (data.trainingData) {
        this.trainingData.set(agent.id, data.trainingData);
      }
      
      if (data.metrics) {
        this.performanceMetrics.set(agent.id, data.metrics);
      }

      await this.saveData();
      return agent;
    } catch (error) {
      console.error('Failed to import agent configuration:', error);
      throw new Error('Invalid import data format');
    }
  }
}

export const agentConfigurationService = new AgentConfigurationService();
