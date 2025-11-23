/**
 * This service simulates the Rust/Wasm backend.
 * In a real implementation, this would import a .wasm module.
 */
class RustFileSystem {
    constructor() {
        this.files = new Map();
        this.metadata = new Map();
        // Initialize with some dummy data
        this.writeFile('/workspace/readme.md', '# Aussie IDE\n\nWelcome to the Gemini Flow workspace.');
        this.writeFile('/workspace/src/main.py', 'def main():\n    print("Hello from Aussie Agent")\n\nif __name__ == "__main__":\n    main()');
    }
    exists(path) {
        return this.files.has(path);
    }
    readFile(path) {
        if (!this.files.has(path))
            throw new Error(`File not found: ${path}`);
        return this.files.get(path) || '';
    }
    writeFile(path, content) {
        this.files.set(path, content);
        const name = path.split('/').pop() || '';
        const ext = name.split('.').pop() || 'txt';
        this.metadata.set(path, {
            name,
            path,
            type: 'file',
            size: content.length,
            lastModified: Date.now(),
            language: this.getLanguage(ext)
        });
    }
    readDir(path) {
        // Naive implementation for simulation
        const results = [];
        const prefix = path.endsWith('/') ? path : `${path}/`;
        // Use a Set to avoid duplicates for directories
        const addedPaths = new Set();
        for (const [filePath, meta] of this.metadata.entries()) {
            if (filePath.startsWith(prefix)) {
                const relative = filePath.substring(prefix.length);
                const parts = relative.split('/');
                // Direct child
                if (parts.length === 1) {
                    results.push(meta);
                }
                else {
                    // It's a subdirectory item, ensure we add the directory itself once
                    const dirName = parts[0];
                    const fullDirPath = prefix + dirName;
                    if (!addedPaths.has(fullDirPath)) {
                        addedPaths.add(fullDirPath);
                        results.push({
                            name: dirName,
                            path: fullDirPath,
                            type: 'directory',
                            size: 0,
                            lastModified: Date.now()
                        });
                    }
                }
            }
        }
        return results;
    }
    getLanguage(ext) {
        const map = {
            'ts': 'typescript', 'tsx': 'typescript',
            'js': 'javascript', 'jsx': 'javascript',
            'py': 'python',
            'md': 'markdown',
            'json': 'json',
            'html': 'html',
            'css': 'css',
            'rs': 'rust'
        };
        return map[ext] || 'plaintext';
    }
}
export const rustFS = new RustFileSystem();
