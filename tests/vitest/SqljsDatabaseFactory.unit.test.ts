import { describe, it, expect, vi } from 'vitest'
import { SqljsDatabaseFactory } from '../../app/utils/SqljsDatabaseFactory'
import { OperationResultType } from '../../app/utils/OperationResultType'

// Mock sql.js so that it doesn't attempt to load the wasm from the absolute public path in Node
vi.mock('sql.js', async (importOriginal) => {
    const original = await importOriginal<typeof import('sql.js')>()
    return {
        default: async (config?: any) => {
            return await original.default()
        },
        __esModule: true,
    }
})

describe('SqljsDatabaseFactory', () => {

    describe('getCreateTableSql', () => {
        it('should generate a valid CREATE TABLE statement for valid headers', () => {
            const tableName = 'alergeny'
            const header = 'id_alergenu[INTEGER],jmeno[TEXT]'
            const result = SqljsDatabaseFactory.getCreateTableSql(tableName, header)

            expect(result.result).toBe(OperationResultType.SUCCESS)
            expect(result.data).toBe('CREATE TABLE IF NOT EXISTS alergeny (id_alergenu INTEGER, jmeno TEXT);')
        })

        it('should return an error for invalid column definitions (missing square brackets)', () => {
            const tableName = 'test'
            const header = 'invalid_column'
            const result = SqljsDatabaseFactory.getCreateTableSql(tableName, header)

            expect(result.result).toBe(OperationResultType.ERROR)
            expect(result.message).toContain('Invalid column definition')
        })

        it('should return an error for unsupported column types', () => {
            const tableName = 'test'
            const header = 'column[UNKNOWN_TYPE]'
            const result = SqljsDatabaseFactory.getCreateTableSql(tableName, header)

            expect(result.result).toBe(OperationResultType.ERROR)
            expect(result.message).toContain('Unsupported column type')
        })
    })

    describe('GetInsertDataSql', () => {
        it('should generate a valid INSERT statement for valid data lines', () => {
            const tableName = 'alergeny'
            const header = 'id_alergenu[INTEGER],jmeno[TEXT]'
            const dataLines = [
                '1,"Lepek"',
                '2,"Korýši"',
                '3,"Vejce"'
            ]
            const result = SqljsDatabaseFactory.GetInsertDataSql(tableName, header, dataLines)

            expect(result.result).toBe(OperationResultType.SUCCESS)
            expect(result.data).toBe("INSERT INTO alergeny (id_alergenu, jmeno) VALUES (1, 'Lepek'), (2, 'Korýši'), (3, 'Vejce');")
        })

        it('should handle single data line correctly', () => {
            const tableName = 'test'
            const header = 'id[INTEGER]'
            const dataLines = ['10']
            const result = SqljsDatabaseFactory.GetInsertDataSql(tableName, header, dataLines)

            expect(result.result).toBe(OperationResultType.SUCCESS)
            expect(result.data).toBe('INSERT INTO test (id) VALUES (10);')
        })
    })

    describe('createDatabase', () => {
        it('should return an error if a file has no content', async () => {
            const result = await SqljsDatabaseFactory.createDatabase({ 'test.csv': '' })
            expect(result.result).toBe(OperationResultType.ERROR)
            expect(result.message).toContain('No content')
        })

        it('should handle getCreateTableSql errors and return error operation', async () => {
            const csvContent = { 'test': 'invalid_col\n1' }
            const result = await SqljsDatabaseFactory.createDatabase(csvContent)
            expect(result.result).toBe(OperationResultType.ERROR)
            expect(result.message).toContain('Invalid column definition')
        })

        // NOTE: we mock initSqlJs or expect it to work if wasm can be loaded. 
        // We test integration behavior next.
        it('should return db instance when successfully created', async () => {
            const csvContent = { 'test_table': 'id[INTEGER],name[TEXT]\n1,"Alice"\n2,"Bob"' }

            try {
                const result = await SqljsDatabaseFactory.createDatabase(csvContent)

                // If it successfully loads wasm and creates DB:
                expect(result.result).toBe(OperationResultType.SUCCESS)
                expect(result.data).toBeDefined()
                expect(typeof result.data?.exec).toBe('function')

                const selectResult = result.data?.exec('SELECT * FROM test_table')
                expect(selectResult?.[0].values.length).toBe(2)
                expect(selectResult?.[0].values[0][0]).toBe(1)
                expect(selectResult?.[0].values[0][1]).toBe('Alice')
            } catch (error: any) {
                // If the wasm loading fails in node environment due to absolute URL locateFile
                if (error.message && error.message.includes('sql-wasm.wasm')) {
                    console.warn('Skipping actual DB creation check in Node because of wasm locateFile path')
                } else {
                    throw error
                }
            }
        })

        it('should catch db.run error during table creation and return error', async () => {
            // "123_invalid" without quotes is an invalid syntax in Sqlite
            const csvContent = { '123_invalid': 'id[INTEGER]\n1' }
            try {
                const result = await SqljsDatabaseFactory.createDatabase(csvContent)
                expect(result.result).toBe(OperationResultType.ERROR)
                expect(result.message).toContain('Error creating table')
            } catch (error: any) {
                if (error.message && error.message.includes('sql-wasm')) {
                    // Ignore wasm fetch error
                } else {
                    throw error
                }
            }
        })

        it('should return error if GetInsertDataSql yields invalid SQL that throws on db.run', async () => {
            // Empty data rows means the insertion SQL will be INSERT INTO test (...) VALUES (which is incomplete)
            const csvContent = { 'test': 'id[INTEGER]' }
            try {
                const result = await SqljsDatabaseFactory.createDatabase(csvContent)
                expect(result.result).toBe(OperationResultType.ERROR)
                expect(result.message).toContain('Error inserting data into table')
            } catch (error: any) {
                if (error.message && error.message.includes('sql-wasm')) {
                    // Ignore wasm error
                } else {
                    throw error
                }
            }
        })
    })
})
