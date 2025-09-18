// @ts-nocheck
// Using direct database connection - no separate repository

export interface Driver {
  id: string;
  company_id: string;
  full_name: string;
  address: string;
  phone: string;
  email: string;
  date_of_birth: string;
  social_security_number: string;
  employment_history: string;
  driving_experience?: string;
  accident_violations_history?: string;
  accident_violations_files?: string;
  mvr_files?: string;
  mvr_initial_date?: string;
  mvr_annual_date?: string;
  license_cdl_files?: string;
  license_number?: string;
  license_expiry?: string;
  endorsements?: string;
  restrictions?: string;
  dot_medical_certificate_expiry?: string;
  medical_examiner_name?: string;
  medical_certificate_number?: string;
  medical_examination_report_files?: string;
  road_test_certificate_files?: string;
  road_test_date?: string;
  drug_alcohol_test_results?: string;
  last_drug_test_date?: string;
  last_alcohol_test_date?: string;
  annual_violation_certification_files?: string;
  last_annual_certification_date?: string;
  safety_performance_history_files?: string;
  variances_waivers_files?: string;
  has_variances_waivers: string;
  work_authorization_files?: string;
  has_work_authorization: string;
  hire_date?: string;
  employment_status: string;
  position: string;
  created_at: string;
  updated_at: string;
  companyName?: string; // Joined from companies table
  currentVehicleId?: string; // From vehicles table
  currentVehicleInfo?: string; // Make, model, year from vehicles table
}

export interface DriverFilters {
  search?: string;
  companyId?: string;
  employmentStatus?: string;
  hasValidLicense?: boolean;
  hasValidMedical?: boolean;
  limit?: number;
  offset?: number;
}

export interface DriverStats {
  total: number;
  active: number;
  byStatus: Record<string, number>;
  byCompany: Record<string, number>;
  withValidLicense: number;
  withValidMedical: number;
  withHazmat: number;
}

export class DriverService extends BaseRepository {
  constructor() {
    super('drivers');
  }

  async getDrivers(filters: DriverFilters = {}): Promise<Driver[]> {
    try {
      let query = `
        SELECT d.*, 
               co.legal_business_name as companyName,
               v.id as currentVehicleId,
               v.make || ' ' || v.model || ' (' || v.year || ')' as currentVehicleInfo
        FROM drivers d
        LEFT JOIN companies co ON d.company_id = co.id
        LEFT JOIN vehicles v ON v.current_driver_id = d.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (filters.search) {
        query += ` AND (
          d.full_name LIKE ? OR 
          d.license_number LIKE ? OR 
          d.email LIKE ? OR 
          d.phone LIKE ? OR
          co.legal_business_name LIKE ?
        )`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (filters.companyId) {
        query += ` AND d.company_id = ?`;
        params.push(filters.companyId);
      }

      if (filters.employmentStatus) {
        query += ` AND d.employment_status = ?`;
        params.push(filters.employmentStatus);
      }

      if (filters.hasValidLicense !== undefined) {
        if (filters.hasValidLicense) {
          query += ` AND d.license_expiry > date('now')`;
        } else {
          query += ` AND (d.license_expiry IS NULL OR d.license_expiry <= date('now'))`;
        }
      }

      if (filters.hasValidMedical !== undefined) {
        if (filters.hasValidMedical) {
          query += ` AND d.dot_medical_certificate_expiry > date('now')`;
        } else {
          query += ` AND (d.dot_medical_certificate_expiry IS NULL OR d.dot_medical_certificate_expiry <= date('now'))`;
        }
      }

      query += ` ORDER BY d.full_name`;

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
      console.error('Error fetching drivers:', error);
      throw new Error('Failed to fetch drivers');
    }
  }

  async getDriver(id: string): Promise<Driver | null> {
    try {
      const query = `
        SELECT d.*, 
               co.legal_business_name as companyName,
               v.id as currentVehicleId,
               v.make || ' ' || v.model || ' (' || v.year || ')' as currentVehicleInfo
        FROM drivers d
        LEFT JOIN companies co ON d.company_id = co.id
        LEFT JOIN vehicles v ON v.current_driver_id = d.id
        WHERE d.id = ?
      `;
      const result = await this.query(query, [id]);
      return result.rows?.[0] || null;
    } catch (error) {
      console.error('Error fetching driver:', error);
      throw new Error('Failed to fetch driver');
    }
  }

  async createDriver(driver: Partial<Driver>): Promise<Driver> {
    try {
      const id = this.generateId();
      const now = new Date().toISOString();
      
      const fields = [
        'id', 'company_id', 'full_name', 'address', 'phone', 'email', 'date_of_birth',
        'social_security_number', 'employment_history', 'driving_experience',
        'accident_violations_history', 'accident_violations_files', 'mvr_files',
        'mvr_initial_date', 'mvr_annual_date', 'license_cdl_files', 'license_number',
        'license_expiry', 'endorsements', 'restrictions', 'dot_medical_certificate_expiry',
        'medical_examiner_name', 'medical_certificate_number', 'medical_examination_report_files',
        'road_test_certificate_files', 'road_test_date', 'drug_alcohol_test_results',
        'last_drug_test_date', 'last_alcohol_test_date', 'annual_violation_certification_files',
        'last_annual_certification_date', 'safety_performance_history_files',
        'variances_waivers_files', 'has_variances_waivers', 'work_authorization_files',
        'has_work_authorization', 'hire_date', 'employment_status', 'position',
        'created_at', 'updated_at'
      ];

      const values = [
        id,
        driver.company_id || '',
        driver.full_name || '',
        driver.address || '',
        driver.phone || '',
        driver.email || '',
        driver.date_of_birth || '',
        driver.social_security_number || '',
        driver.employment_history || '',
        driver.driving_experience || null,
        driver.accident_violations_history || null,
        driver.accident_violations_files || null,
        driver.mvr_files || null,
        driver.mvr_initial_date || null,
        driver.mvr_annual_date || null,
        driver.license_cdl_files || null,
        driver.license_number || null,
        driver.license_expiry || null,
        driver.endorsements || null,
        driver.restrictions || null,
        driver.dot_medical_certificate_expiry || null,
        driver.medical_examiner_name || null,
        driver.medical_certificate_number || null,
        driver.medical_examination_report_files || null,
        driver.road_test_certificate_files || null,
        driver.road_test_date || null,
        driver.drug_alcohol_test_results || null,
        driver.last_drug_test_date || null,
        driver.last_alcohol_test_date || null,
        driver.annual_violation_certification_files || null,
        driver.last_annual_certification_date || null,
        driver.safety_performance_history_files || null,
        driver.variances_waivers_files || null,
        driver.has_variances_waivers || 'No',
        driver.work_authorization_files || null,
        driver.has_work_authorization || 'No',
        driver.hire_date || null,
        driver.employment_status || 'Active',
        driver.position || 'Driver',
        now,
        now
      ];

      const placeholders = fields.map(() => '?').join(', ');

      const query = `
        INSERT INTO drivers (${fields.join(', ')})
        VALUES (${placeholders})
      `;

      await this.query(query, values);
      const newDriver = await this.getDriver(id);
      
      if (!newDriver) {
        throw new Error('Failed to retrieve created driver');
      }

      return newDriver;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw new Error('Failed to create driver');
    }
  }

  async updateDriver(id: string, updates: Partial<Driver>): Promise<Driver> {
    try {
      const fields = Object.keys(updates).filter(key => 
        key !== 'id' && key !== 'companyName' && key !== 'currentVehicleId' && key !== 'currentVehicleInfo'
      );
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof Driver]);

      const query = `
        UPDATE drivers 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.query(query, [...values, id]);
      const updatedDriver = await this.getDriver(id);
      
      if (!updatedDriver) {
        throw new Error('Failed to retrieve updated driver');
      }

      return updatedDriver;
    } catch (error) {
      console.error('Error updating driver:', error);
      throw new Error('Failed to update driver');
    }
  }

