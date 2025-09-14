const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'instance', 'rapid_crm.db');
const db = new sqlite3.Database(dbPath);

console.log('Creating client portal database tables...');

// Create client_portal_settings table
db.run(`
  CREATE TABLE IF NOT EXISTS client_portal_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    portal_name TEXT DEFAULT 'Client Portal',
    welcome_message TEXT DEFAULT 'Welcome to your client portal',
    theme_settings TEXT,
    features_enabled TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies (id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating client_portal_settings table:', err);
  } else {
    console.log('✅ client_portal_settings table created');
  }
});

// Create client_sessions table
db.run(`
  CREATE TABLE IF NOT EXISTS client_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    company_id INTEGER,
    client_name TEXT,
    client_email TEXT,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (company_id) REFERENCES companies (id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating client_sessions table:', err);
  } else {
    console.log('✅ client_sessions table created');
  }
});

// Create client_messages table
db.run(`
  CREATE TABLE IF NOT EXISTS client_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    message_type TEXT CHECK(message_type IN ('user', 'agent', 'system')),
    content TEXT NOT NULL,
    metadata TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES client_sessions (session_id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating client_messages table:', err);
  } else {
    console.log('✅ client_messages table created');
  }
});

// Create client_portal_analytics table
db.run(`
  CREATE TABLE IF NOT EXISTS client_portal_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    event_type TEXT,
    event_data TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES client_sessions (session_id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating client_portal_analytics table:', err);
  } else {
    console.log('✅ client_portal_analytics table created');
  }
});

// Create client_support_tickets table
db.run(`
  CREATE TABLE IF NOT EXISTS client_support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number TEXT UNIQUE NOT NULL,
    company_id INTEGER,
    client_name TEXT,
    client_email TEXT,
    subject TEXT,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    assigned_to TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies (id)
  )
`, (err) => {
  if (err) {
    console.error('Error creating client_support_tickets table:', err);
  } else {
    console.log('✅ client_support_tickets table created');
  }
});

// Insert default client portal settings
db.run(`
  INSERT OR IGNORE INTO client_portal_settings (
    company_id,
    portal_name,
    welcome_message,
    theme_settings,
    features_enabled
  ) VALUES (
    1,
    'Rapid CRM Client Portal',
    'Welcome to your Rapid CRM client portal. Here you can view your company information, compliance status, and get assistance with any questions.',
    '{"primaryColor": "#3b82f6", "secondaryColor": "#8b5cf6", "accentColor": "#10b981"}',
    '["dashboard", "compliance", "support", "chat"]'
  )
`, (err) => {
  if (err) {
    console.error('Error inserting default client portal settings:', err);
  } else {
    console.log('✅ Default client portal settings inserted');
  }
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('✅ Client portal database tables created successfully');
  }
});
