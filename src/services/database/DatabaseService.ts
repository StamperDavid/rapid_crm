import { DatabaseConfig, DatabaseConnection, QueryResult, DatabasePool, DatabaseStats } from './config';

export class DatabaseService {
  private connections: Map<string, DatabaseConnection> = new Map();
  private pools: Map<string, DatabasePool> = new Map();
  private queryCache: Map<string, any> = new Map();
  private isInitialized = false;

  constructor() {
    // Disable auto-initialization to prevent connection errors
    // The AI services now use realDatabaseService for direct SQLite access
    // this.initializeDefaultConnections();
  }

  private async initializeDefaultConnections(): Promise<void> {
    try {
      // Initialize default database connections
      const defaultConfigs = await this.loadDefaultConfigs();
      
      for (const config of defaultConfigs) {
        await this.createConnection(config);
      }
      
      this.isInitialized = true;
      console.log('Database service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database service:', error);
    }
  }

  private async loadDefaultConfigs(): Promise<DatabaseConfig[]> {
    // In a real implementation, this would load from environment variables or config files
    // For browser environment, use fallback values since process.env is not available
    const isBrowser = typeof window !== 'undefined';
    
    return [
      {
        id: 'primary',
        name: 'Primary Database',
        type: 'postgresql',
        host: (isBrowser ? 'localhost' : (process.env.DB_HOST || 'localhost')),
        port: parseInt(isBrowser ? '5432' : (process.env.DB_PORT || '5432')),
        database: (isBrowser ? 'rapid_crm' : (process.env.DB_NAME || 'rapid_crm')),
        username: (isBrowser ? 'postgres' : (process.env.DB_USER || 'postgres')),
        password: (isBrowser ? 'password' : (process.env.DB_PASSWORD || 'password')),
        ssl: isBrowser ? false : (process.env.DB_SSL === 'true'),
        connectionLimit: 20,
        timeout: 30000,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
  }

  async createConnection(config: DatabaseConfig): Promise<DatabaseConnection> {
    try {
      const connection: DatabaseConnection = {
        id: config.id,
        config,
        isConnected: false,
        queryCount: 0,
        errorCount: 0,
        createdAt: new Date().toISOString()
      };

      // Simulate connection establishment
      await this.simulateConnection(connection);
      
      this.connections.set(config.id, connection);
      return connection;
    } catch (error) {
      throw new Error(`Failed to create connection: ${error}`);
    }
  }

  private async simulateConnection(connection: DatabaseConnection): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate connection success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      connection.isConnected = true;
      connection.config.lastConnected = new Date().toISOString();
    } else {
      connection.errorCount++;
      throw new Error('Connection failed');
    }
  }

  async executeQuery<T = any>(
    connectionId: string, 
    query: string, 
    params: any[] = []
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      if (!connection.isConnected) {
        throw new Error(`Connection ${connectionId} is not connected`);
      }

      // Simulate query execution
      const result = await this.simulateQueryExecution<T>(query, params);
      
      const executionTime = Date.now() - startTime;
      connection.queryCount++;
      connection.lastQuery = query;

      return {
        data: result,
        count: result.length,
        executionTime
      };
    } catch (error) {
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.errorCount++;
      }
      
