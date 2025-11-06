/**
 * Alex Determination Service - CommonJS
 * LLM-powered regulatory determination for transportation compliance
 * 
 * Core Rule: Qualified States thresholds ALWAYS supersede federal for intrastate operations
 */

const Database = require('better-sqlite3');
const path = require('path');

class AlexDeterminationService {
  constructor() {
    this.db = null;
    this.knowledgeBase = new Map();
    this.initializeDatabase();
    this.loadKnowledgeBase();
  }

  initializeDatabase() {
    try {
      const dbPath = path.join(process.cwd(), 'instance', 'rapid_crm.db');
      this.db = new Database(dbPath);
      console.log('✅ Alex Determination Service: Database connected');
    } catch (error) {
      console.error('❌ Alex Determination Service: Database connection failed:', error);
    }
  }

  async loadKnowledgeBase() {
    if (!this.db) return;

    try {
      const knowledge = this.db.prepare(`
        SELECT * FROM shared_regulatory_knowledge
        WHERE learned_from_agent = 'alex'
        ORDER BY created_at DESC
      `).all();

      knowledge.forEach(item => {
        const key = `${item.state}_${item.operation_type}_${item.operation_radius}`;
        this.knowledgeBase.set(key, item);
      });

      console.log(`✅ Loaded ${knowledge.length} knowledge base entries for Alex`);
    } catch (error) {
      console.log('⚠️ Knowledge base table not found yet');
    }
  }

  /**
   * Get threshold rules for a specific state and operation type
   * Qualified states override federal rules for intrastate operations
   */
  getThresholds(state, isInterstate, isForHire) {
    // Interstate ALWAYS uses federal thresholds
    if (isInterstate) {
      return {
        source: 'federal',
        gvwrThreshold: 10001,
        passengerThreshold: 9, // Interstate: 9+ passengers
        state: 'FEDERAL',
        operationType: isForHire ? 'for_hire' : 'private_property'
      };
    }

    // Intrastate: Check qualified states table
    if (!this.db) {
      return {
        source: 'federal',
        gvwrThreshold: 10001,
        passengerThreshold: 16, // Intrastate: 16+ passengers
        state,
        operationType: isForHire ? 'for_hire' : 'private_property'
      };
    }

    try {
      const qualifiedState = this.db.prepare(`
        SELECT * FROM qualified_states WHERE state_code = ?
      `).get(state);

      if (qualifiedState) {
        // State has custom thresholds
        const gvwrThreshold = isForHire 
          ? (qualifiedState.gvwr_threshold_fh || 10001)
          : (qualifiedState.gvwr_threshold_pp || 10001);
          
        const passengerThreshold = isForHire
          ? (qualifiedState.passenger_threshold_fh || 16)
          : (qualifiedState.passenger_threshold_pp || 16);

        return {
          source: 'qualified_state',
          gvwrThreshold,
          passengerThreshold,
          state: qualifiedState.state_code,
          operationType: isForHire ? 'for_hire' : 'private_property'
        };
      }
    } catch (error) {
      console.warn('Could not query qualified_states table:', error);
    }

    // State fully adopts federal thresholds
    return {
      source: 'federal',
      gvwrThreshold: 10001,
      passengerThreshold: 16,
      state,
      operationType: isForHire ? 'for_hire' : 'private_property'
    };
  }

  /**
   * Main determination method using LLM
   * aiService is passed from server to avoid TypeScript import issues
   */
  async determine(scenario, aiService = null) {
    const startTime = Date.now();
    
    console.log(`🧠 Alex AI analyzing scenario for ${scenario.legalBusinessName}...`);

    const isInterstate = scenario.transportNonHazardousInterstate === 'Yes';
    const isForHire = scenario.receiveCompensationForTransport === 'Yes';
    const thresholds = this.getThresholds(scenario.principalAddress.state, isInterstate, isForHire);

    console.log(`📊 Using ${thresholds.source} thresholds for ${thresholds.state} (${thresholds.operationType}):`);
    console.log(`   GVWR: ${thresholds.gvwrThreshold}+ lbs`);
    console.log(`   Passengers: ${thresholds.passengerThreshold}+`);

    // Check knowledge base
    const knowledgeKey = `${scenario.principalAddress.state}_${isInterstate ? 'interstate' : 'intrastate'}`;
    const priorKnowledge = this.knowledgeBase.get(knowledgeKey);

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(thresholds, priorKnowledge);
    const analysisPrompt = this.buildAnalysisPrompt(scenario, thresholds);

    // Call LLM
    try {
      if (!aiService) {
        console.warn('⚠️ AI service not provided, using fallback');
        return this.fallbackDetermination(scenario, thresholds);
      }
      
      const llmResponse = await aiService.generateResponse('openrouter', {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.1,
        maxTokens: 2000
      });

      console.log(`✅ Alex AI response received in ${Date.now() - startTime}ms`);

      return this.parseLLMResponse(llmResponse.content, thresholds);

    } catch (error) {
      console.error('❌ Error calling LLM:', error);
      return this.fallbackDetermination(scenario, thresholds);
    }
  }

