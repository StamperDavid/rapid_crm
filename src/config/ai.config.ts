/**
 * AI Configuration
 * Central configuration for ALL intelligent agents
 * API keys are loaded from DATABASE via API keys page
 */

export const AI_CONFIG = {
  // API keys loaded from database (set via API keys management page)
  apiKeys: {
    openai: null as string | null,
    anthropic: null as string | null,
    openrouter: null as string | null
  },
  
  // Loading state - MUST be true before creating any agents
  keysLoaded: false,
  
  // Model configuration
  models: {
    openai: 'gpt-4-turbo-preview',
    anthropic: 'claude-3-5-sonnet-20241022',
    openrouter: 'openai/gpt-4-turbo-preview' // OpenRouter model format
  },
  
  // Default provider (auto-detected from available keys)
  defaultProvider: 'openrouter' as 'openai' | 'anthropic' | 'openrouter',
  
  // Fallback behavior when no API key
  allowPatternMatchingFallback: false, // DISABLED - agents MUST use LLM or fail
  
  // LLM settings
  temperature: 0.1,
  maxTokens: 1000,
  
  // Feature flags
  useLLMForFormFilling: true,
  useLLMForCompliance: true,
  useLLMForConversation: true,
};

/**
 * Load API keys from database
 */
export async function loadAPIKeysFromDatabase(): Promise<void> {
  try {
    console.log('🔑 Loading API keys from database...');
    const response = await fetch('/api/api-keys');
    console.log('🔑 Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Failed to load API keys from database, status:', response.status);
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }
    
    const keys = await response.json();
    console.log('🔑 Raw keys from database:', keys);
    
    console.log('🔑 API Keys loaded from database:', keys.map((k: any) => ({ name: k.name, provider: k.provider })));
    
    // Find OpenRouter key (PRIORITY - unified API)
    const openrouterKey = keys.find((k: any) => 
      k.provider?.toLowerCase() === 'openrouter' || 
      k.provider?.toLowerCase() === 'open-router' ||
      k.provider?.toLowerCase() === 'open_router' ||
      k.name?.toLowerCase().includes('openrouter') ||
      k.name?.toLowerCase().includes('open router') ||
      k.name?.toLowerCase().includes('open-router')
    );
    
    // Find OpenAI key
    const openaiKey = keys.find((k: any) => 
      k.provider?.toLowerCase() === 'openai' || 
      k.name?.toLowerCase().includes('openai')
    );
    
    // Find Anthropic key
    const anthropicKey = keys.find((k: any) => 
      k.provider?.toLowerCase() === 'anthropic' || 
      k.name?.toLowerCase().includes('anthropic') ||
      k.name?.toLowerCase().includes('claude')
    );
    
    if (openrouterKey) {
      AI_CONFIG.apiKeys.openrouter = openrouterKey.key_value;
      AI_CONFIG.defaultProvider = 'openrouter';
      console.log('✅ OpenRouter API key loaded from database - TRUE INTELLIGENCE ENABLED');
      console.log('🎯 OpenRouter provides access to GPT-4, Claude, and more via single API');
      console.log('🔑 Key stored in AI_CONFIG.apiKeys.openrouter:', AI_CONFIG.apiKeys.openrouter?.substring(0, 10) + '...');
    }
    
    if (openaiKey) {
      AI_CONFIG.apiKeys.openai = openaiKey.key_value;
      if (!openrouterKey) AI_CONFIG.defaultProvider = 'openai';
      console.log('✅ OpenAI API key loaded from database');
    }
    
    if (anthropicKey) {
      AI_CONFIG.apiKeys.anthropic = anthropicKey.key_value;
      if (!openrouterKey && !openaiKey) AI_CONFIG.defaultProvider = 'anthropic';
      console.log('✅ Anthropic API key loaded from database');
    }
    
    if (!openrouterKey && !openaiKey && !anthropicKey) {
      console.error('❌ NO AI API KEYS FOUND IN DATABASE');
      console.error('📝 Add OpenRouter, OpenAI, or Anthropic key via API Keys management page');
      console.error('🎯 Recommended: OpenRouter (unified access to all models)');
    }
    
    // Mark keys as loaded
    AI_CONFIG.keysLoaded = true;
    console.log('✅ API keys loading complete. Agents can now be created.');
    
  } catch (error) {
    console.error('Error loading API keys from database:', error);
    AI_CONFIG.keysLoaded = true; // Set to true even on error so agents can try to start
  }
}

/**
 * Check if LLM is available
 */
export function isLLMAvailable(): boolean {
  if (AI_CONFIG.defaultProvider === 'openrouter') {
    return !!AI_CONFIG.apiKeys.openrouter && AI_CONFIG.apiKeys.openrouter.startsWith('sk-');
  } else if (AI_CONFIG.defaultProvider === 'openai') {
    return !!AI_CONFIG.apiKeys.openai && AI_CONFIG.apiKeys.openai.startsWith('sk-');
  } else if (AI_CONFIG.defaultProvider === 'anthropic') {
    return !!AI_CONFIG.apiKeys.anthropic && AI_CONFIG.apiKeys.anthropic.startsWith('sk-ant-');
  }
  return false;
}

/**
 * Get current LLM configuration
 */
export function getLLMConfig() {
  if (AI_CONFIG.defaultProvider === 'openrouter') {
    return {
      provider: 'openrouter' as const,
      apiKey: AI_CONFIG.apiKeys.openrouter || '',
      model: AI_CONFIG.models.openrouter,
      temperature: AI_CONFIG.temperature,
      maxTokens: AI_CONFIG.maxTokens
    };
  } else if (AI_CONFIG.defaultProvider === 'openai') {
    return {
      provider: 'openai' as const,
      apiKey: AI_CONFIG.apiKeys.openai || '',
      model: AI_CONFIG.models.openai,
      temperature: AI_CONFIG.temperature,
      maxTokens: AI_CONFIG.maxTokens
    };
  } else {
    return {
      provider: 'anthropic' as const,
      apiKey: AI_CONFIG.apiKeys.anthropic || '',
      model: AI_CONFIG.models.anthropic,
      temperature: AI_CONFIG.temperature,
      maxTokens: AI_CONFIG.maxTokens
    };
  }
}

