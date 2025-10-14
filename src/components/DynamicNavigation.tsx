import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CogIcon } from '@heroicons/react/outline';
import { getAvailableModules } from '../config/dashboardModules';
import { useUser } from '../contexts/UserContext';
import { useModules } from '../contexts/ModuleContext';
import { useConversationAlerts } from '../hooks/useConversationAlerts';
import HelpIcon from './HelpIcon';
import VisibleHelpIcon from './VisibleHelpIcon';
import DashboardModuleToggle from './DashboardModuleToggle';

const DynamicNavigation: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();
  const { alertCount } = useConversationAlerts();
  const { enabledModules, setEnabledModules, getVisibleModules } = useModules();
  const [showModuleToggle, setShowModuleToggle] = useState(false);

  // Get visible modules based on user role and enabled modules
  const allVisibleModules = getVisibleModules(user?.role || 'user');
  
  // LEFT SIDEBAR shows ONLY core business modules (for everyone)
  const visibleModules = allVisibleModules.filter(module => module.category === 'core');

  // Check if user can manage modules
  const canManageModules = user?.role === 'admin' || user?.role === 'trainer';

  const handleToggleModule = (moduleId: string) => {
    // This will be handled by the ModuleContext
  };

  const handleSaveModules = (modules: string[]) => {
    setEnabledModules(modules);
    setShowModuleToggle(false);
  };

  const handleCancelModules = () => {
    setShowModuleToggle(false);
  };

  return (
    <>
      <nav className="flex flex-1 flex-col px-4 py-6">
        <ul role="list" className="flex flex-1 flex-col gap-y-2">
          {visibleModules.map((module) => {
            const isActive = location.pathname === module.href || 
                           (module.href !== '/' && location.pathname.startsWith(module.href));
            
            return (
              <li key={module.id}>
                <Link
                  to={module.href}
                  className={`group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="relative">
                    <module.icon
                      className={`h-6 w-6 shrink-0 transition-colors ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                      aria-hidden="true"
                    />
                    {/* Show alert badge for conversations */}
                    {module.id === 'conversations' && alertCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {alertCount}
                      </span>
                    )}
                  </div>
                  <span className="flex-1">{module.name}</span>
                  <VisibleHelpIcon 
                    content={module.tooltip} 
                    size="sm" 
                    position="right"
                    className="ml-2"
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Module Management Section */}
        {canManageModules && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowModuleToggle(true)}
              className="group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 w-full"
            >
              <CogIcon className="h-6 w-6 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
              <span className="flex-1">Module Settings</span>
              <VisibleHelpIcon 
                content="Configure which dashboard modules are visible. You can enable/disable advanced features, training tools, and admin functions."
                size="sm" 
                position="right"
                className="ml-2"
              />
            </button>
          </div>
        )}
      </nav>

      {/* Module Toggle Modal */}
      {showModuleToggle && (
        <DashboardModuleToggle
          enabledModules={enabledModules}
          onToggleModule={handleToggleModule}
          onSave={handleSaveModules}
          onCancel={handleCancelModules}
        />
      )}
    </>
  );
};

export default DynamicNavigation;
