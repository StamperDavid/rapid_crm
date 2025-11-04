/**
 * Onboarding Flow Engine
 * Manages the conversation flow for collecting client information
 * Works with Jasper AI to create natural, conversational onboarding
 */

const StateQualificationEngine = require('../compliance/StateQualificationEngine');

class OnboardingFlowEngine {
  constructor(db) {
    this.db = db;
    this.stateEngine = new StateQualificationEngine(db);
    
    // Define the conversation flow steps
    this.flowSteps = [
      'greeting',
      'business_name',
      'business_type',
      'contact_info',
      'operation_type',
      'interstate_commerce',
      'states_of_operation',
      'fleet_info',
      'cargo_info',
      'hazmat_check',
      'passenger_check',
      'analyze_requirements',
      'present_services',
      'collect_payment',
      'create_deal',
      'handoff_to_support'
    ];
  }

  /**
   * Start a new onboarding session
   */
  async startSession(sessionId, initialData = {}) {
    const sessionData = {
      sessionId,
      currentStep: 'greeting',
      stepIndex: 0,
      collectedData: initialData,
      recommendations: null,
      dealId: null,
      startedAt: new Date().toISOString(),
      conversationHistory: []
    };

    // Save to database
    await this.saveSession(sessionData);
    
    return sessionData;
  }

  /**
   * Get next question based on current step
   */
  getNextQuestion(step, collectedData = {}) {
    const questions = {
      greeting: {
        question: "Hi! I'm here to help you get your trucking company properly registered and compliant. I'll ask you a few questions about your business, analyze what registrations you need, and get you set up. Sound good?",
        type: 'yes_no',
        nextStep: 'business_name'
      },
      
      business_name: {
        question: "Great! Let's start with the basics. What's your legal business name?",
        type: 'text',
        field: 'legalBusinessName',
        validation: 'required',
        nextStep: 'business_type'
      },
      
      business_type: {
        question: "Perfect. What type of business entity are you? (Sole Proprietor, LLC, Corporation, Partnership)",
        type: 'choice',
        field: 'businessType',
        options: ['Sole Proprietor', 'LLC', 'Corporation', 'Partnership', 'Other'],
        nextStep: 'contact_info'
      },
      
      contact_info: {
        question: "I'll need your contact information. What's your name?",
        type: 'name',
        fields: ['firstName', 'lastName'],
        nextStep: 'email_phone'
      },
      
      email_phone: {
        question: "And your email and phone number?",
        type: 'contact',
        fields: ['email', 'phone'],
        nextStep: 'business_address'
      },
      
      business_address: {
        question: "What's your business address? (Street, City, State, ZIP)",
        type: 'address',
        fields: ['physicalStreetAddress', 'physicalCity', 'physicalState', 'physicalZip'],
        nextStep: 'operation_type'
      },
      
      operation_type: {
        question: "Now let's talk about your operations. Are you operating as a Motor Carrier, Broker, Freight Forwarder, or something else?",
        type: 'choice',
        field: 'businessClassification',
        options: ['Motor Carrier', 'Broker', 'Freight Forwarder', 'Private Carrier'],
        nextStep: 'interstate_commerce'
      },
      
      interstate_commerce: {
        question: "Do you transport goods or passengers across state lines? (This is called interstate commerce)",
        type: 'yes_no',
        field: 'interstateCommerce',
        nextStep: (answer) => answer ? 'states_of_operation' : 'intrastate_state'
      },
      
      states_of_operation: {
        question: "Which states do you operate in? (You can list multiple)",
        type: 'multi_choice',
        field: 'statesOfOperation',
        nextStep: 'fleet_info'
      },
      
      intrastate_state: {
        question: "Which state do you operate in?",
        type: 'choice',
        field: 'stateOfOperation',
        nextStep: 'fleet_info'
      },
      
      fleet_info: {
        question: "How many vehicles do you have, and how many drivers?",
        type: 'numbers',
        fields: ['numberOfVehicles', 'numberOfDrivers'],
        validation: 'positive_numbers',
        nextStep: 'vehicle_weight'
      },
      
      vehicle_weight: {
        question: "What's the weight of your vehicles? (GVWR - Gross Vehicle Weight Rating)",
        type: 'choice',
        field: 'vehicleWeight',
        options: [
          'Under 10,001 lbs',
          '10,001 - 26,000 lbs',
          '26,001+ lbs'
        ],
        nextStep: 'for_hire_check'
      },
      
      for_hire_check: {
        question: "Are you transporting goods or passengers for hire? (Getting paid to transport for others)",
        type: 'yes_no',
        field: 'forHire',
        nextStep: 'cargo_info'
      },
      
      cargo_info: {
        question: "What type of cargo do you primarily transport? (General freight, Refrigerated, Bulk, etc.)",
        type: 'text',
        field: 'cargoTypes',
        nextStep: 'hazmat_check'
      },
      
      hazmat_check: {
        question: "Do you transport hazardous materials that require placarding?",
        type: 'yes_no',
        field: 'hazmatRequired',
        nextStep: (answer, data) => {
          if (data.businessClassification?.includes('Carrier')) {
            return 'passenger_check';
          }
          return 'analyze_requirements';
        }
      },
      
      passenger_check: {
        question: "Do you transport passengers?",
        type: 'yes_no',
        field: 'carriesPassengers',
        nextStep: (answer) => answer ? 'passenger_capacity' : 'analyze_requirements'
      },
      
      passenger_capacity: {
        question: "How many passengers can your vehicles carry?",
        type: 'number',
        field: 'passengerCapacity',
        nextStep: 'analyze_requirements'
      },
      
      analyze_requirements: {
        question: "Let me analyze your business and determine what registrations you need...",
        type: 'processing',
        action: 'analyze',
        nextStep: 'present_services'
      },
      
      present_services: {
        question: (recommendations) => {
          const required = recommendations.filter(r => r.priority === 'required');
          let msg = `Based on your business operations, here's what you need:\n\n`;
          msg += `**Required Registrations:**\n`;
          required.forEach(r => {
            msg += `• ${r.serviceName} - $${r.price}\n  ${r.reason}\n\n`;
          });
          msg += `**Total Setup Cost: $${recommendations.totalRequired}**\n\n`;
          msg += `Would you like me to help you get these registrations filed?`;
          return msg;
        },
        type: 'confirmation',
        nextStep: (answer) => answer ? 'collect_payment' : 'end_no_service'
      },
      
      collect_payment: {
        question: "Perfect! I'll create your order and send you to our secure payment page. One moment...",
        type: 'payment_redirect',
        action: 'create_checkout',
        nextStep: 'payment_pending'
      },
      
      payment_pending: {
        question: "Complete your payment, and I'll automatically start processing your registrations!",
        type: 'wait',
        nextStep: 'create_deal'
      },
      
      create_deal: {
        question: "Payment received! I'm creating your account and starting your registrations...",
        type: 'processing',
        action: 'create_deal',
        nextStep: 'handoff_to_support'
      },
      
      handoff_to_support: {
        question: "All set! Your registrations are being processed. I've transferred you to our customer service team - if you have any questions, just ask!",
        type: 'handoff',
        action: 'handoff',
        nextStep: 'complete'
      }
    };

    return questions[step];
  }

