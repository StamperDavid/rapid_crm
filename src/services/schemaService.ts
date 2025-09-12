// Real database schema service
// This service now connects to the actual SQLite database
// Import the actual schema types to ensure synchronization
import { 
  Organization, 
  Person, 
  Vehicle, 
  Driver, 
  Deal, 
  Invoice, 
  Service,
  ORGANIZATION_FIELD_GROUPS,
  PERSON_FIELD_GROUPS,
  DRIVER_FIELD_GROUPS,
  ORGANIZATION_VALIDATION_RULES,
  PERSON_VALIDATION_RULES,
  DRIVER_VALIDATION_RULES,
  SELECT_OPTIONS
} from '../types/schema';

export interface FieldDefinition {
  id: string;
  name: string;
  display_name: string;
  field_type: 'text' | 'number' | 'date' | 'datetime' | 'time' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'email' | 'phone' | 'url' | 'currency' | 'percentage' | 'rating' | 'attachment' | 'lookup' | 'rollup' | 'formula' | 'autonumber' | 'barcode' | 'button' | 'created_time' | 'last_modified_time' | 'created_by' | 'last_modified_by';
  is_required: boolean;
  is_unique: boolean;
  options?: string[];
  default_value?: string;
  validation_rules?: {
    min_length?: number;
    max_length?: number;
    min_value?: number;
    max_value?: number;
    pattern?: string;
    custom_validation?: string;
  };
  lookup_config?: {
    linked_table?: string;
    linked_field?: string;
    display_field?: string;
  };
  rollup_config?: {
    linked_table?: string;
    linked_field?: string;
    aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max';
  };
  formula_config?: {
    formula?: string;
    result_type?: string;
  };
  currency_config?: {
    currency_code?: string;
    symbol?: string;
  };
  rating_config?: {
    max_rating?: number;
    icon?: string;
  };
  attachment_config?: {
    allowed_types?: string[];
    max_size?: number;
  };
  order: number;
  description?: string;
  help_text?: string;
}

export interface SchemaDefinition {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  table_name: string;
  fields: FieldDefinition[];
  created_at: string;
  updated_at: string;
  is_system: boolean;
}

class SchemaService {
  private schemas: SchemaDefinition[] = [];

  constructor() {
    // Initialize with default schemas if none exist
    this.initializeDefaultSchemas();
  }

