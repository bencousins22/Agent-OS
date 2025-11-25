
import React, { useState, useEffect, useRef, memo, useTransition, useOptimistic, useMemo } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Lock, Search, Globe, MousePointer2, Layout, Sparkles, Code, Loader2, Home, Bookmark, Star, Clock, Menu, X, Plus, Share2 } from 'lucide-react';
import { fs } from '../services/fileSystem';
import { bus } from '../services/eventBus';
import { browserAutomation } from '../services/browserAutomation';

interface BrowserViewProps {
    onInteract?: (query: string) => void;
}

interface BrowserTab {
    id: string;
    title: string;
    url: string;
    favicon?: string;
}

interface BookmarkItem {
    title: string;
    url: string;
    icon: any;
}

const BOOKMARKS: BookmarkItem[] = [
    { title: 'GitHub', url: 'github.com', icon: Code },
    { title: 'Localhost', url: 'http://localhost:3000', icon: Layout },
    { title: 'Research', url: 'aussie://research', icon: Sparkles },
    { title: 'Trending', url: 'aussie://trending', icon: Globe },
];

export const BrowserView: React.FC<BrowserViewProps> = memo(({ onInteract }) => {
    const [tabs, setTabs] = useState<BrowserTab[]>([
        { id: 'tab-1', title: 'New Tab', url: 'aussie://newtab' }
    ]);
    const [activeTabId, setActiveTabId] = useState('tab-1');
    const [urlInput, setUrlInput] = useState('');
    const [iframeContent, setIframeContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [showTabMenu, setShowTabMenu] = useState(false);
    const [ghostCursor, setGhostCursor] = useState<{x: number, y: number, visible: boolean}>({ x: 0, y: 0, visible: false });
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [isPending, startTransition] = useTransition();
    const [optimisticUrl, addOptimisticUrl] = useOptimistic(
        tabs.find(t => t.id === activeTabId)?.url || 'aussie://newtab',
        (_state: string, newUrl: string) => newUrl
    ) as [string, (url: string) => void];

    const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId]);
    const currentUrl = activeTab?.url || 'aussie://newtab';
    const isStartPage = currentUrl === 'aussie://newtab' || currentUrl === '';

    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < history.length - 1;

    const updateTabUrl = (tabId: string, newUrl: string, title?: string) => {
        setTabs(prev => prev.map(tab =>
            tab.id === tabId
                ? { ...tab, url: newUrl, title: title || newUrl.replace(/^https?:\/\//, '').split('/')[0] || 'New Tab' }
                : tab
        ));
    };

    const loadContent = (url: string) => {
        setIsLoading(true);
        addOptimisticUrl(url);

        try {
            let content = '';
            if (url.includes('localhost') || url.startsWith('file://')) {
                const path = url.replace('http://localhost:3000', '/workspace').replace('file://', '');
                content = fs.exists(path) ? fs.readFile(path) : `
                    <html>
                        <body style="background:#14161b;color:#8b949e;display:flex;flex-direction:column;gap:20px;justify-content:center;align-items:center;height:100vh;font-family:system-ui,-apple-system,sans-serif">
                            <div style="font-size:80px;opacity:0.3">404</div>
                            <h1 style="margin:0">Page Not Found</h1>
                            <p style="opacity:0.6;margin:0">${path}</p>
                        </body>
                    </html>
                `;
            } else if (!isStartPage) {
                content = `
                    <html>
                        <body style="background:linear-gradient(135deg, #0d1117 0%, #161b22 100%);color:#e6edf3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:40px;margin:0">
                            <div style="max-width:600px;text-align:center">
                                <div style="width:80px;height:80px;margin:0 auto 24px;background:linear-gradient(135deg,#00e599,#5acbff);border-radius:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 20px 60px -20px rgba(0,229,153,0.4)">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#0d1117">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M12 6v6l4 2"></path>
                                    </svg>
                                </div>
                                <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:700">External Browsing Unavailable</h1>
                                <p style="margin:0 0 24px 0;color:#8b949e;font-size:16px;line-height:1.6">
                                    This build cannot fetch external sites without a network proxy. Use the AI agent to research URLs or configure a browser proxy.
                                </p>
                                <div style="background:#161b22;border:1px solid #30363d;border-radius:12px;padding:16px;font-family:monospace;font-size:14px;word-break:break-all;color:#00e599">
                                    ${url}
                                </div>
                            </div>
                        </body>
                    </html>
                `;
            }
            setIframeContent(content);
            browserAutomation.setPageContent(content.replace(/<[^>]*>?/gm, ''));

            // Update tab
            if (activeTab) {
                updateTabUrl(activeTab.id, url);
            }
        } catch (e) {
            setIframeContent(`<html><body style="background:#14161b;color:#e6edf3;padding:40px;font-family:system-ui">Error: ${e}</body></html>`);
        }
        setTimeout(() => setIsLoading(false), 400);
    };

    const navigate = (url: string, addToHistory = true) => {
        startTransition(() => {
            if (addToHistory) {
                setHistory(prev => [...prev.slice(0, historyIndex + 1), url]);
                setHistoryIndex(prev => prev + 1);
            }
            loadContent(url);
        });
    };

    const goBack = () => {
        if (canGoBack) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            loadContent(history[newIndex]);
        }
    };

    const goForward = () => {
        if (canGoForward) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            loadContent(history[newIndex]);
        }
    };

    const createNewTab = () => {
        const newTab: BrowserTab = {
            id: `tab-${Date.now()}`,
            title: 'New Tab',
            url: 'aussie://newtab'
        };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
    };

    const closeTab = (tabId: string) => {
        if (tabs.length === 1) return; // Don't close last tab

        const tabIndex = tabs.findIndex(t => t.id === tabId);
        const newTabs = tabs.filter(t => t.id !== tabId);
        setTabs(newTabs);

        if (tabId === activeTabId) {
            // Switch to adjacent tab
            const newActiveTab = newTabs[Math.max(0, tabIndex - 1)];
            setActiveTabId(newActiveTab.id);
        }
    };

    useEffect(() => {
        if (!isStartPage) loadContent(currentUrl);

        const unsubscribe = bus.subscribe((e) => {
            if (e.type === 'browser-navigate') {
                navigate(e.payload.url);
            }
            if (e.type === 'browser-action' && e.payload.type === 'click') {
                setGhostCursor({ x: Math.random() * 400 + 100, y: Math.random() * 300 + 100, visible: true });
                setTimeout(() => setGhostCursor(prev => ({ ...prev, visible: false })), 1000);
            }
        });
        return () => unsubscribe();
    }, [currentUrl]);

    useEffect(() => {
        setUrlInput(currentUrl === 'aussie://newtab' ? '' : currentUrl);
    }, [currentUrl]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const val = (e.target as HTMLInputElement).value;
            const isUrl = val.includes('.') || val.startsWith('http') || val.startsWith('file://') || val.startsWith('localhost') || val.startsWith('aussie://');
            if (isUrl) {
                let target = val;
                if (!val.startsWith('http') && !val.startsWith('file://') && !val.includes('://')) {
                    target = `https://${val}`;
                }
                navigate(target);
            } else if (onInteract) {
                onInteract(val);
            }
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-[#0a0e14] via-[#0d1117] to-[#0a0e14] text-os-text min-w-0 overflow-hidden">
            {/* Tab Bar */}
            <div className="h-10 bg-[#0d1117]/90 backdrop-blur-xl border-b border-white/10 flex items-center px-2 gap-1 shrink-0 overflow-x-auto scrollbar-hide">
                {/* Mobile: Show menu toggle */}
                <button
                    onClick={() => setShowTabMenu(!showTabMenu)}
                    className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors shrink-0"
                >
                    <Menu className="w-4 h-4 text-gray-400" />
                </button>

                {/* Desktop: Show tabs */}
                <div className="hidden md:flex flex-1 overflow-x-auto scrollbar-hide gap-1">
                    {tabs.map(tab => (
                        <TabItem
                            key={tab.id}
                            tab={tab}
                            isActive={tab.id === activeTabId}
                            onClick={() => setActiveTabId(tab.id)}
                            onClose={() => closeTab(tab.id)}
                        />
                    ))}
                </div>

                {/* Mobile: Show active tab */}
                <div className="md:hidden flex-1 px-2 text-sm font-medium text-gray-300 truncate">
                    {activeTab?.title || 'New Tab'}
                </div>

                <button
                    onClick={createNewTab}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors shrink-0 group"
                    title="New Tab"
                >
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-aussie-400 transition-colors" />
                </button>
            </div>

            {/* Mobile Tab Menu */}
            {showTabMenu && (
                <div className="md:hidden absolute top-10 left-0 right-0 z-50 bg-[#0d1117]/95 backdrop-blur-xl border-b border-white/10 p-2 space-y-1 shadow-xl max-h-64 overflow-y-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTabId(tab.id);
                                setShowTabMenu(false);
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                                tab.id === activeTabId
                                    ? 'bg-aussie-500/15 text-aussie-300 border border-aussie-500/30'
                                    : 'bg-white/5 text-gray-300 border border-transparent hover:border-white/10'
                            }`}
                        >
                            <span className="font-medium truncate">{tab.title}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeTab(tab.id);
                                }}
                                className="p-1 rounded hover:bg-white/10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </button>
                    ))}
                </div>
            )}

            {/* Navigation Bar */}
            <div className="h-14 md:h-12 bg-[#0d1117]/90 backdrop-blur-xl border-b border-white/10 flex items-center px-2 md:px-3 gap-2 shrink-0 z-10 shadow-lg">
                {/* Navigation Controls */}
                <div className="flex items-center gap-0.5 text-os-textDim shrink-0">
                    <button
                        className={`p-2 rounded-lg transition-all ${canGoBack ? 'hover:bg-white/5 text-gray-300' : 'opacity-30 cursor-not-allowed text-gray-600'}`}
                        onClick={goBack}
                        disabled={!canGoBack}
                        title="Go Back"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                        className={`p-2 rounded-lg transition-all ${canGoForward ? 'hover:bg-white/5 text-gray-300' : 'opacity-30 cursor-not-allowed text-gray-600'}`}
                        onClick={goForward}
                        disabled={!canGoForward}
                        title="Go Forward"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-300"
                        onClick={() => navigate(currentUrl)}
                        title="Reload"
                    >
                        <RotateCw className={`w-4 h-4 ${isLoading || isPending ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        className="hidden md:block p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-300"
                        onClick={() => navigate('aussie://newtab')}
                        title="Home"
                    >
                        <Home className="w-4 h-4" />
                    </button>
                </div>

                {/* Address Bar */}
                <div className="flex-1 bg-[#161b22] border border-white/10 rounded-xl h-10 md:h-9 flex items-center px-3 gap-2 text-sm transition-all focus-within:border-aussie-500/50 focus-within:shadow-lg focus-within:shadow-aussie-500/20 overflow-hidden group backdrop-blur">
                    {isStartPage ? (
                        <Search className="w-4 h-4 text-gray-500 shrink-0 group-focus-within:text-aussie-500 transition-colors" />
                    ) : (
                        <Lock className="w-3.5 h-3.5 text-aussie-500 shrink-0" />
                    )}
                    <input
                        className="flex-1 bg-transparent outline-none text-gray-200 w-full placeholder-gray-600 text-[16px] md:text-sm"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoCapitalize="off"
                        autoComplete="off"
                        placeholder={isStartPage ? "Search or enter URL" : currentUrl}
                    />
                    {urlInput && (
                        <button
                            onClick={() => setUrlInput('')}
                            className="p-1 hover:bg-white/10 rounded transition-colors shrink-0"
                        >
                            <X className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => setShowBookmarks(!showBookmarks)}
                        className={`p-2 rounded-lg transition-all ${showBookmarks ? 'bg-aussie-500/15 text-aussie-400' : 'hover:bg-white/5 text-gray-400'}`}
                        title="Bookmarks"
                    >
                        <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onInteract?.(isStartPage ? "Browse web trending" : `Analyze ${currentUrl}`)}
                        className="p-2 rounded-lg bg-gradient-to-r from-aussie-500/20 to-emerald-500/10 text-aussie-400 hover:from-aussie-500 hover:to-emerald-400 hover:text-black transition-all shadow-lg shadow-aussie-500/20"
                        title="AI Assistant"
                    >
                        <Sparkles className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Bookmarks Bar */}
            {showBookmarks && (
                <div className="bg-[#0f1115] border-b border-white/10 p-2 flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0 animate-in slide-in-from-top duration-200">
                    {BOOKMARKS.map((bookmark, idx) => {
                        const Icon = bookmark.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => bookmark.url.startsWith('aussie://') ? onInteract?.(bookmark.title) : navigate(bookmark.url)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-aussie-500/30 transition-all text-xs font-medium text-gray-300 hover:text-white whitespace-nowrap"
                            >
                                <Icon className="w-3.5 h-3.5 text-aussie-400" />
                                {bookmark.title}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Viewport */}
            <div className="flex-1 relative bg-[#0a0c10] overflow-hidden">
                {isStartPage ? (
                    <NewTabPage onNavigate={navigate} onInteract={onInteract} />
                ) : (
                    <>
                        {(isLoading || isPending) && (
                            <div className="absolute inset-0 z-20 bg-[#0d1117]/90 backdrop-blur-sm flex items-center justify-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-aussie-500/20 blur-2xl rounded-full animate-pulse" />
                                        <Loader2 className="w-12 h-12 text-aussie-400 animate-spin relative z-10" />
                                    </div>
                                    <div className="text-sm font-medium text-gray-400">Loading content...</div>
                                </div>
                            </div>
                        )}
                        <iframe
                            title="viewport"
                            ref={iframeRef}
                            srcDoc={iframeContent}
                            className="w-full h-full border-none bg-white touch-auto"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            allow="display-capture; camera; microphone; geolocation; clipboard-read; clipboard-write"
                        />
                        {ghostCursor.visible && (
                            <div className="absolute pointer-events-none transition-all duration-500 z-50" style={{ left: ghostCursor.x, top: ghostCursor.y }}>
                                <MousePointer2 className="w-6 h-6 text-aussie-500 fill-aussie-500 drop-shadow-lg animate-pulse" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
});

// Tab Item Component
const TabItem = memo<{
    tab: BrowserTab;
    isActive: boolean;
    onClick: () => void;
    onClose: () => void;
}>(({ tab, isActive, onClick, onClose }) => (
    <button
        onClick={onClick}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all min-w-[120px] max-w-[200px] ${
            isActive
                ? 'bg-gradient-to-r from-aussie-500/20 to-emerald-500/10 border border-aussie-500/30 shadow-lg shadow-aussie-500/10'
                : 'bg-white/5 border border-transparent hover:border-white/10'
        }`}
    >
        <Globe className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-aussie-400' : 'text-gray-500'}`} />
        <span className={`text-xs font-medium truncate flex-1 text-left ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
            {tab.title}
        </span>
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
            className="p-0.5 rounded hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
        >
            <X className="w-3 h-3" />
        </button>
    </button>
));

// New Tab Page Component
const NewTabPage = memo<{
    onNavigate: (url: string) => void;
    onInteract?: (query: string) => void;
}>(({ onNavigate, onInteract }) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentDate = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0a0e14] via-[#0d1117] to-[#0a0e14] text-center overflow-y-auto custom-scrollbar">
            {/* Time & Date */}
            <div className="mb-8 animate-in fade-in duration-500">
                <div className="text-6xl md:text-7xl font-black text-white mb-2 tracking-tight">
                    {currentTime}
                </div>
                <div className="text-base text-gray-500 font-medium">
                    {currentDate}
                </div>
            </div>

            {/* Logo */}
            <div className="mb-8 relative shrink-0 animate-in zoom-in duration-500 delay-100">
                <div className="absolute inset-0 bg-gradient-to-r from-aussie-500/30 to-emerald-400/20 blur-3xl rounded-full" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-aussie-500/20 to-aussie-500/10 rounded-3xl flex items-center justify-center border border-aussie-500/30 shadow-2xl shadow-aussie-500/20">
                    <Globe className="w-12 h-12 text-aussie-400" strokeWidth={1.5} />
                </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Aussie Browser</h1>
            <p className="text-base text-gray-500 mb-10 max-w-md">
                AI-powered secure browsing with intelligent automation
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-2xl relative group mb-12 shrink-0 animate-in slide-in-from-bottom duration-500 delay-200">
                <input
                    className="w-full bg-[#161b22] border border-white/10 rounded-2xl py-4 px-14 text-base text-white outline-none focus:border-aussie-500/50 focus:shadow-[0_10px_40px_-20px_rgba(0,229,153,0.4)] transition-all shadow-xl placeholder-gray-600 backdrop-blur"
                    placeholder="Search or type URL..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value;
                            if (val) {
                                const isUrl = val.includes('.') || val.startsWith('http') || val.startsWith('aussie://');
                                if (isUrl) {
                                    let url = val;
                                    if (!val.startsWith('http') && !val.includes('://')) url = `https://${val}`;
                                    onNavigate(url);
                                } else if (onInteract) {
                                    onInteract(val);
                                }
                            }
                        }
                    }}
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-aussie-500 transition-colors" />
                <button
                    onClick={() => onInteract?.("What's trending today?")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-aussie-500/10 hover:bg-aussie-500 text-aussie-400 hover:text-black transition-all"
                >
                    <Sparkles className="w-4 h-4" />
                </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl px-4 animate-in slide-in-from-bottom duration-500 delay-300">
                <QuickAction
                    label="GitHub"
                    icon={Code}
                    color="from-purple-500/20 to-pink-500/10"
                    onClick={() => onInteract?.("Open GitHub and list repos")}
                />
                <QuickAction
                    label="Research"
                    icon={Sparkles}
                    color="from-aussie-500/20 to-emerald-400/10"
                    onClick={() => onInteract?.("Research latest AI news")}
                />
                <QuickAction
                    label="Trending"
                    icon={Globe}
                    color="from-blue-500/20 to-cyan-400/10"
                    onClick={() => onInteract?.("What is trending today?")}
                />
                <QuickAction
                    label="Localhost"
                    icon={Layout}
                    color="from-orange-500/20 to-yellow-400/10"
                    onClick={() => onNavigate('http://localhost:3000')}
                />
            </div>
        </div>
    );
});

// Quick Action Component
const QuickAction = memo<{
    label: string;
    icon: any;
    color: string;
    onClick: () => void;
}>(({ label, icon: Icon, color, onClick }) => (
    <button
        onClick={onClick}
        className={`group flex flex-col items-center gap-3 p-6 bg-gradient-to-br ${color} hover:scale-105 border border-white/10 hover:border-aussie-500/30 rounded-2xl transition-all active:scale-95 shadow-lg hover:shadow-2xl hover:shadow-aussie-500/10 backdrop-blur`}
    >
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <Icon className="w-6 h-6 text-aussie-400 group-hover:scale-110 transition-transform" />
        </div>
        <span className="font-semibold text-sm text-gray-300 group-hover:text-white transition-colors">
            {label}
        </span>
    </button>
));
