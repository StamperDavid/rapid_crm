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
const ContactsModule = React.lazy(() => import('../modules/CRM/pages/Contacts'));
const DriversModule = React.lazy(() => import('../modules/CRM/pages/Drivers'));
const VehiclesModule = React.lazy(() => import('../modules/CRM/pages/Vehicles'));
const TasksModule = React.lazy(() => import('../modules/CRM/pages/Tasks'));
const ConversationsModule = React.lazy(() => import('../modules/CRM/pages/Conversations'));
const AnalyticsModule = React.lazy(() => import('../modules/Analytics'));
const ComplianceModule = React.lazy(() => import('../modules/Compliance'));
const SystemMonitoringModule = React.lazy(() => import('../modules/SystemMonitoring'));
const UserManagementModule = React.lazy(() => import('../modules/CRM/pages/UserManagement'));
const DatabaseManagementModule = React.lazy(() => import('../modules/CRM/pages/DatabaseManagement'));
const ApiKeysModule = React.lazy(() => import('../modules/CRM/pages/ApiKeys'));
const SchemaManagementModule = React.lazy(() => import('../pages/SchemaManagement'));
const ThemeCustomizerModule = React.lazy(() => import('../modules/CRM/pages/ThemeCustomizer'));
const ClientPortalDesignerModule = React.lazy(() => import('../modules/CRM/pages/ClientPortalDesigner'));
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
    tooltip: 'Services are the compliance packages you offer to clients (USDOT registration, MC Number, State registrations, etc.).',
    href: '/services',
    enabled: true,
    order: 4
  },
  contacts: {
    id: 'contacts',
    name: 'Contacts',
    component: ContactsModule,
    category: 'core',
    required: true,
    adminOnly: false,
    trainerOnly: false,
    icon: UserCircleIcon,
    description: 'Manage client contacts and relationships',
    tooltip: 'Contact management for all people associated with your client companies.',
    href: '/contacts',
    enabled: true,
    order: 5
  },
  drivers: {
    id: 'drivers',
    name: 'Drivers',
    component: DriversModule,
    category: 'core',
    required: true,
    adminOnly: false,
    trainerOnly: false,
    icon: UserGroupIcon,
    description: 'Manage fleet drivers and qualifications',
    tooltip: 'Driver management, qualifications, and compliance tracking.',
    href: '/drivers',
    enabled: true,
    order: 6
  },
  vehicles: {
    id: 'vehicles',
    name: 'Vehicles',
    component: VehiclesModule,
    category: 'core',
    required: true,
    adminOnly: false,
    trainerOnly: false,
    icon: TruckIcon,
    description: 'Manage fleet vehicles and maintenance',
    tooltip: 'Vehicle management, maintenance tracking, and fleet oversight.',
    href: '/vehicles',
    enabled: true,
    order: 7
  },
  conversations: {
    id: 'conversations',
    name: 'Conversations',
    component: ConversationsModule,
    category: 'core',
    required: true,
    adminOnly: false,
    trainerOnly: false,
    icon: ChatIcon,
    description: 'Client communications and chat history',
    tooltip: 'All client conversations, chat history, and communication tracking.',
    href: '/conversations',
    enabled: true,
    order: 8
  },

  // MANAGEMENT MODULES (Managers and Admins only)
  analytics: {
    id: 'analytics',
    name: 'Analytics',
    component: AnalyticsModule,
    category: 'management',
    required: false,
    adminOnly: false,  // Managers can see
    trainerOnly: false,
    icon: ChartBarIcon,
    description: 'Business analytics and performance reports',
    tooltip: 'Comprehensive analytics and reporting for your business performance and client metrics.',
    href: '/analytics',
    enabled: true,
    order: 20
  },
  tasks: {
    id: 'tasks',
    name: 'Tasks',
    component: TasksModule,
    category: 'management',
    required: false,
    adminOnly: false,  // Managers can see
    trainerOnly: false,
    icon: ClockIcon,
    description: 'Task management and workflow tracking',
    tooltip: 'Task management, workflow tracking, and team collaboration tools.',
    href: '/tasks',
    enabled: true,
    order: 22
  },

  // TRAINING MODULES - Access via AI Control Panel (Not in main sidebar)
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
    tooltip: 'Intelligent training environment that creates scenarios, tests agents, and trains them to 100% accuracy for USDOT, State registrations, and renewals.',
    href: '/training',
    enabled: false,  // Hidden from sidebar - access via AI Control
    order: 10
  },
  usdotTrainingCenter: {
    id: 'usdotTrainingCenter',
    name: 'USDOT Training Center',
    component: USDOTTrainingCenterModule,
    category: 'training',
    required: false,
    adminOnly: true,
    trainerOnly: true,
    icon: DocumentTextIcon,
    description: 'Specialized USDOT registration training with pixel-perfect government interface emulation',
    tooltip: 'Pixel-perfect emulation of the FMCSA USDOT registration process. Train AI agents on real government forms and scenarios with performance grading.',
    href: '/training/usdot',
    enabled: false,  // Hidden from sidebar - access via AI Control
    order: 11
  },

  agentPerformanceMonitoring: {
    id: 'agentPerformanceMonitoring',
    name: 'Agent Performance Monitoring',
    component: AgentPerformanceMonitoringModule,
    category: 'management',  // Changed to management - managers need this
    required: false,
    adminOnly: false,  // Managers can see agent performance
    trainerOnly: false,
    icon: ChartBarIcon,
    description: 'Real-time monitoring and analytics of AI agent performance',
    tooltip: 'Monitor agent performance in real-time, track training progress, identify issues, and manage Golden Master agents.',
    href: '/training/monitoring',
    enabled: true,
    order: 21
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
    enabled: false,  // Hidden from sidebar - access via AI Control
    order: 13
  },


  // ADMINISTRATION MODULES (Owner/Admin only)
  userManagement: {
    id: 'userManagement',
    name: 'User Management',
    component: UserManagementModule,
    category: 'admin',
    required: false,
    adminOnly: true,
    trainerOnly: false,
    icon: UserGroupIcon,
    description: 'Manage users, roles, and permissions',
    tooltip: 'Create and manage user accounts, assign roles, and configure permissions.',
    href: '/users',
    enabled: true,
    order: 30
  },
  aiControl: {
    id: 'aiControl',
    name: 'AI Control',
    component: AdvancedAIAgentControlPanelModule,
    category: 'admin',
    required: false,
    adminOnly: true,
    trainerOnly: false,
    icon: CogIcon,
    description: 'AI agent management and configuration',
    tooltip: 'Manage AI agents, configure settings, and access training environments.',
    href: '/admin/ai-control',
    enabled: true,
    order: 31
  },
  themeDesigner: {
    id: 'themeDesigner',
    name: 'Theme Designer',
    component: ThemeCustomizerModule,
    category: 'admin',
    required: false,
    adminOnly: true,
    trainerOnly: false,
    icon: ClipboardCheckIcon,
    description: 'Customize application theme and branding',
    tooltip: 'Customize colors, branding, and visual appearance of the application.',
    href: '/theme',
    enabled: true,
    order: 32
  },
  portalDesigner: {
    id: 'portalDesigner',
    name: 'Portal Designer',
    component: ClientPortalDesignerModule,
    category: 'admin',
    required: false,
    adminOnly: true,
    trainerOnly: false,
    icon: UserCircleIcon,
    description: 'Design and configure client portal',
    tooltip: 'Customize the client portal interface, features, and experience.',
    href: '/client-portal',
    enabled: true,
    order: 33
  },
  databaseManagement: {
    id: 'databaseManagement',
    name: 'Database',
    component: DatabaseManagementModule,
    category: 'admin',
    required: false,
    adminOnly: true,
    trainerOnly: false,
    icon: CloudIcon,
    description: 'Database management and maintenance',
    tooltip: 'Manage database, run backups, and perform maintenance operations.',
    href: '/database',
    enabled: true,
    order: 34
  },
  schemaManagement: {
    id: 'schemaManagement',
    name: 'Schema',
    component: SchemaManagementModule,
    category: 'admin',
    required: false,
    adminOnly: true,
    trainerOnly: false,
    icon: DocumentTextIcon,
    description: 'Database schema management',
    tooltip: 'View and manage database schema and structure.',
    href: '/schema',
    enabled: true,
    order: 35
  },
  apiKeys: {
    id: 'apiKeys',
    name: 'API Keys',
    component: ApiKeysModule,
    category: 'admin',
    required: false,
    adminOnly: true,
    trainerOnly: false,
    icon: CheckCircleIcon,
    description: 'Manage API keys and integrations',
    tooltip: 'Configure API keys for external services and integrations.',
    href: '/settings/api-keys',
    enabled: true,
    order: 36
  },
  systemMonitoring: {
    id: 'systemMonitoring',
    name: 'System Monitoring',
    component: SystemMonitoringModule,
    category: 'admin',
    required: false,
    adminOnly: true,
    trainerOnly: false,
    icon: ShieldCheckIcon,
    description: 'System health monitoring and performance metrics',
    tooltip: 'Monitor system health, performance metrics, and technical infrastructure.',
    href: '/monitoring',
    enabled: true,
    order: 37
  },
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
    enabled: true,
    order: 38
  }
};

// Module categories configuration
export const MODULE_CATEGORIES = {
  core: {
    name: 'Core Business',
    description: 'Daily operations - Everyone',
    alwaysVisible: true,
    color: 'blue',
    roles: ['user', 'manager', 'admin']
  },
  management: {
    name: 'Management',
    description: 'Team oversight - Managers & Admins',
    alwaysVisible: false,
    color: 'purple',
    roles: ['manager', 'admin']
  },
  training: {
    name: 'AI Training',
    description: 'Agent training - Not shown in sidebar',
    alwaysVisible: false,
    color: 'orange',
    roles: ['admin'],
    hiddenFromSidebar: true  // Access via AI Control panel
  },
  admin: {
    name: 'Administration',
    description: 'System configuration - Admins only',
    alwaysVisible: false,
    color: 'gray',
    roles: ['admin']
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
      // Get the category configuration
      const category = MODULE_CATEGORIES[module.category];
      
      // Hide modules from categories that are hidden from sidebar
      if (category?.hiddenFromSidebar) return false;
      
      // Check if user's role is allowed for this category
      if (category?.roles && !category.roles.includes(userRole)) return false;
      
      // CHECK MODULE ROLE PERMISSIONS (security check)
      if (module.adminOnly && userRole !== 'admin') return false;
      if (module.trainerOnly && userRole !== 'admin' && userRole !== 'trainer') return false;
      
      // Always show required modules (if role permits)
      if (module.required) return true;
      
      // Show enabled modules (if role permits)
      if (module.enabled) return true;
      
      // Show if explicitly in enabled list (if role permits)
      if (enabledModules.includes(module.id)) return true;
      
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
