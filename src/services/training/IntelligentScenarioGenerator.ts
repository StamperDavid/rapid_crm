/**
 * Intelligent Scenario Generator
 * Creates realistic client profiles for AI agent training
 */

export interface ClientProfile {
  id: string;
  businessType: 'sole_proprietor' | 'partnership' | 'llc' | 'corporation' | 'llp' | 'trust' | 'other';
  operationType: 'local_delivery' | 'interstate_commerce' | 'hazmat' | 'passengers' | 'service_provider' | 'construction' | 'agriculture' | 'retail';
  states: string[];
  cargoTypes: string[];
  fleetSize: number;
  hasCDL: boolean;
  isThirdParty: boolean;
  businessName: string;
  contactName: string;
  businessDescription: string;
  urgency: 'low' | 'medium' | 'high';
  budget: 'low' | 'medium' | 'high';
  experience: 'new' | 'experienced' | 'expert';
}

export interface TrainingScenario {
  id: string;
  clientProfile: ClientProfile;
  expectedOutcome: {
    requiredRegistrations: string[];
    recommendedServices: string[];
    shouldCreateDeal: boolean;
    estimatedCost: number;
    complexity: number;
  };
  conversationStarters: string[];
  difficulty: number;
  category: 'common' | 'edge_case' | 'critical_path';
  createdAt: Date;
}

export class IntelligentScenarioGenerator {
  private static instance: IntelligentScenarioGenerator;
  
  // Realistic business data
  private businessTypes = [
    'sole_proprietor', 'partnership', 'llc', 'corporation', 'llp', 'trust', 'other'
  ];
  
  private operationTypes = [
    'local_delivery', 'interstate_commerce', 'hazmat', 'passengers', 
    'service_provider', 'construction', 'agriculture', 'retail'
  ];
  
  private cargoTypes = [
    'general_freight', 'hazmat', 'passengers', 'household_goods', 
    'construction_materials', 'agricultural_products', 'retail_goods',
    'machinery', 'vehicles', 'refrigerated', 'dry_bulk', 'liquids'
  ];
  
