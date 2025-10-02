import React, { useState, useEffect } from 'react';
import {
  UserAddIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  SearchIcon,
  FilterIcon,
  XIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
  OfficeBuildingIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/outline';
import { Lead } from '../../../types/schema';
import { useCRM } from '../../../contexts/CRMContext';
import LeadScoring from '../../../components/LeadScoring';
import Tooltip from '../../../components/Tooltip';

const Leads: React.FC = () => {
  const { leads, isLoading } = useCRM();
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Form state for creating/editing leads
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    leadSource: 'Website' as Lead['leadSource'],
    businessType: '' as Lead['businessType'],
    fleetSize: 0,
    operatingStates: [] as string[],
    cargoTypes: [] as string[],
    hasUSDOT: false,
    usdotNumber: '',
    budget: 0,
    timeline: '',
    decisionMaker: false,
    painPoints: [] as string[],
    interests: [] as string[],
    preferredContactMethod: 'Phone' as Lead['preferredContactMethod'],
    notes: ''
  });

  useEffect(() => {
    filterLeads();
    calculateStats();
  }, [leads, searchTerm, filterStatus, filterSource]);

  const calculateStats = () => {
    if (leads.length > 0) {
      const total = leads.length;
      const byStatus = leads.reduce((acc, lead) => {
        acc[lead.leadStatus] = (acc[lead.leadStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const averageScore = leads.reduce((sum, lead) => sum + (lead.leadScore || 0), 0) / total;
      const conversionRate = ((byStatus['Converted'] || 0) / total) * 100;
      
      setStats({
        total,
        byStatus,
        averageScore,
        conversionRate
      });
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(lead => lead.leadStatus === filterStatus);
    }

    if (filterSource !== 'all') {
      filtered = filtered.filter(lead => lead.leadSource === filterSource);
    }

    setFilteredLeads(filtered);
  };

  const handleCreateLead = async () => {
    try {
      await leadService.createLead(formData);
      setShowCreateModal(false);
      resetForm();
      await loadLeads();
      await loadStats();
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleUpdateLead = async () => {
    if (!editingLead) return;

    try {
      await leadService.updateLead(editingLead.id, formData);
      setEditingLead(null);
      resetForm();
      await loadLeads();
      await loadStats();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadService.deleteLead(id);
        await loadLeads();
        await loadStats();
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const handleConvertToContact = async (lead: Lead) => {
    try {
      await leadService.convertToContact(lead.id);
      await loadLeads();
      await loadStats();
    } catch (error) {
      console.error('Error converting lead to contact:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      leadSource: 'Website',
      businessType: '',
      fleetSize: '',
      operatingStates: [],
      cargoTypes: [],
      hasUSDOT: false,
      usdotNumber: '',
      budget: 'Unknown',
      timeline: 'Unknown',
      decisionMaker: false,
      painPoints: [],
      interests: [],
      preferredContactMethod: 'Phone',
      notes: ''
    });
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company || '',
      jobTitle: lead.jobTitle || '',
      leadSource: lead.leadSource,
      businessType: lead.businessType || '',
      fleetSize: lead.fleetSize || '',
      operatingStates: lead.operatingStates || [],
      cargoTypes: lead.cargoTypes || [],
      hasUSDOT: lead.hasUSDOT || false,
      usdotNumber: lead.usdotNumber || '',
      budget: lead.budget || 'Unknown',
      timeline: lead.timeline || 'Unknown',
      decisionMaker: lead.decisionMaker || false,
      painPoints: lead.painPoints || [],
      interests: lead.interests || [],
      preferredContactMethod: lead.preferredContactMethod,
      notes: lead.notes || ''
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Qualified': 'bg-green-100 text-green-800',
      'Unqualified': 'bg-red-100 text-red-800',
      'Converted': 'bg-purple-100 text-purple-800',
      'Lost': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
            Leads Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and track your sales leads with intelligent scoring and conversion tracking.
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Tooltip content="Create a new lead record. This will open a form to capture potential client information including contact details, business type, and fleet information.">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Lead
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Leads
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {stats.total}
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
                      Conversion Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {stats.conversionRate.toFixed(1)}%
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
                      Avg Score
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {stats.averageScore.toFixed(0)}
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
                  <UserAddIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      New This Month
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {stats.byStatus['New'] || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <Tooltip content="Search leads by name, email, or company. The search is case-insensitive and will filter results in real-time.">
              <div className="relative">
                <SearchIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Search leads..."
                />
              </div>
            </Tooltip>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Tooltip content="Filter leads by their current status in the sales pipeline. Track progression from initial contact to closed deals.">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Unqualified">Unqualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </Tooltip>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Source
            </label>
            <Tooltip content="Filter leads by their source. Track which marketing channels and activities are generating the most qualified leads.">
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Sources</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Trade Show">Trade Show</option>
                <option value="Social Media">Social Media</option>
                <option value="Email Campaign">Email Campaign</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Other">Other</option>
              </select>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredLeads.map((lead, index) => (
            <li key={lead.id || `lead-${index}`}>
              <div className="px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.leadStatus)}`}>
                          {lead.leadStatus}
                        </span>
                        <div className="ml-2">
                          <LeadScoring lead={lead} showDetails={false} />
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MailIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <span className="truncate">{lead.email}</span>
                        <PhoneIcon className="ml-4 flex-shrink-0 mr-1.5 h-4 w-4" />
                        <span className="truncate">{lead.phone}</span>
                        {lead.company && (
                          <>
                            <OfficeBuildingIcon className="ml-4 flex-shrink-0 mr-1.5 h-4 w-4" />
                            <span className="truncate">{lead.company}</span>
                          </>
                        )}
                      </div>

                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="truncate">Source: {lead.leadSource}</span>
                        {lead.businessType && (
                          <>
                            <span className="ml-4 truncate">Type: {lead.businessType}</span>
                          </>
                        )}
                        {lead.budget && lead.budget !== 'Unknown' && (
                          <>
                            <span className="ml-4 truncate">Budget: {lead.budget}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {lead.leadStatus !== 'Converted' && lead.leadStatus !== 'Lost' && (
                      <button
                        onClick={() => handleConvertToContact(lead)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Convert
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => openEditModal(lead)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-600 text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <UserAddIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new lead.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Lead
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingLead) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {editingLead ? 'Edit Lead' : 'Create New Lead'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingLead(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lead Source *
                  </label>
                  <select
                    value={formData.leadSource}
                    onChange={(e) => setFormData({ ...formData, leadSource: e.target.value as Lead['leadSource'] })}
                    className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Trade Show">Trade Show</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Facebook Ads">Facebook Ads</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Type
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value as Lead['businessType'] })}
                    className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select Business Type</option>
                    <option value="Carrier">Carrier</option>
                    <option value="Broker">Broker</option>
                    <option value="Freight Forwarder">Freight Forwarder</option>
                    <option value="Shipper">Shipper</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value as Lead['budget'] })}
                    className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="Under $10K">Under $10K</option>
                    <option value="$10K-$50K">$10K-$50K</option>
                    <option value="$50K-$100K">$50K-$100K</option>
                    <option value="$100K-$500K">$100K-$500K</option>
                    <option value="Over $500K">Over $500K</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Timeline
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value as Lead['timeline'] })}
                    className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="Immediate">Immediate</option>
                    <option value="1-3 Months">1-3 Months</option>
                    <option value="3-6 Months">3-6 Months</option>
                    <option value="6-12 Months">6-12 Months</option>
                    <option value="Over 1 Year">Over 1 Year</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingLead(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={editingLead ? handleUpdateLead : handleCreateLead}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingLead ? 'Update Lead' : 'Create Lead'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Lead Details
                </h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Lead Scoring Analysis */}
              <div className="mb-6">
                <LeadScoring lead={selectedLead} showDetails={true} />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedLead.firstName} {selectedLead.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedLead.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedLead.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Company
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedLead.company || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Lead Source
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedLead.leadSource}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Lead Score
                    </label>
                    <p className={`mt-1 text-sm font-medium ${getScoreColor(selectedLead.leadScore)}`}>
                      {selectedLead.leadScore}/100
                    </p>
                  </div>
                </div>

                {selectedLead.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notes
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedLead.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
