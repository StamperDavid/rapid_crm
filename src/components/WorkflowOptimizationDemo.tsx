/**
 * Workflow Optimization Demo
 * Demonstrates how Cursor AI and Rapid CRM AI can work in parallel
 * Shows task delegation and workflow optimization in action
 */

import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  PlayIcon,
  PauseIcon,
  RefreshIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/outline';
import { workflowOptimizationService } from '../services/ai/WorkflowOptimizationService';
import { taskDelegationService } from '../services/ai/TaskDelegationService';

interface WorkflowTask {
  id: string;
  type: 'cursor_ai_task' | 'rapid_crm_ai_task' | 'collaborative_task';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: string;
  dependencies: string[];
  assignedTo: 'Claude_AI' | 'RapidCRM_AI' | 'Both';
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
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

const WorkflowOptimizationDemo: React.FC = () => {
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowPlan | null>(null);
  const [delegatedTasks, setDelegatedTasks] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');

  // Check delegated tasks periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentWorkflow && currentWorkflow.status === 'executing') {
        const results = await taskDelegationService.checkDelegatedTasks();
        setDelegatedTasks(results);
        
        // Check workflow progress
        await workflowOptimizationService.checkWorkflowProgress();
        const updatedWorkflow = workflowOptimizationService.getCurrentWorkflow();
        if (updatedWorkflow) {
          setCurrentWorkflow(updatedWorkflow);
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [currentWorkflow]);

  const handleCreateWorkflow = () => {
    if (!projectDescription.trim()) return;
    
    const workflow = workflowOptimizationService.createWorkflowPlan(projectDescription);
    setCurrentWorkflow(workflow);
  };

  const handleExecuteWorkflow = async () => {
    if (!currentWorkflow) return;
    
    setIsExecuting(true);
    try {
      await workflowOptimizationService.executeWorkflow(currentWorkflow);
      setCurrentWorkflow(workflowOptimizationService.getCurrentWorkflow());
    } catch (error) {
      console.error('Error executing workflow:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'cursor_ai_task':
        return <span className="h-5 w-5 text-blue-600">💻</span>;
      case 'rapid_crm_ai_task':
        return <UserGroupIcon className="h-5 w-5 text-green-600" />;
      case 'collaborative_task':
        return <ChartBarIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'cursor_ai_task':
        return 'border-blue-200 bg-blue-50';
      case 'rapid_crm_ai_task':
        return 'border-green-200 bg-green-50';
      case 'collaborative_task':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-8 w-8 text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Workflow Optimization</h2>
            <p className="text-sm text-gray-500">Parallel AI task execution and delegation</p>
          </div>
        </div>
        
        {currentWorkflow && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentWorkflow.status === 'completed' ? 'text-green-600 bg-green-100' :
            currentWorkflow.status === 'executing' ? 'text-blue-600 bg-blue-100' :
            'text-gray-600 bg-gray-100'
          }`}>
            {currentWorkflow.status}
          </div>
        )}
      </div>

      {/* Project Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Description
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Describe the project (e.g., 'Fix timestamp display in AI Monitor', 'Implement ELD integration')"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleCreateWorkflow}
            disabled={!projectDescription.trim() || isExecuting}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Create Workflow
          </button>
        </div>
      </div>

      {/* Workflow Plan */}
      {currentWorkflow && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">{currentWorkflow.name}</h3>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">{currentWorkflow.estimatedTotalTime}</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">{currentWorkflow.description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Cursor AI Tasks</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Rapid CRM AI Tasks</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Collaborative Tasks</span>
              </div>
            </div>
            
            {currentWorkflow.status === 'planning' && (
              <button
                onClick={handleExecuteWorkflow}
                disabled={isExecuting}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <PlayIcon className="h-5 w-5" />
                <span>Execute Workflow</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Task List */}
      {currentWorkflow && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Task Breakdown</h3>
          <div className="space-y-3">
            {currentWorkflow.tasks.map((task, index) => (
              <div
                key={task.id}
                className={`border rounded-lg p-4 ${getTaskTypeColor(task.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTaskTypeIcon(task.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {task.estimatedDuration}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Assigned to: {task.assignedTo}</span>
                        {task.dependencies.length > 0 && (
                          <span>Dependencies: {task.dependencies.length}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {task.type === 'rapid_crm_ai_task' && (
                      <div className="text-xs text-green-600 font-medium">
                        Delegated
                      </div>
                    )}
                    {task.type === 'cursor_ai_task' && (
                      <div className="text-xs text-blue-600 font-medium">
                        Cursor AI
                      </div>
                    )}
                    {task.type === 'collaborative_task' && (
                      <div className="text-xs text-purple-600 font-medium">
                        Collaborative
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delegated Tasks Status */}
      {delegatedTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Delegated Tasks Status</h3>
          <div className="space-y-2">
            {delegatedTasks.map((task) => (
              <div key={task.taskId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">{task.taskId}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Benefits */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Workflow Optimization Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Parallel Execution</h4>
            <ul className="space-y-1">
              <li>• Cursor AI handles code implementation</li>
              <li>• Rapid CRM AI handles analysis and research</li>
              <li>• Both AIs work simultaneously</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Time Optimization</h4>
            <ul className="space-y-1">
              <li>• Tasks executed in parallel</li>
              <li>• No waiting for sequential completion</li>
              <li>• Faster overall project delivery</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowOptimizationDemo;
