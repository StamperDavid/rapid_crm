import { Organization, Person, Vehicle, Driver, Deal, Invoice, Lead, Campaign, ApiKey } from '../../types/schema';
import { apiService } from '../api/ApiService';

export interface IDatabaseService {
  // Companies
  getCompanies(): Promise<Organization[]>;
  getCompany(id: string): Promise<Organization | null>;
  createCompany(company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization>;
  updateCompany(id: string, company: Partial<Organization>): Promise<Organization>;
  deleteCompany(id: string): Promise<boolean>;

  // Contacts
  getContacts(): Promise<Person[]>;
  getContact(id: string): Promise<Person | null>;
  createContact(contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person>;
  updateContact(id: string, contact: Partial<Person>): Promise<Person>;
  deleteContact(id: string): Promise<boolean>;

  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | null>;
  createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<boolean>;

  // Drivers
  getDrivers(): Promise<Driver[]>;
  getDriver(id: string): Promise<Driver | null>;
  createDriver(driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver>;
  updateDriver(id: string, driver: Partial<Driver>): Promise<Driver>;
  deleteDriver(id: string): Promise<boolean>;

  // Deals
  getDeals(): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | null>;
  createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal>;
  updateDeal(id: string, deal: Partial<Deal>): Promise<Deal>;
  deleteDeal(id: string): Promise<boolean>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | null>;
  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<boolean>;

  // Leads
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | null>;
  createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead>;
  updateLead(id: string, lead: Partial<Lead>): Promise<Lead>;
  deleteLead(id: string): Promise<boolean>;

  // Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | null>;
  createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign>;
  updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign>;
  deleteCampaign(id: string): Promise<boolean>;

  // API Keys
  getApiKeys(): Promise<ApiKey[]>;
  getApiKey(id: string): Promise<ApiKey | null>;
  createApiKey(apiKey: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiKey>;
  updateApiKey(id: string, apiKey: Partial<ApiKey>): Promise<ApiKey>;
  deleteApiKey(id: string): Promise<boolean>;
}

export class BrowserDatabaseService implements IDatabaseService {
  private apiService = apiService;

  // Companies
  async getCompanies(): Promise<Organization[]> {
    return await this.apiService.getCompanies();
  }

  async getCompany(id: string): Promise<Organization | null> {
    return await this.apiService.getCompany(id);
  }

  async createCompany(company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    return await this.apiService.createCompany(company);
  }

  async updateCompany(id: string, company: Partial<Organization>): Promise<Organization> {
    return await this.apiService.updateCompany(id, company);
  }

  async deleteCompany(id: string): Promise<boolean> {
    return await this.apiService.deleteCompany(id);
  }

  // Contacts
  async getContacts(): Promise<Person[]> {
    return await this.apiService.getContacts();
  }

  async getContact(id: string): Promise<Person | null> {
    return await this.apiService.getContact(id);
  }

  async createContact(contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person> {
    return await this.apiService.createContact(contact);
  }

  async updateContact(id: string, contact: Partial<Person>): Promise<Person> {
    return await this.apiService.updateContact(id, contact);
  }

  async deleteContact(id: string): Promise<boolean> {
    return await this.apiService.deleteContact(id);
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return await this.apiService.getVehicles();
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    return await this.apiService.getVehicle(id);
  }

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    return await this.apiService.createVehicle(vehicle);
  }

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    return await this.apiService.updateVehicle(id, vehicle);
  }

  async deleteVehicle(id: string): Promise<boolean> {
    return await this.apiService.deleteVehicle(id);
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    return await this.apiService.getDrivers();
  }

  async getDriver(id: string): Promise<Driver | null> {
    return await this.apiService.getDriver(id);
  }

  async createDriver(driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver> {
    return await this.apiService.createDriver(driver);
  }

  async updateDriver(id: string, driver: Partial<Driver>): Promise<Driver> {
    return await this.apiService.updateDriver(id, driver);
  }

  async deleteDriver(id: string): Promise<boolean> {
    return await this.apiService.deleteDriver(id);
  }

  // Deals
  async getDeals(): Promise<Deal[]> {
    return await this.apiService.getDeals();
  }

  async getDeal(id: string): Promise<Deal | null> {
    return await this.apiService.getDeal(id);
  }

  async createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    return await this.apiService.createDeal(deal);
  }

  async updateDeal(id: string, deal: Partial<Deal>): Promise<Deal> {
    return await this.apiService.updateDeal(id, deal);
  }

  async deleteDeal(id: string): Promise<boolean> {
    return await this.apiService.deleteDeal(id);
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return await this.apiService.getInvoices();
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    return await this.apiService.getInvoice(id);
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    return await this.apiService.createInvoice(invoice);
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    return await this.apiService.updateInvoice(id, invoice);
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return await this.apiService.deleteInvoice(id);
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return await this.apiService.getLeads();
  }

  async getLead(id: string): Promise<Lead | null> {
    return await this.apiService.getLead(id);
  }

  async createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    return await this.apiService.createLead(lead);
  }

  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead> {
    return await this.apiService.updateLead(id, lead);
  }

  async deleteLead(id: string): Promise<boolean> {
    return await this.apiService.deleteLead(id);
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return await this.apiService.getCampaigns();
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    return await this.apiService.getCampaign(id);
  }

  async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    return await this.apiService.createCampaign(campaign);
  }

  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    return await this.apiService.updateCampaign(id, campaign);
  }

  async deleteCampaign(id: string): Promise<boolean> {
    return await this.apiService.deleteCampaign(id);
  }

  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    return await this.apiService.getApiKeys();
  }

  async getApiKey(id: string): Promise<ApiKey | null> {
    return await this.apiService.getApiKey(id);
  }

  async createApiKey(apiKey: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiKey> {
    return await this.apiService.createApiKey(apiKey);
  }

  async updateApiKey(id: string, apiKey: Partial<ApiKey>): Promise<ApiKey> {
    return await this.apiService.updateApiKey(id, apiKey);
  }

  async deleteApiKey(id: string): Promise<boolean> {
    return await this.apiService.deleteApiKey(id);
  }
}

// Export singleton instance
export const browserDatabaseService = new BrowserDatabaseService();
