// Main Agent Builder service exports
export { KnowledgeBaseManager, knowledgeBaseManager } from './KnowledgeBaseManager';
export { AgentConfigurationService, agentConfigurationService } from './AgentConfigurationService';

// Type exports
export type {
  KnowledgeDocument,
  KnowledgeSearchResult,
  KnowledgeBaseStats
} from './KnowledgeBaseManager';

export type {
  AgentTemplate,
  AgentTrainingData,
  AgentPerformanceMetrics
} from './AgentConfigurationService';
