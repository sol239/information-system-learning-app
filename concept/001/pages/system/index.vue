<template>
  <div class="flex flex-col gap-4">
    <UCard v-for="system in systems" :key="system.id">
      <template #header>
        <h2 class="text-lg font-semibold">{{ system.name }}</h2>
      </template>

      <p class="text-sm text-gray-600">{{ system.description }}</p>

      <template #footer>
        <UButton color="primary" variant="outline" @click="navigateToSystem(system.id)">{{ t('enter_system') }}</UButton>
      </template>
    </UCard>
  </div>
</template>
<script setup lang="ts">

import { FileHandler } from '~/composables/FileHandler';
import { InformationSystem } from '~/model/types/InformationSystem';
import { useInformationSystemStore } from '~/stores/informationSystems';
import { useSelectedSystemStore } from '~/stores/selectedSystemId'

import { navigateTo } from '#app';
const { t } = useI18n()

function navigateToSystem(systemId: number) {
  const selectedSystemStore = useSelectedSystemStore()
  selectedSystemStore.select(systemId)
  console.log("Navigating to system with ID:", systemId);
  navigateTo(`/system/${systemId}/dashboard`);
}

const handler = new FileHandler();
const rawSystems = handler.getInformationSystems();

const systems: InformationSystem[] = handler.getInformationSystems();

// const systems: InformationSystem[] = rawSystems.map(s => JSON.parse(JSON.stringify(s)));


const informationSystemStore = useInformationSystemStore();

console.log('Loaded systems:', systems);

try {
  informationSystemStore.systems = systems;
} catch (error) {
  console.error('Error setting systems in store:', error);
}

</script>