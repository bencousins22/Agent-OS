/**
 * Swarm Orchestrator - Multi-Agent Consensus System
 * Implements specialized agent roles with consensus voting
 * Inspired by Microsoft AutoGen and Anthropic's multi-agent patterns
 */

import { GoogleGenAI } from '@google/genai';
import { logger } from './logger';
import { bus } from './eventBus';
import { getJulesApiKey } from './julesKeys';

export type AgentRole = 'planner' | 'coder' | 'reviewer' | 'tester' | 'optimizer';

export interface SwarmAgent {
    id: string;
    role: AgentRole;
    model: 'gemini-2.5-pro' | 'gemini-2.5-flash';
    status: 'idle' | 'thinking' | 'voting';
    specialization: string;
}

export interface AgentProposal {
    agentId: string;
    role: AgentRole;
    proposal: string;
    reasoning: string;
    confidence: number; // 0-1
    vote?: 'approve' | 'reject' | 'abstain';
}

export interface ConsensusResult {
    approved: boolean;
    finalProposal: string;
    votes: AgentProposal[];
    consensusScore: number;
}

class SwarmOrchestrator {
    private agents: Map<string, SwarmAgent> = new Map();
    private activeSwarms: Map<string, AgentProposal[]> = new Map();

    constructor() {
        this.initializeDefaultAgents();
    }

    /**
     * Initialize specialized agents
     */
    private initializeDefaultAgents() {
        const defaultAgents: SwarmAgent[] = [
            {
                id: 'planner-1',
                role: 'planner',
                model: 'gemini-2.5-pro',
                status: 'idle',
                specialization: 'Breaking down complex tasks into actionable steps',
            },
            {
                id: 'coder-1',
                role: 'coder',
                model: 'gemini-2.5-flash',
                status: 'idle',
                specialization: 'Writing clean, efficient code',
            },
            {
                id: 'coder-2',
                role: 'coder',
                model: 'gemini-2.5-flash',
                status: 'idle',
                specialization: 'Implementing algorithms and data structures',
            },
            {
                id: 'reviewer-1',
                role: 'reviewer',
                model: 'gemini-2.5-pro',
                status: 'idle',
                specialization: 'Code review and quality assurance',
            },
            {
                id: 'tester-1',
                role: 'tester',
                model: 'gemini-2.5-flash',
                status: 'idle',
                specialization: 'Test generation and validation',
            },
            {
                id: 'optimizer-1',
                role: 'optimizer',
                model: 'gemini-2.5-pro',
                status: 'idle',
                specialization: 'Performance optimization and refactoring',
            },
        ];

        defaultAgents.forEach(agent => this.agents.set(agent.id, agent));
        logger.info(`Initialized ${defaultAgents.length} swarm agents`, undefined, 'SwarmOrchestrator');
    }

    /**
     * Execute task with multi-agent consensus
     */
    async executeWithConsensus(
        task: string,
        requiredRoles: AgentRole[],
        consensusThreshold: number = 0.7
    ): Promise<ConsensusResult> {
        const swarmId = `swarm_${Date.now()}`;
        logger.info(`Starting swarm execution: ${task}`, { swarmId, requiredRoles }, 'SwarmOrchestrator');

        bus.emit('agent-daemon-log', {
            ts: Date.now(),
            message: `🐝 Swarm activated with ${requiredRoles.length} agents`,
            level: 'info',
        });

        // Phase 1: Proposal Generation
        const proposals = await this.generateProposals(task, requiredRoles);
        this.activeSwarms.set(swarmId, proposals);

        // Phase 2: Voting
        const votedProposals = await this.conductVoting(swarmId, proposals);

        // Phase 3: Consensus
        const consensus = this.calculateConsensus(votedProposals, consensusThreshold);

        logger.info('Consensus reached', { approved: consensus.approved, score: consensus.consensusScore }, 'SwarmOrchestrator');

        bus.emit('agent-daemon-log', {
            ts: Date.now(),
            message: `${consensus.approved ? '✅' : '❌'} Consensus: ${(consensus.consensusScore * 100).toFixed(0)}%`,
            level: consensus.approved ? 'info' : 'warn',
        });

        return consensus;
    }

