/**
 * COMPLIANCE RULES ENGINE
 * 
 * CRITICAL REGULATORY HIERARCHY:
 * 1. Interstate Operations: ALWAYS use Federal 49 CFR (10,001+ lbs GVWR / 8+ passengers)
 * 2. Intrastate Operations: Use Qualified States List (SUPERSEDES federal thresholds)
 * 3. Qualified States List: Takes priority over ALL other state and federal regulations for intrastate
 * 
 * This service queries the database for the latest qualified states data and applies
 * the correct regulatory logic based on operation type.
 */

export interface VehicleInfo {
  type: 'truck' | 'tractor' | 'trailer' | 'bus' | 'van' | 'other';
  gvwr: number;
  passengerCapacity?: number;
  year: number;
  make: string;
  model: string;
}

export interface OperationDetails {
  stateCode: string;
  operationType: 'for_hire' | 'private' | 'both';
  operationRadius: 'intrastate' | 'interstate' | 'both';
  cargoTypes: string[];
  vehicles: VehicleInfo[];
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  cost: number;
  reason: string;
  regulatorySource: 'federal_49_cfr' | 'qualified_states' | 'state_specific' | 'hazmat' | 'passenger';
}

export interface ComplianceDetermination {
  requiresUSDOT: boolean;
  requiresAuthority: boolean;
  authorityType?: 'mc' | 'ff' | 'broker' | null;
  requirements: ComplianceRequirement[];
  totalCost: number;
  determinationLogic: string;
  appliedThresholds: {
    gvwrThreshold: number;
    passengerThreshold: number;
    source: string;
  };
}

class ComplianceRulesEngine {
  private static instance: ComplianceRulesEngine;

  private constructor() {}

  public static getInstance(): ComplianceRulesEngine {
    if (!ComplianceRulesEngine.instance) {
      ComplianceRulesEngine.instance = new ComplianceRulesEngine();
    }
    return ComplianceRulesEngine.instance;
  }

  /**
   * Main method to determine compliance requirements
   */
  async determineCompliance(operation: OperationDetails): Promise<ComplianceDetermination> {
    const requirements: ComplianceRequirement[] = [];
    
    // Determine which thresholds to apply
    const thresholds = await this.getApplicableThresholds(operation);
    
    // Check USDOT requirement
    const usdotRequired = this.checkUSDOTRequirement(operation, thresholds);
    
    if (usdotRequired.required) {
      requirements.push({
        id: 'usdot',
        name: 'USDOT Number',
        description: 'Required for commercial motor vehicle operations',
        required: true,
        cost: 0, // Free
        reason: usdotRequired.reason,
        regulatorySource: thresholds.source as any
      });
    }

    // Check Authority requirements
    const authorityReq = this.checkAuthorityRequirement(operation);
    if (authorityReq.required) {
      requirements.push(authorityReq.requirement);
    }

    // Check for hazmat
    const hazmatReq = this.checkHazmatRequirement(operation);
    if (hazmatReq.required) {
      requirements.push(hazmatReq.requirement);
    }

    // Check for passenger transport
    const passengerReq = this.checkPassengerRequirement(operation, thresholds);
    if (passengerReq.required) {
      requirements.push(passengerReq.requirement);
    }

    // Add compliance monitoring (recommended for all)
    requirements.push({
      id: 'compliance_monitoring',
      name: 'Compliance Monitoring',
      description: 'Ongoing compliance monitoring and support',
      required: true,
      cost: 150,
      reason: 'Recommended for all commercial operations',
      regulatorySource: 'federal_49_cfr'
    });

    const totalCost = requirements.reduce((sum, req) => sum + req.cost, 0);

    return {
      requiresUSDOT: usdotRequired.required,
      requiresAuthority: authorityReq.required,
      authorityType: authorityReq.authorityType,
      requirements,
      totalCost,
      determinationLogic: thresholds.logic,
      appliedThresholds: thresholds
    };
  }

