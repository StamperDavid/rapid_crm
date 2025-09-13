import React, { useState, useRef, useCallback } from 'react';
import { 
  CloudUploadIcon, 
  DocumentDownloadIcon, 
  XIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationIcon,
  InformationCircleIcon
} from '@heroicons/react/outline';
import { 
  importExportService, 
  FileImportResult, 
  FileMetadata, 
  FileCategory, 
  ComplianceDocumentType,
  ImportResult,
  EntityType
} from '../services/importExportService';

interface FileImportExportProps {
  entityType?: EntityType;
  relatedEntityId?: string;
  relatedEntityType?: string;
  onFilesImported?: (results: FileImportResult[]) => void;
  onDataImported?: (result: ImportResult) => void;
  allowedCategories?: FileCategory[];
  maxFiles?: number;
  className?: string;
}

interface FilePreview {
  file: File;
  preview: string;
  metadata: Partial<FileMetadata>;
}

const FileImportExport: React.FC<FileImportExportProps> = ({
  entityType,
  relatedEntityId,
  relatedEntityType,
  onFilesImported,
  onDataImported,
  allowedCategories = [],
  maxFiles = 10,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<FileImportResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FilePreview | null>(null);
  const [metadata, setMetadata] = useState<Partial<FileMetadata>>({
    category: 'compliance_documents',
    accessLevel: 'internal',
    isConfidential: false,
    tags: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  // Handle file selection
  const handleFiles = async (newFiles: File[]) => {
    if (files.length + newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const filePreviews: FilePreview[] = [];

    for (const file of newFiles) {
      // Check if category is allowed
      const category = importExportService.getFileCategory(file);
      if (allowedCategories.length > 0 && !allowedCategories.includes(category)) {
        alert(`File type "${category}" is not allowed`);
        continue;
      }

      const preview: FilePreview = {
        file,
        preview: importExportService.getFilePreviewUrl(file),
        metadata: await importExportService.extractFileMetadata(file)
      };

      filePreviews.push(preview);
    }

    setFiles(prev => [...prev, ...filePreviews]);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Update file metadata
  const updateFileMetadata = (index: number, updates: Partial<FileMetadata>) => {
    setFiles(prev => prev.map((file, i) => 
      i === index 
        ? { ...file, metadata: { ...file.metadata, ...updates } }
        : file
    ));
  };

  // Import files
  const handleImport = async () => {
    if (files.length === 0) return;

    setImporting(true);
    const results: FileImportResult[] = [];

    for (const filePreview of files) {
      try {
        const result = await importExportService.importFile(
          filePreview.file,
          filePreview.metadata,
          relatedEntityId,
          relatedEntityType
        );
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          fileId: '',
          fileName: filePreview.file.name,
          fileSize: filePreview.file.size,
          fileType: filePreview.file.type,
          mimeType: filePreview.file.type,
          uploadedAt: new Date().toISOString(),
          metadata: filePreview.metadata as FileMetadata,
          errors: [error instanceof Error ? error.message : 'Unknown error occurred']
        });
      }
    }

    setImportResults(results);
    setImporting(false);
    onFilesImported?.(results);

    // Clear files after successful import
    const successCount = results.filter(r => r.success).length;
    if (successCount > 0) {
      setFiles([]);
    }
  };

  // Import data (CSV, Excel, JSON)
  const handleDataImport = async (file: File) => {
    if (!entityType) {
      alert('Entity type is required for data import');
      return;
    }

    setImporting(true);
    try {
      const result = await importExportService.importData(file, entityType);
      setImportResults([{
        success: result.success,
        fileId: '',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        metadata: {
          title: '',
          description: '',
          tags: [],
          category: 'other',
          isConfidential: false,
          accessLevel: 'public'
        },
        errors: result.errors.map(e => e.message)
      }]);
      onDataImported?.(result);
    } catch (error) {
      console.error('Data import error:', error);
    }
    setImporting(false);
  };

  // Download template
  const downloadTemplate = () => {
    if (!entityType) return;
    const template = importExportService.getTemplate(entityType);
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'text/csv' });
    importExportService.downloadFile(blob, `${entityType}_template.csv`);
  };

  // Show file preview
  const showFilePreview = (filePreview: FilePreview) => {
    setSelectedFile(filePreview);
    setShowPreview(true);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Drop Zone */}
      <div
        ref={dropRef}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-lg font-medium text-gray-900">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Supports documents, images, videos, audio, and data files
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Max {maxFiles} files, up to 100MB each
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInputChange}
          accept="*/*"
        />
      </div>

      {/* Template Download for Data Import */}
      {entityType && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Data Import Template</h3>
            <p className="text-sm text-gray-500">
              Download a template for {entityType} data import
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <DocumentDownloadIcon className="h-4 w-4 mr-2" />
            Download Template
          </button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Files to Import ({files.length})
          </h3>
          <div className="space-y-3">
            {files.map((filePreview, index) => (
              <div key={index} className="flex items-center p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <span className="text-2xl">
                    {importExportService.getFileIcon(filePreview.file.type)}
                  </span>
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {filePreview.file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {importExportService.formatFileSize(filePreview.file.size)} • 
                    {importExportService.getCategoryDisplayName(filePreview.metadata.category || 'other')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {importExportService.isPreviewable(filePreview.file.type) && (
                    <button
                      onClick={() => showFilePreview(filePreview)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Import Button */}
          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? 'Importing...' : `Import ${files.length} Files`}
            </button>
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Import Results</h3>
          <div className="space-y-3">
            {importResults.map((result, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {result.success ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    ) : (
                      <ExclamationIcon className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.fileName}
                    </p>
                    <p className={`text-sm ${
                      result.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.success ? 'Successfully imported' : 'Import failed'}
                    </p>
                    {result.errors.length > 0 && (
                      <div className="mt-2">
                        {result.errors.map((error, errorIndex) => (
                          <p key={errorIndex} className="text-sm text-red-600">
                            • {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showPreview && selectedFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedFile.file.name}
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Size:</span>
                      <span className="ml-2 text-gray-600">
                        {importExportService.formatFileSize(selectedFile.file.size)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="ml-2 text-gray-600">{selectedFile.file.type}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <span className="ml-2 text-gray-600">
                        {importExportService.getCategoryDisplayName(selectedFile.metadata.category || 'other')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Access Level:</span>
                      <span className="ml-2 text-gray-600">{selectedFile.metadata.accessLevel}</span>
                    </div>
                  </div>

                  {/* File Preview */}
                  <div className="border rounded-lg p-4">
                    {selectedFile.file.type.startsWith('image/') && (
                      <img
                        src={selectedFile.preview}
                        alt={selectedFile.file.name}
                        className="max-w-full max-h-96 mx-auto"
                      />
                    )}
                    {selectedFile.file.type.startsWith('video/') && (
                      <video
                        src={selectedFile.preview}
                        controls
                        className="max-w-full max-h-96 mx-auto"
                      />
                    )}
                    {selectedFile.file.type.startsWith('audio/') && (
                      <audio
                        src={selectedFile.preview}
                        controls
                        className="w-full"
                      />
                    )}
                    {selectedFile.file.type === 'application/pdf' && (
                      <iframe
                        src={selectedFile.preview}
                        className="w-full h-96"
                        title={selectedFile.file.name}
                      />
                    )}
                    {selectedFile.file.type.startsWith('text/') && (
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {/* Text content would be loaded here */}
                        Text preview not implemented yet
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileImportExport;