  async deleteDriver(id: string): Promise<boolean> {
    try {
      // First, unassign any vehicles from this driver
      await this.query('UPDATE vehicles SET current_driver_id = NULL WHERE current_driver_id = ?', [id]);
      
      // Then delete the driver
      const query = 'DELETE FROM drivers WHERE id = ?';
      const result = await this.query(query, [id]);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw new Error('Failed to delete driver');
    }
  }

  async getDriverStats(): Promise<DriverStats> {
    try {
      const totalQuery = 'SELECT COUNT(*) as total FROM drivers';
      const activeQuery = 'SELECT COUNT(*) as active FROM drivers WHERE employment_status = "Active"';
      const validLicenseQuery = 'SELECT COUNT(*) as valid FROM drivers WHERE license_expiry > date("now")';
      const validMedicalQuery = 'SELECT COUNT(*) as valid FROM drivers WHERE dot_medical_certificate_expiry > date("now")';
      const hazmatQuery = 'SELECT COUNT(*) as hazmat FROM drivers WHERE endorsements LIKE "%H%"';
      const statusQuery = 'SELECT employment_status, COUNT(*) as count FROM drivers GROUP BY employment_status';
      const companyQuery = `
        SELECT co.legal_business_name as company, COUNT(*) as count 
        FROM drivers d 
        JOIN companies co ON d.company_id = co.id 
        GROUP BY co.legal_business_name
      `;

      const [totalResult, activeResult, validLicenseResult, validMedicalResult, hazmatResult, statusResult, companyResult] = await Promise.all([
        this.query(totalQuery),
        this.query(activeQuery),
        this.query(validLicenseQuery),
        this.query(validMedicalQuery),
        this.query(hazmatQuery),
        this.query(statusQuery),
        this.query(companyQuery)
      ]);

      const byStatus: Record<string, number> = {};
      statusResult.rows?.forEach((row: any) => {
        byStatus[row.employment_status] = row.count;
      });

      const byCompany: Record<string, number> = {};
      companyResult.rows?.forEach((row: any) => {
        byCompany[row.company] = row.count;
      });

      return {
        total: totalResult.rows?.[0]?.total || 0,
        active: activeResult.rows?.[0]?.active || 0,
        byStatus,
        byCompany,
        withValidLicense: validLicenseResult.rows?.[0]?.valid || 0,
        withValidMedical: validMedicalResult.rows?.[0]?.valid || 0,
        withHazmat: hazmatResult.rows?.[0]?.hazmat || 0
      };
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      throw new Error('Failed to fetch driver statistics');
    }
  }

  async getDriversWithExpiringDocuments(days: number = 30): Promise<Driver[]> {
    try {
      const query = `
        SELECT d.*, co.legal_business_name as companyName
        FROM drivers d
        LEFT JOIN companies co ON d.company_id = co.id
        WHERE (
          d.license_expiry <= date('now', '+${days} days') OR
          d.dot_medical_certificate_expiry <= date('now', '+${days} days')
        )
        AND d.employment_status = 'Active'
        ORDER BY 
          CASE 
            WHEN d.license_expiry <= date('now', '+${days} days') THEN d.license_expiry
            ELSE d.dot_medical_certificate_expiry
          END
      `;
      
      const result = await this.query(query);
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching drivers with expiring documents:', error);
      throw new Error('Failed to fetch drivers with expiring documents');
    }
  }

  private generateId(): string {
    return `driver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const driverService = new DriverService();
