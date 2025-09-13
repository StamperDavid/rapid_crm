import { aiIntegrationService } from './AIIntegrationService';

export interface USDOTApplicationData {
  // Basic Company Information
  legalBusinessName: string;
  dbaName?: string;
  businessType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'other';
  businessAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  mailingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Contact Information
  contactPerson: {
    firstName: string;
    lastName: string;
    title: string;
    phone: string;
    email: string;
  };
  
  // Operation Details
  operationType: 'for_hire' | 'private' | 'both';
  cargoType: string[];
  operationRadius: 'intrastate' | 'interstate';
  vehicleCount: number;
  driverCount: number;
  
  // Vehicle Information
  vehicles: Array<{
    type: 'truck' | 'tractor' | 'trailer' | 'bus' | 'van' | 'other';
    gvwr: number;
    passengerCapacity?: number;
    year: number;
    make: string;
    model: string;
  }>;
  
  // Compliance Requirements (determined by agent)
  requiredRegistrations: string[];
  requiresAuthority: boolean;
  authorityType?: 'mc' | 'ff' | 'broker' | 'none';
  
  // Pricing and Payment
  totalCost: number;
  breakdown: {
    usdot: number;
    authority?: number;
    compliance: number;
    processing: number;
  };
  paymentMethod?: 'credit_card' | 'ach' | 'check';
  paymentProcessed: boolean;
  
  // Status Tracking
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  status: 'collecting_data' | 'reviewing' | 'payment_pending' | 'processing' | 'completed' | 'handoff';
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  cost: number;
  reason: string;
}

export interface OnboardingContext {
  clientData: USDOTApplicationData;
  currentStep: number;
  conversationHistory: Array<{
    type: 'user' | 'agent';
    content: string;
    timestamp: Date;
  }>;
  qualifiedStates: string[];
  rapidCompliancePricing: {
    usdot: number;
    mc: number;
    ff: number;
    broker: number;
    compliance: number;
    processing: number;
  };
}

export class OnboardingAgentService {
  private qualifiedStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  private rapidCompliancePricing = {
    usdot: 0, // Free
    mc: 300, // Motor Carrier Authority
    ff: 250, // Freight Forwarder Authority
    broker: 200, // Broker Authority
    compliance: 150, // Compliance monitoring
    processing: 50 // Processing fee
  };

  private gvwrThresholds = {
    truck: 10000, // 10,000 lbs
    bus: 8 // 8+ passengers
  };

  async processOnboardingMessage(
    message: string,
    context: OnboardingContext
  ): Promise<{
    response: string;
    nextStep: number;
    updatedData?: Partial<USDOTApplicationData>;
    requiresPayment?: boolean;
    handoffToCustomerService?: boolean;
  }> {
    try {
      // Determine what information we need based on current step
      const stepInfo = this.getStepInformation(context.currentStep);
      
      // Process the message based on current step
      const result = await this.processStepMessage(message, context, stepInfo);
      
      return result;
    } catch (error) {
      console.error('Error processing onboarding message:', error);
      return {
        response: "I apologize, but I'm having trouble processing your request. Let me help you with that again. Could you please repeat your answer?",
        nextStep: context.currentStep
      };
    }
  }

