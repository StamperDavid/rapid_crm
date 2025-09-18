import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon
} from '@heroicons/react/outline';

interface HOSLog {
  id: number;
  driver_id: string;
  vehicle_id?: string;
  log_type: 'driving' | 'on_duty' | 'off_duty' | 'sleeper_berth';
  start_time: string;
  end_time?: string;
  location?: string;
  odometer_reading?: number;
  is_edited: boolean;
  edit_reason?: string;
}

interface HOSLoggingInterfaceProps {
  driverId: string;
  vehicleId?: string;
}

const HOSLoggingInterface: React.FC<HOSLoggingInterfaceProps> = ({ driverId, vehicleId }) => {
  const [currentLog, setCurrentLog] = useState<HOSLog | null>(null);
  const [currentStatus, setCurrentStatus] = useState<'driving' | 'on_duty' | 'off_duty' | 'sleeper_berth'>('off_duty');
  const [location, setLocation] = useState<string>('');
  const [odometerReading, setOdometerReading] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCurrentStatus();
    getCurrentLocation();
  }, [driverId]);

  const fetchCurrentStatus = async () => {
    try {
      const response = await fetch(`/api/eld/hos-logs?driverId=${driverId}&limit=1`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const latestLog = data.data[0];
          setCurrentLog(latestLog);
          if (!latestLog.end_time) {
            setCurrentStatus(latestLog.log_type);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching current status:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation('Location unavailable');
        }
      );
    } else {
      setLocation('Location unavailable');
    }
  };

  const startLog = async (logType: 'driving' | 'on_duty' | 'sleeper_berth') => {
    if (currentLog && !currentLog.end_time) {
      setError('Please end current log before starting a new one');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const logData = {
        driver_id: driverId,
        vehicle_id: vehicleId,
        log_type: logType,
        start_time: new Date().toISOString(),
        location: location,
        odometer_reading: odometerReading
      };

      const response = await fetch('/api/eld/hos-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentLog(result.data);
        setCurrentStatus(logType);
        await fetchCurrentStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to start log');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const endLog = async () => {
    if (!currentLog || currentLog.end_time) {
      setError('No active log to end');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/eld/hos-logs/${currentLog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          end_time: new Date().toISOString(),
          location: location,
          odometer_reading: odometerReading
        }),
      });

      if (response.ok) {
        setCurrentLog(null);
        setCurrentStatus('off_duty');
        await fetchCurrentStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to end log');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'driving': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on_duty': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'off_duty': return 'bg-green-100 text-green-800 border-green-200';
      case 'sleeper_berth': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Hours of Service Logging</h2>
        <div className="flex items-center space-x-2">
          <TruckIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">Driver: {driverId}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Current Status */}
      <div className="mb-6">
        <div className={`p-4 border-2 rounded-lg ${getStatusColor(currentStatus)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Current Status</h3>
              <p className="text-sm opacity-75">
                {currentStatus.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            {currentLog && !currentLog.end_time && (
              <div className="text-right">
                <p className="text-sm opacity-75">Duration</p>
                <p className="text-lg font-bold">
                  {formatDuration(currentLog.start_time)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location and Odometer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPinIcon className="h-4 w-4 inline mr-1" />
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter location or use GPS"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TruckIcon className="h-4 w-4 inline mr-1" />
            Odometer Reading
          </label>
          <input
            type="number"
            value={odometerReading}
            onChange={(e) => setOdometerReading(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter odometer reading"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {!currentLog || currentLog.end_time ? (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Start New Log</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => startLog('driving')}
                disabled={loading}
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                Start Driving
              </button>
              <button
                onClick={() => startLog('on_duty')}
                disabled={loading}
                className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ClockIcon className="h-5 w-5 mr-2" />
                On Duty
              </button>
              <button
                onClick={() => startLog('sleeper_berth')}
                disabled={loading}
                className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PauseIcon className="h-5 w-5 mr-2" />
                Sleeper Berth
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">End Current Log</h3>
            <button
              onClick={endLog}
              disabled={loading}
              className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <StopIcon className="h-5 w-5 mr-2" />
              End {currentLog.log_type.replace('_', ' ')} Log
            </button>
          </div>
        )}
      </div>

      {/* Recent Logs */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Logs</h3>
        <div className="space-y-2">
          {/* This would be populated with recent logs */}
          <div className="text-sm text-gray-500 text-center py-4">
            Recent logs will appear here
          </div>
        </div>
      </div>
    </div>
  );
};

export default HOSLoggingInterface;
