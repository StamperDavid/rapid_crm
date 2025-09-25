/**
 * PERSISTENT MEMORY SERVICE - CommonJS Version
 * Handles conversation memory persistence for the AI agent
 */

const Database = require('better-sqlite3');
const path = require('path');

class PersistentMemoryService {
  constructor() {
    this.dbPath = path.join(__dirname, '../../../instance/rapid_crm.db');
    // Use singleton database connection to prevent connection explosion
    if (!PersistentMemoryService.sharedDb) {
      PersistentMemoryService.sharedDb = new Database(this.dbPath, { 
        timeout: 10000, // 10 second timeout
        verbose: null, // Disable verbose logging
        pragma: {
          journal_mode: 'WAL', // Better concurrency
          synchronous: 'NORMAL', // Better performance
          cache_size: -64000, // 64MB cache
          temp_store: 'MEMORY' // Store temp tables in memory
        }
      });
    }
    this.db = PersistentMemoryService.sharedDb;
    this.initializeTables();
    this.startCleanupTimer(); // Start automatic cleanup of old conversations
    console.log('🧠 Persistent Memory Service initialized with shared connection');
  }

  /**
   * Initialize memory tables if they don't exist
   */
  initializeTables() {
    // Create user conversation memory table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_conversation_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        conversation_id TEXT NOT NULL,
        message_type TEXT NOT NULL, -- 'user' or 'assistant'
        content TEXT NOT NULL,
        context TEXT, -- JSON string of conversation context
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        retention_date DATETIME DEFAULT (datetime('now', '+30 days')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create conversation context table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversation_context (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        conversation_id TEXT NOT NULL,
        context_summary TEXT, -- Summary of conversation so far
        key_topics TEXT, -- JSON array of key topics discussed
        user_preferences TEXT, -- JSON object of user preferences learned
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_conversation_memory_user_id 
      ON user_conversation_memory(user_id, timestamp);
    `);
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_conversation_memory_conversation_id 
      ON user_conversation_memory(conversation_id);
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_conversation_context_user_id 
      ON conversation_context(user_id, conversation_id);
    `);

    console.log('📚 Memory tables initialized');
  }

  /**
   * Store a conversation message
   */
  storeMessage(userId, conversationId, messageType, content, context = {}) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO user_conversation_memory 
        (user_id, conversation_id, message_type, content, context)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        userId || 'default_user',
        conversationId,
        messageType,
        content,
        JSON.stringify(context)
      );
      