  private getStepInformation(step: number) {
    const steps = {
      1: {
        title: "Welcome & Company Name",
        description: "Let's start with your company's legal business name",
        field: "legalBusinessName",
        question: "What is your company's legal business name?",
        validation: (value: string) => value.length > 2
      },
      2: {
        title: "Business Type",
        description: "What type of business entity are you?",
        field: "businessType",
        question: "What type of business entity is your company? (Corporation, LLC, Partnership, Sole Proprietorship, or Other)",
        validation: (value: string) => ['corporation', 'llc', 'partnership', 'sole_proprietorship', 'other'].includes(value.toLowerCase())
      },
      3: {
        title: "Business Address",
        description: "Where is your business located?",
        field: "businessAddress",
        question: "What is your business address? Please provide street address, city, state, and zip code.",
        validation: (value: any) => value.street && value.city && value.state && value.zipCode
      },
      4: {
        title: "Contact Information",
        description: "Who should we contact for this application?",
        field: "contactPerson",
        question: "Who is the main contact person for this application? Please provide their name, title, phone number, and email address.",
        validation: (value: any) => value.firstName && value.lastName && value.phone && value.email
      },
      5: {
        title: "Operation Type",
        description: "What type of transportation operation do you run?",
        field: "operationType",
        question: "Are you operating for-hire (carrying goods for others for payment), private (carrying your own goods), or both?",
        validation: (value: string) => ['for_hire', 'private', 'both'].includes(value.toLowerCase())
      },
      6: {
        title: "Cargo Type",
        description: "What type of cargo do you transport?",
        field: "cargoType",
        question: "What type of cargo do you typically transport? (e.g., general freight, hazardous materials, passengers, etc.)",
        validation: (value: string[]) => value.length > 0
      },
      7: {
        title: "Operation Radius",
        description: "Do you operate within one state or across state lines?",
        field: "operationRadius",
        question: "Do you operate only within one state (intrastate) or do you cross state lines (interstate)?",
        validation: (value: string) => ['intrastate', 'interstate'].includes(value.toLowerCase())
      },
      8: {
        title: "Vehicle Information",
        description: "Tell us about your vehicles",
        field: "vehicles",
        question: "Please describe your vehicles. What type, year, make, model, and what is the Gross Vehicle Weight Rating (GVWR) or passenger capacity?",
        validation: (value: any[]) => value.length > 0
      },
      9: {
        title: "Compliance Review",
        description: "Based on your operation, here's what you need",
        field: "requiredRegistrations",
        question: "Based on your operation details, I've determined your compliance requirements. Let me explain what you need and the costs involved.",
        validation: (value: string[]) => true
      },
      10: {
        title: "Payment & Registration",
        description: "Choose your registration options and complete payment",
        field: "paymentMethod",
        question: "Would you like to proceed with all required registrations, or just start with the USDOT number? The USDOT application is free, but other authorities have costs.",
        validation: (value: string) => ['credit_card', 'ach', 'check'].includes(value.toLowerCase())
      }
    };

    return steps[step as keyof typeof steps] || steps[1];
  }

  private async processStepMessage(
    message: string,
    context: OnboardingContext,
    stepInfo: any
  ): Promise<{
    response: string;
    nextStep: number;
    updatedData?: Partial<USDOTApplicationData>;
    requiresPayment?: boolean;
    handoffToCustomerService?: boolean;
  }> {
    const lowerMessage = message.toLowerCase();

    // Handle special cases
    if (lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
      return this.handlePricingQuestion(context);
    }

    if (lowerMessage.includes('regulation') || lowerMessage.includes('rule') || lowerMessage.includes('requirement')) {
      return this.handleRegulationQuestion(message, context);
    }

    if (lowerMessage.includes('authority') || lowerMessage.includes('mc') || lowerMessage.includes('broker')) {
      return this.handleAuthorityQuestion(context);
    }

    // Process based on current step
    switch (context.currentStep) {
      case 1:
        return this.processCompanyName(message, context);
      case 2:
        return this.processBusinessType(message, context);
      case 3:
        return this.processBusinessAddress(message, context);
      case 4:
        return this.processContactInfo(message, context);
      case 5:
        return this.processOperationType(message, context);
      case 6:
        return this.processCargoType(message, context);
      case 7:
        return this.processOperationRadius(message, context);
      case 8:
        return this.processVehicleInfo(message, context);
      case 9:
        return this.processComplianceReview(message, context);
      case 10:
        return this.processPayment(message, context);
      default:
        return {
          response: "Thank you for providing that information. Let me help you with the next step in your USDOT application process.",
          nextStep: context.currentStep + 1
        };
    }
  }

  private async processCompanyName(message: string, context: OnboardingContext) {
    const companyName = message.trim();
    if (companyName.length < 3) {
      return {
        response: "I need your company's legal business name. Please provide the full legal name as it appears on your business registration.",
        nextStep: 1
      };
    }

    return {
      response: `Great! I have your company name as "${companyName}". Now, what type of business entity is your company? (Corporation, LLC, Partnership, Sole Proprietorship, or Other)`,
      nextStep: 2,
      updatedData: { legalBusinessName: companyName }
    };
  }

