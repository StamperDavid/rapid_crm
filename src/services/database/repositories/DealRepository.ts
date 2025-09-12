import { BaseRepository } from './BaseRepository';
import { DatabaseService } from '../DatabaseService';
import { Deal as SchemaDeal } from '../../../types/schema';

export interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  stage: 'prospect' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close_date?: string;
  actual_close_date?: string;
  company_id: string;
  contact_id?: string;
  owner_id: string;
  source: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'on_hold' | 'cancelled';
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface DealFilters {
  stage?: string;
  owner_id?: string;
  company_id?: string;
  status?: string;
  priority?: string;
  source?: string;
  min_value?: number;
  max_value?: number;
  expected_close_after?: string;
  expected_close_before?: string;
  tags?: string[];
}

export interface DealStats {
  total_value: number;
  total_count: number;
  won_value: number;
  won_count: number;
  lost_value: number;
  lost_count: number;
  active_value: number;
  active_count: number;
  by_stage: { stage: string; count: number; value: number }[];
  by_owner: { owner_id: string; owner_name: string; count: number; value: number }[];
  by_source: { source: string; count: number; value: number }[];
  conversion_rate: number;
  average_deal_size: number;
  sales_velocity: number;
}

export class DealRepository extends BaseRepository<Deal> {
  constructor(db: DatabaseService) {
    super(db, 'deals', 'id');
  }

  async findByStage(stage: string): Promise<Deal[]> {
    const query = 'SELECT * FROM deals WHERE stage = $1 AND status = $2 ORDER BY expected_close_date ASC';
    const result = await this.db.executeQuery<Deal>('primary', query, [stage, 'active']);
    return result.data;
  }

  async findByOwner(ownerId: string): Promise<Deal[]> {
    const query = 'SELECT * FROM deals WHERE owner_id = $1 AND status = $2 ORDER BY created_at DESC';
    const result = await this.db.executeQuery<Deal>('primary', query, [ownerId, 'active']);
    return result.data;
  }

  async findByCompany(companyId: string): Promise<Deal[]> {
    const query = 'SELECT * FROM deals WHERE company_id = $1 ORDER BY created_at DESC';
    const result = await this.db.executeQuery<Deal>('primary', query, [companyId]);
    return result.data;
  }

  async findActiveDeals(): Promise<Deal[]> {
    const query = 'SELECT * FROM deals WHERE status = $1 ORDER BY expected_close_date ASC';
    const result = await this.db.executeQuery<Deal>('primary', query, ['active']);
    return result.data;
  }

  async findWonDeals(): Promise<Deal[]> {
    const query = 'SELECT * FROM deals WHERE stage = $1 ORDER BY actual_close_date DESC';
    const result = await this.db.executeQuery<Deal>('primary', query, ['closed_won']);
    return result.data;
  }

  async findLostDeals(): Promise<Deal[]> {
    const query = 'SELECT * FROM deals WHERE stage = $1 ORDER BY actual_close_date DESC';
    const result = await this.db.executeQuery<Deal>('primary', query, ['closed_lost']);
    return result.data;
  }

  async findDealsClosingSoon(days: number = 30): Promise<Deal[]> {
    const query = `
      SELECT * FROM deals 
      WHERE status = $1 
      AND expected_close_date BETWEEN NOW() AND NOW() + INTERVAL '${days} days'
      ORDER BY expected_close_date ASC
    `;
    const result = await this.db.executeQuery<Deal>('primary', query, ['active']);
    return result.data;
  }

  async findOverdueDeals(): Promise<Deal[]> {
    const query = `
      SELECT * FROM deals 
      WHERE status = $1 
      AND expected_close_date < NOW()
      ORDER BY expected_close_date ASC
    `;
    const result = await this.db.executeQuery<Deal>('primary', query, ['active']);
    return result.data;
  }

  async searchDeals(searchTerm: string): Promise<Deal[]> {
    const searchFields = ['title', 'description'];
    return this.search(searchTerm, searchFields);
  }

  async getDealsWithFilters(filters: DealFilters): Promise<Deal[]> {
    let query = 'SELECT * FROM deals WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.stage) {
      query += ` AND stage = $${paramIndex}`;
      params.push(filters.stage);
      paramIndex++;
    }

