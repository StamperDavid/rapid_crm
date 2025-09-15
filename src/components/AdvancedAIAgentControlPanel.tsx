import React, { useState, useEffect } from 'react';
import {
  ChipIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CogIcon,
  ChartBarIcon,
  UsersIcon,
  CloudIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  SparklesIcon,
  BeakerIcon,
  TerminalIcon,
  DatabaseIcon,
  GlobeAltIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  RefreshIcon,
  ExclamationIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  HeartIcon,
  BoltIcon,
  FireIcon,
  AcademicCapIcon,
  CodeIcon,
  DocumentIcon,
  ServerIcon,
  ChatIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon
} from '@heroicons/react/outline';
import { advancedAgentCreationService } from '../services/ai/AdvancedAgentCreationService';
import { integratedAgentCreationService } from '../services/ai/IntegratedAgentCreationService';
import { aiAgentMarketplace } from '../services/ai/AIAgentMarketplace';
import { aiAgentTrainingService } from '../services/ai/AIAgentTrainingService';
import { aiAgentOrchestrationService } from '../services/ai/AIAgentOrchestrationService';
import AIAgentCreationWizard from './AIAgentCreationWizard';

interface AdvancedAIAgentControlPanelProps {
  className?: string;
}

const AdvancedAIAgentControlPanel: React.FC<AdvancedAIAgentControlPanelProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [agents, setAgents] = useState<any[]>([]);
  const [integratedAgents, setIntegratedAgents] = useState<any[]>([]);
  const [marketplaceAgents, setMarketplaceAgents] = useState<any[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [agentsData, integratedData, marketplaceData, trainingData, workflowsData] = await Promise.all([
        advancedAgentCreationService.getAllAgents(),
        integratedAgentCreationService.getAllIntegratedAgents(),
        aiAgentMarketplace.searchAgents({ limit: 20 }),
        aiAgentTrainingService.getTrainingJobs(),
        aiAgentOrchestrationService.getWorkflows()
      ]);

      setAgents(agentsData);
      setIntegratedAgents(integratedData);
      setMarketplaceAgents(marketplaceData);
      setTrainingJobs(trainingData);
      setWorkflows(workflowsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentCreated = (agent: any) => {
    setIntegratedAgents(prev => [agent, ...prev]);
    setShowCreateModal(false);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'agents', name: 'My Agents', icon: ChipIcon },
    { id: 'marketplace', name: 'Marketplace', icon: GlobeAltIcon },
    { id: 'training', name: 'Training', icon: AcademicCapIcon },
    { id: 'workflows', name: 'Workflows', icon: TerminalIcon },
    { id: 'collaboration', name: 'Collaboration', icon: UsersIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'training': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'paused': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'draft': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'advanced': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      case 'expert': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChipIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Agents</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{agents.length + integratedAgents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlayIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Agents</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {agents.filter(a => a.status === 'active').length + integratedAgents.filter(a => a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Training Jobs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{trainingJobs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TerminalIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Workflows</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{workflows.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Agent
          </button>
          
          <button
            onClick={() => setShowMarketplaceModal(true)}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <GlobeAltIcon className="h-5 w-5 mr-2" />
            Browse Marketplace
          </button>
          
          <button
            onClick={() => setShowTrainingModal(true)}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            Start Training
          </button>
          
          <button
            onClick={() => setShowWorkflowModal(true)}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <TerminalIcon className="h-5 w-5 mr-2" />
            Create Workflow
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {agents.slice(0, 5).map((agent) => (
            <div key={agent.id} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <ChipIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {agent.status} • {agent.type}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                {agent.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAgents = () => {
    const mockAgents = [
      {
        id: '1',
        name: 'USDOT Application Agent',
        description: 'Specialized agent for USDOT application data collection and robotic process automation',
        type: 'onboarding',
        status: 'active',
        capabilities: ['usdot_data_collection', 'compliance_validation', 'document_processing', 'rpa_trigger', 'regulatory_guidance'],
        knowledgeBases: ['usdot_regulations', 'fmcsa_guidelines'],
        rules: ['usdot_compliance', 'data_validation'],
        configuration: {
          model: 'gpt-4',
          temperature: 0.3,
          maxTokens: 3000,
          systemPrompt: 'You are a specialized USDOT Application Agent for Rapid CRM. Your primary role is to collect comprehensive USDOT application data from transportation companies during the onboarding process.',
          responseFormat: 'structured',
          fallbackBehavior: 'escalate_to_human'
        },
        metrics: {
          totalInteractions: 156,
          successRate: 97.4,
          averageResponseTime: 2.3,
          userSatisfaction: 4.8
        },
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z'
      },
      {
        id: '2',
        name: 'USDOT RPA Agent',
        description: 'Robotic Process Automation agent that completes USDOT applications using collected data',
        type: 'custom',
        status: 'active',
        capabilities: ['form_automation', 'data_entry', 'document_upload', 'submission_processing', 'error_handling', 'status_reporting'],
        knowledgeBases: ['usdot_forms', 'rpa_patterns'],
        rules: ['form_validation', 'error_handling'],
        configuration: {
          model: 'gpt-4',
          temperature: 0.1,
          maxTokens: 2500,
          systemPrompt: 'You are a Robotic Process Automation (RPA) Agent specialized in USDOT application completion.',
          responseFormat: 'action',
          fallbackBehavior: 'retry_with_backoff'
        },
        metrics: {
          totalInteractions: 89,
          successRate: 95.5,
          averageResponseTime: 1.8,
          userSatisfaction: 4.6
        },
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-20T14:25:00Z'
      },
      {
        id: '3',
        name: 'Onboarding Assistant',
        description: 'Helps new customers get started with the platform',
        type: 'onboarding',
        status: 'active',
        capabilities: ['account_setup', 'feature_explanation', 'troubleshooting'],
        knowledgeBases: ['platform_guide', 'faq'],
        rules: ['user_guidance', 'troubleshooting'],
        configuration: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt: 'You are a helpful onboarding assistant for Rapid CRM...',
          responseFormat: 'conversational',
          fallbackBehavior: 'escalate_to_human'
        },
        metrics: {
          totalInteractions: 1247,
          successRate: 94.2,
          averageResponseTime: 1.5,
          userSatisfaction: 4.7
        },
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-20T10:30:00Z'
      },
      {
        id: '4',
        name: 'Customer Service Bot',
        description: 'Handles general customer inquiries and support requests',
        type: 'customer_service',
        status: 'active',
        capabilities: ['billing_support', 'technical_help', 'feature_requests'],
        knowledgeBases: ['support_docs', 'billing_info'],
        rules: ['support_escalation', 'billing_guidance'],
        configuration: {
          model: 'gpt-3.5-turbo',
          temperature: 0.5,
          maxTokens: 1500,
          systemPrompt: 'You are a professional customer service representative...',
          responseFormat: 'conversational',
          fallbackBehavior: 'escalate_to_human'
        },
        metrics: {
          totalInteractions: 3421,
          successRate: 89.7,
          averageResponseTime: 2.1,
          userSatisfaction: 4.3
        },
        createdAt: '2024-01-10T14:20:00Z',
        updatedAt: '2024-01-20T11:15:00Z'
      },
      {
        id: '5',
        name: 'Sales Qualification Bot',
        description: 'Qualifies leads and schedules demos for the sales team',
        type: 'sales',
        status: 'training',
        capabilities: ['lead_qualification', 'demo_scheduling', 'objection_handling'],
        knowledgeBases: ['sales_playbook', 'product_info'],
        rules: ['lead_scoring', 'demo_qualification'],
        configuration: {
          model: 'gpt-4',
          temperature: 0.6,
          maxTokens: 1800,
          systemPrompt: 'You are a sales qualification specialist...',
          responseFormat: 'persuasive',
          fallbackBehavior: 'schedule_callback'
        },
        metrics: {
          totalInteractions: 89,
          successRate: 76.4,
          averageResponseTime: 2.8,
          userSatisfaction: 4.1
        },
        createdAt: '2024-01-18T12:00:00Z',
        updatedAt: '2024-01-19T16:45:00Z'
      }
    ];

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
        case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
        case 'training': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
        case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
        default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      }
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'onboarding': return UserIcon;
        case 'customer_service': return ChatIcon;
        case 'sales': return CurrencyDollarIcon;
        case 'support': return CogIcon;
        case 'custom': return ChipIcon;
        default: return ChipIcon;
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My AI Agents</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Build and manage AI agents for your platform
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Create Agent
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <ChipIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockAgents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockAgents.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Training</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockAgents.filter(a => a.status === 'training').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <ChatIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockAgents.reduce((sum, agent) => sum + agent.metrics.totalInteractions, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAgents.map((agent) => {
            const TypeIcon = getTypeIcon(agent.type);
            return (
              <div
                key={agent.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <TypeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Conversations</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {agent.metrics.totalInteractions.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {agent.metrics.successRate}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(agent.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      agent.status === 'active'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30'
                    }`}
                  >
                    {agent.status === 'active' ? (
                      <>
                        <PauseIcon className="h-4 w-4 mr-1 inline" />
                        Pause
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-4 w-4 mr-1 inline" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    className="px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
                    title="Train Agent"
                  >
                    <ChipIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMarketplace = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Agent Marketplace</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search agents..."
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
          />
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
            <option>All Categories</option>
            <option>Customer Service</option>
            <option>Data Analysis</option>
            <option>Automation</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketplaceAgents.map((agent) => (
          <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <ChipIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">by {agent.author}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplexityColor(agent.complexity)}`}>
                {agent.complexity}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{agent.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {agent.rating || 0}/5
                  </span>
                </div>
                <div className="flex items-center">
                  <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {agent.downloadCount || 0}
                  </span>
                </div>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {agent.price === 0 ? 'Free' : `$${agent.price}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <HeartIcon className="h-4 w-4" />
                </button>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTraining = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Training Jobs</h2>
        <button
          onClick={() => setShowTrainingModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Start Training
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Job
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {trainingJobs.map((job) => (
              <tr key={job.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {job.agentId}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {job.trainingMethod}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${job.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {job.progress || 0}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {job.duration ? `${Math.round(job.duration / 60)}m` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  ${job.cost || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {job.status === 'running' && (
                      <button className="text-red-600 hover:text-red-900">
                        <StopIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWorkflows = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Workflows</h2>
        <button
          onClick={() => setShowWorkflowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TerminalIcon className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{workflow.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">v{workflow.version}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                {workflow.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{workflow.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <ChipIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {workflow.nodes?.length || 0} nodes
                  </span>
                </div>
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {workflow.successRate || 0}% success
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <PlayIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Execute
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'agents':
        return renderAgents();
      case 'marketplace':
        return renderMarketplace();
      case 'training':
        return renderTraining();
      case 'workflows':
        return renderWorkflows();
      case 'collaboration':
        return (
          <div className="text-center py-12">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Agent Collaboration</h3>
            <p className="text-gray-500 dark:text-gray-400">Multi-agent collaboration features coming soon</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500 dark:text-gray-400">Advanced analytics and reporting coming soon</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Settings</h3>
            <p className="text-gray-500 dark:text-gray-400">Advanced configuration options coming soon</p>
          </div>
        );
      default:
        return renderOverview();
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <SparklesIcon className="h-8 w-8 text-purple-600 mr-3" />
              Advanced AI Agent Control Panel
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create, manage, and orchestrate powerful AI agents with enterprise-grade capabilities
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <RefreshIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* AI Agent Creation Wizard */}
      <AIAgentCreationWizard
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAgentCreated={handleAgentCreated}
      />
    </div>
  );
};

export default AdvancedAIAgentControlPanel;
