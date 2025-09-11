// Main AI service exports
export { AgentService, agentService } from './AgentService';
export { KnowledgeBaseService, knowledgeBaseService } from './KnowledgeBaseService';
export { RulesEngineService, rulesEngineService } from './RulesEngineService';
export { AIIntegrationService, aiIntegrationService } from './AIIntegrationService';
export { AIAgentManager, aiAgentManager } from './AIAgentManager';

// Type exports
export type {
  AgentResponse,
  AgentTrainingData,
  AgentPerformance,
  AgentContext
} from './AgentService';

export type {
  KnowledgeDocument,
  KnowledgeSearchResult,
  KnowledgeBaseStats
} from './KnowledgeBaseService';

export type {
  RuleContext,
  RuleEvaluation,
  RuleExecutionResult
} from './RulesEngineService';

export type {
  AIProvider,
  AIRequest,
  AIResponse,
  AIError
} from './AIIntegrationService';

export type {
  AgentInteraction,
  AgentAnalytics
} from './AIAgentManager';
