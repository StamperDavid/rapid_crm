import { Agent, KnowledgeBase, Rule, AgentConfiguration } from '../../types/schema';
import { persistentConversationService, PersistentConversationContext } from '../conversations/PersistentConversationService';

export interface AgentResponse {
  id: string;
  agentId: string;
  message: string;
  confidence: number;
  sources: string[];
  timestamp: string;
  metadata: {
    processingTime: number;
    tokensUsed: number;
    model: string;
    temperature: number;
  };
}

export interface AgentTrainingData {
  id: string;
  agentId: string;
  input: string;
  expectedOutput: string;
  context: Record<string, any>;
  feedback?: 'positive' | 'negative' | 'neutral';
  createdAt: string;
}

export interface AgentPerformance {
  agentId: string;
  totalInteractions: number;
  successfulInteractions: number;
  averageConfidence: number;
  averageResponseTime: number;
  userSatisfaction: number;
  lastTraining: string;
  accuracy: number;
}

export interface AgentContext {
  userId?: string;
  companyId?: string;
  sessionId?: string;
  conversationHistory?: any[];
  userPreferences?: Record<string, any>;
  currentTask?: string;
  environment?: 'development' | 'staging' | 'production';
  conversationId?: string;
  clientId?: string;
  persistentContext?: PersistentConversationContext;
}

