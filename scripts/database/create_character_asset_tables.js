const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'instance', 'rapid_crm.db');
const db = new sqlite3.Database(dbPath);

console.log('Creating character and asset tables...');

// Create characters table
db.run(`
  CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    age INTEGER,
    gender TEXT CHECK(gender IN ('male', 'female', 'non-binary')),
    ethnicity TEXT,
    personality TEXT, -- JSON array of personality traits
    voice_type TEXT DEFAULT 'professional',
    voice_pitch REAL DEFAULT 0.5,
    voice_speed REAL DEFAULT 1.0,
    voice_accent TEXT DEFAULT 'american',
    hair_color TEXT DEFAULT 'brown',
    eye_color TEXT DEFAULT 'brown',
    skin_tone TEXT DEFAULT 'medium',
    body_type TEXT DEFAULT 'average',
    clothing TEXT DEFAULT 'business casual',
    accessories TEXT, -- JSON array of accessories
    ai_generated BOOLEAN DEFAULT 0,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Error creating characters table:', err);
  } else {
    console.log('✓ Characters table created successfully');
  }
});

// Create assets table
db.run(`
  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('image', 'video', 'audio', 'character', 'background', 'prop')),
    category TEXT,
    tags TEXT, -- JSON array of tags
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER, -- in seconds for video/audio
    size INTEGER, -- file size in bytes
    resolution TEXT, -- e.g., '1920x1080'
    is_favorite BOOLEAN DEFAULT 0,
    is_premium BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 0
  )
`, (err) => {
  if (err) {
    console.error('Error creating assets table:', err);
  } else {
    console.log('✓ Assets table created successfully');
  }
});

// Create indexes for better performance
db.run(`CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name)`, (err) => {
  if (err) {
    console.error('Error creating characters name index:', err);
  } else {
    console.log('✓ Characters name index created');
  }
});

db.run(`CREATE INDEX IF NOT EXISTS idx_characters_gender ON characters(gender)`, (err) => {
  if (err) {
    console.error('Error creating characters gender index:', err);
  } else {
    console.log('✓ Characters gender index created');
  }
});

db.run(`CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type)`, (err) => {
  if (err) {
    console.error('Error creating assets type index:', err);
  } else {
    console.log('✓ Assets type index created');
  }
});

db.run(`CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category)`, (err) => {
  if (err) {
    console.error('Error creating assets category index:', err);
  } else {
    console.log('✓ Assets category index created');
  }
});

// Insert some sample characters
const sampleCharacters = [
  {
    id: 'char_sample_1',
    name: 'Professional Truck Driver',
    description: 'Experienced truck driver with 15+ years in the industry, knowledgeable about safety regulations and best practices.',
    age: 42,
    gender: 'male',
    ethnicity: 'Caucasian',
    personality: JSON.stringify(['Professional', 'Knowledgeable', 'Trustworthy', 'Experienced']),
    voice_type: 'professional',
    voice_pitch: 0.4,
    voice_speed: 0.9,
    voice_accent: 'american',
    hair_color: 'brown',
    eye_color: 'brown',
    skin_tone: 'medium',
    body_type: 'average',
    clothing: 'uniform',
    accessories: JSON.stringify(['cap', 'safety_vest']),
    ai_generated: 1,
    avatar_url: '/assets/characters/truck-driver.png',
    created_at: new Date().toISOString()
  },
  {
    id: 'char_sample_2',
    name: 'Fleet Manager',
    description: 'Professional fleet manager with expertise in logistics, safety compliance, and driver management.',
    age: 35,
    gender: 'female',
    ethnicity: 'African American',
    personality: JSON.stringify(['Professional', 'Authoritative', 'Organized', 'Efficient']),
    voice_type: 'professional',
    voice_pitch: 0.6,
    voice_speed: 1.0,
    voice_accent: 'american',
    hair_color: 'black',
    eye_color: 'brown',
    skin_tone: 'dark',
    body_type: 'average',
    clothing: 'business',
    accessories: JSON.stringify(['glasses', 'badge']),
    ai_generated: 1,
    avatar_url: '/assets/characters/fleet-manager.png',
    created_at: new Date().toISOString()
  }
];

sampleCharacters.forEach((char, index) => {
  db.run(`
    INSERT OR REPLACE INTO characters (
      id, name, description, age, gender, ethnicity, personality,
      voice_type, voice_pitch, voice_speed, voice_accent,
      hair_color, eye_color, skin_tone, body_type, clothing,
      accessories, ai_generated, avatar_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    char.id, char.name, char.description, char.age, char.gender, char.ethnicity,
    char.personality, char.voice_type, char.voice_pitch, char.voice_speed, char.voice_accent,
    char.hair_color, char.eye_color, char.skin_tone, char.body_type, char.clothing,
    char.accessories, char.ai_generated, char.avatar_url, char.created_at
  ], function(err) {
    if (err) {
      console.error(`Error inserting sample character ${index + 1}:`, err);
    } else {
      console.log(`✓ Sample character ${index + 1} inserted`);
    }
  });
});

// Insert some sample assets
const sampleAssets = [
  {
    id: 'asset_sample_1',
    name: 'Modern Office Background',
    type: 'background',
    category: 'business',
    tags: JSON.stringify(['office', 'modern', 'professional', 'workspace']),
    url: '/assets/backgrounds/office-modern.jpg',
    thumbnail_url: '/assets/backgrounds/office-modern-thumb.jpg',
    size: 1536000,
    resolution: '1920x1080',
    is_favorite: 1,
    is_premium: 0,
    created_at: new Date().toISOString(),
    usage_count: 8
  },
  {
    id: 'asset_sample_2',
    name: 'Truck Fleet Video',
    type: 'video',
    category: 'transportation',
    tags: JSON.stringify(['trucks', 'fleet', 'transportation', 'logistics']),
    url: '/assets/videos/truck-fleet.mp4',
    thumbnail_url: '/assets/videos/truck-fleet-thumb.jpg',
    duration: 30,
    size: 25600000,
    resolution: '1920x1080',
    is_favorite: 0,
    is_premium: 1,
    created_at: new Date().toISOString(),
    usage_count: 5
  },
  {
    id: 'asset_sample_3',
    name: 'Background Music - Corporate',
    type: 'audio',
    category: 'business',
    tags: JSON.stringify(['music', 'corporate', 'background', 'professional']),
    url: '/assets/audio/corporate-bg.mp3',
    size: 5120000,
    is_favorite: 0,
    is_premium: 0,
    created_at: new Date().toISOString(),
    usage_count: 15
  }
];

sampleAssets.forEach((asset, index) => {
  db.run(`
    INSERT OR REPLACE INTO assets (
      id, name, type, category, tags, url, thumbnail_url,
      duration, size, resolution, is_favorite, is_premium,
      created_at, usage_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    asset.id, asset.name, asset.type, asset.category, asset.tags, asset.url, asset.thumbnail_url,
    asset.duration, asset.size, asset.resolution, asset.is_favorite, asset.is_premium,
    asset.created_at, asset.usage_count
  ], function(err) {
    if (err) {
      console.error(`Error inserting sample asset ${index + 1}:`, err);
    } else {
      console.log(`✓ Sample asset ${index + 1} inserted`);
    }
  });
});

// Close database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('✓ Database connection closed');
    console.log('✓ Character and asset tables setup complete!');
  }
});









