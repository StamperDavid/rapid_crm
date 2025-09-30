/**
 * Lead and Deal Management Service
 * Handles the creation and management of leads and deals based on client interactions
 */

export interface LeadData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  needs: string;
  source: 'inbound' | 'outbound' | 'referral';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DealData {
  id?: string;
  leadId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  company?: string;
  services: string[];
  totalValue: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  includes: string[];
  isFree: boolean;
}

export class LeadDealService {
  private static instance: LeadDealService;
  private leads: Map<string, LeadData> = new Map();
  private deals: Map<string, DealData> = new Map();

  // Service packages available
  private servicePackages: ServicePackage[] = [
    {
      id: 'free_usdot',
      name: 'Free USDOT Registration',
      description: 'Basic USDOT number registration (free government service)',
      price: 0,
      includes: ['USDOT number registration', 'Basic compliance guidance', 'Biennial renewal reminders', 'Renewal management'],
      isFree: true
    },
    {
      id: 'usdot_mc_basic',
      name: 'USDOT + MC Number Package',
      description: 'USDOT and MC Number registration with basic compliance',
      price: 299,
      includes: ['USDOT number registration', 'MC Number registration', 'Basic compliance guidance', 'Account setup', 'Annual renewal management', 'Renewal reminders'],
      isFree: false
    },
    {
      id: 'full_compliance',
      name: 'Full Compliance Package',
      description: 'Complete compliance setup with ongoing monitoring',
      price: 599,
      includes: ['USDOT number registration', 'MC Number registration', 'State registrations', 'Compliance monitoring', 'Comprehensive renewal management', 'Auto-renewal setup', 'Renewal reminders', 'Dedicated support'],
      isFree: false
    }
  ];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): LeadDealService {
    if (!LeadDealService.instance) {
      LeadDealService.instance = new LeadDealService();
    }
    return LeadDealService.instance;
  }

  /**
   * Create a lead when client provides contact info but doesn't accept services
   */
  public createLead(leadData: Omit<LeadData, 'id' | 'status' | 'createdAt' | 'updatedAt'>): LeadData {
    const lead: LeadData = {
      ...leadData,
      id: this.generateId(),
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.leads.set(lead.id!, lead);
    this.saveToStorage();
    
    console.log(`✅ Lead created: ${lead.name} (${lead.email})`);
    return lead;
  }

  /**
   * Create a deal when client accepts any service
   */
  public createDeal(dealData: Omit<DealData, 'id' | 'status' | 'createdAt' | 'updatedAt'>): DealData {
    const deal: DealData = {
      ...dealData,
      id: this.generateId(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.deals.set(deal.id!, deal);
    this.saveToStorage();
    
    console.log(`✅ Deal created: ${deal.clientName} - $${deal.totalValue} (${deal.services.join(', ')})`);
    return deal;
  }

  /**
   * Convert a lead to a deal
   */
  public convertLeadToDeal(leadId: string, services: string[]): DealData | null {
    const lead = this.leads.get(leadId);
    if (!lead) {
      console.error(`❌ Lead not found: ${leadId}`);
      return null;
    }

    // Calculate total value
    const totalValue = this.calculateServiceValue(services);

    const deal: DealData = {
      id: this.generateId(),
      leadId: leadId,
      clientName: lead.name,
      clientEmail: lead.email,
      clientPhone: lead.phone,
      company: lead.company,
      services: services,
      totalValue: totalValue,
      status: 'pending',
      notes: `Converted from lead: ${lead.needs}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Update lead status
    lead.status = 'converted';
    lead.updatedAt = new Date();

    this.deals.set(deal.id!, deal);
    this.leads.set(leadId, lead);
    this.saveToStorage();

    console.log(`✅ Lead converted to deal: ${lead.name} - $${totalValue}`);
    return deal;
  }

  /**
   * Get all service packages
   */
  public getServicePackages(): ServicePackage[] {
    return this.servicePackages;
  }

  /**
   * Get service package by ID
   */
  public getServicePackage(id: string): ServicePackage | null {
    return this.servicePackages.find(pkg => pkg.id === id) || null;
  }

  /**
   * Calculate total value for services
   */
  public calculateServiceValue(serviceIds: string[]): number {
    return serviceIds.reduce((total, serviceId) => {
      const service = this.getServicePackage(serviceId);
      return total + (service?.price || 0);
    }, 0);
  }

  /**
   * Get all leads
   */
  public getLeads(): LeadData[] {
    return Array.from(this.leads.values());
  }

  /**
   * Get all deals
   */
  public getDeals(): DealData[] {
    return Array.from(this.deals.values());
  }

  /**
   * Get lead by ID
   */
  public getLead(id: string): LeadData | null {
    return this.leads.get(id) || null;
  }

  /**
   * Get deal by ID
   */
  public getDeal(id: string): DealData | null {
    return this.deals.get(id) || null;
  }

  /**
   * Update lead status
   */
  public updateLeadStatus(id: string, status: LeadData['status']): boolean {
    const lead = this.leads.get(id);
    if (!lead) return false;

    lead.status = status;
    lead.updatedAt = new Date();
    this.leads.set(id, lead);
    this.saveToStorage();
    return true;
  }

  /**
   * Update deal status
   */
  public updateDealStatus(id: string, status: DealData['status']): boolean {
    const deal = this.deals.get(id);
    if (!deal) return false;

    deal.status = status;
    deal.updatedAt = new Date();
    this.deals.set(id, deal);
    this.saveToStorage();
    return true;
  }

  /**
   * Get leads by status
   */
  public getLeadsByStatus(status: LeadData['status']): LeadData[] {
    return this.getLeads().filter(lead => lead.status === status);
  }

  /**
   * Get deals by status
   */
  public getDealsByStatus(status: DealData['status']): DealData[] {
    return this.getDeals().filter(deal => deal.status === status);
  }

  /**
   * Get conversion statistics
   */
  public getConversionStats(): {
    totalLeads: number;
    totalDeals: number;
    conversionRate: number;
    totalRevenue: number;
  } {
    const leads = this.getLeads();
    const deals = this.getDeals();
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
    
    return {
      totalLeads: leads.length,
      totalDeals: deals.length,
      conversionRate: leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0,
      totalRevenue: deals.reduce((total, deal) => total + deal.totalValue, 0)
    };
  }

  private generateId(): string {
    return `ld_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('rapid_crm_leads', JSON.stringify(Array.from(this.leads.entries())));
      localStorage.setItem('rapid_crm_deals', JSON.stringify(Array.from(this.deals.entries())));
    } catch (error) {
      console.error('Failed to save leads/deals to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const leadsData = localStorage.getItem('rapid_crm_leads');
      const dealsData = localStorage.getItem('rapid_crm_deals');

      if (leadsData) {
        const leadsArray = JSON.parse(leadsData);
        this.leads = new Map(leadsArray);
      }

      if (dealsData) {
        const dealsArray = JSON.parse(dealsData);
        this.deals = new Map(dealsArray);
      }
    } catch (error) {
      console.error('Failed to load leads/deals from storage:', error);
    }
  }
}

export default LeadDealService;
