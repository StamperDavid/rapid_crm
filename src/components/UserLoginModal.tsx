/**
 * USER LOGIN MODAL
 * 
 * A simple login modal to demonstrate the user authentication system.
 * In a real application, this would integrate with your existing auth system.
 */

import React, { useState } from 'react';
import { userAuthenticationService, UserRole } from '../services/auth/UserAuthenticationService';
import { aiUserContextService } from '../services/ai/AIUserContextService';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

const UserLoginModal: React.FC<UserLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await userAuthenticationService.authenticateUser(username, password);
      
      if (result.success && result.user) {
        // Update AI user context
        await aiUserContextService.updateUserContext();
        
        // Notify parent component
        onLogin(result.user);
        
        // Close modal
        onClose();
        
        // Reset form
        setUsername('');
        setPassword('');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await userAuthenticationService.authenticateUser(role, 'password123');
      
      if (result.success && result.user) {
        // Update AI user context
        await aiUserContextService.updateUserContext();
        
        // Notify parent component
        onLogin(result.user);
        
        // Close modal
        onClose();
      } else {
        setError(result.error || 'Demo login failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Login to Rapid CRM</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Demo Accounts (password: password123):
          </div>
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin(UserRole.BOSS)}
              disabled={isLoading}
              className="w-full px-3 py-2 text-left bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-md hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 disabled:opacity-50"
            >
              <div className="font-medium text-purple-900 dark:text-purple-200">Boss Account</div>
              <div className="text-xs text-purple-600 dark:text-purple-300">Full access to all features</div>
            </button>
            
            <button
              onClick={() => handleDemoLogin(UserRole.ADMIN)}
              disabled={isLoading}
              className="w-full px-3 py-2 text-left bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <div className="font-medium text-gray-900 dark:text-white">Admin Account</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">System administration access</div>
            </button>
            
            <button
              onClick={() => handleDemoLogin(UserRole.MANAGER)}
              disabled={isLoading}
              className="w-full px-3 py-2 text-left bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50"
            >
              <div className="font-medium text-blue-900 dark:text-blue-200">Manager Account</div>
              <div className="text-xs text-blue-600 dark:text-blue-300">Operational management access</div>
            </button>
            
            <button
              onClick={() => handleDemoLogin(UserRole.AGENT)}
              disabled={isLoading}
              className="w-full px-3 py-2 text-left bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50"
            >
              <div className="font-medium text-green-900 dark:text-green-200">Agent Account</div>
              <div className="text-xs text-green-600 dark:text-green-300">Customer service access</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoginModal;
