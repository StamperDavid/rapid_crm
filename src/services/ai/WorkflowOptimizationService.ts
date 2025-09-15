/**
 * Workflow Optimization Service
 * Demonstrates how Cursor AI and Rapid CRM AI can work in parallel
 * Optimizes development workflow by delegating appropriate tasks
 */

import { taskDelegationService } from './TaskDelegationService';

interface WorkflowTask {
  id: string;
  type: 'cursor_ai_task' | 'rapid_crm_ai_task' | 'collaborative_task';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: string;
  dependencies: string[];
  assignedTo: 'Claude_AI' | 'RapidCRM_AI' | 'Both';
}

interface WorkflowPlan {
  id: string;
  name: string;
  description: string;
  tasks: WorkflowTask[];
  estimatedTotalTime: string;
  parallelExecution: boolean;
  status: 'planning' | 'executing' | 'completed' | 'failed';
}

class WorkflowOptimizationService {
  private currentWorkflow: WorkflowPlan | null = null;
  private baseUrl = 'http://localhost:3001/api';

  /**
   * Create an optimized workflow plan
   */
  createWorkflowPlan(projectDescription: string): WorkflowPlan {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Analyze the project and create parallel tasks
    const tasks = this.analyzeProjectAndCreateTasks(projectDescription);
    
    const workflow: WorkflowPlan = {
      id: workflowId,
      name: `Optimized Workflow for: ${projectDescription.substring(0, 50)}...`,
      description: projectDescription,
      tasks,
      estimatedTotalTime: this.calculateTotalTime(tasks),
      parallelExecution: true,
      status: 'planning'
    };
    
    this.currentWorkflow = workflow;
    return workflow;
  }

  /**
   * Execute the workflow with parallel task execution
   */
  async executeWorkflow(workflow: WorkflowPlan): Promise<void> {
    console.log(`🚀 Executing workflow: ${workflow.name}`);
    workflow.status = 'executing';
    
    // Separate tasks by assignment
    const cursorAITasks = workflow.tasks.filter(task => task.assignedTo === 'Claude_AI');
    const rapidCRMAITasks = workflow.tasks.filter(task => task.assignedTo === 'RapidCRM_AI');
    const collaborativeTasks = workflow.tasks.filter(task => task.assignedTo === 'Both');
    
    // Execute Cursor AI tasks (these will be handled by me)
    console.log(`📝 Cursor AI will handle ${cursorAITasks.length} tasks`);
    for (const task of cursorAITasks) {
      console.log(`  - ${task.title} (${task.estimatedDuration})`);
    }
    
    // Delegate Rapid CRM AI tasks
    if (rapidCRMAITasks.length > 0) {
      console.log(`🤖 Delegating ${rapidCRMAITasks.length} tasks to Rapid CRM AI`);
      await this.delegateTasksToRapidCRM(rapidCRMAITasks);
    }
    
    // Handle collaborative tasks
    if (collaborativeTasks.length > 0) {
      console.log(`🤝 ${collaborativeTasks.length} collaborative tasks will be coordinated`);
      await this.coordinateCollaborativeTasks(collaborativeTasks);
    }
  }

  /**
   * Analyze project and create optimized tasks
   */
  private analyzeProjectAndCreateTasks(projectDescription: string): WorkflowTask[] {
    const tasks: WorkflowTask[] = [];
    
    // Example: ELD Integration Project
    if (projectDescription.toLowerCase().includes('eld')) {
      tasks.push(
        {
          id: `task_${Date.now()}_1`,
          type: 'rapid_crm_ai_task',
          title: 'Analyze ELD Requirements',
          description: 'Research ELD compliance requirements, regulations, and integration standards',
          priority: 'high',
          estimatedDuration: '15 minutes',
          dependencies: [],
          assignedTo: 'RapidCRM_AI'
        },
        {
          id: `task_${Date.now()}_2`,
          type: 'cursor_ai_task',
          title: 'Create ELD Database Schema',
          description: 'Design and implement database tables for ELD data storage',
          priority: 'high',
          estimatedDuration: '20 minutes',
          dependencies: [],
          assignedTo: 'Claude_AI'
        },
        {
          id: `task_${Date.now()}_3`,
          type: 'rapid_crm_ai_task',
          title: 'Research ELD API Endpoints',
          description: 'Find and document available ELD service APIs and integration methods',
          priority: 'medium',
          estimatedDuration: '10 minutes',
          dependencies: [],
          assignedTo: 'RapidCRM_AI'
        },
        {
          id: `task_${Date.now()}_4`,
          type: 'cursor_ai_task',
          title: 'Implement ELD Service Integration',
          description: 'Create the ELD service integration layer with API calls',
          priority: 'high',
          estimatedDuration: '25 minutes',
          dependencies: ['task_1', 'task_2'],
          assignedTo: 'Claude_AI'
        },
        {
          id: `task_${Date.now()}_5`,
          type: 'collaborative_task',
          title: 'Test ELD Integration',
          description: 'Coordinate testing of the ELD integration with sample data',
          priority: 'medium',
          estimatedDuration: '15 minutes',
          dependencies: ['task_4'],
          assignedTo: 'Both'
        }
      );
    }
    
    // Example: Timestamp Fix Project
    if (projectDescription.toLowerCase().includes('timestamp')) {
      tasks.push(
        {
          id: `task_${Date.now()}_1`,
          type: 'rapid_crm_ai_task',
          title: 'Analyze Timestamp Issues',
          description: 'Investigate timestamp display problems and identify root causes',
          priority: 'high',
          estimatedDuration: '10 minutes',
          dependencies: [],
          assignedTo: 'RapidCRM_AI'
        },
        {
          id: `task_${Date.now()}_2`,
          type: 'cursor_ai_task',
          title: 'Fix Timestamp Display Logic',
          description: 'Update the timestamp formatting and timezone handling in the UI components',
          priority: 'high',
          estimatedDuration: '15 minutes',
          dependencies: ['task_1'],
          assignedTo: 'Claude_AI'
        },
        {
          id: `task_${Date.now()}_3`,
          type: 'rapid_crm_ai_task',
          title: 'Validate Timestamp Fix',
          description: 'Test the timestamp fix across different timezones and formats',
          priority: 'medium',
          estimatedDuration: '8 minutes',
          dependencies: ['task_2'],
          assignedTo: 'RapidCRM_AI'
        }
      );
    }
    
    // Default tasks for any project
    if (tasks.length === 0) {
      tasks.push(
        {
          id: `task_${Date.now()}_1`,
          type: 'rapid_crm_ai_task',
          title: 'Project Analysis',
          description: 'Analyze the project requirements and provide recommendations',
          priority: 'high',
          estimatedDuration: '10 minutes',
          dependencies: [],
          assignedTo: 'RapidCRM_AI'
        },
        {
          id: `task_${Date.now()}_2`,
          type: 'cursor_ai_task',
          title: 'Implementation',
          description: 'Implement the requested changes based on the analysis',
          priority: 'high',
          estimatedDuration: '20 minutes',
          dependencies: ['task_1'],
          assignedTo: 'Claude_AI'
        }
      );
    }
    
    return tasks;
  }

