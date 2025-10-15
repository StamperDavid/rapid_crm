import React, { useState, useEffect } from 'react';
import {
  UploadIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  DownloadIcon,
  RefreshIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline';

interface QualifiedState {
  id?: number;
  state_code: string;
  state_name: string;
  
  // For Hire thresholds
  gvwr_threshold_fh: number;
  gvwr_notes_fh?: string;
  passenger_threshold_fh: number;
  passenger_notes_fh?: string;
  
  // Private Property thresholds
  gvwr_threshold_pp: number;
  gvwr_notes_pp?: string;
  passenger_threshold_pp: number;
  passenger_notes_pp?: string;
  
  requires_intrastate_authority: boolean;
  intrastate_authority_name?: string;
  authority_threshold_gvwr?: number;
  authority_notes?: string;
  additional_requirements?: string;
  state_regulation_reference?: string;
  adopted_federal_49cfr: boolean;
  partial_adoption_notes?: string;
  last_updated: string;
  updated_by?: string;
  verified_date?: string;
  verified_by?: string;
  notes?: string;
}

const QualifiedStatesManagement: React.FC = () => {
  const [qualifiedStates, setQualifiedStates] = useState<QualifiedState[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [editingState, setEditingState] = useState<QualifiedState | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadQualifiedStates();
  }, []);

  const loadQualifiedStates = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/qualified-states');
      if (response.ok) {
        const data = await response.json();
        setQualifiedStates(data.states || []);
      } else {
        setUploadStatus({
          type: 'error',
          message: 'Failed to load qualified states'
        });
      }
    } catch (error) {
      console.error('Error loading qualified states:', error);
      setUploadStatus({
        type: 'error',
        message: 'Error loading qualified states: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setUploadStatus({ type: 'info', message: 'Uploading and processing file...' });

      const response = await fetch('http://localhost:3001/api/qualified-states/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus({
          type: 'success',
          message: `Successfully imported ${result.count} qualified states!`
        });
        loadQualifiedStates();
      } else {
        setUploadStatus({
          type: 'error',
          message: result.error || 'Failed to upload file'
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus({
        type: 'error',
        message: 'Error uploading file: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleSaveState = async (state: QualifiedState) => {
    try {
      const url = state.id 
        ? `http://localhost:3001/api/qualified-states/${state.id}`
        : 'http://localhost:3001/api/qualified-states';
      
      const response = await fetch(url, {
        method: state.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });

      if (response.ok) {
        setUploadStatus({
          type: 'success',
          message: state.id ? 'State updated successfully!' : 'State added successfully!'
        });
        loadQualifiedStates();
        setEditingState(null);
        setShowAddForm(false);
      } else {
        const error = await response.json();
        setUploadStatus({
          type: 'error',
          message: error.error || 'Failed to save state'
        });
      }
    } catch (error) {
      console.error('Error saving state:', error);
      setUploadStatus({
        type: 'error',
        message: 'Error saving state: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    }
  };

  const handleExportData = () => {
    const headers = [
      'State',
      'DOT - Weight',
      'DOT - Passengers', 
      'DOT - Cargo',
      'DQ - Weight',
      'DQ - Passengers',
      'DQ - Cargo',
      'Notes'
    ];

    const rows = qualifiedStates.map(state => [
      state.state_name,
      state.gvwr_threshold_fh || '',
      state.passenger_threshold_fh || '',
      state.gvwr_notes_fh || '',
      state.gvwr_threshold_pp || '',
      state.passenger_threshold_pp || '',
      state.gvwr_notes_pp || '',
      state.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qualified_states_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteState = async (id: number) => {
    if (!confirm('Are you sure you want to delete this state? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/qualified-states/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setUploadStatus({
          type: 'success',
          message: 'State deleted successfully!'
        });
        loadQualifiedStates();
      } else {
        setUploadStatus({
          type: 'error',
          message: 'Failed to delete state'
        });
      }
    } catch (error) {
      console.error('Error deleting state:', error);
      setUploadStatus({
        type: 'error',
        message: 'Error deleting state: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    }
  };


  const filteredStates = qualifiedStates.filter(state =>
    state.state_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    state.state_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Qualified States Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage state-specific GVWR and passenger thresholds for <strong>INTRASTATE</strong> operations
          </p>
          <div className="mt-2 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300"><strong>FOR HIRE</strong> - Commercial operations transporting goods/passengers for compensation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300"><strong>PRIVATE PROPERTY</strong> - Company transporting own goods/employees</span>
            </div>
          </div>
          
          {/* Critical Information Banner */}
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  CRITICAL: For Hire vs Private Property Distinction
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <li><strong className="text-blue-600 dark:text-blue-300">🔵 FOR HIRE:</strong> Transporting goods/passengers for compensation - LOWER thresholds, more strict requirements</li>
                  <li><strong className="text-green-600 dark:text-green-300">🟢 PRIVATE PROPERTY:</strong> Company transporting own goods/employees - HIGHER thresholds, less strict</li>
                  <li className="pt-2 border-t border-blue-300 dark:border-blue-700"><strong>Example:</strong> California For Hire = "Any" (all operations need DOT), Private Property = None (no requirement)</li>
                  <li><strong>Interstate Operations:</strong> ALWAYS use Federal 49 CFR (10,001+ lbs / 8+ passengers) regardless of For Hire/Private Property</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {uploadStatus.type && (
          <div className={`mb-6 p-4 rounded-lg border ${
            uploadStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200' :
            uploadStatus.type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200' :
            'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
          }`}>
            <div className="flex items-center">
              {uploadStatus.type === 'success' && <CheckCircleIcon className="h-5 w-5 mr-2" />}
              {uploadStatus.type === 'error' && <XCircleIcon className="h-5 w-5 mr-2" />}
              {uploadStatus.type === 'info' && <InformationCircleIcon className="h-5 w-5 mr-2" />}
              <span>{uploadStatus.message}</span>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Upload Qualified States Data
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Import from Excel (.xlsx), CSV (.csv), or OpenDocument (.ods) files
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer transition-colors">
                <UploadIcon className="h-4 w-4 mr-2" />
                Upload File
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.ods"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleExportData}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export CSV
              </button>

              <button
                onClick={loadQualifiedStates}
                className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by state code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{filteredStates.length}</strong> of <strong>{qualifiedStates.length}</strong> states
            </div>
          </div>
        </div>

        {/* States Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading qualified states...
            </div>
          ) : filteredStates.length === 0 ? (
            <div className="p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No states match your search' : 'No qualified states data loaded. Upload a file to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      FOR HIRE<br/>GVWR
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      FOR HIRE<br/>Passengers
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      FOR HIRE<br/>Cargo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                      PRIVATE PROP<br/>GVWR
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                      PRIVATE PROP<br/>Passengers
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                      PRIVATE PROP<br/>Cargo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStates.map((state) => (
                    <tr key={state.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {state.state_code}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {state.state_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20">
                        {state.gvwr_threshold_fh === 1 ? 'ANY' : (state.gvwr_threshold_fh || '-')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20">
                        {state.passenger_threshold_fh === 1 ? 'ANY' : (state.passenger_threshold_fh || '-')}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20">
                        {state.gvwr_notes_fh || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20">
                        {state.gvwr_threshold_pp === 1 ? 'ANY' : (state.gvwr_threshold_pp || '-')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20">
                        {state.passenger_threshold_pp === 1 ? 'ANY' : (state.passenger_threshold_pp || '-')}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20">
                        {state.gvwr_notes_pp || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {state.notes || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditingState(state)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          title="Edit state"
                        >
                          <PencilIcon className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => state.id && handleDeleteState(state.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete state"
                        >
                          <TrashIcon className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* File Format Help */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            File Format Requirements
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Your spreadsheet should have data in rows 2-51, with columns A-H:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
              <strong>Column A:</strong> State Name
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-300 dark:border-blue-600">
              <strong className="text-blue-700 dark:text-blue-300">Column B (FOR HIRE):</strong> GVWR Weight
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-300 dark:border-blue-600">
              <strong className="text-blue-700 dark:text-blue-300">Column C (FOR HIRE):</strong> Passengers
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-300 dark:border-blue-600">
              <strong className="text-blue-700 dark:text-blue-300">Column D (FOR HIRE):</strong> Cargo Notes
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-300 dark:border-green-600">
              <strong className="text-green-700 dark:text-green-300">Column E (PRIVATE PROP):</strong> GVWR Weight
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-300 dark:border-green-600">
              <strong className="text-green-700 dark:text-green-300">Column F (PRIVATE PROP):</strong> Passengers
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-300 dark:border-green-600">
              <strong className="text-green-700 dark:text-green-300">Column G (PRIVATE PROP):</strong> Cargo Notes
            </div>
            <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
              <strong>Column H:</strong> General Notes
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            <strong>Row 1:</strong> Headers (optional). <strong>Rows 2-51:</strong> State data (50 states + DC).
            <br/><strong>Format:</strong> Can use "FH: 9 - PP: 16" for different For Hire vs Private Property values, or just "10001" if both are the same.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QualifiedStatesManagement;

