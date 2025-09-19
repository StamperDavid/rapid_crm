import React, { useState, useEffect } from 'react';
import {
  SparklesIcon, CameraIcon, LightBulbIcon, FilmIcon,
  PlayIcon, PauseIcon, EyeIcon, CogIcon, StarIcon,
  RefreshIcon, CheckCircleIcon, ExclamationIcon
} from '@heroicons/react/outline';

interface Shot {
  id: string;
  name: string;
  type: 'establishing' | 'close-up' | 'medium' | 'wide' | 'over-shoulder' | 'dolly' | 'pan' | 'tilt';
  duration: number;
  camera: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    fov: number;
    movement: {
      type: 'static' | 'dolly' | 'pan' | 'tilt' | 'orbit' | 'tracking';
      duration: number;
      easing: string;
      keyframes: any[];
    };
  };
  lighting: {
    keyLight: { intensity: number; color: string; position: any };
    fillLight: { intensity: number; color: string; position: any };
    rimLight: { intensity: number; color: string; position: any };
  };
  composition: {
    ruleOfThirds: boolean;
    leadingLines: boolean;
    depthOfField: number;
    focus: string;
  };
  mood: 'professional' | 'dramatic' | 'intimate' | 'energetic' | 'calm';
  description: string;
}

interface Scene {
  id: string;
  name: string;
  duration: number;
  shots: Shot[];
  transitions: string[];
  overallMood: string;
  targetAudience: string;
  message: string;
}

interface AISceneDirectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSceneGenerated: (scene: Scene) => void;
  projectBrief: {
    title: string;
    description: string;
    targetAudience: string;
    duration: number;
    style: string;
    message: string;
  };
}

