import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface UIComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: UIComponent[];
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  style?: Record<string, any>;
}

interface UIModification {
  id: string;
  type: 'create' | 'update' | 'delete' | 'resize' | 'move' | 'style';
  target: string;
  changes: Record<string, any>;
  timestamp: Date;
}

interface UIState {
  components: Record<string, UIComponent>;
  modifications: UIModification[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    sidebarWidth: number;
    headerHeight: number;
  };
  pages: Record<string, {
    id: string;
    name: string;
    path: string;
    components: string[];
  }>;
}

interface UIStateContextType {
  uiState: UIState;
  createComponent: (component: UIComponent) => void;
  updateComponent: (id: string, changes: Partial<UIComponent>) => void;
  deleteComponent: (id: string) => void;
  resizeComponent: (id: string, size: { width: number; height: number }) => void;
  moveComponent: (id: string, position: { x: number; y: number }) => void;
  updateStyle: (id: string, style: Record<string, any>) => void;
  updateTheme: (theme: Partial<UIState['theme']>) => void;
  createPage: (page: { id: string; name: string; path: string; components: string[] }) => void;
  addModification: (modification: Omit<UIModification, 'id' | 'timestamp'>) => void;
  getComponent: (id: string) => UIComponent | undefined;
  getAllComponents: () => UIComponent[];
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

const defaultUIState: UIState = {
  components: {},
  modifications: [],
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    sidebarWidth: 256,
    headerHeight: 64,
  },
  pages: {
    dashboard: {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/',
      components: ['dashboard-stats', 'dashboard-charts']
    },
    companies: {
      id: 'companies',
      name: 'Companies',
      path: '/companies',
      components: ['companies-list', 'companies-filters']
    }
  }
};

export const UIStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uiState, setUIState] = useState<UIState>(defaultUIState);

  const createComponent = useCallback((component: UIComponent) => {
    setUIState(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [component.id]: component
      },
      modifications: [...prev.modifications, {
        id: Date.now().toString(),
        type: 'create',
        target: component.id,
        changes: component,
        timestamp: new Date()
      }]
    }));
  }, []);

  const updateComponent = useCallback((id: string, changes: Partial<UIComponent>) => {
    setUIState(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [id]: {
          ...prev.components[id],
          ...changes
        }
      },
      modifications: [...prev.modifications, {
        id: Date.now().toString(),
        type: 'update',
        target: id,
        changes,
        timestamp: new Date()
      }]
    }));
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setUIState(prev => {
      const newComponents = { ...prev.components };
      delete newComponents[id];
      return {
        ...prev,
        components: newComponents,
        modifications: [...prev.modifications, {
          id: Date.now().toString(),
          type: 'delete',
          target: id,
          changes: {},
          timestamp: new Date()
        }]
      };
    });
  }, []);

  const resizeComponent = useCallback((id: string, size: { width: number; height: number }) => {
    setUIState(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [id]: {
          ...prev.components[id],
          size: {
            ...prev.components[id].size,
            ...size
          }
        }
      },
      modifications: [...prev.modifications, {
        id: Date.now().toString(),
        type: 'resize',
        target: id,
        changes: { size },
        timestamp: new Date()
      }]
    }));
  }, []);

  const moveComponent = useCallback((id: string, position: { x: number; y: number }) => {
    setUIState(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [id]: {
          ...prev.components[id],
          position: {
            ...prev.components[id].position,
            ...position
          }
        }
      },
      modifications: [...prev.modifications, {
        id: Date.now().toString(),
        type: 'move',
        target: id,
        changes: { position },
        timestamp: new Date()
      }]
    }));
  }, []);

  const updateStyle = useCallback((id: string, style: Record<string, any>) => {
    setUIState(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [id]: {
          ...prev.components[id],
          style: {
            ...prev.components[id].style,
            ...style
          }
        }
      },
      modifications: [...prev.modifications, {
        id: Date.now().toString(),
        type: 'style',
        target: id,
        changes: { style },
        timestamp: new Date()
      }]
    }));
  }, []);

  const updateTheme = useCallback((theme: Partial<UIState['theme']>) => {
    setUIState(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        ...theme
      },
      modifications: [...prev.modifications, {
        id: Date.now().toString(),
        type: 'update',
        target: 'theme',
        changes: theme,
        timestamp: new Date()
      }]
    }));
  }, []);

  const createPage = useCallback((page: { id: string; name: string; path: string; components: string[] }) => {
    setUIState(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [page.id]: page
      },
      modifications: [...prev.modifications, {
        id: Date.now().toString(),
        type: 'create',
        target: `page-${page.id}`,
        changes: page,
        timestamp: new Date()
      }]
    }));
  }, []);

  const addModification = useCallback((modification: Omit<UIModification, 'id' | 'timestamp'>) => {
    setUIState(prev => ({
      ...prev,
      modifications: [...prev.modifications, {
        ...modification,
        id: Date.now().toString(),
        timestamp: new Date()
      }]
    }));
  }, []);

  const getComponent = useCallback((id: string) => {
    return uiState.components[id];
  }, [uiState.components]);

  const getAllComponents = useCallback(() => {
    return Object.values(uiState.components);
  }, [uiState.components]);

  const value: UIStateContextType = {
    uiState,
    createComponent,
    updateComponent,
    deleteComponent,
    resizeComponent,
    moveComponent,
    updateStyle,
    updateTheme,
    createPage,
    addModification,
    getComponent,
    getAllComponents,
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
};

export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
};
