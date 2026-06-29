<!-- pages/system/[id]/[...path].vue -->
<script setup lang="ts">
import { shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { useSystemsStore } from '~/stores/systemsStore'

const route = useRoute()
const systemsStore = useSystemsStore()

const error = shallowRef<string | null>(null)

const systemId = route.params.id as string
const pagePath = '/' + (route.params.path as string[]).join('/')

const system = systemsStore.getSystemById(systemId)
if (!system) {
    error.value = `System ${systemId} not found`
} else {
    const page = system.pages.find(p => p.route === pagePath)
    if (!page) {
        error.value = `Page ${pagePath} not found`
    } else {
        error.value = `No static Nuxt page found for ${pagePath}`
    }
}
</script>

<template>
    <div class="text-red-500">{{ error }}</div>
</template>
