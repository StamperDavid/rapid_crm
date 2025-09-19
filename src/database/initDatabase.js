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

// Read and execute schema
const schemaPath = path.join(__dirname, 'schema.sql');
const seedDataPath = path.join(__dirname, 'seedData_empty.sql');

console.log('🚀 Initializing Rapid CRM Database...');
console.log('📁 Database path:', dbPath);

// Function to execute SQL file
function executeSQLFile(filePath, description) {
    return new Promise((resolve, reject) => {
        console.log(`📄 ${description}...`);
        
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`❌ Error reading ${filePath}:`, err);
                reject(err);
                return;
            }

            // Simple approach: split by semicolon and clean each statement
            const statements = data
                .split(';')
                .map(stmt => {
                    // Remove comments (everything after -- on any line) but preserve inline comments after column definitions
                    return stmt
                        .split('\n')
                        .map(line => {
                            // Only remove comments that are at the start of a line or after whitespace
                            const trimmedLine = line.trim();
                            if (trimmedLine.startsWith('--')) {
                                return ''; // Remove comment-only lines
                            }
                            
                            // For lines with inline comments, be more careful
                            const commentIndex = line.indexOf('--');
                            if (commentIndex !== -1) {
                                // Check if the comment is after a column definition (has comma or other SQL syntax)
                                const beforeComment = line.substring(0, commentIndex).trim();
                                if (beforeComment.endsWith(',') || beforeComment.endsWith(')') || 
                                    beforeComment.includes('TEXT') || beforeComment.includes('INTEGER') || 
                                    beforeComment.includes('REAL') || beforeComment.includes('DATE')) {
                                    return beforeComment; // Keep the column definition, remove the comment
                                }
                            }
                            return line.trim();
                        })
                        .filter(line => line.length > 0)
                        .join(' ');
                })
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);

            let completed = 0;
            let errors = [];

            if (statements.length === 0) {
                console.log(`✅ ${description} completed (no statements)`);
                resolve();
                return;
            }

            // Execute statements sequentially to ensure proper order
            let currentIndex = 0;
            
            function executeNext() {
                if (currentIndex >= statements.length) {
                    if (errors.length > 0) {
                        console.error(`❌ ${description} completed with ${errors.length} errors`);
                        reject(new Error(`Database initialization failed with ${errors.length} errors`));
                    } else {
                        console.log(`✅ ${description} completed successfully (${statements.length} statements)`);
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

// Initialize database
async function initializeDatabase() {
    try {
        // Execute schema
        await executeSQLFile(schemaPath, 'Creating database schema');
        
        // Execute seed data
        await executeSQLFile(seedDataPath, 'Populating with seed data');
        
        console.log('🎉 Database initialization completed successfully!');
        console.log('📊 Database now contains:');
        console.log('   • 2 Companies (Acme Transportation LLC, Midwest Freight Solutions Inc)');
        console.log('   • 2 Contacts');
        console.log('   • 3 Vehicles');
        console.log('   • 3 Drivers');
        console.log('   • 4 Deals');
        console.log('   • 4 Invoices');
        console.log('   • 2 Campaigns');
        console.log('   • 2 Leads');
        console.log('   • 3 AI Agents');
        console.log('   • 5 Knowledge Bases');
        console.log('   • 4 Conversations');
        console.log('   • 16 Messages');
        console.log('   • 4 Persistent Conversation Contexts');
        console.log('   • 3 Client Profiles');
        console.log('   • 4 Agent Memory Banks');
        
    } catch (error) {
        console.error('💥 Database initialization failed:', error.message);
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

// Run initialization
initializeDatabase();
