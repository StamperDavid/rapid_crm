import React from 'react';
import HelpIcon from './HelpIcon';
import Tooltip from './Tooltip';

const TooltipTest: React.FC = () => {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Tooltip Test</h2>
      
      <div className="space-y-2">
        <p>Testing HelpIcon:</p>
        <HelpIcon 
          content="This is a test tooltip for HelpIcon component"
          size="md"
          position="top"
        />
      </div>

      <div className="space-y-2">
        <p>Testing Tooltip:</p>
        <Tooltip content="This is a test tooltip for Tooltip component">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Hover me for tooltip
          </button>
        </Tooltip>
      </div>

      <div className="space-y-2">
        <p>Testing with text:</p>
        <span className="text-blue-600">
          Hover this text
          <HelpIcon 
            content="This tooltip should appear when you hover over the help icon"
            size="sm"
            position="right"
            className="ml-2"
          />
        </span>
      </div>
    </div>
  );
};

export default TooltipTest;
