// Full code for src/services/universalDatabaseService.ts
import initSqlJs from 'sql.js';
import { v4 as uuidv4 } from 'uuid';
import { Organization, Person, Vehicle, Driver, Deal, Invoice, Lead, Campaign, ApiKey, SchemaDefinition } from '../types/schema';
import { IDatabaseService } from './database/RealDatabaseService';

// This is a placeholder for the actual database file path
// In a real application, this would be served by a backend or bundled differently
const DB_FILE_PATH = '/rapid_crm.db'; // Path to the pre-initialized database file

class UniversalDatabaseService implements IDatabaseService {
  private db: initSqlJs.Database | null = null;
  private SQL: initSqlJs.SqlJsStatic | null = null;

  constructor() {
    this.initializeDatabase();
  }

  async initializeDatabase(): Promise<void> {
    if (this.db) {
      console.log('Database already initialized.');
      return;
    }

    try {
      this.SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });

      // Fetch the pre-initialized database file
      const response = await fetch(DB_FILE_PATH);
      if (!response.ok) {
        throw new Error(`Failed to fetch database file: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      this.db = new this.SQL.Database(new Uint8Array(buffer));
      console.log('Universal Database initialized and loaded from file successfully.');
    } catch (error) {
      console.error('Failed to initialize or load universal database:', error);
      // Fallback to in-memory if file loading fails
      if (this.SQL) {
        this.db = new this.SQL.Database();
        console.warn('Falling back to in-memory database due to file loading error.');
      } else {
        console.error('sql.js not initialized, cannot create in-memory database.');
      }
    }
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('Universal Database connection closed.');
    }
  }

  private runQuery<T>(query: string, params: any[] = []): T[] {
    if (!this.db) throw new Error('Database not initialized.');
    const stmt = this.db.prepare(query);
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result as T[];
  }

  private execute(query: string, params: any[] = []): void {
    if (!this.db) throw new Error('Database not initialized.');
    this.db.run(query, params);
  }

  // Helper to convert snake_case to camelCase for frontend
  private toCamelCase<T>(obj: any): T {
    if (!obj) return obj;
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        newObj[camelKey] = obj[key];
      }
    }
    return newObj as T;
  }

  // Helper to convert camelCase to snake_case for database
  private toSnakeCase(obj: any): any {
    if (!obj) return obj;
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        newObj[snakeKey] = obj[key];
      }
    }
    return newObj;
  }

  // Companies
  async getCompanies(): Promise<Organization[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM companies');
    return rows.map(row => this.toCamelCase<Organization>(row));
  }
  async getCompany(id: string): Promise<Organization | null> {
    await this.initializeDatabase();
    const row = this.runQuery<any>('SELECT * FROM companies WHERE id = ?', [id])[0];
    return row ? this.toCamelCase<Organization>(row) : null;
  }
  async createCompany(company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    await this.initializeDatabase();
    const newId = uuidv4();
    const now = new Date().toISOString();
    const newCompany: Organization = { ...company, id: newId, createdAt: now, updatedAt: now };
    const snakeCaseCompany = this.toSnakeCase(newCompany);
    const columns = Object.keys(snakeCaseCompany).join(', ');
    const placeholders = Object.keys(snakeCaseCompany).map(() => '?').join(', ');
    this.execute(`INSERT INTO companies (${columns}) VALUES (${placeholders})`, Object.values(snakeCaseCompany));
    return newCompany;
  }
  async updateCompany(id: string, company: Partial<Organization>): Promise<Organization> {
    await this.initializeDatabase();
    const now = new Date().toISOString();
    const updatedCompany = { ...company, updatedAt: now };
    const snakeCaseUpdates = this.toSnakeCase(updatedCompany);
    const setClause = Object.keys(snakeCaseUpdates).map(key => `${key} = ?`).join(', ');
    this.execute(`UPDATE companies SET ${setClause} WHERE id = ?`, [...Object.values(snakeCaseUpdates), id]);
    const updatedRow = this.runQuery<any>('SELECT * FROM companies WHERE id = ?', [id])[0];
    if (!updatedRow) throw new Error('Company not found after update');
    return this.toCamelCase<Organization>(updatedRow);
  }
  async deleteCompany(id: string): Promise<boolean> {
    await this.initializeDatabase();
    this.execute('DELETE FROM companies WHERE id = ?', [id]);
    return true;
  }

  // Contacts
  async getContacts(): Promise<Person[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM contacts');
    return rows.map(row => this.toCamelCase<Person>(row));
  }
  async getContactsByCompany(companyId: string): Promise<Person[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM contacts WHERE company_id = ?', [companyId]);
    return rows.map(row => this.toCamelCase<Person>(row));
  }
  async getContact(id: string): Promise<Person | null> {
    await this.initializeDatabase();
    const row = this.runQuery<any>('SELECT * FROM contacts WHERE id = ?', [id])[0];
    return row ? this.toCamelCase<Person>(row) : null;
  }
  async createContact(contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person> {
    await this.initializeDatabase();
    const newId = uuidv4();
    const now = new Date().toISOString();
    const newContact: Person = { ...contact, id: newId, createdAt: now, updatedAt: now };
    const snakeCaseContact = this.toSnakeCase(newContact);
    const columns = Object.keys(snakeCaseContact).join(', ');
    const placeholders = Object.keys(snakeCaseContact).map(() => '?').join(', ');
    this.execute(`INSERT INTO contacts (${columns}) VALUES (${placeholders})`, Object.values(snakeCaseContact));
    return newContact;
  }
  async updateContact(id: string, contact: Partial<Person>): Promise<Person> {
    await this.initializeDatabase();
    const now = new Date().toISOString();
    const updatedContact = { ...contact, updatedAt: now };
    const snakeCaseUpdates = this.toSnakeCase(updatedContact);
    const setClause = Object.keys(snakeCaseUpdates).map(key => `${key} = ?`).join(', ');
    this.execute(`UPDATE contacts SET ${setClause} WHERE id = ?`, [...Object.values(snakeCaseUpdates), id]);
    const updatedRow = this.runQuery<any>('SELECT * FROM contacts WHERE id = ?', [id])[0];
    if (!updatedRow) throw new Error('Contact not found after update');
    return this.toCamelCase<Person>(updatedRow);
  }
  async deleteContact(id: string): Promise<boolean> {
    await this.initializeDatabase();
    this.execute('DELETE FROM contacts WHERE id = ?', [id]);
    return true;
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM leads');
    return rows.map(row => this.toCamelCase<Lead>(row));
  }
  async getLead(id: string): Promise<Lead | null> {
    await this.initializeDatabase();
    const row = this.runQuery<any>('SELECT * FROM leads WHERE id = ?', [id])[0];
    return row ? this.toCamelCase<Lead>(row) : null;
  }
  async createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    await this.initializeDatabase();
    const newId = uuidv4();
    const now = new Date().toISOString();
    const newLead: Lead = { ...lead, id: newId, createdAt: now, updatedAt: now };
    const snakeCaseLead = this.toSnakeCase(newLead);
    const columns = Object.keys(snakeCaseLead).join(', ');
    const placeholders = Object.keys(snakeCaseLead).map(() => '?').join(', ');
    this.execute(`INSERT INTO leads (${columns}) VALUES (${placeholders})`, Object.values(snakeCaseLead));
    return newLead;
  }
  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead> {
    await this.initializeDatabase();
    const now = new Date().toISOString();
    const updatedLead = { ...lead, updatedAt: now };
    const snakeCaseUpdates = this.toSnakeCase(updatedLead);
    const setClause = Object.keys(snakeCaseUpdates).map(key => `${key} = ?`).join(', ');
    this.execute(`UPDATE leads SET ${setClause} WHERE id = ?`, [...Object.values(snakeCaseUpdates), id]);
    const updatedRow = this.runQuery<any>('SELECT * FROM leads WHERE id = ?', [id])[0];
    if (!updatedRow) throw new Error('Lead not found after update');
    return this.toCamelCase<Lead>(updatedRow);
  }
  async deleteLead(id: string): Promise<boolean> {
    await this.initializeDatabase();
    this.execute('DELETE FROM leads WHERE id = ?', [id]);
    return true;
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM campaigns');
    return rows.map(row => this.toCamelCase<Campaign>(row));
  }
  async getCampaign(id: string): Promise<Campaign | null> {
    await this.initializeDatabase();
    const row = this.runQuery<any>('SELECT * FROM campaigns WHERE id = ?', [id])[0];
    return row ? this.toCamelCase<Campaign>(row) : null;
  }
  async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    await this.initializeDatabase();
    const newId = uuidv4();
    const now = new Date().toISOString();
    const newCampaign: Campaign = { ...campaign, id: newId, createdAt: now, updatedAt: now };
    const snakeCaseCampaign = this.toSnakeCase(newCampaign);
    const columns = Object.keys(snakeCaseCampaign).join(', ');
    const placeholders = Object.keys(snakeCaseCampaign).map(() => '?').join(', ');
    this.execute(`INSERT INTO campaigns (${columns}) VALUES (${placeholders})`, Object.values(snakeCaseCampaign));
    return newCampaign;
  }
  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    await this.initializeDatabase();
    const now = new Date().toISOString();
    const updatedCampaign = { ...campaign, updatedAt: now };
    const snakeCaseUpdates = this.toSnakeCase(updatedCampaign);
    const setClause = Object.keys(snakeCaseUpdates).map(key => `${key} = ?`).join(', ');
    this.execute(`UPDATE campaigns SET ${setClause} WHERE id = ?`, [...Object.values(snakeCaseUpdates), id]);
    const updatedRow = this.runQuery<any>('SELECT * FROM campaigns WHERE id = ?', [id])[0];
    if (!updatedRow) throw new Error('Campaign not found after update');
    return this.toCamelCase<Campaign>(updatedRow);
  }
  async deleteCampaign(id: string): Promise<boolean> {
    await this.initializeDatabase();
    this.execute('DELETE FROM campaigns WHERE id = ?', [id]);
    return true;
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM vehicles');
    return rows.map(row => this.toCamelCase<Vehicle>(row));
  }
  async getVehiclesByCompany(companyId: string): Promise<Vehicle[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM vehicles WHERE company_id = ?', [companyId]);
    return rows.map(row => this.toCamelCase<Vehicle>(row));
  }
  async getVehicle(id: string): Promise<Vehicle | null> {
    await this.initializeDatabase();
    const row = this.runQuery<any>('SELECT * FROM vehicles WHERE id = ?', [id])[0];
    return row ? this.toCamelCase<Vehicle>(row) : null;
  }
  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    await this.initializeDatabase();
    const newId = uuidv4();
    const now = new Date().toISOString();
    const newVehicle: Vehicle = { ...vehicle, id: newId, createdAt: now, updatedAt: now };
    const snakeCaseVehicle = this.toSnakeCase(newVehicle);
    const columns = Object.keys(snakeCaseVehicle).join(', ');
    const placeholders = Object.keys(snakeCaseVehicle).map(() => '?').join(', ');
    this.execute(`INSERT INTO vehicles (${columns}) VALUES (${placeholders})`, Object.values(snakeCaseVehicle));
    return newVehicle;
  }
  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    await this.initializeDatabase();
    const now = new Date().toISOString();
    const updatedVehicle = { ...vehicle, updatedAt: now };
    const snakeCaseUpdates = this.toSnakeCase(updatedVehicle);
    const setClause = Object.keys(snakeCaseUpdates).map(key => `${key} = ?`).join(', ');
    this.execute(`UPDATE vehicles SET ${setClause} WHERE id = ?`, [...Object.values(snakeCaseUpdates), id]);
    const updatedRow = this.runQuery<any>('SELECT * FROM vehicles WHERE id = ?', [id])[0];
    if (!updatedRow) throw new Error('Vehicle not found after update');
    return this.toCamelCase<Vehicle>(updatedRow);
  }
  async deleteVehicle(id: string): Promise<boolean> {
    await this.initializeDatabase();
    this.execute('DELETE FROM vehicles WHERE id = ?', [id]);
    return true;
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM drivers');
    return rows.map(row => this.toCamelCase<Driver>(row));
  }
  async getDriversByCompany(companyId: string): Promise<Driver[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM drivers WHERE company_id = ?', [companyId]);
    return rows.map(row => this.toCamelCase<Driver>(row));
  }
  async getDriver(id: string): Promise<Driver | null> {
    await this.initializeDatabase();
    const row = this.runQuery<any>('SELECT * FROM drivers WHERE id = ?', [id])[0];
    return row ? this.toCamelCase<Driver>(row) : null;
  }
  async createDriver(driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver> {
    await this.initializeDatabase();
    const newId = uuidv4();
    const now = new Date().toISOString();
    const newDriver: Driver = { ...driver, id: newId, createdAt: now, updatedAt: now };
    const snakeCaseDriver = this.toSnakeCase(newDriver);
    const columns = Object.keys(snakeCaseDriver).join(', ');
    const placeholders = Object.keys(snakeCaseDriver).map(() => '?').join(', ');
    this.execute(`INSERT INTO drivers (${columns}) VALUES (${placeholders})`, Object.values(snakeCaseDriver));
    return newDriver;
  }
  async updateDriver(id: string, driver: Partial<Driver>): Promise<Driver> {
    await this.initializeDatabase();
    const now = new Date().toISOString();
    const updatedDriver = { ...driver, updatedAt: now };
    const snakeCaseUpdates = this.toSnakeCase(updatedDriver);
    const setClause = Object.keys(snakeCaseUpdates).map(key => `${key} = ?`).join(', ');
    this.execute(`UPDATE drivers SET ${setClause} WHERE id = ?`, [...Object.values(snakeCaseUpdates), id]);
    const updatedRow = this.runQuery<any>('SELECT * FROM drivers WHERE id = ?', [id])[0];
    if (!updatedRow) throw new Error('Driver not found after update');
    return this.toCamelCase<Driver>(updatedRow);
  }
  async deleteDriver(id: string): Promise<boolean> {
    await this.initializeDatabase();
    this.execute('DELETE FROM drivers WHERE id = ?', [id]);
    return true;
  }

  // Deals
  async getDeals(): Promise<Deal[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM deals');
    return rows.map(row => this.toCamelCase<Deal>(row));
  }
  async getDealsByCompany(companyId: string): Promise<Deal[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM deals WHERE company_id = ?', [companyId]);
    return rows.map(row => this.toCamelCase<Deal>(row));
  }
  async getDeal(id: string): Promise<Deal | null> {
    await this.initializeDatabase();
    const row = this.runQuery<any>('SELECT * FROM deals WHERE id = ?', [id])[0];
    return row ? this.toCamelCase<Deal>(row) : null;
  }
  async createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    await this.initializeDatabase();
    const newId = uuidv4();
    const now = new Date().toISOString();
    const newDeal: Deal = { ...deal, id: newId, createdAt: now, updatedAt: now };
    const snakeCaseDeal = this.toSnakeCase(newDeal);
    const columns = Object.keys(snakeCaseDeal).join(', ');
    const placeholders = Object.keys(snakeCaseDeal).map(() => '?').join(', ');
    this.execute(`INSERT INTO deals (${columns}) VALUES (${placeholders})`, Object.values(snakeCaseDeal));
    return newDeal;
  }
  async updateDeal(id: string, deal: Partial<Deal>): Promise<Deal> {
    await this.initializeDatabase();
    const now = new Date().toISOString();
    const updatedDeal = { ...deal, updatedAt: now };
    const snakeCaseUpdates = this.toSnakeCase(updatedDeal);
    const setClause = Object.keys(snakeCaseUpdates).map(key => `${key} = ?`).join(', ');
    this.execute(`UPDATE deals SET ${setClause} WHERE id = ?`, [...Object.values(snakeCaseUpdates), id]);
    const updatedRow = this.runQuery<any>('SELECT * FROM deals WHERE id = ?', [id])[0];
    if (!updatedRow) throw new Error('Deal not found after update');
    return this.toCamelCase<Deal>(updatedRow);
  }
  async deleteDeal(id: string): Promise<boolean> {
    await this.initializeDatabase();
    this.execute('DELETE FROM deals WHERE id = ?', [id]);
    return true;
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM invoices');
    return rows.map(row => this.toCamelCase<Invoice>(row));
  }
  async getInvoicesByCompany(companyId: string): Promise<Invoice[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM invoices WHERE company_id = ?', [companyId]);
    return rows.map(row => this.toCamelCase<Invoice>(row));
  }
  async getInvoice(id: string): Promise<Invoice | null> {
    await this.initializeDatabase();
    const row = this.runQuery<any>('SELECT * FROM invoices WHERE id = ?', [id])[0];
    return row ? this.toCamelCase<Invoice>(row) : null;
  }
  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    await this.initializeDatabase();
    const newId = uuidv4();
    const now = new Date().toISOString();
    const newInvoice: Invoice = { ...invoice, id: newId, createdAt: now, updatedAt: now };
    const snakeCaseInvoice = this.toSnakeCase(newInvoice);
    const columns = Object.keys(snakeCaseInvoice).join(', ');
    const placeholders = Object.keys(snakeCaseInvoice).map(() => '?').join(', ');
    this.execute(`INSERT INTO invoices (${columns}) VALUES (${placeholders})`, Object.values(snakeCaseInvoice));
    return newInvoice;
  }
  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    await this.initializeDatabase();
    const now = new Date().toISOString();
    const updatedInvoice = { ...invoice, updatedAt: now };
    const snakeCaseUpdates = this.toSnakeCase(updatedInvoice);
    const setClause = Object.keys(snakeCaseUpdates).map(key => `${key} = ?`).join(', ');
    this.execute(`UPDATE invoices SET ${setClause} WHERE id = ?`, [...Object.values(snakeCaseUpdates), id]);
    const updatedRow = this.runQuery<any>('SELECT * FROM invoices WHERE id = ?', [id])[0];
    if (!updatedRow) throw new Error('Invoice not found after update');
    return this.toCamelCase<Invoice>(updatedRow);
  }
  async deleteInvoice(id: string): Promise<boolean> {
    await this.initializeDatabase();
    this.execute('DELETE FROM invoices WHERE id = ?', [id]);
    return true;
  }

  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    await this.initializeDatabase();
    const rows = this.runQuery<any>('SELECT * FROM api_keys');
    return rows.map(row => this.toCamelCase<ApiKey>(row));
  }
  async getApiKey(id: string): Promise<ApiKey | null> {
    await this.initializeDatabase();
    const row = this.runQuery<any>('SELECT * FROM api_keys WHERE id = ?', [id])[0];
    return row ? this.toCamelCase<ApiKey>(row) : null;
  }
  async createApiKey(apiKey: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiKey> {
    await this.initializeDatabase();
    const newId = uuidv4();
    const now = new Date().toISOString();
    const newApiKey: ApiKey = { ...apiKey, id: newId, createdAt: now, updatedAt: now };
    const snakeCaseApiKey = this.toSnakeCase(newApiKey);
    const columns = Object.keys(snakeCaseApiKey).join(', ');
    const placeholders = Object.keys(snakeCaseApiKey).map(() => '?').join(', ');
    this.execute(`INSERT INTO api_keys (${columns}) VALUES (${placeholders})`, Object.values(snakeCaseApiKey));
    return newApiKey;
  }
  async updateApiKey(id: string, apiKey: Partial<ApiKey>): Promise<ApiKey> {
    await this.initializeDatabase();
    const now = new Date().toISOString();
    const updatedApiKey = { ...apiKey, updatedAt: now };
    const snakeCaseUpdates = this.toSnakeCase(updatedApiKey);
    const setClause = Object.keys(snakeCaseUpdates).map(key => `${key} = ?`).join(', ');
    this.execute(`UPDATE api_keys SET ${setClause} WHERE id = ?`, [...Object.values(snakeCaseUpdates), id]);
    const updatedRow = this.runQuery<any>('SELECT * FROM api_keys WHERE id = ?', [id])[0];
    if (!updatedRow) throw new Error('API key not found after update');
    return this.toCamelCase<ApiKey>(updatedRow);
  }
  async deleteApiKey(id: string): Promise<boolean> {
    await this.initializeDatabase();
    this.execute('DELETE FROM api_keys WHERE id = ?', [id]);
    return true;
  }

  // Schemas (placeholder for now, will be integrated)
  async getSchemas(): Promise<SchemaDefinition[]> { return []; }
  async getSchema(name: string): Promise<SchemaDefinition | null> { return null; }
  async createSchema(schema: Omit<SchemaDefinition, 'id' | 'created_at' | 'updated_at'>): Promise<SchemaDefinition> { throw new Error('Not implemented'); }
  async updateSchema(name: string, schema: Partial<SchemaDefinition>): Promise<SchemaDefinition> { throw new Error('Not implemented'); }
  async deleteSchema(name: string): Promise<boolean> { return false; }
  async getTables(): Promise<string[]> { return []; }
  async getTableStructure(tableName: string): Promise<any[]> { return []; }
  async insertRecord(tableName: string, data: Record<string, any>): Promise<number> { throw new Error('Not implemented'); }
  async getRecords(tableName: string, limit = 100, offset = 0): Promise<any[]> { return []; }
  async updateRecord(tableName: string, id: number, data: Record<string, any>): Promise<boolean> { return false; }
  async deleteRecord(tableName: string, id: number): Promise<boolean> { return false; }
}

export const universalDatabaseService = new UniversalDatabaseService();
