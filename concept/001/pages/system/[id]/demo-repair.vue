<script setup lang="ts">

import { ref } from 'vue'

function sortNumbers(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }
  return arr.slice().sort((a, b) => b - a);
}


const numArray = ref([5, 3, 8, 1, 2, 7, 4, 6])

function handleSort() {
  numArray.value = sortNumbers(numArray.value)
}

function shuffleArray() {
  // Fisher-Yates shuffle
  const arr = [...numArray.value]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  numArray.value = arr
}

</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
    <UCard class="w-full max-w-md shadow-xl rounded-xl p-8 bg-white/80 backdrop-blur">
      <h2 class="text-2xl font-bold text-center mb-6 text-purple-700">Array Sort Demo</h2>
      <div class="mb-4">
        <p class="font-semibold text-gray-700">Array:</p>
        <pre class="bg-gray-100 rounded p-2 text-blue-700">{{ numArray }}</pre>
      </div>
      <div class="flex justify-center gap-4 mb-6">
        <UButton @click="handleSort" color="primary" size="lg" class="px-8 py-2 rounded-full shadow-md hover:scale-105 transition-transform">
          Sort Array
        </UButton>
        <UButton @click="shuffleArray" color="secondary" size="lg" class="px-8 py-2 rounded-full shadow-md hover:scale-105 transition-transform">
          Shuffle Array
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<style scoped>
.bg-gradient-to-br {
  background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
}
</style>