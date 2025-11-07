const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, '../../instance/rapid_crm.db');
const db = new Database(dbPath);

console.log('🔧 Creating comprehensive database schema...\n');

try {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // ===================================================================
  // ANALYTICS TABLES
  // ===================================================================
  
  console.log('Creating analytics_metrics table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_metrics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      change_percentage REAL,
      trend TEXT CHECK(trend IN ('up', 'down', 'stable')),
      target REAL,
      benchmark REAL,
      confidence TEXT CHECK(confidence IN ('high', 'medium', 'low')),
      last_updated TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ analytics_metrics table created');

  console.log('Creating reports table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      frequency TEXT,
      is_scheduled INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 0,
      tags TEXT,
      created_by TEXT,
      views INTEGER DEFAULT 0,
      last_generated TEXT,
      last_viewed TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ reports table created');

  console.log('Creating dashboards table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS dashboards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      widgets TEXT,
      is_public INTEGER DEFAULT 0,
      created_by TEXT,
      views INTEGER DEFAULT 0,
      tags TEXT,
      last_modified TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ dashboards table created');

  console.log('Creating competitive_insights table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS competitive_insights (
      id TEXT PRIMARY KEY,
      competitor TEXT NOT NULL,
      metric TEXT NOT NULL,
      value REAL NOT NULL,
      change_percentage REAL,
      trend TEXT CHECK(trend IN ('up', 'down', 'stable')),
      source TEXT,
      confidence TEXT CHECK(confidence IN ('high', 'medium', 'low')),
      last_updated TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ competitive_insights table created');

  console.log('Creating agent_performance table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_performance (
      id TEXT PRIMARY KEY,
      agent_name TEXT NOT NULL,
      agent_type TEXT NOT NULL,
      success_rate REAL DEFAULT 0,
      response_time REAL DEFAULT 0,
      customer_satisfaction REAL DEFAULT 0,
      tasks_completed INTEGER DEFAULT 0,
      revenue_generated REAL DEFAULT 0,
      status TEXT CHECK(status IN ('active', 'idle', 'error', 'maintenance')) DEFAULT 'active',
      last_active TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ agent_performance table created');

  // ===================================================================
  // ACTIVITY TRACKING TABLES
  // ===================================================================

  console.log('Creating activity_log table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      description TEXT,
      user_id TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ activity_log table created');

  console.log('Creating client_sessions table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS client_sessions (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      session_start TEXT NOT NULL,
      session_end TEXT,
      duration INTEGER,
      pages_viewed INTEGER DEFAULT 0,
      actions_taken INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ client_sessions table created');

  // ===================================================================
  // NOTIFICATIONS & ALERTS TABLES
  // ===================================================================

  console.log('Creating notifications table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK(type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      link TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ notifications table created');

  console.log('Creating alerts table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      alert_type TEXT NOT NULL,
      severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      is_resolved INTEGER DEFAULT 0,
      resolved_at TEXT,
      resolved_by TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ alerts table created');

  // ===================================================================
  // REVENUE & FINANCIAL TABLES
  // ===================================================================

  console.log('Creating revenue_tracking table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS revenue_tracking (
      id TEXT PRIMARY KEY,
      period TEXT NOT NULL,
      revenue REAL NOT NULL,
      deals_count INTEGER DEFAULT 0,
      conversion_rate REAL DEFAULT 0,
      pipeline_value REAL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✅ revenue_tracking table created');

  // ===================================================================
  // CREATE INDEXES FOR PERFORMANCE
  // ===================================================================

  console.log('Creating indexes...');
  try {
    db.exec('CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type, is_resolved);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_analytics_category ON analytics_metrics(category);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_agent_performance_type ON agent_performance(agent_type);');
    console.log('✅ indexes created');
  } catch (err) {
    console.warn('⚠️ Some indexes may already exist or had errors:', err.message);
  }

  console.log('\n✅ Complete database schema created successfully!');
  console.log('\nTables created:');
  console.log('  Analytics:');
  console.log('    - analytics_metrics');
  console.log('    - reports');
  console.log('    - dashboards');
  console.log('    - competitive_insights');
  console.log('    - agent_performance');
  console.log('  Activity Tracking:');
  console.log('    - activity_log');
  console.log('    - client_sessions');
  console.log('  Notifications:');
  console.log('    - notifications');
  console.log('    - alerts');
  console.log('  Financial:');
  console.log('    - revenue_tracking');

} catch (error) {
  console.error('❌ Error creating schema:', error);
  process.exit(1);
} finally {
  db.close();
}

