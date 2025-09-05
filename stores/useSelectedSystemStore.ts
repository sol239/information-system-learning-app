import { defineStore } from 'pinia'
import { ref } from 'vue'
import { InformationSystem } from '~/model/InformationSystem'
import { ComponentHandler } from '~/composables/ComponentHandler'
import { useSelectedTaskStore } from './useSelectedTaskStore'

export const useSelectedSystemStore = defineStore('selectedSystem', () => {
  // State
  const selectedId = ref<number | null>(null)
  const selectedSystem = ref<InformationSystem | null>(null)

  // Actions
  function select(id: number) {
    selectedId.value = id
    // Automatically load error components when system is selected
    loadErrorComponents()
  }

  function loadErrorComponents() {
    if (selectedId.value !== null) {
      const selectedTaskStore = useSelectedTaskStore()
      ComponentHandler.getComponentMap(selectedTaskStore.currentRound)
    }
  }

  function clear() {
    selectedId.value = null
  }

  function setSelectedSystem(system: InformationSystem) {
    selectedSystem.value = system
    // Load error components when system is set
    loadErrorComponents()
  }

  async function initializeDb() {
    if (selectedSystem.value) {
      console.log("Reinitializing selected system database.")
      const dbHandler = await InformationSystem.databaseInitStatic(selectedSystem.value.configData);
      selectedSystem.value.db = dbHandler;
      console.log("Selected system database initialized:", selectedSystem.value.db.query("SELECT * FROM účastníci").results);
      // Load error components after database initialization
      loadErrorComponents()
    }
  }

  return {
    selectedId,
    select,
    clear,
    setSelectedSystem,
    selectedSystem,
    initializeDb,
    loadErrorComponents
  }
}, {
  persist: {
    afterHydrate: async (context) => {
      await context.store.initializeDb()
    }
  }
})
