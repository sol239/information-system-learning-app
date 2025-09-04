<script setup lang="ts">
/* 1. Imports */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'
import { useHighlightStore } from '~/stores/useHighlightStore'
import { ComponentHandler, SystemReset, TaskAnswerEval, TaskQueue, useScoreStore } from '#imports'
import { useErrorComponentStore } from '#imports'
import { Task } from '~/model/Task'
import { useSelectedTaskStore } from '#imports'
import { useSelectedSystemStore } from '#imports'
import { useSettingsStore } from '#imports'
import { useInformationSystemStore } from '#imports'
import { useComponentCodeStore } from '#imports'
import type { InformationSystem } from '~/model/InformationSystem'

/* 2. Stores */
const highlightStore = useHighlightStore()
const scoreStore = useScoreStore()
const errorComponentStore = useErrorComponentStore()
const selectedTaskStore = useSelectedTaskStore()
const selectedSystemStore = useSelectedSystemStore()
const settingsStore = useSettingsStore()
const informationSystemStore = useInformationSystemStore()
const componentCodeStore = useComponentCodeStore()

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */
const toast = useToast()

/* 5. Props */
// none

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
const tasksPopoverOpen = ref(false)
const resetPopoverOpen = ref(false)
const exitPopoverOpen = ref(false)

const localItems = ref<NavigationMenuItem[]>([
    {
        label: t('dashboard'),
        icon: 'i-heroicons-chart-bar-20-solid',
        to: `/system/${selectedSystemStore.selectedId}/dashboard`,
        data_target: 'system-dashboard',
    },
    {
        label: t('sessions'),
        icon: 'i-heroicons-calendar-date-range',
        to: `/system/${selectedSystemStore.selectedId}/sessions`,
        data_target: 'system-sessions',
    },
    {
        label: t('participants'),
        to: `/system/${selectedSystemStore.selectedId}/participants`,
        data_target: 'system-participants',
    },
    {
        label: t('supervisors'),
        to: `/system/${selectedSystemStore.selectedId}/supervisors`,
        data_target: 'system-supervisors',
    },
    {
        label: t('meals'),
        to: `/system/${selectedSystemStore.selectedId}/meals`,
        data_target: 'system-meals',
    },
    {
        label: t('database'),
        icon: 'i-heroicons-table-cells',
        to: `/system/${selectedSystemStore.selectedId}/database`,
        data_target: 'system-table',
    }
])

/* 9. Computed */
// none

/* 10. Watchers */
// Keyboard shortcut for highlight toggle
onMounted(() => {
    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'h') {
            highlightStore.toggleHighlight()
        }
        if (event.key === 'e') {
            highlightStore.toggleEdit()
        }
        if (event.key === 't' && event.altKey) {
            event.preventDefault()
            tasksPopoverOpen.value = !tasksPopoverOpen.value
        }
    }

    document.addEventListener('keydown', handleKeydown)

    onUnmounted(() => {
        document.removeEventListener('keydown', handleKeydown)
    })
})

/* 11. Methods */
async function handleHelperClick() {
    console.log("Default:", componentCodeStore.defaultComponentMap)
    console.log("Current:", componentCodeStore.actualComponentMap)
}

async function refreshComponents() {
    console.log("Refreshing components...");
    try {
        componentCodeStore.resetAllComponentCodes();
        toast.add({
            title: t('component_refresh_success') || 'Component refresh successful',
            color: 'primary',
            icon: 'i-lucide-check-circle'
        })
    } catch {
        toast.add({
            title: t('component_refresh_error') || 'Component refresh error',
            color: 'red',
            icon: 'i-lucide-alert-triangle'
        })
    }
}

async function refreshTasks() {
    try {
        selectedTaskStore.resetTasks()
        scoreStore.resetScore()
        errorComponentStore.clearErrorComponents()
        ComponentHandler.getComponentMap(selectedTaskStore.currentRound)

        for (let j = 0; j < informationSystemStore.systems.length; j++) {
            const system = informationSystemStore.systems[j];
            for (let i = 0; i < system.tasks.length; i++) {
                system.tasks[i].completed = false;
                system.tasks[i].componentsRepaired = false;
            }
        }

        toast.add({
            title: t('refresh_tasks_success') || 'Tasks refreshed successfully',
            color: 'primary',
            icon: 'i-lucide-check-circle'
        })
    } catch {
        toast.add({
            title: t('refresh_tasks_error') || 'Tasks refresh error',
            color: 'red',
            icon: 'i-lucide-alert-triangle'
        })
    }
}

