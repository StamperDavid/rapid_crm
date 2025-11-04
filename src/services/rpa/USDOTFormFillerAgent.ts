/**
 * USDOT Form Filler Agent - INTELLIGENT VERSION
 * 
 * This agent READS and UNDERSTANDS forms instead of using hard-coded field IDs.
 * It can adapt to changes in the FMCSA website structure.
 */

import { IntelligentFormReader } from './IntelligentFormReader';
import { SmartInputFiller, FillResult } from './SmartInputFiller';
import { IntelligentDataMapper, IntelligenceConfig, AnyUSDOTScenario } from './IntelligentDataMapper';
import { EnhancedUSDOTScenario, enhanceScenario } from './EnhancedUSDOTScenario';

// Re-export types for convenience
export type { EnhancedUSDOTScenario };
export { enhanceScenario };

export interface FilledFormData {
  pageNumber: number;
  pageName: string;
  questions: {
    questionText: string;
    answer: string | string[];
    reasoning: string;
    confidence: number;
    fillResult: FillResult;
  }[];
  totalQuestions: number;
  successfullyFilled: number;
  failedToFill: number;
}

export class USDOTFormFillerAgent {
  private formReader: IntelligentFormReader;
  private dataMapper: IntelligentDataMapper; // The intelligent brain
  private inputFiller: SmartInputFiller;
  private corrections: Map<string, string[]> = new Map();
  private knowledgeBase: Map<string, any> = new Map();
  
  constructor(intelligenceConfig?: IntelligenceConfig) {
    this.formReader = new IntelligentFormReader();
    
    // Pass config directly to data mapper (includes API key)
    if (intelligenceConfig) {
      console.log('🤖 Initializing USDOTFormFillerAgent with config:', {
        mode: intelligenceConfig.mode,
        provider: intelligenceConfig.llmProvider,
        hasApiKey: !!intelligenceConfig.apiKey
      });
    }
    
    this.dataMapper = new IntelligentDataMapper(intelligenceConfig);
    this.inputFiller = new SmartInputFiller();
  }
  
  /**
   * Intelligently fill a form page by reading and understanding it
   */
  async fillFormPage(
    iframeDoc: Document,
    pageNumber: number,
    scenario: AnyUSDOTScenario
  ): Promise<FilledFormData> {
    console.log(`🤖 Intelligent Agent analyzing page ${pageNumber}...`);
    
    // Step 1: Extract all questions from the form
    const questions = this.formReader.extractQuestions(iframeDoc);
    console.log(`📋 Found ${questions.length} questions on page ${pageNumber}`);
    
    if (questions.length === 0) {
      // Navigation-only page
      return {
        pageNumber,
        pageName: this.getPageName(pageNumber),
        questions: [],
        totalQuestions: 0,
        successfullyFilled: 0,
        failedToFill: 0
      };
    }
    
    // Step 2: Match each question to scenario data and fill it
    const filledQuestions: FilledFormData['questions'] = [];
    let successCount = 0;
    let failCount = 0;
    
    for (const question of questions) {
      console.log(`🎯 Question: "${question.questionText}"`);
      
      // Use intelligent data mapper to determine answer
      const decision = await this.dataMapper.determineAnswer(question, scenario);
      
      if (!decision) {
        console.warn(`⚠️ Could not determine answer for: "${question.questionText}"`);
        console.warn(`   Available client data:`, Object.keys(scenario));
        failCount++;
        filledQuestions.push({
          questionText: question.questionText,
          answer: '',
          reasoning: 'Agent could not map this question to client data',
          confidence: 0,
          fillResult: {
            success: false,
            filledCount: 0,
            totalInputs: question.inputElements.length,
            error: 'No answer determined'
          }
        });
        continue;
      }
      
      console.log(`✅ Answer: ${decision.answer} (confidence: ${decision.confidence})`);
      console.log(`💭 Reasoning: ${decision.reasoning}`);
      console.log(`📊 Data source: ${decision.dataSource}`);
      
      if (decision.needsHumanReview) {
        console.warn(`⚠️ Low confidence answer - may need human review`);
      }
      
      // Fill the inputs using the intelligent decision
      const fillResult = this.inputFiller.fillQuestion(
        question,
        { value: decision.answer, confidence: decision.confidence, reasoning: decision.reasoning },
        iframeDoc
      );
      
      if (fillResult.success) {
        console.log(`✓ Successfully filled ${fillResult.filledCount} input(s)`);
        successCount++;
      } else {
        console.error(`✗ Failed to fill: ${fillResult.error}`);
        failCount++;
      }
      
      filledQuestions.push({
        questionText: question.questionText,
        answer: decision.answer,
        reasoning: decision.reasoning,
        confidence: decision.confidence,
        fillResult
      });
    }
    
    console.log(`📊 Page ${pageNumber} complete: ${successCount} filled, ${failCount} failed`);
    
    return {
      pageNumber,
      pageName: this.getPageName(pageNumber),
      questions: filledQuestions,
      totalQuestions: questions.length,
      successfullyFilled: successCount,
      failedToFill: failCount
    };
  }
  
