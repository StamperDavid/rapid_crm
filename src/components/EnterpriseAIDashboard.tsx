import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ExclamationIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  RefreshIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/outline';
import { enterpriseAIService } from '../services/ai/EnterpriseAIService.ts';

interface DashboardData {
  insights: any[];
  workflows: any[];
  learning: any;
  performance: any;
  summary: {
    totalInsights: number;
    activeWorkflows: number;
    feedbackCount: number;
    avgAccuracy: number;
  };
}

const EnterpriseAIDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = enterpriseAIService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const generateSalesForecast = async () => {
    try {
      await enterpriseAIService.generateSalesForecast(12);
      await loadDashboardData();
    } catch (error) {
      console.error('Error generating sales forecast:', error);
    }
  };

  const predictCustomerChurn = async () => {
    try {
      await enterpriseAIService.predictCustomerChurn();
      await loadDashboardData();
    } catch (error) {
      console.error('Error predicting customer churn:', error);
    }
  };

  const detectAnomalies = async () => {
    try {
      await enterpriseAIService.detectAnomalies();
      await loadDashboardData();
    } catch (error) {
      console.error('Error detecting anomalies:', error);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'predictive', name: 'Predictive Analytics', icon: ArrowUpIcon },
    { id: 'learning', name: 'AI Learning', icon: LightBulbIcon },
    { id: 'workflows', name: 'Automation', icon: CogIcon },
    { id: 'performance', name: 'Performance', icon: ClockIcon }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <ExclamationIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No data available</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Unable to load enterprise AI dashboard data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <RefreshIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LightBulbIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    AI Insights
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {dashboardData.summary.totalInsights}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CogIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Active Workflows
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {dashboardData.summary.activeWorkflows}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Feedback Count
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {dashboardData.summary.feedbackCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    AI Accuracy
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {Math.round(dashboardData.summary.avgAccuracy * 100)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={generateSalesForecast}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <ArrowUpIcon className="h-4 w-4 mr-2" />
                  Generate Sales Forecast
                </button>
                <button
                  onClick={predictCustomerChurn}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Predict Customer Churn
                </button>
                <button
                  onClick={detectAnomalies}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <ExclamationIcon className="h-4 w-4 mr-2" />
                  Detect Anomalies
                </button>
              </div>
            </div>

            {/* Recent Insights */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Recent AI Insights
              </h3>
              <div className="space-y-4">
                {dashboardData.insights.slice(0, 5).map((insight) => (
                  <div key={insight.id} className="border-l-4 border-purple-400 pl-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {insight.title}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(insight.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {insight.description}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Confidence: {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictive' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Predictive Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dashboardData.insights.map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {insight.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        insight.type === 'sales_forecast' ? 'bg-green-100 text-green-800' :
                        insight.type === 'churn_prediction' ? 'bg-red-100 text-red-800' :
                        insight.type === 'anomaly_detection' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {insight.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Confidence</span>
                        <span className="text-gray-900 dark:text-white">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                      {insight.recommendations && insight.recommendations.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Recommendations:</p>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {insight.recommendations.slice(0, 2).map((rec, index) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'learning' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                AI Learning System
              </h3>
              {dashboardData.learning && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.round(dashboardData.learning.model.accuracy * 100)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round(dashboardData.learning.model.userSatisfaction * 100)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">User Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {dashboardData.learning.model.feedbackCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Feedback Count</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Automation Workflows
              </h3>
              <div className="space-y-4">
                {dashboardData.workflows.map((workflow) => (
                  <div key={workflow.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {workflow.name}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                        workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        workflow.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {workflow.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {workflow.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{workflow.steps.length} steps</span>
                      <span>Created {new Date(workflow.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Performance Metrics
              </h3>
              {dashboardData.performance && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(dashboardData.performance.averages.responseTime)}ms
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(dashboardData.performance.averages.accuracy * 100)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(dashboardData.performance.averages.userSatisfaction * 100)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">User Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {dashboardData.performance.recommendations.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Recommendations</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseAIDashboard;
