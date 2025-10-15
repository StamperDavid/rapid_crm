/**
 * Comprehensive Error Handling Service
 * Centralized error management with logging, monitoring, and recovery
 */

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'database' | 'api' | 'authentication' | 'validation' | 'external_service' | 'system' | 'unknown';
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  recovery?: {
    attempted: boolean;
    successful: boolean;
    method: string;
  };
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errors: Map<string, ErrorReport> = new Map();
  private errorStats = {
    total: 0,
    byCategory: new Map<string, number>(),
    bySeverity: new Map<string, number>(),
    resolved: 0,
    unresolved: 0
  };

  constructor() {
    this.initializeErrorCategories();
  }

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  private initializeErrorCategories(): void {
    const categories = ['database', 'api', 'authentication', 'validation', 'external_service', 'system', 'unknown'];
    const severities = ['low', 'medium', 'high', 'critical'];
    
    categories.forEach(category => {
      this.errorStats.byCategory.set(category, 0);
    });
    
    severities.forEach(severity => {
      this.errorStats.bySeverity.set(severity, 0);
    });
  }

  /**
   * Handle and log errors with context
   */
  public handleError(
    error: Error | string,
    context: Partial<ErrorContext> = {},
    recoveryMethod?: () => Promise<any>
  ): ErrorReport {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();
    
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;
    
    const fullContext: ErrorContext = {
      timestamp,
      severity: this.determineSeverity(errorMessage, context.category),
      category: context.category || 'unknown',
      ...context
    };

    const errorReport: ErrorReport = {
      id: errorId,
      message: errorMessage,
      stack: errorStack,
      context: fullContext,
      resolved: false,
      createdAt: timestamp
    };

    // Attempt recovery if method provided
    if (recoveryMethod) {
      errorReport.recovery = {
        attempted: true,
        successful: false,
        method: recoveryMethod.name || 'unknown'
      };

      this.attemptRecovery(errorReport, recoveryMethod);
    }

    // Store error
    this.errors.set(errorId, errorReport);
    this.updateStats(errorReport);

    // Log error
    this.logError(errorReport);

    // Send alerts for critical errors
    if (fullContext.severity === 'critical') {
      this.sendCriticalAlert(errorReport);
    }

    return errorReport;
  }

  /**
   * Determine error severity based on message and category
   */
  private determineSeverity(message: string, category?: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalKeywords = ['database connection', 'authentication failed', 'security breach', 'data corruption'];
    const highKeywords = ['api timeout', 'service unavailable', 'validation failed', 'permission denied'];
    const mediumKeywords = ['rate limit', 'temporary failure', 'retry', 'cache miss'];

    const lowerMessage = message.toLowerCase();

    if (criticalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'critical';
    }

    if (highKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'high';
    }

    if (mediumKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'medium';
    }

    if (category === 'authentication' || category === 'database') {
      return 'high';
    }

    return 'low';
  }

  /**
   * Attempt error recovery
   */
  private async attemptRecovery(errorReport: ErrorReport, recoveryMethod: () => Promise<any>): Promise<void> {
    try {
      await recoveryMethod();
      if (errorReport.recovery) {
        errorReport.recovery.successful = true;
      }
      console.log(`✅ Recovery successful for error ${errorReport.id}`);
    } catch (recoveryError) {
      console.error(`❌ Recovery failed for error ${errorReport.id}:`, recoveryError);
    }
  }

  /**
   * Log error with appropriate level
   */
  private logError(errorReport: ErrorReport): void {
    const { severity, category, message } = errorReport.context;
    
    const logMessage = `🔴 Error [${severity.toUpperCase()}] [${category.toUpperCase()}] ${message}`;
    
    switch (severity) {
      case 'critical':
        console.error(logMessage, errorReport);
        break;
      case 'high':
        console.error(logMessage, errorReport);
        break;
      case 'medium':
        console.warn(logMessage, errorReport);
        break;
      case 'low':
        console.log(logMessage, errorReport);
        break;
    }
  }

  /**
   * Send critical error alerts
   */
  private sendCriticalAlert(errorReport: ErrorReport): void {
    // In production, this would send to monitoring services like Sentry, DataDog, etc.
    console.error('🚨 CRITICAL ERROR ALERT:', {
      id: errorReport.id,
      message: errorReport.message,
      context: errorReport.context,
      timestamp: errorReport.createdAt
    });
  }

  /**
   * Update error statistics
   */
  private updateStats(errorReport: ErrorReport): void {
    this.errorStats.total++;
    
    const categoryCount = this.errorStats.byCategory.get(errorReport.context.category) || 0;
    this.errorStats.byCategory.set(errorReport.context.category, categoryCount + 1);
    
    const severityCount = this.errorStats.bySeverity.get(errorReport.context.severity) || 0;
    this.errorStats.bySeverity.set(errorReport.context.severity, severityCount + 1);
    
    if (errorReport.resolved) {
      this.errorStats.resolved++;
    } else {
      this.errorStats.unresolved++;
    }
  }

  /**
   * Mark error as resolved
   */
  public resolveError(errorId: string): boolean {
    const error = this.errors.get(errorId);
    if (error) {
      error.resolved = true;
      error.resolvedAt = new Date().toISOString();
      this.errorStats.resolved++;
      this.errorStats.unresolved--;
      console.log(`✅ Error ${errorId} marked as resolved`);
      return true;
    }
    return false;
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): any {
    return {
      ...this.errorStats,
      byCategory: Object.fromEntries(this.errorStats.byCategory),
      bySeverity: Object.fromEntries(this.errorStats.bySeverity),
      recentErrors: Array.from(this.errors.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
    };
  }

  /**
   * Get errors by category
   */
  public getErrorsByCategory(category: string): ErrorReport[] {
    return Array.from(this.errors.values())
      .filter(error => error.context.category === category)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get unresolved errors
   */
  public getUnresolvedErrors(): ErrorReport[] {
    return Array.from(this.errors.values())
      .filter(error => !error.resolved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `err_${timestamp}_${random}`;
  }

  /**
   * Create error handler middleware for Express
   */
  public createErrorMiddleware() {
    return (error: Error, req: any, res: any, next: any) => {
      const context: Partial<ErrorContext> = {
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        requestId: req.headers['x-request-id'] || this.generateErrorId()
      };

      const errorReport = this.handleError(error, context);

      // Send appropriate response based on error severity
      const statusCode = this.getStatusCode(errorReport.context.severity);
      
      res.status(statusCode).json({
        success: false,
        error: {
          id: errorReport.id,
          message: errorReport.message,
          severity: errorReport.context.severity,
          category: errorReport.context.category,
          timestamp: errorReport.createdAt
        }
      });
    };
  }

  /**
   * Get HTTP status code based on error severity
   */
  private getStatusCode(severity: string): number {
    switch (severity) {
      case 'critical':
        return 500;
      case 'high':
        return 500;
      case 'medium':
        return 400;
      case 'low':
        return 200;
      default:
        return 500;
    }
  }

  /**
   * Create async error wrapper
   */
  public asyncHandler(fn: Function) {
    return (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Validate and sanitize error messages for client
   */
  public sanitizeErrorMessage(message: string, isDevelopment: boolean = false): string {
    if (isDevelopment) {
      return message;
    }

    // Remove sensitive information in production
    const sanitized = message
      .replace(/password[=:]\s*\S+/gi, 'password=***')
      .replace(/token[=:]\s*\S+/gi, 'token=***')
      .replace(/key[=:]\s*\S+/gi, 'key=***')
      .replace(/secret[=:]\s*\S+/gi, 'secret=***');

    return sanitized;
  }
}

export const errorHandlingService = ErrorHandlingService.getInstance();


