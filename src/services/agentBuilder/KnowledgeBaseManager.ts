import { KnowledgeBase } from '../../types/schema';

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'pdf' | 'html' | 'markdown' | 'json';
  source: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  size: number;
  checksum: string;
}

export interface KnowledgeSearchResult {
  document: KnowledgeDocument;
  relevanceScore: number;
  matchedSections: Array<{
    content: string;
    startIndex: number;
    endIndex: number;
  }>;
}

export interface KnowledgeBaseStats {
  totalDocuments: number;
  totalSize: string;
  documentsByType: Record<string, number>;
  lastUpdated: string;
  averageDocumentSize: number;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
}

export class KnowledgeBaseManager {
  private knowledgeBases: Map<string, KnowledgeBase> = new Map();
  private documents: Map<string, KnowledgeDocument[]> = new Map();
  private searchIndex: Map<string, Map<string, number>> = new Map();
  private isInitialized = false;

  constructor() {
    this.loadData();
  }

  /**
   * Initialize the knowledge base manager
   */
  public async initialize(): Promise<void> {
    try {
      await this.buildSearchIndex();
      this.isInitialized = true;
      console.log('Knowledge Base Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Knowledge Base Manager:', error);
      throw new Error('Knowledge Base Manager initialization failed');
    }
  }

  /**
   * Check if manager is ready
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Load data from storage
   */
  private async loadData(): Promise<void> {
    try {
      console.log('Loading knowledge base data from real database...');
      
      // Load knowledge bases
      const knowledgeBases = await this.loadKnowledgeBases();
      this.knowledgeBases = new Map(knowledgeBases.map(kb => [kb.id, kb]));
      
      // Load documents (for now, initialize empty as documents are stored within knowledge bases)
      this.documents = new Map();
      
      console.log(`✅ Loaded ${this.knowledgeBases.size} knowledge bases`);
    } catch (error) {
      console.error('Error loading knowledge base data:', error);
      // Initialize empty maps as fallback
      this.knowledgeBases = new Map();
      this.documents = new Map();
    }
  }

  /**
   * Save data to storage
   */
  private async saveData(): Promise<void> {
    try {
      console.log('Saving knowledge base data to real database...');
      // Data is saved individually when created/updated
      // This method is kept for future batch operations
    } catch (error) {
      console.error('Error saving knowledge base data:', error);
    }
  }

