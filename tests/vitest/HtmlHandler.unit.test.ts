import { describe, expect, it } from 'vitest'
import { HtmlHandler } from '../../app/core/HtmlHandler'
import { ComponentVariables, Variable } from '../../app/model/ComponentVariables'

function variables(...items: Array<[string, unknown]>) {
    const result = new ComponentVariables()
    result.generalVariables = items.map(([name, value]) => new Variable(name, value as any))
    return result
}

describe('HtmlHandler.ReplaceHtmlForVariables', () => {
    it('replaces only explicit mustache placeholders in html', () => {
        const html = '<div class="pocet-dni-turnusu-stitek">Počet dní: {{ pocet }}</div>'

        expect(HtmlHandler.ReplaceHtmlForVariables(variables(['pocet', 13]), html)).toBe(
            '<div class="pocet-dni-turnusu-stitek">Počet dní: 13</div>'
        )
    })

    it('does not replace bare variable names in classes or text', () => {
        const html = '<div class="pocet-dni-turnusu-stitek">Počet dní: pocet</div>'

        expect(HtmlHandler.ReplaceHtmlForVariables(variables(['pocet', 13]), html)).toBe(html)
    })
})
