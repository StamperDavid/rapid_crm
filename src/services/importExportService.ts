// Import/Export Service for Bulk Data Management
// Handles CSV, Excel, JSON, and all file types (documents, media, etc.)

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: ImportError[];
  warnings: string[];
  totalRows: number;
}

export interface ImportError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  includeHeaders: boolean;
  dateFormat: string;
  delimiter?: string; // For CSV
}

export interface ImportOptions {
  skipFirstRow: boolean;
  delimiter: string;
  encoding: string;
  validateData: boolean;
  updateExisting: boolean;
}

export interface FileImportResult {
  success: boolean;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  uploadedAt: string;
  metadata: FileMetadata;
  errors: string[];
}

export interface FileMetadata {
  title?: string;
  description?: string;
  tags: string[];
  category: FileCategory;
  relatedEntityId?: string;
  relatedEntityType?: string;
  complianceType?: ComplianceDocumentType;
  expirationDate?: string;
  isConfidential: boolean;
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted';
}

export type FileCategory = 
  | 'compliance_documents'
  | 'insurance_certificates'
  | 'driver_qualifications'
  | 'vehicle_documents'
  | 'business_licenses'
  | 'financial_documents'
  | 'communication_records'
  | 'training_materials'
  | 'audit_documents'
  | 'other';

export type ComplianceDocumentType =
  | 'usdot_application'
  | 'mc_number_application'
  | 'ifta_registration'
  | 'insurance_certificate'
  | 'driver_license'
  | 'medical_certificate'
  | 'vehicle_registration'
  | 'inspection_report'
  | 'audit_report'
  | 'training_certificate'
  | 'other';

export interface FileStorageInfo {
  id: string;
  originalName: string;
  storedName: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  metadata: FileMetadata;
  checksum: string;
  isEncrypted: boolean;
}

// Supported entity types for import/export
export type EntityType = 
  | 'companies' 
  | 'contacts' 
  | 'vehicles' 
  | 'drivers' 
  | 'deals' 
  | 'invoices' 
  | 'tasks'
  | 'apiKeys';

export interface EntityTemplate {
  type: EntityType;
  fields: TemplateField[];
  requiredFields: string[];
  sampleData: Record<string, any>;
}

export interface TemplateField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone' | 'url';
  required: boolean;
  description: string;
  example: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

class ImportExportService {
  private readonly SUPPORTED_DATA_FORMATS = ['csv', 'excel', 'json'];
  private readonly SUPPORTED_FILE_TYPES = [
    // Documents
    'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt',
    // Spreadsheets
    'xls', 'xlsx', 'csv', 'ods',
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'svg', 'webp',
    // Audio
    'mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma',
    // Video
    'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v',
    // Archives
    'zip', 'rar', '7z', 'tar', 'gz',
    // Other
    'json', 'xml', 'html', 'css', 'js'
  ];
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for general files
  private readonly MAX_DATA_FILE_SIZE = 10 * 1024 * 1024; // 10MB for data files
  private readonly MAX_ROWS = 10000;

