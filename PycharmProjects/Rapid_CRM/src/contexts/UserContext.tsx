import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
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
    canManageAgents: boolean;
    canManageSchema: boolean;
  };
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: keyof User['permissions']) => boolean;
  hasRole: (role: User['role']) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Default users for demo purposes
const defaultUsers: User[] = [
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
      canManageSchema: true,
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
      canManageAgents: false,
      canManageSchema: false,
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
      canManageAgents: false,
      canManageSchema: false,
    }
  }
];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(defaultUsers[0]); // Default to admin for demo

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would make an API call
    const foundUser = defaultUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    return user?.permissions[permission] ?? false;
  };

  const hasRole = (role: User['role']): boolean => {
    return user?.role === role;
  };

  return (
    <UserContext.Provider value={{ user, login, logout, hasPermission, hasRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
