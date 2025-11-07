/**
 * Add Payment Tables to Database
 * Run this to add payment processing tables to existing database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');
const schemaPath = path.join(__dirname, '..', '..', 'src', 'database', 'payment_schema.sql');

console.log('💳 Adding Payment Tables...');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
});

// Read schema file
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split into individual statements
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

let completed = 0;
let errors = [];

// Execute each statement
statements.forEach((statement, index) => {
  db.run(statement, function(err) {
    completed++;
    
    if (err) {
      // Ignore "table already exists" errors
      if (!err.message.includes('already exists')) {
        console.error(`❌ Error in statement ${index + 1}:`, err.message);
        errors.push({ statement: index + 1, error: err.message });
      }
    }
    
    // Check if all statements completed
    if (completed === statements.length) {
      if (errors.length === 0) {
        console.log('✅ Payment tables added successfully!');
        console.log('');
        console.log('📋 Tables created:');
        console.log('  - payment_providers');
        console.log('  - payment_transactions');
        console.log('  - payment_refunds');
        console.log('  - payment_webhooks');
        console.log('  - system_settings (if not exists)');
        console.log('');
        console.log('💳 Payment providers supported:');
        console.log('  - Stripe');
        console.log('  - PayPal');
        console.log('  - Square (can be added later)');
        console.log('');
        console.log('🔧 Next steps:');
        console.log('  1. Set environment variables for your payment provider');
        console.log('  2. Restart server: npm run dev:full');
        console.log('  3. Test at: POST /api/payments/providers');
        console.log('');
      } else {
        console.error(`❌ Completed with ${errors.length} errors`);
        errors.forEach(e => console.error(`   Statement ${e.statement}: ${e.error}`));
      }
      
      db.close();
      process.exit(errors.length > 0 ? 1 : 0);
    }
  });
});






