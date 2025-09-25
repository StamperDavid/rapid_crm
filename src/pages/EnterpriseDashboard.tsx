import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  FilmIcon,
  PlayIcon,
  ShareIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  ArrowUpIcon,
  UsersIcon,
  OfficeBuildingIcon,
  TruckIcon,
  ClipboardCheckIcon,
  ChipIcon,
  LightningBoltIcon,
  RefreshIcon,
  CloudIcon,
  ShieldCheckIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  XIcon,
  ChatIcon,
  UserGroupIcon
} from '@heroicons/react/outline';
import ContentManagementHub from '../components/enterprise/ContentManagementHub';
import AdvancedAnalyticsDisplay from '../components/enterprise/AdvancedAnalyticsDisplay';
import AutomationCenter from '../components/enterprise/AutomationCenter';
import CommunicationHub from '../components/enterprise/CommunicationHub';
import ClientPortalEnhancements from '../components/enterprise/ClientPortalEnhancements';
import TeamCollaborationTools from '../components/enterprise/TeamCollaborationTools';

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

interface WorkflowStatus {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'error' | 'completed';
  lastRun: string;
  nextRun: string;
  successRate: number;
}

interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'document' | 'training' | 'social';
  status: 'draft' | 'in_progress' | 'review' | 'published';
  created: string;
  views?: number;
  engagement?: number;
}

const EnterpriseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'analytics' | 'automation' | 'communication' | 'client-portal' | 'collaboration'>('overview');
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowStatus[]>([]);
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load metrics
      const metricsData: DashboardMetric[] = [
        {
          id: '1',
          title: 'Active Clients',
          value: 247,
          change: 12.5,
          changeType: 'increase',
          icon: UsersIcon,
          color: 'blue'
        },
        {
          id: '2',
          title: 'Monthly Revenue',
          value: '$2.4M',
          change: 8.2,
          changeType: 'increase',
          icon: ArrowUpIcon,
          color: 'green'
        },
        {
          id: '3',
          title: 'Compliance Score',
          value: '98.7%',
          change: 2.1,
          changeType: 'increase',
          icon: ShieldCheckIcon,
          color: 'emerald'
        },
        {
          id: '4',
          title: 'Content Published',
          value: 156,
          change: -3.2,
          changeType: 'decrease',
          icon: DocumentTextIcon,
          color: 'purple'
        },
        {
          id: '5',
          title: 'Active Workflows',
          value: 23,
          change: 5.0,
          changeType: 'increase',
          icon: ChipIcon,
          color: 'orange'
        },
        {
          id: '6',
          title: 'System Uptime',
          value: '99.9%',
          change: 0.1,
          changeType: 'increase',
          icon: CloudIcon,
          color: 'indigo'
        }
      ];

      // Load workflows
      const workflowsData: WorkflowStatus[] = [
        {
          id: '1',
          name: 'Client Onboarding',
          status: 'active',
          lastRun: '2 minutes ago',
          nextRun: 'In 1 hour',
          successRate: 98.5
        },
        {
          id: '2',
          name: 'Compliance Reporting',
          status: 'active',
          lastRun: '1 hour ago',
          nextRun: 'Daily at 6 AM',
          successRate: 100
        },
        {
          id: '3',
          name: 'Content Distribution',
          status: 'paused',
          lastRun: '3 hours ago',
          nextRun: 'Manual',
          successRate: 95.2
        },
        {
          id: '4',
          name: 'Invoice Generation',
          status: 'error',
          lastRun: 'Failed 2 hours ago',
          nextRun: 'Retry in 30 min',
          successRate: 87.3
        }
      ];

      // Load recent content
      const contentData: ContentItem[] = [
        {
          id: '1',
          title: 'Q4 Safety Training Video',
          type: 'video',
          status: 'published',
          created: '2 hours ago',
          views: 1247,
          engagement: 89.2
        },
        {
          id: '2',
          title: 'DOT Compliance Checklist',
          type: 'document',
          status: 'review',
          created: '4 hours ago'
        },
        {
          id: '3',
          title: 'Driver Safety Course',
          type: 'training',
          status: 'in_progress',
          created: '1 day ago'
        },
        {
          id: '4',
          title: 'LinkedIn Company Update',
          type: 'social',
          status: 'published',
          created: '2 days ago',
          views: 892,
          engagement: 76.8
        }
      ];

      setMetrics(metricsData);
      setWorkflows(workflowsData);
      setRecentContent(contentData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4" />;
      case 'paused': return <ClockIcon className="h-4 w-4" />;
      case 'error': return <ExclamationIcon className="h-4 w-4" />;
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <FilmIcon className="h-5 w-5 text-red-500" />;
      case 'document': return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'training': return <PlayIcon className="h-5 w-5 text-green-500" />;
      case 'social': return <ShareIcon className="h-5 w-5 text-purple-500" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    metric.changeType === 'increase' ? 'text-green-600' : 
                    metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-full bg-${metric.color}-100`}>
                <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Workflow Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(workflow.status)}
                    <div>
                      <p className="font-medium text-gray-900">{workflow.name}</p>
                      <p className="text-sm text-gray-500">
                        Last run: {workflow.lastRun} • Success: {workflow.successRate}%
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                    {workflow.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Content</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentContent.map((content) => (
                <div key={content.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getContentTypeIcon(content.type)}
                    <div>
                      <p className="font-medium text-gray-900">{content.title}</p>
                      <p className="text-sm text-gray-500">
                        {content.created} • {content.views && `${content.views} views`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(content.status)}`}>
                    {content.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentHub = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Management Hub</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Video Production */}
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FilmIcon className="h-8 w-8" />
              <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">23 Active</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Video Production</h3>
            <p className="text-sm opacity-90 mb-4">Create professional videos with AI assistance</p>
            <button className="bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
              Create Video
            </button>
          </div>

          {/* Document Generation */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <DocumentTextIcon className="h-8 w-8" />
              <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">156 Docs</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Document Generation</h3>
            <p className="text-sm opacity-90 mb-4">Automated document creation and templates</p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
              Generate Doc
            </button>
          </div>

          {/* Training Materials */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <PlayIcon className="h-8 w-8" />
              <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">12 Courses</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Training Materials</h3>
            <p className="text-sm opacity-90 mb-4">Interactive training and certification</p>
            <button className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
              Create Course
            </button>
          </div>

          {/* Multi-Channel Distribution */}
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <ShareIcon className="h-8 w-8" />
              <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">8 Channels</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Multi-Channel Distribution</h3>
            <p className="text-sm opacity-90 mb-4">Publish across all platforms</p>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
              Distribute
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Analytics Display</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real-time Performance Metrics */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Real-time Performance</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="font-semibold text-green-600">45ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="font-semibold text-blue-600">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Load</span>
                <span className="font-semibold text-yellow-600">23%</span>
              </div>
            </div>
          </div>

          {/* Compliance Tracking */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Compliance Tracking</h3>
              <ShieldCheckIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">DOT Compliance</span>
                <span className="font-semibold text-green-600">98.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Safety Score</span>
                <span className="font-semibold text-green-600">96.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Audit Ready</span>
                <span className="font-semibold text-green-600">100%</span>
              </div>
            </div>
          </div>

          {/* Sales Pipeline */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sales Pipeline</h3>
              <ArrowUpIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pipeline Value</span>
                <span className="font-semibold text-blue-600">$4.2M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="font-semibold text-green-600">24.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Deal Size</span>
                <span className="font-semibold text-purple-600">$18.5K</span>
              </div>
            </div>
          </div>

          {/* Client Activity */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Client Activity</h3>
              <UsersIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="font-semibold text-purple-600">89</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Support Tickets</span>
                <span className="font-semibold text-orange-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Satisfaction</span>
                <span className="font-semibold text-green-600">4.8/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAutomation = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Automation Center</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workflow Builder */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Workflow Builder</h3>
              <ChipIcon className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Create and manage automated workflows</p>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Create Workflow</span>
              </button>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
                <EyeIcon className="h-4 w-4" />
                <span>View Templates</span>
              </button>
            </div>
          </div>

          {/* Trigger Manager */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Trigger Manager</h3>
              <LightningBoltIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Configure event triggers and conditions</p>
            <div className="space-y-3">
              <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center justify-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Add Trigger</span>
              </button>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
                <PencilIcon className="h-4 w-4" />
                <span>Edit Triggers</span>
              </button>
            </div>
          </div>

          {/* Process Tracker */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Process Tracker</h3>
              <RefreshIcon className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Monitor automation execution and performance</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Running Processes</span>
                <span className="font-semibold text-green-600">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">97.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Runtime</span>
                <span className="font-semibold text-blue-600">2.4s</span>
              </div>
            </div>
          </div>

          {/* Integration Monitor */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Integration Monitor</h3>
              <CloudIcon className="h-6 w-6 text-indigo-500" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Track third-party integrations and APIs</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Integrations</span>
                <span className="font-semibold text-indigo-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API Health</span>
                <span className="font-semibold text-green-600">99.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Sync</span>
                <span className="font-semibold text-blue-600">2 min ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enterprise Dashboard</h1>
              <p className="text-gray-600">Comprehensive business intelligence and automation</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Quick Action</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'content', name: 'Content Hub', icon: DocumentTextIcon },
              { id: 'analytics', name: 'Analytics', icon: ArrowUpIcon },
              { id: 'automation', name: 'Automation', icon: CogIcon },
              { id: 'communication', name: 'Communication', icon: ChatIcon },
              { id: 'client-portal', name: 'Client Portal', icon: OfficeBuildingIcon },
              { id: 'collaboration', name: 'Collaboration', icon: UserGroupIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'content' && <ContentManagementHub />}
        {activeTab === 'analytics' && <AdvancedAnalyticsDisplay />}
        {activeTab === 'automation' && <AutomationCenter />}
        {activeTab === 'communication' && <CommunicationHub />}
        {activeTab === 'client-portal' && <ClientPortalEnhancements />}
        {activeTab === 'collaboration' && <TeamCollaborationTools />}
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
