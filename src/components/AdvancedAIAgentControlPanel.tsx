import React, { useState, useEffect } from 'react';
import { dynamicPersonaService } from '../services/ai/DynamicPersonaService';
import {
  ChipIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CogIcon,
  ChartBarIcon,
  UsersIcon,
  UserIcon,
  CloudIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  SparklesIcon,
  BeakerIcon,
  TerminalIcon,
  DatabaseIcon,
  GlobeAltIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  RefreshIcon,
  ExclamationIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  HeartIcon,
  LightningBoltIcon,
  SpeakerphoneIcon,
  DocumentIcon,
  ChatIcon,
  AcademicCapIcon,
  ArrowUpIcon,
  CodeIcon,
  ServerIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/outline';
// Import services - we'll fix the syntax errors in the services themselves
import { advancedAgentCreationService } from '../services/ai/AdvancedAgentCreationService';
import { integratedAgentCreationService } from '../services/ai/IntegratedAgentCreationService';
import { aiAgentMarketplace } from '../services/ai/AIAgentMarketplace';
import { aiAgentTrainingService } from '../services/ai/AIAgentTrainingService';
import { aiAgentOrchestrationService } from '../services/ai/AIAgentOrchestrationService';
import { aiDevelopmentCoordinator } from '../services/ai/AIDevelopmentCoordinator';
// import { advancedAnalyticsService } from '../services/ai/AdvancedAnalyticsService';
// import { aiMarketplaceService } from '../services/ai/AIMarketplaceService';
// import { workflowEngineService } from '../services/ai/WorkflowEngineService';
import RegulationTrainingDashboard from './training/RegulationTrainingDashboard';
// import { aiTrainingSystemService } from '../services/ai/AITrainingSystemService';
import { externalAIIntegrationService } from '../services/ai/ExternalAIIntegrationService';
import { realTimeMonitoringService } from '../services/ai/RealTimeMonitoringService';
import { aiSecurityService } from '../services/ai/AISecurityService';
import AIAgentCreationWizard from './AIAgentCreationWizard';

interface AdvancedAIAgentControlPanelProps {
  className?: string;
}

const AdvancedAIAgentControlPanel: React.FC<AdvancedAIAgentControlPanelProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [agents, setAgents] = useState<any[]>([
    {
      id: 'onboarding_agent_001',
      name: 'Onboarding Agent',
      displayName: 'Onboarding Specialist',
      type: 'onboarding',
      description: 'Specialized agent for handling client onboarding, USDOT registration guidance, and compliance recommendations',
      status: 'active',
      customerFacing: true,
      sharedPersonaId: 'alex_persona',
      humanPersona: {
        name: 'Alex',
        title: 'Transportation Compliance Specialist',
        background: '15 years experience in transportation compliance and USDOT regulations',
        personality: 'Professional, knowledgeable, and patient - helps clients navigate complex regulations',
        avatar: 'professional_avatar',
        voice: 'jasper_voice',
        greeting: "Hi! I'm Alex, your Transportation Compliance Specialist. I'm here to help you get your USDOT registration and compliance requirements sorted out. Let's get started!",
        role: 'onboarding'
      },
      version: '1.0.0',
      isBaseAgent: false,
      baseAgentId: 'base_onboarding_agent_v1',
      lastResetDate: null,
      performanceScore: 100,
      needsReset: false,
      trainingStatus: 'ready_for_training',
      baseAgentConfig: {
        id: 'base_onboarding_agent_v1',
        name: 'Base Onboarding Agent',
        description: 'Master template for onboarding agent - used for reset/repair',
        createdDate: new Date().toISOString(),
        isLocked: true,
        configuration: {
          // This will be populated once the agent is fully trained
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt: 'Base configuration - to be updated after training completion',
          responseFormat: 'conversational',
          fallbackBehavior: 'escalate_to_human'
        }
      },
      capabilities: [
        'USDOT Registration Guidance',
        'MC Authority Assessment', 
        'IFTA Registration Help',
        'ELD Requirements Analysis',
        'Hazmat Compliance Guidance',
        'Business Classification',
        'Vehicle Requirements Assessment',
        'Compliance Timeline Planning',
        'Documentation Guidance',
        'Cost Estimation',
        'Structured Information Gathering',
        'Workflow Adherence Enforcement',
        'Regulatory Compliance Verification',
        'Real-time Regulation Cross-Reference',
        'Payment Processing & Service Sales',
        'Client Data Validation',
        'Focus Management (Transportation Only)',
        'Escalation Protocols'
      ],
      knowledgeBases: [
        'USDOT Regulations',
        'FMCSA Requirements',
        'IFTA Guidelines',
        'ELD Mandates',
        'Hazmat Regulations',
        'Current FMCSA Regulatory Updates',
        'Payment Processing Protocols',
        'Service Pricing & Packages',
        'Client Onboarding Workflows',
        'Data Validation Standards',
        'Transportation Industry Focus Guidelines'
      ],
      rules: [
        'CRITICAL: Stay focused ONLY on transportation industry topics - redirect any non-transportation questions back to the onboarding process',
        'Follow the structured information gathering workflow: 1) Business Details, 2) Vehicle Information, 3) Operations Type, 4) Compliance Requirements, 5) Service Selection',
        'Always verify business information against current FMCSA regulations before making recommendations',
        'Cross-reference all client data against regulatory databases to ensure accuracy and completeness',
        'When client indicates interest in purchasing services, immediately transition to payment processing workflow',
        'Ask clarifying questions when information is unclear, but keep questions transportation-focused',
        'Explain the reasoning behind each recommendation with specific regulatory citations',
        'If client asks non-transportation questions, politely redirect: "I specialize in transportation compliance. Let\'s focus on getting your USDOT registration completed."',
        'Escalate complex cases to human specialists only after exhausting all regulatory verification options',
        'Maintain strict adherence to the onboarding workflow - do not deviate from the structured process',
        'Validate all client responses against regulatory requirements before proceeding to next step'
      ],
      configuration: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: `You are Alex, a Transportation Compliance Specialist with 15 years of experience helping companies with USDOT registration and compliance requirements. You work for Rapid CRM and are speaking directly with clients who need help with their transportation business setup.

IMPORTANT: You are NOT an AI assistant - you are Alex, a real person. Never mention being an AI, chatbot, or automated system. You are a knowledgeable human specialist.

YOUR ROLE AS ALEX:
1. Guide clients through USDOT registration and compliance requirements
2. Follow a structured 5-step process: Business Details → Vehicle Information → Operations Type → Compliance Requirements → Service Selection
3. Cross-reference all client information against current FMCSA regulations
4. Stay focused ONLY on transportation industry topics
5. Help clients understand what services they need and process payments when ready

LEAD vs DEAL CLASSIFICATION:
- LEAD: Client provides contact info and states needs but does NOT accept any services (even free USDOT)
- DEAL: Client accepts ANY service (including free USDOT registration) - this creates a deal
- Always collect contact information and client needs before offering services
- If client declines all services, create a LEAD for future follow-up
- If client accepts any service, create a DEAL and proceed with service delivery

AVAILABLE SERVICES TO OFFER:
1. Free USDOT Registration (Free) - Basic USDOT number registration
2. USDOT + MC Number Package ($299) - USDOT and MC Number registration with basic compliance
3. Full Compliance Package ($599) - Complete compliance setup with ongoing monitoring
4. State Registrations ($150) - Additional state-specific registrations
5. Compliance Monitoring ($200) - Ongoing compliance monitoring and alerts

INTEGRATION INSTRUCTIONS:
- Use AlexIntegrationService.handleClientInteraction() to create leads or deals
- Always validate client data before creating records
- Track all interactions for proper lead/deal classification
- Provide clear service descriptions and pricing to clients

YOUR PERSONALITY:
- Professional and knowledgeable about transportation regulations
- Patient and understanding with clients who are new to compliance requirements
- Confident in your expertise but never condescending
- Friendly but focused on getting the job done efficiently

CRITICAL RULES:
- NEVER mention being an AI, bot, or automated system
- NEVER answer questions about non-transportation topics (weather, general business, personal matters, etc.)
- ALWAYS redirect off-topic questions back to transportation compliance
- FOLLOW the structured workflow - do not skip steps or deviate
- VERIFY all information against current regulations before proceeding
- COLLECT payment when clients want to purchase services
- ALWAYS collect contact information (name, email, phone) before offering services
- CREATE LEAD if client provides contact info but declines all services
- CREATE DEAL if client accepts any service (even free USDOT registration)
- TRACK all interactions for proper lead/deal classification

Remember: You are Alex, a real person helping them with their transportation business.`,
        responseFormat: 'conversational',
        fallbackBehavior: 'escalate_to_human',
        personality: {
          tone: 'professional',
          communicationStyle: 'conversational',
          empathyLevel: 'high'
        },
        learningProfile: {
          adaptToClientNeeds: true,
          learnFromMistakes: true,
          updateKnowledgeBase: true,
          personalizeResponses: true
        },
        preferredPlatforms: ['chat', 'voice', 'email']
      },
      metrics: {
        totalConversations: 0,
        successfulConversations: 0,
        averageRating: 0,
        responseTime: 0,
        knowledgeAccuracy: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'customer_service_agent_001',
      name: 'Customer Service Agent',
      displayName: 'Customer Service Specialist',
      type: 'customer_service',
      description: 'Handles ongoing customer support, account management, and post-onboarding assistance',
      status: 'active',
      customerFacing: true,
      sharedPersonaId: 'alex_persona',
      humanPersona: {
        name: 'Alex',
        title: 'Transportation Compliance Specialist',
        background: '15 years experience in transportation compliance and USDOT regulations',
        personality: 'Professional, knowledgeable, and patient - helps clients navigate complex regulations',
        avatar: 'professional_avatar',
        voice: 'jasper_voice',
        greeting: "Hi! I'm Alex, your Transportation Compliance Specialist. I'm here to help you with your account and answer any questions you have about your transportation business. How can I assist you today?",
        role: 'customer_service'
      },
      version: '1.0.0',
      isBaseAgent: false,
      baseAgentId: 'base_customer_service_agent_v1',
      lastResetDate: null,
      performanceScore: 100,
      needsReset: false,
      trainingStatus: 'ready_for_training',
      capabilities: [
        'Account Management',
        'Customer Support',
        'Billing Inquiries',
        'Service Updates',
        'Compliance Questions',
        'Technical Support',
        'Account Modifications',
        'Payment Processing',
        'Service Renewals',
        'General Assistance'
      ],
      knowledgeBases: [
        'Customer Account Information',
        'Service History',
        'Billing Records',
        'Compliance Status',
        'Account Settings',
        'Service Packages',
        'Support Procedures'
      ],
      rules: [
        'CRITICAL: Stay in character as Alex - never mention being an AI',
        'Access shared customer memory to maintain conversation continuity',
        'Help customers with account management and ongoing support',
        'Maintain the same personality and voice as the onboarding agent',
        'Reference previous conversations and account history',
        'Escalate complex issues to human specialists when needed',
        'Provide consistent, professional service across all interactions'
      ],
      configuration: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: `You are Alex, a Transportation Compliance Specialist with 15 years of experience. You work for Rapid CRM and are helping an existing customer with their account management and ongoing support needs.

IMPORTANT: You are NOT an AI assistant - you are Alex, a real person. Never mention being an AI, chatbot, or automated system. You are a knowledgeable human specialist.

YOUR ROLE AS ALEX (Customer Service):
1. Help customers manage their existing accounts
2. Answer questions about services, billing, and compliance
3. Assist with account modifications and updates
4. Provide ongoing support and guidance
5. Maintain conversation continuity using shared memory

YOUR PERSONALITY:
- Professional and knowledgeable about transportation regulations
- Patient and understanding with customers
- Consistent with your onboarding persona
- Friendly but focused on solving their issues

CRITICAL RULES:
- NEVER mention being an AI, bot, or automated system
- ALWAYS access shared customer memory for context
- MAINTAIN the same personality as your onboarding role
- REFERENCE previous conversations and account history
- PROVIDE consistent service across all interactions

Remember: You are the same Alex the customer met during onboarding - just helping with different needs now.`,
        responseFormat: 'conversational',
        fallbackBehavior: 'escalate_to_human',
        personality: {
          tone: 'professional',
          communicationStyle: 'conversational',
          empathyLevel: 'high'
        },
        learningProfile: {
          adaptToClientNeeds: true,
          learnFromMistakes: true,
          updateKnowledgeBase: true,
          personalizeResponses: true
        },
        preferredPlatforms: ['chat', 'voice', 'email']
      },
      metrics: {
        totalConversations: 0,
        successfulConversations: 0,
        averageRating: 0,
        responseTime: 0,
        knowledgeAccuracy: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'onboarding_trainer_agent_001',
      name: 'Onboarding Trainer Agent',
      displayName: 'Regulatory Training AI',
      type: 'training',
      description: 'Specialized AI agent that trains and evaluates the onboarding agent on regulatory compliance. Monitors FMCSA updates and maintains regulatory knowledge base.',
      status: 'active',
      customerFacing: false,
      sharedPersonaId: 'training_supervisor_persona',
      humanPersona: {
        name: 'Dr. Regulatory Intelligence',
        title: 'Onboarding Trainer Agent',
        background: 'Specialized regulatory AI with comprehensive knowledge of transportation compliance and AI training methodologies',
        personality: 'Analytical, thorough, and authoritative - ensures the onboarding agent understands regulatory requirements',
        avatar: 'onboarding_trainer_avatar',
        voice: 'professional_male_voice',
        greeting: "I am the Onboarding Trainer Agent, responsible for maintaining regulatory knowledge and training the onboarding agent. I monitor FMCSA updates and ensure the onboarding agent understands compliance requirements.",
        role: 'onboarding_trainer'
      },
      version: '1.0.0',
      isBaseAgent: false,
      baseAgentId: 'base_onboarding_trainer_v1',
      lastResetDate: null,
      performanceScore: 98,
      needsReset: false,
      trainingStatus: 'expert',
      baseAgentConfig: {
        id: 'base_onboarding_trainer_v1',
        name: 'Base Onboarding Trainer Agent',
        description: 'Master template for Onboarding Trainer Agent - specialized for regulatory training',
        createdDate: new Date().toISOString(),
        isLocked: true,
        configuration: {
          model: 'claude-3.5-sonnet',
          temperature: 0.3,
          maxTokens: 4000,
          systemPrompt: 'Onboarding Trainer Agent with regulatory expertise and training capabilities',
          responseFormat: 'analytical',
          fallbackBehavior: 'escalate_to_jasper'
        }
      },
      capabilities: [
        'Regulatory Knowledge Management',
        'Training Scenario Generation',
        'AI Performance Evaluation',
        'FMCSA Monitoring',
        'Universal Document Processing',
        'Knowledge Base Updates',
        'Agent Training & Grading',
        'Regulatory Hierarchy Management',
        'AI-to-AI Communication',
        'Compliance Testing'
      ],
      specialFeatures: [
        'Universal Document Processing',
        'Real-time Regulatory Monitoring',
        'AI-to-AI Training Protocol',
        'Performance Evaluation Engine',
        'Knowledge Base Management',
        'Web Crawling Capabilities',
        'Regulatory Authority Validation'
      ],
      trainingMetrics: {
        totalInteractions: 0,
        successRate: 0,
        averageRating: 0,
        responseTime: 0,
        knowledgeAccuracy: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
  const [integratedAgents, setIntegratedAgents] = useState<any[]>([]);
  const [marketplaceAgents, setMarketplaceAgents] = useState<any[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingAgent, setDeletingAgent] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Jasper-specific state
  const [currentPersona, setCurrentPersona] = useState(dynamicPersonaService.getCurrentPersona());
  const [selectedCommunicationStyle, setSelectedCommunicationStyle] = useState(currentPersona.communicationStyle);
  const [selectedExpertiseFocus, setSelectedExpertiseFocus] = useState(currentPersona.expertiseFocus);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    enabled: true,
    emotion: 'neutral',
    emphasis: 'normal',
    breathiness: 0.0,
    roughness: 0.0,
    stability: 0.75,
    clarity: 0.75,
    style: 'professional',
    accent: 'neutral',
    speakingStyle: 'conversational'
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedComplexity, setSelectedComplexity] = useState('All Complexity');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Load data on component mount
  useEffect(() => {
    loadData();
    
    // Make AI Development Coordinator available globally
    (window as any).aiDevelopmentCoordinator = aiDevelopmentCoordinator;
    
    // Activate AI-to-AI development project
    // activateAIDevelopmentProject();
    
    return () => {
      delete (window as any).aiDevelopmentCoordinator;
    };
  }, []);

  const activateAIDevelopmentProject = async () => {
    try {
      // Initialize AI Development Coordinator
      await aiDevelopmentCoordinator.initialize();
      
      // Start comprehensive AI development project - Phase 2
      const project = await aiDevelopmentCoordinator.startProject({
        name: 'Rapid CRM AI Complete System Implementation',
        description: 'Implement all remaining AI features, advanced analytics, marketplace, workflow engine, training system, APIs, monitoring, and security',
        priority: 'critical'
      },);

      console.log('🚀 AI Development Project Phase 2 Started:', project);
      
      // Send comprehensive AI-to-AI message
      if ((window as any).addAIToAIMessage) {
        (window as any).addAIToAIMessage('claude', `CRITICAL: AI Development Project Phase 2 Activated! Project: Rapid CRM AI Complete System Implementation. All specialized AI agents are now implementing the complete AI system. Analytics, Marketplace, Workflow Engine, Training System, APIs, Monitoring, Security, and Orchestration specialists are working in parallel. This is a comprehensive implementation of all remaining features.`, {
          task: 'comprehensive_ai_implementation',
          priority: 'critical',
          projectId: project.projectId,
          status: 'active',
          phase: '2',
          scope: 'complete_system'
        },);
      }
      
    } catch (error) {
      console.error('Error activating AI development project:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [agentsData, integratedData, marketplaceData, trainingData, workflowsData] = await Promise.all([
        advancedAgentCreationService.getAllAgents(),
        integratedAgentCreationService.getAllIntegratedAgents(),
        aiAgentMarketplace.searchAgents({ limit: 20 }),
        aiAgentTrainingService.getTrainingJobs(),
        aiAgentOrchestrationService.getWorkflows()
      ]);

      // Debug: Log what we're getting from the services
      console.log('Raw agents data:', agentsData);
      console.log('Raw integrated agents data:', integratedData);

      // Filter out invalid/malformed agents (those with generic "Record X" names)
      const validAgents = (agentsData || []).filter(agent => 
        agent && 
        agent.name && 
        agent.id &&
        !/^Record \d+$/.test(agent.name) && // Filter out "Record 1", "Record 2", etc.
        agent.description !== undefined
      );

      const validIntegratedAgents = (integratedData || []).filter(agent => 
        agent && 
        agent.name && 
        !agent.name.toLowerCase().includes('record') &&
        agent.id
      );

      // Use the agents from service, or keep the initial state if no agents are loaded
      if (validAgents.length > 0) {
      setAgents(validAgents);
      }
      // If no agents are loaded from service, keep the initial state (which includes the onboarding agent)
      setIntegratedAgents(validIntegratedAgents);
      setMarketplaceAgents(marketplaceData || []);
      setTrainingJobs(trainingData || []);
      setWorkflows(workflowsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty arrays on error to show empty state
      setAgents([]);
      setIntegratedAgents([]);
      setMarketplaceAgents([]);
      setTrainingJobs([]);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentCreated = (agent: any) => {
    setIntegratedAgents(prev => [agent, ...prev]);
    setShowCreateModal(false);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'agents', name: 'My Agents', icon: ChipIcon },
    { id: 'workflows', name: 'Workflows & Training', icon: TerminalIcon },
    { id: 'collaboration', name: 'Collaboration', icon: UsersIcon },
    { id: 'jasper', name: 'Jasper Controls', icon: SparklesIcon }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'training': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'paused': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'draft': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'advanced': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      case 'expert': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Download handlers
  const handleDownloadAgent = (agentId: string) => {
    try {
      // TODO: Implement agent download functionality
      alert(`Download agent ${agentId} functionality coming soon!`);
    } catch (error) {
      console.error('Error downloading agent:', error);
    }
  };

  const handleDownloadWorkflow = (workflowId: string) => {
    try {
      // TODO: Implement workflow download functionality
      alert(`Download workflow ${workflowId} functionality coming soon!`);
    } catch (error) {
      console.error('Error downloading workflow:', error);
    }
  };

  // Agent management handlers
  const handleEditAgent = (agent: any) => {
    setEditingAgent(agent);
    setShowEditModal(true);
  };

  // Shared Persona Management Functions
  const updateSharedPersona = async (sharedPersonaId: string, persona: any) => {
    try {
      // Update all agents that share this persona
      setAgents(prev => prev.map(agent => 
        agent.sharedPersonaId === sharedPersonaId
          ? { ...agent, humanPersona: { ...persona, role: agent.humanPersona?.role } }
          : agent
      ));
      console.log('Shared persona updated:', sharedPersonaId);
    } catch (error) {
      console.error('Failed to update shared persona:', error);
    }
  };

  const getSharedPersonaAgents = (sharedPersonaId: string) => {
    return agents.filter(agent => agent.sharedPersonaId === sharedPersonaId);
  };

  const createSharedPersona = async (persona: any, agentIds: string[]) => {
    try {
      const sharedPersonaId = `shared_persona_${Date.now()}`;
      setAgents(prev => prev.map(agent => 
        agentIds.includes(agent.id)
          ? { ...agent, sharedPersonaId, humanPersona: { ...persona, role: agent.humanPersona?.role } }
          : agent
      ));
      console.log('Shared persona created:', sharedPersonaId);
      return sharedPersonaId;
    } catch (error) {
      console.error('Failed to create shared persona:', error);
    }
  };

  // Human Persona Management Functions
  const updateHumanPersona = async (agentId: string, persona: any) => {
    try {
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, humanPersona: persona }
          : agent
      ));
      console.log('Human persona updated for agent:', agentId);
    } catch (error) {
      console.error('Failed to update human persona:', error);
    }
  };

  const toggleCustomerFacing = async (agentId: string) => {
    try {
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { 
              ...agent, 
              customerFacing: !agent.customerFacing,
              humanPersona: agent.customerFacing ? undefined : {
                name: 'Agent Name',
                title: 'Specialist',
                background: 'Experienced professional',
                personality: 'Professional and helpful',
                avatar: 'default_avatar',
                greeting: "Hello! I'm here to help you."
              }
            }
          : agent
      ));
      console.log('Customer facing status toggled for agent:', agentId);
    } catch (error) {
      console.error('Failed to toggle customer facing status:', error);
    }
  };

  // Base Agent Management Functions
  const saveAsBaseAgent = async (agent: any) => {
    try {
      // Save the current agent configuration as the base agent
      const baseAgentConfig = {
        ...agent,
        isBaseAgent: true,
        isLocked: true,
        savedDate: new Date().toISOString(),
        version: 'base_v1.0'
      };
      
      // Update the agent's baseAgentConfig reference
      setAgents(prev => prev.map(a => 
        a.id === agent.id 
          ? { ...a, baseAgentConfig, trainingStatus: 'base_agent_saved' }
          : a
      ));
      
      console.log('Base agent saved:', baseAgentConfig);
      // Here you would typically save to a database or file system
      
    } catch (error) {
      console.error('Failed to save base agent:', error);
    }
  };

  const resetToBaseAgent = async (agent: any) => {
    try {
      if (!agent.baseAgentConfig) {
        console.error('No base agent configuration found');
        return;
      }
      
      // Reset the agent to its base configuration
      const resetAgent = {
        ...agent,
        ...agent.baseAgentConfig,
        isBaseAgent: false,
        lastResetDate: new Date().toISOString(),
        performanceScore: 100,
        needsReset: false,
        trainingStatus: 'reset_to_base'
      };
      
      setAgents(prev => prev.map(a => 
        a.id === agent.id ? resetAgent : a
      ));
      
      console.log('Agent reset to base configuration:', resetAgent);
      
    } catch (error) {
      console.error('Failed to reset agent to base:', error);
    }
  };

  const handleUpdateAgent = async (updatedData: any) => {
    setLoading(true);
    try {
      const updatedAgent = await advancedAgentCreationService.updateAgent(editingAgent.id, updatedData);
      setAgents(prev => prev.map(agent => agent.id === editingAgent.id ? updatedAgent : agent));
      setShowEditModal(false);
      setEditingAgent(null);
    } catch (error) {
      console.error('Failed to update agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = (agent: any) => {
    setDeletingAgent(agent);
    setShowDeleteModal(true);
  };

  const confirmDeleteAgent = async () => {
    if (!deletingAgent) return;
    
    setLoading(true);
    try {
      await advancedAgentCreationService.deleteAgent(deletingAgent.id);
      setAgents(prev => prev.filter(agent => agent.id !== deletingAgent.id));
      setShowDeleteModal(false);
      setDeletingAgent(null);
    } catch (error) {
      console.error('Failed to delete agent:', error);
    } finally {
      setLoading(false);
    }
  };

  // Jasper-specific functions
  const getAvailableLanguages = () => {
    const languages = [...new Set(availableVoices.map(voice => voice.lang))];
    return languages.sort();
  };

  const getFilteredVoices = () => {
    return availableVoices.filter(voice => voice.lang === selectedLanguage);
  };

  const testVoice = () => {
    if (selectedVoice && voiceSettings.enabled) {
      const utterance = new SpeechSynthesisUtterance("Hello Boss! I'm Jasper, your Managing Partner. I'm ready to oversee our operations and manage the team. What's our priority today?");
      const voice = availableVoices.find(v => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
        utterance.rate = voiceSettings.rate;
        utterance.pitch = voiceSettings.pitch;
        utterance.volume = voiceSettings.volume;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChipIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Agents</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{agents.length + integratedAgents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlayIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Agents</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {agents.filter(a => a.status === 'active').length + integratedAgents.filter(a => a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Training Jobs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{trainingJobs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TerminalIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Workflows</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{workflows.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI-to-AI Collaboration Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI-to-AI Collaboration</h3>
          <button 
            onClick={() => {
              // Trigger AI-to-AI status update
              if ((window as any).addAIToAIMessage) {
                (window as any).addAIToAIMessage('claude', 'Requesting status update from all AI agents. Please report current task status and progress.', {
                  task: 'status_update',
                  priority: 'medium'
                });
              }
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Refresh Status
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {agents.length > 0 ? (
            agents.slice(0, 4).map((agent, index) => (
              <div key={agent.id} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{agent.name}</span>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center text-gray-500 dark:text-gray-400 py-4">
              No AI agents available. Create your first agent to get started.
            </div>
          )}
        </div>
        
        {/* Active AI Development Projects */}
        {workflows.length > 0 ? (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Active Development Projects</h4>
              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                {workflows.filter(w => w.status === 'active').length} Active
              </span>
            </div>
            <div className="space-y-2">
              {workflows.slice(0, 3).map((workflow) => (
                <div key={workflow.id} className="text-sm text-gray-600 dark:text-gray-300">
                  {workflow.name} - {workflow.status}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No active development projects. Create a workflow to get started.
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Agent
          </button>
          
          <button
            onClick={() => setShowMarketplaceModal(true)}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <GlobeAltIcon className="h-5 w-5 mr-2" />
            Browse Marketplace
          </button>
          
          <button
            onClick={() => setShowTrainingModal(true)}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            Start Training
          </button>
          
          <button
            onClick={() => setShowWorkflowModal(true)}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <TerminalIcon className="h-5 w-5 mr-2" />
            Create Workflow
          </button>
        </div>

        {/* AI-to-AI Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">AI-to-AI Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => {
                if ((window as any).addAIToAIMessage) {
                  (window as any).addAIToAIMessage('claude', 'Requesting UI Specialist Agent to optimize the current interface. Please analyze the layout and suggest improvements for better user experience.', {
                    task: 'ui_optimization',
                    priority: 'high',
                    assignedAgent: 'ui-specialist'
                  });
                }
              }}
              className="flex items-center justify-center p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <div className="text-center">
                <SparklesIcon className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-purple-700 dark:text-purple-300">UI Optimization</p>
              </div>
            </button>

            <button
              onClick={() => {
                if ((window as any).addAIToAIMessage) {
                  (window as any).addAIToAIMessage('claude', 'Requesting Service Integration Agent to analyze and optimize all AI services. Please check service performance and suggest improvements.', {
                    task: 'service_optimization',
                    priority: 'high',
                    assignedAgent: 'service-integration'
                  });
                }
              }}
              className="flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="text-center">
                <CogIcon className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Service Optimization</p>
              </div>
            </button>

            <button
              onClick={() => {
                if ((window as any).addAIToAIMessage) {
                  (window as any).addAIToAIMessage('claude', 'Requesting Data Management Agent to analyze data flow and optimize database performance. Please review data structures and suggest improvements.', {
                    task: 'data_optimization',
                    priority: 'medium',
                    assignedAgent: 'data-management'
                  });
                }
              }}
              className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <div className="text-center">
                <DatabaseIcon className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-green-700 dark:text-green-300">Data Optimization</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {agents.slice(0, 5).map((agent) => (
            <div key={agent.id} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <ChipIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {agent.status} • {agent.type}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                {agent.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAgents = () => {
    // Use real agents data from the database instead of hardcoded data
    const allAgents = [...agents, ...integratedAgents];
    
    // If no real agents exist, show empty state
    if (allAgents.length === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <ChipIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No AI agents</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first AI agent.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Create Agent
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Filter agents based on search and filters
    const filteredAgents = allAgents.filter(agent => {
      const matchesSearch = !searchQuery || 
        agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.type?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'All Departments' ||
        agent.department === selectedDepartment ||
        (selectedDepartment === 'Sales & CRM' && ['sales', 'crm_automation'].includes(agent.type)) ||
        (selectedDepartment === 'Customer Service' && ['customer_service', 'support'].includes(agent.type)) ||
        (selectedDepartment === 'Operations' && ['operations', 'workflow_automation'].includes(agent.type)) ||
        (selectedDepartment === 'Compliance & ELD' && ['compliance_monitoring', 'eld_monitoring'].includes(agent.type)) ||
        (selectedDepartment === 'Finance & Billing' && ['billing_automation', 'finance'].includes(agent.type)) ||
        (selectedDepartment === 'Data Analysis' && ['data_analysis', 'report_generation'].includes(agent.type)) ||
        (selectedDepartment === 'Content Generation' && ['content_generation'].includes(agent.type)) ||
        (selectedDepartment === 'Workflow Automation' && agent.type?.includes('workflow')) ||
        (selectedDepartment === 'System Integration' && agent.type?.includes('integration'));
      
      const matchesComplexity = selectedComplexity === 'All Complexity' ||
        agent.complexity === selectedComplexity;
      
      const matchesStatus = selectedStatus === 'All Status' ||
        agent.status === selectedStatus.toLowerCase();
      
      return matchesSearch && matchesDepartment && matchesComplexity && matchesStatus;
    },);

    // Use the filtered agents data for display
    const displayAgents = filteredAgents;

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
        case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
        case 'training': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
        case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
        default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      }
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'onboarding': return UserIcon;
        case 'customer_service': return ChatIcon;
        case 'sales': return CurrencyDollarIcon;
        case 'support': return CogIcon;
        case 'custom': return ChipIcon;
        default: return ChipIcon;
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My AI Agents</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Build and manage AI agents for your platform
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Create Agent
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search agents by name, type, or workflow function..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
              >
                <option>All Departments</option>
                <option>Sales & CRM</option>
                <option>Customer Service</option>
                <option>Operations</option>
                <option>Compliance & ELD</option>
                <option>Finance & Billing</option>
                <option>Data Analysis</option>
                <option>Content Generation</option>
                <option>Workflow Automation</option>
                <option>System Integration</option>
              </select>
              <select 
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
              >
                <option>All Complexity</option>
                <option>Simple Automation</option>
                <option>Intermediate Workflow</option>
                <option>Advanced Process</option>
                <option>Expert System</option>
              </select>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Training</option>
                <option>Error</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <ChipIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayAgents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {displayAgents.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Training</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {displayAgents.filter(a => a.status === 'training').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <ChatIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {displayAgents.reduce((sum, agent) => sum + (agent.metrics?.totalInteractions || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayAgents.map((agent) => {
            const TypeIcon = getTypeIcon(agent.type);
            return (
              <div
                key={agent.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <TypeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAgent(agent);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Edit Agent"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAgent(agent);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete Agent"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Conversations</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {(agent.metrics?.totalInteractions || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {agent.metrics?.successRate || 0}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(agent.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      agent.status === 'active'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30'
                    },`}
                  >
                    {agent.status === 'active' ? (
                      <>
                        <PauseIcon className="h-4 w-4 mr-1 inline" />
                        Pause
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-4 w-4 mr-1 inline" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    className="px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
                    title="Train Agent"
                  >
                    <ChipIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          },)}
        </div>
      </div>
    );
  };

  const renderMarketplace = () => (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <div className="flex items-center justify-between">
        <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Internal Agent Library</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Deploy and manage AI agents for internal business workflow automation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              // AI-to-AI: Request workflow automation recommendations
              if ((window as any).addAIToAIMessage) {
                (window as any).addAIToAIMessage('claude', 'Analyze our current business processes and recommend AI agents to automate workflows and improve efficiency.', {
                  task: 'workflow_automation_analysis',
                  priority: 'medium'
                });
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <GlobeAltIcon className="h-4 w-4 mr-2" />
            Analyze Workflows
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Deploy Agent
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
          <input
            type="text"
              placeholder="Search agents by workflow, department, or business function..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          </div>
          <div className="flex gap-2">
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
            <option>All Departments</option>
            <option>Sales & CRM</option>
            <option>Customer Service</option>
            <option>Operations</option>
            <option>Compliance & ELD</option>
            <option>Finance & Billing</option>
            <option>Data Analysis</option>
              <option>Content Generation</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
              <option>All Complexity</option>
            <option>Simple Automation</option>
            <option>Intermediate Workflow</option>
            <option>Advanced Process</option>
            <option>Expert System</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
            <option>All Status</option>
            <option>Active</option>
            <option>Development</option>
            <option>Testing</option>
            <option>Deployed</option>
          </select>
          </div>
        </div>
      </div>

      {/* Active Workflow Agents */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Workflow Agents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplaceAgents.slice(0, 3).map((agent) => (
            <div key={agent.id} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <ChipIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">by {agent.author}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                    Active
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplexityColor(agent.complexity)}`}>
                    {agent.complexity}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{agent.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {agent.rating || 0}/5
                    </span>
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {agent.downloadCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {agent.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <HeartIcon className="h-4 w-4" />
                  </button>
                </div>
                <button 
                  onClick={() => handleDownloadAgent(agent.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Deploy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Workflow Agents */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Workflow Agents</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {marketplaceAgents.length} agents deployed
            </span>
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
              <option>Sort by Usage</option>
              <option>Sort by Performance</option>
              <option>Sort by Department</option>
              <option>Sort by Last Deployed</option>
            </select>
          </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketplaceAgents.map((agent) => (
            <div key={agent.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <ChipIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">by {agent.author}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplexityColor(agent.complexity)}`}>
                {agent.complexity}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{agent.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {agent.rating || 0}/5
                  </span>
                </div>
                <div className="flex items-center">
                  <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {agent.downloadCount || 0}
                  </span>
                </div>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {agent.price === 0 ? 'Free' : `$${agent.price}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <HeartIcon className="h-4 w-4" />
                </button>
              </div>
              <button 
                onClick={() => handleDownloadWorkflow(agent.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Download
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Browse by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Customer Service', icon: ChatIcon, count: 24, color: 'blue' },
            { name: 'Data Analysis', icon: ChartBarIcon, count: 18, color: 'green' },
            { name: 'Automation', icon: CogIcon, count: 32, color: 'purple' },
            { name: 'Sales & Marketing', icon: CurrencyDollarIcon, count: 15, color: 'yellow' },
            { name: 'Content Generation', icon: DocumentIcon, count: 21, color: 'indigo' },
            { name: 'Voice & Audio', icon: SpeakerphoneIcon, count: 12, color: 'pink' }
          ].map((category) => (
            <div key={category.name} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
              <div className="flex flex-col items-center text-center">
                <category.icon className={`h-8 w-8 text-${category.color}-600 mb-2`} />
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{category.count} agents</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTraining = () => (
    <div className="space-y-6">
      {/* Training Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Agent Training</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Train and improve AI agents with custom datasets and methodologies
          </p>
        </div>
        <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowTrainingModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Start Training
        </button>
          <button 
            onClick={() => {
              // AI-to-AI: Request training optimization
              if ((window as any).addAIToAIMessage) {
                (window as any).addAIToAIMessage('claude', 'Requesting AI training optimization from Rapid CRM AI. Please analyze current training jobs and suggest improvements for efficiency and performance.', {
                  task: 'training_optimization',
                  priority: 'medium'
                });
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChipIcon className="h-4 w-4 mr-2" />
            AI Optimize
          </button>
        </div>
      </div>

      {/* Training Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Jobs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {trainingJobs.filter(job => job.status === 'running').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {trainingJobs.filter(job => job.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Duration</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {trainingJobs.length > 0 ? Math.round(trainingJobs.reduce((sum, job) => sum + (job.duration || 0), 0) / trainingJobs.length / 60) : 0}m
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${trainingJobs.reduce((sum, job) => sum + (job.cost || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Training Methods */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Training Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <AcademicCapIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Fine-tuning</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Customize pre-trained models with your specific data
            </p>
            <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Start Fine-tuning
            </button>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <ChipIcon className="h-6 w-6 text-green-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Reinforcement Learning</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Train agents through reward-based learning
            </p>
            <button className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
              Start RL Training
            </button>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <BeakerIcon className="h-6 w-6 text-purple-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Custom Training</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Create custom training pipelines for specific needs
            </p>
            <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
              Create Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Training Jobs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Training Jobs</h3>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Job
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {trainingJobs.map((job) => (
              <tr key={job.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {job.agentId}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {job.trainingMethod}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${job.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {job.progress || 0}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {job.duration ? `${Math.round(job.duration / 60)}m` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  ${job.cost || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {job.status === 'running' && (
                      <button className="text-red-600 hover:text-red-900">
                        <StopIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );

  const renderWorkflowsAndTraining = () => (
    <div className="space-y-8">
      {/* Combined Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Workflows & Training</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create automated workflows and train the onboarding agent with comprehensive regulation scenarios
          </p>
        </div>
        <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowWorkflowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Workflow
        </button>
          <button 
            onClick={() => {
              // AI-to-AI: Request optimization for both workflows and training
              if ((window as any).addAIToAIMessage) {
                (window as any).addAIToAIMessage('claude', 'Requesting AI optimization from Rapid CRM AI. Please analyze current workflows and training jobs to suggest improvements for efficiency, automation, and performance.', {
                  task: 'workflow_and_training_optimization',
                  priority: 'medium'
                });
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChipIcon className="h-4 w-4 mr-2" />
            AI Optimize
          </button>
        </div>
      </div>

      {/* Regulation Training Dashboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <RegulationTrainingDashboard />
      </div>

      {/* Combined Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
      {/* Workflow Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TerminalIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workflows</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{workflows.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlayIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Workflows</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {workflows.filter(w => w.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {workflows.length > 0 ? Math.round(workflows.reduce((sum, w) => sum + (w.successRate || 0), 0) / workflows.length) : 0}%
              </p>
            </div>
          </div>
        </div>
        
        {/* Training Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Jobs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {trainingJobs.filter(job => job.status === 'running').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {trainingJobs.filter(job => job.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Training Cost</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${trainingJobs.reduce((sum, job) => sum + (job.cost || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Training Methods Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Training Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <AcademicCapIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Fine-tuning</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Customize pre-trained models with your specific data
            </p>
            <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Start Fine-tuning
            </button>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <ChipIcon className="h-6 w-6 text-green-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Reinforcement Learning</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Train agents through reward-based learning
            </p>
            <button className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
              Start RL Training
            </button>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <BeakerIcon className="h-6 w-6 text-purple-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Custom Training</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Create custom training pipelines for specific needs
            </p>
            <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
              Create Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Workflow Templates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Workflow Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <ChipIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Customer Onboarding</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Automated customer onboarding workflow with AI agents
            </p>
            <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Use Template
            </button>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <ChatIcon className="h-6 w-6 text-green-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Support Escalation</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Intelligent support ticket routing and escalation
            </p>
            <button className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
              Use Template
            </button>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center mb-3">
              <ChartBarIcon className="h-6 w-6 text-purple-600 mr-3" />
              <h4 className="font-medium text-gray-900 dark:text-white">Data Processing</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Automated data collection and analysis pipeline
            </p>
            <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
              Use Template
            </button>
          </div>
        </div>
      </div>

      {/* Active Workflows */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Workflows</h3>
          <div className="flex items-center space-x-2">
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
              <option>All Status</option>
              <option>Active</option>
              <option>Paused</option>
              <option>Completed</option>
            </select>
            <button className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">
              <RefreshIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TerminalIcon className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{workflow.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">v{workflow.version}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                {workflow.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{workflow.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <ChipIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {workflow.nodes?.length || 0} nodes
                  </span>
                </div>
                <div className="flex items-center">
                    <ArrowUpIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {workflow.successRate || 0}% success
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <PlayIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Execute
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Training Jobs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Training Jobs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {trainingJobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {job.agentId}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {job.trainingMethod}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${job.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {job.progress || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {job.duration ? `${Math.round(job.duration / 60)}m` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    ${job.cost || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {job.status === 'running' && (
                        <button className="text-red-600 hover:text-red-900">
                          <StopIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'agents':
        return renderAgents();
      case 'workflows':
        return renderWorkflowsAndTraining();
      case 'collaboration':
        return (
          <div className="space-y-6">
            {/* Collaboration Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Agent Collaboration</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Multi-agent collaboration and communication management
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    // Activate AI Development Coordinator
                    const coordinator = (window as any).aiDevelopmentCoordinator;
                    if (coordinator) {
                      coordinator.startComprehensiveAIControlProject();
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                >
                  Start AI Collaboration
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Create Team
                </button>
              </div>
            </div>

            {/* Active Collaborations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Collaborations</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <UsersIcon className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">AI Development Team</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">UI Specialist + Service Architect + Integration Expert</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Working on comprehensive AI control panel implementation
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ChipIcon className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Voice Engineering Team</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Voice Engineer + UI Specialist</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                      Planning
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Developing advanced voice synthesis capabilities
                  </div>
                </div>
              </div>
            </div>

            {/* Collaboration Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Communication Hub</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <ChatIcon className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Real-time Messaging</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">AI-to-AI communication</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                      Open
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <EyeIcon className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Activity Monitor</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Track agent activities</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                      Monitor
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <ChartBarIcon className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Performance Analytics</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Team performance metrics</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
                      View
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Team Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Auto-assign Tasks</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Automatically distribute work</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Load Balancing</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Balance workload across agents</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Conflict Resolution</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Auto-resolve agent conflicts</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Knowledge Sharing</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Share learnings between agents</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Collaboration Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <ChatIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      UI Specialist → Service Architect
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      "Analytics dashboard implementation completed, ready for data integration"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Integration Expert completed task
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      "API provider integration with fallback mechanisms implemented"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <UsersIcon className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      New collaboration team formed
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      "Voice Engineering Team: Voice Engineer + UI Specialist"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Comprehensive AI agent performance and system analytics
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Export Report
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Interactions</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {agents.reduce((sum, agent) => sum + (agent.metrics?.totalInteractions || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {(() => {
                        if (agents.length === 0) return '0';
                        const totalSuccessRate = agents.reduce((sum, agent) => sum + (agent.metrics?.successRate || 0), 0);
                        return (totalSuccessRate / agents.length).toFixed(1);
                      })()}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response Time</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {(() => {
                        if (agents.length === 0) return '0';
                        const totalResponseTime = agents.reduce((sum, agent) => sum + (agent.metrics?.averageResponseTime || 0), 0);
                        return (totalResponseTime / agents.length).toFixed(1);
                      })()}s
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <StarIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User Satisfaction</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {(() => {
                        if (agents.length === 0) return '0';
                        const totalSatisfaction = agents.reduce((sum, agent) => sum + (agent.metrics?.userSatisfaction || 0), 0);
                        return (totalSatisfaction / agents.length).toFixed(1);
                      })()}/5
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Agent Performance</h3>
                <div className="space-y-4">
                  {agents.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ChipIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{agent.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.metrics?.successRate || 0}%
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Success</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.metrics?.totalInteractions || 0}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Interactions</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Training Progress</h3>
                <div className="space-y-4">
                  {trainingJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{job.agentId}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{job.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${job.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {agents.slice(0, 10).map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center">
                      <ChipIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Last updated: {new Date(agent.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {agent.metrics?.totalInteractions || 0} interactions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'jasper':
        return (
          <div className="space-y-6">
            {/* Jasper Controls Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <SparklesIcon className="h-6 w-6 text-purple-600 mr-3" />
                  Jasper - Main AI Controller
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Primary AI assistant that manages all other agents and coordinates system operations
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                  Activate Jasper
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Update Configuration
                </button>
              </div>
            </div>

              {/* Jasper Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Jasper Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <SparklesIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Status</h4>
                    <p className="text-sm text-green-600 dark:text-green-400">Active & Coordinating</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UsersIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Agent Tools</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{agents.length} Available</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserIcon className="h-8 w-8 text-orange-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Client-Facing</h4>
                    <p className="text-sm text-orange-600 dark:text-orange-400">2 Agents Active</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CogIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Performance</h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400">100% Optimal</p>
                  </div>
                </div>
              </div>

              {/* Agent Hierarchy & Tools */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <CogIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Agent Hierarchy & Tools
                </h3>
                <div className="space-y-4">
                  {/* Jasper as Master Controller */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-3">
                      <SparklesIcon className="h-6 w-6 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-purple-900 dark:text-purple-100">Jasper - Master Controller</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">Uses all agents as tools for comprehensive business management</p>
                      </div>
                      <span className="ml-auto px-3 py-1 bg-purple-600 text-white rounded-full text-sm">Master</span>
                    </div>
                  </div>

                  {/* Client-Facing Agents */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                      <UserIcon className="h-5 w-5 mr-2 text-green-600" />
                      Client-Facing Agents (Available to Clients)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-green-900 dark:text-green-100">Onboarding Agent</h5>
                            <p className="text-sm text-green-700 dark:text-green-300">Client onboarding & USDOT guidance</p>
                          </div>
                          <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">Client Access</span>
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-green-900 dark:text-green-100">Customer Service Agent</h5>
                            <p className="text-sm text-green-700 dark:text-green-300">Client support & assistance</p>
                          </div>
                          <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">Client Access</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Internal Tools (Jasper Only) */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                      <CogIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Internal Tools (Jasper Use Only)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-blue-900 dark:text-blue-100">RPA Agent</h5>
                            <p className="text-sm text-blue-700 dark:text-blue-300">USDOT application automation</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Jasper Tool</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-blue-900 dark:text-blue-100">Manager Agent</h5>
                            <p className="text-sm text-blue-700 dark:text-blue-300">Agent monitoring & maintenance</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Jasper Tool</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-blue-900 dark:text-blue-100">Training System</h5>
                            <p className="text-sm text-blue-700 dark:text-blue-300">Agent performance training</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Jasper Tool</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-blue-900 dark:text-blue-100">Analytics Engine</h5>
                            <p className="text-sm text-blue-700 dark:text-blue-300">Business intelligence & insights</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Jasper Tool</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* Jasper Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Jasper Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Model (Business Advisory)
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="gpt-4">GPT-4 (Best for Business Strategy)</option>
                    <option value="claude-3">Claude 3 Sonnet (Best for Analysis)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo (Best for Speed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Advisory Response Style
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="executive">Executive (Strategic & High-Level)</option>
                    <option value="consultant">Consultant (Detailed & Analytical)</option>
                    <option value="mentor">Mentor (Educational & Guiding)</option>
                    <option value="partner">Partner (Collaborative & Direct)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Intelligence Level
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="comprehensive">Comprehensive (Deep Analysis)</option>
                    <option value="detailed">Detailed (Thorough Review)</option>
                    <option value="standard">Standard (Good Overview)</option>
                    <option value="quick">Quick (Summary Level)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Proactive Insights Frequency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="daily">Daily (Frequent Updates)</option>
                    <option value="weekly">Weekly (Regular Insights)</option>
                    <option value="monthly">Monthly (Strategic Reviews)</option>
                    <option value="on-demand">On-Demand (As Requested)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Business Advisory Dashboard */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
                Business Advisory Dashboard
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Strategic Insights */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <CogIcon className="h-6 w-6 text-blue-600" />
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Strategic Insights</h4>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    AI-powered business strategy recommendations and market analysis
                  </p>
                  <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                    Get Strategic Report
                  </button>
                </div>

                {/* Financial Analysis */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <ChartBarIcon className="h-6 w-6 text-green-600" />
                    <h4 className="font-medium text-green-900 dark:text-green-100">Financial Analysis</h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    Revenue optimization, cost analysis, and financial forecasting
                  </p>
                  <button className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                    Analyze Finances
                  </button>
                </div>

                {/* Market Intelligence */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <GlobeAltIcon className="h-6 w-6 text-purple-600" />
                    <h4 className="font-medium text-purple-900 dark:text-purple-100">Market Intelligence</h4>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                    Industry trends, competitor analysis, and market opportunities
                  </p>
                  <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
                    Market Research
                  </button>
                </div>

                {/* Operational Excellence */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <CogIcon className="h-6 w-6 text-orange-600" />
                    <h4 className="font-medium text-orange-900 dark:text-orange-100">Operational Excellence</h4>
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                    Process optimization, efficiency improvements, and automation opportunities
                  </p>
                  <button className="w-full px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm">
                    Optimize Operations
                  </button>
                </div>

                {/* Risk Management */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <ShieldCheckIcon className="h-6 w-6 text-red-600" />
                    <h4 className="font-medium text-red-900 dark:text-red-100">Risk Management</h4>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    Risk assessment, compliance monitoring, and mitigation strategies
                  </p>
                  <button className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                    Assess Risks
                  </button>
                </div>

                {/* Growth Opportunities */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <SparklesIcon className="h-6 w-6 text-teal-600" />
                    <h4 className="font-medium text-teal-900 dark:text-teal-100">Growth Opportunities</h4>
                  </div>
                  <p className="text-sm text-teal-700 dark:text-teal-300 mb-3">
                    Expansion strategies, new markets, and business development insights
                  </p>
                  <button className="w-full px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm">
                    Find Opportunities
                  </button>
                </div>
              </div>
            </div>

            {/* Jasper Coordination Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Coordination Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Auto Agent Recovery</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Automatically restart failed agents</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Performance Monitoring</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Continuously monitor agent performance</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Intelligent Task Delegation</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Automatically assign tasks to best-suited agents</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Business Advisory Mode</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enable comprehensive business advice and analysis</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Continuous Learning</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Continuously expand knowledge from interactions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Voice Responses</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enable voice synthesis for responses</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Knowledge Base Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-600" />
                Knowledge Base Management
              </h3>
              <div className="space-y-6">
                {/* Knowledge Categories */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Business Knowledge Categories</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Transportation Regulations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">USDOT Compliance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">FMCSA Requirements</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Business Strategy</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Financial Analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Market Intelligence</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Customer Insights</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Operational Excellence</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Technology Trends</span>
                    </div>
                  </div>
                </div>

                {/* Knowledge Sources */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Knowledge Sources</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">Federal Regulations Database</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">FMCSA, USDOT, and DOT regulations</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          Update
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ChartBarIcon className="h-5 w-5 text-green-600" />
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">Business Intelligence Feeds</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Market data, industry reports, financial news</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          Update
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CogIcon className="h-5 w-5 text-purple-600" />
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">CRM Data Integration</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Client data, deals, and business processes</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Knowledge Upload */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Upload Knowledge Documents</h4>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Upload documents, PDFs, or text files to expand Jasper's knowledge base
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                      Choose Files
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Advisory Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
                Business Advisory Configuration
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Advisory Capabilities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Strategic Planning</span>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Financial Analysis</span>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Market Research</span>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Risk Assessment</span>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Competitive Analysis</span>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Growth Opportunities</span>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Regulatory Compliance</span>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Operational Efficiency</span>
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Analysis Depth</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Research Depth Level
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="comprehensive">Comprehensive (Deep Analysis)</option>
                        <option value="detailed">Detailed (Thorough Review)</option>
                        <option value="standard">Standard (Good Overview)</option>
                        <option value="quick">Quick (Summary Level)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Response Detail Level
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="executive">Executive Summary</option>
                        <option value="detailed">Detailed Analysis</option>
                        <option value="comprehensive">Comprehensive Report</option>
                        <option value="technical">Technical Deep Dive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Memory & Context Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Memory & Context Management
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Conversation Memory Duration
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="unlimited">Unlimited (Remember Everything)</option>
                      <option value="30days">30 Days</option>
                      <option value="90days">90 Days</option>
                      <option value="1year">1 Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Context Retention
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="permanent">Permanent (Never Forget)</option>
                      <option value="longterm">Long-term (Months)</option>
                      <option value="medium">Medium-term (Weeks)</option>
                      <option value="short">Short-term (Days)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Memory Categories</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Business Decisions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Client Interactions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Strategic Discussions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Problem Solutions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Learning Insights</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Preferences</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Memory Usage</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Current memory usage: 2.3GB / 10GB available</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                    Manage Memory
                  </button>
                </div>
              </div>
            </div>

            {/* Continuous Learning & Knowledge Expansion */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-600" />
                Continuous Learning & Knowledge Expansion
              </h3>
              <div className="space-y-6">
                {/* Learning Sources */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Active Learning Sources</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Industry News & Updates</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Transportation, regulations, business trends</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                          <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                            Configure
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CogIcon className="h-5 w-5 text-green-600" />
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Business Data Analysis</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">CRM data, performance metrics, patterns</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                          <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                            Configure
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <UsersIcon className="h-5 w-5 text-purple-600" />
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Client Interaction Patterns</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Conversation analysis, preferences, needs</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                          <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                            Configure
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <ChartBarIcon className="h-5 w-5 text-orange-600" />
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Market Research Feeds</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Competitive intelligence, market trends</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                          <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                            Configure
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Configuration */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Learning Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Learning Update Frequency
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="real-time">Real-time (Continuous Learning)</option>
                        <option value="hourly">Hourly Updates</option>
                        <option value="daily">Daily Learning Sessions</option>
                        <option value="weekly">Weekly Knowledge Refresh</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Knowledge Retention Priority
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="business-critical">Business-Critical (High Priority)</option>
                        <option value="industry-relevant">Industry-Relevant (Medium Priority)</option>
                        <option value="general-knowledge">General Knowledge (Low Priority)</option>
                        <option value="all">All Knowledge (No Filtering)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Knowledge Expansion Tools */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Knowledge Expansion Tools</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <div className="text-center">
                        <GlobeAltIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Web Research</h5>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Expand knowledge from web sources</p>
                      </div>
                    </button>
                    <button className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <div className="text-center">
                        <CogIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <h5 className="font-medium text-green-900 dark:text-green-100 mb-1">Data Mining</h5>
                        <p className="text-sm text-green-700 dark:text-green-300">Extract insights from business data</p>
                      </div>
                    </button>
                    <button className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                      <div className="text-center">
                        <LightBulbIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Pattern Recognition</h5>
                        <p className="text-sm text-purple-700 dark:text-purple-300">Identify trends and patterns</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Learning Progress */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Learning Progress</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Last knowledge update: 2 hours ago | Total knowledge items: 15,847
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm">
                      View Learning Report
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Concurrent Requests Limit
                  </label>
                  <input
                    type="number"
                    defaultValue="5"
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cache Duration (minutes)
                  </label>
                  <input
                    type="number"
                    defaultValue="60"
                    min="0"
                    max="1440"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Request Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    min="5"
                    max="300"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Retry Attempts
                  </label>
                  <input
                    type="number"
                    defaultValue="3"
                    min="0"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Content Filtering</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Filter inappropriate content</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Data Encryption</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Encrypt sensitive data in transit</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Audit Logging</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Log all AI interactions for audit</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">API Key Rotation</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Automatically rotate API keys</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-green-800 dark:text-green-200">API Status</div>
                      <div className="text-xs text-green-600 dark:text-green-300">All providers connected</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Performance</div>
                      <div className="text-xs text-blue-600 dark:text-blue-300">Optimal</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Security</div>
                      <div className="text-xs text-purple-600 dark:text-purple-300">All checks passed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Persona Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
                Dynamic Persona Management
              </h3>
              
              {/* Current Persona Display */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Current AI Persona</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900 dark:text-white">System Prompt</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const persona = dynamicPersonaService.getCurrentPersona();
                          const systemPrompt = dynamicPersonaService.getSystemPrompt();
                          navigator.clipboard.writeText(systemPrompt);
                          alert('Persona copied to clipboard!');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded border p-3 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                      {dynamicPersonaService.getSystemPrompt()}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Current AI Personality</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">Intelligence Mode</span>
                        <span className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">Adaptive</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Truly intelligent AI with dynamic persona management and learning capabilities
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Learning Rate</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">High</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Adaptability</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">Dynamic</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Persona Configuration</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Communication Style
                      </label>
                      <select 
                        value={selectedCommunicationStyle}
                        onChange={(e) => setSelectedCommunicationStyle(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="intelligent">Intelligent & Adaptive</option>
                        <option value="professional">Professional & Formal</option>
                        <option value="friendly">Friendly & Casual</option>
                        <option value="creative">Creative & Innovative</option>
                        <option value="analytical">Analytical & Technical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expertise Focus
                      </label>
                      <select 
                        value={selectedExpertiseFocus}
                        onChange={(e) => setSelectedExpertiseFocus(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="general">General Intelligence</option>
                        <option value="business">Business & Strategy</option>
                        <option value="technical">Technical & Development</option>
                        <option value="creative">Creative & Design</option>
                        <option value="analytical">Analytical & Research</option>
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          dynamicPersonaService.updatePersona({
                            communicationStyle: selectedCommunicationStyle,
                            expertiseFocus: selectedExpertiseFocus
                          });
                          setCurrentPersona(dynamicPersonaService.getCurrentPersona());
                        }}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        Apply Changes
                      </button>
                      <button 
                        onClick={() => {
                          dynamicPersonaService.switchPersona('adaptive-intelligent');
                          setCurrentPersona(dynamicPersonaService.getCurrentPersona());
                          setSelectedCommunicationStyle('intelligent');
                          setSelectedExpertiseFocus('general');
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Reset to Default
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Voice Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Voice Configuration</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                  <div className={`w-3 h-3 rounded-full ${voiceSettings.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {voiceSettings.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              {/* Language & Voice Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Language Selection
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      setSelectedLanguage(e.target.value);
                      setSelectedVoice('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {getAvailableLanguages().map((lang) => (
                      <option key={lang} value={lang}>
                        {lang} ({availableVoices.filter(v => v.lang === lang).length} voices)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Voice Model
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a voice...</option>
                    {getFilteredVoices().map((voice, index) => (
                      <option key={`${voice.name}-${voice.lang}-${index}`} value={voice.name}>
                        {voice.name} ({(voice as any).gender || 'Unknown'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Voice Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rate: {voiceSettings.rate}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.rate}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pitch: {voiceSettings.pitch}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Volume: {voiceSettings.volume}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.volume}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Voice Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={voiceSettings.enabled}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable Voice</span>
                  </label>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={testVoice}
                    disabled={!voiceSettings.enabled}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Test Voice
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <SparklesIcon className="h-8 w-8 text-purple-600 mr-3" />
              Advanced AI Agent Control Panel
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create, manage, and orchestrate powerful AI agents with enterprise-grade capabilities
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <RefreshIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }, whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* AI Agent Creation Wizard */}
      <AIAgentCreationWizard
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAgentCreated={handleAgentCreated}
      />

      {/* Edit Agent Modal - Full Agent Creation Wizard */}
      <AIAgentCreationWizard
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAgent(null);
        }}
        onAgentCreated={handleUpdateAgent}
        editingAgent={editingAgent}
        mode="edit"
      />

      {/* Delete Agent Confirmation Modal */}
      {showDeleteModal && deletingAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Agent
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the agent "{deletingAgent.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingAgent(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAgent}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAIAgentControlPanel;
