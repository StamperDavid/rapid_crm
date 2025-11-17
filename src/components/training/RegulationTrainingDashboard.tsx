/**
 * Regulation Training Dashboard
 * Overview and navigation hub for the AI agent training system
 */

import React, { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  PlayIcon,
  UserIcon,
  ChatIcon
} from '@heroicons/react/outline';
import Tooltip from '../Tooltip';

interface Agent {
  id: string;
  name: string;
  displayName?: string;
  type: string;
  status: string;
  capabilities: string[];
  description: string;
}

const RegulationTrainingDashboard: React.FC = () => {
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  // Load available agents
  useEffect(() => {
    const loadAgents = async () => {
      try {
        // Try to get agents from the API
        const response = await fetch('/api/ai/agents');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.agents) {
            setAvailableAgents(data.agents);
          }
        }
      } catch (error) {
        console.error('Error loading agents:', error);
        // Fallback to default agents if API fails
        setAvailableAgents([
          {
            id: 'onboarding-agent',
            name: 'Onboarding Agent',
            displayName: 'Alex',
            type: 'onboarding',
            status: 'active',
            capabilities: ['USDOT Registration Guidance', 'MC Authority Assessment', 'IFTA Registration Help'],
            description: 'Specialized agent for handling client onboarding and USDOT registration guidance'
          },
          {
            id: 'customer-service',
            name: 'Customer Service Agent',
            displayName: 'Alex',
            type: 'customer-service',
            status: 'active',
            capabilities: ['General Support', 'Troubleshooting', 'Account Management'],
            description: 'Customer service representative for general support and assistance'
          },
          {
            id: 'usdot-onboarding',
            name: 'USDOT Application Agent',
            displayName: 'Alex',
            type: 'custom',
            status: 'active',
            capabilities: ['USDOT Application Guidance', 'Data Collection', 'Form Validation'],
            description: 'Specialized agent for USDOT application assistance and data collection'
          }
        ]);
      } finally {
        setIsLoadingAgents(false);
      }
    };

    loadAgents();
  }, []);

  const startAgentTraining = (agentId: string, trainingType: string) => {
    if (trainingType === 'usdot') {
      // Open USDOT training in a new window for full-screen experience
      const params = new URLSearchParams({ agentId, trainingType });
      const newWindow = window.open(
        `/training/${trainingType}?${params.toString()}`,
        'USDOT_Training',
        'width=1400,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
      );
      
      if (newWindow) {
        newWindow.focus();
        // Also open monitoring dashboard in another window
        const monitoringWindow = window.open(
          `/training/monitoring?agentId=${agentId}`,
          'Training_Monitor',
          'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
        );
        if (monitoringWindow) {
          monitoringWindow.focus();
        }
      }
    } else {
      // Navigate to other training modules normally
      const params = new URLSearchParams({ agentId, trainingType });
      window.location.href = `/training/${trainingType}?${params.toString()}`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          AI Agent Training System
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Test and train AI agents on USDOT registration scenarios to prevent real-world application failures
        </p>
      </div>

      {/* Agent Training Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Start Training Your Agents
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Select an agent and choose a training environment to begin testing their USDOT registration capabilities
        </p>
        
        {isLoadingAgents ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading agents...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Agent Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Agent to Train
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Choose an agent...</option>
                {availableAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.displayName || agent.name} ({agent.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Training Options */}
            {selectedAgent && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <ChatIcon className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Alex Onboarding Training</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Test Alex's conversational guidance and client onboarding skills
                  </p>
                  <button
                    onClick={() => startAgentTraining(selectedAgent, 'alex')}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2"
                  >
                    <PlayIcon className="h-4 w-4" />
                    <span>Start Alex Training</span>
                  </button>
                </div>

                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <ExclamationIcon className="h-6 w-6 text-orange-600 mr-2" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Critical Path Tests</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Test on the 6 most common USDOT failure points
                  </p>
                  <button
                    onClick={() => startAgentTraining(selectedAgent, 'critical-path')}
                    className="w-full px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center justify-center space-x-2"
                  >
                    <PlayIcon className="h-4 w-4" />
                    <span>Start Critical Tests</span>
                  </button>
                </div>

                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <DocumentTextIcon className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">USDOT Interface</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Complete start-to-finish USDOT application (opens in new window with monitoring)
                  </p>
                  <button
                    onClick={() => startAgentTraining(selectedAgent, 'usdot')}
                    className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center space-x-2"
                  >
                    <PlayIcon className="h-4 w-4" />
                    <span>Start USDOT Training</span>
                  </button>
                </div>

                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <ChartBarIcon className="h-6 w-6 text-purple-600 mr-2" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Performance Test</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Comprehensive performance evaluation
                  </p>
                  <button
                    onClick={() => startAgentTraining(selectedAgent, 'monitoring')}
                    className="w-full px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center space-x-2"
                  >
                    <PlayIcon className="h-4 w-4" />
                    <span>Start Performance Test</span>
                  </button>
                </div>
              </div>
            )}

            {/* Agent Details */}
            {selectedAgent && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {(() => {
                  const agent = availableAgents.find(a => a.id === selectedAgent);
                  return agent ? (
                    <div>
                      <div className="flex items-center mb-2">
                        <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {agent.displayName || agent.name}
                        </h4>
                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {agent.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{agent.description}</p>
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Capabilities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent.capabilities.slice(0, 3).map((capability, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                              {capability}
                            </span>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 rounded">
                              +{agent.capabilities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Training Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Alex Onboarding Training */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <ChatIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Alex Onboarding Training
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Test Alex's conversational guidance and client onboarding skills
          </p>
          <button
            onClick={() => window.location.href = '/training/alex'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2"
          >
            <span>Access Alex Training</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* USDOT Training Center */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              USDOT Training Center
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Pixel-perfect FMCSA USDOT registration interface emulation for realistic agent training
          </p>
          <button
            onClick={() => window.location.href = '/training/usdot'}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center space-x-2"
          >
            <span>Access Training Center</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Critical Path Tests */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <ExclamationIcon className="h-8 w-8 text-orange-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Critical Path Tests
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Test agents on the 6 most common USDOT application failure points
          </p>
          <button
            onClick={() => window.location.href = '/training/critical-path'}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center justify-center space-x-2"
          >
            <span>Run Critical Tests</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Performance Monitoring */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Performance Monitoring
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Real-time monitoring and analytics of agent training performance
          </p>
          <button
            onClick={() => window.location.href = '/training/monitoring'}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center space-x-2"
          >
            <span>View Monitoring</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Golden Master System */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <StarIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Golden Master System
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Save and deploy perfect-performing agents as benchmarks for future training
          </p>
          <button
            onClick={() => window.location.href = '/training/monitoring'}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center justify-center space-x-2"
          >
            <span>View Golden Masters</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Qualified States List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-purple-200 dark:border-purple-700">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-8 w-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Qualified States List
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Manage state-specific GVWR and passenger thresholds. Supersedes federal regulations for intrastate operations.
          </p>
          <button
            onClick={() => window.location.href = '/training/qualified-states'}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center space-x-2"
          >
            <span>Manage States List</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          How the Training System Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">1. Train Agents</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI agents practice on realistic USDOT registration scenarios using pixel-perfect government interface emulation
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">2. Real-time Grading</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              System evaluates agent performance step-by-step, identifying mistakes and providing detailed feedback
            </p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <StarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">3. Golden Masters</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Perfect-performing agents (100% accuracy) are saved as Golden Masters and can replace underperforming agents
            </p>
          </div>
        </div>
      </div>

      {/* Critical Path Scenarios */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Critical Path Test Scenarios
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          These 6 scenarios test the most common USDOT application failure points:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <ExclamationIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Sole Proprietor + Hazmat</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tests business entity limitations for hazardous materials</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ExclamationIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Vehicle/Driver Mismatch</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tests fleet size vs driver capacity validation</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ExclamationIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">CDL Requirements</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tests understanding of CDL requirements for heavy vehicles</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ExclamationIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Interstate Commerce</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tests interstate vs intrastate commerce classification</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ExclamationIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Missing Documentation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tests identification of required documents</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ExclamationIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Insurance Coverage</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tests insurance requirement understanding</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegulationTrainingDashboard;