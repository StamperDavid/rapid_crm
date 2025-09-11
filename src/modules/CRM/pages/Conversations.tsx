import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  HandRaisedIcon,
  PhoneIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Conversation, Message, ConversationFilters, ConversationStats } from '../../../types/conversation';
import { mockConversationService } from '../../../services/conversationService';

const ConversationsScalable: React.FC = () => {
  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ConversationFilters>({
    status: 'all',
    agentType: 'all',
    page: 1,
    limit: 20
  });
  const [newMessage, setNewMessage] = useState('');
  const [isHandingOff, setIsHandingOff] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationListRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Load conversations with pagination
  const loadConversations = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      const currentPage = reset ? 1 : (filters.page || 1);
      const searchFilters = {
        ...filters,
        page: currentPage,
        search: searchTerm || undefined
      };

      const result = await mockConversationService.getConversations(searchFilters);
      
      if (reset) {
        setConversations(result.conversations);
      } else {
        setConversations(prev => [...prev, ...result.conversations]);
      }
      
      setHasMore(result.hasMore);
      setFilters(prev => ({ ...prev, page: currentPage }));
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchTerm]);

  // Load conversation messages with pagination
  const loadConversationMessages = useCallback(async (conversationId: string, reset = false) => {
    try {
      const conversation = await mockConversationService.getConversation(conversationId);
      if (reset) {
        setConversationMessages(conversation.messages);
      } else {
        setConversationMessages(prev => [...conversation.messages, ...prev]);
      }
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    }
  }, []);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const conversationStats = await mockConversationService.getConversationStats();
      setStats(conversationStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations(true);
    loadStats();
  }, [loadConversations, loadStats]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    
    const handleNewMessage = (conversationId: string, message: Message) => {
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessageAt: message.timestamp, messages: [...conv.messages, message] }
          : conv
      ));
      
      if (selectedConversation?.id === conversationId) {
        setConversationMessages(prev => [...prev, message]);
      }
    };

    const handleConversationUpdated = (conversation: Conversation) => {
      setConversations(prev => prev.map(conv => 
        conv.id === conversation.id ? conversation : conv
      ));
      
      if (selectedConversation?.id === conversation.id) {
        setSelectedConversation(conversation);
      }
    };

    const handleConversationCreated = (conversation: Conversation) => {
      setConversations(prev => [conversation, ...prev]);
      loadStats(); // Refresh stats
    };

    const handleHandoffRequest = (conversationId: string, message: Message) => {
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, status: 'waiting_for_agent', lastMessageAt: message.timestamp }
          : conv
      ));
      loadStats(); // Refresh stats
    };

    // Register event listeners
    mockConversationService.on('connected', handleConnected);
    mockConversationService.on('disconnected', handleDisconnected);
    mockConversationService.on('newMessage', handleNewMessage);
    mockConversationService.on('conversationUpdated', handleConversationUpdated);
    mockConversationService.on('conversationCreated', handleConversationCreated);
    mockConversationService.on('handoffRequest', handleHandoffRequest);

    // Connect WebSocket
    mockConversationService.connectWebSocket();

    // Simulate new conversations for demo
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        mockConversationService.simulateNewConversation();
      }
    }, 10000);

    return () => {
      mockConversationService.off('connected', handleConnected);
      mockConversationService.off('disconnected', handleDisconnected);
      mockConversationService.off('newMessage', handleNewMessage);
      mockConversationService.off('conversationUpdated', handleConversationUpdated);
      mockConversationService.off('conversationCreated', handleConversationCreated);
      mockConversationService.off('handoffRequest', handleHandoffRequest);
      clearInterval(interval);
    };
  }, [selectedConversation, loadStats]);

  // Infinite scroll for conversations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadConversations(false);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadConversations]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // Handle conversation selection
  const handleConversationSelect = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    setConversationMessages(conversation.messages);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<ConversationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const message = await mockConversationService.sendMessage(
        selectedConversation.id, 
        newMessage, 
        'agent'
      );
      
      setConversationMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [newMessage, selectedConversation]);

  // Take over conversation
  const handleTakeOver = useCallback(async () => {
    if (!selectedConversation) return;
    
    setIsHandingOff(true);
    try {
      const updatedConversation = await mockConversationService.takeOverConversation(
        selectedConversation.id, 
        'current-user'
      );
      setSelectedConversation(updatedConversation);
    } catch (error) {
      console.error('Failed to take over conversation:', error);
    } finally {
      setIsHandingOff(false);
    }
  }, [selectedConversation]);

  // Memoized filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(conversation => {
      const matchesSearch = !searchTerm || 
        conversation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || conversation.status === filters.status;
      const matchesAgentType = filters.agentType === 'all' || conversation.agentType === filters.agentType;
      
      return matchesSearch && matchesStatus && matchesAgentType;
    });
  }, [conversations, searchTerm, filters.status, filters.agentType]);

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'waiting_for_agent': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'handed_off': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'closed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUnreadCount = () => {
    return conversations.filter(conv => conv.status === 'waiting_for_agent').length;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Conversations</h1>
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Monitor and manage AI agent conversations in real-time
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {stats && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{stats.total}</div>
                  <div className="text-gray-500 dark:text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{stats.active}</div>
                  <div className="text-gray-500 dark:text-gray-400">Active</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yellow-600">{stats.waitingForAgent}</div>
                  <div className="text-gray-500 dark:text-gray-400">Waiting</div>
                </div>
              </div>
            )}
            
            {getUnreadCount() > 0 && (
              <div className="flex items-center space-x-2">
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {getUnreadCount()}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Waiting for Agent</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange({ status: e.target.value })}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="waiting_for_agent">Waiting for Agent</option>
                  <option value="handed_off">Handed Off</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                
                <select
                  value={filters.agentType}
                  onChange={(e) => handleFilterChange({ agentType: e.target.value })}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Agents</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="customer_service">Customer Service</option>
                  <option value="sales">Sales</option>
                  <option value="support">Support</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto" ref={conversationListRef}>
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {conversation.customerName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {conversation.companyName || conversation.customerEmail}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    {conversation.status === 'waiting_for_agent' && (
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                      {conversation.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityColor(conversation.priority)}`}>
                      {conversation.priority}
                    </span>
                    <span className="capitalize">{conversation.agentType.replace('_', ' ')}</span>
                  </div>
                  <span>{formatTime(conversation.lastMessageAt)}</span>
                </div>
                
                {conversation.messages.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 truncate">
                    {conversation.messages[conversation.messages.length - 1].content}
                  </p>
                )}
              </div>
            ))}
            
            {/* Load More Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="p-4 text-center">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <ArrowPathIcon className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Loading...</span>
                  </div>
                ) : (
                  <button
                    onClick={() => loadConversations(false)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Load More
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {selectedConversation.customerName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {selectedConversation.customerName}
                      </h2>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{selectedConversation.companyName}</span>
                        <span>•</span>
                        <span className="capitalize">{selectedConversation.agentType.replace('_', ' ')} Agent</span>
                        {selectedConversation.assignedAgent && (
                          <>
                            <span>•</span>
                            <span>Assigned to {selectedConversation.assignedAgentName || selectedConversation.assignedAgent}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedConversation.status)}`}>
                        {selectedConversation.status.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedConversation.priority)}`}>
                        {selectedConversation.priority}
                      </span>
                    </div>
                    
                    {selectedConversation.status === 'waiting_for_agent' && (
                      <button
                        onClick={handleTakeOver}
                        disabled={isHandingOff}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <HandRaisedIcon className="h-4 w-4 mr-2" />
                        {isHandingOff ? 'Taking Over...' : 'Take Over'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {conversationMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : message.sender === 'ai'
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        : 'bg-green-600 text-white'
                    }`}>
                      {message.type === 'handoff_request' && (
                        <div className="flex items-center mb-2">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Handoff Request</span>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a conversation from the list to view and respond to messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationsScalable;
