
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  EyeIcon,
  CogIcon,
  ChatIcon,
  UserIcon,
  DocumentTextIcon,
  MailIcon,
  MicrophoneIcon,
  SpeakerphoneIcon,
  PlayIcon,
  PauseIcon,
  RefreshIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  DuplicateIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsExpandIcon,
  ColorSwatchIcon,
  PhotographIcon,
  CodeIcon,
  TemplateIcon,
  DeviceMobileIcon,
  DeviceTabletIcon,
  DesktopComputerIcon,
  SparklesIcon,
  CubeIcon,
  ChartSquareBarIcon,
} from '@heroicons/react/outline';
import LoginPageDesigner from '../../../components/LoginPageDesigner';
import AvatarPreview from '../../../components/AvatarPreview';

// Types for Elementor-level functionality
interface DragDropComponent {
  id: string;
  type: 'text' | 'image' | 'button' | 'form' | 'chart' | 'video' | 'spacer' | 'divider' | 'icon' | 'custom';
  name: string;
  icon: React.ReactNode;
  category: 'basic' | 'media' | 'forms' | 'data' | 'layout' | 'advanced';
  defaultProps: any;
  preview: string;
}

interface PortalElement {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  props: any;
  styles: any;
  responsive: {
    desktop: any;
    tablet: any;
    mobile: any;
  };
  animations: {
    entrance: string;
    hover: string;
    exit: string;
  };
  customCSS: string;
  visible: boolean;
  locked: boolean;
}

interface PortalTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  elements: PortalElement[];
  category: 'business' | 'transportation' | 'compliance' | 'custom';
}

interface ResponsiveBreakpoint {
  name: 'desktop' | 'tablet' | 'mobile';
  width: number;
  icon: React.ReactNode;
}

// Available drag-and-drop components
const DRAG_DROP_COMPONENTS: DragDropComponent[] = [
  {
    id: 'text',
    type: 'text',
    name: 'Text Block',
    icon: <DocumentTextIcon className="h-5 w-5" />,
    category: 'basic',
    defaultProps: { content: 'Your text here', fontSize: 16, fontWeight: 'normal' },
    preview: 'Text Block'
  },
  {
    id: 'image',
    type: 'image',
    name: 'Image',
    icon: <PhotographIcon className="h-5 w-5" />,
    category: 'media',
    defaultProps: { src: '', alt: 'Image', width: 300, height: 200 },
    preview: 'Image'
  },
  {
    id: 'button',
    type: 'button',
    name: 'Button',
    icon: <CubeIcon className="h-5 w-5" />,
    category: 'basic',
    defaultProps: { text: 'Click Me', variant: 'primary', size: 'medium' },
    preview: 'Button'
  },
  {
    id: 'form',
    type: 'form',
    name: 'Contact Form',
    icon: <MailIcon className="h-5 w-5" />,
    category: 'forms',
    defaultProps: { fields: ['name', 'email', 'message'], submitText: 'Submit' },
    preview: 'Contact Form'
  },
  {
    id: 'chart',
    type: 'chart',
    name: 'Data Chart',
    icon: <ChartSquareBarIcon className="h-5 w-5" />,
    category: 'data',
    defaultProps: { type: 'bar', data: [], title: 'Chart' },
    preview: 'Data Chart'
  },
  {
    id: 'spacer',
    type: 'spacer',
    name: 'Spacer',
    icon: <ArrowsExpandIcon className="h-5 w-5" />,
    category: 'layout',
    defaultProps: { height: 50 },
    preview: 'Spacer'
  },
  {
    id: 'divider',
    type: 'divider',
    name: 'Divider',
    icon: <div className="h-5 w-5 border-t-2 border-gray-400" />,
    category: 'layout',
    defaultProps: { style: 'solid', color: '#e5e7eb', thickness: 1 },
    preview: 'Divider'
  }
];

// Responsive breakpoints
const RESPONSIVE_BREAKPOINTS: ResponsiveBreakpoint[] = [
  { name: 'desktop', width: 1200, icon: <DesktopComputerIcon className="h-4 w-4" /> },
  { name: 'tablet', width: 768, icon: <DeviceTabletIcon className="h-4 w-4" /> },
  { name: 'mobile', width: 375, icon: <DeviceMobileIcon className="h-4 w-4" /> }
];

