const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'instance', 'rapid_crm.db');

console.log('🔑 Adding API keys to restore AI agent functionality...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Add API keys for AI functionality
const apiKeys = [
  {
    id: 'openrouter_key_1',
    name: 'OpenRouter API Key',
    provider: 'openrouter',
    key_value: 'sk-or-v1-demo-key-replace-with-real-key', // Replace with your actual OpenRouter key
    description: 'OpenRouter API key for AI chat functionality',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'unreal_speech_key_1',
    name: 'Unreal Speech API Key',
    provider: 'unreal_speech',
    key_value: 'demo-key-replace-with-real-key', // Replace with your actual Unreal Speech key
    description: 'Unreal Speech API key for text-to-speech functionality',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let completed = 0;
const total = apiKeys.length;

apiKeys.forEach((key, index) => {
  const sql = `
    INSERT OR REPLACE INTO api_keys 
    (id, name, provider, key_value, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [
    key.id,
    key.name,
    key.provider,
    key.key_value,
    key.description,
    key.created_at,
    key.updated_at
  ], function(err) {
    if (err) {
      console.error(`❌ Error adding API key ${index + 1}:`, err.message);
    } else {
      console.log(`✅ Added API key: ${key.name} (${key.provider})`);
    }
    
    completed++;
    if (completed === total) {
      console.log('\n🎉 API keys added successfully!');
      console.log('⚠️  IMPORTANT: Replace the demo keys with your actual API keys:');
      console.log('   1. OpenRouter API key: https://openrouter.ai/');
      console.log('   2. Unreal Speech API key: https://unrealspeech.com/');
      
      db.close();
    }
  });
});
