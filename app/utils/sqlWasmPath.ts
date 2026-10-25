function normalizeBaseURL(baseURL: string): string {
    if (!baseURL || baseURL === '/') return '';
    return baseURL.replace(/\/$/, '');
}

function getNuxtRuntimeBaseURL(): string | undefined {
    const nuxtConfig = (globalThis as {
        __NUXT__?: {
            config?: {
                app?: {
                    baseURL?: string
                }
            }
        }
    }).__NUXT__?.config?.app?.baseURL;

    return nuxtConfig || undefined;
}

function getNuxtScriptBaseURL(): string | undefined {
    if (typeof document === 'undefined') return undefined;

    const nuxtScript = document.querySelector<HTMLScriptElement>('script[src*="/_nuxt/"]');
    if (!nuxtScript?.src) return undefined;

    return nuxtScript.src.split('/_nuxt/')[0];
}

export function getSqlWasmPath(): string {
    const baseURL = getNuxtRuntimeBaseURL() ?? getNuxtScriptBaseURL() ?? '';
    return `${normalizeBaseURL(baseURL)}/sql-wasm.wasm`;
}
