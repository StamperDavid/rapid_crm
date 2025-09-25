import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PlusIcon,
  FilmIcon,
  DocumentTextIcon,
  ShareIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  VideoCameraIcon,
  PhotographIcon,
  PencilIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  XCircleIcon,
  SparklesIcon,
  UserIcon
} from '@heroicons/react/outline';
import ContentCreationModal from '../components/video/ContentCreationModal';
import AIVideoGenerationEngine from '../components/video/AIVideoGenerationEngine';
import CharacterCreator from '../components/video/CharacterCreator';

interface VideoProject {
  id: string;
  name: string;
  description: string;
  project_type: string;
  duration: number;
  resolution: string;
  aspect_ratio: string;
  style: string;
  status: string;
  created_at: string;
  updated_at: string;
  file_path?: string;
  thumbnail_path?: string;
}

interface SocialPost {
  id: string;
  content_type: string;
  platform: string;
  content: string;
  media_path?: string;
  status: string;
  scheduled_at?: string;
  created_at: string;
}

interface BlogArticle {
  id: string;
  title: string;
  content: string;
  status: string;
  published_at?: string;
  created_at: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  template_type: string;
  category: string;
}

const VideoProductionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [blogArticles, setBlogArticles] = useState<BlogArticle[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectType, setNewProjectType] = useState('');
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentModalType, setContentModalType] = useState<'video' | 'social' | 'blog' | 'email' | 'newsletter'>('video');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoProject | null>(null);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [showCharacterCreator, setShowCharacterCreator] = useState(false);
  const [showAIVideoEngine, setShowAIVideoEngine] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Only load video projects for now (other endpoints don't exist yet)
      const projectsRes = await fetch('http://localhost:3001/api/video/projects');
      const projectsData = await projectsRes.json();

      if (projectsData.success) {
        setProjects(projectsData.projects);
      }

      // Set empty arrays for other data types until their APIs are implemented
      setSocialPosts([]);
      setBlogArticles([]);
      setTemplates([]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty arrays on error
      setProjects([]);
      setSocialPosts([]);
      setBlogArticles([]);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'generating':
      case 'rendering':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
      case 'rendering':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCreateContent = (type: 'video' | 'social' | 'blog' | 'email' | 'newsletter') => {
    setContentModalType(type);
    setShowContentModal(true);
  };

  const handleContentCreated = (content: any) => {
    // Reload the appropriate data based on content type
    loadDashboardData();
    setShowContentModal(false);
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item, type });
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      let endpoint = '';
      switch (type) {
        case 'video':
          endpoint = `/api/video/project/${id}`;
          break;
        case 'social':
          endpoint = `/api/social/posts/${id}`;
          break;
        case 'blog':
          endpoint = `/api/blog/articles/${id}`;
          break;
        case 'template':
          endpoint = `/api/content/templates/${id}`;
          break;
      }
      
      const response = await fetch(endpoint, { method: 'DELETE' });
      if (response.ok) {
        loadDashboardData();
        alert('Item deleted successfully!');
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  const handleUseTemplate = (template: ContentTemplate) => {
    // Open content creation modal with template data
    setContentModalType('social'); // Default to social media
    setShowContentModal(true);
    // You could pass template data to the modal here
  };

  const handleViewVideo = (video: VideoProject) => {
    setSelectedVideo(video);
    setShowVideoPlayer(true);
  };

  const handleEditVideo = (video: VideoProject) => {
    setSelectedVideo(video);
    setShowVideoEditor(true);
  };

  const handleUploadVideo = () => {
    // TODO: Implement video upload functionality
    alert('Video upload functionality coming soon!');
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'videos', name: 'Video Projects', icon: VideoCameraIcon },
    { id: 'social', name: 'Social Media', icon: ShareIcon },
    { id: 'blog', name: 'Blog Articles', icon: DocumentTextIcon },
    { id: 'templates', name: 'Templates', icon: FilmIcon },
    { id: 'calendar', name: 'Content Calendar', icon: CalendarIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <VideoCameraIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 ">Video Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white ">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShareIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 ">Social Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white ">{socialPosts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 ">Blog Articles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white ">{blogArticles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FilmIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 ">Templates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white ">{templates.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 ">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white ">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center space-x-4">
                {getStatusIcon(project.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white ">{project.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">
                    {project.project_type} • {formatDuration(project.duration)} • {project.resolution}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVideoProjects = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white ">Video Projects</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAIVideoEngine(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center space-x-2"
          >
            <SparklesIcon className="h-5 w-5" />
            <span>AI Video Generator</span>
          </button>
          <button
            onClick={() => setShowCharacterCreator(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <UserIcon className="h-5 w-5" />
            <span>Create Character</span>
          </button>
          <button
            onClick={handleUploadVideo}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <VideoCameraIcon className="h-5 w-5" />
            <span>Upload Video</span>
          </button>
          <button
            onClick={() => handleCreateContent('video')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Video Project</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {project.thumbnail_path && (
              <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <img
                  src={`http://localhost:3001${project.thumbnail_path}`}
                  alt={project.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ">{project.name}</h3>
                {getStatusIcon(project.status)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300  mb-4">{project.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 mb-4">
                <span>{project.project_type}</span>
                <span>{formatDuration(project.duration)}</span>
                <span>{project.resolution}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewVideo(project)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    <PlayIcon className="h-4 w-4 inline mr-1" />
                    View
                  </button>
                  <button 
                    onClick={() => handleEditVideo(project)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <PencilIcon className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id, 'video')}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSocialMedia = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Social Media Posts</h2>
        <button
          onClick={() => handleCreateContent('social')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Post</span>
        </button>
      </div>

      <div className="space-y-4">
        {socialPosts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {post.content_type === 'video' ? (
                    <VideoCameraIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <PhotographIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{post.platform}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{post.content_type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                {post.status}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{post.content}</p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                {post.scheduled_at && (
                  <span className="ml-4">Scheduled: {new Date(post.scheduled_at).toLocaleDateString()}</span>
                )}
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(post, 'social')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(post.id, 'social')}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBlogArticles = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Articles</h2>
        <button
          onClick={() => handleCreateContent('blog')}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Article</span>
        </button>
      </div>

      <div className="space-y-4">
        {blogArticles.map((article) => (
          <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{article.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(article.status)}`}>
                {article.status}
              </span>
            </div>
            <p className="text-gray-700 mb-4 line-clamp-3">{article.content}</p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span>Created: {new Date(article.created_at).toLocaleDateString()}</span>
                {article.published_at && (
                  <span className="ml-4">Published: {new Date(article.published_at).toLocaleDateString()}</span>
                )}
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(article, 'blog')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(article.id, 'blog')}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Templates</h2>
        <button
          onClick={() => {
            setNewProjectType('template');
            setShowCreateModal(true);
          }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FilmIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{template.template_type}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{template.description}</p>
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                {template.category}
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleUseTemplate(template)}
                  className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                >
                  Use Template
                </button>
                <button 
                  onClick={() => handleEdit(template, 'template')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(template.id, 'template')}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'videos':
        return renderVideoProjects();
      case 'social':
        return renderSocialMedia();
      case 'blog':
        return renderBlogArticles();
      case 'templates':
        return renderTemplates();
      case 'calendar':
        return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Content Calendar coming soon...</div>;
      case 'analytics':
        return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Analytics coming soon...</div>;
      case 'settings':
        return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Settings coming soon...</div>;
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white">
            Video Production & Content Marketing
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 dark:text-gray-300">
            Create professional videos, manage social media content, and publish blog articles
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
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
        {renderContent()}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Create New {newProjectType === 'video' ? 'Video Project' : 
                           newProjectType === 'social' ? 'Social Media Post' :
                           newProjectType === 'blog' ? 'Blog Article' : 'Template'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter description..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Creation Modal */}
      <ContentCreationModal
        isOpen={showContentModal}
        onClose={() => setShowContentModal(false)}
        contentType={contentModalType}
        onContentCreated={handleContentCreated}
      />

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Edit {editingItem.type === 'video' ? 'Video Project' : 
                      editingItem.type === 'social' ? 'Social Media Post' :
                      editingItem.type === 'blog' ? 'Blog Article' : 'Template'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name/Title</label>
                  <input
                    type="text"
                    defaultValue={editingItem.name || editingItem.title}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description/Content</label>
                  <textarea
                    rows={3}
                    defaultValue={editingItem.description || editingItem.content}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {editingItem.type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      defaultValue={editingItem.status}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement actual update functionality
                    alert('Update functionality coming soon!');
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {showVideoPlayer && selectedVideo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedVideo.name}
                </h3>
                <button
                  onClick={() => setShowVideoPlayer(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="bg-black rounded-lg overflow-hidden mb-4">
                {selectedVideo.file_path ? (
                  <video
                    controls
                    className="w-full h-96"
                    poster={`http://localhost:3001${selectedVideo.thumbnail_path}`}
                  >
                    <source src={`http://localhost:3001${selectedVideo.file_path}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-96 flex items-center justify-center text-white">
                    <div className="text-center">
                      <VideoCameraIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg">No video file available</p>
                      <p className="text-sm text-gray-400">Upload a video to view it here</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Duration:</span> {formatDuration(selectedVideo.duration)}
                </div>
                <div>
                  <span className="font-medium">Resolution:</span> {selectedVideo.resolution}
                </div>
                <div>
                  <span className="font-medium">Aspect Ratio:</span> {selectedVideo.aspect_ratio}
                </div>
                <div>
                  <span className="font-medium">Style:</span> {selectedVideo.style}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Editor Modal */}
      {showVideoEditor && selectedVideo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Edit Video: {selectedVideo.name}
                </h3>
                <button
                  onClick={() => setShowVideoEditor(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Video Preview */}
                <div className="bg-black rounded-lg overflow-hidden">
                  {selectedVideo.file_path ? (
                    <video
                      controls
                      className="w-full h-64"
                      poster={`http://localhost:3001${selectedVideo.thumbnail_path}`}
                    >
                      <source src={`http://localhost:3001${selectedVideo.file_path}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-white">
                      <div className="text-center">
                        <VideoCameraIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No video file available</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Editing Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Name
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedVideo.name}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      defaultValue={selectedVideo.description}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resolution
                      </label>
                      <select
                        defaultValue={selectedVideo.resolution}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="720p">720p</option>
                        <option value="1080p">1080p</option>
                        <option value="4K">4K</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        defaultValue={selectedVideo.status}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowVideoEditor(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        alert('Video editing functionality coming soon!');
                        setShowVideoEditor(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Video Generation Engine Modal */}
      {showAIVideoEngine && (
        <AIVideoGenerationEngine
          isOpen={showAIVideoEngine}
          onClose={() => setShowAIVideoEngine(false)}
          onVideoGenerated={(result) => {
            console.log('AI Video Generated:', result);
            setShowAIVideoEngine(false);
            // TODO: Add the generated video to the projects list
          }}
        />
      )}

      {/* Character Creator Modal */}
      {showCharacterCreator && (
        <CharacterCreator
          isOpen={showCharacterCreator}
          onClose={() => setShowCharacterCreator(false)}
          onCharacterCreated={(character) => {
            console.log('Character Created:', character);
            setShowCharacterCreator(false);
            // TODO: Add the character to the character library
          }}
        />
      )}
    </div>
  );
};

export default VideoProductionDashboard;
