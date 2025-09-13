import React, { useState, useEffect } from 'react';
import { useAIAgents, useAIAgent } from '../hooks/useAIAgents';
import { 
  ChipIcon, 
  ChatIcon, 
  ChartBarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  RefreshIcon,
  StarIcon,
  HandThumbUpIcon,
  HandThumbDownIcon
} from '@heroicons/react/outline';

const AIAgentDemo: React.FC = () => {
  const { agents, loading, error, systemHealth, refreshAgents, refreshSystemHealth } = useAIAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  useEffect(() => {
    if (agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents, selectedAgentId]);

  const handleSendMessage = async () => {
    if (!selectedAgentId || !message.trim()) return;

    setIsProcessing(true);
    try {
      const response = await processMessage(selectedAgentId, message);
      setResponses(prev => [...prev, {
        id: response.id,
        input: message,
        output: response,
        timestamp: new Date().toISOString()
      }]);
      setMessage('');
    } catch (error) {
      console.error('Failed to process message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processMessage = async (agentId: string, message: string) => {
    // This would be implemented using the useAIAgent hook
    // For demo purposes, we'll simulate the response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `response_${Date.now()}`,
      agentId,
      message: `I understand your request: "${message}". Let me help you with that.`,
      confidence: 0.85,
      sources: ['knowledge_base_1', 'knowledge_base_2'],
      timestamp: new Date().toISOString(),
      metadata: {
        processingTime: 1000,
        tokensUsed: 150,
        model: 'gpt-4',
        temperature: 0.3
      }
    };
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'customer_service':
        return <UserIcon className="h-5 w-5" />;
      case 'sales':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'custom':
        return <ChipIcon className="h-5 w-5" />;
      default:
        return <ChatIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      case 'inactive':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
    }
  };

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

  return (
    <div className="space-y-6">
      {/* System Health */}
      {systemHealth && (
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              AI System Health
            </h3>
            <button
              onClick={refreshSystemHealth}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
            >
              <RefreshIcon className="h-4 w-4 mr-1" />
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Active Agents:</span>
              <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                {systemHealth.agents.active}/{systemHealth.agents.total}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Knowledge Bases:</span>
              <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                {systemHealth.knowledgeBases.active}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Rules Engine:</span>
              <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                {systemHealth.rules.total}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Today's Interactions:</span>
              <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
                {systemHealth.interactions.today}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
              Available Agents
            </h3>
            
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAgentId === agent.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600">
                      {getAgentIcon(agent.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {agent.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {agent.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {agent.metrics.totalInteractions} interactions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
            {selectedAgent ? (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-blue-600">
                    {getAgentIcon(selectedAgent.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                      {selectedAgent.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {selectedAgent.description}
                    </p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4 space-y-4">
                  {responses.length === 0 ? (
                    <div className="text-center text-slate-500 dark:text-slate-400">
                      <ChatIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Start a conversation with {selectedAgent.name}</p>
                    </div>
                  ) : (
                    responses.map((response) => (
                      <div key={response.id} className="space-y-2">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                            <p className="text-sm">{response.input}</p>
                          </div>
                        </div>
                        
                        {/* Agent Response */}
                        <div className="flex justify-start">
                          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 max-w-xs">
                            <p className="text-sm text-slate-900 dark:text-slate-100">
                              {response.output.message}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Confidence: {Math.round(response.output.confidence * 100)}%
                              </span>
                              <div className="flex space-x-1">
                                <button className="text-green-600 hover:text-green-700">
                                  <HandThumbUpIcon className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-700">
                                  <HandThumbDownIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Ask ${selectedAgent.name} something...`}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isProcessing}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isProcessing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <RefreshIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400">
                <ChipIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select an agent to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgentDemo;
