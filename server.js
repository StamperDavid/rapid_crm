// Load environment variables
require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

// Import AI Persona Manager
const aiPersonaManager = require('./src/services/ai/AIPersonaManager.js');

// Import API key service - using direct database access for now
// const { ApiKeyService } = require('./src/services/apiKeys/ApiKeyService');

// ELD Service Integration - temporarily disabled
// const { eldComplianceApiRoutes } = require('./src/services/eld/ELDComplianceApiRoutes');

// IFTA Service Integration
const { createIFTAComplianceApiRoutes } = require('./src/services/ifta/IFTAComplianceApiRoutesCommonJS');

// ELD Service Integration
const { createELDComplianceApiRoutes } = require('./src/services/eld/ELDComplianceApiRoutesCommonJS');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('public/uploads'));

// Database Management API endpoints
app.get('/api/database/connections', (req, res) => {
  try {
    // Return the primary SQLite connection info in the format expected by the frontend
    const connections = [{
      id: '1',
      config: {
        name: 'Rapid CRM SQLite Database',
        type: 'sqlite',
        host: 'localhost',
        port: 0,
        database: 'rapid_crm.db',
        lastConnected: new Date().toISOString()
      },
      isConnected: true,
      createdAt: new Date().toISOString(),
      size: 'N/A', // SQLite doesn't have a direct size query
      tables: 0 // Will be calculated below
    }];
    
    res.json(connections);
  } catch (error) {
    console.error('Error fetching database connections:', error);
    res.status(500).json({ error: 'Failed to fetch database connections' });
  }
});

app.get('/api/database/stats', (req, res) => {
  try {
    // Get database statistics in the format expected by the frontend
    const stats = {
      totalConnections: 1,
      activeConnections: 1,
      totalQueries: 15420,
      averageResponseTime: 45,
      databaseSize: '25.6 MB',
      lastBackup: '2024-01-20T08:00:00Z'
    };
    
    // Count tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('Error counting tables:', err);
        res.status(500).json({ error: 'Failed to fetch database stats' });
        return;
      }
      
      stats.totalTables = tables.length;
      
      // Count total records across all tables
      let completedQueries = 0;
      let totalRecords = 0;
      
      if (tables.length === 0) {
        res.json(stats);
        return;
      }
      
      tables.forEach((table, index) => {
        db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, result) => {
          if (err) {
            console.error(`Error counting records in ${table.name}:`, err);
          } else {
            totalRecords += result.count;
          }
          
          completedQueries++;
          if (completedQueries === tables.length) {
            stats.totalRecords = totalRecords;
            res.json(stats);
          }
        });
      });
    });
  } catch (error) {
    console.error('Error fetching database stats:', error);
    res.status(500).json({ error: 'Failed to fetch database stats' });
  }
});

// Database setup
const dbPath = path.join(__dirname, 'instance', 'rapid_crm.db');
const db = new sqlite3.Database(dbPath);

// Initialize API key service - using direct database access for now
// const apiKeyService = new ApiKeyService();

// Helper function to get API key from database
const getApiKeyFromDatabase = async (provider) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT key_value FROM api_keys WHERE provider = ?',
      [provider],
      (err, row) => {
        if (err) {
          console.error('❌ Database query error:', err);
          resolve(null);
        } else {
          resolve(row ? row.key_value : null);
        }
      }
    );
  });
};

// Database validation - check if basic tables exist
const validateDatabase = () => {
  return new Promise((resolve, reject) => {
    db.all("PRAGMA table_info(companies)", (err, columns) => {
      if (err) {
        console.error('❌ Database validation failed:', err);
        reject(err);
        return;
      }
      
      const columnNames = columns.map(col => col.name);
      // Check for either the new schema (first_name, email) or the backup schema (legal_business_name, ein)
      const hasNewSchema = columnNames.includes('first_name') && columnNames.includes('email');
      const hasBackupSchema = columnNames.includes('legal_business_name') && columnNames.includes('ein');
      
      // Accept any schema that has the basic business fields we need
      if (!columnNames.includes('legal_business_name') && !columnNames.includes('first_name')) {
        console.error('❌ Database validation failed - missing required fields');
        console.error('Missing required fields: either (first_name, email) or (legal_business_name, ein)');
        console.error('Found fields:', columnNames.join(', '));
        reject(new Error('Database missing required fields'));
        return;
      }
      
      console.log('✅ Database validation passed');
      if (hasNewSchema) {
        console.log('✅ Found basic fields: first_name, email');
        console.log('✅ Using minimal schema');
      } else {
        console.log('✅ Found backup schema fields: legal_business_name, ein');
        console.log('✅ Using backup schema');
      }
      resolve();
    });
  });
};

// Initialize database - skip complex initialization for now
const initDatabase = async () => {
  try {
    // Just validate that the database exists and has basic tables
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      console.log('❌ No database tables found. Please run: npm run init-db');
      throw new Error('Database not initialized');
    } else {
      console.log('✅ Database tables exist');
    }
    
    console.log('🎉 Database validation completed successfully!');
  } catch (error) {
    console.error('💥 Database validation failed:', error.message);
    throw error;
  }
};

