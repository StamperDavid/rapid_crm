import React, { useState, useEffect } from 'react';
// Removed databaseManager import - using API calls to server instead
import { 
  DatabaseIcon, 
  CheckCircleIcon, 
  ExclamationIcon,
  RefreshIcon,
  XCircleIcon
} from '@heroicons/react/outline';

interface DatabaseStatus {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  health: {
    healthy: boolean;
    details: any;
  } | null;
  stats: any | null;
}

const DatabaseInitializer: React.FC = () => {
  const [status, setStatus] = useState<DatabaseStatus>({
    isInitialized: false,
    isInitializing: false,
    error: null,
    health: null,
    stats: null
  });

  const initializeDatabase = async () => {
    setStatus(prev => ({ ...prev, isInitializing: true, error: null }));
    
    try {
      // Using API calls to server instead of databaseManager
      const healthResponse = await fetch('/api/database/health');
      const statsResponse = await fetch('/api/database/stats');
      const health = await healthResponse.json();
      const stats = await statsResponse.json();
      
      setStatus({
        isInitialized: true,
        isInitializing: false,
        error: null,
        health,
        stats
      });
    } catch (error) {
      setStatus({
        isInitialized: false,
        isInitializing: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        health: null,
        stats: null
      });
    }
  };

  const refreshStatus = async () => {
    if (status.isInitialized) {
      try {
        // Using API calls to server instead of databaseManager
        const healthResponse = await fetch('/api/database/health');
        const statsResponse = await fetch('/api/database/stats');
        const health = await healthResponse.json();
        const stats = await statsResponse.json();
        
        setStatus(prev => ({
          ...prev,
          health,
          stats
        }));
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    }
  };

  useEffect(() => {
    // Auto-initialize on component mount
    initializeDatabase();
  }, []);

  const getStatusIcon = () => {
    if (status.isInitializing) {
      return <RefreshIcon className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    
    if (status.error) {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
    
    if (status.isInitialized && status.health?.healthy) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    
    return <ExclamationIcon className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (status.isInitializing) {
      return 'Initializing Database...';
    }
    
    if (status.error) {
      return `Error: ${status.error}`;
    }
    
    if (status.isInitialized && status.health?.healthy) {
      return 'Database Connected';
    }
    
    return 'Database Not Connected';
  };

  const getStatusColor = () => {
    if (status.isInitializing) {
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300';
    }
    
    if (status.error) {
      return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
    }
    
    if (status.isInitialized && status.health?.healthy) {
      return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
    }
    
    return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <DatabaseIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            Database Status
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshStatus}
            disabled={!status.isInitialized || status.isInitializing}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshIcon className="h-4 w-4 mr-1" />
            Refresh
          </button>
          
          {!status.isInitialized && !status.isInitializing && (
            <button
              onClick={initializeDatabase}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Initialize
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Error Message */}
        {status.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <div className="flex">
              <ExclamationIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Database Error
                </h3>
                <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {status.error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Details */}
        {status.health && (
          <div className="bg-slate-50 dark:bg-slate-700 rounded-md p-4">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
              Connection Health
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Total Connections:</span>
                <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                  {status.health.details?.totalConnections || 0}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Healthy Connections:</span>
                <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                  {status.health.details?.healthyConnections || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {status.stats && (
          <div className="bg-slate-50 dark:bg-slate-700 rounded-md p-4">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
              Database Statistics
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Total Queries:</span>
                <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                  {status.stats.totalQueries?.toLocaleString() || 0}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Avg Response Time:</span>
                <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                  {status.stats.averageResponseTime?.toFixed(1) || 0}ms
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Error Rate:</span>
                <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                  {status.stats.errorRate?.toFixed(2) || 0}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Database Size:</span>
                <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                  {status.stats.databaseSize || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Connection Details */}
        {status.health?.details?.connections && (
          <div className="bg-slate-50 dark:bg-slate-700 rounded-md p-4">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
              Connection Details
            </h4>
            <div className="space-y-2">
              {status.health.details.connections.map((conn: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      conn.isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-slate-900 dark:text-slate-100">{conn.name}</span>
                    <span className="text-slate-500 dark:text-slate-400">({conn.type})</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {conn.queryCount} queries, {conn.errorCount} errors
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseInitializer;
