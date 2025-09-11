import { Conversation } from '../../types/conversation';

export interface HandoffRule {
  id: string;
  name: string;
  conditions: {
    conversationType?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    keywords?: string[];
    customerTier?: 'basic' | 'premium' | 'enterprise';
    timeOfDay?: string;
    agentWorkload?: number;
  };
  targetAgent: string;
  escalationPath?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HandoffRequest {
  id: string;
  conversationId: string;
  fromAgent: string;
  toAgent: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requestedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface AgentAvailability {
  agentId: string;
  isOnline: boolean;
  currentWorkload: number;
  maxWorkload: number;
  skills: string[];
  specializations: string[];
  lastActive: string;
  status: 'available' | 'busy' | 'away' | 'offline';
}

export class AgentHandoffService {
  private handoffRules: Map<string, HandoffRule> = new Map();
  private handoffRequests: Map<string, HandoffRequest> = new Map();
  private agentAvailability: Map<string, AgentAvailability> = new Map();

  constructor() {
    this.loadData();
    this.initializeDefaultRules();
  }

  private loadData(): void {
    try {
      const stored = localStorage.getItem('rapid_crm_handoff_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.handoffRules = new Map(data.handoffRules || []);
        this.handoffRequests = new Map(data.handoffRequests || []);
        this.agentAvailability = new Map(data.agentAvailability || []);
      }
    } catch (error) {
      console.error('Error loading handoff data:', error);
    }
  }

  private saveData(): void {
    try {
      const data = {
        handoffRules: Array.from(this.handoffRules.entries()),
        handoffRequests: Array.from(this.handoffRequests.entries()),
        agentAvailability: Array.from(this.agentAvailability.entries())
      };
      localStorage.setItem('rapid_crm_handoff_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving handoff data:', error);
    }
  }

  private initializeDefaultRules(): void {
    const defaultRules: HandoffRule[] = [
      {
        id: 'rule-1',
        name: 'USDOT Application Specialist',
        conditions: {
          keywords: ['USDOT', 'application', 'registration', 'FMCSA'],
          priority: 'high'
        },
        targetAgent: 'agent-usdot-specialist',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rule-2',
        name: 'Premium Customer Escalation',
        conditions: {
          customerTier: 'premium',
          priority: 'urgent'
        },
        targetAgent: 'agent-premium-support',
        escalationPath: ['agent-senior-support', 'agent-manager'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rule-3',
        name: 'Technical Issues',
        conditions: {
          keywords: ['technical', 'bug', 'error', 'system'],
          priority: 'medium'
        },
        targetAgent: 'agent-technical-support',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    defaultRules.forEach(rule => {
      if (!this.handoffRules.has(rule.id)) {
        this.handoffRules.set(rule.id, rule);
      }
    });

    this.saveData();
  }

  // Handoff Rules Management
  async getHandoffRules(): Promise<HandoffRule[]> {
    return Array.from(this.handoffRules.values())
      .filter(rule => rule.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createHandoffRule(rule: Omit<HandoffRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<HandoffRule> {
    const newRule: HandoffRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.handoffRules.set(newRule.id, newRule);
    this.saveData();
    return newRule;
  }

  async updateHandoffRule(id: string, updates: Partial<HandoffRule>): Promise<HandoffRule | null> {
    const rule = this.handoffRules.get(id);
    if (!rule) return null;

    const updatedRule = {
      ...rule,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.handoffRules.set(id, updatedRule);
    this.saveData();
    return updatedRule;
  }

  async deleteHandoffRule(id: string): Promise<boolean> {
    const deleted = this.handoffRules.delete(id);
    this.saveData();
    return deleted;
  }

  // Agent Availability Management
  async getAgentAvailability(agentId?: string): Promise<AgentAvailability[]> {
    if (agentId) {
      const agent = this.agentAvailability.get(agentId);
      return agent ? [agent] : [];
    }
    return Array.from(this.agentAvailability.values());
  }

  async updateAgentAvailability(agentId: string, availability: Partial<AgentAvailability>): Promise<AgentAvailability> {
    const current = this.agentAvailability.get(agentId) || {
      agentId,
      isOnline: false,
      currentWorkload: 0,
      maxWorkload: 10,
      skills: [],
      specializations: [],
      lastActive: new Date().toISOString(),
      status: 'offline'
    };

    const updated: AgentAvailability = {
      ...current,
      ...availability,
      lastActive: new Date().toISOString()
    };

    this.agentAvailability.set(agentId, updated);
    this.saveData();
    return updated;
  }

  // Handoff Request Management
  async createHandoffRequest(request: Omit<HandoffRequest, 'id' | 'requestedAt' | 'status'>): Promise<HandoffRequest> {
    const newRequest: HandoffRequest = {
      ...request,
      id: `handoff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    this.handoffRequests.set(newRequest.id, newRequest);
    this.saveData();
    return newRequest;
  }

  async getHandoffRequests(status?: HandoffRequest['status']): Promise<HandoffRequest[]> {
    let requests = Array.from(this.handoffRequests.values());
    
    if (status) {
      requests = requests.filter(r => r.status === status);
    }
    
    return requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  async updateHandoffRequest(id: string, updates: Partial<HandoffRequest>): Promise<HandoffRequest | null> {
    const request = this.handoffRequests.get(id);
    if (!request) return null;

    const updatedRequest = {
      ...request,
      ...updates,
      completedAt: updates.status === 'completed' ? new Date().toISOString() : request.completedAt
    };

    this.handoffRequests.set(id, updatedRequest);
    this.saveData();
    return updatedRequest;
  }

  // Smart Handoff Logic
  async findBestAgent(conversation: Conversation): Promise<string | null> {
    const availableAgents = await this.getAgentAvailability();
    const onlineAgents = availableAgents.filter(agent => 
      agent.isOnline && 
      agent.status === 'available' && 
      agent.currentWorkload < agent.maxWorkload
    );

    if (onlineAgents.length === 0) {
      return null;
    }

    // Apply handoff rules
    const applicableRules = await this.getApplicableRules(conversation);
    
    for (const rule of applicableRules) {
      const targetAgent = onlineAgents.find(agent => agent.agentId === rule.targetAgent);
      if (targetAgent) {
        return targetAgent.agentId;
      }
    }

    // Fallback to least busy agent
    const leastBusyAgent = onlineAgents.reduce((prev, current) => 
      prev.currentWorkload < current.currentWorkload ? prev : current
    );

    return leastBusyAgent.agentId;
  }

  private async getApplicableRules(conversation: Conversation): Promise<HandoffRule[]> {
    const rules = await this.getHandoffRules();
    const applicableRules: HandoffRule[] = [];

    for (const rule of rules) {
      if (this.ruleMatches(rule, conversation)) {
        applicableRules.push(rule);
      }
    }

    return applicableRules;
  }

  private ruleMatches(rule: HandoffRule, conversation: Conversation): boolean {
    const conditions = rule.conditions;

    // Check priority
    if (conditions.priority && conversation.priority !== conditions.priority) {
      return false;
    }

    // Check keywords in conversation content
    if (conditions.keywords && conditions.keywords.length > 0) {
      const content = (conversation.lastMessage || '').toLowerCase();
      const hasKeyword = conditions.keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) {
        return false;
      }
    }

    // Check customer tier (if available in conversation metadata)
    if (conditions.customerTier) {
      // This would typically come from customer data
      // For now, we'll skip this check
    }

    // Check time of day
    if (conditions.timeOfDay) {
      const currentHour = new Date().getHours();
      const [startHour, endHour] = conditions.timeOfDay.split('-').map(Number);
      if (currentHour < startHour || currentHour > endHour) {
        return false;
      }
    }

    return true;
  }

  // Handoff Execution
  async executeHandoff(conversationId: string, fromAgent: string, toAgent: string, reason: string): Promise<HandoffRequest> {
    const request = await this.createHandoffRequest({
      conversationId,
      fromAgent,
      toAgent,
      reason,
      priority: 'medium'
    });

    // Update agent workloads
    await this.updateAgentAvailability(fromAgent, {
      currentWorkload: Math.max(0, (this.agentAvailability.get(fromAgent)?.currentWorkload || 0) - 1)
    });

    await this.updateAgentAvailability(toAgent, {
      currentWorkload: (this.agentAvailability.get(toAgent)?.currentWorkload || 0) + 1
    });

    return request;
  }

  // Analytics
  async getHandoffAnalytics(): Promise<{
    totalHandoffs: number;
    successfulHandoffs: number;
    averageHandoffTime: number;
    topReasons: Array<{ reason: string; count: number }>;
    agentWorkload: Array<{ agentId: string; workload: number }>;
  }> {
    const requests = Array.from(this.handoffRequests.values());
    const completed = requests.filter(r => r.status === 'completed');
    
    const totalHandoffs = requests.length;
    const successfulHandoffs = completed.length;
    
    const averageHandoffTime = completed.length > 0 
      ? completed.reduce((sum, req) => {
          const duration = new Date(req.completedAt!).getTime() - new Date(req.requestedAt).getTime();
          return sum + duration;
        }, 0) / completed.length
      : 0;

    const reasonCounts = new Map<string, number>();
    requests.forEach(req => {
      reasonCounts.set(req.reason, (reasonCounts.get(req.reason) || 0) + 1);
    });

    const topReasons = Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const agentWorkload = Array.from(this.agentAvailability.values())
      .map(agent => ({ agentId: agent.agentId, workload: agent.currentWorkload }))
      .sort((a, b) => b.workload - a.workload);

    return {
      totalHandoffs,
      successfulHandoffs,
      averageHandoffTime,
      topReasons,
      agentWorkload
    };
  }
}

export const agentHandoffService = new AgentHandoffService();
