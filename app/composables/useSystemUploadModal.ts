import { onMounted, ref, watch } from 'vue'
import { SystemHelper } from '~/core/systems/SystemHelper'
import { DefaultSystemLoader } from '~/core/systems/DefaultSystemLoader'
import { TaskSet } from '~/model/Task/TaskSet'
import { resetTaskProgress } from '~/utils/taskProgress'

export function useSystemUploadModal() {
    const systemsStore = useSystemsStore()

    const selectedFile = ref<File | null>(null)
    const uploadedTaskSet = ref<TaskSet | null>(null)
    const loading = ref(false)
    const loadingPreloaded = ref(false)
    const systemPreview = ref<{ name: string; description: string } | null>(null)
    const systemAlreadyExists = ref(false)
    const systemsToPreload = ref<TaskSet[]>([])
    const selectedPreloadedSystem = ref<TaskSet | null>(null)

    onMounted(async () => {
        await loadPreloadedSystemsList()
    })

    watch(selectedFile, async (file) => {
        if (file) {
            selectedPreloadedSystem.value = null
        }

        if (!file) {
            uploadedTaskSet.value = null
            systemPreview.value = null
            if (selectedPreloadedSystem.value) {
                return
            }
            systemAlreadyExists.value = false
            return
        }

        try {
            const taskSet = TaskSet.fromJSON(JSON.parse(await file.text()), 'uploaded_tasks')
            uploadedTaskSet.value = taskSet
            systemPreview.value = { name: taskSet.name, description: taskSet.description }
            systemAlreadyExists.value = false
        } catch (error) {
            console.error('Failed to load tasks.json:', error)
            uploadedTaskSet.value = null
            systemPreview.value = null
            systemAlreadyExists.value = false
        }
    })

    function selectPreloadedSystem(sys: TaskSet) {
        selectedPreloadedSystem.value = sys
        selectedFile.value = null
        uploadedTaskSet.value = null
        systemPreview.value = null
        systemAlreadyExists.value = false
    }

    async function loadPreloadedSystemsList() {
        loadingPreloaded.value = true
        systemsToPreload.value = []

        try {
            systemsToPreload.value = await new DefaultSystemLoader().loadTaskSets(SystemHelper.getSystemsToPreloadIds())
        } catch (error) {
            console.error('Failed to load preloaded systems:', error)
        } finally {
            loadingPreloaded.value = false
        }
    }

    async function onUpload(close: () => void) {
        loading.value = true
        try {
            if (selectedPreloadedSystem.value) {
                await replaceSelectedSystemTaskSet(selectedPreloadedSystem.value)
                selectedPreloadedSystem.value = null
                close()
                return
            }

            if (!selectedFile.value || !uploadedTaskSet.value) return

            await replaceSelectedSystemTaskSet(uploadedTaskSet.value)
            selectedFile.value = null
            uploadedTaskSet.value = null
            close()
        } finally {
            loading.value = false
        }
    }

    async function replaceSelectedSystemTaskSet(taskSet: TaskSet) {
        const system = systemsStore.selectedSystem ?? systemsStore.getPrimarySystem()
        if (!system) {
            console.error('No selected system found for task set upload.')
            return
        }

        const resetTaskSet = new TaskSet({
            id: taskSet.id,
            name: taskSet.name,
            description: taskSet.description,
            levelCount: taskSet.levelCount,
            tasks: taskSet.tasks.map(task => resetTaskProgress(task)),
        })
        system.replaceTaskSet(resetTaskSet)
        await systemsStore.updateSystem(system)
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
