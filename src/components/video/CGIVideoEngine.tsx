import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayIcon, PauseIcon, StopIcon, CameraIcon, LightBulbIcon,
  CubeIcon, SparklesIcon, EyeIcon, CogIcon, FilmIcon,
  ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ArrowDownIcon,
  PlusIcon, TrashIcon, SaveIcon, DownloadIcon, UploadIcon
} from '@heroicons/react/outline';

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Camera {
  id: string;
  name: string;
  position: Vector3;
  rotation: Vector3;
  fov: number;
  type: 'perspective' | 'orthographic';
  movement: {
    type: 'static' | 'dolly' | 'pan' | 'tilt' | 'orbit' | 'tracking';
    duration: number;
    easing: string;
    keyframes: Vector3[];
  };
}

interface Light {
  id: string;
  name: string;
  type: 'directional' | 'point' | 'spot' | 'area' | 'ambient';
  position: Vector3;
  rotation: Vector3;
  color: string;
  intensity: number;
  shadows: boolean;
  softness: number;
  range: number;
}

interface Material {
  id: string;
  name: string;
  type: 'standard' | 'metallic' | 'glass' | 'emissive' | 'subsurface';
  baseColor: string;
  metallic: number;
  roughness: number;
  normal: string;
  emissive: string;
  opacity: number;
  ior: number;
}

interface Object3D {
  id: string;
  name: string;
  type: 'mesh' | 'character' | 'prop' | 'environment';
  geometry: string;
  material: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
  animations: Animation[];
}

interface Animation {
  id: string;
  name: string;
  type: 'transform' | 'material' | 'camera' | 'light';
  duration: number;
  easing: string;
  keyframes: any[];
  loop: boolean;
}

interface Scene {
  id: string;
  name: string;
  duration: number;
  objects: Object3D[];
  cameras: Camera[];
  lights: Light[];
  materials: Material[];
  environment: {
    skybox: string;
    fog: boolean;
    fogColor: string;
    fogDensity: number;
  };
  postProcessing: {
    bloom: boolean;
    bloomIntensity: number;
    colorGrading: boolean;
    contrast: number;
    saturation: number;
    exposure: number;
    vignette: boolean;
    vignetteIntensity: number;
  };
}

interface CGIVideoEngineProps {
  project: any;
  onProjectUpdate: (project: any) => void;
  onClose: () => void;
}

