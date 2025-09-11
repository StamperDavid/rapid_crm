import { Organization, Person, Vehicle, Driver, Deal, Invoice, Lead, Campaign } from '../types/schema';

// Fallback database service with hardcoded data
export class FallbackDatabaseService {
  private companies: Organization[] = [
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

  private leads: Lead[] = [
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
      leadStatus: 'Contacted',
      leadScore: 72,
      businessType: 'Broker',
      fleetSize: 8,
      preferredContactMethod: 'Email',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-20T00:00:00.000Z'
    }
  ];

  private deals: Deal[] = [
    {
      id: '1',
      title: 'USDOT Registration Service',
      description: 'Complete USDOT registration for new fleet',
      value: 2500.00,
      stage: 'Proposal',
      probability: 75,
      companyId: '1',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-20T00:00:00.000Z'
    },
    {
      id: '2',
      title: 'Compliance Audit Package',
      description: 'Annual compliance audit and documentation',
      value: 5000.00,
      stage: 'Negotiation',
      probability: 60,
      companyId: '1',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-20T00:00:00.000Z'
    },
    {
      id: '3',
      title: 'Safety Training Program',
      description: 'Driver safety training and certification',
      value: 3500.00,
      stage: 'Qualification',
      probability: 45,
      companyId: '2',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-20T00:00:00.000Z'
    },
    {
      id: '4',
      title: 'Fleet Management Setup',
      description: 'Complete fleet management system setup',
      value: 8000.00,
      stage: 'Closed Won',
      probability: 100,
      companyId: '2',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-20T00:00:00.000Z'
    }
  ];

  private vehicles: Vehicle[] = [
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

  private drivers: Driver[] = [
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

  private contacts: Person[] = [];
  private invoices: Invoice[] = [];
  private campaigns: Campaign[] = [];

  // Companies
  async getCompanies(): Promise<Organization[]> {
    return [...this.companies];
  }

  async getCompany(id: string): Promise<Organization | null> {
    return this.companies.find(c => c.id === id) || null;
  }

  async createCompany(company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const newCompany = { ...company, id, createdAt: now, updatedAt: now };
    this.companies.push(newCompany);
    return newCompany;
  }

  async updateCompany(id: string, company: Partial<Organization>): Promise<Organization> {
    const index = this.companies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Company not found');
    
    const now = new Date().toISOString();
    this.companies[index] = { ...this.companies[index], ...company, updatedAt: now };
    return this.companies[index];
  }

  async deleteCompany(id: string): Promise<boolean> {
    const index = this.companies.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.companies.splice(index, 1);
    return true;
  }

  // Contacts
  async getContacts(): Promise<Person[]> {
    return [...this.contacts];
  }

  async getContact(id: string): Promise<Person | null> {
    return this.contacts.find(c => c.id === id) || null;
  }

  async createContact(contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person> {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const newContact = { ...contact, id, createdAt: now, updatedAt: now };
    this.contacts.push(newContact);
    return newContact;
  }

  async updateContact(id: string, contact: Partial<Person>): Promise<Person> {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');
    
    const now = new Date().toISOString();
    this.contacts[index] = { ...this.contacts[index], ...contact, updatedAt: now };
    return this.contacts[index];
  }

  async deleteContact(id: string): Promise<boolean> {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.contacts.splice(index, 1);
    return true;
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return [...this.vehicles];
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    return this.vehicles.find(v => v.id === id) || null;
  }

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const newVehicle = { ...vehicle, id, createdAt: now, updatedAt: now };
    this.vehicles.push(newVehicle);
    return newVehicle;
  }

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const index = this.vehicles.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Vehicle not found');
    
    const now = new Date().toISOString();
    this.vehicles[index] = { ...this.vehicles[index], ...vehicle, updatedAt: now };
    return this.vehicles[index];
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const index = this.vehicles.findIndex(v => v.id === id);
    if (index === -1) return false;
    this.vehicles.splice(index, 1);
    return true;
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    return [...this.drivers];
  }

  async getDriver(id: string): Promise<Driver | null> {
    return this.drivers.find(d => d.id === id) || null;
  }

  async createDriver(driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver> {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const newDriver = { ...driver, id, createdAt: now, updatedAt: now };
    this.drivers.push(newDriver);
    return newDriver;
  }

  async updateDriver(id: string, driver: Partial<Driver>): Promise<Driver> {
    const index = this.drivers.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Driver not found');
    
    const now = new Date().toISOString();
    this.drivers[index] = { ...this.drivers[index], ...driver, updatedAt: now };
    return this.drivers[index];
  }

  async deleteDriver(id: string): Promise<boolean> {
    const index = this.drivers.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.drivers.splice(index, 1);
    return true;
  }

  // Deals
  async getDeals(): Promise<Deal[]> {
    return [...this.deals];
  }

  async getDeal(id: string): Promise<Deal | null> {
    return this.deals.find(d => d.id === id) || null;
  }

  async createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const newDeal = { ...deal, id, createdAt: now, updatedAt: now };
    this.deals.push(newDeal);
    return newDeal;
  }

  async updateDeal(id: string, deal: Partial<Deal>): Promise<Deal> {
    const index = this.deals.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Deal not found');
    
    const now = new Date().toISOString();
    this.deals[index] = { ...this.deals[index], ...deal, updatedAt: now };
    return this.deals[index];
  }

  async deleteDeal(id: string): Promise<boolean> {
    const index = this.deals.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.deals.splice(index, 1);
    return true;
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return [...this.invoices];
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    return this.invoices.find(i => i.id === id) || null;
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const newInvoice = { ...invoice, id, createdAt: now, updatedAt: now };
    this.invoices.push(newInvoice);
    return newInvoice;
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Invoice not found');
    
    const now = new Date().toISOString();
    this.invoices[index] = { ...this.invoices[index], ...invoice, updatedAt: now };
    return this.invoices[index];
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) return false;
    this.invoices.splice(index, 1);
    return true;
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return [...this.leads];
  }

  async getLead(id: string): Promise<Lead | null> {
    return this.leads.find(l => l.id === id) || null;
  }

  async createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const newLead = { ...lead, id, createdAt: now, updatedAt: now };
    this.leads.push(newLead);
    return newLead;
  }

  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead> {
    const index = this.leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');
    
    const now = new Date().toISOString();
    this.leads[index] = { ...this.leads[index], ...lead, updatedAt: now };
    return this.leads[index];
  }

  async deleteLead(id: string): Promise<boolean> {
    const index = this.leads.findIndex(l => l.id === id);
    if (index === -1) return false;
    this.leads.splice(index, 1);
    return true;
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return [...this.campaigns];
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    return this.campaigns.find(c => c.id === id) || null;
  }

  async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const newCampaign = { ...campaign, id, createdAt: now, updatedAt: now };
    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    const index = this.campaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    
    const now = new Date().toISOString();
    this.campaigns[index] = { ...this.campaigns[index], ...campaign, updatedAt: now };
    return this.campaigns[index];
  }

  async deleteCampaign(id: string): Promise<boolean> {
    const index = this.campaigns.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.campaigns.splice(index, 1);
    return true;
  }
}

// Export singleton instance
export const fallbackDatabaseService = new FallbackDatabaseService();
