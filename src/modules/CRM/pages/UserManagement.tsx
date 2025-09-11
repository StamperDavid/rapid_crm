import React, { useState } from 'react';
import { 
  UserGroupIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  KeyIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useUser } from '../../../contexts/UserContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'compliance_officer' | 'sales_rep' | 'custom';
  permissions: {
    canManageIntegrations: boolean;
    canDeleteIntegrations: boolean;
    canAddCategories: boolean;
    canManageUsers: boolean;
    canViewFinancials: boolean;
    canEditInvoices: boolean;
    canManageAgents: boolean;
    canViewAnalytics: boolean;
    canManageCompliance: boolean;
    canAccessDatabase: boolean;
    canManageApiKeys: boolean;
    canViewSystemMonitoring: boolean;
  };
  lastLogin: string;
  status: 'active' | 'inactive' | 'suspended';
  department: string;
  twoFactorEnabled: boolean;
}

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: Partial<User['permissions']>;
  color: string;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

const UserManagement: React.FC = () => {
  const { hasPermission } = useUser();
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'audit' | 'security'>('users');
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@rapidcrm.com',
      role: 'admin',
      permissions: {
        canManageIntegrations: true,
        canDeleteIntegrations: true,
        canAddCategories: true,
        canManageUsers: true,
        canViewFinancials: true,
        canEditInvoices: true,
        canManageAgents: true,
        canViewAnalytics: true,
        canManageCompliance: true,
        canAccessDatabase: true,
        canManageApiKeys: true,
        canViewSystemMonitoring: true,
      },
      lastLogin: '2024-01-20T10:30:00Z',
      status: 'active',
      department: 'IT',
      twoFactorEnabled: true
    },
    {
      id: '2',
      name: 'Manager User',
      email: 'manager@rapidcrm.com',
      role: 'manager',
      permissions: {
        canManageIntegrations: true,
        canDeleteIntegrations: false,
        canAddCategories: false,
        canManageUsers: false,
        canViewFinancials: true,
        canEditInvoices: true,
        canManageAgents: false,
        canViewAnalytics: true,
        canManageCompliance: false,
        canAccessDatabase: false,
        canManageApiKeys: false,
        canViewSystemMonitoring: false,
      },
      lastLogin: '2024-01-19T15:45:00Z',
      status: 'active',
      department: 'Operations',
      twoFactorEnabled: true
    },
    {
      id: '3',
      name: 'Compliance Officer',
      email: 'compliance@rapidcrm.com',
      role: 'compliance_officer',
      permissions: {
        canManageIntegrations: false,
        canDeleteIntegrations: false,
        canAddCategories: false,
        canManageUsers: false,
        canViewFinancials: false,
        canEditInvoices: false,
        canManageAgents: false,
        canViewAnalytics: true,
        canManageCompliance: true,
        canAccessDatabase: false,
        canManageApiKeys: false,
        canViewSystemMonitoring: true,
      },
      lastLogin: '2024-01-18T09:15:00Z',
      status: 'active',
      department: 'Compliance',
      twoFactorEnabled: true
    },
    {
      id: '4',
      name: 'Sales Representative',
      email: 'sales@rapidcrm.com',
      role: 'sales_rep',
      permissions: {
        canManageIntegrations: false,
        canDeleteIntegrations: false,
        canAddCategories: false,
        canManageUsers: false,
        canViewFinancials: true,
        canEditInvoices: true,
        canManageAgents: false,
        canViewAnalytics: true,
        canManageCompliance: false,
        canAccessDatabase: false,
        canManageApiKeys: false,
        canViewSystemMonitoring: false,
      },
      lastLogin: '2024-01-17T14:20:00Z',
      status: 'active',
      department: 'Sales',
      twoFactorEnabled: false
    }
  ]);

  const roleTemplates: RoleTemplate[] = [
    {
      id: '1',
      name: 'System Administrator',
      description: 'Full system access with all permissions',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      permissions: {
        canManageIntegrations: true,
        canDeleteIntegrations: true,
        canAddCategories: true,
        canManageUsers: true,
        canViewFinancials: true,
        canEditInvoices: true,
        canManageAgents: true,
        canViewAnalytics: true,
        canManageCompliance: true,
        canAccessDatabase: true,
        canManageApiKeys: true,
        canViewSystemMonitoring: true,
      }
    },
    {
      id: '2',
      name: 'Operations Manager',
      description: 'Manage operations and view analytics',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      permissions: {
        canManageIntegrations: true,
        canDeleteIntegrations: false,
        canAddCategories: false,
        canManageUsers: false,
        canViewFinancials: true,
        canEditInvoices: true,
        canManageAgents: false,
        canViewAnalytics: true,
        canManageCompliance: false,
        canAccessDatabase: false,
        canManageApiKeys: false,
        canViewSystemMonitoring: false,
      }
    },
    {
      id: '3',
      name: 'Compliance Officer',
      description: 'Monitor compliance and regulatory requirements',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      permissions: {
        canManageIntegrations: false,
        canDeleteIntegrations: false,
        canAddCategories: false,
        canManageUsers: false,
        canViewFinancials: false,
        canEditInvoices: false,
        canManageAgents: false,
        canViewAnalytics: true,
        canManageCompliance: true,
        canAccessDatabase: false,
        canManageApiKeys: false,
        canViewSystemMonitoring: true,
      }
    },
    {
      id: '4',
      name: 'Sales Representative',
      description: 'Access to sales tools and customer data',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      permissions: {
        canManageIntegrations: false,
        canDeleteIntegrations: false,
        canAddCategories: false,
        canManageUsers: false,
        canViewFinancials: true,
        canEditInvoices: true,
        canManageAgents: false,
        canViewAnalytics: true,
        canManageCompliance: false,
        canAccessDatabase: false,
        canManageApiKeys: false,
        canViewSystemMonitoring: false,
      }
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: '1',
      userId: '1',
      userName: 'Admin User',
      action: 'Created user',
      resource: 'User Management',
      timestamp: '2024-01-20T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '2',
      userId: '2',
      userName: 'Manager User',
      action: 'Updated permissions',
      resource: 'User Management',
      timestamp: '2024-01-19T15:45:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    {
      id: '3',
      userId: '1',
      userName: 'Admin User',
      action: 'Accessed system monitoring',
      resource: 'System Monitoring',
      timestamp: '2024-01-18T09:15:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  ];

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user' as User['role'],
    department: '',
    permissions: {
      canManageIntegrations: false,
      canDeleteIntegrations: false,
      canAddCategories: false,
      canManageUsers: false,
      canViewFinancials: false,
      canEditInvoices: false,
      canManageAgents: false,
      canViewAnalytics: false,
      canManageCompliance: false,
      canAccessDatabase: false,
      canManageApiKeys: false,
      canViewSystemMonitoring: false,
    }
  });

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'manager':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'compliance_officer':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'sales_rep':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const user: User = {
        id: (users.length + 1).toString(),
        ...newUser
      };
      setUsers(prev => [...prev, user]);
      setNewUser({
        name: '',
        email: '',
        role: 'user',
        permissions: {
          canManageIntegrations: false,
          canDeleteIntegrations: false,
          canAddCategories: false,
          canManageUsers: false,
          canViewFinancials: false,
          canEditInvoices: false,
        }
      });
      setShowAddUserModal(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser(user);
    setShowAddUserModal(true);
  };

  const handleUpdateUser = () => {
    if (editingUser && newUser.name && newUser.email) {
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? { ...newUser, id: editingUser.id } : user
      ));
      setEditingUser(null);
      setNewUser({
        name: '',
        email: '',
        role: 'user',
        permissions: {
          canManageIntegrations: false,
          canDeleteIntegrations: false,
          canAddCategories: false,
          canManageUsers: false,
          canViewFinancials: false,
          canEditInvoices: false,
        }
      });
      setShowAddUserModal(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handlePermissionChange = (permission: keyof User['permissions'], value: boolean) => {
    setNewUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  const handleRoleChange = (role: User['role']) => {
    setNewUser(prev => ({
      ...prev,
      role,
      permissions: {
        // Set default permissions based on role
        canManageIntegrations: role === 'admin' || role === 'manager',
        canDeleteIntegrations: role === 'admin',
        canAddCategories: role === 'admin',
        canManageUsers: role === 'admin',
        canViewFinancials: role === 'admin' || role === 'manager',
        canEditInvoices: role === 'admin' || role === 'manager',
      }
    }));
  };

  if (!hasPermission('canManageUsers')) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You don't have permission to manage users.
          </p>
        </div>
      </div>
    );
  }

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
            Users
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage user accounts and permissions
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingUser(null);
            setShowAddUserModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {users.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {user.name}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {user.email} • {user.department}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Last login: {new Date(user.lastLogin).toLocaleDateString()}
                        {user.twoFactorEnabled && (
                          <span className="ml-2 inline-flex items-center text-green-600">
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            2FA
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(user.permissions)
                        .filter(([_, value]) => value)
                        .slice(0, 3)
                        .map(([permission, _]) => (
                          <span
                            key={permission}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          >
                            {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        ))}
                      {Object.entries(user.permissions).filter(([_, value]) => value).length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                          +{Object.entries(user.permissions).filter(([_, value]) => value).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderRoles = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
            Role Templates
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Predefined role templates with specific permissions
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {roleTemplates.map((template) => (
          <div key={template.id} className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {template.name}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {template.description}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${template.color}`}>
                Template
              </span>
            </div>
            <div className="mt-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Permissions ({Object.values(template.permissions).filter(Boolean).length} enabled):
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(template.permissions)
                  .filter(([_, value]) => value)
                  .slice(0, 4)
                  .map(([permission, _]) => (
                    <span
                      key={permission}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    >
                      {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  ))}
                {Object.entries(template.permissions).filter(([_, value]) => value).length > 4 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                    +{Object.entries(template.permissions).filter(([_, value]) => value).length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAudit = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
            Audit Logs
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track user actions and system access
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          Export Logs
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {auditLogs.map((log) => (
            <li key={log.id}>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {log.userName} {log.action} {log.resource}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(log.timestamp).toLocaleString()} • {log.ipAddress}
                      </p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
          Security Settings
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure security policies and authentication settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {users.filter(u => u.twoFactorEnabled).length} of {users.length} users have 2FA enabled
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <KeyIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Password Policy
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Minimum 8 characters, mixed case, numbers required
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-8 w-8 text-orange-600" />
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Session Timeout
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                8 hours of inactivity before automatic logout
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Failed Login Protection
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Account locked after 5 failed attempts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-slate-100 sm:truncate sm:text-3xl sm:tracking-tight">
            User Management & Permissions
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Role-based access control, user management, and security settings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', name: 'Users', icon: UserGroupIcon },
            { id: 'roles', name: 'Roles', icon: ShieldCheckIcon },
            { id: 'audit', name: 'Audit Logs', icon: DocumentTextIcon },
            { id: 'security', name: 'Security', icon: KeyIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'roles' && renderRoles()}
      {activeTab === 'audit' && renderAudit()}
      {activeTab === 'security' && renderSecurity()}

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddUserModal(false);
                    setEditingUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="User name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => handleRoleChange(e.target.value as User['role'])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {Object.entries(newUser.permissions).map(([permission, value]) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handlePermissionChange(permission as keyof User['permissions'], e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddUserModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={editingUser ? handleUpdateUser : handleAddUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
