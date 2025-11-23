import { fs } from './fileSystem';
import { shell } from './shell';
import { github } from './github';
import { realGit } from './gitReal';
import { notify } from './notification';
import { bus } from './eventBus';

export interface ToolExecutionContext {
    workingDirectory?: string;
    agentName?: string;
    sessionId?: string;
}

export interface ToolResult {
    success: boolean;
    output: string;
    error?: string;
}

/**
 * Centralized tool execution registry
 * Single source of truth for all agent tool capabilities
 */
class ToolRegistry {
    async executeTool(
        toolName: string,
        args: Record<string, any>,
        context: ToolExecutionContext = {}
    ): Promise<ToolResult> {
        const { agentName = 'Agent', sessionId } = context;

        try {
            switch (toolName) {
                case 'read_file':
                    return this.readFile(args.path);

                case 'write_file':
                    return this.writeFile(args.path, args.content);

                case 'list_files':
                    return this.listFiles(args.path || '/workspace');

                case 'search_files':
                    return this.searchFiles(args.query, args.path || '/workspace');

                case 'run_command':
                    return await this.runCommand(args.command);

                case 'git_status':
                    return await this.gitStatus();

                case 'git_add':
                    return await this.gitAdd(args.files || []);

                case 'git_commit':
                    return await this.gitCommit(args.message);

                case 'git_push':
                    return await this.gitPush();

                case 'github_create_pr':
                    return await this.githubCreatePR(args.title, args.body, args.base || 'main', args.head);

                case 'github_list_prs':
                    return await this.githubListPRs();

                case 'create_flow':
                    return this.createFlow(args.name, args.nodes, args.edges);

                case 'run_flow':
                    return await this.runFlow(args.flowId);

                case 'notify_user':
                    return this.notifyUser(args.title, args.message, args.type || 'info');

                case 'emit_event':
                    return this.emitEvent(args.eventType, args.payload);

                case 'create_directory':
                    return this.createDirectory(args.path);

                case 'delete_file':
                    return this.deleteFile(args.path);

                default:
                    return {
                        success: false,
                        output: '',
                        error: `Unknown tool: ${toolName}`
                    };
            }
        } catch (e: any) {
            return {
                success: false,
                output: '',
                error: e.message
            };
        }
    }

    // File Operations
    private readFile(path: string): ToolResult {
        try {
            const content = fs.readFile(path);
            return { success: true, output: content };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    private writeFile(path: string, content: string): ToolResult {
        try {
            fs.writeFile(path, content);
            return { success: true, output: `File written: ${path}` };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    private listFiles(path: string): ToolResult {
        try {
            const files = fs.readDir(path);
            const fileList = files.map(f => `${f.type === 'directory' ? '📁' : '📄'} ${f.name}`).join('\n');
            return { success: true, output: fileList };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    private searchFiles(query: string, basePath: string): ToolResult {
        try {
            const results: string[] = [];
            const search = (dir: string) => {
                const files = fs.readDir(dir);
                for (const file of files) {
                    if (file.name.toLowerCase().includes(query.toLowerCase())) {
                        results.push(file.path);
                    }
                    if (file.type === 'directory') {
                        search(file.path);
                    }
                }
            };
            search(basePath);
            return { success: true, output: results.join('\n') };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    private createDirectory(path: string): ToolResult {
        try {
            fs.mkdir(path);
            return { success: true, output: `Directory created: ${path}` };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    private deleteFile(path: string): ToolResult {
        try {
            fs.delete(path);
            return { success: true, output: `Deleted: ${path}` };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    // Shell Operations
    private async runCommand(command: string): Promise<ToolResult> {
        try {
            const result = await shell.execute(command);
            if (result.exitCode === 0) {
                return { success: true, output: result.stdout };
            } else {
                return { success: false, output: result.stdout, error: result.stderr };
            }
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    // Git Operations
    private async gitStatus(): Promise<ToolResult> {
        try {
            const status = await realGit.status();
            return { success: true, output: JSON.stringify(status, null, 2) };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    private async gitAdd(files: string[]): Promise<ToolResult> {
        try {
            const dir = '/workspace';
            if (files.length === 0) {
                await realGit.add(dir, '.');
            } else {
                for (const file of files) {
                    await realGit.add(dir, file);
                }
            }
            return { success: true, output: `Added ${files.length || 'all'} files to staging` };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    private async gitCommit(message: string): Promise<ToolResult> {
        try {
            const dir = '/workspace';
            await realGit.commit(dir, message);
            return { success: true, output: `Committed: ${message}` };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    private async gitPush(): Promise<ToolResult> {
        try {
            // Git push via shell command since gitReal doesn't have push method
            const result = await shell.execute('git push');
            if (result.exitCode === 0) {
                return { success: true, output: result.stdout };
            } else {
                return { success: false, output: result.stdout, error: result.stderr };
            }
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    // GitHub Operations
    private async githubCreatePR(title: string, body: string, base: string, head: string): Promise<ToolResult> {
        try {
            // GitHub PR creation not yet implemented in github.ts
            return { success: false, output: '', error: 'GitHub PR creation not yet implemented' };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    private async githubListPRs(): Promise<ToolResult> {
        try {
            // GitHub PR listing not yet implemented in github.ts
            return { success: false, output: '', error: 'GitHub PR listing not yet implemented' };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    // Flow Operations
    private createFlow(name: string, nodes: any[], edges: any[]): ToolResult {
        try {
            const flowId = Math.random().toString(36).substr(2, 9);
            const flowPath = `/workspace/flows/${flowId}.json`;

            // Ensure flows directory exists
            if (!fs.exists('/workspace/flows')) {
                fs.mkdir('/workspace/flows');
            }

            const flowData = {
                id: flowId,
                name,
                nodes,
                edges,
                createdAt: Date.now(),
                modifiedAt: Date.now()
            };

            fs.writeFile(flowPath, JSON.stringify(flowData, null, 2));
            return { success: true, output: `Flow created: ${flowId}` };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    private async runFlow(flowId: string): Promise<ToolResult> {
        try {
            const result = await shell.execute(`gemini-flow run-flow ${flowId}`);
            if (result.exitCode === 0) {
                return { success: true, output: result.stdout };
            } else {
                return { success: false, output: result.stdout, error: result.stderr };
            }
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    // UI Operations
    private notifyUser(title: string, message: string, type: 'info' | 'success' | 'error' | 'warning'): ToolResult {
        try {
            notify[type](title, message);
            return { success: true, output: `Notification sent: ${type}` };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }

    private emitEvent(eventType: string, payload: any): ToolResult {
        try {
            bus.emit(eventType as any, payload);
            return { success: true, output: `Event emitted: ${eventType}` };
        } catch (e: any) {
            return { success: false, output: '', error: e.message };
        }
    }
}

export const toolRegistry = new ToolRegistry();
