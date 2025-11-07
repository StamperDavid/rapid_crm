const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, '../../instance/rapid_crm.db');
const db = new Database(dbPath);

console.log('🔧 Adding Portal and Avatar configuration tables...\n');

try {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create portal_designs table
  console.log('Creating portal_designs table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS portal_designs (
      id INTEGER PRIMARY KEY DEFAULT 1,
      design TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ portal_designs table created');

  // Create avatar_configs table
  console.log('Creating avatar_configs table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS avatar_configs (
      id INTEGER PRIMARY KEY DEFAULT 1,
      config TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ avatar_configs table created');

  // Create login_page_config table if it doesn't exist
  console.log('Creating login_page_config table (if not exists)...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS login_page_config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      config TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ login_page_config table ensured');

  console.log('\n✅ All portal configuration tables created successfully!');
  console.log('\nTables created:');
  console.log('  - portal_designs (for client portal design configurations)');
  console.log('  - avatar_configs (for AI agent avatar configurations)');
  console.log('  - login_page_config (for client login page configurations)');

} catch (error) {
  console.error('❌ Error creating portal tables:', error);
  process.exit(1);
} finally {
  db.close();
}

