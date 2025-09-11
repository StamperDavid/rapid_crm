import { KnowledgeBase } from '../../types/schema';

export interface KnowledgeDocument {
  id: string;
  knowledgeBaseId: string;
  title: string;
  content: string;
  type: 'text' | 'pdf' | 'html' | 'markdown' | 'json' | 'csv';
  source: string;
  metadata: {
    author?: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    language: string;
    size: number;
    checksum: string;
  };
  embeddings?: number[];
  searchable: boolean;
}

export interface KnowledgeSearchResult {
  document: KnowledgeDocument;
  score: number;
  highlights: string[];
  context: string;
}

export interface KnowledgeBaseStats {
  totalDocuments: number;
  totalSize: string;
  documentsByType: Record<string, number>;
  lastUpdated: string;
  searchQueries: number;
  averageSearchTime: number;
}

export class KnowledgeBaseService {
  private knowledgeBases: Map<string, KnowledgeBase> = new Map();
  private documents: Map<string, KnowledgeDocument[]> = new Map();
  private searchIndex: Map<string, Map<string, number[]>> = new Map();
  private stats: Map<string, KnowledgeBaseStats> = new Map();

  constructor() {
    this.initializeDefaultKnowledgeBases();
  }

  private async initializeDefaultKnowledgeBases(): Promise<void> {
    // Initialize with sample documents
    const sampleDocuments: KnowledgeDocument[] = [
      {
        id: 'doc_1',
        knowledgeBaseId: 'usdot_regulations',
        title: 'USDOT Application Requirements',
        content: `The USDOT application process requires the following information:

1. Business Information:
   - Legal business name
   - Business type (LLC, Corporation, Partnership, etc.)
   - EIN (Employer Identification Number)
   - Business address and contact information

2. Transportation Operations:
   - Type of cargo to be transported
   - Geographic areas of operation
   - Number of vehicles and drivers
   - Vehicle types and specifications

3. Safety and Compliance:
   - Safety management system
   - Driver qualification files
   - Vehicle maintenance records
   - Hours of service compliance

4. Insurance Requirements:
   - General liability insurance
   - Cargo insurance
   - Workers' compensation insurance

All information must be accurate and up-to-date. False information may result in application denial or penalties.`,
        type: 'text',
        source: 'fmcsa.gov',
        metadata: {
          author: 'FMCSA',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
          tags: ['usdot', 'application', 'requirements', 'compliance'],
          language: 'en',
          size: 2048,
          checksum: 'abc123def456'
        },
        searchable: true
      },
      {
        id: 'doc_2',
        knowledgeBaseId: 'usdot_regulations',
        title: 'FMCSA Safety Regulations',
        content: `Federal Motor Carrier Safety Administration (FMCSA) regulations include:

1. Hours of Service (HOS) Regulations:
   - 11-hour driving limit
   - 14-hour duty limit
   - 30-minute break requirement
   - 34-hour restart provision

2. Driver Qualification Requirements:
   - Commercial Driver's License (CDL)
   - Medical certification
   - Background checks
   - Drug and alcohol testing

3. Vehicle Safety Standards:
   - Annual inspections
   - Maintenance requirements
   - Safety equipment standards
   - Weight and dimension limits

4. Cargo Securement:
   - Proper load securement
   - Weight distribution
   - Hazardous materials handling

Compliance with these regulations is mandatory for all motor carriers operating in interstate commerce.`,
        type: 'text',
        source: 'fmcsa.gov',
        metadata: {
          author: 'FMCSA',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-10T00:00:00Z',
          tags: ['fmcsa', 'safety', 'regulations', 'compliance'],
          language: 'en',
          size: 1536,
          checksum: 'def456ghi789'
        },
        searchable: true
      },
      {
        id: 'doc_3',
        knowledgeBaseId: 'product_documentation',
        title: 'Rapid CRM Platform Overview',
        content: `Rapid CRM is a comprehensive customer relationship management platform designed specifically for transportation companies. Key features include:

1. Company Management:
   - Complete company profiles
   - Contact management
   - Document storage
   - Compliance tracking

2. USDOT Application Automation:
   - Guided application process
   - Data validation
   - Automated submission
   - Status tracking

3. Fleet Management:
   - Vehicle tracking
   - Driver management
   - Maintenance scheduling
   - Compliance monitoring

4. Sales and Marketing:
   - Lead management
   - Deal tracking
   - Customer communication
   - Analytics and reporting

5. AI-Powered Features:
   - Intelligent agents
   - Automated workflows
   - Predictive analytics
   - Natural language processing

The platform integrates with major transportation industry systems and provides real-time compliance monitoring.`,
        type: 'text',
        source: 'internal',
        metadata: {
          author: 'Rapid CRM Team',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-20T00:00:00Z',
          tags: ['product', 'features', 'overview', 'crm'],
          language: 'en',
          size: 1792,
          checksum: 'ghi789jkl012'
        },
        searchable: true
      },
      {
        id: 'doc_4',
        knowledgeBaseId: 'sales_scripts',
        title: 'USDOT Application Service Sales Script',
        content: `Sales Script for USDOT Application Services:

Opening:
"Hi [Name], I'm calling from Rapid CRM. We specialize in helping transportation companies streamline their USDOT application process. I noticed your company [Company Name] might benefit from our automated application service."

Value Proposition:
"Our platform can reduce your USDOT application time from weeks to hours, with 99% accuracy and full compliance guarantee. We handle everything from data collection to submission and tracking."

Pain Points to Address:
- Time-consuming manual application process
- Risk of errors and rejections
- Complex regulatory requirements
- Need for ongoing compliance monitoring

Solution Benefits:
- Automated data collection and validation
- Expert compliance checking
- One-click submission
- Real-time status tracking
- Ongoing compliance monitoring

Closing:
"Would you like to see a quick demo of how our platform can streamline your USDOT application process? I can show you exactly how it works in just 10 minutes."`,
        type: 'text',
        source: 'internal',
        metadata: {
          author: 'Sales Team',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-18T00:00:00Z',
          tags: ['sales', 'script', 'usdot', 'application'],
          language: 'en',
          size: 1280,
          checksum: 'jkl012mno345'
        },
        searchable: true
      }
    ];

    // Initialize knowledge bases
    const knowledgeBases: KnowledgeBase[] = [
      {
        id: 'usdot_regulations',
        name: 'USDOT Regulations',
        type: 'regulatory',
        description: 'Federal Motor Carrier Safety Administration regulations and guidelines',
        source: 'api',
        status: 'active',
        size: '15.2 MB',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'product_documentation',
        name: 'Product Documentation',
        type: 'proprietary',
        description: 'Comprehensive product documentation and user guides',
        source: 'upload',
        status: 'active',
        size: '12.5 MB',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'sales_scripts',
        name: 'Sales Scripts',
        type: 'proprietary',
        description: 'Proven sales scripts and conversation templates',
        source: 'upload',
        status: 'active',
        size: '2.8 MB',
        lastUpdated: new Date().toISOString()
      }
    ];

    // Store knowledge bases
    knowledgeBases.forEach(kb => this.knowledgeBases.set(kb.id, kb));

    // Store documents
    sampleDocuments.forEach(doc => {
      const existingDocs = this.documents.get(doc.knowledgeBaseId) || [];
      this.documents.set(doc.knowledgeBaseId, [...existingDocs, doc]);
    });

    // Initialize search index
    this.buildSearchIndex();

    // Initialize stats
    this.initializeStats();
  }

