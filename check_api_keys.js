const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'instance', 'rapid_crm.db');

console.log('🔍 Checking API keys in database...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Check api_keys table structure
db.all("PRAGMA table_info(api_keys)", (err, columns) => {
  if (err) {
    console.error('❌ Error checking table structure:', err.message);
  } else {
    console.log('📋 API Keys table structure:');
    columns.forEach(col => console.log(`  - ${col.name} (${col.type})`));
  }
  
  // Check api_keys data
  db.all("SELECT * FROM api_keys", (err, rows) => {
    if (err) {
      console.error('❌ Error checking API keys data:', err.message);
    } else {
      console.log('\n📋 API Keys data:');
      if (rows.length === 0) {
        console.log('❌ No API keys found in database');
      } else {
        rows.forEach(row => {
          console.log(`  - ID: ${row.id}, Provider: ${row.provider}, Key: ${row.key_value ? '***' + row.key_value.slice(-4) : 'NULL'}`);
        });
      }
    }
    
    db.close();
  });
});
