/**
 * Create Test Client User for Portal Login Testing
 * This script creates a test client user that can login to the client portal
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');

console.log('🔧 Creating Test Client User...');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
  
  await createTestClient();
});

async function createTestClient() {
  try {
    // Check if we have any companies
    db.get('SELECT id, legal_business_name FROM companies LIMIT 1', async (err, company) => {
      if (err) {
        console.error('❌ Database error:', err);
        db.close();
        process.exit(1);
      }
      
      if (!company) {
        console.error('❌ No companies found in database!');
        console.log('   Please create a company first before creating client users.');
        db.close();
        process.exit(1);
      }
      
      console.log(`✅ Using company: ${company.legal_business_name} (ID: ${company.id})`);
      
      // Hash password
      const password = 'test123';
      const passwordHash = await bcrypt.hash(password, 10);
      const userId = `client_${Date.now()}_test`;
      const now = new Date().toISOString();
      
      // Create test client user
      db.run(
        `INSERT INTO client_users (
          id, company_id, email, password_hash,
          first_name, last_name, phone, role, is_active, email_verified,
          can_view_services, can_view_invoices, can_make_payments,
          can_submit_requests, can_view_documents,
          failed_login_attempts, created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          company.id,
          'test@client.com',
          passwordHash,
          'Test',
          'Client',
          '555-0100',
          'client',
          1,  // is_active
          1,  // email_verified
          1,  // can_view_services
          1,  // can_view_invoices
          1,  // can_make_payments
          1,  // can_submit_requests
          1,  // can_view_documents
          0,  // failed_login_attempts
          now,
          now,
          'system'
        ],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              console.log('⚠️  Test client user already exists (test@client.com)');
            } else {
              console.error('❌ Error creating test client:', err);
            }
          } else {
            console.log('✅ Test client user created successfully!');
            console.log('');
            console.log('📋 Login Credentials:');
            console.log('   Email:    test@client.com');
            console.log('   Password: test123');
            console.log('');
            console.log('🌐 Test the login at:');
            console.log('   http://localhost:5173/client-login');
            console.log('   (or your configured frontend URL)');
            console.log('');
          }
          
          db.close();
          process.exit(0);
        }
      );
    });
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
  }
}






