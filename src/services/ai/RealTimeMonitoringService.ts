/**
 * Real-time AI Performance Monitoring Service
 * Monitors AI agent performance, system health, and provides real-time analytics
 */

export interface PerformanceMetric {
  id: string;
  agentId: string;
  metricType: 'response_time' | 'accuracy' | 'throughput' | 'error_rate' | 'user_satisfaction' | 'cost_efficiency';
  value: number;
  unit: string;
  timestamp: string;
  metadata?: any;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    database: 'healthy' | 'warning' | 'critical';
    api: 'healthy' | 'warning' | 'critical';
    ai_services: 'healthy' | 'warning' | 'critical';
    external_integrations: 'healthy' | 'warning' | 'critical';
  };
  uptime: number;
  lastCheck: string;
  issues: string[];
}

export interface AgentPerformance {
  agentId: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'maintenance';
  metrics: {
    responseTime: number;
    accuracy: number;
    throughput: number;
    errorRate: number;
    userSatisfaction: number;
    costEfficiency: number;
  };
  trends: {
    responseTime: 'improving' | 'stable' | 'degrading';
    accuracy: 'improving' | 'stable' | 'degrading';
    throughput: 'improving' | 'stable' | 'degrading';
  };
  lastActivity: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
}

export interface Alert {
  id: string;
  type: 'performance' | 'error' | 'security' | 'capacity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  agentId?: string;
  metric?: string;
  threshold?: number;
  currentValue?: number;
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  resolved_at?: string;
}

