import React from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { useCRM } from '../../contexts/CRMContext';

const DashboardModule: React.FC = () => {
  const { companies, contacts, vehicles, drivers, isLoading } = useCRM();
  
  // Calculate real stats from CRM data
  const stats = {
    companies: companies.length,
    contacts: contacts.length,
    vehicles: vehicles.length,
    drivers: drivers.length,
    deals: 5, // Dummy data for now - deals not implemented yet
    revenue: 125000 // Dummy data for now - revenue calculation not implemented yet
  };

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
      href: '/crm/companies',
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      name: 'Total Contacts',
      value: stats?.contacts || 0,
      icon: UserGroupIcon,
      change: '+8%',
      changeType: 'increase' as const,
      href: '/crm/contacts',
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      name: 'Total Vehicles',
      value: stats?.vehicles || 0,
      icon: CurrencyDollarIcon,
      change: '+15%',
      changeType: 'increase' as const,
      href: '/crm/vehicles',
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      name: 'Total Drivers',
      value: stats?.drivers || 0,
      icon: CurrencyDollarIcon,
      change: '+23%',
      changeType: 'increase' as const,
      href: '/crm/drivers',
      color: 'emerald',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
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
    <div className="space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-slate-100 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome to your CRM dashboard. Here's an overview of your business performance.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 hover:shadow-md hover:ring-slate-300 dark:hover:ring-slate-600 transition-all duration-200"
          >
            <div>
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-xl p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stat.changeType === 'increase' ? (
                          <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                        )}
                        <span className="sr-only">
                          {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                        </span>
                        <span className="ml-1">{stat.change}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </Link>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-slate-100">
            Recent Activities
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Latest updates from your CRM system
          </p>
        </div>
        <div className="px-6 py-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivities.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-4">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-800 shadow-sm ${
                          activity.type === 'deal' ? 'bg-blue-500' :
                          activity.type === 'contact' ? 'bg-emerald-500' :
                          'bg-purple-500'
                        }`}>
                          <span className="text-white text-xs font-semibold">
                            {activity.type === 'deal' ? 'D' :
                             activity.type === 'contact' ? 'C' : 'Co'}
                          </span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {activity.message}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-slate-500 dark:text-slate-400">
                          <time className="font-medium">{activity.timestamp}</time>
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
  );
};

export default DashboardModule;