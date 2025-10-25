/**
 * USDOT Training Scenarios
 * Complete end-to-end scenarios for transportation compliance training
 */

export interface USDOTTrainingScenario {
  id: string;
  name: string;
  description: string;
  type: 'for-hire-interstate-property' | 'for-hire-interstate-passenger' | 'private-property' | 'hazmat-carrier' | 'household-goods' | 'intrastate-only';
  pages: USDOTScenarioPage[];
  businessDetails: {
    companyName: string;
    businessType: string;
    operationType: string;
    fleetSize: string;
    cargoTypes: string[];
    states: string[];
    insurance: string;
  };
  expectedAnswers: Record<string, string>;
  trainingNotes: string[];
}

export interface USDOTScenarioPage {
  pageNumber: number;
  title: string;
  htmlContent: string;
  questionId?: string;
  questionText?: string;
  answerOptions?: string[];
  expectedAnswer?: string;
  explanation?: string;
}

export class USDOTTrainingScenarios {
  private static instance: USDOTTrainingScenarios;
  private scenarios: USDOTTrainingScenario[] = [];

  static getInstance(): USDOTTrainingScenarios {
    if (!USDOTTrainingScenarios.instance) {
      USDOTTrainingScenarios.instance = new USDOTTrainingScenarios();
    }
    return USDOTTrainingScenarios.instance;
  }

  /**
   * Get all available training scenarios
   */
  async getAllScenarios(): Promise<USDOTTrainingScenario[]> {
    if (this.scenarios.length === 0) {
      await this.loadScenarios();
    }
    return this.scenarios;
  }

  /**
   * Get scenario by ID
   */
  getScenario(scenarioId: string): USDOTTrainingScenario | undefined {
    return this.scenarios.find(s => s.id === scenarioId);
  }

