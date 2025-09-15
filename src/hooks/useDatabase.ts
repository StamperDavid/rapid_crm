import { useState, useEffect } from 'react';
// Removed databaseManager import - using API calls to server instead

interface DatabaseState {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  health: {
    healthy: boolean;
    details: any;
  } | null;
  stats: any | null;
}

export const useDatabase = () => {
  const [state, setState] = useState<DatabaseState>({
    isInitialized: false,
    isInitializing: false,
    error: null,
    health: null,
    stats: null
  });

  const initialize = async () => {
    setState(prev => ({ ...prev, isInitializing: true, error: null }));
    
    try {
      // Using API calls to server instead of databaseManager
      const healthResponse = await fetch('/api/database/health');
      const statsResponse = await fetch('/api/database/stats');
      const health = await healthResponse.json();
      const stats = await statsResponse.json();
      
      setState({
        isInitialized: true,
        isInitializing: false,
        error: null,
        health,
        stats
      });
    } catch (error) {
      setState({
        isInitialized: false,
        isInitializing: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        health: null,
        stats: null
      });
    }
  };

  const refresh = async () => {
    if (state.isInitialized) {
      try {
        // Using API calls to server instead of databaseManager
        const healthResponse = await fetch('/api/database/health');
        const statsResponse = await fetch('/api/database/stats');
        const health = await healthResponse.json();
        const stats = await statsResponse.json();
        
        setState(prev => ({
          ...prev,
          health,
          stats
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    }
  };

  useEffect(() => {
    // Auto-initialize on mount
    initialize();
  }, []);

  return {
    ...state,
    initialize,
    refresh
  };
};