  /**
   * Process user response and move to next step
   */
  async processResponse(sessionId, userResponse) {
    // Get current session
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const currentStep = this.getNextQuestion(session.currentStep, session.collectedData);
    
    // Save user response
    session.conversationHistory.push({
      step: session.currentStep,
      question: currentStep.question,
      userResponse,
      timestamp: new Date().toISOString()
    });

    // Extract data from response
    if (currentStep.field) {
      session.collectedData[currentStep.field] = userResponse;
    } else if (currentStep.fields) {
      // Multiple fields (like firstName, lastName)
      currentStep.fields.forEach((field, index) => {
        if (Array.isArray(userResponse)) {
          session.collectedData[field] = userResponse[index];
        }
      });
    }

    // Determine next step
    let nextStep;
    if (typeof currentStep.nextStep === 'function') {
      nextStep = currentStep.nextStep(userResponse, session.collectedData);
    } else {
      nextStep = currentStep.nextStep;
    }

    // Handle special actions
    if (currentStep.action === 'analyze') {
      // Analyze business requirements
      const analysis = await this.stateEngine.analyzeBusinessRequirements(session.collectedData);
      session.recommendations = analysis;
      session.collectedData.recommendedServices = analysis.recommendations;
    }

    if (currentStep.action === 'create_checkout') {
      // Create payment checkout session
      const checkoutSession = await this.createCheckoutSession(session);
      session.checkoutUrl = checkoutSession.checkoutUrl;
      session.paymentSessionId = checkoutSession.sessionId;
    }

    if (currentStep.action === 'create_deal') {
      // Create deal in CRM
      const dealId = await this.createDealFromSession(session);
      session.dealId = dealId;
    }

    if (currentStep.action === 'handoff') {
      // Handoff to customer service
      await this.handoffToCustomerService(session);
    }

    // Update session
    session.currentStep = nextStep;
    session.stepIndex = this.flowSteps.indexOf(nextStep);
    await this.saveSession(session);

    // Get next question
    const nextQuestion = this.getNextQuestion(nextStep, session.collectedData);
    
    let questionText;
    if (typeof nextQuestion.question === 'function') {
      questionText = nextQuestion.question(session.recommendations);
    } else {
      questionText = nextQuestion.question;
    }

    return {
      question: questionText,
      type: nextQuestion.type,
      options: nextQuestion.options,
      currentStep: nextStep,
      progress: Math.round((session.stepIndex / this.flowSteps.length) * 100),
      checkoutUrl: session.checkoutUrl,
      dealId: session.dealId
    };
  }

