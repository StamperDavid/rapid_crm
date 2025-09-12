import React, { useState } from 'react';
import { useUIState } from '../contexts/UIStateContext';
import UIDemoComponent from '../components/UIDemoComponent';
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowsPointingOutIcon, 
  ArrowsPointingInIcon,
  PaintBrushIcon,
  EyeIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

const UIDemo: React.FC = () => {
  const { uiState, createComponent, deleteComponent, resizeComponent, updateStyle } = useUIState();
  const [showDebug, setShowDebug] = useState(false);

  const handleCreateButton = () => {
    const buttonId = `demo-button-${Date.now()}`;
    createComponent({
      id: buttonId,
      type: 'button',
      props: {
        text: 'Dynamic Button',
        onClick: () => alert('Button clicked!')
      },
      position: { x: Math.random() * 300, y: Math.random() * 200 },
      size: { width: 120, height: 40 }
    });
  };

  const handleCreateCard = () => {
    const cardId = `demo-card-${Date.now()}`;
    createComponent({
      id: cardId,
      type: 'card',
      props: {
        title: 'Dynamic Card',
        content: 'This card was created dynamically!'
      },
      position: { x: Math.random() * 300, y: Math.random() * 200 },
      size: { width: 200, height: 150 }
    });
  };

  const handleResizeComponent = (id: string, bigger: boolean) => {
    const component = uiState.components[id];
    if (component && component.size) {
      const multiplier = bigger ? 1.2 : 0.8;
      resizeComponent(id, {
        width: Math.round(component.size.width * multiplier),
        height: Math.round(component.size.height * multiplier)
      });
    }
  };

  const handleChangeColor = (id: string) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    updateStyle(id, { backgroundColor: randomColor });
  };

  const components = Object.values(uiState.components);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <CpuChipIcon className="h-8 w-8 mr-3 text-blue-600" />
                UI Manipulation Demo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                This page demonstrates the Advanced UI Assistant's capabilities. 
                Try using voice commands like "make the deals table bigger" or "add a button to this page".
              </p>
            </div>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <EyeIcon className="h-4 w-4" />
              <span>{showDebug ? 'Hide' : 'Show'} Debug</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Demo Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Create Components</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateButton}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Button</span>
                </button>
                <button
                  onClick={handleCreateCard}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Card</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Voice Commands</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>• "Make the deals table bigger"</p>
                <p>• "Add a button to this page"</p>
                <p>• "Change theme to blue"</p>
                <p>• "Create a new page"</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Current State</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Components: {components.length}</p>
                <p>Modifications: {uiState.modifications.length}</p>
                <p>Theme: {uiState.theme.primaryColor}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Area */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 min-h-[500px]">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Interactive Demo Area</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Components created here can be manipulated through voice commands. 
            Click the floating AI assistant button to start!
          </p>
          
          {/* Render dynamic components */}
          <div className="relative">
            {components.map((component) => (
              <div key={component.id} className="absolute">
                <UIDemoComponent
                  id={component.id}
                  type={component.type}
                  style={component.style}
                >
                  {component.type === 'button' && (
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      onClick={() => alert('Dynamic button clicked!')}
                    >
                      {component.props?.text || 'Dynamic Button'}
                    </button>
                  )}
                  
                  {component.type === 'card' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {component.props?.title || 'Dynamic Card'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {component.props?.content || 'This is a dynamically created card!'}
                      </p>
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => handleResizeComponent(component.id, true)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Make bigger"
                        >
                          <ArrowsPointingOutIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleResizeComponent(component.id, false)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Make smaller"
                        >
                          <ArrowsPointingInIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleChangeColor(component.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Change color"
                        >
                          <PaintBrushIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteComponent(component.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </UIDemoComponent>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mt-8 bg-gray-900 text-green-400 rounded-lg p-6 font-mono text-sm">
            <h3 className="text-lg font-semibold mb-4 text-white">UI State Debug</h3>
            <pre className="overflow-auto max-h-96">
              {JSON.stringify(uiState, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default UIDemo;
