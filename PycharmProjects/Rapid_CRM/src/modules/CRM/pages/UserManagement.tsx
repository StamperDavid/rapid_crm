import React, { useState } from 'react';
import { 
  UserGroupIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../../../contexts/UserContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  permissions: {
    canManageIntegrations: boolean;
    canDeleteIntegrations: boolean;
    canAddCategories: boolean;
    canManageUsers: boolean;
    canViewFinancials: boolean;
    canEditInvoices: boolean;
  };
}

const UserManagement: React.FC = () => {
  const { hasPermission } = useUser();
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
      }
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
      }
    },
    {
      id: '3',
      name: 'Regular User',
      email: 'user@rapidcrm.com',
      role: 'user',
      permissions: {
        canManageIntegrations: false,
        canDeleteIntegrations: false,
        canAddCategories: false,
        canManageUsers: false,
        canViewFinancials: false,
        canEditInvoices: false,
      }
    }
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user' as User['role'],
    permissions: {
      canManageIntegrations: false,
      canDeleteIntegrations: false,
      canAddCategories: false,
      canManageUsers: false,
      canViewFinancials: false,
      canEditInvoices: false,
    }
  });

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'manager':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage user accounts and permissions
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingUser(null);
            setShowAddUserModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.name}
                      </p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(user.permissions)
                        .filter(([_, value]) => value)
                        .map(([permission, _]) => (
                          <span
                            key={permission}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

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
