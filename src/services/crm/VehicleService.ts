// @ts-nocheck
// Using direct database connection - no separate repository

export interface Vehicle {
  id: string;
  company_id: string;
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  vehicle_type: string;
  gvwr: string;
  empty_weight?: string;
  fuel_type: string;
  registration_number?: string;
  registration_expiry?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
  last_inspection_date?: string;
  next_inspection_due?: string;
  last_maintenance_date?: string;
  next_maintenance_due?: string;
  has_hazmat_endorsement: string;
  status: string;
  current_driver_id?: string;
  created_at: string;
  updated_at: string;
  companyName?: string; // Joined from companies table
  driverName?: string; // Joined from drivers table
}

export interface VehicleFilters {
  search?: string;
  companyId?: string;
  vehicleType?: string;
  status?: string;
  hasHazmat?: boolean;
  limit?: number;
  offset?: number;
}

export interface VehicleStats {
  total: number;
  active: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byCompany: Record<string, number>;
  hazmatCount: number;
}

export class VehicleService extends BaseRepository {
  constructor() {
    super('vehicles');
  }

  async getVehicles(filters: VehicleFilters = {}): Promise<Vehicle[]> {
    try {
      let query = `
        SELECT v.*, 
               co.legal_business_name as companyName,
               d.full_name as driverName
        FROM vehicles v
        LEFT JOIN companies co ON v.company_id = co.id
        LEFT JOIN drivers d ON v.current_driver_id = d.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (filters.search) {
        query += ` AND (
          v.make LIKE ? OR 
          v.model LIKE ? OR 
          v.vin LIKE ? OR 
          v.license_plate LIKE ? OR
          co.legal_business_name LIKE ?
        )`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (filters.companyId) {
        query += ` AND v.company_id = ?`;
        params.push(filters.companyId);
      }

      if (filters.vehicleType) {
        query += ` AND v.vehicle_type = ?`;
        params.push(filters.vehicleType);
      }

      if (filters.status) {
        query += ` AND v.status = ?`;
        params.push(filters.status);
      }

      if (filters.hasHazmat !== undefined) {
        query += ` AND v.has_hazmat_endorsement = ?`;
        params.push(filters.hasHazmat ? 'Yes' : 'No');
      }

      query += ` ORDER BY v.make, v.model, v.year DESC`;

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
      console.error('Error fetching vehicles:', error);
      throw new Error('Failed to fetch vehicles');
    }
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    try {
      const query = `
        SELECT v.*, 
               co.legal_business_name as companyName,
               d.full_name as driverName
        FROM vehicles v
        LEFT JOIN companies co ON v.company_id = co.id
        LEFT JOIN drivers d ON v.current_driver_id = d.id
        WHERE v.id = ?
      `;
      const result = await this.query(query, [id]);
      return result.rows?.[0] || null;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw new Error('Failed to fetch vehicle');
    }
  }

  async createVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const id = this.generateId();
      const now = new Date().toISOString();
      
      const fields = [
        'id', 'company_id', 'vin', 'license_plate', 'make', 'model', 'year', 'color',
        'vehicle_type', 'gvwr', 'empty_weight', 'fuel_type', 'registration_number',
        'registration_expiry', 'insurance_provider', 'insurance_policy_number',
        'insurance_expiry', 'last_inspection_date', 'next_inspection_due',
        'last_maintenance_date', 'next_maintenance_due', 'has_hazmat_endorsement',
        'status', 'current_driver_id', 'created_at', 'updated_at'
      ];

      const values = [
        id,
        vehicle.company_id || '',
        vehicle.vin || '',
        vehicle.license_plate || '',
        vehicle.make || '',
        vehicle.model || '',
        vehicle.year || new Date().getFullYear(),
        vehicle.color || null,
        vehicle.vehicle_type || 'Truck',
        vehicle.gvwr || '',
        vehicle.empty_weight || null,
        vehicle.fuel_type || 'Diesel',
        vehicle.registration_number || null,
        vehicle.registration_expiry || null,
        vehicle.insurance_provider || null,
        vehicle.insurance_policy_number || null,
        vehicle.insurance_expiry || null,
        vehicle.last_inspection_date || null,
        vehicle.next_inspection_due || null,
        vehicle.last_maintenance_date || null,
        vehicle.next_maintenance_due || null,
        vehicle.has_hazmat_endorsement || 'No',
        vehicle.status || 'Active',
        vehicle.current_driver_id || null,
        now,
        now
      ];

      const placeholders = fields.map(() => '?').join(', ');

      const query = `
        INSERT INTO vehicles (${fields.join(', ')})
        VALUES (${placeholders})
      `;

      await this.query(query, values);
      const newVehicle = await this.getVehicle(id);
      
      if (!newVehicle) {
        throw new Error('Failed to retrieve created vehicle');
      }

      return newVehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw new Error('Failed to create vehicle');
    }
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const fields = Object.keys(updates).filter(key => 
        key !== 'id' && key !== 'companyName' && key !== 'driverName'
      );
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof Vehicle]);

      const query = `
        UPDATE vehicles 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.query(query, [...values, id]);
      const updatedVehicle = await this.getVehicle(id);
      
      if (!updatedVehicle) {
        throw new Error('Failed to retrieve updated vehicle');
      }

      return updatedVehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw new Error('Failed to update vehicle');
    }
  }

  async deleteVehicle(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM vehicles WHERE id = ?';
      const result = await this.query(query, [id]);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw new Error('Failed to delete vehicle');
    }
  }

  async getVehicleStats(): Promise<VehicleStats> {
    try {
      const totalQuery = 'SELECT COUNT(*) as total FROM vehicles';
      const activeQuery = 'SELECT COUNT(*) as active FROM vehicles WHERE status = "Active"';
      const hazmatQuery = 'SELECT COUNT(*) as hazmat FROM vehicles WHERE has_hazmat_endorsement = "Yes"';
      const typeQuery = 'SELECT vehicle_type, COUNT(*) as count FROM vehicles GROUP BY vehicle_type';
      const statusQuery = 'SELECT status, COUNT(*) as count FROM vehicles GROUP BY status';
      const companyQuery = `
        SELECT co.legal_business_name as company, COUNT(*) as count 
        FROM vehicles v 
        JOIN companies co ON v.company_id = co.id 
        GROUP BY co.legal_business_name
      `;

      const [totalResult, activeResult, hazmatResult, typeResult, statusResult, companyResult] = await Promise.all([
        this.query(totalQuery),
        this.query(activeQuery),
        this.query(hazmatQuery),
        this.query(typeQuery),
        this.query(statusQuery),
        this.query(companyQuery)
      ]);

      const byType: Record<string, number> = {};
      typeResult.rows?.forEach((row: any) => {
        byType[row.vehicle_type] = row.count;
      });

      const byStatus: Record<string, number> = {};
      statusResult.rows?.forEach((row: any) => {
        byStatus[row.status] = row.count;
      });

      const byCompany: Record<string, number> = {};
      companyResult.rows?.forEach((row: any) => {
        byCompany[row.company] = row.count;
      });

      return {
        total: totalResult.rows?.[0]?.total || 0,
        active: activeResult.rows?.[0]?.active || 0,
        byType,
        byStatus,
        byCompany,
        hazmatCount: hazmatResult.rows?.[0]?.hazmat || 0
      };
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      throw new Error('Failed to fetch vehicle statistics');
    }
  }

  async assignDriver(vehicleId: string, driverId: string): Promise<boolean> {
    try {
      const query = 'UPDATE vehicles SET current_driver_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      const result = await this.query(query, [driverId, vehicleId]);
      return result.changes > 0;
    } catch (error) {
      console.error('Error assigning driver to vehicle:', error);
      throw new Error('Failed to assign driver to vehicle');
    }
  }

  async unassignDriver(vehicleId: string): Promise<boolean> {
    try {
      const query = 'UPDATE vehicles SET current_driver_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      const result = await this.query(query, [vehicleId]);
      return result.changes > 0;
    } catch (error) {
      console.error('Error unassigning driver from vehicle:', error);
      throw new Error('Failed to unassign driver from vehicle');
    }
  }

  private generateId(): string {
    return `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const vehicleService = new VehicleService();
