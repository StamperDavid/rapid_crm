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
} from '@heroicons/react/24/outline';
import AgentBuilder from '../../../components/AgentBuilder';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'onboarding' | 'customer_service' | 'sales' | 'support' | 'custom';
  status: 'active' | 'inactive' | 'training' | 'error';
  lastActive: string;
  conversationsHandled: number;
  successRate: number;
  configuration: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    capabilities: string[];
  };
  createdAt: string;
  updatedAt: string;
}

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Onboarding Assistant',
    description: 'Helps new customers get started with the platform',
    type: 'onboarding',
    status: 'active',
    lastActive: '2024-01-20T10:30:00Z',
    conversationsHandled: 1247,
    successRate: 94.2,
    configuration: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a helpful onboarding assistant for Rapid CRM...',
      capabilities: ['account_setup', 'feature_explanation', 'troubleshooting']
    },
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'Customer Service Bot',
    description: 'Handles general customer inquiries and support requests',
    type: 'customer_service',
    status: 'active',
    lastActive: '2024-01-20T11:15:00Z',
    conversationsHandled: 3421,
    successRate: 89.7,
    configuration: {
      model: 'gpt-3.5-turbo',
      temperature: 0.5,
      maxTokens: 1500,
      systemPrompt: 'You are a professional customer service representative...',
      capabilities: ['billing_support', 'technical_help', 'feature_requests']
    },
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-20T11:15:00Z'
  },
  {
    id: '3',
    name: 'Sales Qualification Bot',
    description: 'Qualifies leads and schedules demos for the sales team',
    type: 'sales',
    status: 'training',
    lastActive: '2024-01-19T16:45:00Z',
    conversationsHandled: 89,
    successRate: 76.4,
    configuration: {
      model: 'gpt-4',
      temperature: 0.6,
      maxTokens: 1800,
      systemPrompt: 'You are a sales qualification specialist...',
      capabilities: ['lead_qualification', 'demo_scheduling', 'objection_handling']
    },
    createdAt: '2024-01-18T12:00:00Z',
    updatedAt: '2024-01-19T16:45:00Z'
  }
];

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'training'>('all');

  const filteredAgents = agents.filter(agent => {
    if (filter === 'all') return true;
    return agent.status === filter;
  });

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

  const handleDeleteAgent = (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      setAgents(agents.filter(agent => agent.id !== agentId));
    }
  };

  const handleToggleStatus = (agentId: string) => {
    setAgents(agents.map(agent => {
      if (agent.id === agentId) {
        const newStatus = agent.status === 'active' ? 'inactive' : 'active';
        return { ...agent, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return agent;
    }));
  };

  const handleSaveAgent = (agentConfig: any) => {
    if (editingAgent) {
      // Update existing agent
      setAgents(agents.map(agent => 
        agent.id === editingAgent.id 
          ? { ...agent, ...agentConfig, updatedAt: new Date().toISOString() }
          : agent
      ));
      setEditingAgent(null);
    } else {
      // Create new agent
      const newAgent: Agent = {
        id: Date.now().toString(),
        ...agentConfig,
        status: 'inactive',
        lastActive: new Date().toISOString(),
        conversationsHandled: 0,
        successRate: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setAgents([...agents, newAgent]);
    }
    setShowCreateModal(false);
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
                {agents.reduce((sum, agent) => sum + agent.conversationsHandled, 0).toLocaleString()}
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
                    {agent.conversationsHandled.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {agent.successRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Active</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(agent.lastActive).toLocaleDateString()}
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
