import { SystemZipLoader } from '~/utils/SystemZipLoader'
import { InformationSystem } from '~/model/InformationSystem'
import { OperationResultType } from '~/utils/Operation/OperationResultType'
import type { GUID } from '~/model/GUID'
import type { InformationSystem as InformationSystemType } from '~/model/InformationSystem'

/**
 * Loads InformationSystem instances from ZIP files or unpacked folders listed in
 * public/systems/manifest.json.
 *
 * manifest.json format:
 * { "systems": ["system-a.zip", "system-a", "system-b.zip"] }
 *
 * Place ZIP files or unpacked system folders in public/systems/ next to the manifest.
 */
export function usePreloadedSystems() {
    const systems = ref<InformationSystemType[]>([])
    const loading = ref(false)
    const errors = ref<string[]>([])

    const baseURL = useRuntimeConfig().app.baseURL.replace(/\/$/, '')

    async function load() {
        loading.value = true
        errors.value = []
        systems.value = []

        let manifest: { systems: string[] }
        try {
            const res = await fetch(`${baseURL}/systems/manifest.json`)
            if (!res.ok) throw new Error(`manifest.json fetch failed: ${res.status}`)
            manifest = await res.json()
        } catch (e) {
            errors.value.push(String(e))
            loading.value = false
            return
        }

        const results = await Promise.allSettled(
            manifest.systems.map(entry => loadSystemFromEntry(entry))
        )

        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                systems.value.push(result.value)
            } else if (result.status === 'rejected') {
                errors.value.push(String(result.reason))
            }
        }

        ensureUniquePreloadedIds(systems.value)
        loading.value = false
    }

    async function loadSystemFromEntry(entry: string): Promise<InformationSystemType | null> {
        const normalizedEntry = entry.trim().replace(/^\/+|\/+$/g, '')
        if (!normalizedEntry) {
            throw new Error('Manifest contains an empty system entry')
        }

        if (normalizedEntry.toLowerCase().endsWith('.zip')) {
            const system = await loadSystemFromZip(`${baseURL}/systems/${normalizedEntry}`, normalizedEntry)
            annotateManifestEntry(system, normalizedEntry)
            return system
        }

        const system = await loadSystemFromDirectory(`${baseURL}/systems/${normalizedEntry}`, normalizedEntry)
        annotateManifestEntry(system, normalizedEntry)
        return system
    }

    async function loadSystemFromZip(url: string, filename: string): Promise<InformationSystemType | null> {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Failed to fetch ${filename}: ${res.status}`)

        const blob = await res.blob()
        const file = new File([blob], filename, { type: 'application/zip' })

        const loaderResult = await SystemZipLoader.create(file)
        if (loaderResult.result !== OperationResultType.SUCCESS || !loaderResult.data) {
            throw new Error(`Failed to parse ${filename}: ${loaderResult.message}`)
        }

        const loader = loaderResult.data
        const filesContents: Record<string, string> = {
            'config.json': loader.jsonConfigFileContent ?? '',
            ...loader.csvFilesContent,
            ...loader.sqlFilesContent,
        }

        const systemResult = await InformationSystem.loadSystem(filesContents)
        if (systemResult.result !== OperationResultType.SUCCESS || !systemResult.data) {
            throw new Error(`Failed to load system from ${filename}: ${systemResult.message}`)
        }

        return systemResult.data
    }

    async function loadSystemFromDirectory(basePath: string, directoryName: string): Promise<InformationSystemType | null> {
        const configContent = await fetchRequiredTextFile(`${baseURL}/systems/${directoryName}/config.json`, `${directoryName}/config.json`)

        const filesContents: Record<string, string> = {
            'config.json': configContent,
        }

        const optionalEntries = await Promise.all([
            fetchOptionalTextFile(`${basePath}/create_schema.sql`),
        ])

        if (optionalEntries[0] !== null) {
            filesContents['create_schema.sql'] = optionalEntries[0]
        }

        const systemResult = await InformationSystem.loadSystem(filesContents)
        if (systemResult.result !== OperationResultType.SUCCESS || !systemResult.data) {
            throw new Error(`Failed to load system from ${directoryName}: ${systemResult.message}`)
        }

        return systemResult.data
    }

    async function fetchRequiredTextFile(url: string, label: string): Promise<string> {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Failed to fetch ${label}: ${res.status}`)
        return res.text()
    }

    async function fetchOptionalTextFile(url: string): Promise<string | null> {
        const res = await fetch(url)
        if (!res.ok) {
            return null
        }

        return res.text()
    }

    function annotateManifestEntry(system: InformationSystemType | null, manifestEntry: string) {
        if (!system) {
            return
        }

        if (!system.configData || typeof system.configData !== 'object') {
            system.configData = {}
        }

        system.configData.__manifestEntry = manifestEntry
    }

    function ensureUniquePreloadedIds(loadedSystems: InformationSystemType[]) {
        const systemsByOriginalId = new Map<string, InformationSystemType[]>()

        for (const system of loadedSystems) {
            const originalId = String(system.configData?.id ?? system.id)
            const existingSystems = systemsByOriginalId.get(originalId) ?? []
            existingSystems.push(system)
            systemsByOriginalId.set(originalId, existingSystems)
        }

        for (const systemsWithSameId of systemsByOriginalId.values()) {
            if (systemsWithSameId.length <= 1) {
                continue
            }

            const sortedSystems = [...systemsWithSameId].sort(comparePreloadedSystems)

            for (const [index, system] of sortedSystems.entries()) {
                if (index === 0) {
                    continue
                }

                const originalId = String(system.configData?.id ?? system.id)
                const uniqueId = buildPreloadedVariantId(originalId, getManifestEntry(system))
                system.id = uniqueId as GUID

                if (system.configData && typeof system.configData === 'object') {
                    system.configData.id = system.id
                }
            }
        }
    }

    function comparePreloadedSystems(a: InformationSystemType, b: InformationSystemType) {
        const aEntry = getManifestEntry(a)
        const bEntry = getManifestEntry(b)
        const aIsZip = aEntry.toLowerCase().endsWith('.zip')
        const bIsZip = bEntry.toLowerCase().endsWith('.zip')

        if (aIsZip !== bIsZip) {
            return aIsZip ? 1 : -1
        }

        return aEntry.localeCompare(bEntry)
    }

    function getManifestEntry(system: InformationSystemType): string {
        const manifestEntry = system.configData?.__manifestEntry
        if (typeof manifestEntry === 'string' && manifestEntry.trim().length > 0) {
            return manifestEntry.trim()
        }

        return String(system.id)
    }

    function buildPreloadedVariantId(originalId: string, manifestEntry: string): string {
        const normalizedEntry = manifestEntry
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

        return `${originalId}::${normalizedEntry || 'preloaded'}`
    }

    return { systems, loading, errors, load }
}
