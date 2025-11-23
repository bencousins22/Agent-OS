import React, { useState, useEffect } from 'react';
import { GitBranch, Wifi, Activity, LayoutGrid, Bell, FileText } from 'lucide-react';
import { realGit } from '../services/gitReal';
import { EditorTab } from '../types';
import { useSystemPulse } from '../hooks/useSystemPulse';

interface Props {
    activeTab: EditorTab | undefined;
    cursor?: { line: number; column: number; path?: string | null };
}

export const StatusBar: React.FC<Props> = React.memo(({ activeTab, cursor }) => {
    const [branch, setBranch] = useState('main');
    const [isDirty, setIsDirty] = useState(false);
    const pulse = useSystemPulse(3500);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await realGit.status('/workspace');
                const match = res.stdout.match(/On branch (.+)/);
                if (match) setBranch(match[1]);
                setIsDirty(!res.stdout.includes('working tree clean'));
            } catch(e) {}
        };
        fetchStatus();
        const i = setInterval(fetchStatus, 5000);
        return () => clearInterval(i);
    }, []);

    const cursorLabel = cursor?.line
        ? `Ln ${cursor.line}, Col ${cursor.column}`
        : 'Ln -, Col -';

    const fileLabel = cursor?.path || activeTab?.path || 'No active file';
    const lang = activeTab?.language?.toUpperCase() || 'TXT';
    const lastAlert = pulse.lastNotification ? pulse.lastNotification.slice(0, 40) : 'System stable';

    return (
        <div className="h-7 bg-os-panel border-t border-aussie-500/30 flex items-center justify-between px-3 text-[10px] text-os-textDim select-none shrink-0 z-40">
            <div className="flex items-center gap-3 h-full overflow-hidden">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-os-border">
                    <GitBranch className="w-3 h-3" />
                    <span className="font-medium truncate max-w-[80px]">{branch}</span>
                    {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 ml-1" />}
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-os-border max-w-[240px]">
                    <FileText className="w-3 h-3" />
                    <span className="truncate">{fileLabel}</span>
                </div>

                <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-os-border text-white/70">
                    {cursorLabel}
                </div>
            </div>

            <div className="flex items-center gap-3 h-full">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${pulse.online ? 'bg-aussie-500/10 border-aussie-500/30 text-aussie-500' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    <Wifi className="w-3 h-3" />
                    <span className="font-bold">{pulse.online ? 'Online' : 'Offline'}</span>
                    <span className="text-[9px] opacity-80">{pulse.latencyMs}ms</span>
                </div>

                <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-os-border">
                    <Activity className="w-3 h-3 text-aussie-500" />
                    <span className="font-bold text-white">{pulse.activeTasks}</span>
                    <span className="text-[9px] text-gray-400">running</span>
                    <span className="text-[9px] text-gray-600">/ {pulse.completedTasks} done</span>
                </div>

                <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-os-border">
                    <LayoutGrid className="w-3 h-3 text-gray-400" />
                    <span>{pulse.openWindows} windows</span>
                    <span className="text-[9px] text-gray-500">{pulse.installedApps} apps</span>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-os-border font-bold text-aussie-500">
                    {lang}
                </div>

                <div className="hidden sm:flex items-center gap-1 text-gray-400 px-2 py-1 rounded bg-white/5 border border-os-border max-w-[180px]">
                    <Bell className="w-3 h-3" />
                    <span className="truncate">{lastAlert}</span>
                </div>
            </div>
        </div>
    );
});
