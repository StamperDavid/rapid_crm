/**
 * Input Validation Middleware
 *
 * Provides centralized input validation and sanitization.
 * Prevents malicious input and ensures data consistency.
 */

const validator = require('validator');

// Sanitize string input
const sanitizeString = (str, options = {}) => {
  if (typeof str !== 'string') return str;

  let sanitized = str.trim();

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Apply length limits
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
};

// Validate email
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return validator.isEmail(email.trim());
};

// Validate phone number (basic)
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

// Validate required fields
const validateRequired = (value, fieldName) => {
  if (value === null || value === undefined || value === '') {
    throw new Error(`${fieldName} is required`);
  }
  return true;
};

// Comprehensive validation middleware
const validateCompanyData = (req, res, next) => {
  try {
    const data = req.body;

    // Required field validation
    validateRequired(data.legalBusinessName, 'Legal Business Name');
    validateRequired(data.businessType, 'Business Type');
    validateRequired(data.ein, 'EIN');

    // Email validation
    if (data.email && !validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    // Phone validation
    if (data.phone && !validatePhone(data.phone)) {
      throw new Error('Invalid phone number format');
    }

    // Sanitize string fields
    const stringFields = [
      'legalBusinessName', 'dbaName', 'physicalStreetAddress',
      'physicalCity', 'physicalState', 'mailingStreetAddress',
      'mailingCity', 'mailingState'
    ];

    stringFields.forEach(field => {
      if (data[field]) {
        data[field] = sanitizeString(data[field], { maxLength: 255 });
      }
    });

    // EIN validation (9 digits)
    if (data.ein) {
      const einCleaned = data.ein.replace(/\D/g, '');
      if (einCleaned.length !== 9) {
        throw new Error('EIN must be 9 digits');
      }
      data.ein = einCleaned;
    }

    req.body = data;
    next();
  } catch (error) {
    error.name = 'ValidationError';
    next(error);
  }
};

const validateContactData = (req, res, next) => {
  try {
    const data = req.body;

    // Required field validation
    validateRequired(data.firstName, 'First Name');
    validateRequired(data.lastName, 'Last Name');
    validateRequired(data.companyId, 'Company ID');

    // Email validation
    if (data.email && !validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    // Phone validation
    if (data.phone && !validatePhone(data.phone)) {
      throw new Error('Invalid phone number format');
    }

    // Sanitize string fields
    const stringFields = ['firstName', 'lastName', 'jobTitle', 'department', 'position'];
    stringFields.forEach(field => {
      if (data[field]) {
        data[field] = sanitizeString(data[field], { maxLength: 100 });
      }
    });

    req.body = data;
    next();
  } catch (error) {
    error.name = 'ValidationError';
    next(error);
  }
};

// Generic sanitization middleware (applies to all routes)
const sanitizeInput = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key], { maxLength: 100 });
      }
    });
  }

  // Sanitize body parameters (basic)
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeString(obj[key], { maxLength: 1000 });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };
    sanitizeObject(req.body);
  }

  next();
};

module.exports = {
  validateCompanyData,
  validateContactData,
  sanitizeInput,
  sanitizeString,
  validateEmail,
  validatePhone,
  validateRequired
};
