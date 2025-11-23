import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Settings, Github, CheckCircle, Cloud, Box, Zap, Lock, Monitor, Image as ImageIcon } from 'lucide-react';
import { github } from '../services/github';
import { deployment } from '../services/deployment';
import { notify } from '../services/notification';
import { dashboardState, WALLPAPERS } from '../services/dashboardState';
export const SettingsView = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [pat, setPat] = useState('');
    const [user, setUser] = useState(null);
    const [isLoadingGh, setIsLoadingGh] = useState(false);
    const [keys, setKeys] = useState({ render: '', vercel: '', replit: '', netlify: '' });
    const [julesKey, setJulesKey] = useState('');
    const [currentWallpaper, setCurrentWallpaper] = useState(dashboardState.getWallpaper());
    useEffect(() => {
        if (github.hasToken()) {
            setIsLoadingGh(true);
            github.getUser().then(setUser).catch(() => setUser(null)).finally(() => setIsLoadingGh(false));
        }
        setKeys({
            render: deployment.getApiKey('render') || '',
            vercel: deployment.getApiKey('vercel') || '',
            replit: deployment.getApiKey('replit') || '',
            netlify: deployment.getApiKey('netlify') || ''
        });
        setJulesKey(localStorage.getItem('jules_trading_key') || '');
        const unsub = dashboardState.subscribe(state => setCurrentWallpaper(state.wallpaper));
        return () => unsub();
    }, []);
    const handleGitHubSave = async () => {
        if (!pat)
            return;
        setIsLoadingGh(true);
        github.saveToken(pat);
        try {
            const userData = await github.getUser();
            setUser(userData);
            notify.success('GitHub Connected', `Authenticated as ${userData.login}.`);
            setPat('');
        }
        catch (e) {
            setUser(null);
            notify.error('Authentication Failed', e.message);
        }
        finally {
            setIsLoadingGh(false);
        }
    };
    const handleKeySave = (provider, value) => {
        deployment.setApiKey(provider, value);
        setKeys(prev => ({ ...prev, [provider]: value }));
        notify.success('Key Saved', `${provider} API Key updated.`);
    };
    const handleJulesKeySave = () => {
        localStorage.setItem('jules_trading_key', julesKey);
        notify.success('Jules Key Saved', 'Trading API Key securely stored.');
    };
    const handleWallpaperChange = (wp) => {
        dashboardState.setWallpaper(wp);
        notify.info("Wallpaper Updated", `Changed to ${wp.name}`);
    };
    return (_jsxs("div", { className: "h-full bg-os-bg flex flex-col text-os-text overflow-hidden", children: [_jsxs("div", { className: "hidden md:flex p-4 md:p-6 border-b border-os-border bg-os-panel items-center gap-4 shrink-0 sticky top-0 z-10", children: [_jsx("div", { className: "p-2 bg-aussie-500/10 rounded-lg", children: _jsx(Settings, { className: "w-6 h-6 text-aussie-500" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg md:text-xl font-bold text-white", children: "System Settings" }), _jsx("p", { className: "text-xs md:text-sm text-os-textDim", children: "Manage preferences and identity." })] })] }), _jsxs("div", { className: "flex border-b border-os-border bg-[#0f1216] sticky top-0 z-10", children: [_jsx(TabButton, { label: "General", icon: Lock, active: activeTab === 'general', onClick: () => setActiveTab('general') }), _jsx(TabButton, { label: "Appearance", icon: ImageIcon, active: activeTab === 'appearance', onClick: () => setActiveTab('appearance') })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6", children: _jsxs("div", { className: "max-w-5xl mx-auto space-y-6", children: [activeTab === 'general' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-os-panel border border-os-border rounded-xl p-6 relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-aussie-500/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none" }), _jsxs("div", { className: "flex items-center gap-3 mb-4 relative z-10", children: [_jsx(Lock, { className: "w-5 h-5 text-green-400" }), _jsx("h3", { className: "font-bold text-lg text-white", children: "Security & Keys" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10", children: [_jsxs("div", { className: "bg-[#0a0c10] rounded-lg border border-os-border p-4 flex flex-col justify-between gap-2", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold text-os-textDim uppercase", children: "Kernel API Key" }), _jsxs("div", { className: "text-sm text-green-400 flex items-center gap-2 mt-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-green-500 animate-pulse" }), "Active (Environment)"] })] }), _jsx("div", { className: "font-mono text-xs text-gray-500 bg-white/5 px-3 py-2 rounded border border-white/5 truncate max-w-full", children: process.env.API_KEY ? `••••••••${process.env.API_KEY.slice(-4)}` : 'N/A' })] }), _jsxs("div", { className: "bg-[#0a0c10] rounded-lg border border-os-border p-4 flex flex-col justify-between gap-2", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold text-os-textDim uppercase", children: "Jules Trading API Key" }), _jsx("p", { className: "text-[10px] text-gray-500", children: "Required for Bot Execution" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "password", value: julesKey, onChange: e => setJulesKey(e.target.value), className: "flex-1 bg-transparent border-b border-gray-700 py-1 text-xs font-mono text-white outline-none focus:border-aussie-500", placeholder: "Enter Key..." }), _jsx("button", { onClick: handleJulesKeySave, className: "text-xs font-bold text-aussie-500 hover:text-white", children: "SAVE" })] })] })] })] }), _jsxs("div", { className: "bg-os-panel border border-os-border rounded-xl p-6 flex flex-col", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(Github, { className: "w-6 h-6 text-white" }), _jsx("h3", { className: "font-bold text-lg text-white", children: "GitHub Integration" })] }), user ? (_jsxs("div", { className: "bg-green-500/5 border border-green-500/20 rounded-xl p-4 flex items-center gap-4", children: [_jsx("img", { src: user.avatar_url, className: "w-12 h-12 rounded-full", alt: "avatar" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-xs text-green-400 font-bold uppercase", children: "Connected" }), _jsx("div", { className: "font-bold text-white truncate", children: user.login })] })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("input", { type: "password", value: pat, onChange: e => setPat(e.target.value), placeholder: "Personal Access Token", className: "w-full bg-os-bg border border-os-border rounded-lg p-3 text-[16px] md:text-sm font-mono outline-none focus:border-aussie-500" }), _jsx("button", { onClick: handleGitHubSave, disabled: isLoadingGh || !pat, className: "w-full py-3 bg-white text-black font-bold rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50", children: isLoadingGh ? 'Connecting...' : 'Connect' }), _jsx("a", { href: "https://github.com/settings/tokens", target: "_blank", rel: "noreferrer", className: "text-xs text-aussie-500 hover:underline block text-center", children: "Generate Token" })] }))] }), _jsxs("div", { className: "bg-os-panel border border-os-border rounded-xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsx(Cloud, { className: "w-6 h-6 text-purple-400" }), _jsx("h3", { className: "font-bold text-lg text-white", children: "Cloud Providers" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(APIKeyInput, { label: "Render", icon: Cloud, value: keys.render, onChange: (v) => handleKeySave('render', v), color: "text-purple-400" }), _jsx(APIKeyInput, { label: "Vercel", icon: Zap, value: keys.vercel, onChange: (v) => handleKeySave('vercel', v), color: "text-white" }), _jsx(APIKeyInput, { label: "Replit", icon: Box, value: keys.replit, onChange: (v) => handleKeySave('replit', v), color: "text-orange-400" }), _jsx(APIKeyInput, { label: "Netlify", icon: Cloud, value: keys.netlify, onChange: (v) => handleKeySave('netlify', v), color: "text-cyan-400" })] })] })] })), activeTab === 'appearance' && (_jsxs("div", { className: "bg-os-panel border border-os-border rounded-xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsx(Monitor, { className: "w-6 h-6 text-blue-400" }), _jsx("h3", { className: "font-bold text-lg text-white", children: "Desktop Wallpaper" })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: WALLPAPERS.map(wp => (_jsxs("div", { onClick: () => handleWallpaperChange(wp), className: `
                                            aspect-video rounded-lg cursor-pointer border-2 relative overflow-hidden group transition-all
                                            ${currentWallpaper.id === wp.id ? 'border-aussie-500 shadow-[0_0_15px_rgba(0,229,153,0.3)] scale-[1.02]' : 'border-transparent hover:border-gray-500'}
                                        `, children: [_jsx("div", { className: `w-full h-full ${wp.value}`, style: wp.type === 'image' ? { backgroundImage: `url(${wp.value})`, backgroundSize: 'cover' } : {} }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity", children: wp.name }), currentWallpaper.id === wp.id && (_jsx("div", { className: "absolute top-2 right-2 bg-aussie-500 text-black rounded-full p-1", children: _jsx(CheckCircle, { className: "w-3 h-3" }) }))] }, wp.id))) })] }))] }) })] }));
};
const TabButton = ({ label, icon: Icon, active, onClick }) => (_jsxs("button", { onClick: onClick, className: `flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold transition-colors border-b-2 ${active ? 'text-aussie-500 border-aussie-500 bg-white/5' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), " ", label] }));
const APIKeyInput = ({ label, icon: Icon, value, onChange, color }) => (_jsxs("div", { className: "bg-[#0a0c10] border border-os-border rounded-lg p-4 focus-within:border-aussie-500/50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Icon, { className: `w-4 h-4 ${color}` }), _jsx("label", { className: "text-sm font-bold text-gray-300", children: label }), value && _jsx(CheckCircle, { className: "w-3 h-3 text-green-500 ml-auto" })] }), _jsx("input", { type: "password", value: value, onChange: e => onChange(e.target.value), placeholder: "Enter API Key", className: "w-full bg-transparent border-b border-gray-700 py-2 text-[16px] md:text-sm font-mono text-white outline-none placeholder-gray-700 focus:border-aussie-500" })] }));
