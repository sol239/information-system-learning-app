<template>
  <UApp>
    <GlobalNavbar />
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">

import { useComponentCodeStore } from '~/stores/useComponentCodeStore'
import { Component } from './model/Component'
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
  path: \`/system/\${systemId}/database\`,
});
`

const statsParticipantsNavigateJs = `
selectedTableStore.select('účastníci');
navigateTo({
  path: \`/system/\${systemId}/participants\`,
});
`


const statsSupervisorsNavigateJs = `
selectedTableStore.select('vedoucí');
navigateTo({
  path: \`/system/\${systemId}/supervisors\`,
});
`


const statsSessionsNavigateJs = `
selectedTableStore.select('turnusy');
navigateTo({
  path: \`/system/\${systemId}/sessions\`,
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

/*
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
*/

// New instances created from the existing code above
const statsMealsComponent = new Component({
    id: "stats-meals",
    name: "Stats Meals",
    description: `Component for meals stats. SQL: ${statsMealsSql}`,
    html: { "default": statsMealsHtml },
    css: { "default": "" },
    js: { "default": statsMealsNavigateJs },
    sql: { "default": statsMealsSql },
    additionals: {}
});

const statsParticipantsComponent = new Component({
    id: "stats-participants",
    name: "Stats Participants",
    description: `Component for participants stats. SQL: ${statsParticipantsSql}`,
    html: { "default": statsParticipantsHtml },
    css: { "default": "" },
    js: { "default": statsParticipantsNavigateJs },
    sql: { "default": statsParticipantsSql },
    additionals: {}
});

const statsSessionsComponent = new Component({
    id: "stats-sessions",
    name: "Stats Sessions",
    description: `Component for sessions stats. SQL: ${statsSessionsSql}`,
    html: { "default": statsSessionsHtml },
    css: { "default": "" },
    js: { "default": statsSessionsNavigateJs },
    sql: { "default": statsSessionsSql },
    additionals: {}
});

const statsSupervisorsComponent = new Component({
    id: "stats-supervisors",
    name: "Stats Supervisors",
    description: `Component for supervisors stats. SQL: ${statsSupervisorsSql}`,
    html: { "default": statsSupervisorsHtml },
    css: { "default": "" },
    js: { "default": statsSupervisorsNavigateJs },
    sql: { "default": statsSupervisorsSql },
    additionals: {}
});

// participants.vue participants-capacity-count
const participantsCapacityCountComponent = new Component({
    id: "participants-capacity-count",
    name: "Participants Capacity Count",
    description: `Badge showing the capacity count of the selected session.`,
    html: { "default": "" },
    css: { "default": "" },
    js: { "default": `
    function getCapacityBadgeColor(percentage: number): string {
        if (percentage < 50) return 'green';
        if (percentage < 80) return 'yellow';
        return 'red';
    }
    ` },
    sql: { "default": "" },
    additionals: {}
}); 

// Store the instances into the store
componentCodeStore.updateDefaultComponent(statsMealsComponent);
componentCodeStore.updateDefaultComponent(statsParticipantsComponent);
componentCodeStore.updateDefaultComponent(statsSessionsComponent);
componentCodeStore.updateDefaultComponent(statsSupervisorsComponent);

// Reset
componentCodeStore.resetComponentCode("stats-meals");
componentCodeStore.resetComponentCode("stats-participants");
componentCodeStore.resetComponentCode("stats-sessions");
componentCodeStore.resetComponentCode("stats-supervisors");

</script>