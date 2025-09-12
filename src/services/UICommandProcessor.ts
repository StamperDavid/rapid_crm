interface UICommand {
  action: string;
  target?: string;
  parameters: Record<string, any>;
  confidence: number;
}

interface CommandResult {
  success: boolean;
  message: string;
  action?: string;
  data?: any;
}

export class UICommandProcessor {
  private uiState: any;
  private updateUIState: any;

  constructor(uiState: any, updateUIState: any) {
    this.uiState = uiState;
    this.updateUIState = updateUIState;
  }

  async processCommand(command: string): Promise<CommandResult> {
    const lowerCommand = command.toLowerCase();
    
    try {
      // Parse the command
      const parsedCommand = this.parseCommand(lowerCommand);
      
      if (!parsedCommand) {
        return {
          success: false,
          message: "I didn't understand that command. Try saying something like 'make the deals table bigger' or 'add a button to the companies page'."
        };
      }

      // Execute the command
      return await this.executeCommand(parsedCommand);
    } catch (error) {
      return {
        success: false,
        message: `Sorry, I encountered an error: ${error}`
      };
    }
  }

  private parseCommand(command: string): UICommand | null {
    // Resize commands
    if (this.matchesPattern(command, ['make', 'bigger', 'larger', 'wider', 'taller'])) {
      const target = this.extractTarget(command, ['deals', 'companies', 'sidebar', 'table', 'window', 'modal']);
      const size = this.extractSize(command);
      return {
        action: 'resize',
        target,
        parameters: { size },
        confidence: 0.9
      };
    }

    if (this.matchesPattern(command, ['make', 'smaller', 'narrower', 'shorter'])) {
      const target = this.extractTarget(command, ['deals', 'companies', 'sidebar', 'table', 'window', 'modal']);
      const size = this.extractSize(command, 'smaller');
      return {
        action: 'resize',
        target,
        parameters: { size },
        confidence: 0.9
      };
    }

    // Add component commands
    if (this.matchesPattern(command, ['add', 'create', 'new'])) {
      const componentType = this.extractComponentType(command);
      const target = this.extractTarget(command, ['companies', 'deals', 'dashboard', 'page']);
      return {
        action: 'add_component',
        target,
        parameters: { componentType, target },
        confidence: 0.8
      };
    }

    // Color/theme commands
    if (this.matchesPattern(command, ['change', 'color', 'theme'])) {
      const color = this.extractColor(command);
      const target = this.extractTarget(command, ['sidebar', 'header', 'background', 'theme']);
      return {
        action: 'change_color',
        target,
        parameters: { color, target },
        confidence: 0.8
      };
    }

    // Move commands
    if (this.matchesPattern(command, ['move', 'position', 'relocate'])) {
      const target = this.extractTarget(command, ['sidebar', 'header', 'button', 'modal']);
      const position = this.extractPosition(command);
      return {
        action: 'move',
        target,
        parameters: { position },
        confidence: 0.7
      };
    }

    // Create page commands
    if (this.matchesPattern(command, ['create', 'new', 'page'])) {
      const pageName = this.extractPageName(command);
      return {
        action: 'create_page',
        parameters: { pageName },
        confidence: 0.8
      };
    }

    return null;
  }

  private async executeCommand(command: UICommand): Promise<CommandResult> {
    switch (command.action) {
      case 'resize':
        return this.handleResize(command);
      case 'add_component':
        return this.handleAddComponent(command);
      case 'change_color':
        return this.handleChangeColor(command);
      case 'move':
        return this.handleMove(command);
      case 'create_page':
        return this.handleCreatePage(command);
      default:
        return {
          success: false,
          message: "I don't know how to handle that command yet."
        };
    }
  }

  private async handleResize(command: UICommand): Promise<CommandResult> {
    const { target, parameters } = command;
    
    if (!target) {
      return {
        success: false,
        message: "I need to know what to resize. Try saying 'make the deals table bigger' or 'make the sidebar wider'."
      };
    }

    // Map target names to component IDs
    const targetMap: Record<string, string> = {
      'deals': 'deals-table',
      'companies': 'companies-list',
      'sidebar': 'sidebar',
      'table': 'deals-table',
      'window': 'main-window',
      'modal': 'active-modal'
    };

    const componentId = targetMap[target] || target;
    
    // Calculate new size
    const currentComponent = this.uiState.getComponent(componentId);
    if (!currentComponent) {
      return {
        success: false,
        message: `I couldn't find the ${target} component to resize.`
      };
    }

    const currentSize = currentComponent.size || { width: 100, height: 100 };
    const sizeChange = parameters.size || { width: 1.2, height: 1.2 };
    
    const newSize = {
      width: Math.round(currentSize.width * sizeChange.width),
      height: Math.round(currentSize.height * sizeChange.height)
    };

    this.uiState.resizeComponent(componentId, newSize);

    return {
      success: true,
      message: `I've made the ${target} ${newSize.width > currentSize.width ? 'bigger' : 'smaller'}.`,
      action: 'resize',
      data: { componentId, newSize }
    };
  }

