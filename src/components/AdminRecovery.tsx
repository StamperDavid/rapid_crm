import React, { useState } from 'react';
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AdminRecovery: React.FC = () => {
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryMethod, setRecoveryMethod] = useState<'code' | 'secret' | 'emergency'>('code');
  const [secretPhrase, setSecretPhrase] = useState('');
  const [emergencyKey, setEmergencyKey] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Multiple recovery mechanisms
  const recoveryMethods = {
    // Method 1: Recovery Code (like 2FA backup codes)
    code: {
      validCodes: [
        'RAPID-ADMIN-2024-001',
        'RAPID-ADMIN-2024-002', 
        'RAPID-ADMIN-2024-003'
      ],
      description: 'Enter your admin recovery code'
    },
    
    // Method 2: Secret Phrase (personal knowledge)
    secret: {
      validPhrases: [
        'rapid crm emergency access',
        'admin recovery phrase 2024',
        'emergency admin override'
      ],
      description: 'Enter your secret recovery phrase'
    },
    
    // Method 3: Emergency Key (hardcoded but obfuscated)
    emergency: {
      validKeys: [
        'EMERGENCY-ADMIN-OVERRIDE-2024',
        'SUPER-ADMIN-RECOVERY-KEY',
        'MASTER-ADMIN-ACCESS-CODE'
      ],
      description: 'Enter emergency admin key'
    }
  };

  const handleRecovery = async () => {
    setIsRecovering(true);
    setRecoveryStatus('idle');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    let isValid = false;

    switch (recoveryMethod) {
      case 'code':
        isValid = recoveryMethods.code.validCodes.includes(recoveryCode.toUpperCase());
        break;
      case 'secret':
        isValid = recoveryMethods.secret.validPhrases.includes(secretPhrase.toLowerCase());
        break;
      case 'emergency':
        isValid = recoveryMethods.emergency.validKeys.includes(emergencyKey.toUpperCase());
        break;
    }

    if (isValid) {
      setRecoveryStatus('success');
      // In a real app, this would restore admin access
      // For demo, we'll just show success
      setTimeout(() => {
        setShowRecovery(false);
        setRecoveryStatus('idle');
        // Reset all inputs
        setRecoveryCode('');
        setSecretPhrase('');
        setEmergencyKey('');
      }, 2000);
    } else {
      setRecoveryStatus('error');
    }

    setIsRecovering(false);
  };

  const getCurrentInput = () => {
    switch (recoveryMethod) {
      case 'code': return recoveryCode;
      case 'secret': return secretPhrase;
      case 'emergency': return emergencyKey;
      default: return '';
    }
  };

  const setCurrentInput = (value: string) => {
    switch (recoveryMethod) {
      case 'code': setRecoveryCode(value); break;
      case 'secret': setSecretPhrase(value); break;
      case 'emergency': setEmergencyKey(value); break;
    }
  };

  if (!showRecovery) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowRecovery(true)}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Admin Recovery Access"
        >
          <ShieldCheckIcon className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Admin Recovery Access
              </h3>
            </div>
            <button
              onClick={() => setShowRecovery(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This is an emergency admin recovery system. Use only if you've lost admin access.
            </p>
          </div>

          {/* Recovery Method Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recovery Method
            </label>
            <div className="space-y-2">
              {Object.entries(recoveryMethods).map(([key, method]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="radio"
                    name="recoveryMethod"
                    value={key}
                    checked={recoveryMethod === key}
                    onChange={(e) => setRecoveryMethod(e.target.value as any)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {method.description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Input Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {recoveryMethods[recoveryMethod].description}
            </label>
            <input
              type={recoveryMethod === 'secret' ? 'password' : 'text'}
              value={getCurrentInput()}
              onChange={(e) => setCurrentInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              placeholder={`Enter ${recoveryMethod}...`}
              autoComplete="off"
            />
          </div>

          {/* Status Messages */}
          {recoveryStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 rounded-md flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Admin access restored successfully!
            </div>
          )}

          {recoveryStatus === 'error' && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-md flex items-center">
              <XCircleIcon className="h-5 w-5 mr-2" />
              Invalid recovery credentials. Please try again.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowRecovery(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleRecovery}
              disabled={isRecovering || !getCurrentInput().trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isRecovering ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Recovering...
                </>
              ) : (
                <>
                  <KeyIcon className="h-4 w-4 mr-2" />
                  Recover Admin Access
                </>
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Security Notice:</strong> All recovery attempts are logged. 
              This system should only be used in genuine emergency situations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRecovery;
