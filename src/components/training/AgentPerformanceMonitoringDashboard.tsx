/**
 * Agent Performance Monitoring Dashboard
 * Real-time visual monitoring of AI agent training performance
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationIcon,
  StarIcon,
  UserGroupIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon
} from '@heroicons/react/outline';
import Tooltip from '../Tooltip';

interface AgentPerformance {
  agentId: string;
  agentName: string;
  registrationType: string;
  currentSession?: {
    id: string;
    scenarioName: string;
    progress: number;
    score: number;
    startTime: string;
    status: 'in_progress' | 'completed' | 'failed';
  };
  overallStats: {
    totalSessions: number;
    completedSessions: number;
    averageAccuracy: number;
    averageSpeed: number;
    totalMistakes: number;
    performanceTrend: 'improving' | 'stable' | 'declining';
    lastTrainingDate: string;
  };
  recentMistakes: Array<{
    stepId: string;
    expectedAction: string;
    actualAction: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
  }>;
}

interface TrainingSession {
  id: string;
  agentId: string;
  scenarioName: string;
  registrationType: string;
  difficultyLevel: number;
  startTime: string;
  endTime?: string;
  score: number;
  completed: boolean;
  status: 'in_progress' | 'completed' | 'failed';
}

interface GoldenMaster {
  id: string;
  registrationType: string;
  agentName: string;
  accuracyPercentage: number;
  createdFromSessionId: string;
  createdAt: string;
  performanceMetrics: any;
}

const AgentPerformanceMonitoringDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [activeSessions, setActiveSessions] = useState<TrainingSession[]>([]);
  const [goldenMasters, setGoldenMasters] = useState<GoldenMaster[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedRegistrationType, setSelectedRegistrationType] = useState<string>('USDOT');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch agent performance data
  const fetchAgentPerformance = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/training/agents/performance?registration_type=${selectedRegistrationType}`);
      if (response.ok) {
        const sessions = await response.json();
        
        // Group sessions by agent and calculate performance metrics
        const agentMap = new Map<string, AgentPerformance>();
        
        sessions.forEach((session: any) => {
          if (!agentMap.has(session.agentId)) {
            agentMap.set(session.agentId, {
              agentId: session.agentId,
              agentName: `Agent ${session.agentId}`,
              registrationType: session.registrationType,
              overallStats: {
                totalSessions: 0,
                completedSessions: 0,
                averageAccuracy: 0,
                averageSpeed: 0,
                totalMistakes: 0,
                performanceTrend: 'stable',
                lastTrainingDate: ''
              },
              recentMistakes: []
            });
          }
          
          const agent = agentMap.get(session.agentId)!;
          agent.overallStats.totalSessions++;
          
          if (session.completed) {
            agent.overallStats.completedSessions++;
          }
          
          if (session.endTime && session.startTime) {
            const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
            agent.overallStats.averageSpeed = (agent.overallStats.averageSpeed + duration) / 2;
          }
          
          if (new Date(session.createdAt) > new Date(agent.overallStats.lastTrainingDate)) {
            agent.overallStats.lastTrainingDate = session.createdAt;
          }
        });
        
        // Calculate average accuracy and performance trend
        agentMap.forEach((agent) => {
          const agentSessions = sessions.filter((s: any) => s.agentId === agent.agentId);
          const scores = agentSessions.map((s: any) => s.score);
          agent.overallStats.averageAccuracy = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          
          // Simple trend calculation based on recent vs older scores
          if (scores.length >= 4) {
            const recentScores = scores.slice(0, 2);
            const olderScores = scores.slice(-2);
            const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
            const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
            
            if (recentAvg > olderAvg + 5) {
              agent.overallStats.performanceTrend = 'improving';
            } else if (recentAvg < olderAvg - 5) {
              agent.overallStats.performanceTrend = 'declining';
            } else {
              agent.overallStats.performanceTrend = 'stable';
            }
          }
        });
        
        setAgents(Array.from(agentMap.values()));
      }
    } catch (error) {
      console.error('Error fetching agent performance:', error);
    }
  };

  // Fetch active training sessions
  const fetchActiveSessions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/training/sessions');
      if (response.ok) {
        const sessions = await response.json();
        const active = sessions.filter((session: any) => !session.endTime);
        setActiveSessions(active);
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
  };

  // Fetch Golden Master agents
  const fetchGoldenMasters = async () => {
    try {
      const response = await fetch(`/api/training/golden-masters?registration_type=${selectedRegistrationType}`);
      if (response.ok) {
        const masters = await response.json();
        setGoldenMasters(masters);
      }
    } catch (error) {
      console.error('Error fetching golden masters:', error);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchAgentPerformance();
        fetchActiveSessions();
        fetchGoldenMasters();
      }, refreshInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, selectedRegistrationType]);

  // Initial data fetch
  useEffect(() => {
    fetchAgentPerformance();
    fetchActiveSessions();
    fetchGoldenMasters();
  }, [selectedRegistrationType]);

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-600 bg-green-100';
    if (accuracy >= 85) return 'text-yellow-600 bg-yellow-100';
    if (accuracy >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Agent Performance Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time monitoring of AI agent training performance
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Registration Type Filter */}
          <select
            value={selectedRegistrationType}
            onChange={(e) => setSelectedRegistrationType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USDOT">USDOT</option>
            <option value="UCR">UCR</option>
            <option value="IFTA">IFTA</option>
            <option value="ELD">ELD</option>
            <option value="IRP">IRP</option>
          </select>
          
          {/* Auto-refresh Toggle */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh</span>
          </label>
          
          {/* Refresh Interval */}
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!autoRefresh}
          >
            <option value={2000}>2s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{agents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeSessions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <StarIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Golden Masters</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{goldenMasters.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Accuracy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {agents.length > 0 
                  ? (agents.reduce((sum, agent) => sum + agent.overallStats.averageAccuracy, 0) / agents.length).toFixed(1)
                  : '0.0'
                }%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Agent Performance Overview
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Accuracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Avg Speed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Training
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {agents.map((agent) => (
                <tr key={agent.agentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                            {agent.agentName.charAt(agent.agentName.length - 1)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {agent.agentName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {agent.registrationType}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {agent.overallStats.completedSessions}/{agent.overallStats.totalSessions}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(agent.overallStats.averageAccuracy)}`}>
                      {agent.overallStats.averageAccuracy.toFixed(1)}%
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatDuration(agent.overallStats.averageSpeed)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTrendIcon(agent.overallStats.performanceTrend)}
                      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {agent.overallStats.performanceTrend}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {agent.overallStats.lastTrainingDate 
                      ? new Date(agent.overallStats.lastTrainingDate).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {agent.currentSession ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Training
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Idle
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Active Training Sessions
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {session.scenarioName}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      session.status === 'in_progress' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>Agent: {session.agentId}</div>
                    <div>Difficulty: {session.difficultyLevel}/10</div>
                    <div>Started: {new Date(session.startTime).toLocaleTimeString()}</div>
                    {session.score > 0 && (
                      <div>Current Score: {session.score}%</div>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{session.completed ? '100%' : 'In Progress'}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: session.completed ? '100%' : '50%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Golden Masters */}
      {goldenMasters.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Golden Master Agents
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goldenMasters.map((master) => (
                <div key={master.id} className="border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {master.agentName}
                    </h3>
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>Type: {master.registrationType}</div>
                    <div>Accuracy: {master.accuracyPercentage.toFixed(1)}%</div>
                    <div>Created: {new Date(master.createdAt).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Golden Master
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentPerformanceMonitoringDashboard;
