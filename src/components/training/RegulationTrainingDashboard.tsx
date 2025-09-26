import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  StopIcon,
  EyeIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  RefreshIcon,
  PlusIcon,
  FilterIcon,
  SearchIcon,
  ArrowUpIcon
} from '@heroicons/react/outline';
import { ScenarioGenerator, FakeClient } from '../../services/training/ScenarioGenerator';
import { RegulatoryKnowledgeBase, StateRequirement } from '../../services/training/RegulatoryKnowledgeBase';

interface TrainingSession {
  id: string;
  agentId: string;
  clientId: string;
  client: FakeClient;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  score?: number;
  conversationHistory: ConversationMessage[];
  errors: string[];
  createdAt: Date;
}

interface ConversationMessage {
  id: string;
  timestamp: Date;
  speaker: 'agent' | 'client';
  message: string;
  context?: any;
}

interface TrainingMetrics {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  averageDuration: number;
  successRate: number;
  topPerformingScenarios: Array<{type: string, score: number}>;
  commonErrors: Array<{error: string, count: number}>;
}

const RegulationTrainingDashboard: React.FC = () => {
  const [scenarioGenerator] = useState(() => ScenarioGenerator.getInstance());
  const [regulatoryKB] = useState(() => RegulatoryKnowledgeBase.getInstance());
  const [availableScenarios, setAvailableScenarios] = useState<any[]>([]);
  const [selectedScenarioTypes, setSelectedScenarioTypes] = useState<string[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [qualifiedStates, setQualifiedStates] = useState<StateRequirement[]>([]);
  const [showRegulatoryTesting, setShowRegulatoryTesting] = useState(false);

  useEffect(() => {
    loadAvailableScenarios();
    loadTrainingSessions();
    calculateMetrics();
    loadQualifiedStates();
  }, []);

  const loadQualifiedStates = () => {
    const saved = localStorage.getItem('qualified_states_config');
    if (saved) {
      const states = JSON.parse(saved);
      setQualifiedStates(states);
      scenarioGenerator.setQualifiedStates(states);
    }
  };

  const saveQualifiedStates = (states: StateRequirement[]) => {
    localStorage.setItem('qualified_states_config', JSON.stringify(states));
    setQualifiedStates(states);
    scenarioGenerator.setQualifiedStates(states);
  };

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const lines = data.split('\n');
        const importedStates: StateRequirement[] = [];

        // Skip header row if present
        const startRow = lines[0]?.toLowerCase().includes('state') ? 1 : 0;

        for (let i = startRow; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Parse CSV line - adjust columns based on your Excel file structure
          // Expected format: StateCode,StateName,GVWRThreshold,PassengerThreshold,SpecialRequirements
          const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
          
          if (columns.length >= 4) {
            const state: StateRequirement = {
              stateCode: columns[0]?.toUpperCase() || '',
              stateName: columns[1] || '',
              gvwrThreshold: parseInt(columns[2]) || 26000,
              passengerThreshold: parseInt(columns[3]) || 9,
              specialRequirements: columns[4] ? columns[4].split(';').map(r => r.trim()) : [],
              notes: `Imported from Excel - GVWR: ${columns[2]} lbs, Passengers: ${columns[3]}`,
              isQualifiedState: true
            };

            if (state.stateCode && state.stateName) {
              importedStates.push(state);
            }
          }
        }

        if (importedStates.length > 0) {
          saveQualifiedStates(importedStates);
          alert(`Successfully imported ${importedStates.length} qualified states from Excel file.`);
        } else {
          alert('No valid qualified states found in the Excel file. Please check the format.');
        }
      } catch (error) {
        console.error('Error importing Excel file:', error);
        alert('Error importing Excel file. Please check the format and try again.');
      }
    };

    reader.readAsText(file);
  };

  const loadAvailableScenarios = () => {
    const scenarios = scenarioGenerator.getAvailableScenarios();
    setAvailableScenarios(scenarios);
  };

  const loadTrainingSessions = () => {
    // Load from localStorage or API
    const saved = localStorage.getItem('regulation_training_sessions');
    if (saved) {
      setTrainingSessions(JSON.parse(saved));
    }
  };

  const saveTrainingSessions = (sessions: TrainingSession[]) => {
    localStorage.setItem('regulation_training_sessions', JSON.stringify(sessions));
    setTrainingSessions(sessions);
  };

  const calculateMetrics = () => {
    if (trainingSessions.length === 0) {
      setMetrics(null);
      return;
    }

    const completed = trainingSessions.filter(s => s.status === 'completed');
    const totalDuration = completed.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalScore = completed.reduce((sum, s) => sum + (s.score || 0), 0);

    // Calculate scenario performance
    const scenarioScores: {[key: string]: number[]} = {};
    completed.forEach(session => {
      if (!scenarioScores[session.client.scenario]) {
        scenarioScores[session.client.scenario] = [];
      }
      if (session.score) {
        scenarioScores[session.client.scenario].push(session.score);
      }
    });

    const topScenarios = Object.entries(scenarioScores)
      .map(([type, scores]) => ({
        type,
        score: scores.reduce((sum, score) => sum + score, 0) / scores.length
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Calculate common errors
    const errorCounts: {[key: string]: number} = {};
    completed.forEach(session => {
      session.errors.forEach(error => {
        errorCounts[error] = (errorCounts[error] || 0) + 1;
      });
    });

    const commonErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setMetrics({
      totalSessions: trainingSessions.length,
      completedSessions: completed.length,
      averageScore: completed.length > 0 ? totalScore / completed.length : 0,
      averageDuration: completed.length > 0 ? totalDuration / completed.length : 0,
      successRate: trainingSessions.length > 0 ? (completed.length / trainingSessions.length) * 100 : 0,
      topPerformingScenarios: topScenarios,
      commonErrors
    });
  };

  const startTrainingSession = async () => {
    if (selectedScenarioTypes.length === 0) {
      alert('Please select at least one scenario type to train on');
      return;
    }

    setIsTraining(true);
    
    try {
      // Generate a random client from selected scenario types
      const scenarioType = selectedScenarioTypes[Math.floor(Math.random() * selectedScenarioTypes.length)];
      const client = scenarioGenerator.generateScenario(scenarioType);
      
      // Create new training session
      const session: TrainingSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agentId: 'onboarding_agent', // Will be configurable
        clientId: client.id,
        client,
        status: 'running',
        startTime: new Date(),
        conversationHistory: [],
        errors: [],
        createdAt: new Date()
      };

      setCurrentSession(session);
      
      // Simulate training conversation
      await simulateTrainingConversation(session);
      
    } catch (error) {
      console.error('Error starting training session:', error);
      alert('Failed to start training session');
    } finally {
      setIsTraining(false);
    }
  };

  const simulateTrainingConversation = async (session: TrainingSession): Promise<void> => {
    const messages: ConversationMessage[] = [];
    
    // Client introduces themselves
    messages.push({
      id: `msg_${Date.now()}_1`,
      timestamp: new Date(),
      speaker: 'client',
      message: `Hi, I'm ${session.client.contact.firstName} ${session.client.contact.lastName} from ${session.client.legalBusinessName}. We're a ${session.client.businessForm.replace('_', ' ')} and we need help with our USDOT registration.`
    });

    // Simulate agent responses and client interactions
    const agentResponses = [
      "I'd be happy to help you with your USDOT registration. Let me gather some information about your business operations.",
      "Based on what you've told me, I need to understand more about your vehicle operations.",
      "Let me check the specific requirements for your type of operation.",
      "I see you have some specialized operations. Let me verify the additional requirements."
    ];

    const clientResponses = [
      "We operate in interstate commerce and transport property for compensation.",
      `We have ${session.client.vehicles.straightTrucks.owned} straight trucks and ${session.client.vehicles.truckTractors.owned} tractors.`,
      `We transport ${session.client.operations.cargoClassifications.join(', ')}.`,
      "We're looking to expand our operations and need to make sure we're compliant."
    ];

    // Simulate conversation flow
    for (let i = 0; i < Math.min(agentResponses.length, clientResponses.length); i++) {
      // Agent response
      messages.push({
        id: `msg_${Date.now()}_${i * 2 + 2}`,
        timestamp: new Date(Date.now() + (i * 2) * 1000),
        speaker: 'agent',
        message: agentResponses[i]
      });

      // Client response
      messages.push({
        id: `msg_${Date.now()}_${i * 2 + 3}`,
        timestamp: new Date(Date.now() + (i * 2 + 1) * 1000),
        speaker: 'client',
        message: clientResponses[i]
      });
    }

    // Update session with conversation
    const updatedSession = {
      ...session,
      conversationHistory: messages,
      status: 'completed' as const,
      endTime: new Date(),
      duration: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
      score: Math.floor(Math.random() * 40) + 60 // 60-100 score
    };

    // Simulate some errors based on scenario complexity
    if (session.client.difficulty > 7) {
      updatedSession.errors.push('Failed to identify hazmat requirements');
    }
    if (session.client.operations.providesBrokerServices) {
      updatedSession.errors.push('Incomplete broker authority explanation');
    }

    // Save session
    const updatedSessions = [...trainingSessions, updatedSession];
    saveTrainingSessions(updatedSessions);
    
    setCurrentSession(null);
    calculateMetrics();
  };

  const stopCurrentSession = () => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        status: 'failed' as const,
        endTime: new Date(),
        duration: Date.now() - currentSession.startTime.getTime(),
        errors: [...currentSession.errors, 'Training session stopped manually']
      };

      const updatedSessions = [...trainingSessions, updatedSession];
      saveTrainingSessions(updatedSessions);
      setCurrentSession(null);
      calculateMetrics();
    }
    setIsTraining(false);
  };

  const filteredSessions = trainingSessions.filter(session => {
    const matchesSearch = !searchQuery || 
      session.client.legalBusinessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.client.scenario.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-blue-600 mr-3" />
            Regulation Training Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Train the onboarding agent to accurately determine required regulatory registrations and services for clients
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowRegulatoryTesting(!showRegulatoryTesting)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <AcademicCapIcon className="h-4 w-4 mr-2" />
            Regulatory Testing
          </button>
          <button
            onClick={startTrainingSession}
            disabled={isTraining || selectedScenarioTypes.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            {isTraining ? 'Training...' : 'Start Training'}
          </button>
          {isTraining && (
            <button
              onClick={stopCurrentSession}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              <StopIcon className="h-4 w-4 mr-2" />
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Current Session */}
      {currentSession && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                Training Session Active
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                Training on: {currentSession.client.scenario} - {currentSession.client.legalBusinessName}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000)}s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Regulatory Testing Panel */}
      {showRegulatoryTesting && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Qualified States Configuration
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Qualified states supersede all other regulatory requirements for GVWR and passenger thresholds
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <ArrowUpIcon className="h-4 w-4 mr-2" />
                Import Excel File
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleExcelImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Qualified States */}
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Current Qualified States ({qualifiedStates.length})
              </h4>
              {qualifiedStates.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {qualifiedStates.map((state, index) => (
                    <div key={state.stateCode} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{state.stateName}</span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({state.stateCode})</span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          GVWR: {state.gvwrThreshold.toLocaleString()} lbs | Passengers: {state.passengerThreshold}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = qualifiedStates.filter(s => s.stateCode !== state.stateCode);
                          saveQualifiedStates(updated);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No qualified states configured</p>
              )}
            </div>

            {/* Add New Qualified State */}
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Add Qualified State</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="State Code (e.g., TX)"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    id="newStateCode"
                  />
                  <input
                    type="text"
                    placeholder="State Name (e.g., Texas)"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    id="newStateName"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="GVWR Threshold (lbs)"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    id="newGvwrThreshold"
                  />
                  <input
                    type="number"
                    placeholder="Passenger Threshold"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    id="newPassengerThreshold"
                  />
                </div>
                <textarea
                  placeholder="Special requirements (IFTA, CARB, etc.) - one per line"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={2}
                  id="newSpecialRequirements"
                />
                <button
                  onClick={() => {
                    const codeInput = document.getElementById('newStateCode') as HTMLInputElement;
                    const nameInput = document.getElementById('newStateName') as HTMLInputElement;
                    const gvwrInput = document.getElementById('newGvwrThreshold') as HTMLInputElement;
                    const passengerInput = document.getElementById('newPassengerThreshold') as HTMLInputElement;
                    const requirementsInput = document.getElementById('newSpecialRequirements') as HTMLTextAreaElement;
                    
                    if (codeInput.value && nameInput.value && gvwrInput.value && passengerInput.value) {
                      const newState: StateRequirement = {
                        stateCode: codeInput.value.toUpperCase(),
                        stateName: nameInput.value,
                        gvwrThreshold: parseInt(gvwrInput.value),
                        passengerThreshold: parseInt(passengerInput.value),
                        specialRequirements: requirementsInput.value.split('\n').filter(r => r.trim()),
                        notes: `Qualified state with GVWR threshold ${gvwrInput.value} lbs and ${passengerInput.value} passenger threshold`,
                        isQualifiedState: true
                      };
                      
                      const updated = [...qualifiedStates, newState];
                      saveQualifiedStates(updated);
                      
                      // Clear inputs
                      codeInput.value = '';
                      nameInput.value = '';
                      gvwrInput.value = '';
                      passengerInput.value = '';
                      requirementsInput.value = '';
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Add Qualified State
                </button>
              </div>
            </div>
          </div>

          {/* Excel File Format Help */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Excel File Format</h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Save your Excel file as CSV format with the following columns:
              </p>
              <div className="text-sm font-mono bg-white dark:bg-gray-800 p-3 rounded border">
                <div className="grid grid-cols-5 gap-4 font-bold text-gray-700 dark:text-gray-300">
                  <div>StateCode</div>
                  <div>StateName</div>
                  <div>GVWRThreshold</div>
                  <div>PassengerThreshold</div>
                  <div>SpecialRequirements</div>
                </div>
                <div className="grid grid-cols-5 gap-4 text-gray-600 dark:text-gray-400 mt-2">
                  <div>TX</div>
                  <div>Texas</div>
                  <div>10000</div>
                  <div>9</div>
                  <div>IFTA</div>
                </div>
                <div className="grid grid-cols-5 gap-4 text-gray-600 dark:text-gray-400">
                  <div>CA</div>
                  <div>California</div>
                  <div>10000</div>
                  <div>9</div>
                  <div>IFTA;CARB</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                <strong>Note:</strong> Special requirements should be separated by semicolons (;). 
                These qualified states will supersede all other regulatory requirements for GVWR and passenger thresholds.
              </p>
            </div>
          </div>

          {/* Regulatory Testing Scenarios */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Regulatory Testing Scenarios</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              These scenarios test the qualified states logic and regulatory compliance
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableScenarios
                .filter(scenario => scenario.isTestScenario)
                .map((scenario) => (
                  <label key={scenario.type} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedScenarioTypes.includes(scenario.type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedScenarioTypes([...selectedScenarioTypes, scenario.type]);
                        } else {
                          setSelectedScenarioTypes(selectedScenarioTypes.filter(t => t !== scenario.type));
                        }
                      }}
                      className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {scenario.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {scenario.description}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        Regulatory Test
                      </span>
                    </div>
                  </label>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sessions</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{metrics.totalSessions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Math.round(metrics.successRate)}%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Score</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Math.round(metrics.averageScore)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Duration</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Math.round(metrics.averageDuration / 60)}m
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Select Training Scenarios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableScenarios.map((scenario) => (
            <label key={scenario.type} className="flex items-start">
              <input
                type="checkbox"
                checked={selectedScenarioTypes.includes(scenario.type)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedScenarioTypes([...selectedScenarioTypes, scenario.type]);
                  } else {
                    setSelectedScenarioTypes(selectedScenarioTypes.filter(t => t !== scenario.type));
                  }
                }}
                className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {scenario.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {scenario.description}
                </p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                  scenario.difficulty <= 3 ? 'bg-green-100 text-green-800' :
                  scenario.difficulty <= 6 ? 'bg-yellow-100 text-yellow-800' :
                  scenario.difficulty <= 8 ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Difficulty: {scenario.difficulty}/10
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Training Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Training Sessions</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="running">Running</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Client & Scenario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Errors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.client.legalBusinessName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {session.client.scenario}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {session.score ? `${session.score}/100` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {session.duration ? `${Math.round(session.duration / 60)}m ${Math.round((session.duration % 60))}s` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {session.errors.length > 0 ? (
                      <span className="text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationIcon className="h-4 w-4 mr-1" />
                        {session.errors.length}
                      </span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <RefreshIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegulationTrainingDashboard;
