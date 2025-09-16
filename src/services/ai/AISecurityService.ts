/**
 * AI Security and Access Controls Service
 * Handles AI security, access controls, and compliance monitoring
 */

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'access_control' | 'data_protection' | 'rate_limiting' | 'content_filtering' | 'audit_logging';
  rules: SecurityRule[];
  isActive: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface SecurityRule {
  id: string;
  name: string;
  condition: string;
  action: 'allow' | 'deny' | 'log' | 'alert' | 'quarantine';
  parameters?: any;
}

export interface AccessControl {
  id: string;
  userId: string;
  aiAgentId: string;
  permissions: string[];
  restrictions: string[];
  expiresAt?: string;
  created_at: string;
  updated_at: string;
}

export interface SecurityEvent {
  id: string;
  type: 'access_attempt' | 'policy_violation' | 'suspicious_activity' | 'data_breach' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  aiAgentId?: string;
  description: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
}

export interface ComplianceReport {
  id: string;
  type: 'gdpr' | 'ccpa' | 'sox' | 'hipaa' | 'iso27001';
  status: 'compliant' | 'non_compliant' | 'requires_review';
  findings: ComplianceFinding[];
  generated_at: string;
  valid_until: string;
}

export interface ComplianceFinding {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  categories: string[];
  retentionPeriod: number; // days
  encryptionRequired: boolean;
  accessLoggingRequired: boolean;
}

