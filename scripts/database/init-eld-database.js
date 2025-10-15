const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'instance', 'rapid_crm.db');

console.log('🔧 Initializing ELD database tables...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Create ELD tables
const createELDTables = () => {
  return new Promise((resolve, reject) => {
    const tables = [
      `CREATE TABLE IF NOT EXISTS eld_clients (
        id TEXT PRIMARY KEY,
        company_id TEXT,
        company_name TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        service_package TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        start_date TEXT NOT NULL,
        monthly_revenue REAL NOT NULL,
        total_trucks INTEGER NOT NULL,
        compliance_score INTEGER DEFAULT 100,
        last_audit TEXT,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS eld_service_packages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        monthly_price REAL NOT NULL,
        setup_fee REAL NOT NULL,
        max_trucks INTEGER NOT NULL,
        features TEXT,
        compliance_level TEXT DEFAULT 'basic',
        stripe_price_id TEXT,
        stripe_setup_price_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS revenue_data (
        id TEXT PRIMARY KEY,
        month TEXT NOT NULL,
        recurring_revenue REAL NOT NULL,
        setup_fees REAL NOT NULL,
        consulting_fees REAL NOT NULL,
        total_revenue REAL NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS compliance_alerts (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        client_name TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        due_date TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    ];

    let completed = 0;
    tables.forEach((table, index) => {
      db.run(table, (err) => {
        if (err) {
          console.error(`❌ Error creating table ${index + 1}:`, err.message);
          reject(err);
        } else {
          console.log(`✅ Table ${index + 1} created successfully`);
          completed++;
          if (completed === tables.length) {
            resolve();
          }
        }
      });
    });
  });
};

// Insert demo data
const insertDemoData = () => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    
    // Demo service packages
    const packages = [
      {
        id: 'basic',
        name: 'Basic ELD Compliance',
        description: 'Essential ELD tracking and basic compliance monitoring',
        monthly_price: 50,
        setup_fee: 500,
        max_trucks: 10,
        features: JSON.stringify(['HOS Logging', 'Basic DVIR', 'Compliance Alerts', 'Monthly Reports']),
        compliance_level: 'basic',
        stripe_price_id: 'price_basic',
        stripe_setup_price_id: 'price_setup_basic',
        created_at: now,
        updated_at: now
      },
      {
        id: 'standard',
        name: 'Standard ELD Plus',
        description: 'Advanced compliance with audit support',
        monthly_price: 100,
        setup_fee: 1000,
        max_trucks: 50,
        features: JSON.stringify(['All Basic Features', 'Audit Preparation', 'Driver Management', 'Quarterly Reviews']),
        compliance_level: 'standard',
        stripe_price_id: 'price_standard',
        stripe_setup_price_id: 'price_setup_standard',
        created_at: now,
        updated_at: now
      },
      {
        id: 'premium',
        name: 'Premium ELD Enterprise',
        description: 'Full compliance suite with dedicated support',
        monthly_price: 200,
        setup_fee: 2000,
        max_trucks: 200,
        features: JSON.stringify(['All Standard Features', 'Dedicated Account Manager', '24/7 Support', 'Custom Reporting']),
        compliance_level: 'premium',
        stripe_price_id: 'price_premium',
        stripe_setup_price_id: 'price_setup_premium',
        created_at: now,
        updated_at: now
      }
    ];

    // Demo clients
    const clients = [
      {
        id: 'demo_client_1',
        company_name: 'ABC Trucking Co.',
        contact_person: 'John Smith',
        email: 'john@abctrucking.com',
        phone: '(555) 123-4567',
        service_package: 'standard',
        status: 'active',
        start_date: '2024-01-15',
        monthly_revenue: 1000,
        total_trucks: 25,
        compliance_score: 95,
        last_audit: '2024-11-15',
        created_at: now,
        updated_at: now
      },
      {
        id: 'demo_client_2',
        company_name: 'XYZ Logistics',
        contact_person: 'Sarah Johnson',
        email: 'sarah@xyzlogistics.com',
        phone: '(555) 987-6543',
        service_package: 'premium',
        status: 'active',
        start_date: '2024-03-01',
        monthly_revenue: 4000,
        total_trucks: 80,
        compliance_score: 98,
        last_audit: '2024-10-20',
        created_at: now,
        updated_at: now
      },
      {
        id: 'demo_client_3',
        company_name: 'Elite Transport',
        contact_person: 'Mike Davis',
        email: 'mike@elitetransport.com',
        phone: '(555) 456-7890',
        service_package: 'basic',
        status: 'active',
        start_date: '2024-02-10',
        monthly_revenue: 500,
        total_trucks: 45,
        compliance_score: 87,
        last_audit: '2024-12-01',
        created_at: now,
        updated_at: now
      }
    ];

    // Demo revenue data
    const revenue = [
      {
        id: 'revenue_1',
        month: 'Oct 2024',
        recurring_revenue: 15000,
        setup_fees: 5000,
        consulting_fees: 3000,
        total_revenue: 23000,
        created_at: now,
        updated_at: now
      },
      {
        id: 'revenue_2',
        month: 'Nov 2024',
        recurring_revenue: 18000,
        setup_fees: 2000,
        consulting_fees: 2500,
        total_revenue: 22500,
        created_at: now,
        updated_at: now
      },
      {
        id: 'revenue_3',
        month: 'Dec 2024',
        recurring_revenue: 20000,
        setup_fees: 3000,
        consulting_fees: 4000,
        total_revenue: 27000,
        created_at: now,
        updated_at: now
      }
    ];

    // Demo alerts
    const alerts = [
      {
        id: 'alert_1',
        client_id: 'demo_client_1',
        client_name: 'ABC Trucking Co.',
        alert_type: 'audit_required',
        severity: 'high',
        title: 'Annual DOT Audit Due',
        message: 'ABC Trucking Co. annual DOT audit is due within 30 days',
        due_date: '2024-12-15',
        status: 'open',
        created_at: now,
        updated_at: now
      },
      {
        id: 'alert_2',
        client_id: 'demo_client_2',
        client_name: 'XYZ Logistics',
        alert_type: 'service_renewal',
        severity: 'medium',
        title: 'Service Renewal Due',
        message: 'XYZ Logistics service contract expires in 60 days',
        due_date: '2025-01-01',
        status: 'open',
        created_at: now,
        updated_at: now
      }
    ];

    // Insert packages
    packages.forEach((pkg) => {
      db.run(
        `INSERT OR REPLACE INTO eld_service_packages 
         (id, name, description, monthly_price, setup_fee, max_trucks, features, compliance_level, stripe_price_id, stripe_setup_price_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [pkg.id, pkg.name, pkg.description, pkg.monthly_price, pkg.setup_fee, pkg.max_trucks, pkg.features, pkg.compliance_level, pkg.stripe_price_id, pkg.stripe_setup_price_id, pkg.created_at, pkg.updated_at],
        (err) => {
          if (err) console.error('Error inserting package:', err.message);
        }
      );
    });

    // Insert clients
    clients.forEach((client) => {
      db.run(
        `INSERT OR REPLACE INTO eld_clients 
         (id, company_name, contact_person, email, phone, service_package, status, start_date, monthly_revenue, total_trucks, compliance_score, last_audit, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [client.id, client.company_name, client.contact_person, client.email, client.phone, client.service_package, client.status, client.start_date, client.monthly_revenue, client.total_trucks, client.compliance_score, client.last_audit, client.created_at, client.updated_at],
        (err) => {
          if (err) console.error('Error inserting client:', err.message);
        }
      );
    });

    // Insert revenue
    revenue.forEach((rev) => {
      db.run(
        `INSERT OR REPLACE INTO revenue_data 
         (id, month, recurring_revenue, setup_fees, consulting_fees, total_revenue, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [rev.id, rev.month, rev.recurring_revenue, rev.setup_fees, rev.consulting_fees, rev.total_revenue, rev.created_at, rev.updated_at],
        (err) => {
          if (err) console.error('Error inserting revenue:', err.message);
        }
      );
    });

    // Insert alerts
    alerts.forEach((alert) => {
      db.run(
        `INSERT OR REPLACE INTO compliance_alerts 
         (id, client_id, client_name, alert_type, severity, title, message, due_date, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [alert.id, alert.client_id, alert.client_name, alert.alert_type, alert.severity, alert.title, alert.message, alert.due_date, alert.status, alert.created_at, alert.updated_at],
        (err) => {
          if (err) console.error('Error inserting alert:', err.message);
        }
      );
    });

    console.log('✅ Demo data inserted successfully');
    resolve();
  });
};

// Main execution
async function initializeELDDatabase() {
  try {
    await createELDTables();
    await insertDemoData();
    
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('🎉 ELD database initialization complete!');
      }
    });
  } catch (error) {
    console.error('❌ Error initializing ELD database:', error);
    db.close();
    process.exit(1);
  }
}

initializeELDDatabase();
