const nodeEnv = typeof process !== 'undefined' ? process.env : {};
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any)?.env ?? {} : {};

const STORAGE_KEYS = {
    JULES_API_KEY: 'jules_api_key',
    JULES_API_URL: 'jules_api_url',
};

const hasLocalStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const readStorage = (key: string) => {
    if (!hasLocalStorage()) return null;
    return window.localStorage.getItem(key);
};
const writeStorage = (key: string, value: string) => {
    if (!hasLocalStorage()) return;
    window.localStorage.setItem(key, value);
};

export const getJulesApiKey = () => {
    return (
        readStorage(STORAGE_KEYS.JULES_API_KEY) ||
        nodeEnv.JULES_API_KEY ||
        metaEnv?.JULES_API_KEY ||
        nodeEnv.API_KEY ||
        metaEnv?.API_KEY ||
        ''
    );
};

export const getJulesApiUrl = () => {
    return (
        readStorage(STORAGE_KEYS.JULES_API_URL) ||
        nodeEnv.JULES_API_URL ||
        metaEnv?.JULES_API_URL ||
        'https://api.jules.dev/v1'
    );
};

export const storeJulesApiKey = (value: string) => writeStorage(STORAGE_KEYS.JULES_API_KEY, value);
export const storeJulesApiUrl = (value: string) => writeStorage(STORAGE_KEYS.JULES_API_URL, value);
