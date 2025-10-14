import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  UsersIcon,
  CogIcon,
  KeyIcon,
  DatabaseIcon,
  ChartBarIcon,
  ChipIcon,
  GlobeAltIcon,
  ColorSwatchIcon,
  VideoCameraIcon,
} from '@heroicons/react/outline';
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

  // Manager-level tools (shown for managers and admins)
  const editorItems = [
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, color: 'text-green-600' },
    { name: 'Agent Performance', href: '/training/monitoring', icon: ChipIcon, color: 'text-purple-600' },
    { name: 'Tasks', href: '/tasks', icon: CogIcon, color: 'text-blue-600' },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, color: 'text-pink-600' },
  ];

  if (editorItems.length === 0) {
    return null;
  }

  return (
    <>
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
    </>
  );
};

export default EditorToolbar;
