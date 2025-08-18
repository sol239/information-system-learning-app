import { defineStore } from 'pinia'
import { ref } from 'vue'
import { InformationSystem } from '~/model/InformationSystem'

export const useSelectedSystemStore = defineStore('selectedSystem', () => {
  // State
  const selectedId = ref<number | null>(null)
  const selectedSystem = ref<InformationSystem | null>(null)

  // Actions
  function select(id: number) {
    selectedId.value = id
  }

  function clear() {
    selectedId.value = null
  }

  function setSelectedSystem(system: InformationSystem) {
    selectedSystem.value = system
  }

  async function initializeDb() {
    if (selectedSystem.value) {
      console.log("Reinitializing selected system database.")
      const dbHandler = await InformationSystem.databaseInitStatic(selectedSystem.value.configData);
      selectedSystem.value.db = dbHandler;
      console.log("Selected system database initialized:", selectedSystem.value.db.query("SELECT * FROM účastníci").results);
    }
  }

  return {
    selectedId,
    select,
    clear,
    setSelectedSystem,
    selectedSystem,
    initializeDb
  }
}, {
  persist: {
    afterHydrate: async (context) => {
      await context.store.initializeDb()
    }
  }
})
