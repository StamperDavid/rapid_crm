/**
 * Client Simulator - CommonJS - LLM-Powered
 * Uses AI to realistically role-play as a transportation company client
 */

class ClientSimulator {
  constructor(scenario, aiService) {
    this.scenario = scenario;
    this.aiService = aiService; // Passed from server to avoid import issues
    this.clientPersonality = this.generateClientPersonality();
    this.conversationHistory = [];
  }

  generateClientPersonality() {
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

  async getInitialGreeting() {
    const greetingPrompt = `You are ${this.scenario.companyContact.firstName} from ${this.scenario.legalBusinessName}. 
You need to get a USDOT number and you're contacting Rapid Compliance for help.

YOUR PERSONALITY: ${this.clientPersonality}

Write a brief, natural greeting introducing yourself and stating you need help with USDOT registration. Keep it to 1-2 sentences.`;

    try {
      if (!this.aiService) {
        throw new Error('AI service not available');
      }
      
      const response = await this.aiService.generateResponse('openrouter', {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'user', content: greetingPrompt }
        ],
        temperature: 0.8,
        maxTokens: 100
      });

      return response.content;
    } catch (error) {
      return `Hi, I'm ${this.scenario.companyContact.firstName} from ${this.scenario.legalBusinessName}. We need help getting a USDOT number.`;
    }
  }

  async respondToQuestion(alexQuestion) {
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
- Don't volunteer information Alex hasn't asked for yet

WHEN ALEX ASKS TO CLOSE THE DEAL:
- If asked "Would you like to move forward?" or "Can I get started?":
  - 70% of the time: Accept (say yes, let's do it, sounds good, etc.)
  - 30% of the time: Decline (need to think about it, too expensive, etc.)
- Be realistic - sometimes accept immediately, sometimes hesitate then accept, sometimes decline`;

    try {
      if (!this.aiService) {
        throw new Error('AI service not available');
      }
      
      const response = await this.aiService.generateResponse('openrouter', {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: clientSystemPrompt },
          ...this.conversationHistory,
          { role: 'user', content: alexQuestion }
        ],
        temperature: 0.8,
        maxTokens: 150
      });

      this.conversationHistory.push(
        { role: 'user', content: alexQuestion },
        { role: 'assistant', content: response.content }
      );

      const revealsInfo = this.detectRevealedInfo(alexQuestion, response.content);

      return {
        message: response.content,
        revealsInfo,
        sentiment: this.detectSentiment(response.content)
      };

    } catch (error) {
      console.error('❌ Error getting client response:', error);
      return {
        message: 'Could you repeat that?',
        revealsInfo: [],
        sentiment: 'confused'
      };
    }
  }

  detectRevealedInfo(question, answer) {
    const revealed = [];
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

  detectSentiment(response) {
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

  hasRevealedAllInfo(revealedFields) {
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

module.exports = { ClientSimulator };

