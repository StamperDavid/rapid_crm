import { USDOTApplication } from '../../types/schema';

import { getApiBaseUrl } from '../../config/api';

const API_BASE_URL = getApiBaseUrl();

export class USDOTApplicationService {
  /**
   * Get all USDOT applications
   */
  static async getAllApplications(): Promise<USDOTApplication[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/usdot-applications`);
      if (!response.ok) {
        throw new Error(`Failed to fetch USDOT applications: ${response.statusText}`);
      }
      const applications = await response.json();
      
      // Parse JSON fields back to objects
      return applications.map((app: any) => ({
        ...app,
        operationTypes: JSON.parse(app.operation_types || '[]'),
        carrierOperationTypes: JSON.parse(app.carrier_operation_types || '[]'),
        operationClassifications: JSON.parse(app.operation_classifications || '[]'),
        cargoClassifications: JSON.parse(app.cargo_classifications || '[]'),
        hazardousMaterials: {
          classifications: JSON.parse(app.hazardous_materials_classifications || '[]'),
          hmClasses: JSON.parse(app.hazardous_materials_hm_classes || '[]')
        },
        principalAddress: {
          street: app.principal_address_street,
          city: app.principal_address_city,
          state: app.principal_address_state,
          zip: app.principal_address_zip
        },
        mailingAddress: {
          isDifferent: app.mailing_address_is_different === 'Yes',
          street: app.mailing_address_street,
          city: app.mailing_address_city,
          state: app.mailing_address_state,
          zip: app.mailing_address_zip
        },
        primaryContact: {
          fullName: app.primary_contact_full_name,
          title: app.primary_contact_title,
          phone: app.primary_contact_phone,
          fax: app.primary_contact_fax,
          email: app.primary_contact_email
        },
        companyOfficial: {
          fullName: app.company_official_full_name,
          title: app.company_official_title,
          phone: app.company_official_phone,
          email: app.company_official_email
        },
        powerUnits: {
          owned: app.power_units_owned || 0,
          termLeased: app.power_units_term_leased || 0,
          tripLeased: app.power_units_trip_leased || 0
        },
        drivers: {
          employees: app.drivers_employees || 0,
          ownerOperators: app.drivers_owner_operators || 0
        },
        marketerOfTransportationServices: app.marketer_of_transportation_services === 'Yes',
        isReadOnly: app.is_read_only === 'Yes'
      }));
    } catch (error) {
      console.error('Error fetching USDOT applications:', error);
      throw error;
    }
  }

  /**
   * Get USDOT application by ID
   */
  static async getApplicationById(id: string): Promise<USDOTApplication | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/usdot-applications/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch USDOT application: ${response.statusText}`);
      }
      const app = await response.json();
      
      // Parse JSON fields back to objects
      return {
        ...app,
        operationTypes: JSON.parse(app.operation_types || '[]'),
        carrierOperationTypes: JSON.parse(app.carrier_operation_types || '[]'),
        operationClassifications: JSON.parse(app.operation_classifications || '[]'),
        cargoClassifications: JSON.parse(app.cargo_classifications || '[]'),
        hazardousMaterials: {
          classifications: JSON.parse(app.hazardous_materials_classifications || '[]'),
          hmClasses: JSON.parse(app.hazardous_materials_hm_classes || '[]')
        },
        principalAddress: {
          street: app.principal_address_street,
          city: app.principal_address_city,
          state: app.principal_address_state,
          zip: app.principal_address_zip
        },
        mailingAddress: {
          isDifferent: app.mailing_address_is_different === 'Yes',
          street: app.mailing_address_street,
          city: app.mailing_address_city,
          state: app.mailing_address_state,
          zip: app.mailing_address_zip
        },
        primaryContact: {
          fullName: app.primary_contact_full_name,
          title: app.primary_contact_title,
          phone: app.primary_contact_phone,
          fax: app.primary_contact_fax,
          email: app.primary_contact_email
        },
        companyOfficial: {
          fullName: app.company_official_full_name,
          title: app.company_official_title,
          phone: app.company_official_phone,
          email: app.company_official_email
        },
        powerUnits: {
          owned: app.power_units_owned || 0,
          termLeased: app.power_units_term_leased || 0,
          tripLeased: app.power_units_trip_leased || 0
        },
        drivers: {
          employees: app.drivers_employees || 0,
          ownerOperators: app.drivers_owner_operators || 0
        },
        marketerOfTransportationServices: app.marketer_of_transportation_services === 'Yes',
        isReadOnly: app.is_read_only === 'Yes'
      };
    } catch (error) {
      console.error('Error fetching USDOT application:', error);
      throw error;
    }
  }

  /**
   * Get USDOT applications by company ID
   */
  static async getApplicationsByCompanyId(companyId: string): Promise<USDOTApplication[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/usdot-applications/company/${companyId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch USDOT applications for company: ${response.statusText}`);
      }
      const applications = await response.json();
      
      // Parse JSON fields back to objects
      return applications.map((app: any) => ({
        ...app,
        operationTypes: JSON.parse(app.operation_types || '[]'),
        carrierOperationTypes: JSON.parse(app.carrier_operation_types || '[]'),
        operationClassifications: JSON.parse(app.operation_classifications || '[]'),
        cargoClassifications: JSON.parse(app.cargo_classifications || '[]'),
        hazardousMaterials: {
          classifications: JSON.parse(app.hazardous_materials_classifications || '[]'),
          hmClasses: JSON.parse(app.hazardous_materials_hm_classes || '[]')
        },
        principalAddress: {
          street: app.principal_address_street,
          city: app.principal_address_city,
          state: app.principal_address_state,
          zip: app.principal_address_zip
        },
        mailingAddress: {
          isDifferent: app.mailing_address_is_different === 'Yes',
          street: app.mailing_address_street,
          city: app.mailing_address_city,
          state: app.mailing_address_state,
          zip: app.mailing_address_zip
        },
        primaryContact: {
          fullName: app.primary_contact_full_name,
          title: app.primary_contact_title,
          phone: app.primary_contact_phone,
          fax: app.primary_contact_fax,
          email: app.primary_contact_email
        },
        companyOfficial: {
          fullName: app.company_official_full_name,
          title: app.company_official_title,
          phone: app.company_official_phone,
          email: app.company_official_email
        },
        powerUnits: {
          owned: app.power_units_owned || 0,
          termLeased: app.power_units_term_leased || 0,
          tripLeased: app.power_units_trip_leased || 0
        },
        drivers: {
          employees: app.drivers_employees || 0,
          ownerOperators: app.drivers_owner_operators || 0
        },
        marketerOfTransportationServices: app.marketer_of_transportation_services === 'Yes',
        isReadOnly: app.is_read_only === 'Yes'
      }));
    } catch (error) {
      console.error('Error fetching USDOT applications for company:', error);
      throw error;
    }
  }

  /**
   * Create a new USDOT application (read-only after creation)
   */
  static async createApplication(applicationData: Omit<USDOTApplication, 'id' | 'createdAt' | 'updatedAt' | 'isReadOnly'>): Promise<USDOTApplication> {
    try {
      const response = await fetch(`${API_BASE_URL}/usdot-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create USDOT application: ${response.statusText}`);
      }

      const app = await response.json();
      
      // Parse JSON fields back to objects
      return {
        ...app,
        operationTypes: JSON.parse(app.operation_types || '[]'),
        carrierOperationTypes: JSON.parse(app.carrier_operation_types || '[]'),
        operationClassifications: JSON.parse(app.operation_classifications || '[]'),
        cargoClassifications: JSON.parse(app.cargo_classifications || '[]'),
        hazardousMaterials: {
          classifications: JSON.parse(app.hazardous_materials_classifications || '[]'),
          hmClasses: JSON.parse(app.hazardous_materials_hm_classes || '[]')
        },
        principalAddress: {
          street: app.principal_address_street,
          city: app.principal_address_city,
          state: app.principal_address_state,
          zip: app.principal_address_zip
        },
        mailingAddress: {
          isDifferent: app.mailing_address_is_different === 'Yes',
          street: app.mailing_address_street,
          city: app.mailing_address_city,
          state: app.mailing_address_state,
          zip: app.mailing_address_zip
        },
        primaryContact: {
          fullName: app.primary_contact_full_name,
          title: app.primary_contact_title,
          phone: app.primary_contact_phone,
          fax: app.primary_contact_fax,
          email: app.primary_contact_email
        },
        companyOfficial: {
          fullName: app.company_official_full_name,
          title: app.company_official_title,
          phone: app.company_official_phone,
          email: app.company_official_email
        },
        powerUnits: {
          owned: app.power_units_owned || 0,
          termLeased: app.power_units_term_leased || 0,
          tripLeased: app.power_units_trip_leased || 0
        },
        drivers: {
          employees: app.drivers_employees || 0,
          ownerOperators: app.drivers_owner_operators || 0
        },
        marketerOfTransportationServices: app.marketer_of_transportation_services === 'Yes',
        isReadOnly: app.is_read_only === 'Yes'
      };
    } catch (error) {
      console.error('Error creating USDOT application:', error);
      throw error;
    }
  }

  /**
   * Check if an application can be edited (always returns false - read-only after creation)
   */
  static canEditApplication(application: USDOTApplication): boolean {
    return false; // USDOT applications are always read-only after creation
  }
}

