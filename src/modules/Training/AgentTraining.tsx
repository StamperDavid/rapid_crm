import React, { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
  LightBulbIcon
} from '@heroicons/react/outline';
import HelpIcon from '../../components/HelpIcon';

const AgentTraining: React.FC = () => {
  const [trainingSessions, setTrainingSessions] = useState([
    {
      id: 1,
      name: 'USDOT Application Agent',
      status: 'training',
      progress: 75,
      accuracy: 92,
      lastTrained: '2 hours ago',
      totalSessions: 45,
      successRate: 94
    },
    {
      id: 2,
      name: 'Customer Service Agent',
      status: 'ready',
      progress: 100,
      accuracy: 98,
      lastTrained: '1 day ago',
      totalSessions: 32,
      successRate: 97
    },
    {
      id: 3,
      name: 'Compliance Checker Agent',
      status: 'training',
      progress: 60,
      accuracy: 85,
      lastTrained: '3 hours ago',
      totalSessions: 28,
      successRate: 89
    }
  ]);

  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'training': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'ready': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training': return ClockIcon;
      case 'ready': return CheckCircleIcon;
      case 'error': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-blue-600 mr-3" />
              AI Agent Training
              <HelpIcon 
                content="Train your AI agents to accurately determine DOT compliance requirements and handle client interactions. This is where you create and refine your 'Golden Master' agents."
                size="md"
                position="right"
                className="ml-3"
              />
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Train and optimize AI agents for specific roles and tasks
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <LightBulbIcon className="h-4 w-4 mr-2" />
            New Training Session
          </button>
        </div>
      </div>

      {/* Training Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Active Agents
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {trainingSessions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Avg. Accuracy
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {Math.round(trainingSessions.reduce((acc, agent) => acc + agent.accuracy, 0) / trainingSessions.length)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Ready Agents
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {trainingSessions.filter(agent => agent.status === 'ready').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Training Sessions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {trainingSessions.reduce((acc, agent) => acc + agent.totalSessions, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Training Sessions List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Training Sessions
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Manage and monitor your AI agent training sessions
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {trainingSessions.map((agent) => {
            const StatusIcon = getStatusIcon(agent.status);
            return (
              <li key={agent.id} className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <StatusIcon className={`h-8 w-8 ${getStatusColor(agent.status).split(' ')[0]}`} />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {agent.name}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>Accuracy: {agent.accuracy}%</span>
                        <span className="mx-2">•</span>
                        <span>Success Rate: {agent.successRate}%</span>
                        <span className="mx-2">•</span>
                        <span>Last trained: {agent.lastTrained}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Progress Bar */}
                    <div className="w-24">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${agent.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                        {agent.progress}%
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-1">
                      {agent.status === 'training' ? (
                        <>
                          <button className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200">
                            <PauseIcon className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200">
                            <StopIcon className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                        <CogIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AgentTraining;
