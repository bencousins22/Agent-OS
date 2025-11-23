import React from 'react';
import { MainView } from '../types';

type DockApp = {
    id: string;
    name: string;
    icon: string;
    hint: string;
    action: () => void;
};

interface Props {
    onNavigate: (view: MainView) => void;
}

export const WebOsDock: React.FC<Props> = ({ onNavigate }) => {
    const apps: DockApp[] = [
        {
            id: 'chrome',
            name: 'Browser',
            icon: '/webos/apps/chrome.png',
            hint: 'Open Browser',
            action: () => onNavigate('browser')
        },
        {
            id: 'vscode',
            name: 'Code',
            icon: '/webos/apps/vscode.png',
            hint: 'Open Editor',
            action: () => onNavigate('code')
        },
        {
            id: 'terminal',
            name: 'Terminal',
            icon: '/webos/apps/bash.png',
            hint: 'Open Terminal',
            action: () => onNavigate('code')
        },
        {
            id: 'calc',
            name: 'Tasks',
            icon: '/webos/apps/calc.png',
            hint: 'Scheduler',
            action: () => onNavigate('scheduler')
        },
        {
            id: 'spotify',
            name: 'Store',
            icon: '/webos/apps/spotify.png',
            hint: 'Marketplace',
            action: () => onNavigate('marketplace')
        },
        {
            id: 'settings',
            name: 'Settings',
            icon: '/webos/apps/gnome-control-center.png',
            hint: 'System Settings',
            action: () => onNavigate('settings')
        }
    ];

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-[#0d121c]/85 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/30">
            {apps.map(app => (
                <button
                    key={app.id}
                    onClick={() => app.action()}
                    className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-aussie-500/50"
                    title={app.hint}
                >
                    <img src={app.icon} alt={app.name} className="w-10 h-10 rounded-lg shadow-md" />
                    <span className="text-[10px] font-bold text-gray-300">{app.name}</span>
                </button>
            ))}
        </div>
    );
};
