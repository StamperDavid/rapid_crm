import React, { useState, useEffect, useRef } from 'react';
import {
  ChatIcon,
  MicrophoneIcon,
  SpeakerphoneIcon,
  PauseIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/outline';
import { aiIntegrationService } from '../services/ai/AIIntegrationService';
import { agentHandoffService } from '../services/ai/AgentHandoffService';

interface CustomerServiceAgentProps {
  clientData: any;
  sessionId: string;
  onHandoffFromOnboarding?: (messages: any[]) => void;
}

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

const CustomerServiceAgent: React.FC<CustomerServiceAgentProps> = ({
  clientData,
  sessionId,
  onHandoffFromOnboarding
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: 'Hello! I\'m your customer service assistant. I\'m here to help you with any questions about your account, compliance status, or transportation business needs. How can I assist you today?',
      timestamp: new Date()
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isActive, setIsActive] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Handle handoff from onboarding agent
  useEffect(() => {
    const loadHandoffContext = async () => {
      if (sessionId) {
        try {
          const handoffContext = await agentHandoffService.getHandoffContext(sessionId);
          if (handoffContext && handoffContext.seamlessTransition) {
            // Add the handoff message from the onboarding agent
            const handoffMessage: Message = {
              id: Date.now().toString(),
              type: 'agent',
              content: handoffContext.handoffMessage || 'Great! I can see you\'ve completed your application. I\'m now here to help you with any ongoing questions about your account, compliance requirements, or business operations. What would you like to know?',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, handoffMessage]);
          }
        } catch (error) {
          console.error('Error loading handoff context:', error);
        }
      }
    };

    loadHandoffContext();
  }, [sessionId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && !isProcessing && sessionId) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: newMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      // Save user message to database
      try {
        await fetch('/api/client-portal/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            message_type: 'user',
            content: newMessage,
            metadata: { timestamp: new Date().toISOString() }
          })
        });
      } catch (error) {
        console.error('Error saving user message:', error);
      }

      setIsProcessing(true);
      const messageToProcess = newMessage;
      setNewMessage('');

      try {
        // Create context for the AI about the client and their needs
        const context = {
          clientData,
          conversationHistory: messages,
          portalType: 'customer_service',
          userRole: 'client',
          agentType: 'customer_service'
        };

        // Get AI response using the customer service agent
        const response = await aiIntegrationService.processMessage(
          messageToProcess,
          context,
          'customer_service_agent'
        );

        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: response.content,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, agentResponse]);

        // Save agent response to database
        try {
          await fetch('/api/client-portal/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              message_type: 'agent',
              content: response.content,
              metadata: { 
                timestamp: new Date().toISOString(),
                confidence: response.confidence || 0.8,
                agentType: 'customer_service'
              }
            })
          });
        } catch (error) {
          console.error('Error saving agent message:', error);
        }

        // Speak the response if voice is enabled
        if (isActive) {
          speakMessage(response.content);
        }

      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact our support team if the issue persists.',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Speech synthesis function
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  // Handle voice toggle with real speech recognition
  const handleVoiceToggle = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleTestVoice = () => {
    const testMessage = "Hello! This is your Rapid CRM customer service assistant. I'm here to help you with any questions about your account, compliance status, or transportation business needs.";
    speakMessage(testMessage);
  };

  return (
    <div className="space-y-6">
      {/* Agent Status */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Customer Service Assistant
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleVoiceToggle}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isListening
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            }`}
          >
            {isListening ? (
              <PauseIcon className="h-4 w-4 mr-1" />
            ) : (
              <MicrophoneIcon className="h-4 w-4 mr-1" />
            )}
            {isListening ? 'Stop Listening' : 'Start Voice'}
          </button>
          
          <button
            onClick={handleTestVoice}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <SpeakerphoneIcon className="h-4 w-4 mr-1" />
            Test Voice
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Chat with Customer Service
        </h4>
        
        {/* Messages */}
        <div className="h-64 overflow-y-auto mb-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Assistant is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleSendMessage}
            disabled={isProcessing || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceAgent;
