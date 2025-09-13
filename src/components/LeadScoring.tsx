import React from 'react';
import { Lead } from '../types/schema';
import { LeadScoringService, LeadScore } from '../services/leads/LeadScoringService';
import {
  ChartBarIcon,
  ExclamationIcon,
  LightBulbIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/outline';

interface LeadScoringProps {
  lead: Lead;
  showDetails?: boolean;
}

const LeadScoring: React.FC<LeadScoringProps> = ({ lead, showDetails = false }) => {
  const score: LeadScore = LeadScoringService.calculateLeadScore(lead);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hot': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'Warm': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'Cold': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    if (percentage >= 60) return <ChartBarIcon className="h-5 w-5 text-yellow-600" />;
    return <XCircleIcon className="h-5 w-5 text-red-600" />;
  };

  if (!showDetails) {
    return (
      <div className="flex items-center space-x-2">
        {getScoreIcon(score.percentage)}
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score.percentage)}`}>
          {score.percentage}% ({score.grade})
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(score.category)}`}>
          {score.category}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Lead Score Analysis</h3>
        <div className="flex items-center space-x-3">
          {getScoreIcon(score.percentage)}
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score.percentage)}`}>
              {score.totalScore}/{score.maxScore} ({score.percentage}%)
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Grade: {score.grade}
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Score Breakdown</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(score.breakdown).map(([category, points]) => {
            const maxPoints = getMaxPointsForCategory(category);
            const percentage = Math.round((points / maxPoints) * 100);
            return (
              <div key={category} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {points}/{maxPoints}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Badge */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lead Category:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(score.category)}`}>
            {score.category} Lead
          </span>
        </div>
      </div>

      {/* Recommendations */}
      {score.recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {score.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Factors */}
      {score.riskFactors.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <ExclamationIcon className="h-5 w-5 text-red-500 mr-2" />
            Risk Factors
          </h4>
          <ul className="space-y-2">
            {score.riskFactors.map((risk, index) => (
              <li key={index} className="flex items-start space-x-2">
                <ExclamationIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Helper function to get max points for each category
const getMaxPointsForCategory = (category: string): number => {
  const maxPoints: { [key: string]: number } = {
    companySize: 100,
    businessType: 80,
    compliance: 50,
    engagement: 40,
    budget: 30,
    timeline: 25,
    geographic: 25
  };
  return maxPoints[category] || 0;
};

export default LeadScoring;
