import React, { useState } from 'react';
import {
  UserIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  SearchIcon,
  FilterIcon,
  XIcon,
  PhoneIcon,
  MailIcon,
  OfficeBuildingIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon
} from '@heroicons/react/outline';
import { Person, SELECT_OPTIONS } from '../../../types/schema';
import { useCRM } from '../../../contexts/CRMContext';

const Contacts: React.FC = () => {
  const { contacts, createContact, updateContact, deleteContact } = useCRM();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Person | null>(null);
  const [editingContact, setEditingContact] = useState<Person | null>(null);

  // Using real contacts from database via CRMContext
  // Mock data removed - now using real database data

  const [newContact, setNewContact] = useState<Partial<Person>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredContactMethod: 'Phone',
    isCompanyOwner: true,
    isPrimaryContact: true
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm) ||
                         (contact.companyOwnerFirstName && contact.companyOwnerFirstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (contact.companyOwnerLastName && contact.companyOwnerLastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'owner' && contact.isCompanyOwner) ||
                         (filterStatus === 'contact' && !contact.isCompanyOwner);
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateContact = async () => {
    if (newContact.firstName && newContact.lastName && newContact.email && newContact.phone) {
      try {
        await createContact({
          companyId: '1', // Default company ID
          firstName: newContact.firstName,
          lastName: newContact.lastName,
          email: newContact.email,
          phone: newContact.phone,
          preferredContactMethod: newContact.preferredContactMethod!,
          isPrimaryContact: newContact.isPrimaryContact || true,
          isCompanyOwner: newContact.isCompanyOwner,
          companyOwnerFirstName: newContact.companyOwnerFirstName,
          companyOwnerLastName: newContact.companyOwnerLastName,
          companyOwnerPhone: newContact.companyOwnerPhone,
          companyOwnerEmail: newContact.companyOwnerEmail
        });
        
        setNewContact({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          preferredContactMethod: 'Phone',
          isCompanyOwner: true,
          isPrimaryContact: true
        });
        setShowCreateModal(false);
      } catch (error) {
        console.error('Failed to create contact:', error);
        alert('Failed to create contact. Please try again.');
      }
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    
    try {
      await deleteContact(contactId);
    } catch (error) {
      console.error('Failed to delete contact:', error);
      alert('Failed to delete contact. Please try again.');
    }
  };

  const handleEditContact = (contact: Person) => {
    setEditingContact(contact);
    setNewContact({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      preferredContactMethod: contact.preferredContactMethod,
      isCompanyOwner: contact.isCompanyOwner,
      isPrimaryContact: contact.isPrimaryContact
    });
    setShowCreateModal(true);
  };

  const handleUpdateContact = async () => {
    if (newContact.firstName && newContact.lastName && newContact.email && newContact.phone && editingContact) {
      try {
        await updateContact(editingContact.id, {
          firstName: newContact.firstName,
          lastName: newContact.lastName,
          email: newContact.email,
          phone: newContact.phone,
          preferredContactMethod: newContact.preferredContactMethod,
          isCompanyOwner: newContact.isCompanyOwner,
          isPrimaryContact: newContact.isPrimaryContact
        });
        
        setNewContact({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          preferredContactMethod: 'Phone',
          isCompanyOwner: true,
          isPrimaryContact: true
        });
        setEditingContact(null);
        setShowCreateModal(false);
      } catch (error) {
        console.error('Failed to update contact:', error);
        alert('Failed to update contact. Please try again.');
      }
    }
  };

  const totalContacts = contacts.length;
  const companyOwners = contacts.filter(c => c.isCompanyOwner).length;
  const regularContacts = contacts.filter(c => !c.isCompanyOwner).length;
  const phoneContacts = contacts.filter(c => c.preferredContactMethod === 'Phone').length;
  const emailContacts = contacts.filter(c => c.preferredContactMethod === 'Email').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transportation Contacts</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage transportation company contacts, owners, and key personnel
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setEditingContact(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Contact
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Contacts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {totalContacts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <OfficeBuildingIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Company Owners
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {companyOwners}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Regular Contacts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {regularContacts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhoneIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Phone Preferred
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {phoneContacts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MailIcon className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Email Preferred
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {emailContacts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Search contacts, owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact Type
            </label>
            <select
              id="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Contacts</option>
              <option value="owner">Company Owners</option>
              <option value="contact">Regular Contacts</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Contacts List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredContacts.map((contact) => (
            <li key={contact.id}>
              <div className="px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <p className="text-lg font-medium text-blue-600 dark:text-blue-400 truncate">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {contact.isCompanyOwner && (
                          <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Owner
                          </span>
                        )}
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {contact.preferredContactMethod}
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MailIcon className="h-4 w-4 mr-2" />
                          {contact.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          {contact.phone}
                        </div>
                      </div>
                      
                      {!contact.isCompanyOwner && contact.companyOwnerFirstName && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <OfficeBuildingIcon className="h-4 w-4 mr-2" />
                            <span className="font-medium">Company Owner:</span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {contact.companyOwnerFirstName} {contact.companyOwnerLastName}
                          </div>
                          <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <MailIcon className="h-3 w-3 mr-1" />
                              {contact.companyOwnerEmail}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <PhoneIcon className="h-3 w-3 mr-1" />
                              {contact.companyOwnerPhone}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedContact(contact)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="View details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditContact(contact)}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Edit contact"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Delete contact"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-xl">
                      {selectedContact.firstName[0]}{selectedContact.lastName[0]}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                      {selectedContact.firstName} {selectedContact.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedContact.isCompanyOwner ? 'Company Owner' : 'Contact Person'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center">
                      <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{selectedContact.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{selectedContact.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <IdentificationIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Preferred Contact Method</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{selectedContact.preferredContactMethod}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {selectedContact.isCompanyOwner ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-gray-400 mr-3" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Owner</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedContact.isCompanyOwner ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Company Owner Information (if applicable) */}
                {!selectedContact.isCompanyOwner && selectedContact.companyOwnerFirstName && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Company Owner Information</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner Name</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedContact.companyOwnerFirstName} {selectedContact.companyOwnerLastName}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner Email</p>
                          <p className="text-sm text-gray-900 dark:text-gray-100">{selectedContact.companyOwnerEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner Phone</p>
                          <p className="text-sm text-gray-900 dark:text-gray-100">{selectedContact.companyOwnerPhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* System Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">System Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(selectedContact.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(selectedContact.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Contact Modal - Comprehensive Transportation Schema */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-5 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  {editingContact ? 'Edit Transportation Contact' : 'Add New Transportation Contact'}
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Contact Information Section */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={newContact.firstName || ''}
                        onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter first name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={newContact.lastName || ''}
                        onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter last name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={newContact.email || ''}
                        onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={newContact.phone || ''}
                        onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                        required
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Preferred Contact Method *
                      </label>
                      <select
                        value={newContact.preferredContactMethod || 'Phone'}
                        onChange={(e) => setNewContact(prev => ({ ...prev, preferredContactMethod: e.target.value as any }))}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {SELECT_OPTIONS.preferredContactMethod.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newContact.isCompanyOwner || false}
                          onChange={(e) => setNewContact(prev => ({ ...prev, isCompanyOwner: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          This person is a company owner
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Company Owner Information Section (shown when not owner) */}
                {!newContact.isCompanyOwner && (
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Company Owner Information</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Owner First Name
                        </label>
                        <input
                          type="text"
                          value={newContact.companyOwnerFirstName || ''}
                          onChange={(e) => setNewContact(prev => ({ ...prev, companyOwnerFirstName: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter owner first name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Owner Last Name
                        </label>
                        <input
                          type="text"
                          value={newContact.companyOwnerLastName || ''}
                          onChange={(e) => setNewContact(prev => ({ ...prev, companyOwnerLastName: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter owner last name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Owner Email
                        </label>
                        <input
                          type="email"
                          value={newContact.companyOwnerEmail || ''}
                          onChange={(e) => setNewContact(prev => ({ ...prev, companyOwnerEmail: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter owner email"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Owner Phone
                        </label>
                        <input
                          type="tel"
                          value={newContact.companyOwnerPhone || ''}
                          onChange={(e) => setNewContact(prev => ({ ...prev, companyOwnerPhone: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter owner phone"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingContact(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={editingContact ? handleUpdateContact : handleCreateContact}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
