const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🚀 Creating SEO Automation tables directly...');

const dbPath = path.join(__dirname, '..', '..', 'instance', 'rapid_crm.db');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to existing CRM database');
});

// Create tables directly
const tables = [
  // SEO Competitors table
  `CREATE TABLE IF NOT EXISTS seo_competitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    industry TEXT DEFAULT 'transportation',
    target_keywords TEXT,
    monitoring_enabled BOOLEAN DEFAULT 1,
    last_analyzed DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // SEO Metrics table
  `CREATE TABLE IF NOT EXISTS seo_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor_id INTEGER,
    metric_type TEXT NOT NULL,
    value REAL,
    date_recorded DATETIME DEFAULT CURRENT_TIMESTAMP,
    source TEXT,
    FOREIGN KEY (competitor_id) REFERENCES seo_competitors(id)
  )`,

  // Keyword Rankings table
  `CREATE TABLE IF NOT EXISTS keyword_rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor_id INTEGER,
    keyword TEXT NOT NULL,
    position INTEGER,
    search_volume INTEGER,
    difficulty_score REAL,
    cpc REAL,
    date_recorded DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competitor_id) REFERENCES seo_competitors(id)
  )`,

  // Content Opportunities table
  `CREATE TABLE IF NOT EXISTS content_opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL,
    competitor_ranking INTEGER,
    our_ranking INTEGER,
    opportunity_score REAL,
    content_suggestion TEXT,
    content_type TEXT,
    priority TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // SEO Recommendations table
  `CREATE TABLE IF NOT EXISTS seo_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    impact_score REAL,
    effort_level TEXT,
    priority TEXT,
    status TEXT DEFAULT 'pending',
    implementation_details TEXT,
    approved_by INTEGER,
    approved_at DATETIME,
    implemented_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // Content Generation Queue table
  `CREATE TABLE IF NOT EXISTS content_generation_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_opportunity_id INTEGER,
    content_type TEXT NOT NULL,
    topic TEXT NOT NULL,
    target_keywords TEXT,
    content_brief TEXT,
    generated_content TEXT,
    status TEXT DEFAULT 'pending',
    assigned_to INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_opportunity_id) REFERENCES content_opportunities(id)
  )`,

  // Social Media SEO Metrics table
  `CREATE TABLE IF NOT EXISTS social_seo_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    competitor_id INTEGER,
    followers_count INTEGER,
    engagement_rate REAL,
    post_frequency INTEGER,
    top_hashtags TEXT,
    content_themes TEXT,
    date_recorded DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competitor_id) REFERENCES seo_competitors(id)
  )`,

  // SEO Automation Settings table
  `CREATE TABLE IF NOT EXISTS seo_automation_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_name TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // SEO Change Log table
  `CREATE TABLE IF NOT EXISTS seo_change_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recommendation_id INTEGER,
    change_type TEXT NOT NULL,
    change_description TEXT,
    before_value TEXT,
    after_value TEXT,
    implemented_by INTEGER,
    implemented_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES seo_recommendations(id)
  )`
];

// Create indexes
const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_seo_competitors_domain ON seo_competitors(domain)',
  'CREATE INDEX IF NOT EXISTS idx_seo_competitors_monitoring ON seo_competitors(monitoring_enabled)',
  'CREATE INDEX IF NOT EXISTS idx_seo_metrics_competitor ON seo_metrics(competitor_id)',
  'CREATE INDEX IF NOT EXISTS idx_seo_metrics_date ON seo_metrics(date_recorded)',
  'CREATE INDEX IF NOT EXISTS idx_keyword_rankings_competitor ON keyword_rankings(competitor_id)',
  'CREATE INDEX IF NOT EXISTS idx_keyword_rankings_keyword ON keyword_rankings(keyword)',
  'CREATE INDEX IF NOT EXISTS idx_content_opportunities_status ON content_opportunities(status)',
  'CREATE INDEX IF NOT EXISTS idx_content_opportunities_priority ON content_opportunities(priority)',
  'CREATE INDEX IF NOT EXISTS idx_seo_recommendations_status ON seo_recommendations(status)',
  'CREATE INDEX IF NOT EXISTS idx_seo_recommendations_priority ON seo_recommendations(priority)',
  'CREATE INDEX IF NOT EXISTS idx_content_generation_status ON content_generation_queue(status)',
  'CREATE INDEX IF NOT EXISTS idx_social_seo_platform ON social_seo_metrics(platform)',
  'CREATE INDEX IF NOT EXISTS idx_social_seo_competitor ON social_seo_metrics(competitor_id)'
];

// Execute table creation
let completedTables = 0;
tables.forEach((sql, index) => {
  db.run(sql, (err) => {
    if (err) {
      console.error(`❌ Error creating table ${index + 1}:`, err.message);
    } else {
      completedTables++;
      console.log(`✅ Created SEO table ${completedTables}/${tables.length}`);
    }
    
    if (completedTables === tables.length) {
      // All tables created, now create indexes
      let completedIndexes = 0;
      indexes.forEach((sql, index) => {
        db.run(sql, (err) => {
          if (err) {
            console.error(`❌ Error creating index ${index + 1}:`, err.message);
          } else {
            completedIndexes++;
            console.log(`✅ Created SEO index ${completedIndexes}/${indexes.length}`);
          }
          
          if (completedIndexes === indexes.length) {
            console.log('🎉 SEO Automation tables and indexes created successfully!');
            
            // Insert default data
            insertDefaultData();
          }
        });
      });
    }
  });
});

function insertDefaultData() {
  // Insert default competitors
  const defaultCompetitors = [
    ['geotab.com', 'Geotab', 'transportation', JSON.stringify(['fleet management', 'gps tracking', 'vehicle telematics', 'ELD compliance'])],
    ['samsara.com', 'Samsara', 'transportation', JSON.stringify(['fleet management', 'iot sensors', 'vehicle tracking', 'safety management'])],
    ['eldmandate.com', 'ELD Mandate', 'transportation', JSON.stringify(['ELD compliance', 'hours of service', 'DOT compliance', 'electronic logging'])],
    ['keepruckin.com', 'KeepTruckin', 'transportation', JSON.stringify(['ELD device', 'fleet management', 'driver app', 'compliance'])],
    ['verizonconnect.com', 'Verizon Connect', 'transportation', JSON.stringify(['fleet tracking', 'GPS navigation', 'vehicle management', 'telematics'])]
  ];

  let competitorCount = 0;
  defaultCompetitors.forEach((competitor, index) => {
    db.run(
      `INSERT OR IGNORE INTO seo_competitors (domain, company_name, industry, target_keywords) VALUES (?, ?, ?, ?)`,
      competitor,
      (err) => {
        if (err) {
          console.error(`❌ Error inserting competitor ${index + 1}:`, err.message);
        } else {
          competitorCount++;
          console.log(`✅ Inserted competitor ${competitorCount}/${defaultCompetitors.length}: ${competitor[1]}`);
        }
        
        if (competitorCount === defaultCompetitors.length) {
          insertDefaultSettings();
        }
      }
    );
  });
}

function insertDefaultSettings() {
  const defaultSettings = [
    ['monitoring_frequency', 'daily', 'How often to monitor competitors (daily, weekly, monthly)'],
    ['auto_approve_low_impact', 'false', 'Automatically approve low-impact SEO changes'],
    ['content_generation_enabled', 'true', 'Enable automated content generation'],
    ['social_media_monitoring', 'true', 'Monitor competitor social media SEO'],
    ['max_competitors', '10', 'Maximum number of competitors to monitor']
  ];

  let settingsCount = 0;
  defaultSettings.forEach((setting, index) => {
    db.run(
      `INSERT OR IGNORE INTO seo_automation_settings (setting_name, setting_value, description) VALUES (?, ?, ?)`,
      setting,
      (err) => {
        if (err) {
          console.error(`❌ Error inserting setting ${index + 1}:`, err.message);
        } else {
          settingsCount++;
          console.log(`✅ Inserted setting ${settingsCount}/${defaultSettings.length}: ${setting[0]}`);
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
