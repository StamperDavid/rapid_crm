const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');
const schemaPath = path.join(__dirname, 'ifta_schema.sql');

console.log('🚀 Adding IFTA tables to existing CRM database...');
console.log('📁 Database path:', dbPath);
console.log('📋 Schema file:', schemaPath);

// Check if schema file exists
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Schema file not found:', schemaPath);
  process.exit(1);
}

// Read the schema file
const schema = fs.readFileSync(schemaPath, 'utf8');
console.log('📄 Schema file loaded successfully');

// Parse SQL statements - handle multi-line statements properly
const statements = schema
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
  .map(stmt => stmt.replace(/\s+/g, ' ')); // Normalize whitespace

console.log(`📋 Found ${statements.length} SQL statements to execute`);

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to existing CRM database');
});

// Separate CREATE TABLE and CREATE INDEX statements
const createTableStatements = statements.filter(stmt => 
  stmt.toUpperCase().includes('CREATE TABLE')
);
const createIndexStatements = statements.filter(stmt => 
  stmt.toUpperCase().includes('CREATE INDEX')
);

console.log(`📊 Found ${createTableStatements.length} CREATE TABLE statements`);
console.log(`📊 Found ${createIndexStatements.length} CREATE INDEX statements`);

// Execute CREATE TABLE statements first, then CREATE INDEX statements
const orderedStatements = [...createTableStatements, ...createIndexStatements];

let successCount = 0;
let errorCount = 0;
const errors = [];

// Execute statements sequentially
const executeStatements = async () => {
  for (let i = 0; i < orderedStatements.length; i++) {
    const statement = orderedStatements[i];
    
    try {
      await new Promise((resolve, reject) => {
        db.run(statement, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      successCount++;
      console.log(`✅ Statement ${i + 1} executed successfully`);
    } catch (error) {
      errorCount++;
      errors.push({
        statement: i + 1,
        error: error.message,
        sql: statement.substring(0, 100) + '...'
      });
      console.log(`❌ Error executing statement ${i + 1}: ${error.message}`);
      console.log(`   Statement: ${statement.substring(0, 100)}...`);
    }
  }
  
  // Close database connection
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('🔒 Database connection closed');
    }
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some errors occurred. Please review the output above.');
      console.log('\n🔍 Error Details:');
      errors.forEach(err => {
        console.log(`   Statement ${err.statement}: ${err.error}`);
      });
    } else {
      console.log('\n🎉 All IFTA tables added successfully!');
    }
    
    process.exit(errorCount > 0 ? 1 : 0);
  });
};

// Start execution
executeStatements().catch(error => {
  console.error('💥 Fatal error during execution:', error.message);
  process.exit(1);
});
