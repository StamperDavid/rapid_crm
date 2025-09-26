/**
 * REGULATORY KNOWLEDGE BASE FOR USDOT REGISTRATION
 * 
 * Contains all the regulatory requirements, thresholds, and state-specific rules
 * that the onboarding agent needs to properly assess USDOT registration needs.
 */

export interface RegulatoryThreshold {
  name: string;
  description: string;
  threshold: number;
  unit: string;
  appliesTo: string[];
  exceptions?: string[];
}

export interface StateRequirement {
  stateCode: string;
  stateName: string;
  gvwrThreshold: number;
  passengerThreshold: number;
  specialRequirements: string[];
  notes: string;
  isQualifiedState: boolean; // Qualified states supersede all other regulatory requirements
}

export interface USDOTRequirement {
  type: string;
  description: string;
  triggers: string[];
  exemptions: string[];
  requirements: string[];
}

export class RegulatoryKnowledgeBase {
  private static instance: RegulatoryKnowledgeBase;
  
  // Qualified States Configuration - These states supersede all other regulatory requirements
  private qualifiedStates: StateRequirement[] = [
    // This list will be populated by the agent configuration and can be updated as needed
    // Format: { stateCode, stateName, gvwrThreshold, passengerThreshold, specialRequirements, notes, isQualifiedState: true }
  ];
  
  // USDOT Registration Thresholds
  private readonly gvwrThresholds: RegulatoryThreshold[] = [
    {
      name: "Commercial Motor Vehicle (CMV) - Interstate",
      description: "Vehicles with GVWR over 10,000 lbs operating interstate",
      threshold: 10000,
      unit: "lbs",
      appliesTo: ["interstate_commerce"],
      exceptions: ["farm_vehicles", "recreational_vehicles"]
    },
    {
      name: "Commercial Motor Vehicle (CMV) - Intrastate",
      description: "Vehicles with GVWR over 26,000 lbs operating intrastate",
      threshold: 26000,
      unit: "lbs", 
      appliesTo: ["intrastate_commerce"],
      exceptions: ["farm_vehicles", "recreational_vehicles"]
    },
    {
      name: "Commercial Motor Vehicle (CMV) - Passenger Transport",
      description: "Vehicles designed to transport 9+ passengers for compensation",
      threshold: 9,
      unit: "passengers",
      appliesTo: ["passenger_transport"],
      exceptions: ["school_buses", "public_transit"]
    },
    {
      name: "Commercial Motor Vehicle (CMV) - Hazardous Materials",
      description: "Vehicles transporting hazmat requiring placarding",
      threshold: 1,
      unit: "any_amount",
      appliesTo: ["hazmat_transport"],
      exceptions: ["de_minimis_amounts"]
    }
  ];

