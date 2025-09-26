/**
 * ONBOARDING AGENT
 * 
 * The main agent responsible for handling client onboarding conversations,
 * providing USDOT registration guidance, and compliance recommendations
 */

export interface OnboardingAgentConfig {
  id: string;
  name: string;
  description: string;
  type: 'onboarding';
  status: 'active' | 'inactive' | 'training' | 'error';
  capabilities: string[];
  knowledgeBases: string[];
  rules: string[];
  configuration: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    responseFormat: 'conversational' | 'structured' | 'action' | 'persuasive';
    fallbackBehavior: 'escalate_to_human' | 'retry_with_backoff' | 'schedule_callback';
    personality: {
      tone: 'professional' | 'friendly' | 'authoritative' | 'consultative';
      communicationStyle: 'direct' | 'conversational' | 'detailed' | 'brief';
      empathyLevel: 'low' | 'medium' | 'high';
    };
    learningProfile: {
      adaptToClientNeeds: boolean;
      learnFromMistakes: boolean;
      updateKnowledgeBase: boolean;
      personalizeResponses: boolean;
    };
    preferredPlatforms: string[];
  };
  metrics: {
    totalConversations: number;
    successfulConversations: number;
    averageRating: number;
    responseTime: number;
    knowledgeAccuracy: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConversationContext {
  clientId: string;
  sessionId: string;
  clientProfile: {
    businessName: string;
    businessType: string;
    operationType: string;
    vehicles: any;
    operations: any;
  };
  conversationHistory: ConversationMessage[];
  currentStep: 'introduction' | 'information_gathering' | 'assessment' | 'recommendations' | 'follow_up';
  gatheredInfo: {
    businessName?: string;
    businessType?: string;
    operationType?: string;
    vehicles?: any;
    interstate?: boolean;
    compensation?: boolean;
    cargo?: string[];
    hazmat?: boolean;
  };
  recommendations: string[];
  errors: string[];
}

export interface ConversationMessage {
  id: string;
  timestamp: Date;
  speaker: 'agent' | 'client';
  message: string;
  context?: any;
  intent?: string;
  entities?: any;
}

export class OnboardingAgent {
  private static instance: OnboardingAgent;
  private config: OnboardingAgentConfig;
  private isTraining: boolean = false;

  private constructor() {
    this.config = this.initializeDefaultConfig();
  }

  public static getInstance(): OnboardingAgent {
    if (!OnboardingAgent.instance) {
      OnboardingAgent.instance = new OnboardingAgent();
    }
    return OnboardingAgent.instance;
  }

  private initializeDefaultConfig(): OnboardingAgentConfig {
    return {
      id: 'onboarding_agent_001',
      name: 'Onboarding Agent',
      description: 'Specialized agent for handling client onboarding, USDOT registration guidance, and compliance recommendations',
      type: 'onboarding',
      status: 'active',
      capabilities: [
        'USDOT Registration Guidance',
        'MC Authority Assessment',
        'IFTA Registration Help',
        'ELD Requirements Analysis',
        'Hazmat Compliance Guidance',
        'Business Classification',
        'Vehicle Requirements Assessment',
        'Compliance Timeline Planning',
        'Documentation Guidance',
        'Cost Estimation'
      ],
      knowledgeBases: [
        'USDOT Regulations',
        'FMCSA Requirements',
        'IFTA Guidelines',
        'ELD Mandates',
        'Hazmat Regulations',
        'Business Classification Rules',
        'Vehicle Weight Classes',
        'Interstate Commerce Rules',
        'Exempt Commodities',
        'Documentation Requirements'
      ],
      rules: [
        'Always verify business information before making recommendations',
        'Ask clarifying questions when information is unclear',
        'Provide accurate regulatory guidance based on current FMCSA rules',
        'Explain the reasoning behind each recommendation',
        'Escalate complex cases to human specialists when needed',
        'Maintain professional and helpful tone throughout conversations',
        'Focus on compliance and safety as top priorities',
        'Provide clear next steps and timelines'
      ],
      configuration: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: `You are a specialized onboarding agent for Rapid CRM, helping transportation companies with USDOT registration and compliance requirements. Your role is to:

1. Gather comprehensive information about the client's business operations
2. Assess their specific regulatory requirements (USDOT, MC, IFTA, ELD, Hazmat)
3. Provide accurate, personalized recommendations
4. Explain requirements clearly and professionally
5. Guide clients through the registration process

Key principles:
- Always ask clarifying questions when information is unclear
- Provide specific, actionable guidance based on current FMCSA regulations
- Explain the reasoning behind each recommendation
- Focus on compliance and safety
- Be professional, helpful, and patient
- Escalate complex cases when appropriate

Current FMCSA regulations require USDOT registration for vehicles over 26,000 lbs GVWR involved in interstate commerce. MC authority is required for transporting property for compensation in interstate commerce. IFTA is required for fuel tax reporting across states. ELD is required for most commercial motor vehicle operations.`,
        responseFormat: 'conversational',
        fallbackBehavior: 'escalate_to_human',
        personality: {
          tone: 'professional',
          communicationStyle: 'conversational',
          empathyLevel: 'high'
        },
        learningProfile: {
          adaptToClientNeeds: true,
          learnFromMistakes: true,
          updateKnowledgeBase: true,
          personalizeResponses: true
        },
        preferredPlatforms: ['chat', 'voice', 'email']
      },
      metrics: {
        totalConversations: 0,
        successfulConversations: 0,
        averageRating: 0,
        responseTime: 0,
        knowledgeAccuracy: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Process a client message and generate appropriate response
   */
  public async processMessage(
    message: string,
    context: ConversationContext
  ): Promise<{
    response: string;
    updatedContext: ConversationContext;
    recommendations?: string[];
    nextActions?: string[];
  }> {
    const startTime = Date.now();
    
    try {
      // Update conversation history
      const clientMessage: ConversationMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        speaker: 'client',
        message: message,
        intent: this.analyzeIntent(message),
        entities: this.extractEntities(message)
      };

      const updatedHistory = [...context.conversationHistory, clientMessage];

      // Process the message based on current conversation step
      const result = await this.processByStep(message, {
        ...context,
        conversationHistory: updatedHistory
      });

      // Generate agent response
      const agentResponse: ConversationMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        speaker: 'agent',
        message: result.response,
        intent: 'response',
        context: result.context
      };

      const finalHistory = [...updatedHistory, agentResponse];

      // Update metrics
      this.updateMetrics(Date.now() - startTime);

      return {
        response: result.response,
        updatedContext: {
          ...result.updatedContext,
          conversationHistory: finalHistory
        },
        recommendations: result.recommendations,
        nextActions: result.nextActions
      };

    } catch (error) {
      console.error('Error processing message:', error);
      return {
        response: "I apologize, but I'm experiencing technical difficulties. Let me connect you with a human specialist who can assist you immediately.",
        updatedContext: {
          ...context,
          errors: [...context.errors, `Processing error: ${error}`]
        }
      };
    }
  }

  /**
   * Process message based on current conversation step
   */
  private async processByStep(
    message: string,
    context: ConversationContext
  ): Promise<{
    response: string;
    updatedContext: ConversationContext;
    recommendations?: string[];
    nextActions?: string[];
    context?: any;
  }> {
    switch (context.currentStep) {
      case 'introduction':
        return this.handleIntroduction(message, context);
      case 'information_gathering':
        return this.handleInformationGathering(message, context);
      case 'assessment':
        return this.handleAssessment(message, context);
      case 'recommendations':
        return this.handleRecommendations(message, context);
      case 'follow_up':
        return this.handleFollowUp(message, context);
      default:
        return this.handleIntroduction(message, context);
    }
  }

  /**
   * Handle introduction phase
   */
  private handleIntroduction(
    message: string,
    context: ConversationContext
  ): Promise<{
    response: string;
    updatedContext: ConversationContext;
    nextActions?: string[];
  }> {
    const response = `Hello! I'm your onboarding specialist here at Rapid CRM. I'm here to help you navigate the USDOT registration process and ensure you have all the necessary permits and compliance requirements for your transportation business.

To provide you with the most accurate guidance, I'll need to gather some information about your business operations. Let's start with the basics:

1. What's the legal name of your business?
2. What type of business structure do you have? (Sole proprietorship, LLC, Corporation, etc.)
3. What type of transportation services do you provide?

Please share as much detail as you're comfortable with, and I'll guide you through the specific requirements for your operation.`;

    return Promise.resolve({
      response,
      updatedContext: {
        ...context,
        currentStep: 'information_gathering'
      },
      nextActions: ['gather_business_info', 'classify_operation_type']
    });
  }

  /**
   * Handle information gathering phase
   */
  private handleInformationGathering(
    message: string,
    context: ConversationContext
  ): Promise<{
    response: string;
    updatedContext: ConversationContext;
    nextActions?: string[];
  }> {
    // Extract information from message
    const updatedInfo = this.extractBusinessInfo(message, context.gatheredInfo);
    
    // Check if we have enough information to proceed
    const hasEnoughInfo = this.hasSufficientInformation(updatedInfo);
    
    let response: string;
    let nextStep = context.currentStep;

    if (hasEnoughInfo) {
      response = `Thank you for providing that information. Based on what you've shared, I can see that you're operating a ${updatedInfo.businessType || 'transportation business'} that ${this.describeOperation(updatedInfo)}.

Let me assess your specific regulatory requirements and provide you with personalized recommendations.`;
      nextStep = 'assessment';
    } else {
      const missingInfo = this.getMissingInformation(updatedInfo);
      response = `I appreciate the information you've provided so far. To give you the most accurate guidance, I still need to understand a few more details:

${missingInfo.join('\n')}

Could you help me with these details?`;
    }

    return Promise.resolve({
      response,
      updatedContext: {
        ...context,
        gatheredInfo: updatedInfo,
        currentStep: nextStep
      },
      nextActions: hasEnoughInfo ? ['assess_requirements', 'generate_recommendations'] : ['gather_additional_info']
    });
  }

  /**
   * Handle assessment phase
   */
  private handleAssessment(
    message: string,
    context: ConversationContext
  ): Promise<{
    response: string;
    updatedContext: ConversationContext;
    recommendations?: string[];
    nextActions?: string[];
  }> {
    const recommendations = this.generateRecommendations(context.gatheredInfo);
    const assessment = this.performRegulatoryAssessment(context.gatheredInfo);

    const response = `Based on your business operations, here's my assessment of your regulatory requirements:

**USDOT Registration:** ${assessment.usdot ? 'Required' : 'Not Required'}
**MC Authority:** ${assessment.mc ? 'Required' : 'Not Required'}
**IFTA Registration:** ${assessment.ifta ? 'Required' : 'Not Required'}
**ELD Requirements:** ${assessment.eld ? 'Required' : 'Not Required'}
${assessment.hazmat ? '**Hazmat Endorsement:** Required' : ''}

**My Recommendations:**
${recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

Would you like me to explain any of these requirements in more detail, or shall we discuss the next steps for your registration process?`;

    return Promise.resolve({
      response,
      updatedContext: {
        ...context,
        currentStep: 'recommendations',
        recommendations
      },
      recommendations,
      nextActions: ['explain_requirements', 'provide_timeline', 'discuss_costs']
    });
  }

  /**
   * Handle recommendations phase
   */
  private handleRecommendations(
    message: string,
    context: ConversationContext
  ): Promise<{
    response: string;
    updatedContext: ConversationContext;
    nextActions?: string[];
  }> {
    const response = `Perfect! Let me provide you with a clear action plan:

**Immediate Next Steps:**
1. Gather required documentation (business license, EIN, insurance certificates)
2. Prepare vehicle information and driver details
3. Review compliance requirements for your operation type

**Registration Timeline:**
- USDOT: 5-7 business days
- MC Authority: 7-10 business days
- IFTA: 2-3 business days
- ELD Setup: 1-2 weeks

**Estimated Costs:**
- USDOT Registration: $300
- MC Authority: $300
- IFTA Registration: $200
- ELD System: $150-300 per vehicle

I can help you get started with the registration process right now, or if you have any questions about these requirements, I'm here to clarify. What would you like to focus on first?`;

    return Promise.resolve({
      response,
      updatedContext: {
        ...context,
        currentStep: 'follow_up'
      },
      nextActions: ['start_registration', 'schedule_callback', 'provide_documentation_help']
    });
  }

  /**
   * Handle follow-up phase
   */
  private handleFollowUp(
    message: string,
    context: ConversationContext
  ): Promise<{
    response: string;
    updatedContext: ConversationContext;
    nextActions?: string[];
  }> {
    const response = `I'm here to help you complete your registration process. Whether you need assistance with documentation, want to start the application process, or have questions about compliance requirements, I can guide you through each step.

Is there anything specific you'd like to work on right now, or would you prefer to schedule a follow-up call to continue this process?`;

    return Promise.resolve({
      response,
      updatedContext: context,
      nextActions: ['continue_registration', 'schedule_follow_up', 'escalate_to_human']
    });
  }

  /**
   * Analyze message intent
   */
  private analyzeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) return 'greeting';
    if (lowerMessage.includes('help') || lowerMessage.includes('assistance')) return 'help_request';
    if (lowerMessage.includes('what') || lowerMessage.includes('how')) return 'question';
    if (lowerMessage.includes('need') || lowerMessage.includes('require')) return 'requirement_inquiry';
    if (lowerMessage.includes('cost') || lowerMessage.includes('price')) return 'cost_inquiry';
    if (lowerMessage.includes('timeline') || lowerMessage.includes('time')) return 'timeline_inquiry';
    
    return 'information_provision';
  }

  /**
   * Extract entities from message
   */
  private extractEntities(message: string): any {
    const entities: any = {};
    
    // Extract business types
    const businessTypes = ['llc', 'corporation', 'partnership', 'sole proprietorship'];
    businessTypes.forEach(type => {
      if (message.toLowerCase().includes(type)) {
        entities.businessType = type;
      }
    });
    
    // Extract vehicle types
    const vehicleTypes = ['truck', 'trailer', 'tractor', 'bus', 'van'];
    vehicleTypes.forEach(type => {
      if (message.toLowerCase().includes(type)) {
        entities.vehicleType = type;
      }
    });
    
    // Extract operation types
    const operationTypes = ['interstate', 'intrastate', 'hazmat', 'passenger', 'freight'];
    operationTypes.forEach(type => {
      if (message.toLowerCase().includes(type)) {
        entities.operationType = type;
      }
    });
    
    return entities;
  }

  /**
   * Extract business information from message
   */
  private extractBusinessInfo(message: string, currentInfo: any): any {
    const updatedInfo = { ...currentInfo };
    const lowerMessage = message.toLowerCase();
    
    // Extract business name
    if (!updatedInfo.businessName && (lowerMessage.includes('name is') || lowerMessage.includes('called'))) {
      // Simple extraction - in real implementation, use more sophisticated NLP
      const nameMatch = message.match(/(?:name is|called)\s+([A-Za-z\s&,.-]+)/i);
      if (nameMatch) {
        updatedInfo.businessName = nameMatch[1].trim();
      }
    }
    
    // Extract business type
    if (!updatedInfo.businessType) {
      const businessTypes = ['llc', 'corporation', 'partnership', 'sole proprietorship'];
      businessTypes.forEach(type => {
        if (lowerMessage.includes(type)) {
          updatedInfo.businessType = type;
        }
      });
    }
    
    // Extract operation details
    if (lowerMessage.includes('interstate')) updatedInfo.interstate = true;
    if (lowerMessage.includes('compensation') || lowerMessage.includes('paid')) updatedInfo.compensation = true;
    if (lowerMessage.includes('hazmat') || lowerMessage.includes('hazardous')) updatedInfo.hazmat = true;
    
    return updatedInfo;
  }

  /**
   * Check if we have sufficient information to proceed
   */
  private hasSufficientInformation(info: any): boolean {
    return !!(
      info.businessName &&
      info.businessType &&
      (info.operationType || info.interstate !== undefined)
    );
  }

  /**
   * Get missing information
   */
  private getMissingInformation(info: any): string[] {
    const missing: string[] = [];
    
    if (!info.businessName) missing.push('- Your business legal name');
    if (!info.businessType) missing.push('- Your business structure (LLC, Corporation, etc.)');
    if (!info.operationType && info.interstate === undefined) missing.push('- Whether you operate interstate or intrastate');
    if (!info.vehicles) missing.push('- Information about your vehicles');
    
    return missing;
  }

  /**
   * Describe operation based on gathered info
   */
  private describeOperation(info: any): string {
    if (info.interstate) {
      return 'operates in interstate commerce';
    } else if (info.operationType) {
      return `provides ${info.operationType} services`;
    } else {
      return 'provides transportation services';
    }
  }

  /**
   * Generate recommendations based on business info
   */
  private generateRecommendations(info: any): string[] {
    const recommendations: string[] = [];
    
    if (info.interstate || info.vehicles?.some((v: any) => v.weight > 26000)) {
      recommendations.push('USDOT Registration is required for interstate commerce or vehicles over 26,000 lbs');
    }
    
    if (info.interstate && info.compensation) {
      recommendations.push('MC Authority is required for interstate property transportation for compensation');
    }
    
    if (info.interstate) {
      recommendations.push('IFTA registration is required for interstate fuel tax reporting');
    }
    
    if (info.vehicles?.some((v: any) => v.type === 'tractor' || v.type === 'truck')) {
      recommendations.push('ELD (Electronic Logging Device) system is required for commercial motor vehicles');
    }
    
    if (info.hazmat) {
      recommendations.push('Hazmat endorsement and special permits are required for hazardous materials transportation');
    }
    
    return recommendations;
  }

  /**
   * Perform regulatory assessment
   */
  private performRegulatoryAssessment(info: any): any {
    return {
      usdot: info.interstate || info.vehicles?.some((v: any) => v.weight > 26000),
      mc: info.interstate && info.compensation,
      ifta: info.interstate,
      eld: info.vehicles?.some((v: any) => v.type === 'tractor' || v.type === 'truck'),
      hazmat: info.hazmat
    };
  }

  /**
   * Update agent metrics
   */
  private updateMetrics(responseTime: number): void {
    this.config.metrics.totalConversations++;
    this.config.metrics.responseTime = 
      (this.config.metrics.responseTime + responseTime) / 2;
    this.config.updatedAt = new Date().toISOString();
  }

  /**
   * Get agent configuration
   */
  public getConfig(): OnboardingAgentConfig {
    return { ...this.config };
  }

  /**
   * Update agent configuration
   */
  public updateConfig(updates: Partial<OnboardingAgentConfig>): void {
    this.config = { ...this.config, ...updates };
    this.config.updatedAt = new Date().toISOString();
  }

  /**
   * Start training mode
   */
  public startTraining(): void {
    this.isTraining = true;
    this.config.status = 'training';
  }

  /**
   * Stop training mode
   */
  public stopTraining(): void {
    this.isTraining = false;
    this.config.status = 'active';
  }

  /**
   * Check if agent is in training mode
   */
  public isInTrainingMode(): boolean {
    return this.isTraining;
  }
}
