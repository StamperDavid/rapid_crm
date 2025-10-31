/**
 * USDOT Form Filler Agent
 * The ACTUAL RPA agent that analyzes scenario data and decides what to fill in each form field
 * This is the AI being trained, not a simulation
 */

export interface USDOTScenario {
  id: string;
  legalBusinessName: string;
  doingBusinessAs: string;
  formOfBusiness: string;
  ein: string;
  businessPhone: string;
  principalAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  companyContact: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
  };
  receiveCompensationForTransport: string;
  transportNonHazardousInterstate: string;
  propertyType: string;
  transportHazardousMaterials: string;
  operationType: string;
  vehicles: {
    straightTrucks: { owned: number; termLeased: number };
    truckTractors: { owned: number; termLeased: number };
    trailers: { owned: number; termLeased: number };
  };
  expectedRequirements: {
    usdotRequired: boolean;
    mcAuthorityRequired: boolean;
    hazmatEndorsementRequired: boolean;
    iftaRequired: boolean;
    stateRegistrationRequired: boolean;
    reasoning: string;
  };
}

export interface FilledFormData {
  pageNumber: number;
  pageName: string;
  fields: {
    fieldName: string;
    fieldId: string;
    value: string;
    reasoning: string; // Why the agent chose this value
    confidence: number; // 0-1, how confident the agent is
  }[];
}

export class USDOTFormFillerAgent {
  private corrections: Map<string, string[]> = new Map(); // Field corrections learned
  private knowledgeBase: Map<string, any> = new Map(); // What the agent has learned
  
  /**
   * Main method: Agent navigates through ALL 77 pages with proper branching logic
   * Simulates real-world user application flow
   */
  async fillApplication(scenario: USDOTScenario): Promise<FilledFormData[]> {
    console.log(`🤖 USDOT RPA Agent starting application navigation: ${scenario.id}`);
    console.log(`📋 Analyzing scenario to determine application path...`);
    
    const filledPages: FilledFormData[] = [];
    let currentPage = 0;
    
    // Navigate through all 77 pages (0-76) with branching logic
    while (currentPage <= 76) {
      const pageData = this.fillPage(currentPage, scenario);
      
      if (pageData) {
        filledPages.push(pageData);
        console.log(`✓ Page ${currentPage}: ${pageData.pageName} - ${pageData.fields.length} fields filled`);
      } else {
        // Navigation-only page (intro, summary, etc.) - just click Next
        filledPages.push({
          pageNumber: currentPage,
          pageName: this.getPageName(currentPage),
          fields: [] // No fields to fill, just navigate
        });
        console.log(`→ Page ${currentPage}: ${this.getPageName(currentPage)} - Navigation only`);
      }
      
      // Determine next page based on branching logic
      currentPage = this.getNextPage(currentPage, scenario, pageData);
    }
    
    console.log(`✅ Agent completed full application: ${filledPages.length} pages navigated`);
    
    return filledPages;
  }
  
  /**
   * Route to the appropriate fill method for each page
   */
  private fillPage(pageNumber: number, scenario: USDOTScenario): FilledFormData | null {
    switch (pageNumber) {
      // Page 0-1: Landing/Login - no fields
      case 0:
      case 1:
        return null;
    
    // Page 2: 3rd Party Service Provider
      case 2:
        return this.fillPage2_ThirdParty(scenario);
      
      // Page 3-11: Intro pages - no fields
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
        return null;
    
    // Page 12: Application ID
      case 12:
        return this.fillPage12_ApplicationID(scenario);
      
      // Page 13: Application Contact Intro - no fields
      case 13:
        return null;
    
    // Page 14: Application Contact Form
      case 14:
        return this.fillPage14_Contact(scenario);
      
      // Page 15: Business Description Intro - no fields
      case 15:
        return null;
      
      // Page 16-25: Business Information
      case 16:
        return this.fillPage16_DunBradstreet(scenario);
      case 17:
        return this.fillPage17_LegalName(scenario);
      case 18:
        return this.fillPage18_DBA(scenario);
      case 19:
        return this.fillPage19_AddressSame(scenario);
      case 20:
        return this.fillPage20_Addresses(scenario);
      case 21:
        return this.fillPage21_Phone(scenario);
      case 22:
        return this.fillPage22_EIN(scenario);
      case 23:
        return this.fillPage23_Government(scenario);
      case 24:
        return this.fillPage24_FormOfBusiness(scenario);
      case 25:
        return this.fillPage25_Ownership(scenario);
      
      // Page 26-28: Additional business info & summary
      case 26:
      case 27:
      case 28:
        return null; // Proprietor/Partners names, Company contact address, Summary
      
      // Page 29: Operation Classification Intro - no fields
      case 29:
        return null;
      
      // Page 30-42: Operation Classification
      case 30:
        return this.fillPage30_IEP(scenario);
      case 31:
        return this.fillPage31_TransportProperty(scenario);
      case 32:
        return this.fillPage32_ForHire(scenario);
      case 33:
        return this.fillPage33_PropertyTypes(scenario);
      case 34:
        return this.fillPage34_Interstate(scenario);
      case 35:
        return this.fillPage35_OwnProperty(scenario);
      case 36:
        return this.fillPage36_Passengers(scenario);
      case 37:
        return this.fillPage37_Broker(scenario);
      case 38:
        return this.fillPage38_FreightForwarder(scenario);
      case 39:
        return this.fillPage39_CargoTank(scenario);
      case 40:
        return this.fillPage40_Towaway(scenario);
      case 41:
        return this.fillPage41_CargoTypes(scenario);
      case 42:
        return null; // Operation Classification Summary
      
      // Page 43: Vehicles Intro - no fields
      case 43:
        return null;
      
      // Page 44-49: Vehicle Information
      case 44:
        return this.fillPage44_NonCMV(scenario);
      case 45:
        return this.fillPage45_Vehicles(scenario);
      case 46:
        return this.fillPage46_InternationalVehicles(scenario);
      case 47:
        return this.fillPage47_InterstateOnlyVehicles(scenario);
      case 48:
        return this.fillPage48_IntrastateOnlyVehicles(scenario);
      case 49:
        return null; // Vehicle Summary
      
      // Page 50: Drivers Intro - no fields
      case 50:
        return null;
      
      // Page 51-55: Driver Information
      case 51:
        return this.fillPage51_InterstateDrivers(scenario);
      case 52:
        return this.fillPage52_IntrastateDrivers(scenario);
      case 53:
        return this.fillPage53_CDL(scenario);
      case 54:
        return this.fillPage54_InternationalDrivers(scenario);
      case 55:
        return null; // Driver Summary
      
      // Page 56-58: Financial Responsibility
      case 56:
        return null; // Financial Responsibility Intro
      case 57:
        return this.fillPage57_Property10001(scenario);
      case 58:
        return null; // Insurance Determination
      
      // Page 59-61: Affiliation
      case 59:
        return null; // Affiliation Intro
      case 60:
        return this.fillPage60_Affiliations(scenario);
      case 61:
        return null; // Affiliation Summary
      
      // Page 62-64: Certification Statement
      case 62:
        return null; // Certification Statement Intro
      case 63:
        return this.fillPage63_ESignature(scenario);
      case 64:
        return null; // Compliance Certifications Intro
      
      // Page 65-72: Compliance Certifications
      case 65:
      case 66:
      case 67:
      case 68:
      case 69:
      case 70:
        const certPages = this.fillPages65to70_Certifications(scenario);
        return certPages[pageNumber - 65];
      case 71:
        return this.fillPage71_ComplianceESignature(scenario);
      case 72:
        return null; // Compliance Certifications Summary
      
      // Page 73-75: Applicant's Oath
      case 73:
        return null; // Applicant's Oath Intro
      case 74:
        return this.fillPage74_OathESignature(scenario);
      case 75:
        return null; // Identity Verification
      
      // Page 76: Final submission
      case 76:
        return null;
      
      default:
        return null;
    }
  }
  