  /**
   * Create checkout session for payment
   */
  async createCheckoutSession(session) {
    const recommendations = session.recommendations;
    const requiredServices = recommendations.requiredServices;

    // This would call the payment service we built in Week 2
    // For now, return mock data
    return {
      sessionId: `cs_test_${Date.now()}`,
      checkoutUrl: `/payment/checkout?session=${session.sessionId}`,
      amount: recommendations.totalRequired,
      services: requiredServices.map(s => s.serviceName)
    };
  }

  /**
   * Create deal from onboarding session
   */
  async createDealFromSession(session) {
    const dealId = `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO deals (
          id, company_name, contact_name, contact_email, contact_phone,
          deal_value, stage, status, source, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'new', 'active', 'onboarding_agent', ?, ?)`,
        [
          dealId,
          session.collectedData.legalBusinessName,
          `${session.collectedData.firstName} ${session.collectedData.lastName}`,
          session.collectedData.email,
          session.collectedData.phone,
          session.recommendations?.totalRequired || 0,
          now,
          now
        ],
        function(err) {
          if (err) {
            console.error('Error creating deal:', err);
            return reject(err);
          }
          
          console.log(`✅ Deal created from onboarding: ${dealId}`);
          resolve(dealId);
        }
      );
    });
  }

  /**
   * Handoff to customer service agent
   */
  async handoffToCustomerService(session) {
    const handoffId = `handoff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO client_handoffs (
          id, session_id, handoff_type, onboarding_messages, 
          customer_service_context, timestamp, client_data, created_at
        ) VALUES (?, ?, 'onboarding_to_support', ?, ?, ?, ?, ?)`,
        [
          handoffId,
          session.sessionId,
          JSON.stringify(session.conversationHistory),
          JSON.stringify({
            dealId: session.dealId,
            services: session.recommendations?.requiredServices || [],
            summary: session.recommendations?.summary || ''
          }),
          now,
          JSON.stringify(session.collectedData),
          now
        ],
        function(err) {
          if (err) {
            console.error('Error creating handoff:', err);
            return reject(err);
          }
          
          console.log(`✅ Handoff created: ${handoffId}`);
          resolve(handoffId);
        }
      );
    });
  }

  /**
   * Save session to database
   */
  async saveSession(sessionData) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO onboarding_sessions (
          session_id, current_step, step_index, collected_data,
          recommendations, deal_id, checkout_url, payment_session_id,
          conversation_history, started_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          sessionData.sessionId,
          sessionData.currentStep,
          sessionData.stepIndex,
          JSON.stringify(sessionData.collectedData || {}),
          JSON.stringify(sessionData.recommendations || null),
          sessionData.dealId,
          sessionData.checkoutUrl,
          sessionData.paymentSessionId,
          JSON.stringify(sessionData.conversationHistory || []),
          sessionData.startedAt
        ],
        function(err) {
          if (err) {
            console.error('Error saving onboarding session:', err);
            return reject(err);
          }
          resolve();
        }
      );
    });
  }

  /**
   * Get session from database
   */
  async getSession(sessionId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM onboarding_sessions WHERE session_id = ?',
        [sessionId],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);
          
          resolve({
            sessionId: row.session_id,
            currentStep: row.current_step,
            stepIndex: row.step_index,
            collectedData: JSON.parse(row.collected_data || '{}'),
            recommendations: JSON.parse(row.recommendations || 'null'),
            dealId: row.deal_id,
            checkoutUrl: row.checkout_url,
            paymentSessionId: row.payment_session_id,
            conversationHistory: JSON.parse(row.conversation_history || '[]'),
            startedAt: row.started_at
          });
        }
      );
    });
  }

  /**
   * Get session progress
   */
  async getSessionProgress(sessionId) {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    return {
      currentStep: session.currentStep,
      stepIndex: session.stepIndex,
      totalSteps: this.flowSteps.length,
      progress: Math.round((session.stepIndex / this.flowSteps.length) * 100),
      collectedFields: Object.keys(session.collectedData).length,
      hasRecommendations: !!session.recommendations,
      dealCreated: !!session.dealId
    };
  }

  /**
   * Validate collected data
   */
  validateCollectedData(data) {
    return this.stateEngine.validateBusinessData(data);
  }
}

module.exports = OnboardingFlowEngine;



