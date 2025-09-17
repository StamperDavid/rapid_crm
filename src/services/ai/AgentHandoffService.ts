import { aiIntegrationService } from './AIIntegrationService';

export interface HandoffContext {
  clientData: any;
  onboardingMessages: any[];
  onboardingCompleted: boolean;
  handoffReason: 'onboarding_complete' | 'escalation' | 'specialized_support';
  sessionId: string;
}

export interface HandoffResult {
  success: boolean;
  handoffMessage: string;
  customerServiceContext: any;
  seamlessTransition: boolean;
}

class AgentHandoffService {
  /**
   * Handles the seamless handoff from onboarding agent to customer service agent
   * This ensures the client experiences a continuous conversation
   */
  async performSeamlessHandoff(context: HandoffContext): Promise<HandoffResult> {
    try {
      // Create a summary of the onboarding conversation for context
      const conversationSummary = this.createConversationSummary(context.onboardingMessages);
      
      // Generate a handoff message that maintains continuity
      const handoffMessage = await this.generateHandoffMessage(context, conversationSummary);
      
      // Create customer service context with onboarding history
      const customerServiceContext = {
        clientData: context.clientData,
        onboardingSummary: conversationSummary,
        handoffReason: context.handoffReason,
        previousMessages: context.onboardingMessages,
        sessionId: context.sessionId,
        agentType: 'customer_service',
        seamlessTransition: true
      };

      // Save handoff information to database
      await this.saveHandoffRecord(context, customerServiceContext);

      return {
        success: true,
        handoffMessage,
        customerServiceContext,
        seamlessTransition: true
      };

    } catch (error) {
      console.error('Error performing agent handoff:', error);
      return {
        success: false,
        handoffMessage: "I'm now here to help you with any ongoing questions about your account and business needs. How can I assist you?",
        customerServiceContext: {
          clientData: context.clientData,
          sessionId: context.sessionId,
          agentType: 'customer_service',
          seamlessTransition: false
        },
        seamlessTransition: false
      };
    }
  }

  /**
   * Creates a summary of the onboarding conversation for context
   */
  private createConversationSummary(messages: any[]): string {
    const agentMessages = messages.filter(msg => msg.type === 'agent');
    const keyTopics = this.extractKeyTopics(agentMessages);
    
    return `Onboarding conversation covered: ${keyTopics.join(', ')}. Client completed application process and is ready for ongoing support.`;
  }

  /**
   * Extracts key topics from agent messages
   */
  private extractKeyTopics(agentMessages: any[]): string[] {
    const topics = new Set<string>();
    
    agentMessages.forEach(message => {
      const content = message.content.toLowerCase();
      
      if (content.includes('company') || content.includes('business')) {
        topics.add('company information');
      }
      if (content.includes('usdot') || content.includes('mc')) {
        topics.add('USDOT/MC registration');
      }
      if (content.includes('compliance') || content.includes('requirement')) {
        topics.add('compliance requirements');
      }
      if (content.includes('vehicle') || content.includes('fleet')) {
        topics.add('fleet information');
      }
      if (content.includes('payment') || content.includes('cost')) {
        topics.add('payment and costs');
      }
    });

    return Array.from(topics);
  }

  /**
   * Generates a handoff message that maintains conversation continuity
   */
  private async generateHandoffMessage(context: HandoffContext, summary: string): Promise<string> {
    try {
      const handoffPrompt = `
        You are transitioning from an onboarding agent to a customer service agent. 
        The client has completed their USDOT application process.
        
        Context: ${summary}
        Client: ${context.clientData?.companyName || 'Client'}
        
        Generate a brief, friendly message that:
        1. Acknowledges the completion of their application
        2. Introduces yourself as their ongoing customer service assistant
        3. Maintains the same helpful, professional tone
        4. Offers to help with any questions about their account or business
        
        Keep it concise and natural - the client should feel like they're talking to the same helpful assistant.
      `;

      const response = await aiIntegrationService.processMessage(
        handoffPrompt,
        { agentType: 'handoff_transition' },
        'handoff_agent'
      );

      return response.content || "Great! I can see you've completed your application. I'm now here to help you with any ongoing questions about your account, compliance requirements, or business operations. What would you like to know?";
      
    } catch (error) {
      console.error('Error generating handoff message:', error);
      return "Great! I can see you've completed your application. I'm now here to help you with any ongoing questions about your account, compliance requirements, or business operations. What would you like to know?";
    }
  }

  /**
   * Saves handoff record to database for tracking and context
   */
  private async saveHandoffRecord(context: HandoffContext, customerServiceContext: any): Promise<void> {
    try {
      await fetch('/api/client-portal/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: context.sessionId,
          handoff_type: context.handoffReason,
          onboarding_messages: context.onboardingMessages,
          customer_service_context: customerServiceContext,
          timestamp: new Date().toISOString(),
          client_data: context.clientData
        })
      });
    } catch (error) {
      console.error('Error saving handoff record:', error);
      // Don't throw - handoff can still succeed without database record
    }
  }

  /**
   * Retrieves handoff context for customer service agent
   */
  async getHandoffContext(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`/api/client-portal/handoff/${sessionId}`);
      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        // No handoff context found - this is normal for new sessions
        return null;
      } else {
        console.error('Failed to get handoff context:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      // Silently handle network errors - don't spam console for expected 404s
      console.error('Error retrieving handoff context:', error);
      return null;
    }
  }
}

export const agentHandoffService = new AgentHandoffService();
