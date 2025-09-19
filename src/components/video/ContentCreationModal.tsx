import React, { useState, useEffect } from 'react';
import {
  XIcon,
  SparklesIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ShareIcon,
  MailIcon,
  NewspaperIcon,
  ClockIcon,
  UserGroupIcon,
  TagIcon,
  HashtagIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationIcon,
  PlayIcon,
  FilmIcon,
  UserIcon,
  FolderIcon,
  CogIcon,
  ColorSwatchIcon,
  ChartBarIcon,
  LightBulbIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  MicrophoneIcon,
  CameraIcon,
  PaintBrushIcon,
  ScissorsIcon,
  BookOpenIcon,
  FireIcon,
  StarIcon,
  HeartIcon,
  ThumbUpIcon,
  ChatIcon,
  CalendarIcon,
  ArrowRightIcon,
  DownloadIcon,
  UploadIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  PencilIcon,
  DuplicateIcon,
  LinkIcon,
  ClipboardListIcon,
  SearchIcon,
  FunnelIcon,
  Bars3Icon,
  Squares2X2Icon,
  ListBulletIcon,
  SpeakerWaveIcon,
  VolumeUpIcon,
  VolumeOffIcon,
  ForwardIcon,
  BackwardIcon,
  StopIcon,
  PauseIcon,
  RefreshIcon,
  CloudIcon,
  KeyIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  CheckIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ArrowUpLeftIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  BellIcon,
  BookmarkIcon,
  BriefcaseIcon,
  OfficeBuildingIcon,
  BuildingIcon,
  ChipIcon,
  ServerIcon,
  DatabaseIcon,
  TemplateIcon,
  AdjustmentsIcon,
  BeakerIcon
} from '@heroicons/react/outline';
import CharacterCreator from './CharacterCreator';
import AdvancedVideoEditor from './AdvancedVideoEditor';
import AssetLibrary from './AssetLibrary';
import CGIVideoEngine from './CGIVideoEngine';
import AISceneDirector from './AISceneDirector';
import PostProductionSuite from './PostProductionSuite';

interface ContentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'video' | 'social' | 'blog' | 'email' | 'newsletter';
  onContentCreated: (content: any) => void;
}

interface ContentFormData {
  title: string;
  description: string;
  topic: string;
  platform?: string;
  contentLength: 'short' | 'medium' | 'long';
  style: 'professional' | 'casual' | 'educational' | 'promotional' | 'cinematic' | 'documentary' | 'commercial' | 'social';
  targetAudience: string;
  keywords: string[];
  hashtags: string[];
  brandVoice: string;
  callToAction: string;
  aiPersona: string;
  tone: 'friendly' | 'authoritative' | 'conversational' | 'technical' | 'emotional' | 'humorous';
  complexity: 'simple' | 'intermediate' | 'advanced' | 'expert';
  industry: string;
  competitorAnalysis: boolean;
  seoOptimized: boolean;
  viralPotential: boolean;
  engagementPrediction: number;
  estimatedReach: number;
  budget: number;
  timeline: string;
  deliverables: string[];
  customInstructions: string;
  brandGuidelines: string;
  complianceRequirements: string[];
}

