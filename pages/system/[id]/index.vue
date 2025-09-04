<script setup lang="ts">
/* 1. Imports */
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { InformationSystem } from '~/model/InformationSystem'
import { useI18n } from '#imports'
import { useSelectedSystemStore } from '#imports'
import { useComponentCodeStore } from '~/stores/useComponentCodeStore'
import { Component } from '~/model/Component'

/* 2. Stores */
const store = useInformationSystemStore()
const selectedSystemStore = useSelectedSystemStore()

/* 3. Context hooks */
const route = useRoute()
const { locales, setLocale } = useI18n()

/* 4. Constants (non-reactive) */
const systemId = route.params.id
const systems = store.systems
const { t } = useI18n()

/* 5. Props */
// none

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
const system = ref<InformationSystem | null>(null)

/* 9. Computed */
/* 10. Watchers */
// none

/* 11. Methods */
function initializeSystem() {
  system.value = systems.find(sys => sys.id === parseInt(systemId as string, 10)) || null

  // logging for debugging purposes
  console.log('System ID:', systemId);
  console.log('Available Systems:', systems);
  console.log('Current System:', system.value);


}

/* 12. Lifecycle */
onMounted(() => {
  initializeSystem()
})

/* 13. defineExpose */
// none
</script>

<template>
  <LocalNavbar />
</template>