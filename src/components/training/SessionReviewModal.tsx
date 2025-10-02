import React, { useState } from 'react';
import {
  XMarkIcon,
  ChartBarIcon,
  ExclamationIcon,
  CheckCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  LightBulbIcon,
  ChatIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/outline';
import { TrainingSession, ConversationMessage } from '../../services/training/ScenarioGenerator';
import { PerformanceScore, TrainingError } from '../../services/training/PerformanceGradingSystem';

interface SessionReviewModalProps {
  session: TrainingSession;
  performanceScore: PerformanceScore;
  isOpen: boolean;
  onClose: () => void;
}

const SessionReviewModal: React.FC<SessionReviewModalProps> = ({
  session,
  performanceScore,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'conversation' | 'analysis' | 'recommendations'>('overview');
  const [selectedMessage, setSelectedMessage] = useState<ConversationMessage | null>(null);

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'conversation', name: 'Conversation', icon: ChatIcon },
    { id: 'analysis', name: 'Analysis', icon: AcademicCapIcon },
    { id: 'recommendations', name: 'Recommendations', icon: LightBulbIcon }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Session Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Session Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {performanceScore.overallScore}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Overall Score</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getGradeColor(performanceScore.grade)} px-3 py-1 rounded-full inline-block`}>
              {performanceScore.grade}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Grade</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {session.duration ? Math.round(session.duration / 60) : 0}m
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {session.conversationHistory.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Messages</div>
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Client Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Business Name</p>
            <p className="font-medium text-gray-900 dark:text-white">{session.client.legalBusinessName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Business Type</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {session.client.businessForm.replace('_', ' ').toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Scenario</p>
            <p className="font-medium text-gray-900 dark:text-white">{session.client.scenario}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Complexity</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {session.client.complexity.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Breakdown</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">USDOT Knowledge</span>
            <span className={`text-sm font-bold ${getScoreColor(performanceScore.detailedBreakdown.usdotKnowledge)}`}>
              {Math.round(performanceScore.detailedBreakdown.usdotKnowledge)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${performanceScore.detailedBreakdown.usdotKnowledge}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversation Quality</span>
            <span className={`text-sm font-bold ${getScoreColor(performanceScore.detailedBreakdown.conversationQuality)}`}>
              {Math.round(performanceScore.detailedBreakdown.conversationQuality)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${performanceScore.detailedBreakdown.conversationQuality}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Regulatory Accuracy</span>
            <span className={`text-sm font-bold ${getScoreColor(performanceScore.detailedBreakdown.regulatoryAccuracy)}`}>
              {Math.round(performanceScore.detailedBreakdown.regulatoryAccuracy)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${performanceScore.detailedBreakdown.regulatoryAccuracy}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConversation = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Conversation History</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {session.conversationHistory.length} messages
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-3">
        {session.conversationHistory.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.speaker === 'agent' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.speaker === 'agent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium opacity-75">
                  {message.speaker === 'agent' ? 'Agent' : 'Client'}
                </span>
                <span className="text-xs opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm">{message.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      {/* Strengths */}
      {performanceScore.strengths.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-4 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {performanceScore.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-green-800 dark:text-green-200">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {performanceScore.weaknesses.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-4 flex items-center">
            <ExclamationIcon className="h-5 w-5 mr-2" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {performanceScore.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <ExclamationIcon className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-red-800 dark:text-red-200">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Criteria */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Detailed Criteria Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(performanceScore.criteria).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className={`text-sm font-bold ${getScoreColor(value)}`}>
                {Math.round(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Errors */}
      {session.errors.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-4">
            Training Errors
          </h3>
          <div className="space-y-3">
            {session.errors.map((error, index) => (
              <div key={index} className="border-l-4 border-yellow-400 pl-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {error}
                  </span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    -{10} points
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4 flex items-center">
          <LightBulbIcon className="h-5 w-5 mr-2" />
          Training Recommendations
        </h3>
        <ul className="space-y-3">
          {performanceScore.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <ArrowRightIcon className="h-4 w-4 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <span className="text-blue-800 dark:text-blue-200">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Next Training Steps</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-700 dark:text-gray-300">Focus on similar scenarios</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Schedule Training
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-700 dark:text-gray-300">Review regulatory updates</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Resources
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-700 dark:text-gray-300">Practice communication skills</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Start Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Training Session Review
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {session.client.legalBusinessName} - {session.client.scenario}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'conversation' && renderConversation()}
            {activeTab === 'analysis' && renderAnalysis()}
            {activeTab === 'recommendations' && renderRecommendations()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Session ID:</span>
              <span className="text-sm font-mono text-gray-900 dark:text-white">{session.id}</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionReviewModal;
