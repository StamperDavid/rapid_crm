export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'agent';
  timestamp: string;
  type: 'text' | 'system' | 'handoff_request' | 'file' | 'image';
  metadata?: {
    agentId?: string;
    agentName?: string;
    confidence?: number;
    intent?: string;
    entities?: Record<string, any>;
  };
}

export interface Conversation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName?: string;
  status: 'active' | 'waiting_for_agent' | 'handed_off' | 'resolved' | 'closed';
  agentType: 'onboarding' | 'customer_service' | 'sales' | 'support';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startedAt: string;
  lastMessageAt: string;
  messages: Message[];
  assignedAgent?: string;
  assignedAgentName?: string;
  tags: string[];
  context: {
    source: string;
    intent?: string;
    companyId?: string;
    dealId?: string;
    userId?: string;
    sessionId?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
  };
  metrics?: {
    responseTime?: number;
    resolutionTime?: number;
    customerSatisfaction?: number;
    aiConfidence?: number;
  };
  escalation?: {
    reason?: string;
    escalatedAt?: string;
    escalatedBy?: string;
    previousAgent?: string;
  };
}

export interface ConversationFilters {
  status?: string;
  agentType?: string;
  priority?: string;
  assignedAgent?: string;
  search?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export interface ConversationStats {
  total: number;
  active: number;
  waitingForAgent: number;
  handedOff: number;
  resolved: number;
  closed: number;
  averageResponseTime?: number;
  averageResolutionTime?: number;
  customerSatisfactionScore?: number;
}

export interface PaginatedConversations {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ConversationEvent {
  type: 'new_message' | 'conversation_updated' | 'conversation_created' | 'handoff_request' | 'agent_assigned' | 'conversation_closed';
  conversationId: string;
  data: any;
  timestamp: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  currentConversations: number;
  maxConversations: number;
  skills: string[];
  languages: string[];
  lastActive: string;
}

export interface ConversationTemplate {
  id: string;
  name: string;
  description: string;
  agentType: string;
  initialMessage: string;
  suggestedResponses: string[];
  escalationTriggers: string[];
  tags: string[];
}
