import { Rule } from '../../types/schema';

export interface RuleContext {
  userId?: string;
  companyId?: string;
  agentId?: string;
  sessionId?: string;
  environment?: 'development' | 'staging' | 'production';
  userRole?: string;
  data?: Record<string, any>;
  timestamp: string;
}

export interface RuleEvaluation {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  conditions: {
    condition: string;
    met: boolean;
    value?: any;
  }[];
  actions: string[];
  priority: number;
  executionTime: number;
  metadata: {
    evaluatedAt: string;
    context: RuleContext;
  };
}

export interface RuleExecutionResult {
  evaluations: RuleEvaluation[];
  executedActions: string[];
  blockedActions: string[];
  warnings: string[];
  errors: string[];
  totalExecutionTime: number;
}

export class RulesEngineService {
  private rules: Map<string, Rule> = new Map();
  private ruleHistory: Map<string, RuleEvaluation[]> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeDefaultRules();
  }

  private async initializeDefaultRules(): Promise<void> {
    const defaultRules: Rule[] = [
      {
        id: 'usdot_validation',
        name: 'USDOT Data Validation',
        description: 'Validate USDOT application data against FMCSA requirements',
        priority: 0,
        conditions: [
          'usdot_application_data_present',
          'fmcsa_rules_updated',
          'data_completeness_check'
        ],
        actions: [
          'validate_required_fields',
          'check_data_format',
          'verify_compliance',
          'flag_discrepancies'
        ],
        supersedes: [],
        supersededBy: [],
        category: 'compliance'
      },
      {
        id: 'data_privacy',
        name: 'Data Privacy Protection',
        description: 'Ensure all personal and business data is handled according to privacy regulations',
        priority: 0,
        conditions: [
          'personal_data_present',
          'gdpr_compliance_required',
          'data_processing_consent'
        ],
        actions: [
          'encrypt_sensitive_data',
          'log_data_access',
          'anonymize_where_possible',
          'audit_data_usage'
        ],
        supersedes: [],
        supersededBy: [],
        category: 'privacy'
      },
      {
        id: 'automation_safety',
        name: 'Automation Safety Checks',
        description: 'Safety checks for robotic process automation',
        priority: 0,
        conditions: [
          'automation_task_initiated',
          'safety_checks_enabled',
          'system_health_verified'
        ],
        actions: [
          'verify_data_integrity',
          'check_system_status',
          'validate_permissions',
          'confirm_automation_scope'
        ],
        supersedes: [],
        supersededBy: [],
        category: 'safety'
      },
      {
        id: 'customer_service_etiquette',
        name: 'Customer Service Etiquette',
        description: 'Maintain professional and helpful customer service standards',
        priority: 1,
        conditions: [
          'customer_interaction',
          'service_standards_active',
          'professional_mode_enabled'
        ],
        actions: [
          'use_polite_language',
          'acknowledge_concerns',
          'provide_clear_explanations',
          'escalate_when_needed'
        ],
        supersedes: [],
        supersededBy: [],
        category: 'service'
      },
      {
        id: 'sales_lead_prioritization',
        name: 'Sales Lead Prioritization',
        description: 'Prioritize sales leads based on engagement score and company size',
        priority: 3,
        conditions: [
          'lead_engagement_high',
          'company_size_large',
          'budget_confirmed'
        ],
        actions: [
          'assign_senior_sales_agent',
          'trigger_personalized_email',
          'schedule_priority_callback',
          'create_high_value_opportunity'
        ],
        supersedes: ['general_lead_assignment'],
        supersededBy: [],
        category: 'sales'
      },
      {
        id: 'customer_support_escalation',
        name: 'Customer Support Escalation',
        description: 'Escalate critical customer issues to a human agent after 3 failed AI attempts',
        priority: 1,
        conditions: [
          'ai_attempts_exceeded_3',
          'issue_severity_critical',
          'customer_satisfaction_low'
        ],
        actions: [
          'notify_human_agent',
          'create_support_ticket',
          'schedule_immediate_callback',
          'escalate_to_management'
        ],
        supersedes: ['ai_only_resolution'],
        supersededBy: [],
        category: 'customer_service'
      },
      {
        id: 'usdot_application_data_validation',
        name: 'USDOT Application Data Validation',
        description: 'Validate all USDOT application fields against FMCSA regulations before submission',
        priority: 0,
        conditions: [
          'usdot_application_complete',
          'fmcsa_rules_updated',
          'data_validation_enabled'
        ],
        actions: [
          'run_validation_checks',
          'flag_discrepancies',
          'verify_required_documents',
          'check_business_eligibility'
        ],
        supersedes: [],
        supersededBy: [],
        category: 'compliance'
      },
      {
        id: 'rate_limiting',
        name: 'API Rate Limiting',
        description: 'Implement rate limiting for API calls to prevent abuse',
        priority: 2,
        conditions: [
          'api_calls_exceeded_limit',
          'rate_limiting_enabled',
          'user_not_whitelisted'
        ],
        actions: [
          'throttle_api_requests',
          'return_rate_limit_error',
          'log_rate_limit_violation',
          'notify_administrator'
        ],
        supersedes: [],
        supersededBy: [],
        category: 'security'
      },
      {
        id: 'data_backup',
        name: 'Automated Data Backup',
        description: 'Automatically backup critical data at regular intervals',
        priority: 2,
        conditions: [
          'backup_schedule_triggered',
          'system_health_good',
          'backup_storage_available'
        ],
        actions: [
          'create_data_backup',
          'verify_backup_integrity',
          'update_backup_metadata',
          'cleanup_old_backups'
        ],
        supersedes: [],
        supersededBy: [],
        category: 'maintenance'
      },
      {
        id: 'security_audit',
        name: 'Security Audit Logging',
        description: 'Log all security-relevant events for audit purposes',
        priority: 1,
        conditions: [
          'security_event_detected',
          'audit_logging_enabled',
          'user_authentication_required'
        ],
        actions: [
          'log_security_event',
          'capture_user_context',
          'store_audit_trail',
          'alert_security_team'
        ],
        supersedes: [],
        supersededBy: [],
        category: 'security'
      }
    ];

    defaultRules.forEach(rule => this.rules.set(rule.id, rule));
    this.isInitialized = true;
    console.log('Rules engine initialized successfully');
  }

  async evaluateRules(context: RuleContext): Promise<RuleExecutionResult> {
    const startTime = Date.now();
    const evaluations: RuleEvaluation[] = [];
    const executedActions: string[] = [];
    const blockedActions: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Sort rules by priority (lower number = higher priority)
      const sortedRules = Array.from(this.rules.values())
        .sort((a, b) => a.priority - b.priority);

      for (const rule of sortedRules) {
        const evaluation = await this.evaluateRule(rule, context);
        evaluations.push(evaluation);

        if (evaluation.triggered) {
          // Check for superseding rules
          const supersedingRules = this.findSupersedingRules(rule, evaluations);
          
          if (supersedingRules.length === 0) {
            // Execute actions
            for (const action of evaluation.actions) {
              try {
                await this.executeAction(action, context);
                executedActions.push(action);
              } catch (error) {
                errors.push(`Failed to execute action ${action}: ${error}`);
              }
            }
          } else {
            // Rule is superseded, block its actions
            blockedActions.push(...evaluation.actions);
            warnings.push(`Rule ${rule.name} was superseded by higher priority rules`);
          }
        }
      }

      // Store evaluation history
      this.storeEvaluationHistory(evaluations);

    } catch (error) {
      errors.push(`Rules evaluation failed: ${error}`);
    }

    return {
      evaluations,
      executedActions,
      blockedActions,
      warnings,
      errors,
      totalExecutionTime: Date.now() - startTime
    };
  }

  private async evaluateRule(rule: Rule, context: RuleContext): Promise<RuleEvaluation> {
    const startTime = Date.now();
    const conditions: { condition: string; met: boolean; value?: any }[] = [];
    let allConditionsMet = true;

    for (const condition of rule.conditions) {
      const result = await this.evaluateCondition(condition, context);
      conditions.push({
        condition,
        met: result.met,
        value: result.value
      });
      
      if (!result.met) {
        allConditionsMet = false;
      }
    }

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      triggered: allConditionsMet,
      conditions,
      actions: rule.actions,
      priority: rule.priority,
      executionTime: Date.now() - startTime,
      metadata: {
        evaluatedAt: new Date().toISOString(),
        context
      }
    };
  }

  private async evaluateCondition(condition: string, context: RuleContext): Promise<{ met: boolean; value?: any }> {
    // Simulate condition evaluation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10));

    switch (condition) {
      case 'usdot_application_data_present':
        return { met: context.data?.usdotApplication !== undefined, value: context.data?.usdotApplication };
      
      case 'fmcsa_rules_updated':
        return { met: true, value: '2024-01-20' }; // Simulate updated rules
      
      case 'data_completeness_check':
        const data = context.data?.usdotApplication;
        return { met: data && Object.keys(data).length > 10, value: Object.keys(data || {}).length };
      
      case 'personal_data_present':
        return { met: context.data?.personalInfo !== undefined, value: context.data?.personalInfo };
      
      case 'gdpr_compliance_required':
        return { met: context.environment === 'production', value: context.environment };
      
      case 'data_processing_consent':
        return { met: context.data?.consent === true, value: context.data?.consent };
      
      case 'automation_task_initiated':
        return { met: context.data?.automationTask !== undefined, value: context.data?.automationTask };
      
      case 'safety_checks_enabled':
        return { met: true, value: true };
      
      case 'system_health_verified':
        return { met: Math.random() > 0.1, value: 'healthy' }; // 90% success rate
      
      case 'customer_interaction':
        return { met: context.agentId?.includes('customer'), value: context.agentId };
      
      case 'service_standards_active':
        return { met: true, value: true };
      
      case 'professional_mode_enabled':
        return { met: true, value: true };
      
      case 'lead_engagement_high':
        return { met: context.data?.engagementScore > 80, value: context.data?.engagementScore };
      
      case 'company_size_large':
        return { met: context.data?.companySize === 'large', value: context.data?.companySize };
      
      case 'budget_confirmed':
        return { met: context.data?.budgetConfirmed === true, value: context.data?.budgetConfirmed };
      
      case 'ai_attempts_exceeded_3':
        return { met: context.data?.aiAttempts > 3, value: context.data?.aiAttempts };
      
      case 'issue_severity_critical':
        return { met: context.data?.severity === 'critical', value: context.data?.severity };
      
      case 'customer_satisfaction_low':
        return { met: context.data?.satisfaction < 3, value: context.data?.satisfaction };
      
      case 'usdot_application_complete':
        return { met: context.data?.applicationComplete === true, value: context.data?.applicationComplete };
      
      case 'data_validation_enabled':
        return { met: true, value: true };
      
      case 'api_calls_exceeded_limit':
        return { met: context.data?.apiCalls > 1000, value: context.data?.apiCalls };
      
      case 'rate_limiting_enabled':
        return { met: true, value: true };
      
      case 'user_not_whitelisted':
        return { met: context.data?.whitelisted !== true, value: context.data?.whitelisted };
      
      case 'backup_schedule_triggered':
        return { met: new Date().getHours() === 2, value: new Date().getHours() }; // 2 AM backup
      
      case 'system_health_good':
        return { met: Math.random() > 0.05, value: 'good' }; // 95% success rate
      
      case 'backup_storage_available':
        return { met: true, value: 'available' };
      
      case 'security_event_detected':
        return { met: context.data?.securityEvent !== undefined, value: context.data?.securityEvent };
      
      case 'audit_logging_enabled':
        return { met: true, value: true };
      
      case 'user_authentication_required':
        return { met: context.userId !== undefined, value: context.userId };
      
      default:
        return { met: false, value: 'unknown_condition' };
    }
  }

  private findSupersedingRules(rule: Rule, evaluations: RuleEvaluation[]): RuleEvaluation[] {
    return evaluations.filter(evaluation => 
      evaluation.triggered && 
      evaluation.ruleId !== rule.id && 
      evaluation.priority < rule.priority &&
      rule.supersededBy.includes(evaluation.ruleId)
    );
  }

  private async executeAction(action: string, context: RuleContext): Promise<void> {
    // Simulate action execution
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));

    switch (action) {
      case 'validate_required_fields':
        console.log('Validating required fields for USDOT application');
        break;
      case 'check_data_format':
        console.log('Checking data format compliance');
        break;
      case 'verify_compliance':
        console.log('Verifying FMCSA compliance');
        break;
      case 'flag_discrepancies':
        console.log('Flagging data discrepancies');
        break;
      case 'encrypt_sensitive_data':
        console.log('Encrypting sensitive data');
        break;
      case 'log_data_access':
        console.log('Logging data access');
        break;
      case 'anonymize_where_possible':
        console.log('Anonymizing data where possible');
        break;
      case 'audit_data_usage':
        console.log('Auditing data usage');
        break;
      case 'verify_data_integrity':
        console.log('Verifying data integrity');
        break;
      case 'check_system_status':
        console.log('Checking system status');
        break;
      case 'validate_permissions':
        console.log('Validating user permissions');
        break;
      case 'confirm_automation_scope':
        console.log('Confirming automation scope');
        break;
      case 'use_polite_language':
        console.log('Using polite language in responses');
        break;
      case 'acknowledge_concerns':
        console.log('Acknowledging customer concerns');
        break;
      case 'provide_clear_explanations':
        console.log('Providing clear explanations');
        break;
      case 'escalate_when_needed':
        console.log('Escalating when needed');
        break;
      case 'assign_senior_sales_agent':
        console.log('Assigning senior sales agent');
        break;
      case 'trigger_personalized_email':
        console.log('Triggering personalized email');
        break;
      case 'schedule_priority_callback':
        console.log('Scheduling priority callback');
        break;
      case 'create_high_value_opportunity':
        console.log('Creating high value opportunity');
        break;
      case 'notify_human_agent':
        console.log('Notifying human agent');
        break;
      case 'create_support_ticket':
        console.log('Creating support ticket');
        break;
      case 'schedule_immediate_callback':
        console.log('Scheduling immediate callback');
        break;
      case 'escalate_to_management':
        console.log('Escalating to management');
        break;
      case 'run_validation_checks':
        console.log('Running validation checks');
        break;
      case 'verify_required_documents':
        console.log('Verifying required documents');
        break;
      case 'check_business_eligibility':
        console.log('Checking business eligibility');
        break;
      case 'throttle_api_requests':
        console.log('Throttling API requests');
        break;
      case 'return_rate_limit_error':
        console.log('Returning rate limit error');
        break;
      case 'log_rate_limit_violation':
        console.log('Logging rate limit violation');
        break;
      case 'notify_administrator':
        console.log('Notifying administrator');
        break;
      case 'create_data_backup':
        console.log('Creating data backup');
        break;
      case 'verify_backup_integrity':
        console.log('Verifying backup integrity');
        break;
      case 'update_backup_metadata':
        console.log('Updating backup metadata');
        break;
      case 'cleanup_old_backups':
        console.log('Cleaning up old backups');
        break;
      case 'log_security_event':
        console.log('Logging security event');
        break;
      case 'capture_user_context':
        console.log('Capturing user context');
        break;
      case 'store_audit_trail':
        console.log('Storing audit trail');
        break;
      case 'alert_security_team':
        console.log('Alerting security team');
        break;
      default:
        console.log(`Executing unknown action: ${action}`);
    }
  }

  private storeEvaluationHistory(evaluations: RuleEvaluation[]): void {
    const timestamp = new Date().toISOString();
    evaluations.forEach(evaluation => {
      const history = this.ruleHistory.get(evaluation.ruleId) || [];
      history.push(evaluation);
      
      // Keep only last 100 evaluations per rule
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      this.ruleHistory.set(evaluation.ruleId, history);
    });
  }

  async getAllRules(): Promise<Rule[]> {
    return Array.from(this.rules.values());
  }

  async getRule(ruleId: string): Promise<Rule | null> {
    return this.rules.get(ruleId) || null;
  }

  async createRule(rule: Omit<Rule, 'id'>): Promise<Rule> {
    const newRule: Rule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.rules.set(newRule.id, newRule);
    return newRule;
  }

  async updateRule(ruleId: string, updates: Partial<Rule>): Promise<Rule | null> {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    const updatedRule = { ...rule, ...updates };
    this.rules.set(ruleId, updatedRule);
    return updatedRule;
  }

  async deleteRule(ruleId: string): Promise<boolean> {
    return this.rules.delete(ruleId);
  }

  async getRuleHistory(ruleId: string): Promise<RuleEvaluation[]> {
    return this.ruleHistory.get(ruleId) || [];
  }

  async getRulesByCategory(category: string): Promise<Rule[]> {
    return Array.from(this.rules.values()).filter(rule => rule.category === category);
  }
}

// Singleton instance
export const rulesEngineService = new RulesEngineService();
