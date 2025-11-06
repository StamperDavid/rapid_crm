/**
 * Client Portal Authentication Service
 * Handles client user authentication, session management, and password operations
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class ClientAuthService {
  constructor(db) {
    this.db = db;
    this.maxFailedAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  /**
   * Authenticate a client user
   * @param {string} email - Client email
   * @param {string} password - Plain text password
   * @param {string} ipAddress - Client IP address
   * @returns {Promise<Object>} Authentication result
   */
  async authenticate(email, password, ipAddress = '') {
    return new Promise((resolve, reject) => {
      // Get client user by email
      this.db.get(
        `SELECT * FROM client_users WHERE email = ? AND is_active = 1`,
        [email.toLowerCase()],
        async (err, user) => {
          if (err) {
            return reject(new Error('Database error'));
          }

          // User not found
          if (!user) {
            return resolve({
              success: false,
              error: 'Invalid email or password'
            });
          }

          // Check if account is locked
          if (user.locked_until) {
            const lockoutTime = new Date(user.locked_until).getTime();
            if (Date.now() < lockoutTime) {
              const minutesLeft = Math.ceil((lockoutTime - Date.now()) / 60000);
              return resolve({
                success: false,
                error: `Account is locked. Try again in ${minutesLeft} minutes.`
              });
            } else {
              // Lockout expired, reset failed attempts
              await this.resetFailedAttempts(user.id);
            }
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.password_hash);

          if (!isValidPassword) {
            // Increment failed attempts
            await this.incrementFailedAttempts(user.id);
            return resolve({
              success: false,
              error: 'Invalid email or password'
            });
          }

          // Password correct - reset failed attempts and create session
          await this.resetFailedAttempts(user.id);
          
          // Update last login
          await this.updateLastLogin(user.id, ipAddress);

          // Create session token
          const sessionToken = await this.createSession(user.id, ipAddress);

          // Get company data
          this.db.get(
            `SELECT * FROM companies WHERE id = ?`,
            [user.company_id],
            (err, company) => {
              if (err) {
                return reject(new Error('Error fetching company data'));
              }

              resolve({
                success: true,
                client: {
                  id: user.id,
                  companyId: user.company_id,
                  companyName: company?.legal_business_name || company?.legalBusinessName || 'Unknown',
                  firstName: user.first_name,
                  lastName: user.last_name,
                  email: user.email,
                  role: user.role,
                  permissions: {
                    canViewServices: user.can_view_services === 1,
                    canViewInvoices: user.can_view_invoices === 1,
                    canMakePayments: user.can_make_payments === 1,
                    canSubmitRequests: user.can_submit_requests === 1,
                    canViewDocuments: user.can_view_documents === 1
                  },
                  lastLogin: new Date().toISOString()
                },
                sessionToken
              });
            }
          );
        }
      );
    });
  }

  /**
   * Create a new client user
   * @param {Object} userData - User data
   * @returns {Promise<string>} User ID
   */
  async createUser(userData) {
    const {
      companyId,
      email,
      password,
      firstName,
      lastName,
      phone = '',
      role = 'client',
      contactId = null,
      createdBy = 'system'
    } = userData;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO client_users (
          id, company_id, contact_id, email, password_hash,
          first_name, last_name, phone, role, is_active, email_verified,
          can_view_services, can_view_invoices, can_make_payments, 
          can_submit_requests, can_view_documents,
          failed_login_attempts, created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 1, 1, 1, 1, 1, 0, ?, ?, ?)`,
        [
          userId, companyId, contactId, email.toLowerCase(), passwordHash,
          firstName, lastName, phone, role,
          now, now, createdBy
        ],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return reject(new Error('Email already exists'));
            }
            return reject(err);
          }
          resolve(userId);
        }
      );
    });
  }

  /**
   * Create a session for authenticated user
   * @param {string} userId - Client user ID
   * @param {string} ipAddress - IP address
   * @returns {Promise<string>} Session token
   */
  async createSession(userId, ipAddress = '') {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + this.sessionDuration).toISOString();
    const createdAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO client_user_sessions (
          id, client_user_id, session_token, ip_address, expires_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [sessionId, userId, sessionToken, ipAddress, expiresAt, createdAt],
        function(err) {
          if (err) {
            return reject(err);
          }
          resolve(sessionToken);
        }
      );
    });
  }

  /**
   * Validate session token
   * @param {string} token - Session token
   * @returns {Promise<Object|null>} User data or null
   */
  async validateSession(token) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT cu.*, cus.expires_at
         FROM client_users cu
         JOIN client_user_sessions cus ON cu.id = cus.client_user_id
         WHERE cus.session_token = ? AND cu.is_active = 1`,
        [token],
        (err, row) => {
          if (err) {
            return reject(err);
          }
          
          if (!row) {
            return resolve(null);
          }

          // Check if session expired
          const expiresAt = new Date(row.expires_at).getTime();
          if (Date.now() > expiresAt) {
            return resolve(null);
          }

          resolve({
            id: row.id,
            companyId: row.company_id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            role: row.role
          });
        }
      );
    });
  }

  /**
   * Increment failed login attempts
   */
  async incrementFailedAttempts(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE client_users 
         SET failed_login_attempts = failed_login_attempts + 1,
             locked_until = CASE 
               WHEN failed_login_attempts + 1 >= ? 
               THEN datetime('now', '+15 minutes')
               ELSE locked_until
             END,
             updated_at = datetime('now')
         WHERE id = ?`,
        [this.maxFailedAttempts, userId],
        function(err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  /**
   * Reset failed login attempts
   */
  async resetFailedAttempts(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE client_users 
         SET failed_login_attempts = 0,
             locked_until = NULL,
             updated_at = datetime('now')
         WHERE id = ?`,
        [userId],
        function(err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId, ipAddress) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE client_users 
         SET last_login = datetime('now'),
             last_login_ip = ?,
             updated_at = datetime('now')
         WHERE id = ?`,
        [ipAddress, userId],
        function(err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  /**
   * Change user password
   */
  async changePassword(userId, oldPassword, newPassword) {
    return new Promise(async (resolve, reject) => {
      // Get current user
      this.db.get(
        `SELECT password_hash FROM client_users WHERE id = ?`,
        [userId],
        async (err, user) => {
          if (err) return reject(err);
          if (!user) return reject(new Error('User not found'));

          // Verify old password
          const isValid = await bcrypt.compare(oldPassword, user.password_hash);
          if (!isValid) {
            return reject(new Error('Current password is incorrect'));
          }

          // Hash new password
          const newHash = await bcrypt.hash(newPassword, 10);

          // Update password
          this.db.run(
            `UPDATE client_users 
             SET password_hash = ?,
                 updated_at = datetime('now')
             WHERE id = ?`,
            [newHash, userId],
            function(err) {
              if (err) return reject(err);
              resolve();
            }
          );
        }
      );
    });
  }

  /**
   * Logout user (invalidate session)
   */
  async logout(sessionToken) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM client_user_sessions WHERE session_token = ?`,
        [sessionToken],
        function(err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
}

module.exports = ClientAuthService;




