/**
 * CUSTOM AI COLLABORATION TEST COMPONENT
 * Fresh code written from scratch - no imports of existing components
 * Tests the AI-to-AI collaboration system
 */

import React, { useState, useEffect } from 'react';
import { aiCollaborationService, AICollaborationMessage, AIProject, AITask } from '../services/ai/AICollaborationService';

export const AICollaborationTest: React.FC = () => {
  const [messages, setMessages] = useState<AICollaborationMessage[]>([]);
  const [projects, setProjects] = useState<AIProject[]>([]);
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test message form
  const [messageForm, setMessageForm] = useState({
    from_ai: 'Claude',
    to_ai: 'Rapid_CRM_AI',
    message_type: 'text' as const,
    content: ''
  });

  // Test project form
  const [projectForm, setProjectForm] = useState({
    project_name: '',
    description: '',
    assigned_ais: ['Claude', 'Rapid_CRM_AI']
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load messages
      const messagesResult = await aiCollaborationService.getMessages();
      if (messagesResult.success) {
        setMessages(messagesResult.messages || []);
      }

      // Load projects
      const projectsResult = await aiCollaborationService.getProjects();
      if (projectsResult.success) {
        setProjects(projectsResult.projects || []);
      }

      // Load tasks
      const tasksResult = await aiCollaborationService.getTasks();
      if (tasksResult.success) {
        setTasks(tasksResult.tasks || []);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageForm.content.trim()) return;

    setLoading(true);
    try {
      const result = await aiCollaborationService.sendMessage(
        messageForm.from_ai,
        messageForm.to_ai,
        messageForm.message_type,
        messageForm.content
      );

      if (result.success) {
        setMessageForm(prev => ({ ...prev, content: '' }));
        loadData(); // Reload data
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!projectForm.project_name.trim()) return;

    setLoading(true);
    try {
      const result = await aiCollaborationService.createProject(
        projectForm.project_name,
        projectForm.description,
        projectForm.assigned_ais
      );

      if (result.success) {
        setProjectForm({ project_name: '', description: '', assigned_ais: ['Claude', 'Rapid_CRM_AI'] });
        loadData(); // Reload data
      } else {
        setError(result.error || 'Failed to create project');
      }
    } catch (err) {
      setError('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const assignTask = async (projectId: string) => {
    setLoading(true);
    try {
      const result = await aiCollaborationService.assignTask(
        projectId,
        'Rapid_CRM_AI',
        'code_generation',
        'Generate a new React component for user management',
        'high'
      );

      if (result.success) {
        loadData(); // Reload data
      } else {
        setError(result.error || 'Failed to assign task');
      }
    } catch (err) {
      setError('Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Collaboration System Test</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Message Exchange Test */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Message Exchange</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From AI</label>
              <select
                value={messageForm.from_ai}
                onChange={(e) => setMessageForm(prev => ({ ...prev, from_ai: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Claude">Claude</option>
                <option value="Rapid_CRM_AI">Rapid CRM AI</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To AI</label>
              <select
                value={messageForm.to_ai}
                onChange={(e) => setMessageForm(prev => ({ ...prev, to_ai: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Claude">Claude</option>
                <option value="Rapid_CRM_AI">Rapid CRM AI</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
            <select
              value={messageForm.message_type}
              onChange={(e) => setMessageForm(prev => ({ ...prev, message_type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Text</option>
              <option value="project_update">Project Update</option>
              <option value="database_operation">Database Operation</option>
              <option value="code_generation">Code Generation</option>
              <option value="task_assignment">Task Assignment</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
            <textarea
              value={messageForm.content}
              onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={loading || !messageForm.content.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        {/* Project Coordination Test */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Project Coordination</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                value={projectForm.project_name}
                onChange={(e) => setProjectForm(prev => ({ ...prev, project_name: e.target.value }))}
                placeholder="Enter project name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={projectForm.description}
                onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter project description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={createProject}
            disabled={loading || !projectForm.project_name.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>

        {/* Data Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Messages ({messages.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.message_id} className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm font-medium text-gray-700">
                    {message.from_ai} → {message.to_ai}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {message.message_type} • {new Date(message.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-800">{message.content}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Active Projects ({projects.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {projects.map((project) => (
                <div key={project.project_id} className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm font-medium text-gray-700">{project.project_name}</div>
                  <div className="text-xs text-gray-500 mb-1">
                    {project.status} • {project.progress_percentage}%
                  </div>
                  <div className="text-sm text-gray-800 mb-2">{project.description}</div>
                  <button
                    onClick={() => assignTask(project.project_id)}
                    className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                  >
                    Assign Task
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Tasks ({tasks.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.task_id} className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm font-medium text-gray-700">{task.task_type}</div>
                  <div className="text-xs text-gray-500 mb-1">
                    {task.status} • {task.priority} • {task.assigned_to_ai}
                  </div>
                  <div className="text-sm text-gray-800">{task.task_description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6">
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICollaborationTest;
