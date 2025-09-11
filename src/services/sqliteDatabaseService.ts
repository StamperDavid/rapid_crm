import initSqlJs from 'sql.js';
import { Organization, Person, Vehicle, Driver, Deal, Invoice, Lead, Campaign } from '../types/schema';

export class SQLiteDatabaseService {
  private db: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      const SQL = await initSqlJs({
        // Use local wasm file or fallback to CDN
        locateFile: file => {
          // Try local first, then fallback to CDN
          try {
            return `/node_modules/sql.js/dist/${file}`;
          } catch {
            return `https://sql.js.org/dist/${file}`;
          }
        }
      });

      // Create an in-memory database
      this.db = new SQL.Database();
      
      // Create tables (this should match your schema.sql)
      await this.createTables();
      await this.loadSeedData();
      
      this.isInitialized = true;
      console.log('✅ SQLite database initialized with', this.db.exec('SELECT COUNT(*) as count FROM companies')[0]?.values[0][0] || 0, 'companies');
    } catch (error) {
      console.error('❌ Failed to initialize SQLite database:', error);
      // Fallback to empty data instead of throwing
      this.isInitialized = true;
    }
  }

  private async createTables() {
    const schema = `
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        physical_street_address TEXT,
        physical_suite_apt TEXT,
        physical_city TEXT,
        physical_state TEXT,
        physical_country TEXT DEFAULT 'United States',
        physical_zip TEXT,
        is_mailing_address_same TEXT DEFAULT 'Yes',
        mailing_street_address TEXT,
        mailing_suite_apt TEXT,
        mailing_city TEXT,
        mailing_state TEXT,
        mailing_country TEXT DEFAULT 'United States',
        mailing_zip TEXT,
        legal_business_name TEXT NOT NULL,
        has_dba TEXT DEFAULT 'No',
        dba_name TEXT,
        business_type TEXT,
        ein TEXT,
        business_started DATE,
        classification TEXT,
        operation_type TEXT,
        interstate_intrastate TEXT,
        usdot_number TEXT,
        operation_class TEXT,
        fleet_type TEXT,
        number_of_vehicles INTEGER DEFAULT 0,
        number_of_drivers INTEGER DEFAULT 0,
        gvwr TEXT,
        vehicle_types TEXT,
        cargo_types TEXT,
        hazmat_required TEXT DEFAULT 'No',
        phmsa_work TEXT DEFAULT 'No',
        regulatory_details TEXT,
        has_duns_bradstreet_number TEXT DEFAULT 'No',
        duns_bradstreet_number TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        job_title TEXT,
        department TEXT,
        is_primary_contact INTEGER DEFAULT 0,
        preferred_contact_method TEXT DEFAULT 'Phone',
        position TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        vin TEXT NOT NULL,
        license_plate TEXT NOT NULL,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        color TEXT,
        vehicle_type TEXT NOT NULL,
        gvwr TEXT NOT NULL,
        empty_weight TEXT,
        fuel_type TEXT NOT NULL,
        registration_number TEXT,
        registration_expiry TEXT,
        insurance_provider TEXT,
        insurance_policy_number TEXT,
        insurance_expiry TEXT,
        last_inspection_date TEXT,
        next_inspection_due TEXT,
        last_maintenance_date TEXT,
        next_maintenance_due TEXT,
        has_hazmat_endorsement TEXT DEFAULT 'No',
        status TEXT DEFAULT 'Active',
        current_driver_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS drivers (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        license_number TEXT NOT NULL,
        license_class TEXT NOT NULL,
        license_expiry TEXT NOT NULL,
        medical_card_expiry TEXT NOT NULL,
        hire_date TEXT NOT NULL,
        employment_status TEXT DEFAULT 'Active',
        position TEXT DEFAULT 'Driver',
        pay_type TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS deals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        value REAL NOT NULL,
        stage TEXT NOT NULL,
        probability INTEGER DEFAULT 0,
        expected_close_date TEXT,
        actual_close_date TEXT,
        company_id TEXT NOT NULL,
        contact_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        invoice_number TEXT NOT NULL UNIQUE,
        client_name TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        due_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        company TEXT,
        job_title TEXT,
        campaign_id TEXT,
        lead_source TEXT NOT NULL,
        lead_status TEXT NOT NULL DEFAULT 'New',
        lead_score INTEGER DEFAULT 0,
        business_type TEXT,
        fleet_size INTEGER,
        operating_states TEXT,
        cargo_types TEXT,
        has_usdot INTEGER DEFAULT 0,
        usdot_number TEXT,
        budget REAL,
        timeline TEXT,
        decision_maker INTEGER DEFAULT 0,
        pain_points TEXT,
        interests TEXT,
        preferred_contact_method TEXT DEFAULT 'Phone',
        last_contact_date TEXT,
        next_follow_up_date TEXT,
        notes TEXT,
        converted_to_contact INTEGER DEFAULT 0,
        converted_to_deal INTEGER DEFAULT 0,
        conversion_date TEXT,
        conversion_value REAL,
        converted_contact_id TEXT,
        converted_deal_id TEXT,
        company_id TEXT,
        assigned_to TEXT,
        assigned_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        budget REAL,
        target_audience TEXT,
        goals TEXT,
        metrics TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `;

    this.db.exec(schema);
  }

  private async loadSeedData() {
    // Load the actual seed data from the SQLite database
    // For now, we'll add some basic test data
    const seedData = `
      INSERT INTO companies (id, legal_business_name, physical_city, physical_state, usdot_number, created_at, updated_at) VALUES
      ('1', 'Acme Transportation LLC', 'Chicago', 'IL', '123456', '2024-01-15T00:00:00.000Z', '2024-01-20T00:00:00.000Z'),
      ('2', 'Midwest Freight Solutions Inc', 'Detroit', 'MI', '789012', '2024-01-15T00:00:00.000Z', '2024-01-20T00:00:00.000Z');

      INSERT INTO leads (id, first_name, last_name, email, phone, company, lead_source, lead_status, lead_score, business_type, fleet_size, created_at, updated_at) VALUES
      ('1', 'John', 'Doe', 'john.doe@example.com', '(555) 123-4567', 'ABC Trucking', 'Website', 'New', 85, 'Carrier', 15, '2024-01-15T00:00:00.000Z', '2024-01-20T00:00:00.000Z'),
      ('2', 'Jane', 'Smith', 'jane.smith@example.com', '(555) 987-6543', 'XYZ Logistics', 'Referral', 'Contacted', 72, 'Broker', 8, '2024-01-15T00:00:00.000Z', '2024-01-20T00:00:00.000Z');

      INSERT INTO deals (id, title, description, value, stage, probability, company_id, created_at, updated_at) VALUES
      ('1', 'USDOT Registration Service', 'Complete USDOT registration for new fleet', 2500.00, 'Proposal', 75, '1', '2024-01-15T00:00:00.000Z', '2024-01-20T00:00:00.000Z'),
      ('2', 'Compliance Audit Package', 'Annual compliance audit and documentation', 5000.00, 'Negotiation', 60, '1', '2024-01-15T00:00:00.000Z', '2024-01-20T00:00:00.000Z'),
      ('3', 'Safety Training Program', 'Driver safety training and certification', 3500.00, 'Qualification', 45, '2', '2024-01-15T00:00:00.000Z', '2024-01-20T00:00:00.000Z'),
      ('4', 'Fleet Management Setup', 'Complete fleet management system setup', 8000.00, 'Closed Won', 100, '2', '2024-01-15T00:00:00.000Z', '2024-01-20T00:00:00.000Z');
    `;

    this.db.exec(seedData);
  }

  // Companies
  async getCompanies(): Promise<Organization[]> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM companies");
    return this.mapRowsToOrganizations(result[0]?.values || []);
  }

  async getCompany(id: string): Promise<Organization | null> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM companies WHERE id = ?", [id]);
    const rows = result[0]?.values || [];
    return rows.length > 0 ? this.mapRowToOrganization(rows[0]) : null;
  }

  async createCompany(company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    await this.initialize();
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO companies (id, legal_business_name, physical_city, physical_state, usdot_number, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([id, company.legalBusinessName, company.physicalCity, company.physicalState, company.usdotNumber, now, now]);
    
    return { ...company, id, createdAt: now, updatedAt: now };
  }

  async updateCompany(id: string, company: Partial<Organization>): Promise<Organization> {
    await this.initialize();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      UPDATE companies 
      SET legal_business_name = ?, physical_city = ?, physical_state = ?, usdot_number = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run([company.legalBusinessName, company.physicalCity, company.physicalState, company.usdotNumber, now, id]);
    
    const updated = await this.getCompany(id);
    if (!updated) throw new Error('Company not found');
    return updated;
  }

  async deleteCompany(id: string): Promise<boolean> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM companies WHERE id = ?");
    stmt.run([id]);
    return true;
  }

  // Contacts
  async getContacts(): Promise<Person[]> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM contacts");
    return this.mapRowsToPersons(result[0]?.values || []);
  }

  async getContact(id: string): Promise<Person | null> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM contacts WHERE id = ?", [id]);
    const rows = result[0]?.values || [];
    return rows.length > 0 ? this.mapRowToPerson(rows[0]) : null;
  }

  async createContact(contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person> {
    await this.initialize();
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO contacts (id, company_id, first_name, last_name, phone, email, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([id, contact.companyId, contact.firstName, contact.lastName, contact.phone, contact.email, now, now]);
    
    return { ...contact, id, createdAt: now, updatedAt: now };
  }

  async updateContact(id: string, contact: Partial<Person>): Promise<Person> {
    await this.initialize();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      UPDATE contacts 
      SET first_name = ?, last_name = ?, phone = ?, email = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run([contact.firstName, contact.lastName, contact.phone, contact.email, now, id]);
    
    const updated = await this.getContact(id);
    if (!updated) throw new Error('Contact not found');
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM contacts WHERE id = ?");
    stmt.run([id]);
    return true;
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM vehicles");
    return this.mapRowsToVehicles(result[0]?.values || []);
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM vehicles WHERE id = ?", [id]);
    const rows = result[0]?.values || [];
    return rows.length > 0 ? this.mapRowToVehicle(rows[0]) : null;
  }

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    await this.initialize();
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO vehicles (id, company_id, vin, license_plate, make, model, year, vehicle_type, gvwr, fuel_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([id, vehicle.companyId, vehicle.vin, vehicle.licensePlate, vehicle.make, vehicle.model, vehicle.year, vehicle.vehicleType, vehicle.gvwr, vehicle.fuelType, now, now]);
    
    return { ...vehicle, id, createdAt: now, updatedAt: now };
  }

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    await this.initialize();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      UPDATE vehicles 
      SET vin = ?, license_plate = ?, make = ?, model = ?, year = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run([vehicle.vin, vehicle.licensePlate, vehicle.make, vehicle.model, vehicle.year, now, id]);
    
    const updated = await this.getVehicle(id);
    if (!updated) throw new Error('Vehicle not found');
    return updated;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM vehicles WHERE id = ?");
    stmt.run([id]);
    return true;
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM drivers");
    return this.mapRowsToDrivers(result[0]?.values || []);
  }

  async getDriver(id: string): Promise<Driver | null> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM drivers WHERE id = ?", [id]);
    const rows = result[0]?.values || [];
    return rows.length > 0 ? this.mapRowToDriver(rows[0]) : null;
  }

  async createDriver(driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver> {
    await this.initialize();
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO drivers (id, company_id, driver_name, first_name, last_name, license_number, license_class, license_expiry, medical_card_expiry, hire_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([id, driver.companyId, driver.driverName, driver.firstName, driver.lastName, driver.licenseNumber, driver.licenseClass, driver.licenseExpiry, driver.medicalCardExpiry, driver.hireDate, now, now]);
    
    return { ...driver, id, createdAt: now, updatedAt: now };
  }

  async updateDriver(id: string, driver: Partial<Driver>): Promise<Driver> {
    await this.initialize();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      UPDATE drivers 
      SET driver_name = ?, first_name = ?, last_name = ?, license_number = ?, license_class = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run([driver.driverName, driver.firstName, driver.lastName, driver.licenseNumber, driver.licenseClass, now, id]);
    
    const updated = await this.getDriver(id);
    if (!updated) throw new Error('Driver not found');
    return updated;
  }

  async deleteDriver(id: string): Promise<boolean> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM drivers WHERE id = ?");
    stmt.run([id]);
    return true;
  }

  // Deals
  async getDeals(): Promise<Deal[]> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM deals");
    return this.mapRowsToDeals(result[0]?.values || []);
  }

  async getDeal(id: string): Promise<Deal | null> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM deals WHERE id = ?", [id]);
    const rows = result[0]?.values || [];
    return rows.length > 0 ? this.mapRowToDeal(rows[0]) : null;
  }

  async createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    await this.initialize();
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO deals (id, title, description, value, stage, probability, company_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([id, deal.title, deal.description, deal.value, deal.stage, deal.probability, deal.companyId, now, now]);
    
    return { ...deal, id, createdAt: now, updatedAt: now };
  }

  async updateDeal(id: string, deal: Partial<Deal>): Promise<Deal> {
    await this.initialize();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      UPDATE deals 
      SET title = ?, description = ?, value = ?, stage = ?, probability = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run([deal.title, deal.description, deal.value, deal.stage, deal.probability, now, id]);
    
    const updated = await this.getDeal(id);
    if (!updated) throw new Error('Deal not found');
    return updated;
  }

  async deleteDeal(id: string): Promise<boolean> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM deals WHERE id = ?");
    stmt.run([id]);
    return true;
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM invoices");
    return this.mapRowsToInvoices(result[0]?.values || []);
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM invoices WHERE id = ?", [id]);
    const rows = result[0]?.values || [];
    return rows.length > 0 ? this.mapRowToInvoice(rows[0]) : null;
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    await this.initialize();
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO invoices (id, invoice_number, client_name, amount, status, due_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([id, invoice.invoiceNumber, invoice.clientName, invoice.amount, invoice.status, invoice.dueDate, now, now]);
    
    return { ...invoice, id, createdAt: now, updatedAt: now };
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    await this.initialize();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      UPDATE invoices 
      SET invoice_number = ?, client_name = ?, amount = ?, status = ?, due_date = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run([invoice.invoiceNumber, invoice.clientName, invoice.amount, invoice.status, invoice.dueDate, now, id]);
    
    const updated = await this.getInvoice(id);
    if (!updated) throw new Error('Invoice not found');
    return updated;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM invoices WHERE id = ?");
    stmt.run([id]);
    return true;
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM leads");
    return this.mapRowsToLeads(result[0]?.values || []);
  }

  async getLead(id: string): Promise<Lead | null> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM leads WHERE id = ?", [id]);
    const rows = result[0]?.values || [];
    return rows.length > 0 ? this.mapRowToLead(rows[0]) : null;
  }

  async createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    await this.initialize();
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO leads (id, first_name, last_name, email, phone, company, lead_source, lead_status, lead_score, business_type, fleet_size, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([id, lead.firstName, lead.lastName, lead.email, lead.phone, lead.company, lead.leadSource, lead.leadStatus, lead.leadScore, lead.businessType, lead.fleetSize, now, now]);
    
    return { ...lead, id, createdAt: now, updatedAt: now };
  }

  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead> {
    await this.initialize();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      UPDATE leads 
      SET first_name = ?, last_name = ?, email = ?, phone = ?, lead_status = ?, lead_score = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run([lead.firstName, lead.lastName, lead.email, lead.phone, lead.leadStatus, lead.leadScore, now, id]);
    
    const updated = await this.getLead(id);
    if (!updated) throw new Error('Lead not found');
    return updated;
  }

  async deleteLead(id: string): Promise<boolean> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM leads WHERE id = ?");
    stmt.run([id]);
    return true;
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM campaigns");
    return this.mapRowsToCampaigns(result[0]?.values || []);
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    await this.initialize();
    const result = this.db.exec("SELECT * FROM campaigns WHERE id = ?", [id]);
    const rows = result[0]?.values || [];
    return rows.length > 0 ? this.mapRowToCampaign(rows[0]) : null;
  }

  async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    await this.initialize();
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO campaigns (id, name, description, type, status, start_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([id, campaign.name, campaign.description, campaign.type, campaign.status, campaign.startDate, now, now]);
    
    return { ...campaign, id, createdAt: now, updatedAt: now };
  }

  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    await this.initialize();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      UPDATE campaigns 
      SET name = ?, description = ?, type = ?, status = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run([campaign.name, campaign.description, campaign.type, campaign.status, now, id]);
    
    const updated = await this.getCampaign(id);
    if (!updated) throw new Error('Campaign not found');
    return updated;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    await this.initialize();
    const stmt = this.db.prepare("DELETE FROM campaigns WHERE id = ?");
    stmt.run([id]);
    return true;
  }

  // Helper methods to map database rows to TypeScript objects
  private mapRowsToOrganizations(rows: any[]): Organization[] {
    return rows.map(row => this.mapRowToOrganization(row));
  }

  private mapRowToOrganization(row: any): Organization {
    return {
      id: row[0],
      physicalStreetAddress: row[1],
      physicalSuiteApt: row[2],
      physicalCity: row[3],
      physicalState: row[4],
      physicalCountry: row[5],
      physicalZip: row[6],
      isMailingAddressSame: row[7],
      mailingStreetAddress: row[8],
      mailingSuiteApt: row[9],
      mailingCity: row[10],
      mailingState: row[11],
      mailingCountry: row[12],
      mailingZip: row[13],
      legalBusinessName: row[14],
      hasDba: row[15],
      dbaName: row[16],
      businessType: row[17],
      ein: row[18],
      businessStarted: row[19],
      classification: row[20],
      operationType: row[21],
      interstateIntrastate: row[22],
      usdotNumber: row[23],
      operationClass: row[24],
      fleetType: row[25],
      numberOfVehicles: row[26],
      numberOfDrivers: row[27],
      gvwr: row[28],
      vehicleTypes: row[29],
      cargoTypes: row[30],
      hazmatRequired: row[31],
      phmsaWork: row[32],
      regulatoryDetails: row[33],
      hasDunsBradstreetNumber: row[34],
      dunsBradstreetNumber: row[35],
      createdAt: row[36],
      updatedAt: row[37]
    };
  }

  private mapRowsToPersons(rows: any[]): Person[] {
    return rows.map(row => this.mapRowToPerson(row));
  }

  private mapRowToPerson(row: any): Person {
    return {
      id: row[0],
      companyId: row[1],
      firstName: row[2],
      lastName: row[3],
      phone: row[4],
      email: row[5],
      jobTitle: row[6],
      department: row[7],
      isPrimaryContact: Boolean(row[8]),
      preferredContactMethod: row[9],
      position: row[10],
      createdAt: row[11],
      updatedAt: row[12]
    };
  }

  private mapRowsToVehicles(rows: any[]): Vehicle[] {
    return rows.map(row => this.mapRowToVehicle(row));
  }

  private mapRowToVehicle(row: any): Vehicle {
    return {
      id: row[0],
      companyId: row[1],
      vin: row[2],
      licensePlate: row[3],
      make: row[4],
      model: row[5],
      year: row[6],
      color: row[7],
      vehicleType: row[8],
      gvwr: row[9],
      emptyWeight: row[10],
      fuelType: row[11],
      registrationNumber: row[12],
      registrationExpiry: row[13],
      insuranceProvider: row[14],
      insurancePolicyNumber: row[15],
      insuranceExpiry: row[16],
      lastInspectionDate: row[17],
      nextInspectionDue: row[18],
      lastMaintenanceDate: row[19],
      nextMaintenanceDue: row[20],
      hasHazmatEndorsement: row[21],
      status: row[22],
      currentDriverId: row[23],
      createdAt: row[24],
      updatedAt: row[25]
    };
  }

  private mapRowsToDrivers(rows: any[]): Driver[] {
    return rows.map(row => this.mapRowToDriver(row));
  }

  private mapRowToDriver(row: any): Driver {
    return {
      id: row[0],
      companyId: row[1],
      driverName: row[2],
      firstName: row[3],
      lastName: row[4],
      phone: row[5],
      email: row[6],
      licenseNumber: row[7],
      licenseClass: row[8],
      licenseExpiry: row[9],
      medicalCardExpiry: row[10],
      hireDate: row[11],
      employmentStatus: row[12],
      position: row[13],
      payType: row[14],
      createdAt: row[15],
      updatedAt: row[16]
    };
  }

  private mapRowsToDeals(rows: any[]): Deal[] {
    return rows.map(row => this.mapRowToDeal(row));
  }

  private mapRowToDeal(row: any): Deal {
    return {
      id: row[0],
      title: row[1],
      description: row[2],
      value: row[3],
      stage: row[4],
      probability: row[5],
      expectedCloseDate: row[6],
      actualCloseDate: row[7],
      companyId: row[8],
      contactId: row[9],
      createdAt: row[10],
      updatedAt: row[11]
    };
  }

  private mapRowsToInvoices(rows: any[]): Invoice[] {
    return rows.map(row => this.mapRowToInvoice(row));
  }

  private mapRowToInvoice(row: any): Invoice {
    return {
      id: row[0],
      invoiceNumber: row[1],
      clientName: row[2],
      amount: row[3],
      status: row[4],
      dueDate: row[5],
      createdAt: row[6],
      updatedAt: row[7]
    };
  }

  private mapRowsToLeads(rows: any[]): Lead[] {
    return rows.map(row => this.mapRowToLead(row));
  }

  private mapRowToLead(row: any): Lead {
    return {
      id: row[0],
      firstName: row[1],
      lastName: row[2],
      email: row[3],
      phone: row[4],
      company: row[5],
      jobTitle: row[6],
      campaignId: row[7],
      leadSource: row[8],
      leadStatus: row[9],
      leadScore: row[10],
      businessType: row[11],
      fleetSize: row[12],
      operatingStates: row[13] ? JSON.parse(row[13]) : [],
      cargoTypes: row[14] ? JSON.parse(row[14]) : [],
      hasUSDOT: Boolean(row[15]),
      usdotNumber: row[16],
      budget: row[17],
      timeline: row[18],
      decisionMaker: Boolean(row[19]),
      painPoints: row[20] ? JSON.parse(row[20]) : [],
      interests: row[21] ? JSON.parse(row[21]) : [],
      preferredContactMethod: row[22],
      lastContactDate: row[23],
      nextFollowUpDate: row[24],
      notes: row[25],
      convertedToContact: Boolean(row[26]),
      convertedToDeal: Boolean(row[27]),
      conversionDate: row[28],
      conversionValue: row[29],
      convertedContactId: row[30],
      convertedDealId: row[31],
      companyId: row[32],
      assignedTo: row[33],
      assignedDate: row[34],
      createdAt: row[35],
      updatedAt: row[36]
    };
  }

  private mapRowsToCampaigns(rows: any[]): Campaign[] {
    return rows.map(row => this.mapRowToCampaign(row));
  }

  private mapRowToCampaign(row: any): Campaign {
    return {
      id: row[0],
      name: row[1],
      description: row[2],
      type: row[3],
      status: row[4],
      startDate: row[5],
      endDate: row[6],
      budget: row[7],
      targetAudience: row[8],
      goals: row[9] ? JSON.parse(row[9]) : [],
      metrics: row[10] ? JSON.parse(row[10]) : {
        totalLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
        costPerLead: 0,
        roi: 0
      },
      createdAt: row[11],
      updatedAt: row[12]
    };
  }
}

// Export singleton instance
export const sqliteDatabaseService = new SQLiteDatabaseService();
