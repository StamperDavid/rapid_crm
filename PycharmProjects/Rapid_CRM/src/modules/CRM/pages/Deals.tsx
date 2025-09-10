import React, { useState } from 'react';
import {
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Deal } from '../../../types/schema';

const Deals: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Mock deal data using new Deal schema
  const [deals, setDeals] = useState<Deal[]>([
    {
      id: '1',
      title: 'Acme Transportation Contract',
      description: 'Website development and CRM implementation for transportation company',
      value: 150000,
      stage: 'Negotiation',
      probability: 75,
      expectedCloseDate: '2024-02-15',
      software: 'JotForm',
      contactId: '1',
      companyId: '1',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      title: 'Global Shipping Partnership',
      description: 'Mobile app development for fleet management',
      value: 250000,
      stage: 'Proposal',
      probability: 60,
      expectedCloseDate: '2024-03-01',
      software: 'JotForm',
      contactId: '2',
      companyId: '2',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    },
    {
      id: '3',
      title: 'Metro Freight Service Agreement',
      description: 'Complete digital transformation project',
      value: 85000,
      stage: 'Closed Won',
      probability: 100,
      expectedCloseDate: '2024-01-25',
      actualCloseDate: '2024-01-25',
      software: 'JotForm',
      contactId: '3',
      companyId: '3',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-22'
    }
  ]);

  const [newDeal, setNewDeal] = useState<Partial<Deal>>({
    title: '',
    description: '',
    value: 0,
    stage: 'Prospecting',
    probability: 10,
    software: 'JotForm'
  });

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (deal.description && deal.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'open' && deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost') ||
                         (filterStatus === 'won' && deal.stage === 'Closed Won') ||
                         (filterStatus === 'lost' && deal.stage === 'Closed Lost');
    
    return matchesSearch && matchesFilter;
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Prospecting': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
      case 'Proposal': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'Negotiation': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Closed Won': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'Closed Lost': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleCreateDeal = () => {
    if (newDeal.title && newDeal.value) {
      const deal: Deal = {
        id: (deals.length + 1).toString(),
        title: newDeal.title,
        description: newDeal.description || '',
        value: newDeal.value,
        stage: newDeal.stage || 'Prospecting',
        probability: newDeal.probability || 10,
        expectedCloseDate: newDeal.expectedCloseDate,
        actualCloseDate: newDeal.actualCloseDate,
        software: newDeal.software || 'JotForm',
        contactId: newDeal.contactId,
        companyId: newDeal.companyId,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setDeals([...deals, deal]);
      setNewDeal({
        title: '',
        description: '',
        value: 0,
        stage: 'Prospecting',
        probability: 10,
        software: 'JotForm'
      });
      setShowCreateModal(false);
    }
  };

  const handleUpdateDeal = () => {
    if (editingDeal && newDeal.title && newDeal.value) {
      const updatedDeal: Deal = {
        ...editingDeal,
        ...newDeal,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setDeals(deals.map(d => d.id === editingDeal.id ? updatedDeal : d));
      setEditingDeal(null);
      setNewDeal({
        title: '',
        description: '',
        value: 0,
        stage: 'Prospecting',
        probability: 10,
        software: 'JotForm'
      });
      setShowCreateModal(false);
    }
  };

  const handleDeleteDeal = (dealId: string) => {
    setDeals(deals.filter(deal => deal.id !== dealId));
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setNewDeal({
      title: deal.title,
      description: deal.description,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate,
      actualCloseDate: deal.actualCloseDate,
      software: deal.software,
      contactId: deal.contactId,
      companyId: deal.companyId
    });
    setShowCreateModal(true);
  };

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const openDeals = deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');
  const wonDeals = deals.filter(d => d.stage === 'Closed Won');
  const averageDealSize = deals.length > 0 ? totalValue / deals.length : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Deals</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage your sales pipeline and track deal progress
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setEditingDeal(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Deal
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Pipeline Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    ${totalValue.toLocaleString()}
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
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Open Deals
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {openDeals.length}
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
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Won Deals
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {wonDeals.length}
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
                <ChartBarIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Avg Deal Size
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    ${Math.round(averageDealSize).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              id="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Deals</option>
              <option value="open">Open Deals</option>
              <option value="won">Won Deals</option>
              <option value="lost">Lost Deals</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredDeals.map((deal) => (
            <li key={deal.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                          {deal.title}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(deal.stage)}`}>
                          {deal.stage}
                        </span>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ${deal.value.toLocaleString()} • {deal.probability}% probability
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedDeal(deal)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="View details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditDeal(deal)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="Edit deal"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDeal(deal.id)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Delete deal"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  {deal.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {deal.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    {deal.expectedCloseDate && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Expected: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                      </div>
                    )}
                    {deal.software && (
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-3 w-3 mr-1" />
                        Source: {deal.software}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Create/Edit Deal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {editingDeal ? 'Edit Deal' : 'Add New Deal'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingDeal(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Deal Title *
                  </label>
                  <input
                    type="text"
                    value={newDeal.title || ''}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter deal title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={newDeal.description || ''}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                    placeholder="Enter deal description"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Deal Value *
                    </label>
                    <input
                      type="number"
                      value={newDeal.value || 0}
                      onChange={(e) => setNewDeal(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                      required
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Probability (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newDeal.probability || 10}
                      onChange={(e) => setNewDeal(prev => ({ ...prev, probability: parseInt(e.target.value) || 10 }))}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Stage
                    </label>
                    <select
                      value={newDeal.stage || 'Prospecting'}
                      onChange={(e) => setNewDeal(prev => ({ ...prev, stage: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="Prospecting">Prospecting</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed Won">Closed Won</option>
                      <option value="Closed Lost">Closed Lost</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Expected Close Date
                    </label>
                    <input
                      type="date"
                      value={newDeal.expectedCloseDate || ''}
                      onChange={(e) => setNewDeal(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Source Software
                  </label>
                  <input
                    type="text"
                    value={newDeal.software || 'JotForm'}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, software: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., JotForm, Website, Referral"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingDeal(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={editingDeal ? handleUpdateDeal : handleCreateDeal}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingDeal ? 'Update Deal' : 'Add Deal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;