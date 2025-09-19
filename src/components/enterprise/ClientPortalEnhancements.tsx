import React, { useState, useEffect } from 'react';
import {
  DownloadIcon,
  UploadIcon,
  ClipboardCheckIcon,
  TicketIcon,
  CogIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  XIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  SearchIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  OfficeBuildingIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellIcon,
  PaperClipIcon,
  StarIcon,
  ChatIcon
} from '@heroicons/react/outline';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedDate: string;
  uploadedBy: string;
  category: string;
  status: 'active' | 'archived' | 'pending' | 'expired';
  downloadCount: number;
  description: string;
  tags: string[];
}

interface ServiceStatus {
  id: string;
  serviceName: string;
  status: 'active' | 'inactive' | 'maintenance' | 'suspended';
  startDate: string;
  endDate?: string;
  progress: number;
  description: string;
  assignedTeam: string;
  lastUpdate: string;
  nextScheduled: string;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdDate: string;
  lastUpdate: string;
  assignedTo: string;
  clientName: string;
  attachments: number;
  responseTime: string;
}

interface AccountInfo {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  subscriptionPlan: string;
  billingCycle: string;
  nextBillingDate: string;
  accountStatus: 'active' | 'suspended' | 'cancelled';
  lastLogin: string;
  totalSpent: number;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  method: string;
  description: string;
  invoiceNumber: string;
  dueDate?: string;
}