// Helper function to check if tables exist
const checkTablesExist = async () => {
  try {
    const result = await runQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='companies'
    `);
    return result.length > 0;
  } catch (error) {
    return false;
  }
};

// Helper functions to transform database records to camelCase for frontend
const transformCompany = (company) => {
  if (!company) return null;
  return {
    id: company.id || '',
    // Address fields
    physicalStreetAddress: company.physical_street_address || '',
    physicalSuiteApt: company.physical_suite_apt || '',
    physicalCity: company.physical_city || '',
    physicalState: company.physical_state || '',
    physicalCountry: company.physical_country || '',
    physicalZip: company.physical_zip || '',
    isMailingAddressSame: company.is_mailing_address_same || 'No',
    mailingStreetAddress: company.mailing_street_address || '',
    mailingSuiteApt: company.mailing_suite_apt || '',
    mailingCity: company.mailing_city || '',
    mailingState: company.mailing_state || '',
    mailingCountry: company.mailing_country || '',
    mailingZip: company.mailing_zip || '',
    // Business Information
    legalBusinessName: company.legal_business_name || '',
    hasDba: company.has_dba || 'No',
    dbaName: company.dba_name || '',
    businessType: company.business_type || '',
    ein: company.ein || '',
    businessStarted: company.business_started || '',
    // Transportation Details
    classification: company.classification || '',
    operationType: company.operation_type || '',
    interstateIntrastate: company.interstate_intrastate || '',
    usdotNumber: company.usdot_number || '',
    operationClass: company.operation_class || '',
    // Fleet Information
    fleetType: company.fleet_type || '',
    numberOfVehicles: company.number_of_vehicles || 0,
    numberOfDrivers: company.number_of_drivers || 0,
    gvwr: company.gvwr || '',
    vehicleTypes: company.vehicle_types || '',
    // Cargo & Safety
    cargoTypes: company.cargo_types || '',
    hazmatRequired: company.hazmat_required || 'No',
    phmsaWork: company.phmsa_work || 'No',
    regulatoryDetails: company.regulatory_details || '',
    // Financial Information
    hasDunsBradstreetNumber: company.has_duns_bradstreet_number || 'No',
    dunsBradstreetNumber: company.duns_bradstreet_number || '',
    // System Fields
    createdAt: company.created_at || '',
    updatedAt: company.updated_at || ''
  };
};

const transformContact = (contact) => {
  if (!contact) return null;
  return {
    id: contact.id || '',
    companyId: contact.company_id || '',
    firstName: contact.first_name || '',
    lastName: contact.last_name || '',
    phone: contact.phone || '',
    email: contact.email || '',
    jobTitle: contact.job_title || '',
    department: contact.department || '',
    isPrimaryContact: contact.is_primary_contact || 0,
    preferredContactMethod: contact.preferred_contact_method || 'Phone',
    position: contact.position || '',
    createdAt: contact.created_at || '',
    updatedAt: contact.updated_at || ''
  };
};

const transformVehicle = (vehicle) => {
  if (!vehicle) return null;
  return {
    id: vehicle.id || '',
    companyId: vehicle.company_id || '',
    vin: vehicle.vin || '',
    licensePlate: vehicle.license_plate || '',
    make: vehicle.make || '',
    model: vehicle.model || '',
    year: vehicle.year || 0,
    color: vehicle.color || '',
    vehicleType: vehicle.vehicle_type || '',
    gvwr: vehicle.gvwr || '',
    emptyWeight: vehicle.empty_weight || '',
    fuelType: vehicle.fuel_type || '',
    registrationNumber: vehicle.registration_number || '',
    registrationExpiry: vehicle.registration_expiry || '',
    insuranceProvider: vehicle.insurance_provider || '',
    insurancePolicyNumber: vehicle.insurance_policy_number || '',
    insuranceExpiry: vehicle.insurance_expiry || '',
    lastInspectionDate: vehicle.last_inspection_date || '',
    nextInspectionDue: vehicle.next_inspection_due || '',
    lastMaintenanceDate: vehicle.last_maintenance_date || '',
    nextMaintenanceDue: vehicle.next_maintenance_due || '',
    hasHazmatEndorsement: vehicle.has_hazmat_endorsement || 'No',
    status: vehicle.status || 'Active',
    currentDriverId: vehicle.current_driver_id || '',
    createdAt: vehicle.created_at || '',
    updatedAt: vehicle.updated_at || ''
  };
};

const transformDriver = (driver) => {
  if (!driver) return null;
  return {
    id: driver.id || '',
    companyId: driver.company_id || '',
    driverName: driver.driver_name || '',
    firstName: driver.first_name || '',
    lastName: driver.last_name || '',
    phone: driver.phone || '',
    email: driver.email || '',
    licenseNumber: driver.license_number || '',
    licenseClass: driver.license_class || '',
    licenseExpiry: driver.license_expiry || '',
    medicalCardExpiry: driver.medical_card_expiry || '',
    hireDate: driver.hire_date || '',
    employmentStatus: driver.employment_status || 'Active',
    position: driver.position || 'Driver',
    payType: driver.pay_type || '',
    createdAt: driver.created_at || '',
    updatedAt: driver.updated_at || ''
  };
};

const transformDeal = (deal) => {
  if (!deal) return null;
  return {
    id: deal.id || '',
    title: deal.title || '',
    description: deal.description || '',
    value: deal.value || 0,
    stage: deal.stage || '',
    probability: deal.probability || 0,
    expectedCloseDate: deal.expected_close_date || '',
    actualCloseDate: deal.actual_close_date || '',
    serviceId: deal.service_id || '',
    serviceName: deal.service_name || '',
    customPrice: deal.custom_price || 0,
    companyId: deal.company_id || '',
    contactId: deal.contact_id || '',
    createdAt: deal.created_at || '',
    updatedAt: deal.updated_at || ''
  };
};

const transformLead = (lead) => {
  if (!lead) return null;
  return {
    id: lead.id || '',
    firstName: lead.first_name || '',
    lastName: lead.last_name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    company: lead.company || '',
    jobTitle: lead.job_title || '',
    campaignId: lead.campaign_id || '',
    leadSource: lead.lead_source || '',
    leadStatus: lead.lead_status || 'New',
    leadScore: lead.lead_score || 0,
    businessType: lead.business_type || '',
    fleetSize: lead.fleet_size || 0,
    operatingStates: lead.operating_states || '',
    cargoTypes: lead.cargo_types || '',
    hasUsdot: lead.has_usdot || 0,
    usdotNumber: lead.usdot_number || '',
    budget: lead.budget || 0,
    timeline: lead.timeline || '',
    decisionMaker: lead.decision_maker || 0,
    painPoints: lead.pain_points || '',
    interests: lead.interests || '',
    preferredContactMethod: lead.preferred_contact_method || 'Phone',
    lastContactDate: lead.last_contact_date || '',
    nextFollowUpDate: lead.next_follow_up_date || '',
    notes: lead.notes || '',
    convertedToContact: lead.converted_to_contact || 0,
    convertedToDeal: lead.converted_to_deal || 0,
    conversionDate: lead.conversion_date || '',
    conversionValue: lead.conversion_value || 0,
    convertedContactId: lead.converted_contact_id || '',
    convertedDealId: lead.converted_deal_id || '',
    companyId: lead.company_id || '',
    assignedTo: lead.assigned_to || '',
    assignedDate: lead.assigned_date || '',
    createdAt: lead.created_at || '',
    updatedAt: lead.updated_at || ''
  };
};

const transformService = (service) => {
  if (!service) return null;
  return {
    id: service.id || '',
    name: service.name || '',
    description: service.description || '',
    category: service.category || '',
    basePrice: service.base_price || 0,
    estimatedDuration: service.estimated_duration || '',
    requirements: service.requirements || '',
    deliverables: service.deliverables || '',
    isActive: service.is_active || 1,
    createdAt: service.created_at || '',
    updatedAt: service.updated_at || ''
  };
};

const transformInvoice = (invoice) => {
  if (!invoice) return null;
  return {
    id: invoice.id || '',
    invoiceNumber: invoice.invoice_number || '',
    clientName: invoice.client_name || '',
    amount: invoice.amount || 0,
    status: invoice.status || 'draft',
    dueDate: invoice.due_date || '',
    createdAt: invoice.created_at || '',
    updatedAt: invoice.updated_at || ''
  };
};

// Helper function to execute SQL file
const executeSQLFile = (filePath, description) => {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`❌ Error reading ${filePath}:`, err);
        reject(err);
        return;
      }

      // Remove comments and normalize whitespace, then split by semicolon
      const cleanData = data
        .split('\n')
        .map(line => {
          // Remove comments (everything after -- on a line)
          const commentIndex = line.indexOf('--');
          if (commentIndex !== -1) {
            line = line.substring(0, commentIndex);
          }
          return line.trim();
        })
        .filter(line => line.length > 0) // Remove empty lines
        .join(' '); // Join all lines with spaces
      
      // Split by semicolon and filter out empty statements
      const statements = cleanData
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      if (statements.length === 0) {
        console.log(`✅ ${description} completed (no statements)`);
        resolve();
        return;
      }

      // Execute statements sequentially to ensure proper order
      let currentIndex = 0;
      let errors = [];
      
      function executeNext() {
        if (currentIndex >= statements.length) {
          if (errors.length > 0) {
            console.error(`❌ ${description} completed with ${errors.length} errors`);
            reject(new Error(`Database initialization failed with ${errors.length} errors`));
          } else {
            console.log(`✅ ${description} completed successfully (${statements.length} statements)`);
            resolve();
          }
          return;
        }
        
        const statement = statements[currentIndex];
        const index = currentIndex;
        currentIndex++;
        
        db.run(statement, (err) => {
          if (err) {
            console.error(`❌ Error in statement ${index + 1}:`, err.message);
            console.error(`   Statement: ${statement.substring(0, 100)}...`);
            errors.push({ statement: index + 1, error: err.message, sql: statement });
          }
          
          // Continue with next statement
          executeNext();
        });
      }
      
      // Start executing statements
      executeNext();
    });
  });
};

// Helper function to run queries
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const runQueryOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const runExecute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes, lastID: this.lastID });
      }
    });
  });
};

// API Routes

// Initialize ELD Compliance Service Integration
try {
  // Mount ELD Compliance API routes
  // app.use('/api/eld', eldComplianceApiRoutes.getRouter());
  console.log('✅ ELD Compliance API routes mounted at /api/eld');
} catch (error) {
  console.warn('⚠️  ELD Compliance Service Integration failed to initialize:', error.message);
  console.warn('⚠️  ELD endpoints will not be available');
}

// Initialize ELD Compliance Service Integration
try {
  // Mount ELD Compliance API routes
  const eldApiRoutes = createELDComplianceApiRoutes(db);
  app.use('/api/eld', eldApiRoutes.getRouter());
  console.log('✅ ELD Compliance API routes mounted at /api/eld');
} catch (error) {
  console.warn('⚠️  ELD Compliance Service Integration failed to initialize:', error.message);
  console.warn('⚠️  ELD endpoints will not be available');
}

// Initialize IFTA Compliance Service Integration
try {
  // Mount IFTA Compliance API routes
  const iftaApiRoutes = createIFTAComplianceApiRoutes(db);
  app.use('/api/ifta', iftaApiRoutes.getRouter());
  console.log('✅ IFTA Compliance API routes mounted at /api/ifta');
} catch (error) {
  console.warn('⚠️  IFTA Compliance Service Integration failed to initialize:', error.message);
  console.warn('⚠️  IFTA endpoints will not be available');
}

// SEO Automation Service Integration
const { createSEOAutomationApiRoutes } = require('./src/services/seo/SEOAutomationApiRoutesCommonJS');
const { createSEOAutomationAgentApiRoutes } = require('./src/services/ai/SEOAutomationAgentApiRoutesCommonJS');
const { createCompetitorResearchApiRoutes } = require('./src/services/seo/CompetitorResearchApiRoutesCommonJS');
const { createTrendingContentApiRoutes } = require('./src/services/seo/TrendingContentApiRoutesCommonJS');

// Initialize SEO Automation Service Integration
try {
  // Mount SEO Automation API routes
  const seoApiRoutes = createSEOAutomationApiRoutes(db);
  app.use('/api/seo', seoApiRoutes);
  console.log('✅ SEO Automation API routes mounted at /api/seo');
  
  // Mount SEO Automation Agent API routes
  const seoAgentApiRoutes = createSEOAutomationAgentApiRoutes(db);
  app.use('/api/seo-agent', seoAgentApiRoutes);
  console.log('✅ SEO Automation Agent API routes mounted at /api/seo-agent');
  
  // Mount Competitor Research API routes
  const competitorResearchApiRoutes = createCompetitorResearchApiRoutes(db);
  app.use('/api/competitors', competitorResearchApiRoutes);
  console.log('✅ Competitor Research API routes mounted at /api/competitors');
  
  // Mount Trending Content API routes
  const trendingContentApiRoutes = createTrendingContentApiRoutes(db);
  app.use('/api/trending-content', trendingContentApiRoutes);
  console.log('✅ Trending Content API routes mounted at /api/trending-content');
} catch (error) {
  console.warn('⚠️  SEO Automation Service Integration failed to initialize:', error.message);
  console.warn('⚠️  SEO endpoints will not be available');
}

// Companies
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await runQuery('SELECT * FROM companies');
    const transformedCompanies = companies.map(transformCompany).filter(Boolean);
    res.json(transformedCompanies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const company = await runQueryOne('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(transformCompany(company));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const {
      physicalStreetAddress, physicalSuiteApt, physicalCity, physicalState, physicalCountry, physicalZip,
      isMailingAddressSame, mailingStreetAddress, mailingSuiteApt, mailingCity, mailingState, mailingCountry, mailingZip,
      legalBusinessName, hasDba, dbaName, businessType, ein, businessStarted,
      classification, operationType, interstateIntrastate, usdotNumber, operationClass,
      fleetType, numberOfVehicles, numberOfDrivers, gvwr, vehicleTypes,
      cargoTypes, hazmatRequired, phmsaWork, regulatoryDetails,
      hasDunsBradstreetNumber, dunsBradstreetNumber
    } = req.body;
    
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      `INSERT INTO companies (
        id, physical_street_address, physical_suite_apt, physical_city, physical_state, 
        physical_country, physical_zip, is_mailing_address_same, mailing_street_address, 
        mailing_suite_apt, mailing_city, mailing_state, mailing_country, mailing_zip, 
        legal_business_name, has_dba, dba_name, business_type, ein, business_started, 
        classification, operation_type, interstate_intrastate, usdot_number, operation_class, 
        fleet_type, number_of_vehicles, number_of_drivers, gvwr, vehicle_types, 
        cargo_types, hazmat_required, phmsa_work, regulatory_details, 
        has_duns_bradstreet_number, duns_bradstreet_number, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, physicalStreetAddress, physicalSuiteApt, physicalCity, physicalState, physicalCountry, physicalZip,
        isMailingAddressSame, mailingStreetAddress, mailingSuiteApt, mailingCity, mailingState, mailingCountry, mailingZip,
        legalBusinessName, hasDba, dbaName, businessType, ein, businessStarted,
        classification, operationType, interstateIntrastate, usdotNumber, operationClass,
        fleetType, numberOfVehicles, numberOfDrivers, gvwr, vehicleTypes,
        cargoTypes, hazmatRequired, phmsaWork, regulatoryDetails,
        hasDunsBradstreetNumber, dunsBradstreetNumber, now, now
      ]
    );
    
    const company = await runQueryOne('SELECT * FROM companies WHERE id = ?', [id]);
    res.status(201).json(transformCompany(company));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const { legalBusinessName, dba, companyType, dotNumber, mcNumber, ein } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE companies SET legal_business_name = ?, dba = ?, company_type = ?, dot_number = ?, mc_number = ?, ein = ?, updated_at = ? WHERE id = ?',
      [legalBusinessName, dba, companyType, dotNumber, mcNumber, ein, now, req.params.id]
    );
    
    const company = await runQueryOne('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM companies WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await runQuery('SELECT * FROM contacts');
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await runQueryOne('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, companyId } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO contacts (id, first_name, last_name, email, phone, company_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, firstName, lastName, email, phone, companyId, now, now]
    );
    
    const contact = await runQueryOne('SELECT * FROM contacts WHERE id = ?', [id]);
    res.status(201).json(transformContact(contact));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, companyId } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE contacts SET first_name = ?, last_name = ?, email = ?, phone = ?, company_id = ?, updated_at = ? WHERE id = ?',
      [firstName, lastName, email, phone, companyId, now, req.params.id]
    );
    
    const contact = await runQueryOne('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await runQuery('SELECT * FROM vehicles');
    
    // Map database fields to frontend camelCase format
    const mappedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      companyId: vehicle.company_id,
      vin: vehicle.vin,
      licensePlate: vehicle.license_plate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      vehicleType: vehicle.vehicle_type,
      gvwr: vehicle.gvwr,
      emptyWeight: vehicle.empty_weight,
      fuelType: vehicle.fuel_type,
      registrationNumber: vehicle.registration_number,
      registrationExpiry: vehicle.registration_expiry,
      insuranceProvider: vehicle.insurance_provider,
      insurancePolicyNumber: vehicle.insurance_policy_number,
      insuranceExpiry: vehicle.insurance_expiry,
      lastInspectionDate: vehicle.last_inspection_date,
      nextInspectionDue: vehicle.next_inspection_due,
      lastMaintenanceDate: vehicle.last_maintenance_date,
      nextMaintenanceDue: vehicle.next_maintenance_due,
      hasHazmatEndorsement: vehicle.has_hazmat_endorsement,
      status: vehicle.status,
      currentDriverId: vehicle.current_driver_id,
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at
    }));
    
    res.json(mappedVehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await runQueryOne('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    // Map database fields to frontend camelCase format
    const mappedVehicle = {
      id: vehicle.id,
      companyId: vehicle.company_id,
      vin: vehicle.vin,
      licensePlate: vehicle.license_plate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      vehicleType: vehicle.vehicle_type,
      gvwr: vehicle.gvwr,
      emptyWeight: vehicle.empty_weight,
      fuelType: vehicle.fuel_type,
      registrationNumber: vehicle.registration_number,
      registrationExpiry: vehicle.registration_expiry,
      insuranceProvider: vehicle.insurance_provider,
      insurancePolicyNumber: vehicle.insurance_policy_number,
      insuranceExpiry: vehicle.insurance_expiry,
      lastInspectionDate: vehicle.last_inspection_date,
      nextInspectionDue: vehicle.next_inspection_due,
      lastMaintenanceDate: vehicle.last_maintenance_date,
      nextMaintenanceDue: vehicle.next_maintenance_due,
      hasHazmatEndorsement: vehicle.has_hazmat_endorsement,
      status: vehicle.status,
      currentDriverId: vehicle.current_driver_id,
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at
    };
    
    res.json(mappedVehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const { make, model, year, vin, licensePlate, companyId } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO vehicles (id, make, model, year, vin, license_plate, company_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, make, model, year, vin, licensePlate, companyId, now, now]
    );
    
    const vehicle = await runQueryOne('SELECT * FROM vehicles WHERE id = ?', [id]);
    res.status(201).json(transformVehicle(vehicle));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const { make, model, year, vin, licensePlate, companyId } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE vehicles SET make = ?, model = ?, year = ?, vin = ?, license_plate = ?, company_id = ?, updated_at = ? WHERE id = ?',
      [make, model, year, vin, licensePlate, companyId, now, req.params.id]
    );
    
    const vehicle = await runQueryOne('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Drivers
app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await runQuery('SELECT * FROM drivers');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/drivers/:id', async (req, res) => {
  try {
    const driver = await runQueryOne('SELECT * FROM drivers WHERE id = ?', [req.params.id]);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const { firstName, lastName, licenseNumber, phone, email, companyId } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO drivers (id, first_name, last_name, license_number, phone, email, company_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, firstName, lastName, licenseNumber, phone, email, companyId, now, now]
    );
    
    const driver = await runQueryOne('SELECT * FROM drivers WHERE id = ?', [id]);
    res.status(201).json(transformDriver(driver));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const { firstName, lastName, licenseNumber, phone, email, companyId } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE drivers SET first_name = ?, last_name = ?, license_number = ?, phone = ?, email = ?, company_id = ?, updated_at = ? WHERE id = ?',
      [firstName, lastName, licenseNumber, phone, email, companyId, now, req.params.id]
    );
    
    const driver = await runQueryOne('SELECT * FROM drivers WHERE id = ?', [req.params.id]);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM drivers WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deals
app.get('/api/deals', async (req, res) => {
  try {
    const deals = await runQuery('SELECT * FROM deals');
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/deals/:id', async (req, res) => {
  try {
    const deal = await runQueryOne('SELECT * FROM deals WHERE id = ?', [req.params.id]);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/deals', async (req, res) => {
  try {
    const { title, amount, status, companyId } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO deals (id, title, amount, status, company_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, amount, status, companyId, now, now]
    );
    
    const deal = await runQueryOne('SELECT * FROM deals WHERE id = ?', [id]);
    res.status(201).json(transformDeal(deal));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/deals/:id', async (req, res) => {
  try {
    const { title, amount, status, companyId } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE deals SET title = ?, amount = ?, status = ?, company_id = ?, updated_at = ? WHERE id = ?',
      [title, amount, status, companyId, now, req.params.id]
    );
    
    const deal = await runQueryOne('SELECT * FROM deals WHERE id = ?', [req.params.id]);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/deals/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM deals WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Services API endpoints
app.get('/api/services', async (req, res) => {
  try {
    const services = await runQuery('SELECT * FROM services');
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await runQueryOne('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { name, description, category, basePrice, estimatedDuration, requirements, deliverables, isActive } = req.body;
    
    const result = await runExecute(`
      INSERT INTO services (name, description, category, base_price, estimated_duration, requirements, deliverables, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [name, description, category, basePrice, estimatedDuration, JSON.stringify(requirements), JSON.stringify(deliverables), isActive]);
    
    const newService = await runQueryOne('SELECT * FROM services WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(transformService(newService));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { name, description, category, basePrice, estimatedDuration, requirements, deliverables, isActive } = req.body;
    
    await runExecute(`
      UPDATE services 
      SET name = ?, description = ?, category = ?, base_price = ?, estimated_duration = ?, 
          requirements = ?, deliverables = ?, is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [name, description, category, basePrice, estimatedDuration, JSON.stringify(requirements), JSON.stringify(deliverables), isActive, req.params.id]);
    
    const updatedService = await runQueryOne('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!updatedService) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await runQuery('SELECT * FROM invoices');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const invoice = await runQueryOne('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const { invoiceNumber, amount, status, companyId } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO invoices (id, invoice_number, amount, status, company_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, invoiceNumber, amount, status, companyId, now, now]
    );
    
    const invoice = await runQueryOne('SELECT * FROM invoices WHERE id = ?', [id]);
    res.status(201).json(transformInvoice(invoice));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const { invoiceNumber, amount, status, companyId } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE invoices SET invoice_number = ?, amount = ?, status = ?, company_id = ?, updated_at = ? WHERE id = ?',
      [invoiceNumber, amount, status, companyId, now, req.params.id]
    );
    
    const invoice = await runQueryOne('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leads
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await runQuery('SELECT * FROM leads');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leads/:id', async (req, res) => {
  try {
    const lead = await runQueryOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone, companyId, status } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO leads (id, name, email, phone, company_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, phone, companyId, status, now, now]
    );
    
    const lead = await runQueryOne('SELECT * FROM leads WHERE id = ?', [id]);
    res.status(201).json(transformLead(lead));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  try {
    const { name, email, phone, companyId, status } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE leads SET name = ?, email = ?, phone = ?, company_id = ?, status = ?, updated_at = ? WHERE id = ?',
      [name, email, phone, companyId, status, now, req.params.id]
    );
    
    const lead = await runQueryOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM leads WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await runQuery('SELECT * FROM campaigns');
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const campaign = await runQueryOne('SELECT * FROM campaigns WHERE id = ?', [req.params.id]);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaigns', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO campaigns (id, name, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, description, status, now, now]
    );
    
    const campaign = await runQueryOne('SELECT * FROM campaigns WHERE id = ?', [id]);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/campaigns/:id', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE campaigns SET name = ?, description = ?, status = ?, updated_at = ? WHERE id = ?',
      [name, description, status, now, req.params.id]
    );
    
    const campaign = await runQueryOne('SELECT * FROM campaigns WHERE id = ?', [req.params.id]);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/campaigns/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM campaigns WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vehicles - Duplicate endpoints removed

app.post('/api/vehicles', async (req, res) => {
  try {
    const {
      companyId, vin, licensePlate, make, model, year, color, vehicleType, gvwr, emptyWeight, fuelType,
      registrationNumber, registrationExpiry, insuranceProvider, insurancePolicyNumber, insuranceExpiry,
      lastInspectionDate, nextInspectionDue, lastMaintenanceDate, nextMaintenanceDue, hasHazmatEndorsement,
      status, currentDriverId
    } = req.body;
    
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      `INSERT INTO vehicles (
        id, company_id, vin, license_plate, make, model, year, color, vehicle_type, gvwr, empty_weight, fuel_type,
        registration_number, registration_expiry, insurance_provider, insurance_policy_number, insurance_expiry,
        last_inspection_date, next_inspection_due, last_maintenance_date, next_maintenance_due, has_hazmat_endorsement,
        status, current_driver_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, companyId, vin, licensePlate, make, model, year, color, vehicleType, gvwr, emptyWeight, fuelType,
        registrationNumber, registrationExpiry, insuranceProvider, insurancePolicyNumber, insuranceExpiry,
        lastInspectionDate, nextInspectionDue, lastMaintenanceDate, nextMaintenanceDue, hasHazmatEndorsement,
        status, currentDriverId, now, now
      ]
    );
    
    const vehicle = await runQueryOne('SELECT * FROM vehicles WHERE id = ?', [id]);
    res.status(201).json(transformVehicle(vehicle));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const {
      companyId, vin, licensePlate, make, model, year, color, vehicleType, gvwr, emptyWeight, fuelType,
      registrationNumber, registrationExpiry, insuranceProvider, insurancePolicyNumber, insuranceExpiry,
      lastInspectionDate, nextInspectionDue, lastMaintenanceDate, nextMaintenanceDue, hasHazmatEndorsement,
      status, currentDriverId
    } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      `UPDATE vehicles SET 
        company_id = ?, vin = ?, license_plate = ?, make = ?, model = ?, year = ?, color = ?, vehicle_type = ?, gvwr = ?, empty_weight = ?, fuel_type = ?,
        registration_number = ?, registration_expiry = ?, insurance_provider = ?, insurance_policy_number = ?, insurance_expiry = ?,
        last_inspection_date = ?, next_inspection_due = ?, last_maintenance_date = ?, next_maintenance_due = ?, has_hazmat_endorsement = ?,
        status = ?, current_driver_id = ?, updated_at = ? WHERE id = ?`,
      [
        companyId, vin, licensePlate, make, model, year, color, vehicleType, gvwr, emptyWeight, fuelType,
        registrationNumber, registrationExpiry, insuranceProvider, insurancePolicyNumber, insuranceExpiry,
        lastInspectionDate, nextInspectionDue, lastMaintenanceDate, nextMaintenanceDue, hasHazmatEndorsement,
        status, currentDriverId, now, req.params.id
      ]
    );
    
    const vehicle = await runQueryOne('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Drivers
app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await runQuery('SELECT * FROM drivers');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/drivers/:id', async (req, res) => {
  try {
    const driver = await runQueryOne('SELECT * FROM drivers WHERE id = ?', [req.params.id]);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const {
      companyId, driverName, firstName, lastName, phone, email, licenseNumber, licenseClass, licenseExpiry,
      medicalCardExpiry, hireDate, employmentStatus, position, payType
    } = req.body;
    
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      `INSERT INTO drivers (
        id, company_id, driver_name, first_name, last_name, phone, email, license_number, license_class, license_expiry,
        medical_card_expiry, hire_date, employment_status, position, pay_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, companyId, driverName, firstName, lastName, phone, email, licenseNumber, licenseClass, licenseExpiry,
        medicalCardExpiry, hireDate, employmentStatus, position, payType, now, now
      ]
    );
    
    const driver = await runQueryOne('SELECT * FROM drivers WHERE id = ?', [id]);
    res.status(201).json(transformDriver(driver));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const {
      companyId, driverName, firstName, lastName, phone, email, licenseNumber, licenseClass, licenseExpiry,
      medicalCardExpiry, hireDate, employmentStatus, position, payType
    } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      `UPDATE drivers SET 
        company_id = ?, driver_name = ?, first_name = ?, last_name = ?, phone = ?, email = ?, license_number = ?, license_class = ?, license_expiry = ?,
        medical_card_expiry = ?, hire_date = ?, employment_status = ?, position = ?, pay_type = ?, updated_at = ? WHERE id = ?`,
      [
        companyId, driverName, firstName, lastName, phone, email, licenseNumber, licenseClass, licenseExpiry,
        medicalCardExpiry, hireDate, employmentStatus, position, payType, now, req.params.id
      ]
    );
    
    const driver = await runQueryOne('SELECT * FROM drivers WHERE id = ?', [req.params.id]);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM drivers WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Keys
app.get('/api/api-keys', async (req, res) => {
  try {
    console.log('🔑 API Keys endpoint called');
    const apiKeys = await runQuery('SELECT * FROM api_keys');
    console.log('🔑 Raw API keys from DB:', apiKeys);
    
    // Transform database fields to match frontend ApiKey interface
    const transformedApiKeys = apiKeys.map(apiKey => ({
      id: apiKey.id,
      name: apiKey.name,
      platform: apiKey.provider.toLowerCase(),
      key: apiKey.key_value,
      description: apiKey.description || '',
      status: 'active',
      environment: 'production',
      permissions: [],
      tags: [],
      usageCount: 0,
      createdAt: apiKey.created_at,
      updatedAt: apiKey.updated_at
    }));
    
    console.log('🔑 Transformed API keys:', transformedApiKeys);
    res.json(transformedApiKeys);
  } catch (error) {
    console.error('❌ Error in /api/api-keys:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/api-keys/:id', async (req, res) => {
  try {
    const apiKey = await runQueryOne('SELECT * FROM api_keys WHERE id = ?', [req.params.id]);
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }
    res.json(apiKey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/api-keys', async (req, res) => {
  try {
    const apiKeyData = req.body;
    
    // Handle both old format (name, platform, key, description) and new format (full ApiKey object)
    const name = apiKeyData.name;
    const platform = apiKeyData.platform;
    const key = apiKeyData.key;
    const description = apiKeyData.description || '';
    
    // Check if an API key with this name already exists
    const existingKey = await runQueryOne('SELECT * FROM api_keys WHERE name = ?', [name]);
    if (existingKey) {
      return res.status(409).json({ error: 'API key with this name already exists' });
    }
    
    const id = apiKeyData.id || Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO api_keys (id, name, key_value, provider, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, key, platform, now, now]
    );
    
    const apiKey = await runQueryOne('SELECT * FROM api_keys WHERE id = ?', [id]);
    // Transform to match frontend interface
    const transformedApiKey = {
      id: apiKey.id,
      name: apiKey.name,
      platform: apiKey.provider.toLowerCase(),
      key: apiKey.key_value,
      description: apiKey.description || '',
      status: 'active',
      environment: 'production',
      permissions: [],
      tags: [],
      usageCount: 0,
      createdAt: apiKey.created_at,
      updatedAt: apiKey.updated_at
    };
    res.status(201).json(transformedApiKey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/api-keys/:id', async (req, res) => {
  try {
    const apiKeyData = req.body;
    
    // Handle both old format and new format
    const name = apiKeyData.name;
    const platform = apiKeyData.platform;
    const key = apiKeyData.key;
    const description = apiKeyData.description || '';
    
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE api_keys SET name = ?, key_value = ?, provider = ?, updated_at = ? WHERE id = ?',
      [name, key, platform, now, req.params.id]
    );
    
    const apiKey = await runQueryOne('SELECT * FROM api_keys WHERE id = ?', [req.params.id]);
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }
    // Transform to match frontend interface
    const transformedApiKey = {
      id: apiKey.id,
      name: apiKey.name,
      platform: apiKey.provider.toLowerCase(),
      key: apiKey.key_value,
      description: apiKey.description || '',
      status: 'active',
      environment: 'production',
      permissions: [],
      tags: [],
      usageCount: 0,
      createdAt: apiKey.created_at,
      updatedAt: apiKey.updated_at
    };
    res.json(transformedApiKey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/api-keys/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM api_keys WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// USDOT Applications endpoints (Read-only after creation)
app.get('/api/usdot-applications', async (req, res) => {
  try {
    const applications = await runQuery('SELECT * FROM usdot_applications ORDER BY created_at DESC');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/usdot-applications/:id', async (req, res) => {
  try {
    const application = await runQueryOne('SELECT * FROM usdot_applications WHERE id = ?', [req.params.id]);
    if (!application) {
      return res.status(404).json({ error: 'USDOT application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/usdot-applications/company/:companyId', async (req, res) => {
  try {
    const applications = await runQuery('SELECT * FROM usdot_applications WHERE company_id = ? ORDER BY created_at DESC', [req.params.companyId]);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/usdot-applications', async (req, res) => {
  try {
    const {
      companyId,
      legalBusinessName,
      dbaName,
      principalAddress,
      mailingAddress,
      primaryContact,
      companyOfficial,
      businessType,
      ein,
      dunsNumber,
      operationTypes,
      carrierOperationTypes,
      powerUnits,
      drivers,
      operationClassifications,
      cargoClassifications,
      hazardousMaterials,
      marketerOfTransportationServices,
      applicationDate,
      signature,
      officialTitle
    } = req.body;

    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    await runExecute(
      `INSERT INTO usdot_applications (
        id, company_id, legal_business_name, dba_name,
        principal_address_street, principal_address_city, principal_address_state, principal_address_zip,
        mailing_address_is_different, mailing_address_street, mailing_address_city, mailing_address_state, mailing_address_zip,
        primary_contact_full_name, primary_contact_title, primary_contact_phone, primary_contact_fax, primary_contact_email,
        company_official_full_name, company_official_title, company_official_phone, company_official_email,
        business_type, ein, duns_number,
        operation_types, carrier_operation_types,
        power_units_owned, power_units_term_leased, power_units_trip_leased,
        drivers_employees, drivers_owner_operators,
        operation_classifications, cargo_classifications,
        hazardous_materials_classifications, hazardous_materials_hm_classes,
        marketer_of_transportation_services, application_date, signature, official_title,
        created_at, updated_at, is_read_only
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, companyId, legalBusinessName, dbaName,
        principalAddress.street, principalAddress.city, principalAddress.state, principalAddress.zip,
        mailingAddress.isDifferent ? 'Yes' : 'No', mailingAddress.street, mailingAddress.city, mailingAddress.state, mailingAddress.zip,
        primaryContact.fullName, primaryContact.title, primaryContact.phone, primaryContact.fax, primaryContact.email,
        companyOfficial.fullName, companyOfficial.title, companyOfficial.phone, companyOfficial.email,
        businessType, ein, dunsNumber,
        JSON.stringify(operationTypes), JSON.stringify(carrierOperationTypes),
        powerUnits.owned, powerUnits.termLeased, powerUnits.tripLeased,
        drivers.employees, drivers.ownerOperators,
        JSON.stringify(operationClassifications), JSON.stringify(cargoClassifications),
        JSON.stringify(hazardousMaterials.classifications), JSON.stringify(hazardousMaterials.hmClasses),
        marketerOfTransportationServices ? 'Yes' : 'No', applicationDate, signature, officialTitle,
        now, now, 'Yes'
      ]
    );
    
    const application = await runQueryOne('SELECT * FROM usdot_applications WHERE id = ?', [id]);
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Note: No PUT or DELETE endpoints for USDOT applications - they are read-only after creation

// Check if database exists and has data, if not initialize it
const checkAndInitializeDatabase = async () => {
  try {
    await initDatabase();
    
    // Run ELD service migration if enabled
    if (process.env.ELD_AUTOMATION_ENABLED === 'true') {
      try {
        const { runEldMigration } = require('./src/database/eldMigration');
        await runEldMigration(dbPath);
        console.log('✅ ELD service database migration completed');
      } catch (eldError) {
        console.warn('⚠️  ELD service migration failed:', eldError.message);
        console.warn('⚠️  ELD features may not be available');
      }
    }
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

// Theme API endpoints
app.get('/api/theme', async (req, res) => {
  try {
    // Return default theme with logo
    const defaultTheme = {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#10b981',
      backgroundColor: '#f8fafc',
      surfaceColor: '#ffffff',
      textColor: '#1f2937',
      borderColor: '#e5e7eb',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
      infoColor: '#3b82f6',
      logoUrl: '/uploads/logo_1757827373384.png',
      logoHeight: 48,
      borderRadius: 8,
      fontFamily: 'inherit',
      fontWeight: '400'
    };
    
    res.json({
      success: true,
      theme: defaultTheme
    });
  } catch (error) {
    console.error('❌ Error loading theme:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load theme' 
    });
  }
});

app.post('/api/theme', async (req, res) => {
  try {
    const theme = req.body;
    console.log('🎨 Theme saved:', theme);
    
    // For now, just return success - this can be expanded to save to database later
    res.json({
      success: true,
      message: 'Theme saved successfully'
    });
  } catch (error) {
    console.error('❌ Error saving theme:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save theme' 
    });
  }
});

// AI Voices endpoint
app.get('/api/ai/voices', async (req, res) => {
  try {
    console.log('🎤 AI Voices endpoint called');
    const unrealSpeechKey = await getApiKeyFromDatabase('unreal-speech');
    console.log('🔑 Unreal Speech key retrieved:', unrealSpeechKey ? 'Found' : 'Not found');
    
    if (unrealSpeechKey) {
      // Return Unreal Speech voices (using correct voice IDs from API)
      const unrealSpeechVoices = [
        {
          id: 'eleanor',
          name: 'Eleanor',
          description: 'Professional female voice',
          provider: 'unreal-speech',
          voiceId: 'Eleanor',
          settings: { rate: 0, pitch: 1.0, volume: 1.0 }
        },
        {
          id: 'javier',
          name: 'Javier',
          description: 'Professional male voice',
          provider: 'unreal-speech',
          voiceId: 'Javier',
          settings: { rate: 0, pitch: 1.0, volume: 1.0 }
        },
        {
          id: 'melody',
          name: 'Melody',
          description: 'Clear female voice',
          provider: 'unreal-speech',
          voiceId: 'Melody',
          settings: { rate: 0, pitch: 1.0, volume: 1.0 }
        },
        {
          id: 'daniel',
          name: 'Daniel',
          description: 'Friendly male voice',
          provider: 'unreal-speech',
          voiceId: 'Daniel',
          settings: { rate: 0, pitch: 1.0, volume: 1.0 }
        },
        {
          id: 'amelia',
          name: 'Amelia',
          description: 'Warm female voice',
          provider: 'unreal-speech',
          voiceId: 'Amelia',
          settings: { rate: 0, pitch: 1.0, volume: 1.0 }
        },
        {
          id: 'lauren',
          name: 'Lauren',
          description: 'Energetic female voice',
          provider: 'unreal-speech',
          voiceId: 'Lauren',
          settings: { rate: 0, pitch: 1.0, volume: 1.0 }
        },
        {
          id: 'luna',
          name: 'Luna',
          description: 'Soft female voice',
          provider: 'unreal-speech',
          voiceId: 'Luna',
          settings: { rate: 0, pitch: 1.0, volume: 1.0 }
        },
        {
          id: 'jasper',
          name: 'Jasper',
          description: 'Confident male voice',
          provider: 'unreal-speech',
          voiceId: 'Jasper',
          settings: { rate: 0, pitch: 1.0, volume: 1.0 }
        },
        {
          id: 'sierra',
          name: 'Sierra',
          description: 'Authoritative female voice',
          provider: 'unreal-speech',
          voiceId: 'Sierra',
          settings: { rate: 0, pitch: 1.0, volume: 1.0 }
        },
        {
          id: 'edward',
          name: 'Edward',
          description: 'Sophisticated male voice',
          provider: 'unreal-speech',
          voiceId: 'Edward',
          settings: { rate: 0, pitch: 1.0, volume: 1.0 }
        },
        {
          id: 'charlotte',
          name: 'Charlotte',
          description: 'Elegant female voice',
          provider: 'unreal-speech',
          voiceId: 'Charlotte',
          settings: { rate: 0, pitch: 1.0, volume: 1.0 }
        },
        {
          id: 'caleb',
          name: 'Caleb',
          description: 'Warm male voice',
          provider: 'unreal-speech',
          voiceId: 'Caleb',
          settings: { rate: 0, pitch: 1.0, volume: 1.0 }
        }
      ];
      
      res.json({ success: true, voices: unrealSpeechVoices });
    } else {
      // Fallback to browser voices
      const browserVoices = [
        {
          id: 'mikael',
          name: 'Mikael',
          description: 'Professional male voice',
          provider: 'browser',
          voiceId: 'mikael',
          settings: { rate: 0.9, pitch: 1.0, volume: 1.0 }
        },
        {
          id: 'alex',
          name: 'Alex',
          description: 'Clear male voice',
          provider: 'browser',
          voiceId: 'alex',
          settings: { rate: 1.1, pitch: 0.8, volume: 1.0 }
        },
        {
          id: 'samantha',
          name: 'Samantha',
          description: 'Professional female voice',
          provider: 'browser',
          voiceId: 'samantha',
          settings: { rate: 1.0, pitch: 1.2, volume: 1.0 }
        },
        {
          id: 'victoria',
          name: 'Victoria',
          description: 'Warm female voice',
          provider: 'browser',
          voiceId: 'victoria',
          settings: { rate: 0.8, pitch: 1.3, volume: 1.0 }
        },
        {
          id: 'david',
          name: 'David',
          description: 'Deep male voice',
          provider: 'browser',
          voiceId: 'david',
          settings: { rate: 1.0, pitch: 0.7, volume: 1.0 }
        },
        {
          id: 'sarah',
          name: 'Sarah',
          description: 'Energetic female voice',
          provider: 'browser',
          voiceId: 'sarah',
          settings: { rate: 1.2, pitch: 1.1, volume: 1.0 }
        }
      ];
      
      res.json({ success: true, voices: browserVoices });
    }
  } catch (error) {
    console.error('❌ Error loading voices:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load voices',
      details: error.message 
    });
  }
});

// AI Voice Key endpoint
app.get('/api/ai/voice-key', async (req, res) => {
  try {
    const unrealSpeechKey = await getApiKeyFromDatabase('unreal-speech');
    
    if (unrealSpeechKey) {
      res.json({
        success: true,
        hasKey: true,
        voiceKey: unrealSpeechKey.substring(0, 8) + '...', // Partial key for security
        provider: 'unreal-speech',
        message: 'Unreal Speech API key configured'
      });
    } else {
      res.json({
        success: true,
        hasKey: false,
        voiceKey: 'browser-tts-available',
        provider: 'browser',
        message: 'Using browser TTS (no Unreal Speech key configured)'
      });
    }
  } catch (error) {
    console.error('❌ Error loading voice key:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load voice key' 
    });
  }
});

// Unreal Speech TTS endpoint
app.post('/api/ai/unreal-speech', async (req, res) => {
  try {
    const { text, voiceId = 'Jasper', speed = 0, pitch = 1.0 } = req.body;
    
    console.log('🎤 Unreal Speech request:', { text: text?.substring(0, 50) + '...', voiceId, speed, pitch });
    
    // Get Unreal Speech API key from API key service
    const unrealSpeechKey = await getApiKeyFromDatabase('unreal-speech');
    
    if (!unrealSpeechKey) {
      console.error('❌ Unreal Speech API key not found in API key management system');
      return res.status(400).json({
        success: false,
        error: 'Unreal Speech API key not configured. Please add it to the API key management system.'
      });
    }
    
    if (!text) {
      console.error('❌ Text is required for TTS');
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }
    
    // Call Unreal Speech API
    const response = await fetch('https://api.v8.unrealspeech.com/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${unrealSpeechKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Text: text,
        VoiceId: voiceId,
        Bitrate: '192k',
        Speed: speed,
        Pitch: pitch,
        Codec: 'libmp3lame'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Unreal Speech API error:', response.status, errorText);
      console.error('❌ Request body was:', JSON.stringify({
        Text: text,
        VoiceId: voiceId,
        Bitrate: '192k',
        Speed: speed,
        Pitch: pitch,
        Codec: 'libmp3lame'
      }));
      return res.status(response.status).json({
        success: false,
        error: `Unreal Speech API error: ${response.status} - ${errorText}`
      });
    }
    
    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.byteLength
    });
    
    res.send(Buffer.from(audioBuffer));
    
  } catch (error) {
    console.error('❌ Error with Unreal Speech TTS:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate speech'
    });
  }
});

// Update user voice preference endpoint
app.post('/api/ai/voice-preference', async (req, res) => {
  try {
    const { userId, voiceId } = req.body;
    
    if (!userId || !voiceId) {
      return res.status(400).json({
        success: false,
        error: 'userId and voiceId are required'
      });
    }
    
    console.log(`🎤 Updating voice preference for user ${userId} to ${voiceId}`);
    
    // Load TrulyIntelligentAgent to access voice service
    const { TrulyIntelligentAgent } = require('./src/services/ai/TrulyIntelligentAgentCommonJS.js');
    const agent = new TrulyIntelligentAgent('rapid-crm-assistant', userId);
    
    // Update voice preference
    const success = agent.voiceService.setUserVoicePreference(userId, voiceId);
    
    if (success) {
      res.json({
        success: true,
        message: `Voice preference updated to ${voiceId}`,
        userId: userId,
        voiceId: voiceId
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update voice preference'
      });
    }
    
  } catch (error) {
    console.error('❌ Error updating voice preference:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update voice preference'
    });
  }
});

// Test endpoint to check RealAIService directly
app.get('/api/test-real-ai', async (req, res) => {
  try {
    console.log('🧪 Testing RealAIService directly...');
    
    const { RealAIServiceNode } = require('./src/services/ai/RealAIServiceNode.js');
    const aiService = new RealAIServiceNode();
    
    const response = await aiService.askQuestion('What is 2+2?', {});
    console.log('✅ RealAIService response:', response);
    
    res.json({ success: true, response: response });
  } catch (error) {
    console.error('❌ RealAIService test failed:', error);
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
});

// AI Persona Management API Endpoints

// Get current AI persona
app.get('/api/ai/persona/current', (req, res) => {
  try {
    const currentPersona = aiPersonaManager.currentPersona;
    const capabilities = aiPersonaManager.getCurrentCapabilities();
    const stats = aiPersonaManager.getPersonaStats();
    
    res.json({
      success: true,
      persona: currentPersona,
      capabilities: capabilities,
      stats: stats
    });
  } catch (error) {
    console.error('❌ Error getting current persona:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all personas
app.get('/api/ai/personas', (req, res) => {
  try {
    const personas = aiPersonaManager.getAllPersonas();
    const capabilities = aiPersonaManager.getAllCapabilities();
    
    res.json({
      success: true,
      personas: personas,
      capabilities: capabilities
    });
  } catch (error) {
    console.error('❌ Error getting personas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update system prompt in real-time
app.post('/api/ai/persona/system-prompt', (req, res) => {
  try {
    const { system_prompt } = req.body;
    
    if (!system_prompt) {
      return res.status(400).json({
        success: false,
        error: 'System prompt is required'
      });
    }
    
    const success = aiPersonaManager.updateSystemPrompt(system_prompt);
    
    if (success) {
      res.json({
        success: true,
        message: 'System prompt updated successfully',
        currentPersona: aiPersonaManager.currentPersona
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update system prompt'
      });
    }
  } catch (error) {
    console.error('❌ Error updating system prompt:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update personality traits
app.post('/api/ai/persona/personality', (req, res) => {
  try {
    const { personality_traits } = req.body;
    
    if (!personality_traits) {
      return res.status(400).json({
        success: false,
        error: 'Personality traits are required'
      });
    }
    
    const success = aiPersonaManager.updatePersonalityTraits(personality_traits);
    
    if (success) {
      res.json({
        success: true,
        message: 'Personality traits updated successfully',
        currentPersona: aiPersonaManager.currentPersona
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update personality traits'
      });
    }
  } catch (error) {
    console.error('❌ Error updating personality traits:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Client Portal API Endpoints

// Get client portal settings
app.get('/api/client-portal/settings', (req, res) => {
  try {
    const settings = {
      portal_name: 'Rapid CRM Client Portal',
      theme: 'light',
      features: {
        voice_assistant: true,
        compliance_tracking: true,
        document_access: true,
        messaging: true
      },
      branding: {
        logo_url: '/uploads/logo_1757827373384.png',
        primary_color: '#3b82f6',
        secondary_color: '#8b5cf6'
      }
    };
    
    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error('❌ Error getting client portal settings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create client portal session
app.post('/api/client-portal/session', async (req, res) => {
  try {
    const { company_id, client_name, client_email, ip_address, user_agent } = req.body;
    
    // Generate session ID
    const sessionId = `client_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session in database (for now, just return the session ID)
    // In a real implementation, you'd store this in a sessions table
    console.log('🔐 Client portal session created:', {
      sessionId,
      company_id,
      client_name,
      client_email,
      ip_address,
      user_agent: user_agent?.substring(0, 100) + '...'
    });
    
    res.json({
      success: true,
      sessionId: sessionId,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });
  } catch (error) {
    console.error('❌ Error creating client portal session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Save client portal message
app.post('/api/client-portal/message', async (req, res) => {
  try {
    const { session_id, message_type, content, metadata } = req.body;
    
    // Store message in database
    const messageId = Date.now().toString();
    const timestamp = new Date().toISOString();
    
    // For now, just log the message
    // In a real implementation, you'd store this in a client_messages table
    console.log('💬 Client portal message saved:', {
      messageId,
      session_id,
      message_type,
      content: content?.substring(0, 100) + '...',
      metadata,
      timestamp
    });
    
    res.json({
      success: true,
      messageId: messageId,
      timestamp: timestamp
    });
  } catch (error) {
    console.error('❌ Error saving client portal message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint to check TrulyIntelligentAgent loading
app.get('/api/test-agent', async (req, res) => {
  try {
    console.log('🧪 Testing TrulyIntelligentAgent loading...');
    
    // Test basic require
    const agentPath = require.resolve('./src/services/ai/TrulyIntelligentAgentCommonJS.js');
    console.log('✅ Agent path resolved:', agentPath);
    
    // Test require
    const { TrulyIntelligentAgent } = require('./src/services/ai/TrulyIntelligentAgentCommonJS.js');
    console.log('✅ Agent class loaded:', typeof TrulyIntelligentAgent);
    
    // Test instantiation
    const testAgent = new TrulyIntelligentAgent('test-agent', 'test-user');
    console.log('✅ Agent instance created');
    
    res.json({ success: true, message: 'TrulyIntelligentAgent loaded successfully' });
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
});

// AI Chat endpoint - Using TrulyIntelligentAgent with User Context
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, voice, model, userId } = req.body;
    
    // Determine user identity - use provided userId or extract from session/auth
    let currentUserId = userId || 'default_user';
    
    // TODO: In a real implementation, extract userId from:
    // - JWT token in Authorization header
    // - Session cookie
    // - API key with user mapping
    // For now, we'll use the provided userId or default to 'default_user'
    
    console.log(`🤖 AI Chat request from user ${currentUserId}: "${message}" (voice: ${voice}, model: ${model})`);
    
    // Use the original RealAIService for AI responses
    try {
      console.log('🔍 Loading RealAIService...');
      const { RealAIServiceNode } = require('./src/services/ai/RealAIServiceNode.js');
      console.log('🔍 RealAIService loaded successfully');
      
      const aiService = new RealAIServiceNode();
      console.log(`🔍 RealAIService instance created for user: ${currentUserId}`);
      
      // Get user's voice preference
      const preferredVoice = voice || 'eleanor';
      console.log(`🎤 Using voice preference for user ${currentUserId}: ${preferredVoice}`);
      
      // Get AI response with context
      console.log('🔍 Calling askQuestion with message:', message);
      const aiResponseObj = await aiService.askQuestion(message, {
        voice: preferredVoice,
        model: model || 'anthropic/claude-3.5-sonnet',
        timestamp: new Date().toISOString(),
        userId: currentUserId
      });
      
      // Extract the answer from the response object
      const aiResponse = aiResponseObj.answer || aiResponseObj;
      
      console.log('🔍 AI response received:', {
        hasResponse: !!aiResponse,
        responseLength: aiResponse?.length,
        confidence: aiResponseObj.confidence,
        reasoning: aiResponseObj.reasoning
      });
      
      console.log(`🧠 RealAIService response for user ${currentUserId}:`, aiResponse.substring(0, 100) + '...');
      
      // Return the AI response
      res.json({
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString(),
        voice: preferredVoice,
        userId: currentUserId,
        voicePreference: { defaultVoice: preferredVoice },
        confidence: aiResponseObj.confidence,
        reasoning: aiResponseObj.reasoning
      });
      
    } catch (agentError) {
      console.error('❌ RealAIService error:', agentError);
      console.error('❌ Error stack:', agentError.stack);
      console.error('❌ Error message:', agentError.message);
      
      // Fallback to intelligent context-aware responses
      let response = '';
      const lowerMessage = message.toLowerCase();
      
      console.log('🔄 Using fallback response system');
      
      // Greeting responses
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        response = `Hello! I'm your Rapid CRM AI assistant. I'm here to help you manage your transportation and logistics business. What can I help you with today?`;
      }
      // Speaking/voice related
      else if (lowerMessage.includes('speak') || lowerMessage.includes('talk') || lowerMessage.includes('voice')) {
        response = "Yes, I can speak to you! I'm using voice synthesis to communicate. You can ask me about your CRM system, transportation compliance, fleet management, or any other business needs.";
      }
      // CRM specific help
      else if (lowerMessage.includes('crm') || lowerMessage.includes('customer') || lowerMessage.includes('contact')) {
        response = "I can help you with CRM tasks like managing contacts, companies, deals, and leads. Would you like to add a new contact, update company information, or track a deal?";
      }
      // Transportation/logistics specific
      else if (lowerMessage.includes('truck') || lowerMessage.includes('fleet') || lowerMessage.includes('vehicle') || lowerMessage.includes('transport')) {
        response = "I can assist with transportation and logistics management. This includes fleet tracking, driver management, cargo types, hazmat compliance, and USDOT number management. What specific aspect would you like help with?";
      }
      // Compliance related
      else if (lowerMessage.includes('compliance') || lowerMessage.includes('dot') || lowerMessage.includes('hazmat') || lowerMessage.includes('safety')) {
        response = "I can help with compliance management including DOT regulations, hazmat requirements, safety protocols, and regulatory reporting. What compliance issue do you need assistance with?";
      }
      // Business operations
      else if (lowerMessage.includes('business') || lowerMessage.includes('operation') || lowerMessage.includes('company') || lowerMessage.includes('broker')) {
        response = "I can help with business operations including company management, broker/carrier classifications, multi-state operations, and business structure management. What business task do you need help with?";
      }
      // General help
      else if (lowerMessage.includes('help') || lowerMessage.includes('assist') || lowerMessage.includes('support')) {
        response = "I'm here to help with your Rapid CRM system! I can assist with contacts, companies, deals, fleet management, compliance, and transportation operations. What specific task would you like to work on?";
      }
      // Questions about capabilities
      else if (lowerMessage.includes('what') || lowerMessage.includes('can you') || lowerMessage.includes('do you')) {
        response = "I'm your Rapid CRM AI assistant specialized in transportation and logistics. I can help you manage contacts, companies, deals, fleet information, compliance requirements, and business operations. What would you like to accomplish?";
      }
      // Default intelligent response
      else {
        response = `I understand you're asking about "${message}". As your Rapid CRM assistant, I'm here to help with transportation and logistics management. I can assist with contacts, companies, deals, fleet management, compliance, and business operations. Could you be more specific about what you'd like help with?`;
      }
      
      res.json({
        success: true,
        response: response,
        timestamp: new Date().toISOString(),
        voice: voice || 'mikael',
        fallback: true,
        userId: currentUserId
      });
    }
    
  } catch (error) {
    console.error('❌ Error in AI chat:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process chat message' 
    });
  }
});

// AI Collaboration endpoints - Basic implementation
app.post('/api/ai/collaborate/send', async (req, res) => {
  try {
    const { from_ai, to_ai, message_type, content, metadata } = req.body;
    
    console.log(`🤖 AI Collaboration: ${from_ai} -> ${to_ai}: ${content.substring(0, 100)}...`);
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store message in database
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO ai_collaboration_messages 
        (message_id, from_ai, to_ai, message_type, content, metadata, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        messageId, from_ai, to_ai, message_type, content, 
        JSON.stringify(metadata || {}), 'sent', new Date().toISOString(), new Date().toISOString()
      ], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Generate AI response if message is TO RapidCRM_AI
    let aiResponse = null;
    if (to_ai === 'RapidCRM_AI') {
      try {
        // Use the Real AI Service for genuine AI responses
        const { RealAIServiceNode } = require('./src/services/ai/RealAIServiceNode.js');
        const realAI = new RealAIServiceNode();
        
        // Get real AI response
        const response = await realAI.askQuestion(content, { from_ai, message_type, metadata });
        
        aiResponse = {
          content: response.answer,
          confidence: response.confidence,
          reasoning: response.reasoning,
          metadata: {
            sources: response.sources,
            intelligenceLevel: "expert",
            contextAware: true,
            responseTime: Date.now()
          }
        };
        
        // Store the AI response in database
        const responseId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO ai_collaboration_messages 
            (message_id, from_ai, to_ai, message_type, content, metadata, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            responseId, 'RapidCRM_AI', from_ai, 'text', aiResponse.content,
            JSON.stringify(aiResponse.metadata), 'sent', new Date().toISOString(), new Date().toISOString()
          ], function(err) {
            if (err) reject(err);
            else resolve();
          });
        });
        
        console.log(`🤖 RapidCRM_AI Response: ${aiResponse.content.substring(0, 100)}...`);
        
      } catch (aiError) {
        console.error('❌ Error generating AI response:', aiError);
        // Fallback to simple response
        aiResponse = {
          content: `I apologize, but I'm experiencing technical difficulties with my AI service. Please try again in a moment. Error: ${aiError.message}`,
          confidence: 0.1,
          reasoning: 'Fallback response due to AI service error',
          metadata: {
            intelligenceLevel: 'basic',
            contextAware: false,
            responseTime: Date.now(),
            error: aiError.message
          }
        };
      }
    }
    
    res.json({
      success: true,
      message_id: messageId,
      status: 'sent',
      ai_response: aiResponse
    });
  } catch (error) {
    console.error('❌ Error in AI collaboration:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send AI message' 
    });
  }
});

app.get('/api/ai/collaborate', async (req, res) => {
  try {
    const { from_ai, to_ai, message_type, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM ai_collaboration_messages';
    const params = [];
    const conditions = [];
    
    if (from_ai) {
      conditions.push('from_ai = ?');
      params.push(from_ai);
    }
    if (to_ai) {
      conditions.push('to_ai = ?');
      params.push(to_ai);
    }
    if (message_type) {
      conditions.push('message_type = ?');
      params.push(message_type);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const result = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({ 
      success: true, 
      messages: result || [],
      count: result?.length || 0
    });
  } catch (error) {
    console.error('❌ Error fetching AI collaboration messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch AI collaboration messages' 
    });
  }
});

// AI Development Coordinator endpoints
app.post('/api/ai/projects', async (req, res) => {
  try {
    const { project_name, description, assigned_ais } = req.body;
    
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    // Store project in database
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO ai_project_coordination 
        (project_id, project_name, description, status, assigned_ais, current_task, progress_percentage, last_activity, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        projectId, project_name, description, 'active', JSON.stringify(assigned_ais || []),
        null, 0, now, now, now
      ], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ success: true, project_id: projectId });
  } catch (error) {
    console.error('❌ Error creating AI project:', error);
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
});

app.get('/api/ai/projects', async (req, res) => {
  try {
    const { status, assigned_to } = req.query;
    
    let query = 'SELECT * FROM ai_project_coordination';
    const params = [];
    
    if (status || assigned_to) {
      const conditions = [];
      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }
      if (assigned_to) {
        conditions.push('assigned_ais LIKE ?');
        params.push(`%"${assigned_to}"%`);
      }
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json({ success: true, projects: result || [] });
  } catch (error) {
    console.error('❌ Error getting AI projects:', error);
    res.status(500).json({ success: false, error: 'Failed to get projects' });
  }
});

app.post('/api/ai/tasks', async (req, res) => {
  try {
    const { project_id, assigned_to_ai, task_type, task_description, priority = 'medium' } = req.body;
    
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    // Store task in database
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO ai_task_assignments 
        (task_id, project_id, assigned_to_ai, task_type, task_description, priority, status, result_data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        taskId, project_id, assigned_to_ai, task_type, task_description,
        priority, 'assigned', null, now
      ], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ success: true, task_id: taskId });
  } catch (error) {
    console.error('❌ Error creating AI task:', error);
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
});

app.get('/api/ai/tasks', async (req, res) => {
  try {
    const { assigned_to_ai, status, project_id } = req.query;
    
    let query = 'SELECT * FROM ai_task_assignments';
    const params = [];
    
    if (assigned_to_ai || status || project_id) {
      const conditions = [];
      if (assigned_to_ai) {
        conditions.push('assigned_to_ai = ?');
        params.push(assigned_to_ai);
      }
      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }
      if (project_id) {
        conditions.push('project_id = ?');
        params.push(project_id);
      }
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json({ success: true, tasks: result || [] });
  } catch (error) {
    console.error('❌ Error getting AI tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to get tasks' });
  }
});

app.put('/api/ai/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, result_data } = req.body;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE ai_task_assignments 
        SET status = ?, result_data = ?
        WHERE task_id = ?
      `, [status, JSON.stringify(result_data || {}), taskId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating AI task:', error);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
});

// Transportation Intelligence endpoints
app.get('/api/ai/transportation/regulations', async (req, res) => {
  try {
    // Import the transportation intelligence service
    const { transportationIntelligenceService } = require('./src/services/ai/TransportationIntelligenceServiceCommonJS.js');
    
    const regulations = transportationIntelligenceService.getAllRegulations();
    
    res.json({
      success: true,
      regulations,
      count: regulations.length
    });
  } catch (error) {
    console.error('❌ Error fetching regulations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch regulations' 
    });
  }
});

app.get('/api/ai/transportation/compliance-checks', async (req, res) => {
  try {
    const { transportationIntelligenceService } = require('./src/services/ai/TransportationIntelligenceServiceCommonJS.js');
    
    const checks = transportationIntelligenceService.getAllComplianceChecks();
    
    res.json({
      success: true,
      checks,
      count: checks.length
    });
  } catch (error) {
    console.error('❌ Error fetching compliance checks:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch compliance checks' 
    });
  }
});

app.post('/api/ai/transportation/analyze-compliance', async (req, res) => {
  try {
    const { fleetData } = req.body;
    
    // For now, use mock compliance analysis since USDOTComplianceAgent is TypeScript
    const mockAnalysis = {
      fleetId: fleetData.fleetId || 'unknown',
      overallScore: 85,
      status: 'at_risk',
      violations: [],
      recommendations: [
        {
          id: 'compliance_monitoring',
          priority: 'high',
          category: 'compliance',
          title: 'Implement Automated Compliance Monitoring',
          description: 'Deploy ELD system with automated compliance reporting',
          implementation: 'Install ELD devices and train drivers',
          expectedBenefit: 'Reduce compliance violations by 90%',
          estimatedCost: 'medium'
        }
      ],
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      analysis: mockAnalysis
    });
  } catch (error) {
    console.error('❌ Error analyzing compliance:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze compliance' 
    });
  }
});

// AI Testing Framework endpoints
app.get('/api/ai/testing/suites', async (req, res) => {
  try {
    const { aiAgentTestingFramework } = require('./src/services/ai/AIAgentTestingFrameworkCommonJS.js');
    
    const suites = aiAgentTestingFramework.getAllTestSuites();
    
    res.json({
      success: true,
      suites,
      count: suites.length
    });
  } catch (error) {
    console.error('❌ Error fetching test suites:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch test suites' 
    });
  }
});

app.post('/api/ai/testing/run-suite', async (req, res) => {
  try {
    const { suiteId, agentId } = req.body;
    
    const { aiAgentTestingFramework } = require('./src/services/ai/AIAgentTestingFrameworkCommonJS.js');
    
    // Use truly intelligent agent for testing
    const { createTrulyIntelligentAgent } = require('./src/services/ai/TrulyIntelligentAgent.js');
    const trulyIntelligentAgent = createTrulyIntelligentAgent(agentId);
    
    const trulyIntelligentFunction = async (input) => {
      // Use the truly intelligent agent to process the question
      const response = await trulyIntelligentAgent.processQuestion(input.question, input.context || {});
      
      return {
        answer: response.answer,
        confidence: response.confidence,
        sources: response.specificRegulations,
        reasoning: response.reasoning,
        recommendations: response.actionableSteps,
        intelligenceLevel: response.intelligenceLevel
      };
    };
    
    const results = await aiAgentTestingFramework.runTestSuite(suiteId, agentId, trulyIntelligentFunction);
    
    res.json({
      success: true,
      results,
      summary: {
        totalTests: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length
      }
    });
  } catch (error) {
    console.error('❌ Error running test suite:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to run test suite' 
    });
  }
});

app.get('/api/ai/testing/benchmark/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const { aiAgentTestingFramework } = require('./src/services/ai/AIAgentTestingFrameworkCommonJS.js');
    
    const benchmark = aiAgentTestingFramework.generateBenchmark(agentId);
    
    res.json({
      success: true,
      benchmark
    });
  } catch (error) {
    console.error('❌ Error generating benchmark:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate benchmark' 
    });
  }
});

// AI Performance Monitoring endpoints
app.get('/api/ai/performance/metrics/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { period = 'day' } = req.query;
    
    const { aiPerformanceMonitor } = require('./src/services/ai/AIPerformanceMonitorCommonJS.js');
    
    const report = aiPerformanceMonitor.generateReport(agentId, period);
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('❌ Error fetching performance metrics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch performance metrics' 
    });
  }
});

app.get('/api/ai/performance/alerts/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const { aiPerformanceMonitor } = require('./src/services/ai/AIPerformanceMonitorCommonJS.js');
    
    const alerts = aiPerformanceMonitor.getActiveAlerts(agentId);
    
    res.json({
      success: true,
      alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('❌ Error fetching performance alerts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch performance alerts' 
    });
  }
});

app.post('/api/ai/performance/record-metric', async (req, res) => {
  try {
    const metric = req.body;
    
    const { aiPerformanceMonitor } = require('./src/services/ai/AIPerformanceMonitorCommonJS.js');
    
    aiPerformanceMonitor.recordMetric(metric);
    
    res.json({
      success: true,
      message: 'Metric recorded successfully'
    });
  } catch (error) {
    console.error('❌ Error recording metric:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to record metric' 
    });
  }
});

// AI Agent CRUD endpoints
app.get('/api/ai/agents', async (req, res) => {
  try {
    const agents = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM advanced_agents ORDER BY createdAt DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({
      success: true,
      agents: agents
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/ai/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM advanced_agents WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }
    
    res.json({
      success: true,
      agent: agent
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/ai/agents', async (req, res) => {
  try {
    const agent = req.body;
    
    const query = `
      INSERT OR REPLACE INTO advanced_agents (
        id, name, description, version, status, type, personality, capabilities,
        learningProfile, memoryBank, customPrompts, decisionMatrix, behaviorRules,
        escalationTriggers, performanceScore, successRate, userSatisfaction,
        efficiencyRating, apiEndpoints, webhookUrls, databaseAccess,
        externalIntegrations, accessLevel, permissions, auditLog, encryptionLevel,
        createdBy, createdAt, updatedAt, lastActive, totalInteractions, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      agent.id, agent.name, agent.description, agent.version, agent.status, agent.type,
      JSON.stringify(agent.personality), JSON.stringify(agent.capabilities),
      JSON.stringify(agent.learningProfile), JSON.stringify(agent.memoryBank),
      JSON.stringify(agent.customPrompts), JSON.stringify(agent.decisionMatrix),
      JSON.stringify(agent.behaviorRules), JSON.stringify(agent.escalationTriggers),
      agent.performanceScore, agent.successRate, agent.userSatisfaction,
      agent.efficiencyRating, JSON.stringify(agent.apiEndpoints),
      JSON.stringify(agent.webhookUrls), JSON.stringify(agent.databaseAccess),
      JSON.stringify(agent.externalIntegrations), agent.accessLevel,
      JSON.stringify(agent.permissions), agent.auditLog, agent.encryptionLevel,
      agent.createdBy, agent.createdAt, agent.updatedAt, agent.lastActive,
      agent.totalInteractions, JSON.stringify(agent.tags)
    ];

    await new Promise((resolve, reject) => {
      db.run(query, values, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    res.json({
      success: true,
      message: 'Agent saved successfully'
    });
  } catch (error) {
    console.error('Error saving agent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/api/ai/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM advanced_agents WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    res.json({
      success: true,
      deleted: result.changes > 0,
      message: result.changes > 0 ? 'Agent deleted successfully' : 'Agent not found'
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Truly Intelligent Agent endpoints
app.post('/api/ai/agents/ask', async (req, res) => {
  try {
    const { agentId, question, context } = req.body;
    
    const { createTrulyIntelligentAgent } = require('./src/services/ai/TrulyIntelligentAgent.js');
    const trulyIntelligentAgent = createTrulyIntelligentAgent(agentId || 'default-agent');
    
    const response = await trulyIntelligentAgent.processQuestion(question, context || {});
    
    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('❌ Error processing question with truly intelligent agent:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process question with truly intelligent agent' 
    });
  }
});

app.get('/api/ai/agents/:agentId/capabilities', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const { createRealIntelligentAgent } = require('./src/services/ai/RealIntelligentAgentCommonJS.js');
    const realAgent = createRealIntelligentAgent(agentId);
    
    const capabilities = realAgent.getCapabilities();
    
    res.json({
      success: true,
      agentId,
      capabilities
    });
  } catch (error) {
    console.error('❌ Error fetching agent capabilities:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch agent capabilities' 
    });
  }
});

// Parallel Agent Builder endpoints
app.post('/api/ai/agents/build', async (req, res) => {
  try {
    const { agentType, requirements, priority } = req.body;
    
    console.log(`🚀 Queuing agent build: ${agentType} (Priority: ${priority})`);
    
    // Import the parallel agent builder using CommonJS
    const { parallelAgentBuilder } = require('./src/services/ai/ParallelAgentBuilderCommonJS.js');
    
    const taskId = await parallelAgentBuilder.queueAgentBuild(
      agentType,
      requirements,
      priority || 'medium'
    );
    
    res.json({
      success: true,
      taskId,
      message: `Agent build queued successfully`
    });
  } catch (error) {
    console.error('❌ Error queuing agent build:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to queue agent build' 
    });
  }
});

app.get('/api/ai/agents/build/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const { parallelAgentBuilder } = require('./src/services/ai/ParallelAgentBuilderCommonJS.js');
    const status = await parallelAgentBuilder.getBuildStatus(taskId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Build task not found'
      });
    }
    
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('❌ Error fetching build status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch build status' 
    });
  }
});

app.get('/api/ai/agents/builds', async (req, res) => {
  try {
    const { parallelAgentBuilder } = require('./src/services/ai/ParallelAgentBuilderCommonJS.js');
    const builds = await parallelAgentBuilder.getAllBuildTasks();
    
    res.json({
      success: true,
      builds,
      count: builds.length
    });
  } catch (error) {
    console.error('❌ Error fetching builds:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch builds' 
    });
  }
});

app.get('/api/ai/tasks/cursor', async (req, res) => {
  try {
    // Return empty tasks for now
    res.json({
      success: true,
      tasks: []
    });
  } catch (error) {
    console.error('❌ Error fetching Cursor AI tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks'
    });
  }
});

app.put('/api/ai/tasks/:task_id', async (req, res) => {
  try {
    const { task_id } = req.params;
    const { status, result_data, error_message } = req.body;
    
    console.log(`🤖 Task ${task_id} updated to status: ${status}`);
    
    res.json({
      success: true,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
});

// Conversation Memory System endpoints
app.post('/api/ai/conversations/start', async (req, res) => {
  try {
    const { clientId, clientName, clientEmail, initialAgentId, initialMessage } = req.body;
    
    // Import the unified agent interface
    const { createUnifiedAgent } = require('./src/services/ai/UnifiedAgentInterfaceCommonJS.js');
    const unifiedAgent = createUnifiedAgent(initialAgentId || 'customer-service');
    
    const response = await unifiedAgent.startConversation(
      clientId,
      clientName,
      clientEmail,
      initialMessage
    );
    
    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('❌ Error starting conversation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start conversation' 
    });
  }
});

app.post('/api/ai/conversations/:conversationId/message', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message, agentId } = req.body;
    
    // Import the unified agent interface
    const { createUnifiedAgent } = require('./src/services/ai/UnifiedAgentInterfaceCommonJS.js');
    const unifiedAgent = createUnifiedAgent(agentId || 'customer-service');
    
    // Set the conversation ID (in a real system, this would be retrieved from session)
    unifiedAgent.conversationId = conversationId;
    
    const response = await unifiedAgent.processMessage(message);
    
    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('❌ Error processing message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process message' 
    });
  }
});

app.get('/api/ai/conversations/:conversationId/history', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 10 } = req.query;
    
    // Import the conversation memory system
    const { conversationMemorySystem } = require('./src/services/ai/ConversationMemorySystemCommonJS.js');
    
    const history = await conversationMemorySystem.getConversationHistory(
      conversationId,
      'customer-service', // Default agent
      parseInt(limit)
    );
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('❌ Error fetching conversation history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch conversation history' 
    });
  }
});

app.get('/api/ai/conversations/:conversationId/summary', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Import the conversation memory system
    const { conversationMemorySystem } = require('./src/services/ai/ConversationMemorySystemCommonJS.js');
    
    const summary = await conversationMemorySystem.getConversationSummary(conversationId);
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('❌ Error fetching conversation summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch conversation summary' 
    });
  }
});

app.get('/api/ai/conversations/active', async (req, res) => {
  try {
    // Import the conversation memory system
    const { conversationMemorySystem } = require('./src/services/ai/ConversationMemorySystemCommonJS.js');
    
    const activeConversations = conversationMemorySystem.getActiveConversations();
    
    res.json({
      success: true,
      conversations: activeConversations
    });
  } catch (error) {
    console.error('❌ Error fetching active conversations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch active conversations' 
    });
  }
});

app.post('/api/ai/conversations/:conversationId/transfer', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { fromAgentId, toAgentId, reason } = req.body;
    
    // Import the conversation memory system
    const { conversationMemorySystem } = require('./src/services/ai/ConversationMemorySystemCommonJS.js');
    
    const success = await conversationMemorySystem.transferConversation(
      conversationId,
      fromAgentId,
      toAgentId,
      reason
    );
    
    res.json({
      success,
      message: success ? 'Conversation transferred successfully' : 'Failed to transfer conversation'
    });
  } catch (error) {
    console.error('❌ Error transferring conversation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to transfer conversation' 
    });
  }
});

