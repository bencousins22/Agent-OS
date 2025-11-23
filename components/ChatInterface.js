import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Bot, Sparkles, ArrowRight, Zap, History, Save, ChevronDown, Copy, Check, ArrowDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
export const ChatInterface = ({ messages, onQuickAction, isProcessing }) => {
    const scrollRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [sessions, setSessions] = useState([
        { id: 'default', title: 'Current Session', messages: [], lastModified: Date.now() }
    ]);
    const [currentSessionId, setCurrentSessionId] = useState('default');
    const [showSessions, setShowSessions] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    // Smart Scroll Logic
    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };
    useEffect(() => {
        // Auto-scroll on new messages if at bottom or if it's a user message
        const container = scrollRef.current;
        if (!container)
            return;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        const lastMsg = messages[messages.length - 1];
        const isUser = lastMsg?.role === 'user';
        if (isNearBottom || isUser) {
            scrollToBottom();
        }
    }, [messages, isProcessing]);
    const handleScroll = () => {
        const container = scrollRef.current;
        if (!container)
            return;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
        setShowScrollButton(!isNearBottom);
    };
    const saveSession = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        const title = `Session ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        setSessions(prev => [...prev, { id: newId, title, messages: [...messages], lastModified: Date.now() }]);
        setCurrentSessionId(newId);
        setShowSessions(false);
    };
    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    return (_jsxs("div", { className: "flex-1 flex flex-col min-h-0 bg-os-bg relative group/chat", children: [_jsxs("div", { className: "h-10 border-b border-os-border bg-[#161b22]/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-20 select-none", children: [_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setShowSessions(!showSessions), className: "flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors font-medium py-1 px-2 rounded hover:bg-white/5", children: [_jsx(History, { className: "w-3.5 h-3.5" }), _jsx("span", { className: "max-w-[120px] truncate font-mono", children: sessions.find(s => s.id === currentSessionId)?.title || 'Current Session' }), _jsx(ChevronDown, { className: `w-3 h-3 opacity-70 transition-transform duration-200 ${showSessions ? 'rotate-180' : ''}` })] }), showSessions && (_jsxs("div", { className: "absolute top-full left-0 mt-2 w-60 bg-[#1c2128] border border-os-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100", children: [_jsx("div", { className: "px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5", children: "History" }), _jsx("div", { className: "max-h-60 overflow-y-auto custom-scrollbar", children: sessions.map(s => (_jsxs("button", { onClick: () => { setCurrentSessionId(s.id); setShowSessions(false); }, className: `w-full text-left px-4 py-3 text-xs hover:bg-white/5 border-l-2 transition-all ${s.id === currentSessionId ? 'text-aussie-500 border-aussie-500 bg-aussie-500/5' : 'text-gray-400 border-transparent'}`, children: [_jsx("div", { className: "font-medium truncate", children: s.title }), _jsxs("div", { className: "text-[10px] opacity-50 mt-0.5", children: [new Date(s.lastModified).toLocaleDateString(), " \u2022 ", s.messages.length, " msgs"] })] }, s.id))) }), _jsx("div", { className: "border-t border-white/5 p-2 bg-[#161b22]", children: _jsxs("button", { onClick: saveSession, className: "w-full flex items-center justify-center gap-2 text-xs text-aussie-500 hover:bg-aussie-500/10 p-2 rounded-lg transition-colors font-bold", children: [_jsx(Save, { className: "w-3 h-3" }), " Save Chat"] }) })] }))] }), _jsxs("div", { className: "flex items-center gap-2 bg-aussie-500/5 px-2 py-1 rounded-full border border-aussie-500/10", children: [_jsx(Sparkles, { className: "w-3 h-3 text-aussie-500" }), _jsx("div", { className: "text-[10px] text-aussie-500 font-bold uppercase tracking-wider", children: "Gemini 3.0 Pro" })] })] }), _jsxs("div", { ref: scrollRef, onScroll: handleScroll, className: "flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative bg-os-bg scroll-smooth", children: [messages.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center pb-10 animate-in fade-in zoom-in-95 duration-500", children: [_jsxs("div", { className: "w-20 h-20 bg-gradient-to-br from-aussie-500/20 to-blue-500/20 rounded-[1.5rem] mb-6 border border-white/10 flex items-center justify-center ring-1 ring-white/5 shadow-[0_0_40px_-10px_rgba(0,229,153,0.2)] relative group cursor-default", children: [_jsx("div", { className: "absolute inset-0 bg-aussie-500/10 blur-2xl rounded-full group-hover:bg-aussie-500/20 transition-colors duration-1000" }), _jsx(Bot, { className: "w-10 h-10 text-aussie-500 relative z-10 drop-shadow-lg" })] }), _jsx("h2", { className: "text-xl font-bold text-white mb-2 tracking-tight", children: "Aussie Agent" }), _jsx("p", { className: "text-xs text-os-textDim mb-8 max-w-[250px] leading-relaxed", children: "System control, coding, and AI analysis." }), _jsxs("div", { className: "grid grid-cols-1 gap-2.5 w-full max-w-xs", children: [_jsx(QuickAction, { onClick: () => onQuickAction?.("Create a new NBA Bot app"), label: "Build NBA Bot", icon: Zap }), _jsx(QuickAction, { onClick: () => onQuickAction?.("Generate a futuristic city video"), label: "Generate Video", icon: Sparkles }), _jsx(QuickAction, { onClick: () => onQuickAction?.("Explain the project structure"), label: "Analyze Code", icon: Bot })] })] })) : (_jsxs(_Fragment, { children: [messages.map((msg, index) => {
                                const isUser = msg.role === 'user';
                                const showAvatar = index === 0 || messages[index - 1].role !== msg.role;
                                return (_jsxs("div", { className: `flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} w-full animate-in fade-in slide-in-from-bottom-2 duration-300 group`, children: [showAvatar && (_jsxs("div", { className: `flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''} mb-1 px-1 select-none`, children: [isUser ? (_jsx("div", { className: "w-5 h-5 rounded-md bg-gray-700 flex items-center justify-center text-[10px] font-bold text-white shadow-sm", children: "U" })) : (_jsx("div", { className: "w-5 h-5 rounded-md bg-gradient-to-br from-aussie-500 to-emerald-600 flex items-center justify-center text-black text-[10px] font-bold shadow-lg shadow-aussie-500/20", children: "A" })), _jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-gray-500", children: isUser ? 'You' : (msg.sender || 'Jules') }), _jsx("span", { className: "text-[9px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity", children: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] })), _jsxs("div", { className: `
                                        max-w-[95%] md:max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border relative transition-all
                                        ${isUser
                                                ? 'bg-[#00e599] text-[#0f1216] border-[#00c280] rounded-tr-sm font-medium shadow-[0_2px_10px_-5px_rgba(0,229,153,0.3)]'
                                                : 'bg-[#1c2128] border-white/5 text-gray-200 rounded-tl-sm shadow-md hover:border-white/10'}
                                    `, children: [_jsx("div", { className: `prose max-w-none prose-p:my-1 prose-pre:my-2 prose-pre:rounded-lg text-[13px] ${isUser ? 'prose-p:text-[#0f1216] prose-strong:text-black prose-a:text-black prose-code:text-black/70' : 'prose-invert prose-pre:bg-[#0a0c10] prose-code:text-aussie-400 prose-a:text-aussie-400'}`, children: _jsx(ReactMarkdown, { children: msg.text }) }), !isUser && (_jsx("div", { className: "absolute -bottom-6 left-0 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1", children: _jsx("button", { onClick: () => copyToClipboard(msg.text, msg.id), className: "p-1.5 text-gray-500 hover:text-white rounded hover:bg-white/10 transition-colors", title: "Copy", children: copiedId === msg.id ? _jsx(Check, { className: "w-3 h-3 text-green-500" }) : _jsx(Copy, { className: "w-3 h-3" }) }) }))] })] }, msg.id));
                            }), isProcessing && (_jsxs("div", { className: "flex flex-col items-start gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1 px-1", children: [_jsx("div", { className: "w-5 h-5 rounded-md bg-gradient-to-br from-aussie-500 to-emerald-600 flex items-center justify-center text-black text-[10px] font-bold shadow-lg", children: "A" }), _jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-gray-500", children: "Jules" })] }), _jsxs("div", { className: "bg-[#1c2128] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md flex items-center gap-2", children: [_jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: "w-1.5 h-1.5 bg-aussie-500 rounded-full animate-bounce [animation-delay:-0.3s]" }), _jsx("div", { className: "w-1.5 h-1.5 bg-aussie-500 rounded-full animate-bounce [animation-delay:-0.15s]" }), _jsx("div", { className: "w-1.5 h-1.5 bg-aussie-500 rounded-full animate-bounce" })] }), _jsx("span", { className: "text-xs text-gray-500 font-medium ml-2 animate-pulse", children: "Thinking..." })] })] }))] })), _jsx("div", { ref: messagesEndRef, className: "h-2" })] }), showScrollButton && (_jsx("button", { onClick: () => scrollToBottom(), className: "absolute bottom-4 right-4 p-2 bg-aussie-500 text-black rounded-full shadow-lg shadow-aussie-500/20 hover:scale-110 transition-transform z-30 animate-in fade-in zoom-in", children: _jsx(ArrowDown, { className: "w-4 h-4", strokeWidth: 3 }) }))] }));
};
const QuickAction = ({ label, onClick, icon: Icon }) => (_jsxs("button", { onClick: onClick, className: "w-full flex items-center justify-between px-4 py-2.5 bg-[#1c2128] hover:bg-[#22272e] border border-white/5 hover:border-aussie-500/30 rounded-xl transition-all group shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-1.5 rounded-lg bg-[#0f1216] group-hover:bg-aussie-500/20 group-hover:text-aussie-500 transition-colors text-gray-400 border border-white/5", children: _jsx(Icon, { className: "w-3.5 h-3.5" }) }), _jsx("span", { className: "text-xs text-gray-300 font-medium group-hover:text-white transition-colors", children: label })] }), _jsx(ArrowRight, { className: "w-3.5 h-3.5 text-gray-600 group-hover:text-aussie-500 group-hover:translate-x-1 transition-all" })] }));