// Animation options
const ANIMATION_OPTIONS = {
  entrance: ['fadeIn', 'slideInUp', 'slideInDown', 'slideInLeft', 'slideInRight', 'zoomIn', 'bounceIn'],
  hover: ['pulse', 'bounce', 'shake', 'glow', 'scale', 'rotate'],
  exit: ['fadeOut', 'slideOutUp', 'slideOutDown', 'slideOutLeft', 'slideOutRight', 'zoomOut']
};

const ClientPortalDesigner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'design' | 'preview' | 'templates' | 'settings' | 'login' | 'avatars'>('design');
  const [activeBreakpoint, setActiveBreakpoint] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [portalElements, setPortalElements] = useState<PortalElement[]>([]);
  const [templates, setTemplates] = useState<PortalTemplate[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(true);
  const [showStylePanel, setShowStylePanel] = useState(true);
  const [customCSS, setCustomCSS] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState<DragDropComponent | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Initialize with default template
  useEffect(() => {
    const defaultTemplate: PortalTemplate = {
      id: 'default',
      name: 'Default Portal',
      description: 'Basic client portal layout',
      thumbnail: '',
      category: 'business',
      elements: [
        {
          id: 'header-1',
          type: 'text',
          name: 'Welcome Header',
          position: { x: 10, y: 10 },
          size: { width: 80, height: 10 },
          props: { content: 'Welcome to Your Portal', fontSize: 24, fontWeight: 'bold' },
          styles: { color: '#1f2937', textAlign: 'center' },
          responsive: { desktop: {}, tablet: {}, mobile: {} },
          animations: { entrance: 'fadeIn', hover: 'none', exit: 'none' },
          customCSS: '',
          visible: true,
          locked: false
        },
        {
          id: 'content-1',
          type: 'text',
          name: 'Main Content',
          position: { x: 10, y: 25 },
          size: { width: 60, height: 40 },
          props: { content: 'Your main content goes here...', fontSize: 16 },
          styles: { color: '#374151', lineHeight: 1.6 },
          responsive: { desktop: {}, tablet: {}, mobile: {} },
          animations: { entrance: 'slideInUp', hover: 'none', exit: 'none' },
          customCSS: '',
          visible: true,
          locked: false
        },
        {
          id: 'sidebar-1',
          type: 'text',
          name: 'Sidebar',
          position: { x: 75, y: 25 },
          size: { width: 20, height: 40 },
          props: { content: 'Sidebar content...', fontSize: 14 },
          styles: { backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' },
          responsive: { desktop: {}, tablet: {}, mobile: {} },
          animations: { entrance: 'slideInRight', hover: 'none', exit: 'none' },
          customCSS: '',
          visible: true,
          locked: false
        }
      ]
    };
    
    setTemplates([defaultTemplate]);
    setPortalElements(defaultTemplate.elements);
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((component: DragDropComponent) => {
    setIsDragging(true);
    setDragPreview(component);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragPreview(null);
  }, []);

  // Handle drop on canvas
  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dragPreview || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newElement: PortalElement = {
      id: `${dragPreview.type}-${Date.now()}`,
      type: dragPreview.type,
      name: dragPreview.name,
      position: { x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) },
      size: { width: 20, height: 10 },
      props: { ...dragPreview.defaultProps },
      styles: {},
      responsive: { desktop: {}, tablet: {}, mobile: {} },
      animations: { entrance: 'fadeIn', hover: 'none', exit: 'none' },
      customCSS: '',
      visible: true,
      locked: false
    };

    setPortalElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    handleDragEnd();
  }, [dragPreview, handleDragEnd]);

  // Handle element selection
  const handleElementSelect = useCallback((elementId: string) => {
    setSelectedElement(elementId);
  }, []);

  // Handle element update
  const handleElementUpdate = useCallback((elementId: string, updates: Partial<PortalElement>) => {
    setPortalElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  }, []);

  // Handle element delete
  const handleElementDelete = useCallback((elementId: string) => {
    setPortalElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  // Get selected element
  const selectedElementData = portalElements.find(el => el.id === selectedElement);

  // Save design
  const saveDesign = useCallback(async () => {
    const design = {
      elements: portalElements,
      customCSS,
      breakpoint: activeBreakpoint,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Save to database via API
      const response = await fetch('/api/client-portal/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(design)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('Design saved successfully');
        alert('Portal design saved successfully!');
      } else {
        console.error('Failed to save design:', result);
        alert('Failed to save portal design. Please try again.');
      }
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Error saving portal design. Please try again.');
    }
  }, [portalElements, customCSS, activeBreakpoint]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Client Portal Designer
            </h1>
            <div className="flex items-center space-x-2">
              {RESPONSIVE_BREAKPOINTS.map(breakpoint => (
                <button
                  key={breakpoint.name}
                  onClick={() => setActiveBreakpoint(breakpoint.name)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    activeBreakpoint === breakpoint.name
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {breakpoint.icon}
                  <span className="capitalize">{breakpoint.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isPreviewMode
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <EyeIcon className="h-4 w-4" />
              {isPreviewMode ? 'Exit Preview' : 'Preview'}
            </button>
            
            <button
              onClick={saveDesign}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckIcon className="h-4 w-4" />
              Save Design
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8 px-6">
          {[
            { id: 'design', label: 'Portal Design', icon: <CogIcon className="h-4 w-4" /> },
            { id: 'login', label: 'Login Page', icon: <UserIcon className="h-4 w-4" /> },
            { id: 'avatars', label: 'Agent Avatars', icon: <UserIcon className="h-4 w-4" /> },
            { id: 'preview', label: 'Preview', icon: <EyeIcon className="h-4 w-4" /> },
            { id: 'templates', label: 'Templates', icon: <TemplateIcon className="h-4 w-4" /> },
            { id: 'settings', label: 'Settings', icon: <CogIcon className="h-4 w-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Show Login Page Designer when login tab is active */}
        {activeTab === 'login' ? (
          <LoginPageDesigner />
        ) : activeTab === 'avatars' ? (
          <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Agent Avatar Designer
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-0">
              <div className="max-w-4xl mx-auto">
                <AvatarPreview 
                  onSelectAvatar={async (config) => {
                    console.log('Selected avatar config:', config);
                    try {
                      const response = await fetch('/api/client-portal/avatar-config', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(config)
                      });
                      
                      const result = await response.json();
                      
                      if (response.ok) {
                        console.log('Avatar configuration saved successfully');
                        alert('Avatar configuration saved!');
                      } else {
                        console.error('Failed to save avatar config:', result);
                        alert('Failed to save avatar configuration.');
                      }
                    } catch (error) {
                      console.error('Error saving avatar config:', error);
                      alert('Error saving avatar configuration.');
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Component Library Sidebar */}
            {showComponentLibrary && activeTab === 'design' && (
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Components
              </h3>
              <button
                onClick={() => setShowComponentLibrary(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2">
              {Object.entries(
                DRAG_DROP_COMPONENTS.reduce((acc, comp) => {
                  if (!acc[comp.category]) acc[comp.category] = [];
                  acc[comp.category].push(comp);
                  return acc;
                }, {} as Record<string, DragDropComponent[]>)
              ).map(([category, components]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                    {category}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {components.map(component => (
                      <div
                        key={component.id}
                        draggable
                        onDragStart={() => handleDragStart(component)}
                        onDragEnd={handleDragEnd}
                        className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {component.icon}
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                          {component.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas */}
          <div className="flex-1 p-4">
            <div
              ref={canvasRef}
              onDrop={handleCanvasDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative w-full h-full bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
              style={{ minHeight: '600px' }}
            >
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }} />
              
              {/* Portal Elements */}
              {portalElements.map(element => (
                <div
                  key={element.id}
                  onClick={() => handleElementSelect(element.id)}
                  className={`absolute border-2 rounded-lg cursor-pointer transition-all ${
                    selectedElement === element.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  } ${!element.visible ? 'opacity-50' : ''}`}
                  style={{
                    left: `${element.position.x}%`,
                    top: `${element.position.y}%`,
                    width: `${element.size.width}%`,
                    height: `${element.size.height}%`,
                    ...element.styles,
                    ...element.responsive[activeBreakpoint]
                  }}
                >
                  <div className="p-2 h-full flex items-center justify-center text-sm">
                    {element.type === 'text' && (
                      <span style={{ fontSize: element.props.fontSize, fontWeight: element.props.fontWeight }}>
                        {element.props.content}
                      </span>
                    )}
                    {element.type === 'image' && (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        {element.props.src ? (
                          <img src={element.props.src} alt={element.props.alt} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <PhotographIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                    )}
                    {element.type === 'button' && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        {element.props.text}
                      </button>
                    )}
                    {element.type === 'spacer' && (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">Spacer</span>
                      </div>
                    )}
                    {element.type === 'divider' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div 
                          className="w-full border-t"
                          style={{ 
                            borderColor: element.props.color,
                            borderWidth: `${element.props.thickness}px`
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Element Controls */}
                  {selectedElement === element.id && (
                    <div className="absolute -top-8 left-0 flex items-center space-x-1 z-50">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleElementDelete(element.id);
                        }}
                        className="p-1.5 bg-red-500 text-white rounded shadow-lg hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Duplicate element
                          const newElement = {
                            ...element,
                            id: `${element.type}-${Date.now()}`,
                            position: { x: element.position.x + 5, y: element.position.y + 5 }
                          };
                          setPortalElements(prev => [...prev, newElement]);
                        }}
                        className="p-1.5 bg-blue-500 text-white rounded shadow-lg hover:bg-blue-600 transition-colors cursor-pointer"
                      >
                        <DuplicateIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Drop Zone Indicator */}
              {isDragging && (
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center">
                  <div className="text-blue-600 dark:text-blue-400 text-lg font-medium">
                    Drop {dragPreview?.name} here
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Style Panel */}
        {showStylePanel && selectedElementData && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Style Panel
              </h3>
              <button
                onClick={() => setShowStylePanel(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Element Properties */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Properties
                </h4>
                {selectedElementData.type === 'text' && (
                  <div className="space-y-2">
                    <textarea
                      value={selectedElementData.props.content}
                      onChange={(e) => handleElementUpdate(selectedElementData.id, {
                        props: { ...selectedElementData.props, content: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm"
                      rows={3}
                    />
                    <input
                      type="number"
                      value={selectedElementData.props.fontSize}
                      onChange={(e) => handleElementUpdate(selectedElementData.id, {
                        props: { ...selectedElementData.props, fontSize: parseInt(e.target.value) }
                      })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm"
                      placeholder="Font Size"
                    />
                  </div>
                )}
              </div>
              
              {/* Responsive Controls */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Responsive
                </h4>
                <div className="space-y-2">
                  {RESPONSIVE_BREAKPOINTS.map(breakpoint => (
                    <div key={breakpoint.name} className="flex items-center space-x-2">
                      {breakpoint.icon}
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {breakpoint.name}
                      </span>
                      <input
                        type="number"
                        value={selectedElementData.responsive[breakpoint.name].width || selectedElementData.size.width}
                        onChange={(e) => handleElementUpdate(selectedElementData.id, {
                          responsive: {
                            ...selectedElementData.responsive,
                            [breakpoint.name]: {
                              ...selectedElementData.responsive[breakpoint.name],
                              width: parseInt(e.target.value)
                            }
                          }
                        })}
                        className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded text-xs"
                        placeholder="Width %"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Animations */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Animations
                </h4>
                <div className="space-y-2">
                  <select
                    value={selectedElementData.animations.entrance}
                    onChange={(e) => handleElementUpdate(selectedElementData.id, {
                      animations: { ...selectedElementData.animations, entrance: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm"
                  >
                    <option value="none">No Animation</option>
                    {ANIMATION_OPTIONS.entrance.map(anim => (
                      <option key={anim} value={anim}>{anim}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Custom CSS */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom CSS
                </h4>
                <textarea
                  value={selectedElementData.customCSS}
                  onChange={(e) => handleElementUpdate(selectedElementData.id, {
                    customCSS: e.target.value
                  })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono"
                  rows={4}
                  placeholder="/* Custom CSS for this element */"
                />
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientPortalDesigner;