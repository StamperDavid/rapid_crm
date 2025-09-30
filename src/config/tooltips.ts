// COMPREHENSIVE tooltip configurations for the ENTIRE application
export const TOOLTIPS = {
  // Navigation & Layout
  navigation: {
    dashboard: 'Main dashboard with overview of all business operations, metrics, and quick access to key features',
    companies: 'Manage client companies, view company details, and track business relationships',
    leads: 'Track potential clients, manage lead pipeline, and convert leads to customers',
    deals: 'Manage sales opportunities, track deal progress, and monitor revenue pipeline',
    services: 'Configure and manage service packages, pricing, and service delivery options',
    eld: 'Electronic Logging Device management, HOS compliance, and driver monitoring',
    ifta: 'International Fuel Tax Agreement reporting, fuel tax calculations, and compliance tracking',
    tasks: 'Task management, workflow tracking, and team collaboration tools',
    conversations: 'AI chat conversations, customer support tickets, and communication history',
    admin: 'Administrative functions, user management, and system settings',
    analytics: 'Business analytics, reports, and performance metrics',
    compliance: 'Compliance monitoring, regulatory tracking, and audit tools'
  },

  // Layout Elements
  layout: {
    sidebar: 'Main navigation sidebar with access to all system modules',
    header: 'Top header with user info, notifications, and global actions',
    breadcrumbs: 'Navigation breadcrumbs showing your current location in the system',
    search: 'Global search to find companies, contacts, deals, and other records',
    notifications: 'System notifications, alerts, and important messages',
    userMenu: 'User account menu with profile, settings, and logout options',
    themeToggle: 'Switch between light and dark themes',
    helpButton: 'Access help documentation and support resources'
  },

  // Common UI Elements
  common: {
    addButton: 'Add a new record to this section',
    editButton: 'Edit the selected record',
    deleteButton: 'Delete the selected record (this action cannot be undone)',
    saveButton: 'Save your changes',
    cancelButton: 'Cancel current action and discard changes',
    searchButton: 'Search for records matching your criteria',
    filterButton: 'Filter records by specific criteria',
    exportButton: 'Export data to CSV, Excel, or PDF format',
    importButton: 'Import data from external files',
    refreshButton: 'Refresh data from the server',
    printButton: 'Print current view or report',
    shareButton: 'Share this view or report with others',
    downloadButton: 'Download file or report',
    uploadButton: 'Upload files or documents',
    viewButton: 'View details of the selected record',
    duplicateButton: 'Create a copy of the selected record',
    archiveButton: 'Archive the selected record',
    restoreButton: 'Restore archived record',
    approveButton: 'Approve the selected item',
    rejectButton: 'Reject the selected item',
    statusBadge: 'Current status of this record',
    priorityBadge: 'Priority level of this item',
    typeBadge: 'Type or category of this record',
    dateField: 'Date and time information',
    timeField: 'Time information only',
    numberField: 'Numeric value field',
    textField: 'Text input field',
    emailField: 'Email address field',
    phoneField: 'Phone number field',
    addressField: 'Address information field',
    dropdownField: 'Select from predefined options',
    checkboxField: 'Check or uncheck this option',
    radioField: 'Select one option from the group',
    fileField: 'Upload or select a file',
    imageField: 'Upload or select an image',
    passwordField: 'Password input field (hidden text)',
    urlField: 'Website URL field',
    currencyField: 'Monetary amount field',
    percentageField: 'Percentage value field',
    requiredField: 'This field is required and must be filled',
    optionalField: 'This field is optional',
    readonlyField: 'This field is read-only and cannot be edited',
    disabledField: 'This field is currently disabled',
    loadingSpinner: 'Loading data, please wait...',
    errorMessage: 'Error message - something went wrong',
    warningMessage: 'Warning message - please review',
    successMessage: 'Success message - action completed',
    infoMessage: 'Information message - helpful details',
    emptyState: 'No data available to display',
    noResults: 'No results found for your search',
    pagination: 'Navigate through multiple pages of results',
    sortAscending: 'Sort in ascending order (A-Z, 1-9)',
    sortDescending: 'Sort in descending order (Z-A, 9-1)',
    columnResize: 'Drag to resize this column',
    rowSelect: 'Click to select this row',
    bulkSelect: 'Select multiple rows for bulk actions',
    expandRow: 'Click to expand and view more details',
    collapseRow: 'Click to collapse and hide details',
    dragHandle: 'Drag to reorder items',
    resizeHandle: 'Drag to resize this element'
  },

  // Dashboard
  dashboard: {
    totalCompanies: 'Total number of client companies in your CRM system. Click to view and manage all companies.',
    totalLeads: 'Potential clients in your sales pipeline. Track lead progression and conversion rates.',
    totalVehicles: 'Commercial vehicles registered in your system. Includes trucks, trailers, and other commercial equipment.',
    totalDrivers: 'Commercial drivers in your system. Track CDL status, training, and compliance requirements.',
    enterpriseAI: 'AI system status and performance. Access AI agent management, training, and monitoring tools.'
  },

  // CRM
  crm: {
    companies: {
      header: 'Companies are your clients - transportation businesses that need DOT compliance services. Each company can have multiple contacts, vehicles, drivers, and deals.',
      addCompany: 'Create a new company record. You\'ll be able to add contacts, vehicles, drivers, and deals after creating the company.',
      usdotNumber: 'USDOT Number is required for interstate commerce. This is the primary identifier for DOT compliance.',
      legalBusinessName: 'The official legal name of the business as registered with the state.',
      physicalAddress: 'Physical business address where the company operates from.',
      mailingAddress: 'Mailing address for correspondence and official documents.',
      contactInfo: 'Primary contact information for the company.',
      businessType: 'Type of transportation business (e.g., Motor Carrier, Broker, Freight Forwarder).',
      operationClassification: 'Classification of operations (Interstate, Intrastate, or Both).',
      cargoCarried: 'Types of cargo the company transports.',
      hazmat: 'Whether the company transports hazardous materials requiring special permits.'
    },
    leads: {
      header: 'Leads are potential clients who have shown interest in your services. Track their progression through your sales pipeline.',
      addLead: 'Create a new lead record to track potential business opportunities.',
      leadSource: 'How you found or were contacted by this lead (website, referral, cold call, etc.).',
      leadStatus: 'Current stage in the sales process (New, Qualified, Proposal, Negotiation, Closed Won/Lost).',
      leadScore: 'Qualification score based on company size, needs, and budget.',
      followUpDate: 'When to follow up with this lead next.',
      estimatedValue: 'Potential revenue if this lead becomes a customer.'
    },
    deals: {
      header: 'Deals represent sales opportunities with specific companies. Track progress and revenue potential.',
      addDeal: 'Create a new deal to track a sales opportunity.',
      dealValue: 'Total potential revenue from this deal.',
      dealStage: 'Current stage in the sales process (Prospecting, Qualification, Proposal, Negotiation, Closed Won/Lost).',
      probability: 'Likelihood of closing this deal (percentage).',
      expectedCloseDate: 'When you expect this deal to close.',
      dealType: 'Type of service being sold (USDOT Registration, ELD, IFTA, etc.).'
    }
  },

  // Compliance & ELD
  compliance: {
    eld: {
      header: 'Electronic Logging Device (ELD) management for Hours of Service (HOS) compliance.',
      hosLogs: 'Hours of Service logs showing driver duty status (Driving, On Duty, Off Duty, Sleeper Berth).',
      violations: 'HOS violations that need attention or correction.',
      dvirReports: 'Driver Vehicle Inspection Reports for pre-trip and post-trip inspections.',
      complianceScore: 'Overall compliance rating based on HOS violations and inspection results.',
      driverStatus: 'Current duty status of each driver.',
      vehicleStatus: 'Current status of each vehicle (In Service, Out of Service, Maintenance).'
    },
    ifta: {
      header: 'International Fuel Tax Agreement reporting for fuel tax calculations and compliance.',
      fuelPurchases: 'Fuel purchases by state for tax reporting.',
      mileageReports: 'Mileage driven in each state for fuel tax calculations.',
      quarterlyReports: 'Quarterly IFTA reports for fuel tax payments.',
      fuelTaxOwed: 'Amount of fuel tax owed to each state.',
      iftaCredits: 'Fuel tax credits available from other states.'
    }
  },

  // AI & Training
  ai: {
    training: {
      header: 'Train your AI agents to accurately determine DOT compliance requirements for clients.',
      qualifiedStates: 'States with special DOT weight thresholds that supersede federal requirements.',
      gvwrThreshold: 'Gross Vehicle Weight Rating threshold for USDOT registration requirements.',
      passengerThreshold: 'Maximum number of passengers before USDOT registration is required.',
      regulatoryHierarchy: 'Priority order: Qualified States > State Regulations > Federal 49 CFR Rules.',
      trainingScenarios: 'Mock client situations to test your AI agent\'s knowledge.',
      knowledgeBase: 'Upload FMCSA documents to train your AI on current regulations.',
      agentTesting: 'Test your AI agent\'s knowledge of DOT regulations and compliance requirements.'
    },
    agents: {
      header: 'Manage your AI agents and their capabilities.',
      onboardingAgent: 'AI agent that helps new clients through the onboarding process.',
      customerServiceAgent: 'AI agent that handles customer support and questions.',
      complianceAgent: 'AI agent that determines DOT compliance requirements.',
      trainingAgent: 'AI agent that trains other agents on regulatory knowledge.'
    }
  },

  // Analytics
  analytics: {
    header: 'Comprehensive analytics and reporting for your business performance.',
    revenue: 'Total revenue from all services and clients.',
    clientGrowth: 'Growth in number of clients over time.',
    complianceRate: 'Percentage of clients maintaining DOT compliance.',
    serviceUtilization: 'Usage of different services (ELD, IFTA, USDOT, etc.).',
    performanceMetrics: 'Key performance indicators for your business.',
    customReports: 'Create custom reports based on your specific needs.'
  },

  // Settings
  settings: {
    apiKeys: 'Configure API keys for external services and integrations.',
    userManagement: 'Manage user accounts, roles, and permissions.',
    systemSettings: 'Configure system-wide settings and preferences.',
    integrations: 'Set up integrations with external services.',
    backup: 'Backup and restore system data.',
    security: 'Security settings and access controls.'
  }
};

// Helper function to get tooltip content
export const getTooltip = (category: keyof typeof TOOLTIPS, key: string): string => {
  const categoryTooltips = TOOLTIPS[category] as any;
  return categoryTooltips?.[key] || 'No tooltip available';
};

// Helper function to get nested tooltip content
export const getNestedTooltip = (category: keyof typeof TOOLTIPS, subcategory: string, key: string): string => {
  const categoryTooltips = TOOLTIPS[category] as any;
  const subcategoryTooltips = categoryTooltips?.[subcategory] as any;
  return subcategoryTooltips?.[key] || 'No tooltip available';
};
