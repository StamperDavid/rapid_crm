/**
 * Alex Onboarding Agent Training Center
 * Tests Alex's ability to guide clients through the onboarding process
 */

import React, { useState, useEffect } from 'react';
import {
  ChatIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationIcon,
  PlayIcon,
  ArrowRightIcon,
  InformationCircleIcon
} from '@heroicons/react/outline';

interface ClientScenario {
  id: string;
  name: string;
  description: string;
  clientProfile: {
    businessType: string;
    operationType: string;
    states: string[];
    cargoTypes: string[];
    fleetSize: number;
    hasCDL: boolean;
    isThirdParty: boolean;
  };
  expectedOutcome: {
    requiredRegistrations: string[];
    recommendedServices: string[];
    shouldCreateDeal: boolean;
    estimatedCost: number;
  };
  difficulty: number;
}

interface ConversationMessage {
  id: string;
  sender: 'client' | 'alex';
  message: string;
  timestamp: Date;
  isCorrect?: boolean;
  feedback?: string;
}

interface TrainingSession {
  id: string;
  scenarioId: string;
  startTime: Date;
  endTime?: Date;
  messages: ConversationMessage[];
  score: number;
  completed: boolean;
  mistakes: string[];
}

const AlexOnboardingTrainingCenter: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<ClientScenario | null>(null);
  const [trainingSession, setTrainingSession] = useState<TrainingSession | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [agentId, setAgentId] = useState<string>('');
  const [sessionHistory, setSessionHistory] = useState<TrainingSession[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Get agent ID from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const agentIdParam = urlParams.get('agentId');
    if (agentIdParam) {
      setAgentId(agentIdParam);
    }
  }, []);

  // Training scenarios for Alex
  const scenarios: ClientScenario[] = [
    {
      id: 'scenario_001',
      name: 'Sole Proprietor - Local Delivery',
      description: 'Small business owner wants to start local delivery service',
      clientProfile: {
        businessType: 'sole_proprietor',
        operationType: 'local_delivery',
        states: ['CA'],
        cargoTypes: ['general_freight'],
        fleetSize: 1,
        hasCDL: false,
        isThirdParty: false
      },
      expectedOutcome: {
        requiredRegistrations: ['USDOT'],
        recommendedServices: ['Free USDOT Registration'],
        shouldCreateDeal: true,
        estimatedCost: 0
      },
      difficulty: 3
    },
    {
      id: 'scenario_002',
      name: 'LLC - Interstate Commerce',
      description: 'LLC wants to transport goods across state lines',
      clientProfile: {
        businessType: 'llc',
        operationType: 'interstate_commerce',
        states: ['CA', 'NV', 'AZ'],
        cargoTypes: ['general_freight', 'hazmat'],
        fleetSize: 5,
        hasCDL: true,
        isThirdParty: false
      },
      expectedOutcome: {
        requiredRegistrations: ['USDOT', 'MC_NUMBER', 'HAZMAT'],
        recommendedServices: ['Full Compliance Package'],
        shouldCreateDeal: true,
        estimatedCost: 599
      },
      difficulty: 7
    },
    {
      id: 'scenario_003',
      name: 'Corporation - Large Fleet',
      description: 'Large corporation with extensive fleet operations',
      clientProfile: {
        businessType: 'corporation',
        operationType: 'interstate_commerce',
        states: ['CA', 'TX', 'NY', 'FL', 'IL'],
        cargoTypes: ['general_freight', 'hazmat', 'passengers'],
        fleetSize: 25,
        hasCDL: true,
        isThirdParty: false
      },
      expectedOutcome: {
        requiredRegistrations: ['USDOT', 'MC_NUMBER', 'HAZMAT', 'PASSENGER', 'STATE_REGISTRATIONS'],
        recommendedServices: ['Full Compliance Package', 'State Registrations'],
        shouldCreateDeal: true,
        estimatedCost: 749
      },
      difficulty: 9
    },
    {
      id: 'scenario_004',
      name: '3rd Party Service Provider',
      description: 'Company that helps others with USDOT registrations',
      clientProfile: {
        businessType: 'llc',
        operationType: 'service_provider',
        states: ['CA'],
        cargoTypes: [],
        fleetSize: 0,
        hasCDL: false,
        isThirdParty: true
      },
      expectedOutcome: {
        requiredRegistrations: ['USDOT'],
        recommendedServices: ['Free USDOT Registration'],
        shouldCreateDeal: true,
        estimatedCost: 0
      },
      difficulty: 5
    }
  ];

  // Start training session
  const startTrainingSession = (scenario: ClientScenario) => {
    const session: TrainingSession = {
      id: `session_${Date.now()}`,
      scenarioId: scenario.id,
      startTime: new Date(),
      messages: [],
      score: 0,
      completed: false,
      mistakes: []
    };

    setCurrentScenario(scenario);
    setTrainingSession(session);
    setIsTraining(true);
    setShowResults(false);
    
    // Start with client's initial message
    addMessage('client', `Hi, I'm interested in getting help with USDOT registration for my ${scenario.clientProfile.businessType} business.`);
  };

  // Add message to conversation
  const addMessage = (sender: 'client' | 'alex', message: string, isCorrect?: boolean, feedback?: string) => {
    const newMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      sender,
      message,
      timestamp: new Date(),
      isCorrect,
      feedback
    };

    setTrainingSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage]
    } : null);
  };

  // Send Alex's response
  const sendAlexResponse = () => {
    if (!currentMessage.trim() || !trainingSession) return;

    // Evaluate Alex's response (simplified evaluation)
    const evaluation = evaluateAlexResponse(currentMessage);
    
    addMessage('alex', currentMessage, evaluation.isCorrect, evaluation.feedback);
    
    if (evaluation.isCorrect) {
      setTrainingSession(prev => prev ? {
        ...prev,
        score: prev.score + 1
      } : null);
    } else {
      setTrainingSession(prev => prev ? {
        ...prev,
        mistakes: [...prev.mistakes, evaluation.feedback || 'Incorrect response']
      } : null);
    }

    setCurrentMessage('');
    
    // Simulate client response
    setTimeout(() => {
      const clientResponse = generateClientResponse();
      addMessage('client', clientResponse);
    }, 1000);
  };

  // Evaluate Alex's response
  const evaluateAlexResponse = (response: string): { isCorrect: boolean; feedback?: string } => {
    if (!currentScenario) return { isCorrect: false, feedback: 'No scenario active' };

    const responseLower = response.toLowerCase();
    
    // Check if Alex is asking relevant questions
    if (responseLower.includes('what type of business') || 
        responseLower.includes('what kind of business') ||
        responseLower.includes('business type')) {
      return { isCorrect: true, feedback: 'Good - asking about business type' };
    }
    
    if (responseLower.includes('interstate') || responseLower.includes('state lines')) {
      return { isCorrect: true, feedback: 'Good - asking about interstate commerce' };
    }
    
    if (responseLower.includes('cargo') || responseLower.includes('freight') || responseLower.includes('transport')) {
      return { isCorrect: true, feedback: 'Good - asking about cargo types' };
    }
    
    if (responseLower.includes('fleet') || responseLower.includes('vehicles') || responseLower.includes('trucks')) {
      return { isCorrect: true, feedback: 'Good - asking about fleet size' };
    }
    
    if (responseLower.includes('cdl') || responseLower.includes('license')) {
      return { isCorrect: true, feedback: 'Good - asking about CDL requirements' };
    }
    
    // Check for service recommendations
    if (responseLower.includes('service') || responseLower.includes('package') || responseLower.includes('offer')) {
      return { isCorrect: true, feedback: 'Good - offering services' };
    }
    
    return { isCorrect: false, feedback: 'Response not relevant to onboarding process' };
  };

  // Generate client response
  const generateClientResponse = (): string => {
    if (!currentScenario) return 'I need help with my business.';
    
    const profile = currentScenario.clientProfile;
    const responses = [
      `I'm a ${profile.businessType} and I want to ${profile.operationType.replace('_', ' ')}.`,
      `I operate in ${profile.states.join(', ')}.`,
      `I transport ${profile.cargoTypes.join(', ')}.`,
      `I have ${profile.fleetSize} vehicle${profile.fleetSize !== 1 ? 's' : ''}.`,
      profile.hasCDL ? 'Yes, I have a CDL.' : 'No, I don\'t have a CDL.',
      `What services do you offer?`,
      `How much does this cost?`,
      `When can you help me get started?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Complete training session
  const completeTrainingSession = () => {
    if (!trainingSession) return;

    const completedSession: TrainingSession = {
      ...trainingSession,
      endTime: new Date(),
      completed: true
    };

    setSessionHistory(prev => [...prev, completedSession]);
    setIsTraining(false);
    setShowResults(true);
  };

  // Reset training
  const resetTraining = () => {
    setCurrentScenario(null);
    setTrainingSession(null);
    setIsTraining(false);
    setCurrentMessage('');
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Alex Onboarding Agent Training Center
          </h1>
          <p className="text-gray-600">
            Test Alex's ability to guide clients through the onboarding process - Agent: {agentId || 'Not Selected'}
          </p>
        </div>

        {!isTraining ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scenario Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Training Scenarios</h2>
              <div className="space-y-4">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        scenario.difficulty <= 3 ? 'bg-green-100 text-green-800' :
                        scenario.difficulty <= 6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Difficulty: {scenario.difficulty}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                    <div className="text-xs text-gray-500 mb-3">
                      <strong>Expected:</strong> {scenario.expectedOutcome.recommendedServices.join(', ')} - ${scenario.expectedOutcome.estimatedCost}
                    </div>
                    <button
                      onClick={() => startTrainingSession(scenario)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <PlayIcon className="h-4 w-4" />
                      <span>Start Training</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Instructions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Training Instructions</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">What Alex Should Do:</h3>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Ask about business type and structure</li>
                      <li>• Determine interstate vs intrastate operations</li>
                      <li>• Identify cargo types and hazmat requirements</li>
                      <li>• Assess fleet size and CDL requirements</li>
                      <li>• Recommend appropriate services</li>
                      <li>• Create deals when appropriate</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <ExclamationIcon className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900">Evaluation Criteria:</h3>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Asks relevant questions</li>
                      <li>• Provides accurate regulatory guidance</li>
                      <li>• Recommends correct services</li>
                      <li>• Creates deals at right time</li>
                      <li>• Maintains professional tone</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation Interface */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      Training: {currentScenario?.name}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Score: {trainingSession?.score || 0}
                      </span>
                      <button
                        onClick={completeTrainingSession}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Complete
                      </button>
                      <button
                        onClick={resetTraining}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Stop
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Conversation Messages */}
                <div className="p-4 h-96 overflow-y-auto space-y-4">
                  {trainingSession?.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'alex' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'alex' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          {message.sender === 'alex' ? (
                            <UserIcon className="h-4 w-4" />
                          ) : (
                            <UserIcon className="h-4 w-4" />
                          )}
                          <span className="text-xs font-medium">
                            {message.sender === 'alex' ? 'Alex' : 'Client'}
                          </span>
                          {message.isCorrect !== undefined && (
                            message.isCorrect ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-400" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 text-red-400" />
                            )
                          )}
                        </div>
                        <p className="text-sm">{message.message}</p>
                        {message.feedback && (
                          <p className="text-xs mt-1 opacity-75">{message.feedback}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Type Alex's response..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && sendAlexResponse()}
                    />
                    <button
                      onClick={sendAlexResponse}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Progress */}
            <div className="space-y-6">
              {/* Current Session Stats */}
              {trainingSession && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Training Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Score:</span>
                      <span className="text-sm font-medium">{trainingSession.score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Messages:</span>
                      <span className="text-sm font-medium">{trainingSession.messages.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Mistakes:</span>
                      <span className="text-sm font-medium text-red-600">{trainingSession.mistakes.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Scenario Details */}
              {currentScenario && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Scenario Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Business:</strong> {currentScenario.clientProfile.businessType}</div>
                    <div><strong>Operation:</strong> {currentScenario.clientProfile.operationType}</div>
                    <div><strong>States:</strong> {currentScenario.clientProfile.states.join(', ')}</div>
                    <div><strong>Cargo:</strong> {currentScenario.clientProfile.cargoTypes.join(', ')}</div>
                    <div><strong>Fleet:</strong> {currentScenario.clientProfile.fleetSize} vehicles</div>
                    <div><strong>CDL:</strong> {currentScenario.clientProfile.hasCDL ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}

              {/* Session History */}
              {sessionHistory.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
                  <div className="space-y-2">
                    {sessionHistory.slice(-3).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium">
                            Session {session.id.slice(-4)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {session.startTime.toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Score: {session.score}
                          </div>
                          <div className="text-xs text-gray-500">
                            {session.mistakes.length} mistakes
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Training Results */}
        {showResults && trainingSession && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Training Session Complete</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm">
                  Training completed successfully
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Final Score:</span> {trainingSession.score}
                </div>
                <div>
                  <span className="font-medium">Messages:</span> {trainingSession.messages.length}
                </div>
                <div>
                  <span className="font-medium">Mistakes:</span> {trainingSession.mistakes.length}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> 
                  {trainingSession.endTime && trainingSession.startTime ? 
                    ` ${Math.round((trainingSession.endTime.getTime() - trainingSession.startTime.getTime()) / 1000)}s` : 
                    ' N/A'
                  }
                </div>
              </div>
              
              {trainingSession.mistakes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-600 mb-2">Areas for Improvement:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {trainingSession.mistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <ExclamationIcon className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <button
                onClick={resetTraining}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Start New Training Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlexOnboardingTrainingCenter;
