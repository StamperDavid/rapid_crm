/**
 * PARALLEL AI AGENT BUILDER
 * Uses AI-to-AI collaboration to build agents in parallel
 * Accelerates development by leveraging multiple AI instances
 */

import { AICollaborationService } from './AICollaborationService';
// Using direct database connection - no separate database service

export interface AgentBuildTask {
  id: string;
  agentType: 'usdot_compliance' | 'fleet_management' | 'customer_service' | 'data_analysis';
  requirements: {
    capabilities: string[];
    knowledgeBase: string[];
    personality: any;
    integrationPoints: string[];
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'queued' | 'building' | 'testing' | 'completed' | 'failed';
  assignedAI?: string;
  progress: number;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export class ParallelAgentBuilder {
  private collaborationService: AICollaborationService;
  private buildQueue: AgentBuildTask[] = [];
  private activeBuilds: Map<string, AgentBuildTask> = new Map();
  private availableAIs: string[] = [
    'rapid-crm-agent-builder-1',
    'rapid-crm-agent-builder-2', 
    'rapid-crm-agent-builder-3',
    'rapid-crm-specialist-usdot',
    'rapid-crm-specialist-fleet'
  ];

  constructor() {
    this.collaborationService = new AICollaborationService();
    this.startBuildProcessor();
  }

  /**
   * Queue a new agent build task
   */
  async queueAgentBuild(agentType: AgentBuildTask['agentType'], requirements: AgentBuildTask['requirements'], priority: AgentBuildTask['priority'] = 'medium'): Promise<string> {
    const taskId = this.generateTaskId();
    const task: AgentBuildTask = {
      id: taskId,
      agentType,
      requirements,
      priority,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.buildQueue.push(task);
    console.log(`🚀 Queued agent build: ${agentType} (Priority: ${priority})`);
    
    return taskId;
  }

  /**
   * Get build status
   */
  async getBuildStatus(taskId: string): Promise<AgentBuildTask | null> {
    const task = this.buildQueue.find(t => t.id === taskId) || this.activeBuilds.get(taskId);
    return task || null;
  }

  /**
   * Get all build tasks
   */
  async getAllBuildTasks(): Promise<AgentBuildTask[]> {
    return [...this.buildQueue, ...Array.from(this.activeBuilds.values())];
  }

  /**
   * Start the build processor
   */
  private startBuildProcessor(): void {
    setInterval(async () => {
      await this.processBuildQueue();
    }, 2000); // Check every 2 seconds
  }

  /**
   * Process the build queue
   */
  private async processBuildQueue(): Promise<void> {
    // Sort by priority
    this.buildQueue.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Find available AI and assign tasks
    for (const task of this.buildQueue) {
      const availableAI = this.findAvailableAI(task.agentType);
      if (availableAI) {
        await this.assignTaskToAI(task, availableAI);
      }
    }
  }

  /**
   * Find available AI for specific agent type
   */
  private findAvailableAI(agentType: AgentBuildTask['agentType']): string | null {
    // Check if any AI is available (not currently building)
    const busyAIs = Array.from(this.activeBuilds.values()).map(task => task.assignedAI);
    const availableAIs = this.availableAIs.filter(ai => !busyAIs.includes(ai));
    
    if (availableAIs.length === 0) return null;

    // Prefer specialized AIs for specific agent types
    if (agentType === 'usdot_compliance' && availableAIs.includes('rapid-crm-specialist-usdot')) {
      return 'rapid-crm-specialist-usdot';
    }
    if (agentType === 'fleet_management' && availableAIs.includes('rapid-crm-specialist-fleet')) {
      return 'rapid-crm-specialist-fleet';
    }

    // Return first available general AI
    return availableAIs[0];
  }

  /**
   * Assign task to AI
   */
  private async assignTaskToAI(task: AgentBuildTask, aiId: string): Promise<void> {
    // Remove from queue and add to active builds
    const taskIndex = this.buildQueue.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      this.buildQueue.splice(taskIndex, 1);
    }

    task.assignedAI = aiId;
    task.status = 'building';
    task.updatedAt = new Date().toISOString();
    this.activeBuilds.set(task.id, task);

    console.log(`🤖 Assigned ${task.agentType} build to ${aiId}`);

    // Send build request to AI
    try {
      const result = await this.collaborationService.sendMessage(
        'rapid-crm-main',
        aiId,
        'code_generation',
        `Build ${task.agentType} agent with requirements: ${JSON.stringify(task.requirements)}`,
        {
          taskId: task.id,
          taskType: 'agent_build',
          priority: task.priority,
          context: 'transportation_crm',
          expectedCapabilities: task.requirements.capabilities
        }
      );

      if (result.success) {
        console.log(`✅ Build request sent to ${aiId} for task ${task.id}`);
        // Start monitoring the build
        this.monitorBuild(task.id);
      } else {
        throw new Error(`Failed to send build request: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Failed to assign task to ${aiId}:`, error);
      task.status = 'failed';
      task.error = error.message;
      task.updatedAt = new Date().toISOString();
      this.activeBuilds.delete(task.id);
    }
  }

  /**
   * Monitor build progress
   */
  private async monitorBuild(taskId: string): Promise<void> {
    const task = this.activeBuilds.get(taskId);
    if (!task) return;

    // Simulate build progress (in real implementation, this would check with the AI)
    const progressInterval = setInterval(() => {
      if (task.progress < 90) {
        task.progress += Math.random() * 20;
        task.updatedAt = new Date().toISOString();
      }
    }, 1000);

    // Simulate completion after some time
    setTimeout(async () => {
      clearInterval(progressInterval);
      await this.completeBuild(taskId);
    }, 5000 + Math.random() * 10000); // 5-15 seconds
  }

  /**
   * Complete build
   */
  private async completeBuild(taskId: string): Promise<void> {
    const task = this.activeBuilds.get(taskId);
    if (!task) return;

    try {
      // In real implementation, this would retrieve the built agent from the AI
      const builtAgent = await this.retrieveBuiltAgent(taskId);
      
      task.status = 'completed';
      task.progress = 100;
      task.result = builtAgent;
      task.updatedAt = new Date().toISOString();

      console.log(`🎉 Agent build completed: ${task.agentType} (${taskId})`);

      // Save to database
      await this.saveBuiltAgent(builtAgent);

      // Remove from active builds
      this.activeBuilds.delete(taskId);

    } catch (error) {
      console.error(`❌ Build completion failed for ${taskId}:`, error);
      task.status = 'failed';
      task.error = error.message;
      task.updatedAt = new Date().toISOString();
      this.activeBuilds.delete(taskId);
    }
  }

  /**
   * Retrieve built agent from AI
   */
  private async retrieveBuiltAgent(taskId: string): Promise<any> {
    // In real implementation, this would communicate with the AI to get the built agent
    // For now, return a mock agent
    return {
      id: taskId,
      name: `AI-Built Agent ${taskId}`,
      type: 'ai_generated',
      capabilities: ['transportation_compliance', 'data_analysis'],
      status: 'active',
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Save built agent to database
   */
  private async saveBuiltAgent(agent: any): Promise<void> {
    try {
      const query = `
        INSERT INTO agents (id, name, description, type, status, capabilities, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await databaseService.executeQuery('primary', query, [
        agent.id,
        agent.name,
        agent.description || 'AI-generated agent',
        agent.type,
        agent.status,
        JSON.stringify(agent.capabilities),
        agent.createdAt,
        new Date().toISOString()
      ]);

      console.log(`💾 Saved built agent to database: ${agent.id}`);
    } catch (error) {
      console.error('❌ Failed to save built agent:', error);
      throw error;
    }
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const parallelAgentBuilder = new ParallelAgentBuilder();
