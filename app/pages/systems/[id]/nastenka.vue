<template>
  <div class="p-6 flex flex-col gap-8 max-w-full mx-auto">
    <ComponentWrapper :component="dashboardHeroCard" class="justify-center mt-6" />
    <section id="entity-stat-section" class="-mt-[22px] -mb-4 flex flex-wrap gap-4 md:flex-nowrap">
      <ComponentWrapper :component="participantsStat" class="md:flex-1" />
      <ComponentWrapper :component="sessionsStat" class="md:flex-1" />
      <ComponentWrapper :component="supervisorsStat" class="md:flex-1" />
      <ComponentWrapper :component="mealsStat" class="md:flex-1" />
    </section>
    <USeparator />

    <h2 class="system-page-heading -my-4">Souhrnné statistiky</h2>
    <section id="agg-stat-section" class="grid grid-cols-2 gap-4">
      <ComponentWrapper :component="minParticipantsPerSessionStat" class="w-full" />
      <ComponentWrapper :component="maxParticipantsPerSessionStat" class="w-full" />
      <ComponentWrapper :component="totalParticipantsInSessionsStat" class="w-full" />
      <ComponentWrapper :component="maxParticipantAgeStat" class="w-full" />
    </section>
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed } from 'vue'
import ComponentWrapper from '~/components/ComponentWrapper.vue'

defineOptions({
  name: 'SystemDashboardPage',
})

/* 2. Stores */
const { systemsStore } = useSyncSystemId()

/* 3. Context hooks */

/* 4. Constants (non-reactive) */

/* 5. Props */

/* 6. Emits */

/* 7. Template refs */

/* 8. State (ref, reactive) */

/* 9. Computed */
const dashboardHeroCard = computed(() =>
  systemsStore.getComponentById('hlavni-karta-systemu')
)

const participantsStat = computed(() =>
  systemsStore.getComponentById('statistika-ucastniku')
)

const sessionsStat = computed(() => systemsStore.getComponentById('statistika-turnusu'))

const supervisorsStat = computed(() =>
  systemsStore.getComponentById('statistika-vedoucich')
)

const mealsStat = computed(() => systemsStore.getComponentById('statistika-jidel'))

const minParticipantsPerSessionStat = computed(() =>
  systemsStore.getComponentById('statistika-min-ucastniku-turnusu')
)

const maxParticipantsPerSessionStat = computed(() =>
  systemsStore.getComponentById('statistika-max-ucastniku-turnusu')
)

const totalParticipantsInSessionsStat = computed(() =>
  systemsStore.getComponentById('statistika-celkem-ucasti-turnusu')
)

const maxParticipantAgeStat = computed(() =>
  systemsStore.getComponentById('statistika-max-vek-ucastnika')
)

/* 10. Watchers */

/* 11. Methods */

/* 12. Lifecycle */

/* 13. defineExpose */
</script>

<style scoped>
#entity-stat-section :deep(.component-wrapper),
#entity-stat-section :deep(.content-container),
#entity-stat-section :deep(.component-html) {
  width: 100%;
  height: 100%;
  min-width: 0;
}

#entity-stat-section :deep(#statistika-ucastniku-karta),
#entity-stat-section :deep(#statistika-turnusu-karta),
#entity-stat-section :deep(#statistika-vedoucich-karta),
#entity-stat-section :deep(#statistika-jidel-karta) {
  width: 100% !important;
  max-width: none !important;
  height: 100%;
  min-height: 36px;
  padding: 5px 10px !important;
  justify-content: center;
}

#agg-stat-section :deep(.component-wrapper),
#agg-stat-section :deep(.content-container),
#agg-stat-section :deep(.component-html) {
  width: 100%;
  height: 100%;
}

#agg-stat-section :deep(#statistika-min-ucastniku-turnusu-card),
#agg-stat-section :deep(#statistika-max-ucastniku-turnusu-card),
#agg-stat-section :deep(#statistika-celkem-ucasti-turnusu-card),
#agg-stat-section :deep(#statistika-max-vek-ucastnika-card) {
  width: 100% !important;
  max-width: none !important;
  height: 100%;
  min-height: 50px;
  padding: 5px 10px !important;
}

#agg-stat-section :deep(#statistika-max-vek-ucastnika-label) {
  max-width: none;
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
}

#agg-stat-section :deep(#statistika-max-ucastniku-turnusu-icon) {
  font-size: 13px !important;
}
</style>
