import React, { useState, useEffect, useRef } from 'react';
import {
  BrainIcon,
  ChartBarIcon,
  CogIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon,
  CpuChipIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  RefreshIcon,
  DocumentTextIcon,
  DatabaseIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  SparklesIcon,
  BeakerIcon,
  AdjustmentsHorizontalIcon,
  ChatIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface LearningPattern {
  id: string;
  pattern: string;
  frequency: number;
  successRate: number;
  context: string;
  lastUsed: string;
  improvement: number;
}

interface AdaptationRule {
  id: string;
  trigger: string;
  condition: string;
  action: string;
  effectiveness: number;
  lastTriggered: string;
  status: 'active' | 'testing' | 'paused';
}

interface PerformanceMetric {
  metric: string;
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  target: number;
  confidence: number;
}

interface LearningSession {
  id: string;
  timestamp: string;
  type: 'conversation' | 'feedback' | 'training' | 'optimization';
  input: string;
  output: string;
  feedback?: number;
  improvement: number;
  tags: string[];
}

interface AgentLearningSystemProps {
  agentId: string;
  agentName: string;
  isOpen: boolean;
  onClose: () => void;
}

const AgentLearningSystem: React.FC<AgentLearningSystemProps> = ({
  agentId,
  agentName,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'learning' | 'adaptation' | 'performance' | 'training' | 'analytics'>('overview');
  const [isLearningActive, setIsLearningActive] = useState(true);
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
  const [adaptationRules, setAdaptationRules] = useState<AdaptationRule[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState<LearningPattern | null>(null);
  const [showPatternEditor, setShowPatternEditor] = useState(false);
  const [autoOptimization, setAutoOptimization] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    if (isOpen) {
      loadLearningData();
      startRealTimeUpdates();
    }
    return () => {
      if (realTimeInterval.current) {
        clearInterval(realTimeInterval.current);
      }
    };
  }, [isOpen, agentId]);

  const realTimeInterval = useRef<NodeJS.Timeout | null>(null);

  const loadLearningData = () => {
    // Mock learning patterns
    setLearningPatterns([
      {
        id: '1',
        pattern: 'Customer inquiry about pricing',
        frequency: 45,
        successRate: 94.2,
        context: 'sales_conversation',
        lastUsed: '2024-01-20T14:30:00Z',
        improvement: 12.5
      },
      {
        id: '2',
        pattern: 'Technical support request',
        frequency: 32,
        successRate: 87.8,
        context: 'support_conversation',
        lastUsed: '2024-01-20T13:15:00Z',
        improvement: 8.3
      },
      {
        id: '3',
        pattern: 'Compliance question',
        frequency: 28,
        successRate: 96.1,
        context: 'regulatory_conversation',
        lastUsed: '2024-01-20T12:45:00Z',
        improvement: 15.2
      }
    ]);

    // Mock adaptation rules
    setAdaptationRules([
      {
        id: '1',
        trigger: 'Low satisfaction score',
        condition: 'satisfaction < 3.0',
        action: 'Switch to more empathetic tone',
        effectiveness: 78.5,
        lastTriggered: '2024-01-20T11:20:00Z',
        status: 'active'
      },
      {
        id: '2',
        trigger: 'Complex technical question',
        condition: 'technical_complexity > 0.8',
        action: 'Request human escalation',
        effectiveness: 92.1,
        lastTriggered: '2024-01-20T10:30:00Z',
        status: 'active'
      },
      {
        id: '3',
        trigger: 'Repeated question pattern',
        condition: 'similar_questions > 3',
        action: 'Adapt response based on previous outcomes',
        effectiveness: 85.7,
        lastTriggered: '2024-01-20T09:15:00Z',
        status: 'testing'
      }
    ]);

    // Mock performance metrics
    setPerformanceMetrics([
      {
        metric: 'Response Accuracy',
        current: 94.2,
        previous: 91.8,
        trend: 'up',
        target: 95.0,
        confidence: 0.89
      },
      {
        metric: 'User Satisfaction',
        current: 4.6,
        previous: 4.3,
        trend: 'up',
        target: 4.8,
        confidence: 0.92
      },
      {
        metric: 'Response Time',
        current: 2.1,
        previous: 2.4,
        trend: 'up',
        target: 1.8,
        confidence: 0.85
      },
      {
        metric: 'Learning Rate',
        current: 12.5,
        previous: 10.2,
        trend: 'up',
        target: 15.0,
        confidence: 0.78
      }
    ]);

    // Mock learning sessions
    setLearningSessions([
      {
        id: '1',
        timestamp: '2024-01-20T14:30:00Z',
        type: 'conversation',
        input: 'What are your pricing options?',
        output: 'Here are our three main pricing tiers...',
        feedback: 5,
        improvement: 2.3,
        tags: ['pricing', 'sales', 'positive']
      },
      {
        id: '2',
        timestamp: '2024-01-20T14:15:00Z',
        type: 'feedback',
        input: 'Previous response about compliance',
        output: 'User provided detailed feedback',
        feedback: 4,
        improvement: 1.8,
        tags: ['compliance', 'feedback', 'improvement']
      },
      {
        id: '3',
        timestamp: '2024-01-20T14:00:00Z',
        type: 'training',
        input: 'New regulatory guidelines',
        output: 'Updated knowledge base with latest regulations',
        improvement: 5.2,
        tags: ['training', 'regulatory', 'knowledge']
      }
    ]);
  };

  const startRealTimeUpdates = () => {
    realTimeInterval.current = setInterval(() => {
      // Simulate real-time learning updates
      setLearningPatterns(prev => prev.map(pattern => ({
        ...pattern,
        improvement: pattern.improvement + (Math.random() - 0.5) * 0.5,
        lastUsed: new Date().toISOString()
      })));
    }, 5000);
  };

  const handleStartTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 200);
  };

  const handleOptimizePattern = (patternId: string) => {
    // Simulate pattern optimization
    setLearningPatterns(prev => prev.map(pattern => 
      pattern.id === patternId 
        ? { ...pattern, improvement: pattern.improvement + 5, successRate: Math.min(100, pattern.successRate + 2) }
        : pattern
    ));
  };

  const handleCreateAdaptationRule = () => {
    const newRule: AdaptationRule = {
      id: Date.now().toString(),
      trigger: 'New trigger condition',
      condition: 'condition > threshold',
      action: 'Perform adaptive action',
      effectiveness: 0,
      lastTriggered: '',
      status: 'testing'
    };
    setAdaptationRules(prev => [...prev, newRule]);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  const getMetricColor = (metric: PerformanceMetric) => {
    const percentage = (metric.current / metric.target) * 100;
    if (percentage >= 95) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <BrainIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {agentName} - Learning System
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced AI learning and adaptation engine
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isLearningActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isLearningActive ? 'Learning Active' : 'Learning Paused'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'learning', label: 'Learning Patterns', icon: BrainIcon },
            { id: 'adaptation', label: 'Adaptation Rules', icon: AdjustmentsHorizontalIcon },
            { id: 'performance', label: 'Performance', icon: TrophyIcon },
            { id: 'training', label: 'Training', icon: AcademicCapIcon },
            { id: 'analytics', label: 'Analytics', icon: CpuChipIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Learning Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Learning Rate</p>
                      <p className="text-3xl font-bold">12.5%</p>
                      <p className="text-blue-200 text-sm">+2.3% this week</p>
                    </div>
                    <BrainIcon className="h-12 w-12 text-blue-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Success Rate</p>
                      <p className="text-3xl font-bold">94.2%</p>
                      <p className="text-green-200 text-sm">+2.4% improvement</p>
                    </div>
                    <TrophyIcon className="h-12 w-12 text-green-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Adaptations</p>
                      <p className="text-3xl font-bold">23</p>
                      <p className="text-orange-200 text-sm">Active rules</p>
                    </div>
                    <BoltIcon className="h-12 w-12 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* Recent Learning Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Learning Activity
                </h3>
                <div className="space-y-4">
                  {learningSessions.slice(0, 5).map(session => (
                    <div key={session.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <ChatIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.input}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(session.timestamp).toLocaleString()} • {session.type}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600 font-medium">
                          +{session.improvement}%
                        </span>
                        <span className="text-xs text-gray-500">
                          {session.tags.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Learning Patterns
                </h3>
                <button
                  onClick={() => setShowPatternEditor(true)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Pattern
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {learningPatterns.map(pattern => (
                  <div key={pattern.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{pattern.pattern}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{pattern.context}</p>
                      </div>
                      <button
                        onClick={() => handleOptimizePattern(pattern.id)}
                        className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                      >
                        <SparklesIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Frequency</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{pattern.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Success Rate</p>
                        <p className="text-lg font-semibold text-green-600">{pattern.successRate}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FireIcon className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          +{pattern.improvement}% improvement
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Last used: {new Date(pattern.lastUsed).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'adaptation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Adaptation Rules
                </h3>
                <button
                  onClick={handleCreateAdaptationRule}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Rule
                </button>
              </div>

              <div className="space-y-4">
                {adaptationRules.map(rule => (
                  <div key={rule.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{rule.trigger}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rule.status === 'active' ? 'bg-green-100 text-green-800' :
                            rule.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Condition:</strong> {rule.condition}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Action:</strong> {rule.action}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-600 rounded-lg">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Effectiveness:</span>
                          <span className="ml-1 font-semibold text-green-600">{rule.effectiveness}%</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Last triggered:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">
                            {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance Metrics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{metric.metric}</h4>
                      {getTrendIcon(metric.trend)}
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {metric.current}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          / {metric.target}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Previous: {metric.previous} • Confidence: {(metric.confidence * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (metric.current / metric.target) >= 0.95 ? 'bg-green-500' :
                          (metric.current / metric.target) >= 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, (metric.current / metric.target) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Training & Optimization
                </h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={autoOptimization}
                      onChange={(e) => setAutoOptimization(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Auto-optimization</span>
                  </label>
                </div>
              </div>

              {/* Training Methods */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Training Methods</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Fine-tuning */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center mb-3">
                      <AcademicCapIcon className="h-6 w-6 text-blue-600 mr-3" />
                      <h5 className="font-medium text-gray-900 dark:text-white">Fine-tuning</h5>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Customize pre-trained models with your specific data
                    </p>
                    <button 
                      onClick={() => handleStartTraining('fine-tuning')}
                      disabled={isTraining}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors"
                    >
                      {isTraining ? 'Training...' : 'Start Fine-tuning'}
                    </button>
                  </div>

                  {/* Reinforcement Learning */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center mb-3">
                      <TrophyIcon className="h-6 w-6 text-green-600 mr-3" />
                      <h5 className="font-medium text-gray-900 dark:text-white">Reinforcement Learning</h5>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Train agents through reward-based learning
                    </p>
                    <button 
                      onClick={() => handleStartTraining('reinforcement')}
                      disabled={isTraining}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm transition-colors"
                    >
                      {isTraining ? 'Training...' : 'Start RL Training'}
                    </button>
                  </div>

                  {/* Custom Training */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center mb-3">
                      <CogIcon className="h-6 w-6 text-purple-600 mr-3" />
                      <h5 className="font-medium text-gray-900 dark:text-white">Custom Training</h5>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Create custom training pipelines for specific needs
                    </p>
                    <button 
                      onClick={() => handleStartTraining('custom')}
                      disabled={isTraining}
                      className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm transition-colors"
                    >
                      {isTraining ? 'Training...' : 'Create Pipeline'}
                    </button>
                  </div>
                </div>
              </div>

              {isTraining && (
                <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Training in Progress</h4>
                    <span className="text-sm">{trainingProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                    <div 
                      className="bg-white h-3 rounded-full transition-all duration-300"
                      style={{ width: `${trainingProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-white/90">
                    Optimizing response patterns and improving accuracy...
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Training Data</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Conversation samples</span>
                      <span className="font-semibold text-gray-900 dark:text-white">1,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Feedback data</span>
                      <span className="font-semibold text-gray-900 dark:text-white">892</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Training sessions</span>
                      <span className="font-semibold text-gray-900 dark:text-white">156</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Optimization Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Learning rate</span>
                      <span className="font-semibold text-gray-900 dark:text-white">0.001</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Batch size</span>
                      <span className="font-semibold text-gray-900 dark:text-white">32</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Epochs</span>
                      <span className="font-semibold text-gray-900 dark:text-white">100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Learning Analytics
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Learning Velocity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Patterns learned today</span>
                      <span className="font-semibold text-blue-600">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Adaptations made</span>
                      <span className="font-semibold text-green-600">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Improvement rate</span>
                      <span className="font-semibold text-purple-600">+15.3%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Knowledge Growth</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">New insights</span>
                      <span className="font-semibold text-orange-600">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Knowledge updates</span>
                      <span className="font-semibold text-indigo-600">45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy boost</span>
                      <span className="font-semibold text-emerald-600">+3.2%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Predictions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Next milestone</span>
                      <span className="font-semibold text-cyan-600">95% accuracy</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ETA</span>
                      <span className="font-semibold text-gray-900 dark:text-white">3 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
                      <span className="font-semibold text-yellow-600">87%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentLearningSystem;
