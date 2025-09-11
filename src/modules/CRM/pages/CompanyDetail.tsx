import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  TruckIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { useCRM } from '../../../contexts/CRMContext';

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companies, contacts, vehicles, drivers, deals, invoices, services } = useCRM();
  const [activeTab, setActiveTab] = useState('overview');

  const company = companies.find(c => c.id === id);

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Company not found</h1>
          <button
            onClick={() => navigate('/companies')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  // Get related entities for the company
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
    return invoices.filter(invoice => invoice.companyId === companyId);
  };

  const companyContacts = getCompanyContacts(company.id);
  const companyVehicles = getCompanyVehicles(company.id);
  const companyDrivers = getCompanyDrivers(company.id);
  const companyDeals = getCompanyDeals(company.id);
  const companyInvoices = getCompanyInvoices(company.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/companies')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Companies
          </button>
          
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {company.legalBusinessName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                USDOT: {company.usdotNumber} • {company.physicalCity}, {company.physicalState}
              </p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Contacts
                    </dt>
                    <dd className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {companyContacts.length}
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
                  <TruckIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Vehicles
                    </dt>
                    <dd className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {companyVehicles.length}
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
                  <IdentificationIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Drivers
                    </dt>
                    <dd className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {companyDrivers.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Information */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Business Information
                </h3>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Legal Business Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.legalBusinessName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">DBA Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.dbaName || 'None'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.businessType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">EIN</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.ein}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Classification</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.classification}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Operation Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.operationType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Interstate/Intrastate</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.interstateIntrastate}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Operation Class</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.operationClass}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Fleet Information */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Fleet Information
                </h3>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Number of Vehicles</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.numberOfVehicles}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Number of Drivers</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.numberOfDrivers}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Fleet Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.fleetType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">GVWR</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.gvwr}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle Types</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.vehicleTypes}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cargo Types</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.cargoTypes}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Hazmat Required</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.hazmatRequired}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">PHMSA Work</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.phmsaWork}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Address Information
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Physical Address</h4>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>{company.physicalStreetAddress}</p>
                      {company.physicalSuiteApt && <p>{company.physicalSuiteApt}</p>}
                      <p>{company.physicalCity}, {company.physicalState} {company.physicalZip}</p>
                      <p>{company.physicalCountry}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Mailing Address</h4>
                    {company.isMailingAddressSame === 'Yes' ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Same as physical address</p>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>{company.mailingStreetAddress}</p>
                        {company.mailingSuiteApt && <p>{company.mailingSuiteApt}</p>}
                        <p>{company.mailingCity}, {company.mailingState} {company.mailingZip}</p>
                        <p>{company.mailingCountry}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Recent Activity
                </h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recent activity to display.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
