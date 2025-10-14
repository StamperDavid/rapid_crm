/**
 * Regulation Training Dashboard
 * Overview and navigation hub for the AI agent training system
 */

import React, { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  PlayIcon,
  UserIcon,
  ChatIcon
} from '@heroicons/react/outline';
import VisibleHelpIcon from '../VisibleHelpIcon';

interface Agent {
  id: string;
  name: string;
  displayName?: string;
  type: string;
  status: string;
  capabilities: string[];
  description: string;
}

const RegulationTrainingDashboard: React.FC = () => {
  // Update qualified states database from CSV
  const updateQualifiedStates = async () => {
    try {
      const response = await fetch('/api/training/update-qualified-states', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        alert('Qualified states database updated successfully!');
      } else {
        alert('Failed to update qualified states database');
      }
    } catch (error) {
      console.error('Error updating qualified states:', error);
      alert('Error updating qualified states database');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          AI Agent Training Center
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Test and train AI agents on USDOT registration scenarios to prevent real-world application failures
        </p>
      </div>

      {/* Training Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Alex Onboarding Training */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ChatIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Alex Onboarding Training
              </h3>
            </div>
            <VisibleHelpIcon 
              content="Test Alex's ability to guide clients through USDOT registration, analyze their business needs, and recommend appropriate services. This tests conversational AI skills, not form-filling."
              size="sm"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Test Alex's conversational guidance and client onboarding skills
          </p>
          <button
            onClick={() => window.location.href = '/training/alex'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2"
          >
            <span>Access Alex Training</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* USDOT Training Center */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                USDOT Training Center
              </h3>
            </div>
            <VisibleHelpIcon 
              content="Complete USDOT application form-filling training. Tests the USDOT RPA Agent's ability to navigate government websites, fill out forms accurately, and submit applications. Opens in new window with monitoring."
              size="sm"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Pixel-perfect FMCSA USDOT registration interface emulation for realistic agent training
          </p>
          <button
            onClick={() => window.location.href = '/training/usdot'}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center space-x-2"
          >
            <span>Access Training Center</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Critical Path Tests */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ExclamationIcon className="h-8 w-8 text-orange-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Critical Path Tests
              </h3>
            </div>
            <VisibleHelpIcon 
              content="Test agents on the 6 most common USDOT application failure scenarios: Sole Proprietor + Hazmat, Vehicle/Driver Mismatch, CDL Requirements, Interstate Commerce, Missing Documentation, and Insurance Coverage."
              size="sm"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Test agents on the 6 most common USDOT application failure points
          </p>
          <button
            onClick={() => window.location.href = '/training/critical-path'}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center justify-center space-x-2"
          >
            <span>Run Critical Tests</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Performance Monitoring */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Performance Monitoring
              </h3>
            </div>
            <VisibleHelpIcon 
              content="Monitor agent training performance in real-time. View accuracy scores, response times, error rates, and detailed analytics. Track progress across different training scenarios and identify areas for improvement."
              size="sm"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Real-time monitoring and analytics of agent training performance
          </p>
          <button
            onClick={() => window.location.href = '/training/monitoring'}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center space-x-2"
          >
            <span>View Monitoring</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Golden Master System */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-yellow-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Golden Master System
              </h3>
            </div>
            <VisibleHelpIcon 
              content="Golden Masters are agents that achieve 100% accuracy in training scenarios. They serve as benchmarks and can automatically replace underperforming agents. View and manage your Golden Master agents here."
              size="sm"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Save and deploy perfect-performing agents as benchmarks for future training
          </p>
          <button
            onClick={() => window.location.href = '/training/monitoring'}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center justify-center space-x-2"
          >
            <span>View Golden Masters</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Qualified States Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Qualified States Management
          </h2>
          <VisibleHelpIcon 
            content="The qualified states database contains state-specific regulatory thresholds that supersede federal regulations. This is critical for Alex's regulatory analysis and service recommendations."
            size="sm"
          />
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Update the qualified states database from the CSV file to ensure Alex has the latest regulatory information.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => updateQualifiedStates()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
          >
            <span>Update Qualified States Database</span>
          </button>
          <button
            onClick={() => window.open('/qualified_states.csv', '_blank')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center space-x-2"
          >
            <span>View CSV File</span>
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          How the Training System Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">1. Train Agents</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI agents practice on realistic USDOT registration scenarios using pixel-perfect government interface emulation
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">2. Real-time Grading</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              System evaluates agent performance step-by-step, identifying mistakes and providing detailed feedback
            </p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <StarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">3. Golden Masters</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Perfect-performing agents (100% accuracy) are saved as Golden Masters and can replace underperforming agents
            </p>
          </div>
        </div>
      </div>

      {/* Critical Path Scenarios */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Critical Path Test Scenarios
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          These 6 scenarios test the most common USDOT application failure points:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <ExclamationIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Sole Proprietor + Hazmat</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tests business entity limitations for hazardous materials</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ExclamationIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Vehicle/Driver Mismatch</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tests fleet size vs driver capacity validation</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ExclamationIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">CDL Requirements</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tests understanding of CDL requirements for heavy vehicles</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ExclamationIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Interstate Commerce</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tests interstate vs intrastate commerce classification</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ExclamationIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Missing Documentation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tests identification of required documents</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ExclamationIcon className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Insurance Coverage</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tests insurance requirement understanding</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegulationTrainingDashboard;