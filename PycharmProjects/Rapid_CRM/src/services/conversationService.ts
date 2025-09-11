// Conversation Service for scalable conversation management
import { Conversation, Message } from '../types/conversation';

export interface ConversationFilters {
  status?: string;
  agentType?: string;
  priority?: string;
  assignedAgent?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ConversationStats {
  total: number;
  active: number;
  waitingForAgent: number;
  handedOff: number;
  resolved: number;
  closed: number;
}

export interface PaginatedConversations {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

class ConversationService {
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(baseUrl: string = '/api/conversations') {
    this.baseUrl = baseUrl;
  }

  // WebSocket connection for real-time updates
  connectWebSocket(): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) return;

    const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onopen = () => {
      console.log('Conversation WebSocket connected');
      this.emit('connected');
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.wsConnection.onclose = () => {
      console.log('Conversation WebSocket disconnected');
      this.emit('disconnected');
      // Reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(), 5000);
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'new_message':
        this.emit('newMessage', data.conversationId, data.message);
        break;
      case 'conversation_updated':
        this.emit('conversationUpdated', data.conversation);
        break;
      case 'conversation_created':
        this.emit('conversationCreated', data.conversation);
        break;
      case 'handoff_request':
        this.emit('handoffRequest', data.conversationId, data.message);
        break;
      case 'agent_assigned':
        this.emit('agentAssigned', data.conversationId, data.agentId);
        break;
    }
  }

  // Event system for real-time updates
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  public emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(...args));
    }
  }

  // API Methods
  async getConversations(filters: ConversationFilters = {}): Promise<PaginatedConversations> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    return response.json();
  }

  async getConversation(id: string): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }
    return response.json();
  }

  async getConversationMessages(
    conversationId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<{ messages: Message[]; hasMore: boolean; total: number }> {
    const response = await fetch(
      `${this.baseUrl}/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }
    return response.json();
  }

  async sendMessage(conversationId: string, content: string, sender: 'agent' | 'ai'): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, sender }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.json();
  }

  async takeOverConversation(conversationId: string, agentId: string): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/${conversationId}/takeover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agentId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to take over conversation: ${response.statusText}`);
    }

    return response.json();
  }

  async updateConversationStatus(
    conversationId: string, 
    status: Conversation['status']
  ): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/${conversationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update conversation status: ${response.statusText}`);
    }

    return response.json();
  }

  async getConversationStats(): Promise<ConversationStats> {
    const response = await fetch(`${this.baseUrl}/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation stats: ${response.statusText}`);
    }
    return response.json();
  }

  async searchConversations(query: string, filters: ConversationFilters = {}): Promise<PaginatedConversations> {
    return this.getConversations({ ...filters, search: query });
  }

  // Cleanup
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.eventListeners.clear();
  }
}

// Singleton instance
export const conversationService = new ConversationService();

// Mock implementation for development
export class MockConversationService extends ConversationService {
  private conversations: Conversation[] = [];
  private messageIdCounter = 1;
  private conversationIdCounter = 1;

  constructor() {
    super();
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with some mock data
    this.conversations = [
      {
        id: '1',
        customerName: 'John Smith',
        customerEmail: 'john.smith@acmetrans.com',
        customerPhone: '(555) 123-4567',
        companyName: 'Acme Transportation',
        status: 'waiting_for_agent',
        agentType: 'onboarding',
        priority: 'high',
        startedAt: '2024-01-20T10:30:00Z',
        lastMessageAt: '2024-01-20T11:15:00Z',
        tags: ['new-customer', 'onboarding', 'urgent'],
        context: {
          source: 'website',
          intent: 'onboarding',
          companyId: '1'
        },
        messages: [
          {
            id: '1',
            content: 'Hi, I need help getting started with your transportation services.',
            sender: 'user',
            timestamp: '2024-01-20T10:30:00Z',
            type: 'text'
          },
          {
            id: '2',
            content: 'Hello John! I\'m your AI onboarding assistant. I\'d be happy to help you get started with our transportation services.',
            sender: 'ai',
            timestamp: '2024-01-20T10:30:15Z',
            type: 'text'
          }
        ]
      }
    ];
  }

  async getConversations(filters: ConversationFilters = {}): Promise<PaginatedConversations> {
    let filtered = [...this.conversations];

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    if (filters.agentType && filters.agentType !== 'all') {
      filtered = filtered.filter(c => c.agentType === filters.agentType);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.customerName.toLowerCase().includes(search) ||
        c.customerEmail.toLowerCase().includes(search) ||
        c.companyName?.toLowerCase().includes(search)
      );
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      conversations: paginated,
      total: filtered.length,
      page,
      limit,
      hasMore: endIndex < filtered.length
    };
  }

  async getConversation(id: string): Promise<Conversation> {
    const conversation = this.conversations.find(c => c.id === id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    return conversation;
  }

  async sendMessage(conversationId: string, content: string, sender: 'agent' | 'ai'): Promise<Message> {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const message: Message = {
      id: (this.messageIdCounter++).toString(),
      content,
      sender,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    conversation.messages.push(message);
    conversation.lastMessageAt = message.timestamp;

    // Simulate real-time update
    setTimeout(() => {
      this.emit('newMessage', conversationId, message);
    }, 100);

    return message;
  }

  async takeOverConversation(conversationId: string, agentId: string): Promise<Conversation> {
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.status = 'handed_off';
    conversation.assignedAgent = agentId;

    // Simulate real-time update
    setTimeout(() => {
      this.emit('conversationUpdated', conversation);
    }, 100);

    return conversation;
  }

  async getConversationStats(): Promise<ConversationStats> {
    const stats = {
      total: this.conversations.length,
      active: this.conversations.filter(c => c.status === 'active').length,
      waitingForAgent: this.conversations.filter(c => c.status === 'waiting_for_agent').length,
      handedOff: this.conversations.filter(c => c.status === 'handed_off').length,
      resolved: this.conversations.filter(c => c.status === 'resolved').length,
      closed: this.conversations.filter(c => c.status === 'closed').length,
    };

    return stats;
  }

  // Simulate new conversations being created
  simulateNewConversation(): void {
    const newConversation: Conversation = {
      id: (this.conversationIdCounter++).toString(),
      customerName: `Customer ${this.conversationIdCounter}`,
      customerEmail: `customer${this.conversationIdCounter}@example.com`,
      companyName: `Company ${this.conversationIdCounter}`,
      status: 'active',
      agentType: Math.random() > 0.5 ? 'onboarding' : 'customer_service',
      priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any,
      startedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      tags: ['new'],
      context: {
        source: 'website',
        intent: 'general'
      },
      messages: [
        {
          id: (this.messageIdCounter++).toString(),
          content: 'Hello, I need help with my account.',
          sender: 'user',
          timestamp: new Date().toISOString(),
          type: 'text'
        }
      ]
    };

    this.conversations.unshift(newConversation);
    this.emit('conversationCreated', newConversation);
  }
}

// Export mock service for development
export const mockConversationService = new MockConversationService();
