<script setup lang="ts">
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript'
import ParticipantTable from '~/components/infsys_components/ParticipantTable.vue'
import type { InformationSystem } from '~/model/types/InformationSystem'
import type { Participant } from '~/model/types/Participant'

//TODO: make participants a type of Participant[]

const route = useRoute()
const systemId = route.params.id
const store = useInformationSystemStore()
const systems = store.systems
const system = ref<InformationSystem | null>(null)
system.value = systems.find(sys => sys.id === parseInt(systemId as string, 10)) || null

const directory = system.value?.directory || ''

const participants = ref<any[]>([])
participants.value = []

const tablePath = `~/assets/data/${directory}/tables/participants.json`;
console.log('Table Path:', tablePath);
const participantsModule = await import(`~/assets/data/${directory}/tables/participants.json`)
participants.value = participantsModule.default || []
console.log('Loaded participants:', participants.value)


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
console.log('Participants:', participants.value)


</script>

<template>
    <LocalNavbar :items="localItems" />
    <ParticipantTable :participants="participants" />
</template>