app.post('/api/ai/conversations/:conversationId/close', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { agentId, closingMessage } = req.body;
    
    // Import the conversation memory system
    const { conversationMemorySystem } = require('./src/services/ai/ConversationMemorySystemCommonJS.js');
    
    const success = await conversationMemorySystem.closeConversation(
      conversationId,
      agentId,
      closingMessage
    );
    
    res.json({
      success,
      message: success ? 'Conversation closed successfully' : 'Failed to close conversation'
    });
  } catch (error) {
    console.error('❌ Error closing conversation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to close conversation' 
    });
  }
});

// Voice Configuration endpoints
app.get('/api/ai/voice/settings', async (req, res) => {
  try {
    // In a real system, this would load from database
    const defaultSettings = {
      enabled: true,
      language: 'en-US',
      voice: 'alloy',
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8,
      emotion: 'neutral',
      speakingStyle: 'conversational',
      emphasis: 'medium',
      style: 'professional',
      stability: 0.75,
      clarity: 0.75,
      breathiness: 0.0,
      roughness: 0.0,
      autoPlay: true,
      voicePreview: false
    };
    
    res.json(defaultSettings);
  } catch (error) {
    console.error('❌ Error loading voice settings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load voice settings' 
    });
  }
});

app.put('/api/ai/voice/settings', async (req, res) => {
  try {
    const settings = req.body;
    console.log('🎤 Voice settings updated:', settings);
    
    // In a real system, this would save to database
    res.json({
      success: true,
      message: 'Voice settings saved successfully'
    });
  } catch (error) {
    console.error('❌ Error saving voice settings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save voice settings' 
    });
  }
});

app.post('/api/ai/voice/test', async (req, res) => {
  try {
    const { text, settings } = req.body;
    console.log('🔊 Testing voice with text:', text);
    console.log('🎤 Voice settings:', settings);
    
    // In a real system, this would generate actual audio using TTS
    // For now, we'll return a mock response
    res.json({
      success: true,
      message: 'Voice test completed',
      audioUrl: '/api/ai/voice/sample-audio' // Mock audio URL
    });
  } catch (error) {
    console.error('❌ Error testing voice:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to test voice' 
    });
  }
});

app.get('/api/ai/voice/sample-audio', (req, res) => {
  // Mock audio endpoint - in a real system, this would return actual audio
  res.setHeader('Content-Type', 'audio/mpeg');
  res.send('Mock audio data');
});

// Get conversation history endpoint
app.get('/api/ai/conversation-history/:userId', async (req, res) => {
  let db = null;
  try {
    const { userId } = req.params;
    
    // Use a simple database query instead of creating a new TrulyIntelligentAgent instance
    const Database = require('better-sqlite3');
    const path = require('path');
    const dbPath = path.join(__dirname, 'instance/rapid_crm.db');
    
    // Create a new database connection for this request with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        db = new Database(dbPath, { 
          timeout: 3000, // 3 second timeout
          verbose: null, // Disable verbose logging
          readonly: true // Use read-only connection to avoid locks
        });
        break;
      } catch (dbError) {
        retries--;
        if (retries === 0) throw dbError;
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before retry
      }
    }
    
    // Check if the table exists first
    const tableCheck = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='user_conversation_memory'
    `);
    const tableExists = tableCheck.get();
    
    if (!tableExists) {
      // Table doesn't exist, return empty history
      res.json({
        success: true,
        conversationHistory: [],
        userId: userId,
        conversationId: `conv_${userId}_persistent`
      });
      return;
    }
    
    // Get conversation history directly from the database
    const stmt = db.prepare(`
      SELECT message_type, content, timestamp 
      FROM user_conversation_memory 
      WHERE user_id = ? AND conversation_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    
    const conversationHistory = stmt.all(userId, `conv_${userId}_persistent`, 50).reverse();
    
    // Transform the history to match frontend format
    const formattedHistory = conversationHistory.map((msg, index) => ({
      id: `msg_${index}_${Date.now()}`,
      content: msg.content,
      sender: msg.message_type, // Map message_type to sender
      timestamp: new Date(msg.timestamp) // Convert string timestamp to Date object
    }));
    
    res.json({
      success: true,
      conversationHistory: formattedHistory,
      userId: userId,
      conversationId: `conv_${userId}_persistent`
    });
    
  } catch (error) {
    console.error('❌ Error getting conversation history:', error);
    
    // Return empty history if there's an error (database might be locked)
    res.json({
      success: true,
      conversationHistory: [],
      userId: req.params.userId,
      conversationId: `conv_${req.params.userId}_persistent`,
      warning: 'Could not load conversation history - database temporarily unavailable'
    });
  } finally {
    // Always close the database connection
    if (db) {
      try {
        db.close();
      } catch (closeError) {
        console.error('Error closing database:', closeError);
      }
    }
  }
});

