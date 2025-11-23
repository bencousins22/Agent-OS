import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Shield, Terminal, WifiOff, HardDrive, Lock } from 'lucide-react';
import { kernelManager } from '../services/kernel';
import { bus } from '../services/eventBus';
export const KernelShield = ({ className = '' }) => {
    const [perms, setPerms] = useState(kernelManager.getPermissions());
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const off = bus.subscribe((e) => {
            if (e.type === 'kernel-permissions-changed') {
                setPerms(e.payload);
            }
        });
        return () => off();
    }, []);
    const toggle = (key, value) => {
        kernelManager.setPermissions({ [key]: value });
        setPerms(kernelManager.getPermissions());
    };
    const badge = perms.sandboxed ? 'Sandboxed' : 'Elevated';
    const badgeColor = perms.sandboxed ? 'text-amber-400' : 'text-green-400';
    return (_jsxs("div", { className: `pointer-events-auto ${className}`, children: [_jsxs("button", { onClick: () => setOpen(o => !o), className: "flex items-center gap-2 px-3 py-2 rounded-full bg-[#111827] border border-white/10 text-xs font-bold text-gray-200 shadow-lg shadow-black/20 hover:border-aussie-500/50 transition-colors", "aria-expanded": open, children: [_jsx(Shield, { className: `w-4 h-4 ${badgeColor}` }), _jsx("span", { className: badgeColor, children: badge })] }), open && (_jsxs("div", { className: "mt-2 w-64 bg-[#0f1216] border border-white/10 rounded-xl shadow-2xl p-3 space-y-3 text-xs text-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-bold", children: "File System" }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => toggle('fs', 'read'), className: `px-2 py-1 rounded ${perms.fs === 'read' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`, children: "Read" }), _jsx("button", { onClick: () => toggle('fs', 'readwrite'), className: `px-2 py-1 rounded ${perms.fs === 'readwrite' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`, children: "RW" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Terminal, { className: "w-4 h-4 text-gray-400" }), "Shell"] }), _jsx("button", { onClick: () => toggle('shell', perms.shell === 'allow' ? 'deny' : 'allow'), className: `px-2 py-1 rounded ${perms.shell === 'allow' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`, children: perms.shell === 'allow' ? 'Allow' : 'Deny' })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(WifiOff, { className: "w-4 h-4 text-gray-400" }), "Network"] }), _jsx("button", { onClick: () => toggle('network', perms.network === 'allow' ? 'deny' : 'allow'), className: `px-2 py-1 rounded ${perms.network === 'allow' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`, children: perms.network === 'allow' ? 'Allow' : 'Deny' })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(HardDrive, { className: "w-4 h-4 text-gray-400" }), "Notifications"] }), _jsx("button", { onClick: () => toggle('notifications', !perms.notifications), className: `px-2 py-1 rounded ${perms.notifications ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`, children: perms.notifications ? 'On' : 'Off' })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Lock, { className: "w-4 h-4 text-gray-400" }), "Sandbox"] }), _jsx("button", { onClick: () => toggle('sandboxed', !perms.sandboxed), className: `px-2 py-1 rounded ${perms.sandboxed ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`, children: perms.sandboxed ? 'On' : 'Off' })] })] }))] }));
};
