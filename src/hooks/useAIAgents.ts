import { useState, useEffect, useCallback } from 'react';
import { aiAgentManager } from '../services/ai/AIAgentManager';
import { AgentResponse, AgentContext, AgentAnalytics } from '../types/schema';
import { Agent } from '../types/schema';

interface UseAIAgentsState {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  systemHealth: any | null;
}

interface UseAIAgentsReturn extends UseAIAgentsState {
  processMessage: (agentId: string, message: string, context?: AgentContext) => Promise<AgentResponse>;
  getAgentAnalytics: (agentId: string) => Promise<AgentAnalytics | null>;
  addFeedback: (agentId: string, interactionId: string, satisfaction: number, feedback?: string) => Promise<void>;
  createAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Agent>;
  updateAgent: (agentId: string, updates: Partial<Agent>) => Promise<Agent | null>;
  deleteAgent: (agentId: string) => Promise<boolean>;
  refreshAgents: () => Promise<void>;
  refreshSystemHealth: () => Promise<void>;
}

export const useAIAgents = (): UseAIAgentsReturn => {
  const [state, setState] = useState<UseAIAgentsState>({
    agents: [],
    loading: true,
    error: null,
    systemHealth: null
  });

  const loadAgents = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const agents = await aiAgentManager.getAllAgents();
      const systemHealth = await aiAgentManager.getSystemHealth();
      
      setState(prev => ({
        ...prev,
        agents,
        systemHealth,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load agents',
        loading: false
      }));
    }
  }, []);

  const processMessage = useCallback(async (
    agentId: string,
    message: string,
    context: AgentContext = {}
  ): Promise<AgentResponse> => {
    try {
      return await aiAgentManager.processAgentRequest(agentId, message, context);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to process message');
    }
  }, []);

  const getAgentAnalytics = useCallback(async (agentId: string): Promise<AgentAnalytics | null> => {
    try {
      return await aiAgentManager.getAgentAnalytics(agentId);
    } catch (error) {
      console.error('Failed to get agent analytics:', error);
      return null;
    }
  }, []);

  const addFeedback = useCallback(async (
    agentId: string,
    interactionId: string,
    satisfaction: number,
    feedback?: string
  ): Promise<void> => {
    try {
      await aiAgentManager.addFeedback(agentId, interactionId, satisfaction, feedback);
    } catch (error) {
      console.error('Failed to add feedback:', error);
    }
  }, []);

  const createAgent = useCallback(async (
    agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Agent> => {
    try {
      const newAgent = await aiAgentManager.createAgent(agent);
      await loadAgents(); // Refresh the agents list
      return newAgent;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create agent');
    }
  }, [loadAgents]);

  const updateAgent = useCallback(async (
    agentId: string,
    updates: Partial<Agent>
  ): Promise<Agent | null> => {
    try {
      const updatedAgent = await aiAgentManager.updateAgent(agentId, updates);
      await loadAgents(); // Refresh the agents list
      return updatedAgent;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update agent');
    }
  }, [loadAgents]);

  const deleteAgent = useCallback(async (agentId: string): Promise<boolean> => {
    try {
      const deleted = await aiAgentManager.deleteAgent(agentId);
      await loadAgents(); // Refresh the agents list
      return deleted;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete agent');
    }
  }, [loadAgents]);

  const refreshAgents = useCallback(async () => {
    await loadAgents();
  }, [loadAgents]);

  const refreshSystemHealth = useCallback(async () => {
    try {
      const systemHealth = await aiAgentManager.getSystemHealth();
      setState(prev => ({ ...prev, systemHealth }));
    } catch (error) {
      console.error('Failed to refresh system health:', error);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  return {
    ...state,
    processMessage,
    getAgentAnalytics,
    addFeedback,
    createAgent,
    updateAgent,
    deleteAgent,
    refreshAgents,
    refreshSystemHealth
  };
};

// Hook for a specific agent
export const useAIAgent = (agentId: string) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [analytics, setAnalytics] = useState<AgentAnalytics | null>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAgentData = useCallback(async () => {
    if (!agentId) return;

    try {
      setLoading(true);
      setError(null);

      const [agentData, analyticsData, interactionsData] = await Promise.all([
        aiAgentManager.getAllAgents().then(agents => agents.find(a => a.id === agentId) || null),
        aiAgentManager.getAgentAnalytics(agentId),
        aiAgentManager.getAgentInteractions(agentId, 20)
      ]);

      setAgent(agentData);
      setAnalytics(analyticsData);
      setInteractions(interactionsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load agent data');
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  const processMessage = useCallback(async (
    message: string,
    context: AgentContext = {}
  ): Promise<AgentResponse> => {
    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    try {
      const response = await aiAgentManager.processAgentRequest(agentId, message, context);
      await loadAgentData(); // Refresh data after interaction
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to process message');
    }
  }, [agentId, loadAgentData]);

  const addFeedback = useCallback(async (
    interactionId: string,
    satisfaction: number,
    feedback?: string
  ): Promise<void> => {
    if (!agentId) return;

    try {
      await aiAgentManager.addFeedback(agentId, interactionId, satisfaction, feedback);
      await loadAgentData(); // Refresh data after feedback
    } catch (error) {
      console.error('Failed to add feedback:', error);
    }
  }, [agentId, loadAgentData]);

  useEffect(() => {
    loadAgentData();
  }, [loadAgentData]);

  return {
    agent,
    analytics,
    interactions,
    loading,
    error,
    processMessage,
    addFeedback,
    refresh: loadAgentData
  };
};
