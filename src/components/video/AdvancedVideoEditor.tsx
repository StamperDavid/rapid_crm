import React, { useState, useEffect, useRef } from 'react';
import {
  PlayIcon, PauseIcon, StopIcon, PlusIcon, TrashIcon, 
  ScissorsIcon, VolumeUpIcon, VolumeOffIcon, CogIcon,
  FilmIcon, PhotographIcon, MusicNoteIcon, SparklesIcon,
  ArrowLeftIcon, ArrowRightIcon, ClockIcon, EyeIcon
} from '@heroicons/react/outline';

interface VideoTrack {
  id: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  name: string;
  startTime: number;
  duration: number;
  endTime: number;
  content: any;
  visible: boolean;
  locked: boolean;
}

interface VideoProject {
  id: string;
  name: string;
  duration: number;
  resolution: string;
  fps: number;
  tracks: VideoTrack[];
  currentTime: number;
  isPlaying: boolean;
}

interface AdvancedVideoEditorProps {
  project: VideoProject;
  onProjectUpdate: (project: VideoProject) => void;
  onClose: () => void;
}

const AdvancedVideoEditor: React.FC<AdvancedVideoEditorProps> = ({
  project,
  onProjectUpdate,
  onClose
}) => {
  const [currentProject, setCurrentProject] = useState<VideoProject>(project);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showEffects, setShowEffects] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [showCharacters, setShowCharacters] = useState(false);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);

  const tracks = [
    { id: 'video1', name: 'Video Track 1', type: 'video' as const, color: 'bg-blue-500' },
    { id: 'video2', name: 'Video Track 2', type: 'video' as const, color: 'bg-blue-400' },
    { id: 'audio1', name: 'Audio Track 1', type: 'audio' as const, color: 'bg-green-500' },
    { id: 'audio2', name: 'Audio Track 2', type: 'audio' as const, color: 'bg-green-400' },
    { id: 'text1', name: 'Text Track 1', type: 'text' as const, color: 'bg-purple-500' },
    { id: 'effects1', name: 'Effects Track 1', type: 'effect' as const, color: 'bg-orange-500' }
  ];

  const effects = [
    { id: 'fade-in', name: 'Fade In', type: 'transition', icon: SparklesIcon },
    { id: 'fade-out', name: 'Fade Out', type: 'transition', icon: SparklesIcon },
    { id: 'zoom-in', name: 'Zoom In', type: 'motion', icon: SparklesIcon },
    { id: 'zoom-out', name: 'Zoom Out', type: 'motion', icon: SparklesIcon },
    { id: 'slide-left', name: 'Slide Left', type: 'transition', icon: ArrowLeftIcon },
    { id: 'slide-right', name: 'Slide Right', type: 'transition', icon: ArrowRightIcon },
    { id: 'blur', name: 'Blur', type: 'filter', icon: EyeIcon },
    { id: 'brightness', name: 'Brightness', type: 'filter', icon: SparklesIcon }
  ];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setCurrentProject(prev => ({ ...prev, isPlaying: !isPlaying }));
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentProject(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
    setCurrentProject(prev => ({ ...prev, currentTime: time }));
  };

  const addTrack = (type: 'video' | 'audio' | 'text' | 'effect') => {
    const newTrack: VideoTrack = {
      id: `${type}_${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Track ${currentProject.tracks.filter(t => t.type === type).length + 1}`,
      startTime: currentTime,
      duration: 5,
      endTime: currentTime + 5,
      content: {},
      visible: true,
      locked: false
    };

    setCurrentProject(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack]
    }));
  };

  const deleteTrack = (trackId: string) => {
    setCurrentProject(prev => ({
      ...prev,
      tracks: prev.tracks.filter(t => t.id !== trackId)
    }));
  };

  const addEffect = (effectId: string) => {
    const effect = effects.find(e => e.id === effectId);
    if (!effect) return;

    const newTrack: VideoTrack = {
      id: `effect_${Date.now()}`,
      type: 'effect',
      name: effect.name,
      startTime: currentTime,
      duration: 2,
      endTime: currentTime + 2,
      content: { effectId, effectType: effect.type },
      visible: true,
      locked: false
    };

    setCurrentProject(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack]
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * currentProject.fps);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const getTrackIcon = (type: string) => {
    switch (type) {
      case 'video': return FilmIcon;
      case 'audio': return VolumeUpIcon;
      case 'text': return PhotographIcon;
      case 'effect': return SparklesIcon;
      default: return FilmIcon;
    }
  };

  const getTrackColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-500';
      case 'audio': return 'bg-green-500';
      case 'text': return 'bg-purple-500';
      case 'effect': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  useEffect(() => {
    onProjectUpdate(currentProject);
  }, [currentProject, onProjectUpdate]);

  return (
    <div className="fixed inset-0 bg-gray-900 text-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">{currentProject.name}</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <span>{currentProject.resolution}</span>
            <span>•</span>
            <span>{currentProject.fps} FPS</span>
            <span>•</span>
            <span>{formatTime(currentProject.duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAssets(!showAssets)}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm"
          >
            Assets
          </button>
          <button
            onClick={() => setShowCharacters(!showCharacters)}
            className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg text-sm"
          >
            Characters
          </button>
          <button
            onClick={() => setShowEffects(!showEffects)}
            className="bg-orange-600 hover:bg-orange-700 px-3 py-2 rounded-lg text-sm"
          >
            Effects
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Assets & Tools */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Tools */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addTrack('video')}
                className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg flex flex-col items-center space-y-1"
              >
                <FilmIcon className="h-6 w-6" />
                <span className="text-xs">Video</span>
              </button>
              <button
                onClick={() => addTrack('audio')}
                className="bg-green-600 hover:bg-green-700 p-3 rounded-lg flex flex-col items-center space-y-1"
              >
                <VolumeUpIcon className="h-6 w-6" />
                <span className="text-xs">Audio</span>
              </button>
              <button
                onClick={() => addTrack('text')}
                className="bg-purple-600 hover:bg-purple-700 p-3 rounded-lg flex flex-col items-center space-y-1"
              >
                <PhotographIcon className="h-6 w-6" />
                <span className="text-xs">Text</span>
              </button>
              <button
                onClick={() => addTrack('effect')}
                className="bg-orange-600 hover:bg-orange-700 p-3 rounded-lg flex flex-col items-center space-y-1"
              >
                <SparklesIcon className="h-6 w-6" />
                <span className="text-xs">Effect</span>
              </button>
            </div>
          </div>

          {/* Effects Panel */}
          {showEffects && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Effects</h3>
              <div className="space-y-2">
                {effects.map(effect => {
                  const Icon = effect.icon;
                  return (
                    <button
                      key={effect.id}
                      onClick={() => addEffect(effect.id)}
                      className="w-full bg-gray-700 hover:bg-gray-600 p-2 rounded-lg flex items-center space-x-2"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{effect.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assets Panel */}
          {showAssets && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Assets</h3>
              <div className="space-y-2">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Video Clips</h4>
                  <div className="space-y-1">
                    <div className="bg-gray-600 p-2 rounded text-xs">Sample Video 1</div>
                    <div className="bg-gray-600 p-2 rounded text-xs">Sample Video 2</div>
                  </div>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Audio Files</h4>
                  <div className="space-y-1">
                    <div className="bg-gray-600 p-2 rounded text-xs">Background Music</div>
                    <div className="bg-gray-600 p-2 rounded text-xs">Sound Effect</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Characters Panel */}
          {showCharacters && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Characters</h3>
              <div className="space-y-2">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="w-16 h-16 bg-gray-600 rounded-lg mb-2"></div>
                  <h4 className="text-sm font-medium">Character 1</h4>
                  <p className="text-xs text-gray-400">Professional</p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="w-16 h-16 bg-gray-600 rounded-lg mb-2"></div>
                  <h4 className="text-sm font-medium">Character 2</h4>
                  <p className="text-xs text-gray-400">Casual</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Preview Area */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <FilmIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Video Preview</p>
                <p className="text-sm text-gray-500 mt-2">
                  Current Time: {formatTime(currentTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 p-4 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleStop}
                className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg"
              >
                <StopIcon className="h-6 w-6" />
              </button>
              <button
                onClick={handlePlayPause}
                className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg"
              >
                {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={currentProject.duration}
                  value={currentTime}
                  onChange={(e) => handleTimeChange(parseFloat(e.target.value))}
                  className="w-64"
                />
                <span className="text-sm">{formatTime(currentProject.duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Zoom:</span>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-sm">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            {/* Time Ruler */}
            <div className="h-8 bg-gray-700 rounded mb-2 flex items-center px-2">
              {Array.from({ length: Math.ceil(currentProject.duration / 10) }, (_, i) => (
                <div key={i} className="text-xs text-gray-300">
                  {formatTime(i * 10)}
                </div>
              ))}
            </div>

            {/* Tracks */}
            <div className="space-y-2">
              {tracks.map(track => {
                const Icon = getTrackIcon(track.type);
                const trackClips = currentProject.tracks.filter(t => t.type === track.type);
                
                return (
                  <div key={track.id} className="flex items-center space-x-2">
                    <div className="w-32 flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{track.name}</span>
                    </div>
                    <div className="flex-1 h-12 bg-gray-700 rounded relative">
                      {trackClips.map(clip => (
                        <div
                          key={clip.id}
                          className={`absolute h-full ${getTrackColor(clip.type)} rounded cursor-pointer hover:opacity-80`}
                          style={{
                            left: `${(clip.startTime / currentProject.duration) * 100}%`,
                            width: `${(clip.duration / currentProject.duration) * 100}%`
                          }}
                        >
                          <div className="p-2 text-xs truncate">{clip.name}</div>
                        </div>
                      ))}
                    </div>
                    <div className="w-16 flex items-center space-x-1">
                      <button className="text-gray-400 hover:text-white">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-white">
                        <CogIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteTrack(track.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Playhead */}
            <div
              ref={playheadRef}
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
              style={{ left: `${(currentTime / currentProject.duration) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedVideoEditor;
