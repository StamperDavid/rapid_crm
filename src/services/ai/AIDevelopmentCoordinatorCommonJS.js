/**
 * AI DEVELOPMENT COORDINATOR - CommonJS Wrapper
 * 
 * This is a CommonJS wrapper for the AI Development Coordinator service
 * to enable server-side usage and AI-to-AI collaboration.
 */

const { aiCollaborationService } = require('./AICollaborationServiceCommonJS.js');

class AIDevelopmentCoordinator {
  constructor() {
    this.activeProjects = new Map();
    this.developmentTasks = new Map();
    this.collaborationMessages = [];
    this.isActive = false;
  }

  /**
   * Start a new AI development project
   */
  async startDevelopmentProject(projectConfig) {
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const project = {
      id: projectId,
      name: projectConfig.name,
      description: projectConfig.description,
      priority: projectConfig.priority || 'medium',
      status: 'active',
      createdAt: new Date(),
      estimatedDuration: projectConfig.estimatedDuration,
      requirements: projectConfig.requirements || [],
      technicalSpecs: projectConfig.technicalSpecs || {},
      tasks: [],
      progress: 0,
      completedTasks: 0,
      totalTasks: 0
    };

    this.activeProjects.set(projectId, project);

    // Send collaboration message
    await this.sendCollaborationMessage({
      type: 'project_started',
      content: `🚀 Started AI development project: ${project.name}`,
      projectId: projectId,
      priority: 'high'
    });

    console.log(`✅ AI Development Project started: ${project.name} (${projectId})`);
    return project;
  }

  /**
   * Add a task to a development project
   */
  async addTask(projectId, taskConfig) {
    const project = this.activeProjects.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task = {
      id: taskId,
      projectId: projectId,
      name: taskConfig.name,
      description: taskConfig.description,
      agent: taskConfig.agent,
      status: 'queued',
      priority: taskConfig.priority || 'medium',
      estimatedTime: taskConfig.estimatedTime,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      progress: 0,
      assignedAgent: null
    };

    project.tasks.push(task);
    project.totalTasks = project.tasks.length;
    this.developmentTasks.set(taskId, task);

    // Send collaboration message
    await this.sendCollaborationMessage({
      type: 'task_added',
      content: `📋 Added task: ${task.name} to project ${project.name}`,
      projectId: projectId,
      taskId: taskId,
      priority: 'medium'
    });

    // Start processing the task
    this.processTask(taskId);

    return task;
  }

  /**
   * Process a development task
   */
  async processTask(taskId) {
    const task = this.developmentTasks.get(taskId);
    if (!task) return;

    task.status = 'in_progress';
    task.startedAt = new Date();
    task.assignedAgent = task.agent;

    // Send collaboration message
    await this.sendCollaborationMessage({
      type: 'task_started',
      content: `🔄 Started task: ${task.name}`,
      projectId: task.projectId,
      taskId: taskId,
      priority: 'medium'
    });

    // Simulate AI agent working on the task
    setTimeout(async () => {
      await this.completeTask(taskId);
    }, Math.random() * 30000 + 10000); // 10-40 seconds
  }

  /**
   * Complete a development task
   */
  async completeTask(taskId) {
    const task = this.developmentTasks.get(taskId);
    if (!task) return;

    task.status = 'completed';
    task.completedAt = new Date();
    task.progress = 100;

    // Update project progress
    const project = this.activeProjects.get(task.projectId);
    if (project) {
      project.completedTasks = project.tasks.filter(t => t.status === 'completed').length;
      project.progress = Math.round((project.completedTasks / project.totalTasks) * 100);
    }

    // Send collaboration message
    await this.sendCollaborationMessage({
      type: 'task_completed',
      content: `✅ Completed task: ${task.name}`,
      projectId: task.projectId,
      taskId: taskId,
      priority: 'high'
    });

    console.log(`✅ Task completed: ${task.name}`);
  }

  /**
   * Get project status
   */
  async getProjectStatus(projectId) {
    const project = this.activeProjects.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    return {
      id: project.id,
      name: project.name,
      status: project.status,
      progress: project.progress,
      completedTasks: project.completedTasks,
      totalTasks: project.totalTasks,
      tasks: project.tasks.map(task => ({
        id: task.id,
        name: task.name,
        status: task.status,
        progress: task.progress,
        agent: task.agent,
        estimatedTime: task.estimatedTime
      }))
    };
  }

  /**
   * Get all active projects
   */
  async getActiveProjects() {
    return Array.from(this.activeProjects.values());
  }

  /**
   * Get collaboration messages
   */
  async getCollaborationMessages() {
    return this.collaborationMessages.slice(-50); // Return last 50 messages
  }

  /**
   * Send collaboration message
   */
  async sendCollaborationMessage(message) {
    const collaborationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: message.type,
      content: message.content,
      projectId: message.projectId,
      taskId: message.taskId,
      priority: message.priority || 'medium',
      agent: 'AI Development Coordinator'
    };

    this.collaborationMessages.push(collaborationMessage);

    // Send to AI Collaboration Service
    try {
      await aiCollaborationService.sendMessage({
        type: 'development_update',
        content: message.content,
        metadata: {
          projectId: message.projectId,
          taskId: message.taskId,
          priority: message.priority
        }
      });
    } catch (error) {
      console.error('Error sending collaboration message:', error);
    }
  }

  /**
   * Start the development coordinator
   */
  start() {
    this.isActive = true;
    console.log('🚀 AI Development Coordinator started');
  }

  /**
   * Stop the development coordinator
   */
  stop() {
    this.isActive = false;
    console.log('⏹️ AI Development Coordinator stopped');
  }
}

// Export singleton instance
const aiDevelopmentCoordinator = new AIDevelopmentCoordinator();
module.exports = { aiDevelopmentCoordinator };
