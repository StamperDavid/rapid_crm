/**
 * Intelligent Data Mapper
 * Uses AI to understand what form questions are asking and map them to client data
 * 
 * This is the BRAIN of the RPA agent - it needs to be truly intelligent to handle:
 * - Questions worded any way
 * - FMCSA changing question text
 * - New questions added
 * - Complex reasoning (e.g., "if they transport for hire, they need MC authority")
 */

import { ExtractedQuestion } from './IntelligentFormReader';
import { USDOTScenario } from './SemanticQuestionMatcher';
import { EnhancedUSDOTScenario } from './EnhancedUSDOTScenario';
import { LLMService } from '../ai/LLMService';
import { getLLMConfig, isLLMAvailable, AI_CONFIG } from '../../config/ai.config';

export interface IntelligenceConfig {
  mode: 'llm' | 'local' | 'hybrid';
  llmProvider?: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model?: string;
}

// Support both old and new scenario formats
export type AnyUSDOTScenario = USDOTScenario | EnhancedUSDOTScenario;

export interface MappingDecision {
  answer: string | string[];
  confidence: number; // 0-1
  reasoning: string; // WHY this mapping was chosen
  dataSource: string; // Which client data field(s) were used
  needsHumanReview?: boolean; // Flag uncertain mappings
}

/**
 * The intelligent core that understands questions and maps data
 */
export class IntelligentDataMapper {
  private config: IntelligenceConfig;
  private learningCache: Map<string, MappingDecision> = new Map(); // Learned mappings
  private domainKnowledge: Map<string, any> = new Map(); // DOT compliance rules
  private llmService: LLMService | null = null;
  
  constructor(config?: IntelligenceConfig) {
    // Use config passed directly (contains API key from database)
    if (config) {
      console.log('🔍 IntelligentDataMapper - Using provided config:', {
        mode: config.mode,
        provider: config.llmProvider,
        hasApiKey: !!config.apiKey,
        apiKeyPrefix: config.apiKey?.substring(0, 10) + '...'
      });
      
      this.config = config;
    } else {
      // Fallback to centralized config
      const llmConfig = getLLMConfig();
      this.config = {
        mode: 'llm',
        llmProvider: llmConfig.provider,
        apiKey: llmConfig.apiKey,
        model: llmConfig.model
      };
    }
    
    this.initializeDomainKnowledge();
    
    // Initialize LLM service if we have an API key
    if (this.config.apiKey && this.config.apiKey.startsWith('sk-')) {
      try {
        this.llmService = LLMService.getInstance({
          provider: this.config.llmProvider || 'openai',
          apiKey: this.config.apiKey,
          model: this.config.model,
          temperature: 0.1,
          maxTokens: 500
        });
        console.log('✅ TRUE INTELLIGENCE ENABLED: Using ' + (this.config.llmProvider || 'openai').toUpperCase());
        this.config.mode = 'llm';
      } catch (error) {
        console.error('❌ Failed to initialize LLM service:', error);
        
        if (!AI_CONFIG.allowPatternMatchingFallback) {
          throw new Error('USDOT RPA Agent requires LLM but initialization failed.');
        }
        
        this.config.mode = 'local';
      }
    } else {
      console.error('❌ NO VALID API KEY - Cannot enable TRUE intelligence');
      
      if (!AI_CONFIG.allowPatternMatchingFallback) {
        throw new Error('USDOT RPA Agent requires LLM. Provide valid API key.');
      }
      
      this.config.mode = 'local';
    }
  }
  
