import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  BookOpenIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  ClipboardCheckIcon,
} from '@heroicons/react/outline';

interface KnowledgeBaseItem {
  id: string;
  category: 'regulation' | 'pricing' | 'process' | 'faq' | 'custom';
  title: string;
  content: string;
  tags: string[];
  lastUpdated: Date;
  isActive: boolean;
}

interface TrainingScenario {
  id: string;
  name: string;
  description: string;
  clientData: {
    operationType: string;
    cargoType: string[];
    operationRadius: string;
    vehicles: any[];
    [key: string]: any;
  };
  expectedRegistrations: string[];
  expectedCost: number;
  testResults?: {
    accuracy: number;
    registrations: string[];
    cost: number;
    passed: boolean;
    errors: string[];
  };
}

interface AgentInstructions {
  id: string;
  name: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
  lastUpdated: Date;
}

const OnboardingAgentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'knowledge' | 'instructions' | 'training' | 'testing'>('overview');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([
    {
      id: '1',
      category: 'regulation',
      title: 'USDOT Requirements',
      content: 'All commercial motor vehicle operations require a USDOT number. This includes vehicles with GVWR over 10,000 lbs or vehicles designed to transport 8+ passengers.',
      tags: ['usdot', 'requirements', 'commercial'],
      lastUpdated: new Date(),
      isActive: true
    },
    {
      id: '2',
      category: 'pricing',
      title: 'Rapid Compliance Pricing',
      content: 'USDOT Application: FREE, MC Authority: $300, FF Authority: $250, Broker Authority: $200, Compliance Monitoring: $150, Processing Fee: $50',
      tags: ['pricing', 'cost', 'authority'],
      lastUpdated: new Date(),
      isActive: true
    }
  ]);

  const [trainingScenarios, setTrainingScenarios] = useState<TrainingScenario[]>([
    {
      id: '1',
      name: 'Basic Interstate Trucking',
      description: 'For-hire interstate trucking operation with 2 trucks over 26,000 lbs GVWR',
      clientData: {
        operationType: 'for_hire',
        cargoType: ['general freight'],
        operationRadius: 'interstate',
        vehicles: [
          { type: 'truck', gvwr: 26000, year: 2020, make: 'Freightliner', model: 'Cascadia' },
          { type: 'truck', gvwr: 26000, year: 2021, make: 'Peterbilt', model: '579' }
        ]
      },
      expectedRegistrations: ['usdot', 'mc_authority', 'compliance_monitoring'],
      expectedCost: 450
    },
    {
      id: '2',
      name: 'Private Intrastate Operation',
      description: 'Private operation within one state with vehicles under 26,000 lbs GVWR',
      clientData: {
        operationType: 'private',
        cargoType: ['own goods'],
        operationRadius: 'intrastate',
        vehicles: [
          { type: 'truck', gvwr: 15000, year: 2019, make: 'Ford', model: 'F-750' }
        ]
      },
      expectedRegistrations: ['usdot', 'compliance_monitoring'],
      expectedCost: 200
    },
    {
      id: '3',
      name: 'Hazmat Transportation',
      description: 'For-hire interstate operation transporting hazardous materials',
      clientData: {
        operationType: 'for_hire',
        cargoType: ['hazardous materials', 'general freight'],
        operationRadius: 'interstate',
        vehicles: [
          { type: 'truck', gvwr: 26000, year: 2020, make: 'Volvo', model: 'VNL' }
        ]
      },
      expectedRegistrations: ['usdot', 'mc_authority', 'hazmat', 'compliance_monitoring'],
      expectedCost: 450
    }
  ]);

  const [agentInstructions, setAgentInstructions] = useState<AgentInstructions[]>([
    {
      id: '1',
      name: 'Pricing Policy',
      content: 'Always use Rapid Compliance pricing only. Never discuss FMCSA direct pricing. USDOT application is free, but authorities have costs.',
      priority: 'high',
      isActive: true,
      lastUpdated: new Date()
    },
    {
      id: '2',
      name: 'Authority Requirements',
      content: 'For-hire interstate operations require MC authority. Private operations may not need authority. Always inform clients of additional charges before proceeding.',
      priority: 'high',
      isActive: true,
      lastUpdated: new Date()
    },
    {
      id: '3',
      name: 'Qualified States',
      content: 'Our qualified states list supersedes standard GVWR and passenger thresholds. Always reference this list when determining requirements.',
      priority: 'medium',
      isActive: true,
      lastUpdated: new Date()
    }
  ]);

  const [showAddKnowledge, setShowAddKnowledge] = useState(false);
  const [showAddInstruction, setShowAddInstruction] = useState(false);
  const [showAddScenario, setShowAddScenario] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [testingResults, setTestingResults] = useState<any[]>([]);

  const TabButton: React.FC<{ tab: typeof activeTab; icon: React.ReactNode; label: string; count?: number }> = ({ 
    tab, 
    icon, 
    label, 
    count 
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === tab
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
      {count !== undefined && (
        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
          activeTab === tab
            ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
            : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const runTrainingTest = async (scenario: TrainingScenario) => {
    // Simulate running the training test
    const mockResult = {
      accuracy: Math.random() * 100,
      registrations: scenario.expectedRegistrations,
      cost: scenario.expectedCost,
      passed: Math.random() > 0.3, // 70% pass rate for demo
      errors: Math.random() > 0.7 ? ['Incorrect authority determination'] : []
    };

    setTrainingScenarios(prev => prev.map(s => 
      s.id === scenario.id 
        ? { ...s, testResults: mockResult }
        : s
    ));

    setTestingResults(prev => [...prev, {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      result: mockResult,
      timestamp: new Date()
    }]);
  };

  const runAllTests = async () => {
    for (const scenario of trainingScenarios) {
      await runTrainingTest(scenario);
      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getOverallAccuracy = () => {
    const results = trainingScenarios.filter(s => s.testResults);
    if (results.length === 0) return 0;
    return results.reduce((sum, s) => sum + (s.testResults?.accuracy || 0), 0) / results.length;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Onboarding Agent Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configure, train, and manage your USDOT application onboarding agent
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <TabButton
              tab="overview"
              icon={<ChartBarIcon className="h-4 w-4" />}
              label="Overview"
            />
            <TabButton
              tab="knowledge"
              icon={<BookOpenIcon className="h-4 w-4" />}
              label="Knowledge Base"
              count={knowledgeBase.length}
            />
            <TabButton
              tab="instructions"
              icon={<DocumentTextIcon className="h-4 w-4" />}
              label="Instructions"
              count={agentInstructions.length}
            />
            <TabButton
              tab="training"
              icon={<AcademicCapIcon className="h-4 w-4" />}
              label="Training Scenarios"
              count={trainingScenarios.length}
            />
            <TabButton
              tab="testing"
              icon={<ClipboardCheckIcon className="h-4 w-4" />}
              label="Testing Results"
              count={testingResults.length}
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Knowledge Base</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{knowledgeBase.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Instructions</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{agentInstructions.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <AcademicCapIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Training Scenarios</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{trainingScenarios.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <ClipboardCheckIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accuracy</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{getOverallAccuracy().toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Knowledge Base
                </h3>
                <button
                  onClick={() => setShowAddKnowledge(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Knowledge
                </button>
              </div>

              <div className="space-y-4">
                {knowledgeBase.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.category === 'regulation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          item.category === 'pricing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          item.category === 'process' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {item.category}
                        </span>
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                        {item.isActive ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.content}</p>
                    <div className="flex items-center space-x-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Agent Instructions
                </h3>
                <button
                  onClick={() => setShowAddInstruction(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Instruction
                </button>
              </div>

              <div className="space-y-4">
                {agentInstructions.map((instruction) => (
                  <div key={instruction.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          instruction.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          instruction.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {instruction.priority}
                        </span>
                        <h4 className="font-medium text-gray-900 dark:text-white">{instruction.name}</h4>
                        {instruction.isActive ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingItem(instruction)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{instruction.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'training' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Training Scenarios
                </h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={runAllTests}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Run All Tests
                  </button>
                  <button
                    onClick={() => setShowAddScenario(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Scenario
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {trainingScenarios.map((scenario) => (
                  <div key={scenario.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{scenario.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{scenario.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => runTrainingTest(scenario)}
                          className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800"
                        >
                          <PlayIcon className="h-3 w-3 mr-1" />
                          Test
                        </button>
                        <button
                          onClick={() => setEditingItem(scenario)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Expected Registrations:</h5>
                        <div className="flex flex-wrap gap-1">
                          {scenario.expectedRegistrations.map((reg) => (
                            <span key={reg} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              {reg}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Expected Cost:</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">${scenario.expectedCost}</p>
                      </div>
                    </div>

                    {scenario.testResults && (
                      <div className={`border-t pt-4 ${
                        scenario.testResults.passed ? 'border-green-200 dark:border-green-700' : 'border-red-200 dark:border-red-700'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {scenario.testResults.passed ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${
                              scenario.testResults.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                            }`}>
                              {scenario.testResults.passed ? 'PASSED' : 'FAILED'}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ({scenario.testResults.accuracy.toFixed(1)}% accuracy)
                            </span>
                          </div>
                        </div>
                        {scenario.testResults.errors.length > 0 && (
                          <div className="text-sm text-red-600 dark:text-red-400">
                            Errors: {scenario.testResults.errors.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Testing Results
              </h3>

              {testingResults.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No test results yet. Run some training tests to see results here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testingResults.map((result, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{result.scenarioName}</h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {result.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {result.result.accuracy.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                          <p className={`text-lg font-semibold ${
                            result.result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {result.result.passed ? 'PASSED' : 'FAILED'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Cost</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${result.result.cost}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingAgentManagement;