  /**
   * Get applicable thresholds based on operation type
   * CRITICAL: Interstate uses Federal, Intrastate uses Qualified States
   * IMPORTANT: For Hire vs Private Property have different thresholds
   */
  private async getApplicableThresholds(operation: OperationDetails): Promise<{
    gvwrThreshold: number;
    passengerThreshold: number;
    source: string;
    logic: string;
  }> {
    // INTERSTATE: Always use Federal 49 CFR (same for FH and PP)
    if (operation.operationRadius === 'interstate' || operation.operationRadius === 'both') {
      return {
        gvwrThreshold: 10001,
        passengerThreshold: 8,
        source: 'federal_49_cfr',
        logic: 'Interstate operation: Using Federal 49 CFR thresholds (10,001+ lbs GVWR / 8+ passengers). Qualified States List does NOT apply to interstate operations.'
      };
    }

    // INTRASTATE: Use Qualified States List with FH/PP distinction
    try {
      const response = await fetch(`http://localhost:3001/api/qualified-states`);
      if (response.ok) {
        const data = await response.json();
        const state = data.states?.find((s: any) => s.state_code === operation.stateCode);
        
        if (state) {
          // Determine which thresholds to use based on operation type
          let gvwrThreshold: number;
          let passengerThreshold: number;
          let operationTypeLabel: string;

          if (operation.operationType === 'for_hire') {
            gvwrThreshold = state.gvwr_threshold_fh || state.gvwr_threshold || 10001;
            passengerThreshold = state.passenger_threshold_fh || state.passenger_threshold || 8;
            operationTypeLabel = 'For Hire';
          } else if (operation.operationType === 'private') {
            gvwrThreshold = state.gvwr_threshold_pp || state.gvwr_threshold || 10001;
            passengerThreshold = state.passenger_threshold_pp || state.passenger_threshold || 8;
            operationTypeLabel = 'Private Property';
          } else {
            // 'both' - use the more restrictive threshold (lower numbers = more restrictive)
            const fhGvwr = state.gvwr_threshold_fh || state.gvwr_threshold || 10001;
            const ppGvwr = state.gvwr_threshold_pp || state.gvwr_threshold || 10001;
            const fhPassengers = state.passenger_threshold_fh || state.passenger_threshold || 8;
            const ppPassengers = state.passenger_threshold_pp || state.passenger_threshold || 8;
            
            gvwrThreshold = Math.min(fhGvwr, ppGvwr);
            passengerThreshold = Math.min(fhPassengers, ppPassengers);
            operationTypeLabel = 'Both For Hire and Private Property';
          }

          return {
            gvwrThreshold,
            passengerThreshold,
            source: 'qualified_states',
            logic: `Intrastate ${operationTypeLabel} operation in ${state.state_name}: Using Qualified States List thresholds (${gvwrThreshold}+ lbs GVWR / ${passengerThreshold}+ passengers). Qualified States List SUPERSEDES federal thresholds for intrastate operations.`
          };
        }
      }
    } catch (error) {
      console.error('Error fetching qualified states:', error);
    }

    // Fallback to federal if state not found in qualified list
    return {
      gvwrThreshold: 10001,
      passengerThreshold: 8,
      source: 'federal_49_cfr_fallback',
      logic: `Intrastate operation in ${operation.stateCode}: State not found in Qualified States List, using Federal 49 CFR thresholds as fallback (10,001+ lbs GVWR / 8+ passengers).`
    };
  }

  /**
   * Check if USDOT number is required
   */
  private checkUSDOTRequirement(
    operation: OperationDetails,
    thresholds: { gvwrThreshold: number; passengerThreshold: number; source: string }
  ): { required: boolean; reason: string } {
    // Check GVWR
    const maxGVWR = Math.max(...operation.vehicles.map(v => v.gvwr));
    if (maxGVWR >= thresholds.gvwrThreshold) {
      return {
        required: true,
        reason: `Vehicle GVWR (${maxGVWR} lbs) meets or exceeds ${thresholds.gvwrThreshold} lbs threshold (${thresholds.source})`
      };
    }

    // Check passenger capacity
    const maxPassengers = Math.max(...operation.vehicles.map(v => v.passengerCapacity || 0));
    if (maxPassengers >= thresholds.passengerThreshold) {
      return {
        required: true,
        reason: `Passenger capacity (${maxPassengers}) meets or exceeds ${thresholds.passengerThreshold} passenger threshold (${thresholds.source})`
      };
    }

    // Check for hazmat
    const hasHazmat = operation.cargoTypes.some(cargo =>
      cargo.toLowerCase().includes('hazmat') ||
      cargo.toLowerCase().includes('hazardous') ||
      cargo.toLowerCase().includes('dangerous')
    );
    if (hasHazmat) {
      return {
        required: true,
        reason: 'Transporting hazardous materials requiring placarding (Federal requirement)'
      };
    }

    return {
      required: false,
      reason: 'Does not meet USDOT registration thresholds'
    };
  }

