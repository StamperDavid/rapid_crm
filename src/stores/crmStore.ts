/**
 * CRM Zustand Store - Efficient State Management
 *
 * Replaces Context API over-reliance with selective data loading,
 * caching, and better performance for large datasets.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Organization, Person, Lead, Deal, Service, Vehicle, Driver } from '../types/schema';

interface CRMStore {
  // Data caches (Map for O(1) lookups)
  companies: Map<string, Organization>;
  contacts: Map<string, Person>;
  leads: Map<string, Lead>;
  deals: Map<string, Deal>;
  services: Map<string, Service>;
  vehicles: Map<string, Vehicle>;
  drivers: Map<string, Driver>;

  // Loading states
  loading: {
    companies: boolean;
    contacts: boolean;
    leads: boolean;
    deals: boolean;
    services: boolean;
    vehicles: boolean;
    drivers: boolean;
  };

  // Errors
  errors: {
    companies?: string;
    contacts?: string;
    leads?: string;
    deals?: string;
    services?: string;
    vehicles?: string;
    drivers?: string;
  };

  // Actions
  loadCompanies: () => Promise<void>;
  loadContacts: () => Promise<void>;
  loadLeads: () => Promise<void>;
  loadDeals: () => Promise<void>;
  loadServices: () => Promise<void>;
  loadVehicles: () => Promise<void>;
  loadDrivers: () => Promise<void>;

  // Individual item getters (with caching)
  getCompany: (id: string) => Promise<Organization | null>;
  getContact: (id: string) => Promise<Person | null>;
  getLead: (id: string) => Promise<Lead | null>;
  getDeal: (id: string) => Promise<Deal | null>;
  getService: (id: string) => Promise<Service | null>;
  getVehicle: (id: string) => Promise<Vehicle | null>;
  getDriver: (id: string) => Promise<Driver | null>;

  // CRUD operations
  createCompany: (company: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Organization>;
  updateCompany: (id: string, updates: Partial<Organization>) => Promise<Organization>;
  deleteCompany: (id: string) => Promise<void>;

  // Utility functions
  clearCache: () => void;
  refreshAll: () => Promise<void>;
}

const API_BASE = '/api';

export const useCRMStore = create<CRMStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        companies: new Map(),
        contacts: new Map(),
        leads: new Map(),
        deals: new Map(),
        services: new Map(),
        vehicles: new Map(),
        drivers: new Map(),

        loading: {
          companies: false,
          contacts: false,
          leads: false,
          deals: false,
          services: false,
          vehicles: false,
          drivers: false,
        },

        errors: {},

        // Load all companies
        loadCompanies: async () => {
          set(state => ({ loading: { ...state.loading, companies: true } }));
          try {
            const response = await fetch(`${API_BASE}/companies`);
            if (!response.ok) throw new Error('Failed to load companies');
            const companies: Organization[] = await response.json();

            const companiesMap = new Map();
            companies.forEach(company => companiesMap.set(company.id, company));

            set(state => ({
              companies: companiesMap,
              loading: { ...state.loading, companies: false },
              errors: { ...state.errors, companies: undefined }
            }));
          } catch (error) {
            set(state => ({
              loading: { ...state.loading, companies: false },
              errors: { ...state.errors, companies: error.message }
            }));
          }
        },

        // Load all contacts
        loadContacts: async () => {
          set(state => ({ loading: { ...state.loading, contacts: true } }));
          try {
            const response = await fetch(`${API_BASE}/contacts`);
            if (!response.ok) throw new Error('Failed to load contacts');
            const contacts: Person[] = await response.json();

            const contactsMap = new Map();
            contacts.forEach(contact => contactsMap.set(contact.id, contact));

            set(state => ({
              contacts: contactsMap,
              loading: { ...state.loading, contacts: false },
              errors: { ...state.errors, contacts: undefined }
            }));
          } catch (error) {
            set(state => ({
              loading: { ...state.loading, contacts: false },
              errors: { ...state.errors, contacts: error.message }
            }));
          }
        },

        // Load all leads
        loadLeads: async () => {
          set(state => ({ loading: { ...state.loading, leads: true } }));
          try {
            const response = await fetch(`${API_BASE}/leads`);
            if (!response.ok) throw new Error('Failed to load leads');
            const leads: Lead[] = await response.json();

            const leadsMap = new Map();
            leads.forEach(lead => leadsMap.set(lead.id, lead));

            set(state => ({
              leads: leadsMap,
              loading: { ...state.loading, leads: false },
              errors: { ...state.errors, leads: undefined }
            }));
          } catch (error) {
            set(state => ({
              loading: { ...state.loading, leads: false },
              errors: { ...state.errors, leads: error.message }
            }));
          }
        },

        // Load all deals
        loadDeals: async () => {
          set(state => ({ loading: { ...state.loading, deals: true } }));
          try {
            const response = await fetch(`${API_BASE}/deals`);
            if (!response.ok) throw new Error('Failed to load deals');
            const deals: Deal[] = await response.json();

            const dealsMap = new Map();
            deals.forEach(deal => dealsMap.set(deal.id, deal));

            set(state => ({
              deals: dealsMap,
              loading: { ...state.loading, deals: false },
              errors: { ...state.errors, deals: undefined }
            }));
          } catch (error) {
            set(state => ({
              loading: { ...state.loading, deals: false },
              errors: { ...state.errors, deals: error.message }
            }));
          }
        },

        // Load all services
        loadServices: async () => {
          set(state => ({ loading: { ...state.loading, services: true } }));
          try {
            const response = await fetch(`${API_BASE}/services`);
            if (!response.ok) throw new Error('Failed to load services');
            const services: Service[] = await response.json();

            const servicesMap = new Map();
            services.forEach(service => servicesMap.set(service.id, service));

            set(state => ({
              services: servicesMap,
              loading: { ...state.loading, services: false },
              errors: { ...state.errors, services: undefined }
            }));
          } catch (error) {
            set(state => ({
              loading: { ...state.loading, services: false },
              errors: { ...state.errors, services: error.message }
            }));
          }
        },

        // Load all vehicles
        loadVehicles: async () => {
          set(state => ({ loading: { ...state.loading, vehicles: true } }));
          try {
            const response = await fetch(`${API_BASE}/vehicles`);
            if (!response.ok) throw new Error('Failed to load vehicles');
            const vehicles: Vehicle[] = await response.json();

            const vehiclesMap = new Map();
            vehicles.forEach(vehicle => vehiclesMap.set(vehicle.id, vehicle));

            set(state => ({
              vehicles: vehiclesMap,
              loading: { ...state.loading, vehicles: false },
              errors: { ...state.errors, vehicles: undefined }
            }));
          } catch (error) {
            set(state => ({
              loading: { ...state.loading, vehicles: false },
              errors: { ...state.errors, vehicles: error.message }
            }));
          }
        },

        // Load all drivers
        loadDrivers: async () => {
          set(state => ({ loading: { ...state.loading, drivers: true } }));
          try {
            const response = await fetch(`${API_BASE}/drivers`);
            if (!response.ok) throw new Error('Failed to load drivers');
            const drivers: Driver[] = await response.json();

            const driversMap = new Map();
            drivers.forEach(driver => driversMap.set(driver.id, driver));

            set(state => ({
              drivers: driversMap,
              loading: { ...state.loading, drivers: false },
              errors: { ...state.errors, drivers: undefined }
            }));
          } catch (error) {
            set(state => ({
              loading: { ...state.loading, drivers: false },
              errors: { ...state.errors, drivers: error.message }
            }));
          }
        },

        // Get individual items (with caching)
        getCompany: async (id: string) => {
          const { companies } = get();
          if (companies.has(id)) {
            return companies.get(id)!;
          }

          // Fetch if not cached
          try {
            const response = await fetch(`${API_BASE}/companies/${id}`);
            if (!response.ok) return null;
            const company: Organization = await response.json();
            companies.set(id, company);
            set({ companies });
            return company;
          } catch {
            return null;
          }
        },

        getContact: async (id: string) => {
          const { contacts } = get();
          if (contacts.has(id)) {
            return contacts.get(id)!;
          }

          try {
            const response = await fetch(`${API_BASE}/contacts/${id}`);
            if (!response.ok) return null;
            const contact: Person = await response.json();
            contacts.set(id, contact);
            set({ contacts });
            return contact;
          } catch {
            return null;
          }
        },

        getLead: async (id: string) => {
          const { leads } = get();
          if (leads.has(id)) {
            return leads.get(id)!;
          }

          try {
            const response = await fetch(`${API_BASE}/leads/${id}`);
            if (!response.ok) return null;
            const lead: Lead = await response.json();
            leads.set(id, lead);
            set({ leads });
            return lead;
          } catch {
            return null;
          }
        },

        getDeal: async (id: string) => {
          const { deals } = get();
          if (deals.has(id)) {
            return deals.get(id)!;
          }

          try {
            const response = await fetch(`${API_BASE}/deals/${id}`);
            if (!response.ok) return null;
            const deal: Deal = await response.json();
            deals.set(id, deal);
            set({ deals });
            return deal;
          } catch {
            return null;
          }
        },

        getService: async (id: string) => {
          const { services } = get();
          if (services.has(id)) {
            return services.get(id)!;
          }

          try {
            const response = await fetch(`${API_BASE}/services/${id}`);
            if (!response.ok) return null;
            const service: Service = await response.json();
            services.set(id, service);
            set({ services });
            return service;
          } catch {
            return null;
          }
        },

        getVehicle: async (id: string) => {
          const { vehicles } = get();
          if (vehicles.has(id)) {
            return vehicles.get(id)!;
          }

          try {
            const response = await fetch(`${API_BASE}/vehicles/${id}`);
            if (!response.ok) return null;
            const vehicle: Vehicle = await response.json();
            vehicles.set(id, vehicle);
            set({ vehicles });
            return vehicle;
          } catch {
            return null;
          }
        },

        getDriver: async (id: string) => {
          const { drivers } = get();
          if (drivers.has(id)) {
            return drivers.get(id)!;
          }

          try {
            const response = await fetch(`${API_BASE}/drivers/${id}`);
            if (!response.ok) return null;
            const driver: Driver = await response.json();
            drivers.set(id, driver);
            set({ drivers });
            return driver;
          } catch {
            return null;
          }
        },

        // CRUD operations
        createCompany: async (companyData) => {
          const response = await fetch(`${API_BASE}/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(companyData)
          });

          if (!response.ok) {
            throw new Error('Failed to create company');
          }

          const newCompany: Organization = await response.json();

          // Update cache
          set(state => {
            const newCompanies = new Map(state.companies);
            newCompanies.set(newCompany.id, newCompany);
            return { companies: newCompanies };
          });

          return newCompany;
        },

        updateCompany: async (id, updates) => {
          const response = await fetch(`${API_BASE}/companies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });

          if (!response.ok) {
            throw new Error('Failed to update company');
          }

          const updatedCompany: Organization = await response.json();

          // Update cache
          set(state => {
            const newCompanies = new Map(state.companies);
            newCompanies.set(id, updatedCompany);
            return { companies: newCompanies };
          });

          return updatedCompany;
        },

        deleteCompany: async (id) => {
          const response = await fetch(`${API_BASE}/companies/${id}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            throw new Error('Failed to delete company');
          }

          // Remove from cache
          set(state => {
            const newCompanies = new Map(state.companies);
            newCompanies.delete(id);
            return { companies: newCompanies };
          });
        },

        // Utility functions
        clearCache: () => {
          set({
            companies: new Map(),
            contacts: new Map(),
            leads: new Map(),
            deals: new Map(),
            services: new Map(),
            vehicles: new Map(),
            drivers: new Map(),
            errors: {}
          });
        },

        refreshAll: async () => {
          const { loadCompanies, loadContacts, loadLeads, loadDeals, loadServices, loadVehicles, loadDrivers } = get();
          await Promise.all([
            loadCompanies(),
            loadContacts(),
            loadLeads(),
            loadDeals(),
            loadServices(),
            loadVehicles(),
            loadDrivers()
          ]);
        }
      }),
      {
        name: 'crm-store',
        // Only persist certain data, not loading states
        partialize: (state) => ({
          companies: Array.from(state.companies.entries()),
          contacts: Array.from(state.contacts.entries()),
          leads: Array.from(state.leads.entries()),
          deals: Array.from(state.deals.entries()),
          services: Array.from(state.services.entries()),
          vehicles: Array.from(state.vehicles.entries()),
          drivers: Array.from(state.drivers.entries())
        })
      }
    ),
    {
      name: 'crm-store'
    }
  )
);

// Helper hooks for easier usage
export const useCompanies = () => {
  const { companies, loading, errors, loadCompanies } = useCRMStore();
  return {
    companies: Array.from(companies.values()),
    loading: loading.companies,
    error: errors.companies,
    loadCompanies
  };
};

export const useContacts = () => {
  const { contacts, loading, errors, loadContacts } = useCRMStore();
  return {
    contacts: Array.from(contacts.values()),
    loading: loading.contacts,
    error: errors.contacts,
    loadContacts
  };
};

export const useLeads = () => {
  const { leads, loading, errors, loadLeads } = useCRMStore();
  return {
    leads: Array.from(leads.values()),
    loading: loading.leads,
    error: errors.leads,
    loadLeads
  };
};
