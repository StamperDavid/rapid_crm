import React, { useState, useEffect } from 'react';
import {
  ChipIcon, ChartBarIcon, CogIcon, ExclamationIcon, CheckCircleIcon, RefreshIcon, PlayIcon,
  PauseIcon, EyeIcon, ShieldCheckIcon, GlobeAltIcon, UserIcon, SpeakerphoneIcon,
} from '@heroicons/react/outline';

const AIAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'monitoring', name: 'Monitoring', icon: EyeIcon },
    { id: 'configuration', name: 'Configuration', icon: CogIcon },
    { id: 'collaboration', name: 'Collaboration', icon: UserIcon },
    { id: 'advanced', name: 'Advanced', icon: CogIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <ChipIcon className="h-8 w-8 mr-3 text-purple-600" />
                AI Administration
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Comprehensive AI system management and monitoring
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <RefreshIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Health Status */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          System Health
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {metrics ? (metrics.errorRate < 0.1 ? 'Healthy' : 'Warning') : 'Loading...'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Requests */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Requests
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {metrics?.totalRequests || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Rate */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Success Rate
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {metrics ? `${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%` : '0%'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Alerts */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ExclamationIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Active Alerts
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {alerts.filter(alert => !alert.resolved).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI System Monitoring</h3>
                <p className="text-gray-600 dark:text-gray-400">Monitoring features will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'configuration' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Configuration</h3>
                <p className="text-gray-600 dark:text-gray-400">Configuration options will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'collaboration' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Collaboration</h3>
                <p className="text-gray-600 dark:text-gray-400">Collaboration features will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Advanced Settings</h3>
                <p className="text-gray-600 dark:text-gray-400">Advanced settings will be implemented here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAdminPage;
