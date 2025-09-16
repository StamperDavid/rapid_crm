const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');

console.log('🚀 Initializing Rapid CRM Database (Minimal Version)...');
console.log('📁 Database path:', dbPath);

// Create database connection
const db = new sqlite3.Database(dbPath);

// Create tables one by one with explicit SQL
const tables = [
    {
        name: 'companies',
        sql: `CREATE TABLE IF NOT EXISTS companies (
            id TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )`
    },
    {
        name: 'contacts',
        sql: `CREATE TABLE IF NOT EXISTS contacts (
            id TEXT PRIMARY KEY,
            company_id TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            job_title TEXT,
            department TEXT,
            is_primary_contact INTEGER DEFAULT 0,
            preferred_contact_method TEXT DEFAULT 'Phone',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )`
    },
    {
        name: 'vehicles',
        sql: `CREATE TABLE IF NOT EXISTS vehicles (
            id TEXT PRIMARY KEY,
            company_id TEXT NOT NULL,
            vin TEXT NOT NULL,
            license_plate TEXT NOT NULL,
            make TEXT NOT NULL,
            model TEXT NOT NULL,
            year INTEGER NOT NULL,
            color TEXT,
            vehicle_type TEXT NOT NULL,
            gvwr TEXT NOT NULL,
            fuel_type TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )`
    },
    {
        name: 'drivers',
        sql: `CREATE TABLE IF NOT EXISTS drivers (
            id TEXT PRIMARY KEY,
            company_id TEXT NOT NULL,
            full_name TEXT NOT NULL,
            license_number TEXT NOT NULL,
            license_class TEXT NOT NULL,
            license_expiry TEXT,
            phone TEXT,
            email TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )`
    },
    {
        name: 'deals',
        sql: `CREATE TABLE IF NOT EXISTS deals (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            value REAL,
            stage TEXT NOT NULL,
            probability INTEGER DEFAULT 0,
            expected_close_date TEXT,
            actual_close_date TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )`
    },
    {
        name: 'invoices',
        sql: `CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY,
            invoice_number TEXT NOT NULL,
            client_name TEXT NOT NULL,
            amount REAL NOT NULL,
            status TEXT NOT NULL,
            due_date TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )`
    },
    {
        name: 'tasks',
        sql: `CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL,
            priority TEXT DEFAULT 'Medium',
            due_date TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )`
    },
    {
        name: 'leads',
        sql: `CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            company TEXT,
            status TEXT NOT NULL,
            source TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )`
    },
    {
        name: 'ai_collaboration_messages',
        sql: `CREATE TABLE IF NOT EXISTS ai_collaboration_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT UNIQUE NOT NULL,
            from_ai TEXT NOT NULL,
            to_ai TEXT NOT NULL,
            message_type TEXT NOT NULL,
            content TEXT NOT NULL,
            metadata TEXT,
            status TEXT DEFAULT 'sent',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )`
    }
];

// Create indexes - using actual camelCase column names as created by SQLite
const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(companyId)',
    'CREATE INDEX IF NOT EXISTS idx_contacts_primary ON contacts(isPrimaryContact)',
    'CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(companyId)',
    'CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin)',
    'CREATE INDEX IF NOT EXISTS idx_drivers_company ON drivers(companyId)',
    'CREATE INDEX IF NOT EXISTS idx_drivers_license ON drivers(cdlNumber)',
    'CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)',
    'CREATE INDEX IF NOT EXISTS idx_ai_messages_from_to ON ai_collaboration_messages(from_ai, to_ai)',
    'CREATE INDEX IF NOT EXISTS idx_ai_messages_type ON ai_collaboration_messages(message_type)',
    'CREATE INDEX IF NOT EXISTS idx_ai_messages_created ON ai_collaboration_messages(created_at)'
];

let completed = 0;
let errors = [];

function createTables() {
    if (completed >= tables.length) {
        createIndexes();
        return;
    }

    const table = tables[completed];
    completed++;

    db.run(table.sql, (err) => {
        if (err) {
            console.error(`❌ Error creating table ${table.name}:`, err.message);
            errors.push(`Table ${table.name}: ${err.message}`);
        } else {
            console.log(`✅ Created table: ${table.name}`);
        }
        
        createTables();
    });
}

function createIndexes() {
    let indexCompleted = 0;
    
    function createNextIndex() {
        if (indexCompleted >= indexes.length) {
            finish();
            return;
        }

        const indexSql = indexes[indexCompleted];
        indexCompleted++;

        db.run(indexSql, (err) => {
            if (err) {
                console.error(`❌ Error creating index:`, err.message);
                errors.push(`Index: ${err.message}`);
            } else {
                console.log(`✅ Created index ${indexCompleted}/${indexes.length}`);
            }
            
            createNextIndex();
        });
    }
    
    createNextIndex();
}

function finish() {
    if (errors.length > 0) {
        console.error(`❌ Database initialization completed with ${errors.length} errors`);
        errors.forEach(error => console.error(`   ${error}`));
    } else {
        console.log(`✅ Database initialization completed successfully!`);
        console.log(`📊 Created ${tables.length} tables and ${indexes.length} indexes`);
    }
    
    db.close();
}

// Start the process
createTables();
