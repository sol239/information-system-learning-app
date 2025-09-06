<template>
  <div class="highlightable" id="dashboard-table-count-badge" @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('dashboard-table-count-badge' ,$event)">
    <UBadge color="primary" variant="solid" size="lg">
      <UIcon name="i-heroicons-table-cells" />
      <span>{{ t('table_count') }}: {{ tableCount }}</span>
    </UBadge>
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed } from 'vue'
import { InformationSystem } from '~/model/InformationSystem'
import { useHighlightStore } from '#imports';

/* 2. Context hooks */
const { t } = useI18n()
const highlightStore = useHighlightStore();

/* 3. Props */
const props = defineProps<{
  system: InformationSystem | null
}>()

/* 4. Emits */
// none

/* 5. Computed */
const tableCount = computed(() => {
  return props.system?.tables?.length || 0
})

useHighlightWatchers(highlightStore.highlightHandler, highlightStore);

</script>
