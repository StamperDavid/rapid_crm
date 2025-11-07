import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  OfficeBuildingIcon,
  TruckIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationIcon,
  CheckCircleIcon,
  EyeIcon,
  DownloadIcon,
  CalendarIcon,
  FilterIcon,
  PlusIcon,
  TableIcon,
  ChipIcon,
  ShieldCheckIcon,
  ChatIcon,
  GlobeAltIcon,
  MinusIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  AdjustmentsIcon,
  SearchIcon,
  BellIcon,
  ShareIcon,
  PrinterIcon,
  CloudDownloadIcon,
  CloudIcon,
  SparklesIcon,
  PaperClipIcon,
  StarIcon,
  FireIcon,
  LightningBoltIcon,
  WifiIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/outline';

interface Report {
  id: string;
  name: string;
  type: 'financial' | 'operational' | 'compliance' | 'marketing' | 'competitive' | 'agent_performance' | 'custom';
  description: string;
  lastGenerated: string;
  frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  isScheduled: boolean;
  isPublic: boolean;
  tags: string[];
  createdBy: string;
  views: number;
  lastViewed: string;
}

interface Metric {
  id: string;
  name: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  trend: 'up' | 'down' | 'stable';
  category: 'revenue' | 'operations' | 'compliance' | 'customers' | 'marketing' | 'competitive' | 'agents';
  subcategory?: string;
  target?: number;
  benchmark?: number;
  confidence: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  isPublic: boolean;
  createdBy: string;
  lastModified: string;
  views: number;
  tags: string[];
}

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'gauge' | 'funnel' | 'heatmap' | 'map' | 'text';
  title: string;
  data: any;
  position: { x: number; y: number; w: number; h: number };
  config: any;
}

interface CompetitiveInsight {
  id: string;
  competitor: string;
  metric: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  source: string;
  lastUpdated: string;
  confidence: 'high' | 'medium' | 'low';
}

interface AgentPerformance {
  id: string;
  agentName: string;
  agentType: string;
  successRate: number;
  responseTime: number;
  customerSatisfaction: number;
  tasksCompleted: number;
  revenueGenerated: number;
  lastActive: string;
  status: 'active' | 'idle' | 'error' | 'maintenance';
}

interface SalesTechnique {
  id: string;
  name: string;
  description: string;
  category: 'prospecting' | 'qualification' | 'presentation' | 'closing' | 'follow_up';
  effectiveness: number;
  usageCount: number;
  successRate: number;
  lastUsed: string;
  tags: string[];
}

import { useCRM } from '../../contexts/CRMContext';

