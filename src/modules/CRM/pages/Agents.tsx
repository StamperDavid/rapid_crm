import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import AgentBuilder from '../../../components/AgentBuilder';
import { useAIAgents } from '../../../hooks/useAIAgents';
import { Agent } from '../../../types/schema';

const mockAgents: Agent[] = [
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
      systemPrompt: 'You are a specialized USDOT Application Agent for Rapid CRM. Your primary role is to collect comprehensive USDOT application data from transportation companies during the onboarding process. You must gather all required information including Operation Classification Summary, Company Contact Information, Operation Questions, Vehicle Summary, Driver Summary, Affiliation with Others, Compliance Certifications, and File Uploads. Once all data is collected and validated, you will trigger the robotic process automation agent to complete the actual USDOT application submission. Always be thorough, professional, and ensure compliance with FMCSA requirements.',
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
      systemPrompt: 'You are a Robotic Process Automation (RPA) Agent specialized in USDOT application completion. You receive structured data from the USDOT Application Agent and use it to automatically fill out and submit USDOT applications through the official FMCSA portal. You handle form navigation, data entry, validation, document uploads, and final submission. You must ensure 100% accuracy and compliance with all FMCSA requirements. Report back on submission status and any issues encountered.',
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

const Agents: React.FC = () => {
  const { 
    agents, 
    loading, 
    error, 
    systemHealth, 
    createAgent, 
    updateAgent, 
    deleteAgent, 
    refreshAgents 
  } = useAIAgents();
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'training'>('all');

  const filteredAgents = agents.filter(agent => {
    if (filter === 'all') return true;
    return agent.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-slate-600 dark:text-slate-400">Loading AI Agents...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error Loading AI Agents
            </h3>
            <div className="mt-1 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'training': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: Agent['type']) => {
    switch (type) {
      case 'onboarding': return UserIcon;
      case 'customer_service': return ChatBubbleLeftRightIcon;
      case 'sales': return CurrencyDollarIcon;
      case 'support': return CogIcon;
      case 'custom': return CpuChipIcon;
      default: return CpuChipIcon;
    }
  };

  const handleCreateAgent = () => {
    setShowCreateModal(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setShowCreateModal(true);
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      try {
        await deleteAgent(agentId);
      } catch (error) {
        console.error('Failed to delete agent:', error);
      }
    }
  };

  const handleToggleStatus = async (agentId: string) => {
    try {
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        const newStatus = agent.status === 'active' ? 'inactive' : 'active';
        await updateAgent(agentId, { status: newStatus });
      }
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
    }
  };

  const handleSaveAgent = async (agentConfig: any) => {
    try {
      if (editingAgent) {
        // Update existing agent
        await updateAgent(editingAgent.id, agentConfig);
        setEditingAgent(null);
      } else {
        // Create new agent
        await createAgent(agentConfig);
      }
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to save agent:', error);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingAgent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Agents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Build and manage AI agents for your platform
          </p>
        </div>
        <button
          onClick={refreshAgents}
          className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
        <button
          onClick={handleCreateAgent}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Agent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <CpuChipIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{agents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {agents.filter(a => a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Training</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {agents.filter(a => a.status === 'training').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {agents.reduce((sum, agent) => sum + agent.metrics.totalInteractions, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {(['all', 'active', 'inactive', 'training'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === filterType
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => {
          const TypeIcon = getTypeIcon(agent.type);
          return (
            <div
              key={agent.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
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
                  <button
                    onClick={() => handleEditAgent(agent)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
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
                  onClick={() => handleToggleStatus(agent.id)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    agent.status === 'active'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
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
                  onClick={() => setSelectedAgent(agent)}
                  className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <CpuChipIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No agents found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filter === 'all' 
              ? 'Get started by creating your first AI agent.'
              : `No agents with status "${filter}" found.`
            }
          </p>
          {filter === 'all' && (
            <div className="mt-6">
              <button
                onClick={handleCreateAgent}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Agent
              </button>
            </div>
          )}
        </div>
      )}

      {/* Agent Builder Modal */}
      <AgentBuilder
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={handleSaveAgent}
        editingAgent={editingAgent}
      />
    </div>
  );
};

export default Agents;
