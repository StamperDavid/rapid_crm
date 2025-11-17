/**
 * EmployeeIdentityDocuments
 * 
 * UI for managing employee identity documents (driver's license, passport, etc.)
 * Used for IDEMIA verification during USDOT filing
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface IdentityDocument {
  id: string;
  documentType: string;
  documentNumber: string;
  expirationDate: string;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  frontPath: string;
  backPath: string;
  selfiePath: string;
  idemiaStatus: 'not_verified' | 'pending' | 'verified' | 'failed' | 'expired';
  idemiaVerificationDate: string | null;
  uploadedAt: string;
  isActive: boolean;
}

interface EmployeeIdentityDocumentsProps {
  employeeId: string;
  employeeName: string;
}

export const EmployeeIdentityDocuments: React.FC<EmployeeIdentityDocumentsProps> = ({
  employeeId,
  employeeName
}) => {
  const [document, setDocument] = useState<IdentityDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    documentType: 'drivers_license',
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    documentNumber: '',
    expirationDate: ''
  });
  
  const [files, setFiles] = useState<{
    front: File | null;
    back: File | null;
    selfie: File | null;
  }>({
    front: null,
    back: null,
    selfie: null
  });

  useEffect(() => {
    loadDocument();
  }, [employeeId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employees/${employeeId}/identity-document`);
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setDocument(data);
        }
      }
    } catch (error) {
      console.error('Error loading identity document:', error);
      toast.error('Failed to load identity document');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (type: 'front' | 'back' | 'selfie', file: File | null) => {
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload JPG, PNG, or PDF files only');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
    }
    
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!files.front) {
      toast.error('Front of ID document is required');
      return;
    }
    
    if (formData.documentType === 'drivers_license' && !files.back) {
      toast.error('Back of driver\'s license is required');
      return;
    }
    
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
      toast.error('Personal information is required');
      return;
    }
    
    try {
      setUploading(true);
      
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('employeeId', employeeId);
      uploadData.append('documentType', formData.documentType);
      uploadData.append('firstName', formData.firstName);
      uploadData.append('lastName', formData.lastName);
      uploadData.append('middleName', formData.middleName);
      uploadData.append('dateOfBirth', formData.dateOfBirth);
      uploadData.append('documentNumber', formData.documentNumber);
      uploadData.append('expirationDate', formData.expirationDate);
      
      if (files.front) uploadData.append('frontImage', files.front);
      if (files.back) uploadData.append('backImage', files.back);
      if (files.selfie) uploadData.append('selfieImage', files.selfie);
      
      const response = await fetch('/api/employees/identity-document', {
        method: 'POST',
        body: uploadData
      });
      
      if (response.ok) {
        toast.success('Identity document uploaded successfully');
        setFiles({ front: null, back: null, selfie: null });
        setFormData({
          documentType: 'drivers_license',
          firstName: '',
          lastName: '',
          middleName: '',
          dateOfBirth: '',
          documentNumber: '',
          expirationDate: ''
        });
        await loadDocument();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to upload identity document');
      }
    } catch (error) {
      console.error('Error uploading identity document:', error);
      toast.error('Failed to upload identity document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'not_verified': { color: 'gray', text: 'Not Verified' },
      'pending': { color: 'yellow', text: 'Pending Verification' },
      'verified': { color: 'green', text: 'Verified ✓' },
      'failed': { color: 'red', text: 'Verification Failed' },
      'expired': { color: 'red', text: 'Expired' }
    };
    
    const badge = badges[status] || badges['not_verified'];
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-${badge.color}-100 text-${badge.color}-800`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Identity Documents</h2>
        <p className="text-sm text-gray-600 mt-1">
          For employee: <span className="font-semibold">{employeeName}</span>
        </p>
      </div>
      
      {/* Current Document Display */}
      {document && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Current ID Document</h3>
            {getStatusBadge(document.idemiaStatus)}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Type:</p>
              <p className="font-medium">{document.documentType.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div>
              <p className="text-gray-600">Uploaded:</p>
              <p className="font-medium">{new Date(document.uploadedAt).toLocaleDateString()}</p>
            </div>
            {document.expirationDate && (
              <div>
                <p className="text-gray-600">Expiration:</p>
                <p className="font-medium">{new Date(document.expirationDate).toLocaleDateString()}</p>
              </div>
            )}
            {document.idemiaStatus === 'verified' && document.idemiaVerificationDate && (
              <div>
                <p className="text-gray-600">Verified:</p>
                <p className="font-medium text-green-600">
                  {new Date(document.idemiaVerificationDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          
          {document.idemiaStatus === 'verified' && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-800 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                This employee can perform IDEMIA verification for USDOT filings
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Upload New Document Form */}
      <div className={document ? 'border-t border-gray-200 pt-6' : ''}>
        <h3 className="font-semibold text-gray-900 mb-4">
          {document ? 'Update Identity Document' : 'Upload Identity Document'}
        </h3>
        
        <form onSubmit={handleUpload} className="space-y-4">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Document Type
            </label>
            <select 
              value={formData.documentType}
              onChange={(e) => setFormData({...formData, documentType: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="drivers_license">Driver's License</option>
              <option value="passport">Passport</option>
              <option value="state_id">State ID Card</option>
            </select>
          </div>
          
          {/* Personal Information */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input 
                type="text" 
                value={formData.middleName}
                onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input 
                type="date" 
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input 
                type="date" 
                value={formData.expirationDate}
                onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* File Uploads */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Front of ID Document *
              </label>
              <input 
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange('front', e.target.files?.[0] || null)}
                className="w-full border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {files.front && (
                <p className="text-xs text-green-600 mt-1">✓ {files.front.name}</p>
              )}
            </div>
            
            {formData.documentType === 'drivers_license' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Back of Driver's License *
                </label>
                <input 
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('back', e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {files.back && (
                  <p className="text-xs text-green-600 mt-1">✓ {files.back.name}</p>
                )}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selfie Photo (Optional)
              </label>
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('selfie', e.target.files?.[0] || null)}
                className="w-full border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {files.selfie && (
                <p className="text-xs text-green-600 mt-1">✓ {files.selfie.name}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Selfie will be captured during IDEMIA verification if not provided
              </p>
            </div>
          </div>
          
          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-yellow-800">Important Requirements</h3>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Document must be current and not expired</li>
                  <li>Images must be clear and readable</li>
                  <li>Must be government-issued ID</li>
                  <li>This ID will be used for IDEMIA biometric verification</li>
                  <li>Accepted formats: JPG, PNG, PDF (max 10MB)</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Identity Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

