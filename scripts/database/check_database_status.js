const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'instance', 'rapid_crm.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking database status...');
console.log('Database path:', dbPath);

// Check if database file exists
const fs = require('fs');
if (!fs.existsSync(dbPath)) {
  console.error('❌ Database file does not exist!');
  process.exit(1);
}

console.log('✅ Database file exists');

// Check tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('❌ Error checking tables:', err);
    process.exit(1);
  }
  
  console.log('📋 Found tables:', tables.map(t => t.name).join(', '));
  
  // Check specific tables that are failing
  const requiredTables = ['companies', 'leads', 'api_keys'];
  
  requiredTables.forEach(tableName => {
    db.all(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
      if (err) {
        console.error(`❌ Error checking ${tableName}:`, err.message);
      } else {
        console.log(`✅ ${tableName}: ${result[0].count} records`);
      }
    });
  });
  
  // Check companies table structure
  db.all("PRAGMA table_info(companies)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking companies table structure:', err);
    } else {
      console.log('📊 Companies table columns:', columns.map(c => c.name).join(', '));
    }
    
    db.close();
  });
});
