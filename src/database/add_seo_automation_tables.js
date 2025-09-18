const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('🚀 Adding SEO Automation tables to existing CRM database...');

const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to existing CRM database');
});

// Read the SQL schema file
const schemaPath = path.join(__dirname, 'seo_automation_schema.sql');
const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

// Split SQL into individual statements
const statements = schemaSQL
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

console.log(`📋 Found ${statements.length} SQL statements to execute`);

// Separate CREATE TABLE and CREATE INDEX statements
const createTableStatements = statements.filter(stmt => stmt.startsWith('CREATE TABLE'));
const createIndexStatements = statements.filter(stmt => stmt.startsWith('CREATE INDEX'));

console.log(`📊 Tables to create: ${createTableStatements.length}`);
console.log(`📊 Indexes to create: ${createIndexStatements.length}`);

// Execute CREATE TABLE statements first
let completedTables = 0;
createTableStatements.forEach((sql, index) => {
  db.run(sql, (err) => {
    if (err) {
      console.error(`❌ Error creating table ${index + 1}:`, err.message);
    } else {
      completedTables++;
      console.log(`✅ Created SEO table ${completedTables}/${createTableStatements.length}`);
    }
    
    if (completedTables === createTableStatements.length) {
      // All tables created, now create indexes
      let completedIndexes = 0;
      createIndexStatements.forEach((sql, index) => {
        db.run(sql, (err) => {
          if (err) {
            console.error(`❌ Error creating index ${index + 1}:`, err.message);
          } else {
            completedIndexes++;
            console.log(`✅ Created SEO index ${completedIndexes}/${createIndexStatements.length}`);
          }
          
          if (completedIndexes === createIndexStatements.length) {
            console.log('🎉 SEO Automation tables and indexes created successfully!');
            
            // Insert default competitors for transportation industry
            insertDefaultCompetitors();
          }
        });
      });
    }
  });
});

function insertDefaultCompetitors() {
  const defaultCompetitors = [
    {
      domain: 'geotab.com',
      company_name: 'Geotab',
      industry: 'transportation',
      target_keywords: JSON.stringify(['fleet management', 'gps tracking', 'vehicle telematics', 'ELD compliance'])
    },
    {
      domain: 'samsara.com',
      company_name: 'Samsara',
      industry: 'transportation',
      target_keywords: JSON.stringify(['fleet management', 'iot sensors', 'vehicle tracking', 'safety management'])
    },
    {
      domain: 'eldmandate.com',
      company_name: 'ELD Mandate',
      industry: 'transportation',
      target_keywords: JSON.stringify(['ELD compliance', 'hours of service', 'DOT compliance', 'electronic logging'])
    },
    {
      domain: 'keepruckin.com',
      company_name: 'KeepTruckin',
      industry: 'transportation',
      target_keywords: JSON.stringify(['ELD device', 'fleet management', 'driver app', 'compliance'])
    },
    {
      domain: 'verizonconnect.com',
      company_name: 'Verizon Connect',
      industry: 'transportation',
      target_keywords: JSON.stringify(['fleet tracking', 'GPS navigation', 'vehicle management', 'telematics'])
    }
  ];

  let insertedCount = 0;
  defaultCompetitors.forEach((competitor, index) => {
    db.run(
      `INSERT OR IGNORE INTO seo_competitors (domain, company_name, industry, target_keywords) VALUES (?, ?, ?, ?)`,
      [competitor.domain, competitor.company_name, competitor.industry, competitor.target_keywords],
      (err) => {
        if (err) {
          console.error(`❌ Error inserting competitor ${index + 1}:`, err.message);
        } else {
          insertedCount++;
          console.log(`✅ Inserted competitor ${insertedCount}/${defaultCompetitors.length}: ${competitor.company_name}`);
        }
        
        if (insertedCount === defaultCompetitors.length) {
          // Insert default SEO automation settings
          insertDefaultSettings();
        }
      }
    );
  });
}

function insertDefaultSettings() {
  const defaultSettings = [
    {
      setting_name: 'monitoring_frequency',
      setting_value: 'daily',
      description: 'How often to monitor competitors (daily, weekly, monthly)'
    },
    {
      setting_name: 'auto_approve_low_impact',
      setting_value: 'false',
      description: 'Automatically approve low-impact SEO changes'
    },
    {
      setting_name: 'content_generation_enabled',
      setting_value: 'true',
      description: 'Enable automated content generation'
    },
    {
      setting_name: 'social_media_monitoring',
      setting_value: 'true',
      description: 'Monitor competitor social media SEO'
    },
    {
      setting_name: 'max_competitors',
      setting_value: '10',
      description: 'Maximum number of competitors to monitor'
    }
  ];

  let settingsCount = 0;
  defaultSettings.forEach((setting, index) => {
    db.run(
      `INSERT OR IGNORE INTO seo_automation_settings (setting_name, setting_value, description) VALUES (?, ?, ?)`,
      [setting.setting_name, setting.setting_value, setting.description],
      (err) => {
        if (err) {
          console.error(`❌ Error inserting setting ${index + 1}:`, err.message);
        } else {
          settingsCount++;
          console.log(`✅ Inserted setting ${settingsCount}/${defaultSettings.length}: ${setting.setting_name}`);
        }
        
        if (settingsCount === defaultSettings.length) {
          console.log('🎉 SEO Automation system initialized successfully!');
          console.log('📊 Default competitors and settings added');
          db.close();
        }
      }
    );
  });
}
