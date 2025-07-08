<script setup lang="ts">
import type { InformationSystem } from '~/model/types/InformationSystem'


const route = useRoute()
const systemId = route.params.id
const store = useInformationSystemStore()
const systems = store.systems
const system = ref<InformationSystem | null>(null)
system.value = systems.find(sys => sys.id === parseInt(systemId as string, 10)) || null

import participants from '~/data/information_system_01/participants.json'


</script>

<template>

</template>