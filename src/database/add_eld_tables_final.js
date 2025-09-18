const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Add ELD Tables to Existing rapid_crm.db - Final Version
 * This script adds only the essential ELD tables needed for the API endpoints
 */

const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');

console.log('🚀 Adding ELD tables to existing CRM database...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to existing CRM database');
});

// Create ELD tables
const createTables = [
  `CREATE TABLE IF NOT EXISTS eld_hos_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    vehicle_id TEXT NOT NULL,
    log_type TEXT NOT NULL CHECK (log_type IN ('driving', 'on_duty', 'off_duty', 'sleeper_berth')),
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    location TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS eld_dvir_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    vehicle_id TEXT NOT NULL,
    inspection_type TEXT NOT NULL CHECK (inspection_type IN ('pre_trip', 'post_trip', 'intermediate')),
    inspection_date DATETIME NOT NULL,
    defects TEXT, -- JSON string of defects
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS eld_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT,
    vehicle_id TEXT,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    details TEXT, -- JSON string of additional details
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
    acknowledged_by TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS geotab_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    serial_number TEXT,
    status TEXT DEFAULT 'active',
    last_sync DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS geotab_credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL, -- Should be encrypted in production
    database TEXT NOT NULL,
    server TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`
];

// Create indexes
const createIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_hos_logs_driver ON eld_hos_logs(driver_id)',
  'CREATE INDEX IF NOT EXISTS idx_hos_logs_vehicle ON eld_hos_logs(vehicle_id)',
  'CREATE INDEX IF NOT EXISTS idx_hos_logs_type ON eld_hos_logs(log_type)',
  'CREATE INDEX IF NOT EXISTS idx_hos_logs_start_time ON eld_hos_logs(start_time)',
  
  'CREATE INDEX IF NOT EXISTS idx_dvir_driver ON eld_dvir_reports(driver_id)',
  'CREATE INDEX IF NOT EXISTS idx_dvir_vehicle ON eld_dvir_reports(vehicle_id)',
  'CREATE INDEX IF NOT EXISTS idx_dvir_inspection_date ON eld_dvir_reports(inspection_date)',
  'CREATE INDEX IF NOT EXISTS idx_dvir_type ON eld_dvir_reports(inspection_type)',
  
  'CREATE INDEX IF NOT EXISTS idx_alerts_driver ON eld_alerts(driver_id)',
  'CREATE INDEX IF NOT EXISTS idx_alerts_vehicle ON eld_alerts(vehicle_id)',
  'CREATE INDEX IF NOT EXISTS idx_alerts_status ON eld_alerts(status)',
  'CREATE INDEX IF NOT EXISTS idx_alerts_severity ON eld_alerts(severity)',
  'CREATE INDEX IF NOT EXISTS idx_alerts_created ON eld_alerts(created_at)',
  
  'CREATE INDEX IF NOT EXISTS idx_geotab_devices_status ON geotab_devices(status)',
  'CREATE INDEX IF NOT EXISTS idx_geotab_credentials_active ON geotab_credentials(is_active)'
];

// Execute table creation
let completedTables = 0;
const totalTables = createTables.length;

createTables.forEach((sql, index) => {
  db.run(sql, (err) => {
    if (err) {
      console.error(`❌ Error creating table ${index + 1}:`, err.message);
      console.error('Statement:', sql);
    } else {
      completedTables++;
      console.log(`✅ Created table ${index + 1}/${totalTables}`);
    }
    
    // After all tables are created, create indexes
    if (completedTables === totalTables) {
      console.log('📊 Creating indexes...');
      let completedIndexes = 0;
      const totalIndexes = createIndexes.length;
      
      createIndexes.forEach((sql, index) => {
        db.run(sql, (err) => {
          if (err) {
            console.error(`❌ Error creating index ${index + 1}:`, err.message);
            console.error('Statement:', sql);
          } else {
            completedIndexes++;
            console.log(`✅ Created index ${completedIndexes}/${totalIndexes}`);
          }
          
          // Close database when all indexes are created
          if (completedIndexes === totalIndexes) {
            console.log('🎉 ELD tables and indexes created successfully!');
            db.close((err) => {
              if (err) {
                console.error('❌ Error closing database:', err.message);
              } else {
                console.log('✅ Database connection closed');
              }
            });
          }
        });
      });
    }
  });
});
