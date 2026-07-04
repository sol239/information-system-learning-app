// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      appMode: 'teacher', // Sets the application mode
      htmlAvailable: 'true', // Enables HTML code editing.
      cssAvailable: 'true', // Enables CSS code editing.
      jsAvailable: 'true', // Enables JavaScript code editing.
      sqlAvailable: 'true', // Enables SQL code editing.
      jsClickAvailable: 'false', // Controls JavaScript code editing
      sqlClickAvailable: 'true', // Controls SQL code editing.
      indexedDbName: 'InformationSystemsDb', // Names the browser database.
      indexedDbVersion: 3, // Sets the browser database schema version.
      indexedDbVersionKey: 'db_version', // Stores the active database version key.
      databasePageRoute: '/database', // Defines the database page route.
      publicSystemsDirPath: '/systems', // Points to public system definitions.
      systemsToPreload: ['skolni_tabor_palava'], // Ids of systems which shall be preloaded.
      systemComponentsGlobPath: '~/model/SystemComponents/**/*.ts', // Finds default system components.
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