async function refreshDatabase() {
    try {
        // This could involve reloading the current database state, resetting states, etc.
        console.log("Refreshing database...");
        const systems: InformationSystem[] = FileHandler.getInformationSystems();
        console.log(selectedSystemStore.selectedId);
        console.log(systems);

        // from systems find system with current id as selectedSystemId and use its table

        for (const system of systems) {
            console.log("SYSTEM ID:", system.id);
            console.log("SELECTED ID:", selectedSystemStore.selectedId);
            if (system.id === selectedSystemStore.selectedId) {
                if (selectedSystemStore.selectedSystem) {
                    selectedSystemStore.selectedSystem.tables = system.tables;
                }
                console.log("UPDATED");
                break;
            }
        }

        if (selectedSystemStore.selectedSystem) {
            await selectedSystemStore.selectedSystem.db.init(selectedSystemStore.selectedSystem.configData)
            toast.add({
                title: t('refresh_database_success') || 'Database refreshed successfully',
                color: 'primary',
                icon: 'i-lucide-check-circle'
            })
        }

    } catch {
        toast.add({
            title: t('refresh_database_error') || 'Database refresh error',
            color: 'red',
            icon: 'i-lucide-alert-triangle'
        })
    }
}

async function leaveSystem() {
    // Navigate back to systems list
    await navigateTo('/system')
    exitPopoverOpen.value = false
}

async function leaveAndSave() {
    // TODO: Implement save functionality
    console.log("Saving results...");
    toast.add({
        title: t('save_success') || 'Results saved successfully',
        color: 'primary',
        icon: 'i-lucide-check-circle'
    })
    await navigateTo('/system')
    exitPopoverOpen.value = false
}

async function stayInSystem() {
    // Just close the popover
    exitPopoverOpen.value = false
}

/* 12. Lifecycle */
// none

/* 13. defineExpose */
// none
</script>

<template>
    <div class="flex items-center w-full justify-between">
        <!-- Navigation Menu on the left -->
        <UNavigationMenu orientation="horizontal" :items="localItems" class="data-[orientation=vertical]:w-48" />

        <!-- Right side items grouped together -->
        <div class="flex items-center">
            <UButton style="margin-right: 10px ;" label="Helper" @click="handleHelperClick"></UButton>

            <UBadge color="red" variant="outline" size="xl" style="margin-right: 10px;">
                {{ $t('score') }}: {{ scoreStore.score }}
            </UBadge>

            <!-- Tasks Popover -->
            <UPopover v-model:open="tasksPopoverOpen" arrow>
                <UButton icon="i-lucide-list-todo" :label="selectedTaskStore.selectedTask?.title || $t('tasks')"
                    color="primary" variant="subtle" />

                <template #content>
                    <TaskList />
                </template>
            </UPopover>
            <UButton :icon="highlightStore.isHighlightMode ? 'i-lucide-lightbulb' : 'i-lucide-lightbulb-off'"
                :label="highlightStore.isHighlightMode ? $t('disable_highlight') : $t('enable_highlight')" color="lime"
                :variant="highlightStore.isHighlightMode ? 'solid' : 'subtle'" style="margin-left: 10px"
                @click="highlightStore.toggleHighlight" />
            <UButton :icon="highlightStore.isEditModeActive ? 'i-lucide-pencil' : 'i-lucide-pencil-off'"
                :label="highlightStore.isEditModeActive ? $t('disable_edit') : $t('enable_edit')" color="yellow"
                :variant="highlightStore.isEditModeActive ? 'solid' : 'subtle'" style="margin-left: 10px"
                @click="highlightStore.toggleEdit" />
            <UPopover v-model:open="resetPopoverOpen" arrow>
                <UButton icon="i-heroicons-arrow-path" :label="$t('refresh_system')" color="primary" variant="subtle"
                    style="margin-left: 10px" />

                <template #content>
                    <UCard>
                        <div class="flex flex-col gap-2">
                            <UButton :label="$t('refresh_components')" color="primary" variant="outline"
                                icon="i-heroicons-arrow-path" @click="refreshComponents" />
                            <UButton :label="$t('refresh_database')" color="lime" variant="outline"
                                icon="i-heroicons-arrow-path" @click="refreshDatabase" />
                            <UButton :label="$t('refresh_tasks')" color="sky" variant="outline"
                                icon="i-heroicons-arrow-path" @click="refreshTasks" />

                        </div>
                    </UCard>
                </template>
            </UPopover>

            <!-- Exit System Popover -->
            <UPopover v-model:open="exitPopoverOpen" arrow>
                <UButton icon="i-heroicons-arrow-right-on-rectangle" :label="$t('exit_system')" color="red"
                    variant="subtle" style="margin-left: 10px" />

                <template #content>
                    <UCard>
                        <div class="flex flex-col gap-2">
                            <UButton :label="$t('leave_system')" color="red" variant="outline"
                                icon="i-heroicons-arrow-right-on-rectangle" @click="leaveSystem" />
                            <!-- TODO: Implement saving -->
                            <UButton disabled :label="$t('leave_and_save')" color="yellow" variant="outline"
                                icon="i-heroicons-document-check" @click="leaveAndSave" />
                            <UButton :label="$t('stay_in_system')" color="neutral" variant="outline"
                                icon="i-heroicons-x-mark" @click="stayInSystem" />
                        </div>
                    </UCard>
                </template>
            </UPopover>
        </div>
    </div>
</template>