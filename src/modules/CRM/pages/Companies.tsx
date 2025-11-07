import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OfficeBuildingIcon,
  PlusIcon,
  SearchIcon,
  UserGroupIcon,
  TruckIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/outline';
import { Organization, Person, Vehicle, Driver, Deal, Invoice } from '../../../types/schema';
import { useCRM } from '../../../contexts/CRMContext';
import ComprehensiveCompanyForm from '../../../components/forms/ComprehensiveCompanyForm';
import HelpIcon from '../../../components/HelpIcon';
import Tooltip from '../../../components/Tooltip';

const Companies: React.FC = () => {
  const { companies, contacts, vehicles, drivers, deals, invoices, createCompany, updateCompany, deleteCompany, createContact, createVehicle, createDriver, createDeal, createInvoice } = useCRM();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Organization | null>(null);


  // Filter companies based on search term and status
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.legalBusinessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.usdotNumber?.includes(searchTerm) ||
                         company.physicalCity?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && company.physicalState;
    if (filterStatus === 'inactive') return matchesSearch && !company.physicalState;
    
    return matchesSearch;
  });

  // Get related entities for a company
  const getCompanyContacts = (companyId: string) => {
    return contacts.filter(contact => contact.companyId === companyId);
  };

  const getCompanyVehicles = (companyId: string) => {
    return vehicles.filter(vehicle => vehicle.companyId === companyId);
  };

  const getCompanyDrivers = (companyId: string) => {
    return drivers.filter(driver => driver.companyId === companyId);
  };

  const getCompanyDeals = (companyId: string) => {
    return deals.filter(deal => deal.companyId === companyId);
  };

  const getCompanyInvoices = (companyId: string) => {
    return invoices?.filter(invoice => invoice.companyId === companyId) || [];
  };

  // Handle form submissions
  const handleCreateCompany = async (companyData: any) => {
    try {
      await createCompany(companyData);
      setShowCreateModal(false);
      alert('Company created successfully!');
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Error creating company. Please try again.');
    }
  };

  const handleEditCompany = (company: Organization) => {
    setEditingCompany(company);
    setShowCreateModal(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteCompany(companyId);
      alert('Company deleted successfully!');
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Error deleting company. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                Companies
                <HelpIcon 
                  content="Companies are your clients - transportation businesses that need DOT compliance services. Each company can have multiple contacts, vehicles, drivers, and deals."
                  size="md"
                  position="right"
                  className="ml-3"
                />
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your transportation companies and their related entities
              </p>
            </div>
            <div className="flex items-center gap-3">
              <HelpIcon 
                content="Create a new company record. You'll be able to add contacts, vehicles, drivers, and deals after creating the company."
                size="sm"
                position="left"
              />
              <Tooltip content="Create a new company record. This will open a comprehensive form to add all company details including business information, addresses, USDOT numbers, and compliance data.">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Company
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Tooltip content="Search companies by business name, USDOT number, or city. The search is case-insensitive and will filter results in real-time.">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </Tooltip>
          </div>
          <div className="flex gap-2">
            <Tooltip content="Filter companies by status. Active companies have complete address information, while inactive companies may be missing required data.">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Companies</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Tooltip>
          </div>
        </div>

        {/* Companies List */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCompanies.map((company) => {
              const companyContacts = getCompanyContacts(company.id);
              const companyVehicles = getCompanyVehicles(company.id);
              const companyDrivers = getCompanyDrivers(company.id);
              const companyDeals = getCompanyDeals(company.id);
              const companyInvoices = getCompanyInvoices(company.id);

              return (
                <li key={company.id}>
                  <div
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => navigate(`/companies/${company.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <OfficeBuildingIcon className="h-10 w-10 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {company.legalBusinessName}
                            </h3>
                            {company.dbaName && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                DBA: {company.dbaName}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <p className="mr-4">USDOT: {company.usdotNumber}</p>
                            <p className="mr-4">EIN: {company.ein}</p>
                            <p>{company.physicalCity}, {company.physicalState}</p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <p className="mr-4">Classification: {company.classification}</p>
                            <p className="mr-4">Operation: {company.operationType}</p>
                            <p>Fleet: {company.numberOfVehicles} vehicles, {company.numberOfDrivers} drivers</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Tooltip content={`${companyContacts.length} contacts associated with this company. Click to view contact details.`}>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {companyContacts.length}
                          </div>
                        </Tooltip>
                        <Tooltip content={`${companyVehicles.length} vehicles registered to this company. Includes trucks, trailers, and commercial equipment.`}>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <TruckIcon className="h-4 w-4 mr-1" />
                            {companyVehicles.length}
                          </div>
                        </Tooltip>
                        <Tooltip content={`${companyDrivers.length} drivers employed by this company. Track CDL status and compliance requirements.`}>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <IdentificationIcon className="h-4 w-4 mr-1" />
                            {companyDrivers.length}
                          </div>
                        </Tooltip>
                        <Tooltip content={`${companyDeals.length} active deals with this company. Track sales opportunities and revenue potential.`}>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            {companyDeals.length}
                          </div>
                        </Tooltip>
                        <div className="flex items-center space-x-2">
                          <Tooltip content="Edit company information. This will open the company form with all current data pre-filled for modification.">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCompany(company);
                              }}
                              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete this company permanently. This action cannot be undone and will remove all associated contacts, vehicles, and deals.">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCompany(company.id);
                              }}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        </div>
                        <div className="text-gray-400">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <OfficeBuildingIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No companies found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new company.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Company
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Company Modal */}
      {showCreateModal && (
        <ComprehensiveCompanyForm
          onSave={editingCompany ? async (data) => {
            await updateCompany(editingCompany.id, data);
            setShowCreateModal(false);
            setEditingCompany(null);
          } : handleCreateCompany}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingCompany(null);
          }}
          company={editingCompany}
        />
      )}
    </div>
  );
};

export default Companies;
