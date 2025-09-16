/**
 * CUSTOM AI COLLABORATION SERVICE
 * Fresh code written from scratch - no imports of existing services
 * Handles AI-to-AI communication, project coordination, and task management
 */

export interface AICollaborationMessage {
  message_id: string;
  from_ai: string;
  to_ai: string;
  message_type: 'text' | 'project_update' | 'database_operation' | 'code_generation' | 'task_assignment';
  content: string;
  metadata?: any;
  status: 'sent' | 'delivered' | 'read' | 'acknowledged';
  created_at: string;
  updated_at: string;
}

export interface AIProject {
  project_id: string;
  project_name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  assigned_ais: string[];
  current_task?: string;
  progress_percentage: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface AITask {
  task_id: string;
  project_id: string;
  assigned_to_ai: string;
  task_type: 'database_operation' | 'code_generation' | 'file_operation' | 'api_development' | 'testing';
  task_description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  result_data?: any;
  created_at: string;
  updated_at: string;
}

export class AICollaborationService {
  private apiBaseUrl: string;

  constructor() {
    // Use proxy in development, direct URL in production
    this.apiBaseUrl = import.meta.env.DEV ? '/api' : 'http://localhost:3001/api';
  }

  // ========================================
  // MESSAGE EXCHANGE METHODS
  // ========================================

  /**
   * Send a message to another AI
   */
  async sendMessage(
    fromAI: string,
    toAI: string,
    messageType: AICollaborationMessage['message_type'],
    content: string,
    metadata?: any
  ): Promise<{ success: boolean; message_id?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai/collaborate/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_ai: fromAI,
          to_ai: toAI,
          message_type: messageType,
          content: content,
          metadata: metadata
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to send AI message:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Get messages between AIs
   */
  async getMessages(
    fromAI?: string,
    toAI?: string,
    messageType?: AICollaborationMessage['message_type'],
    limit: number = 50
  ): Promise<{ success: boolean; messages?: AICollaborationMessage[]; error?: string }> {
    try {
      const params = new URLSearchParams();
      if (fromAI) params.append('from_ai', fromAI);
      if (toAI) params.append('to_ai', toAI);
      if (messageType) params.append('message_type', messageType);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.apiBaseUrl}/ai/collaborate?${params}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to get AI messages:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // ========================================
  // PROJECT COORDINATION METHODS
  // ========================================

  /**
   * Create a new AI collaboration project
   */
  async createProject(
    projectName: string,
    description: string,
    assignedAIs: string[]
  ): Promise<{ success: boolean; project_id?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_name: projectName,
          description: description,
          assigned_ais: assignedAIs
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to create AI project:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Get AI projects
   */
  async getProjects(
    status?: AIProject['status'],
    assignedTo?: string
  ): Promise<{ success: boolean; projects?: AIProject[]; error?: string }> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (assignedTo) params.append('assigned_to', assignedTo);

      const response = await fetch(`${this.apiBaseUrl}/ai/projects?${params}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to get AI projects:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // ========================================
  // TASK ASSIGNMENT METHODS
  // ========================================

  /**
   * Assign a task to an AI
   */
  async assignTask(
    projectId: string,
    assignedToAI: string,
    taskType: AITask['task_type'],
    taskDescription: string,
    priority: AITask['priority'] = 'medium'
  ): Promise<{ success: boolean; task_id?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          assigned_to_ai: assignedToAI,
          task_type: taskType,
          task_description: taskDescription,
          priority: priority
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to assign AI task:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Get tasks for an AI
   */
  async getTasks(
    assignedToAI?: string,
    status?: AITask['status'],
    projectId?: string
  ): Promise<{ success: boolean; tasks?: AITask[]; error?: string }> {
    try {
      const params = new URLSearchParams();
      if (assignedToAI) params.append('assigned_to_ai', assignedToAI);
      if (status) params.append('status', status);
      if (projectId) params.append('project_id', projectId);

      const response = await fetch(`${this.apiBaseUrl}/ai/tasks?${params}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to get AI tasks:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    taskId: string,
    status: AITask['status'],
    resultData?: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          result_data: resultData
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to update AI task:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // ========================================
  // COLLABORATION WORKFLOW METHODS
  // ========================================

  /**
   * Start a collaborative coding session
   */
  async startCodingSession(
    projectName: string,
    description: string,
    participants: string[]
  ): Promise<{ success: boolean; project_id?: string; error?: string }> {
    // Create project
    const projectResult = await this.createProject(projectName, description, participants);
    if (!projectResult.success) {
      return projectResult;
    }

    // Send notification to all participants
    for (const participant of participants) {
      await this.sendMessage(
        'System',
        participant,
        'project_update',
        `New coding session started: ${projectName}`,
        { project_id: projectResult.project_id, action: 'session_started' }
      );
    }

    return projectResult;
  }

  /**
   * Request database operation from another AI
   */
  async requestDatabaseOperation(
    fromAI: string,
    toAI: string,
    operation: string,
    projectId: string
  ): Promise<{ success: boolean; task_id?: string; error?: string }> {
    // Send message
    await this.sendMessage(
      fromAI,
      toAI,
      'database_operation',
      `Database operation requested: ${operation}`,
      { project_id: projectId, operation: operation }
    );

    // Assign task
    return await this.assignTask(
      projectId,
      toAI,
      'database_operation',
      operation,
      'high'
    );
  }

  /**
   * Request code generation from another AI
   */
  async requestCodeGeneration(
    fromAI: string,
    toAI: string,
    codeRequest: string,
    projectId: string
  ): Promise<{ success: boolean; task_id?: string; error?: string }> {
    // Send message
    await this.sendMessage(
      fromAI,
      toAI,
      'code_generation',
      `Code generation requested: ${codeRequest}`,
      { project_id: projectId, code_request: codeRequest }
    );

    // Assign task
    return await this.assignTask(
      projectId,
      toAI,
      'code_generation',
      codeRequest,
      'medium'
    );
  }
}

// Export singleton instance
export const aiCollaborationService = new AICollaborationService();
