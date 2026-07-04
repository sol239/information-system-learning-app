import type { Component } from '~/model/Component'
import { useSystemsStore } from '~/stores/systemsStore'
import {
  codeEditEnvironmentFromRuntimeConfig,
  type CodeEditPermissionKey
} from '~/utils/codeEditPermissions'

type RecordCodePermissionKey = 'sql' | 'sql_click'
type TextCodePermissionKey = Exclude<CodeEditPermissionKey, RecordCodePermissionKey>

const COMPONENT_CODE_UPDATED_EVENT = 'component-code-updated'

export class ComponentHelper {
  public getComponentCodeHTML(componentId: string) {
    return this.getTextCode(componentId, 'html')
  }

  public appendCodeToComponentHTML(componentId: string, code: string) {
    return this.appendTextCode(componentId, 'html', code)
  }

  public setComponentCodeHTML(componentId: string, code: string) {
    return this.setTextCode(componentId, 'html', code)
  }

  public getComponentCodeCSS(componentId: string) {
    return this.getTextCode(componentId, 'css')
  }

  public appendCodeToComponentCSS(componentId: string, code: string) {
    return this.appendTextCode(componentId, 'css', code)
  }

  public setComponentCodeCSS(componentId: string, code: string) {
    return this.setTextCode(componentId, 'css', code)
  }

  public getComponentCodeJS(componentId: string) {
    return this.getTextCode(componentId, 'js')
  }

  public appendCodeToComponentJS(componentId: string, code: string) {
    return this.appendTextCode(componentId, 'js', code)
  }

  public setComponentCodeJS(componentId: string, code: string) {
    return this.setTextCode(componentId, 'js', code)
  }

  public getComponentCodeJSClick(componentId: string) {
    return this.getTextCode(componentId, 'js_click')
  }

  public appendCodeToComponentJSClick(componentId: string, code: string) {
    return this.appendTextCode(componentId, 'js_click', code)
  }

  public setComponentCodeJSClick(componentId: string, code: string) {
    return this.setTextCode(componentId, 'js_click', code)
  }

  public getComponentCodeSQL(componentId: string, queryName: string) {
    return this.getRecordCode(componentId, 'sql', queryName)
  }

  public getComponentCodeSQLRecord(componentId: string) {
    return this.getRecord(componentId, 'sql')
  }

  public appendCodeToComponentSQL(componentId: string, queryName: string, code: string) {
    return this.appendRecordCode(componentId, 'sql', queryName, code)
  }

  public setComponentCodeSQL(componentId: string, queryName: string, code: string) {
    return this.setRecordCode(componentId, 'sql', queryName, code)
  }

  public getComponentCodeSQLClick(componentId: string, queryName: string) {
    return this.getRecordCode(componentId, 'sql_click', queryName)
  }

  public getComponentCodeSQLClickRecord(componentId: string) {
    return this.getRecord(componentId, 'sql_click')
  }

  public appendCodeToComponentSQLClick(componentId: string, queryName: string, code: string) {
    return this.appendRecordCode(componentId, 'sql_click', queryName, code)
  }

  public setComponentCodeSQLClick(componentId: string, queryName: string, code: string) {
    return this.setRecordCode(componentId, 'sql_click', queryName, code)
  }

  private getTextCode(componentId: string, key: TextCodePermissionKey): string {
    const component = this.getEditableComponent(componentId, key)
    return String(component[key] ?? '')
  }

  private async appendTextCode(componentId: string, key: TextCodePermissionKey, code: string): Promise<Component> {
    const component = this.getEditableComponent(componentId, key)
    const currentCode = String(component[key] ?? '')
    component[key] = this.joinCode(currentCode, code)
    return this.persist(component)
  }

  private async setTextCode(componentId: string, key: TextCodePermissionKey, code: string): Promise<Component> {
    const component = this.getEditableComponent(componentId, key)
    component[key] = code
    return this.persist(component)
  }

  private getRecordCode(componentId: string, key: RecordCodePermissionKey, queryName: string): string {
    const component = this.getEditableComponent(componentId, key)
    const normalizedQueryName = this.normalizeQueryName(queryName)
    return this.ensureRecord(component, key)[normalizedQueryName] ?? ''
  }

  private getRecord(componentId: string, key: RecordCodePermissionKey): Record<string, string> {
    const component = this.getEditableComponent(componentId, key)
    return { ...this.ensureRecord(component, key) }
  }

  private async appendRecordCode(
    componentId: string,
    key: RecordCodePermissionKey,
    queryName: string,
    code: string
  ): Promise<Component> {
    const component = this.getEditableComponent(componentId, key)
    const normalizedQueryName = this.normalizeQueryName(queryName)
    const record = this.ensureRecord(component, key)
    record[normalizedQueryName] = this.joinCode(record[normalizedQueryName] ?? '', code)
    return this.persist(component)
  }

  private async setRecordCode(
    componentId: string,
    key: RecordCodePermissionKey,
    queryName: string,
    code: string
  ): Promise<Component> {
    const component = this.getEditableComponent(componentId, key)
    const normalizedQueryName = this.normalizeQueryName(queryName)
    this.ensureRecord(component, key)[normalizedQueryName] = code
    return this.persist(component)
  }

  private getEditableComponent(componentId: string, permissionKey: CodeEditPermissionKey): Component {
    this.assertTeacherMode()
    this.assertCodeEditAvailable(permissionKey)

    const normalizedComponentId = String(componentId).trim()
    if (!normalizedComponentId) {
      throw new Error('Component id is required.')
    }

    const component = useSystemsStore().getComponentById(normalizedComponentId)
    if (!component || String(component.id) !== normalizedComponentId) {
      throw new Error(`Component "${normalizedComponentId}" was not found in the selected system.`)
    }

    return component
  }

  private assertTeacherMode() {
    const appMode = String(useRuntimeConfig().public.appMode ?? '').trim().toLowerCase()
    if (appMode !== 'teacher') {
      throw new Error('Component code editing is available only when appMode is "teacher".')
    }
  }

  private assertCodeEditAvailable(permissionKey: CodeEditPermissionKey) {
    const environment = codeEditEnvironmentFromRuntimeConfig(useRuntimeConfig().public as Record<string, unknown>)
    if (!environment[permissionKey]) {
      throw new Error(`Component code editing for "${permissionKey}" is disabled in runtime config.`)
    }
  }

  private ensureRecord(component: Component, key: RecordCodePermissionKey): Record<string, string> {
    component[key] = component[key] ?? {}
    return component[key]
  }

  private normalizeQueryName(queryName: string): string {
    const normalizedQueryName = String(queryName).trim()
    if (!normalizedQueryName) {
      throw new Error('Query name is required.')
    }

    return normalizedQueryName
  }

  private joinCode(currentCode: string, codeToAppend: string): string {
    if (!currentCode) {
      return codeToAppend
    }

    if (!codeToAppend) {
      return currentCode
    }

    return `${currentCode}\n${codeToAppend}`
  }

  private async persist(component: Component): Promise<Component> {
    component.edited = true

    const systemsStore = useSystemsStore()
    if (systemsStore.selectedSystem) {
      await systemsStore.updateSystem(systemsStore.selectedSystem)
    }

    if (import.meta.client) {
      window.dispatchEvent(new CustomEvent(COMPONENT_CODE_UPDATED_EVENT, {
        detail: { componentId: component.id }
      }))
    }

    return component
  }
}