  private states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ];
  
  private businessNames = [
    'ABC Transport', 'Smith Logistics', 'Johnson Trucking', 'Wilson Freight',
    'Brown Delivery', 'Davis Hauling', 'Miller Transport', 'Garcia Logistics',
    'Rodriguez Trucking', 'Martinez Freight', 'Anderson Delivery', 'Taylor Hauling',
    'Thomas Transport', 'Hernandez Logistics', 'Moore Trucking', 'Jackson Freight',
    'Martin Delivery', 'Lee Hauling', 'Perez Transport', 'Thompson Logistics'
  ];
  
  private contactNames = [
    'John Smith', 'Sarah Johnson', 'Mike Wilson', 'Lisa Brown', 'David Davis',
    'Jennifer Miller', 'Robert Garcia', 'Maria Rodriguez', 'James Martinez',
    'Linda Anderson', 'William Taylor', 'Patricia Thomas', 'Christopher Hernandez',
    'Barbara Moore', 'Richard Jackson', 'Susan Martin', 'Joseph Lee', 'Jessica Perez'
  ];

  public static getInstance(): IntelligentScenarioGenerator {
    if (!IntelligentScenarioGenerator.instance) {
      IntelligentScenarioGenerator.instance = new IntelligentScenarioGenerator();
    }
    return IntelligentScenarioGenerator.instance;
  }

  /**
   * Generate a realistic client profile
   */
  public generateClientProfile(category: 'common' | 'edge_case' | 'critical_path' = 'common'): ClientProfile {
    const businessType = this.selectBusinessType(category);
    const operationType = this.selectOperationType(businessType, category);
    const states = this.selectStates(operationType, category);
    const cargoTypes = this.selectCargoTypes(operationType, category);
    const fleetSize = this.selectFleetSize(businessType, category);
    const hasCDL = this.determineCDLRequirement(fleetSize, cargoTypes);
    const isThirdParty = this.determineThirdPartyStatus(businessType, operationType);
    
    return {
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      businessType,
      operationType,
      states,
      cargoTypes,
      fleetSize,
      hasCDL,
      isThirdParty,
      businessName: this.selectRandom(this.businessNames),
      contactName: this.selectRandom(this.contactNames),
      businessDescription: this.generateBusinessDescription(businessType, operationType, fleetSize),
      urgency: this.selectUrgency(category),
      budget: this.selectBudget(businessType, fleetSize),
      experience: this.selectExperience(category)
    };
  }

  /**
   * Generate a complete training scenario
   */
  public generateTrainingScenario(category: 'common' | 'edge_case' | 'critical_path' = 'common'): TrainingScenario {
    const clientProfile = this.generateClientProfile(category);
    const expectedOutcome = this.calculateExpectedOutcome(clientProfile);
    const conversationStarters = this.generateConversationStarters(clientProfile);
    const difficulty = this.calculateDifficulty(clientProfile, expectedOutcome);
    
    return {
      id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientProfile,
      expectedOutcome,
      conversationStarters,
      difficulty,
      category,
      createdAt: new Date()
    };
  }

  /**
   * Generate multiple scenarios for training
   */
  public generateScenarioBatch(count: number, category: 'common' | 'edge_case' | 'critical_path' = 'common'): TrainingScenario[] {
    const scenarios: TrainingScenario[] = [];
    
    for (let i = 0; i < count; i++) {
      scenarios.push(this.generateTrainingScenario(category));
    }
    
    return scenarios;
  }

  private selectBusinessType(category: string): ClientProfile['businessType'] {
    const weights = {
      common: { sole_proprietor: 0.4, llc: 0.3, corporation: 0.2, partnership: 0.1 },
      edge_case: { llc: 0.3, corporation: 0.3, partnership: 0.2, sole_proprietor: 0.1, trust: 0.1 },
      critical_path: { sole_proprietor: 0.5, llc: 0.3, corporation: 0.2 }
    };
    
    return this.weightedRandom(this.businessTypes, weights[category] || weights.common) as ClientProfile['businessType'];
  }

  private selectOperationType(businessType: string, category: string): ClientProfile['operationType'] {
    const weights = {
      common: { local_delivery: 0.4, interstate_commerce: 0.3, service_provider: 0.2, construction: 0.1 },
      edge_case: { hazmat: 0.3, passengers: 0.2, interstate_commerce: 0.3, agriculture: 0.2 },
      critical_path: { interstate_commerce: 0.4, hazmat: 0.3, local_delivery: 0.3 }
    };
    
    return this.weightedRandom(this.operationTypes, weights[category] || weights.common) as ClientProfile['operationType'];
  }

  private selectStates(operationType: string, category: string): string[] {
    if (operationType === 'local_delivery') {
      return [this.selectRandom(this.states)];
    }
    
    // Interstate operations
    const stateCount = category === 'edge_case' ? 
      Math.floor(Math.random() * 5) + 3 : // 3-7 states
      Math.floor(Math.random() * 3) + 2;  // 2-4 states
    
    const selectedStates = [];
    const availableStates = [...this.states];
    
    for (let i = 0; i < Math.min(stateCount, availableStates.length); i++) {
      const randomIndex = Math.floor(Math.random() * availableStates.length);
      selectedStates.push(availableStates.splice(randomIndex, 1)[0]);
    }
    
    return selectedStates;
  }

  private selectCargoTypes(operationType: string, category: string): string[] {
    const baseCargo = {
      local_delivery: ['general_freight'],
      interstate_commerce: ['general_freight', 'retail_goods'],
      hazmat: ['hazmat', 'liquids'],
      passengers: ['passengers'],
      service_provider: [],
      construction: ['construction_materials', 'machinery'],
      agriculture: ['agricultural_products', 'dry_bulk'],
      retail: ['retail_goods', 'refrigerated']
    };
    
    let cargo = baseCargo[operationType] || ['general_freight'];
    
    // Add complexity for edge cases
    if (category === 'edge_case' && Math.random() > 0.5) {
      const additionalCargo = this.selectRandom(this.cargoTypes.filter(c => !cargo.includes(c)));
      cargo.push(additionalCargo);
    }
    
    return cargo;
  }

  private selectFleetSize(businessType: string, category: string): number {
    // Realistic fleet sizes: 1-25 trucks (95% of cases), occasional larger fleets
    const weights = {
      common: { 1: 0.3, 2: 0.2, 3: 0.15, 4: 0.1, 5: 0.1, 6: 0.05, 7: 0.03, 8: 0.02, 9: 0.02, 10: 0.02, 15: 0.01 },
      edge_case: { 1: 0.2, 2: 0.15, 3: 0.1, 5: 0.1, 10: 0.1, 15: 0.1, 20: 0.1, 25: 0.1, 50: 0.05 },
      critical_path: { 1: 0.4, 2: 0.2, 3: 0.15, 5: 0.1, 10: 0.1, 15: 0.05 }
    };
    
    const fleetSizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 50];
    return this.weightedRandom(fleetSizes, weights[category] || weights.common);
  }

  private determineCDLRequirement(fleetSize: number, cargoTypes: string[]): boolean {
    // CDL required for hazmat, passengers, or vehicles over 26,001 lbs
    if (cargoTypes.includes('hazmat') || cargoTypes.includes('passengers')) {
      return true;
    }
    
    // Larger fleets more likely to have CDL drivers
    if (fleetSize >= 10) return Math.random() > 0.2;
    if (fleetSize >= 5) return Math.random() > 0.4;
    if (fleetSize >= 2) return Math.random() > 0.6;
    return Math.random() > 0.8;
  }

  private determineThirdPartyStatus(businessType: string, operationType: string): boolean {
    return operationType === 'service_provider' || 
           (businessType === 'corporation' && Math.random() > 0.7);
  }

  private generateBusinessDescription(businessType: string, operationType: string, fleetSize: number): string {
    const descriptions = {
      sole_proprietor: `Small ${operationType.replace('_', ' ')} business`,
      partnership: `Partnership specializing in ${operationType.replace('_', ' ')}`,
      llc: `LLC providing ${operationType.replace('_', ' ')} services`,
      corporation: `Corporation with ${fleetSize} vehicle fleet for ${operationType.replace('_', ' ')}`,
      llp: `Limited liability partnership in ${operationType.replace('_', ' ')}`,
      trust: `Trust-owned ${operationType.replace('_', ' ')} business`,
      other: `Business entity providing ${operationType.replace('_', ' ')} services`
    };
    
    return descriptions[businessType] || descriptions.other;
  }

  private selectUrgency(category: string): ClientProfile['urgency'] {
    const weights = {
      common: { low: 0.3, medium: 0.5, high: 0.2 },
      edge_case: { low: 0.2, medium: 0.4, high: 0.4 },
      critical_path: { low: 0.1, medium: 0.3, high: 0.6 }
    };
    
    return this.weightedRandom(['low', 'medium', 'high'], weights[category] || weights.common);
  }

  private selectBudget(businessType: string, fleetSize: number): ClientProfile['budget'] {
    if (fleetSize >= 10 || businessType === 'corporation') return 'high';
    if (fleetSize >= 3 || businessType === 'llc') return 'medium';
    return 'low';
  }

  private selectExperience(category: string): ClientProfile['experience'] {
    const weights = {
      common: { new: 0.4, experienced: 0.5, expert: 0.1 },
      edge_case: { new: 0.2, experienced: 0.6, expert: 0.2 },
      critical_path: { new: 0.6, experienced: 0.3, expert: 0.1 }
    };
    
    return this.weightedRandom(['new', 'experienced', 'expert'], weights[category] || weights.common);
  }

  private calculateExpectedOutcome(clientProfile: ClientProfile) {
    const registrations = [];
    const services = [];
    let cost = 0;
    let complexity = 0;

    // Determine required registrations
    if (clientProfile.operationType === 'interstate_commerce' || clientProfile.states.length > 1) {
      registrations.push('USDOT');
      if (clientProfile.cargoTypes.includes('hazmat')) {
        registrations.push('HAZMAT');
        complexity += 2;
      }
      if (clientProfile.cargoTypes.includes('passengers')) {
        registrations.push('PASSENGER');
        complexity += 2;
      }
      registrations.push('MC_NUMBER');
      complexity += 1;
    } else {
      registrations.push('USDOT');
    }

    // Determine recommended services
    if (registrations.length === 1 && registrations[0] === 'USDOT') {
      services.push('Free USDOT Registration');
      cost = 0;
    } else {
      services.push('Full Compliance Package');
      cost = 599;
      if (clientProfile.fleetSize >= 10) {
        services.push('Fleet Management');
        cost += 200;
        complexity += 1;
      }
      if (clientProfile.cargoTypes.includes('hazmat')) {
        services.push('Hazmat Training');
        cost += 150;
        complexity += 1;
      }
    }

    return {
      requiredRegistrations: registrations,
      recommendedServices: services,
      shouldCreateDeal: cost > 0,
      estimatedCost: cost,
      complexity
    };
  }

  private generateConversationStarters(clientProfile: ClientProfile): string[] {
    const starters = [
      `Hi, I'm ${clientProfile.contactName} from ${clientProfile.businessName}. I need help with USDOT registration.`,
      `I'm starting a ${clientProfile.businessDescription} and need to get compliant.`,
      `I need help understanding what registrations I need for my ${clientProfile.operationType.replace('_', ' ')} business.`,
      `Can you help me figure out what I need to operate legally?`,
      `I'm not sure if I need USDOT registration for my business.`
    ];
    
    return starters;
  }

  private calculateDifficulty(clientProfile: ClientProfile, expectedOutcome: any): number {
    let difficulty = 1;
    
    // Business complexity
    if (clientProfile.businessType === 'corporation') difficulty += 1;
    if (clientProfile.businessType === 'sole_proprietor') difficulty += 0.5;
    
    // Operational complexity
    if (clientProfile.states.length > 3) difficulty += 1;
    if (clientProfile.cargoTypes.includes('hazmat')) difficulty += 2;
    if (clientProfile.cargoTypes.includes('passengers')) difficulty += 2;
    if (clientProfile.fleetSize >= 10) difficulty += 1;
    
    // Experience level
    if (clientProfile.experience === 'new') difficulty += 1;
    if (clientProfile.experience === 'expert') difficulty -= 0.5;
    
    return Math.min(10, Math.max(1, Math.round(difficulty)));
  }

  private selectRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private weightedRandom<T>(items: T[], weights: Record<string, number>): T {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [key, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        return items.find(item => String(item) === key) || items[0];
      }
    }
    
    return items[0];
  }
}

export const intelligentScenarioGenerator = IntelligentScenarioGenerator.getInstance();
