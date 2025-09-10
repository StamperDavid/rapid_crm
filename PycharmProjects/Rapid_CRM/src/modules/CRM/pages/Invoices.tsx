import React, { useState } from 'react';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdDate: string;
  description: string;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      clientName: 'Acme Corporation',
      clientEmail: 'billing@acme.com',
      amount: 2500.00,
      status: 'paid',
      dueDate: '2024-01-15',
      createdDate: '2024-01-01',
      description: 'Website Development Services'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      clientName: 'Global Shipping Co',
      clientEmail: 'finance@globalshipping.com',
      amount: 1800.00,
      status: 'sent',
      dueDate: '2024-01-25',
      createdDate: '2024-01-10',
      description: 'CRM Implementation'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      clientName: 'Tech Solutions Inc',
      clientEmail: 'accounts@techsolutions.com',
      amount: 3200.00,
      status: 'overdue',
      dueDate: '2024-01-10',
      createdDate: '2023-12-20',
      description: 'Mobile App Development'
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024-004',
      clientName: 'StartupXYZ',
      clientEmail: 'hello@startupxyz.com',
      amount: 950.00,
      status: 'draft',
      dueDate: '2024-02-01',
      createdDate: '2024-01-18',
      description: 'Consulting Services'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(invoice => invoice.status === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'sent':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'overdue':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Invoices</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage your invoices and track payments
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Invoiced
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    ${totalAmount.toLocaleString()}
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
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Paid Amount
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    ${paidAmount.toLocaleString()}
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
                <XCircleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Overdue Amount
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    ${overdueAmount.toLocaleString()}
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
                <DocumentTextIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Invoices
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {invoices.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'All', count: invoices.length },
          { key: 'draft', label: 'Draft', count: invoices.filter(i => i.status === 'draft').length },
          { key: 'sent', label: 'Sent', count: invoices.filter(i => i.status === 'sent').length },
          { key: 'paid', label: 'Paid', count: invoices.filter(i => i.status === 'paid').length },
          { key: 'overdue', label: 'Overdue', count: invoices.filter(i => i.status === 'overdue').length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredInvoices.map((invoice) => (
            <li key={invoice.id}>
              <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {getStatusIcon(invoice.status)}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {invoice.invoiceNumber}
                      </p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {invoice.clientName} • {invoice.description}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      ${invoice.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {invoice.clientEmail}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Invoices;
