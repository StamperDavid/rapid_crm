const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path - same as existing rapid_crm.db
const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');

// ELD migration file path
const eldMigrationPath = path.join(__dirname, '..', 'services', 'database', 'migrations', '001_create_eld_service_tables.sql');

console.log('🚀 Adding ELD Service Tables to Rapid CRM Database...');
console.log('📁 Database path:', dbPath);
console.log('📄 ELD Migration path:', eldMigrationPath);

// Check if database exists
if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found. Please run the main database initialization first.');
    process.exit(1);
}

// Check if ELD migration file exists
if (!fs.existsSync(eldMigrationPath)) {
    console.error('❌ ELD migration file not found:', eldMigrationPath);
    process.exit(1);
}

// Create database connection
const db = new sqlite3.Database(dbPath);

// Function to execute SQL file
function executeELDMigration() {
    return new Promise((resolve, reject) => {
        console.log('📄 Reading ELD migration file...');
        
        fs.readFile(eldMigrationPath, 'utf8', (err, data) => {
            if (err) {
                console.error('❌ Error reading ELD migration file:', err);
                reject(err);
                return;
            }

            // Remove comments and normalize whitespace, then split by semicolon
            const cleanData = data
                .split('\n')
                .map(line => {
                    // Remove comments (everything after -- on a line)
                    const commentIndex = line.indexOf('--');
                    if (commentIndex !== -1) {
                        line = line.substring(0, commentIndex);
                    }
                    return line.trim();
                })
                .filter(line => line.length > 0) // Remove empty lines
                .join(' '); // Join all lines with spaces
            
            // Split by semicolon and filter out empty statements
            const statements = cleanData
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);

            let completed = 0;
            let errors = [];

            if (statements.length === 0) {
                console.log('✅ ELD migration completed (no statements)');
                resolve();
                return;
            }

            console.log(`📊 Found ${statements.length} SQL statements to execute`);

            // Execute statements sequentially to ensure proper order
            let currentIndex = 0;
            
            function executeNext() {
                if (currentIndex >= statements.length) {
                    if (errors.length > 0) {
                        console.error(`❌ ELD migration completed with ${errors.length} errors`);
                        reject(new Error(`ELD migration failed with ${errors.length} errors`));
                    } else {
                        console.log('✅ ELD migration completed successfully');
                        resolve();
                    }
                    return;
                }
                
                const statement = statements[currentIndex];
                const index = currentIndex;
                currentIndex++;
                
                db.run(statement, (err) => {
                    if (err) {
                        console.error(`❌ Error in statement ${index + 1}:`, err.message);
                        console.error(`   Statement: ${statement.substring(0, 100)}...`);
                        errors.push({ statement: index + 1, error: err.message, sql: statement });
                    } else {
                        console.log(`✅ Statement ${index + 1} executed successfully`);
                    }
                    
                    // Continue with next statement
                    executeNext();
                });
            }
            
            // Start executing statements
            executeNext();
        });
    });
}

// Function to verify ELD tables were created
function verifyELDTables() {
    return new Promise((resolve, reject) => {
        const expectedTables = [
            'eld_service_subscriptions',
            'eld_devices',
            'eld_driver_logs',
            'eld_violations',
            'eld_service_billing',
            'eld_compliance_reports',
            'eld_service_analytics'
        ];

        let verifiedTables = 0;
        let missingTables = [];

        function checkNextTable() {
            if (verifiedTables >= expectedTables.length) {
                if (missingTables.length > 0) {
                    console.error('❌ Missing ELD tables:', missingTables.join(', '));
                    reject(new Error(`Missing ELD tables: ${missingTables.join(', ')}`));
                } else {
                    console.log('✅ All ELD tables verified successfully');
                    resolve();
                }
                return;
            }

            const tableName = expectedTables[verifiedTables];
            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
                if (err) {
                    console.error(`❌ Error checking table ${tableName}:`, err.message);
                    missingTables.push(tableName);
                } else if (row) {
                    console.log(`✅ Table ${tableName} exists`);
                } else {
                    console.error(`❌ Table ${tableName} not found`);
                    missingTables.push(tableName);
                }
                
                verifiedTables++;
                checkNextTable();
            });
        }

        checkNextTable();
    });
}

// Run ELD migration
async function runELDMigration() {
    try {
        // Execute ELD migration
        await executeELDMigration();
        
        // Verify tables were created
        await verifyELDTables();
        
        console.log('🎉 ELD Service Tables added successfully to rapid_crm.db!');
        console.log('📊 ELD tables now available:');
        console.log('   • eld_service_subscriptions - Client ELD service subscriptions');
        console.log('   • eld_devices - ELD devices assigned to clients');
        console.log('   • eld_driver_logs - Driver hours of service logs');
        console.log('   • eld_violations - ELD violations and alerts');
        console.log('   • eld_service_billing - ELD service billing and usage');
        console.log('   • eld_compliance_reports - ELD compliance reports');
        console.log('   • eld_service_analytics - ELD service analytics');
        
    } catch (error) {
        console.error('💥 ELD migration failed:', error.message);
        process.exit(1);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err.message);
            } else {
                console.log('🔒 Database connection closed');
            }
        });
    }
}

// Run migration
runELDMigration();
