/**
 * Alex Training Center - Conversation-Based Training
 * Left: Live conversation between Alex and simulated client
 * Right: Alex's final compliance determination
 * Bottom: Your feedback/correction window
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  RefreshIcon,
  ChatIcon,
  ClipboardCheckIcon,
  LightningBoltIcon,
  PlayIcon,
  UploadIcon
} from '@heroicons/react/outline';
// Scenario interface (matches database schema)
interface USDOTApplicationScenario {
  id: string;
  legalBusinessName: string;
  doingBusinessAs: string;
  formOfBusiness: string;
  ein: string;
  businessPhone: string;
  principalAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  companyContact: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
  };
  receiveCompensationForTransport: string;
  transportNonHazardousInterstate: string;
  propertyType: string;
  transportHazardousMaterials: string;
  operationType: string;
  vehicles: {
    straightTrucks: { owned: number; termLeased: number };
    truckTractors: { owned: number; termLeased: number };
    trailers: { owned: number; termLeased: number };
  };
  cmvInterstateOnly: number;
  cmvIntrastateOnly: number;
  cargoClassifications: string[];
  expectedRequirements: {
    usdotRequired: boolean;
    mcAuthorityRequired: boolean;
    hazmatEndorsementRequired: boolean;
    iftaRequired: boolean;
    stateRegistrationRequired: boolean;
    reasoning: string;
  };
}

interface Message {
  id: string;
  sender: 'alex' | 'client';
  content: string;
  timestamp: Date;
  triggers?: string[]; // Which requirements this message triggers
}

interface AlexDetermination {
  usdotRequired: boolean;
  mcAuthorityRequired: boolean;
  hazmatRequired: boolean;
  iftaRequired: boolean;
  stateRegistrationRequired: boolean;
  reasoning: string;
  regulations?: string[];
  confidence: number;
}

interface RequirementReview {
  usdot: boolean | null;
  mcAuthority: boolean | null;
  hazmat: boolean | null;
  ifta: boolean | null;
  stateRegistration: boolean | null;
}

interface ConversationQuality {
  askedRightQuestions: boolean | null;
  askedInGoodOrder: boolean | null;
  explainedClearly: boolean | null;
  builtRapport: boolean | null;
  handledObjections: boolean | null;
}

interface SalesEffectiveness {
  presentedValue: boolean | null;
  handledPricing: boolean | null;
  createdUrgency: boolean | null;
  closedEffectively: boolean | null;
  overallSalesQuality: number | null; // 1-5 rating
}

interface TrainingSession {
  id: string;
  totalScenarios: number;
  completed: number;
  correct: number;
  incorrect: number;
}

const AlexTrainingCenter: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<USDOTApplicationScenario | null>(null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const conversationEndRef = React.useRef<HTMLDivElement>(null);
  const [alexDetermination, setAlexDetermination] = useState<AlexDetermination | null>(null);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [requirementReview, setRequirementReview] = useState<RequirementReview>({
    usdot: null,
    mcAuthority: null,
    hazmat: null,
    ifta: null,
    stateRegistration: null
  });
  const [conversationQuality, setConversationQuality] = useState<ConversationQuality>({
    askedRightQuestions: null,
    askedInGoodOrder: null,
    explainedClearly: null,
    builtRapport: null,
    handledObjections: null
  });
  const [salesEffectiveness, setSalesEffectiveness] = useState<SalesEffectiveness>({
    presentedValue: null,
    handledPricing: null,
    createdUrgency: null,
    closedEffectively: null,
    overallSalesQuality: null
  });
  const [qualifiedStatesCount, setQualifiedStatesCount] = useState(0);
  const [qualifiedStatesLastUpdated, setQualifiedStatesLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    initializeTraining();
    loadQualifiedStatesInfo();
  }, []);

  // Auto-scroll conversation to bottom when new messages appear
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const initializeTraining = async () => {
    await loadSession();
    await loadNextScenario();
  };

  const loadQualifiedStatesInfo = async () => {
    try {
      const response = await fetch('/api/qualified-states');
      if (response.ok) {
        const data = await response.json();
        setQualifiedStatesCount(data.states?.length || 0);
        if (data.states && data.states.length > 0) {
          // Get most recent update date
          const mostRecent = data.states.reduce((latest: any, state: any) => {
            return new Date(state.last_updated) > new Date(latest.last_updated) ? state : latest;
          }, data.states[0]);
          setQualifiedStatesLastUpdated(mostRecent.last_updated);
        }
      }
    } catch (error) {
      console.error('Error loading qualified states info:', error);
    }
  };

  const loadSession = async () => {
    try {
      const response = await fetch('/api/alex-training/session');
      const data = await response.json();
      if (data.session) {
        setSession(data.session);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const generateScenarios = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/alex-training/generate-scenarios', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setSession(data.session);
        await loadNextScenario();
      }
    } catch (error) {
      console.error('Error generating scenarios:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadNextScenario = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/alex-training/next-scenario');
      const data = await response.json();
      
      if (data.scenario) {
        setCurrentScenario(data.scenario);
        setConversation([]);
        setAlexDetermination(null);
        setIsConversationComplete(false);
        setFeedback('');
        setRequirementReview({
          usdot: null,
          mcAuthority: null,
          hazmat: null,
          ifta: null,
          stateRegistration: null
        });
        setConversationQuality({
          askedRightQuestions: null,
          askedInGoodOrder: null,
          explainedClearly: null,
          builtRapport: null,
          handledObjections: null
        });
        setSalesEffectiveness({
          presentedValue: null,
          handledPricing: null,
          createdUrgency: null,
          closedEffectively: null,
          overallSalesQuality: null
        });
        
        // Start the conversation
        await startConversation(data.scenario);
      }
    } catch (error) {
      console.error('Error loading scenario:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startConversation = async (scenario: USDOTApplicationScenario) => {
    setIsProcessing(true);
    setConversation([]);
    
    try {
      // Step 1: Get client greeting
      console.log('👋 Getting client greeting...');
      const greetingResponse = await fetch('/api/alex-training/start-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      
      const greeting = await greetingResponse.json();
      
      const clientMessage: Message = {
        id: `msg_0`,
        sender: 'client',
        content: greeting.message,
        timestamp: new Date()
      };
      
      setConversation([clientMessage]);
      
      // Continue conversation turn by turn
      await continueConversation(scenario, [clientMessage]);
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsProcessing(false);
    }
  };

  const continueConversation = async (scenario: USDOTApplicationScenario, currentConversation: Message[]) => {
    const maxTurns = 30; // Safety limit to prevent infinite loops
    let messages = [...currentConversation];
    
    for (let turn = 0; turn < maxTurns; turn++) {
      // Show "Alex is thinking..."
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to show it's processing
      
      // Get Alex's response
      try {
        const alexResponse = await fetch('/api/alex-training/alex-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            scenario,
            conversationHistory: messages.map(m => ({ sender: m.sender, content: m.content }))
          })
        });
        
        const alexData = await alexResponse.json();
        
        if (!alexData || !alexData.message) {
          console.error('Invalid Alex response:', alexData);
          break;
        }
        
        const alexMessage: Message = {
          id: `msg_${messages.length}`,
          sender: 'alex',
          content: alexData.message,
          timestamp: new Date()
        };
        
        messages.push(alexMessage);
        setConversation([...messages]);
        
        // Check if Alex signals conversation is complete
        const lowerMessage = alexData.message.toLowerCase();
        const alexIsClosing = 
          lowerMessage.includes('let me determine') ||
          lowerMessage.includes('let me analyze') ||
          lowerMessage.includes('let me prepare your registration') ||
          lowerMessage.includes('i\'ll get started on your') ||
          lowerMessage.includes('welcome aboard') ||
          lowerMessage.includes('i\'ll begin processing') ||
          lowerMessage.includes('thank you for choosing');
        
        if (alexIsClosing) {
          console.log('✅ Alex is closing conversation naturally');
          await finalizeConversation(scenario);
          return;
        }
        
        // Show "Client is typing..."
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Get client's response
        const clientResponse = await fetch('/api/alex-training/client-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            scenario,
            alexMessage: alexData.message
          })
        });
        
        const clientData = await clientResponse.json();
        
        const clientMessage: Message = {
          id: `msg_${messages.length}`,
          sender: 'client',
          content: clientData.message,
          timestamp: new Date(),
          triggers: clientData.revealsInfo?.map((info: any) => info.field) || []
        };
        
        messages.push(clientMessage);
        setConversation([...messages]);
        
        // Check if client accepted or declined services
        const clientLower = clientData.message.toLowerCase();
        if (clientLower.includes('yes') && clientLower.includes('started') ||
            clientLower.includes('let\'s do it') ||
            clientLower.includes('sounds good') ||
            clientLower.includes('i\'m in') ||
            clientLower.includes('no thanks') ||
            clientLower.includes('not interested') ||
            clientLower.includes('too expensive')) {
          // Client made decision - one more Alex response then end
          console.log('💰 Client made purchase decision, getting final Alex response...');
        }
        
      } catch (error) {
        console.error('Error in conversation turn:', error);
        break;
      }
    }
    
    // If we get here, finalize conversation
    await finalizeConversation(scenario);
  };

  const finalizeConversation = async (scenario: USDOTApplicationScenario) => {
    console.log('🎯 Getting final determination...');
    
    try {
      // Call determination service
      const response = await fetch('/api/alex-training/test-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      
      const data = await response.json();
      
      if (data.response) {
        setAlexDetermination(data.response);
        setIsConversationComplete(true);
      }
    } catch (error) {
      console.error('Error getting determination:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const submitFeedback = async () => {
    if (!currentScenario || !alexDetermination) return;

    // Determine overall correctness from individual reviews
    const allReviewed = Object.values(requirementReview).every(v => v !== null);
    if (!allReviewed) {
      alert('Please review all requirements (mark each as correct or incorrect)');
      return;
    }

    const isCorrect = Object.values(requirementReview).every(v => v === true);

    try {
      await fetch('/api/alex-training/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: currentScenario.id,
          isCorrect,
          feedback,
          conversation,
          determination: alexDetermination,
          individualReviews: requirementReview,
          conversationQuality,
          salesEffectiveness
        })
      });
      
      await loadSession();
      await loadNextScenario();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const renderScenarioDetails = () => {
    if (!currentScenario) {
      return (
        <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <ClipboardCheckIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No scenario loaded</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <ClipboardCheckIcon className="h-5 w-5 mr-2" />
            Client Scenario
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Complete application details
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {/* Company Info */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Company Information</h3>
            <div className="space-y-1 text-gray-700 dark:text-gray-300">
              <div><span className="font-medium">Legal Name:</span> {currentScenario.legalBusinessName}</div>
              <div><span className="font-medium">DBA:</span> {currentScenario.doingBusinessAs || 'N/A'}</div>
              <div><span className="font-medium">Business Type:</span> {currentScenario.formOfBusiness.replace(/_/g, ' ')}</div>
              <div><span className="font-medium">EIN:</span> {currentScenario.ein}</div>
              <div><span className="font-medium">Phone:</span> {currentScenario.businessPhone}</div>
            </div>
          </div>

          {/* Address */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Principal Address</h3>
            <div className="text-gray-700 dark:text-gray-300">
              <div>{currentScenario.principalAddress.street}</div>
              <div>{currentScenario.principalAddress.city}, {currentScenario.principalAddress.state} {currentScenario.principalAddress.postalCode}</div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Person</h3>
            <div className="space-y-1 text-gray-700 dark:text-gray-300">
              <div>{currentScenario.companyContact.firstName} {currentScenario.companyContact.lastName}</div>
              <div>{currentScenario.companyContact.title}</div>
              <div>{currentScenario.companyContact.email}</div>
              <div>{currentScenario.companyContact.phone}</div>
            </div>
          </div>

          {/* Operations */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Operations</h3>
            <div className="space-y-1 text-gray-700 dark:text-gray-300">
              <div><span className="font-medium">Compensation:</span> {currentScenario.receiveCompensationForTransport}</div>
              <div><span className="font-medium">Interstate:</span> {currentScenario.transportNonHazardousInterstate}</div>
              <div><span className="font-medium">Property Type:</span> {currentScenario.propertyType}</div>
              <div><span className="font-medium">Hazmat:</span> {currentScenario.transportHazardousMaterials}</div>
              <div><span className="font-medium">Operation Type:</span> {currentScenario.operationType}</div>
            </div>
          </div>

          {/* Vehicles */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fleet</h3>
            <div className="space-y-1 text-gray-700 dark:text-gray-300">
              <div><span className="font-medium">Straight Trucks:</span> {currentScenario.vehicles?.straightTrucks?.owned || 0} owned, {currentScenario.vehicles?.straightTrucks?.termLeased || 0} leased</div>
              <div><span className="font-medium">Truck Tractors:</span> {currentScenario.vehicles?.truckTractors?.owned || 0} owned, {currentScenario.vehicles?.truckTractors?.termLeased || 0} leased</div>
              <div><span className="font-medium">Trailers:</span> {currentScenario.vehicles?.trailers?.owned || 0} owned, {currentScenario.vehicles?.trailers?.termLeased || 0} leased</div>
              <div><span className="font-medium">Interstate CMVs:</span> {currentScenario.cmvInterstateOnly || 0}</div>
              <div><span className="font-medium">Intrastate CMVs:</span> {currentScenario.cmvIntrastateOnly || 0}</div>
            </div>
          </div>

          {/* Cargo */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cargo Classifications</h3>
            <div className="flex flex-wrap gap-1">
              {currentScenario.cargoClassifications && currentScenario.cargoClassifications.length > 0 ? (
                currentScenario.cargoClassifications.map((cargo, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                    {cargo}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 dark:text-gray-400 text-xs">No cargo classifications specified</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConversation = () => {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <ChatIcon className="h-5 w-5 mr-2" />
            Onboarding Conversation
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Watch Alex guide the client through the onboarding process
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {conversation.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <ChatIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Waiting for conversation to start...</p>
            </div>
          ) : (
            conversation.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'alex' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.triggers && msg.triggers.length > 0
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-gray-900 dark:text-white border-2 border-yellow-400 dark:border-yellow-600'
                      : msg.sender === 'alex'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="text-xs font-semibold mb-1 opacity-75">
                    {msg.sender === 'alex' ? 'Alex' : 'Client'}
                  </div>
                  <div className="text-sm">{msg.content}</div>
                  {msg.triggers && msg.triggers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.triggers.map((trigger, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-orange-500 text-white rounded-full"
                        >
                          🔔 {trigger}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {isProcessing && !isConversationComplete && conversation.length > 0 && (
            <div className={`flex ${conversation[conversation.length - 1].sender === 'client' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                conversation[conversation.length - 1].sender === 'client' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <RefreshIcon className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    {conversation[conversation.length - 1].sender === 'client' 
                      ? 'Alex is thinking...' 
                      : 'Client is typing...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={conversationEndRef} />
        </div>
      </div>
    );
  };

  const renderDetermination = () => {
    if (!alexDetermination) {
      return (
        <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <ClipboardCheckIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Waiting for Alex's determination...</p>
          </div>
        </div>
      );
    }

    const isCorrect = currentScenario && (
      alexDetermination.usdotRequired === currentScenario.expectedRequirements.usdotRequired &&
      alexDetermination.mcAuthorityRequired === currentScenario.expectedRequirements.mcAuthorityRequired &&
      alexDetermination.hazmatRequired === currentScenario.expectedRequirements.hazmatEndorsementRequired &&
      alexDetermination.iftaRequired === currentScenario.expectedRequirements.iftaRequired &&
      alexDetermination.stateRegistrationRequired === currentScenario.expectedRequirements.stateRegistrationRequired
    );

    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <ClipboardCheckIcon className="h-5 w-5 mr-2" />
            Alex's Determination
            {isCorrect ? (
              <CheckCircleIcon className="h-5 w-5 ml-2 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 ml-2 text-red-500" />
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Requirements */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Requirements Determined</h3>
            <div className="space-y-3">
              {renderRequirement('USDOT Number', alexDetermination.usdotRequired, currentScenario?.expectedRequirements.usdotRequired, 'usdot')}
              {renderRequirement('MC Authority', alexDetermination.mcAuthorityRequired, currentScenario?.expectedRequirements.mcAuthorityRequired, 'mcAuthority')}
              {renderRequirement('Hazmat Endorsement', alexDetermination.hazmatRequired, currentScenario?.expectedRequirements.hazmatEndorsementRequired, 'hazmat')}
              {renderRequirement('IFTA Registration', alexDetermination.iftaRequired, currentScenario?.expectedRequirements.iftaRequired, 'ifta')}
              {renderRequirement('State Registration', alexDetermination.stateRegistrationRequired, currentScenario?.expectedRequirements.stateRegistrationRequired, 'stateRegistration')}
            </div>
          </div>

          {/* Alex's Reasoning */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Alex's Reasoning</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">{alexDetermination.reasoning}</p>
            {alexDetermination.regulations && alexDetermination.regulations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Regulatory Citations:</div>
                <div className="flex flex-wrap gap-1">
                  {alexDetermination.regulations.map((reg, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 rounded">
                      {reg}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">
              Confidence: {(alexDetermination.confidence * 100).toFixed(0)}%
            </div>
          </div>

          {/* Expected Answer */}
          {currentScenario && (
            <div className="mt-6 bg-green-50 dark:bg-green-900 rounded-lg p-4">
              <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">✓ Correct Answer</h3>
              <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                <div>USDOT: {currentScenario.expectedRequirements.usdotRequired ? 'Required' : 'Not Required'}</div>
                <div>MC Authority: {currentScenario.expectedRequirements.mcAuthorityRequired ? 'Required' : 'Not Required'}</div>
                <div>Hazmat: {currentScenario.expectedRequirements.hazmatEndorsementRequired ? 'Required' : 'Not Required'}</div>
                <div>IFTA: {currentScenario.expectedRequirements.iftaRequired ? 'Required' : 'Not Required'}</div>
                <div>State Reg: {currentScenario.expectedRequirements.stateRegistrationRequired ? 'Required' : 'Not Required'}</div>
                <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-700 text-xs">
                  {currentScenario.expectedRequirements.reasoning}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRequirement = (
    label: string, 
    alexSays: boolean, 
    expected?: boolean,
    requirementKey?: keyof RequirementReview
  ) => {
    const autoCorrect = alexSays === expected;
    const manualReview = requirementKey ? requirementReview[requirementKey] : null;
    
    return (
      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className={`text-sm font-medium ${alexSays ? 'text-green-600' : 'text-gray-400'}`}>
            {alexSays ? 'Required' : 'Not Required'}
          </span>
        </div>
        {requirementKey && (
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Your Review:</span>
            <button
              onClick={() => setRequirementReview(prev => ({ ...prev, [requirementKey]: true }))}
              className={`px-3 py-1 text-xs rounded ${
                manualReview === true
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100'
              }`}
            >
              ✓ Correct
            </button>
            <button
              onClick={() => setRequirementReview(prev => ({ ...prev, [requirementKey]: false }))}
              className={`px-3 py-1 text-xs rounded ${
                manualReview === false
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100'
              }`}
            >
              ✗ Incorrect
            </button>
            {manualReview !== null && expected !== undefined && (
              <span className="text-xs">
                {(manualReview && autoCorrect) || (!manualReview && !autoCorrect) ? (
                  <span className="text-green-600">✓ Matches expected</span>
                ) : (
                  <span className="text-orange-600">⚠ Check your review</span>
                )}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <LightningBoltIcon className="h-7 w-7 mr-2 text-blue-500" />
              Alex Training Center
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Train Alex with live onboarding conversations
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Qualified States Indicator */}
            <a
              href="/training/qualified-states"
              className="bg-purple-50 dark:bg-purple-900 px-4 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
            >
              <div className="text-xs text-purple-600 dark:text-purple-300 font-medium">
                Qualified States List
              </div>
              <div className="text-sm font-bold text-purple-900 dark:text-purple-100">
                {qualifiedStatesCount} states loaded
              </div>
              {qualifiedStatesLastUpdated && (
                <div className="text-xs text-purple-500 dark:text-purple-400">
                  Updated: {new Date(qualifiedStatesLastUpdated).toLocaleDateString()}
                </div>
              )}
              <div className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                Click to manage →
              </div>
            </a>
            
            {session && session.totalScenarios > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {session.completed} / {session.totalScenarios}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {session.correct} correct • {session.incorrect} incorrect
              </div>
              {session.correct + session.incorrect > 0 && (
                <div className={`text-lg font-bold ${
                  ((session.correct / (session.correct + session.incorrect)) * 100) >= 95 
                    ? 'text-green-600' 
                    : ((session.correct / (session.correct + session.incorrect)) * 100) >= 80 
                      ? 'text-blue-600' 
                      : 'text-orange-600'
                }`}>
                  {((session.correct / (session.correct + session.incorrect)) * 100).toFixed(1)}% Accuracy
                </div>
              )}
              {session.correct + session.incorrect > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {session.correct + session.incorrect >= 100 && ((session.correct / (session.correct + session.incorrect)) * 100) >= 95 
                    ? '✅ Production Ready!' 
                    : session.correct + session.incorrect >= 50 
                      ? `${100 - (session.correct + session.incorrect)} more tests to evaluate` 
                      : 'Keep training...'}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {session && session.totalScenarios > 0 ? (
        <>
          {/* 3-Column Layout: Scenario Details | Conversation | Determination */}
          <div className="grid grid-cols-3 gap-4 p-4" style={{ height: 'calc(100vh - 280px)' }}>
            {/* Left: Scenario Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {renderScenarioDetails()}
            </div>

            {/* Middle: Conversation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {renderConversation()}
            </div>

            {/* Right: Determination */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {renderDetermination()}
            </div>
          </div>

          {/* Bottom: Feedback Window */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <div className="max-w-7xl mx-auto">
              {/* Tabs for different review sections */}
              <div className="flex space-x-4 mb-3 border-b border-gray-200 dark:border-gray-700">
                <button className="px-3 py-1 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                  Determination
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Conversation Quality
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Sales Effectiveness
                </button>
              </div>

              {/* Conversation Quality Review */}
              <div className="grid grid-cols-5 gap-2 mb-3">
                <div className="text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Right Questions?</div>
                  <div className="flex justify-center space-x-1">
                    <button
                      onClick={() => setConversationQuality(prev => ({ ...prev, askedRightQuestions: true }))}
                      className={`px-2 py-1 text-xs rounded ${conversationQuality.askedRightQuestions === true ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-green-100'}`}
                    >✓</button>
                    <button
                      onClick={() => setConversationQuality(prev => ({ ...prev, askedRightQuestions: false }))}
                      className={`px-2 py-1 text-xs rounded ${conversationQuality.askedRightQuestions === false ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-red-100'}`}
                    >✗</button>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Good Order?</div>
                  <div className="flex justify-center space-x-1">
                    <button
                      onClick={() => setConversationQuality(prev => ({ ...prev, askedInGoodOrder: true }))}
                      className={`px-2 py-1 text-xs rounded ${conversationQuality.askedInGoodOrder === true ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-green-100'}`}
                    >✓</button>
                    <button
                      onClick={() => setConversationQuality(prev => ({ ...prev, askedInGoodOrder: false }))}
                      className={`px-2 py-1 text-xs rounded ${conversationQuality.askedInGoodOrder === false ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-red-100'}`}
                    >✗</button>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Explained Clearly?</div>
                  <div className="flex justify-center space-x-1">
                    <button
                      onClick={() => setConversationQuality(prev => ({ ...prev, explainedClearly: true }))}
                      className={`px-2 py-1 text-xs rounded ${conversationQuality.explainedClearly === true ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-green-100'}`}
                    >✓</button>
                    <button
                      onClick={() => setConversationQuality(prev => ({ ...prev, explainedClearly: false }))}
                      className={`px-2 py-1 text-xs rounded ${conversationQuality.explainedClearly === false ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-red-100'}`}
                    >✗</button>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Built Rapport?</div>
                  <div className="flex justify-center space-x-1">
                    <button
                      onClick={() => setConversationQuality(prev => ({ ...prev, builtRapport: true }))}
                      className={`px-2 py-1 text-xs rounded ${conversationQuality.builtRapport === true ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-green-100'}`}
                    >✓</button>
                    <button
                      onClick={() => setConversationQuality(prev => ({ ...prev, builtRapport: false }))}
                      className={`px-2 py-1 text-xs rounded ${conversationQuality.builtRapport === false ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-red-100'}`}
                    >✗</button>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sales Quality (1-5)</div>
                  <div className="flex justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setSalesEffectiveness(prev => ({ ...prev, overallSalesQuality: rating }))}
                        className={`px-2 py-1 text-xs rounded ${salesEffectiveness.overallSalesQuality === rating ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-blue-100'}`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Your Feedback & Corrections
              </h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide detailed feedback on conversation quality, sales approach, and regulatory determinations. Example: 'Alex should have explained IFTA more clearly - clients don't know what that acronym means. Sales approach was too pushy. IFTA determination is wrong because...'"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                rows={2}
              />
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={submitFeedback}
                  disabled={!isConversationComplete || isProcessing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Submit Full Review
                </button>
                <button
                  onClick={loadNextScenario}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  Next Scenario
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-2xl mx-auto mt-20 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            No Training Session Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The training system is loading scenarios from the database. If this persists, check the server console for errors.
          </p>
        </div>
      )}
    </div>
  );
};

export default AlexTrainingCenter;
