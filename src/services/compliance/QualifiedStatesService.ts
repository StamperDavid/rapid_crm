/**
 * Qualified States Service
 * Provides access to state-specific USDOT thresholds for INTRASTATE operations
 * CRITICAL: This ONLY applies to INTRASTATE operations
 * Interstate operations ALWAYS use Federal 49 CFR (10,001+ lbs GVWR / 8+ passengers)
 */

export interface QualifiedStateData {
  stateCode: string;
  stateName: string;
  
  // For Hire thresholds (commercial operations for compensation)
  forHire: {
    gvwrThreshold: number;
    passengerThreshold: number;
    cargoNotes?: string;
  };
  
  // Private Property thresholds (company's own goods/employees)
  privateProperty: {
    gvwrThreshold: number;
    passengerThreshold: number;
    cargoNotes?: string;
  };
  
  requiresIntrastate Authority: boolean;
  intrastateAuthorityName?: string;
  notes?: string;
  lastUpdated: string;
}

export interface USDOTRequirementResult {
  requiresUSDOT: boolean;
  requiresDQFile: boolean; // Driver Qualification File
  threshold: {
    gvwr?: number;
    passengers?: number;
  };
  reasoning: string;
  ruleSource: 'federal_49_cfr' | 'qualified_states_list' | 'no_requirement';
  operationType: 'for_hire' | 'private_property';
  operationRadius: 'interstate' | 'intrastate';
  potentialSavings?: string; // If different than federal requirements
}

export class QualifiedStatesService {
  private static instance: QualifiedStatesService;
  private apiBaseUrl = 'http://localhost:3001/api';

  private constructor() {}

  public static getInstance(): QualifiedStatesService {
    if (!QualifiedStatesService.instance) {
      QualifiedStatesService.instance = new QualifiedStatesService();
    }
    return QualifiedStatesService.instance;
  }