const CGIVideoEngine: React.FC<CGIVideoEngineProps> = ({
  project,
  onProjectUpdate,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentScene, setCurrentScene] = useState<Scene>({
    id: 'scene_1',
    name: 'Main Scene',
    duration: 30,
    objects: [],
    cameras: [],
    lights: [],
    materials: [],
    environment: {
      skybox: 'studio',
      fog: false,
      fogColor: '#ffffff',
      fogDensity: 0.1
    },
    postProcessing: {
      bloom: true,
      bloomIntensity: 0.5,
      colorGrading: true,
      contrast: 1.0,
      saturation: 1.0,
      exposure: 1.0,
      vignette: false,
      vignetteIntensity: 0.3
    }
  });

  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [selectedLight, setSelectedLight] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [renderQuality, setRenderQuality] = useState<'draft' | 'preview' | 'final'>('preview');
  const [showInspector, setShowInspector] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showMaterials, setShowMaterials] = useState(false);
  const [showLighting, setShowLighting] = useState(false);

  // Initialize 3D scene
  useEffect(() => {
    initializeScene();
  }, []);

  const initializeScene = () => {
    // Add default camera
    const defaultCamera: Camera = {
      id: 'camera_main',
      name: 'Main Camera',
      position: { x: 0, y: 1.6, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      fov: 75,
      type: 'perspective',
      movement: {
        type: 'static',
        duration: 0,
        easing: 'linear',
        keyframes: []
      }
    };

    // Add default lighting
    const defaultLights: Light[] = [
      {
        id: 'light_key',
        name: 'Key Light',
        type: 'directional',
        position: { x: 5, y: 10, z: 5 },
        rotation: { x: -45, y: 45, z: 0 },
        color: '#ffffff',
        intensity: 1.0,
        shadows: true,
        softness: 0.5,
        range: 100
      },
      {
        id: 'light_fill',
        name: 'Fill Light',
        type: 'directional',
        position: { x: -3, y: 5, z: 3 },
        rotation: { x: -30, y: -30, z: 0 },
        color: '#ffffff',
        intensity: 0.3,
        shadows: false,
        softness: 1.0,
        range: 100
      },
      {
        id: 'light_rim',
        name: 'Rim Light',
        type: 'directional',
        position: { x: 0, y: 2, z: -5 },
        rotation: { x: 0, y: 180, z: 0 },
        color: '#ffffff',
        intensity: 0.5,
        shadows: false,
        softness: 0.8,
        range: 100
      }
    ];

    // Add default materials
    const defaultMaterials: Material[] = [
      {
        id: 'mat_standard',
        name: 'Standard Material',
        type: 'standard',
        baseColor: '#808080',
        metallic: 0.0,
        roughness: 0.5,
        normal: '',
        emissive: '',
        opacity: 1.0,
        ior: 1.5
      },
      {
        id: 'mat_metallic',
        name: 'Metallic Material',
        type: 'metallic',
        baseColor: '#c0c0c0',
        metallic: 1.0,
        roughness: 0.1,
        normal: '',
        emissive: '',
        opacity: 1.0,
        ior: 1.5
      },
      {
        id: 'mat_glass',
        name: 'Glass Material',
        type: 'glass',
        baseColor: '#ffffff',
        metallic: 0.0,
        roughness: 0.0,
        normal: '',
        emissive: '',
        opacity: 0.1,
        ior: 1.5
      }
    ];

    setCurrentScene(prev => ({
      ...prev,
      cameras: [defaultCamera],
      lights: defaultLights,
      materials: defaultMaterials
    }));
  };

  const addObject = (type: 'mesh' | 'character' | 'prop' | 'environment') => {
    const newObject: Object3D = {
      id: `obj_${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${currentScene.objects.length + 1}`,
      type,
      geometry: type === 'character' ? 'humanoid' : 'cube',
      material: 'mat_standard',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      castShadow: true,
      receiveShadow: true,
      animations: []
    };

    setCurrentScene(prev => ({
      ...prev,
      objects: [...prev.objects, newObject]
    }));
  };

  const addCamera = () => {
    const newCamera: Camera = {
      id: `camera_${Date.now()}`,
      name: `Camera ${currentScene.cameras.length + 1}`,
      position: { x: 0, y: 1.6, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      fov: 75,
      type: 'perspective',
      movement: {
        type: 'static',
        duration: 0,
        easing: 'linear',
        keyframes: []
      }
    };

    setCurrentScene(prev => ({
      ...prev,
      cameras: [...prev.cameras, newCamera]
    }));
  };

  const addLight = (type: Light['type']) => {
    const newLight: Light = {
      id: `light_${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Light`,
      type,
      position: { x: 0, y: 5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#ffffff',
      intensity: 1.0,
      shadows: type !== 'ambient',
      softness: 0.5,
      range: 100
    };

    setCurrentScene(prev => ({
      ...prev,
      lights: [...prev.lights, newLight]
    }));
  };

  const updateObjectProperty = (objectId: string, property: string, value: any) => {
    setCurrentScene(prev => ({
      ...prev,
      objects: prev.objects.map(obj =>
        obj.id === objectId ? { ...obj, [property]: value } : obj
      )
    }));
  };

  const updateCameraProperty = (cameraId: string, property: string, value: any) => {
    setCurrentScene(prev => ({
      ...prev,
      cameras: prev.cameras.map(cam =>
        cam.id === cameraId ? { ...cam, [property]: value } : cam
      )
    }));
  };

  const updateLightProperty = (lightId: string, property: string, value: any) => {
    setCurrentScene(prev => ({
      ...prev,
      lights: prev.lights.map(light =>
        light.id === lightId ? { ...light, [property]: value } : light
      )
    }));
  };

  const renderFrame = useCallback(() => {
    // This would integrate with a real 3D engine like Three.js or Babylon.js
    // For now, we'll simulate the rendering process
    console.log('Rendering frame at time:', currentTime);
  }, [currentTime]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.033; // 30 FPS
          if (newTime >= currentScene.duration) {
            setIsPlaying(false);
            return 0;
          }
          return newTime;
        });
      }, 33);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentScene.duration]);

  useEffect(() => {
    renderFrame();
  }, [renderFrame]);

  const exportVideo = async () => {
    // This would export the final rendered video
    console.log('Exporting video...');
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <FilmIcon className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-xl font-bold">CGI Video Engine</h1>
            <p className="text-sm text-gray-400">Cinema Quality 3D Rendering</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Quality:</span>
            <select
              value={renderQuality}
              onChange={(e) => setRenderQuality(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="preview">Preview</option>
              <option value="final">Final</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInspector(!showInspector)}
              className={`px-3 py-1 rounded text-sm ${showInspector ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              Inspector
            </button>
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className={`px-3 py-1 rounded text-sm ${showTimeline ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              Timeline
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Scene Hierarchy */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Scene Objects */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Scene Objects</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => addObject('character')}
                  className="bg-purple-600 hover:bg-purple-700 p-2 rounded text-xs"
                  title="Add Character"
                >
                  <CubeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => addObject('prop')}
                  className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-xs"
                  title="Add Prop"
                >
                  <CubeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => addObject('environment')}
                  className="bg-green-600 hover:bg-green-700 p-2 rounded text-xs"
                  title="Add Environment"
                >
                  <CubeIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              {currentScene.objects.map(obj => (
                <div
                  key={obj.id}
                  className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                    selectedObject === obj.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedObject(obj.id)}
                >
                  <div className="flex items-center space-x-2">
                    <CubeIcon className="h-4 w-4" />
                    <span className="text-sm">{obj.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateObjectProperty(obj.id, 'visible', !obj.visible);
                      }}
                      className="text-xs"
                    >
                      <EyeIcon className={`h-4 w-4 ${obj.visible ? 'text-white' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentScene(prev => ({
                          ...prev,
                          objects: prev.objects.filter(o => o.id !== obj.id)
                        }));
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cameras */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Cameras</h3>
              <button
                onClick={addCamera}
                className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-xs"
                title="Add Camera"
              >
                <CameraIcon className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-1">
              {currentScene.cameras.map(cam => (
                <div
                  key={cam.id}
                  className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                    selectedCamera === cam.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedCamera(cam.id)}
                >
                  <div className="flex items-center space-x-2">
                    <CameraIcon className="h-4 w-4" />
                    <span className="text-sm">{cam.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentScene(prev => ({
                        ...prev,
                        cameras: prev.cameras.filter(c => c.id !== cam.id)
                      }));
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Lights */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Lights</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => addLight('directional')}
                  className="bg-yellow-600 hover:bg-yellow-700 p-1 rounded text-xs"
                  title="Directional Light"
                >
                  <LightBulbIcon className="h-3 w-3" />
                </button>
                <button
                  onClick={() => addLight('point')}
                  className="bg-orange-600 hover:bg-orange-700 p-1 rounded text-xs"
                  title="Point Light"
                >
                  <LightBulbIcon className="h-3 w-3" />
                </button>
                <button
                  onClick={() => addLight('spot')}
                  className="bg-red-600 hover:bg-red-700 p-1 rounded text-xs"
                  title="Spot Light"
                >
                  <LightBulbIcon className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              {currentScene.lights.map(light => (
                <div
                  key={light.id}
                  className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                    selectedLight === light.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedLight(light.id)}
                >
                  <div className="flex items-center space-x-2">
                    <LightBulbIcon className="h-4 w-4" />
                    <span className="text-sm">{light.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentScene(prev => ({
                        ...prev,
                        lights: prev.lights.filter(l => l.id !== light.id)
                      }));
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div className="p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Materials</h3>
              <button
                onClick={() => setShowMaterials(!showMaterials)}
                className={`px-2 py-1 rounded text-xs ${showMaterials ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                <SparklesIcon className="h-4 w-4" />
              </button>
            </div>
            
            {showMaterials && (
              <div className="space-y-2">
                {currentScene.materials.map(mat => (
                  <div
                    key={mat.id}
                    className="p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: mat.baseColor }}
                      />
                      <span className="text-sm">{mat.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Viewport */}
        <div className="flex-1 flex flex-col">
          {/* 3D Viewport */}
          <div className="flex-1 bg-gray-900 relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
            />
            
            {/* Viewport Controls */}
            <div className="absolute top-4 left-4 flex space-x-2">
              <button className="bg-gray-800 hover:bg-gray-700 p-2 rounded">
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 p-2 rounded">
                <ArrowRightIcon className="h-5 w-5" />
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 p-2 rounded">
                <ArrowUpIcon className="h-5 w-5" />
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 p-2 rounded">
                <ArrowDownIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Render Info */}
            <div className="absolute top-4 right-4 bg-gray-800 p-3 rounded">
              <div className="text-sm space-y-1">
                <div>Objects: {currentScene.objects.length}</div>
                <div>Lights: {currentScene.lights.length}</div>
                <div>Cameras: {currentScene.cameras.length}</div>
                <div>Quality: {renderQuality}</div>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="bg-gray-800 p-4 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-blue-600 hover:bg-blue-500 p-3 rounded-lg"
              >
                {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
                className="bg-gray-600 hover:bg-gray-500 p-3 rounded-lg"
              >
                <StopIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{currentTime.toFixed(1)}s</span>
                <input
                  type="range"
                  min="0"
                  max={currentScene.duration}
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                  className="w-64"
                />
                <span className="text-sm">{currentScene.duration}s</span>
              </div>
              <button
                onClick={exportVideo}
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <DownloadIcon className="h-5 w-5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Inspector */}
        {showInspector && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-4">Inspector</h3>
            
            {selectedObject && (
              <div className="space-y-4">
                <h4 className="font-medium">Object Properties</h4>
                {(() => {
                  const obj = currentScene.objects.find(o => o.id === selectedObject);
                  if (!obj) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Name</label>
                        <input
                          type="text"
                          value={obj.name}
                          onChange={(e) => updateObjectProperty(obj.id, 'name', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Position</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            value={obj.position.x}
                            onChange={(e) => updateObjectProperty(obj.id, 'position', { ...obj.position, x: parseFloat(e.target.value) })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                            placeholder="X"
                          />
                          <input
                            type="number"
                            value={obj.position.y}
                            onChange={(e) => updateObjectProperty(obj.id, 'position', { ...obj.position, y: parseFloat(e.target.value) })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                            placeholder="Y"
                          />
                          <input
                            type="number"
                            value={obj.position.z}
                            onChange={(e) => updateObjectProperty(obj.id, 'position', { ...obj.position, z: parseFloat(e.target.value) })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                            placeholder="Z"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Rotation</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            value={obj.rotation.x}
                            onChange={(e) => updateObjectProperty(obj.id, 'rotation', { ...obj.rotation, x: parseFloat(e.target.value) })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                            placeholder="X"
                          />
                          <input
                            type="number"
                            value={obj.rotation.y}
                            onChange={(e) => updateObjectProperty(obj.id, 'rotation', { ...obj.rotation, y: parseFloat(e.target.value) })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                            placeholder="Y"
                          />
                          <input
                            type="number"
                            value={obj.rotation.z}
                            onChange={(e) => updateObjectProperty(obj.id, 'rotation', { ...obj.rotation, z: parseFloat(e.target.value) })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                            placeholder="Z"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Scale</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            value={obj.scale.x}
                            onChange={(e) => updateObjectProperty(obj.id, 'scale', { ...obj.scale, x: parseFloat(e.target.value) })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                            placeholder="X"
                          />
                          <input
                            type="number"
                            value={obj.scale.y}
                            onChange={(e) => updateObjectProperty(obj.id, 'scale', { ...obj.scale, y: parseFloat(e.target.value) })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                            placeholder="Y"
                          />
                          <input
                            type="number"
                            value={obj.scale.z}
                            onChange={(e) => updateObjectProperty(obj.id, 'scale', { ...obj.scale, z: parseFloat(e.target.value) })}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                            placeholder="Z"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {selectedCamera && (
              <div className="space-y-4">
                <h4 className="font-medium">Camera Properties</h4>
                {(() => {
                  const cam = currentScene.cameras.find(c => c.id === selectedCamera);
                  if (!cam) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">FOV</label>
                        <input
                          type="number"
                          value={cam.fov}
                          onChange={(e) => updateCameraProperty(cam.id, 'fov', parseFloat(e.target.value))}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Movement Type</label>
                        <select
                          value={cam.movement.type}
                          onChange={(e) => updateCameraProperty(cam.id, 'movement', { ...cam.movement, type: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                        >
                          <option value="static">Static</option>
                          <option value="dolly">Dolly</option>
                          <option value="pan">Pan</option>
                          <option value="tilt">Tilt</option>
                          <option value="orbit">Orbit</option>
                          <option value="tracking">Tracking</option>
                        </select>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {selectedLight && (
              <div className="space-y-4">
                <h4 className="font-medium">Light Properties</h4>
                {(() => {
                  const light = currentScene.lights.find(l => l.id === selectedLight);
                  if (!light) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Intensity</label>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.1"
                          value={light.intensity}
                          onChange={(e) => updateLightProperty(light.id, 'intensity', parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-400">{light.intensity}</span>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Color</label>
                        <input
                          type="color"
                          value={light.color}
                          onChange={(e) => updateLightProperty(light.id, 'color', e.target.value)}
                          className="w-full h-8 bg-gray-700 border border-gray-600 rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Shadows</label>
                        <input
                          type="checkbox"
                          checked={light.shadows}
                          onChange={(e) => updateLightProperty(light.id, 'shadows', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Enable Shadows</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CGIVideoEngine;









