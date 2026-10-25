import { describe, it, expect } from 'vitest'
import { SqlHandler } from '../../app/core/SqlHandler'
import { TableMap } from '../../app/core/TableMap'
import { ColumnType } from '../../app/utils/ColumnType'
import type { ColumnDefinition } from '../../app/utils/ColumnDefinition'

const mockTableMap: Record<string, ColumnDefinition[]> = {
    users: [
        { columnName: 'id', columnType: ColumnType.INTEGER },
        { columnName: 'name', columnType: ColumnType.TEXT },
        { columnName: 'email', columnType: ColumnType.TEXT },
        { columnName: 'first_name', columnType: ColumnType.TEXT },
        { columnName: 'last_name', columnType: ColumnType.TEXT }
    ],
    orders: [
        { columnName: 'total', columnType: ColumnType.REAL },
        { columnName: 'user_id', columnType: ColumnType.INTEGER }
    ],
    meals: [
        { columnName: 'name', columnType: ColumnType.TEXT }
    ],
    t: [
        { columnName: 'a', columnType: ColumnType.TEXT },
        { columnName: 'b', columnType: ColumnType.TEXT },
        { columnName: 'name', columnType: ColumnType.TEXT }
    ]
}

// Helper to simulate the result returned by sql.js
const mockResult = (columns: string[]) => {
    if (columns.length === 0) return []
    return [{ columns, values: [] }]
}

