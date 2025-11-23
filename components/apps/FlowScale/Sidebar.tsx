import React from 'react';

export const Sidebar = () => {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-gray-800 p-4 border-r border-gray-700">
      <h2 className="text-lg font-bold mb-4 text-white">Nodes</h2>
      <div
        className="p-3 border-2 border-dashed border-gray-600 rounded cursor-grab bg-gray-700 text-white text-center"
        onDragStart={(event) => onDragStart(event, 'input', 'Email Trigger')}
        draggable
      >
        Email Trigger
      </div>
      <div
        className="mt-4 p-3 border-2 border-dashed border-gray-600 rounded cursor-grab bg-gray-700 text-white text-center"
        onDragStart={(event) => onDragStart(event, 'default', 'GPT-4 Process')}
        draggable
      >
        GPT-4 Process
      </div>
      <div
        className="mt-4 p-3 border-2 border-dashed border-gray-600 rounded cursor-grab bg-gray-700 text-white text-center"
        onDragStart={(event) => onDragStart(event, 'output', 'Slack Notify')}
        draggable
      >
        Slack Notify
      </div>
    </aside>
  );
};
