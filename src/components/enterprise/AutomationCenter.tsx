import React, { useState, useEffect } from 'react';
import {
  ChipIcon,
  LightningBoltIcon,
  RefreshIcon,
  CloudIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  LinkIcon,
  ServerIcon,
  DatabaseIcon,
  GlobeAltIcon
} from '@heroicons/react/outline';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'error' | 'completed' | 'draft';
  lastRun: string;
  nextRun: string;
  successRate: number;
  avgRuntime: string;
  triggers: string[];
  actions: string[];
  created: string;
  modified: string;
}

interface Trigger {
  id: string;
  name: string;
  type: 'schedule' | 'event' | 'webhook' | 'condition';
  status: 'active' | 'inactive' | 'error';
  description: string;
  lastTriggered: string;
  nextTrigger: string;
  conditions: string[];
}

interface Process {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: string;
  endTime?: string;
  duration?: string;
  progress: number;
  steps: ProcessStep[];
}

interface ProcessStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: string;
  error?: string;
}

interface Integration {
  id: string;
  name: string;
  type: 'api' | 'database' | 'webhook' | 'email' | 'file';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  health: number;
  endpoint: string;
  description: string;
}

const AutomationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'workflows' | 'triggers' | 'processes' | 'integrations'>('overview');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);

  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    try {
      // Mock data - in real implementation, this would come from API
      const workflowsData: Workflow[] = [
        {
          id: '1',
          name: 'Client Onboarding',
          description: 'Automated client onboarding process with document generation and notifications',
          status: 'active',
          lastRun: '2 minutes ago',
          nextRun: 'In 1 hour',
          successRate: 98.5,
          avgRuntime: '2.3s',
          triggers: ['New Client Registration', 'Manual Trigger'],
          actions: ['Generate Welcome Email', 'Create Client Portal', 'Assign Account Manager'],
          created: '2024-01-10',
          modified: '2024-01-15'
        },
        {
          id: '2',
          name: 'Compliance Reporting',
          description: 'Automated compliance report generation and distribution',
          status: 'active',
          lastRun: '1 hour ago',
          nextRun: 'Daily at 6 AM',
          successRate: 100,
          avgRuntime: '45.2s',
          triggers: ['Daily Schedule', 'Compliance Alert'],
          actions: ['Generate Reports', 'Email Distribution', 'Archive Documents'],
          created: '2024-01-08',
          modified: '2024-01-14'
        },
        {
          id: '3',
          name: 'Content Distribution',
          description: 'Multi-channel content distribution workflow',
          status: 'paused',
          lastRun: '3 hours ago',
          nextRun: 'Manual',
          successRate: 95.2,
          avgRuntime: '12.8s',
          triggers: ['Content Published', 'Schedule Trigger'],
          actions: ['Social Media Post', 'Email Newsletter', 'Website Update'],
          created: '2024-01-12',
          modified: '2024-01-16'
        },
        {
          id: '4',
          name: 'Invoice Generation',
          description: 'Automated invoice generation and payment processing',
          status: 'error',
          lastRun: 'Failed 2 hours ago',
          nextRun: 'Retry in 30 min',
          successRate: 87.3,
          avgRuntime: '8.1s',
          triggers: ['Service Completion', 'Monthly Billing'],
          actions: ['Generate Invoice', 'Send to Client', 'Update Accounting'],
          created: '2024-01-05',
          modified: '2024-01-16'
        }
      ];

      const triggersData: Trigger[] = [
        {
          id: '1',
          name: 'New Client Registration',
          type: 'event',
          status: 'active',
          description: 'Triggers when a new client registers',
          lastTriggered: '5 minutes ago',
          nextTrigger: 'Event-based',
          conditions: ['Registration Complete', 'Email Verified']
        },
        {
          id: '2',
          name: 'Daily Schedule',
          type: 'schedule',
          status: 'active',
          description: 'Daily trigger at 6:00 AM',
          lastTriggered: '1 hour ago',
          nextTrigger: 'Tomorrow 6:00 AM',
          conditions: ['Weekday', 'Business Hours']
        },
        {
          id: '3',
          name: 'Compliance Alert',
          type: 'condition',
          status: 'active',
          description: 'Triggers when compliance score drops below threshold',
          lastTriggered: 'Never',
          nextTrigger: 'Condition-based',
          conditions: ['Score < 90%', 'Alert Level = High']
        }
      ];

      const processesData: Process[] = [
        {
          id: '1',
          workflowId: '1',
          workflowName: 'Client Onboarding',
          status: 'running',
          startTime: '2 minutes ago',
          progress: 75,
          steps: [
            { id: '1', name: 'Generate Welcome Email', status: 'completed', startTime: '2 min ago', endTime: '2 min ago', duration: '0.5s' },
            { id: '2', name: 'Create Client Portal', status: 'running', startTime: '1 min ago' },
            { id: '3', name: 'Assign Account Manager', status: 'pending' }
          ]
        },
        {
          id: '2',
          workflowId: '2',
          workflowName: 'Compliance Reporting',
          status: 'completed',
          startTime: '1 hour ago',
          endTime: '1 hour ago',
          duration: '45.2s',
          progress: 100,
          steps: [
            { id: '1', name: 'Generate Reports', status: 'completed', startTime: '1h ago', endTime: '1h ago', duration: '30s' },
            { id: '2', name: 'Email Distribution', status: 'completed', startTime: '1h ago', endTime: '1h ago', duration: '10s' },
            { id: '3', name: 'Archive Documents', status: 'completed', startTime: '1h ago', endTime: '1h ago', duration: '5.2s' }
          ]
        }
      ];

      const integrationsData: Integration[] = [
        {
          id: '1',
          name: 'QuickBooks API',
          type: 'api',
          status: 'connected',
          lastSync: '5 minutes ago',
          health: 99.8,
          endpoint: 'https://api.quickbooks.com',
          description: 'Accounting system integration'
        },
        {
          id: '2',
          name: 'Email Service',
          type: 'email',
          status: 'connected',
          lastSync: '2 minutes ago',
          health: 100,
          endpoint: 'smtp.company.com',
          description: 'Email delivery service'
        },
        {
          id: '3',
          name: 'Client Database',
          type: 'database',
          status: 'connected',
          lastSync: '1 minute ago',
          health: 99.9,
          endpoint: 'rapid_crm.db',
          description: 'Primary client database'
        },
        {
          id: '4',
          name: 'Social Media API',
          type: 'api',
          status: 'error',
          lastSync: '2 hours ago',
          health: 45.2,
          endpoint: 'https://api.social.com',
          description: 'Social media posting service'
        }
      ];

      setWorkflows(workflowsData);
      setTriggers(triggersData);
      setProcesses(processesData);
      setIntegrations(integrationsData);
    } catch (error) {
      console.error('Error loading automation data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'running':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'paused':
      case 'inactive':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'failed':
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      case 'draft':
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'paused':
      case 'inactive':
        return <PauseIcon className="h-4 w-4" />;
      case 'error':
      case 'failed':
      case 'disconnected':
        return <XCircleIcon className="h-4 w-4" />;
      case 'running':
        return <PlayIcon className="h-4 w-4" />;
      case 'draft':
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api':
        return <GlobeAltIcon className="h-5 w-5 text-blue-500" />;
      case 'database':
        return <DatabaseIcon className="h-5 w-5 text-green-500" />;
      case 'webhook':
        return <LinkIcon className="h-5 w-5 text-purple-500" />;
      case 'email':
        return <ServerIcon className="h-5 w-5 text-orange-500" />;
      case 'file':
        return <CogIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <CogIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Automation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.filter(w => w.status === 'active').length}
              </p>
            </div>
            <ChipIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Running Processes</p>
              <p className="text-2xl font-bold text-green-600">
                {processes.filter(p => p.status === 'running').length}
              </p>
            </div>
            <PlayIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length).toFixed(1)}%
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Integrations</p>
              <p className="text-2xl font-bold text-orange-600">
                {integrations.filter(i => i.status === 'connected').length}/{integrations.length}
              </p>
            </div>
            <CloudIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Running Processes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Running Processes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {processes.filter(p => p.status === 'running').map((process) => (
                <div key={process.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{process.workflowName}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(process.status)}`}>
                      {process.status}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{process.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${process.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Started: {process.startTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Integration Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(integration.type)}
                    <div>
                      <p className="font-medium text-gray-900">{integration.name}</p>
                      <p className="text-sm text-gray-500">{integration.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                      {integration.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{integration.health}% health</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkflows = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Workflow Builder</h2>
        <button
          onClick={() => setShowWorkflowBuilder(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                  {workflow.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium text-gray-600">Success Rate:</span>
                  <p className="text-gray-900">{workflow.successRate}%</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Avg Runtime:</span>
                  <p className="text-gray-900">{workflow.avgRuntime}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Last Run:</span>
                  <p className="text-gray-900">{workflow.lastRun}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Next Run:</span>
                  <p className="text-gray-900">{workflow.nextRun}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center space-x-1">
                  <EyeIcon className="h-4 w-4" />
                  <span>View</span>
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 flex items-center justify-center space-x-1">
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTriggers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Trigger Manager</h2>
        <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Add Trigger</span>
        </button>
      </div>

      <div className="space-y-4">
        {triggers.map((trigger) => (
          <div key={trigger.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <LightningBoltIcon className="h-6 w-6 text-yellow-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{trigger.name}</h3>
                  <p className="text-sm text-gray-600">{trigger.description}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(trigger.status)}`}>
                {trigger.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Type:</span>
                <p className="text-gray-900 capitalize">{trigger.type}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Triggered:</span>
                <p className="text-gray-900">{trigger.lastTriggered}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Next Trigger:</span>
                <p className="text-gray-900">{trigger.nextTrigger}</p>
              </div>
            </div>

            <div className="mt-4">
              <span className="font-medium text-gray-600 text-sm">Conditions:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {trigger.conditions.map((condition, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProcesses = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Process Tracker</h2>
      
      <div className="space-y-4">
        {processes.map((process) => (
          <div key={process.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{process.workflowName}</h3>
                <p className="text-sm text-gray-600">Process ID: {process.id}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(process.status)}`}>
                {process.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
              <div>
                <span className="font-medium text-gray-600">Start Time:</span>
                <p className="text-gray-900">{process.startTime}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Duration:</span>
                <p className="text-gray-900">{process.duration || 'Running...'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Progress:</span>
                <p className="text-gray-900">{process.progress}%</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{process.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    process.status === 'completed' ? 'bg-green-500' :
                    process.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${process.progress}%` }}
                />
              </div>
            </div>

            <div>
              <span className="font-medium text-gray-600 text-sm">Steps:</span>
              <div className="space-y-2 mt-2">
                {process.steps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(step.status)}
                      <span className="text-sm font-medium text-gray-900">{step.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {step.duration && (
                        <span className="text-xs text-gray-500">{step.duration}</span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(step.status)}`}>
                        {step.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Integration Monitor</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getTypeIcon(integration.type)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                  <p className="text-sm text-gray-600">{integration.description}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(integration.status)}`}>
                {integration.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Health Score</span>
                <span className={`font-semibold ${
                  integration.health >= 95 ? 'text-green-600' :
                  integration.health >= 80 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {integration.health}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    integration.health >= 95 ? 'bg-green-500' :
                    integration.health >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${integration.health}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Endpoint:</span> {integration.endpoint}</p>
                <p><span className="font-medium">Last Sync:</span> {integration.lastSync}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'workflows', name: 'Workflow Builder' },
              { id: 'triggers', name: 'Trigger Manager' },
              { id: 'processes', name: 'Process Tracker' },
              { id: 'integrations', name: 'Integration Monitor' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'workflows' && renderWorkflows()}
      {activeTab === 'triggers' && renderTriggers()}
      {activeTab === 'processes' && renderProcesses()}
      {activeTab === 'integrations' && renderIntegrations()}
    </div>
  );
};

export default AutomationCenter;