  /**
   * Get human-readable page name
   */
  private getPageName(pageNumber: number): string {
    const pageNames: { [key: number]: string } = {
      0: 'Landing Page',
      1: 'Login',
      2: '3rd Party Service Provider',
      3: 'New or Continue Application',
      4: 'Introduction Info',
      5: 'Navigation Instructions',
      6: 'Required Documents',
      7: 'Financial Responsibility',
      8: 'Process Agent Notice',
      9: 'USDOT Number Issuance',
      10: 'Signature Authorization',
      11: 'Paperwork Reduction Act',
      12: 'Application ID',
      13: 'Application Contact Intro',
      14: 'Application Contact Form',
      15: 'Business Description Intro',
      16: 'Dun & Bradstreet',
      17: 'Legal Business Name',
      18: 'DBA Names',
      19: 'Principal Address Same',
      20: 'Business Addresses',
      21: 'Business Phone',
      22: 'EIN/SSN',
      23: 'Unit of Government',
      24: 'Form of Business',
      25: 'Ownership Control',
      26: 'Proprietor/Partners Names',
      27: 'Company Contact Address',
      28: 'Business Description Summary',
      29: 'Operation Classification Intro',
      30: 'Intermodal Equipment Provider',
      31: 'Transport Property',
      32: 'For-Hire Property',
      33: 'Property Types',
      34: 'Interstate Commerce',
      35: 'Transport Own Property',
      36: 'Transport Passengers',
      37: 'Broker Services',
      38: 'Freight Forwarder',
      39: 'Cargo Tank Facility',
      40: 'Towaway Operation',
      41: 'Cargo Classifications',
      42: 'Operation Classification Summary',
      43: 'Vehicles Intro',
      44: 'Non-CMV Property',
      45: 'Vehicle Types',
      46: 'Canada/Mexico Vehicles',
      47: 'Interstate Only Vehicles',
      48: 'Intrastate Only Vehicles',
      49: 'Vehicle Summary',
      50: 'Drivers Intro',
      51: 'Interstate Drivers',
      52: 'Intrastate Drivers',
      53: 'CDL Holders',
      54: 'Canada/Mexico Drivers',
      55: 'Driver Summary',
      56: 'Financial Responsibility Intro',
      57: 'Property 10,001+ lbs',
      58: 'Insurance Determination',
      59: 'Affiliation Intro',
      60: 'Affiliation Relationships',
      61: 'Affiliation Summary',
      62: 'Certification Statement Intro',
      63: 'E-Signature Certification',
      64: 'Compliance Certifications Intro',
      65: 'DOT Compliance Certification',
      66: 'Document Production Certification',
      67: 'Not Disqualified Certification',
      68: 'Process Agent Certification',
      69: 'Not Suspended/Revoked Certification',
      70: 'Deficiencies Corrected Certification',
      71: 'Compliance E-Signature',
      72: 'Compliance Certifications Summary',
      73: "Applicant's Oath Intro",
      74: "Applicant's Oath E-Signature",
      75: 'Identity Verification',
      76: 'Final Submission'
    };
    
    return pageNames[pageNumber] || `Page ${pageNumber}`;
  }
  
  /**
   * Determine next page based on branching logic
   * FMCSA application has conditional navigation
   */
  private getNextPage(currentPage: number, scenario: USDOTScenario, pageData: FilledFormData | null): number {
    // Default: proceed to next page
    let nextPage = currentPage + 1;
    
    // Branching logic based on answers
    switch (currentPage) {
      case 2:
        // If 3rd party provider = Yes, skip to different flow (not in our scenarios)
        // Our clients always answer No, so continue to page 3
        break;
      
      case 30:
        // If Intermodal Equipment Provider = Yes, different path
        // Our clients answer No, continue normally
        break;
      
      case 31:
        // If Transport Property = No, skip property questions
        const transportsProperty = pageData?.fields[0]?.value === 'Y';
        if (!transportsProperty) {
          nextPage = 36; // Skip to passenger transport question
        }
        break;
      
      case 36:
        // If Transport Passengers = Yes, go to passenger flow
        const transportsPassengers = pageData?.fields[0]?.value === 'Y';
        if (transportsPassengers) {
          // Would go to passenger-specific pages (not in our scenarios)
        }
        break;
      
      case 44:
        // If Non-CMV = Yes, different vehicle flow
        // Our CMV carriers answer No, continue normally
        break;
      
      case 60:
        // If Affiliations = Yes, go to affiliation details
        const hasAffiliations = pageData?.fields[0]?.value === 'Y';
        if (!hasAffiliations) {
          nextPage = 61; // Skip directly to affiliation summary
        }
        break;
    }
    
    return nextPage;
  }
  
  /**
   * Page 2: 3rd Party Service Provider
   */
  private fillPage2_ThirdParty(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 2,
      pageName: '3rd Party Service Provider',
      fields: [{
        fieldName: 'questionCode_B0011P010031S01003_Q01002',
        fieldId: 'questionCode_B0011P010031S01003_Q01002_id_N',
        value: 'N',
        reasoning: 'Our clients are never 3rd party providers - they are businesses registering for themselves',
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 12: Application ID
   */
  private fillPage12_ApplicationID(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 12,
      pageName: 'Application ID',
      fields: [{
        fieldName: 'newUserIdLabel',
        fieldId: 'newUserIdLabel',
        value: `${scenario.legalBusinessName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}${Date.now()}`,
        reasoning: 'Generate unique application ID from company name + timestamp',
        confidence: 0.9
      }]
    };
  }
  
  /**
   * Page 14: Application Contact Form
   */
  private fillPage14_Contact(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 14,
      pageName: 'Application Contact Form',
      fields: [
        {
          fieldName: 'Q03002_APP_CONT_FIRST_NAME',
          fieldId: 'Q03002_APP_CONT_FIRST_NAME',
          value: scenario.companyContact.firstName,
          reasoning: 'Direct mapping from scenario.companyContact.firstName',
          confidence: 1.0
        },
        {
          fieldName: 'Q03003_APP_CONT_LAST_NAME',
          fieldId: 'Q03003_APP_CONT_LAST_NAME',
          value: scenario.companyContact.lastName,
          reasoning: 'Direct mapping from scenario.companyContact.lastName',
          confidence: 1.0
        },
        {
          fieldName: 'Q03021_APP_CONT_TITLE',
          fieldId: 'Q03021_APP_CONT_TITLE',
          value: scenario.companyContact.title,
          reasoning: 'Direct mapping from scenario.companyContact.title',
          confidence: 1.0
        },
        {
          fieldName: 'Q03015_APP_CONT_EMAIL',
          fieldId: 'Q03015_APP_CONT_EMAIL',
          value: scenario.companyContact.email,
          reasoning: 'Direct mapping from scenario.companyContact.email',
          confidence: 1.0
        },
        {
          fieldName: 'Q03004_APP_CONT_ADDR1',
          fieldId: 'Q03004_APP_CONT_ADDR1',
          value: scenario.principalAddress.street,
          reasoning: 'Direct mapping from scenario.principalAddress.street',
          confidence: 1.0
        },
        {
          fieldName: 'Q03008_APP_CONT_CITY',
          fieldId: 'Q03008_APP_CONT_CITY',
          value: scenario.principalAddress.city,
          reasoning: 'Direct mapping from scenario.principalAddress.city',
          confidence: 1.0
        },
        {
          fieldName: 'Q03009_APP_CONT_STATE',
          fieldId: 'Q03009_APP_CONT_STATE',
          value: scenario.principalAddress.state,
          reasoning: 'Direct mapping from scenario.principalAddress.state',
          confidence: 1.0
        },
        {
          fieldName: 'Q03010_APP_CONT_POSTAL_CODE',
          fieldId: 'Q03010_APP_CONT_POSTAL_CODE',
          value: scenario.principalAddress.postalCode,
          reasoning: 'Direct mapping from scenario.principalAddress.postalCode',
          confidence: 1.0
        }
      ]
    };
  }
  
  /**
   * Page 16: Dun & Bradstreet
   */
  private fillPage16_DunBradstreet(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 16,
      pageName: 'Dun & Bradstreet',
      fields: [{
        fieldName: 'questionCode_B0041P040011S04013_Q04035',
        fieldId: 'questionCode_B0041P040011S04013_Q04035_id_N',
        value: 'N',
        reasoning: 'Most small businesses do not have D&B numbers. Default to No unless scenario specifically indicates otherwise.',
        confidence: 0.8
      }]
    };
  }
  
  /**
   * Page 17: Legal Business Name
   */
  private fillPage17_LegalName(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 17,
      pageName: 'Legal Business Name',
      fields: [{
        fieldName: 'questionCode_B0041P040061S04001_Q04001_LEGAL_BUS_NAME',
        fieldId: 'questionCode_B0041P040061S04001_Q04001_LEGAL_BUS_NAME_id',
        value: scenario.legalBusinessName,
        reasoning: 'Direct mapping from scenario.legalBusinessName',
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 18: DBA Names
   */
  private fillPage18_DBA(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 18,
      pageName: 'DBA Names',
      fields: [{
        fieldName: 'dbaName_1',
        fieldId: 'dbaName_1_id',
        value: scenario.doingBusinessAs,
        reasoning: 'Direct mapping from scenario.doingBusinessAs',
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 19: Principal Address Same as Contact
   */
  private fillPage19_AddressSame(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 19,
      pageName: 'Principal Address Same',
      fields: [{
        fieldName: 'questionCode_B0041P040031S04004_Q04002',
        fieldId: 'questionCode_B0041P040031S04004_Q04002_id_Y',
        value: 'Y',
        reasoning: 'Scenarios use same address for contact and principal. Default Yes.',
        confidence: 0.9
      }]
    };
  }
  
  /**
   * Page 20: Business Addresses
   */
  private fillPage20_Addresses(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 20,
      pageName: 'Business Addresses',
      fields: [
        {
          fieldName: 'Q04004_ADDRESS1',
          fieldId: 'Q04004_ADDRESS1',
          value: scenario.principalAddress.street,
          reasoning: 'Principal address street from scenario',
          confidence: 1.0
        },
        {
          fieldName: 'Q04008_CITY',
          fieldId: 'Q04008_CITY',
          value: scenario.principalAddress.city,
          reasoning: 'Principal city from scenario',
          confidence: 1.0
        },
        {
          fieldName: 'Q04009_STATE',
          fieldId: 'Q04009_STATE',
          value: scenario.principalAddress.state,
          reasoning: 'Principal state from scenario',
          confidence: 1.0
        },
        {
          fieldName: 'Q04010_POSTAL_CODE',
          fieldId: 'Q04010_POSTAL_CODE',
          value: scenario.principalAddress.postalCode,
          reasoning: 'Principal postal code from scenario',
          confidence: 1.0
        }
      ]
    };
  }
  
  /**
   * Page 21: Business Phone
   */
  private fillPage21_Phone(scenario: USDOTScenario): FilledFormData {
    // Parse phone number like "(369) 269-1169" into area code and phone parts
    const phoneMatch = scenario.businessPhone.match(/\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})/);
    const areaCode = phoneMatch ? phoneMatch[1] : '';
    const phoneNumber = phoneMatch ? `${phoneMatch[2]}${phoneMatch[3]}` : scenario.businessPhone;
    
    return {
      pageNumber: 21,
      pageName: 'Business Phone',
      fields: [
        {
          fieldName: 'questionCode_B0041P040101S04005_Q04021_BUS_TEL_NUM_acode',
          fieldId: 'questionCode_B0041P040101S04005_Q04021_BUS_TEL_NUM_acode_id',
          value: areaCode,
          reasoning: 'Area code extracted from scenario.businessPhone',
          confidence: 1.0
        },
        {
          fieldName: 'questionCode_B0041P040101S04005_Q04021_BUS_TEL_NUM_pcode',
          fieldId: 'questionCode_B0041P040101S04005_Q04021_BUS_TEL_NUM_pcode_id',
          value: phoneNumber,
          reasoning: 'Phone number extracted from scenario.businessPhone',
          confidence: 1.0
        }
      ]
    };
  }
  
  /**
   * Page 22: EIN/SSN
   */
  private fillPage22_EIN(scenario: USDOTScenario): FilledFormData {
    // Remove dashes from EIN (90-1000169 -> 901000169)
    const einClean = scenario.ein.replace(/-/g, '');
    
    return {
      pageNumber: 22,
      pageName: 'EIN/SSN',
      fields: [
        {
          fieldName: 'questionCode_B0041P040111S04006_Q04024_EIN_SSN',
          fieldId: 'questionCode_B0041P040111S04006_Q04024_EIN_SSN_id_1',
          value: '1',
          reasoning: 'Select EIN option (value=1)',
          confidence: 1.0
        },
        {
          fieldName: 'questionCode_B0041P040111S04006_Q04040',
          fieldId: 'questionCode_B0041P040111S04006_Q04040_id',
          value: einClean,
          reasoning: 'EIN from scenario (dashes removed)',
          confidence: 1.0
        }
      ]
    };
  }
  
  /**
   * Page 30: Intermodal Equipment Provider
   */
  private fillPage30_IEP(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 30,
      pageName: 'Intermodal Equipment Provider',
      fields: [{
        fieldName: 'questionCode_B0051P050011S05001_Q05002',
        fieldId: 'questionCode_B0051P050011S05001_Q05002_id_N',
        value: 'N',
        reasoning: 'Our clients are transportation companies, not IEP providers',
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 31: Transport Property
   */
  private fillPage31_TransportProperty(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 31,
      pageName: 'Transport Property',
      fields: [{
        fieldName: 'questionCode_B0051P050031S05002_Q05004',
        fieldId: 'questionCode_B0051P050031S05002_Q05004_id_Y',
        value: 'Y',
        reasoning: 'Property carriers transport goods - always Yes for our clients',
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 32: For-Hire Property
   */
  private fillPage32_ForHire(scenario: USDOTScenario): FilledFormData {
    const isForHire = scenario.receiveCompensationForTransport === 'Yes';
    return {
      pageNumber: 32,
      pageName: 'For-Hire Property',
      fields: [{
        fieldName: 'questionCode_B0051P050051S05003_Q05006',
        fieldId: `questionCode_B0051P050051S05003_Q05006_id_${isForHire ? 'Y' : 'N'}`,
        value: isForHire ? 'Y' : 'N',
        reasoning: `Based on scenario.receiveCompensationForTransport = "${scenario.receiveCompensationForTransport}"`,
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 34: Interstate Commerce
   */
  private fillPage34_Interstate(scenario: USDOTScenario): FilledFormData {
    const isInterstate = scenario.transportNonHazardousInterstate === 'Yes';
    return {
      pageNumber: 34,
      pageName: 'Interstate Commerce',
      fields: [{
        fieldName: 'questionCode_B0051P050091S05012_Q05041',
        fieldId: `questionCode_B0051P050091S05012_Q05041_id_${isInterstate ? 'Y' : 'N'}`,
        value: isInterstate ? 'Y' : 'N',
        reasoning: `Based on scenario.transportNonHazardousInterstate = "${scenario.transportNonHazardousInterstate}"`,
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 36: Transport Passengers
   */
  private fillPage36_Passengers(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 36,
      pageName: 'Transport Passengers',
      fields: [{
        fieldName: 'questionCode_B0051P050131S05013_Q05044',
        fieldId: 'questionCode_B0051P050131S05013_Q05044_id_N',
        value: 'N',
        reasoning: 'Property carriers, not passenger carriers. Default No.',
        confidence: 0.95
      }]
    };
  }
  
  /**
   * Page 45: Vehicle Types
   */
  private fillPage45_Vehicles(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 45,
      pageName: 'Vehicle Types',
      fields: [
        {
          fieldName: 'questionCode_B0061P060021S06004_Q06001_STRAIGHT_TRUCK_OWNED',
          fieldId: 'questionCode_B0061P060021S06004_Q06001_STRAIGHT_TRUCK_OWNED_id',
          value: scenario.vehicles.straightTrucks.owned.toString(),
          reasoning: 'From scenario.vehicles.straightTrucks.owned',
          confidence: 1.0
        },
        {
          fieldName: 'questionCode_B0061P060021S06004_Q06002_STRAIGHT_TRUCK_TERMLEASED',
          fieldId: 'questionCode_B0061P060021S06004_Q06002_STRAIGHT_TRUCK_TERMLEASED_id',
          value: scenario.vehicles.straightTrucks.termLeased.toString(),
          reasoning: 'From scenario.vehicles.straightTrucks.termLeased',
          confidence: 1.0
        },
        {
          fieldName: 'questionCode_B0061P060021S06042_Q06005_TRUCK_TRACTOR_OWNED',
          fieldId: 'questionCode_B0061P060021S06042_Q06005_TRUCK_TRACTOR_OWNED_id',
          value: scenario.vehicles.truckTractors.owned.toString(),
          reasoning: 'From scenario.vehicles.truckTractors.owned',
          confidence: 1.0
        },
        {
          fieldName: 'questionCode_B0061P060021S06042_Q06006_TRUCK_TRACTOR_TERMLEASED',
          fieldId: 'questionCode_B0061P060021S06042_Q06006_TRUCK_TRACTOR_TERMLEASED_id',
          value: scenario.vehicles.truckTractors.termLeased.toString(),
          reasoning: 'From scenario.vehicles.truckTractors.termLeased',
          confidence: 1.0
        },
        {
          fieldName: 'questionCode_B0061P060021S06043_Q06009_TRAILER_OWNED',
          fieldId: 'questionCode_B0061P060021S06043_Q06009_TRAILER_OWNED_id',
          value: scenario.vehicles.trailers.owned.toString(),
          reasoning: 'From scenario.vehicles.trailers.owned',
          confidence: 1.0
        },
        {
          fieldName: 'questionCode_B0061P060021S06043_Q06010_TRAILER_TERMLEASED',
          fieldId: 'questionCode_B0061P060021S06043_Q06010_TRAILER_TERMLEASED_id',
          value: scenario.vehicles.trailers.termLeased.toString(),
          reasoning: 'From scenario.vehicles.trailers.termLeased',
          confidence: 1.0
        }
      ]
    };
  }
  
  /**
   * Page 51: Interstate Drivers
   */
  private fillPage51_InterstateDrivers(scenario: USDOTScenario): FilledFormData {
    // Agent makes a decision: if interstate, split drivers between 100mi and beyond
    const isInterstate = scenario.transportNonHazardousInterstate === 'Yes';
    const totalVehicles = scenario.vehicles.straightTrucks.owned + scenario.vehicles.truckTractors.owned;
    const estimatedDrivers = totalVehicles; // 1 driver per vehicle estimate
    
    if (isInterstate) {
      const drivers100 = Math.floor(estimatedDrivers * 0.3); // 30% local
      const driversBeyond = estimatedDrivers - drivers100; // 70% long haul
      
      return {
        pageNumber: 51,
        pageName: 'Interstate Drivers',
        fields: [
          {
            fieldName: 'questionCode_B0071P070021S07002_Q07001',
            fieldId: 'questionCode_B0071P070021S07002_Q07001_id',
            value: drivers100.toString(),
            reasoning: `Estimated 30% of ${estimatedDrivers} drivers operate locally (100mi radius)`,
            confidence: 0.7
          },
          {
            fieldName: 'questionCode_B0071P070021S07002_Q07002',
            fieldId: 'questionCode_B0071P070021S07002_Q07002_id',
            value: driversBeyond.toString(),
            reasoning: `Estimated 70% of ${estimatedDrivers} drivers operate beyond 100mi radius`,
            confidence: 0.7
          }
        ]
      };
    } else {
      return {
        pageNumber: 51,
        pageName: 'Interstate Drivers',
        fields: [
          {
            fieldName: 'questionCode_B0071P070021S07002_Q07001',
            fieldId: 'questionCode_B0071P070021S07002_Q07001_id',
            value: '0',
            reasoning: 'Intrastate only operation - no interstate drivers',
            confidence: 1.0
          },
          {
            fieldName: 'questionCode_B0071P070021S07002_Q07002',
            fieldId: 'questionCode_B0071P070021S07002_Q07002_id',
            value: '0',
            reasoning: 'Intrastate only operation - no interstate drivers',
            confidence: 1.0
          }
        ]
      };
    }
  }
  
  /**
   * Page 53: CDL Holders
   */
  private fillPage53_CDL(scenario: USDOTScenario): FilledFormData {
    // Agent decides: CMVs require CDL, so CDL drivers = total vehicles
    const totalVehicles = scenario.vehicles.straightTrucks.owned + scenario.vehicles.truckTractors.owned;
    
    return {
      pageNumber: 53,
      pageName: 'CDL Holders',
      fields: [{
        fieldName: 'questionCode_B0071P070061S07004_Q07005',
        fieldId: 'questionCode_B0071P070061S07004_Q07005_id',
        value: totalVehicles.toString(),
        reasoning: `CMVs require CDL. Total CMVs (${totalVehicles}) = estimated CDL drivers`,
        confidence: 0.8
      }]
    };
  }
  
  /**
   * Page 60: Affiliations
   */
  private fillPage60_Affiliations(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 60,
      pageName: 'Affiliation Relationships',
      fields: [{
        fieldName: 'questionCode_B0141P140021S14002_Q14002',
        fieldId: 'questionCode_B0141P140021S14002_Q14002_id_N',
        value: 'N',
        reasoning: 'Default to no affiliations unless scenario specifies',
        confidence: 0.9
      }]
    };
  }
  
  /**
   * Page 23: Unit of Government
   */
  private fillPage23_Government(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 23,
      pageName: 'Unit of Government',
      fields: [{
        fieldName: 'questionCode_B0041P040121S04007_Q04026',
        fieldId: 'questionCode_B0041P040121S04007_Q04026_id_N',
        value: 'N',
        reasoning: 'Commercial trucking companies are not government units',
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 24: Form of Business
   */
  private fillPage24_FormOfBusiness(scenario: USDOTScenario): FilledFormData {
    // Map form of business to FMCSA codes
    const formMap: { [key: string]: string } = {
      'sole_proprietor': '1',
      'partnership': '2',
      'limited_liability_company': '3',
      'corporation': '4',
      'other': '5'
    };
    
    const formCode = formMap[scenario.formOfBusiness.toLowerCase().replace(/\s+/g, '_')] || '3';
    
    return {
      pageNumber: 24,
      pageName: 'Form of Business',
      fields: [{
        fieldName: 'questionCode_B0041P040131S04008_Q04027',
        fieldId: `questionCode_B0041P040131S04008_Q04027_id_${formCode}`,
        value: formCode,
        reasoning: `Business type: ${scenario.formOfBusiness}`,
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 25: Ownership Control
   */
  private fillPage25_Ownership(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 25,
      pageName: 'Ownership and Control',
      fields: [{
        fieldName: 'questionCode_B0041P040141S04009_Q04028',
        fieldId: 'questionCode_B0041P040141S04009_Q04028_id_1',
        value: '1',
        reasoning: 'Ownership controlled by individual(s)',
        confidence: 0.9
      }]
    };
  }
  
  /**
   * Page 33: Property Types
   */
  private fillPage33_PropertyTypes(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 33,
      pageName: 'Property Types',
      fields: [{
        fieldName: 'questionCode_B0051P050061S05007_Q05011',
        fieldId: 'questionCode_B0051P050061S05007_Q05011_id_1',
        value: '1',
        reasoning: 'General freight is the most common cargo type',
        confidence: 0.9
      }]
    };
  }
  
  /**
   * Page 35: Transport Own Property
   */
  private fillPage35_OwnProperty(scenario: USDOTScenario): FilledFormData {
    const transportOwnProperty = scenario.receiveCompensationForTransport === 'No';
    return {
      pageNumber: 35,
      pageName: 'Transport Own Property',
      fields: [{
        fieldName: 'questionCode_B0051P050111S05011_Q05042',
        fieldId: `questionCode_B0051P050111S05011_Q05042_id_${transportOwnProperty ? 'Y' : 'N'}`,
        value: transportOwnProperty ? 'Y' : 'N',
        reasoning: `If not for-hire, then transporting own property: ${transportOwnProperty}`,
        confidence: 0.95
      }]
    };
  }
  
  /**
   * Page 37: Broker Services
   */
  private fillPage37_Broker(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 37,
      pageName: 'Broker Services',
      fields: [{
        fieldName: 'questionCode_B0051P050151S05014_Q05045',
        fieldId: 'questionCode_B0051P050151S05014_Q05045_id_N',
        value: 'N',
        reasoning: 'Carriers transport goods, not arrange transportation (brokering)',
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 38: Freight Forwarder
   */
  private fillPage38_FreightForwarder(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 38,
      pageName: 'Freight Forwarder',
      fields: [{
        fieldName: 'questionCode_B0051P050171S05015_Q05046',
        fieldId: 'questionCode_B0051P050171S05015_Q05046_id_N',
        value: 'N',
        reasoning: 'Direct carriers, not freight forwarders',
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 39: Cargo Tank Facility
   */
  private fillPage39_CargoTank(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 39,
      pageName: 'Cargo Tank Facility',
      fields: [{
        fieldName: 'questionCode_B0051P050191S05016_Q05047',
        fieldId: 'questionCode_B0051P050191S05016_Q05047_id_N',
        value: 'N',
        reasoning: 'General freight carriers do not operate cargo tank facilities',
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 40: Towaway Operation
   */
  private fillPage40_Towaway(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 40,
      pageName: 'Towaway Operation',
      fields: [{
        fieldName: 'questionCode_B0051P050211S05017_Q05048',
        fieldId: 'questionCode_B0051P050211S05017_Q05048_id_N',
        value: 'N',
        reasoning: 'Not a towaway operation',
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 41: Cargo Classifications
   */
  private fillPage41_CargoTypes(scenario: USDOTScenario): FilledFormData {
    const hasHazmat = scenario.transportHazardousMaterials === 'Yes';
    return {
      pageNumber: 41,
      pageName: 'Cargo Classifications',
      fields: [{
        fieldName: 'questionCode_B0051P050231S05018_Q05049',
        fieldId: `questionCode_B0051P050231S05018_Q05049_id_${hasHazmat ? 'Y' : 'N'}`,
        value: hasHazmat ? 'Y' : 'N',
        reasoning: `Hazmat transportation: ${scenario.transportHazardousMaterials}`,
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 44: Non-CMV Property
   */
  private fillPage44_NonCMV(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 44,
      pageName: 'Non-CMV Property',
      fields: [{
        fieldName: 'questionCode_B0061P060011S06001_Q06015',
        fieldId: 'questionCode_B0061P060011S06001_Q06015_id_N',
        value: 'N',
        reasoning: 'CMV carriers only - no non-CMV vehicles',
        confidence: 0.95
      }]
    };
  }
  
  /**
   * Page 46: Canada/Mexico Vehicles
   */
  private fillPage46_InternationalVehicles(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 46,
      pageName: 'Canada/Mexico Vehicles',
      fields: [
        {
          fieldName: 'questionCode_B0061P060031S06005_Q06011',
          fieldId: 'questionCode_B0061P060031S06005_Q06011_id',
          value: '0',
          reasoning: 'No vehicles operating in Canada',
          confidence: 0.9
        },
        {
          fieldName: 'questionCode_B0061P060031S06005_Q06012',
          fieldId: 'questionCode_B0061P060031S06005_Q06012_id',
          value: '0',
          reasoning: 'No vehicles operating in Mexico',
          confidence: 0.9
        }
      ]
    };
  }
  
  /**
   * Page 47: Interstate Only Vehicles
   */
  private fillPage47_InterstateOnlyVehicles(scenario: USDOTScenario): FilledFormData {
    const isInterstate = scenario.transportNonHazardousInterstate === 'Yes';
    const totalVehicles = scenario.vehicles.straightTrucks.owned + scenario.vehicles.truckTractors.owned;
    
    return {
      pageNumber: 47,
      pageName: 'Interstate Only Vehicles',
      fields: [{
        fieldName: 'questionCode_B0061P060041S06006_Q06013',
        fieldId: 'questionCode_B0061P060041S06006_Q06013_id',
        value: isInterstate ? totalVehicles.toString() : '0',
        reasoning: `Interstate operation: ${isInterstate}, vehicles: ${totalVehicles}`,
        confidence: 0.9
      }]
    };
  }
  
  /**
   * Page 48: Intrastate Only Vehicles
   */
  private fillPage48_IntrastateOnlyVehicles(scenario: USDOTScenario): FilledFormData {
    const isIntrastate = scenario.transportNonHazardousInterstate === 'No';
    const totalVehicles = scenario.vehicles.straightTrucks.owned + scenario.vehicles.truckTractors.owned;
    
    return {
      pageNumber: 48,
      pageName: 'Intrastate Only Vehicles',
      fields: [{
        fieldName: 'questionCode_B0061P060051S06007_Q06014',
        fieldId: 'questionCode_B0061P060051S06007_Q06014_id',
        value: isIntrastate ? totalVehicles.toString() : '0',
        reasoning: `Intrastate operation: ${isIntrastate}, vehicles: ${totalVehicles}`,
        confidence: 0.9
      }]
    };
  }
  
  /**
   * Page 52: Intrastate Drivers
   */
  private fillPage52_IntrastateDrivers(scenario: USDOTScenario): FilledFormData {
    const isIntrastate = scenario.transportNonHazardousInterstate === 'No';
    const totalVehicles = scenario.vehicles.straightTrucks.owned + scenario.vehicles.truckTractors.owned;
    const estimatedDrivers = totalVehicles;
    
    if (isIntrastate) {
      const drivers100 = Math.floor(estimatedDrivers * 0.4);
      const driversBeyond = estimatedDrivers - drivers100;
      
      return {
        pageNumber: 52,
        pageName: 'Intrastate Drivers',
        fields: [
          {
            fieldName: 'questionCode_B0071P070041S07003_Q07003',
            fieldId: 'questionCode_B0071P070041S07003_Q07003_id',
            value: drivers100.toString(),
            reasoning: `Estimated 40% of ${estimatedDrivers} intrastate drivers operate locally (100mi)`,
            confidence: 0.7
          },
          {
            fieldName: 'questionCode_B0071P070041S07003_Q07004',
            fieldId: 'questionCode_B0071P070041S07003_Q07004_id',
            value: driversBeyond.toString(),
            reasoning: `Estimated 60% of ${estimatedDrivers} intrastate drivers operate beyond 100mi`,
            confidence: 0.7
          }
        ]
      };
    } else {
      return {
        pageNumber: 52,
        pageName: 'Intrastate Drivers',
        fields: [
          {
            fieldName: 'questionCode_B0071P070041S07003_Q07003',
            fieldId: 'questionCode_B0071P070041S07003_Q07003_id',
            value: '0',
            reasoning: 'Interstate only operation - no intrastate drivers',
            confidence: 1.0
          },
          {
            fieldName: 'questionCode_B0071P070041S07003_Q07004',
            fieldId: 'questionCode_B0071P070041S07003_Q07004_id',
            value: '0',
            reasoning: 'Interstate only operation - no intrastate drivers',
            confidence: 1.0
          }
        ]
      };
    }
  }
  
  /**
   * Page 54: Canada/Mexico Drivers
   */
  private fillPage54_InternationalDrivers(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 54,
      pageName: 'Canada/Mexico Drivers',
      fields: [
        {
          fieldName: 'questionCode_B0071P070081S07005_Q07006',
          fieldId: 'questionCode_B0071P070081S07005_Q07006_id',
          value: '0',
          reasoning: 'No drivers operating in Canada',
          confidence: 0.9
        },
        {
          fieldName: 'questionCode_B0071P070081S07005_Q07007',
          fieldId: 'questionCode_B0071P070081S07005_Q07007_id',
          value: '0',
          reasoning: 'No drivers operating in Mexico',
          confidence: 0.9
        }
      ]
    };
  }
  
  /**
   * Page 57: Property 10,001+ lbs
   */
  private fillPage57_Property10001(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 57,
      pageName: 'Property 10,001+ lbs',
      fields: [{
        fieldName: 'questionCode_B0081P080011S08001_Q08001',
        fieldId: 'questionCode_B0081P080011S08001_Q08001_id_Y',
        value: 'Y',
        reasoning: 'CMVs are over 10,001 lbs, require insurance',
        confidence: 1.0
      }]
    };
  }
  
  /**
   * Page 63: E-Signature Certification
   * SIGNED BY CLIENT (company contact) - they certify the information is accurate
   */
  private fillPage63_ESignature(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 63,
      pageName: 'E-Signature Certification',
      fields: [
        {
          fieldName: 'certification_esignature_first_name',
          fieldId: 'certification_esignature_first_name_id',
          value: scenario.companyContact.firstName,
          reasoning: 'Company contact first name certifying application accuracy',
          confidence: 1.0
        },
        {
          fieldName: 'certification_esignature_last_name',
          fieldId: 'certification_esignature_last_name_id',
          value: scenario.companyContact.lastName,
          reasoning: 'Company contact last name',
          confidence: 1.0
        },
        {
          fieldName: 'certification_title',
          fieldId: 'certification_title_id',
          value: scenario.companyContact.title,
          reasoning: 'Company contact title',
          confidence: 1.0
        },
        {
          fieldName: 'certification_date',
          fieldId: 'certification_date_id',
          value: new Date().toLocaleDateString('en-US'),
          reasoning: 'Current date of certification',
          confidence: 1.0
        }
      ]
    };
  }
  
  /**
   * Pages 65-70: Compliance Certifications
   */
  private fillPages65to70_Certifications(scenario: USDOTScenario): FilledFormData[] {
    return [
      {
        pageNumber: 65,
        pageName: 'DOT Compliance Certification',
        fields: [{
          fieldName: 'questionCode_B0161P160021S16002_Q16002',
          fieldId: 'questionCode_B0161P160021S16002_Q16002_id_Y',
          value: 'Y',
          reasoning: 'Certify willing and able to comply with DOT regulations',
          confidence: 1.0
        }]
      },
      {
        pageNumber: 66,
        pageName: 'Document Production Certification',
        fields: [{
          fieldName: 'questionCode_B0161P160031S16003_Q16003',
          fieldId: 'questionCode_B0161P160031S16003_Q16003_id_Y',
          value: 'Y',
          reasoning: 'Certify willing to produce documents within 48 hours',
          confidence: 1.0
        }]
      },
      {
        pageNumber: 67,
        pageName: 'Not Disqualified Certification',
        fields: [{
          fieldName: 'questionCode_B0161P160041S16004_Q16004',
          fieldId: 'questionCode_B0161P160041S16004_Q16004_id_Y',
          value: 'Y',
          reasoning: 'Certify not disqualified',
          confidence: 1.0
        }]
      },
      {
        pageNumber: 68,
        pageName: 'Process Agent Certification',
        fields: [{
          fieldName: 'questionCode_B0161P160051S16005_Q16005',
          fieldId: 'questionCode_B0161P160051S16005_Q16005_id_Y',
          value: 'Y',
          reasoning: 'Certify will designate process agent',
          confidence: 1.0
        }]
      },
      {
        pageNumber: 69,
        pageName: 'Not Suspended/Revoked Certification',
        fields: [{
          fieldName: 'questionCode_B0161P160061S16006_Q16006',
          fieldId: 'questionCode_B0161P160061S16006_Q16006_id_Y',
          value: 'Y',
          reasoning: 'Certify not suspended or revoked',
          confidence: 1.0
        }]
      },
      {
        pageNumber: 70,
        pageName: 'Deficiencies Corrected Certification',
        fields: [{
          fieldName: 'questionCode_B0161P160071S16007_Q16007',
          fieldId: 'questionCode_B0161P160071S16007_Q16007_id_Y',
          value: 'Y',
          reasoning: 'Certify deficiencies corrected',
          confidence: 1.0
        }]
      }
    ];
  }
  
  /**
   * Page 71: Compliance E-Signature
   * SIGNED BY CLIENT (company contact) - they certify compliance commitments
   */
  private fillPage71_ComplianceESignature(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 71,
      pageName: 'Compliance E-Signature',
      fields: [
        {
          fieldName: 'compliance_esignature_first_name',
          fieldId: 'compliance_esignature_first_name_id',
          value: scenario.companyContact.firstName,
          reasoning: 'Company contact certifying compliance with DOT regulations',
          confidence: 1.0
        },
        {
          fieldName: 'compliance_esignature_last_name',
          fieldId: 'compliance_esignature_last_name_id',
          value: scenario.companyContact.lastName,
          reasoning: 'Company contact last name',
          confidence: 1.0
        },
        {
          fieldName: 'compliance_title',
          fieldId: 'compliance_title_id',
          value: scenario.companyContact.title,
          reasoning: 'Company contact title',
          confidence: 1.0
        },
        {
          fieldName: 'compliance_date',
          fieldId: 'compliance_date_id',
          value: new Date().toLocaleDateString('en-US'),
          reasoning: 'Current date of compliance certification',
          confidence: 1.0
        }
      ]
    };
  }
  
  /**
   * Page 74: Applicant's Oath E-Signature
   * SIGNED BY RAPID COMPLIANCE (the service provider), not the client
   */
  private fillPage74_OathESignature(scenario: USDOTScenario): FilledFormData {
    return {
      pageNumber: 74,
      pageName: "Applicant's Oath E-Signature",
      fields: [
        {
          fieldName: 'oath_esignature_first_name',
          fieldId: 'oath_esignature_first_name_id',
          value: 'David',
          reasoning: 'Rapid Compliance representative signing on behalf of client',
          confidence: 1.0
        },
        {
          fieldName: 'oath_esignature_last_name',
          fieldId: 'oath_esignature_last_name_id',
          value: 'Johnson',
          reasoning: 'Rapid Compliance representative last name',
          confidence: 1.0
        },
        {
          fieldName: 'oath_esignature_title',
          fieldId: 'oath_esignature_title_id',
          value: 'Compliance Specialist',
          reasoning: 'Title at Rapid Compliance',
          confidence: 1.0
        },
        {
          fieldName: 'oath_company_name',
          fieldId: 'oath_company_name_id',
          value: 'Rapid Compliance Services',
          reasoning: 'Service provider company name',
          confidence: 1.0
        },
        {
          fieldName: 'oath_date',
          fieldId: 'oath_date_id',
          value: new Date().toLocaleDateString('en-US'),
          reasoning: 'Current date when filing application',
          confidence: 1.0
        }
      ]
    };
  }
  
  /**
   * Learn from correction
   */
  public learnFromCorrection(
    fieldName: string,
    correctValue: string,
    explanation: string,
    scenarioContext: any
  ): void {
    console.log(`📚 Agent learning: ${fieldName} should be "${correctValue}"`);
    console.log(`   Explanation: ${explanation}`);
    
    // Store correction
    if (!this.corrections.has(fieldName)) {
      this.corrections.set(fieldName, []);
    }
    this.corrections.get(fieldName)!.push(explanation);
    
    // Update knowledge base with pattern
    this.knowledgeBase.set(`correction_${fieldName}_${Date.now()}`, {
      field: fieldName,
      correctValue,
      explanation,
      context: scenarioContext,
      learnedAt: new Date().toISOString()
    });
  }
  
  /**
   * Get agent's current knowledge
   */
  public getKnowledgeBase(): any {
    return {
      totalCorrections: this.corrections.size,
      fieldsMastered: Array.from(this.corrections.keys()),
      knowledge: Array.from(this.knowledgeBase.values())
    };
  }
}

// Singleton instance
export const usdotFormFillerAgent = new USDOTFormFillerAgent();


