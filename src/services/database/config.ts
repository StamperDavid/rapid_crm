export interface DatabaseConfig {
  id: string;
  name: string;
  type: 'sqlite';
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  connectionLimit?: number;
  timeout?: number;
  isActive: boolean;
  createdAt: string;
  lastConnected?: string;
}

export interface QueryResult<T = any> {
  data: T[];
  count: number;
  error?: string;
  executionTime: number;
}

export interface DatabaseConnection {
  id: string;
  config: DatabaseConfig;
  isConnected: boolean;
  lastQuery?: string;
  queryCount: number;
  errorCount: number;
  createdAt: string;
}

export interface DatabasePool {
  id: string;
  name: string;
  connections: DatabaseConnection[];
  maxConnections: number;
  activeConnections: number;
  isHealthy: boolean;
  lastHealthCheck: string;
}

export interface Migration {
  id: string;
  name: string;
  version: string;
  appliedAt: string;
  rollbackSql?: string;
}

export interface DatabaseStats {
  totalConnections: number;
  activeConnections: number;
  totalQueries: number;
  averageResponseTime: number;
  errorRate: number;
  lastBackup?: string;
  databaseSize: string;
}

// Default database configurations - ONLY SQLite
export const DEFAULT_DATABASES: DatabaseConfig[] = [
  {
    id: 'primary',
    name: 'Rapid CRM SQLite Database',
    type: 'sqlite',
    host: 'localhost',
    port: 0,
    database: 'instance/rapid_crm.db',
    username: '',
    password: '',
    ssl: false,
    connectionLimit: 20,
    timeout: 30000,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];
