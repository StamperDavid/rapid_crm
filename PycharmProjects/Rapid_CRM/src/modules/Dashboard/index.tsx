import React from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

const DashboardModule: React.FC = () => {
  // Mock data for dashboard stats
  const stats = {
    companies: 24,
    contacts: 156,
    deals: 12,
    revenue: 485000
  };

  const isLoading = false;

  const recentActivities = [
    {
      id: 1,
      type: 'deal',
      message: 'New deal created: Acme Transportation Contract',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'contact',
      message: 'Contact updated: John Smith',
      timestamp: '4 hours ago'
    },
    {
      id: 3,
      type: 'company',
      message: 'Company added: Global Shipping Co',
      timestamp: '1 day ago'
    }
  ];

  const statCards = [
    {
      name: 'Total Companies',
      value: stats?.companies || 0,
      icon: BuildingOfficeIcon,
      change: '+12%',
      changeType: 'increase' as const,
      href: '/crm/companies'
    },
    {
      name: 'Total Contacts',
      value: stats?.contacts || 0,
      icon: UserGroupIcon,
      change: '+8%',
      changeType: 'increase' as const,
      href: '/crm/contacts'
    },
    {
      name: 'Open Deals',
      value: stats?.deals || 0,
      icon: CurrencyDollarIcon,
      change: '+15%',
      changeType: 'increase' as const,
      href: '/crm/deals'
    },
    {
      name: 'Total Revenue',
      value: `$${(stats?.revenue || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      change: '+23%',
      changeType: 'increase' as const,
      href: '/crm/deals'
    }
  ];

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Loading...
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Welcome to your CRM dashboard. Here's an overview of your business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'increase' ? (
                          <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                        )}
                        <span className="sr-only">
                          {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Recent Activities
          </h3>
          <div className="mt-5">
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivities.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${
                            activity.type === 'deal' ? 'bg-blue-500' :
                            activity.type === 'contact' ? 'bg-green-500' :
                            'bg-purple-500'
                          }`}>
                            <span className="text-white text-xs font-medium">
                              {activity.type === 'deal' ? 'D' :
                               activity.type === 'contact' ? 'C' : 'Co'}
                            </span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {activity.message}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                            <time>{activity.timestamp}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;