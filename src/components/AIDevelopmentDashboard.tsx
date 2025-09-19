import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  OfficeBuildingIcon,
  CogIcon,
  ExclamationIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  RefreshIcon,
} from '@heroicons/react/outline';
import { aiDevelopmentAssistant, DevelopmentTask, ComponentAnalysis } from '../services/ai/AIDevelopmentAssistant';
import { aiSystemController, SystemOperation } from '../services/ai/AISystemController';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
}

interface CodeQuality {
  score: number;
  issues: string[];
  suggestions: string[];
}

const AIDevelopmentDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<DevelopmentTask[]>([]);
  const [systemOperations, setSystemOperations] = useState<SystemOperation[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [codeQuality, setCodeQuality] = useState<CodeQuality | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [developmentSuggestions, setDevelopmentSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentType, setNewComponentType] = useState<'react' | 'service' | 'hook' | 'utility'>('react');
  const [newComponentRequirements, setNewComponentRequirements] = useState<string>('');

  useEffect(() => {
    loadTasks();
    performHealthCheck();
  }, []);

  const loadTasks = () => {
    const allTasks = aiDevelopmentAssistant.getTasks();
    setTasks(allTasks);
    
    const allOperations = aiSystemController.getOperations();
    setSystemOperations(allOperations);
  };

  const performHealthCheck = async () => {
    try {
      const health = await aiDevelopmentAssistant.performSystemHealthCheck();
      setSystemHealth(health);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const analyzeCodeQuality = async () => {
    if (!selectedFile) return;
    
    try {
      const quality = await aiDevelopmentAssistant.analyzeCodeQuality(selectedFile);
      setCodeQuality(quality);
    } catch (error) {
      console.error('Code quality analysis failed:', error);
    }
  };

  const getDevelopmentSuggestions = async () => {
    try {
      const suggestions = await aiDevelopmentAssistant.getDevelopmentSuggestions(
        'Rapid CRM system with React, TypeScript, and SQLite'
      );
      setDevelopmentSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to get development suggestions:', error);
    }
  };

  const generateComponent = async () => {
    if (!newComponentName.trim()) return;
    
    setIsGenerating(true);
    try {
      const requirements = newComponentRequirements
        .split(',')
        .map(req => req.trim())
        .filter(req => req.length > 0);
      
      const code = await aiDevelopmentAssistant.generateComponent(
        newComponentName,
        newComponentType,
        requirements
      );
      
      setGeneratedCode(code);
      setShowCodeGenerator(false);
    } catch (error) {
      console.error('Component generation failed:', error);
    } finally {
      setIsGenerating(false);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Development Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Full editor-level permissions for collaborative development
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={performHealthCheck}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <RefreshIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCodeGenerator(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Generate Code</span>
          </button>
        </div>
      </div>

      {/* System Health */}
      {systemHealth && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Health
            </h2>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(systemHealth.status)}`}>
              {systemHealth.status.toUpperCase()}
            </span>
          </div>
          
          {systemHealth.issues.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Issues</h3>
              <ul className="space-y-1">
                {systemHealth.issues.map((issue, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-red-600">
                    <ExclamationIcon className="h-4 w-4" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {systemHealth.recommendations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recommendations</h3>
              <ul className="space-y-1">
                {systemHealth.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-blue-600">
                    <ExclamationIcon className="h-4 w-4" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* System Operations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CogIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Operations
            </h2>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {systemOperations.length} operations
          </span>
        </div>
        
        {systemOperations.length > 0 ? (
          <div className="space-y-3">
            {systemOperations.map((operation) => (
              <div key={operation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {operation.action} {operation.target}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}>
                      {operation.status}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {operation.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {operation.timestamp.toLocaleString()}
                  </span>
                </div>
                {operation.error && (
                  <div className="text-xs text-red-600 dark:text-red-400">
                    Error: {operation.error}
                  </div>
                )}
                {operation.result && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Result: {operation.result.message || 'Success'}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No system operations yet
          </div>
        )}
      </div>

      {/* Development Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CogIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Development Tasks
            </h2>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {tasks.length} tasks
          </span>
        </div>
        
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.description}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {task.type} • {task.target}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Created: {task.createdAt.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No development tasks yet
          </div>
        )}
      </div>

      {/* Code Quality Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <DocumentTextIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Code Quality Analysis
          </h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Enter file path to analyze..."
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={analyzeCodeQuality}
              disabled={!selectedFile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze
            </button>
          </div>
          
          {codeQuality && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Quality Score: {codeQuality.score}/100
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${codeQuality.score}%` }}
                  ></div>
                </div>
              </div>
              
              {codeQuality.issues.length > 0 && (
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Issues</h3>
                  <ul className="space-y-1">
                    {codeQuality.issues.map((issue, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-red-600">
                        <ExclamationIcon className="h-4 w-4" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {codeQuality.suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Suggestions</h3>
                  <ul className="space-y-1">
                    {codeQuality.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-blue-600">
                        <ExclamationIcon className="h-4 w-4" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Development Suggestions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ExclamationIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Development Suggestions
            </h2>
          </div>
          <button
            onClick={getDevelopmentSuggestions}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Get Suggestions
          </button>
        </div>
        
        {developmentSuggestions.length > 0 ? (
          <div className="space-y-2">
            {developmentSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <ExclamationIcon className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Click "Get Suggestions" to receive AI-powered development recommendations
          </div>
        )}
      </div>

      {/* Generated Code */}
      {generatedCode && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generated Code
            </h2>
            <button
              onClick={() => setGeneratedCode('')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
          
          <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-gray-800 dark:text-gray-200">{generatedCode}</code>
          </pre>
        </div>
      )}

      {/* Code Generator Modal */}
      {showCodeGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Generate New Component
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Component Name
                </label>
                <input
                  type="text"
                  value={newComponentName}
                  onChange={(e) => setNewComponentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., UserProfile"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Component Type
                </label>
                <select
                  value={newComponentType}
                  onChange={(e) => setNewComponentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="react">React Component</option>
                  <option value="service">Service Class</option>
                  <option value="hook">Custom Hook</option>
                  <option value="utility">Utility Function</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Requirements (comma-separated)
                </label>
                <textarea
                  value={newComponentRequirements}
                  onChange={(e) => setNewComponentRequirements(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="e.g., user authentication, data fetching, form validation"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={generateComponent}
                disabled={!newComponentName.trim() || isGenerating}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
              <button
                onClick={() => setShowCodeGenerator(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDevelopmentDashboard;
