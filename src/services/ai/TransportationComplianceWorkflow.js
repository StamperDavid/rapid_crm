/**
 * Transportation Compliance Agency Workflow
 * This document provides the AI agent with a comprehensive understanding
 * of the business model and workflow for the transportation compliance agency.
 */

const TRANSPORTATION_COMPLIANCE_WORKFLOW = {
  businessModel: {
    type: "Transportation Compliance Agency",
    primaryService: "USDOT Number Applications and Regulatory Compliance",
    targetClients: "Transportation companies requiring federal compliance",
    valueProposition: "Automated, efficient processing of complex regulatory applications with human oversight"
  },

  coreWorkflow: {
    name: "USDOT Application Process",
    estimatedDuration: "45 minutes",
    totalSteps: 9,
    
    steps: [
      {
        step: 1,
        name: "Initialize Application",
        type: "automated",
        description: "Prepare application data and validate requirements",
        keyActions: [
          "Validate company information completeness",
          "Apply USDOT requirements validation rules",
          "Create application session",
          "Notify admin of process start"
        ],
        requiredData: ["companyInfo", "contactInfo", "businessDetails"],
        timeout: "5 minutes"
      },
      
      {
        step: 2,
        name: "Login.gov Authentication",
        type: "human_checkpoint",
        description: "Employee must authenticate with federal Login.gov system",
        keyActions: [
          "Navigate to https://secure.login.gov/",
          "Employee completes authentication process",
          "System waits for human confirmation"
        ],
        humanRole: "employee",
        timeout: "15 minutes",
        critical: true
      },
      
      {
        step: 3,
        name: "Access USDOT Portal",
        type: "automated",
        description: "Navigate to FMCSA USDOT application portal",
        keyActions: [
          "Navigate to https://ai.fmcsa.dot.gov/",
          "Start new application process",
          "Wait for portal elements to load"
        ],
        timeout: "10 minutes"
      },
      
      {
        step: 4,
        name: "Fill Company Information",
        type: "automated",
        description: "Populate company information from CRM data",
        keyActions: [
          "Fill legal business name",
          "Fill DBA name (if applicable)",
          "Fill EIN (Employer Identification Number)",
          "Fill complete address information",
          "Fill contact information"
        ],
        dataSource: "CRM system",
        timeout: "5 minutes per field"
      },
      
      {
        step: 5,
        name: "Upload Required Documents",
        type: "document_upload",
        description: "Upload company documents and certificates",
        keyActions: [
          "Upload insurance certificate",
          "Upload business license",
          "Validate document formats",
          "Confirm successful uploads"
        ],
        requiredDocuments: ["insurance_certificate", "business_license"],
        timeout: "30 minutes per document"
      },
      
      {
        step: 6,
        name: "QR Code Client Handoff",
        type: "client_handoff",
        description: "Client completes QR code verification process",
        keyActions: [
          "Generate QR code for client verification",
          "Notify client via email/portal",
          "Client scans QR code and completes verification",
          "System waits for client completion"
        ],
        humanRole: "client",
        timeout: "60 minutes",
        critical: true
      },
      
      {
        step: 7,
        name: "Payment Verification",
        type: "payment_verification",
        description: "Admin verifies payment has been received",
        keyActions: [
          "Check payment status in system",
          "Admin verifies payment received",
          "Confirm payment amount and method",
          "System waits for admin confirmation"
        ],
        humanRole: "admin",
        timeout: "30 minutes",
        critical: true
      },
      
      {
        step: 8,
        name: "Submit Application",
        type: "automated",
        description: "Submit completed USDOT application to FMCSA",
        keyActions: [
          "Review application completeness",
          "Submit application to federal system",
          "Confirm submission success",
          "Extract USDOT number if provided"
        ],
        timeout: "15 minutes"
      },
      
      {
        step: 9,
        name: "Application Complete",
        type: "automated",
        description: "Process completion and notification",
        keyActions: [
          "Extract USDOT number from response",
          "Update CRM record with new USDOT number",
          "Notify admin and client of success",
          "Log completion for audit trail"
        ],
        timeout: "10 minutes"
      }
    ]
  },

  businessCharacteristics: {
    automationLevel: "High with Strategic Human Oversight",
    humanCheckpoints: [
      {
        type: "employee",
        purpose: "Federal authentication and security",
        steps: [2]
      },
      {
        type: "client", 
        purpose: "Identity verification and compliance",
        steps: [6]
      },
      {
        type: "admin",
        purpose: "Payment verification and final approval",
        steps: [7]
      }
    ],
    
    complianceRequirements: [
      "Federal USDOT regulations",
      "FMCSA requirements",
      "Document authenticity verification",
      "Payment processing compliance",
      "Audit trail maintenance"
    ],
    
    clientExperience: {
      touchpoints: [
        "Initial service request",
        "Document submission",
        "QR code verification",
        "Payment processing",
        "USDOT number delivery"
      ],
      communicationChannels: ["Email", "Portal", "SMS notifications"],
      expectedTimeline: "Same day to 24 hours"
    }
  },

  trainingEnvironmentRequirements: {
    agentKnowledgeNeeds: [
      "USDOT application requirements",
      "FMCSA regulatory standards", 
      "Document validation processes",
      "Payment verification procedures",
      "Client communication protocols",
      "Error handling and retry logic"
    ],
    
    criticalSkills: [
      "Accurate data entry and validation",
      "Clear client communication",
      "Timeout and error management",
      "Document processing",
      "Multi-step workflow coordination",
      "Human checkpoint management"
    ],
    
    performanceMetrics: [
      "Application completion rate",
      "Client satisfaction scores",
      "Processing time efficiency",
      "Error rate and resolution",
      "Document upload success rate",
      "Payment verification accuracy"
    ]
  },

  technologyIntegration: {
    systems: [
      "CRM (Customer data management)",
      "Payment Gateway (Stripe integration)",
      "Document Storage (Secure file management)",
      "Notification System (Email/SMS/Portal)",
      "Federal APIs (FMCSA, Login.gov)",
      "QR Code Generation System"
    ],
    
    dataFlow: [
      "Client request → CRM data collection",
      "CRM → Automated form population", 
      "Client → Document upload",
      "System → QR code generation",
      "Client → QR verification",
      "Payment → Admin verification",
      "System → Federal submission",
      "Response → CRM update"
    ]
  },

  successFactors: {
    accuracy: "Zero tolerance for data entry errors",
    timeliness: "Meet federal processing deadlines",
    clientExperience: "Smooth, clear communication throughout",
    compliance: "100% adherence to regulatory requirements",
    security: "Secure handling of sensitive business information",
    efficiency: "Minimize manual intervention while maintaining quality"
  }
};

module.exports = {
  TRANSPORTATION_COMPLIANCE_WORKFLOW
};



