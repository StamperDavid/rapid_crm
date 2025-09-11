/**
 * Encryption Service for API Keys and sensitive data
 * Uses Web Crypto API for secure encryption/decryption
 */

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  salt: string;
}

export interface DecryptionResult {
  decryptedData: string;
}

export class EncryptionService {
  private static instance: EncryptionService;
  private masterKey: CryptoKey | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Initialize the encryption service with a master key
   */
  public async initialize(masterPassword: string): Promise<void> {
    try {
      // Derive key from master password
      this.masterKey = await this.deriveKey(masterPassword);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize encryption service:', error);
      throw new Error('Encryption initialization failed');
    }
  }

  /**
   * Check if the service is initialized
   */
  public isReady(): boolean {
    return this.isInitialized && this.masterKey !== null;
  }

  /**
   * Encrypt sensitive data
   */
  public async encrypt(data: string): Promise<EncryptionResult> {
    if (!this.isReady()) {
      throw new Error('Encryption service not initialized');
    }

    try {
      // Generate random IV and salt
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const salt = crypto.getRandomValues(new Uint8Array(16));

      // Convert data to ArrayBuffer
      const dataBuffer = new TextEncoder().encode(data);

      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        this.masterKey!,
        dataBuffer
      );

      // Convert to base64 strings for storage
      const encryptedData = this.arrayBufferToBase64(encryptedBuffer);
      const ivString = this.arrayBufferToBase64(iv.buffer);
      const saltString = this.arrayBufferToBase64(salt.buffer);

      return {
        encryptedData,
        iv: ivString,
        salt: saltString
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  public async decrypt(encryptionResult: EncryptionResult): Promise<DecryptionResult> {
    if (!this.isReady()) {
      throw new Error('Encryption service not initialized');
    }

    try {
      // Convert base64 strings back to ArrayBuffers
      const encryptedBuffer = this.base64ToArrayBuffer(encryptionResult.encryptedData);
      const iv = this.base64ToArrayBuffer(encryptionResult.iv);

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        this.masterKey!,
        encryptedBuffer
      );

      // Convert back to string
      const decryptedData = new TextDecoder().decode(decryptedBuffer);

      return { decryptedData };
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash a password using PBKDF2
   */
  public async hashPassword(password: string, salt?: Uint8Array): Promise<{ hash: string; salt: string }> {
    const saltToUse = salt || crypto.getRandomValues(new Uint8Array(16));
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltToUse,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );

    return {
      hash: this.arrayBufferToBase64(derivedBits),
      salt: this.arrayBufferToBase64(saltToUse.buffer)
    };
  }

  /**
   * Verify a password against a hash
   */
  public async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    try {
      const saltBuffer = new Uint8Array(this.base64ToArrayBuffer(salt));
      const { hash: computedHash } = await this.hashPassword(password, saltBuffer);
      return computedHash === hash;
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  /**
   * Generate a secure random API key
   */
  public generateApiKey(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    return Array.from(array, byte => chars[byte % chars.length]).join('');
  }

  /**
   * Generate a secure random token
   */
  public generateToken(): string {
    return this.generateApiKey(64);
  }

  /**
   * Derive encryption key from password
   */
  private async deriveKey(password: string): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('rapid-crm-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Clear sensitive data from memory
   */
  public clear(): void {
    this.masterKey = null;
    this.isInitialized = false;
  }
}

export const encryptionService = EncryptionService.getInstance();
