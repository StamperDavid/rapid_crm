import React, { useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface FieldDefinition {
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

interface SchemaEditorProps {
  entityType: string;
  onSave: (schema: FieldDefinition[]) => void;
  onCancel: () => void;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({ entityType, onSave, onCancel }) => {
  const [fields, setFields] = useState<FieldDefinition[]>([
    // Default fields for each entity type
    ...(entityType === 'companies' ? [
      { id: '1', name: 'name', display_name: 'Company Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 1 },
      { id: '2', name: 'industry', display_name: 'Industry', field_type: 'text' as const, is_required: false, is_unique: false, order: 2 },
      { id: '3', name: 'email', display_name: 'Email', field_type: 'email' as const, is_required: false, is_unique: false, order: 3 },
      { id: '4', name: 'phone', display_name: 'Phone', field_type: 'phone' as const, is_required: false, is_unique: false, order: 4 },
      { id: '5', name: 'website', display_name: 'Website', field_type: 'text' as const, is_required: false, is_unique: false, order: 5 },
      { id: '6', name: 'address', display_name: 'Address', field_type: 'textarea' as const, is_required: false, is_unique: false, order: 6 },
      { id: '7', name: 'status', display_name: 'Status', field_type: 'select' as const, is_required: false, is_unique: false, options: ['active', 'inactive', 'prospect'], order: 7 },
    ] : []),
    ...(entityType === 'contacts' ? [
      { id: '1', name: 'first_name', display_name: 'First Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 1 },
      { id: '2', name: 'last_name', display_name: 'Last Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 2 },
      { id: '3', name: 'email', display_name: 'Email', field_type: 'email' as const, is_required: false, is_unique: false, order: 3 },
      { id: '4', name: 'phone', display_name: 'Phone', field_type: 'phone' as const, is_required: false, is_unique: false, order: 4 },
      { id: '5', name: 'title', display_name: 'Title', field_type: 'text' as const, is_required: false, is_unique: false, order: 5 },
      { id: '6', name: 'is_primary', display_name: 'Primary Contact', field_type: 'boolean' as const, is_required: false, is_unique: false, order: 6 },
    ] : []),
    ...(entityType === 'drivers' ? [
      // Driver Information
      { id: '1', name: 'driver_name', display_name: 'Driver Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 1 },
      
      // Application & Documentation
      { id: '2', name: 'application_for_employment', display_name: 'Application For Employment', field_type: 'attachment' as const, is_required: false, is_unique: false, order: 2 },
      { id: '3', name: 'background_checks', display_name: 'Background Checks', field_type: 'attachment' as const, is_required: false, is_unique: false, order: 3 },
      { id: '4', name: 'certificate_of_receipt_for_company_testing_policy', display_name: 'Certificate of receipt for company testing policy', field_type: 'attachment' as const, is_required: false, is_unique: false, order: 4 },
      { id: '5', name: 'certificate_of_receipt_for_company_work_policy', display_name: 'Certificate of Receipt For Company Work Policy', field_type: 'attachment' as const, is_required: false, is_unique: false, order: 5 },
      { id: '6', name: 'commercial_drivers_license_information_system_reports', display_name: 'Commercial Drivers License Information System (CDLIS) Reports', field_type: 'attachment' as const, is_required: false, is_unique: false, order: 6 },
      { id: '7', name: 'copy_of_drivers_license', display_name: 'Copy Of Drivers License', field_type: 'attachment' as const, is_required: false, is_unique: false, order: 7 },
      { id: '8', name: 'medical_certificate_copy', display_name: 'Medical Certificate Copy', field_type: 'attachment' as const, is_required: false, is_unique: false, order: 8 },
      
      // Disciplinary & Safety Records
      { id: '9', name: 'disciplinary_action', display_name: 'Disciplinary Action', field_type: 'textarea' as const, is_required: false, is_unique: false, order: 9 },
      { id: '10', name: 'good_faith_effort_inquiry_into_driving_record', display_name: 'Good Faith Effort - Inquiry Into Driving Record', field_type: 'textarea' as const, is_required: false, is_unique: false, order: 10 },
      { id: '11', name: 'good_faith_effort_safety_performance_history_investigation', display_name: 'Good Faith Effort - Safety Performance History Investigation', field_type: 'text' as const, is_required: false, is_unique: false, order: 11 },
      { id: '12', name: 'inquiry_into_driving_record', display_name: 'Inquiry Into Driving Record', field_type: 'text' as const, is_required: false, is_unique: false, order: 12 },
      { id: '13', name: 'inquiry_to_previous_employers', display_name: 'Inquiry To Previous Employers', field_type: 'text' as const, is_required: false, is_unique: false, order: 13 },
      { id: '14', name: 'medical_examiner_national_registry_verification', display_name: 'Medical Examiner National Registry Verification', field_type: 'text' as const, is_required: false, is_unique: false, order: 14 },
      { id: '15', name: 'motor_vehicle_reports', display_name: 'Motor Vehicle Reports (MVR)', field_type: 'text' as const, is_required: false, is_unique: false, order: 15 },
      
      // Employment Documentation
      { id: '16', name: 'driver_employment_application', display_name: 'Driver Employment Application', field_type: 'attachment' as const, is_required: false, is_unique: false, order: 16 },
      { id: '17', name: 'drivers_road_test', display_name: 'Driver\'s Road Test', field_type: 'attachment' as const, is_required: false, is_unique: false, order: 17 },
      { id: '18', name: 'certification_of_road_test', display_name: 'Certification Of Road Test', field_type: 'text' as const, is_required: false, is_unique: false, order: 18 },
      { id: '19', name: 'annual_drivers_certificate_of_violations', display_name: 'Annual Driver\'s Certificate Of Violations', field_type: 'text' as const, is_required: false, is_unique: false, order: 19 },
      { id: '20', name: 'annual_review_of_driving_record', display_name: 'Annual Review of Driving Record', field_type: 'text' as const, is_required: false, is_unique: false, order: 20 },
      { id: '21', name: 'checklist_for_multiple_employers', display_name: 'Checklist For Multiple Employers', field_type: 'text' as const, is_required: false, is_unique: false, order: 21 },
    ] : []),
    ...(entityType === 'vehicles' ? [
      { id: '1', name: 'make', display_name: 'Make', field_type: 'text' as const, is_required: false, is_unique: false, order: 1 },
      { id: '2', name: 'model', display_name: 'Model', field_type: 'text' as const, is_required: false, is_unique: false, order: 2 },
      { id: '3', name: 'year', display_name: 'Year', field_type: 'number' as const, is_required: false, is_unique: false, order: 3 },
      { id: '4', name: 'vin', display_name: 'VIN', field_type: 'text' as const, is_required: false, is_unique: true, order: 4 },
      { id: '5', name: 'license_plate', display_name: 'License Plate', field_type: 'text' as const, is_required: false, is_unique: false, order: 5 },
      { id: '6', name: 'vehicle_type', display_name: 'Vehicle Type', field_type: 'select' as const, is_required: false, is_unique: false, options: ['truck', 'trailer', 'bus', 'van'], order: 6 },
    ] : []),
    ...(entityType === 'deals' ? [
      { id: '1', name: 'name', display_name: 'Deal Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 1 },
      { id: '2', name: 'amount', display_name: 'Amount', field_type: 'number' as const, is_required: false, is_unique: false, order: 2 },
      { id: '3', name: 'stage', display_name: 'Stage', field_type: 'select' as const, is_required: false, is_unique: false, options: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'], order: 3 },
      { id: '4', name: 'probability', display_name: 'Probability (%)', field_type: 'number' as const, is_required: false, is_unique: false, order: 4 },
      { id: '5', name: 'close_date', display_name: 'Close Date', field_type: 'date' as const, is_required: false, is_unique: false, order: 5 },
      { id: '6', name: 'status', display_name: 'Status', field_type: 'select' as const, is_required: false, is_unique: false, options: ['open', 'won', 'lost'], order: 6 },
    ] : []),
    ...(entityType === 'usdot_application_record' ? [
      // Operation Classification Summary
      { id: '1', name: 'has_duns_bradstreet_number', display_name: 'Does the Applicant have a Dun and Bradstreet Number?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 1 },
      { id: '2', name: 'legal_business_name', display_name: 'Legal Business Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 2 },
      { id: '3', name: 'doing_business_as_name', display_name: 'Doing Business As Name(s) (if different from Legal Business Name)', field_type: 'text' as const, is_required: false, is_unique: false, order: 3 },
      { id: '4', name: 'is_principal_address_same_as_contact', display_name: 'Is the Applicant\'s Principal Place of Business Address the same as the Application Contact\'s Address?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 4 },
      
      // Principal Place of Business Address
      { id: '5', name: 'principal_address_country', display_name: 'Principal Place of Business - Country', field_type: 'text' as const, is_required: true, is_unique: false, order: 5 },
      { id: '6', name: 'principal_address_street', display_name: 'Principal Place of Business - Street Address/Route Number', field_type: 'text' as const, is_required: true, is_unique: false, order: 6 },
      { id: '7', name: 'principal_address_city', display_name: 'Principal Place of Business - City', field_type: 'text' as const, is_required: true, is_unique: false, order: 7 },
      { id: '8', name: 'principal_address_state', display_name: 'Principal Place of Business - State/Province', field_type: 'text' as const, is_required: true, is_unique: false, order: 8 },
      { id: '9', name: 'principal_address_postal_code', display_name: 'Principal Place of Business - Postal Code', field_type: 'text' as const, is_required: true, is_unique: false, order: 9 },
      
      // Mailing Address
      { id: '10', name: 'mailing_address_country', display_name: 'Mailing Address - Country', field_type: 'text' as const, is_required: false, is_unique: false, order: 10 },
      { id: '11', name: 'mailing_address_street', display_name: 'Mailing Address - Street Address/Route Number', field_type: 'text' as const, is_required: false, is_unique: false, order: 11 },
      { id: '12', name: 'mailing_address_city', display_name: 'Mailing Address - City', field_type: 'text' as const, is_required: false, is_unique: false, order: 12 },
      { id: '13', name: 'mailing_address_state', display_name: 'Mailing Address - State/Province', field_type: 'text' as const, is_required: false, is_unique: false, order: 13 },
      { id: '14', name: 'mailing_address_postal_code', display_name: 'Mailing Address - Postal Code', field_type: 'text' as const, is_required: false, is_unique: false, order: 14 },
      
      { id: '15', name: 'principal_telephone_number', display_name: 'Principal Place of Business Telephone Number', field_type: 'phone' as const, is_required: true, is_unique: false, order: 15 },
      { id: '16', name: 'ein_or_ssn', display_name: 'Employer Identification Number (EIN) or Social Security Number (SSN)', field_type: 'text' as const, is_required: true, is_unique: false, order: 16 },
      { id: '17', name: 'is_unit_of_government', display_name: 'Is the Applicant a Unit of Government?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 17 },
      { id: '18', name: 'form_of_business', display_name: 'Form of Business (Select the business form that applies)', field_type: 'select' as const, is_required: true, is_unique: false, options: ['sole proprietor', 'partnership', 'limited liability company', 'Corporation (State of Incorporation)', 'Limited Liability Partnership', 'Trusts', 'Other Form Of Business'], order: 18 },
      { id: '19', name: 'ownership_and_control', display_name: 'Ownership and Control', field_type: 'select' as const, is_required: true, is_unique: false, options: ['owned/controlled by citizen of United States', 'owned/controlled by citizen of Canada', 'owned/controlled by citizen of Mexico', 'owned/controlled by citizen of other foreign country'], order: 19 },
      
      // Company Contact Information
      { id: '20', name: 'company_contact_first_name', display_name: 'Company Contact - First Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 20 },
      { id: '21', name: 'company_contact_middle_name', display_name: 'Company Contact - Middle Name', field_type: 'text' as const, is_required: false, is_unique: false, order: 21 },
      { id: '22', name: 'company_contact_last_name', display_name: 'Company Contact - Last Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 22 },
      { id: '23', name: 'company_contact_suffix', display_name: 'Company Contact - Suffix', field_type: 'text' as const, is_required: false, is_unique: false, order: 23 },
      { id: '24', name: 'company_contact_title', display_name: 'Company Official\'s Title', field_type: 'text' as const, is_required: true, is_unique: false, order: 24 },
      { id: '25', name: 'company_contact_email', display_name: 'Company Contact - Email', field_type: 'email' as const, is_required: true, is_unique: false, order: 25 },
      { id: '26', name: 'company_contact_telephone', display_name: 'Company Contact - Telephone Number', field_type: 'phone' as const, is_required: true, is_unique: false, order: 26 },
      
      // Company Contact Address
      { id: '27', name: 'company_contact_address_country', display_name: 'Company Contact Address - Country', field_type: 'text' as const, is_required: true, is_unique: false, order: 27 },
      { id: '28', name: 'company_contact_address_street', display_name: 'Company Contact Address - Street Address/Route Number', field_type: 'text' as const, is_required: true, is_unique: false, order: 28 },
      { id: '29', name: 'company_contact_address_city', display_name: 'Company Contact Address - City', field_type: 'text' as const, is_required: true, is_unique: false, order: 29 },
      { id: '30', name: 'company_contact_address_state', display_name: 'Company Contact Address - State/Province', field_type: 'text' as const, is_required: true, is_unique: false, order: 30 },
      { id: '31', name: 'company_contact_address_postal_code', display_name: 'Company Contact Address - Postal Code', field_type: 'text' as const, is_required: true, is_unique: false, order: 31 },
      
      // Operation Questions
      { id: '32', name: 'will_operate_as_intermodal_equipment_provider', display_name: 'Will the Applicant operate as an Intermodal Equipment Provider?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 32 },
      { id: '33', name: 'will_transport_property', display_name: 'Will the Applicant transport Property?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 33 },
      { id: '34', name: 'will_receive_compensation_for_transporting_property', display_name: 'Will the Applicant receive compensation for the business of transporting the property belonging to others?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 34 },
      { id: '35', name: 'type_of_property_to_transport', display_name: 'What type of Property will the Applicant transport?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['hazardous materials', 'household goods', 'exempt commodities', 'Other non hazardous freight'], order: 35 },
      { id: '36', name: 'will_transport_non_hazardous_materials_interstate', display_name: 'Will the Applicant transport Non-Hazardous Materials across state lines, otherwise known as Interstate Commerce?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 36 },
      { id: '37', name: 'will_transport_own_property', display_name: 'Will the Applicant transport their own property?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 37 },
      { id: '38', name: 'will_transport_passengers', display_name: 'Will the Applicant transport any Passengers?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 38 },
      { id: '39', name: 'will_provide_broker_services', display_name: 'Will the Applicant provide Property or Household Goods (HHG) Broker services?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 39 },
      { id: '40', name: 'will_provide_freight_forwarder_services', display_name: 'Will the Applicant provide Freight Forwarder services?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 40 },
      { id: '41', name: 'will_operate_cargo_tank_facility', display_name: 'Will the Applicant operate a Cargo Tank Facility?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 41 },
      { id: '42', name: 'will_operate_as_driveaway', display_name: 'Will the Applicant operate as a Driveaway?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 42 },
      { id: '43', name: 'will_operate_as_towaway', display_name: 'Will the Applicant operate as a Towaway?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 43 },
      { id: '44', name: 'cargo_classifications', display_name: 'Please select all classifications of cargo that the Applicant will transport or handle', field_type: 'multiselect' as const, is_required: true, is_unique: false, options: ['general freight', 'drive away/tow away', 'Machinery & large objects', 'household goods', 'metal: sheets coils rolls', 'motor vehicles', 'Logs Poles Beams Lumber', 'Building Materials', 'Mobile Homes', 'Fresh Produce', 'Liquids & Gases', 'Intermodal Containers', 'Passengers', 'Oil Field Equipment', 'livestock', 'grain feed hay', 'coal/coke', 'meat', 'garbage/refuse/trash', 'US Mail', 'Commodities Dry Bulk', 'Refrigerated Food', 'Beverages', 'Paper Product', 'Utility', 'Farm Supplies', 'Construction', 'Water Well', 'Other'], order: 44 },
      
      // Vehicle Summary
      { id: '45', name: 'non_cmv_property', display_name: 'Non-CMV Property', field_type: 'number' as const, is_required: false, is_unique: false, order: 45 },
      { id: '46', name: 'straight_trucks_owned', display_name: 'Straight Truck(s) - Owned', field_type: 'number' as const, is_required: false, is_unique: false, order: 46 },
      { id: '47', name: 'straight_trucks_term_leased', display_name: 'Straight Truck(s) - Term Leased', field_type: 'number' as const, is_required: false, is_unique: false, order: 47 },
      { id: '48', name: 'straight_trucks_trip_leased', display_name: 'Straight Truck(s) - Trip Leased', field_type: 'number' as const, is_required: false, is_unique: false, order: 48 },
      { id: '49', name: 'straight_trucks_tow_driveway', display_name: 'Straight Truck(s) - Tow / Driveway', field_type: 'number' as const, is_required: false, is_unique: false, order: 49 },
      { id: '50', name: 'truck_tractors_owned', display_name: 'Truck Tractor(s) - Owned', field_type: 'number' as const, is_required: false, is_unique: false, order: 50 },
      { id: '51', name: 'truck_tractors_term_leased', display_name: 'Truck Tractor(s) - Term Leased', field_type: 'number' as const, is_required: false, is_unique: false, order: 51 },
      { id: '52', name: 'truck_tractors_trip_leased', display_name: 'Truck Tractor(s) - Trip Leased', field_type: 'number' as const, is_required: false, is_unique: false, order: 52 },
      { id: '53', name: 'truck_tractors_tow_driveway', display_name: 'Truck Tractor(s) - Tow / Driveway', field_type: 'number' as const, is_required: false, is_unique: false, order: 53 },
      { id: '54', name: 'trailers_owned', display_name: 'Trailer(s) - Owned', field_type: 'number' as const, is_required: false, is_unique: false, order: 54 },
      { id: '55', name: 'trailers_term_leased', display_name: 'Trailer(s) - Term Leased', field_type: 'number' as const, is_required: false, is_unique: false, order: 55 },
      { id: '56', name: 'trailers_trip_leased', display_name: 'Trailer(s) - Trip Leased', field_type: 'number' as const, is_required: false, is_unique: false, order: 56 },
      { id: '57', name: 'trailers_tow_driveway', display_name: 'Trailer(s) - Tow / Driveway', field_type: 'number' as const, is_required: false, is_unique: false, order: 57 },
      { id: '58', name: 'iep_trailer_chassis_owned', display_name: 'IEP Trailer Chassis Only - Owned', field_type: 'number' as const, is_required: false, is_unique: false, order: 58 },
      { id: '59', name: 'iep_trailer_chassis_term_leased', display_name: 'IEP Trailer Chassis Only - Term Leased', field_type: 'number' as const, is_required: false, is_unique: false, order: 59 },
      { id: '60', name: 'iep_trailer_chassis_trip_leased', display_name: 'IEP Trailer Chassis Only - Trip Leased', field_type: 'number' as const, is_required: false, is_unique: false, order: 60 },
      { id: '61', name: 'iep_trailer_chassis_tow_driveway', display_name: 'IEP Trailer Chassis Only - Tow / Driveway', field_type: 'number' as const, is_required: false, is_unique: false, order: 61 },
      { id: '62', name: 'iep_trailer_chassis_serviced', display_name: 'IEP Trailer Chassis Only - Serviced', field_type: 'number' as const, is_required: false, is_unique: false, order: 62 },
      { id: '63', name: 'vehicles_in_canada', display_name: 'Please provide the number of vehicles that the Entity will operate in Canada', field_type: 'number' as const, is_required: false, is_unique: false, order: 63 },
      { id: '64', name: 'vehicles_in_mexico', display_name: 'Please provide the number of vehicles that the Entity will operate in Mexico', field_type: 'number' as const, is_required: false, is_unique: false, order: 64 },
      { id: '65', name: 'commercial_motor_vehicles_interstate', display_name: 'Please provide the number of Commercial Motor Vehicles the Applicant will operate solely in Interstate Commerce', field_type: 'number' as const, is_required: false, is_unique: false, order: 65 },
      { id: '66', name: 'commercial_motor_vehicles_intrastate', display_name: 'Please provide the number of Commercial Motor Vehicles the Applicant will operate solely in Intrastate Commerce', field_type: 'number' as const, is_required: false, is_unique: false, order: 66 },
      
      // Driver Summary
      { id: '67', name: 'interstate_drivers_within_100_miles', display_name: 'What are the number of drivers who will operate as Interstate - Within a 100 Air-Mile Radius', field_type: 'number' as const, is_required: false, is_unique: false, order: 67 },
      { id: '68', name: 'interstate_drivers_beyond_100_miles', display_name: 'What are the number of drivers who will operate as Interstate - Beyond a 100 Air-Mile Radius', field_type: 'number' as const, is_required: false, is_unique: false, order: 68 },
      { id: '69', name: 'intrastate_drivers_within_100_miles', display_name: 'What are the number of drivers who will operate solely as Intrastate - Within a 100 Air-Mile Radius', field_type: 'number' as const, is_required: false, is_unique: false, order: 69 },
      { id: '70', name: 'intrastate_drivers_beyond_100_miles', display_name: 'What are the number of drivers who will operate solely as Intrastate - Beyond a 100 Air-Mile Radius', field_type: 'number' as const, is_required: false, is_unique: false, order: 70 },
      { id: '71', name: 'drivers_with_cdl_lfc_canadian_license', display_name: 'What are the number of drivers with a Commercial Driver\'s License (CDL), Licencia Federal de Conductor (LFC), or a valid Canadian License Class 1, 2, 3, or 4', field_type: 'number' as const, is_required: false, is_unique: false, order: 71 },
      { id: '72', name: 'drivers_operating_in_canada', display_name: 'What are the number of drivers who will operate in Canada', field_type: 'number' as const, is_required: false, is_unique: false, order: 72 },
      { id: '73', name: 'drivers_operating_in_mexico', display_name: 'What are the number of drivers who will operate in Mexico', field_type: 'number' as const, is_required: false, is_unique: false, order: 73 },
      
      // Affiliation with Others Summary
      { id: '74', name: 'has_relationships_with_others', display_name: 'Does the Applicant currently have, or has had within the last 3 years of the date of filing this application, relationships involving common stock, common ownership, common management, common control or familial relationships or any other person or applicant for registration?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 74 },
      
      // Compliance Certifications Summary
      { id: '75', name: 'certify_willing_able_provide_operations', display_name: 'Does the Applicant certify it is willing and able to provide the proposed operations or service and to comply with all pertinent statutory and regulatory requirements and regulations issued or administered by the U.S. Department of Transportation?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 75 },
      { id: '76', name: 'certify_willing_able_produce_documents', display_name: 'Does the Applicant certify it is willing and able to produce for review or inspection documents which are requested for the purpose of determining compliance with applicable statutes and regulations administered by the Department of Transportation?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 76 },
      { id: '77', name: 'certify_not_disqualified', display_name: 'Does the Applicant certify it is not currently disqualified from operating commercial motor vehicles in the United States?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 77 },
      { id: '78', name: 'certify_understands_agent_designation', display_name: 'Does the Applicant certify it understands that the agent(s) for service of process designation will be deemed the applicant\'s official representative(s) in the United States for receipt of filings and notices in administrative proceedings?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 78 },
      { id: '79', name: 'certify_not_prohibited_from_filing', display_name: 'Does the Applicant certify that the carrier is not prohibited from filing this application because its FMCSA registration is currently under suspension, or was revoked less than 30 days before filing the application?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 79 },
      { id: '80', name: 'certify_deficiencies_corrected', display_name: 'If the Applicant\'s registration is currently revoked, does the Applicant certify the deficiencies cited in the revocation proceeding have been corrected?', field_type: 'select' as const, is_required: true, is_unique: false, options: ['Yes', 'No'], order: 80 },
      { id: '81', name: 'electronic_signature', display_name: 'Electronic Signature (Applicant\'s First Name and Last Name)', field_type: 'text' as const, is_required: true, is_unique: false, order: 81 },
      
      // File Uploads
      { id: '82', name: 'drivers_license_upload', display_name: 'Drivers License Upload', field_type: 'attachment' as const, is_required: false, is_unique: false, order: 82 },
      { id: '83', name: 'client_identity_pictures_upload', display_name: 'Client Identity Pictures Upload', field_type: 'attachment' as const, is_required: false, is_unique: false, order: 83 },
    ] : []),
  ]);

  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);
  const [showAddField, setShowAddField] = useState(false);

  const addField = () => {
    const newField: FieldDefinition = {
      id: Date.now().toString(),
      name: '',
      display_name: '',
      field_type: 'text',
      is_required: false,
      is_unique: false,
      order: fields.length + 1,
    };
    setFields([...fields, newField]);
    setEditingField(newField);
  };

  const updateField = (updatedField: FieldDefinition) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
    setEditingField(null);
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
    
    // Update order numbers
    newFields.forEach((field, index) => {
      field.order = index + 1;
    });
    
    setFields(newFields);
  };

  const handleSave = () => {
    onSave(fields);
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'datetime': return '📅⏰';
      case 'time': return '⏰';
      case 'boolean': return '☑️';
      case 'select': return '📋';
      case 'multiselect': return '📋📋';
      case 'textarea': return '📄';
      case 'email': return '📧';
      case 'phone': return '📞';
      case 'url': return '🔗';
      case 'currency': return '💰';
      case 'percentage': return '📊';
      case 'rating': return '⭐';
      case 'attachment': return '📎';
      case 'lookup': return '🔍';
      case 'rollup': return '📈';
      case 'formula': return '🧮';
      case 'autonumber': return '🔢';
      case 'barcode': return '📊';
      case 'button': return '🔘';
      case 'created_time': return '⏰';
      case 'last_modified_time': return '⏰';
      case 'created_by': return '👤';
      case 'last_modified_by': return '👤';
      default: return '📝';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Edit Schema: {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Define the fields and properties for this entity type
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Save Schema
              </button>
              <button
                onClick={onCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>

          {/* Fields List */}
          <div className="space-y-4">
            {fields
              .sort((a, b) => a.order - b.order)
              .map((field, index) => (
                <div key={field.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFieldTypeIcon(field.field_type)}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {field.display_name || 'Unnamed Field'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {field.name || 'No field name'} • {field.field_type}
                          {field.is_required && ' • Required'}
                          {field.is_unique && ' • Unique'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveField(field.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveField(field.id, 'down')}
                        disabled={index === fields.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => setEditingField(field)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit field"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteField(field.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete field"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Add Field Button */}
          <div className="mt-6">
            <button
              onClick={addField}
              className="inline-flex items-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Field
            </button>
          </div>
        </div>
      </div>

      {/* Field Editor Modal */}
      {editingField && (
        <FieldEditor
          field={editingField}
          onSave={updateField}
          onCancel={() => setEditingField(null)}
        />
      )}
    </div>
  );
};

// Field Editor Component
interface FieldEditorProps {
  field: FieldDefinition;
  onSave: (field: FieldDefinition) => void;
  onCancel: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onSave, onCancel }) => {
  const [editedField, setEditedField] = useState<FieldDefinition>({ ...field });

  const handleSave = () => {
    if (!editedField.name || !editedField.display_name) {
      alert('Field name and display name are required');
      return;
    }
    onSave(editedField);
  };

  const addOption = () => {
    const newOptions = [...(editedField.options || []), ''];
    setEditedField({ ...editedField, options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(editedField.options || [])];
    newOptions[index] = value;
    setEditedField({ ...editedField, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = editedField.options?.filter((_, i) => i !== index) || [];
    setEditedField({ ...editedField, options: newOptions });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Edit Field
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Field Name *
              </label>
              <input
                type="text"
                value={editedField.name}
                onChange={(e) => setEditedField({ ...editedField, name: e.target.value })}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., company_name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Display Name *
              </label>
              <input
                type="text"
                value={editedField.display_name}
                onChange={(e) => setEditedField({ ...editedField, display_name: e.target.value })}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Field Type
              </label>
              <select
                value={editedField.field_type}
                onChange={(e) => setEditedField({ ...editedField, field_type: e.target.value as any })}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <optgroup label="Basic Types">
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="datetime">Date & Time</option>
                  <option value="time">Time</option>
                  <option value="boolean">Boolean (Yes/No)</option>
                  <option value="textarea">Text Area</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="url">URL</option>
                </optgroup>
                <optgroup label="Selection Types">
                  <option value="select">Select (Dropdown)</option>
                  <option value="multiselect">Multi-Select</option>
                </optgroup>
                <optgroup label="Specialized Types">
                  <option value="currency">Currency</option>
                  <option value="percentage">Percentage</option>
                  <option value="rating">Rating</option>
                  <option value="attachment">Attachment</option>
                  <option value="autonumber">Auto Number</option>
                  <option value="barcode">Barcode</option>
                </optgroup>
                <optgroup label="Relationship Types">
                  <option value="lookup">Lookup</option>
                  <option value="rollup">Rollup</option>
                </optgroup>
                <optgroup label="Formula & Automation">
                  <option value="formula">Formula</option>
                  <option value="button">Button</option>
                </optgroup>
                <optgroup label="System Fields">
                  <option value="created_time">Created Time</option>
                  <option value="last_modified_time">Last Modified Time</option>
                  <option value="created_by">Created By</option>
                  <option value="last_modified_by">Last Modified By</option>
                </optgroup>
              </select>
            </div>

            {(editedField.field_type === 'select' || editedField.field_type === 'multiselect') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Options
                </label>
                <div className="mt-1 space-y-2">
                  {editedField.options?.map((option, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Option value"
                      />
                      <button
                        onClick={() => removeOption(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            )}

            {editedField.field_type === 'currency' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Currency Configuration
                </label>
                <div className="mt-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Currency Code</label>
                    <select
                      value={editedField.currency_config?.currency_code || 'USD'}
                      onChange={(e) => setEditedField({ 
                        ...editedField, 
                        currency_config: { 
                          ...editedField.currency_config, 
                          currency_code: e.target.value,
                          symbol: e.target.value === 'USD' ? '$' : e.target.value === 'EUR' ? '€' : e.target.value === 'GBP' ? '£' : e.target.value
                        } 
                      })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Symbol</label>
                    <input
                      type="text"
                      value={editedField.currency_config?.symbol || '$'}
                      onChange={(e) => setEditedField({ 
                        ...editedField, 
                        currency_config: { ...editedField.currency_config, symbol: e.target.value } 
                      })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {editedField.field_type === 'rating' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rating Configuration
                </label>
                <div className="mt-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Max Rating</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editedField.rating_config?.max_rating || 5}
                      onChange={(e) => setEditedField({ 
                        ...editedField, 
                        rating_config: { ...editedField.rating_config, max_rating: parseInt(e.target.value) } 
                      })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Icon</label>
                    <select
                      value={editedField.rating_config?.icon || 'star'}
                      onChange={(e) => setEditedField({ 
                        ...editedField, 
                        rating_config: { ...editedField.rating_config, icon: e.target.value } 
                      })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="star">⭐ Star</option>
                      <option value="heart">❤️ Heart</option>
                      <option value="thumbs">👍 Thumbs</option>
                      <option value="number">🔢 Number</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {editedField.field_type === 'attachment' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Attachment Configuration
                </label>
                <div className="mt-1 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Allowed File Types</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {['image', 'document', 'video', 'audio', 'pdf', 'spreadsheet', 'presentation'].map(type => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editedField.attachment_config?.allowed_types?.includes(type) || false}
                            onChange={(e) => {
                              const currentTypes = editedField.attachment_config?.allowed_types || [];
                              const newTypes = e.target.checked 
                                ? [...currentTypes, type]
                                : currentTypes.filter(t => t !== type);
                              setEditedField({ 
                                ...editedField, 
                                attachment_config: { ...editedField.attachment_config, allowed_types: newTypes } 
                              });
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Max File Size (MB)</label>
                    <input
                      type="number"
                      min="1"
                      value={editedField.attachment_config?.max_size || 10}
                      onChange={(e) => setEditedField({ 
                        ...editedField, 
                        attachment_config: { ...editedField.attachment_config, max_size: parseInt(e.target.value) } 
                      })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {editedField.field_type === 'lookup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lookup Configuration
                </label>
                <div className="mt-1 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Linked Table</label>
                    <select
                      value={editedField.lookup_config?.linked_table || ''}
                      onChange={(e) => setEditedField({ 
                        ...editedField, 
                        lookup_config: { ...editedField.lookup_config, linked_table: e.target.value } 
                      })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a table...</option>
                      <option value="companies">Companies</option>
                      <option value="contacts">Contacts</option>
                      <option value="deals">Deals</option>
                      <option value="vehicles">Vehicles</option>
                      <option value="drivers">Drivers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Linked Field</label>
                    <input
                      type="text"
                      value={editedField.lookup_config?.linked_field || ''}
                      onChange={(e) => setEditedField({ 
                        ...editedField, 
                        lookup_config: { ...editedField.lookup_config, linked_field: e.target.value } 
                      })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., id"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Display Field</label>
                    <input
                      type="text"
                      value={editedField.lookup_config?.display_field || ''}
                      onChange={(e) => setEditedField({ 
                        ...editedField, 
                        lookup_config: { ...editedField.lookup_config, display_field: e.target.value } 
                      })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., name"
                    />
                  </div>
                </div>
              </div>
            )}

            {editedField.field_type === 'rollup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rollup Configuration
                </label>
                <div className="mt-1 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Linked Table</label>
                    <select
                      value={editedField.rollup_config?.linked_table || ''}
                      onChange={(e) => setEditedField({ 
                        ...editedField, 
                        rollup_config: { ...editedField.rollup_config, linked_table: e.target.value } 
                      })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select a table...</option>
                      <option value="companies">Companies</option>
                      <option value="contacts">Contacts</option>
                      <option value="deals">Deals</option>
                      <option value="vehicles">Vehicles</option>
                      <option value="drivers">Drivers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Linked Field</label>
                    <input
                      type="text"
                      value={editedField.rollup_config?.linked_field || ''}
                      onChange={(e) => setEditedField({ 
                        ...editedField, 
                        rollup_config: { ...editedField.rollup_config, linked_field: e.target.value } 
                      })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., amount"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Aggregation</label>
                    <select
                      value={editedField.rollup_config?.aggregation || 'sum'}
                      onChange={(e) => setEditedField({ 
                        ...editedField, 
                        rollup_config: { ...editedField.rollup_config, aggregation: e.target.value as any } 
                      })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="sum">Sum</option>
                      <option value="average">Average</option>
                      <option value="count">Count</option>
                      <option value="min">Minimum</option>
                      <option value="max">Maximum</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {editedField.field_type === 'formula' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Formula Configuration
                </label>
                <div className="mt-1 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Formula</label>
                    <textarea
                      value={editedField.formula_config?.formula || ''}
                      onChange={(e) => setEditedField({ 
                        ...editedField, 
                        formula_config: { ...editedField.formula_config, formula: e.target.value } 
                      })}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., {field1} + {field2}"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Result Type</label>
                    <select
                      value={editedField.formula_config?.result_type || 'text'}
                      onChange={(e) => setEditedField({ 
                        ...editedField, 
                        formula_config: { ...editedField.formula_config, result_type: e.target.value } 
                      })}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="boolean">Boolean</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Value
              </label>
              <input
                type="text"
                value={editedField.default_value || ''}
                onChange={(e) => setEditedField({ ...editedField, default_value: e.target.value })}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Default value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={editedField.description || ''}
                onChange={(e) => setEditedField({ ...editedField, description: e.target.value })}
                rows={2}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Describe what this field is for..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Help Text
              </label>
              <input
                type="text"
                value={editedField.help_text || ''}
                onChange={(e) => setEditedField({ ...editedField, help_text: e.target.value })}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Help text shown to users"
              />
            </div>

            {/* Validation Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Validation Rules
              </label>
              <div className="mt-1 space-y-4">
                {(editedField.field_type === 'text' || editedField.field_type === 'textarea' || editedField.field_type === 'email') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Min Length</label>
                      <input
                        type="number"
                        min="0"
                        value={editedField.validation_rules?.min_length || ''}
                        onChange={(e) => setEditedField({ 
                          ...editedField, 
                          validation_rules: { ...editedField.validation_rules, min_length: parseInt(e.target.value) || undefined } 
                        })}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Min length"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Max Length</label>
                      <input
                        type="number"
                        min="1"
                        value={editedField.validation_rules?.max_length || ''}
                        onChange={(e) => setEditedField({ 
                          ...editedField, 
                          validation_rules: { ...editedField.validation_rules, max_length: parseInt(e.target.value) || undefined } 
                        })}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Max length"
                      />
                    </div>
                  </div>
                )}

                {(editedField.field_type === 'number' || editedField.field_type === 'currency' || editedField.field_type === 'percentage') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Min Value</label>
                      <input
                        type="number"
                        value={editedField.validation_rules?.min_value || ''}
                        onChange={(e) => setEditedField({ 
                          ...editedField, 
                          validation_rules: { ...editedField.validation_rules, min_value: parseFloat(e.target.value) || undefined } 
                        })}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Min value"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Max Value</label>
                      <input
                        type="number"
                        value={editedField.validation_rules?.max_value || ''}
                        onChange={(e) => setEditedField({ 
                          ...editedField, 
                          validation_rules: { ...editedField.validation_rules, max_value: parseFloat(e.target.value) || undefined } 
                        })}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Max value"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400">Custom Pattern (Regex)</label>
                  <input
                    type="text"
                    value={editedField.validation_rules?.pattern || ''}
                    onChange={(e) => setEditedField({ 
                      ...editedField, 
                      validation_rules: { ...editedField.validation_rules, pattern: e.target.value } 
                    })}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., ^[A-Z]{2}[0-9]{4}$"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400">Custom Validation Message</label>
                  <input
                    type="text"
                    value={editedField.validation_rules?.custom_validation || ''}
                    onChange={(e) => setEditedField({ 
                      ...editedField, 
                      validation_rules: { ...editedField.validation_rules, custom_validation: e.target.value } 
                    })}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Custom validation message"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editedField.is_required}
                  onChange={(e) => setEditedField({ ...editedField, is_required: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Required</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editedField.is_unique}
                  onChange={(e) => setEditedField({ ...editedField, is_unique: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Unique</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Field
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaEditor;