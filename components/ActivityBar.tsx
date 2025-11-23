
import React from 'react';
import { Home, Code2, Globe, Github, Calendar, Rocket, Search, Settings, Briefcase, Zap, ShoppingBag, Menu, LayoutGrid } from 'lucide-react';
import { MainView } from '../types';

interface ActivityBarProps {
    activeView: MainView;
    onNavigate: (view: MainView) => void;
    onSpotlight: () => void;
    isMobile: boolean;
    onChatToggle: () => void;
    onMenuToggle?: () => void;
}

export const NAV_ITEMS = [
    { view: 'dashboard', icon: Home, tooltip: 'Dashboard' },
    { view: 'projects', icon: Briefcase, tooltip: 'Projects' },
    { view: 'marketplace', icon: ShoppingBag, tooltip: 'Marketplace' },
    { view: 'code', icon: Code2, tooltip: 'Code' },
    { view: 'browser', icon: Globe, tooltip: 'Browser' },
    { view: 'flow', icon: Zap, tooltip: 'Flow' },
    { view: 'github', icon: Github, tooltip: 'GitHub' },
    { view: 'scheduler', icon: Calendar, tooltip: 'Scheduler' },
    { view: 'deploy', icon: Rocket, tooltip: 'Deploy' },
] as const;

export const ActivityBar: React.FC<ActivityBarProps> = React.memo(({ activeView, onNavigate, onSpotlight, isMobile, onMenuToggle }) => {
    
    if (isMobile) {
        return (
            <div className="fixed bottom-0 left-0 right-0 h-[70px] bg-[#0f1216]/95 backdrop-blur-xl border-t border-os-border z-[60] pb-safe flex items-center justify-around px-2 shadow-2xl">
                <MobileTab icon={Home} label="Home" active={activeView === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                <MobileTab icon={ShoppingBag} label="Store" active={activeView === 'marketplace'} onClick={() => onNavigate('marketplace')} />
                <MobileTab icon={Code2} label="Code" active={activeView === 'code'} onClick={() => onNavigate('code')} />
                <MobileTab icon={Globe} label="Web" active={activeView === 'browser'} onClick={() => onNavigate('browser')} />
                <MobileTab icon={Menu} label="Menu" active={false} onClick={onMenuToggle || (() => {})} />
            </div>
        );
    }

    return (
        <div className="w-20 xl:w-24 flex flex-col items-center py-6 xl:py-8 bg-os-bg/98 backdrop-blur-xl border-r border-os-border gap-5 z-30 shrink-0 h-full justify-between shadow-lg">
            {/* Logo */}
            <div className="w-12 h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-aussie-500 to-aussie-600 rounded-2xl flex items-center justify-center text-os-bg font-bold text-xl xl:text-2xl mb-3 shadow-xl shadow-aussie-500/30 cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0 relative group">
                A
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -inset-1 bg-gradient-to-br from-aussie-500/20 to-aussie-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>

            <div className="flex flex-col gap-2.5 xl:gap-3 w-full items-center justify-start flex-1 overflow-y-auto no-scrollbar px-2 xl:px-3">
                {NAV_ITEMS.map(({ view, icon, tooltip }) => (
                     <ActivityButton
                        key={view}
                        icon={icon}
                        active={activeView === view}
                        onClick={() => onNavigate(view as MainView)}
                        tooltip={tooltip}
                    />
                ))}
            </div>

            <div className="flex flex-col gap-2.5 xl:gap-3 w-full items-center pb-2 xl:pb-3 px-2 xl:px-3">
                <div className="h-px w-full bg-white/5 mb-1" />
                <ActivityButton icon={Search} active={false} onClick={onSpotlight} tooltip="Search (Cmd+K)" />
                <ActivityButton icon={Settings} active={activeView === 'settings'} onClick={() => onNavigate('settings')} tooltip="Settings" />
            </div>
        </div>
    );
});

const MobileTab = ({ icon: Icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-20 gap-1.5 transition-all active:scale-95 ${active ? 'text-aussie-500' : 'text-gray-500'}`}
    >
        <div className={`p-2 rounded-2xl transition-all shadow-sm ${active ? 'bg-gradient-to-br from-aussie-500/20 to-aussie-500/5 border border-aussie-500/20' : 'bg-white/5 border border-transparent'}`}>
            <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} strokeWidth={active ? 2.5 : 1.5} />
        </div>
        <span className="text-[11px] font-semibold tracking-tight">{label}</span>
    </button>
);

const ActivityButton = ({ icon: Icon, active, onClick, tooltip }: any) => (
    <div className="w-full flex items-center justify-center relative group">
        {/* Active Indicator */}
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-10 xl:h-12 w-1.5 bg-gradient-to-b from-aussie-400 to-aussie-600 rounded-r-full shadow-glow-lg" />}

        <button
            onClick={onClick}
            className={`
                p-3 xl:p-4 rounded-xl xl:rounded-2xl transition-all duration-200 relative
                ${active
                    ? 'text-aussie-500 bg-gradient-to-br from-aussie-500/15 to-aussie-500/5 shadow-lg border border-aussie-500/20'
                    : 'text-os-textDim hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 hover:shadow-md active:scale-95'}
            `}
        >
            <Icon className={`w-6 h-6 xl:w-7 xl:h-7 ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
        </button>

        {/* Tooltip */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-[#0f1218]/98 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-os-border shadow-2xl transform translate-x-2 group-hover:translate-x-0 transition-all backdrop-blur-xl">
            {tooltip}
            {/* Arrow */}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#0f1218] border-l border-b border-os-border transform rotate-45" />
        </div>
    </div>
);
