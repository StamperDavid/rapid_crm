/**
 * Smart Input Filler
 * Intelligently fills form inputs and verifies they were filled
 */

import { ExtractedQuestion } from './IntelligentFormReader';
import { AnswerDecision } from './SemanticQuestionMatcher';

export interface FillResult {
  success: boolean;
  filledCount: number;
  totalInputs: number;
  error?: string;
  actualValue?: string | string[];  // What was actually filled
}

export class SmartInputFiller {
  /**
   * Fill a question's inputs with the provided answer
   */
  fillQuestion(
    question: ExtractedQuestion,
    answer: AnswerDecision,
    iframeDoc: Document
  ): FillResult {
    const { inputElements, inputType } = question;
    
    if (inputElements.length === 0) {
      return {
        success: false,
        filledCount: 0,
        totalInputs: 0,
        error: 'No input elements found for question'
      };
    }
    
    let filledCount = 0;
    
    try {
      switch (inputType) {
        case 'radio':
          filledCount = this.fillRadio(inputElements, answer.value as string, iframeDoc);
          break;
          
        case 'checkbox':
          filledCount = this.fillCheckbox(inputElements, answer.value, iframeDoc);
          break;
          
        case 'text':
        case 'textarea':
          filledCount = this.fillText(inputElements, answer.value as string, iframeDoc);
          break;
          
        case 'select':
          filledCount = this.fillSelect(inputElements, answer.value as string, iframeDoc);
          break;
      }
      
      // Verify at least one input was filled
      const verified = this.verifyFilled(inputElements, answer.value);
      
      return {
        success: filledCount > 0 && verified,
        filledCount,
        totalInputs: inputElements.length,
        actualValue: this.getActualValue(inputElements, inputType)
      };
      
    } catch (error) {
      return {
        success: false,
        filledCount,
        totalInputs: inputElements.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Fill radio button
   */
  private fillRadio(inputs: HTMLInputElement[], value: string, doc: Document): number {
    // Normalize the value for comparison (Y/N, Yes/No, etc.)
    const normalizedValue = this.normalizeValue(value);
    
    for (const input of inputs) {
      const inputValue = input.getAttribute('value') || '';
      const normalizedInputValue = this.normalizeValue(inputValue);
      
      // Also check the label text
      const inputId = input.getAttribute('id');
      let labelText = '';
      if (inputId) {
        const label = doc.querySelector(`label[for="${inputId}"]`);
        labelText = label?.textContent?.trim() || '';
      }
      const normalizedLabelText = this.normalizeValue(labelText);
      
      // Match by value or label text
      if (normalizedInputValue === normalizedValue || normalizedLabelText === normalizedValue) {
        // Scroll to element
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight
        this.highlightInput(input);
        
        // Check the radio button
        input.checked = true;
        
        // Trigger change event
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('click', { bubbles: true }));
        
        // Remove highlight after a delay
        setTimeout(() => this.removeHighlight(input), 500);
        
        return 1;
      }
    }
    
    return 0;
  }
  
  /**
   * Fill checkbox(es)
   */
  private fillCheckbox(inputs: HTMLInputElement[], value: string | string[], doc: Document): number {
    const values = Array.isArray(value) ? value : [value];
    const normalizedValues = values.map(v => this.normalizeValue(v));
    let filledCount = 0;
    
    for (const input of inputs) {
      const inputValue = input.getAttribute('value') || '';
      const normalizedInputValue = this.normalizeValue(inputValue);
      
      // Also check label text
      const inputId = input.getAttribute('id');
      let labelText = '';
      if (inputId) {
        const label = doc.querySelector(`label[for="${inputId}"]`);
        labelText = label?.textContent?.trim() || '';
      }
      const normalizedLabelText = this.normalizeValue(labelText);
      
      // Check if this checkbox should be checked
      const shouldCheck = normalizedValues.some(v => 
        v === normalizedInputValue || v === normalizedLabelText
      );
      
      if (shouldCheck) {
        // Scroll to element
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight
        this.highlightInput(input);
        
        // Check the checkbox
        input.checked = true;
        
        // Trigger change event
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('click', { bubbles: true }));
        
        // Remove highlight after a delay
        setTimeout(() => this.removeHighlight(input), 500);
        
        filledCount++;
      }
    }
    
    return filledCount;
  }
  
  /**
   * Fill text input
   */
  private fillText(inputs: HTMLInputElement[], value: string, doc: Document): number {
    if (inputs.length === 0) return 0;
    
    const input = inputs[0]; // Use first text input
    
    // Scroll to element
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Highlight
    this.highlightInput(input);
    
    // Set value
    input.value = value;
    
    // Trigger events
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    
    // Remove highlight after a delay
    setTimeout(() => this.removeHighlight(input), 500);
    
    return 1;
  }
  
  /**
   * Fill select dropdown
   */
  private fillSelect(inputs: HTMLInputElement[], value: string, doc: Document): number {
    if (inputs.length === 0) return 0;
    
    const select = inputs[0] as any; // Cast to allow select-specific properties
    if (!(select instanceof HTMLSelectElement)) return 0;
    
    // Scroll to element
    select.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Highlight
    this.highlightInput(select);
    
    // Find and select the option
    const normalizedValue = this.normalizeValue(value);
    
    for (const option of Array.from(select.options)) {
      const optionValue = this.normalizeValue(option.value);
      const optionText = this.normalizeValue(option.text);
      
      if (optionValue === normalizedValue || optionText === normalizedValue) {
        select.value = option.value;
        option.selected = true;
        break;
      }
    }
    
    // Trigger events
    select.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Remove highlight after a delay
    setTimeout(() => this.removeHighlight(select), 500);
    
    return 1;
  }
  
  /**
   * Normalize a value for comparison (handle Y/N, Yes/No, etc.)
   */
  private normalizeValue(value: string): string {
    const normalized = value.toLowerCase().trim();
    
    // Map common variations
    if (normalized === 'y' || normalized === 'yes') return 'yes';
    if (normalized === 'n' || normalized === 'no') return 'no';
    
    return normalized;
  }
  
  /**
   * Highlight input to show it's being filled
   */
  private highlightInput(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): void {
    const originalStyle = {
      backgroundColor: input.style.backgroundColor,
      border: input.style.border,
      transition: input.style.transition,
      transform: input.style.transform,
      boxShadow: input.style.boxShadow
    };
    
    // Store original style
    (input as any).__originalStyle = originalStyle;
    
    // Apply highlight
    input.style.backgroundColor = '#fbbf24';
    input.style.border = '3px solid #f59e0b';
    input.style.transition = 'all 0.3s ease';
    input.style.transform = 'scale(1.05)';
    input.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.5)';
  }
  
