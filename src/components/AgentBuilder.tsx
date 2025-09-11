import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  CloudIcon,
  CircleStackIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface KnowledgeBase {
  id: string;
  name: string;
  type: 'regulatory' | 'proprietary' | 'general' | 'custom';
  description: string;
  source: 'upload' | 'url' | 'database' | 'api';
  status: 'active' | 'processing' | 'error';
  size: string;
  lastUpdated: string;
}

interface Rule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: string[];
  actions: string[];
  supersedes: string[];
  supersededBy: string[];
  category: 'federal' | 'state' | 'proprietary' | 'operational';
}

interface AgentConfiguration {
  name: string;
  description: string;
  type: 'usdot_application' | 'customer_service' | 'regulatory_compliance' | 'research' | 'custom';
  model: 'gemini-pro' | 'gemini-pro-vision' | 'text-bison' | 'chat-bison';
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  knowledgeBases: string[];
  rules: string[];
  capabilities: string[];
  workflows: Workflow[];
  sentimentAnalysis: {
    enabled: boolean;
    realTimeAnalysis: boolean;
    emotionDetection: boolean;
    urgencyDetection: boolean;
    toneAdaptation: boolean;
    escalationRules: EscalationRule[];
    responseTemplates: ResponseTemplate[];
  };
  googleCloudConfig: {
    projectId: string;
    region: string;
    vertexAI: boolean;
    documentAI: boolean;
    discoveryEngine: boolean;
    naturalLanguageAPI: boolean;
  };
}

interface EscalationRule {
  id: string;
  name: string;
  conditions: {
    sentimentScore?: { min: number; max: number };
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    emotions?: { [key: string]: number };
    keywords?: string[];
  };
  actions: {
    escalateToHuman: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    responseTemplate: string;
    notificationChannels: string[];
  };
}

interface ResponseTemplate {
  id: string;
  name: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'urgent';
  tone: 'professional' | 'friendly' | 'empathetic' | 'urgent' | 'formal' | 'casual';
  template: string;
  variables: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: string[];
  conditions: string[];
}

interface WorkflowStep {
  id: string;
  type: 'data_collection' | 'validation' | 'compliance_check' | 'document_generation' | 'notification';
  name: string;
  config: any;
  nextSteps: string[];
  errorHandling: string;
}

const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: '1',
    name: 'Federal Motor Carrier Safety Regulations',
    type: 'regulatory',
    description: 'Complete FMCSA regulations and compliance requirements',
    source: 'upload',
    status: 'active',
    size: '2.3 MB',
    lastUpdated: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'State Transportation Regulations',
    type: 'regulatory',
    description: 'State-specific transportation and safety regulations',
    source: 'api',
    status: 'active',
    size: '5.7 MB',
    lastUpdated: '2024-01-19T15:45:00Z'
  },
  {
    id: '3',
    name: 'USDOT Application Procedures',
    type: 'proprietary',
    description: 'Internal procedures and best practices for USDOT applications',
    source: 'upload',
    status: 'active',
    size: '1.2 MB',
    lastUpdated: '2024-01-18T09:15:00Z'
  },
  {
    id: '4',
    name: 'Customer Portal Knowledge Base',
    type: 'general',
    description: 'General customer service and account management information',
    source: 'database',
    status: 'processing',
    size: '3.1 MB',
    lastUpdated: '2024-01-17T14:20:00Z'
  }
];

