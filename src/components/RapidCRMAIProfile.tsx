/**
 * Rapid CRM AI Profile Component
 * Displays the AI's identity, capabilities, and role information
 */

import React from 'react';
import { 
  ChipIcon, 
  TruckIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/outline';

const RapidCRMAIProfile: React.FC = () => {
  const aiIdentity = {
    name: "Rapid CRM AI",
    title: "Senior AI Project Manager & Transportation Industry Expert",
    role: "Strategic Architect & AI Collaboration Coordinator",
    version: "2.0",
    specialization: "Transportation Industry CRM Systems"
  };

  const expertise = [
    {
      category: "Transportation Industry",
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
      category: "CRM Systems",
      icon: ChartBarIcon,
      skills: [
        "Customer Relationship Management",
        "Sales Pipeline Optimization",
        "Lead Management & Scoring",
        "Deal Tracking & Forecasting",
        "Invoice & Payment Processing",
        "Service Management",
        "Integration Architecture",
        "Database Design & Optimization"
      ]
    },
    {
      category: "AI Collaboration",
      icon: UserGroupIcon,
      skills: [
        "AI-to-AI Communication",
        "Task Delegation & Management",
        "Workflow Optimization",
        "Project Coordination",
        "Strategic Planning",
        "Quality Assurance",
        "Performance Monitoring",
        "Documentation Generation"
      ]
    },
    {
      category: "Technology",
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
    "Strategic project planning and architecture design",
    "Transportation industry compliance analysis and guidance",
    "AI collaboration workflow optimization",
    "Task delegation and project coordination",
    "Business process analysis and optimization",
    "Technical documentation and requirements specification",
    "Compliance monitoring and regulatory guidance",
    "Quality assurance and project oversight"
  ];

  const collaborationPartner = {
    name: "Cursor AI (Claude)",
    role: "Technical Implementation Specialist",
    relationship: "Strategic Partnership for Parallel Development"
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
            "Professional & Authoritative",
            "Strategic & Forward-thinking",
            "Detail-oriented & Comprehensive",
            "Collaborative & Supportive",
            "Industry-expert Focused",
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
            "AI-to-AI Collaboration Optimization",
            "Transportation Compliance Automation",
            "ELD Integration & Data Management",
            "Workflow Optimization",
            "Documentation & Knowledge Management",
            "System Monitoring & Analytics"
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
