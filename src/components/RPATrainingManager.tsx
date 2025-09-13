import React, { useState, useEffect } from 'react';
import {
  XIcon,
  PlayIcon,
  PauseIcon,
  RefreshIcon,
  CheckCircleIcon,
  ExclamationIcon,
  UserIcon,
  QrcodeIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  CloudUploadIcon,
  BeakerIcon,
  PaperAirplaneIcon,
  HandIcon,
  ArrowRightIcon,
  StopIcon,
} from '@heroicons/react/outline';

interface FieldMapping {
  id: string;
  dataField: string; // Our CRM field name
  semanticDescription: string; // What this field represents
  possibleSelectors: string[]; // CSS selectors, XPath, etc.
  possibleLabels: string[]; // Possible label text variations
  fieldType: 'text' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'number';
  validationRules: string[];
  businessLogic?: {
    condition: string;
    action: string;
    fallbackAction: string;
  };
}

interface IntelligentMapping {
  id: string;
  stepId: string;
  fieldMappings: FieldMapping[];
  confidence: number;
  lastUpdated: string;
  successRate: number;
  adaptiveLearning: {
    enabled: boolean;
    learningThreshold: number;
    recentChanges: string[];
  };
}

interface BusinessDecision {
  id: string;
  name: string;
  condition: string;
  action: string;
  requiresApproval: boolean;
  fallbackAction: string;
  examples: string[];
}

interface RPAWorkflowStep {
  id: string;
  name: string;
  type: 'automated' | 'human_handoff' | 'wait_for_completion' | 'validation' | 'business_decision';
  description: string;
  expectedDuration: number; // in seconds
  handoffPoint?: {
    type: 'mfa' | 'qr_code' | 'document_upload' | 'payment' | 'signature';
    instructions: string;
    clientAction: string;
    resumeCondition: string;
  };
  validation?: {
    elementSelector: string;
    expectedState: string;
    timeoutMs: number;
  };
  intelligentMapping?: IntelligentMapping;
  businessDecisions?: BusinessDecision[];
  screenshots?: string[];
  successCriteria: string[];
}

interface RPATrainingSession {
  id: string;
  agentId: string;
  agentName: string;
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'waiting_for_human';
  currentStep: number;
  totalSteps: number;
  startedAt: string;
  completedAt?: string;
  workflowSteps: RPAWorkflowStep[];
  handoffPoints: {
    stepId: string;
    handoffType: string;
    clientNotified: boolean;
    clientCompleted: boolean;
    resumedAt?: string;
  }[];
  logs: string[];
  metrics: {
    totalTime: number;
    humanInteractionTime: number;
    automationTime: number;
    successRate: number;
    handoffCount: number;
  };
}

interface RPAHandoffEvent {
  id: string;
  sessionId: string;
  stepId: string;
  handoffType: 'mfa' | 'qr_code' | 'document_upload' | 'payment' | 'signature';
  timestamp: string;
  clientNotified: boolean;
  clientCompleted: boolean;
  instructions: string;
  resumeCondition: string;
  screenshots: string[];
}

interface RPATrainingManagerProps {
  isOpen: boolean;
  onClose: () => void;
  agentId?: string;
  agentName?: string;
}

