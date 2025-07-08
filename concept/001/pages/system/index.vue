<template>
  <div class="flex flex-col gap-4">
    <UCard v-for="system in systems" :key="system.id">
      <template #header>
        <h2 class="text-lg font-semibold">{{ system.name }}</h2>
      </template>

      <p class="text-sm text-gray-600">{{ system.description }}</p>

      <template #footer>
        <UButton color="primary" variant="outline" @click="navigateToSystem(system.id)">Enter</UButton>
      </template>
    </UCard>
  </div>
</template>
<script setup lang="ts">

import { FileHandler } from '~/composables/FileHandler';
import { InformationSystem } from '~/model/types/InformationSystem';
import { useInformationSystemStore } from '~/stores/informationSystems';

import { navigateTo } from '#app';

function navigateToSystem(systemId: number) {
  navigateTo(`/system/${systemId}`);
}

const handler = new FileHandler();
handler.printDirectories();


const configFiles = import.meta.glob('~/assets/data/*/config.json', { eager: true });
console.log('Config files:', configFiles);

const systems: InformationSystem[] = handler.getInformationSystems();



const informationSystemStore = useInformationSystemStore();

informationSystemStore.systems = systems;


</script>