    if (filters.owner_id) {
      query += ` AND owner_id = $${paramIndex}`;
      params.push(filters.owner_id);
      paramIndex++;
    }

    if (filters.company_id) {
      query += ` AND company_id = $${paramIndex}`;
      params.push(filters.company_id);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.priority) {
      query += ` AND priority = $${paramIndex}`;
      params.push(filters.priority);
      paramIndex++;
    }

    if (filters.source) {
      query += ` AND source = $${paramIndex}`;
      params.push(filters.source);
      paramIndex++;
    }

    if (filters.min_value !== undefined) {
      query += ` AND value >= $${paramIndex}`;
      params.push(filters.min_value);
      paramIndex++;
    }

    if (filters.max_value !== undefined) {
      query += ` AND value <= $${paramIndex}`;
      params.push(filters.max_value);
      paramIndex++;
    }

    if (filters.expected_close_after) {
      query += ` AND expected_close_date >= $${paramIndex}`;
      params.push(filters.expected_close_after);
      paramIndex++;
    }

    if (filters.expected_close_before) {
      query += ` AND expected_close_date <= $${paramIndex}`;
      params.push(filters.expected_close_before);
      paramIndex++;
    }

    if (filters.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map((_, index) => 
        `tags @> $${paramIndex + index}`
      ).join(' OR ');
      query += ` AND (${tagConditions})`;
      params.push(...filters.tags.map(tag => JSON.stringify([tag])));
      paramIndex += filters.tags.length;
    }

    query += ' ORDER BY expected_close_date ASC';

