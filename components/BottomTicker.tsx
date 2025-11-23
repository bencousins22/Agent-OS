
import React from 'react';
import { Activity, Wifi, Cpu, Globe, LayoutGrid, Bell } from 'lucide-react';
import { useSystemPulse } from '../hooks/useSystemPulse';

export const BottomTicker: React.FC = () => {
    const pulse = useSystemPulse(5000);

    const items = [
        { icon: Activity, text: pulse.online ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE' },
        { icon: Wifi, text: `NET ${pulse.online ? 'CONNECTED' : 'OFFLINE'} • ${pulse.latencyMs}ms` },
        { icon: Cpu, text: `TASKS ${pulse.activeTasks} RUN / ${pulse.completedTasks} DONE` },
        { icon: Globe, text: `${pulse.openWindows} WINDOWS ACTIVE` },
        { icon: LayoutGrid, text: `${pulse.installedApps} APPS READY` },
        { icon: Bell, text: pulse.lastNotification ? `LAST: ${pulse.lastNotification}` : 'NO NEW ALERTS' },
    ];

    return (
        <div className="h-6 bg-[#0a0c10] border-t border-os-border flex items-center overflow-hidden whitespace-nowrap text-[10px] text-os-textDim select-none shrink-0">
            {[0, 1].map(loop => (
                <div key={loop} className="flex items-center gap-8 animate-marquee px-4">
                    {items.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <span key={`${loop}-${idx}`} className="flex items-center gap-2">
                                <Icon className="w-3 h-3 text-aussie-500" />
                                {item.text}
                            </span>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};
