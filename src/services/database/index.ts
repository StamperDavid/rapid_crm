


// Main database exports - REMOVED to prevent direct database access
// All database operations should go through API endpoints
// export { DatabaseManager, databaseManager } from './DatabaseManager';
// export { DatabaseService, databaseService } from './DatabaseService';
export { MigrationService } from './migrations/MigrationService';

// Repository exports
export { BaseRepository } from './repositories/BaseRepository';
export { CompanyRepository } from './repositories/CompanyRepository';
export type { Company, CompanyFilters } from './repositories/CompanyRepository';
export { UserRepository } from './repositories/UserRepository';
export type { User, UserPermissions, UserFilters } from './repositories/UserRepository';
export { DealRepository } from './repositories/DealRepository';
export type { Deal, DealFilters, DealStats } from './repositories/DealRepository';
export { LeadRepository } from './repositories/LeadRepository';

// Configuration exports
export type {
  DatabaseConfig,
  QueryResult,
  DatabaseConnection,
  DatabasePool,
  Migration,
  DatabaseStats
} from './config';
export { DEFAULT_DATABASES } from './config';

// Types
export type { RepositoryOptions } from './repositories/BaseRepository';
