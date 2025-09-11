import React, { useState, useEffect } from 'react';
import { Person, Organization, Driver, PERSON_FIELD_GROUPS, ORGANIZATION_FIELD_GROUPS, DRIVER_FIELD_GROUPS, SELECT_OPTIONS } from '../../types/schema';
import { databaseService } from '../../services/database';
// import FileUpload from './FileUpload';

interface EntityFormProps {
  entityType: string;
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const EntityForm: React.FC<EntityFormProps> = ({ 
  entityType, 
  initialData = {}, 
  onSave, 
  onCancel, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState<any>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  // Load companies for companyId dropdown
  useEffect(() => {
    if (entityType === 'drivers' || entityType === 'contacts') {
      loadCompanies();
    }
  }, [entityType]);

  const loadCompanies = async () => {
    try {
      const companiesData = await databaseService.getCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const getFieldGroups = () => {
    switch (entityType) {
      case 'contacts':
        return PERSON_FIELD_GROUPS;
      case 'companies':
        return ORGANIZATION_FIELD_GROUPS;
      case 'drivers':
        return DRIVER_FIELD_GROUPS;
      default:
        return [];
    }
  };

  const getDefaultValues = () => {
    const defaults: any = {};
    
    switch (entityType) {
      case 'contacts':
        defaults.firstName = '';
        defaults.lastName = '';
        defaults.email = '';
        defaults.phone = '';
        defaults.companyId = '';
        break;
      case 'companies':
        defaults.legalBusinessName = '';
        defaults.dba = '';
        defaults.industry = '';
        defaults.website = '';
        defaults.phone = '';
        defaults.email = '';
        break;
      case 'drivers':
        defaults.firstName = '';
        defaults.lastName = '';
        defaults.email = '';
        defaults.phone = '';
        defaults.licenseNumber = '';
        defaults.licenseState = '';
        defaults.licenseExpirationDate = '';
        defaults.medicalCardNumber = '';
        defaults.medicalCardExpirationDate = '';
        defaults.drugTestDate = '';
        defaults.drugTestResult = '';
        defaults.backgroundCheckDate = '';
        defaults.backgroundCheckResult = '';
        defaults.employmentStartDate = '';
        defaults.employmentStatus = 'active';
        defaults.companyId = '';
        break;
    }
    
    return defaults;
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Basic validation
    if (entityType === 'contacts' || entityType === 'drivers') {
      if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email?.trim()) newErrors.email = 'Email is required';
    }
    
    if (entityType === 'companies') {
      if (!formData.legalBusinessName?.trim()) newErrors.legalBusinessName = 'Legal business name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: string, label: string, type: string = 'text') => {
    const value = formData[field] || '';
    const error = errors[field];

    // Special handling for companyId dropdown
    if (field === 'companyId') {
      return (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <select
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
              error ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">Select Company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.legalBusinessName}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      );
    }

    if (field.includes('Document') || field.includes('Copy') || field.includes('Application') || field.includes('Report') || field.includes('Certificate') || field.includes('Test') || field.includes('Inquiry') || field.includes('Policy')) {
      return (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-500">File upload component not implemented yet</p>
          </div>
          {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      );
    }

    if (type === 'select') {
      const options = (SELECT_OPTIONS as any)[field] || [];
      return (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <select
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
              error ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">Select {label}</option>
            {options.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            rows={3}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
              error ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      );
    }

    if (type === 'checkbox') {
      return (
        <div key={field} className="flex items-center">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleFieldChange(field, e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            {label}
          </label>
          {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      );
    }

    return (
      <div key={field}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
            error ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  };

  const getFieldType = (field: string) => {
    if (field.includes('email')) return 'email';
    if (field.includes('phone')) return 'tel';
    if (field.includes('date') || field.includes('Date')) return 'date';
    if (field.includes('number') || field.includes('Number')) return 'number';
    if (field.includes('website') || field.includes('Website')) return 'url';
    if ((SELECT_OPTIONS as any)[field]) return 'select';
    if (field.includes('description') || field.includes('notes')) return 'textarea';
    if (field.includes('is') || field.includes('has')) return 'checkbox';
    return 'text';
  };

  const getFieldLabel = (field: string) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  try {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              {isEditing ? 'Edit' : 'Create New'} {entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {getFieldGroups().map((group) => (
                <div key={group.name} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
                    {group.name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.fields.map((field) => {
                      const fieldType = getFieldType(field);
                      const fieldLabel = getFieldLabel(field);
                      return renderField(field, fieldLabel, fieldType);
                    })}
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in EntityForm:', error);
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">Error loading form</p>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default EntityForm;