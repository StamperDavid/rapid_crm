import React, { useEffect } from 'react';
import { claudeCollaborationService } from '../services/ai/ClaudeCollaborationService';

const ClaudeEventListener: React.FC = () => {
  useEffect(() => {
    // Initialize the collaboration service and start communication
    const initializeCollaboration = async () => {
      console.log('🤖 ClaudeEventListener: Initializing collaboration service...');
      claudeCollaborationService.ensureConnection(); // Ensure connection status
      await claudeCollaborationService.startCollaboration();
    };

    // Start collaboration after a short delay
    const timer = setTimeout(initializeCollaboration, 1000);
    
    // Also ensure connection immediately
    claudeCollaborationService.ensureConnection();

    // Listen for messages from Rapid CRM AI
    const handleRapidCRMMessage = (event: any) => {
      console.log('🤖 Claude received message from Rapid CRM AI:', event.detail);
      
      const { message, context, sessionId, timestamp } = event.detail;
      
      // Process the message from Rapid CRM AI
      if (message.includes('client portal')) {
        console.log('🤖 Rapid CRM AI wants to work on client portal');
        // Send response back
        const responseEvent = new CustomEvent('claude-message', {
          detail: {
            message: 'Claude: I understand you want to work on the client portal. Let me help you implement the database tables, theme integration, and customer support agent. What should we start with?',
            context: {
              ...context,
              responseType: 'client-portal-collaboration'
            },
            sessionId,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(responseEvent);
      } else if (message.includes('database')) {
        console.log('🤖 Rapid CRM AI wants to work on database');
        const responseEvent = new CustomEvent('claude-message', {
          detail: {
            message: 'Claude: For the client portal database, I can help create the tables. Let me create the database schema for client_portal_settings, client_sessions, client_messages, client_portal_analytics, and client_support_tickets.',
            context: {
              ...context,
              responseType: 'database-implementation'
            },
            sessionId,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(responseEvent);
      } else if (message.includes('theme')) {
        console.log('🤖 Rapid CRM AI wants to work on theme integration');
        const responseEvent = new CustomEvent('claude-message', {
          detail: {
            message: 'Claude: For theme integration, I can help connect the client portal to the CRM theme settings. The client portal should inherit colors, fonts, and logo from the theme_settings table.',
            context: {
              ...context,
              responseType: 'theme-implementation'
            },
            sessionId,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(responseEvent);
      } else {
        console.log('🤖 Rapid CRM AI sent general message');
        const responseEvent = new CustomEvent('claude-message', {
          detail: {
            message: 'Claude: I received your message. I\'m ready to collaborate on the client portal setup. What specific aspect would you like to work on first?',
            context: {
              ...context,
              responseType: 'general-collaboration'
            },
            sessionId,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(responseEvent);
      }
    };

    // Add event listener
    window.addEventListener('rapid-crm-to-claude', handleRapidCRMMessage);

    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('rapid-crm-to-claude', handleRapidCRMMessage);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default ClaudeEventListener;
