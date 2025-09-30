import React, { useState, useEffect } from 'react';
import { CogIcon, CheckIcon, XIcon } from '@heroicons/react/outline';
import { DASHBOARD_MODULES, MODULE_CATEGORIES, getAvailableModules } from '../config/dashboardModules';
import { useUser } from '../contexts/UserContext';
import { useModules } from '../contexts/ModuleContext';
import HelpIcon from './HelpIcon';

interface DashboardModuleToggleProps {
  enabledModules: string[];
  onToggleModule: (moduleId: string) => void;
  onSave: (modules: string[]) => void;
  onCancel: () => void;
}

const DashboardModuleToggle: React.FC<DashboardModuleToggleProps> = ({
  enabledModules,
  onToggleModule,
  onSave,
  onCancel
}) => {
  const { user } = useUser();
  const { toggleModule } = useModules();
  const [localEnabledModules, setLocalEnabledModules] = useState<string[]>(enabledModules);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalEnabledModules(enabledModules);
    setHasChanges(false);
  }, [enabledModules]);

  const availableModules = getAvailableModules(user?.role || 'user');

  const handleToggleModule = (moduleId: string) => {
    const newEnabledModules = localEnabledModules.includes(moduleId)
      ? localEnabledModules.filter(id => id !== moduleId)
      : [...localEnabledModules, moduleId];
    
    setLocalEnabledModules(newEnabledModules);
    setHasChanges(true);
    toggleModule(moduleId);
  };

  const handleSave = () => {
    onSave(localEnabledModules);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setLocalEnabledModules(enabledModules);
    setHasChanges(false);
    onCancel();
  };

  const modulesByCategory = availableModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, typeof availableModules>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CogIcon className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Dashboard Module Settings
            </h2>
            <HelpIcon 
              content="Enable or disable dashboard modules based on your needs. Core and compliance modules are always visible. Advanced, training, and admin modules can be toggled on/off."
              size="sm"
              position="right"
              className="ml-3"
            />
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {Object.entries(modulesByCategory).map(([categoryId, modules]) => {
              const category = MODULE_CATEGORIES[categoryId as keyof typeof MODULE_CATEGORIES];
              if (!category) return null;

              return (
                <div key={categoryId} className="space-y-3">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      ({modules.length} modules)
                    </span>
                    <HelpIcon 
                      content={category.description}
                      size="sm"
                      position="right"
                      className="ml-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modules.map((module) => {
                      const isEnabled = localEnabledModules.includes(module.id);
                      
                      return (
                        <div
                          key={module.id}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                            isEnabled
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                          }`}
                          onClick={() => handleToggleModule(module.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <module.icon className={`h-5 w-5 mr-3 ${
                                isEnabled 
                                  ? 'text-blue-600 dark:text-blue-400' 
                                  : 'text-gray-400 dark:text-gray-500'
                              }`} />
                              <div>
                                <h4 className={`font-medium ${
                                  isEnabled 
                                    ? 'text-blue-900 dark:text-blue-100' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {module.name}
                                </h4>
                                <p className={`text-sm ${
                                  isEnabled 
                                    ? 'text-blue-700 dark:text-blue-300' 
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {module.description}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              {isEnabled ? (
                                <CheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <div className="h-5 w-5 border-2 border-gray-300 dark:border-gray-600 rounded" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModuleToggle;
