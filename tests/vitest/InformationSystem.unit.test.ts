import { describe, it, expect } from 'vitest'
import { InformationSystem } from '../../app/model/InformationSystem'

const VALID_CONFIG = `{
    "id": 2,
    "directory": "information_system_2",
    "name": "Školní tábor Pálava",
    "language": "cs",
    "description": "Školní tábor v Pálavě, zaměřený na výuku a zábavu pro děti.",
    "tasks": [
        {
            "id": 1,
            "title": "Ukázkový úkol č. 1",
            "description": "Zkontrolujte, zda se v nástěnce správně zobrazují jídla a účastníci. Pokud najdete nějakou chybu, tak chybu opravte.",
            "status": "pending",
            "kind": "repair",
            "answer": "stats-participants-sql == SELECT COUNT(*) as count FROM účastníci && stats-meals-sql == SELECT COUNT(*) as count FROM jídla",
            "elementClass": [],
            "level": 1,
            "is_editable": false,
            "error-components": [
                {
                    "id": "stats-participants",
                    "variables": { "html": "", "sql": "SELECT COUNT(*) as count FROM vedoucí", "js": "" },
                    "error-component-name": ""
                },
                {
                    "id": "stats-meals",
                    "variables": { "html": "", "sql": "SELECT COUNT(*) as count FROM turnusy", "js": "" },
                    "error-component-name": ""
                }
            ],
            "feedback": "Správně jsi opravil/a SQL dotazy dvou komponent."
        },
        {
            "id": 2,
            "title": "Ukázkový úkol č. 2",
            "description": "Zkontrolujte, zda se v nástěnce správně zobrazují statistiky o počtu jídel.",
            "status": "pending",
            "kind": "select",
            "answer": "none",
            "elementClass": ["stats-supervisors"],
            "level": 1,
            "is_editable": false,
            "error-components": [
                {
                    "id": "stats-supervisors",
                    "variables": { "html": "", "sql": "SELECT COUNT(*) as count FROM jídla", "js": "" },
                    "error-component-name": ""
                }
            ],
            "feedback": "Správně jsi zvolil/a komponentu, která zobrazovala chybně počet vedoucích."
        },
        {
            "id": 3,
            "title": "Ukázkový úkol č. 3",
            "description": "Upravte účastníka: Tereza Nováková, tak aby měla i třetí jméno Svobodová.",
            "status": "pending",
            "kind": "repair",
            "answer": "tbl-účastníci == name:Tereza Svobodová Nováková",
            "elementClass": ["table-form-účastníci-alergeny"],
            "is_editable": false,
            "level": 1,
            "error-components": [
                {
                    "id": "validation-name",
                    "variables": {
                        "isValidName": "const isValidName = (name) => {\\n    if (!name || name.trim().length === 0) return false;\\n    return name.trim().split(' ').length == 2;\\n}"
                    },
                    "error-component-name": ""
                }
            ],
            "feedback": "Správně jsi opravil/a JS kód."
        },
        {
            "id": 4,
            "title": "Ukázkový úkol č. 4 - Není hotový!!",
            "description": "Přidejte vedoucímu Petr Novotný alergeny Lepek a Korýši.",
            "status": "pending",
            "kind": "select",
            "answer": "tbl-účastníci == jméno:Petr Novotný;alergeny:Lepek,Koryši",
            "elementClass": "stats-supervisors",
            "is_editable": false,
            "level": 1111111,
            "error-components": [
                {
                    "id": "supervisors-edit-allergens",
                    "variables": { "html": "", "sql": "SELECT COUNT(*) as count FROM alergeny", "js": "" },
                    "error-component-name": ""
                }
            ],
            "feedback": "Správně jsi odpověděl, že komponenta využívala špatný SQL dotaz."
        }
    ]
}`

describe('InformationSystem.fromConfig', () => {
    describe('valid config', () => {
        it('should map id from config', () => {
            const system = InformationSystem.fromConfig(VALID_CONFIG)
            expect(system.id).toBe('2')
        })

        it('should map name from config', () => {
            const system = InformationSystem.fromConfig(VALID_CONFIG)
            expect(system.name).toBe('Školní tábor Pálava')
        })

        it('should map language from config', () => {
            const system = InformationSystem.fromConfig(VALID_CONFIG)
            expect(system.language).toBe('cs')
        })

        it('should map description from config', () => {
            const system = InformationSystem.fromConfig(VALID_CONFIG)
            expect(system.description).toBe('Školní tábor v Pálavě, zaměřený na výuku a zábavu pro děti.')
        })

        it('should default tasks to an empty array (tasks mapping is commented out)', () => {
            const system = InformationSystem.fromConfig(VALID_CONFIG)
            expect(system.tasks).toEqual([])
        })

        it('should default actualComponents to an empty array', () => {
            const system = InformationSystem.fromConfig(VALID_CONFIG)
            expect(system.actualComponents).toEqual([])
        })

        it('should return an instance of InformationSystem', () => {
            const system = InformationSystem.fromConfig(VALID_CONFIG)
            expect(system).toBeInstanceOf(InformationSystem)
        })

        it('should ignore extra fields not used by the constructor (e.g. directory)', () => {
            const system = InformationSystem.fromConfig(VALID_CONFIG)
            expect((system as any).directory).toBeUndefined()
        })
    })

    describe('edge cases', () => {
        it('should throw on invalid JSON', () => {
            expect(() => InformationSystem.fromConfig('not valid json')).toThrow(SyntaxError)
        })

        it('should produce undefined fields when required keys are missing', () => {
            const minimal = JSON.stringify({ id: 99 })
            const system = InformationSystem.fromConfig(minimal)
            expect(system.id).toBe('99')
            expect(system.name).toBeUndefined()
            expect(system.language).toBeUndefined()
            expect(system.description).toBeUndefined()
        })

        it('should handle empty tasks array in config and still default to []', () => {
            const config = JSON.stringify({ id: 1, name: 'Test', language: 'en', description: 'Desc', tasks: [] })
            const system = InformationSystem.fromConfig(config)
            expect(system.tasks).toEqual([])
        })
    })
})
