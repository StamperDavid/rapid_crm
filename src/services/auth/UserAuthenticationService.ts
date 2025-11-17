/**
 * USER AUTHENTICATION SERVICE
 * 
 * This service manages user identity, authentication, and permission levels
 * for the AI system. It ensures the AI knows who it's talking to and what
 * they're authorized to access.
 */

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  preferredName?: string;  // What the AI should call them
  role: UserRole;
  permissions: Permission[];
  department?: string;
  lastLogin: Date;
  isActive: boolean;
  avatar?: string;
}

export enum UserRole {
  BOSS = 'boss',                    // You - the owner/CEO
  ADMIN = 'admin',                  // System administrators
  MANAGER = 'manager',              // Department managers
  AGENT = 'agent',                  // Customer service agents
  ANALYST = 'analyst',              // Data analysts
  VIEWER = 'viewer'                 // Read-only access
}

export enum Permission {
  // AI System Permissions
  AI_ADMIN = 'ai_admin',            // Full AI system control
  AI_AGENT_MANAGEMENT = 'ai_agent_management',
  AI_KNOWLEDGE_MANAGEMENT = 'ai_knowledge_management',
  AI_VOICE_CONTROL = 'ai_voice_control',
  AI_PERFORMANCE_MONITORING = 'ai_performance_monitoring',
  
  // Business Operations
  CLIENT_MANAGEMENT = 'client_management',
  COMPLIANCE_MANAGEMENT = 'compliance_management',
  REPORTING = 'reporting',
  FINANCIAL_ACCESS = 'financial_access',
  
  // System Administration
  USER_MANAGEMENT = 'user_management',
  SYSTEM_CONFIGURATION = 'system_configuration',
  DATABASE_ACCESS = 'database_access',
  API_MANAGEMENT = 'api_management',
  
  // Content and Marketing
  CONTENT_CREATION = 'content_creation',
  SOCIAL_MEDIA_MANAGEMENT = 'social_media_management',
  EMAIL_CAMPAIGNS = 'email_campaigns',
  
  // Analytics and Intelligence
  COMPETITOR_ANALYSIS = 'competitor_analysis',
  BUSINESS_INTELLIGENCE = 'business_intelligence',
  PERFORMANCE_ANALYTICS = 'performance_analytics'
}

export interface UserSession {
  user: User;
  sessionId: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export class UserAuthenticationService {
  private static instance: UserAuthenticationService;
  private currentUser: User | null = null;
  private currentSession: UserSession | null = null;
  private userCache: Map<string, User> = new Map();

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): UserAuthenticationService {
    if (!UserAuthenticationService.instance) {
      UserAuthenticationService.instance = new UserAuthenticationService();
    }
    return UserAuthenticationService.instance;
  }

  private async initializeService(): Promise<void> {
    console.log('🔐 Initializing User Authentication Service...');
    
    // Load current user from session storage or API
    await this.loadCurrentUser();
    
    console.log('✅ User Authentication Service initialized');
  }

