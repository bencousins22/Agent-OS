
import React from 'react';
import { Monitor, Cpu, Wifi, Activity, LayoutGrid, Bell } from 'lucide-react';
import { useSystemPulse } from '../hooks/useSystemPulse';

export const SystemInfo: React.FC = () => {
    const pulse = useSystemPulse(3000);

    const tiles = [
        {
            icon: Wifi,
            label: 'Network',
            value: pulse.online ? 'Online' : 'Offline',
            sub: `${pulse.latencyMs}ms loop`,
            tone: pulse.online ? 'text-aussie-500' : 'text-red-400'
        },
        {
            icon: Activity,
            label: 'Tasks',
            value: `${pulse.activeTasks} running`,
            sub: `${pulse.completedTasks} completed`,
            tone: 'text-blue-400'
        },
        {
            icon: LayoutGrid,
            label: 'Workspace',
            value: `${pulse.openWindows} windows`,
            sub: `${pulse.installedApps} apps`,
            tone: 'text-purple-400'
        },
        {
            icon: Bell,
            label: 'Last Alert',
            value: pulse.lastNotification ? pulse.lastNotification.slice(0, 30) : 'Clear',
            sub: pulse.lastUpdated ? new Date(pulse.lastUpdated).toLocaleTimeString() : '',
            tone: 'text-yellow-400'
        }
    ];

    return (
        <div className="h-full bg-[#0f1216] p-6 text-white flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
                <div className="w-16 h-16 bg-aussie-500 rounded-2xl flex items-center justify-center text-black text-2xl font-bold shadow-lg">
                    A
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        Aussie OS
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${pulse.online ? 'border-aussie-500/30 text-aussie-500' : 'border-red-500/30 text-red-400'}`}>
                            {pulse.online ? 'Live' : 'Offline'}
                        </span>
                    </h1>
                    <p className="text-gray-400 text-sm">Version 2.2.1</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-2 rounded-lg border border-os-border">
                    <Monitor className="w-4 h-4" />
                    <span>Updated {new Date(pulse.lastUpdated).toLocaleTimeString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tiles.map(tile => {
                    const Icon = tile.icon;
                    return (
                        <div key={tile.label} className="bg-[#161b22] p-4 rounded-xl border border-gray-800 shadow-md hover:border-aussie-500/30 transition-colors">
                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                <Icon className={`w-4 h-4 ${tile.tone}`} />
                                <span className="text-xs font-bold uppercase">{tile.label}</span>
                            </div>
                            <div className="font-mono text-sm text-white">{tile.value}</div>
                            {tile.sub && <div className="text-[11px] text-gray-500 mt-1">{tile.sub}</div>}
                        </div>
                    );
                })}
                <div className="bg-[#161b22] p-4 rounded-xl border border-gray-800 flex items-center gap-4">
                    <Cpu className="w-8 h-8 text-aussie-500" />
                    <div>
                        <div className="text-xs uppercase text-gray-500 font-bold mb-1">Kernel</div>
                        <div className="text-sm font-mono">Aussie OS v3.0</div>
                        <div className="text-[11px] text-gray-500">Realtime agent shell</div>
                    </div>
                </div>
            </div>

            <div className="mt-auto text-center text-xs text-gray-600">
                © 2024 Aussie Intelligence Systems. All rights reserved.
            </div>
        </div>
    );
};
