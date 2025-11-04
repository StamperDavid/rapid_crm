/**
 * Workflow Queue Service
 * Manages workflow queue - adding, retrieving, and updating workflows
 */

class WorkflowQueue {
  constructor(db) {
    this.db = db;
  }

  /**
   * Add workflow to queue
   */
  async addWorkflow(workflowData) {
    const {
      workflowType,
      companyId,
      dealId = null,
      paymentTransactionId = null,
      inputData,
      priority = 'medium',
      assignedAgent = null,
      scheduledFor = null
    } = workflowData;

    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO workflow_queue (
          id, workflow_type, priority, status, deal_id, company_id,
          payment_transaction_id, input_data, assigned_agent, retry_count,
          max_retries, created_at, scheduled_for, updated_at
        ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, 0, 3, ?, ?, ?)`,
        [
          workflowId,
          workflowType,
          priority,
          dealId,
          companyId,
          paymentTransactionId,
          JSON.stringify(inputData),
          assignedAgent,
          now,
          scheduledFor,
          now
        ],
        function(err) {
          if (err) {
            console.error('❌ Error adding workflow to queue:', err);
            return reject(err);
          }
          
          console.log(`✅ Workflow added to queue: ${workflowId} (${workflowType})`);
          resolve(workflowId);
        }
      );
    });
  }

  /**
   * Get pending workflows
   */
  async getPendingWorkflows(limit = 10) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      
      this.db.all(
        `SELECT * FROM workflow_queue 
         WHERE status = 'pending' 
         AND (scheduled_for IS NULL OR scheduled_for <= ?)
         ORDER BY 
           CASE priority
             WHEN 'urgent' THEN 1
             WHEN 'high' THEN 2
             WHEN 'medium' THEN 3
             WHEN 'low' THEN 4
           END,
           created_at ASC
         LIMIT ?`,
        [now, limit],
        (err, rows) => {
          if (err) {
            return reject(err);
          }
          
          // Parse JSON fields
          const workflows = rows.map(row => ({
            ...row,
            input_data: JSON.parse(row.input_data || '{}'),
            output_data: row.output_data ? JSON.parse(row.output_data) : null
          }));
          
          resolve(workflows);
        }
      );
    });
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM workflow_queue WHERE id = ?',
        [workflowId],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);
          
          resolve({
            ...row,
            input_data: JSON.parse(row.input_data || '{}'),
            output_data: row.output_data ? JSON.parse(row.output_data) : null
          });
        }
      );
    });
  }

  /**
   * Update workflow status
   */
  async updateWorkflowStatus(workflowId, status, data = {}) {
    const { outputData = null, errorMessage = null, requiresIntervention = false, interventionReason = null } = data;
    const now = new Date().toISOString();

    const updates = ['status = ?', 'updated_at = ?'];
    const params = [status, now];

    if (status === 'in_progress') {
      updates.push('started_at = ?');
      params.push(now);
    }

    if (status === 'completed') {
      updates.push('completed_at = ?');
      params.push(now);
      if (outputData) {
        updates.push('output_data = ?');
        params.push(JSON.stringify(outputData));
      }
    }

    if (status === 'failed') {
      updates.push('failed_at = ?');
      params.push(now);
      if (errorMessage) {
        updates.push('error_message = ?');
        params.push(errorMessage);
      }
      updates.push('retry_count = retry_count + 1');
      
      // Calculate next retry time (exponential backoff: 5min, 15min, 30min)
      updates.push('next_retry_at = datetime("now", "+" || (5 * (retry_count + 1) * (retry_count + 1)) || " minutes")');
    }

    if (requiresIntervention) {
      updates.push('requires_human_intervention = 1');
      if (interventionReason) {
        updates.push('intervention_reason = ?');
        params.push(interventionReason);
      }
    }

    params.push(workflowId);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE workflow_queue SET ${updates.join(', ')} WHERE id = ?`,
        params,
        function(err) {
          if (err) {
            console.error('❌ Error updating workflow status:', err);
            return reject(err);
          }
          resolve();
        }
      );
    });
  }

  /**
   * Get workflows by status
   */
  async getWorkflowsByStatus(status, limit = 100) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM workflow_queue WHERE status = ? ORDER BY created_at DESC LIMIT ?',
        [status, limit],
        (err, rows) => {
          if (err) return reject(err);
          
          const workflows = rows.map(row => ({
            ...row,
            input_data: JSON.parse(row.input_data || '{}'),
            output_data: row.output_data ? JSON.parse(row.output_data) : null
          }));
          
          resolve(workflows);
        }
      );
    });
  }

  /**
   * Get workflows requiring human intervention
   */
  async getInterventionRequired() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM workflow_queue WHERE requires_human_intervention = 1 AND status != "completed" ORDER BY created_at DESC',
        (err, rows) => {
          if (err) return reject(err);
          
          const workflows = rows.map(row => ({
            ...row,
            input_data: JSON.parse(row.input_data || '{}'),
            output_data: row.output_data ? JSON.parse(row.output_data) : null
          }));
          
          resolve(workflows);
        }
      );
    });
  }

  /**
   * Log workflow execution step
   */
  async logExecutionStep(workflowId, stepData) {
    const {
      stepName,
      stepOrder,
      status,
      inputData = null,
      outputData = null,
      errorMessage = null,
      durationMs = 0
    } = stepData;

    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO workflow_execution_log (
          id, workflow_id, step_name, step_order, status,
          input_data, output_data, error_message, started_at,
          completed_at, duration_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          logId,
          workflowId,
          stepName,
          stepOrder,
          status,
          inputData ? JSON.stringify(inputData) : null,
          outputData ? JSON.stringify(outputData) : null,
          errorMessage,
          now,
          status === 'completed' ? now : null,
          durationMs
        ],
        function(err) {
          if (err) {
            console.error('❌ Error logging execution step:', err);
            return reject(err);
          }
          resolve(logId);
        }
      );
    });
  }

  /**
   * Get workflow execution history
   */
  async getExecutionHistory(workflowId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM workflow_execution_log WHERE workflow_id = ? ORDER BY step_order ASC',
        [workflowId],
        (err, rows) => {
          if (err) return reject(err);
          
          const history = rows.map(row => ({
            ...row,
            input_data: row.input_data ? JSON.parse(row.input_data) : null,
            output_data: row.output_data ? JSON.parse(row.output_data) : null
          }));
          
          resolve(history);
        }
      );
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT 
          status, 
          workflow_type,
          COUNT(*) as count
         FROM workflow_queue 
         GROUP BY status, workflow_type`,
        (err, rows) => {
          if (err) return reject(err);
          
          const stats = {
            byStatus: {},
            byType: {},
            total: 0
          };
          
          rows.forEach(row => {
            // By status
            if (!stats.byStatus[row.status]) {
              stats.byStatus[row.status] = 0;
            }
            stats.byStatus[row.status] += row.count;
            
            // By type
            if (!stats.byType[row.workflow_type]) {
              stats.byType[row.workflow_type] = 0;
            }
            stats.byType[row.workflow_type] += row.count;
            
            stats.total += row.count;
          });
          
          resolve(stats);
        }
      );
    });
  }

  /**
   * Cancel workflow
   */
  async cancelWorkflow(workflowId, reason = null) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE workflow_queue 
         SET status = 'canceled', 
             error_message = ?,
             updated_at = datetime('now')
         WHERE id = ?`,
        [reason, workflowId],
        function(err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
}

module.exports = WorkflowQueue;



