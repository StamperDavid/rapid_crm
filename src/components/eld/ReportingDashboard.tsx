import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TruckIcon,
  ExclamationIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/outline';

interface RevenueData {
  month: string;
  recurring: number;
  setup: number;
  consulting: number;
  total: number;
}

interface ComplianceData {
  companyId: string;
  companyName: string;
  complianceScore: number;
  violations: {
    hos_violations: number;
    dvir_violations: number;
    equipment_violations: number;
  };
  lastAuditDate: string;
  nextAuditDue: string;
  safetyRating: string;
  insuranceStatus: string;
}

interface ClientMetrics {
  totalClients: number;
  activeClients: number;
  totalTrucks: number;
  averageCompliance: number;
  monthlyRecurringRevenue: number;
  totalRevenue: number;
}

interface ReportingDashboardProps {
  clients: any[];
  revenue: RevenueData[];
  complianceData: ComplianceData[];
}

const ReportingDashboard: React.FC<ReportingDashboardProps> = ({
  clients,
  revenue,
  complianceData
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [metrics, setMetrics] = useState<ClientMetrics>({
    totalClients: 0,
    activeClients: 0,
    totalTrucks: 0,
    averageCompliance: 0,
    monthlyRecurringRevenue: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    calculateMetrics();
  }, [clients, revenue, complianceData]);

  const calculateMetrics = () => {
    const activeClients = clients.filter(c => c.status === 'active');
    const totalTrucks = activeClients.reduce((sum, client) => sum + client.totalTrucks, 0);
    const monthlyRecurringRevenue = activeClients.reduce((sum, client) => sum + client.monthlyRevenue, 0);
    const totalRevenue = revenue.reduce((sum, month) => sum + month.total, 0);
    const averageCompliance = complianceData.length > 0 
      ? complianceData.reduce((sum, data) => sum + data.complianceScore, 0) / complianceData.length
      : 0;

    setMetrics({
      totalClients: clients.length,
      activeClients: activeClients.length,
      totalTrucks,
      averageCompliance: Math.round(averageCompliance),
      monthlyRecurringRevenue,
      totalRevenue
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
    return null;
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ELD Service Analytics</h2>
          <p className="text-gray-600">Revenue and compliance insights for your ELD business</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeClients}</p>
              <p className="text-sm text-gray-500">{metrics.totalClients} total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TruckIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Trucks</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalTrucks}</p>
              <p className="text-sm text-gray-500">
                {metrics.activeClients > 0 ? Math.round(metrics.totalTrucks / metrics.activeClients) : 0} avg per client
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.monthlyRecurringRevenue)}</p>
              <p className="text-sm text-gray-500">
                {metrics.activeClients > 0 ? formatCurrency(metrics.monthlyRecurringRevenue / metrics.activeClients) : '$0'} avg per client
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Compliance Score</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.averageCompliance}%</p>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getComplianceBgColor(metrics.averageCompliance)} ${getComplianceColor(metrics.averageCompliance)}`}>
                {metrics.averageCompliance >= 90 ? 'Excellent' : metrics.averageCompliance >= 70 ? 'Good' : 'Needs Attention'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
        <div className="space-y-4">
          {revenue.slice(-6).map((month, index) => {
            const previousMonth = index > 0 ? revenue[revenue.length - 6 + index - 1] : null;
            const growth = previousMonth ? calculateGrowth(month.total, previousMonth.total) : 0;
            
            return (
              <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{month.month}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Recurring: {formatCurrency(month.recurring)}</span>
                    <span>Setup: {formatCurrency(month.setup)}</span>
                    <span>Consulting: {formatCurrency(month.consulting)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(month.total)}</p>
                  {growth !== 0 && (
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(month.total, previousMonth?.total || 0)}
                      <span className={`text-sm ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {growth > 0 ? '+' : ''}{growth}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Overview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Violations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Safety Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Audit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complianceData.map((data) => {
                const totalViolations = data.violations.hos_violations + data.violations.dvir_violations + data.violations.equipment_violations;
                const nextAuditDate = new Date(data.nextAuditDue);
                const isAuditDue = nextAuditDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                
                return (
                  <tr key={data.companyId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-lg font-bold ${getComplianceColor(data.complianceScore)}`}>
                          {data.complianceScore}%
                        </span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              data.complianceScore >= 90 ? 'bg-green-500' :
                              data.complianceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${data.complianceScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          totalViolations === 0 ? 'bg-green-100 text-green-800' :
                          totalViolations <= 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {totalViolations} total
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        data.safetyRating === 'Satisfactory' ? 'bg-green-100 text-green-800' :
                        data.safetyRating === 'Conditional' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {data.safetyRating}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className={`flex items-center ${isAuditDue ? 'text-red-600' : 'text-gray-900'}`}>
                        {isAuditDue && <ExclamationIcon className="h-4 w-4 mr-1" />}
                        {new Date(data.nextAuditDue).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        data.insuranceStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {data.insuranceStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Clients</h3>
          <div className="space-y-3">
            {clients
              .filter(c => c.status === 'active')
              .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
              .slice(0, 5)
              .map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{client.companyName}</p>
                    <p className="text-sm text-gray-600">{client.totalTrucks} trucks</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{formatCurrency(client.monthlyRevenue)}</p>
                    <p className="text-sm text-gray-500">{client.complianceScore}% compliance</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Clients Needing Attention</h3>
          <div className="space-y-3">
            {clients
              .filter(c => c.status === 'active' && c.complianceScore < 80)
              .sort((a, b) => a.complianceScore - b.complianceScore)
              .slice(0, 5)
              .map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-gray-900">{client.companyName}</p>
                    <p className="text-sm text-red-600">Low compliance score</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${getComplianceColor(client.complianceScore)}`}>
                      {client.complianceScore}%
                    </p>
                    <p className="text-sm text-gray-500">{client.totalTrucks} trucks</p>
                  </div>
                </div>
              ))}
            {clients.filter(c => c.status === 'active' && c.complianceScore < 80).length === 0 && (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">All clients are performing well!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportingDashboard;
