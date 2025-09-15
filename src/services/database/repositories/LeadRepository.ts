// @ts-nocheck
import { BaseRepository } from './BaseRepository';
import { Lead } from '../../../types/schema';

export class LeadRepository extends BaseRepository<Lead> {
  constructor() {
    super('leads');
  }

  // Convert database row to Lead object
  protected mapRowToEntity(row: any): Lead {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      jobTitle: row.job_title,
      campaignId: row.campaign_id,
      leadSource: row.lead_source,
      leadStatus: row.lead_status,
      leadScore: row.lead_score,
      businessType: row.business_type,
      fleetSize: row.fleet_size,
      operatingStates: row.operating_states ? JSON.parse(row.operating_states) : [],
      cargoTypes: row.cargo_types ? JSON.parse(row.cargo_types) : [],
      hasUSDOT: Boolean(row.has_usdot),
      usdotNumber: row.usdot_number,
      budget: row.budget,
      timeline: row.timeline,
      decisionMaker: Boolean(row.decision_maker),
      painPoints: row.pain_points ? JSON.parse(row.pain_points) : [],
      interests: row.interests ? JSON.parse(row.interests) : [],
      preferredContactMethod: row.preferred_contact_method,
      lastContactDate: row.last_contact_date,
      nextFollowUpDate: row.next_follow_up_date,
      notes: row.notes,
      convertedToContact: Boolean(row.converted_to_contact),
      convertedToDeal: Boolean(row.converted_to_deal),
      conversionDate: row.conversion_date,
      conversionValue: row.conversion_value,
      convertedContactId: row.converted_contact_id,
      convertedDealId: row.converted_deal_id,
      companyId: row.company_id,
      assignedTo: row.assigned_to,
      assignedDate: row.assigned_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Convert Lead object to database row
  protected mapEntityToRow(lead: Lead): any {
    return {
      id: lead.id,
      first_name: lead.firstName,
      last_name: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      job_title: lead.jobTitle,
      campaign_id: lead.campaignId,
      lead_source: lead.leadSource,
      lead_status: lead.leadStatus,
      lead_score: lead.leadScore,
      business_type: lead.businessType,
      fleet_size: lead.fleetSize,
      operating_states: lead.operatingStates ? JSON.stringify(lead.operatingStates) : null,
      cargo_types: lead.cargoTypes ? JSON.stringify(lead.cargoTypes) : null,
      has_usdot: lead.hasUSDOT ? 1 : 0,
      usdot_number: lead.usdotNumber,
      budget: lead.budget,
      timeline: lead.timeline,
      decision_maker: lead.decisionMaker ? 1 : 0,
      pain_points: lead.painPoints ? JSON.stringify(lead.painPoints) : null,
      interests: lead.interests ? JSON.stringify(lead.interests) : null,
      preferred_contact_method: lead.preferredContactMethod,
      last_contact_date: lead.lastContactDate,
      next_follow_up_date: lead.nextFollowUpDate,
      notes: lead.notes,
      converted_to_contact: lead.convertedToContact ? 1 : 0,
      converted_to_deal: lead.convertedToDeal ? 1 : 0,
      conversion_date: lead.conversionDate,
      conversion_value: lead.conversionValue,
      converted_contact_id: lead.convertedContactId,
      converted_deal_id: lead.convertedDealId,
      company_id: lead.companyId,
      assigned_to: lead.assignedTo,
      assigned_date: lead.assignedDate,
      created_at: lead.createdAt,
      updated_at: lead.updatedAt
    };
  }

  // Get leads by status
  async getLeadsByStatus(status: string): Promise<Lead[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE lead_status = ? ORDER BY created_at DESC`;
    const rows = await this.database.all(query, [status]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  // Get leads by source
  async getLeadsBySource(source: string): Promise<Lead[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE lead_source = ? ORDER BY created_at DESC`;
    const rows = await this.database.all(query, [source]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  // Get leads by assigned user
  async getLeadsByAssignedUser(userId: string): Promise<Lead[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE assigned_to = ? ORDER BY created_at DESC`;
    const rows = await this.database.all(query, [userId]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  // Get leads by campaign
  async getLeadsByCampaign(campaignId: string): Promise<Lead[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE campaign_id = ? ORDER BY created_at DESC`;
    const rows = await this.database.all(query, [campaignId]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  // Get leads by company
  async getLeadsByCompany(companyId: string): Promise<Lead[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE company_id = ? ORDER BY created_at DESC`;
    const rows = await this.database.all(query, [companyId]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  // Get leads needing follow-up
  async getLeadsNeedingFollowUp(): Promise<Lead[]> {
    const today = new Date().toISOString().split('T')[0];
    const query = `SELECT * FROM ${this.tableName} WHERE next_follow_up_date <= ? AND lead_status NOT IN ('Converted', 'Lost') ORDER BY next_follow_up_date ASC`;
    const rows = await this.database.all(query, [today]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  // Get high-scoring leads
  async getHighScoringLeads(minScore: number = 70): Promise<Lead[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE lead_score >= ? AND lead_status NOT IN ('Converted', 'Lost') ORDER BY lead_score DESC`;
    const rows = await this.database.all(query, [minScore]);
    return rows.map(row => this.mapRowToEntity(row));
  }

  // Update lead score
  async updateLeadScore(id: string, score: number): Promise<void> {
    const query = `UPDATE ${this.tableName} SET lead_score = ?, updated_at = ? WHERE id = ?`;
    await this.database.run(query, [score, new Date().toISOString(), id]);
  }

  // Convert lead to contact
  async convertToContact(id: string, conversionValue?: number): Promise<void> {
    const query = `UPDATE ${this.tableName} SET converted_to_contact = 1, conversion_date = ?, conversion_value = ?, updated_at = ? WHERE id = ?`;
    await this.database.run(query, [new Date().toISOString(), conversionValue || null, new Date().toISOString(), id]);
  }

  // Convert lead to deal
  async convertToDeal(id: string, conversionValue?: number): Promise<void> {
    const query = `UPDATE ${this.tableName} SET converted_to_deal = 1, conversion_date = ?, conversion_value = ?, updated_at = ? WHERE id = ?`;
    await this.database.run(query, [new Date().toISOString(), conversionValue || null, new Date().toISOString(), id]);
  }

  // Get lead statistics
  async getLeadStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    averageScore: number;
    conversionRate: number;
  }> {
    const totalQuery = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const statusQuery = `SELECT lead_status, COUNT(*) as count FROM ${this.tableName} GROUP BY lead_status`;
    const sourceQuery = `SELECT lead_source, COUNT(*) as count FROM ${this.tableName} GROUP BY lead_source`;
    const scoreQuery = `SELECT AVG(lead_score) as avg_score FROM ${this.tableName}`;
    const conversionQuery = `SELECT COUNT(*) as converted FROM ${this.tableName} WHERE converted_to_contact = 1 OR converted_to_deal = 1`;

    const [totalResult] = await this.database.all(totalQuery);
    const statusResults = await this.database.all(statusQuery);
    const sourceResults = await this.database.all(sourceQuery);
    const [scoreResult] = await this.database.all(scoreQuery);
    const [conversionResult] = await this.database.all(conversionQuery);

    const byStatus: Record<string, number> = {};
    statusResults.forEach((row: any) => {
      byStatus[row.lead_status] = row.count;
    });

    const bySource: Record<string, number> = {};
    sourceResults.forEach((row: any) => {
      bySource[row.lead_source] = row.count;
    });

    return {
      total: totalResult.total,
      byStatus,
      bySource,
      averageScore: scoreResult.avg_score || 0,
      conversionRate: totalResult.total > 0 ? (conversionResult.converted / totalResult.total) * 100 : 0
    };
  }
}
