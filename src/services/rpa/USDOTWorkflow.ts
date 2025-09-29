import { RPAWorkflow, WorkflowStep, HumanCheckpoint, WorkflowAction, WorkflowCondition } from '../../types/rpa';
import { usdotCredentialService } from './USDOTCredentialService';

export const USDOT_APPLICATION_WORKFLOW: RPAWorkflow = {
  id: 'usdot_application_workflow',
  name: 'USDOT Number Application Process',
  description: 'Automated USDOT number application process with human checkpoints',
  estimatedDuration: 45, // minutes
  requiredPermissions: ['federal_websites', 'document_upload', 'payment_processing'],
  steps: [
    {
      id: 'step_1',
      name: 'Initialize Application',
      description: 'Prepare application data and validate requirements',
      type: 'automated',
      order: 1,
      required: true,
      actions: [
        {
          id: 'validate_data',
          type: 'verify_data',
          parameters: {
            requiredFields: ['companyInfo', 'contactInfo', 'businessDetails'],
            validationRules: 'usdot_requirements'
          },
          retryOnFailure: true,
          timeout: 5
        },
        {
          id: 'create_application_session',
          type: 'send_notification',
          parameters: {
            message: 'Starting USDOT application process',
            recipients: ['admin']
          },
          retryOnFailure: false
        }
      ]
    },
    {
      id: 'step_2',
      name: 'Login to Login.gov',
      description: 'Authenticate with Login.gov for federal access',
      type: 'human_checkpoint',
      order: 2,
      required: true,
      timeout: 15,
      checkpoints: [
        {
          id: 'login_verification',
          name: 'Login.gov Authentication',
          description: 'Employee must verify and complete Login.gov authentication',
          type: 'employee_verification',
          requiredRole: 'employee',
          status: 'pending',
          data: {
            url: 'https://secure.login.gov/',
            instructions: 'Please complete the Login.gov authentication process. The system will wait for your confirmation.',
            timeoutMinutes: 15
          }
        }
      ],
      actions: [
        {
          id: 'navigate_login_gov',
          type: 'navigate_url',
          parameters: {
            url: 'https://secure.login.gov/',
            waitForElement: '#sign-in-button'
          },
          retryOnFailure: true,
          timeout: 10
        },
        {
          id: 'wait_for_human_login',
          type: 'wait',
          parameters: {
            condition: 'human_checkpoint_completed',
            checkpointId: 'login_verification'
          },
          retryOnFailure: false
        }
      ]
    },
    {
      id: 'step_3',
      name: 'Access USDOT Application',
      description: 'Navigate to USDOT application portal',
      type: 'automated',
      order: 3,
      required: true,
      actions: [
        {
          id: 'navigate_usdot_portal',
          type: 'navigate_url',
          parameters: {
            url: 'https://ai.fmcsa.dot.gov/',
            waitForElement: '.application-portal'
          },
          retryOnFailure: true,
          timeout: 10
        },
        {
          id: 'start_new_application',
          type: 'click_element',
          parameters: {
            selector: 'button[data-action="start-application"]'
          },
          retryOnFailure: true,
          timeout: 5
        }
      ]
    },
    {
      id: 'step_4',
      name: 'Fill Company Information',
      description: 'Automatically populate company information from CRM data',
      type: 'automated',
      order: 4,
      required: true,
      actions: [
        {
          id: 'fill_legal_name',
          type: 'fill_form',
          parameters: {
            selector: 'input[name="legalName"]',
            value: '{{companyInfo.legalName}}'
          },
          retryOnFailure: true,
          timeout: 5
        },
        {
          id: 'fill_dba_name',
          type: 'fill_form',
          parameters: {
            selector: 'input[name="dbaName"]',
            value: '{{companyInfo.dbaName}}',
            optional: true
          },
          retryOnFailure: true,
          timeout: 5
        },
        {
          id: 'fill_ein',
          type: 'fill_form',
          parameters: {
            selector: 'input[name="ein"]',
            value: '{{companyInfo.ein}}'
          },
          retryOnFailure: true,
          timeout: 5
        },
        {
          id: 'fill_address',
          type: 'fill_form',
          parameters: {
            selector: 'input[name="street"]',
            value: '{{companyInfo.address.street}}'
          },
          retryOnFailure: true,
          timeout: 5
        },
        {
          id: 'fill_city_state_zip',
          type: 'fill_form',
          parameters: {
            selector: 'input[name="city"]',
            value: '{{companyInfo.address.city}}'
          },
          retryOnFailure: true,
          timeout: 5
        },
        {
          id: 'fill_contact_info',
          type: 'fill_form',
          parameters: {
            selector: 'input[name="contactPhone"]',
            value: '{{contactInfo.phone}}'
          },
          retryOnFailure: true,
          timeout: 5
        }
      ]
    },
    {
      id: 'step_5',
      name: 'Upload Required Documents',
      description: 'Upload company documents and certificates',
      type: 'document_upload',
      order: 5,
      required: true,
      actions: [
        {
          id: 'upload_insurance_certificate',
          type: 'upload_document',
          parameters: {
            selector: 'input[type="file"][name="insuranceCertificate"]',
            filePath: '{{documents.insuranceCertificate.path}}',
            documentType: 'insurance_certificate'
          },
          retryOnFailure: true,
          timeout: 30
        },
        {
          id: 'upload_business_license',
          type: 'upload_document',
          parameters: {
            selector: 'input[type="file"][name="businessLicense"]',
            filePath: '{{documents.businessLicense.path}}',
            documentType: 'business_license'
          },
          retryOnFailure: true,
          timeout: 30
        }
      ]
    },
    {
      id: 'step_6',
      name: 'QR Code Client Handoff',
      description: 'Hand off to client for QR code completion',
      type: 'client_handoff',
      order: 6,
      required: true,
      timeout: 60, // 1 hour for client to complete
      checkpoints: [
        {
          id: 'qr_code_completion',
          name: 'Client QR Code Completion',
          description: 'Client must complete QR code verification process',
          type: 'client_approval',
          requiredRole: 'client',
          status: 'pending',
          data: {
            qrCodeUrl: '{{qrCodeUrl}}',
            instructions: 'Please scan the QR code and complete the verification process. You have 1 hour to complete this step.',
            clientNotification: true,
            timeoutMinutes: 60
          }
        }
      ],
      actions: [
        {
          id: 'generate_qr_code',
          type: 'click_element',
          parameters: {
            selector: 'button[data-action="generate-qr"]'
          },
          retryOnFailure: true,
          timeout: 10
        },
        {
          id: 'notify_client_qr',
          type: 'send_notification',
          parameters: {
            message: 'QR code is ready for verification. Please check your email or portal.',
            recipients: ['client'],
            includeQRCode: true
          },
          retryOnFailure: true
        },
        {
          id: 'wait_for_client_completion',
          type: 'wait',
          parameters: {
            condition: 'human_checkpoint_completed',
            checkpointId: 'qr_code_completion'
          },
          retryOnFailure: false
        }
      ]
    },
    {
      id: 'step_7',
      name: 'Payment Verification',
      description: 'Verify payment has been received before proceeding',
      type: 'payment_verification',
      order: 7,
      required: true,
      timeout: 30,
      checkpoints: [
        {
          id: 'payment_verification',
          name: 'Payment Verification',
          description: 'Admin must verify payment has been received from client',
          type: 'payment_verification',
          requiredRole: 'admin',
          status: 'pending',
          data: {
            amount: '{{paymentAmount}}',
            paymentMethod: '{{paymentMethod}}',
            clientId: '{{clientId}}',
            instructions: 'Please verify that payment has been received from the client before proceeding with the application submission.',
            timeoutMinutes: 30
          }
        }
      ],
      actions: [
        {
          id: 'check_payment_status',
          type: 'verify_data',
          parameters: {
            checkType: 'payment_status',
            clientId: '{{clientId}}',
            amount: '{{paymentAmount}}'
          },
          retryOnFailure: true,
          timeout: 10
        },
        {
          id: 'notify_admin_payment',
          type: 'send_notification',
          parameters: {
            message: 'Payment verification required for USDOT application',
            recipients: ['admin'],
            includePaymentDetails: true
          },
          retryOnFailure: true
        },
        {
          id: 'wait_for_payment_verification',
          type: 'wait',
          parameters: {
            condition: 'human_checkpoint_completed',
            checkpointId: 'payment_verification'
          },
          retryOnFailure: false
        }
      ]
    },
    {
      id: 'step_8',
      name: 'Submit Application',
      description: 'Submit the completed USDOT application',
      type: 'automated',
      order: 8,
      required: true,
      actions: [
        {
          id: 'review_application',
          type: 'verify_data',
          parameters: {
            checkType: 'application_completeness',
            requiredSections: ['company_info', 'contact_info', 'documents', 'qr_verification', 'payment']
          },
          retryOnFailure: true,
          timeout: 5
        },
        {
          id: 'submit_application',
          type: 'click_element',
          parameters: {
            selector: 'button[data-action="submit-application"]'
          },
          retryOnFailure: true,
          timeout: 10
        },
        {
          id: 'confirm_submission',
          type: 'verify_data',
          parameters: {
            checkType: 'submission_confirmation',
            expectedElement: '.submission-success'
          },
          retryOnFailure: true,
          timeout: 15
        }
      ]
    },
    {
      id: 'step_9',
      name: 'Application Complete',
      description: 'Application submitted successfully',
      type: 'automated',
      order: 9,
      required: true,
      actions: [
        {
          id: 'extract_usdot_number',
          type: 'verify_data',
          parameters: {
            checkType: 'extract_usdot_number',
            selector: '.usdot-number'
          },
          retryOnFailure: true,
          timeout: 10
        },
        {
          id: 'update_crm_record',
          type: 'send_notification',
          parameters: {
            message: 'USDOT application submitted successfully',
            recipients: ['admin', 'client'],
            includeUSDOTNumber: true,
            updateCRM: true
          },
          retryOnFailure: true
        },
        {
          id: 'log_completion',
          type: 'send_notification',
          parameters: {
            message: 'USDOT RPA workflow completed successfully',
            recipients: ['admin'],
            logLevel: 'success'
          },
          retryOnFailure: false
        }
      ]
    }
  ],
  triggers: [
    {
      id: 'deal_created_trigger',
      type: 'deal_created',
      agentId: 'usdot_rpa_agent_001',
      conditions: [
        {
          field: 'deal.serviceType',
          operator: 'equals',
          value: 'usdot_registration'
        },
        {
          field: 'deal.status',
          operator: 'equals',
          value: 'approved'
        }
      ]
    }
  ]
};

export const USDOT_RPA_CONFIGURATION = {
  browserSettings: {
    headless: false, // Keep visible for human checkpoints
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    viewport: {
      width: 1920,
      height: 1080
    },
    timeout: 30000 // 30 seconds
  },
  credentials: {
    loginGov: {
      username: usdotCredentialService.getCredentials()?.loginGov.username || '',
      password: usdotCredentialService.getCredentials()?.loginGov.password || '',
      mfaEnabled: true
    }
  },
  notifications: {
    email: ['admin@rapidcrm.com'],
    slack: ['#rpa-notifications'],
    sms: ['+1234567890']
  },
  security: {
    requireApproval: true,
    maxRetries: 3,
    auditLog: true
  }
};
