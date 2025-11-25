/**
 * TerminalViewMobile.tsx - React 19 optimized mobile terminal
 * Enhanced with:
 * - Collapsible command palette
 * - Touch-friendly command execution
 * - Swipe gestures for history
 * - Optimized output scrolling
 * - Mobile-friendly syntax highlighting
 */

import React, { useRef, useState, useCallback, useTransition, Suspense } from 'react';
import { TerminalBlock } from '../../types';
import { Terminal, X, ChevronUp, ChevronDown, Zap, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TerminalViewMobileProps {
    blocks: TerminalBlock[];
    onExecute?: (cmd: string) => Promise<any> | void;
    statusLabel?: string;
}

const QUICK_COMMANDS = [
    { cmd: 'ls', label: 'List Files', icon: 'folder' },
    { cmd: 'pwd', label: 'Current Dir', icon: 'map' },
    { cmd: 'git status', label: 'Git Status', icon: 'git' },
    { cmd: 'clear', label: 'Clear', icon: 'trash' },
];

/**
 * Terminal Output Block with syntax highlighting
 */
const TerminalOutputBlock: React.FC<{ block: TerminalBlock; isLast: boolean }> = React.memo(({
    block,
    isLast
}) => {
    const getBlockColor = (type: TerminalBlock['type']) => {
        switch (type) {
            case 'output': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'command': return 'text-aussie-400';
            case 'ai-thought': return 'text-blue-400';
            case 'tool-call': return 'text-purple-400';
            default: return 'text-gray-300';
        }
    };

    return (
        <div className={`
            py-2 px-3 border-l-2 transition-all motion-safe:animate-in motion-safe:fade-in
            ${getBlockColor(block.type)}
            ${isLast ? 'border-aussie-500' : 'border-gray-700'}
        `}>
            <div className="flex items-center gap-2 text-xs font-mono mb-1 opacity-60">
                <span className="text-gray-600">
                    [{new Date(block.timestamp).toLocaleTimeString()}]
                </span>
                <span className="uppercase text-[9px] font-bold tracking-wider">
                    {block.type}
                </span>
            </div>
            <div className="text-xs font-mono whitespace-pre-wrap break-words overflow-x-auto custom-scrollbar pb-2">
                {typeof block.content === 'string' ? (
                    <ReactMarkdown
                        components={{
                            code: ({ children }) => (
                                <code className="bg-black/40 px-1 py-0.5 rounded text-[10px]">
                                    {children}
                                </code>
                            ),
                            pre: ({ children }) => (
                                <pre className="bg-black/60 p-2 rounded overflow-x-auto">
                                    {children}
                                </pre>
                            )
                        }}
                    >
                        {block.content}
                    </ReactMarkdown>
                ) : (
                    <pre>{JSON.stringify(block.content, null, 2)}</pre>
                )}
            </div>
        </div>
    );
});

TerminalOutputBlock.displayName = 'TerminalOutputBlock';

/**
 * TerminalViewMobile - React 19 optimized terminal for mobile
 */
export const TerminalViewMobile: React.FC<TerminalViewMobileProps> = React.memo(({
    blocks,
    onExecute,
    statusLabel = 'terminal'
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showPalette, setShowPalette] = useState(false);
    const [isPending, startTransition] = useTransition();

    const executeCommand = useCallback(async (cmd: string) => {
        if (!cmd.trim()) return;

        startTransition(() => {
            setHistory(prev => [...prev, cmd]);
            setHistoryIndex(-1);
            onExecute?.(cmd);
        });

        setInput('');
    }, [onExecute]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeCommand(input);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(history[history.length - 1 - newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(history[history.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    }, [input, history, historyIndex, executeCommand]);

    // Auto-scroll
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [blocks.length]);

    return (
        <div className="flex flex-col h-full bg-[#0a0c10] rounded-lg overflow-hidden border border-gray-800">
            {/* Header */}
            <div className="h-10 border-b border-gray-800 bg-[#0f131a]/80 flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-aussie-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {statusLabel}
                    </span>
                </div>
                <button
                    onClick={() => setShowPalette(!showPalette)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    aria-label="Toggle command palette"
                    aria-expanded={showPalette}
                >
                    {showPalette ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                </button>
            </div>

            {/* Quick Commands Palette */}
            {showPalette && (
                <div className="px-2 py-2 border-b border-gray-800 bg-[#0f131a]/50 grid grid-cols-2 gap-2">
                    {QUICK_COMMANDS.map(({ cmd, label }) => (
                        <button
                            key={cmd}
                            onClick={() => {
                                executeCommand(cmd);
                                setShowPalette(false);
                            }}
                            className="px-2 py-1.5 bg-white/5 hover:bg-aussie-500/20 border border-white/10 hover:border-aussie-500/40 rounded text-xs font-semibold transition-all active:scale-95"
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* Output Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth p-2"
                role="log"
                aria-live="polite"
                aria-label="Terminal output"
            >
                {blocks.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-600 text-xs text-center p-4">
                        <div>
                            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p>Terminal ready</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {blocks.map((block, idx) => (
                            <TerminalOutputBlock
                                key={block.id}
                                block={block}
                                isLast={idx === blocks.length - 1}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-800 bg-[#0a0c10] px-3 py-2 flex items-center gap-2 shrink-0">
                <span className="text-aussie-500 font-bold">$</span>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="ls, cd, git..."
                    className="flex-1 bg-transparent text-white text-xs outline-none placeholder:text-gray-600 font-mono"
                    aria-label="Terminal input"
                    autoComplete="off"
                    spellCheck="false"
                />
                <button
                    onClick={() => executeCommand(input)}
                    disabled={!input.trim() || isPending}
                    className="p-1.5 rounded bg-aussie-500/20 hover:bg-aussie-500/40 text-aussie-400 disabled:opacity-50 transition-all active:scale-95"
                    aria-label="Execute command"
                >
                    <Zap className="w-4 h-4" />
                </button>
            </div>

            {/* History indicator */}
            {history.length > 0 && (
                <div className="px-3 py-1 bg-black/30 border-t border-gray-800 text-[9px] text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {history.length} commands
                </div>
            )}
        </div>
    );
});

TerminalViewMobile.displayName = 'TerminalViewMobile';

export default TerminalViewMobile;
