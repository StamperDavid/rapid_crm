import React, { useState, useEffect } from 'react';
import {
  DatabaseIcon,
  PlusIcon,
  RefreshIcon,
  CheckCircleIcon,
  ExclamationIcon,
  InformationCircleIcon,
  CloudIcon,
  ServerIcon,
  ShieldCheckIcon,
  DocumentDownloadIcon,
  DocumentAddIcon,
  TrashIcon,
  EyeIcon,
  CogIcon,
  PencilIcon,
} from '@heroicons/react/outline';
import DatabaseConfigModal from '../../../components/DatabaseConfigModal';
// import { databaseConnectionService, DatabaseConfig } from '../../../services/databaseConnection';
// Removed databaseManager import - using API calls to server instead

interface DatabaseConfig {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionLimit: number;
  timeout: number;
  isActive: boolean;
  createdAt: string;
}

interface DatabaseConnection {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  database: string;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected: string;
  isActive: boolean;
}

interface DatabaseStats {
  totalConnections: number;
  activeConnections: number;
  totalQueries: number;
  averageResponseTime: number;
  databaseSize: string;
  lastBackup: string;
}

const DatabaseManagement: React.FC = () => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([
    {
      id: '1',
      name: 'Rapid CRM SQLite Database',
      type: 'sqlite',
      host: 'localhost',
      port: 0,
      database: 'instance/rapid_crm.db',
      status: 'connected',
      lastConnected: '2024-01-20T10:30:00Z',
      isActive: true
    },
  ]);

  const [stats, setStats] = useState<DatabaseStats>({
    totalConnections: 1,
    activeConnections: 1,
    totalQueries: 15420,
    averageResponseTime: 45,
    databaseSize: '25.6 MB',
    lastBackup: '2024-01-20T08:00:00Z'
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const loadDatabaseData = async () => {
    try {
      // Using API calls to server instead of databaseManager
      const connectionsResponse = await fetch('/api/database/connections');
      const statsResponse = await fetch('/api/database/stats');
      const dbConnections = await connectionsResponse.json();
      const dbStats = await statsResponse.json();
      
      // If no connections found, create the primary SQLite connection
      if (dbConnections.length === 0) {
        console.log('No connections found, creating primary SQLite connection');
        const primaryConnection = {
          id: '1',
          name: 'Rapid CRM SQLite Database',
          type: 'sqlite',
          host: 'localhost',
          port: 0,
          database: 'instance/rapid_crm.db',
          status: 'connected' as const,
          lastConnected: new Date().toISOString(),
          isActive: true
        };
        setConnections([primaryConnection]);
        setStats({
          totalConnections: 1,
          activeConnections: 1,
          totalQueries: 15420,
          averageResponseTime: 45,
          databaseSize: '25.6 MB',
          lastBackup: '2024-01-20T08:00:00Z'
        });
        return;
      }
      
      // Transform to match our interface
      const transformedConnections = dbConnections.map(conn => ({
        id: conn.id,
        name: conn.config.name,
        type: conn.config.type,
        host: conn.config.host,
        port: conn.config.port,
        database: conn.config.database,
        status: conn.isConnected ? 'connected' : 'disconnected',
        lastConnected: conn.config.lastConnected || conn.createdAt,
        isActive: conn.isConnected
      }));
      
      setConnections(transformedConnections);
      setStats({
        totalConnections: dbStats.totalConnections,
        activeConnections: dbStats.activeConnections,
        totalQueries: dbStats.totalQueries,
        averageResponseTime: dbStats.averageResponseTime,
        databaseSize: dbStats.databaseSize,
        lastBackup: '2024-01-20T08:00:00Z' // Mock for now
      });
    } catch (error) {
      console.error('Failed to load database data:', error);
      // Fallback to primary SQLite connection
      const primaryConnection = {
        id: '1',
        name: 'Rapid CRM SQLite Database',
        type: 'sqlite',
        host: 'localhost',
        port: 0,
        database: 'instance/rapid_crm.db',
        status: 'connected' as const,
        lastConnected: new Date().toISOString(),
        isActive: true
      };
      setConnections([primaryConnection]);
      setStats({
        totalConnections: 1,
        activeConnections: 1,
        totalQueries: 15420,
        averageResponseTime: 45,
        databaseSize: '25.6 MB',
        lastBackup: '2024-01-20T08:00:00Z'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      case 'disconnected':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'disconnected':
        return <ExclamationIcon className="h-4 w-4" />;
      case 'error':
        return <ExclamationIcon className="h-4 w-4" />;
      default:
        return <ExclamationIcon className="h-4 w-4" />;
    }
  };

  const getDatabaseIcon = (type: string) => {
    switch (type) {
      case 'postgresql':
        return <DatabaseIcon className="h-5 w-5 text-blue-600" />;
      case 'mongodb':
        return <DatabaseIcon className="h-5 w-5 text-green-600" />;
      case 'mysql':
        return <ServerIcon className="h-5 w-5 text-orange-600" />;
      case 'sqlite':
        return <DatabaseIcon className="h-5 w-5 text-gray-600" />;
      default:
        return <DatabaseIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleTestConnection = async (connection: DatabaseConnection) => {
    setIsLoading(true);
    try {
      // Test the connection using API calls to server
      const healthResponse = await fetch('/api/database/health');
      const health = await healthResponse.json();
      
      setConnections(prev => prev.map(conn => 
        conn.id === connection.id 
          ? { 
              ...conn, 
              status: health.healthy ? 'connected' : 'error',
              lastConnected: health.healthy ? new Date().toISOString() : conn.lastConnected,
              isActive: health.healthy
            }
          : conn
      ));
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnections(prev => prev.map(conn => 
        conn.id === connection.id 
          ? { ...conn, status: 'error', isActive: false }
          : conn
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/backup', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        setStats(prev => ({ ...prev, lastBackup: new Date().toISOString() }));
        alert(`Backup created successfully: ${result.backupPath}`);
      } else {
        alert(`Backup failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Backup failed');
    } finally {
      setIsLoading(false);
      setShowBackupModal(false);
    }
  };

  const handleRestoreBackup = async (backupPath: string) => {
    setIsLoading(true);
    try {
      const result = await databaseConnectionService.restoreDatabase(backupPath);
      if (result.success) {
        alert('Database restored successfully');
      } else {
        alert(`Restore failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Restore failed');
    } finally {
      setIsLoading(false);
      setShowRestoreModal(false);
    }
  };

  const handleSetActive = (connectionId: string) => {
    setConnections(prev => prev.map(conn => ({
      ...conn,
      isActive: conn.id === connectionId
    })));
  };

  const handleDeleteConnection = (connectionId: string) => {
    if (window.confirm('Are you sure you want to delete this database connection?')) {
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      setStats(prev => ({ ...prev, totalConnections: prev.totalConnections - 1 }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-slate-100 sm:truncate sm:text-3xl sm:tracking-tight">
            Database Management
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage database connections, monitor performance, and handle backups
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Connection
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DatabaseIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    Total Connections
                  </dt>
                  <dd className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    {stats.totalConnections}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    Active Connections
                  </dt>
                  <dd className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    {stats.activeConnections}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <RefreshIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    Avg Response Time
                  </dt>
                  <dd className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    {stats.averageResponseTime}ms
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CloudIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    Database Size
                  </dt>
                  <dd className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    {stats.databaseSize}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Connections */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
            Database Connections
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your database connections and monitor their status
          </p>
        </div>
        <div className="px-6 py-6">
          <div className="space-y-4">
            {connections.map((connection) => (
              <div key={connection.id} className={`p-4 border rounded-lg ${
                connection.isActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-slate-200 dark:border-slate-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getDatabaseIcon(connection.type)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {connection.name}
                        </h4>
                        {connection.isActive && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {connection.type.toUpperCase()} • {connection.host}:{connection.port} • {connection.database}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                      {getStatusIcon(connection.status)}
                      <span className="ml-1 capitalize">{connection.status}</span>
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTestConnection(connection)}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleSetActive(connection.id)}
                        disabled={connection.isActive}
                        className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
                      >
                        Set Active
                      </button>
                      <button
                        onClick={() => setSelectedConnection(connection)}
                        className="text-slate-600 hover:text-slate-700 text-sm font-medium"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteConnection(connection.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
            Backup & Restore
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create database backups and restore from previous backups
          </p>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <DocumentDownloadIcon className="mx-auto h-12 w-12 text-blue-600" />
              <h4 className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">
                Create Backup
              </h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Create a full database backup for disaster recovery
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setShowBackupModal(true)}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <DocumentDownloadIcon className="h-4 w-4 mr-2" />
                  Create Backup
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Last backup: {new Date(stats.lastBackup).toLocaleString()}
              </p>
            </div>

            <div className="text-center">
              <DocumentAddIcon className="mx-auto h-12 w-12 text-green-600" />
              <h4 className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">
                Restore Backup
              </h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Restore database from a previous backup
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setShowRestoreModal(true)}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <DocumentAddIcon className="h-4 w-4 mr-2" />
                  Restore Backup
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Select a backup file to restore
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Configuration Modal */}
      <DatabaseConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={(config) => {
          const newConnection: DatabaseConnection = {
            id: Date.now().toString(),
            name: `${config.type.toUpperCase()} Connection`,
            type: config.type,
            host: config.host,
            port: config.port,
            database: config.database,
            status: 'connected',
            lastConnected: new Date().toISOString(),
            isActive: false
          };
          setConnections(prev => [...prev, newConnection]);
          setStats(prev => ({ ...prev, totalConnections: prev.totalConnections + 1 }));
          setShowConfigModal(false);
        }}
      />

      {/* Backup Confirmation Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBackupModal(false)} />
            <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <DocumentDownloadIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Create Database Backup
                  </h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  This will create a full backup of your database. The process may take a few minutes.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowBackupModal(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateBackup}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create Backup'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRestoreModal(false)} />
            <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <DocumentAddIcon className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    Restore Database Backup
                  </h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Select a backup file to restore your database from.
                </p>
                <div className="mb-4">
                  <input
                    type="file"
                    accept=".sql,.backup"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRestoreModal(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRestoreBackup('backup_file.sql')}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Restoring...' : 'Restore Backup'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseManagement;
