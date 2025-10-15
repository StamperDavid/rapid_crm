/**
 * Google OAuth Service for Client Authentication
 * Handles Google OAuth login for transportation compliance clients
 */

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  verified_email: boolean;
}

export interface ClientAccount {
  id: string;
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  phone?: string;
  role: 'client';
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

export class GoogleOAuthService {
  private static instance: GoogleOAuthService;
  private API_BASE = import.meta.env.DEV ? '/api' : 'http://localhost:3001/api';

  constructor() {}

  public static getInstance(): GoogleOAuthService {
    if (!GoogleOAuthService.instance) {
      GoogleOAuthService.instance = new GoogleOAuthService();
    }
    return GoogleOAuthService.instance;
  }

  /**
   * Get Google OAuth configuration from API keys
   */
  public async getOAuthConfig(): Promise<{ clientId: string; clientSecret: string } | null> {
    try {
      const response = await fetch(`${this.API_BASE}/api-keys`);
      if (!response.ok) {
        throw new Error(`Failed to load API keys: ${response.status}`);
      }
      
      const apiKeys = await response.json();
      
      const clientIdKey = apiKeys.find((key: any) => 
        key.name.toLowerCase().includes('google oauth') && 
        key.name.toLowerCase().includes('client id')
      );
      const clientSecretKey = apiKeys.find((key: any) => 
        key.name.toLowerCase().includes('google oauth') && 
        key.name.toLowerCase().includes('client secret')
      );

      if (clientIdKey && clientSecretKey) {
        return {
          clientId: clientIdKey.key,
          clientSecret: clientSecretKey.key
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to load Google OAuth config:', error);
      return null;
    }
  }

  /**
   * Create or update client account from Google user data
   */
  public async createClientAccount(googleUser: GoogleUser): Promise<ClientAccount> {
    try {
      const clientData = {
        googleId: googleUser.id,
        email: googleUser.email,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        companyName: this.extractCompanyFromEmail(googleUser.email),
        role: 'client',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      const response = await fetch(`${this.API_BASE}/clients/oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create client account: ${response.status}`);
      }

      const clientAccount = await response.json();
      console.log('✅ Client account created/updated:', clientAccount.email);
      return clientAccount;

    } catch (error) {
      console.error('Failed to create client account:', error);
      throw error;
    }
  }

  /**
   * Extract potential company name from email domain
   */
  private extractCompanyFromEmail(email: string): string {
    const domain = email.split('@')[1];
    if (domain) {
      // Remove common domain extensions and capitalize
      const company = domain.split('.')[0];
      return company.charAt(0).toUpperCase() + company.slice(1);
    }
    return '';
  }

  /**
   * Generate Google OAuth URL
   */
  public async generateAuthUrl(): Promise<string> {
    const config = await this.getOAuthConfig();
    if (!config) {
      throw new Error('Google OAuth not configured');
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: `${window.location.origin}/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Handle OAuth callback and exchange code for user info
   */
  public async handleCallback(code: string): Promise<ClientAccount> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error(`OAuth callback failed: ${response.status}`);
      }

      const result = await response.json();
      return result.clientAccount;

    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  }

  /**
   * Check if client exists by Google ID
   */
  public async getClientByGoogleId(googleId: string): Promise<ClientAccount | null> {
    try {
      const response = await fetch(`${this.API_BASE}/clients/google/${googleId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to get client by Google ID:', error);
      return null;
    }
  }

  /**
   * Update client last login time
   */
  public async updateLastLogin(clientId: string): Promise<void> {
    try {
      await fetch(`${this.API_BASE}/clients/${clientId}/login`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to update last login:', error);
    }
  }
}

export const googleOAuthService = GoogleOAuthService.getInstance();


