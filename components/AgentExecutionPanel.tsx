import React, { useState } from 'react';
import { WorkflowPhase } from '../types';
import { ChevronDown, ChevronRight, Zap, Brain, Code2, CheckCircle, AlertCircle, Clock, Loader } from 'lucide-react';

interface ExecutionStep {
    id: string;
    phase: WorkflowPhase;
    title: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    startTime?: number;
    endTime?: number;
    details?: string;
    substeps?: ExecutionStep[];
}

interface AgentExecutionPanelProps {
    currentPhase: WorkflowPhase;
    isProcessing: boolean;
    executionHistory?: ExecutionStep[];
    onClose?: () => void;
}

const PHASE_CONFIG: Record<WorkflowPhase, { icon: any; color: string; label: string; description: string }> = {
    idle: { icon: Clock, color: 'gray', label: 'Idle', description: 'Waiting for input' },
    exploring: { icon: Brain, color: 'blue', label: 'Exploring', description: 'Analyzing requirements' },
    planning: { icon: Zap, color: 'purple', label: 'Planning', description: 'Developing strategy' },
    coding: { icon: Code2, color: 'green', label: 'Coding', description: 'Implementing solution' },
    verifying: { icon: CheckCircle, color: 'cyan', label: 'Verifying', description: 'Testing & validation' },
    reviewing: { icon: Brain, color: 'yellow', label: 'Reviewing', description: 'Code review & optimization' },
    deploying: { icon: Zap, color: 'emerald', label: 'Deploying', description: 'Publishing to production' },
    error: { icon: AlertCircle, color: 'red', label: 'Error', description: 'Execution failed' },
};

