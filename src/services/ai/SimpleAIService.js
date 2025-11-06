/**
 * Simple AI Service - CommonJS
 * Direct OpenRouter API calls without TypeScript complexity
 * Loads API key from database (managed via /settings/api-keys)
 */

const fetch = require('node-fetch');
const Database = require('better-sqlite3');
const path = require('path');

let cachedApiKey = null;

function getApiKeyFromDatabase() {
  if (cachedApiKey) {
    console.log('✅ Using cached OpenRouter API key');
    return cachedApiKey;
  }
  
  try {
    const dbPath = path.join(process.cwd(), 'instance', 'rapid_crm.db');
    const db = new Database(dbPath);
    
    const apiKey = db.prepare(`
      SELECT key_value FROM api_keys 
      WHERE LOWER(provider) LIKE '%openrouter%'
    `).get();
    
    console.log('🔑 OpenRouter API key from database:', apiKey ? 'Found' : 'Not found');
    
    db.close();
    
    if (apiKey && apiKey.key_value) {
      cachedApiKey = apiKey.key_value;
      console.log('✅ OpenRouter API key loaded from database');
      return cachedApiKey;
    }
  } catch (error) {
    console.warn('⚠️ Could not load OpenRouter API key from database:', error.message);
  }
  
  // Fallback to env variable
  const envKey = process.env.OPENROUTER_API_KEY;
  if (envKey) {
    console.log('✅ Using OpenRouter API key from .env file');
    return envKey;
  }
  
  console.error('❌ No OpenRouter API key found in database or .env');
  return null;
}

async function callOpenRouter(messages, temperature = 0.7, maxTokens = 500) {
  console.log('📞 callOpenRouter called');
  const apiKey = getApiKeyFromDatabase();
  
  console.log('🔑 API Key retrieved:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NULL');
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured. Please add it at /settings/api-keys');
  }

  console.log('📤 Calling OpenRouter API...');
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://rapidcrm.com',
      'X-Title': 'Rapid CRM'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages,
      temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
    usage: data.usage
  };
}

module.exports = { callOpenRouter };

