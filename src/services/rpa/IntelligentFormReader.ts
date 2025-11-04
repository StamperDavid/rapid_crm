/**
 * Intelligent Form Reader
 * Analyzes form DOM to extract questions and understand their meaning
 * WITHOUT relying on hard-coded field IDs
 */

export interface ExtractedQuestion {
  questionText: string;
  questionElement: Element;
  inputElements: HTMLInputElement[];
  inputType: 'radio' | 'checkbox' | 'text' | 'select' | 'textarea';
  answerOptions?: string[]; // For radio/checkbox/select
  context: {
    sectionTitle?: string;
    pageTitle?: string;
    tooltip?: string;
    description?: string;
  };
}

export class IntelligentFormReader {
  /**
   * Extract all questions from a form document
   */
  extractQuestions(iframeDoc: Document): ExtractedQuestion[] {
    const questions: ExtractedQuestion[] = [];
    
    // Find all question labels
    const questionLabels = iframeDoc.querySelectorAll('.questionDesc, label[id^="questionDesc"]');
    
    questionLabels.forEach(questionEl => {
      const extracted = this.analyzeQuestion(questionEl, iframeDoc);
      if (extracted) {
        questions.push(extracted);
      }
    });
    
    return questions;
  }
  
  /**
   * Analyze a single question element and find its inputs
   */
  private analyzeQuestion(questionEl: Element, doc: Document): ExtractedQuestion | null {
    // Get question text
    const questionText = this.extractQuestionText(questionEl);
    if (!questionText || questionText.trim().length === 0) {
      return null;
    }
    
    // Find associated inputs
    const inputs = this.findInputsForQuestion(questionEl, doc);
    if (inputs.length === 0) {
      return null;
    }
    
    // Determine input type
    const inputType = this.determineInputType(inputs);
    
    // Extract answer options for radio/checkbox/select
    const answerOptions = this.extractAnswerOptions(questionEl, inputs, inputType);
    
    // Extract context (section title, tooltip, etc.)
    const context = this.extractContext(questionEl, doc);
    
    return {
      questionText,
      questionElement: questionEl,
      inputElements: inputs,
      inputType,
      answerOptions,
      context
    };
  }
  
  /**
   * Extract clean question text, removing tooltips and extra elements
   */
  private extractQuestionText(questionEl: Element): string {
    const clone = questionEl.cloneNode(true) as Element;
    
    // Remove tooltip spans
    clone.querySelectorAll('.wizardTooltip').forEach(el => el.remove());
    
    // Remove question description spans (the "(Select all that apply)" etc.)
    clone.querySelectorAll('.questionDescription').forEach(el => el.remove());
    
    // Get text content
    let text = clone.textContent || '';
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }
  
  /**
   * Find input elements associated with a question
   * Uses DOM proximity, not IDs
   */
  private findInputsForQuestion(questionEl: Element, doc: Document): HTMLInputElement[] {
    const inputs: HTMLInputElement[] = [];
    
    // Strategy 1: Look for inputs in the same table or container
    let container = questionEl.closest('table, form, div.questionContainer');
    if (!container) {
      container = questionEl.parentElement;
    }
    
    if (container) {
      const containerInputs = container.querySelectorAll('input, select, textarea');
      containerInputs.forEach(input => {
        if (input instanceof HTMLInputElement || 
            input instanceof HTMLSelectElement || 
            input instanceof HTMLTextAreaElement) {
          inputs.push(input as HTMLInputElement);
        }
      });
    }
    
    // Strategy 2: If no inputs found, look for inputs after this question
    if (inputs.length === 0) {
      const allInputs = Array.from(doc.querySelectorAll('input, select, textarea'));
      const questionIndex = Array.from(doc.querySelectorAll('.questionDesc')).indexOf(questionEl);
      
      // Get inputs that come after this question but before the next question
      const nextQuestion = doc.querySelectorAll('.questionDesc')[questionIndex + 1];
      
      for (const input of allInputs) {
        // Check if input comes after question
        if (this.elementComesAfter(input, questionEl)) {
          // If there's a next question, stop before it
          if (nextQuestion && this.elementComesAfter(input, nextQuestion)) {
            break;
          }
          inputs.push(input as HTMLInputElement);
        }
      }
    }
    
    return inputs;
  }
  
  /**
   * Check if element A comes after element B in DOM order
   */
  private elementComesAfter(elementA: Element, elementB: Element): boolean {
    const position = elementB.compareDocumentPosition(elementA);
    return (position & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  }
  
  /**
   * Determine input type based on input elements
   */
  private determineInputType(inputs: HTMLInputElement[]): 'radio' | 'checkbox' | 'text' | 'select' | 'textarea' {
    if (inputs.length === 0) return 'text';
    
    const firstInput = inputs[0];
    
    if (firstInput instanceof HTMLSelectElement) return 'select';
    if (firstInput instanceof HTMLTextAreaElement) return 'textarea';
    
    const type = firstInput.getAttribute('type') || 'text';
    
    if (type === 'radio') return 'radio';
    if (type === 'checkbox') return 'checkbox';
    
    return 'text';
  }
  
  /**
   * Extract answer options for radio/checkbox/select inputs
   */
  private extractAnswerOptions(
    questionEl: Element, 
    inputs: HTMLInputElement[], 
    inputType: string
  ): string[] | undefined {
    if (inputType !== 'radio' && inputType !== 'checkbox' && inputType !== 'select') {
      return undefined;
    }
    
    const options: string[] = [];
    
    inputs.forEach(input => {
      // Get label associated with this input
      const inputId = input.getAttribute('id');
      let label: Element | null = null;
      
      if (inputId) {
        label = questionEl.ownerDocument?.querySelector(`label[for="${inputId}"]`) || null;
      }
      
      // If no label found by 'for' attribute, look for label as sibling
      if (!label) {
        label = input.nextElementSibling;
        if (label && label.tagName !== 'LABEL') {
          label = input.parentElement?.querySelector('label') || null;
        }
      }
      
      const labelText = label?.textContent?.trim() || input.getAttribute('value') || '';
      if (labelText) {
        options.push(labelText);
      }
    });
    
    return options.length > 0 ? options : undefined;
  }
  
  /**
   * Extract context information (section title, tooltips, etc.)
   */
  private extractContext(questionEl: Element, doc: Document): {
    sectionTitle?: string;
    pageTitle?: string;
    tooltip?: string;
    description?: string;
  } {
    const context: any = {};
    
    // Find section title
    const sectionTitle = doc.querySelector('.pageSectionTitleLabel');
    if (sectionTitle) {
      context.sectionTitle = sectionTitle.textContent?.trim();
    }
    
    // Find page title
    const pageTitle = doc.querySelector('.pageTitleDiv .heavy');
    if (pageTitle) {
      context.pageTitle = pageTitle.textContent?.trim();
    }
    
    // Extract tooltip
    const tooltipSpan = questionEl.querySelector('.wizardTooltip');
    if (tooltipSpan) {
      const onmouseover = tooltipSpan.getAttribute('onmouseover');
      if (onmouseover) {
        // Extract tooltip text from the showHelp() call
        const match = onmouseover.match(/showHelp\(this,\s*'([^']*)'/);
        if (match && match[1]) {
          context.tooltip = match[1]
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
        }
      }
    }
    
    // Extract question description (like "(Select all that apply)")
    const descSpan = questionEl.querySelector('.questionDescription');
    if (descSpan) {
      context.description = descSpan.textContent?.trim();
    }
    
    return context;
  }
}

