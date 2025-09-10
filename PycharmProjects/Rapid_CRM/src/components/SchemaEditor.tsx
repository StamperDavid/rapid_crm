import React, { useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface FieldDefinition {
  id: string;
  name: string;
  display_name: string;
  field_type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'textarea' | 'email' | 'phone';
  is_required: boolean;
  is_unique: boolean;
  options?: string[];
  default_value?: string;
  validation_rules?: any;
  order: number;
}

interface SchemaEditorProps {
  entityType: string;
  onSave: (schema: FieldDefinition[]) => void;
  onCancel: () => void;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({ entityType, onSave, onCancel }) => {
  const [fields, setFields] = useState<FieldDefinition[]>([
    // Default fields for each entity type
    ...(entityType === 'companies' ? [
      { id: '1', name: 'name', display_name: 'Company Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 1 },
      { id: '2', name: 'industry', display_name: 'Industry', field_type: 'text' as const, is_required: false, is_unique: false, order: 2 },
      { id: '3', name: 'email', display_name: 'Email', field_type: 'email' as const, is_required: false, is_unique: false, order: 3 },
      { id: '4', name: 'phone', display_name: 'Phone', field_type: 'phone' as const, is_required: false, is_unique: false, order: 4 },
      { id: '5', name: 'website', display_name: 'Website', field_type: 'text' as const, is_required: false, is_unique: false, order: 5 },
      { id: '6', name: 'address', display_name: 'Address', field_type: 'textarea' as const, is_required: false, is_unique: false, order: 6 },
      { id: '7', name: 'status', display_name: 'Status', field_type: 'select' as const, is_required: false, is_unique: false, options: ['active', 'inactive', 'prospect'], order: 7 },
    ] : []),
    ...(entityType === 'contacts' ? [
      { id: '1', name: 'first_name', display_name: 'First Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 1 },
      { id: '2', name: 'last_name', display_name: 'Last Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 2 },
      { id: '3', name: 'email', display_name: 'Email', field_type: 'email' as const, is_required: false, is_unique: false, order: 3 },
      { id: '4', name: 'phone', display_name: 'Phone', field_type: 'phone' as const, is_required: false, is_unique: false, order: 4 },
      { id: '5', name: 'title', display_name: 'Title', field_type: 'text' as const, is_required: false, is_unique: false, order: 5 },
      { id: '6', name: 'is_primary', display_name: 'Primary Contact', field_type: 'boolean' as const, is_required: false, is_unique: false, order: 6 },
    ] : []),
    ...(entityType === 'drivers' ? [
      { id: '1', name: 'first_name', display_name: 'First Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 1 },
      { id: '2', name: 'last_name', display_name: 'Last Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 2 },
      { id: '3', name: 'license_number', display_name: 'License Number', field_type: 'text' as const, is_required: false, is_unique: true, order: 3 },
      { id: '4', name: 'license_state', display_name: 'License State', field_type: 'text' as const, is_required: false, is_unique: false, order: 4 },
      { id: '5', name: 'license_expiry', display_name: 'License Expiry', field_type: 'date' as const, is_required: false, is_unique: false, order: 5 },
      { id: '6', name: 'cdl_class', display_name: 'CDL Class', field_type: 'select' as const, is_required: false, is_unique: false, options: ['A', 'B', 'C'], order: 6 },
    ] : []),
    ...(entityType === 'vehicles' ? [
      { id: '1', name: 'make', display_name: 'Make', field_type: 'text' as const, is_required: false, is_unique: false, order: 1 },
      { id: '2', name: 'model', display_name: 'Model', field_type: 'text' as const, is_required: false, is_unique: false, order: 2 },
      { id: '3', name: 'year', display_name: 'Year', field_type: 'number' as const, is_required: false, is_unique: false, order: 3 },
      { id: '4', name: 'vin', display_name: 'VIN', field_type: 'text' as const, is_required: false, is_unique: true, order: 4 },
      { id: '5', name: 'license_plate', display_name: 'License Plate', field_type: 'text' as const, is_required: false, is_unique: false, order: 5 },
      { id: '6', name: 'vehicle_type', display_name: 'Vehicle Type', field_type: 'select' as const, is_required: false, is_unique: false, options: ['truck', 'trailer', 'bus', 'van'], order: 6 },
    ] : []),
    ...(entityType === 'deals' ? [
      { id: '1', name: 'name', display_name: 'Deal Name', field_type: 'text' as const, is_required: true, is_unique: false, order: 1 },
      { id: '2', name: 'amount', display_name: 'Amount', field_type: 'number' as const, is_required: false, is_unique: false, order: 2 },
      { id: '3', name: 'stage', display_name: 'Stage', field_type: 'select' as const, is_required: false, is_unique: false, options: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'], order: 3 },
      { id: '4', name: 'probability', display_name: 'Probability (%)', field_type: 'number' as const, is_required: false, is_unique: false, order: 4 },
      { id: '5', name: 'close_date', display_name: 'Close Date', field_type: 'date' as const, is_required: false, is_unique: false, order: 5 },
      { id: '6', name: 'status', display_name: 'Status', field_type: 'select' as const, is_required: false, is_unique: false, options: ['open', 'won', 'lost'], order: 6 },
    ] : []),
  ]);

  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);
  const [showAddField, setShowAddField] = useState(false);

  const addField = () => {
    const newField: FieldDefinition = {
      id: Date.now().toString(),
      name: '',
      display_name: '',
      field_type: 'text',
      is_required: false,
      is_unique: false,
      order: fields.length + 1,
    };
    setFields([...fields, newField]);
    setEditingField(newField);
  };

  const updateField = (updatedField: FieldDefinition) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
    setEditingField(null);
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
    
    // Update order numbers
    newFields.forEach((field, index) => {
      field.order = index + 1;
    });
    
    setFields(newFields);
  };

  const handleSave = () => {
    onSave(fields);
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'boolean': return '☑️';
      case 'select': return '📋';
      case 'textarea': return '📄';
      case 'email': return '📧';
      case 'phone': return '📞';
      default: return '📝';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Edit Schema: {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Define the fields and properties for this entity type
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Save Schema
              </button>
              <button
                onClick={onCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>

          {/* Fields List */}
          <div className="space-y-4">
            {fields
              .sort((a, b) => a.order - b.order)
              .map((field, index) => (
                <div key={field.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFieldTypeIcon(field.field_type)}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {field.display_name || 'Unnamed Field'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {field.name || 'No field name'} • {field.field_type}
                          {field.is_required && ' • Required'}
                          {field.is_unique && ' • Unique'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveField(field.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveField(field.id, 'down')}
                        disabled={index === fields.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => setEditingField(field)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit field"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteField(field.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete field"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Add Field Button */}
          <div className="mt-6">
            <button
              onClick={addField}
              className="inline-flex items-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Field
            </button>
          </div>
        </div>
      </div>

      {/* Field Editor Modal */}
      {editingField && (
        <FieldEditor
          field={editingField}
          onSave={updateField}
          onCancel={() => setEditingField(null)}
        />
      )}
    </div>
  );
};

// Field Editor Component
interface FieldEditorProps {
  field: FieldDefinition;
  onSave: (field: FieldDefinition) => void;
  onCancel: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onSave, onCancel }) => {
  const [editedField, setEditedField] = useState<FieldDefinition>({ ...field });

  const handleSave = () => {
    if (!editedField.name || !editedField.display_name) {
      alert('Field name and display name are required');
      return;
    }
    onSave(editedField);
  };

  const addOption = () => {
    const newOptions = [...(editedField.options || []), ''];
    setEditedField({ ...editedField, options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(editedField.options || [])];
    newOptions[index] = value;
    setEditedField({ ...editedField, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = editedField.options?.filter((_, i) => i !== index) || [];
    setEditedField({ ...editedField, options: newOptions });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Edit Field
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Field Name *
              </label>
              <input
                type="text"
                value={editedField.name}
                onChange={(e) => setEditedField({ ...editedField, name: e.target.value })}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., company_name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Display Name *
              </label>
              <input
                type="text"
                value={editedField.display_name}
                onChange={(e) => setEditedField({ ...editedField, display_name: e.target.value })}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Field Type
              </label>
              <select
                value={editedField.field_type}
                onChange={(e) => setEditedField({ ...editedField, field_type: e.target.value as any })}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="boolean">Boolean (Yes/No)</option>
                <option value="select">Select (Dropdown)</option>
                <option value="textarea">Text Area</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>

            {editedField.field_type === 'select' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Options
                </label>
                <div className="mt-1 space-y-2">
                  {editedField.options?.map((option, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Option value"
                      />
                      <button
                        onClick={() => removeOption(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Value
              </label>
              <input
                type="text"
                value={editedField.default_value || ''}
                onChange={(e) => setEditedField({ ...editedField, default_value: e.target.value })}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Default value"
              />
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editedField.is_required}
                  onChange={(e) => setEditedField({ ...editedField, is_required: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Required</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editedField.is_unique}
                  onChange={(e) => setEditedField({ ...editedField, is_unique: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Unique</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Field
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaEditor;