import { Organization, Person, Vehicle, Driver, Deal, Invoice } from '../types/schema';

// Database interface for CRUD operations
export interface IDatabaseService {
  // Companies
  getCompanies(): Promise<Organization[]>;
  getCompany(id: string): Promise<Organization | null>;
  createCompany(company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization>;
  updateCompany(id: string, company: Partial<Organization>): Promise<Organization>;
  deleteCompany(id: string): Promise<boolean>;

  // Contacts
  getContacts(): Promise<Person[]>;
  getContactsByCompany(companyId: string): Promise<Person[]>;
  getContact(id: string): Promise<Person | null>;
  createContact(contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person>;
  updateContact(id: string, contact: Partial<Person>): Promise<Person>;
  deleteContact(id: string): Promise<boolean>;

  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehiclesByCompany(companyId: string): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | null>;
  createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<boolean>;

  // Drivers
  getDrivers(): Promise<Driver[]>;
  getDriversByCompany(companyId: string): Promise<Driver[]>;
  getDriver(id: string): Promise<Driver | null>;
  createDriver(driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver>;
  updateDriver(id: string, driver: Partial<Driver>): Promise<Driver>;
  deleteDriver(id: string): Promise<boolean>;

  // Deals
  getDeals(): Promise<Deal[]>;
  getDealsByCompany(companyId: string): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | null>;
  createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal>;
  updateDeal(id: string, deal: Partial<Deal>): Promise<Deal>;
  deleteDeal(id: string): Promise<boolean>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoicesByCompany(companyId: string): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | null>;
  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<boolean>;

  // Utility methods
  initializeDatabase(): Promise<void>;
  closeDatabase(): Promise<void>;
}

// Browser-Compatible Database Service Implementation
// This simulates database behavior using localStorage for persistence
class BrowserDatabaseService implements IDatabaseService {
  private storageKey = 'rapid_crm_data';
  private data: {
    companies: Organization[];
    contacts: Person[];
    vehicles: Vehicle[];
    drivers: Driver[];
    deals: Deal[];
    invoices: Invoice[];
  } = {
    companies: [],
    contacts: [],
    vehicles: [],
    drivers: [],
    deals: [],
    invoices: []
  };

  constructor() {
    this.initializeDatabase();
  }

  async initializeDatabase(): Promise<void> {
    try {
      // Load data from localStorage or initialize with sample data
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.data = JSON.parse(stored);
      } else {
        await this.insertInitialData();
        this.saveToStorage();
      }
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  private async insertInitialData(): Promise<void> {
    // Sample companies
    const companies: Organization[] = [
      {
        id: '1',
        physicalStreetAddress: '123 Main St',
        physicalSuiteApt: 'Suite 100',
        physicalCity: 'Chicago',
        physicalState: 'Illinois',
        physicalCountry: 'United States',
        physicalZip: '60601',
        isMailingAddressSame: 'No',
        mailingStreetAddress: '123 Main St',
        mailingSuiteApt: 'Suite 100',
        mailingCity: 'Chicago',
        mailingState: 'Illinois',
        mailingCountry: 'United States',
        mailingZip: '60601',
        legalBusinessName: 'Acme Transportation LLC',
        hasDBA: 'Yes',
        dbaName: 'Acme Transport',
        businessType: 'LLC',
        ein: '12-3456789',
        businessStarted: '2018-03-14',
        entityTypes: ['Transportation', 'Logistics'],
        businessClassification: 'Carrier',
        transportationOperationType: 'Long-Haul',
        carriesPassengers: 'No',
        transportsGoodsForHire: 'Yes',
        engagedInInterstateCommerce: 'Yes',
        interstateIntrastate: 'Interstate',
        hasUSDOTNumber: 'Yes',
        usdotNumber: '123456',
        statesOfOperation: ['Illinois', 'Indiana', 'Wisconsin', 'Michigan'],
        operationClass: 'Class A',
        vehicleFleetType: 'Owned',
        numberOfVehicles: 12,
        numberOfDrivers: 15,
        gvwr: '80,000 lbs',
        vehicleTypesUsed: ['Trucks', 'Trailers'],
        cargoTypesTransported: 'General Freight',
        hazmatPlacardRequired: 'No',
        phmsaWork: 'No',
        additionalRegulatoryDetails: ['Vehicle Safety Standards', 'Driver Qualification Files', 'Hours of Service Compliance'],
        hasDunsBradstreetNumber: 'No',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20'
      },
      {
        id: '2',
        physicalStreetAddress: '456 Industrial Blvd',
        physicalSuiteApt: '',
        physicalCity: 'Milwaukee',
        physicalState: 'Wisconsin',
        physicalCountry: 'United States',
        physicalZip: '53201',
        isMailingAddressSame: 'Yes',
        mailingStreetAddress: '456 Industrial Blvd',
        mailingSuiteApt: '',
        mailingCity: 'Milwaukee',
        mailingState: 'Wisconsin',
        mailingCountry: 'United States',
        mailingZip: '53201',
        legalBusinessName: 'Midwest Freight Solutions Inc',
        hasDBA: 'No',
        dbaName: '',
        businessType: 'Corporation',
        ein: '98-7654321',
        businessStarted: '2015-08-22',
        entityTypes: ['Transportation', 'Brokerage'],
        businessClassification: 'Broker',
        transportationOperationType: 'Short-Haul',
        carriesPassengers: 'No',
        transportsGoodsForHire: 'Yes',
        engagedInInterstateCommerce: 'Yes',
        interstateIntrastate: 'Interstate',
        hasUSDOTNumber: 'Yes',
        usdotNumber: '789012',
        statesOfOperation: ['Wisconsin', 'Minnesota', 'Iowa'],
        operationClass: 'Class B',
        vehicleFleetType: 'Leased',
        numberOfVehicles: 8,
        numberOfDrivers: 10,
        gvwr: '26,000 lbs',
        vehicleTypesUsed: ['Box Trucks', 'Vans'],
        cargoTypesTransported: 'General Freight',
        hazmatPlacardRequired: 'No',
        phmsaWork: 'No',
        additionalRegulatoryDetails: ['Driver Qualification Files', 'Vehicle Maintenance Records'],
        hasDunsBradstreetNumber: 'No',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18'
      }
    ];

    // Sample contacts
    const contacts: Person[] = [
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
    ];

    // Sample vehicles
    const vehicles: Vehicle[] = [
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
    ];

    // Sample drivers
    const drivers: Driver[] = [
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
    ];

    this.data.companies = companies;
    this.data.contacts = contacts;
    this.data.vehicles = vehicles;
    this.data.drivers = drivers;
  }

  async closeDatabase(): Promise<void> {
    this.saveToStorage();
    console.log('Database connection closed');
  }

  // Companies
  async getCompanies(): Promise<Organization[]> {
    return [...this.data.companies];
  }

  async getCompany(id: string): Promise<Organization | null> {
    return this.data.companies.find(company => company.id === id) || null;
  }

  async createCompany(company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const now = new Date().toISOString().split('T')[0];
    const newCompany: Organization = {
      ...company,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    
    this.data.companies.push(newCompany);
    this.saveToStorage();
    return newCompany;
  }

  async updateCompany(id: string, company: Partial<Organization>): Promise<Organization> {
    const index = this.data.companies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Company not found');
    
    const updated = {
      ...this.data.companies[index],
      ...company,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    this.data.companies[index] = updated;
    this.saveToStorage();
    return updated;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const index = this.data.companies.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.data.companies.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Contacts
  async getContacts(): Promise<Person[]> {
    return [...this.data.contacts];
  }

  async getContactsByCompany(companyId: string): Promise<Person[]> {
    return this.data.contacts.filter(contact => contact.companyId === companyId);
  }

  async getContact(id: string): Promise<Person | null> {
    return this.data.contacts.find(contact => contact.id === id) || null;
  }

  async createContact(contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person> {
    const now = new Date().toISOString().split('T')[0];
    const newContact: Person = {
      ...contact,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    
    this.data.contacts.push(newContact);
    this.saveToStorage();
    return newContact;
  }

  async updateContact(id: string, contact: Partial<Person>): Promise<Person> {
    const index = this.data.contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');
    
    const updated = {
      ...this.data.contacts[index],
      ...contact,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    this.data.contacts[index] = updated;
    this.saveToStorage();
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    const index = this.data.contacts.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.data.contacts.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return [...this.data.vehicles];
  }

  async getVehiclesByCompany(companyId: string): Promise<Vehicle[]> {
    return this.data.vehicles.filter(vehicle => vehicle.companyId === companyId);
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    return this.data.vehicles.find(vehicle => vehicle.id === id) || null;
  }

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const now = new Date().toISOString().split('T')[0];
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    
    this.data.vehicles.push(newVehicle);
    this.saveToStorage();
    return newVehicle;
  }

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const index = this.data.vehicles.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Vehicle not found');
    
    const updated = {
      ...this.data.vehicles[index],
      ...vehicle,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    this.data.vehicles[index] = updated;
    this.saveToStorage();
    return updated;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const index = this.data.vehicles.findIndex(v => v.id === id);
    if (index === -1) return false;
    
    this.data.vehicles.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    return [...this.data.drivers];
  }

  async getDriversByCompany(companyId: string): Promise<Driver[]> {
    return this.data.drivers.filter(driver => driver.companyId === companyId);
  }

  async getDriver(id: string): Promise<Driver | null> {
    return this.data.drivers.find(driver => driver.id === id) || null;
  }

  async createDriver(driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver> {
    const now = new Date().toISOString().split('T')[0];
    const newDriver: Driver = {
      ...driver,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    
    this.data.drivers.push(newDriver);
    this.saveToStorage();
    return newDriver;
  }

  async updateDriver(id: string, driver: Partial<Driver>): Promise<Driver> {
    const index = this.data.drivers.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Driver not found');
    
    const updated = {
      ...this.data.drivers[index],
      ...driver,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    this.data.drivers[index] = updated;
    this.saveToStorage();
    return updated;
  }

  async deleteDriver(id: string): Promise<boolean> {
    const index = this.data.drivers.findIndex(d => d.id === id);
    if (index === -1) return false;
    
    this.data.drivers.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Deals (placeholder implementations)
  async getDeals(): Promise<Deal[]> {
    return [];
  }

  async getDealsByCompany(companyId: string): Promise<Deal[]> {
    return [];
  }

  async getDeal(id: string): Promise<Deal | null> {
    return null;
  }

  async createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    const newDeal: Deal = {
      ...deal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    return newDeal;
  }

  async updateDeal(id: string, deal: Partial<Deal>): Promise<Deal> {
    throw new Error('Not implemented');
  }

  async deleteDeal(id: string): Promise<boolean> {
    return true;
  }

  // Invoices (placeholder implementations)
  async getInvoices(): Promise<Invoice[]> {
    return [];
  }

  async getInvoicesByCompany(companyId: string): Promise<Invoice[]> {
    return [];
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    return null;
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    return newInvoice;
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    throw new Error('Not implemented');
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return true;
  }
}

// Export singleton instance
export const databaseService = new BrowserDatabaseService();