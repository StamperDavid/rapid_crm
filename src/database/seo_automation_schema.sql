-- SEO Automation and Competitive Intelligence Database Schema

-- Competitors table
CREATE TABLE IF NOT EXISTS seo_competitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT DEFAULT 'transportation',
  target_keywords TEXT, -- JSON array of keywords
  monitoring_enabled BOOLEAN DEFAULT 1,
  last_analyzed DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SEO metrics tracking
CREATE TABLE IF NOT EXISTS seo_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competitor_id INTEGER,
  metric_type TEXT NOT NULL, -- 'organic_keywords', 'traffic', 'backlinks', 'domain_authority'
  value REAL,
  date_recorded DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT, -- 'semrush', 'ahrefs', 'moz', 'custom'
  FOREIGN KEY (competitor_id) REFERENCES seo_competitors(id)
);

-- Keyword rankings
CREATE TABLE IF NOT EXISTS keyword_rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competitor_id INTEGER,
  keyword TEXT NOT NULL,
  position INTEGER,
  search_volume INTEGER,
  difficulty_score REAL,
  cpc REAL,
  date_recorded DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (competitor_id) REFERENCES seo_competitors(id)
);

-- Content opportunities
CREATE TABLE IF NOT EXISTS content_opportunities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  competitor_ranking INTEGER,
  our_ranking INTEGER,
  opportunity_score REAL, -- 0-100
  content_suggestion TEXT,
  content_type TEXT, -- 'blog_post', 'landing_page', 'product_page'
  priority TEXT, -- 'high', 'medium', 'low'
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'implemented', 'rejected'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SEO recommendations
CREATE TABLE IF NOT EXISTS seo_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- 'technical', 'content', 'link_building', 'keyword_optimization'
  title TEXT NOT NULL,
  description TEXT,
  impact_score REAL, -- 0-100
  effort_level TEXT, -- 'low', 'medium', 'high'
  priority TEXT, -- 'high', 'medium', 'low'
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'implemented', 'rejected'
  implementation_details TEXT, -- JSON with specific changes
  approved_by INTEGER,
  approved_at DATETIME,
  implemented_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Content generation queue
CREATE TABLE IF NOT EXISTS content_generation_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_opportunity_id INTEGER,
  content_type TEXT NOT NULL, -- 'blog_post', 'social_media', 'landing_page'
  topic TEXT NOT NULL,
  target_keywords TEXT, -- JSON array
  content_brief TEXT,
  generated_content TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'generated', 'reviewed', 'published'
  assigned_to INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_opportunity_id) REFERENCES content_opportunities(id)
);

-- Social media SEO tracking
CREATE TABLE IF NOT EXISTS social_seo_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL, -- 'facebook', 'twitter', 'linkedin', 'instagram'
  competitor_id INTEGER,
  followers_count INTEGER,
  engagement_rate REAL,
  post_frequency INTEGER, -- posts per week
  top_hashtags TEXT, -- JSON array
  content_themes TEXT, -- JSON array
  date_recorded DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (competitor_id) REFERENCES seo_competitors(id)
);

-- SEO automation settings
CREATE TABLE IF NOT EXISTS seo_automation_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_name TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SEO change log
CREATE TABLE IF NOT EXISTS seo_change_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recommendation_id INTEGER,
  change_type TEXT NOT NULL, -- 'meta_tag', 'content_update', 'url_structure', 'technical'
  change_description TEXT,
  before_value TEXT,
  after_value TEXT,
  implemented_by INTEGER,
  implemented_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recommendation_id) REFERENCES seo_recommendations(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_competitors_domain ON seo_competitors(domain);
CREATE INDEX IF NOT EXISTS idx_seo_competitors_monitoring ON seo_competitors(monitoring_enabled);
CREATE INDEX IF NOT EXISTS idx_seo_metrics_competitor ON seo_metrics(competitor_id);
CREATE INDEX IF NOT EXISTS idx_seo_metrics_date ON seo_metrics(date_recorded);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_competitor ON keyword_rankings(competitor_id);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_keyword ON keyword_rankings(keyword);
CREATE INDEX IF NOT EXISTS idx_content_opportunities_status ON content_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_content_opportunities_priority ON content_opportunities(priority);
CREATE INDEX IF NOT EXISTS idx_seo_recommendations_status ON seo_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_seo_recommendations_priority ON seo_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_content_generation_status ON content_generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_social_seo_platform ON social_seo_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_social_seo_competitor ON social_seo_metrics(competitor_id);
