// src/services/ai/UnifiedAgentInterfaceCommonJS.js
// This file acts as a CommonJS wrapper for the TypeScript UnifiedAgentInterface.

// Dynamically import the ES module
let UnifiedAgentInterfaceModule;
async function getUnifiedAgentInterface() {
  if (!UnifiedAgentInterfaceModule) {
    UnifiedAgentInterfaceModule = await import('./UnifiedAgentInterface.js');
  }
  return UnifiedAgentInterfaceModule;
}

// Export a CommonJS compatible object that uses the dynamically imported module
module.exports = {
  createUnifiedAgent: async (initialAgentId) => {
    const { createUnifiedAgent } = await getUnifiedAgentInterface();
    return createUnifiedAgent(initialAgentId);
  }
};
