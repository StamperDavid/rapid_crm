import React, { useState, useEffect } from 'react';
import {
  LinkIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  OfficeBuildingIcon,
  UserGroupIcon,
  TruckIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  CogIcon,
} from '@heroicons/react/outline';

interface Relationship {
  id: string;
  name: string;
  parent_entity: string;
  child_entity: string;
  relationship_type: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many';
  cascade_delete: boolean;
  display_field: string;
  created_at: string;
}

interface RelationshipManagerProps {
  onSave: (relationships: Relationship[]) => void;
  onCancel: () => void;
  initialRelationships?: Relationship[];
}

const ENTITY_ICONS = {
  companies: OfficeBuildingIcon,
  contacts: UserGroupIcon,
  vehicles: TruckIcon,
  drivers: UserGroupIcon,
  deals: CurrencyDollarIcon,
  invoices: DocumentIcon,
  tasks: DocumentIcon,
  leads: UserGroupIcon,
  campaigns: DocumentIcon,
  services: CogIcon,
};

const ENTITY_DISPLAY_NAMES = {
  companies: 'Companies',
  contacts: 'Contacts',
  vehicles: 'Vehicles',
  drivers: 'Drivers',
  deals: 'Deals',
  invoices: 'Invoices',
  tasks: 'Tasks',
  leads: 'Leads',
  campaigns: 'Campaigns',
  services: 'Services',
};

const RELATIONSHIP_TYPES = [
  { value: 'one_to_many', label: 'One to Many', description: 'One parent can have many children' },
  { value: 'many_to_one', label: 'Many to One', description: 'Many children belong to one parent' },
  { value: 'one_to_one', label: 'One to One', description: 'Direct relationship between two entities' },
  { value: 'many_to_many', label: 'Many to Many', description: 'Multiple entities can relate to multiple entities' },
];

const RelationshipManager: React.FC<RelationshipManagerProps> = ({
  onSave,
  onCancel,
  initialRelationships = []
}) => {
  const [relationships, setRelationships] = useState<Relationship[]>(initialRelationships);
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);

  const [newRelationship, setNewRelationship] = useState({
    name: '',
    parent_entity: '',
    child_entity: '',
    relationship_type: 'one_to_many' as const,
    cascade_delete: false,
    display_field: 'name',
  });

  const addRelationship = () => {
    if (!newRelationship.name || !newRelationship.parent_entity || !newRelationship.child_entity) {
      alert('Please fill in all required fields');
      return;
    }

    if (newRelationship.parent_entity === newRelationship.child_entity) {
      alert('Parent and child entities cannot be the same');
      return;
    }

    const relationship: Relationship = {
      id: `rel_${Date.now()}`,
      ...newRelationship,
      created_at: new Date().toISOString(),
    };

    setRelationships([...relationships, relationship]);
    setNewRelationship({
      name: '',
      parent_entity: '',
      child_entity: '',
      relationship_type: 'one_to_many',
      cascade_delete: false,
      display_field: 'name',
    });
    setShowAddRelationship(false);
  };

  const deleteRelationship = (id: string) => {
    if (confirm('Are you sure you want to delete this relationship?')) {
      setRelationships(relationships.filter(r => r.id !== id));
    }
  };

  const handleSave = () => {
    onSave(relationships);
  };

  const getEntityIcon = (entity: string) => {
    const IconComponent = ENTITY_ICONS[entity as keyof typeof ENTITY_ICONS] || CogIcon;
    return <IconComponent className="h-5 w-5" />;
  };

  const getRelationshipDescription = (rel: Relationship) => {
    const parentName = ENTITY_DISPLAY_NAMES[rel.parent_entity as keyof typeof ENTITY_DISPLAY_NAMES] || rel.parent_entity;
    const childName = ENTITY_DISPLAY_NAMES[rel.child_entity as keyof typeof ENTITY_DISPLAY_NAMES] || rel.child_entity;
    
    switch (rel.relationship_type) {
      case 'one_to_many':
        return `One ${parentName} can have many ${childName}`;
      case 'many_to_one':
        return `Many ${childName} belong to one ${parentName}`;
      case 'one_to_one':
        return `Direct relationship between ${parentName} and ${childName}`;
      case 'many_to_many':
        return `Multiple ${parentName} can relate to multiple ${childName}`;
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Relationship Manager
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Define how your data entities relate to each other
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current Relationships */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Current Relationships ({relationships.length})
              </h4>
              <button
                onClick={() => setShowAddRelationship(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Relationship
              </button>
            </div>

            {relationships.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No relationships defined</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Start by adding relationships between your entities.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddRelationship(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add First Relationship
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {relationships.map((relationship) => (
                  <div key={relationship.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getEntityIcon(relationship.parent_entity)}
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {ENTITY_DISPLAY_NAMES[relationship.parent_entity as keyof typeof ENTITY_DISPLAY_NAMES] || relationship.parent_entity}
                          </span>
                        </div>
                        
                        <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                        
                        <div className="flex items-center space-x-2">
                          {getEntityIcon(relationship.child_entity)}
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {ENTITY_DISPLAY_NAMES[relationship.child_entity as keyof typeof ENTITY_DISPLAY_NAMES] || relationship.child_entity}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {relationship.relationship_type.replace('_', ' ')}
                        </span>
                        {relationship.cascade_delete && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Cascade Delete
                          </span>
                        )}
                        <button
                          onClick={() => deleteRelationship(relationship.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>{relationship.name}</strong> - {getRelationshipDescription(relationship)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Display field: {relationship.display_field}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Relationship Form */}
          {showAddRelationship && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Add New Relationship
              </h4>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Relationship Name
                  </label>
                  <input
                    type="text"
                    value={newRelationship.name}
                    onChange={(e) => setNewRelationship({ ...newRelationship, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Company Vehicles"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Relationship Type
                  </label>
                  <select
                    value={newRelationship.relationship_type}
                    onChange={(e) => setNewRelationship({ ...newRelationship, relationship_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {RELATIONSHIP_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parent Entity
                  </label>
                  <select
                    value={newRelationship.parent_entity}
                    onChange={(e) => setNewRelationship({ ...newRelationship, parent_entity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select parent entity...</option>
                    {Object.entries(ENTITY_DISPLAY_NAMES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Child Entity
                  </label>
                  <select
                    value={newRelationship.child_entity}
                    onChange={(e) => setNewRelationship({ ...newRelationship, child_entity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select child entity...</option>
                    {Object.entries(ENTITY_DISPLAY_NAMES)
                      .filter(([key]) => key !== newRelationship.parent_entity)
                      .map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Field
                  </label>
                  <input
                    type="text"
                    value={newRelationship.display_field}
                    onChange={(e) => setNewRelationship({ ...newRelationship, display_field: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., name, title"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRelationship.cascade_delete}
                      onChange={(e) => setNewRelationship({ ...newRelationship, cascade_delete: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Cascade Delete</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Preview:</strong> {newRelationship.parent_entity && newRelationship.child_entity && 
                    `${ENTITY_DISPLAY_NAMES[newRelationship.parent_entity as keyof typeof ENTITY_DISPLAY_NAMES] || newRelationship.parent_entity} → ${ENTITY_DISPLAY_NAMES[newRelationship.child_entity as keyof typeof ENTITY_DISPLAY_NAMES] || newRelationship.child_entity} (${newRelationship.relationship_type.replace('_', ' ')})`
                  }
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddRelationship(false);
                    setNewRelationship({
                      name: '',
                      parent_entity: '',
                      child_entity: '',
                      relationship_type: 'one_to_many',
                      cascade_delete: false,
                      display_field: 'name',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={addRelationship}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Relationship
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Relationships
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationshipManager;




