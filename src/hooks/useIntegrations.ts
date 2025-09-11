import { useState, useEffect, useCallback } from 'react';
import { 
  integrationManager, 
  webhookManager,
  Integration,
  IntegrationTemplate,
  SyncResult,
  IntegrationHealth,
  Webhook,
  WebhookEvent,
  WebhookDelivery
} from '../services/integrations';

export interface UseIntegrationsReturn {
  // Integration Management
  integrations: Integration[];
  integrationTemplates: IntegrationTemplate[];
  integrationsLoading: boolean;
  integrationsError: string | null;
  
  // Webhook Management
  webhooks: Webhook[];
  webhooksLoading: boolean;
  webhooksError: string | null;
  
  // Sync Results
  syncResults: SyncResult[];
  syncResultsLoading: boolean;
  syncResultsError: string | null;
  
  // Health Checks
  integrationHealth: IntegrationHealth[];
  healthChecksLoading: boolean;
  healthChecksError: string | null;
  
  // Integration Actions
  createIntegration: (templateId: string, config: Record<string, any>, apiKeyId?: string) => Promise<Integration>;
  updateIntegration: (id: string, updates: Partial<Integration>) => Promise<Integration | null>;
  deleteIntegration: (id: string) => Promise<boolean>;
  testConnection: (integrationId: string) => Promise<{ success: boolean; message: string }>;
  syncIntegration: (integrationId: string, operation?: string) => Promise<SyncResult>;
  executeOperation: (integrationId: string, operation: string, data: any) => Promise<any>;
  
  // Template Actions
  getIntegrationTemplates: () => Promise<IntegrationTemplate[]>;
  getIntegrationTemplate: (id: string) => Promise<IntegrationTemplate | null>;
  
  // Webhook Actions
  createWebhook: (webhookData: Omit<Webhook, 'id' | 'successCount' | 'failureCount' | 'createdAt' | 'updatedAt'>) => Promise<Webhook>;
  updateWebhook: (id: string, updates: Partial<Webhook>) => Promise<Webhook | null>;
  deleteWebhook: (id: string) => Promise<boolean>;
  triggerWebhook: (webhookId: string, event: string, payload: any) => Promise<WebhookEvent>;
  testWebhook: (webhookId: string) => Promise<{ success: boolean; message: string; responseTime: number }>;
  retryFailedEvents: (webhookId: string) => Promise<number>;
  
  // Data Retrieval
  getSyncResults: (integrationId: string) => Promise<SyncResult[]>;
  getWebhookEvents: (webhookId: string) => Promise<WebhookEvent[]>;
  getWebhookDeliveries: (webhookId: string) => Promise<WebhookDelivery[]>;
  getWebhookStats: (webhookId: string) => Promise<{
    totalEvents: number;
    successRate: number;
    averageResponseTime: number;
    last24Hours: {
      events: number;
      successes: number;
      failures: number;
    };
  }>;
  
  // Health Monitoring
  performHealthChecks: () => Promise<void>;
  getIntegrationHealth: (integrationId: string) => Promise<IntegrationHealth | null>;
  
  // Utility
  refreshData: () => Promise<void>;
  generateWebhookSecret: () => string;
  verifyWebhookSignature: (payload: string, signature: string, secret: string) => boolean;
}

