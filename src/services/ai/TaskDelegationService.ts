/**
 * Task Delegation Service
 * Allows Cursor AI to delegate specific tasks to Rapid CRM AI via API
 * Optimizes workflow by allowing parallel task execution
 */

interface DelegationTask {
  id: string;
  type: 'analysis' | 'research' | 'data_processing' | 'compliance_check' | 'report_generation' | 'integration_setup';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  context: Record<string, any>;
  expectedOutput: string;
  deadline?: string;
  dependencies?: string[];
}

interface DelegationResult {
  taskId: string;
  status: 'delegated' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
  completedAt?: string;
}

class TaskDelegationService {
  private baseUrl = 'http://localhost:3001/api';
  private delegatedTasks = new Map<string, DelegationResult>();

  /**
   * Delegate a task to Rapid CRM AI
   */
  async delegateTask(task: DelegationTask): Promise<DelegationResult> {
    try {
      console.log(`🔄 Delegating task to Rapid CRM AI: ${task.title}`);
      
      const delegationMessage = this.createDelegationMessage(task);
      
      const response = await fetch(`${this.baseUrl}/ai/collaborate/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_ai: 'Claude_AI',
          to_ai: 'RapidCRM_AI',
          message_type: 'task_delegation',
          content: delegationMessage,
          metadata: {
            delegation_task: task,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to delegate task: ${response.status}`);
      }

      const result = await response.json();
      
      const delegationResult: DelegationResult = {
        taskId: task.id,
        status: 'delegated',
        result: result.ai_response?.content
      };
      
      this.delegatedTasks.set(task.id, delegationResult);
      
      console.log(`✅ Task delegated successfully: ${task.title}`);
      return delegationResult;
      
    } catch (error) {
      console.error('❌ Error delegating task:', error);
      const failedResult: DelegationResult = {
        taskId: task.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.delegatedTasks.set(task.id, failedResult);
      return failedResult;
    }
  }

  /**
   * Check status of delegated tasks
   */
  async checkDelegatedTasks(): Promise<DelegationResult[]> {
    const results: DelegationResult[] = [];
    
    for (const [taskId, result] of this.delegatedTasks) {
      if (result.status === 'delegated' || result.status === 'in_progress') {
        try {
          // Check if Rapid CRM AI has completed the task
          const response = await fetch(`${this.baseUrl}/ai/collaborate`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const data = await response.json();
            // Look for completion messages related to our delegated tasks
            const completionMessage = this.findCompletionMessage(data.messages, taskId);
            
            if (completionMessage) {
              result.status = 'completed';
              result.result = completionMessage.content;
              result.completedAt = completionMessage.created_at;
              console.log(`✅ Delegated task completed: ${taskId}`);
            }
          }
        } catch (error) {
          console.error(`❌ Error checking task ${taskId}:`, error);
        }
      }
      
      results.push(result);
    }
    
    return results;
  }

  /**
   * Delegate multiple tasks in parallel
   */
  async delegateMultipleTasks(tasks: DelegationTask[]): Promise<DelegationResult[]> {
    console.log(`🔄 Delegating ${tasks.length} tasks to Rapid CRM AI in parallel`);
    
    const delegationPromises = tasks.map(task => this.delegateTask(task));
    const results = await Promise.allSettled(delegationPromises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          taskId: tasks[index].id,
          status: 'failed' as const,
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
        };
      }
    });
  }

  /**
   * Create a delegation message for Rapid CRM AI
   */
  private createDelegationMessage(task: DelegationTask): string {
    return `TASK DELEGATION REQUEST

Task ID: ${task.id}
Type: ${task.type}
Title: ${task.title}
Priority: ${task.priority}

Description:
${task.description}

Context:
${JSON.stringify(task.context, null, 2)}

Expected Output:
${task.expectedOutput}

${task.deadline ? `Deadline: ${task.deadline}` : ''}
${task.dependencies ? `Dependencies: ${task.dependencies.join(', ')}` : ''}

Please analyze this task and provide the requested output. This is a delegated task from Cursor AI that should be completed independently while Cursor AI works on other tasks.

IMPORTANT: When you complete this task, please respond with:
TASK_COMPLETION: ${task.id}
Result: [Your analysis/result here]
Status: completed

This will allow Cursor AI to retrieve the results and continue with the workflow.`;
  }

  /**
   * Find completion message for a specific task
   */
  private findCompletionMessage(messages: any[], taskId: string): any | null {
    if (!messages) return null;
    
    return messages.find(message => 
      message.content && 
      message.content.includes(`TASK_COMPLETION: ${taskId}`) &&
      message.from_ai === 'RapidCRM_AI'
    );
  }

  /**
   * Get all delegated tasks
   */
  getDelegatedTasks(): DelegationResult[] {
    return Array.from(this.delegatedTasks.values());
  }

  /**
   * Get specific delegated task
   */
  getDelegatedTask(taskId: string): DelegationResult | undefined {
    return this.delegatedTasks.get(taskId);
  }

  /**
   * Clear completed tasks
   */
  clearCompletedTasks(): void {
    for (const [taskId, result] of this.delegatedTasks) {
      if (result.status === 'completed' || result.status === 'failed') {
        this.delegatedTasks.delete(taskId);
      }
    }
  }
}

// Export singleton instance
export const taskDelegationService = new TaskDelegationService();

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).taskDelegationService = taskDelegationService;
}

export default taskDelegationService;
