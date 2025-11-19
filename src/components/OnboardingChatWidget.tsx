/**
 * Onboarding Chat Widget
 * Conversational interface for collecting client information and recommending services
 * This is the client-facing onboarding agent
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ChatIcon,
  XIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  TruckIcon
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: 'agent' | 'client';
  content: string;
  timestamp: Date;
  type?: string;
}

interface OnboardingChatWidgetProps {
  onComplete?: (dealId: string) => void;
  autoOpen?: boolean;
}

const OnboardingChatWidget: React.FC<OnboardingChatWidgetProps> = ({
  onComplete,
  autoOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentQuestionType, setCurrentQuestionType] = useState<string>('text');
  const [options, setOptions] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start onboarding session when widget opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      startOnboarding();
    }
  }, [isOpen]);

  const startOnboarding = async () => {
    try {
      const response = await fetch('/api/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialData: {} })
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        setProgress(data.progress || 0);
        setCurrentQuestionType(data.type || 'text');
        setOptions(data.options || []);
        
        addMessage('agent', data.question);
      } else {
        toast.error('Failed to start onboarding');
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      toast.error('Failed to connect to server');
    }
  };

  const addMessage = (sender: 'agent' | 'client', content: string) => {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender,
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage('client', userMessage);
    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          response: userMessage
        })
      });

      const data = await response.json();

      if (data.success) {
        setProgress(data.progress || 0);
        setCurrentQuestionType(data.type || 'text');
        setOptions(data.options || []);
        
        // Add agent response
        setTimeout(() => {
          addMessage('agent', data.question);
          
          // Handle special types
          if (data.type === 'payment_redirect' && data.checkoutUrl) {
            setTimeout(() => {
              window.location.href = data.checkoutUrl;
            }, 2000);
          }
          
          if (data.type === 'handoff' && data.dealId) {
            if (onComplete) {
              setTimeout(() => {
                onComplete(data.dealId);
              }, 3000);
            }
          }
        }, 1000); // Delay for natural feel
      } else {
        toast.error(data.error || 'Failed to process response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (option: string) => {
    setInputValue(option);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Chat widget toggle button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 z-50"
        aria-label="Start chat"
      >
        <ChatIcon className="h-6 w-6" />
      </button>
    );
  }

  // Chat widget window
  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <TruckIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Registration Assistant</h3>
            <p className="text-xs text-blue-100">Let's get you compliant!</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 p-1 rounded transition-colors"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'client'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Options */}
      {options.length > 0 && !isLoading && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick replies:</p>
          <div className="flex flex-wrap gap-2">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5 transform rotate-90" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center flex items-center justify-center">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Secure & Confidential
        </p>
      </div>
    </div>
  );
};

export default OnboardingChatWidget;










