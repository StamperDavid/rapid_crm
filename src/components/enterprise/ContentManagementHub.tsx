import React, { useState, useEffect } from 'react';
import {
  FilmIcon,
  DocumentTextIcon,
  PlayIcon,
  ShareIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DownloadIcon,
  UploadIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/outline';

interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'document' | 'training' | 'social';
  status: 'draft' | 'in_progress' | 'review' | 'published' | 'archived';
  created: string;
  modified: string;
  author: string;
  views?: number;
  engagement?: number;
  tags: string[];
  description: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  type: 'video' | 'document' | 'training' | 'social';
  description: string;
  category: string;
  usage: number;
}

const ContentManagementHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'video' | 'documents' | 'training' | 'distribution'>('overview');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadContentData();
  }, []);

  const loadContentData = async () => {
    try {
      // Mock data - in real implementation, this would come from API
      const contentData: ContentItem[] = [
        {
          id: '1',
          title: 'Q4 Safety Training Video',
          type: 'video',
          status: 'published',
          created: '2024-01-15',
          modified: '2024-01-15',
          author: 'John Smith',
          views: 1247,
          engagement: 89.2,
          tags: ['safety', 'training', 'compliance'],
          description: 'Comprehensive safety training for Q4 operations'
        },
        {
          id: '2',
          title: 'DOT Compliance Checklist',
          type: 'document',
          status: 'review',
          created: '2024-01-14',
          modified: '2024-01-16',
          author: 'Sarah Johnson',
          tags: ['compliance', 'dot', 'checklist'],
          description: 'Updated DOT compliance requirements checklist'
        },
        {
          id: '3',
          title: 'Driver Safety Course',
          type: 'training',
          status: 'in_progress',
          created: '2024-01-13',
          modified: '2024-01-16',
          author: 'Mike Davis',
          tags: ['driver', 'safety', 'course'],
          description: 'Interactive driver safety certification course'
        },
        {
          id: '4',
          title: 'LinkedIn Company Update',
          type: 'social',
          status: 'published',
          created: '2024-01-12',
          modified: '2024-01-12',
          author: 'Lisa Chen',
          views: 892,
          engagement: 76.8,
          tags: ['social', 'linkedin', 'company'],
          description: 'Monthly company update for LinkedIn'
        }
      ];

      const templatesData: ContentTemplate[] = [
        {
          id: '1',
          name: 'Safety Training Video Template',
          type: 'video',
          description: 'Standard template for safety training videos',
          category: 'Training',
          usage: 45
        },
        {
          id: '2',
          name: 'Compliance Document Template',
          type: 'document',
          description: 'Template for compliance-related documents',
          category: 'Compliance',
          usage: 32
        },
        {
          id: '3',
          name: 'Social Media Post Template',
          type: 'social',
          description: 'Template for social media content',
          category: 'Marketing',
          usage: 67
        }
      ];

      setContent(contentData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading content data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100';
      case 'review': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'archived': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <FilmIcon className="h-5 w-5 text-red-500" />;
      case 'document': return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'training': return <PlayIcon className="h-5 w-5 text-green-500" />;
      case 'social': return <ShareIcon className="h-5 w-5 text-purple-500" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Content Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">{content.length}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">
                {content.filter(c => c.status === 'published').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {content.filter(c => c.status === 'review').length}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-purple-600">
                {content.reduce((sum, c) => sum + (c.views || 0), 0).toLocaleString()}
              </p>
            </div>
            <EyeIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Content</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create Content</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {content.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  {getTypeIcon(item.type)}
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500">
                      {item.author} • {item.modified} • {item.views && `${item.views} views`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <button
                    onClick={() => setSelectedContent(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentList = (type: string) => {
    const filteredContent = content.filter(item => item.type === type);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 capitalize">{type} Content</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create {type}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {getTypeIcon(item.type)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{item.author}</span>
                  <span>{item.modified}</span>
                </div>
                {item.views && (
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{item.views} views</span>
                    <span>{item.engagement}% engagement</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center space-x-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 flex items-center justify-center space-x-1">
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDistribution = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Multi-Channel Distribution</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Distribution Channels */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Social Media</h3>
              <ShareIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">LinkedIn</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Facebook</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Twitter</span>
                <span className="text-sm font-medium text-yellow-600">Paused</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Manage Channels
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Email Marketing</h3>
              <DocumentTextIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Newsletter</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Client Updates</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Training Alerts</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Manage Campaigns
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Learning Platform</h3>
              <PlayIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Training Portal</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Certification</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mobile App</span>
                <span className="text-sm font-medium text-yellow-600">Beta</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              Manage Platform
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'video', name: 'Video Production' },
              { id: 'documents', name: 'Documents' },
              { id: 'training', name: 'Training' },
              { id: 'distribution', name: 'Distribution' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'video' && renderContentList('video')}
      {activeTab === 'documents' && renderContentList('document')}
      {activeTab === 'training' && renderContentList('training')}
      {activeTab === 'distribution' && renderDistribution()}
    </div>
  );
};

export default ContentManagementHub;









