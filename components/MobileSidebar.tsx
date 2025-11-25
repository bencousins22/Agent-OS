
import React from 'react';
import { X, User, ChevronRight, LogOut, Shield } from 'lucide-react';
import { MainView } from '../types';
import { NAV_ITEMS } from '../constants';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    activeView: MainView;
    onNavigate: (view: MainView) => void;
}

export const MobileSidebar: React.FC<Props> = ({ isOpen, onClose, activeView, onNavigate }) => {
    const groupedNavItems = NAV_ITEMS.reduce((acc, item) => {
        if (!acc[item.group]) {
            acc[item.group] = [];
        }
        acc[item.group]!.push(item);
        return acc;
    }, {} as Record<string, (typeof NAV_ITEMS)[number][]>);

    return (
        <>
            {/* Backdrop - Blur Effect */}
            <div 
                className={`fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
                onClick={onClose}
            />

            {/* Left Drawer */}
            <div className={`
                fixed inset-y-0 left-0 w-[88%] max-w-[340px] bg-[#0f1216]/98 backdrop-blur-2xl border-r border-os-border z-[80]
                transform transition-transform duration-300 ease-out flex flex-col shadow-2xl
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* User Header */}
                <div className="relative px-6 pt-safe pb-7 border-b border-os-border bg-gradient-to-b from-[#161b22] to-[#0f1216] shrink-0 flex items-start justify-between shadow-lg">
                    <div className="flex items-center gap-4 mt-3">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-aussie-500 to-emerald-600 flex items-center justify-center text-black font-bold text-xl shadow-xl shadow-aussie-500/30 ring-2 ring-white/10">
                                <User className="w-7 h-7" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0f1216] rounded-full flex items-center justify-center ring-2 ring-[#0f1216]">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-glow" />
                            </div>
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-lg leading-tight">Admin User</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Shield className="w-3.5 h-3.5 text-aussie-500" />
                                <span className="text-[11px] text-aussie-500 font-bold tracking-wider uppercase">System Admin</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2.5 -mr-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl active:scale-95 transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Groups */}
                <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar space-y-6 pb-safe">
                    {Object.entries(groupedNavItems).map(([groupName, items]) => (
                        <div key={groupName}>
                            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                {groupName}
                                <div className="h-px bg-gray-800 flex-1" />
                            </div>
                            <div className="space-y-1">
                                {items.map(item => {
                                    const Icon = item.icon;
                                    const isActive = activeView === item.view;
                                    
                                    return (
                                        <button
                                            key={item.view}
                                            onClick={() => { onNavigate(item.view); onClose(); }}
                                            className={`
                                                w-full flex items-center gap-3.5 px-4 py-4 rounded-xl transition-all duration-200 active:scale-[0.98]
                                                ${isActive
                                                    ? 'bg-gradient-to-br from-aussie-500/15 to-aussie-500/5 text-aussie-500 border border-aussie-500/20 shadow-md'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/5'}
                                            `}
                                        >
                                            <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                                            <span className={`text-base ${isActive ? 'font-bold' : 'font-semibold'}`}>
                                                {item.tooltip}
                                            </span>
                                            {isActive && <ChevronRight className="w-5 h-5 ml-auto opacity-60" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-os-border bg-[#0a0c10] pb-safe shrink-0">
                    <button className="w-full flex items-center gap-3 px-3 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors group border border-transparent hover:border-red-500/20">
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Log Out</span>
                    </button>
                    <div className="mt-4 text-center text-[10px] text-gray-600 font-mono flex justify-center items-center gap-2">
                        <span>Aussie OS v2.2.1</span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                        <span>Mobile</span>
                    </div>
                </div>
            </div>
        </>
    );
};
