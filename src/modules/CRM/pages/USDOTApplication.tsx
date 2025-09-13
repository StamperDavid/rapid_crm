import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  OfficeBuildingIcon,
  UserIcon,
  TruckIcon,
  ExclamationIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/outline';
import { useCRM } from '../../../contexts/CRMContext';

interface USDOTApplicationData {
  // Part 1: Company and Business Information
  legalBusinessName: string;
  dbaName: string;
  principalAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  mailingAddress: {
    isDifferent: boolean;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  primaryContact: {
    fullName: string;
    title: string;
    phone: string;
    fax: string;
    email: string;
  };
  companyOfficial: {
    fullName: string;
    title: string;
    phone: string;
    email: string;
  };
  businessType: 'Sole Proprietor' | 'Partnership' | 'Corporation' | 'LLC' | 'Other';
  ein: string;
  dunsNumber: string;
  
  // Part 2: Operations and Authority
  operationTypes: string[];
  carrierOperationTypes: string[];
  
  // Part 3: Fleet and Cargo Information
  powerUnits: {
    owned: number;
    termLeased: number;
    tripLeased: number;
  };
  drivers: {
    employees: number;
    ownerOperators: number;
  };
  operationClassifications: string[];
  cargoClassifications: string[];
  hazardousMaterials: {
    classifications: string[];
    hmClasses: string[];
  };
  
  // Part 4: Financial and Safety Information
  marketerOfTransportationServices: boolean;
  applicationDate: string;
  signature: string;
  officialTitle: string;
}

const USDOTApplication: React.FC = () => {
  const navigate = useNavigate();
  const { createCompany } = useCRM();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<USDOTApplicationData>({
    legalBusinessName: '',
    dbaName: '',
    principalAddress: { street: '', city: '', state: '', zip: '' },
    mailingAddress: { isDifferent: false, street: '', city: '', state: '', zip: '' },
    primaryContact: { fullName: '', title: '', phone: '', fax: '', email: '' },
    companyOfficial: { fullName: '', title: '', phone: '', email: '' },
    businessType: 'LLC',
    ein: '',
    dunsNumber: '',
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

  const operationTypes = [
    'Motor Carrier',
    'Broker',
    'Freight Forwarder',
    'Intermodal Equipment Provider (IEP)',
    'Cargo Tank Facility',
    'Shipper',
    'Receiver'
  ];

  const carrierOperationTypes = [
    'For-Hire Carrier: Interstate',
    'For-Hire Carrier: Intrastate',
    'Private Carrier: Interstate',
    'Private Carrier: Intrastate',
    'Exempt For-Hire Carrier: Interstate',
    'Private Passenger Carrier: Non-Business',
    'Migrant Worker Carrier',
    'Other'
  ];

  const operationClassifications = [
    'General Freight',
    'Household Goods',
    'Passengers',
    'Oilfield Equipment',
    'Livestock',
    'Motor Vehicles',
    'Metal (Sheet, Coils, Rolls)',
    'Building Materials',
    'Water Well Drilling',
    'Agricultural',
    'Grain, Feed, Hay',
    'Construction',
    'Other'
  ];

  const cargoClassifications = [
    'General Freight',
    'Household Goods',
    'Commodities Requiring Special Handling',
    'Refrigerated Food',
    'Liquids/Gases',
    'Dry Bulk',
    'Forest Products',
    'Machinery, Large Objects',
    'Garbage/Refuse',
    'US Mail'
  ];

  const hmClassifications = ['C: Cargo Tank', 'S: Non-Cargo Tank', 'B: Bulk', 'NB: Non-Bulk'];
  const hmClasses = [
    'Explosives',
    'Flammable Liquids',
    'Corrosive Materials',
    'Toxic Materials',
    'Radioactive Materials',
    'Oxidizers',
    'Compressed Gases'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof USDOTApplicationData],
        [childField]: value
      }
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof USDOTApplicationData].includes(value)
        ? (prev[field as keyof USDOTApplicationData] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof USDOTApplicationData] as string[]), value]
    }));
  };

  const handleSubmit = async () => {
    try {
      // Convert USDOT application data to company format
      const companyData = {
        legalBusinessName: formData.legalBusinessName,
        dbaName: formData.dbaName,
        businessType: formData.businessType,
        ein: formData.ein,
        physicalStreetAddress: formData.principalAddress.street,
        physicalCity: formData.principalAddress.city,
        physicalState: formData.principalAddress.state,
        physicalZip: formData.principalAddress.zip,
        physicalCountry: 'United States',
        isMailingAddressSame: formData.mailingAddress.isDifferent ? 'No' : 'Yes',
        mailingStreetAddress: formData.mailingAddress.street,
        mailingCity: formData.mailingAddress.city,
        mailingState: formData.mailingAddress.state,
        mailingZip: formData.mailingAddress.zip,
        mailingCountry: 'United States',
        classification: formData.operationTypes.includes('Motor Carrier') ? 'Carrier' : 
                       formData.operationTypes.includes('Broker') ? 'Broker' : 'Freight Forwarder',
        operationType: formData.carrierOperationTypes.includes('For-Hire Carrier: Interstate') ? 'Long-Haul' : 'Regional',
        interstateIntrastate: formData.carrierOperationTypes.some(type => type.includes('Interstate')) ? 'Interstate' : 'Intrastate',
        operationClass: 'Class A',
        numberOfVehicles: formData.powerUnits.owned + formData.powerUnits.termLeased + formData.powerUnits.tripLeased,
        numberOfDrivers: formData.drivers.employees + formData.drivers.ownerOperators,
        fleetType: 'Owned',
        gvwr: '80,000 lbs',
        vehicleTypes: 'Trucks,Trailers',
        cargoTypes: formData.cargoClassifications.join(','),
        hazmatRequired: formData.hazardousMaterials.classifications.length > 0 ? 'Yes' : 'No',
        phmsaWork: 'No',
        hasDunsBradstreetNumber: formData.dunsNumber ? 'Yes' : 'No',
        dunsBradstreetNumber: formData.dunsNumber
      };

      await createCompany(companyData);
      navigate('/companies');
    } catch (error) {
      console.error('Failed to create company:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Part 1: Company and Business Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Legal Business Name *
            </label>
            <input
              type="text"
              value={formData.legalBusinessName}
              onChange={(e) => handleInputChange('legalBusinessName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              DBA Name
            </label>
            <input
              type="text"
              value={formData.dbaName}
              onChange={(e) => handleInputChange('dbaName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Type *
            </label>
            <select
              value={formData.businessType}
              onChange={(e) => handleInputChange('businessType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Sole Proprietor">Sole Proprietor</option>
              <option value="Partnership">Partnership</option>
              <option value="Corporation">Corporation</option>
              <option value="LLC">LLC</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              EIN (9-digit number) *
            </label>
            <input
              type="text"
              value={formData.ein}
              onChange={(e) => handleInputChange('ein', e.target.value)}
              placeholder="XX-XXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              DUNS Number (Optional)
            </label>
            <input
              type="text"
              value={formData.dunsNumber}
              onChange={(e) => handleInputChange('dunsNumber', e.target.value)}
              placeholder="9-digit number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
          Principal Place of Business Address *
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={formData.principalAddress.street}
              onChange={(e) => handleNestedInputChange('principalAddress', 'street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.principalAddress.city}
              onChange={(e) => handleNestedInputChange('principalAddress', 'city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State
            </label>
            <input
              type="text"
              value={formData.principalAddress.state}
              onChange={(e) => handleNestedInputChange('principalAddress', 'state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              value={formData.principalAddress.zip}
              onChange={(e) => handleNestedInputChange('principalAddress', 'zip', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Part 2: Operations and Authority
        </h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Type of Company Operation * (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {operationTypes.map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.operationTypes.includes(type)}
                  onChange={() => handleArrayToggle('operationTypes', type)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {formData.operationTypes.includes('Motor Carrier') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Type of Carrier Operation * (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {carrierOperationTypes.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.carrierOperationTypes.includes(type)}
                    onChange={() => handleArrayToggle('carrierOperationTypes', type)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {formData.operationTypes.includes('Motor Carrier') && (
        <>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Part 3: Fleet Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Owned Power Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.powerUnits.owned}
                  onChange={(e) => handleNestedInputChange('powerUnits', 'owned', parseInt(e.target.value) || 0)}
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
                  value={formData.powerUnits.termLeased}
                  onChange={(e) => handleNestedInputChange('powerUnits', 'termLeased', parseInt(e.target.value) || 0)}
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
                  value={formData.powerUnits.tripLeased}
                  onChange={(e) => handleNestedInputChange('powerUnits', 'tripLeased', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Driver Employees
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.drivers.employees}
                  onChange={(e) => handleNestedInputChange('drivers', 'employees', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Owner-Operators
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.drivers.ownerOperators}
                  onChange={(e) => handleNestedInputChange('drivers', 'ownerOperators', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
              Operation Classification
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {operationClassifications.map((classification) => (
                <label key={classification} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.operationClassifications.includes(classification)}
                    onChange={() => handleArrayToggle('operationClassifications', classification)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{classification}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
              Cargo Classification
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cargoClassifications.map((classification) => (
                <label key={classification} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.cargoClassifications.includes(classification)}
                    onChange={() => handleArrayToggle('cargoClassifications', classification)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{classification}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
              Hazardous Materials Classification
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  HM Classification (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {hmClassifications.map((classification) => (
                    <label key={classification} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.hazardousMaterials.classifications.includes(classification)}
                        onChange={() => handleArrayToggle('hazardousMaterials.classifications', classification)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{classification}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  HM Classes (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hmClasses.map((hmClass) => (
                    <label key={hmClass} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.hazardousMaterials.hmClasses.includes(hmClass)}
                        onChange={() => handleArrayToggle('hazardousMaterials.hmClasses', hmClass)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{hmClass}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Part 4: Financial and Safety Information
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.marketerOfTransportationServices}
                onChange={(e) => handleInputChange('marketerOfTransportationServices', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Marketer of Transportation Services
              </span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Application Date
            </label>
            <input
              type="date"
              value={formData.applicationDate}
              onChange={(e) => handleInputChange('applicationDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Signature of Company Official *
            </label>
            <input
              type="text"
              value={formData.signature}
              onChange={(e) => handleInputChange('signature', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title of Company Official *
            </label>
            <input
              type="text"
              value={formData.officialTitle}
              onChange={(e) => handleInputChange('officialTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Company Information', icon: OfficeBuildingIcon },
    { number: 2, title: 'Operations & Authority', icon: TruckIcon },
    { number: 3, title: 'Fleet & Cargo', icon: ExclamationIcon },
    { number: 4, title: 'Financial & Safety', icon: CheckCircleIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <DocumentTextIcon className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                USDOT Application (MCS-150)
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Motor Carrier Identification Report
              </p>
            </div>
          </div>
        </div>

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
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default USDOTApplication;
