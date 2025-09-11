// Browser-compatible schema service
// This is a simplified version that stores schemas in localStorage
// In production, this would connect to a backend API

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
  private storageKey = 'rapid_crm_schemas';

  constructor() {
    // Initialize with default schemas if none exist
    this.initializeDefaultSchemas();
  }

  private initializeDefaultSchemas() {
    const existing = this.getStoredSchemas();
    if (existing.length === 0) {
      // Add some default schemas
      const defaultSchemas: SchemaDefinition[] = [
        {
          id: '1',
          name: 'companies',
          display_name: 'Companies',
          description: 'Company and organization information',
          table_name: 'companies',
          fields: [
            { id: '1', name: 'name', display_name: 'Company Name', field_type: 'text', is_required: true, is_unique: false, order: 1 },
            { id: '2', name: 'industry', display_name: 'Industry', field_type: 'text', is_required: false, is_unique: false, order: 2 },
            { id: '3', name: 'email', display_name: 'Email', field_type: 'email', is_required: false, is_unique: false, order: 3 },
          ],
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
      this.saveSchemas(defaultSchemas);
    }
  }

  private getStoredSchemas(): SchemaDefinition[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load schemas from localStorage:', error);
      return [];
    }
  }

  private saveSchemas(schemas: SchemaDefinition[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(schemas));
    } catch (error) {
      console.error('Failed to save schemas to localStorage:', error);
    }
  }

  // Get all schema definitions
  async getSchemas(): Promise<SchemaDefinition[]> {
    return this.getStoredSchemas();
  }

  // Get a specific schema by name
  async getSchema(name: string): Promise<SchemaDefinition | null> {
    const schemas = this.getStoredSchemas();
    return schemas.find(s => s.name === name) || null;
  }

  // Create a new schema
  async createSchema(schema: Omit<SchemaDefinition, 'id' | 'created_at' | 'updated_at'>): Promise<SchemaDefinition> {
    const schemas = this.getStoredSchemas();
    const now = new Date().toISOString();
    
    const newSchema: SchemaDefinition = {
      id: Date.now().toString(),
      ...schema,
      created_at: now,
      updated_at: now
    };

    schemas.push(newSchema);
    this.saveSchemas(schemas);
    
    return newSchema;
  }

  // Update an existing schema
  async updateSchema(name: string, schema: Partial<SchemaDefinition>): Promise<SchemaDefinition> {
    const schemas = this.getStoredSchemas();
    const index = schemas.findIndex(s => s.name === name);
    
    if (index === -1) {
      throw new Error('Schema not found');
    }

    const updated = { ...schemas[index], ...schema, updated_at: new Date().toISOString() };
    schemas[index] = updated;
    this.saveSchemas(schemas);
    
    return updated;
  }

  // Delete a schema
  async deleteSchema(name: string): Promise<boolean> {
    const schemas = this.getStoredSchemas();
    const filtered = schemas.filter(s => s.name !== name);
    
    if (filtered.length === schemas.length) {
      return false; // Schema not found
    }
    
    this.saveSchemas(filtered);
    return true;
  }

  // Get all tables (simplified - just return schema names)
  async getTables(): Promise<string[]> {
    const schemas = this.getStoredSchemas();
    return schemas.map(s => s.table_name);
  }

  // Get table structure (simplified)
  async getTableStructure(tableName: string): Promise<any[]> {
    const schema = this.getStoredSchemas().find(s => s.table_name === tableName);
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

  // Insert data (simplified - just store in localStorage)
  async insertRecord(tableName: string, data: Record<string, any>): Promise<number> {
    const recordKey = `rapid_crm_records_${tableName}`;
    const now = new Date().toISOString();
    const recordData = { ...data, id: Date.now(), created_at: now, updated_at: now };

    try {
      const existing = JSON.parse(localStorage.getItem(recordKey) || '[]');
      existing.push(recordData);
      localStorage.setItem(recordKey, JSON.stringify(existing));
      return recordData.id;
    } catch (error) {
      console.error('Failed to insert record:', error);
      throw error;
    }
  }

  // Get records (simplified)
  async getRecords(tableName: string, limit = 100, offset = 0): Promise<any[]> {
    const recordKey = `rapid_crm_records_${tableName}`;
    try {
      const records = JSON.parse(localStorage.getItem(recordKey) || '[]');
      return records.slice(offset, offset + limit);
    } catch (error) {
      console.error('Failed to get records:', error);
      return [];
    }
  }

  // Update a record (simplified)
  async updateRecord(tableName: string, id: number, data: Record<string, any>): Promise<boolean> {
    const recordKey = `rapid_crm_records_${tableName}`;
    try {
      const records = JSON.parse(localStorage.getItem(recordKey) || '[]');
      const index = records.findIndex((r: any) => r.id === id);
      
      if (index === -1) return false;
      
      records[index] = { ...records[index], ...data, updated_at: new Date().toISOString() };
      localStorage.setItem(recordKey, JSON.stringify(records));
      return true;
    } catch (error) {
      console.error('Failed to update record:', error);
      return false;
    }
  }

  // Delete a record (simplified)
  async deleteRecord(tableName: string, id: number): Promise<boolean> {
    const recordKey = `rapid_crm_records_${tableName}`;
    try {
      const records = JSON.parse(localStorage.getItem(recordKey) || '[]');
      const filtered = records.filter((r: any) => r.id !== id);
      
      if (filtered.length === records.length) return false;
      
      localStorage.setItem(recordKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete record:', error);
      return false;
    }
  }
}

// Export singleton instance
export const schemaService = new SchemaService();