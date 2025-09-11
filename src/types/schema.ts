// Transportation/Logistics CRM Schema Types

export interface Person {
  id: string;
  companyId: string; // Link to the company this contact belongs to
  
  // Contact Details (Required)
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  preferredContactMethod: 'Phone' | 'Email' | 'Text';
  
  // Role & Position
  isPrimaryContact: boolean; // Only one primary contact per company
  position?: string; // Job title/position
  department?: string;
  
  // Company Owner Details (Conditional)
  isCompanyOwner?: boolean;
  companyOwnerFirstName?: string;
  companyOwnerLastName?: string;
  companyOwnerPhone?: string;
  companyOwnerEmail?: string;
  
  // System Fields
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  
  // Physical Address (Required)
  physicalStreetAddress: string;
  physicalSuiteApt?: string;
  physicalCity: string;
  physicalState: string;
  physicalCountry: string;
  physicalZip: string;
  
  // Mailing Address (Conditional)
  isMailingAddressSame: 'Yes' | 'No';
  mailingStreetAddress?: string;
  mailingSuiteApt?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingZip?: string;
  mailingCountry?: string;
  
  // Business Information (Required/Important)
  businessType: 'LLC' | 'Corporation' | 'Partnership' | 'Sole Proprietorship' | 'Other';
  businessStarted?: string; // Date
  desiredBusinessName?: string;
  legalBusinessName: string;
  hasDBA: 'Yes' | 'No';
  dbaName?: string;
  ein: string; // Federal Tax ID
  entityTypes: string[]; // Multiple select
  
  // Transportation & Operations (Required)
  businessClassification: 'Carrier' | 'Broker' | 'Freight Forwarder';
  transportationOperationType: 'Long-Haul' | 'Short-Haul' | 'Local Delivery' | 'Specialized Transport' | 'Other';
  carriesPassengers: 'Yes' | 'No';
  transportsGoodsForHire: 'Yes' | 'No';
  engagedInInterstateCommerce: 'Yes' | 'No';
  interstateIntrastate: 'Interstate' | 'Intrastate';
  statesOfOperation: string[]; // Multiple select
  operationClass: string; // DOT operation classification
  hasUSDOTNumber: 'Yes' | 'No';
  usdotNumber?: string;
  
  // Fleet Information (Required)
  vehicleFleetType: 'Owned' | 'Leased' | 'Mixed';
  vehicleTypesUsed: string[]; // Multiple select
  numberOfDrivers: number;
  driverList?: string; // Large text
  numberOfVehicles: number;
  vehicleList?: string; // Large text
  gvwr: string; // Gross Vehicle Weight Rating
  yearMakeModel?: string;
  
  // Cargo & Safety (Required)
  cargoTypesTransported: 'Hazardous Materials' | 'Household Goods' | 'General Freight' | 'Gases & Liquids' | 'Automobiles' | 'Other';
  hazmatPlacardRequired: 'Yes' | 'No';
  phmsaWork?: 'Yes' | 'No';
  
  // Regulatory Compliance (Important)
  additionalRegulatoryDetails: string[]; // Multiple select
  
  // Financial Information (Important)
  hasDunsBradstreetNumber: 'Yes' | 'No';
  dunsBradstreetNumber?: string;
  
  // System Fields
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'Registration' | 'Compliance' | 'Training' | 'Support';
  basePrice: number;
  estimatedDuration: string; // e.g., "1-2 business days", "2-4 weeks"
  requirements: string[]; // What client needs to provide
  deliverables: string[]; // What we provide
  isActive: boolean;
  
  // System Fields
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  
  // Service Information
  serviceId: string; // Link to the service being sold
  serviceName: string; // Cached service name for performance
  customPrice?: number; // Override base service price if needed
  
  // System Info
  software?: string; // Source tracking (JotForm)
  
  // Relationships
  contactId?: string;
  companyId?: string;
  
  // System Fields
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  companyId: string; // Link to the company that owns this vehicle
  
