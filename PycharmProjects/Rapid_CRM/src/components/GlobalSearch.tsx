import React, { useState, useEffect, useRef } from 'react';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface SearchResult {
  id: string;
  type: 'contact' | 'company' | 'deal' | 'invoice' | 'task';
  title: string;
  subtitle: string;
  url: string;
  icon: React.ComponentType<any>;
  relevance: number;
}

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock data for search results
  const mockData = {
    contacts: [
      { id: '1', firstName: 'John', lastName: 'Smith', email: 'john@acme.com', phone: '(555) 123-4567' },
      { id: '2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@techsolutions.com', phone: '(555) 987-6543' },
      { id: '3', firstName: 'Mike', lastName: 'Wilson', email: 'mike@globalshipping.com', phone: '(555) 456-7890' },
    ],
    companies: [
      { id: '1', legalBusinessName: 'Acme Transportation LLC', businessClassification: 'Carrier', physicalCity: 'Chicago', usdotNumber: '123456' },
      { id: '2', legalBusinessName: 'Tech Solutions Inc', businessClassification: 'Broker', physicalCity: 'Austin', usdotNumber: '789012' },
      { id: '3', legalBusinessName: 'Global Shipping Co', businessClassification: 'Freight Forwarder', physicalCity: 'Miami', usdotNumber: '345678' },
    ],
    deals: [
      { id: '1', title: 'Website Development', company: 'Acme Corp', value: 25000, stage: 'Proposal' },
      { id: '2', title: 'CRM Implementation', company: 'Tech Solutions', value: 15000, stage: 'Negotiation' },
      { id: '3', title: 'Mobile App Development', company: 'Global Shipping', value: 35000, stage: 'Closed Won' },
    ],
    invoices: [
      { id: '1', number: 'INV-2024-001', client: 'Acme Corp', amount: 2500, status: 'Paid' },
      { id: '2', number: 'INV-2024-002', client: 'Tech Solutions', amount: 1800, status: 'Sent' },
      { id: '3', number: 'INV-2024-003', client: 'Global Shipping', amount: 3200, status: 'Overdue' },
    ],
    tasks: [
      { id: '1', title: 'Follow up with John Smith', dueDate: '2024-01-25', priority: 'High' },
      { id: '2', title: 'Prepare proposal for Tech Solutions', dueDate: '2024-01-26', priority: 'Medium' },
      { id: '3', title: 'Update project timeline', dueDate: '2024-01-27', priority: 'Low' },
    ]
  };

  const searchData = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const searchResults: SearchResult[] = [];
    const query = searchQuery.toLowerCase();

    // Search contacts
    mockData.contacts.forEach(contact => {
      const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
      if (fullName.includes(query) || 
          contact.email.toLowerCase().includes(query) || 
          contact.phone.includes(query)) {
        searchResults.push({
          id: contact.id,
          type: 'contact',
          title: `${contact.firstName} ${contact.lastName}`,
          subtitle: `${contact.email} • ${contact.phone}`,
          url: `/contacts`,
          icon: UserGroupIcon,
          relevance: fullName.includes(query) ? 100 : 80
        });
      }
    });

    // Search companies
    mockData.companies.forEach(company => {
      if (company.legalBusinessName.toLowerCase().includes(query) || 
          company.businessClassification.toLowerCase().includes(query) ||
          company.physicalCity.toLowerCase().includes(query) ||
          company.usdotNumber.includes(query)) {
        searchResults.push({
          id: company.id,
          type: 'company',
          title: company.legalBusinessName,
          subtitle: `${company.businessClassification} • ${company.physicalCity} • USDOT: ${company.usdotNumber}`,
          url: `/companies`,
          icon: BuildingOfficeIcon,
          relevance: company.legalBusinessName.toLowerCase().includes(query) ? 100 : 80
        });
      }
    });

    // Search deals
    mockData.deals.forEach(deal => {
      if (deal.title.toLowerCase().includes(query) || 
          deal.company.toLowerCase().includes(query) || 
          deal.stage.toLowerCase().includes(query)) {
        searchResults.push({
          id: deal.id,
          type: 'deal',
          title: deal.title,
          subtitle: `${deal.company} • $${deal.value.toLocaleString()} • ${deal.stage}`,
          url: `/deals`,
          icon: CurrencyDollarIcon,
          relevance: deal.title.toLowerCase().includes(query) ? 100 : 80
        });
      }
    });

    // Search invoices
    mockData.invoices.forEach(invoice => {
      if (invoice.number.toLowerCase().includes(query) || 
          invoice.client.toLowerCase().includes(query) || 
          invoice.status.toLowerCase().includes(query)) {
        searchResults.push({
          id: invoice.id,
          type: 'invoice',
          title: invoice.number,
          subtitle: `${invoice.client} • $${invoice.amount.toLocaleString()} • ${invoice.status}`,
          url: `/invoices`,
          icon: DocumentTextIcon,
          relevance: invoice.number.toLowerCase().includes(query) ? 100 : 80
        });
      }
    });

    // Search tasks
    mockData.tasks.forEach(task => {
      if (task.title.toLowerCase().includes(query) || 
          task.priority.toLowerCase().includes(query)) {
        searchResults.push({
          id: task.id,
          type: 'task',
          title: task.title,
          subtitle: `Due: ${task.dueDate} • Priority: ${task.priority}`,
          url: `/tasks`,
          icon: ClockIcon,
          relevance: task.title.toLowerCase().includes(query) ? 100 : 80
        });
      }
    });

    // Sort by relevance
    searchResults.sort((a, b) => b.relevance - a.relevance);
    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setIsLoading(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchData(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const result = results[selectedIndex];
      window.location.href = result.url;
      setIsOpen(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contact': return 'text-blue-600';
      case 'company': return 'text-purple-600';
      case 'deal': return 'text-orange-600';
      case 'invoice': return 'text-red-600';
      case 'task': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contact': return 'Contact';
      case 'company': return 'Company';
      case 'deal': return 'Deal';
      case 'invoice': return 'Invoice';
      case 'task': return 'Task';
      default: return 'Item';
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <MagnifyingGlassIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-gray-500 bg-gray-200 dark:bg-gray-600 dark:text-gray-400 rounded">
          /
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-50 flex items-start justify-center pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
            {/* Search Input */}
            <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 text-lg bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Search contacts, companies, deals, invoices..."
                autoComplete="off"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((result, index) => {
                    const IconComponent = result.icon;
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => {
                          window.location.href = result.url;
                          setIsOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 ${
                          index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 ${getTypeColor(result.type)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {result.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {result.subtitle}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-600 ${getTypeColor(result.type)}`}>
                          {getTypeLabel(result.type)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : query ? (
                <div className="px-4 py-8 text-center">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No results found for "{query}"
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Try searching for contacts, companies, deals, or invoices
                  </p>
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Start typing to search across all your data
                  </p>
                  <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                    <p>Search for:</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      {['contacts', 'companies', 'deals', 'invoices', 'tasks'].map((type) => (
                        <span key={type} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard Shortcuts */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <kbd className="px-1.5 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-600 rounded">↑↓</kbd>
                    <span className="ml-1">Navigate</span>
                  </span>
                  <span className="flex items-center">
                    <kbd className="px-1.5 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-600 rounded">Enter</kbd>
                    <span className="ml-1">Select</span>
                  </span>
                </div>
                <span className="flex items-center">
                  <kbd className="px-1.5 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-600 rounded">Esc</kbd>
                  <span className="ml-1">Close</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
