import { kernelManager } from './kernel';

type WebOsAction =
    | 'fs.read'
    | 'fs.write'
    | 'fs.list'
    | 'fs.mkdir'
    | 'fs.delete'
    | 'fs.move'
    | 'windows.open'
    | 'windows.close'
    | 'windows.focus'
    | 'windows.list'
    | 'shell.exec'
    | 'permissions.get'
    | 'permissions.set';

interface WebOsMessage {
    source: 'web-os';
    id: string;
    action: WebOsAction;
    payload?: any;
}

const respond = (event: MessageEvent, id: string, ok: boolean, result?: any, error?: string) => {
    const target = event.source as Window | null;
    if (!target) return;
    target.postMessage(
        {
            source: 'aussie-kernel',
            id,
            ok,
            result,
            error
        },
        event.origin || '*'
    );
};

let started = false;

export const initWebOsBridge = () => {
    if (started || typeof window === 'undefined') return;
    started = true;

    window.addEventListener('message', async (event: MessageEvent) => {
        const data = event.data as WebOsMessage;
        if (!data || data.source !== 'web-os') return;
        if (event.origin && event.origin !== window.location.origin) return;

        const kernel = kernelManager.getKernel();

        try {
            let result: any;
            switch (data.action) {
                case 'fs.read':
                    result = kernel.fs.readFile(data.payload?.path);
                    break;
                case 'fs.write':
                    kernel.fs.writeFile(data.payload?.path, data.payload?.content || '', { append: !!data.payload?.append });
                    result = true;
                    break;
                case 'fs.list':
                    result = kernel.fs.list(data.payload?.path || '/');
                    break;
                case 'fs.mkdir':
                    kernel.fs.mkdir(data.payload?.path);
                    result = true;
                    break;
                case 'fs.delete':
                    kernel.fs.delete(data.payload?.path);
                    result = true;
                    break;
                case 'fs.move':
                    kernel.fs.move(data.payload?.src, data.payload?.dest);
                    result = true;
                    break;
                case 'windows.open':
                    kernel.windows.open(data.payload?.appId, data.payload?.title || data.payload?.appId, data.payload?.props);
                    result = true;
                    break;
                case 'windows.close':
                    kernel.windows.close(data.payload?.id);
                    result = true;
                    break;
                case 'windows.focus':
                    kernel.windows.focus(data.payload?.id);
                    result = true;
                    break;
                case 'windows.list':
                    result = kernel.windows.list();
                    break;
                case 'shell.exec':
                    result = await kernel.shell.exec(data.payload?.cmd || '');
                    break;
                case 'permissions.get':
                    result = kernel.system.capabilities;
                    break;
                case 'permissions.set':
                    result = kernelManager.setPermissions(data.payload || {});
                    break;
                default:
                    throw new Error(`Unsupported action: ${data.action}`);
            }
            respond(event, data.id, true, result);
        } catch (e: any) {
            respond(event, data.id, false, undefined, e.message || 'Kernel bridge error');
        }
    });
};
