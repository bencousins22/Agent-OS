import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, lazy, Suspense, useTransition } from 'react';
import { Mic, MicOff, Headphones, Trash2, Plus, ArrowUp, ChevronDown } from 'lucide-react';
import { useAgent } from './services/useAgent';
import { scheduler } from './services/scheduler';
import { bus } from './services/eventBus';
import { NAV_ITEMS } from './components/ActivityBar';
import { KernelShield } from './components/KernelShield';
import { initWebOsBridge } from './services/webOsBridge';
// Code splitting: Load components lazily
const ChatInterface = lazy(() => import('./components/ChatInterface').then(m => ({ default: m.ChatInterface })));
const AgentStatus = lazy(() => import('./components/AgentStatus').then(m => ({ default: m.AgentStatus })));
const MediaPlayer = lazy(() => import('./components/MediaPlayer').then(m => ({ default: m.MediaPlayer })));
const NotificationCenter = lazy(() => import('./components/NotificationCenter').then(m => ({ default: m.NotificationCenter })));
const Spotlight = lazy(() => import('./components/Spotlight').then(m => ({ default: m.Spotlight })));
const ActivityBar = lazy(() => import('./components/ActivityBar').then(m => ({ default: m.ActivityBar })));
const StatusBar = lazy(() => import('./components/StatusBar').then(m => ({ default: m.StatusBar })));
const Resizable = lazy(() => import('./components/Resizable').then(m => ({ default: m.Resizable })));
const MobileSidebar = lazy(() => import('./components/MobileSidebar').then(m => ({ default: m.MobileSidebar })));
const Workspace = lazy(() => import('./components/Workspace').then(m => ({ default: m.Workspace })));
// Loading fallback component
const ComponentLoader = () => (_jsx("div", { className: "flex items-center justify-center h-full w-full", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-aussie-500" }) }));
const BootLoader = () => {
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        const bootSequence = [
            { t: 100, msg: 'Initializing Kernel...' },
            { t: 400, msg: 'Mounting Virtual FS...' },
            { t: 800, msg: 'Starting Network Stack...' },
            { t: 1200, msg: 'Connecting to Gemini Node...' },
            { t: 1600, msg: 'Hydrating React DOM...' },
            { t: 2000, msg: 'Loading User Preferences...' },
            { t: 2200, msg: 'System Check OK.' },
            { t: 2400, msg: 'Booting Interface...' }
        ];
        let mounted = true;
        bootSequence.forEach(({ t, msg }) => {
            setTimeout(() => {
                if (mounted)
                    setLogs(prev => [...prev.slice(-5), msg]);
            }, t);
        });
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100)
                    return 100;
                const diff = Math.random() * 10;
                return Math.min(p + diff, 100);
            });
        }, 150);
        return () => { mounted = false; clearInterval(interval); };
    }, []);
    return (_jsxs("div", { className: "fixed inset-0 bg-[#0f1115] flex flex-col items-center justify-center z-[100] font-mono select-none text-aussie-500", children: [_jsxs("div", { className: "w-72 mb-8 relative flex flex-col items-center", children: [_jsxs("div", { className: "w-16 h-16 border-2 border-aussie-500/30 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-aussie-500/10 animate-pulse" }), _jsx("div", { className: "text-2xl font-bold", children: "A" })] }), _jsx("div", { className: "text-2xl font-bold tracking-[0.2em] mb-1 text-white", children: "AUSSIE OS" }), _jsx("div", { className: "text-[10px] text-aussie-500/60 mb-6 uppercase tracking-wider", children: "Version 2.2.1 // JulesVM" }), _jsx("div", { className: "h-1 bg-gray-800 w-full rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-aussie-500 shadow-[0_0_15px_#00e599]", style: { width: `${progress}%`, transition: 'width 0.2s ease-out' } }) })] }), _jsxs("div", { className: "h-32 w-72 overflow-hidden text-[10px] font-medium opacity-80 flex flex-col justify-end border border-white/5 p-3 rounded-lg bg-black/40 backdrop-blur-sm shadow-2xl", children: [logs.map((log, i) => (_jsxs("div", { className: "truncate flex gap-2 animate-in slide-in-from-bottom-1 fade-in duration-200", children: [_jsxs("span", { className: "text-gray-600", children: ["[", new Date().toISOString().split('T')[1].slice(0, 8), "]"] }), _jsx("span", { className: "text-aussie-500/80", children: log })] }, i))), _jsxs("div", { className: "flex gap-2", children: [_jsxs("span", { className: "text-gray-600", children: ["[", new Date().toISOString().split('T')[1].slice(0, 8), "]"] }), _jsx("span", { className: "animate-pulse text-aussie-500", children: "_" })] })] })] }));
};
const App = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [input, setInput] = useState('');
    const [activePanel, setActivePanel] = useState('terminal');
    const [showSpotlight, setShowSpotlight] = useState(false);
    const [booting, setBooting] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [chatOpen, setChatOpen] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const fileInputRef = useRef(null);
    const [mobileCodeView, setMobileCodeView] = useState('editor');
    const [isNavPending, startNavTransition] = useTransition();
    const [showSidebar, setShowSidebar] = useState(true);
    const { messages, isProcessing, workflowPhase, terminalBlocks, editorTabs, activeTabPath, setActiveTabPath, openFile, mediaFile, setMediaFile, processUserMessage, isLive, isTtsEnabled, toggleLive, toggleTts, clearMessages, handleFileUpload } = useAgent();
    const handleNavigate = (view) => {
        startNavTransition(() => {
            if (view === 'code' && activeTabPath === null && editorTabs.length > 0) {
                setActiveTabPath(editorTabs[0].path);
            }
            setActiveView(view);
        });
        if (window.innerWidth < 768) {
            if (view === 'browser')
                setChatOpen(true);
            setShowMobileMenu(false);
        }
        if (!showSidebar)
            setShowSidebar(true);
    };
    const handleSendMessage = async (text = input) => {
        if (!text.trim() && !isLive)
            return;
        setInput('');
        setChatOpen(true);
        await processUserMessage(text);
    };
    useEffect(() => {
        // Boot sequence timer
        const bootTime = window.innerWidth < 768 ? 2500 : 2800;
        setTimeout(() => setBooting(false), bootTime);
        initWebOsBridge();
        scheduler.start();
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile && !chatOpen)
                setChatOpen(true);
            if (!mobile && showMobileMenu)
                setShowMobileMenu(false);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        const unsub = bus.subscribe((e) => {
            if (e.type === 'switch-view')
                handleNavigate(e.payload.view || 'dashboard');
            if (e.type === 'browser-navigate')
                handleNavigate('browser');
        });
        return () => { scheduler.stop(); window.removeEventListener('resize', handleResize); unsub(); };
    }, [chatOpen, showMobileMenu]);
    useEffect(() => {
        if (isMobile && messages.length > 0 && messages[messages.length - 1].role === 'model')
            setChatOpen(true);
    }, [messages.length, isMobile]);
    if (booting)
        return _jsx(BootLoader, {});
    const isMobileBrowserSplit = isMobile && activeView === 'browser' && chatOpen;
    return (_jsxs("div", { className: "fixed inset-0 flex bg-os-bg text-os-text overflow-hidden font-sans", "aria-busy": isNavPending, "data-nav-pending": isNavPending ? 'true' : 'false', children: [_jsx("div", { className: "fixed top-3 right-3 z-[120]", children: _jsx(KernelShield, {}) }), _jsx(Suspense, { fallback: null, children: _jsx(NotificationCenter, {}) }), _jsx(Suspense, { fallback: null, children: _jsx(Spotlight, { isOpen: showSpotlight, onClose: () => setShowSpotlight(false), onNavigate: handleNavigate }) }), _jsx(Suspense, { fallback: null, children: _jsx(MobileSidebar, { isOpen: showMobileMenu, onClose: () => setShowMobileMenu(false), activeView: activeView, onNavigate: handleNavigate, menuItems: [...NAV_ITEMS] }) }), !isMobile && (_jsx("div", { className: `h-full transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`, children: _jsx(Suspense, { fallback: _jsx(ComponentLoader, {}), children: _jsx(ActivityBar, { activeView: activeView, onNavigate: handleNavigate, onSpotlight: () => setShowSpotlight(true), isMobile: false, onChatToggle: () => setChatOpen(!chatOpen) }) }) })), !isMobile && (_jsx("button", { onClick: () => setShowSidebar(!showSidebar), className: "absolute top-3 left-3 z-[65] p-2 rounded-full bg-[#0f1216]/80 border border-white/10 text-gray-300 hover:text-white hover:border-aussie-500/50 transition-colors", "aria-label": "Toggle sidebar", children: _jsx(ChevronDown, { className: `w-4 h-4 transition-transform ${showSidebar ? '-rotate-90' : 'rotate-90'}` }) })), isMobile && (_jsx("div", { className: "fixed bottom-0 left-0 right-0 h-[70px] z-[60] bg-[#0a0c10] border-t border-os-border pb-safe", children: _jsx(Suspense, { fallback: _jsx(ComponentLoader, {}), children: _jsx(ActivityBar, { activeView: activeView, onNavigate: handleNavigate, onSpotlight: () => setShowSpotlight(true), isMobile: true, onChatToggle: () => setChatOpen(!chatOpen), onMenuToggle: () => setShowMobileMenu(true) }) }) })), _jsxs("div", { className: `flex flex-1 min-w-0 relative ${isMobile ? 'pb-[70px]' : ''}`, children: [_jsx("div", { className: `flex-1 flex flex-col min-h-0 relative ${isMobileBrowserSplit ? 'h-[55%]' : 'h-full'}`, children: _jsx(Suspense, { fallback: _jsx(ComponentLoader, {}), children: _jsx(Workspace, { activeView: activeView, onNavigate: handleNavigate, onSendMessage: handleSendMessage, setChatOpen: setChatOpen, isMobile: isMobile, editorTabs: editorTabs, activeTabPath: activeTabPath, setActiveTabPath: setActiveTabPath, activePanel: activePanel, setActivePanel: setActivePanel, terminalBlocks: terminalBlocks, openFile: openFile, mobileCodeView: mobileCodeView, setMobileCodeView: setMobileCodeView }) }) }), _jsxs("div", { className: `
                    ${isMobile
                            ? isMobileBrowserSplit
                                ? 'absolute bottom-0 left-0 right-0 h-[45%] z-50 border-t border-os-border shadow-2xl bg-[#14161b] flex flex-col'
                                : `absolute inset-0 z-50 bg-os-bg/95 backdrop-blur-xl transition-transform duration-300 ease-out flex flex-col ${chatOpen ? 'translate-y-0' : 'translate-y-[110%]'}`
                            : `relative flex flex-col bg-os-bg ${chatOpen ? 'w-[360px] border-l border-os-border' : 'hidden'}`}
                `, children: [_jsxs("div", { className: "h-12 border-b border-os-border flex items-center justify-between px-4 bg-os-panel shrink-0 pt-safe", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${isProcessing || isLive ? 'bg-aussie-500 animate-pulse' : 'bg-aussie-500'}` }), _jsx("span", { className: "font-bold text-sm text-white", children: "Aussie Agent" }), _jsx(Suspense, { fallback: null, children: _jsx(AgentStatus, { state: workflowPhase }) })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: toggleTts, className: `p-2 rounded-lg ${isTtsEnabled ? 'text-aussie-500' : 'text-gray-400'}`, children: _jsx(Headphones, { className: "w-4 h-4" }) }), _jsx("button", { onClick: clearMessages, className: "p-2 rounded-lg text-gray-400 hover:text-red-400", children: _jsx(Trash2, { className: "w-4 h-4" }) }), isMobile && _jsx("button", { onClick: () => setChatOpen(false), className: "p-2 text-gray-400", children: _jsx(ChevronDown, { className: "w-5 h-5" }) })] })] }), _jsx(Suspense, { fallback: _jsx(ComponentLoader, {}), children: _jsx(ChatInterface, { messages: messages, onQuickAction: handleSendMessage, isProcessing: isProcessing }) }), _jsxs("div", { className: "border-t border-os-border bg-os-bg shrink-0 p-3 pb-safe", children: [_jsx("input", { type: "file", ref: fileInputRef, className: "hidden", onChange: (e) => e.target.files?.[0] && handleFileUpload(e.target.files[0]) }), _jsxs("div", { className: "flex items-end gap-2", children: [_jsx("button", { onClick: () => fileInputRef.current?.click(), className: "p-3 rounded-full bg-white/5 text-gray-400 hover:text-white", children: _jsx(Plus, { className: "w-5 h-5" }) }), _jsxs("div", { className: "flex-1 bg-[#1c2128] border border-gray-700 rounded-2xl flex items-end relative min-h-[48px]", children: [_jsx("textarea", { value: input, onChange: (e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`; }, placeholder: isLive ? "Listening..." : "Message...", className: "w-full bg-transparent text-white text-[16px] px-4 py-3 max-h-32 outline-none resize-none" // 16px for mobile
                                                        , rows: 1, style: { height: '48px' }, onKeyDown: (e) => { if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendMessage();
                                                        } } }), _jsx("button", { onClick: toggleLive, className: `absolute right-2 bottom-2 p-2 rounded-full ${isLive ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-gray-400'}`, children: isLive ? _jsx(Mic, { className: "w-5 h-5" }) : _jsx(MicOff, { className: "w-5 h-5" }) })] }), _jsx("button", { onClick: () => handleSendMessage(), disabled: !input.trim() && !isLive, className: `p-3 rounded-full shrink-0 ${input.trim() ? 'bg-aussie-500 text-black' : 'bg-white/10 text-gray-500'}`, children: _jsx(ArrowUp, { className: "w-5 h-5 stroke-[3]" }) })] })] }), !isMobile && (_jsx(Suspense, { fallback: null, children: _jsx(Resizable, { direction: "horizontal", mode: "parent", minSize: 300, maxSize: 600 }) }))] })] }), mediaFile && activeView !== 'code' && (_jsx(Suspense, { fallback: null, children: _jsx(MediaPlayer, { file: mediaFile, onClose: () => setMediaFile(null) }) })), !isMobile && (_jsx(Suspense, { fallback: null, children: _jsx(StatusBar, { activeTab: editorTabs.find(t => t.path === activeTabPath) }) }))] }));
};
export default App;
