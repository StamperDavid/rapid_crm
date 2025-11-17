/**
 * EmployeeCredentialsManager
 * 
 * UI for managing Login.gov credentials for employees
 * Allows admins to set/update credentials used by RPA agents
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface LoginGovCredentials {
  username: string;
  password: string;
  mfaMethod: 'sms' | 'authenticator';
  mfaPhone: string;
  backupCodes: string;
  verified: boolean;
  verificationDate: string | null;
  lastUpdated: string | null;
}

interface EmployeeCredentialsManagerProps {
  employeeId: string;
  employeeName: string;
}

export const EmployeeCredentialsManager: React.FC<EmployeeCredentialsManagerProps> = ({
  employeeId,
  employeeName
}) => {
  const [credentials, setCredentials] = useState<LoginGovCredentials>({
    username: '',
    password: '',
    mfaMethod: 'sms',
    mfaPhone: '',
    backupCodes: '',
    verified: false,
    verificationDate: null,
    lastUpdated: null
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    loadCredentials();
  }, [employeeId]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employees/${employeeId}/credentials`);
      
      if (response.ok) {
        const data = await response.json();
        setCredentials({
          username: data.login_gov_username || '',
          password: '', // Never load password for display
          mfaMethod: data.login_gov_mfa_method || 'sms',
          mfaPhone: data.login_gov_mfa_phone || '',
          backupCodes: '', // Never display backup codes
          verified: data.fmcsa_account_verified || false,
          verificationDate: data.fmcsa_verification_date || null,
          lastUpdated: data.last_credential_update || null
        });
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
      toast.error('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!credentials.username) {
      toast.error('Login.gov email is required');
      return;
    }
    
    if (passwordChanged && !credentials.password) {
      toast.error('Password is required when updating credentials');
      return;
    }
    
    if (credentials.mfaMethod === 'sms' && !credentials.mfaPhone) {
      toast.error('Phone number is required for SMS MFA');
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch(`/api/employees/${employeeId}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: passwordChanged ? credentials.password : null,
          mfaMethod: credentials.mfaMethod,
          mfaPhone: credentials.mfaPhone,
          backupCodes: credentials.backupCodes || null
        }),
      });
      
      if (response.ok) {
        toast.success('Credentials saved successfully');
        setPasswordChanged(false);
        setCredentials(prev => ({ ...prev, password: '' }));
        await loadCredentials();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save credentials');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast.error('Failed to save credentials');
    } finally {
      setSaving(false);
    }
  };

  const handleTestCredentials = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/credentials/test`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast.success('Credentials verified successfully!');
        await loadCredentials();
      } else {
        toast.error('Credential verification failed');
      }
    } catch (error) {
      console.error('Error testing credentials:', error);
      toast.error('Failed to test credentials');
    }
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
        <h2 className="text-xl font-bold text-gray-900">Login.gov Credentials</h2>
        <p className="text-sm text-gray-600 mt-1">
          For employee: <span className="font-semibold">{employeeName}</span>
        </p>
      </div>
      
      {credentials.verified && credentials.verificationDate && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-green-800">Account Verified</h3>
              <p className="text-sm text-green-700 mt-1">
                Verified on {new Date(credentials.verificationDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-green-600 mt-1">
                These credentials are ready for RPA automation
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSaveCredentials} className="space-y-4">
        {/* Login.gov Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Login.gov Email Address
          </label>
          <input 
            type="email" 
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="user@example.com"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The email address used to login to Login.gov for FMCSA access
          </p>
        </div>
        
        {/* Login.gov Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Login.gov Password
          </label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              value={credentials.password}
              onChange={(e) => {
                setCredentials({...credentials, password: e.target.value});
                setPasswordChanged(true);
              }}
              className="w-full border border-gray-300 rounded-lg p-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={credentials.lastUpdated ? "Enter new password to update" : "Enter password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            <span className="text-red-600">⚠️</span> Password is encrypted and stored securely. Leave blank to keep existing password.
          </p>
        </div>
        
        {/* MFA Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Multi-Factor Authentication (MFA) Method
          </label>
          <select 
            value={credentials.mfaMethod}
            onChange={(e) => setCredentials({...credentials, mfaMethod: e.target.value as 'sms' | 'authenticator'})}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="sms">SMS Text Message</option>
            <option value="authenticator">Authenticator App (Google/Microsoft/Authy)</option>
          </select>
        </div>
        
        {/* MFA Phone (if SMS selected) */}
        {credentials.mfaMethod === 'sms' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MFA Phone Number
            </label>
            <input 
              type="tel" 
              value={credentials.mfaPhone}
              onChange={(e) => setCredentials({...credentials, mfaPhone: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
              required={credentials.mfaMethod === 'sms'}
            />
            <p className="text-xs text-gray-500 mt-1">
              Phone number that receives Login.gov MFA codes
            </p>
          </div>
        )}
        
        {/* Backup Codes (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Backup Codes (Optional)
          </label>
          <textarea 
            value={credentials.backupCodes}
            onChange={(e) => setCredentials({...credentials, backupCodes: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            rows={4}
            placeholder="Paste Login.gov backup codes here (one per line)&#10;12345678&#10;23456789&#10;34567890"
          />
          <p className="text-xs text-gray-500 mt-1">
            Encrypted backup codes for account recovery
          </p>
        </div>
        
        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-blue-800">Important Security Information</h3>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>These credentials are used by RPA agents to file USDOT applications</li>
                <li>All passwords are encrypted with AES-256-GCM encryption</li>
                <li>Credentials are only accessible to authorized admins and RPA agents</li>
                <li>All access is logged for security auditing</li>
                <li>Rotate passwords every 90 days for security</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Credentials'
            )}
          </button>
          
          {credentials.username && (
            <button 
              type="button"
              onClick={handleTestCredentials}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Test Connection
            </button>
          )}
        </div>
        
        {/* Last Updated Info */}
        {credentials.lastUpdated && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(credentials.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