const mockRules: Rule[] = [
  {
    id: '1',
    name: 'Federal Safety Rating Override',
    description: 'Federal safety rating requirements take precedence over state requirements',
    priority: 1,
    conditions: ['federal_safety_rating_exists', 'state_requirements_conflict'],
    actions: ['apply_federal_standards', 'notify_state_compliance'],
    supersedes: ['state_safety_requirements'],
    supersededBy: [],
    category: 'federal'
  },
  {
    id: '2',
    name: 'Hazmat Placard Requirements',
    description: 'Hazmat placard requirements based on cargo type and quantity',
    priority: 2,
    conditions: ['hazmat_cargo_identified', 'quantity_exceeds_threshold'],
    actions: ['require_placards', 'update_operating_authority'],
    supersedes: ['general_cargo_requirements'],
    supersededBy: ['federal_safety_rating_override'],
    category: 'federal'
  },
  {
    id: '3',
    name: 'State-Specific Operating Authority',
    description: 'State-specific requirements for intrastate operations',
    priority: 3,
    conditions: ['intrastate_operation', 'state_authority_required'],
    actions: ['apply_state_requirements', 'generate_state_forms'],
    supersedes: [],
    supersededBy: ['federal_safety_rating_override', 'hazmat_placard_requirements'],
    category: 'state'
  }
];

interface AgentBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agent: AgentConfiguration) => void;
  editingAgent?: any;
}