  /**
   * Delegate tasks to Rapid CRM AI
   */
  private async delegateTasksToRapidCRM(tasks: WorkflowTask[]): Promise<void> {
    const delegationTasks = tasks.map(task => ({
      id: task.id,
      type: 'analysis' as const,
      title: task.title,
      description: task.description,
      priority: task.priority,
      context: {
        workflowId: this.currentWorkflow?.id,
        dependencies: task.dependencies,
        estimatedDuration: task.estimatedDuration
      },
      expectedOutput: `Complete analysis and recommendations for: ${task.title}`
    }));
    
    await taskDelegationService.delegateMultipleTasks(delegationTasks);
  }

  /**
   * Coordinate collaborative tasks
   */
  private async coordinateCollaborativeTasks(tasks: WorkflowTask[]): Promise<void> {
    for (const task of tasks) {
      console.log(`🤝 Coordinating collaborative task: ${task.title}`);
      
      // Send coordination message to Rapid CRM AI
      try {
        const response = await fetch(`${this.baseUrl}/ai/collaborate/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from_ai: 'Claude_AI',
            to_ai: 'RapidCRM_AI',
            message_type: 'collaborative_task',
            content: `COLLABORATIVE TASK COORDINATION

Task: ${task.title}
Description: ${task.description}
Priority: ${task.priority}

This is a collaborative task that requires coordination between Cursor AI and Rapid CRM AI.

Cursor AI will handle the implementation aspects.
Rapid CRM AI should provide analysis, testing, and validation.

Please confirm you understand the task and provide any initial analysis or recommendations.`,
            metadata: {
              taskId: task.id,
              workflowId: this.currentWorkflow?.id,
              taskType: 'collaborative'
            }
          })
        });
        
        if (response.ok) {
          console.log(`✅ Collaborative task coordination sent: ${task.title}`);
        }
      } catch (error) {
        console.error(`❌ Error coordinating collaborative task:`, error);
      }
    }
  }

  /**
   * Calculate total estimated time
   */
  private calculateTotalTime(tasks: WorkflowTask[]): string {
    // Simple calculation - in real implementation, this would be more sophisticated
    const totalMinutes = tasks.length * 15; // Average 15 minutes per task
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Get current workflow status
   */
  getCurrentWorkflow(): WorkflowPlan | null {
    return this.currentWorkflow;
  }

  /**
   * Check workflow progress
   */
  async checkWorkflowProgress(): Promise<void> {
    if (!this.currentWorkflow) return;
    
    // Check delegated tasks
    const delegatedResults = await taskDelegationService.checkDelegatedTasks();
    const completedTasks = delegatedResults.filter(result => result.status === 'completed');
    
    console.log(`📊 Workflow Progress: ${completedTasks.length}/${this.currentWorkflow.tasks.length} tasks completed`);
    
    // Update workflow status
    if (completedTasks.length === this.currentWorkflow.tasks.length) {
      this.currentWorkflow.status = 'completed';
      console.log(`✅ Workflow completed: ${this.currentWorkflow.name}`);
    }
  }
}

// Export singleton instance
export const workflowOptimizationService = new WorkflowOptimizationService();

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).workflowOptimizationService = workflowOptimizationService;
}

export default workflowOptimizationService;
