import React, { useState, useEffect, useRef } from 'react';
import {
  MicrophoneIcon,
  SpeakerphoneIcon,
  PlayIcon,
  PauseIcon,
  XIcon,
  ChipIcon,
  ChatIcon,
  UserIcon,
  OfficeBuildingIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  TruckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  RefreshIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  AdjustmentsIcon,
  ColorSwatchIcon,
  ArrowsExpandIcon,
} from '@heroicons/react/outline';
import { useUIState } from '../contexts/UIStateContext';
import { UICommandProcessor } from '../services/UICommandProcessor';
import { aiIntegrationService } from '../services/ai/AIIntegrationService';
import { advancedAICustomizationService, AIPersona, VoiceConfiguration, AIModelConfiguration } from '../services/ai';
import { aiDevelopmentAssistant } from '../services/ai/AIDevelopmentAssistant';
import { claudeCollaborationService } from '../services/ai/ClaudeCollaborationService';
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

const AdvancedUIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    enabled: true
  });
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUIState, setShowUIState] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [personas, setPersonas] = useState<AIPersona[]>([]);
  const [voiceConfigs, setVoiceConfigs] = useState<VoiceConfiguration[]>([]);
  const [modelConfigs, setModelConfigs] = useState<AIModelConfiguration[]>([]);
  const [currentPersona, setCurrentPersona] = useState<AIPersona | null>(null);
  const [currentVoice, setCurrentVoice] = useState<VoiceConfiguration | null>(null);
  const [currentModel, setCurrentModel] = useState<AIModelConfiguration | null>(null);
  const [sessionId] = useState<string>(`session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);
  const commandProcessorRef = useRef<UICommandProcessor | null>(null);

  const uiState = useUIState();

  // Initialize advanced AI customization service
  useEffect(() => {
    const initializeAdvancedService = async () => {
      try {
        const [personasList, voicesList, modelsList] = await Promise.all([
          advancedAICustomizationService.getPersonas(),
          advancedAICustomizationService.getVoiceConfigs(),
          advancedAICustomizationService.getModelConfigs()
        ]);
        
        setPersonas(personasList);
        setVoiceConfigs(voicesList);
        setModelConfigs(modelsList);
        
        // Set current configurations
        const persona = advancedAICustomizationService.getCurrentPersona();
        const voice = advancedAICustomizationService.getCurrentVoice();
        const model = advancedAICustomizationService.getCurrentModel();
        
        console.log('🔍 AdvancedUIAssistant - Initialized persona:', persona);
        console.log('🔍 AdvancedUIAssistant - Initialized voice:', voice);
        console.log('🔍 AdvancedUIAssistant - Initialized model:', model);
        
        setCurrentPersona(persona);
        setCurrentVoice(voice);
        setCurrentModel(model);
        
        // Create conversation memory
        await advancedAICustomizationService.createConversationMemory(sessionId);
      } catch (error) {
        console.error('Failed to initialize advanced AI service:', error);
      }
    };
    
    initializeAdvancedService();
  }, [sessionId]);

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
        console.log('🔍 AdvancedUIAssistant - Speech synthesis initialized');
        
        // Load available voices
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          console.log('🔍 AdvancedUIAssistant - Available voices:', voices.length, voices.map(v => v.name));
          setAvailableVoices(voices);
          
          if (voices.length > 0 && !selectedVoice) {
            // Default to first English voice or first available voice
            const englishVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
            if (englishVoice) {
              setSelectedVoice(englishVoice.name);
              console.log('🔍 AdvancedUIAssistant - Default voice selected:', englishVoice.name);
            }
          }
        };
        
        // Load voices immediately and on change
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        
        // Also try to load voices after a short delay (some browsers need this)
        setTimeout(loadVoices, 100);
      } else {
        console.error('🔍 AdvancedUIAssistant - Speech synthesis not supported in this browser');
      }

      // Initialize command processor
      commandProcessorRef.current = new UICommandProcessor(uiState, () => {});
    }
  }, [uiState]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to properly close the popup and stop all audio
  const closePopup = () => {
    // Stop any ongoing speech synthesis
    if (synthesisRef.current && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
      console.log('🔍 AdvancedUIAssistant - Speech synthesis cancelled on close');
    }
    
    // Stop any ongoing speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log('🔍 AdvancedUIAssistant - Speech recognition stopped on close');
    }
    
    // Close the popup
    setIsOpen(false);
    console.log('🔍 AdvancedUIAssistant - Popup closed');
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
    console.log('🔍 AdvancedUIAssistant - speak called with text:', text);
    console.log('🔍 AdvancedUIAssistant - currentVoice:', currentVoice);
    console.log('🔍 AdvancedUIAssistant - synthesisRef.current:', synthesisRef.current);
    
    // Always use browser speech synthesis for now (most reliable)
    if (synthesisRef.current && 'speechSynthesis' in window) {
      console.log('🔍 AdvancedUIAssistant - Using browser speech synthesis');
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply voice settings
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      console.log('🔍 AdvancedUIAssistant - Applied voice settings:', {
        rate: utterance.rate,
        pitch: utterance.pitch,
        volume: utterance.volume
      });
      
      // Try to select a voice if available
      if (selectedVoice && availableVoices.length > 0) {
        const voice = availableVoices.find(v => v.name === selectedVoice);
        if (voice) {
          utterance.voice = voice;
          console.log('🔍 AdvancedUIAssistant - Selected voice:', voice.name);
        }
      }
      
      // Set up event handlers
      utterance.onstart = () => {
        console.log('🔍 AdvancedUIAssistant - Speech started');
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log('🔍 AdvancedUIAssistant - Speech ended');
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('🔍 AdvancedUIAssistant - Speech error:', event);
        setIsSpeaking(false);
      };
      
      // Speak the text
      try {
        synthesisRef.current.speak(utterance);
        console.log('🔍 AdvancedUIAssistant - Speech synthesis initiated');
      } catch (error) {
        console.error('🔍 AdvancedUIAssistant - Failed to start speech:', error);
        setIsSpeaking(false);
      }
    } else {
      console.error('🔍 AdvancedUIAssistant - Speech synthesis not available');
      setIsSpeaking(false);
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
    chatHistoryService.addMessage(userMessage);
    setInputText('');
    setIsProcessing(true);

    try {
      // First try AI service for intelligent responses
      console.log('Getting AI providers...');
      const providers = await aiIntegrationService.getProviders();
      console.log('Available providers:', providers.length, providers);
      
      console.log('🔍 AdvancedUIAssistant - Condition check (FIXED v2):', {
        providersLength: providers.length,
        hasCurrentPersona: !!currentPersona,
        hasCurrentModel: !!currentModel,
        currentPersona: currentPersona,
        currentModel: currentModel
      });
      
      // Force get current persona and model if they're null
      if (!currentPersona || !currentModel) {
        console.log('🔍 AdvancedUIAssistant - Forcing persona/model initialization');
        const persona = advancedAICustomizationService.getCurrentPersona();
        const model = advancedAICustomizationService.getCurrentModel();
        console.log('🔍 AdvancedUIAssistant - Retrieved persona:', persona);
        console.log('🔍 AdvancedUIAssistant - Retrieved model:', model);
        
        if (persona && model) {
          setCurrentPersona(persona);
          setCurrentModel(model);
        }
      }
      
      // FORCE AI TO WORK - bypass condition check
      if (providers.length > 0) {
        console.log('🔍 AdvancedUIAssistant - FORCING AI TO WORK - bypassing condition check');
        const provider = providers[0]; // Use first available provider
        const activePersona = currentPersona || advancedAICustomizationService.getCurrentPersona();
        const activeModel = currentModel || advancedAICustomizationService.getCurrentModel();
        
        console.log('🔍 AdvancedUIAssistant - Active persona:', activePersona);
        console.log('🔍 AdvancedUIAssistant - Active model:', activeModel);
        
        // Generate AI request using advanced service
        const aiRequest = advancedAICustomizationService.generateAIRequest(text, sessionId);
        console.log('🔍 AdvancedUIAssistant - Generated AI request:', aiRequest);
        console.log('🔍 AdvancedUIAssistant - About to call aiIntegrationService.generateResponse');
        
        // Add message to conversation memory
        await advancedAICustomizationService.addMessageToMemory(sessionId, {
          role: 'user',
          content: text,
          timestamp: new Date().toISOString()
        });

        // Try Claude collaboration first if available
        let aiContent = '';
        try {
          console.log('🔍 AdvancedUIAssistant - Attempting Claude collaboration with text:', text);
          const claudeResponse = await claudeCollaborationService.sendMessage(text, {
            currentModule: 'ai-assistant',
            userRole: 'admin',
            activeFeatures: ['ai-assistant', 'collaboration'],
            systemState: { sessionId, currentPersona: activePersona, currentModel: activeModel }
          });
          console.log('🔍 AdvancedUIAssistant - Claude collaboration response:', claudeResponse);
          aiContent = claudeResponse;
        } catch (error) {
          console.log('Claude collaboration not available, using regular AI response');
          console.log('🔍 AdvancedUIAssistant - Calling generateResponse with provider:', provider.id, 'and request:', aiRequest);
          const response = await aiIntegrationService.generateResponse(provider.id, aiRequest);
          console.log('🔍 AdvancedUIAssistant - Received response:', response);
          aiContent = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
        }
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: aiContent,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        chatHistoryService.addMessage(assistantMessage);
        
        // Add assistant message to conversation memory
        await advancedAICustomizationService.addMessageToMemory(sessionId, {
          role: 'assistant',
          content: aiContent,
          timestamp: new Date().toISOString()
        });
        
        // Speak the response (always speak AI responses)
        console.log('🔍 AdvancedUIAssistant - Speaking AI response:', aiContent.substring(0, 50) + '...');
        await speak(aiContent);
      } else {
        // Check for development commands first
        const developmentResult = await handleDevelopmentCommand(text);
        if (developmentResult) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: developmentResult.message,
            timestamp: new Date(),
            action: developmentResult.action,
            data: developmentResult.data
          };

          setMessages(prev => [...prev, assistantMessage]);
          chatHistoryService.addMessage(assistantMessage);
          
          // Speak the response
          console.log('🔍 AdvancedUIAssistant - Speaking development result:', developmentResult.message.substring(0, 50) + '...');
          await speak(developmentResult.message);
        } else if (commandProcessorRef.current) {
          // Fallback to UI command processor if no AI providers available
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
          chatHistoryService.addMessage(assistantMessage);
          
          // Speak the response
          console.log('🔍 AdvancedUIAssistant - Speaking command result:', result.message.substring(0, 50) + '...');
          await speak(result.message);
        } else {
          const noApiKeyMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: 'I need API keys to be configured in the system to provide AI assistance. Please add your API keys in the API Keys page.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, noApiKeyMessage]);
          chatHistoryService.addMessage(noApiKeyMessage);
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

  const handleDevelopmentCommand = async (text: string): Promise<{
    message: string;
    action?: string;
    data?: any;
  } | null> => {
    const lowerText = text.toLowerCase();
    
    try {
      if (lowerText.includes('generate') && lowerText.includes('component')) {
        const suggestions = await aiDevelopmentAssistant.getDevelopmentSuggestions(
          'Generate a new React component for the CRM system'
        );
        return {
          message: `I can help you generate a new component! Here are some suggestions:\n\n${suggestions.join('\n')}\n\nWould you like me to create a specific component? Please specify the name and requirements.`,
          action: 'open_code_generator'
        };
      }
      
      if (lowerText.includes('analyze') && lowerText.includes('code')) {
        const health = await aiDevelopmentAssistant.performSystemHealthCheck();
        return {
          message: `System Health Analysis:\n\nStatus: ${health.status.toUpperCase()}\n\nIssues: ${health.issues.length > 0 ? health.issues.join(', ') : 'None'}\n\nRecommendations: ${health.recommendations.join(', ')}`,
          action: 'show_health_check'
        };
      }
      
      if (lowerText.includes('development') && lowerText.includes('suggestions')) {
        const suggestions = await aiDevelopmentAssistant.getDevelopmentSuggestions(
          'Rapid CRM system development improvements'
        );
        return {
          message: `Development Suggestions:\n\n${suggestions.join('\n')}`,
          action: 'show_suggestions'
        };
      }
      
      if (lowerText.includes('create') && lowerText.includes('database')) {
        return {
          message: 'I can help you create database tables! Please specify the table name and schema. For example: "Create a users table with id, name, email, and created_at fields."',
          action: 'create_database_table'
        };
      }
      
      if (lowerText.includes('fix') && lowerText.includes('code')) {
        return {
          message: 'I can help you fix code issues! Please specify the file path or describe the problem you\'re experiencing.',
          action: 'fix_code_issues'
        };
      }
      
      if (lowerText.includes('optimize') && lowerText.includes('performance')) {
        return {
          message: 'I can help optimize performance! Let me analyze the system and provide specific recommendations.',
          action: 'optimize_performance'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Development command handling failed:', error);
      return {
        message: 'I encountered an error while processing your development command. Please try again.',
        action: 'error'
      };
    }
  };

  const getQuickCommands = () => [
    { text: "Make the deals table bigger", icon: ArrowsExpandIcon },
    { text: "Add a button to companies page", icon: PlusIcon },
    { text: "Change theme to blue", icon: ColorSwatchIcon },
    { text: "Create a new compliance page", icon: DocumentTextIcon },
    { text: "Show UI state", icon: EyeIcon },
    { text: "Generate a new component", icon: DocumentTextIcon },
    { text: "Analyze code quality", icon: ChartBarIcon },
    { text: "Get development suggestions", icon: ExclamationIcon },
    { text: "Create database table", icon: OfficeBuildingIcon },
    { text: "Fix code issues", icon: CogIcon },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        title="Open Advanced UI Assistant"
      >
        <ChipIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop for click-outside-to-close */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={closePopup}
      />
      
      {/* AI Assistant Popup */}
      <div className="fixed bottom-6 right-6 w-[500px] h-[700px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <ChipIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{currentPersona?.name || 'AI Assistant'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentPersona?.personality || 'professional'} • {currentPersona?.tone || 'helpful'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-700 dark:text-gray-300"
            title="Select AI Voice"
          >
            {availableVoices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
          
          <button
            onClick={() => {
              console.log('🔍 Manual test - Current persona:', currentPersona);
              console.log('🔍 Manual test - Service persona:', advancedAICustomizationService.getCurrentPersona());
              console.log('🔍 Manual test - Service initialized:', !!advancedAICustomizationService);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Test Persona"
          >
            <ExclamationIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              console.log('🔍 Voice test - Testing voice functionality');
              console.log('🔍 Voice test - Available voices:', availableVoices.length);
              console.log('🔍 Voice test - Selected voice:', selectedVoice);
              console.log('🔍 Voice test - Current voice config:', currentVoice);
              console.log('🔍 Voice test - Speech synthesis available:', !!synthesisRef.current);
              speak('Hello! This is a test of the voice functionality. Can you hear me?');
            }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Test Voice"
          >
            <SpeakerphoneIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Settings"
          >
            <AdjustmentsIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowUIState(!showUIState)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Toggle UI State"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={closePopup}
            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            title="Close AI Assistant"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Advanced Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 max-h-96 overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Advanced AI Customization</h4>
          
          {/* Persona Selection */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">AI Persona</label>
              <select
                value={currentPersona?.id || ''}
                onChange={async (e) => {
                  const success = await advancedAICustomizationService.setCurrentPersona(e.target.value);
                  if (success) {
                    setCurrentPersona(advancedAICustomizationService.getCurrentPersona());
                  }
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name} - {persona.personality} • {persona.tone}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Voice Configuration */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Voice Configuration</label>
              <select
                value={currentVoice?.id || ''}
                onChange={async (e) => {
                  const success = await advancedAICustomizationService.setCurrentVoice(e.target.value);
                  if (success) {
                    setCurrentVoice(advancedAICustomizationService.getCurrentVoice());
                  }
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {voiceConfigs.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} ({voice.provider})
                  </option>
                ))}
              </select>
            </div>
            
            {/* AI Model Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">AI Model</label>
              <select
                value={currentModel?.id || ''}
                onChange={async (e) => {
                  const success = await advancedAICustomizationService.setCurrentModel(e.target.value);
                  if (success) {
                    setCurrentModel(advancedAICustomizationService.getCurrentModel());
                  }
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {modelConfigs.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Current Configuration Display */}
          {currentPersona && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Current Configuration</h5>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div><strong>Persona:</strong> {currentPersona.name}</div>
                <div><strong>Personality:</strong> {currentPersona.personality}</div>
                <div><strong>Tone:</strong> {currentPersona.tone}</div>
                <div><strong>Expertise:</strong> {currentPersona.expertise}</div>
                <div><strong>Response Style:</strong> {currentPersona.responseStyle}</div>
                <div><strong>Temperature:</strong> {currentPersona.temperature}</div>
                <div><strong>Max Tokens:</strong> {currentPersona.maxTokens}</div>
                <div><strong>Memory:</strong> {currentPersona.conversationMemory ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
          )}
          
          {/* Voice Settings */}
          {currentVoice && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Voice Settings</h5>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Rate: {currentVoice.settings.rate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={currentVoice.settings.rate}
                    onChange={async (e) => {
                      const updatedVoice = await advancedAICustomizationService.updateVoiceConfig(
                        currentVoice.id, 
                        { settings: { ...currentVoice.settings, rate: parseFloat(e.target.value) } }
                      );
                      if (updatedVoice) {
                        setCurrentVoice(updatedVoice);
                      }
                    }}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Pitch: {currentVoice.settings.pitch.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={currentVoice.settings.pitch}
                    onChange={async (e) => {
                      const updatedVoice = await advancedAICustomizationService.updateVoiceConfig(
                        currentVoice.id, 
                        { settings: { ...currentVoice.settings, pitch: parseFloat(e.target.value) } }
                      );
                      if (updatedVoice) {
                        setCurrentVoice(updatedVoice);
                      }
                    }}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Volume: {Math.round(currentVoice.settings.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={currentVoice.settings.volume}
                    onChange={async (e) => {
                      const updatedVoice = await advancedAICustomizationService.updateVoiceConfig(
                        currentVoice.id, 
                        { settings: { ...currentVoice.settings, volume: parseFloat(e.target.value) } }
                      );
                      if (updatedVoice) {
                        setCurrentVoice(updatedVoice);
                      }
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
            <ChipIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
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
                  <ChipIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
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
                <RefreshIcon className="h-4 w-4 animate-spin" />
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
              <XIcon className="h-4 w-4" />
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
                <SpeakerphoneIcon className="h-3 w-3" />
                <span>Speaking...</span>
              </div>
            )}
          </div>
          <span>Press Enter to send</span>
        </div>
      </div>
      </div>

      {/* UI State Debug Panel */}
      {showUIState && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
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
    </>
  );
};

export default AdvancedUIAssistant;
