const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, '../../instance/rapid_crm.db');
const db = new Database(dbPath);

console.log('🔧 Adding Tasks table...\n');

try {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create tasks table
  console.log('Creating tasks table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
      assigned_to TEXT,
      related_type TEXT CHECK(related_type IN ('contact', 'company', 'deal', 'invoice')),
      related_id TEXT,
      related_name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ tasks table created');

  // Create index for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
  `);
  console.log('✅ indexes created');

  console.log('\n✅ Tasks table created successfully!');

} catch (error) {
  console.error('❌ Error creating tasks table:', error);
  process.exit(1);
} finally {
  db.close();
}

