import React, { useState } from 'react';
import {
  PlusIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  UploadIcon,
  DownloadIcon,
  SearchIcon,
  XIcon,
} from '@heroicons/react/outline';
import { useAgentBuilder } from '../hooks/useAgentBuilder';

interface KnowledgeBaseManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (kbId: string) => void;
  selectedIds?: string[];
}

const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedIds = []
}) => {
  const {
    knowledgeBases,
    knowledgeBaseLoading,
    knowledgeBaseError,
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase,
    getKnowledgeBaseStats,
  } = useAgentBuilder();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingKB, setEditingKB] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newKBData, setNewKBData] = useState({
    name: '',
    description: '',
    type: 'proprietary' as 'regulatory' | 'proprietary' | 'public',
    source: 'upload' as 'api' | 'upload' | 'scrape'
  });

  const filteredKnowledgeBases = knowledgeBases.filter(kb =>
    kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kb.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateKB = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createKnowledgeBase({
        ...newKBData,
        status: 'active',
        size: '0 MB'
      });
      setNewKBData({ name: '', description: '', type: 'proprietary', source: 'upload' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create knowledge base:', error);
    }
  };

  const handleUpdateKB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKB) return;
    
    try {
      await updateKnowledgeBase(editingKB.id, newKBData);
      setEditingKB(null);
      setNewKBData({ name: '', description: '', type: 'proprietary', source: 'upload' });
    } catch (error) {
      console.error('Failed to update knowledge base:', error);
    }
  };

  const handleDeleteKB = async (kbId: string) => {
    if (confirm('Are you sure you want to delete this knowledge base?')) {
      try {
        await deleteKnowledgeBase(kbId);
      } catch (error) {
        console.error('Failed to delete knowledge base:', error);
      }
    }
  };

  const handleEditKB = (kb: any) => {
    setEditingKB(kb);
    setNewKBData({
      name: kb.name,
      description: kb.description,
      type: kb.type,
      source: kb.source
    });
    setShowCreateForm(true);
  };

  const handleSelectKB = (kbId: string) => {
    if (onSelect) {
      onSelect(kbId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Knowledge Base Manager
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Create and manage knowledge bases for your AI agents
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Search and Create */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search knowledge bases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setShowCreateForm(true);
                setEditingKB(null);
                setNewKBData({ name: '', description: '', type: 'proprietary', source: 'upload' });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Knowledge Base
            </button>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
                {editingKB ? 'Edit Knowledge Base' : 'Create New Knowledge Base'}
              </h4>
              <form onSubmit={editingKB ? handleUpdateKB : handleCreateKB} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newKBData.name}
                      onChange={(e) => setNewKBData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Enter knowledge base name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={newKBData.type}
                      onChange={(e) => setNewKBData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="regulatory">Regulatory</option>
                      <option value="proprietary">Proprietary</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newKBData.description}
                    onChange={(e) => setNewKBData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Describe the knowledge base content and purpose"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Source
                  </label>
                  <select
                    value={newKBData.source}
                    onChange={(e) => setNewKBData(prev => ({ ...prev, source: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="upload">File Upload</option>
                    <option value="api">API Integration</option>
                    <option value="scrape">Web Scraping</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingKB(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingKB ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Error Display */}
          {knowledgeBaseError && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {knowledgeBaseError}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Knowledge Bases List */}
          {knowledgeBaseLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading knowledge bases...</span>
              </div>
            </div>
          ) : filteredKnowledgeBases.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {searchQuery ? 'No knowledge bases found' : 'No knowledge bases'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery 
                  ? 'Try adjusting your search terms.'
                  : 'Get started by creating your first knowledge base.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKnowledgeBases.map((kb) => (
                <div
                  key={kb.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    selectedIds.includes(kb.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {kb.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {kb.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {onSelect && (
                        <button
                          onClick={() => handleSelectKB(kb.id)}
                          className={`p-1 rounded ${
                            selectedIds.includes(kb.id)
                              ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditKB(kb)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteKB(kb.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {kb.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Size: {kb.size}</span>
                    <span>Updated: {new Date(kb.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      kb.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : kb.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {kb.status}
                    </span>
                    <div className="flex space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <UploadIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <DownloadIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseManager;
