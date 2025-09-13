import { Organization, Person, Vehicle, Driver, Deal, Invoice, Lead, Campaign, ApiKey, Service } from '../../types/schema';
import { getApiConfig, logApiConfig } from '../../config/api';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export class ApiService {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    const config = getApiConfig();
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.retryAttempts = config.retryAttempts;
    
    // Log configuration in development
    if (import.meta.env.DEV) {
      logApiConfig();
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    console.log(`[ApiService] Making ${options.method || 'GET'} request to: ${url}`);

    // Implement retry logic with exponential backoff
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, { 
          ...defaultOptions, 
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        console.log(`[ApiService] Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch (parseError) {
            console.warn(`[ApiService] Failed to parse error response as JSON:`, parseError);
          }
          
          const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
          console.error(`[ApiService] Request failed:`, {
            url,
            status: response.status,
            statusText: response.statusText,
            errorData,
            attempt
          });
          
          // Don't retry on client errors (4xx), only on server errors (5xx)
          if (response.status >= 400 && response.status < 500) {
            throw new ApiError(
              errorMessage,
              response.status,
              errorData.code
            );
          }
          
          // Retry on server errors
          if (attempt < this.retryAttempts) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            console.log(`[ApiService] Retrying in ${delay}ms (attempt ${attempt + 1}/${this.retryAttempts})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          throw new ApiError(
            errorMessage,
            response.status,
            errorData.code
          );
        }

        const data = await response.json();
        console.log(`[ApiService] Request successful:`, { 
          url, 
          dataLength: Array.isArray(data) ? data.length : 'single object',
          attempt 
        });
        
        return {
          data,
          success: true,
        };
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        
        // Handle timeout and network errors
        if (error instanceof Error && error.name === 'AbortError') {
          console.error(`[ApiService] Request timeout:`, { url, attempt });
          if (attempt < this.retryAttempts) {
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`[ApiService] Retrying after timeout in ${delay}ms (attempt ${attempt + 1}/${this.retryAttempts})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw new ApiError('Request timeout', 408, 'TIMEOUT');
        }
        
        console.error(`[ApiService] Network or parsing error:`, {
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          attempt
        });
        
        if (attempt < this.retryAttempts) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`[ApiService] Retrying after error in ${delay}ms (attempt ${attempt + 1}/${this.retryAttempts})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new ApiError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          0,
          'NETWORK_ERROR'
        );
      }
    }
    
    // This should never be reached, but TypeScript requires it
    throw new ApiError('Maximum retry attempts exceeded', 0, 'MAX_RETRIES');
  }

  // Companies
  async getCompanies(): Promise<Organization[]> {
    const response = await this.request<Organization[]>('/companies');
    return response.data;
  }

  async getCompany(id: string): Promise<Organization | null> {
    const response = await this.request<Organization>(`/companies/${id}`);
    return response.data;
  }

  async createCompany(company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const response = await this.request<Organization>('/companies', {
      method: 'POST',
      body: JSON.stringify(company),
    });
    return response.data;
  }

  async updateCompany(id: string, company: Partial<Organization>): Promise<Organization> {
    const response = await this.request<Organization>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(company),
    });
    return response.data;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const response = await this.request<{ deleted: boolean }>(`/companies/${id}`, {
      method: 'DELETE',
    });
    return response.data.deleted;
  }

  // Contacts
  async getContacts(): Promise<Person[]> {
    const response = await this.request<Person[]>('/contacts');
    return response.data;
  }

  async getContact(id: string): Promise<Person | null> {
    const response = await this.request<Person>(`/contacts/${id}`);
    return response.data;
  }

  async createContact(contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person> {
    const response = await this.request<Person>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
    return response.data;
  }

  async updateContact(id: string, contact: Partial<Person>): Promise<Person> {
    const response = await this.request<Person>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    });
    return response.data;
  }

  async deleteContact(id: string): Promise<boolean> {
    const response = await this.request<{ deleted: boolean }>(`/contacts/${id}`, {
      method: 'DELETE',
    });
    return response.data.deleted;
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    const response = await this.request<Vehicle[]>('/vehicles');
    return response.data;
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    const response = await this.request<Vehicle>(`/vehicles/${id}`);
    return response.data;
  }

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const response = await this.request<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
    return response.data;
  }

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const response = await this.request<Vehicle>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    });
    return response.data;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const response = await this.request<{ deleted: boolean }>(`/vehicles/${id}`, {
      method: 'DELETE',
    });
    return response.data.deleted;
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    const response = await this.request<Driver[]>('/drivers');
    return response.data;
  }

  async getDriver(id: string): Promise<Driver | null> {
    const response = await this.request<Driver>(`/drivers/${id}`);
    return response.data;
  }

  async createDriver(driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver> {
    const response = await this.request<Driver>('/drivers', {
      method: 'POST',
      body: JSON.stringify(driver),
    });
    return response.data;
  }

  async updateDriver(id: string, driver: Partial<Driver>): Promise<Driver> {
    const response = await this.request<Driver>(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driver),
    });
    return response.data;
  }

  async deleteDriver(id: string): Promise<boolean> {
    const response = await this.request<{ deleted: boolean }>(`/drivers/${id}`, {
      method: 'DELETE',
    });
    return response.data.deleted;
  }

  // Deals
  async getDeals(): Promise<Deal[]> {
    const response = await this.request<Deal[]>('/deals');
    return response.data;
  }

  async getDeal(id: string): Promise<Deal | null> {
    const response = await this.request<Deal>(`/deals/${id}`);
    return response.data;
  }

  async createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    const response = await this.request<Deal>('/deals', {
      method: 'POST',
      body: JSON.stringify(deal),
    });
    return response.data;
  }

  async updateDeal(id: string, deal: Partial<Deal>): Promise<Deal> {
    const response = await this.request<Deal>(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deal),
    });
    return response.data;
  }

  async deleteDeal(id: string): Promise<boolean> {
    const response = await this.request<{ deleted: boolean }>(`/deals/${id}`, {
      method: 'DELETE',
    });
    return response.data.deleted;
  }

  // Services
  async getServices(): Promise<Service[]> {
    const response = await this.request<Service[]>('/services');
    return response.data;
  }

  async getService(id: string): Promise<Service | null> {
    try {
      const response = await this.request<Service>(`/services/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const response = await this.request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(service),
    });
    return response.data;
  }

  async updateService(id: string, service: Partial<Service>): Promise<Service> {
    const response = await this.request<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    });
    return response.data;
  }

  async deleteService(id: string): Promise<boolean> {
    const response = await this.request<{ deleted: boolean }>(`/services/${id}`, {
      method: 'DELETE',
    });
    return response.data.deleted;
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const response = await this.request<Invoice[]>('/invoices');
    return response.data;
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    const response = await this.request<Invoice>(`/invoices/${id}`);
    return response.data;
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const response = await this.request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
    return response.data;
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    const response = await this.request<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice),
    });
    return response.data;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const response = await this.request<{ deleted: boolean }>(`/invoices/${id}`, {
      method: 'DELETE',
    });
    return response.data.deleted;
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    const response = await this.request<Lead[]>('/leads');
    return response.data;
  }

  async getLead(id: string): Promise<Lead | null> {
    const response = await this.request<Lead>(`/leads/${id}`);
    return response.data;
  }

  async createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const response = await this.request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
    return response.data;
  }

  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead> {
    const response = await this.request<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lead),
    });
    return response.data;
  }

  async deleteLead(id: string): Promise<boolean> {
    const response = await this.request<{ deleted: boolean }>(`/leads/${id}`, {
      method: 'DELETE',
    });
    return response.data.deleted;
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    const response = await this.request<Campaign[]>('/campaigns');
    return response.data;
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    const response = await this.request<Campaign>(`/campaigns/${id}`);
    return response.data;
  }

  async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    const response = await this.request<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
    return response.data;
  }

  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    const response = await this.request<Campaign>(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaign),
    });
    return response.data;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    const response = await this.request<{ deleted: boolean }>(`/campaigns/${id}`, {
      method: 'DELETE',
    });
    return response.data.deleted;
  }

  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    const response = await this.request<ApiKey[]>('/api/api-keys');
    return response.data;
  }

  async getApiKey(id: string): Promise<ApiKey | null> {
    const response = await this.request<ApiKey>(`/api/api-keys/${id}`);
    return response.data;
  }

  async createApiKey(apiKey: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiKey> {
    const response = await this.request<ApiKey>('/api/api-keys', {
      method: 'POST',
      body: JSON.stringify(apiKey),
    });
    return response.data;
  }

  async updateApiKey(id: string, apiKey: Partial<ApiKey>): Promise<ApiKey> {
    const response = await this.request<ApiKey>(`/api/api-keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiKey),
    });
    return response.data;
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const response = await this.request<{ deleted: boolean }>(`/api/api-keys/${id}`, {
      method: 'DELETE',
    });
    return response.data.deleted;
  }
}

// Export singleton instance
export const apiService = new ApiService();
