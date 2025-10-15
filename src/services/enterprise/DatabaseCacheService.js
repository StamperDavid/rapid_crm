/**
 * Database Cache Service
 * Advanced caching layer for database queries with intelligent invalidation
 */

const { getResponseCache } = require('./ResponseCache');

class DatabaseCacheService {
  constructor() {
    this.cache = getResponseCache();
    this.queryStats = new Map();
    this.slowQueries = [];
    this.queryThreshold = 100; // Log queries slower than 100ms
  }

  /**
   * Cache database query results
   */
  async cacheQuery(query, params, result, ttl = 300000) {
    const cacheKey = this.generateQueryKey(query, params);
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      query,
      params
    }, ttl);
    
    console.log(`💾 Cached query result: ${query.substring(0, 50)}...`);
  }

  /**
   * Get cached query result
   */
  async getCachedQuery(query, params) {
    const cacheKey = this.generateQueryKey(query, params);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      console.log(`⚡ Cache hit for query: ${query.substring(0, 50)}...`);
      return cached.result;
    }
    
    return null;
  }

  /**
   * Generate cache key for query
   */
  generateQueryKey(query, params) {
    const normalizedQuery = query.toLowerCase().replace(/\s+/g, ' ').trim();
    const paramString = params ? JSON.stringify(params) : '';
    return `db_query:${Buffer.from(normalizedQuery + paramString).toString('base64')}`;
  }

  /**
   * Execute query with caching
   */
  async executeWithCache(db, query, params = [], ttl = 300000) {
    const startTime = Date.now();
    
    // Check cache first
    const cached = await this.getCachedQuery(query, params);
    if (cached) {
      this.recordQueryStats(query, Date.now() - startTime, true);
      return cached;
    }
    
    // Execute query
    try {
      let result;
      if (params.length > 0) {
        const stmt = db.prepare(query);
        result = stmt.all(params);
      } else {
        result = db.prepare(query).all();
      }
      
      const executionTime = Date.now() - startTime;
      
      // Cache the result
      await this.cacheQuery(query, params, result, ttl);
      
      // Record statistics
      this.recordQueryStats(query, executionTime, false);
      
      // Log slow queries
      if (executionTime > this.queryThreshold) {
        this.slowQueries.push({
          query: query.substring(0, 100),
          executionTime,
          timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 slow queries
        if (this.slowQueries.length > 50) {
          this.slowQueries = this.slowQueries.slice(-50);
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }
  }

  /**
   * Record query performance statistics
   */
  recordQueryStats(query, executionTime, fromCache) {
    const queryHash = this.generateQueryKey(query, []);
    
    if (!this.queryStats.has(queryHash)) {
      this.queryStats.set(queryHash, {
        query: query.substring(0, 100),
        count: 0,
        totalTime: 0,
        avgTime: 0,
        cacheHits: 0,
        lastExecuted: new Date().toISOString()
      });
    }
    
    const stats = this.queryStats.get(queryHash);
    stats.count++;
    stats.totalTime += executionTime;
    stats.avgTime = stats.totalTime / stats.count;
    stats.lastExecuted = new Date().toISOString();
    
    if (fromCache) {
      stats.cacheHits++;
    }
  }

  /**
   * Get query performance statistics
   */
  getQueryStats() {
    const stats = Array.from(this.queryStats.values());
    return {
      totalQueries: stats.length,
      slowQueries: this.slowQueries,
      topQueries: stats
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      slowestQueries: stats
        .sort((a, b) => b.avgTime - a.avgTime)
        .slice(0, 10),
      cacheStats: this.cache.getStats()
    };
  }

  /**
   * Invalidate cache for specific patterns
   */
  invalidateCache(pattern) {
    const keysToDelete = [];
    
    for (const key of this.cache.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.cache.delete(key);
      this.cache.accessTimes.delete(key);
    });
    
    console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries for pattern: ${pattern}`);
  }

  /**
   * Preload frequently accessed data
   */
  async preloadFrequentData(db) {
    console.log('🚀 Preloading frequently accessed data...');
    
    const preloadQueries = [
      {
        query: 'SELECT * FROM api_keys WHERE provider IN (?, ?, ?)',
        params: ['openrouter', 'stripe', 'google'],
        ttl: 3600000 // 1 hour
      },
      {
        query: 'SELECT * FROM theme_settings ORDER BY updated_at DESC LIMIT 1',
        params: [],
        ttl: 1800000 // 30 minutes
      },
      {
        query: 'SELECT COUNT(*) as count FROM integrations',
        params: [],
        ttl: 600000 // 10 minutes
      }
    ];
    
    for (const { query, params, ttl } of preloadQueries) {
      try {
        await this.executeWithCache(db, query, params, ttl);
      } catch (error) {
        console.warn(`⚠️ Preload failed for query: ${query}`, error.message);
      }
    }
    
    console.log('✅ Preloading completed');
  }

  /**
   * Optimize database connection
   */
  optimizeConnection(db) {
    try {
      // Enable WAL mode for better concurrency
      db.pragma('journal_mode = WAL');
      
      // Increase cache size
      db.pragma('cache_size = -64000'); // 64MB
      
      // Optimize synchronous mode
      db.pragma('synchronous = NORMAL');
      
      // Store temporary tables in memory
      db.pragma('temp_store = MEMORY');
      
      // Enable query optimization
      db.pragma('optimize');
      
      console.log('🔧 Database connection optimized');
    } catch (error) {
      console.warn('⚠️ Database optimization failed:', error.message);
    }
  }

  /**
   * Get cache performance report
   */
  getPerformanceReport() {
    const stats = this.getQueryStats();
    const cacheStats = this.cache.getStats();
    
    return {
      cache: {
        hitRate: cacheStats.hitRate.toFixed(2) + '%',
        totalRequests: cacheStats.totalRequests,
        cacheSize: cacheStats.cacheSize,
        memoryUsage: (cacheStats.memoryUsage / 1024 / 1024).toFixed(2) + ' MB'
      },
      queries: {
        totalQueries: stats.totalQueries,
        slowQueries: stats.slowQueries.length,
        averageExecutionTime: stats.topQueries.length > 0 
          ? (stats.topQueries.reduce((sum, q) => sum + q.avgTime, 0) / stats.topQueries.length).toFixed(2) + 'ms'
          : '0ms'
      },
      recommendations: this.generateRecommendations(stats)
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(stats) {
    const recommendations = [];
    
    if (stats.cacheStats.hitRate < 50) {
      recommendations.push('Consider increasing cache TTL for frequently accessed data');
    }
    
    if (stats.slowQueries.length > 10) {
      recommendations.push('Multiple slow queries detected - consider adding database indexes');
    }
    
    if (stats.cacheStats.memoryUsage > 100 * 1024 * 1024) { // 100MB
      recommendations.push('Cache memory usage is high - consider reducing cache size or TTL');
    }
    
    return recommendations;
  }
}

// Singleton instance
let databaseCacheService = null;

function getDatabaseCacheService() {
  if (!databaseCacheService) {
    databaseCacheService = new DatabaseCacheService();
  }
  return databaseCacheService;
}

module.exports = { DatabaseCacheService, getDatabaseCacheService };


