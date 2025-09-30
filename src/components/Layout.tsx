import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  OfficeBuildingIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BellIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  MenuIcon,
  XIcon,
  ClockIcon,
  ChatIcon,
  DocumentIcon,
  ChipIcon,
  QuestionMarkCircleIcon,
  TruckIcon,
  LightningBoltIcon,
  ChartBarIcon,
  VideoCameraIcon,
} from '@heroicons/react/outline';
import { clsx } from 'clsx';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useTooltips } from '../contexts/TooltipContext';
import EditorToolbar from './EditorToolbar';
import AdminToolbar from './AdminToolbar';
import Logo from './Logo';
import HelpIcon from './HelpIcon';
import AdminRecovery from './AdminRecovery';
import GlobalSearch from './GlobalSearch';
import AdvancedUIAssistantFixed from './AdvancedUIAssistantFixed';
import IntegratedAIChat from './IntegratedAIChat';
import { useConversationAlerts } from '../hooks/useConversationAlerts';

interface LayoutProps {
  children: React.ReactNode;
}

const getNavigation = () => [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: HomeIcon, 
    color: 'text-blue-600',
    tooltip: 'Main dashboard with overview of all business operations, metrics, and quick access to key features'
  },
  { 
    name: 'Companies', 
    href: '/companies', 
    icon: OfficeBuildingIcon, 
    color: 'text-purple-600',
    tooltip: 'Manage client companies, view company details, and track business relationships'
  },
  { 
    name: 'Leads', 
    href: '/leads', 
    icon: UserGroupIcon, 
    color: 'text-green-600',
    tooltip: 'Track potential clients, manage lead pipeline, and convert leads to customers'
  },
  { 
    name: 'Deals', 
    href: '/deals', 
    icon: DocumentIcon, 
    color: 'text-indigo-600',
    tooltip: 'Manage sales opportunities, track deal progress, and monitor revenue pipeline'
  },
  { 
    name: 'Services', 
    href: '/services', 
    icon: CurrencyDollarIcon, 
    color: 'text-orange-600',
    tooltip: 'Configure and manage service packages, pricing, and service delivery options'
  },
  { 
    name: 'ELD', 
    href: '/eld', 
    icon: TruckIcon, 
    color: 'text-red-600',
    tooltip: 'Electronic Logging Device management, HOS compliance, and driver monitoring'
  },
  { 
    name: 'IFTA', 
    href: '/ifta', 
    icon: LightningBoltIcon, 
    color: 'text-blue-600',
    tooltip: 'International Fuel Tax Agreement reporting, fuel tax calculations, and compliance tracking'
  },
  { 
    name: 'Tasks', 
    href: '/tasks', 
    icon: ClockIcon, 
    color: 'text-emerald-600',
    tooltip: 'Task management, workflow tracking, and team collaboration tools'
  },
  { 
    name: 'Conversations', 
    href: '/conversations', 
    icon: ChatIcon, 
    color: 'text-cyan-600',
    tooltip: 'AI chat conversations, customer support tickets, and communication history'
  },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const location = useLocation();
  
  // Safely access theme context with fallback
  let theme: 'light' | 'dark' = 'dark';
  let toggleTheme = () => {};
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (error) {
    console.warn('Theme context not available, using fallback:', error);
  }
  
  const { user, hasPermission } = useUser();
  const { tooltipsEnabled, toggleTooltips } = useTooltips();
  const { alertCount, clearAllAlerts } = useConversationAlerts();
  
  const navigation = getNavigation();

  // Clear alerts when user navigates to conversations page
  useEffect(() => {
    if (location.pathname === '/conversations') {
      clearAllAlerts();
    }
  }, [location.pathname, clearAllAlerts]);

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
                <Logo key="mobile-logo" variant={theme} className="h-8" />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <XIcon className="h-6 w-6" />
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
                        {item.name === 'Conversations' && alertCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                            {alertCount}
                          </span>
                        )}
                      </div>
                      <span className="flex-1">{item.name}</span>
                      <HelpIcon 
                        content={item.tooltip} 
                        size="sm" 
                        position="left"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      />
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
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-40">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm">
          {/* Logo section */}
          <div className="flex h-16 shrink-0 items-start px-6 pt-5 border-b border-slate-200 dark:border-slate-700">
            <Logo key="desktop-logo" variant={theme} className="h-8" />
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
                        {item.name === 'Conversations' && alertCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                            {alertCount}
                          </span>
                        )}
                      </div>
                      {item.name}
                    </Link>
                    <HelpIcon 
                      content={item.tooltip} 
                      size="sm" 
                      position="right"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    />
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
      <div className="md:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 dark:text-slate-300 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
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

              {/* Tooltip toggle */}
              <button
                onClick={toggleTooltips}
                className={`p-2 rounded-lg transition-colors ${
                  tooltipsEnabled 
                    ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <QuestionMarkCircleIcon className="h-5 w-5" />
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

        {/* Toolbars - Editor and Admin side by side */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center h-12">
                {/* Left 50% - Editor Tools */}
                <div className="flex items-center space-x-1 w-1/2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-4">
                    Editor Tools
                  </span>
                  <div className="flex items-center space-x-1">
                    {/* Editor Tools */}
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <EditorToolbar
                        hasUserManagement={hasPermission('canManageUsers')}
                        hasAgentManagement={hasPermission('canManageAgents')}
                        hasSchemaManagement={hasPermission('canManageSchema')}
                        hasApiKeyManagement={hasPermission('canManageApiKeys')}
                      />
                    )}
                  </div>
                </div>
                
                {/* Right 50% - Admin Tools (fills from right to left) */}
                {user?.role === 'admin' && (
                  <div className="flex items-center justify-end space-x-1 w-1/2">
                    <AdminToolbar
                      hasSystemAccess={hasPermission('canManageUsers')}
                      hasUserManagement={hasPermission('canManageUsers')}
                      hasSystemMonitoring={hasPermission('canManageUsers')}
                      hasAdvancedSettings={hasPermission('canManageUsers')}
                    />
                    {/* Status indicator - Far right */}
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Admin Mode
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Status indicator for non-admin users */}
                {user?.role !== 'admin' && (
                  <div className="flex items-center space-x-2 ml-auto">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Editor Mode
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Admin Recovery System - Always Available */}
      <AdminRecovery />
      
      {/* Advanced UI Assistant */}
        <AdvancedUIAssistantFixed />
        
      {/* Floating AI Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setAiChatOpen(!aiChatOpen)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          title="Open AI Chat"
        >
          <ChatIcon className="h-6 w-6" />
        </button>
      </div>
      
      {/* AI Chat Modal */}
      <IntegratedAIChat 
        isOpen={aiChatOpen} 
        onClose={() => setAiChatOpen(false)} 
      />
    </div>
  );
};

export default Layout;