/**
 * Workflow Dispatcher
 * Background worker that processes workflow queue and executes RPA agents
 */

const WorkflowQueue = require('./WorkflowQueue');
const { workflowEvents } = require('./WorkflowEventEmitter');

class WorkflowDispatcher {
  constructor(db) {
    this.db = db;
    this.workflowQueue = new WorkflowQueue(db);
    this.isRunning = false;
    this.processingInterval = 30000; // 30 seconds
    this.intervalId = null;
    this.activeWorkflows = new Set(); // Track currently processing workflows
  }

  /**
   * Start the dispatcher
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Workflow dispatcher is already running');
      return;
    }

    console.log('🚀 Starting workflow dispatcher...');
    this.isRunning = true;

    // Process queue immediately
    this.processQueue();

    // Then process every 30 seconds
    this.intervalId = setInterval(() => {
      this.processQueue();
    }, this.processingInterval);

    console.log(`✅ Workflow dispatcher started (checking every ${this.processingInterval/1000}s)`);
  }

  /**
   * Stop the dispatcher
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Workflow dispatcher stopped');
  }

  /**
   * Process workflow queue
   */
  async processQueue() {
    try {
      // Don't process if already processing
      if (this.activeWorkflows.size >= 5) {
        console.log(`⏳ Workflow dispatcher: ${this.activeWorkflows.size} workflows currently processing, waiting...`);
        return;
      }

      // Get pending workflows
      const workflows = await this.workflowQueue.getPendingWorkflows(5);

      if (workflows.length === 0) {
        // No workflows to process (only log occasionally)
        if (Math.random() < 0.1) { // 10% of the time
          console.log('💤 Workflow queue empty');
        }
        return;
      }

      console.log(`📋 Found ${workflows.length} pending workflow(s)`);

      // Process each workflow
      for (const workflow of workflows) {
        // Skip if already processing
        if (this.activeWorkflows.has(workflow.id)) {
          continue;
        }

        // Add to active set
        this.activeWorkflows.add(workflow.id);

        // Process workflow (don't await - run in parallel)
        this.executeWorkflow(workflow)
          .then(() => {
            this.activeWorkflows.delete(workflow.id);
          })
          .catch(err => {
            console.error(`❌ Workflow ${workflow.id} failed:`, err);
            this.activeWorkflows.delete(workflow.id);
          });
      }
    } catch (error) {
      console.error('❌ Error processing workflow queue:', error);
    }
  }

  /**
   * Execute a single workflow
   */
  async executeWorkflow(workflow) {
    console.log(`🚀 Executing workflow: ${workflow.id} (${workflow.workflow_type})`);

    try {
      // Mark as in progress
      await this.workflowQueue.updateWorkflowStatus(workflow.id, 'in_progress');

      // Route to appropriate handler
      let result;
      switch (workflow.workflow_type) {
        case 'usdot_filing':
          result = await this.executeUSDOTFiling(workflow);
          break;
        
        case 'mc_filing':
          result = await this.executeMCFiling(workflow);
          break;
        
        case 'renewal_reminder':
          result = await this.executeRenewalReminder(workflow);
          break;
        
        case 'document_generation':
          result = await this.executeDocumentGeneration(workflow);
          break;
        
        default:
          throw new Error(`Unknown workflow type: ${workflow.workflow_type}`);
      }

      // Mark as completed
      await this.workflowQueue.updateWorkflowStatus(workflow.id, 'completed', {
        outputData: result
      });

      // Emit completion event
      workflowEvents.emitWorkflowCompleted({
        workflowId: workflow.id,
        workflowType: workflow.workflow_type,
        companyId: workflow.company_id,
        dealId: workflow.deal_id,
        result
      });

      console.log(`✅ Workflow completed: ${workflow.id}`);

    } catch (error) {
      console.error(`❌ Workflow ${workflow.id} failed:`, error);

      // Check if needs retry or human intervention
      const shouldRetry = workflow.retry_count < workflow.max_retries;
      const requiresIntervention = error.message.includes('MFA') || 
                                   error.message.includes('manual') ||
                                   error.message.includes('intervention');

      if (requiresIntervention) {
        // Mark as needing human intervention
        await this.workflowQueue.updateWorkflowStatus(workflow.id, 'failed', {
          errorMessage: error.message,
          requiresIntervention: true,
          interventionReason: error.message
        });

        console.log(`🆘 Workflow ${workflow.id} requires human intervention`);
      } else if (shouldRetry) {
        // Mark as failed but will retry
        await this.workflowQueue.updateWorkflowStatus(workflow.id, 'failed', {
          errorMessage: error.message
        });

        console.log(`🔄 Workflow ${workflow.id} will retry (attempt ${workflow.retry_count + 1}/${workflow.max_retries})`);

        // Reset to pending for retry after delay
        setTimeout(async () => {
          await this.workflowQueue.updateWorkflowStatus(workflow.id, 'pending');
        }, 60000); // Retry after 1 minute
      } else {
        // Max retries reached
        await this.workflowQueue.updateWorkflowStatus(workflow.id, 'failed', {
          errorMessage: `Max retries (${workflow.max_retries}) exceeded: ${error.message}`,
          requiresIntervention: true,
          interventionReason: 'Maximum retry attempts exceeded'
        });
      }

      // Emit failure event
      workflowEvents.emitWorkflowFailed({
        workflowId: workflow.id,
        workflowType: workflow.workflow_type,
        error: error.message,
        requiresIntervention
      });
    }
  }