export const useIntegrations = (): UseIntegrationsReturn => {
  // Integration State
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [integrationTemplates, setIntegrationTemplates] = useState<IntegrationTemplate[]>([]);
  const [integrationsLoading, setIntegrationsLoading] = useState(false);
  const [integrationsError, setIntegrationsError] = useState<string | null>(null);

  // Webhook State
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(false);
  const [webhooksError, setWebhooksError] = useState<string | null>(null);

  // Sync Results State
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [syncResultsLoading, setSyncResultsLoading] = useState(false);
  const [syncResultsError, setSyncResultsError] = useState<string | null>(null);

  // Health Checks State
  const [integrationHealth, setIntegrationHealth] = useState<IntegrationHealth[]>([]);
  const [healthChecksLoading, setHealthChecksLoading] = useState(false);
  const [healthChecksError, setHealthChecksError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadIntegrations();
    loadIntegrationTemplates();
    loadWebhooks();
    loadHealthChecks();
  }, []);

  const loadIntegrations = useCallback(async () => {
    try {
      setIntegrationsLoading(true);
      setIntegrationsError(null);
      const data = await integrationManager.getIntegrations();
      setIntegrations(data);
    } catch (err) {
      setIntegrationsError(err instanceof Error ? err.message : 'Failed to load integrations');
    } finally {
      setIntegrationsLoading(false);
    }
  }, []);

  const loadIntegrationTemplates = useCallback(async () => {
    try {
      const data = await integrationManager.getIntegrationTemplates();
      setIntegrationTemplates(data);
    } catch (err) {
      setIntegrationsError(err instanceof Error ? err.message : 'Failed to load integration templates');
    }
  }, []);

  const loadWebhooks = useCallback(async () => {
    try {
      setWebhooksLoading(true);
      setWebhooksError(null);
      const data = await webhookManager.getWebhooks();
      setWebhooks(data);
    } catch (err) {
      setWebhooksError(err instanceof Error ? err.message : 'Failed to load webhooks');
    } finally {
      setWebhooksLoading(false);
    }
  }, []);

  const loadHealthChecks = useCallback(async () => {
    try {
      setHealthChecksLoading(true);
      setHealthChecksError(null);
      const data = await integrationManager.getAllIntegrationHealth();
      setIntegrationHealth(data);
    } catch (err) {
      setHealthChecksError(err instanceof Error ? err.message : 'Failed to load health checks');
    } finally {
      setHealthChecksLoading(false);
    }
  }, []);

  // Integration Actions
  const createIntegration = useCallback(async (templateId: string, config: Record<string, any>, apiKeyId?: string): Promise<Integration> => {
    try {
      setIntegrationsLoading(true);
      const newIntegration = await integrationManager.createIntegration(templateId, config, apiKeyId);
      setIntegrations(prev => [newIntegration, ...prev]);
      return newIntegration;
    } catch (err) {
      setIntegrationsError(err instanceof Error ? err.message : 'Failed to create integration');
      throw err;
    } finally {
      setIntegrationsLoading(false);
    }
  }, []);

  const updateIntegration = useCallback(async (id: string, updates: Partial<Integration>): Promise<Integration | null> => {
    try {
      const updated = await integrationManager.updateIntegration(id, updates);
      if (updated) {
        setIntegrations(prev => prev.map(integration => integration.id === id ? updated : integration));
      }
      return updated;
    } catch (err) {
      setIntegrationsError(err instanceof Error ? err.message : 'Failed to update integration');
      return null;
    }
  }, []);

  const deleteIntegration = useCallback(async (id: string): Promise<boolean> => {
    try {
      const deleted = await integrationManager.deleteIntegration(id);
      if (deleted) {
        setIntegrations(prev => prev.filter(integration => integration.id !== id));
        setWebhooks(prev => prev.filter(webhook => webhook.integrationId !== id));
      }
      return deleted;
    } catch (err) {
      setIntegrationsError(err instanceof Error ? err.message : 'Failed to delete integration');
      return false;
    }
  }, []);

  const testConnection = useCallback(async (integrationId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await integrationManager.testConnection(integrationId);
      if (result.success) {
        await loadIntegrations(); // Refresh to show updated status
      }
      return result;
    } catch (err) {
      setIntegrationsError(err instanceof Error ? err.message : 'Failed to test connection');
      return { success: false, message: err instanceof Error ? err.message : 'Connection test failed' };
    }
  }, [loadIntegrations]);

  const syncIntegration = useCallback(async (integrationId: string, operation: string = 'full'): Promise<SyncResult> => {
    try {
      setSyncResultsLoading(true);
      const result = await integrationManager.syncIntegration(integrationId, operation);
      setSyncResults(prev => [result, ...prev]);
      await loadIntegrations(); // Refresh to show updated sync status
      return result;
    } catch (err) {
      setSyncResultsError(err instanceof Error ? err.message : 'Failed to sync integration');
      throw err;
    } finally {
      setSyncResultsLoading(false);
    }
  }, [loadIntegrations]);

  const executeOperation = useCallback(async (integrationId: string, operation: string, data: any): Promise<any> => {
    try {
      return await integrationManager.executeOperation(integrationId, operation, data);
    } catch (err) {
      setIntegrationsError(err instanceof Error ? err.message : 'Failed to execute operation');
      throw err;
    }
  }, []);

  // Template Actions
  const getIntegrationTemplates = useCallback(async (): Promise<IntegrationTemplate[]> => {
    try {
      const templates = await integrationManager.getIntegrationTemplates();
      setIntegrationTemplates(templates);
      return templates;
    } catch (err) {
      setIntegrationsError(err instanceof Error ? err.message : 'Failed to get integration templates');
      return [];
    }
  }, []);

  const getIntegrationTemplate = useCallback(async (id: string): Promise<IntegrationTemplate | null> => {
    try {
      return await integrationManager.getIntegrationTemplate(id);
    } catch (err) {
      setIntegrationsError(err instanceof Error ? err.message : 'Failed to get integration template');
      return null;
    }
  }, []);

  // Webhook Actions
  const createWebhook = useCallback(async (webhookData: Omit<Webhook, 'id' | 'successCount' | 'failureCount' | 'createdAt' | 'updatedAt'>): Promise<Webhook> => {
    try {
      setWebhooksLoading(true);
      const newWebhook = await webhookManager.createWebhook(webhookData);
      setWebhooks(prev => [newWebhook, ...prev]);
      return newWebhook;
    } catch (err) {
      setWebhooksError(err instanceof Error ? err.message : 'Failed to create webhook');
      throw err;
    } finally {
      setWebhooksLoading(false);
    }
  }, []);

  const updateWebhook = useCallback(async (id: string, updates: Partial<Webhook>): Promise<Webhook | null> => {
    try {
      const updated = await webhookManager.updateWebhook(id, updates);
      if (updated) {
        setWebhooks(prev => prev.map(webhook => webhook.id === id ? updated : webhook));
      }
      return updated;
    } catch (err) {
      setWebhooksError(err instanceof Error ? err.message : 'Failed to update webhook');
      return null;
    }
  }, []);

  const deleteWebhook = useCallback(async (id: string): Promise<boolean> => {
    try {
      const deleted = await webhookManager.deleteWebhook(id);
      if (deleted) {
        setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
      }
      return deleted;
    } catch (err) {
      setWebhooksError(err instanceof Error ? err.message : 'Failed to delete webhook');
      return false;
    }
  }, []);

  const triggerWebhook = useCallback(async (webhookId: string, event: string, payload: any): Promise<WebhookEvent> => {
    try {
      return await webhookManager.triggerWebhook(webhookId, event, payload);
    } catch (err) {
      setWebhooksError(err instanceof Error ? err.message : 'Failed to trigger webhook');
      throw err;
    }
  }, []);

  const testWebhook = useCallback(async (webhookId: string): Promise<{ success: boolean; message: string; responseTime: number }> => {
    try {
      return await webhookManager.testWebhook(webhookId);
    } catch (err) {
      setWebhooksError(err instanceof Error ? err.message : 'Failed to test webhook');
      return { success: false, message: err instanceof Error ? err.message : 'Webhook test failed', responseTime: 0 };
    }
  }, []);

  const retryFailedEvents = useCallback(async (webhookId: string): Promise<number> => {
    try {
      return await webhookManager.retryFailedEvents(webhookId);
    } catch (err) {
      setWebhooksError(err instanceof Error ? err.message : 'Failed to retry failed events');
      return 0;
    }
  }, []);

  // Data Retrieval
  const getSyncResults = useCallback(async (integrationId: string): Promise<SyncResult[]> => {
    try {
      return await integrationManager.getSyncResults(integrationId);
    } catch (err) {
      setSyncResultsError(err instanceof Error ? err.message : 'Failed to get sync results');
      return [];
    }
  }, []);

  const getWebhookEvents = useCallback(async (webhookId: string): Promise<WebhookEvent[]> => {
    try {
      return await webhookManager.getWebhookEvents(webhookId);
    } catch (err) {
      setWebhooksError(err instanceof Error ? err.message : 'Failed to get webhook events');
      return [];
    }
  }, []);

  const getWebhookDeliveries = useCallback(async (webhookId: string): Promise<WebhookDelivery[]> => {
    try {
      return await webhookManager.getWebhookDeliveries(webhookId);
    } catch (err) {
      setWebhooksError(err instanceof Error ? err.message : 'Failed to get webhook deliveries');
      return [];
    }
  }, []);

  const getWebhookStats = useCallback(async (webhookId: string) => {
    try {
      return await webhookManager.getWebhookStats(webhookId);
    } catch (err) {
      setWebhooksError(err instanceof Error ? err.message : 'Failed to get webhook stats');
      return {
        totalEvents: 0,
        successRate: 0,
        averageResponseTime: 0,
        last24Hours: { events: 0, successes: 0, failures: 0 }
      };
    }
  }, []);

  // Health Monitoring
  const performHealthChecks = useCallback(async (): Promise<void> => {
    try {
      setHealthChecksLoading(true);
      await integrationManager.performHealthChecks();
      await loadHealthChecks();
    } catch (err) {
      setHealthChecksError(err instanceof Error ? err.message : 'Failed to perform health checks');
    } finally {
      setHealthChecksLoading(false);
    }
  }, [loadHealthChecks]);

  const getIntegrationHealth = useCallback(async (integrationId: string): Promise<IntegrationHealth | null> => {
    try {
      return await integrationManager.getIntegrationHealth(integrationId);
    } catch (err) {
      setHealthChecksError(err instanceof Error ? err.message : 'Failed to get integration health');
      return null;
    }
  }, []);

  // Utility
  const refreshData = useCallback(async (): Promise<void> => {
    await Promise.all([
      loadIntegrations(),
      loadIntegrationTemplates(),
      loadWebhooks(),
      loadHealthChecks()
    ]);
  }, [loadIntegrations, loadIntegrationTemplates, loadWebhooks, loadHealthChecks]);

  const generateWebhookSecret = useCallback((): string => {
    return webhookManager.generateWebhookSecret();
  }, []);

  const verifyWebhookSignature = useCallback((payload: string, signature: string, secret: string): boolean => {
    return webhookManager.verifyWebhookSignature(payload, signature, secret);
  }, []);

  return {
    // Integration Management
    integrations,
    integrationTemplates,
    integrationsLoading,
    integrationsError,
    
    // Webhook Management
    webhooks,
    webhooksLoading,
    webhooksError,
    
    // Sync Results
    syncResults,
    syncResultsLoading,
    syncResultsError,
    
    // Health Checks
    integrationHealth,
    healthChecksLoading,
    healthChecksError,
    
    // Integration Actions
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testConnection,
    syncIntegration,
    executeOperation,
    
    // Template Actions
    getIntegrationTemplates,
    getIntegrationTemplate,
    
    // Webhook Actions
    createWebhook,
    updateWebhook,
    deleteWebhook,
    triggerWebhook,
    testWebhook,
    retryFailedEvents,
    
    // Data Retrieval
    getSyncResults,
    getWebhookEvents,
    getWebhookDeliveries,
    getWebhookStats,
    
    // Health Monitoring
    performHealthChecks,
    getIntegrationHealth,
    
    // Utility
    refreshData,
    generateWebhookSecret,
    verifyWebhookSignature
  };
};
