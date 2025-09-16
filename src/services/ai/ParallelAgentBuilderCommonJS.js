/**
 * PARALLEL AI AGENT BUILDER - CommonJS Version
 * Industry best practice: Separate CommonJS module for server.js integration
 * Uses proper module boundaries and error handling
 */

class ParallelAgentBuilder {
  constructor() {
    this.buildQueue = [];
    this.activeBuilds = new Map();
    this.availableAIs = [
      'rapid-crm-agent-builder-1',
      'rapid-crm-agent-builder-2', 
      'rapid-crm-agent-builder-3',
      'rapid-crm-specialist-usdot',
      'rapid-crm-specialist-fleet'
    ];
    this.startBuildProcessor();
  }

  /**
   * Queue a new agent build task
   */
  async queueAgentBuild(agentType, requirements, priority = 'medium') {
    const taskId = this.generateTaskId();
    const task = {
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
  async getBuildStatus(taskId) {
    const task = this.buildQueue.find(t => t.id === taskId) || this.activeBuilds.get(taskId);
    return task || null;
  }

  /**
   * Get all build tasks
   */
  async getAllBuildTasks() {
    return [...this.buildQueue, ...Array.from(this.activeBuilds.values())];
  }

  /**
   * Start the build processor
   */
  startBuildProcessor() {
    setInterval(async () => {
      await this.processBuildQueue();
    }, 2000); // Check every 2 seconds
  }

  /**
   * Process the build queue
   */
  async processBuildQueue() {
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
  findAvailableAI(agentType) {
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
  async assignTaskToAI(task, aiId) {
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

    // Simulate build process
    this.monitorBuild(task.id);
  }

  /**
   * Monitor build progress
   */
  monitorBuild(taskId) {
    const task = this.activeBuilds.get(taskId);
    if (!task) return;

    // Simulate build progress
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
  async completeBuild(taskId) {
    const task = this.activeBuilds.get(taskId);
    if (!task) return;

    try {
      // Create a mock built agent
      const builtAgent = {
        id: taskId,
        name: `AI-Built ${task.agentType} Agent`,
        type: task.agentType,
        capabilities: task.requirements.capabilities || [],
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
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
   * Save built agent to database
   */
  async saveBuiltAgent(agent) {
    try {
      // For now, just log the agent - database integration can be added later
      console.log(`💾 Would save built agent to database: ${agent.id}`, agent);
      
      // TODO: Implement actual database save using proper database service
      // This will be implemented when we have proper database integration
    } catch (error) {
      console.error('❌ Failed to save built agent:', error);
      throw error;
    }
  }

  /**
   * Generate unique task ID
   */
  generateTaskId() {
    return `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance using CommonJS
const parallelAgentBuilder = new ParallelAgentBuilder();
module.exports = { parallelAgentBuilder };
