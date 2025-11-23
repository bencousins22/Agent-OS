import { bus } from './eventBus';
const STORAGE_KEY = 'aussie_os_fs_v2';
// TextEncoder/Decoder for Git binary handling simulation
const encoder = new TextEncoder();
const decoder = new TextDecoder();
class FileSystemService {
    constructor() {
        this._gitFsInterface = null;
        this.root = this.loadFromStorage() || this.createDefaultStructure();
        this.ensureDesktopEnvironment();
    }
    createDefaultStructure() {
        const root = {
            name: 'root',
            type: 'directory',
            children: new Map(),
            lastModified: Date.now()
        };
        // /workspace
        const workspace = {
            name: 'workspace',
            type: 'directory',
            children: new Map(),
            lastModified: Date.now()
        };
        root.children?.set('workspace', workspace);
        // /home/aussie/Desktop
        const home = { name: 'home', type: 'directory', children: new Map(), lastModified: Date.now() };
        const aussie = { name: 'aussie', type: 'directory', children: new Map(), lastModified: Date.now() };
        const desktop = { name: 'Desktop', type: 'directory', children: new Map(), lastModified: Date.now() };
        root.children?.set('home', home);
        home.children?.set('aussie', aussie);
        aussie.children?.set('Desktop', desktop);
        return root;
    }
    ensureDesktopEnvironment() {
        // Ensure /home/aussie/Desktop exists and populate it
        if (!this.exists('/home/aussie/Desktop')) {
            this.mkdir('/home/aussie/Desktop');
        }
        const shortcuts = [
            { name: 'My Projects.lnk', content: 'app:projects' },
            { name: 'Browser.lnk', content: 'app:browser' },
            { name: 'Jules Flow.lnk', content: 'app:flow' },
            { name: 'Terminal.lnk', content: 'app:code' },
            { name: 'GitHub.lnk', content: 'app:github' },
            { name: 'Deploy.lnk', content: 'app:deploy' },
            { name: 'README.txt', content: 'Welcome to Aussie OS.\nThis is your desktop environment.' }
        ];
        shortcuts.forEach(s => {
            const path = `/home/aussie/Desktop/${s.name}`;
            if (!this.exists(path)) {
                this.writeFile(path, s.content);
            }
        });
    }
    loadFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw)
                return null;
            const parsed = JSON.parse(raw);
            return this.deserializeNode(parsed);
        }
        catch (e) {
            console.error("Failed to load FS:", e);
            return null;
        }
    }
    saveToStorage() {
        try {
            const serialized = this.serializeNode(this.root);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
        }
        catch (e) {
            console.error("Failed to save FS:", e);
        }
    }
    serializeNode(node) {
        return {
            ...node,
            children: node.children ? Array.from(node.children.entries()).map(([k, v]) => [k, this.serializeNode(v)]) : undefined
        };
    }
    deserializeNode(data) {
        return {
            ...data,
            children: data.children ? new Map(data.children.map(([k, v]) => [k, this.deserializeNode(v)])) : undefined
        };
    }
    resolveNode(path) {
        if (path === '/')
            return this.root;
        const parts = path.split('/').filter(p => p);
        let current = this.root;
        for (const part of parts) {
            if (current.type !== 'directory' || !current.children)
                return null;
            const next = current.children.get(part);
            if (!next)
                return null;
            current = next;
        }
        return current;
    }
    exists(path) {
        return !!this.resolveNode(path);
    }
    readFile(path) {
        const node = this.resolveNode(path);
        if (!node)
            throw new Error(`File not found: ${path}`);
        if (node.type !== 'file')
            throw new Error(`Is a directory: ${path}`);
        return node.content || '';
    }
    writeFile(path, content, append) {
        const parts = path.split('/').filter(p => p);
        const fileName = parts.pop();
        if (!fileName)
            throw new Error('Invalid path');
        let current = this.root;
        for (const part of parts) {
            if (!current.children)
                current.children = new Map();
            let next = current.children.get(part);
            if (!next) {
                next = {
                    name: part,
                    type: 'directory',
                    children: new Map(),
                    lastModified: Date.now()
                };
                current.children.set(part, next);
            }
            if (next.type !== 'directory')
                throw new Error(`Path component ${part} is not a directory`);
            current = next;
        }
        let finalContent = content;
        if (append) {
            const existingNode = current.children?.get(fileName);
            if (existingNode && existingNode.type === 'file' && existingNode.content) {
                finalContent = existingNode.content + content;
            }
        }
        const fileNode = {
            name: fileName,
            type: 'file',
            content: finalContent,
            lastModified: Date.now()
        };
        if (!current.children)
            current.children = new Map();
        current.children.set(fileName, fileNode);
        this.saveToStorage();
        bus.emit('file-change', { path });
    }
    mkdir(path) {
        const parts = path.split('/').filter(p => p);
        let current = this.root;
        for (const part of parts) {
            if (!current.children)
                current.children = new Map();
            let next = current.children.get(part);
            if (!next) {
                next = {
                    name: part,
                    type: 'directory',
                    children: new Map(),
                    lastModified: Date.now()
                };
                current.children.set(part, next);
            }
            current = next;
        }
        this.saveToStorage();
        bus.emit('file-change', { path });
    }
    readDir(path) {
        const node = this.resolveNode(path);
        if (!node)
            throw new Error(`Path not found: ${path}`);
        if (node.type !== 'directory' || !node.children)
            throw new Error(`Not a directory: ${path}`);
        const results = [];
        for (const [name, child] of node.children.entries()) {
            results.push({
                name: child.name,
                path: path === '/' ? `/${name}` : `${path === '/' ? '' : path}/${name}`,
                type: child.type,
                size: child.content?.length || 0,
                lastModified: child.lastModified
            });
        }
        return results;
    }
    delete(path) {
        const parts = path.split('/').filter(p => p);
        const fileName = parts.pop();
        if (!fileName)
            return;
        let current = this.root;
        for (const part of parts) {
            if (!current.children)
                return;
            const next = current.children.get(part);
            if (!next)
                return;
            current = next;
        }
        if (current.children && current.children.has(fileName)) {
            current.children.delete(fileName);
            this.saveToStorage();
            bus.emit('file-change', { path });
        }
    }
    rmdir(path) {
        this.delete(path);
    }
    move(oldPath, newPath) {
        if (!this.exists(oldPath))
            throw new Error(`Source not found: ${oldPath}`);
        if (this.exists(newPath))
            throw new Error(`Destination exists: ${newPath}`);
        // Read source
        const node = this.resolveNode(oldPath);
        if (!node)
            throw new Error("Node read failed");
        // Write to new location (preserving children/content)
        // Since our writeFile/mkdir logic is text based for files, we need a deeper struct move.
        // Simplified for VFS: Read -> Write -> Delete
        if (node.type === 'file') {
            this.writeFile(newPath, node.content || '');
        }
        else {
            this.mkdir(newPath);
            // Recursive move for directory content would be needed here for robust full directory move
            // For this simplified drag/drop demo, we'll assume files or empty dirs, or handle deeper copy later.
            // Re-implementing deep copy logic:
            if (node.children) {
                node.children.forEach((child, name) => {
                    this.move(`${oldPath}/${name}`, `${newPath}/${name}`);
                });
            }
        }
        this.delete(oldPath);
        bus.emit('file-change', { path: oldPath });
        bus.emit('file-change', { path: newPath });
    }
    get gitFs() {
        if (this._gitFsInterface)
            return this._gitFsInterface;
        const self = this;
        this._gitFsInterface = {
            promises: {
                readFile: async (path, opts) => {
                    try {
                        const content = self.readFile(path);
                        if (opts && opts.encoding === 'utf8')
                            return content;
                        return encoder.encode(content);
                    }
                    catch (e) {
                        const err = new Error(e.message);
                        err.code = 'ENOENT';
                        throw err;
                    }
                },
                writeFile: async (path, data, opts) => {
                    let content = '';
                    if (typeof data === 'string')
                        content = data;
                    else
                        content = decoder.decode(data);
                    self.writeFile(path, content);
                },
                unlink: async (path) => {
                    if (!self.exists(path)) {
                        const err = new Error('ENOENT');
                        err.code = 'ENOENT';
                        throw err;
                    }
                    self.delete(path);
                },
                readdir: async (path) => {
                    try {
                        const stats = self.readDir(path);
                        return stats.map(s => s.name);
                    }
                    catch (e) {
                        const err = new Error('ENOENT');
                        err.code = 'ENOENT';
                        throw err;
                    }
                },
                mkdir: async (path) => self.mkdir(path),
                rmdir: async (path) => self.rmdir(path),
                stat: async (path) => {
                    const node = self.resolveNode(path);
                    if (!node) {
                        const err = new Error('ENOENT');
                        err.code = 'ENOENT';
                        throw err;
                    }
                    return {
                        isFile: () => node.type === 'file',
                        isDirectory: () => node.type === 'directory',
                        isSymbolicLink: () => false,
                        size: node.content?.length || 0,
                        mtimeMs: node.lastModified,
                        type: node.type === 'file' ? 1 : 2,
                        mode: node.type === 'file' ? 0o100644 : 0o40755,
                        uid: 0,
                        gid: 0,
                        ino: 0,
                        ctimeMs: node.lastModified
                    };
                },
                lstat: async (path) => {
                    const node = self.resolveNode(path);
                    if (!node) {
                        const err = new Error('ENOENT');
                        err.code = 'ENOENT';
                        throw err;
                    }
                    return {
                        isFile: () => node.type === 'file',
                        isDirectory: () => node.type === 'directory',
                        isSymbolicLink: () => false,
                        size: node.content?.length || 0,
                        mtimeMs: node.lastModified,
                        type: node.type === 'file' ? 1 : 2,
                        mode: node.type === 'file' ? 0o100644 : 0o40755,
                        uid: 0,
                        gid: 0,
                        ino: 0,
                        ctimeMs: node.lastModified
                    };
                }
            }
        };
        return this._gitFsInterface;
    }
}
export const fs = new FileSystemService();
