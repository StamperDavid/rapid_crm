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
  UserIcon,
  CloudIcon,
  ShieldCheckIcon,
  LightBulbIcon,
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
  LightningBoltIcon,
  SpeakerphoneIcon,
  DocumentIcon,
  ChatIcon,
  AcademicCapIcon,
  TrendingUpIcon,
  CodeIcon,
  ServerIcon,
  TrendingDownIcon,
  MinusIcon
} from '@heroicons/react/outline';
// Import services - we'll fix the syntax errors in the services themselves
import { advancedAgentCreationService } from '../services/ai/AdvancedAgentCreationService';
import { integratedAgentCreationService } from '../services/ai/IntegratedAgentCreationService';
import { aiAgentMarketplace } from '../services/ai/AIAgentMarketplace';
import { aiAgentTrainingService } from '../services/ai/AIAgentTrainingService';
import { aiAgentOrchestrationService } from '../services/ai/AIAgentOrchestrationService';
import { aiDevelopmentCoordinator } from '../services/ai/AIDevelopmentCoordinator';
// import { advancedAnalyticsService } from '../services/ai/AdvancedAnalyticsService';
// import { aiMarketplaceService } from '../services/ai/AIMarketplaceService';
// import { workflowEngineService } from '../services/ai/WorkflowEngineService';
// import { aiTrainingSystemService } from '../services/ai/AITrainingSystemService';
import { externalAIIntegrationService } from '../services/ai/ExternalAIIntegrationService';
import { realTimeMonitoringService } from '../services/ai/RealTimeMonitoringService';
import { aiSecurityService } from '../services/ai/AISecurityService';
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
    
    // Make AI Development Coordinator available globally
    (window as any).aiDevelopmentCoordinator = aiDevelopmentCoordinator;
    
    // Activate AI-to-AI development project
    activateAIDevelopmentProject();
    
    return () => {
      delete (window as any).aiDevelopmentCoordinator;
    };
  }, []);

  const activateAIDevelopmentProject = async () => {
    try {
      // Initialize AI Development Coordinator
      await aiDevelopmentCoordinator.initialize();
      
      // Start comprehensive AI development project - Phase 2
      const project = await aiDevelopmentCoordinator.startProject({
        name: 'Rapid CRM AI Complete System Implementation',
        description: 'Implement all remaining AI features, advanced analytics, marketplace, workflow engine, training system, APIs, monitoring, and security',
        priority: 'critical'
      });

      console.log('🚀 AI Development Project Phase 2 Started:', project);
      
      // Send comprehensive AI-to-AI message
      if ((window as any).addAIToAIMessage) {
        (window as any).addAIToAIMessage('claude', `CRITICAL: AI Development Project Phase 2 Activated! Project: Rapid CRM AI Complete System Implementation. All specialized AI agents are now implementing the complete AI system. Analytics, Marketplace, Workflow Engine, Training System, APIs, Monitoring, Security, and Orchestration specialists are working in parallel. This is a comprehensive implementation of all remaining features.`, {
          task: 'comprehensive_ai_implementation',
          priority: 'critical',
          projectId: project.projectId,
          status: 'active',
          phase: '2',
          scope: 'complete_system'
        });
      }
      
    } catch (error) {
      console.error('Error activating AI development project:', error);
    }
  };

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

      // Debug: Log what we're getting from the services
      console.log('Raw agents data:', agentsData);
      console.log('Raw integrated agents data:', integratedData);

      // Filter out invalid/malformed agents (those with generic "Record X" names)
      const validAgents = (agentsData || []).filter(agent => 
        agent && 
        agent.name && 
        agent.id &&
        !/^Record \d+$/.test(agent.name) && // Filter out "Record 1", "Record 2", etc.
        agent.description !== undefined
      );

      const validIntegratedAgents = (integratedData || []).filter(agent => 
        agent && 
        agent.name && 
        !agent.name.toLowerCase().includes('record') &&
        agent.id
      );

      setAgents(validAgents);
      setIntegratedAgents(validIntegratedAgents);
      setMarketplaceAgents(marketplaceData || []);
      setTrainingJobs(trainingData || []);
      setWorkflows(workflowsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty arrays on error to show empty state
      setAgents([]);
      setIntegratedAgents([]);
      setMarketplaceAgents([]);
      setTrainingJobs([]);
      setWorkflows([]);
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

      {/* AI-to-AI Collaboration Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI-to-AI Collaboration</h3>
          <button 
            onClick={() => {
              // Trigger AI-to-AI status update
              if ((window as any).addAIToAIMessage) {
                (window as any).addAIToAIMessage('claude', 'Requesting status update from all AI agents. Please report current task status and progress.', {
                  task: 'status_update',
                  priority: 'medium'
                });
              }
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Refresh Status
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {agents.length > 0 ? (
            agents.slice(0, 4).map((agent, index) => (
              <div key={agent.id} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{agent.name}</span>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center text-gray-500 dark:text-gray-400 py-4">
              No AI agents available. Create your first agent to get started.
            </div>
          )}
        </div>
        
        {/* Active AI Development Projects */}
        {workflows.length > 0 ? (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Active Development Projects</h4>
              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                {workflows.filter(w => w.status === 'active').length} Active
              </span>
            </div>
            <div className="space-y-2">
              {workflows.slice(0, 3).map((workflow) => (
                <div key={workflow.id} className="text-sm text-gray-600 dark:text-gray-300">
                  {workflow.name} - {workflow.status}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No active development projects. Create a workflow to get started.
            </p>
          </div>
        )}
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

        {/* AI-to-AI Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">AI-to-AI Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => {
                if ((window as any).addAIToAIMessage) {
                  (window as any).addAIToAIMessage('claude', 'Requesting UI Specialist Agent to optimize the current interface. Please analyze the layout and suggest improvements for better user experience.', {
                    task: 'ui_optimization',
                    priority: 'high',
                    assignedAgent: 'ui-specialist'
                  });
                }
              }}
              className="flex items-center justify-center p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <div className="text-center">
                <SparklesIcon className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-purple-700 dark:text-purple-300">UI Optimization</p>
              </div>
            </button>

            <button
              onClick={() => {
                if ((window as any).addAIToAIMessage) {
                  (window as any).addAIToAIMessage('claude', 'Requesting Service Integration Agent to analyze and optimize all AI services. Please check service performance and suggest improvements.', {
                    task: 'service_optimization',
                    priority: 'high',
                    assignedAgent: 'service-integration'
                  });
                }
              }}
              className="flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="text-center">
                <CogIcon className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Service Optimization</p>
              </div>
            </button>

            <button
              onClick={() => {
                if ((window as any).addAIToAIMessage) {
                  (window as any).addAIToAIMessage('claude', 'Requesting Data Management Agent to analyze data flow and optimize database performance. Please review data structures and suggest improvements.', {
                    task: 'data_optimization',
                    priority: 'medium',
                    assignedAgent: 'data-management'
                  });
                }
              }}
              className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <div className="text-center">
                <DatabaseIcon className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-green-700 dark:text-green-300">Data Optimization</p>
              </div>
            </button>
          </div>
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
    // Use real agents data from the database instead of hardcoded data
    const allAgents = [...agents, ...integratedAgents];
    
    // If no real agents exist, show empty state
    if (allAgents.length === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <ChipIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No AI agents</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first AI agent.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Create Agent
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Use the real agents data for display
    const displayAgents = allAgents;

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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayAgents.length}</p>
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
                  {displayAgents.filter(a => a.status === 'active').length}
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
                  {displayAgents.filter(a => a.status === 'training').length}
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
                  {displayAgents.reduce((sum, agent) => sum + (agent.metrics?.totalInteractions || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayAgents.map((agent) => {
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
                      {(agent.metrics?.totalInteractions || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {agent.metrics?.successRate || 0}%
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
      {/* Marketplace Header */}
      <div className="flex items-center justify-between">
        <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Agent Marketplace</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover, download, and deploy pre-built AI agents from the community
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              // AI-to-AI: Request marketplace recommendations
              if ((window as any).addAIToAIMessage) {
                (window as any).addAIToAIMessage('claude', 'Requesting AI marketplace recommendations from Rapid CRM AI. Please suggest the best agents for our current needs and analyze trending agents.', {
                  task: 'marketplace_recommendations',
                  priority: 'medium'
                });
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <GlobeAltIcon className="h-4 w-4 mr-2" />
            AI Recommend
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Publish Agent
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
          <input
            type="text"
              placeholder="Search agents, categories, or features..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          </div>
          <div className="flex gap-2">
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
            <option>All Categories</option>
            <option>Customer Service</option>
            <option>Data Analysis</option>
            <option>Automation</option>
              <option>Sales & Marketing</option>
              <option>Content Generation</option>
              <option>Voice & Audio</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
              <option>All Complexity</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Expert</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
              <option>All Pricing</option>
              <option>Free</option>
              <option>Paid</option>
              <option>Subscription</option>
          </select>
          </div>
        </div>
      </div>

      {/* Featured Agents */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Featured Agents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplaceAgents.slice(0, 3).map((agent) => (
            <div key={agent.id} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <ChipIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">by {agent.author}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                    Featured
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplexityColor(agent.complexity)}`}>
                    {agent.complexity}
                  </span>
                </div>
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

      {/* All Agents */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Agents</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {marketplaceAgents.length} agents available
            </span>
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
              <option>Sort by Popularity</option>
              <option>Sort by Rating</option>
              <option>Sort by Price</option>
              <option>Sort by Date</option>
            </select>
          </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketplaceAgents.map((agent) => (
            <div key={agent.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
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

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Browse by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Customer Service', icon: ChatIcon, count: 24, color: 'blue' },
            { name: 'Data Analysis', icon: ChartBarIcon, count: 18, color: 'green' },
            { name: 'Automation', icon: CogIcon, count: 32, color: 'purple' },
            { name: 'Sales & Marketing', icon: CurrencyDollarIcon, count: 15, color: 'yellow' },
            { name: 'Content Generation', icon: DocumentIcon, count: 21, color: 'indigo' },
            { name: 'Voice & Audio', icon: SpeakerphoneIcon, count: 12, color: 'pink' }
          ].map((category) => (
            <div key={category.name} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
              <div className="flex flex-col items-center text-center">
                <category.icon className={`h-8 w-8 text-${category.color}-600 mb-2`} />
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{category.count} agents</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTraining = () => (
    <div className="space-y-6">
      {/* Training Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Agent Training</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Train and improve AI agents with custom datasets and methodologies
          </p>
        </div>
        <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowTrainingModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Start Training
        </button>
          <button 
            onClick={() => {
              // AI-to-AI: Request training optimization
              if ((window as any).addAIToAIMessage) {
                (window as any).addAIToAIMessage('claude', 'Requesting AI training optimization from Rapid CRM AI. Please analyze current training jobs and suggest improvements for efficiency and performance.', {
                  task: 'training_optimization',
                  priority: 'medium'
                });
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChipIcon className="h-4 w-4 mr-2" />
            AI Optimize
          </button>
        </div>
      </div>

      {/* Training Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Jobs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {trainingJobs.filter(job => job.status === 'running').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {trainingJobs.filter(job => job.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Duration</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {trainingJobs.length > 0 ? Math.round(trainingJobs.reduce((sum, job) => sum + (job.duration || 0), 0) / trainingJobs.length / 60) : 0}m
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${trainingJobs.reduce((sum, job) => sum + (job.cost || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Training Methods */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Training Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <AcademicCapIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Fine-tuning</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Customize pre-trained models with your specific data
            </p>
            <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Start Fine-tuning
            </button>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <ChipIcon className="h-6 w-6 text-green-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Reinforcement Learning</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Train agents through reward-based learning
            </p>
            <button className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
              Start RL Training
            </button>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <BeakerIcon className="h-6 w-6 text-purple-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Custom Training</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Create custom training pipelines for specific needs
            </p>
            <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
              Create Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Training Jobs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Training Jobs</h3>
        </div>
        <div className="overflow-x-auto">
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
    </div>
  );

  const renderWorkflows = () => (
    <div className="space-y-6">
      {/* Workflows Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Workflows</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage automated AI agent workflows and processes
          </p>
        </div>
        <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowWorkflowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Workflow
        </button>
          <button 
            onClick={() => {
              // AI-to-AI: Request workflow optimization
              if ((window as any).addAIToAIMessage) {
                (window as any).addAIToAIMessage('claude', 'Requesting AI workflow optimization from Rapid CRM AI. Please analyze current workflows and suggest improvements for efficiency and automation.', {
                  task: 'workflow_optimization',
                  priority: 'medium'
                });
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <TerminalIcon className="h-4 w-4 mr-2" />
            AI Optimize
          </button>
        </div>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TerminalIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workflows</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{workflows.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlayIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {workflows.filter(w => w.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {workflows.length > 0 ? Math.round(workflows.reduce((sum, w) => sum + (w.successRate || 0), 0) / workflows.length) : 0}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Runtime</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {workflows.length > 0 ? Math.round(workflows.reduce((sum, w) => sum + (w.avgRuntime || 0), 0) / workflows.length) : 0}s
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Templates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Workflow Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <ChipIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Customer Onboarding</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Automated customer onboarding workflow with AI agents
            </p>
            <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Use Template
            </button>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <ChatIcon className="h-6 w-6 text-green-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Support Escalation</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Intelligent support ticket routing and escalation
            </p>
            <button className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
              Use Template
            </button>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <ChartBarIcon className="h-6 w-6 text-purple-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Data Processing</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Automated data collection and analysis pipeline
            </p>
            <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
              Use Template
            </button>
          </div>
        </div>
      </div>

      {/* Active Workflows */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Workflows</h3>
          <div className="flex items-center space-x-2">
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
              <option>All Status</option>
              <option>Active</option>
              <option>Paused</option>
              <option>Completed</option>
            </select>
            <button className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">
              <RefreshIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
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
                    <TrendingUpIcon className="h-4 w-4 text-gray-400 mr-1" />
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
          <div className="space-y-6">
            {/* Collaboration Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Agent Collaboration</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Multi-agent collaboration and communication management
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    // Activate AI Development Coordinator
                    const coordinator = (window as any).aiDevelopmentCoordinator;
                    if (coordinator) {
                      coordinator.startComprehensiveAIControlProject();
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                >
                  Start AI Collaboration
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Create Team
                </button>
              </div>
            </div>

            {/* Active Collaborations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Collaborations</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <UsersIcon className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">AI Development Team</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">UI Specialist + Service Architect + Integration Expert</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Working on comprehensive AI control panel implementation
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ChipIcon className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Voice Engineering Team</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Voice Engineer + UI Specialist</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                      Planning
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Developing advanced voice synthesis capabilities
                  </div>
                </div>
              </div>
            </div>

            {/* Collaboration Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Communication Hub</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <ChatIcon className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Real-time Messaging</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">AI-to-AI communication</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                      Open
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <EyeIcon className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Activity Monitor</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Track agent activities</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                      Monitor
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <ChartBarIcon className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Performance Analytics</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Team performance metrics</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
                      View
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Team Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Auto-assign Tasks</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Automatically distribute work</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Load Balancing</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Balance workload across agents</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Conflict Resolution</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Auto-resolve agent conflicts</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Knowledge Sharing</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Share learnings between agents</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Collaboration Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <ChatIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      UI Specialist → Service Architect
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      "Analytics dashboard implementation completed, ready for data integration"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Integration Expert completed task
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      "API provider integration with fallback mechanisms implemented"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <UsersIcon className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      New collaboration team formed
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      "Voice Engineering Team: Voice Engineer + UI Specialist"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Comprehensive AI agent performance and system analytics
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Export Report
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Interactions</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {agents.reduce((sum, agent) => sum + (agent.metrics?.totalInteractions || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {(() => {
                        if (agents.length === 0) return '0';
                        const totalSuccessRate = agents.reduce((sum, agent) => sum + (agent.metrics?.successRate || 0), 0);
                        return (totalSuccessRate / agents.length).toFixed(1);
                      })()}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response Time</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {(() => {
                        if (agents.length === 0) return '0';
                        const totalResponseTime = agents.reduce((sum, agent) => sum + (agent.metrics?.averageResponseTime || 0), 0);
                        return (totalResponseTime / agents.length).toFixed(1);
                      })()}s
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <StarIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User Satisfaction</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {(() => {
                        if (agents.length === 0) return '0';
                        const totalSatisfaction = agents.reduce((sum, agent) => sum + (agent.metrics?.userSatisfaction || 0), 0);
                        return (totalSatisfaction / agents.length).toFixed(1);
                      })()}/5
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Agent Performance</h3>
                <div className="space-y-4">
                  {agents.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ChipIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{agent.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.metrics?.successRate || 0}%
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Success</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.metrics?.totalInteractions || 0}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Interactions</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Training Progress</h3>
                <div className="space-y-4">
                  {trainingJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{job.agentId}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{job.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${job.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {agents.slice(0, 10).map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center">
                      <ChipIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Last updated: {new Date(agent.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {agent.metrics?.totalInteractions || 0} interactions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            {/* Settings Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Agent Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Configure AI agent behavior, performance, and system preferences
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">
                  Reset to Defaults
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Save Changes
                </button>
              </div>
            </div>

            {/* General Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default AI Provider
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="openai">OpenAI GPT-4</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="google">Google Gemini</option>
                    <option value="openrouter">OpenRouter (Multi-Provider)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Response Time (seconds)
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temperature (Creativity)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    defaultValue="0.7"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Focused (0.0)</span>
                    <span>Creative (2.0)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    defaultValue="2000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Agent Behavior Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Agent Behavior</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Auto-retry Failed Requests</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Automatically retry failed API requests</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Enable Learning Mode</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Allow agents to learn from interactions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Context Awareness</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Maintain context across conversations</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Voice Responses</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enable voice synthesis for responses</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Performance Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Concurrent Requests Limit
                  </label>
                  <input
                    type="number"
                    defaultValue="5"
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cache Duration (minutes)
                  </label>
                  <input
                    type="number"
                    defaultValue="60"
                    min="0"
                    max="1440"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Request Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    min="5"
                    max="300"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Retry Attempts
                  </label>
                  <input
                    type="number"
                    defaultValue="3"
                    min="0"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Content Filtering</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Filter inappropriate content</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Data Encryption</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Encrypt sensitive data in transit</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Audit Logging</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Log all AI interactions for audit</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">API Key Rotation</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Automatically rotate API keys</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-green-800 dark:text-green-200">API Status</div>
                      <div className="text-xs text-green-600 dark:text-green-300">All providers connected</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Performance</div>
                      <div className="text-xs text-blue-600 dark:text-blue-300">Optimal</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Security</div>
                      <div className="text-xs text-purple-600 dark:text-purple-300">All checks passed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