export class AgentService {
  private agents: Map<string, Agent> = new Map();
  private knowledgeBases: Map<string, KnowledgeBase> = new Map();
  private rules: Map<string, Rule> = new Map();
  private trainingData: Map<string, AgentTrainingData[]> = new Map();
  private performanceMetrics: Map<string, AgentPerformance> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData(): Promise<void> {
    try {
      // Initialize default agents
      const defaultAgents: Agent[] = [
        {
          id: 'usdot-onboarding',
          name: 'USDOT Application Agent',
          type: 'custom',
          description: 'Specialized agent for USDOT application assistance and data collection',
          status: 'active',
          capabilities: [
            'usdot_application_guidance',
            'data_collection',
            'form_validation',
            'compliance_checking',
            'application_submission'
          ],
          knowledgeBases: ['usdot_regulations', 'fmcsa_guidelines', 'application_forms'],
          rules: ['usdot_validation', 'data_privacy', 'compliance_check'],
          configuration: {
            model: 'gpt-4',
            temperature: 0.3,
            maxTokens: 2000,
            systemPrompt: 'You are a specialized USDOT application assistant. Help users complete their USDOT applications accurately and efficiently.',
            responseFormat: 'structured',
            fallbackBehavior: 'escalate_to_human'
          },
          metrics: {
            totalInteractions: 0,
            successRate: 0,
            averageResponseTime: 0,
            userSatisfaction: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'usdot-rpa',
          name: 'USDOT RPA Agent',
          type: 'custom',
          description: 'Robotic Process Automation agent for USDOT application submission',
          status: 'active',
          capabilities: [
            'form_automation',
            'data_entry',
            'application_submission',
            'status_tracking',
            'error_handling'
          ],
          knowledgeBases: ['usdot_forms', 'submission_procedures', 'error_codes'],
          rules: ['automation_safety', 'data_validation', 'retry_logic'],
          configuration: {
            model: 'gpt-4',
            temperature: 0.1,
            maxTokens: 1000,
            systemPrompt: 'You are a robotic process automation agent. Execute USDOT application submissions with precision and reliability.',
            responseFormat: 'action',
            fallbackBehavior: 'retry_with_backoff'
          },
          metrics: {
            totalInteractions: 0,
            successRate: 0,
            averageResponseTime: 0,
            userSatisfaction: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'customer-service',
          name: 'Customer Service Agent',
          type: 'customer_service',
          description: 'General customer service and support agent',
          status: 'active',
          capabilities: [
            'general_inquiry',
            'troubleshooting',
            'account_management',
            'billing_support',
            'feature_explanation'
          ],
          knowledgeBases: ['product_documentation', 'faq', 'troubleshooting_guides'],
          rules: ['customer_service_etiquette', 'escalation_procedures', 'privacy_protection'],
          configuration: {
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 1500,
            systemPrompt: 'You are a helpful customer service representative. Provide friendly and accurate assistance to customers.',
            responseFormat: 'conversational',
            fallbackBehavior: 'escalate_to_human'
          },
          metrics: {
            totalInteractions: 0,
            successRate: 0,
            averageResponseTime: 0,
            userSatisfaction: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'sales-assistant',
          name: 'Sales Assistant Agent',
          type: 'sales',
          description: 'Sales support and lead qualification agent',
          status: 'active',
          capabilities: [
            'lead_qualification',
            'product_demonstration',
            'pricing_information',
            'objection_handling',
            'follow_up_scheduling'
          ],
          knowledgeBases: ['product_catalog', 'pricing_tiers', 'sales_scripts', 'competitor_analysis'],
          rules: ['sales_ethics', 'lead_scoring', 'follow_up_protocols'],
          configuration: {
            model: 'gpt-4',
            temperature: 0.5,
            maxTokens: 1800,
            systemPrompt: 'You are a professional sales assistant. Help qualify leads and provide product information to potential customers.',
            responseFormat: 'persuasive',
            fallbackBehavior: 'schedule_callback'
          },
          metrics: {
            totalInteractions: 0,
            successRate: 0,
            averageResponseTime: 0,
            userSatisfaction: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // Initialize default knowledge bases
      const defaultKnowledgeBases: KnowledgeBase[] = [
        {
          id: 'usdot_regulations',
          name: 'USDOT Regulations',
          type: 'regulatory',
          description: 'Federal Motor Carrier Safety Administration regulations and guidelines',
          source: 'api',
          status: 'active',
          size: '15.2 MB',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'fmcsa_guidelines',
          name: 'FMCSA Guidelines',
          type: 'regulatory',
          description: 'Federal Motor Carrier Safety Administration operational guidelines',
          source: 'api',
          status: 'active',
          size: '8.7 MB',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'application_forms',
          name: 'USDOT Application Forms',
          type: 'proprietary',
          description: 'USDOT application forms and field definitions',
          source: 'upload',
          status: 'active',
          size: '3.1 MB',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'product_documentation',
          name: 'Product Documentation',
          type: 'proprietary',
          description: 'Comprehensive product documentation and user guides',
          source: 'upload',
          status: 'active',
          size: '12.5 MB',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'sales_scripts',
          name: 'Sales Scripts',
          type: 'proprietary',
          description: 'Proven sales scripts and conversation templates',
          source: 'upload',
          status: 'active',
          size: '2.8 MB',
          lastUpdated: new Date().toISOString()
        }
      ];

      // Initialize default rules
      const defaultRules: Rule[] = [
        {
          id: 'usdot_validation',
          name: 'USDOT Data Validation',
          description: 'Validate USDOT application data against FMCSA requirements',
          priority: 0,
          conditions: ['usdot_application_data_present', 'fmcsa_rules_updated'],
          actions: ['validate_required_fields', 'check_data_format', 'verify_compliance'],
          supersedes: [],
          supersededBy: [],
          category: 'compliance'
        },
        {
          id: 'data_privacy',
          name: 'Data Privacy Protection',
          description: 'Ensure all personal and business data is handled according to privacy regulations',
          priority: 0,
          conditions: ['personal_data_present', 'gdpr_compliance_required'],
          actions: ['encrypt_sensitive_data', 'log_data_access', 'anonymize_where_possible'],
          supersedes: [],
          supersededBy: [],
          category: 'privacy'
        },
        {
          id: 'automation_safety',
          name: 'Automation Safety Checks',
          description: 'Safety checks for robotic process automation',
          priority: 0,
          conditions: ['automation_task_initiated', 'safety_checks_enabled'],
          actions: ['verify_data_integrity', 'check_system_status', 'validate_permissions'],
          supersedes: [],
          supersededBy: [],
          category: 'safety'
        },
        {
          id: 'customer_service_etiquette',
          name: 'Customer Service Etiquette',
          description: 'Maintain professional and helpful customer service standards',
          priority: 1,
          conditions: ['customer_interaction', 'service_standards_active'],
          actions: ['use_polite_language', 'acknowledge_concerns', 'provide_clear_explanations'],
          supersedes: [],
          supersededBy: [],
          category: 'service'
        }
      ];

      // Store default data
      defaultAgents.forEach(agent => this.agents.set(agent.id, agent));
      defaultKnowledgeBases.forEach(kb => this.knowledgeBases.set(kb.id, kb));
      defaultRules.forEach(rule => this.rules.set(rule.id, rule));

      this.isInitialized = true;
      console.log('Agent service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize agent service:', error);
    }
  }

  async processMessage(
    agentId: string, 
    message: string, 
    context: AgentContext = {}
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      if (agent.status !== 'active') {
        throw new Error(`Agent ${agentId} is not active`);
      }

      // Get or create persistent conversation context
      let persistentContext = context.persistentContext;
      if (!persistentContext && context.conversationId && context.clientId) {
        console.log('Looking for persistent context:', context.conversationId);
        persistentContext = await persistentConversationService.getPersistentContext(context.conversationId);
        
        if (!persistentContext) {
          console.log('Creating new persistent context for:', context.conversationId, context.clientId);
          // Create new persistent context
          persistentContext = await persistentConversationService.createPersistentConversation(
            context.conversationId,
            context.clientId,
            agentId,
            {
              sessionId: context.sessionId,
              clientProfile: {
                name: context.userId || 'Unknown Client',
                email: '',
                preferences: context.userPreferences || {}
              }
            }
          );
          console.log('Created persistent context:', persistentContext);
        } else {
          console.log('Found existing persistent context:', persistentContext);
        }
      }

      // Add message to persistent context
      if (persistentContext) {
        const messageObj = {
          id: `msg_${Date.now()}`,
          content: message,
          sender: 'user' as const,
          timestamp: new Date().toISOString(),
          type: 'text' as const,
          metadata: {
            agentId,
            confidence: 1.0
          }
        };

        await persistentConversationService.addMessageToContext(
          persistentContext.conversationId,
          messageObj,
          context
        );
      }

      // Simulate AI processing with persistent context
      const response = await this.simulateAIResponse(agent, message, context, persistentContext);
      
      // Add agent response to persistent context
      if (persistentContext) {
        const responseMessage = {
          id: response.id,
          content: response.message,
          sender: 'agent' as const,
          timestamp: response.timestamp,
          type: 'text' as const,
          metadata: {
            agentId,
            confidence: response.confidence,
            sources: response.sources
          }
        };

        await persistentConversationService.addMessageToContext(
          persistentContext.conversationId,
          responseMessage,
          context
        );
      }
      
      // Update metrics
      this.updateAgentMetrics(agentId, Date.now() - startTime, true);
      
      return response;
    } catch (error) {
      this.updateAgentMetrics(agentId, Date.now() - startTime, false);
      throw error;
    }
  }

  private async simulateAIResponse(
    agent: Agent, 
    message: string, 
    context: AgentContext,
    persistentContext?: PersistentConversationContext
  ): Promise<AgentResponse> {
    // Simulate AI processing time
    const processingTime = Math.random() * 2000 + 500; // 500-2500ms
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Generate contextual response based on agent type and capabilities
    let responseMessage = '';
    let confidence = 0.8;
    let sources: string[] = [];

    switch (agent.type) {
      case 'custom':
        if (agent.id === 'usdot-onboarding') {
          responseMessage = this.generateUSDOTOnboardingResponse(message, context, persistentContext);
          confidence = 0.9;
          sources = ['usdot_regulations', 'fmcsa_guidelines', 'application_forms'];
        } else if (agent.id === 'usdot-rpa') {
          responseMessage = this.generateUSDOTRPAResponse(message, context, persistentContext);
          confidence = 0.95;
          sources = ['usdot_forms', 'submission_procedures'];
        }
        break;
      case 'customer_service':
        responseMessage = this.generateCustomerServiceResponse(message, context, persistentContext);
        confidence = 0.85;
        sources = ['product_documentation', 'faq'];
        break;
      case 'sales':
        responseMessage = this.generateSalesResponse(message, context, persistentContext);
        confidence = 0.8;
        sources = ['product_catalog', 'sales_scripts'];
        break;
      default:
        responseMessage = 'Hello! I\'m the Rapid CRM AI assistant. I\'m intelligent and ready to help with development tasks, database issues, API endpoints, and AI collaboration. What specific task would you like me to work on?';
        confidence = 0.7;
    }

    return {
      id: `response_${Date.now()}`,
      agentId: agent.id,
      message: responseMessage,
      confidence,
      sources,
      timestamp: new Date().toISOString(),
      metadata: {
        processingTime,
        tokensUsed: Math.floor(Math.random() * 500) + 100,
        model: agent.configuration.model,
        temperature: agent.configuration.temperature
      }
    };
  }

  private generateUSDOTOnboardingResponse(message: string, context: AgentContext, persistentContext?: PersistentConversationContext): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('usdot') || lowerMessage.includes('application')) {
      return `I'll help you with your USDOT application. Let me guide you through the process step by step. 

First, I need to collect some basic information about your business:
1. What is your legal business name?
2. What type of business entity are you (LLC, Corporation, etc.)?
3. Do you have an EIN (Employer Identification Number)?
4. What type of transportation operations will you be conducting?

Please provide this information, and I'll help you complete the application accurately.`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('assistance')) {
      return `I'm here to help you with your USDOT application process. I can assist with:
- Understanding USDOT requirements
- Collecting and validating application data
- Explaining form fields and requirements
- Checking compliance with FMCSA regulations
- Preparing your application for submission

What specific aspect of the USDOT application would you like help with?`;
    }
    
    return `I understand you're working on a USDOT application. Let me help you navigate through this process. Could you tell me what specific information you need assistance with?`;
  }

  private generateUSDOTRPAResponse(message: string, context: AgentContext, persistentContext?: PersistentConversationContext): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('submit') || lowerMessage.includes('application')) {
      return `I'm ready to submit your USDOT application. I'll:
1. Validate all required fields are complete
2. Check data format and compliance
3. Submit the application to the FMCSA portal
4. Monitor submission status
5. Handle any errors or retries

Your application data appears to be ready. Shall I proceed with the submission?`;
    }
    
    if (lowerMessage.includes('status') || lowerMessage.includes('check')) {
      return `I can check the status of your USDOT application submission. Let me verify the current status and provide you with an update.`;
    }
    
    return `I'm your USDOT RPA agent, ready to automate your application submission process. What would you like me to do?`;
  }

  private generateCustomerServiceResponse(message: string, context: AgentContext, persistentContext?: PersistentConversationContext): string {
    const lowerMessage = message.toLowerCase();
    
    // Use persistent context to provide personalized responses
    let greeting = "Hello!";
    if (persistentContext?.clientProfile.name && persistentContext.clientProfile.name !== 'Unknown Client') {
      greeting = `Hello ${persistentContext.clientProfile.name}!`;
    }
    
    // Reference previous conversations if available
    if (persistentContext?.agentMemory.previousIssues.length > 0) {
      const lastIssue = persistentContext.agentMemory.previousIssues[persistentContext.agentMemory.previousIssues.length - 1];
      if (lowerMessage.includes('same') || lowerMessage.includes('again') || lowerMessage.includes('still')) {
        return `${greeting} I see you're still experiencing issues with ${lastIssue}. Let me help you with a different approach this time.`;
      }
    }
    
    if (lowerMessage.includes('billing') || lowerMessage.includes('payment')) {
      return `${greeting} I can help you with billing and payment questions. Let me look up your account information and assist you with any billing concerns you may have.`;
    }
    
    if (lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      return `${greeting} I'm sorry to hear you're experiencing an issue. Let me help you troubleshoot this problem. Can you provide more details about what's not working as expected?`;
    }
    
    // Reference client preferences if available
    if (persistentContext?.clientProfile.communicationStyle === 'formal') {
      return `${greeting} I'm here to assist you with any questions or concerns you may have. How may I be of service today?`;
    } else if (persistentContext?.clientProfile.communicationStyle === 'casual') {
      return `${greeting} I'm here to help you with whatever you need! What's up?`;
    }
    
    return `${greeting} I'm here to help you with any questions or concerns you may have. How can I assist you today?`;
  }

  private generateSalesResponse(message: string, context: AgentContext, persistentContext?: PersistentConversationContext): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return `I'd be happy to discuss our pricing options with you. We offer several plans to meet different business needs. Let me provide you with detailed pricing information based on your requirements.`;
    }
    
    if (lowerMessage.includes('demo') || lowerMessage.includes('trial')) {
      return `I can arrange a personalized demo of our platform for you. This will give you a hands-on experience of how our solution can benefit your business. When would be a good time for a demo?`;
    }
    
    return `Thank you for your interest in our platform! I'm here to help you understand how our solution can benefit your business. What specific features or capabilities are you most interested in learning about?`;
  }

  private updateAgentMetrics(agentId: string, responseTime: number, success: boolean): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const currentMetrics = this.performanceMetrics.get(agentId) || {
      agentId,
      totalInteractions: 0,
      successfulInteractions: 0,
      averageConfidence: 0,
      averageResponseTime: 0,
      userSatisfaction: 0,
      lastTraining: new Date().toISOString(),
      accuracy: 0
    };

    currentMetrics.totalInteractions++;
    if (success) {
      currentMetrics.successfulInteractions++;
    }
    
    currentMetrics.averageResponseTime = 
      (currentMetrics.averageResponseTime * (currentMetrics.totalInteractions - 1) + responseTime) / 
      currentMetrics.totalInteractions;
    
    currentMetrics.accuracy = currentMetrics.successfulInteractions / currentMetrics.totalInteractions;

    this.performanceMetrics.set(agentId, currentMetrics);
    
    // Update agent metrics
    agent.metrics.totalInteractions = currentMetrics.totalInteractions;
    agent.metrics.successRate = currentMetrics.accuracy;
    agent.metrics.averageResponseTime = currentMetrics.averageResponseTime;
  }

  async trainAgent(agentId: string, trainingData: AgentTrainingData[]): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Store training data
    const existingData = this.trainingData.get(agentId) || [];
    this.trainingData.set(agentId, [...existingData, ...trainingData]);

    // Simulate training process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update performance metrics
    const metrics = this.performanceMetrics.get(agentId);
    if (metrics) {
      metrics.lastTraining = new Date().toISOString();
      this.performanceMetrics.set(agentId, metrics);
    }

    console.log(`Agent ${agentId} trained with ${trainingData.length} new examples`);
  }

  async getAgentPerformance(agentId: string): Promise<AgentPerformance | null> {
    return this.performanceMetrics.get(agentId) || null;
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(agentId: string): Promise<Agent | null> {
    return this.agents.get(agentId) || null;
  }

  async createAgent(agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> {
    const newAgent: Agent = {
      ...agent,
      id: `agent_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.agents.set(newAgent.id, newAgent);
    return newAgent;
  }

  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent | null> {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    const updatedAgent = {
      ...agent,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.agents.set(agentId, updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    return this.agents.delete(agentId);
  }

  async getAllKnowledgeBases(): Promise<KnowledgeBase[]> {
    return Array.from(this.knowledgeBases.values());
  }

  async getKnowledgeBase(kbId: string): Promise<KnowledgeBase | null> {
    return this.knowledgeBases.get(kbId) || null;
  }

  async getAllRules(): Promise<Rule[]> {
    return Array.from(this.rules.values());
  }

  async getRule(ruleId: string): Promise<Rule | null> {
    return this.rules.get(ruleId) || null;
  }

  async getTrainingData(agentId: string): Promise<AgentTrainingData[]> {
    return this.trainingData.get(agentId) || [];
  }

  async addTrainingData(agentId: string, data: AgentTrainingData): Promise<void> {
    const existingData = this.trainingData.get(agentId) || [];
    this.trainingData.set(agentId, [...existingData, data]);
  }

  async getAllPerformanceMetrics(): Promise<AgentPerformance[]> {
    return Array.from(this.performanceMetrics.values());
  }
}

// Singleton instance
export const agentService = new AgentService();
