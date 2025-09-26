/**
 * ONBOARDING AGENT TRAINING SCENARIO GENERATOR
 * 
 * Generates realistic fake clients for Regulation Training of the onboarding agent
 * Based on the actual USDOT application form requirements
 */

import { RegulatoryKnowledgeBase } from './RegulatoryKnowledgeBase';

export interface FakeClient {
  id: string;
  // Business Information
  legalBusinessName: string;
  dbaName?: string;
  principalAddress: Address;
  mailingAddress?: Address;
  phoneNumber: string;
  einOrSsn: string;
  dunBradstreetNumber?: string;
  
  // Business Classification
  isGovernmentUnit: boolean;
  businessForm: BusinessForm;
  ownership: OwnershipType;
  
  // Company Contact
  contact: CompanyContact;
  
  // Operations
  operations: Operations;
  
  // Vehicles
  vehicles: VehicleInfo;
  
  // Drivers
  drivers: DriverInfo;
  
  // Expected Outcomes
  expectedServices: string[];
  expectedRevenue: number;
  complexity: 'simple' | 'intermediate' | 'complex' | 'expert';
  
  // Training Metadata
  scenario: string;
  difficulty: number; // 1-10
  createdAt: Date;
}

export interface Address {
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface CompanyContact {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  title: string;
  email: string;
  phoneNumber: string;
  address: Address;
}

export type BusinessForm = 
  | 'sole_proprietor'
  | 'partnership'
  | 'limited_liability_company'
  | 'corporation'
  | 'limited_liability_partnership'
  | 'trust'
  | 'other';

export type OwnershipType = 
  | 'us_citizen'
  | 'canadian_citizen'
  | 'mexican_citizen'
  | 'other_foreign';

export type WeightClass = 
  | 'light'      // Under 26,000 lbs
  | 'medium'     // 26,000-33,000 lbs
  | 'heavy'      // Over 26,000 lbs (interstate)
  | 'mixed'      // Multiple weight classes
  | 'none';      // No vehicles (broker)

export interface Operations {
  // Service Types
  isIntermodalEquipmentProvider: boolean;
  transportsProperty: boolean;
  receivesCompensation: boolean;
  propertyType: 'hazardous_materials' | 'household_goods' | 'exempt_commodities' | 'other_freight';
  transportsInterstate: boolean;
  transportsOwnProperty: boolean;
  transportsPassengers: boolean;
  providesBrokerServices: boolean;
  providesFreightForwarderServices: boolean;
  operatesCargoTankFacility: boolean;
  operatesDriveaway: boolean;
  operatesTowaway: boolean;
  cargoClassifications: string[];
}

export interface VehicleInfo {
  nonCmvProperty: number;
  vehicles: {
    straightTrucks: { owned: number; termLeased: number; tripLeased: number; towDriveaway: number };
    truckTractors: { owned: number; termLeased: number; tripLeased: number; towDriveaway: number };
    trailers: { owned: number; termLeased: number; tripLeased: number; towDriveaway: number };
    iepTrailerChassis: { owned: number; termLeased: number; tripLeased: number; towDriveaway: number; serviced: number };
  };
  canadaVehicles: number;
  mexicoVehicles: number;
  interstateVehicles: number;
  intrastateVehicles: number;
}

export interface DriverInfo {
  interstateDrivers: {
    within100Miles: number;
    beyond100Miles: number;
  };
  intrastateDrivers: {
    within100Miles: number;
    beyond100Miles: number;
  };
  cdlDrivers: number;
  canadaDrivers: number;
  mexicoDrivers: number;
}

export class ScenarioGenerator {
  private static instance: ScenarioGenerator;
  private scenarioTemplates: any[] = [];
  private regulatoryKB: RegulatoryKnowledgeBase;

  private constructor() {
    this.regulatoryKB = RegulatoryKnowledgeBase.getInstance();
    this.initializeScenarioTemplates();
  }

  public static getInstance(): ScenarioGenerator {
    if (!ScenarioGenerator.instance) {
      ScenarioGenerator.instance = new ScenarioGenerator();
    }
    return ScenarioGenerator.instance;
  }

  /**
   * Generate a random fake client based on scenario templates
   */
  public generateFakeClient(scenarioType?: string): FakeClient {
    const template = this.getRandomTemplate(scenarioType);
    return this.createClientFromTemplate(template);
  }

