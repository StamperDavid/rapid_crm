/**
 * Add Workflow Automation Tables to Database
 * Run this to add workflow queue and automation to existing database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');
const schemaPath = path.join(__dirname, '..', '..', 'src', 'database', 'workflow_schema.sql');

console.log('⚙️  Adding Workflow Automation Tables...');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
});

// Read schema file
const schema = fs.readFileSync(schemaPath, 'utf8');

// Remove comment lines, then split into individual statements
const cleanedSchema = schema
  .split('\n')
  .filter(line => !line.trim().startsWith('--'))
  .join('\n');

// Split into individual statements
const statements = cleanedSchema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

let completed = 0;
let errors = [];

// Execute statements serially to maintain order
let currentIndex = 0;

function executeNext() {
  if (currentIndex >= statements.length) {
    // All done
    if (errors.length === 0) {
      console.log('✅ Workflow automation tables added successfully!');
      console.log('');
      console.log('📋 Tables created:');
      console.log('  - workflow_queue');
      console.log('  - workflow_execution_log');
      console.log('  - workflow_templates');
      console.log('  - workflow_triggers');
      console.log('');
      console.log('🤖 Workflow automation features:');
      console.log('  ✅ Event-driven workflow triggers');
      console.log('  ✅ Priority queue system');
      console.log('  ✅ Automatic RPA agent dispatch');
      console.log('  ✅ Retry logic with exponential backoff');
      console.log('  ✅ Human intervention detection');
      console.log('  ✅ Execution logging and audit trail');
      console.log('');
      console.log('🎯 Pre-configured workflows:');
      console.log('  - USDOT Filing (triggered by payment)');
      console.log('  - MC Number Filing (triggered by payment)');
      console.log('  - Renewal Reminders (scheduled)');
      console.log('');
      console.log('🔧 Next steps:');
      console.log('  1. Restart server: npm run dev:full');
      console.log('  2. Workflow dispatcher will auto-start');
      console.log('  3. Make a payment → workflows trigger automatically!');
      console.log('');
    } else {
      console.error(`❌ Completed with ${errors.length} errors`);
      errors.forEach(e => console.error(`   Statement ${e.statement}: ${e.error}`));
    }
    
    db.close();
    process.exit(errors.length > 0 ? 1 : 0);
    return;
  }
  
  const statement = statements[currentIndex];
  const statementNum = currentIndex + 1;
  
  db.run(statement, function(err) {
    if (err) {
      // Ignore "table already exists" errors
      if (!err.message.includes('already exists')) {
        console.error(`❌ Error in statement ${statementNum}:`, err.message);
        errors.push({ statement: statementNum, error: err.message });
      }
    }
    
    currentIndex++;
    executeNext(); // Execute next statement
  });
}

// Start execution
executeNext();



