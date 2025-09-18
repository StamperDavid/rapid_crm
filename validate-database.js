const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'instance', 'rapid_crm.db');

console.log('🔍 Validating database schema...');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath);

db.all("PRAGMA table_info(companies)", (err, columns) => {
  if (err) {
    console.error('❌ Database validation failed:', err);
    process.exit(1);
  }
  
  const columnNames = columns.map(col => col.name);
  const hasBasicFields = columnNames.includes('first_name') && columnNames.includes('email');
  
  console.log('Found columns:', columnNames.join(', '));
  
  if (!hasBasicFields) {
    console.error('❌ DATABASE SCHEMA VALIDATION FAILED!');
    console.error('Missing basic required fields: first_name, email');
    console.error('Found fields:', columnNames.join(', '));
    process.exit(1);
  }
  
  console.log('✅ Database schema validation passed');
  console.log('✅ Found basic required fields: first_name, email');
  console.log('✅ Using minimal schema');
  
  db.close();
  process.exit(0);
});
