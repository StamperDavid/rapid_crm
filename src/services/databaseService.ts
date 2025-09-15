import { Organization, Person, Vehicle, Driver, Deal, Invoice } from '../types/schema';
// Removed databaseManager import - using API calls to server instead

// Initialize database manager
let isInitialized = false;

const initializeDatabase = async () => {
  if (!isInitialized) {
    // No initialization needed - using API calls to server
    isInitialized = true;
  }
};

// Database service functions using real database layer
export const getOrganizations = async (): Promise<Organization[]> => {
  await initializeDatabase();
  const response = await fetch('/api/companies');
  return await response.json();
};

export const getPersons = async (): Promise<Person[]> => {
  await initializeDatabase();
  // For now, return empty array as we don't have a contacts repository yet
  // In a real implementation, you'd create a ContactRepository
  return [];
};

export const getVehicles = async (): Promise<Vehicle[]> => {
  await initializeDatabase();
  // For now, return empty array as we don't have a vehicles repository yet
  // In a real implementation, you'd create a VehicleRepository
  return [];
};

export const getDrivers = async (): Promise<Driver[]> => {
  await initializeDatabase();
  // For now, return empty array as we don't have a drivers repository yet
  // In a real implementation, you'd create a DriverRepository
  return [];
};

export const getDeals = async (): Promise<Deal[]> => {
  await initializeDatabase();
  const response = await fetch('/api/deals');
  return await response.json();
};

export const getInvoices = async (): Promise<Invoice[]> => {
  await initializeDatabase();
  // For now, return empty array as we don't have an invoices repository yet
  // In a real implementation, you'd create an InvoiceRepository
  return [];
};

export const getOrganizationById = async (id: string): Promise<Organization | undefined> => {
  await initializeDatabase();
  const response = await fetch(`/api/companies/${id}`);
  if (!response.ok) return undefined;
  return await response.json();
};

export const getPersonById = async (id: string): Promise<Person | undefined> => {
  await initializeDatabase();
  // For now, return undefined as we don't have a contacts repository yet
  return undefined;
};

export const getVehicleById = async (id: string): Promise<Vehicle | undefined> => {
  await initializeDatabase();
  // For now, return undefined as we don't have a vehicles repository yet
  return undefined;
};

export const getDriverById = async (id: string): Promise<Driver | undefined> => {
  await initializeDatabase();
  // For now, return undefined as we don't have a drivers repository yet
  return undefined;
};

export const getDealById = async (id: string): Promise<Deal | undefined> => {
  await initializeDatabase();
  const response = await fetch(`/api/deals/${id}`);
  if (!response.ok) return undefined;
  return await response.json();
};

export const getInvoiceById = async (id: string): Promise<Invoice | undefined> => {
  await initializeDatabase();
  // For now, return undefined as we don't have an invoices repository yet
  return undefined;
};

// New functions using the database layer
export const createOrganization = async (data: Partial<Organization>): Promise<Organization> => {
  await initializeDatabase();
  const response = await fetch('/api/companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
};

export const updateOrganization = async (id: string, data: Partial<Organization>): Promise<Organization | null> => {
  await initializeDatabase();
  const response = await fetch(`/api/companies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) return null;
  return await response.json();
};

export const deleteOrganization = async (id: string): Promise<boolean> => {
  await initializeDatabase();
  const response = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
  return response.ok;
};

export const createDeal = async (data: Partial<Deal>): Promise<Deal> => {
  await initializeDatabase();
  const response = await fetch('/api/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
};

export const updateDeal = async (id: string, data: Partial<Deal>): Promise<Deal | null> => {
  await initializeDatabase();
  const response = await fetch(`/api/deals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) return null;
  return await response.json();
};

export const deleteDeal = async (id: string): Promise<boolean> => {
  await initializeDatabase();
  const response = await fetch(`/api/deals/${id}`, { method: 'DELETE' });
  return response.ok;
};

export const searchOrganizations = async (searchTerm: string): Promise<Organization[]> => {
  await initializeDatabase();
  const response = await fetch(`/api/companies/search?q=${encodeURIComponent(searchTerm)}`);
  return await response.json();
};

export const getOrganizationStats = async () => {
  await initializeDatabase();
  const response = await fetch('/api/companies/stats');
  return await response.json();
};

export const getDealStats = async () => {
  await initializeDatabase();
  const response = await fetch('/api/deals/stats');
  return await response.json();
};

export const getDatabaseHealth = async () => {
  await initializeDatabase();
  const response = await fetch('/api/database/health');
  return await response.json();
};

export const getDatabaseStats = async () => {
  await initializeDatabase();
  const response = await fetch('/api/database/stats');
  return await response.json();
};

// Legacy compatibility functions
export const getCompanies = getOrganizations;
export const getCompany = getOrganizationById;
export const createCompany = createOrganization;
export const updateCompany = updateOrganization;
export const deleteCompany = deleteOrganization;

export const getContacts = getPersons;
export const getContact = getPersonById;
export const createContact = async (data: Partial<Person>): Promise<Person> => {
  // Placeholder implementation
  throw new Error('Contact creation not yet implemented');
};

export const updateContact = async (id: string, data: Partial<Person>): Promise<Person> => {
  // Placeholder implementation
  throw new Error('Contact update not yet implemented');
};

export const deleteContact = async (id: string): Promise<boolean> => {
  // Placeholder implementation
  throw new Error('Contact deletion not yet implemented');
};

export const createVehicle = async (data: Partial<Vehicle>): Promise<Vehicle> => {
  // Placeholder implementation
  throw new Error('Vehicle creation not yet implemented');
};

export const updateVehicle = async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
  // Placeholder implementation
  throw new Error('Vehicle update not yet implemented');
};

export const deleteVehicle = async (id: string): Promise<boolean> => {
  // Placeholder implementation
  throw new Error('Vehicle deletion not yet implemented');
};

export const createDriver = async (data: Partial<Driver>): Promise<Driver> => {
  // Placeholder implementation
  throw new Error('Driver creation not yet implemented');
};

export const updateDriver = async (id: string, data: Partial<Driver>): Promise<Driver> => {
  // Placeholder implementation
  throw new Error('Driver update not yet implemented');
};

export const deleteDriver = async (id: string): Promise<boolean> => {
  // Placeholder implementation
  throw new Error('Driver deletion not yet implemented');
};

export const createInvoice = async (data: Partial<Invoice>): Promise<Invoice> => {
  // Placeholder implementation
  throw new Error('Invoice creation not yet implemented');
};

export const updateInvoice = async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
  // Placeholder implementation
  throw new Error('Invoice update not yet implemented');
};

export const deleteInvoice = async (id: string): Promise<boolean> => {
  // Placeholder implementation
  throw new Error('Invoice deletion not yet implemented');
};