  buildSystemPrompt(thresholds, priorKnowledge) {
    let prompt = `You are Alex, an expert transportation compliance specialist analyzing USDOT regulatory requirements.

CORE RULE - ALWAYS FOLLOW:
- For INTERSTATE operations: Use FEDERAL thresholds
- For INTRASTATE operations: Use ${thresholds.source === 'qualified_state' ? 'STATE-SPECIFIC' : 'FEDERAL'} thresholds

APPLICABLE THRESHOLDS FOR THIS SCENARIO:
- Source: ${thresholds.source.toUpperCase()}
- State: ${thresholds.state}
- Operation Type: ${thresholds.operationType}
- GVWR Threshold: ${thresholds.gvwrThreshold}+ lbs triggers USDOT + Driver Qualification Files
- Passenger Threshold: ${thresholds.passengerThreshold}+ passengers triggers USDOT + Driver Qualification Files

REMEMBER: GVWR and passenger thresholds determine BOTH:
1. USDOT number requirement
2. Driver qualification file requirement

Other requirements you should analyze:
- MC Authority: Required for interstate for-hire operations
- IFTA: Required for qualified motor vehicles (26,001+ lbs or 3+ axles) crossing state lines
- Hazmat: Required for transporting hazardous materials
- State Registration: Varies by state and operation type

Analyze the scenario and provide a determination with clear reasoning.`;

    if (priorKnowledge) {
      prompt += `\n\nPRIOR KNOWLEDGE for similar scenarios:
${priorKnowledge.reasoning}
${priorKnowledge.correction_notes || ''}`;
    }

    return prompt;
  }

  buildAnalysisPrompt(scenario, thresholds) {
    const totalVehicles = (scenario.cmvInterstateOnly || 0) + (scenario.cmvIntrastateOnly || 0);

    return `Analyze this transportation company scenario and determine regulatory requirements:

COMPANY: ${scenario.legalBusinessName}
Business Type: ${scenario.formOfBusiness}
Location: ${scenario.principalAddress.city}, ${scenario.principalAddress.state}

OPERATIONS:
- Interstate Operations: ${scenario.transportNonHazardousInterstate}
- For-Hire (Compensation): ${scenario.receiveCompensationForTransport}
- Hazardous Materials: ${scenario.transportHazardousMaterials}
- Property Type: ${scenario.propertyType || 'Not specified'}
- Total CMVs: ${totalVehicles}

Based on the ${thresholds.source} thresholds for ${thresholds.state}, determine:

1. USDOT Number: Required? (Apply threshold: ${thresholds.gvwrThreshold}+ lbs or ${thresholds.passengerThreshold}+ passengers)
2. Driver Qualification Files: Required? (Same thresholds as USDOT)
3. MC Authority: Required?
4. Hazmat Endorsement: Required?
5. IFTA: Required?
6. State Registration: Required?

Format your response as JSON:
{
  "usdot": true/false,
  "driverQualFiles": true/false,
  "mcAuthority": true/false,
  "hazmat": true/false,
  "ifta": true/false,
  "stateRegistration": true/false,
  "reasoning": "Detailed explanation",
  "confidence": 0.0-1.0
}`;
  }

