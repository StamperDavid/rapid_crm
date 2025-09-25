import React, { useState, useEffect, useRef } from 'react';
import {
  MicrophoneIcon,
  SpeakerphoneIcon,
  XIcon,
  ChipIcon,
  RefreshIcon,
} from '@heroicons/react/outline';
import { useUIState } from '../contexts/UIStateContext';
import { UICommandProcessor } from '../services/UICommandProcessor';
// Removed direct AI agent import - frontend should use API calls instead
import { chatHistoryService } from '../services/ai/ChatHistoryService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  action?: string;
  data?: any;
}

const AdvancedUIAssistantFixed: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId] = useState<string>(`session-${Date.now()}`);
  // Removed direct AI agent instantiation - will use API calls instead
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);

  const uiState = useUIState();

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          handleSendMessage(transcript, true);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }

      // Speech Synthesis
      if ('speechSynthesis' in window) {
        synthesisRef.current = window.speechSynthesis;
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to properly close the popup and stop all audio
  const closePopup = () => {
    // Stop any ongoing speech synthesis
    if (synthesisRef.current && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Stop any ongoing speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    // Close the popup
    setIsOpen(false);
  };

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closePopup();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen]);

  const speak = async (text: string) => {
    try {
      if (synthesisRef.current && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        synthesisRef.current.speak(utterance);
      }
    } catch (error) {
      console.error('Error with speech synthesis:', error);
    }
  };

  const handleSendMessage = async (text: string, isVoice: boolean = false) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    chatHistoryService.addMessage(userMessage);
    setInputText('');
    setIsProcessing(true);

    try {
      // Use API call to backend instead of direct agent instantiation
      console.log('🧠 AdvancedUIAssistant - Sending message to backend API:', text);
      
      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          userId: '1', // Default user ID
          voice: 'jasper'
        })
      });
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response || 'Sorry, I could not process your request.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      chatHistoryService.addMessage(assistantMessage);
      
      // Speak the response
      console.log('🧠 AdvancedUIAssistant - Speaking intelligent response:', data.response.substring(0, 50) + '...');
      await speak(data.response);
      
    } catch (error) {
      console.error('Error with TrulyIntelligentAgent:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Sorry, I encountered an error: ${error}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      chatHistoryService.addMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Floating AI Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          title="AI Assistant"
        >
          <ChipIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>

      {/* AI Assistant Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closePopup} />
          <div className="absolute bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <ChipIcon className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">AI Assistant</h3>
              </div>
              <button
                onClick={closePopup}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                  <ChipIcon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <p>Hello! I'm your Rapid CRM AI assistant.</p>
                  <p className="text-sm mt-2">Ask me about transportation, compliance, or CRM tasks.</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.isVoice && (
                      <p className="text-xs opacity-75 mt-1">🎤 Voice</p>
                    )}
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  <MicrophoneIcon className="h-5 w-5" />
                </button>
                
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                  disabled={isProcessing}
                />
                
                <button
                  onClick={() => handleSendMessage(inputText)}
                  disabled={!inputText.trim() || isProcessing}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Send message"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={clearMessages}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Clear messages
                </button>
                
                <div className="flex items-center space-x-2">
                  {isSpeaking && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <SpeakerphoneIcon className="h-4 w-4" />
                      <span className="text-xs">Speaking</span>
                    </div>
                  )}
                  {isListening && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <MicrophoneIcon className="h-4 w-4 animate-pulse" />
                      <span className="text-xs">Listening</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvancedUIAssistantFixed;