export class RealTimeMonitoringService {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private alerts: Alert[] = [];
  private systemHealth: SystemHealth;
  private agentPerformance: Map<string, AgentPerformance> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSystemHealth();
    this.initializeAgentPerformance();
    this.startRealTimeMonitoring();
  }

  /**
   * Initialize system health monitoring
   */
  private initializeSystemHealth(): void {
    this.systemHealth = {
      overall: 'healthy',
      components: {
        database: 'healthy',
        api: 'healthy',
        ai_services: 'healthy',
        external_integrations: 'healthy'
      },
      uptime: 0,
      lastCheck: new Date().toISOString(),
      issues: []
    };
  }

  /**
   * Initialize agent performance tracking
   */
  private initializeAgentPerformance(): void {
    const defaultAgents = [
      {
        agentId: 'claude-ai',
        name: 'Claude AI Assistant',
        status: 'active' as const
      },
      {
        agentId: 'rapid-crm-ai',
        name: 'Rapid CRM AI',
        status: 'active' as const
      },
      {
        agentId: 'ui-specialist',
        name: 'UI Specialist Agent',
        status: 'active' as const
      },
      {
        agentId: 'data-management',
        name: 'Data Management Agent',
        status: 'active' as const
      },
      {
        agentId: 'service-integration',
        name: 'Service Integration Agent',
        status: 'active' as const
      }
    ];

    defaultAgents.forEach(agent => {
      this.agentPerformance.set(agent.agentId, {
        ...agent,
        metrics: {
          responseTime: Math.random() * 2000 + 500, // 500-2500ms
          accuracy: Math.random() * 0.2 + 0.8, // 80-100%
          throughput: Math.random() * 50 + 10, // 10-60 requests/min
          errorRate: Math.random() * 0.05, // 0-5%
          userSatisfaction: Math.random() * 0.3 + 0.7, // 70-100%
          costEfficiency: Math.random() * 0.4 + 0.6 // 60-100%
        },
        trends: {
          responseTime: this.getRandomTrend(),
          accuracy: this.getRandomTrend(),
          throughput: this.getRandomTrend()
        },
        lastActivity: new Date().toISOString(),
        totalRequests: Math.floor(Math.random() * 1000) + 100,
        successfulRequests: Math.floor(Math.random() * 900) + 90,
        failedRequests: Math.floor(Math.random() * 50) + 5
      });
    });
  }

  /**
   * Get random trend direction
   */
  private getRandomTrend(): 'improving' | 'stable' | 'degrading' {
    const trends = ['improving', 'stable', 'degrading'];
    return trends[Math.floor(Math.random() * trends.length)] as 'improving' | 'stable' | 'degrading';
  }

  /**
   * Start real-time monitoring
   */
  private startRealTimeMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.updateSystemHealth();
      this.updateAgentPerformance();
      this.checkAlerts();
    }, 5000); // Update every 5 seconds
  }

  /**
   * Update system health
   */
  private updateSystemHealth(): void {
    // Simulate system health checks
    const components = ['database', 'api', 'ai_services', 'external_integrations'];
    let healthyCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    components.forEach(component => {
      const health = this.getRandomHealth();
      this.systemHealth.components[component as keyof typeof this.systemHealth.components] = health;
      
      if (health === 'healthy') healthyCount++;
      else if (health === 'warning') warningCount++;
      else criticalCount++;
    });

    // Determine overall health
    if (criticalCount > 0) {
      this.systemHealth.overall = 'critical';
    } else if (warningCount > 0) {
      this.systemHealth.overall = 'warning';
    } else {
      this.systemHealth.overall = 'healthy';
    }

    this.systemHealth.uptime = process.uptime();
    this.systemHealth.lastCheck = new Date().toISOString();
  }

  /**
   * Get random health status
   */
  private getRandomHealth(): 'healthy' | 'warning' | 'critical' {
    const rand = Math.random();
    if (rand > 0.9) return 'critical';
    if (rand > 0.7) return 'warning';
    return 'healthy';
  }

  /**
   * Update agent performance metrics
   */
  private updateAgentPerformance(): void {
    this.agentPerformance.forEach((agent, agentId) => {
      // Simulate metric changes
      const change = (Math.random() - 0.5) * 0.1; // -5% to +5% change
      
      agent.metrics.responseTime = Math.max(100, agent.metrics.responseTime + change * 100);
      agent.metrics.accuracy = Math.min(1, Math.max(0.5, agent.metrics.accuracy + change));
      agent.metrics.throughput = Math.max(1, agent.metrics.throughput + change * 10);
      agent.metrics.errorRate = Math.min(0.1, Math.max(0, agent.metrics.errorRate + change * 0.01));
      agent.metrics.userSatisfaction = Math.min(1, Math.max(0.3, agent.metrics.userSatisfaction + change));
      agent.metrics.costEfficiency = Math.min(1, Math.max(0.2, agent.metrics.costEfficiency + change));

      agent.lastActivity = new Date().toISOString();
      agent.totalRequests += Math.floor(Math.random() * 5);
      agent.successfulRequests += Math.floor(Math.random() * 4);
      agent.failedRequests += Math.floor(Math.random() * 2);

      // Update trends based on recent changes
      if (change > 0.02) {
        agent.trends.responseTime = 'degrading';
        agent.trends.accuracy = 'improving';
        agent.trends.throughput = 'improving';
      } else if (change < -0.02) {
        agent.trends.responseTime = 'improving';
        agent.trends.accuracy = 'degrading';
        agent.trends.throughput = 'degrading';
      } else {
        agent.trends.responseTime = 'stable';
        agent.trends.accuracy = 'stable';
        agent.trends.throughput = 'stable';
      }
    });
  }

  /**
   * Check for alerts
   */
  private checkAlerts(): void {
    this.agentPerformance.forEach((agent, agentId) => {
      // Check response time alert
      if (agent.metrics.responseTime > 3000) {
        this.createAlert({
          type: 'performance',
          severity: 'high',
          title: 'High Response Time',
          description: `${agent.name} response time is ${agent.metrics.responseTime.toFixed(0)}ms`,
          agentId,
          metric: 'response_time',
          threshold: 3000,
          currentValue: agent.metrics.responseTime
        });
      }

      // Check error rate alert
      if (agent.metrics.errorRate > 0.05) {
        this.createAlert({
          type: 'error',
          severity: 'medium',
          title: 'High Error Rate',
          description: `${agent.name} error rate is ${(agent.metrics.errorRate * 100).toFixed(1)}%`,
          agentId,
          metric: 'error_rate',
          threshold: 0.05,
          currentValue: agent.metrics.errorRate
        });
      }

      // Check accuracy alert
      if (agent.metrics.accuracy < 0.8) {
        this.createAlert({
          type: 'performance',
          severity: 'medium',
          title: 'Low Accuracy',
          description: `${agent.name} accuracy is ${(agent.metrics.accuracy * 100).toFixed(1)}%`,
          agentId,
          metric: 'accuracy',
          threshold: 0.8,
          currentValue: agent.metrics.accuracy
        });
      }
    });

    // Check system health alerts
    if (this.systemHealth.overall === 'critical') {
      this.createAlert({
        type: 'capacity',
        severity: 'critical',
        title: 'System Critical',
        description: 'System health is critical. Immediate attention required.',
        metric: 'system_health',
        currentValue: 0
      });
    }
  }

  /**
   * Create a new alert
   */
  private createAlert(alertData: Omit<Alert, 'id' | 'status' | 'created_at'>): void {
    // Check if similar alert already exists
    const existingAlert = this.alerts.find(alert => 
      alert.agentId === alertData.agentId && 
      alert.metric === alertData.metric && 
      alert.status === 'active'
    );

    if (existingAlert) return; // Don't create duplicate alerts

    const alert: Alert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      created_at: new Date().toISOString()
    };

    this.alerts.unshift(alert); // Add to beginning of array

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }
  }

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    return this.systemHealth;
  }

  /**
   * Get agent performance
   */
  async getAgentPerformance(agentId?: string): Promise<AgentPerformance | AgentPerformance[]> {
    if (agentId) {
      return this.agentPerformance.get(agentId) || null;
    }
    return Array.from(this.agentPerformance.values());
  }

  /**
   * Get performance metrics
   */
  async getMetrics(agentId?: string, metricType?: string, limit: number = 100): Promise<PerformanceMetric[]> {
    let allMetrics: PerformanceMetric[] = [];

    if (agentId) {
      allMetrics = this.metrics.get(agentId) || [];
    } else {
      this.metrics.forEach(agentMetrics => {
        allMetrics.push(...agentMetrics);
      });
    }

    if (metricType) {
      allMetrics = allMetrics.filter(metric => metric.metricType === metricType);
    }

    return allMetrics
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get alerts
   */
  async getAlerts(status?: string, severity?: string, limit: number = 50): Promise<Alert[]> {
    let filteredAlerts = this.alerts;

    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }

    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }

    return filteredAlerts.slice(0, limit);
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && alert.status === 'active') {
      alert.status = 'acknowledged';
      return true;
    }
    return false;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && alert.status !== 'resolved') {
      alert.status = 'resolved';
      alert.resolved_at = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Record a performance metric
   */
  async recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): Promise<PerformanceMetric> {
    const newMetric: PerformanceMetric = {
      ...metric,
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    if (!this.metrics.has(metric.agentId)) {
      this.metrics.set(metric.agentId, []);
    }

    const agentMetrics = this.metrics.get(metric.agentId)!;
    agentMetrics.push(newMetric);

    // Keep only last 1000 metrics per agent
    if (agentMetrics.length > 1000) {
      agentMetrics.splice(0, agentMetrics.length - 1000);
    }

    return newMetric;
  }

  /**
   * Get performance dashboard data
   */
  async getDashboardData(): Promise<{
    systemHealth: SystemHealth;
    agentPerformance: AgentPerformance[];
    recentAlerts: Alert[];
    metrics: {
      totalRequests: number;
      averageResponseTime: number;
      overallAccuracy: number;
      activeAlerts: number;
    };
  }> {
    const agentPerformance = Array.from(this.agentPerformance.values());
    const recentAlerts = this.alerts.filter(alert => alert.status === 'active').slice(0, 10);

    const totalRequests = agentPerformance.reduce((sum, agent) => sum + agent.totalRequests, 0);
    const averageResponseTime = agentPerformance.reduce((sum, agent) => sum + agent.metrics.responseTime, 0) / agentPerformance.length;
    const overallAccuracy = agentPerformance.reduce((sum, agent) => sum + agent.metrics.accuracy, 0) / agentPerformance.length;
    const activeAlerts = this.alerts.filter(alert => alert.status === 'active').length;

    return {
      systemHealth: this.systemHealth,
      agentPerformance,
      recentAlerts,
      metrics: {
        totalRequests,
        averageResponseTime,
        overallAccuracy,
        activeAlerts
      }
    };
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

// Export singleton instance
export const realTimeMonitoringService = new RealTimeMonitoringService();














