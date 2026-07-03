/* eslint-disable @typescript-eslint/no-extraneous-class */
import JSZip from 'jszip'
import type { Database } from 'sql.js'
import type { InformationSystem } from '~/model/InformationSystem'
import { resetTaskProgressJson } from '~/utils/taskProgress'

type ExportablePage = {
  name: string
  route: string
  description?: string
  icon?: string
}

export class SystemZipExporter {
  public static async export(system: InformationSystem): Promise<Blob> {
    await system.database?.initializeDatabase()

    const zip = new JSZip()
    const config = SystemZipExporter.createConfig(system)

    zip.file('config.json', JSON.stringify(config, null, 2))

    const createSchemaSql = SystemZipExporter.createSchemaSql(system)
    if (createSchemaSql.trim()) {
      zip.file('create_schema.sql', createSchemaSql)
    }

    return zip.generateAsync({ type: 'blob' })
  }

  private static createSchemaSql(system: InformationSystem): string {
    if (system.database?.sqlJsDatabase) {
      const dumpedSql = SystemZipExporter.dumpDatabase(system.database.sqlJsDatabase)
      if (SystemZipExporter.hasSchemaContent(dumpedSql)) {
        return dumpedSql
      }
    }

    return system.createSchemaSql ?? ''
  }

  private static createConfig(system: InformationSystem) {
    const baseConfig = system.configData && typeof system.configData === 'object'
      ? JSON.parse(JSON.stringify(system.configData))
      : {}

    delete baseConfig.__manifestEntry
    delete baseConfig.__preloadedEntry
    delete baseConfig.score

    return {
      ...baseConfig,
      id: system.id,
      name: system.name,
      language: system.language,
      description: system.description,
      startedTasks: false,
      exploringSystem: false,
      databaseAllowed: system.databaseAllowed,
      pages: (system.pages ?? []).map(SystemZipExporter.serializePage),
      tasks: SystemZipExporter.toPlainJson(system.tasks ?? []).map(resetTaskProgressJson),
      mistakes: [],
      mistakesCount: 0,
      currentLevel: 1,
      levelCount: system.levelCount,
    }
  }

  private static serializePage(page: ExportablePage): ExportablePage {
    return {
      name: page.name,
      route: page.route,
      description: page.description,
      icon: page.icon,
    }
  }

  private static dumpDatabase(db: Database): string {
    const statements: string[] = [
      '-- ============================================================',
      '-- SCHEMA',
      '-- ============================================================',
      '',
    ]

    const schemaRows = SystemZipExporter.selectRows(db, `
      SELECT type, name, sql
      FROM sqlite_master
      WHERE sql IS NOT NULL
        AND type IN ('table', 'index', 'trigger', 'view')
        AND name NOT LIKE 'sqlite_%'
      ORDER BY CASE type
        WHEN 'table' THEN 0
        WHEN 'index' THEN 1
        WHEN 'trigger' THEN 2
        WHEN 'view' THEN 3
        ELSE 4
      END, name
    `)

    const tableNames: string[] = []
    for (const row of schemaRows) {
      if (row.type === 'table') {
        tableNames.push(String(row.name))
      }
      statements.push(`${String(row.sql).trim().replace(/;+\s*$/, '')};`)
    }

    statements.push('', '-- ============================================================', '-- DATA', '-- ============================================================', '')

    for (const tableName of tableNames) {
      const rows = SystemZipExporter.selectRows(db, `SELECT * FROM ${SystemZipExporter.quoteIdentifier(tableName)}`)
      if (rows.length === 0) {
        continue
      }

      const columns = Object.keys(rows[0])
      const columnSql = columns.map(SystemZipExporter.quoteIdentifier).join(', ')
      const valuesSql = rows
        .map(row => `(${columns.map(column => SystemZipExporter.sqlValue(row[column])).join(', ')})`)
        .join(',\n')

      statements.push(`INSERT INTO ${SystemZipExporter.quoteIdentifier(tableName)} (${columnSql}) VALUES`)
      statements.push(`${valuesSql};`, '')
    }

    return `${statements.join('\n').trim()}\n`
  }

  private static hasSchemaContent(sql: string): boolean {
    return /\bCREATE\s+(TABLE|INDEX|TRIGGER|VIEW)\b/i.test(sql)
      || /\bINSERT\s+INTO\b/i.test(sql)
  }

  private static selectRows(db: Database, sql: string): Record<string, unknown>[] {
    const result = db.exec(sql)
    if (!result.length) {
      return []
    }

    const { columns, values } = result[0]
    if (!Array.isArray(columns) || !Array.isArray(values)) {
      return []
    }

    return values.map(row => Object.fromEntries(columns.map((column, index) => [column, row[index]])))
  }

  private static quoteIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`
  }

  private static sqlValue(value: unknown): string {
    if (value === null || value === undefined) {
      return 'NULL'
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? String(value) : 'NULL'
    }

    if (value instanceof Uint8Array) {
      return `X'${Array.from(value, byte => byte.toString(16).padStart(2, '0')).join('')}'`
    }

    return `'${String(value).replace(/'/g, "''")}'`
  }

  private static toPlainJson<T>(value: T): T {
    return JSON.parse(JSON.stringify(value))
  }
}
