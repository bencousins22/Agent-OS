
import { AppDefinition } from '../types';
import { Zap } from 'lucide-react';
import { bus } from './eventBus';


import { HyperliquidApp } from '../components/apps/HyperliquidApp';

const REGISTRY_STORAGE_KEY = 'aussie_os_app_registry_v1';

class AppRegistryService {
    private apps: Map<string, AppDefinition> = new Map();

    constructor() {
        this.registerDefaults();
        this.loadFromStorage();
    }

    private registerDefaults() {
        const defaults: AppDefinition[] = [
            {
                id: 'hyperliquid-terminal',
                name: 'Hyperliquid Terminal',
                description: 'Professional high-frequency trading terminal for Hyperliquid L1. Features backtesting and live execution simulation.',
                category: 'finance',
                version: '1.2.0',
                author: 'Jules System',
                installed: true,
                icon: Zap,
                price: '$0.00',
                component: HyperliquidApp
            },






        ];

        defaults.forEach(app => this.apps.set(app.id, app));
    }

    private loadFromStorage() {
        try {
            const raw = localStorage.getItem(REGISTRY_STORAGE_KEY);
            if (raw) {
                const storedApps: any[] = JSON.parse(raw);
                storedApps.forEach(stored => {
                    const existing = this.apps.get(stored.id);
                    if (existing) {
                        existing.installed = stored.installed;
                    } else {
                        // Restore Custom Apps
                        const newApp: AppDefinition = {
                            ...stored,
                            icon: Zap
                        };
                        this.apps.set(stored.id, newApp);
                    }
                });
            }
        } catch (e) {
            console.error("Failed to load app registry", e);
        }
    }

    private saveToStorage() {
        try {
            const exportable = Array.from(this.apps.values()).map(app => ({
                id: app.id,
                name: app.name,
                description: app.description,
                category: app.category,
                version: app.version,
                author: app.author,
                installed: app.installed,
                price: app.price,

            }));
            localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(exportable));
        } catch (e) {
            console.error("Failed to save app registry", e);
        }
    }

    public getAll(): AppDefinition[] {
        return Array.from(this.apps.values());
    }

    public get(id: string): AppDefinition | undefined {
        return this.apps.get(id);
    }

    public setInstalled(id: string, installed: boolean) {
        const app = this.apps.get(id);
        if (app) {
            app.installed = installed;
            this.apps.set(id, app);
            this.saveToStorage();
            bus.emit('app-installed', { id, installed });
        }
    }


}

export const appRegistry = new AppRegistryService();
