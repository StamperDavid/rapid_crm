import React, { useState, useEffect } from 'react';
import {
  OfficeBuildingIcon,
  DocumentTextIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationIcon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
  LocationMarkerIcon,
} from '@heroicons/react/outline';
import { aiIntegrationService } from '../services/ai/AIIntegrationService';
import { advancedAICustomizationService } from '../services/ai';
import ChatbotWidget from '../components/ChatbotWidget';

interface ClientData {
  companyName: string;
  clientName: string;
  usdotNumber: string;
  mcNumber: string;
  businessAddress: string;
  phone: string;
  email: string;
  complianceStatus: 'compliant' | 'warning' | 'non-compliant';
  renewalDates: {
    usdot: string;
    mc: string;
    insurance: string;
  };
  violations: Array<{
    type: string;
    date: string;
    status: string;
  }>;
  lastLogin: string;
}

// Removed OnboardingAgent interface - now using CustomerServiceAgent

const ClientPortal: React.FC = () => {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [portalSettings, setPortalSettings] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [showComplianceDetails, setShowComplianceDetails] = useState(false);

  // Load client portal data
  useEffect(() => {
    const loadClientPortalData = async () => {
      try {
        // Load portal settings
        const settingsResponse = await fetch('/api/client-portal/settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setPortalSettings(settingsData.settings);
        }

        // Create client session
        const sessionResponse = await fetch('/api/client-portal/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: 1,
            client_name: 'Demo Client',
            client_email: 'demo@client.com',
            ip_address: '127.0.0.1',
            user_agent: navigator.userAgent
          })
        });
        
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setSessionId(sessionData.sessionId);
        }

        // Load client data (for now using mock data, but connected to session)
        setClientData({
          companyName: 'Acme Transportation LLC',
          clientName: 'John Smith',
          usdotNumber: '123456',
          mcNumber: 'MC-789012',
          businessAddress: '123 Main Street, Anytown, ST 12345',
          phone: '(555) 123-4567',
          email: 'john@acmetrans.com',
          complianceStatus: 'warning',
          renewalDates: {
            usdot: '2024-06-15',
            mc: '2024-08-20',
            insurance: '2024-12-01'
          },
          violations: [
            {
              type: 'Hours of Service',
              date: '2024-01-15',
              status: 'Resolved'
            }
          ],
          lastLogin: new Date().toLocaleString()
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading client portal data:', error);
        setLoading(false);
      }
    };

    loadClientPortalData();
  }, []);

  // Removed onboarding agent functions - now handled by CustomerServiceAgent component

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'non-compliant': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getComplianceStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircleIcon className="h-5 w-5" />;
      case 'warning': return <ExclamationIcon className="h-5 w-5" />;
      case 'non-compliant': return <ExclamationIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading client portal...</p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load client portal data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Client Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {clientData.clientName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last login: {clientData.lastLogin}
            </p>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getComplianceStatusColor(clientData.complianceStatus)}`}>
            {getComplianceStatusIcon(clientData.complianceStatus)}
            <span className="ml-2 capitalize">{clientData.complianceStatus}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Dashboard Overview */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Dashboard Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here you can view your company information, compliance status, and get assistance with any questions about your transportation business.
          </p>
        </div>

        {/* Company Information */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Company Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <OfficeBuildingIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {clientData.companyName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Company Name
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    USDOT: {clientData.usdotNumber}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    USDOT Number
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <TruckIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    MC: {clientData.mcNumber}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    MC Number
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <LocationMarkerIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {clientData.businessAddress}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Business Address
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {clientData.phone}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Phone Number
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {clientData.email}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Email Address
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Center */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Compliance Center
            </h3>
            <button
              onClick={() => setShowComplianceDetails(!showComplianceDetails)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showComplianceDetails ? 'Hide Details' : 'View Details'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                USDOT Renewal
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {clientData.renewalDates.usdot}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                MC Renewal
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {clientData.renewalDates.mc}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Insurance Renewal
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {clientData.renewalDates.insurance}
              </div>
            </div>
          </div>

          {showComplianceDetails && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Recent Violations
              </h4>
              {clientData.violations.length > 0 ? (
                <div className="space-y-2">
                  {clientData.violations.map((violation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {violation.type}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Date: {violation.date}
                        </div>
                      </div>
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {violation.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No recent violations
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget 
        clientData={clientData}
        sessionId={sessionId}
      />
    </div>
  );
};

export default ClientPortal;