  // Vehicle Identification
  vin: string; // Vehicle Identification Number
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  
  // Vehicle Specifications
  vehicleType: 'Truck' | 'Trailer' | 'Bus' | 'Van' | 'Other';
  gvwr: string; // Gross Vehicle Weight Rating
  emptyWeight?: string;
  fuelType: 'Diesel' | 'Gasoline' | 'Electric' | 'Hybrid' | 'Other';
  
  // Registration & Insurance
  registrationNumber?: string;
  registrationExpiry?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiry?: string;
  
  // Maintenance & Compliance
  lastInspectionDate?: string;
  nextInspectionDue?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDue?: string;
  hasHazmatEndorsement: 'Yes' | 'No';
  
  // Status
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Retired';
  currentDriverId?: string; // Link to current driver
  
  // System Fields
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  companyId: string; // Link to the company that employs this driver
  
  // Driver Name
  driverName: string; // Single line text
  
  // Application & Documentation
  applicationForEmployment?: string; // Attachment
  backgroundChecks?: string; // Files
  certificateOfReceiptForCompanyTestingPolicy?: string; // Files
  certificateOfReceiptForCompanyWorkPolicy?: string; // Files
  commercialDriversLicenseInformationSystemReports?: string; // Attachment
  copyOfDriversLicense?: string; // Files
  medicalCertificateCopy?: string; // Attachment
  
  // Disciplinary & Safety Records
  disciplinaryAction?: string; // Long Text
  goodFaithEffortInquiryIntoDrivingRecord?: string; // Long Text
  goodFaithEffortSafetyPerformanceHistoryInvestigation?: string; // Single Line Text
  inquiryIntoDrivingRecord?: string; // Single Line Text
  inquiryToPreviousEmployers?: string; // Single Line Text
  medicalExaminerNationalRegistryVerification?: string; // Single Line Text
  motorVehicleReports?: string; // Single Line Text
  
  // Employment Documentation
  driverEmploymentApplication?: string; // Attachment/Files
  driversRoadTest?: string; // Attachment
  certificationOfRoadTest?: string; // Single Line Text
  annualDriversCertificateOfViolations?: string; // Single Line Text
  annualReviewOfDrivingRecord?: string; // Single Line Text
  checklistForMultipleEmployers?: string; // Single Line Text
  
  // Legacy fields (keeping for backward compatibility)
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  ssn?: string; // Social Security Number (encrypted)
  phone?: string;
  email?: string;
  address?: string;
  licenseNumber?: string;
  licenseState?: string;
  licenseClass?: 'A' | 'B' | 'C' | 'Other';
  licenseExpiry?: string;
  hasHazmatEndorsement?: 'Yes' | 'No';
  hasPassengerEndorsement?: 'Yes' | 'No';
  hasSchoolBusEndorsement?: 'Yes' | 'No';
  hireDate?: string;
  employmentStatus?: 'Active' | 'Inactive' | 'Terminated' | 'On Leave';
  position?: 'Driver' | 'Owner-Operator' | 'Team Driver' | 'Other';
  payType?: 'Hourly' | 'Mileage' | 'Percentage' | 'Salary';
  medicalCardNumber?: string;
  medicalCardExpiry?: string;
  drugTestDate?: string;
  nextDrugTestDue?: string;
  backgroundCheckDate?: string;
  nextBackgroundCheckDue?: string;
  totalMilesDriven?: number;
  accidentsInLast3Years?: number;
  violationsInLast3Years?: number;
  safetyRating?: 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement';
  
  // System Fields
  createdAt: string;
  updatedAt: string;
}

// Field Groups for UI Organization
export interface FieldGroup {
  name: string;
  fields: string[];
  description?: string;
}

