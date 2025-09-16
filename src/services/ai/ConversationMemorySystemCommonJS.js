// src/services/ai/ConversationMemorySystemCommonJS.js
// This file acts as a CommonJS wrapper for the TypeScript ConversationMemorySystem.

// Dynamically import the ES module
let ConversationMemorySystemModule;
async function getConversationMemorySystem() {
  if (!ConversationMemorySystemModule) {
    ConversationMemorySystemModule = await import('./ConversationMemorySystem.js');
  }
  return ConversationMemorySystemModule.conversationMemorySystem;
}

// Export a CommonJS compatible object that uses the dynamically imported module
module.exports = {
  conversationMemorySystem: {
    startConversation: async (...args) => (await getConversationMemorySystem()).startConversation(...args),
    addMessage: async (...args) => (await getConversationMemorySystem()).addMessage(...args),
    getConversationHistory: async (...args) => (await getConversationMemorySystem()).getConversationHistory(...args),
    transferConversation: async (...args) => (await getConversationMemorySystem()).transferConversation(...args),
    getConversationSummary: async (...args) => (await getConversationMemorySystem()).getConversationSummary(...args),
    getAgentPersonality: async (...args) => (await getConversationMemorySystem()).getAgentPersonality(...args),
    getActiveConversations: async (...args) => (await getConversationMemorySystem()).getActiveConversations(...args),
    getConversation: async (...args) => (await getConversationMemorySystem()).getConversation(...args),
    closeConversation: async (...args) => (await getConversationMemorySystem()).closeConversation(...args),
    updateAgentPersonality: async (...args) => (await getConversationMemorySystem()).updateAgentPersonality(...args)
  }
};
