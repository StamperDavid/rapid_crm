import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DASHBOARD_MODULES, getVisibleModules } from '../config/dashboardModules';

interface ModuleContextType {
  enabledModules: string[];
  toggleModule: (moduleId: string) => void;
  setEnabledModules: (modules: string[]) => void;
  getVisibleModules: (userRole: string) => any[];
  isModuleEnabled: (moduleId: string) => boolean;
  canAccessModule: (moduleId: string, userRole: string) => boolean;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

interface ModuleProviderProps {
  children: ReactNode;
}

export const ModuleProvider: React.FC<ModuleProviderProps> = ({ children }) => {
  const [enabledModules, setEnabledModulesState] = useState<string[]>([]);

  // Load enabled modules from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('enabled_modules');
    if (saved) {
      try {
        const modules = JSON.parse(saved);
        setEnabledModulesState(modules);
      } catch (error) {
        console.error('Error loading enabled modules:', error);
        setEnabledModulesState([]);
      }
    }
  }, []);

  // Save enabled modules to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('enabled_modules', JSON.stringify(enabledModules));
  }, [enabledModules]);

  const toggleModule = (moduleId: string) => {
    setEnabledModulesState(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const setEnabledModules = (modules: string[]) => {
    setEnabledModulesState(modules);
  };

  const getVisibleModulesForRole = (userRole: string) => {
    return getVisibleModules(userRole, enabledModules);
  };

  const isModuleEnabled = (moduleId: string): boolean => {
    return enabledModules.includes(moduleId);
  };

  const canAccessModule = (moduleId: string, userRole: string): boolean => {
    const module = DASHBOARD_MODULES[moduleId];
    if (!module) return false;

    // Always allow required modules
    if (module.required) return true;

    // Check if module is enabled
    if (!enabledModules.includes(moduleId)) return false;

    // Check role-based access
    if (module.adminOnly && userRole !== 'admin') return false;
    if (module.trainerOnly && userRole !== 'admin' && userRole !== 'trainer') return false;

    return true;
  };

  const value: ModuleContextType = {
    enabledModules,
    toggleModule,
    setEnabledModules,
    getVisibleModules: getVisibleModulesForRole,
    isModuleEnabled,
    canAccessModule
  };

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModules = (): ModuleContextType => {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
};
