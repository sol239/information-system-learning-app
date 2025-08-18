import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {

    const shortcuts = ref<Map<string, string>>(new Map([
        ["submit", 's'],
        ["open_taskview", 'alt+t'],
        ["toggle_edit_mode", 'e'],
        ["toggle_highlight_mode", 'h']
    ]))



    return {
        shortcuts
    }
})
