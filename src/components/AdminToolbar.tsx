import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheckIcon,
  CogIcon,
  ServerIcon,
  ChartBarIcon,
  ExclamationIcon,
  UserGroupIcon,
  KeyIcon,
  DatabaseIcon,
  ColorSwatchIcon,
  GlobeAltIcon,
  ChipIcon,
  LocationMarkerIcon,
} from '@heroicons/react/outline';
import { clsx } from 'clsx';

interface AdminToolbarProps {
  hasSystemAccess: boolean;
  hasUserManagement: boolean;
  hasSystemMonitoring: boolean;
  hasAdvancedSettings: boolean;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({
  hasSystemAccess,
  hasUserManagement,
  hasSystemMonitoring,
  hasAdvancedSettings,
}) => {
  const location = useLocation();

  const adminItems = [
    { name: 'Users', href: '/users', icon: UserGroupIcon, color: 'text-blue-600' },
    { name: 'Theme', href: '/theme', icon: ColorSwatchIcon, color: 'text-rose-600' },
    { name: 'Portal Designer', href: '/client-portal', icon: GlobeAltIcon, color: 'text-emerald-600' },
    { name: 'Database', href: '/database', icon: DatabaseIcon, color: 'text-slate-600' },
    { name: 'Schema', href: '/schema', icon: CogIcon, color: 'text-amber-600' },
    { name: 'API Keys', href: '/settings/api-keys', icon: KeyIcon, color: 'text-yellow-600' },
    { name: 'System Monitor', href: '/monitoring', icon: ShieldCheckIcon, color: 'text-cyan-600' },
    { name: 'AI Control', href: '/admin/ai-control', icon: ChipIcon, color: 'text-purple-600' },
  ];

  if (adminItems.length === 0) {
    return null;
  }

  return (
    <>
      {adminItems.map((item) => {
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

export default AdminToolbar;
