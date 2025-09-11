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
  const hasUsdot = columnNames.includes('usdot_number');
  const hasFleet = columnNames.includes('number_of_vehicles');
  const hasHazmat = columnNames.includes('hazmat_required');
  const hasPhysicalAddress = columnNames.includes('physical_street_address');
  
  console.log('Found columns:', columnNames.join(', '));
  
  if (!hasUsdot || !hasFleet || !hasHazmat || !hasPhysicalAddress) {
    console.error('❌ WRONG DATABASE SCHEMA DETECTED!');
    console.error('This appears to be the simple schema, not the comprehensive transportation schema.');
    console.error('Expected fields: usdot_number, number_of_vehicles, hazmat_required, physical_street_address');
    console.error('Missing fields:');
    if (!hasUsdot) console.error('  - usdot_number');
    if (!hasFleet) console.error('  - number_of_vehicles');
    if (!hasHazmat) console.error('  - hazmat_required');
    if (!hasPhysicalAddress) console.error('  - physical_street_address');
    console.error('Please ensure you are using the correct comprehensive transportation database.');
    process.exit(1);
  }
  
  console.log('✅ Database schema validation passed');
  console.log('✅ Found required fields: usdot_number, number_of_vehicles, hazmat_required, physical_street_address');
  console.log('✅ Using comprehensive transportation schema');
  
  db.close();
  process.exit(0);
});
