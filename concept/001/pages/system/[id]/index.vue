<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { InformationSystem } from '~/model/types/InformationSystem'
import { ref, onMounted } from 'vue'
import { sys } from 'typescript'

const route = useRoute()
const systemId = route.params.id

const store = useInformationSystemStore()
const systems = store.systems

const system = ref<InformationSystem | null>(null)


system.value = systems.find(sys => sys.id === parseInt(systemId as string, 10)) || null

// logging for debugging purposes
console.log('System ID:', systemId);
console.log('Available Systems:', systems);
console.log('Current System:', system.value);

const localItems = ref([
      {
        label: system.value?.name || 'System',
      },
      {
        label: 'Table',
        icon: 'i-heroicons-table-cells',
        to: `/system/${systemId}/table`,
        data_target: 'system-table',
      }
    
]);

</script>

<template>
    <LocalNavbar :items="localItems" />
</template>