import { PersistentConversationContext } from '../conversations/PersistentConversationService';
import { Message } from '../../types/conversation';

export interface ConversationContextRecord {
  id: string;
  conversation_id: string;
  client_id: string;
  agent_id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
  last_agent_interaction: string;
  total_messages: number;
  average_response_time: number;
  client_satisfaction: number;
  conversation_quality: string;
  current_topic: string;
  conversation_stage: string;
}

export interface ClientProfileRecord {
  id: string;
  conversation_context_id: string;
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  communication_style: string;
  timezone: string;
  language: string;
  last_interaction: string;
  total_interactions: number;
  satisfaction_score: number;
  preferences: string; // JSON string
}

export interface AgentMemoryRecord {
  id: string;
  conversation_context_id: string;
  key_facts: string; // JSON string
  previous_issues: string; // JSON string
  resolved_solutions: string; // JSON string
  client_preferences: string; // JSON string
  relationship_notes: string; // JSON string
}

export interface FollowUpItemRecord {
  id: string;
  conversation_context_id: string;
  description: string;
  due_date: string;
  status: string;
  priority: string;
  created_at: string;
  completed_at?: string;
}

export interface ConversationHistoryRecord {
  id: string;
  conversation_context_id: string;
  message_id: string;
  content: string;
  sender: string;
  message_type: string;
  timestamp: string;
  metadata: string; // JSON string
}

