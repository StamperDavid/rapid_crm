import React from 'react';
import { ShieldCheckIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline';

const ComplianceModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Compliance</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Manage compliance requirements and documentation
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Compliance Status</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">All systems compliant</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Documents</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Pending Reviews</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceModule;

