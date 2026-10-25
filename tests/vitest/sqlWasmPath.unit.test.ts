import { afterEach, describe, expect, it } from 'vitest'
import { getSqlWasmPath } from '../../app/utils/sqlWasmPath'

describe('getSqlWasmPath', () => {
    afterEach(() => {
        delete (globalThis as any).__NUXT__;
    })

    it('uses Nuxt runtime app baseURL for GitHub Pages subpaths', () => {
        (globalThis as any).__NUXT__ = {
            config: {
                app: {
                    baseURL: '/information-system-learning-app-teacher/'
                }
            }
        };

        expect(getSqlWasmPath()).toBe('/information-system-learning-app-teacher/sql-wasm.wasm');
    })

    it('falls back to the site root when no app baseURL is available', () => {
        expect(getSqlWasmPath()).toBe('/sql-wasm.wasm');
    })
})
