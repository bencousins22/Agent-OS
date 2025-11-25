
import React, { useState, useEffect, memo, useOptimistic, useActionState } from 'react';
import { Zap, Code2, Users, BarChart3, Activity as ActivityIcon, Code as CodeIcon, Wifi, Moon, BatteryMedium, Smartphone, PanelRightOpen, Bell, Clock3, Cpu, HardDrive, Play, MonitorSmartphone, Sparkles, Layers, Rocket, Github, Folder, Globe, Terminal } from 'lucide-react';
import { MainView } from '../types';
import { bus } from '../services/eventBus';
import { NAV_ITEMS } from '../constants';
import { agentDaemon } from '../services/agentDaemon';
import { notify } from '../services/notification';




interface Props {
    onNavigate: (view: MainView) => void;
    activeView: MainView;
}







export const Dashboard: React.FC<Props> = memo(({ onNavigate, activeView }) => {
    const mobileToggleDefaults = { wifi: true, data: true, focus: false, batterySaver: true, splitChat: true } as const;
    const [mobileToggles, setMobileToggles] = useState<Record<keyof typeof mobileToggleDefaults, boolean>>(() => {
        try {
            const raw = localStorage.getItem('aussie_mobile_toggles');
            if (raw) return { ...mobileToggleDefaults, ...JSON.parse(raw) };
        } catch {}
        return mobileToggleDefaults;
    });
    const [optimisticToggles, addOptimisticToggle] = useOptimistic(
        mobileToggles,
        (state: typeof mobileToggles, key: keyof typeof mobileToggleDefaults) => ({ ...state, [key]: !state[key] })
    ) as [typeof mobileToggles, (key: keyof typeof mobileToggleDefaults) => void];
    const [chatWidth, setChatWidth] = useState<number>(() => {
        try {
            const raw = localStorage.getItem('aussie_mobile_chat_width');
            if (raw) return Number(raw);
        } catch {}
        return 78;
    });
    const [now, setNow] = useState(() => new Date());
    const [daemonActive, setDaemonActive] = useState(agentDaemon.isRunning());
    const [daemonGoal, setDaemonGoal] = useState('Keep workspace clean and responsive.');
    const [daemonLogs, setDaemonLogs] = useState<{ ts: number; message: string; level?: string }[]>(agentDaemon.getLogs());
    const [daemonQueue, setDaemonQueue] = useState(agentDaemon.getQueue());




    const pulseStats = [
        { label: 'CPU Load', value: '32%', tone: 'from-emerald-500/30 to-emerald-500/10', accent: 'text-emerald-300' },
        { label: 'Memory', value: '61%', tone: 'from-cyan-500/25 to-cyan-500/8', accent: 'text-cyan-200' },
        { label: 'Agents Live', value: '3', tone: 'from-aussie-500/30 to-aussie-500/10', accent: 'text-aussie-200' },
        { label: 'Pipelines', value: '7 running', tone: 'from-violet-500/25 to-violet-500/8', accent: 'text-violet-200' },
    ];

    const liveSignals = [
        { title: 'Deploy pipeline green', desc: 'Render CDN synced', tone: 'text-emerald-300' },
        { title: 'GitHub Webhooks clean', desc: 'Last event 2m ago', tone: 'text-cyan-200' },
        { title: 'Agent queue clear', desc: 'No pending jobs', tone: 'text-aussie-200' },
        { title: 'Scheduler idle', desc: 'Next run in 42m', tone: 'text-gray-300' },
    ];

    const healthMetrics = [
        { label: 'Latency', value: '34ms', fill: 72, tone: 'from-aussie-500 to-emerald-400' },
        { label: 'Storage', value: '58% used', fill: 58, tone: 'from-cyan-500 to-blue-400' },
        { label: 'Network', value: 'Stable', fill: 82, tone: 'from-violet-500 to-pink-400' },
        { label: 'Agents', value: '3 active', fill: 65, tone: 'from-amber-500 to-orange-400' },
    ];

    const mobileShortcuts: { label: string; hint: string; view: MainView; icon: any }[] = [
        { label: 'Code', hint: 'Editor + Agent', view: 'code', icon: Code2 },
        { label: 'Browser', hint: 'Automate & browse', view: 'browser', icon: Globe },
        { label: 'Projects', hint: 'Ship from mobile', view: 'projects', icon: Folder },
        { label: 'Deploy', hint: 'Pipelines & releases', view: 'deploy', icon: Rocket },
    ];

    const mobileControls: { key: keyof typeof mobileToggleDefaults; label: string; icon: any; accent: string }[] = [
        { key: 'wifi', label: 'Wi‑Fi', icon: Wifi, accent: 'text-emerald-300' },
        { key: 'data', label: 'Data', icon: Smartphone, accent: 'text-cyan-300' },
        { key: 'focus', label: 'Focus', icon: Moon, accent: 'text-violet-300' },
        { key: 'batterySaver', label: 'Battery', icon: BatteryMedium, accent: 'text-amber-300' },
        { key: 'splitChat', label: 'Split Chat', icon: PanelRightOpen, accent: 'text-aussie-300' },
    ];

    const toggleMobileControl = (key: keyof typeof mobileToggleDefaults) => {
        addOptimisticToggle(key);
        setMobileToggles(prev => ({ ...prev, [key]: !prev[key] }));
        if (key === 'splitChat') {
            const next = !mobileToggles[key];
            bus.emit('mobile-split-toggle', { open: next, width: `min(420px,${chatWidth}vw)` });
            notify.info('Chat layout', next ? 'Split chat enabled for mobile.' : 'Chat docked to minimize space.');
        }
    };

    const [launchingView, launchAction, isLaunching] = useActionState(async (_prev: MainView | null, formData: FormData) => {
        const view = formData.get('view') as MainView | null;
        if (view) onNavigate(view);
        return view;
    }, null as MainView | null);

    const mobileLiveTiles = [
        { icon: Cpu, label: 'CPU', value: '32%', detail: 'Cool & efficient' },
        { icon: HardDrive, label: 'Storage', value: '58%', detail: 'Workspace synced' },
        { icon: Clock3, label: 'Next Task', value: '12:45', detail: 'Scheduler ping' },
        { icon: Play, label: 'Now Playing', value: 'Lo-fi focus', detail: 'Aussie.fm' },
    ];

    const mobileNotifications = [
        { title: 'Deploy green', detail: 'Render CDN synced 2m ago' },
        { title: 'GitHub webhooks clean', detail: 'No drift detected' },
        { title: 'Agent queue idle', detail: '0 pending jobs' },
    ];

    const recentSessions = [
        { label: 'Browser automation', meta: 'Last 10m • Mobile split' },
        { label: 'Code editor', meta: 'Synced with chat' },
        { label: 'Deploy lane', meta: 'Render + Hyperliquid' },
    ];

    const handleDaemonStart = () => {
        agentDaemon.start(daemonGoal);
        setDaemonActive(true);
    };

    const handleDaemonStop = () => {
        agentDaemon.stop();
        setDaemonActive(false);
    };

    useEffect(() => {
        try {
            localStorage.setItem('aussie_mobile_toggles', JSON.stringify(mobileToggles));
        } catch {}
    }, [mobileToggles]);

    useEffect(() => {
        try { localStorage.setItem('aussie_mobile_chat_width', String(chatWidth)); } catch {}
        if (mobileToggles.splitChat) {
            bus.emit('mobile-split-toggle', { open: true, width: `min(420px,${chatWidth}vw)` });
        }
    }, [chatWidth, mobileToggles.splitChat]);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const unsub = bus.subscribe(e => {
            if (e.type === 'agent-daemon-log') {
                setDaemonLogs(prev => [...prev.slice(-19), e.payload]);
            }
            if (e.type === 'agent-daemon-state') {
                setDaemonActive(!!e.payload?.running);
                if (e.payload?.goal) setDaemonGoal(e.payload.goal);
            }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const id = setInterval(() => setDaemonQueue(agentDaemon.getQueue()), 3000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="h-full w-full relative overflow-hidden bg-gradient-to-br from-[#0a0e14] via-[#0d1117] to-[#0a0e14] font-sans">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 213, 0, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 213, 0, 0.02) 0%, transparent 50%)' }} />
            </div>
            {/* Scrollable Content */}
            <div className="absolute inset-0 z-10 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 pb-24 custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-6 min-h-full">
                    {/* Hero */}
                    <div className="card !bg-gradient-to-br !from-[#0f1a2a] !via-[#0b111d] !to-[#0a0e18] p-4 md:p-6 border-white/10 shadow-2xl shadow-black/50">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-aussie-500 shadow-glow animate-pulse"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-aussie-300">Command Centre</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">Command Centre</h1>
                                    <p className="text-gray-400 text-sm max-w-2xl">Unified workspace for build, deploy, and agent co-pilots across desktop and mobile.</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                    <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-gray-300">
                                        <span>Uptime</span><span className="font-semibold text-emerald-300">99.98%</span>
                                    </div>
                                    <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-gray-300">
                                        <span>Agents</span><span className="font-semibold text-aussie-300">Live</span>
                                    </div>
                                    <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-gray-300">
                                        <span>Projects</span><span className="font-semibold text-cyan-200">12</span>
                                    </div>
                                    <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-gray-300">
                                        <span>Mode</span><span className="font-semibold text-violet-200">Hybrid</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button onClick={() => onNavigate('code')} className="btn-primary text-sm py-2 px-4">
                                    Build in Code
                                </button>
                                <button onClick={() => onNavigate('flow')} className="btn-secondary text-sm py-2 px-4">
                                    Launch Flow
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Autonomous Agent Control */}
                    <div className="card p-4 md:p-5 space-y-3 border-white/10">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Autonomous Agent</div>
                                <p className="text-[11px] text-gray-500">Background daemon keeps the OS tidy and responsive.</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${daemonActive ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                                {daemonActive ? 'Running' : 'Stopped'}
                            </span>
                        </div>
                        <div className="grid md:grid-cols-[1.5fr_auto] gap-2">
                            <input
                                value={daemonGoal}
                                onChange={(e) => setDaemonGoal(e.target.value)}
                                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-gray-500"
                                placeholder="Autonomous goal"
                            />
                            <div className="flex gap-2">
                                <button onClick={handleDaemonStart} className="btn-primary flex-1 text-sm py-2">Start</button>
                                <button onClick={handleDaemonStop} className="btn-tertiary flex-1 text-sm py-2">Stop</button>
                            </div>
                        </div>
                        <div className="text-[11px] text-gray-400">Recent activity</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {daemonLogs.slice(-4).reverse().map((log, idx) => (
                                <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-gray-300 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${log.level === 'error' ? 'bg-red-400' : log.level === 'warn' ? 'bg-amber-300' : 'bg-aussie-400'}`} />
                                    <div className="truncate">{log.message}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                            <span>Queue</span>
                            <span className="text-white font-semibold">{daemonQueue.length} task(s)</span>
                        </div>
                    </div>

                    {/* Mobile-first OS mode */}
                    <div className="md:hidden space-y-3">
                        <div className="flex items-center justify-between px-2 text-[11px] text-gray-300">
                            <div className="flex items-center gap-2">
                                <Wifi className={`w-4 h-4 ${optimisticToggles.wifi ? 'text-emerald-300' : 'text-gray-500'}`} />
                                <BatteryMedium className="w-4 h-4 text-amber-300" />
                                <Bell className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="font-semibold">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>

                        <div className="card p-4 space-y-3 border-white/10 bg-gradient-to-br from-[#0f1624] to-[#0c121f]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Mini OS Mode</div>
                                    <p className="text-[11px] text-gray-500">Control center + split-screen chat ready.</p>
                                </div>
                                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-aussie-300 flex items-center gap-1"><MonitorSmartphone className="w-3 h-3" /> Mobile</span>
                            </div>
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
                                {mobileControls.map(ctrl => (
                                    <button
                                        key={ctrl.key}
                                        onClick={() => toggleMobileControl(ctrl.key)}
                                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all active:translate-y-[1px] ${
                                            optimisticToggles[ctrl.key] ? 'bg-aussie-500/10 border-aussie-500/30' : 'bg-white/5 border-white/10'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 ${ctrl.accent}`}>
                                            <ctrl.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-white">{ctrl.label}</div>
                                            <div className="text-[10px] text-gray-500">{optimisticToggles[ctrl.key] ? 'On' : 'Off'}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-[11px]">
                                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                                    <div className="text-gray-500 text-[10px]">Network</div>
                                    <div className="font-semibold text-white">{optimisticToggles.wifi ? 'Wi‑Fi + Data' : 'Offline'}</div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                                    <div className="text-gray-500 text-[10px]">Mode</div>
                                    <div className="font-semibold text-white">{optimisticToggles.focus ? 'Focus' : 'Standard'}</div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                                    <div className="text-gray-500 text-[10px]">Chat</div>
                                    <div className="font-semibold text-white">{optimisticToggles.splitChat ? 'Split Ready' : 'Floating'}</div>
                                </div>
                            </div>
                            <div className="pt-2 space-y-2">
                                <div className="flex items-center justify-between text-[11px] text-gray-400">
                                    <span>Split chat width</span>
                                    <span className="text-white font-semibold">{chatWidth}vw</span>
                                </div>
                                <input
                                    type="range"
                                    min={60}
                                    max={90}
                                    step={2}
                                    value={chatWidth}
                                    onChange={(e) => setChatWidth(Number(e.target.value))}
                                    className="w-full accent-aussie-400"
                                />
                                <div className="flex items-center justify-between text-[10px] text-gray-500">
                                    <span>Compact</span>
                                    <span>Roomy</span>
                                </div>
                            </div>
                        </div>

                        <div className="card p-4 space-y-3 border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500">App Shelf</div>
                                <button onClick={() => onNavigate('settings')} className="text-[11px] text-aussie-300">Settings</button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {mobileShortcuts.map(shortcut => (
                                    <form key={shortcut.label} action={launchAction} className="contents">
                                        <input type="hidden" name="view" value={shortcut.view} />
                                        <button
                                            type="submit"
                                            className="p-3 rounded-xl bg-white/5 border border-white/10 text-left flex items-center gap-3 active:translate-y-[1px] transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-aussie-500/15 flex items-center justify-center text-aussie-300">
                                                <shortcut.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-white">{shortcut.label}</div>
                                                <div className="text-[10px] text-gray-500">
                                                    {isLaunching && launchingView === shortcut.view ? 'Opening...' : shortcut.hint}
                                                </div>
                                            </div>
                                        </button>
                                    </form>
                                ))}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-gray-400">
                                <span>Dock</span>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded-lg bg-aussie-500/10 text-aussie-300 border border-aussie-500/30">Command Center</span>
                                    <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">Bottom Nav</span>
                                </div>
                            </div>
                        </div>

                        <div className="card p-4 space-y-3 border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Live Tiles</div>
                                <span className="text-[11px] text-gray-500">Realtime</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {mobileLiveTiles.map(tile => (
                                    <div key={tile.label} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 text-aussie-300 flex items-center justify-center">
                                            <tile.icon className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-semibold text-white">{tile.label}</div>
                                            <div className="text-sm font-bold text-aussie-300">{tile.value}</div>
                                            <div className="text-[10px] text-gray-500 truncate">{tile.detail}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card p-4 space-y-3 border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Notifications</div>
                                <Bell className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="space-y-2">
                                {mobileNotifications.map((n, i) => (
                                    <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                                        <div className="text-xs font-semibold text-white">{n.title}</div>
                                        <div className="text-[11px] text-gray-500">{n.detail}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card p-4 space-y-3 border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Quick Automations</div>
                                <span className="text-[11px] text-gray-500">1-tap</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => onNavigate('deploy')}
                                    className="p-3 rounded-xl bg-aussie-500/10 border border-aussie-500/30 text-left active:translate-y-[1px] transition-all"
                                >
                                    <div className="text-xs font-semibold text-white">Ship Snapshot</div>
                                    <div className="text-[11px] text-gray-400">Deploy lane</div>
                                </button>
                                <button
                                    onClick={() => onNavigate('github')}
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-left active:translate-y-[1px] transition-all"
                                >
                                    <div className="text-xs font-semibold text-white">Sync GitHub</div>
                                    <div className="text-[11px] text-gray-400">PR + webhooks</div>
                                </button>
                                <button
                                    onClick={() => onNavigate('code')}
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-left active:translate-y-[1px] transition-all"
                                >
                                    <div className="text-xs font-semibold text-white">Run Tests</div>
                                    <div className="text-[11px] text-gray-400">Open terminal</div>
                                </button>
                                <button
                                    onClick={() => onNavigate('browser')}
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-left active:translate-y-[1px] transition-all"
                                >
                                    <div className="text-xs font-semibold text-white">Open Browser</div>
                                    <div className="text-[11px] text-gray-400">Automation-ready</div>
                                </button>
                            </div>
                        </div>

                        <div className="card p-4 space-y-3 border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Recent Sessions</div>
                                <span className="text-[11px] text-gray-500">Synced</span>
                            </div>
                            <div className="space-y-2">
                                {recentSessions.map((s, i) => (
                                    <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-md bg-aussie-500/10 text-aussie-300 flex items-center justify-center text-[11px] font-bold">{i + 1}</div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-semibold text-white">{s.label}</div>
                                            <div className="text-[11px] text-gray-500 truncate">{s.meta}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Ops + Health */}
                    <div className="grid md:grid-cols-[2fr_1fr] gap-3">
                        <div className="card p-4 sm:p-5 space-y-4 bg-gradient-to-br from-[#0f1624] to-[#0c121f] border-white/10">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 flex items-center gap-1"><Layers className="w-3 h-3 text-aussie-300" /> System Pulse</div>
                                    <p className="text-[12px] text-gray-500">Live view of platform vitals and automation signals.</p>
                                </div>
                                <span className="badge badge-primary text-[10px] flex items-center gap-1"><Sparkles className="w-3 h-3" /> Realtime</span>
                            </div>
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
                                {pulseStats.map(stat => (
                                    <div key={stat.label} className={`p-4 rounded-2xl border border-white/10 bg-gradient-to-br ${stat.tone} shadow-lg shadow-black/30`}>
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">{stat.label}</div>
                                        <div className={`text-2xl font-black ${stat.accent}`}>{stat.value}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-white/10 pt-3 space-y-2">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Live Signals</div>
                                <div className="space-y-2">
                                    {liveSignals.map((sig, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                                            <div className="w-2 h-2 rounded-full bg-aussie-400 shadow-glow animate-pulse" />
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-sm font-semibold ${sig.tone}`}>{sig.title}</div>
                                                <div className="text-[11px] text-gray-500 truncate">{sig.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="card p-4 sm:p-5 space-y-4 bg-gradient-to-br from-[#0f1624] to-[#0c121f] border-white/10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Workspace Health</h3>
                                <span className="text-[11px] text-gray-500">Auto-updates</span>
                            </div>
                            <div className="space-y-3">
                                {healthMetrics.map(metric => (
                                    <div key={metric.label} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs text-gray-300">
                                            <span>{metric.label}</span>
                                            <span className="font-semibold text-white">{metric.value}</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full bg-gradient-to-r ${metric.tone} rounded-full shadow-glow`} style={{ width: `${metric.fill}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400">
                                Jules keeps services steady, syncing GitHub hooks and Hyperliquid telemetry for mobile + desktop sessions.
                            </div>
                        </div>
                    </div>

                    {/* Desktop build & ship area */}
                    <div className="hidden md:grid grid-cols-12 gap-3">
                        <div className="col-span-7 space-y-3">
                            <div className="card p-4 sm:p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Applications</h2>
                                    <span className="text-[10px] text-gray-600">{NAV_ITEMS.length} surfaces</span>
                                </div>
                                <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2 sm:gap-3">
                                    {NAV_ITEMS.map(item => (
                                        <AppCard
                                            key={item.view}
                                            item={item}
                                            active={activeView === item.view}
                                            onClick={() => onNavigate(item.view as MainView)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="card p-4 sm:p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Workflow Templates</h2>
                                    <button onClick={() => onNavigate('flow')} className="text-[11px] text-aussie-300 hover:text-white transition-colors">Open Flow</button>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3">
                                    <FlowTemplateCard
                                        title="Code Review Pipeline"
                                        description="Automated PR analysis and testing"
                                        icon={Code2}
                                        onClick={() => onNavigate('flow')}
                                    />
                                    <FlowTemplateCard
                                        title="Deploy Pipeline"
                                        description="Build, test & deploy workflow"
                                        icon={Rocket}
                                        onClick={() => onNavigate('flow')}
                                    />
                                    <FlowTemplateCard
                                        title="GitHub Sync"
                                        description="Repository sync and PR creation"
                                        icon={Github}
                                        onClick={() => onNavigate('flow')}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-span-5 space-y-3">
                            <div className="card p-4 sm:p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Developer Surfaces</h2>
                                    <span className="text-[11px] text-gray-500">Fast jumps</span>
                                </div>
                                <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2 sm:gap-3">
                                    <DevQuickAction icon={Zap} label="Agent" view="code" onNavigate={onNavigate} />
                                    <DevQuickAction icon={Users} label="Collab" view="code" onNavigate={onNavigate} />
                                    <DevQuickAction icon={BarChart3} label="Analytics" view="browser" onNavigate={onNavigate} />
                                    <DevQuickAction icon={CodeIcon} label="Snippets" view="code" onNavigate={onNavigate} />
                                    <DevQuickAction icon={ActivityIcon} label="Activity" view="projects" onNavigate={onNavigate} />
                                </div>
                            </div>
                            <div className="card p-4 sm:p-5 space-y-3">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Command Deck</div>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                                        <span className="text-gray-400">Deploy lane</span>
                                        <button onClick={() => onNavigate('deploy')} className="text-left text-white font-semibold hover:text-aussie-300">Open Deploy</button>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                                        <span className="text-gray-400">Marketplace</span>
                                        <button onClick={() => onNavigate('marketplace')} className="text-left text-white font-semibold hover:text-aussie-300">Install Apps</button>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                                        <span className="text-gray-400">GitHub</span>
                                        <button onClick={() => onNavigate('github')} className="text-left text-white font-semibold hover:text-aussie-300">Sync PRs</button>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                                        <span className="text-gray-400">Scheduler</span>
                                        <button onClick={() => onNavigate('scheduler')} className="text-left text-white font-semibold hover:text-aussie-300">Manage Jobs</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Stats */}
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2 sm:gap-3">
                        <QuickStat label="System Status" value="Online" />
                        <QuickStat label="Agent Status" value="Ready" />
                        <QuickStat label="Agents" value="6" />
                        <QuickStat label="Tasks" value={daemonQueue.length.toString()} />
                    </div>

                </div>
            </div>

            {/* Quick Access Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm border-t border-white/10 p-4 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => onNavigate('agentos')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-aussie-500 to-aussie-600 hover:from-aussie-600 hover:to-aussie-700 text-black font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-aussie-500/20"
                    >
                        <Zap className="w-5 h-5" />
                        Open Agent-OS Desktop
                    </button>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>All systems operational</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

const ContextItem = ({ icon: Icon, label, onClick }: any) => (
    <button 
        onClick={onClick} 
        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-aussie-500 hover:text-black text-gray-300 transition-colors group"
    >
        <Icon className="w-4 h-4 text-gray-500 group-hover:text-black" />
        <span className="text-xs font-bold">{label}</span>
    </button>
);

const FlowTemplateCard: React.FC<{ title: string; description: string; icon: any; onClick: () => void }> = ({ title, description, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className="card-interactive p-5 sm:p-6 text-left group animate-in fade-in zoom-in-95 duration-300"
    >
        <div className="flex items-start gap-4 h-full flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-aussie-500/20 border border-aussie-500/30 flex items-center justify-center text-aussie-400 group-hover:bg-aussie-500/30 group-hover:scale-110 transition-all shrink-0">
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 w-full">
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-aussie-400 transition-colors mb-2">{title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{description}</p>
            </div>
        </div>
    </button>
);

const DevQuickAction: React.FC<{ icon: any; label: string; view: MainView; onNavigate: (view: MainView) => void }> = ({ icon: Icon, label, view, onNavigate }) => (
    <button
        onClick={() => onNavigate(view)}
        className="card-interactive p-2.5 text-left group flex flex-col items-start touch-manipulation"
    >
        <Icon className="w-4 h-4 text-aussie-300 mb-1.5 group-hover:scale-110 transition-transform" />
        <h4 className="font-semibold text-white text-[10px]">{label}</h4>
        <span className="text-[10px] text-gray-500">Jump</span>
    </button>
);

const QuickStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="card p-4 sm:p-5">
        <div className="text-xs-caps text-gray-500 mb-2">{label}</div>
        <div className="text-2xl sm:text-3xl font-bold text-aussie-400">{value}</div>
    </div>
);

const AppCard: React.FC<{ item: typeof NAV_ITEMS[number]; active: boolean; onClick: () => void }> = ({ item, active, onClick }) => (
    <button
        onClick={onClick}
        className={`
            card-interactive p-3 sm:p-4 text-left group touch-manipulation min-h-[120px]
            ${active ? '!border-aussie-500 ring-1 ring-aussie-500/50 shadow-glow' : ''}
        `}
    >
        <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-aussie-500/15 group-hover:bg-aussie-500/25 group-hover:scale-105 transition-all">
                <item.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-aussie-400" />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-white text-[11px] sm:text-xs line-clamp-2 leading-tight">{item.tooltip}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5 sm:hidden">Tap to open</p>
            </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">App</span>
            {active && <span className="text-aussie-400 font-semibold">Active</span>}
        </div>
    </button>
);
