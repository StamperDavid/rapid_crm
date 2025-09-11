// Browser-compatible schema service
// This is a simplified version that stores schemas in localStorage
// In production, this would connect to a backend API

export interface FieldDefinition {
  id: string;
  name: string;
  display_name: string;
  field_type: 'text' | 'number' | 'date' | 'datetime' | 'time' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'email' | 'phone' | 'url' | 'currency' | 'percentage' | 'rating' | 'attachment' | 'lookup' | 'rollup' | 'formula' | 'autonumber' | 'barcode' | 'button' | 'created_time' | 'last_modified_time' | 'created_by' | 'last_modified_by';
  is_required: boolean;
  is_unique: boolean;
  options?: string[];
  default_value?: string;
  validation_rules?: {
    min_length?: number;
    max_length?: number;
    min_value?: number;
    max_value?: number;
    pattern?: string;
    custom_validation?: string;
  };
  lookup_config?: {
    linked_table?: string;
    linked_field?: string;
    display_field?: string;
  };
  rollup_config?: {
    linked_table?: string;
    linked_field?: string;
    aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max';
  };
  formula_config?: {
    formula?: string;
    result_type?: string;
  };
  currency_config?: {
    currency_code?: string;
    symbol?: string;
  };
  rating_config?: {
    max_rating?: number;
    icon?: string;
  };
  attachment_config?: {
    allowed_types?: string[];
    max_size?: number;
  };
  order: number;
  description?: string;
  help_text?: string;
}

export interface SchemaDefinition {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  table_name: string;
  fields: FieldDefinition[];
  created_at: string;
  updated_at: string;
  is_system: boolean;
}

class SchemaService {
  private storageKey = 'rapid_crm_schemas';

  constructor() {
    // Initialize with default schemas if none exist
    this.initializeDefaultSchemas();
  }

  private initializeDefaultSchemas() {
    const existing = this.getStoredSchemas();
    if (existing.length === 0) {
      // Add some default schemas
      const defaultSchemas: SchemaDefinition[] = [
        {
          id: '1',
          name: 'companies',
          display_name: 'Companies',
          description: 'Company and organization information',
          table_name: 'companies',
          fields: [
            { id: '1', name: 'name', display_name: 'Company Name', field_type: 'text', is_required: true, is_unique: false, order: 1 },
            { id: '2', name: 'industry', display_name: 'Industry', field_type: 'text', is_required: false, is_unique: false, order: 2 },
            { id: '3', name: 'email', display_name: 'Email', field_type: 'email', is_required: false, is_unique: false, order: 3 },
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_system: true
        }
      ];
      this.saveSchemas(defaultSchemas);
    }
  }

  private getStoredSchemas(): SchemaDefinition[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load schemas from localStorage:', error);
      return [];
    }
  }

  private saveSchemas(schemas: SchemaDefinition[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(schemas));
    } catch (error) {
      console.error('Failed to save schemas to localStorage:', error);
    }
  }

  // Get all schema definitions
  async getSchemas(): Promise<SchemaDefinition[]> {
    return this.getStoredSchemas();
  }

  // Get a specific schema by name
  async getSchema(name: string): Promise<SchemaDefinition | null> {
    const schemas = this.getStoredSchemas();
    return schemas.find(s => s.name === name) || null;
  }

  // Create a new schema
  async createSchema(schema: Omit<SchemaDefinition, 'id' | 'created_at' | 'updated_at'>): Promise<SchemaDefinition> {
    const schemas = this.getStoredSchemas();
    const now = new Date().toISOString();
    
    const newSchema: SchemaDefinition = {
      id: Date.now().toString(),
      ...schema,
      created_at: now,
      updated_at: now
    };

    schemas.push(newSchema);
    this.saveSchemas(schemas);
    
    return newSchema;
  }

  // Update an existing schema
  async updateSchema(name: string, schema: Partial<SchemaDefinition>): Promise<SchemaDefinition> {
    const schemas = this.getStoredSchemas();
    const index = schemas.findIndex(s => s.name === name);
    
    if (index === -1) {
      throw new Error('Schema not found');
    }

    const updated = { ...schemas[index], ...schema, updated_at: new Date().toISOString() };
    schemas[index] = updated;
    this.saveSchemas(schemas);
    
    return updated;
  }

  // Delete a schema
  async deleteSchema(name: string): Promise<boolean> {
    const schemas = this.getStoredSchemas();
    const filtered = schemas.filter(s => s.name !== name);
    
    if (filtered.length === schemas.length) {
      return false; // Schema not found
    }
    
    this.saveSchemas(filtered);
    return true;
  }

  // Get all tables (simplified - just return schema names)
  async getTables(): Promise<string[]> {
    const schemas = this.getStoredSchemas();
    return schemas.map(s => s.table_name);
  }

  // Get table structure (simplified)
  async getTableStructure(tableName: string): Promise<any[]> {
    const schema = this.getStoredSchemas().find(s => s.table_name === tableName);
    if (!schema) return [];
    
    return schema.fields.map(field => ({
      cid: field.order,
      name: field.name,
      type: field.field_type,
      notnull: field.is_required ? 1 : 0,
      dflt_value: field.default_value || null,
      pk: field.name === 'id' ? 1 : 0
    }));
  }

  // Insert data (simplified - just store in localStorage)
  async insertRecord(tableName: string, data: Record<string, any>): Promise<number> {
    const recordKey = `rapid_crm_records_${tableName}`;
    const now = new Date().toISOString();
    const recordData = { ...data, id: Date.now(), created_at: now, updated_at: now };

    try {
      const existing = JSON.parse(localStorage.getItem(recordKey) || '[]');
      existing.push(recordData);
      localStorage.setItem(recordKey, JSON.stringify(existing));
      return recordData.id;
    } catch (error) {
      console.error('Failed to insert record:', error);
      throw error;
    }
  }

  // Get records (simplified)
  async getRecords(tableName: string, limit = 100, offset = 0): Promise<any[]> {
    const recordKey = `rapid_crm_records_${tableName}`;
    try {
      const records = JSON.parse(localStorage.getItem(recordKey) || '[]');
      return records.slice(offset, offset + limit);
    } catch (error) {
      console.error('Failed to get records:', error);
      return [];
    }
  }

  // Update a record (simplified)
  async updateRecord(tableName: string, id: number, data: Record<string, any>): Promise<boolean> {
    const recordKey = `rapid_crm_records_${tableName}`;
    try {
      const records = JSON.parse(localStorage.getItem(recordKey) || '[]');
      const index = records.findIndex((r: any) => r.id === id);
      
      if (index === -1) return false;
      
      records[index] = { ...records[index], ...data, updated_at: new Date().toISOString() };
      localStorage.setItem(recordKey, JSON.stringify(records));
      return true;
    } catch (error) {
      console.error('Failed to update record:', error);
      return false;
    }
  }

  // Delete a record (simplified)
  async deleteRecord(tableName: string, id: number): Promise<boolean> {
    const recordKey = `rapid_crm_records_${tableName}`;
    try {
      const records = JSON.parse(localStorage.getItem(recordKey) || '[]');
      const filtered = records.filter((r: any) => r.id !== id);
      
      if (filtered.length === records.length) return false;
      
      localStorage.setItem(recordKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete record:', error);
      return false;
    }
  }
}

// Export singleton instance
export const schemaService = new SchemaService();