const Database = require('better-sqlite3');
const db = new Database('./PycharmProjects/Rapid_CRM/instance/rapid_crm.db');
console.log('=== SECOND DATABASE SCHEMA ===');
const tables = db.prepare('SELECT name FROM sqlite_master WHERE type = ?').all('table');
console.log('Tables:', tables.map(t => t.name));
console.log('\n=== COMPANIES TABLE SCHEMA ===');
const schema = db.prepare('PRAGMA table_info(companies)').all();
console.log(schema);
db.close();
