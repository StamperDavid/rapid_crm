import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  UsersIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  ChatBubbleLeftRightIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import Logo from './Logo';
import AdminRecovery from './AdminRecovery';
import GlobalSearch from './GlobalSearch';

interface LayoutProps {
  children: React.ReactNode;
}

const getNavigation = (hasUserManagement: boolean, hasAgentManagement: boolean, hasSchemaManagement: boolean) => [
  { name: 'Dashboard', href: '/', icon: HomeIcon, color: 'text-blue-600' },
  { name: 'Companies', href: '/companies', icon: BuildingOfficeIcon, color: 'text-purple-600' },
  { name: 'Deals', href: '/deals', icon: CurrencyDollarIcon, color: 'text-orange-600' },
  { name: 'Invoices', href: '/invoices', icon: DocumentTextIcon, color: 'text-red-600' },
  { name: 'Tasks', href: '/tasks', icon: ClockIcon, color: 'text-emerald-600' },
  { name: 'Conversations', href: '/conversations', icon: ChatBubbleLeftRightIcon, color: 'text-cyan-600' },
  ...(hasAgentManagement ? [{ name: 'Agents', href: '/agents', icon: CpuChipIcon, color: 'text-violet-600' }] : []),
  ...(hasUserManagement ? [{ name: 'Users', href: '/users', icon: UsersIcon, color: 'text-teal-600' }] : []),
  ...(hasSchemaManagement ? [{ name: 'Schema', href: '/schema', icon: WrenchScrewdriverIcon, color: 'text-amber-600' }] : []),
  { name: 'Integrations', href: '/integrations', icon: CogIcon, color: 'text-indigo-600' },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, color: 'text-pink-600' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationNotifications, setConversationNotifications] = useState(0);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, hasPermission } = useUser();
  
  const navigation = getNavigation(
    hasPermission('canManageUsers'),
    hasPermission('canManageAgents'),
    hasPermission('canManageSchema')
  );

  // Mock conversation notifications - in real app, this would come from WebSocket or polling
  useEffect(() => {
    // Simulate checking for waiting conversations
    const checkConversations = () => {
      // Mock data - in real app, this would be an API call
      const waitingCount = Math.floor(Math.random() * 3); // 0-2 notifications
      setConversationNotifications(waitingCount);
    };

    checkConversations();
    const interval = setInterval(checkConversations, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-800 shadow-xl">
            <div className="flex h-full flex-col">
              {/* Mobile header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <Logo variant={theme} className="h-8" />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Mobile navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={clsx(
                        'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                      )}
                    >
                      <div className="relative">
                        <item.icon
                          className={clsx(
                            'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                            isActive ? item.color : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                          )}
                        />
                        {item.name === 'Conversations' && conversationNotifications > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {conversationNotifications}
                          </span>
                        )}
                      </div>
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              
              {/* Mobile user section */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <UserCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'user@rapidcrm.com'}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">{user?.role || 'user'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="flex w-64 flex-col fixed inset-y-0 z-40">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm">
          {/* Logo section */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200 dark:border-slate-700">
            <Logo variant={theme} className="h-8" />
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-4 py-6">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={clsx(
                        'group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200',
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                      )}
                    >
                      <div className="relative">
                        <item.icon
                          className={clsx(
                            'h-6 w-6 shrink-0 transition-colors',
                            isActive ? item.color : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                          )}
                          aria-hidden="true"
                        />
                        {item.name === 'Conversations' && conversationNotifications > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {conversationNotifications}
                          </span>
                        )}
                      </div>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* User section */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'user@rapidcrm.com'}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">{user?.role || 'user'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 dark:text-slate-300 hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden" aria-hidden="true" />

          {/* Top bar content */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1">
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {theme === 'light' ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}
              </button>

              {/* Notifications */}
              <button
                type="button"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Admin Recovery System - Always Available */}
      <AdminRecovery />
    </div>
  );
};

export default Layout;