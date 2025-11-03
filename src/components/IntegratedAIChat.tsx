import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon, SpeakerWaveIcon, XIcon, ChatIcon } from '@heroicons/react/outline';
import { useUser } from '../contexts/UserContext';
import Tooltip from './Tooltip';

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
  const [isContinuousMode, setIsContinuousMode] = useState(false); // DISABLED - too buggy, use push-to-talk only
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const recognitionStateRef = useRef<'idle' | 'starting' | 'listening' | 'stopping'>('idle');
  const isContinuousModeRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Improved state management refs
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorCountRef = useRef(0);
  const lastRestartTimeRef = useRef(0);
  const maxRetries = 3;
  const confidenceThreshold = 0.7; // Minimum confidence for speech interruption
  const debounceDelay = 500; // ms to debounce interim results
  const speechTimeout = 5000; // 5 seconds timeout for speech detection
  const minRestartInterval = 1000; // Minimum 1 second between restarts

  // Keep refs in sync with state
  useEffect(() => {
    isContinuousModeRef.current = isContinuousMode;
  }, [isContinuousMode]);

  // Helper functions for improved state management
  const clearRestartTimer = () => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  };

  const clearDebounceTimer = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  const clearSpeechTimeout = () => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
  };

  const scheduleRestart = (delay: number = 2000) => {
    // DISABLED: Continuous mode is too buggy - only allow manual start
    console.log('⏸️ Auto-restart disabled - use push-to-talk only');
    return;
    
    // Original logic commented out to prevent loops
    // if (restartTimerRef.current) {
    //   console.log('🔄 Restart already scheduled, skipping duplicate');
    //   return;
    // }
    // ... rest of restart logic
  };

  const handleSpeechRecognitionError = (error: any) => {
    // Handle different types of speech recognition errors
    const errorType = error.error || error.type;
    
    // Don't log 'no-speech' as an error since it's normal behavior
    if (errorType === 'no-speech') {
      console.log('🎤 No speech detected (normal behavior)');
    } else {
      console.error('Speech recognition error:', error);
      console.log(`🎤 Speech recognition error type: ${errorType}`);
    }
    
    recognitionStateRef.current = 'idle';
    setIsListening(false);
    
    // Don't retry for certain errors that indicate user intent
    if (errorType === 'aborted' || errorType === 'not-allowed') {
      console.log('🎤 Speech recognition aborted or not allowed - not retrying');
      return;
    }
    
    // For 'no-speech' errors, don't schedule restart here - let the natural end event handle it
    if (errorType === 'no-speech') {
      console.log('🎤 No speech detected - letting natural end event handle restart');
      return;
    }
    
    // For other errors, use the retry mechanism
    errorCountRef.current++;
    
    if (errorCountRef.current < maxRetries && isContinuousModeRef.current) {
      console.log(`🔄 Retrying speech recognition (attempt ${errorCountRef.current}/${maxRetries})`);
      scheduleRestart(1000 * errorCountRef.current); // Exponential backoff
    } else if (errorCountRef.current >= maxRetries) {
      console.error('❌ Max retries reached, temporarily disabling continuous mode');
      setIsContinuousMode(false);
      errorCountRef.current = 0; // Reset for next attempt
    }
  };

  const resetErrorCount = () => {
    errorCountRef.current = 0;
  };

  // DISABLED: Auto-start continuous mode (too buggy)
  // useEffect(() => {
  //   if (isOpen && isContinuousMode) {
  //     console.log('🎤 Chat opened - auto-starting continuous mode');
  //     resetErrorCount();
  //     scheduleRestart(500);
  //   }
  // }, [isOpen, isContinuousMode]);

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
        
        // Add better configuration for speech detection
        if ('webkitSpeechRecognition' in window) {
          // Webkit-specific settings for better speech detection
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = true;
        }

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          let maxConfidence = 0;
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence || 0;
            maxConfidence = Math.max(maxConfidence, confidence);
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update input with interim results for real-time feedback
          setInputMessage(finalTranscript + interimTranscript);
          
          // Debounced speech interruption with confidence threshold
          if (interimTranscript.trim() && isSpeakingRef.current && maxConfidence >= confidenceThreshold) {
            clearDebounceTimer();
            debounceTimerRef.current = setTimeout(() => {
              console.log(`🛑 User is speaking (interim, confidence: ${maxConfidence.toFixed(2)}) - interrupting AI speech`);
              stopSpeaking();
            }, debounceDelay);
          }
          
          // If we have a final transcript, handle it
          if (finalTranscript) {
            console.log('🎤 Final transcript received:', finalTranscript);
            clearDebounceTimer(); // Clear any pending interruption
            
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
          handleSpeechRecognitionError(event);
        };

        recognitionRef.current.onend = () => {
          recognitionStateRef.current = 'idle';
          console.log('🎤 Speech recognition ended');
          setIsListening(false);
          
          // Automatic restart after natural speech recognition end in continuous mode
          if (isContinuousModeRef.current && !isSpeakingRef.current) {
            console.log('🔄 Speech recognition ended naturally - scheduling restart for continuous mode');
            console.log('🎤 Current state when scheduling restart:', {
              continuousMode: isContinuousModeRef.current,
              speaking: isSpeakingRef.current,
              recognitionState: recognitionStateRef.current,
              isLoading
            });
            scheduleRestart(500); // Short delay to restart
          } else {
            console.log('⚠️ Not scheduling restart after speech end:', {
              continuousMode: isContinuousModeRef.current,
              speaking: isSpeakingRef.current,
              recognitionState: recognitionStateRef.current,
              isLoading
            });
          }
        };

        recognitionRef.current.onstart = () => {
          console.log('🎤 Speech recognition started successfully');
          recognitionStateRef.current = 'listening';
          resetErrorCount(); // Reset error count on successful start
          clearSpeechTimeout(); // Clear the timeout since we're now listening
          
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
      clearRestartTimer();
      clearDebounceTimer();
      clearSpeechTimeout();
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
      clearRestartTimer();
      clearDebounceTimer();
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
      isListening,
      isContinuousMode: isContinuousModeRef.current,
      isSpeaking: isSpeakingRef.current,
      isLoading
    });
    
    if (recognitionRef.current && recognitionStateRef.current === 'idle' && !isListening) {
      try {
        console.log('🎤 Starting speech recognition...');
        recognitionStateRef.current = 'starting';
        setIsListening(true);
        
        // Set a timeout for speech detection
        clearSpeechTimeout();
        speechTimeoutRef.current = setTimeout(() => {
          console.log('⏰ Speech recognition timeout - no speech detected');
          if (recognitionStateRef.current === 'listening') {
            recognitionRef.current?.stop();
          }
        }, speechTimeout);
        
        recognitionRef.current.start();
      } catch (error) {
        console.error('❌ Failed to start speech recognition:', error);
        recognitionStateRef.current = 'idle';
        setIsListening(false);
        clearSpeechTimeout();
        // Schedule retry if in continuous mode
        if (isContinuousModeRef.current) {
          console.log('🔄 Scheduling retry after speech recognition start error');
          scheduleRestart(2000);
        }
      }
    } else {
      console.log('⚠️ Cannot start listening - conditions not met:', { 
        hasRecognition: !!recognitionRef.current, 
        recognitionState: recognitionStateRef.current, 
        isListening,
        isContinuousMode: isContinuousModeRef.current,
        isSpeaking: isSpeakingRef.current,
        isLoading
      });
    }
  };

  const stopListening = () => {
    clearRestartTimer(); // Clear any pending restarts
    clearDebounceTimer(); // Clear any pending interruptions
    clearSpeechTimeout(); // Clear any pending speech timeout
    
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
      clearRestartTimer(); // Clear any pending restarts
      clearDebounceTimer(); // Clear any pending interruptions
      clearSpeechTimeout(); // Clear any pending speech timeout
      setIsContinuousMode(false);
      if (isListening || recognitionStateRef.current === 'listening') {
        stopListening();
      }
    } else {
      // Start continuous mode
      console.log('▶️ Starting continuous mode');
      clearSpeechTimeout(); // Clear any existing speech timeout
      setIsContinuousMode(true);
      resetErrorCount(); // Reset error count when manually starting
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
    clearRestartTimer(); // Clear any pending restarts
    clearDebounceTimer(); // Clear any pending interruptions
    clearSpeechTimeout(); // Clear any pending speech timeout
    setIsContinuousMode(false);
    if (isListening || recognitionStateRef.current === 'listening') {
      stopListening();
    }
    onClose();
  };

  // Removed handleMicrophoneClick - using only continuous chat mode now

  const stopSpeaking = () => {
    console.log('🛑 FORCE STOPPING ALL AUDIO');
    
    // Stop current audio aggressively
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current.src = '';
        currentAudioRef.current.load();
        currentAudioRef.current.remove(); // Remove from DOM
        currentAudioRef.current = null;
      } catch (e) {
        console.log('Error stopping audio (already stopped):', e);
      }
    }
    
    // Stop ALL audio elements on page (aggressive cleanup)
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
      } catch (e) {
        // Ignore errors from already stopped audio
      }
    });
    
    // Stop browser TTS
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
    
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    
    // Schedule restart after speech interruption in continuous mode
    if (isContinuousModeRef.current && !isLoading) {
      console.log('🔄 Speech interrupted - scheduling restart for continuous mode');
      scheduleRestart(500); // Short delay after interruption
    }
  };

  const clearMessages = () => {
    console.log('🗑️ Clearing chat history');
    setMessages([]);
    setInputMessage('');
  };

  const speakText = async (text: string, voiceIdFromAI?: string) => {
    // CRITICAL: Stop ALL current speech before starting new speech
    console.log('🛑 STOPPING ALL CURRENT SPEECH');
    stopSpeaking();
    
    // Wait longer to ensure all audio is FULLY stopped and cleaned up
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('🚀 Starting speakText with:', {
      textLength: text.length,
      selectedVoice,
      voiceIdFromAI,
      isSpeaking
    });

    setIsSpeaking(true);
    try {
      // Find the correct voice ID for Unreal Speech
      const voiceToFind = (voiceIdFromAI || selectedVoice)?.toLowerCase();
      const selectedVoiceData = availableVoices.find(v => v.id.toLowerCase() === voiceToFind);
      let unrealSpeechVoiceId = selectedVoiceData?.voiceId || 'Jasper';

      // Force Jasper if available
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

      const response = await fetch('http://localhost:3001/api/ai/unreal-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voiceId: unrealSpeechVoiceId,
          speed: 0.1,
          pitch: 1.05
        })
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
        console.log('✅ Voice synthesis completed');
      } else {
        console.error('❌ Voice API error:', response.status);
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
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
        
        // Schedule restart after AI response is complete
        if (isContinuousModeRef.current) {
          console.log('🔄 Scheduling restart after AI response');
          scheduleRestart(3000); // Wait 3 seconds after AI response
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
      
      // Schedule restart after any response (success or error)
      if (isContinuousModeRef.current) {
        console.log('🔄 Scheduling restart after response completion');
        scheduleRestart(2000); // Wait 2 seconds after response completion
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
              <p className="text-xs mb-2">🎤 Click the microphone to speak, or type your message below.</p>
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
          
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here or click the microphone to speak..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                rows={2}
                disabled={isLoading}
              />
            </div>
            
            {/* Microphone Button */}
            <button
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening();
                }
              }}
              disabled={isLoading}
              className={`relative p-3 rounded-full transition-all duration-300 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <MicrophoneIcon className="h-6 w-6" />
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
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>

            {/* Clear Messages Button */}
            <button
              onClick={clearMessages}
              disabled={messages.length === 0}
              className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Instructions */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>💡 Click the microphone to speak, or type your message and press Enter</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedAIChat;
