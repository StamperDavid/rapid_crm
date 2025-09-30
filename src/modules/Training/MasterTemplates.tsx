import React, { useState } from 'react';
import {
  CheckCircleIcon,
  PlusIcon,
  DownloadIcon,
  UploadIcon,
  CogIcon,
  StarIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/outline';
import HelpIcon from '../../components/HelpIcon';

const MasterTemplates: React.FC = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'USDOT Application Master',
      version: 'v2.1',
      accuracy: 98.5,
      status: 'active',
      lastUpdated: '2 days ago',
      deployments: 15,
      successRate: 97.2,
      isGolden: true
    },
    {
      id: 2,
      name: 'Customer Service Master',
      version: 'v1.8',
      accuracy: 96.8,
      status: 'active',
      lastUpdated: '1 week ago',
      deployments: 8,
      successRate: 95.1,
      isGolden: true
    },
    {
      id: 3,
      name: 'Compliance Checker Master',
      version: 'v1.3',
      accuracy: 94.2,
      status: 'testing',
      lastUpdated: '3 days ago',
      deployments: 3,
      successRate: 92.8,
      isGolden: false
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'testing': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'archived': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-blue-600 mr-3" />
              Master Templates
              <HelpIcon 
                content="Manage your perfect agent templates - the validated, optimized versions used to create operational agents. These are your 'Golden Master' agents."
                size="md"
                position="right"
                className="ml-3"
              />
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage perfect agent templates for deployment
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New Template
          </button>
        </div>
      </div>

      {/* Template Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Golden Masters
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {templates.filter(t => t.isGolden).length}
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
                    {Math.round(templates.reduce((acc, t) => acc + t.accuracy, 0) / templates.length * 10) / 10}%
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
                <CheckCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Deployments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {templates.reduce((acc, t) => acc + t.deployments, 0)}
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
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Active Templates
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {templates.filter(t => t.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Master Templates
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Your validated, optimized agent templates ready for deployment
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {templates.map((template) => (
            <li key={template.id} className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {template.isGolden ? (
                      <StarIcon className="h-8 w-8 text-yellow-500" />
                    ) : (
                      <CheckCircleIcon className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {template.name}
                      </p>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {template.version}
                      </span>
                      {template.isGolden && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                          Golden Master
                        </span>
                      )}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                        {template.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Accuracy: {template.accuracy}%</span>
                      <span className="mx-2">•</span>
                      <span>Success Rate: {template.successRate}%</span>
                      <span className="mx-2">•</span>
                      <span>Deployments: {template.deployments}</span>
                      <span className="mx-2">•</span>
                      <span>Updated: {template.lastUpdated}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200">
                    <DownloadIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                    <UploadIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                    <CogIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MasterTemplates;
