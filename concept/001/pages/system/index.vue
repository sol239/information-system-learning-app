<script setup lang="ts">
/* 1. Imports */
import { onMounted } from 'vue'
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
const handler = new FileHandler()

/* 5. Props */
// none

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
const systems: InformationSystem[] = handler.getInformationSystems()

/* 9. Computed */
// none

/* 10. Watchers */
// none

/* 11. Methods */
function navigateToSystem(systemId: number) {
  selectedSystemStore.select(systemId)
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

/* 12. Lifecycle */
onMounted(() => {
  initializeSystems()
})

/* 13. defineExpose */
// none
</script>

<template>
  <div class="flex flex-col gap-4">
    <UCard v-for="system in systems" :key="system.id">
      <template #header>
        <h2 class="text-lg font-semibold">{{ system.name }}</h2>
      </template>

      <p class="text-sm text-gray-600">{{ system.description }}</p>

      <template #footer>
        <UButton color="primary" variant="outline" @click="navigateToSystem(system.id)">
          {{ t('enter_system') }}
        </UButton>
      </template>
    </UCard>
  </div>
</template>