  parseLLMResponse(content, thresholds) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          usdotRequired: parsed.usdot || false,
          mcAuthorityRequired: parsed.mcAuthority || false,
          hazmatRequired: parsed.hazmat || false,
          iftaRequired: parsed.ifta || false,
          stateRegistrationRequired: parsed.stateRegistration || false,
          driverQualificationFilesRequired: parsed.driverQualFiles || false,
          reasoning: parsed.reasoning || content,
          appliedThresholds: {
            source: thresholds.source,
            gvwrThreshold: thresholds.gvwrThreshold,
            passengerThreshold: thresholds.passengerThreshold,
            state: thresholds.state
          },
          confidence: parsed.confidence || 0.85,
          rawLLMResponse: content
        };
      }
    } catch (error) {
      console.warn('Could not parse JSON from LLM response');
    }

    return {
      usdotRequired: true,
      mcAuthorityRequired: false,
      hazmatRequired: false,
      iftaRequired: false,
      stateRegistrationRequired: false,
      driverQualificationFilesRequired: true,
      reasoning: content,
      appliedThresholds: {
        source: thresholds.source,
        gvwrThreshold: thresholds.gvwrThreshold,
        state: thresholds.state
      },
      confidence: 0.7,
      rawLLMResponse: content
    };
  }

  fallbackDetermination(scenario, thresholds) {
    const isInterstate = scenario.transportNonHazardousInterstate === 'Yes';
    const isForHire = scenario.receiveCompensationForTransport === 'Yes';
    const hasHazmat = scenario.transportHazardousMaterials === 'Yes';
    const totalVehicles = (scenario.cmvInterstateOnly || 0) + (scenario.cmvIntrastateOnly || 0);

    return {
      usdotRequired: true,
      mcAuthorityRequired: isInterstate && isForHire,
      hazmatRequired: hasHazmat,
      iftaRequired: isInterstate && totalVehicles >= 2,
      stateRegistrationRequired: !isInterstate,
      driverQualificationFilesRequired: true,
      reasoning: 'LLM unavailable - using fallback logic',
      appliedThresholds: {
        source: thresholds.source,
        gvwrThreshold: thresholds.gvwrThreshold,
        state: thresholds.state
      },
      confidence: 0.5
    };
  }

  /**
   * Learn from correction
   */
  async learnFromCorrection(scenarioId, correction, correctAnswer, scenarioData) {
    if (!this.db) return;

    const isInterstate = scenarioData.transportNonHazardousInterstate === 'Yes';
    const knowledgeId = `knowledge_${Date.now()}`;
    const knowledgeKey = `${scenarioData.principalAddress.state}_${isInterstate ? 'interstate' : 'intrastate'}`;

    try {
      this.db.prepare(`
        INSERT INTO shared_regulatory_knowledge (
          id, state, operation_type, operation_radius,
          usdot_required, mc_authority_required, hazmat_required,
          ifta_required, state_registration_required, reasoning,
          learned_from_scenario_id, learned_from_agent, correction_notes,
          created_at, updated_at, confidence_score, times_validated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        knowledgeId,
        scenarioData.principalAddress.state,
        scenarioData.receiveCompensationForTransport === 'Yes' ? 'for_hire' : 'private',
        isInterstate ? 'interstate' : 'intrastate',
        correctAnswer.usdotRequired ? 1 : 0,
        correctAnswer.mcAuthorityRequired ? 1 : 0,
        correctAnswer.hazmatRequired ? 1 : 0,
        correctAnswer.iftaRequired ? 1 : 0,
        correctAnswer.stateRegistrationRequired ? 1 : 0,
        correction,
        scenarioId,
        'alex',
        correction,
        new Date().toISOString(),
        new Date().toISOString(),
        1.0,
        1
      );

      // IMMEDIATELY update in-memory knowledge base (don't wait for server restart)
      this.knowledgeBase.set(knowledgeKey, {
        state: scenarioData.principalAddress.state,
        operation_type: scenarioData.receiveCompensationForTransport === 'Yes' ? 'for_hire' : 'private',
        operation_radius: isInterstate ? 'interstate' : 'intrastate',
        reasoning: correction,
        correction_notes: correction,
        usdot_required: correctAnswer.usdotRequired ? 1 : 0,
        mc_authority_required: correctAnswer.mcAuthorityRequired ? 1 : 0,
        hazmat_required: correctAnswer.hazmatRequired ? 1 : 0,
        ifta_required: correctAnswer.iftaRequired ? 1 : 0,
        state_registration_required: correctAnswer.stateRegistrationRequired ? 1 : 0
      });

      console.log(`✅ Alex learned IMMEDIATELY from correction for ${knowledgeKey}`);
      console.log(`📚 Knowledge base now has ${this.knowledgeBase.size} entries`);
    } catch (error) {
      console.error('❌ Error storing correction:', error);
    }
  }
}

// Singleton
let instance = null;

function getInstance() {
  if (!instance) {
    instance = new AlexDeterminationService();
  }
  return instance;
}

module.exports = {
  alexDeterminationService: getInstance(),
  AlexDeterminationService
};

