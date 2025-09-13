import React from 'react';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  DocumentDownloadIcon,
  ChatIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationIcon,
} from '@heroicons/react/outline';
import { useClient } from '../../../contexts/ClientContext';
import { useCRM } from '../../../contexts/CRMContext';

const ClientDashboard: React.FC = () => {
  const { client, switchToClient, isAdminPreview } = useClient();
  const { companies, services, invoices } = useCRM();

  // If no client is selected, show client selection interface (admin preview mode)
  if (!client) {
    const mockClients = [
      {
        id: 'client_1',
        companyId: '1',
        companyName: 'Acme Transportation (TEST)',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@acmetransport.com',
        role: 'primary',
      },
      {
        id: 'client_2',
        companyId: '2',
        companyName: 'Global Shipping Co (TEST)',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@globalshipping.com',
        role: 'secondary',
      },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Client Portal - Admin Preview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select a client to preview their portal experience. This allows you to see exactly what clients see.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {mockClients.map((mockClient) => (
            <div key={mockClient.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {mockClient.firstName} {mockClient.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {mockClient.companyName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {mockClient.email}
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-2">
                    {mockClient.role}
                  </span>
                </div>
                <button
                  onClick={() => switchToClient(mockClient.id)}
                  className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Preview Portal
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Admin Preview Mode
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  This preview shows exactly what clients see in their portal. You can navigate through their data, 
                  view their services, and test the client experience without affecting any real data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const company = companies?.find(c => c.id === client.companyId);
  const clientServices = services?.filter(s => s.companyId === client.companyId) || [];
  const clientInvoices = invoices?.filter(i => i.clientName === client.companyName) || [];

  const stats = [
    {
      name: 'Active Services',
      value: clientServices.filter(s => s.status === 'Active').length,
      icon: DocumentTextIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      name: 'Pending Invoices',
      value: clientInvoices.filter(i => i.status === 'sent').length,
      icon: CurrencyDollarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    },
    {
      name: 'Compliance Items',
      value: 3, // Mock data
      icon: ShieldCheckIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      name: 'Documents',
      value: 12, // Mock data
      icon: DocumentDownloadIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'service',
      title: 'ELD Service Renewal',
      description: 'Your ELD service will renew on March 15, 2024',
      status: 'upcoming',
      date: '2024-03-01',
    },
    {
      id: 2,
      type: 'invoice',
      title: 'Invoice #INV-2024-001',
      description: 'Payment received for transportation services',
      status: 'completed',
      date: '2024-02-28',
    },
    {
      id: 3,
      type: 'compliance',
      title: 'USDOT Renewal Due',
      description: 'Your USDOT number expires on April 30, 2024',
      status: 'warning',
      date: '2024-02-25',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'upcoming':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <ExclamationIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Preview Header */}
      {isAdminPreview && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Admin Preview Mode
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You are viewing the client portal as {client.firstName} {client.lastName} from {client.companyName}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()} // Simple way to exit preview
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Exit Preview
            </button>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back, {client.firstName}!
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Here's what's happening with your account at {client.companyName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Last login</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {new Date(client.lastLogin).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Recent Activity
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.description}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Quick Actions
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-3">
              {client.permissions.canViewServices && (
                <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      View Services
                    </span>
                  </div>
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
              {client.permissions.canViewInvoices && (
                <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      View Invoices
                    </span>
                  </div>
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
              {client.permissions.canSubmitRequests && (
                <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <ChatIcon className="h-5 w-5 text-cyan-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Contact Support
                    </span>
                  </div>
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      {company && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Company Information
            </h3>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.legalBusinessName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">USDOT Number</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.usdotNumber || 'Not assigned'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Contact</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{client.firstName} {client.lastName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{client.email}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
