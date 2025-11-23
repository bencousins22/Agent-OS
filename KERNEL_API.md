# Kernel API (Aussie OS + Web-OS bridge)

This document defines the kernel-facing surface for web apps/windows to run inside Aussie OS while preserving a sandboxed Jules runtime. It maps to our existing services (`fileSystem`, `windowManager`, `scheduler`, `notification`, `shell`) and is intended as a drop-in API for the upstream Web-OS desktop shell.

## Permissions model
- `fs`: `none` | `read` | `readwrite` (defaults to `readwrite`)
- `shell`: `allow` | `deny` (defaults to `deny`)
- `network`: `allow` | `deny` (placeholder for future fetch proxying; defaults to `deny`)
- `notifications`: boolean (defaults to `true`)
- `sandboxed`: boolean (defaults to `true`, enables stricter guardrails for Jules)

Configure via `createKernel({ permissions })`. The default export `kernel` uses defaults above.

## API surface
```ts
interface KernelAPI {
  fs: {
    readFile(path: string): string;
    writeFile(path: string, content: string, opts?: { append?: boolean }): void;
    list(path: string): FileStat[];
    stat(path: string): FileStat;
    mkdir(path: string): void;
    delete(path: string): void;
    move(src: string, dest: string): void;
  };
  windows: {
    open(appId: string, title: string, props?: any): void;
    close(id: string): void;
    focus(id: string): void;
    move(id: string, x: number, y: number): void;
    resize(id: string, width: number, height: number): void;
    list(): OSWindow[];
  };
  scheduler: {
    tasks(): ScheduledTask[];
    add(task: Omit<ScheduledTask, 'id' | 'lastRun' | 'status'>): ScheduledTask;
    remove(id: string): void;
  };
  shell: {
    exec(cmd: string): Promise<{ stdout: string; stderr: string; exitCode: number }>;
  };
  notify: {
    success(title: string, message: string): void;
    error(title: string, message: string): void;
    info(title: string, message: string): void;
    warning(title: string, message: string): void;
  };
  system: {
    sandboxed: boolean;
    capabilities: KernelPermissions;
    on(event: string, listener: (payload: any) => void): () => void; // uses eventBus under the hood
  };
}
```

Guards are enforced: write methods require `fs: readwrite`; shell execution requires `shell: allow`; notifications respect the `notifications` flag.

## Kernel manager
- Use `kernelManager.getKernel()` to retrieve the current API and `kernelManager.setPermissions(partialPermissions)` to elevate or tighten sandbox.
- The active kernel is exposed globally as `window.__AUSSIE_KERNEL__` for compatibility with external shells (e.g., Web-OS UI).
- Permission changes emit a `kernel-permissions-changed` event on the bus.

## Web-OS integration notes
- Replace Web-OS window/process plumbing with `kernel.windows` for open/close/focus/resize.
- Map any Web-OS file APIs to `kernel.fs`; default sandbox prevents writes unless explicitly enabled.
- App launchers/desktop shortcuts can query `kernel.system.capabilities` to adapt UI (e.g., hide shell terminal when `shell: deny`).
- To keep Jules sandboxed: create a kernel with `sandboxed: true` and `shell: deny`, and only allow specific FS paths by policy in app code. If/when a permissions UI is added, update the `permissions` passed to `createKernel`.

## Event bus bridge
`kernel.system.on(event, listener)` is a thin wrapper over the global bus; event types include `file-change`, `shell-output`, `browser-navigate`, `notification`, `task-run`, `task-complete`, etc.
