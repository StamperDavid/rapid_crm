import { BaseRepository } from './BaseRepository';
import { DatabaseService } from '../DatabaseService';

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website?: string;
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  status: 'active' | 'inactive' | 'prospect' | 'customer';
  usdot_number?: string;
  mc_number?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface CompanyFilters {
  status?: string;
  industry?: string;
  size?: string;
  state?: string;
  has_usdot?: boolean;
  created_after?: string;
  created_before?: string;
}

export class CompanyRepository extends BaseRepository<Company> {
  constructor(db: DatabaseService) {
    super(db, 'companies', 'id');
  }

  async findByUSDOTNumber(usdotNumber: string): Promise<Company | null> {
    const query = 'SELECT * FROM companies WHERE usdot_number = $1';
    const result = await this.db.executeQuery<Company>('primary', query, [usdotNumber]);
    return result.data[0] || null;
  }

  async findByMCNumber(mcNumber: string): Promise<Company | null> {
    const query = 'SELECT * FROM companies WHERE mc_number = $1';
    const result = await this.db.executeQuery<Company>('primary', query, [mcNumber]);
    return result.data[0] || null;
  }

  async findByIndustry(industry: string): Promise<Company[]> {
    const query = 'SELECT * FROM companies WHERE industry = $1 ORDER BY name';
    const result = await this.db.executeQuery<Company>('primary', query, [industry]);
    return result.data;
  }

  async findByState(state: string): Promise<Company[]> {
    const query = 'SELECT * FROM companies WHERE state = $1 ORDER BY name';
    const result = await this.db.executeQuery<Company>('primary', query, [state]);
    return result.data;
  }

  async findActiveCompanies(): Promise<Company[]> {
    const query = 'SELECT * FROM companies WHERE status = $1 ORDER BY name';
    const result = await this.db.executeQuery<Company>('primary', query, ['active']);
    return result.data;
  }

  async findProspects(): Promise<Company[]> {
    const query = 'SELECT * FROM companies WHERE status = $1 ORDER BY created_at DESC';
    const result = await this.db.executeQuery<Company>('primary', query, ['prospect']);
    return result.data;
  }

  async findCustomers(): Promise<Company[]> {
    const query = 'SELECT * FROM companies WHERE status = $1 ORDER BY name';
    const result = await this.db.executeQuery<Company>('primary', query, ['customer']);
    return result.data;
  }

  async searchCompanies(searchTerm: string): Promise<Company[]> {
    const searchFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'usdot_number', 'mc_number'];
    return this.search(searchTerm, searchFields);
  }

  async getCompaniesWithFilters(filters: CompanyFilters): Promise<Company[]> {
    let query = 'SELECT * FROM companies WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.industry) {
      query += ` AND industry = $${paramIndex}`;
      params.push(filters.industry);
      paramIndex++;
    }

    if (filters.size) {
      query += ` AND size = $${paramIndex}`;
      params.push(filters.size);
      paramIndex++;
    }

    if (filters.state) {
      query += ` AND state = $${paramIndex}`;
      params.push(filters.state);
      paramIndex++;
    }

    if (filters.has_usdot !== undefined) {
      if (filters.has_usdot) {
        query += ` AND usdot_number IS NOT NULL AND usdot_number != ''`;
      } else {
        query += ` AND (usdot_number IS NULL OR usdot_number = '')`;
      }
    }

    if (filters.created_after) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(filters.created_after);
      paramIndex++;
    }

    if (filters.created_before) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(filters.created_before);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.db.executeQuery<Company>('primary', query, params);
    return result.data;
  }

  async getCompanyStats(): Promise<{
    total: number;
    active: number;
    prospects: number;
    customers: number;
    with_usdot: number;
    by_industry: { industry: string; count: number }[];
    by_state: { state: string; count: number }[];
  }> {
    // Get total count
    const totalResult = await this.db.executeQuery<{ count: string }>('primary', 'SELECT COUNT(*) as count FROM companies');
    const total = parseInt(totalResult.data[0]?.count || '0');

    // Get status counts
    const statusResult = await this.db.executeQuery<{ status: string; count: string }>(
      'primary', 
      'SELECT status, COUNT(*) as count FROM companies GROUP BY status'
    );
    
    const statusCounts = statusResult.data.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    // Get USDOT count
    const usdotResult = await this.db.executeQuery<{ count: string }>(
      'primary', 
      'SELECT COUNT(*) as count FROM companies WHERE usdot_number IS NOT NULL AND usdot_number != \'\''
    );
    const with_usdot = parseInt(usdotResult.data[0]?.count || '0');

    // Get industry breakdown
    const industryResult = await this.db.executeQuery<{ industry: string; count: string }>(
      'primary', 
      'SELECT industry, COUNT(*) as count FROM companies GROUP BY industry ORDER BY count DESC'
    );
    const by_industry = industryResult.data.map(row => ({
      industry: row.industry,
      count: parseInt(row.count)
    }));

    // Get state breakdown
    const stateResult = await this.db.executeQuery<{ state: string; count: string }>(
      'primary', 
      'SELECT state, COUNT(*) as count FROM companies GROUP BY state ORDER BY count DESC'
    );
    const by_state = stateResult.data.map(row => ({
      state: row.state,
      count: parseInt(row.count)
    }));

    return {
      total,
      active: statusCounts.active || 0,
      prospects: statusCounts.prospect || 0,
      customers: statusCounts.customer || 0,
      with_usdot,
      by_industry,
      by_state
    };
  }

  async updateUSDOTNumber(id: string, usdotNumber: string): Promise<Company | null> {
    return this.update(id, { usdot_number: usdotNumber });
  }

  async updateMCNumber(id: string, mcNumber: string): Promise<Company | null> {
    return this.update(id, { mc_number: mcNumber });
  }

  async updateStatus(id: string, status: Company['status']): Promise<Company | null> {
    return this.update(id, { status });
  }

  async getRecentCompanies(limit: number = 10): Promise<Company[]> {
    const query = 'SELECT * FROM companies ORDER BY created_at DESC LIMIT $1';
    const result = await this.db.executeQuery<Company>('primary', query, [limit]);
    return result.data;
  }

  async getCompaniesByUser(userId: string): Promise<Company[]> {
    const query = 'SELECT * FROM companies WHERE created_by = $1 ORDER BY created_at DESC';
    const result = await this.db.executeQuery<Company>('primary', query, [userId]);
    return result.data;
  }
}
