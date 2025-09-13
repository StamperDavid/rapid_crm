export interface QuestionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logic?: 'AND' | 'OR';
}

export interface ConditionalQuestion {
  id: string;
  question: string;
  field: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'boolean' | 'date' | 'file';
  options?: string[];
  required: boolean;
  conditions?: QuestionCondition[];
  followUpQuestions?: string[];
  skipIf?: QuestionCondition[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  helpText?: string;
  category: 'basic' | 'operation' | 'vehicles' | 'cargo' | 'authority' | 'payment' | 'compliance';
  priority: number;
}

export interface ConversationState {
  answers: Record<string, any>;
  currentQuestionId?: string;
  completedQuestions: string[];
  skippedQuestions: string[];
  conversationFlow: string[];
  context: {
    operationType?: string;
    requiresAuthority?: boolean;
    hasHazmat?: boolean;
    isInterstate?: boolean;
  };
}

export interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  questions: ConditionalQuestion[];
  flowRules: FlowRule[];
  completionCriteria: CompletionCriteria;
}

export interface FlowRule {
  id: string;
  name: string;
  conditions: QuestionCondition[];
  actions: ('skip_question' | 'require_question' | 'set_context' | 'branch_flow')[];
  target?: string;
  contextUpdate?: Record<string, any>;
}

export interface CompletionCriteria {
  requiredQuestions: string[];
  optionalQuestions: string[];
  minimumAnswers: number;
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
}

export class ConditionalScriptingEngine {
  private script: ScriptTemplate;
  private state: ConversationState;

  constructor(script: ScriptTemplate) {
    this.script = script;
    this.state = {
      answers: {},
      completedQuestions: [],
      skippedQuestions: [],
      conversationFlow: [],
      context: {}
    };
  }

  // Get the next question based on current state and conditions
  getNextQuestion(): ConditionalQuestion | null {
    const availableQuestions = this.getAvailableQuestions();
    
    if (availableQuestions.length === 0) {
      return null;
    }

    // Sort by priority and return the highest priority available question
    return availableQuestions.sort((a, b) => a.priority - b.priority)[0];
  }

  // Get all questions that are currently available based on conditions
  private getAvailableQuestions(): ConditionalQuestion[] {
    return this.script.questions.filter(question => {
      // Skip if already completed or skipped
      if (this.state.completedQuestions.includes(question.id) || 
          this.state.skippedQuestions.includes(question.id)) {
        return false;
      }

      // Check if question should be skipped based on skipIf conditions
      if (question.skipIf && this.evaluateConditions(question.skipIf)) {
        this.state.skippedQuestions.push(question.id);
        return false;
      }

      // Check if question conditions are met
      if (question.conditions && !this.evaluateConditions(question.conditions)) {
        return false;
      }

      return true;
    });
  }

  // Answer a question and update state
  answerQuestion(questionId: string, answer: any): boolean {
    const question = this.script.questions.find(q => q.id === questionId);
    if (!question) {
      return false;
    }

    // Validate answer
    if (!this.validateAnswer(question, answer)) {
      return false;
    }

    // Store answer
    this.state.answers[question.field] = answer;
    this.state.completedQuestions.push(questionId);
    this.state.conversationFlow.push(questionId);

    // Update context based on answer
    this.updateContext(question, answer);

    // Apply flow rules
    this.applyFlowRules(question, answer);

    return true;
  }

  // Evaluate conditions for a question
  private evaluateConditions(conditions: QuestionCondition[]): boolean {
    if (conditions.length === 0) return true;

    let result = this.evaluateCondition(conditions[0]);
    
    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(condition);
      
      if (condition.logic === 'OR') {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }
    }

