import { useState, useEffect, useCallback } from 'react';
import { 
  continuousVoiceService, 
  ContinuousVoiceSettings, 
  ConversationState 
} from '../services/voice/ContinuousVoiceService';

export const useContinuousVoice = () => {
  const [settings, setSettings] = useState<ContinuousVoiceSettings>(
    continuousVoiceService.getSettings()
  );
  const [conversationState, setConversationState] = useState<ConversationState>(
    continuousVoiceService.getConversationState()
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the service
  useEffect(() => {
    setIsInitialized(true);
    
    // Subscribe to conversation state changes
    const unsubscribe = continuousVoiceService.subscribe((newState) => {
      setConversationState(newState);
    });

    return unsubscribe;
  }, []);

  // Start continuous conversation
  const startConversation = useCallback(() => {
    if (!isInitialized) return false;
    return continuousVoiceService.startConversation();
  }, [isInitialized]);

  // Stop continuous conversation
  const stopConversation = useCallback(() => {
    continuousVoiceService.stopConversation();
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<ContinuousVoiceSettings>) => {
    continuousVoiceService.updateSettings(newSettings);
    setSettings(continuousVoiceService.getSettings());
  }, []);

  // Toggle conversation on/off
  const toggleConversation = useCallback(() => {
    if (conversationState.isActive) {
      stopConversation();
    } else {
      startConversation();
    }
  }, [conversationState.isActive, startConversation, stopConversation]);

  // Manual wake word trigger
  const triggerWakeWord = useCallback(() => {
    continuousVoiceService.triggerWakeWord();
  }, []);

  // Get conversation summary
  const getConversationSummary = useCallback(() => {
    return continuousVoiceService.getConversationSummary();
  }, []);

  return {
    // State
    settings,
    conversationState,
    isInitialized,
    
    // Actions
    startConversation,
    stopConversation,
    toggleConversation,
    updateSettings,
    triggerWakeWord,
    getConversationSummary,
    
    // Computed values
    isActive: conversationState.isActive,
    isListening: conversationState.isListening,
    isSpeaking: conversationState.isSpeaking,
    conversationHistory: conversationState.conversationHistory,
    currentTranscript: conversationState.currentTranscript,
    lastActivity: conversationState.lastActivity
  };
};
