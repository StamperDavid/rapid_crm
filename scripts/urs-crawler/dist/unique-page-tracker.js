"use strict";
/**
 * Unique Page Tracker
 *
 * Tracks which unique pages have been discovered to ensure complete coverage
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniquePageTracker = void 0;
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class UniquePageTracker {
    constructor(outputDir) {
        this.discoveredPages = new Map();
        this.outputDir = outputDir;
        this.loadExistingPages();
    }
    /**
     * Generate a unique hash for a page based on its structure
     * (not content, since dynamic values change)
     */
    generatePageHash(html) {
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
    extractQuestionIds(html) {
        const questionIds = [];
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
    extractTitle(html) {
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch)
            return titleMatch[1].trim();
        const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1Match)
            return h1Match[1].trim();
        return 'Unknown Page';
    }
    /**
     * Check if this is a new unique page
     */
    isNewPage(html, url) {
        const hash = this.generatePageHash(html);
        return !this.discoveredPages.has(hash);
    }
    /**
     * Record a new page
     */
    recordPage(html, url, scenarioId, pageNumber) {
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
        const fingerprint = {
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
    shouldContinueCrawling(scenariosWithoutNewPages) {
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
    saveState() {
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
    loadExistingPages() {
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
        }
        catch (error) {
            console.warn('⚠️  Could not load previous page tracker state:', error);
        }
    }
    /**
     * Generate final report
     */
    generateReport() {
        const report = [];
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
exports.UniquePageTracker = UniquePageTracker;
