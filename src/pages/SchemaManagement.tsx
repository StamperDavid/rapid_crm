import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  TruckIcon,
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import SchemaEditor from '../components/SchemaEditor';
import { schemaService, SchemaDefinition } from '../services/schemaService';

const SchemaManagement: React.FC = () => {
  const [selectedEntityType, setSelectedEntityType] = useState<string | null>(null);
  const [showCreateCustomObject, setShowCreateCustomObject] = useState(false);
  const [schemas, setSchemas] = useState<SchemaDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load schemas on component mount
  useEffect(() => {
    const loadSchemas = async () => {
      try {
        setIsLoading(true);
        const schemaData = await schemaService.getSchemas();
        console.log('Loaded schemas:', schemaData);
        setSchemas(schemaData);
      } catch (error) {
        console.error('Failed to load schemas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchemas();
  }, []);

  // Combine system and custom schemas
  const allSchemas = [
    // System schemas
    {
      id: 'companies',
      name: 'Companies',
      description: 'Company and organization information',
      icon: BuildingOfficeIcon,
      color: 'blue',
      category: 'Core CRM',
      isSystem: true,
    },
    {
      id: 'contacts',
      name: 'Contacts',
      description: 'Individual contact information',
      icon: UserGroupIcon,
      color: 'green',
      category: 'Core CRM',
      isSystem: true,
    },
    {
      id: 'drivers',
      name: 'Drivers',
      description: 'Driver and employee information',
      icon: TruckIcon,
      color: 'yellow',
      category: 'Transportation',
      isSystem: true,
    },
    {
      id: 'vehicles',
      name: 'Vehicles',
      description: 'Vehicle and equipment information',
      icon: TruckIcon,
      color: 'purple',
      category: 'Transportation',
      isSystem: true,
    },
    {
      id: 'deals',
      name: 'Deals',
      description: 'Sales opportunities and deals',
      icon: CurrencyDollarIcon,
      color: 'indigo',
      category: 'Sales',
      isSystem: true,
    },
    // Add custom schemas from the service
    ...schemas.map(schema => ({
      id: schema.name,
      name: schema.display_name,
      description: schema.description || `Custom schema: ${schema.table_name}`,
      icon: CogIcon,
      color: 'gray',
      category: 'Custom',
      isSystem: false,
      schemaData: schema,
    }))
  ];

  // Group schemas by category
  const groupedSchemas = allSchemas.reduce((groups, schema) => {
    const category = schema.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(schema);
    return groups;
  }, {} as Record<string, typeof allSchemas>);

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100',
      gray: 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const handleEditSchema = (entityType: string) => {
    setSelectedEntityType(entityType);
  };

  const handleDeleteCustomSchema = async (schemaName: string) => {
    if (confirm(`Are you sure you want to delete the schema "${schemaName}"? This will also delete all associated data.`)) {
      try {
        await schemaService.deleteSchema(schemaName);
        
        // Reload schemas
        const updatedSchemas = await schemaService.getSchemas();
        setSchemas(updatedSchemas);
        
        alert('Schema deleted successfully!');
      } catch (error) {
        console.error('Failed to delete schema:', error);
        alert('Failed to delete schema. Please try again.');
      }
    }
  };

  const handleSaveSchema = async (fields: any[]) => {
    try {
      if (selectedEntityType) {
        const entityTypes = [
          { id: 'companies', name: 'Companies' },
          { id: 'contacts', name: 'Contacts' },
          { id: 'drivers', name: 'Drivers' },
          { id: 'vehicles', name: 'Vehicles' },
          { id: 'deals', name: 'Deals' }
        ];
        const schemaData = {
          name: selectedEntityType,
          display_name: entityTypes.find((e: any) => e.id === selectedEntityType)?.name || selectedEntityType,
          description: `Schema for ${selectedEntityType}`,
          table_name: selectedEntityType,
          fields: fields,
          is_system: true
        };

        await schemaService.createSchema(schemaData);
        
        // Reload schemas
        const updatedSchemas = await schemaService.getSchemas();
        setSchemas(updatedSchemas);
        
        setSelectedEntityType(null);
        alert('Schema saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save schema:', error);
      alert('Failed to save schema. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setSelectedEntityType(null);
  };

  const handleDeleteSchema = async (schemaName: string) => {
    if (confirm(`Are you sure you want to delete the schema "${schemaName}"? This will also delete the database table and all data.`)) {
      try {
        await schemaService.deleteSchema(schemaName);
        
        // Reload schemas
        const updatedSchemas = await schemaService.getSchemas();
        setSchemas(updatedSchemas);
        
        alert('Schema deleted successfully!');
      } catch (error) {
        console.error('Failed to delete schema:', error);
        alert('Failed to delete schema. Please try again.');
      }
    }
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

        {/* Grouped Schemas */}
        {Object.entries(groupedSchemas).map(([category, categorySchemas]) => (
          <div key={category} className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {category}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {category === 'Core CRM' && 'Essential CRM entities for managing your business'}
                {category === 'Transportation' && 'Transportation and logistics related entities'}
                {category === 'Sales' && 'Sales and revenue tracking entities'}
                {category === 'Custom' && 'Your custom data structures'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categorySchemas.map((entity) => {
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
                          {!entity.isSystem && (entity as any).schemaData && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {(entity as any).schemaData.fields.length} fields • Created {new Date((entity as any).schemaData.created_at).toLocaleDateString()}
                            </p>
                          )}
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
                        {!entity.isSystem && (
                          <button
                            onClick={() => handleDeleteCustomSchema(entity.id)}
                            className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

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
          onSave={async (customObject) => {
            console.log('Custom object created:', customObject);
            setShowCreateCustomObject(false);
            
            // Reload schemas to show the new object
            try {
              const updatedSchemas = await schemaService.getSchemas();
              setSchemas(updatedSchemas);
              alert('Custom object created successfully!');
            } catch (error) {
              console.error('Failed to reload schemas:', error);
            }
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
    category: 'Custom',
  });
  const [fields, setFields] = useState<any[]>([]);
  const [showAddField, setShowAddField] = useState(false);

  const addField = () => {
    const newField = {
      id: Date.now().toString(),
      name: '',
      display_name: '',
      field_type: 'text',
      is_required: false,
      is_unique: false,
      order: fields.length + 1,
    };
    setFields([...fields, newField]);
    setShowAddField(true);
  };

  const updateField = (fieldId: string, updates: any) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.display_name) {
      alert('Name and display name are required');
      return;
    }
    
    try {
      const customObject = {
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        display_name: formData.display_name,
        description: formData.description,
        table_name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        fields: fields,
        is_system: false
      };
      
      await schemaService.createSchema(customObject);
      onSave(customObject);
    } catch (error) {
      console.error('Failed to create custom object:', error);
      alert('Failed to create custom object. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Create Custom Object
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Describe what this object represents..."
              />
            </div>

            {/* Fields Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                  Fields ({fields.length})
                </h4>
                <button
                  type="button"
                  onClick={addField}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Field
                </button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <CogIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No fields yet. Add your first field to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Field Name
                          </label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="e.g., product_name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={field.display_name}
                            onChange={(e) => updateField(field.id, { display_name: e.target.value })}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="e.g., Product Name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Type
                          </label>
                          <select
                            value={field.field_type}
                            onChange={(e) => updateField(field.id, { field_type: e.target.value })}
                            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="date">Date</option>
                            <option value="boolean">Yes/No</option>
                            <option value="textarea">Text Area</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.is_required}
                              onChange={(e) => updateField(field.id, { is_required: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Required</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.is_unique}
                              onChange={(e) => updateField(field.id, { is_unique: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Unique</span>
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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