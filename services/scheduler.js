import { fs } from './fileSystem';
import { shell } from './shell';
import { bus } from './eventBus';
import { notify } from './notification';
const TASKS_FILE = '/workspace/system/schedule.json';
class SchedulerService {
    constructor() {
        this.tasks = [];
        this.intervalId = null;
        this.loadTasks();
    }
    loadTasks() {
        try {
            if (fs.exists(TASKS_FILE)) {
                const content = fs.readFile(TASKS_FILE);
                this.tasks = JSON.parse(content);
            }
            else {
                // Ensure directory exists
                if (!fs.exists('/workspace/system'))
                    fs.mkdir('/workspace/system');
            }
        }
        catch (e) {
            console.error("Scheduler load error", e);
            this.tasks = [];
        }
    }
    saveTasks() {
        try {
            if (!fs.exists('/workspace/system'))
                fs.mkdir('/workspace/system');
            fs.writeFile(TASKS_FILE, JSON.stringify(this.tasks, null, 2));
        }
        catch (e) {
            console.error("Scheduler save error", e);
        }
    }
    start() {
        if (this.intervalId)
            return;
        console.log("Scheduler started");
        // Check every second
        this.intervalId = setInterval(() => this.tick(), 1000);
    }
    stop() {
        if (this.intervalId)
            clearInterval(this.intervalId);
        this.intervalId = null;
    }
    addTask(task) {
        const newTask = {
            id: Math.random().toString(36).substr(2, 9),
            status: 'active',
            ...task
        };
        this.tasks.push(newTask);
        this.saveTasks();
        notify.success("Task Scheduled", `Task '${task.name}' added.`);
        return newTask;
    }
    removeTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
    }
    getTasks() {
        return this.tasks;
    }
    async tick() {
        const now = Date.now();
        for (const task of this.tasks) {
            if (task.status === 'active' && task.nextRun <= now) {
                await this.executeTask(task);
            }
        }
    }
    async executeTask(task) {
        bus.emit('task-run', { taskId: task.id, name: task.name });
        notify.info("Scheduler", `Running task: ${task.name}`);
        let output = "";
        try {
            if (task.type === 'command') {
                const res = await shell.execute(task.action);
                output = res.exitCode === 0 ? "Success" : `Failed: ${res.stderr}`;
            }
            else if (task.type === 'swarm') {
                const res = await shell.execute(`gemini-flow hive-mind spawn --objective "${task.action}"`);
                output = res.stdout;
            }
            else if (task.type === 'flow') {
                // Execute flow by ID using the shell gemini-flow command
                const flowId = task.action;
                const res = await shell.execute(`gemini-flow run-flow ${flowId}`);
                output = res.exitCode === 0 ? res.stdout : `Failed: ${res.stderr}`;
            }
        }
        catch (e) {
            output = `Error: ${e.message}`;
        }
        // Update Task State
        const now = Date.now();
        task.lastRun = now;
        task.lastResult = output.substring(0, 100) + (output.length > 100 ? '...' : '');
        // Schedule Next Run
        if (task.schedule === 'once') {
            task.status = 'completed';
        }
        else if (task.schedule === 'interval' && task.intervalSeconds) {
            task.nextRun = now + (task.intervalSeconds * 1000);
        }
        else if (task.schedule === 'hourly') {
            task.nextRun = now + (60 * 60 * 1000);
        }
        else if (task.schedule === 'daily') {
            task.nextRun = now + (24 * 60 * 60 * 1000);
        }
        this.saveTasks();
        bus.emit('task-complete', { taskId: task.id, result: output });
    }
}
export const scheduler = new SchedulerService();