export const PERSON_FIELD_GROUPS: FieldGroup[] = [
  {
    name: 'Contact Details',
    fields: ['firstName', 'lastName', 'phone', 'email', 'preferredContactMethod'],
    description: 'Primary contact information'
  },
  {
    name: 'Ownership Details',
    fields: ['isCompanyOwner', 'companyOwnerFirstName', 'companyOwnerLastName', 'companyOwnerPhone', 'companyOwnerEmail'],
    description: 'Company ownership information (if different from primary contact)'
  }
];

export const DRIVER_FIELD_GROUPS: FieldGroup[] = [
  {
    name: 'Driver Information',
    fields: ['driverName'],
    description: 'Basic driver identification'
  },
  {
    name: 'Application & Documentation',
    fields: ['applicationForEmployment', 'backgroundChecks', 'certificateOfReceiptForCompanyTestingPolicy', 'certificateOfReceiptForCompanyWorkPolicy', 'commercialDriversLicenseInformationSystemReports', 'copyOfDriversLicense', 'medicalCertificateCopy'],
    description: 'Required application forms and documentation'
  },
  {
    name: 'Disciplinary & Safety Records',
    fields: ['disciplinaryAction', 'goodFaithEffortInquiryIntoDrivingRecord', 'goodFaithEffortSafetyPerformanceHistoryInvestigation', 'inquiryIntoDrivingRecord', 'inquiryToPreviousEmployers', 'medicalExaminerNationalRegistryVerification', 'motorVehicleReports'],
    description: 'Safety performance and disciplinary records'
  },
  {
    name: 'Employment Documentation',
    fields: ['driverEmploymentApplication', 'driversRoadTest', 'certificationOfRoadTest', 'annualDriversCertificateOfViolations', 'annualReviewOfDrivingRecord', 'checklistForMultipleEmployers'],
    description: 'Employment-related documentation and certifications'
  }
];

export const ORGANIZATION_FIELD_GROUPS: FieldGroup[] = [
  {
    name: 'Physical Address',
    fields: ['physicalStreetAddress', 'physicalSuiteApt', 'physicalCity', 'physicalState', 'physicalCountry', 'physicalZip'],
    description: 'Main business address'
  },
  {
    name: 'Mailing Address',
    fields: ['isMailingAddressSame', 'mailingStreetAddress', 'mailingSuiteApt', 'mailingCity', 'mailingState', 'mailingZip', 'mailingCountry'],
    description: 'Mailing address (if different from physical)'
  },
  {
    name: 'Business Details',
    fields: ['businessType', 'businessStarted', 'desiredBusinessName', 'legalBusinessName', 'hasDBA', 'dbaName', 'ein', 'entityTypes'],
    description: 'Legal business information'
  },
  {
    name: 'Transportation Details',
    fields: ['businessClassification', 'transportationOperationType', 'carriesPassengers', 'transportsGoodsForHire', 'engagedInInterstateCommerce', 'interstateIntrastate', 'statesOfOperation', 'operationClass', 'hasUSDOTNumber', 'usdotNumber'],
    description: 'Transportation and operations information'
  },
  {
    name: 'Fleet Details',
    fields: ['vehicleFleetType', 'vehicleTypesUsed', 'numberOfDrivers', 'driverList', 'numberOfVehicles', 'vehicleList', 'gvwr', 'yearMakeModel'],
    description: 'Vehicle fleet information'
  },
  {
    name: 'Cargo & Safety',
    fields: ['cargoTypesTransported', 'hazmatPlacardRequired', 'phmsaWork'],
    description: 'Cargo types and safety requirements'
  },
  {
    name: 'Regulatory Compliance',
    fields: ['additionalRegulatoryDetails'],
    description: 'Additional regulatory compliance requirements'
  },
  {
    name: 'Financial Details',
    fields: ['hasDunsBradstreetNumber', 'dunsBradstreetNumber'],
    description: 'Financial and credit information'
  }
];

// Validation Rules
export interface ValidationRule {
  field: string;
  required: boolean;
  conditional?: {
    field: string;
    value: any;
  };
  type?: 'email' | 'phone' | 'number' | 'date';
  minLength?: number;
  maxLength?: number;
}

