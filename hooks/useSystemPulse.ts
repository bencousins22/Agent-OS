import { useEffect, useState } from 'react';
import { appRegistry } from '../services/appRegistry';
import { scheduler } from '../services/scheduler';
import { wm } from '../services/windowManager';
import { bus } from '../services/eventBus';

export interface SystemPulse {
    online: boolean;
    latencyMs: number;
    openWindows: number;
    activeTasks: number;
    completedTasks: number;
    installedApps: number;
    lastNotification?: string;
    lastUpdated: number;
}

const measureEventLoopLag = async () => {
    const targetDelay = 16;
    const start = performance.now();
    await new Promise(resolve => setTimeout(resolve, targetDelay));
    const diff = performance.now() - start - targetDelay;
    return Math.max(0, Math.round(diff));
};

const getInitialState = (): SystemPulse => {
    const tasks = scheduler.getTasks();
    return {
        online: typeof navigator !== 'undefined' ? navigator.onLine : true,
        latencyMs: 0,
        openWindows: wm.getWindows().filter(w => !w.isMinimized).length,
        activeTasks: tasks.filter(t => t.status === 'active').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        installedApps: appRegistry.getAll().filter(app => app.installed).length,
        lastNotification: undefined,
        lastUpdated: Date.now(),
    };
};

export const useSystemPulse = (pollInterval = 4000) => {
    const [pulse, setPulse] = useState<SystemPulse>(getInitialState);

    useEffect(() => {
        let mounted = true;

        const refresh = async () => {
            const tasks = scheduler.getTasks();
            const latencyMs = await measureEventLoopLag();

            if (!mounted) return;
            setPulse(prev => ({
                ...prev,
                online: typeof navigator !== 'undefined' ? navigator.onLine : prev.online,
                latencyMs,
                activeTasks: tasks.filter(t => t.status === 'active').length,
                completedTasks: tasks.filter(t => t.status === 'completed').length,
                installedApps: appRegistry.getAll().filter(app => app.installed).length,
                lastUpdated: Date.now(),
            }));
        };

        const unsubscribeWindows = wm.subscribe(windows => {
            if (!mounted) return;
            setPulse(prev => ({
                ...prev,
                openWindows: windows.filter(w => !w.isMinimized).length,
                lastUpdated: Date.now(),
            }));
        });

        const unsubscribeBus = bus.subscribe(e => {
            if (!mounted) return;
            if (e.type === 'notification') {
                setPulse(prev => ({
                    ...prev,
                    lastNotification: e.payload?.title || 'Notification',
                    lastUpdated: Date.now(),
                }));
            }

            if (e.type === 'task-run' || e.type === 'task-complete' || e.type === 'app-installed' || e.type === 'app-created') {
                refresh();
            }
        });

        const onlineHandler = () => {
            if (!mounted) return;
            setPulse(prev => ({
                ...prev,
                online: navigator.onLine,
                lastUpdated: Date.now(),
            }));
        };

        window.addEventListener('online', onlineHandler);
        window.addEventListener('offline', onlineHandler);

        refresh();
        const interval = setInterval(refresh, pollInterval);

        return () => {
            mounted = false;
            clearInterval(interval);
            unsubscribeWindows();
            unsubscribeBus();
            window.removeEventListener('online', onlineHandler);
            window.removeEventListener('offline', onlineHandler);
        };
    }, [pollInterval]);

    return pulse;
};
