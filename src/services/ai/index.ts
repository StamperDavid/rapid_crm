// Main AI service exports
export { AgentService, agentService } from './AgentService';
export { KnowledgeBaseService, knowledgeBaseService } from './KnowledgeBaseService';
export { RulesEngineService, rulesEngineService } from './RulesEngineService';
export { AIIntegrationService, aiIntegrationService } from './AIIntegrationService';
export { ApiKeyManager, apiKeyManager } from './ApiKeyManager';
export { AIAgentManager, aiAgentManager } from './AIAgentManager';
export { AIDevelopmentAssistant, aiDevelopmentAssistant } from './AIDevelopmentAssistant';
export { AISystemController, aiSystemController } from './AISystemController';
export { claudeCollaborationService } from './ClaudeCollaborationService';
export { aiMonitoringService } from './AIMonitoringService';
export { advancedAICustomizationService } from './AdvancedAICustomizationService';

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

export type {
  DevelopmentTask,
  FileOperation,
  DatabaseOperation,
  ComponentAnalysis
} from './AIDevelopmentAssistant';

export type {
  SystemOperation,
  FileSystemOperation,
  DatabaseSystemOperation,
  APISystemOperation
} from './AISystemController';

export type {
  ClaudeMessage,
  ClaudeResponse,
  CollaborationSession
} from './ClaudeCollaborationService';

export type {
  AIMetrics,
  AIProviderMetrics,
  AIConversationMetrics,
  AIAlert
} from './AIMonitoringService';

export type {
  AIPersona,
  VoiceConfiguration,
  AIModelConfiguration,
  ConversationMemory
} from './AdvancedAICustomizationService';
