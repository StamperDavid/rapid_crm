import React, { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
  LightBulbIcon
} from '@heroicons/react/outline';
import HelpIcon from '../../components/HelpIcon';

const AgentTraining: React.FC = () => {
  const [trainingSessions, setTrainingSessions] = useState([
    {
      id: 1,
      name: 'USDOT/MC Registration Agent',
      type: 'registration',
      status: 'training',
      progress: 75,
      accuracy: 92,
      lastTrained: '2 hours ago',
      totalSessions: 45,
      successRate: 94,
      isGoldenMaster: false,
      goldenMasterVersion: null,
      description: 'Handles USDOT and MC Number registration forms with pixel-perfect accuracy'
    },
    {
      id: 2,
      name: 'State Registration Agent',
      type: 'registration',
      status: 'ready',
      progress: 100,
      accuracy: 98,
      lastTrained: '1 day ago',
      totalSessions: 32,
      successRate: 97,
      isGoldenMaster: true,
      goldenMasterVersion: 'v1.0',
      description: 'Manages state-specific registration requirements and compliance'
    },
    {
      id: 3,
      name: 'Compliance Monitoring Agent',
      type: 'monitoring',
      status: 'training',
      progress: 60,
      accuracy: 85,
      lastTrained: '3 hours ago',
      totalSessions: 28,
      successRate: 89,
      isGoldenMaster: false,
      goldenMasterVersion: null,
      description: 'Monitors ongoing compliance and sends renewal reminders'
    },
    {
      id: 4,
      name: 'IFTA Registration Agent',
      type: 'registration',
      status: 'ready',
      progress: 100,
      accuracy: 96,
      lastTrained: '2 days ago',
      totalSessions: 38,
      successRate: 95,
      isGoldenMaster: true,
      goldenMasterVersion: 'v1.2',
      description: 'Handles IFTA registration and quarterly reporting requirements'
    }
  ]);

  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [showGoldenMasterModal, setShowGoldenMasterModal] = useState(false);
  const [showAgentReplacementModal, setShowAgentReplacementModal] = useState(false);

  // Golden Master functions
  const createGoldenMaster = (agentId: number) => {
    setTrainingSessions(prev => prev.map(agent => 
      agent.id === agentId 
        ? { 
            ...agent, 
            isGoldenMaster: true, 
            goldenMasterVersion: `v${Date.now()}`,
            status: 'ready'
          }
        : agent
    ));
    setShowGoldenMasterModal(false);
    console.log(`✅ Created Golden Master for agent ${agentId}`);
  };

  const replaceAgentWithGoldenMaster = (agentId: number, goldenMasterId: number) => {
    const goldenMaster = trainingSessions.find(a => a.id === goldenMasterId);
    if (goldenMaster) {
      setTrainingSessions(prev => prev.map(agent => 
        agent.id === agentId 
          ? { 
              ...agent, 
              accuracy: goldenMaster.accuracy,
              successRate: goldenMaster.successRate,
              progress: 100,
              status: 'ready',
              lastTrained: 'Just now (replaced)',
              totalSessions: agent.totalSessions + 1
            }
          : agent
      ));
      setShowAgentReplacementModal(false);
      console.log(`✅ Replaced agent ${agentId} with Golden Master ${goldenMasterId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'training': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'ready': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training': return ClockIcon;
      case 'ready': return CheckCircleIcon;
      case 'error': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-blue-600 mr-3" />
              AI Agent Training
              <HelpIcon 
                content="Train your AI agents to accurately determine DOT compliance requirements and handle client interactions. This is where you create and refine your 'Golden Master' agents."
                size="md"
                position="right"
                className="ml-3"
              />
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Train and optimize AI agents for specific roles and tasks
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <LightBulbIcon className="h-4 w-4 mr-2" />
            New Training Session
          </button>
        </div>
      </div>

      {/* Training Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Active Agents
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {trainingSessions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Avg. Accuracy
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {Math.round(trainingSessions.reduce((acc, agent) => acc + agent.accuracy, 0) / trainingSessions.length)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Ready Agents
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {trainingSessions.filter(agent => agent.status === 'ready').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Training Sessions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {trainingSessions.reduce((acc, agent) => acc + agent.totalSessions, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Training Sessions List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Training Sessions
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Manage and monitor your AI agent training sessions
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {trainingSessions.map((agent) => {
            const StatusIcon = getStatusIcon(agent.status);
            return (
              <li key={agent.id} className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <StatusIcon className={`h-8 w-8 ${getStatusColor(agent.status).split(' ')[0]}`} />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {agent.name}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                        {agent.isGoldenMaster && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            🏆 Golden Master {agent.goldenMasterVersion}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>Accuracy: {agent.accuracy}%</span>
                        <span className="mx-2">•</span>
                        <span>Success Rate: {agent.successRate}%</span>
                        <span className="mx-2">•</span>
                        <span>Last trained: {agent.lastTrained}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {agent.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Progress Bar */}
                    <div className="w-24">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${agent.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                        {agent.progress}%
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-1">
                      {agent.status === 'training' ? (
                        <>
                          <button className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200">
                            <PauseIcon className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200">
                            <StopIcon className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Golden Master Actions */}
                      {agent.accuracy >= 95 && !agent.isGoldenMaster && (
                        <button 
                          onClick={() => {
                            setSelectedAgent(agent.id);
                            setShowGoldenMasterModal(true);
                          }}
                          className="p-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
                          title="Create Golden Master"
                        >
                          🏆
                        </button>
                      )}
                      
                      {agent.accuracy < 90 && trainingSessions.some(a => a.isGoldenMaster && a.type === agent.type) && (
                        <button 
                          onClick={() => {
                            setSelectedAgent(agent.id);
                            setShowAgentReplacementModal(true);
                          }}
                          className="p-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                          title="Replace with Golden Master"
                        >
                          🔄
                        </button>
                      )}
                      
                      <button className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                        <CogIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Golden Master Creation Modal */}
      {showGoldenMasterModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                🏆
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-4">
                Create Golden Master
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This agent has achieved 95%+ accuracy. Create a Golden Master template for future deployments?
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => selectedAgent && createGoldenMaster(selectedAgent)}
                  className="px-4 py-2 bg-yellow-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  Create Golden Master
                </button>
                <button
                  onClick={() => setShowGoldenMasterModal(false)}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agent Replacement Modal */}
      {showAgentReplacementModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20">
                🔄
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-4">
                Replace with Golden Master
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This agent's performance has degraded. Replace with a Golden Master template?
                </p>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Golden Master:
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    {trainingSessions
                      .filter(a => a.isGoldenMaster && a.type === trainingSessions.find(ag => ag.id === selectedAgent)?.type)
                      .map(gm => (
                        <option key={gm.id} value={gm.id}>
                          {gm.name} ({gm.goldenMasterVersion}) - {gm.accuracy}% accuracy
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => {
                    const select = document.querySelector('select') as HTMLSelectElement;
                    const goldenMasterId = parseInt(select.value);
                    selectedAgent && replaceAgentWithGoldenMaster(selectedAgent, goldenMasterId);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  Replace Agent
                </button>
                <button
                  onClick={() => setShowAgentReplacementModal(false)}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentTraining;
