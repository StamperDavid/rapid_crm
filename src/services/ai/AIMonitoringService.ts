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
  private intervals: NodeJS.Timeout[] = [];
  private lastHealthCheck: number = 0;
  private healthCheckCooldown: number = 300000; // 5 minutes

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
    // Don't auto-start monitoring - let it be started explicitly
  }

  public static getInstance(): AIMonitoringService {
    if (!AIMonitoringService.instance) {
      AIMonitoringService.instance = new AIMonitoringService();
    }
    return AIMonitoringService.instance;
  }

  /**
   * Start monitoring with proper lifecycle management
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('🔍 AI Monitoring Service already started, skipping...');
      return;
    }
    
    this.isMonitoring = true;
    console.log('🔍 AI Monitoring Service started');
    
    // Single comprehensive monitoring interval instead of multiple intervals
    const monitoringInterval = setInterval(() => {
      this.performComprehensiveCheck();
    }, 600000); // Every 10 minutes - much more reasonable
    
    this.intervals.push(monitoringInterval);
  }

  /**
   * Stop all monitoring intervals
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }
    
    console.log('🔍 AI Monitoring Service stopping...');
    this.isMonitoring = false;
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    console.log('🔍 AI Monitoring Service stopped');
  }

  /**
   * Perform comprehensive monitoring check with cooldown
   */
  private async performComprehensiveCheck(): Promise<void> {
    const now = Date.now();
    
    // Implement cooldown to prevent excessive health checks
    if (now - this.lastHealthCheck < this.healthCheckCooldown) {
      return;
    }
    
    this.lastHealthCheck = now;
    
    try {
      // Check AI integration health
      const providers = await aiIntegrationService.getProviders();
      this.updateProviderMetrics(providers);
      
      if (providers.length === 0) {
        this.addAlert({
          type: 'warning',
          title: 'No AI Providers Available',
          message: 'No AI providers are currently available. Check API key configuration.',
          severity: 'high'
        });
      }
      
      // Check Claude collaboration health
      const status = claudeCollaborationService.getCollaborationStatus();
      this.updateCollaborationMetrics(status);
      
      if (!status.isConnected) {
        this.addAlert({
          type: 'warning',
          title: 'Claude Collaboration Disconnected',
          message: 'Claude collaboration service is not connected.',
          severity: 'medium'
        });
      }
      
      // Perform health assessment
      const healthStatus = {
        aiIntegration: this.checkAIIntegrationHealth(),
        claudeCollaboration: this.checkClaudeCollaborationHealth(),
        metrics: this.checkMetricsHealth(),
        timestamp: new Date().toISOString()
      };

      // Only log if there are issues or it's been a while since last check
      const hasIssues = !healthStatus.aiIntegration || !healthStatus.claudeCollaboration || !healthStatus.metrics;
      if (hasIssues) {
        console.log('🏥 AI Health Check - Issues detected:', healthStatus);
      }
      
    } catch (error) {
      console.error('❌ AI Monitoring comprehensive check error:', error);
      this.addAlert({
        type: 'error',
        title: 'AI Monitoring Error',
        message: `Failed to perform comprehensive check: ${error}`,
        severity: 'critical'
      });
    }
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

// Export singleton instance - monitoring must be started explicitly
export const aiMonitoringService = AIMonitoringService.getInstance();

// Optionally start monitoring (can be controlled externally)
// aiMonitoringService.startMonitoring();
