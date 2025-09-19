import React, { useState, useEffect, useRef } from 'react';
import {
  SparklesIcon, ColorSwatchIcon, EyeIcon, CogIcon, FilmIcon,
  PlayIcon, PauseIcon, DownloadIcon, UploadIcon, TrashIcon,
  PlusIcon, MinusIcon, RefreshIcon, CheckCircleIcon
} from '@heroicons/react/outline';

interface ColorGrade {
  id: string;
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  exposure: number;
  shadows: number;
  highlights: number;
  whites: number;
  blacks: number;
  vibrance: number;
  temperature: number;
  tint: number;
}

interface VFXEffect {
  id: string;
  name: string;
  type: 'blur' | 'glow' | 'particles' | 'lens_flare' | 'chromatic_aberration' | 'film_grain' | 'vignette' | 'motion_blur';
  intensity: number;
  radius: number;
  color: string;
  enabled: boolean;
  parameters: Record<string, any>;
}

interface AudioTrack {
  id: string;
  name: string;
  type: 'music' | 'sfx' | 'voice' | 'ambient';
  volume: number;
  pan: number;
  fadeIn: number;
  fadeOut: number;
  startTime: number;
  duration: number;
  file: string;
  effects: string[];
}

interface PostProductionSuiteProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: any) => void;
  project: any;
}

