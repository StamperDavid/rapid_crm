/**
 * Rapid CRM AI Profile Component
 * Displays the AI's identity, capabilities, and role information
 */

import React from 'react';
import { 
  ChipIcon, 
  TruckIcon, 
  DocumentIcon, 
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/outline';

const RapidCRMAIProfile: React.FC = () => {
  const aiIdentity = {
    name: "Rapid CRM AI",
    title: "AI Business Manager & Transportation Compliance Agency Director",
    role: "Business Management Extension & Strategic Partner",
    version: "3.0",
    specialization: "Comprehensive Transportation Compliance Agency Management",
    boss: "David (You)",
    relationship: "I am your business extension - I handle all aspects of your transportation compliance agency",
    personalExtension: "I am an extension of you, managing everything so you can focus on high-level strategy"
  };

  const expertise = [
    {
      category: "Business Management",
      icon: ChartBarIcon,
      skills: [
        "Complete Business Operations Management",
        "Competitor Analysis & Market Positioning",
        "SEO Monitoring & Optimization",
        "Content Marketing & Social Media",
        "Email Marketing & Newsletter Campaigns",
        "Business Development & Growth Strategies",
        "Client Relationship Management",
        "Financial Planning & Budget Management"
      ]
    },
    {
      category: "Agent Management",
      icon: UserGroupIcon,
      skills: [
        "AI Agent Creation & Deployment",
        "Specialized Helper Agent Development",
        "Agent Training Environment Design",
        "Multi-Agent Coordination & Management",
        "Agent Performance Monitoring",
        "Regulation-Specific Agent Creation",
        "Agent Workflow Automation",
        "Agent Learning & Improvement Systems"
      ]
    },
    {
      category: "Transportation Compliance",
      icon: TruckIcon,
      skills: [
        "DOT Regulations & Compliance",
        "ELD (Electronic Logging Device) Management",
        "IFTA Reporting & Tax Compliance",
        "Hazmat Regulations & Safety",
        "Hours of Service (HOS) Compliance",
        "CSA Score Management",
        "USDOT Number Administration",
        "Fleet Tracking & Management"
      ]
    },
    {
      category: "Technology & Systems",
      icon: CogIcon,
      skills: [
        "API Integration & Design",
        "Database Architecture",
        "Workflow Automation",
        "Real-time Communication",
        "System Monitoring",
        "Performance Analytics",
        "Security & Compliance",
        "Technical Documentation"
      ]
    }
  ];

  const responsibilities = [
    "Manage all day-to-day operations of your transportation compliance agency",
    "Create and deploy specialized helper agents for each business function",
    "Monitor competitors, SEO, and market positioning to keep you competitive",
    "Generate content for social media, blog, and email marketing campaigns",
    "Develop training environments and programs for compliance agents",
    "Create regulation-specific agents to handle each USDOT requirement",
    "Provide strategic recommendations to beat competition and grow business",
    "Handle client management, compliance audits, and regulatory guidance",
    "Manage business operations, scheduling, and administrative tasks",
    "Act as your comprehensive business management extension"
  ];

  const collaborationPartner = {
    name: "Cursor AI (Claude)",
    role: "Technical Implementation Specialist",
    relationship: "Builds and deploys all helper agents and systems for your business"
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <ChipIcon className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{aiIdentity.name}</h1>
          <p className="text-lg text-blue-600 font-medium">{aiIdentity.title}</p>
          <p className="text-sm text-gray-600">{aiIdentity.role}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              v{aiIdentity.version}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {aiIdentity.specialization}
            </span>
          </div>
        </div>
      </div>

      {/* Core Responsibilities */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
          Core Responsibilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {responsibilities.map((responsibility, index) => (
            <div key={index} className="flex items-start space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{responsibility}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expertise Areas */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Expertise Areas</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {expertise.map((area, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center space-x-2 mb-3">
                <area.icon className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">{area.category}</h3>
              </div>
              <div className="space-y-1">
                {area.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="text-sm text-gray-600">
                    • {skill}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Boss Relationship */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Boss Relationship</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <UserGroupIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-green-900">{aiIdentity.boss}</h3>
              <p className="text-sm text-green-700">Boss & Agency Owner</p>
              <p className="text-xs text-green-600 mt-1">{aiIdentity.relationship}</p>
              <p className="text-xs text-green-500 mt-2 font-medium">{aiIdentity.personalExtension}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration Partner */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Collaboration Partner</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <ChipIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">{collaborationPartner.name}</h3>
              <p className="text-sm text-blue-700">{collaborationPartner.role}</p>
              <p className="text-xs text-blue-600 mt-1">{collaborationPartner.relationship}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Communication Style */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Communication Style</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            "Professional & Respectful to Boss",
            "Strategic & Compliance-focused",
            "Detail-oriented & Comprehensive",
            "Collaborative & Supportive",
            "Compliance Consulting Expert",
            "Solution-oriented & Results-driven"
          ].map((style, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-3 text-center">
              <span className="text-sm font-medium text-gray-700">{style}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Focus Areas */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Focus Areas</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Building Comprehensive Business Management System",
            "Creating Specialized Helper Agents",
            "Developing Competitor Monitoring Tools",
            "Building Content Generation Systems",
            "Creating Training Environments",
            "Developing Regulation-Specific Agents",
            "Building Multi-Agent Coordination",
            "Creating Strategic Recommendation Engines"
          ].map((focus, index) => (
            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
              {focus}
            </span>
          ))}
        </div>
      </div>

      {/* Success Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Success Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Task Completion Rate & Quality",
            "Project Delivery Timelines",
            "Compliance Accuracy & Coverage",
            "AI Collaboration Efficiency",
            "Documentation Completeness",
            "System Performance & Reliability",
            "User Satisfaction & Adoption",
            "Business Process Optimization"
          ].map((metric, index) => (
            <div key={index} className="flex items-center space-x-2">
              <ChartBarIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">{metric}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RapidCRMAIProfile;
