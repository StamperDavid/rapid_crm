import { useState, useEffect, useCallback } from 'react';
import { Agent, KnowledgeBase } from '../types/schema';
import { 
  knowledgeBaseManager, 
  agentConfigurationService,
  KnowledgeDocument,
  KnowledgeSearchResult,
  KnowledgeBaseStats,
  AgentTemplate,
  AgentTrainingData,
  AgentPerformanceMetrics
} from '../services/agentBuilder';

export interface UseAgentBuilderReturn {
  // Knowledge Base Management
  knowledgeBases: KnowledgeBase[];
  knowledgeBaseStats: KnowledgeBaseStats | null;
  knowledgeBaseLoading: boolean;
  knowledgeBaseError: string | null;
  
  // Agent Configuration
  agentTemplates: AgentTemplate[];
  agentTemplatesLoading: boolean;
  agentTemplatesError: string | null;
  
  // Training Data
  trainingData: AgentTrainingData[];
  trainingDataLoading: boolean;
  trainingDataError: string | null;
  
  // Performance Metrics
  performanceMetrics: AgentPerformanceMetrics[];
  performanceMetricsLoading: boolean;
  performanceMetricsError: string | null;
  
  // Knowledge Base Actions
  createKnowledgeBase: (kbData: Omit<KnowledgeBase, 'id' | 'lastUpdated'>) => Promise<KnowledgeBase>;
  updateKnowledgeBase: (id: string, updates: Partial<KnowledgeBase>) => Promise<KnowledgeBase | null>;
  deleteKnowledgeBase: (id: string) => Promise<boolean>;
  getKnowledgeBaseStats: (id: string) => Promise<KnowledgeBaseStats>;
  
  // Document Management
  addDocument: (kbId: string, document: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt' | 'checksum'>) => Promise<KnowledgeDocument>;
  getDocuments: (kbId: string) => Promise<KnowledgeDocument[]>;
  searchDocuments: (kbId: string, query: string, limit?: number) => Promise<KnowledgeSearchResult[]>;
  importDocuments: (kbId: string, file: File) => Promise<KnowledgeDocument[]>;
  exportKnowledgeBase: (kbId: string) => Promise<string>;
  
  // Agent Template Actions
  createAgentFromTemplate: (templateId: string, agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'configuration' | 'capabilities' | 'rules' | 'metrics'>) => Promise<Agent>;
  getAgentTemplates: () => Promise<AgentTemplate[]>;
  createAgentTemplate: (templateData: Omit<AgentTemplate, 'id' | 'createdAt' | 'usageCount'>) => Promise<AgentTemplate>;
  
  // Agent Configuration
  updateAgentConfiguration: (agentId: string, configuration: Partial<any>) => Promise<Agent | null>;
  validateAgentConfiguration: (configuration: any) => Promise<{ isValid: boolean; errors: string[]; warnings: string[] }>;
  
  // Training Data Management
  addTrainingData: (agentId: string, trainingData: Omit<AgentTrainingData, 'id' | 'agentId' | 'createdAt' | 'updatedAt'>) => Promise<AgentTrainingData>;
  getTrainingData: (agentId: string) => Promise<AgentTrainingData[]>;
  
  // Performance Tracking
  recordPerformanceMetrics: (agentId: string, metrics: Omit<AgentPerformanceMetrics, 'agentId'>) => Promise<void>;
  getPerformanceMetrics: (agentId: string, period?: 'hour' | 'day' | 'week' | 'month') => Promise<AgentPerformanceMetrics[]>;
  getAgentAnalytics: (agentId: string) => Promise<{
    totalTrainingData: number;
    averageQuality: number;
    performanceTrend: 'improving' | 'stable' | 'declining';
    topTags: Array<{ tag: string; count: number }>;
    recentMetrics: AgentPerformanceMetrics[];
  }>;
  
  // Import/Export
  exportAgentConfiguration: (agentId: string) => Promise<string>;
  importAgentConfiguration: (importData: string) => Promise<Agent>;
  
  // Utility
  refreshData: () => Promise<void>;
}

export const useAgentBuilder = (): UseAgentBuilderReturn => {
  // Knowledge Base State
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [knowledgeBaseStats, setKnowledgeBaseStats] = useState<KnowledgeBaseStats | null>(null);
  const [knowledgeBaseLoading, setKnowledgeBaseLoading] = useState(false);
  const [knowledgeBaseError, setKnowledgeBaseError] = useState<string | null>(null);

  // Agent Templates State
  const [agentTemplates, setAgentTemplates] = useState<AgentTemplate[]>([]);
  const [agentTemplatesLoading, setAgentTemplatesLoading] = useState(false);
  const [agentTemplatesError, setAgentTemplatesError] = useState<string | null>(null);

  // Training Data State
  const [trainingData, setTrainingData] = useState<AgentTrainingData[]>([]);
  const [trainingDataLoading, setTrainingDataLoading] = useState(false);
  const [trainingDataError, setTrainingDataError] = useState<string | null>(null);

  // Performance Metrics State
  const [performanceMetrics, setPerformanceMetrics] = useState<AgentPerformanceMetrics[]>([]);
  const [performanceMetricsLoading, setPerformanceMetricsLoading] = useState(false);
  const [performanceMetricsError, setPerformanceMetricsError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadKnowledgeBases();
    loadAgentTemplates();
  }, []);

