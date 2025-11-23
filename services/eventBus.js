class EventBus {
    constructor() {
        this.listeners = new Set();
        this.typedListeners = new Map();
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    emit(type, payload) {
        const event = { type, payload };
        // Call global listeners
        this.listeners.forEach(l => l(event));
        // Call typed listeners
        const typed = this.typedListeners.get(type);
        if (typed) {
            typed.forEach(l => l(payload));
        }
    }
    /**
     * Register listener for specific event type
     */
    on(type, listener) {
        if (!this.typedListeners.has(type)) {
            this.typedListeners.set(type, new Set());
        }
        this.typedListeners.get(type).add(listener);
    }
    /**
     * Unregister listener for specific event type
     */
    off(type, listener) {
        const typed = this.typedListeners.get(type);
        if (typed) {
            typed.delete(listener);
        }
    }
    /**
     * Clear all listeners for a specific type
     */
    clearType(type) {
        this.typedListeners.delete(type);
    }
    /**
     * Clear all listeners
     */
    clearAll() {
        this.listeners.clear();
        this.typedListeners.clear();
    }
}
export const bus = new EventBus();
