import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Search, Terminal, File, Command, Bot, Calculator, CloudSun } from 'lucide-react';
import { shell } from '../services/shell';
import { fs } from '../services/fileSystem';
export const Spotlight = ({ isOpen, onClose, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);
    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }
        const searchResults = [];
        // 1. Math Calculation
        try {
            // Simple regex to detect math
            if (/^[\d\s+\-*/().]+$/.test(query) && /\d/.test(query)) {
                // eslint-disable-next-line no-eval
                const result = eval(query);
                if (!isNaN(result)) {
                    searchResults.push({
                        type: 'math',
                        label: `= ${result}`,
                        sub: 'Calculation',
                        action: () => { navigator.clipboard.writeText(String(result)); }
                    });
                }
            }
        }
        catch (e) { }
        // 2. Weather
        if ('weather'.includes(query.toLowerCase())) {
            searchResults.push({
                type: 'weather',
                label: 'Sydney, Australia',
                sub: '24°C • Sunny',
                action: () => { }
            });
        }
        // 3. Commands
        if (query.startsWith('>')) {
            const cmd = query.slice(1).trim();
            searchResults.push({ type: 'command', label: `Run: ${cmd}`, action: () => shell.execute(cmd) });
        }
        // 4. Navigation
        if ('dashboard'.includes(query.toLowerCase()))
            searchResults.push({ type: 'nav', label: 'Go to Dashboard', action: () => onNavigate('dashboard') });
        if ('editor'.includes(query.toLowerCase()))
            searchResults.push({ type: 'nav', label: 'Go to Editor', action: () => onNavigate('code') });
        if ('browser'.includes(query.toLowerCase()))
            searchResults.push({ type: 'nav', label: 'Go to Browser', action: () => onNavigate('browser') });
        if ('flow'.includes(query.toLowerCase()))
            searchResults.push({ type: 'nav', label: 'Go to Flow Automator', action: () => onNavigate('flow') });
        if ('settings'.includes(query.toLowerCase()))
            searchResults.push({ type: 'nav', label: 'System Settings', action: () => onNavigate('settings') });
        // 5. Files
        try {
            const files = fs.readDir('/workspace'); // Simple flat search
            files.forEach(f => {
                if (f.name.toLowerCase().includes(query.toLowerCase())) {
                    searchResults.push({ type: 'file', label: f.name, sub: f.path, action: () => { } });
                }
            });
        }
        catch (e) { }
        setResults(searchResults);
        setSelectedIndex(0);
    }, [query, onNavigate]);
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            setSelectedIndex(prev => (prev + 1) % results.length);
            e.preventDefault();
        }
        if (e.key === 'ArrowUp') {
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            e.preventDefault();
        }
        if (e.key === 'Enter') {
            if (results[selectedIndex]) {
                results[selectedIndex].action();
                onClose();
            }
            e.preventDefault();
        }
        if (e.key === 'Escape')
            onClose();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-[10vh] md:pt-[20vh]", onClick: onClose, children: _jsxs("div", { className: "w-[90%] md:w-[600px] bg-[#161b22]/90 backdrop-blur-xl rounded-xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 ring-1 ring-white/10", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center px-4 py-4 border-b border-gray-700 gap-3", children: [_jsx(Search, { className: "w-5 h-5 text-aussie-500" }), _jsx("input", { ref: inputRef, value: query, onChange: e => setQuery(e.target.value), onKeyDown: handleKeyDown, placeholder: "Search apps, files, or calculate...", className: "flex-1 bg-transparent outline-none text-lg md:text-xl text-white placeholder-gray-500 font-light", autoFocus: true }), _jsx("div", { className: "px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700 hidden md:block", children: "ESC" })] }), _jsxs("div", { className: "max-h-[400px] overflow-y-auto p-2", children: [results.length === 0 && query && (_jsx("div", { className: "p-4 text-center text-gray-500", children: "No results found" })), results.map((res, idx) => (_jsxs("div", { onClick: () => { res.action(); onClose(); }, className: `
                                flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                                ${idx === selectedIndex ? 'bg-aussie-500 text-[#0f1216]' : 'text-gray-300 hover:bg-gray-800'}
                            `, children: [_jsxs("div", { className: `${idx === selectedIndex ? 'text-[#0f1216]' : 'text-gray-500'}`, children: [res.type === 'command' && _jsx(Terminal, { className: "w-5 h-5" }), res.type === 'file' && _jsx(File, { className: "w-5 h-5" }), res.type === 'nav' && _jsx(Command, { className: "w-5 h-5" }), res.type === 'math' && _jsx(Calculator, { className: "w-5 h-5" }), res.type === 'weather' && _jsx(CloudSun, { className: "w-5 h-5" })] }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm font-bold", children: res.label }), res.sub && _jsx("div", { className: `text-xs ${idx === selectedIndex ? 'text-black/60' : 'text-gray-500'}`, children: res.sub })] }), idx === selectedIndex && _jsx("div", { className: "text-[10px] uppercase font-bold opacity-50 hidden md:block", children: "Enter" })] }, idx))), !query && (_jsxs("div", { className: "p-8 text-center text-gray-600", children: [_jsx(Bot, { className: "w-12 h-12 mx-auto mb-3 opacity-20" }), _jsx("p", { children: "Type to search Aussie OS" }), _jsxs("div", { className: "flex gap-2 justify-center mt-4 flex-wrap", children: [_jsx("span", { className: "text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700", children: "24 * 7" }), _jsx("span", { className: "text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700", children: "weather" }), _jsx("span", { className: "text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700", children: "> echo hi" })] })] }))] })] }) }));
};
