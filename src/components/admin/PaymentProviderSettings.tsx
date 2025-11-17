/**
 * Payment Provider Settings Component
 * Allows admin to select and configure payment providers
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationIcon,
  RefreshIcon,
  CogIcon
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

interface PaymentProvider {
  name: string;
  configured: boolean;
  active: boolean;
}

interface ProviderInfo {
  name: string;
  displayName: string;
  description: string;
  fees: string;
  logo: string;
  configFields: string[];
}

const PROVIDER_INFO: Record<string, ProviderInfo> = {
  stripe: {
    name: 'stripe',
    displayName: 'Stripe',
    description: 'Industry-leading payment processing with global support',
    fees: '2.9% + $0.30 per transaction',
    logo: '💳',
    configFields: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET']
  },
  paypal: {
    name: 'paypal',
    displayName: 'PayPal',
    description: 'Popular payment platform with buyer protection',
    fees: '2.99% + $0.49 per transaction',
    logo: '🅿️',
    configFields: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_ENVIRONMENT']
  },
  square: {
    name: 'square',
    displayName: 'Square',
    description: 'Simple payment processing with competitive rates',
    fees: '2.6% + $0.10 per transaction',
    logo: '⬛',
    configFields: ['SQUARE_ACCESS_TOKEN', 'SQUARE_ENVIRONMENT']
  }
};

const PaymentProviderSettings: React.FC = () => {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments/providers');
      
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers);
        setActiveProvider(data.active);
      } else {
        toast.error('Failed to load payment providers');
      }
    } catch (error) {
      console.error('Error loading providers:', error);
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = async (provider: string) => {
    try {
      const response = await fetch('/api/payments/providers/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });

      if (response.ok) {
        setActiveProvider(provider);
        toast.success(`Switched to ${PROVIDER_INFO[provider]?.displayName || provider}`);
        loadProviders(); // Reload to update status
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to switch provider');
      }
    } catch (error) {
      console.error('Error switching provider:', error);
      toast.error('Failed to switch payment provider');
    }
  };

  const handleTestConnection = async (provider: string) => {
    try {
      setTesting(provider);
      const response = await fetch(`/api/payments/providers/${provider}/test`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${PROVIDER_INFO[provider]?.displayName} connection successful!`);
      } else {
        toast.error(`${PROVIDER_INFO[provider]?.displayName} connection failed`);
      }
    } catch (error) {
      console.error('Error testing provider:', error);
      toast.error('Failed to test provider connection');
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment Provider Settings
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select and configure your preferred payment processor
            </p>
          </div>
          <button
            onClick={loadProviders}
            className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Provider Cards */}
        <div className="space-y-4">
          {Object.values(PROVIDER_INFO).map((providerInfo) => {
            const provider = providers.find(p => p.name === providerInfo.name);
            const isActive = activeProvider.toLowerCase() === providerInfo.name;
            const isConfigured = provider?.configured || false;

            return (
              <div
                key={providerInfo.name}
                className={`border-2 rounded-lg p-5 transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{providerInfo.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {providerInfo.displayName}
                        </h4>
                        {isActive && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        )}
                        {isConfigured && !isActive && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            Configured
                          </span>
                        )}
                        {!isConfigured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            <ExclamationIcon className="h-3 w-3 mr-1" />
                            Not Configured
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {providerInfo.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        <span className="font-medium">Fees:</span> {providerInfo.fees}
                      </p>
                      
                      {/* Configuration Fields */}
                      {!isConfigured && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Required Environment Variables:
                          </p>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {providerInfo.configFields.map(field => (
                              <li key={field} className="font-mono">
                                • {field}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2">
                    {isConfigured && !isActive && (
                      <button
                        onClick={() => handleProviderChange(providerInfo.name)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Activate
                      </button>
                    )}
                    {isConfigured && (
                      <button
                        onClick={() => handleTestConnection(providerInfo.name)}
                        disabled={testing === providerInfo.name}
                        className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {testing === providerInfo.name ? (
                          <>
                            <RefreshIcon className="h-4 w-4 mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <CogIcon className="h-4 w-4 mr-2" />
                            Test
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CreditCardIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                About Payment Providers
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p className="mb-2">
                  You can switch between payment providers at any time. Configure the provider credentials 
                  in your environment variables (.env file) and restart the server.
                </p>
                <p>
                  <strong>Switching providers will not affect existing transactions.</strong> Historical 
                  payments remain with their original provider.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProviderSettings;









