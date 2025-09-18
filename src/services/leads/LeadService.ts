import { Lead } from '../../types/schema';
// Using direct database connection - no separate repository

export class LeadService {
  private leadRepository: LeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  // CRUD Operations
  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const lead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Calculate initial lead score
    lead.leadScore = this.calculateLeadScore(lead);

    return await this.leadRepository.create(lead);
  }

  async getLead(id: string): Promise<Lead | null> {
    return await this.leadRepository.findById(id);
  }

  async getAllLeads(): Promise<Lead[]> {
    return await this.leadRepository.findAll();
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    const existingLead = await this.leadRepository.findById(id);
    if (!existingLead) {
      return null;
    }

    const updatedLead = {
      ...existingLead,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Recalculate lead score if relevant fields changed
    if (this.shouldRecalculateScore(updates)) {
      updatedLead.leadScore = this.calculateLeadScore(updatedLead);
    }

    return await this.leadRepository.update(id, updatedLead);
  }

  async deleteLead(id: string): Promise<boolean> {
    return await this.leadRepository.delete(id);
  }

  // Lead Scoring Algorithm
  private calculateLeadScore(lead: Lead): number {
    let score = 0;

    // Basic Information (20 points)
    if (lead.firstName && lead.lastName) score += 5;
    if (lead.email) score += 5;
    if (lead.phone) score += 5;
    if (lead.company) score += 5;

    // Lead Source (15 points)
    const sourceScores: Record<string, number> = {
      'Referral': 15,
      'Trade Show': 12,
      'Website': 10,
      'LinkedIn': 8,
      'Email Campaign': 6,
      'Google Ads': 5,
      'Facebook Ads': 4,
      'Social Media': 3,
      'Cold Call': 2,
      'Other': 1
    };
    score += sourceScores[lead.leadSource] || 0;

    // Transportation-Specific (25 points)
    if (lead.businessType) score += 5;
    if (lead.fleetSize) score += 5;
    if (lead.operatingStates && lead.operatingStates.length > 0) score += 5;
    if (lead.cargoTypes && lead.cargoTypes.length > 0) score += 5;
    if (lead.hasUSDOT) score += 5;

    // Qualification (20 points)
    if (lead.budget) {
      const budgetScores: Record<string, number> = {
        'Over $500K': 10,
        '$100K-$500K': 8,
        '$50K-$100K': 6,
        '$10K-$50K': 4,
        'Under $10K': 2,
        'Unknown': 0
      };
      score += budgetScores[lead.budget] || 0;
    }

    if (lead.timeline) {
      const timelineScores: Record<string, number> = {
        'Immediate': 10,
        '1-3 Months': 8,
        '3-6 Months': 6,
        '6-12 Months': 4,
        'Over 1 Year': 2,
        'Unknown': 0
      };
      score += timelineScores[lead.timeline] || 0;
    }

    if (lead.decisionMaker) score += 5;

    // Engagement (20 points)
    if (lead.painPoints && lead.painPoints.length > 0) score += 5;
    if (lead.interests && lead.interests.length > 0) score += 5;
    if (lead.notes && lead.notes.length > 20) score += 5;
    if (lead.lastContactDate) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  private shouldRecalculateScore(updates: Partial<Lead>): boolean {
    const scoreAffectingFields = [
      'leadSource', 'businessType', 'fleetSize', 'operatingStates', 'cargoTypes',
      'hasUSDOT', 'budget', 'timeline', 'decisionMaker', 'painPoints', 'interests',
      'notes', 'lastContactDate'
    ];
    
    return Object.keys(updates).some(key => scoreAffectingFields.includes(key));
  }

  // Lead Management Operations
  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return await this.leadRepository.getLeadsByStatus(status);
  }

  async getLeadsBySource(source: string): Promise<Lead[]> {
    return await this.leadRepository.getLeadsBySource(source);
  }

  async getLeadsByAssignedUser(userId: string): Promise<Lead[]> {
    return await this.leadRepository.getLeadsByAssignedUser(userId);
  }

  async getLeadsNeedingFollowUp(): Promise<Lead[]> {
    return await this.leadRepository.getLeadsNeedingFollowUp();
  }

  async getHighScoringLeads(minScore: number = 70): Promise<Lead[]> {
    return await this.leadRepository.getHighScoringLeads(minScore);
  }

  async assignLead(leadId: string, userId: string): Promise<boolean> {
    const result = await this.updateLead(leadId, {
      assignedTo: userId,
      assignedDate: new Date().toISOString()
    });
    return result !== null;
  }

  async updateLeadStatus(leadId: string, status: string): Promise<boolean> {
    const result = await this.updateLead(leadId, { leadStatus: status as any });
    return result !== null;
  }

  async scheduleFollowUp(leadId: string, followUpDate: string): Promise<boolean> {
    const result = await this.updateLead(leadId, { nextFollowUpDate: followUpDate });
    return result !== null;
  }

  async recordContact(leadId: string, contactDate: string): Promise<boolean> {
    const result = await this.updateLead(leadId, { lastContactDate: contactDate });
    return result !== null;
  }

  // Conversion Operations
  async convertToContact(leadId: string, conversionValue?: number): Promise<boolean> {
    try {
      await this.leadRepository.convertToContact(leadId, conversionValue);
      await this.updateLead(leadId, { 
        leadStatus: 'Converted',
        convertedToContact: true,
        conversionDate: new Date().toISOString(),
        conversionValue
      });
      return true;
    } catch (error) {
      console.error('Error converting lead to contact:', error);
      return false;
    }
  }

  async convertToDeal(leadId: string, conversionValue?: number): Promise<boolean> {
    try {
      await this.leadRepository.convertToDeal(leadId, conversionValue);
      await this.updateLead(leadId, { 
        leadStatus: 'Converted',
        convertedToDeal: true,
        conversionDate: new Date().toISOString(),
        conversionValue
      });
      return true;
    } catch (error) {
      console.error('Error converting lead to deal:', error);
      return false;
    }
  }

  // Analytics
  async getLeadStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    averageScore: number;
    conversionRate: number;
  }> {
    return await this.leadRepository.getLeadStats();
  }

  // Search and Filter
  async searchLeads(query: string): Promise<Lead[]> {
    const allLeads = await this.getAllLeads();
    const searchTerm = query.toLowerCase();
    
    return allLeads.filter(lead => 
      lead.firstName.toLowerCase().includes(searchTerm) ||
      lead.lastName.toLowerCase().includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm) ||
      lead.company?.toLowerCase().includes(searchTerm) ||
      lead.phone.includes(searchTerm)
    );
  }

  async filterLeads(filters: {
    status?: string;
    source?: string;
    assignedTo?: string;
    minScore?: number;
    maxScore?: number;
    businessType?: string;
    hasFollowUp?: boolean;
  }): Promise<Lead[]> {
    let leads = await this.getAllLeads();

    if (filters.status) {
      leads = leads.filter(lead => lead.leadStatus === filters.status);
    }

    if (filters.source) {
      leads = leads.filter(lead => lead.leadSource === filters.source);
    }

    if (filters.assignedTo) {
      leads = leads.filter(lead => lead.assignedTo === filters.assignedTo);
    }

    if (filters.minScore !== undefined) {
      leads = leads.filter(lead => lead.leadScore >= filters.minScore!);
    }

    if (filters.maxScore !== undefined) {
      leads = leads.filter(lead => lead.leadScore <= filters.maxScore!);
    }

    if (filters.businessType) {
      leads = leads.filter(lead => lead.businessType === filters.businessType);
    }

    if (filters.hasFollowUp) {
      leads = leads.filter(lead => lead.nextFollowUpDate);
    }

    return leads;
  }
}

export const leadService = new LeadService();
