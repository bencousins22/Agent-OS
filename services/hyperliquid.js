/**
 * Hyperliquid API client (no simulation).
 * Requires a real HTTP endpoint set via VITE_HYPERLIQUID_API.
 */
class HyperliquidService {
    constructor() {
        this.walletAddress = null;
        this.baseUrl = import.meta.env?.VITE_HYPERLIQUID_API || null;
    }
    isConfigured() {
        return !!this.baseUrl;
    }
    ensureConfigured() {
        if (!this.baseUrl) {
            throw new Error('Hyperliquid API not configured. Set VITE_HYPERLIQUID_API to a proxy/endpoint.');
        }
    }
    connect(wallet) {
        this.walletAddress = wallet;
        return { status: 'connected', account: wallet };
    }
    async getInfo(type) {
        this.ensureConfigured();
        const res = await fetch(`${this.baseUrl}/info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, wallet: this.walletAddress })
        });
        if (!res.ok)
            throw new Error(`Hyperliquid info failed: ${res.status}`);
        return res.json();
    }
    async postExchange(action) {
        this.ensureConfigured();
        const res = await fetch(`${this.baseUrl}/exchange`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action)
        });
        if (!res.ok)
            throw new Error(`Hyperliquid exchange failed: ${res.status}`);
        return res.json();
    }
    async runBacktest(strategyParams) {
        this.ensureConfigured();
        const res = await fetch(`${this.baseUrl}/backtest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(strategyParams)
        });
        if (!res.ok)
            throw new Error(`Hyperliquid backtest failed: ${res.status}`);
        return res.json();
    }
}
export const hyperliquid = new HyperliquidService();