      console.log(`💾 Stored ${messageType} message for conversation ${conversationId}`);
      return true;
    } catch (error) {
      console.error('❌ Error storing message:', error);
      return false;
    }
  }

  /**
   * Get recent conversation history for a user
   */
  getConversationHistory(userId, conversationId, limit = 20) {
    try {
      const stmt = this.db.prepare(`
        SELECT message_type, content, context, timestamp
        FROM user_conversation_memory
        WHERE user_id = ? AND conversation_id = ? 
        AND timestamp >= datetime('now', '-30 days')
        ORDER BY timestamp DESC
        LIMIT ?
      `);
      
      const messages = stmt.all(userId || 'default_user', conversationId, limit);
      
      // Reverse to get chronological order
      return messages.reverse().map(msg => ({
        type: msg.message_type,
        content: msg.content,
        context: msg.context ? JSON.parse(msg.context) : {},
        timestamp: msg.timestamp
      }));
    } catch (error) {
      console.error('❌ Error getting conversation history:', error);
      return [];
    }
  }

  /**
   * Get conversation context summary
   */
  getConversationContext(userId, conversationId) {
    try {
      const stmt = this.db.prepare(`
        SELECT context_summary, key_topics, user_preferences
        FROM conversation_context
        WHERE user_id = ? AND conversation_id = ?
        ORDER BY last_updated DESC
        LIMIT 1
      `);
      
      const context = stmt.get(userId || 'default_user', conversationId);
      
      if (context) {
        return {
          summary: context.context_summary,
          keyTopics: context.key_topics ? JSON.parse(context.key_topics) : [],
          userPreferences: context.user_preferences ? JSON.parse(context.user_preferences) : {}
        };
      }
      
      return {
        summary: '',
        keyTopics: [],
        userPreferences: {}
      };
    } catch (error) {
      console.error('❌ Error getting conversation context:', error);
      return {
        summary: '',
        keyTopics: [],
        userPreferences: {}
      };
    }
  }

  /**
   * Update conversation context
   */
  updateConversationContext(userId, conversationId, summary, keyTopics = [], userPreferences = {}) {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO conversation_context
        (user_id, conversation_id, context_summary, key_topics, user_preferences, last_updated)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      stmt.run(
        userId || 'default_user',
        conversationId,
        summary,
        JSON.stringify(keyTopics),
        JSON.stringify(userPreferences)
      );
      
      console.log(`🔄 Updated context for conversation ${conversationId}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating conversation context:', error);
      return false;
    }
  }

  /**
   * Get all conversations for a user (for context)
   */
  getUserConversations(userId, limit = 10) {
    try {
      const stmt = this.db.prepare(`
        SELECT DISTINCT conversation_id, MAX(timestamp) as last_activity
        FROM user_conversation_memory
        WHERE user_id = ?
        GROUP BY conversation_id
        ORDER BY last_activity DESC
        LIMIT ?
      `);
      
      return stmt.all(userId || 'default_user', limit);
    } catch (error) {
      console.error('❌ Error getting user conversations:', error);
      return [];
    }
  }

  /**
   * Generate conversation summary for context
   */
  generateConversationSummary(messages) {
    if (messages.length === 0) return '';
    
    const userMessages = messages.filter(msg => msg.type === 'user');
    const assistantMessages = messages.filter(msg => msg.type === 'assistant');
    
    let summary = `Previous conversation with ${userMessages.length} user messages and ${assistantMessages.length} AI responses. `;
    
    // Extract key topics from recent messages
    const recentMessages = messages.slice(-10); // Last 10 messages
    const topics = new Set();
    
    recentMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      if (content.includes('hos') || content.includes('hours of service')) topics.add('Hours of Service');
      if (content.includes('eld') || content.includes('electronic logging')) topics.add('ELD');
      if (content.includes('maintenance') || content.includes('inspection')) topics.add('Vehicle Maintenance');
      if (content.includes('hazmat') || content.includes('hazardous')) topics.add('Hazmat');
      if (content.includes('crm') || content.includes('contact') || content.includes('company')) topics.add('CRM');
      if (content.includes('database') || content.includes('api')) topics.add('Technical Development');
      if (content.includes('voice') || content.includes('speak')) topics.add('Voice Interaction');
    });
    
    if (topics.size > 0) {
      summary += `Recent topics discussed: ${Array.from(topics).join(', ')}. `;
    }
    
    // Add recent user question context
    const lastUserMessage = userMessages[userMessages.length - 1];
    if (lastUserMessage) {
      summary += `Last user question was about: "${lastUserMessage.content.substring(0, 100)}${lastUserMessage.content.length > 100 ? '...' : ''}". `;
    }
    
    return summary;
  }

  /**
   * Clean up old conversations (older than 30 days)
   */
  cleanupOldConversations() {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM user_conversation_memory
        WHERE retention_date < datetime('now')
      `);
      
      const result = stmt.run();
      console.log(`🧹 Cleaned up ${result.changes} old conversation records`);
      
      // Also clean up old context records
      const contextStmt = this.db.prepare(`
        DELETE FROM conversation_context
        WHERE created_at < datetime('now', '-30 days')
      `);
      
      const contextResult = contextStmt.run();
      console.log(`🧹 Cleaned up ${contextResult.changes} old context records`);
      
      return result.changes;
    } catch (error) {
      console.error('❌ Error cleaning up old conversations:', error);
      return 0;
    }
  }

  /**
   * Start automatic cleanup timer for old conversations
   */
  startCleanupTimer() {
    // Clean up old conversations every hour
    setInterval(() => {
      this.cleanupOldConversations();
    }, 3600000); // 1 hour
    
    // Run initial cleanup
    this.cleanupOldConversations();
  }

  /**
   * Clean up conversations older than 30 days
   */
  cleanupOldConversations() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Delete old conversations
      const deleteStmt = this.db.prepare(`
        DELETE FROM user_conversation_memory 
        WHERE timestamp < ?
      `);
      
      const result = deleteStmt.run(thirtyDaysAgo.toISOString());
      
      if (result.changes > 0) {
        console.log(`🧹 Cleaned up ${result.changes} old conversation entries (older than 30 days)`);
      }
      
      // Delete old conversation contexts
      const deleteContextStmt = this.db.prepare(`
        DELETE FROM conversation_context 
        WHERE last_updated < ?
      `);
      
      const contextResult = deleteContextStmt.run(thirtyDaysAgo.toISOString());
      
      if (contextResult.changes > 0) {
        console.log(`🧹 Cleaned up ${contextResult.changes} old conversation contexts`);
      }
      
    } catch (error) {
      console.error('❌ Error cleaning up old conversations:', error);
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

module.exports = { PersistentMemoryService };
