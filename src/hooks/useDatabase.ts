import { useState, useEffect } from 'react';
import { databaseManager } from '../services/database/DatabaseManager';

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
      await databaseManager.initialize();
      const health = await databaseManager.healthCheck();
      const stats = await databaseManager.getStats();
      
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
        const health = await databaseManager.healthCheck();
        const stats = await databaseManager.getStats();
        
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
