export interface RPAAgent {
  id: string;
  name: string;
  type: 'usdot_application' | 'mc_authority' | 'ifta_registration' | 'eld_compliance' | 'hazmat_permit';
  status: 'idle' | 'running' | 'paused' | 'waiting_for_human' | 'completed' | 'failed';
  currentStep: number;
  totalSteps: number;
  workflow: RPAWorkflow;
  checkpoints: HumanCheckpoint[];
  data: Record<string, any>;
  logs: RPALogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface RPAWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  requiredPermissions: string[];
  estimatedDuration: number; // in minutes
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'automated' | 'human_checkpoint' | 'document_upload' | 'payment_verification' | 'client_handoff';
  order: number;
  required: boolean;
  timeout?: number; // in minutes
  retryCount?: number;
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
  checkpoints?: HumanCheckpoint[];
}

export interface HumanCheckpoint {
  id: string;
  name: string;
  description: string;
  type: 'employee_verification' | 'client_approval' | 'payment_verification' | 'document_review';
  requiredRole: 'admin' | 'employee' | 'client';
  assignee?: string;
  status: 'pending' | 'approved' | 'rejected' | 'timeout';
  data: Record<string, any>;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface WorkflowTrigger {
  id: string;
  type: 'deal_created' | 'deal_updated' | 'manual' | 'scheduled';
  conditions: WorkflowCondition[];
  agentId: string;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface WorkflowAction {
  id: string;
  type: 'navigate_url' | 'fill_form' | 'upload_document' | 'click_element' | 'wait' | 'verify_data' | 'send_notification';
  parameters: Record<string, any>;
  retryOnFailure: boolean;
  timeout?: number;
}

export interface RPALogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  stepId?: string;
  actionId?: string;
  data?: Record<string, any>;
}

export interface USDOTApplicationData {
  companyInfo: {
    legalName: string;
    dbaName?: string;
    ein: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    phone: string;
    email: string;
  };
  contactInfo: {
    name: string;
    title: string;
    phone: string;
    email: string;
  };
  businessDetails: {
    type: string;
    description: string;
    mcNumber?: string;
    dunsNumber?: string;
  };
  operations: {
    interstate: boolean;
    intrastate: boolean;
    hazardousMaterials: boolean;
    passengers: boolean;
  };
  vehicles: Array<{
    vin: string;
    year: number;
    make: string;
    model: string;
    gvwr: number;
  }>;
  documents: Array<{
    type: string;
    name: string;
    path: string;
    uploaded: boolean;
  }>;
}

export interface RPAConfiguration {
  browserSettings: {
    headless: boolean;
    userAgent: string;
    viewport: {
      width: number;
      height: number;
    };
    timeout: number;
  };
  credentials: {
    loginGov: {
      username: string;
      password: string;
      mfaEnabled: boolean;
    };
  };
  notifications: {
    email: string[];
    slack: string[];
    sms: string[];
  };
  security: {
    requireApproval: boolean;
    maxRetries: number;
    auditLog: boolean;
  };
}
