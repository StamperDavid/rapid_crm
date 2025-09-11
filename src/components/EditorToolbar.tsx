import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  UsersIcon,
  WrenchScrewdriverIcon,
  KeyIcon,
  CircleStackIcon,
  CogIcon,
  ChartBarIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface EditorToolbarProps {
  hasUserManagement: boolean;
  hasAgentManagement: boolean;
  hasSchemaManagement: boolean;
  hasApiKeyManagement: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  hasUserManagement,
  hasAgentManagement,
  hasSchemaManagement,
  hasApiKeyManagement,
}) => {
  const location = useLocation();

  const editorItems = [
    ...(hasUserManagement ? [{ name: 'Users', href: '/users', icon: UsersIcon, color: 'text-teal-600' }] : []),
    ...(hasAgentManagement ? [{ name: 'Agents', href: '/agents', icon: CpuChipIcon, color: 'text-violet-600' }] : []),
    ...(hasSchemaManagement ? [{ name: 'Schema', href: '/schema', icon: WrenchScrewdriverIcon, color: 'text-amber-600' }] : []),
    ...(hasApiKeyManagement ? [{ name: 'API Keys', href: '/api-keys', icon: KeyIcon, color: 'text-yellow-600' }] : []),
    { name: 'Database', href: '/database', icon: CircleStackIcon, color: 'text-slate-600' },
    { name: 'Integrations', href: '/integrations', icon: CogIcon, color: 'text-indigo-600' },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, color: 'text-pink-600' },
  ];

  if (editorItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-4">
              Editor Tools
            </span>
            <div className="flex items-center space-x-1">
              {editorItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'group flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                    )}
                  >
                    <item.icon
                      className={clsx(
                        'h-4 w-4 mr-2 flex-shrink-0 transition-colors',
                        isActive ? item.color : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Editor status indicator */}
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Editor Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;