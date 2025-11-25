import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Eye, Code2, MapPin, Clock } from 'lucide-react';

interface Collaborator {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'coding' | 'reviewing' | 'idle';
    currentFile?: string;
    cursorLine?: number;
    color: string;
    lastActive: number;
}

interface CollaborationPanelProps {
    onClose?: () => void;
}

const SAMPLE_COLLABORATORS: Collaborator[] = [
    {
        id: '1',
        name: 'You',
        avatar: '👤',
        status: 'coding',
        currentFile: 'Dashboard.tsx',
        cursorLine: 142,
        color: 'bg-aussie-500',
        lastActive: Date.now(),
    },
    {
        id: '2',
        name: 'Alex Chen',
        avatar: '👨‍💻',
        status: 'reviewing',
        currentFile: 'ChatInterface.tsx',
        color: 'bg-blue-500',
        lastActive: Date.now() - 2 * 60 * 1000,
    },
    {
        id: '3',
        name: 'Sarah Kim',
        avatar: '👩‍💼',
        status: 'online',
        currentFile: 'TerminalView.tsx',
        color: 'bg-pink-500',
        lastActive: Date.now() - 5 * 60 * 1000,
    },
    {
        id: '4',
        name: 'James Wilson',
        avatar: '👨‍🔬',
        status: 'idle',
        currentFile: undefined,
        color: 'bg-purple-500',
        lastActive: Date.now() - 30 * 60 * 1000,
    },
];

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ onClose }) => {
    const [collaborators, setCollaborators] = useState(SAMPLE_COLLABORATORS);
    const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(SAMPLE_COLLABORATORS[0]);
    const [showMessages, setShowMessages] = useState(false);

    // Simulate activity updates
    useEffect(() => {
        const interval = setInterval(() => {
            setCollaborators(prev =>
                prev.map(c => ({
                    ...c,
                    lastActive: c.id === '1' ? Date.now() : c.lastActive,
                }))
            );
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card rounded-2xl p-0 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-aussie-500/20 border border-aussie-500/30 flex items-center justify-center">
                        <Users className="w-4 h-4 text-aussie-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Collaboration</h2>
                    <div className="w-5 h-5 rounded-full bg-success-500/30 border border-success-500 flex items-center justify-center text-[10px] font-bold text-success-400">
                        {collaborators.filter(c => c.status !== 'idle').length}
                    </div>
                </div>
                {onClose && <button onClick={onClose} className="btn-ghost p-1">✕</button>}
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-white/10 px-4 gap-0 shrink-0">
                <button
                    onClick={() => setShowMessages(false)}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                        !showMessages
                            ? 'border-aussie-500 text-aussie-400'
                            : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                >
                    <Users className="w-4 h-4 inline mr-2" />
                    Active Users
                </button>
                <button
                    onClick={() => setShowMessages(true)}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                        showMessages
                            ? 'border-aussie-500 text-aussie-400'
                            : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                >
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Messages
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex gap-4">
                {!showMessages ? (
                    <>
                        {/* Collaborators List */}
                        <div className="w-64 flex flex-col border-r border-white/10 overflow-hidden">
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-2">
                                {collaborators.map(collab => (
                                    <CollaboratorCard
                                        key={collab.id}
                                        collaborator={collab}
                                        isSelected={selectedCollaborator?.id === collab.id}
                                        onSelect={() => setSelectedCollaborator(collab)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Details */}
                        {selectedCollaborator && (
                            <CollaboratorDetails collaborator={selectedCollaborator} />
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col px-6 py-4">
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                            {[
                                { from: 'You', message: 'Just finished the new dashboard design', time: '2m ago' },
                                { from: 'Alex', message: 'Looks great! I\'ll review the code', time: '1m ago' },
                                { from: 'Sarah', message: 'Should we add more animations?', time: 'just now' },
                            ].map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.from === 'You' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs ${msg.from === 'You' ? 'order-2' : 'order-1'}`}>
                                        {msg.from !== 'You' && <div className="text-xs text-gray-500 mb-1">{msg.from}</div>}
                                        <div className={`rounded-lg p-3 ${
                                            msg.from === 'You'
                                                ? 'bg-aussie-500/20 border border-aussie-500/40'
                                                : 'bg-white/10 border border-white/20'
                                        }`}>
                                            <p className="text-sm text-white">{msg.message}</p>
                                        </div>
                                        <div className="text-[10px] text-gray-600 mt-1">{msg.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="input-base py-2 text-sm flex-1"
                            />
                            <button className="btn-primary px-4 py-2">Send</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const CollaboratorCard: React.FC<{
    collaborator: Collaborator;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ collaborator, isSelected, onSelect }) => {
    const statusMap = {
        online: { color: 'bg-success-500', label: 'Online' },
        coding: { color: 'bg-info-500', label: 'Coding' },
        reviewing: { color: 'bg-warning-500', label: 'Reviewing' },
        idle: { color: 'bg-gray-500', label: 'Idle' },
    };

    const status = statusMap[collaborator.status];

    return (
        <button
            onClick={onSelect}
            className={`card-interactive p-4 transition-all ${
                isSelected ? '!bg-aussie-500/20 !border-aussie-500/40' : ''
            }`}
        >
            <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${collaborator.color}`}>
                    {collaborator.avatar}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm">{collaborator.name}</div>
                    <div className={`text-[10px] flex items-center gap-1 ${status.color === 'bg-gray-500' ? 'text-gray-500' : 'text-white'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.color}`}></span>
                        {status.label}
                    </div>
                </div>
            </div>

            {collaborator.currentFile && (
                <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                    <Code2 className="w-3 h-3" />
                    <span className="truncate">{collaborator.currentFile}</span>
                </div>
            )}
        </button>
    );
};

const CollaboratorDetails: React.FC<{ collaborator: Collaborator }> = ({ collaborator }) => {
    const getTimeAgo = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        return `${hours}h ago`;
    };

    return (
        <div className="flex-1 flex flex-col px-6 py-4">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center mb-6 pb-6 border-b border-white/10">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl mb-3 ${collaborator.color} shadow-lg`}>
                    {collaborator.avatar}
                </div>
                <h3 className="text-xl font-bold text-white">{collaborator.name}</h3>
            </div>

            {/* Activity */}
            <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
                <div>
                    <div className="text-xs-caps text-gray-500 mb-2">Current Activity</div>
                    <div className="card p-3">
                        {collaborator.status === 'idle' ? (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                Last active {getTimeAgo(collaborator.lastActive)}
                            </div>
                        ) : collaborator.currentFile ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-white">
                                    <Code2 className="w-3 h-3 text-info-400" />
                                    <span>Editing: {collaborator.currentFile}</span>
                                </div>
                                {collaborator.cursorLine && (
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                        <MapPin className="w-3 h-3" />
                                        <span>Line {collaborator.cursorLine}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-xs text-gray-400">No active file</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
                <button className="btn-secondary w-full py-2 text-sm flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    Follow
                </button>
                <button className="btn-secondary w-full py-2 text-sm flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                </button>
            </div>
        </div>
    );
};
