/**
 * Enhanced USDOT Scenario Interface
 * COMPLETE data structure with ALL fields needed for full application
 * 
 * This ensures the intelligent agent has all the data it needs
 * to fill out the entire 77-page FMCSA application
 */

export interface EnhancedUSDOTScenario {
  id: string;
  
  // ========================================
  // BUSINESS IDENTITY
  // ========================================
  legalBusinessName: string;
  doingBusinessAs?: string; // Optional if same as legal name
  formOfBusiness: 'sole_proprietor' | 'partnership' | 'llc' | 'corporation' | 'other';
  ein: string; // Can include dashes or not
  
  // ========================================
  // CONTACT INFORMATION
  // ========================================
  companyContact: {
    firstName: string;
    middleName?: string;
    lastName: string;
    suffix?: string; // Jr., Sr., III, etc.
    title: string;
    email: string;
    phone: string;
  };
  
  businessPhone: string;
  
  // ========================================
  // ADDRESSES
  // ========================================
  principalAddress: {
    street: string;
    street2?: string; // Apartment, suite, etc.
    city: string;
    state: string;
    postalCode: string;
    country?: string; // Default 'US'
  };
  
  mailingAddress?: {
    // If different from principal
    street: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  
  // ========================================
  // OPERATION CLASSIFICATION
  // ========================================
  operations: {
    // Core operation type
    isIntermodalEquipmentProvider: boolean;
    transportProperty: boolean;
    transportPassengers: boolean;
    providesBrokerServices: boolean;
    isFreightForwarder: boolean;
    operatesCargoTankFacility: boolean;
    
    // Property carrier specifics
    isForHire: boolean; // Receives compensation for transporting others' property
    isPrivateCarrier: boolean; // Transports own property
    
    // Interstate vs Intrastate
    operatesInterstate: boolean;
    operatesIntrastate: boolean;
    
    // Cargo types
    transportsHazmat: boolean;
    propertyTypes: ('general_freight' | 'household_goods' | 'hazmat' | 'exempt_commodities')[];
    
    // Special operations
    towawayOperation: boolean;
    driveawayOperation: boolean;
  };
  
  // ========================================
  // FLEET INFORMATION
  // ========================================
  vehicles: {
    // Straight Trucks
    straightTrucks: {
      owned: number;
      termLeased: number;
      tripLeased: number;
      towDriveway: number;
    };
    
    // Truck Tractors
    truckTractors: {
      owned: number;
      termLeased: number;
      tripLeased: number;
      towDriveway: number;
    };
    
    // Trailers
    trailers: {
      owned: number;
      termLeased: number;
      tripLeased: number;
      towDriveway: number;
    };
    
    // IEP Equipment (if applicable)
    iepTrailerChassis?: {
      owned: number;
      termLeased: number;
      tripLeased: number;
      towDriveway: number;
      serviced: number; // Unique to IEP
    };
    
    // Non-CMV vehicles
    nonCMVCount?: number;
    
    // International operations
    internationalVehicles?: {
      canadaCount: number;
      mexicoCount: number;
    };
    
    // Interstate/Intrastate breakout
    interstateOnlyVehicles?: number;
    intrastateOnlyVehicles?: number;
  };
  
  // ========================================
  // DRIVER INFORMATION
  // ========================================
  drivers: {
    // Interstate drivers
    interstate: {
      within100Miles: number;
      beyond100Miles: number;
    };
    
    // Intrastate drivers
    intrastate: {
      within100Miles: number;
      beyond100Miles: number;
    };
    
    // CDL holders
    cdlHolders: number;
    
    // International operations
    international?: {
      canadaDrivers: number;
      mexicoDrivers: number;
    };
  };
  
  // ========================================
  // COMPLIANCE & CERTIFICATIONS
  // ========================================
  compliance: {
    hasAffiliations: boolean;
    affiliatedEntities?: {
      usdotNumber?: string;
      mcNumber?: string;
      relationshipType: string;
    }[];
    
    // Financial responsibility
    requiresInsurance: boolean;
    cargoInsuranceRequired?: boolean;
    
    // Certifications (all Yes for compliant carriers)
    willingToComply: boolean;
    willingToProduceDocuments: boolean;
    notDisqualified: boolean;
    willDesignateProcessAgent: boolean;
    notSuspendedOrRevoked: boolean;
    deficienciesCorrected: boolean;
  };
  
  // ========================================
  // APPLICATION PREFERENCES
  // ========================================
  preferences?: {
    applicationId?: string; // If they want specific ID
    dunBradstreetNumber?: string; // If they have one
    isGovernmentEntity?: boolean;
  };
  
  // ========================================
  // EXPECTED REQUIREMENTS (for training validation)
  // ========================================
  expectedRequirements: {
    usdotRequired: boolean;
    mcAuthorityRequired: boolean;
    hazmatEndorsementRequired: boolean;
    iftaRequired: boolean;
    stateRegistrationRequired: boolean;
    reasoning: string;
  };
  
  // ========================================
  // METADATA
  // ========================================
  metadata?: {
    createdAt?: Date;
    scenarioType?: string;
    complexity?: 'simple' | 'moderate' | 'complex';
    notes?: string;
  };
}

/**
 * Convert old scenario format to enhanced format
 */
export function enhanceScenario(oldScenario: any): EnhancedUSDOTScenario {
  const totalPowerUnits = (oldScenario.vehicles?.straightTrucks?.owned || 0) + 
                         (oldScenario.vehicles?.truckTractors?.owned || 0);
  
  const isInterstate = oldScenario.transportNonHazardousInterstate === 'Yes';
  const isForHire = oldScenario.receiveCompensationForTransport === 'Yes';
  
  return {
    id: oldScenario.id,
    legalBusinessName: oldScenario.legalBusinessName,
    doingBusinessAs: oldScenario.doingBusinessAs,
    formOfBusiness: oldScenario.formOfBusiness || 'llc',
    ein: oldScenario.ein,
    businessPhone: oldScenario.businessPhone,
    
    companyContact: {
      firstName: oldScenario.companyContact?.firstName || '',
      lastName: oldScenario.companyContact?.lastName || '',
      title: oldScenario.companyContact?.title || 'Owner',
      email: oldScenario.companyContact?.email || '',
      phone: oldScenario.companyContact?.phone || oldScenario.businessPhone,
    },
    
    principalAddress: {
      street: oldScenario.principalAddress?.street || '',
      city: oldScenario.principalAddress?.city || '',
      state: oldScenario.principalAddress?.state || '',
      postalCode: oldScenario.principalAddress?.postalCode || '',
      country: 'US'
    },
    
    operations: {
      isIntermodalEquipmentProvider: false,
      transportProperty: oldScenario.operationType?.includes('property') || true,
      transportPassengers: false,
      providesBrokerServices: false,
      isFreightForwarder: false,
      operatesCargoTankFacility: false,
      isForHire: isForHire,
      isPrivateCarrier: !isForHire,
      operatesInterstate: isInterstate,
      operatesIntrastate: !isInterstate,
      transportsHazmat: oldScenario.transportHazardousMaterials === 'Yes',
      propertyTypes: ['general_freight'],
      towawayOperation: false,
      driveawayOperation: false,
    },
    
    vehicles: {
      straightTrucks: {
        owned: oldScenario.vehicles?.straightTrucks?.owned || 0,
        termLeased: oldScenario.vehicles?.straightTrucks?.termLeased || 0,
        tripLeased: 0,
        towDriveway: 0
      },
      truckTractors: {
        owned: oldScenario.vehicles?.truckTractors?.owned || 0,
        termLeased: oldScenario.vehicles?.truckTractors?.termLeased || 0,
        tripLeased: 0,
        towDriveway: 0
      },
      trailers: {
        owned: oldScenario.vehicles?.trailers?.owned || 0,
        termLeased: oldScenario.vehicles?.trailers?.termLeased || 0,
        tripLeased: 0,
        towDriveway: 0
      },
      nonCMVCount: 0,
      internationalVehicles: {
        canadaCount: 0,
        mexicoCount: 0
      },
      interstateOnlyVehicles: isInterstate ? totalPowerUnits : 0,
      intrastateOnlyVehicles: !isInterstate ? totalPowerUnits : 0,
    },
    
    drivers: {
      interstate: {
        within100Miles: isInterstate ? Math.floor(totalPowerUnits * 0.3) : 0,
        beyond100Miles: isInterstate ? totalPowerUnits - Math.floor(totalPowerUnits * 0.3) : 0,
      },
      intrastate: {
        within100Miles: !isInterstate ? Math.floor(totalPowerUnits * 0.4) : 0,
        beyond100Miles: !isInterstate ? totalPowerUnits - Math.floor(totalPowerUnits * 0.4) : 0,
      },
      cdlHolders: totalPowerUnits, // CMVs require CDL
      international: {
        canadaDrivers: 0,
        mexicoDrivers: 0
      }
    },
    
    compliance: {
      hasAffiliations: false,
      requiresInsurance: true,
      cargoInsuranceRequired: isForHire,
      willingToComply: true,
      willingToProduceDocuments: true,
      notDisqualified: true,
      willDesignateProcessAgent: true,
      notSuspendedOrRevoked: true,
      deficienciesCorrected: true,
    },
    
    preferences: {
      isGovernmentEntity: false,
    },
    
    expectedRequirements: oldScenario.expectedRequirements || {
      usdotRequired: true,
      mcAuthorityRequired: isForHire,
      hazmatEndorsementRequired: oldScenario.transportHazardousMaterials === 'Yes',
      iftaRequired: isInterstate,
      stateRegistrationRequired: true,
      reasoning: 'Auto-generated from scenario data'
    }
  };
}

