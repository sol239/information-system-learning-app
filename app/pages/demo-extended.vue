<template>
  <div></div>
</template>


<script setup lang="ts">
/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
/* 1. Imports */
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

/* 2. Stores */
//const userStore = useUserStore()

/* 3. Context hooks */
const route = useRoute()

/* 4. Constants (non-reactive) */
const MIN_AGE = 18
const formId = 'signup-form'

/* 5. Props */
const props = defineProps<{ title: string }>()

/* 6. Emits */
const emit = defineEmits<{ (e: 'submit', value: string): void }>()

/* 7. Template refs 
const formRef = ref<HTMLFormElement>()
const inputRef = ref<HTMLInputElement>()
*/

/* 8. State (ref, reactive) */
const name = ref('')
const form = reactive({ age: 0 })

/* 9. Computed */
const isAdult = computed(() => form.age >= MIN_AGE)

/* 10. Watchers */
watch(name, (newName) => {
  console.log('Name changed:', newName)
})

/* 11. Methods */
function handleSubmit() {
  if (isAdult.value) {
    emit('submit', name.value)
  }
}

/* 12. Lifecycle */
onMounted(() => {
  console.log('Form ready')
})

/* 13. defineExpose */
defineExpose({
})

</script>

<style scoped>
</style>
