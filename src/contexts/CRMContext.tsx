import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, Person, Vehicle, Driver, Deal, Invoice, Lead, Service } from '../types/schema';
import { getApiBaseUrl } from '../config/api';

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
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
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
  refreshServices: () => Promise<void>;
  refreshVehicles: () => Promise<void>;
  refreshDrivers: () => Promise<void>;
  
  createCompany: (company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Organization>;
  createContact: (contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Person>;
  createLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Lead>;
  createDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Deal>;
  createService: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Service>;
  createVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vehicle>;
  createDriver: (driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Driver>;
  
  updateCompany: (id: string, company: Partial<Organization>) => Promise<Organization>;
  updateContact: (id: string, contact: Partial<Person>) => Promise<Person>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<Lead>;
  updateDeal: (id: string, deal: Partial<Deal>) => Promise<Deal>;
  updateService: (id: string, service: Partial<Service>) => Promise<Service>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<Vehicle>;
  updateDriver: (id: string, driver: Partial<Driver>) => Promise<Driver>;
  
  deleteCompany: (id: string) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
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
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // API base URL
  const API_BASE = getApiBaseUrl();

  // Load data from YOUR database on mount
  useEffect(() => {
    const loadData = async (retryCount = 0) => {
      try {
        setIsLoading(true);
        console.log(`[CRMContext] Starting data load from YOUR database... (attempt ${retryCount + 1})`);
        
        const [companiesData, contactsData, leadsData, dealsData, servicesData, vehiclesData, driversData] = await Promise.all([
          fetch(`${API_BASE}/companies`).then(res => res.json()).catch(err => {
            console.error('[CRMContext] Failed to load companies:', err);
            throw new Error(`Companies: ${err.message}`);
          }),
          fetch(`${API_BASE}/contacts`).then(res => res.json()).catch(err => {
            console.error('[CRMContext] Failed to load contacts:', err);
            throw new Error(`Contacts: ${err.message}`);
          }),
          fetch(`${API_BASE}/leads`).then(res => res.json()).catch(err => {
            console.error('[CRMContext] Failed to load leads:', err);
            throw new Error(`Leads: ${err.message}`);
          }),
          fetch(`${API_BASE}/deals`).then(res => res.json()).catch(err => {
            console.error('[CRMContext] Failed to load deals:', err);
            throw new Error(`Deals: ${err.message}`);
          }),
          fetch(`${API_BASE}/services`).then(res => res.json()).catch(err => {
            console.error('[CRMContext] Failed to load services:', err);
            throw new Error(`Services: ${err.message}`);
          }),
          fetch(`${API_BASE}/vehicles`).then(res => res.json()).catch(err => {
            console.error('[CRMContext] Failed to load vehicles:', err);
            throw new Error(`Vehicles: ${err.message}`);
          }),
          fetch(`${API_BASE}/drivers`).then(res => res.json()).catch(err => {
            console.error('[CRMContext] Failed to load drivers:', err);
            throw new Error(`Drivers: ${err.message}`);
          })
        ]);
        
        console.log('[CRMContext] Data loaded successfully:', {
          companies: companiesData.length,
          contacts: contactsData.length,
          leads: leadsData.length,
          deals: dealsData.length,
          services: servicesData.length,
          vehicles: vehiclesData.length,
          drivers: driversData.length
        });
        
        setCompanies(companiesData);
        setContacts(contactsData);
        setLeads(leadsData);
        setDeals(dealsData);
        setServices(servicesData);
        setVehicles(vehiclesData);
        setDrivers(driversData);
      } catch (error) {
        console.error('[CRMContext] Failed to load data:', error);
        
        // Retry logic - if it's a connection error and we haven't retried too many times
        if (retryCount < 3 && (error instanceof Error && error.message.includes('Failed to fetch'))) {
          console.log(`[CRMContext] Retrying in 2 seconds... (${retryCount + 1}/3)`);
          setTimeout(() => loadData(retryCount + 1), 2000);
          return;
        }
        
        // Set empty arrays as fallback only after all retries failed
        setCompanies([]);
        setContacts([]);
        setLeads([]);
        setDeals([]);
        setServices([]);
        setVehicles([]);
        setDrivers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Database operations functions - NOW USING YOUR DATABASE
  const refreshCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE}/companies`);
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to refresh companies:', error);
      throw error;
    }
  };

  const refreshContacts = async () => {
    try {
      const response = await fetch(`${API_BASE}/contacts`);
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Failed to refresh contacts:', error);
      throw error;
    }
  };

  const refreshLeads = async () => {
    try {
      const response = await fetch(`${API_BASE}/leads`);
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Failed to refresh leads:', error);
      throw error;
    }
  };

  const refreshDeals = async () => {
    try {
      const response = await fetch(`${API_BASE}/deals`);
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      console.error('Failed to refresh deals:', error);
      throw error;
    }
  };

  const refreshServices = async () => {
    try {
      const response = await fetch(`${API_BASE}/services`);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Failed to refresh services:', error);
      throw error;
    }
  };

  const refreshVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE}/vehicles`);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to refresh vehicles:', error);
      throw error;
    }
  };

  const refreshDrivers = async () => {
    try {
      const response = await fetch(`${API_BASE}/drivers`);
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error('Failed to refresh drivers:', error);
      throw error;
    }
  };

  const createCompany = async (company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company)
      });
      const newCompany = await response.json();
      setCompanies(prev => [...prev, newCompany]);
      return newCompany;
    } catch (error) {
      console.error('Failed to create company:', error);
      throw error;
    }
  };

  const createContact = async (contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      });
      const newContact = await response.json();
      setContacts(prev => [...prev, newContact]);
      return newContact;
    } catch (error) {
      console.error('Failed to create contact:', error);
      throw error;
    }
  };

  const createLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
      const newLead = await response.json();
      setLeads(prev => [...prev, newLead]);
      return newLead;
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  };

  const createDeal = async (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deal)
      });
      const newDeal = await response.json();
      setDeals(prev => [...prev, newDeal]);
      return newDeal;
    } catch (error) {
      console.error('Failed to create deal:', error);
      throw error;
    }
  };

  const createService = async (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service)
      });
      const newService = await response.json();
      setServices(prev => [...prev, newService]);
      return newService;
    } catch (error) {
      console.error('Failed to create service:', error);
      throw error;
    }
  };

  const createVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicle)
      });
      const newVehicle = await response.json();
      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      throw error;
    }
  };

  const createDriver = async (driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE}/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driver)
      });
      const newDriver = await response.json();
      setDrivers(prev => [...prev, newDriver]);
      return newDriver;
    } catch (error) {
      console.error('Failed to create driver:', error);
      throw error;
    }
  };

  const updateCompany = async (id: string, company: Partial<Organization>) => {
    try {
      const response = await fetch(`${API_BASE}/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company)
      });
      const updatedCompany = await response.json();
      setCompanies(prev => prev.map(c => c.id === id ? updatedCompany : c));
      return updatedCompany;
    } catch (error) {
      console.error('Failed to update company:', error);
      throw error;
    }
  };

  const updateContact = async (id: string, contact: Partial<Person>) => {
    try {
      const response = await fetch(`${API_BASE}/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      });
      const updatedContact = await response.json();
      setContacts(prev => prev.map(c => c.id === id ? updatedContact : c));
      return updatedContact;
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  };

  const updateLead = async (id: string, lead: Partial<Lead>) => {
    try {
      const response = await fetch(`${API_BASE}/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
      const updatedLead = await response.json();
      setLeads(prev => prev.map(l => l.id === id ? updatedLead : l));
      return updatedLead;
    } catch (error) {
      console.error('Failed to update lead:', error);
      throw error;
    }
  };

  const updateDeal = async (id: string, deal: Partial<Deal>) => {
    try {
      const response = await fetch(`${API_BASE}/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deal)
      });
      const updatedDeal = await response.json();
      setDeals(prev => prev.map(d => d.id === id ? updatedDeal : d));
      return updatedDeal;
    } catch (error) {
      console.error('Failed to update deal:', error);
      throw error;
    }
  };

  const updateService = async (id: string, service: Partial<Service>) => {
    try {
      const response = await fetch(`${API_BASE}/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service)
      });
      const updatedService = await response.json();
      setServices(prev => prev.map(s => s.id === id ? updatedService : s));
      return updatedService;
    } catch (error) {
      console.error('Failed to update service:', error);
      throw error;
    }
  };

  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    try {
      const response = await fetch(`${API_BASE}/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicle)
      });
      const updatedVehicle = await response.json();
      setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
      return updatedVehicle;
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      throw error;
    }
  };

  const updateDriver = async (id: string, driver: Partial<Driver>) => {
    try {
      const response = await fetch(`${API_BASE}/drivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driver)
      });
      const updatedDriver = await response.json();
      setDrivers(prev => prev.map(d => d.id === id ? updatedDriver : d));
      return updatedDriver;
    } catch (error) {
      console.error('Failed to update driver:', error);
      throw error;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await fetch(`${API_BASE}/companies/${id}`, { method: 'DELETE' });
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete company:', error);
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await fetch(`${API_BASE}/contacts/${id}`, { method: 'DELETE' });
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await fetch(`${API_BASE}/leads/${id}`, { method: 'DELETE' });
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      console.error('Failed to delete lead:', error);
      throw error;
    }
  };

  const deleteDeal = async (id: string) => {
    try {
      await fetch(`${API_BASE}/deals/${id}`, { method: 'DELETE' });
      setDeals(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete deal:', error);
      throw error;
    }
  };

  const deleteService = async (id: string) => {
    try {
      await fetch(`${API_BASE}/services/${id}`, { method: 'DELETE' });
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete service:', error);
      throw error;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await fetch(`${API_BASE}/vehicles/${id}`, { method: 'DELETE' });
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      throw error;
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      await fetch(`${API_BASE}/drivers/${id}`, { method: 'DELETE' });
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
    services,
    setServices,
    vehicles,
    setVehicles,
    drivers,
    setDrivers,
    isLoading,
    refreshCompanies,
    refreshContacts,
    refreshLeads,
    refreshDeals,
    refreshServices,
    refreshVehicles,
    refreshDrivers,
    createCompany,
    createContact,
    createLead,
    createDeal,
    createService,
    createVehicle,
    createDriver,
    updateCompany,
    updateContact,
    updateLead,
    updateDeal,
    updateService,
    updateVehicle,
    updateDriver,
    deleteCompany,
    deleteContact,
    deleteLead,
    deleteDeal,
    deleteService,
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
