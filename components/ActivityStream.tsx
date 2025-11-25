import React, { useState, useEffect } from 'react';
import { GitBranch, Code2, Rocket, Bell, Zap, AlertCircle, Clock, Search } from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'code' | 'git' | 'deploy' | 'notification' | 'agent' | 'error';
    title: string;
    description: string;
    timestamp: number;
    source: string;
    metadata?: Record<string, any>;
    status?: 'success' | 'pending' | 'error' | 'warning';
}

interface ActivityStreamProps {
    onClose?: () => void;
}

export const ActivityStream: React.FC<ActivityStreamProps> = ({ onClose }) => {
    const [activities, setActivities] = useState<ActivityItem[]>(generateSampleActivities());
    const [filteredActivities, setFilteredActivities] = useState(activities);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    const ACTIVITY_TYPES = [
        { id: 'code', label: 'Code Changes', icon: Code2 },
        { id: 'git', label: 'Git Events', icon: GitBranch },
        { id: 'deploy', label: 'Deployments', icon: Rocket },
        { id: 'agent', label: 'Agent Events', icon: Zap },
        { id: 'notification', label: 'Notifications', icon: Bell },
        { id: 'error', label: 'Errors', icon: AlertCircle },
    ];

    useEffect(() => {
        let filtered = activities;

        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedType) {
            filtered = filtered.filter(a => a.type === selectedType);
        }

        setFilteredActivities(filtered);
    }, [searchTerm, selectedType, activities]);

    // Simulate real-time activity
    useEffect(() => {
        const interval = setInterval(() => {
            const newActivity = generateRandomActivity();
            setActivities(prev => [newActivity, ...prev].slice(0, 100));
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card rounded-2xl p-0 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-aussie-500/20 border border-aussie-500/30 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-aussie-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Activity Stream</h2>
                    <div className="w-2 h-2 rounded-full bg-aussie-500 shadow-glow animate-pulse"></div>
                </div>
                {onClose && <button onClick={onClose} className="btn-ghost p-1">✕</button>}
            </div>

            {/* Controls */}
            <div className="px-6 py-4 border-b border-white/10 space-y-3 shrink-0">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search activities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-base pl-10 py-2 text-sm w-full"
                    />
                </div>

                {/* Type Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedType(null)}
                        className={`badge px-3 py-1.5 text-xs whitespace-nowrap transition-all ${
                            selectedType === null
                                ? 'badge-primary'
                                : 'bg-white/10 text-gray-400 hover:bg-white/15'
                        }`}
                    >
                        All
                    </button>
                    {ACTIVITY_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`badge px-3 py-1.5 text-xs whitespace-nowrap transition-all ${
                                selectedType === type.id
                                    ? 'badge-primary'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/15'
                            }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                {/* Auto-scroll toggle */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`text-xs px-3 py-2 rounded-lg transition-all ${
                            autoScroll
                                ? 'bg-aussie-500/20 text-aussie-300 border border-aussie-500/40'
                                : 'bg-white/5 text-gray-500'
                        }`}
                    >
                        {autoScroll ? '🔒 Locked' : '📍 Scroll to new'}
                    </button>
                </div>
            </div>

            {/* Activity List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-2">
                {filteredActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                        <Clock className="w-12 h-12 text-gray-600 mb-3 opacity-50" />
                        <p className="text-sm text-gray-500">No activities found</p>
                    </div>
                ) : (
                    filteredActivities.map((activity) => (
                        <ActivityItemCard key={activity.id} activity={activity} />
                    ))
                )}
            </div>
        </div>
    );
};

const ActivityItemCard: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
    const Icon = getActivityIconForType(activity.type);
    const colorClass = getActivityColorForType(activity.type, activity.status);

    const timeAgo = getTimeAgo(activity.timestamp);

    return (
        <div className={`card p-4 border ${colorClass} animate-in fade-in slide-in-from-top-2 duration-300`}>
            <div className="flex gap-3">
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 flex-center ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-white text-sm truncate">{activity.title}</h4>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap">{timeAgo}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">{activity.description}</p>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-600">{activity.source}</span>
                        {activity.status && (
                            <span className={`px-2 py-0.5 rounded-lg font-mono ${
                                activity.status === 'success' ? 'bg-success-500/20 text-success-400' :
                                activity.status === 'error' ? 'bg-error-500/20 text-error-400' :
                                activity.status === 'warning' ? 'bg-warning-500/20 text-warning-400' :
                                'bg-white/10 text-gray-400'
                            }`}>
                                {activity.status}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

function getActivityIconForType(type: string) {
    const iconMap: Record<string, any> = {
        code: Code2,
        git: GitBranch,
        deploy: Rocket,
        agent: Zap,
        notification: Bell,
        error: AlertCircle,
    };
    return iconMap[type] || Bell;
}

function getActivityColorForType(type: string, status?: string): string {
    if (status === 'error') return 'text-error-400 bg-error-500/10 border-error-500/30';
    if (status === 'warning') return 'text-warning-400 bg-warning-500/10 border-warning-500/30';
    if (status === 'success') return 'text-success-400 bg-success-500/10 border-success-500/30';

    const typeMap: Record<string, string> = {
        code: 'text-info-400 bg-info-500/10 border-info-500/30',
        git: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        deploy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        agent: 'text-aussie-400 bg-aussie-500/10 border-aussie-500/30',
        notification: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
        error: 'text-error-400 bg-error-500/10 border-error-500/30',
    };
    return typeMap[type] || 'text-gray-400 bg-white/5 border-white/10';
}

function getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function generateSampleActivities(): ActivityItem[] {
    const now = Date.now();
    return [
        {
            id: '1',
            type: 'code',
            title: 'Dashboard Component Updated',
            description: 'Modified layout and added new card-based design',
            timestamp: now - 2 * 60 * 1000,
            source: 'Editor',
            status: 'success',
        },
        {
            id: '2',
            type: 'git',
            title: 'Commit: "Major UI modernization"',
            description: 'Added 5 new components and enhanced styling system',
            timestamp: now - 5 * 60 * 1000,
            source: 'Git',
            status: 'success',
        },
        {
            id: '3',
            type: 'agent',
            title: 'Agent Exploration Complete',
            description: 'Jules analyzed codebase and generated insights',
            timestamp: now - 8 * 60 * 1000,
            source: 'Agent',
            status: 'success',
        },
        {
            id: '4',
            type: 'deploy',
            title: 'Deployment Started',
            description: 'Deploying version 2.2.1 to production',
            timestamp: now - 15 * 60 * 1000,
            source: 'Deployment',
            status: 'pending',
        },
        {
            id: '5',
            type: 'notification',
            title: 'Build Passed',
            description: 'All tests passed successfully',
            timestamp: now - 20 * 60 * 1000,
            source: 'CI/CD',
            status: 'success',
        },
    ];
}

function generateRandomActivity(): ActivityItem {
    const types: Array<'code' | 'git' | 'deploy' | 'notification' | 'agent' | 'error'> = ['code', 'git', 'agent'];
    const type = types[Math.floor(Math.random() * types.length)];

    const activities: Record<string, { title: string; description: string }> = {
        code: {
            title: 'File Modified',
            description: 'changes.tsx - Updated component styling',
        },
        git: {
            title: 'New Commit',
            description: 'Fix: Enhanced UI components with modern styling',
        },
        agent: {
            title: 'Agent Action',
            description: 'Jules is analyzing code quality',
        },
    };

    const activity = activities[type];

    return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        title: activity.title,
        description: activity.description,
        timestamp: Date.now(),
        source: type === 'code' ? 'Editor' : type === 'git' ? 'Git' : 'Agent',
        status: 'success',
    };
}
