import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon, SpeakerWaveIcon, XIcon, ChatIcon } from '@heroicons/react/outline';
import { useUser } from '../contexts/UserContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  voiceId?: string;
  audioUrl?: string;
}

interface Voice {
  id: string;
  name: string;
  description: string;
  provider: string;
  voiceId: string;
  settings: { rate: number; pitch: number; volume: number; };
}

interface IntegratedAIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const IntegratedAIChat: React.FC<IntegratedAIChatProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('jasper'); // Default to Jasper
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(true); // Auto-start continuous mode like Gemini
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const recognitionStateRef = useRef<'idle' | 'starting' | 'listening' | 'stopping'>('idle');
  const isContinuousModeRef = useRef(false);
  const isSpeakingRef = useRef(false);
  // Removed complex throttling refs - using simpler approach now

  // Keep refs in sync with state
  useEffect(() => {
    isContinuousModeRef.current = isContinuousMode;
  }, [isContinuousMode]);

  // Auto-start continuous mode when chat opens (like Gemini)
  useEffect(() => {
    if (isOpen && isContinuousMode) {
      console.log('🎤 Chat opened - auto-starting continuous mode like Gemini');
      // Start listening after a short delay to ensure everything is initialized
      setTimeout(() => {
        if (recognitionRef.current && recognitionStateRef.current === 'idle') {
          console.log('🎤 Auto-starting speech recognition for continuous mode');
          startListening();
        }
      }, 500);
    }
  }, [isOpen, isContinuousMode]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Load available voices and user's preferred voice
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/ai/voices');
        const data = await response.json();
        if (data.success) {
          console.log('🎤 Available voices:', data.voices);
          setAvailableVoices(data.voices);
          
          // Get user's preferred voice from the server
          const chatResponse = await fetch('http://localhost:3001/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: 'get voice preference',
              userId: user?.id || 'default_user'
            })
          });
          
          if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            console.log('🎤 Voice preference response:', chatData);
            if (chatData.voicePreference?.defaultVoice) {
              console.log('🎤 Setting preferred voice:', chatData.voicePreference.defaultVoice);
              setSelectedVoice(chatData.voicePreference.defaultVoice);
            } else {
              // Try to find Jasper voice, otherwise use first available
              const jasperVoice = data.voices.find((voice: any) => 
                voice.name.toLowerCase().includes('jasper') || 
                voice.id.toLowerCase().includes('jasper')
              );
              if (jasperVoice) {
                console.log('🎤 Setting Jasper voice:', jasperVoice.id);
                setSelectedVoice(jasperVoice.id);
              } else if (data.voices.length > 0) {
                console.log('🎤 Setting first available voice:', data.voices[0].id);
                setSelectedVoice(data.voices[0].id);
              }
            }
          } else {
            // Try to find Jasper voice, otherwise use first available
            const jasperVoice = data.voices.find((voice: any) => 
              voice.name.toLowerCase().includes('jasper') || 
              voice.id.toLowerCase().includes('jasper')
            );
            if (jasperVoice) {
              console.log('🎤 Setting Jasper voice (fallback):', jasperVoice.id);
              setSelectedVoice(jasperVoice.id);
            } else if (data.voices.length > 0) {
              console.log('🎤 Setting first available voice (fallback):', data.voices[0].id);
              setSelectedVoice(data.voices[0].id);
            }
          }
          
          // Force set Jasper if it exists, regardless of preference
          const jasperVoice = data.voices.find((voice: any) => 
            voice.name.toLowerCase().includes('jasper') || 
            voice.id.toLowerCase().includes('jasper')
          );
          if (jasperVoice) {
            console.log('🎤 FORCE SETTING JASPER VOICE:', jasperVoice);
            setSelectedVoice(jasperVoice.id);
          }
        }
      } catch (error) {
        console.error('Error loading voices:', error);
      }
    };
    loadVoices();
  }, []);

  // Load conversation history when component mounts
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!user?.id) return;
      
      try {
        // Get actual conversation history from the new endpoint
        const response = await fetch(`http://localhost:3001/api/ai/conversation-history/${user.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.conversationHistory && data.conversationHistory.length > 0) {
            // Load the actual conversation history
            setMessages(data.conversationHistory);
          } else {
            // No history exists, show welcome message
            setMessages([{
              id: Date.now().toString(),
              content: "Hello! 👋 I'm your Rapid CRM AI assistant. I'm here to help you manage your transportation and logistics business. What can I help you with today?",
              sender: 'assistant',
              timestamp: new Date().toISOString()
            }]);
          }
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
        // Fallback to welcome message if loading fails
        setMessages([{
          id: Date.now().toString(),
          content: "Hello! 👋 I'm your Rapid CRM AI assistant. I'm here to help you manage your transportation and logistics business. What can I help you with today?",
          sender: 'assistant',
          timestamp: new Date().toISOString()
        }]);
      }
    };
    
    loadConversationHistory();
  }, [user?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    console.log('🔧 Initializing speech recognition...');
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        console.log('✅ SpeechRecognition API found, creating instance...');
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Disable continuous listening - we'll control it manually
        recognitionRef.current.interimResults = true; // Show interim results
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update input with interim results for real-time feedback
          setInputMessage(finalTranscript + interimTranscript);
          
          // If we have interim results (user is actively speaking), interrupt AI speech
          if (interimTranscript.trim() && isSpeakingRef.current) {
            console.log('🛑 User is speaking (interim) - interrupting AI speech');
            stopSpeaking();
          }
          
          // If we have a final transcript, handle it
          if (finalTranscript) {
            console.log('🎤 Final transcript received:', finalTranscript);
            
            if (isContinuousModeRef.current) {
              // In continuous mode, send the message and restart listening after response
              console.log('🎤 Sending continuous mode message:', finalTranscript);
              setInputMessage(finalTranscript);
              sendMessage(finalTranscript);
            } else {
              // In manual mode, just set the transcript and stop listening
              setInputMessage(finalTranscript);
              setIsListening(false);
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          recognitionStateRef.current = 'idle';
          setIsListening(false);
          setIsContinuousMode(false);
        };

        recognitionRef.current.onend = () => {
          recognitionStateRef.current = 'idle';
          console.log('🎤 Speech recognition ended');
          setIsListening(false);
        };

        recognitionRef.current.onstart = () => {
          console.log('🎤 Speech recognition started successfully');
          recognitionStateRef.current = 'listening';
          
          // If AI is currently speaking, stop it (interruption handling like Gemini)
          if (isSpeakingRef.current) {
            console.log('🛑 User started speaking - interrupting AI speech');
            stopSpeaking();
          }
        };
      }
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.warn('Error stopping recognition during cleanup:', error);
        }
        recognitionStateRef.current = 'idle';
      }
    };
  }, []); // Empty dependency array - speech recognition should only initialize once

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.warn('Error stopping recognition on unmount:', error);
        }
        recognitionStateRef.current = 'idle';
      }
    };
  }, []);

  const startListening = () => {
    console.log('🎤 startListening called. State:', { 
      hasRecognition: !!recognitionRef.current, 
      recognitionState: recognitionStateRef.current, 
      isListening 
    });
    
    if (recognitionRef.current && recognitionStateRef.current === 'idle' && !isListening) {
      try {
        console.log('🎤 Starting speech recognition...');
        recognitionStateRef.current = 'starting';
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('❌ Failed to start speech recognition:', error);
        recognitionStateRef.current = 'idle';
        setIsListening(false);
      }
    } else {
      console.log('⚠️ Cannot start listening:', { 
        hasRecognition: !!recognitionRef.current, 
        recognitionState: recognitionStateRef.current, 
        isListening 
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && (isListening || recognitionStateRef.current === 'listening')) {
      try {
        recognitionStateRef.current = 'stopping';
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        recognitionStateRef.current = 'idle';
        setIsListening(false);
      }
    }
  };

  const toggleContinuousMode = () => {
    console.log('🎤 Toggling continuous mode. Current state:', { isContinuousMode, isListening, recognitionState: recognitionStateRef.current });
    
    if (isContinuousMode) {
      // Stop continuous mode
      console.log('🛑 Stopping continuous mode');
      setIsContinuousMode(false);
      if (isListening || recognitionStateRef.current === 'listening') {
        stopListening();
      }
    } else {
      // Start continuous mode
      console.log('▶️ Starting continuous mode');
      setIsContinuousMode(true);
      // Start listening immediately when continuous mode is enabled
      setTimeout(() => {
        if (recognitionRef.current && recognitionStateRef.current === 'idle') {
          console.log('🎤 Starting speech recognition for continuous mode');
          startListening();
        }
      }, 100);
    }
  };

  // Add a function to stop continuous mode when chat closes
  const handleClose = () => {
    console.log('🎤 Chat closing - stopping continuous mode');
    setIsContinuousMode(false);
    if (isListening || recognitionStateRef.current === 'listening') {
      stopListening();
    }
    onClose();
  };

  // Removed handleMicrophoneClick - using only continuous chat mode now

  // Global audio reference for interruption handling
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeaking = () => {
    console.log('🛑 Stopping current speech');
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    // Also stop browser TTS if it's running
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakText = async (text: string, voiceIdFromAI?: string) => {
    // Stop any current speech before starting new speech (interruption handling)
    if (isSpeaking) {
      console.log('🛑 Interrupting current speech to start new speech');
      stopSpeaking();
    }

    console.log('🚀 DIAGNOSTIC: Starting speakText with:', {
      textLength: text.length,
      selectedVoice,
      voiceIdFromAI,
      availableVoices: availableVoices.length,
      isSpeaking
    });

    setIsSpeaking(true);
    try {
      // Find the correct voice ID for Unreal Speech (case-insensitive)
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
          console.log('🎤 FORCING JASPER VOICE for TTS:', jasperVoice);
          unrealSpeechVoiceId = jasperVoice.voiceId;
        } else {
          console.log('🎤 JASPER VOICE NOT FOUND in availableVoices, using default Jasper');
          unrealSpeechVoiceId = 'Jasper'; // Force Jasper even if not found in availableVoices
        }
      }

      console.log('🚀 DIAGNOSTIC: Voice selection:', {
        selectedVoice,
        voiceIdFromAI,
        voiceToFind,
        selectedVoiceData,
        unrealSpeechVoiceId,
        availableVoices: availableVoices.map(v => ({ id: v.id, name: v.name, voiceId: v.voiceId }))
      });

      // Truncate text to 1000 characters for Unreal Speech API
      const truncatedText = text.length > 1000 ? text.substring(0, 997) + '...' : text;

      // Use Unreal Speech API for high-quality TTS
      console.log('🚀 DIAGNOSTIC: Calling Unreal Speech API with:', {
        text: truncatedText.substring(0, 50) + '...',
        voiceId: unrealSpeechVoiceId,
        speed: 0,
        pitch: 1.0
      });

      const response = await fetch('http://localhost:3001/api/ai/unreal-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: truncatedText,
          voiceId: unrealSpeechVoiceId,
          speed: 0.1, // Slightly faster for more natural speech
          pitch: 1.05 // Slightly higher pitch for more natural sound
        })
      });

      console.log('⚡ Fast Voice API response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        cache: response.headers.get('X-Cache')
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Store reference for interruption handling
        currentAudioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          currentAudioRef.current = null;
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          currentAudioRef.current = null;
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
        console.log('⚡ Fast voice synthesis completed successfully');
      } else {
        const errorText = await response.text();
        console.error('❌ Fast Voice API error:', response.status, errorText);
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

  const sendMessage = async (messageText?: string) => {
    const messageToSend = messageText || inputMessage;
    if (!messageToSend.trim() || isLoading) return;

    console.log('🚀 DIAGNOSTIC: Starting sendMessage with:', {
      message: messageToSend,
      selectedVoice,
      isContinuousMode,
      isLoading,
      user: user?.id
    });

    // Stop speech recognition while processing to prevent overlapping
    if (isListening || recognitionStateRef.current === 'listening') {
      console.log('🛑 Stopping speech recognition during message processing');
      stopListening();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to AI with user context
      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          voice: selectedVoice,
          model: 'anthropic/claude-3.5-sonnet',
          userId: user?.id || 'default_user' // Include user ID for conversation isolation
        })
      });

      const data = await response.json();
      console.log('🚀 DIAGNOSTIC: AI Chat API response:', {
        success: data.success,
        hasResponse: !!data.response,
        voice: data.voice,
        voicePreference: data.voicePreference,
        responseLength: data.response?.length
      });

      if (data.success && data.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'ai',
          timestamp: new Date(),
          voiceId: data.voice
        };
        setMessages(prev => [...prev, aiMessage]);

        console.log('🚀 DIAGNOSTIC: About to speak response with voice:', data.voice);
        // Speak the AI response, passing the voice from the AI response
        await speakText(data.response, data.voice);
        
        // Restart continuous listening after response is complete
        if (isContinuousModeRef.current) {
          console.log('🔄 Restarting continuous listening after AI response');
          setTimeout(() => {
            if (isContinuousModeRef.current && !isSpeakingRef.current && recognitionStateRef.current === 'idle') {
              startListening();
            }
          }, 3000); // Wait 3 seconds after AI response
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Removed isProcessingRef - using simpler approach now
      
      // Restart continuous listening after any response (success or error)
      if (isContinuousModeRef.current) {
        console.log('🔄 Restarting continuous listening after response completion');
        setTimeout(() => {
          if (isContinuousModeRef.current && !isSpeakingRef.current && recognitionStateRef.current === 'idle') {
            startListening();
          }
        }, 2000);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Rapid CRM AI</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Transportation partner</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Voice Selection */}
            <div className="flex items-center space-x-1">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Voice:</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs max-w-24"
              >
                {availableVoices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
              <div className="h-10 w-10 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="text-white text-base font-bold">AI</span>
              </div>
              <h3 className="text-base font-medium mb-1">Hey David! I'm your Rapid CRM AI partner.</h3>
              <p className="text-xs mb-1">I'm here to help you with transportation compliance, CRM systems, and project management.</p>
              <p className="text-xs mb-2">🎤 <strong>Continuous conversation is active!</strong> Just speak naturally like you would with Gemini.</p>
              <p className="text-xs">What would you like to work on today?</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {message.timestamp instanceof Date 
                      ? message.timestamp.toLocaleTimeString()
                      : new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          {/* Continuous Mode Indicator */}
          {isContinuousMode && (
            <div className="mb-2 p-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 border border-green-300 dark:border-green-700 rounded-md">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                  🎤 Continuous conversation active - just speak naturally like Gemini!
                </span>
              </div>
            </div>
          )}
          
          {/* Manual Mode Indicator */}
          {!isContinuousMode && (
            <div className="mb-2 p-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                  Manual mode - click the chat icon to start continuous conversation
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isContinuousMode ? "🎤 Continuous conversation active - just speak naturally!" : "Type your message here or click the chat icon for voice..."}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                rows={2}
                disabled={isLoading || isContinuousMode}
              />
            </div>
            
            {/* Animated Chat Icon */}
            <button
              onClick={() => {
                console.log('Chat icon clicked, current state:', isContinuousMode);
                toggleContinuousMode();
              }}
              disabled={isLoading}
              className={`relative p-3 rounded-full transition-all duration-300 ${
                isContinuousMode
                  ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 shadow-lg shadow-blue-500/25'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={
                isContinuousMode 
                  ? 'Stop continuous conversation' 
                  : 'Start continuous voice conversation'
              }
            >
              {/* Animated gradient rings when active - behind the icon */}
              {isContinuousMode && (
                <>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 animate-spin opacity-75 blur-sm -z-10"></div>
                  <div className="absolute inset-1 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 animate-pulse -z-10"></div>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 -z-10"></div>
                </>
              )}
              
              {/* Chat Icon - always on top */}
              <ChatIcon className={`h-6 w-6 transition-all duration-300 relative z-10 ${
                isContinuousMode 
                  ? 'text-white animate-pulse' 
                  : 'text-white'
              }`} />
              
              {/* Pulsing dot indicator */}
              {isContinuousMode && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping z-20"></div>
              )}
            </button>
            
            {/* Stop Speaking Button - only show when AI is speaking */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                title="Stop AI speech"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* Send Button */}
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading || isContinuousMode}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isContinuousMode ? 'Send disabled in continuous mode' : 'Send message'}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Instructions */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {isContinuousMode ? (
              <span>💬 <strong>Gemini-style continuous chat:</strong> Just speak naturally! You can interrupt the AI by speaking. Click the animated chat icon to switch to manual mode.</span>
            ) : (
              <span>💡 Click the chat icon to start Gemini-style continuous voice conversation</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedAIChat;
