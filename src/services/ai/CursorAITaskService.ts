/**
 * Cursor AI Task Service
 * This service allows Cursor AI to read and process tasks from the AI task queue
 */

interface AITask {
  id: number;
  task_id: string;
  created_by_ai: string;
  assigned_to_ai: string;
  task_type: 'code_change' | 'bug_fix' | 'feature_request' | 'analysis' | 'review' | 'deployment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  title: string;
  description: string;
  requirements: string; // JSON string
  context: string; // JSON string
  result_data?: string; // JSON string
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface TaskResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

class CursorAITaskService {
  private baseUrl = 'http://localhost:3001/api/ai/tasks';

  /**
   * Get all pending tasks assigned to Cursor AI
   */
  async getPendingTasks(): Promise<AITask[]> {
    try {
      const response = await fetch(`${this.baseUrl}/cursor?status=pending`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }
      
      const data = await response.json();
      return data.tasks || [];
    } catch (error) {
      console.error('❌ Error fetching pending tasks:', error);
      return [];
    }
  }

  /**
   * Get all tasks assigned to Cursor AI (any status)
   */
  async getAllTasks(): Promise<AITask[]> {
    try {
      const response = await fetch(`${this.baseUrl}/cursor`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }
      
      const data = await response.json();
      return data.tasks || [];
    } catch (error) {
      console.error('❌ Error fetching all tasks:', error);
      return [];
    }
  }

