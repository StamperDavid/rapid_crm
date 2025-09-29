/**
 * USDOT Credential Service
 * Manages USDOT and Login.gov credentials from the database
 */

export interface USDOTCredentials {
  loginGov: {
    username: string;
    password: string;
    mfaEnabled: boolean;
  };
}

export class USDOTCredentialService {
  private credentials: USDOTCredentials | null = null;
  private API_BASE = import.meta.env.DEV ? '/api' : 'http://localhost:3001/api';

  constructor() {
    this.loadCredentials();
  }

  /**
   * Load USDOT credentials from database
   */
  private async loadCredentials(): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/api-keys`);
      if (!response.ok) {
        throw new Error(`Failed to load API keys: ${response.status}`);
      }
      
      const apiKeys = await response.json();
      
      // Find USDOT/Login.gov credentials
      const usernameKey = apiKeys.find((key: any) => 
        key.name.toLowerCase().includes('login.gov') && 
        key.name.toLowerCase().includes('username')
      );
      const passwordKey = apiKeys.find((key: any) => 
        key.name.toLowerCase().includes('login.gov') && 
        key.name.toLowerCase().includes('password')
      );

      this.credentials = {
        loginGov: {
          username: usernameKey?.key || '',
          password: passwordKey?.key || '',
          mfaEnabled: true
        }
      };

      console.log('USDOT credentials loaded from database');
    } catch (error) {
      console.error('Failed to load USDOT credentials from database:', error);
      // Fallback to empty credentials
      this.credentials = {
        loginGov: {
          username: '',
          password: '',
          mfaEnabled: true
        }
      };
    }
  }

  /**
   * Get current credentials
   */
  getCredentials(): USDOTCredentials | null {
    return this.credentials;
  }

  /**
   * Refresh credentials from database
   */
  async refreshCredentials(): Promise<void> {
    await this.loadCredentials();
  }

  /**
   * Check if credentials are available
   */
  hasCredentials(): boolean {
    return this.credentials !== null && 
           this.credentials.loginGov.username !== '' && 
           this.credentials.loginGov.password !== '';
  }
}

// Export singleton instance
export const usdotCredentialService = new USDOTCredentialService();
