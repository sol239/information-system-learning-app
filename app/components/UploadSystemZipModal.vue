<template>
    <UModal :title="t('upload_system')">
        <UButton class="add-new-system-button" icon="i-lucide-plus-circle" size="sm" color="teacher">
            {{ t('add_new_system') }}
        </UButton>

        <template #body>
            <div class="space-y-4">
                <!-- ZIP Upload Section -->
                <div>
                    <p class="mb-2 font-medium">{{ t('upload_from_zip') ?? 'Upload from ZIP' }}</p>
                    <UFileUpload v-model="selectedFile" accept=".zip" :label="t('upload_system_zip')" icon="i-lucide-upload"
                        class="w-full" />
                    <div v-if="systemPreview" class="mt-4 space-y-1">
                        <p class="font-semibold text-lg">{{ systemPreview.name }}</p>
                        <p class="text-sm text-muted">{{ systemPreview.description }}</p>
                    </div>
                </div>

                <UDivider :label="t('or') ?? 'OR'" />

                <!-- Preloaded Suggestions Section -->
                <div>
                    <p class="mb-2 font-medium">{{ t('choose_from_suggestions') ?? 'Choose from suggestions' }}</p>
                    <div v-if="loadingPreloaded" class="flex justify-center p-4">
                        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-gray-500" />
                    </div>
                    <div v-else-if="preloadedSystems.length === 0" class="text-sm text-gray-500">
                        {{ t('no_suggestions_available') ?? 'No suggestions available.' }}
                    </div>
                    <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-2">
                        <div 
                            v-for="sys in preloadedSystems" 
                            :key="sys.id"
                            role="button"
                            tabindex="0"
                            class="p-3 border rounded-lg cursor-pointer transition-colors"
                            :class="selectedPreloadedSystem?.id === sys.id ? 'border-teacher-500 bg-teacher-50/50' : 'border-gray-200 hover:border-gray-300'"
                            @click="selectPreloadedSystem(sys)"
                        >
                            <p class="font-semibold text-sm">{{ sys.name }}</p>
                            <p class="text-xs text-gray-500 line-clamp-1">{{ sys.description }}</p>
                        </div>
                    </div>
                </div>

                <UAlert v-if="systemAlreadyExists" color="red" icon="i-lucide-alert-triangle"
                    :title="t('system_already_exists')" class="mt-3" />
            </div>
        </template>

        <template #footer="{ close }">
            <UButton color="teacher" icon="i-lucide-chevron-right" :disabled="(!selectedFile && !selectedPreloadedSystem) || systemAlreadyExists"
                :loading="loading" @click="onUpload(close)" size="sm">
                {{ t('add_system') ?? 'Add System' }}
            </UButton>
            <UButton color="neutral" variant="outline" @click="close" size="sm">{{ t('cancel') }}</UButton>
        </template>
    </UModal>
</template>

<script setup lang="ts">
/* 1. Imports */
import { ref, watch, onMounted } from 'vue'
import { SystemZipLoader } from '~/utils/SystemZipLoader'
import { InformationSystem } from '~/model/InformationSystem'
import { useSystemsStore } from '~/stores/systemsStore'
import { getPageLoadSource } from '~/utils/pageLoadSource'
import { usePreloadedSystems } from '~/composables/usePreloadedSystems'

/* 3. Context hooks */
const { t } = useI18n()
const systemsStore = useSystemsStore()
const {
  systems: preloadedSystemsResult,
  loading: loadingPreloaded,
  errors: preloadedErrors,
  load: loadPreloadedSystemsList,
} = usePreloadedSystems()

/* 8. Local state */
const selectedFile = ref<File | null>(null)
const loader = ref<SystemZipLoader | null>(null)
const loading = ref(false)
const systemPreview = ref<{ name: string; description: string } | null>(null)
const systemAlreadyExists = ref(false)
const preloadedSystems = ref<InformationSystem[]>([])
const selectedPreloadedSystem = ref<InformationSystem | null>(null)

/* Lifecycle */
onMounted(async () => {
    await loadPreloadedSystemsList()
    preloadedSystems.value = preloadedSystemsResult.value
})

/* 10. Watchers */
watch(selectedFile, async (file) => {
    if (file) {
        selectedPreloadedSystem.value = null
    }
    
    if (!file) {
        loader.value = null
        systemPreview.value = null
        systemAlreadyExists.value = false
        return
    }
    const result: Operation<SystemZipLoader | null> = await SystemZipLoader.create(file);
    //console.log("ZIP OP STATUS: " + result.toString())
    if (result.result === OperationResultType.SUCCESS && result.data) {
        //console.log(":)")
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

/* 9. Methods */
function selectPreloadedSystem(sys: InformationSystem) {
    selectedPreloadedSystem.value = sys
    selectedFile.value = null
    loader.value = null
    systemPreview.value = null
    systemAlreadyExists.value = false
}

function resolveCollision(sys: InformationSystem) {
    let newId = sys.id
    let newName = sys.name
    let counter = 1
    
    while(systemsStore.systems.some(s => s.id === newId || s.name === newName)) {
        newId = `${sys.id}_${counter}`
        newName = `${sys.name} (${counter})`
        counter++
    }
    
    return { newId, newName }
}

/**
 * Handles the upload of the selected ZIP file.
 * @param close The function to close the modal after upload is complete.
 */
async function onUpload(close: () => void) {
    loading.value = true
    try {
        if (selectedPreloadedSystem.value) {
            const sysToClone = selectedPreloadedSystem.value

            // Reconstruct filesContents from the already-loaded system,
            // mirroring exactly what the manifest/ZIP loader does.
            const filesContents: Record<string, string> = {
                'config.json': JSON.stringify(sysToClone.configData ?? {}),
            }

            if (sysToClone.createSchemaSql) {
                filesContents['create_schema.sql'] = sysToClone.createSchemaSql
            }

            if (sysToClone.defaultComponents.length > 0) {
                filesContents['system_components.json'] = JSON.stringify(sysToClone.defaultComponents)
            }

            // Re-attach any page vue sources that were loaded from the system
            if (getPageLoadSource() === 'public') {
                for (const page of sysToClone.pages ?? []) {
                    if (page.vueFile && (page as any).vueSource) {
                        filesContents[page.vueFile] = (page as any).vueSource
                    }
                }
            }

            const loadResult = await InformationSystem.loadSystem(filesContents)
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
        
        const filesContents: Record<string, string> = {
            'config.json': loader.value.jsonConfigFileContent ?? '',
            'system_components.json': loader.value.jsonComponentsContent ?? '',
            ...loader.value.csvFilesContent,
            ...loader.value.sqlFilesContent,
        }
        if (getPageLoadSource() === 'public') {
            Object.assign(filesContents, loader.value.vueFilesContent)
        }
        const loadResult = await InformationSystem.loadSystem(filesContents)
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
</script>
