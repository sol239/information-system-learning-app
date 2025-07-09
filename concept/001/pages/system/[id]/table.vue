<script setup lang="ts">
import ParticipantTable from '~/components/infsys_components/ParticipantTable.vue'
import type { InformationSystem } from '~/model/types/InformationSystem'
import { ref, computed } from 'vue'

const route = useRoute()
const systemId = route.params.id
const store = useInformationSystemStore()
const systems = store.systems
const system = ref<InformationSystem | null>(null)
system.value = systems.find(sys => sys.id === parseInt(systemId as string, 10)) || null

const directory = system.value?.directory || ''

// Table selection logic
const tableNames = computed(() => system.value?.tables.map(t => t.name) || [])
const selectedTableName = ref(tableNames.value[0] || '')

const selectedTableData = computed(() => {
  if (!system.value) return []
  const table = system.value.tables.find(t => t.name === selectedTableName.value)
  return table?.data || []
})

const selectedTableKey = computed(() => selectedTableData.value.length ? Object.keys(selectedTableData.value[0]).join(',') : '')

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
    <div class="flex items-center gap-4 px-4 py-2">
      <label for="table-select">Select table:</label>
      <USelect v-model="selectedTableName" :items="tableNames" class="w-48" />
    </div>
    <ParticipantTable
      :items="selectedTableData"
      :tableName="selectedTableName"
      :key="selectedTableKey"
    />
</template>