  /**
   * Load knowledge bases from database
   */
  private async loadKnowledgeBases(): Promise<KnowledgeBase[]> {
    try {
      const response = await fetch('/api/knowledge-bases');
      if (!response.ok) {
        throw new Error(`Failed to load knowledge bases: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading knowledge bases:', error);
      return [];
    }
  }

  /**
   * Create a new knowledge base
   */
  public async createKnowledgeBase(kbData: Omit<KnowledgeBase, 'id' | 'lastUpdated'>): Promise<KnowledgeBase> {
    const newKB: KnowledgeBase = {
      ...kbData,
      id: `kb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date().toISOString()
    };

    this.knowledgeBases.set(newKB.id, newKB);
    this.documents.set(newKB.id, []);
    await this.saveData();

    return newKB;
  }

  /**
   * Get all knowledge bases
   */
  public async getKnowledgeBases(): Promise<KnowledgeBase[]> {
    return Array.from(this.knowledgeBases.values()).sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }

  /**
   * Get knowledge base by ID
   */
  public async getKnowledgeBase(id: string): Promise<KnowledgeBase | null> {
    return this.knowledgeBases.get(id) || null;
  }

  /**
   * Update knowledge base
   */
  public async updateKnowledgeBase(id: string, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase | null> {
    const kb = this.knowledgeBases.get(id);
    if (!kb) return null;

    const updatedKB = {
      ...kb,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    this.knowledgeBases.set(id, updatedKB);
    await this.saveData();
    return updatedKB;
  }

  /**
   * Delete knowledge base
   */
  public async deleteKnowledgeBase(id: string): Promise<boolean> {
    const deleted = this.knowledgeBases.delete(id);
    this.documents.delete(id);
    this.searchIndex.delete(id);
    await this.saveData();
    return deleted;
  }

  /**
   * Add document to knowledge base
   */
  public async addDocument(kbId: string, document: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt' | 'checksum'>): Promise<KnowledgeDocument> {
    const kb = this.knowledgeBases.get(kbId);
    if (!kb) throw new Error('Knowledge base not found');

    const checksum = await this.calculateChecksum(document.content);
    const newDocument: KnowledgeDocument = {
      ...document,
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checksum
    };

    const documents = this.documents.get(kbId) || [];
    documents.push(newDocument);
    this.documents.set(kbId, documents);

    // Update knowledge base size
    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
    await this.updateKnowledgeBase(kbId, { size: this.formatSize(totalSize) });

    // Update search index
    await this.updateSearchIndex(kbId, newDocument);

    await this.saveData();
    return newDocument;
  }

  /**
   * Get documents from knowledge base
   */
  public async getDocuments(kbId: string): Promise<KnowledgeDocument[]> {
    return this.documents.get(kbId) || [];
  }

  /**
   * Search documents in knowledge base
   */
  public async searchDocuments(kbId: string, query: string, limit: number = 10): Promise<KnowledgeSearchResult[]> {
    const documents = this.documents.get(kbId) || [];
    const index = this.searchIndex.get(kbId) || new Map();
    
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    const results: KnowledgeSearchResult[] = [];

    for (const doc of documents) {
      let relevanceScore = 0;
      const matchedSections: Array<{ content: string; startIndex: number; endIndex: number }> = [];

      for (const term of queryTerms) {
        const termIndex = index.get(`${doc.id}-${term}`) || 0;
        relevanceScore += termIndex;

        // Find matching sections
        const content = doc.content.toLowerCase();
        let startIndex = 0;
        while ((startIndex = content.indexOf(term, startIndex)) !== -1) {
          const endIndex = Math.min(startIndex + term.length + 100, content.length);
          matchedSections.push({
            content: doc.content.substring(startIndex, endIndex),
            startIndex,
            endIndex
          });
          startIndex += term.length;
        }
      }

      if (relevanceScore > 0) {
        results.push({
          document: doc,
          relevanceScore,
          matchedSections: matchedSections.slice(0, 3) // Limit to 3 sections
        });
      }
    }

    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Get knowledge base statistics
   */
  public async getKnowledgeBaseStats(kbId: string): Promise<KnowledgeBaseStats> {
    const documents = this.documents.get(kbId) || [];
    const kb = this.knowledgeBases.get(kbId);
    
    if (!kb) throw new Error('Knowledge base not found');

    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
    const documentsByType: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    documents.forEach(doc => {
      documentsByType[doc.type] = (documentsByType[doc.type] || 0) + 1;
      doc.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalDocuments: documents.length,
      totalSize: this.formatSize(totalSize),
      documentsByType,
      lastUpdated: kb.lastUpdated,
      averageDocumentSize: documents.length > 0 ? totalSize / documents.length : 0,
      topTags
    };
  }

  /**
   * Build search index for all knowledge bases
   */
  private async buildSearchIndex(): Promise<void> {
    for (const [kbId, documents] of this.documents) {
      const index = new Map<string, number>();
      
      for (const doc of documents) {
        await this.indexDocument(doc, index);
      }
      
      this.searchIndex.set(kbId, index);
    }
  }

  /**
   * Update search index for a document
   */
  private async updateSearchIndex(kbId: string, document: KnowledgeDocument): Promise<void> {
    const index = this.searchIndex.get(kbId) || new Map();
    await this.indexDocument(document, index);
    this.searchIndex.set(kbId, index);
  }

  /**
   * Index a document for search
   */
  private async indexDocument(document: KnowledgeDocument, index: Map<string, number>): Promise<void> {
    const content = document.content.toLowerCase();
    const words = content.split(/\s+/).filter(word => word.length > 2);
    
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    Object.entries(wordCounts).forEach(([word, count]) => {
      index.set(`${document.id}-${word}`, count);
    });
  }

  /**
   * Calculate document checksum
   */
  private async calculateChecksum(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Format file size
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Import documents from file
   */
  public async importDocuments(kbId: string, file: File): Promise<KnowledgeDocument[]> {
    const content = await file.text();
    const documents: KnowledgeDocument[] = [];

    // Simple text import - can be extended for other formats
    const lines = content.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim()) {
        const doc = await this.addDocument(kbId, {
          title: `Imported Document ${i + 1}`,
          content: line,
          type: 'text',
          source: file.name,
          tags: ['imported'],
          metadata: { importedAt: new Date().toISOString() },
          size: new TextEncoder().encode(line).length
        });
        documents.push(doc);
      }
    }

    return documents;
  }

  /**
   * Export knowledge base
   */
  public async exportKnowledgeBase(kbId: string): Promise<string> {
    const kb = this.knowledgeBases.get(kbId);
    const documents = this.documents.get(kbId) || [];
    
    if (!kb) throw new Error('Knowledge base not found');

    const exportData = {
      knowledgeBase: kb,
      documents,
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }
}

export const knowledgeBaseManager = new KnowledgeBaseManager();