  /**
   * Main intelligence function: understand question and determine answer
   */
  async determineAnswer(
    question: ExtractedQuestion,
    clientData: AnyUSDOTScenario
  ): Promise<MappingDecision | null> {
    const questionKey = this.normalizeQuestion(question.questionText);
    
    // Check learning cache first (agent remembers past corrections)
    if (this.learningCache.has(questionKey)) {
      const cached = this.learningCache.get(questionKey)!;
      console.log(`🧠 Using learned mapping for: "${question.questionText}"`);
      return cached;
    }
    
    // Use REAL AI intelligence via LLM
    let decision: MappingDecision | null = null;
    
    // REQUIRE LLM for TRUE intelligence
    if (this.llmService) {
      console.log('🤖 Using LLM for TRUE intelligence...');
      decision = await this.llmReasoning(question, clientData);
      
      // If LLM succeeds, cache it for speed next time
      if (decision) {
        this.learningCache.set(questionKey, decision);
        return decision;
      }
      
      // LLM failed but we have service - this is an error
      console.error('❌ LLM reasoning failed for question:', question.questionText);
    }
    
    // No LLM available - check if fallback allowed
    if (!AI_CONFIG.allowPatternMatchingFallback) {
      console.error('❌ AGENT CANNOT FUNCTION: LLM required but unavailable');
      console.error('📝 Add VITE_OPENAI_API_KEY to .env file');
      return null; // Agent will fail, as it should
    }
    
    // Fallback to pattern matching (only if allowed in config)
    console.warn('⚠️ Using pattern matching fallback (NOT truly intelligent)');
    decision = this.domainExpertReasoning(question, clientData);
    
    return decision;
  }
  
