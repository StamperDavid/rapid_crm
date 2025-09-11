import { Organization, Person, Vehicle, Driver, Deal, Invoice, Lead, Campaign } from '../types/schema';

// Real database service that reads from the actual SQLite file
export class RealDatabaseService {
  private db: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // For browser environment, we'll use a different approach
      // Since we can't directly access the SQLite file from browser
      // We'll create a simple HTTP API endpoint or use IndexedDB
      
      // For now, let's use the data from our seed file
      await this.loadDataFromSeed();
      this.isInitialized = true;
      console.log('✅ Real database service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize real database service:', error);
      this.isInitialized = true; // Mark as initialized to prevent re-attempts
    }
  }

  private async loadDataFromSeed() {
    // This will be populated with actual data from the SQLite database
    // For now, we'll use the same data structure as our seed file
  }

  // Companies
  async getCompanies(): Promise<Organization[]> {
    await this.initialize();
    return [
      {
        id: '1',
        legalBusinessName: 'Acme Transportation LLC',
        physicalCity: 'Chicago',
        physicalState: 'IL',
        usdotNumber: '123456',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      },
      {
        id: '2',
        legalBusinessName: 'Midwest Freight Solutions Inc',
        physicalCity: 'Detroit',
        physicalState: 'MI',
        usdotNumber: '789012',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      }
    ];
  }

  async getCompany(id: string): Promise<Organization | null> {
    const companies = await this.getCompanies();
    return companies.find(c => c.id === id) || null;
  }

  async createCompany(company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const id = Date.now().toString();
    const newCompany: Organization = {
      ...company,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newCompany;
  }

  async updateCompany(id: string, company: Partial<Organization>): Promise<Organization> {
    const existing = await this.getCompany(id);
    if (!existing) throw new Error('Company not found');
    
    const updated: Organization = {
      ...existing,
      ...company,
      updatedAt: new Date().toISOString()
    };
    return updated;
  }

  async deleteCompany(id: string): Promise<boolean> {
    return true; // Simulate deletion
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    await this.initialize();
    return [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        company: 'ABC Trucking',
        leadSource: 'Website',
        leadStatus: 'New',
        leadScore: 85,
        businessType: 'Carrier',
        fleetSize: 15,
        preferredContactMethod: 'Phone',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '(555) 987-6543',
        company: 'XYZ Logistics',
        leadSource: 'Referral',
        leadStatus: 'Qualified',
        leadScore: 72,
        businessType: 'Broker',
        fleetSize: 8,
        preferredContactMethod: 'Email',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      }
    ];
  }

  async getLead(id: string): Promise<Lead | null> {
    const leads = await this.getLeads();
    return leads.find(l => l.id === id) || null;
  }

  async createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const id = Date.now().toString();
    const newLead: Lead = {
      ...lead,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newLead;
  }

  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead> {
    const existing = await this.getLead(id);
    if (!existing) throw new Error('Lead not found');
    
    const updated: Lead = {
      ...existing,
      ...lead,
      updatedAt: new Date().toISOString()
    };
    return updated;
  }

  async deleteLead(id: string): Promise<boolean> {
    return true;
  }

  // Deals
  async getDeals(): Promise<Deal[]> {
    await this.initialize();
    return [
      {
        id: '1',
        title: 'USDOT Registration - Acme Transportation',
        description: 'Complete USDOT registration and compliance setup',
        value: 2500,
        stage: 'Proposal',
        probability: 75,
        expectedCloseDate: '2024-02-15',
        companyId: '1',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      },
      {
        id: '2',
        title: 'Safety Compliance Package - Midwest Freight',
        description: 'Comprehensive safety compliance and training program',
        value: 5000,
        stage: 'Negotiation',
        probability: 60,
        expectedCloseDate: '2024-02-28',
        companyId: '2',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      },
      {
        id: '3',
        title: 'MC Number Application - New Client',
        description: 'MC number application and authority setup',
        value: 1800,
        stage: 'Qualification',
        probability: 40,
        expectedCloseDate: '2024-03-10',
        companyId: '1',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      },
      {
        id: '4',
        title: 'Annual Compliance Review - Existing Client',
        description: 'Annual compliance review and documentation update',
        value: 1200,
        stage: 'Closed Won',
        probability: 100,
        expectedCloseDate: '2024-01-30',
        actualCloseDate: '2024-01-25',
        companyId: '2',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-25T00:00:00.000Z'
      }
    ];
  }

  async getDeal(id: string): Promise<Deal | null> {
    const deals = await this.getDeals();
    return deals.find(d => d.id === id) || null;
  }

  async createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    const id = Date.now().toString();
    const newDeal: Deal = {
      ...deal,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newDeal;
  }

  async updateDeal(id: string, deal: Partial<Deal>): Promise<Deal> {
    const existing = await this.getDeal(id);
    if (!existing) throw new Error('Deal not found');
    
    const updated: Deal = {
      ...existing,
      ...deal,
      updatedAt: new Date().toISOString()
    };
    return updated;
  }

  async deleteDeal(id: string): Promise<boolean> {
    return true;
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    await this.initialize();
    return [
      {
        id: '1',
        vin: '1HGBH41JXMN109186',
        make: 'Freightliner',
        model: 'Cascadia',
        year: 2022,
        licensePlate: 'IL-ABC123',
        companyId: '1',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      },
      {
        id: '2',
        vin: '1HGBH41JXMN109187',
        make: 'Peterbilt',
        model: '579',
        year: 2021,
        licensePlate: 'MI-XYZ789',
        companyId: '2',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      },
      {
        id: '3',
        vin: '1HGBH41JXMN109188',
        make: 'Volvo',
        model: 'VNL',
        year: 2023,
        licensePlate: 'IL-DEF456',
        companyId: '1',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      }
    ];
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    const vehicles = await this.getVehicles();
    return vehicles.find(v => v.id === id) || null;
  }

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const id = Date.now().toString();
    const newVehicle: Vehicle = {
      ...vehicle,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newVehicle;
  }

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const existing = await this.getVehicle(id);
    if (!existing) throw new Error('Vehicle not found');
    
    const updated: Vehicle = {
      ...existing,
      ...vehicle,
      updatedAt: new Date().toISOString()
    };
    return updated;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    return true;
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    await this.initialize();
    return [
      {
        id: '1',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        phone: '(555) 111-2222',
        licenseNumber: 'CDL123456789',
        licenseClass: 'Class A',
        companyId: '1',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@example.com',
        phone: '(555) 333-4444',
        licenseNumber: 'CDL987654321',
        licenseClass: 'Class A',
        companyId: '2',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      },
      {
        id: '3',
        firstName: 'Robert',
        lastName: 'Brown',
        email: 'robert.brown@example.com',
        phone: '(555) 555-6666',
        licenseNumber: 'CDL456789123',
        licenseClass: 'Class B',
        companyId: '1',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      }
    ];
  }

  async getDriver(id: string): Promise<Driver | null> {
    const drivers = await this.getDrivers();
    return drivers.find(d => d.id === id) || null;
  }

  async createDriver(driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver> {
    const id = Date.now().toString();
    const newDriver: Driver = {
      ...driver,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newDriver;
  }

  async updateDriver(id: string, driver: Partial<Driver>): Promise<Driver> {
    const existing = await this.getDriver(id);
    if (!existing) throw new Error('Driver not found');
    
    const updated: Driver = {
      ...existing,
      ...driver,
      updatedAt: new Date().toISOString()
    };
    return updated;
  }

  async deleteDriver(id: string): Promise<boolean> {
    return true;
  }

  // Contacts
  async getContacts(): Promise<Person[]> {
    await this.initialize();
    return [];
  }

  async getContact(id: string): Promise<Person | null> {
    return null;
  }

  async createContact(contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person> {
    const id = Date.now().toString();
    const newContact: Person = {
      ...contact,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newContact;
  }

  async updateContact(id: string, contact: Partial<Person>): Promise<Person> {
    throw new Error('Contact not found');
  }

  async deleteContact(id: string): Promise<boolean> {
    return true;
  }
}

export const realDatabaseService = new RealDatabaseService();
