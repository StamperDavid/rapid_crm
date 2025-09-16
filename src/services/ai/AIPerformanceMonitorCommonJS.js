/**
 * AI PERFORMANCE MONITORING SYSTEM - CommonJS Version
 * Real-time monitoring and analytics for AI agent performance
 */

class AIPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.alerts = new Map();
    this.thresholds = {
      responseTime: { warning: 5000, critical: 10000 },
      accuracy: { warning: 0.8, critical: 0.6 },
      errorRate: { warning: 0.05, critical: 0.1 },
      satisfaction: { warning: 0.7, critical: 0.5 },
      resourceUsage: { warning: 0.8, critical: 0.95 }
    };
    this.monitoringInterval = null;
    this.startMonitoring();
    console.log('📊 AI Performance Monitor initialized');
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring() {
    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.checkPerformanceThresholds();
    }, 30000);
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric) {
    if (!this.metrics.has(metric.agentId)) {
      this.metrics.set(metric.agentId, []);
    }

    const agentMetrics = this.metrics.get(metric.agentId);
    agentMetrics.push(metric);

    // Keep only last 1000 metrics per agent
    if (agentMetrics.length > 1000) {
      agentMetrics.splice(0, agentMetrics.length - 1000);
    }

    // Check for immediate alerts
    this.checkImmediateAlerts(metric);
  }

  /**
   * Check for immediate performance alerts
   */
  checkImmediateAlerts(metric) {
    const alerts = [];

    // Response time alerts
    if (metric.responseTime > this.thresholds.responseTime.critical) {
      alerts.push({
        id: `response_time_critical_${Date.now()}`,
        agentId: metric.agentId,
        type: 'performance',
        severity: 'critical',
        message: `Critical response time: ${metric.responseTime}ms`,
        threshold: this.thresholds.responseTime.critical,
        actualValue: metric.responseTime,
        timestamp: metric.timestamp,
        resolved: false
      });
    } else if (metric.responseTime > this.thresholds.responseTime.warning) {
      alerts.push({
        id: `response_time_warning_${Date.now()}`,
        agentId: metric.agentId,
        type: 'performance',
        severity: 'medium',
        message: `High response time: ${metric.responseTime}ms`,
        threshold: this.thresholds.responseTime.warning,
        actualValue: metric.responseTime,
        timestamp: metric.timestamp,
        resolved: false
      });
    }

    // Accuracy alerts
    if (metric.accuracy < this.thresholds.accuracy.critical) {
      alerts.push({
        id: `accuracy_critical_${Date.now()}`,
        agentId: metric.agentId,
        type: 'accuracy',
        severity: 'critical',
        message: `Critical accuracy drop: ${(metric.accuracy * 100).toFixed(1)}%`,
        threshold: this.thresholds.accuracy.critical,
        actualValue: metric.accuracy,
        timestamp: metric.timestamp,
        resolved: false
      });
    }

    // Error rate alerts
    if (metric.errorRate > this.thresholds.errorRate.critical) {
      alerts.push({
        id: `error_rate_critical_${Date.now()}`,
        agentId: metric.agentId,
        type: 'error',
        severity: 'critical',
        message: `Critical error rate: ${(metric.errorRate * 100).toFixed(1)}%`,
        threshold: this.thresholds.errorRate.critical,
        actualValue: metric.errorRate,
        timestamp: metric.timestamp,
        resolved: false
      });
    }

    // Store alerts
    alerts.forEach(alert => {
      if (!this.alerts.has(metric.agentId)) {
        this.alerts.set(metric.agentId, []);
      }
      this.alerts.get(metric.agentId).push(alert);
    });
  }

  /**
   * Check performance thresholds periodically
   */
  checkPerformanceThresholds() {
    for (const [agentId, metrics] of this.metrics.entries()) {
      if (metrics.length === 0) continue;

      // Get recent metrics (last 5 minutes)
      const recentMetrics = metrics.filter(m => 
        Date.now() - new Date(m.timestamp).getTime() < 5 * 60 * 1000
      );

      if (recentMetrics.length === 0) continue;

      // Calculate averages
      const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
      const avgAccuracy = recentMetrics.reduce((sum, m) => sum + m.accuracy, 0) / recentMetrics.length;
      const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length;

      // Check for sustained issues
      this.checkSustainedIssues(agentId, avgResponseTime, avgAccuracy, avgErrorRate);
    }
  }

  /**
   * Check for sustained performance issues
   */
  checkSustainedIssues(agentId, avgResponseTime, avgAccuracy, avgErrorRate) {
    const alerts = [];

    // Sustained high response time
    if (avgResponseTime > this.thresholds.responseTime.warning) {
      alerts.push({
        id: `sustained_response_time_${Date.now()}`,
        agentId,
        type: 'performance',
        severity: 'medium',
        message: `Sustained high response time: ${avgResponseTime.toFixed(0)}ms average`,
        threshold: this.thresholds.responseTime.warning,
        actualValue: avgResponseTime,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Store alerts
    alerts.forEach(alert => {
      if (!this.alerts.has(agentId)) {
        this.alerts.set(agentId, []);
      }
      this.alerts.get(agentId).push(alert);
    });
  }

  /**
   * Generate performance report
   */
  generateReport(agentId, period = 'day') {
    const metrics = this.metrics.get(agentId) || [];
    const agentAlerts = this.alerts.get(agentId) || [];

    // Calculate time range
    const now = new Date();
    const startTime = new Date(now.getTime() - this.getPeriodMs(period));
    const endTime = now;

    // Filter metrics for the period
    const periodMetrics = metrics.filter(m => {
      const metricTime = new Date(m.timestamp);
      return metricTime >= startTime && metricTime <= endTime;
    });

    if (periodMetrics.length === 0) {
      // Return mock data for demonstration
      return {
        agentId,
        period,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        summary: {
          totalRequests: 0,
          averageResponseTime: 0,
          averageAccuracy: 0,
          averageSatisfaction: 0,
          errorRate: 0,
          uptime: 100
        },
        trends: {
          responseTime: 'stable',
          accuracy: 'stable',
          satisfaction: 'stable'
        },
        alerts: [],
        recommendations: ['No data available for the specified period']
      };
    }

    // Calculate summary
    const totalRequests = periodMetrics.length;
    const averageResponseTime = periodMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const averageAccuracy = periodMetrics.reduce((sum, m) => sum + m.accuracy, 0) / totalRequests;
    const averageSatisfaction = periodMetrics.reduce((sum, m) => sum + m.userSatisfaction, 0) / totalRequests;
    const errorRate = periodMetrics.reduce((sum, m) => sum + m.errorRate, 0) / totalRequests;
    const uptime = this.calculateUptime(periodMetrics);

    // Analyze trends
    const trends = this.analyzeTrends(periodMetrics);

    // Get recent alerts
    const recentAlerts = agentAlerts.filter(a => 
      new Date(a.timestamp) >= startTime && !a.resolved
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(periodMetrics, recentAlerts);

    return {
      agentId,
      period,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      summary: {
        totalRequests,
        averageResponseTime,
        averageAccuracy,
        averageSatisfaction,
        errorRate,
        uptime
      },
      trends,
      alerts: recentAlerts,
      recommendations
    };
  }

  /**
   * Get period duration in milliseconds
   */
  getPeriodMs(period) {
    switch (period) {
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      case 'week': return 7 * 24 * 60 * 60 * 1000;
      case 'month': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Calculate uptime percentage
   */
  calculateUptime(metrics) {
    const totalTime = metrics.length * 30 * 1000; // Assuming 30-second intervals
    const errorTime = metrics.filter(m => m.errorRate > 0.1).length * 30 * 1000;
    return Math.max(0, ((totalTime - errorTime) / totalTime) * 100);
  }

  /**
   * Analyze performance trends
   */
  analyzeTrends(metrics) {
    if (metrics.length < 10) {
      return { responseTime: 'stable', accuracy: 'stable', satisfaction: 'stable' };
    }

    const firstHalf = metrics.slice(0, Math.floor(metrics.length / 2));
    const secondHalf = metrics.slice(Math.floor(metrics.length / 2));

    const avgResponseTime1 = firstHalf.reduce((sum, m) => sum + m.responseTime, 0) / firstHalf.length;
    const avgResponseTime2 = secondHalf.reduce((sum, m) => sum + m.responseTime, 0) / secondHalf.length;
    
    const avgAccuracy1 = firstHalf.reduce((sum, m) => sum + m.accuracy, 0) / firstHalf.length;
    const avgAccuracy2 = secondHalf.reduce((sum, m) => sum + m.accuracy, 0) / secondHalf.length;
    
    const avgSatisfaction1 = firstHalf.reduce((sum, m) => sum + m.userSatisfaction, 0) / firstHalf.length;
    const avgSatisfaction2 = secondHalf.reduce((sum, m) => sum + m.userSatisfaction, 0) / secondHalf.length;

    const getTrend = (first, second, threshold = 0.05) => {
      const change = (second - first) / first;
      if (change > threshold) return 'improving';
      if (change < -threshold) return 'degrading';
      return 'stable';
    };

    return {
      responseTime: getTrend(avgResponseTime1, avgResponseTime2, 0.1), // Lower is better
      accuracy: getTrend(avgAccuracy1, avgAccuracy2),
      satisfaction: getTrend(avgSatisfaction1, avgSatisfaction2)
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(metrics, alerts) {
    const recommendations = [];

    const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
    const avgAccuracy = metrics.reduce((sum, m) => sum + m.accuracy, 0) / metrics.length;
    const avgErrorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length;

    if (avgResponseTime > 5000) {
      recommendations.push('Consider optimizing agent processing algorithms to reduce response time');
    }

    if (avgAccuracy < 0.8) {
      recommendations.push('Review and improve agent training data and model parameters');
    }

    if (avgErrorRate > 0.05) {
      recommendations.push('Implement better error handling and validation in agent responses');
    }

    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push('Address critical performance alerts immediately');
    }

    return recommendations;
  }

  /**
   * Get current metrics for an agent
   */
  getCurrentMetrics(agentId) {
    return this.metrics.get(agentId) || [];
  }

  /**
   * Get active alerts for an agent
   */
  getActiveAlerts(agentId) {
    const alerts = this.alerts.get(agentId) || [];
    return alerts.filter(a => !a.resolved);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(agentId, alertId) {
    const alerts = this.alerts.get(agentId);
    if (alerts) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.resolved = true;
        console.log(`✅ Resolved alert: ${alertId} for agent: ${agentId}`);
      }
    }
  }
}

// Export singleton instance using CommonJS
const aiPerformanceMonitor = new AIPerformanceMonitor();
module.exports = { aiPerformanceMonitor };
