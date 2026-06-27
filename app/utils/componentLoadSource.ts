import { useRuntimeConfig } from '#app'

export type ComponentLoadSource = 'public' | 'development'

export function normalizeComponentLoadSource(value: unknown): ComponentLoadSource {
  const source = String(value ?? 'public').trim().toLowerCase()
  return source === 'development' ? 'development' : 'public'
}

export function getComponentLoadSource(): ComponentLoadSource {
  const config = useRuntimeConfig()
  return normalizeComponentLoadSource(config.public.loadComponentsFrom)
}