export class AISecurityService {
  private policies: Map<string, SecurityPolicy> = new Map();
  private accessControls: Map<string, AccessControl> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private complianceReports: ComplianceReport[] = [];
  private dataClassifications: Map<string, DataClassification> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
    this.initializeDataClassifications();
  }

  /**
   * Initialize default security policies
   */
  private initializeDefaultPolicies(): void {
    const defaultPolicies: SecurityPolicy[] = [
      {
        id: 'policy-001',
        name: 'AI Access Control',
        description: 'Controls access to AI agents and services',
        type: 'access_control',
        rules: [
          {
            id: 'rule-001',
            name: 'Admin Only Access',
            condition: 'user.role === "admin"',
            action: 'allow'
          },
          {
            id: 'rule-002',
            name: 'Rate Limiting',
            condition: 'requests_per_minute > 60',
            action: 'deny'
          }
        ],
        isActive: true,
        priority: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'policy-002',
        name: 'Data Protection',
        description: 'Protects sensitive data in AI interactions',
        type: 'data_protection',
        rules: [
          {
            id: 'rule-003',
            name: 'PII Detection',
            condition: 'contains_pii === true',
            action: 'log',
            parameters: { logLevel: 'high' }
          },
          {
            id: 'rule-004',
            name: 'Encryption Required',
            condition: 'data_classification === "confidential"',
            action: 'allow',
            parameters: { encryptionRequired: true }
          }
        ],
        isActive: true,
        priority: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'policy-003',
        name: 'Content Filtering',
        description: 'Filters inappropriate or harmful content',
        type: 'content_filtering',
        rules: [
          {
            id: 'rule-005',
            name: 'Toxic Content',
            condition: 'toxicity_score > 0.8',
            action: 'deny'
          },
          {
            id: 'rule-006',
            name: 'Suspicious Patterns',
            condition: 'suspicious_patterns.length > 0',
            action: 'alert'
          }
        ],
        isActive: true,
        priority: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    defaultPolicies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });
  }

  /**
   * Initialize data classifications
   */
  private initializeDataClassifications(): void {
    const classifications: { [key: string]: DataClassification } = {
      'public': {
        level: 'public',
        categories: ['marketing', 'general_info'],
        retentionPeriod: 365,
        encryptionRequired: false,
        accessLoggingRequired: false
      },
      'internal': {
        level: 'internal',
        categories: ['business_operations', 'internal_communications'],
        retentionPeriod: 2555, // 7 years
        encryptionRequired: false,
        accessLoggingRequired: true
      },
      'confidential': {
        level: 'confidential',
        categories: ['customer_data', 'financial_info', 'business_strategy'],
        retentionPeriod: 2555, // 7 years
        encryptionRequired: true,
        accessLoggingRequired: true
      },
      'restricted': {
        level: 'restricted',
        categories: ['pii', 'health_data', 'payment_info', 'trade_secrets'],
        retentionPeriod: 2555, // 7 years
        encryptionRequired: true,
        accessLoggingRequired: true
      }
    };

    Object.entries(classifications).forEach(([key, classification]) => {
      this.dataClassifications.set(key, classification);
    });
  }

  /**
   * Check if user has access to AI agent
   */
  async checkAccess(userId: string, aiAgentId: string, action: string): Promise<{
    allowed: boolean;
    reason?: string;
    restrictions?: string[];
  }> {
    // Check access controls
    const accessControl = Array.from(this.accessControls.values())
      .find(ac => ac.userId === userId && ac.aiAgentId === aiAgentId);

    if (!accessControl) {
      this.logSecurityEvent({
        type: 'access_attempt',
        severity: 'medium',
        userId,
        aiAgentId,
        description: `Access attempt to ${aiAgentId} without proper access control`,
        details: { action, result: 'denied' }
      });
      return { allowed: false, reason: 'No access control found' };
    }

    // Check if access has expired
    if (accessControl.expiresAt && new Date(accessControl.expiresAt) < new Date()) {
      this.logSecurityEvent({
        type: 'access_attempt',
        severity: 'medium',
        userId,
        aiAgentId,
        description: `Access attempt with expired access control`,
        details: { action, result: 'denied', reason: 'expired' }
      });
      return { allowed: false, reason: 'Access control has expired' };
    }

    // Check permissions
    if (!accessControl.permissions.includes(action)) {
      this.logSecurityEvent({
        type: 'access_attempt',
        severity: 'medium',
        userId,
        aiAgentId,
        description: `Access attempt without required permission: ${action}`,
        details: { action, result: 'denied', reason: 'insufficient_permissions' }
      });
      return { allowed: false, reason: `Permission '${action}' not granted` };
    }

    // Check restrictions
    if (accessControl.restrictions.includes(action)) {
      this.logSecurityEvent({
        type: 'access_attempt',
        severity: 'medium',
        userId,
        aiAgentId,
        description: `Access attempt to restricted action: ${action}`,
        details: { action, result: 'denied', reason: 'action_restricted' }
      });
      return { allowed: false, reason: `Action '${action}' is restricted` };
    }

    return { allowed: true, restrictions: accessControl.restrictions };
  }

  /**
   * Apply security policies
   */
  async applyPolicies(context: any): Promise<{
    allowed: boolean;
    actions: string[];
    violations: string[];
  }> {
    const actions: string[] = [];
    const violations: string[] = [];

    // Sort policies by priority
    const sortedPolicies = Array.from(this.policies.values())
      .filter(policy => policy.isActive)
      .sort((a, b) => a.priority - b.priority);

    for (const policy of sortedPolicies) {
      for (const rule of policy.rules) {
        try {
          // Evaluate rule condition (simplified - in real implementation, use a proper rule engine)
          const conditionMet = this.evaluateCondition(rule.condition, context);
          
          if (conditionMet) {
            actions.push(rule.action);
            
            if (rule.action === 'deny') {
              violations.push(`${policy.name}: ${rule.name}`);
            }
          }
        } catch (error) {
          console.error(`Error evaluating rule ${rule.id}:`, error);
        }
      }
    }

    const allowed = !actions.includes('deny');

    if (!allowed) {
      this.logSecurityEvent({
        type: 'policy_violation',
        severity: 'high',
        description: `Policy violation detected`,
        details: { context, violations, actions }
      });
    }

    return { allowed, actions, violations };
  }

  /**
   * Evaluate a security rule condition (simplified implementation)
   */
  private evaluateCondition(condition: string, context: any): boolean {
    // This is a simplified implementation
    // In a real system, you'd use a proper rule engine like json-rules-engine
    
    try {
      // Replace context variables
      let evalCondition = condition;
      Object.keys(context).forEach(key => {
        const value = typeof context[key] === 'string' ? `"${context[key]}"` : context[key];
        evalCondition = evalCondition.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
      });

      // Simple evaluation (be very careful with eval in production!)
      return eval(evalCondition);
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Log a security event
   */
  private logSecurityEvent(eventData: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const event: SecurityEvent = {
      ...eventData,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    this.securityEvents.unshift(event);

    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(0, 1000);
    }
  }

  /**
   * Create access control
   */
  async createAccessControl(accessControl: Omit<AccessControl, 'id' | 'created_at' | 'updated_at'>): Promise<AccessControl> {
    const newAccessControl: AccessControl = {
      ...accessControl,
      id: `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.accessControls.set(newAccessControl.id, newAccessControl);
    return newAccessControl;
  }

  /**
   * Get access controls
   */
  async getAccessControls(userId?: string, aiAgentId?: string): Promise<AccessControl[]> {
    let controls = Array.from(this.accessControls.values());

    if (userId) {
      controls = controls.filter(control => control.userId === userId);
    }

    if (aiAgentId) {
      controls = controls.filter(control => control.aiAgentId === aiAgentId);
    }

    return controls;
  }

  /**
   * Update access control
   */
  async updateAccessControl(accessControlId: string, updates: Partial<AccessControl>): Promise<AccessControl | null> {
    const accessControl = this.accessControls.get(accessControlId);
    if (!accessControl) return null;

    const updatedAccessControl = {
      ...accessControl,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.accessControls.set(accessControlId, updatedAccessControl);
    return updatedAccessControl;
  }

  /**
   * Delete access control
   */
  async deleteAccessControl(accessControlId: string): Promise<boolean> {
    return this.accessControls.delete(accessControlId);
  }

  /**
   * Get security events
   */
  async getSecurityEvents(filters?: {
    type?: string;
    severity?: string;
    userId?: string;
    aiAgentId?: string;
    status?: string;
    limit?: number;
  }): Promise<SecurityEvent[]> {
    let events = this.securityEvents;

    if (filters) {
      if (filters.type) {
        events = events.filter(event => event.type === filters.type);
      }
      if (filters.severity) {
        events = events.filter(event => event.severity === filters.severity);
      }
      if (filters.userId) {
        events = events.filter(event => event.userId === filters.userId);
      }
      if (filters.aiAgentId) {
        events = events.filter(event => event.aiAgentId === filters.aiAgentId);
      }
      if (filters.status) {
        events = events.filter(event => event.status === filters.status);
      }
      if (filters.limit) {
        events = events.slice(0, filters.limit);
      }
    }

    return events;
  }

  /**
   * Update security event status
   */
  async updateSecurityEventStatus(eventId: string, status: SecurityEvent['status']): Promise<boolean> {
    const event = this.securityEvents.find(e => e.id === eventId);
    if (event) {
      event.status = status;
      return true;
    }
    return false;
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(type: ComplianceReport['type']): Promise<ComplianceReport> {
    const findings: ComplianceFinding[] = [];

    // Simulate compliance checks
    if (type === 'gdpr') {
      findings.push(
        {
          id: 'gdpr-001',
          category: 'Data Processing',
          description: 'AI agents process personal data without explicit consent',
          severity: 'high',
          recommendation: 'Implement consent management system',
          status: 'open'
        },
        {
          id: 'gdpr-002',
          category: 'Data Retention',
          description: 'Some data is retained longer than necessary',
          severity: 'medium',
          recommendation: 'Implement automated data deletion policies',
          status: 'open'
        }
      );
    }

    if (type === 'ccpa') {
      findings.push(
        {
          id: 'ccpa-001',
          category: 'Consumer Rights',
          description: 'No mechanism for consumers to request data deletion',
          severity: 'high',
          recommendation: 'Implement data deletion request system',
          status: 'open'
        }
      );
    }

    const report: ComplianceReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      status: findings.some(f => f.severity === 'high' || f.severity === 'critical') ? 'non_compliant' : 'compliant',
      findings,
      generated_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    this.complianceReports.unshift(report);
    return report;
  }

  /**
   * Get compliance reports
   */
  async getComplianceReports(type?: string, limit: number = 10): Promise<ComplianceReport[]> {
    let reports = this.complianceReports;

    if (type) {
      reports = reports.filter(report => report.type === type);
    }

    return reports.slice(0, limit);
  }

  /**
   * Get data classification
   */
  async getDataClassification(level: string): Promise<DataClassification | null> {
    return this.dataClassifications.get(level) || null;
  }

  /**
   * Classify data
   */
  async classifyData(data: any): Promise<{
    classification: string;
    confidence: number;
    reasons: string[];
  }> {
    // Simplified data classification logic
    const reasons: string[] = [];
    let classification = 'public';
    let confidence = 0.8;

    // Check for PII patterns
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email
    ];

    const dataString = JSON.stringify(data);
    const hasPII = piiPatterns.some(pattern => pattern.test(dataString));

    if (hasPII) {
      classification = 'restricted';
      confidence = 0.95;
      reasons.push('Contains personally identifiable information');
    } else if (dataString.includes('confidential') || dataString.includes('secret')) {
      classification = 'confidential';
      confidence = 0.85;
      reasons.push('Contains confidential information');
    } else if (dataString.includes('internal') || dataString.includes('business')) {
      classification = 'internal';
      confidence = 0.75;
      reasons.push('Contains internal business information');
    }

    return { classification, confidence, reasons };
  }

  /**
   * Get security dashboard data
   */
  async getSecurityDashboard(): Promise<{
    totalEvents: number;
    criticalEvents: number;
    activePolicies: number;
    accessControls: number;
    recentEvents: SecurityEvent[];
    complianceStatus: { [key: string]: string };
  }> {
    const totalEvents = this.securityEvents.length;
    const criticalEvents = this.securityEvents.filter(e => e.severity === 'critical').length;
    const activePolicies = Array.from(this.policies.values()).filter(p => p.isActive).length;
    const accessControls = this.accessControls.size;
    const recentEvents = this.securityEvents.slice(0, 10);

    const complianceStatus: { [key: string]: string } = {};
    const reportTypes = ['gdpr', 'ccpa', 'sox', 'hipaa', 'iso27001'];
    
    reportTypes.forEach(type => {
      const latestReport = this.complianceReports.find(r => r.type === type);
      complianceStatus[type] = latestReport ? latestReport.status : 'not_assessed';
    });

    return {
      totalEvents,
      criticalEvents,
      activePolicies,
      accessControls,
      recentEvents,
      complianceStatus
    };
  }
}

// Export singleton instance
export const aiSecurityService = new AISecurityService();


