/**
 * MANAGER AI KNOWLEDGE BASE
 * 
 * The Manager AI can receive regulatory data and automatically distribute it
 * to relevant agents that need that knowledge for their operations.
 */

export interface KnowledgeBaseEntry {
  id: string;
  name: string;
  type: 'qualified_states' | 'regulatory_documents' | 'reference_materials' | 'service_requirements' | 'agent_monitoring';
  data: any;
  applicableAgents: string[]; // Agent IDs that need this knowledge
  uploadedBy: string;
  uploadedAt: Date;
  version: number;
  isActive: boolean;
}

export interface AgentActivityLog {
  agentId: string;
  agentName: string;
  activity: string;
  timestamp: Date;
  details: any;
  success: boolean;
  knowledgeUsed?: string[]; // Knowledge base entries used
}

export interface AgentPerformanceMetrics {
  agentId: string;
  agentName: string;
  totalInteractions: number;
  successfulInteractions: number;
  averageResponseTime: number;
  knowledgeBaseUsage: Record<string, number>; // knowledgeBaseId -> usage count
  lastActivity: Date;
  status: 'active' | 'idle' | 'error' | 'training';
  capabilities: string[];
  currentTask?: string;
}

export interface ManagerAIAwareness {
  totalAgents: number;
  activeAgents: number;
  agentsInTraining: number;
  totalInteractions: number;
  knowledgeBaseEntries: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  recentActivities: AgentActivityLog[];
  performanceMetrics: AgentPerformanceMetrics[];
  alerts: Array<{
    id: string;
    type: 'performance' | 'error' | 'knowledge' | 'training';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    resolved: boolean;
  }>;
}

export interface QualifiedStatesData {
  states: Array<{
    stateCode: string;
    stateName: string;
    gvwrThreshold: number;
    passengerThreshold: number;
    specialRequirements: string[];
    notes: string;
  }>;
  lastUpdated: Date;
  source: string; // Excel file name or source
}

export interface ServiceRequirementsData {
  services: Array<{
    serviceType: string; // USDOT, MC, IFTA, ELD, Hazmat, etc.
    description: string;
    triggers: string[]; // What conditions trigger this service
    requirements: string[];
    exemptions: string[];
    cost: number;
  }>;
  lastUpdated: Date;
}

export class ManagerAIKnowledgeBase {
  private static instance: ManagerAIKnowledgeBase;
  private knowledgeBase: Map<string, KnowledgeBaseEntry> = new Map();
  private agentSubscriptions: Map<string, string[]> = new Map(); // agentId -> knowledgeBaseIds
  private agentActivities: AgentActivityLog[] = [];
  private agentPerformance: Map<string, AgentPerformanceMetrics> = new Map();
  private alerts: Array<any> = [];

  private constructor() {
    this.loadFromStorage();
    this.loadAgentReference();
    this.startAgentMonitoring();
  }

