/**
 * ELD Service Integration Layer
 * Integrates the Rapid ELD module with the CRM system for service tracking and automation
 */

import { DatabaseService } from '../database/DatabaseService';
import { AIAgentManager } from '../ai/AIAgentManager';
import { ConversationService } from '../conversations/ConversationService';

export interface EldServiceConfig {
  providerName: string;
  serviceType: 'ELD_Hardware' | 'ELD_Software' | 'ELD_Support' | 'HOS_Training' | 'Compliance_Monitoring';
  serviceLevel: 'basic' | 'standard' | 'premium' | 'enterprise';
  renewalFrequency: number; // Days
  autoRenewal: boolean;
  reminderDays: number;
  complianceRequired: boolean;
  regulatoryBody?: string;
  baseCost: number;
}

export interface EldRenewalData {
  serviceId: string;
  companyId: string;
  currentExpiry: string;
  nextRenewal: string;
  renewalStatus: 'active' | 'pending' | 'overdue' | 'cancelled';
  automationRules: EldAutomationRule[];
  agentAssigned?: string;
}

export interface EldAutomationRule {
  ruleType: 'reminder' | 'auto_renewal' | 'compliance_check' | 'escalation';
  triggerDaysBefore: number;
  actionType: 'send_email' | 'create_task' | 'update_status' | 'notify_agent';
  actionParameters: Record<string, any>;
  aiPromptTemplate?: string;
}

export interface IftaQuarterlyData {
  companyId: string;
  quarterYear: number;
  quarterNumber: 1 | 2 | 3 | 4;
  filingDeadline: string;
  filingStatus: 'pending' | 'filed' | 'late' | 'extension';
  totalMiles: number;
  taxableMiles: number;
  totalTaxDue: number;
}

export interface ComplianceAlert {
  serviceId: string;
  companyId: string;
  alertType: 'renewal_due' | 'renewal_overdue' | 'compliance_violation' | 'service_disruption';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  recommendedActions: string[];
  agentGenerated: boolean;
}

export class EldServiceIntegration {
  private db: DatabaseService;
  private aiAgentManager: AIAgentManager;
  private conversationService: ConversationService;

  constructor(
    db: DatabaseService,
    aiAgentManager: AIAgentManager,
    conversationService: ConversationService
  ) {
    this.db = db;
    this.aiAgentManager = aiAgentManager;
    this.conversationService = conversationService;
  }

  /**
   * Register a new ELD service for a company with automated renewal tracking
   */
  async registerEldService(
    companyId: string,
    serviceConfig: EldServiceConfig,
    agentId?: string
  ): Promise<string> {
    try {
      // Create the base service record
      const serviceId = await this.db.createService({
        name: `${serviceConfig.providerName} ${serviceConfig.serviceType}`,
        description: `ELD service: ${serviceConfig.serviceType} from ${serviceConfig.providerName}`,
        category: 'Compliance',
        base_price: serviceConfig.baseCost,
        estimated_duration: `${serviceConfig.renewalFrequency} days`,
        requirements: JSON.stringify(['Active DOT Number', 'Fleet Registration']),
        deliverables: JSON.stringify(['ELD Service', 'Compliance Monitoring', 'Support'])
      });

      // Create service renewal tracking
      const renewalId = await this.createServiceRenewal({
        serviceId,
        companyId,
        renewalType: this.getRenewalType(serviceConfig.renewalFrequency),
        renewalFrequency: serviceConfig.renewalFrequency,
        currentExpiry: new Date(Date.now() + serviceConfig.renewalFrequency * 24 * 60 * 60 * 1000).toISOString(),
        nextRenewal: new Date(Date.now() + serviceConfig.renewalFrequency * 24 * 60 * 60 * 1000).toISOString(),
        autoRenewalEnabled: serviceConfig.autoRenewal,
        reminderDaysBefore: serviceConfig.reminderDays,
        complianceRequired: serviceConfig.complianceRequired,
        regulatoryBody: serviceConfig.regulatoryBody,
        agentAssigned: agentId
      });

      // Create ELD-specific service record
      await this.createEldService({
        serviceRenewalId: renewalId,
        serviceType: serviceConfig.serviceType,
        providerName: serviceConfig.providerName,
        serviceLevel: serviceConfig.serviceLevel
      });

      // Set up automation rules
      await this.setupAutomationRules(renewalId, serviceConfig, agentId);

      // Create initial IFTA quarterly tracking if applicable
      if (serviceConfig.serviceType === 'Compliance_Monitoring') {
        await this.initializeIftaQuarterlyTracking(companyId, renewalId);
      }

      return serviceId;
    } catch (error) {
      console.error('Error registering ELD service:', error);
      throw error;
    }
  }

  /**
   * Get all services for a company with renewal status
   */
  async getCompanyServices(companyId: string): Promise<EldRenewalData[]> {
    const query = `
      SELECT 
        sr.*,
        s.name as service_name,
        es.service_type,
        es.provider_name,
        es.service_level
      FROM service_renewals sr
      JOIN services s ON sr.service_id = s.id
      LEFT JOIN eld_services es ON sr.id = es.service_renewal_id
      WHERE sr.company_id = ?
      ORDER BY sr.next_renewal_date ASC
    `;
    
    return await this.db.query(query, [companyId]);
  }

