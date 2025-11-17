/**
 * EncryptionService - Secure encryption/decryption for sensitive data
 * 
 * Uses AES-256-GCM encryption with Node.js crypto module
 * For storing Login.gov credentials and other sensitive employee data
 */

import crypto from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  private saltKey = 'rapid-crm-encryption-salt-2025'; // Should be in env var in production
  
  constructor() {
    // Get encryption key from environment variable
    const secretKey = process.env.ENCRYPTION_SECRET_KEY;
    
    if (!secretKey) {
      // In development, use a default key
      // In production, this should throw an error
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ENCRYPTION_SECRET_KEY not set in environment variables');
      }
      
      console.warn('⚠️ Using default encryption key for development. DO NOT USE IN PRODUCTION!');
      const defaultKey = 'dev-encryption-key-do-not-use-in-production-minimum-32-chars';
      this.key = crypto.scryptSync(defaultKey, this.saltKey, 32);
    } else {
      // Generate 32-byte key from secret using scrypt
      this.key = crypto.scryptSync(secretKey, this.saltKey, 32);
    }
  }
  
  /**
   * Encrypt a plaintext string
   * @param text - The plaintext to encrypt
   * @returns Encrypted string in format: iv:authTag:encryptedData
   */
  encrypt(text: string): string {
    if (!text) {
      throw new Error('Cannot encrypt empty text');
    }
    
    try {
      // Generate random initialization vector (IV)
      const iv = crypto.randomBytes(16);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag (for AES-GCM)
      const authTag = cipher.getAuthTag();
      
      // Combine iv + authTag + encrypted data
      // Format: iv:authTag:encryptedData
      const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
      
      return result;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }
  
  /**
   * Decrypt an encrypted string
   * @param encryptedData - The encrypted string (format: iv:authTag:encryptedData)
   * @returns Decrypted plaintext
   */
  decrypt(encryptedData: string): string {
    if (!encryptedData) {
      throw new Error('Cannot decrypt empty data');
    }
    
    try {
      // Split the components
      const parts = encryptedData.split(':');
      
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data - data may be corrupted or key may be incorrect');
    }
  }
  
  /**
   * Hash a value (one-way, for PII audit trails)
   * @param value - The value to hash
   * @returns SHA-256 hash (first 16 characters)
   */
  hashPII(value: string): string {
    if (!value) {
      return '';
    }
    
    return crypto
      .createHash('sha256')
      .update(value)
      .digest('hex')
      .substring(0, 16);
  }
  
  /**
   * Generate a secure random token
   * @param length - Length of token in bytes (default 32)
   * @returns Hex string token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
  
  /**
   * Verify encryption service is working correctly
   * @returns True if encryption/decryption works
   */
  async testEncryption(): Promise<boolean> {
    try {
      const testData = 'test-encryption-data-' + Date.now();
      const encrypted = this.encrypt(testData);
      const decrypted = this.decrypt(encrypted);
      
      return testData === decrypted;
    } catch (error) {
      console.error('Encryption test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();

