/**
 * VOICE PREFERENCE SERVICE - CommonJS Version
 * Handles user voice preferences that the AI can actually control
 */

const Database = require('better-sqlite3');
const path = require('path');

class VoicePreferenceService {
  constructor() {
    this.dbPath = path.join(__dirname, '../../../instance/rapid_crm.db');
    this.db = new Database(this.dbPath, { 
      timeout: 10000, // 10 second timeout
      verbose: null // Disable verbose logging
    });
    this.initializeTables();
    console.log('🎤 Voice Preference Service initialized');
  }

  /**
   * Initialize voice preference tables
   */
  initializeTables() {
    // Create user voice preferences table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_voice_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        default_voice TEXT NOT NULL DEFAULT 'eleanor',
        voice_provider TEXT NOT NULL DEFAULT 'unreal-speech',
        voice_settings TEXT DEFAULT '{}', -- JSON string for voice parameters
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);

    // Create available voices table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS available_voices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voice_id TEXT NOT NULL UNIQUE,
        voice_name TEXT NOT NULL,
        provider TEXT NOT NULL,
        description TEXT,
        gender TEXT,
        language TEXT DEFAULT 'en-US',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default voices if they don't exist
    this.initializeDefaultVoices();

    console.log('🎤 Voice preference tables initialized');
  }

  /**
   * Initialize default voices
   */
  initializeDefaultVoices() {
    const defaultVoices = [
      { voice_id: 'eleanor', voice_name: 'Eleanor', provider: 'unreal-speech', description: 'Professional female voice', gender: 'female' },
      { voice_id: 'javier', voice_name: 'Javier', provider: 'unreal-speech', description: 'Professional male voice', gender: 'male' },
      { voice_id: 'jasper', voice_name: 'Jasper', provider: 'unreal-speech', description: 'Clear, professional male voice', gender: 'male' },
      { voice_id: 'mikael', voice_name: 'Mikael', provider: 'unreal-speech', description: 'Friendly male voice', gender: 'male' },
      { voice_id: 'sarah', voice_name: 'Sarah', provider: 'unreal-speech', description: 'Warm female voice', gender: 'female' },
      { voice_id: 'browser-default', voice_name: 'Browser Default', provider: 'browser', description: 'System default voice', gender: 'neutral' }
    ];

    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO available_voices (voice_id, voice_name, provider, description, gender)
      VALUES (?, ?, ?, ?, ?)
    `);

    defaultVoices.forEach(voice => {
      stmt.run(voice.voice_id, voice.voice_name, voice.provider, voice.description, voice.gender);
    });

    console.log('🎤 Default voices initialized');
  }

  /**
   * Get user's voice preference
   */
  getUserVoicePreference(userId) {
    try {
      const stmt = this.db.prepare(`
        SELECT default_voice, voice_provider, voice_settings
        FROM user_voice_preferences
        WHERE user_id = ?
      `);
      
      const preference = stmt.get(userId || 'default_user');
      
      if (preference) {
        return {
          defaultVoice: preference.default_voice,
          provider: preference.voice_provider,
          settings: preference.voice_settings ? JSON.parse(preference.voice_settings) : {}
        };
      }
      
      // Return default if no preference found
      return {
        defaultVoice: 'eleanor',
        provider: 'unreal-speech',
        settings: {}
      };
    } catch (error) {
      console.error('❌ Error getting voice preference:', error);
      return {
        defaultVoice: 'eleanor',
        provider: 'unreal-speech',
        settings: {}
      };
    }
  }

  /**
   * Set user's voice preference (AI can call this)
   */
  setUserVoicePreference(userId, voiceId, provider = 'unreal-speech', settings = {}) {
    try {
      // Verify voice exists
      const voiceStmt = this.db.prepare(`
        SELECT voice_id FROM available_voices WHERE voice_id = ? AND is_active = 1
      `);
      const voiceExists = voiceStmt.get(voiceId);
      
      if (!voiceExists) {
        throw new Error(`Voice '${voiceId}' not found or not available`);
      }

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO user_voice_preferences 
        (user_id, default_voice, voice_provider, voice_settings, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      stmt.run(
        userId || 'default_user',
        voiceId,
        provider,
        JSON.stringify(settings)
      );
      
      console.log(`🎤 Set voice preference for user ${userId}: ${voiceId} (${provider})`);
      return true;
    } catch (error) {
      console.error('❌ Error setting voice preference:', error);
      return false;
    }
  }

  /**
   * Get all available voices
   */
  getAvailableVoices() {
    try {
      const stmt = this.db.prepare(`
        SELECT voice_id, voice_name, provider, description, gender
        FROM available_voices
        WHERE is_active = 1
        ORDER BY voice_name
      `);
      
      return stmt.all();
    } catch (error) {
      console.error('❌ Error getting available voices:', error);
      return [];
    }
  }

  /**
   * Check if voice change is valid
   */
  isValidVoice(voiceId) {
    try {
      const stmt = this.db.prepare(`
        SELECT voice_id FROM available_voices WHERE voice_id = ? AND is_active = 1
      `);
      return !!stmt.get(voiceId);
    } catch (error) {
      console.error('❌ Error checking voice validity:', error);
      return false;
    }
  }

  /**
   * Get voice details
   */
  getVoiceDetails(voiceId) {
    try {
      const stmt = this.db.prepare(`
        SELECT voice_id, voice_name, provider, description, gender
        FROM available_voices
        WHERE voice_id = ?
      `);
      
      return stmt.get(voiceId);
    } catch (error) {
      console.error('❌ Error getting voice details:', error);
      return null;
    }
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = { VoicePreferenceService };