      return {
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      };
    }
  }

  private async simulateQueryExecution<T>(query: string, params: any[]): Promise<T[]> {
    // Simulate query execution time
    const executionTime = Math.random() * 100 + 10; // 10-110ms
    await new Promise(resolve => setTimeout(resolve, executionTime));

    // Simulate different query results based on query type
    if (query.toLowerCase().includes('select')) {
      return this.generateMockSelectResults<T>(query);
    } else if (query.toLowerCase().includes('insert')) {
      return [{ id: Math.random().toString(36), ...params[0] }] as T[];
    } else if (query.toLowerCase().includes('update')) {
      return [{ affectedRows: Math.floor(Math.random() * 10) + 1 }] as T[];
    } else if (query.toLowerCase().includes('delete')) {
      return [{ affectedRows: Math.floor(Math.random() * 5) + 1 }] as T[];
    }

    return [];
  }

  private generateMockSelectResults<T>(query: string): T[] {
    // Generate mock data based on query content
    const results: any[] = [];
    const count = Math.floor(Math.random() * 20) + 1;

    for (let i = 0; i < count; i++) {
      if (query.toLowerCase().includes('companies')) {
        results.push({
          id: `company_${i + 1}`,
          name: `Company ${i + 1}`,
          email: `company${i + 1}@example.com`,
          phone: `555-${String(i + 1).padStart(4, '0')}`,
          address: `${i + 1} Main St, City, State`,
          created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        });
      } else if (query.toLowerCase().includes('users')) {
        results.push({
          id: `user_${i + 1}`,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          role: ['admin', 'manager', 'user'][Math.floor(Math.random() * 3)],
          created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          last_login: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      } else if (query.toLowerCase().includes('deals')) {
        results.push({
          id: `deal_${i + 1}`,
          title: `Deal ${i + 1}`,
          value: Math.floor(Math.random() * 100000) + 10000,
          stage: ['prospect', 'qualification', 'proposal', 'negotiation', 'closed'][Math.floor(Math.random() * 5)],
          probability: Math.floor(Math.random() * 100),
          created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
        });
      } else {
        // Generic result
        results.push({
          id: `record_${i + 1}`,
          name: `Record ${i + 1}`,
          created_at: new Date().toISOString()
        });
      }
    }

    return results as T[];
  }

  async createPool(name: string, connectionIds: string[]): Promise<DatabasePool> {
    const connections = connectionIds
      .map(id => this.connections.get(id))
      .filter((conn): conn is DatabaseConnection => conn !== undefined);

    const pool: DatabasePool = {
      id: `pool_${Date.now()}`,
      name,
      connections,
      maxConnections: connections.length,
      activeConnections: connections.filter(c => c.isConnected).length,
      isHealthy: connections.every(c => c.isConnected),
      lastHealthCheck: new Date().toISOString()
    };

    this.pools.set(pool.id, pool);
    return pool;
  }

  async getConnectionStats(): Promise<DatabaseStats> {
    const allConnections = Array.from(this.connections.values());
    const activeConnections = allConnections.filter(c => c.isConnected);
    
    const totalQueries = allConnections.reduce((sum, c) => sum + c.queryCount, 0);
    const totalErrors = allConnections.reduce((sum, c) => sum + c.errorCount, 0);
    
    return {
      totalConnections: allConnections.length,
      activeConnections: activeConnections.length,
      totalQueries,
      averageResponseTime: totalQueries > 0 ? Math.random() * 50 + 10 : 0,
      errorRate: totalQueries > 0 ? (totalErrors / totalQueries) * 100 : 0,
      databaseSize: `${(Math.random() * 1000 + 100).toFixed(2)} MB`
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    const connections = Array.from(this.connections.values());
    const healthyConnections = connections.filter(c => c.isConnected);
    
    const healthDetails = {
      totalConnections: connections.length,
      healthyConnections: healthyConnections.length,
      unhealthyConnections: connections.length - healthyConnections.length,
      lastCheck: new Date().toISOString(),
      connections: connections.map(c => ({
        id: c.id,
        name: c.config.name,
        type: c.config.type,
        isConnected: c.isConnected,
        queryCount: c.queryCount,
        errorCount: c.errorCount
      }))
    };

    return {
      healthy: healthyConnections.length > 0,
      details: healthDetails
    };
  }

  async backup(connectionId: string): Promise<{ success: boolean; backupPath?: string; error?: string }> {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const backupPath = `backups/${connectionId}_${Date.now()}.sql`;
      
      return {
        success: true,
        backupPath
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async restore(connectionId: string, backupPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) {
        throw new Error(`Connection ${connectionId} not found`);
      }

      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getConnections(): DatabaseConnection[] {
    return Array.from(this.connections.values());
  }

  getPools(): DatabasePool[] {
    return Array.from(this.pools.values());
  }

  async closeConnection(connectionId: string): Promise<boolean> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.isConnected = false;
      this.connections.delete(connectionId);
      return true;
    }
    return false;
  }

  async closeAllConnections(): Promise<void> {
    for (const connection of this.connections.values()) {
      connection.isConnected = false;
    }
    this.connections.clear();
    this.pools.clear();
  }
}

// Singleton instance
export const databaseService = new DatabaseService();
