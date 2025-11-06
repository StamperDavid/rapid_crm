/**
 * Client Simulator - LLM-Powered
 * Uses AI to realistically role-play as a transportation company client
 * Responds based on scenario data with natural variation, confusion, objections, etc.
 */

import { aiIntegrationService } from '../ai/AIIntegrationService';

export interface SimulatedClientResponse {
  message: string;
  revealsInfo: {
    field: string;
    value: any;
  }[];
  sentiment: 'positive' | 'neutral' | 'confused' | 'resistant';
}

export class ClientSimulator {
  private scenario: any;
  private clientPersonality: string;
  private conversationHistory: any[] = [];

  constructor(scenario: any) {
    this.scenario = scenario;
    this.clientPersonality = this.generateClientPersonality();
  }

  /**
   * Generate a realistic client personality for this scenario
   */
  private generateClientPersonality(): string {
    const personalities = [
      'Professional and direct. Good command of English. Just wants facts.',
      'Immigrant business owner, English as second language. Sometimes confused by regulations.',
      'Experienced in trucking but new to paperwork. Impatient and wants things done quickly.',
      'Very price-sensitive. Questions every cost. Skeptical of compliance requirements.',
      'Eager and cooperative but doesn\'t understand transportation regulations at all.',
      'Former driver starting own company. Knows operations but not the legal side.'
    ];
    
    return personalities[Math.floor(Math.random() * personalities.length)];
  }

  /**
   * Get initial greeting from client using LLM
   */
  public async getInitialGreeting(): Promise<string> {
    const greetingPrompt = `You are ${this.scenario.companyContact.firstName} from ${this.scenario.legalBusinessName}. 
You need to get a USDOT number and you're contacting Rapid Compliance for help.

YOUR PERSONALITY: ${this.clientPersonality}

Write a brief, natural greeting introducing yourself and stating you need help with USDOT registration. Keep it to 1-2 sentences.`;

    try {
      const response = await aiIntegrationService.generateResponse('openrouter', {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'user', content: greetingPrompt }
        ],
        temperature: 0.8,
        maxTokens: 100
      });

      return response.content;
    } catch (error) {
      // Fallback to simple greeting
      return `Hi, I'm ${this.scenario.companyContact.firstName} from ${this.scenario.legalBusinessName}. We need help getting a USDOT number.`;
    }
  }

  /**
   * Simulate client response using LLM
   * Client role-plays based on scenario data and personality
   */
  public async respondToQuestion(alexQuestion: string): Promise<SimulatedClientResponse> {
    // Build client system prompt with scenario data
    const clientSystemPrompt = `You are role-playing as ${this.scenario.companyContact.firstName} ${this.scenario.companyContact.lastName}, owner of ${this.scenario.legalBusinessName}.

YOUR COMPANY DETAILS (answer questions based on these facts):
- Business: ${this.scenario.legalBusinessName}
- Type: ${this.scenario.formOfBusiness.replace(/_/g, ' ')}
- Location: ${this.scenario.principalAddress.city}, ${this.scenario.principalAddress.state}
- Interstate Operations: ${this.scenario.transportNonHazardousInterstate}
- For-Hire (paid freight): ${this.scenario.receiveCompensationForTransport}
- Hazardous Materials: ${this.scenario.transportHazardousMaterials}
- Total Vehicles: ${(this.scenario.cmvInterstateOnly || 0) + (this.scenario.cmvIntrastateOnly || 0)}
- Property Type: ${this.scenario.propertyType || 'general freight'}

YOUR PERSONALITY: ${this.clientPersonality}

IMPORTANT:
- Answer Alex's questions based on YOUR company details above
- Be natural and conversational
- Sometimes express confusion about regulations
- Occasionally ask "how much will this cost?"
- Stay in character
- Keep responses brief (1-2 sentences)
- Don't volunteer information Alex hasn't asked for yet`;

    try {
      const response = await aiIntegrationService.generateResponse('openrouter', {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: clientSystemPrompt },
          ...this.conversationHistory,
          { role: 'user', content: alexQuestion }
        ],
        temperature: 0.8, // Higher for natural variation
        maxTokens: 150 // Keep client responses short
      });

      this.conversationHistory.push(
        { role: 'user', content: alexQuestion },
        { role: 'assistant', content: response.content }
      );

      // Analyze what info was revealed
      const revealsInfo = this.detectRevealedInfo(alexQuestion, response.content);

      return {
        message: response.content,
        revealsInfo,
        sentiment: this.detectSentiment(response.content)
      };

    } catch (error) {
      console.error('Error getting client response:', error);
      // Fallback to simple response
      return {
        message: 'Could you repeat that?',
        revealsInfo: [],
        sentiment: 'confused'
      };
    }
  }

  /**
   * Detect what information was revealed in the response
   */
  private detectRevealedInfo(question: string, answer: string): { field: string; value: any }[] {
    const revealed: { field: string; value: any }[] = [];
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('business name') || lowerQuestion.includes('company name')) {
      revealed.push({ field: 'legalBusinessName', value: this.scenario.legalBusinessName });
    }
    if (lowerQuestion.includes('interstate') || lowerQuestion.includes('intrastate') || lowerQuestion.includes('state line')) {
      revealed.push({ field: 'transportNonHazardousInterstate', value: this.scenario.transportNonHazardousInterstate });
    }
    if (lowerQuestion.includes('for hire') || lowerQuestion.includes('compensation') || lowerQuestion.includes('customers')) {
      revealed.push({ field: 'receiveCompensationForTransport', value: this.scenario.receiveCompensationForTransport });
    }
    if (lowerQuestion.includes('hazmat') || lowerQuestion.includes('hazardous')) {
      revealed.push({ field: 'transportHazardousMaterials', value: this.scenario.transportHazardousMaterials });
    }
    if (lowerQuestion.includes('vehicle') || lowerQuestion.includes('fleet') || lowerQuestion.includes('truck')) {
      revealed.push({ field: 'totalVehicles', value: (this.scenario.cmvInterstateOnly || 0) + (this.scenario.cmvIntrastateOnly || 0) });
    }
    if (lowerQuestion.includes('located') || lowerQuestion.includes('address') || lowerQuestion.includes('where')) {
      revealed.push({ field: 'principalAddress', value: this.scenario.principalAddress });
    }

    return revealed;
  }

  /**
   * Detect sentiment from response
   */
  private detectSentiment(response: string): 'positive' | 'neutral' | 'confused' | 'resistant' {
    const lower = response.toLowerCase();
    if (lower.includes('confused') || lower.includes('don\'t understand') || lower.includes('what')) {
      return 'confused';
    }
    if (lower.includes('expensive') || lower.includes('cost too much') || lower.includes('cheaper')) {
      return 'resistant';
    }
    if (lower.includes('great') || lower.includes('sounds good') || lower.includes('let\'s do it')) {
      return 'positive';
    }
    return 'neutral';
  }

  /**
   * Check if all required info has been revealed
   */
  public hasRevealedAllInfo(revealedFields: Set<string>): boolean {
    const requiredFields = [
      'legalBusinessName',
      'transportNonHazardousInterstate',
      'receiveCompensationForTransport',
      'totalVehicles',
      'principalAddress'
    ];

    return requiredFields.every(field => revealedFields.has(field));
  }
}
