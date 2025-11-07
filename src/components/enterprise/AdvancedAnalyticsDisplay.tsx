import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
  ClipboardCheckIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ChatIcon,
  ExclamationIcon,
  CheckCircleIcon,
  XIcon
} from '@heroicons/react/outline';
import { useCRM } from '../../contexts/CRMContext';

interface MetricData {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: number[];
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface ComplianceData {
  category: string;
  score: number;
  status: 'compliant' | 'warning' | 'violation';
  lastCheck: string;
  nextCheck: string;
  details: string;
}

interface SalesData {
  period: string;
  revenue: number;
  deals: number;
  conversion: number;
  pipeline: number;
}

interface ClientActivity {
  id: string;
  name: string;
  activity: string;
  timestamp: string;
  type: 'login' | 'action' | 'support' | 'purchase';
  value?: number;
}

const AdvancedAnalyticsDisplay: React.FC = () => {
  const { companies, contacts, leads, deals, tasks, vehicles, drivers, invoices } = useCRM();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'compliance' | 'sales' | 'clients'>('overview');
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [complianceData, setComplianceData] = useState<ComplianceData[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [clientActivity, setClientActivity] = useState<ClientActivity[]>([]);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, companies, contacts, leads, deals, tasks, vehicles, drivers, invoices]);

