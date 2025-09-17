import React, { useState, useEffect, useRef } from 'react';
import {
  ChatIcon,
  MicrophoneIcon,
  SpeakerphoneIcon,
  PauseIcon,
  XIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/outline';
import { aiIntegrationService } from '../services/ai/AIIntegrationService';
import { agentHandoffService } from '../services/ai/AgentHandoffService';

interface ChatbotWidgetProps {
  clientData: any;
  sessionId: string;
}

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  clientData,
  sessionId
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
  const [escalationRequested, setEscalationRequested] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('jasper');
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/ai/voices');
        const data = await response.json();
        if (data.success) {
          setAvailableVoices(data.voices);
          // Set Jasper as default if available
          const jasperVoice = data.voices.find((voice: any) => 
            voice.name.toLowerCase().includes('jasper') || 
            voice.id.toLowerCase().includes('jasper')
          );
          if (jasperVoice) {
            setSelectedVoice(jasperVoice.id);
          } else if (data.voices.length > 0) {
            setSelectedVoice(data.voices[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading voices:', error);
      }
    };
    loadVoices();
  }, []);

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

  // Check for escalation requests and handle handoffs to human agents
  const checkForEscalationRequest = (message: string): boolean => {
    const escalationKeywords = [
      'human', 'person', 'agent', 'representative', 'support', 'help',
      'escalate', 'manager', 'supervisor', 'live chat', 'real person',
      'talk to someone', 'speak to someone', 'not working', 'error',
      'broken', 'issue', 'problem', 'can\'t help', 'confused'
    ];
    
    const lowerMessage = message.toLowerCase();
    return escalationKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const handleEscalationToHuman = async () => {
    setEscalationRequested(true);
    
    const escalationMessage: Message = {
      id: Date.now().toString(),
      type: 'agent',
      content: 'I understand you\'d like to speak with a human agent. I\'m escalating your request to our support team. A human representative will be with you shortly. In the meantime, please provide a brief description of your issue so they can assist you better.',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, escalationMessage]);
    
    // Save escalation request to database
    try {
      await fetch('/api/client-portal/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message_type: 'escalation_request',
          content: 'Client requested human agent assistance',
          metadata: { 
            timestamp: new Date().toISOString(),
            escalation_type: 'human_agent_request',
            client_data: clientData
          }
        })
      });
    } catch (error) {
      console.error('Error saving escalation request:', error);
    }
  };

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

      // Check if this is an escalation request
      if (checkForEscalationRequest(messageToProcess)) {
        await handleEscalationToHuman();
        setIsProcessing(false);
        return;
      }

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
        
        // If AI service fails, offer escalation to human
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: 'I apologize, but I\'m experiencing technical difficulties right now. Would you like me to connect you with a human agent who can assist you immediately?',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorResponse]);
        
        // Save error for tracking
        try {
          await fetch('/api/client-portal/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              message_type: 'system_error',
              content: 'AI service error - offering human escalation',
              metadata: { 
                timestamp: new Date().toISOString(),
                error_type: 'ai_service_failure',
                error_details: error instanceof Error ? error.message : 'Unknown error'
              }
            })
          });
        } catch (saveError) {
          console.error('Error saving error message:', saveError);
        }
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
  const speakMessage = async (text: string, voiceIdFromAI?: string) => {
    // Stop any current speech before starting new speech
    if (isSpeaking) {
      speechSynthesis.cancel();
    }

    setIsSpeaking(true);
    try {
      // Find the correct voice ID for Unreal Speech
      const voiceToFind = (voiceIdFromAI || selectedVoice)?.toLowerCase();
      const selectedVoiceData = availableVoices.find(v => v.id.toLowerCase() === voiceToFind);
      let unrealSpeechVoiceId = selectedVoiceData?.voiceId || 'Jasper';

      // Force Jasper if available and not already selected
      if (unrealSpeechVoiceId !== 'Jasper') {
        const jasperVoice = availableVoices.find(v => 
          v.name.toLowerCase().includes('jasper') || 
          v.id.toLowerCase().includes('jasper')
        );
        if (jasperVoice) {
          unrealSpeechVoiceId = jasperVoice.voiceId;
        } else {
          unrealSpeechVoiceId = 'Jasper';
        }
      }

      // Truncate text to 1000 characters for Unreal Speech API
      const truncatedText = text.length > 1000 ? text.substring(0, 997) + '...' : text;

      const response = await fetch('http://localhost:3001/api/ai/unreal-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: truncatedText,
          voiceId: unrealSpeechVoiceId,
          speed: 0,
          pitch: 1.0
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        await audio.play();
      } else {
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
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
    <>
      {/* Chatbot Toggle Button - 5px above footer */}
      <div className="fixed right-6 z-50" style={{ bottom: 'calc(80px + 5px)' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 relative"
          title="Open Customer Service Chat"
        >
          {/* Pulse animation - only when chat is closed */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-75"></div>
          )}
          <div className="relative">
            <ChatIcon className="h-8 w-8" />
          </div>
        </button>
      </div>

      {/* Chatbot Widget - covers the button when open */}
      {isOpen && (
        <div className="fixed right-6 z-50 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700" style={{ bottom: 'calc(80px + 5px)' }}>
          {/* Chat Header */}
          <div className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg ${
            escalationRequested 
              ? 'bg-orange-600 text-white' 
              : 'bg-blue-600 text-white'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                escalationRequested ? 'bg-orange-400' : 'bg-green-400'
              }`}></div>
              <div>
                <h3 className="font-semibold">
                  {escalationRequested ? 'Escalated to Human Agent' : 'Customer Service'}
                </h3>
                <p className="text-xs text-blue-100">
                  {escalationRequested ? 'Human agent will join shortly' : 'Online now'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-100 hover:text-white transition-colors"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3">
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

          {/* Voice Controls */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {/* Voice Selection */}
              <div className="flex items-center space-x-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Voice:</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="px-1 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white max-w-20"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleVoiceToggle}
                className={`flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isListening
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {isListening ? (
                  <PauseIcon className="h-3 w-3 mr-1" />
                ) : (
                  <MicrophoneIcon className="h-3 w-3 mr-1" />
                )}
                {isListening ? 'Listening...' : 'Voice'}
              </button>
              
              <button
                onClick={handleTestVoice}
                className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <SpeakerphoneIcon className="h-3 w-3 mr-1" />
                Test
              </button>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
