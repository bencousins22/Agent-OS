import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { X, Settings, User, ChevronRight, LogOut, Shield, LayoutGrid } from 'lucide-react';
export const MobileSidebar = ({ isOpen, onClose, activeView, onNavigate, menuItems }) => {
    // Define navigation groups for better organization
    const groups = {
        'Apps': ['dashboard', 'marketplace', 'projects', 'browser'],
        'Development': ['code', 'flow', 'github', 'deploy', 'scheduler'],
        'System': ['settings']
    };
    // Helper to find icon for a view
    const getIcon = (view) => {
        const item = menuItems.find(i => i.view === view);
        if (item)
            return item.icon;
        if (view === 'settings')
            return Settings;
        return LayoutGrid;
    };
    const getLabel = (view) => {
        const item = menuItems.find(i => i.view === view);
        if (item)
            return item.tooltip;
        return view.charAt(0).toUpperCase() + view.slice(1);
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: `fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`, onClick: onClose }), _jsxs("div", { className: `
                fixed inset-y-0 left-0 w-[85%] max-w-[300px] bg-[#0f1216]/95 backdrop-blur-2xl border-r border-os-border z-[80] 
                transform transition-transform duration-300 ease-out flex flex-col shadow-2xl
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `, children: [_jsxs("div", { className: "relative px-6 pt-safe pb-6 border-b border-os-border bg-gradient-to-b from-[#161b22] to-[#0f1216] shrink-0 flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-4 mt-2", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-gradient-to-br from-aussie-500 to-emerald-600 flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-aussie-500/20 ring-2 ring-white/5", children: _jsx(User, { className: "w-6 h-6" }) }), _jsx("div", { className: "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#0f1216] rounded-full flex items-center justify-center", children: _jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full animate-pulse" }) })] }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-base leading-tight", children: "Admin User" }), _jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [_jsx(Shield, { className: "w-3 h-3 text-aussie-500" }), _jsx("span", { className: "text-[10px] text-aussie-500 font-medium tracking-wide uppercase", children: "System Admin" })] })] })] }), _jsx("button", { onClick: onClose, className: "p-2 -mr-2 text-gray-400 hover:text-white active:scale-95 transition-transform", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto px-3 py-4 custom-scrollbar space-y-6 pb-safe", children: Object.entries(groups).map(([groupName, views]) => (_jsxs("div", { children: [_jsxs("div", { className: "px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2", children: [groupName, _jsx("div", { className: "h-px bg-gray-800 flex-1" })] }), _jsx("div", { className: "space-y-1", children: views.map(view => {
                                        const viewKey = view;
                                        const Icon = getIcon(viewKey);
                                        const isActive = activeView === viewKey;
                                        return (_jsxs("button", { onClick: () => { onNavigate(viewKey); onClose(); }, className: `
                                                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 active:scale-[0.98]
                                                ${isActive
                                                ? 'bg-aussie-500/10 text-aussie-500 border border-aussie-500/20 shadow-sm'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
                                            `, children: [_jsx(Icon, { className: `w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}` }), _jsx("span", { className: `text-sm ${isActive ? 'font-bold' : 'font-medium'}`, children: getLabel(viewKey) }), isActive && _jsx(ChevronRight, { className: "w-4 h-4 ml-auto opacity-50" })] }, view));
                                    }) })] }, groupName))) }), _jsxs("div", { className: "p-4 border-t border-os-border bg-[#0a0c10] pb-safe shrink-0", children: [_jsxs("button", { className: "w-full flex items-center gap-3 px-3 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors group border border-transparent hover:border-red-500/20", children: [_jsx(LogOut, { className: "w-5 h-5 group-hover:-translate-x-1 transition-transform" }), _jsx("span", { className: "font-medium text-sm", children: "Log Out" })] }), _jsxs("div", { className: "mt-4 text-center text-[10px] text-gray-600 font-mono flex justify-center items-center gap-2", children: [_jsx("span", { children: "Aussie OS v2.2.1" }), _jsx("span", { className: "w-1 h-1 bg-gray-600 rounded-full" }), _jsx("span", { children: "Mobile" })] })] })] })] }));
};
