
<template>
    <div class="w-full">
        <!-- Main navbar container with flex wrap -->
        <div class="flex flex-wrap items-center justify-between gap-2 py-2">

            <!-- Navigation Menu on the left -->
            <div class="flex-shrink-0">
                <UNavigationMenu orientation="horizontal" :items="localItems" class="data-[orientation=vertical]:w-48" />
            </div>

            <!-- Right side items - responsive grid -->
            <div class="flex flex-wrap items-center gap-2 flex-1 justify-end">

                <!-- First row of items -->
                <div class="flex items-center gap-2 flex-wrap">
                    <UButton label="Helper" @click="handleHelperClick" size="sm">
                        <span class="mobile-hidden">Helper</span>
                    </UButton>

                    <UBadge color="red" variant="outline" size="lg">
                        {{ $t('score') }}: {{ scoreStore.score }}
                    </UBadge>

                    <!-- Tasks Popover -->
                    <UPopover v-model:open="tasksPopoverOpen" arrow>
                        <UButton icon="i-lucide-list-todo" :label="selectedTaskStore.selectedTask?.title || $t('tasks')"
                            color="primary" variant="subtle" size="sm">
                            <span class="mobile-hidden">{{ selectedTaskStore.selectedTask?.title || $t('tasks') }}</span>
                        </UButton>
                        <template #content>
                            <TaskList />
                        </template>
                    </UPopover>
                </div>

                <!-- Second row of items -->
                <div class="flex items-center gap-2 flex-wrap">
                    <UButton :icon="highlightStore.isHighlightMode ? 'i-lucide-lightbulb' : 'i-lucide-lightbulb-off'"
                        :label="highlightStore.isHighlightMode ? $t('disable_highlight') : $t('enable_highlight')" color="lime"
                        :variant="highlightStore.isHighlightMode ? 'solid' : 'subtle'" size="sm"
                        @click="highlightStore.toggleHighlight">
                        <span class="mobile-hidden">{{ highlightStore.isHighlightMode ? $t('disable_highlight') : $t('enable_highlight') }}</span>
                    </UButton>

                    <UButton :icon="highlightStore.isEditModeActive ? 'i-lucide-pencil' : 'i-lucide-pencil-off'"
                        :label="highlightStore.isEditModeActive ? $t('disable_edit') : $t('enable_edit')" color="yellow"
                        :variant="highlightStore.isEditModeActive ? 'solid' : 'subtle'" size="sm"
                        @click="highlightStore.toggleEdit">
                        <span class="mobile-hidden">{{ highlightStore.isEditModeActive ? $t('disable_edit') : $t('enable_edit') }}</span>
                    </UButton>
                </div>

                <!-- Third row of items -->
                <div class="flex items-center gap-2 flex-wrap">
                    <!-- Teacher Drawer -->
                    <UDrawer v-model:open="teacherDrawerOpen" direction="right">
                        <UButton color="violet" variant="outline" @click="teacherDrawerOpen = true" icon="i-lucide-school" size="sm">
                            <span class="mobile-hidden">{{ $t('teacher') }}</span>
                        </UButton>
                        <template #content>
                            <UCard class="p-4 min-w-96 max-h-screen overflow-y-auto">
                                <template #header>
                                    <div class="flex items-center justify-between">
                                        <h3 class="text-lg font-semibold">Teacher</h3>
                                        <UButton icon="i-lucide-x" color="neutral" variant="ghost"
                                            @click="teacherDrawerOpen = false" />
                                    </div>
                                </template>
                                <TeacherComponent />
                            </UCard>
                        </template>
                    </UDrawer>

                    <!-- Student Drawer -->
                    <UDrawer v-model:open="studentDrawerOpen" direction="right" >
                        <UButton color="sky" variant="outline" @click="studentDrawerOpen = true" icon="i-lucide-graduation-cap" size="sm">
                            <span class="mobile-hidden">{{ $t('student') }}</span>
                        </UButton>
                        <template #content>
                            <UCard class="p-4 min-w-96 max-h-screen overflow-y-auto">
                                <template #header>
                                    <div class="flex items-center justify-between">
                                        <h3 class="text-lg font-semibold">Student</h3>
                                        <UButton icon="i-lucide-x" color="neutral" variant="ghost"
                                            @click="studentDrawerOpen = false" />
                                    </div>
                                </template>
                                <StudentComponent />
                            </UCard>
                        </template>
                    </UDrawer>

                    <SettingsDrawer />
                </div>

                <!-- Fourth row of items -->
                <div class="flex items-center gap-2 flex-wrap">
                    <UPopover v-model:open="resetPopoverOpen" arrow>
                        <UButton icon="i-heroicons-arrow-path" :label="$t('refresh_system')" color="primary" variant="subtle" size="sm">
                            <span class="mobile-hidden">{{ $t('refresh_system') }}</span>
                        </UButton>
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
                            variant="subtle" size="sm">
                            <span class="mobile-hidden">{{ $t('exit_system') }}</span>
                        </UButton>
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
        </div>
    </div>
</template>

<style scoped>
/* Hide button labels on mobile screens */
@media (max-width: 639px) {
    .mobile-hidden {
        display: none;
    }
}
</style>

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
import SettingsDrawer from '~/components/SettingsDrawer.vue'
import TeacherComponent from '~/components/TeacherComponent.vue'
import StudentComponent from '~/components/StudentComponent.vue'

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
const teacherDrawerOpen = ref(false)
const studentDrawerOpen = ref(false)

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
        if (event.key === 'q' && event.altKey) {
            highlightStore.toggleHighlight()
        }
        if (event.key === 'w' && event.altKey) {
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
    console.log(ComponentHandler.isInErrorComponents("stats-meals"));
}

// Core refresh methods without toasts
async function refreshComponentsCore() {
    console.log("Refreshing components...");
    componentCodeStore.resetAllComponents();
}

async function refreshTasksCore() {
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
}

async function refreshDatabaseCore() {
    console.log("Refreshing database...");
    const systems: InformationSystem[] = FileHandler.getInformationSystems();

    for (const system of systems) {
        if (system.id === selectedSystemStore.selectedId) {
            if (selectedSystemStore.selectedSystem) {
                selectedSystemStore.selectedSystem.tables = system.tables;
            }
            break;
        }
    }

    if (selectedSystemStore.selectedSystem) {
        await selectedSystemStore.selectedSystem.db.init(selectedSystemStore.selectedSystem.configData)
    }
}

// Wrapper methods with toasts
async function refreshComponents() {
    try {
        await refreshComponentsCore();
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
        await refreshTasksCore();
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
        await refreshDatabaseCore();
        toast.add({
            title: t('refresh_database_success') || 'Database refreshed successfully',
            color: 'primary',
            icon: 'i-lucide-check-circle'
        })
    } catch {
        toast.add({
            title: t('refresh_database_error') || 'Database refresh error',
            color: 'red',
            icon: 'i-lucide-alert-triangle'
        })
    }
}

async function refreshAll() {
    await refreshComponents()
    await refreshDatabase()
    await refreshTasks()
}

async function leaveSystem() {
    // Navigate back to systems list
    await navigateTo('/system');
    await refreshComponentsCore();
    await refreshDatabaseCore();
    await refreshTasksCore();
    exitPopoverOpen.value = false;
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
