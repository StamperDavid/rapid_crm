/**
 * AI COLLABORATION SERVICE - CommonJS Wrapper
 * 
 * This is a CommonJS wrapper for the AI Collaboration Service
 * to enable server-side usage and AI-to-AI communication.
 */

class AICollaborationService {
  constructor() {
    this.apiBaseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api' : 'http://localhost:3001/api';
    this.messages = [];
    this.projects = new Map();
    this.tasks = new Map();
  }

  /**
   * Send a message to the AI collaboration system
   */
  async sendMessage(message) {
    const collaborationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: message.type || 'general',
      content: message.content,
      metadata: message.metadata || {},
      agent: message.agent || 'Unknown Agent'
    };

    this.messages.push(collaborationMessage);

    // In a real implementation, this would send to the backend API
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai/collaborate/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_ai: message.agent || 'Unknown Agent',
          to_ai: 'rapid-crm-ai',
          message_type: message.type || 'general',
          content: message.content,
          metadata: message.metadata || {}
        })
      });

      if (!response.ok) {
        console.warn('Failed to send collaboration message to backend');
      }
    } catch (error) {
      console.warn('Error sending collaboration message:', error.message);
    }

    console.log(`🤖 AI Collaboration: ${collaborationMessage.content}`);
    return collaborationMessage;
  }

  /**
   * Get collaboration messages
   */
  async getMessages(limit = 50) {
    return this.messages.slice(-limit);
  }

  /**
   * Create a new AI project
   */
  async createProject(projectData) {
    const project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: projectData.name,
      description: projectData.description,
      status: 'active',
      createdAt: new Date(),
      tasks: [],
      agents: []
    };

    this.projects.set(project.id, project);
    return project;
  }

  /**
   * Add a task to a project
   */
  async addTask(projectId, taskData) {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: projectId,
      name: taskData.name,
      description: taskData.description,
      status: 'pending',
      assignedAgent: taskData.assignedAgent,
      createdAt: new Date()
    };

    project.tasks.push(task);
    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Get project by ID
   */
  async getProject(projectId) {
    return this.projects.get(projectId);
  }

  /**
   * Get all projects
   */
  async getAllProjects() {
    return Array.from(this.projects.values());
  }

  /**
   * Get task by ID
   */
  async getTask(taskId) {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  async getAllTasks() {
    return Array.from(this.tasks.values());
  }
}

// Export singleton instance
const aiCollaborationService = new AICollaborationService();
module.exports = { aiCollaborationService };
