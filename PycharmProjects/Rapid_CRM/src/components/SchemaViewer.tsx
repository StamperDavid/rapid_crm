import React, { useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

interface SchemaViewerProps {
  entityType: string;
  onCreate: (data: any) => void;
  onEdit: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

const SchemaViewer: React.FC<SchemaViewerProps> = ({ entityType, onCreate, onEdit, onDelete }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Mock data for different entity types
  const getMockData = () => {
    switch (entityType) {
      case 'companies':
        return [
          { id: 1, name: 'Acme Transportation', industry: 'Logistics', email: 'contact@acmetrans.com' },
          { id: 2, name: 'Global Shipping Co', industry: 'Maritime', email: 'info@globalshipping.com' },
        ];
      case 'contacts':
        return [
          { id: 1, first_name: 'John', last_name: 'Smith', email: 'john@acmetrans.com', company: 'Acme Transportation' },
          { id: 2, first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@globalshipping.com', company: 'Global Shipping Co' },
        ];
      case 'drivers':
        return [
          { id: 1, first_name: 'Mike', last_name: 'Davis', license_number: 'DL123456', cdl_class: 'A' },
          { id: 2, first_name: 'Lisa', last_name: 'Wilson', license_number: 'DL789012', cdl_class: 'B' },
        ];
      case 'vehicles':
        return [
          { id: 1, make: 'Freightliner', model: 'Cascadia', year: 2022, vin: '1FUJGBDV8NLBT1234' },
          { id: 2, make: 'Peterbilt', model: '579', year: 2021, vin: '1NP5DB0X8MN567890' },
        ];
      case 'deals':
        return [
          { id: 1, name: 'Acme Contract', amount: 150000, stage: 'negotiation', probability: 75 },
          { id: 2, name: 'Global Partnership', amount: 250000, stage: 'proposal', probability: 60 },
        ];
      default:
        return [];
    }
  };

  const getSchema = () => {
    switch (entityType) {
      case 'companies':
        return {
          name: 'Company Name',
          industry: 'Industry',
          email: 'Email',
          phone: 'Phone',
          website: 'Website',
          address: 'Address',
          status: 'Status'
        };
      case 'contacts':
        return {
          first_name: 'First Name',
          last_name: 'Last Name',
          email: 'Email',
          phone: 'Phone',
          title: 'Title',
          company: 'Company',
          is_primary: 'Primary Contact'
        };
      case 'drivers':
        return {
          first_name: 'First Name',
          last_name: 'Last Name',
          license_number: 'License Number',
          license_state: 'License State',
          license_expiry: 'License Expiry',
          cdl_class: 'CDL Class'
        };
      case 'vehicles':
        return {
          make: 'Make',
          model: 'Model',
          year: 'Year',
          vin: 'VIN',
          license_plate: 'License Plate',
          vehicle_type: 'Vehicle Type'
        };
      case 'deals':
        return {
          name: 'Deal Name',
          amount: 'Amount',
          stage: 'Stage',
          probability: 'Probability',
          close_date: 'Close Date',
          status: 'Status'
        };
      default:
        return {};
    }
  };

  const data = getMockData();
  const schema = getSchema();

  const handleCreate = (formData: any) => {
    onCreate(formData);
    setShowCreateModal(false);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
  };

  const handleSaveEdit = (formData: any) => {
    onEdit(editingItem.id, formData);
    setEditingItem(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDelete(id.toString());
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Data
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage your {entityType} data
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New {entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)}
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {Object.keys(schema).map((field) => (
                  <th
                    key={field}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {schema[field as keyof typeof schema]}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((item) => (
                <tr key={item.id}>
                  {Object.keys(schema).map((field) => (
                    <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {item[field as keyof typeof item]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-12">
            <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No data</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new {entityType.slice(0, -1)}.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New {entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateModal
          entityType={entityType}
          schema={schema}
          onSave={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <EditModal
          entityType={entityType}
          schema={schema}
          item={editingItem}
          onSave={handleSaveEdit}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </div>
  );
};

// Create Modal Component
interface CreateModalProps {
  entityType: string;
  schema: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const CreateModal: React.FC<CreateModalProps> = ({ entityType, schema, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Create New {entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {Object.keys(schema).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {schema[field]}
                </label>
                <input
                  type="text"
                  value={formData[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            ))}
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
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Modal Component
interface EditModalProps {
  entityType: string;
  schema: any;
  item: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ entityType, schema, item, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Record<string, any>>(item);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Edit {entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {Object.keys(schema).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {schema[field]}
                </label>
                <input
                  type="text"
                  value={formData[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            ))}
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
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchemaViewer;