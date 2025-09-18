import React, { useState, useEffect } from 'react';
import {
  ClipboardCheckIcon,
  ExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  UserIcon,
  CalendarIcon,
  MapIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/outline';

interface DVIRReport {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleNumber: string;
  inspectionType: 'pre_trip' | 'post_trip' | 'intermediate';
  inspectionDate: string;
  location: string;
  odometerReading: number;
  defects: DVIRDefect[];
  status: 'pending' | 'approved' | 'rejected' | 'requires_repair';
  remarks: string;
  certifiedBy: string;
  certifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface DVIRDefect {
  id: string;
  category: 'brakes' | 'lights' | 'tires' | 'engine' | 'transmission' | 'safety_equipment' | 'other';
  description: string;
  severity: 'minor' | 'major' | 'critical';
  isRepaired: boolean;
  repairDate?: string;
  repairNotes?: string;
  repairCost?: number;
  requiresOutOfService: boolean;
}

interface Vehicle {
  id: string;
  number: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  lastInspection: string;
  nextInspectionDue: string;
  totalDefects: number;
  criticalDefects: number;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  totalInspections: number;
  pendingInspections: number;
  lastInspection: string;
}

const DVIRManagement: React.FC = () => {
  const [reports, setReports] = useState<DVIRReport[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showAddReport, setShowAddReport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'vehicles' | 'defects'>('reports');

  useEffect(() => {
    fetchDVIRData();
  }, []);

  const fetchDVIRData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, these would be API calls
      setVehicles([
        {
          id: '1',
          number: 'TRK-001',
          make: 'Freightliner',
          model: 'Cascadia',
          year: 2022,
          vin: '1FUJGBDV8NLBT1234',
          lastInspection: '2024-01-15T06:00:00Z',
          nextInspectionDue: '2024-01-16T06:00:00Z',
          totalDefects: 2,
          criticalDefects: 0
        },
        {
          id: '2',
          number: 'TRK-002',
          make: 'Peterbilt',
          model: '579',
          year: 2021,
          vin: '1NP5DB0X8MN567890',
          lastInspection: '2024-01-14T18:00:00Z',
          nextInspectionDue: '2024-01-15T18:00:00Z',
          totalDefects: 1,
          criticalDefects: 1
        }
      ]);

      setDrivers([
        {
          id: '1',
          name: 'John Smith',
          licenseNumber: 'CDL123456',
          totalInspections: 45,
          pendingInspections: 1,
          lastInspection: '2024-01-15T06:00:00Z'
        },
        {
          id: '2',
          name: 'Mike Johnson',
          licenseNumber: 'CDL789012',
          totalInspections: 38,
          pendingInspections: 0,
          lastInspection: '2024-01-14T18:00:00Z'
        }
      ]);

      setReports([
        {
          id: '1',
          driverId: '1',
          driverName: 'John Smith',
          vehicleId: '1',
          vehicleNumber: 'TRK-001',
          inspectionType: 'pre_trip',
          inspectionDate: '2024-01-15T06:00:00Z',
          location: 'Denver, CO',
          odometerReading: 125430,
          defects: [
            {
              id: 'd1',
              category: 'lights',
              description: 'Left headlight dim',
              severity: 'minor',
              isRepaired: false,
              requiresOutOfService: false
            },
            {
              id: 'd2',
              category: 'tires',
              description: 'Tire pressure low on rear axle',
              severity: 'minor',
              isRepaired: false,
              requiresOutOfService: false
            }
          ],
          status: 'pending',
          remarks: 'Minor issues noted, safe to drive',
          certifiedBy: 'John Smith',
          certifiedAt: '2024-01-15T06:15:00Z',
          createdAt: '2024-01-15T06:00:00Z',
          updatedAt: '2024-01-15T06:15:00Z'
        },
        {
          id: '2',
          driverId: '2',
          driverName: 'Mike Johnson',
          vehicleId: '2',
          vehicleNumber: 'TRK-002',
          inspectionType: 'post_trip',
          inspectionDate: '2024-01-14T18:00:00Z',
          location: 'Phoenix, AZ',
          odometerReading: 98765,
          defects: [
            {
              id: 'd3',
              category: 'brakes',
              description: 'Brake pad wear indicator showing',
              severity: 'critical',
              isRepaired: false,
              requiresOutOfService: true
            }
          ],
          status: 'requires_repair',
          remarks: 'CRITICAL: Vehicle requires immediate repair before next trip',
          certifiedBy: 'Mike Johnson',
          certifiedAt: '2024-01-14T18:30:00Z',
          createdAt: '2024-01-14T18:00:00Z',
          updatedAt: '2024-01-14T18:30:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching DVIR data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'requires_repair': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'text-blue-600 bg-blue-100';
      case 'major': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInspectionTypeColor = (type: string) => {
    switch (type) {
      case 'pre_trip': return 'text-green-600 bg-green-100';
      case 'post_trip': return 'text-blue-600 bg-blue-100';
      case 'intermediate': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTotalDefects = () => {
    return reports.reduce((total, report) => total + report.defects.length, 0);
  };

  const getCriticalDefects = () => {
    return reports.reduce((total, report) => 
      total + report.defects.filter(defect => defect.severity === 'critical').length, 0);
  };

  const getPendingReports = () => {
    return reports.filter(report => report.status === 'pending').length;
  };

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
          <h2 className="text-2xl font-bold text-gray-900">DVIR Management</h2>
          <p className="text-gray-600">Driver Vehicle Inspection Reports and defect tracking</p>
        </div>
        <button
          onClick={() => setShowAddReport(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Inspection</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClipboardCheckIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ExclamationIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-2xl font-bold text-gray-900">{getPendingReports()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CogIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Defects</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalDefects()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Defects</p>
              <p className="text-2xl font-bold text-gray-900">{getCriticalDefects()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'reports', name: 'Inspection Reports', count: reports.length },
            { id: 'vehicles', name: 'Vehicle Status', count: vehicles.length },
            { id: 'defects', name: 'Defect Tracking', count: getTotalDefects() }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Inspection Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Drivers</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.number}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="requires_repair">Requires Repair</option>
            </select>
          </div>

          {/* Reports Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver/Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspection Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Defects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.driverName}</div>
                        <div className="text-sm text-gray-500">{report.vehicleNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInspectionTypeColor(report.inspectionType)}`}>
                        {report.inspectionType.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDateTime(report.inspectionDate)}</div>
                      <div className="text-sm text-gray-500">{report.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.defects.length} defect(s)</div>
                      {report.defects.some(d => d.severity === 'critical') && (
                        <div className="text-xs text-red-600">Critical defects present</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vehicle Status Tab */}
      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{vehicle.number}</h3>
                  <p className="text-sm text-gray-500">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${vehicle.criticalDefects > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {vehicle.criticalDefects > 0 ? 'OUT OF SERVICE' : 'OPERATIONAL'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Defects:</span>
                  <span className="text-sm font-medium">{vehicle.totalDefects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Critical Defects:</span>
                  <span className={`text-sm font-medium ${vehicle.criticalDefects > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {vehicle.criticalDefects}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600">
                    Last Inspection: {formatDateTime(vehicle.lastInspection)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Next Due: {formatDateTime(vehicle.nextInspectionDue)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Defect Tracking Tab */}
      {activeTab === 'defects' && (
        <div className="space-y-4">
          {reports.filter(report => report.defects.length > 0).map((report) => (
            <div key={report.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{report.driverName} - {report.vehicleNumber}</h3>
                  <p className="text-sm text-gray-500">{formatDateTime(report.inspectionDate)} • {report.inspectionType.replace('_', ' ')}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                  {report.defects.length} DEFECT(S)
                </span>
              </div>
              
              <div className="space-y-3">
                {report.defects.map((defect) => (
                  <div key={defect.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CogIcon className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{defect.description}</div>
                        <div className="text-xs text-gray-500">{defect.category.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(defect.severity)}`}>
                        {defect.severity.toUpperCase()}
                      </span>
                      {defect.requiresOutOfService && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-red-600 bg-red-100">
                          OUT OF SERVICE
                        </span>
                      )}
                      {defect.isRepaired ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DVIRManagement;
