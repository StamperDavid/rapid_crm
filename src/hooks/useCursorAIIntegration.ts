/**
 * React Hook for Cursor AI Integration
 * Provides access to the Cursor AI Integration Service for true AI-to-AI collaboration
 */

import { useState, useEffect, useCallback } from 'react';
import { cursorAIIntegrationService } from '../services/ai/CursorAIIntegrationService';

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
  requirements: string;
  context: string;
  result_data?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface UseCursorAIIntegrationReturn {
  isConnected: boolean;
  pendingTasks: AITask[];
  isLoading: boolean;
  error: string | null;
  
  // Connection methods
  testConnection: () => Promise<boolean>;
  
  // Communication methods
  sendMessageToRapidCRM: (content: string, messageType?: string, metadata?: Record<string, any>) => Promise<any>;
  requestTask: (description: string, priority?: string, taskType?: string) => Promise<any>;
  
  // Task management methods
  getPendingTasks: () => Promise<AITask[]>;
  updateTaskStatus: (taskId: string, status: string, resultData?: any, errorMessage?: string) => Promise<any>;
  processAssignedTask: (task: AITask) => Promise<any>;
  checkAndProcessTasks: () => Promise<void>;
  
  // Notification methods
  notifyCodeChange: (changeType: string, filePath: string, description: string, relatedTaskId?: string) => Promise<void>;
  reportTaskCompletion: (taskId: string, resultData: any, completionMessage: string) => Promise<void>;
  
  // Utility methods
  refreshTasks: () => Promise<void>;
}

export const useCursorAIIntegration = (): UseCursorAIIntegrationReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<AITask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const connected = await cursorAIIntegrationService.testConnection();
      setIsConnected(connected);
      return connected;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection test failed';
      setError(errorMessage);
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessageToRapidCRM = useCallback(async (
    content: string,
    messageType: 'text' | 'task_request' | 'task_completion' | 'code_change_notification' = 'text',
    metadata?: Record<string, any>
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await cursorAIIntegrationService.sendMessageToRapidCRM(content, messageType, metadata);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestTask = useCallback(async (
    description: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    taskType: 'code_change' | 'bug_fix' | 'feature_request' | 'analysis' | 'review' | 'deployment' = 'code_change'
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await cursorAIIntegrationService.requestTask(description, priority, taskType);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request task';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPendingTasks = useCallback(async (): Promise<AITask[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tasks = await cursorAIIntegrationService.getPendingTasks();
      setPendingTasks(tasks);
      return tasks;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (
    taskId: string,
    status: 'in_progress' | 'completed' | 'failed',
    resultData?: any,
    errorMessage?: string
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await cursorAIIntegrationService.updateTaskStatus(taskId, status, resultData, errorMessage);
      // Refresh tasks after update
      await refreshTasks();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processAssignedTask = useCallback(async (task: AITask): Promise<any> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await cursorAIIntegrationService.processAssignedTask(task);
      // Refresh tasks after processing
      await refreshTasks();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process task';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAndProcessTasks = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await cursorAIIntegrationService.checkAndProcessTasks();
      // Refresh tasks after processing
      await refreshTasks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check and process tasks';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const notifyCodeChange = useCallback(async (
    changeType: 'file_created' | 'file_modified' | 'file_deleted',
    filePath: string,
    description: string,
    relatedTaskId?: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await cursorAIIntegrationService.notifyCodeChange(changeType, filePath, description, relatedTaskId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to notify code change';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reportTaskCompletion = useCallback(async (
    taskId: string,
    resultData: any,
    completionMessage: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await cursorAIIntegrationService.reportTaskCompletion(taskId, resultData, completionMessage);
      // Refresh tasks after completion
      await refreshTasks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to report task completion';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTasks = useCallback(async (): Promise<void> => {
    try {
      const tasks = await cursorAIIntegrationService.getPendingTasks();
      setPendingTasks(tasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh tasks';
      setError(errorMessage);
    }
  }, []);

  return {
    isConnected,
    pendingTasks,
    isLoading,
    error,
    
    // Connection methods
    testConnection,
    
    // Communication methods
    sendMessageToRapidCRM,
    requestTask,
    
    // Task management methods
    getPendingTasks,
    updateTaskStatus,
    processAssignedTask,
    checkAndProcessTasks,
    
    // Notification methods
    notifyCodeChange,
    reportTaskCompletion,
    
    // Utility methods
    refreshTasks,
  };
};

export default useCursorAIIntegration;
