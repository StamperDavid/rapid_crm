/**
 * USDOT Form Page Service
 * Manages loading the 76 captured HTML pages for display in training environment
 */

export interface USDOTFormPage {
  id: string;
  pageNumber: number;
  filename: string;
  title: string;
}

export class USDOTFormPageService {
  private static instance: USDOTFormPageService;
  private pages: USDOTFormPage[] = [];

  static getInstance(): USDOTFormPageService {
    if (!USDOTFormPageService.instance) {
      USDOTFormPageService.instance = new USDOTFormPageService();
    }
    return USDOTFormPageService.instance;
  }

  /**
   * Get all 76 USDOT form pages
   */
  getAllPages(): USDOTFormPage[] {
    if (this.pages.length === 0) {
      this.initializePages();
    }
    return this.pages;
  }

  /**
   * Initialize the list of all 76 pages
   */
  private initializePages(): void {
    const pageDefinitions = [
      { number: 0, filename: 'page_00_landing.html', title: 'Landing/Welcome Page' },
      { number: 1, filename: 'page_01_login.html', title: 'Login' },
      { number: 2, filename: 'page_02_3rd_party_service_provider.html', title: '3rd Party Service Provider' },
      { number: 3, filename: 'page_03_new_or_continue.html', title: 'New or Continue' },
      { number: 4, filename: 'page_04_introduction_info.html', title: 'Introduction Info' },
      { number: 5, filename: 'page_05_navigation_instructions.html', title: 'Navigation Instructions' },
      { number: 6, filename: 'page_06_required_documents.html', title: 'Required Documents' },
      { number: 7, filename: 'page_07_financial_responsibility.html', title: 'Financial Responsibility' },
      { number: 8, filename: 'page_08_process_agent_notice.html', title: 'Process Agent Notice' },
      { number: 9, filename: 'page_09_usdot_number_issuance.html', title: 'USDOT Number Issuance' },
      { number: 10, filename: 'page_10_signature_authorization.html', title: 'Signature Authorization' },
      { number: 11, filename: 'page_11_paperwork_reduction_act.html', title: 'Paperwork Reduction Act' },
      { number: 12, filename: 'page_12_application_id.html', title: 'Application ID' },
      { number: 13, filename: 'page_13_application_contact_intro.html', title: 'Application Contact Intro' },
      { number: 14, filename: 'page_14_application_contact_form.html', title: 'Application Contact Form' },
      { number: 15, filename: 'page_15_business_description_intro.html', title: 'Business Description Intro' },
      { number: 16, filename: 'page_16_dun_bradstreet_question.html', title: 'Dun & Bradstreet Question' },
      { number: 17, filename: 'page_17_legal_business_name.html', title: 'Legal Business Name' },
      { number: 18, filename: 'page_18_dba_names.html', title: 'DBA Names' },
      { number: 19, filename: 'page_19_principal_address_same_as_contact.html', title: 'Principal Address Same as Contact' },
      { number: 20, filename: 'page_20_business_addresses.html', title: 'Business Addresses' },
      { number: 21, filename: 'page_21_business_phone_numbers.html', title: 'Business Phone Numbers' },
      { number: 22, filename: 'page_22_ein_ssn.html', title: 'EIN/SSN' },
      { number: 23, filename: 'page_23_unit_of_government.html', title: 'Unit of Government' },
      { number: 24, filename: 'page_24_form_of_business.html', title: 'Form of Business' },
      { number: 25, filename: 'page_25_ownership_control.html', title: 'Ownership Control' },
      { number: 26, filename: 'page_26_proprietor_partners_names.html', title: 'Proprietor/Partners Names' },
      { number: 27, filename: 'page_27_company_contact_address.html', title: 'Company Contact Address' },
      { number: 28, filename: 'page_28_business_description_summary.html', title: 'Business Description Summary' },
      { number: 29, filename: 'page_29_operation_classification_intro.html', title: 'Operation Classification Intro' },
      { number: 30, filename: 'page_30_intermodal_equipment_provider.html', title: 'Intermodal Equipment Provider' },
      { number: 31, filename: 'page_31_transport_property.html', title: 'Transport Property' },
      { number: 32, filename: 'page_32_for_hire_property.html', title: 'For-Hire Property' },
      { number: 33, filename: 'page_33_property_types.html', title: 'Property Types' },
      { number: 34, filename: 'page_34_interstate_commerce.html', title: 'Interstate Commerce' },
      { number: 35, filename: 'page_35_transport_own_property.html', title: 'Transport Own Property' },
      { number: 36, filename: 'page_36_transport_passengers.html', title: 'Transport Passengers' },
      { number: 37, filename: 'page_37_broker_services.html', title: 'Broker Services' },
      { number: 38, filename: 'page_38_freight_forwarder.html', title: 'Freight Forwarder' },
      { number: 39, filename: 'page_39_cargo_tank_facility.html', title: 'Cargo Tank Facility' },
      { number: 40, filename: 'page_40_towaway_operation.html', title: 'Towaway Operation' },
      { number: 41, filename: 'page_41_cargo_classifications.html', title: 'Cargo Classifications' },
      { number: 42, filename: 'page_42_operation_classification_summary.html', title: 'Operation Classification Summary' },
      { number: 43, filename: 'page_43_vehicles_intro.html', title: 'Vehicles Intro' },
      { number: 44, filename: 'page_44_non_cmv_property.html', title: 'Non-CMV Property' },
      { number: 45, filename: 'page_45_vehicle_types.html', title: 'Vehicle Types' },
      { number: 46, filename: 'page_46_canada_mexico_vehicles.html', title: 'Canada/Mexico Vehicles' },
      { number: 47, filename: 'page_47_interstate_only_vehicles.html', title: 'Interstate Only Vehicles' },
      { number: 48, filename: 'page_48_intrastate_only_vehicles.html', title: 'Intrastate Only Vehicles' },
      { number: 49, filename: 'page_49_vehicle_summary.html', title: 'Vehicle Summary' },
      { number: 50, filename: 'page_50_drivers_intro.html', title: 'Drivers Intro' },
      { number: 51, filename: 'page_51_interstate_drivers.html', title: 'Interstate Drivers' },
      { number: 52, filename: 'page_52_intrastate_drivers.html', title: 'Intrastate Drivers' },
      { number: 53, filename: 'page_53_cdl_holders.html', title: 'CDL Holders' },
      { number: 54, filename: 'page_54_canada_mexico_drivers.html', title: 'Canada/Mexico Drivers' },
      { number: 55, filename: 'page_55_driver_summary.html', title: 'Driver Summary' },
      { number: 56, filename: 'page_56_financial_responsibility_intro.html', title: 'Financial Responsibility Intro' },
      { number: 57, filename: 'page_57_property_10001_lbs.html', title: 'Property 10,001+ lbs' },
      { number: 58, filename: 'page_58_insurance_determination.html', title: 'Insurance Determination' },
      { number: 59, filename: 'page_59_affiliation_with_others_intro.html', title: 'Affiliation with Others Intro' },
      { number: 60, filename: 'page_60_affiliation_relationships.html', title: 'Affiliation Relationships' },
      { number: 61, filename: 'page_61_affiliation_summary.html', title: 'Affiliation Summary' },
      { number: 62, filename: 'page_62_certification_statement_intro.html', title: 'Certification Statement Intro' },
      { number: 63, filename: 'page_63_esignature_certification.html', title: 'E-Signature Certification' },
      { number: 64, filename: 'page_64_compliance_certifications_intro.html', title: 'Compliance Certifications Intro' },
      { number: 65, filename: 'page_65_dot_compliance_certification.html', title: 'DOT Compliance Certification' },
      { number: 66, filename: 'page_66_document_production_certification.html', title: 'Document Production Certification' },
      { number: 67, filename: 'page_67_not_disqualified_certification.html', title: 'Not Disqualified Certification' },
      { number: 68, filename: 'page_68_process_agent_certification.html', title: 'Process Agent Certification' },
      { number: 69, filename: 'page_69_not_suspended_revoked_certification.html', title: 'Not Suspended/Revoked Certification' },
      { number: 70, filename: 'page_70_revocation_deficiencies_corrected.html', title: 'Revocation Deficiencies Corrected' },
      { number: 71, filename: 'page_71_compliance_certifications_esignature.html', title: 'Compliance Certifications E-Signature' },
      { number: 72, filename: 'page_72_compliance_certifications_summary.html', title: 'Compliance Certifications Summary' },
      { number: 73, filename: 'page_73_applicants_oath_intro.html', title: 'Applicant\'s Oath Intro' },
      { number: 74, filename: 'page_74_applicants_oath_esignature.html', title: 'Applicant\'s Oath E-Signature' },
      { number: 75, filename: 'page_75_identity_verification.html', title: 'Identity Verification' }
    ];

    this.pages = pageDefinitions.map(def => ({
      id: `page_${def.number.toString().padStart(2, '0')}`,
      pageNumber: def.number,
      filename: def.filename,
      title: def.title
    }));
  }

  /**
   * Get page by number
   */
  getPageByNumber(pageNumber: number): USDOTFormPage | undefined {
    if (this.pages.length === 0) {
      this.initializePages();
    }
    return this.pages.find(p => p.pageNumber === pageNumber);
  }

  /**
   * Get total page count
   */
  getTotalPages(): number {
    if (this.pages.length === 0) {
      this.initializePages();
    }
    return this.pages.length;
  }
}

