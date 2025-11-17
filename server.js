// Load environment variables
require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Import AI Persona Manager
const aiPersonaManager = require('./src/services/ai/AIPersonaManager.js');

// Import modular components
const asyncHandler = require('./server/middleware/async-handler');
const { setupErrorHandling } = require('./server/error-handling');
const { validateCompanyData, validateContactData, sanitizeInput } = require('./server/middleware/validation');

// NOTE: API Key Service - using direct database access for security

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting - More permissive for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute instead of 15
  max: 1000, // 1000 requests per minute instead of 100 per 15 minutes
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Only apply rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
} else {
  // In development, use a very permissive rate limit
  const devLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10000, // Very high limit for development
  });
  app.use('/api/', devLimiter);
}

// CORS configuration - More permissive for development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    // Allow your production domain
    if (origin === 'https://yourdomain.com') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Input validation middleware
const validateInput = (req, res, next) => {
  // Basic input sanitization
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Remove potentially dangerous characters
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .trim();
      }
    }
  }
  next();
};

// Middleware
app.use(express.json());
app.use(validateInput);

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

// Enterprise Database Connection Pool
const { getConnectionPool } = require('./src/services/enterprise/DatabaseConnectionPool');
const { getResponseCache } = require('./src/services/enterprise/ResponseCache');
const { getRateLimiter } = require('./src/services/enterprise/RateLimiter');

// Initialize enterprise services
const connectionPool = getConnectionPool();
const responseCache = getResponseCache();
const rateLimiter = getRateLimiter();

// Legacy database connection for backward compatibility
const dbPath = path.join(__dirname, 'instance', 'rapid_crm.db');
const db = new sqlite3.Database(dbPath);

// Enable foreign key constraints for data integrity
db.run('PRAGMA foreign_keys = ON;', (err) => {
  if (err) {
    console.error('❌ Failed to enable foreign key constraints:', err);
  } else {
    console.log('✅ Foreign key constraints enabled');
  }
});

// Ensure critical tables exist
db.serialize(() => {
  // Create theme_settings table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS theme_settings (
      id TEXT PRIMARY KEY,
      theme TEXT NOT NULL DEFAULT 'dark',
      custom_theme TEXT,
      logo_url TEXT,
      company_name TEXT,
      company_info TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating theme_settings table:', err);
    } else {
      console.log('✅ theme_settings table ready');
    }
  });

  // Create alex_training tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS alex_training_scenarios (
      id TEXT PRIMARY KEY,
      scenario_data TEXT NOT NULL,
      state TEXT NOT NULL,
      operation_type TEXT NOT NULL,
      operation_radius TEXT NOT NULL,
      business_type TEXT NOT NULL,
      has_hazmat INTEGER NOT NULL DEFAULT 0,
      fleet_size TEXT NOT NULL,
      expected_usdot_required INTEGER NOT NULL,
      expected_mc_authority_required INTEGER NOT NULL,
      expected_hazmat_required INTEGER NOT NULL,
      expected_ifta_required INTEGER NOT NULL,
      expected_state_registration_required INTEGER NOT NULL,
      expected_reasoning TEXT NOT NULL,
      created_at TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating alex_training_scenarios table:', err);
    } else {
      console.log('✅ alex_training_scenarios table ready');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS alex_test_results (
      id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      test_session_id TEXT NOT NULL,
      alex_usdot_required INTEGER,
      alex_mc_authority_required INTEGER,
      alex_hazmat_required INTEGER,
      alex_ifta_required INTEGER,
      alex_state_registration_required INTEGER,
      alex_reasoning TEXT,
      alex_full_response TEXT,
      is_correct INTEGER,
      mistakes TEXT,
      reviewer_feedback TEXT,
      correct_answer TEXT,
      reviewed_by TEXT,
      reviewed_at TEXT,
      tested_at TEXT NOT NULL,
      response_time_ms INTEGER
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating alex_test_results table:', err);
    } else {
      console.log('✅ alex_test_results table ready');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS alex_training_sessions (
      id TEXT PRIMARY KEY,
      session_name TEXT,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      total_scenarios INTEGER NOT NULL DEFAULT 0,
      scenarios_completed INTEGER NOT NULL DEFAULT 0,
      scenarios_correct INTEGER NOT NULL DEFAULT 0,
      scenarios_incorrect INTEGER NOT NULL DEFAULT 0,
      scenarios_pending_review INTEGER NOT NULL DEFAULT 0,
      accuracy_percentage REAL,
      average_response_time_ms INTEGER,
      status TEXT NOT NULL DEFAULT 'in_progress',
      notes TEXT
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating alex_training_sessions table:', err);
    } else {
      console.log('✅ alex_training_sessions table ready');
    }
  });
});


