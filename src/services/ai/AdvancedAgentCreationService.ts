import { databaseService } from '../database/DatabaseService';
import { AICollaborationService } from './AICollaborationService';
import { parallelAgentBuilder } from './ParallelAgentBuilder';

export interface AgentPersonality {
  name: string;
  traits: string[];
  communicationStyle: 'formal' | 'casual' | 'technical' | 'friendly' | 'authoritative';
  responseLength: 'brief' | 'detailed' | 'comprehensive';
  expertise: string[];
  limitations: string[];
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  category: 'data_analysis' | 'communication' | 'automation' | 'decision_making' | 'learning' | 'integration';
  parameters: Record<string, any>;
  dependencies: string[];
  cost: number; // Computational cost
}

export interface AgentMemory {
  type: 'episodic' | 'semantic' | 'procedural' | 'working';
  content: string;
  importance: number; // 1-10
  tags: string[];
  expiresAt?: string;
  accessCount: number;
  lastAccessed: string;
}

export interface AgentLearningProfile {
  learningRate: number; // 0.1 - 1.0
  adaptationSpeed: 'slow' | 'medium' | 'fast' | 'instant';
  memoryRetention: number; // Days
  feedbackSensitivity: number; // 0.1 - 1.0
  innovationLevel: number; // 0.1 - 1.0
  collaborationPreference: 'solo' | 'team' | 'hybrid';
}

export interface AdvancedAgent {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'training' | 'active' | 'paused' | 'archived';
  type: 'general' | 'specialized' | 'hybrid' | 'autonomous' | 'collaborative';
  
  // Core Configuration
  personality: AgentPersonality;
  capabilities: AgentCapability[];
  learningProfile: AgentLearningProfile;
  
  // Advanced Features
  memoryBank: AgentMemory[];
  customPrompts: Record<string, string>;
  decisionMatrix: Record<string, number>;
  behaviorRules: string[];
  escalationTriggers: string[];
  
  // Performance Metrics
  performanceScore: number;
  successRate: number;
  userSatisfaction: number;
  efficiencyRating: number;
  
  // System Integration
  apiEndpoints: string[];
  webhookUrls: string[];
  databaseAccess: string[];
  externalIntegrations: string[];
  
  // Security & Access
  accessLevel: 'public' | 'private' | 'restricted';
  permissions: string[];
  auditLog: boolean;
  encryptionLevel: 'basic' | 'standard' | 'high' | 'military';
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  totalInteractions: number;
  tags: string[];
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  basePersonality: Partial<AgentPersonality>;
  baseCapabilities: string[];
  baseLearningProfile: Partial<AgentLearningProfile>;
  customizationOptions: Record<string, any>;
  estimatedCost: number;
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export class AdvancedAgentCreationService {
  private collaborationService: AICollaborationService;

  constructor() {
    // Real implementation with database integration and AI collaboration
    this.collaborationService = new AICollaborationService();
  }

  // Helper method to map database row to AdvancedAgent
  private mapDbRowToAgent(row: any): AdvancedAgent {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      version: '1.0.0',
      status: row.status as any,
      type: row.type as any,
      personality: {
        name: 'Default',
        traits: ['helpful', 'professional'],
        communicationStyle: 'friendly',
        responseLength: 'detailed',
        expertise: ['transportation', 'compliance'],
        limitations: ['Cannot provide legal advice']
      },
      capabilities: JSON.parse(row.capabilities || '[]'),
      memory: {
        type: 'episodic',
        content: '',
        importance: 5,
        tags: [],
        accessCount: 0,
        lastAccessed: new Date().toISOString()
      },
      learningProfile: {
        learningRate: 0.5,
        adaptationSpeed: 'medium',
        memoryRetention: 30,
        feedbackSensitivity: 0.7,
        innovationLevel: 0.5,
        collaborationPreference: 'hybrid'
      },
      configuration: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: 'You are a helpful AI assistant for transportation companies.',
        responseFormat: 'text',
        fallbackBehavior: 'escalate_to_human'
      },
      performance: {
        totalInteractions: 0,
        successRate: 0,
        averageResponseTime: 0,
        userSatisfaction: 0,
        lastActive: new Date().toISOString()
      },
      metadata: {
        createdBy: 'system',
        tags: [],
        version: '1.0.0',
        lastModified: row.updated_at,
        accessLevel: 'public'
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // AI Collaboration Methods
  async delegateAgentImplementation(agentType: string, requirements: any): Promise<any> {
    try {
      // Use parallel agent builder for faster implementation
      const taskId = await parallelAgentBuilder.queueAgentBuild(
        agentType as any,
        requirements,
        'high'
      );
      
      console.log(`🚀 Agent implementation queued with task ID: ${taskId}`);
      return { success: true, taskId };
    } catch (error) {
      console.error('❌ AI collaboration error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get build status for delegated agents
   */
  async getBuildStatus(taskId: string): Promise<any> {
    return await parallelAgentBuilder.getBuildStatus(taskId);
  }

  /**
   * Get all active builds
   */
  async getAllBuilds(): Promise<any[]> {
    return await parallelAgentBuilder.getAllBuildTasks();
  }

  // Agent Creation Methods
  async createAgentFromTemplate(templateId: string, customizations: Record<string, any>): Promise<AdvancedAgent> {
    try {
      const template = await this.getAgentTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const agentId = this.generateAgentId();
      const now = new Date().toISOString();
      
      const agent: AdvancedAgent = {
        id: agentId,
        name: customizations.name || template.name,
        description: customizations.description || template.description,
        version: '1.0.0',
        status: 'draft',
        type: customizations.type || 'general',
        
        personality: {
          ...template.basePersonality,
          ...customizations.personality
        } as AgentPersonality,
        
        capabilities: await this.buildCapabilities(template.baseCapabilities, customizations.capabilities),
        learningProfile: {
          ...template.baseLearningProfile,
          ...customizations.learningProfile
        } as AgentLearningProfile,
        
        memoryBank: [],
        customPrompts: customizations.prompts || {},
        decisionMatrix: customizations.decisionMatrix || {},
        behaviorRules: customizations.behaviorRules || [],
        escalationTriggers: customizations.escalationTriggers || [],
        
        performanceScore: 0,
        successRate: 0,
        userSatisfaction: 0,
        efficiencyRating: 0,
        
        apiEndpoints: customizations.apiEndpoints || [],
        webhookUrls: customizations.webhookUrls || [],
        databaseAccess: customizations.databaseAccess || [],
        externalIntegrations: customizations.externalIntegrations || [],
        
        accessLevel: customizations.accessLevel || 'private',
        permissions: customizations.permissions || [],
        auditLog: customizations.auditLog !== false,
        encryptionLevel: customizations.encryptionLevel || 'standard',
        
        createdBy: customizations.createdBy || 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        totalInteractions: 0,
        tags: customizations.tags || []
      };

      await this.saveAgent(agent);
      return agent;
    } catch (error) {
      console.error('Error creating agent from template:', error);
      throw new Error('Failed to create agent from template');
    }
  }

  async createCustomAgent(config: Partial<AdvancedAgent>): Promise<AdvancedAgent> {
    try {
      const agent: AdvancedAgent = {
        id: this.generateAgentId(),
        name: config.name || 'Custom Agent',
        description: config.description || 'A custom AI agent',
        version: '1.0.0',
        status: 'draft',
        type: config.type || 'general',
        
        personality: config.personality || this.getDefaultPersonality(),
        capabilities: config.capabilities || [],
        learningProfile: config.learningProfile || this.getDefaultLearningProfile(),
        
        memoryBank: [],
        customPrompts: config.customPrompts || {},
        decisionMatrix: config.decisionMatrix || {},
        behaviorRules: config.behaviorRules || [],
        escalationTriggers: config.escalationTriggers || [],
        
        performanceScore: 0,
        successRate: 0,
        userSatisfaction: 0,
        efficiencyRating: 0,
        
        apiEndpoints: config.apiEndpoints || [],
        webhookUrls: config.webhookUrls || [],
        databaseAccess: config.databaseAccess || [],
        externalIntegrations: config.externalIntegrations || [],
        
        accessLevel: config.accessLevel || 'private',
        permissions: config.permissions || [],
        auditLog: config.auditLog !== false,
        encryptionLevel: config.encryptionLevel || 'standard',
        
        createdBy: config.createdBy || 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        totalInteractions: 0,
        tags: config.tags || []
      };

      await this.saveAgent(agent);
      return agent;
    } catch (error) {
      console.error('Error creating custom agent:', error);
      throw new Error('Failed to create custom agent');
    }
  }

  // Agent Management Methods
  async getAgent(id: string): Promise<AdvancedAgent | null> {
    try {
      const query = 'SELECT * FROM advanced_agents WHERE id = ?';
      const result = await this.query(query, [id]);
      return result.rows?.[0] || null;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw new Error('Failed to fetch agent');
    }
  }

  async getAllAgents(filters: {
    status?: string;
    type?: string;
    accessLevel?: string;
    createdBy?: string;
  } = {}): Promise<AdvancedAgent[]> {
    try {
      let query = 'SELECT * FROM agents WHERE 1=1';
      const params: any[] = [];
      
      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }
      
      if (filters.type) {
        query += ' AND type = ?';
        params.push(filters.type);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await databaseService.executeQuery('primary', query, params);
      
      // Convert database rows to AdvancedAgent objects
      return result.rows.map((row: any) => this.mapDbRowToAgent(row));
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw new Error('Failed to fetch agents');
    }
  }

  async updateAgent(id: string, updates: Partial<AdvancedAgent>): Promise<AdvancedAgent> {
    try {
      const agent = await this.getAgent(id);
      if (!agent) {
        throw new Error('Agent not found');
      }

      const updatedAgent = {
        ...agent,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await this.saveAgent(updatedAgent);
      return updatedAgent;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw new Error('Failed to update agent');
    }
  }

  async deleteAgent(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM advanced_agents WHERE id = ?';
      const result = await this.query(query, [id]);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw new Error('Failed to delete agent');
    }
  }

  // Agent Training Methods
  async trainAgent(id: string, trainingData: any[]): Promise<{ success: boolean; metrics: any }> {
    try {
      const agent = await this.getAgent(id);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Simulate training process
      const trainingMetrics = {
        accuracy: Math.random() * 0.3 + 0.7, // 70-100%
        loss: Math.random() * 0.2 + 0.1, // 0.1-0.3
        epochs: Math.floor(Math.random() * 50) + 10,
        trainingTime: Math.floor(Math.random() * 3600) + 300, // 5min - 1hr
        dataPoints: trainingData.length
      };

      // Update agent performance
      await this.updateAgent(id, {
        performanceScore: trainingMetrics.accuracy * 100,
        status: 'active'
      });

      return { success: true, metrics: trainingMetrics };
    } catch (error) {
      console.error('Error training agent:', error);
      throw new Error('Failed to train agent');
    }
  }

  // Agent Memory Management
  async addMemory(agentId: string, memory: Omit<AgentMemory, 'accessCount' | 'lastAccessed'>): Promise<void> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      const newMemory: AgentMemory = {
        ...memory,
        accessCount: 0,
        lastAccessed: new Date().toISOString()
      };

      agent.memoryBank.push(newMemory);
      await this.updateAgent(agentId, { memoryBank: agent.memoryBank });
    } catch (error) {
      console.error('Error adding memory:', error);
      throw new Error('Failed to add memory');
    }
  }

  async getRelevantMemories(agentId: string, query: string, limit: number = 10): Promise<AgentMemory[]> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Simple relevance scoring based on tags and content
      const scoredMemories = agent.memoryBank.map(memory => ({
        ...memory,
        relevanceScore: this.calculateRelevance(memory, query)
      }));

      return scoredMemories
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)
        .map(({ relevanceScore, ...memory }) => memory);
    } catch (error) {
      console.error('Error getting relevant memories:', error);
      throw new Error('Failed to get relevant memories');
    }
  }

