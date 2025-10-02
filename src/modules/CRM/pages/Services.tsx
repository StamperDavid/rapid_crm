import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  DocumentIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  SupportIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/outline';
import { Service } from '../../../types/schema';
import { useUser } from '../../../contexts/UserContext';
import Tooltip from '../../../components/Tooltip';

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
      hasRenewal: true,
      renewalFrequency: 'Biennial',
      renewalPrice: 199,
      renewalDescription: 'Biennial MCS-150 update required every 2 years to maintain USDOT number',
      renewalRequirements: [
        'Updated company information',
        'Current fleet size and composition',
        'Operation type changes',
        'Contact information updates'
      ],
      renewalDeadline: '30 days before expiration',
      autoRenewal: true,
      renewalReminders: ['90 days', '60 days', '30 days', '7 days'],
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
      hasRenewal: true,
      renewalFrequency: 'Annual',
      renewalPrice: 299,
      renewalDescription: 'Annual operating authority renewal required to maintain MC number and for-hire authority',
      renewalRequirements: [
        'Current insurance documentation',
        'Updated BOC-3 if operations changed',
        'Business authority verification',
        'Compliance status confirmation'
      ],
      renewalDeadline: '30 days before expiration',
      autoRenewal: true,
      renewalReminders: ['90 days', '60 days', '30 days', '7 days'],
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
      hasRenewal: true,
      renewalFrequency: 'Biennial',
      renewalPrice: 199,
      renewalDescription: 'Biennial MCS-150 update required every 2 years to maintain USDOT number compliance',
      renewalRequirements: [
        'Updated company information',
        'Current fleet size and composition',
        'Operation type changes',
        'Contact information updates'
      ],
      renewalDeadline: '30 days before expiration',
      autoRenewal: true,
      renewalReminders: ['90 days', '60 days', '30 days', '7 days'],
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
      hasRenewal: true,
      renewalFrequency: 'Annual',
      renewalPrice: 149,
      renewalDescription: 'Annual UCR registration required for interstate carriers and brokers',
      renewalRequirements: [
        'Current USDOT number',
        'Updated fleet size information',
        'State operations list',
        'Payment information'
      ],
      renewalDeadline: '30 days before expiration',
      autoRenewal: true,
      renewalReminders: ['90 days', '60 days', '30 days', '7 days'],
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
      hasRenewal: true,
      renewalFrequency: 'As-needed',
      renewalPrice: 199,
      renewalDescription: 'BOC-3 updates required when adding new states or changing operations',
      renewalRequirements: [
        'Updated state operations list',
        'New state coverage requirements',
        'Business address changes'
      ],
      renewalDeadline: 'Before operating in new state',
      autoRenewal: false,
      renewalReminders: ['30 days before new operations'],
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
      hasRenewal: true,
      renewalFrequency: 'Annual',
      renewalPrice: 99,
      renewalDescription: 'Annual DQF review and update to maintain compliance',
      renewalRequirements: [
        'Updated driver information',
        'Current medical certificates',
        'Employment history updates',
        'CDL status verification'
      ],
      renewalDeadline: '30 days before expiration',
      autoRenewal: true,
      renewalReminders: ['90 days', '60 days', '30 days', '7 days'],
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
      hasRenewal: true,
      renewalFrequency: 'Annual',
      renewalPrice: 199,
      renewalDescription: 'Annual consortium membership renewal and program review',
      renewalRequirements: [
        'Updated driver list',
        'Testing program review',
        'Consortium membership renewal',
        'Compliance status verification'
      ],
      renewalDeadline: '30 days before expiration',
      autoRenewal: true,
      renewalReminders: ['90 days', '60 days', '30 days', '7 days'],
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
      hasRenewal: true,
      renewalFrequency: 'Annual',
      renewalPrice: 299,
      renewalDescription: 'Annual IFTA and IRP renewal required for interstate fuel tax compliance',
      renewalRequirements: [
        'Updated fleet information',
        'Fuel purchase records',
        'Route changes',
        'State operations updates'
      ],
      renewalDeadline: '30 days before expiration',
      autoRenewal: true,
      renewalReminders: ['90 days', '60 days', '30 days', '7 days'],
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
      hasRenewal: true,
      renewalFrequency: 'Annual',
      renewalPrice: 99,
      renewalDescription: 'Annual SCAC code renewal to maintain port and railway access',
      renewalRequirements: [
        'Updated company information',
        'Business type verification',
        'Operation details review'
      ],
      renewalDeadline: '30 days before expiration',
      autoRenewal: true,
      renewalReminders: ['90 days', '60 days', '30 days', '7 days'],
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
      hasRenewal: true,
      renewalFrequency: 'Annual',
      renewalPrice: 249,
      renewalDescription: 'Annual hazmat permit renewal and compliance review',
      renewalRequirements: [
        'Updated hazmat classification',
        'Current transportation routes',
        'Driver certification verification',
        'Security plan updates'
      ],
      renewalDeadline: '30 days before expiration',
      autoRenewal: true,
      renewalReminders: ['90 days', '60 days', '30 days', '7 days'],
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
      hasRenewal: false,
      renewalFrequency: 'One-time',
      renewalPrice: 0,
      renewalDescription: 'One-time service for new entrant safety audit preparation',
      renewalRequirements: [],
      renewalDeadline: 'N/A',
      autoRenewal: false,
      renewalReminders: [],
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
      hasRenewal: true,
      renewalFrequency: 'Annual',
      renewalPrice: 149,
      renewalDescription: 'Annual supervisor training renewal to maintain compliance',
      renewalRequirements: [
        'Updated supervisor information',
        'Company policy changes',
        'Training preference updates'
      ],
      renewalDeadline: '30 days before expiration',
      autoRenewal: true,
      renewalReminders: ['90 days', '60 days', '30 days', '7 days'],
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
        return DocumentIcon;
      case 'Compliance':
        return ShieldCheckIcon;
      case 'Training':
        return AcademicCapIcon;
      case 'Support':
        return SupportIcon;
      default:
        return DocumentIcon;
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

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }
    
    try {
      // TODO: Implement deleteService function
      alert('Delete functionality coming soon!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error deleting service. Please try again.');
    }
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
            <Tooltip content="Create a new service offering. This will open a form to define service details including pricing, renewal terms, and compliance requirements.">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Service
              </button>
            </Tooltip>
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
                <Tooltip content="Search services by name or description. Find specific compliance services, registration types, or training programs.">
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
                </Tooltip>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Category
                </label>
                <Tooltip content="Filter services by category. Registration services include USDOT, MC, and state permits. Compliance covers ongoing requirements like IFTA and ELD.">
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
                </Tooltip>
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
                      {service.hasRenewal && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          <CurrencyDollarIcon className="h-3 w-3 inline mr-1" />
                          Renewal: ${service.renewalPrice} {service.renewalFrequency.toLowerCase()}
                        </div>
                      )}
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
                    
                    {service.hasRenewal && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Renewal Information:
                        </h4>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <div className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1 text-blue-500" />
                            <span className="font-medium">Frequency:</span>
                            <span className="ml-1">{service.renewalFrequency}</span>
                          </div>
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-3 w-3 mr-1 text-green-500" />
                            <span className="font-medium">Renewal Price:</span>
                            <span className="ml-1">${service.renewalPrice}</span>
                          </div>
                          {service.autoRenewal && (
                            <div className="flex items-center">
                              <CheckCircleIcon className="h-3 w-3 mr-1 text-green-500" />
                              <span className="text-green-600 dark:text-green-400">Auto-renewal available</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 mt-auto">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditService(service)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                    onClick={async () => {
                      try {
                        const newService = {
                          name: newServiceData.name,
                          description: newServiceData.description,
                          category: newServiceData.category,
                          base_price: parseFloat(newServiceData.basePrice) || 0,
                          estimated_duration: newServiceData.estimatedDuration,
                          requirements: JSON.stringify(newServiceData.requirements || []),
                          deliverables: JSON.stringify(newServiceData.deliverables || []),
                          is_active: 1
                        };
                        await createService(newService);
                        setShowCreateModal(false);
                        setNewServiceData({ name: '', description: '', category: 'General', basePrice: '', estimatedDuration: '', requirements: [], deliverables: [] });
                        // Refresh services list
                        await refreshServices();
                      } catch (error) {
                        console.error('Failed to create service:', error);
                        alert('Failed to create service. Please try again.');
                      }
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
