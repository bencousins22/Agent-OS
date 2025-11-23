
import { Message, WorkflowPhase } from '../types';
import { bus } from './eventBus';
import { julesAPI } from './julesAPI';

const uuid = () => Math.random().toString(36).substring(2, 15);

class JulesAgent {
    private messageHistory: Message[] = [];
    private isProcessing: boolean = false;
    private phase: WorkflowPhase = 'idle';
    private sessionId: string | null = null;
    private pollingInterval: NodeJS.Timeout | null = null;
    private processedActivityIds = new Set<string>();

    private static instance: JulesAgent;

    private constructor() {}

    public static getInstance(): JulesAgent {
        if (!JulesAgent.instance) {
            JulesAgent.instance = new JulesAgent();
        }
        return JulesAgent.instance;
    }

    public getMessages() {
        return this.messageHistory;
    }

    public getStatus() {
        return { isProcessing: this.isProcessing, phase: this.phase };
    }

    public clearHistory() {
        this.messageHistory = [];
        this.sessionId = null;
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        this.processedActivityIds.clear();
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

    public async processInput(text: string) {
        if (!process.env.JULES_API_KEY) {
             this.addMessage('system', 'Error: JULES_API_KEY not found. Please check your environment variables.');
             return;
        }

        this.isProcessing = true;
        this.setPhase('planning');
        this.addMessage('user', text);

        try {
            if (!this.sessionId) {
                // For now, we'll hardcode the source. In a real app, this would be dynamic.
                const source = 'sources/github/bobalover/boba';
                const session = await julesAPI.createSession(text, source, 'main', 'Boba App');
                this.sessionId = session.id;
                this.startPolling();
            } else {
                await julesAPI.sendMessage(this.sessionId, text);
            }
        } catch (error: any) {
            console.error(error);
            this.addMessage('system', `System Error: ${error.message}`);
            this.isProcessing = false;
            this.setPhase('idle');
        }
    }

    private startPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        this.pollingInterval = setInterval(async () => {
            if (!this.sessionId) {
                this.stopPolling();
                return;
            }
            try {
                const response = await julesAPI.listActivities(this.sessionId);
                if (response && response.activities) {
                    this.processActivities(response.activities);
                }
            } catch (error) {
                console.error('Error polling for activities:', error);
            }
        }, 3000);
    }

    private stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    private processActivities(activities: any[]) {
        for (const activity of activities) {
            if (this.processedActivityIds.has(activity.id)) {
                continue;
            }
            this.processedActivityIds.add(activity.id);

            if (activity.planGenerated) {
                // For simplicity, we'll just log the plan to the console for now.
                console.log('Plan Generated:', activity.planGenerated.plan);
                 this.addMessage('model', `Here is the plan:\n${activity.planGenerated.plan.steps.map((s:any) => `- ${s.title}`).join('\n')}`, 'Jules');
            }

            if (activity.progressUpdated) {
                const { title, description } = activity.progressUpdated;
                bus.emit('agent-thought', { text: title });
                if (description) {
                    this.addMessage('model', description, 'Jules');
                }
            }

            if(activity.originator === 'agent' && activity.planGenerated === undefined && activity.progressUpdated === undefined && activity.sessionCompleted === undefined) {
                 this.addMessage('model', "Thinking...", 'Jules');
            }


            if (activity.sessionCompleted) {
                this.isProcessing = false;
                this.setPhase('idle');
                this.stopPolling();
            }
        }
    }

    private addMessage(role: Message['role'], text: string, sender?: string) {
        const existingMessage = this.messageHistory.find(m => m.text === text && m.role === role && m.sender === sender);
        if (existingMessage) return;

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
