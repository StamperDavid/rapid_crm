import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationIcon,
  DocumentTextIcon,
  TruckIcon,
  UserIcon
} from '@heroicons/react/outline';

interface DVIRReport {
  id: number;
  driver_id: string;
  vehicle_id: string;
  inspection_type: 'pre_trip' | 'post_trip' | 'intermediate';
  inspection_date: string;
  defects?: any;
  is_safe_to_drive: boolean;
  signature?: string;
}

interface DVIRReportingInterfaceProps {
  driverId: string;
  vehicleId: string;
}

interface Defect {
  id: string;
  component: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  location: string;
  requiresRepair: boolean;
}

const DVIRReportingInterface: React.FC<DVIRReportingInterfaceProps> = ({ driverId, vehicleId }) => {
  const [inspectionType, setInspectionType] = useState<'pre_trip' | 'post_trip' | 'intermediate'>('pre_trip');
  const [isSafeToDrive, setIsSafeToDrive] = useState<boolean>(true);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [newDefect, setNewDefect] = useState<Partial<Defect>>({
    component: '',
    description: '',
    severity: 'minor',
    location: '',
    requiresRepair: false
  });
  const [showDefectForm, setShowDefectForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const commonComponents = [
    'Brakes', 'Tires', 'Lights', 'Mirrors', 'Windshield', 'Horn', 'Steering',
    'Suspension', 'Exhaust', 'Fuel System', 'Electrical', 'Body', 'Cargo Securement'
  ];

  const addDefect = () => {
    if (!newDefect.component || !newDefect.description) {
      setError('Please fill in component and description');
      return;
    }

    const defect: Defect = {
      id: Date.now().toString(),
      component: newDefect.component!,
      description: newDefect.description!,
      severity: newDefect.severity!,
      location: newDefect.location!,
      requiresRepair: newDefect.requiresRepair!
    };

    setDefects([...defects, defect]);
    setNewDefect({
      component: '',
      description: '',
      severity: 'minor',
      location: '',
      requiresRepair: false
    });
    setShowDefectForm(false);
    setError('');
  };

  const removeDefect = (defectId: string) => {
    setDefects(defects.filter(d => d.id !== defectId));
  };

  const submitDVIR = async () => {
    if (defects.length > 0 && !isSafeToDrive) {
      setError('Vehicle with defects cannot be marked as safe to drive');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const reportData = {
        driver_id: driverId,
        vehicle_id: vehicleId,
        inspection_type: inspectionType,
        inspection_date: new Date().toISOString(),
        defects: defects,
        is_safe_to_drive: isSafeToDrive
      };

      const response = await fetch('/api/eld/dvir-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        setSuccess('DVIR report submitted successfully');
        setDefects([]);
        setIsSafeToDrive(true);
        setInspectionType('pre_trip');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit DVIR report');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Driver Vehicle Inspection Report</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Driver: {driverId}</span>
          </div>
          <div className="flex items-center space-x-2">
            <TruckIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Vehicle: {vehicleId}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Inspection Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Inspection Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'pre_trip', label: 'Pre-Trip', color: 'bg-blue-100 text-blue-800 border-blue-200' },
            { value: 'post_trip', label: 'Post-Trip', color: 'bg-green-100 text-green-800 border-green-200' },
            { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setInspectionType(type.value as any)}
              className={`p-3 border-2 rounded-lg text-center ${
                inspectionType === type.value
                  ? type.color
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Vehicle Safety Status
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsSafeToDrive(true)}
            className={`p-4 border-2 rounded-lg text-center ${
              isSafeToDrive
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <CheckCircleIcon className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Safe to Drive</div>
            <div className="text-sm opacity-75">No defects found</div>
          </button>
          <button
            onClick={() => setIsSafeToDrive(false)}
            className={`p-4 border-2 rounded-lg text-center ${
              !isSafeToDrive
                ? 'bg-red-100 text-red-800 border-red-200'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <XCircleIcon className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Not Safe to Drive</div>
            <div className="text-sm opacity-75">Defects found</div>
          </button>
        </div>
      </div>

      {/* Defects Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Defects Found</h3>
          <button
            onClick={() => setShowDefectForm(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add Defect
          </button>
        </div>

        {defects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No defects reported</p>
          </div>
        ) : (
          <div className="space-y-3">
            {defects.map((defect) => (
              <div key={defect.id} className={`p-4 border rounded-lg ${getSeverityColor(defect.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{defect.component}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(defect.severity)}`}>
                        {defect.severity.toUpperCase()}
                      </span>
                      {defect.requiresRepair && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          REQUIRES REPAIR
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-1">{defect.description}</p>
                    {defect.location && (
                      <p className="text-xs opacity-75">Location: {defect.location}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeDefect(defect.id)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Defect Form */}
      {showDefectForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Defect</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Component
              </label>
              <select
                value={newDefect.component}
                onChange={(e) => setNewDefect({ ...newDefect, component: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select component</option>
                {commonComponents.map((component) => (
                  <option key={component} value={component}>{component}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={newDefect.severity}
                onChange={(e) => setNewDefect({ ...newDefect, severity: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newDefect.description}
              onChange={(e) => setNewDefect({ ...newDefect, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe the defect in detail"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={newDefect.location}
                onChange={(e) => setNewDefect({ ...newDefect, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Front left, Rear right"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiresRepair"
                checked={newDefect.requiresRepair}
                onChange={(e) => setNewDefect({ ...newDefect, requiresRepair: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requiresRepair" className="ml-2 block text-sm text-gray-700">
                Requires immediate repair
              </label>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={addDefect}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Defect
            </button>
            <button
              onClick={() => setShowDefectForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={submitDVIR}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit DVIR Report'}
        </button>
      </div>
    </div>
  );
};

export default DVIRReportingInterface;
