// Main conversation service exports
export { ConversationService, conversationService } from './ConversationService';
export { MessageService, messageService } from './MessageService';
export { AgentHandoffService, agentHandoffService } from './AgentHandoffService';

// Type exports
export type {
  ConversationEvent,
  ConversationSubscription
} from './ConversationService';

export type {
  MessageTemplate,
  MessageAnalytics,
  MessageSearchResult
} from './MessageService';

export type {
  HandoffRule,
  HandoffRequest,
  AgentAvailability
} from './AgentHandoffService';