  /**
   * Check if Motor Carrier Authority is required
   */
  private checkAuthorityRequirement(operation: OperationDetails): {
    required: boolean;
    authorityType: 'mc' | 'ff' | 'broker' | null;
    requirement: ComplianceRequirement;
  } {
    // For-hire interstate requires MC authority
    if (
      (operation.operationType === 'for_hire' || operation.operationType === 'both') &&
      (operation.operationRadius === 'interstate' || operation.operationRadius === 'both')
    ) {
      return {
        required: true,
        authorityType: 'mc',
        requirement: {
          id: 'mc_authority',
          name: 'Motor Carrier Authority (MC)',
          description: 'Required for interstate for-hire operations',
          required: true,
          cost: 300,
          reason: 'Interstate for-hire operation requires MC authority',
          regulatorySource: 'federal_49_cfr'
        }
      };
    }

    // Check if state requires intrastate authority
    // This would need to be checked against qualified_states table
    // For now, we'll return not required for private intrastate

    return {
      required: false,
      authorityType: null,
      requirement: {} as ComplianceRequirement
    };
  }

  /**
   * Check hazmat requirements
   */
  private checkHazmatRequirement(operation: OperationDetails): {
    required: boolean;
    requirement: ComplianceRequirement;
  } {
    const hasHazmat = operation.cargoTypes.some(cargo =>
      cargo.toLowerCase().includes('hazmat') ||
      cargo.toLowerCase().includes('hazardous') ||
      cargo.toLowerCase().includes('dangerous')
    );

    if (hasHazmat) {
      return {
        required: true,
        requirement: {
          id: 'hazmat',
          name: 'Hazardous Materials Endorsement',
          description: 'Required for transporting hazardous materials',
          required: true,
          cost: 0, // Typically handled through driver licensing
          reason: 'Hazardous materials cargo detected',
          regulatorySource: 'hazmat'
        }
      };
    }

    return {
      required: false,
      requirement: {} as ComplianceRequirement
    };
  }

  /**
   * Check passenger transport requirements
   */
  private checkPassengerRequirement(
    operation: OperationDetails,
    thresholds: { passengerThreshold: number }
  ): {
    required: boolean;
    requirement: ComplianceRequirement;
  } {
    const hasPassengers = operation.cargoTypes.some(cargo =>
      cargo.toLowerCase().includes('passenger') ||
      cargo.toLowerCase().includes('people')
    );

    const maxPassengers = Math.max(...operation.vehicles.map(v => v.passengerCapacity || 0));

    if (hasPassengers && maxPassengers >= thresholds.passengerThreshold) {
      return {
        required: true,
        requirement: {
          id: 'passenger_authority',
          name: 'Passenger Transport Authority',
          description: 'Required for passenger transportation',
          required: true,
          cost: 300,
          reason: `Passenger transportation detected with ${maxPassengers} passenger capacity`,
          regulatorySource: 'passenger'
        }
      };
    }

    return {
      required: false,
      requirement: {} as ComplianceRequirement
    };
  }

  /**
   * Log determination for training and improvement
   */
  async logDetermination(
    operation: OperationDetails,
    determination: ComplianceDetermination,
    isCorrect?: boolean,
    correctionNotes?: string
  ): Promise<void> {
    try {
      await fetch('http://localhost:3001/api/compliance-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: 'Unknown',
          state_code: operation.stateCode,
          operation_type: operation.operationType,
          operation_radius: operation.operationRadius,
          gvwr: Math.max(...operation.vehicles.map(v => v.gvwr)),
          passenger_capacity: Math.max(...operation.vehicles.map(v => v.passengerCapacity || 0)),
          cargo_types: JSON.stringify(operation.cargoTypes),
          determination_logic: determination.determinationLogic,
          requires_usdot: determination.requiresUSDOT,
          requires_authority: determination.requiresAuthority,
          authority_type: determination.authorityType,
          additional_requirements: JSON.stringify(determination.requirements.map(r => r.id)),
          determination_correct: isCorrect,
          correction_notes: correctionNotes
        })
      });
    } catch (error) {
      console.error('Error logging compliance determination:', error);
    }
  }
}

export const complianceRulesEngine = ComplianceRulesEngine.getInstance();

