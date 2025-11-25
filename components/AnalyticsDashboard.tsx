import React, { useState, useEffect } from 'react';
import { TrendingUp, Code2, GitBranch, Zap, Clock, BarChart3, LineChart as LineChartIcon } from 'lucide-react';

interface AnalyticsDashboardProps {
    onClose?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose }) => {
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
    const [metrics, setMetrics] = useState(generateMetrics());

    useEffect(() => {
        setMetrics(generateMetrics());
    }, [timeRange]);

    return (
        <div className="card rounded-2xl p-0 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-aussie-500/20 border border-aussie-500/30 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-aussie-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Analytics Dashboard</h2>
                </div>
                {onClose && <button onClick={onClose} className="btn-ghost p-1">✕</button>}
            </div>

            {/* Time Range Selector */}
            <div className="px-6 py-3 border-b border-white/10 flex gap-2 shrink-0">
                {(['day', 'week', 'month', 'year'] as const).map(range => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`text-xs font-bold uppercase px-3 py-2 rounded-lg transition-all ${
                            timeRange === range
                                ? 'bg-aussie-500/20 text-aussie-300 border border-aussie-500/40'
                                : 'bg-white/5 text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {range}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {/* Key Metrics */}
                <section className="space-y-4">
                    <h3 className="text-xs-caps text-gray-500">Key Metrics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            icon={Code2}
                            label="Lines of Code"
                            value={metrics.linesOfCode}
                            change={metrics.locChange}
                            trend="up"
                        />
                        <MetricCard
                            icon={GitBranch}
                            label="Commits"
                            value={metrics.commits}
                            change={metrics.commitChange}
                            trend="up"
                        />
                        <MetricCard
                            icon={Zap}
                            label="Performance Score"
                            value={`${metrics.performanceScore}%`}
                            change={metrics.perfChange}
                            trend="up"
                        />
                        <MetricCard
                            icon={Clock}
                            label="Avg Session"
                            value={metrics.avgSession}
                            unit="min"
                            trend="neutral"
                        />
                    </div>
                </section>

                {/* Productivity Metrics */}
                <section className="space-y-4">
                    <h3 className="text-xs-caps text-gray-500">Productivity Metrics</h3>
                    <div className="space-y-3">
                        <ProgressMetric label="Daily Activity" value={72} color="aussie" />
                        <ProgressMetric label="Code Quality" value={85} color="success" />
                        <ProgressMetric label="Test Coverage" value={68} color="info" />
                        <ProgressMetric label="Documentation" value={55} color="warning" />
                    </div>
                </section>

                {/* Code Statistics */}
                <section className="space-y-4">
                    <h3 className="text-xs-caps text-gray-500">Code Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <StatBox label="Functions" value="245" color="info" />
                        <StatBox label="Classes" value="38" color="success" />
                        <StatBox label="Modules" value="52" color="warning" />
                        <StatBox label="Issues" value="12" color="error" />
                    </div>
                </section>

                {/* Activity Chart Placeholder */}
                <section className="space-y-4">
                    <h3 className="text-xs-caps text-gray-500">Activity Timeline</h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-64 flex items-center justify-center">
                        <div className="text-center">
                            <LineChartIcon className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-gray-500">Activity chart for {timeRange}</p>
                        </div>
                    </div>
                </section>

                {/* Recent Changes */}
                <section className="space-y-4">
                    <h3 className="text-xs-caps text-gray-500">Recent Changes</h3>
                    <div className="space-y-2">
                        {[
                            { file: 'components/Dashboard.tsx', change: '+245 lines', type: 'modified' },
                            { file: 'services/agent.ts', change: '+89 lines', type: 'modified' },
                            { file: 'styles/theme.css', change: '+156 lines', type: 'modified' },
                            { file: 'types.ts', change: '+34 lines', type: 'modified' },
                        ].map((item, idx) => (
                            <div key={idx} className="card p-3 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-white">{item.file}</div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">{item.type}</div>
                                </div>
                                <div className="badge badge-success text-[9px]">{item.change}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const MetricCard: React.FC<{
    icon: any;
    label: string;
    value: string | number;
    change?: number;
    unit?: string;
    trend?: 'up' | 'down' | 'neutral';
}> = ({ icon: Icon, label, value, change, unit, trend }) => {
    const trendColor = trend === 'up' ? 'text-success-500' : trend === 'down' ? 'text-error-500' : 'text-gray-500';
    const bgColor = trend === 'up' ? 'bg-success-500/10 border-success-500/30' :
        trend === 'down' ? 'bg-error-500/10 border-error-500/30' :
        'bg-white/5 border-white/10';

    return (
        <div className={`card p-4 border ${bgColor}`}>
            <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-aussie-500/20 border border-aussie-500/30 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-aussie-400" />
                </div>
                {change !== undefined && (
                    <div className={`text-xs font-bold flex items-center gap-1 ${trendColor}`}>
                        <TrendingUp className="w-3 h-3" />
                        {change > 0 ? '+' : ''}{change}%
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold text-white">
                {value}{unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
            </div>
            <div className="text-xs text-gray-500 mt-2">{label}</div>
        </div>
    );
};

const ProgressMetric: React.FC<{
    label: string;
    value: number;
    color: 'aussie' | 'success' | 'warning' | 'error' | 'info';
}> = ({ label, value, color }) => {
    const colorMap = {
        aussie: 'bg-aussie-500',
        success: 'bg-success-500',
        warning: 'bg-warning-500',
        error: 'bg-error-500',
        info: 'bg-info-500',
    };

    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{label}</span>
                <span className="text-sm font-bold text-gray-400">{value}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorMap[color]} shadow-glow transition-all duration-300`}
                    style={{ width: `${value}%` }}
                ></div>
            </div>
        </div>
    );
};

const StatBox: React.FC<{
    label: string;
    value: string;
    color: 'success' | 'warning' | 'error' | 'info';
}> = ({ label, value, color }) => {
    const bgMap = {
        success: 'bg-success-500/20 border-success-500/30',
        warning: 'bg-warning-500/20 border-warning-500/30',
        error: 'bg-error-500/20 border-error-500/30',
        info: 'bg-info-500/20 border-info-500/30',
    };

    const textMap = {
        success: 'text-success-400',
        warning: 'text-warning-400',
        error: 'text-error-400',
        info: 'text-info-400',
    };

    return (
        <div className={`card p-4 border ${bgMap[color]}`}>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">{label}</div>
            <div className={`text-3xl font-bold ${textMap[color]}`}>{value}</div>
        </div>
    );
};

function generateMetrics() {
    return {
        linesOfCode: '12,450',
        locChange: 8,
        commits: '147',
        commitChange: 12,
        performanceScore: 87,
        perfChange: 5,
        avgSession: '45',
        avgSessionChange: 2,
    };
}
