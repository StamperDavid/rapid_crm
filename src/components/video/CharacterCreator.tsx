import React, { useState, useEffect } from 'react';
import {
  UserIcon, PlusIcon, XIcon, PhotographIcon, SparklesIcon, 
  EyeIcon, PaintBrushIcon, CogIcon, SaveIcon, TrashIcon,
  DownloadIcon, UploadIcon, EmojiHappyIcon, UserGroupIcon
} from '@heroicons/react/outline';

interface Character {
  id: string;
  name: string;
  description: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary';
  ethnicity: string;
  personality: string[];
  voice: {
    type: string;
    pitch: number;
    speed: number;
    accent: string;
  };
  appearance: {
    hairColor: string;
    eyeColor: string;
    skinTone: string;
    bodyType: string;
    clothing: string;
    accessories: string[];
  };
  aiGenerated: boolean;
  avatarUrl?: string;
  createdAt: string;
}

interface CharacterCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterCreated: (character: Character) => void;
  existingCharacter?: Character;
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  isOpen,
  onClose,
  onCharacterCreated,
  existingCharacter
}) => {
  const [character, setCharacter] = useState<Character>({
    id: existingCharacter?.id || `char_${Date.now()}`,
    name: existingCharacter?.name || '',
    description: existingCharacter?.description || '',
    age: existingCharacter?.age || 25,
    gender: existingCharacter?.gender || 'male',
    ethnicity: existingCharacter?.ethnicity || 'Caucasian',
    personality: existingCharacter?.personality || [],
    voice: existingCharacter?.voice || {
      type: 'professional',
      pitch: 0.5,
      speed: 1.0,
      accent: 'american'
    },
    appearance: existingCharacter?.appearance || {
      hairColor: 'brown',
      eyeColor: 'brown',
      skinTone: 'medium',
      bodyType: 'average',
      clothing: 'business casual',
      accessories: []
    },
    aiGenerated: false,
    avatarUrl: existingCharacter?.avatarUrl,
    createdAt: existingCharacter?.createdAt || new Date().toISOString()
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const personalityTraits = [
    'Professional', 'Friendly', 'Authoritative', 'Approachable', 'Confident',
    'Knowledgeable', 'Enthusiastic', 'Calm', 'Energetic', 'Trustworthy',
    'Expert', 'Reliable', 'Innovative', 'Traditional', 'Modern'
  ];

  const voiceTypes = [
    'Professional', 'Casual', 'Authoritative', 'Friendly', 'Narrator',
    'Educational', 'Commercial', 'Documentary', 'News', 'Podcast'
  ];

  const accents = [
    'American', 'British', 'Australian', 'Canadian', 'Irish', 'Scottish',
    'Southern', 'Midwestern', 'New York', 'California', 'Neutral'
  ];

  const handlePersonalityToggle = (trait: string) => {
    setCharacter(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(p => p !== trait)
        : [...prev.personality, trait]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAIAvatar = async () => {
    setIsGenerating(true);
    try {
      // This would call an AI image generation service
      const response = await fetch('/api/ai/generate-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: character,
          style: 'professional',
          quality: 'high'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCharacter(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
      }
    } catch (error) {
      console.error('Error generating avatar:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAvatarFromPhoto = async () => {
    if (!uploadedImage) return;
    
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('character', JSON.stringify(character));
      formData.append('style', 'lifelike');
      formData.append('quality', 'cinema');

      const response = await fetch('/api/ai/generate-avatar-from-photo', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCharacter(prev => ({ 
          ...prev, 
          avatarUrl: data.avatarUrl,
          aiGenerated: true 
        }));
        alert('Lifelike avatar generated successfully!');
      } else {
        throw new Error('Failed to generate avatar');
      }
    } catch (error) {
      console.error('Error generating avatar from photo:', error);
      alert('Error generating avatar. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const createLifelikeCharacter = async () => {
    if (!uploadedImage) {
      alert('Please upload a photo first');
      return;
    }
    
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('character', JSON.stringify(character));
      formData.append('type', 'lifelike');
      formData.append('enhancement', 'cinema_quality');

      const response = await fetch('/api/ai/create-lifelike-character', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCharacter(prev => ({ 
          ...prev, 
          avatarUrl: data.characterUrl,
          aiGenerated: true 
        }));
        alert('Lifelike character created successfully! Ready for video production.');
      } else {
        throw new Error('Failed to create lifelike character');
      }
    } catch (error) {
      console.error('Error creating lifelike character:', error);
      alert('Error creating lifelike character. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    onCharacterCreated(character);
    onClose();
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: UserIcon },
    { id: 'appearance', name: 'Appearance', icon: EmojiHappyIcon },
    { id: 'voice', name: 'Voice', icon: SparklesIcon },
    { id: 'personality', name: 'Personality', icon: UserGroupIcon },
    { id: 'preview', name: 'Preview', icon: EyeIcon }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {existingCharacter ? 'Edit Character' : 'Create New Character'}
              </h2>
              <p className="text-sm text-gray-500">
                Design characters for your video content
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-6 w-6" />
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
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Character Name
                  </label>
                  <input
                    type="text"
                    value={character.name}
                    onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter character name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={character.age}
                    onChange={(e) => setCharacter(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    min="18"
                    max="80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={character.description}
                  onChange={(e) => setCharacter(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the character's role, background, and purpose..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={character.gender}
                    onChange={(e) => setCharacter(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ethnicity
                  </label>
                  <input
                    type="text"
                    value={character.ethnicity}
                    onChange={(e) => setCharacter(prev => ({ ...prev, ethnicity: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Caucasian, African American, Asian..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hair Color
                  </label>
                  <select
                    value={character.appearance.hairColor}
                    onChange={(e) => setCharacter(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, hairColor: e.target.value }
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="black">Black</option>
                    <option value="brown">Brown</option>
                    <option value="blonde">Blonde</option>
                    <option value="red">Red</option>
                    <option value="gray">Gray</option>
                    <option value="white">White</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eye Color
                  </label>
                  <select
                    value={character.appearance.eyeColor}
                    onChange={(e) => setCharacter(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, eyeColor: e.target.value }
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="brown">Brown</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="hazel">Hazel</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skin Tone
                  </label>
                  <select
                    value={character.appearance.skinTone}
                    onChange={(e) => setCharacter(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, skinTone: e.target.value }
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="olive">Olive</option>
                    <option value="tan">Tan</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Type
                  </label>
                  <select
                    value={character.appearance.bodyType}
                    onChange={(e) => setCharacter(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, bodyType: e.target.value }
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="slim">Slim</option>
                    <option value="average">Average</option>
                    <option value="athletic">Athletic</option>
                    <option value="stocky">Stocky</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clothing Style
                </label>
                <input
                  type="text"
                  value={character.appearance.clothing}
                  onChange={(e) => setCharacter(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, clothing: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., business casual, formal, casual, uniform..."
                />
              </div>

              {/* Photo Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <UploadIcon className="h-12 w-12 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Upload Your Photo
                  </span>
                  <span className="text-xs text-gray-500">
                    JPG, PNG, or WEBP (Max 10MB)
                  </span>
                </label>
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Photo</h4>
                  <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Uploaded photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Character Generation Options */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Character Generation Options</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={generateAIAvatar}
                    disabled={isGenerating}
                    className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <SparklesIcon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Generate AI Avatar</div>
                      <div className="text-xs opacity-90">Create from description</div>
                    </div>
                  </button>

                  <button
                    onClick={generateAvatarFromPhoto}
                    disabled={isGenerating || !uploadedImage}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <PhotographIcon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Avatar from Photo</div>
                      <div className="text-xs opacity-90">Transform your photo</div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={createLifelikeCharacter}
                  disabled={isGenerating || !uploadedImage}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  <SparklesIcon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-bold text-lg">Create Lifelike Character</div>
                    <div className="text-sm opacity-90">Cinema-quality AI character from your photo</div>
                  </div>
                </button>
              </div>

              {character.avatarUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Character Avatar
                  </label>
                  <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={character.avatarUrl}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Type
                  </label>
                  <select
                    value={character.voice.type}
                    onChange={(e) => setCharacter(prev => ({
                      ...prev,
                      voice: { ...prev.voice, type: e.target.value }
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {voiceTypes.map(type => (
                      <option key={type} value={type.toLowerCase()}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent
                  </label>
                  <select
                    value={character.voice.accent}
                    onChange={(e) => setCharacter(prev => ({
                      ...prev,
                      voice: { ...prev.voice, accent: e.target.value }
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {accents.map(accent => (
                      <option key={accent} value={accent.toLowerCase()}>{accent}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pitch: {character.voice.pitch}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={character.voice.pitch}
                    onChange={(e) => setCharacter(prev => ({
                      ...prev,
                      voice: { ...prev.voice, pitch: parseFloat(e.target.value) }
                    }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speed: {character.voice.speed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={character.voice.speed}
                    onChange={(e) => setCharacter(prev => ({
                      ...prev,
                      voice: { ...prev.voice, speed: parseFloat(e.target.value) }
                    }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Voice Preview</h4>
                <p className="text-sm text-blue-700 mb-3">
                  "Hello, I'm {character.name}. This is how I sound with the current voice settings."
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <SparklesIcon className="h-5 w-5" />
                  <span>Generate Voice Sample</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'personality' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Personality Traits
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {personalityTraits.map(trait => (
                    <button
                      key={trait}
                      onClick={() => handlePersonalityToggle(trait)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        character.personality.includes(trait)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>

              {character.personality.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Traits
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {character.personality.map(trait => (
                      <span
                        key={trait}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Character Preview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {character.name}</p>
                      <p><span className="font-medium">Age:</span> {character.age}</p>
                      <p><span className="font-medium">Gender:</span> {character.gender}</p>
                      <p><span className="font-medium">Ethnicity:</span> {character.ethnicity}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Appearance</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Hair:</span> {character.appearance.hairColor}</p>
                      <p><span className="font-medium">Eyes:</span> {character.appearance.eyeColor}</p>
                      <p><span className="font-medium">Skin:</span> {character.appearance.skinTone}</p>
                      <p><span className="font-medium">Style:</span> {character.appearance.clothing}</p>
                    </div>
                  </div>
                </div>

                {character.description && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{character.description}</p>
                  </div>
                )}

                {character.personality.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Personality</h4>
                    <div className="flex flex-wrap gap-2">
                      {character.personality.map(trait => (
                        <span
                          key={trait}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2"
            >
              <EyeIcon className="h-5 w-5" />
              <span>{previewMode ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <SaveIcon className="h-5 w-5" />
              <span>{existingCharacter ? 'Update Character' : 'Create Character'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreator;
