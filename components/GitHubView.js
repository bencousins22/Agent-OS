import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { realGit } from '../services/gitReal';
import { Github, GitBranch, UploadCloud, DownloadCloud, Check, Plus, AlertTriangle, Terminal, RefreshCw } from 'lucide-react';
import { notify } from '../services/notification';
import { github } from '../services/github';
export const GitHubView = () => {
    const [statusItems, setStatusItems] = useState([]);
    const [commitMsg, setCommitMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastLog, setLastLog] = useState('');
    const [user, setUser] = useState(null);
    const logEndRef = useRef(null);
    const refresh = async () => {
        setIsLoading(true);
        try {
            if (github.hasToken()) {
                if (!user) {
                    const userData = await github.getUser();
                    setUser(userData);
                }
            }
            else {
                setUser(null);
            }
            const items = await realGit.getStatusJson('/workspace');
            setStatusItems(items);
            const logRes = await realGit.log('/workspace');
            setLastLog(logRes.stdout);
        }
        catch (e) {
            // Silently fail if not a git repo yet
        }
        setIsLoading(false);
    };
    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 5000);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [lastLog]);
    const handleStage = async (path) => {
        await realGit.add('/workspace', path);
        refresh();
    };
    const handleCommit = async () => {
        if (!commitMsg)
            return;
        setIsLoading(true);
        const res = await realGit.commit('/workspace', commitMsg);
        if (res.exitCode === 0) {
            notify.success('Git Commit', 'Changes committed successfully.');
            setCommitMsg('');
            refresh();
        }
        else {
            notify.error('Commit Failed', res.stderr);
        }
        setIsLoading(false);
    };
    const handlePush = async () => {
        if (!user)
            return notify.error("Not Connected", "Please connect your GitHub account in Settings.");
        notify.error('Push Unavailable', 'Pushing from the browser build requires a network-enabled git proxy. Use the CLI or configure a backend hook.');
    };
    return (_jsxs("div", { className: "h-full bg-os-bg flex flex-col text-os-text font-sans overflow-hidden", children: [_jsxs("div", { className: "h-14 border-b border-os-border flex items-center justify-between px-4 bg-os-panel shrink-0", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Github, { className: "w-5 h-5 text-white" }), _jsx("h2", { className: "font-bold text-white text-sm uppercase tracking-wider hidden md:block", children: "Source Control" }), _jsx("h2", { className: "font-bold text-white text-lg md:hidden", children: "Git" })] }), user && (_jsxs("div", { className: "flex items-center gap-2 bg-os-bg px-2 py-1 rounded-full border border-os-border", children: [_jsx("img", { src: user.avatar_url, className: "w-5 h-5 rounded-full" }), _jsx("span", { className: "text-xs font-bold text-os-text hidden md:inline", children: user.login })] }))] }), !user ? (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-os-textDim text-center p-8", children: [_jsx("div", { className: "w-16 h-16 bg-os-panel rounded-full flex items-center justify-center mb-4 border border-os-border", children: _jsx(AlertTriangle, { className: "w-8 h-8 text-yellow-500" }) }), _jsx("h3", { className: "text-lg font-bold text-white mb-2", children: "Not Connected" }), _jsx("p", { className: "text-sm max-w-xs leading-relaxed mb-6", children: "Connect your GitHub account in Settings to enable push, pull, and sync features." })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "px-4 py-3 border-b border-os-border bg-os-bg flex items-center justify-between shrink-0", children: [_jsxs("div", { className: "flex items-center gap-2 font-mono text-xs text-aussie-500 font-bold", children: [_jsx(GitBranch, { className: "w-3.5 h-3.5" }), "main"] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("button", { onClick: refresh, className: `p-1.5 hover:bg-white/5 rounded text-os-textDim hover:text-white ${isLoading ? 'animate-spin' : ''}`, children: _jsx(RefreshCw, { className: "w-3.5 h-3.5" }) }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("div", { className: "px-4 py-3", children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: _jsxs("h3", { className: "text-[10px] font-bold text-os-textDim uppercase tracking-wider", children: ["Changes (", statusItems.length, ")"] }) }), statusItems.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-os-textDim/40 gap-2 border border-dashed border-os-border rounded-xl bg-os-panel/30", children: [_jsx(Check, { className: "w-8 h-8" }), _jsx("span", { className: "text-xs", children: "Working tree clean" })] })) : (_jsx("div", { className: "space-y-1", children: statusItems.map(item => (_jsxs("div", { className: "flex items-center justify-between p-3 md:p-2 rounded-lg hover:bg-os-panel group transition-colors border border-transparent hover:border-os-border active:bg-os-panel/50", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("span", { className: `text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${item.status === 'new' ? 'bg-green-500/20 text-green-400' : item.status === 'modified' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`, children: item.status.substring(0, 1) }), _jsx("span", { className: "text-xs font-mono text-gray-300 truncate", children: item.path })] }), _jsx("button", { onClick: () => handleStage(item.path), className: "p-2 md:p-1 text-aussie-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all", title: "Stage Changes", children: _jsx(Plus, { className: "w-5 h-5 md:w-4 md:h-4" }) })] }, item.path))) }))] }) }), _jsxs("div", { className: "h-32 md:h-36 border-t border-os-border bg-[#0a0c10] flex flex-col shrink-0", children: [_jsxs("div", { className: "px-3 py-1.5 border-b border-os-border flex items-center gap-2 text-[10px] font-bold text-gray-500 bg-os-panel uppercase tracking-wider", children: [_jsx(Terminal, { className: "w-3 h-3" }), "Git Output"] }), _jsxs("div", { className: "flex-1 p-3 font-mono text-[10px] text-gray-500 overflow-y-auto whitespace-pre-wrap", children: [lastLog || "No activity recorded.", _jsx("div", { ref: logEndRef })] })] }), _jsxs("div", { className: "p-4 bg-os-panel border-t border-os-border shrink-0 pb-20 md:pb-4", children: [_jsx("textarea", { value: commitMsg, onChange: e => setCommitMsg(e.target.value), placeholder: "Commit Message (Cmd+Enter)", className: "w-full bg-os-bg border border-os-border rounded-lg p-3 text-base md:text-xs font-mono outline-none focus:border-aussie-500 transition-colors h-20 md:h-14 resize-none mb-3 text-gray-300 placeholder-gray-600", onKeyDown: e => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey))
                                        handleCommit();
                                } }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: handleCommit, disabled: statusItems.length === 0 || !commitMsg, className: "flex-1 py-3 md:py-2 bg-aussie-500 hover:bg-aussie-600 disabled:opacity-50 disabled:cursor-not-allowed text-os-bg font-bold rounded-lg text-sm md:text-xs shadow-lg shadow-aussie-500/20 transition-all active:scale-95 flex items-center justify-center gap-2", children: [_jsx(Check, { className: "w-4 h-4 md:w-3.5 md:h-3.5" }), " Commit"] }), _jsx("button", { onClick: handlePush, title: "Push Changes", className: "px-4 py-2 bg-os-bg hover:bg-os-active border border-os-border rounded-lg text-gray-300 hover:text-white transition-all active:scale-95", children: _jsx(UploadCloud, { className: "w-5 h-5 md:w-4 md:h-4" }) }), _jsx("button", { onClick: refresh, title: "Fetch Remote", className: "px-4 py-2 bg-os-bg hover:bg-os-active border border-os-border rounded-lg text-gray-300 hover:text-white transition-all active:scale-95", children: _jsx(DownloadCloud, { className: "w-5 h-5 md:w-4 md:h-4" }) })] })] })] }))] }));
};
