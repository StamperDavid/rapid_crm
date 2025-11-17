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
const RegulationTrainingModule = React.lazy(() => import('../components/training/RegulationTrainingDashboard'));
const USDOTTrainingCenterModule = React.lazy(() => import('../components/training/USDOTRegistrationTrainingCenter'));
const AgentPerformanceMonitoringModule = React.lazy(() => import('../components/training/AgentPerformanceMonitoringDashboard'));
const CriticalPathTestCenterModule = React.lazy(() => import('../components/training/CriticalPathTestCenter'));
const TasksModule = React.lazy(() => import('../modules/CRM/pages/Tasks'));
const ConversationsModule = React.lazy(() => import('../modules/CRM/pages/Conversations'));
const AnalyticsModule = React.lazy(() => import('../modules/Analytics'));
const ComplianceModule = React.lazy(() => import('../modules/Compliance'));
const SystemMonitoringModule = React.lazy(() => import('../modules/SystemMonitoring'));

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
  automatedFilings: {
    id: 'automatedFilings',
    name: 'Automated Filings',
    component: React.lazy(() => import('../modules/CRM/pages/AutomatedFilings')),
    category: 'core',
    required: true,
    adminOnly: false,
    trainerOnly: false,
    icon: DocumentTextIcon,
    description: 'File USDOT applications with automated RPA - select a deal and watch it work',
    tooltip: 'Automated filing system - select a deal, click Start, and watch the RPA agent file the USDOT application on the real FMCSA website in real-time.',
    href: '/automated-filings',
    enabled: true,
    order: 5
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

  // TRAINING MODULES (Specialized training environments)
  regulationTraining: {
    id: 'regulationTraining',
    name: 'AI Training Environment',
    component: RegulationTrainingModule,
    category: 'training',
    required: false,
    adminOnly: true,
    trainerOnly: true,
    icon: AcademicCapIcon,
    description: 'Comprehensive AI agent training for all registration types',
    tooltip: 'Intelligent training environment that creates scenarios, tests agents, and trains them to 100% accuracy for USDOT, IFTA, State registrations, and renewals.',
    href: '/training',
    enabled: false,
    order: 10
  },
  usdotTrainingCenter: {
    id: 'usdotTrainingCenter',
    name: 'USDOT RPA Training',
    component: USDOTTrainingCenterModule,
    category: 'training',
    required: false,
    adminOnly: true,
    trainerOnly: true,
    icon: DocumentTextIcon,
    description: 'Train USDOT RPA agent with real scenarios - watch it fill out applications',
    tooltip: 'Pixel-perfect FMCSA interface. Load scenarios from database and watch the RPA agent auto-fill USDOT applications. Review, correct, and train for 95%+ accuracy.',
    href: '/training/usdot',
    enabled: true,
    order: 11
  },

  agentPerformanceMonitoring: {
    id: 'agentPerformanceMonitoring',
    name: 'Agent Performance Monitoring',
    component: AgentPerformanceMonitoringModule,
    category: 'training',
    required: false,
    adminOnly: true,
    trainerOnly: true,
    icon: ChartBarIcon,
    description: 'Real-time monitoring and analytics of AI agent training performance',
    tooltip: 'Monitor agent performance in real-time, track training progress, identify issues, and manage Golden Master agents.',
    href: '/training/monitoring',
    enabled: false,  // Not in sidebar - shown in EditorToolbar
    order: 12
  },

  criticalPathTestCenter: {
    id: 'criticalPathTestCenter',
    name: 'Critical Path Test Center',
    component: CriticalPathTestCenterModule,
    category: 'training',
    required: false,
    adminOnly: true,
    trainerOnly: true,
    icon: ExclamationIcon,
    description: 'Test AI agents on the most common USDOT application failure points',
    tooltip: 'Focus on critical failure points like business entity mismatches, vehicle/driver ratios, CDL requirements, and insurance gaps.',
    href: '/training/critical-path',
    enabled: false,  // Not in sidebar - shown via AI Control
    order: 13
  },


  // ADMIN MODULES (Admin only, can be toggled)
  compliance: {
    id: 'compliance',
    name: 'Compliance',
    component: ComplianceModule,
    category: 'admin',
    required: false,
    adminOnly: true,
    trainerOnly: false,
    icon: ClipboardCheckIcon,
    description: 'Compliance monitoring and regulatory tracking',
    tooltip: 'Comprehensive compliance monitoring, regulatory tracking, and audit preparation tools.',
    href: '/compliance',
    enabled: false,
    order: 14
  },
  systemMonitoring: {
    id: 'systemMonitoring',
    name: 'System Monitoring',
    component: SystemMonitoringModule,
    category: 'admin',
    required: false,
    adminOnly: true,
    trainerOnly: false,
    icon: CloudIcon,
    description: 'System health monitoring and performance metrics',
    tooltip: 'Monitor system health, performance metrics, and technical infrastructure.',
    href: '/monitoring',
    enabled: false,
    order: 15
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
  compliance: {
    name: 'Compliance',
    description: 'Regulatory compliance and monitoring',
    alwaysVisible: false,  // Changed - no longer have ELD/IFTA modules
    color: 'green'
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
      
      // CHECK ROLE PERMISSIONS FIRST (security check)
      // If module is admin-only and user is not admin, hide it regardless of enabled status
      if (module.adminOnly && userRole !== 'admin') return false;
      
      // If module is trainer-only and user is not trainer/admin, hide it
      if (module.trainerOnly && userRole !== 'admin' && userRole !== 'trainer') return false;
      
      // Now check if module is enabled
      if (enabledModules.includes(module.id)) return true;
      
      // Show admin modules for admin users (even if not explicitly enabled)
      if (module.adminOnly && userRole === 'admin') return true;
      
      // Show trainer modules for trainer users (even if not explicitly enabled)
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