export const PERSON_VALIDATION_RULES: ValidationRule[] = [
  { field: 'firstName', required: true, minLength: 1 },
  { field: 'lastName', required: true, minLength: 1 },
  { field: 'phone', required: true, type: 'phone' },
  { field: 'email', required: true, type: 'email' },
  { field: 'preferredContactMethod', required: true },
  { field: 'companyOwnerFirstName', required: false, conditional: { field: 'isCompanyOwner', value: false } },
  { field: 'companyOwnerLastName', required: false, conditional: { field: 'isCompanyOwner', value: false } },
  { field: 'companyOwnerPhone', required: false, conditional: { field: 'isCompanyOwner', value: false }, type: 'phone' },
  { field: 'companyOwnerEmail', required: false, conditional: { field: 'isCompanyOwner', value: false }, type: 'email' }
];

export const ORGANIZATION_VALIDATION_RULES: ValidationRule[] = [
  // Physical Address (Required)
  { field: 'physicalStreetAddress', required: true, minLength: 1 },
  { field: 'physicalCity', required: true, minLength: 1 },
  { field: 'physicalState', required: true },
  { field: 'physicalCountry', required: true },
  { field: 'physicalZip', required: true, minLength: 5 },
  
  // Mailing Address (Conditional)
  { field: 'mailingStreetAddress', required: false, conditional: { field: 'isMailingAddressSame', value: 'No' } },
  { field: 'mailingCity', required: false, conditional: { field: 'isMailingAddressSame', value: 'No' } },
  { field: 'mailingState', required: false, conditional: { field: 'isMailingAddressSame', value: 'No' } },
  { field: 'mailingZip', required: false, conditional: { field: 'isMailingAddressSame', value: 'No' } },
  { field: 'mailingCountry', required: false, conditional: { field: 'isMailingAddressSame', value: 'No' } },
  
  // Business Information
  { field: 'businessType', required: true },
  { field: 'legalBusinessName', required: true, minLength: 1 },
  { field: 'hasDBA', required: true },
  { field: 'dbaName', required: false, conditional: { field: 'hasDBA', value: 'Yes' } },
  { field: 'ein', required: true, minLength: 9 },
  { field: 'entityTypes', required: true },
  
  // Transportation & Operations
  { field: 'businessClassification', required: true },
  { field: 'transportationOperationType', required: true },
  { field: 'carriesPassengers', required: true },
  { field: 'transportsGoodsForHire', required: true },
  { field: 'engagedInInterstateCommerce', required: true },
  { field: 'interstateIntrastate', required: true },
  { field: 'statesOfOperation', required: true },
  { field: 'operationClass', required: true },
  { field: 'hasUSDOTNumber', required: true },
  { field: 'usdotNumber', required: false, conditional: { field: 'hasUSDOTNumber', value: 'Yes' } },
  
  // Fleet Information
  { field: 'vehicleFleetType', required: true },
  { field: 'vehicleTypesUsed', required: true },
  { field: 'numberOfDrivers', required: true, type: 'number' },
  { field: 'numberOfVehicles', required: true, type: 'number' },
  { field: 'gvwr', required: true },
  
  // Cargo & Safety
  { field: 'cargoTypesTransported', required: true },
  { field: 'hazmatPlacardRequired', required: true },
  
  // Financial Information
  { field: 'hasDunsBradstreetNumber', required: true },
  { field: 'dunsBradstreetNumber', required: false, conditional: { field: 'hasDunsBradstreetNumber', value: 'Yes' } }
];

