import React, { useEffect, useState } from 'react';
import { Shield, Terminal, WifiOff, HardDrive, Lock } from 'lucide-react';
import { kernelManager, KernelPermissions } from '../services/kernel';
import { bus } from '../services/eventBus';

interface Props {
    className?: string;
}

export const KernelShield: React.FC<Props> = ({ className = '' }) => {
    const [perms, setPerms] = useState<KernelPermissions>(kernelManager.getPermissions());
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const off = bus.subscribe((e) => {
            if (e.type === 'kernel-permissions-changed') {
                setPerms(e.payload as KernelPermissions);
            }
        });
        return () => off();
    }, []);

    const toggle = (key: keyof KernelPermissions, value: KernelPermissions[typeof key]) => {
        kernelManager.setPermissions({ [key]: value } as Partial<KernelPermissions>);
        setPerms(kernelManager.getPermissions());
    };

    const badge = perms.sandboxed ? 'Sandboxed' : 'Elevated';
    const badgeColor = perms.sandboxed ? 'text-amber-400' : 'text-green-400';

    return (
        <div className={`pointer-events-auto ${className}`}>
            <button 
                onClick={() => setOpen(o => !o)} 
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#111827] border border-white/10 text-xs font-bold text-gray-200 shadow-lg shadow-black/20 hover:border-aussie-500/50 transition-colors"
                aria-expanded={open}
            >
                <Shield className={`w-4 h-4 ${badgeColor}`} />
                <span className={badgeColor}>{badge}</span>
            </button>

            {open && (
                <div className="mt-2 w-64 bg-[#0f1216] border border-white/10 rounded-xl shadow-2xl p-3 space-y-3 text-xs text-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="font-bold">File System</span>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => toggle('fs', 'read')} 
                                className={`px-2 py-1 rounded ${perms.fs === 'read' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`}
                            >Read</button>
                            <button 
                                onClick={() => toggle('fs', 'readwrite')} 
                                className={`px-2 py-1 rounded ${perms.fs === 'readwrite' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`}
                            >RW</button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1"><Terminal className="w-4 h-4 text-gray-400" />Shell</span>
                        <button 
                            onClick={() => toggle('shell', perms.shell === 'allow' ? 'deny' : 'allow')}
                            className={`px-2 py-1 rounded ${perms.shell === 'allow' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`}
                        >
                            {perms.shell === 'allow' ? 'Allow' : 'Deny'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1"><WifiOff className="w-4 h-4 text-gray-400" />Network</span>
                        <button 
                            onClick={() => toggle('network', perms.network === 'allow' ? 'deny' : 'allow')}
                            className={`px-2 py-1 rounded ${perms.network === 'allow' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`}
                        >
                            {perms.network === 'allow' ? 'Allow' : 'Deny'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1"><HardDrive className="w-4 h-4 text-gray-400" />Notifications</span>
                        <button 
                            onClick={() => toggle('notifications', !perms.notifications)}
                            className={`px-2 py-1 rounded ${perms.notifications ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`}
                        >
                            {perms.notifications ? 'On' : 'Off'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1"><Lock className="w-4 h-4 text-gray-400" />Sandbox</span>
                        <button 
                            onClick={() => toggle('sandboxed', !perms.sandboxed)}
                            className={`px-2 py-1 rounded ${perms.sandboxed ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`}
                        >
                            {perms.sandboxed ? 'On' : 'Off'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