describe('SqlHandler.GetSqlVariableNames', () => {

    // ---------- edge / guard cases ----------
    describe('empty / invalid input', () => {
        it('returns [] for empty string', () => {
            expect(SqlHandler.GetSqlVariableNames('', mockTableMap, mockResult([]))).toEqual([])
        })

        it('returns [] for string with no SELECT ... FROM', () => {
            expect(SqlHandler.GetSqlVariableNames('UPDATE table SET col = 1', mockTableMap, mockResult([]))).toEqual([])
        })

        it('returns [] when SELECT has no FROM or results are missing', () => {
            expect(SqlHandler.GetSqlVariableNames('SELECT id, name', mockTableMap, [])).toEqual([])
        })
    })

    // ---------- simple column names ----------
    describe('simple columns', () => {
        it('returns mapped column for single column without AS', () => {
            const sql = 'SELECT id FROM users'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['id']))
            expect(result).toEqual([
                new TableMap('users', 'id', 'id', ColumnType.INTEGER)
            ])
        })

        it('returns mapped columns for multiple columns without AS', () => {
            const sql = 'SELECT id, name, email FROM users'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['id', 'name', 'email']))
            expect(result).toEqual([
                new TableMap('users', 'id', 'id', ColumnType.INTEGER),
                new TableMap('users', 'name', 'name', ColumnType.TEXT),
                new TableMap('users', 'email', 'email', ColumnType.TEXT)
            ])
        })

        it('returns mapped columns even with whitespace', () => {
            const sql = 'SELECT  id ,  name  FROM users'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['id', 'name']))
            expect(result).toEqual([
                new TableMap('users', 'id', 'id', ColumnType.INTEGER),
                new TableMap('users', 'name', 'name', ColumnType.TEXT)
            ])
        })
    })

    // ---------- table-qualified columns (table.column) ----------
    describe('table-qualified columns', () => {
        it('returns mapped column for qualified column without AS', () => {
            const sql = 'SELECT u.id FROM users u'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['id']))
            expect(result).toEqual([
                new TableMap('users', 'id', 'id', ColumnType.INTEGER)
            ])
        })

        it('returns mapped columns for multiple qualified columns without AS', () => {
            const sql = 'SELECT u.id, u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['id', 'name', 'total']))
            expect(result).toEqual([
                new TableMap('users', 'id', 'id', ColumnType.INTEGER),
                new TableMap('users', 'name', 'name', ColumnType.TEXT),
                new TableMap('orders', 'total', 'total', ColumnType.REAL)
            ])
        })
    })

    // ---------- AS aliases ----------
    describe('AS aliases', () => {
        it('returns alias mapping when AS is used', () => {
            const sql = 'SELECT id AS userId FROM users'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['userId']))
            expect(result).toEqual([
                new TableMap('users', 'id', 'userId', ColumnType.INTEGER)
            ])
        })

        it('returns alias mapping for double-quoted alias', () => {
            // Note: sql.js typically returns the alias without quotes in the columns array
            const sql = 'SELECT id AS "userId" FROM users'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['userId']))
            expect(result).toEqual([
                new TableMap('users', 'id', 'userId', ColumnType.INTEGER)
            ])
        })

        it('returns alias mapping for single-quoted alias', () => {
            const sql = "SELECT id AS 'userId' FROM users"
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['userId']))
            expect(result).toEqual([
                new TableMap('users', 'id', 'userId', ColumnType.INTEGER)
            ])
        })

        it('returns alias and handles table prefix', () => {
            const sql = 'SELECT u.id AS userId FROM users u'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['userId']))
            // Matches: new TableMap(tableName, afterDotPart, name, columnType, beforeDotPart)
            expect(result).toEqual([
                new TableMap('users', 'id', 'userId', ColumnType.INTEGER, 'u')
            ])
        })

        it('handles mixed aliased and non-aliased columns', () => {
            const sql = 'SELECT id AS userId, name FROM users'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['userId', 'name']))
            expect(result).toEqual([
                new TableMap('users', 'id', 'userId', ColumnType.INTEGER),
                new TableMap('users', 'name', 'name', ColumnType.TEXT)
            ])
        })
    })

    // ---------- COUNT(*) aggregates ----------
    describe('COUNT(*) aggregates', () => {
        it('returns fallback mapping for COUNT(*) AS', () => {
            const sql = 'SELECT COUNT(*) AS meal_count FROM meals'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['meal_count']))
            expect(result).toEqual([
                new TableMap(null, null, 'meal_count', ColumnType.REAL)
            ])
        })

        it('returns fallback mapping for COUNT(*) without alias', () => {
            const sql = 'SELECT COUNT(*) FROM meals'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['COUNT(*)']))
            expect(result).toEqual([
                new TableMap(null, null, 'COUNT(*)', ColumnType.REAL)
            ])
        })

        it('returns mixed fallback and mapped columns', () => {
            const sql = 'SELECT name, COUNT(*) AS total FROM meals'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['name', 'total']))
            expect(result).toEqual([
                new TableMap('meals', 'name', 'name', ColumnType.TEXT),
                new TableMap(null, null, 'total', ColumnType.REAL)
            ])
        })
    })

    // ---------- function calls (commas inside parentheses) ----------
    describe('function calls with inner commas', () => {
        it('returns fallback mapping for function call without alias', () => {
            const sql = 'SELECT COALESCE(a, b) FROM t'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['COALESCE(a, b)']))
            expect(result).toEqual([
                new TableMap(null, null, 'COALESCE(a, b)', ColumnType.REAL)
            ])
        })

        it('returns fallback mapping for function expression with alias', () => {
            const sql = 'SELECT COALESCE(a, b) AS val FROM t'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['val']))
            expect(result).toEqual([
                new TableMap(null, null, 'val', ColumnType.REAL)
            ])
        })

        it('returns mapped and fallback columns when mixed with function', () => {
            const sql = 'SELECT a, COALESCE(first_name, last_name) AS full_name FROM t' // Using 't' since it has 'a'
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['a', 'full_name']))
            expect(result).toEqual([
                new TableMap('t', 'a', 'a', ColumnType.TEXT),
                new TableMap(null, null, 'full_name', ColumnType.REAL)
            ])
        })
    })

    // ---------- SELECT * ----------
    describe('SELECT *', () => {
        it('returns all mapped columns for SELECT *', () => {
            const sql = 'SELECT * FROM meals'
            // sql.js evaluates '*' into actual columns
            const result = SqlHandler.GetSqlVariableNames(sql, mockTableMap, mockResult(['name']))
            expect(result).toEqual([
                new TableMap('meals', 'name', 'name', ColumnType.TEXT)
            ])
        })
    })
})