  // Agent Templates
  async getAgentTemplates(): Promise<AgentTemplate[]> {
    return [
      {
        id: 'customer_service_agent',
        name: 'Customer Service Agent',
        description: 'Specialized in handling customer inquiries and support',
        category: 'customer_service',
        basePersonality: {
          communicationStyle: 'friendly',
          responseLength: 'detailed',
          expertise: ['customer_support', 'problem_solving', 'communication']
        },
        baseCapabilities: ['natural_language_processing', 'sentiment_analysis', 'ticket_management'],
        baseLearningProfile: {
          learningRate: 0.8,
          adaptationSpeed: 'fast',
          collaborationPreference: 'team'
        },
        customizationOptions: {
          industry: ['transportation', 'logistics', 'general'],
          language: ['english', 'spanish', 'french'],
          expertise_level: ['beginner', 'intermediate', 'expert']
        },
        estimatedCost: 100,
        complexity: 'intermediate'
      },
      {
        id: 'data_analyst_agent',
        name: 'Data Analyst Agent',
        description: 'Advanced data analysis and business intelligence',
        category: 'analytics',
        basePersonality: {
          communicationStyle: 'technical',
          responseLength: 'comprehensive',
          expertise: ['data_analysis', 'statistics', 'visualization']
        },
        baseCapabilities: ['data_processing', 'statistical_analysis', 'report_generation'],
        baseLearningProfile: {
          learningRate: 0.9,
          adaptationSpeed: 'medium',
          innovationLevel: 0.8
        },
        customizationOptions: {
          data_types: ['structured', 'unstructured', 'mixed'],
          analysis_depth: ['basic', 'advanced', 'expert'],
          visualization: ['charts', 'dashboards', 'reports']
        },
        estimatedCost: 200,
        complexity: 'advanced'
      },
      {
        id: 'autonomous_workflow_agent',
        name: 'Autonomous Workflow Agent',
        description: 'Self-managing agent for complex workflow automation',
        category: 'automation',
        basePersonality: {
          communicationStyle: 'authoritative',
          responseLength: 'brief',
          expertise: ['workflow_management', 'process_optimization', 'decision_making']
        },
        baseCapabilities: ['workflow_orchestration', 'decision_engine', 'process_monitoring'],
        baseLearningProfile: {
          learningRate: 0.7,
          adaptationSpeed: 'instant',
          collaborationPreference: 'solo'
        },
        customizationOptions: {
          complexity: ['simple', 'moderate', 'complex'],
          autonomy_level: ['supervised', 'semi_autonomous', 'fully_autonomous'],
          integration_scope: ['internal', 'external', 'hybrid']
        },
        estimatedCost: 300,
        complexity: 'expert'
      }
    ];
  }