  private async processBusinessType(message: string, context: OnboardingContext) {
    const lowerMessage = message.toLowerCase();
    let businessType = 'other';

    if (lowerMessage.includes('corporation') || lowerMessage.includes('corp')) {
      businessType = 'corporation';
    } else if (lowerMessage.includes('llc') || lowerMessage.includes('limited liability')) {
      businessType = 'llc';
    } else if (lowerMessage.includes('partnership')) {
      businessType = 'partnership';
    } else if (lowerMessage.includes('sole') || lowerMessage.includes('proprietorship')) {
      businessType = 'sole_proprietorship';
    }

    return {
      response: `Perfect! I have your business type as ${businessType.replace('_', ' ')}. Now, what is your business address? Please provide the street address, city, state, and zip code.`,
      nextStep: 3,
      updatedData: { businessType: businessType as any }
    };
  }

  private async processBusinessAddress(message: string, context: OnboardingContext) {
    // Simple address parsing - in production, you'd want more sophisticated parsing
    const addressParts = message.split(',').map(part => part.trim());
    
    if (addressParts.length < 4) {
      return {
        response: "I need your complete business address. Please provide it in this format: Street Address, City, State, Zip Code",
        nextStep: 3
      };
    }

    const businessAddress = {
      street: addressParts[0],
      city: addressParts[1],
      state: addressParts[2],
      zipCode: addressParts[3]
    };

    return {
      response: `Thank you! I have your business address as ${businessAddress.street}, ${businessAddress.city}, ${businessAddress.state} ${businessAddress.zipCode}. Now, who is the main contact person for this application? Please provide their name, title, phone number, and email address.`,
      nextStep: 4,
      updatedData: { businessAddress }
    };
  }

  private async processContactInfo(message: string, context: OnboardingContext) {
    // Simple contact parsing - in production, you'd want more sophisticated parsing
    const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const phoneMatch = message.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);

    if (!emailMatch || !phoneMatch) {
      return {
        response: "I need the contact person's complete information. Please provide their name, title, phone number, and email address.",
        nextStep: 4
      };
    }

    // Extract name and title (simplified)
    const parts = message.split(',').map(part => part.trim());
    const contactPerson = {
      firstName: parts[0].split(' ')[0] || 'Unknown',
      lastName: parts[0].split(' ').slice(1).join(' ') || 'Unknown',
      title: parts[1] || 'Contact',
      phone: phoneMatch[0],
      email: emailMatch[0]
    };

