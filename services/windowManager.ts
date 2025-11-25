
import { OSWindow } from '../types';

class WindowManagerService {
    private windows: OSWindow[] = [];
    private listeners: Set<(windows: OSWindow[]) => void> = new Set();
    private topZIndex = 100;
    private readonly MIN_WIDTH = 360;
    private readonly MIN_HEIGHT = 280;

    public subscribe(listener: (windows: OSWindow[]) => void): () => void {
        this.listeners.add(listener);
        listener(this.windows);
        return () => { this.listeners.delete(listener); };
    }

    private notify() {
        this.listeners.forEach(l => l([...this.windows]));
    }

    public openWindow(appId: string, title: string, props?: any) {
        const existing = this.windows.find(w => w.appId === appId);
        if (existing) {
            if (existing.isMinimized) {
                this.toggleMinimize(existing.id);
                this.focusWindow(existing.id);
            } else {
                this.focusWindow(existing.id);
            }
            return;
        }

        const baseWidth = 960;
        const baseHeight = 640;
        const offset = this.windows.length * 24;
        const startX = 80 + offset;
        const startY = 80 + offset;
        const { x, y } = this.clampPosition(startX, startY, baseWidth, baseHeight);
        this.topZIndex++;
        const newWindow: OSWindow = {
            id: Math.random().toString(36).substr(2, 9),
            appId,
            title,
            x,
            y,
            width: baseWidth,
            height: baseHeight,
            isMinimized: false,
            isMaximized: false,
            zIndex: this.topZIndex,
            props
        };

        this.windows.push(newWindow);
        this.notify();
    }

    public closeWindow(id: string) {
        this.windows = this.windows.filter(w => w.id !== id);
        this.notify();
    }

    public focusWindow(id: string) {
        this.topZIndex++;
        this.windows = this.windows.map(w => 
            w.id === id ? { ...w, zIndex: this.topZIndex } : w
        );
        this.notify();
    }

    public moveWindow(id: string, x: number, y: number) {
        const target = this.windows.find(w => w.id === id);
        if (!target) return;
        const { x: nx, y: ny } = this.clampPosition(x, y, target.width, target.height);
        this.windows = this.windows.map(w => 
            w.id === id ? { ...w, x: nx, y: ny } : w
        );
        this.notify();
    }

    public resizeWindow(id: string, width: number, height: number) {
        const target = this.windows.find(w => w.id === id);
        if (!target) return;
        const clampedWidth = Math.max(this.MIN_WIDTH, width);
        const clampedHeight = Math.max(this.MIN_HEIGHT, height);
        const { x, y } = this.clampPosition(target.x, target.y, clampedWidth, clampedHeight);
        this.windows = this.windows.map(w => 
            w.id === id ? { ...w, width: clampedWidth, height: clampedHeight, x, y } : w
        );
        this.notify();
    }

    public minimizeWindow(id: string, minimized: boolean) {
        this.windows = this.windows.map(w => 
            w.id === id ? { ...w, isMinimized: minimized } : w
        );
        this.notify();
    }

    public maximizeWindow(id: string) {
        this.windows = this.windows.map(w => 
            w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
        );
        this.notify();
    }

    public toggleMinimize(id: string) {
        const target = this.windows.find(w => w.id === id);
        if (!target) return;
        const nextState = !target.isMinimized;
        this.topZIndex++;
        this.windows = this.windows.map(w => 
            w.id === id ? { ...w, isMinimized: nextState, zIndex: this.topZIndex } : w
        );
        this.notify();
    }

    public minimizeAll() {
        this.windows = this.windows.map(w => ({ ...w, isMinimized: true }));
        this.notify();
    }

    public getWindows() {
        return this.windows;
    }

    private clampPosition(x: number, y: number, width: number, height: number) {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : width;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : height;
        const maxX = Math.max(12, viewportWidth - width - 12);
        const maxY = Math.max(12, viewportHeight - height - 80); // leave room for dock/top bars
        return {
            x: Math.min(Math.max(12, x), maxX),
            y: Math.min(Math.max(16, y), maxY)
        };
    }
}

export const wm = new WindowManagerService();
