import React from 'react';
import {
  ChartBarIcon,
  CashIcon,
  ClockIcon,
  CodeIcon,
  LightningBoltIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  ClockIcon as TimeIcon,
} from '@heroicons/react/outline';

const ProjectOverview: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Rapid CRM - Project Overview
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            98% AI-Automated Transportation Compliance Platform
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              90% Complete
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
              6-8 Weeks to Launch
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
              Patent Pending
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Market Size</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">500K+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Trucking Companies</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <CashIcon className="h-8 w-8 text-green-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Margins</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">85-90%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Gross Margin</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <ClockIcon className="h-8 w-8 text-orange-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Dev Time Saved</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">2.5-3.5x</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Faster than Traditional</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUpIcon className="h-8 w-8 text-purple-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">LTV:CAC</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">12.5-100x</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Unit Economics</div>
          </div>
        </div>

        {/* What Is This? */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What is Rapid CRM?</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>Rapid CRM</strong> is a <strong>98% AI-automated Transportation Compliance Agency</strong> that helps 
            trucking companies register and maintain DOT compliance through multiple specialized AI agents.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Core Innovation:</strong> Proprietary AI system (patent-pending) that automatically determines 
            required federal and state regulations based on business characteristics.
          </p>
        </div>

        {/* Technology Stack */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <CodeIcon className="h-6 w-6 mr-2 text-blue-600" />
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-gray-700 dark:text-gray-300">React 19 + TypeScript</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-gray-700 dark:text-gray-300">Vite Build System</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-gray-700 dark:text-gray-300">Tailwind CSS 4.x</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-gray-700 dark:text-gray-300">Express Backend</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-gray-700 dark:text-gray-300">SQLite Database</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-gray-700 dark:text-gray-300">Docker Containerization</span>
            </div>
          </div>
        </div>

        {/* Development Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <LightningBoltIcon className="h-6 w-6 mr-2 text-yellow-600" />
            Development Efficiency
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Traditional Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Your Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Advantage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Time to Current State
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    29-42 months
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    10-15 months
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    2.5-3.5x faster
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Development Cost
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    $2.1M - $3.1M
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    $6K - $20K
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    100-500x cheaper
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Team Size
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    5 developers
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    1 (you + AI)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    5x more efficient
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Competitive Advantages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <ShieldCheckIcon className="h-6 w-6 mr-2 text-green-600" />
            Competitive Advantages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">98% AI Automation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Competitors: 50-60% margins (human-heavy) | You: 85-90% margins
              </p>
              <p className="text-sm font-bold text-blue-600 mt-1">Advantage: 1.5x better margins</p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Patent Protection</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Competitors: Easily replicable | You: Protected IP moat
              </p>
              <p className="text-sm font-bold text-purple-600 mt-1">Advantage: 2-3x valuation multiplier</p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Renewal-Focused (70% recurring)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Competitors: One-time service fees | You: Predictable recurring revenue
              </p>
              <p className="text-sm font-bold text-green-600 mt-1">Advantage: 1.8x valuation multiplier</p>
            </div>
            <div className="border-l-4 border-orange-600 pl-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Infinite Scalability</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Competitors: Linear scaling with headcount | You: AI scales infinitely
              </p>
              <p className="text-sm font-bold text-orange-600 mt-1">Advantage: 2x scaling efficiency</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <p className="text-center text-lg font-bold text-gray-900 dark:text-white">
              Combined Advantage: <span className="text-2xl text-blue-600">10-20x</span> over traditional competitors
            </p>
          </div>
        </div>

        {/* Revenue Projections */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Revenue Projections</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Clients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    MRR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ARR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valuation (w/ Patent)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    6 Months
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">25</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">$50K</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">$600K</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">$7.5M - $12M</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    12 Months
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">100</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">$200K</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">$2.4M</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">$48M - $60M</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    24 Months
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">500</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">$1M</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">$12M</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">$240M - $300M</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Current Status: 90% Complete</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-2">✅ Completed (90%)</h3>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Core CRM System</li>
                <li>• AI Agent System</li>
                <li>• Training Environment</li>
                <li>• User Interface</li>
                <li>• Database & Backend</li>
                <li>• Client Portal</li>
                <li>• Docker & DevOps</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">🔄 In Progress (7%)</h3>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Alex Training (67% → 100%)</li>
                <li>• USDOT RPA Agent (20% → 100%)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">⏳ Remaining (3%)</h3>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Payment Processing (1-2 weeks)</li>
                <li>• Government API Integration (2-3 weeks)</li>
                <li>• Production Deployment (1-2 weeks)</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white/10 rounded-lg backdrop-blur">
            <p className="text-center text-xl font-bold">
              🚀 Time to Launch: <span className="text-yellow-300">6-8 Weeks</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;

