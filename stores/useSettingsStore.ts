import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {

    const shortcuts = ref<Map<string, string>>(new Map([
        ["submit", 'alt+s'],
        ["open_taskview", 'alt+t'],
        ["toggle_edit_mode", 'alt+w'],
        ["toggle_highlight_mode", 'alt+q']
    ]))

    return {
        shortcuts
    }
}, {
  persist: true
})
