import React, { useState, useEffect } from 'react';
import {
  XIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChipIcon,
  KeyIcon,
  GlobeAltIcon,
  CogIcon,
  SparklesIcon,
  LightningBoltIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  LightBulbIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  DocumentArrowUpIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/outline';
import { integratedAgentCreationService } from '../services/ai/IntegratedAgentCreationService';
import { apiKeyService } from '../services/apiKeys/ApiKeyService';
import EnhancedTooltip from './EnhancedTooltip';

interface AIAgentCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (agent: any) => void;
  editingAgent?: any;
  mode?: 'create' | 'edit';
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const AIAgentCreationWizard: React.FC<AIAgentCreationWizardProps> = ({
  isOpen,
  onClose,
  onAgentCreated,
  editingAgent,
  mode = 'create'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [availableApiKeys, setAvailableApiKeys] = useState<any[]>([]);
  const [agentConfig, setAgentConfig] = useState(() => {
    // Initialize with editingAgent data if in edit mode
    if (mode === 'edit' && editingAgent) {
      return {
        name: editingAgent.name || '',
        description: editingAgent.description || '',
        type: editingAgent.type || 'crm_automation',
        personality: editingAgent.configuration?.personality || {
          communicationStyle: 'friendly',
          responseLength: 'detailed',
          expertise: []
        },
        capabilities: editingAgent.capabilities || [],
        learningProfile: {
          learningRate: editingAgent.configuration?.learningProfile?.learningRate ?? 0.8,
          adaptationSpeed: editingAgent.configuration?.learningProfile?.adaptationSpeed ?? 'fast',
          collaborationPreference: editingAgent.configuration?.learningProfile?.collaborationPreference ?? 'hybrid'
        },
        knowledgeBase: editingAgent.configuration?.knowledgeBase || {
          qualifiedStates: [],
          regulatoryDocuments: [],
          referenceMaterials: []
        },
        autoSelectApiKeys: true,
        preferredPlatforms: editingAgent.configuration?.preferredPlatforms || [],
        createdBy: 'user'
      };
    }
    
    // Default values for create mode
    return {
      name: '',
      description: '',
      type: 'crm_automation',
      personality: {
        communicationStyle: 'friendly',
        responseLength: 'detailed',
        expertise: []
      },
      capabilities: [],
      learningProfile: {
        learningRate: 0.8,
        adaptationSpeed: 'fast',
        collaborationPreference: 'hybrid'
      },
      knowledgeBase: {
        qualifiedStates: [],
        regulatoryDocuments: [],
        referenceMaterials: []
      },
      autoSelectApiKeys: true,
      preferredPlatforms: [],
      createdBy: 'user'
    };
  });

  const steps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Define your agent\'s core identity and purpose',
      icon: UserIcon
    },
    {
      id: 'personality',
      title: 'Personality & Behavior',
      description: 'Customize how your agent communicates and behaves',
      icon: LightBulbIcon
    },
    {
      id: 'capabilities',
      title: 'Capabilities & Skills',
      description: 'Choose what your agent can do and learn',
      icon: CogIcon
    },
    {
      id: 'knowledge_base',
      title: 'Knowledge Base',
      description: 'Upload regulatory data and reference materials',
      icon: BookOpenIcon
    },
    {
      id: 'api_keys',
      title: 'API Integration',
      description: 'Connect your agent to external services',
      icon: KeyIcon
    },
    {
      id: 'learning',
      title: 'Learning Profile',
      description: 'Configure how your agent learns and adapts',
      icon: CogIcon
    },
    {
      id: 'review',
      title: 'Review & Create',
      description: 'Review your agent configuration and create',
      icon: SparklesIcon
    }
  ];

  useEffect(() => {
    if (isOpen) {
      loadApiKeys();
    }
  }, [isOpen]);

  // Update agentConfig when editingAgent changes
  useEffect(() => {
    if (mode === 'edit' && editingAgent) {
      setAgentConfig({
        name: editingAgent.name || '',
        description: editingAgent.description || '',
        type: editingAgent.type || 'crm_automation',
        personality: editingAgent.configuration?.personality || {
          communicationStyle: 'friendly',
          responseLength: 'detailed',
          expertise: []
        },
        capabilities: editingAgent.capabilities || [],
        learningProfile: {
          learningRate: editingAgent.configuration?.learningProfile?.learningRate ?? 0.8,
          adaptationSpeed: editingAgent.configuration?.learningProfile?.adaptationSpeed ?? 'fast',
          collaborationPreference: editingAgent.configuration?.learningProfile?.collaborationPreference ?? 'hybrid'
        },
        autoSelectApiKeys: true,
        preferredPlatforms: editingAgent.configuration?.preferredPlatforms || [],
        createdBy: 'user'
      });
    }
  }, [editingAgent, mode]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsCreating(false);
      // Reset to default values when closing
      if (mode === 'create') {
        setAgentConfig({
          name: '',
          description: '',
          type: 'crm_automation',
          personality: {
            communicationStyle: 'friendly',
            responseLength: 'detailed',
            expertise: []
          },
          capabilities: [],
          learningProfile: {
            learningRate: 0.8,
            adaptationSpeed: 'fast',
            collaborationPreference: 'hybrid'
          },
          autoSelectApiKeys: true,
          preferredPlatforms: [],
          createdBy: 'user'
        });
      }
    }
  }, [isOpen, mode]);

  const loadApiKeys = async () => {
    try {
      const keys = await apiKeyService.getApiKeys();
      setAvailableApiKeys(keys.filter(key => key.status === 'active'));
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateAgent = async () => {
    setIsCreating(true);
    try {
      let agent;
      if (mode === 'edit' && editingAgent) {
        // Update existing agent
        agent = await integratedAgentCreationService.updateAgent(editingAgent.id, agentConfig);
      } else {
        // Create new agent
        agent = await integratedAgentCreationService.createIntegratedAgent(agentConfig);
      }
      onAgentCreated(agent);
      onClose();
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} agent:`, error);
      alert(`Failed to ${mode === 'edit' ? 'update' : 'create'} agent. Please try again.`);
    } finally {
      setIsCreating(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <EnhancedTooltip content="Give your AI agent a descriptive name that clearly indicates its purpose and role. This will help you identify it later when managing multiple agents.">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Agent Name *
          </label>
        </EnhancedTooltip>
        <input
          type="text"
          value={agentConfig.name}
          onChange={(e) => setAgentConfig({ ...agentConfig, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="e.g., Customer Service Assistant"
        />
      </div>

      <div>
        <EnhancedTooltip content="Provide a detailed description of what your agent will do, its main responsibilities, and how it will help your business. This helps the system optimize the agent's configuration.">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
        </EnhancedTooltip>
        <textarea
          value={agentConfig.description}
          onChange={(e) => setAgentConfig({ ...agentConfig, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Describe what this agent will do and how it will help..."
        />
      </div>

      <div>
        <EnhancedTooltip content="Choose the primary category that best describes your agent's main function. This determines which API keys and capabilities will be automatically selected for optimal performance.">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Agent Type *
          </label>
        </EnhancedTooltip>
        <select
          value={agentConfig.type}
          onChange={(e) => setAgentConfig({ ...agentConfig, type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="crm_automation">CRM Automation</option>
          <option value="document_review">Document Review & Analysis</option>
          <option value="form_processing">Form Submission & Processing</option>
          <option value="rpa_automation">Robotic Process Automation (RPA)</option>
          <option value="customer_service">Customer Service</option>
          <option value="sales_workflow">Sales Workflow</option>
          <option value="compliance_monitoring">Compliance & ELD Monitoring</option>
          <option value="data_analysis">Data Analysis & Reporting</option>
          <option value="content_generation">Content Generation</option>
          <option value="voice_assistant">Voice Assistant</option>
          <option value="billing_automation">Billing & Finance</option>
          <option value="fleet_management">Fleet Management</option>
          <option value="ifta_compliance">IFTA Compliance</option>
          <option value="usdot_management">USDOT Management</option>
          <option value="safety_monitoring">Safety & DOT Monitoring</option>
          <option value="load_optimization">Load Planning & Optimization</option>
          <option value="route_planning">Route Planning</option>
          <option value="driver_management">Driver Management</option>
          <option value="vehicle_maintenance">Vehicle Maintenance</option>
          <option value="fuel_management">Fuel Management</option>
          <option value="insurance_tracking">Insurance Tracking</option>
          <option value="permit_management">Permit Management</option>
          <option value="invoice_processing">Invoice Processing</option>
          <option value="payment_tracking">Payment Tracking</option>
          <option value="contract_management">Contract Management</option>
          <option value="supplier_relations">Supplier Relations</option>
          <option value="customer_onboarding">Customer Onboarding</option>
          <option value="onboarding">Onboarding Agent</option>
          <option value="lead_qualification">Lead Qualification</option>
          <option value="market_research">Market Research</option>
          <option value="competitive_analysis">Competitive Analysis</option>
          <option value="workflow_orchestration">Workflow Orchestration</option>
          <option value="api_integration">API Integration</option>
          <option value="database_management">Database Management</option>
          <option value="report_generation">Report Generation</option>
          <option value="alert_management">Alert & Notification Management</option>
          <option value="quality_assurance">Quality Assurance</option>
          <option value="risk_assessment">Risk Assessment</option>
          <option value="audit_preparation">Audit Preparation</option>
          <option value="training_assistant">Training Assistant</option>
          <option value="knowledge_management">Knowledge Management</option>
          <option value="communication_coordinator">Communication Coordinator</option>
          <option value="project_management">Project Management</option>
          <option value="task_scheduler">Task Scheduler</option>
          <option value="event_monitoring">Event Monitoring</option>
          <option value="performance_analytics">Performance Analytics</option>
          <option value="predictive_analytics">Predictive Analytics</option>
          <option value="machine_learning">Machine Learning</option>
          <option value="ai_training">AI Training & Optimization</option>
          <option value="system_monitoring">System Monitoring</option>
          <option value="security_monitoring">Security Monitoring</option>
          <option value="backup_management">Backup Management</option>
          <option value="disaster_recovery">Disaster Recovery</option>
          <option value="integration_testing">Integration Testing</option>
          <option value="performance_testing">Performance Testing</option>
          <option value="user_management">User Management</option>
          <option value="permission_management">Permission Management</option>
          <option value="access_control">Access Control</option>
          <option value="multi_tenant">Multi-Tenant Management</option>
          <option value="custom_workflow">Custom Workflow</option>
        </select>
      </div>
    </div>
  );

  const renderPersonality = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Communication Style
        </label>
        <select
          value={agentConfig.personality.communicationStyle}
          onChange={(e) => setAgentConfig({
            ...agentConfig,
            personality: { ...agentConfig.personality, communicationStyle: e.target.value }
          })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="friendly">Friendly & Approachable</option>
          <option value="professional">Professional & Formal</option>
          <option value="casual">Casual & Relaxed</option>
          <option value="technical">Technical & Precise</option>
          <option value="authoritative">Authoritative & Direct</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Response Length
        </label>
        <select
          value={agentConfig.personality.responseLength}
          onChange={(e) => setAgentConfig({
            ...agentConfig,
            personality: { ...agentConfig.personality, responseLength: e.target.value }
          })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="brief">Brief & Concise</option>
          <option value="detailed">Detailed & Comprehensive</option>
          <option value="comprehensive">Comprehensive & Thorough</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Expertise Areas
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['customer_support', 'data_analysis', 'communication', 'automation', 'sales', 'technical_support'].map((expertise) => (
            <label key={expertise} className="flex items-center">
              <input
                type="checkbox"
                checked={agentConfig.personality.expertise?.includes(expertise) || false}
                onChange={(e) => {
                  const currentExpertise = agentConfig.personality.expertise || [];
                  const expertiseList = e.target.checked
                    ? [...currentExpertise, expertise]
                    : currentExpertise.filter(exp => exp !== expertise);
                  setAgentConfig({
                    ...agentConfig,
                    personality: { ...agentConfig.personality, expertise: expertiseList }
                  });
                }}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                {expertise.replace(/_/g, ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCapabilities = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Core Capabilities
        </label>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'natural_language_processing', name: 'Natural Language Processing', description: 'Advanced text understanding and generation' },
            { id: 'data_analysis', name: 'Data Analysis', description: 'Statistical analysis and insights' },
            { id: 'communication', name: 'Communication', description: 'Multi-channel communication management' },
            { id: 'automation', name: 'Workflow Automation', description: 'Automated task execution and orchestration' },
            { id: 'decision_making', name: 'Decision Making', description: 'Intelligent decision support' },
            { id: 'learning', name: 'Continuous Learning', description: 'Adaptive learning from interactions' }
          ].map((capability) => (
            <label key={capability.id} className="flex items-start p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={agentConfig.capabilities?.includes(capability.id) || false}
                onChange={(e) => {
                  const currentCapabilities = agentConfig.capabilities || [];
                  const capabilities = e.target.checked
                    ? [...currentCapabilities, capability.id]
                    : currentCapabilities.filter(cap => cap !== capability.id);
                  setAgentConfig({ ...agentConfig, capabilities });
                }}
                className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {capability.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {capability.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderApiKeys = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Automatic API Key Integration
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              Your agent will automatically use the best available API keys from your centralized storage.
            </p>
          </div>
        </div>
      </div>

      <div>
        <EnhancedTooltip content="When enabled, the system will automatically select the best API keys from your centralized storage based on the agent type and capabilities. This ensures optimal performance and cost efficiency.">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={agentConfig.autoSelectApiKeys}
              onChange={(e) => setAgentConfig({ ...agentConfig, autoSelectApiKeys: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Automatically select best API keys
            </span>
          </label>
        </EnhancedTooltip>
      </div>

      {!agentConfig.autoSelectApiKeys && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preferred Platforms
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['openai', 'google', 'kixie', 'stripe', 'quickbooks'].map((platform) => (
              <label key={platform} className="flex items-center">
                <input
                  type="checkbox"
                  checked={agentConfig.preferredPlatforms?.includes(platform) || false}
                  onChange={(e) => {
                    const currentPlatforms = agentConfig.preferredPlatforms || [];
                    const platforms = e.target.checked
                      ? [...currentPlatforms, platform]
                      : currentPlatforms.filter(p => p !== platform);
                    setAgentConfig({ ...agentConfig, preferredPlatforms: platforms });
                  }}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {platform}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Available API Keys ({availableApiKeys.length})
        </h4>
        <div className="space-y-2">
          {availableApiKeys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="flex items-center">
                <KeyIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {key.name}
                </span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  ({key.platform})
                </span>
              </div>
              <span className="text-xs text-green-600 dark:text-green-400">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLearning = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Learning Rate
        </label>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          value={agentConfig.learningProfile.learningRate}
          onChange={(e) => setAgentConfig({
            ...agentConfig,
            learningProfile: { ...agentConfig.learningProfile, learningRate: parseFloat(e.target.value) }
          })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Slow (0.1)</span>
          <span>Current: {agentConfig.learningProfile.learningRate}</span>
          <span>Fast (1.0)</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Adaptation Speed
        </label>
        <select
          value={agentConfig.learningProfile.adaptationSpeed}
          onChange={(e) => setAgentConfig({
            ...agentConfig,
            learningProfile: { ...agentConfig.learningProfile, adaptationSpeed: e.target.value }
          })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="slow">Slow & Steady</option>
          <option value="medium">Balanced</option>
          <option value="fast">Fast & Responsive</option>
          <option value="instant">Instant Adaptation</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Collaboration Preference
        </label>
        <select
          value={agentConfig.learningProfile.collaborationPreference}
          onChange={(e) => setAgentConfig({
            ...agentConfig,
            learningProfile: { ...agentConfig.learningProfile, collaborationPreference: e.target.value }
          })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="solo">Independent Worker</option>
          <option value="team">Team Collaborator</option>
          <option value="hybrid">Flexible (Solo + Team)</option>
        </select>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      {/* Current Agent Information (Edit Mode Only) */}
      {mode === 'edit' && editingAgent && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4 flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-2" />
            Current Agent Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Name:</span>
              <span className="ml-2 text-sm text-blue-900 dark:text-blue-100">{editingAgent.name}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Type:</span>
              <span className="ml-2 text-sm text-blue-900 dark:text-blue-100">{editingAgent.type}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Status:</span>
              <span className="ml-2 text-sm text-blue-900 dark:text-blue-100">{editingAgent.status}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Created:</span>
              <span className="ml-2 text-sm text-blue-900 dark:text-blue-100">
                {new Date(editingAgent.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Description:</span>
              <p className="ml-2 text-sm text-blue-900 dark:text-blue-100 mt-1">{editingAgent.description}</p>
            </div>
            {editingAgent.capabilities && editingAgent.capabilities.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Current Capabilities:</span>
                <div className="ml-2 mt-1 flex flex-wrap gap-1">
                  {editingAgent.capabilities.map((capability: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {editingAgent.metrics && (
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Performance Metrics:</span>
                <div className="ml-2 mt-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="text-xs">
                    <span className="text-blue-600 dark:text-blue-400">Interactions:</span>
                    <span className="ml-1 text-blue-900 dark:text-blue-100">{editingAgent.metrics.totalInteractions || 0}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-blue-600 dark:text-blue-400">Success Rate:</span>
                    <span className="ml-1 text-blue-900 dark:text-blue-100">{editingAgent.metrics.successRate || 0}%</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-blue-600 dark:text-blue-400">Avg Response:</span>
                    <span className="ml-1 text-blue-900 dark:text-blue-100">{editingAgent.metrics.averageResponseTime || 0}ms</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-blue-600 dark:text-blue-400">Satisfaction:</span>
                    <span className="ml-1 text-blue-900 dark:text-blue-100">{editingAgent.metrics.userSatisfaction || 0}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Updated Configuration Preview */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {mode === 'edit' ? 'Updated Configuration' : 'Agent Configuration'}
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
            <span className="ml-2 text-sm text-gray-900 dark:text-white">
              {agentConfig.name}
              {mode === 'edit' && editingAgent && agentConfig.name !== editingAgent.name && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                  Changed
                </span>
              )}
            </span>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type:</span>
            <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
              {agentConfig.type.replace(/_/g, ' ')}
            </span>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Description:</span>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{agentConfig.description}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Capabilities:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {agentConfig.capabilities.map((cap) => (
                <span key={cap} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {cap.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">API Integration:</span>
            <span className="ml-2 text-sm text-gray-900 dark:text-white">
              {agentConfig.autoSelectApiKeys ? 'Automatic' : 'Manual Selection'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex">
          <CheckIcon className="h-5 w-5 text-green-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              Ready to Create
            </h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              Your agent will be created with automatic API key integration and will be ready to use immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'basic':
        return renderBasicInfo();
      case 'personality':
        return renderPersonality();
      case 'capabilities':
        return renderCapabilities();
      case 'api_keys':
        return renderApiKeys();
      case 'learning':
        return renderLearning();
      case 'review':
        return renderReview();
      default:
        return null;
    }
  };

  // Render comprehensive settings view for edit mode
  const renderComprehensiveSettings = () => {
    if (!editingAgent) return null;

    return (
      <div className="space-y-8">
        {/* Current Agent Configuration Display */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-2" />
            Current Agent Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {editingAgent.name}</div>
                <div><span className="font-medium">Type:</span> {editingAgent.type}</div>
                <div><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded text-xs ${editingAgent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{editingAgent.status}</span></div>
                <div><span className="font-medium">Description:</span> {editingAgent.description}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Configuration</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Model:</span> {editingAgent.configuration?.model || 'Not set'}</div>
                <div><span className="font-medium">Temperature:</span> {editingAgent.configuration?.temperature || 'Not set'}</div>
                <div><span className="font-medium">Max Tokens:</span> {editingAgent.configuration?.maxTokens || 'Not set'}</div>
                <div><span className="font-medium">Response Format:</span> {editingAgent.configuration?.responseFormat || 'Not set'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* All Settings Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
              Basic Information
            </h3>
            {renderBasicInfo()}
          </div>

          {/* Personality & Behavior */}
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-600" />
              Personality & Behavior
            </h3>
            {renderPersonality()}
          </div>

          {/* Capabilities & Skills */}
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <CogIcon className="h-5 w-5 mr-2 text-green-600" />
              Capabilities & Skills
            </h3>
            {renderCapabilities()}
          </div>

          {/* API Integration */}
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <KeyIcon className="h-5 w-5 mr-2 text-purple-600" />
              API Integration
            </h3>
            {renderApiKeys()}
          </div>

          {/* Learning Profile */}
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <CogIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Learning Profile
            </h3>
            {renderLearning()}
          </div>

          {/* Advanced Settings */}
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-red-600" />
              Advanced Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  System Prompt
                </label>
                <textarea
                  value={editingAgent.configuration?.systemPrompt || ''}
                  onChange={(e) => setAgentConfig({
                    ...agentConfig,
                    systemPrompt: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={6}
                  placeholder="Enter the system prompt that defines how the agent should behave..."
                />
              </div>
              
              {editingAgent.customerFacing && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Human Persona</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {editingAgent.humanPersona?.name || 'Not set'}</div>
                    <div><span className="font-medium">Title:</span> {editingAgent.humanPersona?.title || 'Not set'}</div>
                    <div><span className="font-medium">Role:</span> {editingAgent.humanPersona?.role || 'Not set'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            onClick={() => handleCreateAgent()}
            disabled={isCreating}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Agent...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5 mr-2" />
                Update Agent
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <SparklesIcon className="h-8 w-8 text-purple-600 mr-3" />
              {mode === 'edit' ? 'Update Workflow Agent' : 'Create Workflow Agent'}
            </h2>
            {mode === 'edit' ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Review and modify all agent settings
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        {mode === 'edit' ? (
          renderComprehensiveSettings()
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      index <= currentStep 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }`}>
                      {index < currentStep ? (
                        <CheckIcon className="h-5 w-5" />
                      ) : (
                        React.createElement(step.icon, { className: "h-5 w-5" })
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-2 ${
                        index < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  {React.createElement(steps[currentStep].icon, { className: "h-5 w-5 mr-2" })}
                  {steps[currentStep].title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {steps[currentStep].description}
                </p>
              </div>
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <EnhancedTooltip content="Go back to the previous step to modify your agent configuration.">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Previous
                </button>
              </EnhancedTooltip>

              <div className="flex space-x-2">
                {currentStep === steps.length - 1 ? (
                  <EnhancedTooltip content={mode === 'edit' ? "Update your AI agent with the modified settings. Changes will be applied immediately." : "Create your AI agent with the configured settings. The agent will be automatically connected to your API keys and ready to use immediately."}>
                    <button
                  onClick={handleCreateAgent}
                  disabled={isCreating || (mode === 'create' && (!agentConfig.name || !agentConfig.description))}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      {mode === 'edit' ? 'Update Workflow Agent' : 'Create Workflow Agent'}
                    </>
                  )}
                </button>
              </EnhancedTooltip>
            ) : (
              <EnhancedTooltip content={mode === 'edit' ? "Continue to the next step to review and update agent configuration." : "Continue to the next step in the agent creation process."}>
                <button
                  onClick={handleNext}
                  disabled={mode === 'create' && currentStep === 0 && (!agentConfig.name || !agentConfig.description)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              </EnhancedTooltip>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAgentCreationWizard;
