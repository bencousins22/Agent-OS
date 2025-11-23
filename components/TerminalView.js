import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Terminal, PlayCircle, ArrowUp, ArrowDown, X, Command, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { shell } from '../services/shell';
export const TerminalView = ({ blocks, isMobile = false }) => {
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const paletteInputRef = useRef(null);
    const [input, setInput] = useState('');
    const [cwd, setCwd] = useState('/workspace');
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    // Palette State
    const [showPalette, setShowPalette] = useState(false);
    const [paletteFilter, setPaletteFilter] = useState('');
    // History State
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const COMMAND_PRESETS = [
        { id: 'clear', label: 'Clear Terminal', cmd: 'clear', desc: 'Clear output buffer', autoRun: true },
        { id: 'ls', label: 'List Files', cmd: 'ls', desc: 'Show directory contents', autoRun: true },
        { id: 'pwd', label: 'Print Working Directory', cmd: 'pwd', desc: 'Show current path', autoRun: true },
        { id: 'git_status', label: 'Git Status', cmd: 'git status', desc: 'Show working tree status', autoRun: true },
        { id: 'git_log', label: 'Git Log', cmd: 'git log', desc: 'Show commit history', autoRun: true },
        { id: 'cd_root', label: 'Go to Root', cmd: 'cd /', desc: 'Navigate to root', autoRun: true },
        { id: 'cd_workspace', label: 'Go to Workspace', cmd: 'cd /workspace', desc: 'Navigate to workspace', autoRun: true },
        { id: 'npm_install', label: 'NPM Install', cmd: 'npm install ', desc: 'Install dependencies', autoRun: false },
        { id: 'git_commit', label: 'Git Commit', cmd: 'git commit -m ""', desc: 'Commit changes', autoRun: false },
        { id: 'help', label: 'Help', cmd: 'help', desc: 'Show available commands', autoRun: true },
        { id: 'jules', label: 'Ask Jules', cmd: 'gemini-flow jules --task ""', desc: 'Run AI task', autoRun: false },
    ];
    // Keep CWD in sync
    useEffect(() => {
        const timer = setInterval(() => {
            setCwd(shell.getCwd());
        }, 500);
        return () => clearInterval(timer);
    }, []);
    // Smart Scrolling Logic
    useEffect(() => {
        const container = scrollRef.current;
        if (container && shouldAutoScroll) {
            container.scrollTop = container.scrollHeight;
        }
    }, [blocks, shouldAutoScroll]);
    // Keyboard Shortcut for Palette
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                setShowPalette(prev => !prev);
            }
            if (showPalette && e.key === 'Escape') {
                setShowPalette(false);
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showPalette]);
    // Focus palette input
    useEffect(() => {
        if (showPalette) {
            setTimeout(() => paletteInputRef.current?.focus(), 50);
        }
    }, [showPalette]);
    const handleScroll = () => {
        const container = scrollRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            // If user is near bottom (within 50px), enable auto-scroll
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
            setShouldAutoScroll(isNearBottom);
        }
    };
    const executeCommand = (cmdText) => {
        if (!cmdText.trim())
            return;
        // Add to history
        setHistory(prev => [...prev, cmdText]);
        setHistoryIndex(-1);
        const event = new CustomEvent('shell-cmd', { detail: cmdText });
        window.dispatchEvent(event);
        setInput('');
        setShouldAutoScroll(true); // Force scroll to bottom on new command
    };
    const handleInputKeyDown = async (e) => {
        if (e.key === 'Enter') {
            executeCommand(input);
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateHistory(-1);
        }
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateHistory(1);
        }
    };
    const handlePaletteSelect = (item) => {
        if (item.autoRun) {
            executeCommand(item.cmd);
        }
        else {
            setInput(item.cmd);
            inputRef.current?.focus();
        }
        setShowPalette(false);
        setPaletteFilter('');
    };
    const navigateHistory = (direction) => {
        if (direction === -1) { // Up
            if (history.length > 0) {
                const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            }
        }
        else { // Down
            if (historyIndex !== -1) {
                const newIndex = Math.min(history.length - 1, historyIndex + 1);
                if (historyIndex === history.length - 1) {
                    setHistoryIndex(-1);
                    setInput('');
                }
                else {
                    setHistoryIndex(newIndex);
                    setInput(history[newIndex]);
                }
            }
        }
    };
    const insertText = (text) => {
        setInput(prev => prev + text);
        inputRef.current?.focus();
    };
    const filteredCommands = COMMAND_PRESETS.filter(c => c.label.toLowerCase().includes(paletteFilter.toLowerCase()) ||
        c.cmd.toLowerCase().includes(paletteFilter.toLowerCase()));
    return (_jsxs("div", { className: "flex flex-col h-full bg-os-bg font-mono text-sm relative overflow-hidden border-t border-os-border", onClick: () => !showPalette && inputRef.current?.focus(), children: [_jsxs("div", { className: "h-8 bg-os-panel border-b border-os-border flex items-center justify-between px-4 text-xs text-os-textDim select-none z-10 shrink-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Terminal, { className: "w-3 h-3 text-aussie-500" }), _jsx("span", { className: "text-aussie-500/80 font-bold hidden md:inline", children: "aussie@local" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex gap-2 items-center mr-4", children: [_jsx("span", { className: "text-xs font-bold text-os-textDim hidden sm:inline", children: "vsh" }), _jsx("span", { className: "opacity-50 hidden sm:inline", children: "|" }), _jsx("span", { className: "text-aussie-400 truncate max-w-[150px]", children: cwd })] }), _jsx("button", { onClick: (e) => { e.stopPropagation(); setShowPalette(!showPalette); }, className: `p-1 rounded hover:bg-white/10 transition-colors ${showPalette ? 'text-aussie-500 bg-white/5' : 'text-gray-400'}`, title: "Command Palette (Ctrl+Shift+P)", children: _jsx(Command, { className: "w-3.5 h-3.5" }) })] })] }), showPalette && (_jsxs("div", { className: "absolute top-10 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[500px] bg-[#1c2128] border border-os-border rounded-xl shadow-2xl z-50 flex flex-col animate-in fade-in slide-in-from-top-2 overflow-hidden ring-1 ring-black/50", children: [_jsxs("div", { className: "flex items-center px-3 py-3 border-b border-os-border gap-3 bg-[#161b22]", children: [_jsx(Search, { className: "w-4 h-4 text-gray-500 shrink-0" }), _jsx("input", { ref: paletteInputRef, value: paletteFilter, onChange: e => setPaletteFilter(e.target.value), placeholder: "Type a command...", className: "flex-1 bg-transparent outline-none text-white text-sm placeholder-gray-600", onKeyDown: e => {
                                    if (e.key === 'Enter' && filteredCommands.length > 0) {
                                        handlePaletteSelect(filteredCommands[0]);
                                    }
                                    if (e.key === 'Escape')
                                        setShowPalette(false);
                                } }), _jsx("div", { className: "text-[10px] text-gray-500 border border-gray-700 px-1.5 rounded", children: "ESC" })] }), _jsxs("div", { className: "max-h-64 overflow-y-auto custom-scrollbar p-1", children: [filteredCommands.map((item, idx) => (_jsxs("button", { onClick: () => handlePaletteSelect(item), className: `w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-aussie-500/10 group transition-colors ${idx === 0 ? 'bg-white/5' : ''}`, children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-sm text-gray-200 font-medium group-hover:text-aussie-500 transition-colors", children: item.label }), _jsx("span", { className: "text-[10px] text-gray-500", children: item.desc })] }), _jsx("code", { className: "text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-gray-400 group-hover:text-white transition-colors font-mono", children: item.cmd })] }, item.id))), filteredCommands.length === 0 && (_jsx("div", { className: "p-4 text-center text-gray-500 text-xs", children: "No commands found" }))] })] })), showPalette && _jsx("div", { className: "absolute inset-0 bg-black/20 z-40 backdrop-blur-[1px]", onClick: () => setShowPalette(false) }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar", ref: scrollRef, onScroll: handleScroll, children: [blocks.length === 0 && (_jsxs("div", { className: "opacity-30 text-gray-500 text-xs mb-4", children: ["Welcome to Aussie VSH v3.0.0", _jsx("br", {}), "Type 'help' for available commands or press ", _jsx("kbd", { className: "bg-gray-800 px-1 rounded", children: "Cmd+Shift+P" }), " for palette."] })), blocks.map((block) => (_jsxs("div", { className: "group relative break-words", children: [block.type === 'command' && (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs", children: [_jsx("span", { className: "text-aussie-500 font-bold", children: "\u279C" }), _jsx("span", { className: "text-aussie-400 opacity-80", children: block.metadata?.cwd || cwd })] }), _jsx("div", { className: "text-gray-200 font-semibold pl-4", children: block.content })] })), block.type === 'tool-call' && (_jsx("div", { className: "pl-4 border-l-2 border-aussie-500/30 my-2 py-1", children: _jsxs("div", { className: "flex items-center gap-2 text-aussie-500 text-xs font-bold", children: [_jsx(PlayCircle, { className: "w-3 h-3" }), block.content] }) })), block.type === 'ai-thought' && (_jsx("div", { className: "pl-4 border-l-2 border-purple-500/30 my-2 text-xs text-gray-400 italic", children: _jsx(ReactMarkdown, { children: block.content }) })), block.type === 'output' && (_jsx("div", { className: "pl-4 text-gray-300 whitespace-pre-wrap text-xs leading-tight my-1", children: block.content })), block.type === 'error' && (_jsx("div", { className: "pl-4 text-red-400 text-xs whitespace-pre-wrap my-1", children: block.content }))] }, block.id))), _jsxs("div", { className: "flex items-center gap-2 pt-2", children: [_jsx("span", { className: "text-aussie-500 font-bold text-xs", children: "\u279C" }), _jsx("span", { className: "text-aussie-400 text-xs opacity-80 hidden sm:inline", children: cwd }), _jsx("input", { ref: inputRef, type: "text", value: input, onChange: e => setInput(e.target.value), onKeyDown: handleInputKeyDown, className: "flex-1 bg-transparent border-none outline-none text-gray-100 font-mono text-base md:text-sm placeholder-gray-700 caret-aussie-500 p-0", autoFocus: true, spellCheck: false, autoComplete: "off", placeholder: "" })] }), _jsx("div", { className: "h-20 md:h-8" })] }), isMobile && (_jsxs("div", { className: "bg-[#0d1117] border-t border-os-border p-1 flex gap-1 items-center justify-around shrink-0 sticky bottom-0 z-20", children: [_jsx("button", { onClick: () => insertText('/'), className: "p-2 rounded bg-os-panel text-gray-400 text-xs border border-os-border flex-1", children: "/" }), _jsx("button", { onClick: () => insertText('-'), className: "p-2 rounded bg-os-panel text-gray-400 text-xs border border-os-border flex-1", children: "-" }), _jsx("button", { onClick: () => navigateHistory(-1), className: "p-2 rounded bg-os-panel text-gray-400 border border-os-border", children: _jsx(ArrowUp, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => navigateHistory(1), className: "p-2 rounded bg-os-panel text-gray-400 border border-os-border", children: _jsx(ArrowDown, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setInput(''), className: "p-2 rounded bg-red-500/20 text-red-400 border border-red-500/30", children: _jsx(X, { className: "w-4 h-4" }) })] }))] }));
};
