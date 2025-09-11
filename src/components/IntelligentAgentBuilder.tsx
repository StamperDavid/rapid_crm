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
  RocketLaunchIcon,
  BeakerIcon,
  CloudIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CurrencyDollarIcon,
  TruckIcon,
  DocumentArrowUpIcon,
  QrCodeIcon,
  HandRaisedIcon,
  LightBulbIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface APIRequirement {
  id: string;
  name: string;
  description: string;
  category: 'ai_model' | 'database' | 'external_api' | 'authentication' | 'payment' | 'communication' | 'file_storage';
  required: boolean;
  provider: string;
  cost: string;
  setupComplexity: 'low' | 'medium' | 'high';
  documentation: string;
  alternatives?: string[];
}

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'customer_service' | 'sales' | 'onboarding' | 'rpa' | 'compliance' | 'data_collection' | 'support';
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: string;
  requiredAPIs: string[];
  features: string[];
  useCases: string[];
  successRate: number;
  icon: any;
}

interface BusinessRequirement {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text' | 'scale';
  options?: string[];
  required: boolean;
  category: string;
}

interface IntelligentAgentBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentConfig: any) => void;
  editingAgent?: any;
}

const IntelligentAgentBuilder: React.FC<IntelligentAgentBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAgent
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [businessRequirements, setBusinessRequirements] = useState<Record<string, any>>({});
  const [recommendedAPIs, setRecommendedAPIs] = useState<APIRequirement[]>([]);
  const [agentConfiguration, setAgentConfiguration] = useState<any>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Business Requirements Questions
  const businessQuestions: BusinessRequirement[] = [
    {
      id: 'primary_goal',
      question: 'What is the primary goal of this agent?',
      type: 'single',
      options: [
        'Collect customer information and data',
        'Provide customer support and answer questions',
        'Qualify leads and schedule sales meetings',
        'Automate repetitive tasks and form filling',
        'Guide users through complex processes',
        'Process payments and handle transactions',
        'Monitor compliance and regulatory requirements'
      ],
      required: true,
      category: 'purpose'
    },
    {
      id: 'target_audience',
      question: 'Who will interact with this agent?',
      type: 'multiple',
      options: [
        'New customers (onboarding)',
        'Existing customers (support)',
        'Potential customers (sales)',
        'Internal staff (automation)',
        'Regulatory bodies (compliance)',
        'Partners and vendors'
      ],
      required: true,
      category: 'audience'
    },
    {
      id: 'complexity_level',
      question: 'How complex are the tasks this agent will handle?',
      type: 'single',
      options: [
        'Simple Q&A and basic information collection',
        'Multi-step processes with decision points',
        'Complex workflows with human handoffs',
        'Full automation with business logic decisions'
      ],
      required: true,
      category: 'complexity'
    },
    {
      id: 'integration_needs',
      question: 'What systems does this agent need to integrate with?',
      type: 'multiple',
      options: [
        'CRM system (companies, contacts, deals)',
        'Payment processing (Stripe, PayPal)',
        'Document management (file uploads)',
        'External APIs (FMCSA, DOT, regulatory)',
        'Communication tools (email, SMS)',
        'Database systems',
        'Third-party services'
      ],
      required: false,
      category: 'integration'
    },
    {
      id: 'compliance_requirements',
      question: 'Are there any compliance or regulatory requirements?',
      type: 'single',
      options: [
        'No special compliance needs',
        'Transportation/DOT compliance',
        'Financial services compliance',
        'Healthcare compliance (HIPAA)',
        'General data protection (GDPR)',
        'Industry-specific regulations'
      ],
      required: false,
      category: 'compliance'
    }
  ];

  // Agent Templates
  const agentTemplates: AgentTemplate[] = [
    {
      id: 'usdot_data_collector',
      name: 'USDOT Data Collection Agent',
      description: 'Specialized agent for collecting USDOT application data with intelligent field mapping',
      category: 'data_collection',
      complexity: 'advanced',
      estimatedSetupTime: '2-3 hours',
      requiredAPIs: ['openai', 'fmcsa_api', 'document_processing'],
      features: [
        'Intelligent form field mapping',
        'Adaptive learning for website changes',
        'Business logic decision making',
        'Human-in-the-loop handoffs',
        'Payment processing integration'
      ],
      useCases: [
        'USDOT number applications',
        'MC Authority applications',
        'Biennial updates (MCS-150)',
        'Compliance document collection'
      ],
      successRate: 94,
      icon: TruckIcon
    },
    {
      id: 'customer_onboarding',
      name: 'Customer Onboarding Agent',
      description: 'Guides new customers through account setup and initial configuration',
      category: 'onboarding',
      complexity: 'intermediate',
      estimatedSetupTime: '1-2 hours',
      requiredAPIs: ['openai', 'crm_api', 'email_service'],
      features: [
        'Step-by-step guidance',
        'Progress tracking',
        'Email notifications',
        'Account verification',
        'Welcome sequence'
      ],
      useCases: [
        'New customer registration',
        'Account setup assistance',
        'Feature introduction',
        'Initial data collection'
      ],
      successRate: 89,
      icon: UserIcon
    },
    {
      id: 'sales_qualifier',
      name: 'Sales Qualification Agent',
      description: 'Qualifies leads and schedules demos for the sales team',
      category: 'sales',
      complexity: 'intermediate',
      estimatedSetupTime: '1-2 hours',
      requiredAPIs: ['openai', 'crm_api', 'calendar_api', 'email_service'],
      features: [
        'Lead scoring',
        'Qualification questions',
        'Demo scheduling',
        'Follow-up automation',
        'Sales team handoff'
      ],
      useCases: [
        'Lead qualification',
        'Demo scheduling',
        'Sales pipeline management',
        'Objection handling'
      ],
      successRate: 87,
      icon: CurrencyDollarIcon
    },
    {
      id: 'customer_support',
      name: 'Customer Support Agent',
      description: 'Handles customer inquiries and provides support assistance',
      category: 'customer_service',
      complexity: 'beginner',
      estimatedSetupTime: '30-60 minutes',
      requiredAPIs: ['openai', 'knowledge_base', 'ticket_system'],
      features: [
        'FAQ responses',
        'Ticket creation',
        'Escalation handling',
        'Knowledge base search',
        'Multi-channel support'
      ],
      useCases: [
        'General inquiries',
        'Technical support',
        'Billing questions',
        'Feature requests'
      ],
      successRate: 92,
      icon: ChatBubbleLeftRightIcon
    },
    {
      id: 'compliance_monitor',
      name: 'Compliance Monitoring Agent',
      description: 'Monitors regulatory compliance and alerts on violations',
      category: 'compliance',
      complexity: 'advanced',
      estimatedSetupTime: '3-4 hours',
      requiredAPIs: ['regulatory_api', 'alerting_system', 'document_analysis'],
      features: [
        'Regulatory monitoring',
        'Compliance alerts',
        'Document analysis',
        'Violation tracking',
        'Reporting automation'
      ],
      useCases: [
        'DOT compliance monitoring',
        'Safety regulation tracking',
        'Document expiration alerts',
        'Audit preparation'
      ],
      successRate: 96,
      icon: ShieldCheckIcon
    }
  ];

  // API Requirements Database
  const apiRequirements: APIRequirement[] = [
    {
      id: 'openai',
      name: 'OpenAI API',
      description: 'GPT-4 for natural language processing and conversation',
      category: 'ai_model',
      required: true,
      provider: 'OpenAI',
      cost: '$0.03/1K tokens',
      setupComplexity: 'low',
      documentation: 'https://platform.openai.com/docs',
      alternatives: ['anthropic_claude', 'google_vertex']
    },
    {
      id: 'fmcsa_api',
      name: 'FMCSA API',
      description: 'Federal Motor Carrier Safety Administration data and forms',
      category: 'external_api',
      required: false,
      provider: 'FMCSA',
      cost: 'Free',
      setupComplexity: 'medium',
      documentation: 'https://ai.fmcsa.dot.gov/',
      alternatives: ['manual_forms', 'third_party_services']
    },
    {
      id: 'stripe',
      name: 'Stripe Payment API',
      description: 'Process payments for USDOT applications and services',
      category: 'payment',
      required: false,
      provider: 'Stripe',
      cost: '2.9% + $0.30 per transaction',
      setupComplexity: 'medium',
      documentation: 'https://stripe.com/docs',
      alternatives: ['paypal', 'square', 'manual_payment']
    },
    {
      id: 'crm_api',
      name: 'CRM API',
      description: 'Access to company, contact, and deal data',
      category: 'database',
      required: true,
      provider: 'Rapid CRM',
      cost: 'Included',
      setupComplexity: 'low',
      documentation: 'Internal API documentation'
    },
    {
      id: 'email_service',
      name: 'Email Service',
      description: 'Send notifications and follow-up emails',
      category: 'communication',
      required: false,
      provider: 'SendGrid',
      cost: '$14.95/month for 40K emails',
      setupComplexity: 'low',
      documentation: 'https://sendgrid.com/docs',
      alternatives: ['ses', 'mailgun', 'postmark']
    },
    {
      id: 'document_processing',
      name: 'Document Processing',
      description: 'Extract and process uploaded documents',
      category: 'file_storage',
      required: false,
      provider: 'AWS Textract',
      cost: '$1.50 per 1,000 pages',
      setupComplexity: 'high',
      documentation: 'https://aws.amazon.com/textract/',
      alternatives: ['google_document_ai', 'azure_form_recognizer']
    }
  ];

  const steps = [
    { id: 1, name: 'Business Analysis', description: 'Understand your requirements' },
    { id: 2, name: 'Agent Recommendation', description: 'AI-powered agent suggestions' },
    { id: 3, name: 'API Configuration', description: 'Configure required integrations' },
    { id: 4, name: 'Agent Setup', description: 'Configure agent behavior and settings' },
    { id: 5, name: 'Deploy & Test', description: 'Deploy and validate your agent' }
  ];

  const handleRequirementChange = (questionId: string, value: any) => {
    setBusinessRequirements(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const analyzeRequirements = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Determine recommended template based on requirements
    const primaryGoal = businessRequirements.primary_goal;
    const complexity = businessRequirements.complexity_level;
    const integrations = businessRequirements.integration_needs || [];
    
    let recommendedTemplate: AgentTemplate | null = null;
    
    if (primaryGoal?.includes('Collect customer information') && integrations.includes('External APIs (FMCSA, DOT, regulatory)')) {
      recommendedTemplate = agentTemplates.find(t => t.id === 'usdot_data_collector') || null;
    } else if (primaryGoal?.includes('Provide customer support')) {
      recommendedTemplate = agentTemplates.find(t => t.id === 'customer_support') || null;
    } else if (primaryGoal?.includes('Qualify leads')) {
      recommendedTemplate = agentTemplates.find(t => t.id === 'sales_qualifier') || null;
    } else if (primaryGoal?.includes('Guide users through')) {
      recommendedTemplate = agentTemplates.find(t => t.id === 'customer_onboarding') || null;
    } else if (primaryGoal?.includes('Monitor compliance')) {
      recommendedTemplate = agentTemplates.find(t => t.id === 'compliance_monitor') || null;
    }
    
    setSelectedTemplate(recommendedTemplate);
    
    // Determine required APIs
    if (recommendedTemplate) {
      const requiredAPIs = apiRequirements.filter(api => 
        recommendedTemplate!.requiredAPIs.includes(api.id) ||
        (integrations.includes('Payment processing') && api.id === 'stripe') ||
        (integrations.includes('Communication tools') && api.id === 'email_service') ||
        (integrations.includes('Document management') && api.id === 'document_processing')
      );
      setRecommendedAPIs(requiredAPIs);
    }
    
    setIsAnalyzing(false);
    setCurrentStep(2);
  };

  const renderBusinessAnalysisStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <LightBulbIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Let's Build Your Perfect Agent
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Answer a few questions to help us recommend the best agent type and configuration for your needs.
        </p>
      </div>

      <div className="space-y-6">
        {businessQuestions.map((question) => (
          <div key={question.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h4>
            
            {question.type === 'single' && question.options && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={businessRequirements[question.id] === option}
                      onChange={(e) => handleRequirementChange(question.id, e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'multiple' && question.options && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(businessRequirements[question.id] || []).includes(option)}
                      onChange={(e) => {
                        const current = businessRequirements[question.id] || [];
                        const updated = e.target.checked
                          ? [...current, option]
                          : current.filter((item: string) => item !== option);
                        handleRequirementChange(question.id, updated);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={analyzeRequirements}
          disabled={isAnalyzing || !businessRequirements.primary_goal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Requirements...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Get AI Recommendations
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderRecommendationStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          AI Recommendation
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Based on your requirements, here's our recommended agent configuration.
        </p>
      </div>

      {selectedTemplate && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <selectedTemplate.icon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {selectedTemplate.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedTemplate.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Complexity</span>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedTemplate.complexity}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Setup Time</span>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedTemplate.estimatedSetupTime}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</span>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedTemplate.successRate}%</p>
                </div>
              </div>

              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Key Features</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.features.map((feature, index) => (
                    <span key={index} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Use Cases</h5>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {selectedTemplate.useCases.map((useCase, index) => (
                    <li key={index}>{useCase}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Back to Requirements
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Configure APIs
          <ArrowPathIcon className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );

  const renderAPIConfigurationStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CloudIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          API Configuration
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure the APIs and integrations your agent will need to operate.
        </p>
      </div>

      <div className="space-y-4">
        {recommendedAPIs.map((api) => (
          <div key={api.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  api.category === 'ai_model' ? 'bg-purple-100 dark:bg-purple-900/20' :
                  api.category === 'payment' ? 'bg-green-100 dark:bg-green-900/20' :
                  api.category === 'external_api' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  'bg-gray-100 dark:bg-gray-900/20'
                }`}>
                  <CogIcon className={`h-5 w-5 ${
                    api.category === 'ai_model' ? 'text-purple-600' :
                    api.category === 'payment' ? 'text-green-600' :
                    api.category === 'external_api' ? 'text-blue-600' :
                    'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{api.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{api.description}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  api.required 
                    ? 'text-red-600 bg-red-100 dark:bg-red-900/20'
                    : 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
                }`}>
                  {api.required ? 'Required' : 'Optional'}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  api.setupComplexity === 'low' ? 'text-green-600 bg-green-100 dark:bg-green-900/20' :
                  api.setupComplexity === 'medium' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20' :
                  'text-red-600 bg-red-100 dark:bg-red-900/20'
                }`}>
                  {api.setupComplexity} setup
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Provider</span>
                <p className="text-sm text-gray-900 dark:text-white">{api.provider}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost</span>
                <p className="text-sm text-gray-900 dark:text-white">{api.cost}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</span>
                <p className="text-sm text-gray-900 dark:text-white capitalize">{api.category.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <a
                href={api.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View Documentation →
              </a>
              <button className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Back to Recommendation
        </button>
        <button
          onClick={() => setCurrentStep(4)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Configure Agent
          <CogIcon className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );

  const renderAgentSetupStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CogIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Agent Configuration
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure your agent's behavior, personality, and operational settings.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {selectedTemplate?.name} Configuration
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agent Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter a name for your agent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              System Prompt
            </label>
            <textarea
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Define your agent's behavior and instructions..."
              defaultValue={selectedTemplate ? `You are a ${selectedTemplate.name.toLowerCase()}. ${selectedTemplate.description}` : ''}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature (Creativity)
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                defaultValue="0.7"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Focused</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Response Length
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="1000">Short (1,000 tokens)</option>
                <option value="2000" selected>Medium (2,000 tokens)</option>
                <option value="4000">Long (4,000 tokens)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(3)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Back to APIs
        </button>
        <button
          onClick={() => setCurrentStep(5)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Deploy Agent
          <RocketLaunchIcon className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );

  const renderDeployStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <RocketLaunchIcon className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Deploy Your Agent
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your agent is ready to deploy. Review the configuration and launch it.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Deployment Summary
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Agent Type</span>
              <p className="text-sm text-gray-900 dark:text-white">{selectedTemplate?.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Complexity</span>
              <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedTemplate?.complexity}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Required APIs</span>
              <p className="text-sm text-gray-900 dark:text-white">{recommendedAPIs.filter(api => api.required).length}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Setup</span>
              <p className="text-sm text-gray-900 dark:text-white">{selectedTemplate?.estimatedSetupTime}</p>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">API Integrations</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {recommendedAPIs.map((api) => (
                <span key={api.id} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                  {api.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(4)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Back to Configuration
        </button>
        <button
          onClick={() => {
            // Handle deployment
            onSave({
              template: selectedTemplate,
              apis: recommendedAPIs,
              requirements: businessRequirements,
              configuration: agentConfiguration
            });
            onClose();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          <RocketLaunchIcon className="h-4 w-4 mr-2" />
          Deploy Agent
        </button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderBusinessAnalysisStep();
      case 2: return renderRecommendationStep();
      case 3: return renderAPIConfigurationStep();
      case 4: return renderAgentSetupStep();
      case 5: return renderDeployStep();
      default: return null;
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
                Intelligent Agent Builder
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                AI-powered agent creation with intelligent recommendations
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
        </div>
      </div>
    </div>
  );
};

export default IntelligentAgentBuilder;
