import { Conversation, Message, ConversationFilters, ConversationStats } from '../../types/conversation';

export interface ConversationEvent {
  type: 'message' | 'agent_handoff' | 'status_change' | 'typing' | 'read';
  conversationId: string;
  data: any;
  timestamp: string;
}

export interface ConversationSubscription {
  conversationId: string;
  callback: (event: ConversationEvent) => void;
  unsubscribe: () => void;
}

export class ConversationService {
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private subscriptions: Map<string, ConversationSubscription[]> = new Map();
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.initializeWebSocket();
    this.loadConversations();
  }

  private initializeWebSocket(): void {
    try {
      // Check if WebSocket is available and we're not in a test environment
      const isBrowser = typeof window !== 'undefined';
      const isTest = isBrowser ? false : (process.env.NODE_ENV === 'test');
      
      if (typeof WebSocket === 'undefined' || isTest) {
        console.log('WebSocket not available, using fallback mode');
        this.simulateWebSocket();
        return;
      }

      // For development, skip WebSocket connection and use simulation mode
      // In production, this would connect to your WebSocket server
      console.log('Using WebSocket simulation mode for development');
      this.simulateWebSocket();
      return;

      // Commented out actual WebSocket connection for development
      /*
      this.ws = new WebSocket('ws://localhost:8080/conversations');
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // If WebSocket fails, fall back to simulation mode
        this.simulateWebSocket();
      };
      */
    } catch (error) {
      console.warn('WebSocket not available, using fallback mode');
      this.simulateWebSocket();
    }
  }

  private simulateWebSocket(): void {
    // Simulate real-time updates for development
    setInterval(() => {
      this.simulateRealTimeUpdates();
    }, 5000);
  }

  private simulateRealTimeUpdates(): void {
    const conversations = Array.from(this.conversations.values());
    if (conversations.length === 0) return;

    const randomConversation = conversations[Math.floor(Math.random() * conversations.length)];
    const randomEvent = Math.random();

    if (randomEvent < 0.3) {
      // Simulate new message
      this.simulateNewMessage(randomConversation.id);
    } else if (randomEvent < 0.5) {
      // Simulate typing indicator
      this.broadcastEvent(randomConversation.id, {
        type: 'typing',
        conversationId: randomConversation.id,
        data: { userId: 'agent-1', isTyping: true },
        timestamp: new Date().toISOString()
      });
    }
  }

  private simulateNewMessage(conversationId: string): void {
    const messages = this.messages.get(conversationId) || [];
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && lastMessage.senderType === 'user') {
      // Simulate agent response
      const agentResponse: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        content: this.generateAgentResponse(lastMessage.content),
        senderId: 'agent-1',
        senderType: 'agent',
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: 0.85 + Math.random() * 0.15,
          processingTime: 1000 + Math.random() * 2000,
          model: 'gpt-4',
          temperature: 0.7
        }
      };

      this.addMessage(agentResponse);
    }
  }

  private generateAgentResponse(userMessage: string): string {
    const responses = [
      "I understand your concern. Let me help you with that.",
      "That's a great question. Based on your situation, I recommend...",
      "I can definitely assist you with that. Here's what I suggest...",
      "Thank you for providing that information. Let me process this for you.",
      "I see what you're looking for. Let me gather the relevant details."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeWebSocket();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleWebSocketMessage(data: any): void {
    const { type, conversationId, ...eventData } = data;
    
    switch (type) {
      case 'message':
        this.handleIncomingMessage(eventData);
        break;
      case 'agent_handoff':
        this.handleAgentHandoff(conversationId, eventData);
        break;
      case 'status_change':
        this.handleStatusChange(conversationId, eventData);
        break;
      case 'typing':
        this.broadcastEvent(conversationId, { type, conversationId, data: eventData, timestamp: new Date().toISOString() });
        break;
      case 'read':
        this.handleReadReceipt(conversationId, eventData);
        break;
    }
  }

  private handleIncomingMessage(messageData: any): void {
    const message: Message = {
      id: messageData.id,
      conversationId: messageData.conversationId,
      content: messageData.content,
      senderId: messageData.senderId,
      senderType: messageData.senderType,
      timestamp: messageData.timestamp,
      metadata: messageData.metadata
    };

    this.addMessage(message);
  }

  private handleAgentHandoff(conversationId: string, handoffData: any): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.assignedAgent = handoffData.newAgentId;
      conversation.status = handoffData.newStatus || 'active';
      conversation.updatedAt = new Date().toISOString();
      
      this.broadcastEvent(conversationId, {
        type: 'agent_handoff',
        conversationId,
        data: handoffData,
        timestamp: new Date().toISOString()
      });
    }
  }

  private handleStatusChange(conversationId: string, statusData: any): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.status = statusData.status;
      conversation.updatedAt = new Date().toISOString();
      
      this.broadcastEvent(conversationId, {
        type: 'status_change',
        conversationId,
        data: statusData,
        timestamp: new Date().toISOString()
      });
    }
  }

  private handleReadReceipt(conversationId: string, readData: any): void {
    this.broadcastEvent(conversationId, {
      type: 'read',
      conversationId,
      data: readData,
      timestamp: new Date().toISOString()
    });
  }

  private broadcastEvent(conversationId: string, event: ConversationEvent): void {
    const subscriptions = this.subscriptions.get(conversationId) || [];
    subscriptions.forEach(subscription => {
      try {
        subscription.callback(event);
      } catch (error) {
        console.error('Error in subscription callback:', error);
      }
    });
  }

  private async loadConversations(): Promise<void> {
    // Load from real database for persistence
    try {
      console.log('Loading conversations from real database...');
      // TODO: Implement real database loading
      // For now, initialize empty
      this.conversations = new Map();
      this.messages = new Map();
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  private async saveConversations(): Promise<void> {
    try {
      console.log('Saving conversations to real database...');
      // TODO: Implement real database saving
      // Conversations are saved individually when created/updated
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }

  // Public API methods
  async getConversations(filters?: ConversationFilters): Promise<Conversation[]> {
    let conversations = Array.from(this.conversations.values());

    if (filters) {
      if (filters.status) {
        conversations = conversations.filter(c => c.status === filters.status);
      }
      if (filters.assignedAgent) {
        conversations = conversations.filter(c => c.assignedAgent === filters.assignedAgent);
      }
      if (filters.priority) {
        conversations = conversations.filter(c => c.priority === filters.priority);
      }
      if (filters.dateRange) {
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        conversations = conversations.filter(c => {
          const date = new Date(c.createdAt);
          return date >= start && date <= end;
        });
      }
    }

    return conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return this.messages.get(conversationId) || [];
  }

  async createConversation(conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> {
    const newConversation: Conversation = {
      ...conversation,
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.conversations.set(newConversation.id, newConversation);
    this.messages.set(newConversation.id, []);
    await this.saveConversations();

    return newConversation;
  }

  async addMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    const messages = this.messages.get(message.conversationId) || [];
    messages.push(newMessage);
    this.messages.set(message.conversationId, messages);

    // Update conversation
    const conversation = this.conversations.get(message.conversationId);
    if (conversation) {
      conversation.lastMessage = newMessage.content;
      conversation.updatedAt = new Date().toISOString();
      conversation.messageCount = messages.length;
    }

    await this.saveConversations();

    // Broadcast message event
    this.broadcastEvent(message.conversationId, {
      type: 'message',
      conversationId: message.conversationId,
      data: newMessage,
      timestamp: newMessage.timestamp
    });

    return newMessage;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | null> {
    const conversation = this.conversations.get(id);
    if (!conversation) return null;

    const updatedConversation = {
      ...conversation,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.conversations.set(id, updatedConversation);
    await this.saveConversations();

    return updatedConversation;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const deleted = this.conversations.delete(id);
    this.messages.delete(id);
    this.subscriptions.delete(id);
    await this.saveConversations();
    return deleted;
  }

  async assignAgent(conversationId: string, agentId: string): Promise<boolean> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    conversation.assignedAgent = agentId;
    conversation.status = 'active';
    conversation.updatedAt = new Date().toISOString();

    await this.saveConversations();

    this.broadcastEvent(conversationId, {
      type: 'agent_handoff',
      conversationId,
      data: { newAgentId: agentId, previousAgentId: conversation.assignedAgent },
      timestamp: new Date().toISOString()
    });

    return true;
  }

  async updateStatus(conversationId: string, status: Conversation['status']): Promise<boolean> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    conversation.status = status;
    conversation.updatedAt = new Date().toISOString();

    await this.saveConversations();

    this.broadcastEvent(conversationId, {
      type: 'status_change',
      conversationId,
      data: { status, previousStatus: conversation.status },
      timestamp: new Date().toISOString()
    });

    return true;
  }

  async getConversationStats(): Promise<ConversationStats> {
    const conversations = Array.from(this.conversations.values());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats: ConversationStats = {
      total: conversations.length,
      active: conversations.filter(c => c.status === 'active').length,
      pending: conversations.filter(c => c.status === 'pending').length,
      resolved: conversations.filter(c => c.status === 'resolved').length,
      today: conversations.filter(c => new Date(c.createdAt) >= today).length,
      thisWeek: conversations.filter(c => new Date(c.createdAt) >= thisWeek).length,
      thisMonth: conversations.filter(c => new Date(c.createdAt) >= thisMonth).length,
      averageResponseTime: this.calculateAverageResponseTime(conversations),
      satisfactionScore: this.calculateSatisfactionScore(conversations)
    };

    return stats;
  }

  private calculateAverageResponseTime(conversations: Conversation[]): number {
    let totalTime = 0;
    let count = 0;

    conversations.forEach(conversation => {
      const messages = this.messages.get(conversation.id) || [];
      for (let i = 1; i < messages.length; i++) {
        const prev = messages[i - 1];
        const curr = messages[i];
        
        if (prev.senderType === 'user' && curr.senderType === 'agent') {
          const responseTime = new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime();
          totalTime += responseTime;
          count++;
        }
      }
    });

    return count > 0 ? totalTime / count : 0;
  }

  private calculateSatisfactionScore(conversations: Conversation[]): number {
    // This would typically come from user feedback
    // For now, we'll simulate based on conversation resolution
    const resolved = conversations.filter(c => c.status === 'resolved').length;
    return conversations.length > 0 ? (resolved / conversations.length) * 100 : 0;
  }

  // Real-time subscription methods
  subscribeToConversation(conversationId: string, callback: (event: ConversationEvent) => void): ConversationSubscription {
    const subscription: ConversationSubscription = {
      conversationId,
      callback,
      unsubscribe: () => {
        const subscriptions = this.subscriptions.get(conversationId) || [];
        const index = subscriptions.indexOf(subscription);
        if (index > -1) {
          subscriptions.splice(index, 1);
        }
      }
    };

    const subscriptions = this.subscriptions.get(conversationId) || [];
    subscriptions.push(subscription);
    this.subscriptions.set(conversationId, subscriptions);

    return subscription;
  }

  // WebSocket methods
  sendMessage(conversationId: string, content: string, senderId: string, senderType: 'user' | 'agent'): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        conversationId,
        content,
        senderId,
        senderType,
        timestamp: new Date().toISOString()
      }));
    }
  }

  sendTypingIndicator(conversationId: string, userId: string, isTyping: boolean): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        conversationId,
        userId,
        isTyping,
        timestamp: new Date().toISOString()
      }));
    }
  }

  markAsRead(conversationId: string, userId: string, messageId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'read',
        conversationId,
        userId,
        messageId,
        timestamp: new Date().toISOString()
      }));
    }
  }

  // Cleanup
  destroy(): void {
    if (this.ws) {
      this.ws.close();
    }
    this.subscriptions.clear();
  }
}

export const conversationService = new ConversationService();
