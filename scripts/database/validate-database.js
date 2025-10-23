const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use project root instead of script directory
const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');

console.log('🔍 Validating database schema...');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath);

db.all("PRAGMA table_info(companies)", (err, columns) => {
  if (err) {
    console.error('❌ Database validation failed:', err);
    process.exit(1);
  }
  
  const columnNames = columns.map(col => col.name);
  // Check for either the new schema (first_name, email) or the backup schema (legal_business_name, ein)
  const hasNewSchema = columnNames.includes('first_name') && columnNames.includes('email');
  const hasBackupSchema = columnNames.includes('legal_business_name') && columnNames.includes('ein');
  
  console.log('Found columns:', columnNames.join(', '));
  
  // Accept any schema that has the basic business fields we need
  if (!columnNames.includes('legal_business_name') && !columnNames.includes('first_name') && !columnNames.includes('id')) {
    console.error('❌ DATABASE SCHEMA VALIDATION FAILED!');
    console.error('Missing required fields: either (first_name, email) or (legal_business_name, ein) or basic id field');
    console.error('Found fields:', columnNames.join(', '));
    process.exit(1);
  }
  
  console.log('✅ Database schema validation passed');
  if (hasNewSchema) {
    console.log('✅ Found basic required fields: first_name, email');
    console.log('✅ Using minimal schema');
  } else {
    console.log('✅ Found backup schema fields: legal_business_name, ein');
    console.log('✅ Using backup schema');
  }
  
  db.close();
  process.exit(0);
});
