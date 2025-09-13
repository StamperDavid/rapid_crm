import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  SupportIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  PencilIcon
} from '@heroicons/react/outline';
import { Service } from '../../../types/schema';
import { useUser } from '../../../contexts/UserContext';

const Services: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission, hasRole } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Transportation Compliance Services Catalog
  const services: Service[] = [
    {
      id: '1',
      name: 'USDOT Number Registration',
      description: 'Complete USDOT number registration for commercial vehicles operating in interstate commerce or intrastate carriers hauling hazardous materials.',
      category: 'Registration',
      basePrice: 299,
      estimatedDuration: '1-2 business days',
      requirements: [
        'Legal business name and address',
        'Business type and EIN',
        'Fleet information',
        'Operation type details'
      ],
      deliverables: [
        'USDOT number assignment',
        'Registration confirmation',
        'Compliance documentation'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      name: 'Operating Authority (MC Number)',
      description: 'Motor Carrier number registration required for for-hire carriers transporting regulated commodities across state lines.',
      category: 'Registration',
      basePrice: 399,
      estimatedDuration: '2-4 weeks',
      requirements: [
        'USDOT number',
        'BOC-3 filing',
        'Insurance documentation',
        'Business authority details'
      ],
      deliverables: [
        'MC number assignment',
        'Operating authority certificate',
        'Compliance documentation'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '3',
      name: 'Biennial Updates (MCS-150)',
      description: 'Federal Motor Carrier Safety Administration required updates every two years via the MCS-150 form.',
      category: 'Compliance',
      basePrice: 199,
      estimatedDuration: '1-3 business days',
      requirements: [
        'Current company information',
        'Fleet updates',
        'Operation changes',
        'Contact information'
      ],
      deliverables: [
        'Updated MCS-150 filing',
        'Confirmation receipt',
        'Compliance certificate'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '4',
      name: 'Unified Carrier Registration (UCR)',
      description: 'Annual registration required for most interstate carriers and brokers.',
      category: 'Registration',
      basePrice: 149,
      estimatedDuration: '1-2 business days',
      requirements: [
        'USDOT number',
        'Fleet size information',
        'State operations list',
        'Payment information'
      ],
      deliverables: [
        'UCR registration',
        'State permits',
        'Compliance documentation'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '5',
      name: 'BOC-3 (Designation of Process Agents)',
      description: 'Form designating a process agent in each state where a carrier operates to receive legal documents.',
      category: 'Compliance',
      basePrice: 249,
      estimatedDuration: '1-2 business days',
      requirements: [
        'State operations list',
        'Business address information',
        'Contact details'
      ],
      deliverables: [
        'BOC-3 filing',
        'Process agent designation',
        'State coverage documentation'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '6',
      name: 'Driver Qualification Files (DQFs)',
      description: 'Help carriers establish and maintain driver qualification files, a legal requirement under federal law.',
      category: 'Compliance',
      basePrice: 199,
      estimatedDuration: '1-2 weeks',
      requirements: [
        'Driver information',
        'Employment history',
        'Medical certificates',
        'CDL information'
      ],
      deliverables: [
        'Complete DQF setup',
        'Compliance documentation',
        'Ongoing maintenance guidance'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '7',
      name: 'Drug and Alcohol Testing Program',
      description: 'Assist clients in enrolling in a compliant drug and alcohol testing consortium.',
      category: 'Compliance',
      basePrice: 299,
      estimatedDuration: '1-2 weeks',
      requirements: [
        'Company information',
        'Driver list',
        'Testing preferences',
        'Consortium selection'
      ],
      deliverables: [
        'Consortium enrollment',
        'Testing program setup',
        'Compliance documentation'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '8',
      name: 'IFTA and IRP Registration',
      description: 'International Fuel Tax Agreement and International Registration Plan for interstate motor carriers.',
      category: 'Registration',
      basePrice: 399,
      estimatedDuration: '2-4 weeks',
      requirements: [
        'Fleet information',
        'Route details',
        'Fuel purchase records',
        'State operations'
      ],
      deliverables: [
        'IFTA license',
        'IRP registration',
        'Fuel tax reporting setup'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '9',
      name: 'SCAC Code Registration',
      description: 'Standard Carrier Alpha Code - unique identifier required for working with ports, railways, and certain shippers.',
      category: 'Registration',
      basePrice: 149,
      estimatedDuration: '1-2 business days',
      requirements: [
        'Company information',
        'Business type',
        'Operation details'
      ],
      deliverables: [
        'SCAC code assignment',
        'Registration certificate',
        'Usage guidelines'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '10',
      name: 'Hazardous Materials Permits',
      description: 'Assist carriers in obtaining necessary permits and registrations for transporting hazardous materials.',
      category: 'Compliance',
      basePrice: 349,
      estimatedDuration: '2-6 weeks',
      requirements: [
        'Hazmat classification',
        'Transportation routes',
        'Driver certifications',
        'Security plans'
      ],
      deliverables: [
        'Hazmat permits',
        'Compliance documentation',
        'Training requirements'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '11',
      name: 'New Entrant Safety Audit Assistance',
      description: 'Help new carriers prepare for and successfully complete safety audits within 18 months of receiving USDOT number.',
      category: 'Support',
      basePrice: 599,
      estimatedDuration: '4-8 weeks',
      requirements: [
        'Current compliance status',
        'Fleet information',
        'Driver records',
        'Safety procedures'
      ],
      deliverables: [
        'Audit preparation',
        'Compliance review',
        'Corrective action plan',
        'Ongoing support'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '12',
      name: 'Supervisor Training',
      description: 'Provide training for supervisors on drug and alcohol regulations, required for employers with CDL drivers.',
      category: 'Training',
      basePrice: 199,
      estimatedDuration: '1 day',
      requirements: [
        'Supervisor information',
        'Company policies',
        'Training preferences'
      ],
      deliverables: [
        'Training completion',
        'Certification',
        'Compliance documentation'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory && service.isActive;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Registration':
        return DocumentTextIcon;
      case 'Compliance':
        return ShieldCheckIcon;
      case 'Training':
        return AcademicCapIcon;
      case 'Support':
        return SupportIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Registration':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'Compliance':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'Training':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
      case 'Support':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const handleCreateDeal = (service: Service) => {
    // Navigate to create deal with service pre-selected
    navigate(`/deals/new?serviceId=${service.id}&serviceName=${encodeURIComponent(service.name)}&price=${service.basePrice}`);
  };

  const handleEditService = (service: Service) => {
    // Navigate to edit service page
    navigate(`/services/edit/${service.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                Transportation Compliance Services
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Complete catalog of transportation compliance and registration services
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Service
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Services
                </label>
                <div className="relative">
                  <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by service name or description..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="Registration">Registration</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Training">Training</option>
                  <option value="Support">Support</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const IconComponent = getCategoryIcon(service.category);
            const categoryColor = getCategoryColor(service.category);
            
            return (
              <div key={service.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col h-full">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${categoryColor}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="ml-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
                          {service.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ${service.basePrice}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        {service.estimatedDuration}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {service.description}
                  </p>
                  
                  <div className="space-y-3 flex-1">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Requirements:
                      </h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {service.requirements.slice(0, 3).map((req, index) => (
                          <li key={index} className="flex items-start">
                            <ExclamationIcon className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                        {service.requirements.length > 3 && (
                          <li className="text-gray-500">+{service.requirements.length - 3} more...</li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Deliverables:
                      </h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {service.deliverables.slice(0, 2).map((del, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircleIcon className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0 text-green-500" />
                            {del}
                          </li>
                        ))}
                        {service.deliverables.length > 2 && (
                          <li className="text-gray-500">+{service.deliverables.length - 2} more...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 mt-auto">
                  <button
                    onClick={() => handleEditService(service)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Service
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No services found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* Create Service Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Create New Service
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter service name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter service description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                        <option value="Registration">Registration</option>
                        <option value="Compliance">Compliance</option>
                        <option value="Training">Training</option>
                        <option value="Support">Support</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Base Price ($)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="299"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="1-2 business days"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement service creation logic
                      setShowCreateModal(false);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
