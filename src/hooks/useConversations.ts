import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, ConversationFilters, ConversationStats } from '../types/conversation';
import { conversationService, ConversationEvent } from '../services/conversations';

export interface UseConversationsReturn {
  conversations: Conversation[];
  messages: Map<string, Message[]>;
  stats: ConversationStats | null;
  loading: boolean;
  error: string | null;
  selectedConversation: Conversation | null;
  realTimeEvents: ConversationEvent[];
  
  // Actions
  createConversation: (conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Conversation>;
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<Conversation | null>;
  deleteConversation: (id: string) => Promise<boolean>;
  assignAgent: (conversationId: string, agentId: string) => Promise<boolean>;
  updateStatus: (conversationId: string, status: Conversation['status']) => Promise<boolean>;
  
  // Messages
  sendMessage: (conversationId: string, content: string, senderId: string, senderType: 'user' | 'agent') => Promise<Message>;
  getMessages: (conversationId: string) => Promise<Message[]>;
  
  // Filters and search
  applyFilters: (filters: ConversationFilters) => Promise<void>;
  clearFilters: () => Promise<void>;
  
  // Real-time
  subscribeToConversation: (conversationId: string, callback: (event: ConversationEvent) => void) => () => void;
  
  // Utilities
  refreshConversations: () => Promise<void>;
  selectConversation: (conversation: Conversation | null) => void;
}

export const useConversations = (): UseConversationsReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map());
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [realTimeEvents, setRealTimeEvents] = useState<ConversationEvent[]>([]);
  const [currentFilters, setCurrentFilters] = useState<ConversationFilters | null>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    loadStats();
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await conversationService.getConversations(currentFilters || undefined);
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  const loadStats = useCallback(async () => {
    try {
      const data = await conversationService.getConversationStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load conversation stats:', err);
    }
  }, []);

  const createConversation = useCallback(async (conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> => {
    try {
      const newConversation = await conversationService.createConversation(conversation);
      setConversations(prev => [newConversation, ...prev]);
      await loadStats();
      return newConversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      throw err;
    }
  }, [loadStats]);

  const updateConversation = useCallback(async (id: string, updates: Partial<Conversation>): Promise<Conversation | null> => {
    try {
      const updated = await conversationService.updateConversation(id, updates);
      if (updated) {
        setConversations(prev => prev.map(conv => conv.id === id ? updated : conv));
        if (selectedConversation?.id === id) {
          setSelectedConversation(updated);
        }
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update conversation');
      return null;
    }
  }, [selectedConversation]);

  const deleteConversation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const deleted = await conversationService.deleteConversation(id);
      if (deleted) {
        setConversations(prev => prev.filter(conv => conv.id !== id));
        if (selectedConversation?.id === id) {
          setSelectedConversation(null);
        }
        await loadStats();
      }
      return deleted;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
      return false;
    }
  }, [selectedConversation, loadStats]);

  const assignAgent = useCallback(async (conversationId: string, agentId: string): Promise<boolean> => {
    try {
      const success = await conversationService.assignAgent(conversationId, agentId);
      if (success) {
        await loadConversations();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign agent');
      return false;
    }
  }, [loadConversations]);

  const updateStatus = useCallback(async (conversationId: string, status: Conversation['status']): Promise<boolean> => {
    try {
      const success = await conversationService.updateStatus(conversationId, status);
      if (success) {
        await loadConversations();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      return false;
    }
  }, [loadConversations]);

  const sendMessage = useCallback(async (conversationId: string, content: string, senderId: string, senderType: 'user' | 'agent'): Promise<Message> => {
    try {
      const message = await conversationService.addMessage({
        content,
        senderId,
        senderType,
        metadata: {}
      });

      // Update local messages state
      setMessages(prev => {
        const newMessages = new Map(prev);
        const conversationMessages = newMessages.get(conversationId) || [];
        newMessages.set(conversationId, [...conversationMessages, message]);
        return newMessages;
      });

      // Update conversation in list
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: content, updatedAt: new Date().toISOString() }
          : conv
      ));

      return message;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, []);

  const getMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    try {
      const conversationMessages = await conversationService.getMessages(conversationId);
      
      // Update local messages state
      setMessages(prev => {
        const newMessages = new Map(prev);
        newMessages.set(conversationId, conversationMessages);
        return newMessages;
      });

      return conversationMessages;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      return [];
    }
  }, []);

  const applyFilters = useCallback(async (filters: ConversationFilters): Promise<void> => {
    setCurrentFilters(filters);
    await loadConversations();
  }, [loadConversations]);

  const clearFilters = useCallback(async (): Promise<void> => {
    setCurrentFilters(null);
    await loadConversations();
  }, [loadConversations]);

  const subscribeToConversation = useCallback((conversationId: string, callback: (event: ConversationEvent) => void): (() => void) => {
    const subscription = conversationService.subscribeToConversation(conversationId, (event) => {
      setRealTimeEvents(prev => [...prev.slice(-9), event]); // Keep last 10 events
      callback(event);
    });

    return subscription.unsubscribe;
  }, []);

  const refreshConversations = useCallback(async (): Promise<void> => {
    await loadConversations();
    await loadStats();
  }, [loadConversations, loadStats]);

  const selectConversation = useCallback((conversation: Conversation | null): void => {
    setSelectedConversation(conversation);
    if (conversation) {
      getMessages(conversation.id);
    }
  }, [getMessages]);

  return {
    conversations,
    messages,
    stats,
    loading,
    error,
    selectedConversation,
    realTimeEvents,
    createConversation,
    updateConversation,
    deleteConversation,
    assignAgent,
    updateStatus,
    sendMessage,
    getMessages,
    applyFilters,
    clearFilters,
    subscribeToConversation,
    refreshConversations,
    selectConversation
  };
};
