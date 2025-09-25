import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  ChartBarIcon,
  UserIcon,
  ChatIcon,
  ExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshIcon,
  PlayIcon,
  PauseIcon,
  CogIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChipIcon,
  SignalIcon,
  GlobeAltIcon,
  KeyIcon,
  SparklesIcon,
  TerminalIcon,
  DocumentIcon,
  DatabaseIcon,
  CloudIcon,
  ServerIcon,
  WifiIcon,
  LightningBoltIcon,
  FireIcon,
  StarIcon,
  HeartIcon,
  BrainIcon,
  RocketIcon,
  ZapIcon,
  SunIcon,
  MoonIcon,
  BeakerIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CodeIcon,
  CubeIcon,
  CogIcon,
  MagnifyingGlassIcon,
  XIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardIcon,
  ClipboardCheckIcon,
  DocumentDuplicateIcon,
  PrinterIcon,
  DownloadIcon,
  UploadIcon,
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  PhotographIcon,
  VideoCameraIcon,
  // SpeakerIcon, // Not available in this Heroicons version
  SpeakerXIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  CameraIcon,
  FilmIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  ScissorsIcon,
  PencilSquareIcon,
  MinusIcon,
  CheckIcon,
  QuestionMarkCircleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserCircleIcon,
  IdentificationIcon,
  BadgeCheckIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  LockOpenIcon,
  FingerPrintIcon,
  EyeSlashIcon,
  BellIcon,
  BellSlashIcon,
  BellAlertIcon,
  VolumeUpIcon,
  VolumeDownIcon,
  VolumeOffIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  SkipForwardIcon,
  SkipBackwardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ArrowUpLeftIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  RefreshIcon,
  ArrowSmallUpIcon,
  ArrowSmallDownIcon,
  ArrowSmallLeftIcon,
  ArrowSmallRightIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  Bars3Icon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars4Icon,
  QueueListIcon,
  ListBulletIcon,
  Squares2X2Icon,
  SquaresPlusIcon,
  TableCellsIcon,
  RectangleStackIcon,
  CircleStackIcon,
  SwatchIcon,
  ColorSwatchIcon,
  PaletteIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  TvIcon,
  RadioIcon,
} from '@heroicons/react/outline';

import { 
  aiIntegrationService,
  claudeCollaborationService,
  aiMonitoringService,
  AIMetrics,
  AIProviderMetrics,
  AIAlert
} from '../services/ai';

interface AIAssistantControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AIStatus {
  isActive: boolean;
  currentProvider: string;
  responseTime: number;
  successRate: number;
  totalRequests: number;
  lastActivity: string;
}

interface AIConfiguration {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  capabilities: string[];
  restrictions: string[];
}

const AIAssistantControlPanel: React.FC<AIAssistantControlPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'configuration' | 'monitoring' | 'collaboration' | 'advanced'>('overview');
  
  // Debug logging
  console.log('AIAssistantControlPanel - isOpen:', isOpen);
  console.log('AIAssistantControlPanel - activeTab:', activeTab);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [aiConfig, setAiConfig] = useState<AIConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [claudeConnection, setClaudeConnection] = useState<{
    isConnected: boolean;
    lastSync: string;
    collaborationMode: 'active' | 'passive' | 'disabled';
  }>({
    isConnected: false,
    lastSync: '',
    collaborationMode: 'disabled'
  });

  useEffect(() => {
    if (isOpen) {
      loadAIData();
    }
  }, [isOpen]);

  const loadAIData = async () => {
    setIsLoading(true);
    try {
      // Load AI status and configuration
      const providers = await aiIntegrationService.getProviders();
      const metrics = aiMonitoringService.getMetrics();
      
      setAiStatus({
        isActive: providers.length > 0,
        currentProvider: providers[0]?.name || 'None',
        responseTime: metrics.averageResponseTime,
        successRate: (metrics.successfulRequests / Math.max(metrics.totalRequests, 1)) * 100,
        totalRequests: metrics.totalRequests,
        lastActivity: metrics.lastActivity
      });

      // Load Claude collaboration status
      const claudeStatus = claudeCollaborationService.getCollaborationStatus();
      setClaudeConnection({
        isConnected: claudeStatus.isConnected,
        lastSync: claudeStatus.lastSync || '',
        collaborationMode: claudeStatus.isConnected ? 'active' : 'disabled'
      });

    } catch (error) {
      console.error('Failed to load AI data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectClaude = async () => {
    try {
      await claudeCollaborationService.initializeCollaboration();
      await loadAIData();
    } catch (error) {
      console.error('Failed to connect to Claude:', error);
    }
  };

  const handleDisconnectClaude = async () => {
    try {
      await claudeCollaborationService.disconnect();
      await loadAIData();
    } catch (error) {
      console.error('Failed to disconnect from Claude:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ChipIcon className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Assistant Control Panel
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Comprehensive AI system management and monitoring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'configuration', label: 'Configuration', icon: CogIcon },
            { id: 'monitoring', label: 'Monitoring', icon: EyeIcon },
            { id: 'collaboration', label: 'AI Collaboration', icon: GlobeAltIcon },
            { id: 'advanced', label: 'Advanced', icon: CogIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* AI Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ShieldCheckIcon className={`h-8 w-8 ${aiStatus?.isActive ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            AI Status
                          </h3>
                          <p className={`text-sm ${aiStatus?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {aiStatus?.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ServerIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Current Provider
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {aiStatus?.currentProvider || 'None'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ChartBarIcon className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Total Requests
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {aiStatus?.totalRequests || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Performance Metrics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Average Response Time
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {aiStatus?.responseTime?.toFixed(0) || 0}ms
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Success Rate
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                          {aiStatus?.successRate?.toFixed(1) || 0}%
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'collaboration' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Claude Collaboration
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`h-3 w-3 rounded-full ${claudeConnection.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Connection Status: {claudeConnection.isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                        
                        {claudeConnection.isConnected ? (
                          <button
                            onClick={handleDisconnectClaude}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircleIcon className="h-4 w-4" />
                            <span>Disconnect</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleConnectClaude}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <GlobeAltIcon className="h-4 w-4" />
                            <span>Connect to Claude</span>
                          </button>
                        )}
                      </div>
                      
                      {claudeConnection.lastSync && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Last Sync: {new Date(claudeConnection.lastSync).toLocaleString()}
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Collaboration Mode: {claudeConnection.collaborationMode}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'monitoring' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Real-time Monitoring
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Advanced monitoring features will be available here.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'configuration' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      AI Configuration
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Configuration options will be available here.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Advanced Controls
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Advanced system controls will be available here.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantControlPanel;