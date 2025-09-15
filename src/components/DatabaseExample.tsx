import React, { useState, useEffect } from 'react';
// Removed databaseManager import - using API calls to server instead
import { useDatabase } from '../hooks/useDatabase';
import { 
  DatabaseIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  CheckCircleIcon,
  ExclamationIcon
} from '@heroicons/react/outline';

const DatabaseExample: React.FC = () => {
  const { isInitialized, isInitializing, error, health, stats, refresh } = useDatabase();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  const loadCompanies = async () => {
    if (!isInitialized) return;
    
    setLoading(true);
    try {
      // Using API calls to server instead of databaseManager
      const response = await fetch('/api/companies');
      const companyData = await response.json();
      setCompanies(companyData);
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async () => {
    if (!newCompanyName.trim() || !isInitialized) return;
    
    setLoading(true);
    try {
      // Using API calls to server instead of databaseManager
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCompanyName,
          email: `${newCompanyName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: '555-0000',
          address: '123 Main St',
          city: 'Anytown',
          state: 'ST',
          zipCode: '12345',
          country: 'US',
          industry: 'Transportation',
          size: 'small',
          status: 'active'
        })
      });
      const newCompany = await response.json();
      
      setCompanies(prev => [newCompany, ...prev]);
      setNewCompanyName('');
    } catch (error) {
      console.error('Failed to create company:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id: string) => {
    if (!isInitialized) return;
    
    setLoading(true);
    try {
      // Using API calls to server instead of databaseManager
      await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      setCompanies(prev => prev.filter(company => company.id !== id));
    } catch (error) {
      console.error('Failed to delete company:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      loadCompanies();
    }
  }, [isInitialized]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <DatabaseIcon className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-slate-600 dark:text-slate-400">Initializing Database...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
        <div className="flex">
          <ExclamationIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Database Error
            </h3>
            <div className="mt-1 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Database Status */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <DatabaseIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Database Status
            </h3>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
          >
            Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Status:</span>
            <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              health?.healthy 
                ? 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300'
                : 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {health?.healthy ? 'Healthy' : 'Unhealthy'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Total Queries:</span>
            <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
              {stats?.totalQueries?.toLocaleString() || 0}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Active Connections:</span>
            <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
              {stats?.activeConnections || 0}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Avg Response Time:</span>
            <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
              {stats?.averageResponseTime?.toFixed(1) || 0}ms
            </span>
          </div>
        </div>
      </div>

      {/* Companies Management */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            Companies ({companies.length})
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              placeholder="Company name"
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
            />
            <button
              onClick={createCompany}
              disabled={!newCompanyName.trim() || loading}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-2">
              <DatabaseIcon className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-slate-600 dark:text-slate-400">Loading...</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {companies.map((company) => (
            <div key={company.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-md">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">{company.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{company.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  company.status === 'active' 
                    ? 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300'
                    : 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300'
                }`}>
                  {company.status}
                </span>
                <button
                  onClick={() => deleteCompany(company.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {companies.length === 0 && !loading && (
          <div className="text-center py-8">
            <DatabaseIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No companies found</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Create your first company to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseExample;
