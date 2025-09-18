const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');

console.log('🚀 Initializing IFTA tables in Rapid CRM Database...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to existing CRM database');
});

// IFTA Tables
const tables = [
  `CREATE TABLE IF NOT EXISTS ifta_registrations (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    ifta_account_number TEXT UNIQUE NOT NULL,
    registration_year INTEGER NOT NULL,
    registration_date DATE NOT NULL,
    renewal_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    total_miles DECIMAL(10,2) DEFAULT 0,
    total_gallons DECIMAL(10,2) DEFAULT 0,
    total_tax_due DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS ifta_quarterly_filings (
    id TEXT PRIMARY KEY,
    ifta_registration_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    quarter INTEGER NOT NULL,
    year INTEGER NOT NULL,
    filing_period_start DATE NOT NULL,
    filing_period_end DATE NOT NULL,
    filing_due_date DATE NOT NULL,
    filing_date DATE,
    status TEXT NOT NULL DEFAULT 'pending',
    total_miles DECIMAL(10,2) DEFAULT 0,
    total_gallons DECIMAL(10,2) DEFAULT 0,
    total_tax_due DECIMAL(10,2) DEFAULT 0,
    penalty_amount DECIMAL(10,2) DEFAULT 0,
    interest_amount DECIMAL(10,2) DEFAULT 0,
    total_amount_due DECIMAL(10,2) DEFAULT 0,
    payment_date DATE,
    payment_amount DECIMAL(10,2) DEFAULT 0,
    payment_method TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS ifta_service_packages (
    id TEXT PRIMARY KEY,
    package_name TEXT NOT NULL,
    package_type TEXT NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10,2) NOT NULL,
    setup_fee DECIMAL(10,2) DEFAULT 0,
    features TEXT,
    max_vehicles INTEGER DEFAULT 10,
    max_quarterly_filings INTEGER DEFAULT 4,
    includes_audit_support BOOLEAN DEFAULT FALSE,
    includes_compliance_monitoring BOOLEAN DEFAULT FALSE,
    includes_dedicated_support BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS ifta_compliance_alerts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    ifta_registration_id TEXT,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'open',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_date DATE,
    resolved_by TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS ifta_client_services (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    service_package_id TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active',
    monthly_fee DECIMAL(10,2) NOT NULL,
    setup_fee_paid DECIMAL(10,2) DEFAULT 0,
    total_vehicles INTEGER DEFAULT 0,
    account_manager TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`
];

// Indexes
const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_ifta_registrations_company ON ifta_registrations(company_id)',
  'CREATE INDEX IF NOT EXISTS idx_ifta_registrations_year ON ifta_registrations(registration_year)',
  'CREATE INDEX IF NOT EXISTS idx_ifta_registrations_status ON ifta_registrations(status)',
  'CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_company ON ifta_quarterly_filings(company_id)',
  'CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_period ON ifta_quarterly_filings(quarter, year)',
  'CREATE INDEX IF NOT EXISTS idx_ifta_quarterly_status ON ifta_quarterly_filings(status)',
  'CREATE INDEX IF NOT EXISTS idx_ifta_services_package_type ON ifta_service_packages(package_type)',
  'CREATE INDEX IF NOT EXISTS idx_ifta_services_active ON ifta_service_packages(is_active)',
  'CREATE INDEX IF NOT EXISTS idx_ifta_alerts_company ON ifta_compliance_alerts(company_id)',
  'CREATE INDEX IF NOT EXISTS idx_ifta_alerts_status ON ifta_compliance_alerts(status)',
  'CREATE INDEX IF NOT EXISTS idx_ifta_client_services_company ON ifta_client_services(company_id)',
  'CREATE INDEX IF NOT EXISTS idx_ifta_client_services_status ON ifta_client_services(status)'
];

let successCount = 0;
let errorCount = 0;

// Create tables
const createTables = async () => {
  for (let i = 0; i < tables.length; i++) {
    try {
      await new Promise((resolve, reject) => {
        db.run(tables[i], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      successCount++;
      console.log(`✅ Created table ${i + 1}/${tables.length}`);
    } catch (error) {
      errorCount++;
      console.log(`❌ Error creating table ${i + 1}: ${error.message}`);
    }
  }
};

// Create indexes
const createIndexes = async () => {
  for (let i = 0; i < indexes.length; i++) {
    try {
      await new Promise((resolve, reject) => {
        db.run(indexes[i], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      successCount++;
      console.log(`✅ Created index ${i + 1}/${indexes.length}`);
    } catch (error) {
      errorCount++;
      console.log(`❌ Error creating index ${i + 1}: ${error.message}`);
    }
  }
};

// Execute everything
const initialize = async () => {
  console.log('📊 Creating IFTA tables...');
  await createTables();
  
  console.log('📊 Creating IFTA indexes...');
  await createIndexes();
  
  // Close database
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('🔒 Database connection closed');
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 IFTA tables initialized successfully!');
    } else {
      console.log('\n⚠️  Some errors occurred during initialization.');
    }
    
    process.exit(errorCount > 0 ? 1 : 0);
  });
};

initialize().catch(error => {
  console.error('💥 Fatal error during initialization:', error.message);
  process.exit(1);
});
