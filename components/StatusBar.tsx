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
        <div className="h-8 md:h-9 bg-os-panel/95 backdrop-blur-md border-t border-aussie-500/20 flex items-center justify-between px-4 md:px-5 text-[11px] md:text-xs text-os-textDim select-none shrink-0 z-40 shadow-lg">
            <div className="flex items-center gap-3 md:gap-4 h-full overflow-hidden">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-os-border hover:border-aussie-500/30 transition-colors shadow-sm">
                    <GitBranch className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="font-semibold truncate max-w-[100px]">{branch}</span>
                    {isDirty && <span className="w-2 h-2 rounded-full bg-yellow-500 ml-1 animate-pulse shadow-glow" />}
                </div>

                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-os-border hover:border-white/10 transition-colors max-w-[280px] shadow-sm">
                    <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-aussie-500" />
                    <span className="truncate font-medium">{fileLabel}</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-os-border text-white font-semibold shadow-sm">
                    {cursorLabel}
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4 h-full">
                <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border shadow-sm transition-all ${pulse.online ? 'bg-aussie-500/10 border-aussie-500/30 text-aussie-500' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    <Wifi className={`w-3.5 h-3.5 md:w-4 md:h-4 ${pulse.online ? 'animate-pulse' : ''}`} />
                    <span className="font-bold">{pulse.online ? 'Online' : 'Offline'}</span>
                    <span className="text-[10px] opacity-80">{pulse.latencyMs}ms</span>
                </div>

                <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-os-border hover:border-aussie-500/20 transition-colors shadow-sm">
                    <Activity className="w-4 h-4 text-aussie-500" />
                    <span className="font-bold text-white">{pulse.activeTasks}</span>
                    <span className="text-[10px] text-gray-400">running</span>
                    <span className="text-[10px] text-gray-600">/ {pulse.completedTasks} done</span>
                </div>

                <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-os-border hover:border-white/10 transition-colors shadow-sm">
                    <LayoutGrid className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{pulse.openWindows} windows</span>
                    <span className="text-[10px] text-gray-500">{pulse.installedApps} apps</span>
                </div>

                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-aussie-500/10 border border-aussie-500/30 font-bold text-aussie-500 shadow-sm">
                    {lang}
                </div>

                <div className="hidden xl:flex items-center gap-2 text-gray-400 px-2.5 py-1.5 rounded-lg bg-white/5 border border-os-border max-w-[200px] hover:border-white/10 transition-colors shadow-sm">
                    <Bell className="w-4 h-4" />
                    <span className="truncate font-medium">{lastAlert}</span>
                </div>
            </div>
        </div>
    );
});