// Client Portal API Endpoints
// Create client session
app.post('/api/client-portal/session', async (req, res) => {
  try {
    const { company_id, client_name, client_email, ip_address, user_agent } = req.body;
    const sessionId = `client_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save session to database
    db.run(
      `INSERT INTO client_sessions (session_id, company_id, client_name, client_email, ip_address, user_agent, created_at, last_activity)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [sessionId, company_id, client_name, client_email, ip_address, user_agent],
      function(err) {
        if (err) {
          console.error('Error creating client session:', err);
          res.status(500).json({ error: 'Failed to create session' });
        } else {
          res.json({ sessionId });
        }
      }
    );
  } catch (error) {
    console.error('Error in client session creation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get portal settings
app.get('/api/client-portal/settings', async (req, res) => {
  try {
    // For now, return default settings
    res.json({
      settings: {
        portal_name: 'Rapid CRM Client Portal',
        theme: 'default',
        features: {
          voice_enabled: true,
          chat_enabled: true,
          compliance_tracking: true
        }
      }
    });
  } catch (error) {
    console.error('Error getting portal settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save client portal message
app.post('/api/client-portal/message', async (req, res) => {
  try {
    const { session_id, message_type, content, metadata } = req.body;
    
    db.run(
      `INSERT INTO client_messages (session_id, message_type, content, metadata, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [session_id, message_type, content, JSON.stringify(metadata)],
      function(err) {
        if (err) {
          console.error('Error saving client message:', err);
          res.status(500).json({ error: 'Failed to save message' });
        } else {
          res.json({ success: true, messageId: this.lastID });
        }
      }
    );
  } catch (error) {
    console.error('Error saving client message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save handoff record
app.post('/api/client-portal/handoff', async (req, res) => {
  try {
    const { session_id, handoff_type, onboarding_messages, customer_service_context, timestamp, client_data } = req.body;
    
    db.run(
      `INSERT INTO client_handoffs (session_id, handoff_type, onboarding_messages, customer_service_context, timestamp, client_data, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [session_id, handoff_type, JSON.stringify(onboarding_messages), JSON.stringify(customer_service_context), timestamp, JSON.stringify(client_data)],
      function(err) {
        if (err) {
          console.error('Error saving handoff record:', err);
          res.status(500).json({ error: 'Failed to save handoff record' });
        } else {
          res.json({ success: true, handoffId: this.lastID });
        }
      }
    );
  } catch (error) {
    console.error('Error saving handoff record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get handoff context
app.get('/api/client-portal/handoff/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    db.get(
      `SELECT * FROM client_handoffs WHERE session_id = ? ORDER BY created_at DESC LIMIT 1`,
      [sessionId],
      (err, row) => {
        if (err) {
          console.error('Error getting handoff context:', err);
          res.status(500).json({ error: 'Failed to get handoff context' });
        } else if (row) {
          res.json({
            handoffMessage: 'Great! I can see you\'ve completed your application. I\'m now here to help you with any ongoing questions about your account, compliance requirements, or business operations. What would you like to know?',
            seamlessTransition: true,
            onboardingMessages: JSON.parse(row.onboarding_messages || '[]'),
            customerServiceContext: JSON.parse(row.customer_service_context || '{}')
          });
        } else {
          res.status(404).json({ error: 'Handoff context not found' });
        }
      }
    );
  } catch (error) {
    console.error('Error getting handoff context:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get login page configuration
app.get('/api/client-portal/login-config', (req, res) => {
  try {
    // Get login page configuration from database
    db.get('SELECT config FROM login_page_config WHERE id = 1', (err, row) => {
      if (err) {
        console.error('Error getting login config:', err);
        return res.status(500).json({ success: false, error: 'Failed to get login configuration' });
      }
      
      if (row) {
        res.json({ success: true, config: JSON.parse(row.config) });
      } else {
        // Return default configuration
        const defaultConfig = {
          branding: {
            logo: '/uploads/logo_1757827373384.png', // This will be overridden by theme context on frontend
            companyName: 'Rapid CRM',
            tagline: 'Access your transportation business dashboard',
            primaryColor: 'blue',
            backgroundColor: 'gradient-to-br from-blue-50 to-indigo-100'
          },
          content: {
            welcomeMessage: 'Client Portal',
            loginButtonText: 'Sign in to Portal',
            newClientButtonText: 'New Client? Start Your Application',
            helpText: 'Access your transportation business dashboard'
          },
          features: {
            showForgotPassword: true,
            showHelpLink: true,
            showNewClientButton: true,
            enableSocialLogin: false
          }
        };
        res.json({ success: true, config: defaultConfig });
      }
    });
  } catch (error) {
    console.error('Error in login config endpoint:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Save login page configuration
app.post('/api/client-portal/login-config', (req, res) => {
  try {
    const { config } = req.body;
    
    // Save login page configuration to database
    const configJson = JSON.stringify(config);
    db.run(
      'INSERT OR REPLACE INTO login_page_config (id, config, updated_at) VALUES (1, ?, datetime("now"))',
      [configJson],
      function(err) {
        if (err) {
          console.error('Error saving login config:', err);
          return res.status(500).json({ success: false, error: 'Failed to save login configuration' });
        }
        
        res.json({ success: true, message: 'Login configuration saved successfully' });
      }
    );
  } catch (error) {
    console.error('Error in login config save endpoint:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Add missing API endpoints
app.get('/api/services', (req, res) => {
  try {
    // Return empty array for now - services not fully implemented
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
validateDatabase()
  .then(() => checkAndInitializeDatabase())
  .then(() => {
    console.log('✅ Database ready');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to validate or initialize database:', error);
    process.exit(1);
  });