  /**
   * Load all training scenarios
   */
  private async loadScenarios(): Promise<void> {
    // Scenario 1: For-Hire Interstate Property Carrier (General Freight)
    const scenario1: USDOTTrainingScenario = {
      id: 'for-hire-interstate-property-general',
      name: 'For-Hire Interstate Property Carrier (General Freight)',
      description: 'Complete USDOT application for a for-hire interstate motor carrier transporting general freight',
      type: 'for-hire-interstate-property',
      pages: await this.loadScenarioPages('for-hire-interstate-property'),
      businessDetails: {
        companyName: 'ABC Trucking LLC',
        businessType: 'Limited Liability Company',
        operationType: 'For-Hire Interstate Property Carrier',
        fleetSize: '5 trucks, 8 trailers',
        cargoTypes: ['General Freight', 'Manufactured Goods'],
        states: ['Texas', 'California', 'New Mexico', 'Arizona'],
        insurance: '$1,000,000 per occurrence'
      },
      expectedAnswers: {
        'Q05001': 'N', // Intermodal Equipment Provider? NO
        'Q05002': 'Y', // Transport Property? YES
        'Q05003': 'Y', // For-Hire Property? YES
        'Q05004': 'Y', // General Freight? YES
        'Q05005': 'Y', // Interstate Commerce? YES
        'Q05006': 'N', // Transport Passengers? NO
        'Q05007': 'N', // Broker Services? NO
        'Q05008': 'N', // Freight Forwarder? NO
        'Q05009': 'N', // Cargo Tank Facility? NO
        'Q05010': 'N', // Towaway Operation? NO
        'Q05011': 'Y', // Property >= 10,001 lbs? YES
        'Q05012': 'N'  // Affiliation Relationships? NO
      },
      trainingNotes: [
        'This is the most common scenario for trucking companies',
        'Requires both USDOT number and MC number',
        'Must have $1M insurance minimum',
        'Biennial USDOT renewal required',
        'Annual MC number renewal required'
      ]
    };

    // Scenario 2: For-Hire Interstate Passenger Carrier
    const scenario2: USDOTTrainingScenario = {
      id: 'for-hire-interstate-passenger',
      name: 'For-Hire Interstate Passenger Carrier',
      description: 'Complete USDOT application for a for-hire interstate passenger carrier (bus company)',
      type: 'for-hire-interstate-passenger',
      pages: await this.loadScenarioPages('for-hire-interstate-passenger'),
      businessDetails: {
        companyName: 'Sunshine Bus Lines Inc',
        businessType: 'Corporation',
        operationType: 'For-Hire Interstate Passenger Carrier',
        fleetSize: '12 buses, 2 vans',
        cargoTypes: ['Passengers'],
        states: ['Florida', 'Georgia', 'Alabama', 'South Carolina'],
        insurance: '$5,000,000 per occurrence'
      },
      expectedAnswers: {
        'Q05001': 'N', // Intermodal Equipment Provider? NO
        'Q05002': 'N', // Transport Property? NO
        'Q05003': 'Y', // For-Hire Passengers? YES
        'Q05004': 'Y', // Interstate Commerce? YES
        'Q05005': 'N', // Transport Property? NO
        'Q05006': 'N', // Broker Services? NO
        'Q05007': 'N', // Freight Forwarder? NO
        'Q05008': 'N', // Cargo Tank Facility? NO
        'Q05009': 'N', // Towaway Operation? NO
        'Q05010': 'Y', // Passenger Capacity >= 16? YES
        'Q05011': 'N'  // Affiliation Relationships? NO
      },
      trainingNotes: [
        'Higher insurance requirements for passenger carriers',
        'Requires USDOT number and MC number',
        'Must meet passenger carrier safety requirements',
        'Annual renewals required',
        'Special passenger carrier regulations apply'
      ]
    };

    // Scenario 3: Private Property Carrier
    const scenario3: USDOTTrainingScenario = {
      id: 'private-property-carrier',
      name: 'Private Property Carrier',
      description: 'Complete USDOT application for a private property carrier (own goods only)',
      type: 'private-property',
      pages: await this.loadScenarioPages('private-property'),
      businessDetails: {
        companyName: 'Manufacturing Co Transport',
        businessType: 'Corporation',
        operationType: 'Private Property Carrier',
        fleetSize: '3 trucks, 5 trailers',
        cargoTypes: ['Own Manufactured Products'],
        states: ['Ohio', 'Pennsylvania', 'West Virginia'],
        insurance: '$750,000 per occurrence'
      },
      expectedAnswers: {
        'Q05001': 'N', // Intermodal Equipment Provider? NO
        'Q05002': 'Y', // Transport Property? YES
        'Q05003': 'N', // For-Hire Property? NO (Private)
        'Q05004': 'Y', // Transport Own Property? YES
        'Q05005': 'Y', // Interstate Commerce? YES
        'Q05006': 'N', // Transport Passengers? NO
        'Q05007': 'N', // Broker Services? NO
        'Q05008': 'N', // Freight Forwarder? NO
        'Q05009': 'N', // Cargo Tank Facility? NO
        'Q05010': 'N', // Towaway Operation? NO
        'Q05011': 'Y', // Property >= 10,001 lbs? YES
        'Q05012': 'N'  // Affiliation Relationships? NO
      },
      trainingNotes: [
        'No MC number required for private carriers',
        'Lower insurance requirements',
        'Can only transport own goods',
        'Cannot receive compensation for others\' goods',
        'Biennial USDOT renewal only'
      ]
    };

    // Scenario 4: Hazardous Materials Carrier
    const scenario4: USDOTTrainingScenario = {
      id: 'hazmat-carrier',
      name: 'Hazardous Materials Carrier',
      description: 'Complete USDOT application for a carrier transporting hazardous materials',
      type: 'hazmat-carrier',
      pages: await this.loadScenarioPages('hazmat-carrier'),
      businessDetails: {
        companyName: 'SafeChem Transport LLC',
        businessType: 'Limited Liability Company',
        operationType: 'For-Hire Interstate Property Carrier (Hazmat)',
        fleetSize: '8 trucks, 12 trailers',
        cargoTypes: ['Hazardous Materials', 'General Freight'],
        states: ['Texas', 'Louisiana', 'Oklahoma', 'Arkansas'],
        insurance: '$5,000,000 per occurrence'
      },
      expectedAnswers: {
        'Q05001': 'N', // Intermodal Equipment Provider? NO
        'Q05002': 'Y', // Transport Property? YES
        'Q05003': 'Y', // For-Hire Property? YES
        'Q05004': 'Y', // Hazardous Materials? YES
        'Q05005': 'Y', // Interstate Commerce? YES
        'Q05006': 'N', // Transport Passengers? NO
        'Q05007': 'N', // Broker Services? NO
        'Q05008': 'N', // Freight Forwarder? NO
        'Q05009': 'N', // Cargo Tank Facility? NO
        'Q05010': 'N', // Towaway Operation? NO
        'Q05011': 'Y', // Property >= 10,001 lbs? YES
        'Q05012': 'N'  // Affiliation Relationships? NO
      },
      trainingNotes: [
        'Higher insurance requirements for hazmat',
        'Requires hazmat endorsements',
        'Special safety requirements',
        'Additional certifications needed',
        'Stricter compliance monitoring'
      ]
    };

    // Scenario 5: Household Goods Carrier
    const scenario5: USDOTTrainingScenario = {
      id: 'household-goods-carrier',
      name: 'Household Goods Carrier',
      description: 'Complete USDOT application for a household goods moving company',
      type: 'household-goods',
      pages: await this.loadScenarioPages('household-goods'),
      businessDetails: {
        companyName: 'Reliable Movers Inc',
        businessType: 'Corporation',
        operationType: 'For-Hire Interstate Property Carrier (HHG)',
        fleetSize: '6 trucks, 12 trailers',
        cargoTypes: ['Household Goods'],
        states: ['California', 'Nevada', 'Arizona', 'Utah'],
        insurance: '$1,000,000 per occurrence'
      },
      expectedAnswers: {
        'Q05001': 'N', // Intermodal Equipment Provider? NO
        'Q05002': 'Y', // Transport Property? YES
        'Q05003': 'Y', // For-Hire Property? YES
        'Q05004': 'Y', // Household Goods? YES
        'Q05005': 'Y', // Interstate Commerce? YES
        'Q05006': 'N', // Transport Passengers? NO
        'Q05007': 'N', // Broker Services? NO
        'Q05008': 'N', // Freight Forwarder? NO
        'Q05009': 'N', // Cargo Tank Facility? NO
        'Q05010': 'N', // Towaway Operation? NO
        'Q05011': 'Y', // Property >= 10,001 lbs? YES
        'Q05012': 'N'  // Affiliation Relationships? NO
      },
      trainingNotes: [
        'Special HHG regulations apply',
        'Must provide written estimates',
        'Tariff requirements',
        'Special insurance for household goods',
        'Consumer protection regulations'
      ]
    };

    // Scenario 6: Intrastate-Only Carrier
    const scenario6: USDOTTrainingScenario = {
      id: 'intrastate-only-carrier',
      name: 'Intrastate-Only Carrier',
      description: 'Complete USDOT application for a carrier operating only within one state',
      type: 'intrastate-only',
      pages: await this.loadScenarioPages('intrastate-only'),
      businessDetails: {
        companyName: 'Local Delivery Co',
        businessType: 'Partnership',
        operationType: 'For-Hire Intrastate Property Carrier',
        fleetSize: '2 trucks, 3 trailers',
        cargoTypes: ['General Freight'],
        states: ['Texas'],
        insurance: '$750,000 per occurrence'
      },
      expectedAnswers: {
        'Q05001': 'N', // Intermodal Equipment Provider? NO
        'Q05002': 'Y', // Transport Property? YES
        'Q05003': 'Y', // For-Hire Property? YES
        'Q05004': 'Y', // General Freight? YES
        'Q05005': 'N', // Interstate Commerce? NO (Intrastate only)
        'Q05006': 'N', // Transport Passengers? NO
        'Q05007': 'N', // Broker Services? NO
        'Q05008': 'N', // Freight Forwarder? NO
        'Q05009': 'N', // Cargo Tank Facility? NO
        'Q05010': 'N', // Towaway Operation? NO
        'Q05011': 'Y', // Property >= 10,001 lbs? YES
        'Q05012': 'N'  // Affiliation Relationships? NO
      },
      trainingNotes: [
        'No MC number required for intrastate only',
        'State-specific regulations apply',
        'Lower insurance requirements',
        'Cannot cross state lines',
        'Biennial USDOT renewal only'
      ]
    };

    this.scenarios = [scenario1, scenario2, scenario3, scenario4, scenario5, scenario6];
    console.log(`✅ Loaded ${this.scenarios.length} complete USDOT training scenarios`);
  }

  /**
   * Load pages for a specific scenario type
   */
  private async loadScenarioPages(scenarioType: string): Promise<USDOTScenarioPage[]> {
    // For now, return the pages we have (For-Hire Interstate Property scenario)
    // In the future, this will load different page sets based on scenario type
    const pages: USDOTScenarioPage[] = [];
    
    // Load all 76 pages for the For-Hire Interstate Property scenario
    for (let i = 0; i <= 75; i++) {
      const pageNumber = i;
      const pageId = `page_${i.toString().padStart(2, '0')}`;
      
      try {
        const filename = this.getPageFilename(i);
        const response = await fetch(`/usdot-forms/${filename}?t=${Date.now()}`);
        if (response.ok) {
          const htmlContent = await response.text();
          const page: USDOTScenarioPage = {
            pageNumber,
            title: this.extractPageTitle(htmlContent),
            htmlContent,
            questionId: this.extractQuestionId(htmlContent),
            questionText: this.extractQuestionText(htmlContent),
            answerOptions: this.extractAnswerOptions(htmlContent),
            expectedAnswer: this.getExpectedAnswer(pageId, scenarioType),
            explanation: this.getPageExplanation(pageId, scenarioType)
          };
          pages.push(page);
        }
      } catch (error) {
        console.warn(`Could not load page ${i}:`, error);
      }
    }
    
    return pages;
  }

