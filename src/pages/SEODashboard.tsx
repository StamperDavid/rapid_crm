import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  EyeIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ShareIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/outline';

interface CompetitorAnalysis {
  id: number;
  domain: string;
  companyName: string;
  industry: string;
  targetKeywords: string[];
  monitoringEnabled: boolean;
  lastAnalyzed: Date | null;
  metrics: {
    organicKeywords: number;
    estimatedTraffic: number;
    domainAuthority: number;
    backlinks: number;
  };
  topKeywords: Array<{
    keyword: string;
    position: number;
    searchVolume: number;
    difficulty: number;
  }>;
  contentGaps: string[];
  socialMetrics: Array<{
    platform: string;
    followers: number;
    engagementRate: number;
    topHashtags: string[];
  }>;
}

interface SEORecommendation {
  id: number;
  type: 'technical' | 'content' | 'link_building' | 'keyword_optimization';
  title: string;
  description: string;
  impactScore: number;
  effortLevel: 'low' | 'medium' | 'high';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'implemented' | 'rejected';
  implementationDetails: any;
  createdAt: Date;
  updatedAt: Date;
}

interface ContentOpportunity {
  id: number;
  keyword: string;
  competitorRanking: number;
  ourRanking: number;
  opportunityScore: number;
  contentSuggestion: string;
  contentType: 'blog_post' | 'landing_page' | 'product_page';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'implemented' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

interface TrendingTopic {
  topic: string;
  platform: string;
  engagement: string;
  demographic: string;
  hashtags: string[];
  searchVolume: number;
  trendDirection: string;
  sentiment: string;
  competitorMentions: number;
  opportunityScore: number;
}

interface CompetitorStrategy {
  competitorId: number;
  competitorName: string;
  contentThemes: string[];
  topPerformingContent: Array<{
    title: string;
    engagement: string;
    shares: number;
    comments: number;
    estimatedReach: number;
  }>;
  contentFrequency: string;
  averageEngagement: number;
  contentGaps: string[];
  estimatedContentBudget: string;
  contentTeamSize: string;
}

interface CostEffectiveAlternative {
  originalContent: string;
  competitor: string;
  alternativeApproach: string;
  estimatedCost: number;
  expectedROI: number;
  implementationStrategy: any;
  timeline: string;
  resources: any;
  competitiveAdvantage: any;
}

const SEODashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>([]);
  const [recommendations, setRecommendations] = useState<SEORecommendation[]>([]);
  const [contentOpportunities, setContentOpportunities] = useState<ContentOpportunity[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [competitorStrategies, setCompetitorStrategies] = useState<CompetitorStrategy[]>([]);
  const [costEffectiveAlternatives, setCostEffectiveAlternatives] = useState<CostEffectiveAlternative[]>([]);
  const [loading, setLoading] = useState(true);
  const [automationStatus, setAutomationStatus] = useState('idle');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load competitors
      const competitorsResponse = await fetch('/api/seo/competitors');
      const competitorsData = await competitorsResponse.json();
      if (competitorsData.success) {
        setCompetitors(competitorsData.competitors);
      }

      // Load recommendations
      const recommendationsResponse = await fetch('/api/seo/recommendations/pending');
      const recommendationsData = await recommendationsResponse.json();
      if (recommendationsData.success) {
        setRecommendations(recommendationsData.recommendations);
      }

      // Load content opportunities
      const opportunitiesResponse = await fetch('/api/seo/content/opportunities');
      const opportunitiesData = await opportunitiesResponse.json();
      if (opportunitiesData.success) {
        setContentOpportunities(opportunitiesData.opportunities);
      }

    } catch (error) {
      console.error('Error loading SEO dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runCompetitorAnalysis = async () => {
    try {
      setAutomationStatus('analyzing');
      const response = await fetch('/api/seo/competitors/analyze', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        await loadDashboardData();
        setAutomationStatus('completed');
        setTimeout(() => setAutomationStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error running competitor analysis:', error);
      setAutomationStatus('error');
    }
  };

  const runDailySEOTasks = async () => {
    try {
      setAutomationStatus('running');
      const response = await fetch('/api/seo/tasks/daily', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        await loadDashboardData();
        setAutomationStatus('completed');
        setTimeout(() => setAutomationStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error running daily SEO tasks:', error);
      setAutomationStatus('error');
    }
  };

  const approveRecommendation = async (recommendationId: number) => {
    try {
      const response = await fetch(`/api/seo/recommendations/${recommendationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 1 })
      });
      
      if (response.ok) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error approving recommendation:', error);
    }
  };

  const implementRecommendation = async (recommendationId: number) => {
    try {
      const response = await fetch(`/api/seo/recommendations/${recommendationId}/implement`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error implementing recommendation:', error);
    }
  };

  const createContent = async () => {
    try {
      // TODO: Implement content creation functionality
      alert('Content creation functionality coming soon!');
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'approved': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'implemented': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading SEO Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              SEO Automation Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              AI-powered competitive intelligence and SEO management
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={runCompetitorAnalysis}
              disabled={automationStatus === 'analyzing'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {automationStatus === 'analyzing' ? 'Analyzing...' : 'Analyze Competitors'}
            </button>
            <button
              onClick={runDailySEOTasks}
              disabled={automationStatus === 'running'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <CogIcon className="h-4 w-4 mr-2" />
              {automationStatus === 'running' ? 'Running...' : 'Run Daily Tasks'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'competitors', name: 'Competitors', icon: EyeIcon },
            { id: 'trending', name: 'Trending Topics', icon: ArrowUpIcon },
            { id: 'spy', name: 'Competitor Spy', icon: EyeIcon },
            { id: 'recommendations', name: 'Recommendations', icon: LightBulbIcon },
            { id: 'content', name: 'Content Opportunities', icon: DocumentTextIcon },
            { id: 'social', name: 'Social SEO', icon: ShareIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EyeIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Competitors Monitored
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {competitors.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <LightBulbIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Pending Recommendations
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {recommendations.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Content Opportunities
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {contentOpportunities.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ArrowUpIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        High Priority Items
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {recommendations.filter(r => r.priority === 'high').length + 
                         contentOpportunities.filter(o => o.priority === 'high').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Recent SEO Activity
              </h3>
              <div className="mt-5">
                <div className="space-y-3">
                  {recommendations.slice(0, 5).map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                          {rec.priority}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {rec.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {rec.type} • Impact: {rec.impactScore}%
                          </p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rec.status)}`}>
                        {rec.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'competitors' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Competitor Analysis
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {competitors.map((competitor) => (
                  <div key={competitor.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {competitor.companyName}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {competitor.domain}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {competitor.metrics?.organicKeywords?.toLocaleString() || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Keywords</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {competitor.metrics?.estimatedTraffic?.toLocaleString() || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Traffic</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {competitor.metrics?.domainAuthority || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">DA</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {competitor.metrics?.backlinks?.toLocaleString() || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Backlinks</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Top Keywords:</h5>
                      <div className="flex flex-wrap gap-2">
                        {(competitor.topKeywords || []).slice(0, 5).map((keyword, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {keyword.keyword} (Pos: {keyword.position})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Content Gaps:</h5>
                      <div className="flex flex-wrap gap-2">
                        {(competitor.contentGaps || []).slice(0, 3).map((gap, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                SEO Recommendations
              </h3>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {rec.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {rec.description}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                          {rec.priority}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rec.status)}`}>
                          {rec.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Impact:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {rec.impactScore}%
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Effort:</span>
                          <span className={`text-sm font-medium ${getEffortColor(rec.effortLevel)}`}>
                            {rec.effortLevel}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Type:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {rec.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {rec.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveRecommendation(rec.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => implementRecommendation(rec.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <CogIcon className="h-4 w-4 mr-1" />
                          Implement
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Content Opportunities
              </h3>
              <div className="space-y-4">
                {contentOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {opportunity.keyword}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {opportunity.contentSuggestion}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(opportunity.priority)}`}>
                          {opportunity.priority}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {opportunity.contentType}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Opportunity Score:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {opportunity.opportunityScore}%
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Competitor Rank:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {opportunity.competitorRanking || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={createContent}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        Create Content
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Social Media SEO Analysis
              </h3>
              <div className="text-center py-8">
                <ShareIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Social SEO Report</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Generate a comprehensive social media SEO report by clicking the "Run Daily Tasks" button.
                </p>
                <div className="mt-6">
                  <button
                    onClick={runDailySEOTasks}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Generate Social SEO Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trending Topics Tab */}
      {activeTab === 'trending' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Trending Topics for Target Demographics
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                AI-powered research of trending topics on social media platforms to identify content opportunities
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{topic.topic}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        topic.opportunityScore > 85 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        topic.opportunityScore > 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {topic.opportunityScore}% opportunity
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Platform:</span>
                        <span className="text-gray-900 dark:text-white">{topic.platform}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Search Volume:</span>
                        <span className="text-gray-900 dark:text-white">{topic.searchVolume.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Engagement:</span>
                        <span className="text-gray-900 dark:text-white capitalize">{topic.engagement}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Trend:</span>
                        <span className={`flex items-center ${
                          topic.trendDirection === 'rising' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {topic.trendDirection === 'rising' ? (
                            <ArrowUpIcon className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 mr-1" />
                          )}
                          {topic.trendDirection}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Hashtags:</div>
                      <div className="flex flex-wrap gap-1">
                        {topic.hashtags.slice(0, 3).map((hashtag, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {trendingTopics.length === 0 && (
                <div className="text-center py-8">
                  <ArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No trending topics found</p>
                  <button
                    onClick={() => {
                      // Load trending topics
                      fetch('/api/trending-content/trending-topics')
                        .then(res => res.json())
                        .then(data => {
                          if (data.success) {
                            setTrendingTopics(data.trendingTopics);
                          }
                        });
                    }}
                    className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Load Trending Topics
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Competitor Spy Tab */}
      {activeTab === 'spy' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                🕵️ Competitor Intelligence Dashboard
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Spy on competitor content strategies and identify cost-effective alternatives
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Competitor Strategies */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Competitor Content Strategies</h4>
                  <div className="space-y-4">
                    {competitorStrategies.map((strategy, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900 dark:text-white">{strategy.competitorName}</h5>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{strategy.contentFrequency}</span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Content Budget:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{strategy.estimatedContentBudget}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Team Size:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{strategy.contentTeamSize}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Avg Engagement:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{strategy.averageEngagement}/5</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Top Performing Content:</div>
                          <div className="space-y-1">
                            {strategy.topPerformingContent.slice(0, 2).map((content, i) => (
                              <div key={i} className="text-sm text-gray-700 dark:text-gray-300">
                                • {content.title} ({content.shares} shares)
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Cost-Effective Alternatives */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Cost-Effective Alternatives</h4>
                  <div className="space-y-4">
                    {costEffectiveAlternatives.map((alternative, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                            Alternative to: {alternative.originalContent}
                          </h5>
                          <span className="text-sm text-green-600 dark:text-green-400">
                            {alternative.expectedROI}% ROI
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Competitor:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{alternative.competitor}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Our Cost:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">${alternative.estimatedCost.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Timeline:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{alternative.timeline}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Our Approach:</div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{alternative.alternativeApproach}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {(competitorStrategies.length === 0 || costEffectiveAlternatives.length === 0) && (
                <div className="text-center py-8">
                  <EyeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No competitor intelligence data available</p>
                  <button
                    onClick={() => {
                      // Load competitor spy data
                      Promise.all([
                        fetch('/api/trending-content/competitor-strategies').then(res => res.json()),
                        fetch('/api/trending-content/cost-effective-alternatives').then(res => res.json())
                      ]).then(([strategiesData, alternativesData]) => {
                        if (strategiesData.success) {
                          setCompetitorStrategies(strategiesData.competitorStrategies);
                        }
                        if (alternativesData.success) {
                          setCostEffectiveAlternatives(alternativesData.alternatives);
                        }
                      });
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Load Competitor Intelligence
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEODashboard;
