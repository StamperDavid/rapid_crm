import React, { useState } from 'react';
import {
  CogIcon,
  PlayIcon,
  PauseIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  AcademicCapIcon,
  ChipIcon,
  StarIcon,
  RefreshIcon,
  DocumentTextIcon,
  MapIcon,
  ClockIcon,
  LightningBoltIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ExclamationIcon
} from '@heroicons/react/outline';

interface AdvancedAIAgentControlPanelProps {
  className?: string;
}

const AdvancedAIAgentControlPanel: React.FC<AdvancedAIAgentControlPanelProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('agents');

  const renderAgentManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Agent Management</h2>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Onboarding Agent</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              active
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Specialized agent for handling client onboarding, USDOT registration guidance, and compliance recommendations
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <EyeIcon className="h-4 w-4" />
              </button>
            </div>
            <button className="p-2 text-green-600 hover:text-green-700">
              <PauseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Customer Service Agent</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              active
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Handles ongoing customer support, service changes, and account management
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <EyeIcon className="h-4 w-4" />
              </button>
            </div>
            <button className="p-2 text-green-600 hover:text-green-700">
              <PauseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkflowsAndTraining = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Intelligent Training Environment</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered training system that creates scenarios, tests agents, and trains them to 100% accuracy
          </p>
        </div>
        <button
          onClick={() => { window.location.href = '/training'; }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <AcademicCapIcon className="h-4 w-4 mr-2" />
          Open Training Environment
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <ChipIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">🤖 Intelligent Training System</h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <div><strong>🎯 What it does:</strong> Creates randomized training scenarios, tests agent performance, and trains agents to 100% accuracy</div>
              <div><strong>🧠 How it works:</strong> Each training environment is intelligent and capable of creating scenarios, testing results, and teaching agents to improve</div>
              <div><strong>👑 Golden Master System:</strong> Once an agent reaches 100% accuracy, it saves a "sire" copy that can be used to create new agents</div>
              <div><strong>🔄 Auto-Replacement:</strong> If an agent starts having issues, the system automatically replaces it with a fresh copy from the Golden Master</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Training Environments</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">4</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlayIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Training</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Golden Masters</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChipIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Agents Trained</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Accuracy</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">94%</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <RefreshIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Auto-Replacements</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Training Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center mb-3">
              <AcademicCapIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Regulation Training</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Intelligent training environment for USDOT, IFTA, and state registrations
            </p>
            <button 
              onClick={() => window.location.href = '/training'}
              className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Access Training
            </button>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center mb-3">
              <DocumentTextIcon className="h-6 w-6 text-green-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">USDOT Training Center</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Pixel-perfect FMCSA USDOT registration interface emulation
            </p>
            <button 
              onClick={() => window.location.href = '/training/usdot'}
              className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Access USDOT Center
            </button>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center mb-3">
              <ChartBarIcon className="h-6 w-6 text-purple-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Performance Monitoring</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Real-time monitoring and analytics of agent training performance
            </p>
            <button 
              onClick={() => window.location.href = '/training/monitoring'}
              className="w-full px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              View Monitoring
            </button>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center mb-3">
              <ExclamationIcon className="h-6 w-6 text-orange-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Critical Path Tests</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Test agents on the most common USDOT application failure points
            </p>
            <button 
              onClick={() => window.location.href = '/training/critical-path'}
              className="w-full px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Run Critical Tests
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'agents', name: 'Agent Management', icon: CogIcon },
    { id: 'training', name: 'Workflows & Training', icon: AcademicCapIcon }
  ];

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow ${className}`}>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'agents' && renderAgentManagement()}
        {activeTab === 'training' && renderWorkflowsAndTraining()}
      </div>
    </div>
  );
};

export default AdvancedAIAgentControlPanel;