const ClientPortalEnhancements: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'documents' | 'services' | 'support' | 'account' | 'payments'>('documents');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    loadClientPortalData();
  }, []);

  const loadClientPortalData = async () => {
    try {
      // Mock data - in real implementation, this would come from API
      const documentsData: Document[] = [
        {
          id: '1',
          name: 'Q4 Compliance Report.pdf',
          type: 'PDF',
          size: 2.4,
          uploadedDate: '2024-01-15',
          uploadedBy: 'John Smith',
          category: 'Compliance',
          status: 'active',
          downloadCount: 15,
          description: 'Quarterly compliance report for Q4 2023',
          tags: ['compliance', 'quarterly', 'report']
        },
        {
          id: '2',
          name: 'Safety Training Certificate.pdf',
          type: 'PDF',
          size: 1.2,
          uploadedDate: '2024-01-14',
          uploadedBy: 'Sarah Johnson',
          category: 'Training',
          status: 'active',
          downloadCount: 8,
          description: 'Driver safety training completion certificate',
          tags: ['training', 'safety', 'certificate']
        },
        {
          id: '3',
          name: 'Insurance Policy.docx',
          type: 'DOCX',
          size: 3.1,
          uploadedDate: '2024-01-13',
          uploadedBy: 'Mike Davis',
          category: 'Insurance',
          status: 'active',
          downloadCount: 3,
          description: 'Current insurance policy documentation',
          tags: ['insurance', 'policy', 'coverage']
        }
      ];

      const servicesData: ServiceStatus[] = [
        {
          id: '1',
          serviceName: 'ELD Compliance Monitoring',
          status: 'active',
          startDate: '2024-01-01',
          progress: 100,
          description: 'Electronic logging device compliance monitoring service',
          assignedTeam: 'Compliance Team',
          lastUpdate: '2024-01-16',
          nextScheduled: '2024-01-23'
        },
        {
          id: '2',
          serviceName: 'IFTA Reporting',
          status: 'active',
          startDate: '2024-01-01',
          progress: 75,
          description: 'International Fuel Tax Agreement reporting service',
          assignedTeam: 'Tax Team',
          lastUpdate: '2024-01-15',
          nextScheduled: '2024-01-22'
        },
        {
          id: '3',
          serviceName: 'Safety Training Portal',
          status: 'maintenance',
          startDate: '2024-01-01',
          progress: 60,
          description: 'Online safety training and certification portal',
          assignedTeam: 'Training Team',
          lastUpdate: '2024-01-16',
          nextScheduled: '2024-01-20'
        }
      ];

      const ticketsData: SupportTicket[] = [
        {
          id: '1',
          title: 'Unable to access compliance reports',
          description: 'I am unable to download the Q4 compliance reports from the portal.',
          status: 'in_progress',
          priority: 'high',
          category: 'Technical Issue',
          createdDate: '2024-01-16',
          lastUpdate: '2024-01-16',
          assignedTo: 'Support Team',
          clientName: 'ABC Transport Co.',
          attachments: 2,
          responseTime: '2 hours'
        },
        {
          id: '2',
          title: 'Training certificate not generated',
          description: 'Completed the safety training but certificate was not generated.',
          status: 'open',
          priority: 'medium',
          category: 'Training',
          createdDate: '2024-01-15',
          lastUpdate: '2024-01-15',
          assignedTo: 'Training Team',
          clientName: 'XYZ Logistics',
          attachments: 0,
          responseTime: '4 hours'
        },
        {
          id: '3',
          title: 'Billing inquiry',
          description: 'Question about the recent invoice charges.',
          status: 'resolved',
          priority: 'low',
          category: 'Billing',
          createdDate: '2024-01-14',
          lastUpdate: '2024-01-15',
          assignedTo: 'Billing Team',
          clientName: 'DEF Freight',
          attachments: 1,
          responseTime: '1 hour'
        }
      ];

      const accountData: AccountInfo = {
        id: '1',
        companyName: 'ABC Transport Co.',
        contactName: 'John Smith',
        email: 'john@abctransport.com',
        phone: '+1-555-0123',
        address: '123 Main St, City, State 12345',
        subscriptionPlan: 'Enterprise',
        billingCycle: 'Monthly',
        nextBillingDate: '2024-02-01',
        accountStatus: 'active',
        lastLogin: '2024-01-16 10:30 AM',
        totalSpent: 12500
      };

      const paymentsData: Payment[] = [
        {
          id: '1',
          amount: 2500,
          date: '2024-01-01',
          status: 'completed',
          method: 'Credit Card',
          description: 'Monthly subscription - Enterprise Plan',
          invoiceNumber: 'INV-2024-001'
        },
        {
          id: '2',
          amount: 500,
          date: '2024-01-10',
          status: 'completed',
          method: 'Bank Transfer',
          description: 'Additional training modules',
          invoiceNumber: 'INV-2024-002'
        },
        {
          id: '3',
          amount: 2500,
          date: '2024-02-01',
          status: 'pending',
          method: 'Credit Card',
          description: 'Monthly subscription - Enterprise Plan',
          invoiceNumber: 'INV-2024-003',
          dueDate: '2024-02-01'
        }
      ];

      setDocuments(documentsData);
      setServices(servicesData);
      setTickets(ticketsData);
      setAccountInfo(accountData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading client portal data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'maintenance':
      case 'suspended':
        return 'text-orange-600 bg-orange-100';
      case 'archived':
      case 'closed':
        return 'text-gray-600 bg-gray-100';
      case 'expired':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Document Center</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <UploadIcon className="h-4 w-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Compliance">Compliance</option>
            <option value="Training">Training</option>
            <option value="Insurance">Insurance</option>
            <option value="Financial">Financial</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                    <p className="text-sm text-gray-500">{doc.type} • {formatFileSize(doc.size)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {doc.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Uploaded {doc.uploadedDate}</span>
                <span>{doc.downloadCount} downloads</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center space-x-1">
                  <DownloadIcon className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Service Status Tracker</h2>
      
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ClipboardCheckIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{service.serviceName}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(service.status)}`}>
                {service.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Assigned Team:</span>
                <p className="text-gray-900">{service.assignedTeam}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Last Update:</span>
                <p className="text-gray-900">{service.lastUpdate}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Next Scheduled:</span>
                <p className="text-gray-900">{service.nextScheduled}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{service.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    service.progress === 100 ? 'bg-green-500' :
                    service.progress >= 75 ? 'bg-blue-500' :
                    service.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${service.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Support Ticket System</h2>
        <button
          onClick={() => setShowTicketModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Ticket</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                <p className="text-sm text-gray-600">Ticket #{ticket.id}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{ticket.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Category:</span>
                <p className="text-gray-900">{ticket.category}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Assigned To:</span>
                <p className="text-gray-900">{ticket.assignedTo}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created:</span>
                <p className="text-gray-900">{ticket.createdDate}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Response Time:</span>
                <p className="text-gray-900">{ticket.responseTime}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <PaperClipIcon className="h-4 w-4" />
                  <span>{ticket.attachments} attachments</span>
                </span>
                <span>Last update: {ticket.lastUpdate}</span>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Account Management</h2>
      
      {accountInfo && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Company Name:</span>
                  <p className="text-gray-900">{accountInfo.companyName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Contact Name:</span>
                  <p className="text-gray-900">{accountInfo.contactName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="text-gray-900">{accountInfo.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Phone:</span>
                  <p className="text-gray-900">{accountInfo.phone}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Address:</span>
                  <p className="text-gray-900">{accountInfo.address}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Plan:</span>
                  <p className="text-gray-900">{accountInfo.subscriptionPlan}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Billing Cycle:</span>
                  <p className="text-gray-900">{accountInfo.billingCycle}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Next Billing:</span>
                  <p className="text-gray-900">{accountInfo.nextBillingDate}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(accountInfo.accountStatus)}`}>
                    {accountInfo.accountStatus}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Last Login:</span>
                  <p className="text-gray-900">{accountInfo.lastLogin}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Total Spent:</span>
                  <p className="text-gray-900">${accountInfo.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Edit Profile
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                Change Password
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                Billing Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Payment Processing</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {payment.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.invoiceNumber}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCardIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Visa ending in 4242</p>
                  <p className="text-sm text-gray-500">Expires 12/25</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                Edit
              </button>
            </div>
            <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600">
              + Add Payment Method
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Payments</h3>
          <div className="space-y-3">
            {payments.filter(p => p.status === 'pending').map((payment) => (
              <div key={payment.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{payment.description}</p>
                    <p className="text-sm text-gray-500">Due: {payment.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${payment.amount.toLocaleString()}</p>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'documents', name: 'Document Center', icon: DownloadIcon },
              { id: 'services', name: 'Service Tracker', icon: ClipboardCheckIcon },
              { id: 'support', name: 'Support Tickets', icon: TicketIcon },
              { id: 'account', name: 'Account Management', icon: CogIcon },
              { id: 'payments', name: 'Payment Processing', icon: CreditCardIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'documents' && renderDocuments()}
      {activeTab === 'services' && renderServices()}
      {activeTab === 'support' && renderSupport()}
      {activeTab === 'account' && renderAccount()}
      {activeTab === 'payments' && renderPayments()}
    </div>
  );
};

export default ClientPortalEnhancements;

