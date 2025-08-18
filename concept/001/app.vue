<template>
  <UApp>
    <GlobalNavbar />
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">

import { useComponentCodeStore } from '~/stores/useComponentCodeStore'
const componentCodeStore = useComponentCodeStore()

const statsMealsHtml = `
  <div class="stat-card">
    <div class="stat-icon">🍽️</div>
    <div class="stat-content">
      <div class="stat-number">{{ mealsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`
const statsMealsSql = `SELECT COUNT(*) as count FROM jídla`

const statsMealsNavigateJs = `
selectedTableStore.select('jídla');
navigateTo({
  path: \`/system/\${systemId}/table\`,
});
`

const statsParticipantsNavigateJs = `
selectedTableStore.select('účastníci');
navigateTo({
  path: \`/system/\${systemId}/table\`,
});
`


const statsSupervisorsNavigateJs = `
selectedTableStore.select('vedoucí');
navigateTo({
  path: \`/system/\${systemId}/table\`,
});
`


const statsSessionsNavigateJs = `
selectedTableStore.select('turnusy');
navigateTo({
  path: \`/system/\${systemId}/table\`,
});
`

const statsParticipantsHtml = `
  <div class="stat-card">
    <div class="stat-icon">👥</div>
    <div class="stat-content">
      <div class="stat-number">{{ participantsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`
const statsParticipantsSql = `SELECT COUNT(*) as count FROM účastníci`

const statsSessionsHtml = `
  <div class="stat-card">
    <div class="stat-icon">📅</div>
    <div class="stat-content">
      <div class="stat-number">{{ sessionsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`
const statsSessionsSql = `SELECT COUNT(*) as count FROM turnusy`

const statsSupervisorsHtml = `
  <div class="stat-card">
    <div class="stat-icon">👨‍🏫</div>
    <div class="stat-content">
      <div class="stat-number">{{ supervisorsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`
const statsSupervisorsSql = `SELECT COUNT(*) as count FROM vedoucí`

componentCodeStore.updateDefaultComponentCode("stats-meals-html.vue", statsMealsHtml)
componentCodeStore.updateDefaultComponentCode("stats-meals-sql.vue", statsMealsSql)
componentCodeStore.updateDefaultComponentCode("stats-meals-js.vue", statsMealsNavigateJs)

componentCodeStore.updateDefaultComponentCode("stats-participants-html.vue", statsParticipantsHtml)
componentCodeStore.updateDefaultComponentCode("stats-participants-sql.vue", statsParticipantsSql)
componentCodeStore.updateDefaultComponentCode("stats-participants-js.vue", statsParticipantsNavigateJs)

componentCodeStore.updateDefaultComponentCode("stats-sessions-html.vue", statsSessionsHtml)
componentCodeStore.updateDefaultComponentCode("stats-sessions-sql.vue", statsSessionsSql)
componentCodeStore.updateDefaultComponentCode("stats-sessions-js.vue", statsSessionsNavigateJs)

componentCodeStore.updateDefaultComponentCode("stats-supervisors-html.vue", statsSupervisorsHtml)
componentCodeStore.updateDefaultComponentCode("stats-supervisors-sql.vue", statsSupervisorsSql)
componentCodeStore.updateDefaultComponentCode("stats-supervisors-js.vue", statsSupervisorsNavigateJs)

componentCodeStore.resetComponentCode("stats-meals-html.vue")
componentCodeStore.resetComponentCode("stats-meals-sql.vue")
componentCodeStore.resetComponentCode("stats-meals-js.vue")

componentCodeStore.resetComponentCode("stats-participants-html.vue")
componentCodeStore.resetComponentCode("stats-participants-sql.vue")
componentCodeStore.resetComponentCode("stats-participants-js.vue")

componentCodeStore.resetComponentCode("stats-sessions-html.vue")
componentCodeStore.resetComponentCode("stats-sessions-sql.vue")
componentCodeStore.resetComponentCode("stats-sessions-js.vue")

componentCodeStore.resetComponentCode("stats-supervisors-html.vue")
componentCodeStore.resetComponentCode("stats-supervisors-sql.vue")
componentCodeStore.resetComponentCode("stats-supervisors-js.vue")

</script>