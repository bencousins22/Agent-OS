/**
 * Autonomous Agent - Headless OS Control System
 * Inspired by Puter.com's architecture
 * Uses Gemini 2.5 Pro with AI SDK for true autonomous operation
 */

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { fs } from './fileSystem';
import { shell } from './shell';
import { bus } from './eventBus';
import { logger } from './logger';
import { getJulesApiKey } from './julesKeys';

interface AgentTask {
    id: string;
    goal: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    steps: AgentStep[];
    startTime: number;
    endTime?: number;
}

interface AgentStep {
    action: string;
    args: any;
    result?: string;
    timestamp: number;
}

class AutonomousAgent {
    private tasks: Map<string, AgentTask> = new Map();
    private isRunning: boolean = false;
    private currentTaskId: string | null = null;
    private loopInterval: number = 3000; // 3 second tick

    /**
     * Start an autonomous task
     */
    async startTask(goal: string): Promise<string> {
        const taskId = `task_${Date.now()}`;

        const task: AgentTask = {
            id: taskId,
            goal,
            status: 'pending',
            steps: [],
            startTime: Date.now(),
        };

        this.tasks.set(taskId, task);
        logger.info(`Autonomous task started: ${goal}`, { taskId }, 'AutonomousAgent');

        // Start the agent loop if not already running
        if (!this.isRunning) {
            this.startAgentLoop();
        }

        return taskId;
    }

    /**
     * The main agent loop - Think → Act → Observe
     */
    private async startAgentLoop() {
        this.isRunning = true;
        logger.info('Agent loop started', undefined, 'AutonomousAgent');

        while (this.isRunning) {
            try {
                // Find pending task
                const pendingTask = Array.from(this.tasks.values()).find(t => t.status === 'pending' || t.status === 'running');

                if (pendingTask) {
                    this.currentTaskId = pendingTask.id;
                    pendingTask.status = 'running';

                    await this.executeTaskStep(pendingTask);
                } else {
                    // No pending tasks, idle
                    await new Promise(resolve => setTimeout(resolve, this.loopInterval));
                }
            } catch (error) {
                logger.error('Agent loop error', error, 'AutonomousAgent');
                await new Promise(resolve => setTimeout(resolve, this.loopInterval));
            }
        }
    }

    /**
     * Execute one step of the task
     */
    private async executeTaskStep(task: AgentTask) {
        try {
            // Get context
            const recentSteps = task.steps.slice(-5);
            const fileTree = this.getFileSystemContext();

            // Call Gemini to decide next action
            const apiKey = getJulesApiKey();
            if (!apiKey) {
                throw new Error('No API key configured');
            }

            const ai = new GoogleGenAI({ apiKey });
            const chat = ai.chats.create({
                model: 'gemini-2.5-pro',
                config: {
                    systemInstruction: `You are an Autonomous OS Agent with full system access.

CURRENT GOAL: "${task.goal}"

CONTEXT:
- You have already completed ${task.steps.length} steps
- Recent actions: ${JSON.stringify(recentSteps.map(s => s.action))}
- File system state: ${JSON.stringify(fileTree)}

INSTRUCTIONS:
- Analyze the goal and current state
- Decide the next action to take
- Use tools to manipulate the OS
- If goal is complete, call taskComplete
- If stuck, call taskFailed with explanation

Be efficient and autonomous. Do not repeat failed actions.`
                }
            });

            const response = await chat.sendMessage({
                message: `What should I do next to achieve: "${task.goal}"?`,
            });

            // Process response (simplified - full tool calling would require more integration)
            const textResponse = response.candidates?.[0]?.content?.parts?.filter((p: any) => p.text).map((p: any) => p.text).join('') || '';

            if (textResponse) {

                const step: AgentStep = {
                    action: 'think',
                    args: { response: textResponse },
                    result: textResponse,
                    timestamp: Date.now(),
                };

                task.steps.push(step);

                logger.debug(`Agent response`, { response: textResponse.substring(0, 100) }, 'AutonomousAgent');

                bus.emit('agent-daemon-log', {
                    ts: Date.now(),
                    message: `Agent: ${textResponse.substring(0, 80)}...`,
                    level: 'info',
                });
            }

            // Wait before next step
            await new Promise(resolve => setTimeout(resolve, this.loopInterval));

        } catch (error) {
            logger.error('Task step error', error, 'AutonomousAgent');
            task.status = 'failed';
            bus.emit('agent-daemon-state', { running: false });
        }
    }

