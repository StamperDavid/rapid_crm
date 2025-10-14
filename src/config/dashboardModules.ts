import React from 'react';
import {
  OfficeBuildingIcon,
  UserGroupIcon,
  DocumentIcon,
  CurrencyDollarIcon,
  TruckIcon,
  LightningBoltIcon,
  ClockIcon,
  ChatIcon,
  AcademicCapIcon,
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ClipboardCheckIcon,
  CloudIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationIcon
} from '@heroicons/react/outline';

// Import components (lazy loaded)
const CompaniesModule = React.lazy(() => import('../modules/CRM/pages/Companies'));
const LeadsModule = React.lazy(() => import('../modules/CRM/pages/Leads'));
const DealsModule = React.lazy(() => import('../modules/CRM/pages/Deals'));
const ServicesModule = React.lazy(() => import('../modules/CRM/pages/Services'));
const ELDModule = React.lazy(() => import('../pages/ELDDashboard'));
const IFTAModule = React.lazy(() => import('../pages/IFTADashboard'));
const RegulationTrainingModule = React.lazy(() => import('../components/training/RegulationTrainingDashboard'));
const USDOTTrainingCenterModule = React.lazy(() => import('../components/training/USDOTRegistrationTrainingCenter'));
const AgentPerformanceMonitoringModule = React.lazy(() => import('../components/training/AgentPerformanceMonitoringDashboard'));
const CriticalPathTestCenterModule = React.lazy(() => import('../components/training/CriticalPathTestCenter'));
const TasksModule = React.lazy(() => import('../modules/CRM/pages/Tasks'));
const ConversationsModule = React.lazy(() => import('../modules/CRM/pages/Conversations'));
const AnalyticsModule = React.lazy(() => import('../modules/Analytics'));
const SystemMonitoringModule = React.lazy(() => import('../modules/SystemMonitoring'));
const AdvancedAIAgentControlPanelModule = React.lazy(() => import('../components/AdvancedAIAgentControlPanel'));

// Training modules - consolidated into RegulationTrainingDashboard

export interface DashboardModule {
  id: string;
  name: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  category: 'core' | 'compliance' | 'training' | 'advanced' | 'admin';
  required: boolean;
  adminOnly: boolean;
  trainerOnly: boolean;
  icon: React.ComponentType<any>;
  description: string;
  tooltip: string;
  href: string;
  enabled: boolean;
  order: number;
}

export const DASHBOARD_MODULES: Record<string, DashboardModule> = {
  // CORE MODULES (Always visible, required)
  companies: {
    id: 'companies',
    name: 'Companies',
    component: CompaniesModule,
    category: 'core',
    required: true,
    adminOnly: false,
    trainerOnly: false,
    icon: OfficeBuildingIcon,
    description: 'Manage client companies and their information',
    tooltip: 'Companies are your clients - transportation businesses that need DOT compliance services. Each company can have multiple contacts, vehicles, drivers, and deals.',
    href: '/companies',
    enabled: true,
    order: 1
  },
  leads: {
    id: 'leads',
    name: 'Leads',
    component: LeadsModule,
    category: 'core',
    required: true,
    adminOnly: false,
    trainerOnly: false,
    icon: UserGroupIcon,
    description: 'Track potential clients and manage lead pipeline',
    tooltip: 'Leads are potential clients who have shown interest in your services. Track their progression through your sales pipeline.',
    href: '/leads',
    enabled: true,
    order: 2
  },
  deals: {
    id: 'deals',
    name: 'Deals',
    component: DealsModule,
    category: 'core',
    required: true,
    adminOnly: false,
    trainerOnly: false,
    icon: DocumentIcon,
    description: 'Manage sales opportunities and track deal progress',
    tooltip: 'Deals represent sales opportunities with specific companies. Track progress and revenue potential.',
    href: '/deals',
    enabled: true,
    order: 3
  },
  services: {
    id: 'services',
    name: 'Services',
    component: ServicesModule,
    category: 'core',
    required: true,
    adminOnly: false,
    trainerOnly: false,
    icon: CurrencyDollarIcon,
    description: 'Configure and manage service packages and pricing',
    tooltip: 'Services are the compliance packages you offer to clients (USDOT registration, ELD, IFTA, etc.).',
    href: '/services',
    enabled: true,
    order: 4
  },

  // COMPLIANCE MODULES (Always visible, required)
  eld: {
    id: 'eld',
    name: 'ELD',
    component: ELDModule,
    category: 'compliance',
    required: true,
    adminOnly: false,
    trainerOnly: false,
    icon: TruckIcon,
    description: 'Electronic Logging Device management and HOS compliance',
    tooltip: 'Electronic Logging Device (ELD) management for Hours of Service (HOS) compliance and driver monitoring.',
    href: '/eld',
    enabled: true,
    order: 5
  },
  ifta: {
    id: 'ifta',
    name: 'IFTA',
    component: IFTAModule,
    category: 'compliance',
    required: true,
    adminOnly: false,
    trainerOnly: false,
    icon: LightningBoltIcon,
    description: 'International Fuel Tax Agreement reporting and compliance',
    tooltip: 'International Fuel Tax Agreement (IFTA) reporting for fuel tax calculations and compliance tracking.',
    href: '/ifta',
    enabled: true,
    order: 6
  },

  // ADVANCED MODULES (Optional, can be toggled)
  tasks: {
    id: 'tasks',
    name: 'Tasks',
    component: TasksModule,
    category: 'advanced',
    required: false,
    adminOnly: false,
    trainerOnly: false,
    icon: ClockIcon,
    description: 'Task management and workflow tracking',
    tooltip: 'Task management, workflow tracking, and team collaboration tools.',
    href: '/tasks',
    enabled: false,
    order: 7
  },
  conversations: {
    id: 'conversations',
    name: 'Conversations',
    component: ConversationsModule,
    category: 'advanced',
    required: false,
    adminOnly: false,
    trainerOnly: false,
    icon: ChatIcon,
    description: 'AI chat conversations and customer support',
    tooltip: 'AI chat conversations, customer support tickets, and communication history.',
    href: '/conversations',
    enabled: false,
    order: 8
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics',
    component: AnalyticsModule,
    category: 'advanced',
    required: false,
    adminOnly: false,
    trainerOnly: false,
    icon: ChartBarIcon,
    description: 'Business analytics and performance reports',
    tooltip: 'Comprehensive analytics and reporting for your business performance and client metrics.',
    href: '/analytics',
    enabled: false,
    order: 9
  },






  // ADMIN MODULES (Admin only, can be toggled)
  ai_control: {
    id: 'ai_control',
    name: 'AI Control',
    component: AdvancedAIAgentControlPanelModule,
    category: 'admin',
    required: false,
    adminOnly: true,
    trainerOnly: false,
    icon: CogIcon,
    description: 'AI agent management, training, and system administration',
    tooltip: 'Complete AI agent management including training, monitoring, and system administration.',
    href: '/ai-control',
    enabled: false,
    order: 10
  },
  system_monitoring: {
    id: 'system_monitoring',
    name: 'System Monitoring',
    component: SystemMonitoringModule,
    category: 'admin',
    required: false,
    adminOnly: true,
    trainerOnly: false,
    icon: ShieldCheckIcon,
    description: 'System health and performance monitoring',
    tooltip: 'Monitor system health, performance metrics, and troubleshoot issues.',
    href: '/monitoring',
    enabled: false,
    order: 11
  }
};

// Module categories configuration
export const MODULE_CATEGORIES = {
  core: {
    name: 'Core Business',
    description: 'Essential business operations',
    alwaysVisible: true,
    color: 'blue'
  },
  advanced: {
    name: 'Advanced Features',
    description: 'Additional business tools',
    alwaysVisible: false,
    color: 'purple'
  },
  training: {
    name: 'AI Training',
    description: 'AI agent training and management',
    alwaysVisible: false,
    color: 'orange',
    adminOnly: true
  },
  admin: {
    name: 'Administration',
    description: 'System administration and monitoring',
    alwaysVisible: false,
    color: 'gray',
    adminOnly: true
  }
};

// Helper functions
export const getModulesByCategory = (category: string): DashboardModule[] => {
  return Object.values(DASHBOARD_MODULES)
    .filter(module => module.category === category)
    .sort((a, b) => a.order - b.order);
};

export const getVisibleModules = (userRole: string, enabledModules: string[] = []): DashboardModule[] => {
  return Object.values(DASHBOARD_MODULES)
    .filter(module => {
      // Always show required modules
      if (module.required) return true;
      
      // Show enabled modules
      if (enabledModules.includes(module.id)) return true;
      
      // Show admin modules for admin users
      if (module.adminOnly && userRole === 'admin') return true;
      
      // Show trainer modules for trainer users
      if (module.trainerOnly && (userRole === 'admin' || userRole === 'trainer')) return true;
      
      return false;
    })
    .sort((a, b) => a.order - b.order);
};

export const getModuleById = (id: string): DashboardModule | undefined => {
  return DASHBOARD_MODULES[id];
};

export const getAvailableModules = (userRole: string): DashboardModule[] => {
  return Object.values(DASHBOARD_MODULES)
    .filter(module => {
      if (module.required) return false; // Don't show required modules in toggle list
      if (module.adminOnly && userRole !== 'admin') return false;
      if (module.trainerOnly && userRole !== 'admin' && userRole !== 'trainer') return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);
};