  private async handleAddComponent(command: UICommand): Promise<CommandResult> {
    const { target, parameters } = command;
    const componentType = parameters.componentType || 'button';
    
    const componentId = `${target}-${componentType}-${Date.now()}`;
    
    const newComponent = {
      id: componentId,
      type: componentType,
      props: {
        text: `New ${componentType}`,
        onClick: () => console.log(`${componentType} clicked`)
      },
      position: { x: 100, y: 100 },
      size: { width: 120, height: 40 }
    };

    this.uiState.createComponent(newComponent);

    return {
      success: true,
      message: `I've added a new ${componentType} to the ${target} page.`,
      action: 'add_component',
      data: { componentId, componentType }
    };
  }

  private async handleChangeColor(command: UICommand): Promise<CommandResult> {
    const { target, parameters } = command;
    const color = parameters.color || '#3b82f6';
    
    if (target === 'theme' || !target) {
      this.uiState.updateTheme({ primaryColor: color });
      return {
        success: true,
        message: `I've changed the theme color to ${color}.`,
        action: 'change_theme',
        data: { color }
      };
    }

    const componentId = this.getComponentIdFromTarget(target);
    if (componentId) {
      this.uiState.updateStyle(componentId, { backgroundColor: color });
      return {
        success: true,
        message: `I've changed the ${target} color to ${color}.`,
        action: 'change_color',
        data: { componentId, color }
      };
    }

    return {
      success: false,
      message: `I couldn't find the ${target} to change its color.`
    };
  }

  private async handleMove(command: UICommand): Promise<CommandResult> {
    const { target, parameters } = command;
    const position = parameters.position || { x: 200, y: 200 };
    
    const componentId = this.getComponentIdFromTarget(target);
    if (!componentId) {
      return {
        success: false,
        message: `I couldn't find the ${target} to move.`
      };
    }

    this.uiState.moveComponent(componentId, position);

    return {
      success: true,
      message: `I've moved the ${target} to the new position.`,
      action: 'move',
      data: { componentId, position }
    };
  }

  private async handleCreatePage(command: UICommand): Promise<CommandResult> {
    const { parameters } = command;
    const pageName = parameters.pageName || 'New Page';
    
    const pageId = pageName.toLowerCase().replace(/\s+/g, '-');
    const pagePath = `/${pageId}`;
    
    const newPage = {
      id: pageId,
      name: pageName,
      path: pagePath,
      components: []
    };

    this.uiState.createPage(newPage);

    return {
      success: true,
      message: `I've created a new page called "${pageName}".`,
      action: 'create_page',
      data: { pageId, pageName, pagePath }
    };
  }

  // Helper methods
  private matchesPattern(command: string, patterns: string[]): boolean {
    return patterns.some(pattern => command.includes(pattern));
  }

  private extractTarget(command: string, possibleTargets: string[]): string | null {
    for (const target of possibleTargets) {
      if (command.includes(target)) {
        return target;
      }
    }
    return null;
  }

  private extractSize(command: string, direction: 'bigger' | 'smaller' = 'bigger'): { width: number; height: number } {
    if (direction === 'bigger') {
      if (command.includes('much') || command.includes('significantly')) {
        return { width: 1.5, height: 1.5 };
      }
      return { width: 1.2, height: 1.2 };
    } else {
      if (command.includes('much') || command.includes('significantly')) {
        return { width: 0.7, height: 0.7 };
      }
      return { width: 0.8, height: 0.8 };
    }
  }

  private extractComponentType(command: string): string {
    if (command.includes('button')) return 'button';
    if (command.includes('modal')) return 'modal';
    if (command.includes('form')) return 'form';
    if (command.includes('table')) return 'table';
    if (command.includes('chart')) return 'chart';
    if (command.includes('card')) return 'card';
    return 'button';
  }

  private extractColor(command: string): string {
    const colors: Record<string, string> = {
      'blue': '#3b82f6',
      'red': '#ef4444',
      'green': '#10b981',
      'yellow': '#f59e0b',
      'purple': '#8b5cf6',
      'pink': '#ec4899',
      'gray': '#6b7280',
      'black': '#000000',
      'white': '#ffffff'
    };

    for (const [colorName, hex] of Object.entries(colors)) {
      if (command.includes(colorName)) {
        return hex;
      }
    }

    return '#3b82f6'; // Default blue
  }

  private extractPosition(command: string): { x: number; y: number } {
    // Simple position extraction - could be enhanced
    if (command.includes('top')) return { x: 100, y: 50 };
    if (command.includes('bottom')) return { x: 100, y: 400 };
    if (command.includes('left')) return { x: 50, y: 200 };
    if (command.includes('right')) return { x: 300, y: 200 };
    if (command.includes('center')) return { x: 200, y: 200 };
    
    return { x: 200, y: 200 }; // Default center
  }

  private extractPageName(command: string): string {
    // Extract page name from command
    const patterns = [
      /create (?:a )?new page (?:called )?["']?([^"']+)["']?/i,
      /new page (?:called )?["']?([^"']+)["']?/i,
      /page (?:called )?["']?([^"']+)["']?/i
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return 'New Page';
  }

  private getComponentIdFromTarget(target: string): string | null {
    const targetMap: Record<string, string> = {
      'sidebar': 'sidebar',
      'header': 'header',
      'button': 'main-button',
      'modal': 'active-modal',
      'deals': 'deals-table',
      'companies': 'companies-list'
    };

    return targetMap[target] || null;
  }
}
