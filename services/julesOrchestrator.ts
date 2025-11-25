import { GoogleGenAI } from '@google/genai';
import { AUSSIE_SYSTEM_INSTRUCTION, TOOLS } from '../constants';
import { getJulesApiKey } from './julesKeys';

export class JulesOrchestrator {
    private graph: any;
    private updateNodeCallback: any;
    private logCallback: any;

    constructor(graph: any, onUpdateNode: any, onLog: any) {
        this.graph = graph;
        this.updateNodeCallback = onUpdateNode;
        this.logCallback = onLog;
    }
    
    public async run() {
        if (!getJulesApiKey()) {
            this.logCallback("Error: No API Key");
            return;
        }
        const ai = new GoogleGenAI({ apiKey: getJulesApiKey() });
        const chat = ai.chats.create({
            model: 'gemini-2.5-pro',
            config: { systemInstruction: AUSSIE_SYSTEM_INSTRUCTION, tools: [{ functionDeclarations: TOOLS }] }
        });
        
        this.logCallback("Starting Flow...");
        const startNode = this.graph.nodes.find((n: any) => n.type === 'trigger');
        if(startNode) await this.traverse(startNode, "Flow Start", chat);
    }

    private async traverse(node: any, context: string, chat: any) {
        this.updateNodeCallback(node.id, { status: 'running' });
        try {
            let result = "";
            if(node.type !== 'trigger') {
                const prompt = `Context: ${context}. Task: ${node.prompt}. Execute this using available tools.`;
                const response = await chat.sendMessage({ message: prompt });
                const parts = response.candidates?.[0]?.content?.parts || [];
                const text = parts.filter((p:any)=>p.text).map((p:any)=>p.text).join('');
                result = text || "Executed.";
            }
            this.updateNodeCallback(node.id, { status: 'success', result });
            this.logCallback(`Node ${node.label} complete.`);
            
            const edges = this.graph.edges.filter((e: any) => e.source === node.id);
            for(const edge of edges) {
                const next = this.graph.nodes.find((n: any) => n.id === edge.target);
                if(next) await this.traverse(next, result, chat);
            }

        } catch(e: any) {
            this.updateNodeCallback(node.id, { status: 'error', result: e.message });
            this.logCallback(`Error in ${node.label}: ${e.message}`);
        }
    }
}
