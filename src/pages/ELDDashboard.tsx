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
  ClipboardCheckIcon,
  UserIcon
} from '@heroicons/react/outline';
import HOSLogManagement from '../components/eld/HOSLogManagement';
import DVIRManagement from '../components/eld/DVIRManagement';
import ClientManagement from '../components/eld/ClientManagement';

interface ELDServicePackage {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  setupFee: number;
  features: string[];
  maxTrucks: number;
  complianceLevel: 'basic' | 'standard' | 'premium' | 'enterprise';
}

interface ELDClient {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  servicePackage: string;
  status: 'active' | 'suspended' | 'cancelled';
  startDate: string;
  monthlyRevenue: number;
  totalTrucks: number;
  complianceScore: number;
  lastAudit: string;
}

interface ELDRevenue {
  month: string;
  recurring: number;
  setup: number;
  consulting: number;
  total: number;
}

interface ComplianceAlert {
  id: string;
  clientId: string;
  clientName: string;
  alertType: 'audit_required' | 'compliance_violation' | 'service_renewal' | 'payment_overdue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'resolved';
}

const ELDDashboard: React.FC = () => {
  const [servicePackages, setServicePackages] = useState<ELDServicePackage[]>([]);
  const [clients, setClients] = useState<ELDClient[]>([]);
  const [revenue, setRevenue] = useState<ELDRevenue[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'packages' | 'revenue' | 'alerts' | 'hos_logs' | 'dvir_reports' | 'drivers' | 'vehicles'>('overview');

  useEffect(() => {
    fetchELDServiceData();
  }, []);

  const fetchELDServiceData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - in real implementation, these would be API calls
      setServicePackages([
        {
          id: 'basic',
          name: 'Basic ELD Compliance',
          description: 'Essential ELD tracking and basic compliance monitoring',
          monthlyPrice: 50,
          setupFee: 500,
          features: ['HOS Logging', 'Basic DVIR', 'Compliance Alerts', 'Monthly Reports'],
          maxTrucks: 10,
          complianceLevel: 'basic'
        },
        {
          id: 'standard',
          name: 'Standard ELD Plus',
          description: 'Advanced compliance with audit support',
          monthlyPrice: 100,
          setupFee: 1000,
          features: ['All Basic Features', 'Audit Preparation', 'Driver Management', 'Quarterly Reviews'],
          maxTrucks: 50,
          complianceLevel: 'standard'
        },
        {
          id: 'premium',
          name: 'Premium ELD Enterprise',
          description: 'Full compliance suite with dedicated support',
          monthlyPrice: 200,
          setupFee: 2000,
          features: ['All Standard Features', 'Dedicated Account Manager', '24/7 Support', 'Custom Reporting'],
          maxTrucks: 200,
          complianceLevel: 'premium'
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
          monthlyRevenue: 1000,
          totalTrucks: 25,
          complianceScore: 95,
          lastAudit: '2024-11-15'
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
          monthlyRevenue: 4000,
          totalTrucks: 80,
          complianceScore: 98,
          lastAudit: '2024-10-20'
        }
      ]);

      setRevenue([
        { month: 'Oct 2024', recurring: 15000, setup: 5000, consulting: 3000, total: 23000 },
        { month: 'Nov 2024', recurring: 18000, setup: 2000, consulting: 2500, total: 22500 },
        { month: 'Dec 2024', recurring: 20000, setup: 3000, consulting: 4000, total: 27000 }
      ]);

      setAlerts([
        {
          id: '1',
          clientId: '1',
          clientName: 'ABC Trucking Co.',
          alertType: 'audit_required',
          severity: 'high',
          title: 'Annual DOT Audit Due',
          message: 'ABC Trucking Co. annual DOT audit is due within 30 days',
          dueDate: '2024-12-15',
          status: 'open'
        },
        {
          id: '2',
          clientId: '2',
          clientName: 'XYZ Logistics',
          alertType: 'service_renewal',
          severity: 'medium',
          title: 'Service Renewal Due',
          message: 'XYZ Logistics service contract expires in 60 days',
          dueDate: '2025-01-01',
          status: 'open'
        }
      ]);
    } catch (error) {
      console.error('Error fetching ELD service data:', error);
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

  const getComplianceLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'standard': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ELD Compliance Services</h1>
            <p className="text-gray-600">Manage ELD compliance services for transportation clients</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Add New Client
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Create Service Package
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'clients', name: 'Clients', icon: OfficeBuildingIcon },
              { id: 'packages', name: 'Service Packages', icon: CogIcon },
            { id: 'revenue', name: 'Revenue', icon: CurrencyDollarIcon },
            { id: 'alerts', name: 'Compliance Alerts', icon: ExclamationIcon },
            { id: 'hos_logs', name: 'HOS Logs', icon: ClockIcon },
            { id: 'dvir_reports', name: 'DVIR Reports', icon: ClipboardCheckIcon },
            { id: 'drivers', name: 'Drivers', icon: UserIcon },
            { id: 'vehicles', name: 'Vehicles', icon: CogIcon }
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
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <OfficeBuildingIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Active Clients</p>
                      <p className="text-2xl font-bold text-blue-900">{clients.filter(c => c.status === 'active').length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(clients.reduce((sum, client) => sum + client.monthlyRevenue, 0))}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <TruckIcon className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Total Trucks</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {clients.reduce((sum, client) => sum + client.totalTrucks, 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationIcon className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600">Open Alerts</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {alerts.filter(a => a.status === 'open').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Clients by Revenue</h3>
                  <div className="space-y-3">
                    {clients
                      .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
                      .slice(0, 5)
                      .map((client) => (
                        <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{client.companyName}</p>
                            <p className="text-sm text-gray-600">{client.totalTrucks} trucks</p>
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

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Service Package Distribution</h3>
                  <div className="space-y-3">
                    {servicePackages.map((pkg) => {
                      const clientCount = clients.filter(c => c.servicePackage === pkg.id).length;
                      return (
                        <div key={pkg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{pkg.name}</p>
                            <p className="text-sm text-gray-600">{formatCurrency(pkg.monthlyPrice)}/month</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-600">{clientCount} clients</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplianceLevelColor(pkg.complianceLevel)}`}>
                              {pkg.complianceLevel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <ClientManagement />
          )}

          {/* HOS Logs Tab */}
          {activeTab === 'hos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Hours of Service Logs</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Add HOS Log
                </button>
              </div>
              
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hosLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {log.driver_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogTypeColor(log.log_type)}`}>
                            {log.log_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(log.start_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.end_time ? formatDateTime(log.end_time) : 'Active'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.location || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.is_edited && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Edited
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DVIR Reports Tab */}
          {activeTab === 'dvir' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Driver Vehicle Inspection Reports</h3>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                  New DVIR Report
                </button>
              </div>
              
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Safe to Drive
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Defects
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dvirReports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.driver_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.vehicle_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInspectionTypeColor(report.inspection_type)}`}>
                            {report.inspection_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(report.inspection_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.is_safe_to_drive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {report.is_safe_to_drive ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.defects ? Object.keys(JSON.parse(report.defects)).length : 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">ELD Alerts</h3>
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
                        <button className="ml-4 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOS Logs Tab */}
          {activeTab === 'hos_logs' && (
            <HOSLogManagement />
          )}

          {/* DVIR Reports Tab */}
          {activeTab === 'dvir_reports' && (
            <DVIRManagement />
          )}

          {/* Drivers Tab */}
          {activeTab === 'drivers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Driver Management</h3>
                  <p className="text-sm text-gray-600">Manage driver qualifications, certifications, and compliance</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Add Driver
                </button>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-600">Driver management functionality coming soon...</p>
                <p className="text-sm text-gray-500 mt-2">This will include driver profiles, CDL management, qualification tracking, and compliance monitoring.</p>
              </div>
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Vehicle Management</h3>
                  <p className="text-sm text-gray-600">Manage fleet vehicles, maintenance schedules, and compliance</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Add Vehicle
                </button>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-600">Vehicle management functionality coming soon...</p>
                <p className="text-sm text-gray-500 mt-2">This will include vehicle profiles, maintenance tracking, inspection schedules, and compliance monitoring.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ELDDashboard;
