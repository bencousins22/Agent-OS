import React, { useState } from 'react';
import { Rocket, LayoutDashboard, Code2, Globe, Zap, X, Play, Repeat } from 'lucide-react';
import { MainView } from '../types';
import { agentDaemon } from '../services/agentDaemon';

interface Props {
    onNavigate: (view: MainView) => void;
    onSendMessage: (text: string) => void;
    onClose: () => void;
}

export const AgentOpsPanel: React.FC<Props> = ({ onNavigate, onSendMessage, onClose }) => {
    const [mission, setMission] = useState('Keep the workspace clean, run tests, and report status.');
    const [command, setCommand] = useState('');

    const launchMission = () => {
        if (!mission.trim()) return;
        agentDaemon.start(mission);
        onSendMessage(`New mission: ${mission}`);
    };

    const sendDirective = () => {
        if (!command.trim()) return;
        onSendMessage(command);
        setCommand('');
    };

    return (
        <div className="fixed top-16 right-3 w-full max-w-[360px] z-[120]">
            <div className="rounded-2xl border border-white/10 bg-[#0b1018]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-aussie-500/15 border border-aussie-500/30 flex items-center justify-center text-aussie-300">
                            <Rocket className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Agent Control</div>
                            <div className="text-sm text-white">Realtime OS actions</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="space-y-2">
                        <div className="text-[11px] text-gray-400 font-semibold">Mission</div>
                        <textarea
                            value={mission}
                            onChange={e => setMission(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 resize-none"
                            rows={2}
                        />
                        <button onClick={launchMission} className="w-full py-2 rounded-lg bg-aussie-500 text-black font-bold text-sm hover:bg-aussie-400 transition-colors">
                            Start Mission
                        </button>
                    </div>

                    <div className="space-y-2">
                        <div className="text-[11px] text-gray-400 font-semibold">Directive</div>
                        <div className="flex gap-2">
                            <input
                                value={command}
                                onChange={e => setCommand(e.target.value)}
                                placeholder="Ask Jules to act..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600"
                            />
                            <button onClick={sendDirective} className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm hover:bg-white/15 transition-colors">
                                Send
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[12px] text-gray-300">
                        <button onClick={() => onNavigate('dashboard')} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all">
                            <LayoutDashboard className="w-4 h-4 text-aussie-300" />
                            Home
                        </button>
                        <button onClick={() => onNavigate('code')} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all">
                            <Code2 className="w-4 h-4 text-aussie-300" />
                            Code
                        </button>
                        <button onClick={() => onNavigate('browser')} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all">
                            <Globe className="w-4 h-4 text-aussie-300" />
                            Browser
                        </button>
                        <button onClick={() => onNavigate('deploy')} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all">
                            <Play className="w-4 h-4 text-aussie-300" />
                            Deploy
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <button onClick={() => agentDaemon.stop()} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex-1">
                            Stop Daemon
                        </button>
                        <button onClick={() => agentDaemon.start()} className="px-3 py-2 rounded-lg bg-aussie-500 text-black font-semibold hover:bg-aussie-400 transition-all flex-1">
                            Restart Daemon
                        </button>
                        <button onClick={() => onSendMessage('Provide OS status update and next actions.')} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex-1">
                            <Repeat className="w-4 h-4 inline mr-1" />
                            Status
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
