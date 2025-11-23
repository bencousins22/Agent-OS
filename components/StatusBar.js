import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { GitBranch, AlertCircle, XCircle, Check, Wifi } from 'lucide-react';
import { realGit } from '../services/gitReal';
export const StatusBar = React.memo(({ activeTab }) => {
    const [branch, setBranch] = useState('main');
    const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await realGit.status('/workspace');
                // Simple parse to detect branch
                const match = res.stdout.match(/On branch (.+)/);
                if (match)
                    setBranch(match[1]);
                setIsDirty(!res.stdout.includes('working tree clean'));
            }
            catch (e) { }
        };
        fetchStatus();
        const i = setInterval(fetchStatus, 5000);
        return () => clearInterval(i);
    }, []);
    return (_jsxs("div", { className: "h-6 bg-os-panel border-t border-aussie-500/30 flex items-center justify-between px-3 text-[10px] text-os-textDim select-none shrink-0 z-40", children: [_jsxs("div", { className: "flex items-center gap-4 h-full", children: [_jsxs("div", { className: "flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors", children: [_jsx(GitBranch, { className: "w-3 h-3" }), _jsx("span", { className: "font-medium", children: branch }), isDirty && _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-yellow-500 ml-1" })] }), _jsxs("div", { className: "flex items-center gap-2 hover:text-white cursor-pointer transition-colors", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(XCircle, { className: "w-3 h-3" }), " 0"] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(AlertCircle, { className: "w-3 h-3" }), " 0"] })] })] }), _jsxs("div", { className: "flex items-center gap-4 h-full", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-aussie-500 cursor-pointer hover:bg-aussie-500/10 px-2 h-full rounded", children: [_jsx(Wifi, { className: "w-3 h-3" }), _jsx("span", { children: "Go Live" })] }), _jsxs("div", { className: "hover:text-white cursor-pointer", children: ["Ln ", Math.floor(Math.random() * 50) + 1, ", Col ", Math.floor(Math.random() * 20) + 1] }), _jsx("div", { className: "hover:text-white cursor-pointer", children: "UTF-8" }), _jsx("div", { className: "flex items-center gap-1.5 hover:text-white cursor-pointer font-bold text-aussie-500", children: activeTab ? (_jsxs(_Fragment, { children: [activeTab.language === 'typescript' && _jsx("span", { className: "text-blue-400", children: "TS" }), activeTab.language === 'javascript' && _jsx("span", { className: "text-yellow-400", children: "JS" }), activeTab.language === 'json' && _jsx("span", { className: "text-orange-400", children: "JSON" }), activeTab.language === 'markdown' && _jsx("span", { className: "text-purple-400", children: "MD" }), activeTab.language.toUpperCase()] })) : 'TXT' }), _jsxs("div", { className: "hover:text-white cursor-pointer", children: [_jsx(Check, { className: "w-3 h-3" }), " Prettier"] })] })] }));
});