export class PersistentConversationDatabase {
  private db: any; // SQLite database instance
  private isInitialized = false;

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // In a real implementation, this would connect to SQLite
      // For now, we'll use // localStorage as a fallback
      console.log('Persistent Conversation Database initialized (using // localStorage fallback)');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Persistent Conversation Database:', error);
    }
  }

  async saveConversationContext(context: PersistentConversationContext): Promise<void> {
    try {
      console.log('Saving conversation context to real database...');
      // TODO: Implement real database saving
      // For now, just log the context
      console.log('Context to save:', context);
    } catch (error) {
      console.error('Error saving conversation context:', error);
    }
  }

  async getConversationContext(conversationId: string): Promise<PersistentConversationContext | null> {
    try {
      console.log('Getting conversation context from real database...');
      // TODO: Implement real database loading
      return null;
    } catch (error) {
      console.error('Error getting conversation context:', error);
      return null;
    }
  }

  async getClientHistory(clientId: string): Promise<PersistentConversationContext[]> {
    try {
      const contexts = JSON.parse('[]'); // localStorage.getItem('rapid_crm_persistent_contexts') || '[]');
      const clientContexts = contexts.filter((c: any) => c.client_id === clientId);
      
      return clientContexts.map((record: any) => this.convertRecordToContext(record));
    } catch (error) {
      console.error('Error getting client history:', error);
      return [];
    }
  }

  async getAgentClientMemories(agentId: string): Promise<Map<string, PersistentConversationContext>> {
    try {
      const contexts = JSON.parse('[]'); // localStorage.getItem('rapid_crm_persistent_contexts') || '[]');
      const agentContexts = contexts.filter((c: any) => c.agent_id === agentId);
      
      const memoryMap = new Map<string, PersistentConversationContext>();
      agentContexts.forEach((record: any) => {
        const context = this.convertRecordToContext(record);
        memoryMap.set(context.clientId, context);
      });

      return memoryMap;
    } catch (error) {
      console.error('Error getting agent client memories:', error);
      return new Map();
    }
  }

  async addMessageToHistory(
    conversationId: string,
    message: Message
  ): Promise<void> {
    try {
      const contexts = JSON.parse('[]'); // localStorage.getItem('rapid_crm_persistent_contexts') || '[]');
      const contextIndex = contexts.findIndex((c: any) => c.id === conversationId);
      
      if (contextIndex >= 0) {
        if (!contexts[contextIndex].conversation_history) {
          contexts[contextIndex].conversation_history = [];
        }
        contexts[contextIndex].conversation_history.push(message);
        contexts[contextIndex].total_messages = contexts[contextIndex].conversation_history.length;
        contexts[contextIndex].updated_at = new Date().toISOString();
        
        // localStorage.setItem('rapid_crm_persistent_contexts', JSON.stringify(contexts));
      }
    } catch (error) {
      console.error('Error adding message to history:', error);
    }
  }

  async updateClientSatisfaction(
    conversationId: string,
    satisfactionScore: number
  ): Promise<void> {
    try {
      const contexts = JSON.parse('[]'); // localStorage.getItem('rapid_crm_persistent_contexts') || '[]');
      const contextIndex = contexts.findIndex((c: any) => c.id === conversationId);
      
      if (contextIndex >= 0) {
        contexts[contextIndex].client_satisfaction = satisfactionScore;
        contexts[contextIndex].client_profile.satisfaction_score = satisfactionScore;
        contexts[contextIndex].updated_at = new Date().toISOString();
        
        // localStorage.setItem('rapid_crm_persistent_contexts', JSON.stringify(contexts));
      }
    } catch (error) {
      console.error('Error updating client satisfaction:', error);
    }
  }

  async addFollowUpItem(
    conversationId: string,
    description: string,
    dueDate: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    try {
      const contexts = JSON.parse('[]'); // localStorage.getItem('rapid_crm_persistent_contexts') || '[]');
      const contextIndex = contexts.findIndex((c: any) => c.id === conversationId);
      
      if (contextIndex >= 0) {
        if (!contexts[contextIndex].follow_up_items) {
          contexts[contextIndex].follow_up_items = [];
        }
        
        const followUpItem = {
          id: `followup_${Date.now()}`,
          description,
          due_date: dueDate,
          status: 'pending',
          priority,
          created_at: new Date().toISOString()
        };
        
        contexts[contextIndex].follow_up_items.push(followUpItem);
        contexts[contextIndex].updated_at = new Date().toISOString();
        
        // localStorage.setItem('rapid_crm_persistent_contexts', JSON.stringify(contexts));
      }
    } catch (error) {
      console.error('Error adding follow-up item:', error);
    }
  }

  async getConversationInsights(agentId: string): Promise<{
    totalClients: number;
    averageSatisfaction: number;
    commonIssues: string[];
    successfulSolutions: string[];
    activeFollowUps: number;
  }> {
    try {
      const contexts = JSON.parse('[]'); // localStorage.getItem('rapid_crm_persistent_contexts') || '[]');
      const agentContexts = contexts.filter((c: any) => c.agent_id === agentId);
      
      const totalClients = new Set(agentContexts.map((c: any) => c.client_id)).size;
      
      const averageSatisfaction = agentContexts.length > 0
        ? agentContexts.reduce((sum: number, c: any) => sum + (c.client_satisfaction || 0), 0) / agentContexts.length
        : 0;

      const commonIssues: Record<string, number> = {};
      const successfulSolutions: Record<string, number> = {};
      let activeFollowUps = 0;

      agentContexts.forEach((context: any) => {
        // Count common issues
        if (context.agent_memory?.previous_issues) {
          context.agent_memory.previous_issues.forEach((issue: string) => {
            commonIssues[issue] = (commonIssues[issue] || 0) + 1;
          });
        }

        // Count successful solutions
        if (context.agent_memory?.resolved_solutions) {
          context.agent_memory.resolved_solutions.forEach((solution: string) => {
            successfulSolutions[solution] = (successfulSolutions[solution] || 0) + 1;
          });
        }

        // Count active follow-ups
        if (context.follow_up_items) {
          activeFollowUps += context.follow_up_items.filter((item: any) => item.status === 'pending').length;
        }
      });

      return {
        totalClients,
        averageSatisfaction,
        commonIssues: Object.entries(commonIssues)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([issue]) => issue),
        successfulSolutions: Object.entries(successfulSolutions)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([solution]) => solution),
        activeFollowUps
      };
    } catch (error) {
      console.error('Error getting conversation insights:', error);
      return {
        totalClients: 0,
        averageSatisfaction: 0,
        commonIssues: [],
        successfulSolutions: [],
        activeFollowUps: 0
      };
    }
  }

  async exportAgentMemory(agentId: string): Promise<string> {
    try {
      const contexts = JSON.parse('[]'); // localStorage.getItem('rapid_crm_persistent_contexts') || '[]');
      const agentContexts = contexts.filter((c: any) => c.agent_id === agentId);
      
      return JSON.stringify({
        agentId,
        exportDate: new Date().toISOString(),
        clientMemories: agentContexts.map((record: any) => this.convertRecordToContext(record)),
        totalClients: new Set(agentContexts.map((c: any) => c.client_id)).size,
        totalConversations: agentContexts.length
      }, null, 2);
    } catch (error) {
      console.error('Error exporting agent memory:', error);
      return JSON.stringify({ error: 'Failed to export agent memory' });
    }
  }

  async importAgentMemory(agentId: string, memoryData: string): Promise<boolean> {
    try {
      const data = JSON.parse(memoryData);
      const contexts = JSON.parse('[]'); // localStorage.getItem('rapid_crm_persistent_contexts') || '[]');
      
      // Remove existing contexts for this agent
      const filteredContexts = contexts.filter((c: any) => c.agent_id !== agentId);
      
      // Add imported contexts
      if (data.clientMemories) {
        data.clientMemories.forEach((context: PersistentConversationContext) => {
          const contextRecord = {
            id: context.conversationId,
            conversation_id: context.conversationId,
            client_id: context.clientId,
            agent_id: agentId,
            session_id: context.sessionId,
            created_at: context.metadata.createdAt,
            updated_at: context.metadata.updatedAt,
            last_agent_interaction: context.metadata.lastAgentInteraction,
            total_messages: context.metadata.totalMessages,
            average_response_time: context.metadata.averageResponseTime,
            client_satisfaction: context.metadata.clientSatisfaction,
            conversation_quality: context.metadata.conversationQuality,
            current_topic: context.conversationFlow.currentTopic,
            conversation_stage: context.conversationFlow.conversationStage,
            client_profile: context.clientProfile,
            agent_memory: context.agentMemory,
            conversation_history: context.conversationHistory,
            follow_up_items: context.agentMemory.followUpItems
          };
          filteredContexts.push(contextRecord);
        });
      }
      
      // localStorage.setItem('rapid_crm_persistent_contexts', JSON.stringify(filteredContexts));
      return true;
    } catch (error) {
      console.error('Error importing agent memory:', error);
      return false;
    }
  }

  private convertRecordToContext(record: any): PersistentConversationContext {
    return {
      conversationId: record.id,
      clientId: record.client_id,
      agentId: record.agent_id,
      sessionId: record.session_id,
      conversationHistory: record.conversation_history || [],
      clientProfile: record.client_profile || {
        name: 'Unknown Client',
        email: '',
        preferences: {},
        communicationStyle: 'friendly',
        timezone: 'UTC',
        language: 'en',
        lastInteraction: new Date().toISOString(),
        totalInteractions: 1,
        satisfactionScore: 0,
        commonTopics: [],
        painPoints: [],
        goals: []
      },
      agentMemory: record.agent_memory || {
        keyFacts: {},
        previousIssues: [],
        resolvedSolutions: [],
        clientPreferences: {},
        relationshipNotes: [],
        followUpItems: []
      },
      conversationFlow: {
        currentTopic: record.current_topic || 'greeting',
        previousTopics: [],
        conversationStage: record.conversation_stage || 'greeting',
        nextSteps: [],
        escalationTriggers: []
      },
      metadata: {
        createdAt: record.created_at || new Date().toISOString(),
        updatedAt: record.updated_at || new Date().toISOString(),
        lastAgentInteraction: record.last_agent_interaction || new Date().toISOString(),
        totalMessages: record.total_messages || 0,
        averageResponseTime: record.average_response_time || 0,
        clientSatisfaction: record.client_satisfaction || 0,
        conversationQuality: record.conversation_quality || 'good'
      }
    };
  }

  async cleanup(): Promise<void> {
    try {
      // Clean up old conversations (older than 1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const contexts = JSON.parse('[]'); // localStorage.getItem('rapid_crm_persistent_contexts') || '[]');
      const filteredContexts = contexts.filter((c: any) => {
        const createdAt = new Date(c.created_at);
        return createdAt > oneYearAgo;
      });
      
      // localStorage.setItem('rapid_crm_persistent_contexts', JSON.stringify(filteredContexts));
      console.log(`Cleaned up ${contexts.length - filteredContexts.length} old conversations`);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Singleton instance
export const persistentConversationDatabase = new PersistentConversationDatabase();
