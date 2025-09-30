import { useState, useEffect, useCallback } from 'react';
import LeadDealService, { LeadData, DealData, ServicePackage } from '../services/LeadDealService';

export interface UseLeadDealReturn {
  // Lead operations
  createLead: (leadData: Omit<LeadData, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => LeadData;
  getLeads: () => LeadData[];
  getLead: (id: string) => LeadData | null;
  updateLeadStatus: (id: string, status: LeadData['status']) => boolean;
  getLeadsByStatus: (status: LeadData['status']) => LeadData[];
  
  // Deal operations
  createDeal: (dealData: Omit<DealData, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => DealData;
  getDeals: () => DealData[];
  getDeal: (id: string) => DealData | null;
  updateDealStatus: (id: string, status: DealData['status']) => boolean;
  getDealsByStatus: (status: DealData['status']) => DealData[];
  
  // Conversion operations
  convertLeadToDeal: (leadId: string, services: string[]) => DealData | null;
  
  // Service operations
  getServicePackages: () => ServicePackage[];
  getServicePackage: (id: string) => ServicePackage | null;
  calculateServiceValue: (serviceIds: string[]) => number;
  
  // Statistics
  getConversionStats: () => {
    totalLeads: number;
    totalDeals: number;
    conversionRate: number;
    totalRevenue: number;
  };
  
  // State
  leads: LeadData[];
  deals: DealData[];
  isLoading: boolean;
  error: string | null;
}

export const useLeadDeal = (): UseLeadDealReturn => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [deals, setDeals] = useState<DealData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leadDealService = LeadDealService.getInstance();

  // Load initial data
  useEffect(() => {
    const loadData = () => {
      try {
        setLeads(leadDealService.getLeads());
        setDeals(leadDealService.getDeals());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      }
    };

    loadData();
  }, [leadDealService]);

  // Lead operations
  const createLead = useCallback((leadData: Omit<LeadData, 'id' | 'status' | 'createdAt' | 'updatedAt'>): LeadData => {
    try {
      const lead = leadDealService.createLead(leadData);
      setLeads(leadDealService.getLeads());
      setError(null);
      return lead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
      throw err;
    }
  }, [leadDealService]);

  const getLeads = useCallback((): LeadData[] => {
    return leadDealService.getLeads();
  }, [leadDealService]);

  const getLead = useCallback((id: string): LeadData | null => {
    return leadDealService.getLead(id);
  }, [leadDealService]);

  const updateLeadStatus = useCallback((id: string, status: LeadData['status']): boolean => {
    try {
      const success = leadDealService.updateLeadStatus(id, status);
      if (success) {
        setLeads(leadDealService.getLeads());
        setError(null);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead status');
      return false;
    }
  }, [leadDealService]);

  const getLeadsByStatus = useCallback((status: LeadData['status']): LeadData[] => {
    return leadDealService.getLeadsByStatus(status);
  }, [leadDealService]);

  // Deal operations
  const createDeal = useCallback((dealData: Omit<DealData, 'id' | 'status' | 'createdAt' | 'updatedAt'>): DealData => {
    try {
      const deal = leadDealService.createDeal(dealData);
      setDeals(leadDealService.getDeals());
      setError(null);
      return deal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deal');
      throw err;
    }
  }, [leadDealService]);

  const getDeals = useCallback((): DealData[] => {
    return leadDealService.getDeals();
  }, [leadDealService]);

  const getDeal = useCallback((id: string): DealData | null => {
    return leadDealService.getDeal(id);
  }, [leadDealService]);

  const updateDealStatus = useCallback((id: string, status: DealData['status']): boolean => {
    try {
      const success = leadDealService.updateDealStatus(id, status);
      if (success) {
        setDeals(leadDealService.getDeals());
        setError(null);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deal status');
      return false;
    }
  }, [leadDealService]);

  const getDealsByStatus = useCallback((status: DealData['status']): DealData[] => {
    return leadDealService.getDealsByStatus(status);
  }, [leadDealService]);

  // Conversion operations
  const convertLeadToDeal = useCallback((leadId: string, services: string[]): DealData | null => {
    try {
      const deal = leadDealService.convertLeadToDeal(leadId, services);
      if (deal) {
        setLeads(leadDealService.getLeads());
        setDeals(leadDealService.getDeals());
        setError(null);
      }
      return deal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert lead to deal');
      return null;
    }
  }, [leadDealService]);

  // Service operations
  const getServicePackages = useCallback((): ServicePackage[] => {
    return leadDealService.getServicePackages();
  }, [leadDealService]);

  const getServicePackage = useCallback((id: string): ServicePackage | null => {
    return leadDealService.getServicePackage(id);
  }, [leadDealService]);

  const calculateServiceValue = useCallback((serviceIds: string[]): number => {
    return leadDealService.calculateServiceValue(serviceIds);
  }, [leadDealService]);

  // Statistics
  const getConversionStats = useCallback(() => {
    return leadDealService.getConversionStats();
  }, [leadDealService]);

  return {
    // Lead operations
    createLead,
    getLeads,
    getLead,
    updateLeadStatus,
    getLeadsByStatus,
    
    // Deal operations
    createDeal,
    getDeals,
    getDeal,
    updateDealStatus,
    getDealsByStatus,
    
    // Conversion operations
    convertLeadToDeal,
    
    // Service operations
    getServicePackages,
    getServicePackage,
    calculateServiceValue,
    
    // Statistics
    getConversionStats,
    
    // State
    leads,
    deals,
    isLoading,
    error
  };
};

export default useLeadDeal;
