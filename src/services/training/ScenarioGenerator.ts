/**
 * Scenario Generator Service
 * Generates complete USDOT application scenarios for training Alex
 * Each scenario includes ALL USDOT questions with realistic answers
 */

export interface USDOTApplicationScenario {
  id: string;
  
  // Operation Classification
  hasDunsBradstreet: 'Yes' | 'No';
  legalBusinessName: string;
  doingBusinessAs: string;
  principalAddressSameAsContact: 'Yes' | 'No';
  principalAddress: {
    country: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  mailingAddress: {
    country: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  businessPhone: string;
  ein: string;
  isUnitOfGovernment: 'Yes' | 'No';
  formOfBusiness: 'sole_proprietor' | 'partnership' | 'limited_liability_company' | 'corporation' | 'limited_liability_partnership' | 'trusts' | 'other';
  ownershipControl: 'us_citizen' | 'canadian_citizen' | 'mexican_citizen' | 'other_foreign';
  
  // Company Contact
  companyContact: {
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    title: string;
    email: string;
    phone: string;
    address: {
      country: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
    };
  };
  
  // Operation Type Questions
  operateAsIntermodalEquipmentProvider: 'Yes' | 'No';
  transportProperty: 'Yes' | 'No';
  receiveCompensationForTransport: 'Yes' | 'No';
  propertyType: 'hazardous_materials' | 'household_goods' | 'exempt_commodities' | 'other_non_hazardous';
  transportNonHazardousInterstate: 'Yes' | 'No';
  transportOwnProperty: 'Yes' | 'No';
  transportPassengers: 'Yes' | 'No';
  provideBrokerServices: 'Yes' | 'No';
  provideFreightForwarderServices: 'Yes' | 'No';
  operateCargoTankFacility: 'Yes' | 'No';
  operateAsDriveaway: 'Yes' | 'No';
  operateAsTowaway: 'Yes' | 'No';
  cargoClassifications: string[];
  
  // Vehicle Summary
  nonCMVProperty: number;
  vehicles: {
    straightTrucks: {
      owned: number;
      termLeased: number;
      tripLeased: number;
      towDriveway: number;
      serviced: number;
    };
    truckTractors: {
      owned: number;
      termLeased: number;
      tripLeased: number;
      towDriveway: number;
      serviced: number;
    };
    trailers: {
      owned: number;
      termLeased: number;
      tripLeased: number;
      towDriveway: number;
      serviced: number;
    };
    iepTrailerChassis: {
      owned: number;
      termLeased: number;
      tripLeased: number;
      towDriveway: number;
      serviced: number;
    };
  };
  vehiclesInCanada: number;
  vehiclesInMexico: number;
  cmvInterstateOnly: number;
  cmvIntrastateOnly: number;
  
  // Driver Summary
  driversInterstate: {
    within100Miles: number;
    beyond100Miles: number;
  };
  driversIntrastate: {
    within100Miles: number;
    beyond100Miles: number;
  };
  driversWithCDL: number;
  driversInCanada: number;
  driversInMexico: number;
  
  // Affiliation
  hasAffiliations: 'Yes' | 'No';
  
  // Compliance Certifications (all should be Yes/checked)
  certifyWillingAndAble: 'Yes';
  certifyProduceDocuments: 'Yes';
  certifyNotDisqualified: 'Yes';
  certifyUnderstandProcessAgent: 'Yes';
  certifyNotUnderSuspension: 'Yes';
  certifyDeficienciesCorrected: 'Yes';
  electronicSignature: string;
  
  // Expected Requirements (What Alex should determine)
  expectedRequirements: {
    usdotRequired: boolean;
    mcAuthorityRequired: boolean;
    hazmatEndorsementRequired: boolean;
    iftaRequired: boolean;
    stateRegistrationRequired: boolean;
    reasoning: string;
  };
  
  // Metadata
  generatedAt: string;
}

export class ScenarioGenerator {
  private static instance: ScenarioGenerator;

  // US States
  private readonly states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ];

  private readonly businessTypes: Array<'sole_proprietor' | 'partnership' | 'limited_liability_company' | 'corporation'> = [
    'sole_proprietor', 'partnership', 'limited_liability_company', 'corporation'
  ];

  private readonly companyNames = [
    'ABC Trucking', 'XYZ Logistics', 'Smith Transport', 'Jones Freight',
    'Eagle Express', 'Liberty Hauling', 'Freedom Transport', 'Pioneer Logistics',
    'Rapid Freight', 'American Transport', 'United Cargo', 'National Haulers'
  ];

  private readonly firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jennifer'];
  private readonly lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

  private constructor() {}

  public static getInstance(): ScenarioGenerator {
    if (!ScenarioGenerator.instance) {
      ScenarioGenerator.instance = new ScenarioGenerator();
    }
    return ScenarioGenerator.instance;
  }

  /**
   * Generate all compliance scenarios with full USDOT applications
   */
  public async generateAllScenarios(): Promise<USDOTApplicationScenario[]> {
    console.log('🎯 Starting full scenario generation with complete USDOT applications...');
    const scenarios: USDOTApplicationScenario[] = [];
    let scenarioId = 1;

    // Generate scenarios for each state
    for (const state of this.states) {
      // For-hire interstate
      scenarios.push(...this.generateForHireInterstateScenarios(scenarioId, state));
      scenarioId += 100;

      // For-hire intrastate
      scenarios.push(...this.generateForHireIntrastateScenarios(scenarioId, state));
      scenarioId += 100;

      // Private property interstate
      scenarios.push(...this.generatePrivateInterstateScenarios(scenarioId, state));
      scenarioId += 100;

      // Private property intrastate
      scenarios.push(...this.generatePrivateIntrastateScenarios(scenarioId, state));
      scenarioId += 100;
    }

    console.log(`✅ Generated ${scenarios.length} complete USDOT application scenarios`);
    return scenarios;
  }

  /**
   * Generate for-hire interstate scenarios
   */
  private generateForHireInterstateScenarios(startId: number, state: string): USDOTApplicationScenario[] {
    const scenarios: USDOTApplicationScenario[] = [];
    let id = startId;

    // General freight scenarios
    scenarios.push(this.createScenario(id++, state, {
      isForHire: true,
      isInterstate: true,
      propertyType: 'other_non_hazardous',
      fleetSize: 'small', // 1-3 trucks
      hasHazmat: false
    }));

    scenarios.push(this.createScenario(id++, state, {
      isForHire: true,
      isInterstate: true,
      propertyType: 'other_non_hazardous',
      fleetSize: 'medium', // 4-10 trucks
      hasHazmat: false
    }));

    // Hazmat scenarios
    scenarios.push(this.createScenario(id++, state, {
      isForHire: true,
      isInterstate: true,
      propertyType: 'hazardous_materials',
      fleetSize: 'small',
      hasHazmat: true
    }));

    // Household goods
    scenarios.push(this.createScenario(id++, state, {
      isForHire: true,
      isInterstate: true,
      propertyType: 'household_goods',
      fleetSize: 'small',
      hasHazmat: false
    }));

    return scenarios;
  }

  /**
   * Generate for-hire intrastate scenarios
   */
  private generateForHireIntrastateScenarios(startId: number, state: string): USDOTApplicationScenario[] {
    const scenarios: USDOTApplicationScenario[] = [];
    let id = startId;

    scenarios.push(this.createScenario(id++, state, {
      isForHire: true,
      isInterstate: false,
      propertyType: 'other_non_hazardous',
      fleetSize: 'small',
      hasHazmat: false
    }));

    scenarios.push(this.createScenario(id++, state, {
      isForHire: true,
      isInterstate: false,
      propertyType: 'hazardous_materials',
      fleetSize: 'medium',
      hasHazmat: true
    }));

    return scenarios;
  }

  /**
   * Generate private property interstate scenarios
   */
  private generatePrivateInterstateScenarios(startId: number, state: string): USDOTApplicationScenario[] {
    const scenarios: USDOTApplicationScenario[] = [];
    let id = startId;

    scenarios.push(this.createScenario(id++, state, {
      isForHire: false,
      isInterstate: true,
      propertyType: 'other_non_hazardous',
      fleetSize: 'small',
      hasHazmat: false
    }));

    return scenarios;
  }

  /**
   * Generate private property intrastate scenarios
   */
  private generatePrivateIntrastateScenarios(startId: number, state: string): USDOTApplicationScenario[] {
    const scenarios: USDOTApplicationScenario[] = [];
    let id = startId;

    scenarios.push(this.createScenario(id++, state, {
      isForHire: false,
      isInterstate: false,
      propertyType: 'other_non_hazardous',
      fleetSize: 'small',
      hasHazmat: false
    }));

    return scenarios;
  }

  /**
   * Create a complete USDOT application scenario
   */
  private createScenario(
    id: number,
    state: string,
    config: {
      isForHire: boolean;
      isInterstate: boolean;
      propertyType: 'hazardous_materials' | 'household_goods' | 'exempt_commodities' | 'other_non_hazardous';
      fleetSize: 'small' | 'medium' | 'large';
      hasHazmat: boolean;
    }
  ): USDOTApplicationScenario {
    const companyName = this.getRandomItem(this.companyNames);
    const businessType = this.getRandomItem(this.businessTypes);
    const firstName = this.getRandomItem(this.firstNames);
    const lastName = this.getRandomItem(this.lastNames);
    
    const fleetCounts = {
      small: { owned: this.random(1, 3), leased: 0 },
      medium: { owned: this.random(4, 10), leased: this.random(0, 2) },
      large: { owned: this.random(11, 25), leased: this.random(2, 5) }
    };

    const fleet = fleetCounts[config.fleetSize];
    const totalVehicles = fleet.owned + fleet.leased;

    return {
      id: `scenario_${id.toString().padStart(6, '0')}`,
      
      // Operation Classification
      hasDunsBradstreet: 'No',
      legalBusinessName: companyName + ' LLC',
      doingBusinessAs: companyName,
      principalAddressSameAsContact: 'Yes',
      principalAddress: {
        country: 'United States',
        street: `${this.random(100, 9999)} Main Street`,
        city: this.getCityForState(state),
        state: state,
        postalCode: this.generateZip()
      },
      mailingAddress: {
        country: 'United States',
        street: `${this.random(100, 9999)} Main Street`,
        city: this.getCityForState(state),
        state: state,
        postalCode: this.generateZip()
      },
      businessPhone: this.generatePhone(),
      ein: this.generateEIN(),
      isUnitOfGovernment: 'No',
      formOfBusiness: businessType,
      ownershipControl: 'us_citizen',
      
      // Company Contact
      companyContact: {
        firstName,
        middleName: '',
        lastName,
        suffix: '',
        title: 'Owner',
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyName.toLowerCase().replace(/\s/g, '')}.com`,
        phone: this.generatePhone(),
        address: {
          country: 'United States',
          street: `${this.random(100, 9999)} Main Street`,
          city: this.getCityForState(state),
          state: state,
          postalCode: this.generateZip()
        }
      },
      
      // Operation Type
      operateAsIntermodalEquipmentProvider: 'No',
      transportProperty: 'Yes',
      receiveCompensationForTransport: config.isForHire ? 'Yes' : 'No',
      propertyType: config.propertyType,
      transportNonHazardousInterstate: config.isInterstate && !config.hasHazmat ? 'Yes' : 'No',
      transportOwnProperty: config.isForHire ? 'No' : 'Yes',
      transportPassengers: 'No',
      provideBrokerServices: 'No',
      provideFreightForwarderServices: 'No',
      operateCargoTankFacility: 'No',
      operateAsDriveaway: 'No',
      operateAsTowaway: 'No',
      cargoClassifications: this.getCargoClassifications(config.propertyType),
      
      // Vehicles
      nonCMVProperty: 0,
      vehicles: {
        straightTrucks: {
          owned: config.fleetSize === 'small' ? fleet.owned : 0,
          termLeased: 0,
          tripLeased: 0,
          towDriveway: 0,
          serviced: 0
        },
        truckTractors: {
          owned: config.fleetSize !== 'small' ? fleet.owned : 0,
          termLeased: fleet.leased,
          tripLeased: 0,
          towDriveway: 0,
          serviced: 0
        },
        trailers: {
          owned: config.fleetSize !== 'small' ? fleet.owned : 0,
          termLeased: fleet.leased,
          tripLeased: 0,
          towDriveway: 0,
          serviced: 0
        },
        iepTrailerChassis: {
          owned: 0,
          termLeased: 0,
          tripLeased: 0,
          towDriveway: 0,
          serviced: 0
        }
      },
      vehiclesInCanada: 0,
      vehiclesInMexico: 0,
      cmvInterstateOnly: config.isInterstate ? totalVehicles : 0,
      cmvIntrastateOnly: config.isInterstate ? 0 : totalVehicles,
      
      // Drivers
      driversInterstate: {
        within100Miles: config.isInterstate ? this.random(1, 3) : 0,
        beyond100Miles: config.isInterstate ? totalVehicles : 0
      },
      driversIntrastate: {
        within100Miles: config.isInterstate ? 0 : this.random(1, 3),
        beyond100Miles: config.isInterstate ? 0 : totalVehicles
      },
      driversWithCDL: totalVehicles,
      driversInCanada: 0,
      driversInMexico: 0,
      
      // Affiliation
      hasAffiliations: 'No',
      
      // Certifications
      certifyWillingAndAble: 'Yes',
      certifyProduceDocuments: 'Yes',
      certifyNotDisqualified: 'Yes',
      certifyUnderstandProcessAgent: 'Yes',
      certifyNotUnderSuspension: 'Yes',
      certifyDeficienciesCorrected: 'Yes',
      electronicSignature: `${firstName} ${lastName}`,
      
      // Expected requirements
      expectedRequirements: this.determineExpectedRequirements(state, config, totalVehicles),
      
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Determine what Alex should correctly identify as required
   */
  private determineExpectedRequirements(
    state: string,
    config: {
      isForHire: boolean;
      isInterstate: boolean;
      propertyType: string;
      fleetSize: string;
      hasHazmat: boolean;
    },
    vehicleCount: number
  ): USDOTApplicationScenario['expectedRequirements'] {
    let reasoning = '';
    let usdotRequired = false;
    let mcAuthorityRequired = false;
    let hazmatEndorsementRequired = false;
    let iftaRequired = false;
    let stateRegistrationRequired = false;

    if (config.isInterstate) {
      reasoning += 'Interstate operation: Federal 49 CFR applies. ';
      usdotRequired = true;
      reasoning += 'USDOT required for interstate commerce with CMVs over 10,001 lbs. ';
      
      if (config.isForHire) {
        mcAuthorityRequired = true;
        reasoning += 'MC Authority required for for-hire interstate property transport. ';
      }
      
      if (vehicleCount >= 2) {
        iftaRequired = true;
        reasoning += 'IFTA required for interstate fuel tax reporting. ';
      }
    } else {
      reasoning += `Intrastate operation in ${state}: State-specific thresholds apply (qualified states list). `;
      // This would query qualified states table in real implementation
      usdotRequired = true;
      stateRegistrationRequired = true;
    }

    if (config.hasHazmat) {
      hazmatEndorsementRequired = true;
      reasoning += 'Hazmat endorsement required for transporting hazardous materials. ';
    }

    return {
      usdotRequired,
      mcAuthorityRequired,
      hazmatEndorsementRequired,
      iftaRequired,
      stateRegistrationRequired,
      reasoning: reasoning.trim()
    };
  }

  // Helper methods
  private getRandomItem<T>(array: readonly T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generatePhone(): string {
    return `(${this.random(200, 999)}) ${this.random(200, 999)}-${this.random(1000, 9999)}`;
  }

  private generateEIN(): string {
    return `${this.random(10, 99)}-${this.random(1000000, 9999999)}`;
  }

  private generateZip(): string {
    return this.random(10000, 99999).toString();
  }

  private getCityForState(state: string): string {
    const cities: Record<string, string[]> = {
      'CA': ['Los Angeles', 'San Diego', 'San Francisco'],
      'TX': ['Houston', 'Dallas', 'Austin'],
      'FL': ['Miami', 'Tampa', 'Orlando'],
      'NY': ['New York', 'Buffalo', 'Rochester']
    };
    const stateCities = cities[state] || ['Springfield'];
    return this.getRandomItem(stateCities);
  }

  private getCargoClassifications(propertyType: string): string[] {
    const classifications: Record<string, string[]> = {
      'hazardous_materials': ['general_freight', 'hazmat'],
      'household_goods': ['household_goods'],
      'exempt_commodities': ['general_freight'],
      'other_non_hazardous': ['general_freight']
    };
    return classifications[propertyType] || ['general_freight'];
  }

  /**
   * Get total possible scenario count
   */
  public getTotalScenarioCount(): number {
    // 51 states × 4 operation types (for-hire interstate/intrastate, private interstate/intrastate) 
    // × 4 property types × 3 fleet sizes = ~2,448 base scenarios
    return 51 * 4 * 4 * 3;
  }
}

export const scenarioGenerator = ScenarioGenerator.getInstance();