  // Entity templates with field definitions
  private readonly ENTITY_TEMPLATES: Record<EntityType, EntityTemplate> = {
    companies: {
      type: 'companies',
      fields: [
        {
          name: 'legalBusinessName',
          type: 'string',
          required: true,
          description: 'Legal business name',
          example: 'Acme Transportation LLC',
          validation: { minLength: 2, maxLength: 255 }
        },
        {
          name: 'physicalStreetAddress',
          type: 'string',
          required: true,
          description: 'Physical street address',
          example: '123 Main St',
          validation: { minLength: 5, maxLength: 255 }
        },
        {
          name: 'physicalCity',
          type: 'string',
          required: true,
          description: 'Physical city',
          example: 'Chicago',
          validation: { minLength: 2, maxLength: 100 }
        },
        {
          name: 'physicalState',
          type: 'string',
          required: true,
          description: 'Physical state',
          example: 'Illinois',
          validation: { minLength: 2, maxLength: 50 }
        },
        {
          name: 'physicalZip',
          type: 'string',
          required: true,
          description: 'Physical ZIP code',
          example: '60601',
          validation: { pattern: '^[0-9]{5}(-[0-9]{4})?$' }
        },
        {
          name: 'businessType',
          type: 'string',
          required: true,
          description: 'Business type',
          example: 'LLC',
          validation: { minLength: 2, maxLength: 50 }
        },
        {
          name: 'ein',
          type: 'string',
          required: false,
          description: 'Employer Identification Number',
          example: '12-3456789',
          validation: { pattern: '^[0-9]{2}-[0-9]{7}$' }
        },
        {
          name: 'usdotNumber',
          type: 'string',
          required: false,
          description: 'USDOT number',
          example: '123456',
          validation: { pattern: '^[0-9]{1,8}$' }
        },
        {
          name: 'businessClassification',
          type: 'string',
          required: true,
          description: 'Business classification',
          example: 'Carrier',
          validation: { minLength: 2, maxLength: 50 }
        }
      ],
      requiredFields: ['legalBusinessName', 'physicalStreetAddress', 'physicalCity', 'physicalState', 'physicalZip', 'businessType', 'businessClassification'],
      sampleData: {
        legalBusinessName: 'Acme Transportation LLC',
        physicalStreetAddress: '123 Main St',
        physicalCity: 'Chicago',
        physicalState: 'Illinois',
        physicalZip: '60601',
        businessType: 'LLC',
        ein: '12-3456789',
        usdotNumber: '123456',
        businessClassification: 'Carrier'
      }
    },
    contacts: {
      type: 'contacts',
      fields: [
        {
          name: 'firstName',
          type: 'string',
          required: true,
          description: 'First name',
          example: 'John',
          validation: { minLength: 1, maxLength: 100 }
        },
        {
          name: 'lastName',
          type: 'string',
          required: true,
          description: 'Last name',
          example: 'Smith',
          validation: { minLength: 1, maxLength: 100 }
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          description: 'Email address',
          example: 'john.smith@company.com',
          validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' }
        },
        {
          name: 'phone',
          type: 'phone',
          required: true,
          description: 'Phone number',
          example: '(555) 123-4567',
          validation: { pattern: '^\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}$' }
        },
        {
          name: 'companyId',
          type: 'string',
          required: true,
          description: 'Company ID (must exist)',
          example: '1',
          validation: { minLength: 1, maxLength: 50 }
        },
        {
          name: 'position',
          type: 'string',
          required: false,
          description: 'Job position',
          example: 'Operations Manager',
          validation: { maxLength: 100 }
        },
        {
          name: 'department',
          type: 'string',
          required: false,
          description: 'Department',
          example: 'Operations',
          validation: { maxLength: 100 }
        },
        {
          name: 'isPrimaryContact',
          type: 'boolean',
          required: false,
          description: 'Is primary contact',
          example: 'true',
          validation: {}
        }
      ],
      requiredFields: ['firstName', 'lastName', 'email', 'phone', 'companyId'],
      sampleData: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@company.com',
        phone: '(555) 123-4567',
        companyId: '1',
        position: 'Operations Manager',
        department: 'Operations',
        isPrimaryContact: 'true'
      }
    },
    vehicles: {
      type: 'vehicles',
      fields: [
        {
          name: 'vin',
          type: 'string',
          required: true,
          description: 'Vehicle Identification Number',
          example: '1HGBH41JXMN109186',
          validation: { minLength: 17, maxLength: 17 }
        },
        {
          name: 'licensePlate',
          type: 'string',
          required: true,
          description: 'License plate number',
          example: 'IL-ABC123',
          validation: { minLength: 2, maxLength: 20 }
        },
        {
          name: 'make',
          type: 'string',
          required: true,
          description: 'Vehicle make',
          example: 'Freightliner',
          validation: { minLength: 2, maxLength: 50 }
        },
        {
          name: 'model',
          type: 'string',
          required: true,
          description: 'Vehicle model',
          example: 'Cascadia',
          validation: { minLength: 1, maxLength: 50 }
        },
        {
          name: 'year',
          type: 'number',
          required: true,
          description: 'Vehicle year',
          example: '2020',
          validation: { min: 1900, max: 2030 }
        },
        {
          name: 'companyId',
          type: 'string',
          required: true,
          description: 'Company ID (must exist)',
          example: '1',
          validation: { minLength: 1, maxLength: 50 }
        },
        {
          name: 'vehicleType',
          type: 'string',
          required: true,
          description: 'Vehicle type',
          example: 'Truck',
          validation: { minLength: 2, maxLength: 50 }
        },
        {
          name: 'gvwr',
          type: 'string',
          required: false,
          description: 'Gross Vehicle Weight Rating',
          example: '80,000 lbs',
          validation: { maxLength: 50 }
        }
      ],
      requiredFields: ['vin', 'licensePlate', 'make', 'model', 'year', 'companyId', 'vehicleType'],
      sampleData: {
        vin: '1HGBH41JXMN109186',
        licensePlate: 'IL-ABC123',
        make: 'Freightliner',
        model: 'Cascadia',
        year: '2020',
        companyId: '1',
        vehicleType: 'Truck',
        gvwr: '80,000 lbs'
      }
    },
    drivers: {
      type: 'drivers',
      fields: [
        {
          name: 'firstName',
          type: 'string',
          required: true,
          description: 'First name',
          example: 'Mike',
          validation: { minLength: 1, maxLength: 100 }
        },
        {
          name: 'lastName',
          type: 'string',
          required: true,
          description: 'Last name',
          example: 'Johnson',
          validation: { minLength: 1, maxLength: 100 }
        },
        {
          name: 'licenseNumber',
          type: 'string',
          required: true,
          description: 'Driver license number',
          example: 'D123456789',
          validation: { minLength: 5, maxLength: 20 }
        },
        {
          name: 'licenseState',
          type: 'string',
          required: true,
          description: 'License state',
          example: 'Illinois',
          validation: { minLength: 2, maxLength: 50 }
        },
        {
          name: 'licenseClass',
          type: 'string',
          required: true,
          description: 'License class',
          example: 'A',
          validation: { minLength: 1, maxLength: 10 }
        },
        {
          name: 'companyId',
          type: 'string',
          required: true,
          description: 'Company ID (must exist)',
          example: '1',
          validation: { minLength: 1, maxLength: 50 }
        },
        {
          name: 'phone',
          type: 'phone',
          required: false,
          description: 'Phone number',
          example: '(555) 234-5678',
          validation: { pattern: '^\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}$' }
        },
        {
          name: 'email',
          type: 'email',
          required: false,
          description: 'Email address',
          example: 'mike.johnson@company.com',
          validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' }
        }
      ],
      requiredFields: ['firstName', 'lastName', 'licenseNumber', 'licenseState', 'licenseClass', 'companyId'],
      sampleData: {
        firstName: 'Mike',
        lastName: 'Johnson',
        licenseNumber: 'D123456789',
        licenseState: 'Illinois',
        licenseClass: 'A',
        companyId: '1',
        phone: '(555) 234-5678',
        email: 'mike.johnson@company.com'
      }
    },
    deals: {
      type: 'deals',
      fields: [
        {
          name: 'title',
          type: 'string',
          required: true,
          description: 'Deal title',
          example: 'Acme Transportation Contract',
          validation: { minLength: 2, maxLength: 255 }
        },
        {
          name: 'value',
          type: 'number',
          required: true,
          description: 'Deal value',
          example: '150000',
          validation: { min: 0 }
        },
        {
          name: 'stage',
          type: 'string',
          required: true,
          description: 'Deal stage',
          example: 'Proposal',
          validation: { minLength: 2, maxLength: 50 }
        },
        {
          name: 'companyId',
          type: 'string',
          required: true,
          description: 'Company ID (must exist)',
          example: '1',
          validation: { minLength: 1, maxLength: 50 }
        },
        {
          name: 'description',
          type: 'string',
          required: false,
          description: 'Deal description',
          example: 'Website development and CRM implementation',
          validation: { maxLength: 1000 }
        },
        {
          name: 'expectedCloseDate',
          type: 'date',
          required: false,
          description: 'Expected close date',
          example: '2024-12-31',
          validation: {}
        }
      ],
      requiredFields: ['title', 'value', 'stage', 'companyId'],
      sampleData: {
        title: 'Acme Transportation Contract',
        value: '150000',
        stage: 'Proposal',
        companyId: '1',
        description: 'Website development and CRM implementation',
        expectedCloseDate: '2024-12-31'
      }
    },
    invoices: {
      type: 'invoices',
      fields: [
        {
          name: 'number',
          type: 'string',
          required: true,
          description: 'Invoice number',
          example: 'INV-2024-001',
          validation: { minLength: 2, maxLength: 100 }
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
          description: 'Invoice amount',
          example: '2500.00',
          validation: { min: 0 }
        },
        {
          name: 'status',
          type: 'string',
          required: true,
          description: 'Invoice status',
          example: 'Sent',
          validation: { minLength: 2, maxLength: 50 }
        },
        {
          name: 'companyId',
          type: 'string',
          required: true,
          description: 'Company ID (must exist)',
          example: '1',
          validation: { minLength: 1, maxLength: 50 }
        },
        {
          name: 'dueDate',
          type: 'date',
          required: false,
          description: 'Due date',
          example: '2024-02-15',
          validation: {}
        },
        {
          name: 'description',
          type: 'string',
          required: false,
          description: 'Invoice description',
          example: 'USDOT Application Services',
          validation: { maxLength: 500 }
        }
      ],
      requiredFields: ['number', 'amount', 'status', 'companyId'],
      sampleData: {
        number: 'INV-2024-001',
        amount: '2500.00',
        status: 'Sent',
        companyId: '1',
        dueDate: '2024-02-15',
        description: 'USDOT Application Services'
      }
    },
    tasks: {
      type: 'tasks',
      fields: [
        {
          name: 'title',
          type: 'string',
          required: true,
          description: 'Task title',
          example: 'Follow up with John Smith',
          validation: { minLength: 2, maxLength: 255 }
        },
        {
          name: 'description',
          type: 'string',
          required: false,
          description: 'Task description',
          example: 'Call to discuss USDOT application status',
          validation: { maxLength: 1000 }
        },
        {
          name: 'priority',
          type: 'string',
          required: true,
          description: 'Task priority',
          example: 'High',
          validation: { minLength: 2, maxLength: 20 }
        },
        {
          name: 'dueDate',
          type: 'date',
          required: false,
          description: 'Due date',
          example: '2024-01-25',
          validation: {}
        },
        {
          name: 'status',
          type: 'string',
          required: true,
          description: 'Task status',
          example: 'Pending',
          validation: { minLength: 2, maxLength: 50 }
        },
        {
          name: 'assignedTo',
          type: 'string',
          required: false,
          description: 'Assigned to user ID',
          example: '1',
          validation: { minLength: 1, maxLength: 50 }
        }
      ],
      requiredFields: ['title', 'priority', 'status'],
      sampleData: {
        title: 'Follow up with John Smith',
        description: 'Call to discuss USDOT application status',
        priority: 'High',
        dueDate: '2024-01-25',
        status: 'Pending',
        assignedTo: '1'
      }
    },
    apiKeys: {
      type: 'apiKeys',
      fields: [
        {
          name: 'name',
          type: 'string',
          required: true,
          description: 'API key name',
          example: 'OpenAI Production Key',
          validation: { minLength: 2, maxLength: 255 }
        },
        {
          name: 'platform',
          type: 'string',
          required: true,
          description: 'Platform type',
          example: 'openai',
          validation: { minLength: 2, maxLength: 50 }
        },
        {
          name: 'key',
          type: 'string',
          required: true,
          description: 'API key value',
          example: 'sk-...',
          validation: { minLength: 10, maxLength: 500 }
        },
        {
          name: 'description',
          type: 'string',
          required: false,
          description: 'API key description',
          example: 'Production OpenAI API key for customer service',
          validation: { maxLength: 500 }
        },
        {
          name: 'environment',
          type: 'string',
          required: true,
          description: 'Environment',
          example: 'production',
          validation: { minLength: 2, maxLength: 20 }
        },
        {
          name: 'isActive',
          type: 'boolean',
          required: true,
          description: 'Is active',
          example: 'true',
          validation: {}
        }
      ],
      requiredFields: ['name', 'platform', 'key', 'environment', 'isActive'],
      sampleData: {
        name: 'OpenAI Production Key',
        platform: 'openai',
        key: 'sk-...',
        description: 'Production OpenAI API key for customer service',
        environment: 'production',
        isActive: 'true'
      }
    }
  };

  // Get template for a specific entity type
  getTemplate(entityType: EntityType): EntityTemplate {
    return this.ENTITY_TEMPLATES[entityType];
  }

  // Get all available entity types
  getAvailableEntityTypes(): EntityType[] {
    return Object.keys(this.ENTITY_TEMPLATES) as EntityType[];
  }

  // Generate CSV template for download
  generateCSVTemplate(entityType: EntityType): string {
    const template = this.getTemplate(entityType);
    const headers = template.fields.map(field => field.name);
    const sampleRow = template.fields.map(field => field.example);
    
    return [headers.join(','), sampleRow.join(',')].join('\n');
  }

  // Validate data file before processing
  validateDataFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_DATA_FILE_SIZE) {
      return { valid: false, error: `File size exceeds ${this.MAX_DATA_FILE_SIZE / 1024 / 1024}MB limit` };
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.SUPPORTED_DATA_FORMATS.includes(extension)) {
      return { valid: false, error: 'Unsupported data file format. Please use CSV, Excel, or JSON files.' };
    }

    return { valid: true };
  }

  // Validate general file before processing
  validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: `File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit` };
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.SUPPORTED_FILE_TYPES.includes(extension)) {
      return { valid: false, error: `Unsupported file format: ${extension}. Supported formats: ${this.SUPPORTED_FILE_TYPES.join(', ')}` };
    }

    return { valid: true };
  }

  // Get file category based on file type and name
  getFileCategory(file: File): FileCategory {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const fileName = file.name.toLowerCase();

    // Check for specific compliance document patterns
    if (fileName.includes('usdot') || fileName.includes('dot')) {
      return 'compliance_documents';
    }
    if (fileName.includes('insurance') || fileName.includes('policy')) {
      return 'insurance_certificates';
    }
    if (fileName.includes('driver') || fileName.includes('license') || fileName.includes('medical')) {
      return 'driver_qualifications';
    }
    if (fileName.includes('vehicle') || fileName.includes('registration') || fileName.includes('inspection')) {
      return 'vehicle_documents';
    }
    if (fileName.includes('business') || fileName.includes('license') || fileName.includes('permit')) {
      return 'business_licenses';
    }
    if (fileName.includes('financial') || fileName.includes('tax') || fileName.includes('invoice')) {
      return 'financial_documents';
    }
    if (fileName.includes('training') || fileName.includes('certificate') || fileName.includes('course')) {
      return 'training_materials';
    }
    if (fileName.includes('audit') || fileName.includes('inspection') || fileName.includes('report')) {
      return 'audit_documents';
    }

    // Default based on file type
    if (['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma'].includes(extension)) {
      return 'communication_records';
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(extension)) {
      return 'communication_records';
    }
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
      return 'compliance_documents';
    }

    return 'other';
  }

  // Get compliance document type based on file name and content
  getComplianceDocumentType(file: File): ComplianceDocumentType {
    const fileName = file.name.toLowerCase();

    if (fileName.includes('usdot') || fileName.includes('dot application')) {
      return 'usdot_application';
    }
    if (fileName.includes('mc') || fileName.includes('motor carrier')) {
      return 'mc_number_application';
    }
    if (fileName.includes('ifta')) {
      return 'ifta_registration';
    }
    if (fileName.includes('insurance')) {
      return 'insurance_certificate';
    }
    if (fileName.includes('driver license') || fileName.includes('cdl')) {
      return 'driver_license';
    }
    if (fileName.includes('medical') || fileName.includes('dot physical')) {
      return 'medical_certificate';
    }
    if (fileName.includes('vehicle registration') || fileName.includes('title')) {
      return 'vehicle_registration';
    }
    if (fileName.includes('inspection')) {
      return 'inspection_report';
    }
    if (fileName.includes('audit')) {
      return 'audit_report';
    }
    if (fileName.includes('training') || fileName.includes('certificate')) {
      return 'training_certificate';
    }

    return 'other';
  }

  // Generate file checksum for integrity verification
  async generateChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Extract metadata from file
  async extractFileMetadata(file: File): Promise<Partial<FileMetadata>> {
    const category = this.getFileCategory(file);
    const complianceType = this.getComplianceDocumentType(file);
    const checksum = await this.generateChecksum(file);

    // Extract basic metadata
    const metadata: Partial<FileMetadata> = {
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      category,
      complianceType,
      tags: this.extractTagsFromFileName(file.name),
      isConfidential: this.isConfidentialFile(file.name, category),
      accessLevel: this.getAccessLevel(category, complianceType)
    };

    // Extract additional metadata based on file type
    if (file.type.startsWith('image/')) {
      metadata.description = 'Image file';
    } else if (file.type.startsWith('video/')) {
      metadata.description = 'Video file';
    } else if (file.type.startsWith('audio/')) {
      metadata.description = 'Audio file';
    } else if (file.type === 'application/pdf') {
      metadata.description = 'PDF document';
    }

    return metadata;
  }

  // Extract tags from filename
  private extractTagsFromFileName(fileName: string): string[] {
    const tags: string[] = [];
    const name = fileName.toLowerCase();

    // Common compliance-related tags
    if (name.includes('renewal')) tags.push('renewal');
    if (name.includes('expired')) tags.push('expired');
    if (name.includes('urgent')) tags.push('urgent');
    if (name.includes('draft')) tags.push('draft');
    if (name.includes('final')) tags.push('final');
    if (name.includes('backup')) tags.push('backup');
    if (name.includes('archive')) tags.push('archive');

    // Year tags
    const yearMatch = name.match(/\b(20\d{2})\b/);
    if (yearMatch) tags.push(`year-${yearMatch[1]}`);

    // Month tags
    const monthMatch = name.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/);
    if (monthMatch) tags.push(`month-${monthMatch[1]}`);

    return tags;
  }

  // Determine if file is confidential
  private isConfidentialFile(fileName: string, category: FileCategory): boolean {
    const name = fileName.toLowerCase();
    
    // Confidential categories
    const confidentialCategories = ['financial_documents', 'insurance_certificates'];
    if (confidentialCategories.includes(category)) {
      return true;
    }

    // Confidential keywords
    const confidentialKeywords = ['ssn', 'social security', 'tax', 'financial', 'bank', 'account', 'salary', 'wage'];
    return confidentialKeywords.some(keyword => name.includes(keyword));
  }

  // Get access level based on category and compliance type
  private getAccessLevel(category: FileCategory, complianceType?: ComplianceDocumentType): FileMetadata['accessLevel'] {
    // Restricted access
    if (category === 'financial_documents') {
      return 'restricted';
    }

    // Confidential access
    if (['insurance_certificates', 'driver_qualifications'].includes(category)) {
      return 'confidential';
    }

    // Internal access
    if (['compliance_documents', 'business_licenses', 'audit_documents'].includes(category)) {
      return 'internal';
    }

    // Public access
    return 'public';
  }

  // Parse CSV content
  private parseCSV(content: string, delimiter: string = ','): string[][] {
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    });
  }

  // Parse Excel content (simplified - would need a proper Excel parser in production)
  private parseExcel(content: ArrayBuffer): string[][] {
    // This is a simplified implementation
    // In production, you'd use a library like 'xlsx' or 'exceljs'
    throw new Error('Excel parsing not implemented. Please use CSV format.');
  }

  // Parse JSON content
  private parseJSON(content: string): any[] {
    try {
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  // Validate field value against template
  private validateField(field: TemplateField, value: string, row: number): ImportError[] {
    const errors: ImportError[] = [];

    // Check required fields
    if (field.required && (!value || value.trim() === '')) {
      errors.push({
        row,
        field: field.name,
        value,
        message: `${field.name} is required`
      });
      return errors;
    }

    // Skip validation for empty optional fields
    if (!value || value.trim() === '') {
      return errors;
    }

    // Type validation
    switch (field.type) {
      case 'number':
        if (isNaN(Number(value))) {
          errors.push({
            row,
            field: field.name,
            value,
            message: `${field.name} must be a valid number`
          });
        } else {
          const num = Number(value);
          if (field.validation?.min !== undefined && num < field.validation.min) {
            errors.push({
              row,
              field: field.name,
              value,
              message: `${field.name} must be at least ${field.validation.min}`
            });
          }
          if (field.validation?.max !== undefined && num > field.validation.max) {
            errors.push({
              row,
              field: field.name,
              value,
              message: `${field.name} must be at most ${field.validation.max}`
            });
          }
        }
        break;

      case 'email':
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(value)) {
          errors.push({
            row,
            field: field.name,
            value,
            message: `${field.name} must be a valid email address`
          });
        }
        break;

      case 'phone':
        if (!/^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/.test(value)) {
          errors.push({
            row,
            field: field.name,
            value,
            message: `${field.name} must be in format (555) 123-4567`
          });
        }
        break;

      case 'date':
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          errors.push({
            row,
            field: field.name,
            value,
            message: `${field.name} must be in format YYYY-MM-DD`
          });
        }
        break;

      case 'boolean':
        if (!['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase())) {
          errors.push({
            row,
            field: field.name,
            value,
            message: `${field.name} must be true/false, 1/0, or yes/no`
          });
        }
        break;
    }

    // String validation
    if (field.type === 'string' || field.type === 'email' || field.type === 'phone' || field.type === 'url') {
      if (field.validation?.minLength && value.length < field.validation.minLength) {
        errors.push({
          row,
          field: field.name,
          value,
          message: `${field.name} must be at least ${field.validation.minLength} characters`
        });
      }
      if (field.validation?.maxLength && value.length > field.validation.maxLength) {
        errors.push({
          row,
          field: field.name,
          value,
          message: `${field.name} must be at most ${field.validation.maxLength} characters`
        });
      }
      if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
        errors.push({
          row,
          field: field.name,
          value,
          message: `${field.name} format is invalid`
        });
      }
    }

    return errors;
  }

  // Convert row data to entity object
  private convertRowToEntity(entityType: EntityType, headers: string[], row: string[]): Record<string, any> {
    const template = this.getTemplate(entityType);
    const entity: Record<string, any> = {};

    headers.forEach((header, index) => {
      const value = row[index] || '';
      const field = template.fields.find(f => f.name === header);
      
      if (field) {
        let convertedValue: any = value;

        // Type conversion
        switch (field.type) {
          case 'number':
            convertedValue = value ? Number(value) : null;
            break;
          case 'boolean':
            convertedValue = ['true', '1', 'yes'].includes(value.toLowerCase());
            break;
          case 'date':
            convertedValue = value || null;
            break;
          default:
            convertedValue = value || null;
        }

        entity[header] = convertedValue;
      }
    });

    return entity;
  }

  // Import any file (documents, media, etc.)
  async importFile(
    file: File,
    metadata: Partial<FileMetadata> = {},
    relatedEntityId?: string,
    relatedEntityType?: string
  ): Promise<FileImportResult> {
    const result: FileImportResult = {
      success: false,
      fileId: '',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      metadata: {
        title: '',
        description: '',
        tags: [],
        category: 'other',
        isConfidential: false,
        accessLevel: 'public'
      },
      errors: []
    };

    try {
      // Validate file
      const fileValidation = this.validateFile(file);
      if (!fileValidation.valid) {
        result.errors.push(fileValidation.error!);
        return result;
      }

      // Extract metadata
      const extractedMetadata = await this.extractFileMetadata(file);
      
      // Merge provided metadata with extracted metadata
      result.metadata = {
        ...extractedMetadata,
        ...metadata,
        relatedEntityId,
        relatedEntityType
      } as FileMetadata;

      // Generate unique file ID
      result.fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate checksum for integrity
      const checksum = await this.generateChecksum(file);

      // Store file (in a real implementation, this would upload to cloud storage)
      const fileStorageInfo: FileStorageInfo = {
        id: result.fileId,
        originalName: file.name,
        storedName: `${result.fileId}_${file.name}`,
        path: `/uploads/${result.metadata.category}/${result.fileId}`,
        size: file.size,
        mimeType: file.type,
        uploadedAt: result.uploadedAt,
        uploadedBy: 'current_user', // This would come from auth context
        metadata: result.metadata,
        checksum,
        isEncrypted: result.metadata.isConfidential
      };

      // TODO: Integrate with actual file storage service
      console.log('File uploaded:', fileStorageInfo);

      result.success = true;

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error occurred');
    }

    return result;
  }

  // Import data from file (CSV, Excel, JSON)
  async importData(
    file: File, 
    entityType: EntityType, 
    options: ImportOptions = {
      skipFirstRow: true,
      delimiter: ',',
      encoding: 'utf-8',
      validateData: true,
      updateExisting: false
    }
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      errors: [],
      warnings: [],
      totalRows: 0
    };

    try {
      // Validate data file
      const fileValidation = this.validateDataFile(file);
      if (!fileValidation.valid) {
        result.errors.push({
          row: 0,
          field: 'file',
          value: file.name,
          message: fileValidation.error!
        });
        return result;
      }

      // Read file content
      const content = await this.readFileContent(file, options.encoding);
      
      // Parse content based on file type
      const extension = file.name.split('.').pop()?.toLowerCase();
      let rows: string[][];

      switch (extension) {
        case 'csv':
          rows = this.parseCSV(content, options.delimiter);
          break;
        case 'json':
          const jsonData = this.parseJSON(content);
          rows = jsonData.map(item => Object.values(item).map(v => String(v)));
          break;
        default:
          throw new Error(`Unsupported file format: ${extension}`);
      }

      if (rows.length === 0) {
        result.errors.push({
          row: 0,
          field: 'file',
          value: file.name,
          message: 'File is empty'
        });
        return result;
      }

      result.totalRows = rows.length;

      // Get headers
      const headers = options.skipFirstRow ? rows[0] : this.getTemplate(entityType).fields.map(f => f.name);
      const dataRows = options.skipFirstRow ? rows.slice(1) : rows;

      if (dataRows.length > this.MAX_ROWS) {
        result.warnings.push(`File contains ${dataRows.length} rows, but only the first ${this.MAX_ROWS} will be processed`);
        dataRows.splice(this.MAX_ROWS);
      }

      // Validate and process each row
      const template = this.getTemplate(entityType);
      const validEntities: any[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowNumber = i + (options.skipFirstRow ? 2 : 1); // Account for header row

        // Validate row length
        if (row.length !== headers.length) {
          result.errors.push({
            row: rowNumber,
            field: 'row',
            value: row.join(', '),
            message: `Row has ${row.length} columns, expected ${headers.length}`
          });
          continue;
        }

        // Validate each field
        let rowErrors: ImportError[] = [];
        if (options.validateData) {
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            const value = row[j] || '';
            const field = template.fields.find(f => f.name === header);
            
            if (field) {
              const fieldErrors = this.validateField(field, value, rowNumber);
              rowErrors.push(...fieldErrors);
            }
          }
        }

        if (rowErrors.length > 0) {
          result.errors.push(...rowErrors);
          continue;
        }

        // Convert row to entity
        const entity = this.convertRowToEntity(entityType, headers, row);
        validEntities.push(entity);
      }

      // Import valid entities
      if (validEntities.length > 0) {
        // This would integrate with your database service
        // For now, we'll simulate the import
        result.imported = validEntities.length;
        result.success = true;
        
        // TODO: Integrate with databaseService to actually import the data
        console.log(`Importing ${validEntities.length} ${entityType} records:`, validEntities);
      }

    } catch (error) {
      result.errors.push({
        row: 0,
        field: 'file',
        value: file.name,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }

    return result;
  }

  // Export data to file
  async exportData(
    entityType: EntityType,
    data: any[],
    options: ExportOptions = {
      format: 'csv',
      includeHeaders: true,
      dateFormat: 'YYYY-MM-DD'
    }
  ): Promise<Blob> {
    const template = this.getTemplate(entityType);
    const fields = template.fields;

    switch (options.format) {
      case 'csv':
        return this.exportToCSV(data, fields, options);
      case 'excel':
        return this.exportToExcel(data, fields, options);
      case 'json':
        return this.exportToJSON(data, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  // Export to CSV
  private exportToCSV(data: any[], fields: TemplateField[], options: ExportOptions): Blob {
    const delimiter = options.delimiter || ',';
    const lines: string[] = [];

    // Add headers
    if (options.includeHeaders) {
      lines.push(fields.map(field => field.name).join(delimiter));
    }

    // Add data rows
    data.forEach(item => {
      const row = fields.map(field => {
        let value = item[field.name] || '';
        
        // Format value based on type
        if (field.type === 'date' && value) {
          value = this.formatDate(value, options.dateFormat);
        } else if (field.type === 'boolean') {
          value = value ? 'true' : 'false';
        } else if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`; // Escape commas in CSV
        }
        
        return String(value);
      });
      lines.push(row.join(delimiter));
    });

    return new Blob([lines.join('\n')], { type: 'text/csv' });
  }

  // Export to Excel (simplified - would need proper Excel library in production)
  private exportToExcel(data: any[], fields: TemplateField[], options: ExportOptions): Blob {
    // This is a simplified implementation
    // In production, you'd use a library like 'xlsx' or 'exceljs'
    throw new Error('Excel export not implemented. Please use CSV format.');
  }

  // Export to JSON
  private exportToJSON(data: any[], options: ExportOptions): Blob {
    const jsonString = JSON.stringify(data, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  // Format date
  private formatDate(date: string | Date, format: string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);

    switch (format) {
      case 'YYYY-MM-DD':
        return d.toISOString().split('T')[0];
      case 'MM/DD/YYYY':
        return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
      case 'DD/MM/YYYY':
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      default:
        return d.toISOString().split('T')[0];
    }
  }

  // Read file content
  private readFileContent(file: File, encoding: string = 'utf-8'): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, encoding);
    });
  }

  // Download file
  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Get file preview URL (for images, videos, PDFs)
  getFilePreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // Get file icon based on file type
  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📁';
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Check if file type is supported for preview
  isPreviewable(fileType: string): boolean {
    const previewableTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf',
      'text/plain', 'text/csv', 'text/html'
    ];
    return previewableTypes.includes(fileType);
  }

  // Get file category display name
  getCategoryDisplayName(category: FileCategory): string {
    const displayNames: Record<FileCategory, string> = {
      'compliance_documents': 'Compliance Documents',
      'insurance_certificates': 'Insurance Certificates',
      'driver_qualifications': 'Driver Qualifications',
      'vehicle_documents': 'Vehicle Documents',
      'business_licenses': 'Business Licenses',
      'financial_documents': 'Financial Documents',
      'communication_records': 'Communication Records',
      'training_materials': 'Training Materials',
      'audit_documents': 'Audit Documents',
      'other': 'Other'
    };
    return displayNames[category];
  }

  // Get compliance document type display name
  getComplianceTypeDisplayName(type: ComplianceDocumentType): string {
    const displayNames: Record<ComplianceDocumentType, string> = {
      'usdot_application': 'USDOT Application',
      'mc_number_application': 'MC Number Application',
      'ifta_registration': 'IFTA Registration',
      'insurance_certificate': 'Insurance Certificate',
      'driver_license': 'Driver License',
      'medical_certificate': 'Medical Certificate',
      'vehicle_registration': 'Vehicle Registration',
      'inspection_report': 'Inspection Report',
      'audit_report': 'Audit Report',
      'training_certificate': 'Training Certificate',
      'other': 'Other'
    };
    return displayNames[type];
  }

  // Bulk import multiple files
  async bulkImportFiles(
    files: File[],
    defaultMetadata: Partial<FileMetadata> = {},
    relatedEntityId?: string,
    relatedEntityType?: string
  ): Promise<FileImportResult[]> {
    const results: FileImportResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.importFile(file, defaultMetadata, relatedEntityId, relatedEntityType);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          fileId: '',
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
          metadata: {
            title: '',
            description: '',
            tags: [],
            category: 'other',
            isConfidential: false,
            accessLevel: 'public'
          },
          errors: [error instanceof Error ? error.message : 'Unknown error occurred']
        });
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const importExportService = new ImportExportService();
