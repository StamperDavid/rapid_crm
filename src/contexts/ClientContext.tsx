import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Client {
  id: string;
  companyId: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'primary' | 'secondary' | 'viewer';
  permissions: {
    canViewServices: boolean;
    canViewInvoices: boolean;
    canViewCompliance: boolean;
    canViewDocuments: boolean;
    canSubmitRequests: boolean;
  };
  lastLogin: string;
  isActive: boolean;
}

interface ClientContextType {
  client: Client | null;
  isClientMode: boolean;
  isAdminPreview: boolean;
  setClientMode: (enabled: boolean) => void;
  setAdminPreview: (enabled: boolean) => void;
  switchToClient: (clientId: string) => void;
  switchToAdmin: () => void;
  loading: boolean;
  companies: any[];
  contacts: any[];
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isClientMode, setIsClientMode] = useState(false);
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Initialize with empty arrays - CRM data will be loaded separately
  const [companies, setCompanies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // Mock client data - in real implementation, this would come from API
  const mockClients: Client[] = [
    {
      id: 'client_1',
      companyId: '1',
      companyName: 'Acme Transportation (TEST)',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@acmetransport.com',
      phone: '(555) 123-4567',
      role: 'primary',
      permissions: {
        canViewServices: true,
        canViewInvoices: true,
        canViewCompliance: true,
        canViewDocuments: true,
        canSubmitRequests: true,
      },
      lastLogin: new Date().toISOString(),
      isActive: true,
    },
    {
      id: 'client_2',
      companyId: '2',
      companyName: 'Global Shipping Co (TEST)',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@globalshipping.com',
      phone: '(555) 987-6543',
      role: 'secondary',
      permissions: {
        canViewServices: true,
        canViewInvoices: false,
        canViewCompliance: true,
        canViewDocuments: true,
        canSubmitRequests: false,
      },
      lastLogin: new Date().toISOString(),
      isActive: true,
    },
  ];

  const switchToClient = (clientId: string) => {
    setLoading(true);
    const selectedClient = mockClients.find(c => c.id === clientId);
    if (selectedClient) {
      setClient(selectedClient);
      setIsClientMode(true);
      setIsAdminPreview(true); // Admin preview mode
    }
    setLoading(false);
  };

  const switchToAdmin = () => {
    setClient(null);
    setIsClientMode(false);
    setIsAdminPreview(false);
  };

  const setClientMode = (enabled: boolean) => {
    setIsClientMode(enabled);
    if (!enabled) {
      setClient(null);
      setIsAdminPreview(false);
    }
  };

  const setAdminPreview = (enabled: boolean) => {
    setIsAdminPreview(enabled);
  };

  // Get client's company data
  const getClientCompany = () => {
    if (!client) return null;
    return companies.find(c => c.id === client.companyId);
  };

  // Get client's services
  const getClientServices = () => {
    if (!client) return [];
    // In real implementation, this would filter services by company
    return []; // Placeholder
  };

  // Get client's invoices
  const getClientInvoices = () => {
    if (!client) return [];
    // In real implementation, this would filter invoices by company
    return []; // Placeholder
  };

  const value: ClientContextType = {
    client,
    isClientMode,
    isAdminPreview,
    setClientMode,
    setAdminPreview,
    switchToClient,
    switchToAdmin,
    loading,
    companies,
    contacts,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};
