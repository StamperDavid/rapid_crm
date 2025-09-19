import React, { useState, useEffect } from 'react';
import {
  BookOpenIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UploadIcon,
  DownloadIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/outline';
import { 
  knowledgeManagementService, 
  KnowledgeEntry, 
  PersonaUpdate, 
  KnowledgeUpdate 
} from '../services/ai/KnowledgeManagementService';

interface KnowledgeManagementPanelProps {
  className?: string;
}

export const KnowledgeManagementPanel: React.FC<KnowledgeManagementPanelProps> = ({ 
  className = '' 
}) => {
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [personaHistory, setPersonaHistory] = useState<PersonaUpdate[]>([]);
  const [updateHistory, setUpdateHistory] = useState<KnowledgeUpdate[]>([]);
  const [activeTab, setActiveTab] = useState<'knowledge' | 'persona' | 'history' | 'excel'>('knowledge');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [newEntry, setNewEntry] = useState<Partial<KnowledgeEntry>>({
    category: 'business_rule',
    priority: 'medium',
    source: 'manual_entry',
    tags: [],
    isActive: true
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
    
    // Subscribe to knowledge updates
    const unsubscribe = knowledgeManagementService.subscribe((update) => {
      console.log('Knowledge update received:', update);
      loadData();
    });

    return unsubscribe;
  }, []);

  const loadData = () => {
    setKnowledgeEntries(knowledgeManagementService.getAllKnowledge());
    setPersonaHistory(knowledgeManagementService.getPersonaHistory());
    setUpdateHistory(knowledgeManagementService.getUpdateHistory());
  };

  const handleAddEntry = () => {
    if (!newEntry.title || !newEntry.content) {
      alert('Please fill in title and content');
      return;
    }

    knowledgeManagementService.addKnowledgeEntry({
      ...newEntry,
      effectiveDate: newEntry.effectiveDate || new Date().toISOString(),
      tags: newEntry.tags || [],
      metadata: newEntry.metadata || {}
    } as Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>);

    setNewEntry({
      category: 'business_rule',
      priority: 'medium',
      source: 'manual_entry',
      tags: [],
      isActive: true
    });
    setShowAddModal(false);
  };

  const handleUpdateEntry = (id: string, updates: Partial<KnowledgeEntry>) => {
    knowledgeManagementService.updateKnowledgeEntry(id, updates, 'Manual update via UI');
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Are you sure you want to delete this knowledge entry?')) {
      knowledgeManagementService.deleteKnowledgeEntry(id, 'Deleted via UI');
    }
  };

  const handleSupersedeEntry = (id: string) => {
    const supersedingId = `superseding_${Date.now()}`;
    knowledgeManagementService.supersedeKnowledgeEntry(id, supersedingId, 'Superseded via UI');
  };

  const filteredEntries = knowledgeEntries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'compliance_rule', 'business_rule', 'persona_trait', 'expertise', 'custom_rule', 'excel_data'];

  return (
    <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Knowledge Management
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage AI knowledge base and persona
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Knowledge</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'knowledge', label: 'Knowledge Base', count: knowledgeEntries.length },
          { id: 'persona', label: 'Persona History', count: personaHistory.length },
          { id: 'history', label: 'Update History', count: updateHistory.length },
          { id: 'excel', label: 'Excel Integration', count: 0 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Knowledge Base Tab */}
      {activeTab === 'knowledge' && (
        <div>
          {/* Search and Filters */}
          <div className="flex space-x-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Knowledge Entries */}
          <div className="space-y-4">
            {filteredEntries.map(entry => (
              <div
                key={entry.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {entry.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        entry.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        entry.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                        entry.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {entry.priority.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                        {entry.category.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {entry.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Effective: {new Date(entry.effectiveDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TagIcon className="h-4 w-4" />
                        <span>{entry.tags.join(', ')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {entry.source === 'excel_file' ? (
                          <UploadIcon className="h-4 w-4" />
                        ) : entry.source === 'boss_directive' ? (
                          <ExclamationTriangleIcon className="h-4 w-4" />
                        ) : (
                          <CheckCircleIcon className="h-4 w-4" />
                        )}
                        <span>{entry.source.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingEntry(entry)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      title="Edit entry"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleSupersedeEntry(entry.id)}
                      className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
                      title="Supersede entry"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete entry"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No knowledge entries found matching your criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Persona History Tab */}
      {activeTab === 'persona' && (
        <div className="space-y-4">
          {personaHistory.map(update => (
            <div
              key={update.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {update.field.replace('_', ' ').toUpperCase()}
                </h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(update.effectiveDate).toLocaleString()}
                </span>
              </div>
              
              <div className="mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Reason:</strong> {update.reason}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <p className="text-sm">
                  <strong>New Value:</strong> {JSON.stringify(update.newValue, null, 2)}
                </p>
              </div>
            </div>
          ))}
          
          {personaHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No persona updates yet.
            </div>
          )}
        </div>
      )}

      {/* Update History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {updateHistory.map(update => (
            <div
              key={update.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    update.type === 'add' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    update.type === 'update' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    update.type === 'delete' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                  }`}>
                    {update.type.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Entry ID: {update.entryId}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(update.timestamp).toLocaleString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Reason:</strong> {update.reason}
              </p>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Approved by:</strong> {update.approvedBy}
              </p>
            </div>
          ))}
          
          {updateHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No updates yet.
            </div>
          )}
        </div>
      )}

      {/* Excel Integration Tab */}
      {activeTab === 'excel' && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
              Excel File Integration
            </h4>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              Upload your driver qualification Excel file to automatically update the AI's knowledge base.
            </p>
            
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  dark:file:bg-blue-900/20 dark:file:text-blue-400"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Process File
              </button>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              ⚠️ Important Note
            </h4>
            <p className="text-yellow-800 dark:text-yellow-200">
              Your custom driver qualification Excel file <strong>SUPERSEDES</strong> standard GVWR and passenger limits 
              for determining USDOT number and driver qualification file requirements. This is a critical business rule 
              that overrides all standard regulations.
            </p>
          </div>
        </div>
      )}

      {/* Add Knowledge Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add Knowledge Entry
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newEntry.title || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter knowledge entry title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newEntry.content || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter knowledge content"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newEntry.category || 'business_rule'}
                    onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="compliance_rule">Compliance Rule</option>
                    <option value="business_rule">Business Rule</option>
                    <option value="persona_trait">Persona Trait</option>
                    <option value="expertise">Expertise</option>
                    <option value="custom_rule">Custom Rule</option>
                    <option value="excel_data">Excel Data</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={newEntry.priority || 'medium'}
                    onChange={(e) => setNewEntry({ ...newEntry, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newEntry.tags?.join(', ') || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Knowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
