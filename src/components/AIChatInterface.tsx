import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/outline';
import { voiceService } from '../services/voice/VoiceService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  audioUrl?: string;
  voiceId?: string;
}

interface Voice {
  id: string;
  name: string;
  description: string;
  gender: string;
}

const AIChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('mikael');
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/ai/voices');
        const data = await response.json();
        if (data.success) {
          setAvailableVoices(data.voices);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
      }
    };
    loadVoices();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    // Update the voice service settings
    const currentSettings = voiceService.getSettings();
    voiceService.updateSettings({
      ...currentSettings,
      voice: voiceId,
      provider: 'playht'
    });
  };

  const handleVoicePreview = async () => {
    if (isPreviewing || !selectedVoice) return;
    
    setIsPreviewing(true);
    try {
      // Fetch PlayHT API key from server
      const keyResponse = await fetch('http://localhost:3001/api/ai/voice-key');
      const keyData = await keyResponse.json();
      
      if (!keyData.hasKey) {
        console.error('PlayHT API key not found');
        return;
      }
      
      // Update voice service settings
      voiceService.updateSettings({
        provider: 'playht',
        voice: selectedVoice,
        apiKey: keyData.apiKey
      });
      
      const previewText = `Hey David, this is the ${availableVoices.find(v => v.id === selectedVoice)?.name || selectedVoice} voice. How does this sound?`;
      await voiceService.speak(previewText);
    } catch (error) {
      console.error('Voice preview error:', error);
    } finally {
      setIsPreviewing(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to AI
      const response = await fetch('http://localhost:3001/api/ai/collaborate/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_ai: 'Claude_AI',
          to_ai: 'RapidCRM_AI',
          message_type: 'text',
          content: inputMessage,
          metadata: {
            voiceId: selectedVoice,
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      
      if (data.success && data.ai_response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.ai_response.content || data.ai_response,
          sender: 'ai',
          timestamp: new Date(),
          audioUrl: data.ai_response.audio_url,
          voiceId: data.ai_response.voice_id
        };
        setMessages(prev => [...prev, aiMessage]);
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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header with Voice Selection */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rapid CRM AI</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your transportation industry partner</p>
          </div>
        </div>
        
        {/* Voice Selection */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Voice:</label>
            <select
              value={selectedVoice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {availableVoices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleVoicePreview}
            disabled={isPreviewing}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            title="Preview Voice"
          >
            <span className={`h-5 w-5 ${isPreviewing ? 'animate-pulse' : ''}`}>🔊</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold">AI</span>
            </div>
            <p className="text-lg font-medium">Hey David! I'm your Rapid CRM AI partner.</p>
            <p className="text-sm mt-2">I'm here to help you with transportation compliance, CRM systems, and project management.</p>
            <p className="text-sm mt-1">What would you like to work on today?</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Audio playback for AI responses */}
                {message.audioUrl && (
                  <div className="mt-2">
                    <audio 
                      controls 
                      className="w-full"
                      src={message.audioUrl}
                    >
                      Your browser does not support the audio element.
                    </audio>
                    {message.voiceId && (
                      <div className="text-xs opacity-75 mt-1">
                        Voice: {message.voiceId}
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-xs opacity-75 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg">
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              rows={2}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;