const AgentBuilder: React.FC<AgentBuilderProps> = ({ isOpen, onClose, onSave, editingAgent }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<AgentConfiguration>({
    name: '',
    description: '',
    type: 'usdot_application',
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 4000,
    systemPrompt: '',
    knowledgeBases: [],
    rules: [],
    capabilities: [],
    workflows: [],
    sentimentAnalysis: {
      enabled: true,
      realTimeAnalysis: true,
      emotionDetection: true,
      urgencyDetection: true,
      toneAdaptation: true,
      escalationRules: [],
      responseTemplates: []
    },
    googleCloudConfig: {
      projectId: '',
      region: 'us-central1',
      vertexAI: true,
      documentAI: true,
      discoveryEngine: true,
      naturalLanguageAPI: true
    }
  });

  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<string[]>([]);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);

  const agentTypes = [
    { value: 'usdot_application', label: 'USDOT Application Agent', icon: DocumentTextIcon, description: 'Collects and processes USDOT application data' },
    { value: 'customer_service', label: 'Customer Service Agent', icon: ChatBubbleLeftRightIcon, description: 'Handles customer inquiries and account management' },
    { value: 'regulatory_compliance', label: 'Regulatory Compliance Agent', icon: CogIcon, description: 'Ensures compliance with federal and state regulations' },
    { value: 'research', label: 'Research Agent', icon: WrenchScrewdriverIcon, description: 'Conducts research and analysis tasks' },
    { value: 'custom', label: 'Custom Agent', icon: UserIcon, description: 'Custom agent for specific use cases' }
  ];

  const models = [
    { value: 'gemini-pro', label: 'Gemini Pro', description: 'Latest Google AI model for complex reasoning' },
    { value: 'gemini-pro-vision', label: 'Gemini Pro Vision', description: 'Multimodal model with vision capabilities' },
    { value: 'text-bison', label: 'Text Bison', description: 'Optimized for text generation tasks' },
    { value: 'chat-bison', label: 'Chat Bison', description: 'Specialized for conversational AI' }
  ];

  const capabilities = [
    'data_collection',
    'form_filling',
    'compliance_checking',
    'document_generation',
    'regulatory_analysis',
    'customer_support',
    'account_management',
    'research_analysis',
    'multilingual_support',
    'voice_interaction'
  ];

  useEffect(() => {
    if (editingAgent) {
      setConfig(editingAgent);
      setSelectedKnowledgeBases(editingAgent.knowledgeBases || []);
      setSelectedRules(editingAgent.rules || []);
    }
  }, [editingAgent]);

  const handleSave = () => {
    const finalConfig = {
      ...config,
      knowledgeBases: selectedKnowledgeBases,
      rules: selectedRules
    };
    onSave(finalConfig);
    onClose();
  };

  const addWorkflow = () => {
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: 'New Workflow',
      description: '',
      steps: [],
      triggers: [],
      conditions: []
    };
    setConfig(prev => ({
      ...prev,
      workflows: [...prev.workflows, newWorkflow]
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agent Name
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter agent name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe what this agent does"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agent Type
            </label>
            <div className="grid grid-cols-1 gap-3">
              {agentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <label key={type.value} className="relative">
                    <input
                      type="radio"
                      name="agentType"
                      value={type.value}
                      checked={config.type === type.value}
                      onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as any }))}
                      className="sr-only"
                    />
                    <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      config.type === type.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}>
                      <div className="flex items-start">
                        <Icon className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{type.label}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Google Cloud AI Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Model
            </label>
            <select
              value={config.model}
              onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {models.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label} - {model.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature ({config.temperature})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Focused</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                value={config.maxTokens}
                onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                min="100"
                max="8000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              System Prompt
            </label>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Define how the agent should behave, its role, and key instructions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Google Cloud Project ID
            </label>
            <input
              type="text"
              value={config.googleCloudConfig.projectId}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                googleCloudConfig: { ...prev.googleCloudConfig, projectId: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="your-gcp-project-id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Google Cloud Services
            </label>
            <div className="space-y-2">
              {[
                { key: 'vertexAI', label: 'Vertex AI', description: 'Advanced AI model training and deployment' },
                { key: 'documentAI', label: 'Document AI', description: 'Document processing and extraction' },
                { key: 'discoveryEngine', label: 'Discovery Engine', description: 'Enterprise search and knowledge discovery' },
                { key: 'naturalLanguageAPI', label: 'Natural Language API', description: 'Sentiment analysis and text understanding' }
              ].map((service) => (
                <label key={service.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.googleCloudConfig[service.key as keyof typeof config.googleCloudConfig] as boolean}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      googleCloudConfig: {
                        ...prev.googleCloudConfig,
                        [service.key]: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.label}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{service.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Knowledge Base Integration</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Available Knowledge Bases</h4>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              <PlusIcon className="h-4 w-4 inline mr-1" />
              Add Knowledge Base
            </button>
          </div>

          <div className="space-y-3">
            {mockKnowledgeBases.map((kb) => (
              <label key={kb.id} className="flex items-start p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedKnowledgeBases.includes(kb.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedKnowledgeBases(prev => [...prev, kb.id]);
                    } else {
                      setSelectedKnowledgeBases(prev => prev.filter(id => id !== kb.id));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">{kb.name}</h5>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      kb.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      kb.status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {kb.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{kb.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="mr-4">Type: {kb.type}</span>
                    <span className="mr-4">Size: {kb.size}</span>
                    <span>Updated: {new Date(kb.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Rule Engine & Conflict Resolution</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Business Rules</h4>
            <button 
              onClick={() => setShowRuleBuilder(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <PlusIcon className="h-4 w-4 inline mr-1" />
              Create Rule
            </button>
          </div>

          <div className="space-y-3">
            {mockRules.map((rule) => (
              <div key={rule.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedRules.includes(rule.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRules(prev => [...prev, rule.id]);
                          } else {
                            setSelectedRules(prev => prev.filter(id => id !== rule.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                      />
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">{rule.name}</h5>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        rule.category === 'federal' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                        rule.category === 'state' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                        rule.category === 'proprietary' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {rule.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rule.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span className="mr-4">Priority: {rule.priority}</span>
                      {rule.supersedes.length > 0 && (
                        <span className="mr-4">Supersedes: {rule.supersedes.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Capabilities & Workflows</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Agent Capabilities</h4>
            <div className="grid grid-cols-2 gap-3">
              {capabilities.map((capability) => (
                <label key={capability} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.capabilities.includes(capability)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig(prev => ({ ...prev, capabilities: [...prev.capabilities, capability] }));
                      } else {
                        setConfig(prev => ({ ...prev, capabilities: prev.capabilities.filter(c => c !== capability) }));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {capability.replace(/_/g, ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Workflows</h4>
              <button 
                onClick={addWorkflow}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <PlusIcon className="h-4 w-4 inline mr-1" />
                Add Workflow
              </button>
            </div>
            
            {config.workflows.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No workflows</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add workflows to define how the agent processes tasks
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {config.workflows.map((workflow) => (
                  <div key={workflow.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">{workflow.name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{workflow.description}</p>
                      </div>
                      <button className="text-red-600 hover:text-red-700">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sentiment Analysis & Emotional Intelligence</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Sentiment Analysis Features</h4>
            <div className="space-y-3">
              {[
                { key: 'enabled', label: 'Enable Sentiment Analysis', description: 'Analyze customer emotions and sentiment in real-time' },
                { key: 'realTimeAnalysis', label: 'Real-time Analysis', description: 'Analyze sentiment as conversations happen' },
                { key: 'emotionDetection', label: 'Emotion Detection', description: 'Detect specific emotions (joy, anger, fear, etc.)' },
                { key: 'urgencyDetection', label: 'Urgency Detection', description: 'Identify urgent and critical situations' },
                { key: 'toneAdaptation', label: 'Tone Adaptation', description: 'Automatically adjust response tone based on sentiment' }
              ].map((feature) => (
                <label key={feature.key} className="flex items-start">
                  <input
                    type="checkbox"
                    checked={config.sentimentAnalysis[feature.key as keyof typeof config.sentimentAnalysis] as boolean}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      sentimentAnalysis: {
                        ...prev.sentimentAnalysis,
                        [feature.key]: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature.label}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Escalation Rules</h4>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                <PlusIcon className="h-4 w-4 inline mr-1" />
                Add Rule
              </button>
            </div>
            
            <div className="space-y-3">
              {config.sentimentAnalysis.escalationRules.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No escalation rules</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add rules to automatically escalate conversations based on sentiment
                  </p>
                </div>
              ) : (
                config.sentimentAnalysis.escalationRules.map((rule) => (
                  <div key={rule.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">{rule.name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Escalate when: {rule.conditions.urgency || 'any urgency'} level detected
                        </p>
                      </div>
                      <button className="text-red-600 hover:text-red-700">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Response Templates</h4>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                <PlusIcon className="h-4 w-4 inline mr-1" />
                Add Template
              </button>
            </div>
            
            <div className="space-y-3">
              {config.sentimentAnalysis.responseTemplates.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <ChatBubbleLeftRightIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No response templates</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add templates for different sentiment scenarios
                  </p>
                </div>
              ) : (
                config.sentimentAnalysis.responseTemplates.map((template) => (
                  <div key={template.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {template.sentiment} sentiment • {template.tone} tone
                        </p>
                      </div>
                      <button className="text-red-600 hover:text-red-700">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Sentiment Analysis Benefits</h4>
                <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Automatically detect customer emotions and urgency levels</li>
                  <li>• Adapt response tone to match customer sentiment</li>
                  <li>• Escalate critical situations to human agents</li>
                  <li>• Improve customer satisfaction with empathetic responses</li>
                  <li>• Reduce response time for urgent issues</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Basic Config', component: renderStep1 },
    { number: 2, title: 'AI Model', component: renderStep2 },
    { number: 3, title: 'Knowledge Base', component: renderStep3 },
    { number: 4, title: 'Rules Engine', component: renderStep4 },
    { number: 5, title: 'Capabilities', component: renderStep5 },
    { number: 6, title: 'Sentiment Analysis', component: renderStep6 },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingAgent ? 'Edit Agent' : 'Create New Agent'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Build a sophisticated AI agent with Google Cloud integration
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.number)}
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      currentStep === step.number
                        ? 'bg-blue-600 text-white'
                        : currentStep > step.number
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </button>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep === step.number
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {steps.find(step => step.number === currentStep)?.component()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-slate-700">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              {currentStep < steps.length ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  {editingAgent ? 'Update Agent' : 'Create Agent'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentBuilder;
