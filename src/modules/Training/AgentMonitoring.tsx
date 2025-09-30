import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  RefreshIcon,
  CogIcon
} from '@heroicons/react/outline';
import HelpIcon from '../../components/HelpIcon';

const AgentMonitoring: React.FC = () => {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'USDOT Application Agent #1',
      status: 'healthy',
      performance: 98.5,
      lastCheck: '2 minutes ago',
      uptime: '99.9%',
      errors: 0,
      responseTime: '1.2s',
      location: 'Production'
    },
    {
      id: 2,
      name: 'Customer Service Agent #2',
      status: 'warning',
      performance: 85.2,
      lastCheck: '5 minutes ago',
      uptime: '97.8%',
      errors: 3,
      responseTime: '2.8s',
      location: 'Production'
    },
    {
      id: 3,
      name: 'Compliance Checker Agent #3',
      status: 'error',
      performance: 72.1,
      lastCheck: '10 minutes ago',
      uptime: '89.2%',
      errors: 12,
      responseTime: '5.1s',
      location: 'Production'
    },
    {
      id: 4,
      name: 'USDOT Application Agent #4',
      status: 'healthy',
      performance: 96.8,
      lastCheck: '1 minute ago',
      uptime: '99.7%',
      errors: 0,
      responseTime: '1.5s',
      location: 'Production'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'error': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  const healthyAgents = agents.filter(agent => agent.status === 'healthy').length;
  const warningAgents = agents.filter(agent => agent.status === 'warning').length;
  const errorAgents = agents.filter(agent => agent.status === 'error').length;
  const avgPerformance = Math.round(agents.reduce((acc, agent) => acc + agent.performance, 0) / agents.length * 10) / 10;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
              Agent Monitoring
              <HelpIcon 
                content="Monitor your AI agents' performance, detect issues, and automatically replace degraded agents. This system ensures your agents maintain optimal performance."
                size="md"
                position="right"
                className="ml-3"
              />
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor AI agent performance and health
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <RefreshIcon className="h-4 w-4 mr-2" />
            Refresh All
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Healthy Agents
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {healthyAgents}
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
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Warning Agents
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {warningAgents}
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
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Error Agents
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {errorAgents}
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
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Avg. Performance
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {avgPerformance}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Agent Status
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Real-time monitoring of all deployed AI agents
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {agents.map((agent) => {
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
                        <span>Performance: {agent.performance}%</span>
                        <span className="mx-2">•</span>
                        <span>Uptime: {agent.uptime}</span>
                        <span className="mx-2">•</span>
                        <span>Response: {agent.responseTime}</span>
                        <span className="mx-2">•</span>
                        <span>Errors: {agent.errors}</span>
                        <span className="mx-2">•</span>
                        <span>Last check: {agent.lastCheck}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Performance Bar */}
                    <div className="w-24">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            agent.performance >= 95 ? 'bg-green-600' :
                            agent.performance >= 85 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${agent.performance}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                        {agent.performance}%
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-1">
                      <button className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                        <RefreshIcon className="h-4 w-4" />
                      </button>
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

export default AgentMonitoring;
