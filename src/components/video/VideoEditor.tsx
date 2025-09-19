import React, { useState, useRef, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ScissorsIcon,
  PlusIcon,
  TrashIcon,
  VolumeUpIcon,
  VolumeOffIcon,
  CogIcon,
  FilmIcon,
  PhotographIcon,
  SpeakerWaveIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/outline';

interface VideoTrack {
  id: string;
  type: 'video' | 'audio' | 'image' | 'text';
  name: string;
  startTime: number;
  duration: number;
  filePath: string;
  volume?: number;
  opacity?: number;
  effects?: any[];
  position?: { x: number; y: number };
  scale?: number;
  rotation?: number;
}

interface VideoProject {
  id: string;
  name: string;
  duration: number;
  resolution: string;
  aspectRatio: string;
  tracks: VideoTrack[];
}

interface VideoEditorProps {
  project: VideoProject;
  onSave: (project: VideoProject) => void;
  onExport: (project: VideoProject) => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ project, onSave, onExport }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [showEffects, setShowEffects] = useState(false);
  const [showAudio, setShowAudio] = useState(true);
  const [showVideo, setShowVideo] = useState(true);
  const [showText, setShowText] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [tracks, setTracks] = useState<VideoTrack[]>(project.tracks);

  // Timeline configuration
  const timelineWidth = 1200;
  const trackHeight = 60;
  const timeScale = 10; // pixels per second

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStop = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleTimelineClick = (event: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const time = (x / (timelineWidth * zoom)) * project.duration;
      
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(0, Math.min(time, project.duration));
        setCurrentTime(videoRef.current.currentTime);
      }
    }
  };

  const addTrack = (type: VideoTrack['type']) => {
    const newTrack: VideoTrack = {
      id: `track_${Date.now()}`,
      type,
      name: `New ${type} track`,
      startTime: currentTime,
      duration: type === 'video' ? 10 : type === 'audio' ? 30 : 5,
      filePath: '',
      volume: type === 'audio' ? 100 : undefined,
      opacity: type === 'video' || type === 'image' ? 100 : undefined,
      effects: [],
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0
    };

    setTracks([...tracks, newTrack]);
  };

  const deleteTrack = (trackId: string) => {
    setTracks(tracks.filter(track => track.id !== trackId));
    if (selectedTrack === trackId) {
      setSelectedTrack(null);
    }
  };

  const updateTrack = (trackId: string, updates: Partial<VideoTrack>) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, ...updates } : track
    ));
  };

  const getTrackIcon = (type: VideoTrack['type']) => {
    switch (type) {
      case 'video':
        return <FilmIcon className="h-4 w-4" />;
      case 'audio':
        return <SpeakerWaveIcon className="h-4 w-4" />;
      case 'image':
        return <PhotographIcon className="h-4 w-4" />;
      case 'text':
        return <span className="text-xs font-bold">T</span>;
      default:
        return <FilmIcon className="h-4 w-4" />;
    }
  };

  const getTrackColor = (type: VideoTrack['type']) => {
    switch (type) {
      case 'video':
        return 'bg-blue-500';
      case 'audio':
        return 'bg-green-500';
      case 'image':
        return 'bg-purple-500';
      case 'text':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderTimeline = () => {
    const totalWidth = timelineWidth * zoom;
    const timeMarkers = [];
    const markerInterval = project.duration > 60 ? 10 : 5; // seconds between markers

    for (let i = 0; i <= project.duration; i += markerInterval) {
      const x = (i / project.duration) * totalWidth;
      timeMarkers.push(
        <div
          key={i}
          className="absolute top-0 h-full border-l border-gray-300"
          style={{ left: x }}
        >
          <div className="absolute -top-6 left-0 text-xs text-gray-600">
            {formatTime(i)}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
        {/* Time markers */}
        <div className="relative h-8 bg-gray-200 border-b border-gray-300">
          {timeMarkers}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 w-0.5 h-full bg-red-500 z-10 pointer-events-none"
          style={{
            left: (currentTime / project.duration) * totalWidth
          }}
        />

        {/* Tracks */}
        <div className="relative" style={{ height: tracks.length * trackHeight }}>
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className={`absolute border-b border-gray-300 flex items-center ${
                selectedTrack === track.id ? 'bg-blue-50' : 'bg-white'
              }`}
              style={{
                top: index * trackHeight,
                height: trackHeight,
                width: '100%'
              }}
            >
              {/* Track label */}
              <div className="w-32 px-2 flex items-center space-x-2 border-r border-gray-300 h-full">
                {getTrackIcon(track.type)}
                <span className="text-xs truncate">{track.name}</span>
              </div>

              {/* Track content */}
              <div className="flex-1 relative h-full">
                <div
                  className={`absolute h-8 rounded ${getTrackColor(track.type)} opacity-80 cursor-pointer hover:opacity-100`}
                  style={{
                    left: (track.startTime / project.duration) * totalWidth,
                    width: (track.duration / project.duration) * totalWidth,
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  <div className="px-2 py-1 text-white text-xs truncate">
                    {track.name}
                  </div>
                </div>
              </div>

              {/* Track controls */}
              <div className="w-16 px-2 flex items-center justify-center space-x-1">
                {track.type === 'audio' && (
                  <VolumeUpIcon className="h-4 w-4 text-gray-500" />
                )}
                <button
                  onClick={() => deleteTrack(track.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPropertiesPanel = () => {
    if (!selectedTrack) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Properties</h3>
          <p className="text-gray-500">Select a track to edit its properties</p>
        </div>
      );
    }

    const track = tracks.find(t => t.id === selectedTrack);
    if (!track) return null;

    return (
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={track.name}
              onChange={(e) => updateTrack(track.id, { name: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="number"
                value={track.startTime}
                onChange={(e) => updateTrack(track.id, { startTime: parseFloat(e.target.value) })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input
                type="number"
                value={track.duration}
                onChange={(e) => updateTrack(track.id, { duration: parseFloat(e.target.value) })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                step="0.1"
              />
            </div>
          </div>

          {track.type === 'audio' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Volume: {track.volume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={track.volume || 100}
                onChange={(e) => updateTrack(track.id, { volume: parseInt(e.target.value) })}
                className="mt-1 block w-full"
              />
            </div>
          )}

          {(track.type === 'video' || track.type === 'image') && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Opacity: {track.opacity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={track.opacity || 100}
                onChange={(e) => updateTrack(track.id, { opacity: parseInt(e.target.value) })}
                className="mt-1 block w-full"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Scale</label>
              <input
                type="number"
                value={track.scale || 1}
                onChange={(e) => updateTrack(track.id, { scale: parseFloat(e.target.value) })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                step="0.1"
                min="0.1"
                max="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rotation</label>
              <input
                type="number"
                value={track.rotation || 0}
                onChange={(e) => updateTrack(track.id, { rotation: parseFloat(e.target.value) })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                step="1"
                min="-180"
                max="180"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-300">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">{project.name}</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{project.resolution}</span>
            <span>•</span>
            <span>{project.aspectRatio}</span>
            <span>•</span>
            <span>{formatTime(project.duration)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="h-5 w-5" />
            ) : (
              <ArrowsPointingOutIcon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => onSave({ ...project, tracks })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={() => onExport({ ...project, tracks })}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Tracks */}
        <div className="w-1/3 border-r border-gray-300 flex flex-col">
          <div className="p-4 border-b border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tracks</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => addTrack('video')}
                  className="p-2 text-blue-600 hover:text-blue-800"
                  title="Add Video Track"
                >
                  <FilmIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => addTrack('audio')}
                  className="p-2 text-green-600 hover:text-green-800"
                  title="Add Audio Track"
                >
                  <SpeakerWaveIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => addTrack('image')}
                  className="p-2 text-purple-600 hover:text-purple-800"
                  title="Add Image Track"
                >
                  <PhotographIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => addTrack('text')}
                  className="p-2 text-orange-600 hover:text-orange-800"
                  title="Add Text Track"
                >
                  <span className="text-sm font-bold">T</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className={`p-2 rounded border cursor-pointer ${
                    selectedTrack === track.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  <div className="flex items-center space-x-2">
                    {getTrackIcon(track.type)}
                    <span className="text-sm font-medium">{track.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(track.startTime)} - {formatTime(track.startTime + track.duration)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {renderPropertiesPanel()}
        </div>

        {/* Center Panel - Timeline */}
        <div className="flex-1 flex flex-col">
          {/* Controls */}
          <div className="p-4 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-5 w-5" />
                    ) : (
                      <PlayIcon className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={handleStop}
                    className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <StopIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="text-sm text-gray-600">
                  {formatTime(currentTime)} / {formatTime(project.duration)}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Zoom:</label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 p-4 overflow-auto">
            <div
              ref={timelineRef}
              className="relative cursor-pointer"
              onClick={handleTimelineClick}
              style={{ width: timelineWidth * zoom }}
            >
              {renderTimeline()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
