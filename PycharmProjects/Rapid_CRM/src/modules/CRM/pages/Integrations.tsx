import React, { useState } from 'react';
import { 
  CogIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  PlusIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ChartBarIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../../contexts/UserContext';

const Integrations: React.FC = () => {
  const { hasPermission } = useUser();
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: 'QuickBooks Online',
      description: 'Sync invoices, payments, and financial data',
      status: 'connected',
      lastSync: '2024-01-20 09:15 AM',
      category: 'accounting',
      icon: CurrencyDollarIcon,
      features: ['Invoice Sync', 'Payment Tracking', 'Financial Reports']
    },
    {
      id: 2,
      name: 'Xero',
      description: 'Cloud-based accounting and invoicing',
      status: 'disconnected',
      lastSync: null,
      category: 'accounting',
      icon: DocumentTextIcon,
      features: ['Invoice Management', 'Expense Tracking', 'Bank Reconciliation']
    },
    {
      id: 3,
      name: 'Stripe',
      description: 'Payment processing and subscription management',
      status: 'connected',
      lastSync: '2024-01-20 11:30 AM',
      category: 'payments',
      icon: CreditCardIcon,
      features: ['Payment Processing', 'Subscription Billing', 'Revenue Analytics']
    },
    {
      id: 4,
      name: 'PayPal',
      description: 'Online payment processing and invoicing',
      status: 'disconnected',
      lastSync: null,
      category: 'payments',
      icon: CreditCardIcon,
      features: ['Payment Processing', 'Invoice Creation', 'Transaction History']
    },
    {
      id: 5,
      name: 'Kixie',
      description: 'Power dialer and call tracking integration',
      status: 'connected',
      lastSync: '2024-01-20 10:30 AM',
      category: 'communication',
      icon: ChartBarIcon,
      features: ['Power Dialing', 'Call Recording', 'Call Analytics']
    },
    {
      id: 6,
      name: 'Twilio SMS',
      description: 'SMS messaging and notifications',
      status: 'disconnected',
      lastSync: null,
      category: 'communication',
      icon: ChartBarIcon,
      features: ['SMS Campaigns', 'Automated Messages', 'Delivery Tracking']
    }
  ]);

  const categories = [
    { name: 'All', value: 'all' },
    { name: 'Accounting', value: 'accounting' },
    { name: 'Payments', value: 'payments' },
    { name: 'Communication', value: 'communication' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddIntegrationModal, setShowAddIntegrationModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    description: '',
    category: 'accounting',
    features: ['']
  });
  const [newCategory, setNewCategory] = useState('');

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory);

  const handleConnect = (id: number) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, status: 'connected', lastSync: new Date().toLocaleString() }
        : integration
    ));
  };

  const handleDisconnect = (id: number) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, status: 'disconnected', lastSync: null }
        : integration
    ));
  };

  const handleAddIntegration = () => {
    if (newIntegration.name && newIntegration.description) {
      const integration = {
        id: integrations.length + 1,
        name: newIntegration.name,
        description: newIntegration.description,
        status: 'disconnected' as const,
        lastSync: null,
        category: newIntegration.category,
        icon: CogIcon,
        features: newIntegration.features.filter(f => f.trim() !== '')
      };
      setIntegrations(prev => [...prev, integration]);
      setNewIntegration({ name: '', description: '', category: 'accounting', features: [''] });
      setShowAddIntegrationModal(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const categoryExists = categories.some(cat => cat.value === newCategory.toLowerCase().replace(/\s+/g, '-'));
      if (!categoryExists) {
        categories.push({ name: newCategory, value: newCategory.toLowerCase().replace(/\s+/g, '-') });
        setNewCategory('');
        setShowAddCategoryModal(false);
      }
    }
  };

  const handleDeleteIntegration = (id: number) => {
    setIntegrations(prev => prev.filter(integration => integration.id !== id));
  };

  const handleAddFeature = () => {
    setNewIntegration(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleUpdateFeature = (index: number, value: string) => {
    setNewIntegration(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setNewIntegration(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Integrations</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Connect your CRM with accounting, payment, and business tools
          </p>
        </div>
        {hasPermission('canManageIntegrations') && (
          <div className="flex space-x-3">
            {hasPermission('canAddCategories') && (
              <button 
                onClick={() => setShowAddCategoryModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Category
              </button>
            )}
            <button 
              onClick={() => setShowAddIntegrationModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Integration
            </button>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedCategory === category.value
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration) => {
          const IconComponent = integration.icon;
          return (
            <div key={integration.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                    <IconComponent className="h-8 w-8 text-blue-600" />
              </div>
                  <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {integration.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {integration.description}
                </p>
                  </div>
              </div>
              <div className="flex-shrink-0">
                {integration.status === 'connected' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-500" />
                )}
              </div>
            </div>

              {/* Features List */}
            <div className="mt-4">
                <div className="flex flex-wrap gap-1">
                  {integration.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status and Actions */}
              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  integration.status === 'connected'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {integration.status}
                </span>
                <div className="flex space-x-2">
                  {integration.status === 'connected' ? (
                    <>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Disconnect
                      </button>
                      <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <ArrowPathIcon className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Connect
                    </button>
                  )}
                  {hasPermission('canDeleteIntegrations') && (
                    <button
                      onClick={() => handleDeleteIntegration(integration.id)}
                      className="text-sm text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

                {integration.lastSync && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Last sync: {integration.lastSync}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Integration Summary</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {integrations.filter(i => i.status === 'connected').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Connected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {integrations.filter(i => i.status === 'disconnected').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {integrations.filter(i => i.category === 'communication').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Communication Tools</div>
          </div>
        </div>
      </div>

      {/* Add Integration Modal */}
      {showAddIntegrationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Add New Integration</h3>
                <button
                  onClick={() => setShowAddIntegrationModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Integration Name
                  </label>
                  <input
                    type="text"
                    value={newIntegration.name}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Slack, Zoom, Google Drive"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newIntegration.description}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Describe what this integration does..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newIntegration.category}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {categories.filter(cat => cat.value !== 'all').map(category => (
                      <option key={category.value} value={category.value}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Features
                  </label>
                  {newIntegration.features.map((feature, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleUpdateFeature(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Feature name"
                      />
                      {newIntegration.features.length > 1 && (
                        <button
                          onClick={() => handleRemoveFeature(index)}
                          className="px-2 py-2 text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddFeature}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddIntegrationModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIntegration}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Add Integration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Add New Category</h3>
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Marketing, Productivity, Analytics"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
      </div>
      )}
    </div>
  );
};

export default Integrations;