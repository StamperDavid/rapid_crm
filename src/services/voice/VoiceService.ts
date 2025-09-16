export interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: string;
  provider: 'browser' | 'azure' | 'openai' | 'unreal-speech';
  apiKey?: string;
  model?: string;
}

export interface VoiceProvider {
  name: string;
  id: string;
  voices: VoiceOption[];
  supportsCustomUpload: boolean;
  supportsSettings: boolean;
}

export interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  accent?: string;
  description?: string;
  previewUrl?: string;
  isCustom?: boolean;
}

export class VoiceService {
  private settings: VoiceSettings;
  private availableVoices: VoiceOption[] = [];
  private customVoices: VoiceOption[] = [];

  constructor() {
    this.settings = {
      rate: 0.9,
      pitch: 1.0,
      volume: 0.8,
      voice: '',
      provider: 'browser'
    };
    this.loadSettings();
    this.loadCustomVoices();
  }

  // Load settings from localStorage
  private loadSettings() {
    const saved = localStorage.getItem('voiceSettings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }

  // Save settings to localStorage
  private saveSettings() {
    localStorage.setItem('voiceSettings', JSON.stringify(this.settings));
  }

  // Load custom voices from localStorage
  private loadCustomVoices() {
    const saved = localStorage.getItem('customVoices');
    if (saved) {
      this.customVoices = JSON.parse(saved);
    }
  }

  // Save custom voices to localStorage
  private saveCustomVoices() {
    localStorage.setItem('customVoices', JSON.stringify(this.customVoices));
  }

  // Get all available voice providers
  getProviders(): VoiceProvider[] {
    return [
      {
        name: 'Browser (Built-in)',
        id: 'browser',
        voices: this.getBrowserVoices(),
        supportsCustomUpload: false,
        supportsSettings: true
      },
      {
        name: 'Azure Speech',
        id: 'azure',
        voices: this.getAzureVoices(),
        supportsCustomUpload: false,
        supportsSettings: true
      },
      {
        name: 'OpenAI TTS',
        id: 'openai',
        voices: this.getOpenAIVoices(),
        supportsCustomUpload: false,
        supportsSettings: true
      },
      {
        name: 'Unreal Speech',
        id: 'unreal-speech',
        voices: this.getUnrealSpeechVoices(),
        supportsCustomUpload: false,
        supportsSettings: true
      }
    ];
  }

  // Get browser voices
  private getBrowserVoices(): VoiceOption[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return [];
    }

    const seenIds = new Set<string>();
    
    return window.speechSynthesis.getVoices()
      .filter(voice => voice.lang === 'en-US') // Only US English voices
      .map((voice, index) => {
        // Create a truly unique ID by combining multiple properties
        let uniqueId = `${voice.name}-${voice.lang}-${voice.voiceURI || 'default'}-${index}`;
        
        // Ensure uniqueness by adding a counter if needed
        let counter = 0;
        while (seenIds.has(uniqueId)) {
          counter++;
          uniqueId = `${voice.name}-${voice.lang}-${voice.voiceURI || 'default'}-${index}-${counter}`;
        }
        seenIds.add(uniqueId);
        
        return {
          id: uniqueId,
          name: voice.name,
          language: voice.lang,
          gender: this.detectGender(voice.name),
          accent: this.detectAccent(voice.name),
          description: `${voice.name} (${voice.lang})`
        };
      });
  }


  // Get Azure Speech voices
  private getAzureVoices(): VoiceOption[] {
    return [
      { id: 'en-US-AriaNeural', name: 'Aria', language: 'en-US', gender: 'female', accent: 'American' },
      { id: 'en-US-DavisNeural', name: 'Davis', language: 'en-US', gender: 'male', accent: 'American' },
      { id: 'en-US-GuyNeural', name: 'Guy', language: 'en-US', gender: 'male', accent: 'American' },
      { id: 'en-US-JaneNeural', name: 'Jane', language: 'en-US', gender: 'female', accent: 'American' },
      { id: 'en-US-JasonNeural', name: 'Jason', language: 'en-US', gender: 'male', accent: 'American' },
      { id: 'en-US-JennyNeural', name: 'Jenny', language: 'en-US', gender: 'female', accent: 'American' },
      { id: 'en-US-NancyNeural', name: 'Nancy', language: 'en-US', gender: 'female', accent: 'American' },
      { id: 'en-US-RogerNeural', name: 'Roger', language: 'en-US', gender: 'male', accent: 'American' },
      { id: 'en-US-SaraNeural', name: 'Sara', language: 'en-US', gender: 'female', accent: 'American' },
      { id: 'en-US-TonyNeural', name: 'Tony', language: 'en-US', gender: 'male', accent: 'American' }
    ];
  }

  // Get OpenAI TTS voices
  private getOpenAIVoices(): VoiceOption[] {
    return [
      { id: 'alloy', name: 'Alloy', language: 'en-US', gender: 'neutral', accent: 'American' },
      { id: 'echo', name: 'Echo', language: 'en-US', gender: 'male', accent: 'American' },
      { id: 'fable', name: 'Fable', language: 'en-US', gender: 'male', accent: 'American' },
      { id: 'onyx', name: 'Onyx', language: 'en-US', gender: 'male', accent: 'American' },
      { id: 'nova', name: 'Nova', language: 'en-US', gender: 'female', accent: 'American' },
      { id: 'shimmer', name: 'Shimmer', language: 'en-US', gender: 'female', accent: 'American' }
    ];
  }

  // Get Unreal Speech voices - Premium conversational AI voices
  private getUnrealSpeechVoices(): VoiceOption[] {
    return [
      // Featured voices from Unreal Speech
      { id: 'eleanor', name: 'Eleanor', language: 'en-US', gender: 'female', accent: 'American', description: 'Professional female voice' },
      { id: 'javier', name: 'Javier', language: 'en-US', gender: 'male', accent: 'American', description: 'Professional male voice' },
      { id: 'hubert', name: 'Hubert', language: 'en-US', gender: 'male', accent: 'American', description: 'Professional tone perfect for training and business' },
      { id: 'deedee', name: 'Deedee', language: 'en-US', gender: 'female', accent: 'American', description: 'Poetic and expressive voice for creative content' },
      { id: 'mamaw', name: 'Mamaw', language: 'en-US', gender: 'female', accent: 'American', description: 'Enthusiastic and motivational voice' },
      { id: 'conor', name: 'Conor', language: 'en-US', gender: 'male', accent: 'American', description: 'Rugged charm with authentic personality' },
      { id: 'mia', name: 'Mia', language: 'en-US', gender: 'female', accent: 'American', description: 'Inviting storyteller who captivates listeners' },
      { id: 'atlas', name: 'Atlas', language: 'en-US', gender: 'male', accent: 'American', description: 'Perfect for announcements and news' },
      { id: 'navya', name: 'Navya', language: 'en-US', gender: 'female', accent: 'American', description: 'Warm, enduring, and professional voice actor' },
      
      // Additional conversational voices
      { id: 'alex', name: 'Alex', language: 'en-US', gender: 'male', accent: 'American', description: 'Friendly and approachable conversational voice' },
      { id: 'sarah', name: 'Sarah', language: 'en-US', gender: 'female', accent: 'American', description: 'Clear and professional female voice' },
      { id: 'david', name: 'David', language: 'en-US', gender: 'male', accent: 'American', description: 'Confident and authoritative voice' },
      { id: 'emma', name: 'Emma', language: 'en-US', gender: 'female', accent: 'American', description: 'Warm and conversational voice' },
      { id: 'james', name: 'James', language: 'en-US', gender: 'male', accent: 'American', description: 'Professional and articulate voice' },
      { id: 'lily', name: 'Lily', language: 'en-US', gender: 'female', accent: 'American', description: 'Sweet and friendly voice' },
      { id: 'michael', name: 'Michael', language: 'en-US', gender: 'male', accent: 'American', description: 'Strong and confident voice' },
      { id: 'sophia', name: 'Sophia', language: 'en-US', gender: 'female', accent: 'American', description: 'Elegant and sophisticated voice' }
    ];
  }

  // Detect gender from voice name
  private detectGender(name: string): 'male' | 'female' | 'neutral' {
    const femaleNames = ['zira', 'hazel', 'susan', 'karen', 'samantha', 'victoria', 'alex', 'catherine'];
    const maleNames = ['david', 'mark', 'richard', 'daniel', 'thomas', 'alex', 'paul', 'steve'];
    
    const lowerName = name.toLowerCase();
    if (femaleNames.some(n => lowerName.includes(n))) return 'female';
    if (maleNames.some(n => lowerName.includes(n))) return 'male';
    return 'neutral';
  }

  // Detect accent from voice name
  private detectAccent(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('british') || lowerName.includes('uk')) return 'British';
    if (lowerName.includes('australian') || lowerName.includes('au')) return 'Australian';
    if (lowerName.includes('canadian') || lowerName.includes('ca')) return 'Canadian';
    if (lowerName.includes('indian') || lowerName.includes('in')) return 'Indian';
    if (lowerName.includes('irish') || lowerName.includes('ie')) return 'Irish';
    if (lowerName.includes('scottish') || lowerName.includes('scotland')) return 'Scottish';
    if (lowerName.includes('welsh') || lowerName.includes('wales')) return 'Welsh';
    return 'American';
  }

