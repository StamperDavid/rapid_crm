import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DocumentIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  SupportIcon,
  SaveIcon,
  XIcon
} from '@heroicons/react/outline';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  estimatedDuration: string;
  requirements: string[];
  deliverables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const EditService: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Registration',
    basePrice: 0,
    estimatedDuration: '',
    requirements: [] as string[],
    deliverables: [] as string[]
  });

  // Mock service data - in real app, this would come from API
  const mockServices: Service[] = [
    {
      id: '1',
      name: 'USDOT Number Registration',
      description: 'Complete USDOT number registration for commercial vehicles operating in interstate commerce or intrastate carriers hauling hazardous materials.',
      category: 'Registration',
      basePrice: 299,
      estimatedDuration: '1-2 business days',
      requirements: [
        'Legal business name and address',
        'Business type and EIN',
        'Fleet information',
        'Operation type details'
      ],
      deliverables: [
        'USDOT number assignment',
        'Registration confirmation',
        'Compliance documentation'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      name: 'Operating Authority (MC Number)',
      description: 'Motor Carrier number registration required for for-hire carriers transporting regulated commodities across state lines.',
      category: 'Registration',
      basePrice: 399,
      estimatedDuration: '2-4 weeks',
      requirements: [
        'USDOT number',
        'BOC-3 filing',
        'Insurance documentation',
        'Business authority details'
      ],
      deliverables: [
        'MC number assignment',
        'Operating authority certificate',
        'Compliance documentation'
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
    // Add more mock services as needed
  ];

  useEffect(() => {
    // Simulate loading service data
    const loadService = async () => {
      setLoading(true);
      try {
        // In real app, this would be an API call
        const foundService = mockServices.find(s => s.id === id);
        if (foundService) {
          setService(foundService);
          setFormData({
            name: foundService.name,
            description: foundService.description,
            category: foundService.category,
            basePrice: foundService.basePrice,
            estimatedDuration: foundService.estimatedDuration,
            requirements: [...foundService.requirements],
            deliverables: [...foundService.deliverables]
          });
        } else {
          // Service not found, redirect to services list
          navigate('/services');
        }
      } catch (error) {
        console.error('Error loading service:', error);
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'basePrice' ? parseFloat(value) || 0 : value
    }));
  };

  const handleArrayItemChange = (arrayName: 'requirements' | 'deliverables', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (arrayName: 'requirements' | 'deliverables') => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], '']
    }));
  };

  const removeArrayItem = (arrayName: 'requirements' | 'deliverables', index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In real app, this would be an API call to update the service
      console.log('Saving service:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Service updated successfully!');
      navigate('/services');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Error saving service. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading service...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Service not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/services')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Edit Service
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Modify service details and configuration
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/services')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Service Information
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter service name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Registration">Registration</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Training">Training</option>
                  <option value="Support">Support</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter service description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Base Price ($)
                </label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="299"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="1-2 business days"
                />
              </div>
            </div>

            {/* Requirements */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Requirements
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem('requirements')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Add Requirement
                </button>
              </div>
              <div className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleArrayItemChange('requirements', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter requirement"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('requirements', index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverables */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deliverables
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem('deliverables')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Add Deliverable
                </button>
              </div>
              <div className="space-y-2">
                {formData.deliverables.map((del, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={del}
                      onChange={(e) => handleArrayItemChange('deliverables', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter deliverable"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('deliverables', index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditService;


