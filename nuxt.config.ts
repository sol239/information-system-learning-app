// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  // .env configuration loaded into runtimeConfig.public
  runtimeConfig: {
    public: {
      appMode: process.env.NUXT_PUBLIC_APP_MODE ?? '',
      singleSystem: process.env.NUXT_PUBLIC_SINGLE_SYSTEM ?? 'true',
      htmlAvailable: process.env.NUXT_PUBLIC_HTML_AVAILABLE ?? 'true',
      cssAvailable: process.env.NUXT_PUBLIC_CSS_AVAILABLE ?? 'true',
      jsAvailable: process.env.NUXT_PUBLIC_JS_AVAILABLE ?? 'true',
      sqlAvailable: process.env.NUXT_PUBLIC_SQL_AVAILABLE ?? 'true',
      jsClickAvailable: process.env.NUXT_PUBLIC_JS_CLICK_AVAILABLE ?? 'false',
      sqlClickAvailable: process.env.NUXT_PUBLIC_SQL_CLICK_AVAILABLE ?? 'true',
      indexedDbName: process.env.NUXT_PUBLIC_INDEXED_DB_NAME ?? 'InformationSystemsDb',
      indexedDbVersion: 2,
      indexedDbVersionKey: 'db_version',
      preloadedSystems: ['skolni-tabor-palava'],
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