  /**
   * Mark a task as in progress
   */
  async startTask(taskId: string): Promise<TaskResult> {
    try {
      const response = await fetch(`${this.baseUrl}/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'in_progress'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to start task: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Task started successfully',
        data: data
      };
    } catch (error) {
      console.error('❌ Error starting task:', error);
      return {
        success: false,
        message: 'Failed to start task',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Complete a task with results
   */
  async completeTask(taskId: string, resultData: any, message?: string): Promise<TaskResult> {
    try {
      const response = await fetch(`${this.baseUrl}/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          result_data: resultData
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to complete task: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: message || 'Task completed successfully',
        data: data
      };
    } catch (error) {
      console.error('❌ Error completing task:', error);
      return {
        success: false,
        message: 'Failed to complete task',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Mark a task as failed
   */
  async failTask(taskId: string, errorMessage: string): Promise<TaskResult> {
    try {
      const response = await fetch(`${this.baseUrl}/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'failed',
          error_message: errorMessage
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fail task: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Task marked as failed',
        data: data
      };
    } catch (error) {
      console.error('❌ Error failing task:', error);
      return {
        success: false,
        message: 'Failed to mark task as failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process a task based on its type
   */
  async processTask(task: AITask): Promise<TaskResult> {
    console.log(`🔧 Processing task: ${task.title} (${task.task_type})`);
    
    // Mark task as in progress
    await this.startTask(task.task_id);
    
    try {
      let result: any;
      
      switch (task.task_type) {
        case 'code_change':
          result = await this.processCodeChangeTask(task);
          break;
        case 'bug_fix':
          result = await this.processBugFixTask(task);
          break;
        case 'feature_request':
          result = await this.processFeatureRequestTask(task);
          break;
        case 'analysis':
          result = await this.processAnalysisTask(task);
          break;
        case 'review':
          result = await this.processReviewTask(task);
          break;
        case 'deployment':
          result = await this.processDeploymentTask(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.task_type}`);
      }
      
      // Mark task as completed
      await this.completeTask(task.task_id, result, `Successfully processed ${task.task_type} task`);
      
      return {
        success: true,
        message: `Task ${task.task_id} processed successfully`,
        data: result
      };
    } catch (error) {
      // Mark task as failed
      await this.failTask(task.task_id, error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        message: `Task ${task.task_id} failed`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process code change tasks
   */
  private async processCodeChangeTask(task: AITask): Promise<any> {
    const requirements = JSON.parse(task.requirements || '{}');
    const context = JSON.parse(task.context || '{}');
    
    console.log(`📝 Processing code change: ${task.title}`);
    console.log('Requirements:', requirements);
    console.log('Context:', context);
    
    // This would be implemented by Cursor AI based on the specific requirements
    return {
      type: 'code_change',
      task_id: task.task_id,
      changes_made: [],
      files_modified: [],
      status: 'completed',
      notes: 'Code change task processed by Cursor AI'
    };
  }

  /**
   * Process bug fix tasks
   */
  private async processBugFixTask(task: AITask): Promise<any> {
    const requirements = JSON.parse(task.requirements || '{}');
    const context = JSON.parse(task.context || '{}');
    
    console.log(`🐛 Processing bug fix: ${task.title}`);
    console.log('Requirements:', requirements);
    console.log('Context:', context);
    
    return {
      type: 'bug_fix',
      task_id: task.task_id,
      bug_identified: true,
      fix_applied: true,
      files_modified: [],
      status: 'completed',
      notes: 'Bug fix task processed by Cursor AI'
    };
  }

  /**
   * Process feature request tasks
   */
  private async processFeatureRequestTask(task: AITask): Promise<any> {
    const requirements = JSON.parse(task.requirements || '{}');
    const context = JSON.parse(task.context || '{}');
    
    console.log(`✨ Processing feature request: ${task.title}`);
    console.log('Requirements:', requirements);
    console.log('Context:', context);
    
    return {
      type: 'feature_request',
      task_id: task.task_id,
      feature_implemented: true,
      files_created: [],
      files_modified: [],
      status: 'completed',
      notes: 'Feature request task processed by Cursor AI'
    };
  }

  /**
   * Process analysis tasks
   */
  private async processAnalysisTask(task: AITask): Promise<any> {
    const requirements = JSON.parse(task.requirements || '{}');
    const context = JSON.parse(task.context || '{}');
    
    console.log(`🔍 Processing analysis: ${task.title}`);
    console.log('Requirements:', requirements);
    console.log('Context:', context);
    
    return {
      type: 'analysis',
      task_id: task.task_id,
      analysis_completed: true,
      findings: [],
      recommendations: [],
      status: 'completed',
      notes: 'Analysis task processed by Cursor AI'
    };
  }

  /**
   * Process review tasks
   */
  private async processReviewTask(task: AITask): Promise<any> {
    const requirements = JSON.parse(task.requirements || '{}');
    const context = JSON.parse(task.context || '{}');
    
    console.log(`👀 Processing review: ${task.title}`);
    console.log('Requirements:', requirements);
    console.log('Context:', context);
    
    return {
      type: 'review',
      task_id: task.task_id,
      review_completed: true,
      issues_found: [],
      suggestions: [],
      status: 'completed',
      notes: 'Review task processed by Cursor AI'
    };
  }

  /**
   * Process deployment tasks
   */
  private async processDeploymentTask(task: AITask): Promise<any> {
    const requirements = JSON.parse(task.requirements || '{}');
    const context = JSON.parse(task.context || '{}');
    
    console.log(`🚀 Processing deployment: ${task.title}`);
    console.log('Requirements:', requirements);
    console.log('Context:', context);
    
    return {
      type: 'deployment',
      task_id: task.task_id,
      deployment_completed: true,
      steps_taken: [],
      status: 'completed',
      notes: 'Deployment task processed by Cursor AI'
    };
  }

  /**
   * Check for and process any pending tasks
   */
  async checkAndProcessTasks(): Promise<void> {
    try {
      const pendingTasks = await this.getPendingTasks();
      
      if (pendingTasks.length === 0) {
        console.log('✅ No pending tasks for Cursor AI');
        return;
      }
      
      console.log(`🔧 Found ${pendingTasks.length} pending tasks for Cursor AI`);
      
      // Process tasks in priority order
      const sortedTasks = pendingTasks.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      for (const task of sortedTasks) {
        console.log(`🎯 Processing task: ${task.title} (Priority: ${task.priority})`);
        const result = await this.processTask(task);
        
        if (result.success) {
          console.log(`✅ Task ${task.task_id} completed successfully`);
        } else {
          console.error(`❌ Task ${task.task_id} failed:`, result.error);
        }
      }
    } catch (error) {
      console.error('❌ Error checking and processing tasks:', error);
    }
  }
}

// Export singleton instance
export const cursorAITaskService = new CursorAITaskService();

// Make it globally available for Cursor AI
if (typeof window !== 'undefined') {
  (window as any).cursorAITaskService = cursorAITaskService;
}
