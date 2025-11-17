/**
 * Add Onboarding Agent Tables to Database
 * Run this to add onboarding session tracking to existing database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');
const schemaPath = path.join(__dirname, '..', '..', 'src', 'database', 'onboarding_schema.sql');

console.log('🤖 Adding Onboarding Agent Tables...');
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
        console.log('✅ Onboarding agent tables added successfully!');
        console.log('');
        console.log('📋 Tables created:');
        console.log('  - onboarding_sessions');
        console.log('  - onboarding_analytics');
        console.log('  - service_recommendation_log');
        console.log('');
        console.log('🤖 Onboarding agent features:');
        console.log('  ✅ Conversational information collection');
        console.log('  ✅ State qualification analysis');
        console.log('  ✅ Service recommendations');
        console.log('  ✅ Automatic deal creation');
        console.log('  ✅ Payment integration');
        console.log('  ✅ Handoff to customer service');
        console.log('');
        console.log('🔧 API Endpoints:');
        console.log('  POST /api/onboarding/start');
        console.log('  POST /api/onboarding/respond');
        console.log('  GET  /api/onboarding/session/:sessionId');
        console.log('  POST /api/onboarding/analyze');
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









