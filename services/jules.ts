
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { Message, WorkflowPhase } from '../types';
import { fs } from './fileSystem';
import { shell } from './shell';
import { github } from './github';
import { orchestrator } from './orchestrator';
import { bus } from './eventBus';
import { AUSSIE_SYSTEM_INSTRUCTION, TOOLS } from '../constants';
import { scheduler } from './scheduler';
import { deployment } from './deployment';

import { browserAutomation } from './browserAutomation';

const uuid = () => Math.random().toString(36).substring(2, 15);

/**
 * JulesAgent: The Autonomous OS Kernel
 * 
 * Manages the Gemini 3.0 Chat Session, Tool Execution Loop, and Workflow State.
 */
class JulesAgent {
    private ai: GoogleGenAI | null = null;
    private chatSession: Chat | null = null;
    private messageHistory: Message[] = [];
    private isProcessing: boolean = false;
    private phase: WorkflowPhase = 'idle';

    private static instance: JulesAgent;

    private constructor() {
        this.initAI();
    }

    public static getInstance(): JulesAgent {
        if (!JulesAgent.instance) {
            JulesAgent.instance = new JulesAgent();
        }
        return JulesAgent.instance;
    }

    public initAI() {
        if (process.env.API_KEY) {
            this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
    }

    public getMessages() {
        return this.messageHistory;
    }

    public getStatus() {
        return { isProcessing: this.isProcessing, phase: this.phase };
    }

    public clearHistory() {
        this.messageHistory = [];
        this.chatSession = null;
        this.notifyUpdate();
    }

    private notifyUpdate() {
        bus.emit('agent-state-update', { 
            messages: this.messageHistory, 
            isProcessing: this.isProcessing, 
            phase: this.phase 
        });
    }

    private setPhase(phase: WorkflowPhase) {
        this.phase = phase;
        this.notifyUpdate();
    }

    /**
     * Core Input Handler
     */
    public async processInput(text: string) {
        if (!process.env.API_KEY) {
             this.addMessage('system', 'Error: API_KEY not found. Please check your environment variables.');
             return;
        }

        if (!this.ai) {
            this.initAI();
        }

        this.isProcessing = true;
        this.setPhase('planning');
        this.addMessage('user', text);

        try {
            if (!this.chatSession) {
                // Only create session once if possible, but ensure AI is ready
                if (!this.ai) this.initAI();
                
                if (this.ai) {
                    this.chatSession = this.ai.chats.create({
                        model: 'gemini-2.5-pro',
                        config: { 
                            systemInstruction: AUSSIE_SYSTEM_INSTRUCTION, 
                            tools: [{ functionDeclarations: TOOLS }] 
                        },
                    });
                } else {
                    throw new Error("Failed to initialize AI client.");
                }
            }

            let response: GenerateContentResponse = await this.chatSession.sendMessage({ message: text });
            
            // The Execution Loop (Think-Act-Observe)
            // Loop limit to prevent infinite tool loops
            let loopCount = 0;
            const MAX_LOOPS = 10;

            while (this.isProcessing && loopCount < MAX_LOOPS) {
                loopCount++;
                const candidates = response.candidates;
                if (!candidates || !candidates.length) break;

                const content = candidates[0].content;
                const parts = content.parts;
                
                // 1. Handle Text (Thoughts/Responses)
                const textParts = parts.filter((p: any) => p.text).map((p: any) => p.text).join('\n');
                if (textParts) {
                    this.addMessage('model', textParts, 'Jules');
                    bus.emit('agent-thought', { text: textParts });
                }

                // 2. Handle Tool Calls
                const calls = parts.filter((p: any) => p.functionCall);
                if (calls.length > 0) {
                    this.setPhase('coding');
                    const responses = [];
                    
                    for (const callPart of calls) {
                        const call = callPart.functionCall;
                        if (!call) continue;

                        // Execute Tool
                        const result = await this.executeTool(call.name, call.args);
                        
                        // Check for explicit exit
                        if (call.name === 'idle') {
                            this.isProcessing = false;
                        }

                        responses.push({
                            functionResponse: {
                                name: call.name,
                                response: { result },
                                id: call.id 
                            }
                        });
                    }

                    // Loop back if still processing and we have tool outputs
                    if (this.isProcessing && responses.length > 0) {
                        response = await this.chatSession.sendMessage({ message: responses });
                    } else {
                        break;
                    }
                } else {
                    // No tool calls implies turn completion
                    this.isProcessing = false;
                }
            }

        } catch (error: any) {
            console.error(error);
            this.addMessage('system', `System Error: ${error.message}`);
        } finally {
            this.isProcessing = false;
            this.setPhase('idle');
        }
    }

    /**
     * Tool Execution Engine
     */
    private async executeTool(name: string, args: any): Promise<any> {
        bus.emit('tool-execution', { name, args });
        
        try {
            switch (name) {
                case 'message_notify_user':
                    this.addMessage('model', args.text, 'Jules');
                    return { status: "ok" };
                
                case 'switch_view':
                    bus.emit('switch-view', { view: args.view });
                    return { status: "success" };



                case 'deploy_app':
                    const deployId = await deployment.deploy(args.provider || 'render', args.repoUrl);
                    this.setPhase('deploying');
                    return { status: "initiated", deploymentId: deployId };

                case 'file_read': return { content: fs.readFile(args.file) };
                case 'file_write': 
                    fs.writeFile(args.file, args.content, args.append);
                    return { status: "success" };
                case 'file_list': 
                    return { files: fs.readDir(args.path).map(f => f.name) };
                
                case 'shell_exec':
                    return await shell.execute(args.command);



                case 'github_ops':
                    return await github.processOperation(args.operation, args.data);

                case 'media_gen':
                    return await orchestrator.generateMedia(args.service, args.prompt, args.params);
                
                case 'browser_navigate': return { result: await browserAutomation.goto(args.url) };
                case 'browser_click': return { result: await browserAutomation.click(args.selector) };
                case 'browser_scrape': return { content: await browserAutomation.scrape() };
                case 'browser_screenshot': return { result: await browserAutomation.screenshot() };

                case 'schedule_task':
                    scheduler.addTask({ 
                        name: args.name, 
                        type: args.type, 
                        action: args.action, 
                        schedule: args.interval ? 'interval' : 'once', 
                        intervalSeconds: args.interval, 
                        nextRun: Date.now() 
                    });
                    return { status: "scheduled" };

                case 'idle':
                    return { status: "idle" };

                default:
                    return { error: `Tool ${name} not found.` };
            }
        } catch (e: any) {
            return { error: e.message };
        }
    }

    private addMessage(role: Message['role'], text: string, sender?: string) {
        const msg: Message = {
            id: uuid(),
            role,
            text,
            timestamp: Date.now(),
            sender
        };
        this.messageHistory = [...this.messageHistory, msg];
        this.notifyUpdate();
    }
}

export const julesAgent = JulesAgent.getInstance();

/**
 * JulesOrchestrator: Flow Graph Execution
 */
