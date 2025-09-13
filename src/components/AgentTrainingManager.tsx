import React, { useState, useEffect } from 'react';
import {
  XIcon,
  DocumentAddIcon,
  PlayIcon,
  PauseIcon,
  RefreshIcon,
  CheckCircleIcon,
  ExclamationIcon,
  ChartBarIcon,
  ChipIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  CloudUploadIcon,
  BeakerIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/outline';

interface TrainingData {
  id: string;
  name: string;
  type: 'conversation' | 'qa' | 'document' | 'structured';
  size: number;
  uploadedAt: string;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
  format: 'json' | 'csv' | 'txt' | 'pdf';
  description?: string;
}

interface TrainingJob {
  id: string;
  agentId: string;
  agentName: string;
  status: 'queued' | 'training' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt: string;
  completedAt?: string;
  modelVersion: string;
  trainingData: string[];
  metrics: {
    accuracy?: number;
    loss?: number;
    validationScore?: number;
    trainingTime?: number;
  };
  logs: string[];
}

interface TestResult {
  id: string;
  question: string;
  expectedAnswer: string;
  actualAnswer: string;
  confidence: number;
  isCorrect: boolean;
  timestamp: string;
}

interface AgentTrainingManagerProps {
  isOpen: boolean;
  onClose: () => void;
  agentId?: string;
  agentName?: string;
}

const AgentTrainingManager: React.FC<AgentTrainingManagerProps> = ({
  isOpen,
  onClose,
  agentId,
  agentName
}) => {
  const [activeTab, setActiveTab] = useState<'data' | 'training' | 'testing' | 'deployment'>('data');
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    if (isOpen) {
      setTrainingData([
        {
          id: '1',
          name: 'USDOT Application Conversations',
          type: 'conversation',
          size: 2.4,
          uploadedAt: '2024-01-20T10:30:00Z',
          status: 'ready',
          format: 'json',
          description: 'Sample conversations for USDOT application data collection'
        },
        {
          id: '2',
          name: 'Compliance Q&A Dataset',
          type: 'qa',
          size: 1.8,
          uploadedAt: '2024-01-19T14:20:00Z',
          status: 'ready',
          format: 'csv',
          description: 'Question and answer pairs for transportation compliance'
        },
        {
          id: '3',
          name: 'FMCSA Regulations',
          type: 'document',
          size: 5.2,
          uploadedAt: '2024-01-18T09:15:00Z',
          status: 'processing',
          format: 'pdf',
          description: 'Federal Motor Carrier Safety Administration regulations'
        }
      ]);

      setTrainingJobs([
        {
          id: '1',
          agentId: agentId || '1',
          agentName: agentName || 'USDOT Application Agent',
          status: 'completed',
          progress: 100,
          startedAt: '2024-01-20T11:00:00Z',
          completedAt: '2024-01-20T11:45:00Z',
          modelVersion: 'v2.1.3',
          trainingData: ['1', '2'],
          metrics: {
            accuracy: 94.2,
            loss: 0.12,
            validationScore: 0.89,
            trainingTime: 45
          },
          logs: [
            'Training started with 1,247 samples',
            'Epoch 1/10: Loss 0.45, Accuracy 78.3%',
            'Epoch 5/10: Loss 0.23, Accuracy 89.1%',
            'Epoch 10/10: Loss 0.12, Accuracy 94.2%',
            'Training completed successfully'
          ]
        },
        {
          id: '2',
          agentId: agentId || '1',
          agentName: agentName || 'USDOT Application Agent',
          status: 'training',
          progress: 65,
          startedAt: '2024-01-21T09:30:00Z',
          modelVersion: 'v2.1.4',
          trainingData: ['1', '2', '3'],
          metrics: {
            accuracy: 87.3,
            loss: 0.18,
            trainingTime: 23
          },
          logs: [
            'Training started with 2,156 samples',
            'Epoch 1/15: Loss 0.52, Accuracy 72.1%',
            'Epoch 3/15: Loss 0.38, Accuracy 81.4%',
            'Epoch 6/15: Loss 0.18, Accuracy 87.3%'
          ]
        }
      ]);

      setTestResults([
        {
          id: '1',
          question: 'What information is required for USDOT number registration?',
          expectedAnswer: 'Legal business name, physical address, operation type, and fleet information',
          actualAnswer: 'For USDOT registration, you need your legal business name, complete physical address including street, city, state and zip code, operation type (interstate/intrastate), and detailed fleet information including number of vehicles and drivers.',
          confidence: 0.94,
          isCorrect: true,
          timestamp: '2024-01-21T10:15:00Z'
        },
        {
          id: '2',
          question: 'How often must USDOT holders update their information?',
          expectedAnswer: 'Every two years via MCS-150 form',
          actualAnswer: 'USDOT holders must complete a biennial update every two years using the MCS-150 form to keep their information current with FMCSA.',
          confidence: 0.91,
          isCorrect: true,
          timestamp: '2024-01-21T10:16:00Z'
        }
      ]);
    }
  }, [isOpen, agentId, agentName]);

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newData: TrainingData[] = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      type: 'conversation',
      size: file.size / (1024 * 1024), // Convert to MB
      uploadedAt: new Date().toISOString(),
      status: 'processing',
      format: file.name.split('.').pop() as any || 'txt'
    }));

    setTrainingData(prev => [...prev, ...newData]);
    setIsUploading(false);
  };

  const handleStartTraining = async () => {
    setIsTraining(true);
    // Simulate training start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newJob: TrainingJob = {
      id: `job-${Date.now()}`,
      agentId: agentId || '1',
      agentName: agentName || 'Test Agent',
      status: 'training',
      progress: 0,
      startedAt: new Date().toISOString(),
      modelVersion: 'v2.1.5',
      trainingData: trainingData.filter(d => d.status === 'ready').map(d => d.id),
      metrics: {},
      logs: ['Training job started...']
    };

    setTrainingJobs(prev => [newJob, ...prev]);
    setIsTraining(false);
  };

  const handleRunTests = async () => {
    setIsTesting(true);
    // Simulate testing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTesting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'processing':
      case 'training':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'queued':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const renderDataTab = () => (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
        <div className="text-center">
          <CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                Upload training data
              </span>
              <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                Drag and drop files or click to browse
              </span>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".json,.csv,.txt,.pdf"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="sr-only"
              disabled={isUploading}
            />
          </div>
          {isUploading && (
            <div className="mt-4 flex items-center justify-center">
              <RefreshIcon className="h-5 w-5 animate-spin text-blue-600 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Training Data List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Training Data</h3>
        <div className="space-y-3">
          {trainingData.map((data) => (
            <div key={data.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{data.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {data.size.toFixed(1)} MB • {data.format.toUpperCase()} • {data.type}
                    </p>
                    {data.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{data.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(data.status)}`}>
                    {data.status}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTrainingTab = () => (
    <div className="space-y-6">
      {/* Start Training Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Training Jobs</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Train your agent with uploaded data
          </p>
        </div>
        <button
          onClick={handleStartTraining}
          disabled={isTraining || trainingData.filter(d => d.status === 'ready').length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTraining ? (
            <>
              <RefreshIcon className="h-4 w-4 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4 mr-2" />
              Start Training
            </>
          )}
        </button>
      </div>

      {/* Training Jobs */}
      <div className="space-y-4">
        {trainingJobs.map((job) => (
          <div key={job.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{job.agentName}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Model: {job.modelVersion} • Started: {new Date(job.startedAt).toLocaleString()}
                </p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{job.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            {job.metrics && Object.keys(job.metrics).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {job.metrics.accuracy && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{job.metrics.accuracy}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
                  </div>
                )}
                {job.metrics.loss && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{job.metrics.loss.toFixed(3)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Loss</div>
                  </div>
                )}
                {job.metrics.validationScore && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{(job.metrics.validationScore * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Validation</div>
                  </div>
                )}
                {job.metrics.trainingTime && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{job.metrics.trainingTime}m</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
                  </div>
                )}
              </div>
            )}

            {/* Logs */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Training Logs</h5>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 max-h-32 overflow-y-auto">
                {job.logs.map((log, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTestingTab = () => (
    <div className="space-y-6">
      {/* Test Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Model Testing</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Test your trained models with sample questions
          </p>
        </div>
        <button
          onClick={handleRunTests}
          disabled={isTesting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isTesting ? (
            <>
              <RefreshIcon className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <BeakerIcon className="h-4 w-4 mr-2" />
              Run Tests
            </>
          )}
        </button>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {testResults.map((result) => (
          <div key={result.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Question</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{result.question}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expected Answer</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.expectedAnswer}</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Actual Answer</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.actualAnswer}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                  result.isCorrect 
                    ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                    : 'text-red-600 bg-red-100 dark:bg-red-900/20'
                }`}>
                  {result.isCorrect ? 'Correct' : 'Incorrect'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDeploymentTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Model Deployment</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Deploy your trained models to production environments
        </p>
      </div>

      {/* Deployment Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <PaperAirplaneIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Production Deployment</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Deploy to live environment</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Deploy to Production
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <BeakerIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Staging Deployment</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Deploy to testing environment</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Deploy to Staging
          </button>
        </div>
      </div>

      {/* Deployment History */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Deployment History</h4>
        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">v2.1.3</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">Production • Deployed 2 hours ago</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100 dark:bg-green-900/20">
                Active
              </span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">v2.1.2</h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">Production • Deployed 1 day ago</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium rounded-full text-gray-600 bg-gray-100 dark:bg-gray-900/20">
                Archived
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-10 mx-auto p-4 sm:p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800 m-4 sm:m-0">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Agent Training Manager
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {agentName ? `Training for ${agentName}` : 'Train and deploy AI agents'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'data', name: 'Training Data', icon: DocumentTextIcon },
                { id: 'training', name: 'Training Jobs', icon: ChipIcon },
                { id: 'testing', name: 'Model Testing', icon: BeakerIcon },
                { id: 'deployment', name: 'Deployment', icon: PaperAirplaneIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'data' && renderDataTab()}
            {activeTab === 'training' && renderTrainingTab()}
            {activeTab === 'testing' && renderTestingTab()}
            {activeTab === 'deployment' && renderDeploymentTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentTrainingManager;
