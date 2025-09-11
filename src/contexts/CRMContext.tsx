import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, Person, Vehicle, Driver, Deal, Invoice, Lead } from '../types/schema';
import { browserDatabaseService } from '../services/database/BrowserDatabaseService';

// Define the context type
interface CRMContextType {
  // State
  companies: Organization[];
  setCompanies: React.Dispatch<React.SetStateAction<Organization[]>>;
  contacts: Person[];
  setContacts: React.Dispatch<React.SetStateAction<Person[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  isLoading: boolean;
  
  // Database operations
  refreshCompanies: () => Promise<void>;
  refreshContacts: () => Promise<void>;
  refreshLeads: () => Promise<void>;
  refreshDeals: () => Promise<void>;
  refreshVehicles: () => Promise<void>;
  refreshDrivers: () => Promise<void>;
  
  createCompany: (company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Organization>;
  createContact: (contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Person>;
  createLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Lead>;
  createDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Deal>;
  createVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vehicle>;
  createDriver: (driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Driver>;
  
  updateCompany: (id: string, company: Partial<Organization>) => Promise<Organization>;
  updateContact: (id: string, contact: Partial<Person>) => Promise<Person>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<Lead>;
  updateDeal: (id: string, deal: Partial<Deal>) => Promise<Deal>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<Vehicle>;
  updateDriver: (id: string, driver: Partial<Driver>) => Promise<Driver>;
  
  deleteCompany: (id: string) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
}

// Create the context
const CRMContext = createContext<CRMContextType | undefined>(undefined);

// Provider props
interface CRMProviderProps {
  children: React.ReactNode;
}

// Provider component
export const CRMProvider: React.FC<CRMProviderProps> = ({ children }) => {
  const [companies, setCompanies] = useState<Organization[]>([]);
  const [contacts, setContacts] = useState<Person[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('[CRMContext] Starting data load...');
        
        const [companiesData, contactsData, leadsData, dealsData, vehiclesData, driversData] = await Promise.all([
          browserDatabaseService.getCompanies().catch(err => {
            console.error('[CRMContext] Failed to load companies:', err);
            throw new Error(`Companies: ${err.message}`);
          }),
          browserDatabaseService.getContacts().catch(err => {
            console.error('[CRMContext] Failed to load contacts:', err);
            throw new Error(`Contacts: ${err.message}`);
          }),
          browserDatabaseService.getLeads().catch(err => {
            console.error('[CRMContext] Failed to load leads:', err);
            throw new Error(`Leads: ${err.message}`);
          }),
          browserDatabaseService.getDeals().catch(err => {
            console.error('[CRMContext] Failed to load deals:', err);
            throw new Error(`Deals: ${err.message}`);
          }),
          browserDatabaseService.getVehicles().catch(err => {
            console.error('[CRMContext] Failed to load vehicles:', err);
            throw new Error(`Vehicles: ${err.message}`);
          }),
          browserDatabaseService.getDrivers().catch(err => {
            console.error('[CRMContext] Failed to load drivers:', err);
            throw new Error(`Drivers: ${err.message}`);
          })
        ]);
        
        console.log('[CRMContext] Data loaded successfully:', {
          companies: companiesData.length,
          contacts: contactsData.length,
          leads: leadsData.length,
          deals: dealsData.length,
          vehicles: vehiclesData.length,
          drivers: driversData.length
        });
        
        setCompanies(companiesData);
        setContacts(contactsData);
        setLeads(leadsData);
        setDeals(dealsData);
        setVehicles(vehiclesData);
        setDrivers(driversData);
      } catch (error) {
        console.error('[CRMContext] Failed to load data:', error);
        // Set empty arrays as fallback
        setCompanies([]);
        setContacts([]);
        setLeads([]);
        setDeals([]);
        setVehicles([]);
        setDrivers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Database operations functions
  const refreshCompanies = async () => {
    try {
      const data = await browserDatabaseService.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to refresh companies:', error);
      throw error;
    }
  };

  const refreshContacts = async () => {
    try {
      const data = await browserDatabaseService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Failed to refresh contacts:', error);
      throw error;
    }
  };

  const refreshLeads = async () => {
    try {
      const data = await browserDatabaseService.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Failed to refresh leads:', error);
      throw error;
    }
  };

  const refreshDeals = async () => {
    try {
      const data = await browserDatabaseService.getDeals();
      setDeals(data);
    } catch (error) {
      console.error('Failed to refresh deals:', error);
      throw error;
    }
  };

  const refreshVehicles = async () => {
    try {
      const data = await browserDatabaseService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to refresh vehicles:', error);
      throw error;
    }
  };

  const refreshDrivers = async () => {
    try {
      const data = await browserDatabaseService.getDrivers();
      setDrivers(data);
    } catch (error) {
      console.error('Failed to refresh drivers:', error);
      throw error;
    }
  };

  const createCompany = async (company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCompany = await browserDatabaseService.createCompany(company);
      setCompanies(prev => [...prev, newCompany]);
      return newCompany;
    } catch (error) {
      console.error('Failed to create company:', error);
      throw error;
    }
  };

  const createContact = async (contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newContact = await browserDatabaseService.createContact(contact);
      setContacts(prev => [...prev, newContact]);
      return newContact;
    } catch (error) {
      console.error('Failed to create contact:', error);
      throw error;
    }
  };

  const createLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newLead = await browserDatabaseService.createLead(lead);
      setLeads(prev => [...prev, newLead]);
      return newLead;
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  };

  const createDeal = async (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newDeal = await browserDatabaseService.createDeal(deal);
      setDeals(prev => [...prev, newDeal]);
      return newDeal;
    } catch (error) {
      console.error('Failed to create deal:', error);
      throw error;
    }
  };

  const createVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newVehicle = await browserDatabaseService.createVehicle(vehicle);
      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      throw error;
    }
  };

  const createDriver = async (driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newDriver = await browserDatabaseService.createDriver(driver);
      setDrivers(prev => [...prev, newDriver]);
      return newDriver;
    } catch (error) {
      console.error('Failed to create driver:', error);
      throw error;
    }
  };

  const updateCompany = async (id: string, company: Partial<Organization>) => {
    try {
      const updatedCompany = await browserDatabaseService.updateCompany(id, company);
      setCompanies(prev => prev.map(c => c.id === id ? updatedCompany : c));
      return updatedCompany;
    } catch (error) {
      console.error('Failed to update company:', error);
      throw error;
    }
  };

  const updateContact = async (id: string, contact: Partial<Person>) => {
    try {
      const updatedContact = await browserDatabaseService.updateContact(id, contact);
      setContacts(prev => prev.map(c => c.id === id ? updatedContact : c));
      return updatedContact;
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  };

  const updateLead = async (id: string, lead: Partial<Lead>) => {
    try {
      const updatedLead = await browserDatabaseService.updateLead(id, lead);
      setLeads(prev => prev.map(l => l.id === id ? updatedLead : l));
      return updatedLead;
    } catch (error) {
      console.error('Failed to update lead:', error);
      throw error;
    }
  };

  const updateDeal = async (id: string, deal: Partial<Deal>) => {
    try {
      const updatedDeal = await browserDatabaseService.updateDeal(id, deal);
      setDeals(prev => prev.map(d => d.id === id ? updatedDeal : d));
      return updatedDeal;
    } catch (error) {
      console.error('Failed to update deal:', error);
      throw error;
    }
  };

  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    try {
      const updatedVehicle = await browserDatabaseService.updateVehicle(id, vehicle);
      setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
      return updatedVehicle;
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      throw error;
    }
  };

  const updateDriver = async (id: string, driver: Partial<Driver>) => {
    try {
      const updatedDriver = await browserDatabaseService.updateDriver(id, driver);
      setDrivers(prev => prev.map(d => d.id === id ? updatedDriver : d));
      return updatedDriver;
    } catch (error) {
      console.error('Failed to update driver:', error);
      throw error;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await browserDatabaseService.deleteCompany(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete company:', error);
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await browserDatabaseService.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await browserDatabaseService.deleteLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      console.error('Failed to delete lead:', error);
      throw error;
    }
  };

  const deleteDeal = async (id: string) => {
    try {
      await browserDatabaseService.deleteDeal(id);
      setDeals(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete deal:', error);
      throw error;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await browserDatabaseService.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      throw error;
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      await browserDatabaseService.deleteDriver(id);
      setDrivers(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete driver:', error);
      throw error;
    }
  };

  const value = {
    companies,
    setCompanies,
    contacts,
    setContacts,
    leads,
    setLeads,
    deals,
    setDeals,
    vehicles,
    setVehicles,
    drivers,
    setDrivers,
    isLoading,
    refreshCompanies,
    refreshContacts,
    refreshLeads,
    refreshDeals,
    refreshVehicles,
    refreshDrivers,
    createCompany,
    createContact,
    createLead,
    createDeal,
    createVehicle,
    createDriver,
    updateCompany,
    updateContact,
    updateLead,
    updateDeal,
    updateVehicle,
    updateDriver,
    deleteCompany,
    deleteContact,
    deleteLead,
    deleteDeal,
    deleteVehicle,
    deleteDriver,
  };

  // Show loading state while data is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading CRM data...</p>
        </div>
      </div>
    );
  }

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};

// Custom hook to use the CRM context
export const useCRM = (): CRMContextType => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};