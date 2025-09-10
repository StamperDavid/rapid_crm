import React, { useState } from 'react';
import {
  BuildingOfficeIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  MapPinIcon,
  TruckIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { Organization, SELECT_OPTIONS } from '../../../types/schema';

const Companies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Organization | null>(null);
  const [editingCompany, setEditingCompany] = useState<Organization | null>(null);

  // Mock company data using comprehensive transportation Organization schema
  const [companies, setCompanies] = useState<Organization[]>([
    {
      id: '1',
      // Physical Address
      physicalStreetAddress: '123 Main St',
      physicalSuiteApt: 'Suite 100',
      physicalCity: 'Chicago',
      physicalState: 'Illinois',
      physicalCountry: 'United States',
      physicalZip: '60601',
      
      // Mailing Address
      isMailingAddressSame: 'No',
      mailingStreetAddress: '456 Business Ave',
      mailingCity: 'Chicago',
      mailingState: 'Illinois',
      mailingZip: '60602',
      mailingCountry: 'United States',
      
      // Business Information
      businessType: 'LLC',
      businessStarted: '2018-03-15',
      desiredBusinessName: 'Acme Transportation',
      legalBusinessName: 'Acme Transportation LLC',
      hasDBA: 'Yes',
      dbaName: 'Acme Transport',
      ein: '12-3456789',
      entityTypes: ['Transportation', 'Logistics'],
      
      // Transportation & Operations
      businessClassification: 'Carrier',
      transportationOperationType: 'Long-Haul',
      carriesPassengers: 'No',
      transportsGoodsForHire: 'Yes',
      engagedInInterstateCommerce: 'Yes',
      interstateIntrastate: 'Interstate',
      statesOfOperation: ['Illinois', 'Indiana', 'Wisconsin', 'Michigan'],
      operationClass: 'Class A',
      hasUSDOTNumber: 'Yes',
      usdotNumber: '123456',
      
      // Fleet Information
      vehicleFleetType: 'Owned',
      vehicleTypesUsed: ['Trucks', 'Trailers'],
      numberOfDrivers: 15,
      driverList: 'John Smith, Mike Johnson, Sarah Davis, Robert Wilson, Lisa Brown',
      numberOfVehicles: 12,
      vehicleList: '2020 Freightliner Cascadia, 2019 Peterbilt 579, 2021 Volvo VNL',
      gvwr: '80,000 lbs',
      yearMakeModel: '2020-2021 Freightliner/Peterbilt/Volvo',
      
      // Cargo & Safety
      cargoTypesTransported: 'General Freight',
      hazmatPlacardRequired: 'No',
      phmsaWork: 'No',
      
      // Regulatory Compliance
      additionalRegulatoryDetails: ['Vehicle Safety Standards', 'Driver Qualification Files', 'Hours of Service Compliance'],
      
      // Financial Information
      hasDunsBradstreetNumber: 'Yes',
      dunsBradstreetNumber: '123456789',
      
      // System Fields
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      // Physical Address
      physicalStreetAddress: '789 Oak Ave',
      physicalCity: 'Milwaukee',
      physicalState: 'Wisconsin',
      physicalCountry: 'United States',
      physicalZip: '53201',
      
      // Mailing Address
      isMailingAddressSame: 'Yes',
      
      // Business Information
      businessType: 'Corporation',
      businessStarted: '2015-08-20',
      legalBusinessName: 'Midwest Freight Solutions Inc',
      hasDBA: 'Yes',
      dbaName: 'Midwest Freight',
      ein: '98-7654321',
      entityTypes: ['Transportation', 'Brokerage'],
      
      // Transportation & Operations
      businessClassification: 'Broker',
      transportationOperationType: 'Short-Haul',
      carriesPassengers: 'No',
      transportsGoodsForHire: 'Yes',
      engagedInInterstateCommerce: 'Yes',
      interstateIntrastate: 'Interstate',
      statesOfOperation: ['Wisconsin', 'Minnesota', 'Iowa'],
      operationClass: 'Class B',
      hasUSDOTNumber: 'Yes',
      usdotNumber: '789012',
      
      // Fleet Information
      vehicleFleetType: 'Mixed',
      vehicleTypesUsed: ['Trucks'],
      numberOfDrivers: 8,
      numberOfVehicles: 6,
      gvwr: '26,000 lbs',
      
      // Cargo & Safety
      cargoTypesTransported: 'Household Goods',
      hazmatPlacardRequired: 'No',
      
      // Regulatory Compliance
      additionalRegulatoryDetails: ['Hours of Service Compliance', 'Vehicle Maintenance Records'],
      
      // Financial Information
      hasDunsBradstreetNumber: 'No',
      
      // System Fields
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    }
  ]);

  const [newCompany, setNewCompany] = useState<Partial<Organization>>({
    physicalStreetAddress: '',
    physicalCity: '',
    physicalState: '',
    physicalCountry: 'United States',
    physicalZip: '',
    isMailingAddressSame: 'Yes',
    businessType: 'LLC',
    legalBusinessName: '',
    hasDBA: 'No',
    ein: '',
    entityTypes: [],
    businessClassification: 'Carrier',
    transportationOperationType: 'Long-Haul',
    carriesPassengers: 'No',
    transportsGoodsForHire: 'Yes',
    engagedInInterstateCommerce: 'Yes',
    interstateIntrastate: 'Interstate',
    statesOfOperation: [],
    operationClass: '',
    hasUSDOTNumber: 'No',
    vehicleFleetType: 'Owned',
    vehicleTypesUsed: [],
    numberOfDrivers: 0,
    numberOfVehicles: 0,
    gvwr: '',
    cargoTypesTransported: 'General Freight',
    hazmatPlacardRequired: 'No',
    hasDunsBradstreetNumber: 'No',
    additionalRegulatoryDetails: []
  });

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.legalBusinessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.physicalCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.usdotNumber && company.usdotNumber.includes(searchTerm)) ||
                         company.businessClassification.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'carrier' && company.businessClassification === 'Carrier') ||
                         (filterStatus === 'broker' && company.businessClassification === 'Broker') ||
                         (filterStatus === 'forwarder' && company.businessClassification === 'Freight Forwarder');
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateCompany = () => {
    if (newCompany.legalBusinessName && newCompany.physicalStreetAddress && newCompany.physicalCity) {
      const company: Organization = {
        id: (companies.length + 1).toString(),
        physicalStreetAddress: newCompany.physicalStreetAddress!,
        physicalCity: newCompany.physicalCity!,
        physicalState: newCompany.physicalState!,
        physicalCountry: newCompany.physicalCountry!,
        physicalZip: newCompany.physicalZip!,
        isMailingAddressSame: newCompany.isMailingAddressSame!,
        businessType: newCompany.businessType!,
        legalBusinessName: newCompany.legalBusinessName!,
        hasDBA: newCompany.hasDBA!,
        ein: newCompany.ein!,
        entityTypes: newCompany.entityTypes!,
        businessClassification: newCompany.businessClassification!,
        transportationOperationType: newCompany.transportationOperationType!,
        carriesPassengers: newCompany.carriesPassengers!,
        transportsGoodsForHire: newCompany.transportsGoodsForHire!,
        engagedInInterstateCommerce: newCompany.engagedInInterstateCommerce!,
        interstateIntrastate: newCompany.interstateIntrastate!,
        statesOfOperation: newCompany.statesOfOperation!,
        operationClass: newCompany.operationClass!,
        hasUSDOTNumber: newCompany.hasUSDOTNumber!,
        usdotNumber: newCompany.usdotNumber,
        vehicleFleetType: newCompany.vehicleFleetType!,
        vehicleTypesUsed: newCompany.vehicleTypesUsed!,
        numberOfDrivers: newCompany.numberOfDrivers!,
        numberOfVehicles: newCompany.numberOfVehicles!,
        gvwr: newCompany.gvwr!,
        cargoTypesTransported: newCompany.cargoTypesTransported!,
        hazmatPlacardRequired: newCompany.hazmatPlacardRequired!,
        hasDunsBradstreetNumber: newCompany.hasDunsBradstreetNumber!,
        dunsBradstreetNumber: newCompany.dunsBradstreetNumber,
        additionalRegulatoryDetails: newCompany.additionalRegulatoryDetails || [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setCompanies([...companies, company]);
      setNewCompany({
        physicalStreetAddress: '',
        physicalCity: '',
        physicalState: '',
        physicalCountry: 'United States',
        physicalZip: '',
        isMailingAddressSame: 'Yes',
        businessType: 'LLC',
        legalBusinessName: '',
        hasDBA: 'No',
        ein: '',
        entityTypes: [],
        businessClassification: 'Carrier',
        transportationOperationType: 'Long-Haul',
        carriesPassengers: 'No',
        transportsGoodsForHire: 'Yes',
        engagedInInterstateCommerce: 'Yes',
        interstateIntrastate: 'Interstate',
        statesOfOperation: [],
        operationClass: '',
        hasUSDOTNumber: 'No',
        vehicleFleetType: 'Owned',
        vehicleTypesUsed: [],
        numberOfDrivers: 0,
        numberOfVehicles: 0,
        gvwr: '',
        cargoTypesTransported: 'General Freight',
        hazmatPlacardRequired: 'No',
        hasDunsBradstreetNumber: 'No',
        additionalRegulatoryDetails: []
      });
      setShowCreateModal(false);
    }
  };

  const handleDeleteCompany = (companyId: string) => {
    setCompanies(companies.filter(company => company.id !== companyId));
  };

  const totalCompanies = companies.length;
  const carriers = companies.filter(c => c.businessClassification === 'Carrier').length;
  const brokers = companies.filter(c => c.businessClassification === 'Broker').length;
  const forwarders = companies.filter(c => c.businessClassification === 'Freight Forwarder').length;
  const totalVehicles = companies.reduce((sum, c) => sum + c.numberOfVehicles, 0);
  const totalDrivers = companies.reduce((sum, c) => sum + c.numberOfDrivers, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transportation Companies</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage transportation and logistics companies with comprehensive DOT compliance tracking
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setEditingCompany(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Company
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Companies
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {totalCompanies}
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
                <TruckIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Carriers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {carriers}
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
                <DocumentTextIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Brokers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {brokers}
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
                <TruckIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Vehicles
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {totalVehicles}
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
                <UserGroupIcon className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Drivers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {totalDrivers}
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
                placeholder="Search companies, USDOT, cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Business Type
            </label>
            <select
              id="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="carrier">Carriers</option>
              <option value="broker">Brokers</option>
              <option value="forwarder">Freight Forwarders</option>
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

      {/* Enhanced Companies List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredCompanies.map((company) => (
            <li key={company.id}>
              <div 
                className="px-4 py-6 sm:px-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={() => setSelectedCompany(company)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <p className="text-lg font-medium text-blue-600 dark:text-blue-400 truncate">
                          {company.legalBusinessName}
                        </p>
                        {company.hasDBA === 'Yes' && company.dbaName && (
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            (DBA: {company.dbaName})
                          </span>
                        )}
                        <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {company.businessClassification}
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {company.physicalCity}, {company.physicalState}
                        </div>
                        
                        {company.usdotNumber && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <IdentificationIcon className="h-4 w-4 mr-1" />
                            USDOT: {company.usdotNumber}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <TruckIcon className="h-4 w-4 mr-1" />
                          {company.numberOfVehicles} vehicles
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          {company.numberOfDrivers} drivers
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {company.transportationOperationType}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {company.vehicleFleetType} Fleet
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          {company.cargoTypesTransported}
                        </span>
                        {company.hazmatPlacardRequired === 'Yes' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            Hazmat
                          </span>
                        )}
                      </div>
                      
                      {company.statesOfOperation.length > 0 && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">States of Operation:</span> {company.statesOfOperation.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCompany(company);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="View details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCompany(company.id);
                      }}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Delete company"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Company Details Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                    {selectedCompany.legalBusinessName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCompany.businessClassification} • {selectedCompany.transportationOperationType}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Business Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Business Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Legal Name:</span> {selectedCompany.legalBusinessName}</div>
                    {selectedCompany.hasDBA === 'Yes' && selectedCompany.dbaName && (
                      <div><span className="font-medium">DBA:</span> {selectedCompany.dbaName}</div>
                    )}
                    <div><span className="font-medium">Business Type:</span> {selectedCompany.businessType}</div>
                    <div><span className="font-medium">EIN:</span> {selectedCompany.ein}</div>
                    {selectedCompany.businessStarted && (
                      <div><span className="font-medium">Business Started:</span> {new Date(selectedCompany.businessStarted).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
                
                {/* Transportation Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Transportation Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Classification:</span> {selectedCompany.businessClassification}</div>
                    <div><span className="font-medium">Operation Type:</span> {selectedCompany.transportationOperationType}</div>
                    <div><span className="font-medium">Interstate/Intrastate:</span> {selectedCompany.interstateIntrastate}</div>
                    {selectedCompany.usdotNumber && (
                      <div><span className="font-medium">USDOT Number:</span> {selectedCompany.usdotNumber}</div>
                    )}
                    <div><span className="font-medium">Operation Class:</span> {selectedCompany.operationClass}</div>
                  </div>
                </div>
                
                {/* Fleet Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Fleet Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Fleet Type:</span> {selectedCompany.vehicleFleetType}</div>
                    <div><span className="font-medium">Number of Vehicles:</span> {selectedCompany.numberOfVehicles}</div>
                    <div><span className="font-medium">Number of Drivers:</span> {selectedCompany.numberOfDrivers}</div>
                    <div><span className="font-medium">GVWR:</span> {selectedCompany.gvwr}</div>
                    {selectedCompany.vehicleTypesUsed.length > 0 && (
                      <div><span className="font-medium">Vehicle Types:</span> {selectedCompany.vehicleTypesUsed.join(', ')}</div>
                    )}
                  </div>
                </div>
                
                {/* Cargo & Safety */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Cargo & Safety</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Cargo Types:</span> {selectedCompany.cargoTypesTransported}</div>
                    <div><span className="font-medium">Hazmat Required:</span> {selectedCompany.hazmatPlacardRequired}</div>
                    {selectedCompany.phmsaWork && (
                      <div><span className="font-medium">PHMSA Work:</span> {selectedCompany.phmsaWork}</div>
                    )}
                    {selectedCompany.additionalRegulatoryDetails.length > 0 && (
                      <div>
                        <span className="font-medium">Regulatory Details:</span>
                        <ul className="list-disc list-inside ml-2">
                          {selectedCompany.additionalRegulatoryDetails.map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Company Modal - Comprehensive Transportation Schema */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-5 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  Add New Transportation Company
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Business Information Section */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Business Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Legal Business Name *
                      </label>
                      <input
                        type="text"
                        value={newCompany.legalBusinessName || ''}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, legalBusinessName: e.target.value }))}
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter legal business name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Business Type *
                      </label>
                      <select
                        value={newCompany.businessType || 'LLC'}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, businessType: e.target.value as any }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {SELECT_OPTIONS.businessType.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Business Classification *
                      </label>
                      <select
                        value={newCompany.businessClassification || 'Carrier'}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, businessClassification: e.target.value as any }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {SELECT_OPTIONS.businessClassification.map(classification => (
                          <option key={classification} value={classification}>{classification}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        EIN
                      </label>
                      <input
                        type="text"
                        value={newCompany.ein || ''}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, ein: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="12-3456789"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Has DBA
                      </label>
                      <select
                        value={newCompany.hasDBA || 'No'}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, hasDBA: e.target.value as any }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    {newCompany.hasDBA === 'Yes' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          DBA Name
                        </label>
                        <input
                          type="text"
                          value={newCompany.dbaName || ''}
                          onChange={(e) => setNewCompany(prev => ({ ...prev, dbaName: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter DBA name"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Physical Address Section */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Physical Address</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={newCompany.physicalStreetAddress || ''}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, physicalStreetAddress: e.target.value }))}
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter street address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Suite/Apt
                      </label>
                      <input
                        type="text"
                        value={newCompany.physicalSuiteApt || ''}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, physicalSuiteApt: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Suite 100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        City *
                      </label>
                      <input
                        type="text"
                        value={newCompany.physicalCity || ''}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, physicalCity: e.target.value }))}
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter city"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        State *
                      </label>
                      <input
                        type="text"
                        value={newCompany.physicalState || ''}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, physicalState: e.target.value }))}
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter state"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={newCompany.physicalZip || ''}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, physicalZip: e.target.value }))}
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter ZIP code"
                      />
                    </div>
                  </div>
                </div>

                {/* Transportation & Operations Section */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Transportation & Operations</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Operation Type *
                      </label>
                      <select
                        value={newCompany.transportationOperationType || 'Long-Haul'}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, transportationOperationType: e.target.value as any }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {SELECT_OPTIONS.transportationOperationType.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Interstate/Intrastate
                      </label>
                      <select
                        value={newCompany.interstateIntrastate || 'Interstate'}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, interstateIntrastate: e.target.value as any }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="Interstate">Interstate</option>
                        <option value="Intrastate">Intrastate</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Operation Class
                      </label>
                      <input
                        type="text"
                        value={newCompany.operationClass || ''}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, operationClass: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Class A, Class B, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Has USDOT Number
                      </label>
                      <select
                        value={newCompany.hasUSDOTNumber || 'No'}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, hasUSDOTNumber: e.target.value as any }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    {newCompany.hasUSDOTNumber === 'Yes' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          USDOT Number
                        </label>
                        <input
                          type="text"
                          value={newCompany.usdotNumber || ''}
                          onChange={(e) => setNewCompany(prev => ({ ...prev, usdotNumber: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter USDOT number"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Fleet Information Section */}
                <div className="pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Fleet Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fleet Type
                      </label>
                      <select
                        value={newCompany.vehicleFleetType || 'Owned'}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, vehicleFleetType: e.target.value as any }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {SELECT_OPTIONS.vehicleFleetType.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Number of Vehicles
                      </label>
                      <input
                        type="number"
                        value={newCompany.numberOfVehicles || 0}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, numberOfVehicles: parseInt(e.target.value) || 0 }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Number of Drivers
                      </label>
                      <input
                        type="number"
                        value={newCompany.numberOfDrivers || 0}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, numberOfDrivers: parseInt(e.target.value) || 0 }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        GVWR
                      </label>
                      <input
                        type="text"
                        value={newCompany.gvwr || ''}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, gvwr: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="80,000 lbs"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cargo Types Transported
                      </label>
                      <input
                        type="text"
                        value={newCompany.cargoTypesTransported || 'General Freight'}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, cargoTypesTransported: e.target.value as any }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="General Freight, Household Goods, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hazmat Placard Required
                      </label>
                      <select
                        value={newCompany.hazmatPlacardRequired || 'No'}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, hazmatPlacardRequired: e.target.value as any }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCompany}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Company
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;