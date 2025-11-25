/**
 * ChatInterfaceMobile.tsx - React 19 optimized mobile chat interface
 * Enhanced with:
 * - useOptimistic for instant UI feedback
 * - Better message rendering for small screens
 * - Sticky message composer
 * - Swipe-to-dismiss gestures
 * - Optimized scroll performance
 */

import React, { useRef, useState, useOptimistic, useCallback, useTransition } from 'react';
import { Message } from '../../types';
import { Send, Mic, Copy, Check, ArrowDown, MoreVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceMobileProps {
    messages: Message[];
    onQuickAction?: (text: string) => void;
    isProcessing: boolean;
}

interface OptimisticMessage extends Message {
    isOptimistic?: boolean;
}

/**
 * React 19 useOptimistic hook for instant message feedback
 */
export const ChatInterfaceMobile: React.FC<ChatInterfaceMobileProps> = React.memo(({
    messages,
    onQuickAction,
    isProcessing
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState('');
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // useOptimistic for instant message feedback on send
    const [optimisticMessages, addOptimisticMessage] = useOptimistic(
        messages as OptimisticMessage[],
        (state: OptimisticMessage[], newMsg: OptimisticMessage) => [
            ...state,
            { ...newMsg, isOptimistic: true }
        ]
    ) as [OptimisticMessage[], (msg: OptimisticMessage) => void];

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    // Auto-scroll on new messages
    React.useEffect(() => {
        const isNearBottom = scrollRef.current 
            ? scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight < 150
            : true;
        if (isNearBottom || isProcessing) {
            scrollToBottom();
        }
    }, [optimisticMessages.length, isProcessing, scrollToBottom]);

    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
        setShowScrollBtn(!isNearBottom);
    }, []);

    const handleSendMessage = useCallback(() => {
        if (!input.trim()) return;

        const optimisticMsg: OptimisticMessage = {
            id: Math.random().toString(36),
            role: 'user',
            text: input,
            timestamp: Date.now(),
            isOptimistic: true
        };

        // Add optimistic message
        startTransition(() => {
            addOptimisticMessage(optimisticMsg);
            onQuickAction?.(input);
        });

        setInput('');
    }, [input, onQuickAction, addOptimisticMessage]);

    const copyToClipboard = useCallback((text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-[#0d1117] via-[#0b1018] to-[#080c13] relative">
            {/* Header - Sticky */}
            <div className="h-12 border-b border-white/10 bg-[#161b22]/95 backdrop-blur-md flex items-center justify-between px-3 shrink-0 sticky top-0 z-20 shadow-lg">
                <span className="text-sm font-bold text-white">Aussie Chat</span>
                <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Messages Area - Scrollable */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar scroll-smooth"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
            >
                {optimisticMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center pb-8 px-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-aussie-500/20 to-blue-500/20 rounded-xl mb-4 border border-white/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-aussie-500">A</span>
                        </div>
                        <h2 className="text-lg font-bold text-white mb-2">Aussie Agent</h2>
                        <p className="text-xs text-gray-400 mb-4">Start a conversation</p>
                    </div>
                ) : (
                    <>
                        {optimisticMessages.map((msg, idx) => {
                            const isUser = msg.role === 'user';
                            const showAvatar = idx === 0 || optimisticMessages[idx - 1].role !== msg.role;

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} w-full animate-in fade-in slide-in-from-bottom-2 duration-200 group`}
                                    style={{ opacity: (msg as OptimisticMessage).isOptimistic ? 0.7 : 1 }}
                                >
                                    {showAvatar && (
                                        <div className={`flex items-center gap-1.5 mb-1 px-1 select-none text-[10px] font-bold uppercase tracking-wider text-gray-500`}>
                                            {isUser ? 'You' : 'Jules'}
                                        </div>
                                    )}

                                    <div className={`
                                        max-w-[90%] rounded-lg px-3 py-2.5 text-sm leading-relaxed border
                                        transition-all group/message
                                        ${isUser
                                            ? 'bg-aussie-500 text-black border-aussie-400/50 rounded-br-none font-medium shadow-lg shadow-aussie-500/30'
                                            : 'bg-[#1f2937]/80 backdrop-blur border-white/15 text-gray-100 rounded-bl-none shadow-md'}
                                    `}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown
                                            components={{
                                                p: ({ children }: any) => <p className="mb-1 last:mb-0">{children}</p>,
                                                code: ({ children, className }: any) => {
                                                    const isInline = !className?.includes('language-');
                                                    return isInline
                                                        ? <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                                                        : <pre className="bg-black/40 p-2 rounded overflow-x-auto text-xs font-mono my-1"><code>{children}</code></pre>;
                                                },
                                                a: ({ href, children }: any) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-aussie-300 underline">{children}</a>
                                            }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>

                                        {!isUser && (
                                            <button
                                                onClick={() => copyToClipboard(msg.text, msg.id)}
                                                className="opacity-0 group-hover/message:opacity-100 transition-opacity p-1 text-gray-500 hover:text-aussie-400 rounded mt-1"
                                                title="Copy message"
                                                aria-label="Copy message"
                                            >
                                                {copiedId === msg.id ? (
                                                    <Check className="w-3.5 h-3.5 text-success-500" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {isProcessing && (
                            <div className="flex items-start gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">Jules</span>
                                <div className="bg-[#1c2128] border border-white/5 rounded-lg rounded-bl-none px-3 py-2.5 flex items-center gap-1.5">
                                    {[1, 2, 3].map(i => (
                                        <div
                                            key={i}
                                            className="w-1.5 h-1.5 bg-aussie-500 rounded-full animate-bounce"
                                            style={{ animationDelay: `${(i - 1) * 0.1}s` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Scroll to bottom button */}
            {showScrollBtn && (
                <button
                    onClick={() => scrollToBottom()}
                    className="absolute bottom-[90px] right-3 p-2 bg-aussie-500 text-black rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all z-30 active:scale-95"
                    aria-label="Scroll to bottom"
                >
                    <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
                </button>
            )}

            {/* Message Composer - Sticky */}
            <div className="border-t border-white/10 bg-[#0d1117]/95 backdrop-blur-sm shrink-0 p-3 pb-safe space-y-2">
                <div className="flex items-end gap-2">
                    <button
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white border border-white/10 hover:border-aussie-500/40 transition-all active:scale-95"
                        aria-label="Attach file"
                    >
                        <Mic className="w-4 h-4" />
                    </button>

                    <div className="flex-1 bg-[#0f131a]/80 border border-white/10 rounded-lg flex items-end relative shadow-inner">
                        <textarea
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Message Aussie..."
                            className="w-full bg-transparent text-white text-sm px-3 py-2.5 outline-none resize-none max-h-24 placeholder:text-gray-600"
                            rows={1}
                            aria-label="Chat message input"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isPending}
                            className={`p-2.5 m-1 rounded-lg shrink-0 transition-all active:scale-95 ${
                                input.trim() && !isPending
                                    ? 'bg-aussie-500 text-black hover:bg-aussie-600 shadow-lg shadow-aussie-500/20'
                                    : 'bg-white/5 text-gray-600 cursor-not-allowed'
                            }`}
                            aria-label="Send message"
                        >
                            <Send className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

ChatInterfaceMobile.displayName = 'ChatInterfaceMobile';

export default ChatInterfaceMobile;