export const DRIVER_VALIDATION_RULES: ValidationRule[] = [
  // Driver Information (Required)
  { field: 'driverName', required: true, minLength: 1 },
  
  // Application & Documentation (Optional but recommended)
  { field: 'applicationForEmployment', required: false },
  { field: 'backgroundChecks', required: false },
  { field: 'certificateOfReceiptForCompanyTestingPolicy', required: false },
  { field: 'certificateOfReceiptForCompanyWorkPolicy', required: false },
  { field: 'commercialDriversLicenseInformationSystemReports', required: false },
  { field: 'copyOfDriversLicense', required: false },
  { field: 'medicalCertificateCopy', required: false },
  
  // Disciplinary & Safety Records (Optional)
  { field: 'disciplinaryAction', required: false },
  { field: 'goodFaithEffortInquiryIntoDrivingRecord', required: false },
  { field: 'goodFaithEffortSafetyPerformanceHistoryInvestigation', required: false },
  { field: 'inquiryIntoDrivingRecord', required: false },
  { field: 'inquiryToPreviousEmployers', required: false },
  { field: 'medicalExaminerNationalRegistryVerification', required: false },
  { field: 'motorVehicleReports', required: false },
  
  // Employment Documentation (Optional)
  { field: 'driverEmploymentApplication', required: false },
  { field: 'driversRoadTest', required: false },
  { field: 'certificationOfRoadTest', required: false },
  { field: 'annualDriversCertificateOfViolations', required: false },
  { field: 'annualReviewOfDrivingRecord', required: false },
  { field: 'checklistForMultipleEmployers', required: false }
];

// Select Options
export const SELECT_OPTIONS = {
  preferredContactMethod: ['Phone', 'Email', 'Text'],
  businessType: ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship', 'Other'],
  hasDBA: ['Yes', 'No'],
  businessClassification: ['Carrier', 'Broker', 'Freight Forwarder'],
  transportationOperationType: ['Long-Haul', 'Short-Haul', 'Local Delivery', 'Specialized Transport', 'Other'],
  yesNo: ['Yes', 'No'],
  interstateIntrastate: ['Interstate', 'Intrastate'],
  vehicleFleetType: ['Owned', 'Leased', 'Mixed'],
  vehicleTypesUsed: ['Trucks', 'Trailers', 'Buses', 'Other'],
  cargoTypesTransported: ['Hazardous Materials', 'Household Goods', 'General Freight', 'Gases & Liquids', 'Automobiles', 'Other'],
  additionalRegulatoryDetails: [
    'Vehicle Safety Standards',
    'Driver Qualification Files',
    'Hours of Service Compliance',
    'Vehicle Maintenance Records',
    'Drug and Alcohol Testing Program',
    'Other'
  ],
  states: [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ],
  countries: ['United States', 'Canada', 'Mexico'],
  
  // Vehicle Options
  vehicleType: ['Truck', 'Trailer', 'Bus', 'Van', 'Other'],
  fuelType: ['Diesel', 'Gasoline', 'Electric', 'Hybrid', 'Other'],
  vehicleStatus: ['Active', 'Inactive', 'Maintenance', 'Retired'],
  
  // Driver Options
  licenseClass: ['A', 'B', 'C', 'Other'],
  employmentStatus: ['Active', 'Inactive', 'Terminated', 'On Leave'],
  position: ['Driver', 'Owner-Operator', 'Team Driver', 'Other'],
  payType: ['Hourly', 'Mileage', 'Percentage', 'Salary'],
  safetyRating: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement']
};