const PostProductionSuite: React.FC<PostProductionSuiteProps> = ({
  isOpen,
  onClose,
  onExport,
  project
}) => {
  const [activeTab, setActiveTab] = useState<'color' | 'vfx' | 'audio' | 'export'>('color');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  const [colorGrade, setColorGrade] = useState<ColorGrade>({
    id: 'default',
    name: 'Default Grade',
    brightness: 0,
    contrast: 1.0,
    saturation: 1.0,
    hue: 0,
    exposure: 0,
    shadows: 0,
    highlights: 0,
    whites: 0,
    blacks: 0,
    vibrance: 0,
    temperature: 0,
    tint: 0
  });

  const [vfxEffects, setVfxEffects] = useState<VFXEffect[]>([
    {
      id: 'vfx_1',
      name: 'Cinematic Glow',
      type: 'glow',
      intensity: 0.3,
      radius: 10,
      color: '#ffffff',
      enabled: true,
      parameters: { softness: 0.8, threshold: 0.5 }
    },
    {
      id: 'vfx_2',
      name: 'Film Grain',
      type: 'film_grain',
      intensity: 0.2,
      radius: 1,
      color: '#000000',
      enabled: true,
      parameters: { size: 0.5, contrast: 0.3 }
    },
    {
      id: 'vfx_3',
      name: 'Vignette',
      type: 'vignette',
      intensity: 0.4,
      radius: 50,
      color: '#000000',
      enabled: true,
      parameters: { feather: 0.8, roundness: 1.0 }
    }
  ]);

  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([
    {
      id: 'audio_1',
      name: 'Background Music',
      type: 'music',
      volume: 0.7,
      pan: 0,
      fadeIn: 2,
      fadeOut: 3,
      startTime: 0,
      duration: 30,
      file: 'cinematic_music.mp3',
      effects: ['reverb', 'compression']
    },
    {
      id: 'audio_2',
      name: 'Voice Over',
      type: 'voice',
      volume: 0.9,
      pan: 0,
      fadeIn: 0.5,
      fadeOut: 0.5,
      startTime: 5,
      duration: 20,
      file: 'voice_over.wav',
      effects: ['noise_reduction', 'eq']
    }
  ]);

  const [exportSettings, setExportSettings] = useState({
    resolution: '1920x1080',
    frameRate: 30,
    bitrate: 'high',
    format: 'mp4',
    codec: 'h264',
    quality: 'high',
    audioBitrate: 320,
    includeSubtitles: false,
    watermark: false
  });

  const colorPresets = [
    { name: 'Natural', brightness: 0, contrast: 1.0, saturation: 1.0, temperature: 0 },
    { name: 'Warm', brightness: 0.1, contrast: 1.1, saturation: 1.2, temperature: 0.3 },
    { name: 'Cool', brightness: 0.05, contrast: 1.2, saturation: 0.9, temperature: -0.2 },
    { name: 'Dramatic', brightness: -0.1, contrast: 1.3, saturation: 1.1, temperature: 0.1 },
    { name: 'Vintage', brightness: 0.2, contrast: 0.8, saturation: 0.7, temperature: 0.4 },
    { name: 'Cinematic', brightness: -0.05, contrast: 1.4, saturation: 1.3, temperature: 0.2 }
  ];

  const vfxTemplates = [
    {
      name: 'Cinematic Look',
      effects: [
        { type: 'glow', intensity: 0.3, enabled: true },
        { type: 'film_grain', intensity: 0.2, enabled: true },
        { type: 'vignette', intensity: 0.4, enabled: true }
      ]
    },
    {
      name: 'Commercial Clean',
      effects: [
        { type: 'glow', intensity: 0.1, enabled: true },
        { type: 'film_grain', intensity: 0.05, enabled: true },
        { type: 'vignette', intensity: 0.2, enabled: true }
      ]
    },
    {
      name: 'Dramatic',
      effects: [
        { type: 'glow', intensity: 0.5, enabled: true },
        { type: 'chromatic_aberration', intensity: 0.3, enabled: true },
        { type: 'vignette', intensity: 0.6, enabled: true }
      ]
    }
  ];

  const updateColorGrade = (property: keyof ColorGrade, value: number) => {
    setColorGrade(prev => ({ ...prev, [property]: value }));
  };

  const applyColorPreset = (preset: any) => {
    setColorGrade(prev => ({
      ...prev,
      brightness: preset.brightness,
      contrast: preset.contrast,
      saturation: preset.saturation,
      temperature: preset.temperature
    }));
  };

  const updateVFXEffect = (effectId: string, property: string, value: any) => {
    setVfxEffects(prev => prev.map(effect =>
      effect.id === effectId ? { ...effect, [property]: value } : effect
    ));
  };

  const toggleVFXEffect = (effectId: string) => {
    setVfxEffects(prev => prev.map(effect =>
      effect.id === effectId ? { ...effect, enabled: !effect.enabled } : effect
    ));
  };

  const applyVFXTemplate = (template: any) => {
    setVfxEffects(prev => prev.map(effect => {
      const templateEffect = template.effects.find((te: any) => te.type === effect.type);
      if (templateEffect) {
        return {
          ...effect,
          intensity: templateEffect.intensity,
          enabled: templateEffect.enabled
        };
      }
      return effect;
    }));
  };

  const updateAudioTrack = (trackId: string, property: string, value: any) => {
    setAudioTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, [property]: value } : track
    ));
  };

  const renderVideo = async () => {
    setIsRendering(true);
    setRenderProgress(0);

    // Simulate rendering process
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setRenderProgress(i);
    }

    setIsRendering(false);
    onExport({
      colorGrade,
      vfxEffects,
      audioTracks,
      exportSettings
    });
  };

  const tabs = [
    { id: 'color', name: 'Color Grading', icon: ColorSwatchIcon },
    { id: 'vfx', name: 'VFX & Effects', icon: SparklesIcon },
    { id: 'audio', name: 'Audio Mixing', icon: FilmIcon },
    { id: 'export', name: 'Export', icon: DownloadIcon }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-11/12 max-w-7xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FilmIcon className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Post-Production Suite</h2>
              <p className="text-sm text-gray-500">
                Professional color grading, VFX, and audio mixing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeTab === 'color' && (
              <div className="space-y-6">
                {/* Color Presets */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Presets</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyColorPreset(preset)}
                        className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                      >
                        <div className="w-full h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded mb-2"></div>
                        <span className="text-sm font-medium text-gray-700">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">Basic Adjustments</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brightness: {colorGrade.brightness.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.01"
                          value={colorGrade.brightness}
                          onChange={(e) => updateColorGrade('brightness', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contrast: {colorGrade.contrast.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.01"
                          value={colorGrade.contrast}
                          onChange={(e) => updateColorGrade('contrast', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Saturation: {colorGrade.saturation.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.01"
                          value={colorGrade.saturation}
                          onChange={(e) => updateColorGrade('saturation', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exposure: {colorGrade.exposure.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="-2"
                          max="2"
                          step="0.01"
                          value={colorGrade.exposure}
                          onChange={(e) => updateColorGrade('exposure', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">Advanced Controls</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Temperature: {colorGrade.temperature.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.01"
                          value={colorGrade.temperature}
                          onChange={(e) => updateColorGrade('temperature', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tint: {colorGrade.tint.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.01"
                          value={colorGrade.tint}
                          onChange={(e) => updateColorGrade('tint', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shadows: {colorGrade.shadows.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.01"
                          value={colorGrade.shadows}
                          onChange={(e) => updateColorGrade('shadows', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Highlights: {colorGrade.highlights.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.01"
                          value={colorGrade.highlights}
                          onChange={(e) => updateColorGrade('highlights', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vfx' && (
              <div className="space-y-6">
                {/* VFX Templates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">VFX Templates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {vfxTemplates.map((template) => (
                      <button
                        key={template.name}
                        onClick={() => applyVFXTemplate(template)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                      >
                        <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600">
                          {template.effects.filter((e: any) => e.enabled).length} effects enabled
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* VFX Effects */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Effects</h3>
                  <div className="space-y-4">
                    {vfxEffects.map((effect) => (
                      <div key={effect.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={effect.enabled}
                              onChange={() => toggleVFXEffect(effect.id)}
                              className="rounded"
                            />
                            <h4 className="font-medium text-gray-900">{effect.name}</h4>
                            <span className="text-sm text-gray-500 capitalize">{effect.type.replace('_', ' ')}</span>
                          </div>
                          <button
                            onClick={() => setVfxEffects(prev => prev.filter(e => e.id !== effect.id))}
                            className="text-red-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {effect.enabled && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Intensity: {effect.intensity.toFixed(2)}
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={effect.intensity}
                                onChange={(e) => updateVFXEffect(effect.id, 'intensity', parseFloat(e.target.value))}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Radius: {effect.radius}
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={effect.radius}
                                onChange={(e) => updateVFXEffect(effect.id, 'radius', parseInt(e.target.value))}
                                className="w-full"
                              />
                            </div>
                            {effect.type === 'glow' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Color
                                </label>
                                <input
                                  type="color"
                                  value={effect.color}
                                  onChange={(e) => updateVFXEffect(effect.id, 'color', e.target.value)}
                                  className="w-12 h-8 rounded border"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Audio Tracks</h3>
                <div className="space-y-4">
                  {audioTracks.map((track) => (
                    <div key={track.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{track.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{track.type}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{track.file}</span>
                          <button className="text-red-400 hover:text-red-600">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Volume: {Math.round(track.volume * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={track.volume}
                            onChange={(e) => updateAudioTrack(track.id, 'volume', parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pan: {track.pan.toFixed(2)}
                          </label>
                          <input
                            type="range"
                            min="-1"
                            max="1"
                            step="0.01"
                            value={track.pan}
                            onChange={(e) => updateAudioTrack(track.id, 'pan', parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fade In: {track.fadeIn}s
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.1"
                            value={track.fadeIn}
                            onChange={(e) => updateAudioTrack(track.id, 'fadeIn', parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Export Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">Video Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
                        <select
                          value={exportSettings.resolution}
                          onChange={(e) => setExportSettings(prev => ({ ...prev, resolution: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="1920x1080">1920x1080 (Full HD)</option>
                          <option value="3840x2160">3840x2160 (4K)</option>
                          <option value="1280x720">1280x720 (HD)</option>
                          <option value="854x480">854x480 (SD)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Frame Rate</label>
                        <select
                          value={exportSettings.frameRate}
                          onChange={(e) => setExportSettings(prev => ({ ...prev, frameRate: parseInt(e.target.value) }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value={24}>24 fps (Cinematic)</option>
                          <option value={30}>30 fps (Standard)</option>
                          <option value={60}>60 fps (Smooth)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
                        <select
                          value={exportSettings.quality}
                          onChange={(e) => setExportSettings(prev => ({ ...prev, quality: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="low">Low (Fast)</option>
                          <option value="medium">Medium (Balanced)</option>
                          <option value="high">High (Quality)</option>
                          <option value="ultra">Ultra (Best)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">Audio Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Audio Bitrate</label>
                        <select
                          value={exportSettings.audioBitrate}
                          onChange={(e) => setExportSettings(prev => ({ ...prev, audioBitrate: parseInt(e.target.value) }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value={128}>128 kbps</option>
                          <option value={256}>256 kbps</option>
                          <option value={320}>320 kbps (High)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={exportSettings.includeSubtitles}
                            onChange={(e) => setExportSettings(prev => ({ ...prev, includeSubtitles: e.target.checked }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Include Subtitles</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={exportSettings.watermark}
                            onChange={(e) => setExportSettings(prev => ({ ...prev, watermark: e.target.checked }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Add Watermark</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Render Progress */}
                {isRendering && (
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <RefreshIcon className="h-6 w-6 text-blue-500 animate-spin" />
                      <h4 className="font-medium text-blue-900">Rendering Video</h4>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${renderProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">{renderProgress}% complete</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            
            {/* Video Preview */}
            <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
              <div className="text-center text-white">
                <FilmIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-400">Video Preview</p>
                <p className="text-xs text-gray-500 mt-1">{currentTime.toFixed(1)}s / {project?.duration || 30}s</p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
              >
                {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min="0"
                max={project?.duration || 30}
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="flex-1"
              />
            </div>

            {/* Current Settings Summary */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Current Settings</h4>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Brightness:</span> {colorGrade.brightness.toFixed(2)}</div>
                <div><span className="font-medium">Contrast:</span> {colorGrade.contrast.toFixed(2)}</div>
                <div><span className="font-medium">Saturation:</span> {colorGrade.saturation.toFixed(2)}</div>
                <div><span className="font-medium">VFX Effects:</span> {vfxEffects.filter(e => e.enabled).length}</div>
                <div><span className="font-medium">Audio Tracks:</span> {audioTracks.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {isRendering ? 'Rendering in progress...' : 'Ready to export your cinema-quality video'}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={renderVideo}
              disabled={isRendering}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>{isRendering ? 'Rendering...' : 'Export Video'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostProductionSuite;
