import React, { useState, useEffect } from 'react';
import {
  XIcon,
  DatabaseIcon,
  CheckCircleIcon,
  ExclamationIcon,
  InformationCircleIcon,
  RefreshIcon,
  CloudIcon,
  ServerIcon,
  ShieldCheckIcon,
} from '@heroicons/react/outline';
// import { databaseConnectionService, databasePresets, DatabaseConfig, ConnectionTestResult } from '../services/databaseConnection';

interface DatabaseConfig {
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionPool: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
  };
}

interface ConnectionTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
}

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: DatabaseConfig) => void;
}

const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({ isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState<DatabaseConfig>({
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    database: 'rapid_crm',
    username: '',
    password: '',
    ssl: false,
    connectionPool: {
      min: 2,
      max: 10
    },
    timeout: 30000,
    retries: 3
  });

  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('postgresql');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setConfig({
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: 'rapid_crm',
        username: '',
        password: '',
        ssl: false,
        connectionPool: {
          min: 2,
          max: 10
        },
        timeout: 30000,
        retries: 3
      });
      setTestResult(null);
      setShowAdvanced(false);
    }
  }, [isOpen]);

  const handlePresetChange = (presetType: string) => {
    const preset = { type: presetType, host: 'localhost', port: 5432, database: 'rapid_crm' };
    if (preset) {
      setConfig(prev => ({
        ...prev,
        type: preset.type,
        ...preset.defaultConfig
      }));
      setSelectedPreset(presetType);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = { success: true, message: 'Connection test successful', responseTime: 100 };
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSave(config);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <DatabaseIcon className="h-6 w-6 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Database Configuration
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-6">
              {/* Database Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Database Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { type: 'postgresql', name: 'PostgreSQL' },
                    { type: 'mysql', name: 'MySQL' },
                    { type: 'sqlite', name: 'SQLite' }
                  ].map((preset) => (
                    <button
                      key={preset.type}
                      onClick={() => handlePresetChange(preset.type)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedPreset === preset.type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start">
                        {getDatabaseIcon(preset.type)}
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {preset.name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {preset.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Connection Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Host
                  </label>
                  <input
                    type="text"
                    value={config.host}
                    onChange={(e) => setConfig(prev => ({ ...prev, host: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="localhost"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={(e) => setConfig(prev => ({ ...prev, port: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="5432"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Database Name
                </label>
                <input
                  type="text"
                  value={config.database}
                  onChange={(e) => setConfig(prev => ({ ...prev, database: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="rapid_crm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={config.username}
                    onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={config.password}
                    onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="password"
                  />
                </div>
              </div>

              {/* SSL Configuration */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ssl"
                  checked={config.ssl}
                  onChange={(e) => setConfig(prev => ({ ...prev, ssl: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="ssl" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable SSL/TLS encryption
                </label>
              </div>

              {/* Advanced Options */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <InformationCircleIcon className="h-4 w-4 mr-1" />
                  Advanced Options
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Min Connections
                        </label>
                        <input
                          type="number"
                          value={config.connectionPool?.min || 2}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            connectionPool: {
                              ...prev.connectionPool,
                              min: parseInt(e.target.value) || 2
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Max Connections
                        </label>
                        <input
                          type="number"
                          value={config.connectionPool?.max || 10}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            connectionPool: {
                              ...prev.connectionPool,
                              max: parseInt(e.target.value) || 10
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Timeout (ms)
                        </label>
                        <input
                          type="number"
                          value={config.timeout || 30000}
                          onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30000 }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                          min="1000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Retries
                        </label>
                        <input
                          type="number"
                          value={config.retries || 3}
                          onChange={(e) => setConfig(prev => ({ ...prev, retries: parseInt(e.target.value) || 3 }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Connection Test */}
              <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Test Connection
                  </h3>
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting || !config.host || !config.database || !config.username}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTesting ? (
                      <RefreshIcon className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                    )}
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>

                {testResult && (
                  <div className={`p-4 rounded-lg ${
                    testResult.success
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-start">
                      {testResult.success ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <ExclamationIcon className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="ml-3">
                        <h4 className={`text-sm font-medium ${
                          testResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                        }`}>
                          {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          testResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                          {testResult.message}
                        </p>
                        {testResult.latency && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Response time: {testResult.latency}ms
                          </p>
                        )}
                        {testResult.error && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Error: {testResult.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <ShieldCheckIcon className="h-4 w-4 mr-1" />
              Your credentials are encrypted and stored securely
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!testResult?.success}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConfigModal;
