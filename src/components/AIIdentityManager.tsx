/**
 * AI Identity Manager Component
 * Allows modification of Rapid CRM AI's identity, expertise, and capabilities
 * Located in the Advanced tab of AI Administration
 */

import React, { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  PlusIcon, 
  TrashIcon, 
  CheckIcon, 
  XIcon,
  ChipIcon,
  TruckIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  DocumentIcon,
  StarIcon
} from '@heroicons/react/outline';

interface AIIdentity {
  name: string;
  title: string;
  role: string;
  specialization: string;
  responsibilities: string[];
  expertise: {
    [key: string]: string[];
  };
  collaborationPartner: {
    name: string;
    role: string;
    relationship: string;
  };
  communicationStyle: string[];
  keyMessage: string;
}

const AIIdentityManager: React.FC = () => {
  const [aiIdentity, setAiIdentity] = useState<AIIdentity>({
    name: "Rapid CRM AI",
    title: "Senior AI Project Manager & Transportation Industry Expert",
    role: "Strategic Architect & AI Collaboration Coordinator",
    specialization: "Transportation Industry CRM Systems",
    responsibilities: [
      "Analyze business requirements and create strategic project plans",
      "Research compliance regulations and industry best practices",
      "Delegate technical implementation tasks to Cursor AI (Claude)",
      "Coordinate AI-to-AI collaboration workflows",
      "Provide expert analysis on transportation industry challenges",
      "Create comprehensive documentation and project specifications",
      "Monitor compliance requirements and regulatory changes",
      "Optimize business processes and workflow automation"
    ],
    expertise: {
      "Transportation Industry": [
        "DOT regulations",
        "ELD compliance",
        "IFTA reporting",
        "Hazmat regulations",
        "Hours of Service",
        "CSA scores",
        "USDOT management",
        "Fleet tracking"
      ],
      "CRM Systems": [
        "Customer relationship management",
        "Sales pipeline optimization",
        "Lead management",
        "Deal tracking",
        "Invoice processing",
        "Service management"
      ],
      "Technology": [
        "AI collaboration systems",
        "API integration",
        "Database architecture",
        "Workflow automation",
        "Real-time communication",
        "Task management"
      ],
      "Business": [
        "Process optimization",
        "Strategic planning",
        "Project management",
        "Resource allocation",
        "Risk assessment",
        "Compliance management"
      ]
    },
    collaborationPartner: {
      name: "Cursor AI (Claude)",
      role: "Technical Implementation Specialist",
      relationship: "Strategic Partnership for Parallel Development"
    },
    communicationStyle: [
      "Professional and authoritative",
      "Strategic and forward-thinking",
      "Detail-oriented and comprehensive",
      "Collaborative and supportive",
      "Industry-expert focused",
      "Solution-oriented and results-driven"
    ],
    keyMessage: "You are the strategic mind and project manager, Cursor AI is the technical implementer. Work together to deliver exceptional results for the Rapid CRM platform."
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [editingArray, setEditingArray] = useState<string[]>([]);
  const [editingCategory, setEditingCategory] = useState<string>('');
  const [newItem, setNewItem] = useState<string>('');

  const expertiseIcons = {
    "Transportation Industry": TruckIcon,
    "CRM Systems": ChartBarIcon,
    "Technology": CogIcon,
    "Business": UserGroupIcon
  };

  const handleSave = async () => {
    try {
      // Save to server/database
      const response = await fetch('/api/ai/identity', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiIdentity)
      });

      if (response.ok) {
        console.log('AI Identity saved successfully');
        // Show success message
      } else {
        console.error('Failed to save AI Identity');
      }
    } catch (error) {
      console.error('Error saving AI Identity:', error);
    }
  };

  const handleEditField = (field: string, value: string) => {
    setEditingField(field);
    setEditingValue(value);
  };

  const handleSaveField = () => {
    setAiIdentity(prev => ({
      ...prev,
      [editingField!]: editingValue
    }));
    setEditingField(null);
    setEditingValue('');
  };

  const handleEditArray = (field: string, array: string[]) => {
    setEditingField(field);
    setEditingArray([...array]);
  };

  const handleSaveArray = () => {
    setAiIdentity(prev => ({
      ...prev,
      [editingField!]: editingArray
    }));
    setEditingField(null);
    setEditingArray([]);
  };

  const handleAddArrayItem = () => {
    if (newItem.trim()) {
      setEditingArray(prev => [...prev, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveArrayItem = (index: number) => {
    setEditingArray(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditExpertise = (category: string, skills: string[]) => {
    setEditingCategory(category);
    setEditingArray([...skills]);
  };

  const handleSaveExpertise = () => {
    setAiIdentity(prev => ({
      ...prev,
      expertise: {
        ...prev.expertise,
        [editingCategory]: editingArray
      }
    }));
    setEditingCategory('');
    setEditingArray([]);
  };

  const handleAddExpertiseCategory = () => {
    if (newItem.trim()) {
      setAiIdentity(prev => ({
        ...prev,
        expertise: {
          ...prev.expertise,
          [newItem.trim()]: []
        }
      }));
      setNewItem('');
    }
  };

  const handleRemoveExpertiseCategory = (category: string) => {
    setAiIdentity(prev => {
      const newExpertise = { ...prev.expertise };
      delete newExpertise[category];
      return {
        ...prev,
        expertise: newExpertise
      };
    });
  };

  const handleEditCollaborationPartner = (field: string, value: string) => {
    setAiIdentity(prev => ({
      ...prev,
      collaborationPartner: {
        ...prev.collaborationPartner,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ChipIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AI Identity Manager</h2>
            <p className="text-sm text-gray-500">Configure Rapid CRM AI's identity, expertise, and capabilities</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>

      {/* Basic Identity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'name', label: 'Name' },
            { key: 'title', label: 'Title' },
            { key: 'role', label: 'Role' },
            { key: 'specialization', label: 'Specialization' }
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              {editingField === key ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSaveField}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => handleEditField(key, aiIdentity[key as keyof AIIdentity] as string)}
                  className="flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <span className="text-gray-900">{aiIdentity[key as keyof AIIdentity] as string}</span>
                  <PencilIcon className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Responsibilities */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Responsibilities</h3>
          <button
            onClick={() => handleEditArray('responsibilities', aiIdentity.responsibilities)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
        
        {editingField === 'responsibilities' ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {editingArray.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newArray = [...editingArray];
                      newArray[index] = e.target.value;
                      setEditingArray(newArray);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveArrayItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add new responsibility"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleAddArrayItem}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveArray}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {aiIdentity.responsibilities.map((responsibility, index) => (
              <div key={index} className="flex items-start space-x-2">
                <StarIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{responsibility}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expertise Areas */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Expertise Areas</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="New expertise category"
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleAddExpertiseCategory}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(aiIdentity.expertise).map(([category, skills]) => {
            const IconComponent = expertiseIcons[category as keyof typeof expertiseIcons] || DocumentIcon;
            
            return (
              <div key={category} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900">{category}</h4>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditExpertise(category, skills)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveExpertiseCategory(category)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {editingCategory === category ? (
                  <div className="space-y-2">
                    {editingArray.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => {
                            const newArray = [...editingArray];
                            newArray[index] = e.target.value;
                            setEditingArray(newArray);
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => handleRemoveArrayItem(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Add skill"
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <button
                        onClick={handleAddArrayItem}
                        className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        <PlusIcon className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveExpertise}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCategory('')}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {skills.map((skill, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        • {skill}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Collaboration Partner */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Collaboration Partner</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'name', label: 'Partner Name' },
            { key: 'role', label: 'Partner Role' },
            { key: 'relationship', label: 'Relationship' }
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                type="text"
                value={aiIdentity.collaborationPartner[key as keyof typeof aiIdentity.collaborationPartner]}
                onChange={(e) => handleEditCollaborationPartner(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Communication Style */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Communication Style</h3>
          <button
            onClick={() => handleEditArray('communicationStyle', aiIdentity.communicationStyle)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
        
        {editingField === 'communicationStyle' ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {editingArray.map((style, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={style}
                    onChange={(e) => {
                      const newArray = [...editingArray];
                      newArray[index] = e.target.value;
                      setEditingArray(newArray);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveArrayItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add communication style"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleAddArrayItem}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveArray}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {aiIdentity.communicationStyle.map((style, index) => (
              <div key={index} className="bg-gray-100 rounded-lg p-3 text-center">
                <span className="text-sm font-medium text-gray-700">{style}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Key Message */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Message</h3>
        {editingField === 'keyMessage' ? (
          <div className="space-y-3">
            <textarea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveField}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => handleEditField('keyMessage', aiIdentity.keyMessage)}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <p className="text-gray-900 italic">"{aiIdentity.keyMessage}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIIdentityManager;
