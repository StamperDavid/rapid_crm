import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  ChipIcon,
  ChatIcon,
  UserIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationIcon,
  ClockIcon,
  CurrencyDollarIcon,
  RefreshIcon,
  SparklesIcon,
  XIcon,
} from '@heroicons/react/outline';
import AdvancedAgentBuilder from '../../../components/AdvancedAgentBuilder';
import AdvancedAgentCustomizer from '../../../components/AdvancedAgentCustomizer';
import AgentLearningSystem from '../../../components/AgentLearningSystem';
import AgentMemoryDemo from '../../../components/AgentMemoryDemo';
import AgentTrainingManager from '../../../components/AgentTrainingManager';
import RPATrainingManager from '../../../components/RPATrainingManager';
import IntegratedAIChat from '../../../components/IntegratedAIChat';
import { useAIAgents } from '../../../hooks/useAIAgents';
import { Agent } from '../../../types/schema';

// Mock agents are now handled by the agentService, so we don't need this array

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
  const [showAdvancedBuilder, setShowAdvancedBuilder] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showTrainingManager, setShowTrainingManager] = useState(false);
  const [showRPATrainingManager, setShowRPATrainingManager] = useState(false);
  const [trainingAgent, setTrainingAgent] = useState<Agent | null>(null);
  const [rpaTrainingAgent, setRPATrainingAgent] = useState<Agent | null>(null);
  const [showMemoryDemo, setShowMemoryDemo] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showLearningSystem, setShowLearningSystem] = useState(false);
  const [chattingAgent, setChattingAgent] = useState<Agent | null>(null);
  const [customizingAgent, setCustomizingAgent] = useState<Agent | null>(null);
  const [learningAgent, setLearningAgent] = useState<Agent | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'training'>('all');

  const filteredAgents = agents.filter(agent => {
    if (filter === 'all') return true;
    return agent.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshIcon className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-slate-600 dark:text-slate-400">Loading AI Agents...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
        <div className="flex">
          <ExclamationIcon className="h-5 w-5 text-red-400" />
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
      case 'customer_service': return ChatIcon;
      case 'sales': return CurrencyDollarIcon;
      case 'support': return CogIcon;
      case 'custom': return ChipIcon;
      default: return ChipIcon;
    }
  };

  const handleCreateAdvancedAgent = () => {
    setEditingAgent(null);
    setShowAdvancedBuilder(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setShowAdvancedBuilder(true);
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
      setShowAdvancedBuilder(false);
    } catch (error) {
      console.error('Failed to save agent:', error);
    }
  };

  const handleCloseAdvancedBuilder = () => {
    setShowAdvancedBuilder(false);
    setEditingAgent(null);
  };

  const handleOpenTraining = (agent: Agent) => {
    setTrainingAgent(agent);
    setShowTrainingManager(true);
  };

  const handleCloseTraining = () => {
    setShowTrainingManager(false);
    setTrainingAgent(null);
  };

  const handleOpenRPATraining = (agent: Agent) => {
    setRPATrainingAgent(agent);
    setShowRPATrainingManager(true);
  };

  const handleCloseRPATraining = () => {
    setShowRPATrainingManager(false);
    setRPATrainingAgent(null);
  };

  const handleOpenChat = (agent: Agent) => {
    setChattingAgent(agent);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setChattingAgent(null);
  };

  const handleOpenCustomizer = (agent: Agent) => {
    setCustomizingAgent(agent);
    setShowCustomizer(true);
  };

  const handleCloseCustomizer = () => {
    setShowCustomizer(false);
    setCustomizingAgent(null);
  };

  const handleOpenLearningSystem = (agent: Agent) => {
    setLearningAgent(agent);
    setShowLearningSystem(true);
  };

  const handleCloseLearningSystem = () => {
    setShowLearningSystem(false);
    setLearningAgent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Agents</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Build and manage AI agents for your platform
            </p>
          </div>
          <button
            onClick={() => setShowMemoryDemo(!showMemoryDemo)}
            className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ChipIcon className="h-4 w-4 mr-2" />
            Memory Demo
          </button>
        </div>
        <button
          onClick={refreshAgents}
          className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
        >
          <RefreshIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
        <button
          onClick={handleCreateAdvancedAgent}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <SparklesIcon className="h-4 w-4 mr-2" />
          {editingAgent ? 'Edit Agent' : 'Create Agent'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ChipIcon className="h-6 w-6 text-blue-600" />
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
              <ChatIcon className="h-6 w-6 text-purple-600" />
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
                      {agent.displayName ? `${agent.displayName}` : agent.name}
                    </h3>
                    {agent.displayName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {agent.name}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {agent.description}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditAgent(agent)}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    style={{ zIndex: 9999, position: 'relative' }}
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    style={{ zIndex: 9999, position: 'relative' }}
                  >
                    DELETE
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

              <div className="mt-4 space-y-2">
                {/* Primary Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenChat(agent)}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                    title="Chat with Agent"
                  >
                    <ChatIcon className="h-4 w-4 mr-1 inline" />
                    Chat
                  </button>
                  <button
                    onClick={() => handleOpenCustomizer(agent)}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30"
                    title="Customize Agent"
                  >
                    <CogIcon className="h-4 w-4 mr-1 inline" />
                    Customize
                  </button>
                </div>
                
                {/* Secondary Actions */}
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleOpenLearningSystem(agent)}
                    className="px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                    title="Learning System"
                  >
                    <SparklesIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(agent.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      agent.status === 'active'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30'
                    }`}
                    title={agent.status === 'active' ? 'Pause Agent' : 'Activate Agent'}
                  >
                    {agent.status === 'active' ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4" />
                    )}
                  </button>
                  {agent.name.includes('RPA') ? (
                    <button
                      onClick={() => handleOpenRPATraining(agent)}
                      className="px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors"
                      title="Train RPA Agent"
                    >
                      <ChipIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenTraining(agent)}
                      className="px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
                      title="Train Agent"
                    >
                      <ChipIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedAgent(agent)}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-md transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <ChipIcon className="mx-auto h-12 w-12 text-gray-400" />
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
                onClick={handleCreateAdvancedAgent}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                Create Agent
              </button>
            </div>
          )}
        </div>
      )}

      {/* Agent Memory Demo Section */}
      {showMemoryDemo && (
        <div className="mt-8">
          <AgentMemoryDemo />
        </div>
      )}

      {/* Advanced Agent Builder Modal */}
      <AdvancedAgentBuilder
        isOpen={showAdvancedBuilder}
        onClose={handleCloseAdvancedBuilder}
        onSave={handleSaveAgent}
        editingAgent={editingAgent}
      />

      {/* Training Manager Modal */}
      <AgentTrainingManager
        isOpen={showTrainingManager}
        onClose={handleCloseTraining}
        agentId={trainingAgent?.id}
        agentName={trainingAgent?.name}
      />

      {/* RPA Training Manager Modal */}
      <RPATrainingManager
        isOpen={showRPATrainingManager}
        onClose={handleCloseRPATraining}
        agentId={rpaTrainingAgent?.id}
        agentName={rpaTrainingAgent?.name}
      />

      {/* Agent Chat Modal */}
      {showChat && chattingAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <ChatIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Chat with {chattingAgent.displayName || chattingAgent.name}
                  </h3>
                  {chattingAgent.displayName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {chattingAgent.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {chattingAgent.description}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseChat}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <IntegratedAIChat 
                isOpen={true} 
                onClose={handleCloseChat}
              />
            </div>
          </div>
        </div>
      )}

      {/* Advanced Agent Customizer */}
      {showCustomizer && customizingAgent && (
        <AdvancedAgentCustomizer
          agentId={customizingAgent.id}
          agentName={customizingAgent.name}
          isOpen={showCustomizer}
          onClose={handleCloseCustomizer}
          onSave={(config) => {
            console.log('Agent configuration saved:', config);
            handleCloseCustomizer();
          }}
        />
      )}

      {/* Agent Learning System */}
      {showLearningSystem && learningAgent && (
        <AgentLearningSystem
          agentId={learningAgent.id}
          agentName={learningAgent.name}
          isOpen={showLearningSystem}
          onClose={handleCloseLearningSystem}
        />
      )}
    </div>
  );
};

export default Agents;