  /**
   * Get qualified state data for a specific state
   */
  public async getQualifiedState(stateCode: string): Promise<QualifiedStateData | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/qualified-states?state=${stateCode.toUpperCase()}`);
      if (!response.ok) return null;

      const data = await response.json();
      const states = data.states || [];
      
      if (states.length === 0) return null;

      const state = states[0];
      
      return {
        stateCode: state.state_code,
        stateName: state.state_name,
        forHire: {
          gvwrThreshold: state.gvwr_threshold_fh,
          passengerThreshold: state.passenger_threshold_fh,
          cargoNotes: state.gvwr_notes_fh
        },
        privateProperty: {
          gvwrThreshold: state.gvwr_threshold_pp,
          passengerThreshold: state.passenger_threshold_pp,
          cargoNotes: state.gvwr_notes_pp
        },
        requiresIntrastateAuthority: state.requires_intrastate_authority,
        intrastateAuthorityName: state.intrastate_authority_name,
        notes: state.notes,
        lastUpdated: state.last_updated
      };
    } catch (error) {
      console.error('Error fetching qualified state:', error);
      return null;
    }
  }

  /**
   * Get all qualified states
   */
  public async getAllQualifiedStates(): Promise<QualifiedStateData[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/qualified-states`);
      if (!response.ok) return [];

      const data = await response.json();
      const states = data.states || [];
      
      return states.map((state: any) => ({
        stateCode: state.state_code,
        stateName: state.state_name,
        forHire: {
          gvwrThreshold: state.gvwr_threshold_fh,
          passengerThreshold: state.passenger_threshold_fh,
          cargoNotes: state.gvwr_notes_fh
        },
        privateProperty: {
          gvwrThreshold: state.gvwr_threshold_pp,
          passengerThreshold: state.passenger_threshold_pp,
          cargoNotes: state.gvwr_notes_pp
        },
        requiresIntrastateAuthority: state.requires_intrastate_authority,
        intrastateAuthorityName: state.intrastate_authority_name,
        notes: state.notes,
        lastUpdated: state.last_updated
      }));
    } catch (error) {
      console.error('Error fetching qualified states:', error);
      return [];
    }
  }

  /**
   * Determine if a USDOT number and DQ file are required
   * This is the MASTER function that follows the regulatory hierarchy
   */
  public async determineUSDOTRequirement(params: {
    stateCode: string;
    operationType: 'for_hire' | 'private_property';
    operationRadius: 'interstate' | 'intrastate' | 'both';
    gvwr?: number;
    passengerCapacity?: number;
    cargoType?: string;
  }): Promise<USDOTRequirementResult> {
    const { stateCode, operationType, operationRadius, gvwr = 0, passengerCapacity = 0, cargoType } = params;

    // RULE 1: Interstate operations ALWAYS use Federal 49 CFR
    if (operationRadius === 'interstate' || operationRadius === 'both') {
      const requiresUSDOT = gvwr >= 10001 || passengerCapacity >= 8;
      
      return {
        requiresUSDOT,
        requiresDQFile: requiresUSDOT, // DQ file required if USDOT required
        threshold: {
          gvwr: 10001,
          passengers: 8
        },
        reasoning: `Interstate operations ALWAYS follow Federal 49 CFR regulations. USDOT required if GVWR is 10,001+ lbs OR 8+ passengers. Your vehicle: ${gvwr} lbs GVWR, ${passengerCapacity} passengers.`,
        ruleSource: 'federal_49_cfr',
        operationType,
        operationRadius
      };
    }

    // RULE 2: Intrastate operations - Use Qualified States List (supersedes federal regulations)
    const qualifiedState = await this.getQualifiedState(stateCode);
    
    if (!qualifiedState) {
      // Fallback to federal if state not in qualified states list
      const requiresUSDOT = gvwr >= 10001 || passengerCapacity >= 8;
      
      return {
        requiresUSDOT,
        requiresDQFile: requiresUSDOT,
        threshold: {
          gvwr: 10001,
          passengers: 8
        },
        reasoning: `State ${stateCode} not found in Qualified States List. Using Federal 49 CFR as fallback. USDOT required if GVWR is 10,001+ lbs OR 8+ passengers.`,
        ruleSource: 'federal_49_cfr',
        operationType,
        operationRadius
      };
    }

    // RULE 3: Apply state-specific thresholds based on operation type
    const thresholds = operationType === 'for_hire' 
      ? qualifiedState.forHire 
      : qualifiedState.privateProperty;

    // Check if USDOT is required
    let requiresUSDOT = false;
    let reasoning = '';
    let threshold: { gvwr?: number; passengers?: number } = {};

    // Handle "ANY" (threshold = 1) meaning all operations require USDOT
    if (thresholds.gvwrThreshold === 1 || thresholds.passengerThreshold === 1) {
      requiresUSDOT = true;
      reasoning = `${qualifiedState.stateName} requires USDOT for ANY ${operationType.replace('_', ' ')} operations (intrastate). `;
      threshold = {
        gvwr: thresholds.gvwrThreshold === 1 ? 1 : thresholds.gvwrThreshold,
        passengers: thresholds.passengerThreshold === 1 ? 1 : thresholds.passengerThreshold
      };
    } else {
      // Normal threshold check
      const meetsGVWR = gvwr > 0 && thresholds.gvwrThreshold > 0 && gvwr >= thresholds.gvwrThreshold;
      const meetsPassenger = passengerCapacity > 0 && thresholds.passengerThreshold > 0 && passengerCapacity >= thresholds.passengerThreshold;
      
      requiresUSDOT = meetsGVWR || meetsPassenger;
      threshold = {
        gvwr: thresholds.gvwrThreshold,
        passengers: thresholds.passengerThreshold
      };

      if (requiresUSDOT) {
        reasoning = `${qualifiedState.stateName} (intrastate ${operationType.replace('_', ' ')}): USDOT required. ` +
          `Thresholds: ${thresholds.gvwrThreshold || 'N/A'} lbs GVWR, ${thresholds.passengerThreshold || 'N/A'} passengers. ` +
          `Your vehicle: ${gvwr} lbs, ${passengerCapacity} passengers. `;
      } else {
        reasoning = `${qualifiedState.stateName} (intrastate ${operationType.replace('_', ' ')}): USDOT NOT required. ` +
          `Thresholds: ${thresholds.gvwrThreshold || 'N/A'} lbs GVWR, ${thresholds.passengerThreshold || 'N/A'} passengers. ` +
          `Your vehicle: ${gvwr} lbs, ${passengerCapacity} passengers is BELOW the threshold. `;
      }
    }

    // Add cargo notes if applicable
    if (thresholds.cargoNotes && cargoType) {
      reasoning += `Cargo notes: ${thresholds.cargoNotes}. `;
    }

    // Check if this saves money vs federal requirements
    const federalRequiresUSDOT = gvwr >= 10001 || passengerCapacity >= 8;
    let potentialSavings;
    
    if (federalRequiresUSDOT && !requiresUSDOT) {
      potentialSavings = `💰 SAVINGS: Federal rules would require USDOT, but ${qualifiedState.stateName} intrastate ${operationType.replace('_', ' ')} does NOT. This saves registration fees and compliance costs!`;
    } else if (!federalRequiresUSDOT && requiresUSDOT) {
      potentialSavings = `⚠️ IMPORTANT: Federal rules would NOT require USDOT, but ${qualifiedState.stateName} intrastate ${operationType.replace('_', ' ')} DOES require it.`;
    }

    return {
      requiresUSDOT,
      requiresDQFile: requiresUSDOT, // DQ file required whenever USDOT is required
      threshold,
      reasoning,
      ruleSource: 'qualified_states_list',
      operationType,
      operationRadius,
      potentialSavings
    };
  }

  /**
   * Get a human-readable explanation for a specific scenario
   */
  public async explainRequirement(params: {
    stateCode: string;
    operationType: 'for_hire' | 'private_property';
    operationRadius: 'interstate' | 'intrastate' | 'both';
    gvwr?: number;
    passengerCapacity?: number;
  }): Promise<string> {
    const result = await this.determineUSDOTRequirement(params);
    
    let explanation = `**${params.stateCode} - ${params.operationType.replace('_', ' ').toUpperCase()} - ${params.operationRadius.toUpperCase()}**\n\n`;
    explanation += result.reasoning + '\n\n';
    
    if (result.requiresUSDOT) {
      explanation += `✅ **USDOT NUMBER: REQUIRED**\n`;
      explanation += `✅ **DRIVER QUALIFICATION FILE: REQUIRED**\n\n`;
    } else {
      explanation += `❌ **USDOT NUMBER: NOT REQUIRED**\n`;
      explanation += `❌ **DRIVER QUALIFICATION FILE: NOT REQUIRED**\n\n`;
    }
    
    if (result.potentialSavings) {
      explanation += result.potentialSavings + '\n\n';
    }
    
    explanation += `*Rule Source: ${result.ruleSource.replace('_', ' ').toUpperCase()}*`;
    
    return explanation;
  }
}

export const qualifiedStatesService = QualifiedStatesService.getInstance();






















