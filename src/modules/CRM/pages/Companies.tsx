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
import { Organization, Person, Vehicle, Driver, SELECT_OPTIONS } from '../../../types/schema';

const Companies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Organization | null>(null);
  const [editingCompany, setEditingCompany] = useState<Organization | null>(null);
  const [editingContact, setEditingContact] = useState<Person | null>(null);

  // Modal states for adding related entities
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showUSDOTApplicationModal, setShowUSDOTApplicationModal] = useState(false);
  
  // Mock data for related entities
  const [contacts, setContacts] = useState<Person[]>([
    {
      id: '1',
      companyId: '1',
      firstName: 'John',
      lastName: 'Smith',
      phone: '(555) 123-4567',
      email: 'john.smith@acmetransport.com',
      preferredContactMethod: 'Phone',
      isPrimaryContact: true,
      position: 'Operations Manager',
      department: 'Operations',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      companyId: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '(555) 987-6543',
      email: 'sarah.johnson@midwestfreight.com',
      preferredContactMethod: 'Email',
      isPrimaryContact: true,
      position: 'Fleet Manager',
      department: 'Operations',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    }
  ]);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      companyId: '1',
      vin: '1HGBH41JXMN109186',
      licensePlate: 'IL-ABC123',
      make: 'Freightliner',
      model: 'Cascadia',
      year: 2020,
      color: 'White',
      vehicleType: 'Truck',
      gvwr: '80,000 lbs',
      fuelType: 'Diesel',
      status: 'Active',
      hasHazmatEndorsement: 'No',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      companyId: '1',
      vin: '1HGBH41JXMN109187',
      licensePlate: 'IL-DEF456',
      make: 'Peterbilt',
      model: '579',
      year: 2019,
      color: 'Red',
      vehicleType: 'Truck',
      gvwr: '80,000 lbs',
      fuelType: 'Diesel',
      status: 'Active',
      hasHazmatEndorsement: 'Yes',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '3',
      companyId: '2',
      vin: '1HGBH41JXMN109188',
      licensePlate: 'WI-GHI789',
      make: 'Volvo',
      model: 'VNL',
      year: 2021,
      color: 'Blue',
      vehicleType: 'Truck',
      gvwr: '26,000 lbs',
      fuelType: 'Diesel',
      status: 'Active',
      hasHazmatEndorsement: 'No',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    }
  ]);
  
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: '1',
      companyId: '1',
      driverName: 'Mike Johnson',
      firstName: 'Mike',
      lastName: 'Johnson',
      dateOfBirth: '1985-03-15',
      phone: '(555) 234-5678',
      email: 'mike.johnson@acmetransport.com',
      licenseNumber: 'D123456789',
      licenseState: 'Illinois',
      licenseClass: 'A',
      licenseExpiry: '2025-03-15',
      hasHazmatEndorsement: 'Yes',
      hasPassengerEndorsement: 'No',
      hasSchoolBusEndorsement: 'No',
      hireDate: '2020-01-15',
      employmentStatus: 'Active',
      position: 'Driver',
      payType: 'Mileage',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      companyId: '1',
      driverName: 'Lisa Brown',
      firstName: 'Lisa',
      lastName: 'Brown',
      dateOfBirth: '1988-07-22',
      phone: '(555) 345-6789',
      email: 'lisa.brown@acmetransport.com',
      licenseNumber: 'D987654321',
      licenseState: 'Illinois',
      licenseClass: 'A',
      licenseExpiry: '2026-07-22',
      hasHazmatEndorsement: 'No',
      hasPassengerEndorsement: 'No',
      hasSchoolBusEndorsement: 'No',
      hireDate: '2021-06-01',
      employmentStatus: 'Active',
      position: 'Driver',
      payType: 'Hourly',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '3',
      companyId: '2',
      driverName: 'Robert Wilson',
      firstName: 'Robert',
      lastName: 'Wilson',
      dateOfBirth: '1982-11-08',
      phone: '(555) 456-7890',
      email: 'robert.wilson@midwestfreight.com',
      licenseNumber: 'D456789123',
      licenseState: 'Wisconsin',
      licenseClass: 'B',
      licenseExpiry: '2025-11-08',
      hasHazmatEndorsement: 'No',
      hasPassengerEndorsement: 'No',
      hasSchoolBusEndorsement: 'No',
      hireDate: '2019-03-10',
      employmentStatus: 'Active',
      position: 'Driver',
      payType: 'Salary',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    }
  ]);

  // USDOT Application Records - one per company
  const [usdotApplications, setUsdotApplications] = useState<any[]>([
    {
      id: '1',
      companyId: '1',
      has_duns_bradstreet_number: 'Yes',
      legal_business_name: 'ABC Transport LLC',
      doing_business_as_name: 'ABC Trucking',
      is_principal_address_same_as_contact: 'Yes',
      principal_address_country: 'United States',
      principal_address_street: '123 Main St',
      principal_address_city: 'Chicago',
      principal_address_state: 'IL',
      principal_address_postal_code: '60601',
      principal_telephone_number: '312-555-0100',
      ein_or_ssn: '12-3456789',
      is_unit_of_government: 'No',
      form_of_business: 'limited liability company',
      ownership_and_control: 'owned/controlled by citizen of United States',
      company_contact_first_name: 'John',
      company_contact_last_name: 'Smith',
      company_contact_title: 'Owner',
      company_contact_email: 'john@abctransport.com',
      company_contact_telephone: '312-555-0100',
      will_transport_property: 'Yes',
      will_receive_compensation_for_transporting_property: 'Yes',
      type_of_property_to_transport: 'general freight',
      will_transport_non_hazardous_materials_interstate: 'Yes',
      cargo_classifications: ['general freight', 'household goods'],
      electronic_signature: 'John Smith',
      createdAt: '2023-01-15',
      updatedAt: '2023-01-15'
    }
  ]);
  
  // Primary contact for new company
  const [primaryContact, setPrimaryContact] = useState<Partial<Person>>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    preferredContactMethod: 'Phone',
    isPrimaryContact: true,
    position: '',
    department: ''
  });
  
  // Vehicles and drivers for new company creation
  const [newCompanyVehicles, setNewCompanyVehicles] = useState<Partial<Vehicle>[]>([]);
  const [newCompanyDrivers, setNewCompanyDrivers] = useState<Partial<Driver>[]>([]);
  
  // Modal states for adding vehicles/drivers during creation
  const [showAddVehicleToCreation, setShowAddVehicleToCreation] = useState(false);
  const [showAddDriverToCreation, setShowAddDriverToCreation] = useState(false);

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
    if (newCompany.legalBusinessName && newCompany.physicalStreetAddress && newCompany.physicalCity && 
        primaryContact.firstName && primaryContact.lastName && primaryContact.phone && primaryContact.email) {
      const companyId = (companies.length + 1).toString();
      
      const company: Organization = {
        id: companyId,
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
      
      // Create primary contact
      const contact: Person = {
        id: (contacts.length + 1).toString(),
        companyId: companyId,
        firstName: primaryContact.firstName!,
        lastName: primaryContact.lastName!,
        phone: primaryContact.phone!,
        email: primaryContact.email!,
        preferredContactMethod: primaryContact.preferredContactMethod!,
        isPrimaryContact: true,
        position: primaryContact.position,
        department: primaryContact.department,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      // Create vehicles
      const createdVehicles: Vehicle[] = newCompanyVehicles.map((vehicle, index) => ({
        id: (vehicles.length + index + 1).toString(),
        companyId: companyId,
        vin: vehicle.vin!,
        licensePlate: vehicle.licensePlate!,
        make: vehicle.make!,
        model: vehicle.model!,
        year: vehicle.year!,
        color: vehicle.color,
        vehicleType: vehicle.vehicleType!,
        gvwr: vehicle.gvwr!,
        emptyWeight: vehicle.emptyWeight,
        fuelType: vehicle.fuelType!,
        registrationNumber: vehicle.registrationNumber,
        registrationExpiry: vehicle.registrationExpiry,
        insuranceProvider: vehicle.insuranceProvider,
        insurancePolicyNumber: vehicle.insurancePolicyNumber,
        insuranceExpiry: vehicle.insuranceExpiry,
        lastInspectionDate: vehicle.lastInspectionDate,
        nextInspectionDue: vehicle.nextInspectionDue,
        lastMaintenanceDate: vehicle.lastMaintenanceDate,
        nextMaintenanceDue: vehicle.nextMaintenanceDue,
        hasHazmatEndorsement: vehicle.hasHazmatEndorsement!,
        status: vehicle.status!,
        currentDriverId: vehicle.currentDriverId,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }));
      
      // Create drivers
      const createdDrivers: Driver[] = newCompanyDrivers.map((driver, index) => ({
        id: (drivers.length + index + 1).toString(),
        companyId: companyId,
        driverName: `${driver.firstName} ${driver.lastName}`,
        firstName: driver.firstName!,
        lastName: driver.lastName!,
        dateOfBirth: driver.dateOfBirth!,
        ssn: driver.ssn,
        phone: driver.phone!,
        email: driver.email,
        address: driver.address,
        licenseNumber: driver.licenseNumber!,
        licenseState: driver.licenseState!,
        licenseClass: driver.licenseClass!,
        licenseExpiry: driver.licenseExpiry!,
        hasHazmatEndorsement: driver.hasHazmatEndorsement!,
        hasPassengerEndorsement: driver.hasPassengerEndorsement!,
        hasSchoolBusEndorsement: driver.hasSchoolBusEndorsement!,
        hireDate: driver.hireDate!,
        employmentStatus: driver.employmentStatus!,
        position: driver.position!,
        payType: driver.payType!,
        medicalCardNumber: driver.medicalCardNumber,
        medicalCardExpiry: driver.medicalCardExpiry,
        drugTestDate: driver.drugTestDate,
        nextDrugTestDue: driver.nextDrugTestDue,
        backgroundCheckDate: driver.backgroundCheckDate,
        nextBackgroundCheckDue: driver.nextBackgroundCheckDue,
        totalMilesDriven: driver.totalMilesDriven,
        accidentsInLast3Years: driver.accidentsInLast3Years,
        violationsInLast3Years: driver.violationsInLast3Years,
        safetyRating: driver.safetyRating,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }));
      
      setCompanies([...companies, company]);
      setContacts([...contacts, contact]);
      setVehicles([...vehicles, ...createdVehicles]);
      setDrivers([...drivers, ...createdDrivers]);
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
      setPrimaryContact({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        preferredContactMethod: 'Phone',
        isPrimaryContact: true,
        position: '',
        department: ''
      });
      setNewCompanyVehicles([]);
      setNewCompanyDrivers([]);
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
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-medium text-white">
                    {selectedCompany.legalBusinessName}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {selectedCompany.businessClassification} • {selectedCompany.transportationOperationType}
                  </p>
                </div>
                    <button
                  onClick={() => setSelectedCompany(null)}
                  className="text-gray-300 hover:text-white"
                    >
                  <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
              
              {/* Primary Contact Information */}
              {(() => {
                const primaryContact = contacts.find(c => c.companyId === selectedCompany.id && c.isPrimaryContact);
                return primaryContact ? (
                  <div className="mb-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <UserGroupIcon className="h-6 w-6 text-blue-400" />
                      <h4 className="text-lg font-medium text-white">Primary Contact</h4>
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Primary</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <span className="text-sm font-medium text-blue-300">Name:</span>
                        <p className="text-white font-medium">{primaryContact.firstName} {primaryContact.lastName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-300">Position:</span>
                        <p className="text-white">{primaryContact.position || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-300">Department:</span>
                        <p className="text-white">{primaryContact.department || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-300">Phone:</span>
                        <p className="text-white">{primaryContact.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-300">Email:</span>
                        <p className="text-white">{primaryContact.email}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-300">Preferred Contact:</span>
                        <p className="text-white">{primaryContact.preferredContactMethod}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <h4 className="text-lg font-medium text-white">No Primary Contact</h4>
                    </div>
                    <p className="text-yellow-200 text-sm mt-2">This company doesn't have a primary contact assigned. Add a contact and mark them as primary.</p>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Business Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Business Information</h4>
                  <div className="space-y-2 text-sm text-gray-200">
                    <div><span className="font-medium text-white">Legal Name:</span> {selectedCompany.legalBusinessName}</div>
                    {selectedCompany.hasDBA === 'Yes' && selectedCompany.dbaName && (
                      <div><span className="font-medium text-white">DBA:</span> {selectedCompany.dbaName}</div>
                    )}
                    <div><span className="font-medium text-white">Business Type:</span> {selectedCompany.businessType}</div>
                    <div><span className="font-medium text-white">EIN:</span> {selectedCompany.ein}</div>
                    {selectedCompany.businessStarted && (
                      <div><span className="font-medium text-white">Business Started:</span> {new Date(selectedCompany.businessStarted).toLocaleDateString()}</div>
                    )}
                </div>
                  </div>
                
                {/* Transportation Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Transportation Details</h4>
                  <div className="space-y-2 text-sm text-gray-200">
                    <div><span className="font-medium text-white">Classification:</span> {selectedCompany.businessClassification}</div>
                    <div><span className="font-medium text-white">Operation Type:</span> {selectedCompany.transportationOperationType}</div>
                    <div><span className="font-medium text-white">Interstate/Intrastate:</span> {selectedCompany.interstateIntrastate}</div>
                    {selectedCompany.usdotNumber && (
                      <div><span className="font-medium text-white">USDOT Number:</span> {selectedCompany.usdotNumber}</div>
                    )}
                    <div><span className="font-medium text-white">Operation Class:</span> {selectedCompany.operationClass}</div>
                  </div>
                    </div>
                
                {/* Fleet Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Fleet Information</h4>
                  <div className="space-y-2 text-sm text-gray-200">
                    <div><span className="font-medium text-white">Fleet Type:</span> {selectedCompany.vehicleFleetType}</div>
                    <div><span className="font-medium text-white">Number of Vehicles:</span> {selectedCompany.numberOfVehicles}</div>
                    <div><span className="font-medium text-white">Number of Drivers:</span> {selectedCompany.numberOfDrivers}</div>
                    <div><span className="font-medium text-white">GVWR:</span> {selectedCompany.gvwr}</div>
                    {selectedCompany.vehicleTypesUsed.length > 0 && (
                      <div><span className="font-medium text-white">Vehicle Types:</span> {selectedCompany.vehicleTypesUsed.join(', ')}</div>
                  )}
                </div>
              </div>
                
                {/* Cargo & Safety */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Cargo & Safety</h4>
                  <div className="space-y-2 text-sm text-gray-200">
                    <div><span className="font-medium text-white">Cargo Types:</span> {selectedCompany.cargoTypesTransported}</div>
                    <div><span className="font-medium text-white">Hazmat Required:</span> {selectedCompany.hazmatPlacardRequired}</div>
                    {selectedCompany.phmsaWork && (
                      <div><span className="font-medium text-white">PHMSA Work:</span> {selectedCompany.phmsaWork}</div>
                    )}
                    {selectedCompany.additionalRegulatoryDetails.length > 0 && (
                      <div>
                        <span className="font-medium text-white">Regulatory Details:</span>
                        <ul className="list-disc list-inside ml-2 text-gray-200">
                          {selectedCompany.additionalRegulatoryDetails.map((detail, index) => (
                            <li key={index}>{detail}</li>
          ))}
        </ul>
                      </div>
                    )}
                  </div>
                </div>
      </div>

              {/* Related Entities Section */}
              <div className="mt-8 pt-6 border-t border-gray-600">
                <h4 className="text-lg font-medium text-white mb-4">Related Entities</h4>
                
                {/* Add Entity Buttons */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                  <button
                    onClick={() => setShowAddContactModal(true)}
                    className="flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200"
                  >
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Add Contact
                  </button>
                  <button
                    onClick={() => setShowAddVehicleModal(true)}
                    className="flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200"
                  >
                    <TruckIcon className="h-5 w-5 mr-2" />
                    Add Vehicle
                  </button>
                  <button
                    onClick={() => setShowAddDriverModal(true)}
                    className="flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200"
                  >
                    <IdentificationIcon className="h-5 w-5 mr-2" />
                    Add Driver
                  </button>
                </div>

                {/* Current Vehicles */}
                {vehicles.filter(v => v.companyId === selectedCompany.id).length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-md font-medium text-white mb-3">Current Vehicles</h5>
                    <div className="space-y-2">
                      {vehicles.filter(v => v.companyId === selectedCompany.id).map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <TruckIcon className="h-5 w-5 text-gray-300" />
                            <div>
                              <p className="text-white font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                              <p className="text-gray-300 text-sm">VIN: {vehicle.vin} • License: {vehicle.licensePlate}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove ${vehicle.year} ${vehicle.make} ${vehicle.model} from ${selectedCompany.legalBusinessName}?`)) {
                                setVehicles(vehicles.filter(v => v.id !== vehicle.id));
                              }
                            }}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Remove vehicle"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Drivers */}
                {drivers.filter(d => d.companyId === selectedCompany.id).length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-md font-medium text-white mb-3">Current Drivers</h5>
                    <div className="space-y-2">
                      {drivers.filter(d => d.companyId === selectedCompany.id).map((driver) => (
                        <div key={driver.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <IdentificationIcon className="h-5 w-5 text-gray-300" />
                            <div>
                              <p className="text-white font-medium">{driver.driverName || `${driver.firstName} ${driver.lastName}`}</p>
                              <p className="text-gray-300 text-sm">License: {driver.licenseNumber} ({driver.licenseState}) • Class: {driver.licenseClass}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove ${driver.driverName || `${driver.firstName} ${driver.lastName}`} from ${selectedCompany.legalBusinessName}?`)) {
                                setDrivers(drivers.filter(d => d.id !== driver.id));
                              }
                            }}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Remove driver"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* USDOT Application Record */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-md font-medium text-white">USDOT Application Record</h5>
                    {usdotApplications.find(app => app.companyId === selectedCompany.id) ? (
                      <button
                        onClick={() => setShowUSDOTApplicationModal(true)}
                        className="flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Edit Application
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowUSDOTApplicationModal(true)}
                        className="flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Create Application
                      </button>
                    )}
                  </div>
                  
                  {usdotApplications.find(app => app.companyId === selectedCompany.id) ? (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-300" />
                        <div>
                          <p className="text-white font-medium">USDOT Application Record</p>
                          <p className="text-gray-300 text-sm">
                            Legal Name: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.legal_business_name}
                          </p>
                          <p className="text-gray-300 text-sm">
                            EIN/SSN: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.ein_or_ssn}
                          </p>
                          <p className="text-gray-300 text-sm">
                            Business Form: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.form_of_business}
                          </p>
                        </div>
                      </div>
                      
                      {/* Collapsible Detailed View */}
                      <details className="mt-4">
                        <summary className="cursor-pointer text-blue-400 hover:text-blue-300 text-sm font-medium">
                          View Complete Application Details
                        </summary>
                        <div className="mt-4 space-y-4 text-sm">
                          {/* Operation Classification Summary */}
                          <div className="border-l-2 border-blue-500 pl-4">
                            <h6 className="text-white font-medium mb-2">Operation Classification Summary</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300">
                              <div>DUNS Number: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.has_duns_bradstreet_number || 'Not provided'}</div>
                              <div>Legal Business Name: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.legal_business_name || 'Not provided'}</div>
                              <div>DBA Name: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.doing_business_as_name || 'Not provided'}</div>
                              <div>Principal Address Same as Contact: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.is_principal_address_same_as_contact || 'Not provided'}</div>
                              <div>Principal Address: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.principal_address_street || 'Not provided'}, {usdotApplications.find(app => app.companyId === selectedCompany.id)?.principal_address_city || ''}, {usdotApplications.find(app => app.companyId === selectedCompany.id)?.principal_address_state || ''} {usdotApplications.find(app => app.companyId === selectedCompany.id)?.principal_address_postal_code || ''}</div>
                              <div>Principal Country: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.principal_address_country || 'Not provided'}</div>
                              <div>Mailing Address: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.mailing_address_street || 'Not provided'}, {usdotApplications.find(app => app.companyId === selectedCompany.id)?.mailing_address_city || ''}, {usdotApplications.find(app => app.companyId === selectedCompany.id)?.mailing_address_state || ''} {usdotApplications.find(app => app.companyId === selectedCompany.id)?.mailing_address_postal_code || ''}</div>
                              <div>Mailing Country: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.mailing_address_country || 'Not provided'}</div>
                              <div>Telephone: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.principal_telephone_number || 'Not provided'}</div>
                              <div>EIN/SSN: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.ein_or_ssn || 'Not provided'}</div>
                              <div>Government Unit: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.is_unit_of_government || 'Not provided'}</div>
                              <div>Form of Business: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.form_of_business || 'Not provided'}</div>
                              <div>Ownership: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.ownership_and_control || 'Not provided'}</div>
                            </div>
                          </div>

                          {/* Company Contact Information */}
                          <div className="border-l-2 border-green-500 pl-4">
                            <h6 className="text-white font-medium mb-2">Company Contact Information</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300">
                              <div>First Name: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_first_name || 'Not provided'}</div>
                              <div>Middle Name: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_middle_name || 'Not provided'}</div>
                              <div>Last Name: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_last_name || 'Not provided'}</div>
                              <div>Suffix: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_suffix || 'Not provided'}</div>
                              <div>Title: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_title || 'Not provided'}</div>
                              <div>Email: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_email || 'Not provided'}</div>
                              <div>Phone: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_telephone || 'Not provided'}</div>
                              <div>Contact Address: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_address_street || 'Not provided'}, {usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_address_city || ''}, {usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_address_state || ''} {usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_address_postal_code || ''}</div>
                              <div>Contact Country: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_address_country || 'Not provided'}</div>
                            </div>
                          </div>

                          {/* Operation Questions */}
                          <div className="border-l-2 border-yellow-500 pl-4">
                            <h6 className="text-white font-medium mb-2">Operation Questions</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300">
                              <div>Transport Property: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_transport_property || 'Not provided'}</div>
                              <div>Receive Compensation: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_receive_compensation_for_transporting_property || 'Not provided'}</div>
                              <div>Property Type: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.type_of_property_to_transport || 'Not provided'}</div>
                              <div>Interstate Commerce: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_transport_non_hazardous_materials_interstate || 'Not provided'}</div>
                              <div>Transport Own Property: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_transport_own_property || 'Not provided'}</div>
                              <div>Transport Passengers: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_transport_passengers || 'Not provided'}</div>
                              <div>Broker Services: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_provide_broker_services || 'Not provided'}</div>
                              <div>Freight Forwarder: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_provide_freight_forwarder_services || 'Not provided'}</div>
                              <div>Cargo Tank Facility: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_operate_cargo_tank_facility || 'Not provided'}</div>
                              <div>Driveaway: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_operate_as_driveaway || 'Not provided'}</div>
                              <div>Towaway: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_operate_as_towaway || 'Not provided'}</div>
                              <div>Intermodal Equipment: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_operate_as_intermodal_equipment_provider || 'Not provided'}</div>
                            </div>
                            {usdotApplications.find(app => app.companyId === selectedCompany.id)?.cargo_classifications && (
                              <div className="mt-2">
                                <div className="text-gray-300">Cargo Classifications:</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {usdotApplications.find(app => app.companyId === selectedCompany.id)?.cargo_classifications.map((classification: string, index: number) => (
                                    <span key={index} className="bg-gray-600 text-gray-200 px-2 py-1 rounded text-xs">
                                      {classification}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Vehicle Summary */}
                          <div className="border-l-2 border-purple-500 pl-4">
                            <h6 className="text-white font-medium mb-2">Vehicle Summary</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300">
                              <div>Total Vehicles: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.total_vehicles || 'Not provided'}</div>
                              <div>Tractors: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_tractors || 'Not provided'}</div>
                              <div>Trailers: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_trailers || 'Not provided'}</div>
                              <div>Straight Trucks: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_straight_trucks || 'Not provided'}</div>
                              <div>Buses: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_buses || 'Not provided'}</div>
                              <div>Other Vehicles: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_other_vehicles || 'Not provided'}</div>
                            </div>
                          </div>

                          {/* Driver Summary */}
                          <div className="border-l-2 border-indigo-500 pl-4">
                            <h6 className="text-white font-medium mb-2">Driver Summary</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300">
                              <div>Total Drivers: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.total_drivers || 'Not provided'}</div>
                              <div>CDL Drivers: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_cdl_drivers || 'Not provided'}</div>
                              <div>Non-CDL Drivers: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_non_cdl_drivers || 'Not provided'}</div>
                              <div>Hazmat Drivers: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_hazmat_drivers || 'Not provided'}</div>
                            </div>
                          </div>

                          {/* Affiliation with Others */}
                          <div className="border-l-2 border-red-500 pl-4">
                            <h6 className="text-white font-medium mb-2">Affiliation with Others</h6>
                            <div className="text-gray-300">
                              <div>Affiliated with Other Carrier: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.is_affiliated_with_other_carrier || 'Not provided'}</div>
                              {usdotApplications.find(app => app.companyId === selectedCompany.id)?.affiliation_details && (
                                <div className="mt-1">Details: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.affiliation_details}</div>
                              )}
                            </div>
                          </div>

                          {/* Compliance Certifications */}
                          <div className="border-l-2 border-orange-500 pl-4">
                            <h6 className="text-white font-medium mb-2">Compliance Certifications</h6>
                            <div className="text-gray-300">
                              <div>Enforcement Actions: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.has_enforcement_actions || 'Not provided'}</div>
                              {usdotApplications.find(app => app.companyId === selectedCompany.id)?.enforcement_actions_details && (
                                <div className="mt-1">Details: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.enforcement_actions_details}</div>
                              )}
                              <div className="mt-2">Out-of-Service Orders: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.has_out_of_service_orders || 'Not provided'}</div>
                              {usdotApplications.find(app => app.companyId === selectedCompany.id)?.out_of_service_orders_details && (
                                <div className="mt-1">Details: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.out_of_service_orders_details}</div>
                              )}
                            </div>
                          </div>

                          {/* File Uploads */}
                          <div className="border-l-2 border-teal-500 pl-4">
                            <h6 className="text-white font-medium mb-2">File Uploads</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300">
                              <div>Drivers License Picture: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.drivers_license_picture ? 'Uploaded' : 'Not uploaded'}</div>
                              <div>Client Identity Picture: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.client_identity_picture ? 'Uploaded' : 'Not uploaded'}</div>
                            </div>
                          </div>

                          {/* Electronic Signature */}
                          <div className="border-l-2 border-gray-500 pl-4">
                            <h6 className="text-white font-medium mb-2">Electronic Signature</h6>
                            <div className="text-gray-300">
                              Signature: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.electronic_signature || 'Not provided'}
                            </div>
                          </div>
                        </div>
                      </details>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-300">
                          Created: {usdotApplications.find(app => app.companyId === selectedCompany.id)?.createdAt}
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the USDOT application record for ${selectedCompany.legalBusinessName}?`)) {
                              setUsdotApplications(usdotApplications.filter(app => app.companyId !== selectedCompany.id));
                            }
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Delete application record"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                      <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-300">No USDOT application record found</p>
                      <p className="text-gray-400 text-sm">Create one to track USDOT application data</p>
                    </div>
                  )}
                </div>

                {/* Enhanced Contacts Management */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-md font-medium text-white">Company Contacts</h5>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-300">
                        {contacts.filter(c => c.companyId === selectedCompany.id).length} contact(s)
                      </span>
                    </div>
                  </div>
                  
                  {contacts.filter(c => c.companyId === selectedCompany.id).length > 0 ? (
                    <div className="space-y-3">
                      {contacts.filter(c => c.companyId === selectedCompany.id).map((contact) => {
                        const isPrimaryContact = contact.isPrimaryContact;
                        const companyContacts = contacts.filter(c => c.companyId === selectedCompany.id);
                        const canDelete = !isPrimaryContact && companyContacts.length > 1;
                        
                        return (
                          <div key={contact.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-semibold text-sm">
                                    {contact.firstName[0]}{contact.lastName[0]}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h6 className="text-white font-medium text-lg">
                                      {contact.firstName} {contact.lastName}
                                    </h6>
                                    {isPrimaryContact && (
                                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                        Primary Contact
                                      </span>
                                    )}
                                    <span className="bg-gray-600 text-gray-200 text-xs px-2 py-1 rounded-full">
                                      {contact.preferredContactMethod}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                    <div>
                                      <span className="text-gray-400">Position:</span>
                                      <p className="text-white">{contact.position || 'Not specified'}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Department:</span>
                                      <p className="text-white">{contact.department || 'Not specified'}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Phone:</span>
                                      <p className="text-white">{contact.phone}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Email:</span>
                                      <p className="text-white break-all">{contact.email}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Preferred Contact:</span>
                                      <p className="text-white">{contact.preferredContactMethod}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Added:</span>
                                      <p className="text-white">{new Date(contact.createdAt).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => {
                                    setEditingContact(contact);
                                    setShowAddContactModal(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-600 rounded-lg transition-colors"
                                  title="Edit contact"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                
                                {!isPrimaryContact && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Make ${contact.firstName} ${contact.lastName} the primary contact for ${selectedCompany.legalBusinessName}?`)) {
                                        setContacts(contacts.map(c => 
                                          c.companyId === selectedCompany.id 
                                            ? { ...c, isPrimaryContact: c.id === contact.id }
                                            : c
                                        ));
                                      }
                                    }}
                                    className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-600 rounded-lg transition-colors"
                                    title="Make primary contact"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                )}
                                
                                {canDelete ? (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to remove ${contact.firstName} ${contact.lastName} from ${selectedCompany.legalBusinessName}?`)) {
                                        setContacts(contacts.filter(c => c.id !== contact.id));
                                      }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
                                    title="Remove contact"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <div className="p-2" title={isPrimaryContact ? "Primary contact cannot be deleted" : "Cannot delete - company must have at least one contact"}>
                                    <TrashIcon className="h-4 w-4 text-gray-500" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-gray-700 rounded-lg p-6 border border-gray-600 border-dashed">
                      <div className="text-center">
                        <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h6 className="text-white font-medium mb-2">No contacts added yet</h6>
                        <p className="text-gray-400 text-sm mb-4">
                          Add contacts to manage communication with this company
                        </p>
                        <button
                          onClick={() => setShowAddContactModal(true)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <UserGroupIcon className="h-4 w-4 mr-2" />
                          Add First Contact
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
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
              
              {/* Primary Contact Section */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Primary Contact</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add the primary contact person for this company. This will be the main point of contact for all communications.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={primaryContact.firstName || ''}
                      onChange={(e) => setPrimaryContact(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Enter first name"
                    />
                      </div>
                  
                      <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={primaryContact.lastName || ''}
                      onChange={(e) => setPrimaryContact(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Enter last name"
                    />
                      </div>
                  
                        <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Position
                    </label>
                    <input
                      type="text"
                      value={primaryContact.position || ''}
                      onChange={(e) => setPrimaryContact(prev => ({ ...prev, position: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., Operations Manager"
                    />
                        </div>
                  
                        <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={primaryContact.phone || ''}
                      onChange={(e) => setPrimaryContact(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={primaryContact.email || ''}
                      onChange={(e) => setPrimaryContact(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="contact@company.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Preferred Contact Method *
                    </label>
                    <select
                      value={primaryContact.preferredContactMethod || 'Phone'}
                      onChange={(e) => setPrimaryContact(prev => ({ ...prev, preferredContactMethod: e.target.value as any }))}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {SELECT_OPTIONS.preferredContactMethod.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                          </select>
                        </div>
                  
                        <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Department
                    </label>
                    <input
                      type="text"
                      value={primaryContact.department || ''}
                      onChange={(e) => setPrimaryContact(prev => ({ ...prev, department: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., Operations, Sales"
                    />
                        </div>
                      </div>
              </div>
              
              {/* Vehicles Section (Optional) */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex items-center justify-between mb-4">
                      <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Vehicles (Optional)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add vehicles that belong to this company. You can also add them later from the company profile.
                    </p>
                      </div>
                  <button
                    type="button"
                    onClick={() => setShowAddVehicleToCreation(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <TruckIcon className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </button>
                </div>
                
                {newCompanyVehicles.length > 0 ? (
                  <div className="space-y-3">
                    {newCompanyVehicles.map((vehicle, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-gray-100">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              VIN: {vehicle.vin} • License: {vehicle.licensePlate}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewCompanyVehicles(prev => prev.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <TruckIcon className="h-8 w-8 mx-auto mb-2" />
                    <p>No vehicles added yet</p>
                    </div>
                  )}
                </div>

              {/* Drivers Section (Optional) */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Drivers (Optional)</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add drivers that work for this company. You can also add them later from the company profile.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddDriverToCreation(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <IdentificationIcon className="h-4 w-4 mr-2" />
                    Add Driver
                  </button>
                </div>
                
                {newCompanyDrivers.length > 0 ? (
                  <div className="space-y-3">
                    {newCompanyDrivers.map((driver, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                    <div>
                            <h5 className="font-medium text-gray-900 dark:text-gray-100">
                              {driver.firstName} {driver.lastName}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              License: {driver.licenseNumber} ({driver.licenseState}) • Class: {driver.licenseClass}
                            </p>
                    </div>
                          <button
                            type="button"
                            onClick={() => setNewCompanyDrivers(prev => prev.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <IdentificationIcon className="h-8 w-8 mx-auto mb-2" />
                    <p>No drivers added yet</p>
                  </div>
                )}
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

      {/* Add Vehicle to Company Creation Modal */}
      {showAddVehicleToCreation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  Add Vehicle
                </h3>
                <button
                  onClick={() => setShowAddVehicleToCreation(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const vehicle: Partial<Vehicle> = {
                  vin: formData.get('vin') as string,
                  licensePlate: formData.get('licensePlate') as string,
                  make: formData.get('make') as string,
                  model: formData.get('model') as string,
                  year: parseInt(formData.get('year') as string),
                  color: formData.get('color') as string,
                  vehicleType: formData.get('vehicleType') as any,
                  gvwr: formData.get('gvwr') as string,
                  fuelType: formData.get('fuelType') as any,
                  status: formData.get('status') as any,
                  hasHazmatEndorsement: formData.get('hasHazmatEndorsement') as any
                };
                setNewCompanyVehicles(prev => [...prev, vehicle]);
                setShowAddVehicleToCreation(false);
              }} className="space-y-6">
                {/* Vehicle Identification */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Vehicle Identification</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">VIN *</label>
                      <input
                        type="text"
                        name="vin"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="1HGBH41JXMN109186"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Plate *</label>
                      <input
                        type="text"
                        name="licensePlate"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="ABC-1234"
                      />
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year *</label>
                      <input
                        type="number"
                        name="year"
                        required
                        min="1900"
                        max="2030"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="2023"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Make *</label>
                      <input
                        type="text"
                        name="make"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Freightliner"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model *</label>
                      <input
                        type="text"
                        name="model"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Cascadia"
                      />
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                      <input
                        type="text"
                        name="color"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="White"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Vehicle Specifications */}
                <div className="pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Vehicle Specifications</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Type *</label>
                      <select name="vehicleType" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select type</option>
                        {SELECT_OPTIONS.vehicleType.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GVWR *</label>
                      <input
                        type="text"
                        name="gvwr"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="80,000 lbs"
                      />
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fuel Type *</label>
                      <select name="fuelType" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select fuel type</option>
                        {SELECT_OPTIONS.fuelType.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status *</label>
                      <select name="status" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select status</option>
                        {SELECT_OPTIONS.vehicleStatus.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                      <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hazmat Endorsement</label>
                      <select name="hasHazmatEndorsement" className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                      </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddVehicleToCreation(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Driver to Company Creation Modal */}
      {showAddDriverToCreation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  Add Driver
                </h3>
                <button
                  onClick={() => setShowAddDriverToCreation(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const driver: Partial<Driver> = {
                  firstName: formData.get('firstName') as string,
                  lastName: formData.get('lastName') as string,
                  dateOfBirth: formData.get('dateOfBirth') as string,
                  phone: formData.get('phone') as string,
                  email: formData.get('email') as string,
                  licenseNumber: formData.get('licenseNumber') as string,
                  licenseState: formData.get('licenseState') as string,
                  licenseClass: formData.get('licenseClass') as any,
                  licenseExpiry: formData.get('licenseExpiry') as string,
                  hasHazmatEndorsement: formData.get('hasHazmatEndorsement') as any,
                  hasPassengerEndorsement: formData.get('hasPassengerEndorsement') as any,
                  hireDate: formData.get('hireDate') as string,
                  employmentStatus: formData.get('employmentStatus') as any,
                  position: formData.get('position') as any,
                  payType: formData.get('payType') as any
                };
                setNewCompanyDrivers(prev => [...prev, driver]);
                setShowAddDriverToCreation(false);
              }} className="space-y-6">
                {/* Personal Information */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth *</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="driver@company.com"
                      />
                    </div>
                  </div>
                </div>

                {/* License Information */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">License Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Number *</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="D123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License State *</label>
                      <select name="licenseState" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select state</option>
                        {SELECT_OPTIONS.states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Class *</label>
                      <select name="licenseClass" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select class</option>
                        {SELECT_OPTIONS.licenseClass.map(licenseClass => (
                          <option key={licenseClass} value={licenseClass}>{licenseClass}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Expiry *</label>
                      <input
                        type="date"
                        name="licenseExpiry"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hazmat Endorsement</label>
                      <select name="hasHazmatEndorsement" className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                    </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Passenger Endorsement</label>
                      <select name="hasPassengerEndorsement" className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Employment Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hire Date *</label>
                      <input
                        type="date"
                        name="hireDate"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employment Status *</label>
                      <select name="employmentStatus" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select status</option>
                        {SELECT_OPTIONS.employmentStatus.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                      <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position *</label>
                      <select name="position" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select position</option>
                        {SELECT_OPTIONS.position.map(position => (
                          <option key={position} value={position}>{position}</option>
                        ))}
                      </select>
                      </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pay Type *</label>
                      <select name="payType" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select pay type</option>
                        {SELECT_OPTIONS.payType.map(payType => (
                          <option key={payType} value={payType}>{payType}</option>
                        ))}
                      </select>
                  </div>
                </div>
              </div>
              
                <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={() => setShowAddDriverToCreation(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    Add Driver
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle to Existing Company Modal */}
      {showAddVehicleModal && selectedCompany && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  Add Vehicle to {selectedCompany.legalBusinessName}
                </h3>
                <button
                  onClick={() => setShowAddVehicleModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const vehicle: Vehicle = {
                  id: (vehicles.length + 1).toString(),
                  companyId: selectedCompany.id,
                  vin: formData.get('vin') as string,
                  licensePlate: formData.get('licensePlate') as string,
                  make: formData.get('make') as string,
                  model: formData.get('model') as string,
                  year: parseInt(formData.get('year') as string),
                  color: formData.get('color') as string,
                  vehicleType: formData.get('vehicleType') as any,
                  gvwr: formData.get('gvwr') as string,
                  fuelType: formData.get('fuelType') as any,
                  status: formData.get('status') as any,
                  hasHazmatEndorsement: formData.get('hasHazmatEndorsement') as any,
                  createdAt: new Date().toISOString().split('T')[0],
                  updatedAt: new Date().toISOString().split('T')[0]
                };
                setVehicles([...vehicles, vehicle]);
                setShowAddVehicleModal(false);
              }} className="space-y-6">
                {/* Vehicle Identification */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Vehicle Identification</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">VIN *</label>
                      <input
                        type="text"
                        name="vin"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="1HGBH41JXMN109186"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Plate *</label>
                      <input
                        type="text"
                        name="licensePlate"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="ABC-1234"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year *</label>
                      <input
                        type="number"
                        name="year"
                        required
                        min="1900"
                        max="2030"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="2023"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Make *</label>
                      <input
                        type="text"
                        name="make"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Freightliner"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model *</label>
                      <input
                        type="text"
                        name="model"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Cascadia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                      <input
                        type="text"
                        name="color"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="White"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Vehicle Specifications */}
                <div className="pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Vehicle Specifications</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Type *</label>
                      <select name="vehicleType" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select type</option>
                        {SELECT_OPTIONS.vehicleType.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GVWR *</label>
                      <input
                        type="text"
                        name="gvwr"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="80,000 lbs"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fuel Type *</label>
                      <select name="fuelType" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select fuel type</option>
                        {SELECT_OPTIONS.fuelType.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status *</label>
                      <select name="status" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select status</option>
                        {SELECT_OPTIONS.vehicleStatus.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hazmat Endorsement</label>
                      <select name="hasHazmatEndorsement" className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddVehicleModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Driver to Existing Company Modal */}
      {showAddDriverModal && selectedCompany && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  Add Driver to {selectedCompany.legalBusinessName}
                </h3>
                <button
                  onClick={() => setShowAddDriverModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const driver: Driver = {
                  id: (drivers.length + 1).toString(),
                  companyId: selectedCompany.id,
                  driverName: formData.get('driverName') as string,
                  firstName: formData.get('firstName') as string,
                  lastName: formData.get('lastName') as string,
                  dateOfBirth: formData.get('dateOfBirth') as string,
                  phone: formData.get('phone') as string,
                  email: formData.get('email') as string,
                  licenseNumber: formData.get('licenseNumber') as string,
                  licenseState: formData.get('licenseState') as string,
                  licenseClass: formData.get('licenseClass') as any,
                  licenseExpiry: formData.get('licenseExpiry') as string,
                  hasHazmatEndorsement: formData.get('hasHazmatEndorsement') as any,
                  hasPassengerEndorsement: formData.get('hasPassengerEndorsement') as any,
                  hireDate: formData.get('hireDate') as string,
                  employmentStatus: formData.get('employmentStatus') as any,
                  position: formData.get('position') as any,
                  payType: formData.get('payType') as any,
                  createdAt: new Date().toISOString().split('T')[0],
                  updatedAt: new Date().toISOString().split('T')[0]
                };
                setDrivers([...drivers, driver]);
                setShowAddDriverModal(false);
              }} className="space-y-6">
                {/* Driver Information */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Driver Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Driver Name *</label>
                      <input
                        type="text"
                        name="driverName"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter driver name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth *</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="driver@company.com"
                      />
                    </div>
                  </div>
                </div>

                {/* License Information */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">License Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Number *</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="D123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License State *</label>
                      <select name="licenseState" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select state</option>
                        {SELECT_OPTIONS.states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Class *</label>
                      <select name="licenseClass" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select class</option>
                        {SELECT_OPTIONS.licenseClass.map(licenseClass => (
                          <option key={licenseClass} value={licenseClass}>{licenseClass}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">License Expiry *</label>
                      <input
                        type="date"
                        name="licenseExpiry"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hazmat Endorsement</label>
                      <select name="hasHazmatEndorsement" className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Passenger Endorsement</label>
                      <select name="hasPassengerEndorsement" className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Employment Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hire Date *</label>
                      <input
                        type="date"
                        name="hireDate"
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employment Status *</label>
                      <select name="employmentStatus" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select status</option>
                        {SELECT_OPTIONS.employmentStatus.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position *</label>
                      <select name="position" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select position</option>
                        {SELECT_OPTIONS.position.map(position => (
                          <option key={position} value={position}>{position}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pay Type *</label>
                      <select name="payType" required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select pay type</option>
                        {SELECT_OPTIONS.payType.map(payType => (
                          <option key={payType} value={payType}>{payType}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddDriverModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Driver
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Contact Modal */}
      {showAddContactModal && selectedCompany && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  {editingContact ? `Edit Contact - ${editingContact.firstName} ${editingContact.lastName}` : `Add Contact to ${selectedCompany.legalBusinessName}`}
                </h3>
                <button
                  onClick={() => {
                    setShowAddContactModal(false);
                    setEditingContact(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const isNewPrimary = formData.get('isPrimaryContact') === 'true';
                const existingContacts = contacts.filter(c => c.companyId === selectedCompany.id);
                const hasExistingPrimary = existingContacts.some(c => c.isPrimaryContact);
                
                // If this is being set as primary and there's already a primary, remove primary from others
                let updatedContacts = [...contacts];
                if (isNewPrimary && hasExistingPrimary) {
                  updatedContacts = updatedContacts.map(c => 
                    c.companyId === selectedCompany.id ? { ...c, isPrimaryContact: false } : c
                  );
                }
                
                if (editingContact) {
                  // Update existing contact
                  const updatedContact: Person = {
                    ...editingContact,
                    firstName: formData.get('firstName') as string,
                    lastName: formData.get('lastName') as string,
                    phone: formData.get('phone') as string,
                    email: formData.get('email') as string,
                    preferredContactMethod: formData.get('preferredContactMethod') as any,
                    isPrimaryContact: isNewPrimary,
                    position: formData.get('position') as string,
                    department: formData.get('department') as string,
                    updatedAt: new Date().toISOString().split('T')[0]
                  };
                  
                  setContacts(updatedContacts.map(c => c.id === editingContact.id ? updatedContact : c));
                } else {
                  // Add new contact
                  const contact: Person = {
                    id: (contacts.length + 1).toString(),
                    companyId: selectedCompany.id,
                    firstName: formData.get('firstName') as string,
                    lastName: formData.get('lastName') as string,
                    phone: formData.get('phone') as string,
                    email: formData.get('email') as string,
                    preferredContactMethod: formData.get('preferredContactMethod') as any,
                    isPrimaryContact: isNewPrimary || (!hasExistingPrimary && existingContacts.length === 0), // Auto-set as primary if it's the first contact
                    position: formData.get('position') as string,
                    department: formData.get('department') as string,
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0]
                  };
                  
                  setContacts([...updatedContacts, contact]);
                }
                
                setShowAddContactModal(false);
                setEditingContact(null);
              }} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      defaultValue={editingContact?.firstName || ''}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      defaultValue={editingContact?.lastName || ''}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      defaultValue={editingContact?.phone || ''}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      defaultValue={editingContact?.email || ''}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
                    <input
                      type="text"
                      name="position"
                      defaultValue={editingContact?.position || ''}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., Operations Manager"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                    <input
                      type="text"
                      name="department"
                      defaultValue={editingContact?.department || ''}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., Operations, Sales"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Contact Method *</label>
                    <select 
                      name="preferredContactMethod" 
                      required 
                      defaultValue={editingContact?.preferredContactMethod || 'Phone'}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {SELECT_OPTIONS.preferredContactMethod.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Contact</label>
                    <select 
                      name="isPrimaryContact" 
                      defaultValue={editingContact?.isPrimaryContact ? 'true' : 'false'}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddContactModal(false);
                      setEditingContact(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingContact ? 'Update Contact' : 'Add Contact'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* USDOT Application Record Modal */}
      {showUSDOTApplicationModal && selectedCompany && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  {usdotApplications.find(app => app.companyId === selectedCompany.id) 
                    ? 'Edit USDOT Application Record' 
                    : 'Create USDOT Application Record'} for {selectedCompany.legalBusinessName}
                </h3>
                <button
                  onClick={() => setShowUSDOTApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const applicationData: any = {};
                
                // Collect all form data
                for (const [key, value] of formData.entries()) {
                  applicationData[key] = value;
                }
                
                // Add system fields
                applicationData.companyId = selectedCompany.id;
                applicationData.id = usdotApplications.find(app => app.companyId === selectedCompany.id)?.id || Date.now().toString();
                applicationData.createdAt = usdotApplications.find(app => app.companyId === selectedCompany.id)?.createdAt || new Date().toISOString().split('T')[0];
                applicationData.updatedAt = new Date().toISOString().split('T')[0];
                
                // Update or create application
                if (usdotApplications.find(app => app.companyId === selectedCompany.id)) {
                  setUsdotApplications(usdotApplications.map(app => 
                    app.companyId === selectedCompany.id ? applicationData : app
                  ));
                } else {
                  setUsdotApplications([...usdotApplications, applicationData]);
                }
                
                setShowUSDOTApplicationModal(false);
              }} className="space-y-6 max-h-[80vh] overflow-y-auto">
                
                {/* Operation Classification Summary */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Operation Classification Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Does the Applicant have a Dun and Bradstreet Number?
                      </label>
                      <select
                        name="has_duns_bradstreet_number"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.has_duns_bradstreet_number || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Legal Business Name
                      </label>
                      <input
                        type="text"
                        name="legal_business_name"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.legal_business_name || selectedCompany.legalBusinessName}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Doing Business As Name(s) (if different from Legal Business Name)
                      </label>
                      <input
                        type="text"
                        name="doing_business_as_name"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.doing_business_as_name || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Is the Applicant's Principal Place of Business Address the same as the Application Contact's Address?
                      </label>
                      <select
                        name="is_principal_address_same_as_contact"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.is_principal_address_same_as_contact || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    {/* Principal Place of Business Address */}
                    <div className="md:col-span-2">
                      <h5 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Principal Place of Business Address</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                          <input
                            type="text"
                            name="principal_address_country"
                            defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.principal_address_country || 'United States'}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address/Route Number</label>
                          <input
                            type="text"
                            name="principal_address_street"
                            defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.principal_address_street || ''}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                          <input
                            type="text"
                            name="principal_address_city"
                            defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.principal_address_city || ''}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State/Province</label>
                          <input
                            type="text"
                            name="principal_address_state"
                            defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.principal_address_state || ''}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
                          <input
                            type="text"
                            name="principal_address_postal_code"
                            defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.principal_address_postal_code || ''}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mailing Address */}
                    <div className="md:col-span-2">
                      <h5 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Mailing Address</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                          <input
                            type="text"
                            name="mailing_address_country"
                            defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.mailing_address_country || ''}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address/Route Number</label>
                          <input
                            type="text"
                            name="mailing_address_street"
                            defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.mailing_address_street || ''}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                          <input
                            type="text"
                            name="mailing_address_city"
                            defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.mailing_address_city || ''}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State/Province</label>
                          <input
                            type="text"
                            name="mailing_address_state"
                            defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.mailing_address_state || ''}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
                          <input
                            type="text"
                            name="mailing_address_postal_code"
                            defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.mailing_address_postal_code || ''}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Principal Place of Business Telephone Number
                      </label>
                      <input
                        type="tel"
                        name="principal_telephone_number"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.principal_telephone_number || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Employer Identification Number (EIN) or Social Security Number (SSN)
                      </label>
                      <input
                        type="text"
                        name="ein_or_ssn"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.ein_or_ssn || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Is the Applicant a Unit of Government?
                      </label>
                      <select
                        name="is_unit_of_government"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.is_unit_of_government || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Form of Business (Select the business form that applies)
                      </label>
                      <select
                        name="form_of_business"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.form_of_business || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="sole proprietor">Sole Proprietor</option>
                        <option value="partnership">Partnership</option>
                        <option value="limited liability company">Limited Liability Company</option>
                        <option value="Corporation (State of Incorporation)">Corporation (State of Incorporation)</option>
                        <option value="Limited Liability Partnership">Limited Liability Partnership</option>
                        <option value="Trusts">Trusts</option>
                        <option value="Other Form Of Business">Other Form Of Business</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ownership and Control
                      </label>
                      <select
                        name="ownership_and_control"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.ownership_and_control || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="owned/controlled by citizen of United States">Owned/Controlled by Citizen of United States</option>
                        <option value="owned/controlled by citizen of Canada">Owned/Controlled by Citizen of Canada</option>
                        <option value="owned/controlled by citizen of Mexico">Owned/Controlled by Citizen of Mexico</option>
                        <option value="owned/controlled by citizen of other foreign country">Owned/Controlled by Citizen of Other Foreign Country</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Company Contact Information */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Company Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Contact - First Name
                      </label>
                      <input
                        type="text"
                        name="company_contact_first_name"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_first_name || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Contact - Middle Name
                      </label>
                      <input
                        type="text"
                        name="company_contact_middle_name"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_middle_name || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Contact - Last Name
                      </label>
                      <input
                        type="text"
                        name="company_contact_last_name"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_last_name || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Contact - Suffix
                      </label>
                      <input
                        type="text"
                        name="company_contact_suffix"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_suffix || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Official's Title
                      </label>
                      <input
                        type="text"
                        name="company_contact_title"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_title || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Contact - Email
                      </label>
                      <input
                        type="email"
                        name="company_contact_email"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_email || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Contact - Telephone Number
                      </label>
                      <input
                        type="tel"
                        name="company_contact_telephone"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_telephone || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>
                  </div>

                  {/* Company Contact Address */}
                  <div className="mt-6">
                    <h5 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Company Contact Address</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                        <input
                          type="text"
                          name="company_contact_address_country"
                          defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_address_country || ''}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address/Route Number</label>
                        <input
                          type="text"
                          name="company_contact_address_street"
                          defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_address_street || ''}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                        <input
                          type="text"
                          name="company_contact_address_city"
                          defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_address_city || ''}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State/Province</label>
                        <input
                          type="text"
                          name="company_contact_address_state"
                          defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_address_state || ''}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
                        <input
                          type="text"
                          name="company_contact_address_postal_code"
                          defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.company_contact_address_postal_code || ''}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operation Questions */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Operation Questions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Will the Applicant operate as an Intermodal Equipment Provider?
                      </label>
                      <select
                        name="will_operate_as_intermodal_equipment_provider"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_operate_as_intermodal_equipment_provider || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Will the Applicant transport Property?
                      </label>
                      <select
                        name="will_transport_property"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_transport_property || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Will the Applicant receive compensation for transporting property belonging to others?
                      </label>
                      <select
                        name="will_receive_compensation_for_transporting_property"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_receive_compensation_for_transporting_property || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        What type of Property will the Applicant transport?
                      </label>
                      <select
                        name="type_of_property_to_transport"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.type_of_property_to_transport || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="hazardous materials">Hazardous Materials</option>
                        <option value="household goods">Household Goods</option>
                        <option value="exempt commodities">Exempt Commodities</option>
                        <option value="Other non hazardous freight">Other Non-Hazardous Freight</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Will the Applicant transport Non-Hazardous Materials across state lines (Interstate Commerce)?
                      </label>
                      <select
                        name="will_transport_non_hazardous_materials_interstate"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_transport_non_hazardous_materials_interstate || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Will the Applicant transport their own property?
                      </label>
                      <select
                        name="will_transport_own_property"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_transport_own_property || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Will the Applicant transport any Passengers?
                      </label>
                      <select
                        name="will_transport_passengers"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_transport_passengers || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Will the Applicant provide Property or Household Goods (HHG) Broker services?
                      </label>
                      <select
                        name="will_provide_broker_services"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_provide_broker_services || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Will the Applicant provide Freight Forwarder services?
                      </label>
                      <select
                        name="will_provide_freight_forwarder_services"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_provide_freight_forwarder_services || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Will the Applicant operate a Cargo Tank Facility?
                      </label>
                      <select
                        name="will_operate_cargo_tank_facility"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_operate_cargo_tank_facility || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Will the Applicant operate as a Driveaway?
                      </label>
                      <select
                        name="will_operate_as_driveaway"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_operate_as_driveaway || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Will the Applicant operate as a Towaway?
                      </label>
                      <select
                        name="will_operate_as_towaway"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.will_operate_as_towaway || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Please select all classifications of cargo that the Applicant will transport or handle
                      </label>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['general freight', 'drive away/tow away', 'Machinery & large objects', 'household goods', 'metal: sheets coils rolls', 'motor vehicles', 'Logs Poles Beams Lumber', 'Building Materials', 'Mobile Homes', 'Fresh Produce', 'Liquids & Gases', 'Intermodal Containers', 'Passengers', 'Oil Field Equipment', 'livestock', 'grain feed hay', 'coal/coke', 'meat', 'garbage/refuse/trash', 'US Mail', 'Commodities Dry Bulk', 'Refrigerated Food', 'Beverages', 'Paper Product', 'Utility', 'Farm Supplies', 'Construction', 'Water Well', 'Other'].map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              name="cargo_classifications"
                              value={option}
                              defaultChecked={usdotApplications.find(app => app.companyId === selectedCompany.id)?.cargo_classifications?.includes(option) || false}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Summary */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Vehicle Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Number of Vehicles
                      </label>
                      <input
                        type="number"
                        name="total_vehicles"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.total_vehicles || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Number of Tractors
                      </label>
                      <input
                        type="number"
                        name="number_of_tractors"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_tractors || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Number of Trailers
                      </label>
                      <input
                        type="number"
                        name="number_of_trailers"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_trailers || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Number of Straight Trucks
                      </label>
                      <input
                        type="number"
                        name="number_of_straight_trucks"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_straight_trucks || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Number of Buses
                      </label>
                      <input
                        type="number"
                        name="number_of_buses"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_buses || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Number of Other Vehicles
                      </label>
                      <input
                        type="number"
                        name="number_of_other_vehicles"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_other_vehicles || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Driver Summary */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Driver Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Number of Drivers
                      </label>
                      <input
                        type="number"
                        name="total_drivers"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.total_drivers || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Number of CDL Drivers
                      </label>
                      <input
                        type="number"
                        name="number_of_cdl_drivers"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_cdl_drivers || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Number of Non-CDL Drivers
                      </label>
                      <input
                        type="number"
                        name="number_of_non_cdl_drivers"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_non_cdl_drivers || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Number of Hazmat Drivers
                      </label>
                      <input
                        type="number"
                        name="number_of_hazmat_drivers"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.number_of_hazmat_drivers || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Affiliation with Others Summary */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Affiliation with Others Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Is the Applicant affiliated with any other motor carrier?
                      </label>
                      <select
                        name="is_affiliated_with_other_carrier"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.is_affiliated_with_other_carrier || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        If yes, provide details
                      </label>
                      <textarea
                        name="affiliation_details"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.affiliation_details || ''}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Describe affiliation details..."
                      />
                    </div>
                  </div>
                </div>

                {/* Compliance Certifications Summary */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Compliance Certifications Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Has the Applicant been subject to any enforcement actions?
                      </label>
                      <select
                        name="has_enforcement_actions"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.has_enforcement_actions || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        If yes, provide details
                      </label>
                      <textarea
                        name="enforcement_actions_details"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.enforcement_actions_details || ''}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Describe enforcement actions..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Has the Applicant been subject to any out-of-service orders?
                      </label>
                      <select
                        name="has_out_of_service_orders"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.has_out_of_service_orders || ''}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        If yes, provide details
                      </label>
                      <textarea
                        name="out_of_service_orders_details"
                        defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.out_of_service_orders_details || ''}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Describe out-of-service orders..."
                      />
                    </div>
                  </div>
                </div>

                {/* File Uploads */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">File Uploads</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Drivers License Picture
                      </label>
                      <input
                        type="file"
                        name="drivers_license_picture"
                        accept="image/*"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Client Identity Picture
                      </label>
                      <input
                        type="file"
                        name="client_identity_picture"
                        accept="image/*"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Electronic Signature */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Electronic Signature</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Electronic Signature (Applicant's First Name and Last Name)
                    </label>
                    <input
                      type="text"
                      name="electronic_signature"
                      defaultValue={usdotApplications.find(app => app.companyId === selectedCompany.id)?.electronic_signature || ''}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUSDOTApplicationModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {usdotApplications.find(app => app.companyId === selectedCompany.id) ? 'Update Application' : 'Create Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;