import { useRuntimeConfig } from '#app'

export type PageLoadSource = 'public' | 'development'

export function normalizePageLoadSource(value: unknown): PageLoadSource {
  const source = String(value ?? 'public').trim().toLowerCase()
  return source === 'development' ? 'development' : 'public'
}

export function getPageLoadSource(): PageLoadSource {
  const config = useRuntimeConfig()
  return normalizePageLoadSource(config.public.loadPagesFrom)
}