  /**
   * Generate multiple fake clients for training
   */
  public generateTrainingBatch(count: number, scenarioTypes?: string[]): FakeClient[] {
    const clients: FakeClient[] = [];
    
    for (let i = 0; i < count; i++) {
      const scenarioType = scenarioTypes ? 
        scenarioTypes[Math.floor(Math.random() * scenarioTypes.length)] : 
        undefined;
      
      clients.push(this.generateFakeClient(scenarioType));
    }
    
    return clients;
  }

  /**
   * Generate a specific scenario type
   */
  public generateScenario(scenarioType: string): FakeClient {
    const template = this.scenarioTemplates.find(t => t.type === scenarioType);
    if (!template) {
      throw new Error(`Scenario type "${scenarioType}" not found`);
    }
    
    return this.createClientFromTemplate(template);
  }

  /**
   * Set qualified states for regulatory testing
   */
  public setQualifiedStates(qualifiedStates: any[]): void {
    this.regulatoryKB.setQualifiedStates(qualifiedStates);
  }

  /**
   * Add regulatory testing scenarios that test qualified states logic
   */
  private addRegulatoryTestingScenarios(): any[] {
    return [
      // Qualified State Testing Scenarios
      {
        type: 'qualified_state_under_threshold',
        name: 'Qualified State - Under Threshold',
        description: 'Vehicle under qualified state GVWR threshold - should NOT require USDOT',
        difficulty: 3,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: false,
          propertyType: 'other_freight',
          cargoClassifications: ['general_freight']
        },
        vehicles: {
          straightTrucks: { owned: 1, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: [], // Should NOT need USDOT if under qualified state threshold
        businessForm: 'sole_proprietor',
        weightClass: 'light',
        testScenario: true,
        regulatoryTest: {
          gvwr: 8000, // Under typical qualified state threshold
          passengers: 8, // Under passenger threshold
          interstate: false,
          forHire: true,
          hazmat: false,
          stateCode: 'TX', // Example qualified state
          expectedResult: 'no_usdot_required'
        }
      },
      {
        type: 'qualified_state_over_threshold',
        name: 'Qualified State - Over Threshold',
        description: 'Vehicle over qualified state GVWR threshold - SHOULD require USDOT',
        difficulty: 3,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: false,
          propertyType: 'other_freight',
          cargoClassifications: ['general_freight']
        },
        vehicles: {
          straightTrucks: { owned: 1, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['USDOT'], // Should need USDOT if over qualified state threshold
        businessForm: 'limited_liability_company',
        weightClass: 'medium',
        testScenario: true,
        regulatoryTest: {
          gvwr: 15000, // Over typical qualified state threshold
          passengers: 8,
          interstate: false,
          forHire: true,
          hazmat: false,
          stateCode: 'TX', // Example qualified state
          expectedResult: 'usdot_required'
        }
      },
      {
        type: 'qualified_state_passenger_threshold',
        name: 'Qualified State - Passenger Threshold',
        description: 'Vehicle meeting qualified state passenger threshold - SHOULD require USDOT',
        difficulty: 3,
        operations: {
          transportsPassengers: true,
          receivesCompensation: true,
          transportsInterstate: false,
          cargoClassifications: ['passengers']
        },
        vehicles: {
          straightTrucks: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          buses: { owned: 1, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['USDOT'], // Should need USDOT if meets passenger threshold
        businessForm: 'corporation',
        weightClass: 'heavy',
        testScenario: true,
        regulatoryTest: {
          gvwr: 12000,
          passengers: 12, // Over typical qualified state passenger threshold
          interstate: false,
          forHire: true,
          hazmat: false,
          stateCode: 'TX', // Example qualified state
          expectedResult: 'usdot_required'
        }
      },
      {
        type: 'interstate_under_qualified_threshold',
        name: 'Interstate - Under Qualified State Threshold',
        description: 'Interstate operation but under qualified state threshold - tests priority logic',
        difficulty: 4,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true, // Interstate operation
          propertyType: 'other_freight',
          cargoClassifications: ['general_freight']
        },
        vehicles: {
          straightTrucks: { owned: 1, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['USDOT'], // Interstate commerce should still require USDOT
        businessForm: 'limited_liability_company',
        weightClass: 'medium',
        testScenario: true,
        regulatoryTest: {
          gvwr: 8000, // Under qualified state threshold but interstate
          passengers: 8,
          interstate: true, // This should trigger USDOT requirement
          forHire: true,
          hazmat: false,
          stateCode: 'TX',
          expectedResult: 'usdot_required_interstate'
        }
      },
      {
        type: 'non_qualified_state_test',
        name: 'Non-Qualified State - Standard Rules',
        description: 'Operation in non-qualified state - should follow standard federal/state rules',
        difficulty: 3,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: false,
          propertyType: 'other_freight',
          cargoClassifications: ['general_freight']
        },
        vehicles: {
          straightTrucks: { owned: 1, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: [], // Should follow standard rules (likely no USDOT for under 26,000 lbs intrastate)
        businessForm: 'sole_proprietor',
        weightClass: 'light',
        testScenario: true,
        regulatoryTest: {
          gvwr: 15000, // Under standard 26,000 lbs threshold
          passengers: 8,
          interstate: false,
          forHire: true,
          hazmat: false,
          stateCode: 'WY', // Example non-qualified state
          expectedResult: 'no_usdot_required'
        }
      }
    ];
  }

  private initializeScenarioTemplates(): void {
    this.scenarioTemplates = [
      // REGULATORY TESTING SCENARIOS (Added first for priority)
      ...this.addRegulatoryTestingScenarios(),
      
      // SIMPLE SCENARIOS
      {
        type: 'light_truck_owner_operator',
        name: 'Light Truck Owner-Operator',
        description: 'Single light truck (under 26,000 lbs), local delivery',
        difficulty: 2,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: false,
          propertyType: 'other_freight',
          cargoClassifications: ['general_freight']
        },
        vehicles: {
          straightTrucks: { owned: 1, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: [], // May not need USDOT
        businessForm: 'sole_proprietor',
        weightClass: 'light'
      },
      {
        type: 'medium_truck_local',
        name: 'Medium Truck Local',
        description: 'Medium truck (26,000-33,000 lbs), local operation',
        difficulty: 3,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: false,
          propertyType: 'other_freight',
          cargoClassifications: ['general_freight']
        },
        vehicles: {
          straightTrucks: { owned: 1, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['USDOT'],
        businessForm: 'sole_proprietor',
        weightClass: 'medium'
      },
      {
        type: 'heavy_truck_interstate',
        name: 'Heavy Truck Interstate',
        description: 'Heavy truck (over 26,000 lbs), interstate commerce',
        difficulty: 4,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true,
          propertyType: 'other_freight',
          cargoClassifications: ['general_freight']
        },
        vehicles: {
          straightTrucks: { owned: 1, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['USDOT', 'IFTA'],
        businessForm: 'sole_proprietor',
        weightClass: 'heavy'
      },

      // INTERMEDIATE SCENARIOS
      {
        type: 'small_fleet_general',
        name: 'Small Fleet General Freight',
        description: '2-5 truck fleet, general freight, interstate',
        difficulty: 5,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true,
          propertyType: 'other_freight',
          cargoClassifications: ['general_freight']
        },
        vehicles: {
          straightTrucks: { owned: 2, termLeased: 1, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 1, termLeased: 1, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 2, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['USDOT', 'MC', 'IFTA'],
        businessForm: 'limited_liability_company',
        weightClass: 'mixed'
      },
      {
        type: 'household_goods_mover',
        name: 'Household Goods Mover',
        description: 'Specialized household goods transportation',
        difficulty: 6,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true,
          propertyType: 'household_goods',
          cargoClassifications: ['household_goods']
        },
        vehicles: {
          straightTrucks: { owned: 3, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 2, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 5, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['USDOT', 'MC', 'IFTA', 'ELD'],
        businessForm: 'corporation',
        weightClass: 'heavy'
      },
      {
        type: 'passenger_bus_company',
        name: 'Passenger Bus Company',
        description: 'Bus company transporting passengers interstate',
        difficulty: 6,
        operations: {
          transportsPassengers: true,
          receivesCompensation: true,
          transportsInterstate: true,
          cargoClassifications: ['passengers']
        },
        vehicles: {
          straightTrucks: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          buses: { owned: 5, termLeased: 2, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['USDOT', 'MC', 'IFTA', 'ELD'],
        businessForm: 'limited_liability_company',
        weightClass: 'heavy'
      },
      {
        type: 'freight_broker',
        name: 'Freight Broker',
        description: 'Broker-only operation, no vehicles',
        difficulty: 4,
        operations: {
          providesBrokerServices: true,
          transportsProperty: false,
          receivesCompensation: true
        },
        vehicles: {
          straightTrucks: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['MC'],
        businessForm: 'limited_liability_company',
        weightClass: 'none'
      },

      // COMPLEX SCENARIOS
      {
        type: 'hazmat_carrier',
        name: 'Hazardous Materials Carrier',
        description: 'Specialized hazardous materials transportation',
        difficulty: 8,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true,
          propertyType: 'hazardous_materials',
          cargoClassifications: ['hazardous_materials', 'liquids_gases']
        },
        vehicles: {
          straightTrucks: { owned: 2, termLeased: 1, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 4, termLeased: 2, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 6, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['USDOT', 'MC', 'IFTA', 'ELD', 'Hazmat'],
        businessForm: 'corporation',
        weightClass: 'heavy'
      },
      {
        type: 'large_fleet_mixed',
        name: 'Large Fleet Mixed Operations',
        description: '10+ vehicle fleet with mixed cargo types',
        difficulty: 9,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true,
          propertyType: 'other_freight',
          cargoClassifications: ['general_freight', 'refrigerated_food', 'building_materials', 'motor_vehicles']
        },
        vehicles: {
          straightTrucks: { owned: 5, termLeased: 3, tripLeased: 2, towDriveaway: 1 },
          truckTractors: { owned: 8, termLeased: 4, tripLeased: 1, towDriveaway: 0 },
          trailers: { owned: 12, termLeased: 2, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['USDOT', 'MC', 'IFTA', 'ELD'],
        businessForm: 'corporation',
        weightClass: 'mixed'
      },
      {
        type: 'construction_heavy',
        name: 'Construction Heavy Equipment',
        description: 'Construction company with heavy equipment transport',
        difficulty: 7,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true,
          propertyType: 'other_freight',
          cargoClassifications: ['machinery_large_objects', 'construction', 'building_materials']
        },
        vehicles: {
          straightTrucks: { owned: 3, termLeased: 0, tripLeased: 0, towDriveaway: 2 },
          truckTractors: { owned: 4, termLeased: 1, tripLeased: 0, towDriveaway: 3 },
          trailers: { owned: 6, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['USDOT', 'MC', 'IFTA', 'ELD'],
        businessForm: 'corporation',
        weightClass: 'heavy'
      },
      {
        type: 'agricultural_carrier',
        name: 'Agricultural Carrier',
        description: 'Farm and agricultural commodity transportation',
        difficulty: 6,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true,
          propertyType: 'other_freight',
          cargoClassifications: ['fresh_produce', 'grain_feed_hay', 'farm_supplies', 'livestock']
        },
        vehicles: {
          straightTrucks: { owned: 4, termLeased: 1, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 6, termLeased: 2, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 8, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['USDOT', 'MC', 'IFTA', 'ELD'],
        businessForm: 'partnership',
        weightClass: 'heavy'
      },

      // EXPERT SCENARIOS
      {
        type: 'mega_fleet_logistics',
        name: 'Mega Fleet Logistics',
        description: 'Large logistics company with 50+ vehicles',
        difficulty: 10,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true,
          providesBrokerServices: true,
          providesFreightForwarderServices: true,
          propertyType: 'other_freight',
          cargoClassifications: ['general_freight', 'intermodal_containers', 'refrigerated_food', 'motor_vehicles', 'building_materials']
        },
        vehicles: {
          straightTrucks: { owned: 15, termLeased: 10, tripLeased: 5, towDriveaway: 2 },
          truckTractors: { owned: 25, termLeased: 15, tripLeased: 8, towDriveaway: 1 },
          trailers: { owned: 35, termLeased: 10, tripLeased: 3, towDriveaway: 0 }
        },
        expectedServices: ['USDOT', 'MC', 'IFTA', 'ELD'],
        businessForm: 'corporation',
        weightClass: 'mixed'
      },
      {
        type: 'specialized_hazmat',
        name: 'Specialized Hazmat Carrier',
        description: 'High-risk hazardous materials with specialized equipment',
        difficulty: 10,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true,
          propertyType: 'hazardous_materials',
          cargoClassifications: ['hazardous_materials', 'liquids_gases', 'oil_field_equipment']
        },
        vehicles: {
          straightTrucks: { owned: 8, termLeased: 4, tripLeased: 2, towDriveaway: 1 },
          truckTractors: { owned: 12, termLeased: 6, tripLeased: 3, towDriveaway: 0 },
          trailers: { owned: 15, termLeased: 5, tripLeased: 2, towDriveaway: 0 }
        },
        expectedServices: ['USDOT', 'MC', 'IFTA', 'ELD', 'Hazmat'],
        businessForm: 'corporation',
        weightClass: 'heavy'
      },
      {
        type: 'intermodal_provider',
        name: 'Intermodal Equipment Provider',
        description: 'Specialized intermodal container and chassis provider',
        difficulty: 9,
        operations: {
          isIntermodalEquipmentProvider: true,
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true,
          propertyType: 'other_freight',
          cargoClassifications: ['intermodal_containers']
        },
        vehicles: {
          straightTrucks: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 5, termLeased: 3, tripLeased: 2, towDriveaway: 0 },
          trailers: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          iepTrailerChassis: { owned: 50, termLeased: 20, tripLeased: 10, towDriveaway: 5, serviced: 100 }
        },
        expectedServices: ['USDOT', 'MC', 'IFTA', 'ELD'],
        businessForm: 'corporation',
        weightClass: 'heavy'
      },

      // EDGE CASES
      {
        type: 'exempt_commodities',
        name: 'Exempt Commodities Only',
        description: 'Transporting only exempt commodities, may not need USDOT',
        difficulty: 5,
        operations: {
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true,
          propertyType: 'exempt_commodities',
          cargoClassifications: ['exempt_commodities']
        },
        vehicles: {
          straightTrucks: { owned: 2, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          truckTractors: { owned: 1, termLeased: 0, tripLeased: 0, towDriveaway: 0 },
          trailers: { owned: 2, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: [], // May not need USDOT
        businessForm: 'sole_proprietor',
        weightClass: 'medium'
      },
      {
        type: 'driveaway_towaway',
        name: 'Driveaway/Towaway Operation',
        description: 'Specialized vehicle delivery service',
        difficulty: 6,
        operations: {
          operatesDriveaway: true,
          operatesTowaway: true,
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true,
          cargoClassifications: ['drive_away_tow_away', 'motor_vehicles']
        },
        vehicles: {
          straightTrucks: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 5 },
          truckTractors: { owned: 3, termLeased: 2, tripLeased: 1, towDriveaway: 8 },
          trailers: { owned: 0, termLeased: 0, tripLeased: 0, towDriveaway: 0 }
        },
        expectedServices: ['USDOT', 'MC', 'IFTA', 'ELD'],
        businessForm: 'limited_liability_company',
        weightClass: 'mixed'
      },
      {
        type: 'cargo_tank_facility',
        name: 'Cargo Tank Facility',
        description: 'Specialized cargo tank facility operation',
        difficulty: 8,
        operations: {
          operatesCargoTankFacility: true,
          transportsProperty: true,
          receivesCompensation: true,
          transportsInterstate: true,
          propertyType: 'hazardous_materials',
          cargoClassifications: ['hazardous_materials', 'liquids_gases']
        },
        vehicles: {
          straightTrucks: { owned: 4, termLeased: 2, tripLeased: 1, towDriveaway: 0 },
          truckTractors: { owned: 6, termLeased: 3, tripLeased: 2, towDriveaway: 0 },
          trailers: { owned: 8, termLeased: 2, tripLeased: 1, towDriveaway: 0 }
        },
        expectedServices: ['USDOT', 'MC', 'IFTA', 'ELD', 'Hazmat'],
        businessForm: 'corporation',
        weightClass: 'heavy'
      }
    ];
  }

  private getRandomTemplate(scenarioType?: string) {
    if (scenarioType) {
      return this.scenarioTemplates.find(t => t.type === scenarioType) || this.scenarioTemplates[0];
    }
    return this.scenarioTemplates[Math.floor(Math.random() * this.scenarioTemplates.length)];
  }

  private createClientFromTemplate(template: any): FakeClient {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: clientId,
      legalBusinessName: this.generateBusinessName(template.businessForm),
      dbaName: Math.random() > 0.7 ? this.generateDbaName() : undefined,
      principalAddress: this.generateAddress(),
      mailingAddress: Math.random() > 0.8 ? this.generateAddress() : undefined,
      phoneNumber: this.generatePhoneNumber(),
      einOrSsn: this.generateEinOrSsn(),
      dunBradstreetNumber: Math.random() > 0.6 ? this.generateDunsNumber() : undefined,
      isGovernmentUnit: Math.random() > 0.95,
      businessForm: template.businessForm,
      ownership: 'us_citizen', // Default to US citizen for simplicity
      contact: this.generateCompanyContact(),
      operations: {
        ...template.operations,
        isIntermodalEquipmentProvider: Math.random() > 0.9,
        operatesCargoTankFacility: Math.random() > 0.9,
        operatesDriveaway: Math.random() > 0.9,
        operatesTowaway: Math.random() > 0.9,
        providesFreightForwarderServices: Math.random() > 0.8
      },
      vehicles: {
        ...template.vehicles,
        nonCmvProperty: Math.floor(Math.random() * 5),
        canadaVehicles: Math.floor(Math.random() * 3),
        mexicoVehicles: Math.floor(Math.random() * 2),
        interstateVehicles: Math.floor(Math.random() * 10),
        intrastateVehicles: Math.floor(Math.random() * 5)
      },
      drivers: {
        interstateDrivers: {
          within100Miles: Math.floor(Math.random() * 3),
          beyond100Miles: Math.floor(Math.random() * 5)
        },
        intrastateDrivers: {
          within100Miles: Math.floor(Math.random() * 2),
          beyond100Miles: Math.floor(Math.random() * 3)
        },
        cdlDrivers: Math.floor(Math.random() * 8),
        canadaDrivers: Math.floor(Math.random() * 2),
        mexicoDrivers: Math.floor(Math.random() * 1)
      },
      expectedServices: template.expectedServices,
      expectedRevenue: this.calculateExpectedRevenue(template.expectedServices),
      complexity: this.determineComplexity(template.difficulty),
      scenario: template.name,
      difficulty: template.difficulty,
      createdAt: new Date()
    };
  }

  private generateBusinessName(businessForm: BusinessForm): string {
    const businessTypes = {
      sole_proprietor: ['Transport', 'Logistics', 'Hauling', 'Freight', 'Delivery'],
      partnership: ['Transport Partners', 'Logistics Group', 'Freight Solutions', 'Delivery Team'],
      corporation: ['Transport Corp', 'Logistics Inc', 'Freight Solutions LLC', 'Delivery Systems'],
      limited_liability_company: ['Transport LLC', 'Logistics Group LLC', 'Freight Solutions LLC']
    };

    const types = businessTypes[businessForm] || businessTypes.sole_proprietor;
    const prefixes = ['Ace', 'Premier', 'Elite', 'Pro', 'Express', 'Swift', 'Reliable', 'Quality'];
    const suffixes = ['Services', 'Solutions', 'Systems', 'Group', 'Enterprises'];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const suffix = Math.random() > 0.5 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';

    return `${prefix} ${type}${suffix ? ' ' + suffix : ''}`;
  }

  private generateDbaName(): string {
    const dbaNames = ['DBA Express Transport', 'DBA Quick Delivery', 'DBA Reliable Hauling', 'DBA Fast Freight'];
    return dbaNames[Math.floor(Math.random() * dbaNames.length)];
  }

  private generateAddress(): Address {
    const cities = ['Dallas', 'Houston', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi'];
    const states = ['TX', 'CA', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA'];
    const streets = ['Main St', 'Oak Ave', 'First St', 'Second Ave', 'Park Rd', 'Broadway', 'Commerce St', 'Industrial Blvd'];

    return {
      country: 'US',
      streetAddress: `${Math.floor(Math.random() * 9999) + 1} ${streets[Math.floor(Math.random() * streets.length)]}`,
      city: cities[Math.floor(Math.random() * cities.length)],
      state: states[Math.floor(Math.random() * states.length)],
      postalCode: `${Math.floor(Math.random() * 90000) + 10000}`
    };
  }

  private generatePhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${exchange}-${number}`;
  }

  private generateEinOrSsn(): string {
    // Generate EIN format: XX-XXXXXXX
    const first = Math.floor(Math.random() * 90) + 10;
    const second = Math.floor(Math.random() * 9000000) + 1000000;
    return `${first}-${second}`;
  }

  private generateDunsNumber(): string {
    return Math.floor(Math.random() * 900000000) + 100000000;
  }

  private generateCompanyContact(): CompanyContact {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Mary'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const titles = ['Owner', 'President', 'CEO', 'Manager', 'Director', 'Partner'];

    return {
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      middleName: Math.random() > 0.7 ? firstNames[Math.floor(Math.random() * firstNames.length)] : undefined,
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      suffix: Math.random() > 0.9 ? ['Jr', 'Sr', 'III'][Math.floor(Math.random() * 3)] : undefined,
      title: titles[Math.floor(Math.random() * titles.length)],
      email: `${firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()}@${this.generateBusinessName('sole_proprietor').toLowerCase().replace(/\s+/g, '')}.com`,
      phoneNumber: this.generatePhoneNumber(),
      address: this.generateAddress()
    };
  }

  private calculateExpectedRevenue(services: string[]): number {
    const servicePrices = {
      'USDOT': 300,
      'MC': 300,
      'IFTA': 200,
      'ELD': 150,
      'Hazmat': 100
    };

    return services.reduce((total, service) => {
      return total + (servicePrices[service as keyof typeof servicePrices] || 0);
    }, 0);
  }

  private determineComplexity(difficulty: number): 'simple' | 'intermediate' | 'complex' | 'expert' {
    if (difficulty <= 3) return 'simple';
    if (difficulty <= 6) return 'intermediate';
    if (difficulty <= 8) return 'complex';
    return 'expert';
  }

  /**
   * Test regulatory compliance for a scenario
   */
  public testRegulatoryCompliance(scenario: any): {
    isCompliant: boolean;
    regulatoryAssessment: any;
    errors: string[];
    recommendations: string[];
  } {
    const result = {
      isCompliant: true,
      regulatoryAssessment: null as any,
      errors: [] as string[],
      recommendations: [] as string[]
    };

    // If this is a test scenario, run regulatory assessment
    if (scenario.testScenario && scenario.regulatoryTest) {
      const test = scenario.regulatoryTest;
      result.regulatoryAssessment = this.regulatoryKB.requiresUSDOT({
        gvwr: test.gvwr,
        passengers: test.passengers,
        interstate: test.interstate,
        forHire: test.forHire,
        hazmat: test.hazmat,
        stateCode: test.stateCode
      });

      // Check if the assessment matches expected result
      const expected = test.expectedResult;
      const actual = result.regulatoryAssessment.required;

      if (expected === 'no_usdot_required' && actual) {
        result.errors.push(`Expected no USDOT requirement, but assessment shows USDOT required: ${result.regulatoryAssessment.reason}`);
        result.isCompliant = false;
      } else if (expected === 'usdot_required' && !actual) {
        result.errors.push(`Expected USDOT requirement, but assessment shows no USDOT required: ${result.regulatoryAssessment.reason}`);
        result.isCompliant = false;
      } else if (expected === 'usdot_required_interstate' && !actual) {
        result.errors.push(`Expected USDOT requirement for interstate commerce, but assessment shows no USDOT required: ${result.regulatoryAssessment.reason}`);
        result.isCompliant = false;
      }

      // Add recommendations based on regulatory source
      if (result.regulatoryAssessment.regulatorySource.includes('Qualified State')) {
        result.recommendations.push('Qualified state regulations are being applied correctly');
      } else if (result.regulatoryAssessment.regulatorySource.includes('Federal')) {
        result.recommendations.push('Federal regulations are being applied correctly');
      }
    }

    return result;
  }

  /**
   * Get available scenario types
   */
  public getAvailableScenarios(): Array<{type: string, name: string, description: string, difficulty: number, isTestScenario?: boolean}> {
    return this.scenarioTemplates.map(t => ({
      type: t.type,
      name: t.name,
      description: t.description,
      difficulty: t.difficulty,
      isTestScenario: t.testScenario || false
    }));
  }

  /**
   * Get test scenarios only
   */
  public getTestScenarios(): Array<{type: string, name: string, description: string, difficulty: number}> {
    return this.scenarioTemplates
      .filter(t => t.testScenario)
      .map(t => ({
        type: t.type,
        name: t.name,
        description: t.description,
        difficulty: t.difficulty
      }));
  }

  /**
   * Get qualified states configuration
   */
  public getQualifiedStatesConfig(): any[] {
    return this.regulatoryKB.getQualifiedStates();
  }
}
