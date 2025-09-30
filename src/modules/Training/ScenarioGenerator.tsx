import React, { useState } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  PlayIcon,
  CogIcon,
  LightBulbIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/outline';
import HelpIcon from '../../components/HelpIcon';

const ScenarioGenerator: React.FC = () => {
  const [scenarios, setScenarios] = useState([
    {
      id: 1,
      name: 'Texas Trucking Company - 15,000 lbs GVWR',
      type: 'USDOT Application',
      complexity: 'Medium',
      status: 'ready',
      created: '2 hours ago'
    },
    {
      id: 2,
      name: 'California Passenger Transport - 8 passengers',
      type: 'USDOT Application',
      complexity: 'High',
      status: 'generating',
      created: '1 hour ago'
    },
    {
      id: 3,
      name: 'Oklahoma Freight Hauler - 12,000 lbs GVWR',
      type: 'USDOT Application',
      complexity: 'Low',
      status: 'ready',
      created: '3 hours ago'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'generating': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
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
              <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
              Scenario Generator
              <HelpIcon 
                content="Generate mock client scenarios and regulatory situations to test and train your AI agents. Create realistic training data for different DOT compliance situations."
                size="md"
                position="right"
                className="ml-3"
              />
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create training scenarios for AI agent testing
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <PlusIcon className="h-4 w-4 mr-2" />
            Generate New Scenario
          </button>
        </div>
      </div>

      {/* Scenario List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Generated Scenarios
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Training scenarios for testing AI agent performance
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {scenarios.map((scenario) => (
            <li key={scenario.id} className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {scenario.name}
                      </p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scenario.status)}`}>
                        {scenario.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Type: {scenario.type}</span>
                      <span className="mx-2">•</span>
                      <span>Complexity: {scenario.complexity}</span>
                      <span className="mx-2">•</span>
                      <span>Created: {scenario.created}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                    <PlayIcon className="h-4 w-4" />
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

export default ScenarioGenerator;
