import React, { useState, useEffect } from 'react';
import {
  ChatIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  InformationCircleIcon,
  UserIcon,
} from '@heroicons/react/outline';
import { claudeCollaborationService } from '../services/ai/ClaudeCollaborationService';
import { chatHistoryService } from '../services/ai/ChatHistoryService';

interface CollaborationMessage {
  id: string;
  timestamp: string;
  type: 'request' | 'response' | 'system';
  from: 'rapid-crm' | 'claude' | 'system';
  content: string;
  status: 'pending' | 'completed' | 'error';
  metadata?: any;
}

interface AICollaborationMonitorProps {
  embedded?: boolean;
  userChatHistory?: any[]; // Pass user chat history from AdvancedUIAssistant
}

const AICollaborationMonitor: React.FC<AICollaborationMonitorProps> = ({ embedded = false, userChatHistory = [] }) => {
  const [isVisible, setIsVisible] = useState(embedded);
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ai-to-ai' | 'user-chat'>('ai-to-ai');
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const loadCollaborationHistory = async () => {
    try {
      // Fetch AI-to-AI communication history from the API
      const response = await fetch('http://localhost:3001/api/ai/collaborate');
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 AI Collaboration API Response:', data);
        if (data.success && data.messages) {
          // Transform API messages to match the expected format
          const formattedMessages = data.messages.map((msg: any) => ({
            id: msg.id || `msg_${Date.now()}_${Math.random()}`,
            timestamp: msg.timestamp,
            type: msg.sender === 'claude' ? 'response' : 'request',
            from: msg.sender === 'claude' ? 'claude' : 'rapid-crm-ai',
            content: msg.content,
            status: 'completed' as const,
            metadata: msg.context ? (typeof msg.context === 'string' ? JSON.parse(msg.context) : msg.context) : undefined
          }));
          console.log('🔍 Formatted AI Collaboration Messages:', formattedMessages);
          setMessages(formattedMessages);
          return;
        } else {
          console.log('🔍 No messages found in API response');
        }
      } else {
        console.error('🔍 API response not ok:', response.status);
      }
      
      // Fallback to local service if API fails
      const history = claudeCollaborationService.getMessageHistory();
      const formattedMessages = history.map(msg => ({
        id: msg.id,
        timestamp: msg.timestamp,
        type: msg.role === 'user' ? 'request' : 'response',
        from: msg.role === 'user' ? 'rapid-crm' : 'claude',
        content: msg.content,
        status: 'completed' as const,
        metadata: msg.context
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load collaboration history:', error);
      // Fallback to local service
      const history = claudeCollaborationService.getMessageHistory();
      const formattedMessages = history.map(msg => ({
        id: msg.id,
        timestamp: msg.timestamp,
        type: msg.role === 'user' ? 'request' : 'response',
        from: msg.role === 'user' ? 'rapid-crm' : 'claude',
        content: msg.content,
        status: 'completed' as const,
        metadata: msg.context
      }));
      setMessages(formattedMessages);
    }
  };

  useEffect(() => {
    // Check collaboration status
    const status = claudeCollaborationService.getCollaborationStatus();
    setIsConnected(status.isConnected);
    setSessionInfo(status.session);

    // Load AI-to-AI communication history from API
    loadCollaborationHistory();

    // Listen for real-time collaboration messages
    const handleCollaborationMessage = (event: CustomEvent) => {
      const { from, type, content, metadata, timestamp } = event.detail;
      const newMessage: CollaborationMessage = {
        id: `realtime-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        type: type as 'request' | 'response' | 'system',
        from: from as 'rapid-crm' | 'claude' | 'system',
        content,
        status: 'completed',
        metadata
      };
      setMessages(prev => [...prev, newMessage]);
    };

    window.addEventListener('ai-collaboration-message', handleCollaborationMessage as EventListener);

    // Set up status monitoring
    const interval = setInterval(() => {
      const newStatus = claudeCollaborationService.getCollaborationStatus();
      setIsConnected(newStatus.isConnected);
      setSessionInfo(newStatus.session);
    }, 1000);

    // Subscribe to chat history changes
    const unsubscribeChatHistory = chatHistoryService.subscribe((history) => {
      setChatHistory(history);
    });

    // Get initial chat history
    setChatHistory(chatHistoryService.getChatHistory());

    return () => {
      clearInterval(interval);
      window.removeEventListener('ai-collaboration-message', handleCollaborationMessage as EventListener);
      unsubscribeChatHistory();
    };
  }, []);

  const addSystemMessage = (content: string) => {
    const newMessage: CollaborationMessage = {
      id: `system-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'system',
      from: 'system',
      content,
      status: 'completed'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
    claudeCollaborationService.clearMessageHistory();
    addSystemMessage('Message history cleared');
  };

  const refreshStatus = () => {
    const status = claudeCollaborationService.getCollaborationStatus();
    setIsConnected(status.isConnected);
    setSessionInfo(status.session);
    addSystemMessage('Status refreshed');
  };

  const testCollaboration = async () => {
    try {
      addSystemMessage('Testing AI-to-AI collaboration...');
      const response = await claudeCollaborationService.sendMessage('Hello Claude, this is a test message from Rapid CRM AI. Can you confirm you received this?');
      addSystemMessage(`Claude responded: ${response}`);
    } catch (error) {
      addSystemMessage(`Error testing collaboration: ${error.message}`);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getMessageIcon = (from: string, type: string) => {
    if (type === 'system') return <InformationCircleIcon className="h-4 w-4" />;
    if (from === 'rapid-crm') return <ChatIcon className="h-4 w-4" />;
    if (from === 'claude') return <CheckCircleIcon className="h-4 w-4" />;
    return <ExclamationIcon className="h-4 w-4" />;
  };

  const getMessageColor = (from: string, type: string) => {
    if (type === 'system') return 'text-blue-600 bg-blue-50 border-blue-200';
    if (from === 'rapid-crm') return 'text-purple-600 bg-purple-50 border-purple-200';
    if (from === 'claude') return 'text-green-600 bg-green-50 border-green-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (!isVisible) {
    if (embedded) {
      return null; // Don't render anything when embedded and not visible
    }
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          <ChatIcon className="h-5 w-5" />
          <span>AI Monitor</span>
          {isConnected && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`${embedded ? 'w-full h-[500px]' : 'fixed bottom-6 left-6 w-96 h-[500px]'} bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 ${embedded ? '' : 'z-50'} flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ChatIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Monitor
            </h3>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshStatus}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Refresh Status"
            >
              <RefreshIcon className="h-4 w-4" />
            </button>
            <button
              onClick={clearMessages}
              className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              title="Clear Messages"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
            <button
              onClick={testCollaboration}
              className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              title="Test AI Collaboration"
            >
              <ChatIcon className="h-4 w-4" />
            </button>
            {!embedded && (
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Hide Monitor"
              >
                <EyeOffIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('ai-to-ai')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'ai-to-ai'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            AI-to-AI Communication
          </button>
          <button
            onClick={() => setActiveTab('user-chat')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'user-chat'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Your Chat History
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Status: <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            {activeTab === 'ai-to-ai' ? `AI Messages: ${messages.length}` : `Chat Messages: ${chatHistory.length}`}
          </span>
        </div>
        {sessionInfo && activeTab === 'ai-to-ai' && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Session: {sessionInfo.id} | Started: {new Date(sessionInfo.startTime).toLocaleTimeString()}
          </div>
        )}
        {activeTab === 'user-chat' && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Your conversations with Rapid CRM AI Assistant
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'ai-to-ai' ? (
          messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <ChatIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No AI-to-AI communication yet</p>
              <p className="text-sm">Messages will appear here when Rapid CRM AI and Claude collaborate on tasks</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${getMessageColor(message.from, message.type)}`}
              >
                <div className="flex items-start space-x-2">
                  {getMessageIcon(message.from, message.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium capitalize">
                        {message.from === 'rapid-crm' ? 'Rapid CRM AI' : 
                         message.from === 'claude' ? 'Claude (Cursor AI)' : 'System'}
                      </span>
                      <span className="text-xs opacity-75">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    {message.metadata && (
                      <div className="mt-2 text-xs opacity-75">
                        <details>
                          <summary className="cursor-pointer">Metadata</summary>
                          <pre className="mt-1 text-xs bg-black/5 p-2 rounded overflow-x-auto">
                            {JSON.stringify(message.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          chatHistory.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <UserIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No chat history yet</p>
              <p className="text-sm">Your conversations with Rapid CRM AI will appear here</p>
            </div>
          ) : (
            chatHistory.map((message, index) => (
              <div
                key={message.id || index}
                className={`p-3 rounded-lg border ${
                  message.type === 'user' 
                    ? 'text-blue-600 bg-blue-50 border-blue-200' 
                    : 'text-green-600 bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'user' ? (
                    <UserIcon className="h-4 w-4" />
                  ) : (
                    <ChatIcon className="h-4 w-4" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium capitalize">
                        {message.type === 'user' ? 'You' : 'Rapid CRM AI'}
                      </span>
                      <span className="text-xs opacity-75">
                        {message.timestamp ? formatTimestamp(message.timestamp.toISOString()) : 'Just now'}
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    {message.action && (
                      <div className="mt-2 text-xs opacity-75">
                        <span className="font-medium">Action:</span> {message.action}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {activeTab === 'ai-to-ai' 
            ? 'Real-time monitoring of AI-to-AI collaboration' 
            : 'Your conversation history with Rapid CRM AI Assistant'
          }
        </div>
      </div>
    </div>
  );
};

export default AICollaborationMonitor;
