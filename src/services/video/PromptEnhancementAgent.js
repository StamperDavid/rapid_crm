const path = require('path');

class PromptEnhancementAgent {
  constructor() {
    this.cinemaQualityStandards = {
      requiredElements: ['characters', 'setting', 'mood', 'duration', 'resolution', 'visual_style'],
      optionalElements: ['lighting', 'camera_angles', 'special_effects', 'audio', 'transitions'],
      qualityLevels: {
        'basic': { resolution: '720p', duration: '15-30s', complexity: 'low' },
        'standard': { resolution: '1080p', duration: '30-60s', complexity: 'medium' },
        'premium': { resolution: '4K', duration: '60-120s', complexity: 'high' },
        'cinema': { resolution: '8K', duration: '120-300s', complexity: 'maximum' }
      }
    };
    
    this.userPreferences = new Map();
    this.successfulPrompts = [];
  }

  /**
   * Analyze a user prompt and determine what's missing
   */
  analyzePrompt(prompt) {
    const analysis = {
      originalPrompt: prompt,
      completeness: 0,
      missingElements: [],
      detectedElements: {},
      enhancementNeeded: false,
      suggestedQuality: 'standard'
    };

    // Detect existing elements
    analysis.detectedElements = this.detectPromptElements(prompt);
    
    // Check completeness
    const detectedCount = Object.keys(analysis.detectedElements).length;
    const requiredCount = this.cinemaQualityStandards.requiredElements.length;
    analysis.completeness = (detectedCount / requiredCount) * 100;
    
    // Find missing elements
    analysis.missingElements = this.findMissingElements(analysis.detectedElements);
    
    // Determine if enhancement is needed
    analysis.enhancementNeeded = analysis.completeness < 70 || analysis.missingElements.length >= 3;
    
    // Suggest quality level based on prompt complexity
    analysis.suggestedQuality = this.suggestQualityLevel(prompt, analysis.detectedElements);
    
    return analysis;
  }

