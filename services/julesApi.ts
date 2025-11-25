import { getJulesApiKey, getJulesApiUrl } from './julesKeys';

const DEFAULT_RETRY_PATHS = ['/status', '/health'];

const fetchWithTimeout = (url: string, options: RequestInit, timeout = 6000) =>
    new Promise<Response>((resolve, reject) => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            controller.abort();
            reject(new Error('Request timed out'));
        }, timeout);

        fetch(url, { ...options, signal: controller.signal })
            .then(res => {
                clearTimeout(timer);
                resolve(res);
            })
            .catch(err => {
                clearTimeout(timer);
                reject(err);
            });
    });

export const pingJulesApi = async () => {
    const apiKey = getJulesApiKey();
    const baseUrl = getJulesApiUrl();
    if (!apiKey) {
        throw new Error('No Jules API key configured');
    }

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
    };

    let lastError: any;
    for (const suffix of DEFAULT_RETRY_PATHS) {
        const url = `${baseUrl.replace(/\/$/, '')}${suffix}`;
        try {
            const res = await fetchWithTimeout(url, { method: 'GET', headers });
            if (res.ok) {
                return res.json().catch(() => ({ status: 'ok', url }));
            }
            lastError = new Error(`Status ${res.status}`);
        } catch (err) {
            lastError = err;
        }
    }

    throw lastError || new Error('Unable to reach Jules API');
};
