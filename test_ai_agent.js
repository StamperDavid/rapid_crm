// Test script to verify the AI agent is working with the simplified prompt
const fetch = require('node-fetch');

async function testAIAgent() {
  try {
    console.log('🧪 Testing AI Agent with simplified prompt...');
    
    const response = await fetch('http://localhost:3001/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, can you help me test the onboarding agent?',
        voice: 'jasper',
        model: 'anthropic/claude-3.5-sonnet',
        userId: 'test_user'
      })
    });

    const data = await response.json();
    
    console.log('✅ AI Agent Response:');
    console.log('Success:', data.success);
    console.log('Response:', data.response);
    console.log('Response Length:', data.response?.length);
    
    // Check if it's giving generic responses
    if (data.response && data.response.length > 500) {
      console.log('⚠️  WARNING: Response is very long - might still be using old prompt');
    } else {
      console.log('✅ Response length looks good - simplified prompt working');
    }
    
    // Check for generic phrases
    const genericPhrases = [
      'AI Agent Orchestration Strategy',
      'My Agent Creation Philosophy',
      'Complete System Capabilities',
      'CRM Management System'
    ];
    
    const hasGenericPhrases = genericPhrases.some(phrase => 
      data.response && data.response.includes(phrase)
    );
    
    if (hasGenericPhrases) {
      console.log('❌ ERROR: Still giving generic, scripted responses!');
    } else {
      console.log('✅ No generic phrases detected - agent is responding intelligently');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAIAgent();
