/**
 * ActivityBarMobile.tsx - React 19 optimized mobile bottom navigation
 * Enhanced with:
 * - useTransition for smooth tab switches
 * - Haptic feedback support
 * - Optimized touch targets (min 44px)
 * - Reduced motion support
 * - Badge system for notifications
 */

import React, { useTransition } from 'react';
import { Search, Settings, Menu, Bot, Home, Code2, Zap } from 'lucide-react';
import { MainView } from '../../types';
import { NAV_ITEMS } from '../../constants';

interface MobileTabProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
    onClick: () => void;
    badge?: number;
    ariaLabel?: string;
}

interface ActivityBarMobileProps {
    activeView: MainView;
    onNavigate: (view: MainView) => void;
    onSpotlight: () => void;
    onMenuToggle?: () => void;
    onChatToggle?: () => void;
    unreadMessages?: number;
}

/**
 * Enhanced MobileTab with haptic feedback and optimized touch
 */
const MobileTab: React.FC<MobileTabProps> = React.memo(({ 
    icon: Icon, 
    label, 
    active, 
    onClick, 
    badge,
    ariaLabel 
}) => {
    const handleClick = () => {
        // Haptic feedback on supported devices
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
        onClick();
    };

    return (
        <button
            onClick={handleClick}
            className={`
                flex flex-col items-center justify-center flex-1 py-2 px-1 sm:py-2.5 sm:px-2
                transition-all active:scale-90 touch-manipulation group
                min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px]
                relative
                ${active ? 'text-aussie-400' : 'text-gray-500 hover:text-gray-300'}
            `}
            aria-label={ariaLabel || label}
            aria-current={active ? 'page' : undefined}
        >
            <div className={`
                p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all shadow-sm mb-1
                ${active 
                    ? 'bg-gradient-to-br from-aussie-500/25 to-aussie-500/10 border border-aussie-500/40 shadow-lg shadow-aussie-500/20' 
                    : 'bg-white/5 border border-transparent group-hover:bg-white/10 group-hover:border-white/20'}
                motion-safe:transition-colors motion-reduce:transition-none
            `}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${active ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            </div>
            <span className={`
                text-[9px] sm:text-[10px] font-semibold tracking-tight truncate max-w-12
                ${active ? 'text-aussie-400' : 'text-gray-500'}
                motion-reduce:text-base
            `}>
                {label}
            </span>
            {active && (
                <div className="w-1 h-1 rounded-full bg-aussie-400 mt-1 shadow-glow-sm motion-safe:animate-pulse motion-reduce:animate-none" />
            )}
            {badge && badge > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                    {badge > 99 ? '99+' : badge}
                </div>
            )}
        </button>
    );
});

MobileTab.displayName = 'MobileTab';

/**
 * ActivityBarMobile - React 19 optimized mobile navigation
 */
export const ActivityBarMobile: React.FC<ActivityBarMobileProps> = React.memo(({
    activeView,
    onNavigate,
    onSpotlight,
    onMenuToggle,
    onChatToggle,
    unreadMessages = 0
}) => {
    const [isPending, startTransition] = useTransition();

    const handleNavigation = (view: MainView) => {
        startTransition(() => {
            onNavigate(view);
        });
    };

    // Filter critical nav items for mobile (show only core features)
    const mobileNavItems = NAV_ITEMS.filter(item => 
        ['dashboard', 'code', 'browser', 'flow'].includes(item.view)
    );

    return (
        <nav 
            className="fixed bottom-0 left-0 right-0 h-[70px] bg-[#0f1216]/98 backdrop-blur-xl border-t border-os-border z-[60] pb-safe flex items-center justify-between px-1 sm:px-2 shadow-2xl"
            aria-label="Mobile navigation"
            role="navigation"
        >
            <div className="flex items-center justify-around w-full gap-1">
                {mobileNavItems.map(({ view, icon, tooltip }) => (
                    <MobileTab
                        key={view}
                        icon={icon}
                        label={tooltip}
                        active={activeView === view}
                        onClick={() => handleNavigation(view as MainView)}
                        ariaLabel={tooltip}
                    />
                ))}
                
                <MobileTab 
                    icon={Bot} 
                    label="Chat" 
                    active={false} 
                    onClick={onChatToggle || (() => {})}
                    badge={unreadMessages}
                    ariaLabel="Open chat panel"
                />
                
                <MobileTab 
                    icon={Menu} 
                    label="Menu" 
                    active={false} 
                    onClick={onMenuToggle || (() => {})}
                    ariaLabel="Open menu"
                />
            </div>

            {/* Loading indicator for navigation transitions */}
            {isPending && (
                <div className="absolute inset-0 top-0 h-1 bg-gradient-to-r from-aussie-500/0 via-aussie-500/50 to-aussie-500/0 animate-pulse" />
            )}
        </nav>
    );
});

ActivityBarMobile.displayName = 'ActivityBarMobile';

export default ActivityBarMobile;