    /**
     * Execute action based on agent response
     * Simplified without tool() wrapper
     */
    private async executeAction(action: string, args: any, taskId: string): Promise<string> {
        try {
            switch (action) {
                case 'writeFile':
                    fs.writeFile(args.path, args.content);
                    return `File written: ${args.path}`;

                case 'readFile':
                    return fs.readFile(args.path);

                case 'listFiles':
                    const files = fs.readDir(args.path);
                    return JSON.stringify(files.map(f => f.name));

                case 'createDirectory':
                    fs.mkdir(args.path);
                    return `Directory created: ${args.path}`;

                case 'executeCommand':
                    const result = await shell.execute(args.command);
                    return `STDOUT: ${result.stdout}\nSTDERR: ${result.stderr}`;

                case 'taskComplete':
                    const task = this.tasks.get(taskId);
                    if (task) {
                        task.status = 'completed';
                        task.endTime = Date.now();
                        logger.info(`Task completed: ${args.summary}`, { taskId }, 'AutonomousAgent');

                        bus.emit('agent-daemon-log', {
                            ts: Date.now(),
                            message: `✅ Task Complete: ${args.summary}`,
                            level: 'info',
                        });
                    }
                    return `Task marked complete: ${args.summary}`;

                case 'taskFailed':
                    const failedTask = this.tasks.get(taskId);
                    if (failedTask) {
                        failedTask.status = 'failed';
                        failedTask.endTime = Date.now();
                        logger.error(`Task failed: ${args.reason}`, undefined, 'AutonomousAgent');

                        bus.emit('agent-daemon-log', {
                            ts: Date.now(),
                            message: `❌ Task Failed: ${args.reason}`,
                            level: 'error',
                        });
                    }
                    return `Task marked failed: ${args.reason}`;

                case 'wait':
                    await new Promise(resolve => setTimeout(resolve, args.seconds * 1000));
                    return `Waited ${args.seconds} seconds`;

                default:
                    return `Unknown action: ${action}`;
            }
        } catch (error) {
            logger.error(`Action execution error: ${action}`, error, 'AutonomousAgent');
            return `Error executing ${action}: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * Get file system context for agent awareness
     */
    private getFileSystemContext(): any {
        try {
            const desktop = fs.readDir('/home/aussie/Desktop');
            const workspace = fs.readDir('/workspace');

            return {
                desktop: desktop.map(f => ({ name: f.name, type: f.type })),
                workspace: workspace.map(f => ({ name: f.name, type: f.type })),
            };
        } catch (error) {
            return { error: 'Could not read file system' };
        }
    }

    /**
     * Get task status
     */
    getTask(taskId: string): AgentTask | undefined {
        return this.tasks.get(taskId);
    }

    /**
     * Get all tasks
     */
    getAllTasks(): AgentTask[] {
        return Array.from(this.tasks.values());
    }

    /**
     * Stop the agent loop
     */
    stop() {
        this.isRunning = false;
        this.currentTaskId = null;
        logger.info('Agent loop stopped', undefined, 'AutonomousAgent');
        bus.emit('agent-daemon-state', { running: false });
    }

    /**
     * Check if agent is running
     */
    isAgentRunning(): boolean {
        return this.isRunning;
    }
}

export const autonomousAgent = new AutonomousAgent();
