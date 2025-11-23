import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { File, Folder } from 'lucide-react';
export const VirtualFileSystem = ({ files }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    if (files.length === 0) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-gray-500 p-8", children: [_jsx(Folder, { className: "w-12 h-12 mb-2 opacity-20" }), _jsx("p", { className: "text-sm", children: "Workspace is empty" })] }));
    }
    return (_jsxs("div", { className: "flex h-full", children: [_jsxs("div", { className: "w-1/3 border-r border-gray-800 overflow-y-auto bg-[#0d1117]", children: [_jsx("div", { className: "p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Project Root" }), _jsx("div", { className: "px-2", children: files.map((file, idx) => (_jsxs("div", { onClick: () => setSelectedFile(file), className: `
                                flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-colors
                                ${selectedFile?.path === file.path ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}
                            `, children: [_jsx(File, { className: "w-4 h-4" }), _jsx("span", { className: "truncate", children: file.name })] }, idx))) })] }), _jsx("div", { className: "flex-1 bg-[#010409] overflow-hidden flex flex-col", children: selectedFile ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "h-10 border-b border-gray-800 flex items-center px-4 text-xs text-gray-500 font-mono", children: selectedFile.path }), _jsx("div", { className: "flex-1 overflow-auto p-4", children: _jsx("pre", { className: "text-sm font-mono text-gray-300 whitespace-pre-wrap", children: selectedFile.content }) })] })) : (_jsx("div", { className: "flex flex-col items-center justify-center h-full text-gray-600", children: _jsx("p", { className: "text-sm", children: "Select a file to view content" }) })) })] }));
};