// Enterprise API key retrieval with caching
const getApiKeyFromDatabase = async (provider) => {
  try {
    // Check cache first
    const cachedKey = responseCache.getCachedAPIKey(provider);
    if (cachedKey) {
      return cachedKey;
    }

    // Get from database using connection pool
    const row = await connectionPool.executeQueryOne(
      'SELECT key_value FROM api_keys WHERE provider = ?',
      [provider]
    );
    
    if (row) {
      const apiKey = row.key_value;
      responseCache.cacheAPIKey(provider, apiKey);
      return apiKey;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Enterprise API key retrieval error:', error);
    return null;
  }
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

// Add input sanitization to all routes
app.use(sanitizeInput);

// API Routes


// Companies
app.get('/api/companies', asyncHandler(async (req, res) => {
  const companies = await runQuery('SELECT * FROM companies');
  const transformedCompanies = companies.map(transformCompany).filter(Boolean);
  res.json(transformedCompanies);
}));

app.get('/api/companies/:id', asyncHandler(async (req, res) => {
  const company = await runQueryOne('SELECT * FROM companies WHERE id = ?', [req.params.id]);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }
  res.json(transformCompany(company));
}));

app.post('/api/companies', validateCompanyData, asyncHandler(async (req, res) => {
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
}));

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
    
    // For each deal, get its associated services
    const dealsWithServices = await Promise.all(deals.map(async (deal) => {
      const services = await runQuery(
        'SELECT * FROM deal_services WHERE deal_id = ?',
        [deal.id]
      );
      return {
        ...deal,
        services: services
      };
    }));
    
    res.json(dealsWithServices);
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
    
    // Get associated services
    const services = await runQuery(
      'SELECT * FROM deal_services WHERE deal_id = ?',
      [deal.id]
    );
    
    res.json({
      ...deal,
      services: services
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/deals', async (req, res) => {
  try {
    const { title, description, value, stage, probability, expectedCloseDate, companyId, contactId, services } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    // Calculate total value from services
    const totalValue = services ? services.reduce((sum, service) => sum + (service.customPrice || 0), 0) : value || 0;
    
    await runExecute(
      'INSERT INTO deals (id, title, description, value, stage, probability, expected_close_date, company_id, contact_id, total_value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, value, stage, probability, expectedCloseDate, companyId, contactId, totalValue, now, now]
    );
    
    // Add services to deal_services table
    if (services && services.length > 0) {
      for (const service of services) {
        const serviceId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        await runExecute(
          'INSERT INTO deal_services (id, deal_id, service_id, service_name, custom_price, start_date, end_date, next_renewal_date, renewal_status, auto_renewal, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [serviceId, id, service.serviceId, service.serviceName, service.customPrice, service.startDate, service.endDate, service.nextRenewalDate, 'active', service.autoRenewal || 0, now, now]
        );
      }
    }
    
    const deal = await runQueryOne('SELECT * FROM deals WHERE id = ?', [id]);
    const dealServices = await runQuery('SELECT * FROM deal_services WHERE deal_id = ?', [id]);
    
    res.status(201).json({
      ...deal,
      services: dealServices
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/deals/:id', async (req, res) => {
  try {
    const { title, description, value, stage, probability, expectedCloseDate, companyId, contactId, services } = req.body;
    const now = new Date().toISOString();
    
    // Calculate total value from services
    const totalValue = services ? services.reduce((sum, service) => sum + (service.customPrice || 0), 0) : value || 0;
    
    await runExecute(
      'UPDATE deals SET title = ?, description = ?, value = ?, stage = ?, probability = ?, expected_close_date = ?, company_id = ?, contact_id = ?, total_value = ?, updated_at = ? WHERE id = ?',
      [title, description, value, stage, probability, expectedCloseDate, companyId, contactId, totalValue, now, req.params.id]
    );
    
    // Update services if provided
    if (services) {
      // Delete existing services
      await runExecute('DELETE FROM deal_services WHERE deal_id = ?', [req.params.id]);
      
      // Add updated services
      for (const service of services) {
        const serviceId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        await runExecute(
          'INSERT INTO deal_services (id, deal_id, service_id, service_name, custom_price, start_date, end_date, next_renewal_date, renewal_status, auto_renewal, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [serviceId, req.params.id, service.serviceId, service.serviceName, service.customPrice, service.startDate, service.endDate, service.nextRenewalDate, service.renewalStatus || 'active', service.autoRenewal || 0, now, now]
        );
      }
    }
    
    const deal = await runQueryOne('SELECT * FROM deals WHERE id = ?', [req.params.id]);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    
    const dealServices = await runQuery('SELECT * FROM deal_services WHERE deal_id = ?', [req.params.id]);
    
    res.json({
      ...deal,
      services: dealServices
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/deals/:id', async (req, res) => {
  try {
    // Delete associated services first
    await runExecute('DELETE FROM deal_services WHERE deal_id = ?', [req.params.id]);
    
    // Delete the deal
    const result = await runExecute('DELETE FROM deals WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deal Services Management
app.get('/api/deals/:dealId/services', async (req, res) => {
  try {
    const services = await runQuery(
      'SELECT * FROM deal_services WHERE deal_id = ?',
      [req.params.dealId]
    );
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/deals/:dealId/services', async (req, res) => {
  try {
    const { serviceId, serviceName, customPrice, startDate, endDate, nextRenewalDate, autoRenewal } = req.body;
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    await runExecute(
      'INSERT INTO deal_services (id, deal_id, service_id, service_name, custom_price, start_date, end_date, next_renewal_date, renewal_status, auto_renewal, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.params.dealId, serviceId, serviceName, customPrice, startDate, endDate, nextRenewalDate, 'active', autoRenewal || 0, now, now]
    );
    
    const service = await runQueryOne('SELECT * FROM deal_services WHERE id = ?', [id]);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/deals/:dealId/services/:serviceId', async (req, res) => {
  try {
    const { serviceName, customPrice, startDate, endDate, nextRenewalDate, renewalStatus, autoRenewal } = req.body;
    const now = new Date().toISOString();
    
    await runExecute(
      'UPDATE deal_services SET service_name = ?, custom_price = ?, start_date = ?, end_date = ?, next_renewal_date = ?, renewal_status = ?, auto_renewal = ?, updated_at = ? WHERE id = ?',
      [serviceName, customPrice, startDate, endDate, nextRenewalDate, renewalStatus, autoRenewal, now, req.params.serviceId]
    );
    
    const service = await runQueryOne('SELECT * FROM deal_services WHERE id = ?', [req.params.serviceId]);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/deals/:dealId/services/:serviceId', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM deal_services WHERE id = ?', [req.params.serviceId]);
    res.json({ deleted: result.changes > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Renewal Management
app.get('/api/renewals/pending', async (req, res) => {
  try {
    // First check if deal_services table has any data
    const dealServicesCount = await runQuery('SELECT COUNT(*) as count FROM deal_services');
    
    if (dealServicesCount[0].count === 0) {
      // No deal services yet, return empty array
      res.json([]);
      return;
    }
    
    // Try to get pending renewals with company info
    let pendingRenewals;
    try {
      pendingRenewals = await runQuery(`
        SELECT ds.*, d.title as deal_title, d.company_id, c.legal_business_name as company_name
        FROM deal_services ds
        JOIN deals d ON ds.deal_id = d.id
        LEFT JOIN companies c ON d.company_id = c.id
        WHERE ds.renewal_status = 'active' 
        AND ds.next_renewal_date IS NOT NULL 
        AND ds.next_renewal_date <= date('now', '+30 days')
        ORDER BY ds.next_renewal_date ASC
      `);
    } catch (joinError) {
      // If join fails, just return deal services without company info
      pendingRenewals = await runQuery(`
        SELECT ds.*, d.title as deal_title
        FROM deal_services ds
        JOIN deals d ON ds.deal_id = d.id
        WHERE ds.renewal_status = 'active' 
        AND ds.next_renewal_date IS NOT NULL 
        AND ds.next_renewal_date <= date('now', '+30 days')
        ORDER BY ds.next_renewal_date ASC
      `);
    }
    
    res.json(pendingRenewals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/renewals/:serviceId/renew', async (req, res) => {
  try {
    const { renewalDate, newEndDate } = req.body;
    const now = new Date().toISOString();
    
    // Update the service with renewal information
    await runExecute(
      'UPDATE deal_services SET last_renewal_date = ?, end_date = ?, renewal_count = renewal_count + 1, updated_at = ? WHERE id = ?',
      [renewalDate, newEndDate, now, req.params.serviceId]
    );
    
    const service = await runQueryOne('SELECT * FROM deal_services WHERE id = ?', [req.params.serviceId]);
    res.json(service);
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

// Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await runQuery('SELECT * FROM tasks ORDER BY due_date ASC');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await runQueryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo, relatedTo } = req.body;
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await runExecute(
      `INSERT INTO tasks (
        id, title, description, due_date, priority, status, assigned_to,
        related_type, related_id, related_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        description || null,
        dueDate || null,
        priority || 'medium',
        status || 'pending',
        assignedTo || null,
        relatedTo?.type || null,
        relatedTo?.id || null,
        relatedTo?.name || null,
        now,
        now
      ]
    );

    const task = await runQueryOne('SELECT * FROM tasks WHERE id = ?', [id]);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo, relatedTo, completedAt } = req.body;
    const now = new Date().toISOString();

    await runExecute(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        due_date = COALESCE(?, due_date),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        assigned_to = COALESCE(?, assigned_to),
        related_type = COALESCE(?, related_type),
        related_id = COALESCE(?, related_id),
        related_name = COALESCE(?, related_name),
        completed_at = COALESCE(?, completed_at),
        updated_at = ?
      WHERE id = ?`,
      [
        title,
        description,
        dueDate,
        priority,
        status,
        assignedTo,
        relatedTo?.type,
        relatedTo?.id,
        relatedTo?.name,
        completedAt,
        now,
        req.params.id
      ]
    );

    const task = await runQueryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const result = await runExecute('DELETE FROM tasks WHERE id = ?', [req.params.id]);
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
    
    // Non-core feature schemas (SEO, ELD, IFTA) removed during strategic refactor
    // Training and qualified states tables are part of main schema.sql
    console.log('✅ Using core schema only - non-essential features removed');
    
    // Run credential management migrations
    await runCredentialManagementMigrations();
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

// Run credential management migrations
const runCredentialManagementMigrations = async () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Running credential management migrations...');
    
    const migrations = [
      // Add columns to users table (ALTER TABLE will fail if column exists, that's OK)
      `ALTER TABLE users ADD COLUMN login_gov_username TEXT`,
      `ALTER TABLE users ADD COLUMN login_gov_password_encrypted TEXT`,
      `ALTER TABLE users ADD COLUMN login_gov_mfa_method TEXT DEFAULT 'sms'`,
      `ALTER TABLE users ADD COLUMN login_gov_mfa_phone TEXT`,
      `ALTER TABLE users ADD COLUMN login_gov_backup_codes_encrypted TEXT`,
      `ALTER TABLE users ADD COLUMN fmcsa_account_verified INTEGER DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN fmcsa_verification_date TEXT`,
      `ALTER TABLE users ADD COLUMN last_credential_update TEXT`,
      
      // Create new tables (IF NOT EXISTS will prevent duplicates)
      `CREATE TABLE IF NOT EXISTS employee_identity_documents (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL,
        id_document_type TEXT NOT NULL,
        id_document_number TEXT,
        id_expiration_date TEXT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        middle_name TEXT,
        date_of_birth TEXT NOT NULL,
        id_document_front_path TEXT NOT NULL,
        id_document_back_path TEXT,
        selfie_path TEXT,
        idemia_verification_status TEXT DEFAULT 'not_verified',
        idemia_verification_date TEXT,
        idemia_verification_id TEXT,
        idemia_verification_result TEXT,
        idemia_failure_reason TEXT,
        uploaded_at TEXT NOT NULL,
        uploaded_by TEXT NOT NULL,
        last_updated TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS credential_access_log (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        credential_type TEXT NOT NULL,
        accessed_by_type TEXT NOT NULL,
        accessed_by_id TEXT,
        purpose TEXT NOT NULL,
        deal_id TEXT,
        rpa_instance_id TEXT,
        access_granted INTEGER DEFAULT 1,
        denial_reason TEXT,
        ip_address TEXT,
        user_agent TEXT,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS admin_idemia_verifications (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL,
        deal_id TEXT,
        rpa_instance_id TEXT,
        verification_type TEXT NOT NULL,
        verification_method TEXT DEFAULT 'idemia',
        status TEXT DEFAULT 'pending',
        started_at TEXT NOT NULL,
        completed_at TEXT,
        idemia_session_id TEXT,
        idemia_session_url TEXT,
        idemia_result TEXT,
        admin_id TEXT,
        admin_notes TEXT,
        manual_override INTEGER DEFAULT 0,
        ip_address TEXT,
        user_agent TEXT,
        duration_seconds INTEGER,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS rpa_audit_trail (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        action_type TEXT NOT NULL,
        deal_id TEXT NOT NULL,
        employee_id TEXT,
        rpa_instance_id TEXT NOT NULL,
        page_number INTEGER,
        page_url TEXT,
        field_name TEXT,
        field_value_hash TEXT,
        screenshot_path TEXT,
        success INTEGER DEFAULT 1,
        error_message TEXT,
        error_stack TEXT,
        ip_address TEXT,
        user_agent TEXT,
        session_id TEXT,
        duration_ms INTEGER,
        FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
      )`
    ];
    
    let completed = 0;
    let errors = 0;
    
    migrations.forEach((sql, index) => {
      db.run(sql, (err) => {
        completed++;
        
        if (err && !err.message.includes('duplicate column')) {
          // Ignore "duplicate column" errors (column already exists)
          errors++;
          console.log(`⚠️ Migration ${index + 1} warning:`, err.message.substring(0, 80));
        }
        
        if (completed === migrations.length) {
          if (errors > 0) {
            console.log(`✅ Migrations completed with ${errors} warnings (likely columns already exist)`);
          } else {
            console.log(`✅ Credential management migrations completed successfully`);
          }
          resolve();
        }
      });
    });
  });
};

// Legacy theme endpoint removed - using database version below

// Theme endpoints
app.get('/api/theme', async (req, res) => {
  try {
    console.log('🎨 Theme API called');
    const themeSettings = await runQueryOne('SELECT * FROM theme_settings ORDER BY updated_at DESC LIMIT 1');
    
    if (themeSettings) {
      const themeData = {
        theme: themeSettings.theme,
        customTheme: themeSettings.custom_theme ? JSON.parse(themeSettings.custom_theme) : null,
        logoUrl: themeSettings.logo_url,
        companyName: themeSettings.company_name,
        companyInfo: themeSettings.company_info ? JSON.parse(themeSettings.company_info) : null
      };
      console.log('🎨 Theme data loaded:', themeData);
      res.json(themeData);
    } else {
      // Return default theme if none exists
      const defaultTheme = {
        theme: 'dark',
        customTheme: null,
        logoUrl: null,
        companyName: null,
        companyInfo: null
      };
      console.log('🎨 Using default theme:', defaultTheme);
      res.json(defaultTheme);
    }
  } catch (error) {
    console.error('❌ Error loading theme:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load theme',
      details: error.message 
    });
  }
});

app.post('/api/theme', async (req, res) => {
  try {
    const { theme, customTheme, logoUrl, companyName, companyInfo } = req.body;
    console.log('🎨 Saving theme:', { theme, customTheme, logoUrl, companyName });
    
    const id = 'default_theme';
    const now = new Date().toISOString();
    
    // Check if theme settings already exist
    const existingTheme = await runQueryOne('SELECT id FROM theme_settings WHERE id = ?', [id]);
    
    if (existingTheme) {
      // Update existing theme
      await runExecute(
        'UPDATE theme_settings SET theme = ?, custom_theme = ?, logo_url = ?, company_name = ?, company_info = ?, updated_at = ? WHERE id = ?',
        [
          theme,
          customTheme ? JSON.stringify(customTheme) : null,
          logoUrl,
          companyName,
          companyInfo ? JSON.stringify(companyInfo) : null,
          now,
          id
        ]
      );
    } else {
      // Insert new theme
      await runExecute(
        'INSERT INTO theme_settings (id, theme, custom_theme, logo_url, company_name, company_info, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          theme,
          customTheme ? JSON.stringify(customTheme) : null,
          logoUrl,
          companyName,
          companyInfo ? JSON.stringify(companyInfo) : null,
          now,
          now
        ]
      );
    }
    
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

// Error handling endpoint
app.get('/api/errors/stats', (req, res) => {
  try {
    // Return mock error stats for now since the service might not be fully initialized
    const errorStats = {
      totalErrors: 0,
      errorsByCategory: {
        database: 0,
        api: 0,
        authentication: 0,
        validation: 0,
        external_service: 0,
        system: 0,
        unknown: 0
      },
      errorsBySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      recentErrors: [],
      averageResolutionTime: 0
    };
    
    res.json({
      success: true,
      errors: errorStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting error stats:', error);
    res.status(500).json({ error: 'Failed to get error stats' });
  }
});

// Performance monitoring endpoint
app.get('/api/performance/stats', (req, res) => {
  try {
    const { getDatabaseCacheService } = require('./src/services/enterprise/DatabaseCacheService');
    const { getResponseCache } = require('./src/services/enterprise/ResponseCache');
    
    const dbCache = getDatabaseCacheService();
    const responseCache = getResponseCache();
    
    const performanceReport = dbCache.getPerformanceReport();
    const cacheStats = responseCache.getStats();
    
    res.json({
      success: true,
      performance: performanceReport,
      cache: cacheStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting performance stats:', error);
    res.status(500).json({ error: 'Failed to get performance stats' });
  }
});

// RPA Agent API endpoints
app.post('/api/rpa/start-workflow', async (req, res) => {
  try {
    console.log('🤖 RPA workflow start request:', req.body);
    const { agentId, triggerData } = req.body;
    
    // Mock RPA workflow response for testing
    const mockResponse = {
      success: true,
      agentId: agentId,
      workflowId: `workflow_${Date.now()}`,
      status: 'started',
      currentStep: 1,
      totalSteps: 9,
      message: 'USDOT RPA workflow initiated successfully',
      estimatedCompletion: new Date(Date.now() + 45 * 60 * 1000).toISOString() // 45 minutes
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('❌ Error starting RPA workflow:', error);
    res.status(500).json({ error: 'Failed to start RPA workflow' });
  }
});

app.get('/api/rpa/workflow-status/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    console.log('🤖 RPA workflow status request:', workflowId);
    
    // Mock workflow status response
    const mockStatus = {
      workflowId: workflowId,
      status: 'in_progress',
      currentStep: 3,
      totalSteps: 9,
      progress: 33,
      currentAction: 'Filling company information',
      nextAction: 'Access USDOT application portal',
      estimatedTimeRemaining: 30, // minutes
      lastUpdated: new Date().toISOString()
    };
    
    res.json(mockStatus);
  } catch (error) {
    console.error('❌ Error getting RPA workflow status:', error);
    res.status(500).json({ error: 'Failed to get workflow status' });
  }
});

// Onboarding Agent API endpoints
app.post('/api/onboarding/chat', async (req, res) => {
  try {
    console.log('👋 Onboarding chat request:', req.body);
    const { message, userId } = req.body;
    
    // Mock onboarding agent response
    const mockResponse = {
      success: true,
      message: `Thank you for your interest in USDOT registration! I'm here to help you complete your USDOT application. Let's start by collecting some basic information about your business. What is your legal business name?`,
      nextQuestion: 'legal_business_name',
      currentStep: 1,
      totalSteps: 10,
      dataCollected: {},
      estimatedTime: 15 // minutes
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('❌ Error in onboarding chat:', error);
    res.status(500).json({ error: 'Failed to process onboarding request' });
  }
});

app.post('/api/onboarding/submit-data', async (req, res) => {
  try {
    console.log('📝 Onboarding data submission:', req.body);
    const { userId, applicationData } = req.body;
    
    // Mock data processing response
    const mockResponse = {
      success: true,
      applicationId: `app_${Date.now()}`,
      totalCost: 299,
      breakdown: {
        usdot: 200,
        compliance: 75,
        processing: 24
      },
      nextStep: 'payment',
      message: 'Your USDOT application data has been processed. Please proceed to payment to continue.'
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('❌ Error submitting onboarding data:', error);
    res.status(500).json({ error: 'Failed to submit application data' });
  }
});

// Customer Service Agent API endpoints
app.post('/api/customer-service/chat', async (req, res) => {
  try {
    console.log('🎧 Customer service chat request:', req.body);
    const { message, userId, clientId } = req.body;
    
    // Mock customer service response
    const mockResponse = {
      success: true,
      message: `Hello! I'm here to help with your transportation compliance needs. How can I assist you today?`,
      agentId: 'customer_service_001',
      sessionId: `session_${Date.now()}`,
      capabilities: [
        'Account support',
        'Service renewals',
        'Compliance questions',
        'Technical assistance',
        'Billing inquiries'
      ]
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('❌ Error in customer service chat:', error);
    res.status(500).json({ error: 'Failed to process customer service request' });
  }
});

// Google OAuth Configuration
async function setupGoogleOAuth() {
  try {
    const apiKeys = await runQuery('SELECT * FROM api_keys WHERE name LIKE "%Google OAuth%"');
    const clientIdKey = apiKeys.find(key => key.name.includes('Client ID'));
    const clientSecretKey = apiKeys.find(key => key.name.includes('Client Secret'));
    
    if (clientIdKey && clientSecretKey) {
      passport.use(new GoogleStrategy({
        clientID: clientIdKey.key_value,
        clientSecret: clientSecretKey.key_value,
        callbackURL: "/api/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if client exists
          let client = await runQueryOne('SELECT * FROM clients WHERE google_id = ?', [profile.id]);
          
          if (!client) {
            // Create new client account
            const clientId = Date.now().toString();
            const now = new Date().toISOString();
            
            await runExecute(`
              INSERT INTO clients (
                id, google_id, email, first_name, last_name, company_name, 
                role, is_active, created_at, last_login
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              clientId,
              profile.id,
              profile.emails[0].value,
              profile.name.givenName,
              profile.name.familyName,
              profile.emails[0].value.split('@')[1].split('.')[0],
              'client',
              1,
              now,
              now
            ]);
            
            client = await runQueryOne('SELECT * FROM clients WHERE google_id = ?', [profile.id]);
          } else {
            // Update last login
            await runExecute(
              'UPDATE clients SET last_login = ? WHERE google_id = ?',
              [new Date().toISOString(), profile.id]
            );
          }
          
          return done(null, client);
        } catch (error) {
          console.error('OAuth error:', error);
          return done(error, null);
        }
      }));
      
      console.log('✅ Google OAuth configured successfully');
    } else {
      console.log('⚠️ Google OAuth credentials not found in API keys');
    }
  } catch (error) {
    console.error('❌ Failed to setup Google OAuth:', error);
  }
}

// Initialize OAuth
setupGoogleOAuth();

// Session configuration
app.use(session({
  secret: 'rapid-crm-oauth-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await runQueryOne('SELECT * FROM clients WHERE id = ?', [id]);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth routes
app.get('/api/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
  (req, res) => {
    // Successful authentication, redirect to client dashboard
    res.redirect('/client-dashboard');
  }
);

// Client OAuth API endpoint
app.post('/api/clients/oauth', async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, companyName, role, isActive, createdAt, lastLogin } = req.body;
    
    // Check if client already exists
    const existingClient = await runQueryOne('SELECT * FROM clients WHERE google_id = ?', [googleId]);
    
    if (existingClient) {
      // Update existing client
      await runExecute(`
        UPDATE clients SET 
          email = ?, first_name = ?, last_name = ?, company_name = ?, 
          last_login = ?, updated_at = ?
        WHERE google_id = ?
      `, [email, firstName, lastName, companyName, lastLogin, new Date().toISOString(), googleId]);
      
      const updatedClient = await runQueryOne('SELECT * FROM clients WHERE google_id = ?', [googleId]);
      res.json(updatedClient);
    } else {
      // Create new client
      const clientId = Date.now().toString();
      const now = new Date().toISOString();
      
      await runExecute(`
        INSERT INTO clients (
          id, google_id, email, first_name, last_name, company_name, 
          role, is_active, created_at, last_login
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [clientId, googleId, email, firstName, lastName, companyName, role, isActive, now, lastLogin]);
      
      const newClient = await runQueryOne('SELECT * FROM clients WHERE id = ?', [clientId]);
      res.status(201).json(newClient);
    }
  } catch (error) {
    console.error('Error in client OAuth endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get client by Google ID
app.get('/api/clients/google/:googleId', async (req, res) => {
  try {
    const { googleId } = req.params;
    const client = await runQueryOne('SELECT * FROM clients WHERE google_id = ?', [googleId]);
    
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error) {
    console.error('Error getting client by Google ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update client last login
app.put('/api/clients/:id/login', async (req, res) => {
  try {
    const { id } = req.params;
    await runExecute(
      'UPDATE clients SET last_login = ? WHERE id = ?',
      [new Date().toISOString(), id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating client login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Security logging endpoint
app.post('/api/security/log', (req, res) => {
  try {
    const { type, userId, ipAddress, userAgent, details } = req.body;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      userId,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('User-Agent'),
      details
    };
    
    console.log('🔒 Security Event:', logEntry);
    
    res.json({ success: true, message: 'Security event logged' });
  } catch (error) {
    console.error('❌ Error logging security event:', error);
    res.status(500).json({ error: 'Failed to log security event' });
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
    const { text, voiceId = 'Jasper', speed = 0.1, pitch = 1.05 } = req.body;
    
    console.log('🎤 Unreal Speech request:', { 
      text: text?.substring(0, 50) + '...', 
      voiceId, 
      speed, 
      pitch,
      textLength: text?.length 
    });
    
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
    
    // Handle text chunking for Unreal Speech API (1000 character limit)
    const maxLength = 900; // Leave some buffer
    let textToSpeak = text;
    
    if (text.length > maxLength) {
      console.log('🎤 Text too long, chunking for TTS:', text.length, 'characters');
      
      // First, truncate to maxLength to ensure we don't exceed it
      let truncatedText = text.substring(0, maxLength);
      
      // Now find the best sentence break within this truncated text
      let breakPoint = maxLength;
      
      // Search for sentence endings in the last 200 characters of the truncated text
      const searchStart = Math.max(0, truncatedText.length - 200);
      const searchText = truncatedText.substring(searchStart);
      
      const lastPeriod = searchText.lastIndexOf('.');
      const lastExclamation = searchText.lastIndexOf('!');
      const lastQuestion = searchText.lastIndexOf('?');
      
      console.log('🎤 Sentence break positions in search area:', { 
        lastPeriod: lastPeriod + searchStart, 
        lastExclamation: lastExclamation + searchStart, 
        lastQuestion: lastQuestion + searchStart, 
        searchStart 
      });
      
      // Find the best break point within the search area
      const sentenceBreaks = [lastPeriod, lastExclamation, lastQuestion].filter(pos => pos >= 0);
      if (sentenceBreaks.length > 0) {
        const bestBreak = Math.max(...sentenceBreaks);
        breakPoint = searchStart + bestBreak + 1; // +1 to include the punctuation
        console.log('🎤 Found sentence break at position:', breakPoint);
      } else {
        // If no sentence break found, just use the truncated text
        breakPoint = maxLength;
        console.log('🎤 No sentence break found, using truncated text at:', breakPoint);
      }
      
      textToSpeak = text.substring(0, breakPoint).trim();
      console.log('🎤 Final chunk length:', textToSpeak.length, 'characters');
      console.log('🎤 Chunk preview:', textToSpeak.substring(0, 100) + '...');
    } else {
      console.log('🎤 Using full text:', text.length, 'characters');
    }
    
    // Final safety check - ensure we never exceed 1000 characters
    if (textToSpeak.length > 1000) {
      textToSpeak = textToSpeak.substring(0, 997) + '...';
      console.log('🎤 Final safety truncation to:', textToSpeak.length, 'characters');
    }
    
    // Call Unreal Speech API with proper error handling
    console.log('🎤 Calling Unreal Speech API with final text length:', textToSpeak.length);
    const response = await fetch('https://api.v8.unrealspeech.com/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${unrealSpeechKey}`,
        'Content-Type': 'application/json'
      },
        body: JSON.stringify({
          Text: textToSpeak,
          VoiceId: voiceId,
          Bitrate: '320k', // Higher quality audio
          Speed: speed,
          Pitch: pitch,
          Codec: 'libmp3lame'
        })
    });
    
    console.log('🎤 Unreal Speech API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Unreal Speech API error:', response.status, errorText);
      console.error('❌ Request body was:', JSON.stringify({
        Text: text.substring(0, 100) + '...',
        VoiceId: voiceId,
        Bitrate: '192k',
        Speed: speed,
        Pitch: pitch,
        Codec: 'libmp3lame'
      }));
      
      // Return a more specific error
      return res.status(500).json({
        success: false,
        error: `Unreal Speech API error: ${response.status} - ${errorText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          voiceId: voiceId,
          textLength: text.length
        }
      });
    }
    
    // Get the audio data
    console.log('🎤 Processing audio response...');
    const audioBuffer = await response.arrayBuffer();
    console.log('🎤 Audio buffer size:', audioBuffer.byteLength, 'bytes');
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.byteLength
    });
    
    res.send(Buffer.from(audioBuffer));
    console.log('✅ Unreal Speech response sent successfully');
    
  } catch (error) {
    console.error('❌ Error with Unreal Speech TTS:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to generate speech',
      details: error.message
    });
  }
});

// Fast Voice Synthesis endpoint using enterprise services
app.post('/api/ai/fast-voice', async (req, res) => {
  try {
    const { text, voice, userId } = req.body;
    
    console.log('⚡ Fast voice synthesis request:', { 
      text: text?.substring(0, 50) + '...', 
      voice, 
      userId,
      textLength: text?.length 
    });
    
    // Rate limiting for voice requests
    const rateLimitResult = rateLimiter.isVoiceRequestAllowed(userId);
    if (!rateLimitResult.allowed) {
      console.log(`🚫 Voice rate limit exceeded for user ${userId}`);
      return res.status(429).json({
        success: false,
        error: 'Voice rate limit exceeded',
        resetTime: rateLimitResult.resetTime
      });
    }
    
    // Check cache first
    const cacheKey = `voice_${voice}_${text.substring(0, 100).replace(/[^a-zA-Z0-9]/g, '')}`;
    const cachedAudio = responseCache.get(cacheKey);
    
    if (cachedAudio) {
      console.log('⚡ Voice cache hit');
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': cachedAudio.length,
        'X-Cache': 'HIT'
      });
      return res.send(cachedAudio);
    }
    
    // Get Unreal Speech API key
    const unrealSpeechKey = await getApiKeyFromDatabase('unreal-speech');
    
    if (!unrealSpeechKey) {
      console.error('❌ Unreal Speech API key not found');
      return res.status(400).json({
        success: false,
        error: 'Unreal Speech API key not configured'
      });
    }
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }
    
    // Handle text chunking for Unreal Speech API (1000 character limit)
    const maxLength = 900; // Leave some buffer
    let textToSpeak = text;
    
    if (text.length > maxLength) {
      console.log('⚡ Text too long, chunking for fast TTS:', text.length, 'characters');
      
      // First, truncate to maxLength to ensure we don't exceed it
      let truncatedText = text.substring(0, maxLength);
      
      // Now find the best sentence break within this truncated text
      let breakPoint = maxLength;
      
      // Search for sentence endings in the last 200 characters of the truncated text
      const searchStart = Math.max(0, truncatedText.length - 200);
      const searchText = truncatedText.substring(searchStart);
      
      const lastPeriod = searchText.lastIndexOf('.');
      const lastExclamation = searchText.lastIndexOf('!');
      const lastQuestion = searchText.lastIndexOf('?');
      
      // Find the best break point within the search area
      const sentenceBreaks = [lastPeriod, lastExclamation, lastQuestion].filter(pos => pos >= 0);
      if (sentenceBreaks.length > 0) {
        const bestBreak = Math.max(...sentenceBreaks);
        breakPoint = searchStart + bestBreak + 1; // +1 to include the punctuation
      } else {
        // If no sentence break found, just use the truncated text
        breakPoint = maxLength;
      }
      
      textToSpeak = text.substring(0, breakPoint).trim();
      console.log('⚡ Using first chunk:', textToSpeak.length, 'characters');
    } else {
      console.log('⚡ Using full text:', text.length, 'characters');
    }
    
    // Final safety check - ensure we never exceed 1000 characters
    if (textToSpeak.length > 1000) {
      textToSpeak = textToSpeak.substring(0, 997) + '...';
      console.log('⚡ Final safety truncation to:', textToSpeak.length, 'characters');
    }
    
    // Call Unreal Speech API
    console.log('⚡ Calling Unreal Speech API with final text length:', textToSpeak.length);
    const response = await fetch('https://api.v8.unrealspeech.com/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${unrealSpeechKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Text: textToSpeak,
        voiceId: (voice && voice.toLowerCase() === 'jasper') ? 'Jasper' : (voice || 'Jasper'),
        Bitrate: '128k', // Lower bitrate for faster processing
        Speed: 0,
        Pitch: 1.0,
        Codec: 'libmp3lame'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Fast voice API error:', response.status, errorText);
      return res.status(500).json({
        success: false,
        error: `Voice synthesis failed: ${response.status}`
      });
    }
    
    const audioBuffer = await response.arrayBuffer();
    const audioData = Buffer.from(audioBuffer);
    
    // Cache the result
    responseCache.set(cacheKey, audioData, 300000); // 5 minutes
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioData.length,
      'X-Cache': 'MISS',
      'X-Processing-Time': Date.now() - Date.now()
    });
    
    res.send(audioData);
    console.log('✅ Fast voice synthesis completed');
    
  } catch (error) {
    console.error('❌ Fast voice synthesis error:', error);
    res.status(500).json({
      success: false,
      error: 'Fast voice synthesis failed',
      details: error.message
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
    
    // Test asking a question
    const response = await testAgent.askQuestion('What are your capabilities?', {});
    console.log('✅ Agent response:', response);
    
    res.json({ 
      success: true, 
      message: 'TrulyIntelligentAgent loaded and working successfully',
      response: response
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
});

// Persistent Agent Session Manager for continuous chat
const agentSessions = new Map();

const getOrCreateAgent = (userId) => {
  if (!agentSessions.has(userId)) {
    console.log(`🧠 Creating new persistent agent session for user: ${userId}`);
    try {
      console.log(`🧠 Loading TrulyIntelligentAgent module...`);
      const { TrulyIntelligentAgent } = require('./src/services/ai/TrulyIntelligentAgentCommonJS.js');
      console.log(`🧠 TrulyIntelligentAgent class loaded successfully`);
      
      console.log(`🧠 Creating TrulyIntelligentAgent instance...`);
      const agent = new TrulyIntelligentAgent('rapid-crm-assistant', userId);
      console.log(`🧠 TrulyIntelligentAgent instance created successfully`);
      
      agentSessions.set(userId, {
        agent,
        lastActivity: Date.now()
      });
      console.log(`🧠 Persistent agent session created for user: ${userId}`);
    } catch (error) {
      console.error(`❌ Error creating agent for user ${userId}:`, error);
      console.error(`❌ Error stack:`, error.stack);
      console.error(`❌ Error message:`, error.message);
      console.error(`❌ Full error object:`, JSON.stringify(error, null, 2));
      throw error;
    }
  } else {
    // Update last activity
    agentSessions.get(userId).lastActivity = Date.now();
    console.log(`🧠 Using existing persistent agent session for user: ${userId}`);
  }
  return agentSessions.get(userId).agent;
};

// Cleanup inactive agent sessions every 30 minutes
setInterval(() => {
  const now = Date.now();
  const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
  
  for (const [userId, session] of agentSessions.entries()) {
    if (now - session.lastActivity > inactiveThreshold) {
      console.log(`🧹 Cleaning up inactive agent session for user: ${userId}`);
      agentSessions.delete(userId);
    }
  }
}, 30 * 60 * 1000); // Run every 30 minutes

// AI Chat endpoint - Using Persistent TrulyIntelligentAgent for continuous chat
app.post('/api/ai/chat', asyncHandler(async (req, res) => {
  const { message, voice, model, userId } = req.body;
    
    // Determine user identity - use provided userId or extract from session/auth
    let currentUserId = userId || 'default_user';
    
    console.log(`🤖 Enterprise AI Chat request from user ${currentUserId}: "${message}" (voice: ${voice}, model: ${model})`);
    
    // Rate limiting check
    const rateLimitResult = rateLimiter.isAIRequestAllowed(currentUserId);
    if (!rateLimitResult.allowed) {
      console.log(`🚫 Rate limit exceeded for user ${currentUserId}`);
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: rateLimitResult.reason,
        resetTime: rateLimitResult.resetTime,
        remaining: rateLimitResult.remaining
      });
    }
    
    // Use persistent TrulyIntelligentAgent for continuous chat experience
    try {
      console.log(`🧠 Attempting to get or create agent for user: ${currentUserId}`);
      const aiService = getOrCreateAgent(currentUserId);
      console.log(`🧠 Agent retrieved successfully for user: ${currentUserId}`);
      
      // Get user's voice preference
      const preferredVoice = voice || 'jasper';
      console.log(`🎤 Using voice preference for user ${currentUserId}: ${preferredVoice}`);
      
      // Cache voice preference
      responseCache.cacheVoicePreference(currentUserId, preferredVoice);
      
      // Get AI response with persistent memory and persona
      console.log('🧠 Calling askQuestion with message and persistent memory:', message);
      const aiResponseObj = await aiService.askQuestion(message, {
        voice: preferredVoice,
        model: model || 'anthropic/claude-3.5-sonnet',
        timestamp: new Date().toISOString(),
        userId: currentUserId,
        agentId: 'rapid-crm-assistant'
      });
      console.log('🧠 askQuestion completed successfully');
      
      // Extract the answer from the response object
      let aiResponse;
      if (typeof aiResponseObj === 'string') {
        aiResponse = aiResponseObj;
      } else if (typeof aiResponseObj === 'object' && aiResponseObj.answer) {
        // Extract the string answer from the object
        aiResponse = typeof aiResponseObj.answer === 'string' ? aiResponseObj.answer : String(aiResponseObj.answer);
      } else {
        aiResponse = String(aiResponseObj);
      }
      
      console.log('🧠 TrulyIntelligentAgent response received:', {
        hasResponse: !!aiResponse,
        responseLength: typeof aiResponse === 'string' ? aiResponse.length : 'N/A',
        confidence: aiResponseObj.confidence,
        reasoning: aiResponseObj.reasoning,
        processingTime: aiResponseObj.processingTime,
        memoryEnabled: aiResponseObj.memoryEnabled,
        conversationId: aiResponseObj.conversationId
      });
      
      const preview = typeof aiResponse === 'string' ? aiResponse.substring(0, 100) + '...' : JSON.stringify(aiResponse).substring(0, 100) + '...';
      console.log(`🧠 TrulyIntelligentAgent response for user ${currentUserId}:`, preview);
      
      // Return the AI response with rate limit headers
      res.set({
        'X-RateLimit-Limit': rateLimitResult.limit || 20,
        'X-RateLimit-Remaining': rateLimitResult.remaining || 0,
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime || Date.now() + 60000).toISOString()
      });
      
      res.json({
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString(),
        voice: preferredVoice,
        userId: currentUserId,
        voicePreference: { defaultVoice: preferredVoice },
        confidence: aiResponseObj.confidence,
        reasoning: aiResponseObj.reasoning,
        processingTime: aiResponseObj.processingTime,
        enterprise: true
      });
      
    } catch (agentError) {
      console.error('❌ Enterprise AI Service error:', agentError);
      console.error('❌ Error stack:', agentError.stack);
      console.error('❌ Error message:', agentError.message);
      console.error('❌ Full error object:', JSON.stringify(agentError, null, 2));
      
      // NO FALLBACK RESPONSES - Only return intelligent AI responses
      // If the TrulyIntelligentAgent fails, return an error instead of scripted responses
      console.log('❌ TrulyIntelligentAgent failed - returning error instead of fallback');
      res.status(500).json({
        success: false,
        error: 'AI Service temporarily unavailable',
        message: 'The intelligent AI service is currently experiencing issues. Please try again in a moment.',
        timestamp: new Date().toISOString(),
        userId: currentUserId,
        enterprise: true
      });
    }
    
}));

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
    const { TrulyIntelligentAgent } = require('./src/services/ai/TrulyIntelligentAgentCommonJS.js');
    const trulyIntelligentAgent = new TrulyIntelligentAgent(agentId, 'test-user');
    
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
      db.all('SELECT * FROM advanced_agents ORDER BY created_at DESC', (err, rows) => {
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
    
    const { TrulyIntelligentAgent } = require('./src/services/ai/TrulyIntelligentAgentCommonJS.js');
    const trulyIntelligentAgent = new TrulyIntelligentAgent(agentId || 'default-agent', 'api-user');
    
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
    
    const { RealAIServiceNode } = require('./src/services/ai/RealAIServiceNode.js');
    const realAgent = new RealAIServiceNode();
    
    // Return basic capabilities since this service doesn't have getCapabilities method
    const capabilities = {
      reasoning: true,
      contextAwareness: true,
      naturalLanguage: true,
      agentId: agentId
    };
    
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

// ===================================================================
// CLIENT PORTAL API ENDPOINTS
// ===================================================================

// Import Client Authentication Service
const ClientAuthService = require('./src/services/auth/ClientAuthService');
const clientAuthService = new ClientAuthService(db);

// Import Workflow Services
const { workflowEvents } = require('./src/services/workflows/WorkflowEventEmitter');
const WorkflowQueue = require('./src/services/workflows/WorkflowQueue');
const WorkflowDispatcher = require('./src/services/workflows/WorkflowDispatcher');

// Import Onboarding Services
const OnboardingFlowEngine = require('./src/services/onboarding/OnboardingFlowEngine');
const StateQualificationEngine = require('./src/services/compliance/StateQualificationEngine');

// Import Notification Services
const EmailService = require('./src/services/notifications/EmailService');
const SMSService = require('./src/services/notifications/SMSService');

// Import Document Services
const DocumentGenerationService = require('./src/services/documents/DocumentGenerationService');

// Initialize workflow services
const workflowQueue = new WorkflowQueue(db);
const workflowDispatcher = new WorkflowDispatcher(db);

// Initialize onboarding services
const onboardingEngine = new OnboardingFlowEngine(db);
const stateQualificationEngine = new StateQualificationEngine(db);

// Initialize notification services
const emailService = new EmailService();
const smsService = new SMSService();

// Initialize document services
const documentService = new DocumentGenerationService(db);

// Setup workflow event listeners
workflowEvents.on('payment.completed', async (data) => {
  console.log('💳 Payment completed event received, creating workflow...', data);
  
  try {
    // Get the deal to see what services were purchased
    db.get('SELECT * FROM deals WHERE id = ?', [data.dealId], async (err, deal) => {
      if (err || !deal) {
        console.error('❌ Deal not found for payment:', data.dealId);
        return;
      }

      // Get company data
      db.get('SELECT * FROM companies WHERE id = ?', [deal.company_id], async (err, company) => {
        if (err || !company) {
          console.error('❌ Company not found:', deal.company_id);
          return;
        }

        // Send payment confirmation email
        try {
          await emailService.sendPaymentConfirmation({
            customerEmail: deal.contact_email || company.email || company.first_name,
            customerName: deal.contact_name || `${company.first_name} ${company.last_name}`,
            amount: data.amount,
            services: data.services || [],
            dealId: data.dealId
          });
          console.log('✅ Payment confirmation email sent');
        } catch (error) {
          console.error('⚠️  Failed to send payment confirmation email:', error);
        }

        // Send payment confirmation SMS (if phone available)
        if (deal.contact_phone || company.phone) {
          try {
            await smsService.sendPaymentConfirmationSMS({
              phone: deal.contact_phone || company.phone,
              customerName: deal.contact_name || company.first_name,
              amount: data.amount,
              services: data.services || []
            });
            console.log('✅ Payment confirmation SMS sent');
          } catch (error) {
            console.error('⚠️  Failed to send payment confirmation SMS:', error);
          }
        }

        // Determine which workflows to create based on services
        const services = data.services || [];
        
        // Check if USDOT service was purchased
        const hasUSDOT = services.some(s => 
          s.toLowerCase().includes('usdot') || 
          s.toLowerCase().includes('dot number')
        );

        if (hasUSDOT) {
          await workflowQueue.addWorkflow({
            workflowType: 'usdot_filing',
            companyId: company.id,
            dealId: data.dealId,
            paymentTransactionId: data.paymentId,
            inputData: company,
            priority: 'high',
            assignedAgent: 'usdot_rpa'
          });
          console.log('✅ USDOT filing workflow created');
        }

        // Check if MC Number service was purchased
        const hasMC = services.some(s => 
          s.toLowerCase().includes('mc') || 
          s.toLowerCase().includes('operating authority')
        );

        if (hasMC) {
          await workflowQueue.addWorkflow({
            workflowType: 'mc_filing',
            companyId: company.id,
            dealId: data.dealId,
            paymentTransactionId: data.paymentId,
            inputData: company,
            priority: 'high',
            assignedAgent: 'mc_rpa'
          });
          console.log('✅ MC filing workflow created');
        }
      });
    });
  } catch (error) {
    console.error('❌ Error creating workflow from payment event:', error);
  }
});

// Listen for workflow completion to send notifications
workflowEvents.on('workflow.completed', async (data) => {
  console.log('✅ Workflow completed, sending notifications...', data.workflowId);
  
  try {
    // Get company/deal data
    db.get('SELECT * FROM deals WHERE id = ?', [data.dealId], async (err, deal) => {
      if (err || !deal) {
        console.log('⚠️  Deal not found for notification');
        return;
      }

      db.get('SELECT * FROM companies WHERE id = ?', [data.companyId], async (err, company) => {
        if (err || !company) {
          console.log('⚠️  Company not found for notification');
          return;
        }

        // Send completion email
        try {
          await emailService.sendWorkflowCompletionNotification({
            customerEmail: deal.contact_email || company.email,
            customerName: deal.contact_name || company.first_name,
            workflowType: data.workflowType,
            result: data.result || {}
          });
          console.log('✅ Workflow completion email sent');
        } catch (error) {
          console.error('⚠️  Failed to send completion email:', error);
        }

        // Send completion SMS
        if (deal.contact_phone || company.phone) {
          try {
            await smsService.sendWorkflowCompletionSMS({
              phone: deal.contact_phone || company.phone,
              customerName: deal.contact_name || company.first_name,
              workflowType: data.workflowType,
              result: data.result || {}
            });
            console.log('✅ Workflow completion SMS sent');
          } catch (error) {
            console.error('⚠️  Failed to send completion SMS:', error);
          }
        }
      });
    });
  } catch (error) {
    console.error('❌ Error sending workflow completion notifications:', error);
  }
});

// Client Portal Login
app.post('/api/client-portal/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Authenticate user
    const result = await clientAuthService.authenticate(email, password, ipAddress);

    if (result.success) {
      res.json({
        success: true,
        client: result.client,
        sessionToken: result.sessionToken
      });
    } else {
      res.status(401).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error in client portal login:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during login. Please try again.'
    });
  }
});

// Client Portal Logout
app.post('/api/client-portal/logout', async (req, res) => {
  try {
    const { sessionToken } = req.body;
    
    if (sessionToken) {
      await clientAuthService.logout(sessionToken);
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('❌ Error in client portal logout:', error);
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
});

// Validate Session (for protected routes)
app.post('/api/client-portal/validate-session', async (req, res) => {
  try {
    const { sessionToken } = req.body;
    
    if (!sessionToken) {
      return res.status(401).json({ success: false, error: 'No session token provided' });
    }
    
    const user = await clientAuthService.validateSession(sessionToken);
    
    if (user) {
      res.json({ success: true, valid: true, user });
    } else {
      res.status(401).json({ success: false, valid: false, error: 'Invalid or expired session' });
    }
  } catch (error) {
    console.error('❌ Error validating session:', error);
    res.status(500).json({ success: false, error: 'Session validation failed' });
  }
});

// Create Client User (Admin only - for setting up client portal access)
app.post('/api/client-portal/users', async (req, res) => {
  try {
    const { companyId, email, password, firstName, lastName, phone, contactId } = req.body;
    
    // TODO: Add admin authentication check
    
    if (!companyId || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const userId = await clientAuthService.createUser({
      companyId,
      email,
      password,
      firstName,
      lastName,
      phone,
      contactId,
      role: 'client',
      createdBy: 'admin' // TODO: Get from session
    });
    
    res.json({
      success: true,
      userId,
      message: 'Client user created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating client user:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create client user'
    });
  }
});

// Create client session (for chat widget / anonymous users)
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

// Save portal design configuration
app.post('/api/client-portal/design', (req, res) => {
  try {
    const design = req.body;
    
    // Save portal design to database
    const designJson = JSON.stringify(design);
    db.run(
      'INSERT OR REPLACE INTO portal_designs (id, design, updated_at) VALUES (1, ?, datetime("now"))',
      [designJson],
      function(err) {
        if (err) {
          console.error('Error saving portal design:', err);
          return res.status(500).json({ success: false, error: 'Failed to save portal design' });
        }
        
        res.json({ success: true, message: 'Portal design saved successfully' });
      }
    );
  } catch (error) {
    console.error('Error in portal design save endpoint:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get portal design configuration
app.get('/api/client-portal/design', (req, res) => {
  try {
    db.get('SELECT design FROM portal_designs WHERE id = 1', (err, row) => {
      if (err) {
        console.error('Error loading portal design:', err);
        return res.status(500).json({ error: 'Failed to load portal design' });
      }
      
      if (!row) {
        return res.json({ elements: [], customCSS: '', breakpoint: 'desktop' });
      }
      
      res.json(JSON.parse(row.design));
    });
  } catch (error) {
    console.error('Error in portal design get endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save avatar configuration
app.post('/api/client-portal/avatar-config', (req, res) => {
  try {
    const config = req.body;
    
    // Save avatar config to database
    const configJson = JSON.stringify(config);
    db.run(
      'INSERT OR REPLACE INTO avatar_configs (id, config, updated_at) VALUES (1, ?, datetime("now"))',
      [configJson],
      function(err) {
        if (err) {
          console.error('Error saving avatar config:', err);
          return res.status(500).json({ success: false, error: 'Failed to save avatar configuration' });
        }
        
        res.json({ success: true, message: 'Avatar configuration saved successfully' });
      }
    );
  } catch (error) {
    console.error('Error in avatar config save endpoint:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get avatar configuration
app.get('/api/client-portal/avatar-config', (req, res) => {
  try {
    db.get('SELECT config FROM avatar_configs WHERE id = 1', (err, row) => {
      if (err) {
        console.error('Error loading avatar config:', err);
        return res.status(500).json({ error: 'Failed to load avatar configuration' });
      }
      
      if (!row) {
        return res.json({});
      }
      
      res.json(JSON.parse(row.config));
    });
  } catch (error) {
    console.error('Error in avatar config get endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===================================================================
// PAYMENT API ENDPOINTS
// ===================================================================

// Import and initialize PaymentService
const { initializePaymentService } = require('./src/services/payments/PaymentService.js');
let paymentService;

// Initialize payment service after database is ready
setTimeout(() => {
  try {
    paymentService = initializePaymentService(db);
    console.log('💳 Payment service initialized');
  } catch (error) {
    console.error('❌ Failed to initialize payment service:', error);
  }
}, 1000);

// Get available payment providers
app.get('/api/payments/providers', (req, res) => {
  try {
    if (!paymentService) {
      return res.status(503).json({ error: 'Payment service not initialized' });
    }

    const providers = paymentService.getAvailableProviders();
    const activeProvider = paymentService.getActiveProvider();

    res.json({
      providers,
      active: activeProvider.name,
      configured: providers.filter(p => p.configured).length,
      total: providers.length
    });
  } catch (error) {
    console.error('❌ Error getting payment providers:', error);
    res.status(500).json({ error: 'Failed to get payment providers' });
  }
});

// Set active payment provider
app.post('/api/payments/providers/active', async (req, res) => {
  try {
    if (!paymentService) {
      return res.status(503).json({ error: 'Payment service not initialized' });
    }

    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({ error: 'Provider name is required' });
    }

    await paymentService.setActiveProvider(provider);

    res.json({
      success: true,
      activeProvider: provider,
      message: `Switched to ${provider}`
    });
  } catch (error) {
    console.error('❌ Error setting active provider:', error);
    res.status(400).json({ error: error.message });
  }
});

// Test provider connection
app.post('/api/payments/providers/:provider/test', async (req, res) => {
  try {
    if (!paymentService) {
      return res.status(503).json({ error: 'Payment service not initialized' });
    }

    const { provider } = req.params;
    const success = await paymentService.testProviderConnection(provider);

    res.json({
      success,
      provider,
      message: success ? `${provider} connection successful` : `${provider} connection failed`
    });
  } catch (error) {
    console.error('❌ Error testing provider:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create checkout session
app.post('/api/payments/checkout', async (req, res) => {
  try {
    if (!paymentService) {
      return res.status(503).json({ error: 'Payment service not initialized' });
    }

    const { dealId, companyId, services, amount, currency, customerEmail, description } = req.body;

    // Validate required fields
    if (!dealId || !amount || !customerEmail) {
      return res.status(400).json({
        error: 'Missing required fields: dealId, amount, customerEmail'
      });
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;

    const session = await paymentService.createCheckoutSession({
      dealId,
      companyId,
      services: services || [],
      amount,
      currency: currency || 'USD',
      customerEmail,
      description: description || `Payment for services: ${services?.join(', ')}`,
      successUrl: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/payment/cancel`,
      metadata: {
        dealId,
        companyId,
        source: 'rapid_crm'
      }
    });

    // Save transaction to database
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO payment_transactions (
        id, provider, provider_session_id, deal_id, company_id,
        amount, currency, description, status, customer_email,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionId,
        paymentService.getActiveProvider().name.toLowerCase(),
        session.sessionId,
        dealId,
        companyId,
        amount,
        currency || 'USD',
        description || 'Payment for services',
        'pending',
        customerEmail,
        now,
        now
      ],
      function(err) {
        if (err) {
          console.error('Failed to save transaction:', err);
        }
      }
    );

    res.json({
      success: true,
      session,
      transactionId
    });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

// Webhook endpoint (handles all providers)
app.post('/api/payments/webhook/:provider', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!paymentService) {
      return res.status(503).send('Payment service not initialized');
    }

    const { provider } = req.params;
    
    // Verify webhook signature
    const isValid = await paymentService.verifyWebhookSignature(provider, {
      body: req.body,
      headers: req.headers,
      rawBody: req.body
    });

    if (!isValid) {
      console.error(`❌ Invalid webhook signature from ${provider}`);
      return res.status(401).send('Invalid signature');
    }

    // Handle webhook
    const result = await paymentService.handleWebhook(provider, {
      body: req.body,
      headers: req.headers,
      rawBody: req.body
    });

    // Log webhook
    const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    db.run(
      `INSERT INTO payment_webhooks (id, provider, event_type, event_id, verified, payload, received_at)
       VALUES (?, ?, ?, ?, 1, ?, datetime('now'))`,
      [webhookId, provider, result.eventType, result.paymentId || '', JSON.stringify(req.body)]
    );

    // Handle payment completion
    if (result.eventType === 'payment.completed' || result.eventType === 'payment.succeeded') {
      // Update transaction status
      db.run(
        `UPDATE payment_transactions 
         SET status = 'succeeded', 
             provider_payment_id = ?,
             paid_at = datetime('now'),
             updated_at = datetime('now'),
             metadata = ?
         WHERE provider_session_id = ? OR provider_payment_id = ?`,
        [result.paymentId, JSON.stringify(result.metadata || {}), result.sessionId, result.paymentId],
        (err) => {
          if (err) {
            console.error('❌ Error updating payment transaction:', err);
            return;
          }

          console.log(`✅ Payment completed: ${result.paymentId}`);
          console.log(`   Deal ID: ${result.metadata?.dealId}`);
          console.log(`   Amount: ${result.amount} ${result.currency}`);

          // 🎯 TRIGGER WORKFLOW AUTOMATION
          workflowEvents.emitPaymentCompleted({
            paymentId: result.paymentId,
            dealId: result.metadata?.dealId,
            companyId: result.metadata?.companyId,
            amount: result.amount,
            currency: result.currency,
            services: result.metadata?.services?.split(',') || []
          });
        }
      );
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error handling webhook:', error);
    res.status(500).send('Webhook handling failed');
  }
});

// Get payment status
app.get('/api/payments/:paymentId/status', async (req, res) => {
  try {
    if (!paymentService) {
      return res.status(503).json({ error: 'Payment service not initialized' });
    }

    const { paymentId } = req.params;
    const status = await paymentService.getPaymentStatus(paymentId);

    res.json({ success: true, status });
  } catch (error) {
    console.error('❌ Error getting payment status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Refund payment
app.post('/api/payments/:paymentId/refund', async (req, res) => {
  try {
    if (!paymentService) {
      return res.status(503).json({ error: 'Payment service not initialized' });
    }

    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const result = await paymentService.refundPayment({
      paymentId,
      amount,
      reason
    });

    if (result.success) {
      // Save refund to database
      const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      db.run(
        `INSERT INTO payment_refunds (id, transaction_id, provider_refund_id, amount, currency, reason, status, created_at, updated_at)
         SELECT ?, id, ?, ?, currency, ?, ?, datetime('now'), datetime('now')
         FROM payment_transactions WHERE provider_payment_id = ?`,
        [refundId, result.refundId, result.amount, reason, result.status, paymentId]
      );

      // Update transaction
      db.run(
        `UPDATE payment_transactions 
         SET status = 'refunded', refunded_at = datetime('now'), updated_at = datetime('now')
         WHERE provider_payment_id = ?`,
        [paymentId]
      );
    }

    res.json({ success: result.success, result });
  } catch (error) {
    console.error('❌ Error refunding payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment transactions
app.get('/api/payments/transactions', async (req, res) => {
  try {
    const { dealId, companyId, status } = req.query;
    let query = 'SELECT * FROM payment_transactions WHERE 1=1';
    const params = [];

    if (dealId) {
      query += ' AND deal_id = ?';
      params.push(dealId);
    }

    if (companyId) {
      query += ' AND company_id = ?';
      params.push(companyId);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching transactions:', err);
        return res.status(500).json({ error: 'Failed to fetch transactions' });
      }

      res.json({ transactions: rows });
    });
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===================================================================
// ONBOARDING AGENT API ENDPOINTS
// ===================================================================

// Start onboarding session
app.post('/api/onboarding/start', async (req, res) => {
  try {
    const { initialData = {} } = req.body;
    const sessionId = `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = await onboardingEngine.startSession(sessionId, initialData);
    const firstQuestion = onboardingEngine.getNextQuestion('greeting');
    
    res.json({
      success: true,
      sessionId,
      question: firstQuestion.question,
      type: firstQuestion.type,
      progress: 0
    });
  } catch (error) {
    console.error('❌ Error starting onboarding:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process onboarding response
app.post('/api/onboarding/respond', async (req, res) => {
  try {
    const { sessionId, response } = req.body;
    
    if (!sessionId || response === undefined) {
      return res.status(400).json({ error: 'Missing sessionId or response' });
    }
    
    const nextStep = await onboardingEngine.processResponse(sessionId, response);
    
    res.json({
      success: true,
      ...nextStep
    });
  } catch (error) {
    console.error('❌ Error processing onboarding response:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get onboarding session status
app.get('/api/onboarding/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const progress = await onboardingEngine.getSessionProgress(sessionId);
    
    if (!progress) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ success: true, progress });
  } catch (error) {
    console.error('❌ Error getting session status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze business requirements (direct API)
app.post('/api/onboarding/analyze', async (req, res) => {
  try {
    const businessData = req.body;
    
    // Validate data
    const validation = stateQualificationEngine.validateBusinessData(businessData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Incomplete business data',
        missingFields: validation.missingFields,
        warnings: validation.warnings
      });
    }
    
    // Analyze requirements
    const analysis = await stateQualificationEngine.analyzeBusinessRequirements(businessData);
    
    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    console.error('❌ Error analyzing requirements:', error);
    res.status(500).json({ error: error.message });
  }
});

// Calculate compliance cost
app.post('/api/onboarding/calculate-cost', async (req, res) => {
  try {
    const businessData = req.body;
    const costAnalysis = await stateQualificationEngine.calculateComplianceCost(businessData);
    
    res.json({
      success: true,
      ...costAnalysis
    });
  } catch (error) {
    console.error('❌ Error calculating cost:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===================================================================
// WORKFLOW API ENDPOINTS
// ===================================================================

// Get workflow queue status
app.get('/api/workflows/queue', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    let workflows;
    if (status) {
      workflows = await workflowQueue.getWorkflowsByStatus(status, parseInt(limit));
    } else {
      workflows = await workflowQueue.getPendingWorkflows(parseInt(limit));
    }
    
    res.json({ workflows, count: workflows.length });
  } catch (error) {
    console.error('❌ Error getting workflow queue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get workflow by ID
app.get('/api/workflows/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const workflow = await workflowQueue.getWorkflow(workflowId);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    // Get execution history
    const history = await workflowQueue.getExecutionHistory(workflowId);
    
    res.json({ workflow, history });
  } catch (error) {
    console.error('❌ Error getting workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get workflows requiring intervention
app.get('/api/workflows/intervention-required', async (req, res) => {
  try {
    const workflows = await workflowQueue.getInterventionRequired();
    res.json({ workflows, count: workflows.length });
  } catch (error) {
    console.error('❌ Error getting intervention workflows:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get queue statistics
app.get('/api/workflows/stats', async (req, res) => {
  try {
    const stats = await workflowQueue.getQueueStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ Error getting queue stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manually add workflow to queue
app.post('/api/workflows/queue', async (req, res) => {
  try {
    const { workflowType, companyId, dealId, inputData, priority, assignedAgent } = req.body;
    
    if (!workflowType || !companyId || !inputData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const workflowId = await workflowQueue.addWorkflow({
      workflowType,
      companyId,
      dealId,
      inputData,
      priority: priority || 'medium',
      assignedAgent
    });
    
    res.json({ success: true, workflowId });
  } catch (error) {
    console.error('❌ Error adding workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel workflow
app.post('/api/workflows/:workflowId/cancel', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { reason } = req.body;
    
    await workflowQueue.cancelWorkflow(workflowId, reason);
    
    res.json({ success: true, message: 'Workflow canceled' });
  } catch (error) {
    console.error('❌ Error canceling workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

// Retry failed workflow
app.post('/api/workflows/:workflowId/retry', async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    // Reset workflow to pending
    await workflowQueue.updateWorkflowStatus(workflowId, 'pending');
    
    res.json({ success: true, message: 'Workflow will be retried' });
  } catch (error) {
    console.error('❌ Error retrying workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===================================================================
// DOCUMENT GENERATION API ENDPOINTS
// ===================================================================

// Generate USDOT application PDF
app.get('/api/documents/usdot-application/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const doc = await documentService.generateUSDOTApplicationPDF(applicationId);
    
    res.json({ success: true, document: doc });
  } catch (error) {
    console.error('❌ Error generating USDOT application PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate invoice PDF
app.get('/api/documents/invoice/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const doc = await documentService.generateInvoicePDF(invoiceId);
    
    res.json({ success: true, document: doc });
  } catch (error) {
    console.error('❌ Error generating invoice PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate compliance certificate
app.get('/api/documents/certificate/:companyId/:serviceName', async (req, res) => {
  try {
    const { companyId, serviceName } = req.params;
    const doc = await documentService.generateComplianceCertificate(companyId, serviceName);
    
    res.json({ success: true, document: doc });
  } catch (error) {
    console.error('❌ Error generating certificate:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===================================================================
// NOTIFICATION API ENDPOINTS
// ===================================================================

// Send test email
app.post('/api/notifications/email/test', async (req, res) => {
  try {
    const { to, subject = 'Test Email', message = 'This is a test email from Rapid CRM' } = req.body;
    
    const result = await emailService.sendEmail({
      to,
      subject,
      html: `<p>${message}</p>`,
      text: message
    });
    
    res.json({ success: result.success, result });
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send test SMS
app.post('/api/notifications/sms/test', async (req, res) => {
  try {
    const { to, message = 'Test SMS from Rapid CRM' } = req.body;
    
    const result = await smsService.sendSMS({ to, message });
    
    res.json({ success: result.success, result });
  } catch (error) {
    console.error('❌ Error sending test SMS:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===================================================================
// INTEGRATION API ENDPOINTS
// ===================================================================
app.get('/api/integrations', async (req, res) => {
  try {
    const integrations = await runQuery('SELECT * FROM integrations ORDER BY created_at DESC');
    const transformedIntegrations = integrations.map(integration => ({
      ...integration,
      configuration: integration.configuration ? JSON.parse(integration.configuration) : {},
      credentials: integration.credentials ? JSON.parse(integration.credentials) : {},
      capabilities: integration.capabilities ? JSON.parse(integration.capabilities) : [],
      metadata: integration.metadata ? JSON.parse(integration.metadata) : {}
    }));
    res.json(transformedIntegrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/integrations/:id', async (req, res) => {
  try {
    const integration = await runQueryOne('SELECT * FROM integrations WHERE id = ?', [req.params.id]);
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    const transformedIntegration = {
      ...integration,
      configuration: integration.configuration ? JSON.parse(integration.configuration) : {},
      credentials: integration.credentials ? JSON.parse(integration.credentials) : {},
      capabilities: integration.capabilities ? JSON.parse(integration.capabilities) : [],
      metadata: integration.metadata ? JSON.parse(integration.metadata) : {}
    };
    res.json(transformedIntegration);
  } catch (error) {
    console.error('Error fetching integration:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/integrations', async (req, res) => {
  try {
    const {
      name,
      type,
      provider,
      status = 'pending',
      configuration = {},
      credentials = {},
      capabilities = [],
      metadata = {}
    } = req.body;

    const id = `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await runExecute(
      `INSERT INTO integrations (
        id, name, type, provider, status, configuration, credentials, 
        capabilities, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        type,
        provider,
        status,
        JSON.stringify(configuration),
        JSON.stringify(credentials),
        JSON.stringify(capabilities),
        JSON.stringify(metadata),
        now,
        now
      ]
    );

    res.status(201).json({ id, message: 'Integration created successfully' });
  } catch (error) {
    console.error('Error creating integration:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/integrations/:id', async (req, res) => {
  try {
    const {
      name,
      type,
      provider,
      status,
      configuration,
      credentials,
      capabilities,
      metadata,
      lastSync,
      syncStatus,
      errorMessage
    } = req.body;

    const now = new Date().toISOString();
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
    if (type !== undefined) { updateFields.push('type = ?'); updateValues.push(type); }
    if (provider !== undefined) { updateFields.push('provider = ?'); updateValues.push(provider); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
    if (configuration !== undefined) { updateFields.push('configuration = ?'); updateValues.push(JSON.stringify(configuration)); }
    if (credentials !== undefined) { updateFields.push('credentials = ?'); updateValues.push(JSON.stringify(credentials)); }
    if (capabilities !== undefined) { updateFields.push('capabilities = ?'); updateValues.push(JSON.stringify(capabilities)); }
    if (metadata !== undefined) { updateFields.push('metadata = ?'); updateValues.push(JSON.stringify(metadata)); }
    if (lastSync !== undefined) { updateFields.push('last_sync = ?'); updateValues.push(lastSync); }
    if (syncStatus !== undefined) { updateFields.push('sync_status = ?'); updateValues.push(syncStatus); }
    if (errorMessage !== undefined) { updateFields.push('error_message = ?'); updateValues.push(errorMessage); }

    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateValues.push(req.params.id);

    if (updateFields.length === 1) { // Only updated_at
      return res.status(400).json({ error: 'No fields to update' });
    }

    await runExecute(
      `UPDATE integrations SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({ message: 'Integration updated successfully' });
  } catch (error) {
    console.error('Error updating integration:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/integrations/:id', async (req, res) => {
  try {
    await runExecute('DELETE FROM integrations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    console.error('Error deleting integration:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/integrations/sync-results', async (req, res) => {
  try {
    const syncResults = await runQuery('SELECT * FROM integration_sync_results ORDER BY started_at DESC');
    res.json(syncResults);
  } catch (error) {
    console.error('Error fetching sync results:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/integrations/health-checks', async (req, res) => {
  try {
    const healthChecks = await runQuery('SELECT * FROM integration_health_checks ORDER BY checked_at DESC');
    res.json(healthChecks);
  } catch (error) {
    console.error('Error fetching health checks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Knowledge Bases API endpoints
app.get('/api/knowledge-bases', async (req, res) => {
  try {
    const knowledgeBases = await runQuery('SELECT * FROM knowledge_bases ORDER BY created_at DESC');
    const transformedKnowledgeBases = knowledgeBases.map(kb => ({
      ...kb,
      tags: kb.tags ? JSON.parse(kb.tags) : []
    }));
    res.json(transformedKnowledgeBases);
  } catch (error) {
    console.error('Error fetching knowledge bases:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/knowledge-bases/:id', async (req, res) => {
  try {
    const knowledgeBase = await runQueryOne('SELECT * FROM knowledge_bases WHERE id = ?', [req.params.id]);
    if (!knowledgeBase) {
      return res.status(404).json({ error: 'Knowledge base not found' });
    }
    
    const transformedKnowledgeBase = {
      ...knowledgeBase,
      tags: knowledgeBase.tags ? JSON.parse(knowledgeBase.tags) : []
    };
    res.json(transformedKnowledgeBase);
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/knowledge-bases', async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      content,
      tags = []
    } = req.body;

    const id = `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await runExecute(
      `INSERT INTO knowledge_bases (
        id, name, description, type, content, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        description,
        type,
        content,
        JSON.stringify(tags),
        now,
        now
      ]
    );

    res.status(201).json({ id, message: 'Knowledge base created successfully' });
  } catch (error) {
    console.error('Error creating knowledge base:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/knowledge-bases/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      content,
      tags
    } = req.body;

    const now = new Date().toISOString();
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (type !== undefined) { updateFields.push('type = ?'); updateValues.push(type); }
    if (content !== undefined) { updateFields.push('content = ?'); updateValues.push(content); }
    if (tags !== undefined) { updateFields.push('tags = ?'); updateValues.push(JSON.stringify(tags)); }

    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateValues.push(req.params.id);

    if (updateFields.length === 1) { // Only updated_at
      return res.status(400).json({ error: 'No fields to update' });
    }

    await runExecute(
      `UPDATE knowledge_bases SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({ message: 'Knowledge base updated successfully' });
  } catch (error) {
    console.error('Error updating knowledge base:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/knowledge-bases/:id', async (req, res) => {
  try {
    await runExecute('DELETE FROM knowledge_bases WHERE id = ?', [req.params.id]);
    res.json({ message: 'Knowledge base deleted successfully' });
  } catch (error) {
    console.error('Error deleting knowledge base:', error);
    res.status(500).json({ error: error.message });
  }
});

// Conversation API endpoints
app.get('/api/conversations/contexts', async (req, res) => {
  try {
    const contexts = await runQuery('SELECT * FROM persistent_conversation_contexts ORDER BY created_at DESC');
    const transformedContexts = contexts.map(ctx => ({
      ...ctx,
      clientProfile: ctx.client_profile ? JSON.parse(ctx.client_profile) : {},
      agentInsights: ctx.agent_insights ? JSON.parse(ctx.agent_insights) : {},
      conversationHistory: ctx.conversation_history ? JSON.parse(ctx.conversation_history) : []
    }));
    res.json(transformedContexts);
  } catch (error) {
    console.error('Error fetching conversation contexts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations/memory-banks', async (req, res) => {
  try {
    const memoryBanks = await runQuery('SELECT * FROM agent_memory_banks ORDER BY created_at DESC');
    const transformedMemoryBanks = memoryBanks.map(memory => ({
      ...memory,
      memoryData: memory.memory_data ? JSON.parse(memory.memory_data) : {},
      contextData: memory.context_data ? JSON.parse(memory.context_data) : {}
    }));
    res.json(transformedMemoryBanks);
  } catch (error) {
    console.error('Error fetching agent memory banks:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations', async (req, res) => {
  try {
    const conversations = await runQuery('SELECT * FROM conversations ORDER BY created_at DESC');
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conversation = await runQueryOne('SELECT * FROM conversations WHERE id = ?', [req.params.id]);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations/:id/messages', async (req, res) => {
  try {
    const messages = await runQuery('SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC', [req.params.id]);
    const transformedMessages = messages.map(msg => ({
      ...msg,
      metadata: msg.metadata ? JSON.parse(msg.metadata) : {}
    }));
    res.json(transformedMessages);
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/conversations', async (req, res) => {
  try {
    const {
      agentId,
      clientId,
      title,
      status = 'Active'
    } = req.body;

    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await runExecute(
      `INSERT INTO conversations (
        id, agent_id, client_id, title, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, agentId, clientId, title, status, now, now]
    );

    res.status(201).json({ id, message: 'Conversation created successfully' });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/conversations/:id/messages', async (req, res) => {
  try {
    const {
      sender,
      content,
      metadata = {}
    } = req.body;

    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await runExecute(
      `INSERT INTO messages (
        id, conversation_id, sender, content, timestamp, metadata
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, req.params.id, sender, content, now, JSON.stringify(metadata)]
    );

    res.status(201).json({ id, message: 'Message created successfully' });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: error.message });
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

// Training System API Endpoints
// NOTE: AgentPerformanceGradingService and GoldenMasterAgentService temporarily disabled
// These TypeScript files need proper build process before use

// Initialize training services
let trainingService = null; // Temporarily disabled
let goldenMasterService = null; // Temporarily disabled

// Training Scenarios API
app.get('/api/training/scenarios', async (req, res) => {
  try {
    const { registration_type, difficulty_min, difficulty_max } = req.query;
    
    let query = 'SELECT * FROM training_scenarios WHERE is_active = 1';
    const params = [];
    
    if (registration_type) {
      query += ' AND registration_type = ?';
      params.push(registration_type);
    }
    
    if (difficulty_min) {
      query += ' AND difficulty_level >= ?';
      params.push(parseInt(difficulty_min));
    }
    
    if (difficulty_max) {
      query += ' AND difficulty_level <= ?';
      params.push(parseInt(difficulty_max));
    }
    
    query += ' ORDER BY difficulty_level ASC';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching training scenarios:', err);
        res.status(500).json({ error: 'Failed to fetch training scenarios' });
        return;
      }
      
      // Parse JSON fields
      const scenarios = rows.map(row => ({
        ...row,
        expected_path: JSON.parse(row.expected_path),
        test_data: JSON.parse(row.test_data)
      }));
      
      res.json(scenarios);
    });
  } catch (error) {
    console.error('Error in training scenarios API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get All Training Sessions
app.get('/api/training/sessions', async (req, res) => {
  try {
    const query = `
      SELECT 
        ts.*,
        tsc.name as scenario_name,
        tsc.registration_type,
        tsc.difficulty_level
      FROM training_sessions ts
      LEFT JOIN training_scenarios tsc ON ts.scenario_id = tsc.id
      ORDER BY ts.created_at DESC
      LIMIT 100
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching training sessions:', err);
        return res.status(500).json({ error: 'Failed to fetch training sessions' });
      }
      
      res.json(rows || []);
    });
  } catch (error) {
    console.error('Error in get training sessions API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Agent Performance by Registration Type (no agentId required)
app.get('/api/training/agents/performance', async (req, res) => {
  try {
    const { registration_type } = req.query;
    
    const query = `
      SELECT 
        ts.*,
        tsc.name as scenario_name,
        tsc.registration_type,
        tsc.difficulty_level
      FROM training_sessions ts
      LEFT JOIN training_scenarios tsc ON ts.scenario_id = tsc.id
      ${registration_type ? 'WHERE tsc.registration_type = ?' : ''}
      ORDER BY ts.created_at DESC
      LIMIT 100
    `;
    
    const params = registration_type ? [registration_type] : [];
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching agent performance:', err);
        return res.status(500).json({ error: 'Failed to fetch agent performance' });
      }
      
      res.json(rows || []);
    });
  } catch (error) {
    console.error('Error in get agent performance API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start Training Session
app.post('/api/training/sessions', async (req, res) => {
  try {
    const { agent_id, scenario_id } = req.body;
    
    if (!agent_id || !scenario_id) {
      return res.status(400).json({ error: 'agent_id and scenario_id are required' });
    }
    
    // Get scenario details
    db.get('SELECT * FROM training_scenarios WHERE id = ?', [scenario_id], (err, scenario) => {
      if (err) {
        console.error('Error fetching scenario:', err);
        return res.status(500).json({ error: 'Failed to fetch scenario' });
      }
      
      if (!scenario) {
        return res.status(404).json({ error: 'Scenario not found' });
      }
      
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expectedPath = JSON.parse(scenario.expected_path);
      
      const sessionData = {
        id: sessionId,
        agent_id,
        scenario_id,
        start_time: new Date().toISOString(),
        current_step: 1,
        total_steps: expectedPath.length,
        score: 0,
        completed: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const query = `
        INSERT INTO training_sessions 
        (id, agent_id, scenario_id, start_time, current_step, total_steps, score, completed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [
        sessionData.id, sessionData.agent_id, sessionData.scenario_id,
        sessionData.start_time, sessionData.current_step, sessionData.total_steps,
        sessionData.score, sessionData.completed, sessionData.created_at, sessionData.updated_at
      ], function(err) {
        if (err) {
          console.error('Error creating training session:', err);
          return res.status(500).json({ error: 'Failed to create training session' });
        }
        
        res.json({
          ...sessionData,
          scenario: {
            ...scenario,
            expected_path: expectedPath,
            test_data: JSON.parse(scenario.test_data)
          }
        });
      });
    });
  } catch (error) {
    console.error('Error in start training session API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Evaluate Training Step
app.post('/api/training/sessions/:sessionId/evaluate-step', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { step_id, expected_action, actual_action, time_spent, confidence } = req.body;
    
    if (!trainingService) {
      trainingService = new AgentPerformanceGradingService(db);
    }
    
    const evaluation = await trainingService.evaluateStep(
      sessionId,
      step_id,
      expected_action,
      actual_action,
      time_spent,
      confidence
    );
    
    res.json(evaluation);
  } catch (error) {
    console.error('Error in evaluate step API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Session Performance
app.get('/api/training/sessions/:sessionId/performance', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!trainingService) {
      trainingService = new AgentPerformanceGradingService(db);
    }
    
    const performance = await trainingService.calculateSessionPerformance(sessionId);
    res.json(performance);
  } catch (error) {
    console.error('Error in get session performance API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Complete Training Session
app.post('/api/training/sessions/:sessionId/complete', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!trainingService) {
      trainingService = new AgentPerformanceGradingService(db);
    }
    
    const evaluation = await trainingService.evaluateScenario(sessionId);
    
    // Update session as completed
    const endTime = new Date().toISOString();
    const completed = evaluation.passed ? 1 : 0;
    
    db.run(
      'UPDATE training_sessions SET end_time = ?, completed = ?, score = ? WHERE id = ?',
      [endTime, completed, evaluation.overallScore, sessionId],
      (err) => {
        if (err) {
          console.error('Error updating training session:', err);
          return res.status(500).json({ error: 'Failed to complete training session' });
        }
        
        // Check if this qualifies as a Golden Master
        trainingService.saveGoldenMaster(sessionId).then(isGoldenMaster => {
          res.json({
            ...evaluation,
            isGoldenMaster,
            endTime
          });
        });
      }
    );
  } catch (error) {
    console.error('Error in complete training session API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Agent Performance History
app.get('/api/training/agents/:agentId/performance', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { registration_type } = req.query;
    
    if (!trainingService) {
      trainingService = new AgentPerformanceGradingService(db);
    }
    
    const query = `
      SELECT 
        ts.*,
        tsc.name as scenario_name,
        tsc.registration_type,
        tsc.difficulty_level
      FROM training_sessions ts
      JOIN training_scenarios tsc ON ts.scenario_id = tsc.id
      WHERE ts.agent_id = ?
      ${registration_type ? 'AND tsc.registration_type = ?' : ''}
      ORDER BY ts.created_at DESC
    `;
    
    const params = registration_type ? [agentId, registration_type] : [agentId];
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching agent performance:', err);
        return res.status(500).json({ error: 'Failed to fetch agent performance' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Error in get agent performance API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if Agent Should Be Replaced
app.get('/api/training/agents/:agentId/should-replace', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { registration_type } = req.query;
    
    if (!registration_type) {
      return res.status(400).json({ error: 'registration_type is required' });
    }
    
    if (!trainingService) {
      trainingService = new AgentPerformanceGradingService(db);
    }
    
    const replacementCheck = await trainingService.shouldReplaceAgent(agentId, registration_type);
    res.json(replacementCheck);
  } catch (error) {
    console.error('Error in should replace agent API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create Golden Master Agent
app.post('/api/training/golden-masters', async (req, res) => {
  try {
    const { sessionId, agentId, registrationType } = req.body;
    
    if (!sessionId || !agentId || !registrationType) {
      return res.status(400).json({ error: 'sessionId, agentId, and registrationType are required' });
    }
    
    if (!goldenMasterService) {
      goldenMasterService = new GoldenMasterAgentService(db);
    }
    
    const goldenMaster = await goldenMasterService.createGoldenMaster(sessionId, agentId, registrationType);
    
    if (goldenMaster) {
      res.json(goldenMaster);
    } else {
      res.status(400).json({ error: 'Failed to create Golden Master. Session must be completed with 100% accuracy.' });
    }
  } catch (error) {
    console.error('Error in create golden master API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Best Golden Master for Registration Type
app.get('/api/training/golden-masters/best/:registrationType', async (req, res) => {
  try {
    const { registrationType } = req.params;
    
    if (!goldenMasterService) {
      goldenMasterService = new GoldenMasterAgentService(db);
    }
    
    const bestGoldenMaster = await goldenMasterService.getBestGoldenMaster(registrationType);
    res.json(bestGoldenMaster);
  } catch (error) {
    console.error('Error in get best golden master API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze Agent for Replacement
app.get('/api/training/agents/:agentId/analyze-replacement', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { registration_type } = req.query;
    
    if (!registration_type) {
      return res.status(400).json({ error: 'registration_type is required' });
    }
    
    if (!goldenMasterService) {
      goldenMasterService = new GoldenMasterAgentService(db);
    }
    
    const replacementPlan = await goldenMasterService.analyzeAgentForReplacement(agentId, registration_type);
    res.json(replacementPlan);
  } catch (error) {
    console.error('Error in analyze agent replacement API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute Agent Replacement
app.post('/api/training/agents/:agentId/replace', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { replacementPlan, strategy = 'immediate' } = req.body;
    
    if (!replacementPlan) {
      return res.status(400).json({ error: 'replacementPlan is required' });
    }
    
    if (!goldenMasterService) {
      goldenMasterService = new GoldenMasterAgentService(db);
    }
    
    const success = await goldenMasterService.executeAgentReplacement(replacementPlan, strategy);
    
    if (success) {
      res.json({ success: true, message: 'Agent replacement executed successfully' });
    } else {
      res.status(500).json({ error: 'Failed to execute agent replacement' });
    }
  } catch (error) {
    console.error('Error in execute agent replacement API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deactivate Golden Master
app.delete('/api/training/golden-masters/:goldenMasterId', async (req, res) => {
  try {
    const { goldenMasterId } = req.params;
    
    if (!goldenMasterService) {
      goldenMasterService = new GoldenMasterAgentService(db);
    }
    
    const success = await goldenMasterService.deactivateGoldenMaster(goldenMasterId);
    
    if (success) {
      res.json({ success: true, message: 'Golden Master deactivated successfully' });
    } else {
      res.status(404).json({ error: 'Golden Master not found' });
    }
  } catch (error) {
    console.error('Error in deactivate golden master API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Golden Master Statistics
app.get('/api/training/golden-masters/stats', async (req, res) => {
  try {
    const { registration_type } = req.query;
    
    if (!goldenMasterService) {
      goldenMasterService = new GoldenMasterAgentService(db);
    }
    
    const stats = await goldenMasterService.getGoldenMasterStats(registration_type);
    res.json(stats);
  } catch (error) {
    console.error('Error in get golden master stats API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Golden Master Agents
app.get('/api/training/golden-masters', async (req, res) => {
  try {
    const { registration_type } = req.query;
    
    let query = 'SELECT * FROM golden_master_agents WHERE is_active = 1';
    const params = [];
    
    if (registration_type) {
      query += ' AND registration_type = ?';
      params.push(registration_type);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching golden master agents:', err);
        return res.status(500).json({ error: 'Failed to fetch golden master agents' });
      }
      
      // Parse JSON fields
      const goldenMasters = rows.map(row => ({
        ...row,
        agent_config: JSON.parse(row.agent_config),
        training_data: JSON.parse(row.training_data),
        performance_metrics: JSON.parse(row.performance_metrics)
      }));
      
      res.json(goldenMasters);
    });
  } catch (error) {
    console.error('Error in get golden masters API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Training Environment Settings
app.get('/api/training/settings', async (req, res) => {
  try {
    const { registration_type } = req.query;
    
    let query = 'SELECT * FROM training_environment_settings';
    const params = [];
    
    if (registration_type) {
      query += ' WHERE registration_type = ?';
      params.push(registration_type);
    }
    
    query += ' ORDER BY registration_type';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching training settings:', err);
        return res.status(500).json({ error: 'Failed to fetch training settings' });
      }
      
      // Parse JSON fields
      const settings = rows.map(row => ({
        ...row,
        scenario_difficulty_range: JSON.parse(row.scenario_difficulty_range)
      }));
      
      res.json(settings);
    });
  } catch (error) {
    console.error('Error in get training settings API:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// ALEX TRAINING CENTER API ROUTES
// ===================================

// Import Alex Training Service (CommonJS)
let alexTrainingService = null;
try {
  const { alexTrainingService: ats } = require('./src/services/training/AlexTrainingService.js');
  alexTrainingService = ats;
  console.log('✅ Alex Training Service loaded');
} catch (error) {
  console.log('⚠️ Alex Training Service failed to load:', error.message);
}

// Get or create training session
app.get('/api/alex-training/session', async (req, res) => {
  try {
    if (!alexTrainingService) {
      return res.json({ session: null, message: 'Training service not available' });
    }
    
    const session = alexTrainingService.getOrCreateSession();
    res.json({ session });
  } catch (error) {
    console.error('Error getting training session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check scenario count and details
app.get('/api/alex-training/scenario-count', async (req, res) => {
  try {
    const count = await runQueryOne('SELECT COUNT(*) as count FROM alex_training_scenarios WHERE is_active = 1');
    const total = await runQueryOne('SELECT COUNT(*) as count FROM alex_training_scenarios');
    const sessionCount = await runQueryOne('SELECT COUNT(*) as count FROM alex_training_sessions');
    
    console.log('📊 Scenario count check:');
    console.log(`   Total scenarios: ${total?.count || 0}`);
    console.log(`   Active scenarios: ${count?.count || 0}`);
    console.log(`   Training sessions: ${sessionCount?.count || 0}`);
    
    res.json({ 
      count: count?.count || 0,
      total: total?.count || 0,
      sessions: sessionCount?.count || 0
    });
  } catch (error) {
    console.error('Error getting scenario count:', error);
    res.json({ count: 0, total: 0, sessions: 0 });
  }
});

// Generate training scenarios
app.post('/api/alex-training/generate-scenarios', async (req, res) => {
  try {
    if (!alexTrainingService) {
      return res.status(500).json({ error: 'Training service not available' });
    }
    
    const result = await alexTrainingService.generateTrainingScenarios();
    res.json(result);
  } catch (error) {
    console.error('Error generating scenarios:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all scenarios for training environments
app.get('/api/alex-training/all-scenarios', async (req, res) => {
  try {
    if (!alexTrainingService) {
      return res.status(500).json({ error: 'Training service not available' });
    }
    
    const scenarios = alexTrainingService.getAllScenarios();
    res.json({ scenarios });
  } catch (error) {
    console.error('Error getting all scenarios:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get next scenario to test
app.get('/api/alex-training/next-scenario', async (req, res) => {
  try {
    if (!alexTrainingService) {
      console.error('❌ Alex Training Service not available');
      return res.status(500).json({ error: 'Training service not available' });
    }
    
    console.log('🎯 Getting next scenario...');
    const scenario = alexTrainingService.getNextScenario();
    
    if (!scenario) {
      console.log('⚠️ No scenario returned from service');
      console.log('⚠️ This usually means: no scenarios in DB OR all scenarios already tested in current session');
    } else {
      console.log('✅ Found scenario:', scenario.id);
    }
    
    res.json({ scenario });
  } catch (error) {
    console.error('❌ Error getting next scenario:', error);
    res.status(500).json({ error: error.message });
  }
});

// Diagnostic endpoint for Jasper to report training issues
app.post('/api/training/diagnostic-report', async (req, res) => {
  try {
    const { issue, context, userDescription } = req.body;
    
    console.log('\n');
    console.log('🚨 =====================================================');
    console.log('🚨 TRAINING DIAGNOSTIC REPORT FROM JASPER');
    console.log('🚨 =====================================================');
    console.log('📝 Issue:', issue);
    console.log('📋 Context:', JSON.stringify(context, null, 2));
    console.log('👤 User Description:', userDescription);
    console.log('🚨 =====================================================');
    console.log('\n');
    
    res.json({ success: true, message: 'Diagnostic report received' });
  } catch (error) {
    console.error('Error processing diagnostic report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test Alex with a scenario
app.post('/api/alex-training/test-scenario', async (req, res) => {
  try {
    if (!alexTrainingService) {
      return res.status(500).json({ error: 'Training service not available' });
    }
    
    const { scenario } = req.body;
    const { callOpenRouter } = require('./src/services/ai/SimpleAIService.js');
    const response = await alexTrainingService.testAlexWithScenario(scenario, { generateResponse: async (provider, opts) => callOpenRouter(opts.messages, opts.temperature, opts.maxTokens) });
    res.json({ response });
  } catch (error) {
    console.error('Error testing scenario:', error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize conversation - Get client greeting
app.post('/api/alex-training/start-conversation', async (req, res) => {
  try {
    const { scenario } = req.body;
    
    console.log('👋 Starting conversation for scenario:', scenario.id);
    
    const { callOpenRouter } = require('./src/services/ai/SimpleAIService.js');
    const { ClientSimulator } = await import('./src/services/training/ClientSimulator.js');
    
    // Create client simulator and pass AI service to it
    const aiService = { generateResponse: async (provider, opts) => callOpenRouter(opts.messages, opts.temperature, opts.maxTokens) };
    const clientSimulator = new ClientSimulator(scenario, aiService);
    
    const clientGreeting = await clientSimulator.getInitialGreeting();
    
    res.json({
      message: clientGreeting,
      sender: 'client',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Alex's response to conversation
app.post('/api/alex-training/alex-response', async (req, res) => {
  try {
    const { scenario, conversationHistory } = req.body;
    
    console.log('🧠 Getting Alex AI response...');
    
    const { callOpenRouter } = require('./src/services/ai/SimpleAIService.js');
    
    const alexSystemPrompt = `You are Alex, an expert onboarding specialist for Rapid Compliance, helping transportation companies get their USDOT registration.

Your job:
1. Gather information conversationally (don't interrogate)
2. Ask ONE question at a time
3. Explain regulations in simple terms
4. Build rapport and trust
5. Present your services as valuable solutions
6. Handle objections professionally
7. CLOSE THE DEAL - Get a clear yes or no from the client

Key information you need:
- Business name and structure
- Location (state is critical for regulations)
- Interstate or intrastate operations
- For-hire or private property
- Hazardous materials (yes/no)
- Fleet size and vehicle types
- Number of drivers

Your conversation flow:
1. Gather key information (5-8 questions, depending on complexity)
2. Explain what requirements apply based on their answers
3. Present service package with clear value proposition
4. Handle any objections or questions
5. Ask for the close: "Would you like me to get started on your registration today?"
6. If YES: "Welcome aboard! Let me prepare your registration." → End conversation
7. If NO: Address final concerns OR politely end

Be professional, friendly, and helpful. Think like a sales consultant, not a bureaucrat.
IMPORTANT: When the deal is closed (client says yes) or declined (client says no), END THE CONVERSATION.
Signal completion by saying "Let me prepare your registration" or similar.`;

    const messages = conversationHistory.map(msg => ({
      role: msg.sender === 'alex' ? 'assistant' : 'user',
      content: msg.content
    }));

    const alexResponse = await callOpenRouter([
      { role: 'system', content: alexSystemPrompt },
      ...messages
    ], 0.7, 500);

    res.json({
      message: alexResponse.content,
      sender: 'alex',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting Alex response:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get client's response to Alex
app.post('/api/alex-training/client-response', async (req, res) => {
  try {
    const { scenario, alexMessage } = req.body;
    
    console.log('💬 Getting client response...');
    
    const { callOpenRouter } = require('./src/services/ai/SimpleAIService.js');
    const { ClientSimulator } = await import('./src/services/training/ClientSimulator.js');
    const aiService = { generateResponse: async (provider, opts) => callOpenRouter(opts.messages, opts.temperature, opts.maxTokens) };
    const clientSimulator = new ClientSimulator(scenario, aiService);
    
    const clientResponse = await clientSimulator.respondToQuestion(alexMessage);
    
    res.json({
      message: clientResponse.message,
      sender: 'client',
      timestamp: new Date().toISOString(),
      revealsInfo: clientResponse.revealsInfo,
      sentiment: clientResponse.sentiment
    });
  } catch (error) {
    console.error('Error getting client response:', error);
    res.status(500).json({ error: error.message });
  }
});

// DEPRECATED: Old endpoint that ran entire conversation at once
// Keeping for backwards compatibility but not used anymore
app.post('/api/alex-training/run-conversation', async (req, res) => {
  try {
    const { scenario } = req.body;
    
    if (!scenario) {
      return res.status(400).json({ error: 'No scenario provided' });
    }
    
    console.log('🎯 Running REAL Alex AI conversation for scenario:', scenario.id);
    
    // Import client simulator
    const { ClientSimulator } = await import('./src/services/training/ClientSimulator.js');
    const clientSimulator = new ClientSimulator(scenario);
    
    // Import AI integration service to call real Alex
    const { aiIntegrationService } = await import('./src/services/ai/AIIntegrationService.js');
    
    const conversation = [];
    const revealedFields = new Set();
    let conversationContext = {
      gatheredInfo: {},
      stage: 'greeting'
    };
    
    // Client starts conversation (LLM-generated greeting)
    const clientGreeting = await clientSimulator.getInitialGreeting();
    conversation.push({
      sender: 'client',
      content: clientGreeting,
      timestamp: new Date().toISOString()
    });
    
    // Alex's onboarding system prompt
    const alexSystemPrompt = `You are Alex, an expert onboarding specialist for Rapid Compliance, helping transportation companies get their USDOT registration.

Your job:
1. Gather information conversationally (don't interrogate)
2. Ask ONE question at a time
3. Explain regulations in simple terms
4. Build rapport and trust
5. Present your services as valuable solutions
6. Guide toward becoming a paying client

Key information you need:
- Business name and structure
- Location (state is critical for regulations)
- Interstate or intrastate operations
- For-hire or private property
- Hazardous materials (yes/no)
- Fleet size and vehicle types
- Number of drivers

Be professional, friendly, and helpful. Think like a sales consultant, not a bureaucrat.`;

    // Conduct conversation (max 15 turns to avoid infinite loops)
    for (let turn = 0; turn < 15; turn++) {
      // Build conversation history for context
      const conversationHistory = conversation.map(msg => ({
        role: msg.sender === 'alex' ? 'assistant' : 'user',
        content: msg.content
      }));
      
      // Get Alex's response using real LLM
      try {
        const alexResponse = await aiIntegrationService.generateResponse('openrouter', {
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            { role: 'system', content: alexSystemPrompt },
            ...conversationHistory
          ],
          temperature: 0.7, // Higher for natural conversation
          maxTokens: 500
        });
        
        const alexMessage = alexResponse.content;
        conversation.push({
          sender: 'alex',
          content: alexMessage,
          timestamp: new Date().toISOString()
        });
        
        // Check if Alex is ready to make determination (asks to "analyze" or "determine" or "let me")
        if (alexMessage.toLowerCase().includes('let me determine') || 
            alexMessage.toLowerCase().includes('let me analyze') ||
            alexMessage.toLowerCase().includes('based on this information') ||
            clientSimulator.hasRevealedAllInfo(revealedFields) ||
            turn >= 12) {
          break; // End conversation, move to determination
        }
        
        // Client responds (LLM-generated, stays in character)
        const clientResponse = await clientSimulator.respondToQuestion(alexMessage);
        conversation.push({
          sender: 'client',
          content: clientResponse.message,
          timestamp: new Date().toISOString(),
          triggers: clientResponse.revealsInfo.map(info => info.field)
        });
        
        // Track what info was revealed
        clientResponse.revealsInfo.forEach(info => {
          revealedFields.add(info.field);
          conversationContext.gatheredInfo[info.field] = info.value;
        });
        
      } catch (error) {
        console.error('Error getting Alex response:', error);
        break;
      }
    }
    
    console.log(`✅ Conversation complete: ${conversation.length} messages, ${revealedFields.size} fields revealed`);

    // Get Alex's determination using real LLM
    const determination = await alexTrainingService.testAlexWithScenario(scenario);
    
    res.json({
      conversation,
      determination,
      conversationQuality: {
        totalMessages: conversation.length,
        fieldsRevealed: Array.from(revealedFields),
        allInfoGathered: clientSimulator.hasRevealedAllInfo(revealedFields)
      }
    });
  } catch (error) {
    console.error('❌ Error running conversation:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Submit feedback for a test result
app.post('/api/alex-training/submit-feedback', async (req, res) => {
  try {
    if (!alexTrainingService) {
      return res.status(500).json({ error: 'Training service not available' });
    }
    
    const { scenarioId, isCorrect, feedback, determination, individualReviews, conversationQuality, salesEffectiveness } = req.body;
    const session = await alexTrainingService.submitFeedback(
      scenarioId,
      isCorrect,
      feedback,
      determination,
      individualReviews
    );
    
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// USDOT RPA TRAINING CENTER ROUTES
// ===================================

// Call the ACTUAL RPA agent to fill a scenario
app.post('/api/usdot-rpa-training/fill-scenario', async (req, res) => {
  try {
    const { scenario } = req.body;
    
    console.log(`🤖 Calling USDOT RPA Agent to fill scenario: ${scenario.id}`);
    
    // Dynamically import the TypeScript agent
    const { usdotFormFillerAgent } = await import('./src/services/rpa/USDOTFormFillerAgent.ts');
    
    // Agent analyzes scenario and fills all form fields
    const filledPages = await usdotFormFillerAgent.fillApplication(scenario);
    
    console.log(`✅ Agent filled ${filledPages.length} pages`);
    
    res.json({
      success: true,
      filledPages,
      agentKnowledge: usdotFormFillerAgent.getKnowledgeBase()
    });
    
  } catch (error) {
    console.error('Error calling RPA agent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit correction to RPA agent
app.post('/api/usdot-rpa-training/submit-correction', async (req, res) => {
  try {
    const { fieldName, correctValue, explanation, scenarioContext } = req.body;
    
    console.log(`📚 Saving correction for ${fieldName}`);
    
    // Import agent and apply correction
    const { usdotFormFillerAgent } = await import('./src/services/rpa/USDOTFormFillerAgent.ts');
    usdotFormFillerAgent.learnFromCorrection(fieldName, correctValue, explanation, scenarioContext);
    
    res.json({ success: true, message: 'Agent learned from correction' });
    
  } catch (error) {
    console.error('Error saving correction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get RPA training stats
app.get('/api/usdot-rpa-training/stats', async (req, res) => {
  try {
    const totalScenarios = await runQueryOne(
      'SELECT COUNT(*) as count FROM alex_training_scenarios'
    );
    
    const completed = await runQueryOne(
      `SELECT COUNT(*) as count FROM alex_test_results WHERE is_correct IS NOT NULL`
    );
    
    const correctTests = await runQueryOne(
      `SELECT COUNT(*) as count FROM alex_test_results WHERE is_correct = 1`
    );
    
    const averageAccuracy = completed.count > 0 
      ? (correctTests.count / completed.count) * 100 
      : 0;
    
    res.json({
      totalScenarios: totalScenarios.count || 0,
      completed: completed.count || 0,
      averageAccuracy: averageAccuracy || 0
    });
  } catch (error) {
    console.error('Error getting RPA training stats:', error);
    res.json({
      totalScenarios: 0,
      completed: 0,
      averageAccuracy: 0
    });
  }
});

// Submit RPA test result
app.post('/api/usdot-rpa-training/submit-result', async (req, res) => {
  try {
    const { 
      sessionId, 
      scenarioId, 
      applicationData, 
      fieldComparisons, 
      accuracy, 
      reviewFeedback,
      isCorrect 
    } = req.body;
    
    const resultId = `result_${Date.now()}`;
    const now = new Date().toISOString();
    
    // Store the RPA test result
    await runExecute(`
      INSERT INTO alex_test_results (
        id,
        scenario_id,
        test_session_id,
        alex_full_response,
        is_correct,
        reviewer_feedback,
        reviewed_by,
        reviewed_at,
        tested_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      resultId,
      scenarioId,
      sessionId,
      JSON.stringify({ applicationData, fieldComparisons, accuracy }),
      isCorrect ? 1 : 0,
      reviewFeedback || '',
      'admin',
      now,
      now
    ]);
    
    res.json({ success: true, resultId });
  } catch (error) {
    console.error('Error submitting RPA result:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===================================
// QUALIFIED STATES MANAGEMENT ROUTES
// ===================================

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const XLSX = require('xlsx');
const fs = require('fs');

// GET all qualified states (or filter by state code with ?state=XX query param)
app.get('/api/qualified-states', async (req, res) => {
  const { state } = req.query;
  
  try {
    if (state) {
      // Query specific state
      db.all(
        `SELECT * FROM qualified_states WHERE state_code = ? OR LOWER(state_name) = LOWER(?)`,
        [state.toUpperCase(), state],
        (err, rows) => {
          if (err) {
            console.error('Error fetching qualified state:', err);
            return res.status(500).json({ error: err.message });
          }
          res.json({ states: rows || [] });
        }
      );
    } else {
      // Get all states
      db.all(
        `SELECT * FROM qualified_states ORDER BY state_code`,
        [],
        (err, rows) => {
          if (err) {
            console.error('Error fetching qualified states:', err);
            return res.status(500).json({ error: err.message });
          }
          res.json({ states: rows || [] });
        }
      );
    }
  } catch (error) {
    console.error('Error in qualified states GET:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single qualified state
app.get('/api/qualified-states/:id', async (req, res) => {
  const { id } = req.params;
  try {
    db.get(
      `SELECT * FROM qualified_states WHERE id = ?`,
      [id],
      (err, row) => {
        if (err) {
          console.error('Error fetching qualified state:', err);
          return res.status(500).json({ error: err.message });
        }
        if (!row) {
          return res.status(404).json({ error: 'State not found' });
        }
        res.json(row);
      }
    );
  } catch (error) {
    console.error('Error in qualified state GET:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new qualified state
app.post('/api/qualified-states', async (req, res) => {
  const {
    state_code,
    state_name,
    gvwr_threshold_fh,
    gvwr_notes_fh,
    gvwr_threshold_pp,
    gvwr_notes_pp,
    passenger_threshold_fh,
    passenger_notes_fh,
    passenger_threshold_pp,
    passenger_notes_pp,
    requires_intrastate_authority,
    intrastate_authority_name,
    authority_threshold_gvwr,
    authority_notes,
    additional_requirements,
    state_regulation_reference,
    adopted_federal_49cfr,
    partial_adoption_notes,
    notes
  } = req.body;

  try {
    db.run(
      `INSERT INTO qualified_states (
        state_code, state_name,
        gvwr_threshold_fh, gvwr_notes_fh,
        gvwr_threshold_pp, gvwr_notes_pp,
        passenger_threshold_fh, passenger_notes_fh,
        passenger_threshold_pp, passenger_notes_pp,
        requires_intrastate_authority, intrastate_authority_name,
        authority_threshold_gvwr, authority_notes, additional_requirements,
        state_regulation_reference, adopted_federal_49cfr, partial_adoption_notes,
        notes, last_updated, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), 'admin')`,
      [
        state_code,
        state_name,
        gvwr_threshold_fh || 0,
        gvwr_notes_fh || null,
        gvwr_threshold_pp || 0,
        gvwr_notes_pp || null,
        passenger_threshold_fh || 0,
        passenger_notes_fh || null,
        passenger_threshold_pp || 0,
        passenger_notes_pp || null,
        requires_intrastate_authority ? 1 : 0,
        intrastate_authority_name || null,
        authority_threshold_gvwr || null,
        authority_notes || null,
        additional_requirements || null,
        state_regulation_reference || null,
        adopted_federal_49cfr ? 1 : 0,
        partial_adoption_notes || null,
        notes || null
      ],
      function (err) {
        if (err) {
          console.error('Error inserting qualified state:', err);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          id: this.lastID,
          message: 'Qualified state added successfully'
        });
      }
    );
  } catch (error) {
    console.error('Error in qualified state POST:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update qualified state
app.put('/api/qualified-states/:id', async (req, res) => {
  const { id } = req.params;
  const {
    state_code,
    state_name,
    gvwr_threshold_fh,
    gvwr_notes_fh,
    gvwr_threshold_pp,
    gvwr_notes_pp,
    passenger_threshold_fh,
    passenger_notes_fh,
    passenger_threshold_pp,
    passenger_notes_pp,
    requires_intrastate_authority,
    intrastate_authority_name,
    authority_threshold_gvwr,
    authority_notes,
    additional_requirements,
    state_regulation_reference,
    adopted_federal_49cfr,
    partial_adoption_notes,
    notes
  } = req.body;

  try {
    db.run(
      `UPDATE qualified_states SET
        state_code = ?, state_name = ?,
        gvwr_threshold_fh = ?, gvwr_notes_fh = ?,
        gvwr_threshold_pp = ?, gvwr_notes_pp = ?,
        passenger_threshold_fh = ?, passenger_notes_fh = ?,
        passenger_threshold_pp = ?, passenger_notes_pp = ?,
        requires_intrastate_authority = ?, intrastate_authority_name = ?,
        authority_threshold_gvwr = ?, authority_notes = ?, additional_requirements = ?,
        state_regulation_reference = ?, adopted_federal_49cfr = ?, partial_adoption_notes = ?,
        notes = ?, last_updated = date('now'), updated_by = 'admin'
      WHERE id = ?`,
      [
        state_code,
        state_name,
        gvwr_threshold_fh || 0,
        gvwr_notes_fh || null,
        gvwr_threshold_pp || 0,
        gvwr_notes_pp || null,
        passenger_threshold_fh || 0,
        passenger_notes_fh || null,
        passenger_threshold_pp || 0,
        passenger_notes_pp || null,
        requires_intrastate_authority ? 1 : 0,
        intrastate_authority_name || null,
        authority_threshold_gvwr || null,
        authority_notes || null,
        additional_requirements || null,
        state_regulation_reference || null,
        adopted_federal_49cfr ? 1 : 0,
        partial_adoption_notes || null,
        notes || null,
        id
      ],
      function (err) {
        if (err) {
          console.error('Error updating qualified state:', err);
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'State not found' });
        }
        res.json({ message: 'Qualified state updated successfully' });
      }
    );
  } catch (error) {
    console.error('Error in qualified state PUT:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE qualified state
app.delete('/api/qualified-states/:id', async (req, res) => {
  const { id } = req.params;
  try {
    db.run(
      `DELETE FROM qualified_states WHERE id = ?`,
      [id],
      function (err) {
        if (err) {
          console.error('Error deleting qualified state:', err);
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'State not found' });
        }
        res.json({ message: 'Qualified state deleted successfully' });
      }
    );
  } catch (error) {
    console.error('Error in qualified state DELETE:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST log compliance determination (for training and improvement)
app.post('/api/compliance-log', async (req, res) => {
  const {
    company_name,
    state_code,
    operation_type,
    operation_radius,
    gvwr,
    passenger_capacity,
    cargo_types,
    determination_logic,
    requires_usdot,
    requires_authority,
    authority_type,
    additional_requirements,
    determination_correct,
    correction_notes
  } = req.body;

  try {
    db.run(
      `INSERT INTO compliance_determination_log (
        company_name, state_code, operation_type, operation_radius,
        gvwr, passenger_capacity, cargo_types, determination_logic,
        requires_usdot, requires_authority, authority_type,
        additional_requirements, determination_correct, correction_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_name,
        state_code,
        operation_type,
        operation_radius,
        gvwr,
        passenger_capacity,
        cargo_types,
        determination_logic,
        requires_usdot ? 1 : 0,
        requires_authority ? 1 : 0,
        authority_type,
        additional_requirements,
        determination_correct !== undefined ? (determination_correct ? 1 : 0) : null,
        correction_notes
      ],
      function (err) {
        if (err) {
          console.error('Error logging compliance determination:', err);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          id: this.lastID,
          message: 'Compliance determination logged successfully'
        });
      }
    );
  } catch (error) {
    console.error('Error in compliance log POST:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST check USDOT requirement (for AI agents)
app.post('/api/qualified-states/check-requirement', async (req, res) => {
  const { stateCode, operationType, operationRadius, gvwr, passengerCapacity, cargoType } = req.body;

  try {
    // RULE 1: Interstate operations ALWAYS use Federal 49 CFR
    if (operationRadius === 'interstate' || operationRadius === 'both') {
      const requiresUSDOT = (gvwr || 0) >= 10001 || (passengerCapacity || 0) >= 8;
      
      return res.json({
        requiresUSDOT,
        requiresDQFile: requiresUSDOT,
        threshold: { gvwr: 10001, passengers: 8 },
        reasoning: `Interstate operations ALWAYS follow Federal 49 CFR regulations. USDOT required if GVWR is 10,001+ lbs OR 8+ passengers. Vehicle: ${gvwr || 0} lbs GVWR, ${passengerCapacity || 0} passengers.`,
        ruleSource: 'federal_49_cfr',
        operationType,
        operationRadius
      });
    }

    // RULE 2: Intrastate operations - Use Qualified States List
    db.get(
      `SELECT * FROM qualified_states WHERE state_code = ? OR LOWER(state_name) = LOWER(?)`,
      [stateCode.toUpperCase(), stateCode],
      (err, state) => {
        if (err) {
          console.error('Error checking qualified state:', err);
          return res.status(500).json({ error: err.message });
        }

        if (!state) {
          // Fallback to federal if state not found
          const requiresUSDOT = (gvwr || 0) >= 10001 || (passengerCapacity || 0) >= 8;
          return res.json({
            requiresUSDOT,
            requiresDQFile: requiresUSDOT,
            threshold: { gvwr: 10001, passengers: 8 },
            reasoning: `State ${stateCode} not in Qualified States List. Using Federal 49 CFR fallback.`,
            ruleSource: 'federal_49_cfr',
            operationType,
            operationRadius
          });
        }

        // Apply state-specific thresholds based on operation type
        const gvwrThreshold = operationType === 'for_hire' ? state.gvwr_threshold_fh : state.gvwr_threshold_pp;
        const passengerThreshold = operationType === 'for_hire' ? state.passenger_threshold_fh : state.passenger_threshold_pp;
        const cargoNotes = operationType === 'for_hire' ? state.gvwr_notes_fh : state.gvwr_notes_pp;

        // Check if USDOT is required
        let requiresUSDOT = false;
        let reasoning = '';

        // Handle "ANY" (threshold = 1) meaning all operations require USDOT
        if (gvwrThreshold === 1 || passengerThreshold === 1) {
          requiresUSDOT = true;
          reasoning = `${state.state_name} requires USDOT for ANY ${operationType.replace('_', ' ')} operations (intrastate). `;
        } else {
          const meetsGVWR = (gvwr || 0) > 0 && gvwrThreshold > 0 && (gvwr || 0) >= gvwrThreshold;
          const meetsPassenger = (passengerCapacity || 0) > 0 && passengerThreshold > 0 && (passengerCapacity || 0) >= passengerThreshold;
          
          requiresUSDOT = meetsGVWR || meetsPassenger;

          if (requiresUSDOT) {
            reasoning = `${state.state_name} (intrastate ${operationType.replace('_', ' ')}): USDOT REQUIRED. ` +
              `Thresholds: ${gvwrThreshold || 'N/A'} lbs GVWR, ${passengerThreshold || 'N/A'} passengers. ` +
              `Your vehicle: ${gvwr || 0} lbs, ${passengerCapacity || 0} passengers. `;
          } else {
            reasoning = `${state.state_name} (intrastate ${operationType.replace('_', ' ')}): USDOT NOT required. ` +
              `Thresholds: ${gvwrThreshold || 'N/A'} lbs GVWR, ${passengerThreshold || 'N/A'} passengers. ` +
              `Your vehicle: ${gvwr || 0} lbs, ${passengerCapacity || 0} passengers is BELOW the threshold. `;
          }
        }

        // Add cargo notes
        if (cargoNotes && cargoType) {
          reasoning += `Cargo: ${cargoNotes}. `;
        }

        // Add state notes
        if (state.notes) {
          reasoning += `Note: ${state.notes}`;
        }

        // Check for savings vs federal
        const federalRequiresUSDOT = (gvwr || 0) >= 10001 || (passengerCapacity || 0) >= 8;
        let potentialSavings;
        
        if (federalRequiresUSDOT && !requiresUSDOT) {
          potentialSavings = `💰 SAVINGS: Federal rules would require USDOT, but ${state.state_name} intrastate ${operationType.replace('_', ' ')} does NOT. This saves thousands in registration and compliance costs!`;
        } else if (!federalRequiresUSDOT && requiresUSDOT) {
          potentialSavings = `⚠️ IMPORTANT: Federal rules would NOT require USDOT, but ${state.state_name} intrastate ${operationType.replace('_', ' ')} DOES require it.`;
        }

        res.json({
          requiresUSDOT,
          requiresDQFile: requiresUSDOT,
          threshold: { gvwr: gvwrThreshold, passengers: passengerThreshold },
          reasoning,
          ruleSource: 'qualified_states_list',
          operationType,
          operationRadius,
          potentialSavings,
          stateData: {
            stateCode: state.state_code,
            stateName: state.state_name,
            forHire: {
              gvwr: state.gvwr_threshold_fh,
              passengers: state.passenger_threshold_fh,
              cargoNotes: state.gvwr_notes_fh
            },
            privateProperty: {
              gvwr: state.gvwr_threshold_pp,
              passengers: state.passenger_threshold_pp,
              cargoNotes: state.gvwr_notes_pp
            }
          }
        });
      }
    );
  } catch (error) {
    console.error('Error in check-requirement:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST upload qualified states file (Excel, CSV, ODS)
app.post('/api/qualified-states/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  try {
    let workbook;
    
    // Read the file based on extension
    if (fileExtension === '.csv') {
      const csvData = fs.readFileSync(filePath, 'utf8');
      workbook = XLSX.read(csvData, { type: 'string' });
    } else if (['.xlsx', '.xls', '.ods'].includes(fileExtension)) {
      workbook = XLSX.readFile(filePath);
    } else {
      fs.unlinkSync(filePath); // Clean up uploaded file
      return res.status(400).json({ error: 'Unsupported file format. Please upload .xlsx, .xls, .csv, or .ods' });
    }

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Handle grid layout: A2-A51 (states), B2-H51 (data columns)
    let data = [];
    
    console.log('📊 Processing grid layout (Columns A-H, Rows 2-51)');
    console.log('📊 Sheet name:', sheetName);
    console.log('📊 Sample cells: A1=', worksheet['A1']?.v, 'A2=', worksheet['A2']?.v, 'B2=', worksheet['B2']?.v);
    
    // Process rows 2-51 (A2-A51, B2-B51, etc.)
    for (let row = 2; row <= 51; row++) {
      const stateCell = worksheet[`A${row}`];
      const dotWeightCell = worksheet[`B${row}`];
      const dotPassengerCell = worksheet[`C${row}`];
      const dotCargoCell = worksheet[`D${row}`];
      const dqWeightCell = worksheet[`E${row}`];
      const dqPassengerCell = worksheet[`F${row}`];
      const dqCargoCell = worksheet[`G${row}`];
      const notesCell = worksheet[`H${row}`];
      
      // Skip if no state name
      if (!stateCell || !stateCell.v) continue;
      
      const stateName = stateCell.v.toString().trim();
      if (!stateName) continue;
      
      // Create row object with the grid data
      const rowData = {
        'State': stateName,
        'DOT - Weight': dotWeightCell ? dotWeightCell.v : '',
        'DOT - Passengers': dotPassengerCell ? dotPassengerCell.v : '',
        'DOT - Cargo': dotCargoCell ? dotCargoCell.v : '',
        'DQ - Weight': dqWeightCell ? dqWeightCell.v : '',
        'DQ - Passengers': dqPassengerCell ? dqPassengerCell.v : '',
        'DQ - Cargo': dqCargoCell ? dqCargoCell.v : '',
        'Notes': notesCell ? notesCell.v : ''
      };
      
      data.push(rowData);
    }

    if (data.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'No state data found in rows A2-A51' });
    }

    // DELETE ALL OLD DATA BEFORE INSERTING NEW
    console.log('🗑️ Deleting old qualified states data...');
    await runQuery('DELETE FROM qualified_states');
    console.log('✅ Old data deleted');

    // Validate and insert data
    let insertedCount = 0;
    const errors = [];

    // Log first row to see what columns we have
    if (data.length > 0) {
      console.log('📋 First row columns:', Object.keys(data[0]));
      console.log('📋 First row data:', data[0]);
    }

    for (const row of data) {
      // Map columns based on your specific file structure:
      // A = State Name
      // B = DOT - Weight (For Hire GVWR threshold)
      // C = DOT - Passengers (For Hire passenger threshold)
      // D = DOT - Cargo (For Hire cargo notes)
      // E = DQ - Weight (Private Property GVWR threshold)
      // F = DQ - Passengers (Private Property passenger threshold)
      // G = DQ - Cargo (Private Property cargo notes)
      // H = Notes (general notes)
      
      const stateName = row['State'];
      const dotWeight = row['DOT - Weight'] || '';
      const dotPassengers = row['DOT - Passengers'] || '';
      const dotCargo = row['DOT - Cargo'] || '';
      const dqWeight = row['DQ - Weight'] || '';
      const dqPassengers = row['DQ - Passengers'] || '';
      const dqCargo = row['DQ - Cargo'] || '';
      const generalNotes = row['Notes'] || '';

      console.log(`Processing row: State="${stateName}", DOT Weight="${dotWeight}", DOT Pass="${dotPassengers}", DQ Weight="${dqWeight}", DQ Pass="${dqPassengers}"`);

      // Skip if no state name found
      if (!stateName) {
        errors.push(`Skipped row - no valid state name found`);
        continue;
      }

      // Convert state name to state code
      const stateCodeMap = {
        'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
        'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
        'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
        'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
        'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
        'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
        'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
        'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
        'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
        'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
        'district of columbia': 'DC'
      };

      const stateCode = stateCodeMap[stateName.toLowerCase()] || stateName.substring(0, 2).toUpperCase();

      // Helper function to parse values that might be "FH: X - PP: Y" or just a number
      const parseThreshold = (value) => {
        const str = String(value).trim();
        
        // Handle N/A
        if (str === 'N/A' || str === '') {
          return { fh: 0, pp: 0 };
        }
        
        // Check if it contains "FH:" and "PP:"
        if (str.includes('FH:') && str.includes('PP:')) {
          const fhMatch = str.match(/FH:\s*([^-]+)/);
          const ppMatch = str.match(/PP:\s*(.+)/);
          
          const fhValue = fhMatch ? fhMatch[1].trim() : '';
          const ppValue = ppMatch ? ppMatch[1].trim() : '';
          
          // Handle "Any" as 1 (meaning all operations)
          const fh = fhValue.toLowerCase() === 'any' ? 1 : parseInt(fhValue) || 0;
          const pp = ppValue.toLowerCase() === 'any' ? 1 : parseInt(ppValue) || 0;
          
          return { fh, pp };
        }
        
        // Just a number - use for both FH and PP
        const num = parseInt(str) || 0;
        return { fh: num, pp: num };
      };

      // Parse weight and passenger thresholds
      const dotWeightParsed = parseThreshold(dotWeight);
      const dotPassengersParsed = parseThreshold(dotPassengers);
      const dqWeightParsed = parseThreshold(dqWeight);
      const dqPassengersParsed = parseThreshold(dqPassengers);

      // Map to database columns
      // DOT columns = For Hire (FH), DQ columns = Private Property (PP)
      const gvwrThresholdFH = dotWeightParsed.fh;
      const passengerThresholdFH = dotPassengersParsed.fh;
      const gvwrThresholdPP = dqWeightParsed.pp;
      const passengerThresholdPP = dqPassengersParsed.pp;

      // Determine if requires authority (if either for-hire threshold is set and above 0)
      const requiresAuthority = gvwrThresholdFH > 0 || passengerThresholdFH > 0;
      const authorityName = requiresAuthority ? `${stateName} Intrastate Authority` : null;

      console.log(`Final values: State=${stateCode}, Name=${stateName}, FH GVWR=${gvwrThresholdFH}, FH Pass=${passengerThresholdFH}, PP GVWR=${gvwrThresholdPP}, PP Pass=${passengerThresholdPP}`);

      try {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT OR REPLACE INTO qualified_states (
              state_code, state_name, 
              gvwr_threshold_fh, gvwr_notes_fh,
              gvwr_threshold_pp, gvwr_notes_pp,
              passenger_threshold_fh, passenger_notes_fh,
              passenger_threshold_pp, passenger_notes_pp,
              requires_intrastate_authority, intrastate_authority_name,
              adopted_federal_49cfr, notes, last_updated, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), 'admin')`,
            [
              stateCode.toUpperCase().trim(),
              stateName.trim(),
              gvwrThresholdFH,
              dotCargo || null,
              gvwrThresholdPP,
              dqCargo || null,
              passengerThresholdFH,
              dotCargo || null, // Using same cargo notes for passenger context
              passengerThresholdPP,
              dqCargo || null,
              requiresAuthority ? 1 : 0,
              authorityName || null,
              0, // Set to 0 for now - can be updated later
              generalNotes || null
            ],
            function (err) {
              if (err) {
                reject(err);
              } else {
                insertedCount++;
                resolve();
              }
            }
          );
        });
      } catch (err) {
        errors.push(`Error inserting ${stateCode}: ${err.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      count: insertedCount,
      totalRows: data.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${insertedCount} of ${data.length} states`
    });

  } catch (error) {
    console.error('Error processing file:', error);
    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: 'Error processing file: ' + error.message });
  }
});

// ===================================================================
// ANALYTICS & TRACKING API ENDPOINTS
// ===================================================================

// Analytics Metrics
app.get('/api/analytics/metrics', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM analytics_metrics';
    const params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY last_updated DESC';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching analytics metrics:', err);
        return res.status(500).json({ error: 'Failed to fetch analytics metrics' });
      }
      res.json(rows || []);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activity Log
app.get('/api/activity-log', async (req, res) => {
  try {
    const { entity_type, limit = 50 } = req.query;
    let query = 'SELECT * FROM activity_log';
    const params = [];
    
    if (entity_type) {
      query += ' WHERE entity_type = ?';
      params.push(entity_type);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching activity log:', err);
        return res.status(500).json({ error: 'Failed to fetch activity log' });
      }
      res.json(rows || []);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/activity-log', async (req, res) => {
  try {
    const { entity_type, entity_id, action, description, user_id, metadata } = req.body;
    const id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await runExecute(
      `INSERT INTO activity_log (id, entity_type, entity_id, action, description, user_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, entity_type, entity_id, action, description || null, user_id || null, metadata ? JSON.stringify(metadata) : null]
    );
    
    res.status(201).json({ id, message: 'Activity logged successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await runQuery('SELECT * FROM reports ORDER BY last_generated DESC');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = 'SELECT * FROM notifications';
    const params = [];
    
    if (user_id) {
      query += ' WHERE user_id = ?';
      params.push(user_id);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({ error: 'Failed to fetch notifications' });
      }
      res.json(rows || []);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revenue Tracking
app.get('/api/revenue-tracking', async (req, res) => {
  try {
    const data = await runQuery('SELECT * FROM revenue_tracking ORDER BY period DESC LIMIT 12');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// CREDENTIAL MANAGEMENT API ENDPOINTS
// =============================================================================

// Import encryption service
const crypto = require('crypto');

// Simple encryption service (inline for now)
class EncryptionService {
  constructor() {
    const secretKey = process.env.ENCRYPTION_SECRET_KEY || 'dev-encryption-key-do-not-use-in-production-minimum-32-chars';
    this.algorithm = 'aes-256-gcm';
    this.key = crypto.scryptSync(secretKey, 'rapid-crm-encryption-salt-2025', 32);
  }

  encrypt(text) {
    if (!text) throw new Error('Cannot encrypt empty text');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedData) {
    if (!encryptedData) throw new Error('Cannot decrypt empty data');
    const parts = encryptedData.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted data format');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  hashPII(value) {
    if (!value) return '';
    return crypto.createHash('sha256').update(value).digest('hex').substring(0, 16);
  }
}

const encryptionService = new EncryptionService();

// GET employee credentials (password stays encrypted)
app.get('/api/employees/:id/credentials', async (req, res) => {
  try {
    const employee = await runQueryOne(
      `SELECT 
        login_gov_username,
        login_gov_mfa_method,
        login_gov_mfa_phone,
        fmcsa_account_verified,
        fmcsa_verification_date,
        last_credential_update
      FROM users 
      WHERE id = ?`,
      [req.params.id]
    );
    
    res.json(employee || {});
  } catch (error) {
    console.error('Error loading credentials:', error);
    res.status(500).json({ error: 'Failed to load credentials' });
  }
});

// POST update credentials
app.post('/api/employees/:id/credentials', async (req, res) => {
  const { username, password, mfaMethod, mfaPhone, backupCodes } = req.body;
  
  try {
    // Encrypt password if provided
    let encryptedPassword = null;
    if (password) {
      encryptedPassword = encryptionService.encrypt(password);
    }
    
    // Encrypt backup codes if provided
    let encryptedBackupCodes = null;
    if (backupCodes) {
      encryptedBackupCodes = encryptionService.encrypt(backupCodes);
    }
    
    // Update database
    if (password) {
      await runExecute(
        `UPDATE users SET 
          login_gov_username = ?,
          login_gov_password_encrypted = ?,
          login_gov_mfa_method = ?,
          login_gov_mfa_phone = ?,
          login_gov_backup_codes_encrypted = ?,
          last_credential_update = ?
        WHERE id = ?`,
        [username, encryptedPassword, mfaMethod, mfaPhone, encryptedBackupCodes, 
         new Date().toISOString(), req.params.id]
      );
    } else {
      // Update without changing password
      await runExecute(
        `UPDATE users SET 
          login_gov_username = ?,
          login_gov_mfa_method = ?,
          login_gov_mfa_phone = ?,
          last_credential_update = ?
        WHERE id = ?`,
        [username, mfaMethod, mfaPhone, new Date().toISOString(), req.params.id]
      );
    }
    
    // Log credential access
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await runExecute(
      `INSERT INTO credential_access_log (
        id, timestamp, employee_id, credential_type,
        accessed_by_type, accessed_by_id, purpose,
        access_granted, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logId,
        new Date().toISOString(),
        req.params.id,
        'login_gov_credentials',
        'user',
        'admin', // Would use req.user.id in production
        'credential_update',
        1,
        req.ip
      ]
    ).catch(err => {
      // Table might not exist yet, ignore error
      console.log('Credential access log not available yet (table may not exist)');
    });
    
    res.json({ success: true, message: 'Credentials updated successfully' });
  } catch (error) {
    console.error('Error updating credentials:', error);
    res.status(500).json({ error: 'Failed to update credentials' });
  }
});

// POST test credentials (verify Login.gov connection)
app.post('/api/employees/:id/credentials/test', async (req, res) => {
  try {
    // TODO: Implement actual Login.gov API test
    // For now, just return success to test the flow
    res.json({ success: true, message: 'Credential test successful (simulated)' });
  } catch (error) {
    console.error('Error testing credentials:', error);
    res.status(500).json({ error: 'Failed to test credentials' });
  }
});

// GET employee identity document
app.get('/api/employees/:id/identity-document', async (req, res) => {
  try {
    const document = await runQueryOne(
      `SELECT * FROM employee_identity_documents 
       WHERE employee_id = ? AND is_active = 1`,
      [req.params.id]
    ).catch(() => null); // Table might not exist yet
    
    res.json(document || null);
  } catch (error) {
    console.error('Error loading identity document:', error);
    res.status(500).json({ error: 'Failed to load identity document' });
  }
});

// =============================================================================
// LIVE RPA CONTROL API ENDPOINTS
// =============================================================================

// Note: In production, you would import and use the actual LiveUSDOTRPAService
// For now, we'll create placeholder endpoints that return mock data

let rpaService = null; // Will hold the RPA service instance
let rpaStatus = {
  status: 'idle',
  currentPage: 0,
  totalPages: 77,
  currentAction: 'Ready to start',
  errors: [],
  startTime: null,
  endTime: null
};

// GET RPA status
app.get('/api/rpa/status', async (req, res) => {
  try {
    res.json(rpaStatus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get RPA status' });
  }
});

// POST start RPA
app.post('/api/rpa/start', async (req, res) => {
  try {
    const { dealId } = req.body;
    
    if (!dealId) {
      return res.status(400).json({ error: 'Deal ID required' });
    }
    
    // TODO: Initialize and start the actual RPA service
    // const { LiveUSDOTRPAService } = require('./src/services/rpa/LiveUSDOTRPAService.ts');
    // rpaService = new LiveUSDOTRPAService();
    // await rpaService.initialize();
    // await rpaService.navigateToFMCSA();
    
    // For now, simulate starting
    rpaStatus = {
      status: 'running',
      currentPage: 0,
      totalPages: 77,
      currentAction: 'Starting RPA agent...',
      errors: [],
      startTime: new Date().toISOString(),
      endTime: null
    };
    
    console.log(`🚀 RPA started for deal: ${dealId}`);
    res.json({ success: true, message: 'RPA started' });
  } catch (error) {
    console.error('Error starting RPA:', error);
    res.status(500).json({ error: 'Failed to start RPA' });
  }
});

// POST pause RPA
app.post('/api/rpa/pause', async (req, res) => {
  try {
    // TODO: Call rpaService.pause()
    rpaStatus.status = 'paused';
    rpaStatus.currentAction = 'Paused by user';
    
    console.log('⏸️ RPA paused');
    res.json({ success: true, message: 'RPA paused' });
  } catch (error) {
    console.error('Error pausing RPA:', error);
    res.status(500).json({ error: 'Failed to pause RPA' });
  }
});

// POST resume RPA
app.post('/api/rpa/resume', async (req, res) => {
  try {
    // TODO: Call rpaService.resume()
    rpaStatus.status = 'running';
    rpaStatus.currentAction = 'Resuming...';
    
    console.log('▶️ RPA resumed');
    res.json({ success: true, message: 'RPA resumed' });
  } catch (error) {
    console.error('Error resuming RPA:', error);
    res.status(500).json({ error: 'Failed to resume RPA' });
  }
});

// POST stop RPA
app.post('/api/rpa/stop', async (req, res) => {
  try {
    // TODO: Call rpaService.close()
    rpaStatus.status = 'idle';
    rpaStatus.currentAction = 'Stopped by user';
    rpaStatus.endTime = new Date().toISOString();
    
    console.log('⏹️ RPA stopped');
    res.json({ success: true, message: 'RPA stopped' });
  } catch (error) {
    console.error('Error stopping RPA:', error);
    res.status(500).json({ error: 'Failed to stop RPA' });
  }
});

// GET RPA screenshot
app.get('/api/rpa/screenshot', async (req, res) => {
  try {
    // TODO: Get actual screenshot from rpaService.getCurrentScreenshot()
    // For now, return placeholder
    res.status(404).json({ error: 'No screenshot available' });
  } catch (error) {
    console.error('Error getting screenshot:', error);
    res.status(500).json({ error: 'Failed to get screenshot' });
  }
});

// Setup error handling middleware - MUST BE LAST
setupErrorHandling(app);

// Initialize database and start server
validateDatabase()
  .then(() => checkAndInitializeDatabase())
  .then(() => {
    console.log('✅ Database ready');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log('✅ Error handling middleware active');
      console.log('✅ Foreign key constraints enabled');
      console.log('✅ Input sanitization active');
      
      // Start workflow dispatcher
      setTimeout(() => {
        workflowDispatcher.start();
        console.log('✅ Workflow automation system started');
      }, 2000); // Wait 2 seconds for everything to initialize
    });
  })
  .catch((error) => {
    console.error('❌ Failed to validate or initialize database:', error);
    process.exit(1);
  });

