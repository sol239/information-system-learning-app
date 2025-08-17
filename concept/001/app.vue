<template>
  <UApp>
    <GlobalNavbar />
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">

import { useComponentCodeStore } from '~/stores/useComponentCodeStore'
const componentCodeStore = useComponentCodeStore()

componentCodeStore.updateComponentCode("stats-meals-html.vue", `
  <div class="stat-card">
    <div class="stat-icon">🍽️</div>
    <div class="stat-content">
      <div class="stat-number">{{ mealsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`)
componentCodeStore.updateComponentCode("stats-meals-sql.vue", `SELECT COUNT(*) as count FROM jídla`)

componentCodeStore.updateComponentCode("stats-participants-html.vue", `
  <div class="stat-card">
    <div class="stat-icon">👥</div>
    <div class="stat-content">
      <div class="stat-number">{{ participantsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`)

componentCodeStore.updateComponentCode("stats-participants-sql.vue", `SELECT COUNT(*) as count FROM účastníci`)

componentCodeStore.updateComponentCode("stats-sessions-html.vue", `
  <div class="stat-card">
    <div class="stat-icon">📅</div>
    <div class="stat-content">
      <div class="stat-number">{{ sessionsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`)

componentCodeStore.updateComponentCode("stats-sessions-sql.vue", `SELECT COUNT(*) as count FROM turnusy`)

componentCodeStore.updateComponentCode("stats-supervisors-html.vue", `
  <div class="stat-card">
    <div class="stat-icon">👨‍🏫</div>
    <div class="stat-content">
      <div class="stat-number">{{ supervisorsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`)

componentCodeStore.updateComponentCode("stats-supervisors-sql.vue", `SELECT COUNT(*) as count FROM vedoucí`)

  </script>