const RPATrainingManager: React.FC<RPATrainingManagerProps> = ({
  isOpen,
  onClose,
  agentId,
  agentName
}) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'training' | 'handoffs' | 'intelligence' | 'testing'>('workflow');
  const [trainingSessions, setTrainingSessions] = useState<RPATrainingSession[]>([]);
  const [handoffEvents, setHandoffEvents] = useState<RPAHandoffEvent[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Mock USDOT Application RPA Workflow with Intelligent Mapping
  const usdotWorkflow: RPAWorkflowStep[] = [
    {
      id: '1',
      name: 'Navigate to FMCSA Portal',
      type: 'automated',
      description: 'Open FMCSA website and navigate to USDOT application portal',
      expectedDuration: 10,
      successCriteria: ['Page loaded successfully', 'Login form visible']
    },
    {
      id: '2',
      name: 'Initial Login',
      type: 'automated',
      description: 'Enter username and password',
      expectedDuration: 5,
      successCriteria: ['Credentials entered', 'Login button clicked']
    },
    {
      id: '3',
      name: 'Multi-Factor Authentication',
      type: 'human_handoff',
      description: 'MFA code required - handoff to human',
      expectedDuration: 300,
      handoffPoint: {
        type: 'mfa',
        instructions: 'Please complete the multi-factor authentication on your device. The RPA will wait for you to enter the MFA code and click "Verify".',
        clientAction: 'Enter MFA code and click Verify',
        resumeCondition: 'MFA verification successful and "Continue" button is enabled'
      },
      validation: {
        elementSelector: '#continue-button',
        expectedState: 'enabled',
        timeoutMs: 300000
      },
      successCriteria: ['MFA completed', 'Continue button enabled']
    },
    {
      id: '4',
      name: 'Application Form - Company Info',
      type: 'automated',
      description: 'Intelligently map and fill company information fields',
      expectedDuration: 30,
      intelligentMapping: {
        id: 'company-info-mapping',
        stepId: '4',
        confidence: 0.94,
        lastUpdated: '2024-01-20T10:15:00Z',
        successRate: 96.2,
        adaptiveLearning: {
          enabled: true,
          learningThreshold: 0.85,
          recentChanges: ['Field "Business Name" renamed to "Legal Business Name"', 'Address field order changed']
        },
        fieldMappings: [
          {
            id: 'legal-business-name',
            dataField: 'legalBusinessName',
            semanticDescription: 'The official legal name of the business entity',
            possibleSelectors: ['#legal-business-name', '#business-name', '[name="legalBusinessName"]', '[data-field="business-name"]'],
            possibleLabels: ['Legal Business Name', 'Business Name', 'Company Name', 'Entity Name', 'Official Business Name'],
            fieldType: 'text',
            validationRules: ['required', 'min-length:2', 'max-length:100'],
            businessLogic: {
              condition: 'If DBA name exists, use DBA name as primary',
              action: 'Use DBA name if available, otherwise use legal name',
              fallbackAction: 'Prompt human for clarification'
            }
          },
          {
            id: 'business-type',
            dataField: 'businessType',
            semanticDescription: 'The legal structure type of the business',
            possibleSelectors: ['#business-type', '#entity-type', '[name="businessType"]', 'select[name*="type"]'],
            possibleLabels: ['Business Type', 'Entity Type', 'Legal Structure', 'Organization Type'],
            fieldType: 'select',
            validationRules: ['required', 'one-of:LLC,Corporation,Partnership,Sole Proprietorship'],
            businessLogic: {
              condition: 'Map common variations to standard types',
              action: 'LLC -> LLC, Corp -> Corporation, LP -> Partnership',
              fallbackAction: 'Use exact match or prompt human'
            }
          },
          {
            id: 'physical-address',
            dataField: 'physicalStreetAddress',
            semanticDescription: 'The physical street address of the business',
            possibleSelectors: ['#physical-address', '#street-address', '[name="physicalAddress"]', '[data-field="address"]'],
            possibleLabels: ['Physical Address', 'Street Address', 'Business Address', 'Primary Address'],
            fieldType: 'text',
            validationRules: ['required', 'min-length:5', 'address-format'],
            businessLogic: {
              condition: 'If multiple address fields exist, use physical address',
              action: 'Prioritize physical over mailing address',
              fallbackAction: 'Use first available address field'
            }
          }
        ]
      },
      successCriteria: ['Company name entered', 'Address fields completed', 'Business type selected']
    },
    {
      id: '5',
      name: 'Application Form - Fleet Info',
      type: 'automated',
      description: 'Intelligently map and fill fleet information with business logic',
      expectedDuration: 45,
      intelligentMapping: {
        id: 'fleet-info-mapping',
        stepId: '5',
        confidence: 0.91,
        lastUpdated: '2024-01-20T10:20:00Z',
        successRate: 93.8,
        adaptiveLearning: {
          enabled: true,
          learningThreshold: 0.85,
          recentChanges: ['Vehicle count field moved to different section', 'Driver count field renamed to "Number of Drivers"']
        },
        fieldMappings: [
          {
            id: 'vehicle-count',
            dataField: 'numberOfVehicles',
            semanticDescription: 'Total number of vehicles in the fleet',
            possibleSelectors: ['#vehicle-count', '#number-of-vehicles', '[name="vehicleCount"]', '[data-field="vehicles"]'],
            possibleLabels: ['Number of Vehicles', 'Vehicle Count', 'Total Vehicles', 'Fleet Size', 'Vehicles'],
            fieldType: 'number',
            validationRules: ['required', 'min:0', 'max:10000'],
            businessLogic: {
              condition: 'If vehicle count is 0, check if this is a broker',
              action: 'For brokers, set to 0 and continue',
              fallbackAction: 'Prompt human for clarification'
            }
          },
          {
            id: 'driver-count',
            dataField: 'numberOfDrivers',
            semanticDescription: 'Total number of drivers employed',
            possibleSelectors: ['#driver-count', '#number-of-drivers', '[name="driverCount"]', '[data-field="drivers"]'],
            possibleLabels: ['Number of Drivers', 'Driver Count', 'Total Drivers', 'Drivers', 'Employee Drivers'],
            fieldType: 'number',
            validationRules: ['required', 'min:0', 'max:1000'],
            businessLogic: {
              condition: 'Driver count should be >= vehicle count for carriers',
              action: 'Validate driver count against vehicle count',
              fallbackAction: 'Flag for human review if mismatch'
            }
          }
        ]
      },
      businessDecisions: [
        {
          id: 'fleet-type-decision',
          name: 'Determine Fleet Type',
          condition: 'If vehicle count > 0, classify as carrier; if 0, classify as broker',
          action: 'Set fleet type based on vehicle count and business classification',
          requiresApproval: false,
          fallbackAction: 'Prompt human for fleet type classification',
          examples: ['12 vehicles + 15 drivers = Owned Fleet', '0 vehicles + 0 drivers = Broker']
        }
      ],
      successCriteria: ['Vehicle count entered', 'Driver count entered', 'Fleet type selected']
    },
    {
      id: '6',
      name: 'Document Upload',
      type: 'human_handoff',
      description: 'Upload required documents - handoff to human',
      expectedDuration: 600,
      handoffPoint: {
        type: 'document_upload',
        instructions: 'Please upload the required documents: Insurance certificate, BOC-3 form, and any other required documentation. The RPA will wait for all documents to be uploaded.',
        clientAction: 'Upload all required documents',
        resumeCondition: 'All required documents uploaded and "Next" button is enabled'
      },
      validation: {
        elementSelector: '#next-button',
        expectedState: 'enabled',
        timeoutMs: 600000
      },
      successCriteria: ['All documents uploaded', 'Next button enabled']
    },
    {
      id: '7',
      name: 'Payment Processing Decision',
      type: 'business_decision',
      description: 'Intelligently determine payment requirements and process',
      expectedDuration: 30,
      businessDecisions: [
        {
          id: 'payment-decision',
          name: 'Payment Processing Logic',
          condition: 'Check application type, fleet size, and required authorities',
          action: 'Calculate fees and process payment for authorities',
          requiresApproval: true,
          fallbackAction: 'Escalate to human for payment processing',
          examples: [
            'USDOT only: $300 fee',
            'USDOT + MC Authority: $300 + $300 = $600',
            'Large fleet (>25 vehicles): Additional $200 safety fee',
            'Broker bond: $75,000 bond + $300 processing'
          ]
        },
        {
          id: 'authority-selection',
          name: 'Authority Selection Logic',
          condition: 'Based on business type and operation scope',
          action: 'Select appropriate authorities (USDOT, MC, Broker, etc.)',
          requiresApproval: false,
          fallbackAction: 'Default to USDOT only, flag for human review',
          examples: [
            'Interstate carrier: USDOT + MC Authority',
            'Intrastate only: USDOT only',
            'Broker: USDOT + Broker Authority',
            'Hazmat carrier: USDOT + MC + Hazmat Authority'
          ]
        }
      ],
      successCriteria: ['Payment requirements calculated', 'Authorities selected', 'Payment processed or flagged for human']
    },
    {
      id: '8',
      name: 'Review and Submit',
      type: 'automated',
      description: 'Review application and submit',
      expectedDuration: 20,
      successCriteria: ['Application reviewed', 'Submit button clicked']
    },
    {
      id: '9',
      name: 'QR Code Verification',
      type: 'human_handoff',
      description: 'QR code verification required - handoff to client',
      expectedDuration: 180,
      handoffPoint: {
        type: 'qr_code',
        instructions: 'A QR code has appeared on screen. Please scan this QR code with your mobile device to complete the verification process. The RPA will wait for the QR code verification to complete.',
        clientAction: 'Scan QR code with mobile device',
        resumeCondition: 'QR code verification successful and "Complete Application" button is no longer greyed out'
      },
      validation: {
        elementSelector: '#complete-application-button',
        expectedState: 'enabled',
        timeoutMs: 180000
      },
      successCriteria: ['QR code scanned', 'Complete Application button enabled']
    },
    {
      id: '10',
      name: 'Final Submission',
      type: 'automated',
      description: 'Complete the final application submission',
      expectedDuration: 15,
      successCriteria: ['Application submitted', 'Confirmation received']
    }
  ];

  // Mock data initialization
  useEffect(() => {
    if (isOpen) {
      setTrainingSessions([
        {
          id: '1',
          agentId: agentId || '1',
          agentName: agentName || 'USDOT RPA Agent',
          status: 'completed',
          currentStep: 9,
          totalSteps: 9,
          startedAt: '2024-01-20T10:00:00Z',
          completedAt: '2024-01-20T10:45:00Z',
          workflowSteps: usdotWorkflow,
          handoffPoints: [
            {
              stepId: '3',
              handoffType: 'mfa',
              clientNotified: true,
              clientCompleted: true,
              resumedAt: '2024-01-20T10:05:00Z'
            },
            {
              stepId: '6',
              handoffType: 'document_upload',
              clientNotified: true,
              clientCompleted: true,
              resumedAt: '2024-01-20T10:25:00Z'
            },
            {
              stepId: '8',
              handoffType: 'qr_code',
              clientNotified: true,
              clientCompleted: true,
              resumedAt: '2024-01-20T10:40:00Z'
            }
          ],
          logs: [
            'RPA session started',
            'Navigated to FMCSA portal successfully',
            'Initial login completed',
            'MFA handoff initiated - waiting for human',
            'MFA completed by human - resuming automation',
            'Company information filled successfully',
            'Fleet information completed',
            'Document upload handoff initiated - waiting for human',
            'Documents uploaded by human - resuming automation',
            'Application review completed',
            'QR code verification handoff initiated - waiting for client',
            'QR code verified by client - resuming automation',
            'Final submission completed successfully'
          ],
          metrics: {
            totalTime: 2700, // 45 minutes
            humanInteractionTime: 900, // 15 minutes
            automationTime: 1800, // 30 minutes
            successRate: 100,
            handoffCount: 3
          }
        },
        {
          id: '2',
          agentId: agentId || '1',
          agentName: agentName || 'USDOT RPA Agent',
          status: 'waiting_for_human',
          currentStep: 3,
          totalSteps: 9,
          startedAt: '2024-01-21T09:30:00Z',
          workflowSteps: usdotWorkflow,
          handoffPoints: [
            {
              stepId: '3',
              handoffType: 'mfa',
              clientNotified: true,
              clientCompleted: false
            }
          ],
          logs: [
            'RPA session started',
            'Navigated to FMCSA portal successfully',
            'Initial login completed',
            'MFA handoff initiated - waiting for human'
          ],
          metrics: {
            totalTime: 300,
            humanInteractionTime: 0,
            automationTime: 300,
            successRate: 0,
            handoffCount: 1
          }
        }
      ]);

      setHandoffEvents([
        {
          id: '1',
          sessionId: '1',
          stepId: '3',
          handoffType: 'mfa',
          timestamp: '2024-01-20T10:02:00Z',
          clientNotified: true,
          clientCompleted: true,
          instructions: 'Please complete the multi-factor authentication on your device.',
          resumeCondition: 'MFA verification successful and "Continue" button is enabled',
          screenshots: ['mfa-screen.png', 'mfa-completed.png']
        },
        {
          id: '2',
          sessionId: '1',
          stepId: '6',
          handoffType: 'document_upload',
          timestamp: '2024-01-20T10:20:00Z',
          clientNotified: true,
          clientCompleted: true,
          instructions: 'Please upload the required documents: Insurance certificate, BOC-3 form.',
          resumeCondition: 'All required documents uploaded and "Next" button is enabled',
          screenshots: ['upload-screen.png', 'documents-uploaded.png']
        },
        {
          id: '3',
          sessionId: '1',
          stepId: '8',
          handoffType: 'qr_code',
          timestamp: '2024-01-20T10:35:00Z',
          clientNotified: true,
          clientCompleted: true,
          instructions: 'Please scan the QR code with your mobile device to complete verification.',
          resumeCondition: 'QR code verification successful and "Complete Application" button is no longer greyed out',
          screenshots: ['qr-code-screen.png', 'qr-verified.png']
        }
      ]);
    }
  }, [isOpen, agentId, agentName]);

  const handleStartTraining = async () => {
    setIsTraining(true);
    // Simulate training start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newSession: RPATrainingSession = {
      id: `session-${Date.now()}`,
      agentId: agentId || '1',
      agentName: agentName || 'USDOT RPA Agent',
      status: 'running',
      currentStep: 1,
      totalSteps: usdotWorkflow.length,
      startedAt: new Date().toISOString(),
      workflowSteps: usdotWorkflow,
      handoffPoints: [],
      logs: ['RPA training session started'],
      metrics: {
        totalTime: 0,
        humanInteractionTime: 0,
        automationTime: 0,
        successRate: 0,
        handoffCount: 0
      }
    };

    setTrainingSessions(prev => [newSession, ...prev]);
    setIsTraining(false);
  };

  const handleRunTests = async () => {
    setIsTesting(true);
    // Simulate testing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTesting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'running':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'waiting_for_human':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'paused':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getHandoffIcon = (type: string) => {
    switch (type) {
      case 'mfa':
        return ShieldCheckIcon;
      case 'qr_code':
        return QrcodeIcon;
      case 'document_upload':
        return DocumentTextIcon;
      case 'payment':
        return UserIcon;
      case 'signature':
        return UserIcon;
      default:
        return HandIcon;
    }
  };

  const renderWorkflowTab = () => (
    <div className="space-y-6">
      {/* Workflow Overview */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">USDOT Application RPA Workflow</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <HandIcon className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Human-in-the-Loop RPA
              </h3>
              <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  This RPA workflow includes 3 human handoff points: MFA authentication, document upload, 
                  and QR code verification. The RPA will pause and wait for human completion at each handoff point.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {usdotWorkflow.map((step, index) => {
          const HandoffIcon = step.handoffPoint ? getHandoffIcon(step.handoffPoint.type) : null;
          return (
            <div key={step.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.type === 'human_handoff' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{step.name}</h4>
                      {step.type === 'human_handoff' && HandoffIcon && (
                        <HandoffIcon className="h-5 w-5 text-yellow-600" />
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        step.type === 'human_handoff'
                          ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
                          : 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
                      }`}>
                        {step.type === 'human_handoff' ? 'Human Handoff' : 'Automated'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{step.description}</p>
                    
                    {step.handoffPoint && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                          Handoff Instructions
                        </h5>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                          {step.handoffPoint.instructions}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-yellow-800 dark:text-yellow-200">Client Action:</span>
                            <p className="text-yellow-700 dark:text-yellow-300">{step.handoffPoint.clientAction}</p>
                          </div>
                          <div>
                            <span className="font-medium text-yellow-800 dark:text-yellow-200">Resume Condition:</span>
                            <p className="text-yellow-700 dark:text-yellow-300">{step.handoffPoint.resumeCondition}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>⏱️ {step.expectedDuration}s</span>
                      <span>✅ {step.successCriteria.length} success criteria</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTrainingTab = () => (
    <div className="space-y-6">
      {/* Start Training Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">RPA Training Sessions</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Train your RPA agent with human-in-the-loop workflows
          </p>
        </div>
        <button
          onClick={handleStartTraining}
          disabled={isTraining}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTraining ? (
            <>
              <RefreshIcon className="h-4 w-4 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4 mr-2" />
              Start Training Session
            </>
          )}
        </button>
      </div>

      {/* Training Sessions */}
      <div className="space-y-4">
        {trainingSessions.map((session) => (
          <div key={session.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{session.agentName}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Session {session.id} • Started: {new Date(session.startedAt).toLocaleString()}
                </p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(session.status)}`}>
                {session.status.replace('_', ' ')}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{session.currentStep} / {session.totalSteps} steps</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(session.currentStep / session.totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.floor(session.metrics.totalTime / 60)}m</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{Math.floor(session.metrics.humanInteractionTime / 60)}m</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Human Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.floor(session.metrics.automationTime / 60)}m</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Auto Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{session.metrics.handoffCount}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Handoffs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{session.metrics.successRate}%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Success</div>
              </div>
            </div>

            {/* Handoff Points */}
            {session.handoffPoints.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Handoff Points</h5>
                <div className="space-y-2">
                  {session.handoffPoints.map((handoff, index) => {
                    const HandoffIcon = getHandoffIcon(handoff.handoffType);
                    return (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <HandoffIcon className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {handoff.handoffType.replace('_', ' ')}
                        </span>
                        <div className="flex-1" />
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          handoff.clientCompleted 
                            ? 'text-green-600 bg-green-100 dark:bg-green-900/20'
                            : 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
                        }`}>
                          {handoff.clientCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Logs */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Session Logs</h5>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 max-h-32 overflow-y-auto">
                {session.logs.map((log, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIntelligenceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Intelligent Field Mapping</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          AI-powered field mapping that adapts to website changes and makes business decisions
        </p>
      </div>

      {/* Field Mapping Examples */}
      <div className="space-y-6">
        {usdotWorkflow
          .filter(step => step.intelligentMapping)
          .map((step) => (
            <div key={step.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{step.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                </div>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100 dark:bg-green-900/20">
                    {Math.round((step.intelligentMapping?.confidence || 0) * 100)}% Confidence
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full text-blue-600 bg-blue-100 dark:bg-blue-900/20">
                    {Math.round((step.intelligentMapping?.successRate || 0) * 100)}% Success
                  </span>
                </div>
              </div>

              {/* Field Mappings */}
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Field Mappings</h5>
                <div className="space-y-3">
                  {step.intelligentMapping?.fieldMappings.map((mapping) => (
                    <div key={mapping.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h6 className="text-sm font-medium text-gray-900 dark:text-white">
                            {mapping.dataField}
                          </h6>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {mapping.semanticDescription}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full text-purple-600 bg-purple-100 dark:bg-purple-900/20">
                          {mapping.fieldType}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Possible Selectors:</span>
                          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1">
                            {mapping.possibleSelectors.slice(0, 3).map((selector, idx) => (
                              <li key={idx}>{selector}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Possible Labels:</span>
                          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1">
                            {mapping.possibleLabels.slice(0, 3).map((label, idx) => (
                              <li key={idx}>{label}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {mapping.businessLogic && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <h6 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">Business Logic</h6>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            <strong>Condition:</strong> {mapping.businessLogic.condition}
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            <strong>Action:</strong> {mapping.businessLogic.action}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Decisions */}
              {step.businessDecisions && step.businessDecisions.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Business Decisions</h5>
                  <div className="space-y-3">
                    {step.businessDecisions.map((decision) => (
                      <div key={decision.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h6 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            {decision.name}
                          </h6>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            decision.requiresApproval 
                              ? 'text-red-600 bg-red-100 dark:bg-red-900/20'
                              : 'text-green-600 bg-green-100 dark:bg-green-900/20'
                          }`}>
                            {decision.requiresApproval ? 'Requires Approval' : 'Auto-Decision'}
                          </span>
                        </div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                          <strong>Condition:</strong> {decision.condition}
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                          <strong>Action:</strong> {decision.action}
                        </p>
                        <div>
                          <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Examples:</span>
                          <ul className="list-disc list-inside text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            {decision.examples.slice(0, 2).map((example, idx) => (
                              <li key={idx}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Adaptive Learning */}
              {step.intelligentMapping?.adaptiveLearning.enabled && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h6 className="text-xs font-medium text-green-800 dark:text-green-200 mb-2">Adaptive Learning</h6>
                  <p className="text-xs text-green-700 dark:text-green-300 mb-2">
                    Learning threshold: {Math.round(step.intelligentMapping.adaptiveLearning.learningThreshold * 100)}%
                  </p>
                  {step.intelligentMapping.adaptiveLearning.recentChanges.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-green-800 dark:text-green-200">Recent Changes Detected:</span>
                      <ul className="list-disc list-inside text-xs text-green-700 dark:text-green-300 mt-1">
                        {step.intelligentMapping.adaptiveLearning.recentChanges.map((change, idx) => (
                          <li key={idx}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );

  const renderHandoffsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Handoff Events</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Monitor and manage human-in-the-loop handoff events
        </p>
      </div>

      <div className="space-y-4">
        {handoffEvents.map((event) => {
          const HandoffIcon = getHandoffIcon(event.handoffType);
          return (
            <div key={event.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <HandoffIcon className="h-6 w-6 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                      {event.handoffType.replace('_', ' ')} Handoff
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Session {event.sessionId} • {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.clientNotified 
                      ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
                      : 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
                  }`}>
                    {event.clientNotified ? 'Notified' : 'Not Notified'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.clientCompleted 
                      ? 'text-green-600 bg-green-100 dark:bg-green-900/20'
                      : 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
                  }`}>
                    {event.clientCompleted ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Instructions</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{event.instructions}</p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Resume Condition</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{event.resumeCondition}</p>
                </div>

                {event.screenshots.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Screenshots</h5>
                    <div className="flex space-x-2">
                      {event.screenshots.map((screenshot, index) => (
                        <button
                          key={index}
                          className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <EyeIcon className="h-4 w-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTestingTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">RPA Workflow Testing</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Test handoff detection and resume capabilities
          </p>
        </div>
        <button
          onClick={handleRunTests}
          disabled={isTesting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isTesting ? (
            <>
              <RefreshIcon className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <BeakerIcon className="h-4 w-4 mr-2" />
              Run Handoff Tests
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Handoff Detection Tests</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">MFA Screen Detection</span>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">QR Code Detection</span>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Document Upload Detection</span>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Button State Detection</span>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resume Capability Tests</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">State Persistence</span>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Resume After MFA</span>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Resume After QR Code</span>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Timeout Handling</span>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-10 mx-auto p-4 sm:p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800 m-4 sm:m-0">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                RPA Training Manager
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {agentName ? `Training for ${agentName}` : 'Train Human-in-the-Loop RPA workflows'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'workflow', name: 'Workflow Design', icon: DocumentTextIcon },
                { id: 'training', name: 'Training Sessions', icon: PlayIcon },
                { id: 'handoffs', name: 'Handoff Events', icon: HandIcon },
                { id: 'intelligence', name: 'AI Intelligence', icon: ChipIcon },
                { id: 'testing', name: 'Testing', icon: BeakerIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
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

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'workflow' && renderWorkflowTab()}
            {activeTab === 'training' && renderTrainingTab()}
            {activeTab === 'handoffs' && renderHandoffsTab()}
            {activeTab === 'intelligence' && renderIntelligenceTab()}
            {activeTab === 'testing' && renderTestingTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RPATrainingManager;
