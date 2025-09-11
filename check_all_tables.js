const Database = require('better-sqlite3');
const db = new Database('./instance/rapid_crm.db');

console.log('=== ALL TABLES IN DATABASE ===');
const tables = db.prepare('SELECT name FROM sqlite_master WHERE type = ?').all('table');
console.log('Tables found:', tables.length);
tables.forEach((table, index) => {
  console.log(`${index + 1}. ${table.name}`);
});

console.log('\n=== CHECKING KEY TABLES ===');
const keyTables = ['companies', 'vehicles', 'drivers', 'contacts', 'deals', 'invoices', 'leads', 'campaigns'];
keyTables.forEach(tableName => {
  const exists = tables.some(t => t.name === tableName);
  console.log(`${tableName}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
});

db.close();
