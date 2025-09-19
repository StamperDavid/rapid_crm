import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ExclamationIcon,
  TruckIcon,
  OfficeBuildingIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  CalculatorIcon,
  MapIcon,
  DocumentReportIcon,
  ClipboardListIcon
} from '@heroicons/react/outline';
import FuelTaxCalculator from '../components/ifta/FuelTaxCalculator';
import IFTAClientManagement from '../components/ifta/ClientManagement';

// IFTA Service Interfaces
interface IFTAServicePackage {
  id: string;
  packageName: string;
  packageType: 'basic' | 'standard' | 'premium' | 'enterprise';
  description: string;
  monthlyPrice: number;
  setupFee: number;
  features: string[];
  maxVehicles: number;
  maxQuarterlyFilings: number;
  includesAuditSupport: boolean;
  includesComplianceMonitoring: boolean;
  includesDedicatedSupport: boolean;
  isActive: boolean;
}

interface IFTAClient {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  servicePackage: string;
  status: 'active' | 'suspended' | 'cancelled';
  startDate: string;
  monthlyRevenue: number;
  totalVehicles: number;
  complianceScore: number;
  lastFiling: string;
}

interface IFTARevenue {
  month: string;
  recurring: number;
  setup: number;
  consulting: number;
  total: number;
}

interface IFTAComplianceAlert {
  id: string;
  clientId: string;
  clientName: string;
  alertType: 'filing_due' | 'late_filing' | 'payment_due' | 'audit_required';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  dueDate: string;
  status: 'open' | 'resolved' | 'dismissed';
}

