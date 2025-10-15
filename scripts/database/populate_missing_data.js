const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'instance', 'rapid_crm.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Populating missing data...');

// Insert sample leads
const leads = [
  {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    company: 'ABC Trucking',
    lead_source: 'Website',
    lead_status: 'New',
    lead_score: 85,
    business_type: 'Carrier',
    fleet_size: 15,
    preferred_contact_method: 'Phone',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    company: 'XYZ Logistics',
    lead_source: 'Referral',
    lead_status: 'Qualified',
    lead_score: 92,
    business_type: 'Broker',
    fleet_size: 8,
    preferred_contact_method: 'Email',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Insert sample API keys
const apiKeys = [
  {
    name: 'OpenAI API',
    service: 'openai',
    encrypted_key: 'encrypted_key_here',
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: 'Google Maps API',
    service: 'google_maps',
    encrypted_key: 'encrypted_key_here',
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Insert leads
leads.forEach(lead => {
  const sql = `INSERT INTO leads (first_name, last_name, email, phone, company, lead_source, lead_status, lead_score, business_type, fleet_size, preferred_contact_method, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [
    lead.first_name, lead.last_name, lead.email, lead.phone, lead.company,
    lead.lead_source, lead.lead_status, lead.lead_score, lead.business_type,
    lead.fleet_size, lead.preferred_contact_method, lead.created_at, lead.updated_at
  ], function(err) {
    if (err) console.error('Error inserting lead:', err);
    else console.log('✅ Inserted lead:', lead.first_name, lead.last_name);
  });
});

// Insert API keys
apiKeys.forEach(apiKey => {
  const sql = `INSERT INTO api_keys (name, service, encrypted_key, is_active, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [
    apiKey.name, apiKey.service, apiKey.encrypted_key, apiKey.is_active,
    apiKey.created_at, apiKey.updated_at
  ], function(err) {
    if (err) console.error('Error inserting API key:', err);
    else console.log('✅ Inserted API key:', apiKey.name);
  });
});

// Check final counts
setTimeout(() => {
  db.all('SELECT COUNT(*) as count FROM leads', (err, result) => {
    if (!err) console.log('📊 Total leads:', result[0].count);
  });
  
  db.all('SELECT COUNT(*) as count FROM api_keys', (err, result) => {
    if (!err) console.log('📊 Total API keys:', result[0].count);
    db.close();
  });
}, 1000);
