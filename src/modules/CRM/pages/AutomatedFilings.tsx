/**
 * Automated Filings
 * 
 * Manual trigger interface for filing USDOT applications
 * Employee selects a deal and watches RPA file the application in real-time
 * on the actual FMCSA website using Playwright browser automation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  RefreshIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationIcon
} from '@heroicons/react/outline';
import { useCRM } from '../../../contexts/CRMContext';

interface RPAStatus {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  currentPage: number;
  totalPages: number;
  currentAction: string;
  lastScreenshot?: string;
  errors: string[];
  startTime?: string;
  endTime?: string;
}

const AutomatedFilings: React.FC = () => {
  const { deals, companies } = useCRM();
  
  const [rpaStatus, setRpaStatus] = useState<RPAStatus>({
    status: 'idle',
    currentPage: 0,
    totalPages: 77,
    currentAction: 'Ready to start',
    errors: []
  });
  
  const [selectedDeal, setSelectedDeal] = useState<string>('');
  const [screenshot, setScreenshot] = useState<string>('');
  const [showBrowser, setShowBrowser] = useState(true);
  const screenshotInterval = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousDealCount = useRef<number>(0);
  
  // ALL deals are paid (by definition in your business model)
  // Lead = unpaid prospect, Deal = paid customer
  // So we show all deals - they're all ready for filing
  const readyForFilingDeals = deals;
  
  // Get company name for a deal
  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.legalBusinessName || 'Unknown Company';
  };

  // Poll for status updates (in production, use WebSocket)
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await fetch('/api/rpa/status');
        if (response.ok) {
          const status = await response.json();
          setRpaStatus(status);
        }
      } catch (error) {
        console.error('Failed to fetch RPA status:', error);
      }
    };

    const interval = setInterval(pollStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll for screenshots
  useEffect(() => {
    if (rpaStatus.status === 'running' || rpaStatus.status === 'paused') {
      screenshotInterval.current = setInterval(async () => {
        try {
          const response = await fetch('/api/rpa/screenshot');
          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setScreenshot(url);
          }
        } catch (error) {
          console.error('Failed to fetch screenshot:', error);
        }
      }, 2000); // Update every 2 seconds
    } else {
      if (screenshotInterval.current) {
        clearInterval(screenshotInterval.current);
      }
    }

    return () => {
      if (screenshotInterval.current) {
        clearInterval(screenshotInterval.current);
      }
    };
  }, [rpaStatus.status]);

  const handleStart = async () => {
    if (!selectedDeal) {
      alert('Please select a deal to process');
      return;
    }

    try {
      const response = await fetch('/api/rpa/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: selectedDeal })
      });

      if (response.ok) {
        console.log('✅ RPA started');
      } else {
        alert('Failed to start RPA');
      }
    } catch (error) {
      console.error('Error starting RPA:', error);
      alert('Failed to start RPA');
    }
  };

  const handlePause = async () => {
    try {
      await fetch('/api/rpa/pause', { method: 'POST' });
    } catch (error) {
      console.error('Error pausing RPA:', error);
    }
  };

  const handleResume = async () => {
    try {
      await fetch('/api/rpa/resume', { method: 'POST' });
    } catch (error) {
      console.error('Error resuming RPA:', error);
    }
  };

  const handleStop = async () => {
    if (!confirm('Are you sure you want to stop the RPA agent?')) return;

    try {
      await fetch('/api/rpa/stop', { method: 'POST' });
    } catch (error) {
      console.error('Error stopping RPA:', error);
    }
  };

  const getStatusColor = () => {
    switch (rpaStatus.status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = () => {
    switch (rpaStatus.status) {
      case 'running': return <PlayIcon className="h-5 w-5 text-green-600" />;
      case 'paused': return <PauseIcon className="h-5 w-5 text-yellow-600" />;
      case 'completed': return <CheckCircleIcon className="h-5 w-5 text-blue-600" />;
      case 'failed': return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🤖 Automated Filings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          File USDOT applications automatically - select a deal and watch the RPA agent work
        </p>
      </div>

      {/* Status Bar */}
      <div className={`mb-6 p-4 rounded-lg border-2 ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <p className="font-semibold text-lg capitalize">{rpaStatus.status}</p>
              <p className="text-sm">{rpaStatus.currentAction}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold">
              {rpaStatus.currentPage} / {rpaStatus.totalPages}
            </p>
            <p className="text-sm">Pages Complete</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 bg-white bg-opacity-50 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(rpaStatus.currentPage / rpaStatus.totalPages) * 100}%` }}
          />
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Control Panel</h2>
        
        {/* Ready for Filing Banner */}
        {readyForFilingDeals.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">{readyForFilingDeals.length}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {readyForFilingDeals.length} Deal{readyForFilingDeals.length !== 1 ? 's' : ''} Ready for Filing
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Select a deal below and click "Start RPA" to begin automated filing
                  </p>
                </div>
              </div>
              <ExclamationIcon className="h-8 w-8 text-blue-500 animate-pulse" />
            </div>
          </div>
        )}

        {/* No Deals Warning */}
        {readyForFilingDeals.length === 0 && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                  No Paid Deals Yet
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  All deals are paid customers. Create a new deal to begin automated filing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Deal Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">
            Select Deal to File
          </label>
          <select
            value={selectedDeal}
            onChange={(e) => setSelectedDeal(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={rpaStatus.status === 'running' || readyForFilingDeals.length === 0}
          >
            <option value="">-- Select a deal to file --</option>
            {readyForFilingDeals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {getCompanyName(deal.companyId)} - {deal.dealName} (${deal.value?.toLocaleString() || 0})
              </option>
            ))}
          </select>
          {readyForFilingDeals.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              No deals available. Go to Deals page to create a new deal.
            </p>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-3">
          {rpaStatus.status === 'idle' || rpaStatus.status === 'completed' || rpaStatus.status === 'failed' ? (
            <button
              onClick={handleStart}
              disabled={!selectedDeal}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Start RPA
            </button>
          ) : null}

          {rpaStatus.status === 'running' ? (
            <button
              onClick={handlePause}
              className="flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              <PauseIcon className="h-5 w-5 mr-2" />
              Pause
            </button>
          ) : null}

          {rpaStatus.status === 'paused' ? (
            <button
              onClick={handleResume}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Resume
            </button>
          ) : null}

          {rpaStatus.status === 'running' || rpaStatus.status === 'paused' ? (
            <button
              onClick={handleStop}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <StopIcon className="h-5 w-5 mr-2" />
              Stop
            </button>
          ) : null}

          <button
            onClick={() => setShowBrowser(!showBrowser)}
            className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            {showBrowser ? 'Hide' : 'Show'} Browser
          </button>
        </div>
      </div>

      {/* Browser View */}
      {showBrowser && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold dark:text-white">
              Live Browser View
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300"
            >
              <RefreshIcon className="h-4 w-4 mr-1" />
              Refresh
            </button>
          </div>

          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
            {screenshot ? (
              <img 
                src={screenshot} 
                alt="Browser screenshot" 
                className="w-full h-auto"
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[600px]">
                <div className="text-center text-gray-400">
                  <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No screenshot available</p>
                  <p className="text-sm mt-2">Start RPA to see live browser view</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>📸 Screenshot updates every 2 seconds while RPA is running</p>
            <p>🌐 Actual FMCSA website: https://ai.fmcsa.dot.gov/</p>
          </div>
        </div>
      )}

      {/* Errors */}
      {rpaStatus.errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                Errors ({rpaStatus.errors.length})
              </h3>
              <ul className="space-y-1">
                {rpaStatus.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 dark:text-red-300">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          ℹ️ How This Works
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <li>• Uses Playwright to control a real Chrome browser</li>
          <li>• Navigates to the actual FMCSA website (https://ai.fmcsa.dot.gov/)</li>
          <li>• Logs in with your Login.gov credentials</li>
          <li>• Fills out all 77 pages of the USDOT application</li>
          <li>• You can watch in real-time as the browser fills forms</li>
          <li>• Screenshots update every 2 seconds for monitoring</li>
          <li>• Pause/resume at any time to take manual control</li>
        </ul>
      </div>
    </div>
  );
};

export default AutomatedFilings;