  const loadKnowledgeBases = useCallback(async () => {
    try {
      setKnowledgeBaseLoading(true);
      setKnowledgeBaseError(null);
      const data = await knowledgeBaseManager.getKnowledgeBases();
      setKnowledgeBases(data);
    } catch (err) {
      setKnowledgeBaseError(err instanceof Error ? err.message : 'Failed to load knowledge bases');
    } finally {
      setKnowledgeBaseLoading(false);
    }
  }, []);

  const loadAgentTemplates = useCallback(async () => {
    try {
      setAgentTemplatesLoading(true);
      setAgentTemplatesError(null);
      const data = await agentConfigurationService.getAgentTemplates();
      setAgentTemplates(data);
    } catch (err) {
      setAgentTemplatesError(err instanceof Error ? err.message : 'Failed to load agent templates');
    } finally {
      setAgentTemplatesLoading(false);
    }
  }, []);

  // Knowledge Base Actions
  const createKnowledgeBase = useCallback(async (kbData: Omit<KnowledgeBase, 'id' | 'lastUpdated'>): Promise<KnowledgeBase> => {
    try {
      const newKB = await knowledgeBaseManager.createKnowledgeBase(kbData);
      setKnowledgeBases(prev => [newKB, ...prev]);
      return newKB;
    } catch (err) {
      setKnowledgeBaseError(err instanceof Error ? err.message : 'Failed to create knowledge base');
      throw err;
    }
  }, []);

  const updateKnowledgeBase = useCallback(async (id: string, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase | null> => {
    try {
      const updated = await knowledgeBaseManager.updateKnowledgeBase(id, updates);
      if (updated) {
        setKnowledgeBases(prev => prev.map(kb => kb.id === id ? updated : kb));
      }
      return updated;
    } catch (err) {
      setKnowledgeBaseError(err instanceof Error ? err.message : 'Failed to update knowledge base');
      return null;
    }
  }, []);

  const deleteKnowledgeBase = useCallback(async (id: string): Promise<boolean> => {
    try {
      const deleted = await knowledgeBaseManager.deleteKnowledgeBase(id);
      if (deleted) {
        setKnowledgeBases(prev => prev.filter(kb => kb.id !== id));
      }
      return deleted;
    } catch (err) {
      setKnowledgeBaseError(err instanceof Error ? err.message : 'Failed to delete knowledge base');
      return false;
    }
  }, []);

  const getKnowledgeBaseStats = useCallback(async (id: string): Promise<KnowledgeBaseStats> => {
    try {
      const stats = await knowledgeBaseManager.getKnowledgeBaseStats(id);
      setKnowledgeBaseStats(stats);
      return stats;
    } catch (err) {
      setKnowledgeBaseError(err instanceof Error ? err.message : 'Failed to get knowledge base stats');
      throw err;
    }
  }, []);

  // Document Management
  const addDocument = useCallback(async (kbId: string, document: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt' | 'checksum'>): Promise<KnowledgeDocument> => {
    try {
      return await knowledgeBaseManager.addDocument(kbId, document);
    } catch (err) {
      setKnowledgeBaseError(err instanceof Error ? err.message : 'Failed to add document');
      throw err;
    }
  }, []);

  const getDocuments = useCallback(async (kbId: string): Promise<KnowledgeDocument[]> => {
    try {
      return await knowledgeBaseManager.getDocuments(kbId);
    } catch (err) {
      setKnowledgeBaseError(err instanceof Error ? err.message : 'Failed to get documents');
      return [];
    }
  }, []);

  const searchDocuments = useCallback(async (kbId: string, query: string, limit: number = 10): Promise<KnowledgeSearchResult[]> => {
    try {
      return await knowledgeBaseManager.searchDocuments(kbId, query, limit);
    } catch (err) {
      setKnowledgeBaseError(err instanceof Error ? err.message : 'Failed to search documents');
      return [];
    }
  }, []);

  const importDocuments = useCallback(async (kbId: string, file: File): Promise<KnowledgeDocument[]> => {
    try {
      return await knowledgeBaseManager.importDocuments(kbId, file);
    } catch (err) {
      setKnowledgeBaseError(err instanceof Error ? err.message : 'Failed to import documents');
      throw err;
    }
  }, []);

  const exportKnowledgeBase = useCallback(async (kbId: string): Promise<string> => {
    try {
      return await knowledgeBaseManager.exportKnowledgeBase(kbId);
    } catch (err) {
      setKnowledgeBaseError(err instanceof Error ? err.message : 'Failed to export knowledge base');
      throw err;
    }
  }, []);

  // Agent Template Actions
  const createAgentFromTemplate = useCallback(async (templateId: string, agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'configuration' | 'capabilities' | 'rules' | 'metrics'>): Promise<Agent> => {
    try {
      const newAgent = await agentConfigurationService.createAgentFromTemplate(templateId, agentData);
      await loadAgentTemplates(); // Refresh templates to update usage count
      return newAgent;
    } catch (err) {
      setAgentTemplatesError(err instanceof Error ? err.message : 'Failed to create agent from template');
      throw err;
    }
  }, [loadAgentTemplates]);

  const getAgentTemplates = useCallback(async (): Promise<AgentTemplate[]> => {
    try {
      const templates = await agentConfigurationService.getAgentTemplates();
      setAgentTemplates(templates);
      return templates;
    } catch (err) {
      setAgentTemplatesError(err instanceof Error ? err.message : 'Failed to get agent templates');
      return [];
    }
  }, []);

  const createAgentTemplate = useCallback(async (templateData: Omit<AgentTemplate, 'id' | 'createdAt' | 'usageCount'>): Promise<AgentTemplate> => {
    try {
      const newTemplate = await agentConfigurationService.createAgentTemplate(templateData);
      setAgentTemplates(prev => [newTemplate, ...prev]);
      return newTemplate;
    } catch (err) {
      setAgentTemplatesError(err instanceof Error ? err.message : 'Failed to create agent template');
      throw err;
    }
  }, []);

  // Agent Configuration
  const updateAgentConfiguration = useCallback(async (agentId: string, configuration: Partial<any>): Promise<Agent | null> => {
    try {
      return await agentConfigurationService.updateAgentConfiguration(agentId, configuration);
    } catch (err) {
      setAgentTemplatesError(err instanceof Error ? err.message : 'Failed to update agent configuration');
      return null;
    }
  }, []);

  const validateAgentConfiguration = useCallback(async (configuration: any): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> => {
    try {
      return await agentConfigurationService.validateAgentConfiguration(configuration);
    } catch (err) {
      setAgentTemplatesError(err instanceof Error ? err.message : 'Failed to validate agent configuration');
      return { isValid: false, errors: ['Validation failed'], warnings: [] };
    }
  }, []);

  // Training Data Management
  const addTrainingData = useCallback(async (agentId: string, trainingData: Omit<AgentTrainingData, 'id' | 'agentId' | 'createdAt' | 'updatedAt'>): Promise<AgentTrainingData> => {
    try {
      setTrainingDataLoading(true);
      const newTrainingData = await agentConfigurationService.addTrainingData(agentId, trainingData);
      setTrainingData(prev => [...prev, newTrainingData]);
      return newTrainingData;
    } catch (err) {
      setTrainingDataError(err instanceof Error ? err.message : 'Failed to add training data');
      throw err;
    } finally {
      setTrainingDataLoading(false);
    }
  }, []);

  const getTrainingData = useCallback(async (agentId: string): Promise<AgentTrainingData[]> => {
    try {
      setTrainingDataLoading(true);
      const data = await agentConfigurationService.getTrainingData(agentId);
      setTrainingData(data);
      return data;
    } catch (err) {
      setTrainingDataError(err instanceof Error ? err.message : 'Failed to get training data');
      return [];
    } finally {
      setTrainingDataLoading(false);
    }
  }, []);

  // Performance Tracking
  const recordPerformanceMetrics = useCallback(async (agentId: string, metrics: Omit<AgentPerformanceMetrics, 'agentId'>): Promise<void> => {
    try {
      await agentConfigurationService.recordPerformanceMetrics(agentId, metrics);
    } catch (err) {
      setPerformanceMetricsError(err instanceof Error ? err.message : 'Failed to record performance metrics');
    }
  }, []);

  const getPerformanceMetrics = useCallback(async (agentId: string, period?: 'hour' | 'day' | 'week' | 'month'): Promise<AgentPerformanceMetrics[]> => {
    try {
      setPerformanceMetricsLoading(true);
      const metrics = await agentConfigurationService.getPerformanceMetrics(agentId, period);
      setPerformanceMetrics(metrics);
      return metrics;
    } catch (err) {
      setPerformanceMetricsError(err instanceof Error ? err.message : 'Failed to get performance metrics');
      return [];
    } finally {
      setPerformanceMetricsLoading(false);
    }
  }, []);

  const getAgentAnalytics = useCallback(async (agentId: string) => {
    try {
      return await agentConfigurationService.getAgentAnalytics(agentId);
    } catch (err) {
      setPerformanceMetricsError(err instanceof Error ? err.message : 'Failed to get agent analytics');
      return {
        totalTrainingData: 0,
        averageQuality: 0,
        performanceTrend: 'stable' as const,
        topTags: [],
        recentMetrics: []
      };
    }
  }, []);

  // Import/Export
  const exportAgentConfiguration = useCallback(async (agentId: string): Promise<string> => {
    try {
      return await agentConfigurationService.exportAgentConfiguration(agentId);
    } catch (err) {
      setAgentTemplatesError(err instanceof Error ? err.message : 'Failed to export agent configuration');
      throw err;
    }
  }, []);

  const importAgentConfiguration = useCallback(async (importData: string): Promise<Agent> => {
    try {
      return await agentConfigurationService.importAgentConfiguration(importData);
    } catch (err) {
      setAgentTemplatesError(err instanceof Error ? err.message : 'Failed to import agent configuration');
      throw err;
    }
  }, []);

  // Utility
  const refreshData = useCallback(async (): Promise<void> => {
    await Promise.all([
      loadKnowledgeBases(),
      loadAgentTemplates()
    ]);
  }, [loadKnowledgeBases, loadAgentTemplates]);

  return {
    // Knowledge Base Management
    knowledgeBases,
    knowledgeBaseStats,
    knowledgeBaseLoading,
    knowledgeBaseError,
    
    // Agent Configuration
    agentTemplates,
    agentTemplatesLoading,
    agentTemplatesError,
    
    // Training Data
    trainingData,
    trainingDataLoading,
    trainingDataError,
    
    // Performance Metrics
    performanceMetrics,
    performanceMetricsLoading,
    performanceMetricsError,
    
    // Knowledge Base Actions
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase,
    getKnowledgeBaseStats,
    
    // Document Management
    addDocument,
    getDocuments,
    searchDocuments,
    importDocuments,
    exportKnowledgeBase,
    
    // Agent Template Actions
    createAgentFromTemplate,
    getAgentTemplates,
    createAgentTemplate,
    
    // Agent Configuration
    updateAgentConfiguration,
    validateAgentConfiguration,
    
    // Training Data Management
    addTrainingData,
    getTrainingData,
    
    // Performance Tracking
    recordPerformanceMetrics,
    getPerformanceMetrics,
    getAgentAnalytics,
    
    // Import/Export
    exportAgentConfiguration,
    importAgentConfiguration,
    
    // Utility
    refreshData
  };
};
