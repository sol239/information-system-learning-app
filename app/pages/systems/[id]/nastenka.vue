<template>
  <div class="p-6 flex flex-col gap-8 max-w-full mx-auto">
    <ComponentWrapper :component="dashboardHeroCard" class="justify-center mt-6" />
    <section id="entity-stat-section" class="flex flex-row flex-wrap justify-start gap-4">
      <ComponentWrapper :component="participantsStat" />
      <ComponentWrapper :component="sessionsStat" />
      <ComponentWrapper :component="supervisorsStat" />
      <ComponentWrapper :component="mealsStat" />
    </section>
    <USeparator />

    <h2 class="text-[22px] font-semibold">Statistiky</h2>
    <section id="agg-stat-section" class="flex flex-row flex-wrap justify-start gap-4">
      <ComponentWrapper :component="minParticipantsPerSessionStat" />
      <ComponentWrapper :component="maxParticipantsPerSessionStat" />
      <ComponentWrapper :component="totalParticipantsInSessionsStat" />
      <ComponentWrapper :component="maxParticipantAgeStat" />
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
