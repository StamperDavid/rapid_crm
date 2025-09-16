/**
 * KNOWLEDGE MANAGEMENT SERVICE
 * Dynamic knowledge base and persona management for Rapid CRM AI
 * Allows real-time updates to AI knowledge, rules, and persona
 */

export interface KnowledgeEntry {
  id: string;
  category: 'compliance_rule' | 'business_rule' | 'persona_trait' | 'expertise' | 'custom_rule' | 'excel_data';
  title: string;
  content: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effectiveDate: string;
  expirationDate?: string;
  source: 'excel_file' | 'manual_entry' | 'system_update' | 'boss_directive';
  tags: string[];
  metadata: {
    filePath?: string;
    lastModified?: string;
    version?: string;
    supersedes?: string[];
    relatedEntries?: string[];
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface PersonaUpdate {
  id: string;
  field: 'role' | 'responsibilities' | 'expertise' | 'communication_style' | 'business_model' | 'custom_trait';
  oldValue: any;
  newValue: any;
  reason: string;
  effectiveDate: string;
  approvedBy: 'boss' | 'system' | 'auto';
}

export interface ExcelFileMapping {
  id: string;
  fileName: string;
  filePath: string;
  sheetName?: string;
  columnMappings: {
    [key: string]: string; // Excel column -> Knowledge field
  };
  updateFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'manual';
  lastProcessed: string;
  isActive: boolean;
}

export interface KnowledgeUpdate {
  id: string;
  type: 'add' | 'update' | 'delete' | 'supersede';
  entryId: string;
  changes: any;
  reason: string;
  timestamp: string;
  approvedBy: string;
}

export class KnowledgeManagementService {
  private knowledgeBase: Map<string, KnowledgeEntry> = new Map();
  private personaHistory: PersonaUpdate[] = [];
  private excelMappings: Map<string, ExcelFileMapping> = new Map();
  private updateHistory: KnowledgeUpdate[] = [];
  private listeners: ((update: KnowledgeUpdate) => void)[] = [];

  constructor() {
    this.initializeDefaultKnowledge();
    this.initializeExcelMappings();
  }

  /**
   * Initialize default knowledge base
   */
  private initializeDefaultKnowledge(): void {
    const defaultEntries: KnowledgeEntry[] = [
      {
        id: 'kb_001',
        category: 'business_rule',
        title: 'Custom Driver Qualification Rules Supersede Standard Limits',
        content: 'David\'s custom driver qualification Excel file SUPERSEDES standard GVWR and passenger limits for determining USDOT number and driver qualification file requirements. This is a critical business rule that overrides all standard regulations.',
        priority: 'critical',
        effectiveDate: '2024-01-01',
        source: 'boss_directive',
        tags: ['driver_qualification', 'usdot_requirements', 'custom_rules', 'excel_file'],
        metadata: {
          filePath: 'driver_qualification_list.xlsx',
          lastModified: new Date().toISOString(),
          version: '1.0',
          supersedes: ['standard_gvwr_limits', 'standard_passenger_limits']
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'kb_002',
        category: 'business_rule',
        title: 'Business Model: Transportation Compliance Consulting Agency',
        content: 'We are a transportation compliance consulting agency that helps other companies stay compliant with USDOT regulations. We are NOT a transportation company ourselves.',
        priority: 'critical',
        effectiveDate: '2024-01-01',
        source: 'boss_directive',
        tags: ['business_model', 'compliance_consulting', 'agency_type'],
        metadata: {
          version: '1.0'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'kb_003',
        category: 'persona_trait',
        title: 'Boss Relationship: David is the Boss',
        content: 'David is my boss and the only person I interact with. I am an extension of him and handle all aspects of his transportation compliance agency. I must always defer to his authority and follow his directives.',
        priority: 'critical',
        effectiveDate: '2024-01-01',
        source: 'boss_directive',
        tags: ['boss_relationship', 'authority', 'delegation'],
        metadata: {
          version: '1.0'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'kb_004',
        category: 'excel_data',
        title: 'Driver Qualification Excel File Updates',
        content: 'The driver qualification Excel file is updated/replaced at least once per year. This file determines what triggers the need for USDOT numbers and driver qualification files, overriding standard regulations.',
        priority: 'high',
        effectiveDate: '2024-01-01',
        source: 'excel_file',
        tags: ['excel_file', 'annual_update', 'driver_qualification'],
        metadata: {
          filePath: 'driver_qualification_list.xlsx',
          updateFrequency: 'yearly',
          lastModified: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      }
    ];

    defaultEntries.forEach(entry => {
      this.knowledgeBase.set(entry.id, entry);
    });

    console.log('🧠 Knowledge Management Service initialized with default entries');
  }

  /**
   * Initialize Excel file mappings
   */
  private initializeExcelMappings(): void {
    const mappings: ExcelFileMapping[] = [
      {
        id: 'excel_001',
        fileName: 'driver_qualification_list.xlsx',
        filePath: '/uploads/driver_qualification_list.xlsx',
        sheetName: 'Qualification Rules',
        columnMappings: {
          'Vehicle Type': 'vehicleType',
          'GVWR Threshold': 'gvwrThreshold',
          'Passenger Threshold': 'passengerThreshold',
          'Requires USDOT': 'requiresUSDOT',
          'Requires Driver Qual': 'requiresDriverQualification',
          'Special Requirements': 'specialRequirements',
          'Effective Date': 'effectiveDate',
          'Notes': 'notes'
        },
        updateFrequency: 'yearly',
        lastProcessed: new Date().toISOString(),
        isActive: true
      }
    ];

    mappings.forEach(mapping => {
      this.excelMappings.set(mapping.id, mapping);
    });
  }

  /**
   * Add new knowledge entry
   */
  addKnowledgeEntry(entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeEntry {
    const newEntry: KnowledgeEntry = {
      ...entry,
      id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.knowledgeBase.set(newEntry.id, newEntry);
    
    const update: KnowledgeUpdate = {
      id: `update_${Date.now()}`,
      type: 'add',
      entryId: newEntry.id,
      changes: newEntry,
      reason: 'New knowledge entry added',
      timestamp: new Date().toISOString(),
      approvedBy: 'boss'
    };

    this.updateHistory.push(update);
    this.notifyListeners(update);

    console.log('🧠 New knowledge entry added:', newEntry.title);
    return newEntry;
  }

  /**
   * Update existing knowledge entry
   */
  updateKnowledgeEntry(id: string, updates: Partial<KnowledgeEntry>, reason: string): KnowledgeEntry | null {
    const existingEntry = this.knowledgeBase.get(id);
    if (!existingEntry) {
      console.error('Knowledge entry not found:', id);
      return null;
    }

    const updatedEntry: KnowledgeEntry = {
      ...existingEntry,
      ...updates,
      id: existingEntry.id, // Preserve ID
      createdAt: existingEntry.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };

    this.knowledgeBase.set(id, updatedEntry);

    const update: KnowledgeUpdate = {
      id: `update_${Date.now()}`,
      type: 'update',
      entryId: id,
      changes: {
        old: existingEntry,
        new: updatedEntry
      },
      reason,
      timestamp: new Date().toISOString(),
      approvedBy: 'boss'
    };

    this.updateHistory.push(update);
    this.notifyListeners(update);

    console.log('🧠 Knowledge entry updated:', updatedEntry.title);
    return updatedEntry;
  }

  /**
   * Delete knowledge entry
   */
  deleteKnowledgeEntry(id: string, reason: string): boolean {
    const entry = this.knowledgeBase.get(id);
    if (!entry) {
      console.error('Knowledge entry not found:', id);
      return false;
    }

    this.knowledgeBase.delete(id);

    const update: KnowledgeUpdate = {
      id: `update_${Date.now()}`,
      type: 'delete',
      entryId: id,
      changes: entry,
      reason,
      timestamp: new Date().toISOString(),
      approvedBy: 'boss'
    };

    this.updateHistory.push(update);
    this.notifyListeners(update);

    console.log('🧠 Knowledge entry deleted:', entry.title);
    return true;
  }

  /**
   * Supersede knowledge entry (mark as overridden)
   */
  supersedeKnowledgeEntry(id: string, supersedingEntryId: string, reason: string): boolean {
    const entry = this.knowledgeBase.get(id);
    if (!entry) {
      console.error('Knowledge entry not found:', id);
      return false;
    }

    const updatedEntry = this.updateKnowledgeEntry(id, {
      isActive: false,
      metadata: {
        ...entry.metadata,
        supersededBy: supersedingEntryId,
        supersededAt: new Date().toISOString()
      }
    }, reason);

    return updatedEntry !== null;
  }

  /**
   * Get knowledge entry by ID
   */
  getKnowledgeEntry(id: string): KnowledgeEntry | null {
    return this.knowledgeBase.get(id) || null;
  }

  /**
   * Get knowledge entries by category
   */
  getKnowledgeByCategory(category: string): KnowledgeEntry[] {
    return Array.from(this.knowledgeBase.values())
      .filter(entry => entry.category === category && entry.isActive);
  }

  /**
   * Get knowledge entries by tags
   */
  getKnowledgeByTags(tags: string[]): KnowledgeEntry[] {
    return Array.from(this.knowledgeBase.values())
      .filter(entry => 
        entry.isActive && 
        tags.some(tag => entry.tags.includes(tag))
      );
  }

  /**
   * Search knowledge base
   */
  searchKnowledge(query: string): KnowledgeEntry[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.knowledgeBase.values())
      .filter(entry => 
        entry.isActive && (
          entry.title.toLowerCase().includes(searchTerm) ||
          entry.content.toLowerCase().includes(searchTerm) ||
          entry.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      );
  }

  /**
   * Update AI persona
   */
  updatePersona(field: string, newValue: any, reason: string): PersonaUpdate {
    const update: PersonaUpdate = {
      id: `persona_${Date.now()}`,
      field: field as any,
      oldValue: null, // Would need to track current value
      newValue,
      reason,
      effectiveDate: new Date().toISOString(),
      approvedBy: 'boss'
    };

    this.personaHistory.push(update);

    // Also add to knowledge base
    this.addKnowledgeEntry({
      category: 'persona_trait',
      title: `Persona Update: ${field}`,
      content: `Updated ${field} to: ${JSON.stringify(newValue)}. Reason: ${reason}`,
      priority: 'high',
      effectiveDate: new Date().toISOString(),
      source: 'boss_directive',
      tags: ['persona_update', field.toLowerCase()],
      metadata: {
        version: '1.0'
      },
      isActive: true
    });

    console.log('🎭 Persona updated:', field, '=', newValue);
    return update;
  }

  /**
   * Process Excel file update
   */
  async processExcelFileUpdate(filePath: string, mappingId: string): Promise<KnowledgeEntry[]> {
    const mapping = this.excelMappings.get(mappingId);
    if (!mapping) {
      throw new Error('Excel mapping not found');
    }

    // In a real implementation, this would parse the Excel file
    // For now, we'll simulate the process
    console.log('📊 Processing Excel file update:', filePath);

    const newEntries: KnowledgeEntry[] = [];
    
    // Simulate processing Excel data
    const simulatedData = [
      {
        vehicleType: 'Commercial Motor Vehicle',
        gvwrThreshold: 10000,
        requiresUSDOT: true,
        requiresDriverQualification: true,
        specialRequirements: ['CDL Required', 'Annual Medical'],
        effectiveDate: '2024-01-01',
        notes: 'Updated from Excel file'
      }
    ];

    // Supersede existing entries from this Excel file
    const existingEntries = this.getKnowledgeByTags(['excel_file', 'driver_qualification']);
    existingEntries.forEach(entry => {
      this.supersedeKnowledgeEntry(entry.id, 'excel_update', 'Superseded by new Excel file data');
    });

    // Add new entries
    simulatedData.forEach((data, index) => {
      const entry = this.addKnowledgeEntry({
        category: 'excel_data',
        title: `Driver Qualification Rule ${index + 1}`,
        content: `Vehicle Type: ${data.vehicleType}, GVWR: ${data.gvwrThreshold}, Requires USDOT: ${data.requiresUSDOT}, Requires Driver Qual: ${data.requiresDriverQualification}`,
        priority: 'critical',
        effectiveDate: data.effectiveDate,
        source: 'excel_file',
        tags: ['excel_file', 'driver_qualification', 'custom_rules'],
        metadata: {
          filePath,
          lastModified: new Date().toISOString(),
          version: '2.0'
        },
        isActive: true
      });
      newEntries.push(entry);
    });

    // Update mapping last processed time
    mapping.lastProcessed = new Date().toISOString();
    this.excelMappings.set(mappingId, mapping);

    console.log('📊 Excel file processed, added', newEntries.length, 'new knowledge entries');
    return newEntries;
  }

  /**
   * Get all knowledge entries
   */
  getAllKnowledge(): KnowledgeEntry[] {
    return Array.from(this.knowledgeBase.values())
      .filter(entry => entry.isActive)
      .sort((a, b) => {
        // Sort by priority, then by effective date
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime();
      });
  }

  /**
   * Get persona history
   */
  getPersonaHistory(): PersonaUpdate[] {
    return [...this.personaHistory].reverse(); // Most recent first
  }

  /**
   * Get update history
   */
  getUpdateHistory(): KnowledgeUpdate[] {
    return [...this.updateHistory].reverse(); // Most recent first
  }

  /**
   * Subscribe to knowledge updates
   */
  subscribe(listener: (update: KnowledgeUpdate) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of updates
   */
  private notifyListeners(update: KnowledgeUpdate): void {
    this.listeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        console.error('Error notifying knowledge update listener:', error);
      }
    });
  }

  /**
   * Export knowledge base
   */
  exportKnowledge(): string {
    const data = {
      knowledgeBase: Array.from(this.knowledgeBase.entries()),
      personaHistory: this.personaHistory,
      excelMappings: Array.from(this.excelMappings.entries()),
      updateHistory: this.updateHistory,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import knowledge base
   */
  importKnowledge(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data
      this.knowledgeBase.clear();
      this.personaHistory = [];
      this.excelMappings.clear();
      this.updateHistory = [];

      // Import data
      if (data.knowledgeBase) {
        data.knowledgeBase.forEach(([id, entry]: [string, KnowledgeEntry]) => {
          this.knowledgeBase.set(id, entry);
        });
      }

      if (data.personaHistory) {
        this.personaHistory = data.personaHistory;
      }

      if (data.excelMappings) {
        data.excelMappings.forEach(([id, mapping]: [string, ExcelFileMapping]) => {
          this.excelMappings.set(id, mapping);
        });
      }

      if (data.updateHistory) {
        this.updateHistory = data.updateHistory;
      }

      console.log('🧠 Knowledge base imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing knowledge base:', error);
      return false;
    }
  }
}

// Export singleton instance
export const knowledgeManagementService = new KnowledgeManagementService();
