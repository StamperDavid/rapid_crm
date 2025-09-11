import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  ServerIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CircleStackIcon,
  CloudIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface SystemMetric {
  id: string;
  name: string;
  value: string | number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const SystemMonitoringModule: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      id: '1',
      name: 'CPU Usage',
      value: '45%',
      status: 'healthy',
      trend: 'stable',
      icon: CpuChipIcon,
      color: 'text-blue-500',
      description: 'System CPU utilization'
    },
    {
      id: '2',
      name: 'Memory Usage',
      value: '2.1 GB',
      status: 'healthy',
      trend: 'stable',
      icon: ServerIcon,
      color: 'text-green-500',
      description: 'RAM consumption'
    },
    {
      id: '3',
      name: 'Active Users',
      value: 12,
      status: 'healthy',
      trend: 'up',
      icon: ChartBarIcon,
      color: 'text-purple-500',
      description: 'Currently logged in users'
    },
    {
      id: '4',
      name: 'Database Connections',
      value: '8/50',
      status: 'healthy',
      trend: 'stable',
      icon: CircleStackIcon,
      color: 'text-indigo-500',
      description: 'Active database connections'
    },
    {
      id: '5',
      name: 'API Response Time',
      value: '120ms',
      status: 'healthy',
      trend: 'down',
      icon: CloudIcon,
      color: 'text-cyan-500',
      description: 'Average API response time'
    },
    {
      id: '6',
      name: 'AI Agent Status',
      value: '5/5 Active',
      status: 'healthy',
      trend: 'stable',
      icon: ShieldCheckIcon,
      color: 'text-emerald-500',
      description: 'AI agents operational status'
    },
    {
      id: '7',
      name: 'Active Conversations',
      value: 23,
      status: 'healthy',
      trend: 'up',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-orange-500',
      description: 'Ongoing customer conversations'
    },
    {
      id: '8',
      name: 'USDOT Applications',
      value: '3 Processing',
      status: 'warning',
      trend: 'up',
      icon: TruckIcon,
      color: 'text-yellow-500',
      description: 'USDOT applications in progress'
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      message: 'High memory usage detected on server-02',
      timestamp: '2024-01-20T15:30:00Z',
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      message: 'USDOT Application Agent completed 5 applications today',
      timestamp: '2024-01-20T14:45:00Z',
      resolved: false
    },
    {
      id: '3',
      type: 'error',
      message: 'Database connection timeout on backup server',
      timestamp: '2024-01-20T13:20:00Z',
      resolved: true
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return ExclamationTriangleIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'info': return CheckCircleIcon;
      default: return CheckCircleIcon;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Monitoring</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Real-time system performance and health metrics
          </p>
        </div>
        <button
          onClick={refreshMetrics}
          disabled={isRefreshing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <div key={metric.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <IconComponent className={`h-8 w-8 ${metric.color}`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{metric.name}</h3>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{metric.value}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">{metric.trend}</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">{metric.description}</p>
            </div>
          );
        })}
      </div>

      {/* Alerts Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">System Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {alerts.map((alert) => {
            const AlertIcon = getAlertIcon(alert.type);
            return (
              <div key={alert.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <AlertIcon className={`h-5 w-5 ${getAlertColor(alert.type)} mr-3`} />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{alert.message}</p>
                    <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {alert.resolved ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Response Time Trend</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
              <p>Performance charts will be displayed here</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">System Health Overview</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <ServerIcon className="h-12 w-12 mx-auto mb-2" />
              <p>Health monitoring dashboard will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoringModule;