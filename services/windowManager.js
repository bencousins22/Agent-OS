class WindowManagerService {
    constructor() {
        this.windows = [];
        this.listeners = new Set();
        this.topZIndex = 100;
    }
    subscribe(listener) {
        this.listeners.add(listener);
        listener(this.windows);
        return () => { this.listeners.delete(listener); };
    }
    notify() {
        this.listeners.forEach(l => l([...this.windows]));
    }
    openWindow(appId, title, props) {
        // Check if already open
        const existing = this.windows.find(w => w.appId === appId);
        if (existing) {
            this.focusWindow(existing.id);
            if (existing.isMinimized)
                this.minimizeWindow(existing.id, false);
            return;
        }
        this.topZIndex++;
        const newWindow = {
            id: Math.random().toString(36).substr(2, 9),
            appId,
            title,
            x: 50 + (this.windows.length * 20),
            y: 50 + (this.windows.length * 20),
            width: 400,
            height: 500,
            isMinimized: false,
            isMaximized: false,
            zIndex: this.topZIndex,
            props
        };
        this.windows.push(newWindow);
        this.notify();
    }
    closeWindow(id) {
        this.windows = this.windows.filter(w => w.id !== id);
        this.notify();
    }
    focusWindow(id) {
        this.topZIndex++;
        this.windows = this.windows.map(w => w.id === id ? { ...w, zIndex: this.topZIndex } : w);
        this.notify();
    }
    moveWindow(id, x, y) {
        this.windows = this.windows.map(w => w.id === id ? { ...w, x, y } : w);
        this.notify();
    }
    resizeWindow(id, width, height) {
        this.windows = this.windows.map(w => w.id === id ? { ...w, width, height } : w);
        this.notify();
    }
    minimizeWindow(id, minimized) {
        this.windows = this.windows.map(w => w.id === id ? { ...w, isMinimized: minimized } : w);
        this.notify();
    }
    maximizeWindow(id) {
        this.windows = this.windows.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w);
        this.notify();
    }
    getWindows() {
        return this.windows;
    }
}
export const wm = new WindowManagerService();
