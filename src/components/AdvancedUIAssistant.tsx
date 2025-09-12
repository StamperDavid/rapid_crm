import React, { useState, useEffect, useRef } from 'react';
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
  XMarkIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  TruckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  PaintBrushIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';
import { useUIState } from '../contexts/UIStateContext';
import { UICommandProcessor } from '../services/UICommandProcessor';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  action?: string;
  data?: any;
}

const AdvancedUIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUIState, setShowUIState] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);
  const commandProcessorRef = useRef<UICommandProcessor | null>(null);

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

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          handleSendMessage(transcript, true);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };
      }

      // Speech Synthesis
      if ('speechSynthesis' in window) {
        synthesisRef.current = window.speechSynthesis;
      }

      // Initialize command processor
      commandProcessorRef.current = new UICommandProcessor(uiState, () => {});
    }
  }, [uiState]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = (text: string) => {
    if (synthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthesisRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
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
    setInputText('');
    setIsProcessing(true);

    try {
      if (commandProcessorRef.current) {
        const result = await commandProcessorRef.current.processCommand(text);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: result.message,
          timestamp: new Date(),
          action: result.action,
          data: result.data
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        // Speak the response
        if (isVoice || isSpeaking) {
          speak(result.message);
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Sorry, I encountered an error: ${error}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const getQuickCommands = () => [
    { text: "Make the deals table bigger", icon: ArrowsPointingOutIcon },
    { text: "Add a button to companies page", icon: PlusIcon },
    { text: "Change theme to blue", icon: PaintBrushIcon },
    { text: "Create a new compliance page", icon: DocumentTextIcon },
    { text: "Show UI state", icon: EyeIcon },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        title="Open Advanced UI Assistant"
      >
        <CpuChipIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[500px] h-[700px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <CpuChipIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Advanced UI Assistant</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Voice-controlled UI manipulation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowUIState(!showUIState)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Toggle UI State"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Quick Commands */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {getQuickCommands().map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(cmd.text)}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <cmd.icon className="h-3 w-3" />
              <span>{cmd.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <CpuChipIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Hi! I'm your Advanced UI Assistant.</p>
            <p className="text-xs mt-1">I can modify your CRM interface through voice commands!</p>
            <div className="mt-4 space-y-2 text-xs">
              <p className="font-medium">Try saying:</p>
              <p>• "Make the deals table bigger"</p>
              <p>• "Add a button to the companies page"</p>
              <p>• "Change the theme to blue"</p>
              <p>• "Create a new compliance page"</p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'assistant' && (
                  <CpuChipIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                    {message.isVoice && ' 🎤'}
                    {message.action && ` • ${message.action}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Processing UI command...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me what to change in your UI..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={2}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              <MicrophoneIcon className="h-5 w-5" />
            </button>
            <button
              onClick={clearMessages}
              className="p-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Voice Status */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {isListening && (
              <div className="flex items-center space-x-1 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Listening...</span>
              </div>
            )}
            {isSpeaking && (
              <div className="flex items-center space-x-1 text-blue-500">
                <SpeakerWaveIcon className="h-3 w-3" />
                <span>Speaking...</span>
              </div>
            )}
          </div>
          <span>Press Enter to send</span>
        </div>
      </div>

      {/* UI State Debug Panel */}
      {showUIState && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-md max-h-96 overflow-auto">
            <h3 className="font-semibold mb-2">UI State Debug</h3>
            <pre className="text-xs text-gray-600 dark:text-gray-400">
              {JSON.stringify(uiState.uiState, null, 2)}
            </pre>
            <button
              onClick={() => setShowUIState(false)}
              className="mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedUIAssistant;
