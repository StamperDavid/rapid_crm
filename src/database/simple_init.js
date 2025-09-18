const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');

// Ensure the instance directory exists
const instanceDir = path.dirname(dbPath);
if (!fs.existsSync(instanceDir)) {
    fs.mkdirSync(instanceDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath);

console.log('🚀 Initializing Rapid CRM Database (Simple Version)...');
console.log('📁 Database path:', dbPath);

// Read and execute simple schema
const schemaPath = path.join(__dirname, 'simple_schema.sql');

fs.readFile(schemaPath, 'utf8', (err, data) => {
    if (err) {
        console.error('❌ Error reading schema file:', err);
        process.exit(1);
    }

    // Split by semicolon and execute each statement
    const statements = data
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let completed = 0;
    let errors = [];

    function executeNext() {
        if (completed >= statements.length) {
            if (errors.length > 0) {
                console.error(`❌ Database initialization completed with ${errors.length} errors`);
                errors.forEach(error => console.error(`   ${error}`));
                process.exit(1);
            } else {
                console.log(`✅ Database initialization completed successfully!`);
                console.log(`📊 Created ${statements.length} database objects`);
                db.close();
            }
            return;
        }

        const statement = statements[completed];
        completed++;

        db.run(statement, (err) => {
            if (err) {
                console.error(`❌ Error in statement ${completed}:`, err.message);
                console.error(`   Statement: ${statement.substring(0, 100)}...`);
                errors.push(`Statement ${completed}: ${err.message}`);
            } else {
                console.log(`✅ Executed statement ${completed}/${statements.length}`);
            }
            
            executeNext();
        });
    }

    executeNext();
});