    return result;
  }

  // Evaluate a single condition
  private evaluateCondition(condition: QuestionCondition): boolean {
    const fieldValue = this.state.answers[condition.field];
    
    if (fieldValue === undefined || fieldValue === null) {
      return false;
    }

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) ? condition.value.includes(fieldValue) : false;
      case 'not_in':
        return Array.isArray(condition.value) ? !condition.value.includes(fieldValue) : true;
      default:
        return false;
    }
  }

  // Validate an answer against question validation rules
  private validateAnswer(question: ConditionalQuestion, answer: any): boolean {
    if (question.required && (answer === undefined || answer === null || answer === '')) {
      return false;
    }

    if (question.validation) {
      const validation = question.validation;
      
      if (validation.min !== undefined && Number(answer) < validation.min) {
        return false;
      }
      
      if (validation.max !== undefined && Number(answer) > validation.max) {
        return false;
      }
      
      if (validation.pattern && !new RegExp(validation.pattern).test(String(answer))) {
        return false;
      }
    }

    return true;
  }

  // Update conversation context based on answers
  private updateContext(question: ConditionalQuestion, answer: any): void {
    switch (question.field) {
      case 'operationType':
        this.state.context.operationType = answer;
        break;
      case 'operationRadius':
        this.state.context.isInterstate = answer === 'interstate';
        break;
      case 'cargoType':
        this.state.context.hasHazmat = Array.isArray(answer) && answer.includes('hazardous materials');
        break;
      case 'requiresAuthority':
        this.state.context.requiresAuthority = answer;
        break;
    }
  }

  // Apply flow rules based on current state
  private applyFlowRules(question: ConditionalQuestion, answer: any): void {
    for (const rule of this.script.flowRules) {
      if (this.evaluateConditions(rule.conditions)) {
        for (const action of rule.actions) {
          switch (action) {
            case 'skip_question':
              if (rule.target) {
                this.state.skippedQuestions.push(rule.target);
              }
              break;
            case 'require_question':
              // Force include a question in available questions
              break;
            case 'set_context':
              if (rule.contextUpdate) {
                this.state.context = { ...this.state.context, ...rule.contextUpdate };
              }
              break;
            case 'branch_flow':
              // Handle flow branching logic
              break;
          }
        }
      }
    }
  }

  // Check if conversation is complete
  isComplete(): boolean {
    const criteria = this.script.completionCriteria;
    
    // Check if all required questions are answered
    const requiredAnswered = criteria.requiredQuestions.every(qId => 
      this.state.completedQuestions.includes(qId)
    );

    // Check minimum answers threshold
    const minimumMet = this.state.completedQuestions.length >= criteria.minimumAnswers;

    // Check validation rules
    const validationPassed = criteria.validationRules.every(rule => 
      this.validateField(rule.field, rule.rule)
    );

    return requiredAnswered && minimumMet && validationPassed;
  }

  // Validate a specific field
  private validateField(field: string, rule: string): boolean {
    const value = this.state.answers[field];
    
    switch (rule) {
      case 'required':
        return value !== undefined && value !== null && value !== '';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
      case 'phone':
        return /^[\+]?[1-9][\d]{0,15}$/.test(String(value));
      case 'usdot_format':
        return /^\d{8}$/.test(String(value));
      default:
        return true;
    }
  }

  // Get conversation summary
  getConversationSummary(): {
    totalQuestions: number;
    answeredQuestions: number;
    skippedQuestions: number;
    completionPercentage: number;
    context: any;
    nextSteps: string[];
  } {
    const totalQuestions = this.script.questions.length;
    const answeredQuestions = this.state.completedQuestions.length;
    const skippedQuestions = this.state.skippedQuestions.length;
    const completionPercentage = (answeredQuestions / totalQuestions) * 100;

    const nextSteps = this.getNextSteps();

    return {
      totalQuestions,
      answeredQuestions,
      skippedQuestions,
      completionPercentage,
      context: this.state.context,
      nextSteps
    };
  }

  // Get next steps based on current state
  private getNextSteps(): string[] {
    const steps: string[] = [];

    if (!this.state.context.operationType) {
      steps.push('Determine operation type');
    }

    if (this.state.context.operationType === 'for_hire' && this.state.context.isInterstate) {
      steps.push('MC Authority required');
    }

    if (this.state.context.hasHazmat) {
      steps.push('Hazmat registration required');
    }

    if (this.state.context.requiresAuthority) {
      steps.push('Process authority application');
    }

    if (this.isComplete()) {
      steps.push('Generate compliance report');
      steps.push('Process payment');
      steps.push('Create portal account');
      steps.push('Handoff to customer service');
    }

    return steps;
  }

  // Get current state
  getState(): ConversationState {
    return { ...this.state };
  }

  // Reset conversation
  reset(): void {
    this.state = {
      answers: {},
      completedQuestions: [],
      skippedQuestions: [],
      conversationFlow: [],
      context: {}
    };
  }

  // Export conversation data
  exportData(): any {
    return {
      script: this.script,
      state: this.state,
      summary: this.getConversationSummary()
    };
  }
}

