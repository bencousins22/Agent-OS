import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, memo } from 'react';
import { ArrowLeft, RotateCw, Lock, Search, Globe, MousePointer2, Layout, Sparkles, Code, Loader2 } from 'lucide-react';
import { fs } from '../services/fileSystem';
import { bus } from '../services/eventBus';
import { browserAutomation } from '../services/browserAutomation';
export const BrowserView = memo(({ onInteract }) => {
    const [url, setUrl] = useState('aussie://newtab');
    const [iframeContent, setIframeContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [ghostCursor, setGhostCursor] = useState({ x: 0, y: 0, visible: false });
    const iframeRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const isStartPage = url === 'aussie://newtab' || url === '';
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const loadContent = () => {
        setIsLoading(true);
        try {
            let content = '';
            if (url.includes('localhost') || url.startsWith('file://')) {
                const path = url.replace('http://localhost:3000', '/workspace').replace('file://', '');
                content = fs.exists(path) ? fs.readFile(path) : `<html><body style="background:#14161b;color:#8b949e;display:flex;justify-content:center;align-items:center;height:100vh"><h1>404 Not Found</h1></body></html>`;
            }
            else if (!isStartPage) {
                content = `<html><body style="background:#0d1117;color:#e6edf3;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:40px;">
                    <h1 style="margin-bottom:12px;">External browsing unavailable</h1>
                    <p style="max-width:520px;text-align:center;">This build cannot fetch external sites without a network proxy. Use the agent to research the URL or configure a browser proxy.</p>
                    <code style="margin-top:16px;padding:8px 12px;background:#111723;border-radius:8px;display:block;">${url}</code>
                </body></html>`;
            }
            setIframeContent(content);
            browserAutomation.setPageContent(content.replace(/<[^>]*>?/gm, ''));
        }
        catch (e) {
            setIframeContent(`<html><body>Error: ${e}</body></html>`);
        }
        setTimeout(() => setIsLoading(false), 400);
    };
    useEffect(() => {
        if (!isStartPage)
            loadContent();
        const unsubscribe = bus.subscribe((e) => {
            if (e.type === 'browser-navigate')
                setUrl(e.payload.url);
            if (e.type === 'browser-action' && e.payload.type === 'click') {
                setGhostCursor({ x: Math.random() * 400 + 100, y: Math.random() * 300 + 100, visible: true });
                setTimeout(() => setGhostCursor(prev => ({ ...prev, visible: false })), 1000);
            }
        });
        return () => unsubscribe();
    }, [url]);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const val = e.target.value;
            const isUrl = val.includes('.') || val.startsWith('http') || val.startsWith('file://') || val.startsWith('localhost');
            if (isUrl) {
                let target = val;
                if (!val.startsWith('http') && !val.startsWith('file://') && !val.includes('://'))
                    target = `https://${val}`;
                setUrl(target);
            }
            else if (onInteract) {
                onInteract(val);
            }
            e.target.blur();
        }
    };
    return (_jsxs("div", { className: "flex flex-col h-full bg-os-bg text-os-text min-w-0 overflow-hidden", children: [_jsxs("div", { className: "h-14 md:h-12 bg-os-panel border-b border-os-border flex items-center px-2 md:px-3 gap-2 shrink-0 z-10", children: [_jsxs("div", { className: "flex items-center gap-1 text-os-textDim shrink-0", children: [_jsx("button", { className: "p-2.5 md:p-2 rounded-lg hover:bg-white/5 active:scale-90 transition-transform", onClick: () => !isStartPage && setUrl('aussie://newtab'), children: _jsx(ArrowLeft, { className: "w-5 h-5 md:w-4 md:h-4" }) }), _jsx("button", { className: "p-2.5 md:p-2 rounded-lg hover:bg-white/5 active:scale-90 transition-transform", onClick: loadContent, children: _jsx(RotateCw, { className: `w-5 h-5 md:w-4 md:h-4 ${isLoading ? 'animate-spin' : ''}` }) })] }), _jsxs("div", { className: "flex-1 bg-[#0d1117] border border-os-border rounded-xl md:rounded-full h-10 md:h-8 flex items-center px-3 gap-2 text-sm transition-all focus-within:border-aussie-500/50 shadow-inner overflow-hidden group", children: [isStartPage ? _jsx(Search, { className: "w-4 h-4 text-gray-500 shrink-0 group-focus-within:text-aussie-500" }) : _jsx(Lock, { className: "w-3.5 h-3.5 text-aussie-500 shrink-0" }), _jsx("input", { className: "flex-1 bg-transparent outline-none text-gray-200 w-full placeholder-gray-600 text-[16px] md:text-sm", value: url === 'aussie://newtab' ? '' : url, onChange: (e) => setUrl(e.target.value), onKeyDown: handleKeyDown, autoCapitalize: "off", autoComplete: "off", placeholder: isStartPage ? "Search or enter URL" : "Enter URL" })] }), _jsx("button", { onClick: () => onInteract?.(isStartPage ? "Browse web trending" : `Analyze ${url}`), className: "p-2.5 md:p-2 rounded-lg bg-aussie-500/10 text-aussie-500 hover:bg-aussie-500 hover:text-[#0f1216] transition-colors active:scale-95", children: _jsx(Sparkles, { className: "w-5 h-5 md:w-4 md:h-4" }) })] }), _jsx("div", { className: "flex-1 relative bg-os-bg overflow-hidden", children: isStartPage ? (_jsxs("div", { className: "w-full h-full flex flex-col items-center p-6 bg-os-bg text-center overflow-y-auto", children: [_jsxs("div", { className: "mt-[10%] mb-8 relative shrink-0 animate-in zoom-in duration-500", children: [_jsx("div", { className: "absolute inset-0 bg-aussie-500/20 blur-3xl rounded-full" }), _jsx(Globe, { className: "w-20 h-20 md:w-24 md:h-24 text-aussie-500 relative z-10 drop-shadow-[0_0_15px_rgba(0,229,153,0.5)]", strokeWidth: 1 })] }), _jsx("h1", { className: "text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight", children: "Aussie Browser" }), _jsx("p", { className: "text-base text-gray-500 mb-8", children: "Secure, AI-powered web browsing." }), _jsxs("div", { className: "w-full max-w-xl relative group mb-10 shrink-0 animate-in slide-in-from-bottom duration-500 delay-100", children: [_jsx("input", { className: "w-full bg-[#161b22] border border-gray-700 rounded-2xl py-4 px-12 text-lg text-white outline-none focus:border-aussie-500/50 focus:shadow-[0_0_20px_rgba(0,229,153,0.1)] transition-all shadow-2xl placeholder-gray-600", placeholder: "Search or type URL...", onKeyDown: handleKeyDown }), _jsx(Search, { className: "absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-aussie-500 transition-colors" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg px-4 animate-in slide-in-from-bottom duration-500 delay-200", children: [_jsx(Shortcut, { label: "GitHub", icon: Code, onClick: () => onInteract?.("Go to GitHub") }), _jsx(Shortcut, { label: "Localhost", icon: Layout, onClick: () => setUrl('http://localhost:3000/welcome.html') }), _jsx(Shortcut, { label: "Research AI", icon: Sparkles, onClick: () => onInteract?.("Research latest AI news") }), _jsx(Shortcut, { label: "Trending", icon: Globe, onClick: () => onInteract?.("What is trending today?") })] })] })) : (_jsxs(_Fragment, { children: [isLoading && (_jsx("div", { className: "absolute inset-0 z-20 bg-[#0d1117]/80 backdrop-blur-sm flex items-center justify-center", children: _jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx(Loader2, { className: "w-10 h-10 text-aussie-500 animate-spin" }), _jsx("div", { className: "text-sm font-medium text-gray-400", children: "Loading content..." })] }) })), _jsx("iframe", { title: "viewport", ref: iframeRef, srcDoc: iframeContent, className: "w-full h-full border-none bg-white touch-auto", sandbox: "allow-scripts allow-same-origin allow-forms", allow: "display-capture; camera; microphone; geolocation; clipboard-read; clipboard-write" }), ghostCursor.visible && (_jsx("div", { className: "absolute pointer-events-none transition-all duration-500 z-50", style: { left: ghostCursor.x, top: ghostCursor.y }, children: _jsx(MousePointer2, { className: "w-6 h-6 text-aussie-500 fill-aussie-500 drop-shadow-lg" }) }))] })) })] }));
});
const Shortcut = ({ label, icon: Icon, onClick }) => (_jsxs("button", { onClick: onClick, className: "flex items-center gap-3 p-4 bg-[#161b22] hover:bg-white/5 border border-gray-800 hover:border-gray-600 rounded-xl text-left transition-all active:scale-95 shadow-sm group", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-aussie-500/10 flex items-center justify-center text-aussie-500 shrink-0 group-hover:bg-aussie-500 group-hover:text-black transition-colors", children: _jsx(Icon, { className: "w-5 h-5" }) }), _jsx("span", { className: "font-medium text-gray-300 group-hover:text-white transition-colors", children: label })] }));
