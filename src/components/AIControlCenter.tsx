import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  ExclamationIcon,
  LightningBoltIcon,
  PlayIcon,
  UserGroupIcon,
  ChipIcon,
  CheckCircleIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/outline';
import VisibleHelpIcon from './VisibleHelpIcon';

const AIControlCenter: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Control Center</h1>
          <VisibleHelpIcon
            content="This is your command center for all AI operations. Here you can manage your AI agents (Alex, Jasper, USDOT RPA), monitor their performance, access training environments, and configure system settings. All AI-related features are accessible from this dashboard."
            size="md"
            position="right"
          />
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Central hub for AI agents, training, performance monitoring, and configuration
        </p>
      </div>

      {/* Quick Status Overview */}
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h2>
        <VisibleHelpIcon
          content="Real-time overview of your AI system health. Shows how many agents are running, current training progress, overall performance accuracy, and today's automated task count."
          size="sm"
          position="right"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative group">
          <div className="absolute top-2 right-2">
            <VisibleHelpIcon
              content="Number of AI agents currently active and operational. Includes Alex (Onboarding), Alex (Customer Service), Jasper (Manager), and AI Training Supervisor."
              size="xs"
              position="left"
            />
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Agents</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">4</p>
              <p className="text-xs text-green-600 dark:text-green-400">All operational</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative group">
          <div className="absolute top-2 right-2">
            <VisibleHelpIcon
              content="Current training progress for Alex Onboarding Agent. Shows percentage toward 100% accuracy target. Agent must reach 100% before production deployment."
              size="xs"
              position="left"
            />
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Training Status</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">67%</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Alex training active</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative group">
          <div className="absolute top-2 right-2">
            <VisibleHelpIcon
              content="Overall system performance across all AI agents. This shows the average accuracy of all agents combined. Individual agent performance can be viewed in the Performance Monitoring section."
              size="xs"
              position="left"
            />
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Performance</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">93%</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Overall accuracy</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative group">
          <div className="absolute top-2 right-2">
            <VisibleHelpIcon
              content="Number of automated tasks completed by AI agents today. This includes client onboarding, service recommendations, compliance checks, and other automated workflows."
              size="xs"
              position="left"
            />
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <LightningBoltIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Today</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">12</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Automated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Active Agents Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
                Active AI Agents
              </h2>
              <VisibleHelpIcon
                content="Your AI agents are the automated workers in your business. Each agent has a specific role: Alex handles client conversations and onboarding, Jasper manages the overall system, and specialized RPA agents file government applications. Click any agent to view details or configure settings."
                size="sm"
                position="right"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your AI workforce - click any agent for details
            </p>
          </div>
          <div className="p-6 space-y-4">
            <Link
              to="/onboarding"
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative group"
            >
              <div className="absolute top-2 right-16">
                <VisibleHelpIcon
                  content="Alex Onboarding Agent: Website-hosted chatbot that determines which regulations clients need, offers services, collects payment, and creates deals. Currently training to 100% accuracy on qualified states logic and regulatory determinations."
                  size="xs"
                  position="left"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Alex (Onboarding)</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Client onboarding & sales</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  Active
                </span>
              </div>
            </Link>

            <Link
              to="/portal"
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative group"
            >
              <div className="absolute top-2 right-16">
                <VisibleHelpIcon
                  content="Alex Customer Service Agent: Same Alex persona as onboarding, provides seamless client portal support, account management, and service renewals. Shares 18-month memory with onboarding agent so clients experience one continuous relationship."
                  size="xs"
                  position="left"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Alex (Customer Service)</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Client portal support</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  Active
                </span>
              </div>
            </Link>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30 relative group">
              <div className="absolute top-2 right-2">
                <VisibleHelpIcon
                  content="USDOT RPA Agent: Robotic Process Automation agent that automatically files USDOT applications with the federal government. Handles Login.gov authentication, form filling, document uploads, and QR code client handoffs. First specialized agent to be created and trained."
                  size="xs"
                  position="left"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mr-3">
                    <ClockIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">USDOT RPA Agent</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Automated application filing</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                  In Development
                </span>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30 relative group">
              <div className="absolute top-2 right-2">
                <VisibleHelpIcon
                  content="Jasper (Manager AI): The main orchestrator who coordinates all other agents, manages workflows, and handles system-wide operations. Jasper has full system access and uses specialized agents as tools to complete complex workflows."
                  size="xs"
                  position="left"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Jasper (Manager AI)</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">System orchestration</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Training Centers Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2 text-purple-600" />
                Training Centers
              </h2>
              <VisibleHelpIcon
                content="Training centers are where you teach AI agents to perform specific tasks with 100% accuracy. Each training center creates realistic scenarios, tests the agent's responses, grades performance, and provides feedback. Use these to train new agents or improve existing ones."
                size="sm"
                position="right"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Train agents to 100% accuracy - click to start training session
            </p>
          </div>
          <div className="p-6 space-y-4">
            <Link
              to="/training"
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group relative"
            >
              <div className="absolute top-2 right-2">
                <VisibleHelpIcon
                  content="Alex Training Center: Intelligent training environment for the onboarding agent. Creates random client scenarios, tests Alex's ability to determine required regulations, grade accuracy, and provides feedback. Goal is 100% accuracy on regulatory determinations before production use."
                  size="xs"
                  position="left"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AcademicCapIcon className="h-6 w-6 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      Alex Training Center
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                        67% Accuracy
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Train onboarding agent on regulatory determinations</p>
                  </div>
                </div>
                <div className="text-purple-600 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </Link>

            <Link
              to="/training/usdot"
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group relative"
            >
              <div className="absolute top-2 right-2">
                <VisibleHelpIcon
                  content="USDOT Training Center: Pixel-perfect emulation of the FMCSA government website. Trains the USDOT RPA Agent to fill out applications, upload documents, and navigate the federal registration process. Tests Login.gov integration and form completion accuracy."
                  size="xs"
                  position="left"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      USDOT Training
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 rounded-full">
                        Ready to Start
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Train RPA agent on FMCSA government forms</p>
                  </div>
                </div>
                <div className="text-blue-600 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </Link>

            <Link
              to="/training/critical-path"
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group relative"
            >
              <div className="absolute top-2 right-2">
                <VisibleHelpIcon
                  content="Critical Path Testing: Tests agents on the most common failure scenarios (business entity mismatches, vehicle/driver ratio errors, CDL requirements, insurance gaps). Ensures agents can handle edge cases and complex situations that typically cause application rejections."
                  size="xs"
                  position="left"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ExclamationIcon className="h-6 w-6 text-amber-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Critical Path Testing</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Test edge cases and common failure points</p>
                  </div>
                </div>
                <div className="text-amber-600 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </Link>

            <Link
              to="/training/monitoring"
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group relative"
            >
              <div className="absolute top-2 right-2">
                <VisibleHelpIcon
                  content="Performance Monitoring Dashboard: Real-time analytics showing agent accuracy, success rates, training progress, and error patterns. View detailed metrics for each agent, identify areas needing improvement, and track progress toward 100% accuracy goals."
                  size="xs"
                  position="left"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ChartBarIcon className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Performance Monitoring</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Real-time metrics and analytics</p>
                  </div>
                </div>
                <div className="text-green-600 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/training"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <PlayIcon className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Start Training Session</h3>
            <p className="text-sm text-blue-100">
              Begin training Alex on new scenarios
            </p>
          </Link>

          <Link
            to="/training/monitoring"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
          >
            <ChartBarIcon className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">View Performance</h3>
            <p className="text-sm text-green-100">
              Monitor agent accuracy and metrics
            </p>
          </Link>

          <Link
            to="/ai-admin"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl block"
          >
            <CogIcon className="h-8 w-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Configure Agents</h3>
            <p className="text-sm text-purple-100">
              Manage agent settings and behavior
            </p>
          </Link>
        </div>
      </div>

      {/* Agent Details Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Agent Ecosystem</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your AI-powered compliance automation system
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Jasper */}
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Jasper (Manager AI)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Orchestrates all AI agents, manages workflows, and coordinates specialized agents
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                      Operational
                    </span>
                    <span>Voice: Jasper (Unreal Speech)</span>
                    <span>Memory: 18 months</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alex Onboarding */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Alex (Onboarding Agent)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Determines client regulatory requirements, presents services, creates deals
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-amber-500" />
                      Training 67%
                    </span>
                    <Link to="/training" className="text-blue-600 hover:text-blue-700">Train →</Link>
                    <span>Target: 100% accuracy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alex Customer Service */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Alex (Customer Service)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Portal guidance, account management, ongoing support (seamless handoff from onboarding)
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                      Operational
                    </span>
                    <span>Shared persona with Onboarding</span>
                  </div>
                </div>
              </div>
            </div>

            {/* USDOT RPA */}
            <div className="border-l-4 border-amber-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">USDOT RPA Agent</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Automated USDOT application filing (first specialized agent to build)
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-amber-500" />
                      Development
                    </span>
                    <Link to="/training/usdot" className="text-blue-600 hover:text-blue-700">Train →</Link>
                    <span>Status: Framework ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Training Supervisor */}
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Training Supervisor</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Regulatory intelligence, scenario generation, agent evaluation & grading
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                      Operational
                    </span>
                    <span>Authority: Regulatory knowledge</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start">
          <ChipIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">AI System Information</h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <div><strong>Architecture:</strong> Multi-agent system with specialized roles</div>
              <div><strong>Training Method:</strong> Intelligent scenario generation with Golden Master system</div>
              <div><strong>Memory System:</strong> 18-month conversation history (shared between onboarding & customer service)</div>
              <div><strong>Voice Integration:</strong> Unreal Speech API (high-quality voice synthesis)</div>
              <div><strong>Automation Level:</strong> 98% AI-driven with human oversight at critical checkpoints</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIControlCenter;

