export interface Contact {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  job_title?: string;
  department?: string;
  is_primary_contact: number;
  preferred_contact_method: string;
  position?: string;
  created_at: string;
  updated_at: string;
  companyName?: string; // Joined from companies table
}

export interface ContactFilters {
  search?: string;
  companyId?: string;
  isPrimary?: boolean;
  limit?: number;
  offset?: number;
}

export interface ContactStats {
  total: number;
  primary: number;
  byCompany: Record<string, number>;
  byDepartment: Record<string, number>;
}

export class ContactService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }

  async getContacts(filters: ContactFilters = {}): Promise<Contact[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.companyId) queryParams.append('companyId', filters.companyId);
      if (filters.isPrimary !== undefined) queryParams.append('isPrimary', filters.isPrimary.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());

      const response = await fetch(`${this.apiBaseUrl}/contacts?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw new Error('Failed to fetch contacts');
    }
  }

  async getContact(id: string): Promise<Contact | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/contacts/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch contact: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw new Error('Failed to fetch contact');
    }
  }

  async createContact(contact: Partial<Contact>): Promise<Contact> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
      });

      if (!response.ok) {
        throw new Error(`Failed to create contact: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating contact:', error);
      throw new Error('Failed to create contact');
    }
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update contact: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating contact:', error);
      throw new Error('Failed to update contact');
    }
  }

  async deleteContact(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/contacts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete contact: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw new Error('Failed to delete contact');
    }
  }

  async getContactStats(): Promise<ContactStats> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/contacts/stats`);
      if (!response.ok) {
        throw new Error(`Failed to fetch contact stats: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching contact stats:', error);
      throw new Error('Failed to fetch contact statistics');
    }
  }

}

export const contactService = new ContactService();
