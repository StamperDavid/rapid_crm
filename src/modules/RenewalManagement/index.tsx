import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/outline';
import VisibleHelpIcon from '../../components/VisibleHelpIcon';

interface RenewalItem {
  id: string;
  clientName: string;
  companyName: string;
  registrationType: 'USDOT' | 'MC' | 'UCR' | 'IFTA' | 'IRP' | 'State' | 'HVUT';
  renewalDate: string;
  frequency: 'Annual' | 'Biennial' | 'Quarterly';
  status: 'upcoming' | 'due' | 'overdue' | 'completed' | 'auto-renewed';
  value: number;
  daysUntilDue: number;
  autoRenewal: boolean;
  lastRenewed?: string;
  nextRenewal?: string;
}

const RenewalManagement: React.FC = () => {
  const [renewals, setRenewals] = useState<RenewalItem[]>([
    {
      id: '1',
      clientName: 'John Smith',
      companyName: 'Smith Trucking LLC',
      registrationType: 'USDOT',
      renewalDate: '2024-03-15',
      frequency: 'Biennial',
      status: 'upcoming',
      value: 0,
      daysUntilDue: 45,
      autoRenewal: true,
      lastRenewed: '2022-03-15',
      nextRenewal: '2026-03-15'
    },
    {
      id: '2',
      clientName: 'Maria Garcia',
      companyName: 'Garcia Logistics',
      registrationType: 'UCR',
      renewalDate: '2024-02-28',
      frequency: 'Annual',
      status: 'due',
      value: 76,
      daysUntilDue: -5,
      autoRenewal: false,
      lastRenewed: '2023-02-28',
      nextRenewal: '2025-02-28'
    },
    {
      id: '3',
      clientName: 'Mike Davis',
      companyName: 'Davis Freight',
      registrationType: 'IFTA',
      renewalDate: '2024-01-31',
      frequency: 'Annual',
      status: 'overdue',
      value: 10,
      daysUntilDue: -15,
      autoRenewal: true,
      lastRenewed: '2023-01-31',
      nextRenewal: '2025-01-31'
    },
    {
      id: '4',
      clientName: 'Lisa Wilson',
      companyName: 'Wilson Transport',
      registrationType: 'IFTA',
      renewalDate: '2024-03-31',
      frequency: 'Quarterly',
      status: 'upcoming',
      value: 0,
      daysUntilDue: 30,
      autoRenewal: true,
      lastRenewed: '2023-12-31',
      nextRenewal: '2024-06-30'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('daysUntilDue');

  // Calculate renewal statistics
  const stats = {
    totalRenewals: renewals.length,
    upcoming: renewals.filter(r => r.status === 'upcoming').length,
    due: renewals.filter(r => r.status === 'due').length,
    overdue: renewals.filter(r => r.status === 'overdue').length,
    totalValue: renewals.reduce((sum, r) => sum + r.value, 0),
    autoRenewalRate: (renewals.filter(r => r.autoRenewal).length / renewals.length) * 100
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'due': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'auto-renewed': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return ClockIcon;
      case 'due': return ExclamationTriangleIcon;
      case 'overdue': return ExclamationTriangleIcon;
      case 'completed': return CheckCircleIcon;
      case 'auto-renewed': return CheckCircleIcon;
      default: return ClockIcon;
    }
  };

  const getRegistrationIcon = (type: string) => {
    switch (type) {
      case 'USDOT': return TruckIcon;
      case 'MC': return DocumentTextIcon;
      case 'UCR': return DocumentTextIcon;
      case 'IFTA': return CurrencyDollarIcon;
      case 'IRP': return DocumentTextIcon;
      case 'State': return DocumentTextIcon;
      case 'HVUT': return CurrencyDollarIcon;
      default: return DocumentTextIcon;
    }
  };

  const filteredRenewals = renewals.filter(renewal => {
    const statusMatch = filterStatus === 'all' || renewal.status === filterStatus;
    const typeMatch = filterType === 'all' || renewal.registrationType === filterType;
    return statusMatch && typeMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-600 mr-3" />
              Renewal Management
              <VisibleHelpIcon 
                content="Monitor USDOT (biennial), UCR (annual), IFTA (annual), State registrations, and quarterly reporting requirements. This is where 70% of our revenue comes from - recurring renewals and compliance monitoring."
                size="md"
                position="right"
                className="ml-3"
              />
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track and manage all client renewals and compliance deadlines. Every service we offer includes renewal management as a core component.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <BellIcon className="h-4 w-4 mr-2" />
              Send Renewal Alerts
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <CogIcon className="h-4 w-4 mr-2" />
              Auto-Renewal Settings
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Renewals
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {stats.totalRenewals}
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
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Upcoming
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {stats.upcoming}
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
                    Due Soon
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {stats.due}
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
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Overdue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {stats.overdue}
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
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    ${stats.totalValue}
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
                    Auto-Renewal
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {stats.autoRenewalRate.toFixed(0)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="due">Due Soon</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
              <option value="auto-renewed">Auto-Renewed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Registration Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Types</option>
              <option value="USDOT">USDOT</option>
              <option value="MC">MC Number</option>
              <option value="UCR">UCR</option>
              <option value="IFTA">IFTA</option>
              <option value="IRP">IRP</option>
              <option value="State">State Registration</option>
              <option value="HVUT">HVUT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="daysUntilDue">Days Until Due</option>
              <option value="renewalDate">Renewal Date</option>
              <option value="clientName">Client Name</option>
              <option value="value">Value</option>
            </select>
          </div>
        </div>
      </div>

      {/* Renewals List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Renewal Schedule
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            All upcoming, due, and overdue renewals for your clients
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredRenewals.map((renewal) => {
            const StatusIcon = getStatusIcon(renewal.status);
            const RegistrationIcon = getRegistrationIcon(renewal.registrationType);
            
            return (
              <li key={renewal.id} className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <RegistrationIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {renewal.clientName} - {renewal.companyName}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(renewal.status)}`}>
                          {renewal.status}
                        </span>
                        {renewal.autoRenewal && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            Auto-Renewal
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{renewal.registrationType}</span>
                        <span className="mx-2">•</span>
                        <span>{renewal.frequency}</span>
                        <span className="mx-2">•</span>
                        <span>Due: {renewal.renewalDate}</span>
                        <span className="mx-2">•</span>
                        <span className={renewal.daysUntilDue < 0 ? 'text-red-600' : renewal.daysUntilDue < 30 ? 'text-yellow-600' : 'text-gray-500'}>
                          {renewal.daysUntilDue < 0 ? `${Math.abs(renewal.daysUntilDue)} days overdue` : 
                           renewal.daysUntilDue === 0 ? 'Due today' : 
                           `${renewal.daysUntilDue} days remaining`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${renewal.value}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {renewal.frequency}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200">
                        <ArrowRightIcon className="h-4 w-4" />
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

export default RenewalManagement;