  /**
   * Get filename for page number
   */
  private getPageFilename(pageNumber: number): string {
    const filenames = [
      'page_00_landing.html', 'page_01_login.html', 'page_02_3rd_party_service_provider.html',
      'page_03_new_or_continue.html', 'page_04_introduction_info.html', 'page_05_navigation_instructions.html',
      'page_06_required_documents.html', 'page_07_financial_responsibility.html', 'page_08_process_agent_notice.html',
      'page_09_usdot_number_issuance.html', 'page_10_signature_authorization.html', 'page_11_paperwork_reduction_act.html',
      'page_12_application_id.html', 'page_13_application_contact_intro.html', 'page_14_application_contact_form.html',
      'page_15_business_description_intro.html', 'page_16_dun_bradstreet_question.html', 'page_17_legal_business_name.html',
      'page_18_dba_names.html', 'page_19_principal_address_same_as_contact.html', 'page_20_business_addresses.html',
      'page_21_business_phone_numbers.html', 'page_22_ein_ssn.html', 'page_23_unit_of_government.html',
      'page_24_form_of_business.html', 'page_25_ownership_control.html', 'page_26_proprietor_partners_names.html',
      'page_27_company_contact_address.html', 'page_28_business_description_summary.html', 'page_29_operation_classification_intro.html',
      'page_30_intermodal_equipment_provider.html', 'page_31_transport_property.html', 'page_32_for_hire_property.html',
      'page_33_property_types.html', 'page_34_interstate_commerce.html', 'page_35_transport_own_property.html',
      'page_36_transport_passengers.html', 'page_37_broker_services.html', 'page_38_freight_forwarder.html',
      'page_39_cargo_tank_facility.html', 'page_40_towaway_operation.html', 'page_41_cargo_classifications.html',
      'page_42_operation_classification_summary.html', 'page_43_vehicles_intro.html', 'page_44_non_cmv_property.html',
      'page_45_vehicle_types.html', 'page_46_canada_mexico_vehicles.html', 'page_47_interstate_only_vehicles.html',
      'page_48_intrastate_only_vehicles.html', 'page_49_vehicle_summary.html', 'page_50_drivers_intro.html',
      'page_51_interstate_drivers.html', 'page_52_intrastate_drivers.html', 'page_53_cdl_holders.html',
      'page_54_canada_mexico_drivers.html', 'page_55_driver_summary.html', 'page_56_financial_responsibility_intro.html',
      'page_57_property_10001_lbs.html', 'page_58_insurance_determination.html', 'page_59_affiliation_with_others_intro.html',
      'page_60_affiliation_relationships.html', 'page_61_affiliation_summary.html', 'page_62_certification_statement_intro.html',
      'page_63_esignature_certification.html', 'page_64_compliance_certifications_intro.html', 'page_65_dot_compliance_certification.html',
      'page_66_document_production_certification.html', 'page_67_not_disqualified_certification.html', 'page_68_process_agent_certification.html',
      'page_69_not_suspended_revoked_certification.html', 'page_70_revocation_deficiencies_corrected.html', 'page_71_compliance_certifications_esignature.html',
      'page_72_compliance_certifications_summary.html', 'page_73_applicants_oath_intro.html', 'page_74_applicants_oath_esignature.html',
      'page_75_identity_verification.html'
    ];
    
    return filenames[pageNumber] || `page_${pageNumber.toString().padStart(2, '0')}.html`;
  }

  /**
   * Extract page title from HTML
   */
  private extractPageTitle(htmlContent: string): string {
    const commentMatch = htmlContent.match(/<!--\s*FMCSA USDOT Application - ([^-]+)/);
    if (commentMatch) {
      return commentMatch[1].trim();
    }
    return 'USDOT Form Page';
  }

  /**
   * Extract question ID from HTML
   */
  private extractQuestionId(htmlContent: string): string | undefined {
    const questionIdMatch = htmlContent.match(/Question\s+([A-Z0-9]+)/);
    return questionIdMatch ? questionIdMatch[1] : undefined;
  }

  /**
   * Extract question text from HTML
   */
  private extractQuestionText(htmlContent: string): string | undefined {
    const questionMatch = htmlContent.match(/<label[^>]*class="questionDesc"[^>]*>([^<]+)/);
    return questionMatch ? questionMatch[1].trim() : undefined;
  }

  /**
   * Extract answer options from HTML
   */
  private extractAnswerOptions(htmlContent: string): string[] {
    const radioMatches = htmlContent.matchAll(/<input[^>]*type="radio"[^>]*value="([^"]+)"[^>]*>/g);
    const options: string[] = [];
    for (const match of radioMatches) {
      options.push(match[1]);
    }
    return options;
  }

  /**
   * Get expected answer for a page in a scenario
   */
  private getExpectedAnswer(pageId: string, scenarioType: string): string | undefined {
    // This would map to the expected answers based on scenario type
    // For now, return undefined
    return undefined;
  }

  /**
   * Get explanation for a page in a scenario
   */
  private getPageExplanation(pageId: string, scenarioType: string): string | undefined {
    // This would provide training explanations for each page
    // For now, return undefined
    return undefined;
  }
}
