import React, { useState, useEffect } from 'react';
import {
  ChipIcon,
  UserIcon,
  ChatIcon,
  ClockIcon,
  StarIcon,
  DocumentTextIcon,
  ExclamationIcon,
  CheckCircleIcon,
  CalendarIcon,
  RefreshIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/outline';
import { agentService } from '../services/ai/AgentService';
import { persistentConversationService } from '../services/conversations/PersistentConversationService';
import { persistentConversationDatabase } from '../services/database/PersistentConversationDatabase';

interface AgentMemoryDemoProps {
  className?: string;
}

const AgentMemoryDemo: React.FC<AgentMemoryDemoProps> = ({ className = '' }) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('customer-service');
  const [clientId, setClientId] = useState<string>('client-demo-001');
  const [conversationId, setConversationId] = useState<string>('conv-customer-service-client-demo-001');
  const [message, setMessage] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [agentInsights, setAgentInsights] = useState<any>(null);
  const [clientMemory, setClientMemory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clientSwitchKey, setClientSwitchKey] = useState<number>(0);

  const agents = [
    { id: 'customer-service', name: 'Customer Service Agent' },
    { id: 'sales-assistant', name: 'Sales Assistant Agent' },
    { id: 'usdot-onboarding', name: 'USDOT Onboarding Agent' },
    { id: 'usdot-rpa', name: 'USDOT RPA Agent' }
  ];

  const demoMessages = [
    "Hello, I need help with my billing",
    "I'm having trouble with the API integration",
    "Can you help me with my USDOT application?",
    "I need to update my company information",
    "What are your pricing options?",
    "I'm still having the same issue we discussed last week"
  ];

  // Handle client ID and agent changes
  useEffect(() => {
    console.log('Client ID or Agent changed to:', clientId, selectedAgent);
    setMessage('');
    const newConversationId = `conv-${selectedAgent}-${clientId}`;
    setConversationId(newConversationId);
    
    // Force clear conversation window immediately and increment key for re-render
    setConversationHistory([]);
    setClientSwitchKey(prev => prev + 1);
    console.log('Cleared conversation history for client:', clientId);
    console.log('New conversation ID:', newConversationId);
    
    // Load everything in sequence to avoid race conditions
    const loadEverything = async () => {
      await loadAgentInsights();
      await loadClientMemory(newConversationId);
      await loadConversationHistory(newConversationId);
    };
    
    loadEverything();
  }, [selectedAgent, clientId]);

  const loadAgentInsights = async () => {
    try {
      const insights = await persistentConversationDatabase.getConversationInsights(selectedAgent);
      setAgentInsights(insights);
    } catch (error) {
      console.error('Error loading agent insights:', error);
    }
  };

  const loadConversationHistory = async (currentConversationId?: string) => {
    try {
      const idToUse = currentConversationId || conversationId;
      console.log('Loading conversation history for conversationId:', idToUse);
      
      // Get the persistent context for this client/agent combination
      const persistentContext = await persistentConversationService.getPersistentContext(idToUse);
      
      console.log('Found persistent context:', persistentContext ? 'Yes' : 'No');
      
      if (persistentContext && persistentContext.conversationHistory && persistentContext.conversationHistory.length > 0) {
        // Convert persistent conversation history to display format
        const history = persistentContext.conversationHistory.map((msg: any) => ({
          id: msg.id || `msg-${Date.now()}-${Math.random()}`,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp,
          type: 'text' as const,
          metadata: msg.metadata || {}
        }));
        
        setConversationHistory(history);
        console.log('Loaded conversation history:', history.length, 'messages for client:', clientId);
      } else {
        // No existing conversation, ensure it stays clear
        setConversationHistory([]);
        console.log('No existing conversation found, keeping window clear for client:', clientId);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      setConversationHistory([]);
    }
  };

  const loadClientMemory = async (currentConversationId?: string) => {
    try {
      const idToUse = currentConversationId || conversationId;
      console.log('Loading client memory for:', selectedAgent, clientId, 'with conversationId:', idToUse);
      
      // First try to get existing memory
      let memory = await persistentConversationService.getClientMemory(selectedAgent, clientId);
      
      // If no memory exists, create a new persistent context
      if (!memory) {
        console.log('No existing memory found, creating new persistent context');
        memory = await persistentConversationService.createPersistentConversation(
          idToUse,
          clientId,
          selectedAgent,
          {
            sessionId: `session-${Date.now()}`,
            clientProfile: {
              name: `Client ${clientId}`,
              email: `${clientId}@example.com`,
              preferences: {}
            }
          }
        );
      }
      
      console.log('Loaded client memory:', memory);
      setClientMemory(memory);
    } catch (error) {
      console.error('Error loading client memory:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      // Add user message to history
      const userMessage = {
        id: `msg-${Date.now()}`,
        content: message,
        sender: 'user' as const,
        timestamp: new Date().toISOString(),
        type: 'text' as const
      };

      setConversationHistory(prev => [...prev, userMessage]);

      // Process message with agent
      const response = await agentService.processMessage(selectedAgent, message, {
        conversationId,
        clientId,
        userId: clientId,
        sessionId: `session-${Date.now()}`
      });

      // Add agent response to history
      const agentMessage = {
        id: response.id,
        content: response.message,
        sender: 'agent' as const,
        timestamp: response.timestamp,
        type: 'text' as const,
        metadata: {
          confidence: response.confidence,
          sources: response.sources
        }
      };

      setConversationHistory(prev => [...prev, agentMessage]);

      // Reload insights and memory
      await loadAgentInsights();
      await loadClientMemory();
      
      // Also update client satisfaction score based on agent response confidence
      if (response.confidence > 0.8) {
        await persistentConversationService.updateClientSatisfaction(
          conversationId,
          Math.min(10, (clientMemory?.clientProfile.satisfactionScore || 0) + 1),
          "High confidence response"
        );
        await loadClientMemory(); // Reload to show updated satisfaction
      }

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendDemoMessage = (demoMessage: string) => {
    setMessage(demoMessage);
  };

  const clearConversation = () => {
    setConversationHistory([]);
    setMessage('');
  };

  const exportAgentMemory = async () => {
    try {
      const memoryData = await persistentConversationDatabase.exportAgentMemory(selectedAgent);
      const blob = new Blob([memoryData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agent-${selectedAgent}-memory.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting agent memory:', error);
    }
  };

  const updateSatisfactionScore = async (score: number) => {
    try {
      await persistentConversationService.updateClientSatisfaction(
        conversationId,
        score,
        "Manual update for testing"
      );
      await loadClientMemory();
    } catch (error) {
      console.error('Error updating satisfaction score:', error);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ChipIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Agent Memory Demo
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Demonstrating persistent stateful storage for agent conversations
            </p>
          </div>
        </div>
        <button
          onClick={exportAgentMemory}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          Export Memory
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Selection and Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Agent
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Demo Messages
            </label>
            <div className="space-y-2">
              {demoMessages.map((demoMsg, index) => (
                <button
                  key={index}
                  onClick={() => sendDemoMessage(demoMsg)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300"
                >
                  {demoMsg}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={clearConversation}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Clear Conversation
          </button>
        </div>

        {/* Conversation Interface */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Conversation
          </h3>
          
          <div key={`conversation-${clientId}-${selectedAgent}`} className="h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
            {conversationHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Start a conversation to see agent memory in action
              </p>
            ) : (
              <div className="space-y-3">
                {conversationHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !message.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshIcon className="h-4 w-4 animate-spin" />
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>

        {/* Agent Insights */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Agent Insights
          </h3>
          
          {agentInsights ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Total Clients
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {agentInsights.totalClients}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Avg Satisfaction
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {agentInsights.averageSatisfaction.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-lg">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      Active Follow-ups
                    </p>
                    <p className="text-lg font-bold text-yellow-600">
                      {agentInsights.activeFollowUps}
                    </p>
                  </div>
                </div>
              </div>

              {agentInsights.commonIssues.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Common Issues
                  </h4>
                  <div className="space-y-1">
                    {agentInsights.commonIssues.slice(0, 3).map((issue: string, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <ExclamationIcon className="h-4 w-4 mr-2 text-orange-500" />
                        {issue}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agentInsights.successfulSolutions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Successful Solutions
                  </h4>
                  <div className="space-y-1">
                    {agentInsights.successfulSolutions.slice(0, 3).map((solution: string, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                        {solution}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No insights available
            </p>
          )}

          {/* Client Memory */}
          {clientMemory && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Memory
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {clientMemory.clientProfile.name}
                  </div>
                  <div>
                    <span className="font-medium">Style:</span> {clientMemory.clientProfile.communicationStyle}
                  </div>
                  <div>
                    <span className="font-medium">Interactions:</span> {clientMemory.clientProfile.totalInteractions}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Satisfaction:</span> 
                    <span>{clientMemory.clientProfile.satisfactionScore.toFixed(1)}</span>
                  </div>
                  {clientMemory.agentMemory.previousIssues.length > 0 && (
                    <div>
                      <span className="font-medium">Previous Issues:</span> {clientMemory.agentMemory.previousIssues.length}
                    </div>
                  )}
                  {clientMemory.agentMemory.followUpItems.length > 0 && (
                    <div>
                      <span className="font-medium">Follow-ups:</span> {clientMemory.agentMemory.followUpItems.length}
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateSatisfactionScore(5)}
                      className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => updateSatisfactionScore(0)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentMemoryDemo;