  /**
   * Get the current authenticated user
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get the current user session
   */
  public getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  /**
   * Check if user has a specific permission
   */
  public hasPermission(permission: Permission): boolean {
    if (!this.currentUser) return false;
    
    // Boss has all permissions
    if (this.currentUser.role === UserRole.BOSS) return true;
    
    return this.currentUser.permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  public hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  public hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Get user's role-based greeting
   */
  public getUserGreeting(): string {
    if (!this.currentUser) {
      return "Hello! I'm your AI assistant. Please log in to access personalized features.";
    }

    const { firstName, preferredName, fullName, role } = this.currentUser;
    const displayName = preferredName || firstName; // Use preferred name if available, otherwise first name
    
    switch (role) {
      case UserRole.BOSS:
        return `Hello ${displayName}! I'm your AI business management extension. I'm here to help you run your transportation compliance agency and manage all aspects of the business. What would you like to work on today?`;
      
      case UserRole.ADMIN:
        return `Hello ${displayName}! I'm your AI assistant. I can help you with system administration, user management, and AI configuration. How can I assist you today?`;
      
      case UserRole.MANAGER:
        return `Hello ${displayName}! I'm your AI assistant. I can help you with team management, reporting, and operational tasks. What do you need assistance with?`;
      
      case UserRole.AGENT:
        return `Hello ${displayName}! I'm your AI assistant. I can help you with client interactions, compliance questions, and customer service tasks. How can I help you today?`;
      
      case UserRole.ANALYST:
        return `Hello ${displayName}! I'm your AI assistant. I can help you with data analysis, reporting, and business intelligence. What would you like to analyze?`;
      
      default:
        return `Hello ${displayName}! I'm your AI assistant. I'm here to help you with your tasks. What can I do for you today?`;
    }
  }

  /**
   * Get user's accessible features based on permissions
   */
  public getAccessibleFeatures(): string[] {
    if (!this.currentUser) return [];

    const features: string[] = [];
    
    // AI System Features
    if (this.hasPermission(Permission.AI_ADMIN)) {
      features.push('AI Administration', 'AI Agent Management', 'AI Knowledge Management', 'AI Voice Control', 'AI Performance Monitoring');
    } else {
      if (this.hasPermission(Permission.AI_AGENT_MANAGEMENT)) features.push('AI Agent Management');
      if (this.hasPermission(Permission.AI_KNOWLEDGE_MANAGEMENT)) features.push('AI Knowledge Management');
      if (this.hasPermission(Permission.AI_VOICE_CONTROL)) features.push('AI Voice Control');
      if (this.hasPermission(Permission.AI_PERFORMANCE_MONITORING)) features.push('AI Performance Monitoring');
    }

    // Business Operations
    if (this.hasPermission(Permission.CLIENT_MANAGEMENT)) features.push('Client Management');
    if (this.hasPermission(Permission.COMPLIANCE_MANAGEMENT)) features.push('Compliance Management');
    if (this.hasPermission(Permission.REPORTING)) features.push('Reporting');
    if (this.hasPermission(Permission.FINANCIAL_ACCESS)) features.push('Financial Access');

    // System Administration
    if (this.hasPermission(Permission.USER_MANAGEMENT)) features.push('User Management');
    if (this.hasPermission(Permission.SYSTEM_CONFIGURATION)) features.push('System Configuration');
    if (this.hasPermission(Permission.DATABASE_ACCESS)) features.push('Database Access');
    if (this.hasPermission(Permission.API_MANAGEMENT)) features.push('API Management');

    // Content and Marketing
    if (this.hasPermission(Permission.CONTENT_CREATION)) features.push('Content Creation');
    if (this.hasPermission(Permission.SOCIAL_MEDIA_MANAGEMENT)) features.push('Social Media Management');
    if (this.hasPermission(Permission.EMAIL_CAMPAIGNS)) features.push('Email Campaigns');

    // Analytics and Intelligence
    if (this.hasPermission(Permission.COMPETITOR_ANALYSIS)) features.push('Competitor Analysis');
    if (this.hasPermission(Permission.BUSINESS_INTELLIGENCE)) features.push('Business Intelligence');
    if (this.hasPermission(Permission.PERFORMANCE_ANALYTICS)) features.push('Performance Analytics');

    return features;
  }

  /**
   * Get permission-based response restrictions
   */
  public getResponseRestrictions(): {
    canAccessAIAdmin: boolean;
    canManageAgents: boolean;
    canModifyKnowledge: boolean;
    canControlVoice: boolean;
    canViewPerformance: boolean;
    canAccessFinancial: boolean;
    canManageUsers: boolean;
    canConfigureSystem: boolean;
  } {
    return {
      canAccessAIAdmin: this.hasPermission(Permission.AI_ADMIN),
      canManageAgents: this.hasPermission(Permission.AI_AGENT_MANAGEMENT),
      canModifyKnowledge: this.hasPermission(Permission.AI_KNOWLEDGE_MANAGEMENT),
      canControlVoice: this.hasPermission(Permission.AI_VOICE_CONTROL),
      canViewPerformance: this.hasPermission(Permission.AI_PERFORMANCE_MONITORING),
      canAccessFinancial: this.hasPermission(Permission.FINANCIAL_ACCESS),
      canManageUsers: this.hasPermission(Permission.USER_MANAGEMENT),
      canConfigureSystem: this.hasPermission(Permission.SYSTEM_CONFIGURATION)
    };
  }

  /**
   * Authenticate user (simulate login)
   */
  public async authenticateUser(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // In a real implementation, this would validate against your authentication system
      // For now, we'll simulate authentication
      const user = await this.getUserByUsername(username);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (!user.isActive) {
        return { success: false, error: 'User account is inactive' };
      }

      // In production, this would validate against hashed passwords in database
      // For now, we'll use a simple check but log that this needs to be updated
      if (password !== 'password123') { // TODO: Replace with proper password hashing
        console.warn('⚠️  Using plain text password validation - update for production!');
        return { success: false, error: 'Invalid password' };
      }

      // Create session
      this.currentUser = user;
      this.currentSession = {
        user,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        loginTime: new Date(),
        lastActivity: new Date(),
        ipAddress: '127.0.0.1', // In real implementation, get from request
        userAgent: navigator.userAgent,
        isActive: true
      };

      // Store in session storage
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      sessionStorage.setItem('currentSession', JSON.stringify(this.currentSession));

      console.log(`✅ User authenticated: ${user.fullName} (${user.role})`);
      return { success: true, user };

    } catch (error) {
      console.error('❌ Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Logout current user
   */
  public logout(): void {
    this.currentUser = null;
    this.currentSession = null;
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentSession');
    console.log('👋 User logged out');
  }

  /**
   * Load current user from session storage
   */
  private async loadCurrentUser(): Promise<void> {
    try {
      const userData = sessionStorage.getItem('currentUser');
      const sessionData = sessionStorage.getItem('currentSession');

      if (userData && sessionData) {
        this.currentUser = JSON.parse(userData);
        this.currentSession = JSON.parse(sessionData);
        
        // Update last activity
        if (this.currentSession) {
          this.currentSession.lastActivity = new Date();
        }
        
        console.log(`👤 Current user loaded: ${this.currentUser?.fullName} (${this.currentUser?.role})`);
      }
    } catch (error) {
      console.error('❌ Error loading current user:', error);
    }
  }

  /**
   * Get user by username (simulate database lookup)
   */
  private async getUserByUsername(username: string): Promise<User | null> {
    // In a real implementation, this would query your user database
    // For now, we'll return mock users based on username
    
    const mockUsers: Record<string, User> = {
      'boss': {
        id: 'user_boss_001',
        username: 'boss',
        email: 'boss@rapidcrm.com',
        firstName: 'David',
        lastName: 'Boss',
        fullName: 'David Boss',
        preferredName: 'David', // You can set this to whatever you prefer
        role: UserRole.BOSS,
        permissions: Object.values(Permission), // Boss has all permissions
        department: 'Executive',
        lastLogin: new Date(),
        isActive: true,
        avatar: '/uploads/logo_1757827373384.png'
      },
      'admin': {
        id: 'user_admin_001',
        username: 'admin',
        email: 'admin@rapidcrm.com',
        firstName: 'Admin',
        lastName: 'User',
        fullName: 'Admin User',
        preferredName: 'Admin',
        role: UserRole.ADMIN,
        permissions: [
          Permission.AI_ADMIN,
          Permission.AI_AGENT_MANAGEMENT,
          Permission.AI_KNOWLEDGE_MANAGEMENT,
          Permission.AI_VOICE_CONTROL,
          Permission.AI_PERFORMANCE_MONITORING,
          Permission.USER_MANAGEMENT,
          Permission.SYSTEM_CONFIGURATION,
          Permission.DATABASE_ACCESS,
          Permission.API_MANAGEMENT
        ],
        department: 'IT',
        lastLogin: new Date(),
        isActive: true
      },
      'manager': {
        id: 'user_manager_001',
        username: 'manager',
        email: 'manager@rapidcrm.com',
        firstName: 'Michael',
        lastName: 'Rodriguez',
        fullName: 'Michael Rodriguez',
        preferredName: 'Mike',
        role: UserRole.MANAGER,
        permissions: [
          Permission.CLIENT_MANAGEMENT,
          Permission.COMPLIANCE_MANAGEMENT,
          Permission.REPORTING,
          Permission.AI_AGENT_MANAGEMENT,
          Permission.AI_PERFORMANCE_MONITORING
        ],
        department: 'Operations',
        lastLogin: new Date(),
        isActive: true
      },
      'agent': {
        id: 'user_agent_001',
        username: 'agent',
        email: 'agent@rapidcrm.com',
        firstName: 'Jennifer',
        lastName: 'Chen',
        fullName: 'Jennifer Chen',
        preferredName: 'Jen',
        role: UserRole.AGENT,
        permissions: [
          Permission.CLIENT_MANAGEMENT,
          Permission.AI_AGENT_MANAGEMENT
        ],
        department: 'Customer Service',
        lastLogin: new Date(),
        isActive: true
      }
    };

    return mockUsers[username] || null;
  }

  /**
   * Update user's last activity
   */
  public updateLastActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date();
      sessionStorage.setItem('currentSession', JSON.stringify(this.currentSession));
    }
  }

  /**
   * Check if session is still valid
   */
  public isSessionValid(): boolean {
    if (!this.currentSession) return false;
    
    const now = new Date();
    const lastActivity = new Date(this.currentSession.lastActivity);
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes
    
    return (now.getTime() - lastActivity.getTime()) < sessionTimeout;
  }
}

// Export singleton instance
export const userAuthenticationService = UserAuthenticationService.getInstance();
