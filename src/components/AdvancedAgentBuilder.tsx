import React, { useState, useEffect } from 'react';
import {
  XIcon,
  DocumentTextIcon,
  ExclamationIcon,
  ChatIcon,
  PencilIcon,
  RefreshIcon,
  CogIcon,
  CloudIcon,
  DocumentAddIcon,
  ChipIcon,
  UserIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  TruckIcon,
  CheckCircleIcon,
} from '@heroicons/react/outline';

interface AdvancedAgentBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentConfig: any) => void;
  editingAgent?: any;
}

const AdvancedAgentBuilder: React.FC<AdvancedAgentBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAgent
}) => {
  const [mode, setMode] = useState<'conversational' | 'text'>('conversational');
  const [currentStep, setCurrentStep] = useState(1);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [agentConfig, setAgentConfig] = useState<any>({
    name: '',
    description: '',
    purpose: '',
    targetWebsite: '',
    registrationType: '',
    criticalRequirements: [],
    errorHandling: '',
    validationRules: [],
    businessLogic: '',
    knowledgeBase: {
      documents: [],
      vectorDatabase: '',
      embeddings: '',
      searchStrategy: '',
      retrievalSettings: {},
      trainingData: [],
      fineTuning: false,
      customPrompts: [],
      contextWindows: [],
      knowledgeValidation: []
    }
  });

  const steps = [
    { id: 1, name: 'Agent Purpose', description: 'Define the agent\'s mission' },
    { id: 2, name: 'Target Analysis', description: 'Analyze the target system' },
    { id: 3, name: 'Knowledge Base', description: 'Configure knowledge sources' },
    { id: 4, name: 'Requirements', description: 'Define critical requirements' },
    { id: 5, name: 'Logic Design', description: 'Design business logic' },
    { id: 6, name: 'Validation', description: 'Define validation rules' },
    { id: 7, name: 'Testing', description: 'Create test scenarios' },
    { id: 8, name: 'Deploy', description: 'Deploy and validate' }
  ];

  const agentCategories = [
    {
      category: 'Government Compliance',
      icon: ShieldCheckIcon,
      color: 'text-red-600',
      agents: [
        'USDOT Number Application',
        'MC Authority Application',
        'Broker Authority Application',
        'Hazmat Endorsement',
        'Biennial Update (MCS-150)',
        'IRP Registration',
        'IFTA Registration',
        'UCR Registration',
        'State DOT Registration',
        'Custom Government Form'
      ]
    },
    {
      category: 'Client Onboarding',
      icon: UserIcon,
      color: 'text-green-600',
      agents: [
        'New Client Intake',
        'Document Collection',
        'Compliance Assessment',
        'Service Selection',
        'Payment Processing',
        'Account Setup',
        'Training & Orientation',
        'Ongoing Support'
      ]
    },
    {
      category: 'Financial Operations',
      icon: CurrencyDollarIcon,
      color: 'text-yellow-600',
      agents: [
        'IFTA Filing',
        'Tax Calculations',
        'Invoice Processing',
        'Payment Tracking',
        'Financial Reporting',
        'Expense Management',
        'Budget Monitoring',
        'Revenue Optimization'
      ]
    }
  ];

  const handleExportAgent = (format: string) => {
    const exportData = {
      agentConfig,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        builderVersion: 'Advanced Agent Builder v2.0',
        format
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agentConfig.name || 'agent'}-${format}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowExportOptions(false);
  };

  const handleExportCode = () => {
    const codeTemplate = `// Generated Agent Configuration
// Exported from Advanced Agent Builder v2.0
// Generated: ${new Date().toISOString()}

const agentConfig = ${JSON.stringify(agentConfig, null, 2)};

// Agent Implementation
class ${agentConfig.name?.replace(/[^a-zA-Z0-9]/g, '') || 'CustomAgent'} {
  constructor(config) {
    this.config = config;
    this.knowledgeBase = config.knowledgeBase;
    this.businessLogic = config.businessLogic;
  }

  async processRequest(input) {
    console.log('Processing request:', input);
    return { success: true, result: 'Processed' };
  }

  async validateInput(input) {
    return { valid: true, errors: [] };
  }
}

module.exports = ${agentConfig.name?.replace(/[^a-zA-Z0-9]/g, '') || 'CustomAgent'};`;

    const blob = new Blob([codeTemplate], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agentConfig.name?.replace(/[^a-zA-Z0-9]/g, '') || 'agent'}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowExportOptions(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ExclamationIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Choose Your Building Mode
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Select how you want to build your government registration agent
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('conversational')}
                className={`p-6 border-2 rounded-lg text-left transition-colors ${
                  mode === 'conversational'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <ChatIcon className="h-8 w-8 text-blue-600 mb-3" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Conversational AI
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chat with our AI to define your agent requirements through natural conversation
                </p>
              </button>

              <button
                onClick={() => setMode('text')}
                className={`p-6 border-2 rounded-lg text-left transition-colors ${
                  mode === 'text'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <PencilIcon className="h-8 w-8 text-blue-600 mb-3" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Direct Text Input
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fill out detailed forms to specify every aspect of your agent
                </p>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Agent Configuration
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Configure your business agent with comprehensive options
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  value={agentConfig.name}
                  onChange={(e) => setAgentConfig((prev: any) => ({...prev, name: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., USDOT Registration Agent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Category *
                </label>
                <select
                  value={agentConfig.registrationType}
                  onChange={(e) => setAgentConfig((prev: any) => ({...prev, registrationType: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select agent category</option>
                  {agentCategories.map(category => (
                    <optgroup key={category.category} label={category.category}>
                      {category.agents.map((agent: string) => (
                        <option key={agent} value={agent}>{agent}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Agent Purpose & Description *
              </label>
              <textarea
                rows={4}
                value={agentConfig.description}
                onChange={(e) => setAgentConfig((prev: any) => ({...prev, description: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Describe in detail what this agent will do..."
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Step {currentStep} - Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Additional configuration steps will be available here.
            </p>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => onSave(agentConfig)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Agent
              </button>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Advanced Agent Builder
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Build mission-critical business agents with comprehensive knowledge base integration
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowExportOptions(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <RefreshIcon className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
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
          <div className="mb-8 min-h-96">
            {renderStepContent()}
          </div>
        </div>
      </div>

      {/* Export Options Modal */}
      {showExportOptions && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Export Agent
                </h3>
                <button
                  onClick={() => setShowExportOptions(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Choose how you want to export your agent configuration
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleExportAgent('configuration')}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">Configuration JSON</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Export agent settings and configuration</div>
                    </div>
                  </div>
                  <RefreshIcon className="h-4 w-4 text-gray-400" />
                </button>
                
                <button
                  onClick={handleExportCode}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-purple-600 mr-3" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">JavaScript Code</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Export as executable JavaScript class</div>
                    </div>
                  </div>
                  <RefreshIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Note: Exported agents can be imported into other systems or used for backup purposes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAgentBuilder;
