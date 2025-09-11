import { Organization, Person, Vehicle, Driver, Deal, Invoice } from '../types/schema';
import { databaseManager } from './database';

// Initialize database manager
let isInitialized = false;

const initializeDatabase = async () => {
  if (!isInitialized) {
    await databaseManager.initialize();
    isInitialized = true;
  }
};

// Database service functions using real database layer
export const getOrganizations = async (): Promise<Organization[]> => {
  await initializeDatabase();
  const companyRepo = databaseManager.getCompanyRepository();
  return await companyRepo.findAll();
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
  const dealRepo = databaseManager.getDealRepository();
  return await dealRepo.findAll();
};

export const getInvoices = async (): Promise<Invoice[]> => {
  await initializeDatabase();
  // For now, return empty array as we don't have an invoices repository yet
  // In a real implementation, you'd create an InvoiceRepository
  return [];
};

export const getOrganizationById = async (id: string): Promise<Organization | undefined> => {
  await initializeDatabase();
  const companyRepo = databaseManager.getCompanyRepository();
  const company = await companyRepo.findById(id);
  return company || undefined;
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
  const dealRepo = databaseManager.getDealRepository();
  const deal = await dealRepo.findById(id);
  return deal || undefined;
};

export const getInvoiceById = async (id: string): Promise<Invoice | undefined> => {
  await initializeDatabase();
  // For now, return undefined as we don't have an invoices repository yet
  return undefined;
};

// New functions using the database layer
export const createOrganization = async (data: Partial<Organization>): Promise<Organization> => {
  await initializeDatabase();
  const companyRepo = databaseManager.getCompanyRepository();
  return await companyRepo.create(data);
};

export const updateOrganization = async (id: string, data: Partial<Organization>): Promise<Organization | null> => {
  await initializeDatabase();
  const companyRepo = databaseManager.getCompanyRepository();
  return await companyRepo.update(id, data);
};

export const deleteOrganization = async (id: string): Promise<boolean> => {
  await initializeDatabase();
  const companyRepo = databaseManager.getCompanyRepository();
  return await companyRepo.delete(id);
};

export const createDeal = async (data: Partial<Deal>): Promise<Deal> => {
  await initializeDatabase();
  const dealRepo = databaseManager.getDealRepository();
  return await dealRepo.create(data);
};

export const updateDeal = async (id: string, data: Partial<Deal>): Promise<Deal | null> => {
  await initializeDatabase();
  const dealRepo = databaseManager.getDealRepository();
  return await dealRepo.update(id, data);
};

export const deleteDeal = async (id: string): Promise<boolean> => {
  await initializeDatabase();
  const dealRepo = databaseManager.getDealRepository();
  return await dealRepo.delete(id);
};

export const searchOrganizations = async (searchTerm: string): Promise<Organization[]> => {
  await initializeDatabase();
  const companyRepo = databaseManager.getCompanyRepository();
  return await companyRepo.searchCompanies(searchTerm);
};

export const getOrganizationStats = async () => {
  await initializeDatabase();
  const companyRepo = databaseManager.getCompanyRepository();
  return await companyRepo.getCompanyStats();
};

export const getDealStats = async () => {
  await initializeDatabase();
  const dealRepo = databaseManager.getDealRepository();
  return await dealRepo.getDealStats();
};

export const getDatabaseHealth = async () => {
  await initializeDatabase();
  return await databaseManager.healthCheck();
};

export const getDatabaseStats = async () => {
  await initializeDatabase();
  return await databaseManager.getStats();
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