// AI Agent Types
export interface Agent {
  id: string;
  name: string;
  type: 'onboarding' | 'customer_service' | 'sales' | 'support' | 'custom';
  description: string;
  status: 'active' | 'inactive' | 'training' | 'error';
  capabilities: string[];
  knowledgeBases: string[];
  rules: string[];
  configuration: AgentConfiguration;
  metrics: {
    totalInteractions: number;
    successRate: number;
    averageResponseTime: number;
    userSatisfaction: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfiguration {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  responseFormat: 'conversational' | 'structured' | 'action' | 'persuasive';
  fallbackBehavior: 'escalate_to_human' | 'retry_with_backoff' | 'schedule_callback';
}

export interface KnowledgeBase {
  id: string;
  name: string;
  type: 'regulatory' | 'proprietary' | 'public';
  description: string;
  source: 'api' | 'upload' | 'scrape';
  status: 'active' | 'inactive' | 'processing';
  size: string;
  lastUpdated: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: string[];
  actions: string[];
  supersedes: string[];
  supersededBy: string[];
  category: string;
}

export interface AgentResponse {
  id: string;
  agentId: string;
  message: string;
  confidence: number;
  sources: string[];
  timestamp: string;
  metadata: {
    processingTime: number;
    tokensUsed: number;
    model: string;
    temperature: number;
  };
}

export interface AgentContext {
  userId?: string;
  companyId?: string;
  sessionId?: string;
  conversationHistory?: any[];
  userPreferences?: Record<string, any>;
  currentTask?: string;
  environment?: 'development' | 'staging' | 'production';
  knowledgeContext?: any;
  agentCapabilities?: string[];
  agentRules?: string[];
}

export interface AgentAnalytics {
  agentId: string;
  totalInteractions: number;
  averageSatisfaction: number;
  averageResponseTime: number;
  successRate: number;
  topQueries: Array<{
    query: string;
    count: number;
  }>;
  userFeedback: Array<{
    rating: number;
    comment: string;
    timestamp: string;
  }>;
  performanceTrends: Array<{
    date: string;
    interactions: number;
    satisfaction: number;
    responseTime: number;
  }>;
}

// API Key Types - Secure API key management
export interface ApiKey {
  id: string;
  name: string;
  platform: 'google' | 'openai' | 'anthropic' | 'kixie' | 'stripe' | 'quickbooks' | 'custom';
  key: string;
  description?: string;
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  environment: 'development' | 'staging' | 'production';
  permissions: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  usageCount: number;
  // Encrypted fields for secure storage
  encryptedKey?: string;
  iv?: string;
  salt?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: 'Email' | 'Social Media' | 'Google Ads' | 'Facebook Ads' | 'LinkedIn' | 'Trade Show' | 'Referral Program' | 'Cold Outreach' | 'Website' | 'Other';
  status: 'Active' | 'Paused' | 'Completed' | 'Draft';
  startDate: string;
  endDate?: string;
  budget?: number;
  targetAudience?: string;
  goals?: string[];
  metrics: {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    costPerLead: number;
    roi: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  
  // Campaign & Source Tracking
  campaignId?: string; // Link to campaign
  leadSource: 'Website' | 'Referral' | 'Cold Call' | 'Trade Show' | 'Social Media' | 'Email Campaign' | 'Google Ads' | 'Facebook Ads' | 'LinkedIn' | 'Other';
  leadStatus: 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Converted' | 'Lost';
  leadScore: number; // 0-100
  
  // Transportation-Specific Fields
  businessType?: 'Carrier' | 'Broker' | 'Freight Forwarder' | 'Shipper' | 'Owner Operator' | 'Other';
  fleetSize?: number; // Changed to number for scoring
  operatingStates?: string[];
  cargoTypes?: string[];
  hasUSDOT?: boolean;
  usdotNumber?: string;
  
  // Lead Qualification
  budget?: number; // Annual budget in dollars for scoring
  timeline?: string; // Free text for timeline scoring
  decisionMaker?: boolean;
  painPoints?: string[];
  interests?: string[];
  
  // Communication
  preferredContactMethod: 'Phone' | 'Email' | 'Text' | 'LinkedIn';
  lastContactDate?: string;
  nextFollowUpDate?: string;
  notes?: string;
  
  // Conversion Tracking
  convertedToContact?: boolean;
  convertedToDeal?: boolean;
  conversionDate?: string;
  conversionValue?: number;
  convertedContactId?: string; // Link to the contact this lead converted to
  convertedDealId?: string; // Link to the deal this lead converted to
  
  // Company Relationship
  companyId?: string; // Link to existing company if lead is from existing company
  
  // Assignment
  assignedTo?: string; // User ID
  assignedDate?: string;
  
  // System Fields
  createdAt: string;
  updatedAt: string;
}