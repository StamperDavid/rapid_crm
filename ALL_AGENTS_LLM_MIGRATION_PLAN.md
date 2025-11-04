# ALL Agents → TRUE LLM Intelligence Migration Plan

**Goal:** Every agent uses GPT-4/Claude. Zero pattern matching.

---

## Migration Checklist

### Phase 1: Core Infrastructure ✅
- [x] LLMService (central AI service)
- [x] BaseIntelligentAgent (enforces LLM)
- [x] AI Config (centralized settings)
- [x] Pattern matching fallback DISABLED

### Phase 2: USDOT RPA Agent ✅
- [x] IntelligentDataMapper uses LLM
- [x] Removes all pattern matching when LLM available
- [x] Fails loudly without API key
- [x] Logs all LLM decisions

### Phase 3: Alex (Compliance Agent)
- [ ] Update AlexTrainingService to use LLM
- [ ] Remove conversation simulations
- [ ] Use LLM for compliance determinations
- [ ] Extend BaseIntelligentAgent

### Phase 4: Onboarding Agent
- [ ] Update OnboardingAgent.ts to extend BaseIntelligentAgent
- [ ] Replace all logic with LLM calls
- [ ] Use LLM for state qualification
- [ ] Use LLM for service recommendations

### Phase 5: Customer Service Agents
- [ ] Update all customer service logic
- [ ] LLM for ticket analysis
- [ ] LLM for response generation
- [ ] LLM for escalation decisions

### Phase 6: Sales Agents
- [ ] Update sales workflows
- [ ] LLM for lead qualification
- [ ] LLM for proposal generation
- [ ] LLM for pricing recommendations

### Phase 7: Jasper (Managing Agent)
- [ ] Create Jasper orchestrator
- [ ] LLM for agent assignment
- [ ] LLM for task delegation
- [ ] LLM for conflict resolution
- [ ] Manages all other agents

### Phase 8: All Other Agents
- [ ] Scan all files in src/services/ai/
- [ ] Scan all files in src/services/agents/
- [ ] Update each to use BaseIntelligentAgent
- [ ] Remove ALL pattern matching
- [ ] Replace with LLM calls

---

## Standard Pattern for ALL Agents

```typescript
// OLD (Pattern Matching - BAD):
class OldAgent {
  analyze(text) {
    if (text.includes('keyword')) {
      return 'answer';
    }
  }
}

// NEW (LLM - REQUIRED):
class NewAgent extends BaseIntelligentAgent {
  constructor() {
    super({
      agentId: 'agent_id',
      agentName: 'Agent Name',
      agentType: 'agent_type',
      systemPrompt: 'You are an expert...',
      requireLLM: true
    });
  }
  
  async analyze(text, context) {
    const result = await this.think<{answer: string, reasoning: string}>(`
      Analyze this: ${text}
      Context: ${context}
      
      Respond with JSON: {answer, reasoning}
    `, true);
    
    return result.response;
  }
}
```

---

## Testing Plan

For EACH agent after migration:
1. Test without API key → Should FAIL with clear error
2. Add API key → Should work with LLM
3. Verify console shows "Using LLM..."
4. Verify responses are intelligent
5. Check token usage is reasonable

---

## Timeline

**Once API key is added:**
- USDOT RPA: ✅ Ready NOW
- Alex: 2-3 hours
- Onboarding: 2-3 hours
- Customer Service: 3-4 hours
- Sales: 2-3 hours
- Jasper: 4-5 hours
- All others: 5-8 hours

**Total: ~20-25 hours of focused work**

---

## Success Criteria

✅ Every agent file uses BaseIntelligentAgent  
✅ Zero instances of pattern matching  
✅ All agents call this.think() for reasoning  
✅ All agents FAIL without API key  
✅ Console shows LLM usage for every decision  
✅ Jasper orchestrates all agents intelligently  

---

**Starting with USDOT RPA agent. Once you add API key and verify it works, I'll update ALL other agents.**

