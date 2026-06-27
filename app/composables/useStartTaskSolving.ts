import { ref } from 'vue'
import { OperationResultType } from '~/utils/Operation/OperationResultType'

export function useStartTaskSolving() {
  const { t } = useI18n()
  const systemsStore = useSystemsStore()
  const globalSettings = useGlobalSettingsStore()
  const toast = useToast()
  const preloadedSystems = usePreloadedSystems()
  const { pushFirstAvailablePage } = useAvailableSystemPages()
  const isStartingTasks = ref(false)

  async function startTaskSolving() {
    const currentSystemId = systemsStore.selectedSystemId
    if (!currentSystemId || isStartingTasks.value) {
      return false
    }

    isStartingTasks.value = true

    try {
      await preloadedSystems.load()
      const freshSystem = preloadedSystems.systems.value.find(
        system => String(system.id) === String(currentSystemId),
      )

      if (!freshSystem) {
        toast.add({
          title: t('refresh_system_error'),
          color: 'red',
          icon: 'i-lucide-alert-triangle',
        })
        return false
      }

      globalSettings.selectedTaskId = null
      globalSettings.solvedComponentIds = []

      const result = await systemsStore.updateSystem(freshSystem)
      if (result.result !== OperationResultType.SUCCESS) {
        toast.add({
          title: t('refresh_system_error'),
          color: 'red',
          icon: 'i-lucide-alert-triangle',
        })
        return false
      }

      systemsStore.selectedSystemId = String(freshSystem.id)
      globalSettings.markTasksStarted(freshSystem.id)
      await pushFirstAvailablePage(null)

      toast.add({
        title: t('student_welcome_sidebar_started'),
        color: 'primary',
        icon: 'i-lucide-check-circle',
      })

      return true
    } catch (error) {
      console.error('Task start failed:', error)
      toast.add({
        title: t('refresh_system_error'),
        color: 'red',
        icon: 'i-lucide-alert-triangle',
      })
      return false
    } finally {
      isStartingTasks.value = false
    }
  }

  return {
    isStartingTasks,
    startTaskSolving,
  }
}
