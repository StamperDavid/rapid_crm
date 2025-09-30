/**
 * Alex Integration Service
 * Handles the integration between Alex agent and CRM system for lead/deal management
 */

import { useCRM } from '../contexts/CRMContext';

export interface AlexClientData {
  name: string;
  email: string;
  phone: string;
  needs: string;
  source?: 'inbound' | 'outbound' | 'referral';
  company?: string;
}

export interface AlexServiceData {
  name: string;
  email: string;
  phone: string;
  services: string[];
  company?: string;
}

export class AlexIntegrationService {
  private static instance: AlexIntegrationService;
  private crmContext: any = null;

  private constructor() {}

  public static getInstance(): AlexIntegrationService {
    if (!AlexIntegrationService.instance) {
      AlexIntegrationService.instance = new AlexIntegrationService();
    }
    return AlexIntegrationService.instance;
  }

  /**
   * Initialize the service with CRM context
   */
  public initialize(crmContext: any): void {
    this.crmContext = crmContext;
  }

  /**
   * Handle client interaction - determines if lead or deal should be created
   */
  public async handleClientInteraction(
    clientData: AlexClientData,
    acceptedServices?: string[]
  ): Promise<{ type: 'lead' | 'deal'; id: string; data: any }> {
    if (!this.crmContext) {
      throw new Error('AlexIntegrationService not initialized with CRM context');
    }

    try {
      if (acceptedServices && acceptedServices.length > 0) {
        // Client accepted services - create deal
        const deal = await this.crmContext.createDealFromService({
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          services: acceptedServices,
          company: clientData.company
        });

        console.log(`✅ Alex created DEAL for ${clientData.name}: ${acceptedServices.join(', ')}`);
        return { type: 'deal', id: deal.id, data: deal };
      } else {
        // Client provided contact info but didn't accept services - create lead
        const lead = await this.crmContext.createLeadFromClient({
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          needs: clientData.needs,
          source: clientData.source || 'inbound'
        });

        console.log(`✅ Alex created LEAD for ${clientData.name}: ${clientData.needs}`);
        return { type: 'lead', id: lead.id, data: lead };
      }
    } catch (error) {
      console.error('❌ Alex failed to handle client interaction:', error);
      throw error;
    }
  }

  /**
   * Convert an existing lead to a deal when client accepts services later
   */
  public async convertLeadToDeal(leadId: string, services: string[]): Promise<any> {
    if (!this.crmContext) {
      throw new Error('AlexIntegrationService not initialized with CRM context');
    }

    try {
      const deal = await this.crmContext.convertLeadToDeal(leadId, services);
      console.log(`✅ Alex converted LEAD ${leadId} to DEAL: ${services.join(', ')}`);
      return deal;
    } catch (error) {
      console.error('❌ Alex failed to convert lead to deal:', error);
      throw error;
    }
  }

  /**
   * Get available service packages for Alex to offer
   */
  public getAvailableServices(): Array<{ id: string; name: string; price: number; description: string; isFree: boolean }> {
    return [
      {
        id: 'free_usdot',
        name: 'Free USDOT Registration',
        price: 0,
        description: 'Basic USDOT number registration with renewal management (free government service)',
        isFree: true
      },
      {
        id: 'usdot_mc_basic',
        name: 'USDOT + MC Number Package',
        price: 299,
        description: 'USDOT and MC Number registration with basic compliance and renewal management',
        isFree: false
      },
      {
        id: 'full_compliance',
        name: 'Full Compliance Package',
        price: 599,
        description: 'Complete compliance setup with ongoing monitoring and comprehensive renewal management',
        isFree: false
      },
      {
        id: 'state_registrations',
        name: 'State Registrations',
        price: 150,
        description: 'Additional state-specific registrations with renewal tracking',
        isFree: false
      },
      {
        id: 'compliance_monitoring',
        name: 'Compliance Monitoring',
        price: 200,
        description: 'Ongoing compliance monitoring, alerts, and renewal management',
        isFree: false
      }
    ];
  }

  /**
   * Calculate total value for selected services
   */
  public calculateServiceValue(serviceIds: string[]): number {
    const services = this.getAvailableServices();
    return serviceIds.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  }

  /**
   * Get service package by ID
   */
  public getServicePackage(serviceId: string): any {
    return this.getAvailableServices().find(s => s.id === serviceId);
  }

  /**
   * Validate client data before creating lead/deal
   */
  public validateClientData(clientData: AlexClientData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!clientData.name || clientData.name.trim().length < 2) {
      errors.push('Name is required and must be at least 2 characters');
    }

    if (!clientData.email || !this.isValidEmail(clientData.email)) {
      errors.push('Valid email address is required');
    }

    if (!clientData.phone || clientData.phone.trim().length < 10) {
      errors.push('Valid phone number is required');
    }

    if (!clientData.needs || clientData.needs.trim().length < 5) {
      errors.push('Client needs description is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default AlexIntegrationService;
