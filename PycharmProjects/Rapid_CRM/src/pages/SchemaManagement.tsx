import React, { useState } from 'react';
import {
  CogIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  TruckIcon,
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import SchemaEditor from '../components/SchemaEditor';

const SchemaManagement: React.FC = () => {
  const [selectedEntityType, setSelectedEntityType] = useState<string | null>(null);
  const [showCreateCustomObject, setShowCreateCustomObject] = useState(false);

  const entityTypes = [
    {
      id: 'companies',
      name: 'Companies',
      description: 'Company and organization information',
      icon: BuildingOfficeIcon,
      color: 'blue',
    },
    {
      id: 'contacts',
      name: 'Contacts',
      description: 'Individual contact information',
      icon: UserGroupIcon,
      color: 'green',
    },
    {
      id: 'drivers',
      name: 'Drivers',
      description: 'Driver and employee information',
      icon: TruckIcon,
      color: 'yellow',
    },
    {
      id: 'vehicles',
      name: 'Vehicles',
      description: 'Vehicle and equipment information',
      icon: TruckIcon,
      color: 'purple',
    },
    {
      id: 'deals',
      name: 'Deals',
      description: 'Sales opportunities and deals',
      icon: CurrencyDollarIcon,
      color: 'indigo',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const handleEditSchema = (entityType: string) => {
    setSelectedEntityType(entityType);
  };

  const handleSaveSchema = (schema: any) => {
    console.log(`Schema saved for ${selectedEntityType}:`, schema);
    setSelectedEntityType(null);
  };

  const handleCancelEdit = () => {
    setSelectedEntityType(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Schema Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Define and customize the structure of your data entities
              </p>
            </div>
            <button
              onClick={() => setShowCreateCustomObject(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Custom Object
            </button>
          </div>
        </div>

        {/* Entity Types Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entityTypes.map((entity) => {
            const IconComponent = entity.icon;
            return (
              <div
                key={entity.id}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 p-3 rounded-lg ${getColorClasses(entity.color)}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {entity.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {entity.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => handleEditSchema(entity.id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Schema
                    </button>
                    <button
                      onClick={() => {
                        console.log(`Preview schema for ${entity.id}`);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Objects Section */}
        <div className="mt-12">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Custom Objects
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create custom data structures for your specific business needs
              </p>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No custom objects yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating your first custom object.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateCustomObject(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Custom Object
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schema Editor Modal */}
      {selectedEntityType && (
        <SchemaEditor
          entityType={selectedEntityType}
          onSave={handleSaveSchema}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Create Custom Object Modal */}
      {showCreateCustomObject && (
        <CreateCustomObjectModal
          onSave={(customObject) => {
            console.log('Custom object created:', customObject);
            setShowCreateCustomObject(false);
          }}
          onCancel={() => setShowCreateCustomObject(false)}
        />
      )}
    </div>
  );
};

// Create Custom Object Modal Component
interface CreateCustomObjectModalProps {
  onSave: (customObject: any) => void;
  onCancel: () => void;
}

const CreateCustomObjectModal: React.FC<CreateCustomObjectModalProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.display_name) {
      alert('Name and display name are required');
      return;
    }
    
    const customObject = {
      ...formData,
      table_name: formData.name.toLowerCase().replace(/\s+/g, '_'),
      created_at: new Date().toISOString(),
    };
    
    onSave(customObject);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Create Custom Object
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Object Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., products"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Display Name *
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Products"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Describe what this object represents..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Object
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchemaManagement;