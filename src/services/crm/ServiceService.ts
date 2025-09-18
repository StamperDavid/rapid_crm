// @ts-nocheck
// Using direct database connection - no separate repository

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  estimated_duration: string;
  requirements: string; // JSON string
  deliverables: string; // JSON string
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface ServiceStats {
  total: number;
  active: number;
  byCategory: Record<string, number>;
  averagePrice: number;
  totalValue: number;
}

export class ServiceService extends BaseRepository {
  constructor() {
    super('services');
  }

  async getServices(filters: ServiceFilters = {}): Promise<Service[]> {
    try {
      let query = `
        SELECT * FROM services
        WHERE 1=1
      `;
      const params: any[] = [];

      if (filters.search) {
        query += ` AND (
          name LIKE ? OR 
          description LIKE ? OR 
          category LIKE ?
        )`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (filters.category) {
        query += ` AND category = ?`;
        params.push(filters.category);
      }

      if (filters.isActive !== undefined) {
        query += ` AND is_active = ?`;
        params.push(filters.isActive ? 1 : 0);
      }

      if (filters.minPrice !== undefined) {
        query += ` AND base_price >= ?`;
        params.push(filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query += ` AND base_price <= ?`;
        params.push(filters.maxPrice);
      }

      query += ` ORDER BY category, name`;

      if (filters.limit) {
        query += ` LIMIT ?`;
        params.push(filters.limit);
        if (filters.offset) {
          query += ` OFFSET ?`;
          params.push(filters.offset);
        }
      }

      const result = await this.query(query, params);
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching services:', error);
      throw new Error('Failed to fetch services');
    }
  }

  async getService(id: string): Promise<Service | null> {
    try {
      const query = 'SELECT * FROM services WHERE id = ?';
      const result = await this.query(query, [id]);
      return result.rows?.[0] || null;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw new Error('Failed to fetch service');
    }
  }

  async createService(service: Partial<Service>): Promise<Service> {
    try {
      const id = this.generateId();
      const now = new Date().toISOString();
      
      const fields = [
        'id', 'name', 'description', 'category', 'base_price', 'estimated_duration',
        'requirements', 'deliverables', 'is_active', 'created_at', 'updated_at'
      ];

      const values = [
        id,
        service.name || '',
        service.description || '',
        service.category || 'General',
        service.base_price || 0,
        service.estimated_duration || '1-2 business days',
        service.requirements || '[]',
        service.deliverables || '[]',
        service.is_active !== undefined ? service.is_active : 1,
        now,
        now
      ];

      const placeholders = fields.map(() => '?').join(', ');

      const query = `
        INSERT INTO services (${fields.join(', ')})
        VALUES (${placeholders})
      `;

      await this.query(query, values);
      const newService = await this.getService(id);
      
      if (!newService) {
        throw new Error('Failed to retrieve created service');
      }

      return newService;
    } catch (error) {
      console.error('Error creating service:', error);
      throw new Error('Failed to create service');
    }
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    try {
      const fields = Object.keys(updates).filter(key => key !== 'id');
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof Service]);

      const query = `
        UPDATE services 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.query(query, [...values, id]);
      const updatedService = await this.getService(id);
      
      if (!updatedService) {
        throw new Error('Failed to retrieve updated service');
      }

      return updatedService;
    } catch (error) {
      console.error('Error updating service:', error);
      throw new Error('Failed to update service');
    }
  }

  async deleteService(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM services WHERE id = ?';
      const result = await this.query(query, [id]);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw new Error('Failed to delete service');
    }
  }

  async getServiceStats(): Promise<ServiceStats> {
    try {
      const totalQuery = 'SELECT COUNT(*) as total FROM services';
      const activeQuery = 'SELECT COUNT(*) as active FROM services WHERE is_active = 1';
      const categoryQuery = 'SELECT category, COUNT(*) as count FROM services GROUP BY category';
      const priceQuery = 'SELECT AVG(base_price) as avg_price, SUM(base_price) as total_value FROM services WHERE is_active = 1';

      const [totalResult, activeResult, categoryResult, priceResult] = await Promise.all([
        this.query(totalQuery),
        this.query(activeQuery),
        this.query(categoryQuery),
        this.query(priceQuery)
      ]);

      const byCategory: Record<string, number> = {};
      categoryResult.rows?.forEach((row: any) => {
        byCategory[row.category] = row.count;
      });

      return {
        total: totalResult.rows?.[0]?.total || 0,
        active: activeResult.rows?.[0]?.active || 0,
        byCategory,
        averagePrice: priceResult.rows?.[0]?.avg_price || 0,
        totalValue: priceResult.rows?.[0]?.total_value || 0
      };
    } catch (error) {
      console.error('Error fetching service stats:', error);
      throw new Error('Failed to fetch service statistics');
    }
  }

  async getServicesByCategory(): Promise<Record<string, Service[]>> {
    try {
      const query = 'SELECT * FROM services WHERE is_active = 1 ORDER BY category, name';
      const result = await this.query(query);
      
      const servicesByCategory: Record<string, Service[]> = {};
      result.rows?.forEach((service: Service) => {
        if (!servicesByCategory[service.category]) {
          servicesByCategory[service.category] = [];
        }
        servicesByCategory[service.category].push(service);
      });

      return servicesByCategory;
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw new Error('Failed to fetch services by category');
    }
  }

  async toggleServiceStatus(id: string): Promise<Service> {
    try {
      const service = await this.getService(id);
      if (!service) {
        throw new Error('Service not found');
      }

      const newStatus = service.is_active === 1 ? 0 : 1;
      return await this.updateService(id, { is_active: newStatus });
    } catch (error) {
      console.error('Error toggling service status:', error);
      throw new Error('Failed to toggle service status');
    }
  }

  private generateId(): string {
    return `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const serviceService = new ServiceService();
