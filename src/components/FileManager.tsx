import React, { useState } from 'react';
import { 
  DocumentIcon, 
  PhotographIcon, 
  VideoCameraIcon, 
  SpeakerphoneIcon,
  ArchiveBoxIcon,
  PlusIcon
} from '@heroicons/react/outline';
import FileImportExport from './FileImportExport';
import { FileCategory, ComplianceDocumentType } from '../services/importExportService';

interface FileManagerProps {
  entityId?: string;
  entityType?: string;
  onFilesChanged?: () => void;
}

const FileManager: React.FC<FileManagerProps> = ({
  entityId,
  entityType,
  onFilesChanged
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'browse'>('upload');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('compliance_documents');

  const categories: { key: FileCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'compliance_documents', label: 'Compliance Documents', icon: <DocumentIcon className="h-5 w-5" /> },
    { key: 'insurance_certificates', label: 'Insurance Certificates', icon: <DocumentIcon className="h-5 w-5" /> },
    { key: 'driver_qualifications', label: 'Driver Qualifications', icon: <DocumentIcon className="h-5 w-5" /> },
    { key: 'vehicle_documents', label: 'Vehicle Documents', icon: <DocumentIcon className="h-5 w-5" /> },
    { key: 'business_licenses', label: 'Business Licenses', icon: <DocumentIcon className="h-5 w-5" /> },
    { key: 'financial_documents', label: 'Financial Documents', icon: <DocumentIcon className="h-5 w-5" /> },
    { key: 'communication_records', label: 'Communication Records', icon: <SpeakerphoneIcon className="h-5 w-5" /> },
    { key: 'training_materials', label: 'Training Materials', icon: <DocumentIcon className="h-5 w-5" /> },
    { key: 'audit_documents', label: 'Audit Documents', icon: <DocumentIcon className="h-5 w-5" /> },
    { key: 'other', label: 'Other Files', icon: <ArchiveBoxIcon className="h-5 w-5" /> }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">File Manager</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'upload'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <PlusIcon className="h-4 w-4 inline mr-1" />
              Upload Files
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'browse'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Browse Files
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'upload' ? (
          <div className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                File Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`flex items-center p-3 border rounded-lg text-left transition-colors ${
                      selectedCategory === category.key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {category.icon}
                    <span className="ml-2 text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <FileImportExport
              relatedEntityId={entityId}
              relatedEntityType={entityType}
              allowedCategories={[selectedCategory]}
              maxFiles={20}
              onFilesImported={(results) => {
                console.log('Files imported:', results);
                onFilesChanged?.();
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Browser Placeholder */}
            <div className="text-center py-12">
              <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No files uploaded yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload files using the "Upload Files" tab to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;
