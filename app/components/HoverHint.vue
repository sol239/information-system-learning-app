<template>
  <div
    class="hover-hint group relative inline-flex"
    tabindex="-1"
  >
    <slot />

    <div
      class="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-64 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-150 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
    >
      <div class="rounded-xl border border-gray-200/80 bg-white/95 px-3 py-2 text-xs font-medium text-gray-700 shadow-lg shadow-gray-900/10 ring-1 ring-white/70 backdrop-blur">
        <slot name="content">
          {{ text }}
        </slot>
      </div>
      <div class="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-gray-200/80 bg-white/95" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>
