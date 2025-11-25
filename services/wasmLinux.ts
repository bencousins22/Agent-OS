
import { fs } from './fileSystem';
import { kernelManager, KernelPermissions } from './kernel';
import { ShellResult, FileStat } from '../types';

type RuntimeStatus = 'offline' | 'booting' | 'ready' | 'error';

export interface WasmRuntimeProcess {
    pid: number;
    name: string;
    state: 'running' | 'sleeping' | 'zombie';
    cpu: number;
    mem: number;
}

export interface WasmRuntimeState {
    status: RuntimeStatus;
    startedAt: number | null;
    lastCommand?: string;
    lastExitCode?: number;
    lastOutput?: string;
    logs: string[];
    mounts: string[];
    processes: WasmRuntimeProcess[];
    permissions: KernelPermissions;
    version: string;
}

const DEFAULT_PROCESSES: WasmRuntimeProcess[] = [
    { pid: 101, name: 'aussie-agent', state: 'running', cpu: 12, mem: 210 },
    { pid: 102, name: 'scheduler', state: 'sleeping', cpu: 3, mem: 88 },
    { pid: 103, name: 'fs-indexer', state: 'running', cpu: 5, mem: 64 },
    { pid: 104, name: 'telemetry', state: 'sleeping', cpu: 1, mem: 24 }
];

const capLog = (arr: string[], max = 40) => {
    if (arr.length <= max) return arr;
    return arr.slice(arr.length - max);
};

class WasmLinuxRuntime {
    private state: WasmRuntimeState = {
        status: 'offline',
        startedAt: null,
        logs: [],
        mounts: ['/workspace', '/home/aussie', '/tmp'],
        processes: [],
        permissions: kernelManager.getPermissions(),
        version: 'wasm-linux v0.4'
    };

    private listeners = new Set<(state: WasmRuntimeState) => void>();

    public getState() {
        return this.state;
    }

    public subscribe(listener: (state: WasmRuntimeState) => void) {
        this.listeners.add(listener);
        listener(this.state);
        return () => this.listeners.delete(listener);
    }

    private emit() {
        const snapshot = { ...this.state, processes: [...this.state.processes] };
        this.listeners.forEach(l => l(snapshot));
    }

    private log(line: string) {
        const ts = new Date().toISOString().split('T')[1]?.slice(0, 8) || '';
        this.state.logs = capLog([...this.state.logs, `[${ts}] ${line}`]);
        this.emit();
    }

    public async start() {
        if (this.state.status === 'ready') return this.state;
        this.state.status = 'booting';
        this.state.startedAt = Date.now();
        this.log('Booting wasm linux runtime…');
        this.emit();

        try {

            if (!fs.exists('/workspace/README.md')) {
                fs.writeFile('/workspace/README.md', '# Aussie WASM Linux\n\nRuntime is ready for local agents.');
            }

            this.state.processes = [...DEFAULT_PROCESSES];
            this.state.status = 'ready';
            this.log('Runtime ready: agents may execute locally.');
        } catch (e: any) {
            this.state.status = 'error';
            this.log(`Runtime error: ${e.message || 'unknown failure'}`);
        }

        this.emit();
        return this.state;
    }

    public stop() {
        this.state.status = 'offline';
        this.state.startedAt = null;
        this.state.processes = [];
        this.log('Runtime stopped');
        this.emit();
    }

    public async restart() {
        this.stop();
        return this.start();
    }

    public updatePermissions(next: Partial<KernelPermissions>) {
        kernelManager.setPermissions(next);
        this.state.permissions = kernelManager.getPermissions();
        this.log(`Permissions updated: fs=${this.state.permissions.fs}, shell=${this.state.permissions.shell}, net=${this.state.permissions.network}`);
        this.emit();
        return this.state.permissions;
    }

    public recordExecution(cmd: string, result?: ShellResult) {
        this.state.lastCommand = cmd;
        this.state.lastExitCode = result?.exitCode;
        this.state.lastOutput = result?.stdout || result?.stderr || '';
        this.log(`$ ${cmd}`);
        if (result?.stdout) this.log(`stdout: ${result.stdout.slice(0, 400)}`);
        if (result?.stderr) this.log(`stderr: ${result.stderr.slice(0, 400)}`);
        this.emit();
    }

    public async runCommand(cmd: string, executor?: (cmd: string) => Promise<ShellResult | void>) {
        if (this.state.status === 'offline') {
            await this.start();
        }
        this.log(`Executing in wasm linux: ${cmd}`);
        let result: ShellResult | undefined;
        if (executor) {
            const maybe = await executor(cmd);
            if (maybe) result = maybe;
        }
        this.recordExecution(cmd, result);
        return result;
    }

    public getFsSnapshot(path = '/workspace'): FileStat[] {
        try {
            return fs.readDir(path);
        } catch (e) {
            this.log(`fs error on ${path}`);
            return [];
        }
    }

    public writeFile(path: string, content: string) {
        try { fs.writeFile(path, content); } catch {}
        this.log(`Updated ${path}`);
    }
}

export const wasmRuntime = new WasmLinuxRuntime();
