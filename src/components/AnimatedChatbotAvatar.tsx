import React, { useState, useEffect, useRef } from 'react';
import { 
  MicrophoneIcon, 
  SpeakerphoneIcon, 
  PlayIcon, 
  PauseIcon,
  ChatIcon 
} from '@heroicons/react/outline';

interface ChatbotAvatarProps {
  name: string;
  appearance: {
    skinColor: string;
    hairColor: string;
    eyeColor: string;
    clothingColor: string;
    gender: 'male' | 'female' | 'neutral';
  };
  voice: {
    enabled: boolean;
    voiceType: string;
    speed: number;
    pitch: number;
  };
  animations: {
    idle: boolean;
    talking: boolean;
    listening: boolean;
    thinking: boolean;
  };
  onVoiceToggle?: () => void;
  onStartListening?: () => void;
  onStopListening?: () => void;
  isListening?: boolean;
  isSpeaking?: boolean;
  message?: string;
}

const AnimatedChatbotAvatar: React.FC<ChatbotAvatarProps> = ({
  name,
  appearance,
  voice,
  animations,
  onVoiceToggle,
  onStartListening,
  onStopListening,
  isListening = false,
  isSpeaking = false,
  message = '',
}) => {
  const [currentAnimation, setCurrentAnimation] = useState<'idle' | 'talking' | 'listening' | 'thinking'>('idle');
  const [eyeBlink, setEyeBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const speechSynthesis = useRef<SpeechSynthesisUtterance | null>(null);

  // Eye blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Animation state management
  useEffect(() => {
    if (isSpeaking) {
      setCurrentAnimation('talking');
    } else if (isListening) {
      setCurrentAnimation('listening');
    } else {
      setCurrentAnimation('idle');
    }
  }, [isSpeaking, isListening]);

  // Mouth animation for talking
  useEffect(() => {
    if (currentAnimation === 'talking') {
      const talkInterval = setInterval(() => {
        setMouthOpen(prev => !prev);
      }, 200 + Math.random() * 100);
      return () => clearInterval(talkInterval);
    } else {
      setMouthOpen(false);
    }
  }, [currentAnimation]);

  // Speech synthesis
  const speak = (text: string) => {
    if (!voice.enabled || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voice.speed;
    utterance.pitch = voice.pitch;
    
    // Try to use a specific voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.toLowerCase().includes(voice.voiceType.toLowerCase())
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setCurrentAnimation('talking');
    };

    utterance.onend = () => {
      setCurrentAnimation('idle');
    };

    speechSynthesis.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Draw avatar on canvas
  const drawAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Face
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = appearance.skinColor;
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hair
    ctx.beginPath();
    ctx.arc(centerX, centerY - radius * 0.3, radius * 0.8, Math.PI, 0);
    ctx.fillStyle = appearance.hairColor;
    ctx.fill();

    // Eyes
    const eyeY = centerY - radius * 0.2;
    const eyeSpacing = radius * 0.3;

    // Left eye
    ctx.beginPath();
    ctx.arc(centerX - eyeSpacing, eyeY, radius * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = appearance.eyeColor;
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.arc(centerX + eyeSpacing, eyeY, radius * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = appearance.eyeColor;
    ctx.fill();

    // Eye blink effect
    if (eyeBlink) {
      ctx.beginPath();
      ctx.moveTo(centerX - eyeSpacing - radius * 0.1, eyeY);
      ctx.lineTo(centerX - eyeSpacing + radius * 0.1, eyeY);
      ctx.moveTo(centerX + eyeSpacing - radius * 0.1, eyeY);
      ctx.lineTo(centerX + eyeSpacing + radius * 0.1, eyeY);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Mouth
    const mouthY = centerY + radius * 0.3;
    if (mouthOpen && currentAnimation === 'talking') {
      // Open mouth for talking
      ctx.beginPath();
      ctx.arc(centerX, mouthY, radius * 0.15, 0, Math.PI);
      ctx.fillStyle = '#333';
      ctx.fill();
    } else {
      // Closed mouth
      ctx.beginPath();
      ctx.arc(centerX, mouthY, radius * 0.1, 0, Math.PI);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Animation indicators
    if (currentAnimation === 'listening') {
      // Listening indicator - pulsing circle
      const pulseRadius = radius * 0.8 + Math.sin(Date.now() * 0.01) * 10;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    if (currentAnimation === 'thinking') {
      // Thinking indicator - floating dots
      const time = Date.now() * 0.005;
      for (let i = 0; i < 3; i++) {
        const dotY = centerY + radius * 0.8 + Math.sin(time + i) * 5;
        ctx.beginPath();
        ctx.arc(centerX + (i - 1) * 10, dotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      }
    }
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      drawAvatar();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [appearance, currentAnimation, eyeBlink, mouthOpen]);

  // Handle voice input
  const handleVoiceInput = () => {
    if (isListening) {
      onStopListening?.();
    } else {
      onStartListening?.();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Avatar Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="border-2 border-gray-200 dark:border-gray-700 rounded-full"
        />
        
        {/* Status indicator */}
        <div className="absolute -top-2 -right-2">
          {currentAnimation === 'talking' && (
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          )}
          {currentAnimation === 'listening' && (
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          )}
          {currentAnimation === 'thinking' && (
            <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Avatar Name */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {name}
      </h3>

      {/* Current Message */}
      {message && (
        <div className="max-w-xs p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {message}
          </p>
        </div>
      )}

      {/* Voice Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onVoiceToggle}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            voice.enabled
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          <SpeakerphoneIcon className="h-4 w-4 mr-1" />
          Voice
        </button>

        {voice.enabled && (
          <button
            onClick={handleVoiceInput}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isListening
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            }`}
          >
            <MicrophoneIcon className="h-4 w-4 mr-1" />
            {isListening ? 'Listening...' : 'Listen'}
          </button>
        )}

        <button
          onClick={() => speak("Hello! I'm your onboarding assistant. How can I help you today?")}
          className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-lg text-sm font-medium transition-colors"
        >
          <PlayIcon className="h-4 w-4 mr-1" />
          Test Voice
        </button>
      </div>

      {/* Animation Status */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Status: {currentAnimation.charAt(0).toUpperCase() + currentAnimation.slice(1)}
      </div>
    </div>
  );
};

export default AnimatedChatbotAvatar;