export const AgentExecutionPanel: React.FC<AgentExecutionPanelProps> = ({
    currentPhase,
    isProcessing,
    executionHistory = [],
    onClose,
}) => {
    const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['current']));

    const toggleStep = (stepId: string) => {
        const newExpanded = new Set(expandedSteps);
        if (newExpanded.has(stepId)) {
            newExpanded.delete(stepId);
        } else {
            newExpanded.add(stepId);
        }
        setExpandedSteps(newExpanded);
    };

    const getPhaseColor = (phase: WorkflowPhase) => {
        const config = PHASE_CONFIG[phase];
        const colorMap: Record<string, string> = {
            gray: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
            blue: 'text-info-400 bg-info-500/20 border-info-500/30',
            purple: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
            green: 'text-success-400 bg-success-500/20 border-success-500/30',
            cyan: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
            yellow: 'text-warning-400 bg-warning-500/20 border-warning-500/30',
            emerald: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
            red: 'text-error-400 bg-error-500/20 border-error-500/30',
        };
        return colorMap[config.color] || colorMap.gray;
    };

    const phases: WorkflowPhase[] = ['exploring', 'planning', 'coding', 'verifying', 'deploying'];

    return (
        <div className="card rounded-2xl p-0 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-aussie-500 shadow-glow animate-pulse"></div>
                    <h2 className="text-lg font-bold text-white">Agent Execution</h2>
                    {isProcessing && <span className="badge badge-primary text-[10px]">LIVE</span>}
                </div>
                {onClose && (
                    <button onClick={onClose} className="btn-ghost p-1">✕</button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Current Phase Status */}
                <div className="px-6 py-6 border-b border-white/10 bg-white/5">
                    <div className="space-y-4">
                        <div className="text-xs-caps text-gray-500 mb-3">Current Phase</div>
                        <CurrentPhaseCard phase={currentPhase} isProcessing={isProcessing} />
                    </div>
                </div>

                {/* Workflow Timeline */}
                <div className="px-6 py-6 space-y-0">
                    <div className="text-xs-caps text-gray-500 mb-4">Workflow Pipeline</div>
                    <div className="space-y-2">
                        {phases.map((phase, idx) => {
                            const isActive = phase === currentPhase;
                            const isCompleted = phases.indexOf(phase) < phases.indexOf(currentPhase as any);
                            const PhaseIcon = PHASE_CONFIG[phase].icon;

                            return (
                                <div
                                    key={phase}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-lg border transition-all duration-300
                                        ${isActive
                                            ? 'bg-aussie-500/15 border-aussie-500/40 shadow-lg shadow-aussie-500/20'
                                            : isCompleted
                                            ? 'bg-success-500/10 border-success-500/30'
                                            : 'bg-white/5 border-white/10'}
                                    `}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getPhaseColor(phase)} border`}>
                                        {isActive && isProcessing ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : isCompleted ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <PhaseIcon className="w-4 h-4" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className={`text-sm font-bold ${isActive ? 'text-aussie-300' : 'text-gray-200'}`}>
                                            {PHASE_CONFIG[phase].label}
                                        </div>
                                        <div className="text-xs text-gray-500">{PHASE_CONFIG[phase].description}</div>
                                    </div>

                                    {idx < phases.length - 1 && (
                                        <div className="text-gray-600">→</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Execution History */}
                {executionHistory.length > 0 && (
                    <div className="px-6 py-6 border-t border-white/10 space-y-0">
                        <div className="text-xs-caps text-gray-500 mb-4">Execution History</div>
                        <div className="space-y-2">
                            {executionHistory.slice(-5).reverse().map((step) => (
                                <ExecutionStepCard
                                    key={step.id}
                                    step={step}
                                    isExpanded={expandedSteps.has(step.id)}
                                    onToggle={() => toggleStep(step.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Agent Metrics */}
                <div className="px-6 py-6 border-t border-white/10 space-y-4">
                    <div className="text-xs-caps text-gray-500 mb-3">Performance Metrics</div>
                    <div className="grid grid-cols-2 gap-3">
                        <MetricCard label="Status" value={PHASE_CONFIG[currentPhase].label} />
                        <MetricCard label="Processing" value={isProcessing ? 'Yes' : 'No'} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CurrentPhaseCard: React.FC<{ phase: WorkflowPhase; isProcessing: boolean }> = ({ phase, isProcessing }) => {
    const config = PHASE_CONFIG[phase];
    const Icon = config.icon;

    const colorMap: Record<string, string> = {
        gray: 'from-gray-500/20 to-gray-600/10',
        blue: 'from-info-500/20 to-info-600/10',
        purple: 'from-purple-500/20 to-purple-600/10',
        green: 'from-success-500/20 to-success-600/10',
        cyan: 'from-cyan-500/20 to-cyan-600/10',
        yellow: 'from-warning-500/20 to-warning-600/10',
        emerald: 'from-emerald-500/20 to-emerald-600/10',
        red: 'from-error-500/20 to-error-600/10',
    };

    return (
        <div className={`bg-gradient-to-br ${colorMap[config.color]} border border-white/10 rounded-xl p-5`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 ${getPhaseColor(phase)} group-hover:scale-110 transition-transform`}>
                    {isProcessing ? (
                        <Loader className="w-6 h-6 animate-spin" />
                    ) : (
                        <Icon className="w-6 h-6" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="text-lg font-bold text-white">{config.label}</div>
                    <div className="text-sm text-gray-400">{config.description}</div>
                </div>
            </div>

            {isProcessing && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <span>⏱ Duration</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-aussie-500 to-aussie-600 animate-pulse" style={{ width: '45%' }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ExecutionStepCard: React.FC<{
    step: ExecutionStep;
    isExpanded: boolean;
    onToggle: () => void;
}> = ({ step, isExpanded, onToggle }) => {
    const statusIcon = step.status === 'completed' ? <CheckCircle className="w-4 h-4 text-success-500" /> :
        step.status === 'error' ? <AlertCircle className="w-4 h-4 text-error-500" /> :
        step.status === 'running' ? <Loader className="w-4 h-4 animate-spin text-aussie-500" /> :
        <Clock className="w-4 h-4 text-gray-500" />;

    const statusColor = step.status === 'completed' ? 'bg-success-500/20 border-success-500/30' :
        step.status === 'error' ? 'bg-error-500/20 border-error-500/30' :
        step.status === 'running' ? 'bg-aussie-500/20 border-aussie-500/30' :
        'bg-white/5 border-white/10';

    return (
        <div className={`card p-4 cursor-pointer transition-all ${statusColor}`} onClick={onToggle}>
            <div className="flex items-center gap-3">
                {statusIcon}
                <div className="flex-1">
                    <div className="font-semibold text-white text-sm">{step.title}</div>
                    {step.description && <div className="text-xs text-gray-400 mt-1">{step.description}</div>}
                </div>
                {step.substeps && step.substeps.length > 0 && (
                    <button className="text-gray-500 hover:text-white transition-colors">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {isExpanded && step.details && (
                <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400 leading-relaxed">{step.details}</p>
                </div>
            )}
        </div>
    );
};

const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="card p-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">{label}</div>
        <div className="text-base font-bold text-aussie-300">{value}</div>
    </div>
);

const getPhaseColor = (phase: WorkflowPhase): string => {
    const config = PHASE_CONFIG[phase];
    const colorMap: Record<string, string> = {
        gray: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
        blue: 'text-info-400 bg-info-500/20 border-info-500/30',
        purple: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
        green: 'text-success-400 bg-success-500/20 border-success-500/30',
        cyan: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
        yellow: 'text-warning-400 bg-warning-500/20 border-warning-500/30',
        emerald: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
        red: 'text-error-400 bg-error-500/20 border-error-500/30',
    };
    return colorMap[config.color] || colorMap.gray;
};