  /**
   * Check for upcoming renewals and generate alerts
   */
  async checkUpcomingRenewals(): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = [];
    
    // Get all active services with upcoming renewals
    const upcomingRenewals = await this.db.query(`
      SELECT sr.*, s.name as service_name, c.legal_business_name as company_name
      FROM service_renewals sr
      JOIN services s ON sr.service_id = s.id
      JOIN companies c ON sr.company_id = c.id
      WHERE sr.renewal_status = 'active'
      AND sr.next_renewal_date <= date('now', '+${30} days')
    `);

    for (const renewal of upcomingRenewals) {
      const daysUntilRenewal = this.getDaysUntilRenewal(renewal.next_renewal_date);
      
      if (daysUntilRenewal <= renewal.reminder_days_before) {
        const alert = await this.createRenewalAlert(renewal, daysUntilRenewal);
        alerts.push(alert);
        
        // Trigger AI agent automation if configured
        if (renewal.agent_assigned) {
          await this.triggerAgentAutomation(renewal, alert);
        }
      }
    }

    return alerts;
  }

  /**
   * Handle IFTA quarterly renewals with AI automation
   */
  async processIftaQuarterlyRenewal(
    companyId: string,
    quarterYear: number,
    quarterNumber: number
  ): Promise<void> {
    try {
      // Get company's IFTA service
      const iftaService = await this.getCompanyIftaService(companyId);
      if (!iftaService) {
        throw new Error('No IFTA service found for company');
      }

      // Create quarterly renewal record
      const iftaData: IftaQuarterlyData = {
        companyId,
        quarterYear,
        quarterNumber,
        filingDeadline: this.calculateIftaFilingDeadline(quarterYear, quarterNumber),
        filingStatus: 'pending',
        totalMiles: 0,
        taxableMiles: 0,
        totalTaxDue: 0
      };

      await this.createIftaQuarterlyRenewal(iftaData, iftaService.id);

      // Generate AI agent task for quarterly processing
      await this.createIftaAutomationTask(companyId, iftaData, iftaService.agent_assigned);

    } catch (error) {
      console.error('Error processing IFTA quarterly renewal:', error);
      throw error;
    }
  }

  /**
   * Create automated compliance monitoring workflow
   */
  async createComplianceWorkflow(companyId: string, agentId: string): Promise<void> {
    const workflow = {
      name: 'ELD Compliance Monitoring',
      description: 'Automated monitoring of ELD services and compliance requirements',
      companyId,
      agentId,
      triggers: [
        {
          type: 'renewal_due',
          daysBefore: 30,
          action: 'send_reminder'
        },
        {
          type: 'renewal_overdue',
          daysAfter: 0,
          action: 'escalate'
        },
        {
          type: 'compliance_violation',
          action: 'create_task'
        }
      ],
      aiPrompts: {
        renewal_reminder: `Company {company_name} has an ELD service renewal due in {days} days. 
        Service: {service_name}, Provider: {provider_name}. 
        Please create a follow-up task and send appropriate communications.`,
        
        compliance_check: `Perform compliance check for {company_name}. 
        Verify ELD service status, renewal dates, and regulatory requirements. 
        Report any issues or upcoming deadlines.`
      }
    };

    await this.db.createRecord('service_automation_rules', {
      service_renewal_id: 'compliance_workflow',
      rule_name: workflow.name,
      rule_type: 'compliance_check',
      trigger_days_before: 30,
      action_type: 'notify_agent',
      action_parameters: JSON.stringify(workflow),
      agent_id: agentId,
      ai_prompt_template: workflow.aiPrompts.compliance_check
    });
  }

  // Private helper methods
  private getRenewalType(frequency: number): string {
    if (frequency <= 30) return 'monthly';
    if (frequency <= 90) return 'quarterly';
    if (frequency <= 365) return 'annual';
    return 'custom';
  }

  private getDaysUntilRenewal(renewalDate: string): number {
    const renewal = new Date(renewalDate);
    const now = new Date();
    const diffTime = renewal.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async createRenewalAlert(renewal: any, daysUntil: number): Promise<ComplianceAlert> {
    const severity = daysUntil <= 7 ? 'high' : daysUntil <= 14 ? 'medium' : 'low';
    
    return {
      serviceId: renewal.service_id,
      companyId: renewal.company_id,
      alertType: daysUntil <= 0 ? 'renewal_overdue' : 'renewal_due',
      severity,
      title: `Service Renewal ${daysUntil <= 0 ? 'Overdue' : 'Due'}: ${renewal.service_name}`,
      message: `${renewal.company_name} has a ${renewal.service_name} renewal ${daysUntil <= 0 ? 'overdue' : `due in ${daysUntil} days`}.`,
      recommendedActions: [
        'Contact provider for renewal quote',
        'Update service agreement',
        'Process payment if required',
        'Update compliance records'
      ],
      agentGenerated: true
    };
  }

  private async triggerAgentAutomation(renewal: any, alert: ComplianceAlert): Promise<void> {
    if (!renewal.agent_assigned) return;

    const prompt = `Service Renewal Alert: ${alert.title}
    
    Company: ${renewal.company_name}
    Service: ${renewal.service_name}
    Days Until Renewal: ${this.getDaysUntilRenewal(renewal.next_renewal_date)}
    
    Recommended Actions:
    ${alert.recommendedActions.map(action => `- ${action}`).join('\n')}
    
    Please take appropriate action to ensure service continuity and compliance.`;

    await this.conversationService.createAutomatedMessage(
      renewal.agent_assigned,
      renewal.company_id,
      prompt,
      { alertType: 'service_renewal', alertId: alert.serviceId }
    );
  }

  private calculateIftaFilingDeadline(year: number, quarter: number): string {
    const deadlines = {
      1: `${year}-04-30`, // Q1 due April 30
      2: `${year}-07-31`, // Q2 due July 31
      3: `${year}-10-31`, // Q3 due October 31
      4: `${year + 1}-01-31` // Q4 due January 31 of next year
    };
    return deadlines[quarter as keyof typeof deadlines];
  }

  private async createServiceRenewal(data: any): Promise<string> {
    const id = `renewal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.db.createRecord('service_renewals', {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return id;
  }

  private async createEldService(data: any): Promise<string> {
    const id = `eld_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.db.createRecord('eld_services', {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return id;
  }

  private async createIftaQuarterlyRenewal(data: IftaQuarterlyData, serviceRenewalId: string): Promise<string> {
    const id = `ifta_${data.companyId}_${data.quarterYear}_Q${data.quarterNumber}`;
    await this.db.createRecord('ifta_quarterly_renewals', {
      id,
      service_renewal_id: serviceRenewalId,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return id;
  }

  private async setupAutomationRules(
    renewalId: string,
    config: EldServiceConfig,
    agentId?: string
  ): Promise<void> {
    const rules = [
      {
        ruleType: 'reminder',
        triggerDaysBefore: config.reminderDays,
        actionType: 'send_email',
        actionParameters: { template: 'renewal_reminder' }
      },
      {
        ruleType: 'compliance_check',
        triggerDaysBefore: 7,
        actionType: 'create_task',
        actionParameters: { priority: 'high' }
      }
    ];

    if (config.autoRenewal) {
      rules.push({
        ruleType: 'auto_renewal',
        triggerDaysBefore: 0,
        actionType: 'update_status',
        actionParameters: { status: 'auto_renewed' }
      });
    }

    for (const rule of rules) {
      await this.db.createRecord('service_automation_rules', {
        id: `rule_${renewalId}_${rule.ruleType}`,
        service_renewal_id: renewalId,
        rule_name: `${rule.ruleType}_rule`,
        rule_type: rule.ruleType,
        trigger_days_before: rule.triggerDaysBefore,
        action_type: rule.actionType,
        action_parameters: JSON.stringify(rule.actionParameters),
        agent_id: agentId || 'system',
        ai_prompt_template: rule.aiPromptTemplate || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  private async initializeIftaQuarterlyTracking(companyId: string, renewalId: string): Promise<void> {
    const currentYear = new Date().getFullYear();
    const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;

    for (let q = currentQuarter; q <= 4; q++) {
      await this.processIftaQuarterlyRenewal(companyId, currentYear, q as 1 | 2 | 3 | 4);
    }
  }

  private async getCompanyIftaService(companyId: string): Promise<any> {
    const query = `
      SELECT sr.* FROM service_renewals sr
      JOIN eld_services es ON sr.id = es.service_renewal_id
      WHERE sr.company_id = ? AND es.service_type = 'Compliance_Monitoring'
      LIMIT 1
    `;
    const results = await this.db.query(query, [companyId]);
    return results[0];
  }

  private async createIftaAutomationTask(
    companyId: string,
    iftaData: IftaQuarterlyData,
    agentId?: string
  ): Promise<void> {
    const taskDescription = `IFTA Quarterly Filing - Q${iftaData.quarterNumber} ${iftaData.quarterYear}
    
    Company: ${companyId}
    Filing Deadline: ${iftaData.filingDeadline}
    
    Required Actions:
    - Collect mileage data for Q${iftaData.quarterNumber}
    - Calculate fuel taxes owed
    - Prepare IFTA filing documents
    - Submit filing by deadline
    - Process payment if required`;

    await this.db.createRecord('tasks', {
      id: `ifta_task_${iftaData.companyId}_${iftaData.quarterYear}_Q${iftaData.quarterNumber}`,
      title: `IFTA Q${iftaData.quarterNumber} ${iftaData.quarterYear} Filing`,
      description: taskDescription,
      status: 'pending',
      priority: 'high',
      due_date: iftaData.filingDeadline,
      company_id: companyId,
      assigned_to: agentId || 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}


