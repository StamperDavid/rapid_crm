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
  PlayIcon
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
  complianceRequirements: {
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
  confidence: number;
}

interface RequirementReview {
  usdot: boolean | null;
  mcAuthority: boolean | null;
  hazmat: boolean | null;
  ifta: boolean | null;
  stateRegistration: boolean | null;
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

  useEffect(() => {
    initializeTraining();
  }, []);

  const initializeTraining = async () => {
    await loadSession();
    await loadNextScenario();
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
    // Client initiates conversation
    const clientGreeting: Message = {
      id: 'msg_1',
      sender: 'client',
      content: `Hi, I need help getting a USDOT number for my ${scenario.formOfBusiness.replace(/_/g, ' ')} business.`,
      timestamp: new Date()
    };
    
    setConversation([clientGreeting]);
    
    // Simulate the full onboarding conversation
    await simulateOnboardingConversation(scenario);
  };

  const simulateOnboardingConversation = async (scenario: USDOTApplicationScenario) => {
    setIsProcessing(true);
    
    try {
      // Call backend to run Alex through the full conversation
      const response = await fetch('/api/alex-training/run-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      
      const data = await response.json();
      
      if (data.conversation && data.determination) {
        // Convert conversation to Message format with unique IDs and trigger detection
        const messages: Message[] = data.conversation.map((msg: any, index: number) => ({
          id: `${scenario.id}_msg_${index}`,
          sender: msg.sender,
          content: msg.content,
          timestamp: new Date(),
          triggers: msg.triggers || []
        }));
        
        // Display all messages at once (no animation to avoid duplicates)
        setConversation(messages);
        
        // Show final determination
        setAlexDetermination(data.determination);
        setIsConversationComplete(true);
      }
    } catch (error) {
      console.error('Error running conversation:', error);
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
          individualReviews: requirementReview
        })
      });
      
      await loadSession();
      await loadNextScenario();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
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
          
          {isProcessing && !isConversationComplete && (
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <RefreshIcon className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Alex is typing...</span>
                </div>
              </div>
            </div>
          )}
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
          {session && session.totalScenarios > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {session.completed} / {session.totalScenarios}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {session.correct} correct • {session.incorrect} incorrect
              </div>
              {session.correct + session.incorrect > 0 && (
                <div className="text-sm font-medium text-blue-600">
                  Accuracy: {((session.correct / (session.correct + session.incorrect)) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {!session || session.totalScenarios === 0 || session.totalScenarios < 918 ? (
        <div className="max-w-2xl mx-auto mt-20 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {session && session.totalScenarios > 0 ? 'Regenerate Training Scenarios (918 Total)' : 'Generate Training Scenarios'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {session && session.totalScenarios > 0 ? (
              <>
                Current: {session.totalScenarios} scenarios. Click below to regenerate with all 918 transportation compliance scenarios (51 states × 6 operation types × 3 fleet sizes).
              </>
            ) : (
              <>
                Click below to generate all 918 training scenarios for transportation compliance. This will create complete USDOT applications that will be stored permanently for training.
              </>
            )}
          </p>
          <button
            onClick={generateScenarios}
            disabled={isGenerating}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <RefreshIcon className="h-5 w-5 mr-2 animate-spin" />
                Generating 918 Scenarios...
              </>
            ) : (
              <>
                <PlayIcon className="h-5 w-5 mr-2" />
                {session && session.totalScenarios > 0 ? 'Regenerate All 918 Training Scenarios' : 'Generate All 918 Training Scenarios'}
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          {/* Split Screen: Conversation | Determination */}
          <div className="grid grid-cols-2 gap-4 p-4" style={{ height: 'calc(100vh - 280px)' }}>
            {/* Left: Conversation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {renderConversation()}
            </div>

            {/* Right: Determination */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {renderDetermination()}
            </div>
          </div>

          {/* Bottom: Feedback Window */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
            <div className="max-w-7xl mx-auto">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Your Feedback & Corrections
              </h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Explain what Alex did right or wrong in the conversation and/or determination. Example: 'Alex should have asked about interstate vs intrastate earlier. The IFTA determination is wrong because...'"
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
                  Submit Review
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
      )}
    </div>
  );
};

export default AlexTrainingCenter;