  // State-Specific Requirements (fallback - qualified states supersede these)
  private readonly stateRequirements: StateRequirement[] = [
    // High GVWR States (require USDOT for vehicles over 10,000 lbs)
    { stateCode: "AL", stateName: "Alabama", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs", isQualifiedState: false },
    { stateCode: "AK", stateName: "Alaska", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "AZ", stateName: "Arizona", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "AR", stateName: "Arkansas", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "CA", stateName: "California", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA", "CARB"], notes: "Requires USDOT for vehicles over 10,000 lbs, CARB compliance" },
    { stateCode: "CO", stateName: "Colorado", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "CT", stateName: "Connecticut", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "DE", stateName: "Delaware", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "FL", stateName: "Florida", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "GA", stateName: "Georgia", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "HI", stateName: "Hawaii", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: [], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "ID", stateName: "Idaho", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "IL", stateName: "Illinois", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "IN", stateName: "Indiana", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "IA", stateName: "Iowa", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "KS", stateName: "Kansas", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "KY", stateName: "Kentucky", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "LA", stateName: "Louisiana", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "ME", stateName: "Maine", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "MD", stateName: "Maryland", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "MA", stateName: "Massachusetts", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "MI", stateName: "Michigan", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "MN", stateName: "Minnesota", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "MS", stateName: "Mississippi", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "MO", stateName: "Missouri", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "MT", stateName: "Montana", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "NE", stateName: "Nebraska", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "NV", stateName: "Nevada", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "NH", stateName: "New Hampshire", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "NJ", stateName: "New Jersey", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "NM", stateName: "New Mexico", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "NY", stateName: "New York", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "NC", stateName: "North Carolina", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "ND", stateName: "North Dakota", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "OH", stateName: "Ohio", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "OK", stateName: "Oklahoma", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "OR", stateName: "Oregon", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "PA", stateName: "Pennsylvania", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "RI", stateName: "Rhode Island", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "SC", stateName: "South Carolina", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "SD", stateName: "South Dakota", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "TN", stateName: "Tennessee", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "TX", stateName: "Texas", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "UT", stateName: "Utah", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "VT", stateName: "Vermont", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "VA", stateName: "Virginia", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "WA", stateName: "Washington", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "WV", stateName: "West Virginia", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "WI", stateName: "Wisconsin", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "WY", stateName: "Wyoming", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },
    { stateCode: "DC", stateName: "District of Columbia", gvwrThreshold: 10000, passengerThreshold: 9, specialRequirements: ["IFTA"], notes: "Requires USDOT for vehicles over 10,000 lbs" },

    // Special Cases - Higher GVWR Thresholds
    { stateCode: "AL", stateName: "Alabama", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "AK", stateName: "Alaska", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: [], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "AZ", stateName: "Arizona", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "AR", stateName: "Arkansas", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "CA", stateName: "California", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA", "CARB"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "CO", stateName: "Colorado", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "CT", stateName: "Connecticut", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "DE", stateName: "Delaware", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "FL", stateName: "Florida", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "GA", stateName: "Georgia", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "HI", stateName: "Hawaii", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: [], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "ID", stateName: "Idaho", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "IL", stateName: "Illinois", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "IN", stateName: "Indiana", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "IA", stateName: "Iowa", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "KS", stateName: "Kansas", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "KY", stateName: "Kentucky", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "LA", stateName: "Louisiana", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "ME", stateName: "Maine", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "MD", stateName: "Maryland", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "MA", stateName: "Massachusetts", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "MI", stateName: "Michigan", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "MN", stateName: "Minnesota", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "MS", stateName: "Mississippi", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "MO", stateName: "Missouri", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "MT", stateName: "Montana", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "NE", stateName: "Nebraska", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "NV", stateName: "Nevada", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "NH", stateName: "New Hampshire", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "NJ", stateName: "New Jersey", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "NM", stateName: "New Mexico", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "NY", stateName: "New York", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "NC", stateName: "North Carolina", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "ND", stateName: "North Dakota", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "OH", stateName: "Ohio", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "OK", stateName: "Oklahoma", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "OR", stateName: "Oregon", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "PA", stateName: "Pennsylvania", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "RI", stateName: "Rhode Island", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "SC", stateName: "South Carolina", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "CO", stateName: "South Dakota", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "TN", stateName: "Tennessee", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "TX", stateName: "Texas", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "UT", stateName: "Utah", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "VT", stateName: "Vermont", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "VA", stateName: "Virginia", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "WA", stateName: "Washington", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "WV", stateName: "West Virginia", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "WI", stateName: "Wisconsin", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "WY", stateName: "Wyoming", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" },
    { stateCode: "DC", stateName: "District of Columbia", gvwrThreshold: 26000, passengerThreshold: 16, specialRequirements: ["IFTA"], notes: "Intrastate: 26,000 lbs GVWR threshold" }
  ];

  // USDOT Registration Requirements
  private readonly usdotRequirements: USDOTRequirement[] = [
    {
      type: "USDOT Registration",
      description: "Required for commercial motor vehicles operating interstate or meeting state thresholds",
      triggers: [
        "Vehicle GVWR > 10,000 lbs AND interstate commerce",
        "Vehicle GVWR > state threshold AND intrastate commerce", 
        "Vehicle designed for 9+ passengers for compensation",
        "Transporting hazmat requiring placarding",
        "Operating as interstate carrier, broker, or freight forwarder"
      ],
      exemptions: [
        "Farm vehicles operating within 150 miles of farm",
        "Recreational vehicles not for hire",
        "Vehicles transporting only exempt commodities",
        "Government vehicles",
        "Emergency vehicles"
      ],
      requirements: [
        "USDOT Number registration",
        "Process Agent designation",
        "Insurance requirements",
        "Safety management system",
        "Drug and alcohol testing program"
      ]
    },
    {
      type: "Motor Carrier Authority (MC)",
      description: "Required for transporting passengers or property for compensation",
      triggers: [
        "Transporting property for compensation interstate",
        "Transporting passengers for compensation interstate",
        "Operating as freight forwarder",
        "Operating as broker"
      ],
      exemptions: [
        "Transporting own property",
        "Transporting exempt commodities only",
        "Intrastate operations only"
      ],
      requirements: [
        "MC Number application",
        "BOC-3 form (Process Agent)",
        "Insurance requirements",
        "Operating authority",
        "Tariff requirements"
      ]
    },
    {
      type: "IFTA Registration",
      description: "International Fuel Tax Agreement for interstate fuel tax reporting",
      triggers: [
        "Operating in 2+ IFTA jurisdictions",
        "Vehicle GVWR > 26,000 lbs",
        "Operating interstate for compensation"
      ],
      exemptions: [
        "Intrastate operations only",
        "Vehicles under 26,000 lbs GVWR",
        "Recreational vehicles"
      ],
      requirements: [
        "IFTA license",
        "Quarterly fuel tax returns",
        "Distance records",
        "Fuel receipts"
      ]
    },
    {
      type: "ELD Compliance",
      description: "Electronic Logging Device requirements",
      triggers: [
        "CDL drivers operating interstate",
        "Vehicle GVWR > 10,000 lbs interstate",
        "Drivers subject to HOS regulations"
      ],
      exemptions: [
        "Drivers with 8-day exemption",
        "Short-haul drivers (100 air miles)",
        "Driveaway-towaway operations"
      ],
      requirements: [
        "ELD device installation",
        "Driver training on ELD use",
        "ELD data retention",
        "Backup methods for data transfer"
      ]
    },
    {
      type: "Hazmat Endorsement",
      description: "Required for transporting hazardous materials",
      triggers: [
        "Transporting placardable quantities of hazmat",
        "CDL drivers transporting hazmat",
        "Vehicles carrying hazmat requiring placarding"
      ],
      exemptions: [
        "De minimis quantities",
        "Consumer commodities",
        "Limited quantities"
      ],
      requirements: [
        "Hazmat endorsement on CDL",
        "Security threat assessment",
        "Hazmat training certification",
        "Proper placarding and labeling"
      ]
    }
  ];

  private constructor() {}

  public static getInstance(): RegulatoryKnowledgeBase {
    if (!RegulatoryKnowledgeBase.instance) {
      RegulatoryKnowledgeBase.instance = new RegulatoryKnowledgeBase();
    }
    return RegulatoryKnowledgeBase.instance;
  }

  /**
   * Set the qualified states list - these supersede all other regulatory requirements
   */
  public setQualifiedStates(qualifiedStates: StateRequirement[]): void {
    this.qualifiedStates = qualifiedStates.map(state => ({
      ...state,
      isQualifiedState: true
    }));
  }

  /**
   * Get the current qualified states list
   */
  public getQualifiedStates(): StateRequirement[] {
    return this.qualifiedStates;
  }

  /**
   * Add or update a qualified state
   */
  public addQualifiedState(state: StateRequirement): void {
    const existingIndex = this.qualifiedStates.findIndex(s => s.stateCode === state.stateCode);
    const qualifiedState = { ...state, isQualifiedState: true };
    
    if (existingIndex >= 0) {
      this.qualifiedStates[existingIndex] = qualifiedState;
    } else {
      this.qualifiedStates.push(qualifiedState);
    }
  }

  /**
   * Remove a qualified state
   */
  public removeQualifiedState(stateCode: string): void {
    this.qualifiedStates = this.qualifiedStates.filter(s => s.stateCode !== stateCode);
  }

  /**
   * Determine if USDOT registration is required based on vehicle and operation details
   * Qualified states supersede all other regulatory requirements for GVWR and passenger thresholds
   */
  public requiresUSDOT(vehicleDetails: {
    gvwr: number;
    passengers: number;
    interstate: boolean;
    forHire: boolean;
    hazmat: boolean;
    stateCode: string;
  }): {
    required: boolean;
    reason: string;
    additionalRequirements: string[];
    regulatorySource: string;
  } {
    const { gvwr, passengers, interstate, forHire, hazmat, stateCode } = vehicleDetails;
    
    // FIRST: Check qualified states (these supersede all other requirements)
    const qualifiedState = this.qualifiedStates.find(s => s.stateCode === stateCode);
    if (qualifiedState) {
      if (gvwr > qualifiedState.gvwrThreshold || passengers >= qualifiedState.passengerThreshold) {
        return {
          required: true,
          reason: `Qualified State: ${qualifiedState.stateName} requires USDOT for GVWR > ${qualifiedState.gvwrThreshold} lbs or ${qualifiedState.passengerThreshold}+ passengers`,
          additionalRequirements: ["USDOT", ...qualifiedState.specialRequirements],
          regulatorySource: `Qualified State (${qualifiedState.stateCode})`
        };
      }
    }
    
    // SECOND: Check interstate commerce requirements (if not in qualified state or doesn't meet qualified state thresholds)
    if (interstate && (gvwr > 10000 || passengers >= 9 || hazmat)) {
      return {
        required: true,
        reason: "Interstate commerce with CMV (GVWR > 10,000 lbs, 9+ passengers, or hazmat)",
        additionalRequirements: ["USDOT", "MC", "IFTA", "ELD"],
        regulatorySource: "Federal Interstate Commerce"
      };
    }

    // THIRD: Check state-specific intrastate requirements (fallback)
    const stateReq = this.getStateRequirement(stateCode);
    if (!interstate && stateReq && !qualifiedState && gvwr > stateReq.gvwrThreshold) {
      return {
        required: true,
        reason: `Intrastate operation in ${stateReq.stateName} with GVWR > ${stateReq.gvwrThreshold} lbs`,
        additionalRequirements: ["USDOT", ...stateReq.specialRequirements],
        regulatorySource: `State Requirements (${stateReq.stateCode})`
      };
    }

    // Check passenger transport (always applies regardless of qualified state status)
    if (passengers >= 9 && forHire) {
      return {
        required: true,
        reason: "Passenger transport for compensation (9+ passengers)",
        additionalRequirements: ["USDOT", "MC"],
        regulatorySource: "Federal Passenger Transport"
      };
    }

    // Check hazmat transport (always applies regardless of qualified state status)
    if (hazmat) {
      return {
        required: true,
        reason: "Transporting hazardous materials requiring placarding",
        additionalRequirements: ["USDOT", "MC", "Hazmat"],
        regulatorySource: "Federal Hazmat Regulations"
      };
    }

    return {
      required: false,
      reason: "Does not meet USDOT registration requirements",
      additionalRequirements: [],
      regulatorySource: "No applicable requirements"
    };
  }

  /**
   * Get state-specific requirements
   */
  public getStateRequirement(stateCode: string): StateRequirement | null {
    return this.stateRequirements.find(req => req.stateCode === stateCode) || null;
  }

  /**
   * Get all regulatory thresholds
   */
  public getGVWRThresholds(): RegulatoryThreshold[] {
    return this.gvwrThresholds;
  }

  /**
   * Get all USDOT requirements
   */
  public getUSDOTRequirements(): USDOTRequirement[] {
    return this.usdotRequirements;
  }

  /**
   * Get comprehensive regulatory guidance for a scenario
   */
  public getRegulatoryGuidance(scenario: {
    businessType: string;
    operations: string[];
    vehicles: any;
    interstate: boolean;
    stateCode: string;
  }): {
    requiredRegistrations: string[];
    exemptions: string[];
    specialConsiderations: string[];
    complianceSteps: string[];
  } {
    const guidance = {
      requiredRegistrations: [] as string[],
      exemptions: [] as string[],
      specialConsiderations: [] as string[],
      complianceSteps: [] as string[]
    };

    // Analyze each vehicle type
    if (scenario.vehicles.straightTrucks) {
      const totalStraightTrucks = Object.values(scenario.vehicles.straightTrucks).reduce((sum: number, count: any) => sum + (count || 0), 0);
      if (totalStraightTrucks > 0) {
        guidance.requiredRegistrations.push("Vehicle registration analysis required");
        guidance.complianceSteps.push("Determine GVWR of each straight truck");
      }
    }

    if (scenario.vehicles.truckTractors) {
      const totalTractors = Object.values(scenario.vehicles.truckTractors).reduce((sum: number, count: any) => sum + (count || 0), 0);
      if (totalTractors > 0) {
        guidance.requiredRegistrations.push("Tractor-trailer operation analysis");
        guidance.complianceSteps.push("Determine GVWR of tractors and trailers");
        guidance.complianceSteps.push("Check IFTA requirements for interstate operations");
      }
    }

    // Check for special operations
    if (scenario.operations.includes('hazmat')) {
      guidance.requiredRegistrations.push("Hazmat compliance");
      guidance.specialConsiderations.push("Hazmat endorsement required for drivers");
      guidance.specialConsiderations.push("Proper placarding and labeling required");
    }

    if (scenario.operations.includes('passenger')) {
      guidance.requiredRegistrations.push("Passenger transport authority");
      guidance.specialConsiderations.push("Passenger insurance requirements");
      guidance.specialConsiderations.push("Safety ratings and compliance");
    }

    if (scenario.operations.includes('broker')) {
      guidance.requiredRegistrations.push("Broker authority");
      guidance.specialConsiderations.push("Bond requirements");
      guidance.specialConsiderations.push("Tariff and rate requirements");
    }

    // State-specific considerations
    const stateReq = this.getStateRequirement(scenario.stateCode);
    if (stateReq) {
      guidance.specialConsiderations.push(`${stateReq.stateName} specific requirements: ${stateReq.notes}`);
    }

    return guidance;
  }

  /**
   * Validate a training scenario for regulatory accuracy
   */
  public validateScenario(scenario: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const result = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[],
      recommendations: [] as string[]
    };

    // Check if scenario has proper vehicle weight classifications
    if (scenario.vehicles) {
      const hasWeightInfo = scenario.vehicles.straightTrucks || scenario.vehicles.truckTractors;
      if (hasWeightInfo) {
        result.warnings.push("Scenario should specify GVWR ranges for proper regulatory assessment");
      }
    }

    // Check for interstate vs intrastate clarity
    if (scenario.operations && scenario.operations.includes('interstate')) {
      if (!scenario.stateCode) {
        result.errors.push("Interstate scenarios must specify home state for proper regulatory analysis");
        result.isValid = false;
      }
    }

    // Validate business type against operations
    if (scenario.businessForm === 'sole_proprietor' && scenario.operations.includes('broker')) {
      result.warnings.push("Sole proprietors operating as brokers may need additional business structure considerations");
    }

    return result;
  }
}
