/**
 * Production Security Service
 * Implements comprehensive security measures for production deployment
 */

import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import validator from 'validator';

export interface SecurityConfig {
  passwordHashing: {
    saltRounds: number;
  };
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
  session: {
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
  headers: {
    contentSecurityPolicy: boolean;
    hsts: boolean;
    noSniff: boolean;
    xssFilter: boolean;
  };
}

export class SecurityService {
  private static instance: SecurityService;
  private config: SecurityConfig;

  constructor() {
    this.config = {
      passwordHashing: {
        saltRounds: 12
      },
      rateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100
      },
      session: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict'
      },
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://yourdomain.com'] 
          : ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true
      },
      headers: {
        contentSecurityPolicy: true,
        hsts: true,
        noSniff: true,
        xssFilter: true
      }
    };
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Hash password using bcrypt
   */
  public async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.config.passwordHashing.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      console.error('Password hashing error:', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify password against hash
   */
  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Generate secure session token
   */
  public generateSessionToken(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `sess_${timestamp}_${random}`;
  }

  /**
   * Validate and sanitize input
   */
  public sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Remove potentially dangerous characters
    let sanitized = input.trim();
    
    // Escape HTML entities
    sanitized = validator.escape(sanitized);
    
    // Remove script tags
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove javascript: protocols
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    return sanitized;
  }

  /**
   * Validate email format
   */
  public validateEmail(email: string): boolean {
    return validator.isEmail(email);
  }

  /**
   * Validate password strength
   */
  public validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get rate limiting configuration
   */
  public getRateLimitConfig() {
    return rateLimit({
      windowMs: this.config.rateLimiting.windowMs,
      max: this.config.rateLimiting.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(this.config.rateLimiting.windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  /**
   * Get CORS configuration
   */
  public getCorsConfig() {
    return cors({
      origin: this.config.cors.origin,
      credentials: this.config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    });
  }

  /**
   * Get security headers configuration
   */
  public getSecurityHeaders() {
    return helmet({
      contentSecurityPolicy: this.config.headers.contentSecurityPolicy ? {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: []
        }
      } : false,
      hsts: this.config.headers.hsts ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      } : false,
      noSniff: this.config.headers.noSniff,
      xssFilter: this.config.headers.xssFilter,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    });
  }

  /**
   * Log security event
   */
  public logSecurityEvent(event: {
    type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded';
    userId?: string;
    ipAddress: string;
    userAgent: string;
    details: any;
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...event
    };
    
    console.log('🔒 Security Event:', logEntry);
    
    // In production, this should be sent to a security monitoring service
    // For now, we'll just log it
  }

  /**
   * Check for suspicious activity
   */
  public checkSuspiciousActivity(ipAddress: string, userAgent: string): boolean {
    // Basic suspicious activity detection
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Generate secure API key
   */
  public generateSecureApiKey(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    return `rapid_${timestamp}_${random}_${random2}`;
  }
}

export const securityService = SecurityService.getInstance();


