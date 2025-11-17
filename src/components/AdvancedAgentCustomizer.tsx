import React, { useState, useEffect, useRef } from 'react';
import {
  UserIcon,
  BrainIcon,
  CogIcon,
  DocumentTextIcon,
  DatabaseIcon,
  CloudIcon,
  BeakerIcon,
  SparklesIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  PauseIcon,
  SaveIcon,
  XIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  LightBulbIcon,
  CpuChipIcon,
  ChatIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface PersonaTrait {
  id: string;
  name: string;
  value: number;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface KnowledgeSource {
  id: string;
  name: string;
  type: 'document' | 'api' | 'database' | 'url' | 'manual';
  url?: string;
  content?: string;
  status: 'active' | 'processing' | 'error' | 'inactive';
  lastUpdated: string;
  relevance: number;
}

interface BehaviorRule {
  id: string;
  trigger: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
  effectiveness: number;
}

interface PersonalityProfile {
  id: string;
  name: string;
  description: string;
  traits: PersonaTrait[];
  communicationStyle: string;
  expertise: string[];
  tone: string;
  responseLength: 'brief' | 'moderate' | 'detailed';
}

interface AdvancedAgentCustomizerProps {
  agentId: string;
  agentName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
}

const AdvancedAgentCustomizer: React.FC<AdvancedAgentCustomizerProps> = ({
  agentId,
  agentName,
  isOpen,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'persona' | 'knowledge' | 'behavior' | 'performance' | 'testing' | 'advanced'>('persona');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [personalityProfiles, setPersonalityProfiles] = useState<PersonalityProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<PersonalityProfile | null>(null);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [behaviorRules, setBehaviorRules] = useState<BehaviorRule[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Advanced configuration state
  const [agentInfo, setAgentInfo] = useState({
    name: '',
    displayName: '',
    description: ''
  });

  const [advancedConfig, setAdvancedConfig] = useState({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    stopSequences: [],
    customPrompts: {
      system: '',
      user: '',
      assistant: ''
    },
    learningRate: 0.001,
    batchSize: 32,
    epochs: 100,
    validationSplit: 0.2,
    earlyStopping: true,
    adaptiveLearning: true,
    realTimeOptimization: true,
    aBTesting: false,
    customIntegrations: [],
    webhooks: [],
    apis: []
  });

  useEffect(() => {
    if (isOpen) {
      loadAgentConfiguration();
    }
  }, [isOpen, agentId]);

  const loadAgentConfiguration = () => {
    // Mock data - in real implementation, this would fetch from API
    const mockPersonalityProfiles: PersonalityProfile[] = [
      {
        id: '1',
        name: 'Professional Expert',
        description: 'Knowledgeable and authoritative, perfect for technical support',
        traits: [
          { id: '1', name: 'Expertise', value: 85, description: 'Depth of technical knowledge', impact: 'high' },
          { id: '2', name: 'Empathy', value: 60, description: 'Understanding user emotions', impact: 'medium' },
          { id: '3', name: 'Clarity', value: 90, description: 'Clear communication style', impact: 'high' },
          { id: '4', name: 'Patience', value: 75, description: 'Handling complex questions', impact: 'medium' },
          { id: '5', name: 'Innovation', value: 70, description: 'Creative problem solving', impact: 'low' }
        ],
        communicationStyle: 'Formal and precise',
        expertise: ['Technical Support', 'API Integration', 'System Architecture'],
        tone: 'Professional',
        responseLength: 'detailed'
      },
      {
        id: '2',
        name: 'Friendly Assistant',
        description: 'Warm and approachable, great for customer service',
        traits: [
          { id: '1', name: 'Expertise', value: 70, description: 'Depth of technical knowledge', impact: 'medium' },
          { id: '2', name: 'Empathy', value: 95, description: 'Understanding user emotions', impact: 'high' },
          { id: '3', name: 'Clarity', value: 80, description: 'Clear communication style', impact: 'high' },
          { id: '4', name: 'Patience', value: 90, description: 'Handling complex questions', impact: 'high' },
          { id: '5', name: 'Innovation', value: 60, description: 'Creative problem solving', impact: 'low' }
        ],
        communicationStyle: 'Conversational and warm',
        expertise: ['Customer Service', 'Product Support', 'Billing'],
        tone: 'Friendly',
        responseLength: 'moderate'
      }
    ];

    const mockKnowledgeSources: KnowledgeSource[] = [
      {
        id: '1',
        name: 'Company Documentation',
        type: 'document',
        content: 'Internal company policies and procedures',
        status: 'active',
        lastUpdated: '2024-01-20T10:00:00Z',
        relevance: 95
      },
      {
        id: '2',
        name: 'API Documentation',
        type: 'url',
        url: 'https://api.company.com/docs',
        status: 'active',
        lastUpdated: '2024-01-19T15:30:00Z',
        relevance: 88
      },
      {
        id: '3',
        name: 'Customer Database',
        type: 'database',
        status: 'active',
        lastUpdated: '2024-01-20T09:15:00Z',
        relevance: 92
      }
    ];

    const mockBehaviorRules: BehaviorRule[] = [
      {
        id: '1',
        trigger: 'User frustration detected',
        condition: 'sentiment_score < 0.3',
        action: 'Switch to empathetic tone and offer escalation',
        priority: 1,
        enabled: true,
        effectiveness: 87
      },
      {
        id: '2',
        trigger: 'Technical complexity high',
        condition: 'complexity_score > 0.8',
        action: 'Provide step-by-step guidance with examples',
        priority: 2,
        enabled: true,
        effectiveness: 92
      },
      {
        id: '3',
        trigger: 'Repeated question pattern',
        condition: 'similar_questions > 3',
        action: 'Adapt response based on previous outcomes',
        priority: 3,
        enabled: true,
        effectiveness: 78
      }
    ];

    setPersonalityProfiles(mockPersonalityProfiles);
    setSelectedProfile(mockPersonalityProfiles[0]);
    setKnowledgeSources(mockKnowledgeSources);
    setBehaviorRules(mockBehaviorRules);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const config = {
        agentId,
        personalityProfile: selectedProfile,
        knowledgeSources,
        behaviorRules,
        advancedConfig
      };
      await onSave(config);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save agent configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTraitChange = (traitId: string, value: number) => {
    if (!selectedProfile) return;
    
    setSelectedProfile({
      ...selectedProfile,
      traits: selectedProfile.traits.map(trait =>
        trait.id === traitId ? { ...trait, value } : trait
      )
    });
    setHasChanges(true);
  };

  const handleAddKnowledgeSource = () => {
    const newSource: KnowledgeSource = {
      id: Date.now().toString(),
      name: 'New Knowledge Source',
      type: 'manual',
      status: 'inactive',
      lastUpdated: new Date().toISOString(),
      relevance: 50
    };
    setKnowledgeSources([...knowledgeSources, newSource]);
    setHasChanges(true);
  };

  const handleAddBehaviorRule = () => {
    const newRule: BehaviorRule = {
      id: Date.now().toString(),
      trigger: 'New trigger condition',
      condition: 'condition > threshold',
      action: 'Perform action',
      priority: behaviorRules.length + 1,
      enabled: true,
      effectiveness: 0
    };
    setBehaviorRules([...behaviorRules, newRule]);
    setHasChanges(true);
  };

  const handleTestAgent = async () => {
    setIsTesting(true);
    // Simulate testing process
    setTimeout(() => {
      setTestResults([
        {
          id: '1',
          test: 'Response Quality',
          score: 94,
          status: 'pass',
          details: 'Excellent response quality and relevance'
        },
        {
          id: '2',
          test: 'Personality Consistency',
          score: 89,
          status: 'pass',
          details: 'Maintains consistent personality traits'
        },
        {
          id: '3',
          test: 'Knowledge Accuracy',
          score: 96,
          status: 'pass',
          details: 'High accuracy in knowledge retrieval'
        },
        {
          id: '4',
          test: 'Behavior Adaptation',
          score: 82,
          status: 'warning',
          details: 'Some behavior rules need optimization'
        }
      ]);
      setIsTesting(false);
    }, 3000);
  };

  const getTraitColor = (trait: PersonaTrait) => {
    if (trait.value >= 80) return 'text-green-600 bg-green-100';
    if (trait.value >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <FireIcon className="h-4 w-4 text-red-500" />;
      case 'medium': return <BoltIcon className="h-4 w-4 text-yellow-500" />;
      case 'low': return <StarIcon className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <CpuChipIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Advanced Agent Customizer
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {agentName} • Deep configuration and optimization
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-orange-600">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
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
            { id: 'persona', label: 'Persona', icon: UserIcon },
            { id: 'knowledge', label: 'Knowledge Base', icon: DatabaseIcon },
            { id: 'behavior', label: 'Behavior Rules', icon: AdjustmentsHorizontalIcon },
            { id: 'performance', label: 'Performance', icon: ChartBarIcon },
            { id: 'testing', label: 'Testing', icon: BeakerIcon },
            { id: 'advanced', label: 'Advanced', icon: CogIcon }
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
          {activeTab === 'persona' && (
            <div className="space-y-6">
              {/* Basic Agent Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Agent Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Agent Name *
                    </label>
                    <input
                      type="text"
                      value={agentInfo.name}
                      onChange={(e) => setAgentInfo({...agentInfo, name: e.target.value})}
                      placeholder="e.g., Customer Service Bot"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Functional/technical name for internal use
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Human Display Name
                    </label>
                    <input
                      type="text"
                      value={agentInfo.displayName}
                      onChange={(e) => setAgentInfo({...agentInfo, displayName: e.target.value})}
                      placeholder="e.g., Alex"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Human name for client-facing interactions (optional)
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={agentInfo.description}
                    onChange={(e) => setAgentInfo({...agentInfo, description: e.target.value})}
                    placeholder="Describe what this agent does..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Personality Profile Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Personality Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalityProfiles.map(profile => (
                    <div
                      key={profile.id}
                      onClick={() => setSelectedProfile(profile)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedProfile?.id === profile.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white">{profile.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{profile.description}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Style:</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{profile.communicationStyle}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personality Traits */}
              {selectedProfile && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Personality Traits
                  </h3>
                  <div className="space-y-4">
                    {selectedProfile.traits.map(trait => (
                      <div key={trait.id} className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">{trait.name}</span>
                            {getImpactIcon(trait.impact)}
                            <span className={`px-2 py-1 text-xs rounded-full ${getTraitColor(trait)}`}>
                              {trait.value}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{trait.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={trait.value}
                            onChange={(e) => handleTraitChange(trait.id, parseInt(e.target.value))}
                            className="w-32"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                            {trait.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Communication Style */}
              {selectedProfile && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Communication Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Communication Style
                      </label>
                      <input
                        type="text"
                        value={selectedProfile.communicationStyle}
                        onChange={(e) => setSelectedProfile({
                          ...selectedProfile,
                          communicationStyle: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tone
                      </label>
                      <select
                        value={selectedProfile.tone}
                        onChange={(e) => setSelectedProfile({
                          ...selectedProfile,
                          tone: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Professional">Professional</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Casual">Casual</option>
                        <option value="Formal">Formal</option>
                        <option value="Enthusiastic">Enthusiastic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Response Length
                      </label>
                      <select
                        value={selectedProfile.responseLength}
                        onChange={(e) => setSelectedProfile({
                          ...selectedProfile,
                          responseLength: e.target.value as any
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="brief">Brief</option>
                        <option value="moderate">Moderate</option>
                        <option value="detailed">Detailed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Knowledge Sources
                </h3>
                <button
                  onClick={handleAddKnowledgeSource}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Source
                </button>
              </div>

              <div className="space-y-4">
                {knowledgeSources.map(source => (
                  <div key={source.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{source.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(source.status)}`}>
                            {source.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            Relevance: {source.relevance}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Type: {source.type}</span>
                          {source.url && <span>URL: {source.url}</span>}
                          <span>Updated: {new Date(source.lastUpdated).toLocaleDateString()}</span>
                        </div>
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
                    
                    {source.content && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{source.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'behavior' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Behavior Rules
                </h3>
                <button
                  onClick={handleAddBehaviorRule}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Rule
                </button>
              </div>

              <div className="space-y-4">
                {behaviorRules.map(rule => (
                  <div key={rule.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{rule.trigger}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <span className="text-sm text-gray-500">
                            Priority: {rule.priority}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Condition:</span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">{rule.condition}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Action:</span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">{rule.action}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Effectiveness:</span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">{rule.effectiveness}%</span>
                          </div>
                        </div>
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Agent Testing
                </h3>
                <button
                  onClick={handleTestAgent}
                  disabled={isTesting}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {isTesting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <BeakerIcon className="h-4 w-4 mr-2" />
                      Run Tests
                    </>
                  )}
                </button>
              </div>

              {isTesting && (
                <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                    <div>
                      <h4 className="text-lg font-semibold">Running Comprehensive Tests</h4>
                      <p className="text-sm text-white/90">
                        Testing personality consistency, knowledge accuracy, and behavior adaptation...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {testResults.length > 0 && (
                <div className="space-y-4">
                  {testResults.map(result => (
                    <div key={result.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{result.test}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">{result.score}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            result.status === 'pass' ? 'bg-green-100 text-green-800' :
                            result.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {result.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{result.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Advanced Configuration
                </h3>
                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <CogIcon className="h-4 w-4 mr-2" />
                  {showAdvancedSettings ? 'Hide' : 'Show'} Advanced
                </button>
              </div>

              {showAdvancedSettings && (
                <div className="space-y-6">
                  {/* Model Configuration */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Model Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Model
                        </label>
                        <select
                          value={advancedConfig.model}
                          onChange={(e) => setAdvancedConfig({...advancedConfig, model: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="gpt-4">GPT-4</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          <option value="claude-3">Claude 3</option>
                          <option value="custom">Custom Model</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Temperature: {advancedConfig.temperature}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={advancedConfig.temperature}
                          onChange={(e) => setAdvancedConfig({...advancedConfig, temperature: parseFloat(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Learning Configuration */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Learning Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Learning Rate
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={advancedConfig.learningRate}
                          onChange={(e) => setAdvancedConfig({...advancedConfig, learningRate: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Batch Size
                        </label>
                        <input
                          type="number"
                          value={advancedConfig.batchSize}
                          onChange={(e) => setAdvancedConfig({...advancedConfig, batchSize: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Epochs
                        </label>
                        <input
                          type="number"
                          value={advancedConfig.epochs}
                          onChange={(e) => setAdvancedConfig({...advancedConfig, epochs: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Advanced Features */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Advanced Features</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">Adaptive Learning</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Automatically adjust learning parameters based on performance</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={advancedConfig.adaptiveLearning}
                          onChange={(e) => setAdvancedConfig({...advancedConfig, adaptiveLearning: e.target.checked})}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">Real-time Optimization</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Continuously optimize responses during conversations</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={advancedConfig.realTimeOptimization}
                          onChange={(e) => setAdvancedConfig({...advancedConfig, realTimeOptimization: e.target.checked})}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">A/B Testing</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Test multiple personality variants simultaneously</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={advancedConfig.aBTesting}
                          onChange={(e) => setAdvancedConfig({...advancedConfig, aBTesting: e.target.checked})}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAgentCustomizer;
