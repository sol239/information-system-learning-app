import { defineStore } from 'pinia'

export const usePersistentStorageTestStore = defineStore('persistentStorageTest', () => {

    const counter = ref(0)

    function incrementCounter() {
        console.log("Current counter: ", counter.value)
        counter.value++
    }

    return {
        counter,
        incrementCounter
    }

}, {
  persist: true
})
