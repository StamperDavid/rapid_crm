import React, { useState, useEffect } from 'react';
import {
  OfficeBuildingIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  MailIcon,
  MapIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TruckIcon
} from '@heroicons/react/outline';

interface ELDClient {
  id: string;
  companyId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  servicePackage: string;
  status: 'active' | 'suspended' | 'cancelled';
  startDate: string;
  monthlyRevenue: number;
  totalTrucks: number;
  complianceScore: number;
  lastAudit: string;
  nextRenewal: string;
  notes: string;
}

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  setupFee: number;
  features: string[];
  maxTrucks: number;
  complianceLevel: 'basic' | 'standard' | 'premium' | 'enterprise';
}

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<ELDClient[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ELDClient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Fetch from our existing CRM database
      const response = await fetch('/api/companies');
      const companies = await response.json();
      
      // Transform CRM companies into ELD clients
      const eldClients: ELDClient[] = companies.map((company: any, index: number) => ({
        id: `eld_client_${company.id}`,
        companyId: company.id,
        companyName: company.legalBusinessName || company.name || `Company ${index + 1}`,
        contactPerson: company.contactPerson || 'Contact Person',
        email: company.email || 'contact@company.com',
        phone: company.phone || '(555) 123-4567',
        address: company.physicalStreetAddress || '123 Main St',
        servicePackage: index % 3 === 0 ? 'Premium ELD Enterprise' : index % 2 === 0 ? 'Standard ELD Plus' : 'Basic ELD Compliance',
        status: index % 10 === 0 ? 'suspended' : index % 15 === 0 ? 'cancelled' : 'active',
        startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlyRevenue: [150, 300, 500, 750, 1000][index % 5],
        totalTrucks: Math.floor(Math.random() * 50) + 1,
        complianceScore: Math.floor(Math.random() * 40) + 60,
        lastAudit: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextRenewal: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: `ELD compliance client since ${new Date().getFullYear() - Math.floor(Math.random() * 3)}`
      }));

      setClients(eldClients);

      // Set service packages
      setServicePackages([
        {
          id: 'basic',
          name: 'Basic ELD Compliance',
          description: 'Essential ELD tracking and basic compliance monitoring',
          monthlyPrice: 50,
          setupFee: 500,
          features: ['HOS Logging', 'Basic DVIR', 'Compliance Alerts', 'Monthly Reports'],
          maxTrucks: 10,
          complianceLevel: 'basic'
        },
        {
          id: 'standard',
          name: 'Standard ELD Plus',
          description: 'Advanced compliance with audit support',
          monthlyPrice: 100,
          setupFee: 1000,
          features: ['All Basic Features', 'Audit Preparation', 'Driver Management', 'Quarterly Reviews'],
          maxTrucks: 50,
          complianceLevel: 'standard'
        },
        {
          id: 'premium',
          name: 'Premium ELD Enterprise',
          description: 'Full-service compliance with dedicated support',
          monthlyPrice: 200,
          setupFee: 2000,
          features: ['All Standard Features', 'Dedicated Support', 'Custom Reporting', 'Priority Response'],
          maxTrucks: 200,
          complianceLevel: 'premium'
        }
      ]);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ELD Client Management</h2>
          <p className="text-gray-600">Manage ELD compliance service clients</p>
        </div>
        <button
          onClick={() => setShowAddClient(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <OfficeBuildingIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(clients.reduce((sum, client) => sum + client.monthlyRevenue, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Trucks</p>
              <p className="text-2xl font-bold text-gray-900">{clients.reduce((sum, client) => sum + client.totalTrucks, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Package
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trucks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{client.companyName}</div>
                    <div className="text-sm text-gray-500">{client.address}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{client.contactPerson}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                    <div className="text-sm text-gray-500">{client.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.servicePackage}</div>
                  <div className="text-sm text-gray-500">Since {new Date(client.startDate).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                    {client.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {client.totalTrucks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplianceColor(client.complianceScore)}`}>
                    {client.complianceScore}%
                  </span>
                  <div className="text-xs text-gray-500">Last audit: {client.lastAudit}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(client.monthlyRevenue)}/mo
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => setSelectedClient(client)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900 mr-3">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedClient.companyName}</h3>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedClient.contactPerson}
                    </div>
                    <div className="flex items-center">
                      <MailIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedClient.email}
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedClient.phone}
                    </div>
                    <div className="flex items-center">
                      <MapIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedClient.address}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Package:</strong> {selectedClient.servicePackage}</div>
                    <div><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedClient.status)}`}>
                        {selectedClient.status}
                      </span>
                    </div>
                    <div><strong>Start Date:</strong> {new Date(selectedClient.startDate).toLocaleDateString()}</div>
                    <div><strong>Next Renewal:</strong> {new Date(selectedClient.nextRenewal).toLocaleDateString()}</div>
                    <div><strong>Monthly Revenue:</strong> {formatCurrency(selectedClient.monthlyRevenue)}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Fleet Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Total Trucks:</strong> {selectedClient.totalTrucks}</div>
                  <div><strong>Compliance Score:</strong> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getComplianceColor(selectedClient.complianceScore)}`}>
                      {selectedClient.complianceScore}%
                    </span>
                  </div>
                  <div><strong>Last Audit:</strong> {selectedClient.lastAudit}</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{selectedClient.notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