  /**
   * Load agent reference documentation
   */
  private async loadAgentReference(): Promise<void> {
    try {
      // In a real implementation, this would load the agents.md file
      // For now, we'll create a reference structure
      const agentReference = {
        id: 'agent_reference',
        name: 'AI Agents Reference Guide',
        type: 'agent_monitoring' as const,
        data: {
          agents: [
            {
              id: 'jasper_main',
              name: 'Jasper',
              type: 'Primary AI Assistant',
              status: 'active',
              capabilities: ['system_management', 'agent_coordination', 'client_management'],
              knowledgeRequirements: ['business_processes', 'system_architecture', 'client_workflows']
            },
            {
              id: 'manager_ai',
              name: 'Manager AI',
              type: 'Agent Coordinator',
              status: 'active',
              capabilities: ['agent_monitoring', 'knowledge_distribution', 'performance_tracking'],
              knowledgeRequirements: ['agent_specifications', 'performance_metrics', 'training_protocols']
            },
            {
              id: 'onboarding_agent',
              name: 'Onboarding Agent',
              type: 'Customer-Facing Agent',
              status: 'active',
              capabilities: ['regulatory_assessment', 'client_gathering', 'service_determination'],
              knowledgeRequirements: ['qualified_states', 'usdot_requirements', 'service_triggers'],
              persona: 'Alex'
            },
            {
              id: 'customer_service_agent_001',
              name: 'Customer Service Agent',
              type: 'Customer-Facing Agent',
              status: 'active',
              capabilities: ['client_support', 'issue_resolution', 'agent_coordination'],
              knowledgeRequirements: ['service_protocols', 'resolution_procedures'],
              persona: 'Alex (Shared)'
            },
            {
              id: 'usdot_rpa_agent',
              name: 'USDOT RPA Agent',
              type: 'Process Automation Agent',
              status: 'development',
              capabilities: ['form_automation', 'document_processing', 'hitl_coordination'],
              knowledgeRequirements: ['application_forms', 'federal_procedures', 'document_requirements']
            }
          ],
          hierarchy: {
            'jasper_main': ['manager_ai'],
            'manager_ai': ['onboarding_agent', 'customer_service_agent_001', 'usdot_rpa_agent']
          },
          communicationFlow: [
            'jasper_main -> manager_ai: Commands and coordination',
            'manager_ai -> all_agents: Knowledge distribution',
            'onboarding_agent -> usdot_rpa_agent: Process triggers',
            'customer_service_agent -> onboarding_agent: Client handoffs'
          ]
        },
        applicableAgents: ['manager_ai', 'jasper_main'],
        uploadedBy: 'system',
        version: 1,
        isActive: true
      };

      this.knowledgeBase.set('agent_reference', {
        ...agentReference,
        uploadedAt: new Date()
      });
    } catch (error) {
      console.error('Error loading agent reference:', error);
    }
  }

  public static getInstance(): ManagerAIKnowledgeBase {
    if (!ManagerAIKnowledgeBase.instance) {
      ManagerAIKnowledgeBase.instance = new ManagerAIKnowledgeBase();
    }
    return ManagerAIKnowledgeBase.instance;
  }

  /**
   * Upload qualified states data from Excel file
   */
  public async uploadQualifiedStates(
    file: File, 
    applicableAgents: string[] = []
  ): Promise<{
    success: boolean;
    entryId?: string;
    message: string;
    importedStates?: number;
  }> {
    try {
      const data = await this.parseExcelFile(file);
      const qualifiedStatesData: QualifiedStatesData = {
        states: data,
        lastUpdated: new Date(),
        source: file.name
      };

      const entryId = this.addKnowledgeBaseEntry({
        name: `Qualified States - ${file.name}`,
        type: 'qualified_states',
        data: qualifiedStatesData,
        applicableAgents: applicableAgents.length > 0 ? applicableAgents : this.getDefaultRegulatoryAgents(),
        uploadedBy: 'manager_ai',
        version: 1,
        isActive: true
      });

      // Distribute to applicable agents
      await this.distributeToAgents(entryId);

      return {
        success: true,
        entryId,
        message: `Successfully uploaded ${data.length} qualified states from ${file.name}`,
        importedStates: data.length
      };
    } catch (error) {
      console.error('Error uploading qualified states:', error);
      return {
        success: false,
        message: `Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Upload service requirements data
   */
  public async uploadServiceRequirements(
    file: File,
    applicableAgents: string[] = []
  ): Promise<{
    success: boolean;
    entryId?: string;
    message: string;
  }> {
    try {
      const data = await this.parseServiceRequirementsFile(file);
      const serviceRequirementsData: ServiceRequirementsData = {
        services: data,
        lastUpdated: new Date()
      };

      const entryId = this.addKnowledgeBaseEntry({
        name: `Service Requirements - ${file.name}`,
        type: 'service_requirements',
        data: serviceRequirementsData,
        applicableAgents: applicableAgents.length > 0 ? applicableAgents : this.getDefaultServiceAgents(),
        uploadedBy: 'manager_ai',
        version: 1,
        isActive: true
      });

      // Distribute to applicable agents
      await this.distributeToAgents(entryId);

      return {
        success: true,
        entryId,
        message: `Successfully uploaded service requirements from ${file.name}`
      };
    } catch (error) {
      console.error('Error uploading service requirements:', error);
      return {
        success: false,
        message: `Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Add knowledge base entry
   */
  private addKnowledgeBaseEntry(entry: Omit<KnowledgeBaseEntry, 'id' | 'uploadedAt'>): string {
    const entryId = `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullEntry: KnowledgeBaseEntry = {
      ...entry,
      id: entryId,
      uploadedAt: new Date()
    };

    this.knowledgeBase.set(entryId, fullEntry);
    this.saveToStorage();

    return entryId;
  }

  /**
   * Distribute knowledge to applicable agents
   */
  private async distributeToAgents(entryId: string): Promise<void> {
    const entry = this.knowledgeBase.get(entryId);
    if (!entry) return;

    // Update agent subscriptions
    entry.applicableAgents.forEach(agentId => {
      const currentSubscriptions = this.agentSubscriptions.get(agentId) || [];
      if (!currentSubscriptions.includes(entryId)) {
        this.agentSubscriptions.set(agentId, [...currentSubscriptions, entryId]);
      }
    });

    // In a real implementation, this would communicate with the actual agents
    console.log(`Manager AI: Distributing knowledge base entry ${entryId} to agents:`, entry.applicableAgents);
    
    // Store distribution log
    const distributionLog = {
      entryId,
      distributedTo: entry.applicableAgents,
      distributedAt: new Date(),
      status: 'distributed'
    };

    localStorage.setItem(`kb_distribution_${entryId}`, JSON.stringify(distributionLog));
  }

  /**
   * Parse Excel file for qualified states
   */
  private async parseExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          const lines = data.split('\n');
          const states: any[] = [];

          // Skip header row if present
          const startRow = lines[0]?.toLowerCase().includes('state') ? 1 : 0;

          for (let i = startRow; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Parse CSV line
            const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
            
            if (columns.length >= 4) {
              const state = {
                stateCode: columns[0]?.toUpperCase() || '',
                stateName: columns[1] || '',
                gvwrThreshold: parseInt(columns[2]) || 26000,
                passengerThreshold: parseInt(columns[3]) || 9,
                specialRequirements: columns[4] ? columns[4].split(';').map(r => r.trim()) : [],
                notes: `Imported from ${file.name} - GVWR: ${columns[2]} lbs, Passengers: ${columns[3]}`
              };

              if (state.stateCode && state.stateName) {
                states.push(state);
              }
            }
          }

          resolve(states);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Parse service requirements file
   */
  private async parseServiceRequirementsFile(file: File): Promise<any[]> {
    // Similar parsing logic for service requirements
    // This would parse different file formats for service requirements
    return [];
  }

  /**
   * Get default agents that need regulatory knowledge
   */
  private getDefaultRegulatoryAgents(): string[] {
    return [
      'onboarding_agent',
      'customer_service_agent_001',
      'regulatory_compliance_agent'
    ];
  }

  /**
   * Get default agents that need service requirements knowledge
   */
  private getDefaultServiceAgents(): string[] {
    return [
      'onboarding_agent',
      'sales_agent',
      'customer_service_agent_001'
    ];
  }

  /**
   * Get knowledge base entries for a specific agent
   */
  public getAgentKnowledgeBase(agentId: string): KnowledgeBaseEntry[] {
    const subscribedEntries = this.agentSubscriptions.get(agentId) || [];
    return subscribedEntries
      .map(entryId => this.knowledgeBase.get(entryId))
      .filter((entry): entry is KnowledgeBaseEntry => entry !== undefined && entry.isActive);
  }

  /**
   * Get all knowledge base entries
   */
  public getAllKnowledgeBaseEntries(): KnowledgeBaseEntry[] {
    return Array.from(this.knowledgeBase.values());
  }

  /**
   * Get comprehensive system awareness for Manager AI
   */
  public getManagerAIAwareness(): ManagerAIAwareness {
    const agentReference = this.knowledgeBase.get('agent_reference');
    const agents = agentReference?.data?.agents || [];
    
    const performanceMetrics = Array.from(this.agentPerformance.values());
    const activeAgents = performanceMetrics.filter(metric => metric.status === 'active').length;
    const agentsInTraining = performanceMetrics.filter(metric => metric.status === 'training').length;
    
    const totalInteractions = performanceMetrics.reduce((sum, metric) => sum + metric.totalInteractions, 0);
    const recentActivities = this.agentActivities.slice(-50); // Last 50 activities
    
    // Calculate system health based on performance metrics
    let systemHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
    if (performanceMetrics.length > 0) {
      const avgSuccessRate = performanceMetrics.reduce((sum, metric) => 
        sum + (metric.successfulInteractions / metric.totalInteractions), 0) / performanceMetrics.length;
      
      if (avgSuccessRate < 0.7) systemHealth = 'critical';
      else if (avgSuccessRate < 0.8) systemHealth = 'warning';
      else if (avgSuccessRate < 0.9) systemHealth = 'good';
    }

    return {
      totalAgents: agents.length,
      activeAgents,
      agentsInTraining,
      totalInteractions,
      knowledgeBaseEntries: this.knowledgeBase.size,
      systemHealth,
      recentActivities,
      performanceMetrics,
      alerts: this.alerts.filter(alert => !alert.resolved)
    };
  }

  /**
   * Get agent hierarchy and relationships
   */
  public getAgentHierarchy(): any {
    const agentReference = this.knowledgeBase.get('agent_reference');
    return agentReference?.data?.hierarchy || {};
  }

  /**
   * Get agent communication flow
   */
  public getAgentCommunicationFlow(): string[] {
    const agentReference = this.knowledgeBase.get('agent_reference');
    return agentReference?.data?.communicationFlow || [];
  }

  /**
   * Get detailed agent information
   */
  public getAgentDetails(agentId: string): any {
    const agentReference = this.knowledgeBase.get('agent_reference');
    const agents = agentReference?.data?.agents || [];
    const agent = agents.find((a: any) => a.id === agentId);
    
    if (!agent) return null;
    
    // Add performance metrics if available
    const performance = this.agentPerformance.get(agentId);
    const activities = this.agentActivities.filter(activity => activity.agentId === agentId).slice(-10);
    
    return {
      ...agent,
      performance,
      recentActivities: activities,
      knowledgeSubscriptions: this.agentSubscriptions.get(agentId) || []
    };
  }

  /**
   * Get all agents with their current status
   */
  public getAllAgentsWithStatus(): any[] {
    const agentReference = this.knowledgeBase.get('agent_reference');
    const agents = agentReference?.data?.agents || [];
    
    return agents.map((agent: any) => {
      const performance = this.agentPerformance.get(agent.id);
      return {
        ...agent,
        currentStatus: performance?.status || 'unknown',
        lastActivity: performance?.lastActivity,
        totalInteractions: performance?.totalInteractions || 0,
        successRate: performance ? (performance.successfulInteractions / performance.totalInteractions) : 0
      };
    });
  }

  /**
   * Log agent activity for monitoring
   */
  public logAgentActivity(activity: Omit<AgentActivityLog, 'timestamp'>): void {
    const logEntry: AgentActivityLog = {
      ...activity,
      timestamp: new Date()
    };
    
    this.agentActivities.push(logEntry);
    
    // Keep only last 1000 activities to prevent memory issues
    if (this.agentActivities.length > 1000) {
      this.agentActivities = this.agentActivities.slice(-1000);
    }
    
    // Update performance metrics
    this.updateAgentPerformance(activity.agentId, activity.agentName, activity.success);
    
    console.log(`📊 Agent Activity: ${activity.agentName} - ${activity.activity} (${activity.success ? 'SUCCESS' : 'FAILED'})`);
  }

  /**
   * Update agent performance metrics
   */
  private updateAgentPerformance(agentId: string, agentName: string, success: boolean): void {
    let metrics = this.agentPerformance.get(agentId);
    
    if (!metrics) {
      metrics = {
        agentId,
        agentName,
        totalInteractions: 0,
        successfulInteractions: 0,
        averageResponseTime: 0,
        knowledgeBaseUsage: {},
        lastActivity: new Date(),
        status: 'active',
        capabilities: [],
        currentTask: undefined
      };
    }
    
    metrics.totalInteractions++;
    if (success) metrics.successfulInteractions++;
    metrics.lastActivity = new Date();
    metrics.status = 'active';
    
    this.agentPerformance.set(agentId, metrics);
  }

  /**
   * Start agent monitoring (placeholder for real monitoring)
   */
  private startAgentMonitoring(): void {
    console.log('🔍 Manager AI: Starting agent monitoring system...');
    
    // In a real implementation, this would:
    // - Set up periodic health checks
    // - Monitor agent performance
    // - Track system metrics
    // - Generate alerts when needed
    
    // For now, we'll simulate some monitoring
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Perform system health check
   */
  private performHealthCheck(): void {
    const awareness = this.getManagerAIAwareness();
    
    // Check for agents that haven't been active recently
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const [agentId, metrics] of this.agentPerformance) {
      const timeSinceLastActivity = now.getTime() - metrics.lastActivity.getTime();
      
      if (timeSinceLastActivity > inactiveThreshold && metrics.status === 'active') {
        metrics.status = 'idle';
        console.log(`⚠️ Manager AI: Agent ${metrics.agentName} has been idle for ${Math.round(timeSinceLastActivity / 60000)} minutes`);
      }
    }
    
    // Log system health
    if (awareness.systemHealth === 'critical' || awareness.systemHealth === 'warning') {
      console.log(`🚨 Manager AI: System health is ${awareness.systemHealth.toUpperCase()}`);
    }
  }

  /**
   * Update agent subscriptions for knowledge base entries
   */
  public updateAgentSubscriptions(agentId: string, knowledgeBaseIds: string[]): void {
    this.agentSubscriptions.set(agentId, knowledgeBaseIds);
    this.saveToStorage();
  }

  /**
   * Remove knowledge base entry
   */
  public removeKnowledgeBaseEntry(entryId: string): boolean {
    const entry = this.knowledgeBase.get(entryId);
    if (!entry) return false;

    // Mark as inactive instead of deleting
    entry.isActive = false;
    this.saveToStorage();
    return true;
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    const data = {
      knowledgeBase: Array.from(this.knowledgeBase.entries()),
      agentSubscriptions: Array.from(this.agentSubscriptions.entries())
    };
    localStorage.setItem('manager_ai_knowledge_base', JSON.stringify(data));
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    const stored = localStorage.getItem('manager_ai_knowledge_base');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.knowledgeBase = new Map(data.knowledgeBase || []);
        this.agentSubscriptions = new Map(data.agentSubscriptions || []);
      } catch (error) {
        console.error('Error loading knowledge base from storage:', error);
      }
    }
  }

  /**
   * Get distribution status for an entry
   */
  public getDistributionStatus(entryId: string): any {
    const stored = localStorage.getItem(`kb_distribution_${entryId}`);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Get knowledge base statistics
   */
  public getKnowledgeBaseStats(): {
    totalEntries: number;
    activeEntries: number;
    entriesByType: Record<string, number>;
    totalAgents: number;
  } {
    const entries = Array.from(this.knowledgeBase.values());
    const activeEntries = entries.filter(e => e.isActive);
    
    const entriesByType: Record<string, number> = {};
    entries.forEach(entry => {
      entriesByType[entry.type] = (entriesByType[entry.type] || 0) + 1;
    });

    return {
      totalEntries: entries.length,
      activeEntries: activeEntries.length,
      entriesByType,
      totalAgents: this.agentSubscriptions.size
    };
  }
}
