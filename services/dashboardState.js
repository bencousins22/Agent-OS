const DASHBOARD_KEY = 'aussie_os_dashboard_state_v2';
export const WALLPAPERS = [
    { id: 'default', name: 'Deep Space', type: 'gradient', value: 'bg-gradient-to-br from-[#14161b] to-[#0f1115]' },
    { id: 'aussie', name: 'Aussie Green', type: 'gradient', value: 'bg-gradient-to-br from-[#0f332e] to-[#0a0c10]' },
    { id: 'ocean', name: 'Ocean Blue', type: 'gradient', value: 'bg-gradient-to-br from-[#0f172a] to-[#1e3a8a]' },
    { id: 'sunset', name: 'Sunset', type: 'gradient', value: 'bg-gradient-to-br from-[#4c1d95] to-[#be185d]' },
    { id: 'midnight', name: 'Midnight', type: 'solid', value: 'bg-[#000000]' },
];
class DashboardStateService {
    constructor() {
        this.listeners = new Set();
        this.state = this.load() || {
            wallpaper: WALLPAPERS[0],
            widgets: [
                { id: 'w1', type: 'clock', x: 1000, y: 40 },
                { id: 'w3', type: 'network', x: 1000, y: 280 }
            ]
        };
    }
    subscribe(listener) {
        this.listeners.add(listener);
        // Send initial state
        listener(this.state);
        return () => { this.listeners.delete(listener); };
    }
    notify() {
        this.listeners.forEach(l => l({ ...this.state }));
        this.save();
    }
    load() {
        try {
            const raw = localStorage.getItem(DASHBOARD_KEY);
            return raw ? JSON.parse(raw) : null;
        }
        catch {
            return null;
        }
    }
    save() {
        localStorage.setItem(DASHBOARD_KEY, JSON.stringify(this.state));
    }
    getWidgets() {
        return [...this.state.widgets];
    }
    addWidget(type, x = 200, y = 200) {
        const newWidget = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            x,
            y,
            data: type === 'note' ? { content: '', color: 'bg-[#1c2128]' } : type === 'todo' ? { items: [] } : undefined
        };
        this.state.widgets.push(newWidget);
        this.notify();
        return newWidget;
    }
    removeWidget(id) {
        this.state.widgets = this.state.widgets.filter(w => w.id !== id);
        this.notify();
    }
    updateWidget(id, updates) {
        this.state.widgets = this.state.widgets.map(w => {
            if (w.id === id) {
                const newData = updates.data ? { ...w.data, ...updates.data } : w.data;
                return { ...w, ...updates, data: newData };
            }
            return w;
        });
        this.notify();
    }
    getWallpaper() {
        return this.state.wallpaper;
    }
    setWallpaper(wallpaper) {
        this.state.wallpaper = wallpaper;
        this.notify();
    }
}
export const dashboardState = new DashboardStateService();