const ContentCreationModal: React.FC<ContentCreationModalProps> = ({
  isOpen,
  onClose,
  contentType,
  onContentCreated
}) => {
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    topic: '',
    platform: '',
    contentLength: 'medium',
    style: 'professional',
    targetAudience: 'transportation professionals',
    keywords: [],
    hashtags: [],
    brandVoice: 'professional and authoritative',
    callToAction: '',
    aiPersona: 'creative_director',
    tone: 'friendly',
    complexity: 'intermediate',
    industry: 'transportation',
    competitorAnalysis: false,
    seoOptimized: true,
    viralPotential: false,
    engagementPrediction: 75,
    estimatedReach: 10000,
    budget: 1000,
    timeline: '1 week',
    deliverables: [],
    customInstructions: '',
    brandGuidelines: '',
    complianceRequirements: []
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [aiPersonas] = useState([
    { id: 'creative_director', name: 'Creative Director', description: 'Cinematic storytelling expert', icon: FilmIcon },
    { id: 'marketing_guru', name: 'Marketing Guru', description: 'Viral content specialist', icon: ArrowUpIcon },
    { id: 'technical_writer', name: 'Technical Writer', description: 'Educational content expert', icon: AcademicCapIcon },
    { id: 'brand_strategist', name: 'Brand Strategist', description: 'Brand voice specialist', icon: StarIcon },
    { id: 'social_media_expert', name: 'Social Media Expert', description: 'Platform optimization expert', icon: ShareIcon },
    { id: 'seo_specialist', name: 'SEO Specialist', description: 'Search optimization expert', icon: SearchIcon }
  ]);
  const [showCharacterCreator, setShowCharacterCreator] = useState(false);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [showCGIEngine, setShowCGIEngine] = useState(false);
  const [showSceneDirector, setShowSceneDirector] = useState(false);
  const [showPostProduction, setShowPostProduction] = useState(false);
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [generatedScene, setGeneratedScene] = useState<any>(null);

  const platforms = {
    social: ['Instagram', 'TikTok', 'LinkedIn', 'Twitter', 'Facebook', 'YouTube Shorts'],
    video: ['YouTube', 'Instagram Reels', 'TikTok', 'LinkedIn Video', 'Facebook Video'],
    blog: ['Company Blog', 'Industry Blog', 'Guest Post'],
    email: ['Newsletter', 'Promotional', 'Educational', 'Announcement'],
    newsletter: ['Weekly', 'Monthly', 'Quarterly', 'Special Edition']
  };

  const transportationTopics = [
    'ELD Compliance and HOS Regulations',
    'Fleet Management Best Practices',
    'Driver Safety and Training',
    'IFTA Reporting and Fuel Tax',
    'Transportation Technology Trends',
    'Supply Chain Optimization',
    'DOT Regulations and Compliance',
    'Fleet Maintenance and Efficiency',
    'Transportation Industry News',
    'Customer Success Stories',
    'New Service Announcements',
    'Industry Events and Conferences'
  ];

  const targetAudiences = [
    'Fleet Managers',
    'Transportation Companies',
    'Truck Drivers',
    'Logistics Professionals',
    'Compliance Officers',
    'Safety Managers',
    'Operations Directors',
    'Business Owners',
    'Industry Partners',
    'Potential Clients'
  ];

  const brandVoices = [
    'Professional and Authoritative',
    'Friendly and Approachable',
    'Educational and Informative',
    'Innovative and Forward-thinking',
    'Reliable and Trustworthy',
    'Expert and Knowledgeable'
  ];

  const callToActions = [
    'Learn more about our services',
    'Contact us for a consultation',
    'Download our free guide',
    'Schedule a demo',
    'Join our newsletter',
    'Follow us for updates',
    'Get a free quote',
    'Book a meeting'
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setGeneratedContent(null);
      setError(null);
      setFormData({
        title: '',
        description: '',
        topic: '',
        platform: platforms[contentType]?.[0] || '',
        contentLength: 'medium',
        style: 'professional',
        targetAudience: 'transportation professionals',
        keywords: [],
        hashtags: [],
        brandVoice: 'professional and authoritative',
        callToAction: ''
      });
    }
  }, [isOpen, contentType]);

  const handleInputChange = (field: keyof ContentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !formData.keywords.includes(keyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addHashtag = (hashtag: string) => {
    const cleanHashtag = hashtag.replace('#', '').trim();
    if (cleanHashtag && !formData.hashtags.includes(cleanHashtag)) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, cleanHashtag]
      }));
    }
  };

  const removeHashtag = (hashtag: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag)
    }));
  };

  const generateContent = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Build comprehensive prompt with all advanced features
      let enhancedPrompt = formData.topic;
      
      if (formData.customInstructions) {
        enhancedPrompt += `\n\nCustom Instructions: ${formData.customInstructions}`;
      }
      
      if (formData.brandGuidelines) {
        enhancedPrompt += `\n\nBrand Guidelines: ${formData.brandGuidelines}`;
      }

      const requestData = {
        type: contentType === 'social' ? 'social_media' : contentType,
        prompt: enhancedPrompt,
        platform: formData.platform,
        content_type: contentType,
        length: formData.contentLength,
        style: formData.style,
        target_audience: formData.targetAudience,
        keywords: formData.keywords,
        hashtags: formData.hashtags,
        ai_persona: formData.aiPersona,
        tone: formData.tone,
        complexity: formData.complexity,
        industry: formData.industry,
        competitor_analysis: formData.competitorAnalysis,
        seo_optimized: formData.seoOptimized,
        viral_potential: formData.viralPotential,
        engagement_prediction: formData.engagementPrediction,
        estimated_reach: formData.estimatedReach,
        budget: formData.budget,
        timeline: formData.timeline,
        deliverables: formData.deliverables,
        compliance_requirements: formData.complianceRequirements
      };

      console.log('Generating content with advanced parameters:', requestData);

      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data);
        setCurrentStep(3);
        
        // Log success metrics
        console.log('Content generated successfully:', {
          type: contentType,
          persona: formData.aiPersona,
          engagement_prediction: formData.engagementPrediction,
          estimated_reach: formData.estimatedReach
        });
      } else {
        setError(data.error || 'Failed to generate content');
      }
    } catch (error) {
      setError('An error occurred while generating content');
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveContent = async () => {
    try {
      const contentData = {
        ...formData,
        generatedContent: generatedContent.content,
        type: contentType,
        created_at: new Date().toISOString()
      };

      // Save to appropriate table based on content type
      let endpoint = '';
      switch (contentType) {
        case 'social':
          endpoint = '/api/social/posts';
          break;
        case 'blog':
          endpoint = '/api/blog/articles';
          break;
        case 'video':
          endpoint = '/api/video/projects';
          break;
        default:
          endpoint = '/api/content/templates';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contentData)
      });

      const data = await response.json();

      if (data.success) {
        onContentCreated(data);
        onClose();
      } else {
        setError(data.error || 'Failed to save content');
      }
    } catch (error) {
      setError('An error occurred while saving content');
      console.error('Error saving content:', error);
    }
  };

  const getContentTypeIcon = () => {
    switch (contentType) {
      case 'video':
        return <VideoCameraIcon className="h-6 w-6" />;
      case 'social':
        return <ShareIcon className="h-6 w-6" />;
      case 'blog':
        return <DocumentTextIcon className="h-6 w-6" />;
      case 'email':
        return <MailIcon className="h-6 w-6" />;
      case 'newsletter':
        return <NewspaperIcon className="h-6 w-6" />;
      default:
        return <SparklesIcon className="h-6 w-6" />;
    }
  };

  const getContentTypeTitle = () => {
    switch (contentType) {
      case 'video':
        return 'Video Project';
      case 'social':
        return 'Social Media Post';
      case 'blog':
        return 'Blog Article';
      case 'email':
        return 'Email Campaign';
      case 'newsletter':
        return 'Newsletter';
      default:
        return 'Content';
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topic/Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your content topic or title..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe what you want to create..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topic Category
        </label>
        <select
          value={formData.topic}
          onChange={(e) => handleInputChange('topic', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a topic...</option>
          {transportationTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      {platforms[contentType] && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform
          </label>
          <select
            value={formData.platform}
            onChange={(e) => handleInputChange('platform', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {platforms[contentType].map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* AI Persona Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Content Creator Persona
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {aiPersonas.map((persona) => {
            const IconComponent = persona.icon;
            return (
              <button
                key={persona.id}
                onClick={() => handleInputChange('aiPersona', persona.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  formData.aiPersona === persona.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <IconComponent className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-sm">{persona.name}</span>
                </div>
                <p className="text-xs text-gray-600">{persona.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <div className="border-t pt-4">
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <CogIcon className="h-5 w-5" />
          <span className="font-medium">
            {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
          </span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Advanced Options Panel */}
      {showAdvancedOptions && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <LightBulbIcon className="h-6 w-6 text-yellow-600 mr-2" />
            Advanced Content Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tone and Complexity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Tone
              </label>
              <select
                value={formData.tone}
                onChange={(e) => handleInputChange('tone', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="friendly">Friendly</option>
                <option value="authoritative">Authoritative</option>
                <option value="conversational">Conversational</option>
                <option value="technical">Technical</option>
                <option value="emotional">Emotional</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Complexity
              </label>
              <select
                value={formData.complexity}
                onChange={(e) => handleInputChange('complexity', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="simple">Simple</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            {/* Performance Predictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engagement Prediction: {formData.engagementPrediction}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.engagementPrediction}
                onChange={(e) => handleInputChange('engagementPrediction', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Reach: {formData.estimatedReach.toLocaleString()}
              </label>
              <input
                type="range"
                min="1000"
                max="1000000"
                step="1000"
                value={formData.estimatedReach}
                onChange={(e) => handleInputChange('estimatedReach', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Budget and Timeline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline
              </label>
              <select
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1 day">1 Day</option>
                <option value="3 days">3 Days</option>
                <option value="1 week">1 Week</option>
                <option value="2 weeks">2 Weeks</option>
                <option value="1 month">1 Month</option>
              </select>
            </div>
          </div>

          {/* Custom Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Instructions
            </label>
            <textarea
              value={formData.customInstructions}
              onChange={(e) => handleInputChange('customInstructions', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add specific instructions for the AI content creator..."
            />
          </div>

          {/* Brand Guidelines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Guidelines
            </label>
            <textarea
              value={formData.brandGuidelines}
              onChange={(e) => handleInputChange('brandGuidelines', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Include brand voice, style, and compliance requirements..."
            />
          </div>

          {/* Feature Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.competitorAnalysis}
                onChange={(e) => handleInputChange('competitorAnalysis', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Competitor Analysis</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.seoOptimized}
                onChange={(e) => handleInputChange('seoOptimized', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">SEO Optimized</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.viralPotential}
                onChange={(e) => handleInputChange('viralPotential', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Viral Potential</span>
            </label>
          </div>
        </div>
      )}

      {/* Advanced Video Tools */}
      {contentType === 'video' && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FilmIcon className="h-6 w-6 text-purple-600 mr-2" />
            Advanced Video Creation Tools
          </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => setShowCharacterCreator(true)}
                className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 flex flex-col items-center space-y-2"
              >
                <UserIcon className="h-8 w-8" />
                <span className="font-medium">Create Characters</span>
                <span className="text-sm opacity-90">Design AI characters for your videos</span>
              </button>
              <button
                onClick={() => setShowAssetLibrary(true)}
                className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 flex flex-col items-center space-y-2"
              >
                <FolderIcon className="h-8 w-8" />
                <span className="font-medium">Asset Library</span>
                <span className="text-sm opacity-90">Browse backgrounds, props & media</span>
              </button>
              <button
                onClick={() => setShowVideoEditor(true)}
                className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 flex flex-col items-center space-y-2"
              >
                <CogIcon className="h-8 w-8" />
                <span className="font-medium">Video Editor</span>
                <span className="text-sm opacity-90">Professional timeline editor</span>
              </button>
              <button
                onClick={() => setShowCGIEngine(true)}
                className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 flex flex-col items-center space-y-2"
              >
                <SparklesIcon className="h-8 w-8" />
                <span className="font-medium">3D CGI Engine</span>
                <span className="text-sm opacity-90">Cinema-quality 3D rendering</span>
              </button>
              <button
                onClick={() => setShowSceneDirector(true)}
                className="bg-pink-600 text-white p-4 rounded-lg hover:bg-pink-700 flex flex-col items-center space-y-2"
              >
                <FilmIcon className="h-8 w-8" />
                <span className="font-medium">AI Scene Director</span>
                <span className="text-sm opacity-90">Automatic shot composition</span>
              </button>
              <button
                onClick={() => setShowPostProduction(true)}
                className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 flex flex-col items-center space-y-2"
              >
                <ColorSwatchIcon className="h-8 w-8" />
                <span className="font-medium">Post-Production</span>
                <span className="text-sm opacity-90">Color grading & VFX</span>
              </button>
            </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Length
          </label>
          <select
            value={formData.contentLength}
            onChange={(e) => handleInputChange('contentLength', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Style
          </label>
          <select
            value={formData.style}
            onChange={(e) => handleInputChange('style', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="educational">Educational</option>
            <option value="promotional">Promotional</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Audience
        </label>
        <select
          value={formData.targetAudience}
          onChange={(e) => handleInputChange('targetAudience', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {targetAudiences.map((audience) => (
            <option key={audience} value={audience}>
              {audience}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brand Voice
        </label>
        <select
          value={formData.brandVoice}
          onChange={(e) => handleInputChange('brandVoice', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {brandVoices.map((voice) => (
            <option key={voice} value={voice}>
              {voice}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Keywords
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.keywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {keyword}
              <button
                onClick={() => removeKeyword(keyword)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add keywords..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addKeyword(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hashtags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.hashtags.map((hashtag) => (
            <span
              key={hashtag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              #{hashtag}
              <button
                onClick={() => removeHashtag(hashtag)}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add hashtags..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addHashtag(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Call to Action
        </label>
        <select
          value={formData.callToAction}
          onChange={(e) => handleInputChange('callToAction', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a call to action...</option>
          {callToActions.map((cta) => (
            <option key={cta} value={cta}>
              {cta}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {isGenerating ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your content...</p>
        </div>
      ) : generatedContent ? (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-800 font-medium">Content generated successfully!</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Content</h3>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {generatedContent.content}
              </pre>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Back to Edit
            </button>
            <button
              onClick={saveContent}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Save Content
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <SparklesIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Generate</h3>
          <p className="text-gray-600 mb-6">
            Review your settings and click generate to create your {getContentTypeTitle().toLowerCase()}.
          </p>
          <button
            onClick={generateContent}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <SparklesIcon className="h-5 w-5" />
            <span>Generate Content</span>
          </button>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getContentTypeIcon()}
            <h2 className="text-xl font-semibold text-gray-900">
              Create {getContentTypeTitle()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <ExclamationIcon className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation Buttons */}
        {currentStep < 3 && !isGenerating && (
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Character Creator Modal */}
      <CharacterCreator
        isOpen={showCharacterCreator}
        onClose={() => setShowCharacterCreator(false)}
        onCharacterCreated={(character) => {
          setCharacters(prev => [...prev, character]);
          setShowCharacterCreator(false);
        }}
      />

      {/* Asset Library Modal */}
      <AssetLibrary
        isOpen={showAssetLibrary}
        onClose={() => setShowAssetLibrary(false)}
        onAssetSelect={(asset) => {
          setSelectedAssets(prev => [...prev, asset]);
        }}
        selectedAssets={selectedAssets}
      />

      {/* Advanced Video Editor Modal */}
      {showVideoEditor && currentProject && (
        <AdvancedVideoEditor
          project={currentProject}
          onProjectUpdate={setCurrentProject}
          onClose={() => setShowVideoEditor(false)}
        />
      )}

      {/* 3D CGI Engine Modal */}
      {showCGIEngine && currentProject && (
        <CGIVideoEngine
          project={currentProject}
          onProjectUpdate={setCurrentProject}
          onClose={() => setShowCGIEngine(false)}
        />
      )}

      {/* AI Scene Director Modal */}
      <AISceneDirector
        isOpen={showSceneDirector}
        onClose={() => setShowSceneDirector(false)}
        onSceneGenerated={(scene) => {
          setGeneratedScene(scene);
          setShowSceneDirector(false);
        }}
        projectBrief={{
          title: formData.title || 'Untitled Project',
          description: formData.description || 'A professional video project',
          targetAudience: formData.targetAudience || 'transportation professionals',
          duration: 30,
          style: formData.style || 'professional',
          message: formData.topic || 'Transportation services'
        }}
      />

      {/* Post-Production Suite Modal */}
      {showPostProduction && currentProject && (
        <PostProductionSuite
          isOpen={showPostProduction}
          onClose={() => setShowPostProduction(false)}
          onExport={(settings) => {
            console.log('Exporting with settings:', settings);
            setShowPostProduction(false);
          }}
          project={currentProject}
        />
      )}
    </div>
  );
};

export default ContentCreationModal;