    const result = await this.db.executeQuery<Deal>('primary', query, params);
    return result.data;
  }

  async getDealStats(): Promise<DealStats> {
    // Get total stats
    const totalResult = await this.db.executeQuery<{ count: string; sum: string }>(
      'primary', 
      'SELECT COUNT(*) as count, SUM(value) as sum FROM deals'
    );
    const total_count = parseInt(totalResult.data[0]?.count || '0');
    const total_value = parseFloat(totalResult.data[0]?.sum || '0');

    // Get won stats
    const wonResult = await this.db.executeQuery<{ count: string; sum: string }>(
      'primary', 
      'SELECT COUNT(*) as count, SUM(value) as sum FROM deals WHERE stage = $1',
      ['closed_won']
    );
    const won_count = parseInt(wonResult.data[0]?.count || '0');
    const won_value = parseFloat(wonResult.data[0]?.sum || '0');

    // Get lost stats
    const lostResult = await this.db.executeQuery<{ count: string; sum: string }>(
      'primary', 
      'SELECT COUNT(*) as count, SUM(value) as sum FROM deals WHERE stage = $1',
      ['closed_lost']
    );
    const lost_count = parseInt(lostResult.data[0]?.count || '0');
    const lost_value = parseFloat(lostResult.data[0]?.sum || '0');

    // Get active stats
    const activeResult = await this.db.executeQuery<{ count: string; sum: string }>(
      'primary', 
      'SELECT COUNT(*) as count, SUM(value) as sum FROM deals WHERE status = $1',
      ['active']
    );
    const active_count = parseInt(activeResult.data[0]?.count || '0');
    const active_value = parseFloat(activeResult.data[0]?.sum || '0');

    // Get stage breakdown
    const stageResult = await this.db.executeQuery<{ stage: string; count: string; sum: string }>(
      'primary', 
      'SELECT stage, COUNT(*) as count, SUM(value) as sum FROM deals GROUP BY stage ORDER BY count DESC'
    );
    const by_stage = stageResult.data.map(row => ({
      stage: row.stage,
      count: parseInt(row.count),
      value: parseFloat(row.sum)
    }));

    // Get owner breakdown
    const ownerResult = await this.db.executeQuery<{ owner_id: string; owner_name: string; count: string; sum: string }>(
      'primary', 
      `SELECT d.owner_id, u.name as owner_name, COUNT(*) as count, SUM(d.value) as sum 
       FROM deals d 
       LEFT JOIN users u ON d.owner_id = u.id 
       GROUP BY d.owner_id, u.name 
       ORDER BY count DESC`
    );
    const by_owner = ownerResult.data.map(row => ({
      owner_id: row.owner_id,
      owner_name: row.owner_name || 'Unknown',
      count: parseInt(row.count),
      value: parseFloat(row.sum)
    }));

    // Get source breakdown
    const sourceResult = await this.db.executeQuery<{ source: string; count: string; sum: string }>(
      'primary', 
      'SELECT source, COUNT(*) as count, SUM(value) as sum FROM deals GROUP BY source ORDER BY count DESC'
    );
    const by_source = sourceResult.data.map(row => ({
      source: row.source,
      count: parseInt(row.count),
      value: parseFloat(row.sum)
    }));

    // Calculate derived metrics
    const total_closed = won_count + lost_count;
    const conversion_rate = total_closed > 0 ? (won_count / total_closed) * 100 : 0;
    const average_deal_size = total_count > 0 ? total_value / total_count : 0;
    
    // Calculate sales velocity (simplified)
    const sales_velocity = won_count > 0 ? won_value / won_count : 0;

    return {
      total_value: total_value,
      total_count: total_count,
      won_value: won_value,
      won_count: won_count,
      lost_value: lost_value,
      lost_count: lost_count,
      active_value: active_value,
      active_count: active_count,
      by_stage,
      by_owner,
      by_source,
      conversion_rate,
      average_deal_size,
      sales_velocity
    };
  }

  async updateStage(id: string, stage: Deal['stage']): Promise<Deal | null> {
    const updates: Partial<Deal> = { stage };
    
    // Set close date if deal is closed
    if (stage === 'closed_won' || stage === 'closed_lost') {
      updates.actual_close_date = new Date().toISOString();
    }

    return this.update(id, updates);
  }

  async updateValue(id: string, value: number): Promise<Deal | null> {
    return this.update(id, { value });
  }

  async updateProbability(id: string, probability: number): Promise<Deal | null> {
    return this.update(id, { probability });
  }

  async updateExpectedCloseDate(id: string, expectedCloseDate: string): Promise<Deal | null> {
    return this.update(id, { expected_close_date: expectedCloseDate });
  }

  async updateOwner(id: string, ownerId: string): Promise<Deal | null> {
    return this.update(id, { owner_id: ownerId });
  }

  async updateStatus(id: string, status: Deal['status']): Promise<Deal | null> {
    return this.update(id, { status });
  }

  async addTag(id: string, tag: string): Promise<Deal | null> {
    const deal = await this.findById(id);
    if (!deal) return null;

    const tags = [...(deal.tags || []), tag];
    return this.update(id, { tags });
  }

  async removeTag(id: string, tag: string): Promise<Deal | null> {
    const deal = await this.findById(id);
    if (!deal) return null;

    const tags = (deal.tags || []).filter(t => t !== tag);
    return this.update(id, { tags });
  }

  async updateCustomField(id: string, field: string, value: any): Promise<Deal | null> {
    const deal = await this.findById(id);
    if (!deal) return null;

    const customFields = { ...deal.custom_fields, [field]: value };
    return this.update(id, { custom_fields: customFields });
  }

  async getRecentDeals(limit: number = 10): Promise<Deal[]> {
    const query = 'SELECT * FROM deals ORDER BY created_at DESC LIMIT $1';
    const result = await this.db.executeQuery<Deal>('primary', query, [limit]);
    return result.data;
  }

  async getDealsByCreator(createdBy: string): Promise<Deal[]> {
    const query = 'SELECT * FROM deals WHERE created_by = $1 ORDER BY created_at DESC';
    const result = await this.db.executeQuery<Deal>('primary', query, [createdBy]);
    return result.data;
  }

  async getHighValueDeals(minValue: number = 100000): Promise<Deal[]> {
    const query = 'SELECT * FROM deals WHERE value >= $1 AND status = $2 ORDER BY value DESC';
    const result = await this.db.executeQuery<Deal>('primary', query, [minValue, 'active']);
    return result.data;
  }

  async getDealsByPriority(priority: Deal['priority']): Promise<Deal[]> {
    const query = 'SELECT * FROM deals WHERE priority = $1 AND status = $2 ORDER BY expected_close_date ASC';
    const result = await this.db.executeQuery<Deal>('primary', query, [priority, 'active']);
    return result.data;
  }
}
