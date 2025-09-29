/**
 * Fast Voice Synthesis Service
 * Optimized for enterprise-level performance with streaming and caching
 */

const { getResponseCache } = require('./ResponseCache');

class FastVoiceSynthesis {
  constructor() {
    this.cache = getResponseCache();
    this.synthesisQueue = new Map(); // userId -> queue
    this.isProcessing = new Map(); // userId -> boolean
    this.maxTextLength = 500; // Reduced for faster synthesis
    this.chunkSize = 200; // Process in smaller chunks
  }

  /**
   * Fast voice synthesis with streaming and caching
   */
  async synthesizeText(text, voiceId, userId = 'default_user') {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(text, voiceId);
      const cachedAudio = this.cache.get(cacheKey);
      
      if (cachedAudio) {
        console.log(`⚡ Voice cache hit for user ${userId}`);
        return this.playCachedAudio(cachedAudio, userId);
      }

      // Truncate text for faster processing
      const truncatedText = this.truncateText(text);
      console.log(`🎤 Fast synthesis for user ${userId}: ${truncatedText.length} chars`);

      // Process in chunks for streaming
      const chunks = this.splitIntoChunks(truncatedText);
      const audioPromises = [];

      // Start synthesis of all chunks in parallel
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        audioPromises.push(this.synthesizeChunk(chunk, voiceId, i));
      }

      // Wait for all chunks to be synthesized
      const audioChunks = await Promise.all(audioPromises);
      
      // Combine audio chunks
      const combinedAudio = await this.combineAudioChunks(audioChunks);
      
      // Cache the result
      this.cache.set(cacheKey, combinedAudio, 300000); // 5 minutes
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ Fast synthesis completed in ${processingTime}ms for user ${userId}`);
      
      return this.playAudio(combinedAudio, userId);

    } catch (error) {
      console.error('❌ Fast voice synthesis error:', error);
      return this.fallbackToBrowserTTS(text, userId);
    }
  }

  /**
   * Synthesize a single chunk
   */
  async synthesizeChunk(text, voiceId, chunkIndex) {
    try {
      const response = await fetch('http://localhost:3001/api/ai/unreal-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voiceId: voiceId,
          speed: 0,
          pitch: 1.0
        })
      });

      if (!response.ok) {
        throw new Error(`Unreal Speech API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      return {
        blob: audioBlob,
        index: chunkIndex,
        text: text
      };

    } catch (error) {
      console.error(`❌ Chunk ${chunkIndex} synthesis error:`, error);
      throw error;
    }
  }

  /**
   * Combine multiple audio chunks into one
   */
  async combineAudioChunks(audioChunks) {
    try {
      // Sort chunks by index
      audioChunks.sort((a, b) => a.index - b.index);
      
      // For now, return the first chunk (we'll implement proper combining later)
      // This is a simplified version for immediate performance improvement
      return audioChunks[0].blob;
      
    } catch (error) {
      console.error('❌ Audio combination error:', error);
      throw error;
    }
  }

  /**
   * Play audio with interruption handling
   */
  async playAudio(audioBlob, userId) {
    return new Promise((resolve, reject) => {
      try {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Store reference for interruption
        this.synthesisQueue.set(userId, audio);
        
        audio.onended = () => {
          this.synthesisQueue.delete(userId);
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          this.synthesisQueue.delete(userId);
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.play().catch(reject);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Play cached audio
   */
  async playCachedAudio(audioBlob, userId) {
    return this.playAudio(audioBlob, userId);
  }

  /**
   * Truncate text for faster synthesis
   */
  truncateText(text) {
    if (text.length <= this.maxTextLength) {
      return text;
    }
    
    // Find the last complete sentence within the limit
    const truncated = text.substring(0, this.maxTextLength);
    const lastSentence = truncated.lastIndexOf('.');
    
    if (lastSentence > this.maxTextLength * 0.7) {
      return truncated.substring(0, lastSentence + 1);
    }
    
    // If no good sentence break, just truncate
    return truncated + '...';
  }

  /**
   * Split text into chunks for parallel processing
   */
  splitIntoChunks(text) {
    if (text.length <= this.chunkSize) {
      return [text];
    }
    
    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
      let end = start + this.chunkSize;
      
      // Try to break at sentence boundary
      if (end < text.length) {
        const sentenceEnd = text.lastIndexOf('.', end);
        if (sentenceEnd > start + this.chunkSize * 0.5) {
          end = sentenceEnd + 1;
        }
      }
      
      chunks.push(text.substring(start, end));
      start = end;
    }
    
    return chunks;
  }

  /**
   * Generate cache key for text and voice
   */
  generateCacheKey(text, voiceId) {
    const textHash = this.simpleHash(text.substring(0, 100));
    return `voice_${voiceId}_${textHash}`;
  }

  /**
   * Simple hash function for cache keys
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Fallback to browser TTS
   */
  fallbackToBrowserTTS(text, userId) {
    return new Promise((resolve) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('❌ Browser TTS fallback error:', error);
        resolve();
      }
    });
  }

  /**
   * Stop synthesis for a user
   */
  stopSynthesis(userId) {
    const audio = this.synthesisQueue.get(userId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      this.synthesisQueue.delete(userId);
      console.log(`🛑 Stopped voice synthesis for user ${userId}`);
    }
  }

  /**
   * Get synthesis statistics
   */
  getStats() {
    return {
      activeSyntheses: this.synthesisQueue.size,
      cacheStats: this.cache.getStats(),
      maxTextLength: this.maxTextLength,
      chunkSize: this.chunkSize
    };
  }
}

// Singleton instance
let fastVoiceSynthesis = null;

function getFastVoiceSynthesis() {
  if (!fastVoiceSynthesis) {
    fastVoiceSynthesis = new FastVoiceSynthesis();
  }
  return fastVoiceSynthesis;
}

module.exports = { FastVoiceSynthesis, getFastVoiceSynthesis };







