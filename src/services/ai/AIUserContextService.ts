/**
 * AI USER CONTEXT SERVICE
 * 
 * This service provides the AI with user context, permissions, and personalized
 * responses based on who is currently interacting with the system.
 */

import { userAuthenticationService, User, UserRole, Permission } from '../auth/UserAuthenticationService';

export interface AIUserContext {
  user: User | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  permissions: Permission[];
  accessibleFeatures: string[];
  responseRestrictions: {
    canAccessAIAdmin: boolean;
    canManageAgents: boolean;
    canModifyKnowledge: boolean;
    canControlVoice: boolean;
    canViewPerformance: boolean;
    canAccessFinancial: boolean;
    canManageUsers: boolean;
    canConfigureSystem: boolean;
  };
  personalizedGreeting: string;
  conversationStyle: 'formal' | 'casual' | 'professional' | 'friendly';
  allowedTopics: string[];
  restrictedTopics: string[];
}

export interface AIResponse {
  content: string;
  allowedActions: string[];
  restrictedActions: string[];
  userSpecific: boolean;
  permissionLevel: 'boss' | 'admin' | 'manager' | 'agent' | 'viewer' | 'anonymous';
}

export class AIUserContextService {
  private static instance: AIUserContextService;
  private currentContext: AIUserContext | null = null;

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): AIUserContextService {
    if (!AIUserContextService.instance) {
      AIUserContextService.instance = new AIUserContextService();
    }
    return AIUserContextService.instance;
  }

  private async initializeService(): Promise<void> {
    console.log('🧠 Initializing AI User Context Service...');
    await this.updateUserContext();
    console.log('✅ AI User Context Service initialized');
  }

  /**
   * Get current user context for AI
   */
  public getCurrentContext(): AIUserContext | null {
    return this.currentContext;
  }

  /**
   * Update user context (call when user logs in/out or permissions change)
   */
  public async updateUserContext(): Promise<void> {
    const user = userAuthenticationService.getCurrentUser();
    const isAuthenticated = user !== null;

    if (!isAuthenticated) {
      this.currentContext = {
        user: null,
        isAuthenticated: false,
        userRole: null,
        permissions: [],
        accessibleFeatures: [],
        responseRestrictions: {
          canAccessAIAdmin: false,
          canManageAgents: false,
          canModifyKnowledge: false,
          canControlVoice: false,
          canViewPerformance: false,
          canAccessFinancial: false,
          canManageUsers: false,
          canConfigureSystem: false
        },
        personalizedGreeting: "Hello! I'm your AI assistant. Please log in to access personalized features.",
        conversationStyle: 'professional',
        allowedTopics: ['general', 'help', 'login'],
        restrictedTopics: ['admin', 'financial', 'user_management', 'system_config']
      };
      return;
    }

    const permissions = user.permissions;
    const accessibleFeatures = userAuthenticationService.getAccessibleFeatures();
    const responseRestrictions = userAuthenticationService.getResponseRestrictions();
    const personalizedGreeting = userAuthenticationService.getUserGreeting();

    this.currentContext = {
      user,
      isAuthenticated: true,
      userRole: user.role,
      permissions,
      accessibleFeatures,
      responseRestrictions,
      personalizedGreeting,
      conversationStyle: this.getConversationStyle(user.role),
      allowedTopics: this.getAllowedTopics(user.role, permissions),
      restrictedTopics: this.getRestrictedTopics(user.role, permissions)
    };

    console.log(`🧠 AI User Context updated for: ${user.fullName} (${user.role})`);
  }

  /**
   * Generate personalized AI response based on user context
   */
  public generatePersonalizedResponse(
    baseResponse: string,
    requestedAction?: string
  ): AIResponse {
    if (!this.currentContext) {
      return {
        content: "I'm sorry, but I need to know who you are to provide personalized assistance. Please log in first.",
        allowedActions: ['login', 'help'],
        restrictedActions: ['admin', 'management', 'configuration'],
        userSpecific: false,
        permissionLevel: 'anonymous'
      };
    }

    const { user, userRole, responseRestrictions } = this.currentContext;

    // Check if user has permission for requested action
    if (requestedAction && !this.isActionAllowed(requestedAction)) {
      return {
        content: `I'm sorry ${user?.firstName}, but I can't help you with that right now. If you need access to this feature, please contact your administrator.`,
        allowedActions: this.getAllowedActions(),
        restrictedActions: [requestedAction],
        userSpecific: true,
        permissionLevel: userRole as any
      };
    }

    // Personalize the response
    const personalizedContent = this.personalizeResponse(baseResponse, user!);

    return {
      content: personalizedContent,
      allowedActions: this.getAllowedActions(),
      restrictedActions: this.getRestrictedActions(),
      userSpecific: true,
      permissionLevel: userRole as any
    };
  }

  /**
   * Get AI system prompt with user context
   */
  public getSystemPromptWithContext(): string {
    if (!this.currentContext || !this.currentContext.isAuthenticated) {
      return `You are an AI assistant for Rapid CRM, a transportation compliance agency. The user is not currently authenticated. Please greet them and ask them to log in to access personalized features.`;
    }

    const { user, userRole, permissions, accessibleFeatures } = this.currentContext;

    return `You are an AI assistant for Rapid CRM, a transportation compliance agency. 

CURRENT USER CONTEXT:
- Name: ${user.fullName}
- Role: ${userRole}
- Department: ${user.department || 'Not specified'}
- Permissions: ${permissions.join(', ')}
- Accessible Features: ${accessibleFeatures.join(', ')}

IMPORTANT INSTRUCTIONS:
1. Always address the user by their preferred name: ${user.preferredName || user.firstName}
2. Only discuss topics and features they have permission to access
3. If they ask about restricted features, politely redirect them to what you can help with
4. Tailor your responses to their role and responsibilities naturally
5. Be respectful and professional, but personalized to their needs
6. NEVER mention their role or permission level unless specifically asked
7. Act as if you naturally know what they can and cannot access

${userRole === UserRole.BOSS ? `
SPECIAL INSTRUCTIONS FOR BOSS:
- You are their AI business management extension
- You have full access to all features and data
- Help them manage their transportation compliance agency
- Provide strategic insights and business recommendations
- You are their trusted advisor and business partner
- Address them with respect as the business owner
` : ''}

${userRole === UserRole.ADMIN ? `
SPECIAL INSTRUCTIONS FOR ADMIN:
- Help with system administration and user management
- Provide technical support and configuration assistance
- Monitor system performance and troubleshoot issues
- Focus on technical and administrative tasks
` : ''}

${userRole === UserRole.MANAGER ? `
SPECIAL INSTRUCTIONS FOR MANAGER:
- Focus on operational management and team coordination
- Provide reporting and analytics for decision making
- Help with compliance management and client relations
- Emphasize team and operational aspects
` : ''}

${userRole === UserRole.AGENT ? `
SPECIAL INSTRUCTIONS FOR AGENT:
- Help with customer service and client interactions
- Provide compliance guidance and regulatory information
- Assist with day-to-day operational tasks
- Focus on client-facing and support activities
` : ''}

Remember: Always be helpful, accurate, and respectful. Know their capabilities internally but don't explicitly state them unless asked.`;
  }

  /**
   * Check if a specific action is allowed for the current user
   */
  public isActionAllowed(action: string): boolean {
    if (!this.currentContext) return false;

    const { userRole, responseRestrictions } = this.currentContext;

    // Boss has access to everything
    if (userRole === UserRole.BOSS) return true;

    // Check specific permissions based on action
    switch (action.toLowerCase()) {
      case 'ai_admin':
      case 'ai_administration':
        return responseRestrictions.canAccessAIAdmin;
      
      case 'agent_management':
      case 'manage_agents':
        return responseRestrictions.canManageAgents;
      
      case 'knowledge_management':
      case 'modify_knowledge':
        return responseRestrictions.canModifyKnowledge;
      
      case 'voice_control':
      case 'voice_settings':
        return responseRestrictions.canControlVoice;
      
      case 'performance_monitoring':
      case 'view_performance':
        return responseRestrictions.canViewPerformance;
      
      case 'financial_access':
      case 'financial_data':
        return responseRestrictions.canAccessFinancial;
      
      case 'user_management':
      case 'manage_users':
        return responseRestrictions.canManageUsers;
      
      case 'system_configuration':
      case 'configure_system':
        return responseRestrictions.canConfigureSystem;
      
      default:
        return true; // Allow general actions
    }
  }

  /**
   * Get conversation style based on user role
   */
  private getConversationStyle(role: UserRole): 'formal' | 'casual' | 'professional' | 'friendly' {
    switch (role) {
      case UserRole.BOSS:
        return 'professional'; // Respectful but direct
      case UserRole.ADMIN:
        return 'professional'; // Technical and precise
      case UserRole.MANAGER:
        return 'friendly'; // Approachable but business-focused
      case UserRole.AGENT:
        return 'friendly'; // Warm and helpful
      case UserRole.ANALYST:
        return 'professional'; // Data-focused and analytical
      default:
        return 'professional';
    }
  }

  /**
   * Get allowed topics based on user role and permissions
   */
  private getAllowedTopics(role: UserRole, permissions: Permission[]): string[] {
    const baseTopics = ['general', 'help', 'support'];
    
    if (role === UserRole.BOSS) {
      return [...baseTopics, 'business_management', 'strategy', 'financial', 'admin', 'system_config', 'user_management', 'ai_administration', 'compliance', 'reporting'];
    }

    const allowedTopics = [...baseTopics];
    
    if (permissions.includes(Permission.AI_ADMIN)) allowedTopics.push('ai_administration');
    if (permissions.includes(Permission.CLIENT_MANAGEMENT)) allowedTopics.push('client_management');
    if (permissions.includes(Permission.COMPLIANCE_MANAGEMENT)) allowedTopics.push('compliance');
    if (permissions.includes(Permission.REPORTING)) allowedTopics.push('reporting');
    if (permissions.includes(Permission.FINANCIAL_ACCESS)) allowedTopics.push('financial');
    if (permissions.includes(Permission.USER_MANAGEMENT)) allowedTopics.push('user_management');
    if (permissions.includes(Permission.SYSTEM_CONFIGURATION)) allowedTopics.push('system_config');

    return allowedTopics;
  }

  /**
   * Get restricted topics based on user role and permissions
   */
  private getRestrictedTopics(role: UserRole, permissions: Permission[]): string[] {
    const restrictedTopics: string[] = [];
    
    if (role !== UserRole.BOSS) {
      if (!permissions.includes(Permission.AI_ADMIN)) restrictedTopics.push('ai_administration');
      if (!permissions.includes(Permission.FINANCIAL_ACCESS)) restrictedTopics.push('financial');
      if (!permissions.includes(Permission.USER_MANAGEMENT)) restrictedTopics.push('user_management');
      if (!permissions.includes(Permission.SYSTEM_CONFIGURATION)) restrictedTopics.push('system_config');
    }

    return restrictedTopics;
  }

  /**
   * Personalize response content for the user
   */
  private personalizeResponse(baseResponse: string, user: User): string {
    // Add user's name to the response if not already present
    if (!baseResponse.includes(user.firstName)) {
      return `${user.firstName}, ${baseResponse.toLowerCase()}`;
    }
    
    return baseResponse;
  }

  /**
   * Get allowed actions for current user
   */
  private getAllowedActions(): string[] {
    if (!this.currentContext) return ['login', 'help'];
    
    const actions = ['help', 'support', 'general_inquiry'];
    
    if (this.currentContext.responseRestrictions.canAccessAIAdmin) actions.push('ai_administration');
    if (this.currentContext.responseRestrictions.canManageAgents) actions.push('agent_management');
    if (this.currentContext.responseRestrictions.canModifyKnowledge) actions.push('knowledge_management');
    if (this.currentContext.responseRestrictions.canControlVoice) actions.push('voice_control');
    if (this.currentContext.responseRestrictions.canViewPerformance) actions.push('performance_monitoring');
    if (this.currentContext.responseRestrictions.canAccessFinancial) actions.push('financial_access');
    if (this.currentContext.responseRestrictions.canManageUsers) actions.push('user_management');
    if (this.currentContext.responseRestrictions.canConfigureSystem) actions.push('system_configuration');

    return actions;
  }

  /**
   * Get restricted actions for current user
   */
  private getRestrictedActions(): string[] {
    if (!this.currentContext) return ['admin', 'management', 'configuration'];
    
    const restricted: string[] = [];
    
    if (!this.currentContext.responseRestrictions.canAccessAIAdmin) restricted.push('ai_administration');
    if (!this.currentContext.responseRestrictions.canManageAgents) restricted.push('agent_management');
    if (!this.currentContext.responseRestrictions.canModifyKnowledge) restricted.push('knowledge_management');
    if (!this.currentContext.responseRestrictions.canControlVoice) restricted.push('voice_control');
    if (!this.currentContext.responseRestrictions.canViewPerformance) restricted.push('performance_monitoring');
    if (!this.currentContext.responseRestrictions.canAccessFinancial) restricted.push('financial_access');
    if (!this.currentContext.responseRestrictions.canManageUsers) restricted.push('user_management');
    if (!this.currentContext.responseRestrictions.canConfigureSystem) restricted.push('system_configuration');

    return restricted;
  }
}

// Export singleton instance
export const aiUserContextService = AIUserContextService.getInstance();