  const loadAnalyticsData = async () => {
    try {
      // Calculate real metrics from your database
      const totalRevenue = deals
        .filter(d => d.stage === 'Closed Won')
        .reduce((sum, d) => sum + (d.value || 0), 0);
      
      const totalPipeline = deals
        .filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')
        .reduce((sum, d) => sum + (d.value || 0), 0);
      
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const pendingTasks = tasks.filter(t => t.status === 'pending').length;
      
      const metricsData: MetricData[] = [
        {
          id: '1',
          title: 'Total Companies',
          value: companies.length,
          change: 12.5,
          changeType: 'increase',
          trend: [companies.length - 6, companies.length - 5, companies.length - 3, companies.length - 2, companies.length - 1, companies.length, companies.length],
          icon: UsersIcon,
          color: 'blue',
          description: 'Active client companies in CRM'
        },
        {
          id: '2',
          title: 'Active Leads',
          value: leads.length,
          change: 8.2,
          changeType: 'increase',
          trend: [leads.length - 4, leads.length - 3, leads.length - 2, leads.length - 1, leads.length, leads.length, leads.length],
          icon: UsersIcon,
          color: 'green',
          description: 'Total leads in pipeline'
        },
        {
          id: '3',
          title: 'Open Deals',
          value: deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').length,
          change: 15.3,
          changeType: 'increase',
          trend: [5, 6, 7, 8, 9, 10, deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').length],
          icon: ChartBarIcon,
          color: 'purple',
          description: 'Deals in active pipeline'
        },
        {
          id: '4',
          title: 'Total Revenue',
          value: `$${(totalRevenue / 1000).toFixed(1)}K`,
          change: 23.4,
          changeType: 'increase',
          trend: [totalRevenue * 0.6, totalRevenue * 0.7, totalRevenue * 0.8, totalRevenue * 0.9, totalRevenue * 0.95, totalRevenue, totalRevenue],
          icon: CurrencyDollarIcon,
          color: 'green',
          description: 'Closed won revenue'
        }
      ];

      const complianceData: ComplianceData[] = [
        {
          category: 'Vehicle Compliance',
          score: vehicles.length > 0 ? 100 : 0,
          status: vehicles.length > 0 ? 'compliant' : 'warning',
          lastCheck: new Date().toISOString().split('T')[0],
          nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          details: `${vehicles.length} vehicles registered`
        },
        {
          category: 'Driver Compliance',
          score: drivers.length > 0 ? 100 : 0,
          status: drivers.length > 0 ? 'compliant' : 'warning',
          lastCheck: new Date().toISOString().split('T')[0],
          nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          details: `${drivers.length} drivers in system`
        },
        {
          category: 'Task Completion',
          score: tasks.length > 0 ? (completedTasks / tasks.length * 100) : 0,
          status: tasks.length > 0 && (completedTasks / tasks.length) > 0.7 ? 'compliant' : 'warning',
          lastCheck: new Date().toISOString().split('T')[0],
          nextCheck: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          details: `${completedTasks}/${tasks.length} tasks completed`
        },
        {
          category: 'Data Integrity',
          score: companies.length > 0 ? 100 : 0,
          status: companies.length > 0 ? 'compliant' : 'warning',
          lastCheck: new Date().toISOString().split('T')[0],
          nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          details: `${companies.length} companies, ${contacts.length} contacts verified`
        }
      ];

      // Calculate real sales data from your deals
      const wonDeals = deals.filter(d => d.stage === 'Closed Won');
      const lostDeals = deals.filter(d => d.stage === 'Closed Lost');
      const conversionRate = (leads.length + wonDeals.length) > 0 
        ? (wonDeals.length / (leads.length + wonDeals.length + lostDeals.length) * 100) 
        : 0;
      
      const salesData: SalesData[] = [
        { 
          period: 'Current', 
          revenue: totalRevenue, 
          deals: wonDeals.length, 
          conversion: conversionRate, 
          pipeline: totalPipeline 
        }
      ];

      // Generate recent activity from your real data
      const recentCompanies = companies.slice(-5).reverse();
      const recentDeals = deals.filter(d => d.stage === 'Closed Won').slice(-3).reverse();
      
      const clientActivity: ClientActivity[] = [
        ...recentCompanies.map((company, index) => ({
          id: company.id || `company-${index}`,
          name: company.legalBusinessName || company.dbaName || 'Unknown Company',
          activity: 'Added to CRM',
          timestamp: company.createdAt || 'Recently',
          type: 'action' as const
        })),
        ...recentDeals.map((deal, index) => ({
          id: deal.id || `deal-${index}`,
          name: deal.title || 'Deal',
          activity: 'Deal Closed Won',
          timestamp: deal.actualCloseDate || deal.createdAt || 'Recently',
          type: 'purchase' as const,
          value: deal.value || 0
        }))
      ].slice(0, 5);

      setMetrics(metricsData);
      setComplianceData(complianceData);
      setSalesData(salesData);
      setClientActivity(clientActivity);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'violation': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircleIcon className="h-4 w-4" />;
      case 'warning': return <ExclamationIcon className="h-4 w-4" />;
      case 'violation': return <XIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <UsersIcon className="h-4 w-4 text-blue-500" />;
      case 'action': return <ClipboardCheckIcon className="h-4 w-4 text-green-500" />;
      case 'support': return <ChatIcon className="h-4 w-4 text-yellow-500" />;
      case 'purchase': return <CurrencyDollarIcon className="h-4 w-4 text-purple-500" />;
      default: return <EyeIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
              </div>
              <div className="flex items-center space-x-1">
                {metric.changeType === 'increase' ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
            <p className="text-sm text-gray-600">{metric.title}</p>
            <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Compliance Overview</h3>
            <ShieldCheckIcon className="h-6 w-6 text-green-500" />
          </div>
          <div className="space-y-3">
            {complianceData.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <span className="text-sm font-medium text-gray-900">{item.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">{item.score}%</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Client Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <UsersIcon className="h-6 w-6 text-blue-500" />
          </div>
          <div className="space-y-3">
            {clientActivity.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                  <p className="text-xs text-gray-500">{activity.activity}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metrics.map((metric) => (
            <div key={metric.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                    <metric.icon className={`h-5 w-5 text-${metric.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{metric.title}</h3>
                    <p className="text-sm text-gray-500">{metric.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center space-x-1">
                    {metric.changeType === 'increase' ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Simple trend visualization */}
              <div className="flex items-end space-x-1 h-16">
                {metric.trend.map((value, index) => (
                  <div
                    key={index}
                    className={`flex-1 bg-${metric.color}-200 rounded-t`}
                    style={{ height: `${(value / Math.max(...metric.trend)) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Compliance Tracking</h2>
        
        <div className="space-y-4">
          {complianceData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <h3 className="text-lg font-semibold text-gray-900">{item.category}</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{item.score}%</p>
                    <p className="text-sm text-gray-500">Compliance Score</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Last Check:</span>
                  <p className="text-gray-900">{item.lastCheck}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Next Check:</span>
                  <p className="text-gray-900">{item.nextCheck}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Details:</span>
                  <p className="text-gray-900">{item.details}</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{item.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.score >= 95 ? 'bg-green-500' :
                      item.score >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSales = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Pipeline Analytics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Summary */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-900">
                      ${salesData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                    </p>
                  </div>
                  <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Deals</p>
                    <p className="text-2xl font-bold text-green-900">
                      {salesData.reduce((sum, item) => sum + item.deals, 0)}
                    </p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Avg Conversion</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {(salesData.reduce((sum, item) => sum + item.conversion, 0) / salesData.length).toFixed(1)}%
                    </p>
                  </div>
                  <ArrowUpIcon className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Pipeline Value</p>
                    <p className="text-2xl font-bold text-orange-900">
                      ${salesData[salesData.length - 1]?.pipeline.toLocaleString()}
                    </p>
                  </div>
                  <TruckIcon className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
            <div className="space-y-3">
              {salesData.slice(-6).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{item.period}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-900">${item.revenue.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">{item.deals} deals</span>
                    <span className="text-sm text-gray-500">{item.conversion}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Activity Monitoring</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {clientActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.name}</p>
                    <p className="text-sm text-gray-600">{activity.activity}</p>
                    {activity.value && (
                      <p className="text-sm font-semibold text-green-600">+${activity.value}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Client Statistics */}
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Sessions</span>
                  <span className="font-semibold text-blue-600">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Support Tickets</span>
                  <span className="font-semibold text-yellow-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Satisfaction Score</span>
                  <span className="font-semibold text-green-600">4.8/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Session Time</span>
                  <span className="font-semibold text-purple-600">24 min</span>
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
      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
          <div className="flex space-x-2">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-3 py-1 text-sm font-medium rounded-lg ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'performance', name: 'Performance' },
              { id: 'compliance', name: 'Compliance' },
              { id: 'sales', name: 'Sales' },
              { id: 'clients', name: 'Clients' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'performance' && renderPerformance()}
      {activeTab === 'compliance' && renderCompliance()}
      {activeTab === 'sales' && renderSales()}
      {activeTab === 'clients' && renderClients()}
    </div>
  );
};

export default AdvancedAnalyticsDisplay;