    /**
     * Generate proposals from agents
     */
    private async generateProposals(task: string, roles: AgentRole[]): Promise<AgentProposal[]> {
        const proposals: AgentProposal[] = [];

        // Get agents for each role
        const selectedAgents = Array.from(this.agents.values()).filter(agent => roles.includes(agent.role));

        // Generate proposals in parallel
        const proposalPromises = selectedAgents.map(async (agent) => {
            try {
                agent.status = 'thinking';

                const apiKey = getJulesApiKey();
                if (!apiKey) {
                    throw new Error('No API key');
                }
                const ai = new GoogleGenAI({ apiKey });
                const chat = ai.chats.create({
                    model: agent.model,
                    config: {
                        systemInstruction: `You are a ${agent.role} agent in a multi-agent swarm.

Your specialization: ${agent.specialization}

Task: ${task}

Provide your proposal for how to accomplish this task.
Be specific and detailed.
Rate your confidence from 0-1.

Respond in JSON format:
{
  "proposal": "your detailed proposal",
  "reasoning": "why this approach is best",
  "confidence": 0.85
}`
                    }
                });

                const response = await chat.sendMessage({ message: task });
                const text = response.candidates?.[0]?.content?.parts?.filter((p: any) => p.text).map((p: any) => p.text).join('') || '{}';
                const parsed = JSON.parse(text);

                const proposal: AgentProposal = {
                    agentId: agent.id,
                    role: agent.role,
                    proposal: parsed.proposal,
                    reasoning: parsed.reasoning,
                    confidence: parsed.confidence || 0.5,
                };

                agent.status = 'idle';

                return proposal;
            } catch (error) {
                logger.error(`Agent ${agent.id} failed to generate proposal`, error, 'SwarmOrchestrator');
                agent.status = 'idle';
                return null;
            }
        });

        const results = await Promise.all(proposalPromises);
        proposals.push(...results.filter(p => p !== null) as AgentProposal[]);

        return proposals;
    }

    /**
     * Conduct voting among agents
     */
    private async conductVoting(swarmId: string, proposals: AgentProposal[]): Promise<AgentProposal[]> {
        // Each agent votes on other agents' proposals
        const votingPromises = proposals.map(async (proposal) => {
            const voters = Array.from(this.agents.values()).filter(a => a.id !== proposal.agentId);

            const votes = await Promise.all(
                voters.slice(0, 3).map(async (voter) => {
                    // Simplify voting for now
                    try {
                        voter.status = 'voting';

                        const apiKey = getJulesApiKey();
                        if (!apiKey) return 'abstain';
                        const ai = new GoogleGenAI({ apiKey });
                        const chat = ai.chats.create({
                            model: voter.model,
                            config: {
                                systemInstruction: `You are voting on a proposal from a ${proposal.role} agent.

Proposal: ${proposal.proposal}
Reasoning: ${proposal.reasoning}

Vote: approve, reject, or abstain
Respond with just the vote word.`
                            }
                        });

                        const response = await chat.sendMessage({ message: 'Cast your vote' });
                        voter.status = 'idle';

                        const text = response.candidates?.[0]?.content?.parts?.filter((p: any) => p.text).map((p: any) => p.text).join('') || 'abstain';
                        const vote = text.toLowerCase().trim();
                        return vote.includes('approve') ? 'approve' :
                               vote.includes('reject') ? 'reject' : 'abstain';
                    } catch (error) {
                        voter.status = 'idle';
                        return 'abstain';
                    }
                })
            );

            // Count votes
            const approvals = votes.filter(v => v === 'approve').length;
            const rejections = votes.filter(v => v === 'reject').length;

            proposal.vote = approvals > rejections ? 'approve' : rejections > approvals ? 'reject' : 'abstain';

            return proposal;
        });

        return await Promise.all(votingPromises);
    }

    /**
     * Calculate consensus from votes
     */
    private calculateConsensus(proposals: AgentProposal[], threshold: number): ConsensusResult {
        const approvedProposals = proposals.filter(p => p.vote === 'approve');
        const totalProposals = proposals.length;

        const consensusScore = approvedProposals.length / totalProposals;
        const approved = consensusScore >= threshold;

        // Select best proposal (highest confidence among approved)
        const bestProposal = approved
            ? approvedProposals.sort((a, b) => b.confidence - a.confidence)[0]
            : proposals[0];

        return {
            approved,
            finalProposal: bestProposal.proposal,
            votes: proposals,
            consensusScore,
        };
    }

    /**
     * Spawn specialized swarm for a specific task type
     */
    async spawnSpecializedSwarm(taskType: 'coding' | 'planning' | 'debugging'): Promise<SwarmAgent[]> {
        let roles: AgentRole[];

        switch (taskType) {
            case 'coding':
                roles = ['planner', 'coder', 'coder', 'reviewer', 'tester'];
                break;
            case 'planning':
                roles = ['planner', 'optimizer'];
                break;
            case 'debugging':
                roles = ['reviewer', 'tester', 'optimizer'];
                break;
        }

        const swarmAgents = Array.from(this.agents.values()).filter(agent => roles.includes(agent.role));

        logger.info(`Spawned ${taskType} swarm`, { agentCount: swarmAgents.length }, 'SwarmOrchestrator');

        return swarmAgents;
    }

    /**
     * Get all agents
     */
    getAgents(): SwarmAgent[] {
        return Array.from(this.agents.values());
    }

    /**
     * Get agent by ID
     */
    getAgent(id: string): SwarmAgent | undefined {
        return this.agents.get(id);
    }
}

export const swarmOrchestrator = new SwarmOrchestrator();
