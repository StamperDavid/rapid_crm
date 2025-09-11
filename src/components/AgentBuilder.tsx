import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CpuChipIcon,
  DocumentTextIcon,
  CogIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useAgentBuilder } from '../hooks/useAgentBuilder';
import { Agent } from '../types/schema';
import KnowledgeBaseManager from './KnowledgeBaseManager';
import AgentTrainingManager from './AgentTrainingManager';

interface AgentBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentConfig: any) => void;
  editingAgent?: Agent | null;
}

interface AgentFormData {
  name: string;
  description: string;
  type: 'onboarding' | 'customer_service' | 'sales' | 'support' | 'custom';
  status: 'active' | 'inactive' | 'training' | 'error';
  capabilities: string[];
  knowledgeBases: string[];
  rules: string[];
  configuration: {
    model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
    responseFormat: 'conversational' | 'structured' | 'action' | 'persuasive';
    fallbackBehavior: 'escalate_to_human' | 'retry_with_backoff' | 'schedule_callback';
  };
}

const AgentBuilder: React.FC<AgentBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAgent
}) => {
  const {
    knowledgeBases,
    agentTemplates,
    knowledgeBaseLoading,
    agentTemplatesLoading,
    createKnowledgeBase,
    createAgentFromTemplate,
    validateAgentConfiguration,
  } = useAgentBuilder();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    type: 'custom',
    status: 'training',
    capabilities: [],
    knowledgeBases: [],
    rules: [],
    configuration: {
      model: 'gpt-4',
    temperature: 0.7,
      maxTokens: 2000,
    systemPrompt: '',
      responseFormat: 'conversational',
      fallbackBehavior: 'escalate_to_human'
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [showKnowledgeBaseManager, setShowKnowledgeBaseManager] = useState(false);
  const [showTrainingManager, setShowTrainingManager] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (editingAgent && isOpen) {
      setFormData({
        name: editingAgent.name,
        description: editingAgent.description,
        type: editingAgent.type,
        status: editingAgent.status,
        capabilities: editingAgent.capabilities,
        knowledgeBases: editingAgent.knowledgeBases,
        rules: editingAgent.rules,
        configuration: editingAgent.configuration
      });
    } else if (isOpen) {
      // Reset form for new agent
      setFormData({
        name: '',
        description: '',
        type: 'custom',
        status: 'training',
        capabilities: [],
    knowledgeBases: [],
    rules: [],
        configuration: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt: '',
          responseFormat: 'conversational',
          fallbackBehavior: 'escalate_to_human'
        }
      });
    }
  }, [editingAgent, isOpen]);

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Agent name and description' },
    { id: 2, name: 'Configuration', description: 'AI model and behavior settings' },
    { id: 3, name: 'Knowledge & Rules', description: 'Knowledge bases and business rules' },
    { id: 4, name: 'Training Setup', description: 'Configure training data and parameters' },
    { id: 5, name: 'Review & Create', description: 'Review and validate configuration' }
  ];

  const capabilityOptions = [
    'usdot_data_collection',
    'compliance_validation',
    'document_processing',
    'rpa_trigger',
    'regulatory_guidance',
    'account_setup',
    'feature_explanation',
    'troubleshooting',
    'billing_support',
    'technical_help',
    'feature_requests',
    'lead_qualification',
    'demo_scheduling',
    'objection_handling',
    'form_automation',
    'data_entry',
    'document_upload',
    'submission_processing',
    'error_handling',
    'status_reporting'
  ];

  const ruleOptions = [
    'usdot_compliance',
    'data_validation',
    'user_guidance',
    'troubleshooting',
    'support_escalation',
    'billing_guidance',
    'lead_scoring',
    'demo_qualification',
    'form_validation',
    'error_handling'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user makes changes
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleConfigurationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [field]: value
      }
    }));
  };

  const handleCapabilityToggle = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }));
  };

  const handleKnowledgeBaseToggle = (kbId: string) => {
    setFormData(prev => ({
      ...prev,
      knowledgeBases: prev.knowledgeBases.includes(kbId)
        ? prev.knowledgeBases.filter(id => id !== kbId)
        : [...prev.knowledgeBases, kbId]
    }));
  };

  const handleRuleToggle = (rule: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.includes(rule)
        ? prev.rules.filter(r => r !== rule)
        : [...prev.rules, rule]
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Agent name is required';
        if (!formData.description.trim()) newErrors.description = 'Agent description is required';
        break;
      case 2:
        if (!formData.configuration.systemPrompt.trim()) {
          newErrors.systemPrompt = 'System prompt is required';
        }
        if (formData.configuration.temperature < 0 || formData.configuration.temperature > 2) {
          newErrors.temperature = 'Temperature must be between 0 and 2';
        }
        if (formData.configuration.maxTokens < 100 || formData.configuration.maxTokens > 4000) {
          newErrors.maxTokens = 'Max tokens must be between 100 and 4000';
        }
        break;
      case 3:
        if (formData.capabilities.length === 0) {
          newErrors.capabilities = 'At least one capability is required';
        }
        break;
      case 4:
        // Training setup validation - optional step
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleValidateConfiguration = async () => {
    setIsValidating(true);
    try {
      const result = await validateAgentConfiguration(formData.configuration);
      setValidationResult(result);
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResult({
        isValid: false,
        errors: ['Validation service unavailable'],
        warnings: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!validateStep(currentStep)) return;

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save agent:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
    <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agent Name
            </label>
            <input
              type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              placeholder="Enter agent name"
            />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              placeholder="Describe what this agent does"
            />
              {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agent Type
            </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="onboarding">Onboarding</option>
                <option value="customer_service">Customer Service</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="custom">Custom</option>
              </select>
      </div>
    </div>
  );

      case 2:
        return (
    <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Model
                </label>
                <select
                  value={formData.configuration.model}
                  onChange={(e) => handleConfigurationChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude 3</option>
                </select>
              </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response Format
            </label>
            <select
                  value={formData.configuration.responseFormat}
                  onChange={(e) => handleConfigurationChange('responseFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="conversational">Conversational</option>
                  <option value="structured">Structured</option>
                  <option value="action">Action-oriented</option>
                  <option value="persuasive">Persuasive</option>
            </select>
              </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperature ({formData.configuration.temperature})
              </label>
              <input
                type="range"
                min="0"
                  max="2"
                step="0.1"
                  value={formData.configuration.temperature}
                  onChange={(e) => handleConfigurationChange('temperature', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Focused</span>
                <span>Creative</span>
              </div>
                {errors.temperature && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.temperature}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                min="100"
                  max="4000"
                  value={formData.configuration.maxTokens}
                  onChange={(e) => handleConfigurationChange('maxTokens', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    errors.maxTokens ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.maxTokens && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maxTokens}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              System Prompt
            </label>
            <textarea
                value={formData.configuration.systemPrompt}
                onChange={(e) => handleConfigurationChange('systemPrompt', e.target.value)}
              rows={6}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.systemPrompt ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Define the agent's behavior, personality, and instructions..."
              />
              {errors.systemPrompt && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.systemPrompt}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fallback Behavior
            </label>
              <select
                value={formData.configuration.fallbackBehavior}
                onChange={(e) => handleConfigurationChange('fallbackBehavior', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="escalate_to_human">Escalate to Human</option>
                <option value="retry_with_backoff">Retry with Backoff</option>
                <option value="schedule_callback">Schedule Callback</option>
              </select>
          </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Capabilities
            </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {capabilityOptions.map((capability) => (
                  <label key={capability} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                      checked={formData.capabilities.includes(capability)}
                      onChange={() => handleCapabilityToggle(capability)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                </label>
              ))}
            </div>
              {errors.capabilities && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.capabilities}</p>}
          </div>

      <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Knowledge Bases
                </label>
                <button
                  type="button"
                  onClick={() => setShowKnowledgeBaseManager(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Manage Knowledge Bases
            </button>
          </div>
              {knowledgeBaseLoading ? (
                <div className="flex items-center space-x-2">
                  <ArrowPathIcon className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Loading knowledge bases...</span>
                  </div>
              ) : knowledgeBases.length === 0 ? (
                <div className="text-center py-4">
                  <DocumentTextIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No knowledge bases available</p>
            <button 
                    type="button"
                    onClick={() => setShowKnowledgeBaseManager(true)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
                    Create your first knowledge base
            </button>
          </div>
              ) : (
                <div className="space-y-2">
                  {knowledgeBases.map((kb) => (
                    <label key={kb.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.knowledgeBases.includes(kb.id)}
                        onChange={() => handleKnowledgeBaseToggle(kb.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {kb.name}
                      </span>
                    </label>
                  ))}
                    </div>
                      )}
                    </div>

      <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Business Rules
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ruleOptions.map((rule) => (
                  <label key={rule} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                      checked={formData.rules.includes(rule)}
                      onChange={() => handleRuleToggle(rule)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {rule.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>
    </div>
  );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <CpuChipIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Training Setup</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Configure training data and parameters for your agent
              </p>
              <button 
                onClick={() => setShowTrainingManager(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CpuChipIcon className="h-4 w-4 mr-2" />
                Open Training Manager
              </button>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Training is Optional
                  </h3>
                  <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      You can create your agent now and set up training later, or configure training data 
                      to improve your agent's performance with custom datasets.
                </p>
              </div>
                      </div>
        </div>
      </div>
    </div>
  );

      case 5:
        return (
    <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Configuration Summary</h3>
        
            <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{formData.name}</span>
                  </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                  <span className="ml-2 text-gray-900 dark:text-white capitalize">{formData.type}</span>
            </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Model:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{formData.configuration.model}</span>
          </div>
          <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Capabilities:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{formData.capabilities.length}</span>
            </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Knowledge Bases:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{formData.knowledgeBases.length}</span>
                </div>
                      <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Rules:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{formData.rules.length}</span>
                      </div>
            </div>
          </div>

          <div>
              <button
                onClick={handleValidateConfiguration}
                disabled={isValidating}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Validate Configuration
                  </>
                )}
              </button>
            </div>
            
            {validationResult && (
              <div className={`p-4 rounded-lg ${
                validationResult.isValid 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex">
                  {validationResult.isValid ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  )}
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      validationResult.isValid 
                        ? 'text-green-800 dark:text-green-200' 
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {validationResult.isValid ? 'Configuration Valid' : 'Configuration Issues'}
                    </h3>
                    {validationResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-red-700 dark:text-red-300">Errors:</p>
                        <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                          {validationResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
            </div>
                    )}
                    {validationResult.warnings.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">Warnings:</p>
                        <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
                          {validationResult.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                </ul>
              </div>
                    )}
            </div>
          </div>
        </div>
            )}
    </div>
  );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-10 mx-auto p-4 sm:p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800 m-4 sm:m-0">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {editingAgent ? 'Edit Agent' : 'Create New Agent'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {editingAgent ? 'Update agent configuration' : 'Build a custom AI agent for your platform'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8">
            <nav aria-label="Progress">
              <ol className="flex items-center overflow-x-auto pb-2">
                {steps.map((step, stepIdx) => (
                  <li key={step.name} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        currentStep >= step.id
                        ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        {currentStep > step.id ? (
                          <CheckCircleIcon className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{step.id}</span>
                        )}
                      </div>
                      <div className="ml-2 sm:ml-4 min-w-0">
                        <p className={`text-xs sm:text-sm font-medium ${
                          currentStep >= step.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                          {step.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                          {step.description}
                        </p>
                </div>
                    </div>
                    {stepIdx !== steps.length - 1 && (
                      <div className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300 dark:bg-gray-600" />
                    )}
                  </li>
              ))}
              </ol>
            </nav>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0">
                <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              
              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={validationResult ? !validationResult.isValid : false}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingAgent ? 'Update Agent' : 'Create Agent'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Base Manager Modal */}
      <KnowledgeBaseManager
        isOpen={showKnowledgeBaseManager}
        onClose={() => setShowKnowledgeBaseManager(false)}
        selectedIds={formData.knowledgeBases}
        onSelect={(kbId) => {
          if (!formData.knowledgeBases.includes(kbId)) {
            handleKnowledgeBaseToggle(kbId);
          }
        }}
      />

      {/* Training Manager Modal */}
      <AgentTrainingManager
        isOpen={showTrainingManager}
        onClose={() => setShowTrainingManager(false)}
        agentId={editingAgent?.id}
        agentName={formData.name || editingAgent?.name}
      />
    </div>
  );
};

export default AgentBuilder;