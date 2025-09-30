import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  OfficeBuildingIcon,
  UserGroupIcon,
  TruckIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentIcon,
  CurrencyDollarIcon,
  ClipboardCheckIcon,
  LockClosedIcon
} from '@heroicons/react/outline';
import { useCRM } from '../../../contexts/CRMContext';
import { USDOTApplicationService } from '../../../services/usdot/USDOTApplicationService';
import HelpIcon from '../../../components/HelpIcon';
// import USDOTApplicationViewer from '../../../components/USDOTApplicationViewer';
// import { USDOTApplication } from '../../../types/schema';

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companies, contacts, vehicles, drivers, deals, invoices, services } = useCRM();
  const [activeTab, setActiveTab] = useState('overview');
  const [usdotApplications, setUsdotApplications] = useState<any[]>([]);
  const [loadingUsdot, setLoadingUsdot] = useState(false);
  const [selectedUsdotApplication, setSelectedUsdotApplication] = useState<any | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);

  const company = companies.find(c => c.id === id);

  // Load USDOT applications for this company
  useEffect(() => {
    if (id) {
      setLoadingUsdot(true);
      USDOTApplicationService.getApplicationsByCompanyId(id)
        .then(setUsdotApplications)
        .catch(error => {
          console.error('Error loading USDOT applications:', error);
          setUsdotApplications([]);
        })
        .finally(() => setLoadingUsdot(false));
    }
  }, [id]);

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
    return contacts && Array.isArray(contacts) ? contacts.filter(contact => contact.companyId === companyId) : [];
  };

  const getCompanyVehicles = (companyId: string) => {
    return vehicles && Array.isArray(vehicles) ? vehicles.filter(vehicle => vehicle.companyId === companyId) : [];
  };

  const getCompanyDrivers = (companyId: string) => {
    return drivers && Array.isArray(drivers) ? drivers.filter(driver => driver.companyId === companyId) : [];
  };

  const getCompanyDeals = (companyId: string) => {
    return deals && Array.isArray(deals) ? deals.filter(deal => deal.companyId === companyId) : [];
  };

  const getCompanyInvoices = (companyId: string) => {
    return invoices && Array.isArray(invoices) ? invoices.filter(invoice => invoice.companyId === companyId) : [];
  };

  const getCompanyServices = (companyId: string) => {
    return services && Array.isArray(services) ? services.filter(service => service.companyId === companyId) : [];
  };

  const companyContacts = getCompanyContacts(company.id);
  const companyVehicles = getCompanyVehicles(company.id);
  const companyDrivers = getCompanyDrivers(company.id);
  const companyDeals = getCompanyDeals(company.id);
  const companyInvoices = getCompanyInvoices(company.id);
  const companyServices = getCompanyServices(company.id);

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
            <OfficeBuildingIcon className="h-12 w-12 text-blue-600 mr-4" />
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

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'deals', name: 'Deals', icon: '💰' },
                { id: 'services', name: 'Active Services', icon: '⚙️' },
                { id: 'invoices', name: 'Invoices', icon: '📄' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
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
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.ein || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Started</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.businessStarted || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Classification</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.classification || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Operation Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.operationType || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Interstate/Intrastate</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.interstateIntrastate || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">USDOT Number</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.usdotNumber || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Operation Class</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.operationClass || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Fleet Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.fleetType || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle Types</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.vehicleTypes || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cargo Types</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.cargoTypes || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Hazmat Required</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.hazmatRequired || 'No'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">PHMSA Work</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.phmsaWork || 'No'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">DUNS Number</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.dunsBradstreetNumber || 'Not provided'}</dd>
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
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Physical Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {company.physicalStreetAddress && (
                          <>
                            {company.physicalStreetAddress}
                            {company.physicalSuiteApt && `, ${company.physicalSuiteApt}`}
                            <br />
                            {company.physicalCity}, {company.physicalState} {company.physicalZip}
                            <br />
                            {company.physicalCountry}
                          </>
                        )}
                      </dd>
                  </div>
                  <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mailing Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {company.isMailingAddressSame === 'Yes' ? (
                          <span className="text-gray-500">Same as physical address</span>
                        ) : (
                          company.mailingStreetAddress && (
                            <>
                              {company.mailingStreetAddress}
                              {company.mailingSuiteApt && `, ${company.mailingSuiteApt}`}
                              <br />
                              {company.mailingCity}, {company.mailingState} {company.mailingZip}
                              <br />
                              {company.mailingCountry}
                            </>
                          )
                        )}
                      </dd>
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
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.numberOfVehicles || 0}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Number of Drivers</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.numberOfDrivers || 0}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Fleet Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.fleetType || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle Types</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.vehicleTypes || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">GVWR</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.gvwr || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cargo Types</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.cargoTypes || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Hazmat Required</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.hazmatRequired || 'No'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">PHMSA Work</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{company.phmsaWork || 'No'}</dd>
                  </div>
                </dl>
              </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Contacts List */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Contacts</h3>
                  <button
                    onClick={() => setShowAddContactModal(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Add Contact
                  </button>
                </div>
                <div className="px-6 py-4">
                  {companyContacts.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No contacts assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {companyContacts.slice(0, 3).map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {contact.firstName} {contact.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{contact.phone}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{contact.email}</p>
                          </div>
                          <button
                            onClick={() => setActiveTab('contacts')}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View All
                          </button>
                        </div>
                      ))}
                      {companyContacts.length > 3 && (
                        <button
                          onClick={() => setActiveTab('contacts')}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          +{companyContacts.length - 3} more contacts
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Services List */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Active Services</h3>
                </div>
                <div className="px-6 py-4">
                  {companyServices.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No services enrolled</p>
                  ) : (
                    <div className="space-y-3">
                      {companyServices.slice(0, 3).map((service) => (
                        <div key={service.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {service.name}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                service.status === 'Active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : service.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {service.status}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('services')}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View All
                          </button>
                        </div>
                      ))}
                      {companyServices.length > 3 && (
                        <button
                          onClick={() => setActiveTab('services')}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          +{companyServices.length - 3} more services
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Drivers List */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Drivers</h3>
                  <button
                    onClick={() => setShowAddDriverModal(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Add Driver
                  </button>
                </div>
                <div className="px-6 py-4">
                  {companyDrivers.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No drivers assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {companyDrivers.slice(0, 3).map((driver) => (
                        <div key={driver.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {driver.firstName} {driver.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{driver.licenseNumber}</p>
                          </div>
                          <button
                            onClick={() => setActiveTab('drivers')}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View All
                          </button>
                        </div>
                      ))}
                      {companyDrivers.length > 3 && (
                        <button
                          onClick={() => setActiveTab('drivers')}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          +{companyDrivers.length - 3} more drivers
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicles List */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Vehicles</h3>
                  <button
                    onClick={() => setShowAddVehicleModal(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Add Vehicle
                  </button>
                </div>
                <div className="px-6 py-4">
                  {companyVehicles.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No vehicles assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {companyVehicles.slice(0, 3).map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.licensePlate}</p>
                          </div>
                          <button
                            onClick={() => setActiveTab('vehicles')}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View All
                          </button>
                        </div>
                      ))}
                      {companyVehicles.length > 3 && (
                        <button
                          onClick={() => setActiveTab('vehicles')}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          +{companyVehicles.length - 3} more vehicles
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* USDOT Application Record */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      USDOT Application Record
                </h3>
                    <LockClosedIcon className="h-4 w-4 text-gray-400" title="Read-only record" />
                  </div>
              </div>
              <div className="px-6 py-4">
                  {loadingUsdot ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading application record...</p>
                  ) : usdotApplications.length > 0 ? (
                    <div className="space-y-3">
                      {usdotApplications.slice(0, 1).map((application) => (
                        <div key={application.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                  <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                MCS-150 Application
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                USDOT: {application.usdotNumber || 'Not assigned'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Created: {new Date(application.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedUsdotApplication(application)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Record
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No USDOT application record found.</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Record should be created during company setup.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Active Services</h3>
              <button
                onClick={() => {/* TODO: Add service modal */}}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Enroll in Service
              </button>
            </div>
            <div className="px-6 py-4">
              {companyServices && companyServices.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {companyServices.map((service) => (
                    <div key={service.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {service.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
                          <div className="flex items-center mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              service.status === 'Active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : service.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {service.status}
                            </span>
                          </div>
                          {service.startDate && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Started: {new Date(service.startDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No active services</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by enrolling in a service.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Deals</h3>
              <button
                onClick={() => {/* TODO: Add deal modal */}}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Deal
              </button>
            </div>
            <div className="px-6 py-4">
              {companyDeals.length === 0 ? (
                <div className="text-center py-8">
                  <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No deals</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new deal.</p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center">
                            Deal
                            <HelpIcon 
                              content="The name or description of the sales opportunity or deal with this company."
                              size="sm"
                              position="top"
                              className="ml-1"
                            />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center">
                            Value
                            <HelpIcon 
                              content="The monetary value or potential revenue from this deal."
                              size="sm"
                              position="top"
                              className="ml-1"
                            />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center">
                            Status
                            <HelpIcon 
                              content="Current status of the deal (Active, Won, Lost, On Hold, etc.)."
                              size="sm"
                              position="top"
                              className="ml-1"
                            />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center">
                            Stage
                            <HelpIcon 
                              content="Current stage in the sales process (Prospecting, Qualification, Proposal, Negotiation, Closed)."
                              size="sm"
                              position="top"
                              className="ml-1"
                            />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center">
                            Actions
                            <HelpIcon 
                              content="Available actions for this deal (View, Edit, Delete, etc.)."
                              size="sm"
                              position="top"
                              className="ml-1"
                            />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {companyDeals.map((deal) => (
                        <tr 
                          key={deal.id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => {
                            setSelectedDeal(deal);
                            setShowDealModal(true);
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {deal.title}
                              </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                {deal.description || 'No description'}
                    </div>
                  </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              ${deal.value?.toLocaleString() || '0'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              deal.status === 'Won' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : deal.status === 'Lost'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : deal.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {deal.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {deal.stage || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className="text-gray-400 text-xs">Click to view</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Invoices</h3>
              <button
                onClick={() => {/* TODO: Add invoice modal */}}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Invoice
              </button>
            </div>
            <div className="px-6 py-4">
              {companyInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No invoices</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new invoice.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {companyInvoices.map((invoice) => (
                    <div key={invoice.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                  <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Invoice #{invoice.invoiceNumber}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">${invoice.amount}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.status}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* USDOT Application Record Modal */}
        {selectedUsdotApplication && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    USDOT Application Record - MCS-150
                  </h3>
                  <button
                    onClick={() => setSelectedUsdotApplication(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Company Information</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Legal Business Name</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100">{selectedUsdotApplication.legalBusinessName}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">DBA Name</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100">{selectedUsdotApplication.dbaName || 'None'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Business Type</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100">{selectedUsdotApplication.businessType}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">EIN</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100">{selectedUsdotApplication.ein}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Transportation Details</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Operation Type</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100">{selectedUsdotApplication.operationType}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Interstate/Intrastate</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100">{selectedUsdotApplication.interstateIntrastate}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Number of Vehicles</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100">{selectedUsdotApplication.numberOfVehicles}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Number of Drivers</dt>
                          <dd className="text-sm text-gray-900 dark:text-gray-100">{selectedUsdotApplication.numberOfDrivers}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Address Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Physical Address</dt>
                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedUsdotApplication.physicalStreetAddress && (
                            <>
                              {selectedUsdotApplication.physicalStreetAddress}
                              {selectedUsdotApplication.physicalSuiteApt && `, ${selectedUsdotApplication.physicalSuiteApt}`}
                              <br />
                              {selectedUsdotApplication.physicalCity}, {selectedUsdotApplication.physicalState} {selectedUsdotApplication.physicalZip}
                              <br />
                              {selectedUsdotApplication.physicalCountry}
                            </>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Mailing Address</dt>
                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedUsdotApplication.isMailingAddressSame === 'Yes' ? (
                            <span className="text-gray-500">Same as physical address</span>
                          ) : (
                            selectedUsdotApplication.mailingStreetAddress && (
                              <>
                                {selectedUsdotApplication.mailingStreetAddress}
                                {selectedUsdotApplication.mailingSuiteApt && `, ${selectedUsdotApplication.mailingSuiteApt}`}
                                <br />
                                {selectedUsdotApplication.mailingCity}, {selectedUsdotApplication.mailingState} {selectedUsdotApplication.mailingZip}
                                <br />
                                {selectedUsdotApplication.mailingCountry}
                              </>
                            )
                          )}
                        </dd>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <LockClosedIcon className="h-4 w-4 mr-2" />
                      Read-only record for audit purposes
                    </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                      Created: {new Date(selectedUsdotApplication.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
            </div>
                      </div>
                    )}

        {/* Add Contact Modal */}
        {showAddContactModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Add New Contact
                  </h3>
                  <button
                    onClick={() => setShowAddContactModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter first name"
                      />
                </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter last name"
                      />
              </div>
            </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter email address"
                    />
          </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title/Position
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter job title"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddContactModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const newContact = {
                          company_id: company.id,
                          first_name: newContactData.firstName,
                          last_name: newContactData.lastName,
                          email: newContactData.email,
                          phone: newContactData.phone,
                          job_title: newContactData.jobTitle,
                          is_primary_contact: 0,
                          preferred_contact_method: 'Phone'
                        };
                        await createContact(newContact);
                        setShowAddContactModal(false);
                        setNewContactData({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '' });
                        // Refresh contacts list
                        const updatedContacts = await fetch(`${getApiBaseUrl()}/contacts?companyId=${company.id}`).then(res => res.json());
                        setContacts(updatedContacts);
                      } catch (error) {
                        console.error('Failed to create contact:', error);
                        alert('Failed to create contact. Please try again.');
                      }
                    }}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Add Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Driver Modal */}
        {showAddDriverModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Add New Driver
                </h3>
                  <button
                    onClick={() => setShowAddDriverModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
              </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter CDL license number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      License Class
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                      <option value="">Select license class</option>
                      <option value="Class A">Class A</option>
                      <option value="Class B">Class B</option>
                      <option value="Class C">Class C</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddDriverModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const newDriver = {
                          company_id: company.id,
                          full_name: newDriverData.firstName + ' ' + newDriverData.lastName,
                          address: company.physicalStreetAddress + ', ' + company.physicalCity + ', ' + company.physicalState + ' ' + company.physicalZip,
                          phone: newDriverData.phone,
                          email: newDriverData.email || '',
                          date_of_birth: '',
                          social_security_number: '',
                          employment_history: 'New driver - employment history to be completed',
                          driving_experience: newDriverData.licenseClass || '',
                          employment_status: 'Active',
                          position: 'Driver'
                        };
                        await createDriver(newDriver);
                        setShowAddDriverModal(false);
                        setNewDriverData({ firstName: '', lastName: '', email: '', phone: '', licenseClass: '' });
                        // Refresh drivers list
                        const updatedDrivers = await fetch(`${getApiBaseUrl()}/drivers?companyId=${company.id}`).then(res => res.json());
                        setDrivers(updatedDrivers);
                      } catch (error) {
                        console.error('Failed to create driver:', error);
                        alert('Failed to create driver. Please try again.');
                      }
                    }}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Driver
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Vehicle Modal */}
        {showAddVehicleModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Add New Vehicle
                  </h3>
                  <button
                    onClick={() => setShowAddVehicleModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Make
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter vehicle make"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Model
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter vehicle model"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Year
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        License Plate
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter license plate"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      VIN
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter VIN number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vehicle Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                      <option value="">Select vehicle type</option>
                      <option value="Truck">Truck</option>
                      <option value="Trailer">Trailer</option>
                      <option value="Van">Van</option>
                      <option value="Bus">Bus</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddVehicleModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const newVehicle = {
                          company_id: company.id,
                          vin: newVehicleData.vin || '',
                          license_plate: newVehicleData.licensePlate || '',
                          make: newVehicleData.make || '',
                          model: newVehicleData.model || '',
                          year: newVehicleData.year || new Date().getFullYear(),
                          color: newVehicleData.color || '',
                          vehicle_type: newVehicleData.vehicleType || 'Truck',
                          gvwr: newVehicleData.gvwr || '',
                          fuel_type: 'Diesel',
                          status: 'Active',
                          has_hazmat_endorsement: 'No'
                        };
                        await createVehicle(newVehicle);
                        setShowAddVehicleModal(false);
                        setNewVehicleData({ make: '', model: '', year: '', licensePlate: '', vin: '', vehicleType: '', color: '', gvwr: '' });
                        // Refresh vehicles list
                        const updatedVehicles = await fetch(`${getApiBaseUrl()}/vehicles?companyId=${company.id}`).then(res => res.json());
                        setVehicles(updatedVehicles);
                      } catch (error) {
                        console.error('Failed to create vehicle:', error);
                        alert('Failed to create vehicle. Please try again.');
                      }
                    }}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Add Vehicle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deal View Modal */}
        {showDealModal && selectedDeal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Deal Details
                  </h3>
                  <button
                    onClick={() => {
                      setShowDealModal(false);
                      setSelectedDeal(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Deal Header */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {selectedDeal.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedDeal.description || 'No description provided'}
                </p>
              </div>

                  {/* Deal Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Deal Value
                        </label>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          ${selectedDeal.value?.toLocaleString() || '0'}
                        </p>
            </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedDeal.status === 'Won' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : selectedDeal.status === 'Lost'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : selectedDeal.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {selectedDeal.status}
                        </span>
          </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Stage
                        </label>
                        <p className="text-gray-900 dark:text-gray-100">
                          {selectedDeal.stage || 'Unknown'}
                        </p>
        </div>

                      {selectedDeal.probability && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Probability
                          </label>
                          <p className="text-gray-900 dark:text-gray-100">
                            {selectedDeal.probability}%
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {selectedDeal.serviceName && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Service
                          </label>
                          <p className="text-gray-900 dark:text-gray-100">
                            {selectedDeal.serviceName}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Created
                        </label>
                        <p className="text-gray-900 dark:text-gray-100">
                          {selectedDeal.createdAt ? new Date(selectedDeal.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Last Updated
                        </label>
                        <p className="text-gray-900 dark:text-gray-100">
                          {selectedDeal.updatedAt ? new Date(selectedDeal.updatedAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Read-only Notice */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          This is a read-only view of the deal. To edit this deal, please use the main Deals page.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      setShowDealModal(false);
                      setSelectedDeal(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
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

export default CompanyDetail;
