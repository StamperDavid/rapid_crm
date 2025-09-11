import React, { useState } from 'react';
import {
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  TruckIcon,
  IdentificationIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { Organization, Person, Vehicle, Driver, Deal, Invoice } from '../../../types/schema';
import { useCRM } from '../../../contexts/CRMContext';
import EntityForm from '../../../components/forms/EntityForm';

const Companies: React.FC = () => {
  const { companies, contacts, vehicles, drivers, deals, invoices, createCompany, createContact, createVehicle, createDriver, createDeal, createInvoice } = useCRM();
  
  // Debug logging
  console.log('[Companies] Received companies data:', companies);
  console.log('[Companies] Companies count:', companies.length);
  if (companies.length > 0) {
    console.log('[Companies] First company structure:', companies[0]);
  }
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Organization | null>(null);

  // Modal states for adding related entities
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);

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

  const handleCreateContact = async (contactData: any) => {
    try {
      await createContact(contactData);
      setShowAddContactModal(false);
      alert('Contact created successfully!');
    } catch (error) {
      console.error('Error creating contact:', error);
      alert('Error creating contact. Please try again.');
    }
  };

  const handleCreateVehicle = async (vehicleData: any) => {
    try {
      await createVehicle(vehicleData);
      setShowAddVehicleModal(false);
      alert('Vehicle created successfully!');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert('Error creating vehicle. Please try again.');
    }
  };

  const handleCreateDriver = async (driverData: any) => {
    try {
      await createDriver(driverData);
      setShowAddDriverModal(false);
      alert('Driver created successfully!');
    } catch (error) {
      console.error('Error creating driver:', error);
      alert('Error creating driver. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Companies
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your transportation companies and their related entities
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Company
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Companies</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => {
            const companyContacts = getCompanyContacts(company.id);
            const companyVehicles = getCompanyVehicles(company.id);
            const companyDrivers = getCompanyDrivers(company.id);
            const companyDeals = getCompanyDeals(company.id);
            const companyInvoices = getCompanyInvoices(company.id);

            return (
              <div
                key={company.id}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCompany(company)}
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {company.legalBusinessName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        USDOT: {company.usdotNumber}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {company.physicalCity}, {company.physicalState}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      {companyContacts.length} contacts
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <TruckIcon className="h-4 w-4 mr-1" />
                      {companyVehicles.length} vehicles
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <IdentificationIcon className="h-4 w-4 mr-1" />
                      {companyDrivers.length} drivers
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      {companyDeals.length} deals
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
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

      {/* Create Company Modal */}
      {showCreateModal && (
        <EntityForm
          entityType="companies"
          onSave={handleCreateCompany}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Create Contact Modal */}
      {showAddContactModal && selectedCompany && (
        <EntityForm
          entityType="contacts"
          initialData={{ companyId: selectedCompany.id }}
          onSave={handleCreateContact}
          onCancel={() => setShowAddContactModal(false)}
        />
      )}

      {/* Create Vehicle Modal */}
      {showAddVehicleModal && selectedCompany && (
        <EntityForm
          entityType="vehicles"
          initialData={{ companyId: selectedCompany.id }}
          onSave={handleCreateVehicle}
          onCancel={() => setShowAddVehicleModal(false)}
        />
      )}

      {/* Create Driver Modal */}
      {showAddDriverModal && selectedCompany && (
        <EntityForm
          entityType="drivers"
          initialData={{ companyId: selectedCompany.id }}
          onSave={handleCreateDriver}
          onCancel={() => setShowAddDriverModal(false)}
        />
      )}
    </div>
  );
};

export default Companies;
