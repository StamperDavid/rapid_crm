import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  SearchIcon,
  FilterIcon,
  XIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/outline';
import { Deal } from '../../../types/schema';
import { Service } from '../../../types/schema';
import Tooltip from '../../../components/Tooltip';

interface DealsProps {
  preSelectedCompanyId?: string;
  preSelectedCompanyName?: string;
}

const Deals: React.FC<DealsProps> = ({ preSelectedCompanyId, preSelectedCompanyName }) => {
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
      software: 'Website',
      serviceId: '1',
      serviceName: 'USDOT Number Registration',
      customPrice: 150000,
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
      software: 'Website',
      serviceId: '1',
      serviceName: 'USDOT Number Registration',
      customPrice: 150000,
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
      software: 'Website',
      serviceId: '1',
      serviceName: 'USDOT Number Registration',
      customPrice: 150000,
      contactId: '3',
      companyId: '3',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-22'
    }
  ]);

  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [newDeal, setNewDeal] = useState<Partial<Deal>>({
    title: '',
    description: '',
    value: 0,
    stage: 'Prospecting',
    probability: 10,
    software: 'Website',
    companyId: preSelectedCompanyId || '',
    contactId: preSelectedCompanyId || ''
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
    if (newDeal.title && newDeal.value && newDeal.companyId) {
      const deal: Deal = {
        id: (deals.length + 1).toString(),
        title: newDeal.title,
        description: newDeal.description || '',
        value: newDeal.value,
        stage: newDeal.stage || 'Prospecting',
        probability: newDeal.probability || 10,
        expectedCloseDate: newDeal.expectedCloseDate,
        actualCloseDate: newDeal.actualCloseDate,
        software: newDeal.software || 'Custom Onboarding',
        serviceId: newDeal.serviceId,
        serviceName: newDeal.serviceName,
        customPrice: newDeal.customPrice,
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
        software: 'Custom Onboarding'
      });
      setShowCreateModal(false);
    }
  };

  const handleUpdateDeal = () => {
    if (editingDeal && newDeal.title && newDeal.value && newDeal.companyId) {
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
        software: 'Custom Onboarding'
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
        serviceId: deal.serviceId,
        serviceName: deal.serviceName,
        productId: deal.productId,
        productName: deal.productName,
        customPrice: deal.customPrice,
        contactId: deal.contactId,
        companyId: deal.companyId
    });
    setShowCreateModal(true);
  };

  // Load services and companies on component mount
  useEffect(() => {
    // Mock services data - in real app, this would come from API
    const mockServices: Service[] = [
      {
        id: '1',
        name: 'USDOT Number Registration',
        description: 'Complete USDOT number registration for commercial vehicles',
        category: 'Registration',
        basePrice: 299,
        estimatedDuration: '1-2 business days',
        requirements: ['Legal business name', 'Fleet information'],
        deliverables: ['USDOT number assignment', 'Registration confirmation'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        name: 'Operating Authority (MC Number)',
        description: 'Motor Carrier number registration for for-hire carriers',
        category: 'Registration',
        basePrice: 399,
        estimatedDuration: '2-4 weeks',
        requirements: ['USDOT number', 'Insurance documentation'],
        deliverables: ['MC number assignment', 'Operating authority certificate'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '3',
        name: 'Biennial Updates (MCS-150)',
        description: 'Federal Motor Carrier Safety Administration required updates',
        category: 'Compliance',
        basePrice: 199,
        estimatedDuration: '1-3 business days',
        requirements: ['Current company information', 'Fleet updates'],
        deliverables: ['Updated MCS-150 filing', 'Confirmation receipt'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '4',
        name: 'Unified Carrier Registration (UCR)',
        description: 'Annual registration required for most interstate carriers and brokers',
        category: 'Registration',
        basePrice: 149,
        estimatedDuration: '1-2 business days',
        requirements: ['USDOT number', 'Fleet size information'],
        deliverables: ['UCR registration', 'State permits'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '5',
        name: 'ELD Compliance Package',
        description: 'Complete ELD setup and compliance management',
        category: 'Compliance',
        basePrice: 899,
        estimatedDuration: '2-4 weeks',
        requirements: ['Fleet information', 'Driver list', 'ELD provider selection'],
        deliverables: ['ELD installation', 'Compliance training', 'Ongoing support'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ];
    setServices(mockServices);

    // Mock products data - in real app, this would come from API
    const mockProducts = [
      {
        id: '1',
        name: 'ELD Hardware Package',
        description: 'Complete ELD device with installation',
        category: 'Hardware',
        basePrice: 1299,
        estimatedDuration: '1-2 weeks',
        requirements: ['Fleet size', 'Vehicle types', 'Installation preferences'],
        deliverables: ['ELD devices', 'Installation service', 'Training'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        name: 'Fleet Management Software',
        description: 'Complete fleet tracking and management platform',
        category: 'Software',
        basePrice: 499,
        estimatedDuration: '1 week',
        requirements: ['Fleet information', 'Integration needs'],
        deliverables: ['Software license', 'Setup and configuration', 'Training'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '3',
        name: 'Driver Safety Training Package',
        description: 'Comprehensive safety training for drivers',
        category: 'Training',
        basePrice: 299,
        estimatedDuration: '2-3 days',
        requirements: ['Driver list', 'Training schedule'],
        deliverables: ['Training materials', 'Certification', 'Records'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '4',
        name: 'Compliance Monitoring Dashboard',
        description: 'Real-time compliance tracking and reporting',
        category: 'Software',
        basePrice: 199,
        estimatedDuration: '3-5 days',
        requirements: ['ELD integration', 'Reporting preferences'],
        deliverables: ['Dashboard access', 'Setup', 'Training'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ];
    setProducts(mockProducts);

    // Mock companies data - in real app, this would come from API
    const mockCompanies = [
      {
        id: '1',
        name: 'Acme Transportation LLC',
        contact: 'John Smith',
        email: 'john@acmetransport.com',
        phone: '(555) 123-4567'
      },
      {
        id: '2',
        name: 'Global Shipping Inc',
        contact: 'Sarah Johnson',
        email: 'sarah@globalshipping.com',
        phone: '(555) 234-5678'
      },
      {
        id: '3',
        name: 'Metro Freight Services',
        contact: 'Mike Davis',
        email: 'mike@metrofreight.com',
        phone: '(555) 345-6789'
      },
      {
        id: '4',
        name: 'Fast Track Logistics',
        contact: 'Lisa Wilson',
        email: 'lisa@fasttracklogistics.com',
        phone: '(555) 456-7890'
      },
      {
        id: '5',
        name: 'Premier Carrier Co',
        contact: 'Robert Brown',
        email: 'robert@premiercarrier.com',
        phone: '(555) 567-8901'
      }
    ];
    setCompanies(mockCompanies);
  }, []);

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
          <Tooltip content="Create a new sales deal. This will open a form to capture deal details including company, services, value, and expected close date.">
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
          </Tooltip>
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
                <SearchIcon className="h-5 w-5 text-gray-400" />
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
              <FilterIcon className="h-4 w-4 mr-2" />
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
                    {deal.serviceName && (
                      <div className="flex items-center">
                        <CogIcon className="h-3 w-3 mr-1" />
                        Service: {deal.serviceName}
                      </div>
                    )}
                    {deal.productName && (
                      <div className="flex items-center">
                        <CogIcon className="h-3 w-3 mr-1" />
                        Product: {deal.productName}
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
                  <XIcon className="h-6 w-6" />
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
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                       Company/Client *
                     </label>
                     {preSelectedCompanyId ? (
                       <div className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100">
                         {preSelectedCompanyName || companies.find(c => c.id === preSelectedCompanyId)?.name || 'Selected Company'}
                       </div>
                     ) : (
                       <select
                         value={newDeal.companyId || ''}
                         onChange={(e) => {
                           const selectedCompany = companies.find(c => c.id === e.target.value);
                           setNewDeal(prev => ({
                             ...prev,
                             companyId: e.target.value,
                             contactId: selectedCompany?.id // For now, using company ID as contact ID
                           }));
                         }}
                         required
                         className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                       >
                         <option value="">Select a company...</option>
                         {companies.map(company => (
                           <option key={company.id} value={company.id}>
                             {company.name} - {company.contact}
                           </option>
                         ))}
                       </select>
                     )}
                   </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Service
                    </label>
                    <select
                      value={newDeal.serviceId || ''}
                      onChange={(e) => {
                        const selectedService = services.find(s => s.id === e.target.value);
                        setNewDeal(prev => ({
                          ...prev,
                          serviceId: e.target.value,
                          serviceName: selectedService?.name || '',
                          customPrice: selectedService?.basePrice || 0,
                          value: selectedService?.basePrice || prev.value,
                          productId: '', // Clear product when service is selected
                          productName: ''
                        }));
                      }}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a service...</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - ${service.basePrice}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Product
                    </label>
                    <select
                      value={newDeal.productId || ''}
                      onChange={(e) => {
                        const selectedProduct = products.find(p => p.id === e.target.value);
                        setNewDeal(prev => ({
                          ...prev,
                          productId: e.target.value,
                          productName: selectedProduct?.name || '',
                          customPrice: selectedProduct?.basePrice || 0,
                          value: selectedProduct?.basePrice || prev.value,
                          serviceId: '', // Clear service when product is selected
                          serviceName: ''
                        }));
                      }}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a product...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.basePrice}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lead Source
                  </label>
                  <select
                    value={newDeal.software || 'Website'}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, software: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Website">Website Contact Form</option>
                    <option value="Referral">Client Referral</option>
                    <option value="Cold Outreach">Cold Outreach/Cold Call</option>
                    <option value="Trade Show">Trade Show/Conference</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Direct Mail">Direct Mail</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Where did this lead come from?
                  </p>
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
