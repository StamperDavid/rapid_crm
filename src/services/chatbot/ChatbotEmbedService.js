/**
 * Chatbot Embed Service
 * Generates WordPress shortcodes and embed codes for Alex the Onboarding Agent
 */

class ChatbotEmbedService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.chatbotConfigs = new Map();
    
    // Initialize default Alex configurations
    this.initializeDefaultConfigs();
  }

  /**
   * Initialize default chatbot configurations
   */
  initializeDefaultConfigs() {
    // Alex Onboarding Agent Configuration
    this.chatbotConfigs.set('alex-onboarding', {
      id: 'alex-onboarding',
      name: 'Alex - Onboarding Agent',
      description: 'USDOT registration and compliance guidance',
      agentId: 'onboarding-agent',
      type: 'onboarding',
      persona: 'Alex',
      capabilities: [
        'regulatory_analysis',
        'service_recommendation', 
        'information_gathering',
        'deal_creation',
        'qualified_states_logic'
      ],
      defaultSettings: {
        theme: 'blue',
        position: 'bottom-right',
        size: 'medium',
        voiceEnabled: true,
        autoStart: false,
        showAvatar: true
      }
    });

    // Alex Customer Service Agent Configuration  
    this.chatbotConfigs.set('alex-customer-service', {
      id: 'alex-customer-service',
      name: 'Alex - Customer Service Agent',
      description: 'Portal guidance and account management',
      agentId: 'customer-service-agent',
      type: 'customer_service',
      persona: 'Alex',
      capabilities: [
        'portal_guidance',
        'account_management',
        'service_renewals',
        'issue_resolution'
      ],
      defaultSettings: {
        theme: 'green',
        position: 'bottom-right',
        size: 'medium',
        voiceEnabled: true,
        autoStart: false,
        showAvatar: true
      }
    });
  }

  /**
   * Generate WordPress shortcode for Alex Onboarding Agent
   */
  generateAlexOnboardingShortcode(options = {}) {
    const config = this.chatbotConfigs.get('alex-onboarding');
    const settings = { ...config.defaultSettings, ...options };

    const shortcode = `[rapid_crm_chatbot 
      agent="alex-onboarding" 
      theme="${settings.theme}" 
      position="${settings.position}" 
      size="${settings.size}" 
      voice="${settings.voiceEnabled ? 'enabled' : 'disabled'}"
      autostart="${settings.autoStart ? 'true' : 'false'}"
      avatar="${settings.showAvatar ? 'show' : 'hide'}"
    ]`;

    return shortcode;
  }

  /**
   * Generate WordPress shortcode for Alex Customer Service Agent
   */
  generateAlexCustomerServiceShortcode(options = {}) {
    const config = this.chatbotConfigs.get('alex-customer-service');
    const settings = { ...config.defaultSettings, ...options };

    const shortcode = `[rapid_crm_chatbot 
      agent="alex-customer-service" 
      theme="${settings.theme}" 
      position="${settings.position}" 
      size="${settings.size}" 
      voice="${settings.voiceEnabled ? 'enabled' : 'disabled'}"
      autostart="${settings.autoStart ? 'true' : 'false'}"
      avatar="${settings.showAvatar ? 'show' : 'hide'}"
    ]`;

    return shortcode;
  }

  /**
   * Generate iframe embed code for external websites
   */
  generateAlexOnboardingEmbedCode(options = {}) {
    const config = this.chatbotConfigs.get('alex-onboarding');
    const settings = { ...config.defaultSettings, ...options };

    const {
      width = '400px',
      height = '600px',
      theme = settings.theme,
      position = settings.position,
      voice = settings.voiceEnabled ? 'enabled' : 'disabled',
      autostart = settings.autoStart ? 'true' : 'false',
      avatar = settings.showAvatar ? 'show' : 'hide'
    } = options;

    const embedUrl = `${this.baseUrl}/chatbot-embed/alex-onboarding?theme=${theme}&position=${position}&voice=${voice}&autostart=${autostart}&avatar=${avatar}`;

    return `<iframe 
      width="${width}" 
      height="${height}" 
      src="${embedUrl}" 
      frameborder="0" 
      allow="microphone; camera"
      style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);"
      title="Alex - USDOT Registration Assistant"
    ></iframe>`;
  }

  /**
   * Generate iframe embed code for Alex Customer Service
   */
  generateAlexCustomerServiceEmbedCode(options = {}) {
    const config = this.chatbotConfigs.get('alex-customer-service');
    const settings = { ...config.defaultSettings, ...options };

    const {
      width = '400px',
      height = '600px',
      theme = settings.theme,
      position = settings.position,
      voice = settings.voiceEnabled ? 'enabled' : 'disabled',
      autostart = settings.autoStart ? 'true' : 'false',
      avatar = settings.showAvatar ? 'show' : 'hide'
    } = options;

    const embedUrl = `${this.baseUrl}/chatbot-embed/alex-customer-service?theme=${theme}&position=${position}&voice=${voice}&autostart=${autostart}&avatar=${avatar}`;

    return `<iframe 
      width="${width}" 
      height="${height}" 
      src="${embedUrl}" 
      frameborder="0" 
      allow="microphone; camera"
      style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);"
      title="Alex - Customer Service Assistant"
    ></iframe>`;
  }

  /**
   * Generate standalone widget HTML for direct embedding
   */
  generateAlexOnboardingWidget(options = {}) {
    const config = this.chatbotConfigs.get('alex-onboarding');
    const settings = { ...config.defaultSettings, ...options };

    const {
      width = '400px',
      height = '600px',
      theme = settings.theme,
      position = settings.position
    } = options;

    return `
<!-- Rapid CRM Alex Onboarding Widget -->
<div id="rapid-crm-alex-onboarding" 
     style="width: ${width}; height: ${height}; position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
  <iframe 
    src="${this.baseUrl}/chatbot-embed/alex-onboarding?theme=${theme}&position=${position}&standalone=true" 
    width="100%" 
    height="100%" 
    frameborder="0"
    allow="microphone; camera"
    title="Alex - USDOT Registration Assistant"
  ></iframe>
</div>
<!-- End Rapid CRM Alex Onboarding Widget -->`;
  }

  /**
   * Generate standalone widget HTML for Alex Customer Service
   */
  generateAlexCustomerServiceWidget(options = {}) {
    const config = this.chatbotConfigs.get('alex-customer-service');
    const settings = { ...config.defaultSettings, ...options };

    const {
      width = '400px',
      height = '600px',
      theme = settings.theme,
      position = settings.position
    } = options;

    return `
<!-- Rapid CRM Alex Customer Service Widget -->
<div id="rapid-crm-alex-customer-service" 
     style="width: ${width}; height: ${height}; position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
  <iframe 
    src="${this.baseUrl}/chatbot-embed/alex-customer-service?theme=${theme}&position=${position}&standalone=true" 
    width="100%" 
    height="100%" 
    frameborder="0"
    allow="microphone; camera"
    title="Alex - Customer Service Assistant"
  ></iframe>
</div>
<!-- End Rapid CRM Alex Customer Service Widget -->`;
  }

  /**
   * Get all available chatbot configurations
   */
  getAvailableChatbots() {
    return Array.from(this.chatbotConfigs.values());
  }

  /**
   * Get specific chatbot configuration
   */
  getChatbotConfig(chatbotId) {
    return this.chatbotConfigs.get(chatbotId);
  }

  /**
   * Update chatbot configuration
   */
  updateChatbotConfig(chatbotId, updates) {
    const config = this.chatbotConfigs.get(chatbotId);
    if (config) {
      this.chatbotConfigs.set(chatbotId, { ...config, ...updates });
      return true;
    }
    return false;
  }
}

// Export singleton instance
const chatbotEmbedService = new ChatbotEmbedService();
module.exports = chatbotEmbedService;



