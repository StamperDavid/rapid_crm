import React, { useState, useEffect, useRef } from 'react';
import {
  ChatIcon,
  MailIcon,
  PhoneIcon,
  CameraIcon,
  ClockIcon,
  UserIcon,
  PaperClipIcon,
  FaceSmileIcon,
  MicrophoneIcon,
  PhoneIcon as PhoneIconSolid,
  VideoCameraIcon as VideoCameraIconSolid,
  CheckCircleIcon,
  ExclamationIcon,
  XIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  DotsVerticalIcon,
  PaperAirplaneIcon,
  DocumentIcon,
  LinkIcon
} from '@heroicons/react/outline';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'video' | 'audio';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  channel: 'chat' | 'email' | 'sms' | 'video';
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  unreadCount: number;
}

interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  labels: string[];
}

interface SMSThread {
  id: string;
  contactName: string;
  contactNumber: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  status: 'sent' | 'delivered' | 'failed';
}

const CommunicationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'email' | 'sms' | 'video' | 'history'>('chat');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [emailThreads, setEmailThreads] = useState<EmailThread[]>([]);
  const [smsThreads, setSmsThreads] = useState<SMSThread[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'unread'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCommunicationData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadCommunicationData = async () => {
    try {
      // Mock data - in real implementation, this would come from API
      const contactsData: Contact[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john@abctransport.com',
          phone: '+1-555-0123',
          status: 'online',
          lastSeen: 'now',
          unreadCount: 3
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@xyzlogistics.com',
          phone: '+1-555-0124',
          status: 'away',
          lastSeen: '5 minutes ago',
          unreadCount: 1
        },
        {
          id: '3',
          name: 'Mike Davis',
          email: 'mike@deffreight.com',
          phone: '+1-555-0125',
          status: 'busy',
          lastSeen: '1 hour ago',
          unreadCount: 0
        },
        {
          id: '4',
          name: 'Lisa Chen',
          email: 'lisa@ghishipping.com',
          phone: '+1-555-0126',
          status: 'offline',
          lastSeen: '2 hours ago',
          unreadCount: 2
        }
      ];

      const messagesData: Message[] = [
        {
          id: '1',
          senderId: '1',
          senderName: 'John Smith',
          content: 'Hey, I need help with the compliance report for Q4',
          timestamp: '2 minutes ago',
          type: 'text',
          status: 'read',
          channel: 'chat'
        },
        {
          id: '2',
          senderId: 'current',
          senderName: 'You',
          content: 'Sure! I can help you with that. What specific information do you need?',
          timestamp: '1 minute ago',
          type: 'text',
          status: 'delivered',
          channel: 'chat'
        },
        {
          id: '3',
          senderId: '1',
          senderName: 'John Smith',
          content: 'I need the DOT compliance checklist and safety training records',
          timestamp: '30 seconds ago',
          type: 'text',
          status: 'read',
          channel: 'chat'
        }
      ];

      const emailThreadsData: EmailThread[] = [
        {
          id: '1',
          subject: 'Q4 Compliance Report - Urgent',
          participants: ['john@abctransport.com', 'support@rapidcrm.com'],
          lastMessage: 'Please find the attached compliance report for your review.',
          timestamp: '1 hour ago',
          unread: true,
          priority: 'urgent',
          labels: ['compliance', 'urgent']
        },
        {
          id: '2',
          subject: 'Training Schedule Update',
          participants: ['sarah@xyzlogistics.com', 'training@rapidcrm.com'],
          lastMessage: 'The safety training session has been rescheduled to next week.',
          timestamp: '3 hours ago',
          unread: false,
          priority: 'normal',
          labels: ['training', 'schedule']
        }
      ];

      const smsThreadsData: SMSThread[] = [
        {
          id: '1',
          contactName: 'John Smith',
          contactNumber: '+1-555-0123',
          lastMessage: 'Thanks for the quick response!',
          timestamp: '5 minutes ago',
          unread: false,
          status: 'delivered'
        },
        {
          id: '2',
          contactName: 'Sarah Johnson',
          contactNumber: '+1-555-0124',
          lastMessage: 'Can you send me the training materials?',
          timestamp: '1 hour ago',
          unread: true,
          status: 'delivered'
        }
      ];

      setContacts(contactsData);
      setMessages(messagesData);
      setEmailThreads(emailThreadsData);
      setSmsThreads(smsThreadsData);
      setSelectedContact(contactsData[0]);
    } catch (error) {
      console.error('Error loading communication data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <ClockIcon className="h-4 w-4 text-gray-400" />;
      case 'delivered': return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'read': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current',
      senderName: 'You',
      content: newMessage,
      timestamp: 'now',
      type: 'text',
      status: 'sent',
      channel: 'chat'
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'online' && contact.status === 'online') ||
                         (filterStatus === 'unread' && contact.unreadCount > 0);
    return matchesSearch && matchesFilter;
  });

  const renderChatInterface = () => (
    <div className="flex h-[600px] bg-white rounded-lg shadow">
      {/* Contacts List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
            <button className="text-blue-600 hover:text-blue-800">
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex space-x-2 mb-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="unread">Unread</option>
            </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedContact?.id === contact.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(contact.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                    {contact.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                  <p className="text-xs text-gray-400">{contact.lastSeen}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedContact.status)}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-500">{selectedContact.status} • {selectedContact.lastSeen}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <PhoneIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <VideoCameraIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <DotsVerticalIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'current' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === 'current'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-between mt-1 text-xs ${
                      message.senderId === 'current' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{message.timestamp}</span>
                      {message.senderId === 'current' && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <PaperClipIcon className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <EmojiHappyIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <ChatIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select a contact to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEmailInterface = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Email Integration</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Compose</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {emailThreads.map((thread) => (
            <div key={thread.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{thread.subject}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(thread.priority)}`}>
                    {thread.priority}
                  </span>
                  {thread.unread && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{thread.lastMessage}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{thread.participants.join(', ')}</span>
                <span>{thread.timestamp}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {thread.labels.map((label, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSMSInterface = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">SMS Management</h3>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Send SMS</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {smsThreads.map((thread) => (
            <div key={thread.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{thread.contactName}</h4>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(thread.status)}
                  {thread.unread && (
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{thread.lastMessage}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{thread.contactNumber}</span>
                <span>{thread.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVideoInterface = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Call Integration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <VideoCameraIcon className="h-12 w-12 text-blue-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Start Video Call</h4>
            <p className="text-sm text-gray-600 mb-4">Start a video call with any contact</p>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Start Call
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <PhoneIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Voice Call</h4>
            <p className="text-sm text-gray-600 mb-4">Make a voice-only call</p>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Start Call
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <UsersIcon className="h-12 w-12 text-purple-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Group Call</h4>
            <p className="text-sm text-gray-600 mb-4">Start a group video call</p>
            <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              Start Group Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMessageHistory = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Message History</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Channels</option>
              <option>Chat</option>
              <option>Email</option>
              <option>SMS</option>
              <option>Video</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{message.senderName}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{message.channel}</span>
                </div>
                <span className="text-sm text-gray-500">{message.timestamp}</span>
              </div>
              <p className="text-sm text-gray-600">{message.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'chat', name: 'Real-time Chat', icon: ChatIcon },
              { id: 'email', name: 'Email Integration', icon: MailIcon },
              { id: 'sms', name: 'SMS Management', icon: PhoneIcon },
              { id: 'video', name: 'Video Calls', icon: VideoCameraIcon },
              { id: 'history', name: 'Message History', icon: ClockIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'chat' && renderChatInterface()}
      {activeTab === 'email' && renderEmailInterface()}
      {activeTab === 'sms' && renderSMSInterface()}
      {activeTab === 'video' && renderVideoInterface()}
      {activeTab === 'history' && renderMessageHistory()}
    </div>
  );
};

export default CommunicationHub;

