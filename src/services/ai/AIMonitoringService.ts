import { aiIntegrationService } from './AIIntegrationService';
import { claudeCollaborationService } from './ClaudeCollaborationService';

export interface AIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  errorRate: number;
  lastActivity: string;
}

export interface AIProviderMetrics {
  providerId: string;
  providerName: string;
  requests: number;
  successRate: number;
  averageResponseTime: number;
  tokensUsed: number;
  cost: number;
  lastUsed: string;
}

export interface AIConversationMetrics {
  sessionId: string;
  messageCount: number;
  averageResponseTime: number;
  userSatisfaction: number;
  topics: string[];
  startTime: string;
  endTime: string;
  duration: number;
}

export interface AIAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AIMonitoringService {
  private static instance: AIMonitoringService;
  private metrics: AIMetrics;
  private providerMetrics: Map<string, AIProviderMetrics>;
  private conversationMetrics: Map<string, AIConversationMetrics>;
  private alerts: AIAlert[];
  private isMonitoring: boolean = false;

  private constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      errorRate: 0,
      lastActivity: new Date().toISOString()
    };
    this.providerMetrics = new Map();
    this.conversationMetrics = new Map();
    this.alerts = [];
    this.startMonitoring();
  }

  public static getInstance(): AIMonitoringService {
    if (!AIMonitoringService.instance) {
      AIMonitoringService.instance = new AIMonitoringService();
    }
    return AIMonitoringService.instance;
  }

  private startMonitoring(): void {
    this.isMonitoring = true;
    console.log('🔍 AI Monitoring Service started');
    
    // Monitor AI integration service
    this.monitorAIIntegration();
    
    // Monitor Claude collaboration
    this.monitorClaudeCollaboration();
    
    // Set up periodic health checks
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  private monitorAIIntegration(): void {
    // Monitor AI integration service health
    setInterval(async () => {
      try {
        const providers = await aiIntegrationService.getProviders();
        if (providers.length === 0) {
          this.addAlert({
            type: 'warning',
            title: 'No AI Providers Available',
            message: 'No AI providers are currently available. Check API key configuration.',
            severity: 'high'
          });
        }
      } catch (error) {
        this.addAlert({
          type: 'error',
          title: 'AI Integration Service Error',
          message: `Failed to check AI providers: ${error}`,
          severity: 'critical'
        });
      }
    }, 60000); // Every minute
  }

  private monitorClaudeCollaboration(): void {
    // Monitor Claude collaboration status
    setInterval(() => {
      const status = claudeCollaborationService.getCollaborationStatus();
      if (!status.isConnected) {
        this.addAlert({
          type: 'warning',
          title: 'Claude Collaboration Disconnected',
          message: 'Claude collaboration service is not connected.',
          severity: 'medium'
        });
      }
    }, 60000); // Every minute
  }

  private performHealthCheck(): void {
    // Perform comprehensive health check
    const healthStatus = {
      aiIntegration: this.checkAIIntegrationHealth(),
      claudeCollaboration: this.checkClaudeCollaborationHealth(),
      metrics: this.checkMetricsHealth()
    };

    // Log health status
    console.log('🏥 AI Health Check:', healthStatus);
  }

  private checkAIIntegrationHealth(): boolean {
    // Check if AI integration service is healthy
    return this.metrics.errorRate < 0.1; // Less than 10% error rate
  }

  private checkClaudeCollaborationHealth(): boolean {
    const status = claudeCollaborationService.getCollaborationStatus();
    return status.isConnected;
  }

  private checkMetricsHealth(): boolean {
    // Check if metrics are within acceptable ranges
    return this.metrics.averageResponseTime < 5000; // Less than 5 seconds
  }

  public recordRequest(
    providerId: string,
    success: boolean,
    responseTime: number,
    tokensUsed: number,
    cost: number
  ): void {
    // Update overall metrics
    this.metrics.totalRequests++;
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests;

    this.metrics.totalTokensUsed += tokensUsed;
    this.metrics.totalCost += cost;
    this.metrics.errorRate = this.metrics.failedRequests / this.metrics.totalRequests;
    this.metrics.lastActivity = new Date().toISOString();

    // Update provider-specific metrics
    const providerMetric = this.providerMetrics.get(providerId) || {
      providerId,
      providerName: providerId,
      requests: 0,
      successRate: 0,
      averageResponseTime: 0,
      tokensUsed: 0,
      cost: 0,
      lastUsed: new Date().toISOString()
    };

    providerMetric.requests++;
    providerMetric.successRate = success ? 
      (providerMetric.successRate * (providerMetric.requests - 1) + 1) / providerMetric.requests :
      (providerMetric.successRate * (providerMetric.requests - 1)) / providerMetric.requests;
    
    providerMetric.averageResponseTime = 
      (providerMetric.averageResponseTime * (providerMetric.requests - 1) + responseTime) / 
      providerMetric.requests;
    
    providerMetric.tokensUsed += tokensUsed;
    providerMetric.cost += cost;
    providerMetric.lastUsed = new Date().toISOString();

    this.providerMetrics.set(providerId, providerMetric);

    // Check for alerts
    this.checkForAlerts(providerId, success, responseTime);
  }

  private checkForAlerts(providerId: string, success: boolean, responseTime: number): void {
    // High error rate alert
    if (this.metrics.errorRate > 0.2) {
      this.addAlert({
        type: 'error',
        title: 'High Error Rate',
        message: `AI error rate is ${(this.metrics.errorRate * 100).toFixed(1)}%`,
        severity: 'high'
      });
    }

    // Slow response time alert
    if (responseTime > 10000) {
      this.addAlert({
        type: 'warning',
        title: 'Slow Response Time',
        message: `Response time is ${responseTime}ms for provider ${providerId}`,
        severity: 'medium'
      });
    }

    // Failed request alert
    if (!success) {
      this.addAlert({
        type: 'error',
        title: 'Request Failed',
        message: `Request failed for provider ${providerId}`,
        severity: 'medium'
      });
    }
  }

  public recordConversation(
    sessionId: string,
    messageCount: number,
    averageResponseTime: number,
    topics: string[]
  ): void {
    const conversationMetric: AIConversationMetrics = {
      sessionId,
      messageCount,
      averageResponseTime,
      userSatisfaction: 0, // TODO: Implement user satisfaction tracking
      topics,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 0 // TODO: Calculate actual duration
    };

    this.conversationMetrics.set(sessionId, conversationMetric);
  }

  public addAlert(alert: Omit<AIAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const newAlert: AIAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.unshift(newAlert); // Add to beginning of array
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    console.log('🚨 AI Alert:', newAlert);
  }

  public resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  public getMetrics(): AIMetrics {
    return { ...this.metrics };
  }

  public getProviderMetrics(): AIProviderMetrics[] {
    return Array.from(this.providerMetrics.values());
  }

  public getConversationMetrics(): AIConversationMetrics[] {
    return Array.from(this.conversationMetrics.values());
  }

  public getAlerts(): AIAlert[] {
    return [...this.alerts];
  }

  public getUnresolvedAlerts(): AIAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  public getHealthStatus(): {
    overall: 'healthy' | 'warning' | 'critical';
    aiIntegration: boolean;
    claudeCollaboration: boolean;
    metrics: boolean;
    alerts: number;
  } {
    const unresolvedAlerts = this.getUnresolvedAlerts();
    const criticalAlerts = unresolvedAlerts.filter(alert => alert.severity === 'critical');
    const highAlerts = unresolvedAlerts.filter(alert => alert.severity === 'high');

    let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalAlerts.length > 0) {
      overall = 'critical';
    } else if (highAlerts.length > 0 || this.metrics.errorRate > 0.1) {
      overall = 'warning';
    }

    return {
      overall,
      aiIntegration: this.checkAIIntegrationHealth(),
      claudeCollaboration: this.checkClaudeCollaborationHealth(),
      metrics: this.checkMetricsHealth(),
      alerts: unresolvedAlerts.length
    };
  }

  public exportMetrics(): string {
    const exportData = {
      metrics: this.metrics,
      providerMetrics: this.getProviderMetrics(),
      conversationMetrics: this.getConversationMetrics(),
      alerts: this.alerts,
      healthStatus: this.getHealthStatus(),
      exportTime: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  public resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      errorRate: 0,
      lastActivity: new Date().toISOString()
    };
    this.providerMetrics.clear();
    this.conversationMetrics.clear();
    this.alerts = [];
    console.log('📊 AI metrics reset');
  }
}

// Export singleton instance
export const aiMonitoringService = AIMonitoringService.getInstance();
