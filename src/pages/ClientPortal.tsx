import React, { useState, useEffect, useRef } from 'react';
import {
  UserIcon,
  OfficeBuildingIcon,
  DocumentTextIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChatIcon,
  MicrophoneIcon,
  SpeakerphoneIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ExclamationIcon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
  LocationMarkerIcon,
} from '@heroicons/react/outline';
import { aiIntegrationService } from '../services/ai/AIIntegrationService';
import { advancedAICustomizationService } from '../services/ai';

interface ClientData {
  companyName: string;
  clientName: string;
  usdotNumber: string;
  mcNumber: string;
  businessAddress: string;
  phone: string;
  email: string;
  complianceStatus: 'compliant' | 'warning' | 'non-compliant';
  renewalDates: {
    usdot: string;
    mc: string;
    insurance: string;
  };
  violations: Array<{
    type: string;
    date: string;
    status: string;
  }>;
  lastLogin: string;
}

interface OnboardingAgent {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  currentStep: number;
  totalSteps: number;
  messages: Array<{
    id: string;
    type: 'agent' | 'user';
    content: string;
    timestamp: Date;
  }>;
}

const ClientPortal: React.FC = () => {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [portalSettings, setPortalSettings] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [onboardingAgent, setOnboardingAgent] = useState<OnboardingAgent>({
    isActive: true,
    isListening: false,
    isSpeaking: false,
    currentStep: 1,
    totalSteps: 5,
    messages: [
      {
        id: '1',
        type: 'agent',
        content: 'Welcome to your Rapid CRM client portal! I\'m your onboarding assistant. I\'ll help you get familiar with your dashboard and guide you through the key features.',
        timestamp: new Date()
      }
    ]
  });

  const [newMessage, setNewMessage] = useState('');
  const [showComplianceDetails, setShowComplianceDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);

  // Load client portal data
  useEffect(() => {
    const loadClientPortalData = async () => {
      try {
        // Load portal settings
        const settingsResponse = await fetch('/api/client-portal/settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setPortalSettings(settingsData.settings);
        }

        // Create client session
        const sessionResponse = await fetch('/api/client-portal/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: 1,
            client_name: 'Demo Client',
            client_email: 'demo@client.com',
            ip_address: '127.0.0.1',
            user_agent: navigator.userAgent
          })
        });
        
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setSessionId(sessionData.sessionId);
        }

        // Load client data (for now using mock data, but connected to session)
        setClientData({
          companyName: 'Acme Transportation LLC',
          clientName: 'John Smith',
          usdotNumber: '123456',
          mcNumber: 'MC-789012',
          businessAddress: '123 Main Street, Anytown, ST 12345',
          phone: '(555) 123-4567',
          email: 'john@acmetrans.com',
          complianceStatus: 'warning',
          renewalDates: {
            usdot: '2024-06-15',
            mc: '2024-08-20',
            insurance: '2024-12-01'
          },
          violations: [
            {
              type: 'Hours of Service',
              date: '2024-01-15',
              status: 'Resolved'
            }
          ],
          lastLogin: new Date().toLocaleString()
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading client portal data:', error);
        setLoading(false);
      }
    };

    loadClientPortalData();
  }, []);

  // Test voice function
  const handleTestVoice = () => {
    const testMessage = "Hello! This is your Rapid CRM onboarding assistant. I'm here to help you navigate your client portal and answer any questions you might have about your transportation business.";
    speakMessage(testMessage);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && !isProcessing && sessionId) {
      const userMessage = {
        id: Date.now().toString(),
        type: 'user' as const,
        content: newMessage,
        timestamp: new Date()
      };

      setOnboardingAgent(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }));

      // Save user message to database
      try {
        await fetch('/api/client-portal/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            message_type: 'user',
            content: newMessage,
            metadata: { timestamp: new Date().toISOString() }
          })
        });
      } catch (error) {
        console.error('Error saving user message:', error);
      }

      setIsProcessing(true);
      setNewMessage('');

      try {
        // Create context for the AI about the client and their portal
        const context = {
          clientData,
          currentStep: onboardingAgent.currentStep,
          totalSteps: onboardingAgent.totalSteps,
          portalType: 'client_onboarding',
          userRole: 'client'
        };

        // Get AI response using the real AI service
        const response = await aiIntegrationService.processMessage(
          newMessage,
          context,
          'onboarding_assistant'
        );

        const agentResponse = {
          id: (Date.now() + 1).toString(),
          type: 'agent' as const,
          content: response.content,
          timestamp: new Date()
        };

        setOnboardingAgent(prev => ({
          ...prev,
          messages: [...prev.messages, agentResponse],
          currentStep: response.nextStep || prev.currentStep
        }));

        // Save agent response to database
        try {
          await fetch('/api/client-portal/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              message_type: 'agent',
              content: response.content,
              metadata: { 
                timestamp: new Date().toISOString(),
                nextStep: response.nextStep,
                confidence: response.confidence || 0.8
              }
            })
          });
        } catch (error) {
          console.error('Error saving agent message:', error);
        }

        // Speak the response if voice is enabled
        if (onboardingAgent.isActive) {
          speakMessage(response.content);
        }

      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorResponse = {
          id: (Date.now() + 1).toString(),
          type: 'agent' as const,
          content: 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact support if the issue persists.',
          timestamp: new Date()
        };

        setOnboardingAgent(prev => ({
          ...prev,
          messages: [...prev.messages, errorResponse]
        }));
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Speech synthesis function
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onstart = () => {
        setOnboardingAgent(prev => ({ ...prev, isSpeaking: true }));
      };
      
      utterance.onend = () => {
        setOnboardingAgent(prev => ({ ...prev, isSpeaking: false }));
      };
      
      utterance.onerror = () => {
        setOnboardingAgent(prev => ({ ...prev, isSpeaking: false }));
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(transcript);
        setOnboardingAgent(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current.onerror = () => {
        setOnboardingAgent(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current.onend = () => {
        setOnboardingAgent(prev => ({ ...prev, isListening: false }));
      };
    }
  }, []);

  // Handle voice toggle with real speech recognition
  const handleVoiceToggle = () => {
    if (onboardingAgent.isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setOnboardingAgent(prev => ({ ...prev, isListening: false }));
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setOnboardingAgent(prev => ({ ...prev, isListening: true }));
      }
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'non-compliant': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getComplianceStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircleIcon className="h-5 w-5" />;
      case 'warning': return <ExclamationIcon className="h-5 w-5" />;
      case 'non-compliant': return <ExclamationIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading client portal...</p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load client portal data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RC</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {portalSettings?.portal_name || 'Rapid CRM Client Portal'}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Welcome back, {clientData.clientName}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Last login: {clientData.lastLogin}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Welcome to Your Dashboard
                </h2>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getComplianceStatusColor(clientData.complianceStatus)}`}>
                  {getComplianceStatusIcon(clientData.complianceStatus)}
                  <span className="ml-2 capitalize">{clientData.complianceStatus}</span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Hello {clientData.clientName}! Welcome to your Rapid CRM client portal. 
                Here you can view your company information, compliance status, and get assistance with any questions.
              </p>
            </div>

            {/* Company Information */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <OfficeBuildingIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {clientData.companyName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Company Name
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        USDOT: {clientData.usdotNumber}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        USDOT Number
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <TruckIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        MC: {clientData.mcNumber}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        MC Number
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <LocationMarkerIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {clientData.businessAddress}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Business Address
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {clientData.phone}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Phone Number
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {clientData.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Email Address
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Center */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Compliance Center
                </h3>
                <button
                  onClick={() => setShowComplianceDetails(!showComplianceDetails)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {showComplianceDetails ? 'Hide Details' : 'View Details'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    USDOT Renewal
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {clientData.renewalDates.usdot}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    MC Renewal
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {clientData.renewalDates.mc}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Insurance Renewal
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {clientData.renewalDates.insurance}
                  </div>
                </div>
              </div>

              {showComplianceDetails && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Recent Violations
                  </h4>
                  {clientData.violations.length > 0 ? (
                    <div className="space-y-2">
                      {clientData.violations.map((violation, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {violation.type}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Date: {violation.date}
                            </div>
                          </div>
                          <span className="text-sm text-green-600 dark:text-green-400">
                            {violation.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No recent violations
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Onboarding Agent Sidebar */}
          <div className="space-y-6">
            {/* Agent Status */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Onboarding Assistant
                </h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${onboardingAgent.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {onboardingAgent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{onboardingAgent.currentStep} of {onboardingAgent.totalSteps}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(onboardingAgent.currentStep / onboardingAgent.totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleVoiceToggle}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    onboardingAgent.isListening
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  }`}
                >
                  {onboardingAgent.isListening ? (
                    <PauseIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <MicrophoneIcon className="h-4 w-4 mr-1" />
                  )}
                  {onboardingAgent.isListening ? 'Stop Listening' : 'Start Voice'}
                </button>
                
                <button
                  onClick={handleTestVoice}
                  className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <SpeakerphoneIcon className="h-4 w-4 mr-1" />
                  Test Voice
                </button>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                Chat with Assistant
              </h4>
              
              {/* Messages */}
              <div className="h-64 overflow-y-auto mb-4 space-y-3">
                {onboardingAgent.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {/* Processing indicator */}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Assistant is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isProcessing || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;
