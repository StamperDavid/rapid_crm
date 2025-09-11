// Main Integrations service exports
export { IntegrationManager, integrationManager } from './IntegrationManager';
export { WebhookManager, webhookManager } from './WebhookManager';

// Type exports
export type {
  Integration,
  IntegrationTemplate,
  SyncResult,
  IntegrationHealth
} from './IntegrationManager';

export type {
  Webhook,
  WebhookEvent,
  WebhookDelivery
} from './WebhookManager';
