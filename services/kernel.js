import { fs } from './fileSystem';
import { wm } from './windowManager';
import { scheduler } from './scheduler';
import { shell } from './shell';
import { notify } from './notification';
import { bus } from './eventBus';
const guard = (condition, message) => {
    if (!condition)
        throw new Error(message);
};
export const createKernel = (permissions = {}) => {
    const caps = {
        fs: 'readwrite',
        shell: 'deny',
        network: 'deny',
        notifications: true,
        sandboxed: true,
        ...permissions
    };
    const fsAdapter = {
        readFile: (path) => {
            guard(caps.fs !== 'none', 'FS read not permitted in sandbox');
            return fs.readFile(path);
        },
        writeFile: (path, content, opts) => {
            guard(caps.fs === 'readwrite', 'FS write not permitted in sandbox');
            fs.writeFile(path, content, opts?.append);
        },
        list: (path) => {
            guard(caps.fs !== 'none', 'FS read not permitted in sandbox');
            return fs.readDir(path);
        },
        stat: (path) => {
            guard(caps.fs !== 'none', 'FS read not permitted in sandbox');
            const parts = path.split('/').filter(Boolean);
            const name = parts.pop();
            const parent = '/' + (parts.join('/') || '');
            const node = name ? fs.readDir(parent === '//' ? '/' : parent).find(f => f.name === name) : null;
            if (!node)
                throw new Error(`Path not found: ${path}`);
            return node;
        },
        mkdir: (path) => {
            guard(caps.fs === 'readwrite', 'FS write not permitted in sandbox');
            fs.mkdir(path);
        },
        delete: (path) => {
            guard(caps.fs === 'readwrite', 'FS write not permitted in sandbox');
            fs.delete(path);
        },
        move: (src, dest) => {
            guard(caps.fs === 'readwrite', 'FS write not permitted in sandbox');
            fs.move(src, dest);
        }
    };
    const windowsAdapter = {
        open: (appId, title, props) => wm.openWindow(appId, title, props),
        close: (id) => wm.closeWindow(id),
        focus: (id) => wm.focusWindow(id),
        move: (id, x, y) => wm.moveWindow(id, x, y),
        resize: (id, width, height) => wm.resizeWindow(id, width, height),
        list: () => wm.getWindows()
    };
    const schedulerAdapter = {
        tasks: () => scheduler.getTasks(),
        add: (task) => {
            guard(caps.fs === 'readwrite', 'Scheduler requires write access');
            return scheduler.addTask(task);
        },
        remove: (id) => {
            guard(caps.fs === 'readwrite', 'Scheduler requires write access');
            scheduler.removeTask(id);
        }
    };
    const shellAdapter = {
        exec: async (cmd) => {
            guard(caps.shell === 'allow', 'Shell access is disabled in sandbox');
            return shell.execute(cmd);
        }
    };
    const notifyAdapter = {
        success: (t, m) => { if (caps.notifications)
            notify.success(t, m); },
        error: (t, m) => { if (caps.notifications)
            notify.error(t, m); },
        info: (t, m) => { if (caps.notifications)
            notify.info(t, m); },
        warning: (t, m) => { if (caps.notifications)
            notify.warning(t, m); }
    };
    const systemAdapter = {
        sandboxed: caps.sandboxed,
        capabilities: caps,
        on: (event, listener) => bus.subscribe((e) => { if (e.type === event)
            listener(e.payload); })
    };
    return {
        fs: fsAdapter,
        windows: windowsAdapter,
        scheduler: schedulerAdapter,
        shell: shellAdapter,
        notify: notifyAdapter,
        system: systemAdapter
    };
};
class KernelManager {
    constructor() {
        this.permissions = {
            fs: 'readwrite',
            shell: 'deny',
            network: 'deny',
            notifications: true,
            sandboxed: true
        };
        this.kernelApi = createKernel(this.permissions);
        this.expose();
    }
    expose() {
        if (typeof window !== 'undefined') {
            window.__AUSSIE_KERNEL__ = this.kernelApi;
        }
    }
    getKernel() {
        return this.kernelApi;
    }
    getPermissions() {
        return this.permissions;
    }
    setPermissions(next) {
        this.permissions = { ...this.permissions, ...next };
        this.kernelApi = createKernel(this.permissions);
        this.expose();
        bus.emit('kernel-permissions-changed', this.permissions);
        return this.kernelApi;
    }
}
export const kernelManager = new KernelManager();
export const kernel = kernelManager.getKernel();
