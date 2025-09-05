<script setup lang="ts">
/* 1. Imports */
import { onMounted, ref } from 'vue'
import { navigateTo } from '#app'
import { FileHandler } from '~/composables/FileHandler'
import { InformationSystem } from '~/model/InformationSystem'
import { useInformationSystemStore } from '~/stores/useInformationSystemStore'
import { useSelectedSystemStore } from '~/stores/useSelectedSystemStore'

/* 2. Stores */
const informationSystemStore = useInformationSystemStore()
const selectedSystemStore = useSelectedSystemStore()

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */
let systems: InformationSystem[] = FileHandler.getInformationSystems()

/* 5. Props */
// none

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
const isReloading = ref(false)

/* 9. Computed */
// none

/* 10. Watchers */
// none

/* 11. Methods */
function navigateToSystem(systemId: number) {
  selectedSystemStore.select(systemId)
  const selectedSystem = systems.find(sys => sys.id === systemId)
  if (selectedSystem) {
    selectedSystemStore.setSelectedSystem(selectedSystem)
  } else {
    console.warn(`System with ID ${systemId} not found.`)
  }
  console.log("Navigating to system with ID:", systemId)
  navigateTo(`/system/${systemId}/dashboard`)
}

function initializeSystems() {
  console.log('Loaded systems:', systems)

  try {
    informationSystemStore.systems = systems
  } catch (error) {
    console.error('Error setting systems in store:', error)
  }
}

function reloadSystems() {
  isReloading.value = true
  systems = FileHandler.getInformationSystems()
  informationSystemStore.systems = systems
  isReloading.value = false
}

/* 12. Lifecycle */
onMounted(() => {
  initializeSystems()
})

/* 13. defineExpose */
// none
</script>

<template>
  <div class="flex flex-col justify-center gap-4 min-h-screen">
    <UCard v-for="(system, index) in systems" :key="system.id" :class="{ 'mt-4': index === 0 }" class="w-full max-w-4xl mx-auto">
      <template #header>
        <h2 class="text-lg font-semibold">{{ system.name }}</h2>
      </template>

      <p class="text-sm text-white-600/25">{{ system.description }}</p>

      <template #footer>
        <div class="flex justify-between items-center w-full">
          <UButton color="primary" variant="outline" @click="navigateToSystem(system.id)">
            {{ t('enter_system') }}
          </UButton>

          <UButton :loading="isReloading" icon="heroicons-outline:refresh" color="primary" variant="solid" @click="reloadSystems">
            Reload
          </UButton>

        </div>
      </template>
    </UCard>
  </div>
</template>