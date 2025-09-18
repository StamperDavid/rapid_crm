import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  DownloadIcon,
  PrinterIcon,
  EyeIcon,
  ExclamationIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  UserIcon
} from '@heroicons/react/outline';

interface ComplianceReport {
  id: string;
  reportType: 'hos_compliance' | 'dvir_summary' | 'audit_preparation' | 'driver_performance' | 'fleet_safety';
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  generatedDate: string;
  periodStart: string;
  periodEnd: string;
  status: 'draft' | 'ready' | 'sent' | 'archived';
  violations: number;
  alerts: number;
  complianceScore: number;
  filePath?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on_demand';
  autoGenerate: boolean;
  recipients: string[];
}

const ComplianceReporting: React.FC = () => {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [showGenerateReport, setShowGenerateReport] = useState(false);
  const [reportType, setReportType] = useState<string>('');
  const [clientFilter, setClientFilter] = useState<string>('');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, fetch from database
      const mockReports: ComplianceReport[] = [
        {
          id: '1',
          reportType: 'hos_compliance',
          title: 'HOS Compliance Report - Q4 2024',
          description: 'Comprehensive hours of service compliance analysis for Q4 2024',
          clientId: 'client_1',
          clientName: 'ABC Trucking Company',
          generatedDate: new Date().toISOString(),
          periodStart: '2024-10-01',
          periodEnd: '2024-12-31',
          status: 'ready',
          violations: 3,
          alerts: 12,
          complianceScore: 87
        },
        {
          id: '2',
          reportType: 'dvir_summary',
          title: 'DVIR Summary Report - December 2024',
          description: 'Driver Vehicle Inspection Reports summary for December 2024',
          clientId: 'client_2',
          clientName: 'XYZ Logistics',
          generatedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          periodStart: '2024-12-01',
          periodEnd: '2024-12-31',
          status: 'sent',
          violations: 1,
          alerts: 5,
          complianceScore: 94
        },
        {
          id: '3',
          reportType: 'audit_preparation',
          title: 'DOT Audit Preparation Report',
          description: 'Pre-audit compliance assessment and documentation review',
          clientId: 'client_3',
          clientName: 'Fleet Masters Inc',
          generatedDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          periodStart: '2024-01-01',
          periodEnd: '2024-12-31',
          status: 'draft',
          violations: 0,
          alerts: 2,
          complianceScore: 96
        }
      ];

      const mockTemplates: ReportTemplate[] = [
        {
          id: '1',
          name: 'HOS Compliance Report',
          description: 'Standard hours of service compliance report',
          category: 'compliance',
          frequency: 'monthly',
          autoGenerate: true,
          recipients: ['compliance@client.com', 'safety@client.com']
        },
        {
          id: '2',
          name: 'DVIR Summary Report',
          description: 'Driver Vehicle Inspection Reports summary',
          category: 'safety',
          frequency: 'weekly',
          autoGenerate: true,
          recipients: ['maintenance@client.com']
        },
        {
          id: '3',
          name: 'Audit Preparation Report',
          description: 'DOT audit readiness assessment',
          category: 'compliance',
          frequency: 'quarterly',
          autoGenerate: false,
          recipients: ['compliance@client.com']
        }
      ];

      setReports(mockReports);
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'hos_compliance': return ClockIcon;
      case 'dvir_summary': return TruckIcon;
      case 'audit_preparation': return CheckCircleIcon;
      case 'driver_performance': return UserIcon;
      case 'fleet_safety': return ExclamationIcon;
      default: return DocumentTextIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-100';
    if (score >= 85) return 'text-blue-600 bg-blue-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredReports = reports.filter(report => {
    const matchesClient = !clientFilter || report.clientName.toLowerCase().includes(clientFilter.toLowerCase());
    return matchesClient;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compliance Reporting</h2>
          <p className="text-gray-600">Generate and manage ELD compliance reports</p>
        </div>
        <button
          onClick={() => setShowGenerateReport(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <DocumentTextIcon className="h-5 w-5" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ready Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.filter(r => r.status === 'ready').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ExclamationIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Violations</p>
              <p className="text-2xl font-bold text-gray-900">{reports.reduce((sum, r) => sum + r.violations, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Compliance</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(reports.reduce((sum, r) => sum + r.complianceScore, 0) / reports.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by client name..."
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Report
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Violations
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.map((report) => {
              const IconComponent = getReportTypeIcon(report.reportType);
              return (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <IconComponent className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        <div className="text-sm text-gray-500">{report.description}</div>
                        <div className="text-xs text-gray-400">Generated: {formatDate(report.generatedDate)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {report.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplianceColor(report.complianceScore)}`}>
                      {report.complianceScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span className={report.violations > 0 ? 'text-red-600' : 'text-green-600'}>
                        {report.violations}
                      </span>
                      {report.alerts > 0 && (
                        <span className="text-orange-600 text-xs">({report.alerts} alerts)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setSelectedReport(report)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900 mr-3">
                      <DownloadIcon className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <PrinterIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedReport.title}</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Report Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Client:</strong> {selectedReport.clientName}</div>
                    <div><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedReport.status)}`}>
                        {selectedReport.status}
                      </span>
                    </div>
                    <div><strong>Period:</strong> {formatDate(selectedReport.periodStart)} - {formatDate(selectedReport.periodEnd)}</div>
                    <div><strong>Generated:</strong> {formatDate(selectedReport.generatedDate)}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Compliance Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-gray-900">{selectedReport.complianceScore}%</div>
                      <div className="text-xs text-gray-600">Compliance Score</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-red-600">{selectedReport.violations}</div>
                      <div className="text-xs text-gray-600">Violations</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">{selectedReport.alerts}</div>
                      <div className="text-xs text-gray-600">Alerts</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedReport.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceReporting;
