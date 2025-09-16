export interface ContinuousVoiceSettings {
  enabled: boolean;
  autoListen: boolean;
  autoSpeak: boolean;
  wakeWord: string;
  silenceTimeout: number; // milliseconds
  maxConversationLength: number;
  voiceSettings: {
    rate: number;
    pitch: number;
    volume: number;
    voice: string;
    provider: string;
  };
}

export interface ConversationState {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  conversationHistory: ConversationMessage[];
  currentTranscript: string;
  lastActivity: Date;
}

export interface ConversationMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  transcript?: string;
}

export class ContinuousVoiceService {
  private settings: ContinuousVoiceSettings;
  private conversationState: ConversationState;
  private recognition: any; // SpeechRecognition
  private synthesis: SpeechSynthesis;
  private isInitialized: boolean = false;
  private silenceTimer: NodeJS.Timeout | null = null;
  private conversationListeners: ((state: ConversationState) => void)[] = [];

  constructor() {
    this.settings = {
      enabled: false,
      autoListen: true,
      autoSpeak: true,
      wakeWord: 'hey rapid crm',
      silenceTimeout: 5000, // 5 seconds
      maxConversationLength: 50,
      voiceSettings: {
        rate: 0.9,
        pitch: 1.0,
        volume: 0.8,
        voice: '',
        provider: 'browser'
      }
    };

    this.conversationState = {
      isActive: false,
      isListening: false,
      isSpeaking: false,
      conversationHistory: [],
      currentTranscript: '',
      lastActivity: new Date()
    };

    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (typeof window === 'undefined') return;

    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Event handlers
    this.recognition.onstart = () => {
      this.conversationState.isListening = true;
      this.conversationState.lastActivity = new Date();
      this.notifyListeners();
      console.log('🎤 Continuous voice listening started');
    };

    this.recognition.onresult = (event: any) => {
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

      this.conversationState.currentTranscript = finalTranscript || interimTranscript;
      this.conversationState.lastActivity = new Date();
      this.notifyListeners();

      // Process final transcript
      if (finalTranscript) {
        this.processUserInput(finalTranscript.trim());
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.conversationState.isListening = false;
      this.notifyListeners();
      
      // Restart listening if it was an error (not user stopping)
      if (this.conversationState.isActive && event.error !== 'aborted') {
        setTimeout(() => this.startListening(), 1000);
      }
    };

    this.recognition.onend = () => {
      this.conversationState.isListening = false;
      this.notifyListeners();
      
      // Restart listening if conversation is still active
      if (this.conversationState.isActive) {
        setTimeout(() => this.startListening(), 500);
      }
    };

    this.isInitialized = true;
  }

  // Start continuous conversation mode
  startConversation() {
    if (!this.isInitialized) {
      console.error('Speech recognition not initialized');
      return false;
    }

    this.conversationState.isActive = true;
    this.conversationState.conversationHistory = [];
    this.conversationState.currentTranscript = '';
    this.conversationState.lastActivity = new Date();
    
    this.notifyListeners();
    console.log('🗣️ Continuous voice conversation started');

    if (this.settings.autoListen) {
      this.startListening();
    }

    return true;
  }

  // Stop continuous conversation mode
  stopConversation() {
    this.conversationState.isActive = false;
    this.conversationState.isListening = false;
    this.conversationState.isSpeaking = false;
    
    if (this.recognition) {
      this.recognition.stop();
    }
    
    this.synthesis.cancel();
    this.clearSilenceTimer();
    
    this.notifyListeners();
    console.log('🔇 Continuous voice conversation stopped');
  }

  // Start listening for speech
  private startListening() {
    if (!this.conversationState.isActive || this.conversationState.isListening) return;

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }

  // Process user input and generate AI response
  private async processUserInput(transcript: string) {
    if (!transcript) return;

    // Add user message to conversation history
    const userMessage: ConversationMessage = {
      id: this.generateId(),
      type: 'user',
      content: transcript,
      timestamp: new Date(),
      transcript: transcript
    };

    this.conversationState.conversationHistory.push(userMessage);
    this.conversationState.currentTranscript = '';
    this.notifyListeners();

    console.log('👤 User said:', transcript);

    // Check for wake word or conversation context
    const isWakeWord = transcript.toLowerCase().includes(this.settings.wakeWord.toLowerCase());
    const isConversation = this.conversationState.conversationHistory.length > 1;

    if (isWakeWord || isConversation) {
      // Generate AI response
      await this.generateAIResponse(transcript);
    }

    // Clear silence timer and set new one
    this.clearSilenceTimer();
    this.setSilenceTimer();
  }

  // Generate AI response and speak it
  private async generateAIResponse(userInput: string) {
    try {
      // Call AI API to get response
      const response = await this.callAIAPI(userInput);
      
      if (response && this.settings.autoSpeak) {
        await this.speakResponse(response);
      }

      // Add AI message to conversation history
      const aiMessage: ConversationMessage = {
        id: this.generateId(),
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      this.conversationState.conversationHistory.push(aiMessage);
      this.notifyListeners();

    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage = "I'm sorry, I encountered an error processing your request.";
      await this.speakResponse(errorMessage);
    }
  }

  // Call AI API to get response
  private async callAIAPI(userInput: string): Promise<string> {
    try {
      const response = await fetch('/api/ai/agents/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userInput,
          context: this.getConversationContext(),
          agentId: 'continuous-voice-agent'
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || data.answer || 'I received your message but couldn\'t generate a proper response.';
    } catch (error) {
      console.error('AI API call failed:', error);
      return 'I\'m having trouble connecting to the AI service right now.';
    }
  }

  // Get conversation context for AI
  private getConversationContext(): string {
    const recentMessages = this.conversationState.conversationHistory.slice(-6); // Last 6 messages
    return recentMessages.map(msg => `${msg.type}: ${msg.content}`).join('\n');
  }

  // Speak AI response
  private async speakResponse(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      this.conversationState.isSpeaking = true;
      this.notifyListeners();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply voice settings
      utterance.rate = this.settings.voiceSettings.rate;
      utterance.pitch = this.settings.voiceSettings.pitch;
      utterance.volume = this.settings.voiceSettings.volume;

      // Set voice if available
      if (this.settings.voiceSettings.voice) {
        const voices = this.synthesis.getVoices();
        const selectedVoice = voices.find(voice => 
          voice.name === this.settings.voiceSettings.voice || 
          voice.name.includes(this.settings.voiceSettings.voice)
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onend = () => {
        this.conversationState.isSpeaking = false;
        this.notifyListeners();
        resolve();
      };

      utterance.onerror = (error) => {
        this.conversationState.isSpeaking = false;
        this.notifyListeners();
        reject(error);
      };

      this.synthesis.speak(utterance);
    });
  }

  // Set silence timer to stop conversation after inactivity
  private setSilenceTimer() {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      if (this.conversationState.isActive) {
        console.log('⏰ Conversation timeout due to silence');
        this.stopConversation();
      }
    }, this.settings.silenceTimeout);
  }

  // Clear silence timer
  private clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Update settings
  updateSettings(newSettings: Partial<ContinuousVoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  // Get current settings
  getSettings(): ContinuousVoiceSettings {
    return { ...this.settings };
  }

  // Get conversation state
  getConversationState(): ConversationState {
    return { ...this.conversationState };
  }

  // Subscribe to conversation state changes
  subscribe(listener: (state: ConversationState) => void): () => void {
    this.conversationListeners.push(listener);
    return () => {
      const index = this.conversationListeners.indexOf(listener);
      if (index > -1) {
        this.conversationListeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of state changes
  private notifyListeners() {
    this.conversationListeners.forEach(listener => {
      try {
        listener(this.conversationState);
      } catch (error) {
        console.error('Error notifying conversation listener:', error);
      }
    });
  }

  // Save settings to localStorage
  private saveSettings() {
    localStorage.setItem('continuousVoiceSettings', JSON.stringify(this.settings));
  }

  // Load settings from localStorage
  private loadSettings() {
    const saved = localStorage.getItem('continuousVoiceSettings');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Error loading continuous voice settings:', error);
      }
    }
  }

  // Manual trigger for testing
  triggerWakeWord() {
    this.processUserInput(this.settings.wakeWord);
  }

  // Get conversation summary
  getConversationSummary(): string {
    const messages = this.conversationState.conversationHistory;
    if (messages.length === 0) return 'No conversation yet';
    
    const userMessages = messages.filter(m => m.type === 'user').length;
    const aiMessages = messages.filter(m => m.type === 'ai').length;
    
    return `${userMessages} user messages, ${aiMessages} AI responses`;
  }
}

// Export singleton instance
export const continuousVoiceService = new ContinuousVoiceService();
