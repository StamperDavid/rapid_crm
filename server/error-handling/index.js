/**
 * Centralized Error Handling Middleware
 *
 * Provides consistent error responses, logging, and error classification.
 * Ensures users never see sensitive error details while developers get useful debugging info.
 */

const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging (server-side only)
  console.error('🚨 Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent')
  });

  // Determine error type and appropriate response
  let statusCode = 500;
  let errorType = 'InternalServerError';
  let userMessage = 'An unexpected error occurred. Please try again later.';

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'SQLITE_CANTOPEN') {
    statusCode = 503;
    errorType = 'DatabaseUnavailable';
    userMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
  }

  // SQLite constraint violations (foreign key, unique, etc.)
  else if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 400;
    errorType = 'DataValidationError';
    userMessage = 'The data provided violates database constraints. Please check your input.';
  }

  // Permission/authorization errors
  else if (err.message && err.message.includes('Unauthorized')) {
    statusCode = 403;
    errorType = 'Unauthorized';
    userMessage = 'You do not have permission to perform this action.';
  }

  // Authentication errors
  else if (err.message && err.message.includes('Authentication')) {
    statusCode = 401;
    errorType = 'AuthenticationError';
    userMessage = 'Authentication required. Please log in.';
  }

  // Validation errors
  else if (err.name === 'ValidationError' || err.message && err.message.includes('validation')) {
    statusCode = 400;
    errorType = 'ValidationError';
    userMessage = 'The provided data is invalid. Please check your input.';
  }

  // File upload errors
  else if (err.code === 'LIMIT_FILE_SIZE' || err.message && err.message.includes('file')) {
    statusCode = 400;
    errorType = 'FileUploadError';
    userMessage = 'File upload failed. Please check file size and type.';
  }

  // Rate limiting
  else if (err.message && err.message.includes('Too many requests')) {
    statusCode = 429;
    errorType = 'RateLimitExceeded';
    userMessage = 'Too many requests. Please wait before trying again.';
  }

  // Return consistent JSON error response
  res.status(statusCode).json({
    success: false,
    error: {
      type: errorType,
      message: userMessage,
      timestamp: new Date().toISOString()
    },
    // Include request ID for tracking (if available)
    requestId: req.requestId || null
  });
};

const setupErrorHandling = (app) => {
  // 404 handler - must be after all routes
  app.use((req, res, next) => {
    res.status(404).json({
      success: false,
      error: {
        type: 'NotFound',
        message: 'The requested resource was not found.',
        timestamp: new Date().toISOString()
      }
    });
  });

  // Global error handler - must be last
  app.use(errorHandler);

  console.log('✅ Error handling middleware configured');
};

module.exports = {
  errorHandler,
  setupErrorHandling
};
