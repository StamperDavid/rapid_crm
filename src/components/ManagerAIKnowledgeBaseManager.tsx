import React, { useState, useEffect } from 'react';
import {
  ArrowUpIcon,
  BookOpenIcon,
  ChipIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/outline';
import { ManagerAIKnowledgeBase, KnowledgeBaseEntry, QualifiedStatesData, ManagerAIAwareness, AgentActivityLog } from '../services/ai/ManagerAIKnowledgeBase';

interface ManagerAIKnowledgeBaseManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManagerAIKnowledgeBaseManager: React.FC<ManagerAIKnowledgeBaseManagerProps> = ({
  isOpen,
  onClose
}) => {
  const [knowledgeBase] = useState(() => ManagerAIKnowledgeBase.getInstance());
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeBaseEntry | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadType, setUploadType] = useState<'qualified_states' | 'service_requirements'>('qualified_states');
  const [awareness, setAwareness] = useState<ManagerAIAwareness | null>(null);
  const [activeTab, setActiveTab] = useState<'knowledge' | 'agents' | 'monitoring'>('knowledge');

  useEffect(() => {
    if (isOpen) {
      loadKnowledgeBase();
      loadAwareness();
      
      // Set up periodic awareness updates
      const interval = setInterval(() => {
        loadAwareness();
      }, 5000); // Update every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadKnowledgeBase = () => {
    const allEntries = knowledgeBase.getAllKnowledgeBaseEntries();
    setEntries(allEntries);
    setStats(knowledgeBase.getKnowledgeBaseStats());
  };

  const loadAwareness = () => {
    const awarenessData = knowledgeBase.getManagerAIAwareness();
    setAwareness(awarenessData);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      let result;
      if (uploadType === 'qualified_states') {
        result = await knowledgeBase.uploadQualifiedStates(file);
      } else {
        result = await knowledgeBase.uploadServiceRequirements(file);
      }

      if (result.success) {
        alert(result.message);
        loadKnowledgeBase();
        setShowUploadForm(false);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveEntry = (entryId: string) => {
    if (window.confirm('Are you sure you want to remove this knowledge base entry?')) {
      knowledgeBase.removeKnowledgeBaseEntry(entryId);
      loadKnowledgeBase();
    }
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'qualified_states':
        return <ChipIcon className="h-5 w-5 text-blue-600" />;
      case 'service_requirements':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'regulatory_documents':
        return <BookOpenIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <ArrowUpIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case 'qualified_states':
        return 'Qualified States';
      case 'service_requirements':
        return 'Service Requirements';
      case 'regulatory_documents':
        return 'Regulatory Documents';
      case 'reference_materials':
        return 'Reference Materials';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <BookOpenIcon className="h-6 w-6 text-blue-600 mr-2" />
              Manager AI Knowledge Base & Agent Awareness
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Comprehensive system monitoring, knowledge distribution, and agent coordination
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'knowledge'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <BookOpenIcon className="h-4 w-4 inline mr-2" />
              Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'agents'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <UsersIcon className="h-4 w-4 inline mr-2" />
              Agent Overview
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monitoring'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <ChartBarIcon className="h-4 w-4 inline mr-2" />
              System Monitoring
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'knowledge' && (
          <>
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <BookOpenIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Entries</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalEntries}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Entries</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeEntries}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Agents</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalAgents}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <ChipIcon className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Qualified States</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.entriesByType.qualified_states || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Upload Knowledge Base Data</h4>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Upload File
            </button>
          </div>

          {showUploadForm && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data Type
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                  >
                    <option value="qualified_states">Qualified States (Excel/CSV)</option>
                    <option value="service_requirements">Service Requirements</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    File Upload
                  </label>
                  <label className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 cursor-pointer">
                    <ArrowUpIcon className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Choose File'}
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              {uploadType === 'qualified_states' && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Excel Format:</strong> StateCode, StateName, GVWRThreshold, PassengerThreshold, SpecialRequirements
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Knowledge Base Entries */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Knowledge Base Entries</h4>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No knowledge base entries found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Upload your first regulatory data file to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border ${
                    entry.isActive 
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getEntryIcon(entry.type)}
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                          {entry.name}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getEntryTypeLabel(entry.type)} • Version {entry.version} • 
                          {entry.applicableAgents.length} agent(s)
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Uploaded {formatDate(entry.uploadedAt)} by {entry.uploadedBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveEntry(entry.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}

        {/* Agent Overview Tab */}
        {activeTab === 'agents' && awareness && (
          <div className="space-y-6">
            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`rounded-lg p-4 ${
                awareness.systemHealth === 'excellent' ? 'bg-green-50 dark:bg-green-900/20' :
                awareness.systemHealth === 'good' ? 'bg-blue-50 dark:bg-blue-900/20' :
                awareness.systemHealth === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                'bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="flex items-center">
                  {awareness.systemHealth === 'excellent' ? (
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  ) : awareness.systemHealth === 'warning' ? (
                    <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                  ) : awareness.systemHealth === 'critical' ? (
                    <XCircleIcon className="h-8 w-8 text-red-600" />
                  ) : (
                    <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Health</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {awareness.systemHealth}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <UsersIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Agents</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{awareness.totalAgents}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Agents</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{awareness.activeAgents}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Interactions</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{awareness.totalInteractions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Details */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Agent Status & Performance</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {knowledgeBase.getAllAgentsWithStatus().map((agent) => (
                  <div key={agent.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          agent.currentStatus === 'active' ? 'bg-green-500' :
                          agent.currentStatus === 'idle' ? 'bg-yellow-500' :
                          agent.currentStatus === 'training' ? 'bg-blue-500' :
                          agent.currentStatus === 'error' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`}></div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{agent.name}</h5>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({agent.type})</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agent.currentStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        agent.currentStatus === 'idle' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        agent.currentStatus === 'training' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        agent.currentStatus === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }`}>
                        {agent.currentStatus}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Interactions:</span>
                        <span className="text-gray-900 dark:text-white">{agent.totalInteractions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Success Rate:</span>
                        <span className="text-gray-900 dark:text-white">
                          {(agent.successRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Last Activity:</span>
                        <span className="text-gray-900 dark:text-white">
                          {agent.lastActivity ? new Date(agent.lastActivity).toLocaleString() : 'Never'}
                        </span>
                      </div>
                    </div>
                    
                    {agent.persona && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Persona:</p>
                        <p className="text-sm text-gray-900 dark:text-white">{agent.persona}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Monitoring Tab */}
        {activeTab === 'monitoring' && awareness && (
          <div className="space-y-6">
            {/* Recent Activities */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Agent Activities</h4>
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="max-h-96 overflow-y-auto">
                  {awareness.recentActivities.length === 0 ? (
                    <div className="p-8 text-center">
                      <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-600">
                      {awareness.recentActivities.slice(-20).reverse().map((activity, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                activity.success ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {activity.agentName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {activity.activity}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(activity.timestamp).toLocaleTimeString()}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(activity.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts */}
            {awareness.alerts.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Alerts</h4>
                <div className="space-y-3">
                  {awareness.alerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === 'critical' ? 'bg-red-50 border-red-400 dark:bg-red-900/20' :
                      alert.severity === 'high' ? 'bg-orange-50 border-orange-400 dark:bg-orange-900/20' :
                      alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20' :
                      'bg-blue-50 border-blue-400 dark:bg-blue-900/20'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {alert.severity === 'critical' ? (
                            <XCircleIcon className="h-5 w-5 text-red-600" />
                          ) : alert.severity === 'high' ? (
                            <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
                          ) : (
                            <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {alert.type} • {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Entry Details Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedEntry.name}
                </h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Applicable Agents</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.applicableAgents.map((agentId) => (
                      <span
                        key={agentId}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      >
                        {agentId}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedEntry.type === 'qualified_states' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Qualified States Data</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <pre className="text-xs text-gray-600 dark:text-gray-400">
                        {JSON.stringify((selectedEntry.data as QualifiedStatesData).states.slice(0, 5), null, 2)}
                        {(selectedEntry.data as QualifiedStatesData).states.length > 5 && (
                          <div className="mt-2 text-gray-500">
                            ... and {(selectedEntry.data as QualifiedStatesData).states.length - 5} more states
                          </div>
                        )}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{getEntryTypeLabel(selectedEntry.type)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Version:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedEntry.version}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <span className={`ml-2 ${selectedEntry.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedEntry.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Uploaded:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{formatDate(selectedEntry.uploadedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerAIKnowledgeBaseManager;
