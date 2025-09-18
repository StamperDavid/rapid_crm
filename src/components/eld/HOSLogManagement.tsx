import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  TruckIcon,
  UserIcon,
  ExclamationIcon,
  CheckCircleIcon,
  PencilIcon,
  PlusIcon,
  CalendarIcon,
  MapIcon
} from '@heroicons/react/outline';

interface HOSLogEntry {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleNumber: string;
  logType: 'driving' | 'on_duty' | 'off_duty' | 'sleeper_berth';
  startTime: string;
  endTime: string;
  location: string;
  odometerReading: number;
  remarks: string;
  status: 'certified' | 'pending' | 'violation';
  violations: HOSViolation[];
  createdAt: string;
  updatedAt: string;
}

interface HOSViolation {
  id: string;
  violationType: '11_hour_rule' | '14_hour_rule' | '30_minute_break' | '34_hour_restart' | 'sleeper_berth';
  description: string;
  severity: 'warning' | 'violation' | 'critical';
  timeRemaining: number; // minutes
  isResolved: boolean;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  currentStatus: 'driving' | 'on_duty' | 'off_duty' | 'sleeper_berth';
  hoursRemaining: {
    driving: number;
    onDuty: number;
    available: number;
  };
  lastLocation: string;
  lastUpdate: string;
}

interface Vehicle {
  id: string;
  number: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  currentDriver?: string;
  location: string;
  odometer: number;
}

const HOSLogManagement: React.FC = () => {
  const [logs, setLogs] = useState<HOSLogEntry[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [showAddLog, setShowAddLog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'drivers' | 'violations'>('logs');

  useEffect(() => {
    fetchHOSData();
  }, []);

  const fetchHOSData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, these would be API calls
      setDrivers([
        {
          id: '1',
          name: 'John Smith',
          licenseNumber: 'CDL123456',
          currentStatus: 'driving',
          hoursRemaining: { driving: 8.5, onDuty: 12.5, available: 2.5 },
          lastLocation: 'Denver, CO',
          lastUpdate: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'Mike Johnson',
          licenseNumber: 'CDL789012',
          currentStatus: 'off_duty',
          hoursRemaining: { driving: 11, onDuty: 14, available: 0 },
          lastLocation: 'Phoenix, AZ',
          lastUpdate: '2024-01-15T08:00:00Z'
        }
      ]);

      setVehicles([
        {
          id: '1',
          number: 'TRK-001',
          make: 'Freightliner',
          model: 'Cascadia',
          year: 2022,
          vin: '1FUJGBDV8NLBT1234',
          currentDriver: '1',
          location: 'Denver, CO',
          odometer: 125430
        },
        {
          id: '2',
          number: 'TRK-002',
          make: 'Peterbilt',
          model: '579',
          year: 2021,
          vin: '1NP5DB0X8MN567890',
          location: 'Phoenix, AZ',
          odometer: 98765
        }
      ]);

      setLogs([
        {
          id: '1',
          driverId: '1',
          driverName: 'John Smith',
          vehicleId: '1',
          vehicleNumber: 'TRK-001',
          logType: 'driving',
          startTime: '2024-01-15T06:00:00Z',
          endTime: '2024-01-15T10:30:00Z',
          location: 'Denver, CO',
          odometerReading: 125430,
          remarks: 'Regular route delivery',
          status: 'certified',
          violations: [],
          createdAt: '2024-01-15T06:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          driverId: '2',
          driverName: 'Mike Johnson',
          vehicleId: '2',
          vehicleNumber: 'TRK-002',
          logType: 'off_duty',
          startTime: '2024-01-15T08:00:00Z',
          endTime: '2024-01-15T20:00:00Z',
          location: 'Phoenix, AZ',
          odometerReading: 98765,
          remarks: '10-hour break',
          status: 'violation',
          violations: [
            {
              id: 'v1',
              violationType: '11_hour_rule',
              description: 'Approaching 11-hour driving limit',
              severity: 'warning',
              timeRemaining: 30,
              isResolved: false
            }
          ],
          createdAt: '2024-01-15T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching HOS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'certified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'violation': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLogTypeColor = (logType: string) => {
    switch (logType) {
      case 'driving': return 'text-blue-600 bg-blue-100';
      case 'on_duty': return 'text-purple-600 bg-purple-100';
      case 'off_duty': return 'text-gray-600 bg-gray-100';
      case 'sleeper_berth': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getViolationColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'violation': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
          <h2 className="text-2xl font-bold text-gray-900">HOS Log Management</h2>
          <p className="text-gray-600">Manage driver hours of service and compliance</p>
        </div>
        <button
          onClick={() => setShowAddLog(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Log Entry</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'logs', name: 'Log Entries', count: logs.length },
            { id: 'drivers', name: 'Driver Status', count: drivers.length },
            { id: 'violations', name: 'Violations', count: logs.reduce((acc, log) => acc + log.violations.length, 0) }
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

      {/* Log Entries Tab */}
      {activeTab === 'logs' && (
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
          </div>

          {/* Log Entries Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver/Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Log Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
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
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.driverName}</div>
                        <div className="text-sm text-gray-500">{log.vehicleNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLogTypeColor(log.logType)}`}>
                        {log.logType.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(log.startTime)} - {formatTime(log.endTime)}
                      </div>
                      <div className="text-sm text-gray-500">{formatDate(log.startTime)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapIcon className="h-4 w-4 mr-1" />
                        {log.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                        {log.status.toUpperCase()}
                      </span>
                      {log.violations.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {log.violations.length} violation(s)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Driver Status Tab */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{driver.name}</h3>
                  <p className="text-sm text-gray-500">CDL: {driver.licenseNumber}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLogTypeColor(driver.currentStatus)}`}>
                  {driver.currentStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Driving Hours:</span>
                  <span className="text-sm font-medium">{driver.hoursRemaining.driving}h remaining</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">On-Duty Hours:</span>
                  <span className="text-sm font-medium">{driver.hoursRemaining.onDuty}h remaining</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Available Hours:</span>
                  <span className="text-sm font-medium">{driver.hoursRemaining.available}h remaining</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapIcon className="h-4 w-4 mr-1" />
                    {driver.lastLocation}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last update: {formatTime(driver.lastUpdate)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div className="space-y-4">
          {logs.filter(log => log.violations.length > 0).map((log) => (
            <div key={log.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{log.driverName}</h3>
                  <p className="text-sm text-gray-500">{log.vehicleNumber} • {formatDate(log.startTime)}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                  {log.violations.length} VIOLATION(S)
                </span>
              </div>
              
              <div className="space-y-3">
                {log.violations.map((violation) => (
                  <div key={violation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ExclamationIcon className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{violation.description}</div>
                        <div className="text-xs text-gray-500">{violation.violationType.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getViolationColor(violation.severity)}`}>
                        {violation.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">{violation.timeRemaining}m remaining</span>
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

export default HOSLogManagement;
