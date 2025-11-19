/**
 * Unique Page Tracker
 * 
 * Tracks which unique pages have been discovered to ensure complete coverage
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface PageFingerprint {
  hash: string;
  url: string;
  title: string;
  fieldCount: number;
  questionIds: string[];
  firstSeenInScenario: string;
  htmlPath: string;
}

export class UniquePageTracker {
  private discoveredPages: Map<string, PageFingerprint> = new Map();
  private outputDir: string;
  
  constructor(outputDir: string) {
    this.outputDir = outputDir;
    this.loadExistingPages();
  }
  
  /**
   * Generate a unique hash for a page based on its structure
   * (not content, since dynamic values change)
   */
  generatePageHash(html: string): string {
    // Remove dynamic content that changes between runs
    let normalized = html
      // Remove timestamps, session IDs, tokens
      .replace(/\d{13,}/g, 'TIMESTAMP')
      .replace(/[a-f0-9]{32,}/gi, 'TOKEN')
      .replace(/session[_-]?id['":\s=]+[^"'\s<>]+/gi, 'SESSION_ID')
      // Remove specific field values (keep structure)
      .replace(/value="[^"]*"/g, 'value=""')
      .replace(/defaultValue="[^"]*"/g, 'defaultValue=""')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    // Hash the normalized structure
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }
  
  /**
   * Extract question IDs from page (URS uses Q##### format)
   */
  extractQuestionIds(html: string): string[] {
    const questionIds: string[] = [];
    const matches = html.matchAll(/name=["']?(Q\d{5})["']?/gi);
    
    for (const match of matches) {
      const id = match[1].toUpperCase();
      if (!questionIds.includes(id)) {
        questionIds.push(id);
      }
    }
    
    return questionIds.sort();
  }
  
  /**
   * Extract page title
   */
  extractTitle(html: string): string {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) return titleMatch[1].trim();
    
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) return h1Match[1].trim();
    
    return 'Unknown Page';
  }
  
  /**
   * Check if this is a new unique page
   */
  isNewPage(html: string, url: string): boolean {
    const hash = this.generatePageHash(html);
    return !this.discoveredPages.has(hash);
  }
  
  /**
   * Record a new page
   */
  recordPage(html: string, url: string, scenarioId: string, pageNumber: number): PageFingerprint | null {
    const hash = this.generatePageHash(html);
    
    // Check if we've seen this page before
    if (this.discoveredPages.has(hash)) {
      console.log(`      ⚠️  Page already discovered (hash: ${hash.substring(0, 8)}...)`);
      return null;
    }
    
    // This is a NEW unique page!
    const questionIds = this.extractQuestionIds(html);
    const title = this.extractTitle(html);
    
    // Save HTML to file
    const htmlFilename = `unique_page_${this.discoveredPages.size + 1}_${hash.substring(0, 8)}.html`;
    const htmlPath = path.join(this.outputDir, 'unique-pages', htmlFilename);
    
    // Ensure directory exists
    const uniquePagesDir = path.join(this.outputDir, 'unique-pages');
    if (!fs.existsSync(uniquePagesDir)) {
      fs.mkdirSync(uniquePagesDir, { recursive: true });
    }
    
    fs.writeFileSync(htmlPath, html, 'utf-8');
    
    const fingerprint: PageFingerprint = {
      hash,
      url,
      title,
      fieldCount: questionIds.length,
      questionIds,
      firstSeenInScenario: scenarioId,
      htmlPath
    };
    
    this.discoveredPages.set(hash, fingerprint);
    
    console.log(`      ✨ NEW UNIQUE PAGE DISCOVERED! (Total: ${this.discoveredPages.size})`);
    console.log(`         Title: ${title}`);
    console.log(`         Questions: ${questionIds.length} (${questionIds.join(', ')})`);
    console.log(`         Saved: ${htmlFilename}`);
    
    // Save the tracker state
    this.saveState();
    
    return fingerprint;
  }
  
  /**
   * Get statistics about discovered pages
   */
  getStats() {
    return {
      totalUniquePages: this.discoveredPages.size,
      pages: Array.from(this.discoveredPages.values())
    };
  }
  
  /**
   * Check if we've likely found all pages
   * (heuristic: if we've run N scenarios without finding new pages)
   */
  shouldContinueCrawling(scenariosWithoutNewPages: number): boolean {
    // If we've run 10 scenarios in a row without finding new pages, we're probably done
    const threshold = 10;
    
    if (scenariosWithoutNewPages >= threshold) {
      console.log(`\n✅ Likely found all unique pages (${this.discoveredPages.size} total)`);
      console.log(`   No new pages in last ${threshold} scenarios`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Save tracker state to file
   */
  private saveState(): void {
    const statePath = path.join(this.outputDir, 'unique-pages-tracker.json');
    
    const state = {
      totalUniquePages: this.discoveredPages.size,
      lastUpdated: new Date().toISOString(),
      pages: Array.from(this.discoveredPages.values())
    };
    
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf-8');
  }
  
  /**
   * Load existing pages from previous runs
   */
  private loadExistingPages(): void {
    const statePath = path.join(this.outputDir, 'unique-pages-tracker.json');
    
    if (!fs.existsSync(statePath)) {
      return;
    }
    
    try {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      
      for (const page of state.pages) {
        this.discoveredPages.set(page.hash, page);
      }
      
      console.log(`📦 Loaded ${this.discoveredPages.size} previously discovered unique pages`);
    } catch (error) {
      console.warn('⚠️  Could not load previous page tracker state:', error);
    }
  }
  
  /**
   * Generate final report
   */
  generateReport(): string {
    const report: string[] = [];
    
    report.push('# URS Unique Pages Discovery Report\n');
    report.push(`**Total Unique Pages Discovered:** ${this.discoveredPages.size}\n`);
    report.push(`**Generated:** ${new Date().toISOString()}\n\n`);
    
    report.push('## Discovered Pages\n\n');
    
    const pages = Array.from(this.discoveredPages.values());
    pages.forEach((page, index) => {
      report.push(`### ${index + 1}. ${page.title}\n`);
      report.push(`- **Hash:** \`${page.hash.substring(0, 16)}...\`\n`);
      report.push(`- **URL:** ${page.url}\n`);
      report.push(`- **Questions:** ${page.fieldCount} (${page.questionIds.join(', ')})\n`);
      report.push(`- **First Seen:** ${page.firstSeenInScenario}\n`);
      report.push(`- **HTML File:** \`${path.basename(page.htmlPath)}\`\n\n`);
    });
    
    return report.join('');
  }
}

