import React, { useState, useEffect } from 'react';
import {
  ChipIcon, ChartBarIcon, CogIcon, ExclamationIcon, CheckCircleIcon, RefreshIcon, PlayIcon,
  PauseIcon, EyeIcon, ShieldCheckIcon, GlobeAltIcon, UserIcon, SpeakerphoneIcon, ChatIcon,
  SparklesIcon, AcademicCapIcon, WrenchScrewdriverIcon, CodeBracketIcon
} from '@heroicons/react/outline';
import AICollaborationMonitor from '../components/AICollaborationMonitor';
import EnterpriseAIDashboard from '../components/EnterpriseAIDashboard';
import AdvancedAIAgentControlPanel from '../components/AdvancedAIAgentControlPanel';
import { ContinuousVoiceConversation } from '../components/ContinuousVoiceConversation';
import { aiDevelopmentCoordinator } from '../services/ai/AIDevelopmentCoordinator';
import { comprehensiveAIControlService } from '../services/ai/ComprehensiveAIControlService';
import { userAuthenticationService } from '../services/auth/UserAuthenticationService';
import { aiUserContextService } from '../services/ai/AIUserContextService';
import { dynamicPersonaService } from '../services/ai/DynamicPersonaService';
import UserLoginModal from '../components/UserLoginModal';

const AIAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<{
    errorRate: number;
    totalRequests: number;
    successfulRequests: number;
  } | null>(null);
  const [alerts, setAlerts] = useState<Array<{
    resolved: boolean;
  }>>([]);
  
  // NEW: Real-time business data
  const [workflowStats, setWorkflowStats] = useState<any>(null);
  const [paymentTransactions, setPaymentTransactions] = useState<any[]>([]);
  const [paymentProviders, setPaymentProviders] = useState<any>(null);
  const [onboardingSessions, setOnboardingSessions] = useState<any[]>([]);

  // Load real-time business data
  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        // Load workflow statistics
        const workflowRes = await fetch('http://localhost:3001/api/workflows/stats');
        if (workflowRes.ok) {
          const workflowData = await workflowRes.json();
          setWorkflowStats(workflowData);
        }

        // Load recent payment transactions
        const paymentsRes = await fetch('http://localhost:3001/api/payments/transactions?limit=10');
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPaymentTransactions(paymentsData.transactions || []);
        }

        // Load payment providers
        const providersRes = await fetch('http://localhost:3001/api/payments/providers');
        if (providersRes.ok) {
          const providersData = await providersRes.json();
          setPaymentProviders(providersData);
        }
      } catch (error) {
        console.error('Error loading business data:', error);
      }
    };

    loadBusinessData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadBusinessData, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', name: 'AI Overview', icon: ChartBarIcon },
    { id: 'agents', name: 'AI Agents', icon: ChipIcon },
    { id: 'monitoring', name: 'Monitoring', icon: EyeIcon },
    { id: 'configuration', name: 'Configuration', icon: CogIcon },
    { id: 'advanced', name: 'Advanced', icon: CogIcon },
  ];

  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    enabled: true,
    emotion: 'neutral',
    emphasis: 'normal',
    breathiness: 0.0,
    roughness: 0.0,
    stability: 0.75,
    clarity: 0.75,
    style: 'professional',
    accent: 'neutral',
    speakingStyle: 'conversational'
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  // AI Development Coordinator State
  const [developmentStatus, setDevelopmentStatus] = useState<{
    projectId: string | null;
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    activeAgents: number;
  } | null>(null);
  const [isDevelopmentActive, setIsDevelopmentActive] = useState(false);
  const [collaborationMessages, setCollaborationMessages] = useState<any[]>([]);
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<any>({ 
    name: 'Admin User', 
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin User',
    department: 'Administration',
    email: 'admin@rapidcrm.com' 
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userContext, setUserContext] = useState<any>(null);
  
  // AI Assistant Persona Configuration State
  const [aiPersonaConfig, setAiPersonaConfig] = useState({
    customGreeting: "Hello! I'm the Rapid CRM AI assistant. I'm intelligent and ready to help with development tasks, database issues, API endpoints, and AI collaboration. What would you like to work on?",
    greetingStyle: "professional",
    responseTone: "helpful",
    helpfulnessLevel: 8,
    detailLevel: 6,
    formalityLevel: 7,
    errorTemplate: "I apologize, but I encountered an issue. Let me help you resolve this.",
    successTemplate: "Great! I've successfully completed that task. What would you like to work on next?",
    enableRealAI: true,
    enableContextAwareness: true,
    enableLearning: false
  });

  // Dynamic Persona State
  const [currentPersona, setCurrentPersona] = useState(dynamicPersonaService.getCurrentPersona());
  const [learningMetrics, setLearningMetrics] = useState(dynamicPersonaService.getLearningMetrics());
  const [selectedCommunicationStyle, setSelectedCommunicationStyle] = useState(currentPersona.communicationStyle);
  const [selectedExpertiseFocus, setSelectedExpertiseFocus] = useState(currentPersona.expertiseFocus);
  const [learningRate, setLearningRate] = useState(currentPersona.learningRate);
  const [memoryRetention, setMemoryRetention] = useState(currentPersona.memoryRetention);
  const [showPersonaEditor, setShowPersonaEditor] = useState(false);
  const [customPersonaPrompt, setCustomPersonaPrompt] = useState('');
  
  const [voiceSamples, setVoiceSamples] = useState<{[key: string]: string}>({
    'Microsoft David Desktop': 'Hello, I am Microsoft David. I provide clear, professional speech for business communications.',
    'Microsoft Zira Desktop': 'Hi there! I am Microsoft Zira. I offer a friendly, approachable voice for customer interactions.',
    'Microsoft Mark Desktop': 'Greetings. I am Microsoft Mark. I deliver authoritative, confident speech for presentations.',
    'Google US English': 'Hello! I am Google US English. I provide natural, conversational speech with excellent clarity.',
    'Alex': 'Hi, I am Alex. I offer a warm, professional voice perfect for customer service and support.',
    'Samantha': 'Hello there! I am Samantha. I provide a clear, pleasant voice ideal for announcements and guidance.',
    'Victoria': 'Greetings! I am Victoria. I offer an elegant, sophisticated voice for premium customer experiences.',
    'Daniel': 'Hello, I am Daniel. I provide a confident, authoritative voice perfect for business communications.',
    'Moira': 'Hi! I am Moira. I offer a friendly, engaging voice great for interactive applications.',
    'Tessa': 'Hello! I am Tessa. I provide a clear, professional voice with excellent pronunciation.'
  });

  // Tooltip component for controls
  const Tooltip: React.FC<{ id: string; content: string; children: React.ReactNode }> = ({ id, content, children }) => (
    <div className="relative inline-block">
      {children}
      {showTooltip === id && (
        <div className="absolute z-50 w-80 p-3 mt-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg border border-gray-700">
          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45 border-l border-t border-gray-700"></div>
          {content}
          <button
            onClick={() => setShowTooltip(null)}
            className="absolute top-1 right-1 text-gray-400 hover:text-white"
          >
            �
          </button>
        </div>
      )}
    </div>
  );

  // Get unique English languages from available voices
  const getAvailableLanguages = () => {
    const languages = [...new Set(availableVoices.map(voice => voice.lang))];
    return languages.filter(lang => lang.startsWith('en')).sort();
  };

  // Get voices filtered by selected language
  const getFilteredVoices = () => {
    return availableVoices.filter(voice => voice.lang === selectedLanguage);
  };

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        if (voices.length > 0) {
          // Set default language to first English language or first available
          if (!selectedLanguage) {
            const englishLang = voices.find(voice => voice.lang.startsWith('en'))?.lang || voices[0].lang;
            setSelectedLanguage(englishLang);
          }
          
          // Set default voice if none selected
          if (!selectedVoice) {
            const englishVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
            if (englishVoice) {
              setSelectedVoice(englishVoice.name);
            }
          }
        }
      }
    };

    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    setTimeout(loadVoices, 100);
  }, [selectedVoice]);

  // Load development status
  useEffect(() => {
    const loadDevelopmentStatus = () => {
      const status = aiDevelopmentCoordinator.getProjectStatus();
      setDevelopmentStatus(status);
    };

    loadDevelopmentStatus();
    const interval = setInterval(loadDevelopmentStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Load collaboration messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messages = await aiDevelopmentCoordinator.getCollaborationMessages();
        setCollaborationMessages(messages);
      } catch (error) {
        console.error('Error loading collaboration messages:', error);
      }
    };

    if (isDevelopmentActive) {
      loadMessages();
      const interval = setInterval(loadMessages, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isDevelopmentActive]);

  // Load user authentication state
  useEffect(() => {
    const loadUserState = () => {
      const user = userAuthenticationService.getCurrentUser();
      const context = aiUserContextService.getCurrentContext();
      
      setCurrentUser(user);
      setUserContext(context);
      
      // Update AI persona config with personalized greeting
      if (user && context) {
        setAiPersonaConfig(prev => ({
          ...prev,
          customGreeting: context.personalizedGreeting
        }));
      }
    };

    loadUserState();
    
    // Check for user state changes every 5 seconds
    const interval = setInterval(loadUserState, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize dynamic persona service
  useEffect(() => {
    dynamicPersonaService.initialize();
    setCurrentPersona(dynamicPersonaService.getCurrentPersona());
    setLearningMetrics(dynamicPersonaService.getLearningMetrics());
  }, []);

  // Update learning metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLearningMetrics(dynamicPersonaService.getLearningMetrics());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <ChipIcon className="h-8 w-8 mr-3 text-purple-600" />
                AI Administration
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Comprehensive AI system management and monitoring
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentUser.fullName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser.department || 'Rapid CRM'}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {currentUser.firstName.charAt(0)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      userAuthenticationService.logout();
                      setCurrentUser(null);
                      setUserContext(null);
                    }}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Login
                </button>
              )}
              <button
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <RefreshIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* System Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Health Status */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            System Health
                          </dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">
                            {metrics ? (metrics.errorRate < 0.1 ? 'Healthy' : 'Warning') : 'Loading...'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Requests */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ChartBarIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Total Requests
                          </dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">
                            {metrics?.totalRequests || 0}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Rate */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Success Rate
                          </dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">
                            {metrics ? `${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%` : '0%'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Alerts */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ExclamationIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Active Alerts
                          </dt>
                          <dd className="text-lg font-medium text-gray-900 dark:text-white">
                            {alerts.filter(alert => !alert.resolved).length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* JASPER BUSINESS OPERATIONS MONITOR */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
                    Jasper's Business Operations Monitor
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Real-time • Updates every 30s</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Workflow Queue Status */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">📋 Workflow Queue</h4>
                    {workflowStats ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Pending:</span>
                          <span className="font-semibold text-yellow-600">{workflowStats.byStatus?.pending || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">In Progress:</span>
                          <span className="font-semibold text-blue-600">{workflowStats.byStatus?.in_progress || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                          <span className="font-semibold text-green-600">{workflowStats.byStatus?.completed || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Failed:</span>
                          <span className="font-semibold text-red-600">{workflowStats.byStatus?.failed || 0}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Loading...</p>
                    )}
                  </div>

                  {/* Payment System Status */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">💳 Payment System</h4>
                    {paymentProviders ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Active Provider:</span>
                          <span className="font-semibold text-blue-600">{paymentProviders.active}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Configured:</span>
                          <span className="font-semibold text-green-600">{paymentProviders.configured}/{paymentProviders.total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Recent Trans:</span>
                          <span className="font-semibold">{paymentTransactions.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Total Revenue:</span>
                          <span className="font-semibold text-green-600">
                            ${paymentTransactions.filter(t => t.status === 'succeeded').reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Loading...</p>
                    )}
                  </div>

                  {/* Automation Status */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">🤖 Automation Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">USDOT RPA:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Workflow Dispatcher:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Running
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Email Service:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Standby
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Onboarding Agent:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Ready
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions for Jasper */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <a 
                    href="http://localhost:3001/api/workflows/queue" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
                  >
                    View Workflows
                  </a>
                  <a 
                    href="http://localhost:3001/api/payments/transactions" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center text-sm font-medium"
                  >
                    View Payments
                  </a>
                  <a 
                    href="http://localhost:3001/api/workflows/stats" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center text-sm font-medium"
                  >
                    Queue Stats
                  </a>
                  <a 
                    href="http://localhost:3001/api/workflows/intervention-required" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center text-sm font-medium"
                  >
                    Needs Attention
                  </a>
                </div>
              </div>

              {/* Enterprise AI Dashboard */}
              <EnterpriseAIDashboard />
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="space-y-6">
              <AdvancedAIAgentControlPanel />
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI System Monitoring</h3>
                </div>
                <AICollaborationMonitor embedded={true} userChatHistory={[]} />
                <p className="text-gray-600 dark:text-gray-400">Monitor real-time AI-to-AI collaboration and system performance.</p>
              </div>
            </div>
          )}

          {activeTab === 'configuration' && (
            <div className="space-y-6">
              {/* AI Configuration */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default AI Provider
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google</option>
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
                </div>
              </div>

              {/* Enterprise Voice Settings */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Enterprise Voice Configuration</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                    <div className={`w-3 h-3 rounded-full ${voiceSettings.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {voiceSettings.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
                
                {/* Language & Voice Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <Tooltip 
                      id="language-selection" 
                      content="Select the primary language for voice synthesis. This determines which voice models and pronunciation rules are used. Different languages may have different voice quality and availability."
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        Language Selection
                        <button
                          onClick={() => setShowTooltip(showTooltip === 'language-selection' ? null : 'language-selection')}
                          className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ??
                        </button>
                      </label>
                    </Tooltip>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        setSelectedLanguage(e.target.value);
                        setSelectedVoice('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {getAvailableLanguages().map((lang) => (
                        <option key={lang} value={lang}>
                          {lang} ({availableVoices.filter(v => v.lang === lang).length} voices)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Tooltip 
                      id="voice-model" 
                      content="Choose the specific voice model. Each voice has unique characteristics including gender, age, accent, and speaking style. Premium voices offer higher quality and more natural speech patterns."
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        Voice Model
                        <button
                          onClick={() => setShowTooltip(showTooltip === 'voice-model' ? null : 'voice-model')}
                          className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ??
                        </button>
                      </label>
                    </Tooltip>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a voice...</option>
                      {getFilteredVoices().map((voice, index) => (
                        <option key={`${voice.name}-${voice.lang}-${index}`} value={voice.name}>
                          {voice.name} ({(voice as any).gender || 'Unknown'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advanced Voice Controls */}
                <div className="space-y-8">
                  {/* Basic Speech Parameters */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Basic Speech Parameters</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Tooltip 
                          id="speech-rate" 
                          content="Controls the speed of speech. Lower values create slower, more deliberate speech. Higher values create faster, more energetic speech. Range: 0.3x to 3.0x normal speed."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Speech Rate: {voiceSettings.rate.toFixed(1)}x
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'speech-rate' ? null : 'speech-rate')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ??
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.3" 
                          max="3.0" 
                          step="0.1" 
                          value={voiceSettings.rate} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Very Slow (0.3x)</span>
                          <span>Very Fast (3.0x)</span>
                        </div>
                      </div>

                      <div>
                        <Tooltip 
                          id="voice-pitch" 
                          content="Adjusts the fundamental frequency of the voice. Lower values create deeper, more authoritative tones. Higher values create brighter, more energetic tones. Range: 0.1 to 3.0."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Voice Pitch: {voiceSettings.pitch.toFixed(1)}
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'voice-pitch' ? null : 'voice-pitch')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ??
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.1" 
                          max="3.0" 
                          step="0.1" 
                          value={voiceSettings.pitch} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Deep (0.1)</span>
                          <span>High (3.0)</span>
                        </div>
                      </div>

                      <div>
                        <Tooltip 
                          id="volume-level" 
                          content="Controls the output volume level. This affects the loudness of the synthesized speech. Range: 0.0 (silent) to 1.0 (maximum volume)."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Volume: {Math.round(voiceSettings.volume * 100)}%
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'volume-level' ? null : 'volume-level')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ??
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="1.0" 
                          step="0.05" 
                          value={voiceSettings.volume} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Silent (0%)</span>
                          <span>Max (100%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Voice Characteristics */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Advanced Voice Characteristics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <Tooltip 
                          id="emotion-control" 
                          content="Controls the emotional tone of the voice. Different emotions affect intonation, rhythm, and emphasis. Use 'neutral' for business communications, 'friendly' for customer service, 'authoritative' for announcements."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Emotion
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'emotion-control' ? null : 'emotion-control')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ??
                            </button>
                          </label>
                        </Tooltip>
                        <select
                          value={voiceSettings.emotion}
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, emotion: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="neutral">Neutral</option>
                          <option value="friendly">Friendly</option>
                          <option value="authoritative">Authoritative</option>
                          <option value="calm">Calm</option>
                          <option value="energetic">Energetic</option>
                          <option value="professional">Professional</option>
                        </select>
                      </div>

                      <div>
                        <Tooltip 
                          id="speaking-style" 
                          content="Defines the overall speaking approach. 'Conversational' is natural and engaging, 'Formal' is structured and professional, 'Casual' is relaxed and friendly, 'Presentation' is clear and authoritative."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Speaking Style
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'speaking-style' ? null : 'speaking-style')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ??
                            </button>
                          </label>
                        </Tooltip>
                        <select
                          value={voiceSettings.speakingStyle}
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, speakingStyle: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="conversational">Conversational</option>
                          <option value="formal">Formal</option>
                          <option value="casual">Casual</option>
                          <option value="presentation">Presentation</option>
                          <option value="instructional">Instructional</option>
                        </select>
                      </div>

                      <div>
                        <Tooltip 
                          id="emphasis-level" 
                          content="Controls how much emphasis is placed on important words and phrases. 'Normal' provides standard emphasis, 'High' adds more dramatic emphasis, 'Low' creates subtle emphasis."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Emphasis Level
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'emphasis-level' ? null : 'emphasis-level')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ??
                            </button>
                          </label>
                        </Tooltip>
                        <select
                          value={voiceSettings.emphasis}
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, emphasis: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div>
                        <Tooltip 
                          id="voice-style" 
                          content="Overall voice personality and approach. 'Professional' is business-appropriate, 'Friendly' is warm and approachable, 'Authoritative' is confident and commanding, 'Neutral' is balanced."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Voice Style
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'voice-style' ? null : 'voice-style')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ??
                            </button>
                          </label>
                        </Tooltip>
                        <select
                          value={voiceSettings.style}
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, style: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="professional">Professional</option>
                          <option value="friendly">Friendly</option>
                          <option value="authoritative">Authoritative</option>
                          <option value="neutral">Neutral</option>
                          <option value="warm">Warm</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Voice Quality Controls */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Voice Quality & Clarity</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <Tooltip 
                          id="stability" 
                          content="Controls voice consistency and stability. Higher values provide more consistent, predictable speech patterns. Lower values allow for more natural variation but may be less consistent."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Stability: {Math.round(voiceSettings.stability * 100)}%
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'stability' ? null : 'stability')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ??
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="1.0" 
                          step="0.05" 
                          value={voiceSettings.stability} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, stability: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Variable (0%)</span>
                          <span>Stable (100%)</span>
                        </div>
                      </div>

                      <div>
                        <Tooltip 
                          id="clarity" 
                          content="Controls speech clarity and pronunciation precision. Higher values ensure clearer, more precise pronunciation. Lower values may sound more natural but less clear."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Clarity: {Math.round(voiceSettings.clarity * 100)}%
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'clarity' ? null : 'clarity')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ??
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="1.0" 
                          step="0.05" 
                          value={voiceSettings.clarity} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, clarity: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Natural (0%)</span>
                          <span>Clear (100%)</span>
                        </div>
                      </div>

                      <div>
                        <Tooltip 
                          id="breathiness" 
                          content="Adds subtle breathy quality to the voice. Higher values create a softer, more intimate sound. Lower values produce a cleaner, more direct sound. Use sparingly for professional settings."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Breathiness: {Math.round(voiceSettings.breathiness * 100)}%
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'breathiness' ? null : 'breathiness')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ??
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="1.0" 
                          step="0.05" 
                          value={voiceSettings.breathiness} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, breathiness: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Clean (0%)</span>
                          <span>Breathy (100%)</span>
                        </div>
                      </div>

                      <div>
                        <Tooltip 
                          id="roughness" 
                          content="Adds subtle roughness or texture to the voice. Higher values create a more textured, distinctive sound. Lower values produce a smoother, more polished sound."
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            Roughness: {Math.round(voiceSettings.roughness * 100)}%
                            <button
                              onClick={() => setShowTooltip(showTooltip === 'roughness' ? null : 'roughness')}
                              className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              ??
                            </button>
                          </label>
                        </Tooltip>
                        <input 
                          type="range" 
                          min="0.0" 
                          max="1.0" 
                          step="0.05" 
                          value={voiceSettings.roughness} 
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))} 
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Smooth (0%)</span>
                          <span>Rough (100%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enterprise Voice Presets */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <Tooltip 
                      id="voice-presets" 
                      content="Pre-configured voice settings optimized for different business scenarios. Each preset combines multiple voice parameters to achieve specific communication goals. Click any preset to apply those settings instantly."
                    >
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        Enterprise Voice Presets
                        <button
                          onClick={() => setShowTooltip(showTooltip === 'voice-presets' ? null : 'voice-presets')}
                          className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ??
                        </button>
                      </h4>
                    </Tooltip>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button
                        onClick={() => setVoiceSettings({ 
                          rate: 0.9, pitch: 0.9, volume: 0.8, enabled: true,
                          emotion: 'professional', emphasis: 'normal', breathiness: 0.0, roughness: 0.0,
                          stability: 0.9, clarity: 0.9, style: 'professional', accent: 'neutral', speakingStyle: 'formal'
                        })}
                        className="p-4 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <div className="font-medium text-sm mb-1">Executive</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Authoritative, clear, professional tone for leadership communications</div>
                      </button>
                      <button
                        onClick={() => setVoiceSettings({ 
                          rate: 1.0, pitch: 1.0, volume: 0.8, enabled: true,
                          emotion: 'friendly', emphasis: 'normal', breathiness: 0.1, roughness: 0.0,
                          stability: 0.8, clarity: 0.8, style: 'friendly', accent: 'neutral', speakingStyle: 'conversational'
                        })}
                        className="p-4 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <div className="font-medium text-sm mb-1">Customer Service</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Warm, approachable voice for customer interactions and support</div>
                      </button>
                      <button
                        onClick={() => setVoiceSettings({ 
                          rate: 0.8, pitch: 0.8, volume: 0.7, enabled: true,
                          emotion: 'calm', emphasis: 'low', breathiness: 0.0, roughness: 0.0,
                          stability: 0.9, clarity: 0.9, style: 'neutral', accent: 'neutral', speakingStyle: 'instructional'
                        })}
                        className="p-4 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <div className="font-medium text-sm mb-1">Training</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Clear, measured pace for educational content and training materials</div>
                      </button>
                      <button
                        onClick={() => setVoiceSettings({ 
                          rate: 1.1, pitch: 1.1, volume: 0.9, enabled: true,
                          emotion: 'energetic', emphasis: 'high', breathiness: 0.0, roughness: 0.1,
                          stability: 0.7, clarity: 0.8, style: 'authoritative', accent: 'neutral', speakingStyle: 'presentation'
                        })}
                        className="p-4 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <div className="font-medium text-sm mb-1">Marketing</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Dynamic, engaging voice for promotional content and announcements</div>
                      </button>
                    </div>
                  </div>

                  {/* Voice Control Actions */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Tooltip 
                          id="enable-voice" 
                          content="Master switch for AI voice functionality. When enabled, the AI assistant will use voice synthesis for responses. When disabled, the AI will only provide text responses. This setting affects all voice interactions across the system."
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={voiceSettings.enabled}
                              onChange={(e) => setVoiceSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                              className="mr-3"
                            />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                              Enable AI Voice
                              <button
                                onClick={() => setShowTooltip(showTooltip === 'enable-voice' ? null : 'enable-voice')}
                                className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                ??
                              </button>
                            </label>
                          </div>
                        </Tooltip>
                      </div>
                      
                      <div className="flex space-x-3">
                        <div className="flex items-center space-x-2">
                          <Tooltip 
                            id="test-voice" 
                            content="Test the current voice configuration with a comprehensive sample. This will speak a test phrase using all your current voice settings including rate, pitch, volume, emotion, and style. Use this to verify your configuration before deploying."
                          >
                            <button
                              onClick={() => {
                                if ('speechSynthesis' in window && selectedVoice) {
                                  const voice = getFilteredVoices().find(v => v.name === selectedVoice);
                                  if (voice) {
                                    const utterance = new SpeechSynthesisUtterance('Hello! This is a comprehensive test of my enterprise voice capabilities. I can speak with various tones, speeds, and volumes to match your business needs. My current configuration includes professional-grade voice synthesis with advanced emotional and stylistic controls.');
                                    utterance.voice = voice;
                                    utterance.rate = voiceSettings.rate;
                                    utterance.pitch = voiceSettings.pitch;
                                    utterance.volume = voiceSettings.volume;
                                    speechSynthesis.speak(utterance);
                                  }
                                }
                              }}
                              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center"
                            >
                              <SpeakerphoneIcon className="h-4 w-4 mr-2" />
                              Test Voice
                            </button>
                          </Tooltip>
                          <button
                            onClick={() => setShowTooltip(showTooltip === 'test-voice' ? null : 'test-voice')}
                            className="w-4 h-4 text-purple-400 hover:text-purple-600"
                            title="Voice test information"
                          >
                            ??
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Tooltip 
                            id="stop-voice" 
                            content="Immediately stops any currently playing voice synthesis. Use this to interrupt voice output if needed. This will cancel all active speech synthesis across the system."
                          >
                            <button
                              onClick={() => {
                                if ('speechSynthesis' in window) {
                                  speechSynthesis.cancel();
                                }
                              }}
                              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                            >
                              Stop
                            </button>
                          </Tooltip>
                          <button
                            onClick={() => setShowTooltip(showTooltip === 'stop-voice' ? null : 'stop-voice')}
                            className="w-4 h-4 text-gray-400 hover:text-gray-600"
                            title="Stop voice information"
                          >
                            ??
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Master AI Control Panel */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Master AI Control Panel</h2>
                    <p className="text-purple-100">Truly intelligent AI with dynamic persona management and learning capabilities</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-purple-100">AI Intelligence Level</div>
                      <div className="text-lg font-semibold">?? Adaptive</div>
                    </div>
                    <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                      <RefreshIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Persona Management */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Dynamic Persona Management
                </h3>
                
                {/* Current Persona Display */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Current AI Persona</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900 dark:text-white">System Prompt</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const persona = dynamicPersonaService.getCurrentPersona();
                            const systemPrompt = dynamicPersonaService.getSystemPrompt();
                            navigator.clipboard.writeText(systemPrompt);
                            alert('Persona copied to clipboard!');
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Copy to Clipboard
                        </button>
                        <button
                          onClick={() => setShowPersonaEditor(!showPersonaEditor)}
                          className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          {showPersonaEditor ? 'Hide Editor' : 'Edit Persona'}
                        </button>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded border p-3 max-h-64 overflow-y-auto">
                      <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                        {dynamicPersonaService.getSystemPrompt()}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Persona Editor */}
                {showPersonaEditor && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Edit AI Persona</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Custom System Prompt
                        </label>
                        <textarea
                          value={customPersonaPrompt}
                          onChange={(e) => setCustomPersonaPrompt(e.target.value)}
                          className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                          placeholder="Enter your custom system prompt here..."
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // Apply custom persona
                            dynamicPersonaService.updatePersona({
                              name: 'Custom Persona',
                              description: 'Custom AI persona with user-defined system prompt',
                              customPrompt: customPersonaPrompt
                            } as any);
                            setCurrentPersona(dynamicPersonaService.getCurrentPersona());
                            alert('Custom persona applied successfully!');
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Apply Custom Persona
                        </button>
                        <button
                          onClick={() => {
                            setCustomPersonaPrompt(dynamicPersonaService.getSystemPrompt());
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Load Current Persona
                        </button>
                        <button
                          onClick={() => {
                            setCustomPersonaPrompt('');
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Current AI Personality</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">Intelligence Mode</span>
                          <span className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">Adaptive</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Truly intelligent AI with dynamic persona management and learning capabilities
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Learning Rate</div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">High</div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Adaptability</div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">Dynamic</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Persona Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Communication Style
                        </label>
                        <select 
                          value={selectedCommunicationStyle}
                          onChange={(e) => setSelectedCommunicationStyle(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="intelligent">Intelligent & Adaptive</option>
                          <option value="professional">Professional & Formal</option>
                          <option value="friendly">Friendly & Casual</option>
                          <option value="creative">Creative & Innovative</option>
                          <option value="analytical">Analytical & Technical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Expertise Focus
                        </label>
                        <select 
                          value={selectedExpertiseFocus}
                          onChange={(e) => setSelectedExpertiseFocus(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="general">General Intelligence</option>
                          <option value="business">Business & Strategy</option>
                          <option value="technical">Technical & Development</option>
                          <option value="creative">Creative & Design</option>
                          <option value="analytical">Analytical & Research</option>
                        </select>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            dynamicPersonaService.updatePersona({
                              communicationStyle: selectedCommunicationStyle,
                              expertiseFocus: selectedExpertiseFocus
                            });
                            setCurrentPersona(dynamicPersonaService.getCurrentPersona());
                          }}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          Apply Changes
                        </button>
                        <button 
                          onClick={() => {
                            dynamicPersonaService.switchPersona('adaptive-intelligent');
                            setCurrentPersona(dynamicPersonaService.getCurrentPersona());
                            setSelectedCommunicationStyle('intelligent');
                            setSelectedExpertiseFocus('general');
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Reset to Default
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Learning & Adaptation */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <AcademicCapIcon className="h-5 w-5 mr-2 text-purple-600" />
                  AI Learning & Adaptation Engine
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Learning Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Continuous Learning</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Memory Formation</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{learningMetrics.memoryFormation.toLocaleString()} interactions</div>
                        </div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Adaptation Rate</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{(learningMetrics.adaptationRate * 100).toFixed(1)}% improvement</div>
                        </div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Learning Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Learning Rate: High
                        </label>
                        <input 
                          type="range" 
                          min="0.1" 
                          max="1.0" 
                          step="0.1" 
                          value={learningRate}
                          onChange={(e) => {
                            const newRate = parseFloat(e.target.value);
                            setLearningRate(newRate);
                            dynamicPersonaService.updateLearningRate(newRate);
                          }}
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Slow (0.1)</span>
                          <span>Fast (1.0)</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Memory Retention: 30 days
                        </label>
                        <input 
                          type="range" 
                          min="1" 
                          max="365" 
                          step="1" 
                          value={memoryRetention}
                          onChange={(e) => {
                            const newRetention = parseInt(e.target.value);
                            setMemoryRetention(newRetention);
                            dynamicPersonaService.updateMemoryRetention(newRetention);
                          }}
                          className="w-full" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1 day</span>
                          <span>1 year</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Enable Learning</span>
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          onChange={(e) => dynamicPersonaService.setLearningEnabled(e.target.checked)}
                          className="h-4 w-4 text-purple-600" 
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Performance Metrics</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Response Quality</span>
                          <span className="font-medium">{(learningMetrics.responseQuality * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: `${learningMetrics.responseQuality * 100}%`}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Learning Efficiency</span>
                          <span className="font-medium">{(learningMetrics.learningEfficiency * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: `${learningMetrics.learningEfficiency * 100}%`}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Adaptation Speed</span>
                          <span className="font-medium">{(learningMetrics.adaptationRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: `${learningMetrics.adaptationRate * 100}%`}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Development Coordinator */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <ChipIcon className="h-5 w-5 mr-2 text-purple-600" />
                  AI Development Coordinator
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Development Status</h4>
                    {developmentStatus ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Progress</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{developmentStatus.progressPercentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                              style={{width: `${developmentStatus.progressPercentage}%`}}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{developmentStatus.completedTasks} completed</span>
                            <span>{developmentStatus.totalTasks} total tasks</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-sm text-blue-600 dark:text-blue-300">Active Agents</div>
                            <div className="text-lg font-bold text-blue-900 dark:text-blue-200">{developmentStatus.activeAgents}</div>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-sm text-green-600 dark:text-green-300">Project ID</div>
                            <div className="text-xs font-mono text-green-900 dark:text-green-200 truncate">
                              {developmentStatus.projectId || 'None'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <div className="text-gray-500 dark:text-gray-400">No active development project</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">AI-to-AI Development</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                        <div className="font-medium text-gray-900 dark:text-white mb-2">?? Accelerated Development</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Leverage AI-to-AI collaboration to build the comprehensive control panel with specialized agents working in parallel.
                        </div>
                        <button
                          onClick={async () => {
                            if (!isDevelopmentActive) {
                              setIsDevelopmentActive(true);
                              const result = await aiDevelopmentCoordinator.startComprehensiveAIControlProject();
                              if (result.success) {
                                console.log('AI development project started successfully');
                              } else {
                                console.error('Failed to start AI development project:', result.error);
                                setIsDevelopmentActive(false);
                              }
                            }
                          }}
                          disabled={isDevelopmentActive}
                          className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                            isDevelopmentActive
                              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                          }`}
                        >
                          {isDevelopmentActive ? 'Development in Progress...' : 'Start AI Development Project'}
                        </button>
                      </div>
                      {isDevelopmentActive && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">AI Agents Working</span>
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-300">
                            Specialized AI agents are collaborating to build your comprehensive control panel
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {isDevelopmentActive && collaborationMessages.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">AI Collaboration Messages</h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {collaborationMessages.slice(-10).map((message, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {message.from_ai} ? {message.to_ai}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {message.content}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Type: {message.message_type} | Status: {message.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Provider Configuration */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <CogIcon className="h-5 w-5 mr-2 text-purple-600" />
                  AI Provider Configuration
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Primary AI Provider
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
                        Fallback Provider
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="anthropic">Anthropic Claude</option>
                        <option value="openai">OpenAI GPT-4</option>
                        <option value="google">Google Gemini</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-200">Connection Status</div>
                        <div className="text-xs text-green-600 dark:text-green-300">All providers connected</div>
                      </div>
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-4">
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
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-200">API Usage</div>
                        <div className="text-xs text-blue-600 dark:text-blue-300">2,847 requests today</div>
                      </div>
                      <ChartBarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Knowledge Base Management */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <GlobeAltIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Knowledge Base Management
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white">Custom Driver Qualification Rules</h4>
                        <button className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
                          Add Rule
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">Fleet Size Rule</h5>
                            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">Active</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Companies with 10+ vehicles require USDOT number regardless of GVWR
                          </p>
                        </div>
                        <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">Custom Driver List</h5>
                            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">Active</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Driver qualification requirements supersede standard GVWR/passenger limits
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Knowledge Stats</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Rules:</span>
                          <span className="font-medium">47</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Active Rules:</span>
                          <span className="font-medium text-green-600">42</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                          <span className="font-medium">2 hours ago</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Upload Excel File
                    </button>
                  </div>
                </div>
              </div>

              {/* Agent Orchestration */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <ChipIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Agent Orchestration & Management
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Active Agents</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Onboarding Agent</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Handles new client onboarding</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Customer Service Agent</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Manages client support</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-blue-600">Active</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Compliance Agent</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Monitors regulatory compliance</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm text-yellow-600">Training</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Agent Performance</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Response Accuracy</span>
                          <span className="font-medium">94%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '94%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Client Satisfaction</span>
                          <span className="font-medium">87%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '87%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Task Completion</span>
                          <span className="font-medium">91%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: '91%'}}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                        Deploy New Agent
                      </button>
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                        Test All Agents
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voice & Communication */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <SpeakerphoneIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Voice & Communication Controls
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Continuous Voice Mode</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Gemini-Style Conversation</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Persistent microphone for back-and-forth dialogue</div>
                        </div>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                          Enable
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Auto-transcribe</span>
                          <input type="checkbox" defaultChecked className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Voice responses</span>
                          <input type="checkbox" defaultChecked className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Interrupt handling</span>
                          <input type="checkbox" defaultChecked className="h-4 w-4 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Voice Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Voice Model: {selectedVoice || 'Not selected'}
                        </label>
                        <select
                          value={selectedVoice}
                          onChange={(e) => setSelectedVoice(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select a voice...</option>
                          {getFilteredVoices().map((voice, index) => (
                            <option key={`${voice.name}-${voice.lang}-${index}`} value={voice.name}>
                              {voice.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rate: {voiceSettings.rate.toFixed(1)}x
                          </label>
                          <input 
                            type="range" 
                            min="0.3" 
                            max="3.0" 
                            step="0.1" 
                            value={voiceSettings.rate} 
                            onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))} 
                            className="w-full" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Volume: {Math.round(voiceSettings.volume * 100)}%
                          </label>
                          <input 
                            type="range" 
                            min="0.0" 
                            max="1.0" 
                            step="0.05" 
                            value={voiceSettings.volume} 
                            onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))} 
                            className="w-full" 
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            if ('speechSynthesis' in window && selectedVoice) {
                              const voice = getFilteredVoices().find(v => v.name === selectedVoice);
                              if (voice) {
                                const utterance = new SpeechSynthesisUtterance('Hello! This is a test of the advanced voice configuration system.');
                                utterance.voice = voice;
                                utterance.rate = voiceSettings.rate;
                                utterance.volume = voiceSettings.volume;
                                speechSynthesis.speak(utterance);
                              }
                            }
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Test Voice
                        </button>
                        <button 
                          onClick={() => {
                            if ('speechSynthesis' in window) {
                              speechSynthesis.cancel();
                            }
                          }}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Stop
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Monitoring */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Real-Time Performance Monitoring
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-blue-900 dark:text-blue-200">Response Time</h5>
                      <ChartBarIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">1.2s</div>
                    <div className="text-sm text-blue-600 dark:text-blue-300">Avg response time</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-green-900 dark:text-green-200">Success Rate</h5>
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-200">98.7%</div>
                    <div className="text-sm text-green-600 dark:text-green-300">Task completion</div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-purple-900 dark:text-purple-200">Active Agents</h5>
                      <ChipIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">12</div>
                    <div className="text-sm text-purple-600 dark:text-purple-300">Currently running</div>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-yellow-900 dark:text-yellow-200">Learning Score</h5>
                      <GlobeAltIcon className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">94.2</div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-300">Intelligence rating</div>
                  </div>
                </div>
              </div>

              {/* Business Intelligence */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <EyeIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Business Intelligence & Competitor Analysis
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Competitor Monitoring</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Competitor A</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Last checked: 2 hours ago</div>
                        </div>
                        <div className="text-sm text-green-600">? 3% pricing</div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Competitor B</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Last checked: 1 hour ago</div>
                        </div>
                        <div className="text-sm text-red-600">? 5% pricing</div>
                      </div>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Update Competitor Data
                    </button>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Content Generation</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Blog Posts</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">3 scheduled for this week</div>
                        </div>
                        <button className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                          Generate
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Social Media</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">5 posts ready for review</div>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                          Review
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Email Campaigns</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">2 campaigns in progress</div>
                        </div>
                        <button className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Master Controls */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Master System Controls
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">System Operations</h4>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Start All Agents
                      </button>
                      <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                        Pause All Agents
                      </button>
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Emergency Stop
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">Data Management</h4>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Backup Knowledge Base
                      </button>
                      <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                        Export Agent Configs
                      </button>
                      <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                        System Diagnostics
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">Advanced Features</h4>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        AI Self-Improvement
                      </button>
                      <button className="w-full px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700">
                        Deploy New Agent
                      </button>
                      <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                        Performance Optimization
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Login Modal */}
      <UserLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={(user) => {
          setCurrentUser(user);
          setShowLoginModal(false);
        }}
      />
    </div>
  );
};

export default AIAdminPage;
