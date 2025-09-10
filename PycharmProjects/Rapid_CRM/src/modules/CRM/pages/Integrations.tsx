import React from 'react';
import { CogIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Integrations: React.FC = () => {
  const integrations = [
    {
      id: 1,
      name: 'HubSpot',
      description: 'Sync contacts and deals with HubSpot CRM',
      status: 'connected',
      lastSync: '2024-01-20 10:30 AM'
    },
    {
      id: 2,
      name: 'Salesforce',
      description: 'Import leads and opportunities from Salesforce',
      status: 'disconnected',
      lastSync: null
    },
    {
      id: 3,
      name: 'QuickBooks',
      description: 'Sync financial data and invoices',
      status: 'connected',
      lastSync: '2024-01-20 09:15 AM'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Integrations</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Connect your CRM with external services and tools
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CogIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {integration.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {integration.description}
                </p>
              </div>
              <div className="flex-shrink-0">
                {integration.status === 'connected' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-500" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  integration.status === 'connected'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {integration.status}
                </span>
                {integration.lastSync && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Last sync: {integration.lastSync}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Integrations;