  private buildSearchIndex(): void {
    this.documents.forEach((docs, kbId) => {
      const index = new Map<string, number[]>();
      
      docs.forEach(doc => {
        if (!doc.searchable) return;
        
        const words = doc.content.toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 2);
        
        words.forEach(word => {
          if (!index.has(word)) {
            index.set(word, []);
          }
          index.get(word)!.push(doc.id as any);
        });
      });
      
      this.searchIndex.set(kbId, index);
    });
  }

  private initializeStats(): void {
    this.knowledgeBases.forEach((kb, kbId) => {
      const docs = this.documents.get(kbId) || [];
      const totalSize = docs.reduce((sum, doc) => sum + doc.metadata.size, 0);
      
      const documentsByType = docs.reduce((acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      this.stats.set(kbId, {
        totalDocuments: docs.length,
        totalSize: this.formatSize(totalSize),
        documentsByType,
        lastUpdated: new Date().toISOString(),
        searchQueries: 0,
        averageSearchTime: 0
      });
    });
  }

  private formatSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  async searchKnowledgeBase(
    knowledgeBaseId: string, 
    query: string, 
    limit: number = 10
  ): Promise<KnowledgeSearchResult[]> {
    const startTime = Date.now();
    
    const kb = this.knowledgeBases.get(knowledgeBaseId);
    if (!kb) {
      throw new Error(`Knowledge base ${knowledgeBaseId} not found`);
    }

    const docs = this.documents.get(knowledgeBaseId) || [];
    const index = this.searchIndex.get(knowledgeBaseId);
    
    if (!index) {
      return [];
    }

    // Simple keyword-based search
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const results: KnowledgeSearchResult[] = [];

    docs.forEach(doc => {
      if (!doc.searchable) return;

      let score = 0;
      const highlights: string[] = [];
      const content = doc.content.toLowerCase();

      queryWords.forEach(word => {
        const wordIndex = index.get(word);
        if (wordIndex && wordIndex.includes(doc.id as any)) {
          score += 1;
          
          // Find context around the word
          const wordIndexInContent = content.indexOf(word);
          if (wordIndexInContent !== -1) {
            const start = Math.max(0, wordIndexInContent - 50);
            const end = Math.min(content.length, wordIndexInContent + word.length + 50);
            highlights.push(content.substring(start, end));
          }
        }
      });

      if (score > 0) {
        results.push({
          document: doc,
          score: score / queryWords.length,
          highlights,
          context: doc.content.substring(0, 200) + '...'
        });
      }
    });

    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    const limitedResults = results.slice(0, limit);

    // Update search stats
    const stats = this.stats.get(knowledgeBaseId);
    if (stats) {
      stats.searchQueries++;
      stats.averageSearchTime = 
        (stats.averageSearchTime * (stats.searchQueries - 1) + (Date.now() - startTime)) / 
        stats.searchQueries;
      this.stats.set(knowledgeBaseId, stats);
    }

    return limitedResults;
  }

  async addDocument(knowledgeBaseId: string, document: Omit<KnowledgeDocument, 'id'>): Promise<KnowledgeDocument> {
    const kb = this.knowledgeBases.get(knowledgeBaseId);
    if (!kb) {
      throw new Error(`Knowledge base ${knowledgeBaseId} not found`);
    }

    const newDocument: KnowledgeDocument = {
      ...document,
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    const existingDocs = this.documents.get(knowledgeBaseId) || [];
    this.documents.set(knowledgeBaseId, [...existingDocs, newDocument]);

    // Update search index
    this.updateSearchIndex(knowledgeBaseId, newDocument);

    // Update stats
    this.updateStats(knowledgeBaseId);

    return newDocument;
  }

  private updateSearchIndex(knowledgeBaseId: string, document: KnowledgeDocument): void {
    const index = this.searchIndex.get(knowledgeBaseId) || new Map<string, number[]>();
    
    if (document.searchable) {
      const words = document.content.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      words.forEach(word => {
        if (!index.has(word)) {
          index.set(word, []);
        }
        index.get(word)!.push(document.id as any);
      });
    }
    
    this.searchIndex.set(knowledgeBaseId, index);
  }

  private updateStats(knowledgeBaseId: string): void {
    const docs = this.documents.get(knowledgeBaseId) || [];
    const totalSize = docs.reduce((sum, doc) => sum + doc.metadata.size, 0);
    
    const documentsByType = docs.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const currentStats = this.stats.get(knowledgeBaseId) || {
      totalDocuments: 0,
      totalSize: '0 B',
      documentsByType: {},
      lastUpdated: new Date().toISOString(),
      searchQueries: 0,
      averageSearchTime: 0
    };

    this.stats.set(knowledgeBaseId, {
      ...currentStats,
      totalDocuments: docs.length,
      totalSize: this.formatSize(totalSize),
      documentsByType,
      lastUpdated: new Date().toISOString()
    });
  }

  async getAllKnowledgeBases(): Promise<KnowledgeBase[]> {
    return Array.from(this.knowledgeBases.values());
  }

  async getKnowledgeBase(kbId: string): Promise<KnowledgeBase | null> {
    return this.knowledgeBases.get(kbId) || null;
  }

  async getDocuments(knowledgeBaseId: string): Promise<KnowledgeDocument[]> {
    return this.documents.get(knowledgeBaseId) || [];
  }

  async getDocument(knowledgeBaseId: string, documentId: string): Promise<KnowledgeDocument | null> {
    const docs = this.documents.get(knowledgeBaseId) || [];
    return docs.find(doc => doc.id === documentId) || null;
  }

  async getKnowledgeBaseStats(knowledgeBaseId: string): Promise<KnowledgeBaseStats | null> {
    return this.stats.get(knowledgeBaseId) || null;
  }

  async getAllStats(): Promise<Map<string, KnowledgeBaseStats>> {
    return new Map(this.stats);
  }

  async createKnowledgeBase(kb: Omit<KnowledgeBase, 'id'>): Promise<KnowledgeBase> {
    const newKB: KnowledgeBase = {
      ...kb,
      id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.knowledgeBases.set(newKB.id, newKB);
    this.documents.set(newKB.id, []);
    this.searchIndex.set(newKB.id, new Map());
    
    this.stats.set(newKB.id, {
      totalDocuments: 0,
      totalSize: '0 B',
      documentsByType: {},
      lastUpdated: new Date().toISOString(),
      searchQueries: 0,
      averageSearchTime: 0
    });

    return newKB;
  }

  async updateKnowledgeBase(kbId: string, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase | null> {
    const kb = this.knowledgeBases.get(kbId);
    if (!kb) return null;

    const updatedKB = {
      ...kb,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    this.knowledgeBases.set(kbId, updatedKB);
    return updatedKB;
  }

  async deleteKnowledgeBase(kbId: string): Promise<boolean> {
    const deleted = this.knowledgeBases.delete(kbId);
    if (deleted) {
      this.documents.delete(kbId);
      this.searchIndex.delete(kbId);
      this.stats.delete(kbId);
    }
    return deleted;
  }

  async deleteDocument(knowledgeBaseId: string, documentId: string): Promise<boolean> {
    const docs = this.documents.get(knowledgeBaseId) || [];
    const filteredDocs = docs.filter(doc => doc.id !== documentId);
    
    if (filteredDocs.length < docs.length) {
      this.documents.set(knowledgeBaseId, filteredDocs);
      this.updateStats(knowledgeBaseId);
      return true;
    }
    
    return false;
  }
}

// Singleton instance
export const knowledgeBaseService = new KnowledgeBaseService();