  /**
   * Fill the entire application intelligently
   */
  async fillApplication(scenario: USDOTScenario): Promise<FilledFormData[]> {
    console.log(`🤖 USDOT Intelligent Agent starting: ${scenario.id}`);
    console.log(`📋 Company: ${scenario.legalBusinessName}`);
    
    // Note: This method is called by the training center which handles page navigation
    // For now, we just return an empty array since the training center calls fillFormPage directly
    return [];
  }
  
  /**
   * Get human-readable page name
   */
  private getPageName(pageNumber: number): string {
    const pageNames: { [key: number]: string } = {
      0: 'Landing Page',
      1: 'Login',
      2: '3rd Party Service Provider',
      3: 'New or Continue Application',
      4: 'Introduction Info',
      5: 'Navigation Instructions',
      6: 'Required Documents',
      7: 'Financial Responsibility',
      8: 'Process Agent Notice',
      9: 'USDOT Number Issuance',
      10: 'Signature Authorization',
      11: 'Paperwork Reduction Act',
      12: 'Application ID',
      13: 'Application Contact Intro',
      14: 'Application Contact Form',
      15: 'Business Description Intro',
      16: 'Dun & Bradstreet',
      17: 'Legal Business Name',
      18: 'DBA Names',
      19: 'Principal Address Same',
      20: 'Business Addresses',
      21: 'Business Phone',
      22: 'EIN/SSN',
      23: 'Unit of Government',
      24: 'Form of Business',
      25: 'Ownership Control',
      26: 'Proprietor/Partners Names',
      27: 'Company Contact Address',
      28: 'Business Description Summary',
      29: 'Operation Classification Intro',
      30: 'Intermodal Equipment Provider',
      31: 'Transport Property',
      32: 'For-Hire Property',
      33: 'Property Types',
      34: 'Interstate Commerce',
      35: 'Transport Own Property',
      36: 'Transport Passengers',
      37: 'Broker Services',
      38: 'Freight Forwarder',
      39: 'Cargo Tank Facility',
      40: 'Towaway Operation',
      41: 'Cargo Classifications',
      42: 'Operation Classification Summary',
      43: 'Vehicles Intro',
      44: 'Non-CMV Property',
      45: 'Vehicle Types',
      46: 'Canada/Mexico Vehicles',
      47: 'Interstate Only Vehicles',
      48: 'Intrastate Only Vehicles',
      49: 'Vehicle Summary',
      50: 'Drivers Intro',
      51: 'Interstate Drivers',
      52: 'Intrastate Drivers',
      53: 'CDL Holders',
      54: 'Canada/Mexico Drivers',
      55: 'Driver Summary',
      56: 'Financial Responsibility Intro',
      57: 'Property 10,001+ lbs',
      58: 'Insurance Determination',
      59: 'Affiliation Intro',
      60: 'Affiliation Relationships',
      61: 'Affiliation Summary',
      62: 'Certification Statement Intro',
      63: 'E-Signature Certification',
      64: 'Compliance Certifications Intro',
      65: 'DOT Compliance Certification',
      66: 'Document Production Certification',
      67: 'Not Disqualified Certification',
      68: 'Process Agent Certification',
      69: 'Not Suspended/Revoked Certification',
      70: 'Deficiencies Corrected Certification',
      71: 'Compliance E-Signature',
      72: 'Compliance Certifications Summary',
      73: "Applicant's Oath Intro",
      74: "Applicant's Oath E-Signature",
      75: 'Identity Verification',
      76: 'Final Submission'
    };
    
    return pageNames[pageNumber] || `Page ${pageNumber}`;
  }
  
  /**
   * Learn from correction (human feedback makes agent smarter)
   */
  public learnFromCorrection(
    questionText: string,
    correctValue: string,
    explanation: string,
    scenarioContext: any
  ): void {
    console.log(`📚 Agent learning: "${questionText}" should be "${correctValue}"`);
    console.log(`   Explanation: ${explanation}`);
    
    // Teach the intelligent data mapper
    this.dataMapper.learnFromCorrection(questionText, correctValue, explanation);
    
    // Also store in agent's own knowledge base
    if (!this.corrections.has(questionText)) {
      this.corrections.set(questionText, []);
    }
    this.corrections.get(questionText)!.push(explanation);
    
    this.knowledgeBase.set(`correction_${Date.now()}`, {
      questionText,
      correctValue,
      explanation,
      context: scenarioContext,
      learnedAt: new Date().toISOString()
    });
  }
  
  /**
   * Get agent's current knowledge
   */
  public getKnowledgeBase(): any {
    return {
      totalCorrections: this.corrections.size,
      questionsMastered: Array.from(this.corrections.keys()),
      knowledge: Array.from(this.knowledgeBase.values())
    };
  }
}

// NO SINGLETON - Agent must be created AFTER API keys load
// Create agent in component after loadAPIKeysFromDatabase() completes