// Default USDOT onboarding script
export const defaultUSDOTScript: ScriptTemplate = {
  id: 'usdot-onboarding-v1',
  name: 'USDOT Application Onboarding',
  description: 'Comprehensive USDOT application and compliance determination script',
  version: '1.0.0',
  questions: [
    {
      id: 'welcome',
      question: 'Welcome! I\'m here to help you with your USDOT application. Let\'s start with some basic information about your operation.',
      field: 'welcome',
      type: 'text',
      required: false,
      category: 'basic',
      priority: 1
    },
    {
      id: 'companyName',
      question: 'What is your company name?',
      field: 'companyName',
      type: 'text',
      required: true,
      category: 'basic',
      priority: 2,
      validation: {
        min: 2,
        max: 100
      }
    },
    {
      id: 'operationType',
      question: 'What type of operation are you running?',
      field: 'operationType',
      type: 'select',
      required: true,
      options: ['for_hire', 'private', 'both'],
      category: 'operation',
      priority: 3,
      helpText: 'For-hire means you transport goods for others for payment. Private means you only transport your own goods.'
    },
    {
      id: 'operationRadius',
      question: 'What is the scope of your operation?',
      field: 'operationRadius',
      type: 'select',
      required: true,
      options: ['intrastate', 'interstate', 'both'],
      category: 'operation',
      priority: 4,
      conditions: [
        { field: 'operationType', operator: 'not_equals', value: 'private' }
      ]
    },
    {
      id: 'cargoType',
      question: 'What types of cargo do you transport?',
      field: 'cargoType',
      type: 'multiselect',
      required: true,
      options: ['general freight', 'hazardous materials', 'passengers', 'household goods', 'refrigerated', 'other'],
      category: 'cargo',
      priority: 5
    },
    {
      id: 'vehicleCount',
      question: 'How many commercial vehicles do you operate?',
      field: 'vehicleCount',
      type: 'number',
      required: true,
      category: 'vehicles',
      priority: 6,
      validation: {
        min: 1,
        max: 1000
      }
    },
    {
      id: 'vehicleDetails',
      question: 'Please provide details for each vehicle (type, GVWR, year, make, model)',
      field: 'vehicleDetails',
      type: 'text',
      required: true,
      category: 'vehicles',
      priority: 7,
      conditions: [
        { field: 'vehicleCount', operator: 'greater_than', value: 0 }
      ]
    },
    {
      id: 'hazmatDetails',
      question: 'What specific hazardous materials do you transport?',
      field: 'hazmatDetails',
      type: 'text',
      required: false,
      category: 'cargo',
      priority: 8,
      conditions: [
        { field: 'cargoType', operator: 'contains', value: 'hazardous materials' }
      ]
    },
    {
      id: 'passengerCount',
      question: 'How many passengers do you transport?',
      field: 'passengerCount',
      type: 'number',
      required: false,
      category: 'cargo',
      priority: 9,
      conditions: [
        { field: 'cargoType', operator: 'contains', value: 'passengers' }
      ],
      validation: {
        min: 1,
        max: 100
      }
    },
    {
      id: 'authorityRequired',
      question: 'Based on your operation, you will need an MC Authority. This costs $300. Do you want to proceed?',
      field: 'authorityRequired',
      type: 'boolean',
      required: true,
      category: 'authority',
      priority: 10,
      conditions: [
        { field: 'operationType', operator: 'equals', value: 'for_hire' },
        { field: 'operationRadius', operator: 'equals', value: 'interstate' }
      ]
    }
  ],
  flowRules: [
    {
      id: 'skip_authority_private',
      name: 'Skip authority for private operations',
      conditions: [
        { field: 'operationType', operator: 'equals', value: 'private' }
      ],
      actions: ['skip_question'],
      target: 'authorityRequired'
    },
    {
      id: 'skip_authority_intrastate',
      name: 'Skip authority for intrastate operations',
      conditions: [
        { field: 'operationRadius', operator: 'equals', value: 'intrastate' }
      ],
      actions: ['skip_question'],
      target: 'authorityRequired'
    }
  ],
  completionCriteria: {
    requiredQuestions: ['companyName', 'operationType', 'operationRadius', 'cargoType', 'vehicleCount'],
    optionalQuestions: ['hazmatDetails', 'passengerCount', 'authorityRequired'],
    minimumAnswers: 5,
    validationRules: [
      { field: 'companyName', rule: 'required', message: 'Company name is required' },
      { field: 'operationType', rule: 'required', message: 'Operation type is required' }
    ]
  }
};
