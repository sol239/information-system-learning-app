<!-- pages/system/[id]/[...path].vue -->
<script setup lang="ts">
import { shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { useSystemsStore } from '~/stores/systemsStore'
import { compileSFC } from '~/utils/compileComponent'
import { getPageLoadSource } from '~/utils/pageLoadSource'

const route = useRoute()
const systemsStore = useSystemsStore()

const DynamicPage = shallowRef(null)
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
    } else if (!page.vueSource) {
        error.value = getPageLoadSource() === 'development'
            ? `No static Nuxt page found for ${pagePath}`
            : `No source for page ${pagePath}`
    } else {
        try {
            DynamicPage.value = await compileSFC(page.vueSource, page.name)
        } catch (e) {
            error.value = `Compilation failed: ${e}`
        }
    }
}
</script>

<template>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <component :is="DynamicPage" v-else-if="DynamicPage" />
    <div v-else>Loading...</div>
</template>