  /**
   * Detect elements present in the prompt
   */
  detectPromptElements(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    const elements = {};

    // Character detection
    if (lowerPrompt.includes('character') || lowerPrompt.includes('person') || 
        lowerPrompt.includes('driver') || lowerPrompt.includes('actor') ||
        lowerPrompt.includes('man') || lowerPrompt.includes('woman') ||
        lowerPrompt.includes('people') || lowerPrompt.includes('individual')) {
      elements.characters = this.extractCharacterDetails(prompt);
    }

    // Setting detection
    if (lowerPrompt.includes('setting') || lowerPrompt.includes('location') ||
        lowerPrompt.includes('place') || lowerPrompt.includes('environment') ||
        lowerPrompt.includes('diner') || lowerPrompt.includes('office') ||
        lowerPrompt.includes('truck') || lowerPrompt.includes('road')) {
      elements.setting = this.extractSettingDetails(prompt);
    }

    // Mood detection
    const moodKeywords = {
      'professional': ['professional', 'business', 'corporate', 'formal'],
      'dramatic': ['dramatic', 'intense', 'emotional', 'serious'],
      'upbeat': ['upbeat', 'positive', 'energetic', 'happy'],
      'educational': ['educational', 'informative', 'training', 'learning'],
      'frustrated': ['frustrated', 'defeated', 'struggling', 'confused'],
      'relief': ['relief', 'solution', 'help', 'resolved']
    };
    
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        elements.mood = mood;
        break;
      }
    }

    // Duration detection
    const durationMatch = prompt.match(/(\d+)\s*(second|minute|sec|min)/i);
    if (durationMatch) {
      elements.duration = `${durationMatch[1]} ${durationMatch[2]}s`;
    }

    // Resolution detection
    const resolutionMatch = prompt.match(/(\d+p|4k|8k)/i);
    if (resolutionMatch) {
      elements.resolution = resolutionMatch[1].toUpperCase();
    }

    // Visual style detection
    const styleKeywords = {
      'cinematic': ['cinematic', 'movie', 'film', 'cinema'],
      'documentary': ['documentary', 'realistic', 'authentic'],
      'commercial': ['commercial', 'marketing', 'advertisement'],
      'animated': ['animated', 'cartoon', 'illustration'],
      'realistic': ['realistic', 'real', 'lifelike']
    };
    
    for (const [style, keywords] of Object.entries(styleKeywords)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        elements.visual_style = style;
        break;
      }
    }

    // Lighting detection
    if (lowerPrompt.includes('lighting') || lowerPrompt.includes('light') ||
        lowerPrompt.includes('bright') || lowerPrompt.includes('dark') ||
        lowerPrompt.includes('sunset') || lowerPrompt.includes('sunrise')) {
      elements.lighting = this.extractLightingDetails(prompt);
    }

    // Camera angles detection
    if (lowerPrompt.includes('camera') || lowerPrompt.includes('angle') ||
        lowerPrompt.includes('shot') || lowerPrompt.includes('close-up') ||
        lowerPrompt.includes('wide') || lowerPrompt.includes('medium')) {
      elements.camera_angles = this.extractCameraDetails(prompt);
    }

    return elements;
  }

  /**
   * Extract character details from prompt
   */
  extractCharacterDetails(prompt) {
    const details = [];
    const lowerPrompt = prompt.toLowerCase();
    
    // Count characters
    const characterCount = (prompt.match(/(\d+)\s*(character|person|driver|actor)/gi) || []).length;
    if (characterCount > 0) {
      details.push(`${characterCount} characters`);
    }
    
    // Character descriptions
    if (lowerPrompt.includes('young')) details.push('young character');
    if (lowerPrompt.includes('old') || lowerPrompt.includes('older')) details.push('older character');
    if (lowerPrompt.includes('professional')) details.push('professional appearance');
    if (lowerPrompt.includes('frustrated')) details.push('frustrated expression');
    if (lowerPrompt.includes('clean') || lowerPrompt.includes('well groomed')) details.push('well-groomed');
    
    return details.join(', ');
  }

  /**
   * Extract setting details from prompt
   */
  extractSettingDetails(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    const settings = [];
    
    if (lowerPrompt.includes('truck stop')) settings.push('truck stop');
    if (lowerPrompt.includes('diner')) settings.push('diner');
    if (lowerPrompt.includes('table')) settings.push('table setting');
    if (lowerPrompt.includes('office')) settings.push('office environment');
    if (lowerPrompt.includes('road')) settings.push('road setting');
    
    return settings.join(', ');
  }

  /**
   * Extract lighting details from prompt
   */
  extractLightingDetails(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    const lighting = [];
    
    if (lowerPrompt.includes('well lit')) lighting.push('well-lit');
    if (lowerPrompt.includes('sunset')) lighting.push('sunset lighting');
    if (lowerPrompt.includes('dramatic')) lighting.push('dramatic lighting');
    if (lowerPrompt.includes('bright')) lighting.push('bright lighting');
    if (lowerPrompt.includes('warm')) lighting.push('warm lighting');
    
    return lighting.join(', ');
  }

  /**
   * Extract camera details from prompt
   */
  extractCameraDetails(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    const camera = [];
    
    if (lowerPrompt.includes('close-up')) camera.push('close-up shots');
    if (lowerPrompt.includes('wide')) camera.push('wide shots');
    if (lowerPrompt.includes('medium')) camera.push('medium shots');
    if (lowerPrompt.includes('multiple')) camera.push('multiple angles');
    if (lowerPrompt.includes('smooth')) camera.push('smooth movements');
    
    return camera.join(', ');
  }

  /**
   * Find missing elements for cinema-quality video
   */
  findMissingElements(detectedElements) {
    const missing = [];
    
    if (!detectedElements.characters) {
      missing.push({
        category: 'Characters',
        question: 'What characters should be in the video? (age, appearance, number of people)',
        importance: 'high'
      });
    }
    
    if (!detectedElements.setting) {
      missing.push({
        category: 'Setting',
        question: 'Where does this take place? (location, environment, specific place)',
        importance: 'high'
      });
    }
    
    if (!detectedElements.mood) {
      missing.push({
        category: 'Mood/Tone',
        question: 'What mood or tone should the video have? (professional, dramatic, upbeat, educational)',
        importance: 'high'
      });
    }
    
    if (!detectedElements.duration) {
      missing.push({
        category: 'Duration',
        question: 'How long should the video be? (15-30s for social media, 30-60s for marketing, 60-120s for detailed content)',
        importance: 'medium'
      });
    }
    
    if (!detectedElements.resolution) {
      missing.push({
        category: 'Resolution',
        question: 'What resolution do you need? (1080p standard, 4K premium, 8K cinema)',
        importance: 'medium'
      });
    }
    
    if (!detectedElements.visual_style) {
      missing.push({
        category: 'Visual Style',
        question: 'What visual style do you want? (cinematic, documentary, commercial, animated, realistic)',
        importance: 'high'
      });
    }
    
    return missing;
  }

  /**
   * Suggest quality level based on prompt analysis
   */
  suggestQualityLevel(prompt, detectedElements) {
    const lowerPrompt = prompt.toLowerCase();
    
    // High complexity indicators
    const highComplexity = lowerPrompt.includes('cinematic') || 
                          lowerPrompt.includes('multiple') ||
                          lowerPrompt.includes('detailed') ||
                          lowerPrompt.includes('professional') ||
                          detectedElements.camera_angles ||
                          detectedElements.lighting;
    
    // Length indicators
    const isLongPrompt = prompt.length > 200;
    
    if (highComplexity && isLongPrompt) {
      return 'cinema';
    } else if (highComplexity || isLongPrompt) {
      return 'premium';
    } else if (detectedElements.characters && detectedElements.setting) {
      return 'standard';
    } else {
      return 'basic';
    }
  }

  /**
   * Generate intelligent clarifying questions
   */
  generateClarifyingQuestions(analysis) {
    if (!analysis.enhancementNeeded) {
      return null;
    }

    const questions = [];
    const highPriority = analysis.missingElements.filter(el => el.importance === 'high');
    const mediumPriority = analysis.missingElements.filter(el => el.importance === 'medium');

    // Ask high priority questions first
    highPriority.slice(0, 2).forEach(element => {
      questions.push({
        category: element.category,
        question: element.question,
        priority: 'high'
      });
    });

    // Ask medium priority questions if needed
    if (questions.length < 3 && mediumPriority.length > 0) {
      mediumPriority.slice(0, 1).forEach(element => {
        questions.push({
          category: element.category,
          question: element.question,
          priority: 'medium'
        });
      });
    }

    return questions;
  }

  /**
   * Enhance a prompt with additional details
   */
  enhancePrompt(originalPrompt, userResponses = {}) {
    const analysis = this.analyzePrompt(originalPrompt);
    const enhanced = { ...analysis.detectedElements, ...userResponses };
    
    // Generate enhanced prompt
    let enhancedPrompt = `Cinema-quality video: ${originalPrompt}\n\n`;
    enhancedPrompt += `**Enhanced Specifications:**\n`;
    
    if (enhanced.characters) enhancedPrompt += `• Characters: ${enhanced.characters}\n`;
    if (enhanced.setting) enhancedPrompt += `• Setting: ${enhanced.setting}\n`;
    if (enhanced.mood) enhancedPrompt += `• Mood: ${enhanced.mood}\n`;
    if (enhanced.duration) enhancedPrompt += `• Duration: ${enhanced.duration}\n`;
    if (enhanced.resolution) enhancedPrompt += `• Resolution: ${enhanced.resolution}\n`;
    if (enhanced.visual_style) enhancedPrompt += `• Style: ${enhanced.visual_style}\n`;
    if (enhanced.lighting) enhancedPrompt += `• Lighting: ${enhanced.lighting}\n`;
    if (enhanced.camera_angles) enhancedPrompt += `• Camera: ${enhanced.camera_angles}\n`;
    
    enhancedPrompt += `\n**Quality Level:** ${analysis.suggestedQuality}`;
    
    return {
      enhancedPrompt,
      specifications: enhanced,
      qualityLevel: analysis.suggestedQuality,
      confidence: analysis.completeness
    };
  }

  /**
   * Learn from successful video prompts
   */
  learnFromSuccess(originalPrompt, enhancedPrompt, videoQuality) {
    this.successfulPrompts.push({
      original: originalPrompt,
      enhanced: enhancedPrompt,
      quality: videoQuality,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 successful prompts
    if (this.successfulPrompts.length > 100) {
      this.successfulPrompts = this.successfulPrompts.slice(-100);
    }
  }

  /**
   * Get user preferences based on past interactions
   */
  getUserPreferences(userId) {
    return this.userPreferences.get(userId) || {
      preferredQuality: 'standard',
      preferredStyle: 'cinematic',
      preferredDuration: '30-60s',
      preferredResolution: '1080p'
    };
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(userId, preferences) {
    const current = this.getUserPreferences(userId);
    this.userPreferences.set(userId, { ...current, ...preferences });
  }
}

module.exports = PromptEnhancementAgent;

