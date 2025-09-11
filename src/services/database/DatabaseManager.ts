import { DatabaseService } from './DatabaseService';
import { MigrationService } from './migrations/MigrationService';
import { CompanyRepository } from './repositories/CompanyRepository';
import { UserRepository } from './repositories/UserRepository';
import { DealRepository } from './repositories/DealRepository';
import { DatabaseConfig, DatabaseStats } from './config';

export class DatabaseManager {
  private db: DatabaseService;
  private migrationService: MigrationService;
  private repositories: Map<string, any> = new Map();
  private isInitialized = false;

  constructor() {
    this.db = new DatabaseService();
    this.migrationService = new MigrationService(this.db);
    this.initializeRepositories();
  }

  private initializeRepositories(): void {
    this.repositories.set('companies', new CompanyRepository(this.db));
    this.repositories.set('users', new UserRepository(this.db));
    this.repositories.set('deals', new DealRepository(this.db));
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Database manager already initialized');
      return;
    }

    try {
      console.log('Initializing database manager...');
      
      // Run migrations
      await this.migrationService.runAllMigrations();
      
      this.isInitialized = true;
      console.log('Database manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database manager:', error);
      throw error;
    }
  }

  // Repository access methods
  getCompanyRepository(): CompanyRepository {
    return this.repositories.get('companies');
  }

  getUserRepository(): UserRepository {
    return this.repositories.get('users');
  }

  getDealRepository(): DealRepository {
    return this.repositories.get('deals');
  }

  // Database service methods
  async executeQuery<T = any>(connectionId: string, query: string, params: any[] = []): Promise<any> {
    return this.db.executeQuery<T>(connectionId, query, params);
  }

  async createConnection(config: DatabaseConfig): Promise<any> {
    return this.db.createConnection(config);
  }

  async getConnectionStats(): Promise<DatabaseStats> {
    return this.db.getConnectionStats();
  }

  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    return this.db.healthCheck();
  }

  async backup(connectionId: string): Promise<{ success: boolean; backupPath?: string; error?: string }> {
    return this.db.backup(connectionId);
  }

  async restore(connectionId: string, backupPath: string): Promise<{ success: boolean; error?: string }> {
    return this.db.restore(connectionId, backupPath);
  }

  getConnections(): any[] {
    return this.db.getConnections();
  }

  getPools(): any[] {
    return this.db.getPools();
  }

  // Migration methods
  async runMigrations(): Promise<void> {
    await this.migrationService.runAllMigrations();
  }

  async getAppliedMigrations(): Promise<any[]> {
    return this.migrationService.getAppliedMigrations();
  }

  async rollbackMigration(migrationName: string): Promise<void> {
    await this.migrationService.rollbackMigration(migrationName);
  }

  // Utility methods
  async isHealthy(): Promise<boolean> {
    const health = await this.healthCheck();
    return health.healthy;
  }

  async getStats(): Promise<DatabaseStats> {
    return this.getConnectionStats();
  }

  async closeAllConnections(): Promise<void> {
    await this.db.closeAllConnections();
  }

  // Transaction support (simplified)
  async withTransaction<T>(callback: (db: DatabaseService) => Promise<T>): Promise<T> {
    // In a real implementation, this would handle transaction begin/commit/rollback
    try {
      return await callback(this.db);
    } catch (error) {
      // Rollback would happen here
      throw error;
    }
  }

  // Batch operations
  async batchInsert<T>(tableName: string, data: Partial<T>[]): Promise<T[]> {
    if (data.length === 0) return [];
    
    const fields = Object.keys(data[0]).filter(key => data[0][key as keyof T] !== undefined);
    const values: any[] = [];
    const placeholders: string[] = [];
    
    data.forEach((item, index) => {
      const itemPlaceholders = fields.map((_, fieldIndex) => 
        `$${index * fields.length + fieldIndex + 1}`
      ).join(', ');
      placeholders.push(`(${itemPlaceholders})`);
      
      fields.forEach(field => {
        values.push(item[field as keyof T]);
      });
    });
    
    const query = `
      INSERT INTO ${tableName} (${fields.join(', ')}) 
      VALUES ${placeholders.join(', ')} 
      RETURNING *
    `;
    
    const result = await this.db.executeQuery<T>('primary', query, values);
    return result.data;
  }

  async batchUpdate<T>(
    tableName: string, 
    updates: { id: string; data: Partial<T> }[]
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (const update of updates) {
      const fields = Object.keys(update.data).filter(key => update.data[key as keyof T] !== undefined);
      const values = fields.map(field => update.data[field as keyof T]);
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      
      const query = `
        UPDATE ${tableName} 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = $${fields.length + 1} 
        RETURNING *
      `;
      
      const result = await this.db.executeQuery<T>('primary', query, [...values, update.id]);
      if (result.data[0]) {
        results.push(result.data[0]);
      }
    }
    
    return results;
  }

  async batchDelete(tableName: string, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ');
    const query = `DELETE FROM ${tableName} WHERE id IN (${placeholders})`;
    
    const result = await this.db.executeQuery('primary', query, ids);
    return result.count;
  }

  // Search functionality
  async search<T>(
    tableName: string, 
    searchTerm: string, 
    searchFields: string[],
    connectionId: string = 'primary'
  ): Promise<T[]> {
    const conditions = searchFields.map((field, index) => 
      `${field} ILIKE $${index + 1}`
    ).join(' OR ');
    
    const searchValue = `%${searchTerm}%`;
    const params = searchFields.map(() => searchValue);
    
    const query = `SELECT * FROM ${tableName} WHERE ${conditions} ORDER BY created_at DESC`;
    const result = await this.db.executeQuery<T>(connectionId, query, params);
    return result.data;
  }

  // Pagination
  async paginate<T>(
    tableName: string,
    page: number = 1,
    limit: number = 10,
    orderBy: string = 'created_at',
    orderDirection: 'ASC' | 'DESC' = 'DESC',
    connectionId: string = 'primary'
  ): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
    const countResult = await this.db.executeQuery<{ count: string }>(connectionId, countQuery);
    const total = parseInt(countResult.data[0]?.count || '0');
    
    // Get paginated data
    const dataQuery = `
      SELECT * FROM ${tableName} 
      ORDER BY ${orderBy} ${orderDirection} 
      LIMIT $1 OFFSET $2
    `;
    const dataResult = await this.db.executeQuery<T>(connectionId, dataQuery, [limit, offset]);
    
    return {
      data: dataResult.data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.closeAllConnections();
    this.isInitialized = false;
  }
}

// Singleton instance
export const databaseManager = new DatabaseManager();
