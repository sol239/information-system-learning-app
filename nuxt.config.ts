// https://nuxt.com/docs/api/configuration/nuxt-config
import fs from 'node:fs'
import path from 'node:path'

const loadPagesFrom = process.env.NUXT_PUBLIC_LOAD_PAGES_FROM ?? 'public'

function generateSystemsManifest() {
  return {
    name: 'generate-systems-manifest',
    buildStart() {
      const systemsDir = path.resolve(__dirname, 'public/systems')
      if (!fs.existsSync(systemsDir)) fs.mkdirSync(systemsDir, { recursive: true })
      const systems = fs.readdirSync(systemsDir, { withFileTypes: true })
        .filter(entry =>
          entry.isFile() && entry.name.endsWith('.zip') ||
          entry.isDirectory() && fs.existsSync(path.join(systemsDir, entry.name, 'config.json'))
        )
        .map(entry => entry.name)

      fs.writeFileSync(path.join(systemsDir, 'manifest.json'), JSON.stringify({ systems }, null, 2))
      //console.log(`[systems-manifest] Found ${systems.length} system(s):`, systems)
    }
  }
}

function isStaticSystemContentPage(file?: string) {
  if (!file) {
    return false
  }

  const normalizedFile = file.split(path.sep).join('/')

  return normalizedFile.includes('/app/pages/systems/[id]/')
    && !normalizedFile.endsWith('/app/pages/systems/[id]/[...path].vue')
    && !normalizedFile.endsWith('/app/pages/systems/[id]/database.vue')
    && !normalizedFile.endsWith('/app/pages/systems/[id]/designer.vue')
}

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  hooks: {
    'pages:extend'(pages) {
      const normalizedLoadPagesFrom = String(loadPagesFrom).trim().toLowerCase()
      if (normalizedLoadPagesFrom === 'development') {
        return
      }

      function removeStaticSystemContentPages(routes: typeof pages) {
        for (let index = routes.length - 1; index >= 0; index--) {
          const route = routes[index]

          if (route.children) {
            removeStaticSystemContentPages(route.children)
          }

          if (isStaticSystemContentPage(route.file)) {
            routes.splice(index, 1)
          }
        }
      }

      removeStaticSystemContentPages(pages)
    },
  },
  runtimeConfig: {
    public: {
      appMode: process.env.NUXT_PUBLIC_APP_MODE ?? '',
      singleSystem: process.env.NUXT_PUBLIC_SINGLE_SYSTEM ?? 'true',
      loadComponentsFrom: process.env.NUXT_PUBLIC_LOAD_COMPONENTS_FROM ?? 'public',
      loadPagesFrom,
      htmlAvailable: process.env.NUXT_PUBLIC_HTML_AVAILABLE ?? 'true',
      cssAvailable: process.env.NUXT_PUBLIC_CSS_AVAILABLE ?? 'true',
      jsAvailable: process.env.NUXT_PUBLIC_JS_AVAILABLE ?? 'true',
      sqlAvailable: process.env.NUXT_PUBLIC_SQL_AVAILABLE ?? 'true',
      jsClickAvailable: process.env.NUXT_PUBLIC_JS_CLICK_AVAILABLE ?? 'false',
      sqlClickAvailable: process.env.NUXT_PUBLIC_SQL_CLICK_AVAILABLE ?? 'true',
      indexedDbName: process.env.NUXT_PUBLIC_INDEXED_DB_NAME ?? 'InformationSystemsDb',
      indexedDbVersion: Number(process.env.NUXT_PUBLIC_INDEXED_DB_VERSION ?? 1),
      indexedDbVersionKey: process.env.NUXT_PUBLIC_INDEXED_DB_VERSION_KEY ?? 'db_version',
    },
  },
  vite: {
    plugins: [generateSystemsManifest()],
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
