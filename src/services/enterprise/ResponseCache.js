/**
 * Enterprise Response Cache
 * Redis-like in-memory caching for AI responses and common queries
 * Handles 50+ concurrent users with intelligent cache management
 */

class ResponseCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000; // Maximum cache entries
    this.ttl = options.ttl || 300000; // 5 minutes default TTL
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute cleanup
    
    this.cache = new Map();
    this.accessTimes = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
      cacheSize: 0,
      hitRate: 0
    };
    
    this.startCleanupTimer();
  }

  generateKey(type, identifier, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${type}:${identifier}:${paramString}`;
  }

  set(key, value, ttl = this.ttl) {
    const now = Date.now();
    const expiry = now + ttl;
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      value,
      expiry,
      createdAt: now
    });
    
    this.accessTimes.set(key, now);
    this.stats.cacheSize = this.cache.size;
  }

  get(key) {
    this.stats.totalRequests++;
    
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    const now = Date.now();
    if (now > entry.expiry) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      this.updateHitRate();
      return null;
    }
    
    this.accessTimes.set(key, now);
    this.stats.hits++;
    this.updateHitRate();
    return entry.value;
  }

  evictOldest() {
    if (this.cache.size === 0) return;
    
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessTimes.delete(oldestKey);
      this.stats.evictions++;
      this.stats.cacheSize = this.cache.size;
    }
  }

  startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  cleanup() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, entry] of this.cache) {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      this.stats.evictions++;
    });
    
    this.stats.cacheSize = this.cache.size;
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  updateHitRate() {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = (this.stats.hits / this.stats.totalRequests) * 100;
    }
  }

  // AI Response Caching
  cacheAIResponse(userId, message, response, ttl = 300000) {
    const key = this.generateKey('ai_response', userId, { message: message.substring(0, 100) });
    this.set(key, response, ttl);
  }

  getCachedAIResponse(userId, message) {
    const key = this.generateKey('ai_response', userId, { message: message.substring(0, 100) });
    return this.get(key);
  }

  // API Key Caching
  cacheAPIKey(provider, key) {
    const cacheKey = this.generateKey('api_key', provider);
    this.set(cacheKey, key, 3600000); // 1 hour TTL for API keys
  }

  getCachedAPIKey(provider) {
    const cacheKey = this.generateKey('api_key', provider);
    return this.get(cacheKey);
  }

  // Voice Preference Caching
  cacheVoicePreference(userId, voice) {
    const key = this.generateKey('voice_preference', userId);
    this.set(key, voice, 1800000); // 30 minutes TTL
  }

  getCachedVoicePreference(userId) {
    const key = this.generateKey('voice_preference', userId);
    return this.get(key);
  }

  // Conversation History Caching
  cacheConversationHistory(userId, conversationId, history, ttl = 600000) {
    const key = this.generateKey('conversation_history', userId, { conversationId });
    this.set(key, history, ttl);
  }

  getCachedConversationHistory(userId, conversationId) {
    const key = this.generateKey('conversation_history', userId, { conversationId });
    return this.get(key);
  }

  // Common Response Templates
  cacheCommonResponse(template, response, ttl = 1800000) {
    const key = this.generateKey('common_response', template);
    this.set(key, response, ttl);
  }

  getCachedCommonResponse(template) {
    const key = this.generateKey('common_response', template);
    return this.get(key);
  }

  // Clear user-specific cache
  clearUserCache(userId) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(`:${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.accessTimes.delete(key);
    });
    
    this.stats.cacheSize = this.cache.size;
    console.log(`🗑️ Cleared cache for user ${userId}: ${keysToDelete.length} entries`);
  }

  // Get cache statistics
  getStats() {
    return {
      ...this.stats,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  estimateMemoryUsage() {
    let totalSize = 0;
    for (const [key, entry] of this.cache) {
      totalSize += key.length * 2; // Unicode characters
      totalSize += JSON.stringify(entry.value).length * 2;
      totalSize += 24; // Object overhead
    }
    return totalSize;
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.accessTimes.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
      cacheSize: 0,
      hitRate: 0
    };
    console.log('🗑️ Cache cleared');
  }
}

// Singleton instance for enterprise use
let responseCache = null;

function getResponseCache() {
  if (!responseCache) {
    responseCache = new ResponseCache({
      maxSize: 2000, // Increased for 50+ users
      ttl: 300000, // 5 minutes
      cleanupInterval: 30000 // 30 seconds cleanup
    });
  }
  return responseCache;
}

module.exports = { ResponseCache, getResponseCache };







