import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationIcon,
  CheckCircleIcon,
  TruckIcon,
  UserIcon,
  ClipboardCheckIcon,
  ChartBarIcon,
  BellIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  RefreshIcon,
} from '@heroicons/react/outline';

interface ComplianceRecord {
  id: string;
  companyId: string;
  companyName: string;
  usdotNumber: string;
  mcNumber: string;
  status: 'compliant' | 'warning' | 'violation' | 'expired';
  safetyRating: string;
  insuranceStatus: 'active' | 'expired' | 'insufficient';
  lastInspection: string;
  nextInspection: string;
  violations: number;
  documents: ComplianceDocument[];
}

interface ComplianceDocument {
  id: string;
  name: string;
  type: 'insurance' | 'inspection' | 'permit' | 'license' | 'certification';
  status: 'valid' | 'expiring' | 'expired';
  expirationDate: string;
  fileUrl?: string;
}

interface ComplianceAlert {
  id: string;
  type: 'expiration' | 'violation' | 'inspection_due' | 'insurance_lapse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  companyName: string;
  dueDate: string;
  isRead: boolean;
}

const ComplianceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'documents' | 'alerts'>('overview');
  const [selectedCompany, setSelectedCompany] = useState<ComplianceRecord | null>(null);

  const mockComplianceRecords: ComplianceRecord[] = [
    {
      id: '1',
      companyId: '1',
      companyName: 'Acme Transportation LLC',
      usdotNumber: '123456',
      mcNumber: 'MC-789012',
      status: 'compliant',
      safetyRating: 'Satisfactory',
      insuranceStatus: 'active',
      lastInspection: '2024-01-15',
      nextInspection: '2024-07-15',
      violations: 0,
      documents: [
        { id: '1', name: 'General Liability Insurance', type: 'insurance', status: 'valid', expirationDate: '2024-12-31' },
        { id: '2', name: 'Annual Vehicle Inspection', type: 'inspection', status: 'valid', expirationDate: '2024-07-15' },
        { id: '3', name: 'USDOT Registration', type: 'permit', status: 'valid', expirationDate: '2025-01-20' }
      ]
    },
    {
      id: '2',
      companyId: '2',
      companyName: 'Global Shipping Co',
      usdotNumber: '789012',
      mcNumber: 'MC-345678',
      status: 'warning',
      safetyRating: 'Conditional',
      insuranceStatus: 'active',
      lastInspection: '2024-01-10',
      nextInspection: '2024-04-10',
      violations: 2,
      documents: [
        { id: '4', name: 'Cargo Insurance', type: 'insurance', status: 'expiring', expirationDate: '2024-02-15' },
        { id: '5', name: 'Hazmat Endorsement', type: 'certification', status: 'valid', expirationDate: '2024-08-20' },
        { id: '6', name: 'Vehicle Inspection', type: 'inspection', status: 'expiring', expirationDate: '2024-04-10' }
      ]
    }
  ];

  const mockAlerts: ComplianceAlert[] = [
    {
      id: '1',
      type: 'expiration',
      severity: 'high',
      message: 'Cargo Insurance expires in 15 days',
      companyName: 'Global Shipping Co',
      dueDate: '2024-02-15',
      isRead: false
    },
    {
      id: '2',
      type: 'inspection_due',
      severity: 'medium',
      message: 'Annual vehicle inspection due in 30 days',
      companyName: 'Global Shipping Co',
      dueDate: '2024-04-10',
      isRead: false
    },
    {
      id: '3',
      type: 'violation',
      severity: 'critical',
      message: '2 safety violations reported - immediate action required',
      companyName: 'Global Shipping Co',
      dueDate: '2024-01-25',
      isRead: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'violation':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      case 'expired':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300';
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    Compliant Companies
                  </dt>
                  <dd className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    {mockComplianceRecords.filter(r => r.status === 'compliant').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    Warnings
                  </dt>
                  <dd className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    {mockComplianceRecords.filter(r => r.status === 'warning').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    Total Documents
                  </dt>
                  <dd className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    {mockComplianceRecords.reduce((sum, r) => sum + r.documents.length, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BellIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    Active Alerts
                  </dt>
                  <dd className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    {mockAlerts.filter(a => !a.isRead).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
            Recent Compliance Alerts
          </h3>
        </div>
        <div className="px-6 py-6">
          <div className="space-y-4">
            {mockAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`p-4 border-l-4 rounded-r-lg ${
                alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                alert.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' :
                alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {alert.message}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {alert.companyName} • Due: {new Date(alert.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {!alert.isRead && (
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompanies = () => (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
            Company Compliance Status
          </h3>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Company
          </button>
        </div>
      </div>
      <div className="px-6 py-6">
        <div className="space-y-4">
          {mockComplianceRecords.map((record) => (
            <div key={record.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <TruckIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {record.companyName}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      USDOT: {record.usdotNumber} • MC: {record.mcNumber}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Safety Rating: {record.safetyRating}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Violations: {record.violations}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Next Inspection: {new Date(record.nextInspection).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedCompany(record)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-slate-600 hover:text-slate-700">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
          Compliance Documents
        </h3>
      </div>
      <div className="px-6 py-6">
        <div className="space-y-4">
          {mockComplianceRecords.flatMap(record => 
            record.documents.map(doc => (
              <div key={doc.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <ClipboardCheckIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {doc.name}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {record.companyName} • {doc.type} • Expires: {new Date(doc.expirationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'valid' ? 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300' :
                      doc.status === 'expiring' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {doc.status}
                    </span>
                    <button className="text-blue-600 hover:text-blue-700">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
            Compliance Alerts
          </h3>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <RefreshIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>
      <div className="px-6 py-6">
        <div className="space-y-4">
          {mockAlerts.map((alert) => (
            <div key={alert.id} className={`p-4 border-l-4 rounded-r-lg ${
              alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
              alert.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' :
              alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
              'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {alert.message}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {alert.companyName} • Due: {new Date(alert.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!alert.isRead && (
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  )}
                  <button className="text-slate-600 hover:text-slate-700">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
            DOT Compliance Management
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor regulatory compliance, safety ratings, and document management
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'companies', name: 'Companies', icon: TruckIcon },
            { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
            { id: 'alerts', name: 'Alerts', icon: BellIcon },
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
      {activeTab === 'companies' && renderCompanies()}
      {activeTab === 'documents' && renderDocuments()}
      {activeTab === 'alerts' && renderAlerts()}
    </div>
  );
};

export default ComplianceModule;

