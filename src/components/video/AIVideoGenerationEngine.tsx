import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  SparklesIcon, 
  FilmIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/outline';

interface VideoGenerationRequest {
  prompt: string;
  style: string;
  duration: number;
  resolution: string;
  quality: string;
  aspectRatio?: string;
  fps?: number;
  negativePrompt?: string;
  seed?: number;
  guidance?: number;
  steps?: number;
}

interface VideoGenerationResult {
  success: boolean;
  videoId?: string;
  project?: any;
  error?: string;
  estimatedTime?: number;
  cost?: number;
}

const AIVideoGenerationEngine: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onVideoGenerated: (result: VideoGenerationResult) => void;
}> = ({ isOpen, onClose, onVideoGenerated }) => {
  // Main prompt
  const [prompt, setPrompt] = useState('');
  
  // Detailed prompt sections
  const [subjectDescription, setSubjectDescription] = useState('');
  const [actions, setActions] = useState('');
  const [lighting, setLighting] = useState('');
  const [cameraAngles, setCameraAngles] = useState('');
  const [mood, setMood] = useState('');
  const [environment, setEnvironment] = useState('');
  const [colors, setColors] = useState('');
  const [movement, setMovement] = useState('');
  const [transitions, setTransitions] = useState('');
  
  // Technical settings
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [duration, setDuration] = useState(30);
  const [resolution, setResolution] = useState('1080p');
  const [quality, setQuality] = useState('standard');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [fps, setFps] = useState(30);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [seed, setSeed] = useState<number | null>(null);
  const [guidance, setGuidance] = useState(7.5);
  const [steps, setSteps] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);

  const videoStyles = [
    {
      id: 'photorealistic',
      name: 'Photorealistic',
      icon: '🎬',
      description: 'Ultra-realistic video with perfect lighting',
      color: 'border-gray-200 hover:border-gray-300'
    },
    {
      id: 'cinematic',
      name: 'Cinematic',
      icon: '🎭',
      description: 'Hollywood-quality production',
      color: 'border-purple-500 bg-purple-50'
    },
    {
      id: 'anime',
      name: 'Anime/Animation',
      icon: '🎨',
      description: 'Animated style with vibrant colors',
      color: 'border-gray-200 hover:border-gray-300'
    },
    {
      id: 'documentary',
      name: 'Documentary',
      description: 'Professional documentary style',
      icon: '📹',
      color: 'border-gray-200 hover:border-gray-300'
    },
    {
      id: 'commercial',
      name: 'Commercial',
      icon: '📺',
      description: 'High-energy commercial style',
      color: 'border-gray-200 hover:border-gray-300'
    },
    {
      id: 'artistic',
      name: 'Artistic',
      icon: '🎨',
      description: 'Creative and experimental',
      color: 'border-gray-200 hover:border-gray-300'
    },
    {
      id: 'vintage',
      name: 'Vintage',
      icon: '📼',
      description: 'Retro and nostalgic style',
      color: 'border-gray-200 hover:border-gray-300'
    },
    {
      id: 'futuristic',
      name: 'Futuristic',
      icon: '🚀',
      description: 'Sci-fi and futuristic aesthetics',
      color: 'border-gray-200 hover:border-gray-300'
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      icon: '⚪',
      description: 'Clean and simple design',
      color: 'border-gray-200 hover:border-gray-300'
    }
  ];

  const qualityOptions = [
    {
      value: 'draft',
      label: 'Draft',
      description: '2-5 min • $0.10',
      time: 2,
      cost: 0.10
    },
    {
      value: 'standard',
      label: 'Standard',
      description: '5-10 min • $0.50',
      time: 7,
      cost: 0.50
    },
    {
      value: 'premium',
      label: 'Premium',
      description: '10-20 min • $1.00',
      time: 15,
      cost: 1.00
    },
    {
      value: 'cinema',
      label: 'Cinema',
      description: '20-60 min • $2.00',
      time: 40,
      cost: 2.00
    }
  ];

  const resolutionOptions = [
    { value: '720p', label: '720p HD' },
    { value: '1080p', label: '1080p Full HD' },
    { value: '4K', label: '4K Ultra HD' },
    { value: '8K', label: '8K Ultra HD' }
  ];

  const aspectRatioOptions = [
    { value: '16:9', label: '16:9 (Widescreen)' },
    { value: '9:16', label: '9:16 (Vertical)' },
    { value: '1:1', label: '1:1 (Square)' },
    { value: '4:3', label: '4:3 (Standard)' },
    { value: '21:9', label: '21:9 (Ultrawide)' }
  ];

  // Calculate estimated time and cost based on settings
  useEffect(() => {
    const selectedQuality = qualityOptions.find(q => q.value === quality);
    if (selectedQuality) {
      setEstimatedTime(selectedQuality.time);
      setEstimatedCost(selectedQuality.cost);
    }
  }, [quality, duration, resolution]);

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      alert('Please enter a main video concept');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Combine all detailed prompts into a comprehensive prompt
    const detailedPrompt = [
      prompt.trim(),
      subjectDescription.trim() && `Subject: ${subjectDescription.trim()}`,
      actions.trim() && `Actions: ${actions.trim()}`,
      lighting.trim() && `Lighting: ${lighting.trim()}`,
      cameraAngles.trim() && `Camera: ${cameraAngles.trim()}`,
      mood.trim() && `Mood: ${mood.trim()}`,
      environment.trim() && `Environment: ${environment.trim()}`,
      colors.trim() && `Colors: ${colors.trim()}`,
      movement.trim() && `Movement: ${movement.trim()}`,
      transitions.trim() && `Effects: ${transitions.trim()}`
    ].filter(Boolean).join('. ');

    const request: VideoGenerationRequest = {
      prompt: detailedPrompt,
      style: selectedStyle,
      duration,
      resolution,
      quality,
      aspectRatio,
      fps,
      negativePrompt: negativePrompt.trim() || undefined,
      seed: seed || undefined,
      guidance,
      steps
    };

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      const response = await fetch('http://localhost:3001/api/video/generate-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();
      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (result.success) {
        onVideoGenerated({
          success: true,
          videoId: result.videoId,
          project: result.project,
          estimatedTime,
          cost: estimatedCost
        });
        // Don't close immediately - let user see the success message
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        onVideoGenerated({
          success: false,
          error: result.error || 'Failed to generate video'
        });
      }
    } catch (error) {
      onVideoGenerated({
        success: false,
        error: 'Network error occurred'
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <SparklesIcon className="h-8 w-8 text-purple-600 mr-3" />
              AI Video Generation Engine
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-8">
            {/* Main Video Concept */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Video Concept
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Brief overview of your video concept... (e.g., 'A professional businesswoman walking through a modern office building')"
              />
            </div>

            {/* Detailed Prompt Sections */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Video Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Subject Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Description
                  </label>
                  <textarea
                    rows={3}
                    value={subjectDescription}
                    onChange={(e) => setSubjectDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe the main subject(s)... (e.g., 'Professional businesswoman, 30s, wearing navy suit, confident posture')"
                  />
                </div>

                {/* Actions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actions & Movement
                  </label>
                  <textarea
                    rows={3}
                    value={actions}
                    onChange={(e) => setActions(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="What actions are happening?... (e.g., 'Walking confidently, checking phone, opening door, sitting at desk')"
                  />
                </div>

                {/* Lighting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lighting
                  </label>
                  <textarea
                    rows={3}
                    value={lighting}
                    onChange={(e) => setLighting(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe the lighting... (e.g., 'Natural daylight from large windows, soft shadows, golden hour lighting')"
                  />
                </div>

                {/* Camera Angles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Camera Angles & Shots
                  </label>
                  <textarea
                    rows={3}
                    value={cameraAngles}
                    onChange={(e) => setCameraAngles(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Camera work... (e.g., 'Wide establishing shot, close-up on face, tracking shot following movement')"
                  />
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood & Atmosphere
                  </label>
                  <textarea
                    rows={3}
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Emotional tone... (e.g., 'Professional, confident, inspiring, modern, sophisticated')"
                  />
                </div>

                {/* Environment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Environment & Setting
                  </label>
                  <textarea
                    rows={3}
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Where is this taking place?... (e.g., 'Modern office building, glass walls, open floor plan, city skyline view')"
                  />
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Palette
                  </label>
                  <textarea
                    rows={3}
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Color scheme... (e.g., 'Navy blue, white, gold accents, warm neutrals, professional palette')"
                  />
                </div>

                {/* Movement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Camera Movement
                  </label>
                  <textarea
                    rows={3}
                    value={movement}
                    onChange={(e) => setMovement(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Camera movement... (e.g., 'Smooth tracking, slow zoom in, steady cam, dolly shot')"
                  />
                </div>

                {/* Transitions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transitions & Effects
                  </label>
                  <textarea
                    rows={3}
                    value={transitions}
                    onChange={(e) => setTransitions(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Visual effects... (e.g., 'Smooth cuts, fade transitions, depth of field, motion blur')"
                  />
                </div>
              </div>
            </div>

            {/* Negative Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Negative Prompt (What to Avoid)
              </label>
              <textarea
                rows={3}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="What you don't want in the video... (e.g., 'blurry, low quality, distorted faces, amateur lighting, shaky camera')"
              />
            </div>

            {/* Video Style Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Video Style</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoStyles.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => handleStyleSelect(style.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedStyle === style.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : style.color
                    }`}
                  >
                    <div className="text-3xl mb-2">{style.icon}</div>
                    <h4 className="font-medium text-gray-900">{style.name}</h4>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {resolutionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality Level
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {qualityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Parameters */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {aspectRatioOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    FPS
                  </label>
                  <select
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value={24}>24 FPS (Cinematic)</option>
                    <option value={30}>30 FPS (Standard)</option>
                    <option value={60}>60 FPS (Smooth)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guidance Scale
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={guidance}
                    onChange={(e) => setGuidance(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">{guidance}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seed (Optional)
                  </label>
                  <input
                    type="number"
                    value={seed || ''}
                    onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : null)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Random"
                  />
                </div>
              </div>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Generating Video...</span>
                  <span className="text-sm text-gray-500">{Math.round(generationProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  This may take {estimatedTime} minutes. Please don't close this window.
                </p>
              </div>
            )}

            {/* Combined Prompt Preview */}
            {prompt.trim() && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Combined Prompt Preview</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {[
                      prompt.trim(),
                      subjectDescription.trim() && `Subject: ${subjectDescription.trim()}`,
                      actions.trim() && `Actions: ${actions.trim()}`,
                      lighting.trim() && `Lighting: ${lighting.trim()}`,
                      cameraAngles.trim() && `Camera: ${cameraAngles.trim()}`,
                      mood.trim() && `Mood: ${mood.trim()}`,
                      environment.trim() && `Environment: ${environment.trim()}`,
                      colors.trim() && `Colors: ${colors.trim()}`,
                      movement.trim() && `Movement: ${movement.trim()}`,
                      transitions.trim() && `Effects: ${transitions.trim()}`
                    ].filter(Boolean).join('. ')}
                  </p>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="text-center pt-6 border-t border-gray-200">
              <button
                onClick={handleGenerateVideo}
                disabled={isGenerating || !prompt.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center space-x-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span className="text-lg font-medium">Generating...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-6 w-6" />
                    <span className="text-lg font-medium">Generate AI Video</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center space-x-6 mt-3 text-sm text-gray-500">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>Est. time: {estimatedTime} min</span>
                </div>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                  <span>Cost: ${estimatedCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIVideoGenerationEngine;