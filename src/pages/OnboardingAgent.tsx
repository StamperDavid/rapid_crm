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
  ExclamationTriangleIcon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/outline';
import { onboardingAgentService, USDOTApplicationData, OnboardingContext } from '../services/ai/OnboardingAgentService';
import { agentHandoffService, HandoffContext } from '../services/ai/AgentHandoffService';

const OnboardingAgent: React.FC = () => {
  const [applicationData, setApplicationData] = useState<USDOTApplicationData>({
    legalBusinessName: '',
    businessType: 'llc',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    contactPerson: {
      firstName: '',
      lastName: '',
      title: '',
      phone: '',
      email: ''
    },
    operationType: 'private',
    cargoType: [],
    operationRadius: 'intrastate',
    vehicleCount: 0,
    driverCount: 0,
    vehicles: [],
    requiredRegistrations: [],
    requiresAuthority: false,
    totalCost: 0,
    breakdown: {
      usdot: 0,
      compliance: 0,
      processing: 0
    },
    paymentMethod: undefined,
    paymentProcessed: false,
    currentStep: 1,
    totalSteps: 10,
    completedSteps: [],
    status: 'collecting_data'
  });

  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'user' | 'agent';
    content: string;
    timestamp: Date;
  }>>([
    {
      id: '1',
      type: 'agent',
      content: 'Welcome to Rapid Compliance! I\'m your USDOT application assistant. I\'ll help you complete your USDOT application and determine what compliance requirements apply to your transportation business. Let\'s get started!',
      timestamp: new Date()
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [handoffComplete, setHandoffComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [escalationRequested, setEscalationRequested] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('jasper');
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const response = await fetch('/api/client-portal/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: 1,
            client_name: 'Onboarding Client',
            client_email: 'onboarding@client.com',
            ip_address: '127.0.0.1',
            user_agent: navigator.userAgent
          })
        });
        
        if (response.ok) {
          const sessionData = await response.json();
          setSessionId(sessionData.sessionId);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };

    initializeSession();
  }, []);

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/ai/voices');
        const data = await response.json();
        if (data.success) {
          setAvailableVoices(data.voices);
          // Set Jasper as default if available
          const jasperVoice = data.voices.find((voice: any) => 
            voice.name.toLowerCase().includes('jasper') || 
            voice.id.toLowerCase().includes('jasper')
          );
          if (jasperVoice) {
            setSelectedVoice(jasperVoice.id);
          } else if (data.voices.length > 0) {
            setSelectedVoice(data.voices[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading voices:', error);
      }
    };
    loadVoices();
  }, []);

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
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Check for escalation requests and handle handoffs to human agents
  const checkForEscalationRequest = (message: string): boolean => {
    const escalationKeywords = [
      'human', 'person', 'agent', 'representative', 'support', 'help',
      'escalate', 'manager', 'supervisor', 'live chat', 'real person',
      'talk to someone', 'speak to someone', 'not working', 'error',
      'broken', 'issue', 'problem', 'can\'t help', 'confused'
    ];
    
    const lowerMessage = message.toLowerCase();
    return escalationKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const handleEscalationToHuman = async () => {
    setEscalationRequested(true);
    
    const escalationMessage = {
      id: Date.now().toString(),
      type: 'agent' as const,
      content: 'I understand you\'d like to speak with a human agent. I\'m escalating your request to our support team. A human representative will be with you shortly to help you complete your USDOT application. In the meantime, please provide a brief description of your issue so they can assist you better.',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, escalationMessage]);
    
    // Save escalation request to database
    try {
      await fetch('/api/client-portal/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message_type: 'escalation_request',
          content: 'Client requested human agent assistance during onboarding',
          metadata: { 
            timestamp: new Date().toISOString(),
            escalation_type: 'human_agent_request',
            client_data: applicationData,
            onboarding_step: applicationData.currentStep
          }
        })
      });
    } catch (error) {
      console.error('Error saving escalation request:', error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && !isProcessing) {
      const userMessage = {
        id: Date.now().toString(),
        type: 'user' as const,
        content: newMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsProcessing(true);
      const messageToProcess = newMessage;
      setNewMessage('');

      // Check if this is an escalation request
      if (checkForEscalationRequest(messageToProcess)) {
        await handleEscalationToHuman();
        setIsProcessing(false);
        return;
      }

      try {
        const context: OnboardingContext = {
          clientData: applicationData,
          currentStep: applicationData.currentStep,
          conversationHistory: messages,
          qualifiedStates: onboardingAgentService['qualifiedStates'],
          rapidCompliancePricing: onboardingAgentService['rapidCompliancePricing']
        };

        const result = await onboardingAgentService.processOnboardingMessage(messageToProcess, context);

        const agentResponse = {
          id: (Date.now() + 1).toString(),
          type: 'agent' as const,
          content: result.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, agentResponse]);

        // Update application data if provided
        if (result.updatedData) {
          setApplicationData(prev => ({
            ...prev,
            ...result.updatedData,
            currentStep: result.nextStep
          }));
        } else {
          setApplicationData(prev => ({
            ...prev,
            currentStep: result.nextStep
          }));
        }

        // Handle payment requirement
        if (result.requiresPayment) {
          setShowPaymentForm(true);
        }

        // Handle customer service handoff
        if (result.handoffToCustomerService) {
          setHandoffComplete(true);
        }

        // Speak the response
        if (applicationData.status !== 'handoff') {
          speakMessage(result.response);
        }

      } catch (error) {
        console.error('Error processing message:', error);
        
        // If AI service fails, offer escalation to human
        const errorResponse = {
          id: (Date.now() + 1).toString(),
          type: 'agent' as const,
          content: 'I apologize, but I\'m experiencing technical difficulties right now. Would you like me to connect you with a human agent who can help you complete your USDOT application?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorResponse]);
        
        // Save error for tracking
        try {
          await fetch('/api/client-portal/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              message_type: 'system_error',
              content: 'AI service error during onboarding - offering human escalation',
              metadata: { 
                timestamp: new Date().toISOString(),
                error_type: 'ai_service_failure',
                error_details: error instanceof Error ? error.message : 'Unknown error',
                onboarding_step: applicationData.currentStep
              }
            })
          });
        } catch (saveError) {
          console.error('Error saving error message:', saveError);
        }
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

  const speakMessage = async (text: string, voiceIdFromAI?: string) => {
    // Stop any current speech before starting new speech
    if (isSpeaking) {
      speechSynthesis.cancel();
    }

    setIsSpeaking(true);
    try {
      // Find the correct voice ID for Unreal Speech
      const voiceToFind = (voiceIdFromAI || selectedVoice)?.toLowerCase();
      const selectedVoiceData = availableVoices.find(v => v.id.toLowerCase() === voiceToFind);
      let unrealSpeechVoiceId = selectedVoiceData?.voiceId || 'Jasper';

      // Force Jasper if available and not already selected
      if (unrealSpeechVoiceId !== 'Jasper') {
        const jasperVoice = availableVoices.find(v => 
          v.name.toLowerCase().includes('jasper') || 
          v.id.toLowerCase().includes('jasper')
        );
        if (jasperVoice) {
          unrealSpeechVoiceId = jasperVoice.voiceId;
        } else {
          unrealSpeechVoiceId = 'Jasper';
        }
      }

      // Truncate text to 1000 characters for Unreal Speech API
      const truncatedText = text.length > 1000 ? text.substring(0, 997) + '...' : text;

      const response = await fetch('http://localhost:3001/api/ai/unreal-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: truncatedText,
          voiceId: unrealSpeechVoiceId,
          speed: 0,
          pitch: 1.0
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        await audio.play();
      } else {
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleTestVoice = () => {
    const testMessage = "Hello! This is your Rapid Compliance USDOT application assistant. I'm here to help you complete your application and determine your compliance requirements.";
    speakMessage(testMessage);
  };

  const handlePaymentSubmit = async () => {
    // Process payment logic here
    setApplicationData(prev => ({
      ...prev,
      paymentProcessed: true,
      status: 'processing'
    }));

    // Complete onboarding
    const context: OnboardingContext = {
      clientData: applicationData,
      currentStep: applicationData.currentStep,
      conversationHistory: messages,
      qualifiedStates: onboardingAgentService['qualifiedStates'],
      rapidCompliancePricing: onboardingAgentService['rapidCompliancePricing']
    };

    const result = await onboardingAgentService.completeOnboarding(context);
    
    if (result.success) {
      // Add completion message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'agent',
        content: result.message,
        timestamp: new Date()
      }]);

      // Perform seamless handoff to customer service
      if (sessionId) {
        const handoffContext: HandoffContext = {
          clientData: applicationData,
          onboardingMessages: messages,
          onboardingCompleted: true,
          handoffReason: 'onboarding_complete',
          sessionId: sessionId
        };

        const handoffResult = await agentHandoffService.performSeamlessHandoff(handoffContext);
        
        if (handoffResult.success) {
          // Add handoff message
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            type: 'agent',
            content: handoffResult.handoffMessage,
            timestamp: new Date()
          }]);
        }
      }

      setHandoffComplete(true);
    }
  };

  const getStepTitle = (step: number) => {
    const titles = {
      1: 'Company Information',
      2: 'Business Type',
      3: 'Business Address',
      4: 'Contact Information',
      5: 'Operation Type',
      6: 'Cargo Type',
      7: 'Operation Radius',
      8: 'Vehicle Information',
      9: 'Compliance Review',
      10: 'Payment & Registration'
    };
    return titles[step as keyof typeof titles] || 'Application';
  };

  if (handoffComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Application Complete!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your USDOT application has been submitted successfully. Our customer service team will contact you shortly to help you set up your client portal and guide you through the next steps.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Next Steps:</strong><br />
                1. Customer service will contact you within 24 hours<br />
                2. You'll receive your client portal login credentials<br />
                3. We'll guide you through any additional requirements
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/portal'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Access Client Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Application Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                USDOT Application
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Step {applicationData.currentStep} of {applicationData.totalSteps}: {getStepTitle(applicationData.currentStep)}
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {applicationData.legalBusinessName || 'New Application'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Application Progress
              </h3>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round((applicationData.currentStep / applicationData.totalSteps) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(applicationData.currentStep / applicationData.totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Step List */}
              <div className="space-y-2">
                {Array.from({ length: applicationData.totalSteps }, (_, i) => i + 1).map((step) => (
                  <div
                    key={step}
                    className={`flex items-center p-2 rounded-lg text-sm ${
                      step === applicationData.currentStep
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : step < applicationData.currentStep
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      step < applicationData.currentStep
                        ? 'bg-green-500 text-white'
                        : step === applicationData.currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {step < applicationData.currentStep ? (
                        <CheckCircleIcon className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-medium">{step}</span>
                      )}
                    </div>
                    {getStepTitle(step)}
                  </div>
                ))}
              </div>

              {/* Cost Summary */}
              {applicationData.totalCost > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Cost Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">USDOT Application</span>
                      <span className="text-green-600 dark:text-green-400">FREE</span>
                    </div>
                    {applicationData.breakdown.authority && applicationData.breakdown.authority > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Authority</span>
                        <span className="text-gray-900 dark:text-white">${applicationData.breakdown.authority}</span>
                      </div>
                    )}
                    {applicationData.breakdown.compliance > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Compliance</span>
                        <span className="text-gray-900 dark:text-white">${applicationData.breakdown.compliance}</span>
                      </div>
                    )}
                    {applicationData.breakdown.processing > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Processing</span>
                        <span className="text-gray-900 dark:text-white">${applicationData.breakdown.processing}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-gray-900 dark:text-white">${applicationData.totalCost}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {escalationRequested ? 'Escalated to Human Agent' : 'USDOT Application Assistant'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {escalationRequested 
                        ? 'Human agent will join shortly to help complete your application'
                        : 'I\'ll help you complete your application step by step'
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Voice Selection */}
                    <div className="flex items-center space-x-1">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Voice:</label>
                      <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs max-w-24"
                      >
                        {availableVoices.map((voice) => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={handleVoiceToggle}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isListening
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }`}
                    >
                      {isListening ? (
                        <PauseIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <MicrophoneIcon className="h-4 w-4 mr-1" />
                      )}
                      {isListening ? 'Listening...' : 'Voice'}
                    </button>
                    
                    <button
                      onClick={handleTestVoice}
                      className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <SpeakerphoneIcon className="h-4 w-4 mr-1" />
                      Test
                    </button>
                  </div>
                </div>
                
                {/* Status Indicator */}
                <div className="flex items-center justify-center mt-4">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                    escalationRequested 
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      escalationRequested ? 'bg-orange-500' : 'bg-green-500'
                    }`}></div>
                    <span>
                      {escalationRequested ? 'Escalated to Human Agent' : 'AI Assistant Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Processing indicator */}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Processing your response...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isProcessing || !newMessage.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Complete Payment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Total Amount: <span className="font-semibold">${applicationData.totalCost}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPaymentForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Pay ${applicationData.totalCost}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingAgent;
