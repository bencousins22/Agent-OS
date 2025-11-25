import { fs } from './fileSystem';
import { shell } from './shell';
import { bus } from './eventBus';

type DaemonLog = { ts: number; message: string; level?: 'info' | 'warn' | 'error' };
type DaemonTask = { id: string; type: 'archive' | 'organize'; target: string; createdAt: number };

class AgentDaemon {
    private goal: string = 'Keep the workspace tidy and systems healthy.';
    private timer: number | null = null;
    private intervalMs = 7000;
    private logs: DaemonLog[] = [];
    private lastDesktopCount = 0;
    private queue: DaemonTask[] = [];
    private unsubFileChange: (() => void) | null = null;

    public start(goal?: string, intervalMs?: number) {
        if (goal) this.goal = goal;
        if (intervalMs) this.intervalMs = intervalMs;
        if (this.timer) {
            window.clearInterval(this.timer);
        }
        void this.tick();
        this.timer = window.setInterval(() => { void this.tick(); }, this.intervalMs);
        // Subscribe to file changes for reflex triggers
        if (!this.unsubFileChange) {
            this.unsubFileChange = bus.subscribe(e => {
                if (e.type === 'file-change' && e.payload?.path) {
                    this.handleFileChange(e.payload.path);
                }
            });
        }
        bus.emit('agent-daemon-state', { running: true, goal: this.goal });
        this.log(`Daemon started: ${this.goal}`);
    }

    public stop() {
        if (this.timer) window.clearInterval(this.timer);
        this.timer = null;
        if (this.unsubFileChange) {
            this.unsubFileChange();
            this.unsubFileChange = null;
        }
        bus.emit('agent-daemon-state', { running: false, goal: this.goal });
        this.log('Daemon stopped', 'warn');
    }

    public isRunning() {
        return this.timer !== null;
    }

    public getLogs() {
        return this.logs.slice(-30);
    }

    public getQueue() {
        return this.queue.slice();
    }

    private log(message: string, level: DaemonLog['level'] = 'info') {
        const entry: DaemonLog = { ts: Date.now(), message, level };
        this.logs = [...this.logs.slice(-49), entry];
        bus.emit('agent-daemon-log', entry);
    }

    private enqueue(task: DaemonTask) {
        this.queue = [...this.queue, task].slice(-50);
    }

    private async tick() {
        try {
            this.scanDesktop();
            await this.ensureWorkspace();
            await this.processQueue();
        } catch (e: any) {
            this.log(`Tick error: ${e.message || e}`, 'error');
        }
    }

    private scanDesktop() {
        const desktopPath = '/home/aussie/Desktop';
        const files = fs.readDir(desktopPath);
        if (files.length !== this.lastDesktopCount) {
            const delta = files.length - this.lastDesktopCount;
            this.log(`Desktop change detected (${delta >= 0 ? '+' : ''}${delta} items)`);
            this.lastDesktopCount = files.length;
        }

        // Auto-archive noisy files
        const archivePath = '/workspace/archive';
        if (!fs.exists(archivePath)) fs.mkdir(archivePath);
        files
            .filter(f => f.type === 'file' && (f.name.endsWith('.tmp') || f.name.endsWith('.log')))
            .forEach(f => {
                const dest = `${archivePath}/${f.name}`;
                try {
                    fs.move(f.path, dest);
                    this.log(`Archived ${f.name} to ${dest}`);
                } catch (e: any) {
                    this.log(`Archive failed for ${f.name}: ${e.message || e}`, 'error');
                }
            });
    }

    private async ensureWorkspace() {
        // Lightweight health: ensure projects directory exists and record status
        const projectsPath = '/workspace/projects';
        if (!fs.exists(projectsPath)) fs.mkdir(projectsPath);
        const downloadsPath = '/workspace/downloads';
        if (!fs.exists(downloadsPath)) fs.mkdir(downloadsPath);
        const archivePath = '/workspace/archive';
        if (!fs.exists(archivePath)) fs.mkdir(archivePath);

        // Example health check: run a quick ls in workspace via shell
        try {
            const res = await shell.execute('ls /workspace');
            if (res.stdout) this.log(`Workspace ready: ${res.stdout.trim()}`);
        } catch (e: any) {
            this.log(`Workspace check failed: ${e.message || e}`, 'error');
        }
    }

    private handleFileChange(path: string) {
        if (path.endsWith('.tmp') || path.endsWith('.log')) {
            this.enqueue({ id: `${Date.now()}-${path}`, type: 'archive', target: path, createdAt: Date.now() });
        }
        if (path.startsWith('/workspace/downloads')) {
            this.enqueue({ id: `${Date.now()}-${path}`, type: 'organize', target: path, createdAt: Date.now() });
        }
    }

    private async processQueue() {
        if (this.queue.length === 0) return;
        const next = this.queue[0];
        try {
            if (next.type === 'archive') {
                const dest = `/workspace/archive/${next.target.split('/').pop()}`;
                fs.move(next.target, dest);
                this.log(`Archived ${next.target} -> ${dest}`);
            } else if (next.type === 'organize') {
                const name = next.target.split('/').pop() || 'file';
                const destDir = name.toLowerCase().endsWith('.pdf') ? '/workspace/archive' : '/workspace/projects';
                const dest = `${destDir}/${name}`;
                fs.move(next.target, dest);
                this.log(`Organized ${name} -> ${dest}`);
            }
        } catch (e: any) {
            this.log(`Queue task failed (${next.type} ${next.target}): ${e.message || e}`, 'error');
        } finally {
            this.queue = this.queue.slice(1);
        }
    }
}

export const agentDaemon = new AgentDaemon();
