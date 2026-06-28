<template>
  <UApp class="app-scale-wrapper">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
colorMode.preference = 'light'
colorMode.value = 'light'
</script>