    return {
      response: `Excellent! I have your contact information. Now, are you operating for-hire (carrying goods for others for payment), private (carrying your own goods), or both?`,
      nextStep: 5,
      updatedData: { contactPerson }
    };
  }

  private async processOperationType(message: string, context: OnboardingContext) {
    const lowerMessage = message.toLowerCase();
    let operationType = 'private';

    if (lowerMessage.includes('for-hire') || lowerMessage.includes('for hire') || lowerMessage.includes('hire')) {
      operationType = 'for_hire';
    } else if (lowerMessage.includes('both')) {
      operationType = 'both';
    }

    return {
      response: `Got it! You're operating ${operationType.replace('_', ' ')}. What type of cargo do you typically transport? (e.g., general freight, hazardous materials, passengers, etc.)`,
      nextStep: 6,
      updatedData: { operationType: operationType as any }
    };
  }

  private async processCargoType(message: string, context: OnboardingContext) {
    const cargoTypes = message.split(',').map(type => type.trim()).filter(type => type.length > 0);

    if (cargoTypes.length === 0) {
      return {
        response: "Please tell me what type of cargo you transport. For example: general freight, hazardous materials, passengers, etc.",
        nextStep: 6
      };
    }

    return {
      response: `Perfect! I have your cargo types as: ${cargoTypes.join(', ')}. Now, do you operate only within one state (intrastate) or do you cross state lines (interstate)?`,
      nextStep: 7,
      updatedData: { cargoType: cargoTypes }
    };
  }

  private async processOperationRadius(message: string, context: OnboardingContext) {
    const lowerMessage = message.toLowerCase();
    const operationRadius = lowerMessage.includes('interstate') || lowerMessage.includes('cross') || lowerMessage.includes('state lines') ? 'interstate' : 'intrastate';

    return {
      response: `Understood! You operate ${operationRadius}. Now, please describe your vehicles. What type, year, make, model, and what is the Gross Vehicle Weight Rating (GVWR) or passenger capacity?`,
      nextStep: 8,
      updatedData: { operationRadius: operationRadius as any }
    };
  }

  private async processVehicleInfo(message: string, context: OnboardingContext) {
    // Simplified vehicle parsing - in production, you'd want more sophisticated parsing
    const vehicles = [{
      type: 'truck' as const,
      gvwr: 26000, // Default assumption
      year: 2020,
      make: 'Unknown',
      model: 'Unknown'
    }];

    // Determine compliance requirements based on vehicle info
    const complianceRequirements = this.determineComplianceRequirements(context.clientData, vehicles);

    return {
      response: `Thank you for the vehicle information! Based on your operation details, I've determined your compliance requirements. Let me explain what you need and the costs involved.`,
      nextStep: 9,
      updatedData: { 
        vehicles,
        requiredRegistrations: complianceRequirements.map(req => req.id),
        requiresAuthority: complianceRequirements.some(req => req.id.includes('mc') || req.id.includes('broker'))
      }
    };
  }

  private async processComplianceReview(message: string, context: OnboardingContext) {
    const requirements = this.determineComplianceRequirements(context.clientData, context.clientData.vehicles);
    const totalCost = requirements.reduce((sum, req) => sum + req.cost, 0);

    let response = `Based on your operation, here's what you need:\n\n`;
    
    requirements.forEach(req => {
      response += `• ${req.name}: $${req.cost} - ${req.reason}\n`;
    });

    response += `\nTotal Cost: $${totalCost}\n\n`;
    response += `The USDOT application is free, but other authorities have costs. `;
    
    if (context.clientData.requiresAuthority) {
      response += `Since your operation requires an authority, there will be additional charges before we can proceed. `;
    }

    response += `Would you like to proceed with all required registrations, or just start with the USDOT number?`;

    return {
      response,
      nextStep: 10,
      updatedData: { 
        totalCost,
        breakdown: {
          usdot: 0,
          authority: requirements.find(req => req.id.includes('mc'))?.cost || 0,
          compliance: requirements.find(req => req.id.includes('compliance'))?.cost || 0,
          processing: this.rapidCompliancePricing.processing
        }
      }
    };
  }

  private async processPayment(message: string, context: OnboardingContext) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('all') || lowerMessage.includes('complete') || lowerMessage.includes('everything')) {
      return {
        response: `Perfect! You've chosen to proceed with all required registrations. The total cost is $${context.clientData.totalCost}. Please provide your payment information to complete the registration process.`,
        nextStep: 11,
        requiresPayment: true
      };
    } else if (lowerMessage.includes('usdot') || lowerMessage.includes('free') || lowerMessage.includes('just')) {
      return {
        response: `Great choice! We'll start with just the USDOT number, which is free. I'll process your USDOT application now and set up your client portal account.`,
        nextStep: 11,
        updatedData: { 
          totalCost: 0,
          breakdown: { usdot: 0, compliance: 0, processing: 0 }
        }
      };
    } else {
      return {
        response: `I need to know if you'd like to proceed with all required registrations ($${context.clientData.totalCost}) or just start with the free USDOT number. Which would you prefer?`,
        nextStep: 10
      };
    }
  }

  private handlePricingQuestion(context: OnboardingContext) {
    let response = `I can only provide Rapid Compliance pricing information. Here's our current pricing:\n\n`;
    response += `• USDOT Application: FREE\n`;
    response += `• Motor Carrier Authority: $${this.rapidCompliancePricing.mc}\n`;
    response += `• Freight Forwarder Authority: $${this.rapidCompliancePricing.ff}\n`;
    response += `• Broker Authority: $${this.rapidCompliancePricing.broker}\n`;
    response += `• Compliance Monitoring: $${this.rapidCompliancePricing.compliance}\n`;
    response += `• Processing Fee: $${this.rapidCompliancePricing.processing}\n\n`;
    response += `I don't have access to FMCSA's direct pricing, only Rapid Compliance pricing.`;

    return {
      response,
      nextStep: context.currentStep
    };
  }

  private handleRegulationQuestion(message: string, context: OnboardingContext) {
    let response = `I'd be happy to explain transportation regulations! `;
    
    if (message.toLowerCase().includes('gvwr') || message.toLowerCase().includes('weight')) {
      response += `The GVWR (Gross Vehicle Weight Rating) thresholds are important, but our qualified states list supersedes these requirements. `;
    }
    
    response += `The key regulations depend on your operation type, cargo, and whether you cross state lines. `;
    response += `Once I collect all your information, I can tell you exactly which regulations apply to your specific operation. `;
    response += `Would you like to continue with the application so I can give you personalized guidance?`;

    return {
      response,
      nextStep: context.currentStep
    };
  }

  private handleAuthorityQuestion(context: OnboardingContext) {
    let response = `Great question about authorities! `;
    
    if (context.clientData.operationType === 'for_hire' || context.clientData.operationType === 'both') {
      response += `Since you're operating for-hire, you'll likely need a Motor Carrier (MC) authority. `;
      response += `The cost for MC authority through Rapid Compliance is $${this.rapidCompliancePricing.mc}. `;
    } else {
      response += `Since you're operating privately, you may not need an authority, but let me determine that based on your complete operation details. `;
    }
    
    response += `I'll know for sure once we complete your application information.`;

    return {
      response,
      nextStep: context.currentStep
    };
  }

  private determineComplianceRequirements(clientData: USDOTApplicationData, vehicles: any[]): ComplianceRequirement[] {
    const requirements: ComplianceRequirement[] = [];

    // USDOT is always required
    requirements.push({
      id: 'usdot',
      name: 'USDOT Number',
      description: 'Required for all commercial motor vehicle operations',
      required: true,
      cost: 0,
      reason: 'Required for all commercial operations'
    });

    // Check if authority is needed
    if (clientData.operationType === 'for_hire' || clientData.operationType === 'both') {
      if (clientData.operationRadius === 'interstate') {
        requirements.push({
          id: 'mc_authority',
          name: 'Motor Carrier Authority (MC)',
          description: 'Required for interstate for-hire operations',
          required: true,
          cost: this.rapidCompliancePricing.mc,
          reason: 'Interstate for-hire operation requires MC authority'
        });
      }
    }

    // Check for hazardous materials
    if (clientData.cargoType.some(cargo => 
      cargo.toLowerCase().includes('hazmat') || 
      cargo.toLowerCase().includes('hazardous') ||
      cargo.toLowerCase().includes('dangerous')
    )) {
      requirements.push({
        id: 'hazmat',
        name: 'Hazardous Materials Endorsement',
        description: 'Required for transporting hazardous materials',
        required: true,
        cost: 0, // This is typically handled through driver licensing
        reason: 'Hazardous materials cargo detected'
      });
    }

    // Check for passenger transport
    if (clientData.cargoType.some(cargo => 
      cargo.toLowerCase().includes('passenger') || 
      cargo.toLowerCase().includes('people')
    )) {
      requirements.push({
        id: 'passenger',
        name: 'Passenger Transport Authority',
        description: 'Required for passenger transportation',
        required: true,
        cost: this.rapidCompliancePricing.mc,
        reason: 'Passenger transportation detected'
      });
    }

    // Add compliance monitoring
    requirements.push({
      id: 'compliance_monitoring',
      name: 'Compliance Monitoring',
      description: 'Ongoing compliance monitoring and support',
      required: true,
      cost: this.rapidCompliancePricing.compliance,
      reason: 'Recommended for all operations'
    });

    return requirements;
  }

  async completeOnboarding(context: OnboardingContext): Promise<{
    success: boolean;
    message: string;
    handoffToCustomerService: boolean;
  }> {
    try {
      // Save client data to database
      // Process payment if required
      // Create deal in system
      // Set up portal account
      
      return {
        success: true,
        message: "Your application has been submitted successfully! I'm now transferring you to our customer service team who will help you set up your portal account and guide you through the next steps.",
        handoffToCustomerService: true
      };
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return {
        success: false,
        message: "I apologize, but there was an issue processing your application. Let me transfer you to our customer service team who can help resolve this.",
        handoffToCustomerService: true
      };
    }
  }
}

export const onboardingAgentService = new OnboardingAgentService();
