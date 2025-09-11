import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, Person, Vehicle, Driver, Deal, Invoice } from '../types/schema';
import { databaseService } from '../services/database';

// Define the context type
interface CRMContextType {
  // State
  companies: Organization[];
  setCompanies: React.Dispatch<React.SetStateAction<Organization[]>>;
  contacts: Person[];
  setContacts: React.Dispatch<React.SetStateAction<Person[]>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  isLoading: boolean;
  
  // Database operations
  refreshCompanies: () => Promise<void>;
  refreshContacts: () => Promise<void>;
  refreshVehicles: () => Promise<void>;
  refreshDrivers: () => Promise<void>;
  
  createCompany: (company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Organization>;
  createContact: (contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Person>;
  createVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vehicle>;
  createDriver: (driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Driver>;
  
  updateCompany: (id: string, company: Partial<Organization>) => Promise<Organization>;
  updateContact: (id: string, contact: Partial<Person>) => Promise<Person>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<Vehicle>;
  updateDriver: (id: string, driver: Partial<Driver>) => Promise<Driver>;
  
  deleteCompany: (id: string) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Add a small delay to ensure database service is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const [companiesData, contactsData, vehiclesData, driversData] = await Promise.all([
          databaseService.getCompanies(),
          databaseService.getContacts(),
          databaseService.getVehicles(),
          databaseService.getDrivers()
        ]);
        
        setCompanies(companiesData);
        setContacts(contactsData);
        setVehicles(vehiclesData);
        setDrivers(driversData);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Set empty arrays as fallback
        setCompanies([]);
        setContacts([]);
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
      const data = await databaseService.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to refresh companies:', error);
      throw error;
    }
  };

  const refreshContacts = async () => {
    try {
      const data = await databaseService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Failed to refresh contacts:', error);
      throw error;
    }
  };

  const refreshVehicles = async () => {
    try {
      const data = await databaseService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to refresh vehicles:', error);
      throw error;
    }
  };

  const refreshDrivers = async () => {
    try {
      const data = await databaseService.getDrivers();
      setDrivers(data);
    } catch (error) {
      console.error('Failed to refresh drivers:', error);
      throw error;
    }
  };

  const createCompany = async (company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCompany = await databaseService.createCompany(company);
      setCompanies(prev => [...prev, newCompany]);
      return newCompany;
    } catch (error) {
      console.error('Failed to create company:', error);
      throw error;
    }
  };

  const createContact = async (contact: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newContact = await databaseService.createContact(contact);
      setContacts(prev => [...prev, newContact]);
      return newContact;
    } catch (error) {
      console.error('Failed to create contact:', error);
      throw error;
    }
  };

  const createVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newVehicle = await databaseService.createVehicle(vehicle);
      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      throw error;
    }
  };

  const createDriver = async (driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newDriver = await databaseService.createDriver(driver);
      setDrivers(prev => [...prev, newDriver]);
      return newDriver;
    } catch (error) {
      console.error('Failed to create driver:', error);
      throw error;
    }
  };

  const updateCompany = async (id: string, company: Partial<Organization>) => {
    try {
      const updatedCompany = await databaseService.updateCompany(id, company);
      setCompanies(prev => prev.map(c => c.id === id ? updatedCompany : c));
      return updatedCompany;
    } catch (error) {
      console.error('Failed to update company:', error);
      throw error;
    }
  };

  const updateContact = async (id: string, contact: Partial<Person>) => {
    try {
      const updatedContact = await databaseService.updateContact(id, contact);
      setContacts(prev => prev.map(c => c.id === id ? updatedContact : c));
      return updatedContact;
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  };

  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    try {
      const updatedVehicle = await databaseService.updateVehicle(id, vehicle);
      setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
      return updatedVehicle;
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      throw error;
    }
  };

  const updateDriver = async (id: string, driver: Partial<Driver>) => {
    try {
      const updatedDriver = await databaseService.updateDriver(id, driver);
      setDrivers(prev => prev.map(d => d.id === id ? updatedDriver : d));
      return updatedDriver;
    } catch (error) {
      console.error('Failed to update driver:', error);
      throw error;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await databaseService.deleteCompany(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete company:', error);
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await databaseService.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await databaseService.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      throw error;
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      await databaseService.deleteDriver(id);
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
    vehicles,
    setVehicles,
    drivers,
    setDrivers,
    isLoading,
    refreshCompanies,
    refreshContacts,
    refreshVehicles,
    refreshDrivers,
    createCompany,
    createContact,
    createVehicle,
    createDriver,
    updateCompany,
    updateContact,
    updateVehicle,
    updateDriver,
    deleteCompany,
    deleteContact,
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