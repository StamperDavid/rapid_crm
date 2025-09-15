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
  const [selectedVoice, setSelectedVoice] = useState<string>('mikael');
  const [availableVoices, setAvailableVoices] = useState<Array<{id: string, name: string, description: string, gender: string}>>([]);
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
        
        // Load browser voices and server voices
        const loadVoices = async () => {
          try {
            // Get browser's actual available voices
            const browserVoices = speechSynthesis.getVoices();
            console.log('🔍 AdvancedUIAssistant - Browser voices:', browserVoices.length);
            console.log('🔍 AdvancedUIAssistant - Available browser voices:', browserVoices.map(v => `${v.name} (${v.lang})`));
            
            // Get server voices
            const response = await fetch('http://localhost:3001/api/ai/voices');
            const data = await response.json();
            
            console.log('🔍 AdvancedUIAssistant - Server voices response:', data);
            
            let voices = [];
            
            // Check if we have Unreal Speech voices from server
            if (data.success && data.voices && data.voices.length > 0) {
              console.log('🔍 AdvancedUIAssistant - Using Unreal Speech voices:', data.voices);
              voices = data.voices;
            } else if (browserVoices.length > 0) {
              // Fallback to browser voices
              console.log('🔍 AdvancedUIAssistant - Using browser voices as fallback');
              voices = browserVoices.map((voice, index) => {
                const serverVoice = data.success && data.voices[index] ? data.voices[index] : null;
                return {
                  id: voice.name.toLowerCase().replace(/\s+/g, '-'),
                  name: voice.name,
                  description: `${voice.name} (${voice.lang})`,
                  provider: 'browser',
                  voiceId: voice.name,
                  settings: serverVoice?.settings || {
                    rate: 1.0,
                    pitch: 1.0,
                    volume: 1.0
                  },
                  browserVoice: voice
                };
              });
            } else {
              // Fallback to server voices if no browser voices
              voices = data.success ? data.voices : [];
            }
            
            console.log('🔍 AdvancedUIAssistant - Available voices:', voices.length);
            setAvailableVoices(voices);
            
            if (voices.length > 0 && !selectedVoice) {
              setSelectedVoice(voices[0].id);
              console.log('🔍 AdvancedUIAssistant - Default voice selected:', voices[0].id);
            }
          } catch (error) {
            console.error('🔍 AdvancedUIAssistant - Error loading voices:', error);
          }
        };
        
        // Load voices - wait for voices to be available
        const loadVoicesWhenReady = () => {
          const voices = speechSynthesis.getVoices();
          if (voices.length > 0) {
            loadVoices();
          } else {
            // Voices not ready yet, wait a bit and try again
            setTimeout(loadVoicesWhenReady, 100);
          }
        };
        
        loadVoicesWhenReady();
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
    console.log('🔍 AdvancedUIAssistant - selectedVoice:', selectedVoice);
    
    try {
      // Use Unreal Speech for voice synthesis
      const keyResponse = await fetch('http://localhost:3001/api/ai/voice-key');
      const keyData = await keyResponse.json();
      
      console.log('🔍 AdvancedUIAssistant - Voice key response:', keyData);
      
      if (keyData.hasKey && keyData.provider === 'unreal-speech') {
        console.log('🔍 AdvancedUIAssistant - Using Unreal Speech for TTS');
        
        // Get selected voice data
        const selectedVoiceData = availableVoices.find(v => v.id === selectedVoice);
        const voiceId = selectedVoiceData?.voiceId || 'Eleanor';
        
        // Call Unreal Speech API
        const ttsResponse = await fetch('http://localhost:3001/api/ai/unreal-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text,
            voiceId: voiceId,
            speed: selectedVoiceData?.settings?.rate || 0,
            pitch: selectedVoiceData?.settings?.pitch || 1.0
          })
        });
        
        if (ttsResponse.ok) {
          const audioBlob = await ttsResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
          };
          
          await audio.play();
          return;
        } else {
          console.error('🔍 AdvancedUIAssistant - Unreal Speech TTS failed, falling back to browser TTS');
        }
      } else {
        console.error('🔍 AdvancedUIAssistant - Unreal Speech API key not found, falling back to browser TTS');
        // Fallback to browser TTS
        if (synthesisRef.current && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Get voice settings from selected voice
          const selectedVoiceData = availableVoices.find(v => v.id === selectedVoice);
          if (selectedVoiceData) {
            // Use actual browser voice if available
            if (selectedVoiceData.browserVoice) {
              utterance.voice = selectedVoiceData.browserVoice;
              console.log('🔍 AdvancedUIAssistant - Using browser voice:', selectedVoiceData.browserVoice.name);
            }
            
            // Apply voice settings
            if (selectedVoiceData.settings) {
              utterance.rate = selectedVoiceData.settings.rate || voiceSettings.rate;
              utterance.pitch = selectedVoiceData.settings.pitch || voiceSettings.pitch;
              utterance.volume = selectedVoiceData.settings.volume || voiceSettings.volume;
            }
          } else {
            utterance.rate = voiceSettings.rate;
            utterance.pitch = voiceSettings.pitch;
            utterance.volume = voiceSettings.volume;
          }
          
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          
          synthesisRef.current.speak(utterance);
        }
        return;
      }
      
      console.log('🔍 AdvancedUIAssistant - Using PlayHT voice synthesis');
      setIsSpeaking(true);
      
      // Call PlayHT API
      const response = await fetch('https://api.play.ht/api/v2/tts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyData.apiKey}`,
          'X-USER-ID': keyData.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          voice: selectedVoice,
          output_format: 'mp3',
          speed: voiceSettings.rate,
          sample_rate: 24000
        })
      });
      
      if (!response.ok) {
        throw new Error(`PlayHT API error: ${response.statusText}`);
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
        console.log('🔍 AdvancedUIAssistant - PlayHT speech ended');
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
        console.error('🔍 AdvancedUIAssistant - PlayHT audio playback error');
      };
      
      await audio.play();
      console.log('🔍 AdvancedUIAssistant - PlayHT speech started');
      
    } catch (error) {
      console.error('🔍 AdvancedUIAssistant - PlayHT speech error:', error);
      setIsSpeaking(false);
      
      // Fallback to browser TTS
      if (synthesisRef.current && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get voice settings from selected voice
        const selectedVoiceData = availableVoices.find(v => v.id === selectedVoice);
        if (selectedVoiceData) {
          // Use actual browser voice if available
          if (selectedVoiceData.browserVoice) {
            utterance.voice = selectedVoiceData.browserVoice;
            console.log('🔍 AdvancedUIAssistant - Using browser voice (fallback):', selectedVoiceData.browserVoice.name);
          }
          
          // Apply voice settings
          if (selectedVoiceData.settings) {
            utterance.rate = selectedVoiceData.settings.rate || voiceSettings.rate;
            utterance.pitch = selectedVoiceData.settings.pitch || voiceSettings.pitch;
            utterance.volume = selectedVoiceData.settings.volume || voiceSettings.volume;
          }
        } else {
          utterance.rate = voiceSettings.rate;
          utterance.pitch = voiceSettings.pitch;
          utterance.volume = voiceSettings.volume;
        }
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        synthesisRef.current.speak(utterance);
      }
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
      // Use simple intelligent chat endpoint as primary method
      console.log('🔍 AdvancedUIAssistant - Using intelligent chat endpoint for:', text);
      
      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          voice: selectedVoice,
          model: currentModel?.id || 'gpt-4'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        chatHistoryService.addMessage(assistantMessage);
        
        // Speak the response
        console.log('🔍 AdvancedUIAssistant - Speaking intelligent response:', data.response.substring(0, 50) + '...');
        await speak(data.response);
      } else {
        throw new Error(data.error || 'Chat endpoint failed');
      }
    } catch (error) {
      console.log('🔍 AdvancedUIAssistant - Simple chat failed, trying complex AI services as fallback');
      
      // Fallback to complex AI services if simple chat fails
      try {
        console.log('Getting AI providers...');
        const providers = await aiIntegrationService.getProviders();
        console.log('Available providers:', providers.length, providers);
        
        if (providers.length > 0) {
          const provider = providers[0];
          const activePersona = currentPersona || advancedAICustomizationService.getCurrentPersona();
          const activeModel = currentModel || advancedAICustomizationService.getCurrentModel();
          
          // Generate AI request using advanced service
          const aiRequest = advancedAICustomizationService.generateAIRequest(text, sessionId);
          
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
          } catch (claudeError) {
            console.log('Claude collaboration not available, using regular AI response');
            const response = await aiIntegrationService.generateResponse(provider.id, aiRequest);
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
          
          // Speak the response
          console.log('🔍 AdvancedUIAssistant - Speaking complex AI response:', aiContent.substring(0, 50) + '...');
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
      } catch (fallbackError) {
        console.error('🔍 AdvancedUIAssistant - Complex AI services also failed:', fallbackError);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `Sorry, I encountered an error: ${error}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        chatHistoryService.addMessage(errorMessage);
      }
      
      // Fallback to simple chat endpoint
      try {
        const response = await fetch('http://localhost:3001/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            voice: selectedVoice,
            model: currentModel?.id || 'gpt-4'
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: data.response,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          chatHistoryService.addMessage(assistantMessage);
          
          // Speak the response
          console.log('🔍 AdvancedUIAssistant - Speaking simple chat response:', data.response.substring(0, 50) + '...');
          await speak(data.response);
        } else {
          throw new Error(data.error || 'Chat endpoint failed');
        }
      } catch (fallbackError) {
        console.error('🔍 AdvancedUIAssistant - Simple chat endpoint also failed:', fallbackError);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `Sorry, I encountered an error: ${error}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        chatHistoryService.addMessage(errorMessage);
      }
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
              <option key={voice.id} value={voice.id}>
                {voice.name} - {voice.description}
              </option>
            ))}
          </select>
          
          <button
            onClick={closePopup}
            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            title="Close AI Assistant"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
      </div>



      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <ChipIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Hi! I'm your AI Assistant.</p>
            <p className="text-xs mt-1">I can help you with your CRM tasks and coordinate with Claude.</p>
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

    </>
  );
};

export default AdvancedUIAssistant;
