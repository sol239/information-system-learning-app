import type { Component } from '~/model/Component'
import type { InformationSystem } from '~/model/InformationSystem'

/** Uses the same Monaco instance and formatting actions as the visible editors. */
export async function formatSystemCode(system: InformationSystem): Promise<void> {
  if (!import.meta.client) return

  const { default: loader } = await import('@monaco-editor/loader')
  const monaco = await loader.init()
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-10000px;width:800px;height:400px;visibility:hidden'
  container.setAttribute('aria-hidden', 'true')
  document.body.append(container)
  const editor = monaco.editor.create(container, { model: null, automaticLayout: false })
  const cache = new Map<string, string>()
  const initializedLanguages = new Set<string>()

  async function format(code: string, language: string): Promise<string> {
    if (!code?.trim()) return code
    const key = `${language}\0${code}`
    if (cache.has(key)) return cache.get(key)!

    const model = monaco.editor.createModel(code, language)
    model.updateOptions({ tabSize: 2, insertSpaces: true })
    try {
      editor.setModel(model)
      // Wait for the lazy language service to register its formatting provider.
      const action = editor.getAction('editor.action.formatDocument')
      if (!initializedLanguages.has(language) && language !== 'sql') {
        const deadline = Date.now() + 10000
        while (action && !action.isSupported() && Date.now() < deadline) {
          await new Promise(resolve => setTimeout(resolve, 25))
        }
        if (!action?.isSupported()) throw new Error('Monaco formatting provider did not become available')
        initializedLanguages.add(language)
      }
      if (action?.isSupported()) await action.run()
      const formatted = model.getValue()
      cache.set(key, formatted)
      return formatted
    } catch (error) {
      console.warn(`Could not format ${language} code; preserving its original content.`, error)
      return code
    } finally {
      editor.setModel(null)
      model.dispose()
    }
  }

  const components = new Set<Component>([
    ...system.actualComponents,
    ...system.defaultComponents,
    ...[...system.tasks, ...system.defaultTasks].flatMap(task => [
      ...(task.errorComponents ?? []),
      ...(task.activity?.activityComponents ?? []),
    ]),
  ])

  try {
    for (const component of components) {
      component.html = await format(component.html, 'html')
      component.css = await format(component.css, 'css')
      component.js = await format(component.js, 'typescript')
      component.js_click = await format(component.js_click, 'typescript')
      for (const queries of [component.sql, component.sql_click]) {
        for (const name of Object.keys(queries ?? {})) {
          queries[name] = await format(queries[name]!, 'sql')
        }
      }
    }
  } finally {
    editor.dispose()
    container.remove()
  }
}