  /**
   * Remove highlight from input
   */
  private removeHighlight(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): void {
    const originalStyle = (input as any).__originalStyle;
    
    if (originalStyle) {
      input.style.backgroundColor = originalStyle.backgroundColor;
      input.style.border = originalStyle.border;
      input.style.transition = originalStyle.transition;
      input.style.transform = originalStyle.transform;
      input.style.boxShadow = originalStyle.boxShadow;
    } else {
      // Fallback: just reset
      input.style.backgroundColor = '';
      input.style.border = '';
      input.style.transition = '';
      input.style.transform = '';
      input.style.boxShadow = '';
    }
  }
  
  /**
   * Verify that inputs were actually filled
   */
  private verifyFilled(inputs: HTMLInputElement[], expectedValue: string | string[]): boolean {
    if (inputs.length === 0) return false;
    
    const firstInput = inputs[0];
    const inputType = firstInput.getAttribute('type') || 'text';
    
    if (inputType === 'radio' || inputType === 'checkbox') {
      // At least one should be checked
      return inputs.some(input => input.checked);
    } else {
      // Should have a value
      return firstInput.value && firstInput.value.trim().length > 0;
    }
  }
  
  /**
   * Get the actual value that was filled
   */
  private getActualValue(inputs: HTMLInputElement[], inputType: string): string | string[] {
    if (inputType === 'checkbox') {
      // Return array of checked values
      return inputs
        .filter(input => input.checked)
        .map(input => input.value);
    } else if (inputType === 'radio') {
      // Return the checked value
      const checked = inputs.find(input => input.checked);
      return checked ? checked.value : '';
    } else {
      // Return the text value
      return inputs[0]?.value || '';
    }
  }
}

