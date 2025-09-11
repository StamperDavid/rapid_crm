import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { useConversations } from '../../../hooks/useConversations';

const ConversationsScalable: React.FC = () => {
  // Use the new conversations hook
  const {
    conversations,
    messages,
    stats,
    loading,
    error,
    selectedConversation,
    realTimeEvents,
    createConversation,
    updateConversation,
    deleteConversation,
    assignAgent,
    updateStatus,
    sendMessage,
    getMessages,
    applyFilters,
    clearFilters,
    subscribeToConversation,
    refreshConversations,
    selectConversation
  } = useConversations();

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ConversationFilters>({
    status: 'all',
    agentType: 'all',
    page: 1,
    limit: 20
  });
  const [newMessage, setNewMessage] = useState('');
  const [isHandingOff, setIsHandingOff] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationListRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Load conversation messages when a conversation is selected
  const loadConversationMessages = useCallback(async (conversationId: string) => {
    try {
      await getMessages(conversationId);
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    }
  }, [getMessages]);

  // Initial load
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Subscribe to real-time updates for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const unsubscribe = subscribeToConversation(selectedConversation.id, (event) => {
        console.log('Real-time event:', event);
        // The hook will automatically update the state
      });
      
      return unsubscribe;
    }
  }, [selectedConversation, subscribeToConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation, messages]);

  // Handle conversation selection
  const handleConversationSelect = useCallback((conversation: Conversation) => {
    selectConversation(conversation);
    loadConversationMessages(conversation.id);
  }, [selectConversation, loadConversationMessages]);

  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessage(selectedConversation.id, newMessage, 'user-1', 'user');
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [newMessage, selectedConversation, sendMessage]);

  // Handle agent handoff
  const handleAgentHandoff = useCallback(async (conversationId: string, agentId: string) => {
    try {
      setIsHandingOff(true);
      await assignAgent(conversationId, agentId);
    } catch (error) {
      console.error('Failed to assign agent:', error);
    } finally {
      setIsHandingOff(false);
    }
  }, [assignAgent]);

  // Handle status update
  const handleStatusUpdate = useCallback(async (conversationId: string, status: Conversation['status']) => {
    try {
      await updateStatus(conversationId, status);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }, [updateStatus]);

  // Handle search
  const handleSearch = useCallback(async () => {
    const searchFilters: ConversationFilters = {
      ...filters,
      search: searchTerm || undefined
    };
    await applyFilters(searchFilters);
  }, [searchTerm, filters, applyFilters]);

  // Handle filter changes
  const handleFilterChange = useCallback(async (newFilters: Partial<ConversationFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    await applyFilters(updatedFilters);
  }, [filters, applyFilters]);

  // Get conversation messages
  const conversationMessages = selectedConversation ? (messages.get(selectedConversation.id) || []) : [];

  // Get status color
  const getStatusColor = (status: Conversation['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'waiting_for_agent': return 'text-orange-600 bg-orange-100';
      case 'handed_off': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-blue-600 bg-blue-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Conversation['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading conversations</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversations</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshConversations}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Total</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Active</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.waitingForAgent}</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Waiting</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.resolved}</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Resolved</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="mt-3 flex space-x-2">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value as any })}
                className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="waiting_for_agent">Waiting for Agent</option>
                <option value="handed_off">Handed Off</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {conversation.customerName || 'Unknown Customer'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(conversation.status)}`}>
                        {conversation.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                      {conversation.messages.length > 0 ? conversation.messages[conversation.messages.length - 1].content : 'No messages yet'}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(conversation.lastMessageAt)}
                      </span>
                      {conversation.priority && (
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(conversation.priority)}`}>
                          {conversation.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {conversation.assignedAgent && (
                      <CpuChipIcon className="h-4 w-4 text-blue-500" />
                    )}
                    {conversation.messages.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {conversation.messages.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {selectedConversation.customerName || 'Unknown Customer'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedConversation.assignedAgent ? `Assigned to ${selectedConversation.assignedAgent}` : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedConversation.status}
                      onChange={(e) => handleStatusUpdate(selectedConversation.id, e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="waiting_for_agent">Waiting for Agent</option>
                      <option value="handed_off">Handed Off</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      onClick={() => handleAgentHandoff(selectedConversation.id, 'agent-1')}
                      disabled={isHandingOff}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isHandingOff ? 'Handing off...' : 'Assign Agent'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a conversation from the list to start chatting
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