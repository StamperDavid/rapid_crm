// Using direct database connection - no separate database import
import { aiIntegrationService } from './AIIntegrationService';
import { claudeCollaborationService } from './ClaudeCollaborationService';
import { advancedAICustomizationService } from './AdvancedAICustomizationService';

export interface AgentBlueprint {
  id: string;
  name: string;
  description: string;
  specialization: 'USDOT_FILING' | 'COMPLIANCE_MONITORING' | 'FLEET_MANAGEMENT' | 'SAFETY_COMPLIANCE' | 'REGULATORY_UPDATES' | 'CUSTOMER_SERVICE' | 'SALES_ASSISTANCE';
  capabilities: string[];
  knowledgeBase: string[];
  personality: {
    tone: 'professional' | 'friendly' | 'authoritative' | 'helpful';
    expertise: 'expert' | 'advisor' | 'assistant' | 'specialist';
    communicationStyle: 'detailed' | 'concise' | 'conversational' | 'technical';
  };
  automationLevel: 'basic' | 'intermediate' | 'advanced' | 'autonomous';
  dependencies: string[]; // Other agents this agent depends on
  outputs: string[]; // What this agent produces
  inputs: string[]; // What this agent needs to function
}

export interface AgentInstance {
  id: string;
  blueprintId: string;
  name: string;
  status: 'active' | 'inactive' | 'training' | 'learning';
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
    userSatisfaction: number;
    lastActivity: string;
  };
  learning: {
    totalInteractions: number;
    improvementAreas: string[];
    strengths: string[];
    lastTraining: string;
  };
  configuration: {
    persona: any;
    voice: any;
    model: any;
    customPrompts: string[];
    rules: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export class AgentFactory {
  private static instance: AgentFactory;
  
  public static getInstance(): AgentFactory {
    if (!AgentFactory.instance) {
      AgentFactory.instance = new AgentFactory();
    }
    return AgentFactory.instance;
  }

  // Predefined agent blueprints for transportation industry
  private readonly agentBlueprints: AgentBlueprint[] = [
    {
      id: 'usdot-filing-agent',
      name: 'USDOT Filing Specialist',
      description: 'Expert agent for USDOT application filing, compliance checking, and regulatory guidance',
      specialization: 'USDOT_FILING',
      capabilities: [
        'USDOT application preparation',
        'Regulatory compliance checking',
        'Document validation',
        'Application status tracking',
        'Renewal reminders',
        'Regulatory guidance'
      ],
      knowledgeBase: [
        'USDOT regulations',
        'FMCSA requirements',
        'State-specific regulations',
        'Application procedures',
        'Compliance timelines'
      ],
      personality: {
        tone: 'professional',
        expertise: 'expert',
        communicationStyle: 'detailed'
      },
      automationLevel: 'advanced',
      dependencies: [],
      outputs: ['USDOT applications', 'compliance reports', 'regulatory guidance'],
      inputs: ['company information', 'fleet data', 'compliance history']
    },
    {
      id: 'compliance-monitor',
      name: 'Compliance Monitoring Agent',
      description: 'Continuous monitoring of regulatory compliance and automated reporting',
      specialization: 'COMPLIANCE_MONITORING',
      capabilities: [
        'Real-time compliance monitoring',
        'Automated report generation',
        'Violation detection',
        'Remediation guidance',
        'Audit preparation',
        'Regulatory updates tracking'
      ],
      knowledgeBase: [
        'DOT regulations',
        'Safety requirements',
        'Audit procedures',
        'Violation penalties',
        'Compliance timelines'
      ],
      personality: {
        tone: 'authoritative',
        expertise: 'specialist',
        communicationStyle: 'technical'
      },
      automationLevel: 'autonomous',
      dependencies: ['usdot-filing-agent'],
      outputs: ['compliance reports', 'violation alerts', 'remediation plans'],
      inputs: ['fleet data', 'driver records', 'inspection reports']
    },
    {
      id: 'fleet-manager',
      name: 'Fleet Management Agent',
      description: 'Intelligent fleet optimization, maintenance scheduling, and driver management',
      specialization: 'FLEET_MANAGEMENT',
      capabilities: [
        'Fleet optimization',
        'Maintenance scheduling',
        'Driver assignment',
        'Route optimization',
        'Fuel efficiency tracking',
        'Vehicle lifecycle management'
      ],
      knowledgeBase: [
        'Fleet operations',
        'Maintenance schedules',
        'Driver regulations',
        'Route planning',
        'Vehicle specifications'
      ],
      personality: {
        tone: 'professional',
        expertise: 'advisor',
        communicationStyle: 'conversational'
      },
      automationLevel: 'advanced',
      dependencies: [],
      outputs: ['maintenance schedules', 'driver assignments', 'optimization reports'],
      inputs: ['vehicle data', 'driver information', 'route data']
    },
    {
      id: 'safety-specialist',
      name: 'Safety Compliance Agent',
      description: 'Safety protocol enforcement, incident management, and safety training coordination',
      specialization: 'SAFETY_COMPLIANCE',
      capabilities: [
        'Safety protocol enforcement',
        'Incident management',
        'Safety training coordination',
        'Risk assessment',
        'Safety reporting',
        'Preventive measures'
      ],
      knowledgeBase: [
        'Safety regulations',
        'Incident procedures',
        'Training requirements',
        'Risk management',
        'Safety protocols'
      ],
      personality: {
        tone: 'authoritative',
        expertise: 'specialist',
        communicationStyle: 'detailed'
      },
      automationLevel: 'advanced',
      dependencies: ['compliance-monitor'],
      outputs: ['safety reports', 'training schedules', 'risk assessments'],
      inputs: ['incident reports', 'training records', 'safety data']
    },
    {
      id: 'regulatory-updater',
      name: 'Regulatory Updates Agent',
      description: 'Monitors regulatory changes and provides updates to relevant agents and users',
      specialization: 'REGULATORY_UPDATES',
      capabilities: [
        'Regulatory change monitoring',
        'Impact analysis',
        'Update distribution',
        'Compliance timeline updates',
        'Policy interpretation',
        'Change notifications'
      ],
      knowledgeBase: [
        'Federal regulations',
        'State regulations',
        'Industry standards',
        'Regulatory bodies',
        'Policy changes'
      ],
      personality: {
        tone: 'professional',
        expertise: 'expert',
        communicationStyle: 'technical'
      },
      automationLevel: 'autonomous',
      dependencies: [],
      outputs: ['regulatory updates', 'impact analyses', 'compliance alerts'],
      inputs: ['regulatory feeds', 'policy documents', 'industry news']
    }
  ];

  /**
   * Create a new agent instance from a blueprint
   */
  async createAgent(blueprintId: string, customName?: string): Promise<AgentInstance> {
    const blueprint = this.agentBlueprints.find(b => b.id === blueprintId);
    if (!blueprint) {
      throw new Error(`Blueprint ${blueprintId} not found`);
    }

    // Generate agent configuration using AI
    const agentConfig = await this.generateAgentConfiguration(blueprint);
    
    // Create agent instance
    const agentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const agent: AgentInstance = {
      id: agentId,
      blueprintId: blueprintId,
      name: customName || blueprint.name,
      status: 'training',
      performance: {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0,
        userSatisfaction: 0,
        lastActivity: new Date().toISOString()
      },
      learning: {
        totalInteractions: 0,
        improvementAreas: [],
        strengths: [],
        lastTraining: new Date().toISOString()
      },
      configuration: agentConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database
    await this.saveAgentToDatabase(agent);
    
    // Initialize agent training
    await this.initializeAgentTraining(agent, blueprint);
    
    return agent;
  }

  /**
   * Generate agent configuration using AI collaboration
   */
  private async generateAgentConfiguration(blueprint: AgentBlueprint): Promise<any> {
    const prompt = `
    Create an advanced AI agent configuration for a transportation compliance specialist with the following specifications:
    
    Specialization: ${blueprint.specialization}
    Capabilities: ${blueprint.capabilities.join(', ')}
    Knowledge Base: ${blueprint.knowledgeBase.join(', ')}
    Personality: ${JSON.stringify(blueprint.personality)}
    Automation Level: ${blueprint.automationLevel}
    
    Generate:
    1. Custom persona configuration
    2. Voice settings (professional, clear, authoritative)
    3. Model configuration (high accuracy, detailed responses)
    4. Custom prompts for transportation industry expertise
    5. Rules for compliance and regulatory adherence
    
    Focus on creating an agent that can handle complex transportation compliance tasks autonomously.
    `;

    try {
      // Use Claude collaboration for advanced configuration generation
      const response = await claudeCollaborationService.sendMessage(prompt, {
        currentModule: 'agent-factory',
        userRole: 'admin',
        activeFeatures: ['agent-creation', 'ai-configuration'],
        systemState: { 
          blueprint: blueprint,
          context: 'agent-creation'
        }
      });

      // Parse AI response and create configuration
      const config = this.parseAIConfigurationResponse(response);
      return config;
    } catch (error) {
      console.error('Error generating agent configuration:', error);
      // Fallback to default configuration
      return this.getDefaultAgentConfiguration(blueprint);
    }
  }

  /**
   * Parse AI response into agent configuration
   */
  private parseAIConfigurationResponse(aiResponse: string): any {
    try {
      // Extract configuration from AI response
      const persona = {
        id: 'transportation-specialist',
        name: 'Transportation Compliance Specialist',
        description: 'Expert in transportation regulations and compliance',
        personality: 'expert',
        tone: 'professional',
        expertise: 'transportation-compliance',
        responseStyle: 'detailed',
        behaviorTraits: ['thorough', 'accurate', 'compliance-focused'],
        conversationMemory: true,
        contextWindow: 8000,
        temperature: 0.3, // Low temperature for consistent, accurate responses
        maxTokens: 2000,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
        stopSequences: [],
        customPrompt: aiResponse
      };

      const voice = {
        id: 'professional-male',
        name: 'Professional Male',
        provider: 'unreal-speech',
        voiceId: 'Javier',
        settings: {
          rate: 0,
          pitch: 1.0,
          volume: 1.0,
          stability: 0.8,
          clarity: 0.9
        }
      };

      const model = {
        id: 'gpt-4-compliance',
        name: 'GPT-4 Compliance Specialist',
        provider: 'openrouter',
        modelId: 'gpt-4',
        capabilities: ['text-generation', 'analysis', 'compliance-checking'],
        settings: {
          temperature: 0.3,
          maxTokens: 2000,
          topP: 0.9
        }
      };

      return {
        persona,
        voice,
        model,
        customPrompts: [
          'You are a transportation compliance expert with deep knowledge of USDOT, FMCSA, and state regulations.',
          'Always provide accurate, up-to-date regulatory information.',
          'Focus on compliance, safety, and regulatory adherence in all responses.',
          'When uncertain, recommend consulting official regulatory sources.',
          'Provide step-by-step guidance for complex compliance procedures.'
        ],
        rules: [
          'Never provide inaccurate regulatory information',
          'Always cite regulatory sources when possible',
          'Recommend official verification for critical compliance decisions',
          'Maintain professional, authoritative tone',
          'Focus on practical, actionable guidance'
        ]
      };
    } catch (error) {
      console.error('Error parsing AI configuration:', error);
      throw error;
    }
  }

  /**
   * Get default agent configuration
   */
  private getDefaultAgentConfiguration(blueprint: AgentBlueprint): any {
    return {
      persona: {
        id: `${blueprint.specialization}-specialist`,
        name: blueprint.name,
        description: blueprint.description,
        personality: blueprint.personality.expertise,
        tone: blueprint.personality.tone,
        expertise: blueprint.specialization,
        responseStyle: blueprint.personality.communicationStyle,
        behaviorTraits: ['professional', 'accurate', 'helpful'],
        conversationMemory: true,
        contextWindow: 8000,
        temperature: 0.3,
        maxTokens: 2000,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
        stopSequences: []
      },
      voice: {
        id: 'professional-voice',
        name: 'Professional Voice',
        provider: 'unreal-speech',
        voiceId: 'Javier',
        settings: {
          rate: 0,
          pitch: 1.0,
          volume: 1.0
        }
      },
      model: {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openrouter',
        modelId: 'gpt-4',
        capabilities: ['text-generation', 'analysis']
      },
      customPrompts: [
        `You are a ${blueprint.specialization} specialist with expertise in ${blueprint.capabilities.join(', ')}.`,
        'Provide accurate, professional guidance.',
        'Focus on compliance and regulatory adherence.'
      ],
      rules: [
        'Maintain professional tone',
        'Provide accurate information',
        'Focus on compliance requirements'
      ]
    };
  }

  /**
   * Save agent to database
   */
  private async saveAgentToDatabase(agent: AgentInstance): Promise<void> {
    const query = `
      INSERT INTO agents (
        id, name, description, type, status, capabilities, personality, 
        knowledge_base_ids, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      agent.id,
      agent.name,
      `Specialized agent for ${agent.blueprintId}`,
      'Specialized',
      agent.status,
      JSON.stringify(agent.configuration.customPrompts),
      JSON.stringify(agent.configuration.persona),
      JSON.stringify(agent.configuration.rules),
      agent.createdAt,
      agent.updatedAt
    ];

    await new Promise((resolve, reject) => {
      db.run(query, values, function(err) {
        if (err) {
          console.error('Error saving agent to database:', err);
          reject(err);
        } else {
          console.log(`Agent ${agent.name} saved to database with ID: ${agent.id}`);
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * Initialize agent training
   */
  private async initializeAgentTraining(agent: AgentInstance, blueprint: AgentBlueprint): Promise<void> {
    const trainingPrompt = `
    Initialize training for a new transportation compliance agent with specialization: ${blueprint.specialization}
    
    Agent Name: ${agent.name}
    Capabilities: ${blueprint.capabilities.join(', ')}
    Knowledge Areas: ${blueprint.knowledgeBase.join(', ')}
    
    Provide initial training data and setup instructions for this agent to become proficient in transportation compliance tasks.
    `;

    try {
      await claudeCollaborationService.sendMessage(trainingPrompt, {
        currentModule: 'agent-training',
        userRole: 'admin',
        activeFeatures: ['agent-training', 'compliance-specialization'],
        systemState: { 
          agent: agent,
          blueprint: blueprint,
          context: 'initial-training'
        }
      });

      // Update agent status to active after training
      agent.status = 'active';
      await this.updateAgentInDatabase(agent);
      
    } catch (error) {
      console.error('Error initializing agent training:', error);
      agent.status = 'inactive';
      await this.updateAgentInDatabase(agent);
    }
  }

  /**
   * Update agent in database
   */
  private async updateAgentInDatabase(agent: AgentInstance): Promise<void> {
    const query = `
      UPDATE agents 
      SET status = ?, updated_at = ?
      WHERE id = ?
    `;
    
    const values = [agent.status, agent.updatedAt, agent.id];

    await new Promise((resolve, reject) => {
      db.run(query, values, function(err) {
        if (err) {
          console.error('Error updating agent in database:', err);
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  /**
   * Get available agent blueprints
   */
  getAvailableBlueprints(): AgentBlueprint[] {
    return this.agentBlueprints;
  }

  /**
   * Get agent blueprint by ID
   */
  getBlueprint(blueprintId: string): AgentBlueprint | undefined {
    return this.agentBlueprints.find(b => b.id === blueprintId);
  }

  /**
   * Get all created agents
   */
  async getAllAgents(): Promise<AgentInstance[]> {
    const query = `SELECT * FROM agents WHERE type = 'Specialized' ORDER BY created_at DESC`;
    
    return new Promise((resolve, reject) => {
      db.all(query, [], (err, rows: any[]) => {
        if (err) {
          console.error('Error fetching agents:', err);
          reject(err);
        } else {
          const agents: AgentInstance[] = rows.map(row => ({
            id: row.id,
            blueprintId: 'custom', // Will need to track this separately
            name: row.name,
            status: row.status as any,
            performance: {
              tasksCompleted: 0,
              successRate: 0,
              averageResponseTime: 0,
              userSatisfaction: 0,
              lastActivity: row.updated_at
            },
            learning: {
              totalInteractions: 0,
              improvementAreas: [],
              strengths: [],
              lastTraining: row.created_at
            },
            configuration: {
              persona: JSON.parse(row.personality || '{}'),
              voice: null,
              model: null,
              customPrompts: JSON.parse(row.capabilities || '[]'),
              rules: JSON.parse(row.knowledge_base_ids || '[]')
            },
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          resolve(agents);
        }
      });
    });
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<void> {
    const query = `DELETE FROM agents WHERE id = ?`;
    
    await new Promise((resolve, reject) => {
      db.run(query, [agentId], function(err) {
        if (err) {
          console.error('Error deleting agent:', err);
          reject(err);
        } else {
          console.log(`Agent ${agentId} deleted from database`);
          resolve(this.changes);
        }
      });
    });
  }
}

export const agentFactory = AgentFactory.getInstance();