  /**
   * LLM-based reasoning - TRUE INTELLIGENCE
   * Uses GPT-4 or Claude to understand ANY question wording
   */
  private async llmReasoning(
    question: ExtractedQuestion,
    clientData: AnyUSDOTScenario
  ): Promise<MappingDecision | null> {
    if (!this.llmService) {
      return null;
    }
    
    try {
      const prompt = this.buildLLMPrompt(question, clientData);
      
      console.log(`🤖 Asking LLM: "${question.questionText}"`);
      
      // Use LLM service for TRUE semantic understanding
      const result = await this.llmService.getStructuredResponse<{
        answer: string | string[];
        dataSource: string;
        reasoning: string;
        confidence: number;
      }>([
        {
          role: 'system',
          content: `You are an expert DOT compliance specialist analyzing USDOT registration forms.

Your job: Read questions from the FMCSA form and determine the correct answer from client data.

KEY RULES:
1. UNDERSTAND the question semantically (not just keywords)
2. MAP question to appropriate client data field
3. REASON through DOT regulations if needed
4. Return confidence 0-1 (1.0 = certain, <0.7 = uncertain)
5. Respond ONLY with valid JSON (no extra text)

JSON FORMAT:
{
  "answer": "the answer value (Y/N for yes/no, number for counts, text for names/addresses)",
  "dataSource": "which client data field you used",
  "reasoning": "WHY this is the correct answer",
  "confidence": 0.95
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ]);
      
      console.log('✅ LLM Response:', result);
      
      return {
        answer: result.answer,
        confidence: result.confidence,
        reasoning: result.reasoning,
        dataSource: result.dataSource
      };
      
    } catch (error) {
      console.error('❌ LLM reasoning failed:', error);
      console.log('Falling back to pattern matching');
      return this.domainExpertReasoning(question, clientData);
    }
  }
  
  /**
   * Build prompt for LLM
   */
  private buildLLMPrompt(question: ExtractedQuestion, clientData: AnyUSDOTScenario): string {
    const isEnhanced = this.isEnhanced(clientData);
    
    return `FORM QUESTION:
"${question.questionText}"

${question.context.sectionTitle ? `SECTION: ${question.context.sectionTitle}\n` : ''}
${question.context.tooltip ? `REGULATORY DEFINITION:\n${question.context.tooltip}\n` : ''}
${question.context.description ? `INSTRUCTIONS: ${question.context.description}\n` : ''}

ANSWER FORMAT:
${question.answerOptions ? `Radio/Checkbox options: ${question.answerOptions.join(', ')}` : 'Text input field'}

CLIENT DATA:
${JSON.stringify(isEnhanced ? {
  business: {
    legalName: clientData.legalBusinessName,
    dba: clientData.doingBusinessAs,
    ein: clientData.ein,
    phone: clientData.businessPhone,
    entityType: clientData.formOfBusiness,
    address: clientData.principalAddress
  },
  contact: clientData.companyContact,
  operations: isEnhanced ? clientData.operations : {
    isForHire: clientData.receiveCompensationForTransport === 'Yes',
    operatesInterstate: clientData.transportNonHazardousInterstate === 'Yes',
    transportsHazmat: clientData.transportHazardousMaterials === 'Yes'
  },
  fleet: clientData.vehicles,
  drivers: isEnhanced ? clientData.drivers : 'estimated_from_fleet',
  compliance: isEnhanced ? clientData.compliance : 'standard'
} : clientData, null, 2)}

TASK:
Determine the correct answer for this USDOT registration question based on the client's business data.

Consider:
- What is the question actually asking?
- Which client data field provides the answer?
- Do you need to make any logical deductions?
- Are there DOT regulatory implications?

RESPOND WITH JSON ONLY (no explanation outside JSON):
{
  "answer": "Y or N for yes/no, number for counts, text for names/addresses",
  "dataSource": "which client field you used",
  "reasoning": "your expert reasoning",
  "confidence": 0.95
}`;
  }
  
  /**
   * Domain expert reasoning (no API required)
   * Uses deep understanding of DOT regulations and trucking industry
   */
  private domainExpertReasoning(
    question: ExtractedQuestion,
    clientData: AnyUSDOTScenario
  ): MappingDecision | null {
    const qText = question.questionText.toLowerCase();
    const tooltip = question.context.tooltip?.toLowerCase() || '';
    const combined = `${qText} ${tooltip}`;
    
    // Analyze what the question is fundamentally about
    const questionDomain = this.identifyQuestionDomain(combined);
    
    if (!questionDomain) {
      console.warn(`❓ Cannot identify domain for: "${question.questionText}"`);
      return null;
    }
    
    // Use domain-specific reasoning
    return this.reasonInDomain(questionDomain, question, clientData);
  }
  
  /**
   * Identify what domain/category this question belongs to
   */
  private identifyQuestionDomain(combinedText: string): string | null {
    // Business Identity
    if (this.matches(combinedText, ['legal', 'name']) || 
        this.matches(combinedText, ['company', 'name'])) return 'business_name';
    if (this.matches(combinedText, ['dba', 'doing business', 'trade name'])) return 'business_dba';
    if (this.matches(combinedText, ['ein', 'tax id', 'employer identification'])) return 'tax_id';
    if (this.matches(combinedText, ['form of business', 'entity type', 'business structure'])) return 'entity_type';
    
    // Location
    if (this.matches(combinedText, ['address', 'street']) && !this.matches(combinedText, ['email'])) return 'address';
    if (this.matches(combinedText, ['city'])) return 'city';
    if (this.matches(combinedText, ['state']) && !this.matches(combinedText, ['interstate'])) return 'state';
    if (this.matches(combinedText, ['zip', 'postal'])) return 'postal_code';
    
    // Contact
    if (this.matches(combinedText, ['first name'])) return 'first_name';
    if (this.matches(combinedText, ['last name'])) return 'last_name';
    if (this.matches(combinedText, ['title', 'position'])) return 'contact_title';
    if (this.matches(combinedText, ['email'])) return 'email';
    if (this.matches(combinedText, ['phone', 'telephone'])) return 'phone';
    
    // Operations - These require reasoning
    if (this.matchesAny(combinedText, ['3rd party', 'third party', '3rd-party', 'third-party']) ||
        (this.matches(combinedText, ['service provider']) && this.matchesAny(combinedText, ['3rd', 'third']))) return 'third_party_check';
    if (this.matches(combinedText, ['intermodal', 'equipment', 'provider', 'iep'])) return 'iep_check';
    if (this.matches(combinedText, ['transport', 'property']) && !this.matches(combinedText, ['own'])) return 'property_carrier_check';
    if (this.matches(combinedText, ['compensation', 'for hire', 'belonging to others'])) return 'for_hire_check';
    if (this.matches(combinedText, ['own property', 'private carrier'])) return 'private_carrier_check';
    if (this.matches(combinedText, ['interstate', 'across state', 'state lines'])) return 'interstate_check';
    if (this.matches(combinedText, ['passenger'])) return 'passenger_check';
    if (this.matches(combinedText, ['broker'])) return 'broker_check';
    if (this.matches(combinedText, ['freight forwarder'])) return 'freight_forwarder_check';
    if (this.matches(combinedText, ['hazardous', 'hazmat'])) return 'hazmat_check';
    
    // Vehicles
    if (this.matches(combinedText, ['straight truck']) && this.matches(combinedText, ['own'])) return 'straight_trucks_owned';
    if (this.matches(combinedText, ['straight truck']) && this.matches(combinedText, ['term lease'])) return 'straight_trucks_leased';
    if (this.matches(combinedText, ['truck tractor', 'tractor']) && this.matches(combinedText, ['own'])) return 'tractors_owned';
    if (this.matches(combinedText, ['truck tractor', 'tractor']) && this.matches(combinedText, ['term lease'])) return 'tractors_leased';
    if (this.matches(combinedText, ['trailer']) && !this.matches(combinedText, ['tractor']) && this.matches(combinedText, ['own'])) return 'trailers_owned';
    if (this.matches(combinedText, ['trailer']) && !this.matches(combinedText, ['tractor']) && this.matches(combinedText, ['term lease'])) return 'trailers_leased';
    
    // Trip leased vehicles
    if (this.matches(combinedText, ['straight truck']) && this.matches(combinedText, ['trip lease'])) return 'straight_trucks_tripleased';
    if (this.matches(combinedText, ['truck tractor', 'tractor']) && this.matches(combinedText, ['trip lease'])) return 'tractors_tripleased';
    if (this.matches(combinedText, ['trailer']) && !this.matches(combinedText, ['tractor']) && this.matches(combinedText, ['trip lease'])) return 'trailers_tripleased';
    
    // International vehicles
    if (this.matches(combinedText, ['vehicle']) && this.matches(combinedText, ['canada'])) return 'canada_vehicles';
    if (this.matches(combinedText, ['vehicle']) && this.matches(combinedText, ['mexico'])) return 'mexico_vehicles';
    
    // Drivers
    if (this.matches(combinedText, ['driver', 'cdl', 'commercial license'])) return 'drivers';
    if (this.matches(combinedText, ['driver']) && this.matches(combinedText, ['canada'])) return 'canada_drivers';
    if (this.matches(combinedText, ['driver']) && this.matches(combinedText, ['mexico'])) return 'mexico_drivers';
    
    // Compliance
    if (this.matches(combinedText, ['affiliation', 'common ownership', 'common control'])) return 'affiliation_check';
    
    return null;
  }
  
  /**
   * Check if scenario is enhanced format
   */
  private isEnhanced(scenario: AnyUSDOTScenario): scenario is EnhancedUSDOTScenario {
    return 'operations' in scenario && 'drivers' in scenario && 'compliance' in scenario;
  }
  
  /**
   * Safely get operation data (works with both formats)
   */
  private getOperationData(scenario: AnyUSDOTScenario) {
    if (this.isEnhanced(scenario)) {
      return scenario.operations;
    } else {
      // Convert old format on the fly
      return {
        isForHire: scenario.receiveCompensationForTransport === 'Yes',
        operatesInterstate: scenario.transportNonHazardousInterstate === 'Yes',
        transportsHazmat: scenario.transportHazardousMaterials === 'Yes',
        transportProperty: scenario.operationType?.includes('property'),
      };
    }
  }
  
  /**
   * Reason within a specific domain
   */
  private reasonInDomain(
    domain: string,
    question: ExtractedQuestion,
    clientData: AnyUSDOTScenario
  ): MappingDecision | null {
    switch (domain) {
      // Direct mappings
      case 'business_name':
        return this.createDecision(clientData.legalBusinessName, 1.0, 'Direct mapping: legal business name', 'legalBusinessName');
      
      case 'business_dba':
        return this.createDecision(
          clientData.doingBusinessAs || clientData.legalBusinessName,
          clientData.doingBusinessAs ? 1.0 : 0.8,
          clientData.doingBusinessAs ? 'Using DBA name' : 'No DBA, using legal name',
          'doingBusinessAs'
        );
      
      case 'tax_id':
        const ein = clientData.ein.replace(/-/g, '');
        return this.createDecision(ein, 1.0, 'EIN (dashes removed for form)', 'ein');
      
      case 'entity_type':
        return this.mapEntityType(clientData.formOfBusiness);
      
      case 'address':
        return this.createDecision(clientData.principalAddress.street, 1.0, 'Principal business address', 'principalAddress.street');
      
      case 'city':
        return this.createDecision(clientData.principalAddress.city, 1.0, 'Business city', 'principalAddress.city');
      
      case 'state':
        return this.createDecision(clientData.principalAddress.state, 1.0, 'Business state', 'principalAddress.state');
      
      case 'postal_code':
        return this.createDecision(clientData.principalAddress.postalCode, 1.0, 'Business postal code', 'principalAddress.postalCode');
      
      case 'first_name':
        return this.createDecision(clientData.companyContact.firstName, 1.0, 'Contact first name', 'companyContact.firstName');
      
      case 'last_name':
        return this.createDecision(clientData.companyContact.lastName, 1.0, 'Contact last name', 'companyContact.lastName');
      
      case 'contact_title':
        return this.createDecision(clientData.companyContact.title, 1.0, 'Contact title/position', 'companyContact.title');
      
      case 'email':
        return this.createDecision(clientData.companyContact.email, 1.0, 'Contact email', 'companyContact.email');
      
      case 'phone':
        return this.handlePhone(question, clientData.businessPhone);
      
      // Reasoning-based mappings
      case 'third_party_check':
        return this.createDecision('N', 1.0, 'Client is registering for themselves, not as 3rd party provider', 'business_logic');
      
      case 'iep_check':
        return this.createDecision('N', 1.0, 'Client operates trucks/tractors, not providing intermodal equipment', 'business_logic');
      
      case 'property_carrier_check':
        const ops = this.getOperationData(clientData);
        const isPropertyCarrier = ops.transportProperty || clientData.operationType?.toLowerCase().includes('property');
        return this.createDecision(
          isPropertyCarrier ? 'Y' : 'N',
          1.0,
          `Client ${isPropertyCarrier ? 'transports property' : 'does not transport property'}`,
          'operations.transportProperty'
        );
      
      case 'for_hire_check':
        const isForHire = this.getOperationData(clientData).isForHire;
        return this.createDecision(
          isForHire ? 'Y' : 'N',
          1.0,
          `Client ${isForHire ? 'receives compensation (for-hire)' : 'does not receive compensation (private carrier)'}`,
          'operations.isForHire'
        );
      
      case 'private_carrier_check':
        const isPrivate = !this.getOperationData(clientData).isForHire;
        return this.createDecision(
          isPrivate ? 'Y' : 'N',
          1.0,
          `Client is ${isPrivate ? 'private carrier' : 'for-hire carrier'}`,
          'operations.isPrivateCarrier'
        );
      
      case 'interstate_check':
        const isInterstate = this.getOperationData(clientData).operatesInterstate;
        return this.createDecision(
          isInterstate ? 'Y' : 'N',
          1.0,
          `Client operates ${isInterstate ? 'interstate' : 'intrastate only'}`,
          'operations.operatesInterstate'
        );
      
      case 'passenger_check':
        const transportsPassengers = this.isEnhanced(clientData) && clientData.operations.transportPassengers;
        return this.createDecision(transportsPassengers ? 'Y' : 'N', 0.95, 'Based on operation type', 'operations.transportPassengers');
      
      case 'broker_check':
        const isBroker = this.isEnhanced(clientData) && clientData.operations.providesBrokerServices;
        return this.createDecision(isBroker ? 'Y' : 'N', 1.0, 'Based on operation type', 'operations.providesBrokerServices');
      
      case 'freight_forwarder_check':
        const isFF = this.isEnhanced(clientData) && clientData.operations.isFreightForwarder;
        return this.createDecision(isFF ? 'Y' : 'N', 1.0, 'Based on operation type', 'operations.isFreightForwarder');
      
      case 'hazmat_check':
        const hasHazmat = this.getOperationData(clientData).transportsHazmat;
        return this.createDecision(
          hasHazmat ? 'Y' : 'N',
          1.0,
          `Client ${hasHazmat ? 'transports' : 'does not transport'} hazardous materials`,
          'operations.transportsHazmat'
        );
      
      // Vehicle mappings
      case 'straight_trucks_owned':
        return this.createDecision(
          clientData.vehicles.straightTrucks.owned.toString(),
          1.0,
          'Number of owned straight trucks',
          'vehicles.straightTrucks.owned'
        );
      
      case 'straight_trucks_leased':
        return this.createDecision(
          clientData.vehicles.straightTrucks.termLeased.toString(),
          1.0,
          'Number of term-leased straight trucks',
          'vehicles.straightTrucks.termLeased'
        );
      
      case 'tractors_owned':
        return this.createDecision(
          clientData.vehicles.truckTractors.owned.toString(),
          1.0,
          'Number of owned truck tractors',
          'vehicles.truckTractors.owned'
        );
      
      case 'tractors_leased':
        return this.createDecision(
          clientData.vehicles.truckTractors.termLeased.toString(),
          1.0,
          'Number of term-leased truck tractors',
          'vehicles.truckTractors.termLeased'
        );
      
      case 'trailers_owned':
        return this.createDecision(
          clientData.vehicles.trailers.owned.toString(),
          1.0,
          'Number of owned trailers',
          'vehicles.trailers.owned'
        );
      
      case 'trailers_leased':
        return this.createDecision(
          clientData.vehicles.trailers.termLeased.toString(),
          1.0,
          'Number of term-leased trailers',
          'vehicles.trailers.termLeased'
        );
      
      // Trip leased vehicles
      case 'straight_trucks_tripleased':
        const stTrip = this.isEnhanced(clientData) ? clientData.vehicles.straightTrucks.tripLeased : 0;
        return this.createDecision(stTrip.toString(), 1.0, 'Trip-leased straight trucks', 'vehicles.straightTrucks.tripLeased');
      
      case 'tractors_tripleased':
        const ttTrip = this.isEnhanced(clientData) ? clientData.vehicles.truckTractors.tripLeased : 0;
        return this.createDecision(ttTrip.toString(), 1.0, 'Trip-leased truck tractors', 'vehicles.truckTractors.tripLeased');
      
      case 'trailers_tripleased':
        const trTrip = this.isEnhanced(clientData) ? clientData.vehicles.trailers.tripLeased : 0;
        return this.createDecision(trTrip.toString(), 1.0, 'Trip-leased trailers', 'vehicles.trailers.tripLeased');
      
      // International vehicles
      case 'canada_vehicles':
        const canVeh = this.isEnhanced(clientData) ? clientData.vehicles.internationalVehicles?.canadaCount || 0 : 0;
        return this.createDecision(canVeh.toString(), 0.9, 'Vehicles operating in Canada', 'vehicles.internationalVehicles.canadaCount');
      
      case 'mexico_vehicles':
        const mexVeh = this.isEnhanced(clientData) ? clientData.vehicles.internationalVehicles?.mexicoCount || 0 : 0;
        return this.createDecision(mexVeh.toString(), 0.9, 'Vehicles operating in Mexico', 'vehicles.internationalVehicles.mexicoCount');
      
      case 'drivers':
        return this.estimateDrivers(question, clientData);
      
      // International drivers
      case 'canada_drivers':
        const canDrv = this.isEnhanced(clientData) ? clientData.drivers.international?.canadaDrivers || 0 : 0;
        return this.createDecision(canDrv.toString(), 0.9, 'Drivers operating in Canada', 'drivers.international.canadaDrivers');
      
      case 'mexico_drivers':
        const mexDrv = this.isEnhanced(clientData) ? clientData.drivers.international?.mexicoDrivers || 0 : 0;
        return this.createDecision(mexDrv.toString(), 0.9, 'Drivers operating in Mexico', 'drivers.international.mexicoDrivers');
      
      case 'affiliation_check':
        const hasAff = this.isEnhanced(clientData) ? clientData.compliance.hasAffiliations : false;
        return this.createDecision(hasAff ? 'Y' : 'N', 0.9, 'Affiliation status from client data', 'compliance.hasAffiliations');
      
      default:
        return null;
    }
  }
  
  /**
   * Helper: Check if text matches all required terms
   */
  private matches(text: string, terms: string[]): boolean {
    return terms.every(term => text.includes(term.toLowerCase()));
  }
  
  /**
   * Helper: Check if text matches ANY of the terms (OR logic)
   */
  private matchesAny(text: string, terms: string[]): boolean {
    return terms.some(term => text.includes(term.toLowerCase()));
  }
  
  /**
   * Helper: Create a decision object
   */
  private createDecision(
    answer: string | string[],
    confidence: number,
    reasoning: string,
    dataSource: string
  ): MappingDecision {
    return {
      answer,
      confidence,
      reasoning,
      dataSource,
      needsHumanReview: confidence < 0.8
    };
  }
  
  /**
   * Map entity type to FMCSA codes
   */
  private mapEntityType(formOfBusiness: string): MappingDecision {
    const entityMap: Record<string, string> = {
      'sole_proprietor': '1',
      'sole proprietor': '1',
      'partnership': '2',
      'llc': '3',
      'limited_liability_company': '3',
      'limited liability company': '3',
      'corporation': '4',
      'corp': '4',
      'other': '5'
    };
    
    const normalized = formOfBusiness.toLowerCase();
    const code = entityMap[normalized] || '3';
    
    return this.createDecision(
      code,
      entityMap[normalized] ? 1.0 : 0.7,
      `Entity type: ${formOfBusiness} → code ${code}`,
      'formOfBusiness'
    );
  }
  
  /**
   * Handle phone number questions (area code vs full number)
   */
  private handlePhone(question: ExtractedQuestion, phone: string): MappingDecision {
    const qText = question.questionText.toLowerCase();
    
    if (qText.includes('area code')) {
      const match = phone.match(/\(?(\d{3})\)?/);
      return this.createDecision(
        match ? match[1] : '',
        match ? 1.0 : 0.5,
        'Extracted area code from phone number',
        'businessPhone'
      );
    } else {
      return this.createDecision(phone, 1.0, 'Full phone number', 'businessPhone');
    }
  }
  
  /**
   * Estimate drivers based on fleet size
   */
  private estimateDrivers(question: ExtractedQuestion, clientData: AnyUSDOTScenario): MappingDecision {
    const qText = question.questionText.toLowerCase();
    
    // If enhanced scenario, use actual driver data
    if (this.isEnhanced(clientData)) {
      // CDL holders
      if (qText.includes('cdl') || qText.includes('commercial driver')) {
        return this.createDecision(
          clientData.drivers.cdlHolders.toString(),
          1.0,
          'CDL holder count from client data',
          'drivers.cdlHolders'
        );
      }
      
      // Interstate drivers
      if (qText.includes('interstate')) {
        if (qText.includes('100') && qText.includes('within')) {
          return this.createDecision(
            clientData.drivers.interstate.within100Miles.toString(),
            1.0,
            'Interstate drivers within 100 air-miles',
            'drivers.interstate.within100Miles'
          );
        } else if (qText.includes('beyond')) {
          return this.createDecision(
            clientData.drivers.interstate.beyond100Miles.toString(),
            1.0,
            'Interstate drivers beyond 100 air-miles',
            'drivers.interstate.beyond100Miles'
          );
        }
      }
      
      // Intrastate drivers
      if (qText.includes('intrastate')) {
        if (qText.includes('100') && qText.includes('within')) {
          return this.createDecision(
            clientData.drivers.intrastate.within100Miles.toString(),
            1.0,
            'Intrastate drivers within 100 air-miles',
            'drivers.intrastate.within100Miles'
          );
        } else if (qText.includes('beyond')) {
          return this.createDecision(
            clientData.drivers.intrastate.beyond100Miles.toString(),
            1.0,
            'Intrastate drivers beyond 100 air-miles',
            'drivers.intrastate.beyond100Miles'
          );
        }
      }
    }
    
    // Fall back to estimation for old format scenarios
    const totalPowerUnits = clientData.vehicles.straightTrucks.owned + 
                           clientData.vehicles.truckTractors.owned;
    
    // If asking about CDL holders
    if (qText.includes('cdl') || qText.includes('commercial driver')) {
      return this.createDecision(
        totalPowerUnits.toString(),
        0.8,
        `CMVs require CDL: estimated ${totalPowerUnits} CDL drivers for ${totalPowerUnits} power units`,
        'calculated_from_fleet'
      );
    }
    
    // Interstate vs intrastate drivers (old format estimation)
    const ops = this.getOperationData(clientData);
    const isInterstate = ops.operatesInterstate;
    
    if (qText.includes('interstate')) {
      if (qText.includes('100') && (qText.includes('within') || qText.includes('radius'))) {
        const local = isInterstate ? Math.floor(totalPowerUnits * 0.3) : 0;
        return this.createDecision(
          local.toString(),
          0.7,
          `Estimated 30% of drivers operate within 100mi radius (${local} of ${totalPowerUnits})`,
          'calculated_from_fleet'
        );
      } else if (qText.includes('beyond')) {
        const longHaul = isInterstate ? totalPowerUnits - Math.floor(totalPowerUnits * 0.3) : 0;
        return this.createDecision(
          longHaul.toString(),
          0.7,
          `Estimated 70% of drivers operate beyond 100mi radius (${longHaul} of ${totalPowerUnits})`,
          'calculated_from_fleet'
        );
      }
    }
    
    if (qText.includes('intrastate')) {
      if (qText.includes('100') && (qText.includes('within') || qText.includes('radius'))) {
        const local = !isInterstate ? Math.floor(totalPowerUnits * 0.4) : 0;
        return this.createDecision(
          local.toString(),
          0.7,
          `Estimated 40% of intrastate drivers operate within 100mi radius (${local} of ${totalPowerUnits})`,
          'calculated_from_fleet'
        );
      } else if (qText.includes('beyond')) {
        const longHaul = !isInterstate ? totalPowerUnits - Math.floor(totalPowerUnits * 0.4) : 0;
        return this.createDecision(
          longHaul.toString(),
          0.7,
          `Estimated 60% of intrastate drivers operate beyond 100mi radius (${longHaul} of ${totalPowerUnits})`,
          'calculated_from_fleet'
        );
      }
    }
    
    // Default: 1 driver per power unit
    return this.createDecision(
      totalPowerUnits.toString(),
      0.7,
      `Estimated 1 driver per power unit (${totalPowerUnits} units)`,
      'calculated_from_fleet'
    );
  }
  
  /**
   * Normalize question text for caching
   */
  private normalizeQuestion(text: string): string {
    return text.toLowerCase().replace(/[^\w\s]/g, '').trim();
  }
  
  /**
   * Initialize domain knowledge (DOT regulations, industry practices)
   */
  private initializeDomainKnowledge(): void {
    // CMV definition
    this.domainKnowledge.set('cmv_weight_threshold', 10001);
    this.domainKnowledge.set('cmv_passenger_threshold', 9);
    
    // For-hire vs private carrier distinction
    this.domainKnowledge.set('for_hire_definition', 'transports property belonging to others for compensation');
    this.domainKnowledge.set('private_carrier_definition', 'transports own property');
    
    // Interstate vs intrastate
    this.domainKnowledge.set('interstate_definition', 'crosses state lines or part of interstate movement');
    
    // Driver radius breakpoint
    this.domainKnowledge.set('hos_radius_breakpoint', 100); // 100 air-mile radius
  }
  
  /**
   * Learn from correction (human feedback)
   */
  learnFromCorrection(
    questionText: string,
    correctAnswer: string,
    explanation: string
  ): void {
    const key = this.normalizeQuestion(questionText);
    
    this.learningCache.set(key, {
      answer: correctAnswer,
      confidence: 1.0,
      reasoning: `Learned from correction: ${explanation}`,
      dataSource: 'human_correction'
    });
    
    console.log(`📚 Learned: "${questionText}" → "${correctAnswer}"`);
  }
}

