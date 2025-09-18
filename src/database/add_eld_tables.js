/**
 * Add ELD Tables to Existing rapid_crm.db
 * This script extends the existing CRM database with ELD compliance functionality
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Path to the existing CRM database
const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');

console.log('🚀 Adding ELD tables to existing CRM database...');
console.log('📁 Database path:', dbPath);

// Check if database exists
if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found at:', dbPath);
    console.log('💡 Please run the main database initialization first: npm run init-db');
    process.exit(1);
}

// Read the ELD schema
const schemaPath = path.join(__dirname, 'eld_schema.sql');
if (!fs.existsSync(schemaPath)) {
    console.error('❌ ELD schema file not found at:', schemaPath);
    process.exit(1);
}

const schema = fs.readFileSync(schemaPath, 'utf8');

// Open database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to existing CRM database');
});

// Split schema into individual statements
const statements = schema
    .split(';')
    .map(stmt => {
        // Remove comments (everything after -- on any line)
        return stmt
            .split('\n')
            .map(line => {
                const commentIndex = line.indexOf('--');
                if (commentIndex !== -1) {
                    line = line.substring(0, commentIndex);
                }
                return line.trim();
            })
            .filter(line => line.length > 0)
            .join(' ');
    })
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

// Separate CREATE TABLE and CREATE INDEX statements
const createTableStatements = statements.filter(stmt => 
    stmt.toUpperCase().startsWith('CREATE TABLE')
);
const createIndexStatements = statements.filter(stmt => 
    stmt.toUpperCase().startsWith('CREATE INDEX')
);

// Execute CREATE TABLE statements first, then CREATE INDEX statements
const orderedStatements = [...createTableStatements, ...createIndexStatements];

console.log(`📋 Found ${orderedStatements.length} SQL statements to execute`);
console.log(`   • ${createTableStatements.length} CREATE TABLE statements`);
console.log(`   • ${createIndexStatements.length} CREATE INDEX statements`);

// Execute each statement
let completed = 0;
let errors = 0;

orderedStatements.forEach((statement, index) => {
    if (statement.trim()) {
        db.run(statement, (err) => {
            completed++;
            
            if (err) {
                errors++;
                console.error(`❌ Error executing statement ${index + 1}:`, err.message);
                console.error(`   Statement: ${statement.substring(0, 100)}...`);
            } else {
                console.log(`✅ Statement ${index + 1} executed successfully`);
            }
            
            // Check if all statements are complete
            if (completed === orderedStatements.length) {
                console.log('\n📊 Summary:');
                console.log(`   ✅ Successful: ${completed - errors}`);
                console.log(`   ❌ Errors: ${errors}`);
                
                if (errors === 0) {
                    console.log('\n🎉 All ELD tables added successfully!');
                    console.log('📋 Added tables:');
                    console.log('   • eld_hos_logs (Hours of Service)');
                    console.log('   • eld_dvir_reports (Driver Vehicle Inspection Reports)');
                    console.log('   • eld_alerts (ELD Alerts and Notifications)');
                    console.log('   • compliance_services (Compliance Service Packages)');
                    console.log('   • driver_qualification_files (Driver Qualification Files)');
                    console.log('   • drug_alcohol_tests (Drug & Alcohol Testing)');
                    console.log('   • fmcsa_clearinghouse_records (FMCSA Clearinghouse)');
                    console.log('   • dot_physicals (DOT Physical Examinations)');
                    console.log('   • usdot_registrations (USDOT Number Management)');
                    console.log('   • mc_registrations (MC Number & BOC-3)');
                    console.log('   • ifta_registrations (IFTA Registration)');
                    console.log('   • ifta_quarterly_filings (IFTA Quarterly Filings)');
                    console.log('   • irp_registrations (IRP Registration)');
                    console.log('   • irs2290_filings (IRS 2290 / Heavy Vehicle Use Tax)');
                    console.log('   • compliance_alerts (Compliance Alerts)');
                    console.log('   • compliance_violations (Compliance Violations)');
                    console.log('   • geotab_devices (Geotab Device Configuration)');
                    console.log('   • geotab_credentials (Geotab API Credentials)');
                    console.log('\n🚀 ELD compliance system is now ready!');
                } else {
                    console.log('\n⚠️  Some errors occurred. Please review the output above.');
                }
                
                // Close database connection
                db.close((err) => {
                    if (err) {
                        console.error('❌ Error closing database:', err.message);
                    } else {
                        console.log('🔒 Database connection closed');
                    }
                    process.exit(errors > 0 ? 1 : 0);
                });
            }
        });
    }
});