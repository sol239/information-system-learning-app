<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { InformationSystem } from '~/model/types/InformationSystem'

const route = useRoute()
const systemId = route.params.id

const store = useInformationSystemStore()
const systems = store.systems

onMounted(() => {
    const system = systems.find(sys => sys.id === parseInt(systemId as string, 10));
});

</script>

<template>
        <LocalNavbar />

</template>