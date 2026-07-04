// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      appMode: 'student',
      htmlAvailable: 'true',
      cssAvailable: 'true',
      jsAvailable: 'true',
      sqlAvailable: 'true',
      jsClickAvailable: 'false',
      sqlClickAvailable: 'true',
      indexedDbName: 'InformationSystemsDb',
      indexedDbVersion: 3,
      indexedDbVersionKey: 'db_version',
      databasePageRoute: '/database',
      publicSystemsDirPath: '/systems',
      preloadedSystems: ['skolni_tabor_palava'],
    },
  },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxtjs/i18n', 'pinia-plugin-persistedstate/nuxt', '@nuxt/test-utils/module', '@nuxt/eslint'],
  piniaPluginPersistedstate: {
    storage: 'localStorage',
    debug: true,
  },
  css: ['./assets/css/main.css'],
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },
  ssr: false,
  i18n: {
    locales: [
      {
        code: 'cs',
        iso: 'cs-CZ',
        file: 'cs.json',
        name: 'Čeština'
      },
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.json',
        name: 'English'
      }
    ],
    defaultLocale: 'cs',
    langDir: 'locales/',
    strategy: 'no_prefix',
    detectBrowserLanguage: false
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/information-system-learning-app',
  },
  ui: {
    theme: {
      colors: [
        'teacher',
        'student',
        'red',
        'yellow',
        'lime',
        'green',
        'sky',
        'blue',
        'violet',
        'orange',
      ]
    }
  }
})
