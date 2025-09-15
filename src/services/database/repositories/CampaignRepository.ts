// @ts-nocheck
import { BaseRepository } from './BaseRepository';
import { Campaign } from '../../../types/schema';

export class CampaignRepository extends BaseRepository<Campaign> {
  constructor() {
    super('campaigns');
  }

  // Convert database row to Campaign object
  protected mapRowToEntity(row: any): Campaign {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      budget: row.budget,
      targetAudience: row.target_audience,
      goals: row.goals ? JSON.parse(row.goals) : [],
      metrics: row.metrics ? JSON.parse(row.metrics) : {
        totalLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
        costPerLead: 0,
        roi: 0
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Convert Campaign object to database row
  protected mapEntityToRow(campaign: Campaign): any {
    return {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      start_date: campaign.startDate,
      end_date: campaign.endDate,
      budget: campaign.budget,
      target_audience: campaign.targetAudience,
      goals: campaign.goals ? JSON.stringify(campaign.goals) : null,
      metrics: campaign.metrics ? JSON.stringify(campaign.metrics) : null,
      created_at: campaign.createdAt,
      updated_at: campaign.updatedAt
    };
  }

  // Get campaigns by status
  async getCampaignsByStatus(status: string): Promise<Campaign[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = ? ORDER BY start_date DESC`;
    const rows = await this.database.all(query, [status]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  // Get campaigns by type
  async getCampaignsByType(type: string): Promise<Campaign[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE type = ? ORDER BY start_date DESC`;
    const rows = await this.database.all(query, [type]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  // Get active campaigns
  async getActiveCampaigns(): Promise<Campaign[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = 'Active' ORDER BY start_date DESC`;
    const rows = await this.database.all(query);
    return rows.map(row => this.mapRowToEntity(row));
  }

  // Update campaign metrics
  async updateCampaignMetrics(id: string, metrics: Campaign['metrics']): Promise<void> {
    const query = `UPDATE ${this.tableName} SET metrics = ?, updated_at = ? WHERE id = ?`;
    await this.database.run(query, [JSON.stringify(metrics), new Date().toISOString(), id]);
  }

  // Get campaign statistics
  async getCampaignStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    totalBudget: number;
    averageROI: number;
  }> {
    const totalQuery = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const statusQuery = `SELECT status, COUNT(*) as count FROM ${this.tableName} GROUP BY status`;
    const typeQuery = `SELECT type, COUNT(*) as count FROM ${this.tableName} GROUP BY type`;
    const budgetQuery = `SELECT SUM(budget) as total_budget FROM ${this.tableName} WHERE budget IS NOT NULL`;
    const roiQuery = `SELECT AVG(JSON_EXTRACT(metrics, '$.roi')) as avg_roi FROM ${this.tableName} WHERE metrics IS NOT NULL`;

    const [totalResult] = await this.database.all(totalQuery);
    const statusResults = await this.database.all(statusQuery);
    const typeResults = await this.database.all(typeQuery);
    const [budgetResult] = await this.database.all(budgetQuery);
    const [roiResult] = await this.database.all(roiQuery);

    const byStatus: Record<string, number> = {};
    statusResults.forEach((row: any) => {
      byStatus[row.status] = row.count;
    });

    const byType: Record<string, number> = {};
    typeResults.forEach((row: any) => {
      byType[row.type] = row.count;
    });

    return {
      total: totalResult.total,
      byStatus,
      byType,
      totalBudget: budgetResult.total_budget || 0,
      averageROI: roiResult.avg_roi || 0
    };
  }
}
