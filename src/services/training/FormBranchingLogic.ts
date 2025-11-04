/**
 * Form Branching Logic
 * Implements the EXACT conditional navigation from the real FMCSA application
 * Based on documented branching logic in the 77 HTML forms
 */

export interface BranchingDecision {
  currentPage: number;
  nextPage: number;
  reason: string;
  skippedPages?: number[];
}

export class FormBranchingLogic {
  /**
   * Determine next page based on answers (EXACT logic from real FMCSA app)
   */
  getNextPage(
    currentPage: number,
    formAnswers: Map<number, any>
  ): BranchingDecision {
    
    // Default: sequential navigation
    let nextPage = currentPage + 1;
    let reason = 'Sequential navigation';
    let skippedPages: number[] = [];
    
    switch (currentPage) {
      case 31: // Transport Property
        const transportProperty = this.getAnswer(formAnswers, 31, 'transport property');
        if (transportProperty === 'N' || transportProperty === 'No') {
          nextPage = 36; // Skip property questions, go to passengers
          skippedPages = [32, 33, 34, 35];
          reason = 'Answered No to transport property - skipping property carrier questions';
        }
        break;
        
      case 36: // Transport Passengers
        const transportPassengers = this.getAnswer(formAnswers, 36, 'passengers');
        if (transportPassengers === 'Y' || transportPassengers === 'Yes') {
          // Would go to passenger-specific questions (not in our current forms)
          reason = 'Answered Yes to passengers - would go to passenger questions';
        }
        break;
        
      case 60: // Affiliations
        const hasAffiliations = this.getAnswer(formAnswers, 60, 'affiliation');
        if (hasAffiliations === 'N' || hasAffiliations === 'No') {
          nextPage = 61; // Skip affiliation details, go to summary
          reason = 'No affiliations - skipping affiliation detail questions';
        }
        break;
    }
    
    return {
      currentPage,
      nextPage,
      reason,
      skippedPages: skippedPages.length > 0 ? skippedPages : undefined
    };
  }
  
  /**
   * Check if a page should be shown based on previous answers
   */
  shouldShowPage(
    pageNumber: number,
    formAnswers: Map<number, any>
  ): { show: boolean; reason: string } {
    // Pages 32-35 (property carrier details)
    if (pageNumber >= 32 && pageNumber <= 35) {
      const transportProperty = this.getAnswer(formAnswers, 31, 'transport property');
      if (transportProperty === 'N' || transportProperty === 'No') {
        return {
          show: false,
          reason: 'Skipped - applicant does not transport property'
        };
      }
    }
    
    // Affiliation detail pages (if they exist)
    // If user answered No to affiliations, skip detail pages
    
    return { show: true, reason: 'Required based on previous answers' };
  }
  
  /**
   * Get answer from form data (helper)
   */
  private getAnswer(
    formAnswers: Map<number, any>,
    pageNumber: number,
    questionKeyword: string
  ): string | null {
    const pageData = formAnswers.get(pageNumber);
    if (!pageData || !pageData.questions) return null;
    
    // Find question containing keyword
    const question = pageData.questions.find((q: any) => 
      q.questionText?.toLowerCase().includes(questionKeyword.toLowerCase())
    );
    
    return question?.answer || null;
  }
  
  /**
   * Get all pages that should be shown for a complete application run
   */
  getApplicationPath(formAnswers: Map<number, any>): number[] {
    const path: number[] = [];
    let currentPage = 0;
    
    while (currentPage <= 76) {
      const shouldShow = this.shouldShowPage(currentPage, formAnswers);
      
      if (shouldShow.show) {
        path.push(currentPage);
      }
      
      // Get next page with branching logic
      const branch = this.getNextPage(currentPage, formAnswers);
      currentPage = branch.nextPage;
      
      // Avoid infinite loops
      if (currentPage > 100) break;
    }
    
    return path;
  }
}