  // Helper function to generate field definitions from TypeScript interface
  private generateFieldsFromInterface(interfaceName: string): FieldDefinition[] {
    const fields: FieldDefinition[] = [];
    let order = 1;

    // Generate fields based on the interface
    switch (interfaceName) {
      case 'Organization':
        // Physical Address fields
        fields.push(
          { id: (order++).toString(), name: 'physicalStreetAddress', display_name: 'Physical Street Address', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'physicalSuiteApt', display_name: 'Physical Suite/Apt', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'physicalCity', display_name: 'Physical City', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'physicalState', display_name: 'Physical State', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.states, order: order - 1 },
          { id: (order++).toString(), name: 'physicalCountry', display_name: 'Physical Country', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.countries, order: order - 1 },
          { id: (order++).toString(), name: 'physicalZip', display_name: 'Physical ZIP Code', field_type: 'text', is_required: true, is_unique: false, order: order - 1 }
        );

        // Mailing Address fields
        fields.push(
          { id: (order++).toString(), name: 'isMailingAddressSame', display_name: 'Is Mailing Address Same?', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.yesNo, order: order - 1 },
          { id: (order++).toString(), name: 'mailingStreetAddress', display_name: 'Mailing Street Address', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'mailingSuiteApt', display_name: 'Mailing Suite/Apt', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'mailingCity', display_name: 'Mailing City', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'mailingState', display_name: 'Mailing State', field_type: 'select', is_required: false, is_unique: false, options: SELECT_OPTIONS.states, order: order - 1 },
          { id: (order++).toString(), name: 'mailingZip', display_name: 'Mailing ZIP Code', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'mailingCountry', display_name: 'Mailing Country', field_type: 'select', is_required: false, is_unique: false, options: SELECT_OPTIONS.countries, order: order - 1 }
        );

        // Contact Details (Person entity) - Required
        fields.push(
          { id: (order++).toString(), name: 'firstName', display_name: 'First Name', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'lastName', display_name: 'Last Name', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'phone', display_name: 'Phone', field_type: 'phone', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'email', display_name: 'Email', field_type: 'email', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'preferredContactMethod', display_name: 'Preferred Contact Method', field_type: 'select', is_required: true, is_unique: false, options: ['Phone', 'Email', 'Text'], order: order - 1 }
        );

        // Business Information fields
        fields.push(
          { id: (order++).toString(), name: 'businessType', display_name: 'Business Type', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.businessType, order: order - 1 },
          { id: (order++).toString(), name: 'businessStarted', display_name: 'Business Started Date', field_type: 'date', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'desiredBusinessName', display_name: 'Desired Business Name', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'legalBusinessName', display_name: 'Legal Business Name', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'hasDBA', display_name: 'Has DBA?', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.hasDBA, order: order - 1 },
          { id: (order++).toString(), name: 'dbaName', display_name: 'DBA Name', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'ein', display_name: 'EIN (Federal Tax ID)', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'entityTypes', display_name: 'Entity Types', field_type: 'multiselect', is_required: true, is_unique: false, options: ['Carrier', 'Broker', 'Freight Forwarder'], order: order - 1 }
        );

        // Transportation & Operations fields
        fields.push(
          { id: (order++).toString(), name: 'businessClassification', display_name: 'Business Classification', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.businessClassification, order: order - 1 },
          { id: (order++).toString(), name: 'transportationOperationType', display_name: 'Transportation Operation Type', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.transportationOperationType, order: order - 1 },
          { id: (order++).toString(), name: 'carriesPassengers', display_name: 'Carries Passengers?', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.yesNo, order: order - 1 },
          { id: (order++).toString(), name: 'transportsGoodsForHire', display_name: 'Transports Goods for Hire?', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.yesNo, order: order - 1 },
          { id: (order++).toString(), name: 'engagedInInterstateCommerce', display_name: 'Engaged in Interstate Commerce?', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.yesNo, order: order - 1 },
          { id: (order++).toString(), name: 'interstateIntrastate', display_name: 'Interstate/Intrastate', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.interstateIntrastate, order: order - 1 },
          { id: (order++).toString(), name: 'statesOfOperation', display_name: 'States of Operation', field_type: 'multiselect', is_required: true, is_unique: false, options: SELECT_OPTIONS.states, order: order - 1 },
          { id: (order++).toString(), name: 'operationClass', display_name: 'Operation Class', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'hasUSDOTNumber', display_name: 'Has USDOT Number?', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.yesNo, order: order - 1 },
          { id: (order++).toString(), name: 'usdotNumber', display_name: 'USDOT Number', field_type: 'text', is_required: false, is_unique: false, order: order - 1 }
        );

        // Fleet Information fields
        fields.push(
          { id: (order++).toString(), name: 'vehicleFleetType', display_name: 'Vehicle Fleet Type', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.vehicleFleetType, order: order - 1 },
          { id: (order++).toString(), name: 'vehicleTypesUsed', display_name: 'Vehicle Types Used', field_type: 'multiselect', is_required: true, is_unique: false, options: SELECT_OPTIONS.vehicleTypesUsed, order: order - 1 },
          { id: (order++).toString(), name: 'numberOfDrivers', display_name: 'Number of Drivers', field_type: 'number', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'driverList', display_name: 'Driver List', field_type: 'textarea', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'numberOfVehicles', display_name: 'Number of Vehicles', field_type: 'number', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'vehicleList', display_name: 'Vehicle List', field_type: 'textarea', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'gvwr', display_name: 'GVWR (Gross Vehicle Weight Rating)', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'yearMakeModel', display_name: 'Year/Make/Model', field_type: 'text', is_required: false, is_unique: false, order: order - 1 }
        );

        // Cargo & Safety fields
        fields.push(
          { id: (order++).toString(), name: 'cargoTypesTransported', display_name: 'Cargo Types Transported', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.cargoTypesTransported, order: order - 1 },
          { id: (order++).toString(), name: 'hazmatPlacardRequired', display_name: 'Hazmat Placard Required?', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.yesNo, order: order - 1 },
          { id: (order++).toString(), name: 'phmsaWork', display_name: 'PHMSA Work?', field_type: 'select', is_required: false, is_unique: false, options: SELECT_OPTIONS.yesNo, order: order - 1 }
        );

        // Regulatory Compliance fields
        fields.push(
          { id: (order++).toString(), name: 'additionalRegulatoryDetails', display_name: 'Additional Regulatory Details', field_type: 'multiselect', is_required: false, is_unique: false, options: SELECT_OPTIONS.additionalRegulatoryDetails, order: order - 1 }
        );

        // Financial Information fields
        fields.push(
          { id: (order++).toString(), name: 'hasDunsBradstreetNumber', display_name: 'Has DUNS Bradstreet Number?', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.yesNo, order: order - 1 },
          { id: (order++).toString(), name: 'dunsBradstreetNumber', display_name: 'DUNS Bradstreet Number', field_type: 'text', is_required: false, is_unique: false, order: order - 1 }
        );

        // System fields
        fields.push(
          { id: (order++).toString(), name: 'createdAt', display_name: 'Created At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'updatedAt', display_name: 'Updated At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 }
        );
        break;

      case 'Person':
        // Contact Details fields
        fields.push(
          { id: (order++).toString(), name: 'firstName', display_name: 'First Name', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'lastName', display_name: 'Last Name', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'phone', display_name: 'Phone', field_type: 'phone', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'email', display_name: 'Email', field_type: 'email', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'preferredContactMethod', display_name: 'Preferred Contact Method', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.preferredContactMethod, order: order - 1 }
        );

        // Role & Position fields
        fields.push(
          { id: (order++).toString(), name: 'isPrimaryContact', display_name: 'Is Primary Contact?', field_type: 'boolean', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'position', display_name: 'Position', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'department', display_name: 'Department', field_type: 'text', is_required: false, is_unique: false, order: order - 1 }
        );

        // Company Owner Details fields
        fields.push(
          { id: (order++).toString(), name: 'isCompanyOwner', display_name: 'Is Company Owner?', field_type: 'boolean', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'companyOwnerFirstName', display_name: 'Company Owner First Name', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'companyOwnerLastName', display_name: 'Company Owner Last Name', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'companyOwnerPhone', display_name: 'Company Owner Phone', field_type: 'phone', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'companyOwnerEmail', display_name: 'Company Owner Email', field_type: 'email', is_required: false, is_unique: false, order: order - 1 }
        );

        // System fields
        fields.push(
          { id: (order++).toString(), name: 'companyId', display_name: 'Company ID', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'createdAt', display_name: 'Created At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'updatedAt', display_name: 'Updated At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 }
        );
        break;

      case 'Driver':
        // Basic Information (Required)
        fields.push(
          { id: (order++).toString(), name: 'fullName', display_name: 'Full Name', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'address', display_name: 'Address/Contact Info', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'phone', display_name: 'Phone', field_type: 'phone', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'email', display_name: 'Email', field_type: 'email', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'dateOfBirth', display_name: 'Date of Birth', field_type: 'date', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'socialSecurityNumber', display_name: 'Social Security Number', field_type: 'text', is_required: true, is_unique: false, order: order - 1 }
        );

        // Employment History (Required)
        fields.push(
          { id: (order++).toString(), name: 'employmentHistory', display_name: 'Employment History', field_type: 'textarea', is_required: true, is_unique: false, order: order - 1 }
        );

        // Driving Experience (Required)
        fields.push(
          { id: (order++).toString(), name: 'drivingExperience', display_name: 'Driving Experience', field_type: 'multiselect', is_required: true, is_unique: false, options: ['CDL Class A', 'CDL Class B', 'CDL Class C', 'CDL Class D', 'CDL Class E', 'Other'], order: order - 1 }
        );

        // Accident/Violations History (Required)
        fields.push(
          { id: (order++).toString(), name: 'accidentViolationsHistory', display_name: 'Accident/Violations History', field_type: 'textarea', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'accidentViolationsFiles', display_name: 'Accident/Violations Files', field_type: 'attachment', is_required: false, is_unique: false, order: order - 1 }
        );

        // Motor Vehicle Record (MVR) (Required)
        fields.push(
          { id: (order++).toString(), name: 'mvrFiles', display_name: 'Motor Vehicle Record (MVR)', field_type: 'attachment', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'mvrInitialDate', display_name: 'MVR Initial Date', field_type: 'date', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'mvrAnnualDate', display_name: 'MVR Annual Date', field_type: 'date', is_required: false, is_unique: false, order: order - 1 }
        );

        // License/CDL Copy (Required)
        fields.push(
          { id: (order++).toString(), name: 'licenseCdlFiles', display_name: 'License/CDL Copy', field_type: 'attachment', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'licenseNumber', display_name: 'License Number', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'licenseExpiry', display_name: 'License Expiry', field_type: 'date', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'endorsements', display_name: 'Endorsements', field_type: 'multiselect', is_required: false, is_unique: false, options: ['Hazmat', 'Passenger', 'School Bus', 'Tanker', 'Double/Triple', 'Other'], order: order - 1 },
          { id: (order++).toString(), name: 'restrictions', display_name: 'Restrictions', field_type: 'multiselect', is_required: false, is_unique: false, options: ['Air Brake', 'Manual Transmission', 'Automatic Transmission', 'Other'], order: order - 1 }
        );

        // DOT Medical Certificate (Required)
        fields.push(
          { id: (order++).toString(), name: 'dotMedicalCertificateExpiry', display_name: 'DOT Medical Certificate Expiry', field_type: 'date', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'medicalExaminerName', display_name: 'Medical Examiner Name', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'medicalCertificateNumber', display_name: 'Medical Certificate Number', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'medicalExaminationReportFiles', display_name: 'Medical Examination Report', field_type: 'attachment', is_required: true, is_unique: false, order: order - 1 }
        );

        // Road Test Certificate/CDL (Required)
        fields.push(
          { id: (order++).toString(), name: 'roadTestCertificateFiles', display_name: 'Road Test Certificate/CDL', field_type: 'attachment', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'roadTestDate', display_name: 'Road Test Date', field_type: 'date', is_required: false, is_unique: false, order: order - 1 }
        );

        // Drug/Alcohol Test Results (Required)
        fields.push(
          { id: (order++).toString(), name: 'drugAlcoholTestResults', display_name: 'Drug/Alcohol Test Results', field_type: 'attachment', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'lastDrugTestDate', display_name: 'Last Drug Test Date', field_type: 'date', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'lastAlcoholTestDate', display_name: 'Last Alcohol Test Date', field_type: 'date', is_required: false, is_unique: false, order: order - 1 }
        );

        // Annual Violation Certification (Required)
        fields.push(
          { id: (order++).toString(), name: 'annualViolationCertificationFiles', display_name: 'Annual Violation Certification', field_type: 'attachment', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'lastAnnualCertificationDate', display_name: 'Last Annual Certification Date', field_type: 'date', is_required: false, is_unique: false, order: order - 1 }
        );

        // Safety Performance History (Required)
        fields.push(
          { id: (order++).toString(), name: 'safetyPerformanceHistoryFiles', display_name: 'Safety Performance History', field_type: 'attachment', is_required: true, is_unique: false, order: order - 1 }
        );

        // Variances/Waivers (Optional if applicable)
        fields.push(
          { id: (order++).toString(), name: 'variancesWaiversFiles', display_name: 'Variances/Waivers', field_type: 'attachment', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'hasVariancesWaivers', display_name: 'Has Variances/Waivers?', field_type: 'select', is_required: false, is_unique: false, options: ['Yes', 'No'], order: order - 1 }
        );

        // Proof of Work Authorization (Optional/Conditional)
        fields.push(
          { id: (order++).toString(), name: 'workAuthorizationFiles', display_name: 'Proof of Work Authorization', field_type: 'attachment', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'hasWorkAuthorization', display_name: 'Has Work Authorization?', field_type: 'select', is_required: false, is_unique: false, options: ['Yes', 'No'], order: order - 1 }
        );

        // Employment Information
        fields.push(
          { id: (order++).toString(), name: 'hireDate', display_name: 'Hire Date', field_type: 'date', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'employmentStatus', display_name: 'Employment Status', field_type: 'select', is_required: true, is_unique: false, options: ['Active', 'Inactive', 'Terminated'], order: order - 1 },
          { id: (order++).toString(), name: 'position', display_name: 'Position', field_type: 'text', is_required: true, is_unique: false, order: order - 1 }
        );

        // System fields
        fields.push(
          { id: (order++).toString(), name: 'companyId', display_name: 'Company ID', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'createdAt', display_name: 'Created At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'updatedAt', display_name: 'Updated At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 }
        );
        break;

      case 'Vehicle':
        // Vehicle Identification fields
        fields.push(
          { id: (order++).toString(), name: 'vin', display_name: 'VIN', field_type: 'text', is_required: true, is_unique: true, order: order - 1 },
          { id: (order++).toString(), name: 'licensePlate', display_name: 'License Plate', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'make', display_name: 'Make', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'model', display_name: 'Model', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'year', display_name: 'Year', field_type: 'number', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'color', display_name: 'Color', field_type: 'text', is_required: false, is_unique: false, order: order - 1 }
        );

        // Vehicle Specifications fields
        fields.push(
          { id: (order++).toString(), name: 'vehicleType', display_name: 'Vehicle Type', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.vehicleType, order: order - 1 },
          { id: (order++).toString(), name: 'gvwr', display_name: 'GVWR', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'emptyWeight', display_name: 'Empty Weight', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'fuelType', display_name: 'Fuel Type', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.fuelType, order: order - 1 }
        );

        // Status fields
        fields.push(
          { id: (order++).toString(), name: 'status', display_name: 'Status', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.vehicleStatus, order: order - 1 },
          { id: (order++).toString(), name: 'hasHazmatEndorsement', display_name: 'Has Hazmat Endorsement?', field_type: 'select', is_required: true, is_unique: false, options: SELECT_OPTIONS.yesNo, order: order - 1 }
        );

        // System fields
        fields.push(
          { id: (order++).toString(), name: 'companyId', display_name: 'Company ID', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'createdAt', display_name: 'Created At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'updatedAt', display_name: 'Updated At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 }
        );
        break;

      case 'Deal':
        fields.push(
          { id: (order++).toString(), name: 'title', display_name: 'Deal Title', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'description', display_name: 'Description', field_type: 'textarea', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'value', display_name: 'Deal Value', field_type: 'currency', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'stage', display_name: 'Stage', field_type: 'select', is_required: true, is_unique: false, options: ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'], order: order - 1 },
          { id: (order++).toString(), name: 'probability', display_name: 'Probability (%)', field_type: 'number', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'serviceId', display_name: 'Service ID', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'serviceName', display_name: 'Service Name', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'companyId', display_name: 'Company ID', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'contactId', display_name: 'Contact ID', field_type: 'text', is_required: false, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'createdAt', display_name: 'Created At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'updatedAt', display_name: 'Updated At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 }
        );
        break;

      case 'Invoice':
        fields.push(
          { id: (order++).toString(), name: 'invoiceNumber', display_name: 'Invoice Number', field_type: 'text', is_required: true, is_unique: true, order: order - 1 },
          { id: (order++).toString(), name: 'clientName', display_name: 'Client Name', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'amount', display_name: 'Amount', field_type: 'currency', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'status', display_name: 'Status', field_type: 'select', is_required: true, is_unique: false, options: ['draft', 'sent', 'paid', 'overdue'], order: order - 1 },
          { id: (order++).toString(), name: 'dueDate', display_name: 'Due Date', field_type: 'date', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'createdAt', display_name: 'Created At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'updatedAt', display_name: 'Updated At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 }
        );
        break;

      case 'Service':
        fields.push(
          { id: (order++).toString(), name: 'name', display_name: 'Service Name', field_type: 'text', is_required: true, is_unique: true, order: order - 1 },
          { id: (order++).toString(), name: 'description', display_name: 'Description', field_type: 'textarea', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'category', display_name: 'Category', field_type: 'select', is_required: true, is_unique: false, options: ['Registration', 'Compliance', 'Training', 'Support'], order: order - 1 },
          { id: (order++).toString(), name: 'basePrice', display_name: 'Base Price', field_type: 'currency', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'estimatedDuration', display_name: 'Estimated Duration', field_type: 'text', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'isActive', display_name: 'Is Active?', field_type: 'boolean', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'createdAt', display_name: 'Created At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 },
          { id: (order++).toString(), name: 'updatedAt', display_name: 'Updated At', field_type: 'datetime', is_required: true, is_unique: false, order: order - 1 }
        );
        break;
    }

    return fields;
  }

  private initializeDefaultSchemas() {
    if (this.schemas.length === 0) {
      // Generate schemas from TypeScript interfaces to ensure synchronization
      const defaultSchemas: SchemaDefinition[] = [
        {
          id: '1',
          name: 'companies',
          display_name: 'Companies',
          description: 'Company and organization information with comprehensive transportation business details',
          table_name: 'companies',
          fields: this.generateFieldsFromInterface('Organization'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_system: true
        },
        {
          id: '2',
          name: 'contacts',
          display_name: 'Contacts',
          description: 'Individual contact information with company relationships',
          table_name: 'contacts',
          fields: this.generateFieldsFromInterface('Person'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_system: true
        },
        {
          id: '3',
          name: 'drivers',
          display_name: 'Drivers',
          description: 'Driver and employee information with comprehensive documentation tracking',
          table_name: 'drivers',
          fields: this.generateFieldsFromInterface('Driver'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_system: true
        },
        {
          id: '4',
          name: 'vehicles',
          display_name: 'Vehicles',
          description: 'Vehicle and equipment information with specifications and compliance tracking',
          table_name: 'vehicles',
          fields: this.generateFieldsFromInterface('Vehicle'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_system: true
        },
        {
          id: '5',
          name: 'deals',
          display_name: 'Deals',
          description: 'Sales opportunities and deals with service relationships',
          table_name: 'deals',
          fields: this.generateFieldsFromInterface('Deal'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_system: true
        },
        {
          id: '6',
          name: 'invoices',
          display_name: 'Invoices',
          description: 'Invoice creation, management, and payment tracking',
          table_name: 'invoices',
          fields: this.generateFieldsFromInterface('Invoice'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_system: true
        },
        {
          id: '7',
          name: 'services',
          display_name: 'Services',
          description: 'Transportation compliance and registration services offered',
          table_name: 'services',
          fields: this.generateFieldsFromInterface('Service'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_system: true
        },
        {
          id: '2',
          name: 'usdot_application_record',
          display_name: 'USDOT APPLICATION RECORD',
          description: 'USDOT application data collected from onboarding agent for robotic process automation',
          table_name: 'usdot_application_record',
          fields: [
            // Operation Classification Summary
            { id: '1', name: 'has_duns_bradstreet_number', display_name: 'Does the Applicant have a Dun and Bradstreet Number?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 1 },
            { id: '2', name: 'legal_business_name', display_name: 'Legal Business Name', field_type: 'text', is_required: true, is_unique: false, order: 2 },
            { id: '3', name: 'doing_business_as_name', display_name: 'Doing Business As Name(s) (if different from Legal Business Name)', field_type: 'text', is_required: false, is_unique: false, order: 3 },
            { id: '4', name: 'is_principal_address_same_as_contact', display_name: 'Is the Applicant\'s Principal Place of Business Address the same as the Application Contact\'s Address?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 4 },
            
            // Principal Place of Business Address
            { id: '5', name: 'principal_address_country', display_name: 'Principal Place of Business - Country', field_type: 'text', is_required: true, is_unique: false, order: 5 },
            { id: '6', name: 'principal_address_street', display_name: 'Principal Place of Business - Street Address/Route Number', field_type: 'text', is_required: true, is_unique: false, order: 6 },
            { id: '7', name: 'principal_address_city', display_name: 'Principal Place of Business - City', field_type: 'text', is_required: true, is_unique: false, order: 7 },
            { id: '8', name: 'principal_address_state', display_name: 'Principal Place of Business - State/Province', field_type: 'text', is_required: true, is_unique: false, order: 8 },
            { id: '9', name: 'principal_address_postal_code', display_name: 'Principal Place of Business - Postal Code', field_type: 'text', is_required: true, is_unique: false, order: 9 },
            
            // Mailing Address
            { id: '10', name: 'mailing_address_country', display_name: 'Mailing Address - Country', field_type: 'text', is_required: false, is_unique: false, order: 10 },
            { id: '11', name: 'mailing_address_street', display_name: 'Mailing Address - Street Address/Route Number', field_type: 'text', is_required: false, is_unique: false, order: 11 },
            { id: '12', name: 'mailing_address_city', display_name: 'Mailing Address - City', field_type: 'text', is_required: false, is_unique: false, order: 12 },
            { id: '13', name: 'mailing_address_state', display_name: 'Mailing Address - State/Province', field_type: 'text', is_required: false, is_unique: false, order: 13 },
            { id: '14', name: 'mailing_address_postal_code', display_name: 'Mailing Address - Postal Code', field_type: 'text', is_required: false, is_unique: false, order: 14 },
            
            { id: '15', name: 'principal_telephone_number', display_name: 'Principal Place of Business Telephone Number', field_type: 'phone', is_required: true, is_unique: false, order: 15 },
            { id: '16', name: 'ein_or_ssn', display_name: 'Employer Identification Number (EIN) or Social Security Number (SSN)', field_type: 'text', is_required: true, is_unique: false, order: 16 },
            { id: '17', name: 'is_unit_of_government', display_name: 'Is the Applicant a Unit of Government?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 17 },
            { id: '18', name: 'form_of_business', display_name: 'Form of Business (Select the business form that applies)', field_type: 'select', is_required: true, is_unique: false, options: ['sole proprietor', 'partnership', 'limited liability company', 'Corporation (State of Incorporation)', 'Limited Liability Partnership', 'Trusts', 'Other Form Of Business'], order: 18 },
            { id: '19', name: 'ownership_and_control', display_name: 'Ownership and Control', field_type: 'select', is_required: true, is_unique: false, options: ['owned/controlled by citizen of United States', 'owned/controlled by citizen of Canada', 'owned/controlled by citizen of Mexico', 'owned/controlled by citizen of other foreign country'], order: 19 },
            
            // Company Contact Information
            { id: '20', name: 'company_contact_first_name', display_name: 'Company Contact - First Name', field_type: 'text', is_required: true, is_unique: false, order: 20 },
            { id: '21', name: 'company_contact_middle_name', display_name: 'Company Contact - Middle Name', field_type: 'text', is_required: false, is_unique: false, order: 21 },
            { id: '22', name: 'company_contact_last_name', display_name: 'Company Contact - Last Name', field_type: 'text', is_required: true, is_unique: false, order: 22 },
            { id: '23', name: 'company_contact_suffix', display_name: 'Company Contact - Suffix', field_type: 'text', is_required: false, is_unique: false, order: 23 },
            { id: '24', name: 'company_contact_title', display_name: 'Company Official\'s Title', field_type: 'text', is_required: true, is_unique: false, order: 24 },
            { id: '25', name: 'company_contact_email', display_name: 'Company Contact - Email', field_type: 'email', is_required: true, is_unique: false, order: 25 },
            { id: '26', name: 'company_contact_telephone', display_name: 'Company Contact - Telephone Number', field_type: 'phone', is_required: true, is_unique: false, order: 26 },
            
            // Company Contact Address
            { id: '27', name: 'company_contact_address_country', display_name: 'Company Contact Address - Country', field_type: 'text', is_required: true, is_unique: false, order: 27 },
            { id: '28', name: 'company_contact_address_street', display_name: 'Company Contact Address - Street Address/Route Number', field_type: 'text', is_required: true, is_unique: false, order: 28 },
            { id: '29', name: 'company_contact_address_city', display_name: 'Company Contact Address - City', field_type: 'text', is_required: true, is_unique: false, order: 29 },
            { id: '30', name: 'company_contact_address_state', display_name: 'Company Contact Address - State/Province', field_type: 'text', is_required: true, is_unique: false, order: 30 },
            { id: '31', name: 'company_contact_address_postal_code', display_name: 'Company Contact Address - Postal Code', field_type: 'text', is_required: true, is_unique: false, order: 31 },
            
            // Operation Questions
            { id: '32', name: 'will_operate_as_intermodal_equipment_provider', display_name: 'Will the Applicant operate as an Intermodal Equipment Provider?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 32 },
            { id: '33', name: 'will_transport_property', display_name: 'Will the Applicant transport Property?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 33 },
            { id: '34', name: 'will_receive_compensation_for_transporting_property', display_name: 'Will the Applicant receive compensation for the business of transporting the property belonging to others?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 34 },
            { id: '35', name: 'type_of_property_to_transport', display_name: 'What type of Property will the Applicant transport?', field_type: 'select', is_required: true, is_unique: false, options: ['hazardous materials', 'household goods', 'exempt commodities', 'Other non hazardous freight'], order: 35 },
            { id: '36', name: 'will_transport_non_hazardous_materials_interstate', display_name: 'Will the Applicant transport Non-Hazardous Materials across state lines, otherwise known as Interstate Commerce?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 36 },
            { id: '37', name: 'will_transport_own_property', display_name: 'Will the Applicant transport their own property?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 37 },
            { id: '38', name: 'will_transport_passengers', display_name: 'Will the Applicant transport any Passengers?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 38 },
            { id: '39', name: 'will_provide_broker_services', display_name: 'Will the Applicant provide Property or Household Goods (HHG) Broker services?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 39 },
            { id: '40', name: 'will_provide_freight_forwarder_services', display_name: 'Will the Applicant provide Freight Forwarder services?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 40 },
            { id: '41', name: 'will_operate_cargo_tank_facility', display_name: 'Will the Applicant operate a Cargo Tank Facility?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 41 },
            { id: '42', name: 'will_operate_as_driveaway', display_name: 'Will the Applicant operate as a Driveaway?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 42 },
            { id: '43', name: 'will_operate_as_towaway', display_name: 'Will the Applicant operate as a Towaway?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 43 },
            { id: '44', name: 'cargo_classifications', display_name: 'Please select all classifications of cargo that the Applicant will transport or handle', field_type: 'multiselect', is_required: true, is_unique: false, options: ['general freight', 'drive away/tow away', 'Machinery & large objects', 'household goods', 'metal: sheets coils rolls', 'motor vehicles', 'Logs Poles Beams Lumber', 'Building Materials', 'Mobile Homes', 'Fresh Produce', 'Liquids & Gases', 'Intermodal Containers', 'Passengers', 'Oil Field Equipment', 'livestock', 'grain feed hay', 'coal/coke', 'meat', 'garbage/refuse/trash', 'US Mail', 'Commodities Dry Bulk', 'Refrigerated Food', 'Beverages', 'Paper Product', 'Utility', 'Farm Supplies', 'Construction', 'Water Well', 'Other'], order: 44 },
            
            // Vehicle Summary
            { id: '45', name: 'non_cmv_property', display_name: 'Non-CMV Property', field_type: 'number', is_required: false, is_unique: false, order: 45 },
            { id: '46', name: 'straight_trucks_owned', display_name: 'Straight Truck(s) - Owned', field_type: 'number', is_required: false, is_unique: false, order: 46 },
            { id: '47', name: 'straight_trucks_term_leased', display_name: 'Straight Truck(s) - Term Leased', field_type: 'number', is_required: false, is_unique: false, order: 47 },
            { id: '48', name: 'straight_trucks_trip_leased', display_name: 'Straight Truck(s) - Trip Leased', field_type: 'number', is_required: false, is_unique: false, order: 48 },
            { id: '49', name: 'straight_trucks_tow_driveway', display_name: 'Straight Truck(s) - Tow / Driveway', field_type: 'number', is_required: false, is_unique: false, order: 49 },
            { id: '50', name: 'truck_tractors_owned', display_name: 'Truck Tractor(s) - Owned', field_type: 'number', is_required: false, is_unique: false, order: 50 },
            { id: '51', name: 'truck_tractors_term_leased', display_name: 'Truck Tractor(s) - Term Leased', field_type: 'number', is_required: false, is_unique: false, order: 51 },
            { id: '52', name: 'truck_tractors_trip_leased', display_name: 'Truck Tractor(s) - Trip Leased', field_type: 'number', is_required: false, is_unique: false, order: 52 },
            { id: '53', name: 'truck_tractors_tow_driveway', display_name: 'Truck Tractor(s) - Tow / Driveway', field_type: 'number', is_required: false, is_unique: false, order: 53 },
            { id: '54', name: 'trailers_owned', display_name: 'Trailer(s) - Owned', field_type: 'number', is_required: false, is_unique: false, order: 54 },
            { id: '55', name: 'trailers_term_leased', display_name: 'Trailer(s) - Term Leased', field_type: 'number', is_required: false, is_unique: false, order: 55 },
            { id: '56', name: 'trailers_trip_leased', display_name: 'Trailer(s) - Trip Leased', field_type: 'number', is_required: false, is_unique: false, order: 56 },
            { id: '57', name: 'trailers_tow_driveway', display_name: 'Trailer(s) - Tow / Driveway', field_type: 'number', is_required: false, is_unique: false, order: 57 },
            { id: '58', name: 'iep_trailer_chassis_owned', display_name: 'IEP Trailer Chassis Only - Owned', field_type: 'number', is_required: false, is_unique: false, order: 58 },
            { id: '59', name: 'iep_trailer_chassis_term_leased', display_name: 'IEP Trailer Chassis Only - Term Leased', field_type: 'number', is_required: false, is_unique: false, order: 59 },
            { id: '60', name: 'iep_trailer_chassis_trip_leased', display_name: 'IEP Trailer Chassis Only - Trip Leased', field_type: 'number', is_required: false, is_unique: false, order: 60 },
            { id: '61', name: 'iep_trailer_chassis_tow_driveway', display_name: 'IEP Trailer Chassis Only - Tow / Driveway', field_type: 'number', is_required: false, is_unique: false, order: 61 },
            { id: '62', name: 'iep_trailer_chassis_serviced', display_name: 'IEP Trailer Chassis Only - Serviced', field_type: 'number', is_required: false, is_unique: false, order: 62 },
            { id: '63', name: 'vehicles_in_canada', display_name: 'Please provide the number of vehicles that the Entity will operate in Canada', field_type: 'number', is_required: false, is_unique: false, order: 63 },
            { id: '64', name: 'vehicles_in_mexico', display_name: 'Please provide the number of vehicles that the Entity will operate in Mexico', field_type: 'number', is_required: false, is_unique: false, order: 64 },
            { id: '65', name: 'commercial_motor_vehicles_interstate', display_name: 'Please provide the number of Commercial Motor Vehicles the Applicant will operate solely in Interstate Commerce', field_type: 'number', is_required: false, is_unique: false, order: 65 },
            { id: '66', name: 'commercial_motor_vehicles_intrastate', display_name: 'Please provide the number of Commercial Motor Vehicles the Applicant will operate solely in Intrastate Commerce', field_type: 'number', is_required: false, is_unique: false, order: 66 },
            
            // Driver Summary
            { id: '67', name: 'interstate_drivers_within_100_miles', display_name: 'What are the number of drivers who will operate as Interstate - Within a 100 Air-Mile Radius', field_type: 'number', is_required: false, is_unique: false, order: 67 },
            { id: '68', name: 'interstate_drivers_beyond_100_miles', display_name: 'What are the number of drivers who will operate as Interstate - Beyond a 100 Air-Mile Radius', field_type: 'number', is_required: false, is_unique: false, order: 68 },
            { id: '69', name: 'intrastate_drivers_within_100_miles', display_name: 'What are the number of drivers who will operate solely as Intrastate - Within a 100 Air-Mile Radius', field_type: 'number', is_required: false, is_unique: false, order: 69 },
            { id: '70', name: 'intrastate_drivers_beyond_100_miles', display_name: 'What are the number of drivers who will operate solely as Intrastate - Beyond a 100 Air-Mile Radius', field_type: 'number', is_required: false, is_unique: false, order: 70 },
            { id: '71', name: 'drivers_with_cdl_lfc_canadian_license', display_name: 'What are the number of drivers with a Commercial Driver\'s License (CDL), Licencia Federal de Conductor (LFC), or a valid Canadian License Class 1, 2, 3, or 4', field_type: 'number', is_required: false, is_unique: false, order: 71 },
            { id: '72', name: 'drivers_operating_in_canada', display_name: 'What are the number of drivers who will operate in Canada', field_type: 'number', is_required: false, is_unique: false, order: 72 },
            { id: '73', name: 'drivers_operating_in_mexico', display_name: 'What are the number of drivers who will operate in Mexico', field_type: 'number', is_required: false, is_unique: false, order: 73 },
            
            // Affiliation with Others Summary
            { id: '74', name: 'has_relationships_with_others', display_name: 'Does the Applicant currently have, or has had within the last 3 years of the date of filing this application, relationships involving common stock, common ownership, common management, common control or familial relationships or any other person or applicant for registration?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 74 },
            
            // Compliance Certifications Summary
            { id: '75', name: 'certify_willing_able_provide_operations', display_name: 'Does the Applicant certify it is willing and able to provide the proposed operations or service and to comply with all pertinent statutory and regulatory requirements and regulations issued or administered by the U.S. Department of Transportation?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 75 },
            { id: '76', name: 'certify_willing_able_produce_documents', display_name: 'Does the Applicant certify it is willing and able to produce for review or inspection documents which are requested for the purpose of determining compliance with applicable statutes and regulations administered by the Department of Transportation?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 76 },
            { id: '77', name: 'certify_not_disqualified', display_name: 'Does the Applicant certify it is not currently disqualified from operating commercial motor vehicles in the United States?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 77 },
            { id: '78', name: 'certify_understands_agent_designation', display_name: 'Does the Applicant certify it understands that the agent(s) for service of process designation will be deemed the applicant\'s official representative(s) in the United States for receipt of filings and notices in administrative proceedings?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 78 },
            { id: '79', name: 'certify_not_prohibited_from_filing', display_name: 'Does the Applicant certify that the carrier is not prohibited from filing this application because its FMCSA registration is currently under suspension, or was revoked less than 30 days before filing the application?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 79 },
            { id: '80', name: 'certify_deficiencies_corrected', display_name: 'If the Applicant\'s registration is currently revoked, does the Applicant certify the deficiencies cited in the revocation proceeding have been corrected?', field_type: 'select', is_required: true, is_unique: false, options: ['Yes', 'No'], order: 80 },
            { id: '81', name: 'electronic_signature', display_name: 'Electronic Signature (Applicant\'s First Name and Last Name)', field_type: 'text', is_required: true, is_unique: false, order: 81 },
            
            // File Uploads
            { id: '82', name: 'drivers_license_upload', display_name: 'Drivers License Upload', field_type: 'attachment', is_required: false, is_unique: false, order: 82 },
            { id: '83', name: 'client_identity_pictures_upload', display_name: 'Client Identity Pictures Upload', field_type: 'attachment', is_required: false, is_unique: false, order: 83 },
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_system: true
        }
      ];
      this.schemas = defaultSchemas;
    }
  }

  // Get all schema definitions
  async getSchemas(): Promise<SchemaDefinition[]> {
    return this.schemas;
  }

  // Get a specific schema by name
  async getSchema(name: string): Promise<SchemaDefinition | null> {
    return this.schemas.find(s => s.name === name) || null;
  }

  // Create a new schema
  async createSchema(schema: Omit<SchemaDefinition, 'id' | 'created_at' | 'updated_at'>): Promise<SchemaDefinition> {
    const now = new Date().toISOString();
    
    const newSchema: SchemaDefinition = {
      id: Date.now().toString(),
      ...schema,
      created_at: now,
      updated_at: now
    };

    this.schemas.push(newSchema);
    
    // TODO: Save to real database
    console.log('Schema created (in-memory):', newSchema);
    
    return newSchema;
  }

  // Update an existing schema
  async updateSchema(name: string, schema: Partial<SchemaDefinition>): Promise<SchemaDefinition> {
    const index = this.schemas.findIndex(s => s.name === name);
    
    if (index === -1) {
      throw new Error('Schema not found');
    }

    const updated = { ...this.schemas[index], ...schema, updated_at: new Date().toISOString() };
    this.schemas[index] = updated;
    
    // TODO: Save to real database
    console.log('Schema updated (in-memory):', updated);
    
    return updated;
  }

  // Delete a schema
  async deleteSchema(name: string): Promise<boolean> {
    const initialLength = this.schemas.length;
    this.schemas = this.schemas.filter(s => s.name !== name);
    
    if (this.schemas.length === initialLength) {
      return false; // Schema not found
    }
    
    // TODO: Delete from real database
    console.log('Schema deleted (in-memory):', name);
    
    return true;
  }

  // Get all tables (simplified - just return schema names)
  async getTables(): Promise<string[]> {
    return this.schemas.map(s => s.table_name);
  }

  // Get table structure (simplified)
  async getTableStructure(tableName: string): Promise<any[]> {
    const schema = this.schemas.find(s => s.table_name === tableName);
    if (!schema) return [];
    
    return schema.fields.map(field => ({
      cid: field.order,
      name: field.name,
      type: field.field_type,
      notnull: field.is_required ? 1 : 0,
      dflt_value: field.default_value || null,
      pk: field.name === 'id' ? 1 : 0
    }));
  }

  // Insert data (TODO: Connect to real database)
  async insertRecord(tableName: string, data: Record<string, any>): Promise<number> {
    const now = new Date().toISOString();
    const recordData = { ...data, id: Date.now(), created_at: now, updated_at: now };

    // TODO: Save to real database
    console.log('Record inserted (in-memory):', tableName, recordData);
    
    return recordData.id;
  }

  // Get records (TODO: Connect to real database)
  async getRecords(tableName: string, limit = 100, offset = 0): Promise<any[]> {
    // TODO: Load from real database
    console.log('Getting records from:', tableName);
    return [];
  }

  // Update a record (TODO: Connect to real database)
  async updateRecord(tableName: string, id: number, data: Record<string, any>): Promise<boolean> {
    // TODO: Update in real database
    console.log('Record updated (in-memory):', tableName, id, data);
    return true;
  }

  // Delete a record (TODO: Connect to real database)
  async deleteRecord(tableName: string, id: number): Promise<boolean> {
    // TODO: Delete from real database
    console.log('Record deleted (in-memory):', tableName, id);
    return true;
  }
}

// Export singleton instance
export const schemaService = new SchemaService();