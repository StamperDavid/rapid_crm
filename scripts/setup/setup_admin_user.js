// Script to ensure admin user is properly set up in the database
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

async function setupAdminUser() {
  console.log('👤 Setting up admin user in database...\n');

  try {
    const dbPath = path.join(__dirname, 'instance/rapid_crm.db');
    console.log('Database path:', dbPath);
    
    const db = new Database(dbPath);
    
    // Check if users table exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `).get();
    
    if (!tableExists) {
      console.log('Creating users table...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          permissions TEXT, -- JSON array
          is_active BOOLEAN DEFAULT 1,
          last_login TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
    }
    
    // Hash password for security
    const hashedPassword = await bcrypt.hash('Idoc74058!23', 12);
    
    // Check if admin user already exists
    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('dstamper@rapidcompliance.us');
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists, updating password...');
      db.prepare(`
        UPDATE users 
        SET password = ?, role = 'admin', isActive = 1, updatedAt = ?
        WHERE email = ?
      `).run(hashedPassword, new Date().toISOString(), 'dstamper@rapidcompliance.us');
    } else {
      console.log('Creating new admin user...');
      const adminId = Date.now();
      const now = new Date().toISOString();
      
      db.prepare(`
        INSERT INTO users (
          id, username, email, password, role, firstName, lastName, 
          isActive, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        adminId,
        'dstamper',
        'dstamper@rapidcompliance.us',
        hashedPassword,
        'admin',
        'David',
        'Stamper',
        1,
        now,
        now
      );
    }
    
    // Verify admin user
    const adminUser = db.prepare('SELECT * FROM users WHERE email = ?').get('dstamper@rapidcompliance.us');
    
    if (adminUser) {
      console.log('✅ Admin user setup successful!');
      console.log('📧 Email: dstamper@rapidcompliance.us');
      console.log('🔑 Password: Idoc74058!23');
      console.log('👑 Role: admin');
      console.log('🆔 User ID:', adminUser.id);
      console.log('✅ Active:', adminUser.isActive ? 'Yes' : 'No');
      console.log('👤 Name: David Stamper');
    } else {
      console.log('❌ Failed to create admin user');
    }
    
    db.close();
    console.log('\n🎉 Admin user setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
  }
}

setupAdminUser();