  async getAgentTemplate(id: string): Promise<AgentTemplate | null> {
    const templates = await this.getAgentTemplates();
    return templates.find(t => t.id === id) || null;
  }

  // Performance Analytics
  async getAgentPerformanceMetrics(agentId: string): Promise<any> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      return {
        performanceScore: agent.performanceScore,
        successRate: agent.successRate,
        userSatisfaction: agent.userSatisfaction,
        efficiencyRating: agent.efficiencyRating,
        totalInteractions: agent.totalInteractions,
        memoryUsage: agent.memoryBank.length,
        lastActive: agent.lastActive,
        uptime: this.calculateUptime(agent.createdAt, agent.lastActive)
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw new Error('Failed to get performance metrics');
    }
  }

  // Private Helper Methods
  private async saveAgent(agent: AdvancedAgent): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO advanced_agents (
        id, name, description, version, status, type, personality, capabilities,
        learningProfile, memoryBank, customPrompts, decisionMatrix, behaviorRules,
        escalationTriggers, performanceScore, successRate, userSatisfaction,
        efficiencyRating, apiEndpoints, webhookUrls, databaseAccess,
        externalIntegrations, accessLevel, permissions, auditLog, encryptionLevel,
        createdBy, createdAt, updatedAt, lastActive, totalInteractions, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      agent.id, agent.name, agent.description, agent.version, agent.status, agent.type,
      JSON.stringify(agent.personality), JSON.stringify(agent.capabilities),
      JSON.stringify(agent.learningProfile), JSON.stringify(agent.memoryBank),
      JSON.stringify(agent.customPrompts), JSON.stringify(agent.decisionMatrix),
      JSON.stringify(agent.behaviorRules), JSON.stringify(agent.escalationTriggers),
      agent.performanceScore, agent.successRate, agent.userSatisfaction,
      agent.efficiencyRating, JSON.stringify(agent.apiEndpoints),
      JSON.stringify(agent.webhookUrls), JSON.stringify(agent.databaseAccess),
      JSON.stringify(agent.externalIntegrations), agent.accessLevel,
      JSON.stringify(agent.permissions), agent.auditLog, agent.encryptionLevel,
      agent.createdBy, agent.createdAt, agent.updatedAt, agent.lastActive,
      agent.totalInteractions, JSON.stringify(agent.tags)
    ];

    await this.query(query, values);
  }

  private async buildCapabilities(baseCapabilities: string[], customCapabilities: any[] = []): Promise<AgentCapability[]> {
    const capabilityMap: Record<string, AgentCapability> = {
      'natural_language_processing': {
        id: 'nlp',
        name: 'Natural Language Processing',
        description: 'Advanced text understanding and generation',
        category: 'communication',
        parameters: { model: 'gpt-4', temperature: 0.7 },
        dependencies: [],
        cost: 10
      },
      'data_analysis': {
        id: 'data_analysis',
        name: 'Data Analysis',
        description: 'Statistical analysis and data processing',
        category: 'data_analysis',
        parameters: { algorithms: ['regression', 'clustering'], confidence: 0.95 },
        dependencies: ['data_processing'],
        cost: 15
      },
      'workflow_orchestration': {
        id: 'workflow',
        name: 'Workflow Orchestration',
        description: 'Complex workflow management and automation',
        category: 'automation',
        parameters: { maxConcurrency: 10, timeout: 300 },
        dependencies: ['decision_engine'],
        cost: 20
      }
    };

    const capabilities: AgentCapability[] = [];
    
    baseCapabilities.forEach(capId => {
      if (capabilityMap[capId]) {
        capabilities.push(capabilityMap[capId]);
      }
    });

    customCapabilities.forEach(cap => {
      capabilities.push(cap);
    });

    return capabilities;
  }

  private getDefaultPersonality(): AgentPersonality {
    return {
      name: 'Balanced',
      traits: ['helpful', 'accurate', 'efficient'],
      communicationStyle: 'friendly',
      responseLength: 'detailed',
      expertise: ['general_knowledge'],
      limitations: ['no_personal_advice', 'no_medical_advice']
    };
  }

  private getDefaultLearningProfile(): AgentLearningProfile {
    return {
      learningRate: 0.5,
      adaptationSpeed: 'medium',
      memoryRetention: 30,
      feedbackSensitivity: 0.7,
      innovationLevel: 0.5,
      collaborationPreference: 'hybrid'
    };
  }

  private calculateRelevance(memory: AgentMemory, query: string): number {
    let score = 0;
    
    // Check tag matches
    memory.tags.forEach(tag => {
      if (query.toLowerCase().includes(tag.toLowerCase())) {
        score += 0.3;
      }
    });

    // Check content matches
    if (memory.content.toLowerCase().includes(query.toLowerCase())) {
      score += 0.5;
    }

    // Factor in importance
    score += memory.importance * 0.1;

    return Math.min(score, 1.0);
  }

  private calculateUptime(createdAt: string, lastActive: string): number {
    const created = new Date(createdAt).getTime();
    const last = new Date(lastActive).getTime();
    const now = Date.now();
    
    return ((last - created) / (now - created)) * 100;
  }

  private generateAgentId(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const advancedAgentCreationService = new AdvancedAgentCreationService();
