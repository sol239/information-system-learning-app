// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  $env: {
    cypress: {
      buildDir: ".nuxt-cypress",
      runtimeConfig: {
        public: {
          appMode: "teacher",
        },
      },
      vite: {
        optimizeDeps: {
          include: [
            "@vue/devtools-core",
            "@vue/devtools-kit",
            "sql.js",
            "@monaco-editor/loader",
            "dexie",
            "uuid",
            "jszip",
            "typescript",
            "@guolao/vue-monaco-editor",
            "@vue-flow/core",
            "@vue-flow/background",
            "@vue-flow/controls",
          ],
        },
      },
    },
  },
  devServer: { port: 3003 },
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      formatCodeOnSystemLoad: false, // Formats and saves component code when loading or restoring a system.
      appMode: "student", // Sets the application mode ( teacher | student)
      bypassPageVisibility: false, // Allows access to all system pages regardless of task restrictions.
      htmlAvailable: "true", // Enables HTML code editing.
      cssAvailable: "true", // Enables CSS code editing.
      jsAvailable: "true", // Enables JavaScript code editing.
      sqlAvailable: "true", // Enables SQL code editing.
      jsClickAvailable: "false", // Controls JavaScript code editing
      sqlClickAvailable: "true", // Controls SQL code editing.
      indexedDbName: "InformationSystemsDb", // Names the browser database.
      indexedDbVersion: 4, // Sets the browser database schema version.
      indexedDbVersionKey: "db_version", // Stores the active database version key.
      databasePageRoute: "/database", // Defines the database page route.
      publicSystemsDirPath: "/systems", // Points to public system definitions.
      systemsToPreload: ["skolni_tabor_palava"], // Ids of systems which shall be preloaded.
      systemComponentsGlobPath: "~/model/SystemComponents/**/*.ts", // Finds default system components.
    },
  },
  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxt/test-utils/module",
    "@nuxt/eslint",
  ],
  piniaPluginPersistedstate: {
    storage: "localStorage",
    debug: true,
  },
  css: ["./assets/css/main.css"],
  colorMode: {
    preference: "light",
    fallback: "light",
  },
  ssr: false,
  i18n: {
    locales: [
      {
        code: "cs",
        iso: "cs-CZ",
        file: "cs.json",
        name: "Čeština",
      },
      {
        code: "en",
        iso: "en-US",
        file: "en.json",
        name: "English",
      },
    ],
    defaultLocale: "cs",
    langDir: "locales/",
    strategy: "no_prefix",
    detectBrowserLanguage: false,
  },
  app: {
    baseURL: "/information-system-learning-app",
  },
  ui: {
    theme: {
      colors: [
        "teacher",
        "student",
        "red",
        "yellow",
        "lime",
        "green",
        "sky",
        "blue",
        "violet",
        "orange",
      ],
    },
  },
});
