import React, { useState, useEffect } from 'react';
import { 
  OfficeBuildingIcon, 
  TruckIcon, 
  UserIcon, 
  DocumentTextIcon,
  PlusIcon,
  XIcon,
  CheckCircleIcon
} from '@heroicons/react/outline';
import { Organization, Person, Vehicle, Driver } from '../../types/schema';
import { useCRM } from '../../contexts/CRMContext';
import { USDOTApplicationService } from '../../services/usdot/USDOTApplicationService';
import TooltipWrapper from '../TooltipWrapper';

interface ComprehensiveCompanyFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
  initialData?: any;
}

const ComprehensiveCompanyForm: React.FC<ComprehensiveCompanyFormProps> = ({ 
  onSave, 
  onCancel, 
  isEditing = false,
  initialData = {}
}) => {
  const { createCompany, createContact, createVehicle, createDriver } = useCRM();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Company data
  const [companyData, setCompanyData] = useState<any>({
    // Physical Address
    physicalStreetAddress: '',
    physicalSuiteApt: '',
    physicalCity: '',
    physicalState: '',
    physicalCountry: 'United States',
    physicalZip: '',
    
    // Mailing Address
    isMailingAddressSame: 'Yes',
    mailingStreetAddress: '',
    mailingSuiteApt: '',
    mailingCity: '',
    mailingState: '',
    mailingZip: '',
    mailingCountry: 'United States',
    
    // Business Details
    businessType: 'LLC',
    businessStarted: '',
    desiredBusinessName: '',
    legalBusinessName: '',
    hasDBA: 'No',
    dbaName: '',
    ein: '',
    entityTypes: [],
    
    // Transportation Details
    businessClassification: 'Carrier',
    transportationOperationType: 'Long-Haul',
    carriesPassengers: 'No',
    transportsGoodsForHire: 'Yes',
    engagedInInterstateCommerce: 'Yes',
    interstateIntrastate: 'Interstate',
    statesOfOperation: [],
    operationClass: '',
    hasUSDOTNumber: 'No',
    usdotNumber: '',
    
    // Fleet Details
    vehicleFleetType: 'Owned',
    vehicleTypesUsed: [],
    numberOfDrivers: 0,
    driverList: '',
    numberOfVehicles: 0,
    vehicleList: '',
    gvwr: '',
    yearMakeModel: '',
    
    // Cargo & Safety
    cargoTypesTransported: 'General Freight',
    hazmatPlacardRequired: 'No',
    phmsaWork: 'No',
    
    // Regulatory Compliance
    additionalRegulatoryDetails: [],
    
    // Financial Information
    hasDunsBradstreetNumber: 'No',
    dunsBradstreetNumber: '',
    
    ...initialData
  });

  // USDOT Application data
  const [usdotData, setUsdotData] = useState<any>({
    operationTypes: [],
    carrierOperationTypes: [],
    powerUnits: { owned: 0, termLeased: 0, tripLeased: 0 },
    drivers: { employees: 0, ownerOperators: 0 },
    operationClassifications: [],
    cargoClassifications: [],
    hazardousMaterials: { classifications: [], hmClasses: [] },
    marketerOfTransportationServices: false,
    applicationDate: new Date().toISOString().split('T')[0],
    signature: '',
    officialTitle: ''
  });

  // Embedded entities
  const [contacts, setContacts] = useState<Person[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Form states
  const [showContactForm, setShowContactForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [showUsdotForm, setShowUsdotForm] = useState(false);

  const steps = [
    { number: 1, title: 'Company Information', icon: OfficeBuildingIcon },
    { number: 2, title: 'USDOT Application', icon: DocumentTextIcon },
    { number: 3, title: 'Fleet & Personnel', icon: TruckIcon },
    { number: 4, title: 'Review & Submit', icon: CheckCircleIcon }
  ];

  const handleCompanyFieldChange = (field: string, value: any) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUsdotFieldChange = (field: string, value: any) => {
    setUsdotData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setUsdotData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item: string) => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleNestedUsdotChange = (parentField: string, childField: string, value: any) => {
    setUsdotData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const addContact = (contactData: any) => {
    const newContact = {
      id: `temp-contact-${Date.now()}`,
      ...contactData,
      companyId: 'temp-company-id', // Will be updated when company is created
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setContacts(prev => [...prev, newContact]);
    setShowContactForm(false);
  };

  const addVehicle = (vehicleData: any) => {
    const newVehicle = {
      id: `temp-vehicle-${Date.now()}`,
      ...vehicleData,
      companyId: 'temp-company-id', // Will be updated when company is created
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setVehicles(prev => [...prev, newVehicle]);
    setShowVehicleForm(false);
  };

  const addDriver = (driverData: any) => {
    const newDriver = {
      id: `temp-driver-${Date.now()}`,
      ...driverData,
      companyId: 'temp-company-id', // Will be updated when company is created
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDrivers(prev => [...prev, newDriver]);
    setShowDriverForm(false);
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const removeVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const removeDriver = (id: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create the company first
      const createdCompany = await createCompany(companyData);
      
      // Create USDOT application if data is provided
      if (usdotData.operationTypes.length > 0 && usdotData.signature) {
        const usdotApplicationData = {
          companyId: createdCompany.id,
          legalBusinessName: companyData.legalBusinessName,
          dbaName: companyData.dbaName,
          principalAddress: {
            street: companyData.physicalStreetAddress,
            city: companyData.physicalCity,
            state: companyData.physicalState,
            zip: companyData.physicalZip
          },
          mailingAddress: {
            isDifferent: companyData.isMailingAddressSame === 'No',
            street: companyData.mailingStreetAddress,
            city: companyData.mailingCity,
            state: companyData.mailingState,
            zip: companyData.mailingZip
          },
          primaryContact: {
            fullName: '',
            title: '',
            phone: '',
            fax: '',
            email: ''
          },
          companyOfficial: {
            fullName: usdotData.signature,
            title: usdotData.officialTitle,
            phone: '',
            email: ''
          },
          businessType: companyData.businessType as any,
          ein: companyData.ein,
          dunsNumber: companyData.dunsBradstreetNumber === 'Yes' ? companyData.dunsBradstreetNumber : undefined,
          operationTypes: usdotData.operationTypes,
          carrierOperationTypes: usdotData.carrierOperationTypes,
          powerUnits: usdotData.powerUnits,
          drivers: usdotData.drivers,
          operationClassifications: usdotData.operationClassifications,
          cargoClassifications: usdotData.cargoClassifications,
          hazardousMaterials: usdotData.hazardousMaterials,
          marketerOfTransportationServices: usdotData.marketerOfTransportationServices,
          applicationDate: usdotData.applicationDate,
          signature: usdotData.signature,
          officialTitle: usdotData.officialTitle
        };

        await USDOTApplicationService.createApplication(usdotApplicationData);
      }
      
      // Create all embedded entities with the correct company ID
      const contactPromises = contacts.map(contact => 
        createContact({ ...contact, companyId: createdCompany.id })
      );
      
      const vehiclePromises = vehicles.map(vehicle => 
        createVehicle({ ...vehicle, companyId: createdCompany.id })
      );
      
      const driverPromises = drivers.map(driver => 
        createDriver({ ...driver, companyId: createdCompany.id })
      );

      // Wait for all entities to be created
      await Promise.all([...contactPromises, ...vehiclePromises, ...driverPromises]);
      
      onSave(createdCompany);
    } catch (error) {
      console.error('Error creating company with embedded entities:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Company Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Physical Address */}
          <div className="md:col-span-2">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
              Physical Address
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <TooltipWrapper
                  tooltip="The physical street address where the company operates from. This is required for DOT registration and must be a real business address."
                  position="top"
                  showIcon={true}
                  iconPosition="after"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Street Address *
                  </label>
                </TooltipWrapper>
                <input
                  type="text"
                  value={companyData.physicalStreetAddress}
                  onChange={(e) => handleCompanyFieldChange('physicalStreetAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <TooltipWrapper
                  tooltip="Suite, apartment, or unit number if applicable. This is optional but helps with precise address identification."
                  position="top"
                  showIcon={true}
                  iconPosition="after"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Suite/Apt
                  </label>
                </TooltipWrapper>
                <input
                  type="text"
                  value={companyData.physicalSuiteApt}
                  onChange={(e) => handleCompanyFieldChange('physicalSuiteApt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={companyData.physicalCity}
                  onChange={(e) => handleCompanyFieldChange('physicalCity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={companyData.physicalState}
                  onChange={(e) => handleCompanyFieldChange('physicalState', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={companyData.physicalZip}
                  onChange={(e) => handleCompanyFieldChange('physicalZip', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="md:col-span-2">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
              Business Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Legal Business Name *
                </label>
                <input
                  type="text"
                  value={companyData.legalBusinessName}
                  onChange={(e) => handleCompanyFieldChange('legalBusinessName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Type *
                </label>
                <select
                  value={companyData.businessType}
                  onChange={(e) => handleCompanyFieldChange('businessType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="LLC">LLC</option>
                  <option value="Corporation">Corporation</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  EIN *
                </label>
                <input
                  type="text"
                  value={companyData.ein}
                  onChange={(e) => handleCompanyFieldChange('ein', e.target.value)}
                  placeholder="XX-XXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Classification *
                </label>
                <select
                  value={companyData.businessClassification}
                  onChange={(e) => handleCompanyFieldChange('businessClassification', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Carrier">Carrier</option>
                  <option value="Broker">Broker</option>
                  <option value="Freight Forwarder">Freight Forwarder</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fleet Summary */}
          <div className="md:col-span-2">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
              Fleet Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Vehicles *
                </label>
                <input
                  type="number"
                  min="0"
                  value={companyData.numberOfVehicles}
                  onChange={(e) => handleCompanyFieldChange('numberOfVehicles', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Drivers *
                </label>
                <input
                  type="number"
                  min="0"
                  value={companyData.numberOfDrivers}
                  onChange={(e) => handleCompanyFieldChange('numberOfDrivers', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          USDOT Application (MCS-150)
        </h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Type of Company Operation * (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['Motor Carrier', 'Broker', 'Freight Forwarder', 'Intermodal Equipment Provider (IEP)', 'Cargo Tank Facility', 'Shipper', 'Receiver'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={usdotData.operationTypes.includes(type)}
                  onChange={() => handleArrayToggle('operationTypes', type)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {usdotData.operationTypes.includes('Motor Carrier') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Type of Carrier Operation * (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['For-Hire Carrier: Interstate', 'For-Hire Carrier: Intrastate', 'Private Carrier: Interstate', 'Private Carrier: Intrastate', 'Exempt For-Hire Carrier: Interstate', 'Private Passenger Carrier: Non-Business', 'Migrant Worker Carrier', 'Other'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={usdotData.carrierOperationTypes.includes(type)}
                    onChange={() => handleArrayToggle('carrierOperationTypes', type)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {usdotData.operationTypes.includes('Motor Carrier') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Owned Power Units
              </label>
              <input
                type="number"
                min="0"
                value={usdotData.powerUnits.owned}
                onChange={(e) => handleNestedUsdotChange('powerUnits', 'owned', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Term Leased Power Units
              </label>
              <input
                type="number"
                min="0"
                value={usdotData.powerUnits.termLeased}
                onChange={(e) => handleNestedUsdotChange('powerUnits', 'termLeased', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trip Leased Power Units
              </label>
              <input
                type="number"
                min="0"
                value={usdotData.powerUnits.tripLeased}
                onChange={(e) => handleNestedUsdotChange('powerUnits', 'tripLeased', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Signature of Company Official *
          </label>
          <input
            type="text"
            value={usdotData.signature}
            onChange={(e) => handleUsdotFieldChange('signature', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Contacts Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Company Contacts
          </h3>
          <button
            onClick={() => setShowContactForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Contact
          </button>
        </div>
        
        {contacts.length > 0 ? (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {contact.firstName} {contact.lastName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {contact.email} • {contact.phone}
                  </p>
                </div>
                <button
                  onClick={() => removeContact(contact.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No contacts added yet. Click "Add Contact" to add company contacts.
          </p>
        )}
      </div>

      {/* Vehicles Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Fleet Vehicles
          </h3>
          <button
            onClick={() => setShowVehicleForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Vehicle
          </button>
        </div>
        
        {vehicles.length > 0 ? (
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    VIN: {vehicle.vin} • License: {vehicle.licensePlate}
                  </p>
                </div>
                <button
                  onClick={() => removeVehicle(vehicle.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No vehicles added yet. Click "Add Vehicle" to add fleet vehicles.
          </p>
        )}
      </div>

      {/* Drivers Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Company Drivers
          </h3>
          <button
            onClick={() => setShowDriverForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Driver
          </button>
        </div>
        
        {drivers.length > 0 ? (
          <div className="space-y-3">
            {drivers.map((driver) => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {driver.firstName} {driver.lastName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    CDL: {driver.licenseNumber} • Class: {driver.licenseClass}
                  </p>
                </div>
                <button
                  onClick={() => removeDriver(driver.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No drivers added yet. Click "Add Driver" to add company drivers.
          </p>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Review & Submit
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
              Company Information
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Name:</strong> {companyData.legalBusinessName}<br/>
              <strong>Type:</strong> {companyData.businessType}<br/>
              <strong>Classification:</strong> {companyData.businessClassification}<br/>
              <strong>Address:</strong> {companyData.physicalStreetAddress}, {companyData.physicalCity}, {companyData.physicalState} {companyData.physicalZip}
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
              Fleet Summary
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Vehicles:</strong> {companyData.numberOfVehicles}<br/>
              <strong>Drivers:</strong> {companyData.numberOfDrivers}<br/>
              <strong>Contacts:</strong> {contacts.length}<br/>
              <strong>Vehicles Added:</strong> {vehicles.length}<br/>
              <strong>Drivers Added:</strong> {drivers.length}
            </p>
          </div>
          
          {usdotData.operationTypes.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                USDOT Application
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Operation Types:</strong> {usdotData.operationTypes.join(', ')}<br/>
                <strong>Power Units:</strong> {usdotData.powerUnits.owned + usdotData.powerUnits.termLeased + usdotData.powerUnits.tripLeased}<br/>
                <strong>Signature:</strong> {usdotData.signature}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            {isEditing ? 'Edit' : 'Create New'} Company
          </h3>
          
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      Step {step.number}
                    </p>
                    <p className={`text-xs ${
                      currentStep >= step.number
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.number
                        ? 'bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Form Content */}
          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Company'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveCompanyForm;
