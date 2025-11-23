import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Search, Star, Download, Trophy, Zap, Play, Grid, Layers, ShoppingBag, Loader2 } from 'lucide-react';
import { fs } from '../services/fileSystem';
import { notify } from '../services/notification';
import { appRegistry } from '../services/appRegistry';
import { bus } from '../services/eventBus';
import { wm } from '../services/windowManager';
export const Marketplace = () => {
    const [apps, setApps] = useState([]);
    const [installing, setInstalling] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const refresh = () => {
        setApps(appRegistry.getAll());
    };
    useEffect(() => {
        refresh();
        const sub = bus.subscribe(e => {
            if (e.type === 'app-created' || e.type === 'app-installed') {
                refresh();
            }
        });
        return () => sub();
    }, []);
    const installApp = async (app) => {
        setInstalling(app.id);
        // Simulate download delay
        await new Promise(r => setTimeout(r, 2000));
        const shortcutPath = `/home/aussie/Desktop/${app.name}.lnk`;
        const content = `app-window:${app.id}`;
        try {
            fs.writeFile(shortcutPath, content);
            appRegistry.setInstalled(app.id, true);
            notify.success("App Installed", `${app.name} has been added to your Desktop.`);
        }
        catch (e) {
            notify.error("Installation Failed", "Could not write to disk.");
        }
        setInstalling(null);
    };
    const openApp = (app) => {
        wm.openWindow(app.id, app.name);
    };
    const filteredApps = apps.filter(a => (category === 'all' || a.category === category) &&
        (a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())));
    const featuredApp = apps.find(a => a.id === 'nba-bot') || apps[0];
    return (_jsxs("div", { className: "h-full flex flex-col bg-os-bg overflow-hidden font-sans text-os-text", children: [_jsxs("div", { className: "hidden md:flex h-16 border-b border-os-border bg-os-panel items-center justify-between px-4 md:px-6 shrink-0 z-10 select-none", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-aussie-500/20 rounded-xl flex items-center justify-center shadow-lg shadow-aussie-500/10 ring-1 ring-aussie-500/20", children: _jsx(ShoppingBag, { className: "w-6 h-6 text-aussie-500" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg md:text-xl font-bold text-white leading-tight", children: "App Store" }), _jsx("p", { className: "text-[10px] md:text-xs text-os-textDim font-medium uppercase tracking-wide", children: "Enterprise Marketplace" })] })] }), _jsxs("div", { className: "relative hidden md:block", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" }), _jsx("input", { className: "bg-[#0a0c10] border border-os-border rounded-full pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-aussie-500 w-64 placeholder-gray-600 transition-all focus:w-72 focus:bg-[#161b22]", placeholder: "Search applications...", value: search, onChange: e => setSearch(e.target.value) })] })] }), _jsxs("div", { className: "flex-1 flex flex-col md:flex-row min-h-0", children: [_jsxs("div", { className: "hidden md:flex w-56 flex-col border-r border-os-border bg-[#0f1115] p-4 gap-2 shrink-0", children: [_jsx("div", { className: "text-xs font-bold text-gray-500 uppercase mb-2 px-2", children: "Discover" }), [
                                { id: 'all', label: 'All Apps', icon: Grid },
                                { id: 'sports', label: 'Sports Bots', icon: Trophy },
                                { id: 'finance', label: 'Finance', icon: Zap },
                                { id: 'utility', label: 'Utilities', icon: Layers },
                            ].map(cat => (_jsxs("button", { onClick: () => setCategory(cat.id), className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${category === cat.id ? 'bg-aussie-500 text-[#0f1216] font-bold shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`, children: [_jsx(cat.icon, { className: `w-4 h-4 ${category === cat.id ? 'text-black' : 'text-gray-500'}` }), cat.label] }, cat.id)))] }), _jsx("div", { className: "md:hidden flex overflow-x-auto p-3 gap-2 border-b border-os-border bg-[#0f1115] scrollbar-hide shrink-0 sticky top-0 z-20", children: ['all', 'sports', 'finance', 'utility'].map(cat => (_jsx("button", { onClick: () => setCategory(cat), className: `px-4 py-1.5 rounded-full text-xs font-bold uppercase border whitespace-nowrap transition-colors ${category === cat ? 'bg-aussie-500 text-black border-aussie-500' : 'bg-transparent text-gray-400 border-gray-700'}`, children: cat }, cat))) }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#0a0c10]", children: [category === 'all' && !search && featuredApp && (_jsxs("div", { className: "mb-8 rounded-2xl bg-gradient-to-r from-[#0f332e] to-[#0a1e3f] border border-aussie-500/20 p-6 md:p-8 text-white flex items-center justify-between relative overflow-hidden shadow-2xl shrink-0 group animate-in slide-in-from-top duration-500", children: [_jsx("div", { className: "absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" }), _jsxs("div", { className: "relative z-10 max-w-lg", children: [_jsx("div", { className: "inline-block px-3 py-1 bg-aussie-500/10 rounded-full text-aussie-500 text-[10px] font-bold uppercase mb-4 border border-aussie-500/20 shadow-sm", children: "Featured App" }), _jsx("h2", { className: "text-2xl md:text-4xl font-bold mb-2 tracking-tight", children: featuredApp.name }), _jsx("p", { className: "text-gray-300 mb-6 text-sm md:text-base leading-relaxed line-clamp-2", children: featuredApp.description }), _jsx("div", { className: "flex gap-3", children: featuredApp.installed ? (_jsxs("button", { onClick: () => openApp(featuredApp), className: "px-6 py-2.5 bg-white text-black rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg", children: [_jsx(Play, { className: "w-4 h-4 fill-current" }), " Open"] })) : (_jsxs("button", { onClick: () => installApp(featuredApp), disabled: !!installing, className: "px-6 py-2.5 bg-aussie-500 text-black rounded-lg font-bold text-sm hover:bg-aussie-600 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,153,0.3)] disabled:opacity-70", children: [installing === featuredApp.id ? _jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : _jsx(Download, { className: "w-4 h-4" }), installing === featuredApp.id ? 'Installing...' : 'Install App'] })) })] }), _jsx("div", { className: "hidden md:flex relative z-10 gap-4 items-center", children: _jsx("div", { className: "w-32 h-32 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-6xl shadow-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-500 select-none", children: featuredApp.name.charAt(0) }) })] })), _jsx("h3", { className: "text-lg font-bold text-white mb-4 flex items-center gap-2 px-1", children: search ? `Search Results for "${search}"` : (category === 'all' ? 'Trending Apps' : `${category.charAt(0).toUpperCase() + category.slice(1)} Apps`) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6", children: filteredApps.map(app => {
                                    const Icon = app.icon || Zap;
                                    const isInstalled = app.installed;
                                    const isInstalling = installing === app.id;
                                    return (_jsxs("div", { className: "bg-[#161b22] border border-os-border rounded-xl p-4 md:p-5 hover:border-aussie-500/40 transition-all group flex flex-col hover:shadow-xl hover:-translate-y-1 duration-300 relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-aussie-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" }), _jsxs("div", { className: "flex items-start gap-4 mb-4 relative z-10", children: [_jsx("div", { className: "w-14 h-14 bg-[#0d1117] rounded-xl flex items-center justify-center border border-os-border group-hover:border-aussie-500/30 transition-colors shrink-0 shadow-inner", children: _jsx(Icon, { className: "w-7 h-7 text-gray-400 group-hover:text-aussie-500 transition-colors", strokeWidth: 1.5 }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("h3", { className: "font-bold text-base text-gray-100 truncate", children: app.name }), _jsx("div", { className: "text-xs text-gray-500 mb-1", children: app.author }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "w-3 h-3 text-yellow-500 fill-yellow-500" }), _jsx("span", { className: "text-xs font-bold text-gray-300", children: "4.9" })] })] })] }), _jsx("p", { className: "text-sm text-gray-400 mb-6 line-clamp-2 flex-1 relative z-10", children: app.description }), _jsxs("div", { className: "mt-auto flex items-center justify-between pt-4 border-t border-gray-800 relative z-10", children: [_jsx("div", { className: "text-xs font-mono text-gray-500", children: app.version }), isInstalled ? (_jsx("button", { onClick: () => openApp(app), className: "px-4 py-1.5 bg-[#21262d] text-white text-xs font-bold rounded-lg border border-gray-700 hover:bg-[#30363d] transition-colors flex items-center gap-2", children: "Open" })) : (_jsx("button", { onClick: () => installApp(app), disabled: !!installing, className: "px-4 py-1.5 bg-aussie-500/10 text-aussie-500 text-xs font-bold rounded-lg border border-aussie-500/20 hover:bg-aussie-500 hover:text-black transition-colors flex items-center gap-2 disabled:opacity-50", children: isInstalling ? _jsx(Loader2, { className: "w-3 h-3 animate-spin" }) : 'Get' }))] })] }, app.id));
                                }) }), filteredApps.length === 0 && (_jsxs("div", { className: "text-center py-20 opacity-50 flex flex-col items-center gap-2", children: [_jsx(Search, { className: "w-8 h-8 text-gray-600" }), _jsx("p", { children: "No apps found." })] }))] })] })] }));
};