  // Get current settings
  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  // Update settings
  updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  // Get all voices for current provider
  getVoices(): VoiceOption[] {
    const provider = this.getProviders().find(p => p.id === this.settings.provider);
    if (!provider) return [];

    const voices = [...provider.voices];
    if (this.settings.provider === 'browser') {
      voices.push(...this.getBrowserVoices());
    }
    voices.push(...this.customVoices);
    
    return voices;
  }

  // Add custom voice
  addCustomVoice(voice: VoiceOption, audioFile: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const customVoice = {
          ...voice,
          id: `custom_${Date.now()}`,
          isCustom: true,
          previewUrl: reader.result as string
        };
        this.customVoices.push(customVoice);
        this.saveCustomVoices();
        resolve();
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioFile);
    });
  }

  // Remove custom voice
  removeCustomVoice(voiceId: string) {
    this.customVoices = this.customVoices.filter(v => v.id !== voiceId);
    this.saveCustomVoices();
  }

  // Speak text using current settings
  async speak(text: string): Promise<void> {
    switch (this.settings.provider) {
      case 'browser':
        return this.speakBrowser(text);
      case 'unreal-speech':
        return this.speakUnrealSpeech(text);
      case 'azure':
        return this.speakAzure(text);
      case 'openai':
        return this.speakOpenAI(text);
      default:
        throw new Error(`Unsupported voice provider: ${this.settings.provider}`);
    }
  }

  // Browser speech synthesis
  private speakBrowser(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.settings.rate;
      utterance.pitch = this.settings.pitch;
      utterance.volume = this.settings.volume;

      if (this.settings.voice) {
        const voice = window.speechSynthesis.getVoices().find(v => v.name === this.settings.voice);
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);
      
      window.speechSynthesis.speak(utterance);
    });
  }

  // Unreal Speech synthesis
  private async speakUnrealSpeech(text: string): Promise<void> {
    if (!this.settings.apiKey) {
      throw new Error('Unreal Speech API key not configured');
    }

    const response = await fetch('https://api.v8.unrealspeech.com/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Text: text,
        VoiceId: this.settings.voice,
        Bitrate: '192k',
        Speed: this.settings.rate.toString(),
        Pitch: this.settings.pitch.toString(),
        Codec: 'libmp3lame'
      })
    });

    if (!response.ok) {
      throw new Error(`Unreal Speech API error: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = reject;
      audio.play();
    });
  }

  // Azure Speech synthesis
  private async speakAzure(text: string): Promise<void> {
    if (!this.settings.apiKey) {
      throw new Error('Azure Speech API key not configured');
    }

    const response = await fetch(`https://${this.settings.model || 'eastus'}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.settings.apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
      },
      body: `<speak version='1.0' xml:lang='en-US'>
        <voice xml:lang='en-US' name='${this.settings.voice}'>
          <prosody rate='${this.settings.rate}' pitch='${this.settings.pitch}%' volume='${this.settings.volume}'>
            ${text}
          </prosody>
        </voice>
      </speak>`
    });

    if (!response.ok) {
      throw new Error(`Azure Speech API error: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = reject;
      audio.play();
    });
  }

  // OpenAI TTS synthesis
  private async speakOpenAI(text: string): Promise<void> {
    if (!this.settings.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.settings.model || 'tts-1',
        input: text,
        voice: this.settings.voice,
        speed: this.settings.rate
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = reject;
      audio.play();
    });
  }
}

export const voiceService = new VoiceService();
