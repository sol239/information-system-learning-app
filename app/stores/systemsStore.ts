import type { InformationSystem } from "~/model/InformationSystem"
import { IndexedDbStorage } from "~/utils/IndexedDbStorage"
import { Operation } from "~/utils/Operation/Operation"
import { OperationResultType } from "~/utils/Operation/OperationResultType"

import { emptyComponent } from "~/model/SystemComponents/EmptyComponent"

export const useSystemsStore = defineStore('systems', () => {

    const selectedSystemId = ref<string | null>(null)
    const globalSettingsStore = useGlobalSettingsStore()

    const selectedSystem = computed(() => {
        return systems.value.find(system => String(system.id) === String(selectedSystemId.value))
    })

    const getComponentById = (componentId: string) => {
        const normalizedComponentId = String(componentId)
        const solvedComponentIds = new Set(
            (globalSettingsStore.solvedComponentIds ?? []).map(id => String(id))
        )

        // Prefer task-specific error variants only while the component is still unsolved.
        for (const task of selectedSystem.value?.tasks ?? []) {
            for (const component of task.errorComponents ?? []) {
                if (
                    String(component.id) === normalizedComponentId &&
                    !solvedComponentIds.has(normalizedComponentId)
                ) {
                    return component
                }
            }
        }

        // otherwise return the component from the system components
        return selectedSystem.value?.actualComponents.find(component => String(component.id) === normalizedComponentId) ?? emptyComponent
     
    }

    const systems = ref<InformationSystem[]>([])

    const getSystemById = (id: string): InformationSystem | undefined => {
        return systems.value.find(system => String(system.id) === String(id))
    }

    async function deleteSystemById(id: string): Promise<Operation<null>> {
        const result = await IndexedDbStorage.DeleteInformationSystem(id)
        if (result.result === OperationResultType.SUCCESS) {
            systems.value = systems.value.filter(system => String(system.id) !== String(id))
        }
        return result
    }

    async function updateSystem(system: InformationSystem): Promise<Operation<null>> {
        const result = await IndexedDbStorage.UpdateInformationSystem(system)
        if (result.result === OperationResultType.SUCCESS) {
            const index = systems.value.findIndex(s => s.id === system.id)
            if (index !== -1) {
                systems.value[index] = system
            }
        }
        return result
    }

    async function addSystem(system: InformationSystem): Promise<Operation<null>> {
        const result = await IndexedDbStorage.SaveInformationSystem(system)
        if (result.result === OperationResultType.SUCCESS) {
            systems.value.push(system)
        }
        return result
    }

    return {
        systems,
        selectedSystem,
        selectedSystemId,
        addSystem,
        deleteSystemById,
        getSystemById,
        updateSystem,
        getComponentById,
    }

},
    {
        persist: {
            pick: ['selectedSystemId'],
        },
    }
)