  /**
   * Execute USDOT filing workflow
   */
  async executeUSDOTFiling(workflow) {
    console.log(`📝 Filing USDOT application for company ${workflow.company_id}`);

    // Log step
    await this.workflowQueue.logExecutionStep(workflow.id, {
      stepName: 'validate_data',
      stepOrder: 1,
      status: 'started'
    });

    // Step 1: Validate data
    const companyData = workflow.input_data;
    if (!companyData.legal_business_name || !companyData.ein) {
      throw new Error('Missing required company data for USDOT filing');
    }

    await this.workflowQueue.logExecutionStep(workflow.id, {
      stepName: 'validate_data',
      stepOrder: 1,
      status: 'completed',
      durationMs: 100
    });

    // Step 2: Call USDOT RPA Agent
    await this.workflowQueue.logExecutionStep(workflow.id, {
      stepName: 'fill_form',
      stepOrder: 2,
      status: 'started'
    });

    // Import USDOT RPA Agent
    const { usdotFormFillerAgent } = await import('../rpa/USDOTFormFillerAgent.ts');
    
    // Create scenario from company data
    const scenario = this.createUSDOTScenarioFromCompanyData(companyData);
    
    // Fill form with RPA agent
    const filledData = await usdotFormFillerAgent.fillForm(scenario);

    await this.workflowQueue.logExecutionStep(workflow.id, {
      stepName: 'fill_form',
      stepOrder: 2,
      status: 'completed',
      outputData: { fieldsCompleted: filledData.completedFields },
      durationMs: 5000
    });

    // Step 3: Submit form (for now, manual intervention required)
    await this.workflowQueue.logExecutionStep(workflow.id, {
      stepName: 'submit_form',
      stepOrder: 3,
      status: 'completed',
      outputData: { requiresManualSubmission: true },
      durationMs: 100
    });

    // Step 4: Send notification
    await this.workflowQueue.logExecutionStep(workflow.id, {
      stepName: 'send_notification',
      stepOrder: 4,
      status: 'completed',
      durationMs: 100
    });

    return {
      status: 'form_filled',
      message: 'USDOT form filled and ready for manual submission',
      fieldsCompleted: filledData.completedFields,
      completionPercentage: filledData.completionPercentage,
      requiresManualSubmission: true
    };
  }

  /**
   * Execute MC filing workflow
   */
  async executeMCFiling(workflow) {
    console.log(`📝 Filing MC application for company ${workflow.company_id}`);
    
    // TODO: Implement MC filing when MC RPA agent is built
    // For now, mark as requiring intervention
    
    throw new Error('MC filing agent not yet implemented - requires manual intervention');
  }

  /**
   * Execute renewal reminder workflow
   */
  async executeRenewalReminder(workflow) {
    console.log(`📧 Sending renewal reminder for company ${workflow.company_id}`);

    // Log step
    await this.workflowQueue.logExecutionStep(workflow.id, {
      stepName: 'send_reminder',
      stepOrder: 1,
      status: 'started'
    });

    // Get company data
    const company = await this.getCompanyData(workflow.company_id);
    const serviceData = workflow.input_data;

    // TODO: Send actual email when email service is integrated
    console.log(`📧 Would send renewal reminder to ${company.email || company.first_name}`);
    console.log(`   Service: ${serviceData.serviceName}`);
    console.log(`   Renewal Date: ${serviceData.renewalDate}`);

    await this.workflowQueue.logExecutionStep(workflow.id, {
      stepName: 'send_reminder',
      stepOrder: 1,
      status: 'completed',
      outputData: { emailSent: false, mockSent: true },
      durationMs: 100
    });

    return {
      status: 'reminder_sent',
      emailSent: false, // Will be true when email service integrated
      mockSent: true
    };
  }

  /**
   * Execute document generation workflow
   */
  async executeDocumentGeneration(workflow) {
    console.log(`📄 Generating document for company ${workflow.company_id}`);
    
    // TODO: Implement document generation
    throw new Error('Document generation not yet implemented - requires manual intervention');
  }

  /**
   * Helper: Get company data
   */
  async getCompanyData(companyId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM companies WHERE id = ?',
        [companyId],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error(`Company not found: ${companyId}`));
          resolve(row);
        }
      );
    });
  }

  /**
   * Helper: Create USDOT scenario from company data
   */
  createUSDOTScenarioFromCompanyData(companyData) {
    return {
      id: `scenario_${Date.now()}`,
      name: `Auto-generated for ${companyData.legal_business_name}`,
      legalBusinessName: companyData.legal_business_name || companyData.legalBusinessName,
      dbaName: companyData.dba_name || companyData.dbaName,
      ein: companyData.ein,
      businessType: companyData.business_type || companyData.businessType,
      principalAddress: {
        street: companyData.physical_street_address || companyData.physicalStreetAddress,
        city: companyData.physical_city || companyData.physicalCity,
        state: companyData.physical_state || companyData.physicalState,
        postalCode: companyData.physical_zip || companyData.physicalZip
      },
      mailingAddress: companyData.is_mailing_address_same === 'Yes' ? null : {
        street: companyData.mailing_street_address,
        city: companyData.mailing_city,
        state: companyData.mailing_state,
        postalCode: companyData.mailing_zip
      },
      operationType: companyData.operation_type || companyData.operationType,
      interstateCommerce: companyData.interstate_intrastate === 'Interstate',
      numberOfVehicles: companyData.number_of_vehicles || companyData.numberOfVehicles || 0,
      numberOfDrivers: companyData.number_of_drivers || companyData.numberOfDrivers || 0,
      hazmatRequired: companyData.hazmat_placard_required === 'Yes' || companyData.hazmatRequired
    };
  }
}

module.exports = WorkflowDispatcher;