const IFTADashboard: React.FC = () => {
  const [servicePackages, setServicePackages] = useState<IFTAServicePackage[]>([]);
  const [clients, setClients] = useState<IFTAClient[]>([]);
  const [revenue, setRevenue] = useState<IFTARevenue[]>([]);
  const [alerts, setAlerts] = useState<IFTAComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'packages' | 'revenue' | 'alerts' | 'tax_calculator' | 'quarterly_filings' | 'registrations'>('overview');
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);

  useEffect(() => {
    fetchIFTAServiceData();
  }, []);

  const fetchIFTAServiceData = async () => {
    try {
      setLoading(true);
      // Mock data for now - in real implementation, these would be API calls
      setServicePackages([
        {
          id: '1',
          packageName: 'IFTA Basic',
          packageType: 'basic',
          description: 'Essential IFTA filing and compliance',
          monthlyPrice: 150,
          setupFee: 500,
          features: ['Quarterly Filing', 'Basic Reporting', 'Email Support'],
          maxVehicles: 10,
          maxQuarterlyFilings: 4,
          includesAuditSupport: false,
          includesComplianceMonitoring: false,
          includesDedicatedSupport: false,
          isActive: true
        },
        {
          id: '2',
          packageName: 'IFTA Standard',
          packageType: 'standard',
          description: 'Comprehensive IFTA management with monitoring',
          monthlyPrice: 300,
          setupFee: 1000,
          features: ['All Basic Features', 'Compliance Monitoring', 'Phone Support', 'Quarterly Reports'],
          maxVehicles: 50,
          maxQuarterlyFilings: 4,
          includesAuditSupport: true,
          includesComplianceMonitoring: true,
          includesDedicatedSupport: false,
          isActive: true
        },
        {
          id: '3',
          packageName: 'IFTA Premium',
          packageType: 'premium',
          description: 'Full IFTA compliance suite with dedicated support',
          monthlyPrice: 500,
          setupFee: 2000,
          features: ['All Standard Features', 'Dedicated Account Manager', '24/7 Support', 'Custom Reporting', 'Audit Support'],
          maxVehicles: 200,
          maxQuarterlyFilings: 4,
          includesAuditSupport: true,
          includesComplianceMonitoring: true,
          includesDedicatedSupport: true,
          isActive: true
        }
      ]);

      setClients([
        {
          id: '1',
          companyName: 'ABC Trucking Co.',
          contactPerson: 'John Smith',
          email: 'john@abctrucking.com',
          phone: '(555) 123-4567',
          servicePackage: 'standard',
          status: 'active',
          startDate: '2024-01-15',
          monthlyRevenue: 300,
          totalVehicles: 25,
          complianceScore: 95,
          lastFiling: '2024-10-31'
        },
        {
          id: '2',
          companyName: 'XYZ Logistics',
          contactPerson: 'Sarah Johnson',
          email: 'sarah@xyzlogistics.com',
          phone: '(555) 987-6543',
          servicePackage: 'premium',
          status: 'active',
          startDate: '2024-03-01',
          monthlyRevenue: 500,
          totalVehicles: 80,
          complianceScore: 98,
          lastFiling: '2024-10-31'
        }
      ]);

      setRevenue([
        { month: 'Oct 2024', recurring: 12000, setup: 3000, consulting: 2000, total: 17000 },
        { month: 'Nov 2024', recurring: 15000, setup: 1000, consulting: 1500, total: 17500 },
        { month: 'Dec 2024', recurring: 18000, setup: 2000, consulting: 2500, total: 22500 }
      ]);

      setAlerts([
        {
          id: '1',
          clientId: '1',
          clientName: 'ABC Trucking Co.',
          alertType: 'filing_due',
          severity: 'high',
          title: 'Q4 2024 IFTA Filing Due',
          message: 'ABC Trucking Co. Q4 2024 IFTA filing is due within 15 days',
          dueDate: '2025-01-31',
          status: 'open'
        },
        {
          id: '2',
          clientId: '2',
          clientName: 'XYZ Logistics',
          alertType: 'audit_required',
          severity: 'medium',
          title: 'Annual IFTA Audit Scheduled',
          message: 'XYZ Logistics annual IFTA audit is scheduled for next month',
          dueDate: '2025-02-15',
          status: 'open'
        }
      ]);
    } catch (error) {
      console.error('Error fetching IFTA service data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPackageTypeColor = (type: string) => {
    switch (type) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'standard': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handler functions for buttons
  const handleAddNewClient = () => {
    setShowAddClientModal(true);
  };

  const handleCreateServicePackage = () => {
    setShowCreatePackageModal(true);
  };

  const handleCreateNewPackage = () => {
    alert('Create New Package functionality coming soon!');
  };

  const handleAddRegistration = () => {
    alert('Add Registration functionality coming soon!');
  };

  const handleAddFiling = () => {
    alert('Add Filing functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading IFTA Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TruckIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">IFTA Compliance Services</h1>
                <p className="text-gray-600">Manage IFTA filing and compliance services for transportation companies</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleAddNewClient}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Add New Client
              </button>
              <button 
                onClick={handleCreateServicePackage}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Service Package
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'clients', name: 'Clients', icon: UserGroupIcon },
              { id: 'packages', name: 'Service Packages', icon: CogIcon },
              { id: 'revenue', name: 'Revenue', icon: CurrencyDollarIcon },
              { id: 'alerts', name: 'Compliance Alerts', icon: ExclamationIcon },
              { id: 'tax_calculator', name: 'Tax Calculator', icon: CalculatorIcon },
              { id: 'quarterly_filings', name: 'Quarterly Filings', icon: DocumentReportIcon },
              { id: 'registrations', name: 'Registrations', icon: ClipboardListIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserGroupIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Clients</p>
                      <p className="text-2xl font-semibold text-gray-900">{clients.filter(c => c.status === 'active').length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(clients.reduce((sum, client) => sum + client.monthlyRevenue, 0))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TruckIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
                      <p className="text-2xl font-semibold text-gray-900">{clients.reduce((sum, client) => sum + client.totalVehicles, 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ExclamationIcon className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Open Alerts</p>
                      <p className="text-2xl font-semibold text-gray-900">{alerts.filter(a => a.status === 'open').length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Clients by Revenue */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Clients by Revenue</h3>
                <div className="space-y-4">
                  {clients
                    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
                    .slice(0, 5)
                    .map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <OfficeBuildingIcon className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{client.companyName}</p>
                            <p className="text-sm text-gray-600">{client.contactPerson}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">{formatCurrency(client.monthlyRevenue)}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                            {client.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Service Package Distribution */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Package Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {servicePackages.map((pkg) => (
                    <div key={pkg.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{pkg.packageName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPackageTypeColor(pkg.packageType)}`}>
                          {pkg.packageType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(pkg.monthlyPrice)}/month</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <IFTAClientManagement />
          )}

          {/* Service Packages Tab */}
          {activeTab === 'packages' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">IFTA Service Packages</h3>
                <button 
                  onClick={handleCreateNewPackage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create New Package
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {servicePackages.map((pkg) => (
                  <div key={pkg.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{pkg.packageName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPackageTypeColor(pkg.packageType)}`}>
                        {pkg.packageType}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{pkg.description}</p>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">Monthly: {formatCurrency(pkg.monthlyPrice)}</p>
                      <p className="text-sm text-gray-600">Setup: {formatCurrency(pkg.setupFee)}</p>
                      <p className="text-sm text-gray-600">Max Vehicles: {pkg.maxVehicles}</p>
                    </div>
                    <div className="space-y-1">
                      {pkg.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">IFTA Service Revenue</h3>
                <button 
                  onClick={() => alert('Generate Report functionality coming soon!')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Generate Report
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurring Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setup Fees</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consulting</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenue.map((month, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(month.recurring)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(month.setup)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(month.consulting)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(month.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Compliance Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">IFTA Compliance Alerts</h3>
                <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                  Mark All Read
                </button>
              </div>
              
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 border rounded-lg ${
                    alert.status === 'resolved' ? 'bg-gray-50 border-gray-200' : 'bg-white border-red-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {alert.status === 'resolved' ? 'Resolved' : 'Active'}
                          </span>
                        </div>
                        <h4 className="mt-2 text-lg font-medium text-gray-900">{alert.title}</h4>
                        <p className="mt-1 text-gray-600">{alert.message}</p>
                        <p className="mt-2 text-sm text-gray-500">
                          Client: {alert.clientName} • Due: {formatDateTime(alert.dueDate)}
                        </p>
                      </div>
                      {alert.status !== 'resolved' && (
                        <button 
                          onClick={() => alert('Resolve Alert functionality coming soon!')}
                          className="ml-4 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tax Calculator Tab */}
          {activeTab === 'tax_calculator' && (
            <FuelTaxCalculator />
          )}

          {/* Quarterly Filings Tab */}
          {activeTab === 'quarterly_filings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Quarterly IFTA Filings</h3>
                  <p className="text-sm text-gray-600">Manage quarterly fuel tax returns and submissions</p>
                </div>
                <button 
                  onClick={handleAddFiling}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  New Filing
                </button>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-600">Quarterly filing management functionality coming soon...</p>
                <p className="text-sm text-gray-500 mt-2">This will include automated quarterly return generation, state-specific filing requirements, and submission tracking.</p>
              </div>
            </div>
          )}

          {/* Registrations Tab */}
          {activeTab === 'registrations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">IFTA Registrations</h3>
                  <p className="text-sm text-gray-600">Manage IFTA registrations and renewals</p>
                </div>
                <button 
                  onClick={handleAddRegistration}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  New Registration
                </button>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-600">Registration management functionality coming soon...</p>
                <p className="text-sm text-gray-500 mt-2">This will include IFTA account management, renewal tracking, and multi-state registration coordination.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IFTADashboard;
