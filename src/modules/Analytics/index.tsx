import React from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, UsersIcon } from '@heroicons/react/24/outline';

const AnalyticsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          View insights and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Revenue</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">$485K</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Growth</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">+23%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Active Users</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">156</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModule;

