/* 1. Imports */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { NavigationMenuItem } from '@nuxt/ui'
import { useHighlightStore } from '~/stores/useHighlightStore'
import { ComponentHandler, TaskQueue, useScoreStore } from '#imports'
import { useErrorComponentStore } from '#imports'
import { Task } from '~/model/Task'
import { useSelectedTaskStore } from '#imports'
import { useSelectedSystemStore } from '#imports'
import { useSettingsStore } from '#imports'
import { useInformationSystemStore } from '#imports'
        import { useComponentCodeStore } from '#imports';
        import type { InformationSystem } from '~/model/InformationSystem'

/* 5. Props */
// none

/* 6. Emits */
// none

/* 7. Template refs */
// none

export class SystemReset {
    public static async refreshComponents() {

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
        const route = useRoute()
        const { t } = useI18n()

        /* 4. Constants (non-reactive) */
        const toast = useToast()

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

    public static async refreshTasks() {

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
        const route = useRoute()
        const { t } = useI18n()

        /* 4. Constants (non-reactive) */
        const toast = useToast()
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

    public static async refreshDatabase() {
        const componentCodeStore = useComponentCodeStore()
        /* 2. Stores */
        const highlightStore = useHighlightStore()
        const scoreStore = useScoreStore()
        const errorComponentStore = useErrorComponentStore()
        const selectedTaskStore = useSelectedTaskStore()
        const selectedSystemStore = useSelectedSystemStore()
        const settingsStore = useSettingsStore()
        const informationSystemStore = useInformationSystemStore()





        /* 3. Context hooks */
        const route = useRoute()
        const { t } = useI18n()

        /* 4. Constants (non-reactive) */
        const toast = useToast()
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
}