// CRM Services - All connected to our existing SQLite database
export { ContactService, contactService } from './ContactService';
export type { Contact, ContactFilters, ContactStats } from './ContactService';

export { VehicleService, vehicleService } from './VehicleService';
export type { Vehicle, VehicleFilters, VehicleStats } from './VehicleService';

export { DriverService, driverService } from './DriverService';
export type { Driver, DriverFilters, DriverStats } from './DriverService';

export { ServiceService, serviceService } from './ServiceService';
export type { Service, ServiceFilters, ServiceStats } from './ServiceService';

export { TaskService, taskService } from './TaskService';
export type { Task, TaskFilters, TaskStats } from './TaskService';

// Re-export existing services that are already properly connected
export { CompanyRepository, companyRepository } from '../database/repositories/CompanyRepository';
export { DealRepository, dealRepository } from '../database/repositories/DealRepository';
export { LeadRepository, leadRepository } from '../database/repositories/LeadRepository';
export { UserRepository, userRepository } from '../database/repositories/UserRepository';