const AISceneDirector: React.FC<AISceneDirectorProps> = ({
  isOpen,
  onClose,
  onSceneGenerated,
  projectBrief
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScene, setGeneratedScene] = useState<Scene | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedShot, setSelectedShot] = useState<Shot | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const shotTypes = [
    { type: 'establishing', name: 'Establishing Shot', description: 'Wide shot to establish location and context' },
    { type: 'close-up', name: 'Close-up', description: 'Intimate shot focusing on subject details' },
    { type: 'medium', name: 'Medium Shot', description: 'Balanced shot showing subject and some environment' },
    { type: 'wide', name: 'Wide Shot', description: 'Shows full subject and surrounding environment' },
    { type: 'over-shoulder', name: 'Over-shoulder', description: 'Shot from behind one subject looking at another' },
    { type: 'dolly', name: 'Dolly Shot', description: 'Camera moves forward/backward for dramatic effect' },
    { type: 'pan', name: 'Pan Shot', description: 'Camera rotates horizontally' },
    { type: 'tilt', name: 'Tilt Shot', description: 'Camera rotates vertically' }
  ];

  const lightingMoods = {
    professional: {
      keyLight: { intensity: 1.0, color: '#ffffff', position: { x: 5, y: 10, z: 5 } },
      fillLight: { intensity: 0.3, color: '#ffffff', position: { x: -3, y: 5, z: 3 } },
      rimLight: { intensity: 0.5, color: '#ffffff', position: { x: 0, y: 2, z: -5 } }
    },
    dramatic: {
      keyLight: { intensity: 1.5, color: '#ffeb3b', position: { x: 8, y: 12, z: 3 } },
      fillLight: { intensity: 0.1, color: '#ffffff', position: { x: -5, y: 3, z: 2 } },
      rimLight: { intensity: 0.8, color: '#ff9800', position: { x: 0, y: 1, z: -8 } }
    },
    intimate: {
      keyLight: { intensity: 0.8, color: '#ffc107', position: { x: 3, y: 6, z: 4 } },
      fillLight: { intensity: 0.4, color: '#ffffff', position: { x: -2, y: 4, z: 3 } },
      rimLight: { intensity: 0.3, color: '#ffffff', position: { x: 0, y: 3, z: -4 } }
    },
    energetic: {
      keyLight: { intensity: 1.2, color: '#4caf50', position: { x: 6, y: 8, z: 6 } },
      fillLight: { intensity: 0.5, color: '#81c784', position: { x: -4, y: 6, z: 4 } },
      rimLight: { intensity: 0.7, color: '#66bb6a', position: { x: 0, y: 4, z: -6 } }
    },
    calm: {
      keyLight: { intensity: 0.7, color: '#e3f2fd', position: { x: 4, y: 8, z: 4 } },
      fillLight: { intensity: 0.6, color: '#ffffff', position: { x: -3, y: 6, z: 3 } },
      rimLight: { intensity: 0.4, color: '#bbdefb', position: { x: 0, y: 3, z: -4 } }
    }
  };

  const generateCinematicScene = async () => {
    setIsGenerating(true);
    setCurrentStep(1);

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep(2);

      // Generate shots based on project brief
      const shots: Shot[] = generateShotsForProject(projectBrief);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep(3);

      // Generate lighting and composition
      const enhancedShots = shots.map(shot => ({
        ...shot,
        lighting: lightingMoods[shot.mood as keyof typeof lightingMoods],
        composition: generateComposition(shot.type, shot.mood)
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(4);

      const scene: Scene = {
        id: `scene_${Date.now()}`,
        name: `${projectBrief.title} - Cinematic Sequence`,
        duration: projectBrief.duration,
        shots: enhancedShots,
        transitions: generateTransitions(enhancedShots),
        overallMood: determineOverallMood(projectBrief),
        targetAudience: projectBrief.targetAudience,
        message: projectBrief.message
      };

      setGeneratedScene(scene);
      setCurrentStep(5);

    } catch (error) {
      console.error('Error generating scene:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateShotsForProject = (brief: any): Shot[] => {
    const shots: Shot[] = [];
    let currentTime = 0;
    const shotDuration = brief.duration / 8; // 8 shots for a 30-second video

    // Opening establishing shot
    shots.push({
      id: 'shot_1',
      name: 'Opening Establishing Shot',
      type: 'establishing',
      duration: shotDuration * 1.5,
      camera: {
        position: { x: 0, y: 15, z: 20 },
        rotation: { x: -15, y: 0, z: 0 },
        fov: 60,
        movement: {
          type: 'dolly',
          duration: shotDuration * 1.5,
          easing: 'ease-in-out',
          keyframes: [
            { time: 0, position: { x: 0, y: 15, z: 20 } },
            { time: 1, position: { x: 0, y: 12, z: 15 } }
          ]
        }
      },
      lighting: lightingMoods.professional,
      composition: {
        ruleOfThirds: true,
        leadingLines: true,
        depthOfField: 0.8,
        focus: 'center'
      },
      mood: 'professional',
      description: 'Wide establishing shot introducing the main subject and environment'
    });

    currentTime += shotDuration * 1.5;

    // Medium shot with character introduction
    shots.push({
      id: 'shot_2',
      name: 'Character Introduction',
      type: 'medium',
      duration: shotDuration,
      camera: {
        position: { x: 0, y: 1.6, z: 5 },
        rotation: { x: 0, y: 0, z: 0 },
        fov: 75,
        movement: {
          type: 'static',
          duration: shotDuration,
          easing: 'linear',
          keyframes: []
        }
      },
      lighting: lightingMoods.professional,
      composition: {
        ruleOfThirds: true,
        leadingLines: false,
        depthOfField: 0.6,
        focus: 'character'
      },
      mood: 'professional',
      description: 'Medium shot focusing on the main character or subject'
    });

    currentTime += shotDuration;

    // Close-up for emotional impact
    shots.push({
      id: 'shot_3',
      name: 'Emotional Close-up',
      type: 'close-up',
      duration: shotDuration * 0.8,
      camera: {
        position: { x: 0, y: 1.6, z: 2 },
        rotation: { x: 0, y: 0, z: 0 },
        fov: 85,
        movement: {
          type: 'static',
          duration: shotDuration * 0.8,
          easing: 'linear',
          keyframes: []
        }
      },
      lighting: lightingMoods.intimate,
      composition: {
        ruleOfThirds: true,
        leadingLines: false,
        depthOfField: 0.3,
        focus: 'eyes'
      },
      mood: 'intimate',
      description: 'Close-up shot for emotional connection and detail'
    });

    currentTime += shotDuration * 0.8;

    // Dynamic dolly shot
    shots.push({
      id: 'shot_4',
      name: 'Dynamic Movement',
      type: 'dolly',
      duration: shotDuration * 1.2,
      camera: {
        position: { x: -5, y: 1.6, z: 8 },
        rotation: { x: 0, y: 15, z: 0 },
        fov: 70,
        movement: {
          type: 'dolly',
          duration: shotDuration * 1.2,
          easing: 'ease-out',
          keyframes: [
            { time: 0, position: { x: -5, y: 1.6, z: 8 } },
            { time: 1, position: { x: 5, y: 1.6, z: 8 } }
          ]
        }
      },
      lighting: lightingMoods.energetic,
      composition: {
        ruleOfThirds: true,
        leadingLines: true,
        depthOfField: 0.7,
        focus: 'subject'
      },
      mood: 'energetic',
      description: 'Dynamic camera movement to create energy and engagement'
    });

    currentTime += shotDuration * 1.2;

    // Wide shot for context
    shots.push({
      id: 'shot_5',
      name: 'Context Wide Shot',
      type: 'wide',
      duration: shotDuration,
      camera: {
        position: { x: 0, y: 8, z: 12 },
        rotation: { x: -20, y: 0, z: 0 },
        fov: 50,
        movement: {
          type: 'pan',
          duration: shotDuration,
          easing: 'ease-in-out',
          keyframes: [
            { time: 0, rotation: { x: -20, y: -10, z: 0 } },
            { time: 1, rotation: { x: -20, y: 10, z: 0 } }
          ]
        }
      },
      lighting: lightingMoods.professional,
      composition: {
        ruleOfThirds: true,
        leadingLines: true,
        depthOfField: 0.9,
        focus: 'environment'
      },
      mood: 'professional',
      description: 'Wide shot showing the broader context and environment'
    });

    currentTime += shotDuration;

    // Dramatic tilt shot
    shots.push({
      id: 'shot_6',
      name: 'Dramatic Tilt',
      type: 'tilt',
      duration: shotDuration * 0.8,
      camera: {
        position: { x: 0, y: 3, z: 6 },
        rotation: { x: 0, y: 0, z: 0 },
        fov: 80,
        movement: {
          type: 'tilt',
          duration: shotDuration * 0.8,
          easing: 'ease-in',
          keyframes: [
            { time: 0, rotation: { x: -30, y: 0, z: 0 } },
            { time: 1, rotation: { x: 30, y: 0, z: 0 } }
          ]
        }
      },
      lighting: lightingMoods.dramatic,
      composition: {
        ruleOfThirds: true,
        leadingLines: false,
        depthOfField: 0.5,
        focus: 'subject'
      },
      mood: 'dramatic',
      description: 'Dramatic tilt shot for visual impact and storytelling'
    });

    currentTime += shotDuration * 0.8;

    // Final close-up
    shots.push({
      id: 'shot_7',
      name: 'Final Close-up',
      type: 'close-up',
      duration: shotDuration * 0.7,
      camera: {
        position: { x: 0, y: 1.6, z: 1.5 },
        rotation: { x: 0, y: 0, z: 0 },
        fov: 90,
        movement: {
          type: 'static',
          duration: shotDuration * 0.7,
          easing: 'linear',
          keyframes: []
        }
      },
      lighting: lightingMoods.intimate,
      composition: {
        ruleOfThirds: true,
        leadingLines: false,
        depthOfField: 0.2,
        focus: 'eyes'
      },
      mood: 'intimate',
      description: 'Final close-up for emotional conclusion and call-to-action'
    });

    currentTime += shotDuration * 0.7;

    // Closing wide shot
    shots.push({
      id: 'shot_8',
      name: 'Closing Wide Shot',
      type: 'wide',
      duration: shotDuration * 0.8,
      camera: {
        position: { x: 0, y: 12, z: 18 },
        rotation: { x: -10, y: 0, z: 0 },
        fov: 55,
        movement: {
          type: 'dolly',
          duration: shotDuration * 0.8,
          easing: 'ease-out',
          keyframes: [
            { time: 0, position: { x: 0, y: 12, z: 18 } },
            { time: 1, position: { x: 0, y: 15, z: 25 } }
          ]
        }
      },
      lighting: lightingMoods.calm,
      composition: {
        ruleOfThirds: true,
        leadingLines: true,
        depthOfField: 0.95,
        focus: 'environment'
      },
      mood: 'calm',
      description: 'Closing wide shot to conclude the sequence'
    });

    return shots;
  };

  const generateComposition = (shotType: string, mood: string) => {
  const compositions = {
    establishing: { ruleOfThirds: true, leadingLines: true, depthOfField: 0.8, focus: 'center' },
    'close-up': { ruleOfThirds: true, leadingLines: false, depthOfField: 0.3, focus: 'eyes' },
    medium: { ruleOfThirds: true, leadingLines: false, depthOfField: 0.6, focus: 'character' },
    wide: { ruleOfThirds: true, leadingLines: true, depthOfField: 0.9, focus: 'environment' },
    'over-shoulder': { ruleOfThirds: true, leadingLines: false, depthOfField: 0.4, focus: 'subject' },
    dolly: { ruleOfThirds: true, leadingLines: true, depthOfField: 0.7, focus: 'subject' },
    pan: { ruleOfThirds: true, leadingLines: true, depthOfField: 0.8, focus: 'environment' },
    tilt: { ruleOfThirds: true, leadingLines: false, depthOfField: 0.5, focus: 'subject' }
  };

    return compositions[shotType as keyof typeof compositions] || compositions.medium;
  };

  const generateTransitions = (shots: Shot[]): string[] => {
    const transitions = ['cut', 'fade', 'dissolve', 'wipe', 'slide'];
    return shots.slice(0, -1).map((_, index) => {
      // Choose transition based on shot types and mood
      if (index === 0) return 'fade'; // Opening
      if (index === shots.length - 2) return 'fade'; // Closing
      return transitions[Math.floor(Math.random() * transitions.length)];
    });
  };

  const determineOverallMood = (brief: any): string => {
    if (brief.style.includes('dramatic')) return 'dramatic';
    if (brief.style.includes('professional')) return 'professional';
    if (brief.style.includes('intimate')) return 'intimate';
    if (brief.style.includes('energetic')) return 'energetic';
    return 'professional';
  };

  const getStepIcon = (step: number) => {
    if (step < currentStep) return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    if (step === currentStep) return <RefreshIcon className="h-6 w-6 text-blue-500 animate-spin" />;
    return <div className="h-6 w-6 rounded-full border-2 border-gray-600" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <StarIcon className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Scene Director</h2>
              <p className="text-sm text-gray-500">
                Generate cinema-quality shot sequences automatically
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

        {/* Content */}
        <div className="p-6">
          {!generatedScene ? (
            <div className="space-y-6">
              {/* Project Brief */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Brief</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <p className="text-sm text-gray-900">{projectBrief.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <p className="text-sm text-gray-900">{projectBrief.duration} seconds</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900">{projectBrief.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                    <p className="text-sm text-gray-900">{projectBrief.targetAudience}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Style</label>
                    <p className="text-sm text-gray-900">{projectBrief.style}</p>
                  </div>
                </div>
              </div>

              {/* Generation Steps */}
              {isGenerating && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Generating Cinematic Sequence</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      {getStepIcon(1)}
                      <span className="text-sm text-gray-700">Analyzing project requirements</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStepIcon(2)}
                      <span className="text-sm text-gray-700">Generating shot sequence</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStepIcon(3)}
                      <span className="text-sm text-gray-700">Optimizing lighting and composition</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStepIcon(4)}
                      <span className="text-sm text-gray-700">Creating camera movements</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStepIcon(5)}
                      <span className="text-sm text-gray-700">Finalizing cinematic sequence</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              {!isGenerating && (
                <div className="text-center">
                  <button
                    onClick={generateCinematicScene}
                    className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 flex items-center space-x-3 mx-auto"
                  >
                    <SparklesIcon className="h-6 w-6" />
                    <span className="text-lg font-medium">Generate Cinematic Sequence</span>
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    AI will create a professional shot sequence with optimal camera movements, lighting, and composition
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Generated Scene */
            <div className="space-y-6">
              {/* Scene Overview */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  <h3 className="text-lg font-semibold text-green-900">Cinematic Sequence Generated</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-800">Total Shots:</span>
                    <span className="ml-2 text-green-700">{generatedScene.shots.length}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Duration:</span>
                    <span className="ml-2 text-green-700">{generatedScene.duration}s</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Mood:</span>
                    <span className="ml-2 text-green-700 capitalize">{generatedScene.overallMood}</span>
                  </div>
                </div>
              </div>

              {/* Shot Sequence */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Shot Sequence</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className={`px-3 py-1 rounded text-sm ${previewMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      <EyeIcon className="h-4 w-4 inline mr-1" />
                      Preview
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedScene.shots.map((shot, index) => (
                    <div
                      key={shot.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedShot?.id === shot.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedShot(shot)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{shot.name}</h4>
                        <span className="text-sm text-gray-500">{shot.duration.toFixed(1)}s</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{shot.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CameraIcon className="h-4 w-4" />
                          <span className="capitalize">{shot.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <LightBulbIcon className="h-4 w-4" />
                          <span className="capitalize">{shot.mood}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FilmIcon className="h-4 w-4" />
                          <span className="capitalize">{shot.camera.movement.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shot Details */}
              {selectedShot && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{selectedShot.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Camera Settings</h5>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Position:</span> ({selectedShot.camera.position.x}, {selectedShot.camera.position.y}, {selectedShot.camera.position.z})</div>
                        <div><span className="font-medium">Rotation:</span> ({selectedShot.camera.rotation.x}°, {selectedShot.camera.rotation.y}°, {selectedShot.camera.rotation.z}°)</div>
                        <div><span className="font-medium">FOV:</span> {selectedShot.camera.fov}°</div>
                        <div><span className="font-medium">Movement:</span> {selectedShot.camera.movement.type}</div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Lighting Setup</h5>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Key Light:</span> {selectedShot.lighting.keyLight.intensity} intensity</div>
                        <div><span className="font-medium">Fill Light:</span> {selectedShot.lighting.fillLight.intensity} intensity</div>
                        <div><span className="font-medium">Rim Light:</span> {selectedShot.lighting.rimLight.intensity} intensity</div>
                        <div><span className="font-medium">Mood:</span> {selectedShot.mood}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {generatedScene ? 'Ready to apply to your project' : 'AI will analyze your brief and create optimal shots'}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            {generatedScene && (
              <button
                onClick={() => {
                  onSceneGenerated(generatedScene);
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
              >
                Apply to Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISceneDirector;
