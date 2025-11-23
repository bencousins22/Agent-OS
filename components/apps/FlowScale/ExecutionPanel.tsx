import React, { useState } from 'react';

export const ExecutionPanel = () => {
  const [logs, setLogs] = useState([]);

  const handleRun = () => {
    setLogs(['Simulating workflow...', 'Step 1: Email Triggered', 'Step 2: GPT-4 Processing', 'Step 3: Slack Notified', 'Workflow complete.']);
  };

  const handleClear = () => {
    setLogs([]);
  }

  return (
    <div className="h-64 bg-gray-800 p-4 border-t border-gray-700 flex flex-col">
      <div className='flex items-center gap-x-2'>
        <button
          onClick={handleRun}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Run
        </button>
        <button
          onClick={handleClear}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Clear
        </button>
      </div>
      <div className="mt-4 text-sm text-gray-400 flex-1 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
};
