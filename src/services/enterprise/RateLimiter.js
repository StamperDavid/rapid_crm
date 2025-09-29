/**
 * Enterprise Rate Limiter
 * Handles rate limiting for 50+ concurrent users with intelligent throttling
 */

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute window
    this.maxRequests = options.maxRequests || 100; // Max requests per window
    this.cleanupInterval = options.cleanupInterval || 30000; // 30 seconds cleanup
    
    this.requests = new Map(); // userId -> { count, resetTime }
    this.blockedUsers = new Set();
    this.stats = {
      totalRequests: 0,
      blockedRequests: 0,
      activeUsers: 0,
      averageRequestsPerUser: 0
    };
    
    this.startCleanupTimer();
  }

  isAllowed(userId, customLimit = null) {
    const now = Date.now();
    const limit = customLimit || this.maxRequests;
    
    this.stats.totalRequests++;
    
    // Check if user is blocked
    if (this.blockedUsers.has(userId)) {
      this.stats.blockedRequests++;
      return { allowed: false, reason: 'User is temporarily blocked' };
    }
    
    // Get or create user request record
    let userRequests = this.requests.get(userId);
    
    if (!userRequests || now > userRequests.resetTime) {
      // Reset window for user
      userRequests = {
        count: 0,
        resetTime: now + this.windowMs
      };
      this.requests.set(userId, userRequests);
    }
    
    // Check if user has exceeded limit
    if (userRequests.count >= limit) {
      this.stats.blockedRequests++;
      
      // Block user temporarily if they're way over limit
      if (userRequests.count >= limit * 2) {
        this.blockedUsers.add(userId);
        setTimeout(() => {
          this.blockedUsers.delete(userId);
        }, 300000); // 5 minute block
      }
      
      return {
        allowed: false,
        reason: 'Rate limit exceeded',
        resetTime: userRequests.resetTime,
        remaining: 0
      };
    }
    
    // Increment request count
    userRequests.count++;
    this.updateStats();
    
    return {
      allowed: true,
      remaining: limit - userRequests.count,
      resetTime: userRequests.resetTime
    };
  }

  // AI-specific rate limiting
  isAIRequestAllowed(userId) {
    // More restrictive limits for AI requests
    return this.isAllowed(userId, 20); // 20 AI requests per minute
  }

  // Voice request rate limiting
  isVoiceRequestAllowed(userId) {
    // Even more restrictive for voice requests
    return this.isAllowed(userId, 10); // 10 voice requests per minute
  }

  // Database query rate limiting
  isDatabaseRequestAllowed(userId) {
    return this.isAllowed(userId, 200); // 200 DB requests per minute
  }

  startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  cleanup() {
    const now = Date.now();
    const usersToDelete = [];
    
    for (const [userId, userRequests] of this.requests) {
      if (now > userRequests.resetTime) {
        usersToDelete.push(userId);
      }
    }
    
    usersToDelete.forEach(userId => {
      this.requests.delete(userId);
    });
    
    this.updateStats();
    
    if (usersToDelete.length > 0) {
      console.log(`🧹 Rate limiter cleanup: removed ${usersToDelete.length} expired user records`);
    }
  }

  updateStats() {
    this.stats.activeUsers = this.requests.size;
    
    if (this.requests.size > 0) {
      let totalUserRequests = 0;
      for (const userRequests of this.requests.values()) {
        totalUserRequests += userRequests.count;
      }
      this.stats.averageRequestsPerUser = totalUserRequests / this.requests.size;
    }
  }

  // Get user's current status
  getUserStatus(userId) {
    const userRequests = this.requests.get(userId);
    if (!userRequests) {
      return {
        requests: 0,
        limit: this.maxRequests,
        remaining: this.maxRequests,
        resetTime: Date.now() + this.windowMs,
        isBlocked: this.blockedUsers.has(userId)
      };
    }
    
    const now = Date.now();
    if (now > userRequests.resetTime) {
      return {
        requests: 0,
        limit: this.maxRequests,
        remaining: this.maxRequests,
        resetTime: now + this.windowMs,
        isBlocked: this.blockedUsers.has(userId)
      };
    }
    
    return {
      requests: userRequests.count,
      limit: this.maxRequests,
      remaining: this.maxRequests - userRequests.count,
      resetTime: userRequests.resetTime,
      isBlocked: this.blockedUsers.has(userId)
    };
  }

  // Reset user's rate limit
  resetUser(userId) {
    this.requests.delete(userId);
    this.blockedUsers.delete(userId);
    console.log(`🔄 Reset rate limit for user ${userId}`);
  }

  // Get rate limiter statistics
  getStats() {
    return {
      ...this.stats,
      blockedUsers: this.blockedUsers.size,
      windowMs: this.windowMs,
      maxRequests: this.maxRequests
    };
  }

  // Middleware function for Express
  middleware(options = {}) {
    const { 
      keyGenerator = (req) => req.body.userId || req.ip,
      skipSuccessfulRequests = false,
      skipFailedRequests = false
    } = options;
    
    return (req, res, next) => {
      const userId = keyGenerator(req);
      const result = this.isAllowed(userId);
      
      if (!result.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: result.reason,
          resetTime: result.resetTime,
          remaining: result.remaining
        });
      }
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': this.maxRequests,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      });
      
      next();
    };
  }
}

// Singleton instance for enterprise use
let rateLimiter = null;

function getRateLimiter() {
  if (!rateLimiter) {
    rateLimiter = new RateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 100, // 100 requests per minute per user
      cleanupInterval: 30000 // 30 seconds cleanup
    });
  }
  return rateLimiter;
}

module.exports = { RateLimiter, getRateLimiter };