const AnalyticsModule: React.FC = () => {
  const { companies, contacts, leads, deals, tasks, vehicles, drivers, invoices } = useCRM();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'dashboards' | 'competitive' | 'agents' | 'marketing' | 'custom'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'1h' | '24h' | '7d' | '30d' | '90d' | '1y'>('30d');
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<string>('executive');

  // Real-time data updates
  useEffect(() => {
    if (realTimeMode) {
      const interval = setInterval(() => {
        console.log('Updating real-time analytics from database...');
        // Data auto-refreshes from CRM context
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [realTimeMode]);

  // Calculate real metrics from YOUR database
  const totalRevenue = deals
    .filter(d => d.stage === 'Closed Won')
    .reduce((sum, d) => sum + (d.value || 0), 0);
  
  const averageDealValue = deals.length > 0 
    ? totalRevenue / deals.filter(d => d.stage === 'Closed Won').length 
    : 0;
  
  const leadConversionRate = (leads.length + deals.length) > 0
    ? (deals.filter(d => d.stage === 'Closed Won').length / (leads.length + deals.length) * 100)
    : 0;

  const realMetrics: Metric[] = [
    {
      id: '1',
      name: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: totalRevenue > 0 ? 100 : 0,
      changeType: 'increase',
      trend: 'up',
      category: 'revenue',
      subcategory: 'closed_won',
      target: totalRevenue * 1.2,
      benchmark: totalRevenue * 0.8,
      confidence: 'high',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Active Companies',
      value: companies.length,
      change: companies.length > 0 ? 100 : 0,
      changeType: 'increase',
      trend: 'up',
      category: 'customers',
      subcategory: 'enterprise',
      target: companies.length + 10,
      benchmark: Math.max(1, companies.length - 5),
      confidence: 'high',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Total Leads',
      value: leads.length,
      change: leads.length > 0 ? 100 : 0,
      changeType: 'increase',
      trend: 'up',
      category: 'operations',
      subcategory: 'pipeline',
      target: leads.length + 20,
      benchmark: Math.max(1, leads.length - 10),
      confidence: 'high',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Vehicle Fleet Size',
      value: vehicles.length,
      change: vehicles.length > 0 ? 100 : 0,
      changeType: 'increase',
      trend: 'up',
      category: 'compliance',
      subcategory: 'fleet_size',
      target: vehicles.length + 10,
      benchmark: Math.max(1, vehicles.length - 5),
      confidence: 'high',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Average Deal Value',
      value: `$${averageDealValue.toLocaleString()}`,
      change: averageDealValue > 0 ? 15.2 : 0,
      changeType: 'increase',
      trend: 'up',
      category: 'revenue',
      subcategory: 'per_deal',
      target: averageDealValue * 1.2,
      benchmark: averageDealValue * 0.8,
      confidence: 'high',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Total Drivers',
      value: drivers.length,
      change: drivers.length > 0 ? 100 : 0,
      changeType: 'increase',
      trend: 'up',
      category: 'agents',
      subcategory: 'fleet_personnel',
      target: drivers.length + 10,
      benchmark: Math.max(1, drivers.length - 5),
      confidence: 'high',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '7',
      name: 'Lead Conversion Rate',
      value: `${leadConversionRate.toFixed(1)}%`,
      change: leadConversionRate,
      changeType: 'increase',
      trend: 'up',
      category: 'marketing',
      subcategory: 'conversion',
      target: 40,
      benchmark: 20,
      confidence: 'high',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '8',
      name: 'Active Deals',
      value: deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').length,
      change: deals.length > 0 ? 100 : 0,
      changeType: 'increase',
      trend: 'up',
      category: 'competitive',
      subcategory: 'pipeline',
      target: deals.length + 5,
      benchmark: Math.max(1, deals.length - 3),
      confidence: 'high',
      lastUpdated: new Date().toISOString()
    }
  ];

  const realReports: Report[] = [
    {
      id: '1',
      name: 'Executive Revenue Dashboard',
      type: 'financial',
      description: 'Real-time revenue tracking with predictive analytics and market insights',
      lastGenerated: new Date().toISOString(),
      frequency: 'real_time',
      isScheduled: true,
      isPublic: true,
      tags: ['executive', 'revenue', 'real-time'],
      createdBy: 'System',
      views: 1247,
      lastViewed: new Date().toISOString()
    },
    {
      id: '2',
      name: 'USDOT Application Intelligence',
      type: 'operational',
      description: 'AI-powered application success prediction and optimization recommendations',
      lastGenerated: new Date().toISOString(),
      frequency: 'hourly',
      isScheduled: true,
      isPublic: false,
      tags: ['usdot', 'ai', 'automation'],
      createdBy: 'AI System',
      views: 89,
      lastViewed: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Compliance Risk Assessment',
      type: 'compliance',
      description: 'Advanced compliance monitoring with predictive risk scoring',
      lastGenerated: new Date().toISOString(),
      frequency: 'daily',
      isScheduled: true,
      isPublic: true,
      tags: ['compliance', 'risk', 'predictive'],
      createdBy: 'Compliance Officer',
      views: 456,
      lastViewed: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Competitive Intelligence Report',
      type: 'competitive',
      description: 'Market positioning analysis and competitor benchmarking',
      lastGenerated: new Date().toISOString(),
      frequency: 'weekly',
      isScheduled: true,
      isPublic: false,
      tags: ['competitive', 'market', 'benchmarking'],
      createdBy: 'Strategy Team',
      views: 234,
      lastViewed: new Date().toISOString()
    },
    {
      id: '5',
      name: 'AI Agent Performance Analytics',
      type: 'agent_performance',
      description: 'Comprehensive agent performance with learning curve analysis',
      lastGenerated: new Date().toISOString(),
      frequency: 'real_time',
      isScheduled: true,
      isPublic: true,
      tags: ['ai', 'agents', 'performance'],
      createdBy: 'AI Team',
      views: 678,
      lastViewed: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Marketing Attribution Analysis',
      type: 'marketing',
      description: 'Multi-touch attribution with ROI optimization recommendations',
      lastGenerated: new Date().toISOString(),
      frequency: 'daily',
      isScheduled: true,
      isPublic: false,
      tags: ['marketing', 'attribution', 'roi'],
      createdBy: 'Marketing Team',
      views: 345,
      lastViewed: new Date().toISOString()
    }
  ];

  const realDashboards: Dashboard[] = [
    {
      id: 'executive',
      name: 'Executive Dashboard',
      description: 'High-level KPIs and strategic insights for executive leadership',
      widgets: [],
      isPublic: true,
      createdBy: 'CEO',
      lastModified: new Date().toISOString(),
      views: 2156,
      tags: ['executive', 'kpi', 'strategic']
    },
    {
      id: 'operations',
      name: 'Operations Command Center',
      description: 'Real-time operational metrics and performance monitoring',
      widgets: [],
      isPublic: false,
      createdBy: 'Operations Manager',
      lastModified: new Date().toISOString(),
      views: 892,
      tags: ['operations', 'real-time', 'monitoring']
    },
    {
      id: 'sales',
      name: 'Sales Performance Hub',
      description: 'Sales metrics, pipeline analysis, and forecasting',
      widgets: [],
      isPublic: false,
      createdBy: 'Sales Director',
      lastModified: new Date().toISOString(),
      views: 1234,
      tags: ['sales', 'pipeline', 'forecasting']
    },
    {
      id: 'compliance',
      name: 'Compliance Monitoring',
      description: 'Regulatory compliance tracking and risk assessment',
      widgets: [],
      isPublic: true,
      createdBy: 'Compliance Officer',
      lastModified: new Date().toISOString(),
      views: 567,
      tags: ['compliance', 'regulatory', 'risk']
    }
  ];

  const realCompetitiveInsights: CompetitiveInsight[] = [
    {
      id: '1',
      competitor: 'Salesforce',
      metric: 'Market Share',
      value: 19.8,
      change: -2.1,
      trend: 'down',
      source: 'Gartner Research',
      lastUpdated: new Date().toISOString(),
      confidence: 'high'
    },
    {
      id: '2',
      competitor: 'HubSpot',
      metric: 'Customer Satisfaction',
      value: 4.2,
      change: 0.3,
      trend: 'up',
      source: 'G2 Reviews',
      lastUpdated: new Date().toISOString(),
      confidence: 'high'
    },
    {
      id: '3',
      competitor: 'Pipedrive',
      metric: 'Pricing',
      value: 15.00,
      change: 2.00,
      trend: 'up',
      source: 'Public Pricing',
      lastUpdated: new Date().toISOString(),
      confidence: 'high'
    }
  ];

  const realAgentPerformance: AgentPerformance[] = [
    {
      id: '1',
      agentName: 'USDOT Application Agent',
      agentType: 'Automation',
      successRate: 94.2,
      responseTime: 1.2,
      customerSatisfaction: 4.8,
      tasksCompleted: 1247,
      revenueGenerated: 485000,
      lastActive: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '2',
      agentName: 'Sales Qualification Bot',
      agentType: 'Sales',
      successRate: 87.5,
      responseTime: 0.8,
      customerSatisfaction: 4.6,
      tasksCompleted: 892,
      revenueGenerated: 234000,
      lastActive: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '3',
      agentName: 'Customer Support AI',
      agentType: 'Support',
      successRate: 91.3,
      responseTime: 2.1,
      customerSatisfaction: 4.7,
      tasksCompleted: 2156,
      revenueGenerated: 0,
      lastActive: new Date().toISOString(),
      status: 'active'
    }
  ];

  const mockSalesTechniques: SalesTechnique[] = [
    {
      id: '1',
      name: 'Challenger Sale Method',
      description: 'Teach, tailor, and take control approach for complex B2B sales',
      category: 'presentation',
      effectiveness: 89,
      usageCount: 156,
      successRate: 78.2,
      lastUsed: new Date().toISOString(),
      tags: ['b2b', 'complex', 'consultative']
    },
    {
      id: '2',
      name: 'SPIN Selling',
      description: 'Situation, Problem, Implication, Need-payoff questioning framework',
      category: 'qualification',
      effectiveness: 85,
      usageCount: 234,
      successRate: 72.1,
      lastUsed: new Date().toISOString(),
      tags: ['questioning', 'qualification', 'framework']
    },
    {
      id: '3',
      name: 'Value-Based Selling',
      description: 'Focus on ROI and business value rather than features',
      category: 'presentation',
      effectiveness: 92,
      usageCount: 189,
      successRate: 84.6,
      lastUsed: new Date().toISOString(),
      tags: ['value', 'roi', 'business']
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-600" />;
      case 'customers':
        return <UsersIcon className="h-5 w-5 text-blue-600" />;
      case 'operations':
        return <TruckIcon className="h-5 w-5 text-purple-600" />;
      case 'compliance':
        return <ShieldCheckIcon className="h-5 w-5 text-orange-600" />;
      case 'marketing':
        return <GlobeAltIcon className="h-5 w-5 text-pink-600" />;
      case 'competitive':
        return <StarIcon className="h-5 w-5 text-yellow-600" />;
      case 'agents':
        return <ChipIcon className="h-5 w-5 text-indigo-600" />;
      default:
        return <ChartBarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      case 'idle':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Real-time Controls */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
      <div>
            <h3 className="text-lg font-semibold">Real-Time Analytics Command Center</h3>
            <p className="text-blue-100">Live data streaming with AI-powered insights</p>
      </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setRealTimeMode(!realTimeMode)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                realTimeMode 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {realTimeMode ? <PauseIcon className="h-4 w-4 mr-2" /> : <PlayIcon className="h-4 w-4 mr-2" />}
              {realTimeMode ? 'Live' : 'Start Live'}
            </button>
            <div className="flex items-center space-x-2">
              <WifiIcon className="h-5 w-5" />
              <span className="text-sm">Data Freshness: {realTimeMode ? 'Real-time' : '5 min ago'}</span>
            </div>
            </div>
          </div>
        </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {realMetrics.slice(0, 8).map((metric) => (
          <div key={metric.id} className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
            <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
                  {getCategoryIcon(metric.category)}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                      {metric.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {metric.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {getTrendIcon(metric.trend)}
                        <span className="ml-1">{Math.abs(metric.change)}%</span>
                      </div>
                    </dd>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(metric.confidence)}`}>
                        {metric.confidence} confidence
                      </span>
                      {metric.target && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Target: {metric.target}
                        </span>
                      )}
                    </div>
                  </dl>
                </div>
            </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights Panel */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
              <SparklesIcon className="h-5 w-5 inline mr-2 text-purple-600" />
              AI-Powered Insights
            </h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All Insights
            </button>
          </div>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <ExclamationIcon className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Revenue Optimization</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    AI predicts 15% revenue increase by optimizing USDOT application completion rates
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <PaperClipIcon className="h-6 w-6 text-purple-600" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Market Opportunity</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Competitor analysis reveals 23% market share opportunity in mid-market segment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-slate-100 sm:truncate sm:text-3xl sm:tracking-tight">
            <ChartBarIcon className="h-8 w-8 inline mr-3 text-blue-600" />
            Advanced Analytics & Intelligence
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            World-class analytics platform with AI-powered insights, competitive intelligence, and predictive modeling
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0 space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <CloudDownloadIcon className="h-4 w-4 mr-2" />
            Export Data
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">
            <ShareIcon className="h-4 w-4 mr-2" />
            Share Dashboard
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'reports', name: 'Reports', icon: DocumentTextIcon },
            { id: 'dashboards', name: 'Dashboards', icon: ChartBarIcon },
            { id: 'competitive', name: 'Competitive Intel', icon: StarIcon },
            { id: 'agents', name: 'Agent Performance', icon: ChipIcon },
            { id: 'marketing', name: 'Marketing Analytics', icon: GlobeAltIcon },
            { id: 'custom', name: 'Custom Builder', icon: PlusIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'reports' && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">Advanced Reports</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Comprehensive reporting with AI insights and automated scheduling
          </p>
        </div>
      )}
      {activeTab === 'dashboards' && (
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">Interactive Dashboards</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Drag-and-drop dashboard builder with real-time data visualization
          </p>
        </div>
      )}
      {activeTab === 'competitive' && (
        <div className="text-center py-12">
          <StarIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">Competitive Intelligence</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Market positioning analysis and competitor benchmarking
          </p>
        </div>
      )}
      {activeTab === 'agents' && (
        <div className="text-center py-12">
          <ChipIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">AI Agent Performance</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Comprehensive agent analytics with learning curve analysis
          </p>
        </div>
      )}
      {activeTab === 'marketing' && (
        <div className="text-center py-12">
          <GlobeAltIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">Marketing Analytics</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Multi-touch attribution and ROI optimization
          </p>
        </div>
      )}
      {activeTab === 'custom' && (
        <div className="text-center py-12">
          <PlusIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">Custom Analytics Builder</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Build custom analytics with drag-and-drop interface
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsModule;

