const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'instance', 'rapid_crm.db');

console.log('🔍 Checking for API-related tables...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Check for api_keys table
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%api%'", (err, rows) => {
  if (err) {
    console.error('❌ Error checking tables:', err.message);
  } else {
    console.log('📋 API-related tables found:');
    if (rows.length === 0) {
      console.log('❌ No API-related tables found');
    } else {
      rows.forEach(row => console.log(`  - ${row.name}`));
    }
  }
  
  // Check all tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, allRows) => {
    if (err) {
      console.error('❌ Error checking all tables:', err.message);
    } else {
      console.log('\n📋 All tables in database:');
      allRows.forEach(row => console.log(`  - ${row.name}`));
    }
    
    db.close();
  });
});
