import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Activity, Settings, Play, RefreshCw, Zap, TrendingUp, Wallet, ChevronDown, AlertCircle, BarChart } from 'lucide-react';
import { hyperliquid } from '../../services/hyperliquid';
import { notify } from '../../services/notification';
const COINS = ['BTC', 'ETH', 'SOL', 'ARB', 'TIA'];
export const HyperliquidApp = () => {
    const [activeTab, setActiveTab] = useState('trade');
    const [wallet, setWallet] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState('BTC');
    const [price, setPrice] = useState(64000);
    const [positions, setPositions] = useState([]);
    // Trade State
    const [orderSize, setOrderSize] = useState(0.1);
    const [leverage, setLeverage] = useState(10);
    // Backtest State
    const [backtestResult, setBacktestResult] = useState(null);
    const [isBacktesting, setIsBacktesting] = useState(false);
    useEffect(() => {
        // Mock Live Price Feed
        // In real mode price should come from API; keep static until configured
    }, []);
    const connectWallet = () => {
        if (!wallet) {
            notify.error("Connection Failed", "Please enter a wallet address (e.g. 0x...)");
            return;
        }
        if (!hyperliquid.isConfigured()) {
            notify.error("API Missing", "Set VITE_HYPERLIQUID_API to enable trading/backtests.");
            return;
        }
        hyperliquid.connect(wallet);
        setIsConnected(true);
        notify.success("Hyperliquid", "Connected.");
    };
    const placeOrder = async (side) => {
        if (!isConnected)
            return notify.error("Error", "Connect Wallet first");
        if (!hyperliquid.isConfigured())
            return notify.error("API Missing", "Set VITE_HYPERLIQUID_API to enable trading.");
        try {
            const res = await hyperliquid.postExchange({
                type: 'order',
                orders: [{
                        coin: selectedCoin,
                        is_buy: side === 'buy',
                        sz: orderSize,
                        limit_px: price,
                        order_type: { limit: { tif: 'Gtc' } },
                        reduce_only: false
                    }]
            });
            notify.success("Order Sent", JSON.stringify(res));
            refreshPositions();
        }
        catch (e) {
            notify.error("Order Failed", e.message || "API Execution Error");
        }
    };
    const refreshPositions = async () => {
        if (!isConnected || !hyperliquid.isConfigured())
            return;
        const state = await hyperliquid.getInfo('clearinghouseState');
        if (state && state.assetPositions) {
            setPositions(state.assetPositions);
        }
    };
    const runBacktest = async () => {
        if (!hyperliquid.isConfigured()) {
            return notify.error("API Missing", "Set VITE_HYPERLIQUID_API to run backtests.");
        }
        setIsBacktesting(true);
        setBacktestResult(null);
        try {
            const res = await hyperliquid.runBacktest({ leverage });
            setBacktestResult(res.equityCurve);
        }
        catch (e) {
            notify.error("Backtest Failed", e.message || "API error");
        }
        finally {
            setIsBacktesting(false);
        }
    };
    return (_jsxs("div", { className: "flex flex-col h-full bg-[#0b0d11] text-white font-sans w-full", children: [_jsxs("div", { className: "h-14 border-b border-gray-800 bg-[#161b22] flex items-center justify-between px-4 shrink-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5 text-aussie-500 fill-aussie-500" }), _jsx("span", { className: "font-bold tracking-tight", children: "Hyperliquid Terminal" }), _jsx("span", { className: "text-[10px] bg-aussie-500/10 text-aussie-500 px-1.5 py-0.5 rounded font-bold uppercase border border-aussie-500/20", children: "Mainnet" })] }), _jsx("div", { className: "flex gap-1 bg-[#0f1216] p-1 rounded-lg", children: ['trade', 'backtest', 'settings'].map(t => (_jsx("button", { onClick: () => setActiveTab(t), className: `px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${activeTab === t ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`, children: t }, t))) })] }), _jsxs("div", { className: "flex-1 overflow-hidden relative", children: [!hyperliquid.isConfigured() && (_jsxs("div", { className: "absolute top-0 left-0 right-0 z-20 bg-amber-500/10 border-b border-amber-500/30 text-amber-200 text-xs font-bold px-4 py-3 flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), "Hyperliquid API not configured. Set VITE_HYPERLIQUID_API to enable trading and backtests."] })), activeTab === 'trade' && (_jsxs("div", { className: "h-full flex flex-col md:flex-row", children: [_jsxs("div", { className: "flex-1 flex flex-col min-w-0 border-r border-gray-800", children: [_jsxs("div", { className: "h-12 border-b border-gray-800 flex items-center px-4 gap-4 bg-[#0f1216]", children: [_jsxs("div", { className: "flex items-center gap-2 cursor-pointer hover:bg-white/5 px-2 py-1 rounded transition-colors", children: [_jsxs("span", { className: "font-bold text-lg", children: [selectedCoin, "-USD"] }), _jsx(ChevronDown, { className: "w-4 h-4 text-gray-500" })] }), _jsxs("div", { className: "font-mono text-xl font-bold text-green-400", children: ["$", price.toFixed(2)] }), _jsx("div", { className: "text-xs text-gray-500", children: "24h Vol: $142M" })] }), _jsxs("div", { className: "flex-1 bg-[#0f1216] relative p-4 flex items-center justify-center text-gray-600 overflow-hidden group", children: [_jsx("div", { className: "absolute inset-0 opacity-10", style: { backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' } }), _jsx(Activity, { className: "w-32 h-32 opacity-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" }), _jsx("div", { className: "w-full h-full flex items-end gap-1 z-10", children: Array.from({ length: 60 }).map((_, i) => {
                                                    const h = Math.max(10, Math.min(90, 50 + Math.sin(i * 0.2) * 30 + (Math.random() - 0.5) * 20));
                                                    const isGreen = i > 0 ? h > (50 + Math.sin((i - 1) * 0.2) * 30) : true;
                                                    return (_jsx("div", { style: { height: `${h}%` }, className: `flex-1 rounded-sm opacity-60 hover:opacity-100 transition-opacity ${isGreen ? 'bg-green-500' : 'bg-red-500'}` }, i));
                                                }) }), _jsx("span", { className: "absolute bottom-4 right-4 text-xs opacity-50 bg-black/50 px-2 py-1 rounded z-20", children: "Simulated Market Data" })] }), _jsxs("div", { className: "h-48 border-t border-gray-800 bg-[#161b22] flex flex-col", children: [_jsxs("div", { className: "px-4 py-2 border-b border-gray-800 text-xs font-bold text-gray-500 uppercase flex justify-between items-center", children: [_jsx("span", { children: "Open Positions" }), _jsx("span", { className: "text-[10px] bg-gray-800 px-1.5 py-0.5 rounded", children: positions.length })] }), _jsx("div", { className: "flex-1 overflow-y-auto custom-scrollbar", children: positions.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-full text-gray-600 text-xs italic", children: "No open positions" })) : (positions.map((p, i) => (_jsxs("div", { className: "px-4 py-2 border-b border-gray-800/50 flex justify-between text-xs font-mono items-center hover:bg-white/5 transition-colors", children: [_jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("span", { className: "text-white font-bold text-sm", children: p.position.coin }), _jsxs("span", { className: "text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded", children: [p.position.leverage, "x"] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("span", { className: "text-gray-400", children: [p.position.szi, " Sz"] }), _jsxs("span", { className: `font-bold ${p.position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`, children: [p.position.unrealizedPnl >= 0 ? '+' : '', p.position.unrealizedPnl.toFixed(2), " PnL"] })] })] }, i)))) })] })] }), _jsx("div", { className: "w-full md:w-72 bg-[#161b22] flex flex-col p-4 gap-4 shrink-0 border-l border-gray-800", children: !isConnected ? (_jsxs("div", { className: "text-center space-y-4 mt-10", children: [_jsx("div", { className: "w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(Wallet, { className: "w-8 h-8 text-gray-600" }) }), _jsx("p", { className: "text-sm text-gray-400", children: "Connect wallet to trade" }), _jsx("input", { value: wallet, onChange: e => setWallet(e.target.value), placeholder: "0x...", className: "w-full bg-black/20 border border-gray-700 rounded-lg p-3 text-xs text-center outline-none focus:border-aussie-500" }), _jsx("button", { onClick: connectWallet, className: "w-full py-2.5 bg-aussie-500 text-black font-bold rounded-lg hover:bg-aussie-600 transition-colors shadow-lg", children: "Connect" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex gap-2 p-1 bg-black/20 rounded-lg", children: [_jsx("button", { className: "flex-1 py-2 bg-green-500/20 text-green-400 text-xs font-bold rounded shadow-sm border border-green-500/20", children: "Buy" }), _jsx("button", { className: "flex-1 py-2 hover:bg-white/5 text-gray-400 text-xs font-bold rounded transition-colors", children: "Sell" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "text-[10px] text-gray-500 uppercase font-bold mb-1 block", children: ["Size (", selectedCoin, ")"] }), _jsx("input", { type: "number", value: orderSize, onChange: e => setOrderSize(parseFloat(e.target.value)), className: "w-full bg-[#0f1216] border border-gray-700 rounded-lg p-3 text-sm text-white outline-none focus:border-aussie-500 transition-colors font-mono" })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-[10px] text-gray-500 uppercase font-bold mb-1 block", children: ["Leverage (", leverage, "x)"] }), _jsx("input", { type: "range", min: "1", max: "50", value: leverage, onChange: e => setLeverage(parseInt(e.target.value)), className: "w-full accent-aussie-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" })] })] }), _jsx("button", { onClick: () => placeOrder('buy'), className: "w-full py-3.5 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg mt-4 shadow-lg shadow-green-900/20 transition-all active:scale-95", children: "Buy / Long" }), _jsx("button", { onClick: () => placeOrder('sell'), className: "w-full py-3.5 bg-red-500 hover:bg-red-600 text-black font-bold rounded-lg shadow-lg shadow-red-900/20 transition-all active:scale-95", children: "Sell / Short" }), _jsxs("div", { className: "mt-auto text-xs text-gray-500 text-center border-t border-gray-800 pt-4", children: [_jsx("span", { className: "block mb-1 uppercase tracking-wider font-bold text-[9px]", children: "Available Balance" }), _jsx("span", { className: "font-mono text-white", children: "$10,000.00" })] })] })) })] })), activeTab === 'backtest' && (_jsx("div", { className: "p-8 h-full overflow-y-auto bg-[#0f1216]", children: _jsxs("div", { className: "max-w-4xl mx-auto w-full space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h2", { className: "text-2xl font-bold flex items-center gap-3", children: [_jsx(TrendingUp, { className: "w-6 h-6 text-aussie-500" }), " Strategy Backtester"] }), _jsxs("button", { onClick: runBacktest, disabled: isBacktesting || !hyperliquid.isConfigured(), className: "px-6 py-2 bg-aussie-500 text-black font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-lg hover:bg-aussie-600 transition-all active:scale-95", children: [isBacktesting ? _jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }) : _jsx(Play, { className: "w-4 h-4" }), "Run Backtest"] })] }), _jsxs("div", { className: "bg-[#161b22] border border-gray-800 rounded-xl p-6 shadow-xl", children: [_jsx("h3", { className: "font-bold mb-4 text-sm uppercase text-gray-500 tracking-wider", children: "Configuration" }), _jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-2 font-bold text-gray-400", children: "Leverage" }), _jsx("input", { value: leverage, type: "number", readOnly: true, className: "bg-black/20 border border-gray-700 rounded-lg p-3 w-full text-gray-400 outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-2 font-bold text-gray-400", children: "Strategy Type" }), _jsxs("select", { className: "bg-black/20 border border-gray-700 rounded-lg p-3 w-full outline-none text-white", children: [_jsx("option", { children: "Mean Reversion" }), _jsx("option", { children: "Momentum Breakout" }), _jsx("option", { children: "Arbitrage" })] })] })] })] }), _jsxs("div", { className: "bg-[#161b22] border border-gray-800 rounded-xl p-6 min-h-[300px] flex flex-col relative shadow-xl", children: [_jsx("h3", { className: "font-bold mb-4 text-sm uppercase text-gray-500 tracking-wider", children: "Equity Curve" }), backtestResult ? (_jsx("div", { className: "flex-1 flex items-end gap-1 border-b border-l border-gray-800 pb-2 pl-2 h-[200px] w-full", children: backtestResult.map((val, i) => {
                                                // Normalize to fit container
                                                const maxVal = Math.max(...backtestResult);
                                                const minVal = Math.min(...backtestResult);
                                                const range = maxVal - minVal || 1;
                                                const height = Math.max(5, ((val - minVal) / range) * 100);
                                                return (_jsx("div", { style: { height: `${height}%` }, className: "flex-1 bg-aussie-500/50 hover:bg-aussie-500 transition-colors rounded-t-sm relative group min-w-[4px]", children: _jsxs("div", { className: "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none border border-gray-700 z-10", children: ["Day ", i, ": $", val.toFixed(2)] }) }, i));
                                            }) })) : (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-gray-600", children: [_jsx(BarChart, { className: "w-16 h-16 opacity-20 mb-4" }), _jsx("p", { className: "text-sm", children: "Configure API to run backtests" })] })), backtestResult && (_jsxs("div", { className: "mt-6 flex justify-between text-sm font-bold bg-black/20 p-3 rounded-lg border border-gray-800", children: [_jsx("span", { className: "text-gray-400", children: "Start: $10,000" }), _jsxs("span", { className: backtestResult[backtestResult.length - 1] >= 10000 ? 'text-green-400' : 'text-red-400', children: ["End: $", backtestResult[backtestResult.length - 1].toFixed(2)] })] }))] })] }) })), activeTab === 'settings' && (_jsx("div", { className: "p-8 h-full overflow-y-auto bg-[#0f1216]", children: _jsxs("div", { className: "max-w-xl mx-auto w-full space-y-6", children: [_jsxs("h2", { className: "text-2xl font-bold mb-6 flex items-center gap-3", children: [_jsx(Settings, { className: "w-6 h-6" }), " Terminal Settings"] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold mb-2 text-gray-400", children: "API Secret" }), _jsx("input", { type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full bg-[#161b22] border border-gray-700 rounded-lg p-4 outline-none focus:border-aussie-500 transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold mb-2 text-gray-400", children: "Default Leverage" }), _jsx("input", { type: "number", value: leverage, onChange: e => setLeverage(parseInt(e.target.value)), className: "w-full bg-[#161b22] border border-gray-700 rounded-lg p-4 outline-none focus:border-aussie-500 transition-colors" })] }), _jsx("div", { className: "pt-4 border-t border-gray-800", children: _jsxs("div", { className: "flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-yellow-500 shrink-0 mt-0.5" }), _jsxs("div", { className: "text-xs text-yellow-200 leading-relaxed", children: [_jsx("strong", { className: "block mb-1 font-bold text-yellow-500", children: "Backend Required" }), "Real trading/backtests require a configured Hyperliquid API proxy (VITE_HYPERLIQUID_API) that signs transactions securely. Do not enter real private keys unless your proxy is configured and trusted."] })] }) })] })] }) }))] })] }));
};
