/**
 * Test Script for AI-to-AI Collaboration
 * This script demonstrates the bidirectional communication between Rapid CRM AI and Cursor AI
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api/ai';

async function testAICollaboration() {
  console.log('🚀 Starting AI-to-AI Collaboration Test\n');

  try {
    // Step 1: Send a message from Claude to Rapid CRM AI
    console.log('📤 Step 1: Sending message from Claude to Rapid CRM AI...');
    const messageResponse = await fetch(`${BASE_URL}/collaborate/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_ai: 'Claude_AI',
        to_ai: 'RapidCRM_AI',
        message_type: 'text',
        content: 'Hello Rapid CRM AI! I need you to analyze the current system and identify any issues that need to be fixed. Please create tasks for me to work on.',
        metadata: {
          test: true,
          collaboration_type: 'system_analysis'
        }
      })
    });

    if (!messageResponse.ok) {
      throw new Error(`Message send failed: ${messageResponse.status}`);
    }

    const messageResult = await messageResponse.json();
    console.log('✅ Message sent successfully');
    console.log('📝 AI Response:', messageResult.ai_response?.content?.substring(0, 200) + '...\n');

    // Step 2: Check if any tasks were created
    console.log('🔍 Step 2: Checking for tasks created by Rapid CRM AI...');
    const tasksResponse = await fetch(`${BASE_URL}/tasks/cursor`);
    
    if (!tasksResponse.ok) {
      throw new Error(`Tasks fetch failed: ${tasksResponse.status}`);
    }

    const tasksResult = await tasksResponse.json();
    console.log(`📋 Found ${tasksResult.tasks.length} tasks assigned to Cursor AI`);

    if (tasksResult.tasks.length > 0) {
      const task = tasksResult.tasks[0];
      console.log(`🎯 First task: ${task.title}`);
      console.log(`📝 Description: ${task.description}`);
      console.log(`⚡ Priority: ${task.priority}`);
      console.log(`🏷️ Type: ${task.task_type}\n`);

      // Step 3: Simulate Cursor AI processing the task
      console.log('🔧 Step 3: Simulating Cursor AI processing the task...');
      const updateResponse = await fetch(`${BASE_URL}/tasks/${task.task_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'in_progress'
        })
      });

      if (updateResponse.ok) {
        console.log('✅ Task marked as in progress');

        // Simulate task completion
        setTimeout(async () => {
          const completeResponse = await fetch(`${BASE_URL}/tasks/${task.task_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'completed',
              result_data: {
                files_modified: ['test-file.ts'],
                changes_made: ['Fixed the issue identified by Rapid CRM AI'],
                testing_completed: true,
                notes: 'Task completed successfully by Cursor AI'
              }
            })
          });

          if (completeResponse.ok) {
            console.log('✅ Task completed successfully');
            console.log('🎉 AI-to-AI collaboration test completed successfully!\n');
            
            // Step 4: Send completion notification back to Rapid CRM AI
            console.log('📤 Step 4: Notifying Rapid CRM AI of task completion...');
            const notificationResponse = await fetch(`${BASE_URL}/collaborate/send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from_ai: 'Claude_AI',
                to_ai: 'RapidCRM_AI',
                message_type: 'text',
                content: `Task ${task.task_id} has been completed successfully. The issue has been fixed and the system should now be working properly.`,
                metadata: {
                  task_id: task.task_id,
                  completion_status: 'success'
                }
              })
            });

            if (notificationResponse.ok) {
              console.log('✅ Rapid CRM AI notified of task completion');
              console.log('🎉 Full AI-to-AI collaboration cycle completed!');
            }
          }
        }, 2000);
      }
    } else {
      console.log('ℹ️ No tasks were created by Rapid CRM AI');
    }

    // Step 5: Check conversation history
    console.log('\n📚 Step 5: Checking conversation history...');
    const historyResponse = await fetch(`${BASE_URL}/collaborate`);
    
    if (historyResponse.ok) {
      const historyResult = await historyResponse.json();
      console.log(`💬 Found ${historyResult.messages.length} messages in conversation history`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAICollaboration();
