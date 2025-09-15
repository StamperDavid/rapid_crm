// Actually communicate with Rapid CRM AI via API
async function communicateWithRapidCrmAI() {
  try {
    console.log('📤 Sending delegation message to Rapid CRM AI...');
    
    const message = `Claude: I have completed the AI Monitor improvements as requested:

1. ✅ Removed the redundant "Start AI Chat" button - the Connect button now handles all AI-to-AI initialization
2. ✅ Fixed the Connect button to be properly named "Connect" (not "Reconnect") 
3. ✅ Removed the garbage can/delete functionality since this is for recording all AI-to-AI communications for review
4. ✅ Cleaned up the testCollaboration function that was no longer needed

The user wants the Connect/Disconnect buttons to only be visible when the AI Monitor window is open. Please implement this visibility logic and any other remaining improvements needed for the AI Monitor component.

Current status: The AI Monitor should now be clean and focused on recording AI-to-AI communications without unnecessary buttons.`;

    const response = await fetch('http://localhost:3001/api/ai/collaborate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        context: {
          currentModule: 'ai-monitor',
          userRole: 'admin',
          sessionId: 'delegation-session',
          task: 'finalize-ai-monitor-visibility',
          priority: 'high'
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Successfully communicated with Rapid CRM AI via API');
      console.log('🤖 Rapid CRM AI Response:', data.response);
      return data.response;
    } else {
      console.error('❌ API call failed:', response.status, response.statusText);
      return 'Failed to communicate with Rapid CRM AI';
    }
  } catch (error) {
    console.error('❌ Error communicating with Rapid CRM AI:', error);
    return 'Error communicating with Rapid CRM AI';
  }
}

// Execute the communication
communicateWithRapidCrmAI().then(response => {
  console.log('Final response:', response);
}).catch(error => {
  console.error('Communication failed:', error);
});
