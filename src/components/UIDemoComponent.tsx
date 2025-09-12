import React from 'react';
import { useUIState } from '../contexts/UIStateContext';

interface UIDemoComponentProps {
  id: string;
  type: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const UIDemoComponent: React.FC<UIDemoComponentProps> = ({ 
  id, 
  type, 
  children, 
  className = '', 
  style = {} 
}) => {
  const { getComponent } = useUIState();
  const component = getComponent(id);

  // Apply dynamic styles from UI state
  const dynamicStyle = {
    ...style,
    ...(component?.style || {}),
    ...(component?.size && {
      width: `${component.size.width}px`,
      height: `${component.size.height}px`,
    }),
    ...(component?.position && {
      position: 'absolute' as const,
      left: `${component.position.x}px`,
      top: `${component.position.y}px`,
    }),
  };

  const baseClasses = {
    button: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors',
    modal: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
    card: 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700',
    table: 'w-full border-collapse bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md',
    form: 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700',
    sidebar: 'bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4',
    header: 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4',
  };

  const componentClasses = baseClasses[type as keyof typeof baseClasses] || '';

  return (
    <div
      id={id}
      className={`${componentClasses} ${className}`}
      style={dynamicStyle}
      data-component-type={type}
      data-component-id={id}
    >
      {children}
    </div>
  );
};

export default UIDemoComponent;
