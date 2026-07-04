import { onMounted, ref, watch } from 'vue'
import { SystemHelper } from '~/core/systems/SystemHelper'
import { SystemLoaderPublic } from '~/core/systems/SystemLoaderPublic'
import { InformationSystem } from '~/model/InformationSystem'
import type { SystemFile } from '~/model/types/SystemFile'
import { OperationResultType } from '~/utils/Operation/OperationResultType'
import type { Operation } from '~/utils/Operation/Operation'
import { SystemZipLoader } from '~/utils/SystemZipLoader'

export function useSystemUploadModal() {
    const systemsStore = useSystemsStore()

    const selectedFile = ref<File | null>(null)
    const loader = ref<SystemZipLoader | null>(null)
    const loading = ref(false)
    const loadingPreloaded = ref(false)
    const systemPreview = ref<{ name: string; description: string } | null>(null)
    const systemAlreadyExists = ref(false)
    const systemsToPreload = ref<InformationSystem[]>([])
    const selectedPreloadedSystem = ref<InformationSystem | null>(null)

    onMounted(async () => {
        await loadPreloadedSystemsList()
    })

    watch(selectedFile, async (file) => {
        if (file) {
            selectedPreloadedSystem.value = null
        }

        if (!file) {
            loader.value = null
            systemPreview.value = null
            if (selectedPreloadedSystem.value) {
                return
            }
            systemAlreadyExists.value = false
            return
        }

        const result: Operation<SystemZipLoader | null> = await SystemZipLoader.create(file)
        if (result.result === OperationResultType.SUCCESS && result.data) {
            loader.value = result.data
            try {
                const config = JSON.parse(result.data.jsonConfigFileContent ?? '{}')
                systemPreview.value = { name: config.name ?? '', description: config.description ?? '' }
                systemAlreadyExists.value = systemsStore.systems.some(s => String(s.id) === String(config.id))
            } catch {
                systemPreview.value = null
                systemAlreadyExists.value = false
            }
        } else {
            console.error(result.message)
            loader.value = null
            systemPreview.value = null
            systemAlreadyExists.value = false
        }
    })

    function selectPreloadedSystem(sys: InformationSystem) {
        selectedPreloadedSystem.value = sys
        selectedFile.value = null
        loader.value = null
        systemPreview.value = null
        systemAlreadyExists.value = systemsStore.systems.some(s => String(s.id) === String(sys.id))
    }

    async function loadPreloadedSystemsList() {
        loadingPreloaded.value = true
        systemsToPreload.value = []

        try {
            const systems: InformationSystem[] = []
            const systemLoader = new SystemLoaderPublic()

            for (const systemId of SystemHelper.getSystemsToPreloadIds()) {
                const loadResult = await systemLoader.loadSystem(systemId)

                if (loadResult.result === OperationResultType.SUCCESS && loadResult.data) {
                    systems.push(loadResult.data)
                } else {
                    console.error(loadResult.message)
                }
            }

            systemsToPreload.value = systems
        } catch (error) {
            console.error('Failed to load preloaded systems:', error)
        } finally {
            loadingPreloaded.value = false
        }
    }

    function resolveCollision(sys: InformationSystem) {
        let newId = sys.id
        let newName = sys.name
        let counter = 1

        while (systemsStore.systems.some(s => s.id === newId || s.name === newName)) {
            newId = `${sys.id}_${counter}`
            newName = `${sys.name} (${counter})`
            counter++
        }

        return { newId, newName }
    }

    async function onUpload(close: () => void) {
        loading.value = true
        try {
            if (selectedPreloadedSystem.value) {
                const sysToClone = selectedPreloadedSystem.value
                const systemFiles: SystemFile[] = [
                    { name: 'config.json', content: JSON.stringify(sysToClone.configData ?? {}) },
                ]

                if (sysToClone.createSchemaSql) {
                    systemFiles.push({ name: 'create_schema.sql', content: sysToClone.createSchemaSql })
                }

                const loadResult = await InformationSystem.loadSystem(systemFiles)
                if (loadResult.result === OperationResultType.SUCCESS && loadResult.data) {
                    const newSys = loadResult.data
                    const resolved = resolveCollision(newSys)
                    newSys.id = resolved.newId
                    newSys.name = resolved.newName

                    await systemsStore.addSystem(newSys)
                } else {
                    console.error(loadResult.message)
                }

                selectedPreloadedSystem.value = null
                close()
                return
            }

            if (!selectedFile.value || !loader.value) return

            const systemFiles: SystemFile[] = [
                { name: 'config.json', content: loader.value.jsonConfigFileContent ?? '' },
                ...entriesToSystemFiles(Object.entries(loader.value.csvFilesContent)),
                ...entriesToSystemFiles(Object.entries(loader.value.sqlFilesContent)),
            ]
            const loadResult = await InformationSystem.loadSystem(systemFiles)
            if (loadResult.result === OperationResultType.SUCCESS && loadResult.data) {
                await systemsStore.addSystem(loadResult.data)
            } else {
                console.error(loadResult.message)
            }
            selectedFile.value = null
            close()
        } finally {
            loading.value = false
        }
    }

    function entriesToSystemFiles(files: Array<[string, string]>): SystemFile[] {
        return files.map(([path, content]) => ({
            name: path.split('/').pop() ?? path,
            path,
            content,
        }))
    }

    return {
        selectedFile,
        loading,
        loadingPreloaded,
        systemPreview,
        systemAlreadyExists,
        systemsToPreload,
        selectedPreloadedSystem,
        selectPreloadedSystem,
        onUpload,
    }
}
